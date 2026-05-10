"use strict";

const fs = require("fs");
const path = require("path");

const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const security = require("./helpers/helper_security");
const settings = require("./helpers/helper_settings");
const texts = require("./helpers/helper_texts");
const database = require("../core/database");

const MODULE_NAME = "todo";
const SCHEMA_VERSION = 1;
const SETTINGS_TABLE = "todo_settings";
const TEXTS_MODULE = "todo";

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DISCORD_CHANNELS_PATH = path.join(ROOT_DIR, "config", "discord_channels.json");
const MESSAGES_PATH = path.join(ROOT_DIR, "config", "messages", "todo.json");
const DEFAULT_USERINFO_BASE_URL = `http://127.0.0.1:${process.env.PORT || 8080}/userinfo`;
const USERINFO_TIMEOUT_MS = 2500;

const TARGETS = {
  forrest: {
    key: "forrest",
    label: "Forrest",
    channelKey: "todo_forrest",
    aliases: ["forrest", "forrestcgn"]
  },
  engel: {
    key: "engel",
    label: "Engel",
    channelKey: "todo_engel",
    aliases: ["engel", "engelcgn"]
  },
  roxxy: {
    key: "roxxy",
    label: "Roxxy",
    channelKey: "todo_roxxy",
    aliases: ["roxxy", "roxxyfoxxycgn"]
  },
  gecko: {
    key: "gecko",
    label: "Gecko",
    channelKey: "todo_gecko",
    aliases: ["gecko", "geckostief"]
  }
};

const DEFAULT_SETTINGS = {
  enabled: true,
  userinfoBaseUrl: DEFAULT_USERINFO_BASE_URL,
  stats: {
    defaultLimit: 10,
    maxLimit: 50
  },
  targets: TARGETS
};

const DEFAULT_MESSAGES = {
  help: "Mit !todo <name> <dein Text> kannst du ein Todo im passenden Discord-Channel eintragen. Beispiel: !todo @ForrestCGN Alles testen...",
  added: "Todo wurde eingetragen.",
  invalidTarget: "Ungültiges Ziel. Erlaubt sind: {targets}.",
  missingChannel: "Todo-Channel für {targetLabel} ist nicht konfiguriert.",
  missingText: "Bitte gib einen Todo-Text an. Beispiel: !todo @ForrestCGN Alles testen...",
  missingMessage: "Bitte gib ein Ziel und einen Todo-Text an. Beispiel: !todo @ForrestCGN Alles testen...",
  unauthorized: "Nicht autorisiert.",
  failed: "Todo konnte nicht eingetragen werden.",
  reloadOk: "Todo-Konfiguration wurde neu geladen.",
  statsEmpty: "Noch keine Todo-Statistik vorhanden.",
  statsHeader: "Todo-Statistik:",
  statsTodayHeader: "Todo-Statistik heute:",
  discordPost: "Todo von {authorDisplay}:\n\n{todoText}"
};

const TEXT_CATEGORY_LABELS = {
  chat: "Chat-Antworten",
  discord: "Discord-Posts",
  stats: "Statistiktexte",
  errors: "Fehlertexte",
  system: "Systemtexte"
};

const TEXT_CATEGORIES = {
  help: "chat",
  added: "chat",
  invalidTarget: "errors",
  missingChannel: "errors",
  missingText: "errors",
  missingMessage: "errors",
  unauthorized: "errors",
  failed: "errors",
  reloadOk: "system",
  statsEmpty: "stats",
  statsHeader: "stats",
  statsTodayHeader: "stats",
  discordPost: "discord"
};

let runtime = {
  channels: {},
  messages: { ...DEFAULT_MESSAGES },
  settings: { ...DEFAULT_SETTINGS },
  targets: { ...TARGETS },
  loadedAt: null,
  lastLoadError: null,
  lastUserinfoError: null,
  schemaReady: false,
  schemaError: null
};


function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = deepClone(item);
    return out;
  }
  return value;
}

function deepMerge(base, extra) {
  const out = deepClone(base || {});
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;

  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = deepClone(value);
    }
  }

  return out;
}

function flattenSettingsObject(input, prefix = "") {
  const result = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return result;

  for (const [key, value] of Object.entries(input)) {
    if (!key) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value) && fullKey !== "targets") {
      result.push(...flattenSettingsObject(value, fullKey));
    } else {
      result.push({
        key: fullKey,
        value,
        valueType: settings.normalizeValueType("", value),
        description: ""
      });
    }
  }

  return result;
}

function setNestedValue(target, dottedKey, value) {
  const parts = String(dottedKey || "").split(".").map(part => part.trim()).filter(Boolean);
  if (!parts.length) return target;

  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return target;
}

function normalizeTargets(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : TARGETS;
  const result = {};

  for (const [rawKey, rawTarget] of Object.entries(source)) {
    if (!rawTarget || typeof rawTarget !== "object" || Array.isArray(rawTarget)) continue;
    const key = normalizeAlias(rawTarget.key || rawKey);
    if (!key) continue;
    const label = String(rawTarget.label || key).trim() || key;
    const channelKey = String(rawTarget.channelKey || `todo_${key}`).trim();
    const aliases = Array.isArray(rawTarget.aliases) ? rawTarget.aliases : [key];
    const cleanAliases = aliases.map(normalizeAlias).filter(Boolean);
    if (!cleanAliases.includes(key)) cleanAliases.unshift(key);

    result[key] = { key, label, channelKey, aliases: cleanAliases };
  }

  return Object.keys(result).length ? result : deepClone(TARGETS);
}

function getTargets() {
  return runtime.targets && typeof runtime.targets === "object" ? runtime.targets : TARGETS;
}

function loadDbSettings() {
  const merged = deepMerge(DEFAULT_SETTINGS, {});

  try {
    settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(merged));
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) setNestedValue(merged, row.key, row.value);
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = "database_with_json_fallback";
    return merged;
  } catch (err) {
    runtime.lastLoadError = runtime.lastLoadError || `todo settings fallback: ${err.message}`;
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = "default_fallback";
    merged.settingsError = err.message;
    return merged;
  }
}

function loadDbMessages(baseMessages) {
  const fallback = { ...DEFAULT_MESSAGES, ...(baseMessages && typeof baseMessages === "object" ? baseMessages : {}) };

  try {
    const result = texts.getModuleTexts(TEXTS_MODULE, fallback, { seed: true });
    return {
      ...result.texts,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: result.table,
      _textsSource: "database_variants_with_json_fallback"
    };
  } catch (err) {
    runtime.lastLoadError = runtime.lastLoadError || `todo texts fallback: ${err.message}`;
    return {
      ...fallback,
      _textsTable: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
      _legacyTextsTable: texts.DEFAULT_MODULE_TEXTS_TABLE,
      _textsSource: "json_fallback",
      _textsError: err.message
    };
  }
}

function publicSettings() {
  return {
    enabled: runtime.settings?.enabled !== false,
    userinfoBaseUrl: runtime.settings?.userinfoBaseUrl || DEFAULT_USERINFO_BASE_URL,
    statsDefaultLimit: Number(runtime.settings?.stats?.defaultLimit || 10),
    statsMaxLimit: Number(runtime.settings?.stats?.maxLimit || 50),
    settingsTable: runtime.settings?.settingsTable || SETTINGS_TABLE,
    settingsSource: runtime.settings?.settingsSource || "unknown",
    settingsError: runtime.settings?.settingsError || ""
  };
}

function getAdminPayload(req) {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) return req.body;
  return req.query && typeof req.query === "object" ? req.query : {};
}

function listAdminSettings() {
  settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(DEFAULT_SETTINGS));
  return settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
}

function setAdminSettings(payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const updates = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
    ? body.settings
    : (body.key ? { [body.key]: body.value } : {});

  if (!Object.keys(updates).length) throw new Error("settings_payload_empty");

  const rows = [];
  for (const [key, value] of Object.entries(updates)) {
    rows.push(settings.setSetting(SETTINGS_TABLE, key, value));
  }

  loadRuntime();
  return { ok: true, module: MODULE_NAME, table: SETTINGS_TABLE, updated: rows.length, rows, status: buildStatus() };
}

function textEditorOptions() {
  return {
    categories: TEXT_CATEGORIES,
    categoryLabels: TEXT_CATEGORY_LABELS,
    defaultCategory: "chat"
  };
}

function listAdminTexts() {
  return texts.listModuleTextEditor(TEXTS_MODULE, runtime.messages || DEFAULT_MESSAGES, { ...textEditorOptions(), seed: true });
}

function setAdminTexts(payload) {
  const result = texts.handleModuleTextEditorPayload(TEXTS_MODULE, payload, textEditorOptions());
  loadRuntime();
  return { ok: true, module: MODULE_NAME, ...result, status: buildStatus() };
}

function normalizeAlias(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function getInput(req, key) {
  return core.getParam(req, key, "");
}

function wantsPlain(req) {
  return String(getInput(req, "plain") || "").trim() === "1";
}

function reply(req, res, payload, statusCode = 200) {
  if (wantsPlain(req)) {
    return res.status(200).type("text/plain; charset=utf-8").send(payload.message || "");
  }
  return res.status(statusCode).json(payload);
}

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    runtime.lastLoadError = `${path.basename(filePath)}: ${err.message}`;
    return fallback;
  }
}

function ensureMessagesFile() {
  try {
    const dir = path.dirname(MESSAGES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(MESSAGES_PATH)) {
      fs.writeFileSync(MESSAGES_PATH, JSON.stringify(DEFAULT_MESSAGES, null, 2), "utf8");
    }
  } catch (err) {
    runtime.lastLoadError = `todo messages write failed: ${err.message}`;
  }
}

function loadRuntime() {
  runtime.lastLoadError = null;
  ensureMessagesFile();

  const channels = readJsonSafe(DISCORD_CHANNELS_PATH, {});
  const messages = readJsonSafe(MESSAGES_PATH, DEFAULT_MESSAGES);

  runtime.channels = channels && typeof channels === "object" ? channels : {};
  runtime.settings = loadDbSettings();
  runtime.targets = normalizeTargets(runtime.settings.targets || TARGETS);
  runtime.messages = loadDbMessages(messages);
  runtime.loadedAt = nowIso();
  return runtime;
}

function t(key, values = {}) {
  try {
    return texts.renderModuleText(TEXTS_MODULE, key, runtime.messages || DEFAULT_MESSAGES, values, { ...textEditorOptions(), seed: false }) || String(runtime.messages?.[key] || DEFAULT_MESSAGES[key] || key);
  } catch (err) {
    const template = String(runtime.messages?.[key] || DEFAULT_MESSAGES[key] || key);
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
      if (Object.prototype.hasOwnProperty.call(values, name)) return String(values[name] ?? "");
      return match;
    });
  }
}

function nowIso() {
  return new Date().toISOString();
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function checkAuth(req) {
  const result = security.canAccess(req);
  return { ok: result.allowed, reason: result.reason, clientIp: result.clientIp };
}

function getDiscordBridge(ctx) {
  const bridge = ctx?.app?.locals?.discordBridge;
  if (!bridge || typeof bridge.postToChannel !== "function") {
    throw new Error("discordBridge.postToChannel ist nicht verfügbar.");
  }
  return bridge;
}


function getNestedValue(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (current == null) return "";
    current = current[part];
  }
  return typeof current === "string" ? current.trim() : "";
}

function extractDisplayNameFromUserinfo(payload) {
  if (!payload || typeof payload !== "object") return "";

  const candidates = [
    ["display_name"],
    ["displayName"],
    ["name"],
    ["login"],
    ["user", "display_name"],
    ["user", "displayName"],
    ["data", 0, "display_name"],
    ["data", 0, "displayName"],
    ["result", "display_name"],
    ["result", "displayName"]
  ];

  for (const pathParts of candidates) {
    const value = getNestedValue(payload, pathParts);
    if (value) return value;
  }

  return "";
}

function shouldResolveDisplayName(authorLogin, authorDisplay) {
  const login = String(authorLogin || "").trim();
  const display = String(authorDisplay || "").trim();

  if (!login) return false;
  if (!display) return true;
  if (display.toLowerCase() === login.toLowerCase()) return true;
  return false;
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  if (typeof fetch !== "function") throw new Error("fetch ist in dieser Node-Version nicht verfügbar.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function resolveAuthorInfo(input) {
  const authorLogin = String(input.authorLogin || input.userName || "").trim();
  let authorDisplay = String(input.authorDisplay || input.displayName || "").trim();

  if (!authorDisplay) authorDisplay = authorLogin || "Unbekannt";

  if (!shouldResolveDisplayName(authorLogin, authorDisplay)) {
    return {
      authorLogin,
      authorDisplay,
      twitchResolved: false
    };
  }

  try {
    const baseUrl = String(input.userinfoBaseUrl || runtime.settings?.userinfoBaseUrl || DEFAULT_USERINFO_BASE_URL).trim();
    const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}login=${encodeURIComponent(authorLogin)}`;
    const payload = await fetchJsonWithTimeout(url, USERINFO_TIMEOUT_MS);
    const displayName = extractDisplayNameFromUserinfo(payload);

    if (displayName) {
      runtime.lastUserinfoError = null;
      return {
        authorLogin,
        authorDisplay: displayName,
        twitchResolved: true
      };
    }

    runtime.lastUserinfoError = "userinfo response enthält keinen DisplayName.";
  } catch (err) {
    runtime.lastUserinfoError = err?.message || "userinfo lookup failed";
  }

  return {
    authorLogin,
    authorDisplay: authorDisplay || authorLogin || "Unbekannt",
    twitchResolved: false
  };
}

function parseTodoMessage(rawMessage) {
  let text = String(rawMessage || "").trim();
  if (text.toLowerCase().startsWith("!todo")) {
    text = text.slice("!todo".length).trim();
  }

  if (!text) return { ok: false, error: "missing_message", targetRaw: "", todoText: "" };

  const firstSpace = text.indexOf(" ");
  if (firstSpace === -1) return { ok: false, error: "missing_text", targetRaw: text.trim(), todoText: "" };

  const targetRaw = text.slice(0, firstSpace).trim();
  const todoText = text.slice(firstSpace + 1).trim();

  if (!targetRaw) return { ok: false, error: "missing_target", targetRaw: "", todoText };
  if (!todoText) return { ok: false, error: "missing_text", targetRaw, todoText: "" };

  return { ok: true, targetRaw, todoText };
}

function resolveTodoTarget(rawTarget) {
  const value = normalizeAlias(rawTarget);
  for (const target of Object.values(getTargets())) {
    if (target.aliases.some(alias => normalizeAlias(alias) === value)) return target;
  }
  return null;
}

function getTargetListText() {
  return Object.values(getTargets()).map(tg => tg.key).join(", ");
}

function getTodoChannelIdForTarget(target) {
  if (!target) return "";
  const channelId = String(runtime.channels?.[target.channelKey] || "").trim();
  return channelId;
}

function getChannelStatus() {
  const result = {};
  for (const target of Object.values(getTargets())) {
    result[target.key] = {
      label: target.label,
      channelKey: target.channelKey,
      configured: Boolean(getTodoChannelIdForTarget(target))
    };
  }
  return result;
}

function makeUserKey(authorLogin, authorDisplay) {
  const login = normalizeAlias(authorLogin);
  if (login) return login;
  return normalizeAlias(authorDisplay) || "unknown";
}

function ensureTodoSchema() {
  if (runtime.schemaReady) return true;

  try {
    database.ensureReady();

    database.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
      if (toVersion !== 1) return;

      db.exec(`
        CREATE TABLE IF NOT EXISTS todo_user_stats (
          user_key TEXT NOT NULL,
          target_key TEXT NOT NULL,
          author_login TEXT,
          author_display_name TEXT,
          target_label TEXT NOT NULL,
          entry_count INTEGER NOT NULL DEFAULT 0,
          first_entry_at TEXT,
          last_entry_at TEXT,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (user_key, target_key)
        );
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS todo_daily_stats (
          stat_date TEXT NOT NULL,
          user_key TEXT NOT NULL,
          target_key TEXT NOT NULL,
          author_login TEXT,
          author_display_name TEXT,
          target_label TEXT NOT NULL,
          entry_count INTEGER NOT NULL DEFAULT 0,
          first_entry_at TEXT,
          last_entry_at TEXT,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (stat_date, user_key, target_key)
        );
      `);
    });

    runtime.schemaReady = true;
    runtime.schemaError = null;
    return true;
  } catch (err) {
    runtime.schemaReady = false;
    runtime.schemaError = err.message;
    return false;
  }
}

function incrementStats({ authorLogin, authorDisplay, target }) {
  if (!ensureTodoSchema()) return { ok: false, error: runtime.schemaError || "schema_not_ready" };

  const now = nowIso();
  const statDate = localDateString();
  const userKey = makeUserKey(authorLogin, authorDisplay);

  const tx = database.transaction(() => {
    database.run(`
      INSERT INTO todo_user_stats (
        user_key, target_key, author_login, author_display_name, target_label,
        entry_count, first_entry_at, last_entry_at, updated_at
      ) VALUES (
        :userKey, :targetKey, :authorLogin, :authorDisplay, :targetLabel,
        1, :now, :now, :now
      )
      ON CONFLICT(user_key, target_key) DO UPDATE SET
        author_login = excluded.author_login,
        author_display_name = excluded.author_display_name,
        target_label = excluded.target_label,
        entry_count = todo_user_stats.entry_count + 1,
        last_entry_at = excluded.last_entry_at,
        updated_at = excluded.updated_at
    `, {
      userKey,
      targetKey: target.key,
      authorLogin,
      authorDisplay,
      targetLabel: target.label,
      now
    });

    database.run(`
      INSERT INTO todo_daily_stats (
        stat_date, user_key, target_key, author_login, author_display_name, target_label,
        entry_count, first_entry_at, last_entry_at, updated_at
      ) VALUES (
        :statDate, :userKey, :targetKey, :authorLogin, :authorDisplay, :targetLabel,
        1, :now, :now, :now
      )
      ON CONFLICT(stat_date, user_key, target_key) DO UPDATE SET
        author_login = excluded.author_login,
        author_display_name = excluded.author_display_name,
        target_label = excluded.target_label,
        entry_count = todo_daily_stats.entry_count + 1,
        last_entry_at = excluded.last_entry_at,
        updated_at = excluded.updated_at
    `, {
      statDate,
      userKey,
      targetKey: target.key,
      authorLogin,
      authorDisplay,
      targetLabel: target.label,
      now
    });
  });

  tx();
  return { ok: true, statDate, userKey };
}

function formatStatsRows(rows, headerKey) {
  if (!rows || rows.length === 0) return t("statsEmpty");
  const lines = [t(headerKey)];
  for (const row of rows) {
    const name = row.author_display_name || row.author_login || row.user_key || "Unbekannt";
    const target = row.target_label || row.target_key || "?";
    lines.push(`${name} → ${target}: ${row.entry_count}`);
  }
  return lines.join("\n");
}

function getLimit(req, fallback = null, max = null) {
  const defaultLimit = Number(fallback || runtime.settings?.stats?.defaultLimit || 10);
  const maxLimit = Number(max || runtime.settings?.stats?.maxLimit || 50);
  const raw = Number(getInput(req, "limit") || defaultLimit);
  if (!Number.isFinite(raw) || raw <= 0) return defaultLimit;
  return Math.min(Math.floor(raw), maxLimit);
}

async function postTodoEntry(ctx, input) {
  const authorInfo = await resolveAuthorInfo(input);
  const authorLogin = authorInfo.authorLogin;
  const authorDisplay = authorInfo.authorDisplay;
  const rawMessage = String(input.message || "").trim();

  const parsed = parseTodoMessage(rawMessage);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      message: parsed.error === "missing_message" ? t("missingMessage") : t("missingText")
    };
  }

  const target = resolveTodoTarget(parsed.targetRaw);
  if (!target) {
    return {
      ok: false,
      error: "invalid_target",
      message: t("invalidTarget", { targets: getTargetListText() })
    };
  }

  const channelId = getTodoChannelIdForTarget(target);
  if (!channelId) {
    return {
      ok: false,
      error: "missing_channel",
      target: target.key,
      channelKey: target.channelKey,
      message: t("missingChannel", { targetLabel: target.label, channelKey: target.channelKey })
    };
  }

  const content = t("discordPost", {
    targetKey: target.key,
    targetLabel: target.label,
    authorLogin: authorLogin || "Unbekannt",
    authorDisplay: authorDisplay || authorLogin || "Unbekannt",
    todoText: parsed.todoText
  });

  try {
    const bridge = getDiscordBridge(ctx);
    const postResult = await bridge.postToChannel({ channelId, content });

    const statsResult = incrementStats({
      authorLogin,
      authorDisplay: authorDisplay || authorLogin || "Unbekannt",
      target
    });

    return {
      ok: true,
      module: MODULE_NAME,
      target: target.key,
      targetLabel: target.label,
      channelKey: target.channelKey,
      channelId,
      authorLogin,
      authorDisplay: authorDisplay || authorLogin || "Unbekannt",
      twitchResolved: Boolean(authorInfo.twitchResolved),
      message: t("added", { targetLabel: target.label }),
      postResult,
      statsResult
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "post_failed",
      message: t("failed")
    };
  }
}

function buildStatus() {
  ensureTodoSchema();
  return {
    ok: true,
    module: MODULE_NAME,
    version: 2,
    schemaVersion: database.getSchemaVersion(MODULE_NAME),
    schemaReady: runtime.schemaReady,
    schemaError: runtime.schemaError,
    databasePath: database.getDbPath(),
    discordChannelsPath: DISCORD_CHANNELS_PATH,
    messagesPath: MESSAGES_PATH,
    loadedAt: runtime.loadedAt,
    lastLoadError: runtime.lastLoadError,
    lastUserinfoError: runtime.lastUserinfoError,
    userinfoBaseUrl: runtime.settings?.userinfoBaseUrl || DEFAULT_USERINFO_BASE_URL,
    settings: publicSettings(),
    settingsTable: SETTINGS_TABLE,
    textsTable: runtime.messages?._textsTable || texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
    legacyTextsTable: runtime.messages?._legacyTextsTable || texts.DEFAULT_MODULE_TEXTS_TABLE,
    textsSource: runtime.messages?._textsSource || "unknown",
    targets: getTargets(),
    aliases: Object.fromEntries(Object.values(getTargets()).map(target => [target.key, target.aliases])),
    channels: getChannelStatus()
  };
}


function countTableRows(table, where = "", params = {}) {
  try {
    database.ensureReady();
    const safeTable = String(table || "").trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeTable)) return { ok: false, table: safeTable, count: 0, error: "invalid_table" };
    const clause = where ? ` WHERE ${where}` : "";
    const row = database.get(`SELECT COUNT(*) AS c FROM ${safeTable}${clause}`, params) || {};
    return { ok: true, table: safeTable, count: Number(row.c || 0), error: "" };
  } catch (err) {
    return { ok: false, table, count: 0, error: err?.message || "count_failed" };
  }
}

function fileCheck(label, filePath, expected = "file") {
  try {
    const exists = fs.existsSync(filePath);
    const stat = exists ? fs.statSync(filePath) : null;
    const isFile = Boolean(stat && stat.isFile());
    const isDirectory = Boolean(stat && stat.isDirectory());
    const ok = expected === "directory" ? isDirectory : isFile;
    return { ok, label, path: filePath, exists, isFile, isDirectory, error: ok ? "" : (exists ? `not_${expected}` : "missing") };
  } catch (err) {
    return { ok: false, label, path: filePath, exists: false, isFile: false, isDirectory: false, error: err?.message || "file_check_failed" };
  }
}

function buildTodoRoutes() {
  const routeList = [
    { method: "GET", path: "/api/todo/status", auth: "local_or_auth", category: "status", description: "Todo-Status, Config-Quellen, Targets, Channels und Schema-Status." },
    { method: "GET", path: "/api/todo/config", auth: "local_or_auth", category: "config", description: "Read-only effektive Todo-Config ohne Secrets." },
    { method: "GET", path: "/api/todo/settings", auth: "local_or_auth", category: "settings", description: "Read-only DB-Settings aus todo_settings." },
    { method: "GET", path: "/api/todo/routes", auth: "local_or_auth", category: "diagnostics", description: "Read-only Routenübersicht des Todo-Moduls." },
    { method: "GET", path: "/api/todo/integration-check", auth: "local_or_auth", category: "diagnostics", description: "Read-only Integration-Check des Todo-Moduls." },
    { method: "POST", path: "/api/todo/reload", auth: "local_or_auth", category: "admin", description: "Runtime-Config und Texte neu laden." },
    { method: "GET", path: "/api/todo/reload", auth: "local_or_auth", category: "admin", description: "Runtime-Config und Texte neu laden, GET-kompatibel für einfache Clients." },
    { method: "GET", path: "/api/todo/add", auth: "local_or_auth", category: "entry", description: "Todo-Eintrag speichern/posten, GET-kompatibel für Streamer.bot/einfache Clients." },
    { method: "POST", path: "/api/todo/add", auth: "local_or_auth", category: "entry", description: "Todo-Eintrag speichern/posten." },
    { method: "GET", path: "/api/todo/stats", auth: "local_or_auth", category: "stats", description: "Todo-Top-Statistik lesen." },
    { method: "GET", path: "/api/todo/stats/top", auth: "local_or_auth", category: "stats", description: "Todo-Top-Statistik lesen." },
    { method: "GET", path: "/api/todo/stats/today", auth: "local_or_auth", category: "stats", description: "Todo-Tagesstatistik lesen." },
    { method: "GET", path: "/api/todo/admin/settings", auth: "local_or_auth", category: "admin", description: "Admin-Settings lesen." },
    { method: "POST", path: "/api/todo/admin/settings", auth: "local_or_auth", category: "admin", description: "Admin-Settings speichern." },
    { method: "GET", path: "/api/todo/admin/texts", auth: "local_or_auth", category: "admin", description: "Todo-Texteditor-Daten lesen." },
    { method: "POST", path: "/api/todo/admin/texts", auth: "local_or_auth", category: "admin", description: "Todo-Texte/Varianten speichern." },
    { method: "GET", path: "/discord/todo/status", auth: "legacy/local_or_auth", category: "legacy", description: "Legacy-Route für Todo-Status." },
    { method: "GET", path: "/discord/todo", auth: "legacy/local_or_auth", category: "legacy", description: "Legacy-Route für Todo-Eintrag." },
    { method: "POST", path: "/discord/todo", auth: "legacy/local_or_auth", category: "legacy", description: "Legacy-Route für Todo-Eintrag." }
  ];

  return {
    ok: true,
    module: MODULE_NAME,
    version: 1,
    standardPrefix: "/api/todo",
    legacyPrefixes: ["/discord/todo"],
    standardEndpoints: {
      status: "/api/todo/status",
      config: "/api/todo/config",
      settings: "/api/todo/settings",
      routes: "/api/todo/routes",
      integrationCheck: "/api/todo/integration-check",
      reload: "/api/todo/reload"
    },
    routes: routeList,
    count: routeList.length,
    categories: Array.from(new Set(routeList.map(route => route.category))).sort(),
    notes: [
      "Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.",
      "Bestehende Legacy-Routen bleiben erhalten.",
      "Schreibende Routen sind nur dokumentiert, nicht neu angelegt.",
      "/api/todo/config und /api/todo/settings sind read-only Standard-Aliase."
    ]
  };
}


function safeCall(label, fn, fallback = null) {
  try {
    return { ok: true, value: fn(), error: "" };
  } catch (err) {
    return { ok: false, value: fallback, error: `${label}:${err?.message || "failed"}` };
  }
}

function buildTodoIntegrationCheck() {
  const errors = [];
  const warnings = [];

  const schemaResult = safeCall("schema", () => ensureTodoSchema(), false);
  const schemaOk = Boolean(schemaResult.value);
  if (!schemaResult.ok) errors.push(schemaResult.error);

  const statusResult = safeCall("status", () => buildStatus(), null);
  const status = statusResult.value;
  if (!statusResult.ok) warnings.push(statusResult.error);

  const channelResult = safeCall("channels", () => getChannelStatus(), {});
  const channelStatus = channelResult.value && typeof channelResult.value === "object" ? channelResult.value : {};
  if (!channelResult.ok) warnings.push(channelResult.error);

  const targetsResult = safeCall("targets", () => getTargets(), {});
  const targets = targetsResult.value && typeof targetsResult.value === "object" ? targetsResult.value : {};
  if (!targetsResult.ok) warnings.push(targetsResult.error);

  const missingChannels = Object.entries(channelStatus)
    .filter(([, item]) => !item.configured)
    .map(([key, item]) => ({ key, label: item.label, channelKey: item.channelKey }));

  if (!schemaOk) errors.push(runtime.schemaError || "schema_not_ready");
  if (runtime.lastLoadError) warnings.push(runtime.lastLoadError);
  if (runtime.lastUserinfoError) warnings.push(`userinfo: ${runtime.lastUserinfoError}`);
  if (missingChannels.length) warnings.push(`missing_todo_channels:${missingChannels.map(item => item.key).join(",")}`);

  const settingsCount = countTableRows(SETTINGS_TABLE);
  const userStatsCount = countTableRows("todo_user_stats");
  const dailyStatsCount = countTableRows("todo_daily_stats");
  const textVariantCount = countTableRows(texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE, "module_name = :module", { module: TEXTS_MODULE });
  const legacyTextCount = countTableRows(texts.DEFAULT_MODULE_TEXTS_TABLE, "module_name = :module", { module: TEXTS_MODULE });

  for (const check of [settingsCount, userStatsCount, dailyStatsCount, textVariantCount]) {
    if (!check.ok) errors.push(`${check.table}:${check.error}`);
  }

  const channelsFile = fileCheck("discordChannels", DISCORD_CHANNELS_PATH, "file");
  const messagesFile = fileCheck("messages", MESSAGES_PATH, "file");
  if (!channelsFile.ok) warnings.push(`discordChannels:${channelsFile.error}`);
  if (!messagesFile.ok) warnings.push(`messages:${messagesFile.error}`);

  const schemaVersionResult = safeCall("schemaVersion", () => database.getSchemaVersion(MODULE_NAME), 0);
  if (!schemaVersionResult.ok) warnings.push(schemaVersionResult.error);

  const dbPathResult = safeCall("dbPath", () => database.getDbPath(), null);
  if (!dbPathResult.ok) warnings.push(dbPathResult.error);

  const aliasResult = safeCall("aliases", () => Object.fromEntries(Object.values(targets).map(target => [target.key, target.aliases])), {});
  if (!aliasResult.ok) warnings.push(aliasResult.error);

  return {
    ok: errors.length === 0,
    module: MODULE_NAME,
    version: 1,
    schemaVersion: schemaVersionResult.value,
    healthy: errors.length === 0,
    warnings,
    errors,
    checks: {
      config: {
        ok: !runtime.lastLoadError,
        discordChannelsPath: DISCORD_CHANNELS_PATH,
        messagesPath: MESSAGES_PATH,
        source: "database_with_json_fallback",
        error: runtime.lastLoadError || ""
      },
      database: {
        ok: true,
        adapter: database.getAdapter(),
        path: dbPathResult.value,
        schemaVersion: schemaVersionResult.value,
        expectedSchemaVersion: SCHEMA_VERSION,
        error: runtime.schemaError || ""
      },
      tables: {
        userStats: userStatsCount,
        dailyStats: dailyStatsCount,
        settings: settingsCount,
        textVariants: textVariantCount,
        legacyTexts: legacyTextCount
      },
      settings: {
        ok: settingsCount.ok,
        table: SETTINGS_TABLE,
        count: settingsCount.count,
        source: runtime.settings?.settingsSource || "unknown",
        error: runtime.settings?.settingsError || settingsCount.error || ""
      },
      texts: {
        ok: textVariantCount.ok,
        module: TEXTS_MODULE,
        table: texts.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
        legacyTable: texts.DEFAULT_MODULE_TEXTS_TABLE,
        source: runtime.messages?._textsSource || "unknown",
        count: textVariantCount.count,
        legacyCount: legacyTextCount.count,
        error: runtime.messages?._textsError || textVariantCount.error || ""
      },
      files: {
        discordChannels: channelsFile,
        messages: messagesFile
      },
      channels: {
        ok: missingChannels.length === 0,
        targets: channelStatus,
        missing: missingChannels
      },
      targets: {
        ok: Object.keys(targets).length > 0,
        count: Object.keys(targets).length,
        aliases: aliasResult.value
      },
      debug: {
        statusBuilt: Boolean(status),
        statusError: statusResult.error || ""
      }
    },
    routes: {
      status: "/api/todo/status",
      config: "/api/todo/config",
      settings: "/api/todo/settings",
      routes: "/api/todo/routes",
      integrationCheck: "/api/todo/integration-check",
      reload: "/api/todo/reload"
    },
    notes: [
      "Read-only Integration-Check für Dashboard-/Modul-Standardisierung.",
      "Es werden keine DB-, JSON- oder Dateiänderungen vorgenommen.",
      "Warnungen zu fehlenden Discord-Channels bedeuten nur, dass einzelne Todo-Ziele nicht posten können."
    ]
  };
}

function handleConfig(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
  return res.json({ ok: true, module: MODULE_NAME, config: publicSettings(), status: buildStatus() });
}

function handleSettings(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
  try {
    return res.json({ ok: true, module: MODULE_NAME, settings: listAdminSettings(), status: buildStatus() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, message: "Todo-Settings konnten nicht gelesen werden." });
  }
}

function handleRoutes(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
  return res.json(buildTodoRoutes());
}

function handleIntegrationCheck(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
  try {
    const check = buildTodoIntegrationCheck();
    return res.json(check);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: MODULE_NAME,
      healthy: false,
      warnings: [],
      errors: [err?.message || "integration_check_failed"],
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack
    });
  }
}

function init(ctx) {
  const app = ctx?.app;
  if (!app) throw new Error("Express app in ctx.app fehlt.");

  database.ensureReady(ctx);
  loadRuntime();
  ensureTodoSchema();

  routes.registerGet(app, ["/discord/todo/status", "/api/todo/status"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    return res.json(buildStatus());
  });

  routes.registerGet(app, ["/api/todo/config"], handleConfig);
  routes.registerGet(app, ["/api/todo/settings"], handleSettings);
  routes.registerGet(app, ["/api/todo/routes"], handleRoutes);
  routes.registerGet(app, ["/api/todo/integration-check"], handleIntegrationCheck);

  const addHandler = async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: "unauthorized", message: t("unauthorized") }, 401);

    const result = await postTodoEntry(ctx, {
      authorLogin: getInput(req, "authorLogin") || getInput(req, "userName"),
      authorDisplay: getInput(req, "authorDisplay") || getInput(req, "displayName"),
      message: getInput(req, "message") || getInput(req, "rawInput")
    });

    return reply(req, res, result, result.ok ? 200 : 400);
  };

  routes.registerGet(app, ["/discord/todo", "/api/todo/add"], addHandler);
  routes.registerPost(app, ["/discord/todo", "/api/todo/add"], addHandler);

  routes.registerGet(app, ["/api/todo/stats", "/api/todo/stats/top"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: "unauthorized", message: t("unauthorized") }, 401);
    if (!ensureTodoSchema()) return reply(req, res, { ok: false, error: runtime.schemaError, message: t("failed") }, 500);

    const limit = getLimit(req);
    const rows = database.all(`
      SELECT user_key, target_key, author_login, author_display_name, target_label, entry_count, first_entry_at, last_entry_at
      FROM todo_user_stats
      ORDER BY entry_count DESC, last_entry_at DESC
      LIMIT :limit
    `, { limit });

    return reply(req, res, {
      ok: true,
      module: MODULE_NAME,
      limit,
      rows,
      message: formatStatsRows(rows, "statsHeader")
    });
  });

  routes.registerGet(app, ["/api/todo/stats/today"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: "unauthorized", message: t("unauthorized") }, 401);
    if (!ensureTodoSchema()) return reply(req, res, { ok: false, error: runtime.schemaError, message: t("failed") }, 500);

    const statDate = String(getInput(req, "date") || localDateString()).trim();
    const limit = getLimit(req);
    const rows = database.all(`
      SELECT stat_date, user_key, target_key, author_login, author_display_name, target_label, entry_count, first_entry_at, last_entry_at
      FROM todo_daily_stats
      WHERE stat_date = :statDate
      ORDER BY entry_count DESC, last_entry_at DESC
      LIMIT :limit
    `, { statDate, limit });

    return reply(req, res, {
      ok: true,
      module: MODULE_NAME,
      statDate,
      limit,
      rows,
      message: formatStatsRows(rows, "statsTodayHeader")
    });
  });


  routes.registerGet(app, ["/api/todo/admin/settings"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
      return res.json({ ok: true, module: MODULE_NAME, settings: listAdminSettings(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: "Todo-Settings konnten nicht gelesen werden." });
    }
  });

  routes.registerPost(app, ["/api/todo/admin/settings"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
      return res.json(setAdminSettings(getAdminPayload(req)));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: "Todo-Settings konnten nicht gespeichert werden." });
    }
  });

  routes.registerGet(app, ["/api/todo/admin/texts"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
      return res.json({ ok: true, module: MODULE_NAME, texts: listAdminTexts(), status: buildStatus() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: "Todo-Texte konnten nicht gelesen werden." });
    }
  });

  routes.registerPost(app, ["/api/todo/admin/texts"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
      return res.json(setAdminTexts(getAdminPayload(req)));
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message, message: "Todo-Texte konnten nicht gespeichert werden." });
    }
  });

  const reloadHandler = async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: "unauthorized", message: t("unauthorized") }, 401);
    loadRuntime();
    const payload = { ok: true, module: MODULE_NAME, message: t("reloadOk"), status: buildStatus() };
    return reply(req, res, payload);
  };

  routes.registerGet(app, ["/api/todo/reload"], reloadHandler);
  routes.registerPost(app, ["/api/todo/reload"], reloadHandler);
}

module.exports = {
  init,
  buildStatus,
  reloadRuntime: loadRuntime,
  listAdminSettings,
  listAdminTexts
};
