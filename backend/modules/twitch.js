// modules/twitch.js — exakt an dein funktionierendes Muster angelehnt, in Modul-Form
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const WebSocket = require('ws');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const configHelper = require('./helpers/helper_config');
const database = require('../core/database');

const sharedApi = {
  resolveUserByLogin: null,
  getStoredBotToken: null,
  getBotAccessTokenWithRefresh: null,
  validateStoredUserToken: null,
  createClipForBroadcaster: null,
  getClipById: null
};

const DEFAULT_TWITCH_ALERT_CONFIG = {
  enabled: true,
  enqueueUrl: 'http://127.0.0.1:8080/api/alerts/twitch',
  includeRawEvent: true,
  minBits: 1,
  minRaidViewers: 1,
  typeMap: {
    follow: 'follow',
    bits: 'bits',
    raid: 'raid',
    sub: 'sub',
    resub: 'resub',
    giftedSubReceived: 'gifted_sub_received',
    giftSub: 'gift_sub',
    giftBomb: 'gift_bomb',
    channelPoints: 'channel_points'
  },
  forward: {
    follow: true,
    bits: true,
    raid: true,
    sub: true,
    resub: true,
    giftedSubReceived: false,
    giftSub: true,
    giftBomb: true,
    channelPoints: false
  },
  ignoredRewardTitles: [],
  subMessageBuffer: {
    enabled: true,
    delayMs: 30000
  },
  loyaltyForward: {
    enabled: true,
    url: 'http://127.0.0.1:8080/api/loyalty/events/ingest',
    includeRawEvent: true
  }
};

const twitchAlertBridgeState = {
  loadedAt: new Date().toISOString(),
  configPath: '',
  settingsKey: 'provider_twitch_eventsub',
  settingsSource: 'default',
  config: { ...DEFAULT_TWITCH_ALERT_CONFIG },
  forwarded: 0,
  skipped: 0,
  failed: 0,
  lastForwardedAt: null,
  lastError: '',
  recent: []
};

module.exports.init = function init(ctx) {
  const { app, env } = ctx;

  // --------------------- Twitch OAuth + Helix ---------------------
  const TW_CLIENT_ID = env.TWITCH_CLIENT_ID || '';
  const TW_CLIENT_SECRET = env.TWITCH_CLIENT_SECRET || '';
  const TW_REDIRECT_URI = env.TWITCH_REDIRECT_URI || 'http://localhost:8080/auth/callback';
  const TW_OAUTH_SCOPES = (env.TWITCH_OAUTH_SCOPES ||
    'channel:read:subscriptions moderator:read:followers channel:read:vips channel:read:hype_train channel:read:goals moderator:read:chat_settings moderator:read:chatters user:read:email clips:edit')
    .split(/\s+/).filter(Boolean);


  const TW_BOT_CLIENT_ID = env.TWITCH_BOT_CLIENT_ID || '';
  const TW_BOT_CLIENT_SECRET = env.TWITCH_BOT_CLIENT_SECRET || '';
  const TW_BOT_REDIRECT_URI = env.TWITCH_BOT_REDIRECT_URI || 'http://localhost:8080/auth/bot/callback';
  const TW_BOT_USERNAME = (env.TWITCH_BOT_USERNAME || '').toString().trim().toLowerCase();
  const TW_BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL || '').toString().trim().toLowerCase();
  const TW_BOT_OAUTH_SCOPES = (env.TWITCH_BOT_OAUTH_SCOPES || 'chat:read chat:edit')
    .split(/\s+/).filter(Boolean);

  // Store-Pfad wie im Original, aber Root sauber über den zentralen Config-Helper ermitteln.
  const baseRoot = configHelper.getRootDir();
  const configDir = configHelper.getConfigDir();
  let defaultStorePath = path.join(baseRoot, 'tokens', 'twitch_user.json');
  if (env.TWITCH_TOKEN_STORE) {
    defaultStorePath = path.isAbsolute(env.TWITCH_TOKEN_STORE)
      ? env.TWITCH_TOKEN_STORE
      : path.join(baseRoot, env.TWITCH_TOKEN_STORE);
  }
  const TOKEN_STORE = defaultStorePath;

  let defaultBotStorePath = path.join(baseRoot, 'tokens', 'twitch_bot_user.json');
  if (env.TWITCH_BOT_TOKEN_STORE) {
    defaultBotStorePath = path.isAbsolute(env.TWITCH_BOT_TOKEN_STORE)
      ? env.TWITCH_BOT_TOKEN_STORE
      : path.join(baseRoot, env.TWITCH_BOT_TOKEN_STORE);
  }
  const BOT_TOKEN_STORE = defaultBotStorePath;
  // Default Broadcaster-ID (numerische Twitch User-ID). Empfehlung: in env setzen.
  const DEFAULT_BROADCASTER_ID = (env.TWITCH_BROADCASTER_ID || '').toString().trim();

  // Cache-Ordner für Hype-Train-Cooldown (pro Broadcaster-ID als JSON)
  const HT_CACHE_DIR = env.TWITCH_HYPETRAIN_CACHE_DIR
    ? (path.isAbsolute(env.TWITCH_HYPETRAIN_CACHE_DIR) ? env.TWITCH_HYPETRAIN_CACHE_DIR : path.join(baseRoot, env.TWITCH_HYPETRAIN_CACHE_DIR))
    : path.join(baseRoot, 'tokens');

  // STEP96B: Provider-Settings liegen primär in SQLite alert_settings.
  // Die JSON-Datei bleibt nur als Migration/Fallback und liegt zentral unter D:\Streaming\stramAssets\config.
  const TWITCH_ALERT_CONFIG_PATH = env.TWITCH_ALERT_CONFIG
    ? (path.isAbsolute(env.TWITCH_ALERT_CONFIG) ? env.TWITCH_ALERT_CONFIG : path.join(baseRoot, env.TWITCH_ALERT_CONFIG))
    : path.join(configDir, 'twitch_alerts.json');
  const TWITCH_ALERT_LEGACY_CONFIG_PATH = path.join(baseRoot, 'backend', 'config', 'twitch_alerts.json');
  twitchAlertBridgeState.configPath = TWITCH_ALERT_CONFIG_PATH;

  function cacheFileFor(broadcasterId) {
    return path.join(HT_CACHE_DIR, `hypetrain_${broadcasterId}.json`);
  }

  function eventCacheFileFor(name) {
    return path.join(HT_CACHE_DIR, `eventsub_${name}.json`);
  }

  function writeEventCache(name, payload) {
    const file = eventCacheFileFor(name);
    writeJSON(file, {
      ok: true,
      type: name,
      updated_at: core.nowIso(),
      payload
    });
  }

  function readEventCache(name) {
    return readJSON(eventCacheFileFor(name), null);
  }


  function ensureDir(filePath){try{core.ensureParentDir(filePath);return true;}catch(e){console.warn('[OAUTH] ensureDir error:',e?.message||e);return false;}}
  function mergePlainObject(base, extra) {
    const out = { ...(base || {}) };
    if (!extra || typeof extra !== 'object') return out;
    for (const [key, value] of Object.entries(extra)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && base && typeof base[key] === 'object' && !Array.isArray(base[key])) {
        out[key] = mergePlainObject(base[key], value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  function ensureTwitchAlertSettingsTable() {
    try {
      database.ensureReady(ctx);
      database.exec(`
        CREATE TABLE IF NOT EXISTS alert_settings (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      return true;
    } catch (e) {
      twitchAlertBridgeState.lastError = `[db_ready] ${e?.message || String(e)}`;
      return false;
    }
  }

  function getTwitchAlertSettingsFromDb() {
    try {
      if (!ensureTwitchAlertSettingsTable()) return null;
      const row = database.get(`SELECT value_json FROM alert_settings WHERE key=:key`, { key: twitchAlertBridgeState.settingsKey });
      if (!row || !row.value_json) return null;
      return JSON.parse(row.value_json);
    } catch (e) {
      twitchAlertBridgeState.lastError = `[db_read] ${e?.message || String(e)}`;
      return null;
    }
  }

  function saveTwitchAlertSettingsToDb(value) {
    if (!ensureTwitchAlertSettingsTable()) return false;
    const now = core.nowIso();
    database.upsert(
      'alert_settings',
      {
        key: twitchAlertBridgeState.settingsKey,
        value_json: JSON.stringify(value || {}),
        updated_at: now
      },
      ['key'],
      ['value_json', 'updated_at']
    );
    return true;
  }

  function readTwitchAlertFileFallback() {
    const central = readJSON(TWITCH_ALERT_CONFIG_PATH, null);
    if (central) return { source: 'file', path: TWITCH_ALERT_CONFIG_PATH, config: central };

    // Falls STEP96 vorher versehentlich backend\config genutzt hat, einmalig als Migrationsquelle akzeptieren.
    const legacy = readJSON(TWITCH_ALERT_LEGACY_CONFIG_PATH, null);
    if (legacy) return { source: 'legacy_file', path: TWITCH_ALERT_LEGACY_CONFIG_PATH, config: legacy };

    return null;
  }

  function loadTwitchAlertBridgeConfig() {
    const fileFallback = readTwitchAlertFileFallback();
    let dbConfig = getTwitchAlertSettingsFromDb();

    // Erste Migration: Falls DB leer ist, vorhandene JSON/Fallback-Datei übernehmen, sonst Defaults speichern.
    if (!dbConfig) {
      dbConfig = fileFallback?.config || DEFAULT_TWITCH_ALERT_CONFIG;
      try {
        saveTwitchAlertSettingsToDb(mergePlainObject(DEFAULT_TWITCH_ALERT_CONFIG, dbConfig));
        twitchAlertBridgeState.settingsSource = fileFallback ? `${fileFallback.source}_migrated_to_core_database` : 'default_created_in_core_database';
      } catch (e) {
        twitchAlertBridgeState.settingsSource = fileFallback ? fileFallback.source : 'default_no_core_database';
        twitchAlertBridgeState.lastError = `[db_write] ${e?.message || String(e)}`;
      }
    } else {
      twitchAlertBridgeState.settingsSource = 'core_database';
    }

    twitchAlertBridgeState.config = mergePlainObject(DEFAULT_TWITCH_ALERT_CONFIG, dbConfig);
    return twitchAlertBridgeState.config;
  }

  function updateTwitchAlertBridgeConfig(input) {
    const clean = mergePlainObject(twitchAlertBridgeState.config || DEFAULT_TWITCH_ALERT_CONFIG, input || {});
    saveTwitchAlertSettingsToDb(clean);
    twitchAlertBridgeState.config = mergePlainObject(DEFAULT_TWITCH_ALERT_CONFIG, clean);
    twitchAlertBridgeState.settingsSource = 'core_database';
    return twitchAlertBridgeState.config;
  }

  function rememberTwitchAlertBridge(entry) {
    twitchAlertBridgeState.recent.unshift({ at: core.nowIso(), ...entry });
    twitchAlertBridgeState.recent = twitchAlertBridgeState.recent.slice(0, 20);
  }

  const pendingTwitchSubscribeAlerts = new Map();
  const recentTwitchSubscriptionMessages = new Map();

  function getTwitchSubMessageBufferConfig() {
    const cfg = twitchAlertBridgeState.config || DEFAULT_TWITCH_ALERT_CONFIG;
    const buffer = cfg.subMessageBuffer || {};
    const enabled = buffer.enabled !== false;
    const parsedDelayMs = Number(buffer.delayMs ?? buffer.delayMilliseconds ?? 30000);
    const delayMs = Number.isFinite(parsedDelayMs)
      ? Math.max(1000, Math.min(120000, Math.floor(parsedDelayMs)))
      : 30000;
    return { enabled, delayMs };
  }

  function normalizeAlertBridgeLogin(alertPayload) {
    return String(alertPayload?.user_login || alertPayload?.login || alertPayload?.user || '')
      .trim()
      .replace(/^@/, '')
      .toLowerCase();
  }

  function alertPayloadEventId(alertPayload) {
    return String(
      alertPayload?.eventUid ||
      alertPayload?.event_uid ||
      alertPayload?.raw?.id ||
      alertPayload?.raw?.event_id ||
      alertPayload?.raw?.message_id ||
      ''
    ).trim();
  }

  function cleanupSubMessageBufferMaps(nowMs = Date.now()) {
    for (const [login, record] of pendingTwitchSubscribeAlerts.entries()) {
      if (!record || Number(record.expiresAt || 0) <= nowMs) {
        pendingTwitchSubscribeAlerts.delete(login);
      }
    }
    for (const [login, record] of recentTwitchSubscriptionMessages.entries()) {
      if (!record || Number(record.expiresAt || 0) <= nowMs) {
        recentTwitchSubscriptionMessages.delete(login);
      }
    }
  }

  function clearPendingSubscribeAlert(login, reason) {
    const key = normalizeAlertBridgeLogin({ login });
    const record = pendingTwitchSubscribeAlerts.get(key);
    if (!record) return null;

    if (record.timer) clearTimeout(record.timer);
    pendingTwitchSubscribeAlerts.delete(key);
    twitchAlertBridgeState.skipped++;
    rememberTwitchAlertBridge({
      action: 'skipped',
      reason,
      subscriptionType: record.subscriptionType,
      bufferedSubscriptionType: record.subscriptionType,
      alertType: record.alertPayload?.type || '',
      user: record.alertPayload?.user || key,
      login: key,
      eventId: record.eventId || '',
      bufferAgeMs: Math.max(0, Date.now() - Number(record.createdAt || Date.now()))
    });
    return record;
  }

  function isBufferableSubscribeAlert(alertPayload, subscriptionType) {
    return subscriptionType === 'channel.subscribe'
      && alertPayload
      && !alertPayload._skip
      && alertPayload.is_gift !== true
      && alertPayload.is_gift !== 'true'
      && alertPayload.type !== 'gifted_sub_received';
  }

  function isSubscriptionMessageAlert(alertPayload, subscriptionType) {
    return subscriptionType === 'channel.subscription.message'
      && alertPayload
      && !alertPayload._skip;
  }

  function readJSON(file,fallback=null){return core.readJson(file, fallback);}
  function writeJSON(file,obj){try{core.writeJson(file,obj);return true;}catch(e){console.warn('[OAUTH] writeJSON error:',e?.message||e);return false;}}
  const epoch = () => Math.floor(Date.now()/1000);

  async function exchangeCodeForTokens(code){
    const params={client_id:TW_CLIENT_ID,client_secret:TW_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:TW_REDIRECT_URI};
    const r=await axios.post('https://id.twitch.tv/oauth2/token',null,{params});
    const now=epoch();
    return {access_token:r.data.access_token,refresh_token:r.data.refresh_token,expires_at:now+Number(r.data.expires_in||0)};
  }
  async function exchangeCodeForTokensCustom(code, clientId, clientSecret, redirectUri){
    const params = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    };
    const r = await axios.post('https://id.twitch.tv/oauth2/token', null, { params });
    const now = epoch();
    return {
      access_token: r.data.access_token,
      refresh_token: r.data.refresh_token,
      expires_at: now + Number(r.data.expires_in || 0)
    };
  }
  async function refreshTokens(refresh_token){
    const params={client_id:TW_CLIENT_ID,client_secret:TW_CLIENT_SECRET,grant_type:'refresh_token',refresh_token};
    const r=await axios.post('https://id.twitch.tv/oauth2/token',null,{params});
    const now=epoch();
    return {access_token:r.data.access_token,refresh_token:r.data.refresh_token||refresh_token,expires_at:now+Number(r.data.expires_in||0)};
  }
  async function refreshBotTokens(refresh_token){
    const params={client_id:TW_BOT_CLIENT_ID,client_secret:TW_BOT_CLIENT_SECRET,grant_type:'refresh_token',refresh_token};
    const r=await axios.post('https://id.twitch.tv/oauth2/token',null,{params});
    const now=epoch();
    return {access_token:r.data.access_token,refresh_token:r.data.refresh_token||refresh_token,expires_at:now+Number(r.data.expires_in||0)};
  }
  function getStoredUserToken(){const d=readJSON(TOKEN_STORE,null);if(!d||!d.access_token||!d.expires_at)return null;return d;}
  function getStoredBotToken(){const d=readJSON(BOT_TOKEN_STORE,null);if(!d||!d.access_token||!d.expires_at)return null;return d;}
  async function getUserAccessTokenWithRefresh(){const s=getStoredUserToken();if(!s)return null;const now=epoch();if(s.expires_at&&now<s.expires_at-60)return s.access_token;if(s.refresh_token){try{const upd=await refreshTokens(s.refresh_token);writeJSON(TOKEN_STORE,upd);return upd.access_token;}catch(e){console.warn('[OAUTH] refresh failed:',e?.response?.data||e?.message||e);return null;}}return null;}
  async function getBotAccessTokenWithRefresh(){const s=getStoredBotToken();if(!s)return null;const now=epoch();if(s.expires_at&&now<s.expires_at-60)return s.access_token;if(s.refresh_token){try{const upd=await refreshBotTokens(s.refresh_token);writeJSON(BOT_TOKEN_STORE,upd);return upd.access_token;}catch(e){console.warn('[BOT OAUTH] refresh failed:',e?.response?.data||e?.message||e);return null;}}return null;}
  let __app_access=null,__app_exp=0;
  async function getAppAccessToken(){if(!TW_CLIENT_ID||!TW_CLIENT_SECRET){console.warn('[TWITCH] Missing TWITCH_CLIENT_ID/SECRET. Helix calls will fail.');throw new Error('Missing TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET');}const now=epoch();if(__app_access&&now<__app_exp-60)return __app_access;const r=await axios.post('https://id.twitch.tv/oauth2/token',null,{params:{client_id:TW_CLIENT_ID,client_secret:TW_CLIENT_SECRET,grant_type:'client_credentials'}});__app_access=r.data.access_token;__app_exp=now+Number(r.data.expires_in||0);return __app_access;}
  async function getAccessToken(){const user=await getUserAccessTokenWithRefresh();if(user)return user;if(env.TWITCH_ACCESS_TOKEN&&env.TWITCH_ACCESS_TOKEN.length>0)return env.TWITCH_ACCESS_TOKEN;return await getAppAccessToken();}
  function helixHeaders(token){if(!TW_CLIENT_ID)throw new Error('Missing TWITCH_CLIENT_ID header value');return {'Client-ID':TW_CLIENT_ID,Authorization:`Bearer ${token}`};}
  async function helixGet(pathname,params){const token=await getAccessToken();const url=new URL('https://api.twitch.tv/helix'+pathname);Object.entries(params||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')url.searchParams.set(k,v);});const r=await axios.get(url.toString(),{headers:helixHeaders(token)});return r.data;}
  async function helixPost(pathname, body){
    const token = await getAccessToken();
    const url = 'https://api.twitch.tv/helix' + pathname;
    const r = await axios.post(url, body, { headers: { ...helixHeaders(token), 'Content-Type':'application/json' }});
    return r.data;
  }

  async function helixDelete(pathname, params){
    const token = await getAccessToken();
    const url = new URL('https://api.twitch.tv/helix' + pathname);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const r = await axios.delete(url.toString(), { headers: helixHeaders(token) });
    return r.data;
  }

  async function resolveUserByLoginInternal(loginInput) {
    const login = (loginInput || '').toString().trim().replace(/^@/, '').toLowerCase();
    if (!login) return null;

    const data = await helixGet('/users', { login });
    const user = data?.data?.[0];
    if (!user) return null;

    return {
      userId: String(user.id),
      login: String(user.login || login).toLowerCase(),
      displayName: String(user.display_name || user.login || login)
    };
  }

  async function createClipForBroadcasterInternal(broadcasterIdInput, options = {}) {
    const broadcasterId = String(broadcasterIdInput || DEFAULT_BROADCASTER_ID || '').trim();
    if (!broadcasterId) throw new Error('broadcaster_id_missing');

    const token = await getUserAccessTokenWithRefresh();
    if (!token) throw new Error('twitch_user_token_missing');

    const url = new URL('https://api.twitch.tv/helix/clips');
    url.searchParams.set('broadcaster_id', broadcasterId);

    if (options && Object.prototype.hasOwnProperty.call(options, 'hasDelay')) {
      url.searchParams.set('has_delay', options.hasDelay ? 'true' : 'false');
    }

    // STEP195_TWITCH_CLIP_TITLE_DURATION_PARAMS
    // Streamer.bot kann Clip Title/Duration beim Create Clip übergeben.
    // Twitch-Referenzen sind hier nicht überall konsistent, deshalb testen wir dieselben
    // Query-Parameter direkt im Backend.
    if (options && typeof options.title === 'string' && options.title.trim()) {
      url.searchParams.set('title', options.title.trim());
    }

    if (options && Number.isFinite(Number(options.duration))) {
      const duration = Math.max(5, Math.min(60, Math.floor(Number(options.duration))));
      url.searchParams.set('duration', String(duration));
    }

    const r = await axios.post(url.toString(), null, { headers: helixHeaders(token) });
    const data = Array.isArray(r.data?.data) ? r.data.data : [];
    const clip = data[0] || null;

    return {
      ok: Boolean(clip && clip.id),
      broadcasterId,
      clipId: clip?.id ? String(clip.id) : '',
      editUrl: clip?.edit_url ? String(clip.edit_url) : '',
      data,
      raw: r.data
    };
  }

  async function getClipByIdInternal(clipIdInput) {
    const clipId = String(clipIdInput || '').trim();
    if (!clipId) throw new Error('clip_id_missing');

    const data = await helixGet('/clips', { id: clipId });
    const rows = Array.isArray(data?.data) ? data.data : [];
    const clip = rows[0] || null;

    return {
      ok: Boolean(clip),
      clipId,
      clip,
      data: rows,
      raw: data
    };
  }

  sharedApi.resolveUserByLogin = resolveUserByLoginInternal;
  sharedApi.getStoredBotToken = getStoredBotToken;
  sharedApi.getBotAccessTokenWithRefresh = getBotAccessTokenWithRefresh;
  sharedApi.validateStoredUserToken = validateStoredUserToken;
  sharedApi.createClipForBroadcaster = createClipForBroadcasterInternal;
  sharedApi.getClipById = getClipByIdInternal;


  // OAuth
  const pendingStates = new Set();
  const pendingBotStates = new Set();
  app.get('/auth/login',(req,res)=>{
    if(!TW_CLIENT_ID||!TW_CLIENT_SECRET) return res.status(500).send('Missing TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET in .env');
    const state=crypto.randomBytes(16).toString('hex'); pendingStates.add(state);
    const scopes=encodeURIComponent(TW_OAUTH_SCOPES.join(' '));
    const redirect_uri=encodeURIComponent(TW_REDIRECT_URI);
    const url=`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${TW_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=${scopes}&state=${state}`;
    res.redirect(url);
  });
  app.get('/auth/callback',async (req,res)=>{
    const {code,state,error,error_description}=req.query;
    if(error){return res.status(400).send(`OAuth error: ${error} – ${error_description||''}<br>Server redirect_uri: <code>${TW_REDIRECT_URI}</code>`);}
    try{
      if(!code||!state) return res.status(400).send('Missing code/state (bitte /auth/login benutzen)');
      if(!pendingStates.has(state)) return res.status(400).send('Invalid state');
      pendingStates.delete(state);
      const tokens=await exchangeCodeForTokens(code.toString());
      writeJSON(TOKEN_STORE,tokens);
      res.send(`OK – Token gespeichert.<br>File: ${TOKEN_STORE}<br><a href="/auth/status">/auth/status</a>`);
    }catch(e){res.status(500).send('OAuth error: '+JSON.stringify(e.response?.data||e.message));}
  });
  app.get('/auth/status',(req,res)=>{
    const data=readJSON(TOKEN_STORE,null);const now=epoch();
    res.json({ ok:true, store:TOKEN_STORE, present:!!data, expires_at:data?.expires_at||null, expires_in:data?.expires_at?data.expires_at-now:null, has_refresh:!!data?.refresh_token });
  });

  async function validateStoredUserToken() {
    const token = await getUserAccessTokenWithRefresh();
    if (!token) {
      return {
        ok: false,
        store: TOKEN_STORE,
        present: false,
        error: 'No stored user OAuth token. Bitte zuerst /auth/login ausfuehren.'
      };
    }

    const r = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${token}` }
    });

    const scopes = Array.isArray(r.data?.scopes) ? r.data.scopes.map(String) : [];
    const userId = String(r.data?.user_id || '');
    const login = String(r.data?.login || '');
    const broadcasterId = String(DEFAULT_BROADCASTER_ID || '').trim();

    return {
      ok: true,
      store: TOKEN_STORE,
      present: true,
      clientId: String(r.data?.client_id || ''),
      login,
      userId,
      broadcasterId,
      tokenUserMatchesBroadcaster: Boolean(broadcasterId && userId && broadcasterId === userId),
      scopes,
      hasClipsEdit: scopes.includes('clips:edit'),
      expiresIn: Number(r.data?.expires_in || 0),
      raw: r.data
    };
  }

  const handleAuthValidate = async (_req, res) => {
    try {
      const result = await validateStoredUserToken();
      const statusCode = result.ok ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (e) {
      const statusCode = e.response?.status || 500;
      return res.status(statusCode).json({
        ok: false,
        store: TOKEN_STORE,
        present: !!getStoredUserToken(),
        error: e.response?.data || e.message || String(e)
      });
    }
  };

  app.get('/auth/validate', handleAuthValidate);
  app.get('/twitch/auth/validate', handleAuthValidate);
  app.get('/api/twitch/auth/validate', handleAuthValidate);

  // Diagnose: zeigt den Twitch-User, zu dem der aktuell gespeicherte User-OAuth-Token gehört.
  // Wichtig für Endpoints wie /twitch/moderators, bei denen broadcaster_id zur Token-User-ID passen muss.
  app.get('/twitch/me', async (req, res) => {
    try {
      const token = await getUserAccessTokenWithRefresh();
      if (!token) {
        return res.status(401).json({
          ok: false,
          error: 'No stored user OAuth token. Bitte zuerst /auth/login ausführen.'
        });
      }

      const r = await axios.get('https://api.twitch.tv/helix/users', {
        headers: helixHeaders(token)
      });

      const user = r.data?.data?.[0] || null;
      res.json({
        ok: true,
        store: TOKEN_STORE,
        tokenUser: user ? {
          id: user.id,
          login: user.login,
          display_name: user.display_name,
          broadcaster_type: user.broadcaster_type || '',
          profile_image_url: user.profile_image_url || ''
        } : null,
        raw: r.data
      });
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  });

  app.get('/auth/logout',(req,res)=>{ try{ if(fs.existsSync(TOKEN_STORE)) fs.unlinkSync(TOKEN_STORE);}catch{} res.json({ok:true,removed:TOKEN_STORE}); });


  app.get('/auth/bot/login', (req, res) => {
    if (!TW_BOT_CLIENT_ID || !TW_BOT_CLIENT_SECRET) {
      return res.status(500).send('Missing TWITCH_BOT_CLIENT_ID / TWITCH_BOT_CLIENT_SECRET in .env');
    }

    const state = crypto.randomBytes(16).toString('hex');
    pendingBotStates.add(state);

    const scopes = encodeURIComponent(TW_BOT_OAUTH_SCOPES.join(' '));
    const redirect_uri = encodeURIComponent(TW_BOT_REDIRECT_URI);

    const url =
      `https://id.twitch.tv/oauth2/authorize?response_type=code` +
      `&client_id=${TW_BOT_CLIENT_ID}` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${scopes}` +
      `&state=${state}` +
      `&force_verify=true`;

    res.redirect(url);
  });

  app.get('/auth/bot/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.status(400).send(
        `OAuth error: ${error} – ${error_description || ''}<br>` +
        `Bot redirect_uri: <code>${TW_BOT_REDIRECT_URI}</code>`
      );
    }

    try {
      if (!code || !state) {
        return res.status(400).send('Missing code/state (bitte /auth/bot/login benutzen)');
      }
      if (!pendingBotStates.has(state)) {
        return res.status(400).send('Invalid bot state');
      }

      pendingBotStates.delete(state);

      const tokens = await exchangeCodeForTokensCustom(
        code.toString(),
        TW_BOT_CLIENT_ID,
        TW_BOT_CLIENT_SECRET,
        TW_BOT_REDIRECT_URI
      );
      writeJSON(BOT_TOKEN_STORE, tokens);

      res.send(
        `OK – Bot-Token gespeichert.<br>` +
        `Bot: <code>${TW_BOT_USERNAME || '(not set)'}</code><br>` +
        `Channel: <code>${TW_BOT_CHANNEL || '(not set)'}</code><br>` +
        `File: ${BOT_TOKEN_STORE}<br>` +
        `<a href="/auth/bot/status">/auth/bot/status</a>`
      );
    } catch (e) {
      res.status(500).send('Bot OAuth error: ' + JSON.stringify(e.response?.data || e.message));
    }
  });

  app.get('/auth/bot/status', (req, res) => {
    const data = readJSON(BOT_TOKEN_STORE, null);
    const now = epoch();

    res.json({
      ok: true,
      bot_username: TW_BOT_USERNAME,
      channel: TW_BOT_CHANNEL,
      store: BOT_TOKEN_STORE,
      present: !!data,
      expires_at: data?.expires_at || null,
      expires_in: data?.expires_at ? data.expires_at - now : null,
      has_refresh: !!data?.refresh_token
    });
  });

  app.get('/auth/bot/logout', (req, res) => {
    try {
      if (fs.existsSync(BOT_TOKEN_STORE)) fs.unlinkSync(BOT_TOKEN_STORE);
    } catch {}
    res.json({ ok: true, removed: BOT_TOKEN_STORE });
  });

  // Twitch Helix (READ)
  const handleUserInfo = async (req, res) => {
    try {
      const login = core.getParam(req, 'login', '').toString().trim();
      if (!login) return res.status(400).json({ ok:false, error:'Missing ?login=' });
      res.json(await helixGet('/users', { login }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleUserById = async (req, res) => {
    try {
      const id = core.getParam(req, 'id', '').toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });
      res.json(await helixGet('/users', { id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleResolveUser = async (req, res) => {
    try {
      const login = core.getParam(req, 'login', '').toString().trim();
      if (!login) return res.status(400).json({ ok:false, error:'Missing ?login=' });
      const result = await resolveUserByLoginInternal(login);
      if (!result) return res.status(404).json({ ok:false, error:'User not found' });
      res.json({ ok:true, ...result });
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleStreamInfo = async (req, res) => {
    try {
      const login = core.getParam(req, 'login', '').toString().trim();
      if (!login) return res.status(400).json({ ok:false, error:'Missing ?login=' });
      const u = await helixGet('/users', { login });
      const user = u?.data?.[0];
      if (!user) return res.status(404).json({ ok:false, error:'User not found' });
      res.json(await helixGet('/streams', { user_id: user.id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleChannelInfo = async (req, res) => {
    try {
      const id = core.getParam(req, 'id', '').toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });
      res.json(await helixGet('/channels', { broadcaster_id: id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleChannelSummary = async (req, res) => {
    try {
      const id = core.getParam(req, 'id', '').toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });

      const [channel, stream] = await Promise.all([
        helixGet('/channels', { broadcaster_id: id }),
        helixGet('/streams', { user_id: id })
      ]);

      const c = channel?.data?.[0] || null;
      const s = stream?.data?.[0] || null;

      res.json({
        ok: true,
        broadcaster_id: id,
        broadcaster_login: c?.broadcaster_login || null,
        broadcaster_name: c?.broadcaster_name || null,
        title: c?.title || null,
        game_name: c?.game_name || null,
        game_id: c?.game_id || null,
        language: c?.broadcaster_language || null,
        is_live: !!s,
        stream_type: s?.type || null,
        viewer_count: s?.viewer_count ?? null,
        started_at: s?.started_at || null,
        thumbnail_url: s?.thumbnail_url || null,
        tags: c?.tags || []
      });
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleStreamSummary = async (req, res) => {
    try {
      let userId = core.getParam(req, 'id', '').toString().trim();
      const login = core.getParam(req, 'login', '').toString().trim();

      if (!userId && !login) return res.status(400).json({ ok:false, error:'Missing ?id= or ?login=' });

      if (!userId) {
        const u = await helixGet('/users', { login });
        const user = u?.data?.[0];
        if (!user) return res.status(404).json({ ok:false, error:'User not found' });
        userId = String(user.id);
      }

      const [userInfo, streamInfo, channelInfo] = await Promise.all([
        helixGet('/users', { id: userId }),
        helixGet('/streams', { user_id: userId }),
        helixGet('/channels', { broadcaster_id: userId })
      ]);

      const user = userInfo?.data?.[0] || null;
      const stream = streamInfo?.data?.[0] || null;
      const channel = channelInfo?.data?.[0] || null;

      res.json({
        ok: true,
        user_id: user?.id || userId,
        login: user?.login || null,
        display_name: user?.display_name || null,
        profile_image_url: user?.profile_image_url || null,
        is_live: !!stream,
        title: channel?.title || stream?.title || null,
        game_name: channel?.game_name || stream?.game_name || null,
        game_id: channel?.game_id || stream?.game_id || null,
        viewer_count: stream?.viewer_count ?? null,
        started_at: stream?.started_at || null,
        stream_id: stream?.id || null,
        thumbnail_url: stream?.thumbnail_url || null
      });
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleChatSettings = async (req, res) => {
    try {
      const broadcasterId = core.pickFirst(core.getParam(req, 'broadcaster_id', ''), core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      const moderatorId = core.pickFirst(core.getParam(req, 'moderator_id', ''), broadcasterId).toString().trim();
      if (!broadcasterId) return res.status(400).json({ ok:false, error:'Missing ?broadcaster_id= or ?id=' });
      if (!moderatorId) return res.status(400).json({ ok:false, error:'Missing ?moderator_id=' });
      res.json(await helixGet('/chat/settings', { broadcaster_id: broadcasterId, moderator_id: moderatorId }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleChatters = async (req, res) => {
    try {
      const broadcasterId = core.pickFirst(core.getParam(req, 'broadcaster_id', ''), core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      const moderatorId = core.pickFirst(core.getParam(req, 'moderator_id', ''), broadcasterId).toString().trim();
      if (!broadcasterId) return res.status(400).json({ ok:false, error:'Missing ?broadcaster_id= or ?id=' });
      if (!moderatorId) return res.status(400).json({ ok:false, error:'Missing ?moderator_id=' });
      res.json(await helixGet('/chat/chatters', { broadcaster_id: broadcasterId, moderator_id: moderatorId }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleGoals = async (req, res) => {
    try {
      const id = core.pickFirst(core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });
      res.json(await helixGet('/goals', { broadcaster_id: id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handleSchedule = async (req, res) => {
    try {
      const id = core.pickFirst(core.getParam(req, 'id', ''), core.getParam(req, 'broadcaster_id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      const first = core.getParam(req, 'first', '').toString().trim();
      const startTime = core.getParam(req, 'start_time', '').toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id= or ?broadcaster_id=' });
      const params = { broadcaster_id: id };
      if (first) params.first = first;
      if (startTime) params.start_time = startTime;
      res.json(await helixGet('/schedule', params));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handlePolls = async (req, res) => {
    try {
      const id = core.pickFirst(core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });
      res.json(await helixGet('/polls', { broadcaster_id: id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  const handlePredictions = async (req, res) => {
    try {
      const id = core.pickFirst(core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
      if (!id) return res.status(400).json({ ok:false, error:'Missing ?id=' });
      res.json(await helixGet('/predictions', { broadcaster_id: id }));
    } catch (e) {
      res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
    }
  };

  // Legacy-Routen bleiben erhalten. Neue /api/twitch/... Routen laufen als zusätzliche Aliase.
  routes.registerGet(app, ['/userinfo', '/twitch/user', '/api/twitch/user'], handleUserInfo);
  routes.registerGet(app, ['/streaminfo', '/twitch/stream', '/api/twitch/stream'], handleStreamInfo);
  routes.registerGet(app, ['/channelinfo', '/twitch/channel', '/api/twitch/channel'], handleChannelInfo);
  routes.registerGet(app, ['/twitch/user-by-id', '/api/twitch/user/by-id'], handleUserById);
  routes.registerGet(app, ['/twitch/resolve-user', '/api/twitch/user/resolve'], handleResolveUser);
  routes.registerGet(app, ['/twitch/channel-summary', '/api/twitch/channel/summary'], handleChannelSummary);
  routes.registerGet(app, ['/twitch/stream-summary', '/api/twitch/stream/summary'], handleStreamSummary);
  routes.registerGet(app, ['/twitch/chat-settings', '/api/twitch/chat/settings'], handleChatSettings);
  routes.registerGet(app, ['/twitch/chatters', '/api/twitch/chatters'], handleChatters);
  routes.registerGet(app, ['/twitch/goals', '/api/twitch/goals'], handleGoals);
  routes.registerGet(app, ['/twitch/schedule', '/api/twitch/schedule'], handleSchedule);
  routes.registerGet(app, ['/twitch/polls', '/api/twitch/polls'], handlePolls);
  routes.registerGet(app, ['/twitch/predictions', '/api/twitch/predictions'], handlePredictions);

  const helixReadRoutes = [
    ['/followers', '/channels/followers', 'broadcaster_id'],
    ['/subscriptions', '/subscriptions', 'broadcaster_id'],
    ['/emotes', '/chat/emotes', 'broadcaster_id'],
    ['/rewards', '/channel_points/custom_rewards', 'broadcaster_id'],
    ['/clips', '/clips', 'broadcaster_id'],
    ['/videos', '/videos', 'user_id'],
    ['/raids', '/raids', 'from_broadcaster_id'],
    ['/moderators', '/moderation/moderators', 'broadcaster_id'],
    ['/vips', '/channels/vips', 'broadcaster_id'],
    ['/badges', '/chat/badges', 'broadcaster_id'],
  ];

  const helixAliasMap = {
    '/followers': ['/twitch/followers', '/api/twitch/followers'],
    '/subscriptions': ['/twitch/subscriptions', '/api/twitch/subscriptions'],
    '/emotes': ['/twitch/emotes', '/api/twitch/emotes'],
    '/rewards': ['/twitch/rewards', '/api/twitch/rewards'],
    '/clips': ['/twitch/clips', '/api/twitch/clips'],
    '/videos': ['/twitch/videos', '/api/twitch/videos'],
    '/raids': ['/twitch/raids', '/api/twitch/raids'],
    '/moderators': ['/twitch/moderators', '/api/twitch/moderators'],
    '/vips': ['/twitch/vips', '/api/twitch/vips'],
    '/badges': ['/twitch/badges', '/api/twitch/badges'],
  };

  helixReadRoutes.forEach(([route, helixPath, queryKey]) => {
    const handler = async (req, res) => {
      try {
        const id = core.getParam(req, 'id', '').toString().trim();
        if (!id) return res.status(400).json({ ok:false, error:`Missing ?id= for ${route}` });
        res.json(await helixGet(helixPath, { [queryKey]: id }));
      } catch (e) {
        res.status(e.response?.status || 500).json({ ok:false, error: e.response?.data || e.message });
      }
    };

    routes.registerGet(app, [route, ...(helixAliasMap[route] || [])], handler);
  });

  const handleEventSubCache = (req, res) => {
    const type = core.getParam(req, 'type', '').toString().trim();
    if (!type) return res.status(400).json({ ok:false, error:'Missing ?type=' });
    res.json(readEventCache(type) || { ok:true, type, updated_at:null, payload:null, source:'cache(empty)' });
  };

  routes.registerGet(app, ['/eventsub/cache', '/api/twitch/eventsub/cache'], handleEventSubCache);

  const handleEventSubCacheAll = (req, res) => {
    const files = fs.existsSync(HT_CACHE_DIR)
      ? fs.readdirSync(HT_CACHE_DIR).filter(name => name.startsWith('eventsub_') && name.endsWith('.json'))
      : [];

    const data = {};
    files.forEach(name => {
      const key = name.replace(/^eventsub_/, '').replace(/\.json$/, '');
      data[key] = readJSON(path.join(HT_CACHE_DIR, name), null);
    });

    res.json({ ok:true, count:Object.keys(data).length, data });
  };

  routes.registerGet(app, ['/eventsub/cache_all', '/api/twitch/eventsub/cache/all'], handleEventSubCacheAll);

  // --------------------- Hype Train: Cache Endpoint (für Streamer.bot !zug) ---------------------
  const handleHypetrainCache = (req, res) => {
    const id = core.pickFirst(core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
    if (!id) return res.status(400).json({ ok:false, error:'Missing ?id= (oder TWITCH_BROADCASTER_ID setzen)' });

    const file = cacheFileFor(id);
    const data = readJSON(file, null);

    if (!data) {
      return res.json({
        ok: true,
        broadcaster_id: id,
        cooldown_ends_at: null,
        cooldown_end_local: null,
        minutes_remaining: null,
        is_ready: null,
        last_event_utc: null,
        source: 'cache(empty)'
      });
    }

    // live berechnen, damit countdown sauber bleibt
    const now = new Date();
    let mins = null;
    let ready = null;

    if (data.cooldown_ends_at) {
      const end = new Date(data.cooldown_ends_at);
      const diffMs = end.getTime() - now.getTime();
      ready = diffMs <= 0;
      mins = diffMs <= 0 ? 0 : Math.ceil(diffMs / 60000);
    }

    return res.json({
      ok: true,
      broadcaster_id: id,
      cooldown_ends_at: data.cooldown_ends_at || null,
      cooldown_end_local: data.cooldown_end_local || null,
      minutes_remaining: mins,
      is_ready: ready,
      last_event_utc: data.last_event_utc || null,
      hype_train_level: data.hype_train_level || null,
      hype_train_id: data.hype_train_id || null,
      source: 'cache'
    });
  };

  routes.registerGet(app, ['/hypetrain/cache', '/twitch/hypetrain', '/api/twitch/hypetrain', '/api/twitch/hypetrain/cache'], handleHypetrainCache);

  // Debug: rohes Cache-Objekt anzeigen
  const handleHypetrainCacheRaw = (req, res) => {
    const id = core.pickFirst(core.getParam(req, 'id', ''), DEFAULT_BROADCASTER_ID).toString().trim();
    if (!id) return res.status(400).json({ ok:false, error:'Missing ?id= (oder TWITCH_BROADCASTER_ID setzen)' });

    const file = cacheFileFor(id);
    res.json({ ok:true, file, data: readJSON(file, null) });
  };

  routes.registerGet(app, ['/hypetrain/cache_raw', '/twitch/hypetrain/raw', '/api/twitch/hypetrain/raw', '/api/twitch/hypetrain/cache/raw'], handleHypetrainCacheRaw);

  loadTwitchAlertBridgeConfig();

  routes.registerGet(app, ['/api/twitch/alerts/status', '/twitch/alerts/status'], (req, res) => {
    res.json({
      ok: true,
      module: 'twitch_alert_bridge',
      enabled: twitchAlertBridgeState.config.enabled !== false,
      settingsSource: twitchAlertBridgeState.settingsSource,
      settingsKey: twitchAlertBridgeState.settingsKey,
      configPath: twitchAlertBridgeState.configPath,
      config: twitchAlertBridgeState.config,
      forwarded: twitchAlertBridgeState.forwarded,
      skipped: twitchAlertBridgeState.skipped,
      failed: twitchAlertBridgeState.failed,
      lastForwardedAt: twitchAlertBridgeState.lastForwardedAt,
      lastError: twitchAlertBridgeState.lastError,
      subMessageBuffer: {
        ...getTwitchSubMessageBufferConfig(),
        pendingSubscribeAlerts: pendingTwitchSubscribeAlerts.size,
        recentSubscriptionMessages: recentTwitchSubscriptionMessages.size
      },
      recent: twitchAlertBridgeState.recent
    });
  });

  routes.registerPost(app, ['/api/twitch/alerts/reload', '/twitch/alerts/reload'], (req, res) => {
    const cfg = loadTwitchAlertBridgeConfig();
    res.json({ ok: true, settingsSource: twitchAlertBridgeState.settingsSource, settingsKey: twitchAlertBridgeState.settingsKey, configPath: twitchAlertBridgeState.configPath, config: cfg });
  });

  routes.registerGet(app, ['/api/twitch/alerts/settings', '/twitch/alerts/settings'], (req, res) => {
    const cfg = loadTwitchAlertBridgeConfig();
    res.json({ ok: true, settingsSource: twitchAlertBridgeState.settingsSource, settingsKey: twitchAlertBridgeState.settingsKey, config: cfg });
  });

  routes.registerPost(app, ['/api/twitch/alerts/settings', '/twitch/alerts/settings'], (req, res) => {
    try {
      const cfg = updateTwitchAlertBridgeConfig(req.body || {});
      res.json({ ok: true, settingsSource: twitchAlertBridgeState.settingsSource, settingsKey: twitchAlertBridgeState.settingsKey, config: cfg });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });

  routes.registerGet(app, ['/api/twitch/alerts/test', '/twitch/alerts/test'], async (req, res) => {
    const kind = (req.query.type || 'bits').toString();
    const fake = buildFakeTwitchAlertEvent(kind, req.query || {});
    const fakeMeta = {
      message_id: (req.query.eventId || req.query.eventUid || `test_${kind}_${Date.now()}`).toString(),
      message_timestamp: core.nowIso()
    };
    const fakeSubscription = { id: `test_${kind}`, type: fake.subscriptionType };

    const alertPayload = normalizeTwitchEventSubToAlert(fake.subscriptionType, fake.event);
    if (!alertPayload) return res.status(400).json({ ok: false, error: 'unsupported_test_type', type: kind });

    const alertResult = await forwardAlertPayloadToAlertSystem(alertPayload, fake.subscriptionType);

    let loyaltyPayload = null;
    let loyaltyResult = { ok: true, skipped: true, reason: 'no_loyalty_payload' };
    try {
      loyaltyPayload = normalizeTwitchEventSubToLoyaltyEvent(fake.subscriptionType, fake.event, fakeMeta, fakeSubscription);
      if (loyaltyPayload) loyaltyResult = await forwardLoyaltyPayloadToLoyaltySystem(loyaltyPayload, fake.subscriptionType);
    } catch (e) {
      loyaltyResult = { ok: false, error: e?.message || String(e) };
    }

    const ok = Boolean(alertResult?.ok) && Boolean(loyaltyResult?.ok);
    res.status(ok ? 200 : 500).json({
      ok,
      subscriptionType: fake.subscriptionType,
      alertPayload,
      alertResult,
      loyaltyPayload,
      loyaltyResult
    });
  });

  // --------------------- EventSub WebSocket (erweitert für wichtige Stream-/Community-Events) ---------------------
  let ws = null;
  let reconnectCandidateWs = null;
  let reconnectTimer = null;
  let isShuttingDown = false;
  let eventSubConnecting = false;
  let eventSubRetryDelayMs = 2500;
  const EVENTSUB_NORMAL_URL = 'wss://eventsub.wss.twitch.tv/ws';
  const eventsubKnownSubscriptions = new Set();
  const eventSubState = {
    startedAt: core.nowIso(),
    connecting: false,
    url: EVENTSUB_NORMAL_URL,
    lastOpenAt: null,
    lastSessionId: null,
    lastWelcomeAt: null,
    lastReconnectAt: null,
    lastReconnectUrl: null,
    lastNotificationAt: null,
    lastNotificationType: null,
    lastRevocationAt: null,
    lastRevocation: null,
    lastCloseAt: null,
    lastCloseCode: null,
    lastCloseReason: '',
    lastErrorAt: null,
    lastError: '',
    retryDelayMs: eventSubRetryDelayMs,
    reconnectTimerActive: false,
    broadcasterIdConfigured: Boolean(DEFAULT_BROADCASTER_ID),
    broadcasterId: DEFAULT_BROADCASTER_ID || '',
    lastBootstrapAt: null,
    lastBootstrapError: '',
    lastListCount: 0,
    lastListAt: null,
    subscriptionAttempts: 0,
    subscriptionSuccess: 0,
    subscriptionSkippedExisting: 0,
    subscriptionFailed: 0,
    lastSubscribeAt: null,
    lastSubscribeType: null,
    lastSubscribeError: '',
    recent: []
  };

  function eventSubReadyStateName(socket) {
    if (!socket) return 'NONE';
    if (socket.readyState === WebSocket.CONNECTING) return 'CONNECTING';
    if (socket.readyState === WebSocket.OPEN) return 'OPEN';
    if (socket.readyState === WebSocket.CLOSING) return 'CLOSING';
    if (socket.readyState === WebSocket.CLOSED) return 'CLOSED';
    return String(socket.readyState);
  }

  function rememberEventSubState(entry) {
    eventSubState.recent.unshift({ at: core.nowIso(), ...(entry || {}) });
    eventSubState.recent = eventSubState.recent.slice(0, 30);
  }

  function getEventSubStatusSnapshot() {
    return {
      ok: true,
      module: 'twitch_eventsub',
      connected: Boolean(ws && ws.readyState === WebSocket.OPEN),
      connecting: Boolean(eventSubConnecting),
      reconnectCandidateActive: Boolean(reconnectCandidateWs && (reconnectCandidateWs.readyState === WebSocket.OPEN || reconnectCandidateWs.readyState === WebSocket.CONNECTING)),
      readyState: eventSubReadyStateName(ws),
      reconnectCandidateReadyState: eventSubReadyStateName(reconnectCandidateWs),
      retryDelayMs: eventSubRetryDelayMs,
      reconnectTimerActive: Boolean(reconnectTimer),
      normalUrl: EVENTSUB_NORMAL_URL,
      broadcasterIdConfigured: Boolean(DEFAULT_BROADCASTER_ID),
      broadcasterId: DEFAULT_BROADCASTER_ID || '',
      configuredSubscriptionsCount: eventSubConfigs.length,
      configuredSubscriptions: eventSubConfigs.map(cfg => ({ type: cfg.type, version: cfg.version, cacheKey: cfg.cacheKey })),
      knownSubscriptionsCount: eventsubKnownSubscriptions.size,
      knownSubscriptions: Array.from(eventsubKnownSubscriptions).sort(),
      state: { ...eventSubState, recent: eventSubState.recent.slice(0, 30) },
      alertBridge: {
        enabled: twitchAlertBridgeState.config?.enabled !== false,
        settingsSource: twitchAlertBridgeState.settingsSource,
        settingsKey: twitchAlertBridgeState.settingsKey,
        forwarded: twitchAlertBridgeState.forwarded,
        skipped: twitchAlertBridgeState.skipped,
        failed: twitchAlertBridgeState.failed,
        lastForwardedAt: twitchAlertBridgeState.lastForwardedAt,
        lastError: twitchAlertBridgeState.lastError,
        subMessageBuffer: {
          ...getTwitchSubMessageBufferConfig(),
          pendingSubscribeAlerts: pendingTwitchSubscribeAlerts.size,
          recentSubscriptionMessages: recentTwitchSubscriptionMessages.size
        },
        recent: twitchAlertBridgeState.recent.slice(0, 20)
      }
    };
  }

  const eventSubConfigs = [
    {
      type: 'stream.online',
      version: '1',
      cacheKey: 'stream.online',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'stream.offline',
      version: '1',
      cacheKey: 'stream.offline',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.update',
      version: '2',
      cacheKey: 'channel.update',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.hype_train.begin',
      version: '2',
      cacheKey: 'channel.hype_train.begin',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.hype_train.progress',
      version: '2',
      cacheKey: 'channel.hype_train.progress',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.hype_train.end',
      version: '2',
      cacheKey: 'channel.hype_train.end',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.channel_points_custom_reward_redemption.add',
      version: '1',
      cacheKey: 'channel.channel_points_custom_reward_redemption.add',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.follow',
      version: '2',
      cacheKey: 'channel.follow',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId })
    },
    {
      type: 'channel.subscribe',
      version: '1',
      cacheKey: 'channel.subscribe',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.subscription.gift',
      version: '1',
      cacheKey: 'channel.subscription.gift',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.subscription.message',
      version: '1',
      cacheKey: 'channel.subscription.message',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.cheer',
      version: '1',
      cacheKey: 'channel.cheer',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.raid',
      version: '1',
      cacheKey: 'channel.raid',
      buildCondition: (broadcasterId) => ({ to_broadcaster_user_id: broadcasterId })
    },
    {
      type: 'channel.shoutout.create',
      version: '1',
      cacheKey: 'channel.shoutout.create',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId })
    },
    {
      type: 'channel.shoutout.receive',
      version: '1',
      cacheKey: 'channel.shoutout.receive',
      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId })
    }
  ];

  function normalizeEventSubCondition(condition) {
    const clean = {};
    for (const [key, value] of Object.entries(condition || {})) {
      if (value === undefined || value === null || value === '') continue;
      clean[key] = String(value);
    }
    return Object.keys(clean).sort().reduce((acc, key) => { acc[key] = clean[key]; return acc; }, {});
  }

  function eventSubKey(type, version, condition) {
    return `${type}|${version}|${JSON.stringify(normalizeEventSubCondition(condition || {}))}`;
  }

  function isEnabledEventSubForSession(sub, sessionId) {
    if (!sub || sub.status !== 'enabled') return false;
    if (!sessionId) return true;
    return String(sub.transport?.session_id || '') === String(sessionId);
  }

  function rebuildKnownEventSubSubscriptions(subscriptions, sessionId) {
    eventsubKnownSubscriptions.clear();
    let added = 0;
    for (const sub of subscriptions || []) {
      if (!isEnabledEventSubForSession(sub, sessionId)) continue;
      const key = eventSubKey(sub.type, sub.version, sub.condition || {});
      eventsubKnownSubscriptions.add(key);
      added++;
    }
    return added;
  }

  async function listEventSubSubscriptions() {
    try {
      const response = await helixGet('/eventsub/subscriptions', {});
      const rows = Array.isArray(response?.data) ? response.data : [];
      eventSubState.lastListAt = core.nowIso();
      eventSubState.lastListCount = rows.length;
      return rows;
    } catch (e) {
      const msg = `${e.response?.status || ''} ${JSON.stringify(e.response?.data || e.message)}`.trim();
      eventSubState.lastErrorAt = core.nowIso();
      eventSubState.lastError = `[list] ${msg}`.slice(0, 500);
      rememberEventSubState({ action: 'list_failed', error: eventSubState.lastError });
      console.warn('[eventsub] list subscriptions failed:', e.response?.status, JSON.stringify(e.response?.data || e.message));
      return [];
    }
  }

  async function createEventSubSubscription(config, sessionId, broadcasterId){
    const condition = normalizeEventSubCondition(config.buildCondition(broadcasterId));
    const uniqueKey = eventSubKey(config.type, config.version, condition);
    if (eventsubKnownSubscriptions.has(uniqueKey)) {
      eventSubState.subscriptionSkippedExisting++;
      return;
    }

    const body = {
      type: config.type,
      version: config.version,
      condition,
      transport: { method: 'websocket', session_id: sessionId }
    };
    try {
      eventSubState.subscriptionAttempts++;
      eventSubState.lastSubscribeAt = core.nowIso();
      eventSubState.lastSubscribeType = config.type;
      const r = await helixPost('/eventsub/subscriptions', body);
      const subId = r?.data?.[0]?.id;
      eventsubKnownSubscriptions.add(uniqueKey);
      eventSubState.subscriptionSuccess++;
      eventSubState.lastSubscribeError = '';
      rememberEventSubState({ action: 'subscribed', type: config.type, version: config.version, subId: subId || null });
      console.log(`[eventsub] subscribed ${config.type} v${config.version} for ${broadcasterId} (subId=${subId || '?'})`);
    } catch (e) {
      const msg = `${e.response?.status || ''} ${JSON.stringify(e.response?.data || e.message)}`.trim();
      eventSubState.subscriptionFailed++;
      eventSubState.lastSubscribeAt = core.nowIso();
      eventSubState.lastSubscribeType = config.type;
      eventSubState.lastSubscribeError = msg.slice(0, 500);
      eventSubState.lastErrorAt = core.nowIso();
      eventSubState.lastError = `[subscribe ${config.type}] ${msg}`.slice(0, 500);
      rememberEventSubState({ action: 'subscribe_failed', type: config.type, version: config.version, error: eventSubState.lastSubscribeError });
      console.warn(`[eventsub] subscribe failed for ${config.type}:`, e.response?.status, JSON.stringify(e.response?.data || e.message));
    }
  }

  async function bootstrapEventSubSubscriptions(sessionId, broadcasterId) {
    eventSubState.lastBootstrapAt = core.nowIso();
    eventSubState.lastBootstrapError = '';
    try {
      const existing = await listEventSubSubscriptions();
      const activeKnown = rebuildKnownEventSubSubscriptions(existing, sessionId);
      rememberEventSubState({ action: 'known_rebuilt', sessionId, activeKnown, totalListed: existing.length });

      for (const config of eventSubConfigs) {
        await createEventSubSubscription(config, sessionId, broadcasterId);
      }
      rememberEventSubState({ action: 'bootstrap_done', sessionId, broadcasterId, knownSubscriptionsCount: eventsubKnownSubscriptions.size });
    } catch (e) {
      eventSubState.lastBootstrapError = e?.message || String(e);
      eventSubState.lastErrorAt = core.nowIso();
      eventSubState.lastError = `[bootstrap] ${eventSubState.lastBootstrapError}`.slice(0, 500);
      rememberEventSubState({ action: 'bootstrap_failed', error: eventSubState.lastBootstrapError });
      throw e;
    }
  }

  function writeHypetrainCacheFromEndEvent(broadcasterId, event){
    const cooldown_ends_at = event?.cooldown_ends_at || null;
    const hype_train_id = event?.id || null;
    const level = event?.level || null;

    let cooldown_end_local = null;
    if (cooldown_ends_at) {
      const end = new Date(cooldown_ends_at);
      cooldown_end_local = end.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
    }

    const payload = {
      broadcaster_id: broadcasterId,
      cooldown_ends_at,
      cooldown_end_local,
      hype_train_id,
      hype_train_level: level,
      last_event_utc: core.nowIso()
    };

    const file = cacheFileFor(broadcasterId);
    writeJSON(file, payload);
    console.log(`[eventsub] cached hype-train cooldown for ${broadcasterId}: ${cooldown_ends_at || 'null'}`);
  }

  function cacheGenericEvent(sub, event) {
    const type = sub?.type || 'unknown';
    writeEventCache(type, {
      subscription: sub,
      event
    });
  }

  function twitchAlertKindForSubscription(subscriptionType) {
    if (subscriptionType === 'channel.follow') return 'follow';
    if (subscriptionType === 'channel.cheer') return 'bits';
    if (subscriptionType === 'channel.raid') return 'raid';
    if (subscriptionType === 'channel.subscribe') return 'sub';
    if (subscriptionType === 'channel.subscription.message') return 'resub';
    if (subscriptionType === 'channel.subscription.gift') return 'giftSub';
    if (subscriptionType === 'channel.channel_points_custom_reward_redemption.add') return 'channelPoints';
    return '';
  }

  function cleanEventText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') {
      if (typeof value.text === 'string') return value.text;
      return '';
    }
    return String(value);
  }

  function normalizeTwitchEventSubToAlert(subscriptionType, event) {
    const cfg = twitchAlertBridgeState.config || DEFAULT_TWITCH_ALERT_CONFIG;
    const kind = twitchAlertKindForSubscription(subscriptionType);
    if (!kind) return null;
    if (cfg.enabled === false || cfg.forward?.[kind] === false) return { _skip: true, reason: 'disabled_by_config', kind, subscriptionType };

    const typeMap = cfg.typeMap || DEFAULT_TWITCH_ALERT_CONFIG.typeMap;
    const base = { source: 'twitch', provider: 'twitch_eventsub', eventsubType: subscriptionType };

    if (kind === 'follow') {
      return { ...base, type: typeMap.follow || 'follow', user: event.user_name || event.user_login || 'Unbekannt', login: event.user_login || '', user_login: event.user_login || '', amount: 1, message: '', title: `${event.user_name || event.user_login || 'Jemand'} folgt jetzt!`, raw: cfg.includeRawEvent === false ? undefined : event };
    }

    if (kind === 'bits') {
      const bits = Number(event.bits || 0);
      if (bits < Number(cfg.minBits || 1)) return { _skip: true, reason: 'below_min_bits', kind, subscriptionType, bits };
      return { ...base, type: typeMap.bits || 'bits', user: event.user_name || event.user_login || 'Anonym', login: event.user_login || '', user_login: event.user_login || '', amount: bits, message: cleanEventText(event.message), title: `${event.user_name || event.user_login || 'Jemand'} cheer't ${bits} Bits!`, raw: cfg.includeRawEvent === false ? undefined : event };
    }

    if (kind === 'raid') {
      const viewers = Number(event.viewers || 0);
      if (viewers < Number(cfg.minRaidViewers || 1)) return { _skip: true, reason: 'below_min_raid_viewers', kind, subscriptionType, viewers };
      return { ...base, type: typeMap.raid || 'raid', user: event.from_broadcaster_user_name || event.from_broadcaster_user_login || 'Unbekannt', login: event.from_broadcaster_user_login || '', user_login: event.from_broadcaster_user_login || '', amount: viewers, message: '', title: `${event.from_broadcaster_user_name || event.from_broadcaster_user_login || 'Jemand'} raidt mit ${viewers}!`, raw: cfg.includeRawEvent === false ? undefined : event };
    }

    if (kind === 'sub') {
      const isGift = event.is_gift === true || event.is_gift === 'true' || event.is_gift === 1 || event.is_gift === '1';
      if (isGift && cfg.forward?.giftedSubReceived === false) {
        return { _skip: true, reason: 'gifted_sub_received_disabled', kind: 'giftedSubReceived', subscriptionType };
      }
      const type = isGift ? (typeMap.giftedSubReceived || 'gifted_sub_received') : (typeMap.sub || 'sub');
      const label = event.user_name || event.user_login || 'Unbekannt';
      return {
        ...base,
        type,
        user: label,
        login: event.user_login || '',
        user_login: event.user_login || '',
        amount: 1,
        message: event.tier ? `Tier ${event.tier}` : '',
        title: isGift ? `${label} hat einen geschenkten Sub erhalten!` : `${label} ist jetzt Sub!`,
        tier: event.tier || '',
        is_gift: isGift,
        raw: cfg.includeRawEvent === false ? undefined : event
      };
    }

    if (kind === 'resub') {
      const months = Number(event.cumulative_months || event.streak_months || 1);
      return {
        ...base,
        type: typeMap.resub || 'resub',
        user: event.user_name || event.user_login || 'Unbekannt',
        login: event.user_login || '',
        user_login: event.user_login || '',
        amount: months,
        message: cleanEventText(event.message),
        title: `${event.user_name || event.user_login || 'Jemand'} ist ${months} Monate Sub!`,
        tier: event.tier || '',
        cumulative_months: Number(event.cumulative_months || 0),
        streak_months: Number(event.streak_months || 0),
        raw: cfg.includeRawEvent === false ? undefined : event
      };
    }

    if (kind === 'giftSub') {
      const total = Number(event.total || 1) || 1;
      const userName = event.is_anonymous ? 'Anonym' : (event.user_name || event.user_login || 'Unbekannt');
      const giftType = total >= 5 ? (typeMap.giftBomb || 'gift_bomb') : (typeMap.giftSub || 'gift_sub');
      const forwardKey = total >= 5 ? 'giftBomb' : 'giftSub';
      if (cfg.forward?.[forwardKey] === false) return { _skip: true, reason: `${forwardKey}_disabled`, kind: forwardKey, subscriptionType, total };
      return {
        ...base,
        type: giftType,
        user: userName,
        login: event.is_anonymous ? '' : (event.user_login || ''),
        user_login: event.is_anonymous ? '' : (event.user_login || ''),
        amount: total,
        quantity: total,
        message: event.tier ? `Tier ${event.tier}` : '',
        title: `${userName} verschenkt ${total} Sub${total === 1 ? '' : 's'}!`,
        tier: event.tier || '',
        total,
        cumulative_total: Number(event.cumulative_total || 0),
        is_anonymous: event.is_anonymous === true || event.is_anonymous === 'true',
        raw: cfg.includeRawEvent === false ? undefined : event
      };
    }

    if (kind === 'channelPoints') {
      const rewardTitle = event.reward?.title || '';
      const ignored = Array.isArray(cfg.ignoredRewardTitles) ? cfg.ignoredRewardTitles.map(x => String(x).toLowerCase()) : [];
      if (ignored.includes(String(rewardTitle).toLowerCase())) return { _skip: true, reason: 'ignored_reward', kind, subscriptionType, rewardTitle };
      return { ...base, type: typeMap.channelPoints || 'channel_points', user: event.user_name || event.user_login || 'Unbekannt', login: event.user_login || '', user_login: event.user_login || '', amount: Number(event.reward?.cost || 0), message: cleanEventText(event.user_input), title: rewardTitle || 'Kanalpunkte eingelöst', raw: cfg.includeRawEvent === false ? undefined : event };
    }

    return null;
  }

  async function forwardAlertPayloadToAlertSystem(alertPayload, subscriptionType) {
    if (!alertPayload || alertPayload._skip) {
      return forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType);
    }

    const bufferConfig = getTwitchSubMessageBufferConfig();
    if (!bufferConfig.enabled) {
      return forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType);
    }

    cleanupSubMessageBufferMaps();

    if (isSubscriptionMessageAlert(alertPayload, subscriptionType)) {
      const login = normalizeAlertBridgeLogin(alertPayload);
      if (login) {
        const replaced = clearPendingSubscribeAlert(login, 'sub_message_replaced_buffered_subscribe');
        recentTwitchSubscriptionMessages.set(login, {
          createdAt: Date.now(),
          expiresAt: Date.now() + bufferConfig.delayMs,
          subscriptionType,
          alertType: alertPayload.type || '',
          eventId: alertPayloadEventId(alertPayload)
        });
        if (replaced) {
          rememberTwitchAlertBridge({
            action: 'buffer_replaced',
            reason: 'subscription_message_wins',
            subscriptionType,
            replacedSubscriptionType: replaced.subscriptionType,
            alertType: alertPayload.type || '',
            user: alertPayload.user || login,
            login,
            delayMs: bufferConfig.delayMs
          });
        }
      }
      return forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType);
    }

    if (isBufferableSubscribeAlert(alertPayload, subscriptionType)) {
      const login = normalizeAlertBridgeLogin(alertPayload);
      if (!login) {
        return forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType);
      }

      const recentMessage = recentTwitchSubscriptionMessages.get(login);
      if (recentMessage && Number(recentMessage.expiresAt || 0) > Date.now()) {
        twitchAlertBridgeState.skipped++;
        rememberTwitchAlertBridge({
          action: 'skipped',
          reason: 'sub_message_already_forwarded',
          subscriptionType,
          alertType: alertPayload.type || '',
          user: alertPayload.user || login,
          login,
          matchedSubscriptionType: recentMessage.subscriptionType,
          matchedEventId: recentMessage.eventId || '',
          delayMs: bufferConfig.delayMs
        });
        return { ok: true, skipped: true, reason: 'sub_message_already_forwarded', delayMs: bufferConfig.delayMs };
      }

      clearPendingSubscribeAlert(login, 'buffered_subscribe_replaced_by_new_subscribe');

      const eventId = alertPayloadEventId(alertPayload);
      const createdAt = Date.now();
      const record = {
        alertPayload: { ...alertPayload },
        subscriptionType,
        eventId,
        createdAt,
        expiresAt: createdAt + bufferConfig.delayMs,
        timer: null
      };

      record.timer = setTimeout(async () => {
        const current = pendingTwitchSubscribeAlerts.get(login);
        if (current !== record) return;

        pendingTwitchSubscribeAlerts.delete(login);
        rememberTwitchAlertBridge({
          action: 'buffer_flushed',
          reason: 'no_subscription_message_within_delay',
          subscriptionType,
          alertType: alertPayload.type || '',
          user: alertPayload.user || login,
          login,
          eventId,
          delayMs: bufferConfig.delayMs
        });

        try {
          await forwardAlertPayloadToAlertSystemNow(record.alertPayload, subscriptionType);
        } catch (e) {
          twitchAlertBridgeState.failed++;
          twitchAlertBridgeState.lastError = e?.message || String(e);
          rememberTwitchAlertBridge({ action: 'failed', subscriptionType, login, error: twitchAlertBridgeState.lastError });
        }
      }, bufferConfig.delayMs);

      if (record.timer && typeof record.timer.unref === 'function') record.timer.unref();

      pendingTwitchSubscribeAlerts.set(login, record);
      rememberTwitchAlertBridge({
        action: 'buffered',
        reason: 'waiting_for_subscription_message',
        subscriptionType,
        alertType: alertPayload.type || '',
        user: alertPayload.user || login,
        login,
        eventId,
        delayMs: bufferConfig.delayMs
      });

      return { ok: true, buffered: true, reason: 'waiting_for_subscription_message', delayMs: bufferConfig.delayMs };
    }

    return forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType);
  }

  async function forwardAlertPayloadToAlertSystemNow(alertPayload, subscriptionType) {
    const cfg = twitchAlertBridgeState.config || DEFAULT_TWITCH_ALERT_CONFIG;
    if (!alertPayload) return { ok: false, error: 'empty_alert_payload' };
    if (alertPayload._skip) {
      twitchAlertBridgeState.skipped++;
      rememberTwitchAlertBridge({ action: 'skipped', subscriptionType, reason: alertPayload.reason, kind: alertPayload.kind });
      return { ok: true, skipped: true, reason: alertPayload.reason };
    }

    const targetUrl = cfg.enqueueUrl || DEFAULT_TWITCH_ALERT_CONFIG.enqueueUrl;
    const body = { ...alertPayload };
    try {
      const response = await fetch(targetUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
      if (!response.ok || !data?.ok) {
        twitchAlertBridgeState.failed++;
        twitchAlertBridgeState.lastError = `HTTP ${response.status}: ${text}`.slice(0, 500);
        rememberTwitchAlertBridge({ action: 'failed', subscriptionType, targetUrl, status: response.status, error: twitchAlertBridgeState.lastError });
        return { ok: false, status: response.status, data };
      }
      twitchAlertBridgeState.forwarded++;
      twitchAlertBridgeState.lastForwardedAt = core.nowIso();
      twitchAlertBridgeState.lastError = '';
      rememberTwitchAlertBridge({ action: 'forwarded', subscriptionType, targetUrl, alertType: body.type, user: body.user, amount: body.amount, eventUid: data.eventUid || null });
      return { ok: true, status: response.status, data };
    } catch (e) {
      twitchAlertBridgeState.failed++;
      twitchAlertBridgeState.lastError = e?.message || String(e);
      rememberTwitchAlertBridge({ action: 'failed', subscriptionType, targetUrl, error: twitchAlertBridgeState.lastError });
      return { ok: false, error: twitchAlertBridgeState.lastError };
    }
  }

  
function normalizeTwitchEventSubToLoyaltyEvent(subscriptionType, event, meta = {}, subscription = {}) {
    const messageId = meta.message_id || meta.messageId || '';
    const base = {
      eventUid: messageId || `${subscriptionType}:${subscription?.id || ''}:${Date.now()}`,
      provider: 'twitch_eventsub',
      sourceType: subscriptionType,
      metadata: {
        subscriptionId: subscription?.id || '',
        messageId,
        messageTimestamp: meta.message_timestamp || ''
      }
    };

    if (subscriptionType === 'channel.follow') {
      return { ...base, eventType: 'follow', login: event.user_login || '', displayName: event.user_name || event.user_login || '', amount: 1, raw: event };
    }

    if (subscriptionType === 'channel.cheer') {
      return { ...base, eventType: 'cheer', login: event.user_login || '', displayName: event.user_name || event.user_login || '', amount: Number(event.bits || 0), bits: Number(event.bits || 0), raw: event };
    }

    if (subscriptionType === 'channel.raid') {
      return { ...base, eventType: 'raid', login: event.from_broadcaster_user_login || '', displayName: event.from_broadcaster_user_name || event.from_broadcaster_user_login || '', amount: Number(event.viewers || 0), viewers: Number(event.viewers || 0), raw: event };
    }

    if (subscriptionType === 'channel.subscribe') {
      const isGift = event.is_gift === true || event.is_gift === 'true' || event.is_gift === 1 || event.is_gift === '1';
      return { ...base, eventType: isGift ? 'gifted_sub_received' : 'subscribe', login: event.user_login || '', displayName: event.user_name || event.user_login || '', amount: 1, tier: event.tier || '', raw: event, metadata: { ...base.metadata, isGift } };
    }

    if (subscriptionType === 'channel.subscription.message') {
      return { ...base, eventType: 'resub', login: event.user_login || '', displayName: event.user_name || event.user_login || '', amount: Number(event.cumulative_months || event.streak_months || 1), months: Number(event.cumulative_months || event.streak_months || 1), cumulativeMonths: Number(event.cumulative_months || 0), streakMonths: Number(event.streak_months || 0), tier: event.tier || '', raw: event };
    }

    if (subscriptionType === 'channel.subscription.gift') {
      const total = Number(event.total || 1) || 1;
      return { ...base, eventType: total >= 5 ? 'gift_bomb' : 'gift_sub', login: event.is_anonymous ? '' : (event.user_login || ''), displayName: event.is_anonymous ? 'Anonym' : (event.user_name || event.user_login || ''), amount: total, quantity: total, total, tier: event.tier || '', raw: event, metadata: { ...base.metadata, isAnonymous: event.is_anonymous === true || event.is_anonymous === 'true' } };
    }

    return null;
  }

  async function forwardLoyaltyPayloadToLoyaltySystem(loyaltyPayload, subscriptionType) {
    const cfg = twitchAlertBridgeState.config || DEFAULT_TWITCH_ALERT_CONFIG;
    const loyaltyCfg = cfg.loyaltyForward || DEFAULT_TWITCH_ALERT_CONFIG.loyaltyForward;
    if (!loyaltyPayload) return { ok: true, skipped: true, reason: 'unsupported_loyalty_event' };
    if (loyaltyCfg?.enabled === false) return { ok: true, skipped: true, reason: 'loyalty_forward_disabled' };

    const targetUrl = loyaltyCfg?.url || DEFAULT_TWITCH_ALERT_CONFIG.loyaltyForward.url;
    const body = { ...loyaltyPayload };
    if (loyaltyCfg?.includeRawEvent === false) delete body.raw;

    try {
      const response = await fetch(targetUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
      if (!response.ok || !data?.ok) {
        rememberTwitchAlertBridge({ action: 'loyalty_failed', subscriptionType, targetUrl, status: response.status, error: text.slice(0, 500) });
        return { ok: false, status: response.status, data };
      }
      rememberTwitchAlertBridge({
        action: data.skipped ? 'loyalty_skipped' : 'loyalty_forwarded',
        subscriptionType,
        targetUrl,
        eventType: body.eventType,
        user: body.displayName || body.login,
        points: data?.event?.points || 0,
        reason: data.reason || ''
      });
      return { ok: true, status: response.status, data };
    } catch (e) {
      rememberTwitchAlertBridge({ action: 'loyalty_failed', subscriptionType, targetUrl, error: e?.message || String(e) });
      return { ok: false, error: e?.message || String(e) };
    }
  }


function buildFakeTwitchAlertEvent(kind, query) {
    const user = (query.user || query.login || 'TestUser').toString();
    const display = (query.display || query.user || 'TestUser').toString();
    const amount = Number(query.amount || query.bits || query.viewers || 50);
    const eventId = query.eventId || query.eventUid || '';
    const boolParam = (value, fallback = false) => {
      if (value === undefined || value === null || value === '') return fallback;
      if (value === true || value === 1) return true;
      const s = String(value).trim().toLowerCase();
      if (['1', 'true', 'yes', 'ja', 'on'].includes(s)) return true;
      if (['0', 'false', 'no', 'nein', 'off'].includes(s)) return false;
      return fallback;
    };
    const positiveIntParam = (value, fallback) => {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    };

    if (kind === 'follow') return { subscriptionType: 'channel.follow', event: { user_login: user.toLowerCase(), user_name: display } };
    if (kind === 'raid') return { subscriptionType: 'channel.raid', event: { from_broadcaster_user_login: user.toLowerCase(), from_broadcaster_user_name: display, viewers: amount } };

    if (kind === 'sub') {
      const isGift = boolParam(query.is_gift ?? query.isGift ?? query.gifted, false);
      return { subscriptionType: 'channel.subscribe', event: { user_login: user.toLowerCase(), user_name: display, tier: query.tier || '1000', is_gift: isGift } };
    }

    if (kind === 'giftedSubReceived' || kind === 'gifted_sub_received') {
      const receiverLogin = (query.recipientLogin || query.receiverLogin || query.targetLogin || query.login || user).toString();
      const receiverDisplay = (query.recipientDisplayName || query.receiverDisplayName || query.targetDisplayName || query.display || display).toString();
      return { subscriptionType: 'channel.subscribe', event: { user_login: receiverLogin.toLowerCase(), user_name: receiverDisplay, tier: query.tier || '1000', is_gift: true } };
    }

    if (kind === 'resub') return { subscriptionType: 'channel.subscription.message', event: { user_login: user.toLowerCase(), user_name: display, tier: query.tier || '1000', cumulative_months: amount || 3, streak_months: Number(query.streak_months || 0), message: { text: query.message || 'Resub Test' } } };

    if (kind === 'giftSub' || kind === 'gift_sub' || kind === 'giftBomb' || kind === 'gift_bomb') {
      const fallbackTotal = kind === 'giftBomb' || kind === 'gift_bomb' ? 50 : 1;
      const total = positiveIntParam(query.total ?? query.quantity ?? query.count ?? query.amount, fallbackTotal);
      const anonymous = boolParam(query.is_anonymous ?? query.isAnonymous ?? query.anonymous, false);
      return {
        subscriptionType: 'channel.subscription.gift',
        event: {
          user_login: anonymous ? null : user.toLowerCase(),
          user_name: anonymous ? null : display,
          total,
          tier: query.tier || '1000',
          cumulative_total: Number(query.cumulative_total || query.cumulativeTotal || 0),
          is_anonymous: anonymous
        }
      };
    }

    if (kind === 'channelPoints' || kind === 'channel_points') return { subscriptionType: 'channel.channel_points_custom_reward_redemption.add', event: { user_login: user.toLowerCase(), user_name: display, user_input: query.message || '', reward: { title: query.reward || 'Test Reward', cost: amount || 1000 } } };
    return { subscriptionType: 'channel.cheer', event: { user_login: user.toLowerCase(), user_name: display, bits: amount, message: query.message || 'Bits Test' } };
  }

  function scheduleEventSubReconnect(reason) {
    if (isShuttingDown) return;
    if (reconnectTimer) return;

    const delay = eventSubRetryDelayMs;
    eventSubRetryDelayMs = Math.min(eventSubRetryDelayMs * 2, 60000);
    eventSubState.retryDelayMs = eventSubRetryDelayMs;
    eventSubState.reconnectTimerActive = true;
    rememberEventSubState({ action: 'reconnect_scheduled', reason: reason || 'unknown', delayMs: delay });

    console.warn(`[eventsub] reconnect scheduled in ${delay}ms (${reason || 'unknown'})`);

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      eventSubState.reconnectTimerActive = false;
      connectEventSubWebSocket(EVENTSUB_NORMAL_URL, false);
    }, delay);
  }

  function closeSocketQuietly(socket, reason = 'normal') {
    if (!socket) return;

    try {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, reason);
      } else {
        socket.terminate();
      }
    } catch {}
  }

  function connectEventSubWebSocket(url = EVENTSUB_NORMAL_URL, isTwitchReconnect = false) {
    if (isShuttingDown) return;
    if (!url) url = EVENTSUB_NORMAL_URL;

    if (!isTwitchReconnect && eventSubConnecting) {
      console.log('[eventsub] connect skipped: already connecting');
      return;
    }

    if (!isTwitchReconnect && ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.log('[eventsub] connect skipped: already connected/connecting');
      return;
    }

    if (!isTwitchReconnect) {
      eventSubConnecting = true;
    }
    eventSubState.connecting = Boolean(eventSubConnecting);
    eventSubState.url = url;
    rememberEventSubState({ action: isTwitchReconnect ? 'connect_reconnect_url' : 'connect', url });

    console.log('[eventsub] connecting:', url);

    const socket = new WebSocket(url);

    if (isTwitchReconnect) {
      reconnectCandidateWs = socket;
    } else {
      ws = socket;
    }

    socket.on('open', () => {
      eventSubState.lastOpenAt = core.nowIso();
      rememberEventSubState({ action: 'ws_open', reconnect: Boolean(isTwitchReconnect) });
      console.log('[eventsub] ws open');
    });

    socket.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString('utf-8'));
      } catch {
        return;
      }

      const meta = msg.metadata || {};
      const payload = msg.payload || {};
      const messageType = meta.message_type;

      if (messageType === 'session_welcome') {
        const sessionId = payload?.session?.id;

        console.log('[eventsub] session_welcome sessionId:', sessionId);

        eventSubState.lastSessionId = sessionId || null;
        eventSubState.lastWelcomeAt = core.nowIso();
        eventSubState.lastError = '';
        eventSubState.lastErrorAt = null;
        rememberEventSubState({ action: 'session_welcome', sessionId: sessionId || null, reconnect: Boolean(isTwitchReconnect) });

        eventSubConnecting = false;
        eventSubRetryDelayMs = 2500;
        eventSubState.connecting = false;
        eventSubState.retryDelayMs = eventSubRetryDelayMs;

        if (isTwitchReconnect) {
          const oldWs = ws;

          ws = socket;
          reconnectCandidateWs = null;

          if (oldWs && oldWs !== socket) {
            closeSocketQuietly(oldWs, 'replaced-by-twitch-reconnect');
          }

          console.log('[eventsub] reconnect completed, old socket replaced.');
          return;
        }

        const broadcasterId = DEFAULT_BROADCASTER_ID;
        if (!broadcasterId) {
          console.warn('[eventsub] TWITCH_BROADCASTER_ID nicht gesetzt -> kein Auto-Subscribe.');
          return;
        }

        await bootstrapEventSubSubscriptions(sessionId, broadcasterId);
        return;
      }

      if (messageType === 'session_reconnect') {
        const reconnectUrl = payload?.session?.reconnect_url || null;

        eventSubState.lastReconnectAt = core.nowIso();
        eventSubState.lastReconnectUrl = reconnectUrl;
        rememberEventSubState({ action: 'session_reconnect', hasReconnectUrl: Boolean(reconnectUrl) });

        console.log('[eventsub] session_reconnect -> reconnect_url:', reconnectUrl);

        if (!reconnectUrl) {
          console.warn('[eventsub] session_reconnect ohne reconnect_url -> normal reconnect geplant');
          scheduleEventSubReconnect('missing-reconnect-url');
          return;
        }

        if (reconnectCandidateWs && (
          reconnectCandidateWs.readyState === WebSocket.OPEN ||
          reconnectCandidateWs.readyState === WebSocket.CONNECTING
        )) {
          console.log('[eventsub] reconnect candidate already active');
          return;
        }

        connectEventSubWebSocket(reconnectUrl, true);
        return;
      }

      if (messageType === 'notification') {
        const sub = payload?.subscription || {};
        const event = payload?.event || {};

        eventSubState.lastNotificationAt = core.nowIso();
        eventSubState.lastNotificationType = sub.type || '';
        rememberEventSubState({ action: 'notification', type: sub.type || '', subscriptionId: sub.id || null });

        cacheGenericEvent(sub, event);

        try {
          const loyaltyPayload = normalizeTwitchEventSubToLoyaltyEvent(sub.type, event, meta, sub);
          if (loyaltyPayload) await forwardLoyaltyPayloadToLoyaltySystem(loyaltyPayload, sub.type);
        } catch (e) {
          rememberTwitchAlertBridge({ action: 'loyalty_failed', subscriptionType: sub.type, error: e?.message || String(e) });
          console.warn('[eventsub-loyalty] forward failed:', e?.message || e);
        }

        try {
          const alertPayload = normalizeTwitchEventSubToAlert(sub.type, event);
          if (alertPayload) await forwardAlertPayloadToAlertSystem(alertPayload, sub.type);
        } catch (e) {
          twitchAlertBridgeState.failed++;
          twitchAlertBridgeState.lastError = e?.message || String(e);
          rememberTwitchAlertBridge({ action: 'failed', subscriptionType: sub.type, error: twitchAlertBridgeState.lastError });
          console.warn('[eventsub-alerts] forward failed:', twitchAlertBridgeState.lastError);
        }

        if (sub.type === 'channel.hype_train.end') {
          const broadcasterId = (event?.broadcaster_user_id || DEFAULT_BROADCASTER_ID || '').toString();
          if (broadcasterId) writeHypetrainCacheFromEndEvent(broadcasterId, event);
        }

        return;
      }

      if (messageType === 'revocation') {
        eventSubState.lastRevocationAt = core.nowIso();
        eventSubState.lastRevocation = payload?.subscription || {};
        rememberEventSubState({ action: 'revocation', subscription: payload?.subscription || {} });
        console.warn('[eventsub] subscription revoked:', JSON.stringify(payload?.subscription || {}));
        return;
      }
    });

    socket.on('close', (code, reason) => {
      const reasonText = reason?.toString?.() || '';

      eventSubState.lastCloseAt = core.nowIso();
      eventSubState.lastCloseCode = code;
      eventSubState.lastCloseReason = reasonText;
      rememberEventSubState({ action: 'ws_close', code, reason: reasonText, reconnect: Boolean(isTwitchReconnect) });

      console.warn('[eventsub] ws close:', code, reasonText);

      if (socket === reconnectCandidateWs) {
        reconnectCandidateWs = null;
      }

      if (socket === ws) {
        ws = null;
        eventSubConnecting = false;
        eventSubState.connecting = false;
      }

      if (isShuttingDown) return;

      if (isTwitchReconnect) {
        scheduleEventSubReconnect(`twitch-reconnect-failed-${code}`);
        return;
      }

      if (code === 1000 && reasonText === 'replaced-by-twitch-reconnect') {
        return;
      }

      scheduleEventSubReconnect(`close-${code}`);
    });

    socket.on('error', (err) => {
      eventSubState.lastErrorAt = core.nowIso();
      eventSubState.lastError = err?.message || String(err);
      rememberEventSubState({ action: 'ws_error', error: eventSubState.lastError });
      console.warn('[eventsub] ws error:', err?.message || err);
    });
  }

  // EventSub WS direkt starten
  connectEventSubWebSocket(EVENTSUB_NORMAL_URL, false);

  const handleEventSubStatus = async (req, res) => {
    const refreshRaw = String(req.query.refresh || '').toLowerCase();
    const refresh = refreshRaw === '1' || refreshRaw === 'true' || refreshRaw === 'yes';
    const snapshot = getEventSubStatusSnapshot();
    if (!refresh) {
      res.json(snapshot);
      return;
    }

    try {
      const subscriptions = await listEventSubSubscriptions();
      res.json({ ...getEventSubStatusSnapshot(), helixSubscriptions: subscriptions });
    } catch (e) {
      res.status(500).json({ ...snapshot, ok: false, error: e?.message || String(e) });
    }
  };

  routes.registerGet(app, ['/eventsub/status', '/twitch/eventsub/status', '/api/twitch/eventsub/status'], handleEventSubStatus);

  const handleEventSubReconcile = async (req, res) => {
    try {
      const sessionId = eventSubState.lastSessionId || '';
      const broadcasterId = DEFAULT_BROADCASTER_ID || '';
      if (!sessionId || !(ws && ws.readyState === WebSocket.OPEN)) {
        res.status(409).json({ ok: false, error: 'eventsub_websocket_not_ready', status: getEventSubStatusSnapshot() });
        return;
      }
      if (!broadcasterId) {
        res.status(400).json({ ok: false, error: 'missing_broadcaster_id', status: getEventSubStatusSnapshot() });
        return;
      }

      const before = await listEventSubSubscriptions();
      const activeKnownBefore = rebuildKnownEventSubSubscriptions(before, sessionId);
      rememberEventSubState({ action: 'manual_reconcile_started', sessionId, broadcasterId, activeKnownBefore, totalListed: before.length });

      for (const config of eventSubConfigs) {
        await createEventSubSubscription(config, sessionId, broadcasterId);
      }

      const after = await listEventSubSubscriptions();
      const activeKnownAfter = rebuildKnownEventSubSubscriptions(after, sessionId);
      rememberEventSubState({ action: 'manual_reconcile_done', sessionId, broadcasterId, activeKnownAfter, totalListed: after.length });

      res.json({
        ok: true,
        action: 'reconcile',
        sessionId,
        broadcasterId,
        activeKnownBefore,
        activeKnownAfter,
        totalBefore: before.length,
        totalAfter: after.length,
        status: getEventSubStatusSnapshot(),
        helixSubscriptions: after
      });
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || String(e));
      eventSubState.lastErrorAt = core.nowIso();
      eventSubState.lastError = `[reconcile] ${msg}`.slice(0, 500);
      rememberEventSubState({ action: 'manual_reconcile_failed', error: eventSubState.lastError });
      res.status(500).json({ ok: false, error: eventSubState.lastError, status: getEventSubStatusSnapshot() });
    }
  };

  routes.registerGet(app, ['/eventsub/reconcile', '/twitch/eventsub/reconcile', '/api/twitch/eventsub/reconcile'], handleEventSubReconcile);

  const handleEventSubCleanupDisconnected = async (req, res) => {
    try {
      const dryRunRaw = String(req.query.dryRun || req.query.dryrun || '').toLowerCase();
      const dryRun = dryRunRaw === '1' || dryRunRaw === 'true' || dryRunRaw === 'yes';
      const subscriptions = await listEventSubSubscriptions();
      const targets = subscriptions.filter(sub => sub?.id && String(sub.status || '') === 'websocket_disconnected');
      const deleted = [];
      const errors = [];

      for (const sub of targets) {
        if (dryRun) {
          deleted.push({ id: sub.id, type: sub.type, dryRun: true });
          continue;
        }
        try {
          await helixDelete('/eventsub/subscriptions', { id: sub.id });
          deleted.push({ id: sub.id, type: sub.type });
        } catch (e) {
          errors.push({ id: sub.id, type: sub.type, error: e?.response?.data || e?.message || String(e) });
        }
      }

      const after = dryRun ? subscriptions : await listEventSubSubscriptions();
      rebuildKnownEventSubSubscriptions(after, eventSubState.lastSessionId || '');
      rememberEventSubState({ action: 'cleanup_disconnected', dryRun, targetCount: targets.length, deletedCount: deleted.length, errorCount: errors.length });

      res.json({
        ok: errors.length === 0,
        action: 'cleanup_disconnected',
        dryRun,
        targetCount: targets.length,
        deletedCount: deleted.length,
        errorCount: errors.length,
        deleted,
        errors,
        status: getEventSubStatusSnapshot(),
        helixSubscriptions: after
      });
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || String(e));
      res.status(500).json({ ok: false, error: msg, status: getEventSubStatusSnapshot() });
    }
  };

  routes.registerGet(app, ['/eventsub/cleanup-disconnected', '/twitch/eventsub/cleanup-disconnected', '/api/twitch/eventsub/cleanup-disconnected'], handleEventSubCleanupDisconnected);

  // optional: manueller reconnect
  const handleEventSubReconnect = (req, res) => {
    try {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      closeSocketQuietly(reconnectCandidateWs, 'manual-reconnect');
      reconnectCandidateWs = null;

      closeSocketQuietly(ws, 'manual-reconnect');
      ws = null;

      eventSubConnecting = false;
      eventSubRetryDelayMs = 2500;
      eventSubState.connecting = false;
      eventSubState.retryDelayMs = eventSubRetryDelayMs;
      eventSubState.lastReconnectAt = core.nowIso();
      eventSubState.lastReconnectUrl = EVENTSUB_NORMAL_URL;
      rememberEventSubState({ action: 'manual_reconnect_requested' });

      setTimeout(() => {
        connectEventSubWebSocket(EVENTSUB_NORMAL_URL, false);
      }, 1000);

      res.json({ ok:true, msg:'eventsub reconnect requested' });
    } catch (e) {
      res.status(500).json({ ok:false, error: e?.message || String(e) });
    }
  };

  routes.registerGet(app, ['/eventsub/reconnect', '/twitch/eventsub/reconnect', '/api/twitch/eventsub/reconnect'], handleEventSubReconnect);

  console.log('[twitch] OAuth + Helix-Routen aktiv (modular, erweitert)');
};

module.exports.resolveUserByLogin = async function resolveUserByLogin(login) {
  if (typeof sharedApi.resolveUserByLogin !== 'function') {
    throw new Error('twitch_patched resolveUserByLogin not initialized yet');
  }
  return await sharedApi.resolveUserByLogin(login);
};

module.exports.getStoredBotToken = function getStoredBotToken() {
  if (typeof sharedApi.getStoredBotToken !== 'function') {
    throw new Error('twitch resolve bot token helper not initialized yet');
  }
  return sharedApi.getStoredBotToken();
};

module.exports.getBotAccessTokenWithRefresh = async function getBotAccessTokenWithRefresh() {
  if (typeof sharedApi.getBotAccessTokenWithRefresh !== 'function') {
    throw new Error('twitch bot access token helper not initialized yet');
  }
  return await sharedApi.getBotAccessTokenWithRefresh();
};

module.exports.validateStoredUserToken = async function validateStoredUserTokenExport() {
  if (typeof sharedApi.validateStoredUserToken !== 'function') {
    throw new Error('twitch user token validate helper not initialized yet');
  }
  return await sharedApi.validateStoredUserToken();
};


module.exports.createClipForBroadcaster = async function createClipForBroadcaster(broadcasterId, options = {}) {
  if (typeof sharedApi.createClipForBroadcaster !== 'function') {
    throw new Error('twitch create clip helper not initialized yet');
  }
  return await sharedApi.createClipForBroadcaster(broadcasterId, options);
};

module.exports.getClipById = async function getClipById(clipId) {
  if (typeof sharedApi.getClipById !== 'function') {
    throw new Error('twitch get clip helper not initialized yet');
  }
  return await sharedApi.getClipById(clipId);
};
