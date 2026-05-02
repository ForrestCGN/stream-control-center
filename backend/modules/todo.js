"use strict";

const fs = require("fs");
const path = require("path");

const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const security = require("./helpers/helper_security");
const sqlite = require("./sqlite_core");

const MODULE_NAME = "todo";
const SCHEMA_VERSION = 1;

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

let runtime = {
  channels: {},
  messages: { ...DEFAULT_MESSAGES },
  loadedAt: null,
  lastLoadError: null,
  lastUserinfoError: null,
  schemaReady: false,
  schemaError: null
};

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
  runtime.messages = { ...DEFAULT_MESSAGES, ...(messages && typeof messages === "object" ? messages : {}) };
  runtime.loadedAt = nowIso();
  return runtime;
}

function t(key, values = {}) {
  const template = String(runtime.messages?.[key] || DEFAULT_MESSAGES[key] || key);
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) return String(values[name] ?? "");
    return match;
  });
}

function nowIso() {
  if (sqlite && typeof sqlite.nowIso === "function") return sqlite.nowIso();
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
    const baseUrl = String(input.userinfoBaseUrl || DEFAULT_USERINFO_BASE_URL).trim();
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
  for (const target of Object.values(TARGETS)) {
    if (target.aliases.some(alias => normalizeAlias(alias) === value)) return target;
  }
  return null;
}

function getTargetListText() {
  return Object.values(TARGETS).map(tg => tg.key).join(", ");
}

function getTodoChannelIdForTarget(target) {
  if (!target) return "";
  const channelId = String(runtime.channels?.[target.channelKey] || "").trim();
  return channelId;
}

function getChannelStatus() {
  const result = {};
  for (const target of Object.values(TARGETS)) {
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
    if (!sqlite.isInitialized()) {
      runtime.schemaError = "sqlite_core ist nicht initialisiert.";
      return false;
    }

    sqlite.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
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

  const tx = sqlite.transaction(() => {
    sqlite.run(`
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

    sqlite.run(`
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

function getLimit(req, fallback = 10, max = 50) {
  const raw = Number(getInput(req, "limit") || fallback);
  if (!Number.isFinite(raw) || raw <= 0) return fallback;
  return Math.min(Math.floor(raw), max);
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
    schemaVersion: sqlite.isInitialized() ? sqlite.getSchemaVersion(MODULE_NAME) : 0,
    schemaReady: runtime.schemaReady,
    schemaError: runtime.schemaError,
    databasePath: sqlite.isInitialized() ? sqlite.getDbPath() : null,
    discordChannelsPath: DISCORD_CHANNELS_PATH,
    messagesPath: MESSAGES_PATH,
    loadedAt: runtime.loadedAt,
    lastLoadError: runtime.lastLoadError,
    lastUserinfoError: runtime.lastUserinfoError,
    userinfoBaseUrl: DEFAULT_USERINFO_BASE_URL,
    aliases: Object.fromEntries(Object.values(TARGETS).map(target => [target.key, target.aliases])),
    channels: getChannelStatus()
  };
}

function init(ctx) {
  const app = ctx?.app;
  if (!app) throw new Error("Express app in ctx.app fehlt.");

  loadRuntime();
  ensureTodoSchema();

  routes.registerGet(app, ["/discord/todo/status", "/api/todo/status"], async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "unauthorized" });
    return res.json(buildStatus());
  });

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
    const rows = sqlite.all(`
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
    const rows = sqlite.all(`
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
  reloadRuntime: loadRuntime
};
