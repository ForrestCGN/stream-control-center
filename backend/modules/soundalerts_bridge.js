'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const core = require('./helpers/helper_core');
const cfg = require('./helpers/helper_config');
const media = require('./helpers/helper_media');
const sqlite = require('./sqlite_core');

const MODULE_NAME = 'soundalerts_bridge';
const VERSION = '0.1.0';
const CONFIG_FILE = 'soundalerts_bridge.json';
const SCHEMA_MODULE = 'soundalerts_bridge';
const SCHEMA_VERSION = 1;

const DEFAULT_CONFIG = {
  enabled: true,
  bot: {
    login: 'soundalerts',
    userId: '216527497',
    displayName: 'SoundAlerts',
    validateUserinfo: true
  },
  parser: {
    language: 'de',
    allowQuotedSoundNames: true,
    allowUnquotedSoundNames: true
  },
  soundSystem: {
    playUrl: 'http://127.0.0.1:8080/api/sound/play',
    soundsBaseDir: 'htdocs/assets/sounds',
    allowedExtensions: ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4'],
    defaultCategory: 'soundalerts',
    defaultPriority: 70,
    audioOutputTarget: 'device',
    videoOutputTarget: 'overlay',
    defaultVolume: 100
  },
  chatMessages: {
    enabled: true,
    onMissingFile: true,
    onUnmatched: false,
    cooldownMs: 15000,
    missingFileTemplate: '⚠ SoundAlert "{soundAlertName}" ist eingerichtet, aber die lokale Datei fehlt. Bitte später im Dashboard prüfen.'
  },
  dedupe: {
    enabled: true,
    windowMs: 3000
  },
  rules: [
    {
      id: 'fahrstuhl_sound',
      enabled: true,
      soundAlertName: 'Fahrstuhl Sound',
      label: 'Fahrstuhl Sound',
      file: 'soundalerts/video/3cgn.mp4',
      mediaType: 'video',
      priority: 70,
      volume: 100
    }
  ]
};

const state = {
  module: MODULE_NAME,
  version: VERSION,
  loadedAt: core.nowIso(),
  configPath: '',
  configOk: false,
  configError: '',
  ws: null,
  wsConnected: false,
  wsLastError: '',
  wsReconnectTimer: null,
  recentKeys: new Map(),
  lastChatMessageAtByKey: new Map(),
  stats: {
    seen: 0,
    parsed: 0,
    ignored: 0,
    matched: 0,
    unmatched: 0,
    queued: 0,
    failed: 0,
    fileMissing: 0,
    duplicate: 0,
    chatMessagesSent: 0,
    chatMessagesFailed: 0
  },
  lastEvent: null,
  recent: []
};

let config = DEFAULT_CONFIG;
let twitchAuth = null;
let envRef = process.env;

function mergePlain(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = mergePlain(out[key], value);
    } else if (Array.isArray(value)) {
      out[key] = value.slice();
    } else {
      out[key] = value;
    }
  }
  return out;
}

function normalizeLogin(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}

function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function ensureSchema() {
  if (!sqlite.isInitialized()) return false;
  sqlite.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS soundalerts_bridge_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_uid TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          bot_login TEXT NOT NULL DEFAULT '',
          bot_display_name TEXT NOT NULL DEFAULT '',
          trigger_user_display TEXT NOT NULL DEFAULT '',
          trigger_user_login TEXT NOT NULL DEFAULT '',
          soundalert_name TEXT NOT NULL DEFAULT '',
          amount INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT '',
          raw_text TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT '',
          matched_rule_id TEXT NOT NULL DEFAULT '',
          sound_request_id TEXT NOT NULL DEFAULT '',
          media_type TEXT NOT NULL DEFAULT '',
          file TEXT NOT NULL DEFAULT '',
          error TEXT NOT NULL DEFAULT '',
          meta_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_soundalerts_bridge_events_created_at ON soundalerts_bridge_events(created_at);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_soundalerts_bridge_events_soundalert_name ON soundalerts_bridge_events(soundalert_name);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_soundalerts_bridge_events_status ON soundalerts_bridge_events(status);`);
    }
  });
  return true;
}

function loadConfig() {
  const loaded = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true });
  config = mergePlain(DEFAULT_CONFIG, loaded.config || {});
  state.configPath = loaded.path || '';
  state.configOk = !!loaded.ok;
  state.configError = loaded.error || '';
  return config;
}

function publicConfig() {
  return {
    enabled: config.enabled !== false,
    bot: config.bot || {},
    parser: config.parser || {},
    soundSystem: config.soundSystem || {},
    chatMessages: config.chatMessages || {},
    dedupe: config.dedupe || {},
    rules: Array.isArray(config.rules) ? config.rules : []
  };
}

function remember(entry) {
  const item = { at: core.nowIso(), ...entry };
  state.lastEvent = item;
  state.recent.unshift(item);
  state.recent = state.recent.slice(0, 30);
  return item;
}

function insertEvent(event) {
  ensureSchema();
  if (!sqlite.isInitialized()) return null;
  const now = core.nowIso();
  const meta = event.meta && typeof event.meta === 'object' ? event.meta : {};
  const result = sqlite.run(`
    INSERT INTO soundalerts_bridge_events (
      event_uid, created_at, bot_login, bot_display_name, trigger_user_display, trigger_user_login,
      soundalert_name, amount, currency, raw_text, status, matched_rule_id, sound_request_id,
      media_type, file, error, meta_json
    ) VALUES (
      :eventUid, :createdAt, :botLogin, :botDisplayName, :triggerUserDisplay, :triggerUserLogin,
      :soundAlertName, :amount, :currency, :rawText, :status, :matchedRuleId, :soundRequestId,
      :mediaType, :file, :error, :metaJson
    )
  `, {
    eventUid: String(event.eventUid || ''),
    createdAt: now,
    botLogin: String(event.botLogin || ''),
    botDisplayName: String(event.botDisplayName || ''),
    triggerUserDisplay: String(event.triggerUserDisplay || ''),
    triggerUserLogin: String(event.triggerUserLogin || ''),
    soundAlertName: String(event.soundAlertName || ''),
    amount: Number.parseInt(event.amount || 0, 10) || 0,
    currency: String(event.currency || ''),
    rawText: String(event.rawText || ''),
    status: String(event.status || ''),
    matchedRuleId: String(event.matchedRuleId || ''),
    soundRequestId: String(event.soundRequestId || ''),
    mediaType: String(event.mediaType || ''),
    file: String(event.file || ''),
    error: String(event.error || ''),
    metaJson: JSON.stringify(meta)
  });
  return result && result.lastInsertRowid ? Number(result.lastInsertRowid) : null;
}

function parseSoundAlertsText(text) {
  const clean = String(text || '').trim().replace(/\s+/g, ' ');
  if (!clean) return null;

  let m = clean.match(/^(.+?)\s+spielt\s+"([^"]+)"\s+f(?:ü|u)r\s+(\d+)\s+(.+?)!?$/i);
  if (!m) m = clean.match(/^(.+?)\s+spielt\s+(.+?)\s+f(?:ü|u)r\s+(\d+)\s+(.+?)!?$/i);
  if (!m) return null;

  return {
    triggerUserDisplay: String(m[1] || '').trim(),
    triggerUserLogin: '',
    soundAlertName: String(m[2] || '').trim(),
    amount: Number.parseInt(m[3], 10) || 0,
    currency: String(m[4] || '').trim().replace(/!+$/, '').trim(),
    rawText: clean
  };
}

function findRule(soundAlertName) {
  const wanted = normalizeName(soundAlertName);
  const rules = Array.isArray(config.rules) ? config.rules : [];
  return rules.find(rule => rule && rule.enabled !== false && normalizeName(rule.soundAlertName || rule.name || rule.id) === wanted) || null;
}

function resolveFile(rule) {
  const file = String(rule.file || '').trim().replace(/\\/g, '/');
  const soundCfg = config.soundSystem || {};
  const baseDirRaw = String(soundCfg.soundsBaseDir || 'htdocs/assets/sounds');
  const baseDir = path.isAbsolute(baseDirRaw) ? baseDirRaw : cfg.resolveFromRoot(baseDirRaw);
  const allowed = Array.isArray(soundCfg.allowedExtensions) ? soundCfg.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS;
  return media.resolveMediaPath(file, { baseDir, allowedExtensions: allowed });
}

function detectMediaType(rule, resolved) {
  const explicit = String(rule.mediaType || '').trim().toLowerCase();
  if (explicit === 'video' || explicit === 'audio') return explicit;
  const ext = path.extname(String(resolved && resolved.relative || rule.file || '')).toLowerCase();
  if (['.mp4', '.mov', '.mkv'].includes(ext)) return 'video';
  if (ext === '.webm') return 'video';
  return 'audio';
}

function postJson(urlString, payload, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const body = Buffer.from(JSON.stringify(payload || {}), 'utf8');
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length
      },
      timeout: timeoutMs
    }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = raw ? JSON.parse(raw) : {}; } catch (_) { json = { raw }; }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(json.error || json.message || `HTTP ${res.statusCode}`);
          err.response = json;
          reject(err);
          return;
        }
        resolve(json);
      });
    });
    req.on('timeout', () => req.destroy(new Error('sound_system_timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function applyTemplate(template, vars) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => String(vars && vars[key] !== undefined ? vars[key] : ''));
}

function canSendChatNotice(key) {
  const chatCfg = config.chatMessages || {};
  if (chatCfg.enabled === false) return false;
  const cooldown = Math.max(0, Number(chatCfg.cooldownMs || 0));
  if (!cooldown) return true;
  const now = Date.now();
  const last = state.lastChatMessageAtByKey.get(key) || 0;
  if (now - last < cooldown) return false;
  state.lastChatMessageAtByKey.set(key, now);
  return true;
}

async function sendChatNotice(message) {
  const chatCfg = config.chatMessages || {};
  if (chatCfg.enabled === false) return { ok: false, skipped: true, reason: 'disabled' };
  const text = String(message || '').trim();
  if (!text) return { ok: false, skipped: true, reason: 'empty' };

  try {
    if (!twitchAuth || typeof twitchAuth.getBotAccessTokenWithRefresh !== 'function') throw new Error('twitch_auth_unavailable');
    const token = await twitchAuth.getBotAccessTokenWithRefresh();
    if (!token) throw new Error('bot_token_missing');

    const botName = normalizeLogin(envRef.TWITCH_BOT_USERNAME || '');
    const channel = normalizeLogin(envRef.TWITCH_BOT_CHANNEL || '');
    if (!botName || !channel) throw new Error('bot_username_or_channel_missing');

    await new Promise((resolve, reject) => {
      const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        try { socket.terminate(); } catch (_) {}
        reject(new Error('chat_send_timeout'));
      }, 6500);

      function finish(err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { socket.close(1000, 'sent'); } catch (_) {}
        if (err) reject(err); else resolve();
      }

      socket.on('open', () => {
        socket.send(`PASS oauth:${token}`);
        socket.send(`NICK ${botName}`);
        socket.send(`JOIN #${channel}`);
      });

      socket.on('message', raw => {
        const str = raw.toString('utf8');
        if (str.startsWith('PING')) {
          socket.send(str.replace('PING', 'PONG'));
          return;
        }
        if (str.includes('Login authentication failed')) {
          finish(new Error('chat_auth_failed'));
          return;
        }
        if (str.includes(` 366 ${botName} #${channel} `) || str.includes(` JOIN #${channel}`)) {
          socket.send(`PRIVMSG #${channel} :${text}`);
          setTimeout(() => finish(null), 250);
        }
      });
      socket.on('error', finish);
      socket.on('close', () => {
        if (!done) finish(new Error('chat_socket_closed'));
      });
    });

    state.stats.chatMessagesSent++;
    return { ok: true };
  } catch (err) {
    state.stats.chatMessagesFailed++;
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

async function queueSound(parsed, rule, item) {
  const soundCfg = config.soundSystem || {};
  const resolved = resolveFile(rule);
  const mediaType = detectMediaType(rule, resolved);
  const outputTarget = String(rule.outputTarget || (mediaType === 'video' ? soundCfg.videoOutputTarget : soundCfg.audioOutputTarget) || 'device').trim().toLowerCase();

  if (!resolved.ok) {
    state.stats.fileMissing++;
    const error = resolved.error || 'file_missing';
    const row = {
      eventUid: item.id || '',
      botLogin: item.login || '',
      botDisplayName: item.user || '',
      triggerUserDisplay: parsed.triggerUserDisplay,
      triggerUserLogin: parsed.triggerUserLogin || '',
      soundAlertName: parsed.soundAlertName,
      amount: parsed.amount,
      currency: parsed.currency,
      rawText: parsed.rawText,
      status: 'file_missing',
      matchedRuleId: String(rule.id || rule.soundAlertName || ''),
      mediaType,
      file: String(rule.file || ''),
      error,
      meta: { resolved }
    };
    insertEvent(row);
    remember(row);

    const chatCfg = config.chatMessages || {};
    if (chatCfg.onMissingFile !== false && canSendChatNotice(`missing:${normalizeName(parsed.soundAlertName)}`)) {
      const text = applyTemplate(chatCfg.missingFileTemplate || DEFAULT_CONFIG.chatMessages.missingFileTemplate, {
        soundAlertName: parsed.soundAlertName,
        user: parsed.triggerUserDisplay,
        file: String(rule.file || '')
      });
      sendChatNotice(text).catch(() => {});
    }
    return { ok: false, status: 'file_missing', error };
  }

  const payload = {
    file: resolved.relative || rule.file,
    label: String(rule.label || parsed.soundAlertName),
    mediaType,
    category: String(rule.category || soundCfg.defaultCategory || 'soundalerts'),
    priority: Number(rule.priority ?? soundCfg.defaultPriority ?? 70),
    outputTarget,
    volume: Number(rule.volume ?? soundCfg.defaultVolume ?? 100),
    source: 'soundalerts_bridge',
    requestedBy: parsed.triggerUserDisplay,
    meta: {
      soundAlertName: parsed.soundAlertName,
      triggerUserDisplay: parsed.triggerUserDisplay,
      amount: parsed.amount,
      currency: parsed.currency,
      botLogin: item.login || '',
      eventUid: item.id || ''
    }
  };

  const result = await postJson(String(soundCfg.playUrl || DEFAULT_CONFIG.soundSystem.playUrl), payload, 7000);
  const soundRequestId = result && result.item && result.item.requestId ? String(result.item.requestId) : '';
  const row = {
    eventUid: item.id || '',
    botLogin: item.login || '',
    botDisplayName: item.user || '',
    triggerUserDisplay: parsed.triggerUserDisplay,
    triggerUserLogin: parsed.triggerUserLogin || '',
    soundAlertName: parsed.soundAlertName,
    amount: parsed.amount,
    currency: parsed.currency,
    rawText: parsed.rawText,
    status: 'queued',
    matchedRuleId: String(rule.id || rule.soundAlertName || ''),
    soundRequestId,
    mediaType,
    file: String(payload.file || ''),
    meta: { soundResult: result && result.result ? result.result : {} }
  };
  insertEvent(row);
  remember(row);
  state.stats.queued++;
  return { ok: true, status: 'queued', result };
}

async function handleChatItem(item) {
  try {
    state.stats.seen++;
    if (!config || config.enabled === false) return { ok: false, ignored: true, reason: 'disabled' };
    const botLogin = normalizeLogin(config.bot && config.bot.login || 'soundalerts');
    const login = normalizeLogin(item && item.login);
    if (!botLogin || login !== botLogin) {
      state.stats.ignored++;
      return { ok: false, ignored: true, reason: 'not_soundalerts_bot' };
    }

    const parsed = parseSoundAlertsText(item.text || '');
    if (!parsed) {
      state.stats.ignored++;
      return { ok: false, ignored: true, reason: 'parse_failed' };
    }
    state.stats.parsed++;

    const dedupeKey = `${login}:${normalizeName(parsed.triggerUserDisplay)}:${normalizeName(parsed.soundAlertName)}:${parsed.amount}:${normalizeName(parsed.currency)}`;
    if (config.dedupe?.enabled !== false) {
      const windowMs = Math.max(0, Number(config.dedupe?.windowMs || 0));
      const now = Date.now();
      const last = state.recentKeys.get(dedupeKey) || 0;
      if (windowMs && now - last < windowMs) {
        state.stats.duplicate++;
        return { ok: false, ignored: true, reason: 'duplicate' };
      }
      state.recentKeys.set(dedupeKey, now);
    }

    const rule = findRule(parsed.soundAlertName);
    if (!rule) {
      state.stats.unmatched++;
      const row = {
        eventUid: item.id || '',
        botLogin: item.login || '',
        botDisplayName: item.user || '',
        triggerUserDisplay: parsed.triggerUserDisplay,
        triggerUserLogin: parsed.triggerUserLogin || '',
        soundAlertName: parsed.soundAlertName,
        amount: parsed.amount,
        currency: parsed.currency,
        rawText: parsed.rawText,
        status: 'unmatched',
        error: 'no_mapping'
      };
      insertEvent(row);
      remember(row);
      return { ok: false, status: 'unmatched' };
    }

    state.stats.matched++;
    return await queueSound(parsed, rule, item);
  } catch (err) {
    state.stats.failed++;
    const row = {
      eventUid: item && item.id || '',
      botLogin: item && item.login || '',
      botDisplayName: item && item.user || '',
      rawText: item && item.text || '',
      status: 'failed',
      error: err && err.message ? err.message : String(err)
    };
    insertEvent(row);
    remember(row);
    return { ok: false, status: 'failed', error: row.error };
  }
}

function connectInternalWs(port) {
  clearTimeout(state.wsReconnectTimer);
  try {
    const ws = new WebSocket(`ws://127.0.0.1:${port || 8080}`);
    state.ws = ws;
    ws.on('open', () => {
      state.wsConnected = true;
      state.wsLastError = '';
    });
    ws.on('message', raw => {
      let payload = null;
      try { payload = JSON.parse(String(raw || '')); } catch (_) { return; }
      if (!payload || payload.op !== 'start_chat_message') return;
      const item = payload.item || payload.data || null;
      if (!item) return;
      handleChatItem(item).catch(() => {});
    });
    ws.on('close', () => {
      state.wsConnected = false;
      state.wsReconnectTimer = setTimeout(() => connectInternalWs(port), 3000);
    });
    ws.on('error', err => {
      state.wsLastError = err && err.message ? err.message : String(err);
      try { ws.close(); } catch (_) {}
    });
  } catch (err) {
    state.wsLastError = err && err.message ? err.message : String(err);
    state.wsReconnectTimer = setTimeout(() => connectInternalWs(port), 3000);
  }
}

function publicStatus() {
  ensureSchema();
  let dbStats = null;
  try {
    if (sqlite.isInitialized()) {
      dbStats = {
        total: sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_events')?.c || 0,
        unmatched: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='unmatched'")?.c || 0,
        fileMissing: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='file_missing'")?.c || 0,
        queued: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='queued'")?.c || 0
      };
    }
  } catch (_) {}
  return {
    ok: true,
    module: MODULE_NAME,
    version: VERSION,
    loadedAt: state.loadedAt,
    configPath: state.configPath,
    configOk: state.configOk,
    configError: state.configError,
    wsConnected: state.wsConnected,
    wsLastError: state.wsLastError,
    stats: { ...state.stats },
    database: {
      ok: sqlite.isInitialized(),
      path: sqlite.isInitialized() ? sqlite.getDbPath() : '',
      table: 'soundalerts_bridge_events',
      stats: dbStats
    },
    config: publicConfig(),
    lastEvent: state.lastEvent,
    recent: state.recent
  };
}

function listEvents(limit) {
  ensureSchema();
  if (!sqlite.isInitialized()) return [];
  const safeLimit = Math.max(1, Math.min(500, Number.parseInt(limit || 50, 10) || 50));
  return sqlite.all(`
    SELECT * FROM soundalerts_bridge_events
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `).map(row => ({
    ...row,
    meta: core.safeJsonParse(row.meta_json, {})
  }));
}

function statsRows() {
  ensureSchema();
  if (!sqlite.isInitialized()) return { bySound: [], byUser: [], byStatus: [] };
  return {
    bySound: sqlite.all(`
      SELECT soundalert_name AS soundAlertName, COUNT(*) AS count,
             SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS queued,
             SUM(CASE WHEN status='unmatched' THEN 1 ELSE 0 END) AS unmatched,
             SUM(CASE WHEN status='file_missing' THEN 1 ELSE 0 END) AS fileMissing,
             MAX(created_at) AS lastAt
      FROM soundalerts_bridge_events
      GROUP BY soundalert_name
      ORDER BY count DESC, soundalert_name ASC
      LIMIT 100
    `),
    byUser: sqlite.all(`
      SELECT trigger_user_display AS user, COUNT(*) AS count, MAX(created_at) AS lastAt
      FROM soundalerts_bridge_events
      WHERE trigger_user_display <> ''
      GROUP BY trigger_user_display
      ORDER BY count DESC, user ASC
      LIMIT 100
    `),
    byStatus: sqlite.all(`
      SELECT status, COUNT(*) AS count
      FROM soundalerts_bridge_events
      GROUP BY status
      ORDER BY count DESC
    `)
  };
}

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  envRef = env || process.env;
  if (!sqlite.isInitialized()) sqlite.init(ctx);
  try { twitchAuth = require('./twitch'); } catch (_) { twitchAuth = null; }
  loadConfig();
  ensureSchema();

  app.get('/api/soundalerts/status', (_req, res) => res.json(publicStatus()));
  app.get('/api/soundalerts/events', (req, res) => res.json(core.ok({ events: listEvents(req.query.limit) })));
  app.get('/api/soundalerts/stats', (_req, res) => res.json(core.ok({ stats: statsRows() })));
  app.get('/api/soundalerts/config', (_req, res) => res.json(core.ok({ config: publicConfig(), path: state.configPath })));
  app.post('/api/soundalerts/config', (req, res) => {
    const next = mergePlain(config, req.body && req.body.config ? req.body.config : req.body || {});
    core.writeJson(state.configPath || cfg.resolveFromRoot('config', CONFIG_FILE), next, { spaces: 2 });
    loadConfig();
    return res.json(core.ok({ config: publicConfig(), path: state.configPath }));
  });
  app.post('/api/soundalerts/test/chat', core.asyncRoute(async (req, res) => {
    const item = {
      id: String(req.body && req.body.id || `test_${Date.now()}`),
      user: String(req.body && req.body.user || (config.bot && config.bot.displayName) || 'SoundAlerts'),
      login: normalizeLogin(req.body && req.body.login || (config.bot && config.bot.login) || 'soundalerts'),
      text: String(req.body && req.body.text || ''),
      source: 'manual_test',
      createdAt: core.nowIso()
    };
    const result = await handleChatItem(item);
    return res.json(core.ok({ result, status: publicStatus() }));
  }));
  app.post('/api/soundalerts/reload', (_req, res) => {
    loadConfig();
    return res.json(core.ok({ config: publicConfig(), path: state.configPath }));
  });

  const port = Number(envRef.PORT || 8080);
  setTimeout(() => connectInternalWs(port), 2500);
  console.log(`[${MODULE_NAME}] aktiv → /api/soundalerts/*`);
};

module.exports.handleChatItem = handleChatItem;
module.exports.parseSoundAlertsText = parseSoundAlertsText;
