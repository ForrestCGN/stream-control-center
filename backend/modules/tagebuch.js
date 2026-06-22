'use strict';

const fs = require('fs');
const path = require('path');
const database = require('../core/database');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const config = require('./helpers/helper_config');
const settings = require('./helpers/helper_settings');
const texts = require('./helpers/helper_texts');

const MODULE_NAME = 'tagebuch';
const MODULE_VERSION = '0.1.1';
const MODULE_BUILD = 'STEP_HT2_8_TAGEBUCH_STREAM_STATE_ENTRIES';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'content',
  description: 'Streamtagebuch API, Discord-Posting und Text-/Settings-Verwaltung.',
  routesPrefix: ['/api/tagebuch', '/tagebuch', '/discord/tagebuch'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};
const SCHEMA_VERSION = 5;
const SETTINGS_TABLE = 'tagebuch_settings';
const TEXTS_MODULE = 'tagebuch';

const DEFAULT_CONFIG = {
  enabled: true,
  requireActiveStreamForEntries: true,
  timezoneMode: 'local',
  webhookUrlEnv: 'DISCORD_WEBHOOK_TAGEBUCH',
  apiKeyEnvFallbacks: ['DISCORD_API_KEY', 'API_KEY'],
  userinfoBaseUrl: 'http://127.0.0.1:8080/userinfo',
  pageTitle: '📚 Streamtagebuch Seite {page} 📚',
  postPageHeader: true,
  useDiscordWebhook: true,
  reset: {
    allowHardReset: false,
    hardResetConfirm: 'RESET_PAGE_COUNTER'
  },
  stats: {
    enabled: true,
    countSystemEntries: false,
    defaultLimit: 10,
    maxLimit: 50
  },
  routes: {
    legacyDiscordRoutes: true,
    apiRoutes: true,
    apiV2Routes: true
  }
};

const DEFAULT_MESSAGES = {
  emptyEndNotice: 'Heute blieb das Streamtagebuch noch leer.\nWenn du etwas festhalten möchtest, nutze im Twitch-Chat: !tagebuch <dein Text>',
  usageNotice: 'Mit !tagebuch <dein Text> kannst du besondere Momente oder lustige Dinge im Streamtagebuch festhalten.\nBeispiel: !tagebuch Forrest stirbt zum dritten Mal an derselben Stelle',
  streamInactive: 'Tagebucheinträge sind nur während eines aktiven Streams möglich.',
  entrySaved: 'Tagebuch-Eintrag wurde gespeichert.',
  streamStartCreated: 'Neue Tagebuchseite für heute wurde angelegt.',
  streamStartExists: 'Tagebuchseite für heute ist bereits vorhanden.',
  streamEnd: 'Stream beendet.',
  streamEndEmptyNotice: 'Stream beendet. Leer-Hinweis wurde gepostet.',
  resetSoft: 'Aktiver Tagebuch-Status wurde zurückgesetzt.',
  resetHard: 'Tagebuch wurde komplett zurückgesetzt.',
  resetHardBlocked: 'Hard-Reset ist blockiert oder wurde nicht bestätigt.',
  unauthorized: 'Unauthorized',
  entryFailed: 'Tagebuch-Eintrag konnte nicht gespeichert werden.',
  startFailed: 'Streamstart konnte nicht verarbeitet werden.',
  endFailed: 'Streamende konnte nicht verarbeitet werden.',
  statusFailed: 'Tagebuch-Status konnte nicht gelesen werden.',
  resetFailed: 'Tagebuch-Reset fehlgeschlagen.'
};

const TEXT_CATEGORY_LABELS = {
  chat: 'Chat-Antworten',
  discord: 'Discord-Posts',
  lifecycle: 'Streamstart / Streamende',
  reset: 'Reset / System',
  errors: 'Fehlertexte'
};

const TEXT_CATEGORIES = {
  usageNotice: 'chat',
  streamInactive: 'chat',
  entrySaved: 'chat',
  unauthorized: 'chat',
  emptyEndNotice: 'discord',
  streamStartCreated: 'lifecycle',
  streamStartExists: 'lifecycle',
  streamEnd: 'lifecycle',
  streamEndEmptyNotice: 'lifecycle',
  resetSoft: 'reset',
  resetHard: 'reset',
  resetHardBlocked: 'reset',
  entryFailed: 'errors',
  startFailed: 'errors',
  endFailed: 'errors',
  statusFailed: 'errors',
  resetFailed: 'errors'
};

let runtimeConfig = null;
let runtimeMessages = null;

function nowIso() {
  return core.nowIso();
}

function safeString(value) {
  return String(value ?? '').trim();
}

function boolValue(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  const text = safeString(value).toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(text)) return false;
  return fallback;
}

function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return { ...base };
  const out = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}


function flattenSettingsObject(input, prefix = '') {
  const result = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;

  for (const [key, value] of Object.entries(input)) {
    if (!key || ['configPath', 'messagesPath', 'webhookUrl'].includes(key)) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenSettingsObject(value, fullKey));
    } else {
      result.push({
        key: fullKey,
        value,
        valueType: settings.normalizeValueType('', value),
        description: ''
      });
    }
  }

  return result;
}

function setNestedValue(target, dottedKey, value) {
  const parts = String(dottedKey || '').split('.').map(part => part.trim()).filter(Boolean);
  if (!parts.length) return target;

  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return target;
}

function applyDbSettings(baseConfig) {
  const merged = deepMerge({}, baseConfig || {});

  try {
    settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(baseConfig || {}));
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) {
      setNestedValue(merged, row.key, row.value);
    }
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'database_with_json_fallback';
    return merged;
  } catch (err) {
    console.warn(`[tagebuch] db settings unavailable, using json fallback: ${err.message}`);
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'json_fallback';
    merged.settingsError = err.message;
    return merged;
  }
}

function applyDbMessages(baseMessages) {
  const fallback = deepMerge(DEFAULT_MESSAGES, baseMessages || {});

  try {
    const result = texts.getModuleTexts(TEXTS_MODULE, fallback, { seed: true });
    return {
      ...result.texts,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: result.table,
      _textsSource: 'database_variants_with_json_fallback'
    };
  } catch (err) {
    console.warn(`[tagebuch] db texts unavailable, using json fallback: ${err.message}`);
    return {
      ...fallback,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: texts.DEFAULT_MODULE_TEXTS_TABLE,
      _textsSource: 'json_fallback',
      _textsError: err.message
    };
  }
}

function safePublicConfig(cfg) {
  return {
    enabled: Boolean(cfg.enabled),
    requireActiveStreamForEntries: Boolean(cfg.requireActiveStreamForEntries),
    streamStateForEntries: true,
    streamStateSource: 'twitch_events.getStreamState_with_tagebuch_fallback',
    postPageHeader: Boolean(cfg.postPageHeader),
    useDiscordWebhook: Boolean(cfg.useDiscordWebhook),
    hasWebhookUrl: Boolean(cfg.webhookUrl),
    userinfoBaseUrl: cfg.userinfoBaseUrl,
    pageTitle: cfg.pageTitle,
    timezoneMode: cfg.timezoneMode,
    resetAllowHardReset: Boolean(cfg.reset?.allowHardReset),
    statsEnabled: Boolean(cfg.stats?.enabled),
    statsCountSystemEntries: Boolean(cfg.stats?.countSystemEntries),
    statsDefaultLimit: Number(cfg.stats?.defaultLimit || 10),
    statsMaxLimit: Number(cfg.stats?.maxLimit || 50),
    settingsTable: cfg.settingsTable || SETTINGS_TABLE,
    settingsSource: cfg.settingsSource || 'unknown',
    settingsError: cfg.settingsError || '',
    textsTable: runtimeMessages?._textsTable || texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
    legacyTextsTable: runtimeMessages?._legacyTextsTable || texts.DEFAULT_MODULE_TEXTS_TABLE,
    textsSource: runtimeMessages?._textsSource || 'unknown'
  };
}

function getAdminPayload(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) return req.body;
  return req.query && typeof req.query === 'object' ? req.query : {};
}

function listAdminSettings() {
  settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(getConfig()));
  return settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
}

function setAdminSettings(payload) {
  const body = payload && typeof payload === 'object' ? payload : {};
  const updates = body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
    ? body.settings
    : (body.key ? { [body.key]: body.value } : {});

  if (!Object.keys(updates).length) throw new Error('settings_payload_empty');

  const rows = [];
  for (const [key, value] of Object.entries(updates)) {
    if (['webhookUrl', 'configPath', 'messagesPath'].includes(String(key))) continue;
    rows.push(settings.setSetting(SETTINGS_TABLE, key, value));
  }

  reloadRuntime();
  return { ok: true, module: MODULE_NAME, table: SETTINGS_TABLE, updated: rows.length, rows, status: buildStatus() };
}

function textEditorOptions() {
  return {
    categories: TEXT_CATEGORIES,
    categoryLabels: TEXT_CATEGORY_LABELS,
    defaultCategory: 'chat'
  };
}

function listAdminTexts() {
  return texts.listModuleTextEditor(TEXTS_MODULE, runtimeMessages || loadRuntimeMessages(), { ...textEditorOptions(), seed: true });
}

function setAdminTexts(payload) {
  const result = texts.handleModuleTextEditorPayload(TEXTS_MODULE, payload, textEditorOptions());
  reloadRuntime();
  return { ok: true, module: MODULE_NAME, ...result, status: buildStatus() };
}

function readJsonIfExists(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[tagebuch] config read failed: ${filePath}: ${err.message}`);
    return fallback;
  }
}

function writeJsonIfMissing(filePath, data) {
  try {
    if (fs.existsSync(filePath)) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.warn(`[tagebuch] default config write failed: ${filePath}: ${err.message}`);
  }
}

function configPath() {
  return config.resolveFromConfig('tagebuch.json');
}

function messagesPath() {
  return config.resolveFromConfig('messages', 'tagebuch.json');
}

function loadRuntimeConfig() {
  const file = configPath();
  writeJsonIfMissing(file, DEFAULT_CONFIG);
  const fromFile = readJsonIfExists(file, {});
  const merged = applyDbSettings(deepMerge(DEFAULT_CONFIG, fromFile));

  const envWebhook = safeString(process.env[merged.webhookUrlEnv] || process.env.DISCORD_WEBHOOK_TAGEBUCH);
  const envUserinfo = safeString(process.env.TWITCH_USERINFO_BASE_URL || process.env.USERINFO_BASE_URL);
  const envPageTitle = safeString(process.env.DISCORD_DIARY_PAGE_TITLE);

  runtimeConfig = {
    ...merged,
    webhookUrl: safeString(merged.webhookUrl || envWebhook),
    userinfoBaseUrl: envUserinfo || safeString(merged.userinfoBaseUrl) || DEFAULT_CONFIG.userinfoBaseUrl,
    pageTitle: envPageTitle || safeString(merged.pageTitle) || DEFAULT_CONFIG.pageTitle,
    configPath: file,
    messagesPath: messagesPath()
  };

  return runtimeConfig;
}

function loadRuntimeMessages() {
  const file = messagesPath();
  writeJsonIfMissing(file, DEFAULT_MESSAGES);
  const fromFile = readJsonIfExists(file, {});
  runtimeMessages = applyDbMessages(deepMerge(DEFAULT_MESSAGES, fromFile));

  if (safeString(process.env.DISCORD_DIARY_EMPTY_END_NOTICE)) runtimeMessages.emptyEndNotice = process.env.DISCORD_DIARY_EMPTY_END_NOTICE;
  if (safeString(process.env.DISCORD_DIARY_USAGE_NOTICE)) runtimeMessages.usageNotice = process.env.DISCORD_DIARY_USAGE_NOTICE;

  return runtimeMessages;
}

function getConfig() {
  return runtimeConfig || loadRuntimeConfig();
}

function getMessages() {
  const base = runtimeMessages || loadRuntimeMessages();
  return new Proxy(base, {
    get(target, prop) {
      if (typeof prop !== 'string' || prop.startsWith('_')) return target[prop];
      if (!Object.prototype.hasOwnProperty.call(target, prop)) return target[prop];
      try {
        return texts.pickModuleText(TEXTS_MODULE, prop, target, { ...textEditorOptions(), seed: false }) || target[prop];
      } catch (err) {
        return target[prop];
      }
    }
  });
}

function reloadRuntime() {
  runtimeConfig = null;
  runtimeMessages = null;
  return { config: getConfig(), messages: getMessages() };
}

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function stripTagebuchCommand(value) {
  const text = safeString(value);
  if (!text) return '';
  return text.replace(/^!tagebuch\b\s*/i, '').trim();
}

function getInput(req, key) {
  return core.getParam(req, key, undefined);
}

function wantsPlain(req) {
  const plain = safeString(getInput(req, 'plain'));
  return plain === '1' || plain.toLowerCase() === 'true' || req.headers['accept'] === 'text/plain';
}

function authOk(req) {
  return security.canAccess(req).allowed;
}

function jsonForbidden(res) {
  return res.status(403).json({ ok: false, error: 'forbidden', message: getMessages().unauthorized });
}

function buildPageTitle(pageNumber) {
  return getConfig().pageTitle.replace('{page}', String(pageNumber));
}

function ensureSchema() {
  database.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_from, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS tagebuch_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          current_page_number INTEGER NOT NULL DEFAULT 0,
          current_page_date TEXT,
          last_stream_started_at TEXT,
          last_stream_ended_at TEXT,
          active_stream INTEGER NOT NULL DEFAULT 0,
          has_entries_for_current_date INTEGER NOT NULL DEFAULT 0,
          end_notice_posted_for_current_date INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
      `);

      const stateDefaults = {
        id: 1,
        current_page_number: 0,
        current_page_date: null,
        last_stream_started_at: null,
        last_stream_ended_at: null,
        active_stream: 0,
        has_entries_for_current_date: 0,
        end_notice_posted_for_current_date: 0,
        updated_at: nowIso()
      };
      db.prepare(database.buildInsertIgnoreSql('tagebuch_state', stateDefaults)).run(stateDefaults);
    }

    if (toVersion === 2) {
      const names = new Set(database.tableColumns('tagebuch_state'));
      if (!names.has('current_page_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN current_page_date TEXT;`);
      if (!names.has('last_stream_started_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN last_stream_started_at TEXT;`);
      if (!names.has('last_stream_ended_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN last_stream_ended_at TEXT;`);
      if (!names.has('active_stream')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN active_stream INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('has_entries_for_current_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN has_entries_for_current_date INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('end_notice_posted_for_current_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN end_notice_posted_for_current_date INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('updated_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';`);
    }

    if (toVersion === 3) {
      const names = new Set(database.tableColumns('tagebuch_state'));
      if (names.has('active_block_id')) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS tagebuch_state_new (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            current_page_number INTEGER NOT NULL DEFAULT 0,
            current_page_date TEXT,
            last_stream_started_at TEXT,
            last_stream_ended_at TEXT,
            active_stream INTEGER NOT NULL DEFAULT 0,
            has_entries_for_current_date INTEGER NOT NULL DEFAULT 0,
            end_notice_posted_for_current_date INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
          );
        `);

        db.prepare(`
          INSERT OR REPLACE INTO tagebuch_state_new (
            id, current_page_number, current_page_date, last_stream_started_at,
            last_stream_ended_at, active_stream, has_entries_for_current_date,
            end_notice_posted_for_current_date, updated_at
          )
          SELECT
            1,
            COALESCE(current_page_number, 0),
            current_page_date,
            NULL,
            NULL,
            0,
            COALESCE(has_entries_for_current_date, 0),
            COALESCE(end_notice_posted_for_current_date, 0),
            :updatedAt
          FROM tagebuch_state
          WHERE id = 1
        `).run({ updatedAt: nowIso() });
        db.exec(`DROP TABLE tagebuch_state;`);
        db.exec(`ALTER TABLE tagebuch_state_new RENAME TO tagebuch_state;`);
      }
    }

    if (toVersion === 4) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS tagebuch_runtime_events (
          id ${database.primaryKeyAutoIncrementSql()},
          event_type TEXT NOT NULL,
          page_number INTEGER,
          page_date TEXT,
          actor_login TEXT,
          actor_display TEXT,
          system INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);
      const stateDefaults = {
        id: 1,
        current_page_number: 0,
        current_page_date: null,
        last_stream_started_at: null,
        last_stream_ended_at: null,
        active_stream: 0,
        has_entries_for_current_date: 0,
        end_notice_posted_for_current_date: 0,
        updated_at: nowIso()
      };
      db.prepare(database.buildInsertIgnoreSql('tagebuch_state', stateDefaults)).run(stateDefaults);
    }


    if (toVersion === 5) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS tagebuch_user_stats (
          user_key TEXT PRIMARY KEY,
          user_id TEXT,
          login TEXT,
          display_name TEXT,
          entry_count INTEGER NOT NULL DEFAULT 0,
          first_entry_at TEXT,
          last_entry_at TEXT,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tagebuch_daily_user_stats (
          page_date TEXT NOT NULL,
          page_number INTEGER NOT NULL,
          user_key TEXT NOT NULL,
          user_id TEXT,
          login TEXT,
          display_name TEXT,
          entry_count INTEGER NOT NULL DEFAULT 0,
          first_entry_at TEXT,
          last_entry_at TEXT,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (page_date, user_key)
        );

        CREATE INDEX IF NOT EXISTS idx_tagebuch_user_stats_entry_count
          ON tagebuch_user_stats(entry_count DESC, last_entry_at DESC);

        CREATE INDEX IF NOT EXISTS idx_tagebuch_daily_user_stats_page
          ON tagebuch_daily_user_stats(page_date DESC, entry_count DESC);
      `);
    }
  });
}

function getState() {
  return database.get(`SELECT * FROM tagebuch_state WHERE id = 1`) || {
    id: 1,
    current_page_number: 0,
    current_page_date: null,
    last_stream_started_at: null,
    last_stream_ended_at: null,
    active_stream: 0,
    has_entries_for_current_date: 0,
    end_notice_posted_for_current_date: 0,
    updated_at: nowIso(),
  };
}

function saveState(next) {
  database.upsert(
    'tagebuch_state',
    {
      id: 1,
      current_page_number: Number(next.current_page_number || 0),
      current_page_date: next.current_page_date || null,
      last_stream_started_at: next.last_stream_started_at || null,
      last_stream_ended_at: next.last_stream_ended_at || null,
      active_stream: next.active_stream ? 1 : 0,
      has_entries_for_current_date: next.has_entries_for_current_date ? 1 : 0,
      end_notice_posted_for_current_date: next.end_notice_posted_for_current_date ? 1 : 0,
      updated_at: nowIso(),
    },
    ['id'],
    [
      'current_page_number',
      'current_page_date',
      'last_stream_started_at',
      'last_stream_ended_at',
      'active_stream',
      'has_entries_for_current_date',
      'end_notice_posted_for_current_date',
      'updated_at'
    ]
  );
}

function logRuntimeEvent(type, data = {}) {
  try {
    database.run(
      `
        INSERT INTO tagebuch_runtime_events (
          event_type, page_number, page_date, actor_login, actor_display, system, created_at
        ) VALUES (
          :event_type, :page_number, :page_date, :actor_login, :actor_display, :system, :created_at
        )
      `,
      {
        event_type: safeString(type),
        page_number: data.pageNumber == null ? null : Number(data.pageNumber),
        page_date: data.pageDate || null,
        actor_login: data.actorLogin || null,
        actor_display: data.actorDisplay || null,
        system: data.system ? 1 : 0,
        created_at: nowIso()
      }
    );
  } catch (err) {
    console.warn(`[tagebuch] runtime event skipped: ${err.message}`);
  }
}

function getBridge(ctx) {
  const bridge = ctx?.app?.locals?.discordBridge || ctx?.discordBridge;
  if (!bridge) throw new Error('discordBridge nicht verfügbar');
  if (typeof bridge.postToWebhook !== 'function') throw new Error('discordBridge.postToWebhook fehlt');
  return bridge;
}

async function resolveTwitchUser(authorLogin) {
  const login = safeString(authorLogin).toLowerCase();
  if (!login) return null;

  try {
    const url = `${getConfig().userinfoBaseUrl}?login=${encodeURIComponent(login)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    const user = Array.isArray(json?.data) ? json.data[0] : null;
    if (!user) return null;
    return {
      id: safeString(user.id),
      login: safeString(user.login),
      displayName: safeString(user.display_name) || safeString(user.login),
      avatarUrl: safeString(user.profile_image_url),
    };
  } catch (_) {
    return null;
  }
}


function normalizeUserKey({ userId, login, displayName }) {
  const cleanId = safeString(userId);
  if (cleanId) return `id:${cleanId}`;

  const cleanLogin = safeString(login).toLowerCase();
  if (cleanLogin) return `login:${cleanLogin}`;

  const cleanDisplay = safeString(displayName).toLowerCase();
  if (cleanDisplay) return `display:${cleanDisplay}`;

  return '';
}

function updateUserStats({ pageDate, pageNumber, userId, login, displayName, system = false }) {
  const cfg = getConfig();
  if (!cfg.stats?.enabled) return { ok: true, skipped: true, reason: 'stats_disabled' };
  if (system && !cfg.stats?.countSystemEntries) return { ok: true, skipped: true, reason: 'system_entry' };

  const cleanLogin = safeString(login).toLowerCase();
  const cleanDisplay = safeString(displayName) || cleanLogin || 'Unbekannt';
  const cleanUserId = safeString(userId);
  const userKey = normalizeUserKey({ userId: cleanUserId, login: cleanLogin, displayName: cleanDisplay });
  if (!userKey) return { ok: true, skipped: true, reason: 'missing_user' };

  const at = nowIso();

  database.run(
    `
      INSERT INTO tagebuch_user_stats (
        user_key, user_id, login, display_name, entry_count,
        first_entry_at, last_entry_at, updated_at
      ) VALUES (
        :user_key, :user_id, :login, :display_name, 1,
        :at, :at, :at
      )
      ON CONFLICT(user_key) DO UPDATE SET
        user_id = COALESCE(NULLIF(excluded.user_id, ''), tagebuch_user_stats.user_id),
        login = COALESCE(NULLIF(excluded.login, ''), tagebuch_user_stats.login),
        display_name = COALESCE(NULLIF(excluded.display_name, ''), tagebuch_user_stats.display_name),
        entry_count = tagebuch_user_stats.entry_count + 1,
        last_entry_at = excluded.last_entry_at,
        updated_at = excluded.updated_at
    `,
    {
      user_key: userKey,
      user_id: cleanUserId || null,
      login: cleanLogin || null,
      display_name: cleanDisplay || null,
      at
    }
  );

  database.run(
    `
      INSERT INTO tagebuch_daily_user_stats (
        page_date, page_number, user_key, user_id, login, display_name,
        entry_count, first_entry_at, last_entry_at, updated_at
      ) VALUES (
        :page_date, :page_number, :user_key, :user_id, :login, :display_name,
        1, :at, :at, :at
      )
      ON CONFLICT(page_date, user_key) DO UPDATE SET
        page_number = excluded.page_number,
        user_id = COALESCE(NULLIF(excluded.user_id, ''), tagebuch_daily_user_stats.user_id),
        login = COALESCE(NULLIF(excluded.login, ''), tagebuch_daily_user_stats.login),
        display_name = COALESCE(NULLIF(excluded.display_name, ''), tagebuch_daily_user_stats.display_name),
        entry_count = tagebuch_daily_user_stats.entry_count + 1,
        last_entry_at = excluded.last_entry_at,
        updated_at = excluded.updated_at
    `,
    {
      page_date: pageDate,
      page_number: Number(pageNumber || 0),
      user_key: userKey,
      user_id: cleanUserId || null,
      login: cleanLogin || null,
      display_name: cleanDisplay || null,
      at
    }
  );

  return { ok: true, userKey };
}

function statsLimit(req) {
  const cfg = getConfig();
  const raw = Number(getInput(req, 'limit') || cfg.stats?.defaultLimit || 10);
  const max = Number(cfg.stats?.maxLimit || 50);
  if (!Number.isFinite(raw) || raw <= 0) return Math.min(10, max);
  return Math.min(Math.floor(raw), max);
}

function mapUserStatsRow(row) {
  return {
    userKey: row.user_key,
    userId: row.user_id || null,
    login: row.login || null,
    displayName: row.display_name || row.login || null,
    entryCount: Number(row.entry_count || 0),
    firstEntryAt: row.first_entry_at || null,
    lastEntryAt: row.last_entry_at || null
  };
}

function mapDailyStatsRow(row) {
  return {
    pageDate: row.page_date || null,
    pageNumber: row.page_number == null ? null : Number(row.page_number),
    userKey: row.user_key,
    userId: row.user_id || null,
    login: row.login || null,
    displayName: row.display_name || row.login || null,
    entryCount: Number(row.entry_count || 0),
    firstEntryAt: row.first_entry_at || null,
    lastEntryAt: row.last_entry_at || null
  };
}

function getStatsTop(limit = 10) {
  return database.all(
    `
      SELECT user_key, user_id, login, display_name, entry_count, first_entry_at, last_entry_at
      FROM tagebuch_user_stats
      ORDER BY entry_count DESC, last_entry_at DESC, display_name COLLATE NOCASE ASC
      LIMIT :limit
    `,
    { limit: Number(limit || 10) }
  ).map(mapUserStatsRow);
}

function getStatsForDate(pageDate, limit = 10) {
  return database.all(
    `
      SELECT page_date, page_number, user_key, user_id, login, display_name, entry_count, first_entry_at, last_entry_at
      FROM tagebuch_daily_user_stats
      WHERE page_date = :pageDate
      ORDER BY entry_count DESC, last_entry_at DESC, display_name COLLATE NOCASE ASC
      LIMIT :limit
    `,
    { pageDate, limit: Number(limit || 10) }
  ).map(mapDailyStatsRow);
}

function getStatsForUser(user) {
  const needle = safeString(user).toLowerCase().replace(/^@/, '');
  if (!needle) return null;

  const row = database.get(
    `
      SELECT user_key, user_id, login, display_name, entry_count, first_entry_at, last_entry_at
      FROM tagebuch_user_stats
      WHERE lower(login) = :needle
         OR lower(display_name) = :needle
         OR user_id = :raw
         OR user_key = :raw
         OR user_key = :loginKey
      LIMIT 1
    `,
    { needle, raw: safeString(user), loginKey: `login:${needle}` }
  );

  return row ? mapUserStatsRow(row) : null;
}

async function postWebhook(ctx, payload) {
  const cfg = getConfig();
  if (!cfg.useDiscordWebhook) {
    return { ok: true, skipped: true, reason: 'discord_webhook_disabled' };
  }
  if (!cfg.webhookUrl) throw new Error(`${cfg.webhookUrlEnv || 'DISCORD_WEBHOOK_TAGEBUCH'} fehlt`);

  const bridge = getBridge(ctx);
  return bridge.postToWebhook({
    webhookUrl: cfg.webhookUrl,
    allowedMentions: { parse: [] },
    ...payload
  });
}

function getCentralStreamStateSnapshot() {
  try {
    const twitchEvents = require('./twitch_events');
    if (!twitchEvents || typeof twitchEvents.getStreamState !== 'function') {
      return { ok: false, available: false, live: false, source: 'twitch_events_unavailable', error: 'getStreamState_unavailable' };
    }
    const streamState = twitchEvents.getStreamState() || {};
    const live = streamState.live === true || String(streamState.status || '').toLowerCase() === 'live';
    return {
      ok: true,
      available: true,
      live,
      status: safeString(streamState.status || (live ? 'live' : 'offline')),
      source: safeString(streamState.source || streamState.provider || 'twitch_events'),
      sourceSummary: safeString(streamState.sourceSummary || ''),
      confidence: safeString(streamState.confidence || ''),
      streamId: safeString(streamState.streamId || ''),
      streamSessionId: safeString(streamState.streamSessionId || streamState.streamSession?.streamSessionId || ''),
      streamDayId: safeString(streamState.streamDayId || streamState.streamSession?.streamDayId || ''),
      manualOverrideActive: streamState.manualOverride?.active === true,
      manualOverrideLive: streamState.manualOverride?.live === true,
      error: ''
    };
  } catch (err) {
    return { ok: false, available: false, live: false, source: 'twitch_events_error', error: err && err.message ? err.message : String(err) };
  }
}

function resolveEntryStreamGate(state = getState()) {
  const central = getCentralStreamStateSnapshot();
  const tagebuchActive = Boolean(state.active_stream);
  const centralActive = central.ok === true && central.live === true;
  return {
    active: centralActive || tagebuchActive,
    source: centralActive ? 'twitch_events_stream_state' : (tagebuchActive ? 'tagebuch_state' : 'none'),
    tagebuchActive,
    centralActive,
    central,
  };
}

async function createPageForDateIfNeeded(ctx, pageDate) {
  const cfg = getConfig();
  const state = getState();
  const targetDate = safeString(pageDate) || localDateString();

  if (state.current_page_date === targetDate) {
    return {
      ok: true,
      created: false,
      currentPageNumber: Number(state.current_page_number || 0),
      currentPageDate: state.current_page_date,
    };
  }

  const nextPageNumber = Number(state.current_page_number || 0) + 1;

  if (cfg.postPageHeader) {
    await postWebhook(ctx, { content: `# ${buildPageTitle(nextPageNumber)}` });
  }

  saveState({
    ...state,
    current_page_number: nextPageNumber,
    current_page_date: targetDate,
    has_entries_for_current_date: false,
    end_notice_posted_for_current_date: false,
  });

  logRuntimeEvent('page_created', { pageNumber: nextPageNumber, pageDate: targetDate });

  return {
    ok: true,
    created: true,
    currentPageNumber: nextPageNumber,
    currentPageDate: targetDate,
  };
}

async function markStreamStarted(ctx) {
  const today = localDateString();
  const pageInfo = await createPageForDateIfNeeded(ctx, today);

  saveState({
    ...getState(),
    active_stream: true,
    last_stream_started_at: nowIso(),
  });

  const finalState = getState();
  logRuntimeEvent('stream_start', { pageNumber: finalState.current_page_number, pageDate: finalState.current_page_date });

  return {
    ok: true,
    version: 2,
    mode: 'stream_start',
    message: pageInfo.created ? getMessages().streamStartCreated : getMessages().streamStartExists,
    pageHeaderCreatedNow: Boolean(pageInfo.created),
    currentPageNumber: Number(finalState.current_page_number || 0),
    currentPageDate: finalState.current_page_date,
    activeStream: Boolean(finalState.active_stream),
    lastStreamStartedAt: finalState.last_stream_started_at,
  };
}

async function postDiaryEntry(ctx, { authorDisplay, authorLogin, message, system = false, systemUsername = '' }) {
  const cfg = getConfig();
  const state = getState();

  const streamGate = resolveEntryStreamGate(state);
  if (cfg.requireActiveStreamForEntries && !streamGate.active) {
    return {
      ok: false,
      error: 'stream_inactive',
      message: getMessages().streamInactive,
      streamGate,
    };
  }

  const cleanMessage = stripTagebuchCommand(message);
  const cleanLogin = safeString(authorLogin).toLowerCase();

  if (!cleanMessage) {
    return {
      ok: false,
      error: 'missing_message',
      message: getMessages().usageNotice,
    };
  }

  const today = localDateString();
  const pageInfo = await createPageForDateIfNeeded(ctx, today);
  const twitchUser = await resolveTwitchUser(cleanLogin);
  const posterName = safeString(authorDisplay) || twitchUser?.displayName || twitchUser?.login || cleanLogin || 'Unbekannt';
  const safeSystemUsername = safeString(systemUsername);

  const webhookPayload = {
    content: `*${cleanMessage}*`,
    username: system && safeSystemUsername ? safeSystemUsername : `${posterName} schreibt folgendes ins Tagebuch:`
  };

  if (!system && twitchUser?.avatarUrl) {
    webhookPayload.avatar_url = twitchUser.avatarUrl;
  }

  const result = await postWebhook(ctx, webhookPayload);

  saveState({
    ...getState(),
    has_entries_for_current_date: true,
  });

  const finalState = getState();
  logRuntimeEvent('entry_posted', {
    pageNumber: finalState.current_page_number,
    pageDate: finalState.current_page_date,
    actorLogin: cleanLogin,
    actorDisplay: posterName,
    system
  });

  const statsResult = updateUserStats({
    pageDate: finalState.current_page_date,
    pageNumber: finalState.current_page_number,
    userId: twitchUser?.id,
    login: twitchUser?.login || cleanLogin,
    displayName: posterName,
    system
  });

  return {
    ok: true,
    version: 2,
    mode: 'tagebuch',
    message: getMessages().entrySaved,
    pageNumber: Number(finalState.current_page_number || 0),
    pageDate: finalState.current_page_date,
    pageHeaderCreatedNow: Boolean(pageInfo.created),
    posterName,
    resolvedViaUserinfo: Boolean(twitchUser),
    postResult: result,
    statsResult,
  };
}

async function markStreamEnded(ctx) {
  const state = getState();
  const today = localDateString();

  saveState({
    ...state,
    active_stream: false,
    last_stream_ended_at: nowIso(),
  });

  let emptyReminderPosted = false;
  let emptyReminderReason = 'entries_exist';
  const after = getState();

  if (after.current_page_date === today && !after.has_entries_for_current_date && !after.end_notice_posted_for_current_date) {
    await postWebhook(ctx, { content: getMessages().emptyEndNotice });
    saveState({
      ...getState(),
      end_notice_posted_for_current_date: true,
    });
    emptyReminderPosted = true;
    emptyReminderReason = 'no_entries';
  }

  const finalState = getState();
  logRuntimeEvent('stream_end', { pageNumber: finalState.current_page_number, pageDate: finalState.current_page_date });

  return {
    ok: true,
    version: 2,
    mode: 'stream_end',
    message: emptyReminderPosted ? getMessages().streamEndEmptyNotice : getMessages().streamEnd,
    currentPageNumber: Number(finalState.current_page_number || 0),
    currentPageDate: finalState.current_page_date,
    lastStreamEndedAt: finalState.last_stream_ended_at,
    activeStream: Boolean(finalState.active_stream),
    emptyReminderPosted,
    emptyReminderReason,
    hasEntriesForCurrentDate: Boolean(finalState.has_entries_for_current_date),
  };
}

function resetState(mode, confirm) {
  const cfg = getConfig();
  const state = getState();
  const hard = safeString(mode).toLowerCase() === 'hard';

  if (hard && (!cfg.reset.allowHardReset || safeString(confirm) !== safeString(cfg.reset.hardResetConfirm))) {
    return {
      ok: false,
      error: 'hard_reset_blocked',
      message: getMessages().resetHardBlocked,
      requiredConfirm: cfg.reset.hardResetConfirm
    };
  }

  saveState({
    ...state,
    current_page_number: hard ? 0 : Number(state.current_page_number || 0),
    current_page_date: null,
    last_stream_started_at: null,
    last_stream_ended_at: null,
    active_stream: false,
    has_entries_for_current_date: false,
    end_notice_posted_for_current_date: false,
  });

  const next = getState();
  logRuntimeEvent(hard ? 'reset_hard' : 'reset_soft', { pageNumber: next.current_page_number, pageDate: next.current_page_date });

  return {
    ok: true,
    version: 2,
    mode: hard ? 'hard' : 'soft',
    message: hard ? getMessages().resetHard : getMessages().resetSoft,
    state: publicState(next),
  };
}

function nextPageNumberIfNewDate(state = getState()) {
  const today = localDateString();
  return state.current_page_date === today ? Number(state.current_page_number || 0) : Number(state.current_page_number || 0) + 1;
}

function publicState(state = getState()) {
  const streamGate = resolveEntryStreamGate(state);
  return {
    currentPageNumber: Number(state.current_page_number || 0),
    currentPageDate: state.current_page_date,
    nextPageNumberIfNewDate: nextPageNumberIfNewDate(state),
    localDateToday: localDateString(),
    lastStreamStartedAt: state.last_stream_started_at,
    lastStreamEndedAt: state.last_stream_ended_at,
    activeStream: Boolean(state.active_stream),
    effectiveActiveStreamForEntries: Boolean(streamGate.active),
    entryStreamSource: streamGate.source,
    centralStreamState: streamGate.central,
    hasEntriesForCurrentDate: Boolean(state.has_entries_for_current_date),
    endNoticePostedForCurrentDate: Boolean(state.end_notice_posted_for_current_date),
    updatedAt: state.updated_at
  };
}


function countTableRowsWhere(tableName, where = '', params = {}) {
  try {
    const safeTable = safeString(tableName);
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeTable)) {
      return { ok: false, table: safeTable, count: 0, error: 'invalid_table' };
    }
    const clause = where ? ` WHERE ${where}` : '';
    const row = database.get(`SELECT COUNT(*) AS count FROM ${safeTable}${clause}`, params);
    return { ok: true, table: safeTable, count: Number(row?.count || 0), error: '' };
  } catch (err) {
    return { ok: false, table: tableName, count: 0, error: err.message };
  }
}

function buildStandardDiagnostics() {
  const warnings = [];
  const errors = [];

  const cfg = getConfig();
  const publicCfg = safePublicConfig(cfg);
  const state = getState();
  const schemaVersion = database.getSchemaVersion(MODULE_NAME);

  if (Number(schemaVersion || 0) < SCHEMA_VERSION) {
    warnings.push('schema_version_below_expected');
  }

  const db = {
    ok: true,
    adapter: typeof database.getAdapter === 'function' ? database.getAdapter() : 'sqlite',
    path: typeof database.getDbPath === 'function' ? database.getDbPath() : null,
    schemaVersion,
    expectedSchemaVersion: SCHEMA_VERSION,
    error: ''
  };

  const tableCounts = {
    state: countTableRows('tagebuch_state'),
    runtimeEvents: countTableRows('tagebuch_runtime_events'),
    userStats: countTableRows('tagebuch_user_stats'),
    dailyUserStats: countTableRows('tagebuch_daily_user_stats'),
    settings: countTableRows(SETTINGS_TABLE),
    textVariants: countTableRowsWhere(texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE, 'module_name = :module', { module: TEXTS_MODULE }),
    legacyTexts: countTableRowsWhere(texts.DEFAULT_MODULE_TEXTS_TABLE, 'module_name = :module', { module: TEXTS_MODULE })
  };

  for (const check of Object.values(tableCounts)) {
    if (!check.ok) errors.push(`${check.table}:${check.error}`);
  }

  const configFile = fileCheck('config', cfg.configPath);
  const messagesFile = fileCheck('messages', cfg.messagesPath);
  if (!configFile.ok) warnings.push('config_file_missing_or_not_file');
  if (!messagesFile.ok) warnings.push('messages_file_missing_or_not_file');

  if (cfg.useDiscordWebhook && !cfg.webhookUrl) {
    warnings.push('discord_webhook_enabled_but_missing_url');
  }

  const ok = errors.length === 0;
  const health = ok ? (warnings.length ? 'warn' : 'ok') : 'error';

  return {
    ok,
    health,
    module: MODULE_NAME,
    version: MODULE_VERSION,
    schemaVersion,
    schemaReady: Number(schemaVersion || 0) >= SCHEMA_VERSION,
    configSource: publicCfg.settingsSource || 'unknown',
    textSource: publicCfg.textsSource || 'unknown',
    database: db,
    counts: {
      state: tableCounts.state.count,
      runtimeEvents: tableCounts.runtimeEvents.count,
      userStats: tableCounts.userStats.count,
      dailyUserStats: tableCounts.dailyUserStats.count,
      settings: tableCounts.settings.count,
      textVariants: tableCounts.textVariants.count,
      legacyTexts: tableCounts.legacyTexts.count
    },
    state: {
      activeStream: Boolean(state.active_stream),
      effectiveActiveStreamForEntries: Boolean(resolveEntryStreamGate(state).active),
      entryStreamSource: resolveEntryStreamGate(state).source,
      currentPageNumber: Number(state.current_page_number || 0),
      currentPageDate: state.current_page_date || null,
      hasEntriesForCurrentDate: Boolean(state.has_entries_for_current_date),
      endNoticePostedForCurrentDate: Boolean(state.end_notice_posted_for_current_date)
    },
    files: {
      config: configFile,
      messages: messagesFile
    },
    webhook: {
      useDiscordWebhook: Boolean(cfg.useDiscordWebhook),
      hasWebhookUrl: Boolean(cfg.webhookUrl),
      webhookUrlEnv: cfg.webhookUrlEnv || ''
    },
    warnings,
    errors,
    lastError: errors[0] || publicCfg.settingsError || runtimeMessages?._textsError || null
  };
}

function buildStatus() {
  const cfg = getConfig();
  const state = getState();
  return {
    ok: true,
    module: 'tagebuch',
    version: 2,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    schemaVersion: database.getSchemaVersion(MODULE_NAME),
    databasePath: typeof database.getDbPath === 'function' ? database.getDbPath() : null,
    configPath: cfg.configPath,
    messagesPath: cfg.messagesPath,
    config: safePublicConfig(cfg),
    state: publicState(state),
    diagnostics: buildStandardDiagnostics(),
  };
}


function countTableRows(tableName) {
  try {
    const row = database.get(`SELECT COUNT(*) AS count FROM ${tableName}`);
    return { ok: true, table: tableName, count: Number(row?.count || 0), error: '' };
  } catch (err) {
    return { ok: false, table: tableName, count: 0, error: err.message };
  }
}

function fileCheck(label, filePath) {
  try {
    const exists = Boolean(filePath && fs.existsSync(filePath));
    let isFile = false;
    if (exists) isFile = fs.statSync(filePath).isFile();
    return { ok: exists && isFile, label, path: filePath || '', exists, isFile, error: '' };
  } catch (err) {
    return { ok: false, label, path: filePath || '', exists: false, isFile: false, error: err.message };
  }
}

function buildTagebuchRoutes() {
  const routeList = [
    { method: 'GET', path: '/api/tagebuch/status', auth: 'local_or_auth', category: 'status', description: 'Tagebuch-Status, Config-Quellen und aktueller Stream-/Seitenzustand.' },
    { method: 'GET', path: '/api/tagebuch/config', auth: 'local_or_auth', category: 'config', description: 'Read-only effektive Tagebuch-Config ohne Secrets.' },
    { method: 'GET', path: '/api/tagebuch/settings', auth: 'local_or_auth', category: 'settings', description: 'Read-only DB-Settings aus tagebuch_settings.' },
    { method: 'GET', path: '/api/tagebuch/routes', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Routenübersicht des Tagebuch-Moduls.' },
    { method: 'GET', path: '/api/tagebuch/integration-check', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Integration-Check des Tagebuch-Moduls.' },
    { method: 'POST', path: '/api/tagebuch/reload', auth: 'local_or_auth', category: 'admin', description: 'Runtime-Config und Texte neu laden.' },
    { method: 'GET', path: '/api/tagebuch/reload', auth: 'local_or_auth', category: 'admin', description: 'Runtime-Config und Texte neu laden, GET-kompatibel für einfache Clients.' },

    { method: 'POST', path: '/api/tagebuch/stream/start', auth: 'local_or_auth', category: 'lifecycle', description: 'Streamstart verarbeiten und ggf. neue Tagebuchseite anlegen.' },
    { method: 'GET', path: '/api/tagebuch/stream/start', auth: 'local_or_auth', category: 'lifecycle', description: 'Streamstart verarbeiten, GET-kompatibel für Streamer.bot/ einfache Clients.' },
    { method: 'POST', path: '/api/tagebuch/stream/end', auth: 'local_or_auth', category: 'lifecycle', description: 'Streamende verarbeiten und ggf. Leer-Hinweis posten.' },
    { method: 'GET', path: '/api/tagebuch/stream/end', auth: 'local_or_auth', category: 'lifecycle', description: 'Streamende verarbeiten, GET-kompatibel für Streamer.bot/ einfache Clients.' },

    { method: 'POST', path: '/api/tagebuch/entry', auth: 'local_or_auth', category: 'entry', description: 'Tagebuch-Eintrag speichern/posten.' },
    { method: 'GET', path: '/api/tagebuch/entry', auth: 'local_or_auth', category: 'entry', description: 'Tagebuch-Eintrag speichern/posten, GET-kompatibel für Streamer.bot/ einfache Clients.' },
    { method: 'POST', path: '/api/tagebuch/reset', auth: 'local_or_auth', category: 'reset', description: 'Tagebuch-State zurücksetzen.' },
    { method: 'GET', path: '/api/tagebuch/reset', auth: 'local_or_auth', category: 'reset', description: 'Tagebuch-State zurücksetzen, GET-kompatibel für einfache Clients.' },

    { method: 'GET', path: '/api/tagebuch/stats', auth: 'local_or_auth', category: 'stats', description: 'Top-User-Statistik lesen.' },
    { method: 'GET', path: '/api/tagebuch/stats/top', auth: 'local_or_auth', category: 'stats', description: 'Top-User-Statistik lesen.' },
    { method: 'GET', path: '/api/tagebuch/stats/today', auth: 'local_or_auth', category: 'stats', description: 'Tagesstatistik lesen.' },
    { method: 'GET', path: '/api/tagebuch/stats/user', auth: 'local_or_auth', category: 'stats', description: 'Statistik für einen User lesen.' },

    { method: 'GET', path: '/api/tagebuch/admin/settings', auth: 'local_or_auth', category: 'admin', description: 'Admin-Settings lesen.' },
    { method: 'POST', path: '/api/tagebuch/admin/settings', auth: 'local_or_auth', category: 'admin', description: 'Admin-Settings speichern.' },
    { method: 'GET', path: '/api/tagebuch/admin/texts', auth: 'local_or_auth', category: 'admin', description: 'Tagebuch-Texteditor-Daten lesen.' },
    { method: 'POST', path: '/api/tagebuch/admin/texts', auth: 'local_or_auth', category: 'admin', description: 'Tagebuch-Texte/Varianten speichern.' },

    { method: 'POST', path: '/discord/stream/start', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Streamstart.' },
    { method: 'GET', path: '/discord/stream/start', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Streamstart.' },
    { method: 'POST', path: '/discord/stream/end', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Streamende.' },
    { method: 'GET', path: '/discord/stream/end', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Streamende.' },
    { method: 'POST', path: '/discord/tagebuch', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Tagebuch-Eintrag.' },
    { method: 'GET', path: '/discord/tagebuch', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Tagebuch-Eintrag.' },
    { method: 'GET', path: '/discord/tagebuch/status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Tagebuch-Status.' },
    { method: 'POST', path: '/discord/tagebuch/reset', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reset.' },
    { method: 'GET', path: '/discord/tagebuch/reset', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reset.' }
  ];

  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    standardPrefix: '/api/tagebuch',
    legacyPrefixes: ['/discord/tagebuch', '/discord/stream'],
    standardEndpoints: {
      status: '/api/tagebuch/status',
      config: '/api/tagebuch/config',
      settings: '/api/tagebuch/settings',
      routes: '/api/tagebuch/routes',
      integrationCheck: '/api/tagebuch/integration-check',
      reload: '/api/tagebuch/reload'
    },
    routes: routeList,
    count: routeList.length,
    categories: Array.from(new Set(routeList.map(route => route.category))).sort(),
    notes: [
      'Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.',
      'Bestehende Legacy-Routen bleiben erhalten.',
      'Schreibende Routen sind nur dokumentiert, nicht neu angelegt.',
      '/api/tagebuch/config und /api/tagebuch/settings sind read-only Standard-Aliase.'
    ]
  };
}

function buildTagebuchIntegrationCheck() {
  const warnings = [];
  const errors = [];
  const checks = {};

  let cfg = null;
  let status = null;

  try {
    cfg = getConfig();
    status = buildStatus();
    checks.config = {
      ok: true,
      path: cfg.configPath,
      messagesPath: cfg.messagesPath,
      source: cfg.settingsSource || 'unknown',
      hasWebhookUrl: Boolean(cfg.webhookUrl),
      error: ''
    };
  } catch (err) {
    checks.config = { ok: false, path: '', messagesPath: '', source: 'unknown', hasWebhookUrl: false, error: err.message };
    errors.push(`config: ${err.message}`);
  }

  try {
    checks.database = {
      ok: true,
      adapter: 'sqlite',
      path: typeof database.getDbPath === 'function' ? database.getDbPath() : null,
      schemaVersion: database.getSchemaVersion(MODULE_NAME),
      expectedSchemaVersion: SCHEMA_VERSION,
      error: ''
    };
    if (Number(checks.database.schemaVersion || 0) < SCHEMA_VERSION) warnings.push('schema_version_below_expected');
  } catch (err) {
    checks.database = { ok: false, adapter: 'sqlite', path: null, schemaVersion: 0, expectedSchemaVersion: SCHEMA_VERSION, error: err.message };
    errors.push(`database: ${err.message}`);
  }

  checks.tables = {
    state: countTableRows('tagebuch_state'),
    runtimeEvents: countTableRows('tagebuch_runtime_events'),
    userStats: countTableRows('tagebuch_user_stats'),
    dailyUserStats: countTableRows('tagebuch_daily_user_stats'),
    settings: countTableRows(SETTINGS_TABLE),
    textVariants: countTableRows(texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE)
  };

  for (const check of Object.values(checks.tables)) {
    if (!check.ok) errors.push(`table_${check.table}: ${check.error}`);
  }

  try {
    const listed = listAdminSettings();
    checks.settings = {
      ok: true,
      table: SETTINGS_TABLE,
      count: Number(listed.count ?? listed.rows?.length ?? 0),
      source: cfg?.settingsSource || 'unknown',
      error: ''
    };
  } catch (err) {
    checks.settings = { ok: false, table: SETTINGS_TABLE, count: 0, source: 'unknown', error: err.message };
    errors.push(`settings: ${err.message}`);
  }

  try {
    const listedTexts = listAdminTexts();
    checks.texts = {
      ok: true,
      module: TEXTS_MODULE,
      table: runtimeMessages?._textsTable || texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      legacyTable: runtimeMessages?._legacyTextsTable || texts.DEFAULT_MODULE_TEXTS_TABLE,
      source: runtimeMessages?._textsSource || 'unknown',
      categories: Array.isArray(listedTexts.categories) ? listedTexts.categories.length : Object.keys(TEXT_CATEGORIES).length,
      count: Number(listedTexts.count ?? listedTexts.variantCount ?? 0),
      error: ''
    };
  } catch (err) {
    checks.texts = { ok: false, module: TEXTS_MODULE, table: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE, legacyTable: texts.DEFAULT_MODULE_TEXTS_TABLE, source: 'unknown', categories: 0, count: 0, error: err.message };
    errors.push(`texts: ${err.message}`);
  }

  if (cfg) {
    checks.files = {
      config: fileCheck('config', cfg.configPath),
      messages: fileCheck('messages', cfg.messagesPath)
    };
    for (const check of Object.values(checks.files)) {
      if (!check.ok) warnings.push(`${check.label}_file_missing_or_not_file`);
    }

    checks.webhook = {
      ok: !cfg.useDiscordWebhook || Boolean(cfg.webhookUrl),
      useDiscordWebhook: Boolean(cfg.useDiscordWebhook),
      hasWebhookUrl: Boolean(cfg.webhookUrl),
      webhookUrlEnv: cfg.webhookUrlEnv || '',
      error: ''
    };
    if (!checks.webhook.ok) warnings.push('discord_webhook_enabled_but_missing_url');
  }

  if (status) {
    checks.state = {
      ok: true,
      activeStream: Boolean(status.state?.activeStream),
      currentPageNumber: Number(status.state?.currentPageNumber || 0),
      currentPageDate: status.state?.currentPageDate || null,
      localDateToday: status.state?.localDateToday || localDateString(),
      error: ''
    };
  } else {
    checks.state = { ok: false, activeStream: false, currentPageNumber: 0, currentPageDate: null, localDateToday: localDateString(), error: 'status_unavailable' };
  }

  const healthy = errors.length === 0;

  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    schemaVersion: checks.database?.schemaVersion ?? null,
    healthy,
    warnings,
    errors,
    checks,
    routes: buildTagebuchRoutes().standardEndpoints,
    notes: [
      'Read-only Integration-Check für Dashboard-/Modul-Standardisierung.',
      'Es werden keine DB-, JSON- oder Dateiänderungen vorgenommen.',
      'Warnungen zu fehlender Webhook-URL können je nach Setup normal sein, wenn Discord-Posting deaktiviert ist.'
    ]
  };
}

function sendPlainOrJson(req, res, result, okStatus = 200) {
  if (wantsPlain(req)) {
    return res.status(200).type('text/plain; charset=utf-8').send(result.message || (result.ok ? 'OK' : 'Fehler'));
  }
  return res.status(result.ok ? okStatus : 400).json(result);
}

function registerRoutes(ctx) {
  const app = ctx.app;

  async function handleStreamStart(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(await markStreamStarted(ctx));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: getMessages().startFailed });
    }
  }

  async function handleStreamEnd(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(await markStreamEnded(ctx));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: getMessages().endFailed });
    }
  }

  async function handleTagebuch(req, res) {
    if (!authOk(req)) {
      if (wantsPlain(req)) return res.status(200).type('text/plain; charset=utf-8').send(getMessages().unauthorized);
      return jsonForbidden(res);
    }
    try {
      const result = await postDiaryEntry(ctx, {
        authorDisplay: getInput(req, 'authorDisplay') || getInput(req, 'displayName') || getInput(req, 'userDisplayName'),
        authorLogin: getInput(req, 'authorLogin') || getInput(req, 'user') || getInput(req, 'username') || getInput(req, 'login'),
        message: getInput(req, 'message') || getInput(req, 'text') || getInput(req, 'rawInput'),
        system: ['1', 'true', 'yes', 'ja'].includes(safeString(getInput(req, 'system')).toLowerCase()),
        systemUsername: getInput(req, 'systemUsername') || getInput(req, 'systemUser')
      });

      const status = result.ok ? 200 : (result.error === 'missing_message' || result.error === 'stream_inactive' ? 400 : 500);
      return sendPlainOrJson(req, res, result, status);
    } catch (err) {
      if (wantsPlain(req)) return res.status(200).type('text/plain; charset=utf-8').send(getMessages().entryFailed);
      return res.status(500).json({ ok: false, error: err.message, message: getMessages().entryFailed });
    }
  }

  function handleStatus(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(buildStatus());
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: getMessages().statusFailed });
    }
  }

  function handleConfig(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const cfg = getConfig();
      return res.json({ ok: true, module: MODULE_NAME, config: safePublicConfig(cfg), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Config konnte nicht gelesen werden.' });
    }
  }

  function handleSettings(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json({ ok: true, module: MODULE_NAME, settings: listAdminSettings(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Settings konnten nicht gelesen werden.' });
    }
  }

  function handleRoutes(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(buildTagebuchRoutes());
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Routen konnten nicht gelesen werden.' });
    }
  }

  function handleIntegrationCheck(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(buildTagebuchIntegrationCheck());
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Integration-Check fehlgeschlagen.' });
    }
  }


  function handleStatsTop(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const limit = statsLimit(req);
      const rows = getStatsTop(limit);
      return res.json({ ok: true, version: 2, mode: 'stats_top', limit, users: rows });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Statistik konnte nicht gelesen werden.' });
    }
  }

  function handleStatsToday(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const limit = statsLimit(req);
      const state = getState();
      const pageDate = safeString(getInput(req, 'date')) || state.current_page_date || localDateString();
      const rows = getStatsForDate(pageDate, limit);
      return res.json({ ok: true, version: 2, mode: 'stats_today', pageDate, limit, users: rows });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Tagesstatistik konnte nicht gelesen werden.' });
    }
  }

  function handleStatsUser(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const user = getInput(req, 'user') || getInput(req, 'login') || getInput(req, 'username');
      const stats = getStatsForUser(user);
      if (!stats) return res.status(404).json({ ok: false, error: 'not_found', message: 'Keine Tagebuch-Statistik für diesen User gefunden.' });
      return res.json({ ok: true, version: 2, mode: 'stats_user', user: stats });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Userstatistik konnte nicht gelesen werden.' });
    }
  }

  function handleReset(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(resetState(getInput(req, 'mode'), getInput(req, 'confirm')));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: getMessages().resetFailed });
    }
  }

  function handleReload(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      reloadRuntime();
      return res.json({ ok: true, module: MODULE_NAME, version: 2, message: 'Tagebuch-Config wurde neu geladen.', status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Reload fehlgeschlagen.' });
    }
  }


  function handleAdminSettingsGet(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json({ ok: true, module: MODULE_NAME, settings: listAdminSettings(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Settings konnten nicht gelesen werden.' });
    }
  }

  function handleAdminSettingsPost(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(setAdminSettings(getAdminPayload(req)));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Settings konnten nicht gespeichert werden.' });
    }
  }

  function handleAdminTextsGet(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json({ ok: true, module: MODULE_NAME, texts: listAdminTexts(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Texte konnten nicht gelesen werden.' });
    }
  }

  function handleAdminTextsPost(req, res) {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      return res.json(setAdminTexts(getAdminPayload(req)));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: 'Tagebuch-Texte konnten nicht gespeichert werden.' });
    }
  }

  const streamStartRoutes = ['/discord/stream/start', '/api/tagebuch/stream/start'];
  const streamEndRoutes = ['/discord/stream/end', '/api/tagebuch/stream/end'];
  const entryRoutes = ['/discord/tagebuch', '/api/tagebuch/entry'];
  const statusRoutes = ['/discord/tagebuch/status', '/api/tagebuch/status'];
  const configRoutes = ['/api/tagebuch/config'];
  const settingsRoutes = ['/api/tagebuch/settings'];
  const routesRoutes = ['/api/tagebuch/routes'];
  const integrationCheckRoutes = ['/api/tagebuch/integration-check'];
  const statsTopRoutes = ['/api/tagebuch/stats', '/api/tagebuch/stats/top'];
  const statsTodayRoutes = ['/api/tagebuch/stats/today'];
  const statsUserRoutes = ['/api/tagebuch/stats/user'];
  const resetRoutes = ['/discord/tagebuch/reset', '/api/tagebuch/reset'];
  const reloadRoutes = ['/api/tagebuch/reload'];
  const adminSettingsRoutes = ['/api/tagebuch/admin/settings'];
  const adminTextsRoutes = ['/api/tagebuch/admin/texts'];

  routes.registerPost(app, streamStartRoutes, handleStreamStart);
  routes.registerGet(app, streamStartRoutes, handleStreamStart);
  routes.registerPost(app, streamEndRoutes, handleStreamEnd);
  routes.registerGet(app, streamEndRoutes, handleStreamEnd);
  routes.registerPost(app, entryRoutes, handleTagebuch);
  routes.registerGet(app, entryRoutes, handleTagebuch);
  routes.registerGet(app, statusRoutes, handleStatus);
  routes.registerGet(app, configRoutes, handleConfig);
  routes.registerGet(app, settingsRoutes, handleSettings);
  routes.registerGet(app, routesRoutes, handleRoutes);
  routes.registerGet(app, integrationCheckRoutes, handleIntegrationCheck);
  routes.registerGet(app, statsTopRoutes, handleStatsTop);
  routes.registerGet(app, statsTodayRoutes, handleStatsToday);
  routes.registerGet(app, statsUserRoutes, handleStatsUser);
  routes.registerPost(app, resetRoutes, handleReset);
  routes.registerGet(app, resetRoutes, handleReset);
  routes.registerPost(app, reloadRoutes, handleReload);
  routes.registerGet(app, reloadRoutes, handleReload);
  routes.registerGet(app, adminSettingsRoutes, handleAdminSettingsGet);
  routes.registerPost(app, adminSettingsRoutes, handleAdminSettingsPost);
  routes.registerGet(app, adminTextsRoutes, handleAdminTextsGet);
  routes.registerPost(app, adminTextsRoutes, handleAdminTextsPost);
}

function init(ctx) {
  database.ensureReady(ctx);
  loadRuntimeConfig();
  loadRuntimeMessages();
  ensureSchema();
  registerRoutes(ctx);
  console.log('[tagebuch] ready');
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  buildStatus,
  reloadRuntime,
  listAdminSettings,
  listAdminTexts
};
