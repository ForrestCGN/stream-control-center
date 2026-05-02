'use strict';

const fs = require('fs');
const path = require('path');
const sqlite = require(path.join(__dirname, 'sqlite_core.js'));
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const config = require('./helpers/helper_config');

const MODULE_NAME = 'tagebuch';
const SCHEMA_VERSION = 5;

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
  const merged = deepMerge(DEFAULT_CONFIG, fromFile);

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
  runtimeMessages = deepMerge(DEFAULT_MESSAGES, fromFile);

  if (safeString(process.env.DISCORD_DIARY_EMPTY_END_NOTICE)) runtimeMessages.emptyEndNotice = process.env.DISCORD_DIARY_EMPTY_END_NOTICE;
  if (safeString(process.env.DISCORD_DIARY_USAGE_NOTICE)) runtimeMessages.usageNotice = process.env.DISCORD_DIARY_USAGE_NOTICE;

  return runtimeMessages;
}

function getConfig() {
  return runtimeConfig || loadRuntimeConfig();
}

function getMessages() {
  return runtimeMessages || loadRuntimeMessages();
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
  sqlite.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_from, toVersion, db) => {
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

      db.prepare(`
        INSERT OR IGNORE INTO tagebuch_state (
          id, current_page_number, current_page_date, last_stream_started_at,
          last_stream_ended_at, active_stream, has_entries_for_current_date,
          end_notice_posted_for_current_date, updated_at
        ) VALUES (1, 0, NULL, NULL, NULL, 0, 0, 0, :updatedAt)
      `).run({ updatedAt: nowIso() });
    }

    if (toVersion === 2) {
      const cols = db.prepare(`PRAGMA table_info(tagebuch_state)`).all();
      const names = new Set(cols.map(c => c.name));
      if (!names.has('current_page_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN current_page_date TEXT;`);
      if (!names.has('last_stream_started_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN last_stream_started_at TEXT;`);
      if (!names.has('last_stream_ended_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN last_stream_ended_at TEXT;`);
      if (!names.has('active_stream')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN active_stream INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('has_entries_for_current_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN has_entries_for_current_date INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('end_notice_posted_for_current_date')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN end_notice_posted_for_current_date INTEGER NOT NULL DEFAULT 0;`);
      if (!names.has('updated_at')) db.exec(`ALTER TABLE tagebuch_state ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';`);
    }

    if (toVersion === 3) {
      const cols = db.prepare(`PRAGMA table_info(tagebuch_state)`).all();
      const names = new Set(cols.map(c => c.name));
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          page_number INTEGER,
          page_date TEXT,
          actor_login TEXT,
          actor_display TEXT,
          system INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);
      db.prepare(`
        INSERT OR IGNORE INTO tagebuch_state (
          id, current_page_number, current_page_date, last_stream_started_at,
          last_stream_ended_at, active_stream, has_entries_for_current_date,
          end_notice_posted_for_current_date, updated_at
        ) VALUES (1, 0, NULL, NULL, NULL, 0, 0, 0, :updatedAt)
      `).run({ updatedAt: nowIso() });
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
  return sqlite.get(`SELECT * FROM tagebuch_state WHERE id = 1`) || {
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
  sqlite.run(
    `
      INSERT INTO tagebuch_state (
        id, current_page_number, current_page_date, last_stream_started_at,
        last_stream_ended_at, active_stream, has_entries_for_current_date,
        end_notice_posted_for_current_date, updated_at
      ) VALUES (
        1, :current_page_number, :current_page_date, :last_stream_started_at,
        :last_stream_ended_at, :active_stream, :has_entries_for_current_date,
        :end_notice_posted_for_current_date, :updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        current_page_number = excluded.current_page_number,
        current_page_date = excluded.current_page_date,
        last_stream_started_at = excluded.last_stream_started_at,
        last_stream_ended_at = excluded.last_stream_ended_at,
        active_stream = excluded.active_stream,
        has_entries_for_current_date = excluded.has_entries_for_current_date,
        end_notice_posted_for_current_date = excluded.end_notice_posted_for_current_date,
        updated_at = excluded.updated_at
    `,
    {
      current_page_number: Number(next.current_page_number || 0),
      current_page_date: next.current_page_date || null,
      last_stream_started_at: next.last_stream_started_at || null,
      last_stream_ended_at: next.last_stream_ended_at || null,
      active_stream: next.active_stream ? 1 : 0,
      has_entries_for_current_date: next.has_entries_for_current_date ? 1 : 0,
      end_notice_posted_for_current_date: next.end_notice_posted_for_current_date ? 1 : 0,
      updated_at: nowIso(),
    }
  );
}

function logRuntimeEvent(type, data = {}) {
  try {
    sqlite.run(
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

  sqlite.run(
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

  sqlite.run(
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
  return sqlite.all(
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
  return sqlite.all(
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

  const row = sqlite.get(
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

  if (cfg.requireActiveStreamForEntries && !state.active_stream) {
    return {
      ok: false,
      error: 'stream_inactive',
      message: getMessages().streamInactive,
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
  return {
    currentPageNumber: Number(state.current_page_number || 0),
    currentPageDate: state.current_page_date,
    nextPageNumberIfNewDate: nextPageNumberIfNewDate(state),
    localDateToday: localDateString(),
    lastStreamStartedAt: state.last_stream_started_at,
    lastStreamEndedAt: state.last_stream_ended_at,
    activeStream: Boolean(state.active_stream),
    hasEntriesForCurrentDate: Boolean(state.has_entries_for_current_date),
    endNoticePostedForCurrentDate: Boolean(state.end_notice_posted_for_current_date),
    updatedAt: state.updated_at
  };
}

function buildStatus() {
  const cfg = getConfig();
  const state = getState();
  return {
    ok: true,
    module: 'tagebuch',
    version: 2,
    schemaVersion: sqlite.getSchemaVersion(MODULE_NAME),
    databasePath: typeof sqlite.getDbPath === 'function' ? sqlite.getDbPath() : null,
    configPath: cfg.configPath,
    messagesPath: cfg.messagesPath,
    config: {
      enabled: Boolean(cfg.enabled),
      requireActiveStreamForEntries: Boolean(cfg.requireActiveStreamForEntries),
      postPageHeader: Boolean(cfg.postPageHeader),
      useDiscordWebhook: Boolean(cfg.useDiscordWebhook),
      hasWebhookUrl: Boolean(cfg.webhookUrl),
      userinfoBaseUrl: cfg.userinfoBaseUrl,
      resetAllowHardReset: Boolean(cfg.reset?.allowHardReset),
      statsEnabled: Boolean(cfg.stats?.enabled),
      statsCountSystemEntries: Boolean(cfg.stats?.countSystemEntries),
    },
    state: publicState(state),
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

  const streamStartRoutes = ['/discord/stream/start', '/api/tagebuch/stream/start'];
  const streamEndRoutes = ['/discord/stream/end', '/api/tagebuch/stream/end'];
  const entryRoutes = ['/discord/tagebuch', '/api/tagebuch/entry'];
  const statusRoutes = ['/discord/tagebuch/status', '/api/tagebuch/status'];
  const statsTopRoutes = ['/api/tagebuch/stats', '/api/tagebuch/stats/top'];
  const statsTodayRoutes = ['/api/tagebuch/stats/today'];
  const statsUserRoutes = ['/api/tagebuch/stats/user'];
  const resetRoutes = ['/discord/tagebuch/reset', '/api/tagebuch/reset'];
  const reloadRoutes = ['/api/tagebuch/reload'];

  routes.registerPost(app, streamStartRoutes, handleStreamStart);
  routes.registerGet(app, streamStartRoutes, handleStreamStart);
  routes.registerPost(app, streamEndRoutes, handleStreamEnd);
  routes.registerGet(app, streamEndRoutes, handleStreamEnd);
  routes.registerPost(app, entryRoutes, handleTagebuch);
  routes.registerGet(app, entryRoutes, handleTagebuch);
  routes.registerGet(app, statusRoutes, handleStatus);
  routes.registerGet(app, statsTopRoutes, handleStatsTop);
  routes.registerGet(app, statsTodayRoutes, handleStatsToday);
  routes.registerGet(app, statsUserRoutes, handleStatsUser);
  routes.registerPost(app, resetRoutes, handleReset);
  routes.registerGet(app, resetRoutes, handleReset);
  routes.registerPost(app, reloadRoutes, handleReload);
  routes.registerGet(app, reloadRoutes, handleReload);
}

function init(ctx) {
  loadRuntimeConfig();
  loadRuntimeMessages();
  ensureSchema();
  registerRoutes(ctx);
  console.log('[tagebuch] ready');
}

module.exports = {
  init,
  buildStatus,
  reloadRuntime
};
