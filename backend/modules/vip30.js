"use strict";

const http = require("http");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "vip30";
const MODULE_VERSION = "0.6.0";
const MODULE_BUILD = "step6-channelpoints-decision-bridge-internal";
const ROUTE_PREFIX = "/api/vip30";
const SCHEMA_TARGET_VERSION = 2;
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
  description: "30 Tage VIP Node-Modul: SQLite-Grundlage, Dashboard-Logs/Stats, Communication-Bus, DB-/Dashboard-Config, Twitch-Capability-Check, Channelpoints-Reward-Link, Dry-Run-Redemption-Decision und Channelpoints-Decision-Bridge intern im VIP30-Modul ohne Live-Schreibaktion.",
  bus: {
    registered: true,
    heartbeat: true,
    emits: ["module.status", "module.health", "vip30.status", "vip30.twitch", "vip30.channelpoints", "vip30.redeem", "vip30.bridge"],
    listens: ["channelpoints.redemption"]
  },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  moduleVersion: MODULE_VERSION,
  reward: {
    rewardKey: "vip30",
    title: "30 Tage VIP",
    cost: 40000,
    categoryKey: "vip",
    actionType: "vip30",
    actionKey: "vip30.redeem",
    autoFulfill: false
  },
  channelpoints: {
    enabled: true,
    rewardSyncEnabled: true,
    requireConfirmForEnsure: true,
    createCategoryIfMissing: true,
    categoryLabel: "VIP",
    categoryDescription: "VIP- und Community-Belohnungen",
    categorySortOrder: 70,
    rewardSortOrder: 300,
    systemEnabled: true,
    twitchIsEnabled: false,
    isPaused: false,
    requireUserInput: false,
    inputLabel: "",
    queueMode: "vip30",
    priority: 80,
    cooldownSeconds: 0,
    maxPerStream: 0,
    maxPerUserPerStream: 0,
    notes: "VIP30-Reward wird vom VIP30-Modul verwaltet. Twitch bleibt bis zum Live-Step inaktiv.",
    twitchPolicies: {
      shouldRedemptionsSkipRequestQueue: false,
      fulfillAfterSuccess: false,
      cancelOnFailure: false
    }
  },
  bridge: {
    enabled: true,
    decisionOnly: true,
    acceptTitleMatch: true,
    acceptRewardKeyMatch: true,
    acceptTwitchRewardIdMatch: true,
    requireLocalRewardLinked: true,
    duplicateWindowSize: 500
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
  settings: {
    dbEnabled: true,
    seedFromJsonOnMissing: true,
    jsonFallbackEnabled: true,
    dashboardWritable: true
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
  },
  {
    name: "vip30_settings",
    createTableSql: `CREATE TABLE IF NOT EXISTS vip30_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT,
  value_type TEXT,
  category TEXT,
  label TEXT,
  description TEXT,
  editable INTEGER,
  created_at TEXT,
  updated_at TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_vip30_settings_category ON vip30_settings(category);",
      "CREATE INDEX IF NOT EXISTS idx_vip30_settings_editable ON vip30_settings(editable);"
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
  settingsRequests: 0,
  settingsWrites: 0,
  dryRunRequests: 0,
  lastDryRunAt: "",
  lastDryRunDecision: null,
  bridgeDecisionRequests: 0,
  lastBridgeDecisionAt: "",
  lastBridgeDecision: null,
  lastSettingsWriteAt: "",
  busHeartbeats: 0,
  busStatuses: 0,
  logWrites: 0,
  lastLogAt: "",
  lastAction: ""
};

let bridgeSubscriptionId = "";
let bridgeSubscribed = false;
let bridgeLastEventAt = "";
let bridgeLastIgnoredAt = "";
let bridgeLastError = "";
let bridgeSeenIds = [];
const bridgeSeenSet = new Set();
let bridgeStats = {
  received: 0,
  ignored: 0,
  matched: 0,
  duplicates: 0,
  decisions: 0,
  errors: 0,
  emittedTests: 0,
  lastReason: "",
  lastRewardTitle: "",
  lastRewardId: "",
  lastUserLogin: ""
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
  let baseConfig = mergePlain(DEFAULT_CONFIG, loaded && loaded.data && typeof loaded.data === "object" ? loaded.data : {});
  const dbConfig = readSettingsConfigFromDbSafe();
  if (dbConfig && Object.keys(dbConfig).length) baseConfig = mergePlain(baseConfig, dbConfig);
  loadedConfig = baseConfig;
  loadedConfig.slots.maxSlots = Math.max(1, intValue(loadedConfig.slots && loadedConfig.slots.maxSlots, DEFAULT_CONFIG.slots.maxSlots));
  loadedConfig.slots.durationDays = Math.max(1, intValue(loadedConfig.slots && loadedConfig.slots.durationDays, DEFAULT_CONFIG.slots.durationDays));
  loadedConfig.reward.cost = Math.max(1, intValue(loadedConfig.reward && loadedConfig.reward.cost, DEFAULT_CONFIG.reward.cost));
  loadedConfig.channelpoints = mergePlain(DEFAULT_CONFIG.channelpoints, loadedConfig.channelpoints || {});
  loadedConfig.channelpoints.categoryKey = cleanString(loadedConfig.reward.categoryKey || loadedConfig.reward.category_key || DEFAULT_CONFIG.reward.categoryKey);
  loadedConfig.channelpoints.categoryLabel = cleanString(loadedConfig.channelpoints.categoryLabel, DEFAULT_CONFIG.channelpoints.categoryLabel);
  loadedConfig.channelpoints.rewardSortOrder = Math.max(0, intValue(loadedConfig.channelpoints.rewardSortOrder, DEFAULT_CONFIG.channelpoints.rewardSortOrder));
  loadedConfig.channelpoints.priority = Math.max(0, intValue(loadedConfig.channelpoints.priority, DEFAULT_CONFIG.channelpoints.priority));
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
    database.ensureSchema(MODULE_NAME, SCHEMA_TARGET_VERSION, () => {
      for (const table of TABLES) {
        database.exec(table.createTableSql);
        for (const sql of table.createIndexSql || []) database.exec(sql);
      }
    });
    seedSettingsFromConfigIfMissing("migration");
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


const SETTING_DEFINITIONS = [
  { key: "enabled", path: "enabled", type: "boolean", category: "general", label: "VIP30 aktiv", description: "Schaltet das VIP30-Modul fachlich aktiv/inaktiv.", editable: true },
  { key: "reward.title", path: "reward.title", type: "string", category: "reward", label: "Reward-Titel", description: "Titel der Kanalpunkte-Belohnung." , editable: true},
  { key: "reward.cost", path: "reward.cost", type: "integer", category: "reward", label: "Kosten", description: "Kosten der VIP30-Belohnung in Kanalpunkten.", editable: true },
  { key: "reward.prompt", path: "channelpoints.prompt", type: "string", category: "reward", label: "Reward-Beschreibung", description: "Prompt/Beschreibung im Kanalpunkte-System.", editable: true },
  { key: "slots.maxSlots", path: "slots.maxSlots", type: "integer", category: "slots", label: "Maximale Slots", description: "Maximale gleichzeitige VIP30-Slots.", editable: true },
  { key: "slots.durationDays", path: "slots.durationDays", type: "integer", category: "slots", label: "Laufzeit in Tagen", description: "Wie lange ein VIP30-Slot aktiv bleibt.", editable: true },
  { key: "channelpoints.rewardSyncEnabled", path: "channelpoints.rewardSyncEnabled", type: "boolean", category: "channelpoints", label: "Reward-Sync aktiv", description: "Lokalen VIP30-Reward in Channelpoints-Tabellen verwalten.", editable: true },
  { key: "channelpoints.twitchIsEnabled", path: "channelpoints.twitchIsEnabled", type: "boolean", category: "channelpoints", label: "Twitch sichtbar", description: "Ob der Reward später auf Twitch sichtbar/aktiv sein soll.", editable: true },
  { key: "bridge.enabled", path: "bridge.enabled", type: "boolean", category: "bridge", label: "Channelpoints-Bridge aktiv", description: "Echte Channelpoints-Redemptions im Decision-only Modus an VIP30 übergeben.", editable: true },
  { key: "bridge.decisionOnly", path: "bridge.decisionOnly", type: "boolean", category: "bridge", label: "Nur Entscheidung", description: "Bridge schreibt keine Slots und führt keine Twitch-Aktionen aus.", editable: true },
  { key: "bridge.acceptTitleMatch", path: "bridge.acceptTitleMatch", type: "boolean", category: "bridge", label: "Titel-Match erlauben", description: "VIP30-Reward auch anhand von Titel/Kosten erkennen, solange Twitch-ID noch fehlt.", editable: true },
  { key: "alerts.enabled", path: "alerts.enabled", type: "boolean", category: "alerts", label: "Alert aktiv", description: "Alert/Sound nach erfolgreicher Einlösung auslösen.", editable: true },
  { key: "alerts.soundKey", path: "alerts.soundKey", type: "string", category: "alerts", label: "Sound-Key", description: "Sound-System-Key für den VIP30-Alert.", editable: true },
  { key: "cleanup.enabled", path: "cleanup.enabled", type: "boolean", category: "cleanup", label: "Cleanup aktiv", description: "Ablauf-/Revoke-Logik für abgelaufene VIP30-Slots aktivieren.", editable: true },
  { key: "logging.enabled", path: "logging.enabled", type: "boolean", category: "logging", label: "Dashboard-Logging aktiv", description: "VIP30-Ereignisse in der DB speichern.", editable: true },
  { key: "twitch.liveActionsEnabled", path: "twitch.liveActionsEnabled", type: "boolean", category: "twitch", label: "Twitch-Live-Aktionen", description: "Späterer Sicherheitsschalter für echte Twitch-Schreibaktionen.", editable: true }
];

function getValueByPath(source, pathValue) {
  const parts = String(pathValue || "").split(".").filter(Boolean);
  let cur = source;
  for (const part of parts) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}
function setValueByPath(target, pathValue, value) {
  const parts = String(pathValue || "").split(".").filter(Boolean);
  if (!parts.length) return target;
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!cur[part] || typeof cur[part] !== "object" || Array.isArray(cur[part])) cur[part] = {};
    cur = cur[part];
  }
  cur[parts[parts.length - 1]] = value;
  return target;
}
function encodeSettingValue(value, type) {
  if (type === "boolean") return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true" ? "true" : "false";
  if (type === "integer") return String(Math.max(0, intValue(value, 0)));
  if (type === "json") return safeJsonString(value, {});
  return cleanString(value, "");
}
function decodeSettingValue(value, type) {
  if (type === "boolean") return boolValue(value, false);
  if (type === "integer") return intValue(value, 0);
  if (type === "json") return safeJsonParse(value, {});
  return cleanString(value, "");
}
function readSettingsRows() {
  ensureDbReady();
  if (!tableExists("vip30_settings")) return [];
  return database.all("SELECT * FROM vip30_settings ORDER BY category ASC, setting_key ASC") || [];
}
function mapSettingRow(row) {
  if (!row) return null;
  return {
    key: row.setting_key || "",
    value: decodeSettingValue(row.setting_value, row.value_type || "string"),
    rawValue: row.setting_value || "",
    type: row.value_type || "string",
    category: row.category || "",
    label: row.label || "",
    description: row.description || "",
    editable: Number(row.editable || 0) === 1,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}
function readSettingsConfigFromDbSafe() {
  try {
    if (!database || typeof database.tableExists !== "function") return {};
    database.ensureReady();
    if (!database.tableExists("vip30_settings")) return {};
    const rows = readSettingsRows();
    const out = {};
    for (const row of rows) {
      const def = SETTING_DEFINITIONS.find(item => item.key === row.setting_key);
      if (!def) continue;
      setValueByPath(out, def.path, decodeSettingValue(row.setting_value, row.value_type || def.type));
    }
    return out;
  } catch (_) {
    return {};
  }
}
function seedSettingsFromConfigIfMissing(reason = "seed") {
  ensureDbReady();
  if (!tableExists("vip30_settings")) return { ok: false, reason: "settings_table_missing" };
  const now = nowIso();
  let inserted = 0;
  const source = loadedConfig || mergePlain(DEFAULT_CONFIG, helperConfig.loadConfig("vip30.json", {}, { createIfMissing: false })?.data || {});
  for (const def of SETTING_DEFINITIONS) {
    const existing = database.get("SELECT setting_key FROM vip30_settings WHERE setting_key = :key", { key: def.key });
    if (existing) continue;
    const value = getValueByPath(source, def.path);
    database.run(`
      INSERT INTO vip30_settings
        (setting_key, setting_value, value_type, category, label, description, editable, created_at, updated_at)
      VALUES
        (:setting_key, :setting_value, :value_type, :category, :label, :description, :editable, :created_at, :updated_at)
    `, {
      setting_key: def.key,
      setting_value: encodeSettingValue(value === undefined ? getValueByPath(DEFAULT_CONFIG, def.path) : value, def.type),
      value_type: def.type,
      category: def.category,
      label: def.label,
      description: def.description,
      editable: def.editable === false ? 0 : 1,
      created_at: now,
      updated_at: now
    });
    inserted += 1;
  }
  return { ok: true, reason, inserted, totalDefinitions: SETTING_DEFINITIONS.length, seededAt: now };
}
function buildSettingsStatus() {
  ensureDbReady();
  const rows = readSettingsRows().map(mapSettingRow).filter(Boolean);
  const categories = [...new Set(rows.map(row => row.category).filter(Boolean))];
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "db_settings_ready",
    storage: "sqlite",
    table: "vip30_settings",
    jsonFallback: true,
    dashboardWritable: true,
    definitions: SETTING_DEFINITIONS.length,
    rows: rows.length,
    categories,
    settings: rows,
    effective: {
      reward: buildRewardSummary(),
      slots: { maxSlots: getConfig().slots.maxSlots, durationDays: getConfig().slots.durationDays },
      channelpoints: {
        rewardSyncEnabled: getConfig().channelpoints.rewardSyncEnabled !== false,
        twitchIsEnabled: getConfig().channelpoints.twitchIsEnabled === true
      },
      bridge: {
        enabled: getConfig().bridge && getConfig().bridge.enabled !== false,
        decisionOnly: !(getConfig().bridge && getConfig().bridge.decisionOnly === false),
        acceptTitleMatch: !(getConfig().bridge && getConfig().bridge.acceptTitleMatch === false)
      },
      alerts: { enabled: getConfig().alerts.enabled !== false, soundKey: getConfig().alerts.soundKey },
      cleanup: { enabled: getConfig().cleanup.enabled !== false },
      logging: { enabled: getConfig().logging.enabled !== false },
      twitch: { liveActionsEnabled: getConfig().twitch.liveActionsEnabled === true }
    },
    safety: {
      dbIsPrimary: true,
      jsonIsFallbackOnly: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noRedemptionFulfillCancel: true
    }
  };
}
function saveSettingsFromPayload(payload = {}) {
  ensureDbReady();
  if (!tableExists("vip30_settings")) throw new Error("settings_table_missing");
  const updates = payload && typeof payload === "object" && payload.settings && typeof payload.settings === "object" ? payload.settings : payload;
  const now = nowIso();
  const changed = [];
  const rejected = [];
  for (const [key, value] of Object.entries(updates || {})) {
    const def = SETTING_DEFINITIONS.find(item => item.key === key || item.path === key);
    if (!def) { rejected.push({ key, reason: "unknown_setting" }); continue; }
    if (def.editable === false) { rejected.push({ key, reason: "not_editable" }); continue; }
    const settingValue = encodeSettingValue(value, def.type);
    database.run(`
      INSERT INTO vip30_settings
        (setting_key, setting_value, value_type, category, label, description, editable, created_at, updated_at)
      VALUES
        (:setting_key, :setting_value, :value_type, :category, :label, :description, :editable, :created_at, :updated_at)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        value_type = excluded.value_type,
        category = excluded.category,
        label = excluded.label,
        description = excluded.description,
        editable = excluded.editable,
        updated_at = excluded.updated_at
    `, {
      setting_key: def.key,
      setting_value: settingValue,
      value_type: def.type,
      category: def.category,
      label: def.label,
      description: def.description,
      editable: def.editable === false ? 0 : 1,
      created_at: now,
      updated_at: now
    });
    changed.push({ key: def.key, path: def.path, value: decodeSettingValue(settingValue, def.type), type: def.type });
  }
  loadedConfig = null;
  loadConfig();
  runtimeStats.settingsWrites += 1;
  runtimeStats.lastSettingsWriteAt = now;
  runtimeStats.lastAction = "settings_save";
  writeLog("settings_updated", { success: true, reason: "dashboard_config", message: "VIP30 settings updated", payload: { changed, rejected } });
  publishStatus("settings_updated");
  return { ok: rejected.length === 0, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "settings_saved", changed, rejected, settings: buildSettingsStatus() };
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
    cost: Math.max(1, intValue(reward.cost, 40000)),
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


function tableColumnsSafe(tableName) {
  try { return database.tableColumns(tableName) || []; } catch (_) { return []; }
}

function channelpointsTablesReady() {
  return tableExists("channelpoints_categories") && tableExists("channelpoints_rewards");
}

function mapChannelpointsRewardRow(row) {
  if (!row) return null;
  return {
    id: row.id || null,
    rewardKey: row.reward_key || "",
    twitchRewardId: row.twitch_reward_id || "",
    title: row.title || "",
    prompt: row.prompt || "",
    cost: Number(row.cost || 0),
    categoryKey: row.category_key || "",
    sortOrder: Number(row.sort_order || 0),
    systemEnabled: Number(row.system_enabled || 0) === 1,
    twitchIsEnabled: Number(row.twitch_is_enabled || 0) === 1,
    isPaused: Number(row.is_paused || 0) === 1,
    requireUserInput: Number(row.require_user_input || 0) === 1,
    inputLabel: row.input_label || "",
    actionType: row.action_type || "",
    actionKey: row.action_key || "",
    actionPayload: safeJsonParse(row.action_payload_json, {}),
    mediaAssetId: row.media_asset_id || "",
    mediaRole: row.media_role || "",
    queueMode: row.queue_mode || "",
    priority: Number(row.priority || 0),
    cooldownSeconds: Number(row.cooldown_seconds || 0),
    maxPerStream: Number(row.max_per_stream || 0),
    maxPerUserPerStream: Number(row.max_per_user_per_stream || 0),
    autoFulfill: Number(row.auto_fulfill || 0) === 1,
    notes: row.notes || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function getChannelpointsRewardByKey(rewardKey = buildRewardSummary().rewardKey) {
  ensureDbReady();
  if (!channelpointsTablesReady()) return null;
  const row = database.get("SELECT * FROM channelpoints_rewards WHERE reward_key = :rewardKey", { rewardKey: cleanString(rewardKey) });
  return mapChannelpointsRewardRow(row);
}

function getChannelpointsCategory(categoryKey = buildRewardSummary().categoryKey) {
  ensureDbReady();
  if (!tableExists("channelpoints_categories")) return null;
  const row = database.get("SELECT * FROM channelpoints_categories WHERE category_key = :categoryKey", { categoryKey: cleanString(categoryKey) });
  if (!row) return null;
  return {
    id: row.id || null,
    categoryKey: row.category_key || "",
    label: row.label || "",
    description: row.description || "",
    sortOrder: Number(row.sort_order || 0),
    enabled: Number(row.enabled || 0) === 1,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function buildVip30RewardPayload() {
  const reward = buildRewardSummary();
  const cp = getConfig().channelpoints || DEFAULT_CONFIG.channelpoints;
  return {
    vip30: {
      managedBy: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      rewardKey: reward.rewardKey,
      action: reward.actionKey,
      durationDays: getConfig().slots.durationDays,
      maxSlots: getConfig().slots.maxSlots,
      step: "VIP30-STEP6",
      dryRunOnly: true,
      noTwitchWriteInThisStep: true,
      localChannelpointsRewardWriteOnly: true,
      dbDashboardConfig: true,
      dryRunDecisionFlow: true,
      channelpointsDecisionBridge: true,
      noVipGrantInThisStep: true,
      noRedemptionFulfillCancelInThisStep: true
    },
    twitch: {
      should_redemptions_skip_request_queue: boolValue(cp.twitchPolicies && cp.twitchPolicies.shouldRedemptionsSkipRequestQueue, false),
      fulfill_after_success: boolValue(cp.twitchPolicies && cp.twitchPolicies.fulfillAfterSuccess, false),
      cancel_on_failure: boolValue(cp.twitchPolicies && cp.twitchPolicies.cancelOnFailure, false)
    }
  };
}

function buildDesiredChannelpointsReward() {
  const reward = buildRewardSummary();
  const cp = getConfig().channelpoints || DEFAULT_CONFIG.channelpoints;
  return {
    reward_key: reward.rewardKey,
    twitch_reward_id: "",
    title: reward.title,
    prompt: "30 Tage VIP im CGN-Altersheim: Platz nehmen, Kissen richten, VIP-Schildchen abholen.",
    cost: reward.cost,
    category_key: reward.categoryKey,
    sort_order: intValue(cp.rewardSortOrder, 300),
    system_enabled: boolDb(boolValue(cp.systemEnabled, true)),
    twitch_is_enabled: 0,
    is_paused: boolDb(boolValue(cp.isPaused, false)),
    require_user_input: boolDb(boolValue(cp.requireUserInput, false)),
    input_label: cleanString(cp.inputLabel || ""),
    action_type: reward.actionType,
    action_key: reward.actionKey,
    action_payload_json: safeJsonString(buildVip30RewardPayload(), {}),
    media_asset_id: "",
    media_role: "none",
    queue_mode: cleanString(cp.queueMode || "vip30"),
    priority: intValue(cp.priority, 80),
    cooldown_seconds: intValue(cp.cooldownSeconds, 0),
    max_per_stream: intValue(cp.maxPerStream, 0),
    max_per_user_per_stream: intValue(cp.maxPerUserPerStream, 0),
    auto_fulfill: 0,
    notes: cleanString(cp.notes || "VIP30-Reward wird vom VIP30-Modul verwaltet. Twitch bleibt in STEP3 inaktiv.")
  };
}

function buildChannelpointsRewardDiff(existing, desired) {
  const fields = ["title", "cost", "categoryKey", "systemEnabled", "twitchIsEnabled", "isPaused", "actionType", "actionKey", "queueMode", "priority", "autoFulfill"];
  const desiredView = mapChannelpointsRewardRow({
    reward_key: desired.reward_key,
    twitch_reward_id: desired.twitch_reward_id,
    title: desired.title,
    prompt: desired.prompt,
    cost: desired.cost,
    category_key: desired.category_key,
    sort_order: desired.sort_order,
    system_enabled: desired.system_enabled,
    twitch_is_enabled: desired.twitch_is_enabled,
    is_paused: desired.is_paused,
    require_user_input: desired.require_user_input,
    input_label: desired.input_label,
    action_type: desired.action_type,
    action_key: desired.action_key,
    action_payload_json: desired.action_payload_json,
    media_asset_id: desired.media_asset_id,
    media_role: desired.media_role,
    queue_mode: desired.queue_mode,
    priority: desired.priority,
    cooldown_seconds: desired.cooldown_seconds,
    max_per_stream: desired.max_per_stream,
    max_per_user_per_stream: desired.max_per_user_per_stream,
    auto_fulfill: desired.auto_fulfill,
    notes: desired.notes
  });
  const differences = [];
  for (const field of fields) {
    if (JSON.stringify(existing ? existing[field] : undefined) !== JSON.stringify(desiredView ? desiredView[field] : undefined)) {
      differences.push({ field, current: existing ? existing[field] : null, desired: desiredView ? desiredView[field] : null });
    }
  }
  return { inSync: existing ? differences.length === 0 : false, differences, desired: desiredView };
}

function buildChannelpointsRewardStatus() {
  ensureDbReady();
  const reward = buildRewardSummary();
  const desired = buildDesiredChannelpointsReward();
  const existing = getChannelpointsRewardByKey(reward.rewardKey);
  const category = getChannelpointsCategory(reward.categoryKey);
  const diff = buildChannelpointsRewardDiff(existing, desired);
  return {
    ok: channelpointsTablesReady(),
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: channelpointsTablesReady() ? (existing ? (diff.inSync ? "linked_in_sync" : "linked_needs_update") : "missing_local_reward") : "channelpoints_tables_missing",
    tables: {
      categories: tableExists("channelpoints_categories"),
      rewards: tableExists("channelpoints_rewards"),
      categoryColumns: tableColumnsSafe("channelpoints_categories"),
      rewardColumns: tableColumnsSafe("channelpoints_rewards")
    },
    reward: {
      configured: reward,
      existing,
      desired: diff.desired,
      inSync: diff.inSync,
      differences: diff.differences
    },
    category,
    safety: {
      localDbOnly: true,
      noTwitchWrite: true,
      twitchIsEnabledForcedFalseInStep3: true,
      noVipGrant: true,
      noRedemptionFulfillCancel: true,
      cost: reward.cost
    }
  };
}

function ensureChannelpointsCategory() {
  const config = getConfig();
  const reward = buildRewardSummary();
  const cp = config.channelpoints || DEFAULT_CONFIG.channelpoints;
  if (!tableExists("channelpoints_categories")) throw new Error("channelpoints_categories_table_missing");
  const now = nowIso();
  const existing = getChannelpointsCategory(reward.categoryKey);
  if (existing) return { changed: false, category: existing };
  if (boolValue(cp.createCategoryIfMissing, true) !== true) return { changed: false, skipped: true, reason: "create_category_disabled" };
  const data = {
    category_key: reward.categoryKey,
    label: cleanString(cp.categoryLabel || "VIP"),
    description: cleanString(cp.categoryDescription || "VIP- und Community-Belohnungen"),
    sort_order: intValue(cp.categorySortOrder, 70),
    enabled: 1,
    created_at: now,
    updated_at: now
  };
  database.run(`
    INSERT INTO channelpoints_categories
      (category_key, label, description, sort_order, enabled, created_at, updated_at)
    VALUES
      (:category_key, :label, :description, :sort_order, :enabled, :created_at, :updated_at)
  `, data);
  return { changed: true, category: getChannelpointsCategory(reward.categoryKey) };
}

function ensureChannelpointsReward(options = {}) {
  const config = getConfig();
  if (!config.channelpoints || config.channelpoints.enabled === false || config.channelpoints.rewardSyncEnabled === false) {
    return { ok: false, skipped: true, reason: "channelpoints_reward_sync_disabled" };
  }
  const confirm = cleanString(options.confirm || options.confirmation || "").toUpperCase();
  if (boolValue(config.channelpoints.requireConfirmForEnsure, true) === true && confirm !== "YES") {
    return { ok: false, skipped: true, reason: "confirm_required", confirmRequired: "YES", noWrite: true, status: buildChannelpointsRewardStatus() };
  }
  ensureDbReady();
  if (!channelpointsTablesReady()) throw new Error("channelpoints_tables_missing");
  const now = nowIso();
  const categoryResult = ensureChannelpointsCategory();
  const desired = buildDesiredChannelpointsReward();
  const existing = getChannelpointsRewardByKey(desired.reward_key);
  const params = { ...desired, updated_at: now, created_at: existing && existing.createdAt ? existing.createdAt : now };
  let action = "unchanged";
  if (existing && existing.id) {
    database.run(`
      UPDATE channelpoints_rewards SET
        title = :title,
        prompt = :prompt,
        cost = :cost,
        category_key = :category_key,
        sort_order = :sort_order,
        system_enabled = :system_enabled,
        twitch_is_enabled = :twitch_is_enabled,
        is_paused = :is_paused,
        require_user_input = :require_user_input,
        input_label = :input_label,
        action_type = :action_type,
        action_key = :action_key,
        action_payload_json = :action_payload_json,
        media_asset_id = :media_asset_id,
        media_role = :media_role,
        queue_mode = :queue_mode,
        priority = :priority,
        cooldown_seconds = :cooldown_seconds,
        max_per_stream = :max_per_stream,
        max_per_user_per_stream = :max_per_user_per_stream,
        auto_fulfill = :auto_fulfill,
        notes = :notes,
        updated_at = :updated_at
      WHERE reward_key = :reward_key
    `, params);
    action = "updated";
  } else {
    database.run(`
      INSERT INTO channelpoints_rewards (
        reward_key, twitch_reward_id, title, prompt, cost, category_key, sort_order,
        system_enabled, twitch_is_enabled, is_paused, require_user_input, input_label,
        action_type, action_key, action_payload_json, media_asset_id, media_role,
        queue_mode, priority, cooldown_seconds, max_per_stream, max_per_user_per_stream,
        auto_fulfill, notes, created_at, updated_at
      ) VALUES (
        :reward_key, :twitch_reward_id, :title, :prompt, :cost, :category_key, :sort_order,
        :system_enabled, :twitch_is_enabled, :is_paused, :require_user_input, :input_label,
        :action_type, :action_key, :action_payload_json, :media_asset_id, :media_role,
        :queue_mode, :priority, :cooldown_seconds, :max_per_stream, :max_per_user_per_stream,
        :auto_fulfill, :notes, :created_at, :updated_at
      )
    `, params);
    action = "created";
  }
  const status = buildChannelpointsRewardStatus();
  const result = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action,
    category: categoryResult,
    status,
    safety: { localDbOnly: true, noTwitchWrite: true, noVipGrant: true, noRedemptionFulfillCancel: true }
  };
  writeLog("channelpoints_reward_ensured", {
    success: true,
    reason: action,
    message: `VIP30 Channelpoints Reward ${action}`,
    payload: { reward: status.reward.existing, desired: status.reward.desired, category: status.category }
  });
  emitChannelpointsRewardEvent("reward.ensured", result, options.reason || "manual_ensure");
  publishStatus("channelpoints_reward_ensured");
  return result;
}

function emitChannelpointsRewardEvent(action, result, reason = "channelpoints_reward") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return currentBus.emit({
      type: "event",
      channel: "vip30.channelpoints",
      action,
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        reason,
        emittedAt: nowIso(),
        result: result || null
      },
      meta: { requireAck: false, replayable: true, ttlMs: config.bus.ttlMs, productionTarget: true }
    });
  } catch (_) {
    return { ok: false, reason: "bus_emit_failed" };
  }
}



function normalizeRedemptionDecisionInput(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const userLogin = cleanString(source.userLogin || source.user_login || source.login || source.user || source.targetUserName || source.target_user_name || "").toLowerCase();
  const userDisplayName = cleanString(source.userDisplayName || source.user_display_name || source.displayName || source.display_name || source.targetUser || source.target_user || userLogin);
  const userId = cleanString(source.userId || source.user_id || source.targetUserId || source.target_user_id || "");
  const avatarUrl = cleanString(source.avatarUrl || source.avatar_url || source.targetProfileImageUrl || source.target_profile_image_url || "");
  return {
    ok: true,
    source: cleanString(source.source || "dry_run_api"),
    twitchRewardId: cleanString(source.twitchRewardId || source.twitch_reward_id || source.rewardId || source.reward_id || ""),
    twitchRedemptionId: cleanString(source.twitchRedemptionId || source.twitch_redemption_id || source.redemptionId || source.redemption_id || `dryrun_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    userId,
    userLogin,
    userDisplayName,
    avatarUrl,
    userInput: cleanString(source.userInput || source.user_input || source.input || ""),
    targetIsModerator: boolValue(source.targetIsModerator ?? source.target_is_moderator ?? source.isModerator ?? source.is_mod ?? source.mod, false),
    targetIsVip: boolValue(source.targetIsVip ?? source.target_is_vip ?? source.isVip ?? source.is_vip ?? source.vip, false),
    redeemedAt: cleanString(source.redeemedAt || source.redeemed_at || nowIso()),
    raw: source
  };
}

function findActiveSlotForDecision(normalized) {
  ensureDbReady();
  const now = nowIso();
  const userId = cleanString(normalized && normalized.userId || "");
  const userLogin = cleanString(normalized && normalized.userLogin || "").toLowerCase();
  if (!userId && !userLogin) return null;
  const row = database.get(`
    SELECT * FROM vip30_slots
    WHERE status = 'active'
      AND (end_utc = '' OR end_utc IS NULL OR end_utc > :now)
      AND ((:userId <> '' AND user_id = :userId) OR (:userLogin <> '' AND user_login = :userLogin))
    ORDER BY end_utc DESC, id DESC
    LIMIT 1
  `, { now, userId, userLogin });
  return mapSlotRow(row);
}

function buildDryRunRedemptionDecision(input = {}, options = {}) {
  ensureDbReady();
  const config = getConfig();
  const normalized = normalizeRedemptionDecisionInput(input);
  const stats = buildStats();
  const reward = buildRewardSummary();
  const activeSlot = findActiveSlotForDecision(normalized);
  const decision = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_dryrun_redemption_decision",
    checkedAt: nowIso(),
    status: "not_checked",
    wouldGrantVip: false,
    wouldCreateSlot: false,
    wouldFulfillRedemption: false,
    wouldCancelRedemption: false,
    wouldTriggerAlert: false,
    blocked: false,
    reason: "not_checked",
    message: "",
    reward,
    user: {
      userId: normalized.userId,
      userLogin: normalized.userLogin,
      userDisplayName: normalized.userDisplayName,
      avatarUrl: normalized.avatarUrl,
      targetIsModerator: normalized.targetIsModerator,
      targetIsVip: normalized.targetIsVip
    },
    redemption: {
      twitchRewardId: normalized.twitchRewardId,
      twitchRedemptionId: normalized.twitchRedemptionId,
      userInput: normalized.userInput,
      redeemedAt: normalized.redeemedAt,
      source: normalized.source
    },
    slots: {
      maxSlots: config.slots.maxSlots,
      active: stats.slots.active,
      free: stats.slots.free,
      existingSlot: activeSlot
    },
    safety: {
      dryRunOnly: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      dashboardLoggingOnly: true
    }
  };

  if (config.enabled === false) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "module_disabled", wouldCancelRedemption: true, message: "VIP30 ist in der DB-Konfiguration deaktiviert." });
  } else if (!normalized.userId && !normalized.userLogin) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "missing_user", wouldCancelRedemption: true, message: "Keine Userdaten fuer VIP30-Entscheidung vorhanden." });
  } else if (activeSlot && config.slots.blockExistingSlot !== false) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "already_has_vip30_slot", wouldCancelRedemption: true, message: "User hat bereits einen aktiven VIP30-Slot." });
  } else if (normalized.targetIsModerator && config.slots.blockModerators !== false) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "target_is_moderator", wouldCancelRedemption: true, message: "Mods werden nicht per VIP30 belohnt, damit keine Rollen durcheinander geraten." });
  } else if (normalized.targetIsVip && config.slots.blockExistingVip !== false) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "target_is_already_vip", wouldCancelRedemption: true, message: "User ist bereits VIP." });
  } else if (stats.slots.free <= 0) {
    Object.assign(decision, { status: "blocked", blocked: true, reason: "slots_full", wouldCancelRedemption: true, message: "Alle VIP30-Slots sind belegt." });
  } else {
    Object.assign(decision, {
      status: "would_grant",
      blocked: false,
      reason: "eligible",
      wouldGrantVip: true,
      wouldCreateSlot: true,
      wouldFulfillRedemption: true,
      wouldTriggerAlert: config.alerts.enabled !== false,
      message: "Dry-Run erfolgreich: User waere fuer 30 Tage VIP berechtigt."
    });
  }

  runtimeStats.dryRunRequests += 1;
  runtimeStats.lastDryRunAt = decision.checkedAt;
  runtimeStats.lastDryRunDecision = {
    status: decision.status,
    reason: decision.reason,
    userLogin: normalized.userLogin,
    wouldGrantVip: decision.wouldGrantVip,
    wouldCancelRedemption: decision.wouldCancelRedemption,
    checkedAt: decision.checkedAt
  };

  if (options.log !== false) {
    const logResult = writeLog("dryrun_redemption_decision", {
      userId: normalized.userId,
      userLogin: normalized.userLogin,
      userDisplayName: normalized.userDisplayName,
      twitchRewardId: normalized.twitchRewardId,
      twitchRedemptionId: normalized.twitchRedemptionId,
      success: decision.wouldGrantVip === true,
      reason: decision.reason,
      message: decision.message,
      payload: { decision, normalized: { ...normalized, raw: undefined } }
    });
    decision.log = logResult;
  }

  emitDryRunDecisionEvent(decision, options.reason || "dry_run_api");
  publishStatus("dryrun_decision");
  return decision;
}



function trimBridgeSeen(max = 500) {
  const limit = Math.max(50, Math.min(5000, intValue(max, 500)));
  while (bridgeSeenIds.length > limit) {
    const old = bridgeSeenIds.shift();
    if (old) bridgeSeenSet.delete(old);
  }
}

function rememberBridgeRedemption(id) {
  const clean = cleanString(id);
  if (!clean) return true;
  if (bridgeSeenSet.has(clean)) return false;
  bridgeSeenSet.add(clean);
  bridgeSeenIds.push(clean);
  const config = getConfig();
  trimBridgeSeen(config.bridge && config.bridge.duplicateWindowSize || 500);
  return true;
}

function normalizeChannelpointsBridgeEnvelope(envelope = {}) {
  const payload = envelope && typeof envelope.payload === "object" ? envelope.payload : (envelope || {});
  const event = envelope && typeof envelope.event === "object" ? envelope.event : null;
  const rawEvent = payload.event && typeof payload.event === "object" ? payload.event : {};
  const reward = rawEvent.reward && typeof rawEvent.reward === "object" ? rawEvent.reward : {};
  const normalized = {
    source: cleanString(payload.source || payload.bridgeSource || "channelpoints.redemption"),
    twitchRewardId: cleanString(payload.twitchRewardId || payload.twitch_reward_id || payload.rewardId || payload.reward_id || rawEvent.reward_id || rawEvent.rewardId || reward.id || ""),
    twitchRedemptionId: cleanString(payload.twitchRedemptionId || payload.twitch_redemption_id || payload.redemptionId || payload.redemption_id || rawEvent.id || rawEvent.redemption_id || event && event.id || ""),
    rewardKey: cleanString(payload.rewardKey || payload.reward_key || rawEvent.reward_key || ""),
    actionKey: cleanString(payload.actionKey || payload.action_key || ""),
    rewardTitle: cleanString(payload.rewardTitle || payload.reward_title || rawEvent.reward_title || reward.title || rawEvent.title || ""),
    rewardCost: intValue(payload.rewardCost || payload.reward_cost || rawEvent.reward_cost || reward.cost || rawEvent.cost, 0),
    userId: cleanString(payload.userId || payload.user_id || rawEvent.user_id || rawEvent.userId || ""),
    userLogin: cleanString(payload.userLogin || payload.user_login || rawEvent.user_login || rawEvent.userLogin || rawEvent.user || "").toLowerCase(),
    userDisplayName: cleanString(payload.userDisplayName || payload.user_display_name || payload.userName || payload.user_name || rawEvent.user_name || rawEvent.user_login || ""),
    avatarUrl: cleanString(payload.avatarUrl || payload.avatar_url || ""),
    userInput: cleanString(payload.userInput || payload.user_input || rawEvent.user_input || rawEvent.userInput || ""),
    targetIsModerator: boolValue(payload.targetIsModerator ?? payload.target_is_moderator ?? false, false),
    targetIsVip: boolValue(payload.targetIsVip ?? payload.target_is_vip ?? false, false),
    redeemedAt: cleanString(payload.redeemedAt || payload.redeemed_at || rawEvent.redeemed_at || rawEvent.redeemedAt || nowIso()),
    event
  };
  if (!normalized.twitchRedemptionId) normalized.twitchRedemptionId = `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return normalized;
}

function matchesVip30BridgeReward(normalized) {
  const config = getConfig();
  const status = buildChannelpointsRewardStatus();
  const configured = status && status.reward && status.reward.configured ? status.reward.configured : buildRewardSummary();
  const existing = status && status.reward && status.reward.existing ? status.reward.existing : null;
  const rewardKey = cleanString(configured.rewardKey || "vip30");
  const actionKey = cleanString(configured.actionKey || "vip30.redeem");
  const title = cleanString(configured.title || "30 Tage VIP").toLowerCase();
  const cost = intValue(configured.cost, 40000);
  const checks = {
    rewardKey: config.bridge && config.bridge.acceptRewardKeyMatch === false ? false : (!!normalized.rewardKey && normalized.rewardKey === rewardKey),
    actionKey: !!normalized.actionKey && normalized.actionKey === actionKey,
    twitchRewardId: config.bridge && config.bridge.acceptTwitchRewardIdMatch === false ? false : (!!(existing && existing.twitchRewardId && normalized.twitchRewardId && existing.twitchRewardId === normalized.twitchRewardId)),
    titleAndCost: config.bridge && config.bridge.acceptTitleMatch === false ? false : (!!(normalized.rewardTitle && normalized.rewardTitle.toLowerCase() === title && (!normalized.rewardCost || normalized.rewardCost === cost)))
  };
  const matched = checks.rewardKey || checks.actionKey || checks.twitchRewardId || checks.titleAndCost;
  return { matched, checks, status };
}

function emitBridgeEvent(action, payload = {}) {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  return currentBus.emit({
    type: "event",
    channel: "vip30.bridge",
    action,
    source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
    target: { type: "all", id: "*" },
    payload: { module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, ...payload, emittedAt: nowIso() },
    meta: { requireAck: false, replayable: config.bus.replayable !== false, ttlMs: config.bus.ttlMs || 60000, productionTarget: true, twitchWrite: false }
  });
}

function handleChannelpointsRedemptionBridgeEvent(envelope = {}) {
  bridgeStats.received += 1;
  bridgeLastEventAt = nowIso();
  const config = getConfig();
  if (!config.bridge || config.bridge.enabled === false) {
    bridgeStats.ignored += 1;
    bridgeStats.lastReason = "bridge_disabled";
    return { ok: true, ignored: true, reason: "bridge_disabled" };
  }
  const normalized = normalizeChannelpointsBridgeEnvelope(envelope);
  bridgeStats.lastRewardTitle = normalized.rewardTitle;
  bridgeStats.lastRewardId = normalized.twitchRewardId;
  bridgeStats.lastUserLogin = normalized.userLogin;
  const match = matchesVip30BridgeReward(normalized);
  if (!match.matched) {
    bridgeStats.ignored += 1;
    bridgeStats.lastReason = "not_vip30_reward";
    bridgeLastIgnoredAt = nowIso();
    return { ok: true, ignored: true, reason: "not_vip30_reward", match: match.checks };
  }
  if (!rememberBridgeRedemption(normalized.twitchRedemptionId)) {
    bridgeStats.duplicates += 1;
    bridgeStats.lastReason = "duplicate_redemption";
    return { ok: true, ignored: true, reason: "duplicate_redemption", twitchRedemptionId: normalized.twitchRedemptionId };
  }
  bridgeStats.matched += 1;
  try {
    const result = buildChannelpointsBridgeDecision({
      payload: { ...normalized, source: "channelpoints_bridge", bridgeMatchedBy: match.checks },
      event: envelope.event || null
    }, { reason: "channelpoints_redemption_bus", log: true });
    bridgeStats.decisions += 1;
    bridgeStats.lastReason = result && result.decision && result.decision.reason || "decision_done";
    emitBridgeEvent(result && result.decision && result.decision.wouldGrantVip ? "decision.eligible" : "decision.blocked", {
      normalized: { ...normalized, event: undefined },
      match: match.checks,
      decision: result && result.decision ? {
        status: result.decision.status,
        reason: result.decision.reason,
        wouldGrantVip: result.decision.wouldGrantVip,
        wouldCancelRedemption: result.decision.wouldCancelRedemption,
        user: result.decision.user
      } : null,
      safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true }
    });
    return result;
  } catch (err) {
    bridgeStats.errors += 1;
    bridgeLastError = err && err.message ? err.message : String(err);
    bridgeStats.lastReason = "decision_failed";
    emitBridgeEvent("decision.failed", { normalized: { ...normalized, event: undefined }, error: bridgeLastError });
    return { ok: false, error: bridgeLastError };
  }
}

function emitChannelpointsBridgeTest(input = {}) {
  const payload = {
    source: "vip30_bridge_test_api",
    twitchRedemptionId: cleanString(input.twitchRedemptionId || input.redemptionId || `bridge_test_${Date.now()}`),
    twitchRewardId: cleanString(input.twitchRewardId || input.rewardId || ""),
    rewardKey: cleanString(input.rewardKey || "vip30"),
    actionKey: cleanString(input.actionKey || "vip30.redeem"),
    rewardTitle: cleanString(input.rewardTitle || "30 Tage VIP"),
    rewardCost: intValue(input.rewardCost || input.cost, buildRewardSummary().cost),
    userId: cleanString(input.userId || "123456"),
    userLogin: cleanString(input.userLogin || "testuser").toLowerCase(),
    userDisplayName: cleanString(input.userDisplayName || "TestUser"),
    targetIsModerator: boolValue(input.targetIsModerator, false),
    targetIsVip: boolValue(input.targetIsVip, false),
    redeemedAt: nowIso()
  };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  const result = currentBus.emit({
    type: "event",
    channel: "channelpoints.redemption",
    action: "received",
    source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
    target: { type: "all", id: "*" },
    payload,
    meta: { requireAck: false, replayable: true, ttlMs: 60000, productionTarget: true, testEvent: true }
  });
  bridgeStats.emittedTests += 1;
  return { ok: result && result.ok === true, busResult: result, payload, safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } };
}

function buildInternalBridgeStatus() {
  return {
    ok: !bridgeLastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: bridgeSubscribed ? "listening_channelpoints_redemption" : "not_subscribed",
    enabled: getConfig().bridge && getConfig().bridge.enabled !== false,
    subscribed: bridgeSubscribed,
    subscriptionId: bridgeSubscriptionId,
    listens: { channel: "channelpoints.redemption", action: "received" },
    decisionOnly: !(getConfig().bridge && getConfig().bridge.decisionOnly === false),
    lastEventAt: bridgeLastEventAt,
    lastIgnoredAt: bridgeLastIgnoredAt,
    lastDecisionAt: runtimeStats.lastBridgeDecisionAt,
    lastError: bridgeLastError,
    stats: { ...bridgeStats },
    reward: buildChannelpointsRewardStatus().reward,
    routes: [`${ROUTE_PREFIX}/channelpoints/bridge/status`, `${ROUTE_PREFIX}/channelpoints/bridge/test`],
    safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true }
  };
}

function registerInternalBridgeSubscription() {
  const config = getConfig();
  if (!config.bridge || config.bridge.enabled === false) return { ok: false, reason: "bridge_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  if (bridgeSubscribed) return { ok: true, subscribed: true, subscriptionId: bridgeSubscriptionId };
  bridgeSubscriptionId = `module:${MODULE_NAME}:channelpoints.redemption:received`;
  const result = currentBus.subscribe({
    id: bridgeSubscriptionId,
    module: MODULE_NAME,
    channel: "channelpoints.redemption",
    action: "received"
  }, envelope => handleChannelpointsRedemptionBridgeEvent(envelope));
  bridgeSubscribed = result && result.ok === true;
  if (!bridgeSubscribed) bridgeLastError = result && result.reason ? result.reason : "bridge_subscribe_failed";
  return { ok: bridgeSubscribed, subscribed: bridgeSubscribed, subscriptionId: bridgeSubscriptionId, result };
}

function buildChannelpointsBridgeDecision(input = {}, options = {}) {
  const payload = input && typeof input === "object" && input.payload && typeof input.payload === "object" ? input.payload : (input || {});
  const sourceEvent = input && typeof input === "object" && input.event && typeof input.event === "object" ? input.event : null;
  const normalized = {
    source: cleanString(payload.source || payload.bridgeSource || "channelpoints_bridge"),
    twitchRewardId: cleanString(payload.twitchRewardId || payload.twitch_reward_id || payload.rewardId || payload.reward_id || payload.event && payload.event.reward_id || ""),
    twitchRedemptionId: cleanString(payload.twitchRedemptionId || payload.twitch_redemption_id || payload.redemptionId || payload.redemption_id || payload.event && payload.event.id || `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    userId: cleanString(payload.userId || payload.user_id || payload.event && payload.event.user_id || ""),
    userLogin: cleanString(payload.userLogin || payload.user_login || payload.user || payload.event && (payload.event.user_login || payload.event.user) || "").toLowerCase(),
    userDisplayName: cleanString(payload.userDisplayName || payload.user_display_name || payload.userName || payload.user_name || payload.event && (payload.event.user_name || payload.event.user_login) || ""),
    avatarUrl: cleanString(payload.avatarUrl || payload.avatar_url || ""),
    userInput: cleanString(payload.userInput || payload.user_input || payload.input || payload.event && payload.event.user_input || ""),
    targetIsModerator: boolValue(payload.targetIsModerator ?? payload.target_is_moderator ?? false, false),
    targetIsVip: boolValue(payload.targetIsVip ?? payload.target_is_vip ?? false, false),
    redeemedAt: cleanString(payload.redeemedAt || payload.redeemed_at || payload.event && payload.event.redeemed_at || nowIso())
  };
  const decision = buildDryRunRedemptionDecision(normalized, { reason: options.reason || "channelpoints_bridge", log: options.log !== false });
  runtimeStats.bridgeDecisionRequests += 1;
  runtimeStats.lastBridgeDecisionAt = decision.checkedAt;
  runtimeStats.lastBridgeDecision = {
    status: decision.status,
    reason: decision.reason,
    userLogin: decision.user.userLogin,
    twitchRewardId: decision.redemption.twitchRewardId,
    twitchRedemptionId: decision.redemption.twitchRedemptionId,
    wouldGrantVip: decision.wouldGrantVip,
    wouldCancelRedemption: decision.wouldCancelRedemption,
    checkedAt: decision.checkedAt
  };
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_channelpoints_bridge_decision",
    bridge: {
      sourceEventId: sourceEvent && sourceEvent.id || "",
      channel: sourceEvent && sourceEvent.channel || "channelpoints.redemption",
      action: sourceEvent && sourceEvent.action || "received",
      decisionOnly: true
    },
    decision,
    safety: {
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      dashboardLoggingOnly: true
    }
  };
}

function emitDryRunDecisionEvent(decision, reason = "dry_run_decision") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return currentBus.emit({
      type: "event",
      channel: "vip30.redeem",
      action: decision && decision.wouldGrantVip ? "dryrun.eligible" : "dryrun.blocked",
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        reason,
        status: decision && decision.status || "unknown",
        decision: decision ? {
          status: decision.status,
          blocked: decision.blocked,
          reason: decision.reason,
          wouldGrantVip: decision.wouldGrantVip,
          wouldFulfillRedemption: decision.wouldFulfillRedemption,
          wouldCancelRedemption: decision.wouldCancelRedemption,
          user: decision.user,
          slots: { maxSlots: decision.slots.maxSlots, active: decision.slots.active, free: decision.slots.free }
        } : null,
        emittedAt: nowIso()
      },
      meta: { requireAck: false, replayable: true, ttlMs: config.bus.ttlMs, productionTarget: true, twitchWrite: false }
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
    status: lastError ? "error" : "ready_step5_dryrun_redemption_decision",
    lastError,
    checks: {
      databaseReady: dbMigrationState.ok === true,
      schemaReady: database.getSchemaVersion(MODULE_NAME) >= SCHEMA_TARGET_VERSION,
      busRegistered: registeredAtBus,
      dashboardLoggingReady: tableExists("vip30_log"),
      slotsTableReady: tableExists("vip30_slots"),
      twitchCapabilityCheckAvailable: getConfig().twitch.capabilityCheckEnabled !== false,
      twitchLiveActionsEnabled: getConfig().twitch.liveActionsEnabled === true,
      channelpointsTablesReady: channelpointsTablesReady(),
      channelpointsRewardLinked: !!getChannelpointsRewardByKey(buildRewardSummary().rewardKey)
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
    status: lastError ? "error" : "ready_step5_dryrun_redemption_decision",
    startedAt,
    routePrefix: ROUTE_PREFIX,
    routeCount: 13,
    routes: [
      `${ROUTE_PREFIX}/status`,
      `${ROUTE_PREFIX}/health`,
      `${ROUTE_PREFIX}/slots`,
      `${ROUTE_PREFIX}/logs`,
      `${ROUTE_PREFIX}/stats`,
      `${ROUTE_PREFIX}/twitch/capability`,
      `${ROUTE_PREFIX}/twitch/scopes`,
      `${ROUTE_PREFIX}/channelpoints/reward/status`,
      `${ROUTE_PREFIX}/channelpoints/reward/ensure`,
      `${ROUTE_PREFIX}/settings`,
      `${ROUTE_PREFIX}/settings/save`,
      `${ROUTE_PREFIX}/redeem/dry-run`,
      `${ROUTE_PREFIX}/redeem/decision`,
      `${ROUTE_PREFIX}/channelpoints/bridge/status`,
      `${ROUTE_PREFIX}/channelpoints/bridge/test`
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
      twitchRequiredScopes: [...config.twitch.requiredScopes],
      channelpointsRewardSyncEnabled: config.channelpoints.enabled !== false && config.channelpoints.rewardSyncEnabled !== false,
      channelpointsRewardCost: buildRewardSummary().cost,
      dryRunDecisionFlowEnabled: true,
      channelpointsBridgeEnabled: config.bridge && config.bridge.enabled !== false,
      channelpointsBridgeDecisionOnly: !(config.bridge && config.bridge.decisionOnly === false),
      settingsSource: tableExists("vip30_settings") ? "db" : "json_fallback",
      settingsDashboardWritable: true
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
    settings: (() => {
      try { return buildSettingsStatus(); } catch (err) { return { ok: false, status: "error", error: err && err.message ? err.message : String(err) }; }
    })(),
    channelpointsReward: (() => {
      try { return buildChannelpointsRewardStatus(); } catch (err) { return { ok: false, status: "error", error: err && err.message ? err.message : String(err) }; }
    })(),
    dryRun: {
      enabled: true,
      requests: runtimeStats.dryRunRequests,
      lastDryRunAt: runtimeStats.lastDryRunAt,
      lastDecision: runtimeStats.lastDryRunDecision
    },
    bridge: {
      enabled: config.bridge && config.bridge.enabled !== false,
      subscribed: bridgeSubscribed,
      subscriptionId: bridgeSubscriptionId,
      decisionOnly: !(config.bridge && config.bridge.decisionOnly === false),
      requests: runtimeStats.bridgeDecisionRequests,
      receivedEvents: bridgeStats.received,
      matchedEvents: bridgeStats.matched,
      ignoredEvents: bridgeStats.ignored,
      duplicateEvents: bridgeStats.duplicates,
      lastDecisionAt: runtimeStats.lastBridgeDecisionAt,
      lastDecision: runtimeStats.lastBridgeDecision,
      safety: {
        noTwitchWrite: true,
        noVipGrant: true,
        noSlotWrite: true,
        noRedemptionFulfillCancel: true
      }
    },
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
      step: "VIP30-STEP6",
      noStreamerBot: true,
      noLegacyImport: true,
      noTwitchWriteInThisStep: true,
      localChannelpointsRewardWriteOnly: true,
      dbDashboardConfig: true,
      dryRunDecisionFlow: true,
      channelpointsDecisionBridge: true,
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
      phase: config.enabled === false ? "disabled" : "ready_step6",
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
      } : { status: "not_checked", readyForVip30LiveFlow: false, checkedAt: "" },
      channelpointsReward: (() => {
        try {
          const status = buildChannelpointsRewardStatus();
          return { status: status.status, inSync: !!(status.reward && status.reward.inSync), cost: buildRewardSummary().cost };
        } catch (err) { return { status: "error", error: err && err.message ? err.message : String(err) }; }
      })()
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
      "vip30.channelpoints.reward.status",
      "vip30.channelpoints.reward.ensure",
      "vip30.redeem.dryrun",
      "vip30.redeem.decision",
      "vip30.channelpoints.bridge.listen",
      "vip30.channelpoints.bridge.test",
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
      noTwitchWriteInStep6: true,
      capabilityCheckOnly: false,
      channelpointsRewardLink: true
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
    loadedConfig = null;
    loadConfig();
    registerAtBus();
    registerInternalBridgeSubscription();
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
    app.get(`${ROUTE_PREFIX}/settings`, (_req, res) => {
      runtimeStats.settingsRequests += 1;
      runtimeStats.lastAction = "settings";
      try { res.json(buildSettingsStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
    });
    app.post(`${ROUTE_PREFIX}/settings/save`, (req, res) => {
      runtimeStats.settingsRequests += 1;
      runtimeStats.lastAction = "settings_save";
      try {
        const result = saveSettingsFromPayload((req && req.body) || {});
        res.status(result.ok ? 200 : 207).json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true } });
      }
    });
    app.get(`${ROUTE_PREFIX}/channelpoints/reward/status`, (_req, res) => {
      runtimeStats.lastAction = "channelpoints_reward_status";
      try { res.json(buildChannelpointsRewardStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
    });
    app.post(`${ROUTE_PREFIX}/channelpoints/reward/ensure`, (req, res) => {
      runtimeStats.lastAction = "channelpoints_reward_ensure";
      try {
        const result = ensureChannelpointsReward({
          confirm: req.query && req.query.confirm || req.body && req.body.confirm || "",
          reason: cleanString(req.query && req.query.reason || req.body && req.body.reason || "api")
        });
        const statusCode = result && result.ok ? 200 : 409;
        res.status(statusCode).json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true } });
      }
    });
    app.get(`${ROUTE_PREFIX}/channelpoints/bridge/status`, (_req, res) => {
      runtimeStats.lastAction = "channelpoints_bridge_status";
      try { res.json(buildInternalBridgeStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
    });
    app.post(`${ROUTE_PREFIX}/channelpoints/bridge/test`, (req, res) => {
      runtimeStats.lastAction = "channelpoints_bridge_test";
      try {
        const result = emitChannelpointsBridgeTest((req && req.body) || {});
        res.json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true } });
      }
    });

    app.get(`${ROUTE_PREFIX}/redeem/dry-run`, (req, res) => {
      runtimeStats.lastAction = "redeem_dry_run_get";
      try {
        const result = buildDryRunRedemptionDecision(req.query || {}, { reason: "api_get", log: boolValue(req.query && req.query.log, true) });
        res.json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true } });
      }
    });
    app.post(`${ROUTE_PREFIX}/redeem/dry-run`, (req, res) => {
      runtimeStats.lastAction = "redeem_dry_run_post";
      try {
        const result = buildDryRunRedemptionDecision((req && req.body) || {}, { reason: "api_post", log: true });
        res.json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true } });
      }
    });
    app.post(`${ROUTE_PREFIX}/redeem/decision`, (req, res) => {
      runtimeStats.lastAction = "redeem_decision_post";
      try {
        const result = buildDryRunRedemptionDecision((req && req.body) || {}, { reason: "api_decision", log: true });
        res.json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true } });
      }
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
  buildSettingsStatus,
  saveSettingsFromPayload,
  buildTwitchCapabilityStatus,
  buildChannelpointsRewardStatus,
  ensureChannelpointsReward,
  buildDryRunRedemptionDecision,
  buildChannelpointsBridgeDecision,
  buildInternalBridgeStatus,
  emitChannelpointsBridgeTest,
  handleChannelpointsRedemptionBridgeEvent,
  listSlots,
  listLogs,
  writeLog
};
