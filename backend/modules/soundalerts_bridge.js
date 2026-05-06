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

let multer = null;
let multerLoadError = '';
try {
  multer = require('multer');
} catch (err) {
  multerLoadError = err && err.message ? err.message : String(err);
}

const MODULE_NAME = 'soundalerts_bridge';
const VERSION = '0.1.3';
const CONFIG_FILE = 'soundalerts_bridge.json';
const SCHEMA_MODULE = 'soundalerts_bridge';
const SCHEMA_VERSION = 2;

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
  upload: {
    enabled: true,
    audioDir: 'htdocs/assets/sounds/soundalerts/audio',
    videoDir: 'htdocs/assets/sounds/soundalerts/video',
    audioRelativePrefix: 'soundalerts/audio',
    videoRelativePrefix: 'soundalerts/video',
    allowOverwrite: true,
    maxAudioSizeBytes: 15728640,
    maxVideoSizeBytes: 104857600,
    allowedAudioExtensions: ['.mp3', '.wav', '.ogg', '.webm', '.m4a'],
    allowedVideoExtensions: ['.mp4', '.webm']
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
    chatMessagesFailed: 0,
    uploads: 0,
    uploadOverwrites: 0,
    uploadFailed: 0
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

function normalizeMediaType(value, file) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'audio' || raw === 'video') return raw;
  const f = String(file || '').trim().toLowerCase();
  return f.endsWith('.mp4') || f.endsWith('.webm') ? 'video' : 'audio';
}

function normalizeCategory(value) {
  const raw = String(value || '').trim();
  return raw || 'channel_reward';
}

function normalizeOutputTarget(value, mediaType) {
  const raw = String(value || '').trim().toLowerCase();
  if (['overlay', 'device', 'both'].includes(raw)) return raw;
  return mediaType === 'video' ? 'overlay' : 'device';
}

function categoryDefaultPriority(category) {
  const key = String(category || '').trim();
  const map = {
    channel_reward: 70,
    alert: 80,
    alert_critical: 90,
    vip: 60,
    crew: 60,
    special: 60,
    fun: 50,
    tts: 50,
    admin: 100,
    system: 100,
    background: 20,
    decor: 20,
    soundalerts: 70
  };
  return Number.isFinite(map[key]) ? map[key] : null;
}

function effectivePriority(rule) {
  const priorityRaw = rule && rule.priority !== undefined && rule.priority !== null && String(rule.priority).trim() !== '' ? Number.parseInt(rule.priority, 10) : null;
  if (Number.isFinite(priorityRaw)) return priorityRaw;
  const byCategory = categoryDefaultPriority(rule && rule.category);
  if (Number.isFinite(byCategory)) return byCategory;
  const fallback = Number.parseInt(config?.soundSystem?.defaultPriority ?? DEFAULT_CONFIG.soundSystem.defaultPriority ?? 70, 10);
  return Number.isFinite(fallback) ? fallback : 70;
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

    if (toVersion === 2) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS soundalerts_bridge_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entry_key TEXT NOT NULL DEFAULT '',
          enabled INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'inactive',
          soundalert_name TEXT NOT NULL DEFAULT '',
          label TEXT NOT NULL DEFAULT '',
          file TEXT NOT NULL DEFAULT '',
          media_type TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT '',
          priority INTEGER,
          volume INTEGER,
          output_target TEXT NOT NULL DEFAULT '',
          created_from TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          meta_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_soundalerts_bridge_entries_entry_key ON soundalerts_bridge_entries(entry_key);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_soundalerts_bridge_entries_soundalert_name ON soundalerts_bridge_entries(soundalert_name);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_soundalerts_bridge_entries_status ON soundalerts_bridge_entries(status);`);
      db.exec(`
        CREATE TABLE IF NOT EXISTS soundalerts_bridge_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL
        );
      `);
    }
  });
  ensureEntriesSeededFromConfig();
  return true;
}

function entryKeyFromRule(rule, fallback = '') {
  const base = String(rule && (rule.id || rule.entry_key || rule.soundAlertName || rule.soundalert_name || rule.label) || fallback || '').trim();
  return normalizeFilenameBase(base || `entry_${Date.now()}`);
}

function normalizeRuleForDb(rule, fallback = '') {
  const now = core.nowIso();
  const meta = rule && rule.meta && typeof rule.meta === 'object' ? rule.meta : {};
  const entryKey = entryKeyFromRule(rule, fallback);
  const enabled = rule && rule.enabled !== false ? 1 : 0;
  const soundAlertName = String(rule && (rule.soundAlertName || rule.soundalert_name || rule.name) || '').trim();
  const label = String(rule && rule.label || soundAlertName || entryKey).trim();
  const file = String(rule && rule.file || '').trim().replace(/\\/g, '/');
  const mediaType = normalizeMediaType(rule && (rule.mediaType || rule.media_type), file);
  const status = String(rule && rule.status || (enabled ? 'active' : 'disabled')).trim() || (enabled ? 'active' : 'disabled');
  const priorityRaw = rule && rule.priority !== undefined && rule.priority !== null && String(rule.priority).trim() !== '' ? Number.parseInt(rule.priority, 10) : null;
  const volumeRaw = rule && rule.volume !== undefined && rule.volume !== null && String(rule.volume).trim() !== '' ? Number.parseInt(rule.volume, 10) : null;

  return {
    entryKey,
    enabled,
    status,
    soundAlertName,
    label,
    file,
    mediaType,
    category: normalizeCategory(rule && rule.category),
    priority: Number.isFinite(priorityRaw) ? priorityRaw : null,
    volume: Number.isFinite(volumeRaw) ? volumeRaw : null,
    outputTarget: normalizeOutputTarget(rule && (rule.outputTarget || rule.output_target), mediaType),
    createdFrom: String(rule && (rule.createdFrom || rule.created_from) || 'json_seed').trim(),
    createdAt: String(rule && (rule.createdAt || rule.created_at) || now).trim(),
    updatedAt: now,
    metaJson: JSON.stringify(meta)
  };
}

function dbRowToRule(row) {
  if (!row) return null;
  const rule = {
    id: String(row.entry_key || ''),
    enabled: Number(row.enabled || 0) ? true : false,
    status: String(row.status || ''),
    soundAlertName: String(row.soundalert_name || ''),
    label: String(row.label || ''),
    file: String(row.file || ''),
    mediaType: normalizeMediaType(row.media_type, row.file),
    category: normalizeCategory(row.category),
    outputTarget: normalizeOutputTarget(row.output_target, normalizeMediaType(row.media_type, row.file))
  };
  if (row.priority !== null && row.priority !== undefined) rule.priority = Number(row.priority);
  if (row.volume !== null && row.volume !== undefined) rule.volume = Number(row.volume);
  const meta = core.safeJsonParse(row.meta_json, {});
  if (meta && Object.keys(meta).length) rule.meta = meta;
  return rule;
}

function getMetaValue(key) {
  if (!sqlite.isInitialized()) return '';
  try {
    const row = sqlite.get('SELECT value FROM soundalerts_bridge_meta WHERE key = :key', { key: String(key || '') });
    return row ? String(row.value || '') : '';
  } catch (_) {
    return '';
  }
}

function setMetaValue(key, value) {
  if (!sqlite.isInitialized()) return false;
  sqlite.run(`
    INSERT INTO soundalerts_bridge_meta (key, value, updated_at)
    VALUES (:key, :value, :updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `, { key: String(key || ''), value: String(value || ''), updatedAt: core.nowIso() });
  return true;
}

function entriesTableReady() {
  if (!sqlite.isInitialized()) return false;
  try {
    sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_entries');
    return true;
  } catch (_) {
    return false;
  }
}

function ensureEntriesSeededFromConfig() {
  if (!sqlite.isInitialized() || !entriesTableReady()) return false;
  const seeded = getMetaValue('entries_seeded_from_json') === '1';
  const count = Number(sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_entries')?.c || 0);
  if (seeded || count > 0) return false;

  const rules = Array.isArray(config && config.rules) ? config.rules : [];
  if (!rules.length) {
    setMetaValue('entries_seeded_from_json', '1');
    return false;
  }

  for (let i = 0; i < rules.length; i++) {
    upsertEntryRule(rules[i], `json_rule_${i + 1}`);
  }
  setMetaValue('entries_seeded_from_json', '1');
  return true;
}

function upsertEntryRule(rule, fallback = '') {
  if (!sqlite.isInitialized() || !entriesTableReady()) return false;
  const row = normalizeRuleForDb(rule, fallback);
  sqlite.run(`
    INSERT INTO soundalerts_bridge_entries (
      entry_key, enabled, status, soundalert_name, label, file, media_type, category, priority, volume,
      output_target, created_from, created_at, updated_at, meta_json
    ) VALUES (
      :entryKey, :enabled, :status, :soundAlertName, :label, :file, :mediaType, :category, :priority, :volume,
      :outputTarget, :createdFrom, :createdAt, :updatedAt, :metaJson
    )
    ON CONFLICT(entry_key) DO UPDATE SET
      enabled = excluded.enabled,
      status = excluded.status,
      soundalert_name = excluded.soundalert_name,
      label = excluded.label,
      file = excluded.file,
      media_type = excluded.media_type,
      category = excluded.category,
      priority = excluded.priority,
      volume = excluded.volume,
      output_target = excluded.output_target,
      updated_at = excluded.updated_at,
      meta_json = excluded.meta_json
  `, row);
  return true;
}

function replaceEntryRules(rules) {
  if (!sqlite.isInitialized() || !entriesTableReady()) return false;
  const list = Array.isArray(rules) ? rules : [];
  const tx = sqlite.transaction(() => {
    sqlite.run('DELETE FROM soundalerts_bridge_entries');
    for (let i = 0; i < list.length; i++) {
      upsertEntryRule(list[i], `dashboard_rule_${i + 1}`);
    }
    setMetaValue('entries_seeded_from_json', '1');
  });
  tx();
  return true;
}

function listEntryRules() {
  ensureSchema();
  if (!sqlite.isInitialized() || !entriesTableReady()) return null;
  try {
    return sqlite.all(`
      SELECT * FROM soundalerts_bridge_entries
      ORDER BY enabled DESC, soundalert_name COLLATE NOCASE ASC, label COLLATE NOCASE ASC, id ASC
    `).map(dbRowToRule).filter(Boolean);
  } catch (_) {
    return null;
  }
}

function getEffectiveRules() {
  const dbRules = listEntryRules();
  if (Array.isArray(dbRules)) return dbRules;
  return Array.isArray(config.rules) ? config.rules : [];
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
    upload: config.upload || {},
    chatMessages: config.chatMessages || {},
    dedupe: config.dedupe || {},
    rules: getEffectiveRules()
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

  const spieltMatch = clean.match(/^(.+?)\s+spielt\s+(.+)$/i);
  if (!spieltMatch) return null;

  const triggerUserDisplay = String(spieltMatch[1] || '').trim();
  const rest = String(spieltMatch[2] || '').trim();
  if (!triggerUserDisplay || !rest) return null;

  const fuerPattern = '(?:für|fuer|fur|fÃ¼r|f.r)';
  let m = rest.match(new RegExp('^"([^"]+)"\\s+' + fuerPattern + '\\s+(\\d+)\\s+(.+?)!?$', 'i'));
  if (!m) m = rest.match(new RegExp('^(.+?)\\s+' + fuerPattern + '\\s+(\\d+)\\s+(.+?)!?$', 'i'));
  if (!m) return null;

  const soundAlertName = String(m[1] || '').trim().replace(/^"|"$/g, '').trim();
  const amount = Number.parseInt(m[2], 10) || 0;
  const currency = String(m[3] || '').trim().replace(/!+$/, '').trim();
  if (!soundAlertName || !currency) return null;

  return {
    triggerUserDisplay,
    triggerUserLogin: '',
    soundAlertName,
    amount,
    currency,
    rawText: clean
  };
}

function findRule(soundAlertName) {
  const wanted = normalizeName(soundAlertName);
  const rules = getEffectiveRules();
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

function normalizeFilenameBase(value) {
  const raw = String(value || '').trim().replace(/\.[a-z0-9]+$/i, '');
  const normalized = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || `soundalert_${Date.now()}`;
}

function getUploadConfig() {
  return mergePlain(DEFAULT_CONFIG.upload, config.upload || {});
}

function uploadTargetFor(mediaType, originalName, requestedName) {
  const uploadCfg = getUploadConfig();
  const type = String(mediaType || '').toLowerCase() === 'video' ? 'video' : 'audio';
  const ext = path.extname(String(originalName || '')).toLowerCase();
  const allowed = type === 'video' ? uploadCfg.allowedVideoExtensions : uploadCfg.allowedAudioExtensions;
  if (!media.extensionAllowed(`x${ext}`, allowed)) {
    return { ok: false, error: 'extension_not_allowed', allowed, type };
  }

  const dirRaw = type === 'video' ? uploadCfg.videoDir : uploadCfg.audioDir;
  const prefixRaw = type === 'video' ? uploadCfg.videoRelativePrefix : uploadCfg.audioRelativePrefix;
  const targetDir = path.isAbsolute(dirRaw) ? dirRaw : cfg.resolveFromRoot(dirRaw);
  const baseName = normalizeFilenameBase(requestedName || originalName);
  const fileName = `${baseName}${ext}`;
  const fullPath = path.resolve(targetDir, fileName);
  const normalizedDir = path.resolve(targetDir);
  if (!fullPath.startsWith(normalizedDir)) {
    return { ok: false, error: 'outside_upload_dir', type };
  }
  const relative = `${String(prefixRaw || '').replace(/^\/+|\/+$/g, '')}/${fileName}`.replace(/\\/g, '/');
  return { ok: true, type, ext, targetDir, fullPath, relative, fileName, allowed };
}

async function handleUploadRequest(req, res) {
  if (!multer) return res.status(500).json(core.fail ? core.fail('multer_unavailable', multerLoadError) : { ok: false, error: 'multer_unavailable', message: multerLoadError });
  const uploadCfg = getUploadConfig();
  if (uploadCfg.enabled === false) return res.status(403).json({ ok: false, error: 'upload_disabled' });
  if (!req.file || !req.file.buffer) return res.status(400).json({ ok: false, error: 'file_missing' });

  const mediaType = String(req.body.mediaType || req.body.type || '').toLowerCase() === 'video' ? 'video' : 'audio';
  const maxSize = mediaType === 'video' ? Number(uploadCfg.maxVideoSizeBytes || 0) : Number(uploadCfg.maxAudioSizeBytes || 0);
  if (maxSize > 0 && req.file.size > maxSize) {
    state.stats.uploadFailed++;
    return res.status(413).json({ ok: false, error: 'file_too_large', maxSizeBytes: maxSize });
  }

  const target = uploadTargetFor(mediaType, req.file.originalname, req.body.name || req.body.soundAlertName || '');
  if (!target.ok) {
    state.stats.uploadFailed++;
    return res.status(400).json({ ok: false, error: target.error, allowedExtensions: target.allowed || [] });
  }

  const overwrite = String(req.body.overwrite || '').toLowerCase() === 'true' || req.body.overwrite === true;
  const exists = fs.existsSync(target.fullPath);
  if (exists && !overwrite) {
    return res.status(409).json({
      ok: false,
      error: 'file_exists',
      message: 'Datei existiert bereits.',
      file: target.relative,
      fileName: target.fileName,
      mediaType: target.type
    });
  }

  try {
    fs.mkdirSync(target.targetDir, { recursive: true });
    fs.writeFileSync(target.fullPath, req.file.buffer);
    const info = media.readMediaInfo(target.fullPath, { cache: false });
    media.clearDurationCache();
    state.stats.uploads++;
    if (exists && overwrite) state.stats.uploadOverwrites++;
    return res.json(core.ok({
      file: target.relative,
      fileName: target.fileName,
      mediaType: target.type,
      publicUrl: `/assets/sounds/${target.relative}`,
      overwritten: !!(exists && overwrite),
      existsBefore: !!exists,
      sizeBytes: req.file.size,
      mediaInfo: info
    }));
  } catch (err) {
    state.stats.uploadFailed++;
    return res.status(500).json({ ok: false, error: 'upload_failed', message: err && err.message ? err.message : String(err) });
  }
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
  const outputTarget = normalizeOutputTarget(rule.outputTarget || (mediaType === 'video' ? soundCfg.videoOutputTarget : soundCfg.audioOutputTarget), mediaType);

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
    category: normalizeCategory(rule.category || soundCfg.defaultCategory || 'channel_reward'),
    priority: effectivePriority(rule),
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
      const row = {
        eventUid: item.id || '',
        botLogin: item.login || '',
        botDisplayName: item.user || '',
        rawText: item.text || '',
        status: 'parse_failed',
        error: 'parse_failed'
      };
      insertEvent(row);
      remember(row);
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
  let entriesStats = null;
  try {
    if (sqlite.isInitialized()) {
      dbStats = {
        total: sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_events')?.c || 0,
        unmatched: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='unmatched'")?.c || 0,
        fileMissing: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='file_missing'")?.c || 0,
        queued: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_events WHERE status='queued'")?.c || 0
      };
      if (entriesTableReady()) {
        entriesStats = {
          total: sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_entries')?.c || 0,
          active: sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_entries WHERE enabled=1')?.c || 0,
          inactive: sqlite.get('SELECT COUNT(*) AS c FROM soundalerts_bridge_entries WHERE enabled=0')?.c || 0,
          missingFile: sqlite.get("SELECT COUNT(*) AS c FROM soundalerts_bridge_entries WHERE file=''")?.c || 0,
          seededFromJson: getMetaValue('entries_seeded_from_json') === '1'
        };
      }
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
    multerReady: !!multer,
    multerLoadError,
    stats: { ...state.stats },
    database: {
      ok: sqlite.isInitialized(),
      path: sqlite.isInitialized() ? sqlite.getDbPath() : '',
      table: 'soundalerts_bridge_events',
      stats: dbStats,
      entriesTable: 'soundalerts_bridge_entries',
      entriesStats
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

  const uploadMiddleware = multer ? multer({ storage: multer.memoryStorage() }).single('file') : null;

  app.get('/api/soundalerts/status', (_req, res) => res.json(publicStatus()));
  app.get('/api/soundalerts/events', (req, res) => res.json(core.ok({ events: listEvents(req.query.limit) })));
  app.get('/api/soundalerts/stats', (_req, res) => res.json(core.ok({ stats: statsRows() })));
  app.get('/api/soundalerts/config', (_req, res) => res.json(core.ok({ config: publicConfig(), path: state.configPath })));
  app.get('/api/soundalerts/entries', (_req, res) => res.json(core.ok({ entries: getEffectiveRules(), source: Array.isArray(listEntryRules()) ? 'db' : 'json_fallback' })));

  app.post('/api/soundalerts/config', (req, res) => {
    const incoming = req.body && req.body.config ? req.body.config : req.body || {};
    const incomingRules = Array.isArray(incoming.rules) ? incoming.rules : null;
    const nextInput = mergePlain({}, incoming);
    delete nextInput.rules;
    const next = mergePlain(config, nextInput);

    if (incomingRules) {
      replaceEntryRules(incomingRules);
      next.rules = Array.isArray(config.rules) ? config.rules : [];
    }

    core.writeJson(state.configPath || cfg.resolveFromRoot('config', CONFIG_FILE), next, { spaces: 2 });
    loadConfig();
    ensureSchema();
    return res.json(core.ok({ config: publicConfig(), path: state.configPath }));
  });
  app.post('/api/soundalerts/upload', (req, res) => {
    if (!uploadMiddleware) return res.status(500).json({ ok: false, error: 'multer_unavailable', message: multerLoadError });
    uploadMiddleware(req, res, err => {
      if (err) {
        state.stats.uploadFailed++;
        return res.status(400).json({ ok: false, error: 'upload_parse_failed', message: err.message || String(err) });
      }
      return handleUploadRequest(req, res);
    });
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
    ensureSchema();
    return res.json(core.ok({ config: publicConfig(), path: state.configPath }));
  });

  const port = Number(envRef.PORT || 8080);
  setTimeout(() => connectInternalWs(port), 2500);
  console.log(`[${MODULE_NAME}] aktiv → /api/soundalerts/*`);
};

module.exports.handleChatItem = handleChatItem;
module.exports.parseSoundAlertsText = parseSoundAlertsText;
