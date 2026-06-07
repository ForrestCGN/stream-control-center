"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const helperConfig = require("./helpers/helper_config");
const chatOutput = require("./helpers/helper_chat_output");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "vip30";
const MODULE_VERSION = "0.8.18";
const MODULE_BUILD = "step8.19.28-twitch-capability-legacy-cleanup";
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
  description: "30 Tage VIP Node-Modul: SQLite-Slots/Logs, Dashboard-Config, Channelpoints-Kachel-Wahrheit, EventSub-Bridge, Live-Flow fuer VIP-Grant, Slot-Write, Redemption Fulfill/Cancel und VIP30-Alert/Sound-Bundle.",
  bus: {
    registered: true,
    heartbeat: true,
    emits: ["module.status", "module.health", "vip30.status", "vip30.twitch", "vip30.channelpoints", "vip30.redeem", "vip30.bridge", "vip30.live", "vip30.alert"],
    listens: ["channelpoints.redemption", "twitch.eventsub", "twitch.vip"]
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
    isPaused: false,
    requireUserInput: false,
    inputLabel: "",
    queueMode: "vip30",
    priority: 80,
    cooldownSeconds: 0,
    maxPerStream: 0,
    maxPerUserPerStream: 0,
    notes: "VIP30-Reward wird vom VIP30-Modul verwaltet. Die VIP30-Kachel ist die Live-Wahrheit.",
    twitchPolicies: {
      shouldRedemptionsSkipRequestQueue: false,
      fulfillAfterSuccess: true,
      cancelOnFailure: true
    }
  },
  bridge: {
    enabled: true,
    acceptTitleMatch: true,
    acceptRewardKeyMatch: true,
    acceptTwitchRewardIdMatch: true,
    requireLocalRewardLinked: true,
    duplicateWindowSize: 500,
    liveEventDryRunObserveEnabled: true
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
    intervalMs: 300000,
    removeVipOnExpire: true,
    releaseSlotOnExternalVipRemove: true
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
    mode: "sound_system_bundle",
    soundKey: "vip30",
    mediaId: 0,
    mediaPath: "",
    soundPool: [],
    category: "vip",
    durationMs: 9000,
    soundBundleUrl: "/api/sound/bundle",
    target: "stream",
    outputTarget: "overlay",
    priority: 90,
    volume: 85,
    designPending: false,
    overlaySets: [
      {
        id: "heimleitung-upgrade",
        enabled: true,
        weight: 3,
        kicker: "Upgrade im CGN-Altersheim",
        headline: "{displayName} wird Ehrenbewohner.",
        subline: "Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.",
        message: "Ein kleines VIP-Upgrade wurde genehmigt.",
        perks: ["Keks extra", "Klecks Soße mehr", "gemütlicherer Sessel"],
        brand: "CGN VIP-Lounge"
      },
      {
        id: "kleine-upgrades",
        enabled: true,
        weight: 2,
        kicker: "30 Tage VIP",
        headline: "{displayName} hat sich VIP gegönnt.",
        subline: "Keine Extrawurst, nur ein paar liebevolle Kleinigkeiten.",
        message: "Die Heimleitung öffnet kurz die VIP-Lane an der Essensausgabe.",
        perks: ["Tee mit Untertasse", "Klecks Soße mehr", "etwas weniger Zugluft"],
        brand: "CGN Altersheim"
      },
      {
        id: "empfangskomitee",
        enabled: true,
        weight: 2,
        kicker: "Rentner-Empfangskomitee",
        headline: "Willkommen, {displayName}!",
        subline: "Die Bewohner rücken ein Stück zur Seite und machen Platz im Aufenthaltsraum.",
        message: "Das Upgrade läuft ab jetzt dreißig Tage.",
        perks: ["Rentner-Applaus", "Keks extra", "Sessel mit Aussicht"],
        brand: "CGN VIP-Lounge"
      },
      {
        id: "heimleitung-bescheid",
        enabled: true,
        weight: 1,
        kicker: "Offizielle Heimdurchsage",
        headline: "VIP-Upgrade für {displayName}.",
        subline: "Die Heimleitung hat geprüft, genickt und freundlich abgestempelt.",
        message: "Der neue Ehrenbewohner bekommt kleine Sonderleistungen mit Würde.",
        perks: ["Mini-Upgrade", "Soßenbonus", "Kaffeeplatz nah am Fenster"],
        brand: "CGN Heimleitung"
      }
    ]
  },
  textStyle: {
    category: "vip30",
    style: "CGN/Altersheim/Rentner",
    dashboardVariants: true
  },
  twitch: {}
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
let moduleContext = {};
let bus = null;
let startedAt = "";
let registeredAtBus = false;
let heartbeatTimer = null;
let statusTimer = null;
let lastBusRegisterAt = "";
let lastBusHeartbeatAt = "";
let lastBusStatusAt = "";
let lastError = "";
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
  alertTriggers: 0,
  alertSkipped: 0,
  alertFailed: 0,
  lastAlertAt: "",
  lastAlertStatus: "",
  lastAlertReason: "",
  lastAlertUserLogin: "",
  logWrites: 0,
  lastLogAt: "",
  lastAction: ""
};

let bridgeSubscriptionId = "";
let bridgeSubscribed = false;
let externalVipRemoveSubscribed = false;
let externalVipRemoveSubscriptionIds = [];
let externalVipRemoveLastEventAt = "";
let externalVipRemoveLastResult = null;
let externalVipRemoveLastError = "";
let externalVipRemoveStats = { received: 0, matched: 0, ignored: 0, updated: 0, errors: 0, emittedTests: 0 };
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
function isIgnorableLastError(value) {
  const text = cleanString(value || "");
  if (!text) return true;
  const normalized = text.toLowerCase();
  return normalized === "http 200" || normalized === "status 200" || normalized === "200" || normalized === "ok";
}

function getEffectiveLastError() {
  return isIgnorableLastError(lastError) ? "" : cleanString(lastError || "");
}

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
  loadedConfig.twitch = {};
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
  { key: "bridge.enabled", path: "bridge.enabled", type: "boolean", category: "bridge", label: "Channelpoints-Bridge aktiv", description: "Echte Channelpoints-Redemptions anhand der VIP30-Kachel an VIP30 übergeben.", editable: true },
  { key: "bridge.acceptTitleMatch", path: "bridge.acceptTitleMatch", type: "boolean", category: "bridge", label: "Titel-Match erlauben", description: "VIP30-Reward auch anhand von Titel/Kosten erkennen, solange Twitch-ID noch fehlt.", editable: true },
  { key: "bridge.liveEventDryRunObserveEnabled", path: "bridge.liveEventDryRunObserveEnabled", type: "boolean", category: "bridge", label: "Live-EventSub Dry-Run", description: "Echte Channelpoints-Events aus EventSub nur beobachten und durch die VIP30-Decision schicken, ohne Twitch-/Slot-Schreibaktion.", editable: true },
  { key: "alerts.enabled", path: "alerts.enabled", type: "boolean", category: "alerts", label: "Alert aktiv", description: "Alert/Sound nach erfolgreicher Einlösung auslösen.", editable: true },
  { key: "alerts.soundKey", path: "alerts.soundKey", type: "string", category: "alerts", label: "Sound-Key", description: "Interner Sound-/Label-Key für den VIP30-Alert.", editable: true },
  { key: "alerts.mediaId", path: "alerts.mediaId", type: "integer", category: "alerts", label: "Media-ID", description: "Media-System Asset-ID des VIP30-Alert-Sounds. Upload/Auswahl erfolgt über das zentrale Media-System.", editable: true },
  { key: "alerts.mediaPath", path: "alerts.mediaPath", type: "string", category: "alerts", label: "Media-Pfad", description: "Optionaler relativer Media-System-Pfad, falls keine Media-ID genutzt wird.", editable: true },
  { key: "alerts.soundPool", path: "alerts.soundPool", type: "json", category: "alerts", label: "VIP30 Sound-Pool", description: "Mehrere mögliche VIP30-Sounds mit Zufallsauswahl. Felder: id, enabled, weight, mediaId, mediaPath, label, durationMs. durationMs=0 bedeutet automatisch aus dem Media-System.", editable: true },
  { key: "alerts.overlaySets", path: "alerts.overlaySets", type: "json", category: "alerts", label: "VIP30 Overlay-Textsets", description: "Zusammengehörige Textsets für die VIP30-Overlay-Card. Felder: id, enabled, weight, kicker, headline, subline, message, perks, brand. Platzhalter: {displayName}, {login}.", editable: true },
  { key: "cleanup.enabled", path: "cleanup.enabled", type: "boolean", category: "cleanup", label: "Cleanup aktiv", description: "Ablauf-/Revoke-Logik für abgelaufene VIP30-Slots aktivieren.", editable: true },
  { key: "cleanup.removeVipOnExpire", path: "cleanup.removeVipOnExpire", type: "boolean", category: "cleanup", label: "VIP bei Ablauf entziehen", description: "Bei abgelaufenen VIP30-Slots den Twitch-VIP automatisch per Cleanup entfernen.", editable: true },
  { key: "cleanup.releaseSlotOnExternalVipRemove", path: "cleanup.releaseSlotOnExternalVipRemove", type: "boolean", category: "cleanup", label: "Externen VIP-Entzug verarbeiten", description: "Wenn ein VIP manuell/extern entfernt wird, einen aktiven VIP30-Slot freigeben.", editable: true },
  { key: "logging.enabled", path: "logging.enabled", type: "boolean", category: "logging", label: "Dashboard-Logging aktiv", description: "VIP30-Ereignisse in der DB speichern.", editable: true }
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
  let rawRows = readSettingsRows();
  if (rawRows.length < SETTING_DEFINITIONS.length) {
    seedSettingsFromConfigIfMissing("settings_status_missing_definitions");
    rawRows = readSettingsRows();
  }
  const activeKeys = new Set(SETTING_DEFINITIONS.map(def => def.key));
  const rows = rawRows.map(mapSettingRow).filter(row => row && activeKeys.has(row.key));
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
        twitchTileTruth: true
      },
      bridge: {
        enabled: getConfig().bridge && getConfig().bridge.enabled !== false,
        acceptTitleMatch: !(getConfig().bridge && getConfig().bridge.acceptTitleMatch === false)
      },
      alerts: {
        enabled: getConfig().alerts.enabled !== false,
        soundKey: getConfig().alerts.soundKey,
        mediaId: getConfig().alerts.mediaId || 0,
        mediaPath: getConfig().alerts.mediaPath || "",
        soundPoolCount: normalizeVip30SoundPool(getConfig().alerts.soundPool, getConfig().alerts).length,
        overlaySetCount: normalizeVip30OverlaySets(getConfig().alerts.overlaySets).length
      },
      cleanup: { enabled: getConfig().cleanup.enabled !== false },
      logging: { enabled: getConfig().logging.enabled !== false }
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

function httpPostJson(targetUrl, body = {}) {
  const cleanUrl = cleanString(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error("target_url_missing"));
  const payload = JSON.stringify(body || {});
  const options = {
    hostname: process.env.VIP30_TARGET_HOST || process.env.CHANNELPOINTS_TARGET_HOST || DEFAULT_TARGET_HOST,
    port: Number(process.env.VIP30_TARGET_PORT || process.env.CHANNELPOINTS_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
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
    request.write(payload);
    request.end();
  });
}


function getRuntimeEnv() {
  return (moduleContext && moduleContext.env && typeof moduleContext.env === "object") ? moduleContext.env : process.env;
}
function getRootDirSafe() {
  try { return helperConfig.getRootDir(); } catch (_) { return process.cwd(); }
}
function resolveVip30Path(filePath, fallbackRelative) {
  const raw = cleanString(filePath || fallbackRelative || "");
  if (!raw) return "";
  return path.isAbsolute(raw) ? raw : path.join(getRootDirSafe(), raw);
}
function readJsonFileSafe(filePath, fallback = null) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}
function writeJsonFileSafe(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value || {}, null, 2), "utf8");
}
function epochSeconds() { return Math.floor(Date.now() / 1000); }
function getTwitchTokenStorePath() {
  const env = getRuntimeEnv();
  return resolveVip30Path(env.TWITCH_TOKEN_STORE || "", "tokens/twitch_user.json");
}
function getTwitchClientSettings() {
  const env = getRuntimeEnv();
  return {
    clientId: cleanString(env.TWITCH_CLIENT_ID || ""),
    clientSecret: cleanString(env.TWITCH_CLIENT_SECRET || ""),
    broadcasterId: cleanString(env.TWITCH_BROADCASTER_ID || ""),
    tokenStore: getTwitchTokenStorePath()
  };
}
async function refreshTwitchUserTokenIfNeeded() {
  const settings = getTwitchClientSettings();
  const tokenData = readJsonFileSafe(settings.tokenStore, null);
  if (!tokenData || !tokenData.access_token) throw new Error("twitch_user_token_missing");
  const expiresAt = Number(tokenData.expires_at || 0);
  if (expiresAt && epochSeconds() < expiresAt - 60) return cleanString(tokenData.access_token);
  if (!tokenData.refresh_token) throw new Error("twitch_refresh_token_missing");
  if (!settings.clientId || !settings.clientSecret) throw new Error("twitch_client_credentials_missing");
  const params = new URLSearchParams();
  params.set("client_id", settings.clientId);
  params.set("client_secret", settings.clientSecret);
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", tokenData.refresh_token);
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`twitch_token_refresh_failed_${response.status}:${JSON.stringify(body)}`);
  const updated = {
    access_token: body.access_token,
    refresh_token: body.refresh_token || tokenData.refresh_token,
    expires_at: epochSeconds() + Number(body.expires_in || 0)
  };
  writeJsonFileSafe(settings.tokenStore, updated);
  return cleanString(updated.access_token);
}
async function twitchHelixRequest(method, pathname, query = {}, body = null) {
  const settings = getTwitchClientSettings();
  if (!settings.clientId) throw new Error("twitch_client_id_missing");
  const token = await refreshTwitchUserTokenIfNeeded();
  const url = new URL(`https://api.twitch.tv/helix${pathname}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && String(value).trim() !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Client-ID": settings.clientId,
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
  if (!response.ok) {
    const err = new Error(`twitch_helix_${method.toLowerCase()}_${pathname.replace(/[^a-z0-9]+/gi, "_")}_failed_${response.status}`);
    err.statusCode = response.status;
    err.data = data;
    throw err;
  }
  return { ok: true, statusCode: response.status, data };
}

function normalizeTwitchLoginCandidate(value) {
  const clean = cleanString(value || "").replace(/^@+/, "").trim();
  if (!clean) return "";
  return clean.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

async function twitchResolveUserProfile(input = {}) {
  const raw = input && typeof input === "object" ? input : {};
  const directAvatar = cleanString(raw.avatarUrl || raw.avatar_url || raw.profileImageUrl || raw.profile_image_url || "");
  const userId = cleanString(raw.userId || raw.user_id || raw.id || "");
  const login = normalizeTwitchLoginCandidate(raw.userLogin || raw.user_login || raw.login || raw.userName || raw.user_name || raw.name || raw.displayName || raw.display_name || raw.userDisplayName || raw.user_display_name || raw.display_name);
  const displayNameFallback = cleanString(raw.userDisplayName || raw.user_display_name || raw.displayName || raw.display_name || raw.name || raw.userLogin || raw.login || "");
  if (!userId && !login) {
    return {
      ok: false,
      skipped: true,
      reason: "missing_user_lookup_key",
      userId: cleanString(raw.userId || raw.user_id || ""),
      userLogin: normalizeTwitchLoginCandidate(raw.userLogin || raw.login || ""),
      userDisplayName: displayNameFallback,
      avatarUrl: directAvatar
    };
  }

  try {
    const query = {};
    if (userId) query.id = userId;
    else query.login = login;
    const response = await twitchHelixRequest("GET", "/users", query, null);
    const user = response && response.data && Array.isArray(response.data.data) ? response.data.data[0] : null;
    if (!user) {
      return {
        ok: false,
        skipped: false,
        reason: "twitch_user_not_found",
        userId,
        userLogin: login,
        userDisplayName: displayNameFallback || login,
        avatarUrl: directAvatar
      };
    }
    return {
      ok: true,
      reason: "twitch_user_resolved",
      userId: cleanString(user.id || userId),
      userLogin: normalizeTwitchLoginCandidate(user.login || login),
      userDisplayName: cleanString(user.display_name || displayNameFallback || user.login || login),
      avatarUrl: cleanString(user.profile_image_url || directAvatar),
      raw: user
    };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      reason: "twitch_user_lookup_failed",
      error: err && err.message ? err.message : String(err),
      userId,
      userLogin: login,
      userDisplayName: displayNameFallback || login,
      avatarUrl: directAvatar
    };
  }
}

async function enrichVip30ResultUserProfile(result = {}, options = {}) {
  const decision = result && result.decision ? result.decision : null;
  const user = decision && decision.user ? decision.user : null;
  if (!user) return { result, resolved: null };
  if (cleanString(user.avatarUrl || user.avatar_url || "")) return { result, resolved: { ok: true, reason: "avatar_already_present", avatarUrl: cleanString(user.avatarUrl || user.avatar_url || "") } };

  const resolved = await twitchResolveUserProfile({
    userId: user.userId,
    userLogin: user.userLogin,
    userDisplayName: user.userDisplayName,
    displayName: user.userDisplayName,
    avatarUrl: user.avatarUrl
  });

  if (resolved && (resolved.userId || resolved.userLogin || resolved.userDisplayName || resolved.avatarUrl)) {
    decision.user = {
      ...user,
      userId: cleanString(user.userId || resolved.userId || ""),
      userLogin: cleanString(user.userLogin || resolved.userLogin || "").toLowerCase(),
      userDisplayName: cleanString(user.userDisplayName || resolved.userDisplayName || user.userLogin || ""),
      avatarUrl: cleanString(user.avatarUrl || resolved.avatarUrl || "")
    };
  }

  result.avatarResolve = resolved;
  return { result, resolved };
}

function getTwitchBroadcasterIdRequired() {
  const broadcasterId = getTwitchClientSettings().broadcasterId;
  if (!broadcasterId) throw new Error("twitch_broadcaster_id_missing");
  return broadcasterId;
}
async function twitchAddVip(userId) {
  const cleanUserId = cleanString(userId);
  if (!cleanUserId) throw new Error("user_id_missing_for_vip_grant");
  const broadcasterId = getTwitchBroadcasterIdRequired();
  const response = await twitchHelixRequest("POST", "/channels/vips", { broadcaster_id: broadcasterId, user_id: cleanUserId }, null);
  return { ok: true, broadcasterId, userId: cleanUserId, statusCode: response.statusCode, raw: response.data };
}
async function twitchRemoveVip(userId) {
  const cleanUserId = cleanString(userId);
  if (!cleanUserId) throw new Error("user_id_missing_for_vip_revoke");
  const broadcasterId = getTwitchBroadcasterIdRequired();
  const response = await twitchHelixRequest("DELETE", "/channels/vips", { broadcaster_id: broadcasterId, user_id: cleanUserId }, null);
  return { ok: true, broadcasterId, userId: cleanUserId, statusCode: response.statusCode, raw: response.data };
}
async function twitchUpdateRedemptionStatus(rewardId, redemptionId, status) {
  const cleanRewardId = cleanString(rewardId);
  const cleanRedemptionId = cleanString(redemptionId);
  const cleanStatus = cleanString(status).toUpperCase();
  if (!cleanRewardId) throw new Error("reward_id_missing_for_redemption_update");
  if (!cleanRedemptionId) throw new Error("redemption_id_missing_for_redemption_update");
  if (!["FULFILLED", "CANCELED"].includes(cleanStatus)) throw new Error("invalid_redemption_status");
  const broadcasterId = getTwitchBroadcasterIdRequired();
  const response = await twitchHelixRequest(
    "PATCH",
    "/channel_points/custom_rewards/redemptions",
    { broadcaster_id: broadcasterId, reward_id: cleanRewardId, id: cleanRedemptionId },
    { status: cleanStatus }
  );
  return { ok: true, broadcasterId, rewardId: cleanRewardId, redemptionId: cleanRedemptionId, status: cleanStatus, statusCode: response.statusCode, raw: response.data };
}
async function twitchFulfillRedemption(rewardId, redemptionId) {
  return twitchUpdateRedemptionStatus(rewardId, redemptionId, "FULFILLED");
}
async function twitchCancelRedemption(rewardId, redemptionId) {
  return twitchUpdateRedemptionStatus(rewardId, redemptionId, "CANCELED");
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

function getVip30ChannelpointsReward() {
  ensureDbReady();
  if (!channelpointsTablesReady()) return null;
  const reward = buildRewardSummary();
  const row = database.get(`
    SELECT *
    FROM channelpoints_rewards
    WHERE action_type = :actionType
      AND action_key = :actionKey
    ORDER BY
      twitch_is_enabled DESC,
      system_enabled DESC,
      is_paused ASC,
      updated_at DESC,
      id DESC
    LIMIT 1
  `, {
    actionType: cleanString(reward.actionType || "vip30"),
    actionKey: cleanString(reward.actionKey || "vip30.redeem")
  });
  if (row) return mapChannelpointsRewardRow(row);
  return getChannelpointsRewardByKey(reward.rewardKey);
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
      step: "VIP30-STEP8",
      dryRunOnly: true,
      noTwitchWriteInThisStep: false,
      liveActionPlanTileTruth: true,
      localChannelpointsRewardWriteOnly: true,
      dbDashboardConfig: true,
      dryRunDecisionFlow: true,
      channelpointsDecisionBridge: true,
      eventsubLiveDryRunObserve: true,
      liveActionPlanOnly: false,
      fullLiveVipGrantSlotWriteFulfillCancelAlert: true,
      noFulfillCancelInThisStep: false,
      noVipGrantInThisStep: false,
      noRedemptionFulfillCancelInThisStep: false
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
  const existing = channelpointsTablesReady() ? getChannelpointsRewardByKey(reward.rewardKey) : null;
  return {
    reward_key: reward.rewardKey,
    twitch_reward_id: existing && existing.twitchRewardId ? existing.twitchRewardId : "",
    title: reward.title,
    prompt: "30 Tage VIP im CGN-Altersheim: Platz nehmen, Kissen richten, VIP-Schildchen abholen.",
    cost: reward.cost,
    category_key: reward.categoryKey,
    sort_order: intValue(cp.rewardSortOrder, 300),
    system_enabled: boolDb(boolValue(cp.systemEnabled, true)),
    twitch_is_enabled: 1,
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
    notes: cleanString(cp.notes || "VIP30-Reward wird vom VIP30-Modul verwaltet. Die VIP30-Kachel ist die Live-Wahrheit.")
  };
}

function buildChannelpointsRewardDiff(existing, desired) {
  const fields = ["twitchRewardId", "title", "cost", "categoryKey", "systemEnabled", "twitchIsEnabled", "isPaused", "actionType", "actionKey", "queueMode", "priority", "autoFulfill"];
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
  const existing = getVip30ChannelpointsReward();
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
  const insertParams = { ...desired, updated_at: now, created_at: existing && existing.createdAt ? existing.createdAt : now };
  const updateParams = { ...desired, updated_at: now };
  let action = "unchanged";
  if (existing && existing.id) {
    database.run(`
      UPDATE channelpoints_rewards SET
        twitch_reward_id = COALESCE(NULLIF(:twitch_reward_id, ''), twitch_reward_id),
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
    `, updateParams);
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
    `, insertParams);
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


function getLatestVip30TwitchRewardIdFromLogs() {
  ensureDbReady();
  if (!tableExists("vip30_log")) return "";
  const row = database.get(`
    SELECT twitch_reward_id
    FROM vip30_log
    WHERE twitch_reward_id IS NOT NULL AND twitch_reward_id != ''
      AND event_type = 'dryrun_redemption_decision'
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `, {});
  return row && row.twitch_reward_id ? cleanString(row.twitch_reward_id) : "";
}

function linkChannelpointsRewardTwitchRewardId(twitchRewardId, options = {}) {
  const cleanId = cleanString(twitchRewardId || options.twitchRewardId || "");
  if (!cleanId) return { ok: false, skipped: true, reason: "twitch_reward_id_missing", safety: { noTwitchWrite: true } };
  ensureDbReady();
  if (!channelpointsTablesReady()) return { ok: false, skipped: true, reason: "channelpoints_tables_missing", safety: { noTwitchWrite: true } };
  const reward = buildRewardSummary();
  const existing = getChannelpointsRewardByKey(reward.rewardKey);
  if (!existing || !existing.id) return { ok: false, skipped: true, reason: "local_reward_missing", twitchRewardId: cleanId, safety: { noTwitchWrite: true } };
  if (existing.twitchRewardId && existing.twitchRewardId === cleanId) {
    return { ok: true, changed: false, reason: "already_linked", reward: existing, twitchRewardId: cleanId, safety: { noTwitchWrite: true } };
  }
  if (existing.twitchRewardId && existing.twitchRewardId !== cleanId && options.force !== true) {
    return { ok: false, changed: false, reason: "different_twitch_reward_id_already_linked", existingTwitchRewardId: existing.twitchRewardId, incomingTwitchRewardId: cleanId, safety: { noTwitchWrite: true } };
  }
  const now = nowIso();
  database.run(`
    UPDATE channelpoints_rewards
    SET twitch_reward_id = :twitchRewardId,
        updated_at = :updatedAt
    WHERE reward_key = :rewardKey
  `, { twitchRewardId: cleanId, updatedAt: now, rewardKey: reward.rewardKey });
  const linked = getChannelpointsRewardByKey(reward.rewardKey);
  const result = {
    ok: true,
    changed: true,
    reason: "linked_from_eventsub_dryrun",
    reward: linked,
    twitchRewardId: cleanId,
    source: cleanString(options.source || "manual_or_eventsub"),
    safety: { localDbOnly: true, noTwitchWrite: true, noVipGrant: true, noRedemptionFulfillCancel: true }
  };
  writeLog("channelpoints_reward_twitch_id_linked", {
    success: true,
    reason: result.reason,
    message: "VIP30 Twitch Reward ID local linked",
    twitchRewardId: cleanId,
    payload: result
  });
  emitChannelpointsRewardEvent("reward.twitch_id_linked", result, result.source);
  publishStatus("channelpoints_reward_twitch_id_linked");
  return result;
}

function linkChannelpointsRewardTwitchRewardIdFromLatestLog(options = {}) {
  const explicit = cleanString(options.twitchRewardId || options.twitch_reward_id || "");
  const fromLatest = explicit || getLatestVip30TwitchRewardIdFromLogs();
  return linkChannelpointsRewardTwitchRewardId(fromLatest, { source: explicit ? "api_explicit" : "latest_vip30_log", force: options.force === true });
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

async function handleChannelpointsRedemptionBridgeEvent(envelope = {}) {
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
  const isTestEvent = normalized.source === "vip30_bridge_test_api" || (envelope && envelope.meta && envelope.meta.testEvent === true);
  let linkResult = null;
  if (!isTestEvent && normalized.twitchRewardId) {
    linkResult = linkChannelpointsRewardTwitchRewardId(normalized.twitchRewardId, { source: "eventsub_dryrun_observe" });
  }
  try {
    let result;
    if (!isTestEvent && buildLiveActionSafetyStatus().armed === true) {
      result = await executeVip30LiveStageA({
        ...normalized,
        source: "channelpoints_bridge_live_stage_a",
        bridgeMatchedBy: match.checks
      }, { reason: "channelpoints_redemption_bus_live_stage_a" });
      bridgeStats.decisions += 1;
      bridgeStats.lastReason = result && (result.reason || result.status) || "live_stage_a_done";
      emitBridgeEvent(result && result.ok ? "live.stage_a.success" : "live.stage_a.blocked_or_failed", {
        normalized: { ...normalized, event: undefined },
        match: match.checks,
        twitchRewardIdLink: linkResult,
        result: result ? {
          ok: result.ok,
          status: result.status,
          reason: result.reason || "",
          user: result.decision && result.decision.user,
          slot: result.slotWrite && result.slotWrite.slot,
          grant: result.grant ? { ok: result.grant.ok, statusCode: result.grant.statusCode } : null
        } : null,
        safety: { twitchWriteMayHaveOccurred: true, vipGrantGate: true, slotWriteGate: true, noRedemptionFulfillCancel: true, noAlert: true }
      });
      return result;
    }

    result = buildChannelpointsBridgeDecision({
      payload: { ...normalized, source: "channelpoints_bridge", bridgeMatchedBy: match.checks },
      event: envelope.event || null
    }, { reason: "channelpoints_redemption_bus", log: true });
    bridgeStats.decisions += 1;
    bridgeStats.lastReason = result && result.decision && result.decision.reason || "decision_done";
    emitBridgeEvent(result && result.decision && result.decision.wouldGrantVip ? "decision.eligible" : "decision.blocked", {
      normalized: { ...normalized, event: undefined },
      match: match.checks,
      twitchRewardIdLink: linkResult,
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
    liveExecution: buildLiveActionSafetyStatus().armed === true,
    lastEventAt: bridgeLastEventAt,
    lastIgnoredAt: bridgeLastIgnoredAt,
    lastDecisionAt: runtimeStats.lastBridgeDecisionAt,
    lastError: bridgeLastError,
    stats: { ...bridgeStats },
    reward: buildChannelpointsRewardStatus().reward,
    routes: [`${ROUTE_PREFIX}/channelpoints/bridge/status`, `${ROUTE_PREFIX}/channelpoints/bridge/test`, `${ROUTE_PREFIX}/channelpoints/reward/link-twitch-id`, `${ROUTE_PREFIX}/channelpoints/bridge/live-check`, `${ROUTE_PREFIX}/channelpoints/bridge/reset-stats`],
    safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true }
  };
}

function resetBridgeRuntimeStats(reason = "api") {
  bridgeSeenIds = [];
  bridgeSeenSet.clear();
  bridgeLastEventAt = "";
  bridgeLastIgnoredAt = "";
  bridgeLastError = "";
  bridgeStats = {
    received: 0,
    ignored: 0,
    matched: 0,
    duplicates: 0,
    decisions: 0,
    errors: 0,
    emittedTests: 0,
    lastReason: cleanString(reason, "reset"),
    lastRewardTitle: "",
    lastRewardId: "",
    lastUserLogin: ""
  };
  runtimeStats.bridgeDecisionRequests = 0;
  runtimeStats.lastBridgeDecisionAt = "";
  runtimeStats.lastBridgeDecision = null;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "bridge_runtime_stats_reset",
    reason: cleanString(reason, "api"),
    bridge: buildInternalBridgeStatus(),
    safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true }
  };
}


function buildLocalRewardOperationalState(rewardStatus) {
  const reward = rewardStatus && rewardStatus.reward ? rewardStatus.reward : null;
  const configured = reward && reward.configured ? reward.configured : buildRewardSummary();
  const existing = reward && reward.existing ? reward.existing : null;
  const differences = Array.isArray(reward && reward.differences) ? reward.differences : [];

  const expectedActionType = cleanString(configured.actionType || "vip30");
  const expectedActionKey = cleanString(configured.actionKey || "vip30.redeem");
  const expectedQueue = cleanString((getConfig().channelpoints || DEFAULT_CONFIG.channelpoints).queueMode || "vip30");

  const found = !!existing;
  const actionTypeOk = found && cleanString(existing.actionType) === expectedActionType;
  const actionKeyOk = found && cleanString(existing.actionKey) === expectedActionKey;
  const queueOk = !found || !expectedQueue || cleanString(existing.queueMode || "") === expectedQueue;
  const systemEnabled = found && existing.systemEnabled === true;
  const twitchEnabled = found && existing.twitchIsEnabled === true;
  const notPaused = found && existing.isPaused !== true;
  const active = found && actionTypeOk && actionKeyOk && systemEnabled && twitchEnabled && notPaused;

  const warnings = [];
  if (found && existing.autoFulfill === true) warnings.push("autoFulfill");
  if (found && !cleanString(existing.twitchRewardId || "")) warnings.push("twitchRewardIdMissing");
  if (found && !queueOk) warnings.push("queueDiffers");
  for (const diff of differences) {
    const field = cleanString(diff && diff.field || "");
    if (field && !["actionType", "actionKey", "systemEnabled", "twitchIsEnabled", "isPaused"].includes(field)) {
      warnings.push(`diff:${field}`);
    }
  }

  const blockingDifferences = differences.filter((d) => {
    const field = cleanString(d && d.field || "");
    return ["actionType", "actionKey", "systemEnabled", "twitchIsEnabled", "isPaused"].includes(field);
  });

  return {
    strictInSync: rewardStatus && rewardStatus.status === "linked_in_sync",
    operational: active,
    active,
    found,
    status: rewardStatus && rewardStatus.status || "unknown",
    actionTypeOk,
    actionKeyOk,
    queueOk,
    systemEnabled,
    twitchEnabled,
    notPaused,
    autoFulfill: found && existing.autoFulfill === true,
    twitchRewardIdLinked: found && !!cleanString(existing.twitchRewardId || ""),
    warnings: [...new Set(warnings)],
    blockingDifferences,
    differences
  };
}

function buildLiveActionSafetyStatus() {
  const config = getConfig();
  const rewardStatus = buildChannelpointsRewardStatus();
  const reward = rewardStatus && rewardStatus.reward ? rewardStatus.reward : null;
  const existing = reward && reward.existing ? reward.existing : null;
  const localRewardState = buildLocalRewardOperationalState(rewardStatus);
  const checks = {
    moduleEnabled: config.enabled !== false,
    vip30TileFound: localRewardState.found === true,
    vip30TileActive: localRewardState.active === true,
    actionTypeVip30: localRewardState.actionTypeOk === true,
    actionKeyVip30: localRewardState.actionKeyOk === true,
    rewardSystemEnabled: localRewardState.systemEnabled === true,
    rewardTwitchEnabled: localRewardState.twitchEnabled === true,
    rewardNotPaused: localRewardState.notPaused === true,
    queueOk: localRewardState.queueOk === true
  };

  const info = {
    twitchRewardIdLinked: localRewardState.twitchRewardIdLinked === true,
    autoFulfillDisabled: localRewardState.autoFulfill !== true
  };

  const blockers = [];
  for (const [key, value] of Object.entries(checks)) {
    if (!value) blockers.push(key);
  }
  const armed = blockers.length === 0;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: armed ? "vip30_tile_active" : "vip30_tile_blocked",
    checkedAt: nowIso(),
    armed,
    checks,
    info,
    warnings: localRewardState.warnings || [],
    blockers,
    compact: {
      status: armed ? "vip30_tile_active" : "vip30_tile_blocked",
      armed,
      blockerCount: blockers.length,
      blockers
    },
    reward: existing ? {
      rewardKey: existing.rewardKey,
      twitchRewardId: existing.twitchRewardId,
      title: existing.title,
      cost: existing.cost,
      actionType: existing.actionType,
      actionKey: existing.actionKey,
      queueMode: existing.queueMode,
      systemEnabled: existing.systemEnabled === true,
      twitchIsEnabled: existing.twitchIsEnabled === true,
      isPaused: existing.isPaused === true,
      autoFulfill: existing.autoFulfill === true,
      inSync: !!(reward && reward.inSync),
      operational: localRewardState.active === true,
      channelpointsRewardActive: localRewardState.active === true,
      strictInSync: localRewardState.strictInSync === true,
      status: localRewardState.status,
      blockingDifferences: localRewardState.blockingDifferences,
      warnings: localRewardState.warnings
    } : null,
    tile: {
      found: localRewardState.found === true,
      active: localRewardState.active === true,
      actionTypeOk: localRewardState.actionTypeOk === true,
      actionKeyOk: localRewardState.actionKeyOk === true,
      queueOk: localRewardState.queueOk === true,
      systemEnabled: localRewardState.systemEnabled === true,
      twitchEnabled: localRewardState.twitchEnabled === true,
      notPaused: localRewardState.notPaused === true,
      autoFulfill: localRewardState.autoFulfill === true,
      twitchRewardIdLinked: localRewardState.twitchRewardIdLinked === true
    },
    safety: armed ? {
      liveActionsWouldRun: true,
      requiresEventOrExplicitExecute: true,
      tileIsTruth: true
    } : {
      liveActionsWouldRun: false,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      tileIsTruth: true
    }
  };
}

function buildLiveArmPreview() {
  const safety = buildLiveActionSafetyStatus();
  const blockerInfo = {
    moduleEnabled: { setting: "enabled", requiredValue: true, label: "VIP30-Modul aktiv" },
    vip30TileFound: { setting: "channelpoints_rewards", requiredValue: "actionType=vip30/actionKey=vip30.redeem", label: "VIP30-Kachel gefunden" },
    vip30TileActive: { setting: "channelpoints_rewards.twitch_is_enabled", requiredValue: true, label: "VIP30-Kachel auf Twitch aktiv" },
    actionTypeVip30: { setting: "channelpoints_rewards.action_type", requiredValue: "vip30", label: "Action-Type vip30" },
    actionKeyVip30: { setting: "channelpoints_rewards.action_key", requiredValue: "vip30.redeem", label: "Action-Key vip30.redeem" },
    rewardSystemEnabled: { setting: "channelpoints_rewards.system_enabled", requiredValue: true, label: "Kachel im System aktiv" },
    rewardTwitchEnabled: { setting: "channelpoints_rewards.twitch_is_enabled", requiredValue: true, label: "Kachel auf Twitch aktiv" },
    rewardNotPaused: { setting: "channelpoints_rewards.is_paused", requiredValue: false, label: "Kachel nicht pausiert" }
  };
  const missing = (safety.blockers || []).map((key) => ({ key, ...(blockerInfo[key] || { setting: key, requiredValue: true, label: key }) }));
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_live_arm_preview",
    status: safety.armed ? "ready" : "tile_blocked",
    checkedAt: nowIso(),
    armed: safety.armed,
    blockerCount: missing.length,
    blockers: (safety.blockers || []).slice(),
    missing,
    current: {
      tile: safety.tile,
      info: safety.info,
      reward: safety.reward
    },
    recommendedOrder: [
      { step: 1, name: "check_tile", route: `${ROUTE_PREFIX}/channelpoints/reward/status`, write: false },
      { step: 2, name: "activate_or_fix_channelpoints_tile", action: "Dashboard Kanalpunkte-Kachel aktivieren und Action-Type/Action-Key pruefen", write: "channelpoints dashboard" },
      { step: 3, name: "test_redeem", action: "Test-Redeem ausfuehren", write: "twitch redemption" }
    ],
    nextPhaseSuggestion: safety.armed ? "ready_for_live_redeem" : "fix_vip30_tile",
    safety: {
      previewOnly: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true
    }
  };
}

function buildLiveArmSettingsPreview(profile = "tile_truth") {
  const before = buildLiveArmPreview();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_live_arm_settings_preview",
    profile: cleanString(profile || "tile_truth"),
    label: "Legacy-Gates entfernt",
    before: {
      armed: before.armed,
      blockerCount: before.blockerCount,
      blockers: before.blockers
    },
    settings: {},
    wouldChange: [],
    expectedRemainingBlockers: before.blockers || [],
    note: "STEP8.19.25: Alte Live-Gates wurden entfernt. VIP30-Live-Bereitschaft basiert nur noch auf der VIP30-Kachel-Wahrheit.",
    safety: { previewOnly: true, noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true }
  };
}

function setLiveGatesFromPayload(payload = {}, query = {}) {
  const before = buildLiveArmPreview();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_live_set_gates",
    skipped: true,
    reason: "legacy_live_gates_removed",
    profile: cleanString((query && query.profile) || (payload && payload.profile) || "tile_truth"),
    label: "Legacy-Gates entfernt",
    changed: [],
    rejected: [],
    before: { armed: before.armed, blockerCount: before.blockerCount, blockers: before.blockers },
    after: { armed: before.armed, blockerCount: before.blockerCount, blockers: before.blockers, missing: before.missing },
    liveCheck: buildLiveActionSafetyStatus().compact,
    note: "STEP8.19.25: Diese Route ist aus Kompatibilitaetsgruenden vorhanden, setzt aber keine alten Live-Gates mehr.",
    safety: {
      settingsOnly: true,
      noTwitchWriteInThisRoute: true,
      noVipGrantInThisRoute: true,
      noSlotWriteInThisRoute: true,
      noRedemptionFulfillCancelInThisRoute: true,
      noAlertInThisRoute: true
    }
  };
}

function buildRedemptionLiveActionPlan(input = {}, options = {}) {
  const decision = buildDryRunRedemptionDecision(input, { reason: options.reason || "live_plan", log: false });
  const safety = buildLiveActionSafetyStatus();
  const plan = [];
  if (decision.wouldGrantVip) {
    plan.push({ order: 1, action: "twitch_add_vip", enabledByGate: safety.armed === true, required: true, userId: decision.user.userId, userLogin: decision.user.userLogin });
    plan.push({ order: 2, action: "create_vip30_slot", enabledByGate: safety.armed === true, required: true, durationDays: getConfig().slots.durationDays });
    plan.push({ order: 3, action: "twitch_redemption_fulfill", enabledByGate: safety.armed === true, required: true, twitchRewardId: decision.redemption.twitchRewardId, twitchRedemptionId: decision.redemption.twitchRedemptionId });
    if (decision.wouldTriggerAlert) plan.push({ order: 4, action: "trigger_vip30_alert", enabledByGate: safety.armed === true, required: false });
  } else if (decision.wouldCancelRedemption) {
    plan.push({ order: 1, action: "twitch_redemption_cancel", enabledByGate: safety.armed === true, required: true, twitchRewardId: decision.redemption.twitchRewardId, twitchRedemptionId: decision.redemption.twitchRedemptionId, reason: decision.reason });
  }
  const result = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_live_action_plan",
    createdAt: nowIso(),
    execute: false,
    decision,
    liveSafety: safety,
    plan,
    safety: {
      planOnly: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      note: "Plan zeigt die Live-Aktionen anhand der VIP30-Kachel-Wahrheit, fuehrt aber in dieser Route nichts aus."
    }
  };
  writeLog("live_action_plan", {
    userId: decision.user.userId,
    userLogin: decision.user.userLogin,
    userDisplayName: decision.user.userDisplayName,
    twitchRewardId: decision.redemption.twitchRewardId,
    twitchRedemptionId: decision.redemption.twitchRedemptionId,
    success: decision.wouldGrantVip === true,
    reason: decision.reason,
    message: safety.armed ? "Live-Action-Plan erstellt: VIP30-Kachel ist livefaehig." : "Live-Action-Plan erstellt: VIP30-Kachel blockiert.",
    payload: result
  });
  emitLiveActionPlanEvent(result, options.reason || "live_plan_api");
  publishStatus("live_action_plan");
  return result;
}


function buildStageALiveSafetyStatus() {
  const full = buildLiveActionSafetyStatus();
  const checks = { ...(full.checks || {}) };
  const blockers = Array.isArray(full.blockers) ? full.blockers.slice() : [];
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: blockers.length ? "stage_a_locked" : "stage_a_ready",
    checkedAt: nowIso(),
    armed: blockers.length === 0,
    blockerCount: blockers.length,
    blockers,
    checks,
    fullLiveSafety: {
      status: full.status,
      armed: full.armed,
      blockerCount: Array.isArray(full.blockers) ? full.blockers.length : 0,
      blockers: full.blockers || []
    },
    note: "Legacy-Stage-A nutzt seit STEP8.19.25 dieselbe Kachel-Wahrheit wie der Live-Flow. Alte Live-Gates blockieren nicht mehr."
  };
}
function buildStageBLiveSafetyStatus() {
  const full = buildLiveActionSafetyStatus();
  const checks = { ...(full.checks || {}) };
  const blockers = Array.isArray(full.blockers) ? full.blockers.slice() : [];
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: blockers.length ? "stage_b_locked" : "stage_b_ready",
    checkedAt: nowIso(),
    armed: blockers.length === 0,
    blockerCount: blockers.length,
    blockers,
    checks,
    fullLiveSafety: {
      status: full.status,
      armed: full.armed,
      blockerCount: Array.isArray(full.blockers) ? full.blockers.length : 0,
      blockers: full.blockers || []
    },
    note: "Stage B ist der normale VIP30-Live-Flow: VIP vergeben, Slot schreiben, Redemption abrechnen und Alert ausloesen."
  };
}

async function triggerVip30AlertSoundBundle(result = {}, options = {}) {
  const config = getConfig();
  const alerts = config.alerts || DEFAULT_CONFIG.alerts;
  const userLogin = result && result.decision && result.decision.user ? cleanString(result.decision.user.userLogin || "").toLowerCase() : "";
  const skipped = (reason) => {
    runtimeStats.alertSkipped += 1;
    runtimeStats.lastAlertAt = nowIso();
    runtimeStats.lastAlertStatus = "skipped";
    runtimeStats.lastAlertReason = reason;
    runtimeStats.lastAlertUserLogin = userLogin;
    return { ok: true, skipped: true, reason, delivery: "sound_bundle", safety: { noTwitchWrite: true, alertOnly: true } };
  };

  if (!result || result.ok !== true) return skipped("result_not_successful");
  if (alerts.enabled === false) return skipped("alerts_disabled");

  if (!hasVip30ConfiguredSound(alerts)) return skipped("media_not_configured");

  const enriched = await enrichVip30ResultUserProfile(result, options);
  result = enriched && enriched.result ? enriched.result : result;

  const payload = buildVip30AlertPayload(result);
  const bundlePayload = buildVip30SoundBundlePayload(payload, options);
  const bundleUrl = cleanString(alerts.soundBundleUrl || DEFAULT_CONFIG.alerts.soundBundleUrl || "/api/sound/bundle");

  try {
    const response = await httpPostJson(bundleUrl, bundlePayload);
    const ok = response && response.ok === true && response.data && response.data.ok !== false;
    if (!ok) {
      const reason = response && response.data && (response.data.error || response.data.message) ? cleanString(response.data.error || response.data.message) : `sound_bundle_http_${response ? response.statusCode : "unknown"}`;
      runtimeStats.alertFailed += 1;
      runtimeStats.lastAlertAt = nowIso();
      runtimeStats.lastAlertStatus = "failed";
      runtimeStats.lastAlertReason = reason;
      runtimeStats.lastAlertUserLogin = userLogin;
      writeLog("vip30_alert_sound_bundle_failed", {
        userId: payload.user.userId,
        userLogin: payload.user.userLogin,
        userDisplayName: payload.user.userDisplayName,
        success: false,
        reason: "sound_bundle_failed",
        message: reason,
        errorMessage: reason,
        payload: { alert: payload, bundleRequest: bundlePayload, bundleResponse: response }
      });
      return { ok: false, skipped: false, status: "sound_bundle_failed", reason, response, payload: bundlePayload, safety: { noTwitchWrite: true, alertOnly: true } };
    }

    runtimeStats.alertTriggers += 1;
    runtimeStats.lastAlertAt = nowIso();
    runtimeStats.lastAlertStatus = "sound_bundle_queued";
    runtimeStats.lastAlertReason = "sound_bundle_queued";
    runtimeStats.lastAlertUserLogin = userLogin;

    const currentBus = getBus();
    let emitted = null;
    if (currentBus && typeof currentBus.emit === "function" && !(config.bus && config.bus.enabled === false)) {
      try {
        emitted = currentBus.emit({
          type: "event",
          channel: "vip30.alert",
          action: "sound_bundle.queued",
          source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
          target: { type: "module", id: "sound_system", module: "sound_system" },
          payload: { ...payload, soundBundle: bundlePayload, soundResponse: response.data, emittedAt: nowIso(), reason: cleanString(options.reason || "live_success") },
          meta: { requireAck: false, replayable: true, ttlMs: config.bus && config.bus.ttlMs || 60000, productionTarget: true, twitchWrite: false, soundSystemOwnsPlayback: true }
        });
      } catch (_) {}
    }

    writeLog("vip30_alert_sound_bundle_queued", {
      userId: payload.user.userId,
      userLogin: payload.user.userLogin,
      userDisplayName: payload.user.userDisplayName,
      twitchRewardId: payload.sourceResult.twitchRewardId,
      twitchRedemptionId: payload.sourceResult.twitchRedemptionId,
      slotId: payload.slot.slotId,
      success: true,
      reason: "sound_bundle_queued",
      message: "VIP30-Alert wurde als Sound-System-Bundle in die Warteschlange gelegt.",
      payload: { alert: payload, bundleRequest: bundlePayload, bundleResponse: response.data, bus: emitted }
    });
    return { ok: true, skipped: false, status: "sound_bundle_queued", delivery: "sound_bundle", soundBundle: bundlePayload, soundResponse: response.data, bus: emitted };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    runtimeStats.alertFailed += 1;
    runtimeStats.lastAlertAt = nowIso();
    runtimeStats.lastAlertStatus = "failed";
    runtimeStats.lastAlertReason = message;
    runtimeStats.lastAlertUserLogin = userLogin;
    writeLog("vip30_alert_sound_bundle_failed", {
      userId: payload.user.userId,
      userLogin: payload.user.userLogin,
      userDisplayName: payload.user.userDisplayName,
      success: false,
      reason: "sound_bundle_request_failed",
      message,
      errorMessage: message,
      payload: { alert: payload, bundleRequest: bundlePayload }
    });
    return { ok: false, reason: "sound_bundle_request_failed", error: message, delivery: "sound_bundle", safety: { noTwitchWrite: true, alertOnly: true } };
  }
}

function buildVip30AlertTestResult(input = {}) {
  const now = nowIso();
  const body = input && typeof input === "object" ? input : {};
  const userLogin = cleanString(body.userLogin || body.login || body.user || "testrentner").toLowerCase();
  const userDisplayName = cleanString(body.userDisplayName || body.displayName || body.display_name || "TestRentner");
  const userId = cleanString(body.userId || body.user_id || "vip30-test-user");
  const avatarUrl = cleanString(body.avatarUrl || body.avatar_url || "");
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_alert_manual_test",
    status: "test_success",
    decision: {
      ok: true,
      status: "test_success",
      reason: "manual_alert_test",
      wouldGrantVip: false,
      wouldCreateSlot: false,
      wouldFulfillRedemption: false,
      wouldCancelRedemption: false,
      wouldTriggerAlert: true,
      user: {
        userId,
        userLogin,
        userDisplayName,
        avatarUrl,
        targetIsModerator: false,
        targetIsVip: false
      },
      redemption: {
        twitchRewardId: cleanString(body.twitchRewardId || "vip30-test-reward"),
        twitchRedemptionId: cleanString(body.twitchRedemptionId || `vip30-test-${Date.now()}`),
        userInput: cleanString(body.userInput || "manual alert test"),
        redeemedAt: now,
        source: "manual_alert_test"
      }
    },
    slotWrite: {
      slotId: "test",
      startUtc: now,
      endUtc: new Date(Date.now() + Math.max(1, intValue(getConfig().slots && getConfig().slots.durationDays, 30)) * 86400000).toISOString(),
      slot: {
        id: "test",
        userId,
        userLogin,
        userDisplayName,
        avatarUrl,
        status: "test",
        startUtc: now
      }
    },
    safety: {
      manualTest: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      alertOnly: true
    }
  };
}

async function triggerVip30ManualAlertTest(input = {}) {
  const requested = input && typeof input === "object" ? input : {};
  const resolvedUser = await twitchResolveUserProfile({
    userId: requested.userId || requested.user_id || "",
    userLogin: requested.userLogin || requested.user_login || requested.login || requested.user || requested.displayName || requested.display_name || requested.userDisplayName || requested.user_display_name || "",
    userDisplayName: requested.userDisplayName || requested.user_display_name || requested.displayName || requested.display_name || requested.user || requested.login || "",
    displayName: requested.displayName || requested.display_name || requested.userDisplayName || requested.user_display_name || requested.user || requested.login || "",
    avatarUrl: requested.avatarUrl || requested.avatar_url || ""
  });
  const testInput = {
    ...requested,
    userId: cleanString(requested.userId || requested.user_id || resolvedUser.userId || "vip30-test-user"),
    userLogin: cleanString(requested.userLogin || requested.user_login || requested.login || resolvedUser.userLogin || requested.displayName || requested.user || "testrentner").toLowerCase(),
    userDisplayName: cleanString(requested.userDisplayName || requested.user_display_name || requested.displayName || requested.display_name || resolvedUser.userDisplayName || requested.user || "TestRentner"),
    avatarUrl: cleanString(requested.avatarUrl || requested.avatar_url || resolvedUser.avatarUrl || "")
  };
  const testResult = buildVip30AlertTestResult(testInput);
  testResult.avatarResolve = resolvedUser;
  const result = await triggerVip30AlertSoundBundle(testResult, { reason: "manual_alert_test" });
  writeLog("vip30_alert_manual_test", {
    userId: testResult.decision.user.userId,
    userLogin: testResult.decision.user.userLogin,
    userDisplayName: testResult.decision.user.userDisplayName,
    success: result && result.ok === true,
    reason: result && (result.reason || result.status) || "manual_alert_test",
    message: result && result.ok === true ? "Manueller VIP30-Alert-Test wurde ausgelöst." : "Manueller VIP30-Alert-Test fehlgeschlagen.",
    payload: { testResult, result }
  });
  return {
    ok: result && result.ok === true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_alert_manual_test",
    status: result && (result.status || result.reason) || "unknown",
    result,
    selected: {
      overlaySetId: result && result.soundBundle && result.soundBundle.visual ? result.soundBundle.visual.overlaySetId : "",
      headline: result && result.soundBundle && result.soundBundle.visual ? result.soundBundle.visual.headline : "",
      soundPoolId: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] && result.soundBundle.items[0].meta ? result.soundBundle.items[0].meta.soundPoolId : "",
      soundLabel: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] && result.soundBundle.items[0].meta ? result.soundBundle.items[0].meta.soundLabel : "",
      mediaId: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] ? result.soundBundle.items[0].mediaId || 0 : 0,
      mediaPath: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] ? result.soundBundle.items[0].mediaPath || "" : "",
      durationMode: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] && result.soundBundle.items[0].meta ? result.soundBundle.items[0].meta.durationMode || "" : "",
      requestedDurationMs: result && result.soundBundle && result.soundBundle.items && result.soundBundle.items[0] && result.soundBundle.items[0].meta ? result.soundBundle.items[0].meta.requestedDurationMs || 0 : 0,
      avatarResolved: testResult.avatarResolve ? testResult.avatarResolve.ok === true : false,
      avatarResolveReason: testResult.avatarResolve ? testResult.avatarResolve.reason || "" : "",
      avatarUrl: testResult.decision && testResult.decision.user ? testResult.decision.user.avatarUrl || "" : ""
    },
    safety: {
      manualTest: true,
      noTwitchWrite: true,
      noVipGrant: true,
      noSlotWrite: true,
      noRedemptionFulfillCancel: true,
      alertOnly: true
    }
  };
}


function vip30DecisionDisplayName(decision = {}) {
  const user = decision && decision.user ? decision.user : {};
  return cleanString(user.userDisplayName || user.userLogin || user.userId || "User");
}

function vip30SafeReasonText(reason = "") {
  const key = cleanString(reason || "");
  const map = {
    already_has_vip30_slot: "hat bereits einen aktiven 30-Tage-VIP-Slot",
    target_is_already_vip: "ist bereits VIP",
    target_is_moderator: "ist Moderator und bekommt kein VIP30-Upgrade",
    slots_full: "alle VIP30-Slots sind belegt",
    module_disabled: "VIP30 ist aktuell deaktiviert",
    missing_user: "Userdaten fehlen",
    live_stage_a_failed: "Twitch hat die VIP-Vergabe abgelehnt",
    live_stage_b_failed: "Twitch hat die VIP-Vergabe abgelehnt",
    twitch_helix_post_channels_vips_failed_422: "ist bereits VIP oder Twitch lehnt die VIP-Vergabe ab"
  };
  return map[key] || key || "unbekannter Grund";
}

function buildVip30DecisionBlockedChatText(decision = {}, result = {}) {
  const name = vip30DecisionDisplayName(decision);
  const reason = cleanString(result.reason || decision.reason || "");
  if (reason === "already_has_vip30_slot") {
    return `ℹ️ ${name} hat bereits einen aktiven 30-Tage-VIP-Slot. Die Kanalpunkte wurden zurückgegeben.`;
  }
  if (reason === "target_is_already_vip") {
    return `ℹ️ ${name} ist bereits VIP. 30 Tage VIP wurden nicht erneut vergeben, die Kanalpunkte wurden zurückgegeben.`;
  }
  if (reason === "target_is_moderator") {
    return `ℹ️ ${name} ist Moderator. VIP30 wurde nicht vergeben, die Kanalpunkte wurden zurückgegeben.`;
  }
  if (reason === "slots_full") {
    return `⚠️ Alle VIP30-Plätze sind aktuell belegt. Die Kanalpunkte von ${name} wurden zurückgegeben.`;
  }
  return `ℹ️ VIP30 für ${name} wurde nicht ausgeführt: ${vip30SafeReasonText(reason)}. Die Kanalpunkte wurden zurückgegeben.`;
}

function buildVip30SuccessChatText(decision = {}) {
  const name = vip30DecisionDisplayName(decision);
  return `🎖️ ${name} hat 30 Tage VIP erhalten. Willkommen in der CGN VIP-Lounge!`;
}

function buildVip30FailedChatText(decision = {}, result = {}) {
  const name = vip30DecisionDisplayName(decision);
  const reason = cleanString(result.reason || (result.error && result.error.message) || "");
  const refunded = result && result.redemptionUpdate && result.redemptionUpdate.ok === true;
  if (refunded) {
    return `⚠️ VIP30 für ${name} konnte nicht vergeben werden: ${vip30SafeReasonText(reason)}. Die Kanalpunkte wurden zurückgegeben.`;
  }
  return `⚠️ VIP30 für ${name} konnte nicht vergeben werden: ${vip30SafeReasonText(reason)}. Bitte kurz manuell prüfen.`;
}

function buildVip30SafetyBlockedChatText(decision = {}, result = {}) {
  const name = vip30DecisionDisplayName(decision);
  const blockers = result && result.stageSafety && Array.isArray(result.stageSafety.blockers) ? result.stageSafety.blockers.join(", ") : "";
  return `⚠️ VIP30 für ${name} ist gerade nicht live-bereit. Blocker: ${blockers || "unbekannt"}.`;
}

async function sendVip30LiveChatMessage(text, reason = "vip30_live") {
  const message = cleanString(text || "");
  if (!message) return { ok: true, skipped: true, reason: "empty_message" };
  try {
    return await chatOutput.sendChatMessage(message, {
      source: MODULE_NAME,
      reason,
      directSendEnabled: true,
      fallbackToStreamer: true,
      fallbackToStreamerbot: true,
      maxLength: 450
    });
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      sent: false,
      reason: "chat_output_failed",
      error: err && err.message ? err.message : String(err),
      message
    };
  }
}


async function executeVip30LiveStageA(input = {}, options = {}) {
  const decision = buildDryRunRedemptionDecision(input, { reason: options.reason || "live_flow", log: false });
  const started = nowIso();

  loadedConfig = null;
  const refreshedConfig = loadConfig();
  const stageMode = "B";
  const stageSafety = buildStageBLiveSafetyStatus();
  const result = {
    ok: false,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: stageMode === "B" ? "vip30_live_stage_b_execute" : "vip30_live_stage_a_execute",
    startedAt: started,
    finishedAt: "",
    status: "not_started",
    decision,
    stageSafety,
    grant: null,
    slotWrite: null,
    redemptionUpdate: null,
    alert: null,
    chat: null,
    safety: {
      liveTwitchWrite: true,
      vipGrantAllowed: stageSafety.armed === true,
      slotWriteAllowed: stageSafety.armed === true,
      redemptionFulfillCancelAllowed: stageSafety.armed === true,
      alertAllowed: !(refreshedConfig.alerts && refreshedConfig.alerts.enabled === false),
      noRedemptionFulfillCancel: false,
      noAlert: refreshedConfig.alerts && refreshedConfig.alerts.enabled === false,
      stage: stageMode,
      tileIsTruth: true
    }
  };

  if (!stageSafety.armed) {
    result.status = "blocked_by_tile_truth";
    result.reason = "tile_truth_not_armed";
    result.finishedAt = nowIso();
    writeLog("live_stage_a_blocked", {
      userId: decision.user.userId,
      userLogin: decision.user.userLogin,
      userDisplayName: decision.user.userDisplayName,
      twitchRewardId: decision.redemption.twitchRewardId,
      twitchRedemptionId: decision.redemption.twitchRedemptionId,
      success: false,
      reason: result.reason,
      message: `Stage ${stageMode} ist nicht scharf. VIP wurde nicht vergeben. Blocker: ${(stageSafety.blockers || []).join(", ") || "unknown"}`,
      payload: result
    });
    result.chat = await sendVip30LiveChatMessage(buildVip30SafetyBlockedChatText(decision, result), "vip30_live_safety_blocked");
    emitLiveExecutionEvent("live.blocked", { result });
    return result;
  }

  if (!decision.wouldGrantVip) {
    result.status = "decision_blocked";
    result.reason = decision.reason;
    if (stageMode === "B" && decision.wouldCancelRedemption) {
      try {
        result.redemptionUpdate = await twitchCancelRedemption(decision.redemption.twitchRewardId, decision.redemption.twitchRedemptionId);
        result.status = "decision_blocked_redemption_canceled";
      } catch (cancelErr) {
        result.redemptionUpdate = { ok: false, error: cancelErr && cancelErr.message ? cancelErr.message : String(cancelErr), statusCode: cancelErr && cancelErr.statusCode || 0, data: cancelErr && cancelErr.data || null };
        result.status = "decision_blocked_cancel_failed";
      }
    }
    result.finishedAt = nowIso();
    writeLog(stageMode === "B" ? "live_stage_b_decision_blocked" : "live_stage_a_decision_blocked", {
      userId: decision.user.userId,
      userLogin: decision.user.userLogin,
      userDisplayName: decision.user.userDisplayName,
      twitchRewardId: decision.redemption.twitchRewardId,
      twitchRedemptionId: decision.redemption.twitchRedemptionId,
      success: false,
      reason: decision.reason,
      message: stageMode === "B" && result.redemptionUpdate && result.redemptionUpdate.ok
        ? "VIP30-Entscheidung blockiert. Redemption wurde canceled/refunded."
        : (decision.message || "VIP30-Entscheidung blockiert. Keine Twitch-Aktion ausgefuehrt."),
      payload: result
    });
    result.chat = await sendVip30LiveChatMessage(buildVip30DecisionBlockedChatText(decision, result), "vip30_live_decision_blocked");
    emitLiveExecutionEvent(stageMode === "B" ? "stage_b.decision_blocked" : "stage_a.decision_blocked", { result });
    return result;
  }

  try {
    const activeAgain = findActiveSlotForDecision({ userId: decision.user.userId, userLogin: decision.user.userLogin });
    if (activeAgain) throw Object.assign(new Error("already_has_vip30_slot_before_live_write"), { code: "already_has_vip30_slot", activeSlot: activeAgain });
    result.grant = await twitchAddVip(decision.user.userId);
    result.slotWrite = createVip30SlotFromDecision(decision, stageMode === "B" ? "live_stage_b_eventsub" : "live_stage_a_eventsub");
    if (stageMode === "B") {
      result.redemptionUpdate = await twitchFulfillRedemption(decision.redemption.twitchRewardId, decision.redemption.twitchRedemptionId);
    }
    result.ok = true;
    result.status = stageMode === "B" ? "vip_granted_slot_created_redemption_fulfilled" : "vip_granted_slot_created";
    result.finishedAt = nowIso();
    writeLog(stageMode === "B" ? "live_stage_b_vip_granted_slot_created_redemption_fulfilled" : "live_stage_a_vip_granted_slot_created", {
      userId: decision.user.userId,
      userLogin: decision.user.userLogin,
      userDisplayName: decision.user.userDisplayName,
      twitchRewardId: decision.redemption.twitchRewardId,
      twitchRedemptionId: decision.redemption.twitchRedemptionId,
      slotId: result.slotWrite && result.slotWrite.slotId,
      success: true,
      reason: result.status,
      message: stageMode === "B"
        ? "VIP30-Live-Flow erfolgreich: Twitch VIP vergeben, VIP30-Slot gespeichert und Redemption fulfilled."
        : "VIP30-Live-Flow erfolgreich: Twitch VIP vergeben und VIP30-Slot gespeichert.",
      payload: result
    });
    result.chat = await sendVip30LiveChatMessage(buildVip30SuccessChatText(decision), "vip30_live_success");
    result.alert = await triggerVip30AlertSoundBundle(result, { reason: stageMode === "B" ? "live_stage_b_success" : "live_stage_a_success" });
    emitLiveExecutionEvent(stageMode === "B" ? "stage_b.success" : "stage_a.success", { result: { ...result, grant: { ...result.grant, raw: undefined }, redemptionUpdate: result.redemptionUpdate ? { ...result.redemptionUpdate, raw: undefined } : null, alert: result.alert ? { ok: result.alert.ok, skipped: result.alert.skipped, status: result.alert.status || "", reason: result.alert.reason || "", delivery: result.alert.delivery || "" } : null } });
    publishStatus(stageMode === "B" ? "live_stage_b_success" : "live_stage_a_success");
    return result;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    result.status = "failed";
    result.reason = err && err.code || "live_stage_a_failed";
    result.error = { message, statusCode: err && err.statusCode || 0, data: err && err.data || null, activeSlot: err && err.activeSlot || null };
    if (stageMode === "B" && decision.redemption && decision.redemption.twitchRewardId && decision.redemption.twitchRedemptionId) {
      try {
        result.redemptionUpdate = await twitchCancelRedemption(decision.redemption.twitchRewardId, decision.redemption.twitchRedemptionId);
        if (result.redemptionUpdate && result.redemptionUpdate.ok) {
          result.status = "failed_redemption_canceled";
        }
      } catch (cancelErr) {
        result.redemptionUpdate = { ok: false, error: cancelErr && cancelErr.message ? cancelErr.message : String(cancelErr), statusCode: cancelErr && cancelErr.statusCode || 0, data: cancelErr && cancelErr.data || null };
      }
    }
    result.finishedAt = nowIso();
    writeLog(stageMode === "B" ? "live_stage_b_failed" : "live_stage_a_failed", {
      userId: decision.user.userId,
      userLogin: decision.user.userLogin,
      userDisplayName: decision.user.userDisplayName,
      twitchRewardId: decision.redemption.twitchRewardId,
      twitchRedemptionId: decision.redemption.twitchRedemptionId,
      success: false,
      reason: result.reason,
      message,
      errorCode: result.reason,
      errorMessage: message,
      payload: result
    });
    result.chat = await sendVip30LiveChatMessage(buildVip30FailedChatText(decision, result), "vip30_live_failed");
    lastError = message;
    emitLiveExecutionEvent(stageMode === "B" ? "stage_b.failed" : "stage_a.failed", { result });
    publishStatus(stageMode === "B" ? "live_stage_b_failed" : "live_stage_a_failed");
    return result;
  }
}


function listExpiredActiveSlots(limitInput = 50) {
  ensureDbReady();
  const now = nowIso();
  const limit = Math.max(1, Math.min(500, intValue(limitInput, 50)));
  const rows = database.all(`
    SELECT * FROM vip30_slots
    WHERE status = 'active'
      AND end_utc IS NOT NULL
      AND end_utc <> ''
      AND end_utc <= :now
    ORDER BY end_utc ASC, id ASC
    LIMIT :limit
  `, { now, limit }) || [];
  return rows.map(mapSlotRow);
}
function updateSlotAfterCleanup(slotId, status, details = {}) {
  ensureDbReady();
  const id = intValue(slotId, 0);
  if (!id) throw new Error("slot_id_missing_for_cleanup_update");
  const now = nowIso();
  const cleanStatus = cleanString(status || "expired");
  const lastError = cleanString(details.lastError || details.error || "");
  database.run(`
    UPDATE vip30_slots
    SET status = :status,
        updated_at = :updated_at,
        revoked_at = :revoked_at,
        last_error = :last_error
    WHERE id = :id
  `, {
    id,
    status: cleanStatus,
    updated_at: now,
    revoked_at: now,
    last_error: lastError
  });
  const row = database.get("SELECT * FROM vip30_slots WHERE id = :id", { id });
  return mapSlotRow(row);
}
function buildCleanupSafetyStatus(options = {}) {
  const config = getConfig();
  const blockers = [];
  const checks = {
    cleanupEnabled: config.cleanup && config.cleanup.enabled !== false,
    removeVipOnExpire: config.cleanup && config.cleanup.removeVipOnExpire !== false
  };
  if (!checks.cleanupEnabled) blockers.push("cleanupEnabled");
  if (!checks.removeVipOnExpire) blockers.push("removeVipOnExpire");
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: blockers.length ? "cleanup_locked" : "cleanup_ready",
    checkedAt: nowIso(),
    armed: blockers.length === 0,
    blockerCount: blockers.length,
    blockers,
    checks,
    note: "Cleanup entzieht Twitch-VIP nur fuer abgelaufene aktive VIP30-Slots und markiert diese als expired. Kein Alert."
  };
}
function buildCleanupCheck(query = {}) {
  const limit = intValue(query.limit, 50);
  const expiredSlots = listExpiredActiveSlots(limit);
  const safety = buildCleanupSafetyStatus();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_cleanup_check",
    checkedAt: nowIso(),
    expiredCount: expiredSlots.length,
    expiredSlots,
    safety,
    summary: {
      hasExpiredSlots: expiredSlots.length > 0,
      cleanupArmed: safety.armed,
      wouldRemoveVip: safety.armed && expiredSlots.length > 0
    }
  };
}
async function runVip30Cleanup(input = {}, options = {}) {
  loadedConfig = null;
  loadConfig();
  loadedConfig = null;
  loadConfig();
  const safety = buildCleanupSafetyStatus();
  const confirm = cleanString(input.confirm || input.confirmation || options.confirm || "").toUpperCase();
  const dryRun = boolValue(input.dryRun ?? input.dry_run ?? options.dryRun, confirm !== "YES");
  const limit = intValue(input.limit || options.limit, 50);
  const expiredSlots = listExpiredActiveSlots(limit);
  const result = {
    ok: false,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_cleanup_run",
    startedAt: nowIso(),
    finishedAt: "",
    dryRun,
    confirmRequired: dryRun ? "YES" : "",
    safety,
    expiredCount: expiredSlots.length,
    processed: [],
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    safetyFlags: {
      noRedemptionFulfillCancel: true,
      noAlert: true,
      touchesOnlyExpiredActiveSlots: true
    }
  };
  if (!safety.armed) {
    result.status = "cleanup_locked";
    result.reason = "cleanup_not_armed";
    result.finishedAt = nowIso();
    writeLog("cleanup_blocked", {
      success: false,
      reason: result.reason,
      message: `Cleanup ist nicht scharf. Blocker: ${(safety.blockers || []).join(", ") || "unknown"}`,
      payload: result
    });
    return result;
  }
  if (dryRun) {
    result.ok = true;
    result.status = expiredSlots.length ? "dry_run_expired_slots_found" : "dry_run_no_expired_slots";
    result.processed = expiredSlots.map(slot => ({ ok: true, dryRun: true, wouldRemoveVip: true, wouldMarkExpired: true, slot }));
    result.skippedCount = expiredSlots.length;
    result.finishedAt = nowIso();
    writeLog("cleanup_dry_run", {
      success: true,
      reason: result.status,
      message: `Cleanup Dry-Run: ${expiredSlots.length} abgelaufene aktive VIP30-Slots gefunden.`,
      payload: result
    });
    return result;
  }
  for (const slot of expiredSlots) {
    const item = { ok: false, slot, removeVip: null, updatedSlot: null, error: null };
    try {
      if (!slot.userId) throw new Error("slot_user_id_missing");
      item.removeVip = await twitchRemoveVip(slot.userId);
      item.updatedSlot = updateSlotAfterCleanup(slot.id, "expired", { lastError: "" });
      item.ok = true;
      result.successCount += 1;
      writeLog("cleanup_slot_expired_vip_removed", {
        userId: slot.userId,
        userLogin: slot.userLogin,
        userDisplayName: slot.userDisplayName,
        twitchRewardId: slot.twitchRewardId,
        twitchRedemptionId: slot.twitchRedemptionId,
        slotId: slot.id,
        success: true,
        reason: "expired_vip_removed",
        message: "VIP30 abgelaufen: Twitch VIP wurde entzogen und Slot als expired markiert.",
        payload: item
      });
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      item.error = { message, statusCode: err && err.statusCode || 0, data: err && err.data || null };
      item.updatedSlot = updateSlotAfterCleanup(slot.id, "failed", { lastError: message });
      result.failedCount += 1;
      writeLog("cleanup_slot_expire_failed", {
        userId: slot.userId,
        userLogin: slot.userLogin,
        userDisplayName: slot.userDisplayName,
        twitchRewardId: slot.twitchRewardId,
        twitchRedemptionId: slot.twitchRedemptionId,
        slotId: slot.id,
        success: false,
        reason: "expire_failed",
        message,
        errorCode: "expire_failed",
        errorMessage: message,
        payload: item
      });
    }
    result.processed.push(item);
  }
  result.ok = result.failedCount === 0;
  result.status = expiredSlots.length ? (result.ok ? "cleanup_completed" : "cleanup_completed_with_errors") : "no_expired_slots";
  result.finishedAt = nowIso();
  publishStatus("cleanup_run");
  emitLiveExecutionEvent("cleanup.run", { result: { ...result, processed: result.processed.map(item => ({ ...item, removeVip: item.removeVip ? { ...item.removeVip, raw: undefined } : null })) } });
  return result;
}


function normalizeExternalVipRemoveInput(input = {}) {
  const payload = input && typeof input === "object" && input.payload && typeof input.payload === "object" ? input.payload : (input || {});
  const event = payload.event && typeof payload.event === "object" ? payload.event : (input && input.event && typeof input.event === "object" ? input.event : {});
  const userId = cleanString(
    payload.userId || payload.user_id || payload.vipUserId || payload.vip_user_id || payload.targetUserId || payload.target_user_id ||
    event.user_id || event.vip_user_id || event.target_user_id || ""
  );
  const userLogin = cleanString(
    payload.userLogin || payload.user_login || payload.user || payload.vipUserLogin || payload.vip_user_login || payload.targetUserLogin || payload.target_user_login ||
    event.user_login || event.vip_user_login || event.target_user_login || event.user || ""
  ).toLowerCase();
  const userDisplayName = cleanString(
    payload.userDisplayName || payload.user_display_name || payload.userName || payload.user_name || payload.vipUserName || payload.vip_user_name || payload.targetUserName || payload.target_user_name ||
    event.user_name || event.vip_user_name || event.target_user_name || userLogin || ""
  );
  return {
    source: cleanString(payload.source || input.source || "external_vip_remove"),
    eventId: cleanString(payload.eventId || payload.event_id || input.id || input.eventId || event.id || `external_vip_remove_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    subscriptionType: cleanString(payload.subscriptionType || payload.subscription_type || input.subscriptionType || input.action || event.subscriptionType || "channel.vip.remove"),
    userId,
    userLogin,
    userDisplayName,
    removedAt: cleanString(payload.removedAt || payload.removed_at || event.removed_at || event.created_at || nowIso()),
    raw: input
  };
}

function buildExternalVipRemoveStatus() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: config.cleanup && config.cleanup.releaseSlotOnExternalVipRemove !== false,
    subscribed: externalVipRemoveSubscribed,
    subscriptionIds: [...externalVipRemoveSubscriptionIds],
    lastEventAt: externalVipRemoveLastEventAt,
    lastError: externalVipRemoveLastError,
    stats: { ...externalVipRemoveStats },
    lastResult: externalVipRemoveLastResult,
    safety: {
      noTwitchWrite: true,
      noVipGrant: true,
      noRedemptionFulfillCancel: true,
      noAlert: true,
      slotStatusOnly: true
    }
  };
}

function releaseSlotForExternalVipRemove(input = {}, options = {}) {
  ensureDbReady();
  const config = getConfig();
  const normalized = normalizeExternalVipRemoveInput(input);
  const result = {
    ok: false,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "vip30_external_vip_remove",
    checkedAt: nowIso(),
    normalized,
    slot: null,
    updatedSlot: null,
    status: "not_started",
    safety: { noTwitchWrite: true, noVipGrant: true, noRedemptionFulfillCancel: true, noAlert: true, freesSlotByStatusChange: true }
  };

  if (!config.cleanup || config.cleanup.releaseSlotOnExternalVipRemove === false) {
    result.status = "disabled";
    result.reason = "external_vip_remove_disabled";
    writeLog("external_vip_remove_ignored", { userId: normalized.userId, userLogin: normalized.userLogin, userDisplayName: normalized.userDisplayName, success: true, reason: result.reason, message: "Externer VIP-Entzug ignoriert, weil releaseSlotOnExternalVipRemove deaktiviert ist.", payload: result });
    return result;
  }
  if (!normalized.userId && !normalized.userLogin) {
    result.status = "ignored";
    result.reason = "missing_user";
    writeLog("external_vip_remove_ignored", { success: false, reason: result.reason, message: "Externer VIP-Entzug konnte keinem User zugeordnet werden.", payload: result });
    return result;
  }

  const slot = findActiveSlotForDecision({ userId: normalized.userId, userLogin: normalized.userLogin });
  result.slot = slot;
  if (!slot) {
    result.ok = true;
    result.status = "no_active_vip30_slot";
    result.reason = "no_active_slot";
    writeLog("external_vip_remove_no_active_slot", { userId: normalized.userId, userLogin: normalized.userLogin, userDisplayName: normalized.userDisplayName, success: true, reason: result.reason, message: "Externer VIP-Entzug erkannt, aber kein aktiver VIP30-Slot vorhanden.", payload: result });
    return result;
  }

  const status = cleanString(options.status || "external_removed", "external_removed");
  result.updatedSlot = updateSlotAfterCleanup(slot.id, status, { lastError: "external_vip_remove" });
  result.ok = true;
  result.status = "slot_released";
  result.reason = status;
  writeLog("external_vip_remove_slot_released", { userId: slot.userId || normalized.userId, userLogin: slot.userLogin || normalized.userLogin, userDisplayName: slot.userDisplayName || normalized.userDisplayName, twitchRewardId: slot.twitchRewardId, twitchRedemptionId: slot.twitchRedemptionId, slotId: slot.id, success: true, reason: status, message: "Externer VIP-Entzug erkannt: aktiver VIP30-Slot wurde freigegeben.", payload: result });
  publishStatus("external_vip_remove_slot_released");
  emitLiveExecutionEvent("external_vip_remove.slot_released", { result });
  return result;
}

function handleExternalVipRemoveEvent(envelope) {
  externalVipRemoveStats.received += 1;
  externalVipRemoveLastEventAt = nowIso();
  try {
    const action = cleanString(envelope && envelope.action || "");
    const payload = envelope && envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {};
    const subscriptionType = cleanString(payload.subscriptionType || payload.subscription_type || payload.eventSubType || payload.type || action || "");
    const isVipRemove = action === "channel.vip.remove" || action === "vip.remove" || action === "remove" || subscriptionType === "channel.vip.remove" || subscriptionType === "vip.remove";
    if (!isVipRemove) {
      externalVipRemoveStats.ignored += 1;
      return { ok: true, ignored: true, reason: "not_vip_remove" };
    }
    externalVipRemoveStats.matched += 1;
    const result = releaseSlotForExternalVipRemove(envelope, { status: "external_removed" });
    externalVipRemoveLastResult = result;
    if (result && result.ok && result.status === "slot_released") externalVipRemoveStats.updated += 1;
    return result;
  } catch (err) {
    externalVipRemoveStats.errors += 1;
    externalVipRemoveLastError = err && err.message ? err.message : String(err);
    writeLog("external_vip_remove_failed", { success: false, reason: "external_vip_remove_failed", message: externalVipRemoveLastError, errorCode: "external_vip_remove_failed", errorMessage: externalVipRemoveLastError, payload: { envelope } });
    return { ok: false, error: externalVipRemoveLastError };
  }
}

function registerExternalVipRemoveSubscriptions() {
  const config = getConfig();
  if (!config.cleanup || config.cleanup.releaseSlotOnExternalVipRemove === false) return { ok: false, reason: "external_vip_remove_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  if (externalVipRemoveSubscribed) return { ok: true, subscribed: true, subscriptionIds: [...externalVipRemoveSubscriptionIds] };
  const targets = [
    { id: `module:${MODULE_NAME}:twitch.eventsub:channel.vip.remove`, channel: "twitch.eventsub", action: "channel.vip.remove" },
    { id: `module:${MODULE_NAME}:twitch.vip:remove`, channel: "twitch.vip", action: "remove" }
  ];
  const results = [];
  externalVipRemoveSubscriptionIds = [];
  for (const target of targets) {
    const result = currentBus.subscribe({ id: target.id, module: MODULE_NAME, channel: target.channel, action: target.action }, envelope => handleExternalVipRemoveEvent(envelope));
    results.push({ target, result });
    if (result && result.ok === true) externalVipRemoveSubscriptionIds.push(target.id);
  }
  externalVipRemoveSubscribed = externalVipRemoveSubscriptionIds.length > 0;
  if (!externalVipRemoveSubscribed) externalVipRemoveLastError = "external_vip_remove_subscribe_failed";
  return { ok: externalVipRemoveSubscribed, subscribed: externalVipRemoveSubscribed, subscriptionIds: [...externalVipRemoveSubscriptionIds], results };
}

function emitExternalVipRemoveTest(input = {}) {
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  externalVipRemoveStats.emittedTests += 1;
  const payload = {
    subscriptionType: "channel.vip.remove",
    source: "vip30_external_vip_remove_test",
    userId: cleanString(input.userId || input.user_id || ""),
    userLogin: cleanString(input.userLogin || input.user_login || input.user || "").toLowerCase(),
    userDisplayName: cleanString(input.userDisplayName || input.user_display_name || input.displayName || input.display_name || input.user || ""),
    eventId: cleanString(input.eventId || input.event_id || `vipremove_test_${Date.now()}`),
    removedAt: nowIso()
  };
  return currentBus.emit({ type: "event", channel: "twitch.eventsub", action: "channel.vip.remove", source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME }, target: { type: "all", id: "*" }, payload, meta: { requireAck: false, replayable: true, ttlMs: getConfig().bus.ttlMs, productionTarget: true, twitchWrite: false } });
}

function emitLiveActionPlanEvent(result, reason = "live_action_plan") {
  const config = getConfig();
  if (config.bus.enabled === false) return { ok: false, reason: "bus_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return currentBus.emit({
      type: "event",
      channel: "vip30.live",
      action: "plan",
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        reason,
        emittedAt: nowIso(),
        result
      },
      meta: { requireAck: false, replayable: true, ttlMs: config.bus.ttlMs, productionTarget: true }
    });
  } catch (_) {
    return { ok: false, reason: "bus_emit_failed" };
  }
}

function buildChannelpointsBridgeLiveCheck() {
  const config = getConfig();
  const bridgeStatus = buildInternalBridgeStatus();
  const rewardStatus = buildChannelpointsRewardStatus();
  let busStatus = null;
  try {
    const currentBus = getBus();
    busStatus = currentBus && typeof currentBus.getStatus === "function" ? currentBus.getStatus() : null;
  } catch (_) { busStatus = null; }
  const subscriptions = busStatus && Array.isArray(busStatus.subscriptions) ? busStatus.subscriptions : [];
  const subscription = subscriptions.find(item => item && item.id === bridgeSubscriptionId) || null;
  const existingReward = rewardStatus && rewardStatus.reward ? rewardStatus.reward.existing : null;
  const hasTwitchRewardId = !!(existingReward && existingReward.twitchRewardId);
  const titleMatchFallback = !(config.bridge && config.bridge.acceptTitleMatch === false);
  const checks = {
    moduleEnabled: config.enabled !== false,
    bridgeEnabled: config.bridge && config.bridge.enabled !== false,
    bridgeSubscribed: bridgeSubscribed === true,
    subscriptionVisibleInBus: !!subscription,
    liveEventDryRunObserveEnabled: !(config.bridge && config.bridge.liveEventDryRunObserveEnabled === false),
    localRewardLinked: rewardStatus && rewardStatus.status === "linked_in_sync",
    twitchRewardIdLinked: hasTwitchRewardId,
    titleMatchFallbackEnabled: titleMatchFallback,
    canMatchRealEvent: hasTwitchRewardId || titleMatchFallback,
    noTwitchWrite: true,
    noVipGrant: true,
    noSlotWrite: true,
    noRedemptionFulfillCancel: true
  };
  const ready = checks.moduleEnabled && checks.bridgeEnabled && checks.bridgeSubscribed && checks.subscriptionVisibleInBus && checks.liveEventDryRunObserveEnabled && checks.localRewardLinked && checks.canMatchRealEvent;
  return {
    ok: ready,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: ready ? "ready_for_real_eventsub_dryrun_observation" : "not_ready_for_real_eventsub_dryrun_observation",
    checkedAt: nowIso(),
    checks,
    bridge: bridgeStatus,
    reward: rewardStatus && rewardStatus.reward ? {
      configured: rewardStatus.reward.configured,
      existing: existingReward ? {
        id: existingReward.id,
        rewardKey: existingReward.rewardKey,
        twitchRewardId: existingReward.twitchRewardId,
        title: existingReward.title,
        cost: existingReward.cost,
        actionType: existingReward.actionType,
        actionKey: existingReward.actionKey,
        twitchIsEnabled: existingReward.twitchIsEnabled,
        autoFulfill: existingReward.autoFulfill
      } : null,
      inSync: rewardStatus.reward.inSync,
      differences: rewardStatus.reward.differences || []
    } : null,
    eventBus: busStatus ? {
      ok: busStatus.ok === true,
      bus: busStatus.bus,
      subscriptions: busStatus.stats && busStatus.stats.subscriptions,
      subscriberDeliveries: busStatus.stats && busStatus.stats.subscriberDeliveries,
      subscriberErrors: busStatus.stats && busStatus.stats.subscriberErrors,
      subscription: subscription ? { id: subscription.id, module: subscription.module, channel: subscription.channel, action: subscription.action, delivered: subscription.delivered, errors: subscription.errors } : null
    } : null,
    nextManualTest: {
      beforeRealRedeem: `POST ${ROUTE_PREFIX}/channelpoints/bridge/reset-stats`,
      thenRedeemOnTwitch: "30 Tage VIP / aktuelle Testkosten ausloesen",
      observe: `GET ${ROUTE_PREFIX}/channelpoints/bridge/status`,
      logs: `GET ${ROUTE_PREFIX}/logs`
    },
    safety: { tileIsTruth: true, liveExecutionWhenTileReady: buildLiveActionSafetyStatus().armed === true }
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
      readOnlyDecision: true
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
  return {
    ok: !getEffectiveLastError(),
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: getConfig().enabled !== false,
    status: getEffectiveLastError() ? "error" : "ready_step8_6_external_vip_remove_slot_release",
    lastError: getEffectiveLastError(),
    checks: {
      databaseReady: dbMigrationState.ok === true,
      schemaReady: database.getSchemaVersion(MODULE_NAME) >= SCHEMA_TARGET_VERSION,
      busRegistered: registeredAtBus,
      dashboardLoggingReady: tableExists("vip30_log"),
      slotsTableReady: tableExists("vip30_slots"),
      channelpointsTablesReady: channelpointsTablesReady(),
      channelpointsRewardLinked: !!getChannelpointsRewardByKey(buildRewardSummary().rewardKey)
    },
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
    ok: !getEffectiveLastError(),
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    enabled: config.enabled !== false,
    status: lastError ? "error" : "ready_step8_6_external_vip_remove_slot_release",
    startedAt,
    routePrefix: ROUTE_PREFIX,
    routeCount: 26,
    routes: [
      `${ROUTE_PREFIX}/status`,
      `${ROUTE_PREFIX}/health`,
      `${ROUTE_PREFIX}/slots`,
      `${ROUTE_PREFIX}/logs`,
      `${ROUTE_PREFIX}/stats`,
      `${ROUTE_PREFIX}/channelpoints/reward/status`,
      `${ROUTE_PREFIX}/channelpoints/reward/ensure`,
      `${ROUTE_PREFIX}/settings`,
      `${ROUTE_PREFIX}/settings/save`,
      `${ROUTE_PREFIX}/redeem/dry-run`,
      `${ROUTE_PREFIX}/redeem/decision`,
      `${ROUTE_PREFIX}/channelpoints/bridge/status`,
      `${ROUTE_PREFIX}/channelpoints/bridge/test`,
      `${ROUTE_PREFIX}/channelpoints/reward/link-twitch-id`,
      `${ROUTE_PREFIX}/channelpoints/bridge/live-check`,
      `${ROUTE_PREFIX}/channelpoints/bridge/reset-stats`,
      `${ROUTE_PREFIX}/live/check`,
      `${ROUTE_PREFIX}/alert/status`,
      `${ROUTE_PREFIX}/alert/test`,
      `${ROUTE_PREFIX}/live/arm-preview`,
      `${ROUTE_PREFIX}/live/arm-settings-preview`,
      `${ROUTE_PREFIX}/live/set-gates`,
      `${ROUTE_PREFIX}/redeem/live-plan`,
      `${ROUTE_PREFIX}/live/stage-a/check`,
      `${ROUTE_PREFIX}/live/stage-b/check`,
      `${ROUTE_PREFIX}/redeem/live-stage-a`
    ],
    reward: buildRewardSummary(),
    config: {
      maxSlots: config.slots.maxSlots,
      durationDays: config.slots.durationDays,
      loggingEnabled: config.logging.enabled !== false,
      dashboardEnabled: config.dashboard.enabled !== false,
      alertsMode: config.alerts.mode,
      textStyle: config.textStyle.style,
      channelpointsRewardSyncEnabled: config.channelpoints.enabled !== false && config.channelpoints.rewardSyncEnabled !== false,
      channelpointsRewardCost: buildRewardSummary().cost,
      dryRunDecisionFlowEnabled: true,
      channelpointsBridgeEnabled: config.bridge && config.bridge.enabled !== false,
      channelpointsBridgeLiveExecutionWhenTileReady: (() => { try { return buildLiveActionSafetyStatus().armed === true; } catch (_) { return false; } })(),
      channelpointsBridgeLiveEventDryRunObserveEnabled: !(config.bridge && config.bridge.liveEventDryRunObserveEnabled === false),
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
    settings: (() => {
      try { return buildSettingsStatus(); } catch (err) { return { ok: false, status: "error", error: err && err.message ? err.message : String(err) }; }
    })(),
    channelpointsReward: (() => {
      try { return buildChannelpointsRewardStatus(); } catch (err) { return { ok: false, status: "error", error: err && err.message ? err.message : String(err) }; }
    })(),
    liveReadiness: (() => {
      try { return buildLiveActionSafetyStatus(); } catch (err) { return { ok: false, status: "error", armed: false, checks: {}, blockers: ["liveReadinessError"], error: err && err.message ? err.message : String(err) }; }
    })(),
    dryRun: {
      enabled: true,
      requests: runtimeStats.dryRunRequests,
      lastDryRunAt: runtimeStats.lastDryRunAt,
      lastDecision: runtimeStats.lastDryRunDecision
    },
    alerts: {
      enabled: config.alerts && config.alerts.enabled !== false,
      mode: config.alerts && config.alerts.mode || "sound_system_bundle",
      soundKey: config.alerts && config.alerts.soundKey || "vip30",
      mediaId: config.alerts && (config.alerts.mediaId || config.alerts.soundMediaId || config.alerts.mediaAssetId) || 0,
      mediaPath: config.alerts && (config.alerts.mediaPath || config.alerts.mediaRelativePath || config.alerts.registryPath) || "",
      durationMs: config.alerts && config.alerts.durationMs || 9000,
      liveAllowed: config.alerts && config.alerts.enabled !== false,
      delivery: "sound_bundle",
      soundBundleUrl: config.alerts && config.alerts.soundBundleUrl || DEFAULT_CONFIG.alerts.soundBundleUrl,
      outputTarget: config.alerts && config.alerts.outputTarget || DEFAULT_CONFIG.alerts.outputTarget,
      target: config.alerts && config.alerts.target || DEFAULT_CONFIG.alerts.target,
      priority: config.alerts && config.alerts.priority || DEFAULT_CONFIG.alerts.priority,
      volume: config.alerts && config.alerts.volume || DEFAULT_CONFIG.alerts.volume,
      busChannel: "vip30.alert",
      triggers: runtimeStats.alertTriggers,
      skipped: runtimeStats.alertSkipped,
      failed: runtimeStats.alertFailed,
      lastAlertAt: runtimeStats.lastAlertAt,
      lastStatus: runtimeStats.lastAlertStatus,
      lastReason: runtimeStats.lastAlertReason,
      lastUserLogin: runtimeStats.lastAlertUserLogin
    },
    bridge: {
      enabled: config.bridge && config.bridge.enabled !== false,
      subscribed: bridgeSubscribed,
      subscriptionId: bridgeSubscriptionId,
      liveExecutionWhenTileReady: (() => { try { return buildLiveActionSafetyStatus().armed === true; } catch (_) { return false; } })(),
      requests: runtimeStats.bridgeDecisionRequests,
      receivedEvents: bridgeStats.received,
      matchedEvents: bridgeStats.matched,
      ignoredEvents: bridgeStats.ignored,
      duplicateEvents: bridgeStats.duplicates,
      lastDecisionAt: runtimeStats.lastBridgeDecisionAt,
      lastDecision: runtimeStats.lastBridgeDecision,
      safety: {
        tileIsTruth: true,
        liveExecutionWhenTileReady: (() => { try { return buildLiveActionSafetyStatus().armed === true; } catch (_) { return false; } })()
      }
    },
    live: (() => {
      try { return buildLiveActionSafetyStatus(); } catch (err) { return { ok: false, status: "error", error: err && err.message ? err.message : String(err) }; }
    })(),
    slots: stats.slots,
    stats: stats.logs,
    logging: {
      enabled: config.logging.enabled !== false,
      storage: "sqlite",
      table: "vip30_log",
      serverLogNormalEvents: false,
      recentEventsAvailable: true,
      lastEventAt: runtimeStats.lastLogAt,
      lastError: getEffectiveLastError(),
      recentEvents: recentLogs
    },
    safety: {
      step: "VIP30-STEP8",
      noStreamerBot: true,
      noLegacyImport: true,
      noTwitchWriteInThisStep: false,
      liveActionPlanTileTruth: true,
      localChannelpointsRewardWriteOnly: true,
      dbDashboardConfig: true,
      dryRunDecisionFlow: true,
      channelpointsDecisionBridge: true,
      eventsubLiveDryRunObserve: true,
      liveActionPlanOnly: false,
      fullLiveVipGrantSlotWriteFulfillCancelAlert: true,
      noFulfillCancelInThisStep: false,
      noVipGrantInThisStep: false,
      noRedemptionFulfillCancelInThisStep: false,
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
      phase: config.enabled === false ? "disabled" : "ready_step8_6",
      reason,
      enabled: config.enabled !== false,
      healthy: !getEffectiveLastError(),
      lastError: getEffectiveLastError(),
      dbReady: dbMigrationState.ok === true,
      activeSlots: stats.slots.active,
      freeSlots: stats.slots.free,
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
      "vip30.channelpoints.reward.status",
      "vip30.channelpoints.reward.ensure",
      "vip30.redeem.dryrun",
      "vip30.redeem.decision",
      "vip30.channelpoints.bridge.listen",
      "vip30.channelpoints.bridge.test",
      "vip30.cleanup.planned",
      "vip30.redeem.planned",
      "vip30.live.plan",
      "vip30.live.safety"
    ],
    meta: {
      build: MODULE_BUILD,
      routePrefix: ROUTE_PREFIX,
      heartbeat: true,
      dashboardLogging: true,
      noStreamerBot: true,
      noLegacyImport: true,
      noTwitchWriteInStep8: true,
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

function init(context = {}) {
  moduleContext = context || {};
  const { app } = moduleContext;
  loadConfig();
  startedAt = nowIso();
  try {
    migrateDatabase("init");
    loadedConfig = null;
    loadConfig();
    registerAtBus();
    registerInternalBridgeSubscription();
    registerExternalVipRemoveSubscriptions();
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
    app.post(`${ROUTE_PREFIX}/channelpoints/reward/link-twitch-id`, (req, res) => {
      runtimeStats.lastAction = "channelpoints_reward_link_twitch_id";
      try {
        const confirm = cleanString(req && req.query && req.query.confirm || req && req.body && req.body.confirm || "").toUpperCase();
        if (confirm !== "YES") {
          res.status(409).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, reason: "confirm_required", confirmRequired: "YES", safety: { noTwitchWrite: true } });
          return;
        }
        const result = linkChannelpointsRewardTwitchRewardIdFromLatestLog({
          twitchRewardId: req && req.body && (req.body.twitchRewardId || req.body.twitch_reward_id) || req && req.query && (req.query.twitchRewardId || req.query.twitch_reward_id) || "",
          force: boolValue(req && req.body && req.body.force || req && req.query && req.query.force, false)
        });
        res.status(result && result.ok ? 200 : 409).json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: lastError, safety: { noTwitchWrite: true } });
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
    app.get(`${ROUTE_PREFIX}/channelpoints/bridge/live-check`, (_req, res) => {
      runtimeStats.lastAction = "channelpoints_bridge_live_check";
      try { res.json(buildChannelpointsBridgeLiveCheck()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/channelpoints/bridge/reset-stats`, (req, res) => {
      runtimeStats.lastAction = "channelpoints_bridge_reset_stats";
      try { res.json(resetBridgeRuntimeStats(cleanString(req && req.body && req.body.reason || req && req.query && req.query.reason || "api"))); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true } }); }
    });


    app.get(`${ROUTE_PREFIX}/external-vip-remove/status`, (_req, res) => {
      runtimeStats.lastAction = "external_vip_remove_status";
      try { res.json(buildExternalVipRemoveStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noAlert: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/external-vip-remove/process`, (req, res) => {
      runtimeStats.lastAction = "external_vip_remove_process";
      try {
        const confirm = cleanString(req && req.query && req.query.confirm || req && req.body && req.body.confirm || "").toUpperCase();
        if (confirm !== "YES") return res.status(409).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, reason: "confirm_required", confirmRequired: "YES", safety: { noTwitchWrite: true, slotStatusOnly: true } });
        const result = releaseSlotForExternalVipRemove((req && req.body) || {}, { status: cleanString(req && req.body && req.body.status || req && req.query && req.query.status || "external_removed") });
        res.status(result && result.ok ? 200 : 409).json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noAlert: true } });
      }
    });
    app.post(`${ROUTE_PREFIX}/external-vip-remove/test`, (req, res) => {
      runtimeStats.lastAction = "external_vip_remove_test";
      try { res.json(emitExternalVipRemoveTest((req && req.body) || {})); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noAlert: true } }); }
    });

    app.get(`${ROUTE_PREFIX}/cleanup/check`, (req, res) => {
      runtimeStats.lastAction = "cleanup_check";
      try { res.json(buildCleanupCheck((req && req.query) || {})); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noRedemptionFulfillCancel: true, noAlert: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/cleanup/run`, async (req, res) => {
      runtimeStats.lastAction = "cleanup_run";
      try {
        const result = await runVip30Cleanup({ ...((req && req.body) || {}), ...((req && req.query) || {}) }, { reason: "api_cleanup_run" });
        res.status(result && result.ok ? 200 : (result && result.status === "cleanup_locked" ? 409 : 207)).json(result);
      }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noRedemptionFulfillCancel: true, noAlert: true } }); }
    });

    app.get(`${ROUTE_PREFIX}/live/check`, (_req, res) => {
      runtimeStats.lastAction = "live_check";
      try { res.json(buildLiveActionSafetyStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true } }); }
    });
    app.get(`${ROUTE_PREFIX}/alert/status`, (_req, res) => {
      runtimeStats.lastAction = "alert_status";
      try {
        const config = getConfig();
        res.json({
          ok: true,
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          moduleBuild: MODULE_BUILD,
          status: config.alerts && config.alerts.enabled === false ? "alerts_disabled" : "alert_ready_when_live_flow_succeeds",
          enabled: config.alerts && config.alerts.enabled !== false,
          liveAllowed: config.alerts && config.alerts.enabled !== false,
          mode: config.alerts && config.alerts.mode || "sound_system_bundle",
          soundKey: config.alerts && config.alerts.soundKey || "vip30",
          mediaId: config.alerts && (config.alerts.mediaId || config.alerts.soundMediaId || config.alerts.mediaAssetId) || 0,
          mediaPath: config.alerts && (config.alerts.mediaPath || config.alerts.mediaRelativePath || config.alerts.registryPath) || "",
          soundPoolCount: normalizeVip30SoundPool(config.alerts && config.alerts.soundPool, config.alerts || {}).length,
          mediaConfigured: !!(config.alerts && hasVip30ConfiguredSound(config.alerts)),
          durationMs: config.alerts && config.alerts.durationMs || 9000,
          delivery: "sound_bundle",
          soundBundleUrl: config.alerts && config.alerts.soundBundleUrl || DEFAULT_CONFIG.alerts.soundBundleUrl,
          outputTarget: config.alerts && config.alerts.outputTarget || DEFAULT_CONFIG.alerts.outputTarget,
          target: config.alerts && config.alerts.target || DEFAULT_CONFIG.alerts.target,
          priority: config.alerts && config.alerts.priority || DEFAULT_CONFIG.alerts.priority,
          volume: config.alerts && config.alerts.volume || DEFAULT_CONFIG.alerts.volume,
          overlaySetCount: normalizeVip30OverlaySets(config.alerts && config.alerts.overlaySets).length,
          busChannel: "vip30.alert",
          stats: {
            triggers: runtimeStats.alertTriggers,
            skipped: runtimeStats.alertSkipped,
            failed: runtimeStats.alertFailed,
            lastAlertAt: runtimeStats.lastAlertAt,
            lastStatus: runtimeStats.lastAlertStatus,
            lastReason: runtimeStats.lastAlertReason,
            lastUserLogin: runtimeStats.lastAlertUserLogin
          },
          safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true, statusOnly: true }
        });
      }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/alert/test`, async (req, res) => {
      runtimeStats.lastAction = "alert_manual_test";
      try {
        const result = await triggerVip30ManualAlertTest((req && req.body) || {});
        res.json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true, alertOnly: true } });
      }
    });

    app.get(`${ROUTE_PREFIX}/live/arm-preview`, (_req, res) => {
      runtimeStats.lastAction = "live_arm_preview";
      try { res.json(buildLiveArmPreview()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } }); }
    });
    app.get(`${ROUTE_PREFIX}/live/arm-settings-preview`, (req, res) => {
      runtimeStats.lastAction = "live_arm_settings_preview";
      try { res.json(buildLiveArmSettingsPreview(req && req.query && req.query.profile || "stage_a")); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/live/set-gates`, (req, res) => {
      runtimeStats.lastAction = "live_set_gates";
      try {
        const result = setLiveGatesFromPayload((req && req.body) || {}, (req && req.query) || {});
        res.status(result && result.ok ? 200 : 409).json(result);
      }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/redeem/live-plan`, (req, res) => {
      runtimeStats.lastAction = "redeem_live_plan";
      try { res.json(buildRedemptionLiveActionPlan((req && req.body) || {}, { reason: "api_live_plan" })); }
      catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } });
      }
    });
    app.get(`${ROUTE_PREFIX}/live/stage-b/check`, (_req, res) => {
      runtimeStats.lastAction = "live_stage_b_check";
      try { res.json(buildStageBLiveSafetyStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noAlert: true } }); }
    });
    app.get(`${ROUTE_PREFIX}/live/stage-a/check`, (_req, res) => {
      runtimeStats.lastAction = "live_stage_a_check";
      try { res.json(buildStageALiveSafetyStatus()); }
      catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err), safety: { noTwitchWrite: true, noVipGrant: true, noSlotWrite: true, noRedemptionFulfillCancel: true } }); }
    });
    app.post(`${ROUTE_PREFIX}/redeem/live-stage-a`, async (req, res) => {
      runtimeStats.lastAction = "redeem_live_stage_a";
      try {
        const result = await executeVip30LiveStageA((req && req.body) || {}, { reason: "api_live_stage_a" });
        res.status(result && result.ok ? 200 : 409).json(result);
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, safety: { noRedemptionFulfillCancel: true, noAlert: true } });
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
  buildChannelpointsRewardStatus,
  ensureChannelpointsReward,
  linkChannelpointsRewardTwitchRewardId,
  buildDryRunRedemptionDecision,
  buildChannelpointsBridgeDecision,
  buildInternalBridgeStatus,
  buildLiveActionSafetyStatus,
  buildRedemptionLiveActionPlan,
  buildStageALiveSafetyStatus,
  executeVip30LiveStageA,
  buildExternalVipRemoveStatus,
  releaseSlotForExternalVipRemove,
  emitExternalVipRemoveTest,
  emitChannelpointsBridgeTest,
  triggerVip30ManualAlertTest,
  handleChannelpointsRedemptionBridgeEvent,
  listSlots,
  listLogs,
  writeLog
};
