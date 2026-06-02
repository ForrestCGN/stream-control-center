"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "channelpoints";
const MODULE_VERSION = "0.9.13";
const MODULE_BUILD = "create-save-twitch-inactive-default";
const ROUTE_PREFIX = "/api/channelpoints";
const SCHEMA_TARGET_VERSION = 1;
const DEFAULT_TARGET_HOST = "127.0.0.1";
const DEFAULT_TARGET_PORT = 8080;

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "channelpoints",
  routePrefix: ROUTE_PREFIX,
  routesPrefix: [ROUTE_PREFIX],
  description: "Twitch Channel Points local reward CRUD foundation with Communication Bus registration",
  bus: {
    registered: true,
    heartbeat: true,
    emits: ["channelpoints.status", "channelpoints.redemption"],
    listens: ["channelpoints.redemption"]
  },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  busEnabled: true,
  busSelfTestEnabled: true,
  twitchRewardManagementEnabled: true,
  twitchRewardSyncEnabled: false,
  twitchRewardWriteOnLocalToggle: true,
  twitchRewardWriteRequireConfirm: true,
  twitchTokenStore: "",
  dashboardEnabled: false,
  dbMigrationEnabled: true,
  schemaPreviewEnabled: true,
  migrationExecutionEnabled: true,
  localCrudEnabled: true,
  mediaExecutionBridgeEnabled: true,
  mediaExecutionTargetUrl: "/api/sound/play",
  textRewardExecutionEnabled: true,
  twitchSyncReadinessEnabled: true,
  busDomainEventsEnabled: true,
  twitchAuthScopeCheckEnabled: true,
  twitchAuthValidateUrl: "/api/twitch/auth/validate",
  redemptionEventSubPreparationEnabled: true,
  redemptionEventSubStoreEnabled: true,
  importedRewardActionGuardEnabled: true,
  redemptionEventBusReceiveEnabled: true,
  twitchRedemptionCompletionEnabled: true
};

const DEFAULT_CATEGORIES = [
  { category_key: "general", label: "Allgemein", description: "Allgemeine Kanalpunkte-Belohnungen", sort_order: 10, enabled: 1 },
  { category_key: "sounds", label: "Sounds", description: "Sound- und Audio-Belohnungen", sort_order: 20, enabled: 1 },
  { category_key: "media", label: "Medien", description: "Belohnungen mit Medien aus dem bestehenden Media-System", sort_order: 30, enabled: 1 },
  { category_key: "overlays", label: "Overlays", description: "Overlay- und Anzeige-Belohnungen", sort_order: 40, enabled: 1 },
  { category_key: "chat", label: "Chat", description: "Chat-, Bot- und Community-Aktionen", sort_order: 50, enabled: 1 },
  { category_key: "games", label: "Games", description: "Game- oder Stream-Interaktionen", sort_order: 60, enabled: 1 }
];

const ACTION_TYPES = [
  { key: "streamerbot_action", label: "Streamer.bot Action", planned: true, description: "Call a configured Streamer.bot action/bridge route later. No direct implementation in STEP493." },
  { key: "backend_route", label: "Backend Route", planned: true, description: "Call a local backend route/action with safe payload." },
  { key: "bus_event", label: "Communication Bus Event", planned: true, description: "Emit an event to another module through the Communication Bus." },
  { key: "media", label: "Media-System Asset", planned: false, description: "Use an asset selected through existing media.js/dashboard media picker and execute it via /api/sound/play." },
  { key: "sound", label: "Sound-System", planned: false, description: "Execute selected media through the central Sound-System media bridge." },
  { key: "overlay", label: "Overlay", planned: true, description: "Trigger overlay state/event later." },
  { key: "manual", label: "Manual/Moderation", planned: true, description: "Store reward locally for manual handling." }
];

const TABLES = [
  {
    name: "channelpoints_categories",
    purpose: "Dashboard grouping, sorting, visibility and later category permissions.",
    source: "local",
    primaryKey: "id",
    fields: ["id", "category_key", "label", "description", "sort_order", "enabled", "created_at", "updated_at"],
    createTableSql: `CREATE TABLE IF NOT EXISTS channelpoints_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_key TEXT UNIQUE,
  label TEXT,
  description TEXT,
  sort_order INTEGER,
  enabled INTEGER,
  created_at TEXT,
  updated_at TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_categories_sort ON channelpoints_categories(sort_order);"
    ]
  },
  {
    name: "channelpoints_rewards",
    purpose: "Local reward configuration, Twitch mapping, action mapping and media references.",
    source: "local_and_twitch",
    primaryKey: "id",
    fields: [
      "id", "reward_key", "twitch_reward_id", "title", "prompt", "cost", "category_key", "sort_order",
      "system_enabled", "twitch_is_enabled", "is_paused", "require_user_input", "input_label",
      "action_type", "action_key", "action_payload_json", "media_asset_id", "media_role",
      "queue_mode", "priority", "cooldown_seconds", "max_per_stream", "max_per_user_per_stream",
      "auto_fulfill", "notes", "created_at", "updated_at"
    ],
    createTableSql: `CREATE TABLE IF NOT EXISTS channelpoints_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reward_key TEXT UNIQUE,
  twitch_reward_id TEXT,
  title TEXT,
  prompt TEXT,
  cost INTEGER,
  category_key TEXT,
  sort_order INTEGER,
  system_enabled INTEGER,
  twitch_is_enabled INTEGER,
  is_paused INTEGER,
  require_user_input INTEGER,
  input_label TEXT,
  action_type TEXT,
  action_key TEXT,
  action_payload_json TEXT,
  media_asset_id TEXT,
  media_role TEXT,
  queue_mode TEXT,
  priority INTEGER,
  cooldown_seconds INTEGER,
  max_per_stream INTEGER,
  max_per_user_per_stream INTEGER,
  auto_fulfill INTEGER,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_rewards_category_sort ON channelpoints_rewards(category_key, sort_order);",
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_rewards_twitch_reward_id ON channelpoints_rewards(twitch_reward_id);",
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_rewards_system_enabled ON channelpoints_rewards(system_enabled);"
    ]
  },
  {
    name: "channelpoints_redemptions",
    purpose: "Redemption history, queue status, execution result and later fulfil/cancel tracking.",
    source: "eventsub_and_local",
    primaryKey: "id",
    fields: ["id", "twitch_redemption_id", "twitch_reward_id", "reward_key", "user_id", "user_login", "user_display_name", "user_input", "status", "queue_group", "result_json", "redeemed_at", "created_at", "updated_at"],
    createTableSql: `CREATE TABLE IF NOT EXISTS channelpoints_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  twitch_redemption_id TEXT UNIQUE,
  twitch_reward_id TEXT,
  reward_key TEXT,
  user_id TEXT,
  user_login TEXT,
  user_display_name TEXT,
  user_input TEXT,
  status TEXT,
  queue_group TEXT,
  result_json TEXT,
  redeemed_at TEXT,
  created_at TEXT,
  updated_at TEXT
);`,
    createIndexSql: [
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_redemptions_reward_key ON channelpoints_redemptions(reward_key);",
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_redemptions_status ON channelpoints_redemptions(status);",
      "CREATE INDEX IF NOT EXISTS idx_channelpoints_redemptions_user_login ON channelpoints_redemptions(user_login);"
    ]
  }
];

let loadedConfig = null;
let bus = null;
let registeredAtBus = false;
let lastBusRegisterAt = null;
let lastBusStatusAt = null;
let lastBusHeartbeatAt = null;
let lastBusEventAt = null;
let lastBusEvent = null;
let lastBusTestAt = null;
let lastError = "";
let receivedBusEvents = 0;
let emittedDomainEvents = 0;
let lastDomainEventAt = null;
let lastDomainEvent = null;
let subscriptionIds = [];
let dbMigrationState = {
  attempted: false,
  executed: false,
  ok: false,
  reason: "not_started",
  schemaVersionBefore: 0,
  schemaVersionAfter: 0,
  targetVersion: SCHEMA_TARGET_VERSION,
  lastRunAt: null,
  lastError: "",
  createdTables: [],
  createdIndexes: [],
  seededCategories: 0
};
let localCrudStats = {
  listed: 0,
  created: 0,
  updated: 0,
  enabled: 0,
  disabled: 0,
  deleted: 0,
  lastCrudAt: null,
  lastCrudAction: ""
};
let executionStats = {
  checked: 0,
  executed: 0,
  failed: 0,
  lastExecutionAt: null,
  lastExecutionAction: "",
  lastExecutionReward: "",
  lastExecutionResult: null,
  lastExecutionError: ""
};

let redemptionEventSubStats = {
  received: 0,
  receivedFromBus: 0,
  acceptedFromBus: 0,
  previewed: 0,
  stored: 0,
  duplicates: 0,
  unmapped: 0,
  executed: 0,
  failed: 0,
  blocked: 0,
  ignoredInactive: 0,
  missingAction: 0,
  lastReceivedAt: null,
  lastStoredAt: null,
  lastPreviewAt: null,
  lastRedemptionId: "",
  lastRewardKey: "",
  lastExecutionAt: null,
  lastExecutionResult: null,
  lastError: "",
  lastBusRedemptionEventAt: null,
  lastBusRedemptionEventId: ""
};

function nowIso() { return new Date().toISOString(); }
function cleanString(value, fallback = "") { const clean = String(value ?? "").trim(); return clean || fallback; }
function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(raw)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(raw)) return false;
  return fallback;
}
function intValue(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}
function safeJsonParse(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}
function jsonString(value, fallback = {}) {
  try { return JSON.stringify(value === undefined ? fallback : value); } catch (_) { return JSON.stringify(fallback); }
}
function slugify(value, fallback = "reward") {
  const raw = cleanString(value, fallback).toLowerCase();
  const clean = raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function loadConfig() {
  const loaded = helperConfig.loadConfig("channelpoints.json", {}, { createIfMissing: false });
  loadedConfig = { ...DEFAULT_CONFIG, ...(loaded && loaded.data && typeof loaded.data === "object" ? loaded.data : {}) };
  return loadedConfig;
}
function getConfig() { if (!loadedConfig) return loadConfig(); return loadedConfig; }
function getBus() { if (bus) return bus; if (!communicationBus || typeof communicationBus.getBus !== "function") return null; bus = communicationBus.getBus(); return bus; }
function ensureDbReady() { database.ensureReady(); return true; }

function getRootDirSafe() {
  if (helperConfig && typeof helperConfig.getRootDir === "function") return helperConfig.getRootDir();
  return process.cwd();
}
function resolveTwitchTokenStorePath() {
  const config = getConfig();
  const configured = cleanString(config.twitchTokenStore || process.env.TWITCH_TOKEN_STORE || "");
  const rootDir = getRootDirSafe();
  if (configured) return path.isAbsolute(configured) ? configured : path.join(rootDir, configured);
  return path.join(rootDir, "tokens", "twitch_user.json");
}
function readJsonFile(filePath, fallback = null) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}
function getStoredTwitchUserToken() {
  const storePath = resolveTwitchTokenStorePath();
  const data = readJsonFile(storePath, null);
  if (!data || !data.access_token) return { token: "", storePath, present: false };
  return { token: cleanString(data.access_token), storePath, present: true, expiresAt: Number(data.expires_at || 0) };
}
function getEnvTwitchToken() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_ACCESS_TOKEN || process.env.TWITCH_USER_ACCESS_TOKEN || process.env.TWITCH_ACCESS_TOKEN || "");
}
function getEnvTwitchClientId() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_CLIENT_ID || process.env.TWITCH_CLIENT_ID || "");
}
function getEnvTwitchBroadcasterId() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_BROADCASTER_ID || process.env.TWITCH_BROADCASTER_ID || "");
}
function twitchWriteConfirmOk(input = {}) {
  const config = getConfig();
  if (config.twitchRewardWriteRequireConfirm === false) return true;
  const value = input && (input.confirm ?? input.twitchConfirm ?? input.confirmWrite);
  return value === true || cleanString(value).toLowerCase() === "push_to_twitch" || cleanString(value).toLowerCase() === "twitch_write";
}

function migrateDatabase(reason = "init") {
  const config = getConfig();
  if (config.dbMigrationEnabled === false || config.migrationExecutionEnabled === false) {
    dbMigrationState = { ...dbMigrationState, attempted: true, executed: false, ok: false, reason: "disabled_by_config", lastRunAt: nowIso() };
    return dbMigrationState;
  }

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
    createdTables: TABLES.map(t => t.name),
    createdIndexes: TABLES.flatMap(t => t.createIndexSql || []),
    seededCategories: 0
  };

  try {
    database.ensureSchema(MODULE_NAME, SCHEMA_TARGET_VERSION, (fromVersion, toVersion) => {
      if (toVersion !== 1) return;
      for (const table of TABLES) {
        database.exec(table.createTableSql);
        for (const sql of table.createIndexSql || []) database.exec(sql);
      }
    });

    const now = nowIso();
    for (const category of DEFAULT_CATEGORIES) {
      const result = database.run(`
        INSERT OR IGNORE INTO channelpoints_categories
          (category_key, label, description, sort_order, enabled, created_at, updated_at)
        VALUES
          (:category_key, :label, :description, :sort_order, :enabled, :created_at, :updated_at)
      `, { ...category, created_at: now, updated_at: now });
      if (result && typeof result.changes === "number") state.seededCategories += result.changes;
    }

    state.executed = before < SCHEMA_TARGET_VERSION;
    state.ok = true;
    state.schemaVersionAfter = database.getSchemaVersion(MODULE_NAME);
    dbMigrationState = state;
    return dbMigrationState;
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    state.schemaVersionAfter = before;
    dbMigrationState = state;
    lastError = state.lastError;
    throw err;
  }
}

function tableCount(tableName) {
  try { return database.count(tableName); } catch (_) { return 0; }
}
function tableExists(tableName) {
  try { return database.tableExists(tableName); } catch (_) { return false; }
}

function getDbStatus() {
  ensureDbReady();
  const schemaVersion = database.getSchemaVersion(MODULE_NAME);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    status: schemaVersion >= SCHEMA_TARGET_VERSION ? "safe_local_tables_ready" : "schema_not_ready",
    databasePath: database.getDbPath(),
    schemaVersion,
    targetVersion: SCHEMA_TARGET_VERSION,
    migration: { ...dbMigrationState },
    tables: TABLES.map(table => ({
      name: table.name,
      exists: tableExists(table.name),
      count: tableExists(table.name) ? tableCount(table.name) : 0,
      plannedFields: table.fields.length,
      indexes: table.createIndexSql || []
    })),
    safety: {
      additiveOnly: true,
      noTwitchWriteInThisVersion: true,
      noDataReplacement: true,
      productiveDbMustNotBeReplaced: "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite"
    }
  };
}

function buildSchemaPreview() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    schemaPreviewVersion: "0.3.0",
    status: "local_crud_ready",
    dbMigrationEnabled: config.dbMigrationEnabled !== false,
    migrationExecutionEnabled: config.migrationExecutionEnabled !== false,
    migrationExecutionImplemented: true,
    localCrudImplemented: true,
    sqliteCompatible: true,
    tables: TABLES.map(t => ({
      name: t.name,
      purpose: t.purpose,
      source: t.source,
      primaryKey: t.primaryKey,
      fieldCount: t.fields.length,
      fields: [...t.fields],
      createTableSql: t.createTableSql,
      createIndexSql: [...(t.createIndexSql || [])]
    })),
    seedPreview: { defaultCategories: DEFAULT_CATEGORIES, executionEnabled: true },
    safety: {
      noUnsafeDbWriteInThisVersion: true,
      noTwitchWriteInThisVersion: true,
      additiveOnly: true,
      productiveDbMustNotBeReplaced: "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite"
    },
    mediaIntegration: buildMediaPlan().mediaSystem,
    rules: [
      "This version writes only local reward/category/redemption rows in the existing SQLite database.",
      "This version must not call Twitch reward create/update/delete APIs.",
      "Deactivate in STEP493 only changes local system_enabled/is_paused state.",
      "Real Twitch is_enabled=false comes in a later Twitch sync/API step.",
      "Media references must point to the existing media system; no new upload endpoint."
    ]
  };
}

function buildModel() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    modelVersion: "0.4.0",
    status: "local_reward_crud_ready_no_twitch_write",
    dbMigrationEnabled: getConfig().dbMigrationEnabled !== false,
    schemaPreviewAvailable: true,
    migrationExecutionImplemented: true,
    localCrudImplemented: true,
    tablesPlanned: TABLES.map(table => ({ name: table.name, planned: true, schemaPreviewCreated: true, migrationCreated: true, purpose: table.purpose })),
    fields: {
      categories: TABLES[0].fields,
      rewards: TABLES[1].fields,
      redemptions: TABLES[2].fields
    },
    defaultCategories: DEFAULT_CATEGORIES,
    actionTypes: ACTION_TYPES,
    rules: [
      "No Twitch write action in this local CRUD/media execution version.",
      "Local reward CRUD is SQLite-only.",
      "Deactivate later must update Twitch Custom Reward is_enabled=false, not only a local flag.",
      "Media files must use the existing media system/upload mask.",
      "No new upload endpoint in channelpoints.js."
    ]
  };
}

function buildMediaPlan() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    status: "planning_only_uses_existing_media_system",
    mediaSystem: {
      enabled: true,
      module: "media",
      uploadUi: "existing_dashboard_media_upload_mask",
      pickerComponent: "htdocs/dashboard/components/media_picker.js",
      fieldComponent: "htdocs/dashboard/components/media_field.js",
      note: "Channelpoints must use the existing media system and upload mask. Do not create a second upload system."
    },
    plannedRewardMediaFields: ["media_asset_id", "media_role", "action_payload_json.media", "dashboard preview via existing media picker"],
    plannedMediaRoles: ["sound", "image", "video", "overlay", "thumbnail", "none"],
    nonGoals: [
      "No new upload endpoint in channelpoints.js.",
      "No second media database/table for assets.",
      "No direct filesystem upload handling in channelpoints.js."
    ]
  };
}

function mapRewardRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    reward_key: row.reward_key,
    twitch_reward_id: row.twitch_reward_id || "",
    title: row.title || "",
    prompt: row.prompt || "",
    cost: Number(row.cost || 0),
    category_key: row.category_key || "general",
    sort_order: Number(row.sort_order || 0),
    system_enabled: Number(row.system_enabled || 0) === 1,
    twitch_is_enabled: Number(row.twitch_is_enabled || 0) === 1,
    is_paused: Number(row.is_paused || 0) === 1,
    require_user_input: Number(row.require_user_input || 0) === 1,
    input_label: row.input_label || "",
    action_type: row.action_type || "manual",
    action_key: row.action_key || "",
    action_payload_json: row.action_payload_json || "{}",
    action_payload: safeJsonParse(row.action_payload_json, {}),
    media_asset_id: row.media_asset_id || "",
    media_role: row.media_role || "none",
    queue_mode: row.queue_mode || "none",
    priority: Number(row.priority || 0),
    cooldown_seconds: Number(row.cooldown_seconds || 0),
    max_per_stream: Number(row.max_per_stream || 0),
    max_per_user_per_stream: Number(row.max_per_user_per_stream || 0),
    auto_fulfill: Number(row.auto_fulfill || 0) === 1,
    notes: row.notes || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || ""
  };
}

function mapCategoryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    category_key: row.category_key,
    label: row.label || "",
    description: row.description || "",
    sort_order: Number(row.sort_order || 0),
    enabled: Number(row.enabled || 0) === 1,
    created_at: row.created_at || "",
    updated_at: row.updated_at || ""
  };
}

function mapRedemptionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    twitch_redemption_id: row.twitch_redemption_id || "",
    twitch_reward_id: row.twitch_reward_id || "",
    reward_key: row.reward_key || "",
    user_id: row.user_id || "",
    user_login: row.user_login || "",
    user_display_name: row.user_display_name || "",
    user_input: row.user_input || "",
    status: row.status || "",
    queue_group: row.queue_group || "",
    result_json: row.result_json || "{}",
    result: safeJsonParse(row.result_json, {}),
    redeemed_at: row.redeemed_at || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || ""
  };
}

function listRedemptions(req = {}) {
  ensureDbReady();
  const q = req.query || req || {};
  const status = cleanString(q.status || "");
  const rewardKey = cleanString(q.reward || q.reward_key || "");
  const userLogin = cleanString(q.user || q.user_login || "").toLowerCase();
  const limit = Math.max(1, Math.min(200, intValue(q.limit, 50)));
  const rows = database.all(`
    SELECT * FROM channelpoints_redemptions
    WHERE (:status = '' OR status = :status)
      AND (:rewardKey = '' OR reward_key = :rewardKey)
      AND (:userLogin = '' OR user_login = :userLogin)
    ORDER BY COALESCE(redeemed_at, created_at) DESC, id DESC
    LIMIT :limit
  `, { status, rewardKey, userLogin, limit }) || [];
  return rows.map(mapRedemptionRow);
}

function buildRedemptionsStatus(req = {}) {
  const rows = listRedemptions(req);
  let counts = { total: 0, executed: 0, failed: 0, pending: 0, skipped: 0 };
  try {
    const countRows = database.all("SELECT status, COUNT(*) AS count FROM channelpoints_redemptions GROUP BY status") || [];
    for (const row of countRows) {
      const key = cleanString(row.status || "pending");
      counts.total += Number(row.count || 0);
      if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] = Number(row.count || 0);
    }
  } catch (_) {}
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, redemptions: rows, counts, twitchWrite: false };
}

function listCategories(req) {
  ensureDbReady();
  const includeDisabled = boolValue(req.query.includeDisabled, true);
  const rows = database.all(`
    SELECT * FROM channelpoints_categories
    WHERE (:includeDisabled = 1 OR enabled = 1)
    ORDER BY sort_order ASC, label ASC
  `, { includeDisabled: includeDisabled ? 1 : 0 }) || [];
  return rows.map(mapCategoryRow);
}

function listRewards(req) {
  ensureDbReady();
  const includeDisabled = boolValue(req.query.includeDisabled, true);
  const category = cleanString(req.query.category || req.query.category_key || "");
  const rows = database.all(`
    SELECT * FROM channelpoints_rewards
    WHERE (:includeDisabled = 1 OR system_enabled = 1)
      AND (:category = '' OR category_key = :category)
    ORDER BY sort_order ASC, title ASC, id ASC
  `, { includeDisabled: includeDisabled ? 1 : 0, category }) || [];
  localCrudStats.listed += 1;
  localCrudStats.lastCrudAt = nowIso();
  localCrudStats.lastCrudAction = "list_rewards";
  return rows.map(mapRewardRow);
}

function getRewardByIdOrKey(value) {
  ensureDbReady();
  const raw = cleanString(value);
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  const row = Number.isFinite(id) && String(id) === raw
    ? database.get("SELECT * FROM channelpoints_rewards WHERE id = :id", { id })
    : database.get("SELECT * FROM channelpoints_rewards WHERE reward_key = :key", { key: raw });
  return mapRewardRow(row);
}

function normalizeRewardInput(input = {}, existing = null) {
  const now = nowIso();
  const title = cleanString(input.title, existing ? existing.title : "");
  const rewardKey = cleanString(input.reward_key || input.key, existing ? existing.reward_key : slugify(title || "reward"));
  if (!rewardKey) throw new Error("reward_key_required");
  if (!title) throw new Error("title_required");

  const payloadRaw = input.action_payload_json !== undefined ? input.action_payload_json : input.action_payload;
  const payloadObject = typeof payloadRaw === "string" ? safeJsonParse(payloadRaw, null) : (payloadRaw && typeof payloadRaw === "object" ? payloadRaw : null);
  const actionPayloadJson = payloadObject === null
    ? cleanString(payloadRaw, existing ? existing.action_payload_json : "{}")
    : jsonString(payloadObject, {});

  const data = {
    reward_key: rewardKey,
    twitch_reward_id: cleanString(input.twitch_reward_id, existing ? existing.twitch_reward_id : ""),
    title,
    prompt: cleanString(input.prompt, existing ? existing.prompt : ""),
    cost: Math.max(1, intValue(input.cost, existing ? existing.cost : 100)),
    category_key: cleanString(input.category_key || input.category, existing ? existing.category_key : "general"),
    sort_order: intValue(input.sort_order, existing ? existing.sort_order : 100),
    system_enabled: boolValue(input.system_enabled, existing ? existing.system_enabled : true) ? 1 : 0,
    twitch_is_enabled: boolValue(input.twitch_is_enabled, existing ? existing.twitch_is_enabled : false) ? 1 : 0,
    is_paused: boolValue(input.is_paused, existing ? existing.is_paused : false) ? 1 : 0,
    require_user_input: boolValue(input.require_user_input, existing ? existing.require_user_input : false) ? 1 : 0,
    input_label: cleanString(input.input_label, existing ? existing.input_label : ""),
    action_type: cleanString(input.action_type, existing ? existing.action_type : "manual"),
    action_key: cleanString(input.action_key, existing ? existing.action_key : ""),
    action_payload_json: actionPayloadJson || "{}",
    media_asset_id: cleanString(input.media_asset_id, existing ? existing.media_asset_id : ""),
    media_role: cleanString(input.media_role, existing ? existing.media_role : "none"),
    queue_mode: cleanString(input.queue_mode, existing ? existing.queue_mode : "none"),
    priority: intValue(input.priority, existing ? existing.priority : 0),
    cooldown_seconds: Math.max(0, intValue(input.cooldown_seconds, existing ? existing.cooldown_seconds : 0)),
    max_per_stream: Math.max(0, intValue(input.max_per_stream, existing ? existing.max_per_stream : 0)),
    max_per_user_per_stream: Math.max(0, intValue(input.max_per_user_per_stream, existing ? existing.max_per_user_per_stream : 0)),
    auto_fulfill: boolValue(input.auto_fulfill, existing ? existing.auto_fulfill : false) ? 1 : 0,
    notes: cleanString(input.notes, existing ? existing.notes : ""),
    updated_at: now,
    created_at: existing && existing.created_at ? existing.created_at : now
  };

  return data;
}


function buildRewardEventPayload(reward, extra = {}) {
  const safeReward = reward || {};
  return {
    reward: safeReward ? {
      id: safeReward.id || null,
      rewardKey: safeReward.reward_key || "",
      title: safeReward.title || "",
      categoryKey: safeReward.category_key || "",
      actionType: safeReward.action_type || "",
      actionKey: safeReward.action_key || "",
      mediaAssetId: safeReward.media_asset_id || "",
      mediaRole: safeReward.media_role || "",
      systemEnabled: safeReward.system_enabled === true || safeReward.system_enabled === 1,
      isPaused: safeReward.is_paused === true || safeReward.is_paused === 1,
      twitchRewardId: safeReward.twitch_reward_id || ""
    } : null,
    ...extra,
    twitchWrite: false,
    emittedAt: nowIso()
  };
}

function emitDomainEvent(action, payload = {}, options = {}) {
  const config = getConfig();
  if (config.busEnabled === false || config.busDomainEventsEnabled === false) return { ok: false, reason: "bus_domain_events_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_emit_unavailable" };
  const channel = cleanString(options.channel || "channelpoints.events");
  const eventAction = cleanString(action || "event");
  const now = nowIso();
  const eventPayload = {
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: eventAction,
    ...payload,
    timestamp: payload.timestamp || now
  };
  const result = currentBus.emit({
    type: "event",
    channel,
    action: eventAction,
    source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
    target: { type: "all", id: "*" },
    payload: eventPayload,
    meta: {
      requireAck: options.requireAck === true,
      replayable: options.replayable !== false,
      ttlMs: Math.max(1000, intValue(options.ttlMs, 60000)),
      productionTarget: true,
      localOnly: true,
      twitchWrite: false
    }
  });
  emittedDomainEvents += 1;
  lastDomainEventAt = now;
  lastDomainEvent = { channel, action: eventAction, ok: result && result.ok === true, payload: eventPayload };
  return result;
}

function emitRewardEvent(eventName, reward, extra = {}) {
  return emitDomainEvent(eventName, buildRewardEventPayload(reward, extra), { channel: "channelpoints.reward" });
}

function emitRedemptionEvent(eventName, reward, redemption, result = {}) {
  return emitDomainEvent(eventName, buildRewardEventPayload(reward, { redemption: redemption || null, result: result || null }), { channel: "channelpoints.redemption" });
}

function buildBusEventSpec() {
  const events = [
    { channel: "channelpoints.reward", action: "channelpoints.reward.created", when: "Lokaler Reward wurde erstellt." },
    { channel: "channelpoints.reward", action: "channelpoints.reward.updated", when: "Lokaler Reward wurde bearbeitet." },
    { channel: "channelpoints.reward", action: "channelpoints.reward.deleted", when: "Lokaler Reward wurde gelöscht." },
    { channel: "channelpoints.reward", action: "channelpoints.reward.enabled", when: "Lokaler Reward wurde aktiviert." },
    { channel: "channelpoints.reward", action: "channelpoints.reward.disabled", when: "Lokaler Reward wurde deaktiviert/pausiert." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.created", when: "Lokale/Test-Einlösung wurde gespeichert." },
    { channel: "channelpoints.redemption", action: "received", when: "Twitch EventSub Redemption kommt über den Communication Bus rein." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.received", when: "EventSub-Redemption wurde normalisiert und lokal gespeichert." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.executed_from_eventsub", when: "Aktiver lokaler Reward wurde durch eine Redemption ausgeführt." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.blocked", when: "Redemption wurde blockiert, weil Reward inaktiv ist oder keine Aktion hat." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.executed", when: "Einlösung wurde erfolgreich ausgeführt." },
    { channel: "channelpoints.redemption", action: "channelpoints.redemption.failed", when: "Einlösung oder Ausführung ist fehlgeschlagen." },
    { channel: "channelpoints.twitch", action: "channelpoints.twitch.readiness", when: "Twitch-Readiness wurde abgefragt." },
    { channel: "channelpoints.twitch", action: "channelpoints.twitch.auth_scope_check", when: "Twitch-Auth-/Scope-Check wurde abgefragt." },
    { channel: "channelpoints.test", action: "ping", when: "Bus-Selbsttest." }
  ];
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "eventbus_domain_events_documented",
    domainEventsEnabled: getConfig().busDomainEventsEnabled !== false,
    localOnly: true,
    twitchWrite: false,
    events,
    stats: {
      emittedDomainEvents,
      receivedBusEvents,
      lastDomainEventAt,
      lastDomainEvent,
      lastBusEventAt,
      lastBusEvent
    }
  };
}

function createReward(input = {}) {
  ensureDbReady();
  const data = normalizeRewardInput(input, null);
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
  `, data);
  localCrudStats.created += 1;
  localCrudStats.lastCrudAt = nowIso();
  localCrudStats.lastCrudAction = "create_reward";
  const created = getRewardByIdOrKey(data.reward_key);
  publishStatus("reward_created");
  emitRewardEvent("channelpoints.reward.created", created, { crudAction: "created" });
  return created;
}

function updateReward(idOrKey, input = {}) {
  ensureDbReady();
  const existing = getRewardByIdOrKey(idOrKey);
  if (!existing) return null;
  const data = normalizeRewardInput(input, existing);
  const updateParams = {
    reward_key: data.reward_key,
    twitch_reward_id: data.twitch_reward_id,
    title: data.title,
    prompt: data.prompt,
    cost: data.cost,
    category_key: data.category_key,
    sort_order: data.sort_order,
    system_enabled: data.system_enabled,
    twitch_is_enabled: data.twitch_is_enabled,
    is_paused: data.is_paused,
    require_user_input: data.require_user_input,
    input_label: data.input_label,
    action_type: data.action_type,
    action_key: data.action_key,
    action_payload_json: data.action_payload_json,
    media_asset_id: data.media_asset_id,
    media_role: data.media_role,
    queue_mode: data.queue_mode,
    priority: data.priority,
    cooldown_seconds: data.cooldown_seconds,
    max_per_stream: data.max_per_stream,
    max_per_user_per_stream: data.max_per_user_per_stream,
    auto_fulfill: data.auto_fulfill,
    notes: data.notes,
    updated_at: data.updated_at,
    id: existing.id
  };
  database.run(`
    UPDATE channelpoints_rewards SET
      reward_key = :reward_key,
      twitch_reward_id = :twitch_reward_id,
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
    WHERE id = :id
  `, updateParams);
  localCrudStats.updated += 1;
  localCrudStats.lastCrudAt = nowIso();
  localCrudStats.lastCrudAction = "update_reward";
  const updated = getRewardByIdOrKey(data.reward_key);
  publishStatus("reward_updated");
  emitRewardEvent("channelpoints.reward.updated", updated, { crudAction: "updated", previousRewardKey: existing.reward_key });
  return updated;
}

function setRewardEnabled(idOrKey, enabled, paused = null) {
  ensureDbReady();
  const existing = getRewardByIdOrKey(idOrKey);
  if (!existing) return null;
  if (enabled) assertImportedRewardCanActivate(existing);
  const now = nowIso();
  const isPaused = paused === null ? existing.is_paused : !!paused;
  database.run(`
    UPDATE channelpoints_rewards
    SET system_enabled = :enabled,
        is_paused = :is_paused,
        updated_at = :updated_at
    WHERE id = :id
  `, { enabled: enabled ? 1 : 0, is_paused: isPaused ? 1 : 0, updated_at: now, id: existing.id });
  if (enabled) localCrudStats.enabled += 1; else localCrudStats.disabled += 1;
  localCrudStats.lastCrudAt = now;
  localCrudStats.lastCrudAction = enabled ? "enable_reward" : "disable_reward";
  const updated = getRewardByIdOrKey(String(existing.id));
  publishStatus(enabled ? "reward_enabled_local" : "reward_disabled_local");
  emitRewardEvent(enabled ? "channelpoints.reward.enabled" : "channelpoints.reward.disabled", updated, { crudAction: enabled ? "enabled" : "disabled", localOnly: true });
  return updated;
}

function rewardActionPayload(reward) {
  if (!reward) return {};
  return reward.action_payload && typeof reward.action_payload === "object" ? reward.action_payload : safeJsonParse(reward.action_payload_json, {});
}

function rewardMediaId(reward) {
  const payload = rewardActionPayload(reward);
  return cleanString(
    reward && reward.media_asset_id ||
    payload.mediaId ||
    payload.media_asset_id ||
    payload.soundMediaId ||
    payload.videoMediaId ||
    payload.media && payload.media.id ||
    ""
  );
}

function rewardMediaType(reward) {
  const payload = rewardActionPayload(reward);
  const actionType = cleanString(reward && reward.action_type || payload.actionType || payload.type || "").toLowerCase();
  const role = cleanString(reward && reward.media_role || payload.mediaRole || payload.role || "").toLowerCase();
  const explicit = cleanString(payload.mediaType || payload.kind || payload.assetType || "").toLowerCase();
  const actionKey = cleanString(reward && reward.action_key || payload.actionKey || "").toLowerCase();
  if (["video", "animation"].includes(explicit)) return "video";
  if (["audio", "sound"].includes(explicit)) return "audio";
  if (["video", "animation", "overlay"].includes(role)) return "video";
  if (["sound", "audio"].includes(role)) return "audio";
  if (actionType.includes("video") || actionKey.includes("video")) return "video";
  if (actionType.includes("sound") || actionType.includes("audio") || actionKey.includes("audio") || actionKey.includes("sound")) return "audio";
  return reward && reward.action_type === "media" ? "video" : "audio";
}

function isExecutableMediaReward(reward) {
  if (!reward) return false;
  const actionType = cleanString(reward.action_type || "").toLowerCase();
  const mediaId = rewardMediaId(reward);
  if (!mediaId) return false;
  return ["media", "sound", "video_play", "sound_play"].includes(actionType) || ["video", "audio"].includes(rewardMediaType(reward));
}

function isTextReward(reward) {
  if (!reward) return false;
  const payload = rewardActionPayload(reward);
  const actionType = cleanString(reward.action_type || payload.actionType || "").toLowerCase();
  const actionKey = cleanString(reward.action_key || payload.actionKey || "").toLowerCase();
  return actionType === "chat_message" || actionKey === "send_text" || actionType === "text_only" || payload.textMode === "single" || payload.textMode === "textKey";
}

function isExecutableReward(reward) {
  return isExecutableMediaReward(reward) || isTextReward(reward);
}

function isImportedReward(reward) {
  return !!(reward && cleanString(reward.twitch_reward_id || ""));
}

function isImportedRewardMissingAction(reward) {
  return isImportedReward(reward) && !isExecutableReward(reward);
}

function assertImportedRewardCanActivate(reward) {
  const config = getConfig();
  if (config.importedRewardActionGuardEnabled === false) return true;
  if (isImportedRewardMissingAction(reward)) {
    const err = new Error("imported_reward_action_missing");
    err.reason = "imported_reward_action_missing";
    err.details = {
      rewardKey: reward.reward_key || "",
      title: reward.title || "",
      twitchRewardId: reward.twitch_reward_id || "",
      actionType: reward.action_type || "",
      actionKey: reward.action_key || "",
      mediaAssetId: reward.media_asset_id || "",
      note: "Importierte Twitch-Rewards ohne konfigurierte Aktion bleiben lokal gesperrt. Erst Sound/Video/Text konfigurieren, dann aktivieren."
    };
    throw err;
  }
  return true;
}

function buildTextRewardResult(reward, input = {}) {
  const payload = rewardActionPayload(reward);
  const textMode = cleanString(payload.textMode || payload.mode || "single");
  const text = cleanString(payload.text || payload.message || "");
  const textKey = cleanString(payload.textKey || payload.key || "");
  const selection = cleanString(payload.selection || "random");
  const userLogin = cleanString(input.userLogin || input.user || input.login || "testuser").toLowerCase();
  const displayName = cleanString(input.userDisplayName || input.displayName || input.user || userLogin || "testuser");
  const renderedText = textMode === "textKey"
    ? cleanString(text || `[Textgruppe vorbereitet: ${textKey || "ohne_key"}]`)
    : text;

  return {
    ok: !!(renderedText || textKey),
    type: "text",
    textMode,
    text: renderedText,
    textKey,
    selection,
    target: cleanString(payload.target || "twitch_chat"),
    userLogin,
    userDisplayName: displayName,
    rewardKey: reward.reward_key,
    rewardTitle: reward.title || reward.reward_key,
    message: renderedText || (textKey ? `[Textgruppe vorbereitet: ${textKey}]` : ""),
    note: textMode === "textKey" ? "Textgruppen-Auswahl ist vorbereitet; zentrale Textverwaltung folgt später." : "Einzeltext wurde lokal als Einlösungs-Ergebnis gespeichert.",
    twitchWrite: false,
    streamerbotPayloadPrepared: true
  };
}

function explicitMediaOutputTarget(_payload) {
  // STEP522: Channelpoints does not force Device/Overlay/Both for media rewards.
  // The Sound-System is the central audio/media layer and decides the effective output
  // based on media type, configured device/overlay availability and Discord routing.
  // Manual output overrides will be reintroduced later through the Sound-System rules.
  return "";
}

function buildRewardExecutionPayload(reward, input = {}) {
  const payload = rewardActionPayload(reward);
  const mediaId = rewardMediaId(reward);
  const mediaType = rewardMediaType(reward);
  const isVideo = mediaType === "video";
  const userLogin = cleanString(input.userLogin || input.user || input.login || payload.userLogin || "testuser").toLowerCase();
  const displayName = cleanString(input.userDisplayName || input.displayName || input.userName || input.user || userLogin || "testuser");
  const outputTarget = explicitMediaOutputTarget(payload);
  const executionPayload = {
    command: isVideo ? "play_video_media" : "play_audio_media",
    cmd: isVideo ? "play_video_media" : "play_audio_media",
    rawInput: cleanString(input.rawInput || input.userInput || ""),
    input: cleanString(input.userInput || input.input || ""),
    rawMessage: cleanString(input.rawMessage || `channelpoints:${reward.reward_key}`),
    message: cleanString(input.message || `channelpoints:${reward.reward_key}`),
    args: Array.isArray(input.args) ? input.args : [],
    user: displayName,
    userName: displayName,
    userLogin,
    login: userLogin,
    displayName,
    userDisplayName: displayName,
    userId: cleanString(input.userId || input.twitchUserId || ""),
    source: "channelpoints",
    channel: cleanString(input.channel || ""),
    mediaId,
    mediaType,
    type: isVideo ? "video" : "file",
    soundId: "",
    sound: "",
    volume: intValue(payload.volume, isVideo ? 80 : 85),
    target: cleanString(payload.target || "both"),
    category: cleanString(payload.category || "channel_reward"),
    requestedBy: userLogin || displayName,
    label: cleanString(payload.label || reward.title || reward.reward_key || mediaId),
    playBehavior: "queue",
    queueIfBusy: true,
    parallelAllowed: payload.parallelAllowed === true,
    outputTargetMode: "sound_system",
    meta: {
      rewardId: reward.id,
      rewardKey: reward.reward_key,
      twitchRewardId: reward.twitch_reward_id || "",
      actionType: reward.action_type || "",
      mediaId,
      source: "channelpoints",
      outputTargetMode: "sound_system"
    }
  };
  if (outputTarget) executionPayload.outputTarget = outputTarget;
  return executionPayload;
}

function httpJsonRequest(method, targetUrl, payload = {}) {
  const cleanUrl = cleanString(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error("target_url_missing"));
  const body = JSON.stringify(payload);
  const options = {
    hostname: process.env.CHANNELPOINTS_TARGET_HOST || DEFAULT_TARGET_HOST,
    port: Number(process.env.CHANNELPOINTS_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`,
    method: String(method || "POST").trim().toUpperCase() || "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
  };
  return new Promise((resolve, reject) => {
    const request = http.request(options, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        if (response.statusCode >= 200 && response.statusCode < 300) resolve({ ok: true, statusCode: response.statusCode, data: parsed });
        else {
          const err = new Error(`target_http_${response.statusCode}`);
          err.statusCode = response.statusCode;
          err.data = parsed;
          reject(err);
        }
      });
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}


function twitchJsonRequest(method, targetUrl, token, clientId, payload = null) {
  const body = payload === null || payload === undefined ? "" : JSON.stringify(payload);
  const headers = {
    Accept: "application/json",
    "Client-Id": clientId,
    Authorization: `Bearer ${token}`
  };
  if (body) {
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = Buffer.byteLength(body);
  }
  return new Promise((resolve, reject) => {
    const request = https.request(targetUrl, { method, headers }, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        const result = { ok: response.statusCode >= 200 && response.statusCode < 300, statusCode: response.statusCode, data: parsed };
        if (result.ok) resolve(result);
        else {
          const err = new Error(parsed && (parsed.message || parsed.error) ? cleanString(parsed.message || parsed.error) : `twitch_http_${response.statusCode}`);
          err.statusCode = response.statusCode;
          err.data = parsed;
          reject(err);
        }
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

async function buildTwitchWriteAuthContext(req = {}) {
  const config = getConfig();
  if (config.twitchRewardManagementEnabled === false) throw new Error("twitch_reward_management_disabled");
  const validateUrl = cleanString(config.twitchAuthValidateUrl || "/api/twitch/auth/validate");
  const response = await httpGetJson(validateUrl);
  const auth = response && response.data && typeof response.data === "object" ? response.data : {};
  const scopes = Array.isArray(auth.scopes) ? auth.scopes.map(item => String(item || "")) : [];
  const normalizedScopes = scopes.map(scope => scope.toLowerCase());
  const hasManageScope = normalizedScopes.includes("channel:manage:redemptions");
  const broadcasterId = cleanString((req.query && req.query.broadcaster_id) || auth.broadcasterId || getEnvTwitchBroadcasterId());
  const clientId = cleanString(auth.clientId || getEnvTwitchClientId());
  const stored = getStoredTwitchUserToken();
  const envToken = getEnvTwitchToken();
  const token = stored.token || envToken;

  if (!response.ok || auth.ok !== true) throw new Error(`twitch_auth_validate_failed:${auth.error || response.statusCode || "unknown"}`);
  if (!broadcasterId) throw new Error("missing_broadcaster_id");
  if (!clientId) throw new Error("missing_client_id_env_or_validate_payload");
  if (!token) throw new Error("missing_user_access_token_store");
  if (!hasManageScope) throw new Error("missing_scope_channel_manage_redemptions");
  if (auth.broadcasterMatchRelevant === true && auth.tokenUserMatchesBroadcaster === false) throw new Error("token_user_does_not_match_broadcaster");

  return {
    broadcasterId,
    clientId,
    token,
    tokenSource: stored.token ? "twitch_user_token_store" : "env_fallback",
    tokenStorePath: stored.storePath,
    auth: {
      login: cleanString(auth.login || ""),
      userId: cleanString(auth.userId || ""),
      broadcasterId,
      tokenUserMatchesBroadcaster: auth.tokenUserMatchesBroadcaster === true,
      scopes,
      expiresIn: Number(auth.expiresIn || 0)
    }
  };
}


function isTwitchRewardNotFoundError(err) {
  const statusCode = Number(err && err.statusCode || 0);
  const message = cleanString(err && err.message || "").toLowerCase();
  const dataMessage = cleanString(err && err.data && (err.data.message || err.data.error) || "").toLowerCase();
  const combined = `${message} ${dataMessage}`;
  return statusCode === 404 || combined.includes("not found") || combined.includes("custom reward specified in the id query parameter was not found");
}

function isTwitchClientOwnershipError(err) {
  const message = cleanString(err && err.message || "").toLowerCase();
  const dataMessage = cleanString(err && err.data && (err.data.message || err.data.error) || "").toLowerCase();
  const combined = `${message} ${dataMessage}`;
  return combined.includes("client-id") || combined.includes("client id used to create") || combined.includes("must match the client id");
}

function clearLocalTwitchRewardMapping(localReward, reason = "stale_twitch_reward_id") {
  if (!localReward || !localReward.id) return localReward;
  const now = nowIso();
  database.run(`
    UPDATE channelpoints_rewards SET
      twitch_reward_id = '',
      twitch_is_enabled = 0,
      is_paused = 0,
      updated_at = :updated_at
    WHERE id = :id
  `, { id: localReward.id, updated_at: now });
  emitDomainEvent("channelpoints.twitch.reward.mapping_cleared", {
    reward: buildRewardEventPayload(localReward).reward,
    reason,
    oldTwitchRewardId: localReward.twitch_reward_id || "",
    twitchWrite: false
  }, { channel: "channelpoints.twitch" });
  return getRewardByIdOrKey(String(localReward.id));
}

function normalizeHexColor(value) {
  const clean = cleanString(value || "");
  if (!clean) return "";
  return /^#[0-9a-fA-F]{6}$/.test(clean) ? clean : "";
}

function twitchRewardSettingsFromPayload(reward) {
  const payload = rewardActionPayload(reward);
  const twitch = payload && typeof payload.twitch === "object" && payload.twitch !== null ? payload.twitch : {};
  return {
    background_color: normalizeHexColor(twitch.background_color || twitch.backgroundColor || payload.twitch_background_color || payload.background_color),
    should_redemptions_skip_request_queue: boolValue(
      twitch.should_redemptions_skip_request_queue ?? twitch.skipRequestQueue ?? payload.should_redemptions_skip_request_queue,
      reward && reward.auto_fulfill === true
    )
  };
}

function twitchRedemptionCompletionPolicyFromPayload(reward) {
  const payload = rewardActionPayload(reward);
  const twitch = payload && typeof payload.twitch === "object" && payload.twitch !== null ? payload.twitch : {};
  const skipQueue = boolValue(
    twitch.should_redemptions_skip_request_queue ?? twitch.skipRequestQueue ?? payload.should_redemptions_skip_request_queue,
    reward && reward.auto_fulfill === true
  );

  const hasFulfill = twitch.fulfill_after_success !== undefined || twitch.fulfillAfterSuccess !== undefined || payload.fulfill_after_success !== undefined;
  const hasCancel = twitch.cancel_on_failure !== undefined || twitch.cancelOnFailure !== undefined || payload.cancel_on_failure !== undefined;
  return {
    skipQueue,
    fulfillAfterSuccess: boolValue(
      twitch.fulfill_after_success ?? twitch.fulfillAfterSuccess ?? payload.fulfill_after_success,
      skipQueue ? false : true
    ),
    cancelOnFailure: boolValue(
      twitch.cancel_on_failure ?? twitch.cancelOnFailure ?? payload.cancel_on_failure,
      skipQueue ? false : true
    ),
    explicitFulfillAfterSuccess: hasFulfill,
    explicitCancelOnFailure: hasCancel
  };
}

function isRealTwitchRedemptionId(value) {
  const clean = cleanString(value);
  if (!clean) return false;
  if (clean.startsWith("dashboard_") || clean.startsWith("local_") || clean.startsWith("eventsub_preview_")) return false;
  return /^[0-9a-fA-F-]{20,}$/.test(clean);
}

async function updateTwitchRedemptionStatus(normalized, status, req = {}) {
  if (!normalized || !normalized.twitch_reward_id || !normalized.twitch_redemption_id) throw new Error("redemption_status_ids_missing");
  if (!isRealTwitchRedemptionId(normalized.twitch_redemption_id)) throw new Error("not_real_twitch_redemption_id");
  const cleanStatus = cleanString(status).toUpperCase();
  if (!["FULFILLED", "CANCELED"].includes(cleanStatus)) throw new Error("invalid_redemption_status");
  const authContext = await buildTwitchWriteAuthContext(req);
  const url = new URL("https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions");
  url.searchParams.set("broadcaster_id", authContext.broadcasterId);
  url.searchParams.set("reward_id", normalized.twitch_reward_id);
  url.searchParams.set("id", normalized.twitch_redemption_id);
  const response = await twitchJsonRequest("PATCH", url, authContext.token, authContext.clientId, { status: cleanStatus });
  return { ok: true, status: cleanStatus, twitchStatusCode: response.statusCode, data: response.data || null, tokenSource: authContext.tokenSource, twitchWrite: true };
}

async function applyRedemptionCompletionPolicy(normalized, decision, execution) {
  const config = getConfig();
  const reward = normalized && normalized.local_reward ? normalized.local_reward : null;
  const policy = twitchRedemptionCompletionPolicyFromPayload(reward);
  const base = {
    enabled: config.twitchRedemptionCompletionEnabled !== false,
    policy,
    attempted: false,
    skipped: false,
    action: "none",
    status: "",
    twitchWrite: false,
    result: null,
    error: ""
  };

  if (base.enabled === false) return { ...base, skipped: true, reason: "completion_disabled_by_config" };
  if (!normalized || !normalized.mapped || !reward) return { ...base, skipped: true, reason: "unmapped_redemption" };
  if (policy.skipQueue) return { ...base, skipped: true, reason: "twitch_skip_queue_enabled" };
  if (!isRealTwitchRedemptionId(normalized.twitch_redemption_id)) return { ...base, skipped: true, reason: "not_real_twitch_redemption_id" };
  if (!normalized.twitch_reward_id) return { ...base, skipped: true, reason: "missing_twitch_reward_id" };

  let targetStatus = "";
  let action = "none";
  if (execution && execution.executed === true && policy.fulfillAfterSuccess === true) {
    targetStatus = "FULFILLED";
    action = "fulfilled_after_success";
  } else if ((execution && execution.failed === true || decision && decision.blocked === true) && policy.cancelOnFailure === true) {
    targetStatus = "CANCELED";
    action = "canceled_after_failure";
  } else {
    return { ...base, skipped: true, reason: "policy_no_twitch_status_change" };
  }

  try {
    const result = await updateTwitchRedemptionStatus(normalized, targetStatus);
    const now = nowIso();
    redemptionEventSubStats.lastCompletionAt = now;
    redemptionEventSubStats.lastCompletionAction = action;
    redemptionEventSubStats.lastCompletionStatus = targetStatus;
    if (targetStatus === "FULFILLED") redemptionEventSubStats.fulfilledOnTwitch += 1;
    if (targetStatus === "CANCELED") redemptionEventSubStats.canceledOnTwitch += 1;
    emitDomainEvent(targetStatus === "FULFILLED" ? "channelpoints.redemption.fulfilled_on_twitch" : "channelpoints.redemption.canceled_on_twitch", {
      redemptionId: normalized.twitch_redemption_id,
      twitchRewardId: normalized.twitch_reward_id,
      rewardKey: normalized.reward_key,
      action,
      status: targetStatus,
      result
    }, { channel: "channelpoints.redemption" });
    return { ...base, attempted: true, action, status: targetStatus, twitchWrite: true, result };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    redemptionEventSubStats.completionFailed += 1;
    redemptionEventSubStats.lastCompletionAt = nowIso();
    redemptionEventSubStats.lastCompletionAction = action;
    redemptionEventSubStats.lastCompletionStatus = targetStatus;
    redemptionEventSubStats.lastError = message;
    emitDomainEvent("channelpoints.redemption.completion_failed", {
      redemptionId: normalized.twitch_redemption_id,
      twitchRewardId: normalized.twitch_reward_id,
      rewardKey: normalized.reward_key,
      action,
      status: targetStatus,
      error: message
    }, { channel: "channelpoints.redemption" });
    return { ...base, attempted: true, action, status: targetStatus, twitchWrite: true, error: message };
  }
}

function buildTwitchRewardWritePayload(reward, forcedEnabled = null, options = {}) {
  if (!reward) throw new Error("reward_not_found");
  const isConfigured = isExecutableReward(reward);
  const enabled = forcedEnabled === null ? (reward.twitch_is_enabled === true && reward.is_paused !== true) : !!forcedEnabled;
  // STEP525: Twitch-Aktiv/Inaktiv ist reine Twitch-Sichtbarkeit.
  // Lokale Aktion ist fuer Twitch-Anlegen/Aktualisieren nicht erforderlich;
  // fehlende Aktionen blockieren spaeter nur die lokale Ausfuehrung einer Einloesung.

  const settings = twitchRewardSettingsFromPayload(reward);
  const maxPerStream = Math.max(0, intValue(reward.max_per_stream, 0));
  const maxPerUserPerStream = Math.max(0, intValue(reward.max_per_user_per_stream, 0));
  const cooldownSeconds = Math.max(0, intValue(reward.cooldown_seconds, 0));

  const payload = {
    title: cleanString(reward.title || reward.reward_key),
    prompt: cleanString(reward.prompt || ""),
    cost: Math.max(1, intValue(reward.cost, 1)),
    is_enabled: enabled,
    is_user_input_required: reward.require_user_input === true,
    is_max_per_stream_enabled: maxPerStream > 0,
    max_per_stream: maxPerStream > 0 ? maxPerStream : 1,
    is_max_per_user_per_stream_enabled: maxPerUserPerStream > 0,
    max_per_user_per_stream: maxPerUserPerStream > 0 ? maxPerUserPerStream : 1,
    is_global_cooldown_enabled: cooldownSeconds > 0,
    global_cooldown_seconds: cooldownSeconds > 0 ? cooldownSeconds : 1,
    should_redemptions_skip_request_queue: settings.should_redemptions_skip_request_queue === true
  };

  if (settings.background_color) payload.background_color = settings.background_color;
  if (options.includeUpdateOnly === true) payload.is_paused = reward.is_paused === true;
  return payload;
}

function normalizeTwitchWrittenReward(raw = {}) {
  return {
    twitch_reward_id: cleanString(raw.id || ""),
    title: cleanString(raw.title || ""),
    prompt: cleanString(raw.prompt || ""),
    cost: Math.max(1, intValue(raw.cost, 1)),
    twitch_is_enabled: raw.is_enabled === true,
    is_paused: raw.is_paused === true,
    require_user_input: raw.is_user_input_required === true
  };
}

function updateLocalRewardFromTwitchWrite(localReward, twitchReward) {
  if (!localReward || !twitchReward || !twitchReward.twitch_reward_id) return localReward;
  const now = nowIso();
  database.run(`
    UPDATE channelpoints_rewards SET
      twitch_reward_id = :twitch_reward_id,
      twitch_is_enabled = :twitch_is_enabled,
      is_paused = :is_paused,
      require_user_input = :require_user_input,
      updated_at = :updated_at
    WHERE id = :id
  `, {
    id: localReward.id,
    twitch_reward_id: twitchReward.twitch_reward_id,
    twitch_is_enabled: twitchReward.twitch_is_enabled ? 1 : 0,
    is_paused: twitchReward.is_paused ? 1 : 0,
    require_user_input: twitchReward.require_user_input ? 1 : 0,
    updated_at: now
  });
  return getRewardByIdOrKey(String(localReward.id));
}

async function pushRewardToTwitch(idOrKey, input = {}, req = {}) {
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");
  if (!twitchWriteConfirmOk(input)) throw new Error("twitch_write_confirmation_required");
  const authContext = await buildTwitchWriteAuthContext(req);
  const createIfMissing = boolValue(input.createIfMissing, true);
  const forcedEnabled = input.enabled === undefined ? null : boolValue(input.enabled, false);

  let method = "POST";
  let action = "created_on_twitch";
  let usedFallback = false;
  let staleTwitchRewardId = "";
  let workingReward = reward;

  function buildUrl(twitchRewardId = "") {
    const url = new URL("https://api.twitch.tv/helix/channel_points/custom_rewards");
    url.searchParams.set("broadcaster_id", authContext.broadcasterId);
    if (twitchRewardId) url.searchParams.set("id", twitchRewardId);
    return url;
  }

  let url = buildUrl();
  if (reward.twitch_reward_id) {
    method = "PATCH";
    action = "updated_on_twitch";
    url = buildUrl(reward.twitch_reward_id);
  } else if (!createIfMissing) {
    throw new Error("reward_not_mapped_to_twitch");
  }

  const payload = buildTwitchRewardWritePayload(reward, forcedEnabled, { includeUpdateOnly: method === "PATCH" });

  let response;
  try {
    response = await twitchJsonRequest(method, url, authContext.token, authContext.clientId, payload);
  } catch (err) {
    if (method !== "PATCH" || !createIfMissing || !isTwitchRewardNotFoundError(err) || isTwitchClientOwnershipError(err)) throw err;
    staleTwitchRewardId = reward.twitch_reward_id || "";
    workingReward = clearLocalTwitchRewardMapping(reward, "stale_twitch_reward_id_not_found_on_twitch") || reward;
    method = "POST";
    action = "created_on_twitch_after_stale_id";
    usedFallback = true;
    url = buildUrl();
    const createPayload = buildTwitchRewardWritePayload(workingReward, forcedEnabled, { includeUpdateOnly: false });
    response = await twitchJsonRequest(method, url, authContext.token, authContext.clientId, createPayload);
  }

  const writtenRaw = Array.isArray(response.data && response.data.data) ? response.data.data[0] : null;
  const twitchReward = normalizeTwitchWrittenReward(writtenRaw || {});
  const updated = updateLocalRewardFromTwitchWrite(workingReward, twitchReward);
  emitDomainEvent("channelpoints.twitch.reward.pushed", {
    reward: buildRewardEventPayload(updated).reward,
    action,
    twitchStatusCode: response.statusCode,
    twitchRewardId: twitchReward.twitch_reward_id,
    staleTwitchRewardId,
    usedFallback,
    twitchWrite: true
  }, { channel: "channelpoints.twitch" });
  publishStatus("twitch_reward_pushed");
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action,
    reward: updated,
    twitchReward,
    staleTwitchRewardId,
    usedFallback,
    twitchStatusCode: response.statusCode,
    twitchWrite: true,
    tokenSource: authContext.tokenSource,
    note: usedFallback
      ? "Die lokale Twitch-ID war auf Twitch nicht mehr vorhanden. Sie wurde lokal entfernt und der Reward wurde neu auf Twitch erstellt."
      : (reward.twitch_reward_id ? "Lokaler Reward wurde auf Twitch aktualisiert." : "Lokaler Reward wurde als Twitch-Kanalpunkte-Belohnung erstellt.")
  };
}

async function pushRewardEnabledStateToTwitch(reward, enabled, req = {}) {
  if (!reward || !reward.twitch_reward_id) return { ok: true, skipped: true, reason: "reward_not_mapped_to_twitch", twitchWrite: false };
  const authContext = await buildTwitchWriteAuthContext(req);
  const payload = buildTwitchRewardWritePayload(reward, !!enabled, { includeUpdateOnly: true });
  const url = new URL("https://api.twitch.tv/helix/channel_points/custom_rewards");
  url.searchParams.set("broadcaster_id", authContext.broadcasterId);
  url.searchParams.set("id", reward.twitch_reward_id);
  const response = await twitchJsonRequest("PATCH", url, authContext.token, authContext.clientId, payload);
  const writtenRaw = Array.isArray(response.data && response.data.data) ? response.data.data[0] : null;
  const twitchReward = normalizeTwitchWrittenReward(writtenRaw || {});
  const updated = updateLocalRewardFromTwitchWrite(reward, twitchReward);
  emitDomainEvent(enabled ? "channelpoints.twitch.reward.enabled" : "channelpoints.twitch.reward.disabled", {
    reward: buildRewardEventPayload(updated).reward,
    twitchStatusCode: response.statusCode,
    twitchRewardId: twitchReward.twitch_reward_id,
    twitchWrite: true
  }, { channel: "channelpoints.twitch" });
  publishStatus(enabled ? "twitch_reward_enabled" : "twitch_reward_disabled");
  return { ok: true, action: enabled ? "enabled_on_twitch" : "disabled_on_twitch", reward: updated, twitchReward, twitchStatusCode: response.statusCode, twitchWrite: true, tokenSource: authContext.tokenSource };
}

async function setLocalTwitchEnabledFlag(idOrKey, enabled, paused = null) {
  ensureDbReady();
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) return null;
  const now = nowIso();
  const isPaused = paused === null ? reward.is_paused === true : !!paused;
  database.run(`
    UPDATE channelpoints_rewards
    SET twitch_is_enabled = :twitch_is_enabled,
        is_paused = :is_paused,
        updated_at = :updated_at
    WHERE id = :id
  `, {
    id: reward.id,
    twitch_is_enabled: enabled ? 1 : 0,
    is_paused: isPaused ? 1 : 0,
    updated_at: now
  });
  return getRewardByIdOrKey(String(reward.id));
}

function desiredTwitchEnabledForSave(reward, input = {}) {
  if (Object.prototype.hasOwnProperty.call(input || {}, "twitch_is_enabled")) return boolValue(input.twitch_is_enabled, false);
  if (Object.prototype.hasOwnProperty.call(input || {}, "is_enabled")) return boolValue(input.is_enabled, false);
  if (Object.prototype.hasOwnProperty.call(input || {}, "enabled")) return boolValue(input.enabled, false);
  if (reward && reward.twitch_reward_id) return reward.twitch_is_enabled === true;
  return false;
}

async function syncSavedRewardToTwitch(reward, input = {}, req = {}, reason = "saved") {
  if (!reward) return { ok: false, skipped: true, reason: "reward_missing_after_save", twitchWrite: false };
  if (getConfig().twitchRewardWriteOnLocalToggle === false) {
    return { ok: true, skipped: true, reason: "twitch_write_disabled", reward, twitchWrite: false };
  }
  // STEP527: Neue Rewards werden beim Speichern zwar auf Twitch angelegt,
  // aber immer zuerst inaktiv erstellt. Aktiv/Inaktiv wird ausschliesslich
  // ueber den Uebersichts-Schalter gesteuert.
  const enabled = reason === "created" ? false : desiredTwitchEnabledForSave(reward, input);
  try {
    const twitch = await pushRewardToTwitch(String(reward.id || reward.reward_key), {
      confirm: "push_to_twitch",
      createIfMissing: true,
      enabled
    }, req);
    const current = twitch && twitch.reward ? twitch.reward : (getRewardByIdOrKey(String(reward.id)) || reward);
    emitDomainEvent("channelpoints.reward.saved_to_twitch", {
      reward: buildRewardEventPayload(current).reward,
      saveReason: reason,
      enabled,
      twitchWrite: twitch && twitch.twitchWrite === true,
      twitchRewardId: current.twitch_reward_id || ""
    }, { channel: "channelpoints.reward" });
    return { ok: true, action: "saved_to_twitch", saveReason: reason, enabled, reward: current, twitch, twitchWrite: twitch && twitch.twitchWrite === true };
  } catch (err) {
    return {
      ok: false,
      action: "save_to_twitch_failed",
      saveReason: reason,
      enabled,
      reward,
      error: err && err.message ? err.message : String(err),
      twitchWrite: false
    };
  }
}

async function activateRewardSystemAndTwitch(idOrKey, input = {}, req = {}) {
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");

  const twitch = await pushRewardToTwitch(idOrKey, {
    ...(input || {}),
    confirm: "push_to_twitch",
    createIfMissing: true,
    enabled: true
  }, req);
  const current = twitch && twitch.reward ? twitch.reward : setLocalTwitchEnabledFlag(idOrKey, true, false) || reward;

  emitDomainEvent("channelpoints.reward.twitch_enabled", {
    reward: buildRewardEventPayload(current).reward,
    twitch: {
      action: twitch.action || "pushed_to_twitch",
      twitchRewardId: current.twitch_reward_id || "",
      twitchWrite: twitch.twitchWrite === true,
      usedFallback: twitch.usedFallback === true,
      staleTwitchRewardId: twitch.staleTwitchRewardId || ""
    }
  }, { channel: "channelpoints.reward" });
  publishStatus("reward_enabled_on_twitch");

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "enabled_on_twitch",
    reward: current,
    twitch,
    twitchWrite: twitch && twitch.twitchWrite === true,
    note: "Reward wurde auf Twitch erstellt/aktualisiert und aktiviert. Lokale Aktivierung wird nicht separat verwendet."
  };
}

async function deactivateRewardSystemAndTwitch(idOrKey, input = {}, req = {}) {
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");
  let twitch = { ok: true, skipped: true, reason: "reward_not_mapped_to_twitch", twitchWrite: false };
  let workingReward = reward;

  if (reward.twitch_reward_id && getConfig().twitchRewardWriteOnLocalToggle !== false) {
    try {
      twitch = await pushRewardEnabledStateToTwitch(reward, false, req);
      if (twitch && twitch.reward) workingReward = twitch.reward;
    } catch (err) {
      if (!isTwitchRewardNotFoundError(err) || isTwitchClientOwnershipError(err)) throw err;
      const staleTwitchRewardId = reward.twitch_reward_id || "";
      workingReward = clearLocalTwitchRewardMapping(reward, "stale_twitch_reward_id_not_found_on_twitch_during_disable") || reward;
      twitch = {
        ok: true,
        skipped: true,
        reason: "stale_twitch_reward_id_removed",
        staleTwitchRewardId,
        twitchWrite: false,
        note: "Die lokale Twitch-ID war auf Twitch nicht mehr vorhanden. Sie wurde lokal entfernt."
      };
    }
  }

  const current = setLocalTwitchEnabledFlag(String((workingReward && workingReward.id) || reward.id || idOrKey), false, boolValue(input && input.is_paused, false)) || workingReward || reward;

  emitDomainEvent("channelpoints.reward.twitch_disabled", {
    reward: buildRewardEventPayload(current).reward,
    twitch: {
      action: twitch.action || twitch.reason || "disabled_on_twitch",
      twitchRewardId: current.twitch_reward_id || "",
      twitchWrite: twitch.twitchWrite === true,
      staleTwitchRewardId: twitch.staleTwitchRewardId || ""
    }
  }, { channel: "channelpoints.reward" });
  publishStatus("reward_disabled_on_twitch");

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "disabled_on_twitch",
    reward: current,
    twitch,
    twitchWrite: twitch && twitch.twitchWrite === true,
    note: "Reward wurde auf Twitch deaktiviert. Lokale Aktivierung wird nicht separat verwendet."
  };
}

function twitchDeleteConfirmOk(input = {}) {
  return cleanString(input.confirm || input.confirmation || "") === "delete_from_twitch";
}

function markLocalRewardAfterTwitchDelete(reward, localAction = "disable") {
  if (!reward) return null;
  const action = cleanString(localAction || "disable").toLowerCase();
  if (action === "delete" || action === "remove") {
    const result = deleteReward(String(reward.id || reward.reward_key));
    return { action: "deleted_local", reward: result && result.reward ? result.reward : reward, deleted: result && result.deleted ? result.deleted : 0, currentReward: null };
  }

  const now = nowIso();
  const disable = action !== "keep";
  database.run(`
    UPDATE channelpoints_rewards SET
      twitch_reward_id = '',
      twitch_is_enabled = 0,
      system_enabled = CASE WHEN :disable = 1 THEN 0 ELSE system_enabled END,
      is_paused = CASE WHEN :disable = 1 THEN 1 ELSE is_paused END,
      updated_at = :updated_at
    WHERE id = :id
  `, {
    id: reward.id,
    disable: disable ? 1 : 0,
    updated_at: now
  });
  const currentReward = getRewardByIdOrKey(String(reward.id));
  if (disable) {
    localCrudStats.disabled += 1;
    localCrudStats.lastCrudAt = now;
    localCrudStats.lastCrudAction = "disable_after_twitch_delete";
  }
  return { action: disable ? "unmapped_and_disabled_local" : "unmapped_local", reward, deleted: 0, currentReward };
}

async function deleteRewardFromTwitch(idOrKey, input = {}, req = {}) {
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");
  if (!twitchDeleteConfirmOk(input)) throw new Error("twitch_delete_confirmation_required");
  if (!reward.twitch_reward_id) throw new Error("reward_not_mapped_to_twitch");

  const authContext = await buildTwitchWriteAuthContext(req);
  const url = new URL("https://api.twitch.tv/helix/channel_points/custom_rewards");
  url.searchParams.set("broadcaster_id", authContext.broadcasterId);
  url.searchParams.set("id", reward.twitch_reward_id);

  const response = await twitchJsonRequest("DELETE", url, authContext.token, authContext.clientId, null);
  const localAction = cleanString(input.localAction || (boolValue(input.deleteLocal, false) ? "delete" : "disable"), "disable").toLowerCase();
  const localResult = markLocalRewardAfterTwitchDelete(reward, localAction);
  const currentReward = localResult && localResult.currentReward ? localResult.currentReward : null;

  emitDomainEvent("channelpoints.twitch.reward.deleted", {
    reward: buildRewardEventPayload(currentReward || reward).reward,
    deletedReward: buildRewardEventPayload(reward).reward,
    twitchStatusCode: response.statusCode,
    twitchRewardId: reward.twitch_reward_id,
    localAction: localResult ? localResult.action : localAction,
    twitchWrite: true
  }, { channel: "channelpoints.twitch" });
  publishStatus("twitch_reward_deleted");

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: localResult && localResult.action === "deleted_local" ? "deleted_on_twitch_and_local" : "deleted_on_twitch",
    twitchRewardId: reward.twitch_reward_id,
    reward: currentReward,
    deletedReward: reward,
    localAction: localResult ? localResult.action : localAction,
    localDeleted: localResult ? localResult.deleted : 0,
    twitchStatusCode: response.statusCode,
    twitchWrite: true,
    tokenSource: authContext.tokenSource,
    note: localResult && localResult.action === "deleted_local"
      ? "Twitch-Reward wurde gelöscht und der lokale Reward wurde entfernt."
      : "Twitch-Reward wurde gelöscht. Lokal wurde die Twitch-Verknüpfung entfernt und der Reward standardmäßig deaktiviert."
  };
}


function buildTwitchRewardManagementStatus() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "sound_system_routing_defaults_ready",
    enabled: config.twitchRewardManagementEnabled !== false,
    writeOnLocalToggle: config.twitchRewardWriteOnLocalToggle !== false,
    requireConfirmForPush: config.twitchRewardWriteRequireConfirm !== false,
    requiredScope: "channel:manage:redemptions",
    rules: {
      saveCreatesOrUpdatesTwitchReward: true,
      newRewardSaveCreatesTwitchRewardInactive: true,
      overviewToggleControlsTwitchOnly: true,
      localSystemEnabledHiddenInDashboard: true,
      missingActionDoesNotBlockTwitchSave: true,
      noExtraDashboardMode: true,
      twitchDeleteRequiresConfirm: true,
      twitchCreateUpdateSupportsAdvancedRewardParams: true,
      redemptionCompletionPolicySupported: true,
      activationIsTwitchOnly: true,
      activationCreatesOrRepairsTwitchReward: true
    },
    routes: [
      `${ROUTE_PREFIX}/twitch/manage/status`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/push`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/enable`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/disable`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/delete`,
      "redemption completion: FULFILLED/CANCELED after execution",
      "save reward: local create/update + Twitch create/update; new rewards default inactive on Twitch",
      "overview toggle: Twitch enable/disable only"
    ]
  };
}

function deleteReward(idOrKey) {
  ensureDbReady();
  const existing = getRewardByIdOrKey(idOrKey);
  if (!existing) return null;
  const result = database.run("DELETE FROM channelpoints_rewards WHERE id = :id", { id: existing.id });
  const deleted = Number(result && typeof result.changes === "number" ? result.changes : 0);
  localCrudStats.deleted += deleted;
  localCrudStats.lastCrudAt = nowIso();
  localCrudStats.lastCrudAction = "delete_reward";
  if (deleted > 0) {
    publishStatus("reward_deleted_local");
    emitRewardEvent("channelpoints.reward.deleted", existing, { crudAction: "deleted", deleted });
  }
  return { reward: existing, deleted };
}

function summarizeExecutionResult(result) {
  const data = result && result.data ? result.data : {};
  const inner = data && data.result && typeof data.result === "object" ? data.result : {};
  const dropped = inner.dropped === true;
  const started = inner.started === true;
  const queued = inner.queued === true;
  const failed = data && data.ok === false || inner.failed === true || dropped === true;
  const success = !!(result && result.ok) && data && data.ok === true && !failed && (started || queued || inner.parallel === true);
  return {
    ok: !!(result && result.ok),
    statusCode: result && result.statusCode || 0,
    dataOk: data && data.ok === true,
    mediaSuccess: success,
    started,
    queued,
    dropped,
    failed,
    reason: inner.reason || (dropped ? "dropped_by_sound_system" : ""),
    message: data && data.message || "",
    result: data && data.result || null,
    item: data && data.item ? { requestId: data.item.requestId, soundId: data.item.soundId, label: data.item.label, mediaType: data.item.mediaType, mediaUrl: data.item.mediaUrl, videoUrl: data.item.videoUrl, outputTarget: data.item.outputTarget } : null
  };
}

function assertMediaExecutionAccepted(summary) {
  if (!summary || summary.mediaSuccess !== true) {
    const reason = cleanString(summary && summary.reason || summary && summary.message || "media_execution_not_accepted");
    const err = new Error(reason || "media_execution_not_accepted");
    err.summary = summary || null;
    err.data = summary || null;
    throw err;
  }
}

function recordRedemptionExecution(reward, input, status, result) {
  try {
    ensureDbReady();
    const now = nowIso();
    const redemption = {
      twitch_redemption_id: cleanString(input.twitchRedemptionId || input.redemptionId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      twitch_reward_id: reward.twitch_reward_id || "",
      reward_key: reward.reward_key,
      user_id: cleanString(input.userId || ""),
      user_login: cleanString(input.userLogin || input.user || input.login || "testuser").toLowerCase(),
      user_display_name: cleanString(input.userDisplayName || input.displayName || input.user || "testuser"),
      user_input: cleanString(input.userInput || input.input || ""),
      status,
      queue_group: cleanString(input.queueGroup || reward.queue_mode || ""),
      result_json: jsonString(result, {}),
      redeemed_at: cleanString(input.redeemedAt || now),
      created_at: now,
      updated_at: now
    };
    database.run(`
      INSERT INTO channelpoints_redemptions
        (twitch_redemption_id, twitch_reward_id, reward_key, user_id, user_login, user_display_name, user_input, status, queue_group, result_json, redeemed_at, created_at, updated_at)
      VALUES
        (:twitch_redemption_id, :twitch_reward_id, :reward_key, :user_id, :user_login, :user_display_name, :user_input, :status, :queue_group, :result_json, :redeemed_at, :created_at, :updated_at)
    `, redemption);
    emitRedemptionEvent("channelpoints.redemption.created", reward, redemption, result);
    return redemption;
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
    return null;
  }
}

function buildExecutionCheck(reward, input = {}) {
  const config = getConfig();
  const mediaId = rewardMediaId(reward);
  const mediaType = rewardMediaType(reward);
  const targetUrl = cleanString(config.mediaExecutionTargetUrl || "/api/sound/play");
  const isMedia = isExecutableMediaReward(reward);
  const isText = isTextReward(reward);
  executionStats.checked += 1;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    rewardKey: reward.reward_key,
    rewardTitle: reward.title,
    systemEnabled: !!reward.system_enabled,
    isPaused: !!reward.is_paused,
    actionType: reward.action_type,
    actionKey: reward.action_key,
    executionType: isMedia ? "media" : (isText ? "text" : "unsupported"),
    mediaId,
    mediaType,
    executable: isExecutableReward(reward) && !isImportedRewardMissingAction(reward),
    importedReward: isImportedReward(reward),
    importedRewardActionMissing: isImportedRewardMissingAction(reward),
    effectiveTargetUrl: isMedia ? targetUrl : "local_text_result",
    targetMethod: isMedia ? "POST" : "LOCAL",
    payloadPreview: isMedia ? buildRewardExecutionPayload(reward, input) : buildTextRewardResult(reward, input),
    warnings: {
      disabled: reward.system_enabled ? false : true,
      paused: reward.is_paused ? true : false,
      missingMediaId: isMedia && !mediaId ? true : false,
      missingText: isText && !buildTextRewardResult(reward, input).message ? true : false,
      importedRewardActionMissing: isImportedRewardMissingAction(reward),
      unsupportedAction: isExecutableReward(reward) && !isImportedRewardMissingAction(reward) ? false : true
    },
    updatedAt: nowIso()
  };
}

async function executeReward(idOrKey, input = {}) {
  const config = getConfig();
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");
  if (!reward.system_enabled) throw new Error("reward_disabled_local");
  if (reward.is_paused) throw new Error("reward_paused_local");
  assertImportedRewardCanActivate(reward);

  if (isTextReward(reward)) {
    if (config.textRewardExecutionEnabled === false) throw new Error("text_reward_execution_disabled");
    const summary = buildTextRewardResult(reward, input);
    if (!summary.message) throw new Error("text_reward_missing_text");
    executionStats.executed += 1;
    executionStats.lastExecutionAt = nowIso();
    executionStats.lastExecutionAction = "execute_text_reward";
    executionStats.lastExecutionReward = reward.reward_key;
    executionStats.lastExecutionResult = summary;
    executionStats.lastExecutionError = "";
    const redemption = recordRedemptionExecution(reward, input, "executed", summary);
    emitRedemptionEvent("channelpoints.redemption.executed", reward, redemption, summary);
    publishStatus("reward_text_executed");
    return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "executed_text_reward", reward, result: summary, twitchWrite: false };
  }

  if (config.mediaExecutionBridgeEnabled === false) throw new Error("media_execution_bridge_disabled");
  if (!isExecutableMediaReward(reward)) throw new Error("reward_not_executable");
  const targetUrl = cleanString(config.mediaExecutionTargetUrl || "/api/sound/play");
  const payload = buildRewardExecutionPayload(reward, input);
  await maybeRunChannelpointsSoundShadowDryRunForReward(reward, {
    ...(input || {}),
    source: input && input.source || 'executeReward'
  });
  try {
    const result = await httpJsonRequest("POST", targetUrl, payload);
    const summary = summarizeExecutionResult(result);
    assertMediaExecutionAccepted(summary);
    executionStats.executed += 1;
    executionStats.lastExecutionAt = nowIso();
    executionStats.lastExecutionAction = "execute_media_reward";
    executionStats.lastExecutionReward = reward.reward_key;
    executionStats.lastExecutionResult = summary;
    executionStats.lastExecutionError = "";
    const redemption = recordRedemptionExecution(reward, input, "executed", summary);
    emitRedemptionEvent("channelpoints.redemption.executed", reward, redemption, summary);
    publishStatus("reward_media_executed");
    return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "executed_media_reward", reward, targetUrl, payload, result: summary, twitchWrite: false };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    executionStats.failed += 1;
    executionStats.lastExecutionAt = nowIso();
    executionStats.lastExecutionAction = "execute_media_reward_failed";
    executionStats.lastExecutionReward = reward.reward_key;
    executionStats.lastExecutionResult = err && err.data ? err.data : null;
    executionStats.lastExecutionError = message;
    const failedSummary = err && err.summary ? err.summary : (err && err.data ? err.data : null);
    const redemption = recordRedemptionExecution(reward, input, "failed", { error: message, data: failedSummary });
    emitRedemptionEvent("channelpoints.redemption.failed", reward, redemption, { error: message, data: failedSummary });
    lastError = message;
    throw err;
  }
}


function getRewardByTwitchRewardId(twitchRewardId) {
  ensureDbReady();
  const id = cleanString(twitchRewardId);
  if (!id) return null;
  const row = database.get("SELECT * FROM channelpoints_rewards WHERE twitch_reward_id = :id", { id });
  return mapRewardRow(row);
}

function normalizeRedemptionPayload(input = {}) {
  const body = input && typeof input === "object" ? input : {};
  const event = body.event && typeof body.event === "object" ? body.event : body;
  const reward = event.reward && typeof event.reward === "object" ? event.reward : {};
  const now = nowIso();
  const twitchRewardId = cleanString(event.reward_id || event.rewardId || reward.id || body.reward_id || "");
  const twitchRedemptionId = cleanString(event.id || event.redemption_id || event.redemptionId || body.redemption_id || `eventsub_preview_${Date.now()}`);
  const userLogin = cleanString(event.user_login || event.userLogin || event.user || "").toLowerCase();
  const userDisplayName = cleanString(event.user_name || event.userDisplayName || event.user_display_name || event.user || userLogin || "");
  const localReward = getRewardByTwitchRewardId(twitchRewardId);
  const fallbackRewardKey = cleanString(event.reward_key || event.rewardKey || slugify(reward.title || event.reward_title || "reward"));
  return {
    ok: true,
    source: body.event ? "twitch_eventsub_event" : "local_payload",
    twitch_redemption_id: twitchRedemptionId,
    twitch_reward_id: twitchRewardId,
    reward_key: localReward ? localReward.reward_key : fallbackRewardKey,
    mapped: !!localReward,
    local_reward: localReward,
    reward_title: cleanString(reward.title || event.reward_title || event.title || (localReward && localReward.title) || ""),
    reward_cost: intValue(reward.cost || event.reward_cost || event.cost || (localReward && localReward.cost), 0),
    user_id: cleanString(event.user_id || event.userId || body.user_id || ""),
    user_login: userLogin,
    user_display_name: userDisplayName,
    user_input: cleanString(event.user_input || event.userInput || event.input || ""),
    status: cleanString(event.status || "received"),
    redeemed_at: cleanString(event.redeemed_at || event.redeemedAt || now),
    normalized_at: now,
    raw_event: event
  };
}

function buildSimpleRedemptionDecision(normalized) {
  const reward = normalized && normalized.local_reward ? normalized.local_reward : null;
  const base = {
    mapped: !!(normalized && normalized.mapped && reward),
    rewardKey: normalized && normalized.reward_key || "",
    twitchRewardId: normalized && normalized.twitch_reward_id || "",
    shouldExecute: false,
    willExecute: false,
    blocked: false,
    reason: "not_checked",
    status: "received",
    executionType: "none",
    actionType: reward && reward.action_type || "",
    actionKey: reward && reward.action_key || "",
    mediaAssetId: reward && reward.media_asset_id || "",
    mediaRole: reward && reward.media_role || "",
    note: ""
  };
  if (!normalized || !normalized.mapped || !reward) {
    return { ...base, blocked: true, reason: "reward_not_mapped", status: "unmapped", note: "Keine lokale Reward-Zuordnung gefunden." };
  }
  if (!reward.system_enabled) {
    return { ...base, blocked: true, reason: "reward_inactive", status: "ignored", note: "Reward ist lokal inaktiv und wird deshalb nicht ausgeführt." };
  }
  if (reward.is_paused) {
    return { ...base, blocked: true, reason: "reward_paused", status: "ignored", note: "Reward ist lokal pausiert und wird deshalb nicht ausgeführt." };
  }
  if (!isExecutableReward(reward)) {
    return { ...base, blocked: true, reason: "reward_action_missing", status: "blocked", note: "Reward ist aktiv, hat aber keine vollständige Aktion." };
  }
  const check = buildExecutionCheck(reward, {
    userLogin: normalized.user_login,
    userDisplayName: normalized.user_display_name,
    userInput: normalized.user_input,
    twitchRedemptionId: normalized.twitch_redemption_id,
    redeemedAt: normalized.redeemed_at
  });
  return {
    ...base,
    shouldExecute: true,
    willExecute: true,
    blocked: false,
    reason: "reward_active_and_executable",
    status: "ready",
    executionType: check.executionType || "unknown",
    actionType: reward.action_type || "",
    actionKey: reward.action_key || "",
    mediaAssetId: rewardMediaId(reward),
    mediaRole: reward.media_role || "",
    target: check.effectiveTargetUrl || "local",
    note: "Reward ist aktiv und hat eine vollständige Aktion. Eine echte Einlösung wird ausgeführt."
  };
}

function buildRedemptionEventSubStatus() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "sound_system_routing_defaults_ready",
    enabled: config.redemptionEventSubPreparationEnabled !== false,
    storeEnabled: config.redemptionEventSubStoreEnabled !== false,
    processingRule: "Reward aktiv + Aktion vollständig = ausführen; Reward inaktiv oder Aktion fehlt = nicht ausführen.",
    safety: {
      noRewardTwitchWriteInRedemptionFlow: true,
      twitchWriteOnlyForCompletionStatus: config.twitchRedemptionCompletionEnabled !== false,
      noHttpModuleBridge: true,
      eventBusDriven: true,
      noExtraDashboardModes: true,
      activeFlagIsExecutionGate: true,
      actionRequiredForActivation: true,
      usesExistingRedemptionsTable: true,
      mediaRewardsUseSoundSystemQueue: true,
      droppedMediaIsFailure: true
    },
    stats: { ...redemptionEventSubStats },
    routes: [
      `${ROUTE_PREFIX}/eventsub/redemption/status`,
      `${ROUTE_PREFIX}/eventsub/redemption/preview`,
      `${ROUTE_PREFIX}/eventsub/redemption`,
      "eventbus: channelpoints.redemption / received"
    ]
  };
}

function storeNormalizedRedemption(normalized, decision = null, execution = null, completion = null) {
  ensureDbReady();
  if (!normalized || !normalized.twitch_redemption_id) throw new Error("redemption_id_required");
  const now = nowIso();
  const existing = database.get("SELECT * FROM channelpoints_redemptions WHERE twitch_redemption_id = :id", { id: normalized.twitch_redemption_id });
  const status = execution && execution.executed ? "executed" : (execution && execution.failed ? "failed" : (decision && decision.status ? decision.status : (normalized.mapped ? "received" : "unmapped")));
  const result = {
    source: normalized.source,
    mapped: normalized.mapped,
    rewardTitle: normalized.reward_title,
    rewardCost: normalized.reward_cost,
    decision: decision || null,
    execution: execution || null,
    completion: completion || null,
    note: execution && execution.executed
      ? "Aktiver Reward wurde durch die Einlösung ausgeführt."
      : (execution && execution.failed
        ? "Reward sollte ausgeführt werden, ist aber fehlgeschlagen."
        : (decision && decision.note ? decision.note : (normalized.mapped ? "Redemption wurde lokal gespeichert." : "Redemption wurde gespeichert, aber keinem lokalen Reward zugeordnet.")))
  };
  const params = {
    twitch_redemption_id: normalized.twitch_redemption_id,
    twitch_reward_id: normalized.twitch_reward_id,
    reward_key: normalized.reward_key,
    user_id: normalized.user_id,
    user_login: normalized.user_login,
    user_display_name: normalized.user_display_name,
    user_input: normalized.user_input,
    status,
    queue_group: "eventsub_redemption",
    result_json: jsonString(result, {}),
    redeemed_at: normalized.redeemed_at,
    created_at: now,
    updated_at: now
  };
  if (existing && existing.id) {
    const updateParams = {
      twitch_redemption_id: params.twitch_redemption_id,
      twitch_reward_id: params.twitch_reward_id,
      reward_key: params.reward_key,
      user_id: params.user_id,
      user_login: params.user_login,
      user_display_name: params.user_display_name,
      user_input: params.user_input,
      status: params.status,
      queue_group: params.queue_group,
      result_json: params.result_json,
      redeemed_at: params.redeemed_at,
      updated_at: params.updated_at
    };
    database.run(`
      UPDATE channelpoints_redemptions SET
        twitch_reward_id = :twitch_reward_id,
        reward_key = :reward_key,
        user_id = :user_id,
        user_login = :user_login,
        user_display_name = :user_display_name,
        user_input = :user_input,
        status = :status,
        queue_group = :queue_group,
        result_json = :result_json,
        redeemed_at = :redeemed_at,
        updated_at = :updated_at
      WHERE twitch_redemption_id = :twitch_redemption_id
    `, updateParams);
    redemptionEventSubStats.duplicates += 1;
  } else {
    database.run(`
      INSERT INTO channelpoints_redemptions
        (twitch_redemption_id, twitch_reward_id, reward_key, user_id, user_login, user_display_name, user_input, status, queue_group, result_json, redeemed_at, created_at, updated_at)
      VALUES
        (:twitch_redemption_id, :twitch_reward_id, :reward_key, :user_id, :user_login, :user_display_name, :user_input, :status, :queue_group, :result_json, :redeemed_at, :created_at, :updated_at)
    `, params);
  }
  const row = database.get("SELECT * FROM channelpoints_redemptions WHERE twitch_redemption_id = :id", { id: normalized.twitch_redemption_id });
  const stored = mapRedemptionRow(row);
  redemptionEventSubStats.stored += 1;
  redemptionEventSubStats.lastStoredAt = now;
  redemptionEventSubStats.lastRedemptionId = normalized.twitch_redemption_id;
  redemptionEventSubStats.lastRewardKey = normalized.reward_key;
  if (!normalized.mapped) redemptionEventSubStats.unmapped += 1;
  if (decision && decision.blocked) {
    redemptionEventSubStats.blocked += 1;
    if (decision.reason === "reward_inactive" || decision.reason === "reward_paused") redemptionEventSubStats.ignoredInactive += 1;
    if (decision.reason === "reward_action_missing") redemptionEventSubStats.missingAction += 1;
  }
  emitDomainEvent("channelpoints.redemption.received", {
    redemption: stored,
    mapped: normalized.mapped,
    localReward: normalized.local_reward ? buildRewardEventPayload(normalized.local_reward).reward : null,
    decision: decision || null,
    execution: execution || null,
    completion: completion || null
  }, { channel: "channelpoints.redemption" });
  if (execution && execution.executed) {
    emitDomainEvent("channelpoints.redemption.executed_from_eventsub", { redemption: stored, rewardKey: normalized.reward_key, execution }, { channel: "channelpoints.redemption" });
  } else if (decision && decision.blocked) {
    emitDomainEvent("channelpoints.redemption.blocked", { redemption: stored, rewardKey: normalized.reward_key, reason: decision.reason, decision }, { channel: "channelpoints.redemption" });
  }
  publishStatus("redemption_eventsub_received");
  return stored;
}

function previewRedemptionEventSubPayload(input = {}) {
  const normalized = normalizeRedemptionPayload(input);
  const decision = buildSimpleRedemptionDecision(normalized);
  redemptionEventSubStats.previewed += 1;
  redemptionEventSubStats.lastPreviewAt = nowIso();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: "preview_redemption_eventsub_payload",
    normalized,
    decision,
    willStore: false,
    willExecute: decision.willExecute === true,
    twitchWrite: false
  };
}

async function receiveRedemptionEventSubPayload(input = {}) {
  const config = getConfig();
  if (config.redemptionEventSubPreparationEnabled === false) throw new Error("redemption_eventsub_preparation_disabled");
  const normalized = normalizeRedemptionPayload(input);
  const decision = buildSimpleRedemptionDecision(normalized);
  let execution = { executed: false, failed: false, skipped: true, reason: decision.reason || "not_executable" };
  redemptionEventSubStats.received += 1;
  redemptionEventSubStats.lastReceivedAt = nowIso();
  redemptionEventSubStats.lastRedemptionId = normalized.twitch_redemption_id;
  redemptionEventSubStats.lastRewardKey = normalized.reward_key;

  if (decision.willExecute === true) {
    try {
      const result = await executeReward(normalized.reward_key, {
        userLogin: normalized.user_login,
        userDisplayName: normalized.user_display_name,
        userInput: normalized.user_input,
        twitchRedemptionId: normalized.twitch_redemption_id,
        redeemedAt: normalized.redeemed_at,
        source: "channelpoints_eventsub"
      });
      execution = { executed: true, failed: false, skipped: false, reason: "executed", result: { ok: true, action: result && result.action || "executed" } };
      redemptionEventSubStats.executed += 1;
      redemptionEventSubStats.lastExecutionAt = nowIso();
      redemptionEventSubStats.lastExecutionResult = execution;
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      execution = { executed: false, failed: true, skipped: false, reason: "execution_failed", error: message };
      redemptionEventSubStats.failed += 1;
      redemptionEventSubStats.lastExecutionAt = nowIso();
      redemptionEventSubStats.lastExecutionResult = execution;
      redemptionEventSubStats.lastError = message;
    }
  }

  const completion = await applyRedemptionCompletionPolicy(normalized, decision, execution);
  if (completion && completion.skipped) redemptionEventSubStats.completionSkipped += 1;

  if (config.redemptionEventSubStoreEnabled === false) {
    return {
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      action: "received_redemption_eventsub_payload_store_disabled",
      normalized,
      decision,
      execution,
      completion,
      stored: false,
      executed: execution.executed === true,
      twitchWrite: false
    };
  }
  const stored = storeNormalizedRedemption(normalized, decision, execution, completion);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    action: execution.executed ? "received_redemption_eventsub_payload_stored_and_executed" : "received_redemption_eventsub_payload_stored",
    normalized: { ...normalized, raw_event: undefined, local_reward: normalized.local_reward ? buildRewardEventPayload(normalized.local_reward).reward : null },
    decision,
    execution,
    completion,
    redemption: stored,
    stored: true,
    executed: execution.executed === true,
    executionSkipped: execution.executed ? "" : (execution.reason || decision.reason || "not_executed"),
    twitchWrite: false
  };
}

function buildBusStatus() {
  const currentBus = getBus();
  const busStatus = currentBus && typeof currentBus.getStatus === "function" ? currentBus.getStatus() : null;
  const clients = Array.isArray(busStatus && busStatus.clients) ? busStatus.clients : [];
  const subscriptions = Array.isArray(busStatus && busStatus.subscriptions) ? busStatus.subscriptions : [];
  const moduleClient = clients.find(client => client && client.module === MODULE_NAME && client.type === "module") || null;
  return {
    available: !!currentBus,
    registered: registeredAtBus,
    moduleClient,
    subscriptionCount: subscriptions.filter(item => item && item.module === MODULE_NAME).length,
    subscriptionIds: [...subscriptionIds],
    lastRegisterAt: lastBusRegisterAt,
    lastHeartbeatAt: lastBusHeartbeatAt,
    lastStatusAt: lastBusStatusAt,
    lastEventAt: lastBusEventAt,
    receivedEvents: receivedBusEvents,
    emittedDomainEvents,
    lastDomainEventAt,
    lastDomainEvent,
    core: busStatus ? { ok: busStatus.ok === true, bus: busStatus.bus, version: busStatus.version, moduleMeta: busStatus.moduleMeta || null, stats: busStatus.stats || null } : null
  };
}



function httpGetJson(targetUrl) {
  const cleanUrl = cleanString(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error("target_url_missing"));
  const options = {
    hostname: process.env.CHANNELPOINTS_TARGET_HOST || DEFAULT_TARGET_HOST,
    port: Number(process.env.CHANNELPOINTS_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`,
    method: "GET",
    headers: { "Accept": "application/json" }
  };
  return new Promise((resolve, reject) => {
    const request = http.request(options, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        if (response.statusCode >= 200 && response.statusCode < 300) resolve({ ok: true, statusCode: response.statusCode, data: parsed });
        else resolve({ ok: false, statusCode: response.statusCode, data: parsed });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

function requiredTwitchScopes() {
  return [
    { scope: "channel:read:redemptions", purpose: "Rewards und Redemptions lesen", requiredFor: ["read_rewards", "read_redemptions"], alternative: "channel:manage:redemptions" },
    { scope: "channel:manage:redemptions", purpose: "Rewards später erstellen/aktualisieren/deaktivieren und Redemptions erfüllen/abbrechen", requiredFor: ["manage_rewards", "update_redemption_status"], writeScope: true }
  ];
}

function summarizeScopeCheck(validateResult = {}) {
  const scopes = Array.isArray(validateResult.scopes) ? validateResult.scopes.map(item => String(item || "").trim()).filter(Boolean) : [];
  const normalized = scopes.map(scope => scope.toLowerCase());
  const hasRead = normalized.includes("channel:read:redemptions") || normalized.includes("channel:manage:redemptions");
  const hasManage = normalized.includes("channel:manage:redemptions");
  const broadcasterId = cleanString(validateResult.broadcasterId || process.env.TWITCH_BROADCASTER_ID || "");
  const userId = cleanString(validateResult.userId || "");
  const tokenUserMatchesBroadcaster = broadcasterId && userId ? broadcasterId === userId : validateResult.tokenUserMatchesBroadcaster === true;
  const broadcasterMatchRelevant = Boolean(broadcasterId && userId);
  const tokenOk = validateResult.ok === true;
  return {
    tokenOk,
    tokenPresent: validateResult.present === true || tokenOk,
    login: cleanString(validateResult.login || ""),
    userId,
    broadcasterId,
    broadcasterMatchRelevant,
    tokenUserMatchesBroadcaster,
    scopes,
    checks: {
      hasReadRedemptions: hasRead,
      hasManageRedemptions: hasManage,
      readyForReadOnlySync: tokenOk && hasRead && (!broadcasterMatchRelevant || tokenUserMatchesBroadcaster),
      readyForFutureWriteActions: tokenOk && hasManage && (!broadcasterMatchRelevant || tokenUserMatchesBroadcaster),
      missingScopes: [
        ...(hasRead ? [] : ["channel:read:redemptions oder channel:manage:redemptions"]),
        ...(hasManage ? [] : ["channel:manage:redemptions"])
      ]
    },
    expiresIn: Number(validateResult.expiresIn || 0),
    store: cleanString(validateResult.store || "")
  };
}

async function buildTwitchAuthScopeStatus() {
  const config = getConfig();
  const validateUrl = cleanString(config.twitchAuthValidateUrl || "/api/twitch/auth/validate");
  const requiredScopes = requiredTwitchScopes();
  const base = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "twitch_auth_scope_check",
    enabled: config.twitchAuthScopeCheckEnabled !== false,
    validateUrl,
    requiredScopes,
    safety: {
      noTwitchWrite: true,
      checkOnly: true,
      noRewardCreateUpdateDeleteOnTwitch: true,
      noRedemptionStatusUpdate: true
    }
  };
  if (config.twitchAuthScopeCheckEnabled === false) {
    return { ...base, ok: true, auth: { ok: false, skipped: true, reason: "disabled_by_config" }, scopeCheck: summarizeScopeCheck({ ok: false }) };
  }
  try {
    const response = await httpGetJson(validateUrl);
    const authPayload = response && response.data && typeof response.data === "object" ? response.data : { ok: false, raw: response ? response.data : null };
    const scopeCheck = summarizeScopeCheck(authPayload);
    return {
      ...base,
      auth: {
        ok: authPayload.ok === true,
        httpStatus: response.statusCode || 0,
        present: authPayload.present === true || authPayload.ok === true,
        login: authPayload.login || "",
        userId: authPayload.userId || "",
        broadcasterId: authPayload.broadcasterId || process.env.TWITCH_BROADCASTER_ID || "",
        tokenUserMatchesBroadcaster: authPayload.tokenUserMatchesBroadcaster === true,
        expiresIn: Number(authPayload.expiresIn || 0),
        error: authPayload.ok === true ? "" : (authPayload.error || authPayload.message || "auth_validate_not_ok")
      },
      scopeCheck,
      readiness: {
        tokenValidationImplemented: true,
        readyForReadOnlySync: scopeCheck.checks.readyForReadOnlySync,
        readyForFutureWriteActions: scopeCheck.checks.readyForFutureWriteActions,
        writeActionsStillDisabled: true
      }
    };
  } catch (err) {
    return {
      ...base,
      auth: { ok: false, present: false, error: err && err.message ? err.message : String(err) },
      scopeCheck: summarizeScopeCheck({ ok: false }),
      readiness: { tokenValidationImplemented: true, readyForReadOnlySync: false, readyForFutureWriteActions: false, writeActionsStillDisabled: true }
    };
  }
}

function countRewardsWithTwitchId() {
  try {
    ensureDbReady();
    if (!tableExists("channelpoints_rewards")) return 0;
    const row = database.get("SELECT COUNT(*) AS count FROM channelpoints_rewards WHERE twitch_reward_id IS NOT NULL AND twitch_reward_id <> ''") || {};
    return Number(row.count || 0);
  } catch (_) {
    return 0;
  }
}

function buildTwitchSyncStatus() {
  const config = getConfig();
  let counts = { rewards: 0, mappedRewards: 0, unmappedRewards: 0, redemptions: 0 };
  try {
    ensureDbReady();
    counts.rewards = tableExists("channelpoints_rewards") ? tableCount("channelpoints_rewards") : 0;
    counts.mappedRewards = countRewardsWithTwitchId();
    counts.unmappedRewards = Math.max(0, counts.rewards - counts.mappedRewards);
    counts.redemptions = tableExists("channelpoints_redemptions") ? tableCount("channelpoints_redemptions") : 0;
  } catch (_) {}

  const requiredScopes = requiredTwitchScopes();

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    status: "readiness_only_no_twitch_write",
    readiness: {
      localRewardsReady: counts.rewards >= 0,
      localRedemptionsReady: true,
      mediaExecutionReady: config.mediaExecutionBridgeEnabled !== false,
      textExecutionReady: config.textRewardExecutionEnabled !== false,
      twitchRewardManagementEnabled: config.twitchRewardManagementEnabled === true,
      twitchRewardSyncEnabled: config.twitchRewardSyncEnabled === true,
      writeActionsEnabled: false,
      eventSubImplemented: false,
      tokenValidationImplemented: true
    },
    counts,
    requiredScopes,
    plannedFlow: [
      "Twitch Reward lesen/synchronisieren",
      "twitch_reward_id lokal mappen",
      "EventSub Redemption empfangen",
      "lokale Redemption speichern",
      "lokale Reward-Aktion ausführen",
      "später Fulfill/Cancel an Twitch zurückmelden"
    ],
    safety: {
      noTwitchWrite: true,
      localOnly: true,
      noRewardCreateUpdateDeleteOnTwitch: true,
      deactivationStillLocalOnly: true
    },
    routesPlannedLater: [
      `${ROUTE_PREFIX}/twitch/sync`,
      `${ROUTE_PREFIX}/twitch/rewards`,
      `${ROUTE_PREFIX}/twitch/rewards/:id/enable`,
      `${ROUTE_PREFIX}/twitch/rewards/:id/disable`,
      `${ROUTE_PREFIX}/eventsub/redemption`,
      "eventbus: channelpoints.redemption / received"
    ],
    nextSteps: [
      "Twitch Token-/Scope-Prüfung testen",
      "Read-only Reward-Sync bauen",
      "Dashboard-Mapping lokal ↔ Twitch anzeigen",
      "EventSub-Redemption-Handler anbinden",
      "erst danach Twitch-Schreibaktionen gezielt freischalten"
    ]
  };
}

function buildChannelpointsSoundMigrationCandidatesStatus() {
  const config = getConfig();
  const rewards = Array.isArray(listRewards({ query: {} })) ? listRewards({ query: {} }) : [];
  const candidates = [];

  for (const reward of rewards) {
    const actionType = cleanString(reward.action_type || reward.actionType || '').toLowerCase();
    const mediaId = rewardMediaId(reward);
    const enabled = reward.system_enabled !== false && reward.system_enabled !== 0;
    const paused = reward.is_paused === true || reward.is_paused === 1;
    const executable = enabled && !paused && isExecutableReward(reward);
    const soundCandidate = actionType === 'sound' || actionType === 'media' || !!mediaId;
    if (!soundCandidate) continue;

    const rewardKey = cleanString(reward.reward_key || reward.rewardKey || reward.id || '');
    const title = cleanString(reward.title || rewardKey || 'Channelpoints Sound');
    const requestId = `cp_sound_candidate_${reward.id || rewardKey || 'unknown'}`;

    candidates.push({
      id: reward.id || '',
      rewardKey,
      title,
      twitchRewardId: reward.twitch_reward_id || '',
      enabled,
      paused,
      executable,
      actionType,
      actionKey: cleanString(reward.action_key || reward.actionKey || ''),
      mediaAssetId: mediaId,
      currentExecutionTarget: config.mediaExecutionTargetUrl || '/api/sound/play',
      candidateRank: executable ? 1 : 9,
      candidateStatus: executable ? 'ready_for_dry_run_preview' : 'not_ready',
      blockedReason: !enabled ? 'reward_inactive' : (paused ? 'reward_paused' : (!isExecutableReward(reward) ? 'reward_action_missing' : '')),
      proposedSoundCommandPayload: {
        command: 'sound.play.request',
        requestId,
        soundId: mediaId || rewardKey || `reward_${reward.id || 'unknown'}`,
        mediaId: mediaId || '',
        mediaAssetId: mediaId || '',
        label: `Channelpoints: ${title}`,
        category: 'channelpoints',
        target: 'stream',
        outputTarget: 'overlay',
        priority: Number(reward.priority || 60) || 60,
        queueIfBusy: true,
        requestedBy: 'channelpoints',
        source: 'channelpoints_sound_migration_candidate',
        reason: 'can24_candidate_preview_only',
        meta: {
          can: 'CAN-24.0',
          rewardId: reward.id || '',
          rewardKey,
          twitchRewardId: reward.twitch_reward_id || '',
          title,
          currentExecutionTarget: config.mediaExecutionTargetUrl || '/api/sound/play'
        }
      },
      safety: {
        dryRunExecuted: false,
        productiveExecutionChanged: false,
        soundTouched: false,
        queueTouched: false,
        twitchTouched: false,
        redemptionTouched: false
      }
    });
  }

  candidates.sort((a, b) => {
    if (a.candidateRank !== b.candidateRank) return a.candidateRank - b.candidateRank;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  const firstCandidate = candidates.find(candidate => candidate.executable) || candidates[0] || null;

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_sound_migration_candidates',
    mode: 'read_only_candidate_payload_preview',
    readOnly: true,
    rewardsTouched: false,
    redemptionsTouched: false,
    executionTouched: false,
    soundSystemTouched: false,
    queueTouched: false,
    twitchTouched: false,
    eventBusEmit: false,
    dryRunExecuted: false,
    productiveMigration: false,
    summary: {
      totalCandidates: candidates.length,
      readyCandidates: candidates.filter(candidate => candidate.executable).length,
      blockedCandidates: candidates.filter(candidate => !candidate.executable).length,
      firstCandidateRewardKey: firstCandidate ? firstCandidate.rewardKey : '',
      firstCandidateTitle: firstCandidate ? firstCandidate.title : ''
    },
    firstCandidate,
    candidates,
    routes: {
      readiness: `${ROUTE_PREFIX}/bus/request-readiness`,
      candidates: `${ROUTE_PREFIX}/bus/sound-migration-candidates`,
      soundDryRun: '/api/sound/eventbus/command/dry-run'
    },
    nextSteps: [
      'Select firstCandidate or another ready candidate manually.',
      'Validate proposedSoundCommandPayload against /api/sound/eventbus/command/dry-run in a separate explicit step.',
      'Do not change productive channelpoints execution in this CAN step.',
      'Keep /api/channelpoints/eventsub/redemption and /api/channelpoints/execute unchanged.'
    ],
    updatedAt: nowIso()
  };
}

const channelpointsSoundShadowDryRunState = {
  enabled: false,
  selectedRewardKey: '',
  lastResult: null,
  lastPreparedAt: '',
  note: 'Shadow-DryRun is diagnostic only and does not change productive execution.'
};

function buildChannelpointsSoundShadowDryRunEvaluation(result = null) {
  const dryRun = result && result.dryRun ? result.dryRun : null;
  const soundDryRun = dryRun && dryRun.soundDryRun ? dryRun.soundDryRun : null;
  const soundResult = soundDryRun && soundDryRun.result ? soundDryRun.result : {};
  const ok = !!(dryRun && dryRun.ok === true);
  const accepted = !!(dryRun && dryRun.accepted === true);
  const queueTouched = !!(
    dryRun && dryRun.queueTouched ||
    soundDryRun && soundDryRun.queueTouched ||
    soundResult && soundResult.queueTouched
  );
  const soundTouched = !!(
    dryRun && dryRun.soundSystemTouched ||
    dryRun && dryRun.soundSystemTouched === true ||
    soundDryRun && soundDryRun.soundSystemTouched ||
    soundResult && soundResult.audioTouched
  );
  const rewardExecuted = !!(dryRun && dryRun.rewardExecuted);
  const redemptionChanged = !!(dryRun && dryRun.redemptionChanged);
  const twitchTouched = !!(dryRun && dryRun.twitchTouched);
  const productiveMigration = !!(dryRun && dryRun.productiveMigration);
  const safe = ok && accepted && !queueTouched && !soundTouched && !rewardExecuted && !redemptionChanged && !twitchTouched && !productiveMigration;

  return {
    hasResult: !!result,
    ok,
    accepted,
    safe,
    queueTouched,
    soundTouched,
    rewardExecuted,
    redemptionChanged,
    twitchTouched,
    productiveMigration,
    statusCode: dryRun && dryRun.statusCode ? dryRun.statusCode : 0,
    error: dryRun && dryRun.error ? dryRun.error : (soundDryRun && soundDryRun.error ? soundDryRun.error : ''),
    candidateRewardKey: dryRun && dryRun.candidate ? (dryRun.candidate.rewardKey || '') : '',
    candidateTitle: dryRun && dryRun.candidate ? (dryRun.candidate.title || '') : '',
    checkedAt: result && result.updatedAt ? result.updatedAt : ''
  };
}

const channelpointsSoundShadowDryRunAutoState = {
  enabled: false,
  rewardKey: 'bauernweisheit',
  configuredAt: '',
  configuredBy: '',
  hookInstalled: true,
  hookMode: 'executeReward_shadow_dry_run_only',
  allowedRewardKey: 'bauernweisheit',
  attempts: 0,
  skipped: 0,
  ok: 0,
  failed: 0,
  lastAutoAt: '',
  lastSkipReason: '',
  lastAutoResult: null,
  lastPreview: null,
  note: 'CAN-24.14: Hook installed but disabled by default. Only rewardKey bauernweisheit may run a shadow dry-run.'
};

function buildChannelpointsSoundShadowDryRunAutoStatus() {
  const candidatesStatus = buildChannelpointsSoundMigrationCandidatesStatus();
  const candidates = Array.isArray(candidatesStatus.candidates) ? candidatesStatus.candidates : [];
  const selected = channelpointsSoundShadowDryRunAutoState.rewardKey
    ? candidates.find(candidate => candidate.rewardKey === channelpointsSoundShadowDryRunAutoState.rewardKey)
    : null;

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_sound_shadow_dry_run_auto_config',
    mode: 'hook_installed_disabled_by_default_exactly_one_reward',
    diagnosticOnly: true,
    enabled: channelpointsSoundShadowDryRunAutoState.enabled === true,
    rewardKey: channelpointsSoundShadowDryRunAutoState.rewardKey || '',
    selectedCandidate: selected || null,
    candidateFound: !!selected,
    configuredAt: channelpointsSoundShadowDryRunAutoState.configuredAt || '',
    configuredBy: channelpointsSoundShadowDryRunAutoState.configuredBy || '',
    lastPreview: channelpointsSoundShadowDryRunAutoState.lastPreview || null,
    attempts: Number(channelpointsSoundShadowDryRunAutoState.attempts || 0),
    skipped: Number(channelpointsSoundShadowDryRunAutoState.skipped || 0),
    okCount: Number(channelpointsSoundShadowDryRunAutoState.ok || 0),
    failedCount: Number(channelpointsSoundShadowDryRunAutoState.failed || 0),
    lastAutoAt: channelpointsSoundShadowDryRunAutoState.lastAutoAt || '',
    lastSkipReason: channelpointsSoundShadowDryRunAutoState.lastSkipReason || '',
    lastAutoResult: channelpointsSoundShadowDryRunAutoState.lastAutoResult || null,
    exactlyOneReward: channelpointsSoundShadowDryRunAutoState.rewardKey === 'bauernweisheit',
    autoHookInstalled: channelpointsSoundShadowDryRunAutoState.hookInstalled === true,
    eventSubHookInstalled: false,
    executeHookInstalled: channelpointsSoundShadowDryRunAutoState.hookInstalled === true,
    legacyFlowUnchanged: true,
    soundPlay: false,
    queueTouched: false,
    rewardExecutedViaBus: false,
    redemptionChanged: false,
    twitchTouched: false,
    productiveMigration: false,
    routes: {
      status: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-status`,
      configure: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-config`,
      shadowStatus: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/status`,
      shadowEvaluation: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/evaluation`,
      candidates: `${ROUTE_PREFIX}/bus/sound-migration-candidates`
    },
    safety: {
      defaultEnabled: false,
      onlyOneRewardAllowed: true,
      eventSubHookInstalled: false,
      executeHookInstalled: channelpointsSoundShadowDryRunAutoState.hookInstalled === true,
      noSoundPlay: true,
      noQueueMutation: true,
      noTwitchWrite: true,
      noRedemptionWrite: true,
      noProductiveMigration: true
    },
    nextSteps: [
      'Configure exactly one rewardKey only if the candidate is known.',
      'Keep enabled=false until the next explicit GO step decides otherwise.',
      'Do not hook into EventSub/Execute in this CAN step.',
      'Next step may add a guarded shadow-run hook for this one reward only.'
    ],
    updatedAt: nowIso()
  };
}

function configureChannelpointsSoundShadowDryRunAuto(input = {}) {
  const data = input && typeof input === 'object' ? input : {};
  const rewardKey = cleanString(data.rewardKey || data.reward_key || data.key || '');
  const enabled = data.enabled === true || data.enabled === 'true' || data.enabled === 1 || data.enabled === '1';
  const candidatesStatus = buildChannelpointsSoundMigrationCandidatesStatus();
  const candidates = Array.isArray(candidatesStatus.candidates) ? candidatesStatus.candidates : [];
  const selected = rewardKey ? candidates.find(candidate => candidate.rewardKey === rewardKey || String(candidate.id || '') === rewardKey) : null;

  if (!rewardKey) {
    return {
      ok: false,
      error: 'reward_key_required',
      diagnosticOnly: true,
      legacyFlowUnchanged: true,
      productiveMigration: false,
      updatedAt: nowIso()
    };
  }

  channelpointsSoundShadowDryRunAutoState.rewardKey = selected ? selected.rewardKey : rewardKey;
  channelpointsSoundShadowDryRunAutoState.enabled = enabled;
  channelpointsSoundShadowDryRunAutoState.configuredAt = nowIso();
  channelpointsSoundShadowDryRunAutoState.configuredBy = cleanString(data.configuredBy || data.requestedBy || 'manual_api');
  channelpointsSoundShadowDryRunAutoState.lastPreview = {
    requestedRewardKey: rewardKey,
    selectedCandidate: selected || null,
    enabled,
    candidateFound: !!selected,
    note: 'Configuration only. No EventSub/Execute hook installed.'
  };

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_sound_shadow_dry_run_auto_configure',
    mode: 'configure_exactly_one_reward_not_hooked',
    diagnosticOnly: true,
    status: buildChannelpointsSoundShadowDryRunAutoStatus(),
    selectedCandidate: selected || null,
    candidateFound: !!selected,
    autoHookInstalled: false,
    eventSubHookInstalled: false,
    executeHookInstalled: false,
    legacyFlowUnchanged: true,
    soundPlay: false,
    queueTouched: false,
    rewardExecutedViaBus: false,
    redemptionChanged: false,
    twitchTouched: false,
    productiveMigration: false,
    updatedAt: channelpointsSoundShadowDryRunAutoState.configuredAt
  };
}

async function maybeRunChannelpointsSoundShadowDryRunForReward(reward, context = {}) {
  const rewardKey = cleanString(reward && (reward.reward_key || reward.rewardKey) || '');
  const allowedRewardKey = 'bauernweisheit';
  const at = nowIso();

  function skip(reason) {
    channelpointsSoundShadowDryRunAutoState.skipped = Number(channelpointsSoundShadowDryRunAutoState.skipped || 0) + 1;
    channelpointsSoundShadowDryRunAutoState.lastSkipReason = reason;
    channelpointsSoundShadowDryRunAutoState.lastAutoAt = at;
    channelpointsSoundShadowDryRunAutoState.lastAutoResult = {
      ok: true,
      skipped: true,
      reason,
      rewardKey,
      allowedRewardKey,
      dryRunOnly: true,
      queueTouched: false,
      audioTouched: false,
      productiveMigration: false,
      updatedAt: at
    };
    return channelpointsSoundShadowDryRunAutoState.lastAutoResult;
  }

  if (channelpointsSoundShadowDryRunAutoState.hookInstalled !== true) return skip('hook_not_installed');
  if (channelpointsSoundShadowDryRunAutoState.enabled !== true) return skip('hook_disabled');
  if (rewardKey !== allowedRewardKey) return skip('reward_key_not_allowed');
  if (channelpointsSoundShadowDryRunAutoState.rewardKey && channelpointsSoundShadowDryRunAutoState.rewardKey !== allowedRewardKey) return skip('configured_reward_key_not_allowed');

  channelpointsSoundShadowDryRunAutoState.attempts = Number(channelpointsSoundShadowDryRunAutoState.attempts || 0) + 1;
  channelpointsSoundShadowDryRunAutoState.lastAutoAt = at;
  channelpointsSoundShadowDryRunAutoState.lastSkipReason = '';

  try {
    const dryRun = await validateChannelpointsSoundMigrationCandidateDryRun({
      rewardKey: allowedRewardKey,
      source: 'channelpoints_shadow_hook',
      reason: 'can24_14_execute_reward_shadow_dry_run',
      context: {
        userLogin: context.userLogin || '',
        userDisplayName: context.userDisplayName || '',
        twitchRedemptionId: context.twitchRedemptionId || '',
        source: context.source || ''
      }
    });
    const result = {
      ok: dryRun && dryRun.ok === true,
      skipped: false,
      accepted: dryRun && dryRun.accepted === true,
      rewardKey,
      allowedRewardKey,
      dryRun,
      dryRunOnly: true,
      queueTouched: !!(dryRun && dryRun.queueTouched),
      audioTouched: false,
      soundSystemTouched: false,
      rewardExecuted: false,
      redemptionChanged: false,
      twitchTouched: false,
      productiveMigration: false,
      updatedAt: nowIso()
    };
    if (result.ok && result.accepted) channelpointsSoundShadowDryRunAutoState.ok = Number(channelpointsSoundShadowDryRunAutoState.ok || 0) + 1;
    else channelpointsSoundShadowDryRunAutoState.failed = Number(channelpointsSoundShadowDryRunAutoState.failed || 0) + 1;
    channelpointsSoundShadowDryRunAutoState.lastAutoResult = result;
    return result;
  } catch (err) {
    const result = {
      ok: false,
      skipped: false,
      accepted: false,
      rewardKey,
      allowedRewardKey,
      error: err && err.message ? err.message : String(err),
      dryRun: err && err.data ? err.data : null,
      dryRunOnly: true,
      queueTouched: false,
      audioTouched: false,
      soundSystemTouched: false,
      rewardExecuted: false,
      redemptionChanged: false,
      twitchTouched: false,
      productiveMigration: false,
      updatedAt: nowIso()
    };
    channelpointsSoundShadowDryRunAutoState.failed = Number(channelpointsSoundShadowDryRunAutoState.failed || 0) + 1;
    channelpointsSoundShadowDryRunAutoState.lastAutoResult = result;
    return result;
  }
}


function buildChannelpointsSoundShadowDryRunStatus() {
  const candidatesStatus = buildChannelpointsSoundMigrationCandidatesStatus();
  const candidates = Array.isArray(candidatesStatus.candidates) ? candidatesStatus.candidates : [];
  const selected = channelpointsSoundShadowDryRunState.selectedRewardKey
    ? candidates.find(candidate => candidate.rewardKey === channelpointsSoundShadowDryRunState.selectedRewardKey)
    : (candidatesStatus.firstCandidate || null);

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_sound_shadow_dry_run',
    mode: 'manual_shadow_dry_run_preparation',
    readOnly: false,
    diagnosticOnly: true,
    enabled: channelpointsSoundShadowDryRunState.enabled === true,
    selectedRewardKey: channelpointsSoundShadowDryRunState.selectedRewardKey || (selected ? selected.rewardKey : ''),
    selectedCandidate: selected || null,
    lastResult: channelpointsSoundShadowDryRunState.lastResult || null,
    lastPreparedAt: channelpointsSoundShadowDryRunState.lastPreparedAt || '',
    evaluation: buildChannelpointsSoundShadowDryRunEvaluation(channelpointsSoundShadowDryRunState.lastResult || null),
    rewardsTouched: false,
    redemptionsTouched: false,
    executionTouched: false,
    soundSystemTouched: false,
    queueTouched: false,
    twitchTouched: false,
    eventBusEmit: false,
    productiveMigration: false,
    legacyFlowUnchanged: true,
    safety: {
      soundPlay: false,
      queueMutation: false,
      rewardExecutionViaBus: false,
      redemptionChange: false,
      twitchWrite: false,
      automaticHookIntoEventSub: false
    },
    routes: {
      status: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/status`,
      prepare: `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/prepare`,
      dryRunCandidate: `${ROUTE_PREFIX}/bus/sound-migration-candidates/dry-run`,
      candidates: `${ROUTE_PREFIX}/bus/sound-migration-candidates`
    },
    nextSteps: [
      'Use prepare manually for one selected rewardKey.',
      'Inspect lastResult and Sound-DryRun result before any productive change.',
      'Do not hook into EventSub automatically in this step.',
      'Keep legacy execution unchanged.'
    ],
    updatedAt: nowIso()
  };
}

async function prepareChannelpointsSoundShadowDryRun(input = {}) {
  const data = input && typeof input === 'object' ? input : {};
  const result = await validateChannelpointsSoundMigrationCandidateDryRun(data);
  const candidate = result && result.candidate ? result.candidate : null;
  channelpointsSoundShadowDryRunState.enabled = true;
  channelpointsSoundShadowDryRunState.selectedRewardKey = candidate ? (candidate.rewardKey || '') : cleanString(data.rewardKey || '');
  channelpointsSoundShadowDryRunState.lastResult = result;
  channelpointsSoundShadowDryRunState.lastPreparedAt = nowIso();

  return {
    ok: result.ok === true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_sound_shadow_dry_run_prepare',
    mode: 'manual_shadow_dry_run_prepare',
    diagnosticOnly: true,
    shadowEnabled: channelpointsSoundShadowDryRunState.enabled === true,
    selectedRewardKey: channelpointsSoundShadowDryRunState.selectedRewardKey,
    dryRun: result,
    rewardsTouched: false,
    redemptionsTouched: false,
    executionTouched: false,
    soundSystemTouched: false,
    queueTouched: false,
    twitchTouched: false,
    eventBusEmit: false,
    productiveMigration: false,
    legacyFlowUnchanged: true,
    updatedAt: channelpointsSoundShadowDryRunState.lastPreparedAt
  };
}

async function validateChannelpointsSoundMigrationCandidateDryRun(input = {}) {
  const data = input && typeof input === 'object' ? input : {};
  const candidatesStatus = buildChannelpointsSoundMigrationCandidatesStatus();
  const candidates = Array.isArray(candidatesStatus.candidates) ? candidatesStatus.candidates : [];
  const requested = cleanString(data.rewardKey || data.id || data.rewardId || data.candidate || '');
  const selected = requested
    ? candidates.find(candidate => String(candidate.rewardKey || '') === requested || String(candidate.id || '') === requested)
    : (candidatesStatus.firstCandidate || null);

  if (!selected) {
    return {
      ok: false,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      feature: 'channelpoints_sound_migration_candidate_dry_run',
      mode: 'sound_dry_run_proxy',
      dryRunOnly: true,
      accepted: false,
      error: 'candidate_not_found',
      soundSystemTouched: false,
      queueTouched: false,
      rewardExecuted: false,
      redemptionChanged: false,
      twitchTouched: false,
      eventBusEmit: false,
      updatedAt: nowIso()
    };
  }

  const payload = {
    ...(selected.proposedSoundCommandPayload || {}),
    ...(data.payload && typeof data.payload === 'object' ? data.payload : {}),
    meta: {
      ...((selected.proposedSoundCommandPayload || {}).meta || {}),
      ...((data.payload && data.payload.meta && typeof data.payload.meta === 'object') ? data.payload.meta : {}),
      can: 'CAN-24.1',
      dryRunProxy: 'channelpoints'
    }
  };

  try {
    const targetUrl = cleanString(data.soundDryRunUrl || '/api/sound/eventbus/command/dry-run');
    const response = await httpJsonRequest('POST', targetUrl, payload);
    const dryRun = response && response.data ? response.data : {};
    return {
      ok: !!(dryRun && dryRun.ok),
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      feature: 'channelpoints_sound_migration_candidate_dry_run',
      mode: 'sound_dry_run_proxy',
      dryRunOnly: true,
      accepted: !!(dryRun && dryRun.accepted),
      candidate: selected,
      payload,
      soundDryRun: dryRun,
      statusCode: response.statusCode,
      soundSystemDryRunTouched: true,
      soundSystemTouched: false,
      queueTouched: false,
      rewardExecuted: false,
      redemptionChanged: false,
      twitchTouched: false,
      eventBusEmit: false,
      productiveMigration: false,
      routes: {
        candidates: `${ROUTE_PREFIX}/bus/sound-migration-candidates`,
        dryRunCandidate: `${ROUTE_PREFIX}/bus/sound-migration-candidates/dry-run`,
        soundDryRun: targetUrl
      },
      updatedAt: nowIso()
    };
  } catch (err) {
    return {
      ok: false,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      feature: 'channelpoints_sound_migration_candidate_dry_run',
      mode: 'sound_dry_run_proxy',
      dryRunOnly: true,
      accepted: false,
      candidate: selected,
      payload,
      error: err && err.message ? err.message : String(err),
      soundDryRun: err && err.data ? err.data : null,
      statusCode: err && err.statusCode ? err.statusCode : 500,
      soundSystemDryRunTouched: true,
      soundSystemTouched: false,
      queueTouched: false,
      rewardExecuted: false,
      redemptionChanged: false,
      twitchTouched: false,
      eventBusEmit: false,
      productiveMigration: false,
      updatedAt: nowIso()
    };
  }
}

function buildChannelpointsBusRequestReadinessStatus() {
  const rewards = Array.isArray(listRewards({ query: {} })) ? listRewards({ query: {} }) : [];
  const bus = buildBusStatus();
  const config = getConfig();
  const counts = {
    total: rewards.length,
    executable: 0,
    soundCandidates: 0,
    alertCandidates: 0,
    otherCandidates: 0,
    inactive: 0,
    paused: 0,
    missingAction: 0
  };

  const rows = rewards.map(reward => {
    const actionType = cleanString(reward.action_type || reward.actionType || '').toLowerCase();
    const actionKey = cleanString(reward.action_key || reward.actionKey || '');
    const enabled = reward.system_enabled !== false && reward.system_enabled !== 0;
    const paused = reward.is_paused === true || reward.is_paused === 1;
    const executable = enabled && !paused && isExecutableReward(reward);
    const soundCandidate = actionType === 'sound' || actionType === 'media' || !!rewardMediaId(reward);
    const alertCandidate = actionType === 'alert' || actionType === 'overlay' || actionType === 'message';

    if (executable) counts.executable += 1;
    if (!enabled) counts.inactive += 1;
    if (paused) counts.paused += 1;
    if (!isExecutableReward(reward)) counts.missingAction += 1;
    if (soundCandidate) counts.soundCandidates += 1;
    else if (alertCandidate) counts.alertCandidates += 1;
    else counts.otherCandidates += 1;

    return {
      id: reward.id || '',
      rewardKey: reward.reward_key || reward.rewardKey || '',
      title: reward.title || '',
      twitchRewardId: reward.twitch_reward_id || '',
      enabled,
      paused,
      executable,
      actionType,
      actionKey,
      mediaAssetId: rewardMediaId(reward),
      soundCandidate,
      alertCandidate,
      currentExecutionTarget: soundCandidate ? (config.mediaExecutionTargetUrl || '/api/sound/play') : '',
      plannedBusCommand: soundCandidate ? 'sound.play.request' : (alertCandidate ? 'alert.request' : ''),
      migrationStatus: executable && (soundCandidate || alertCandidate) ? 'candidate' : 'not_ready',
      reason: !enabled ? 'reward_inactive' : (paused ? 'reward_paused' : (!isExecutableReward(reward) ? 'reward_action_missing' : 'ready'))
    };
  });

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: 'channelpoints_bus_request_readiness',
    mode: 'read_only_bus_request_readiness',
    readOnly: true,
    rewardsTouched: false,
    redemptionsTouched: false,
    executionTouched: false,
    soundSystemTouched: false,
    alertTouched: false,
    twitchTouched: false,
    eventBusEmit: false,
    recoveryTriggered: false,
    summary: counts,
    rewards: rows,
    bus,
    currentFlow: {
      eventSubRedemptionStatus: `${ROUTE_PREFIX}/eventsub/redemption/status`,
      eventSubRedemptionPreview: `${ROUTE_PREFIX}/eventsub/redemption/preview`,
      directExecute: `${ROUTE_PREFIX}/execute`,
      rewardExecute: `${ROUTE_PREFIX}/rewards/:idOrKey/execute`,
      currentMediaExecutionTarget: config.mediaExecutionTargetUrl || '/api/sound/play'
    },
    plannedFlow: {
      soundCommand: 'sound.play.request',
      alertCommand: 'alert.request',
      migrateOneRewardAtATime: true,
      keepLegacyExecutionUntilAccepted: true,
      requireDryRunFirst: true
    },
    safety: {
      statusRouteTouchesRewards: false,
      statusRouteTouchesRedemptions: false,
      statusRouteExecutesRewards: false,
      statusRouteTouchesTwitch: false,
      statusRouteEmitsBus: false,
      productiveExecutionUnchanged: true
    },
    nextSteps: [
      'Use this status to pick one sound reward as first migration candidate.',
      'Validate the chosen reward against sound dry-run before changing productive execution.',
      'Keep EventSub redemption handling unchanged until one candidate is accepted.',
      'Do not fulfill/cancel Twitch redemptions from this diagnostic route.'
    ],
    updatedAt: nowIso()
  };
}

function buildStatus(extra = {}) {
  const config = getConfig();
  let counts = { rewards: 0, categories: 0, redemptions: 0 };
  try {
    ensureDbReady();
    counts = {
      rewards: tableExists("channelpoints_rewards") ? tableCount("channelpoints_rewards") : 0,
      categories: tableExists("channelpoints_categories") ? tableCount("channelpoints_categories") : 0,
      redemptions: tableExists("channelpoints_redemptions") ? tableCount("channelpoints_redemptions") : 0
    };
  } catch (_) {}
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    routePrefix: ROUTE_PREFIX,
    enabled: config.enabled !== false,
    mode: "backend_local_reward_crud_media_text_execution",
    moduleBuild: MODULE_BUILD,
    model: {
      version: "0.4.0",
      schemaPreviewVersion: "0.3.0",
      schemaTargetVersion: SCHEMA_TARGET_VERSION,
      dbMigrationState,
      dbMigrationEnabled: config.dbMigrationEnabled !== false,
      schemaPreviewEnabled: config.schemaPreviewEnabled !== false,
      migrationExecutionEnabled: config.migrationExecutionEnabled !== false,
      localCrudEnabled: config.localCrudEnabled !== false,
      importedRewardActionGuardEnabled: config.importedRewardActionGuardEnabled !== false,
      twitchRedemptionCompletionEnabled: config.twitchRedemptionCompletionEnabled !== false,
      mediaExecutionBridgeEnabled: config.mediaExecutionBridgeEnabled !== false,
      tableCountPlanned: TABLES.length,
      rewardFieldCount: TABLES[1].fields.length,
      categoryFieldCount: TABLES[0].fields.length,
      redemptionFieldCount: TABLES[2].fields.length,
      actionTypeCount: ACTION_TYPES.length,
      defaultCategoryCount: DEFAULT_CATEGORIES.length
    },
    media: {
      integrationPlanned: true,
      executionBridgeImplemented: true,
      usesExistingMediaSystem: true,
      module: "media",
      uploadUi: "existing_dashboard_media_upload_mask",
      pickerComponent: "htdocs/dashboard/components/media_picker.js",
      executionBridge: { enabled: config.mediaExecutionBridgeEnabled !== false, target: config.mediaExecutionTargetUrl || "/api/sound/play", payloadRule: "mediaId_to_sound_system_payload" }
    },
    config: {
      busEnabled: config.busEnabled !== false,
      busSelfTestEnabled: config.busSelfTestEnabled !== false,
      twitchRewardManagementEnabled: config.twitchRewardManagementEnabled === true,
      twitchRewardSyncEnabled: config.twitchRewardSyncEnabled === true,
      dashboardEnabled: config.dashboardEnabled === true,
      dbMigrationEnabled: config.dbMigrationEnabled !== false,
      schemaPreviewEnabled: config.schemaPreviewEnabled !== false,
      migrationExecutionEnabled: config.migrationExecutionEnabled !== false,
      localCrudEnabled: config.localCrudEnabled !== false,
      importedRewardActionGuardEnabled: config.importedRewardActionGuardEnabled !== false,
      twitchRedemptionCompletionEnabled: config.twitchRedemptionCompletionEnabled !== false
    },
    twitch: {
      ...buildTwitchSyncStatus().readiness,
      counts: buildTwitchSyncStatus().counts,
      requiredScopes: buildTwitchSyncStatus().requiredScopes,
      note: "Readiness-only: lokale Rewards/Einlösungen sind vorbereitet, Twitch-Schreibzugriffe bleiben deaktiviert."
    },
    localState: {
      rewardCount: counts.rewards,
      categoryCount: counts.categories,
      redemptionCount: counts.redemptions,
      queueSize: 0,
      crudStats: { ...localCrudStats },
      executionStats: { ...executionStats },
      redemptionEventSubStats: { ...redemptionEventSubStats },
      lastBusTestAt,
      lastBusEvent,
      lastError
    },
    bus: buildBusStatus(),
    routes: [
      `${ROUTE_PREFIX}/status`,
      `${ROUTE_PREFIX}/bus/request-readiness`,
      `${ROUTE_PREFIX}/bus/sound-migration-candidates`,
      `${ROUTE_PREFIX}/bus/sound-migration-candidates/dry-run`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/status`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/evaluation`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-status`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-test`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-config`,
      `${ROUTE_PREFIX}/bus/sound-shadow-dry-run/prepare`,
      `${ROUTE_PREFIX}/model`,
      `${ROUTE_PREFIX}/media-plan`,
      `${ROUTE_PREFIX}/schema-preview`,
      `${ROUTE_PREFIX}/db-status`,
      `${ROUTE_PREFIX}/categories`,
      `${ROUTE_PREFIX}/rewards`,
      `${ROUTE_PREFIX}/redemptions`,
      `${ROUTE_PREFIX}/redemptions/test`,
      `${ROUTE_PREFIX}/eventsub/redemption/status`,
      `${ROUTE_PREFIX}/eventsub/redemption/preview`,
      `${ROUTE_PREFIX}/eventsub/redemption`,
      `${ROUTE_PREFIX}/text-execution-check`,
      `${ROUTE_PREFIX}/twitch-status`,
      `${ROUTE_PREFIX}/twitch/readiness`,
      `${ROUTE_PREFIX}/twitch/auth-check`,
      `${ROUTE_PREFIX}/twitch/manage/status`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/push`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/enable`,
      `${ROUTE_PREFIX}/twitch/rewards/:idOrKey/disable`,
      `${ROUTE_PREFIX}/rewards/:idOrKey`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/enable`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/disable`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/delete`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/execution-check`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/execute`,
      `${ROUTE_PREFIX}/execute`,
      `${ROUTE_PREFIX}/bus-events`,
      `${ROUTE_PREFIX}/bus-test`
    ],
    ...extra
  };
}

function publishStatus(reason = "status") {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.publishModuleStatus !== "function") return { ok: false, reason: "bus_publishModuleStatus_unavailable" };
  let counts = { rewards: 0, redemptions: 0, categories: 0 };
  try {
    counts = {
      rewards: tableExists("channelpoints_rewards") ? tableCount("channelpoints_rewards") : 0,
      redemptions: tableExists("channelpoints_redemptions") ? tableCount("channelpoints_redemptions") : 0,
      categories: tableExists("channelpoints_categories") ? tableCount("channelpoints_categories") : 0
    };
  } catch (_) {}
  const payload = {
    module: MODULE_NAME,
    version: MODULE_VERSION,
    build: MODULE_BUILD,
    enabled: config.enabled !== false,
    health: lastError ? "warn" : "ok",
    status: "online",
    reason,
    routePrefix: ROUTE_PREFIX,
    rewardCount: counts.rewards,
    redemptionCount: counts.redemptions,
    categoryCount: counts.categories,
    queueSize: 0,
    executionStats: { ...executionStats },
    emittedDomainEvents,
    lastDomainEventAt,
    localCrudEnabled: config.localCrudEnabled !== false,
    lastError,
    timestamp: nowIso()
  };
  const result = currentBus.publishModuleStatus(MODULE_NAME, payload, { action: "updated", replayable: true, requireAck: false });
  lastBusStatusAt = nowIso();
  return result;
}

function rememberBusEvent(event, accepted = false) {
  receivedBusEvents += 1;
  lastBusEventAt = nowIso();
  lastBusEvent = {
    id: cleanString(event && (event.id || event.eventId)),
    channel: cleanString(event && event.channel),
    action: cleanString(event && event.action),
    source: event && event.source ? event.source : null,
    accepted,
    payload: event && event.payload ? event.payload : {}
  };
}

function registerSelfTestBusSubscription(currentBus) {
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  if (subscriptionIds.includes("channelpoints:self-test")) return { ok: true, reason: "already_registered" };
  const result = currentBus.subscribe({
    id: "channelpoints:self-test",
    module: MODULE_NAME,
    channel: "channelpoints.test",
    action: "ping",
    capability: "channelpoints.test.ping",
    meta: { purpose: "channelpoints bus receive smoke test" }
  }, event => {
    rememberBusEvent(event, true);
    return { ok: true, module: MODULE_NAME, receivedAt: lastBusEventAt };
  });
  if (result && result.ok === true) subscriptionIds.push("channelpoints:self-test");
  return result;
}

function registerRedemptionBusSubscription(currentBus) {
  const config = getConfig();
  if (config.redemptionEventBusReceiveEnabled === false) return { ok: false, reason: "redemption_eventbus_receive_disabled" };
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  if (subscriptionIds.includes("channelpoints:redemption:received")) return { ok: true, reason: "already_registered" };

  const result = currentBus.subscribe({
    id: "channelpoints:redemption:received",
    module: MODULE_NAME,
    channel: "channelpoints.redemption",
    action: "received",
    sourceModule: "twitch_eventsub",
    capability: "channelpoints.redemption.received",
    meta: { purpose: "Twitch EventSub Redemption via Communication Bus" }
  }, event => {
    rememberBusEvent(event, true);
    redemptionEventSubStats.receivedFromBus += 1;
    redemptionEventSubStats.acceptedFromBus += 1;
    redemptionEventSubStats.lastBusRedemptionEventAt = nowIso();
    redemptionEventSubStats.lastBusRedemptionEventId = cleanString(event && (event.id || event.eventId));

    const payload = event && event.payload && typeof event.payload === "object" ? event.payload : {};
    Promise.resolve()
      .then(() => receiveRedemptionEventSubPayload(payload))
      .then(result => {
        emitDomainEvent("channelpoints.redemption.bus_processed", {
          busEventId: cleanString(event && (event.id || event.eventId)),
          result
        }, { channel: "channelpoints.redemption" });
      })
      .catch(err => {
        const message = err && err.message ? err.message : String(err);
        redemptionEventSubStats.failed += 1;
        redemptionEventSubStats.lastError = message;
        lastError = message;
        emitDomainEvent("channelpoints.redemption.bus_failed", {
          busEventId: cleanString(event && (event.id || event.eventId)),
          error: message
        }, { channel: "channelpoints.redemption" });
      });

    return { ok: true, module: MODULE_NAME, accepted: true, asyncProcessing: true, receivedAt: lastBusEventAt };
  });

  if (result && result.ok === true) subscriptionIds.push("channelpoints:redemption:received");
  return result;
}

function registerBusSubscription() {
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  const selfTest = registerSelfTestBusSubscription(currentBus);
  const redemption = registerRedemptionBusSubscription(currentBus);
  return { ok: (selfTest && selfTest.ok === true) || (redemption && redemption.ok === true), selfTest, redemption };
}

function heartbeatBus(reason = "heartbeat") {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.heartbeatModule !== "function") return { ok: false, reason: "bus_heartbeatModule_unavailable" };
  const result = currentBus.heartbeatModule(MODULE_NAME, {
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    version: MODULE_VERSION,
    status: "online",
    health: lastError ? "warn" : "ok",
    reason,
    capabilities: ["module.lifecycle", "module.status", "channelpoints.status", "channelpoints.schema", "channelpoints.local_crud", "channelpoints.media_execution", "channelpoints.redemption", "channelpoints.eventsub_redemption", "channelpoints.redemption.received", "channelpoints.domain_events", "channelpoints.test.ping"]
  });
  lastBusHeartbeatAt = nowIso();
  return result;
}

function registerAtCommunicationBus() {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.registerModule !== "function") return { ok: false, reason: "bus_registerModule_unavailable" };
  const registerResult = currentBus.registerModule({
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    name: "Kanalpunkte-System",
    version: MODULE_VERSION,
    capabilities: ["module.lifecycle", "module.status", "channelpoints.status", "channelpoints.schema", "channelpoints.local_crud", "channelpoints.media_execution", "channelpoints.redemption", "channelpoints.eventsub_redemption", "channelpoints.redemption.received", "channelpoints.domain_events", "channelpoints.test.ping"],
    meta: { routePrefix: ROUTE_PREFIX, localCrud: true, twitchWritesEnabled: false, mediaSystem: "existing_media_module", mediaExecutionBridge: "/api/sound/play", domainEvents: true, redemptionEventBus: true }
  });
  registeredAtBus = registerResult && registerResult.ok === true;
  lastBusRegisterAt = registeredAtBus ? nowIso() : lastBusRegisterAt;
  const subscriptionResult = registerBusSubscription();
  const heartbeatResult = heartbeatBus("register");
  const statusResult = publishStatus("register");
  return { ok: registeredAtBus, registerResult, subscriptionResult, heartbeatResult, statusResult };
}

function emitBusSelfTest(req) {
  const config = getConfig();
  if (config.busSelfTestEnabled === false) return { ok: false, reason: "bus_self_test_disabled" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_emit_unavailable" };
  const message = cleanString(req.query.message, "channelpoints bus self test");
  const replayable = boolValue(req.query.replayable, true);
  const requireAck = boolValue(req.query.requireAck, false);
  const ttlMs = Math.max(1000, Number.parseInt(String(req.query.ttlMs || "15000"), 10) || 15000);
  lastBusTestAt = nowIso();
  const result = currentBus.emit({
    type: "event",
    channel: "channelpoints.test",
    action: "ping",
    source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
    target: { type: "all", id: "*" },
    payload: { test: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, message, emittedAt: lastBusTestAt },
    meta: { requireAck, replayable, ttlMs, productionTarget: false }
  });
  publishStatus("bus_self_test");
  return result;
}

function sendError(res, statusCode, error, extra = {}) {
  lastError = error && error.message ? error.message : String(error);
  const details = error && error.details ? { details: error.details } : {};
  res.status(statusCode).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: lastError, ...details, ...extra });
}

function init({ app }) {
  if (!app) throw new Error("channelpoints.init: app fehlt.");
  loadConfig();
  try { migrateDatabase("init"); } catch (err) { lastError = err && err.message ? err.message : String(err); }
  try { registerAtCommunicationBus(); } catch (err) { lastError = err && err.message ? err.message : String(err); }

  app.get(`${ROUTE_PREFIX}/status`, (req, res) => {
    try { heartbeatBus("status_route"); publishStatus("status_route"); res.json(buildStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/request-readiness`, (req, res) => {
    try { res.json(buildChannelpointsBusRequestReadinessStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-migration-candidates`, (req, res) => {
    try { res.json(buildChannelpointsSoundMigrationCandidatesStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-migration-candidates/dry-run`, async (req, res) => {
    try {
      const result = await validateChannelpointsSoundMigrationCandidateDryRun(req.query || {});
      res.status(result.ok ? 200 : (result.error === 'candidate_not_found' ? 404 : 400)).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.post(`${ROUTE_PREFIX}/bus/sound-migration-candidates/dry-run`, async (req, res) => {
    try {
      const result = await validateChannelpointsSoundMigrationCandidateDryRun(req.body || {});
      res.status(result.ok ? 200 : (result.error === 'candidate_not_found' ? 404 : 400)).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/status`, (req, res) => {
    try { res.json(buildChannelpointsSoundShadowDryRunStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/evaluation`, (req, res) => {
    try {
      const status = buildChannelpointsSoundShadowDryRunStatus();
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        feature: 'channelpoints_sound_shadow_dry_run_evaluation',
        mode: 'read_only_shadow_dry_run_evaluation',
        readOnly: true,
        evaluation: status.evaluation,
        selectedRewardKey: status.selectedRewardKey,
        selectedCandidate: status.selectedCandidate,
        lastResult: status.lastResult,
        safety: status.safety,
        routes: status.routes,
        updatedAt: nowIso()
      });
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-status`, (req, res) => {
    try { res.json(buildChannelpointsSoundShadowDryRunAutoStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.post(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-test`, async (req, res) => {
    try {
      const rewardKey = cleanString((req.body && (req.body.rewardKey || req.body.reward_key)) || req.query.rewardKey || req.query.reward_key || 'bauernweisheit');
      const reward = getRewardByIdOrKey(rewardKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: 'reward_not_found', rewardKey });
      const result = await maybeRunChannelpointsSoundShadowDryRunForReward(reward, { ...(req.body || {}), source: 'manual_shadow_auto_test' });
      res.status(result && result.ok === false ? 400 : 200).json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, feature: 'channelpoints_sound_shadow_auto_test', result, status: buildChannelpointsSoundShadowDryRunAutoStatus() });
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-test`, async (req, res) => {
    try {
      const rewardKey = cleanString(req.query.rewardKey || req.query.reward_key || 'bauernweisheit');
      const reward = getRewardByIdOrKey(rewardKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: 'reward_not_found', rewardKey });
      const result = await maybeRunChannelpointsSoundShadowDryRunForReward(reward, { source: 'manual_shadow_auto_test' });
      res.status(result && result.ok === false ? 400 : 200).json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, feature: 'channelpoints_sound_shadow_auto_test', result, status: buildChannelpointsSoundShadowDryRunAutoStatus() });
    } catch (err) { sendError(res, 500, err); }
  });
  app.post(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-config`, (req, res) => {
    try {
      const result = configureChannelpointsSoundShadowDryRunAuto(req.body || {});
      res.status(result.ok ? 200 : 400).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/auto-config`, (req, res) => {
    try {
      const result = configureChannelpointsSoundShadowDryRunAuto(req.query || {});
      res.status(result.ok ? 200 : 400).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.post(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/prepare`, async (req, res) => {
    try {
      const result = await prepareChannelpointsSoundShadowDryRun(req.body || {});
      res.status(result.ok ? 200 : 400).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/bus/sound-shadow-dry-run/prepare`, async (req, res) => {
    try {
      const result = await prepareChannelpointsSoundShadowDryRun(req.query || {});
      res.status(result.ok ? 200 : 400).json(result);
    } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/model`, (req, res) => { try { res.json(buildModel()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/media-plan`, (req, res) => { try { res.json(buildMediaPlan()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/schema-preview`, (req, res) => { try { res.json(buildSchemaPreview()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/db-status`, (req, res) => { try { res.json(getDbStatus()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/twitch-status`, (req, res) => { try { const status = buildTwitchSyncStatus(); emitDomainEvent("channelpoints.twitch.readiness", { readiness: status }, { channel: "channelpoints.twitch" }); res.json(status); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/twitch/readiness`, (req, res) => { try { const status = buildTwitchSyncStatus(); emitDomainEvent("channelpoints.twitch.readiness", { readiness: status }, { channel: "channelpoints.twitch" }); res.json(status); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/twitch/auth-check`, async (req, res) => {
    try {
      const status = await buildTwitchAuthScopeStatus();
      emitDomainEvent("channelpoints.twitch.auth_scope_check", { authScope: status }, { channel: "channelpoints.twitch" });
      res.json(status);
    } catch (err) { sendError(res, 500, err); }
  });


  app.get(`${ROUTE_PREFIX}/twitch/manage/status`, (req, res) => {
    try { res.json(buildTwitchRewardManagementStatus()); } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/rewards/:idOrKey/push`, async (req, res) => {
    try { res.json(await pushRewardToTwitch(req.params.idOrKey, req.body || {}, req)); } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/rewards/:idOrKey/enable`, async (req, res) => {
    try { res.json(await activateRewardSystemAndTwitch(req.params.idOrKey, req.body || {}, req)); }
    catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/rewards/:idOrKey/disable`, async (req, res) => {
    try { res.json(await deactivateRewardSystemAndTwitch(req.params.idOrKey, req.body || {}, req)); }
    catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.delete(`${ROUTE_PREFIX}/twitch/rewards/:idOrKey`, async (req, res) => {
    try { res.json(await deleteRewardFromTwitch(req.params.idOrKey, req.body || {}, req)); } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/rewards/:idOrKey/delete`, async (req, res) => {
    try { res.json(await deleteRewardFromTwitch(req.params.idOrKey, req.body || {}, req)); } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.get(`${ROUTE_PREFIX}/categories`, (req, res) => {
    try { res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, categories: listCategories(req) }); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/rewards`, (req, res) => {
    try { res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, rewards: listRewards(req), localCrudStats: { ...localCrudStats } }); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/redemptions`, (req, res) => {
    try { res.json(buildRedemptionsStatus(req)); } catch (err) { sendError(res, 500, err); }
  });


  app.get(`${ROUTE_PREFIX}/eventsub/redemption/status`, (req, res) => {
    try { res.json(buildRedemptionEventSubStatus()); } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/eventsub/redemption/preview`, (req, res) => {
    try { res.json(previewRedemptionEventSubPayload(req.body || {})); } catch (err) { sendError(res, 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/eventsub/redemption`, async (req, res) => {
    try { res.json(await receiveRedemptionEventSubPayload(req.body || {})); } catch (err) { sendError(res, 400, err); }
  });

  app.get(`${ROUTE_PREFIX}/rewards/:idOrKey`, (req, res) => {
    try {
      const reward = getRewardByIdOrKey(req.params.idOrKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, reward });
    } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards`, async (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "local_crud_disabled" });
      const reward = createReward({ ...(req.body || {}), system_enabled: true });
      const sync = await syncSavedRewardToTwitch(reward, req.body || {}, req, "created");
      const current = sync && sync.reward ? sync.reward : reward;
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "created_and_synced_to_twitch", reward: current, twitchWrite: sync.twitchWrite === true, twitchSync: sync });
    } catch (err) { sendError(res, 400, err); }
  });

  app.put(`${ROUTE_PREFIX}/rewards/:idOrKey`, async (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "local_crud_disabled" });
      const reward = updateReward(req.params.idOrKey, { ...(req.body || {}), system_enabled: true });
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      const sync = await syncSavedRewardToTwitch(reward, req.body || {}, req, "updated");
      const current = sync && sync.reward ? sync.reward : reward;
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "updated_and_synced_to_twitch", reward: current, twitchWrite: sync.twitchWrite === true, twitchSync: sync });
    } catch (err) { sendError(res, 400, err); }
  });

  app.patch(`${ROUTE_PREFIX}/rewards/:idOrKey`, async (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "local_crud_disabled" });
      const reward = updateReward(req.params.idOrKey, { ...(req.body || {}), system_enabled: true });
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      const sync = await syncSavedRewardToTwitch(reward, req.body || {}, req, "patched");
      const current = sync && sync.reward ? sync.reward : reward;
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "patched_and_synced_to_twitch", reward: current, twitchWrite: sync.twitchWrite === true, twitchSync: sync });
    } catch (err) { sendError(res, 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/disable`, async (req, res) => {
    try { res.json(await deactivateRewardSystemAndTwitch(req.params.idOrKey, req.body || {}, req)); }
    catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/enable`, async (req, res) => {
    try { res.json(await activateRewardSystemAndTwitch(req.params.idOrKey, req.body || {}, req)); }
    catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });


  function handleDeleteRewardRoute(req, res) {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "local_crud_disabled" });
      const result = deleteReward(req.params.idOrKey);
      if (!result || !result.deleted) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, action: "deleted_local_only", deleted: result.deleted, reward: result.reward, twitchWrite: false });
    } catch (err) { sendError(res, 400, err); }
  }

  app.delete(`${ROUTE_PREFIX}/rewards/:idOrKey`, handleDeleteRewardRoute);
  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/delete`, handleDeleteRewardRoute);


  app.get(`${ROUTE_PREFIX}/rewards/:idOrKey/execution-check`, (req, res) => {
    try {
      const reward = getRewardByIdOrKey(req.params.idOrKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      res.json(buildExecutionCheck(reward, req.query || {}));
    } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/media-execution-check`, (req, res) => {
    try {
      const idOrKey = cleanString(req.query.reward || req.query.reward_key || req.query.id || "");
      const reward = getRewardByIdOrKey(idOrKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      res.json(buildExecutionCheck(reward, req.query || {}));
    } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/text-execution-check`, (req, res) => {
    try {
      const idOrKey = cleanString(req.query.reward || req.query.reward_key || req.query.id || "");
      const reward = getRewardByIdOrKey(idOrKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: "reward_not_found" });
      res.json(buildExecutionCheck(reward, req.query || {}));
    } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/execute`, async (req, res) => {
    try {
      const result = await executeReward(req.params.idOrKey, req.body || {});
      res.json(result);
    } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.get(`${ROUTE_PREFIX}/execute`, async (req, res) => {
    try {
      const idOrKey = cleanString(req.query.reward || req.query.reward_key || req.query.id || "");
      const result = await executeReward(idOrKey, req.query || {});
      res.json(result);
    } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/execute`, async (req, res) => {
    try {
      const idOrKey = cleanString(req.body && (req.body.reward || req.body.reward_key || req.body.id) || req.query.reward || "");
      const result = await executeReward(idOrKey, req.body || {});
      res.json(result);
    } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/redemptions/test`, async (req, res) => {
    try {
      const body = req.body || {};
      const idOrKey = cleanString(body.reward || body.reward_key || body.id || req.query.reward || "");
      const result = await executeReward(idOrKey, {
        ...body,
        userLogin: cleanString(body.userLogin || body.user || "dashboard"),
        userDisplayName: cleanString(body.userDisplayName || body.displayName || "Dashboard"),
        userInput: cleanString(body.userInput || body.input || ""),
        redemptionId: cleanString(body.redemptionId || `dashboard_test_${Date.now()}`)
      });
      res.json({ ...result, action: "test_redemption_executed" });
    } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.get(`${ROUTE_PREFIX}/redemptions/test`, async (req, res) => {
    try {
      const idOrKey = cleanString(req.query.reward || req.query.reward_key || req.query.id || "");
      const result = await executeReward(idOrKey, {
        ...req.query,
        userLogin: cleanString(req.query.userLogin || req.query.user || "dashboard"),
        userDisplayName: cleanString(req.query.userDisplayName || req.query.displayName || "Dashboard"),
        userInput: cleanString(req.query.userInput || req.query.input || ""),
        redemptionId: cleanString(req.query.redemptionId || `dashboard_test_${Date.now()}`)
      });
      res.json({ ...result, action: "test_redemption_executed" });
    } catch (err) { sendError(res, err && err.message === "reward_not_found" ? 404 : 400, err); }
  });

  app.get(`${ROUTE_PREFIX}/bus-events`, (req, res) => {
    try { res.json(buildBusEventSpec()); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/bus-test`, (req, res) => {
    try { const result = emitBusSelfTest(req); res.json(buildStatus({ busTest: true, result })); } catch (err) {
      const currentBus = getBus();
      if (currentBus && typeof currentBus.trackIssue === "function") currentBus.trackIssue("channelpoints_bus_test_failed", "Channelpoints bus self-test failed", { level: "error", details: { error: err && err.message ? err.message : String(err) } });
      sendError(res, 500, err, { busTest: true });
    }
  });

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} API routes registered (${ROUTE_PREFIX})`);
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, buildStatus, buildModel, buildMediaPlan, buildSchemaPreview, getDbStatus, buildExecutionCheck, executeReward, listRedemptions, buildRedemptionsStatus, buildRedemptionEventSubStatus, previewRedemptionEventSubPayload, receiveRedemptionEventSubPayload, buildBusEventSpec, buildTwitchAuthScopeStatus, buildTwitchRewardManagementStatus, pushRewardToTwitch, deleteRewardFromTwitch, activateRewardSystemAndTwitch, deactivateRewardSystemAndTwitch, registerAtCommunicationBus, registerBusSubscription, heartbeatBus, publishStatus, isImportedRewardMissingAction };
