'use strict';

// STEP180 — TipeeeStream Socket Provider for ForrestCGN Alert-System
// TipeeeStream Socket.io -> Node Provider -> Alert-System V2 -> Overlay
// Donation-only default seed; non-donation Tipeee alert rules are disabled defensively.
// No Streamer.bot required.

const http = require('http');
const https = require('https');

const sqlite = require('./sqlite_core');
const routes = require('./helpers/helper_routes');

let ioClient = null;
try {
  const imported = require('socket.io-client');
  ioClient = imported.io || imported;
} catch (_) {
  ioClient = null;
}

const MODULE = 'tipeee';
const STEP = '180';
const SCHEMA_VERSION = 1;
const SETTINGS_KEY = 'provider_tipeee_socket';

const DEFAULT_SETTINGS = {
  enabled: false,
  autoConnect: true,
  connectOnBoot: true,
  apiKey: '',
  username: '',
  socketSiteUrl: 'https://api.tipeeestream.com/v2.0/site/socket',
  socketUrlFallback: 'https://sso-cf.tipeeestream.com:443',
  allowedTypes: ['donation'],
  allowLocalhostWithoutSecret: true,
  allowPublicStatus: false,
  allowPublicTest: false,
  allowPublicReload: false,
  allowPublicWebhook: false,
  secretHeader: 'x-tipeee-secret',
  secretHeaderValue: '',
  enqueueUrl: 'http://127.0.0.1:8080/api/alerts/enqueue',
  currencyDefault: 'EUR',
  minAmount: 0,
  includeRawEvent: true,
  duplicateWindowDays: 30,
  reconnectDelayMs: 5000,
  socketTransports: ['websocket', 'polling'],
  typeMap: {
    donation: 'donation',
    subscription: 'subscription',
    follow: 'follow',
    hosting: 'hosting',
    host: 'hosting'
  },
  debug: false
};

const state = {
  loadedAt: nowIso(),
  settings: { ...DEFAULT_SETTINGS },
  dependency: {
    socketIoClientAvailable: !!ioClient
  },
  socket: null,
  socketUrl: '',
  connected: false,
  connecting: false,
  lastConnectAt: null,
  lastDisconnectAt: null,
  lastEventAt: null,
  lastForwardAt: null,
  lastError: '',
  recentEvents: [],
  stats: {
    received: 0,
    testEvents: 0,
    accepted: 0,
    rejected: 0,
    duplicates: 0,
    forwarded: 0,
    failed: 0,
    ignoredTypes: 0,
    ignoredMinAmount: 0,
    socketConnects: 0,
    socketDisconnects: 0,
    lastEventAt: null,
    lastForwardAt: null,
    lastError: ''
  }
};

module.exports.init = function init(ctx) {
  const { app } = ctx;

  ensureRuntime(ctx);
  ensureSchema();
  seedSettings();
  seedAlertTypesAndRules();
  loadSettings();

  routes.registerGet(app, '/api/alerts/tipeee/status', (req, res) => {
    loadSettings();
    if (!isDirectLocalRequest(req) && state.settings.allowPublicStatus !== true) {
      return res.status(403).json({ ok: false, error: 'tipeee_status_forbidden' });
    }
    res.json(buildStatus(req));
  });

  routes.registerPost(app, '/api/alerts/tipeee/reload', async (req, res) => {
    try {
      loadSettings();
      if (!isDirectLocalRequest(req) && state.settings.allowPublicReload !== true) {
        return res.status(403).json({ ok: false, error: 'tipeee_reload_forbidden' });
      }
      loadSettings();
      res.json({ ok: true, status: buildStatus(req) });
    } catch (err) {
      fail('tipeee_reload_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_reload_failed', message: errorMessage(err) });
    }
  });

  routes.registerPost(app, '/api/alerts/tipeee/config', async (req, res) => {
    try {
      loadSettings();
      if (!isDirectLocalRequest(req)) {
        return res.status(403).json({ ok: false, error: 'tipeee_config_forbidden' });
      }

      const before = { ...state.settings };
      const patch = req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : {};
      const updated = updateSettings(patch);

      const connectionRelevantChanged =
        before.enabled !== updated.enabled ||
        before.apiKey !== updated.apiKey ||
        before.username !== updated.username ||
        before.socketSiteUrl !== updated.socketSiteUrl ||
        before.socketUrlFallback !== updated.socketUrlFallback;

      let reconnectResult = null;
      if (connectionRelevantChanged) {
        disconnectSocket('config_changed');
        if (updated.enabled && updated.autoConnect) reconnectResult = await connectSocket();
      }

      res.json({ ok: true, updated: true, status: buildStatus(req), settings: maskSettings(updated), reconnectResult });
    } catch (err) {
      fail('tipeee_config_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_config_failed', message: errorMessage(err) });
    }
  });

  routes.registerPost(app, '/api/alerts/tipeee/connect', async (req, res) => {
    try {
      if (!isDirectLocalRequest(req)) return res.status(403).json({ ok: false, error: 'tipeee_connect_forbidden' });
      res.json(await connectSocket());
    } catch (err) {
      fail('tipeee_connect_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_connect_failed', message: errorMessage(err) });
    }
  });

  routes.registerPost(app, '/api/alerts/tipeee/disconnect', (req, res) => {
    if (!isDirectLocalRequest(req)) return res.status(403).json({ ok: false, error: 'tipeee_disconnect_forbidden' });
    res.json(disconnectSocket('manual_disconnect'));
  });

  routes.registerPost(app, '/api/alerts/tipeee/reconnect', async (req, res) => {
    try {
      if (!isDirectLocalRequest(req)) return res.status(403).json({ ok: false, error: 'tipeee_reconnect_forbidden' });
      disconnectSocket('manual_reconnect');
      res.json(await connectSocket());
    } catch (err) {
      fail('tipeee_reconnect_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_reconnect_failed', message: errorMessage(err) });
    }
  });

  routes.registerGet(app, '/api/alerts/tipeee/events/recent', (req, res) => {
    if (!isDirectLocalRequest(req)) return res.status(403).json({ ok: false, error: 'tipeee_recent_forbidden' });
    res.json({ ok: true, module: MODULE, rows: state.recentEvents });
  });

  routes.registerGet(app, '/api/alerts/tipeee/test', async (req, res) => {
    try {
      loadSettings();
      if (!isDirectLocalRequest(req) && state.settings.allowPublicTest !== true) {
        return res.status(403).json({ ok: false, error: 'tipeee_test_forbidden' });
      }
      state.stats.testEvents += 1;
      const event = buildLocalTestEvent(req.query || {});
      const result = await handleTipeeeEvent(event, { req, isLocalTest: true });
      res.status(result.ok || result.duplicate ? 200 : 400).json(result);
    } catch (err) {
      fail('tipeee_test_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_test_failed', message: errorMessage(err) });
    }
  });

  // Optional local/manual receiver. This is NOT required for the no-Streamer.bot socket path.
  routes.registerPost(app, '/api/alerts/tipeee/webhook', async (req, res) => {
    state.stats.received += 1;
    state.stats.lastEventAt = nowIso();

    try {
      loadSettings();
      if (state.settings.enabled === false) {
        state.stats.rejected += 1;
        return res.status(403).json({ ok: false, error: 'tipeee_provider_disabled' });
      }

      if (!isDirectLocalRequest(req) && state.settings.allowPublicWebhook !== true) {
        state.stats.rejected += 1;
        return res.status(403).json({ ok: false, error: 'tipeee_webhook_forbidden' });
      }

      if (!verifySecretHeader(req)) {
        state.stats.rejected += 1;
        return res.status(401).json({ ok: false, error: 'invalid_tipeee_secret_header' });
      }

      const event = normalizeTipeeeEvent(req.body || {}, { manualWebhook: true });
      const result = await handleTipeeeEvent(event, { req, isLocalTest: false });
      res.status(result.ok || result.duplicate ? 200 : 400).json(result);
    } catch (err) {
      fail('tipeee_webhook_failed', err);
      res.status(500).json({ ok: false, error: 'tipeee_webhook_failed', message: errorMessage(err) });
    }
  });

  if (state.settings.enabled && state.settings.autoConnect && state.settings.connectOnBoot) {
    setTimeout(() => {
      connectSocket().then(result => {
        if (!result.ok) console.warn('[tipeee] boot connect skipped/failed:', result.error || result.message || result);
      }).catch(err => console.error('[tipeee] boot connect exception:', errorMessage(err)));
    }, 1500);
  }

  console.log('[tipeee] STEP100C Socket Provider aktiv -> /api/alerts/tipeee/status');
};

function ensureRuntime(ctx) {
  if (!sqlite.isInitialized()) sqlite.init(ctx);
}

function ensureSchema() {
  sqlite.ensureSchema(MODULE, SCHEMA_VERSION, (_fromVersion, toVersion, db) => {
    if (toVersion !== 1) return;
    db.exec(`
      CREATE TABLE IF NOT EXISTS alert_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        value_kind TEXT NOT NULL DEFAULT 'amount',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(source, type_key)
      );

      CREATE TABLE IF NOT EXISTS alert_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        label TEXT NOT NULL,
        min_value REAL,
        max_value REAL,
        tier TEXT NOT NULL DEFAULT 'normal',
        priority INTEGER NOT NULL DEFAULT 100,
        duration_ms INTEGER NOT NULL DEFAULT 7000,
        animation TEXT NOT NULL DEFAULT 'neon_card',
        image_mode TEXT NOT NULL DEFAULT 'none',
        sound_asset_id INTEGER,
        image_asset_id INTEGER,
        enabled INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_provider_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        provider_event_id TEXT NOT NULL,
        source TEXT NOT NULL,
        type_key TEXT NOT NULL,
        user_display TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'received',
        forwarded_event_uid TEXT NOT NULL DEFAULT '',
        raw_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        forwarded_at TEXT,
        UNIQUE(provider, provider_event_id)
      );

      CREATE INDEX IF NOT EXISTS idx_alert_provider_events_created ON alert_provider_events(created_at DESC);
    `);
  });
}

function seedSettings() {
  const existing = sqlite.get(`SELECT value_json FROM alert_settings WHERE key=:key`, { key: SETTINGS_KEY });
  if (existing) return;

  const settings = {
    ...DEFAULT_SETTINGS,
    apiKey: String(process.env.TIPEEE_API_KEY || process.env.TIPEEESTREAM_API_KEY || '').trim(),
    username: String(process.env.TIPEEE_USERNAME || process.env.TIPEEESTREAM_USERNAME || '').trim(),
    secretHeaderValue: String(process.env.TIPEEE_SECRET_HEADER_VALUE || '').trim()
  };

  sqlite.run(`
    INSERT INTO alert_settings (key, value_json, updated_at)
    VALUES (:key, :valueJson, :now)
  `, { key: SETTINGS_KEY, valueJson: JSON.stringify(settings), now: nowIso() });
}

function loadSettings() {
  const row = sqlite.get(`SELECT value_json FROM alert_settings WHERE key=:key`, { key: SETTINGS_KEY });
  const dbSettings = parseJson(row && row.value_json, {});
  state.settings = mergeSettings(DEFAULT_SETTINGS, dbSettings);

  if (!state.settings.apiKey && (process.env.TIPEEE_API_KEY || process.env.TIPEEESTREAM_API_KEY)) {
    state.settings.apiKey = String(process.env.TIPEEE_API_KEY || process.env.TIPEEESTREAM_API_KEY || '').trim();
  }
  if (!state.settings.username && (process.env.TIPEEE_USERNAME || process.env.TIPEEESTREAM_USERNAME)) {
    state.settings.username = String(process.env.TIPEEE_USERNAME || process.env.TIPEEESTREAM_USERNAME || '').trim();
  }
  if (!state.settings.secretHeaderValue && process.env.TIPEEE_SECRET_HEADER_VALUE) {
    state.settings.secretHeaderValue = String(process.env.TIPEEE_SECRET_HEADER_VALUE).trim();
  }

  return state.settings;
}

function updateSettings(patch) {
  const current = loadSettings();
  const allowed = new Set([
    'enabled',
    'autoConnect',
    'connectOnBoot',
    'apiKey',
    'username',
    'socketSiteUrl',
    'socketUrlFallback',
    'allowedTypes',
    'allowLocalhostWithoutSecret',
    'allowPublicStatus',
    'allowPublicTest',
    'allowPublicReload',
    'allowPublicWebhook',
    'secretHeader',
    'secretHeaderValue',
    'enqueueUrl',
    'currencyDefault',
    'minAmount',
    'includeRawEvent',
    'duplicateWindowDays',
    'reconnectDelayMs',
    'socketTransports',
    'typeMap',
    'debug'
  ]);

  const next = { ...current };
  for (const [key, value] of Object.entries(patch || {})) {
    if (!allowed.has(key)) continue;
    if (key === 'typeMap') {
      next.typeMap = { ...(current.typeMap || {}), ...((value && typeof value === 'object') ? value : {}) };
      continue;
    }
    if (key === 'allowedTypes' || key === 'socketTransports') {
      next[key] = normalizeStringArray(value, current[key]);
      continue;
    }
    if (['enabled', 'autoConnect', 'connectOnBoot', 'allowLocalhostWithoutSecret', 'allowPublicStatus', 'allowPublicTest', 'allowPublicReload', 'allowPublicWebhook', 'includeRawEvent', 'debug'].includes(key)) {
      next[key] = value === true || value === 'true' || value === 1 || value === '1';
      continue;
    }
    if (['minAmount', 'duplicateWindowDays', 'reconnectDelayMs'].includes(key)) {
      next[key] = toNumber(value, current[key]);
      continue;
    }
    next[key] = typeof value === 'string' ? value.trim() : value;
  }

  state.settings = mergeSettings(DEFAULT_SETTINGS, next);
  sqlite.run(`
    INSERT INTO alert_settings (key, value_json, updated_at)
    VALUES (:key, :valueJson, :now)
    ON CONFLICT(key) DO UPDATE SET
      value_json=excluded.value_json,
      updated_at=excluded.updated_at
  `, { key: SETTINGS_KEY, valueJson: JSON.stringify(state.settings), now: nowIso() });
  loadSettings();
  return state.settings;
}

function seedAlertTypesAndRules() {
  const now = nowIso();
  const types = [
    ['tipeee', 'donation', 'TipeeeStream Donation', 'amount', 110]
  ];

  for (const [source, typeKey, label, valueKind, sortOrder] of types) {
    sqlite.run(`
      INSERT INTO alert_types (source, type_key, label, value_kind, enabled, sort_order, created_at, updated_at)
      VALUES (:source, :typeKey, :label, :valueKind, 1, :sortOrder, :now, :now)
      ON CONFLICT(source, type_key) DO UPDATE SET
        label=excluded.label,
        value_kind=excluded.value_kind,
        sort_order=excluded.sort_order,
        updated_at=excluded.updated_at
    `, { source, typeKey, label, valueKind, sortOrder, now });
  }

  const defaults = [
    { type_key: 'donation', label: 'Tipeee Donation Standard', min_value: 0, max_value: null, tier: 'medium', priority: 80, duration_ms: 8000, image_mode: 'avatar_icon' }
  ];

  for (const rule of defaults) {
    const exists = sqlite.get(`SELECT id FROM alert_rules WHERE source='tipeee' AND type_key=:typeKey LIMIT 1`, { typeKey: rule.type_key });
    if (exists) continue;
    sqlite.run(`
      INSERT INTO alert_rules (source, type_key, label, min_value, max_value, tier, priority, duration_ms, animation, image_mode, enabled, meta_json, created_at, updated_at)
      VALUES ('tipeee', :typeKey, :label, :minValue, :maxValue, :tier, :priority, :durationMs, 'neon_card', :imageMode, 1, '{}', :now, :now)
    `, {
      typeKey: rule.type_key,
      label: rule.label,
      minValue: rule.min_value,
      maxValue: rule.max_value,
      tier: rule.tier,
      priority: rule.priority,
      durationMs: rule.duration_ms,
      imageMode: rule.image_mode,
      now
    });
  }

  disableNonDonationTipeeeDefaults(now);
}

function disableNonDonationTipeeeDefaults(now) {
  const disabledTypes = ['subscription', 'follow', 'hosting', 'host'];
  for (const typeKey of disabledTypes) {
    sqlite.run(`
      UPDATE alert_types
      SET enabled=0, updated_at=:now
      WHERE source='tipeee' AND type_key=:typeKey
    `, { typeKey, now });

    sqlite.run(`
      UPDATE alert_rules
      SET enabled=0, updated_at=:now
      WHERE source='tipeee' AND type_key=:typeKey
    `, { typeKey, now });
  }
}

function buildStatus(req) {
  return {
    ok: true,
    module: MODULE,
    step: STEP,
    loadedAt: state.loadedAt,
    enabled: state.settings.enabled === true,
    settingsKey: SETTINGS_KEY,
    dependency: { ...state.dependency },
    socket: {
      connected: state.connected,
      connecting: state.connecting,
      socketUrl: state.socketUrl,
      lastConnectAt: state.lastConnectAt,
      lastDisconnectAt: state.lastDisconnectAt,
      lastEventAt: state.lastEventAt,
      lastForwardAt: state.lastForwardAt,
      lastError: state.lastError
    },
    settings: maskSettings(state.settings),
    databasePath: sqlite.getDbPath(),
    schemaVersion: sqlite.getSchemaVersion(MODULE),
    stats: { ...state.stats },
    recentEventsCount: state.recentEvents.length,
    requestIp: req ? getIp(req) : '',
    requestHost: req ? getHost(req) : '',
    directLocal: req ? isDirectLocalRequest(req) : false,
    cloudflareTunnelRequest: req ? hasCloudflareTunnelHeaders(req) : false
  };
}

function maskSettings(settings) {
  const publicSettings = { ...(settings || {}) };
  publicSettings.apiKey = publicSettings.apiKey ? '[set]' : '';
  publicSettings.secretHeaderValue = publicSettings.secretHeaderValue ? '[set]' : '';
  return publicSettings;
}

async function connectSocket() {
  loadSettings();

  if (!ioClient) return setErrorResult('socket_io_client_missing', 'socket.io-client is not installed or could not be loaded');
  if (state.connecting) return { ok: false, connecting: true, error: 'tipeee_already_connecting' };
  if (state.connected && state.socket) return { ok: true, connected: true, socketUrl: state.socketUrl, message: 'already_connected' };
  if (state.settings.enabled !== true) return { ok: false, error: 'tipeee_provider_disabled' };
  if (!state.settings.apiKey) return setErrorResult('tipeee_api_key_missing', 'TipeeeStream API key is not configured');
  if (!state.settings.username) return setErrorResult('tipeee_username_missing', 'TipeeeStream username is not configured');

  state.connecting = true;
  state.lastError = '';

  try {
    const socketUrl = await resolveSocketUrl(state.settings);
    state.socketUrl = socketUrl;

    const socket = ioClient(socketUrl, {
      query: { access_token: state.settings.apiKey },
      transports: Array.isArray(state.settings.socketTransports) && state.settings.socketTransports.length ? state.settings.socketTransports : DEFAULT_SETTINGS.socketTransports,
      reconnection: true,
      reconnectionDelay: Math.max(1000, Number(state.settings.reconnectDelayMs || 5000)),
      timeout: 15000,
      forceNew: true
    });

    state.socket = socket;
    bindSocketEvents(socket);

    return await waitForSocketConnect(socket, 15000);
  } catch (err) {
    state.connecting = false;
    return setErrorResult('tipeee_connect_failed', errorMessage(err));
  }
}

function bindSocketEvents(socket) {
  socket.on('connect', () => {
    state.connected = true;
    state.connecting = false;
    state.lastConnectAt = nowIso();
    state.lastError = '';
    state.stats.socketConnects += 1;

    socket.emit('join-room', {
      room: state.settings.apiKey,
      username: state.settings.username
    });

    if (state.settings.debug) console.log('[tipeee] socket connected and join-room sent');
  });

  socket.on('disconnect', reason => {
    state.connected = false;
    state.connecting = false;
    state.lastDisconnectAt = nowIso();
    state.stats.socketDisconnects += 1;
    if (state.settings.debug) console.warn('[tipeee] socket disconnected:', reason);
  });

  socket.on('connect_error', err => {
    state.connecting = false;
    state.connected = false;
    state.lastError = errorMessage(err);
    state.stats.lastError = state.lastError;
    if (state.settings.debug) console.error('[tipeee] socket connect_error:', errorMessage(err));
  });

  socket.on('error', err => {
    state.lastError = errorMessage(err);
    state.stats.lastError = state.lastError;
    if (state.settings.debug) console.error('[tipeee] socket error:', errorMessage(err));
  });

  socket.on('new-event', async payload => {
    state.stats.received += 1;
    state.stats.lastEventAt = nowIso();
    state.lastEventAt = state.stats.lastEventAt;

    try {
      const event = normalizeTipeeeEvent(payload, { socket: true });
      const result = await handleTipeeeEvent(event, { isSocketEvent: true });
      if (state.settings.debug) console.log('[tipeee] new-event result:', result);
    } catch (err) {
      fail('tipeee_socket_event_failed', err);
      console.error('[tipeee] new-event failed:', errorMessage(err));
    }
  });
}

function waitForSocketConnect(socket, timeoutMs) {
  return new Promise(resolve => {
    let done = false;
    const finish = result => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ ok: false, connected: false, error: 'tipeee_connect_timeout', socketUrl: state.socketUrl });
    }, timeoutMs);

    socket.once('connect', () => finish({ ok: true, connected: true, socketUrl: state.socketUrl }));
    socket.once('connect_error', err => finish({ ok: false, connected: false, error: 'tipeee_connect_error', message: errorMessage(err), socketUrl: state.socketUrl }));
  });
}

function disconnectSocket(reason = 'disconnect') {
  const hadSocket = !!state.socket;
  try {
    if (state.socket) {
      state.socket.removeAllListeners();
      if (typeof state.socket.disconnect === 'function') state.socket.disconnect();
      if (typeof state.socket.close === 'function') state.socket.close();
    }
  } catch (err) {
    state.lastError = errorMessage(err);
  }

  state.socket = null;
  state.connected = false;
  state.connecting = false;
  state.lastDisconnectAt = nowIso();

  return { ok: true, module: MODULE, disconnected: hadSocket, reason };
}

async function resolveSocketUrl(settings) {
  const fallback = String(settings.socketUrlFallback || DEFAULT_SETTINGS.socketUrlFallback).trim();
  const siteUrl = String(settings.socketSiteUrl || '').trim();
  if (!siteUrl) return fallback;

  try {
    const response = await getJsonExternal(siteUrl, 7000);
    const url = normalizeSocketSiteResponse(response.body || response, fallback);
    return url || fallback;
  } catch (err) {
    state.lastError = 'socket_site_lookup_failed: ' + errorMessage(err);
    return fallback;
  }
}

function normalizeSocketSiteResponse(body, fallback) {
  if (!body) return fallback;
  if (typeof body === 'string') {
    if (/^https?:\/\//i.test(body.trim())) return body.trim();
    return fallback;
  }

  const candidates = [body.url, body.socketUrl, body.socket_url, body.host, body.hostname, body.server].filter(Boolean).map(v => String(v).trim());
  for (const candidate of candidates) {
    if (/^https?:\/\//i.test(candidate)) return candidate;
  }

  const host = String(body.host || body.hostname || '').trim();
  const port = String(body.port || '').trim();
  if (host) {
    const protocol = body.secure === false ? 'http' : 'https';
    if (/^https?:\/\//i.test(host)) return port && !host.includes(':' + port) ? `${host}:${port}` : host;
    return `${protocol}://${host}${port ? `:${port}` : ''}`;
  }

  return fallback;
}

function normalizeTipeeeEvent(payload, originalMeta = {}) {
  const root = payload && payload.event && typeof payload.event === 'object' ? payload.event : payload;
  if (!root || typeof root !== 'object') throw new Error('invalid_tipeee_payload');

  const params = root.parameters && typeof root.parameters === 'object' ? root.parameters : {};
  const typeKey = mapTipeeeType(root.type || payload.type || params.type || 'donation');
  const amount = toNumber(params.amount ?? root.amount ?? payload.amount, 0);
  const currency = cleanText(params.currency || root.currency || payload.currency || state.settings.currencyDefault || 'EUR', 16).toUpperCase();
  const providerEventId = cleanText(root.id || payload.id || root.ref || payload.ref || params.id || '', 120) || buildSyntheticProviderId(root, params, typeKey, amount, currency);
  const displayName = cleanText(params.username || root.username || payload.username || root.user?.username || root.user?.display_name || payload.user || 'Tipeee Supporter', 120);
  const userLogin = cleanKey(displayName) || 'tipeee_supporter';
  const message = cleanText(params.message || root.message || payload.message || '', 500);
  const title = buildTipeeeTitle(typeKey, displayName, amount, currency, root, params);

  return {
    provider: 'tipeee',
    providerEventId,
    source: 'tipeee',
    type_key: typeKey,
    user_login: userLogin,
    user_display: displayName,
    amount,
    currency,
    message,
    title,
    avatar_url: cleanText(params.avatar || root.avatar || payload.avatar || '', 1000),
    raw: sanitizeRawTipeee({ ...(payload || {}), normalizedEvent: root, originalMeta })
  };
}

function mapTipeeeType(input) {
  const raw = String(input || '').toLowerCase();
  const map = state.settings.typeMap || DEFAULT_SETTINGS.typeMap;
  if (raw.includes('sub')) return cleanKey(map.subscription || 'subscription');
  if (raw.includes('follow')) return cleanKey(map.follow || 'follow');
  if (raw.includes('host')) return cleanKey(map.hosting || map.host || 'hosting');
  return cleanKey(map.donation || 'donation');
}

async function handleTipeeeEvent(event, options = {}) {
  loadSettings();

  const allowedTypes = normalizeStringArray(state.settings.allowedTypes, DEFAULT_SETTINGS.allowedTypes).map(cleanKey);
  if (allowedTypes.length && !allowedTypes.includes(event.type_key)) {
    state.stats.ignoredTypes += 1;
    state.stats.rejected += 1;
    rememberProviderEvent(event, 'ignored_type', '');
    return { ok: false, ignored: true, error: 'ignored_type', type: event.type_key, allowedTypes };
  }

  if (event.amount < Number(state.settings.minAmount || 0)) {
    state.stats.ignoredMinAmount += 1;
    state.stats.rejected += 1;
    rememberProviderEvent(event, 'ignored_min_amount', '');
    return { ok: false, ignored: true, error: 'below_min_amount', amount: event.amount, minAmount: state.settings.minAmount };
  }

  rememberRecentEvent(event);

  const duplicate = rememberProviderEvent(event, 'received', '');
  if (duplicate) {
    state.stats.duplicates += 1;
    return { ok: true, duplicate: true, providerEventId: event.providerEventId, message: 'duplicate_ignored' };
  }

  const alertPayload = {
    source: 'tipeee',
    type: event.type_key,
    user: event.user_display,
    user_login: event.user_login,
    amount: event.amount,
    message: event.message,
    title: event.title,
    currency: event.currency,
    avatar_url: event.avatar_url,
    providerEventId: event.providerEventId,
    raw: state.settings.includeRawEvent ? event.raw : { providerEventId: event.providerEventId, currency: event.currency }
  };

  const forward = await postJsonInternal(state.settings.enqueueUrl || DEFAULT_SETTINGS.enqueueUrl, alertPayload);
  if (!forward.ok) {
    state.stats.failed += 1;
    state.stats.lastError = forward.error || 'alert_forward_failed';
    state.lastError = state.stats.lastError;
    updateProviderEvent(event, 'forward_failed', '');
    return { ok: false, error: 'alert_forward_failed', detail: forward };
  }

  const forwardedEventUid = forward.body && forward.body.eventUid ? String(forward.body.eventUid) : '';
  updateProviderEvent(event, 'forwarded', forwardedEventUid);

  if (!options.isLocalTest) state.stats.accepted += 1;
  state.stats.forwarded += 1;
  state.stats.lastForwardAt = nowIso();
  state.stats.lastError = '';
  state.lastForwardAt = state.stats.lastForwardAt;
  state.lastError = '';

  return {
    ok: true,
    localTest: !!options.isLocalTest,
    socketEvent: !!options.isSocketEvent,
    provider: 'tipeee',
    providerEventId: event.providerEventId,
    type: event.type_key,
    amount: event.amount,
    currency: event.currency,
    user: event.user_display,
    forwardedEventUid,
    alertResult: forward.body
  };
}

function rememberProviderEvent(event, status, forwardedEventUid) {
  const now = nowIso();
  try {
    sqlite.run(`
      INSERT INTO alert_provider_events (provider, provider_event_id, source, type_key, user_display, amount, currency, status, forwarded_event_uid, raw_json, created_at, forwarded_at)
      VALUES (:provider, :providerEventId, :source, :typeKey, :userDisplay, :amount, :currency, :status, :forwardedEventUid, :rawJson, :now, NULL)
    `, {
      provider: event.provider,
      providerEventId: event.providerEventId,
      source: event.source,
      typeKey: event.type_key,
      userDisplay: event.user_display,
      amount: event.amount,
      currency: event.currency,
      status,
      forwardedEventUid: forwardedEventUid || '',
      rawJson: JSON.stringify(event.raw || {}),
      now
    });
    return false;
  } catch (err) {
    if (String(err && err.message || err).toLowerCase().includes('unique')) return true;
    throw err;
  }
}

function updateProviderEvent(event, status, forwardedEventUid) {
  sqlite.run(`
    UPDATE alert_provider_events
    SET status=:status, forwarded_event_uid=:forwardedEventUid, forwarded_at=:forwardedAt
    WHERE provider=:provider AND provider_event_id=:providerEventId
  `, {
    status,
    forwardedEventUid: forwardedEventUid || '',
    forwardedAt: status === 'forwarded' ? nowIso() : null,
    provider: event.provider,
    providerEventId: event.providerEventId
  });
}

function rememberRecentEvent(event) {
  state.recentEvents.unshift({
    at: nowIso(),
    providerEventId: event.providerEventId,
    type: event.type_key,
    user: event.user_display,
    amount: event.amount,
    currency: event.currency,
    message: event.message
  });
  state.recentEvents = state.recentEvents.slice(0, 25);
}

function buildLocalTestEvent(query) {
  const amount = toNumber(query.amount, 3);
  const currency = cleanText(query.currency || state.settings.currencyDefault || 'EUR', 16).toUpperCase();
  const type = cleanText(query.type || 'donation', 80);
  const user = cleanText(query.user || query.username || 'TipeeeTester', 120);

  return normalizeTipeeeEvent({
    appKey: 'local-test',
    event: {
      id: `local_test_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      type,
      ref: `local_ref_${Date.now()}`,
      created_at: nowIso(),
      parameters: {
        username: user,
        amount,
        currency,
        message: cleanText(query.message || 'Lokaler TipeeeStream Test', 500)
      }
    }
  }, { localTest: true });
}

function buildSyntheticProviderId(root, params, typeKey, amount, currency) {
  const created = cleanText(root.created_at || root.createdAt || root.timestamp || nowIso(), 80);
  const user = cleanText(params.username || root.username || 'unknown', 80);
  return cleanText(`synthetic_${typeKey}_${created}_${user}_${amount}_${currency}`, 120).replace(/\s+/g, '_');
}

function buildTipeeeTitle(typeKey, displayName, amount, currency) {
  const value = amount > 0 ? `${formatAmount(amount)} ${currency}` : '';
  if (typeKey === 'subscription') return `${displayName} unterstützt über TipeeeStream${value ? ` (${value})` : ''}!`;
  if (typeKey === 'follow') return `${displayName} folgt über TipeeeStream!`;
  if (typeKey === 'hosting') return `${displayName} hostet über TipeeeStream${value ? ` (${value})` : ''}!`;
  return `${displayName} spendet über TipeeeStream${value ? ` ${value}` : ''}!`;
}

function verifySecretHeader(req) {
  if (state.settings.allowLocalhostWithoutSecret && isDirectLocalRequest(req)) return true;
  const headerName = String(state.settings.secretHeader || '').toLowerCase();
  const expected = String(state.settings.secretHeaderValue || '').trim();
  if (!headerName || !expected) return false;
  return safeEqual(String(req.headers[headerName] || '').trim(), expected);
}

function postJsonInternal(targetUrl, payload) {
  return new Promise(resolve => {
    try {
      const url = new URL(targetUrl);
      const client = url.protocol === 'https:' ? https : http;
      const body = JSON.stringify(payload);
      const req = client.request({
        method: 'POST',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body)
        },
        timeout: 5000
      }, res => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          const parsed = parseJson(raw, null);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, body: parsed || raw });
        });
      });
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', err => resolve({ ok: false, error: errorMessage(err) }));
      req.write(body);
      req.end();
    } catch (err) {
      resolve({ ok: false, error: errorMessage(err) });
    }
  });
}

function getJsonExternal(targetUrl, timeoutMs) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(targetUrl);
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request({
        method: 'GET',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers: { accept: 'application/json' },
        timeout: timeoutMs || 7000
      }, res => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
          }
          resolve({ statusCode: res.statusCode, body: parseJson(raw, raw) });
        });
      });
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', reject);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sanitizeRawTipeee(raw) {
  const copy = JSON.parse(JSON.stringify(raw || {}));
  stripSensitive(copy);
  return copy;
}

function stripSensitive(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (lower.includes('apikey') || lower.includes('api_key') || lower.includes('access_token') || lower.includes('secret') || lower.includes('token') || lower === 'email') {
      obj[key] = '[redacted]';
    } else if (obj[key] && typeof obj[key] === 'object') {
      stripSensitive(obj[key]);
    }
  }
}

function fail(error, err) {
  const msg = errorMessage(err);
  state.stats.failed += 1;
  state.stats.lastError = msg;
  state.lastError = msg;
  return { ok: false, error, message: msg };
}

function setErrorResult(error, message) {
  state.lastError = message || error;
  state.stats.lastError = state.lastError;
  return { ok: false, error, message };
}

function isDirectLocalRequest(req) {
  const ip = getIp(req);
  const host = getHost(req).toLowerCase();
  const localIp = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
  const localHost = host === '127.0.0.1' || host === '127.0.0.1:8080' || host === 'localhost' || host === 'localhost:8080' || host === '[::1]' || host === '[::1]:8080';
  return localIp && localHost && !hasCloudflareTunnelHeaders(req);
}

function hasCloudflareTunnelHeaders(req) {
  const h = (req && req.headers) || {};
  return !!(
    h['cf-ray'] ||
    h['cf-connecting-ip'] ||
    h['cf-visitor'] ||
    h['cf-ipcountry'] ||
    h['cdn-loop'] ||
    h['cf-ew-via'] ||
    h['x-forwarded-host'] ||
    h['x-forwarded-for'] ||
    h['x-real-ip']
  );
}

function getHost(req) {
  return String((req && req.headers && (req.headers.host || req.headers['x-forwarded-host'])) || '');
}

function getIp(req) {
  return String(req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
}

function mergeSettings(base, incoming) {
  return {
    ...base,
    ...(incoming || {}),
    allowedTypes: normalizeStringArray((incoming && incoming.allowedTypes) || base.allowedTypes, base.allowedTypes),
    socketTransports: normalizeStringArray((incoming && incoming.socketTransports) || base.socketTransports, base.socketTransports),
    typeMap: { ...(base.typeMap || {}), ...((incoming && incoming.typeMap) || {}) }
  };
}

function normalizeStringArray(value, fallback) {
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
  return Array.isArray(fallback) ? fallback.slice() : [];
}

function safeEqual(a, b) {
  const aa = String(a || '');
  const bb = String(b || '');
  if (!aa || !bb || aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return out === 0;
}

function cleanText(v, max = 500) { return String(v ?? '').trim().slice(0, max); }
function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80); }
function toNumber(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function formatAmount(n) { return Number(n || 0).toFixed(2).replace(/\.00$/, ''); }
function parseJson(v, fallback) { try { return JSON.parse(v || ''); } catch (_) { return fallback; } }
function nowIso() { return new Date().toISOString(); }
function errorMessage(err) { return err && err.message ? err.message : String(err); }
