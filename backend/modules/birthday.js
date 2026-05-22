'use strict';

const http = require('http');
const database = require('../core/database');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const config = require('./helpers/helper_config');
const settings = require('./helpers/helper_settings');
const texts = require('./helpers/helper_texts');
const chatOutput = require('./helpers/helper_chat_output');
const commands = require('./commands');

const MODULE_NAME = 'birthday';
const SCHEMA_VERSION = 1;
const SETTINGS_TABLE = 'birthday_settings';
const TEXTS_MODULE = 'birthday';
const API_PREFIX = '/api/birthday';

const DEFAULT_CONFIG = {
  enabled: true,
  timezone: 'Europe/Berlin',
  command: {
    enabled: true,
    trigger: 'birthday',
    aliases: ['bday'],
    permissionLevel: 'everyone',
    cooldownGlobalMs: 1000,
    cooldownUserMs: 5000
  },
  registration: {
    enabled: true,
    allowYear: true,
    storeYear: true
  },
  automaticGreeting: {
    enabled: true,
    skipCommandMessages: true,
    oncePerLocalDate: true,
    onlyWhenLive: true,
    writeDiaryEntry: true
  },
  diary: {
    enabled: true,
    systemUsername: 'Geburtstags-System'
  },
  chat: {
    prefer: 'bot',
    maxLength: 450,
    directSendEnabled: true,
    fallbackToStreamerbot: true
  }
};

const DEFAULT_MESSAGES = {
  usage: [
    'Nutzung: !birthday set TT.MM, !birthday show oder !birthday delete.',
    '🎂 Heimleitungs-Hinweis: !birthday set TT.MM speichert deinen Geburtstag. Mit Jahr geht auch: !birthday set TT.MM.JJJJ'
  ],
  register_success: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} gespeichert.',
    '💜 @{displayName}, notiert: {birthdayDate}. Die Heimleitung legt schon mal Kuchenakten an.'
  ],
  register_success_with_year: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} gespeichert.',
    '💜 @{displayName}, notiert: {birthdayDate}. Wenn der Tag kommt, zählen wir offiziell mit. Heimleitungs-Ehrenwort.'
  ],
  register_updated: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} aktualisiert.',
    '📝 @{displayName}, Geburtstag aktualisiert: {birthdayDate}. Die Heimleitung hat den Zettel neu laminiert.'
  ],
  register_updated_with_year: [
    '🎂 @{displayName}, dein Geburtstag wurde auf den {birthdayDate} aktualisiert.',
    '📝 @{displayName}, Geburtstag inklusive Baujahr aktualisiert: {birthdayDate}. Die Heimleitung hat es ordnungsgemäß eingetragen.'
  ],
  show_own_birthday: [
    '🎂 @{displayName}, gespeichert ist: {birthdayDate}.',
    '📋 @{displayName}, laut Heimleitungsakte steht bei dir: {birthdayDate}.'
  ],
  show_own_birthday_with_year: [
    '🎂 @{displayName}, gespeichert ist: {birthdayDate}. Aktuell wären das {age} Jahre.',
    '📋 @{displayName}, laut Heimleitungsakte steht bei dir: {birthdayDate}. Aktueller Rentner-Level: {age}.'
  ],
  show_missing: [
    '🎂 @{displayName}, für dich ist noch kein Geburtstag gespeichert. Nutze: !birthday set TT.MM'
  ],
  delete_success: [
    '🎂 @{displayName}, dein Geburtstag wurde gelöscht.',
    '🗑️ @{displayName}, dein Geburtstag wurde aus der Heimleitungsakte entfernt.'
  ],
  delete_missing: [
    '🎂 @{displayName}, für dich war kein Geburtstag gespeichert.'
  ],
  invalid_date: [
    '🎂 @{displayName}, das Datum passt nicht. Nutze z. B. !birthday set 22.05 oder !birthday set 22.05.1980',
    '📋 @{displayName}, die Heimleitung versteht nur TT.MM oder TT.MM.JJJJ. Beispiel: !birthday set 22.05'
  ],
  registration_disabled: [
    '🎂 Geburtstags-Registrierung ist aktuell deaktiviert.'
  ],
  birthday_greeting_chat: [
    '🎉 Alles Gute zum Geburtstag, @{displayName}! Schön, dass du heute mit uns feierst! 🎂',
    '🎂 Happy Birthday, @{displayName}! Lass dich feiern! 🎉',
    '💜 Alles Gute, @{displayName}! Die Heimleitung wünscht Kuchen, Konfetti und stabile Hüften. 🎂',
    '🎉 @{displayName} hat Geburtstag! Heute wird gefeiert, bis die Heimaufsicht das Licht ausmacht. 💜'
  ],
  birthday_greeting_chat_with_age: [
    '🎉 Happy Birthday, @{displayName}! Alles Gute zum {age}. Geburtstag! 🎂',
    '🎂 @{displayName}, alles Gute zum {age}. Geburtstag! Die Heimleitung hat den Kuchen freigegeben. 💜',
    '🎉 Alles Gute zum {age}. Geburtstag, @{displayName}! Rollator geölt, Kuchen bereit, Party genehmigt. 🎂',
    '💜 @{displayName} wird heute {age}! Die Heimaufsicht gratuliert offiziell und stellt eine Extraportion Kuchen aus. 🎉',
    '🎂 Happy Birthday @{displayName}! {age} Jahre jung – im Altersheim zählt das noch als Early Access. 💜'
  ],
  birthday_diary_entry: [
    '🎂 @{displayName} hatte heute Geburtstag und wurde im Chat beglückwünscht.',
    '🎂 Geburtstagsnotiz: @{displayName} wurde heute im Chat gefeiert.'
  ],
  birthday_diary_entry_with_age: [
    '🎂 @{displayName} hatte heute den {age}. Geburtstag und wurde im Chat beglückwünscht.',
    '🎂 Geburtstagsnotiz: @{displayName} wurde heute {age} und bekam eine offizielle Heimleitungs-Gratulation.'
  ],
  today_none: [
    '🎂 Heute sind keine registrierten Geburtstage gespeichert.'
  ],
  today_list: [
    '🎂 Heute Geburtstag: {names}',
    '📋 Heimleitungs-Geburtstagsliste für heute: {names}'
  ],
  already_greeted: [
    '🎂 @{displayName} wurde heute bereits beglückwünscht.'
  ],
  command_disabled: [
    '🎂 Das Birthday-Modul ist aktuell deaktiviert.'
  ]
};

const TEXT_CATEGORY_LABELS = {
  chat: 'Chat-Antworten',
  diary: 'Tagebuch',
  errors: 'Fehlertexte',
  system: 'System'
};

const TEXT_CATEGORIES = {
  usage: 'chat',
  register_success: 'chat',
  register_success_with_year: 'chat',
  register_updated: 'chat',
  register_updated_with_year: 'chat',
  show_own_birthday: 'chat',
  show_own_birthday_with_year: 'chat',
  show_missing: 'chat',
  delete_success: 'chat',
  delete_missing: 'chat',
  birthday_greeting_chat: 'chat',
  birthday_greeting_chat_with_age: 'chat',
  today_none: 'chat',
  today_list: 'chat',
  already_greeted: 'chat',
  birthday_diary_entry: 'diary',
  birthday_diary_entry_with_age: 'diary',
  invalid_date: 'errors',
  registration_disabled: 'errors',
  command_disabled: 'system'
};

const state = {
  initialized: false,
  loadedAt: '',
  schemaOk: false,
  schemaError: '',
  configPath: '',
  commandSeeded: false,
  chatHookInstalled: false,
  automaticChecks: 0,
  automaticGreetings: 0,
  commandExecutions: 0,
  lastAutomaticCheckAt: '',
  lastGreetingAt: '',
  lastCommandAt: '',
  lastError: ''
};

let runtimeConfig = null;
let runtimeMessages = null;
let originalCommandHook = null;

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
}

function cleanLogin(value) {
  return clean(value).replace(/^@/, '').toLowerCase();
}

function boolValue(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(text)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(text)) return false;
  return fallback;
}

function intValue(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
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
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenSettingsObject(value, fullKey));
    } else {
      result.push({ key: fullKey, value, valueType: settings.normalizeValueType('', value), description: '' });
    }
  }
  return result;
}

function setNestedValue(target, dottedKey, value) {
  const parts = clean(dottedKey).split('.').map(part => part.trim()).filter(Boolean);
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

function readJsonIfExists(filePath, fallback) {
  try {
    const fs = require('fs');
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[birthday] config read failed: ${err.message}`);
    return fallback;
  }
}

function writeJsonIfMissing(filePath, data) {
  try {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(filePath)) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.warn(`[birthday] default config write failed: ${err.message}`);
  }
}

function configPath() {
  return config.resolveFromConfig('birthday.json');
}

function applyDbSettings(baseConfig) {
  const merged = deepMerge({}, baseConfig || {});
  try {
    settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(baseConfig || {}));
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) setNestedValue(merged, row.key, row.value);
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'database_with_json_fallback';
    return merged;
  } catch (err) {
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = 'json_fallback';
    merged.settingsError = err.message || String(err);
    return merged;
  }
}

function loadRuntimeConfig() {
  const file = configPath();
  writeJsonIfMissing(file, DEFAULT_CONFIG);
  const fromFile = readJsonIfExists(file, {});
  runtimeConfig = applyDbSettings(deepMerge(DEFAULT_CONFIG, fromFile));
  runtimeConfig.configPath = file;
  state.configPath = file;
  return runtimeConfig;
}

function textEditorOptions() {
  return {
    categories: TEXT_CATEGORIES,
    categoryLabels: TEXT_CATEGORY_LABELS,
    defaultCategory: 'chat'
  };
}

function loadRuntimeMessages() {
  try {
    const result = texts.getModuleTexts(TEXTS_MODULE, DEFAULT_MESSAGES, { ...textEditorOptions(), seed: true });
    runtimeMessages = {
      ...result.texts,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: result.table,
      _textsSource: 'database_variants_with_defaults'
    };
  } catch (err) {
    runtimeMessages = {
      ...DEFAULT_MESSAGES,
      _textsSource: 'defaults_only',
      _textsError: err.message || String(err)
    };
  }
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

function renderText(key, context = {}) {
  try {
    return texts.renderModuleText(TEXTS_MODULE, key, getMessages(), context, { ...textEditorOptions(), seed: false });
  } catch (_) {
    const fallback = getMessages()[key];
    const template = Array.isArray(fallback) ? fallback[0] : String(fallback || '');
    return texts.renderTemplate(template, context);
  }
}

function localParts(date = new Date()) {
  const cfg = getConfig();
  const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: cfg.timezone || 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date).reduce((out, part) => {
    if (part.type !== 'literal') out[part.type] = part.value;
    return out;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    date: `${parts.year}-${parts.month}-${parts.day}`
  };
}

function formatBirthday(day, month, year = null) {
  const d = String(Number(day || 0)).padStart(2, '0');
  const m = String(Number(month || 0)).padStart(2, '0');
  const y = year ? `.${year}` : '';
  return `${d}.${m}${y}`;
}

function calculateAgeForDate(day, month, year, parts = localParts()) {
  const birthYear = Number(year || 0);
  if (!birthYear) return null;
  let age = Number(parts.year || 0) - birthYear;
  if (Number(parts.month || 0) < Number(month || 0) || (Number(parts.month || 0) === Number(month || 0) && Number(parts.day || 0) < Number(day || 0))) {
    age -= 1;
  }
  return Number.isFinite(age) && age >= 0 ? age : null;
}

function buildBirthdayContext(user = {}, extra = {}, parts = localParts()) {
  const day = Number(user.day ?? user.birthday_day ?? 0);
  const month = Number(user.month ?? user.birthday_month ?? 0);
  const storedYear = Number(user.year ?? user.birthday_year ?? 0);
  const hasYear = Boolean(storedYear);
  const age = hasYear ? calculateAgeForDate(day, month, storedYear, parts) : null;
  const hasAge = Number.isFinite(age);
  const birthdayDate = user.birthdayDate || formatBirthday(day, month, storedYear || null);

  return {
    ...extra,
    login: cleanLogin(extra.login || user.login || user.user_login || ''),
    username: cleanLogin(extra.username || extra.login || user.login || user.user_login || ''),
    displayName: clean(extra.displayName || user.displayName || user.user_display_name || user.login || user.user_login || ''),
    birthdayDate,
    day: String(day || ''),
    month: String(month || ''),
    year: hasYear ? String(storedYear) : '',
    hasYear: hasYear ? '1' : '0',
    age: hasAge ? String(age) : '',
    ageText: hasAge ? `Alles Gute zum ${age}. Geburtstag!` : '',
    localDate: parts.date || ''
  };
}

function textKeyWithAge(baseKey, context = {}) {
  return context.age ? `${baseKey}_with_age` : baseKey;
}

function parseBirthdayDate(input) {
  const raw = clean(input).replace(/\//g, '.').replace(/-/g, '.');
  const match = raw.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = match[3] ? Number(match[3]) : null;
  if (year && year < 100) year += year >= 30 ? 1900 : 2000;
  if (month < 1 || month > 12) return null;
  const maxDay = new Date(year || 2024, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;
  if (year && (year < 1900 || year > localParts().year)) return null;
  return { day, month, year };
}

function ensureSchema() {
  try {
    database.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_from, toVersion, db) => {
      if (toVersion === 1) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS birthday_users (
            user_login TEXT PRIMARY KEY,
            user_display_name TEXT NOT NULL DEFAULT '',
            birthday_day INTEGER NOT NULL,
            birthday_month INTEGER NOT NULL,
            birthday_year INTEGER,
            year_visible INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1,
            source TEXT NOT NULL DEFAULT 'chat_command',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_birthday_users_date
            ON birthday_users(birthday_month, birthday_day, active);

          CREATE TABLE IF NOT EXISTS birthday_greetings_log (
            id ${database.primaryKeyAutoIncrementSql()},
            user_login TEXT NOT NULL DEFAULT '',
            user_display_name TEXT NOT NULL DEFAULT '',
            greeting_date TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT 'auto_chat',
            chat_sent INTEGER NOT NULL DEFAULT 0,
            diary_sent INTEGER NOT NULL DEFAULT 0,
            message TEXT NOT NULL DEFAULT '',
            error TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
          );

          CREATE UNIQUE INDEX IF NOT EXISTS idx_birthday_greetings_once
            ON birthday_greetings_log(user_login, greeting_date, source);
        `);
      }
    });
    state.schemaOk = true;
    state.schemaError = '';
    return true;
  } catch (err) {
    state.schemaOk = false;
    state.schemaError = err.message || String(err);
    state.lastError = state.schemaError;
    return false;
  }
}

function mapBirthdayUser(row) {
  if (!row) return null;
  return {
    login: row.user_login || '',
    displayName: row.user_display_name || row.user_login || '',
    day: Number(row.birthday_day || 0),
    month: Number(row.birthday_month || 0),
    year: row.birthday_year == null ? null : Number(row.birthday_year || 0),
    yearVisible: Number(row.year_visible || 0) === 1,
    active: Number(row.active || 0) === 1,
    source: row.source || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    birthdayDate: formatBirthday(row.birthday_day, row.birthday_month, row.year_visible ? row.birthday_year : null)
  };
}

function getBirthdayUser(login) {
  const userLogin = cleanLogin(login);
  if (!userLogin) return null;
  return mapBirthdayUser(database.get('SELECT * FROM birthday_users WHERE user_login = :login', { login: userLogin }));
}

function upsertBirthdayUser({ login, displayName, day, month, year = null, source = 'chat_command' }) {
  const userLogin = cleanLogin(login);
  if (!userLogin) throw new Error('user_login_required');
  const cfg = getConfig();
  const existing = getBirthdayUser(userLogin);
  const now = nowIso();
  const allowYear = cfg.registration?.allowYear !== false;
  const storeYear = cfg.registration?.storeYear !== false;
  const safeYear = allowYear && storeYear && year ? Number(year) : null;
  const yearVisible = safeYear ? 1 : 0;
  database.run(`
    INSERT INTO birthday_users (
      user_login, user_display_name, birthday_day, birthday_month, birthday_year,
      year_visible, active, source, created_at, updated_at
    ) VALUES (
      :login, :displayName, :day, :month, :year,
      :yearVisible, 1, :source, :createdAt, :updatedAt
    )
    ON CONFLICT(user_login) DO UPDATE SET
      user_display_name = excluded.user_display_name,
      birthday_day = excluded.birthday_day,
      birthday_month = excluded.birthday_month,
      birthday_year = excluded.birthday_year,
      year_visible = excluded.year_visible,
      active = 1,
      source = excluded.source,
      updated_at = excluded.updated_at
  `, {
    login: userLogin,
    displayName: clean(displayName) || userLogin,
    day: Number(day),
    month: Number(month),
    year: safeYear,
    yearVisible,
    source,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  });
  return { user: getBirthdayUser(userLogin), created: !existing };
}

function deleteBirthdayUser(login) {
  const userLogin = cleanLogin(login);
  const existing = getBirthdayUser(userLogin);
  if (!existing) return { deleted: false, user: null };
  database.run('DELETE FROM birthday_users WHERE user_login = :login', { login: userLogin });
  return { deleted: true, user: existing };
}

function listBirthdaysFor(day, month) {
  return database.all(`
    SELECT * FROM birthday_users
    WHERE birthday_day = :day AND birthday_month = :month AND active = 1
    ORDER BY user_display_name COLLATE NOCASE ASC, user_login ASC
  `, { day: Number(day), month: Number(month) }).map(mapBirthdayUser);
}

function hasGreetingLog(login, greetingDate, source = 'auto_chat') {
  const row = database.get(`
    SELECT id FROM birthday_greetings_log
    WHERE user_login = :login AND greeting_date = :greetingDate AND source = :source
    LIMIT 1
  `, { login: cleanLogin(login), greetingDate, source });
  return !!row;
}

function insertGreetingLog({ login, displayName, greetingDate, source = 'auto_chat', chatSent = false, diarySent = false, message = '', error = '' }) {
  try {
    database.run(`
      INSERT OR IGNORE INTO birthday_greetings_log (
        user_login, user_display_name, greeting_date, source, chat_sent, diary_sent, message, error, created_at
      ) VALUES (
        :login, :displayName, :greetingDate, :source, :chatSent, :diarySent, :message, :error, :createdAt
      )
    `, {
      login: cleanLogin(login),
      displayName: clean(displayName),
      greetingDate,
      source,
      chatSent: chatSent ? 1 : 0,
      diarySent: diarySent ? 1 : 0,
      message: clean(message),
      error: clean(error),
      createdAt: nowIso()
    });
  } catch (err) {
    state.lastError = err.message || String(err);
  }
}

function internalRequest(method, pathName, payload = {}) {
  const body = JSON.stringify(payload || {});
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: Number(process.env.PORT || 8080) || 8080,
      path: pathName,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) { parsed = { raw: data }; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: parsed });
      });
    });
    req.on('error', err => resolve({ ok: false, error: err.message || String(err) }));
    req.write(body);
    req.end();
  });
}

async function isLiveByTagebuchState() {
  const result = await internalRequest('GET', '/api/tagebuch/status', {});
  if (!result.ok) return false;
  return !!result.data?.state?.activeStream;
}

async function writeDiaryEntry(user, context = {}) {
  const cfg = getConfig();
  if (cfg.diary?.enabled === false || cfg.automaticGreeting?.writeDiaryEntry === false) {
    return { ok: true, skipped: true, reason: 'diary_disabled' };
  }
  const message = renderText(textKeyWithAge('birthday_diary_entry', context), context);
  if (!message) return { ok: true, skipped: true, reason: 'empty_diary_message' };
  return internalRequest('POST', '/api/tagebuch/entry', {
    authorDisplay: cfg.diary?.systemUsername || 'Geburtstags-System',
    authorLogin: 'birthday',
    message,
    system: true,
    systemUsername: cfg.diary?.systemUsername || 'Geburtstags-System'
  });
}

async function sendChat(message, reason = 'birthday') {
  return chatOutput.sendChatMessage(message, {
    source: MODULE_NAME,
    reason,
    prefer: getConfig().chat?.prefer,
    maxLength: getConfig().chat?.maxLength,
    directSendEnabled: getConfig().chat?.directSendEnabled,
    fallbackToStreamerbot: getConfig().chat?.fallbackToStreamerbot
  });
}

async function maybeAutoGreetFromChat(parsed = {}) {
  try {
    const cfg = getConfig();
    if (cfg.enabled === false || cfg.automaticGreeting?.enabled === false) return { ok: true, skipped: true, reason: 'disabled' };
    if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, skipped: true, reason: 'not_privmsg' };

    const rawMessage = clean(parsed.params?.[1] || parsed.params?.[parsed.params.length - 1] || '');
    if (cfg.automaticGreeting?.skipCommandMessages !== false && rawMessage.startsWith('!')) {
      return { ok: true, skipped: true, reason: 'command_message' };
    }

    const login = cleanLogin(parsed.login || parsed.tags?.login || '');
    if (!login || login === cleanLogin(process.env.TWITCH_BOT_USERNAME || '')) return { ok: true, skipped: true, reason: 'bot_or_missing_user' };

    state.automaticChecks += 1;
    state.lastAutomaticCheckAt = nowIso();

    const today = localParts();
    const user = getBirthdayUser(login);
    if (!user || !user.active) return { ok: true, skipped: true, reason: 'not_registered' };
    if (user.day !== today.day || user.month !== today.month) return { ok: true, skipped: true, reason: 'not_today' };

    if (cfg.automaticGreeting?.onlyWhenLive !== false) {
      const live = await isLiveByTagebuchState();
      if (!live) return { ok: true, skipped: true, reason: 'stream_not_active' };
    }

    if (cfg.automaticGreeting?.oncePerLocalDate !== false && hasGreetingLog(login, today.date, 'auto_chat')) {
      return { ok: true, skipped: true, reason: 'already_greeted' };
    }

    const displayName = clean(parsed.displayName || parsed.tags?.['display-name'] || user.displayName || login);
    const context = buildBirthdayContext(user, { login, username: login, displayName }, today);
    const message = renderText(textKeyWithAge('birthday_greeting_chat', context), context);
    const chatResult = await sendChat(message, 'birthday_auto_greeting');
    const diaryResult = await writeDiaryEntry(user, context);
    const diarySent = !!(diaryResult?.ok && !diaryResult?.data?.skipped && !diaryResult?.skipped);

    insertGreetingLog({
      login,
      displayName,
      greetingDate: today.date,
      source: 'auto_chat',
      chatSent: !!chatResult?.ok,
      diarySent,
      message,
      error: chatResult?.ok ? '' : (chatResult?.error || 'chat_send_failed')
    });

    state.automaticGreetings += 1;
    state.lastGreetingAt = nowIso();
    return { ok: true, greeted: true, login, displayName, chatResult, diaryResult };
  } catch (err) {
    state.lastError = err.message || String(err);
    return { ok: false, error: state.lastError };
  }
}

function installChatActivityHook() {
  if (state.chatHookInstalled) return true;
  if (!commands || typeof commands.handleChatMessage !== 'function') return false;
  originalCommandHook = commands.handleChatMessage;
  commands.handleChatMessage = async function birthdayWrappedHandleChatMessage(parsed, source = {}) {
    const result = await originalCommandHook(parsed, source);
    maybeAutoGreetFromChat(parsed).catch(err => {
      state.lastError = err.message || String(err);
      console.warn('[birthday] auto greeting check failed:', state.lastError);
    });
    return result;
  };
  state.chatHookInstalled = true;
  return true;
}

function seedBirthdayCommand() {
  if (state.commandSeeded) return true;
  try {
    if (typeof commands.getStatus === 'function') commands.getStatus();
    const cfg = getConfig();
    const trigger = clean(cfg.command?.trigger || 'birthday').replace(/^[!./]+/, '').toLowerCase() || 'birthday';
    const existing = database.get('SELECT id FROM command_definitions WHERE trigger = :trigger', { trigger });
    if (!existing?.id) {
      const now = nowIso();
      database.run(`
        INSERT INTO command_definitions (
          trigger, aliases_json, module_key, action_key, target_method, target_url,
          enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
          response_mode, config_json, created_at, updated_at
        ) VALUES (
          :trigger, :aliasesJson, 'birthday', 'command', 'POST', '/api/birthday/command',
          :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, 0,
          'module', :configJson, :createdAt, :updatedAt
        )
      `, {
        trigger,
        aliasesJson: JSON.stringify(Array.isArray(cfg.command?.aliases) ? cfg.command.aliases : ['bday']),
        enabled: cfg.command?.enabled === false ? 0 : 1,
        permissionLevel: clean(cfg.command?.permissionLevel || 'everyone').toLowerCase() || 'everyone',
        cooldownGlobalMs: Math.max(0, Number(cfg.command?.cooldownGlobalMs || 1000)),
        cooldownUserMs: Math.max(0, Number(cfg.command?.cooldownUserMs || 5000)),
        configJson: JSON.stringify({ actionType: 'module_command', moduleCommand: 'birthday', seededBy: 'STEP_BIRTHDAY_002A' }),
        createdAt: now,
        updatedAt: now
      });
    }
    state.commandSeeded = true;
    return true;
  } catch (err) {
    state.lastError = err.message || String(err);
    return false;
  }
}

function commandContext(payload = {}) {
  const login = cleanLogin(payload.userLogin || payload.login || payload.user || '');
  const displayName = clean(payload.userDisplayName || payload.displayName || payload.userName || payload.user || login);
  return { login, displayName: displayName || login };
}

async function handleBirthdayCommand(payload = {}) {
  ensureSchema();
  const cfg = getConfig();
  state.commandExecutions += 1;
  state.lastCommandAt = nowIso();
  if (cfg.enabled === false || cfg.command?.enabled === false) {
    const user = commandContext(payload);
    const message = renderText('command_disabled', user);
    return { ok: false, command: 'birthday', error: 'disabled', message, chat: await sendChat(message, 'birthday_command_disabled') };
  }

  const args = Array.isArray(payload.args) ? payload.args.map(clean).filter(Boolean) : [];
  const sub = clean(args[0] || '').toLowerCase();
  const user = commandContext(payload);
  const baseContext = { ...user, username: user.login };

  if (!sub || ['help', 'hilfe'].includes(sub)) {
    const message = renderText('usage', baseContext);
    return { ok: true, command: 'birthday', action: 'usage', message, chat: await sendChat(message, 'birthday_usage') };
  }

  if (['set', 'eintragen', 'register'].includes(sub)) {
    if (cfg.registration?.enabled === false) {
      const message = renderText('registration_disabled', baseContext);
      return { ok: false, command: 'birthday', action: 'set', error: 'registration_disabled', message, chat: await sendChat(message, 'birthday_registration_disabled') };
    }
    const parsedDate = parseBirthdayDate(args[1] || '');
    if (!parsedDate) {
      const message = renderText('invalid_date', baseContext);
      return { ok: false, command: 'birthday', action: 'set', error: 'invalid_date', message, chat: await sendChat(message, 'birthday_invalid_date') };
    }
    const result = upsertBirthdayUser({ login: user.login, displayName: user.displayName, ...parsedDate });
    const context = buildBirthdayContext(result.user, baseContext);
    const baseKey = result.created ? 'register_success' : 'register_updated';
    const key = result.user.year ? `${baseKey}_with_year` : baseKey;
    const message = renderText(key, context);
    return { ok: true, command: 'birthday', action: 'set', created: result.created, user: result.user, message, chat: await sendChat(message, 'birthday_set') };
  }

  if (['show', 'anzeigen'].includes(sub)) {
    const saved = getBirthdayUser(user.login);
    const context = saved ? buildBirthdayContext(saved, baseContext) : baseContext;
    const key = saved ? (saved.year ? 'show_own_birthday_with_year' : 'show_own_birthday') : 'show_missing';
    const message = renderText(key, context);
    return { ok: true, command: 'birthday', action: 'show', user: saved, message, chat: await sendChat(message, 'birthday_show') };
  }

  if (['delete', 'del', 'remove', 'löschen', 'loeschen'].includes(sub)) {
    const result = deleteBirthdayUser(user.login);
    const key = result.deleted ? 'delete_success' : 'delete_missing';
    const message = renderText(key, baseContext);
    return { ok: true, command: 'birthday', action: 'delete', deleted: result.deleted, message, chat: await sendChat(message, 'birthday_delete') };
  }

  if (['today', 'heute'].includes(sub)) {
    const today = localParts();
    const rows = listBirthdaysFor(today.day, today.month);
    const names = rows.map(row => {
      const context = buildBirthdayContext(row, {}, today);
      return context.age ? `@${row.displayName || row.login} (${context.age})` : `@${row.displayName || row.login}`;
    }).join(', ');
    const message = rows.length
      ? renderText('today_list', { ...baseContext, names, count: rows.length })
      : renderText('today_none', baseContext);
    return { ok: true, command: 'birthday', action: 'today', count: rows.length, rows, message, chat: await sendChat(message, 'birthday_today') };
  }

  const message = renderText('usage', baseContext);
  return { ok: false, command: 'birthday', action: 'unknown', error: 'unknown_subcommand', message, chat: await sendChat(message, 'birthday_unknown') };
}

function safePublicConfig(cfg = getConfig()) {
  return {
    enabled: cfg.enabled !== false,
    timezone: cfg.timezone || 'Europe/Berlin',
    command: {
      enabled: cfg.command?.enabled !== false,
      trigger: cfg.command?.trigger || 'birthday',
      aliases: Array.isArray(cfg.command?.aliases) ? cfg.command.aliases : [],
      permissionLevel: cfg.command?.permissionLevel || 'everyone',
      cooldownGlobalMs: Number(cfg.command?.cooldownGlobalMs || 0),
      cooldownUserMs: Number(cfg.command?.cooldownUserMs || 0)
    },
    registration: {
      enabled: cfg.registration?.enabled !== false,
      allowYear: cfg.registration?.allowYear !== false,
      storeYear: cfg.registration?.storeYear !== false
    },
    automaticGreeting: {
      enabled: cfg.automaticGreeting?.enabled !== false,
      skipCommandMessages: cfg.automaticGreeting?.skipCommandMessages !== false,
      oncePerLocalDate: cfg.automaticGreeting?.oncePerLocalDate !== false,
      onlyWhenLive: cfg.automaticGreeting?.onlyWhenLive !== false,
      writeDiaryEntry: cfg.automaticGreeting?.writeDiaryEntry !== false
    },
    diary: {
      enabled: cfg.diary?.enabled !== false,
      systemUsername: cfg.diary?.systemUsername || 'Geburtstags-System'
    },
    settingsTable: cfg.settingsTable || SETTINGS_TABLE,
    settingsSource: cfg.settingsSource || 'unknown',
    settingsError: cfg.settingsError || '',
    textsTable: getMessages()._textsTable || texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
    textsSource: getMessages()._textsSource || 'unknown'
  };
}

function buildStatus() {
  const today = localParts();
  const todayRows = state.schemaOk ? listBirthdaysFor(today.day, today.month) : [];
  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    step: 'STEP_BIRTHDAY_002A',
    initialized: state.initialized,
    loadedAt: state.loadedAt,
    schemaOk: state.schemaOk,
    schemaError: state.schemaError,
    commandSeeded: state.commandSeeded,
    chatHookInstalled: state.chatHookInstalled,
    configPath: state.configPath,
    databasePath: typeof database.getDbPath === 'function' ? database.getDbPath() : null,
    config: safePublicConfig(),
    today: {
      localDate: today.date,
      day: today.day,
      month: today.month,
      count: todayRows.length,
      rows: todayRows
    },
    stats: {
      automaticChecks: state.automaticChecks,
      automaticGreetings: state.automaticGreetings,
      commandExecutions: state.commandExecutions,
      lastAutomaticCheckAt: state.lastAutomaticCheckAt,
      lastGreetingAt: state.lastGreetingAt,
      lastCommandAt: state.lastCommandAt,
      lastError: state.lastError
    },
    routes: [
      { method: 'GET', path: `${API_PREFIX}/status` },
      { method: 'POST', path: `${API_PREFIX}/command` },
      { method: 'GET', path: `${API_PREFIX}/today` },
      { method: 'POST', path: `${API_PREFIX}/reload` }
    ]
  };
}

function registerRoutes(ctx) {
  const app = ctx.app;

  routes.registerGet(app, [`${API_PREFIX}/status`], (req, res) => {
    try { return res.json(buildStatus()); }
    catch (err) { return res.status(500).json({ ok: false, error: err.message || String(err) }); }
  });

  routes.registerGet(app, [`${API_PREFIX}/today`], (req, res) => {
    try {
      const today = localParts();
      return res.json({ ok: true, module: MODULE_NAME, localDate: today.date, rows: listBirthdaysFor(today.day, today.month) });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/command`], async (req, res) => {
    try {
      const result = await handleBirthdayCommand(req.body || req.query || {});
      return res.status(result.ok ? 200 : 400).json(result);
    } catch (err) {
      state.lastError = err.message || String(err);
      return res.status(500).json({ ok: false, module: MODULE_NAME, error: state.lastError });
    }
  });

  routes.registerPost(app, [`${API_PREFIX}/reload`], (req, res) => {
    try {
      reloadRuntime();
      seedBirthdayCommand();
      return res.json({ ok: true, reloaded: true, status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });
}

function init(ctx) {
  state.initialized = true;
  state.loadedAt = nowIso();
  database.ensureReady(ctx);
  ensureSchema();
  reloadRuntime();
  seedBirthdayCommand();
  installChatActivityHook();
  registerRoutes(ctx);
  console.log('[birthday] routes active: /api/birthday/*');
  return { name: MODULE_NAME, step: 'STEP_BIRTHDAY_002A' };
}

module.exports = {
  init,
  getStatus: buildStatus,
  handleCommand: handleBirthdayCommand,
  maybeAutoGreetFromChat
};
