"use strict";

const http = require("http");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "vip30";
const MODULE_VERSION = "0.2.0";
const MODULE_BUILD = "step2-twitch-capability-check";
const ROUTE_PREFIX = "/api/vip30";
const SCHEMA_TARGET_VERSION = 1;
const DEFAULT_TARGET_HOST = "127.0.0.1";
const DEFAULT_TARGET_PORT = 8080;

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "community",
  routePrefix: ROUTE_PREFIX,
  routesPrefix: [ROUTE_PREFIX],
  description: "30 Tage VIP Node-Modul: SQLite-Grundlage, Dashboard-Logs/Stats, Communication-Bus und Twitch-Capability-Check ohne Live-Schreibaktion.",
  bus: {
    registered: true,
    heartbeat: true,
    emits: ["module.status", "module.health", "vip30.status", "vip30.twitch"],
    listens: []
  },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  moduleVersion: MODULE_VERSION,
  reward: {
    rewardKey: "vip30",
    title: "30 Tage VIP",
    cost: 50000,
    categoryKey: "vip",
    actionType: "vip30",
    actionKey: "vip30.redeem",
    autoFulfill: false
  },
  slots: {
    maxSlots: 10,
    durationDays: 30,
    blockModerators: true,
    blockExistingVip: true,
    blockExistingSlot: true
  },
  cleanup: {
    enabled: true,
    runOnStart: false,
    intervalMs: 300000
  },
  logging: {
    enabled: true,
    recentLimit: 25,
    serverLogNormalEvents: false
  },
  dashboard: {
    enabled: true
  },
  bus: {
    enabled: true,
    heartbeatIntervalMs: 5000,
    statusPublishIntervalMs: 30000,
    ttlMs: 60000,
    replayable: true,
    requireAck: false
  },
  alerts: {
    enabled: true,
    mode: "sound_system",
    soundKey: "vip30",
    category: "vip",
    durationMs: 9000,
    designPending: true
  },
  textStyle: {
    category: "vip30",
    style: "CGN/Altersheim/Rentner",
    dashboardVariants: true
  },
  twitch: {
    liveActionsEnabled: false,
    capabilityCheckEnabled: true,
    authValidateUrl: "/api/twitch/auth/validate",
    requiredScopes: ["channel:manage:redemptions", "channel:manage:vips"],
    optionalScopes: ["channel:read:vips"],
    requireTokenUserMatchesBroadcaster: true
  }
};

const TABLES = [
  {
    name: "vip30_slots",
    createTableSql: `CREATE TABLE IF NOT EXISTS vip30_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  user_login TEXT,
  user_display_name TEXT,
  avatar_url TEXT,
  start_utc TEXT,
  end_utc TEXT,
  status TEXT,
  twitch_reward_id TEXT,
  twitch_redemption_id TEXT,
  source TEXT,
  created_at TEXT,
  updated_at TEXT,
  revoked_at TEXT,
  last_error TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_vip30_slots_user_id ON vip30_slots(user_id);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_slots_user_login ON vip30_slots(user_login);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_slots_status ON vip30_slots(status);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_slots_end_utc ON vip30_slots(end_utc);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_slots_redemption ON vip30_slots(twitch_redemption_id);"
    ]
  },
  {
    name: "vip30_log",
    createTableSql: `CREATE TABLE IF NOT EXISTS vip30_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT,
  user_id TEXT,
  user_login TEXT,
  user_display_name TEXT,
  twitch_reward_id TEXT,
  twitch_redemption_id TEXT,
  slot_id INTEGER,
  success INTEGER,
  reason TEXT,
  message TEXT,
  error_code TEXT,
  error_message TEXT,
  payload_json TEXT,
  created_at TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_vip30_log_created_at ON vip30_log(created_at);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_log_event_type ON vip30_log(event_type);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_log_user_login ON vip30_log(user_login);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_log_redemption ON vip30_log(twitch_redemption_id);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_log_success ON vip30_log(success);"
    ]
  }
];

let loadedConfig = null;
let bus = null;
let startedAt = "";
let registeredAtBus = false;
let heartbeatTimer = null;
let statusTimer = null;
let lastBusRegisterAt = "";
let lastBusHeartbeatAt = "";
let lastBusStatusAt = "";
let lastError = "";
let lastCapabilityCheck = null;
let dbMigrationState = {
  attempted: false,
  executed: false,
  ok: false,
  reason: "not_started",
  schemaVersionBefore: 0,
  schemaVersionAfter: 0,
  targetVersion: SCHEMA_TARGET_VERSION,
  lastRunAt: "",
  lastError: "",
  createdTables: [],
  createdIndexes: []
};
let runtimeStats = {
  statusRequests: 0,
  slotsRequests: 0,
  logsRequests: 0,
  statsRequests: 0,
  healthRequests: 0,
  capabilityRequests: 0,
  busHeartbeats: 0,
  busStatuses: 0,
  logWrites: 0,
  lastLogAt: "",
  lastAction: ""
};

function nowIso() { return new Date().toISOString(); }
function cleanString(value, fallback = "") { const clean = String(value ?? "").trim(); return clean || fallback; }
function intValue(value, fallback = 0) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}
function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(raw)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(raw)) return false;
  return fallback;
}
function boolDb(value) { return value === true || value === 1 || value === "1" ? 1 : 0; }
function safeJsonString(value, fallback = {}) {
  try { return JSON.stringify(value === undefined ? fallback : value); } catch (_) { return JSON.stringify(fallback); }
}
function safeJsonParse(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function mergePlain(base, extra) {
  const out = { ...(base || {}) };
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = mergePlain(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function arrayOfStrings(value) {
  if (Array.isArray(value)) return value.map(item => cleanString(item)).filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return String(value).split(/[\s,;]+/).map(item => cleanString(item)).filter(Boolean);
}

function loadConfig() {
  const loaded = helperConfig.loadConfig("vip30.json", {}, { createIfMissing: false });
  loadedConfig = mergePlain(DEFAULT_CONFIG, loaded && loaded.data && typeof loaded.data === "object" ? loaded.data : {});
  loadedConfig.slots.maxSlots = Math.max(1, intValue(loadedConfig.slots && loadedConfig.slots.maxSlots, DEFAULT_CONFIG.slots.maxSlots));
  loadedConfig.slots.durationDays = Math.max(1, intValue(loadedConfig.slots && loadedConfig.slots.durationDays, DEFAULT_CONFIG.slots.durationDays));
  loadedConfig.reward.cost = Math.max(1, intValue(loadedConfig.reward && loadedConfig.reward.cost, DEFAULT_CONFIG.reward.cost));
  loadedConfig.bus.heartbeatIntervalMs = Math.max(1000, Math.min(60000, intValue(loadedConfig.bus && loadedConfig.bus.heartbeatIntervalMs, DEFAULT_CONFIG.bus.heartbeatIntervalMs)));
  loadedConfig.bus.statusPublishIntervalMs = Math.max(5000, Math.min(300000, intValue(loadedConfig.bus && loadedConfig.bus.statusPublishIntervalMs, DEFAULT_CONFIG.bus.statusPublishIntervalMs)));
  loadedConfig.logging.recentLimit = Math.max(1, Math.min(200, intValue(loadedConfig.logging && loadedConfig.logging.recentLimit, DEFAULT_CONFIG.logging.recentLimit)));
  loadedConfig.twitch.requiredScopes = arrayOfStrings(loadedConfig.twitch && loadedConfig.twitch.requiredScopes).length ? arrayOfStrings(loadedConfig.twitch.requiredScopes) : [...DEFAULT_CONFIG.twitch.requiredScopes];
  loadedConfig.twitch.optionalScopes = arrayOfStrings(loadedConfig.twitch && loadedConfig.twitch.optionalScopes);
  loadedConfig.twitch.authValidateUrl = cleanString(loadedConfig.twitch && loadedConfig.twitch.authValidateUrl, DEFAULT_CONFIG.twitch.authValidateUrl);
  return loadedConfig;
}
function getConfig() { return loadedConfig || loadConfig(); }

function getBus() {
  if (bus) return bus;
  if (!communicationBus || typeof communicationBus.getBus !== "function") return null;
  bus = communicationBus.getBus();
  return bus;
}
function ensureDbReady() { database.ensureReady(); return true; }
function tableExists(tableName) { try { return database.tableExists(tableName); } catch (_) { return false; } }
function tableCount(tableName) { try { return database.count(tableName); } catch (_) { return 0; } }

function migrateDatabase(reason = "init") {
  ensureDbReady();
  const before = database.getSchemaVersion(MODULE_NAME);
  const state = {
    attempted: true,
    executed: false,
    ok: false,
    reason,
    schemaVersionBefore: before,
    schemaVersionAfter: before,
    targetVersion: SCHEMA_TARGET_VERSION,
    lastRunAt: nowIso(),
    lastError: "",
    createdTables: TABLES.map(table => table.name),
    createdIndexes: TABLES.flatMap(table => table.createIndexSql || [])
  };
  try {
    database.ensureSchema(MODULE_NAME, SCHEMA_TARGET_VERSION, (_fromVersion, toVersion) => {
      if (toVersion !== 1) return;
      for (const table of TABLES) {
        database.exec(table.createTableSql);
        for (const sql of table.createIndexSql || []) database.exec(sql);
      }
    });
    state.executed = before < SCHEMA_TARGET_VERSION;
    state.ok = true;
    state.schemaVersionAfter = database.getSchemaVersion(MODULE_NAME);
    dbMigrationState = state;
    return dbMigrationState;
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    dbMigrationState = state;
    lastError = state.lastError;
    throw err;
  }
}

function mapSlotRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || "",
    avatarUrl: row.avatar_url || "",
    startUtc: row.start_utc || "",
    endUtc: row.end_utc || "",
    status: row.status || "",
    twitchRewardId: row.twitch_reward_id || "",
    twitchRedemptionId: row.twitch_redemption_id || "",
    source: row.source || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    revokedAt: row.revoked_at || "",
    lastError: row.last_error || ""
  };
}
function mapLogRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    eventType: row.event_type || "",
    userId: row.user_id || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || "",
    twitchRewardId: row.twitch_reward_id || "",
    twitchRedemptionId: row.twitch_redemption_id || "",
    slotId: row.slot_id || null,
    success: Number(row.success || 0) === 1,
    reason: row.reason || "",
    message: row.message || "",
    errorCode: row.error_code || "",
    errorMessage: row.error_message || "",
    payload: safeJsonParse(row.payload_json, {}),
    createdAt: row.created_at || ""
  };
}

function writeLog(eventType, data = {}) {
  const config = getConfig();
  if (!config.logging || config.logging.enabled === false) return { ok: false, skipped: true, reason: "logging_disabled" };
  ensureDbReady();
  const now = nowIso();
  const params = {
    event_type: cleanString(eventType, "event"),
    user_id: cleanString(data.userId || data.user_id || ""),
    user_login: cleanString(data.userLogin || data.user_login || "").toLowerCase(),
    user_display_name: cleanString(data.userDisplayName || data.user_display_name || ""),
    twitch_reward_id: cleanString(data.twitchRewardId || data.twitch_reward_id || ""),
    twitch_redemption_id: cleanString(data.twitchRedemptionId || data.twitch_redemption_id || ""),
    slot_id: data.slotId || data.slot_id || null,
    success: boolDb(data.success === true),
    reason: cleanString(data.reason || ""),
    message: cleanString(data.message || ""),
    error_code: cleanString(data.errorCode || data.error_code || ""),
    error_message: cleanString(data.errorMessage || data.error_message || ""),
    payload_json: safeJsonString(data.payload || {}, {}),
    created_at: now
  };
  const result = database.run(`
    INSERT INTO vip30_log
      (event_type, user_id, user_login, user_display_name, twitch_reward_id, twitch_redemption_id, slot_id, success, reason, message, error_code, error_message, payload_json, created_at)
    VALUES
      (:event_type, :user_id, :user_login, :user_display_name, :twitch_reward_id, :twitch_redemption_id, :slot_id, :success, :reason, :message, :error_code, :error_message, :payload_json, :created_at)
  `, params);
  runtimeStats.logWrites += 1;
  runtimeStats.lastLogAt = now;
  runtimeStats.lastAction = params.event_type;
  return { ok: true, id: result && result.lastInsertRowid || null, createdAt: now };
}

function listSlots(query = {}) {
  ensureDbReady();
  const status = cleanString(query.status || "");
  const userLogin = cleanString(query.user || query.user_login || "").toLowerCase();
  const limit = Math.max(1, Math.min(500, intValue(query.limit, 100)));
  const rows = database.all(`
    SELECT * FROM vip30_slots
    WHERE (:status = '' OR status = :status)
      AND (:userLogin = '' OR user_login = :userLogin)
    ORDER BY COALESCE(end_utc, created_at) ASC, id ASC
    LIMIT :limit
  `, { status, userLogin, limit }) || [];
  return rows.map(mapSlotRow);
}
function listLogs(query = {}) {
  ensureDbReady();
  const eventType = cleanString(query.eventType || query.event_type || "");
  const userLogin = cleanString(query.user || query.user_login || "").toLowerCase();
  const successRaw = query.success;
  const hasSuccess = successRaw !== undefined && successRaw !== null && successRaw !== "";
  const success = hasSuccess ? boolDb(String(successRaw).toLowerCase() !== "false" && String(successRaw) !== "0") : 0;
  const limit = Math.max(1, Math.min(500, intValue(query.limit, getConfig().logging.recentLimit)));
  const rows = database.all(`
    SELECT * FROM vip30_log
    WHERE (:eventType = '' OR event_type = :eventType)
      AND (:userLogin = '' OR user_login = :userLogin)
      AND (:hasSuccess = 0 OR success = :success)
    ORDER BY created_at DESC, id DESC
    LIMIT :limit
  `, { eventType, userLogin, hasSuccess: hasSuccess ? 1 : 0, success, limit }) || [];
  return rows.map(mapLogRow);
}

function buildRewardSummary() {
  const reward = getConfig().reward || DEFAULT_CONFIG.reward;
  return {
    rewardKey: cleanString(reward.rewardKey || reward.reward_key || "vip30"),
    title: cleanString(reward.title || "30 Tage VIP"),
    cost: Math.max(1, intValue(reward.cost, 50000)),
    categoryKey: cleanString(reward.categoryKey || reward.category_key || "vip"),
    actionType: cleanString(reward.actionType || reward.action_type || "vip30"),
    actionKey: cleanString(reward.actionKey || reward.action_key || "vip30.redeem"),
    autoFulfill: reward.autoFulfill === true || reward.auto_fulfill === true
  };
}

function buildStats() {
  ensureDbReady();
  const now = nowIso();
  const slotCounts = database.get(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status = 'revoke_pending' THEN 1 ELSE 0 END) AS revoke_pending,
      SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) AS revoked,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM vip30_slots
  `) || {};
  const logCounts = database.get(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS unsuccessful,
      SUM(CASE WHEN error_message IS NOT NULL AND error_message <> '' THEN 1 ELSE 0 END) AS with_errors
    FROM vip30_log
  `) || {};
  const eventRows = database.all("SELECT event_type, COUNT(*) AS count FROM vip30_log GROUP BY event_type ORDER BY count DESC, event_type ASC") || [];
  const nextExpiry = database.get("SELECT end_utc FROM vip30_slots WHERE status = 'active' AND end_utc > :now ORDER BY end_utc ASC LIMIT 1", { now }) || {};
  const active = Number(slotCounts.active || 0);
  const maxSlots = getConfig().slots.maxSlots;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    generatedAt: now,
    reward: buildRewardSummary(),
    slots: {
      max: maxSlots,
      active,
      free: Math.max(0, maxSlots - active),
      total: Number(slotCounts.total || 0),
      revokePending: Number(slotCounts.revoke_pending || 0),
      revoked: Number(slotCounts.revoked || 0),
      failed: Number(slotCounts.failed || 0),
      cancelled: Number(slotCounts.cancelled || 0),
      nextExpiry: nextExpiry.end_utc || ""
    },
    logs: {
      total: Number(logCounts.total || 0),
      successful: Number(logCounts.successful || 0),
      unsuccessful: Number(logCounts.unsuccessful || 0),
      withErrors: Number(logCounts.with_errors || 0),
      byEventType: eventRows.map(row => ({ eventType: row.event_type || "", count: Number(row.count || 0) }))
    },
    runtime: { ...runtimeStats }
  };
}

function httpGetJson(targetUrl) {
  const cleanUrl = cleanString(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error("target_url_missing"));
  const options = {
    hostname: process.env.VIP30_TARGET_HOST || process.env.CHANNELPOINTS_TARGET_HOST || DEFAULT_TARGET_HOST,
    port: Number(process.env.VIP30_TARGET_PORT || process.env.CHANNELPOINTS_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`,
    method: "GET",
    headers: { Accept: "application/json" }
  };
  return new Promise((resolve, reject) => {
    const request = http.request(options, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, statusCode: response.statusCode, data: parsed });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

function normalizeScopes(input) {
  return arrayOfStrings(input).map(scope => scope.toLowerCase());
}
function hasScope(scopes, requiredScope) {
  return normalizeScopes(scopes).includes(cleanString(requiredScope).toLowerCase());
}
function buildScopeRows(scopes, requiredScopes, optionalScopes = []) {
  const normalized = normalizeScopes(scopes);
  return {
    required: requiredScopes.map(scope => ({ scope, present: normalized.includes(scope.toLowerCase()) })),
    optional: optionalScopes.map(scope => ({ scope, present: normalized.includes(scope.toLowerCase()) }))
  };
}
function summarizeAuthPayload(authPayload = {}) {
  const scopes = arrayOfStrings(authPayload.scopes || authPayload.scope || []);
  const broadcasterId = cleanString(authPayload.broadcasterId || process.env.TWITCH_BROADCASTER_ID || "");
  const userId = cleanString(authPayload.userId || authPayload.user_id || "");
  const broadcasterMatchRelevant = Boolean(broadcasterId && userId);
  const tokenUserMatchesBroadcaster = broadcasterMatchRelevant ? broadcasterId === userId : authPayload.tokenUserMatchesBroadcaster === true;
  return {
    ok: authPayload.ok === true,
    present: authPayload.present === true || authPayload.ok === true,
    login: cleanString(authPayload.login || ""),
    userId,
    broadcasterId,
    broadcasterMatchRelevant,
    tokenUserMatchesBroadcaster,
    scopes,
    expiresIn: Number(authPayload.expiresIn || 0),
    store: cleanString(authPayload.store || authPayload.tokenStorePath || ""),
    error: authPayload.ok === true ? "" : cleanString(authPayload.error || authPayload.message || "auth_validate_not_ok")
  };
}

async function buildTwitchCapabilityStatus(options = {}) {
  const config = getConfig();
  const now = nowIso();
  const requiredScopes = arrayOfStrings(config.twitch.requiredScopes || DEFAULT_CONFIG.twitch.requiredScopes);
  const optionalScopes = arrayOfStrings(config.twitch.optionalScopes || DEFAULT_CONFIG.twitch.optionalScopes);
  const base = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "twitch_capability_check",
    checkedAt: now,
    enabled: config.twitch.capabilityCheckEnabled !== false,
    authValidateUrl: cleanString(config.twitch.authValidateUrl || DEFAULT_CONFIG.twitch.authValidateUrl),
    liveActionsEnabled: config.twitch.liveActionsEnabled === true,
    requiredScopes,
    optionalScopes,
    safety: {
      checkOnly: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noVipRevoke: true,
      noRedemptionFulfillCancel: true
    }
  };

  if (config.twitch.capabilityCheckEnabled === false) {
    const disabled = {
      ...base,
      ok: true,
      status: "disabled_by_config",
      auth: { ok: false, skipped: true, reason: "capability_check_disabled" },
      scopes: buildScopeRows([], requiredScopes, optionalScopes),
      readiness: { readyForVip30LiveFlow: false, reason: "capability_check_disabled" }
    };
    lastCapabilityCheck = disabled;
    return disabled;
  }

  try {
    const response = await httpGetJson(base.authValidateUrl);
    const authPayload = response && response.data && typeof response.data === "object" ? response.data : { ok: false, raw: response ? response.data : null };
    const auth = summarizeAuthPayload(authPayload);
    const scopeRows = buildScopeRows(auth.scopes, requiredScopes, optionalScopes);
    const missingScopes = scopeRows.required.filter(row => !row.present).map(row => row.scope);
    const tokenOk = response.ok === true && auth.ok === true;
    const requireBroadcasterMatch = boolValue(config.twitch.requireTokenUserMatchesBroadcaster, true);
    const broadcasterOk = !requireBroadcasterMatch || !auth.broadcasterMatchRelevant || auth.tokenUserMatchesBroadcaster === true;
    const readyForVip30LiveFlow = tokenOk && missingScopes.length === 0 && broadcasterOk;
    const result = {
      ...base,
      ok: true,
      status: readyForVip30LiveFlow ? "ready_for_vip30_live_flow" : "missing_capability",
      auth: {
        ...auth,
        httpStatus: response.statusCode || 0,
        tokenOk,
        requireTokenUserMatchesBroadcaster: requireBroadcasterMatch,
        broadcasterOk
      },
      scopes: scopeRows,
      readiness: {
        readyForVip30LiveFlow,
        readyForAddVip: tokenOk && hasScope(auth.scopes, "channel:manage:vips") && broadcasterOk,
        readyForRemoveVip: tokenOk && hasScope(auth.scopes, "channel:manage:vips") && broadcasterOk,
        readyForRedemptionFulfillCancel: tokenOk && hasScope(auth.scopes, "channel:manage:redemptions") && broadcasterOk,
        missingScopes,
        blocker: readyForVip30LiveFlow ? "" : (!tokenOk ? "token_not_valid" : (missingScopes.length ? "missing_required_scopes" : "token_user_broadcaster_mismatch"))
      }
    };
    lastCapabilityCheck = result;
    emitTwitchCapabilityEvent(result, options.reason || "manual_check");
    return result;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    const result = {
      ...base,
      ok: false,
      status: "capability_check_failed",
      auth: { ok: false, present: false, error: message },
      scopes: buildScopeRows([], requiredScopes, optionalScopes),
      readiness: { readyForVip30LiveFlow: false, blocker: "auth_validate_request_failed", missingScopes: requiredScopes },
      error: message
    };
    lastCapabilityCheck = result;
    lastError = message;
    emitTwitchCapabilityEvent(result, options.reason || "manual_check_failed");
    return result;
  }
}

function emitTwitchCapabilityEvent(result, reason = "capability_check") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return currentBus.emit({
      type: "event",
      channel: "vip30.twitch",
      action: result && result.readiness && result.readiness.readyForVip30LiveFlow ? "capability.ready" : "capability.missing",
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        reason,
        checkedAt: result && result.checkedAt || nowIso(),
        status: result && result.status || "unknown",
        readiness: result && result.readiness || null,
        auth: result && result.auth ? {
          ok: result.auth.ok === true,
          login: result.auth.login || "",
          userId: result.auth.userId || "",
          broadcasterId: result.auth.broadcasterId || "",
          tokenUserMatchesBroadcaster: result.auth.tokenUserMatchesBroadcaster === true
        } : null
      },
      meta: { requireAck: false, replayable: true, ttlMs: config.bus.ttlMs, productionTarget: true }
    });
  } catch (_) {
    return { ok: false, reason: "bus_emit_failed" };
  }
}

function buildHealth() {
  const stats = buildStats();
  const capability = lastCapabilityCheck ? {
    checkedAt: lastCapabilityCheck.checkedAt || "",
    status: lastCapabilityCheck.status || "",
    readyForVip30LiveFlow: !!(lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.readyForVip30LiveFlow),
    blocker: lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.blocker || ""
  } : { checkedAt: "", status: "not_checked", readyForVip30LiveFlow: false, blocker: "not_checked" };
  return {
    ok: !lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: getConfig().enabled !== false,
    status: lastError ? "error" : "ready_step2_capability_check",
    lastError,
    checks: {
      databaseReady: dbMigrationState.ok === true,
      schemaReady: database.getSchemaVersion(MODULE_NAME) >= SCHEMA_TARGET_VERSION,
      busRegistered: registeredAtBus,
      dashboardLoggingReady: tableExists("vip30_log"),
      slotsTableReady: tableExists("vip30_slots"),
      twitchCapabilityCheckAvailable: getConfig().twitch.capabilityCheckEnabled !== false,
      twitchLiveActionsEnabled: getConfig().twitch.liveActionsEnabled === true
    },
    twitchCapability: capability,
    stats: stats.slots
  };
}

function buildStatus() {
  const config = getConfig();
  const stats = buildStats();
  const recentLogs = listLogs({ limit: config.logging.recentLimit });
  const currentBus = getBus();
  let busStatus = null;
  try { busStatus = currentBus && typeof currentBus.getStatus === "function" ? currentBus.getStatus() : null; } catch (_) { busStatus = null; }
  return {
    ok: !lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    enabled: config.enabled !== false,
    status: lastError ? "error" : "ready_step2_twitch_capability_check",
    startedAt,
    routePrefix: ROUTE_PREFIX,
    routeCount: 7,
    routes: [
      `${ROUTE_PREFIX}/status`,
      `${ROUTE_PREFIX}/health`,
      `${ROUTE_PREFIX}/slots`,
      `${ROUTE_PREFIX}/logs`,
      `${ROUTE_PREFIX}/stats`,
      `${ROUTE_PREFIX}/twitch/capability`,
      `${ROUTE_PREFIX}/twitch/scopes`
    ],
    reward: buildRewardSummary(),
    config: {
      maxSlots: config.slots.maxSlots,
      durationDays: config.slots.durationDays,
      loggingEnabled: config.logging.enabled !== false,
      dashboardEnabled: config.dashboard.enabled !== false,
      alertsMode: config.alerts.mode,
      textStyle: config.textStyle.style,
      twitchLiveActionsEnabled: config.twitch.liveActionsEnabled === true,
      twitchCapabilityCheckEnabled: config.twitch.capabilityCheckEnabled !== false,
      twitchAuthValidateUrl: config.twitch.authValidateUrl,
      twitchRequiredScopes: [...config.twitch.requiredScopes]
    },
    database: {
      adapter: database.getAdapter ? database.getAdapter() : "sqlite",
      dialect: database.getDialect ? database.getDialect() : "sqlite",
      family: database.getDatabaseFamily ? database.getDatabaseFamily() : "sqlite",
      path: database.getDbPath ? database.getDbPath() : null,
      schemaVersion: database.getSchemaVersion(MODULE_NAME),
      targetVersion: SCHEMA_TARGET_VERSION,
      migration: { ...dbMigrationState },
      tables: TABLES.map(table => ({ name: table.name, exists: tableExists(table.name), count: tableExists(table.name) ? tableCount(table.name) : 0 }))
    },
    bus: {
      enabled: config.bus.enabled !== false,
      registered: registeredAtBus,
      lastRegisterAt: lastBusRegisterAt,
      lastHeartbeatAt: lastBusHeartbeatAt,
      lastStatusAt: lastBusStatusAt,
      heartbeatCount: runtimeStats.busHeartbeats,
      statusCount: runtimeStats.busStatuses,
      core: busStatus ? { ok: busStatus.ok === true, bus: busStatus.bus, version: busStatus.version, stats: busStatus.stats || null } : null
    },
    twitchCapability: lastCapabilityCheck ? {
      checkedAt: lastCapabilityCheck.checkedAt || "",
      status: lastCapabilityCheck.status || "",
      readyForVip30LiveFlow: !!(lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.readyForVip30LiveFlow),
      missingScopes: lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.missingScopes || [],
      blocker: lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.blocker || ""
    } : { checkedAt: "", status: "not_checked", readyForVip30LiveFlow: false, missingScopes: config.twitch.requiredScopes, blocker: "not_checked" },
    slots: stats.slots,
    stats: stats.logs,
    logging: {
      enabled: config.logging.enabled !== false,
      storage: "sqlite",
      table: "vip30_log",
      serverLogNormalEvents: false,
      recentEventsAvailable: true,
      lastEventAt: runtimeStats.lastLogAt,
      lastError,
      recentEvents: recentLogs
    },
    safety: {
      step: "VIP30-STEP2",
      noStreamerBot: true,
      noLegacyImport: true,
      noTwitchWriteInThisStep: true,
      noVipGrantInThisStep: true,
      noRedemptionFulfillCancelInThisStep: true,
      dashboardLoggingInsteadOfServerLog: true,
      additiveOnly: true
    }
  };
}

function publishStatus(reason = "updated") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.publishModuleStatus !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    const result = currentBus.publishModuleStatus(MODULE_NAME, buildStatus(), {
      action: "updated",
      replayable: config.bus.replayable !== false,
      requireAck: config.bus.requireAck === true,
      ttlMs: config.bus.ttlMs,
      reason
    });
    runtimeStats.busStatuses += 1;
    lastBusStatusAt = nowIso();
    return result || { ok: true };
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: lastError };
  }
}
function heartbeat(reason = "heartbeat") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.heartbeatModule !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    const stats = buildStats();
    const payload = {
      module: MODULE_NAME,
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      phase: config.enabled === false ? "disabled" : "ready_step2",
      reason,
      enabled: config.enabled !== false,
      healthy: !lastError,
      lastError,
      dbReady: dbMigrationState.ok === true,
      activeSlots: stats.slots.active,
      freeSlots: stats.slots.free,
      twitchCapability: lastCapabilityCheck ? {
        status: lastCapabilityCheck.status || "",
        readyForVip30LiveFlow: !!(lastCapabilityCheck.readiness && lastCapabilityCheck.readiness.readyForVip30LiveFlow),
        checkedAt: lastCapabilityCheck.checkedAt || ""
      } : { status: "not_checked", readyForVip30LiveFlow: false, checkedAt: "" }
    };
    const result = currentBus.heartbeatModule(MODULE_NAME, payload);
    runtimeStats.busHeartbeats += 1;
    lastBusHeartbeatAt = nowIso();
    return result || { ok: true };
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: lastError };
  }
}
function registerAtBus() {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.registerModule !== "function") return { ok: false, reason: "bus_unavailable" };
  const result = currentBus.registerModule({
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    name: "30 Tage VIP",
    version: MODULE_VERSION,
    capabilities: [
      "vip30.status",
      "vip30.slots",
      "vip30.logs",
      "vip30.stats",
      "vip30.twitch.capability",
      "vip30.cleanup.planned",
      "vip30.redeem.planned"
    ],
    meta: {
      build: MODULE_BUILD,
      routePrefix: ROUTE_PREFIX,
      heartbeat: true,
      dashboardLogging: true,
      noStreamerBot: true,
      noLegacyImport: true,
      noTwitchWriteInStep2: true,
      capabilityCheckOnly: true
    }
  });
  registeredAtBus = result && result.ok === true;
  lastBusRegisterAt = nowIso();
  publishStatus("registered");
  heartbeat("registered");
  return result;
}
function startBusTimers() {
  const config = getConfig();
  if (config.bus.enabled === false) return;
  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => heartbeat("interval"), config.bus.heartbeatIntervalMs);
    if (heartbeatTimer && typeof heartbeatTimer.unref === "function") heartbeatTimer.unref();
  }
  if (!statusTimer) {
    statusTimer = setInterval(() => publishStatus("interval"), config.bus.statusPublishIntervalMs);
    if (statusTimer && typeof statusTimer.unref === "function") statusTimer.unref();
  }
}

function init({ app } = {}) {
  loadConfig();
  startedAt = nowIso();
  try {
    migrateDatabase("init");
    registerAtBus();
    startBusTimers();
    publishStatus("init_ready");
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
    console.error(`[${MODULE_NAME}] critical init error: ${lastError}`);
  }

  if (app && typeof app.get === "function") {
    app.get(`${ROUTE_PREFIX}/status`, (_req, res) => {
      runtimeStats.statusRequests += 1;
      runtimeStats.lastAction = "status";
      res.json(buildStatus());
    });
    app.get(`${ROUTE_PREFIX}/health`, (_req, res) => {
      runtimeStats.healthRequests += 1;
      runtimeStats.lastAction = "health";
      res.json(buildHealth());
    });
    app.get(`${ROUTE_PREFIX}/slots`, (req, res) => {
      runtimeStats.slotsRequests += 1;
      runtimeStats.lastAction = "slots";
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, slots: listSlots(req.query || {}) });
    });
    app.get(`${ROUTE_PREFIX}/logs`, (req, res) => {
      runtimeStats.logsRequests += 1;
      runtimeStats.lastAction = "logs";
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, logs: listLogs(req.query || {}) });
    });
    app.get(`${ROUTE_PREFIX}/stats`, (_req, res) => {
      runtimeStats.statsRequests += 1;
      runtimeStats.lastAction = "stats";
      res.json(buildStats());
    });
    app.get(`${ROUTE_PREFIX}/twitch/capability`, async (req, res) => {
      runtimeStats.capabilityRequests += 1;
      runtimeStats.lastAction = "twitch_capability";
      const result = await buildTwitchCapabilityStatus({ reason: cleanString(req.query && req.query.reason || "api") });
      publishStatus("twitch_capability_checked");
      res.json(result);
    });
    app.get(`${ROUTE_PREFIX}/twitch/scopes`, (_req, res) => {
      runtimeStats.capabilityRequests += 1;
      runtimeStats.lastAction = "twitch_scopes";
      const config = getConfig();
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        requiredScopes: arrayOfStrings(config.twitch.requiredScopes),
        optionalScopes: arrayOfStrings(config.twitch.optionalScopes),
        usage: {
          "channel:manage:redemptions": "Redemption nach erfolgreicher VIP-Vergabe fulfillen oder bei Ablehnung canceln.",
          "channel:manage:vips": "VIP setzen und nach Ablauf wieder entfernen.",
          "channel:read:vips": "Optional: bestehende VIPs lesen/pruefen; manage:vips deckt die Live-Aktionen ab."
        },
        safety: { checkOnly: true, noTwitchWrite: true }
      });
    });
  }

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} active (${MODULE_BUILD})`);
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  buildStatus,
  buildHealth,
  buildStats,
  buildTwitchCapabilityStatus,
  listSlots,
  listLogs,
  writeLog
};
