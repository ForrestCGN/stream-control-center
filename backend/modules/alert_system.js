'use strict';

// STEP95 â€” Dashboard Foundation + Alert System V2 MVP
// Zentraler Alert-Core mit SQLite-Regeln, Asset-Verwaltung, Queue, WebSocket-Overlay und Dashboard-API.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

let multer = null;
let multerLoadError = '';
try {
  multer = require('multer');
} catch (err) {
  multerLoadError = err && err.message ? err.message : String(err);
}

const sqlite = require('./sqlite_core');
const core = require('./helpers/helper_core');
const configHelper = require('./helpers/helper_config');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const media = require('./helpers/helper_media');

const MODULE = 'alert_system';
const SCHEMA_VERSION = 6;
const MODULE_STEP = 188;

const DEFAULT_CONFIG = {
  enabled: true,
  overlayEnabled: true,
  dashboardEnabled: true,
  queueEnabled: true,
  uploadEnabled: true,
  allowLanUploads: true,
  soundsDir: 'htdocs/assets/sounds/alerts',
  imagesDir: 'htdocs/assets/images/alerts',
  maxSoundSizeBytes: 15728640,
  maxImageSizeBytes: 10485760,
  fallbackFinishMs: 12000,
  gapBetweenAlertsMs: 700,
  defaultDurationMs: 7000,
  defaultIntroMs: 700,
  defaultOutroMs: 600,
  autoDurationOnUpload: true,
  soundDurationPaddingMs: 1200,
  minAutoDurationMs: 4000,
  maxAutoDurationMs: 60000,
  ffprobeTimeoutMs: 5000,
  allowedSoundTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  allowedImageTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  allowedImageModes: ['none', 'icon', 'avatar', 'avatar_icon', 'special', 'avatar_special', 'random_pool'],
  wsOp: 'alert_system',
  avatarResolveEnabled: true,
  avatarResolveUserinfoUrl: 'http://127.0.0.1:8080/userinfo',
  avatarResolveTimeoutMs: 2500,
  avatarResolveCacheMs: 3600000,
  chatMessageEnabled: true,
  chatMessagePostUrl: '',
  chatMessagePostMethod: 'POST',
  chatMessageTimeoutMs: 2500,
  chatMessageOutboxLimit: 100,
  preview: {
    localBrowserAudio: true,
    sendToLiveOverlay: false,
    sendToSoundSystem: false
  },
  liveAlert: {
    soundSystemEnabled: false,
    soundSystemPlayUrl: 'http://127.0.0.1:8080/api/sound/play',
    soundSystemOutputTarget: 'device',
    soundSystemCategory: 'alert',
    soundSystemSource: 'alert_system',
    earlySoundQueueEnabled: true,
    earlySoundQueueTimeoutMs: 3500,
    waitForSoundItemStarted: true,
    fallbackShowOnSoundError: true,
    fallbackShowAfterMs: 15000,
    alertTtsEnabled: true,
    alertTtsPrepareUrl: 'http://127.0.0.1:8080/api/tts/prepare-alert',
    alertTtsTimeoutMs: 15000,
    alertTtsSoundSystemEnabled: true,
    alertTtsSoundSystemCategory: 'alert_tts',
    alertTtsSoundSystemSource: 'alert_system',
    alertTtsSoundSystemOutputTarget: 'device',
    alertTtsSoundSystemVolume: 100,
    alertTtsSoundSystemPriority: 79,
    alertTtsOutroBufferMs: 1500
  },
  dashboardSettings: {
    preferSqliteSettings: true,
    allowRuntimeEdit: true,
    settingsTable: 'alert_settings'
  }
};

const DEFAULT_MESSAGES = {
  moduleReady: '[ALERT] Alert-System V2 bereit.',
  alertQueued: '[ALERT] Alert wurde eingereiht.',
  alertPlayed: '[ALERT] Alert wurde abgespielt.',
  noMatchingRule: '[ALERT] Keine passende Regel gefunden.'
};

const state = {
  loadedAt: new Date().toISOString(),
  config: { ...DEFAULT_CONFIG },
  messages: { ...DEFAULT_MESSAGES },
  queue: [],
  current: null,
  history: [],
  overlayClients: new Map(),
  processing: false,
  finishTimer: null,
  started: false,
  broadcastWS: null,
  avatarCache: new Map()
};

module.exports.init = function init(ctx) {
  const { app, wss, broadcastWS } = ctx;
  state.broadcastWS = broadcastWS;

  ensureRuntime(ctx);
  reloadConfig();
  ensureDirs();
  ensureSchema();
  seedDefaults();

  if (wss) attachWs(wss);

  const guard = security.requireLocalOrAuth();
  const upload = createUploadMiddleware();

  routes.registerGet(app, '/api/alerts/status', (req, res) => res.json(buildStatus(req)));
  routes.registerGet(app, '/api/alerts/health', (req, res) => res.json(buildHealth(req)));
  routes.registerGet(app, '/api/alerts/queue', (req, res) => res.json({ ok: true, current: state.current, queue: state.queue, queueLength: state.queue.length }));
  routes.registerPost(app, '/api/alerts/clear', guard, (req, res) => {
    clearQueue('api_clear');
    sendOverlay(broadcastWS, { event: 'clear' });
    res.json({ ok: true, queueLength: 0, current: state.current });
  });
  routes.registerPost(app, '/api/alerts/reload', guard, (req, res) => {
    reloadConfig();
    ensureDirs();
    ensureSchema();
    seedDefaults();
    res.json({ ok: true, status: buildStatus(req) });
  });
  routes.registerPost(app, '/api/alerts/enqueue', guard, (req, res) => {
    const result = enqueueFromRequest(req, broadcastWS, 'api');
    res.status(result.ok ? 200 : 400).json(result);
  });
  routes.registerPost(app, '/api/alerts/test', guard, (req, res) => {
    const result = enqueueAlert(normalizeAlertPayload(req.body || {}, 'test'), broadcastWS);
    res.status(result.ok ? 200 : 400).json(result);
  });

  routes.registerGet(app, '/api/alerts/text-variants', guard, (req, res) => res.json({ ok: true, variants: listTextVariants(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/text-variants', guard, (req, res) => res.status(201).json(saveTextVariant(req.body || {})));
  routes.registerPut(app, '/api/alerts/text-variants/:id', guard, (req, res) => res.json(saveTextVariant({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/text-variants/:id', guard, (req, res) => res.json(deleteTextVariant(req.params.id)));

  routes.registerGet(app, '/api/alerts/chat-blocks', guard, (req, res) => res.json({ ok: true, blocks: listChatBlocks(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/chat-blocks', guard, (req, res) => res.status(201).json(saveChatBlock(req.body || {})));
  routes.registerPut(app, '/api/alerts/chat-blocks/:id', guard, (req, res) => res.json(saveChatBlock({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/chat-blocks/:id', guard, (req, res) => res.json(deleteChatBlock(req.params.id)));

  routes.registerGet(app, '/api/alerts/chat-outbox', guard, (req, res) => res.json({ ok:true, rows:listChatOutbox(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/sent', guard, (req, res) => res.json(markChatOutboxSent(req.params.id)));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/consumed', guard, (req, res) => res.json(markChatOutboxConsumed(req.params.id)));
  routes.registerPost(app, '/api/alerts/chat-outbox/:id/error', guard, (req, res) => res.json(markChatOutboxError(req.params.id, req.body || {})));

  routes.registerGet(app, '/api/alerts/test-presets', guard, (req, res) => res.json({ ok: true, presets: listTestPresets(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/test-presets', guard, (req, res) => res.status(201).json(saveTestPreset(req.body || {})));
  routes.registerPut(app, '/api/alerts/test-presets/:id', guard, (req, res) => res.json(saveTestPreset({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/test-presets/:id', guard, (req, res) => res.json(deleteTestPreset(req.params.id)));
  routes.registerPost(app, '/api/alerts/test-presets/:id/play', guard, (req, res) => {
    const preset = getTestPresetById(req.params.id);
    if (!preset) return res.status(404).json({ ok: false, error: 'preset_not_found' });
    const payload = normalizeAlertPayload({ ...preset.payload, source: preset.source, type_key: preset.type_key }, preset.source);
    const result = enqueueAlert(payload, broadcastWS);
    res.status(result.ok ? 200 : 400).json({ ...result, presetId: preset.id });
  });

  routes.registerGet(app, '/api/alerts/display-profiles', guard, (req, res) => res.json({ ok: true, profiles: listDisplayProfiles(req.query || {}) }));
  routes.registerPost(app, '/api/alerts/display-profiles', guard, (req, res) => {
    try { res.status(201).json(saveDisplayProfile(req.body || {})); }
    catch (err) { res.status(400).json({ ok:false, error:'display_profile_save_failed', message:err.message || String(err) }); }
  });
  routes.registerPut(app, '/api/alerts/display-profiles/:id', guard, (req, res) => {
    try { res.json(saveDisplayProfile({ ...(req.body || {}), id: req.params.id })); }
    catch (err) { res.status(400).json({ ok:false, error:'display_profile_save_failed', message:err.message || String(err) }); }
  });
  routes.registerDelete(app, '/api/alerts/display-profiles/:id', guard, (req, res) => res.json(deleteDisplayProfile(req.params.id)));
  routes.registerPost(app, '/api/alerts/display-profiles/:id/play', guard, (req, res) => {
    const profile = getDisplayProfileById(req.params.id);
    if (!profile) return res.status(404).json({ ok: false, error: 'display_profile_not_found' });
    const celebration = validateCelebration((req.body || {}).celebration || 'none');
    const payload = normalizeAlertPayload({ source:'twitch', type_key:'bits', user:'ForrestCGN', userLogin:'forrestcgn', amount:100, message:'Live-Vorschau aus dem Dashboard', displayProfileId: profile.id, celebration, meta:{ celebration } }, 'twitch');
    const result = enqueueAlert(payload, broadcastWS);
    res.status(result.ok ? 200 : 400).json({ ...result, displayProfileId: profile.id });
  });
  routes.registerGet(app, '/api/alerts/integration-check', guard, (req, res) => res.json(checkAlertIntegration()));

  routes.registerPost(app, '/api/alerts/events/:eventUid/replay', guard, (req, res) => {
    const result = replayAlertEvent(req.params.eventUid, broadcastWS);
    res.status(result.ok ? 200 : 400).json(result);
  });

  // Pragmatic Streamer.bot GET routes for first Twitch wiring. Values can also be posted to /api/alerts/enqueue.
  routes.registerGet(app, '/api/alerts/twitch/follow', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'follow', amount: 1 }, 'twitch'), broadcastWS)));
  routes.registerGet(app, '/api/alerts/twitch/raid', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'raid' }, 'twitch'), broadcastWS)));
  routes.registerGet(app, '/api/alerts/twitch/bits', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...req.query, source: 'twitch', type: 'bits' }, 'twitch'), broadcastWS)));
  routes.registerPost(app, '/api/alerts/twitch', guard, (req, res) => res.json(enqueueAlert(normalizeAlertPayload({ ...(req.body || {}), source: 'twitch' }, 'twitch'), broadcastWS)));

  routes.registerGet(app, '/api/alerts/rules', guard, (req, res) => res.json({ ok: true, rules: listRules(), types: listTypes(), assets: listAssets() }));
  routes.registerPost(app, '/api/alerts/rules', guard, (req, res) => res.status(201).json(saveRule(req.body || {})));
  routes.registerPut(app, '/api/alerts/rules/:id', guard, (req, res) => res.json(saveRule({ ...(req.body || {}), id: req.params.id })));
  routes.registerDelete(app, '/api/alerts/rules/:id', guard, (req, res) => res.json(deleteRule(req.params.id)));
  routes.registerPost(app, '/api/alerts/rules/validate', guard, (req, res) => res.json(validateRules(req.body || {})));

  routes.registerGet(app, '/api/alerts/assets', guard, (req, res) => res.json({ ok: true, assets: listAssets(), multerReady: !!multer, multerLoadError }));
  routes.registerPost(app, '/api/alerts/assets/upload', guard, (req, res, next) => {
    if (!upload) return res.status(500).json({ ok: false, error: 'multer_not_available', message: 'multer ist nicht installiert oder konnte nicht geladen werden.', detail: multerLoadError });
    upload.single('file')(req, res, err => {
      if (err) return res.status(400).json({ ok: false, error: 'upload_failed', message: err.message || String(err) });
      try {
        return res.status(201).json(registerUploadedAsset(req));
      } catch (e) {
        return next(e);
      }
    });
  });
  routes.registerDelete(app, '/api/alerts/assets/:id', guard, (req, res) => res.json(deleteAsset(req.params.id, req.query.deleteFile === '1')));
  routes.registerGet(app, '/api/alerts/assets/:id/usage', guard, (req, res) => res.json(assetUsage(req.params.id)));
  routes.registerPost(app, '/api/alerts/assets/scan-durations', guard, (req, res) => res.json(scanSoundDurations(req.body || {})));

  routes.registerGet(app, '/api/alerts/settings', guard, (req, res) => res.json({ ok: true, settings: getSettings(), config: publicConfig() }));
  routes.registerPost(app, '/api/alerts/settings', guard, (req, res) => res.json(saveSettings(req.body || {})));
  routes.registerGet(app, '/api/alerts/config', guard, (req, res) => res.json({ ok: true, config: publicConfig() }));
  routes.registerPost(app, '/api/alerts/config', guard, (req, res) => res.json(saveAlertConfig(req.body || {})));

  console.log('[alert_system] STEP126 Preview-Overlay Unified aktiv');
};

function ensureRuntime(ctx) {
  if (!sqlite.isInitialized()) sqlite.init(ctx);
}

function reloadConfig() {
  const loaded = configHelper.loadConfig('alert_system.json', DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  state.config = { ...DEFAULT_CONFIG, ...(loaded.config || {}) };
  const messages = configHelper.loadConfig('messages/alerts.json', DEFAULT_MESSAGES, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  state.messages = { ...DEFAULT_MESSAGES, ...(messages.config || {}) };
  return { config: loaded, messages };
}

function ensureDirs() {
  core.ensureDir(absRoot(state.config.soundsDir));
  core.ensureDir(absRoot(state.config.imagesDir));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/icons'));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/special'));
  core.ensureDir(absRoot('htdocs/assets/images/alerts/backgrounds'));
}

function ensureSchema() {
  sqlite.ensureSchema(MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
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

      CREATE TABLE IF NOT EXISTS alert_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_type TEXT NOT NULL,
        label TEXT NOT NULL,
        file_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT '',
        size_bytes INTEGER NOT NULL DEFAULT 0,
        original_name TEXT NOT NULL DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
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
        updated_at TEXT NOT NULL,
        FOREIGN KEY(sound_asset_id) REFERENCES alert_assets(id) ON DELETE SET NULL,
        FOREIGN KEY(image_asset_id) REFERENCES alert_assets(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_rules_lookup ON alert_rules(source, type_key, enabled, min_value, max_value, priority);

      CREATE TABLE IF NOT EXISTS alert_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_uid TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        type_key TEXT NOT NULL,
        user_login TEXT NOT NULL DEFAULT '',
        user_display TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        message TEXT NOT NULL DEFAULT '',
        rule_id INTEGER,
        status TEXT NOT NULL DEFAULT 'queued',
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_events_created ON alert_events(created_at DESC);

      CREATE TABLE IF NOT EXISTS alert_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
      return;
    }

    if (toVersion === 2) {
      addColumnIfMissing(db, 'alert_assets', 'duration_ms', 'INTEGER NOT NULL DEFAULT 0');
      addColumnIfMissing(db, 'alert_assets', 'probe_json', "TEXT NOT NULL DEFAULT '{}'");
      addColumnIfMissing(db, 'alert_rules', 'duration_mode', "TEXT NOT NULL DEFAULT 'fixed'");
      addColumnIfMissing(db, 'alert_rules', 'tts_enabled', 'INTEGER NOT NULL DEFAULT 0');
      addColumnIfMissing(db, 'alert_rules', 'tts_timing', "TEXT NOT NULL DEFAULT 'after_alert'");
      addColumnIfMissing(db, 'alert_rules', 'tts_mode', "TEXT NOT NULL DEFAULT 'audio_only'");
      addColumnIfMissing(db, 'alert_rules', 'tts_template', "TEXT NOT NULL DEFAULT '{user} schreibt: {message}'");
      addColumnIfMissing(db, 'alert_rules', 'tts_max_chars', 'INTEGER NOT NULL DEFAULT 250');
      addColumnIfMissing(db, 'alert_rules', 'tts_min_amount', 'REAL');
      return;
    }


    if (toVersion === 3) {
      db.exec(`
      CREATE TABLE IF NOT EXISTS alert_text_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        rule_id INTEGER,
        label TEXT NOT NULL DEFAULT '',
        title_template TEXT NOT NULL DEFAULT '',
        headline_template TEXT NOT NULL DEFAULT '',
        value_template TEXT NOT NULL DEFAULT '',
        subline_template TEXT NOT NULL DEFAULT '',
        message_template TEXT NOT NULL DEFAULT '',
        message_mode TEXT NOT NULL DEFAULT 'auto',
        hide_subline_when_message_exists INTEGER NOT NULL DEFAULT 1,
        pick_weight INTEGER NOT NULL DEFAULT 100,
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_alert_text_variants_lookup ON alert_text_variants(source, type_key, rule_id, enabled, sort_order);

      CREATE TABLE IF NOT EXISTS alert_test_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'twitch',
        type_key TEXT NOT NULL,
        rule_id INTEGER,
        label TEXT NOT NULL,
        payload_json TEXT NOT NULL DEFAULT '{}',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alert_test_presets_lookup ON alert_test_presets(source, type_key, enabled, sort_order);
    `);
      addColumnIfMissing(db, 'alert_events', 'final_title', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_headline', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_value', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_subline', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'final_message', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_events', 'text_variant_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'provider_logo_url', "TEXT NOT NULL DEFAULT ''");
      return;
    }

    if (toVersion === 4) {
      db.exec(`
      CREATE TABLE IF NOT EXISTS alert_display_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        is_default INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        settings_json TEXT NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_alert_display_profiles_default ON alert_display_profiles(enabled, is_default, sort_order);
    `);
      addColumnIfMissing(db, 'alert_rules', 'display_profile_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'display_profile_id', 'INTEGER');
      addColumnIfMissing(db, 'alert_events', 'display_settings_json', "TEXT NOT NULL DEFAULT '{}'");
      return;
    }

    if (toVersion === 5) {
      createChatBlocksSchema(db);
      return;
    }

    if (toVersion === 6) {
      addColumnIfMissing(db, 'alert_rules', 'sound_output_target', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_rules', 'sound_category', "TEXT NOT NULL DEFAULT ''");
      addColumnIfMissing(db, 'alert_rules', 'sound_priority', 'INTEGER');
      addColumnIfMissing(db, 'alert_rules', 'sound_volume', 'INTEGER');
      return;
    }
  });
}

function createChatBlocksSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_chat_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL DEFAULT 'twitch',
      type_key TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      texts_json TEXT NOT NULL DEFAULT '[]',
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 100,
      meta_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_alert_chat_blocks_lookup ON alert_chat_blocks(source, type_key, enabled, sort_order);
  `);
  addColumnIfMissing(db, 'alert_events', 'final_chat_message', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'alert_events', 'chat_message_status', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'alert_events', 'chat_message_error', "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_chat_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_uid TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '',
      type_key TEXT NOT NULL DEFAULT '',
      rule_id INTEGER,
      chat_block_id INTEGER,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      sent_at TEXT,
      consumed_at TEXT
    );
  `);
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const table = String(tableName || '').replace(/[^a-zA-Z0-9_]/g, '');
  const column = String(columnName || '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!table || !column) return false;
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  if (rows.some(row => String(row.name || '').toLowerCase() === column.toLowerCase())) return false;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  return true;
}

function seedDefaults() {
  const now = nowIso();
  const types = [
    ['twitch', 'follow', 'Follow', 'count', 10],
    ['twitch', 'bits', 'Bits / Cheers', 'amount', 20],
    ['twitch', 'sub', 'Sub', 'count', 30],
    ['twitch', 'resub', 'Resub', 'count', 40],
    ['twitch', 'gift_sub', 'Gift Sub', 'amount', 50],
    ['twitch', 'gift_bomb', 'Gift Bomb', 'amount', 60],
    ['twitch', 'raid', 'Raid', 'amount', 70],
    ['kofi', 'donation', 'Ko-fi Donation', 'amount', 100],
    ['tipeee', 'donation', 'Tipeee Donation', 'amount', 110]
  ];
  for (const [source, typeKey, label, valueKind, sortOrder] of types) {
    sqlite.run(`
      INSERT INTO alert_types (source, type_key, label, value_kind, enabled, sort_order, created_at, updated_at)
      VALUES (:source, :typeKey, :label, :valueKind, 1, :sortOrder, :now, :now)
      ON CONFLICT(source, type_key) DO UPDATE SET
        label = excluded.label,
        value_kind = excluded.value_kind,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `, { source, typeKey, label, valueKind, sortOrder, now });
  }

  const count = sqlite.get(`SELECT COUNT(*) AS c FROM alert_rules`)?.c || 0;
  if (Number(count) === 0) {
    const defaults = [
      { source: 'twitch', type_key: 'follow', label: 'Follow Standard', min_value: 0, max_value: null, tier: 'normal', priority: 100, duration_ms: 6500, image_mode: 'avatar_icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 1-100', min_value: 1, max_value: 100, tier: 'small', priority: 100, duration_ms: 6500, image_mode: 'icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 101-500', min_value: 101, max_value: 500, tier: 'medium', priority: 90, duration_ms: 7500, image_mode: 'avatar_icon' },
      { source: 'twitch', type_key: 'bits', label: 'Bits 501+', min_value: 501, max_value: null, tier: 'big', priority: 70, duration_ms: 9500, image_mode: 'special' },
      { source: 'twitch', type_key: 'raid', label: 'Raid Standard', min_value: 1, max_value: null, tier: 'big', priority: 60, duration_ms: 10000, image_mode: 'avatar_special' },
      { source: 'twitch', type_key: 'sub', label: 'Sub Standard', min_value: 0, max_value: null, tier: 'medium', priority: 80, duration_ms: 8000, image_mode: 'avatar_icon' }
    ];
    defaults.forEach(rule => saveRule({ ...rule, enabled: 1 }, true));
  }
  seedAlertTextVariants();
  seedAlertChatBlocks();
  seedAlertTestPresets();
  seedDisplayProfiles();
}

function seedAlertChatBlocks() {
  const count = sqlite.get(`SELECT COUNT(*) AS c FROM alert_chat_blocks`)?.c || 0;
  if (Number(count) > 0) return;
  const defaults = [
    { source:'twitch', type_key:'follow', label:'Follow Danke', sort_order:10, texts:[
      'Danke für den Follow, {userDisplayName}! Willkommen in der CGN-Community 💜',
      'Willkommen {userDisplayName}! Schön, dass du da bist 💜'
    ]},
    { source:'twitch', type_key:'bits', label:'Bits Danke', sort_order:20, texts:[
      '{userDisplayName} haut {amountFormatted} raus. Vielen Dank! 💜',
      'Danke {userDisplayName} für {amountFormatted}! 💜'
    ]},
    { source:'twitch', type_key:'raid', label:'Raid Willkommen', sort_order:30, texts:[
      '{userDisplayName} raidet mit {viewerCount} Leuten. Willkommen bei CGN! 💜',
      'Raid incoming von {userDisplayName}! Macht es euch gemütlich 💜'
    ]},
    { source:'kofi', type_key:'donation', label:'Ko-fi Danke', sort_order:40, texts:[
      '{userDisplayName} spendet {amountFormatted} über Ko-fi. Vielen lieben Dank! 💜',
      'Danke {userDisplayName} für die Ko-fi-Unterstützung über {amountFormatted}! 💜'
    ]},
    { source:'tipeee', type_key:'donation', label:'Tipeee Danke', sort_order:50, texts:[
      '{userDisplayName} spendet {amountFormatted} über Tipeee. Vielen lieben Dank! 💜',
      'Danke {userDisplayName} für die Tipeee-Unterstützung über {amountFormatted}! 💜'
    ]}
  ];
  defaults.forEach(block => saveChatBlock({ ...block, enabled:1 }));
}

function buildStatus(req = null) {
  const counts = getAlertCounts();
  const ffprobe = buildFfprobeStatus();
  return {
    ok: true,
    module: MODULE,
    version: 3,
    step: MODULE_STEP,
    enabled: state.config.enabled !== false,
    overlayEnabled: state.config.overlayEnabled !== false,
    queueEnabled: state.config.queueEnabled !== false,
    uploadEnabled: state.config.uploadEnabled !== false,
    queueLength: state.queue.length,
    current: state.current,
    currentEventId: state.current ? state.current.eventUid : null,
    history: state.history.slice(0, 10),
    overlayClients: state.overlayClients.size,
    multerReady: !!multer,
    multerLoadError,
    ffprobe,
    counts,
    databasePath: sqlite.getDbPath(),
    schemaVersion: sqlite.getSchemaVersion(MODULE),
    security: req ? security.securitySummary(req) : security.securitySummary(),
    config: publicConfig()
  };
}

function buildHealth(req = null) {
  const status = buildStatus(req);
  const warnings = [];
  if (!status.multerReady) warnings.push({ key: 'multer_missing', message: 'Uploads sind nicht verfÃ¼gbar, weil multer nicht geladen werden konnte.', detail: status.multerLoadError || '' });
  if (!status.ffprobe.available) warnings.push({ key: 'ffprobe_missing', message: 'SoundlÃ¤ngen kÃ¶nnen nicht automatisch gelesen werden.', detail: status.ffprobe.error || '' });
  if (!status.overlayClients) warnings.push({ key: 'overlay_not_connected', message: 'Aktuell ist kein Alert-Overlay per WebSocket verbunden.' });
  if (status.counts.soundAssets > 0 && status.counts.soundAssetsWithoutDuration > 0) warnings.push({ key: 'sound_durations_missing', message: `${status.counts.soundAssetsWithoutDuration} Sound-Asset(s) haben noch keine bekannte LÃ¤nge.` });
  return { ok: true, module: MODULE, step: MODULE_STEP, healthy: warnings.length === 0, warnings, status };
}

function getAlertCounts() {
  const row = sqlite.get(`
    SELECT
      (SELECT COUNT(*) FROM alert_types) AS types,
      (SELECT COUNT(*) FROM alert_rules) AS rules,
      (SELECT COUNT(*) FROM alert_rules WHERE enabled = 1) AS enabledRules,
      (SELECT COUNT(*) FROM alert_assets) AS assets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound') AS soundAssets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'image') AS imageAssets,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound' AND COALESCE(duration_ms, 0) > 0) AS soundAssetsWithDuration,
      (SELECT COUNT(*) FROM alert_assets WHERE asset_type = 'sound' AND COALESCE(duration_ms, 0) <= 0) AS soundAssetsWithoutDuration,
      (SELECT COUNT(*) FROM alert_events) AS events,
      (SELECT COUNT(*) FROM alert_events WHERE created_at >= datetime('now', '-1 day')) AS eventsLast24h,
      (SELECT COUNT(*) FROM alert_text_variants) AS textVariants,
      (SELECT COUNT(*) FROM alert_test_presets) AS testPresets,
      (SELECT COUNT(*) FROM alert_display_profiles) AS displayProfiles,
      (SELECT COUNT(*) FROM alert_chat_blocks) AS chatBlocks
  `) || {};
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v || 0)]));
}

function buildFfprobeStatus() {
  const ffprobe = media.findFfprobe({ timeoutMs: state.config.ffprobeTimeoutMs });
  const looksLikePath = ffprobe && ffprobe !== 'ffprobe';
  return {
    available: ffprobe === 'ffprobe' || (looksLikePath && fs.existsSync(ffprobe)),
    path: ffprobe,
    cache: media.durationCacheInfo()
  };
}

function publicConfig() {
  const cfg = { ...state.config };
  const runtime = getRuntimeAlertSettings();
  cfg.preview = runtime.preview;
  cfg.liveAlert = runtime.liveAlert;
  cfg.dashboardSettings = runtime.dashboardSettings;
  return cfg;
}


function saveAlertConfig(input = {}) {
  const boolKeys = ['enabled','overlayEnabled','dashboardEnabled','queueEnabled','uploadEnabled','allowLanUploads','autoDurationOnUpload','avatarResolveEnabled','chatMessageEnabled'];
  const numberKeys = ['maxSoundSizeBytes','maxImageSizeBytes','fallbackFinishMs','gapBetweenAlertsMs','defaultDurationMs','defaultIntroMs','defaultOutroMs','soundDurationPaddingMs','minAutoDurationMs','maxAutoDurationMs','ffprobeTimeoutMs','avatarResolveTimeoutMs','avatarResolveCacheMs','chatMessageTimeoutMs','chatMessageOutboxLimit'];
  const stringKeys = ['soundsDir','imagesDir','wsOp','avatarResolveUserinfoUrl','chatMessagePostUrl','chatMessagePostMethod'];
  const runtimeSettingKeys = ['preview', 'liveAlert', 'dashboardSettings'];
  const next = { ...state.config };
  const runtimeUpdates = {};
  for (const key of boolKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) next[key] = input[key] === true || String(input[key]) === 'true' || input[key] === 1 || String(input[key]) === '1';
  }
  for (const key of numberKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = Number(input[key]);
      if (Number.isFinite(value) && value >= 0) next[key] = value;
    }
  }
  for (const key of stringKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) next[key] = cleanText(input[key]);
  }
  for (const key of runtimeSettingKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      runtimeUpdates[key] = sanitizeSettingsObject(input[key]);
    }
  }
  state.config = { ...DEFAULT_CONFIG, ...next };
  if (Object.keys(runtimeUpdates).length) saveSettings(runtimeUpdates);
  const configPath = configHelper.resolveConfigFile('alert_system.json');
  configHelper.writeJsonFile(configPath, state.config, { spaces: 2 });
  ensureDirs();
  return { ok: true, config: publicConfig(), settings: getSettings(), runtime: getRuntimeAlertSettings(), configPath };
}


function checkAlertIntegration() {
  const warnings = [];
  const profiles = listDisplayProfiles();
  const defaultProfile = profiles.find(p => Number(p.is_default) === 1 && Number(p.enabled) === 1) || profiles.find(p => Number(p.enabled) === 1);
  if (!defaultProfile) warnings.push({ level:'error', area:'display_profiles', message:'Kein aktives Standard-Design-Profil vorhanden.' });

  const rules = listRules();
  const variants = listTextVariants({});
  const presets = listTestPresets({});
  const chatBlocks = listChatBlocks({});
  const profileIds = new Set(profiles.map(p => Number(p.id)));

  for (const r of rules) {
    if (r.display_profile_id !== null && r.display_profile_id !== undefined && r.display_profile_id !== '' && !profileIds.has(Number(r.display_profile_id))) {
      warnings.push({ level:'warning', area:'rules', ruleId:r.id, message:`Regel "${r.label}" verweist auf ein fehlendes Design-Profil (${r.display_profile_id}).` });
    }
    const hasVariant = variants.some(v => Number(v.enabled) === 1 && v.source === r.source && v.type_key === r.type_key && (v.rule_id === null || v.rule_id === undefined || Number(v.rule_id) === Number(r.id)));
    if (Number(r.enabled) === 1 && !hasVariant) {
      warnings.push({ level:'warning', area:'texts', ruleId:r.id, message:`Für ${r.source}/${r.type_key} ist keine aktive Textvariante gefunden.` });
    }
  }

  for (const p of presets) {
    const matchingRules = rules.filter(r => Number(r.enabled) === 1 && r.source === p.source && r.type_key === p.type_key);
    if (!matchingRules.length) warnings.push({ level:'info', area:'presets', presetId:p.id, message:`Testpreset "${p.label}" hat keine aktive Regel für ${p.source}/${p.type_key}.` });
  }

  return {
    ok: true,
    healthy: !warnings.some(w => w.level === 'error'),
    warnings,
    counts: {
      rules: rules.length,
      displayProfiles: profiles.length,
      textVariants: variants.length,
      testPresets: presets.length,
      chatBlocks: chatBlocks.length,
      rulesWithDesignProfile: rules.filter(r => r.display_profile_id !== null && r.display_profile_id !== undefined && r.display_profile_id !== '').length,
      rulesUsingDefaultProfile: rules.filter(r => r.display_profile_id === null || r.display_profile_id === undefined || r.display_profile_id === '').length
    },
    defaultDisplayProfile: defaultProfile ? { id: defaultProfile.id, name: defaultProfile.name } : null
  };
}

function listTypes() {
  return sqlite.all(`SELECT * FROM alert_types ORDER BY sort_order ASC, label ASC`);
}

function listAssets() {
  return sqlite.all(`SELECT * FROM alert_assets ORDER BY created_at DESC, id DESC`).map(row => ({ ...row, meta: parseJson(row.meta_json, {}) }));
}

function listChatBlocks(filter = {}) {
  const where = [];
  const params = {};
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.type || '');
  if (source && source !== 'all') { where.push('source = :source'); params.source = source; }
  if (typeKey && typeKey !== 'all') { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_chat_blocks ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, sort_order ASC, id ASC`;
  return sqlite.all(sql, params).map(row => ({ ...row, texts: parseChatTexts(row.texts_json), meta: parseJson(row.meta_json, {}) }));
}

function getChatBlockById(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return null;
  const row = sqlite.get(`SELECT * FROM alert_chat_blocks WHERE id=:id`, { id });
  return row ? { ...row, texts: parseChatTexts(row.texts_json), meta: parseJson(row.meta_json, {}) } : null;
}

function saveChatBlock(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const texts = parseChatTexts(input.texts_json ?? input.textsJson ?? input.texts ?? input.lines ?? []);
  const row = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || input.type || 'bits'),
    label: cleanText(input.label || 'Chat-Textblock').slice(0, 140),
    textsJson: JSON.stringify(texts),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {})),
    now
  };
  if (!row.label) row.label = 'Chat-Textblock';
  if (id > 0) {
    sqlite.run(`UPDATE alert_chat_blocks SET source=:source, type_key=:typeKey, label=:label, texts_json=:textsJson, enabled=:enabled, sort_order=:sortOrder, meta_json=:metaJson, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok:true, id, block:getChatBlockById(id) };
  }
  const result = sqlite.run(`INSERT INTO alert_chat_blocks (source, type_key, label, texts_json, enabled, sort_order, meta_json, created_at, updated_at) VALUES (:source, :typeKey, :label, :textsJson, :enabled, :sortOrder, :metaJson, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok:true, id:newId, block:getChatBlockById(newId) };
}

function deleteChatBlock(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok:false, error:'invalid_id' };
  sqlite.run(`DELETE FROM alert_chat_blocks WHERE id=:id`, { id });
  return { ok:true, id };
}

function parseChatTexts(value) {
  let arr = value;
  if (typeof value === 'string') {
    try { arr = JSON.parse(value); }
    catch (_) { arr = value.split(/\r?\n/); }
  }
  if (!Array.isArray(arr)) arr = [];
  return arr.map(v => cleanTemplate(v)).filter(Boolean).slice(0, 50);
}

function listRules() {
  return sqlite.all(`
    SELECT r.*, s.label AS sound_label, s.public_url AS sound_url, s.duration_ms AS sound_duration_ms, i.label AS image_label, i.public_url AS image_url, dp.name AS display_profile_name
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id
    LEFT JOIN alert_display_profiles dp ON dp.id = r.display_profile_id
    ORDER BY r.source ASC, r.type_key ASC, COALESCE(r.min_value, -999999) ASC, r.priority ASC, r.id ASC
  `).map(enrichAlertRuleRow);
}

function enrichAlertRuleRow(row) {
  if (!row) return null;
  const meta = parseJson(row.meta_json, {});
  const soundOutputTarget = cleanKey(row.sound_output_target || '');
  const soundCategory = cleanKey(row.sound_category || '');
  const soundPriority = row.sound_priority === null || row.sound_priority === undefined || row.sound_priority === '' ? null : Number(row.sound_priority);
  const soundVolume = row.sound_volume === null || row.sound_volume === undefined || row.sound_volume === '' ? null : Number(row.sound_volume);
  return {
    ...row,
    meta,
    soundRouting: {
      outputTarget: soundOutputTarget,
      category: soundCategory,
      priority: Number.isFinite(soundPriority) ? soundPriority : null,
      volume: Number.isFinite(soundVolume) ? soundVolume : null
    }
  };
}

function saveRule(input, silent = false) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const rule = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || input.type || 'follow'),
    label: cleanText(input.label || 'Alert Regel'),
    minValue: nullableNumber(input.min_value ?? input.minValue),
    maxValue: nullableNumber(input.max_value ?? input.maxValue),
    tier: 'normal',
    priority: toInt(input.priority, 100),
    durationMs: clamp(toInt(input.duration_ms ?? input.durationMs, state.config.defaultDurationMs), 1000, 60000),
    durationMode: cleanKey(input.duration_mode || input.durationMode || 'fixed') === 'sound' ? 'sound' : 'fixed',
    animation: 'neon_card',
    imageMode: 'none',
    soundAssetId: nullableInt(input.sound_asset_id ?? input.soundAssetId),
    soundOutputTarget: validateSoundOutputTarget(input.sound_output_target ?? input.soundOutputTarget ?? input.outputTarget ?? ''),
    soundCategory: validateSoundCategory(input.sound_category ?? input.soundCategory ?? ''),
    soundPriority: nullablePriority(input.sound_priority ?? input.soundPriority),
    soundVolume: nullableVolume(input.sound_volume ?? input.soundVolume),
    imageAssetId: null,
    displayProfileId: nullableInt(input.display_profile_id ?? input.displayProfileId),
    enabled: boolInt(input.enabled, true),
    ttsEnabled: boolInt(input.tts_enabled ?? input.ttsEnabled, false),
    ttsTiming: validateTtsTiming(input.tts_timing || input.ttsTiming || 'after_alert'),
    ttsMode: validateTtsMode(input.tts_mode || input.ttsMode || 'audio_only'),
    ttsTemplate: cleanText(input.tts_template || input.ttsTemplate || '{user} schreibt: {message}').slice(0, 1000),
    ttsMaxChars: clamp(toInt(input.tts_max_chars ?? input.ttsMaxChars, 250), 1, 1000),
    ttsMinAmount: nullableNumber(input.tts_min_amount ?? input.ttsMinAmount),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {}))
  };
  if (rule.maxValue !== null && rule.minValue !== null && rule.maxValue < rule.minValue) throw new Error('max_value darf nicht kleiner als min_value sein.');

  if (id > 0) {
    sqlite.run(`
      UPDATE alert_rules SET
        source=:source, type_key=:typeKey, label=:label, min_value=:minValue, max_value=:maxValue, tier=:tier,
        priority=:priority, duration_ms=:durationMs, duration_mode=:durationMode, animation=:animation, image_mode=:imageMode,
        sound_asset_id=:soundAssetId, sound_output_target=:soundOutputTarget, sound_category=:soundCategory, sound_priority=:soundPriority, sound_volume=:soundVolume,
        image_asset_id=:imageAssetId, display_profile_id=:displayProfileId, enabled=:enabled,
        tts_enabled=:ttsEnabled, tts_timing=:ttsTiming, tts_mode=:ttsMode, tts_template=:ttsTemplate, tts_max_chars=:ttsMaxChars, tts_min_amount=:ttsMinAmount,
        meta_json=:metaJson, updated_at=:now
      WHERE id=:id
    `, { ...rule, id, now });
    return { ok: true, id, rule: sqlite.get(`SELECT * FROM alert_rules WHERE id=:id`, { id }) };
  }

  const result = sqlite.run(`
    INSERT INTO alert_rules (source, type_key, label, min_value, max_value, tier, priority, duration_ms, duration_mode, animation, image_mode, sound_asset_id, sound_output_target, sound_category, sound_priority, sound_volume, image_asset_id, display_profile_id, enabled, tts_enabled, tts_timing, tts_mode, tts_template, tts_max_chars, tts_min_amount, meta_json, created_at, updated_at)
    VALUES (:source, :typeKey, :label, :minValue, :maxValue, :tier, :priority, :durationMs, :durationMode, :animation, :imageMode, :soundAssetId, :soundOutputTarget, :soundCategory, :soundPriority, :soundVolume, :imageAssetId, :displayProfileId, :enabled, :ttsEnabled, :ttsTiming, :ttsMode, :ttsTemplate, :ttsMaxChars, :ttsMinAmount, :metaJson, :now, :now)
  `, { ...rule, now });
  const newId = Number(result.lastInsertRowid || 0);
  if (!silent) return { ok: true, id: newId, rule: sqlite.get(`SELECT * FROM alert_rules WHERE id=:id`, { id: newId }) };
  return { ok: true, id: newId };
}

function deleteRule(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  sqlite.run(`DELETE FROM alert_rules WHERE id=:id`, { id });
  return { ok: true, id };
}

function validateRules(input) {
  const source = cleanKey(input.source || 'twitch');
  const typeKey = cleanKey(input.type_key || input.typeKey || input.type || 'bits');
  const rules = listRules().filter(r => r.source === source && r.type_key === typeKey && Number(r.enabled) === 1);
  const warnings = [];
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (rangesOverlap(rules[i], rules[j])) warnings.push({ type: 'overlap', ruleA: rules[i].id, ruleB: rules[j].id, message: `${rules[i].label} Ã¼berschneidet sich mit ${rules[j].label}` });
    }
  }
  return { ok: true, source, type_key: typeKey, warnings, rules };
}

function rangesOverlap(a, b) {
  const amin = a.min_value === null ? -Infinity : Number(a.min_value);
  const amax = a.max_value === null ? Infinity : Number(a.max_value);
  const bmin = b.min_value === null ? -Infinity : Number(b.min_value);
  const bmax = b.max_value === null ? Infinity : Number(b.max_value);
  return amin <= bmax && bmin <= amax;
}

function createUploadMiddleware() {
  if (!multer) return null;
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const assetType = detectAssetType(file.mimetype, req.body.assetType || req.query.assetType);
      const base = assetType === 'sound' ? absRoot(state.config.soundsDir) : imageTargetDir(req.body.imageCategory || req.query.imageCategory);
      core.ensureDir(base);
      cb(null, base);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = sanitizeFilename(path.basename(file.originalname || 'asset', ext));
      cb(null, `${Date.now()}_${base}${safeExt(ext)}`);
    }
  });
  return multer({
    storage,
    limits: { fileSize: Math.max(Number(state.config.maxSoundSizeBytes || 0), Number(state.config.maxImageSizeBytes || 0)) || 15728640 },
    fileFilter(req, file, cb) {
      const assetType = detectAssetType(file.mimetype, req.body.assetType || req.query.assetType);
      const allowed = assetType === 'sound' ? state.config.allowedSoundTypes : state.config.allowedImageTypes;
      if (!allowed.includes(file.mimetype)) return cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`));
      cb(null, true);
    }
  });
}

function registerUploadedAsset(req) {
  if (!req.file) return { ok: false, error: 'missing_file' };
  const assetType = detectAssetType(req.file.mimetype, req.body.assetType || req.query.assetType);
  const rel = relRoot(req.file.path).replace(/\\/g, '/');
  const publicUrl = '/' + rel.replace(/^htdocs\//, '');
  const now = nowIso();
  const label = cleanText(req.body.label || req.query.label || path.basename(req.file.originalname || req.file.filename));
  const probe = assetType === 'sound' && state.config.autoDurationOnUpload !== false ? probeSoundFile(req.file.path) : { ok: false, durationMs: 0, error: assetType === 'sound' ? 'auto_duration_disabled' : 'not_sound' };
  const meta = {
    imageCategory: req.body.imageCategory || req.query.imageCategory || '',
    uploadedBy: req.body.uploadedBy || req.query.uploadedBy || '',
    durationMs: probe.durationMs || 0,
    durationOk: !!probe.ok,
    durationError: probe.error || ''
  };
  const result = sqlite.run(`
    INSERT INTO alert_assets (asset_type, label, file_path, public_url, mime_type, size_bytes, original_name, enabled, duration_ms, probe_json, meta_json, created_at, updated_at)
    VALUES (:assetType, :label, :filePath, :publicUrl, :mimeType, :sizeBytes, :originalName, 1, :durationMs, :probeJson, :metaJson, :now, :now)
  `, {
    assetType,
    label,
    filePath: rel,
    publicUrl,
    mimeType: req.file.mimetype || '',
    sizeBytes: Number(req.file.size || 0),
    originalName: req.file.originalname || '',
    durationMs: Number(probe.durationMs || 0),
    probeJson: JSON.stringify(probe),
    metaJson: JSON.stringify(meta),
    now
  });
  const id = Number(result.lastInsertRowid || 0);
  return { ok: true, id, asset: sqlite.get(`SELECT * FROM alert_assets WHERE id=:id`, { id }) };
}

function deleteAsset(idRaw, deleteFile) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  const usage = assetUsage(id);
  if ((usage.soundRules.length || usage.imageRules.length) && !deleteFile) {
    return { ok: false, error: 'asset_in_use', usage };
  }
  const asset = sqlite.get(`SELECT * FROM alert_assets WHERE id=:id`, { id });
  if (!asset) return { ok: false, error: 'not_found' };
  sqlite.run(`DELETE FROM alert_assets WHERE id=:id`, { id });
  if (deleteFile) {
    const filePath = absRoot(asset.file_path);
    if (filePath.startsWith(configHelper.getRootDir()) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return { ok: true, id, deletedFile: !!deleteFile };
}

function assetUsage(idRaw) {
  const id = toInt(idRaw, 0);
  return {
    ok: true,
    id,
    soundRules: sqlite.all(`SELECT id, label FROM alert_rules WHERE sound_asset_id=:id`, { id }),
    imageRules: sqlite.all(`SELECT id, label FROM alert_rules WHERE image_asset_id=:id`, { id })
  };
}

function scanSoundDurations(input = {}) {
  const force = input.force === true || input.force === 1 || input.force === '1' || input.force === 'true';
  const rows = sqlite.all(`SELECT * FROM alert_assets WHERE asset_type = 'sound' ORDER BY id ASC`);
  const result = { ok: true, scanned: 0, updated: 0, skipped: 0, failed: 0, rows: [] };
  for (const row of rows) {
    if (!force && Number(row.duration_ms || 0) > 0) {
      result.skipped += 1;
      result.rows.push({ id: row.id, label: row.label, skipped: true, durationMs: Number(row.duration_ms || 0) });
      continue;
    }
    result.scanned += 1;
    const filePath = absRoot(row.file_path);
    const probe = probeSoundFile(filePath);
    const meta = { ...parseJson(row.meta_json, {}), durationMs: probe.durationMs || 0, durationOk: !!probe.ok, durationError: probe.error || '' };
    sqlite.run(`UPDATE alert_assets SET duration_ms=:durationMs, probe_json=:probeJson, meta_json=:metaJson, updated_at=:now WHERE id=:id`, {
      id: row.id,
      durationMs: Number(probe.durationMs || 0),
      probeJson: JSON.stringify(probe),
      metaJson: JSON.stringify(meta),
      now: nowIso()
    });
    if (probe.ok) result.updated += 1; else result.failed += 1;
    result.rows.push({ id: row.id, label: row.label, ok: probe.ok, durationMs: probe.durationMs || 0, error: probe.error || '' });
  }
  result.assets = listAssets();
  return result;
}

function probeSoundFile(filePath) {
  const probe = media.readAudioDurationMs(filePath, { timeoutMs: Number(state.config.ffprobeTimeoutMs || 5000) });
  return {
    ok: !!probe.ok,
    durationMs: Number(probe.durationMs || 0),
    cached: !!probe.cached,
    error: probe.error || '',
    probedAt: nowIso(),
    ffprobePath: media.findFfprobe()
  };
}

function readSettingsRows() {
  try {
    return sqlite.all(`SELECT key, value_json, updated_at FROM alert_settings ORDER BY key ASC`);
  } catch (_) {
    return [];
  }
}

function getSettings() {
  const out = {};
  for (const row of readSettingsRows()) out[row.key] = parseJson(row.value_json, null);
  return out;
}

function deepMergePlain(base, override) {
  const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) };
  if (!override || typeof override !== 'object' || Array.isArray(override)) return out;
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMergePlain(out[key], value);
    else out[key] = value;
  }
  return out;
}

function settingAlias(settings, canonicalKey, ...aliases) {
  let merged = {};
  for (const key of [canonicalKey, ...aliases]) {
    if (settings && settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
      merged = deepMergePlain(merged, settings[key]);
    }
  }
  return merged;
}

function canonicalSettingsKey(rawKey) {
  const compact = String(rawKey || '').trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (compact === 'livealert') return 'liveAlert';
  if (compact === 'dashboardsettings') return 'dashboardSettings';
  if (compact === 'preview') return 'preview';
  return cleanKey(rawKey);
}

function getRuntimeAlertSettings() {
  const settings = getSettings();
  const previewSettings = settingAlias(settings, 'preview');
  const liveAlertSettings = settingAlias(settings, 'liveAlert', 'livealert', 'live_alert');
  const dashboardSettings = settingAlias(settings, 'dashboardSettings', 'dashboardsettings', 'dashboard_settings');
  return {
    preview: deepMergePlain(DEFAULT_CONFIG.preview, deepMergePlain(state.config.preview, previewSettings)),
    liveAlert: deepMergePlain(DEFAULT_CONFIG.liveAlert, deepMergePlain(state.config.liveAlert, liveAlertSettings)),
    dashboardSettings: deepMergePlain(DEFAULT_CONFIG.dashboardSettings, deepMergePlain(state.config.dashboardSettings, dashboardSettings))
  };
}

function sanitizeSettingsObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value));
}

function saveSettings(input) {
  const now = nowIso();
  const data = input.settings && typeof input.settings === 'object' ? input.settings : input;
  for (const [key, value] of Object.entries(data || {})) {
    const clean = canonicalSettingsKey(key);
    if (!clean) continue;
    sqlite.run(`
      INSERT INTO alert_settings (key, value_json, updated_at)
      VALUES (:key, :valueJson, :now)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at
    `, { key: clean, valueJson: JSON.stringify(value), now });
  }
  return { ok: true, settings: getSettings(), runtime: getRuntimeAlertSettings() };
}

function enqueueFromRequest(req, broadcastWS, defaultSource) {
  return enqueueAlert(normalizeAlertPayload(req.body && Object.keys(req.body).length ? req.body : req.query, defaultSource), broadcastWS);
}

function normalizeAlertPayload(input, defaultSource) {
  const data = input || {};
  const typeKey = cleanKey(data.type_key || data.typeKey || data.type || data.alertType || 'follow');
  const source = cleanKey(data.source || defaultSource || 'test');
  const amount = nullableNumber(data.amount ?? data.value ?? data.bits ?? data.viewerCount ?? data.count) ?? 0;
  const user = cleanText(data.user || data.user_display || data.userDisplay || data.displayName || data.login || data.userName || 'TestUser');
  return {
    source,
    type_key: typeKey,
    user_login: cleanKey(data.user_login || data.userLogin || data.login || data.userName || user).toLowerCase(),
    user_display: user,
    amount,
    currency: cleanText(data.currency || data.currencyCode || ''),
    message: cleanText(data.message || data.text || ''),
    avatar_url: cleanText(data.avatar_url || data.avatarUrl || ''),
    display_profile_id: nullableInt(data.displayProfileId ?? data.display_profile_id),
    title: cleanText(data.title || ''),
    raw: data
  };
}

function enqueueAlert(payload, broadcastWS) {
  const rule = findMatchingRule(payload);
  return enqueueAlertWithRule(payload, rule, broadcastWS);
}

function enqueueAlertWithRule(payload, rule, broadcastWS, options = {}) {
  if (state.config.enabled === false) return { ok: false, error: 'alert_system_disabled' };
  const eventUid = makeEventUid();
  const now = nowIso();
  const rawPayload = { ...(payload.raw || payload) };
  if (options.replayOf) rawPayload.replayOf = options.replayOf;
  const event = {
    eventUid,
    source: payload.source,
    type_key: payload.type_key,
    user_login: payload.user_login,
    user_display: payload.user_display,
    amount: Number(payload.amount || 0),
    message: payload.message || '',
    avatar_url: payload.avatar_url || '',
    display_profile_id: payload.display_profile_id || null,
    currency: payload.currency || '',
    title: payload.title || '',
    raw: rawPayload,
    rule,
    status: 'queued',
    created_at: now,
    replayOf: options.replayOf || null
  };
  sqlite.run(`
    INSERT INTO alert_events (event_uid, source, type_key, user_login, user_display, amount, message, rule_id, status, payload_json, display_profile_id, created_at)
    VALUES (:eventUid, :source, :typeKey, :userLogin, :userDisplay, :amount, :message, :ruleId, 'queued', :payloadJson, :displayProfileId, :now)
  `, {
    eventUid,
    source: event.source,
    typeKey: event.type_key,
    userLogin: event.user_login,
    userDisplay: event.user_display,
    amount: event.amount,
    message: event.message,
    ruleId: rule ? rule.id : null,
    payloadJson: JSON.stringify(rawPayload),
    displayProfileId: event.display_profile_id || null,
    now
  });
  state.queue.push(event);
  processQueue(broadcastWS);
  return { ok: true, queued: true, eventUid, replayOf: options.replayOf || null, queueLength: state.queue.length, current: state.current ? state.current.eventUid : null, matchedRule: rule ? rule.id : null, warning: rule ? '' : 'no_matching_rule' };
}

function replayAlertEvent(eventUid, broadcastWS) {
  const sourceUid = cleanText(eventUid || '');
  if (!sourceUid) return { ok: false, error: 'missing_event_uid' };
  const row = sqlite.get(`SELECT * FROM alert_events WHERE event_uid=:eventUid`, { eventUid: sourceUid });
  if (!row) return { ok: false, error: 'event_not_found' };
  const rawPayload = parseJson(row.payload_json, {});
  const payload = normalizeAlertPayload({
    ...rawPayload,
    source: row.source,
    type_key: row.type_key,
    user_login: row.user_login,
    user_display: row.user_display,
    user: row.user_display || row.user_login,
    amount: row.amount,
    message: row.message,
    title: rawPayload.title || '',
    avatar_url: rawPayload.avatar_url || rawPayload.avatarUrl || ''
  }, row.source);
  payload.raw = { ...payload.raw, replay: true, replayOf: sourceUid };
  let rule = null;
  if (row.rule_id) rule = getRuleById(row.rule_id);
  if (!rule) rule = findMatchingRule(payload);
  return enqueueAlertWithRule(payload, rule, broadcastWS, { replayOf: sourceUid });
}

function getRuleById(id) {
  const rule = sqlite.get(`
    SELECT
      r.*,
      s.public_url AS sound_url,
      s.label AS sound_label,
      s.duration_ms AS sound_duration_ms,
      i.public_url AS image_url,
      i.label AS image_label
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id AND s.enabled = 1
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id AND i.enabled = 1
    WHERE r.id=:id AND r.enabled = 1
  `, { id: Number(id) });
  return rule ? enrichAlertRuleRow(rule) : null;
}


function listDisplayProfiles(filter = {}) {
  return sqlite.all(`SELECT * FROM alert_display_profiles ORDER BY is_default DESC, sort_order ASC, id ASC`).map(row => {
    const settings = sanitizeDisplaySettings(parseJson(row.settings_json, defaultDisplaySettings()));
    if (settings.topGraphicAssetId && !settings.topGraphicUrl) settings.topGraphicUrl = resolveTopGraphicUrlFromAsset(settings.topGraphicAssetId);
    return { ...row, settings };
  });
}

function getDisplayProfileById(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return null;
  const row = sqlite.get(`SELECT * FROM alert_display_profiles WHERE id=:id`, { id });
  return row ? { ...row, settings: parseJson(row.settings_json, defaultDisplaySettings()) } : null;
}

function getDefaultDisplayProfile() {
  const row = sqlite.get(`SELECT * FROM alert_display_profiles WHERE enabled=1 ORDER BY is_default DESC, sort_order ASC, id ASC LIMIT 1`);
  return row ? { ...row, settings: parseJson(row.settings_json, defaultDisplaySettings()) } : { id:null, name:'Neon Badge Standard', settings: defaultDisplaySettings() };
}

function saveDisplayProfile(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const isDefault = boolInt(input.is_default ?? input.isDefault, false);
  const settings = sanitizeDisplaySettings(input.settings || parseJson(input.settings_json, defaultDisplaySettings()));
  const name = cleanText(input.name || 'Neuer Alert').slice(0, 120);
  if (!name) throw new Error('Alert-Name darf nicht leer sein.');
  const duplicate = sqlite.get(`SELECT id, name FROM alert_display_profiles WHERE lower(trim(name)) = lower(trim(:name)) AND id != :id LIMIT 1`, { name, id });
  if (duplicate) throw new Error(`Alert-Name existiert bereits: ${duplicate.name}`);
  const row = { name, description: cleanText(input.description || '').slice(0, 500), isDefault, enabled: boolInt(input.enabled, true), settingsJson: JSON.stringify(settings), sortOrder: toInt(input.sort_order ?? input.sortOrder, 100), now };
  if (isDefault) sqlite.run(`UPDATE alert_display_profiles SET is_default=0 WHERE is_default=1`);
  if (id > 0) {
    sqlite.run(`UPDATE alert_display_profiles SET name=:name, description=:description, is_default=:isDefault, enabled=:enabled, settings_json=:settingsJson, sort_order=:sortOrder, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok:true, id, profile:getDisplayProfileById(id) };
  }
  const result = sqlite.run(`INSERT INTO alert_display_profiles (name, description, is_default, enabled, settings_json, sort_order, created_at, updated_at) VALUES (:name, :description, :isDefault, :enabled, :settingsJson, :sortOrder, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok:true, id:newId, profile:getDisplayProfileById(newId) };
}

function deleteDisplayProfile(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const profile = getDisplayProfileById(id);
  if (!profile) return { ok:false, error:'not_found' };
  if (Number(profile.is_default)) return { ok:false, error:'cannot_delete_default' };
  sqlite.run(`UPDATE alert_rules SET display_profile_id=NULL WHERE display_profile_id=:id`, { id });
  sqlite.run(`DELETE FROM alert_display_profiles WHERE id=:id`, { id });
  return { ok:true, id };
}

function seedDisplayProfiles() {
  try {
    const count = sqlite.get(`SELECT COUNT(*) AS c FROM alert_display_profiles`)?.c || 0;
    if (Number(count) > 0) return;
    saveDisplayProfile({ name:'Neon Badge Standard', description:'ForrestCGN Neon-Galaxy Standardprofil', is_default:1, enabled:1, sort_order:10, settings: defaultDisplaySettings() });
    saveDisplayProfile({ name:'Kompakt', description:'Kompakter Alert für kleine Einblendungen', enabled:1, sort_order:20, settings:{ ...defaultDisplaySettings(), widthMode:'compact', sizeScale:0.88, fontScale:0.9, badgeScale:0.88, avatarSize:'normal' } });
    saveDisplayProfile({ name:'Groß / Raid', description:'Breiter und präsenter für große Alerts', enabled:1, sort_order:30, settings:{ ...defaultDisplaySettings(), widthMode:'wide', sizeScale:1.08, fontScale:1.05, badgeScale:1.05, glowStrength:'strong' } });
  } catch (e) { console.warn('[alert_system] display profile seed failed:', e.message || e); }
}

function defaultDisplaySettings() {
  return { widthMode:'custom', overlayPosition:'custom', positionX:50, positionY:50, cardWidthPx:1120, cardHeightPx:300, sizeScale:1, fontScale:1, headlineScale:1, valueScale:1, avatarPosition:'left', avatarSize:'normal', providerLogoStyle:'tile', topGraphicAssetId:'', topGraphicUrl:'', topGraphicScale:1, topGraphicOffsetY:-18, topGraphicShape:'original', topGraphicFrameStrength:'normal', topGraphicImageZoom:1, topGraphicImageX:50, topGraphicImageY:50, topGraphicFrameStyle:'none', cardBorderColorA:'#8ff4ff', cardBorderColorB:'#c45cff', innerBorderEnabled:true, previewCelebration:'none', celebrationStrength:'medium', badgeEnabled:false, badgeStyle:'none', badgeScale:1, textAlign:'left', showSideLines:true, showParticles:true, glowStrength:'normal' };
}

function sanitizeDisplaySettings(input = {}) {
  const base = defaultDisplaySettings();
  const pick = (v, allowed, fallback) => allowed.includes(String(v || '').toLowerCase()) ? String(v).toLowerCase() : fallback;
  const color = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim() : fallback;
  return {
    widthMode: pick(input.widthMode || input.width_mode, ['compact','adaptive','normal','wide','full','custom'], base.widthMode),
    overlayPosition: pick(input.overlayPosition || input.overlay_position, ['top-left','top-center','top-right','middle-left','middle-center','middle-right','bottom-left','bottom-center','bottom-right','custom'], base.overlayPosition),
    positionX: clamp(Number(input.positionX ?? input.position_x ?? base.positionX) || 50, 0, 100),
    positionY: clamp(Number(input.positionY ?? input.position_y ?? base.positionY) || 50, 0, 100),
    cardWidthPx: clamp(Number(input.cardWidthPx ?? input.card_width_px ?? base.cardWidthPx) || base.cardWidthPx, 560, 1600),
    cardHeightPx: clamp(Number(input.cardHeightPx ?? input.card_height_px ?? base.cardHeightPx) || base.cardHeightPx, 180, 520),
    sizeScale: clamp(Number(input.sizeScale ?? input.size_scale ?? base.sizeScale) || 1, 0.7, 1.35),
    fontScale: clamp(Number(input.fontScale ?? input.font_scale ?? base.fontScale) || 1, 0.75, 1.35),
    headlineScale: clamp(Number(input.headlineScale ?? input.headline_scale ?? base.headlineScale) || 1, 0.7, 1.4),
    valueScale: clamp(Number(input.valueScale ?? input.value_scale ?? base.valueScale) || 1, 0.7, 1.4),
    avatarPosition: pick(input.avatarPosition || input.avatar_position, ['left','right','top','bottom','hidden'], base.avatarPosition),
    avatarSize: pick(input.avatarSize || input.avatar_size, ['small','normal','large'], base.avatarSize),
    providerLogoStyle: pick(input.providerLogoStyle || input.provider_logo_style, ['tile','round','original'], base.providerLogoStyle),
    topGraphicAssetId: cleanText(input.topGraphicAssetId ?? input.top_graphic_asset_id ?? base.topGraphicAssetId),
    topGraphicUrl: cleanText(input.topGraphicUrl ?? input.top_graphic_url ?? base.topGraphicUrl),
    topGraphicScale: clamp(Number(input.topGraphicScale ?? input.top_graphic_scale ?? base.topGraphicScale) || 1, 0.35, 2),
    topGraphicOffsetY: clamp(Number(input.topGraphicOffsetY ?? input.top_graphic_offset_y ?? base.topGraphicOffsetY) || -18, -260, 180),
    topGraphicShape: pick(input.topGraphicShape || input.top_graphic_shape || input.topGraphicFrameStyle || input.top_graphic_frame_style, ['original','round','tile','heart','shield','hexagon','diamond','star','none'], base.topGraphicShape),
    topGraphicFrameStrength: (String(input.topGraphicFrameStrength || input.top_graphic_frame_strength || base.topGraphicFrameStrength || 'normal').toLowerCase() === 'soft' ? 'soft' : 'normal'),
    topGraphicImageZoom: clamp(Number(input.topGraphicImageZoom ?? input.top_graphic_image_zoom ?? base.topGraphicImageZoom) || 1, 0.6, 2.5),
    topGraphicImageX: clamp(Number(input.topGraphicImageX ?? input.top_graphic_image_x ?? base.topGraphicImageX) || 50, 0, 100),
    topGraphicImageY: clamp(Number(input.topGraphicImageY ?? input.top_graphic_image_y ?? base.topGraphicImageY) || 50, 0, 100),
    topGraphicFrameStyle: pick(input.topGraphicFrameStyle || input.top_graphic_frame_style, ['none','round','tile','original'], base.topGraphicFrameStyle),
    cardBorderColorA: color(input.cardBorderColorA ?? input.card_border_color_a, base.cardBorderColorA),
    cardBorderColorB: color(input.cardBorderColorB ?? input.card_border_color_b, base.cardBorderColorB),
    innerBorderEnabled: boolish(input.innerBorderEnabled ?? input.inner_border_enabled, base.innerBorderEnabled),
    previewCelebration: normalizeCelebrationAlias(pick(input.previewCelebration || input.preview_celebration, ['none','heart_rain','sparkle_rain','hearts','stars','sparkle','sparkles'], base.previewCelebration)),
    celebrationStrength: pick(input.celebrationStrength || input.celebration_strength, ['soft','medium','strong'], base.celebrationStrength),
    badgeEnabled: boolish(input.badgeEnabled ?? input.badge_enabled, base.badgeEnabled),
    badgeStyle: pick(input.badgeStyle || input.badge_style, ['brand-heart','brand-shield','core','orbit','ring','pulse','minimal','spark','hex','shield','wave','cgn','dotgrid','triad','slash','double-ring','cross','cube','bolt','none'], base.badgeStyle),
    badgeScale: clamp(Number(input.badgeScale ?? input.badge_scale ?? base.badgeScale) || 1, 0.65, 1.25),
    textAlign: pick(input.textAlign || input.text_align, ['left','center','right'], base.textAlign),
    showSideLines: boolish(input.showSideLines ?? input.show_side_lines, base.showSideLines),
    showParticles: boolish(input.showParticles ?? input.show_particles, base.showParticles),
    glowStrength: pick(input.glowStrength || input.glow_strength, ['soft','normal','strong'], base.glowStrength)
  };
}

function resolveTopGraphicUrlFromAsset(assetId) {
  const id = toInt(assetId, 0);
  if (!id) return '';
  try {
    const row = sqlite.get(`SELECT public_url FROM alert_assets WHERE id=:id AND enabled=1 AND asset_type='image'`, { id });
    return cleanText(row?.public_url || '');
  } catch (_) { return ''; }
}

function resolveDisplayProfile(event, rule = {}) {
  const raw = event.raw || {};
  const explicitId = nullableInt(event.display_profile_id ?? raw.displayProfileId ?? raw.display_profile_id);
  const ruleId = nullableInt(rule.display_profile_id);
  const profile = explicitId ? getDisplayProfileById(explicitId) : (ruleId ? getDisplayProfileById(ruleId) : getDefaultDisplayProfile());
  const settings = sanitizeDisplaySettings(profile?.settings || defaultDisplaySettings());
  if (settings.topGraphicAssetId && !settings.topGraphicUrl) settings.topGraphicUrl = resolveTopGraphicUrlFromAsset(settings.topGraphicAssetId);
  return { id: profile?.id || null, name: profile?.name || 'Neon Badge Standard', settings };
}

function listTextVariants(filter = {}) {
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.typeKey || '');
  const where = [];
  const params = {};
  if (source) { where.push('source = :source'); params.source = source; }
  if (typeKey) { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_text_variants ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, COALESCE(rule_id, 0) ASC, sort_order ASC, id ASC`;
  return sqlite.all(sql, params).map(row => ({ ...row, meta: parseJson(row.meta_json, {}) }));
}

function saveTextVariant(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const row = {
    source: cleanKey(input.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || 'follow'),
    ruleId: nullableInt(input.rule_id ?? input.ruleId),
    label: cleanText(input.label || ''),
    titleTemplate: cleanTemplate(input.title_template ?? input.titleTemplate ?? ''),
    headlineTemplate: cleanTemplate(input.headline_template ?? input.headlineTemplate ?? ''),
    valueTemplate: cleanTemplate(input.value_template ?? input.valueTemplate ?? ''),
    sublineTemplate: cleanTemplate(input.subline_template ?? input.sublineTemplate ?? ''),
    messageTemplate: cleanTemplate(input.message_template ?? input.messageTemplate ?? ''),
    messageMode: validateMessageMode(input.message_mode || input.messageMode || 'auto'),
    hideSublineWhenMessageExists: boolInt(input.hide_subline_when_message_exists ?? input.hideSublineWhenMessageExists, true),
    pickWeight: clamp(toInt(input.pick_weight ?? input.pickWeight, 100), 1, 9999),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    metaJson: JSON.stringify(input.meta || parseJson(input.meta_json, {})),
    now
  };
  if (!row.typeKey) return { ok: false, error: 'missing_type_key' };
  if (!row.label) row.label = `${row.source}/${row.typeKey}`;
  if (id > 0) {
    sqlite.run(`UPDATE alert_text_variants SET source=:source, type_key=:typeKey, rule_id=:ruleId, label=:label, title_template=:titleTemplate, headline_template=:headlineTemplate, value_template=:valueTemplate, subline_template=:sublineTemplate, message_template=:messageTemplate, message_mode=:messageMode, hide_subline_when_message_exists=:hideSublineWhenMessageExists, pick_weight=:pickWeight, enabled=:enabled, sort_order=:sortOrder, meta_json=:metaJson, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok: true, id, variant: sqlite.get(`SELECT * FROM alert_text_variants WHERE id=:id`, { id }) };
  }
  const result = sqlite.run(`INSERT INTO alert_text_variants (source, type_key, rule_id, label, title_template, headline_template, value_template, subline_template, message_template, message_mode, hide_subline_when_message_exists, pick_weight, enabled, sort_order, meta_json, created_at, updated_at) VALUES (:source, :typeKey, :ruleId, :label, :titleTemplate, :headlineTemplate, :valueTemplate, :sublineTemplate, :messageTemplate, :messageMode, :hideSublineWhenMessageExists, :pickWeight, :enabled, :sortOrder, :metaJson, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok: true, id: newId, variant: sqlite.get(`SELECT * FROM alert_text_variants WHERE id=:id`, { id: newId }) };
}

function deleteTextVariant(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  sqlite.run(`DELETE FROM alert_text_variants WHERE id=:id`, { id });
  return { ok: true, id };
}

function listTestPresets(filter = {}) {
  const source = cleanKey(filter.source || '');
  const typeKey = cleanKey(filter.type_key || filter.typeKey || '');
  const where = [];
  const params = {};
  if (source) { where.push('source = :source'); params.source = source; }
  if (typeKey) { where.push('type_key = :typeKey'); params.typeKey = typeKey; }
  const sql = `SELECT * FROM alert_test_presets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY source ASC, type_key ASC, sort_order ASC, id ASC`;
  return sqlite.all(sql, params).map(row => ({ ...row, payload: parseJson(row.payload_json, {}) }));
}

function getTestPresetById(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return null;
  const row = sqlite.get(`SELECT * FROM alert_test_presets WHERE id=:id`, { id });
  return row ? { ...row, payload: parseJson(row.payload_json, {}) } : null;
}

function saveTestPreset(input = {}) {
  const now = nowIso();
  const id = toInt(input.id, 0);
  const payload = input.payload && typeof input.payload === 'object' ? input.payload : parseJson(input.payload_json, {});
  const row = {
    source: cleanKey(input.source || payload.source || 'twitch'),
    typeKey: cleanKey(input.type_key || input.typeKey || payload.type_key || payload.type || 'follow'),
    ruleId: nullableInt(input.rule_id ?? input.ruleId),
    label: cleanText(input.label || 'Testpreset'),
    payloadJson: JSON.stringify(payload || {}),
    enabled: boolInt(input.enabled, true),
    sortOrder: toInt(input.sort_order ?? input.sortOrder, 100),
    now
  };
  if (id > 0) {
    sqlite.run(`UPDATE alert_test_presets SET source=:source, type_key=:typeKey, rule_id=:ruleId, label=:label, payload_json=:payloadJson, enabled=:enabled, sort_order=:sortOrder, updated_at=:now WHERE id=:id`, { ...row, id });
    return { ok: true, id, preset: getTestPresetById(id) };
  }
  const result = sqlite.run(`INSERT INTO alert_test_presets (source, type_key, rule_id, label, payload_json, enabled, sort_order, created_at, updated_at) VALUES (:source, :typeKey, :ruleId, :label, :payloadJson, :enabled, :sortOrder, :now, :now)`, row);
  const newId = Number(result.lastInsertRowid || 0);
  return { ok: true, id: newId, preset: getTestPresetById(newId) };
}

function deleteTestPreset(idRaw) {
  const id = toInt(idRaw, 0);
  if (id <= 0) return { ok: false, error: 'invalid_id' };
  sqlite.run(`DELETE FROM alert_test_presets WHERE id=:id`, { id });
  return { ok: true, id };
}

function seedAlertTextVariants() {
  const rows = [
    ['twitch','follow','Follow Standard','TWITCH FOLLOW','{userDisplayName}','folgt jetzt dem Kanal','Willkommen in der CGN-Community!','never',10],
    ['twitch','follow','Follow CGN','TWITCH FOLLOW','{userDisplayName}','ist jetzt Teil der CGN-Community','Schön, dass du da bist!','never',20],
    ['twitch','bits','Bits Standard','TWITCH BITS','{userDisplayName}','cheert {amountFormatted}','Danke für den Support!','auto',30],
    ['twitch','sub','Sub Standard','TWITCH SUB','{userDisplayName}','ist jetzt Subscriber','Danke für deine Unterstützung!','auto',40],
    ['twitch','resub','Resub Standard','TWITCH RESUB','{userDisplayName}','{months} Monate dabei','Danke für deine Treue!','auto',50],
    ['twitch','gift_sub','Gift Sub Standard','TWITCH GIFT SUB','{userDisplayName}','verschenkt {amountFormatted}','Danke für den Support!','never',60],
    ['twitch','gift_bomb','Gift Bomb Standard','TWITCH GIFT SUB','{userDisplayName}','verschenkt {amountFormatted}','Danke für den Support!','never',70],
    ['twitch','raid','Raid Standard','TWITCH RAID','{userDisplayName}','kommt mit {viewerCount} Leuten rein','Willkommen bei CGN!','never',80],
    ['kofi','donation','Ko-fi Standard','KO-FI SUPPORT','{userDisplayName}','{amountFormatted}','Danke für deine Unterstützung!','auto',90],
    ['kofi','membership','Ko-fi Membership Standard','KO-FI MEMBERSHIP','{userDisplayName}','ist jetzt Mitglied','Danke für deine regelmäßige Unterstützung!','auto',91],
    ['kofi','shop','Ko-fi Shop Standard','KO-FI SHOP','{userDisplayName}','hat etwas im Shop gekauft','Danke für den Support!','auto',92],
    ['kofi','commission','Ko-fi Commission Standard','KO-FI COMMISSION','{userDisplayName}','hat eine Commission gebucht','Danke für deine Unterstützung!','auto',93],
    ['tipeee','donation','Tipeee Standard','TIPEEE SUPPORT','{userDisplayName}','{amountFormatted}','Danke für deine Unterstützung!','auto',100],
    ['tipeee','subscription','Tipeee Subscription Standard','TIPEEE ABO','{userDisplayName}','unterstützt jetzt regelmäßig','Danke für deine Unterstützung!','auto',101],
    ['tipeee','follow','Tipeee Follow Standard','TIPEEE FOLLOW','{userDisplayName}','folgt jetzt auf Tipeee','Willkommen und danke dir!','never',102],
    ['tipeee','hosting','Tipeee Hosting Standard','TIPEEE HOSTING','{userDisplayName}','hostet die Aktion','Danke für den Support!','auto',103]
  ];
  rows.forEach(r => {
    const exists = sqlite.get(`SELECT id FROM alert_text_variants WHERE source=:source AND type_key=:typeKey AND label=:label LIMIT 1`, { source:r[0], typeKey:r[1], label:r[2] });
    if (!exists) saveTextVariant({ source:r[0], type_key:r[1], label:r[2], title_template:r[3], headline_template:r[4], value_template:r[5], subline_template:r[6], message_mode:r[7], sort_order:r[8], enabled:1 });
  });

  // STEP123: alten Bits-Standard nur dann sanft migrieren, wenn er noch unverändert aus STEP103 stammt.
  const oldBits = sqlite.get(`SELECT id, headline_template, value_template FROM alert_text_variants WHERE source='twitch' AND type_key='bits' AND label='Bits Standard' LIMIT 1`);
  if (oldBits && String(oldBits.headline_template || '').toLowerCase().includes('cheer') && String(oldBits.value_template || '') === '{amountFormatted}') {
    sqlite.run(`UPDATE alert_text_variants SET headline_template='{userDisplayName}', value_template='cheert {amountFormatted}', updated_at=:now WHERE id=:id`, { id: oldBits.id, now: nowIso() });
  }
}

function seedAlertTestPresets() {
  const count = sqlite.get(`SELECT COUNT(*) AS c FROM alert_test_presets`)?.c || 0;
  if (Number(count) > 0) return;
  const presets = [
    { source:'twitch', type_key:'follow', label:'Follow Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', avatarUrl:'', amount:1 } },
    { source:'twitch', type_key:'bits', label:'100 Bits Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:100, message:'Test für neue Staffel', avatarUrl:'' } },
    { source:'twitch', type_key:'sub', label:'Sub Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:1, message:'Sub-Test aus dem Dashboard', avatarUrl:'' } },
    { source:'twitch', type_key:'raid', label:'Raid Test', payload:{ user:'ForrestCGN', userLogin:'forrestcgn', amount:23, viewerCount:23, avatarUrl:'' } },
    { source:'kofi', type_key:'donation', label:'Ko-fi 3 Euro Test', payload:{ user:'ForrestCGN', amount:3, currency:'EUR', message:'Ko-fi Test aus dem Dashboard' } },
    { source:'tipeee', type_key:'donation', label:'Tipeee 5 Euro Test', payload:{ user:'ForrestCGN', amount:5, currency:'EUR', message:'Tipeee Test aus dem Dashboard' } }
  ];
  presets.forEach((p, i) => saveTestPreset({ ...p, sort_order:(i+1)*10, enabled:1 }));
}

function findMatchingRule(payload) {
  const source = payload.source;
  const typeKey = payload.type_key;
  const amount = Number(payload.amount || 0);
  const explicitRuleId = nullableInt(payload.raw?.ruleId ?? payload.raw?.rule_id);
  if (explicitRuleId) {
    const explicitRule = getRuleById(explicitRuleId);
    if (explicitRule && explicitRule.source === source && explicitRule.type_key === typeKey) return explicitRule;
  }

  const rule = sqlite.get(`
    SELECT
      r.*,
      s.public_url AS sound_url,
      s.label AS sound_label,
      i.public_url AS image_url,
      i.label AS image_label
    FROM alert_rules r
    LEFT JOIN alert_assets s ON s.id = r.sound_asset_id AND s.enabled = 1
    LEFT JOIN alert_assets i ON i.id = r.image_asset_id AND i.enabled = 1
    WHERE r.enabled = 1
      AND r.source = :source
      AND r.type_key = :typeKey
      AND (r.min_value IS NULL OR r.min_value <= :amount)
      AND (r.max_value IS NULL OR r.max_value >= :amount)
    ORDER BY
      CASE WHEN r.max_value IS NULL THEN 1 ELSE 0 END ASC,
      CASE
        WHEN r.min_value IS NOT NULL AND r.max_value IS NOT NULL THEN (r.max_value - r.min_value)
        ELSE 999999999
      END ASC,
      COALESCE(r.min_value, -999999) DESC,
      r.priority ASC,
      r.id ASC
    LIMIT 1
  `, { source, typeKey, amount });

  return rule ? enrichAlertRuleRow(rule) : null;
}


function shouldUseSoundSystemForAlert(event, overlayAlert) {
  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  if (liveAlert.soundSystemEnabled !== true) return false;
  if (!event || !overlayAlert || !overlayAlert.soundUrl) return false;
  const raw = event.raw && typeof event.raw === 'object' ? event.raw : {};
  const mode = cleanKey(raw.mode || raw.alertMode || raw.testMode || '');
  const previewRequested = raw.preview === true || String(raw.preview || '').toLowerCase() === 'true' || mode === 'preview';
  if (previewRequested) return false;
  if (event.source === 'test' && mode !== 'live') return false;
  return true;
}

function soundFileFromPublicUrl(publicUrl) {
  const raw = cleanText(publicUrl || '');
  if (!raw) return '';
  let pathname = raw;
  try {
    pathname = new URL(raw, 'http://127.0.0.1').pathname || raw;
  } catch (_) {
    pathname = raw;
  }
  let clean = String(pathname || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (clean.toLowerCase().startsWith('assets/sounds/')) clean = clean.slice('assets/sounds/'.length);
  try { clean = decodeURIComponent(clean); } catch (_) {}
  return clean.replace(/^\/+/, '');
}

function buildSoundSystemPayload(event, overlayAlert) {
  if (!shouldUseSoundSystemForAlert(event, overlayAlert)) return null;
  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  const file = soundFileFromPublicUrl(overlayAlert.soundUrl || '');
  if (!file) return null;
  const raw = event.raw && typeof event.raw === 'object' ? event.raw : {};
  const rule = event.rule || {};
  const meta = rule.meta && typeof rule.meta === 'object' ? rule.meta : {};
  const ruleSoundRouting = rule.soundRouting && typeof rule.soundRouting === 'object' ? rule.soundRouting : {};
  const ruleSoundOutputTarget = cleanKey(rule.sound_output_target || rule.soundOutputTarget || ruleSoundRouting.outputTarget || '');
  const ruleSoundCategory = cleanKey(rule.sound_category || rule.soundCategory || ruleSoundRouting.category || '');
  const ruleSoundPriority = nullablePriority(rule.sound_priority ?? rule.soundPriority ?? ruleSoundRouting.priority);
  const ruleSoundVolume = nullableVolume(rule.sound_volume ?? rule.soundVolume ?? ruleSoundRouting.volume);
  const volumeCandidate = raw.soundVolume ?? raw.volume ?? ruleSoundVolume ?? meta.soundVolume ?? meta.volume ?? liveAlert.soundSystemVolume ?? overlayAlert.soundVolume;
  const volume = Number.isFinite(Number(volumeCandidate)) ? Math.max(0, Math.min(100, Math.round(Number(volumeCandidate)))) : 85;
  const priorityCandidate = raw.soundPriority ?? ruleSoundPriority ?? meta.soundPriority ?? liveAlert.soundSystemPriority ?? rule.priority ?? 80;
  const priority = Number.isFinite(Number(priorityCandidate)) ? Math.max(0, Math.min(100, Math.round(Number(priorityCandidate)))) : 80;
  const outputTarget = cleanKey(raw.outputTarget || raw.soundOutputTarget || ruleSoundOutputTarget || meta.outputTarget || meta.soundOutputTarget || liveAlert.soundSystemOutputTarget || 'device') || 'device';
  const category = cleanKey(raw.soundCategory || ruleSoundCategory || meta.soundCategory || liveAlert.soundSystemCategory || 'alert') || 'alert';
  const source = cleanKey(liveAlert.soundSystemSource || 'alert_system') || 'alert_system';
  const isTest = raw.isTest === true || raw.test === true || String(raw.isTest || raw.test || '').toLowerCase() === 'true' || cleanKey(raw.mode || '') === 'live_test';

  return {
    file,
    outputTarget,
    volume,
    category,
    source,
    priority,
    requestedBy: event.user_display || event.user_login || '',
    meta: {
      alertId: event.eventUid,
      provider: event.source,
      type: event.type_key,
      ruleId: rule.id || null,
      isTest,
      replayOf: event.replayOf || raw.replayOf || null
    },
    visual: {
      module: 'alert_system',
      eventId: event.eventUid
    }
  };
}

function postJson(targetUrl, payload, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch (err) { reject(err); return; }
    const body = JSON.stringify(payload || {});
    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request({
      method: 'POST',
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: `${parsed.pathname}${parsed.search || ''}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: Math.max(500, Number(timeoutMs) || 3500)
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = data ? JSON.parse(data) : null; } catch (_) { json = null; }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`http_${res.statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        if (json && json.ok === false) {
          reject(new Error(json.error || json.message || 'sound_system_rejected'));
          return;
        }
        resolve(json || { ok: true, raw: data });
      });
    });
    req.on('timeout', () => req.destroy(new Error('sound_system_timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function processQueue(broadcastWS) {
  if (state.processing || state.current) return;
  if (!state.queue.length) return;
  state.processing = true;
  const event = state.queue.shift();
  state.current = event;
  try {
    if (event.rule && event.rule.id) event.rule = getRuleById(event.rule.id) || event.rule;
    await enrichEventAvatar(event);
    event.effectiveDurationMs = resolveAlertDurationMs(event.rule);
    await prepareAlertTtsForEvent(event);
    event.effectiveDurationMs = resolveFinalAlertDurationMs(event, event.rule);
    event.status = 'playing';
    event.started_at = nowIso();
    sqlite.run(`UPDATE alert_events SET status='playing', started_at=:startedAt WHERE event_uid=:eventUid`, { startedAt: event.started_at, eventUid: event.eventUid });
    const overlayAlert = buildOverlayAlert(event);
    const soundSync = await prepareSoundSyncedAlert(event, overlayAlert, broadcastWS);
    if (!soundSync.synced) {
      sendOverlay(broadcastWS, { event: 'play', alert: overlayAlert });
      startCurrentFallbackTimer(event, broadcastWS);
    }
    scheduleAlertTtsSoundSystem(event);
    dispatchAlertChatMessage(event, overlayAlert).catch(err => console.warn('[alert_system] chat message failed:', err && err.message ? err.message : err));
  } catch (err) {
    console.warn('[alert_system] processQueue failed:', err && err.message ? err.message : err);
    finishCurrent('process_error', broadcastWS);
  } finally {
    state.processing = false;
  }
}

function startCurrentFallbackTimer(event, broadcastWS) {
  const duration = Number(event && event.effectiveDurationMs || 0) > 0 ? Number(event.effectiveDurationMs) : Number(state.config.defaultDurationMs || 7000);
  const fallback = Math.max(duration + Number(state.config.fallbackFinishMs || 12000), duration + 1000);
  clearTimeout(state.finishTimer);
  state.finishTimer = setTimeout(() => finishCurrent('fallback_timeout', broadcastWS), fallback);
}

async function prepareSoundSyncedAlert(event, overlayAlert, broadcastWS) {
  const soundPayload = buildSoundSystemPayload(event, overlayAlert);
  if (!soundPayload) return { synced: false, reason: 'not_eligible' };

  const preparedAlert = { ...overlayAlert, _soundSystemManaged: true };
  sendOverlay(broadcastWS, { event: 'prepare', alertId: event.eventUid, eventId: event.eventUid, alert: preparedAlert });

  try {
    const liveAlert = getRuntimeAlertSettings().liveAlert || {};
    const url = cleanText(liveAlert.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl || 'http://127.0.0.1:8080/api/sound/play');
    const result = await postJson(url, soundPayload, Number(liveAlert.soundSystemTimeoutMs || 3500));
    event.soundSystem = { ok: true, request: soundPayload, result };
    return { synced: true, result };
  } catch (err) {
    event.soundSystem = { ok: false, request: soundPayload, error: err && err.message ? err.message : String(err) };
    console.warn('[alert_system] sound system handoff failed:', event.soundSystem.error);
    const liveAlert = getRuntimeAlertSettings().liveAlert || {};
    if (liveAlert.fallbackShowOnSoundError !== false) {
      sendOverlay(broadcastWS, { event: 'play', alert: overlayAlert, soundSystemError: event.soundSystem.error });
      startCurrentFallbackTimer(event, broadcastWS);
      return { synced: true, fallback: true, error: event.soundSystem.error };
    }
    return { synced: false, error: event.soundSystem.error };
  }
}

function getJson(targetUrl, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch (err) { reject(err); return; }
    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request({
      method: 'GET',
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: `${parsed.pathname}${parsed.search || ''}`,
      timeout: Math.max(500, Number(timeoutMs) || 3500)
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = data ? JSON.parse(data) : null; } catch (_) { json = null; }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`http_${res.statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        if (json && json.ok === false) {
          reject(new Error(json.error || json.message || 'request_rejected'));
          return;
        }
        resolve(json || { ok: true, raw: data });
      });
    });
    req.on('timeout', () => req.destroy(new Error('request_timeout')));
    req.on('error', reject);
    req.end();
  });
}

function appendQueryParams(targetUrl, params = {}) {
  const url = new URL(targetUrl);
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function normalizeAlertTtsPlaybackMode(liveAlert) {
  const raw = cleanKey(liveAlert.alertTtsPlaybackMode || 'sound_system');
  if (raw === 'overlay' || raw === 'browser_overlay') return 'overlay';
  if (raw === 'off' || raw === 'disabled' || raw === 'none') return 'off';
  return 'sound_system';
}

async function prepareAlertTtsForEvent(event) {
  const rule = event && event.rule ? event.rule : {};
  const payload = buildTtsPayload(event, rule);
  if (!event) return null;
  if (!payload || payload.enabled === false) {
    event.alertTts = payload || null;
    return event.alertTts;
  }

  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  if (liveAlert.alertTtsEnabled === false) {
    event.alertTts = { ...payload, enabled: false, ok: false, reason: 'alert_tts_disabled' };
    return event.alertTts;
  }

  const playbackMode = normalizeAlertTtsPlaybackMode(liveAlert);
  if (playbackMode === 'off') {
    event.alertTts = { ...payload, enabled: false, ok: false, reason: 'alert_tts_playback_off' };
    return event.alertTts;
  }

  const voice = cleanText(
    liveAlert.alertTtsVoice ||
    liveAlert.voice ||
    (event.raw && typeof event.raw === 'object' && (event.raw.ttsVoice || event.raw.voice)) ||
    ''
  );
  const prepareUrl = cleanText(liveAlert.alertTtsPrepareUrl || DEFAULT_CONFIG.liveAlert.alertTtsPrepareUrl || 'http://127.0.0.1:8080/api/tts/prepare-alert');
  const timeoutMs = Number(liveAlert.alertTtsTimeoutMs || DEFAULT_CONFIG.liveAlert.alertTtsTimeoutMs || 15000);
  const user = event.user_display || event.user_login || 'Alert-System';

  try {
    const url = appendQueryParams(prepareUrl, {
      text: payload.text,
      user,
      voice,
      maxChars: payload.maxChars || 500,
      source: 'alert_system',
      mode: 'alert',
      alertId: event.eventUid,
      provider: event.source,
      type: event.type_key,
      ruleId: rule.id || ''
    });
    const result = await getJson(url, timeoutMs);
    event.alertTts = {
      ...payload,
      ...result,
      enabled: result && result.ok !== false,
      ok: result && result.ok !== false,
      source: 'alert_system',
      playbackMode,
      overlayPlaybackEnabled: playbackMode === 'overlay' || liveAlert.alertTtsOverlayPlaybackEnabled === true
    };
  } catch (err) {
    event.alertTts = {
      ...payload,
      enabled: false,
      ok: false,
      reason: 'alert_tts_prepare_failed',
      error: err && err.message ? err.message : String(err)
    };
    console.warn('[alert_system] alert tts prepare failed:', event.alertTts.error);
  }

  try {
    const rawPayload = event.raw && typeof event.raw === 'object' ? { ...event.raw } : {};
    rawPayload.alertTts = event.alertTts;
    sqlite.run(`UPDATE alert_events SET payload_json=:payloadJson WHERE event_uid=:eventUid`, {
      eventUid: event.eventUid,
      payloadJson: JSON.stringify(rawPayload)
    });
  } catch (_) {}

  return event.alertTts;
}

function resolveFinalAlertDurationMs(event, rule = {}) {
  const baseDuration = Number(event && event.effectiveDurationMs || 0) > 0 ? Number(event.effectiveDurationMs) : resolveAlertDurationMs(rule);
  const tts = event && event.alertTts;
  if (!tts || tts.enabled === false || tts.ok === false) return baseDuration;
  const ttsDuration = Number(tts.durationMs || 0);
  if (!Number.isFinite(ttsDuration) || ttsDuration <= 0) return baseDuration;
  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  const outroBuffer = Number(liveAlert.alertTtsOutroBufferMs ?? DEFAULT_CONFIG.liveAlert.alertTtsOutroBufferMs ?? 1500) || 1500;
  const combined = baseDuration + ttsDuration + Math.max(0, outroBuffer);
  return clamp(combined, 1000, Number(state.config.maxAutoDurationMs || 60000));
}

function buildAlertTtsSoundSystemPayload(event) {
  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  const tts = event && event.alertTts;
  if (!event || !tts || tts.enabled === false || tts.ok === false) return null;
  if (liveAlert.alertTtsSoundSystemEnabled === false) return null;
  if (normalizeAlertTtsPlaybackMode(liveAlert) !== 'sound_system') return null;

  const file = cleanText(tts.soundSystemFile || soundFileFromPublicUrl(tts.audioUrl || ''));
  if (!file) return null;

  const volumeCandidate = tts.volume ?? liveAlert.alertTtsSoundSystemVolume ?? liveAlert.soundSystemVolume ?? 100;
  const volume = Number.isFinite(Number(volumeCandidate)) ? Math.max(0, Math.min(100, Math.round(Number(volumeCandidate)))) : 100;
  const alertPriorityCandidate = event.soundSystem?.request?.priority ?? event.soundSystemEarly?.request?.priority ?? event.rule?.priority ?? liveAlert.soundSystemPriority ?? 80;
  const alertPriority = Number.isFinite(Number(alertPriorityCandidate)) ? Math.max(0, Math.min(100, Math.round(Number(alertPriorityCandidate)))) : 80;
  const configuredTtsPriorityCandidate = tts.priority ?? liveAlert.alertTtsSoundSystemPriority;
  const configuredTtsPriority = Number.isFinite(Number(configuredTtsPriorityCandidate)) ? Math.max(0, Math.min(100, Math.round(Number(configuredTtsPriorityCandidate)))) : Math.max(0, alertPriority - 1);
  const priority = Math.max(0, Math.min(configuredTtsPriority, Math.max(0, alertPriority - 1)));
  const outputTarget = cleanKey(tts.outputTarget || liveAlert.alertTtsSoundSystemOutputTarget || liveAlert.soundSystemOutputTarget || 'device') || 'device';
  const category = cleanKey(liveAlert.alertTtsSoundSystemCategory || 'alert_tts') || 'alert_tts';
  const source = cleanKey(liveAlert.alertTtsSoundSystemSource || liveAlert.soundSystemSource || 'alert_system') || 'alert_system';

  return {
    file,
    outputTarget,
    volume,
    category,
    source,
    priority,
    queueIfBusy: true,
    canInterrupt: false,
    canBeInterrupted: false,
    parallelAllowed: false,
    durationMs: Number(tts.durationMs || 0),
    requestedBy: event.user_display || event.user_login || '',
    meta: {
      alertId: event.eventUid,
      provider: event.source,
      type: event.type_key,
      ruleId: event.rule?.id || null,
      alertTts: true,
      ttsId: tts.id || ''
    },
    visual: {
      module: 'alert_system_tts',
      eventId: event.eventUid,
      ttsId: tts.id || '',
      text: tts.text || '',
      durationMs: Number(tts.durationMs || 0)
    }
  };
}

function scheduleAlertTtsSoundSystem(event) {
  const payload = buildAlertTtsSoundSystemPayload(event);
  if (!payload) return null;
  const liveAlert = getRuntimeAlertSettings().liveAlert || {};
  const url = cleanText(liveAlert.soundSystemPlayUrl || DEFAULT_CONFIG.liveAlert.soundSystemPlayUrl || 'http://127.0.0.1:8080/api/sound/play');
  const timeoutMs = Number(liveAlert.alertTtsSoundSystemTimeoutMs || liveAlert.soundSystemTimeoutMs || 3500);
  event.alertTtsSoundSystem = { scheduled: true, request: payload, createdAt: nowIso() };
  postJson(url, payload, timeoutMs)
    .then(result => {
      event.alertTtsSoundSystem.ok = true;
      event.alertTtsSoundSystem.result = result;
      event.alertTtsSoundSystem.queuedAt = nowIso();
    })
    .catch(err => {
      event.alertTtsSoundSystem.ok = false;
      event.alertTtsSoundSystem.error = err && err.message ? err.message : String(err);
      console.warn('[alert_system] alert tts sound handoff failed:', event.alertTtsSoundSystem.error);
    });
  return event.alertTtsSoundSystem;
}

function finishCurrent(reason, broadcastWS) {
  if (!state.current) return;
  const finished = { ...state.current, finished_at: nowIso(), finishReason: reason };
  sqlite.run(`UPDATE alert_events SET status='finished', finished_at=:finishedAt WHERE event_uid=:eventUid`, { finishedAt: finished.finished_at, eventUid: finished.eventUid });
  state.history.unshift(finished);
  state.history = state.history.slice(0, 25);
  state.current = null;
  clearTimeout(state.finishTimer);
  state.finishTimer = null;
  sendOverlay(broadcastWS, { event: 'finished', alertId: finished.eventUid, reason });
  setTimeout(() => processQueue(broadcastWS), Math.max(0, Number(state.config.gapBetweenAlertsMs || 0)));
}

async function enrichEventAvatar(event) {
  if (!event || event.source !== 'twitch') return event;
  if (cleanText(event.avatar_url || '')) return event;
  if (state.config.avatarResolveEnabled === false) return event;
  const login = cleanKey(event.user_login || (event.raw && (event.raw.userLogin || event.raw.login)) || event.user_display || '');
  if (!login) return event;
  const avatarUrl = await resolveTwitchAvatarUrl(login);
  if (!avatarUrl) return event;
  event.avatar_url = avatarUrl;
  event.raw = { ...(event.raw || {}), avatarUrl };
  try {
    sqlite.run(`UPDATE alert_events SET payload_json=:payloadJson WHERE event_uid=:eventUid`, {
      eventUid: event.eventUid,
      payloadJson: JSON.stringify(event.raw || {})
    });
  } catch (_) {}
  return event;
}

async function resolveTwitchAvatarUrl(loginRaw) {
  const login = cleanKey(loginRaw || '').toLowerCase();
  if (!login) return '';
  const now = Date.now();
  const cacheMs = Math.max(0, Number(state.config.avatarResolveCacheMs || 3600000));
  const cached = state.avatarCache.get(login);
  if (cached && (now - cached.at) < cacheMs) return cached.url || '';

  const base = cleanText(state.config.avatarResolveUserinfoUrl || DEFAULT_CONFIG.avatarResolveUserinfoUrl);
  if (!base || typeof fetch !== 'function') return '';
  const url = buildUserinfoUrl(base, login);
  let timeout = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  try {
    if (controller) timeout = setTimeout(() => controller.abort(), Math.max(500, Number(state.config.avatarResolveTimeoutMs || 2500)));
    const res = await fetch(url, { signal: controller ? controller.signal : undefined });
    if (!res.ok) throw new Error(`userinfo_http_${res.status}`);
    const json = await res.json();
    const avatarUrl = extractAvatarUrl(json);
    state.avatarCache.set(login, { at: now, url: avatarUrl || '' });
    return avatarUrl || '';
  } catch (_) {
    state.avatarCache.set(login, { at: now, url: '' });
    return '';
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function buildUserinfoUrl(base, login) {
  try {
    const url = new URL(base);
    if (!url.searchParams.has('login') && !url.searchParams.has('user') && !url.searchParams.has('username')) {
      url.searchParams.set('login', login);
    }
    return url.toString();
  } catch (_) {
    const sep = String(base).includes('?') ? '&' : '?';
    return `${base}${sep}login=${encodeURIComponent(login)}`;
  }
}

function extractAvatarUrl(json) {
  if (!json || typeof json !== 'object') return '';
  const candidates = [
    json.profile_image_url,
    json.profileImageUrl,
    json.avatarUrl,
    json.avatar_url,
    json.user && json.user.profile_image_url,
    json.user && json.user.profileImageUrl,
    Array.isArray(json.data) && json.data[0] && json.data[0].profile_image_url,
    json.data && !Array.isArray(json.data) && json.data.profile_image_url,
    json.result && json.result.profile_image_url
  ];
  for (const value of candidates) {
    const url = cleanText(value || '');
    if (/^https?:\/\//i.test(url)) return url;
  }
  return '';
}

function resolveEventCelebration(event, rule = {}, displaySettings = {}) {
  const raw = event && event.raw && typeof event.raw === 'object' ? event.raw : {};
  const explicit = raw.celebration ?? raw.previewCelebration ?? raw.preview_celebration ?? raw.meta?.celebration;
  if (explicit !== undefined && explicit !== null && String(explicit).trim() !== '') return validateCelebration(explicit);

  const fromProfile = displaySettings.previewCelebration ?? displaySettings.preview_celebration;
  const profileCelebration = validateCelebration(fromProfile || 'none');
  if (profileCelebration !== 'none') return profileCelebration;

  const legacyRuleCelebration = validateCelebration(rule.meta?.celebration || 'none');
  if (legacyRuleCelebration !== 'none') return legacyRuleCelebration;

  return 'none';
}

function buildOverlayAlert(event) {
  const rule = event.rule || {};
  const text = buildOverlayText(event, rule);
  const displayProfile = resolveDisplayProfile(event, rule);
  const durationMs = Number(event.effectiveDurationMs || 0) > 0 ? Number(event.effectiveDurationMs) : resolveAlertDurationMs(rule);
  const alert = {
    id: event.eventUid,
    source: event.source,
    provider: event.source,
    type: event.type_key,
    tier: 'normal',
    title: text.title,
    headline: text.headline,
    value: text.value,
    subline: text.subline,
    message: text.message,
    user: event.user_display,
    userDisplayName: event.user_display,
    login: event.user_login,
    userLogin: event.user_login,
    amount: event.amount,
    amountFormatted: text.context.amountFormatted || '',
    currency: text.context.currency || '',
    avatarUrl: event.avatar_url,
    providerLogoUrl: text.providerLogoUrl,
    display: displayProfile,
    defaultIconUrl: defaultIconUrl(event.source, event.type_key),
    durationMs,
    introMs: toInt(text.context.introMs, toInt(rule.meta?.introMs, Number(state.config.defaultIntroMs || 700))),
    outroMs: toInt(text.context.outroMs, toInt(rule.meta?.outroMs, Number(state.config.defaultOutroMs || 600))),
    durationMode: rule.duration_mode || 'fixed',
    soundDurationMs: Number(rule.sound_duration_ms || 0),
    animation: rule.animation || 'neon_card',
    imageMode: rule.image_mode || 'none',
    celebration: resolveEventCelebration(event, rule, displayProfile.settings),
    soundUrl: rule.sound_url || '',
    imageUrl: rule.image_url || '',
    ruleId: rule.id || null,
    textVariantId: text.variantId || null,
    tts: event.alertTts || buildTtsPayload(event, rule),
    chatMessage: buildAlertChatMessage(event, rule, text.context),
    createdAt: event.created_at,
    startedAt: event.started_at
  };
  persistRenderedAlert(event.eventUid, alert);
  return alert;
}

function buildOverlayText(event, rule = {}) {
  const context = buildTemplateContext(event, rule);
  const variant = selectTextVariant(event, rule);
  const fallback = fallbackTemplates(event, rule);
  const templates = variant || fallback;
  const rawMessage = cleanText(event.message || '');
  const messageMode = cleanKey(templates.message_mode || templates.messageMode || 'auto');
  const hideSubline = boolish(templates.hide_subline_when_message_exists ?? templates.hideSublineWhenMessageExists, true);
  let message = '';
  if (messageMode !== 'never') {
    message = renderTemplate(templates.message_template || templates.messageTemplate || (messageMode === 'always' ? '{message}' : ''), context);
    if (!message && messageMode === 'auto') message = rawMessage;
  }
  const sublineRendered = renderTemplate(templates.subline_template || templates.sublineTemplate || '', context);
  return {
    variantId: variant ? variant.id : null,
    providerLogoUrl: providerLogoUrl(event.source, event.type_key),
    context,
    title: renderTemplate(templates.title_template || templates.titleTemplate || '', context),
    headline: renderTemplate(templates.headline_template || templates.headlineTemplate || '', context),
    value: renderTemplate(templates.value_template || templates.valueTemplate || '', context),
    subline: hideSubline && message ? '' : sublineRendered,
    message
  };
}

function buildTemplateContext(event, rule = {}) {
  const raw = event.raw || {};
  const amount = Number(event.amount || raw.amount || raw.bits || raw.viewerCount || raw.count || 0);
  const currency = cleanText(event.currency || raw.currency || raw.currencyCode || '');
  const userDisplayName = cleanText(event.user_display || raw.userDisplayName || raw.user || raw.displayName || raw.login || 'Jemand');
  const userLogin = cleanText(event.user_login || raw.userLogin || raw.login || '').toLowerCase();
  const recipientDisplayName = cleanText(raw.recipientDisplayName || raw.recipient || raw.targetUser || raw.target || '');
  const months = Number(raw.months || raw.cumulativeMonths || raw.totalMonths || 0);
  const streakMonths = Number(raw.streakMonths || raw.streak || 0);
  const viewerCount = Number(raw.viewerCount || raw.viewers || raw.count || amount || 0);
  const tier = 'normal';
  const provider = cleanText(event.source || raw.provider || raw.source || '');
  const type = cleanText(event.type_key || raw.type || raw.type_key || '');
  const amountFormatted = formatAmount(amount, currency, type, provider);
  return {
    userDisplayName,
    userLogin,
    user: userDisplayName,
    amount: amount ? String(amount) : '',
    amountFormatted,
    currency,
    months: months ? String(months) : '',
    streakMonths: streakMonths ? String(streakMonths) : '',
    viewerCount: viewerCount ? String(viewerCount) : '',
    recipientDisplayName,
    recipient: recipientDisplayName,
    tier,
    provider,
    source: provider,
    type,
    message: cleanText(event.message || raw.message || raw.text || ''),
    ruleLabel: cleanText(rule.label || ''),
    introMs: raw.introMs || raw.intro_ms || '',
    outroMs: raw.outroMs || raw.outro_ms || ''
  };
}

function selectTextVariant(event, rule = {}) {
  const rows = sqlite.all(`
    SELECT * FROM alert_text_variants
    WHERE enabled = 1
      AND source = :source
      AND type_key = :typeKey
      AND (rule_id IS NULL OR rule_id = :ruleId)
    ORDER BY CASE WHEN rule_id = :ruleId THEN 0 ELSE 1 END ASC, sort_order ASC, id ASC
  `, { source: event.source, typeKey: event.type_key, ruleId: rule.id || 0 });
  if (!rows.length) return null;
  const ruleSpecific = rows.filter(r => Number(r.rule_id || 0) === Number(rule.id || 0));
  const pool = ruleSpecific.length ? ruleSpecific : rows.filter(r => !r.rule_id);
  return pickWeighted(pool);
}

function pickWeighted(rows) {
  if (!rows || !rows.length) return null;
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.pick_weight || 1)), 0);
  let hit = Math.random() * total;
  for (const row of rows) {
    hit -= Math.max(1, Number(row.pick_weight || 1));
    if (hit <= 0) return row;
  }
  return rows[rows.length - 1];
}

function renderTemplate(template, context) {
  return cleanText(String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const value = context[key];
    return value === undefined || value === null ? '' : String(value);
  })).replace(/\s+/g, ' ').trim();
}

function formatAmount(amount, currency, type, provider) {
  const n = Number(amount || 0);
  if (!n) return '';
  const t = cleanKey(type);
  const p = cleanKey(provider);
  if (t === 'bits') return `${n} Bits`;
  if (t === 'raid') return n === 1 ? '1 Person' : `${n} Leute`;
  if (t === 'gift_sub' || t === 'gift_bomb') return n === 1 ? '1 Sub' : `${n} Subs`;
  if (p === 'kofi' || p === 'tipeee' || currency) {
    const c = currency || 'EUR';
    try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: c }).format(n); }
    catch (_) { return `${n.toFixed(2).replace('.', ',')} ${c}`.trim(); }
  }
  return String(n);
}

function providerLogoUrl(source, typeKey) {
  const src = cleanKey(source);
  if (src === 'kofi') return '/assets/images/alerts/providers/kofi.png';
  if (src === 'tipeee') return '/assets/images/alerts/providers/tipeee.png';
  if (typeKey === 'donation') return '/assets/images/alerts/providers/default-donation.svg';
  return '';
}

function defaultIconUrl(source, typeKey) {
  const src = cleanKey(source);
  const type = cleanKey(typeKey);
  if (src === 'kofi') return '/assets/images/alerts/providers/kofi.png';
  if (src === 'tipeee') return '/assets/images/alerts/providers/tipeee.png';
  if (type === 'donation') return '/assets/images/alerts/providers/default-donation.svg';
  return '';
}

function fallbackTemplates(event, rule = {}) {
  const source = cleanKey(event.source);
  const type = cleanKey(event.type_key);
  if (source === 'twitch' && type === 'follow') return { title_template:'TWITCH FOLLOW', headline_template:'{userDisplayName}', value_template:'folgt jetzt dem Kanal', subline_template:'Willkommen in der CGN-Community!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'bits') return { title_template:'TWITCH BITS', headline_template:'{userDisplayName}', value_template:'cheert {amountFormatted}', subline_template:'Danke für den Support!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'raid') return { title_template:'TWITCH RAID', headline_template:'{userDisplayName}', value_template:'kommt mit {viewerCount} Leuten rein', subline_template:'Willkommen bei CGN!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'sub') return { title_template:'TWITCH SUB', headline_template:'{userDisplayName}', value_template:'ist jetzt Subscriber', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && type === 'resub') return { title_template:'TWITCH RESUB', headline_template:'{userDisplayName}', value_template:'{months} Monate dabei', subline_template:'Danke für deine Treue!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'twitch' && (type === 'gift_sub' || type === 'gift_bomb')) return { title_template:'TWITCH GIFT SUB', headline_template:'{userDisplayName}', value_template:'verschenkt {amountFormatted}', subline_template:'Danke für den Support!', message_mode:'never', hide_subline_when_message_exists:1 };
  if (source === 'kofi') return { title_template:'KO-FI SUPPORT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  if (source === 'tipeee') return { title_template:'TIPEEE SUPPORT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für deine Unterstützung!', message_mode:'auto', hide_subline_when_message_exists:1 };
  return { title_template:'ALERT', headline_template:'{userDisplayName}', value_template:'{amountFormatted}', subline_template:'Danke für den Support!', message_mode:'auto', hide_subline_when_message_exists:1 };
}

function persistRenderedAlert(eventUid, alert) {
  try {
    sqlite.run(`UPDATE alert_events SET final_title=:title, final_headline=:headline, final_value=:value, final_subline=:subline, final_message=:message, text_variant_id=:variantId, provider_logo_url=:providerLogoUrl, display_profile_id=:displayProfileId, display_settings_json=:displaySettingsJson, final_chat_message=:chatMessage WHERE event_uid=:eventUid`, {
      eventUid,
      title: alert.title || '',
      headline: alert.headline || '',
      value: alert.value || '',
      subline: alert.subline || '',
      message: alert.message || '',
      variantId: alert.textVariantId || null,
      providerLogoUrl: alert.providerLogoUrl || '',
      displayProfileId: alert.display?.id || null,
      displaySettingsJson: JSON.stringify(alert.display?.settings || {}),
      chatMessage: alert.chatMessage?.text || ''
    });
  } catch (_) {}
}


function resolveAlertDurationMs(rule = {}) {
  const fixed = Number(rule?.duration_ms || state.config.defaultDurationMs || 7000);
  if ((rule?.duration_mode || 'fixed') !== 'sound') return clamp(fixed, 1000, 60000);
  const soundDuration = Number(rule?.sound_duration_ms || 0);
  if (soundDuration <= 0) return clamp(fixed, 1000, 60000);
  const padded = soundDuration + Number(state.config.soundDurationPaddingMs || 1200);
  return clamp(padded, Number(state.config.minAutoDurationMs || 4000), Number(state.config.maxAutoDurationMs || 60000));
}

function buildAlertChatMessage(event, rule = {}, context = null) {
  const meta = rule && rule.meta && typeof rule.meta === 'object' ? rule.meta : {};
  const cfg = meta.chatMessage && typeof meta.chatMessage === 'object' ? meta.chatMessage : {};
  const enabled = boolish(cfg.enabled, false);
  const blockId = nullableInt(cfg.blockId ?? cfg.block_id ?? cfg.chatBlockId ?? cfg.chat_block_id);
  if (!enabled || !blockId) return { enabled:false, blockId:blockId || null, text:'', reason: enabled ? 'missing_block' : 'disabled' };
  const block = getChatBlockById(blockId);
  if (!block || Number(block.enabled) !== 1) return { enabled:false, blockId, text:'', reason:'block_disabled_or_missing' };
  if (block.source !== event.source || block.type_key !== event.type_key) return { enabled:false, blockId, text:'', reason:'block_type_mismatch' };
  const texts = parseChatTexts(block.texts || block.texts_json || []);
  if (!texts.length) return { enabled:false, blockId, text:'', reason:'empty_block' };
  const ctx = context || buildTemplateContext(event, rule);
  const template = texts[Math.floor(Math.random() * texts.length)] || '';
  const text = renderTemplate(template, ctx);
  if (!text) return { enabled:false, blockId, text:'', reason:'empty_rendered_text' };
  return { enabled:true, blockId:block.id, blockLabel:block.label, text };
}

async function dispatchAlertChatMessage(event, alert) {
  const chat = alert && alert.chatMessage;
  if (!chat || !chat.enabled || !chat.text) return;
  if (state.config.chatMessageEnabled === false) return;
  const outboxId = saveChatOutbox(event, chat, 'pending');
  chat.outboxId = outboxId;
  const url = cleanText(state.config.chatMessagePostUrl || '');
  if (!url) {
    updateChatDispatchStatus(event.eventUid, 'pending_outbox', 'chat_post_url_missing');
    chat.sent = false;
    chat.reason = 'chat_post_url_missing';
    return;
  }
  if (typeof fetch !== 'function') {
    updateChatDispatchStatus(event.eventUid, 'pending_outbox', 'fetch_unavailable');
    chat.sent = false;
    chat.reason = 'fetch_unavailable';
    return;
  }
  const payload = { message: chat.text, text: chat.text, source: event.source, type_key: event.type_key, user: event.user_display, userLogin: event.user_login, amount: event.amount, eventUid: event.eventUid, ruleId: event.rule?.id || null, chatBlockId: chat.blockId || null, outboxId };
  const method = cleanText(state.config.chatMessagePostMethod || 'POST').toUpperCase() === 'GET' ? 'GET' : 'POST';
  let finalUrl = url;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), Math.max(500, Number(state.config.chatMessageTimeoutMs || 2500))) : null;
  try {
    if (method === 'GET') {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl += sep + 'message=' + encodeURIComponent(chat.text);
      const res = await fetch(finalUrl, { method:'GET', signal: controller ? controller.signal : undefined });
      if (!res.ok) throw new Error(`chat_http_${res.status}`);
    } else {
      const res = await fetch(finalUrl, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload), signal: controller ? controller.signal : undefined });
      if (!res.ok) throw new Error(`chat_http_${res.status}`);
    }
    chat.sent = true;
    updateChatOutboxStatus(outboxId, 'sent', '');
    updateChatDispatchStatus(event.eventUid, 'sent', '');
  } catch (err) {
    const msg = cleanText(err && err.message ? err.message : String(err || 'chat_send_failed')).slice(0, 300);
    chat.sent = false;
    chat.reason = msg;
    updateChatOutboxStatus(outboxId, 'error', msg);
    updateChatDispatchStatus(event.eventUid, 'error', msg);
    throw err;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function saveChatOutbox(event, chat, status) {
  try {
    const now = nowIso();
    const existing = sqlite.get(`SELECT id FROM alert_chat_outbox WHERE event_uid=:eventUid LIMIT 1`, { eventUid:event.eventUid });
    if (existing && existing.id) return Number(existing.id);
    const result = sqlite.run(`INSERT INTO alert_chat_outbox (event_uid, source, type_key, rule_id, chat_block_id, message, status, created_at) VALUES (:eventUid, :source, :typeKey, :ruleId, :chatBlockId, :message, :status, :now)`, {
      eventUid:event.eventUid,
      source:event.source || '',
      typeKey:event.type_key || '',
      ruleId:event.rule?.id || null,
      chatBlockId:chat.blockId || null,
      message:chat.text || '',
      status:status || 'pending',
      now
    });
    return Number(result.lastInsertRowid || 0);
  } catch (_) {
    return 0;
  }
}

function listChatOutbox(filter = {}) {
  const limit = clamp(toInt(filter.limit, Number(state.config.chatMessageOutboxLimit || 100)), 1, 500);
  const status = cleanKey(filter.status || 'pending');
  const params = { limit };
  let where = '';
  if (status && status !== 'all') { where = 'WHERE status = :status'; params.status = status; }
  return sqlite.all(`SELECT * FROM alert_chat_outbox ${where} ORDER BY id ASC LIMIT :limit`, params);
}

function updateChatOutboxStatus(idRaw, status, error) {
  const id = toInt(idRaw, 0);
  if (!id) return;
  const now = nowIso();
  const sentAt = status === 'sent' ? now : null;
  sqlite.run(`UPDATE alert_chat_outbox SET status=:status, error=:error, sent_at=COALESCE(:sentAt, sent_at) WHERE id=:id`, { id, status, error: cleanText(error || '').slice(0, 500), sentAt });
}

function markChatOutboxSent(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  updateChatOutboxStatus(id, 'sent', '');
  return { ok:true, id };
}

function markChatOutboxConsumed(idRaw) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const now = nowIso();
  sqlite.run(`UPDATE alert_chat_outbox SET status='consumed', consumed_at=:now WHERE id=:id`, { id, now });
  return { ok:true, id };
}

function markChatOutboxError(idRaw, input = {}) {
  const id = toInt(idRaw, 0);
  if (!id) return { ok:false, error:'invalid_id' };
  const error = cleanText(input.error || input.message || 'external_send_failed').slice(0, 500);
  updateChatOutboxStatus(id, 'error', error);
  return { ok:true, id, error };
}

function updateChatDispatchStatus(eventUid, status, error) {
  try {
    sqlite.run(`UPDATE alert_events SET chat_message_status=:status, chat_message_error=:error WHERE event_uid=:eventUid`, {
      eventUid,
      status: cleanText(status || '').slice(0, 80),
      error: cleanText(error || '').slice(0, 500)
    });
  } catch (_) {}
}

function buildTtsPayload(event, rule = {}) {
  if (Number(rule.tts_enabled || 0) !== 1) return null;
  const message = cleanText(event.message || '');
  const minAmount = nullableNumber(rule.tts_min_amount);
  if (!message) return { enabled: false, reason: 'empty_message' };
  if (minAmount !== null && Number(event.amount || 0) < minAmount) return { enabled: false, reason: 'amount_below_minimum' };
  const maxChars = clamp(toInt(rule.tts_max_chars, 250), 1, 1000);
  const safeMessage = message.slice(0, maxChars);
  const template = String(rule.tts_template || '{user} schreibt: {message}').slice(0, 1000);
  const text = template
    .replaceAll('{user}', event.user_display || event.user_login || 'Jemand')
    .replaceAll('{amount}', String(event.amount || 0))
    .replaceAll('{currency}', '')
    .replaceAll('{message}', safeMessage)
    .trim();
  return {
    enabled: true,
    mode: validateTtsMode(rule.tts_mode || 'audio_only'),
    timing: validateTtsTiming(rule.tts_timing || 'after_alert'),
    maxChars,
    text
  };
}

function buildDefaultTitle(event) {
  if (event.type_key === 'follow') return `${event.user_display} folgt jetzt!`;
  if (event.type_key === 'bits') return `${event.user_display} cheer't ${event.amount} Bits!`;
  if (event.type_key === 'raid') return `${event.user_display} raidt mit ${event.amount}!`;
  if (event.type_key === 'sub') return `${event.user_display} ist jetzt Sub!`;
  if (event.type_key === 'gift_sub') return `${event.user_display} verschenkt ${event.amount || 1} Sub!`;
  return `${event.user_display} hat einen Alert ausgelÃ¶st`;
}

function sendOverlay(broadcastWS, payload) {
  if (typeof broadcastWS !== 'function') return;
  broadcastWS({ op: state.config.wsOp || 'alert_system', ...payload });
}

function clearQueue(reason) {
  state.queue = [];
  sqlite.run(`UPDATE alert_events SET status='cleared', finished_at=:now WHERE status='queued'`, { now: nowIso() });
  if (reason === 'api_clear' && state.current) {
    state.current = null;
    clearTimeout(state.finishTimer);
    state.finishTimer = null;
  }
}

function attachWs(wss) {
  if (state.started) return;
  state.started = true;
  wss.on('connection', ws => {
    ws.on('message', raw => {
      let msg = null;
      try { msg = JSON.parse(String(raw || '')); } catch (_) { return; }
      if (!msg || msg.op !== (state.config.wsOp || 'alert_system')) return;
      if (msg.client === 'overlay') {
        state.overlayClients.set(ws, { connectedAt: nowIso(), lastSeenAt: nowIso() });
        try { ws.send(JSON.stringify({ op: state.config.wsOp || 'alert_system', event: 'hello', status: buildStatus() })); } catch (_) {}
      }
      if (msg.event === 'ack' || msg.event === 'finished') {
        if (state.current && (!msg.alertId || msg.alertId === state.current.eventUid)) finishCurrent('client_ack', state.broadcastWS);
      }
    });
    ws.on('close', () => state.overlayClients.delete(ws));
  });
}

function absRoot(p) {
  const clean = String(p || '').replace(/^[/\\]+/, '');
  if (path.isAbsolute(clean)) return clean;
  return path.join(configHelper.getRootDir(), clean);
}

function relRoot(p) {
  return path.relative(configHelper.getRootDir(), p);
}

function imageTargetDir(category) {
  const cat = cleanKey(category || '');
  if (cat === 'icons') return absRoot('htdocs/assets/images/alerts/icons');
  if (cat === 'special') return absRoot('htdocs/assets/images/alerts/special');
  if (cat === 'backgrounds') return absRoot('htdocs/assets/images/alerts/backgrounds');
  return absRoot(state.config.imagesDir);
}

function detectAssetType(mime, hint) {
  const h = cleanKey(hint || '');
  if (h === 'sound' || h === 'image') return h;
  return String(mime || '').startsWith('audio/') ? 'sound' : 'image';
}

function sanitizeFilename(name) {
  return String(name || 'asset').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'asset';
}
function safeExt(ext) { return /^[.][a-z0-9]{1,8}$/i.test(ext) ? ext.toLowerCase() : ''; }
function cleanText(v) { return String(v ?? '').trim().slice(0, 500); }
function validateCelebration(value) {
  const v = normalizeCelebrationAlias(value);
  return ['none','heart_rain','sparkle_rain'].includes(v) ? v : 'none';
}
function normalizeCelebrationAlias(value) {
  const v = String(value || 'none').toLowerCase();
  const aliases = {
    confetti:'sparkle_rain', burst:'sparkle_rain', screen:'sparkle_rain', mega:'sparkle_rain', fireworks:'sparkle_rain', mega_fireworks:'sparkle_rain',
    hearts:'heart_rain', stars:'sparkle_rain', starfall:'sparkle_rain', coins:'sparkle_rain', comets:'sparkle_rain', sparkle:'sparkle_rain', sparkles:'sparkle_rain'
  };
  return aliases[v] || v;
}

function cleanTemplate(v) { return String(v ?? '').trim().slice(0, 1200); }
function boolish(v, fallback) { if (v === undefined || v === null || v === '') return !!fallback; return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function validateMessageMode(v) { const mode = cleanKey(v || 'auto'); return ['auto','always','never'].includes(mode) ? mode : 'auto'; }
function validateSoundOutputTarget(value) {
  const key = cleanKey(value || '');
  if (!key) return '';
  return ['device', 'overlay', 'both'].includes(key) ? key : '';
}

function validateSoundCategory(value) {
  const key = cleanKey(value || '');
  if (!key) return '';
  return ['alert', 'alert_critical', 'channel_reward', 'vip', 'crew', 'special', 'tts', 'fun', 'background', 'decor', 'admin', 'system', 'ui', 'test'].includes(key) ? key : '';
}

function nullablePriority(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
}

function nullableVolume(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
}

function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80); }
function toInt(v, fallback) { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : fallback; }
function nullableInt(v) { if (v === '' || v === null || v === undefined) return null; const n = Number.parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; }
function nullableNumber(v) { if (v === '' || v === null || v === undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function boolInt(v, fallback) { if (v === undefined || v === null || v === '') return fallback ? 1 : 0; return (v === true || v === 1 || v === '1' || v === 'true' || v === 'on') ? 1 : 0; }
function parseJson(v, fallback) { try { return JSON.parse(v || ''); } catch (_) { return fallback; } }
function nowIso() { return new Date().toISOString(); }
function makeEventUid() { return `al_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`; }
function validateImageMode(v) { const mode = cleanKey(v || 'none'); return state.config.allowedImageModes.includes(mode) ? mode : 'none'; }
function validateTtsTiming(v) { const mode = cleanKey(v || 'after_alert'); return ['after_alert', 'during_alert', 'before_alert'].includes(mode) ? mode : 'after_alert'; }
function validateTtsMode(v) { const mode = cleanKey(v || 'audio_only'); return ['audio_only', 'overlay'].includes(mode) ? mode : 'audio_only'; }

