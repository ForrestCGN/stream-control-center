"use strict";

const http = require("http");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "channelpoints";
const MODULE_VERSION = "0.6.0";
const MODULE_BUILD = "media-execution-bridge";
const ROUTE_PREFIX = "/api/channelpoints";
const SCHEMA_TARGET_VERSION = 1;
const DEFAULT_TARGET_HOST = "127.0.0.1";
const DEFAULT_TARGET_PORT = 8080;

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  routePrefix: ROUTE_PREFIX,
  description: "Twitch Channel Points local reward CRUD foundation with Communication Bus registration",
  build: MODULE_BUILD
};

const DEFAULT_CONFIG = {
  enabled: true,
  busEnabled: true,
  busSelfTestEnabled: true,
  twitchRewardManagementEnabled: false,
  twitchRewardSyncEnabled: false,
  dashboardEnabled: false,
  dbMigrationEnabled: true,
  schemaPreviewEnabled: true,
  migrationExecutionEnabled: true,
  localCrudEnabled: true,
  mediaExecutionBridgeEnabled: true,
  mediaExecutionTargetUrl: "/api/sound/play"
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

  return {
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
  return created;
}

function updateReward(idOrKey, input = {}) {
  ensureDbReady();
  const existing = getRewardByIdOrKey(idOrKey);
  if (!existing) return null;
  const data = normalizeRewardInput(input, existing);
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
  `, { ...data, id: existing.id });
  localCrudStats.updated += 1;
  localCrudStats.lastCrudAt = nowIso();
  localCrudStats.lastCrudAction = "update_reward";
  const updated = getRewardByIdOrKey(data.reward_key);
  publishStatus("reward_updated");
  return updated;
}

function setRewardEnabled(idOrKey, enabled, paused = null) {
  ensureDbReady();
  const existing = getRewardByIdOrKey(idOrKey);
  if (!existing) return null;
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

function buildRewardExecutionPayload(reward, input = {}) {
  const payload = rewardActionPayload(reward);
  const mediaId = rewardMediaId(reward);
  const mediaType = rewardMediaType(reward);
  const isVideo = mediaType === "video";
  const userLogin = cleanString(input.userLogin || input.user || input.login || payload.userLogin || "testuser").toLowerCase();
  const displayName = cleanString(input.userDisplayName || input.displayName || input.userName || input.user || userLogin || "testuser");
  return {
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
    target: cleanString(payload.target || "stream"),
    outputTarget: isVideo ? "overlay" : cleanString(payload.outputTarget || payload.output || "overlay"),
    category: cleanString(payload.category || "channel_reward"),
    requestedBy: userLogin || displayName,
    label: cleanString(payload.label || reward.title || reward.reward_key || mediaId),
    queueIfBusy: reward.queue_mode !== "drop" && payload.queueIfBusy !== false,
    parallelAllowed: payload.parallelAllowed === true,
    meta: {
      rewardId: reward.id,
      rewardKey: reward.reward_key,
      twitchRewardId: reward.twitch_reward_id || "",
      actionType: reward.action_type || "",
      mediaId,
      source: "channelpoints"
    }
  };
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

function summarizeExecutionResult(result) {
  const data = result && result.data ? result.data : {};
  return {
    ok: !!(result && result.ok),
    statusCode: result && result.statusCode || 0,
    dataOk: data && data.ok === true,
    message: data && data.message || "",
    result: data && data.result || null,
    item: data && data.item ? { requestId: data.item.requestId, soundId: data.item.soundId, label: data.item.label, mediaType: data.item.mediaType, mediaUrl: data.item.mediaUrl, videoUrl: data.item.videoUrl, outputTarget: data.item.outputTarget } : null
  };
}

function recordRedemptionExecution(reward, input, status, result) {
  try {
    ensureDbReady();
    const now = nowIso();
    database.run(`
      INSERT INTO channelpoints_redemptions
        (twitch_redemption_id, twitch_reward_id, reward_key, user_id, user_login, user_display_name, user_input, status, queue_group, result_json, redeemed_at, created_at, updated_at)
      VALUES
        (:twitch_redemption_id, :twitch_reward_id, :reward_key, :user_id, :user_login, :user_display_name, :user_input, :status, :queue_group, :result_json, :redeemed_at, :created_at, :updated_at)
    `, {
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
    });
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
  }
}

function buildExecutionCheck(reward, input = {}) {
  const config = getConfig();
  const mediaId = rewardMediaId(reward);
  const mediaType = rewardMediaType(reward);
  const targetUrl = cleanString(config.mediaExecutionTargetUrl || "/api/sound/play");
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
    mediaId,
    mediaType,
    executable: isExecutableMediaReward(reward),
    effectiveTargetUrl: targetUrl,
    targetMethod: "POST",
    payloadPreview: buildRewardExecutionPayload(reward, input),
    warnings: {
      disabled: reward.system_enabled ? false : true,
      paused: reward.is_paused ? true : false,
      missingMediaId: mediaId ? false : true,
      unsupportedAction: isExecutableMediaReward(reward) ? false : true
    },
    updatedAt: nowIso()
  };
}

async function executeReward(idOrKey, input = {}) {
  const config = getConfig();
  if (config.mediaExecutionBridgeEnabled === false) throw new Error("media_execution_bridge_disabled");
  const reward = getRewardByIdOrKey(idOrKey);
  if (!reward) throw new Error("reward_not_found");
  if (!reward.system_enabled) throw new Error("reward_disabled_local");
  if (reward.is_paused) throw new Error("reward_paused_local");
  if (!isExecutableMediaReward(reward)) throw new Error("reward_not_executable_media");
  const targetUrl = cleanString(config.mediaExecutionTargetUrl || "/api/sound/play");
  const payload = buildRewardExecutionPayload(reward, input);
  try {
    const result = await httpJsonRequest("POST", targetUrl, payload);
    const summary = summarizeExecutionResult(result);
    executionStats.executed += 1;
    executionStats.lastExecutionAt = nowIso();
    executionStats.lastExecutionAction = "execute_media_reward";
    executionStats.lastExecutionReward = reward.reward_key;
    executionStats.lastExecutionResult = summary;
    executionStats.lastExecutionError = "";
    recordRedemptionExecution(reward, input, "executed", summary);
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
    recordRedemptionExecution(reward, input, "failed", { error: message, data: err && err.data || null });
    lastError = message;
    throw err;
  }
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
    core: busStatus ? { ok: busStatus.ok === true, bus: busStatus.bus, version: busStatus.version, moduleMeta: busStatus.moduleMeta || null, stats: busStatus.stats || null } : null
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
    mode: "backend_local_reward_crud_media_execution_bridge",
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
      localCrudEnabled: config.localCrudEnabled !== false
    },
    twitch: {
      rewardManagementImplemented: false,
      rewardSyncImplemented: false,
      redemptionHandlingImplemented: false,
      writeActionsEnabled: false,
      requiredManageScope: "channel:manage:redemptions",
      requiredReadScope: "channel:read:redemptions",
      note: "This version is local reward CRUD plus local media execution bridge. Twitch reward reads/writes are planned later."
    },
    localState: {
      rewardCount: counts.rewards,
      categoryCount: counts.categories,
      redemptionCount: counts.redemptions,
      queueSize: 0,
      crudStats: { ...localCrudStats },
      executionStats: { ...executionStats },
      lastBusTestAt,
      lastBusEvent,
      lastError
    },
    bus: buildBusStatus(),
    routes: [
      `${ROUTE_PREFIX}/status`,
      `${ROUTE_PREFIX}/model`,
      `${ROUTE_PREFIX}/media-plan`,
      `${ROUTE_PREFIX}/schema-preview`,
      `${ROUTE_PREFIX}/db-status`,
      `${ROUTE_PREFIX}/categories`,
      `${ROUTE_PREFIX}/rewards`,
      `${ROUTE_PREFIX}/rewards/:idOrKey`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/enable`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/disable`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/execution-check`,
      `${ROUTE_PREFIX}/rewards/:idOrKey/execute`,
      `${ROUTE_PREFIX}/execute`,
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
    localCrudEnabled: config.localCrudEnabled !== false,
    lastError,
    timestamp: nowIso()
  };
  const result = currentBus.publishModuleStatus(MODULE_NAME, payload, { action: "updated", replayable: true, requireAck: false });
  lastBusStatusAt = nowIso();
  return result;
}

function registerBusSubscription() {
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.subscribe !== "function") return { ok: false, reason: "bus_subscribe_unavailable" };
  if (subscriptionIds.includes("channelpoints:self-test")) return { ok: true, reason: "already_registered" };
  const result = currentBus.subscribe({
    id: "channelpoints:self-test",
    module: MODULE_NAME,
    channel: "channelpoints.test",
    action: "ping",
    capability: "channelpoints.test.ping",
    meta: { purpose: "STEP493 bus receive smoke test" }
  }, event => {
    receivedBusEvents += 1;
    lastBusEventAt = nowIso();
    lastBusEvent = {
      id: cleanString(event && event.id),
      channel: cleanString(event && event.channel),
      action: cleanString(event && event.action),
      source: event && event.source ? event.source : null,
      payload: event && event.payload ? event.payload : {}
    };
    return { ok: true, module: MODULE_NAME, receivedAt: lastBusEventAt };
  });
  if (result && result.ok === true) subscriptionIds.push("channelpoints:self-test");
  return result;
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
    capabilities: ["module.lifecycle", "module.status", "channelpoints.status", "channelpoints.schema", "channelpoints.local_crud", "channelpoints.media_execution", "channelpoints.test.ping"]
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
    capabilities: ["module.lifecycle", "module.status", "channelpoints.status", "channelpoints.schema", "channelpoints.local_crud", "channelpoints.media_execution", "channelpoints.test.ping"],
    meta: { routePrefix: ROUTE_PREFIX, localCrud: true, twitchWritesEnabled: false, mediaSystem: "existing_media_module", mediaExecutionBridge: "/api/sound/play" }
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
  res.status(statusCode).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: lastError, ...extra });
}

function init({ app }) {
  if (!app) throw new Error("channelpoints.init: app fehlt.");
  loadConfig();
  try { migrateDatabase("init"); } catch (err) { lastError = err && err.message ? err.message : String(err); }
  try { registerAtCommunicationBus(); } catch (err) { lastError = err && err.message ? err.message : String(err); }

  app.get(`${ROUTE_PREFIX}/status`, (req, res) => {
    try { heartbeatBus("status_route"); publishStatus("status_route"); res.json(buildStatus()); } catch (err) { sendError(res, 500, err); }
  });
  app.get(`${ROUTE_PREFIX}/model`, (req, res) => { try { res.json(buildModel()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/media-plan`, (req, res) => { try { res.json(buildMediaPlan()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/schema-preview`, (req, res) => { try { res.json(buildSchemaPreview()); } catch (err) { sendError(res, 500, err); } });
  app.get(`${ROUTE_PREFIX}/db-status`, (req, res) => { try { res.json(getDbStatus()); } catch (err) { sendError(res, 500, err); } });

  app.get(`${ROUTE_PREFIX}/categories`, (req, res) => {
    try { res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, categories: listCategories(req) }); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/rewards`, (req, res) => {
    try { res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, rewards: listRewards(req), localCrudStats: { ...localCrudStats } }); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/rewards/:idOrKey`, (req, res) => {
    try {
      const reward = getRewardByIdOrKey(req.params.idOrKey);
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, reward });
    } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards`, (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "local_crud_disabled" });
      const reward = createReward(req.body || {});
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, action: "created", reward, twitchWrite: false });
    } catch (err) { sendError(res, 400, err); }
  });

  app.put(`${ROUTE_PREFIX}/rewards/:idOrKey`, (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "local_crud_disabled" });
      const reward = updateReward(req.params.idOrKey, req.body || {});
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, action: "updated", reward, twitchWrite: false });
    } catch (err) { sendError(res, 400, err); }
  });

  app.patch(`${ROUTE_PREFIX}/rewards/:idOrKey`, (req, res) => {
    try {
      if (getConfig().localCrudEnabled === false) return res.status(403).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "local_crud_disabled" });
      const reward = updateReward(req.params.idOrKey, req.body || {});
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, action: "patched", reward, twitchWrite: false });
    } catch (err) { sendError(res, 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/disable`, (req, res) => {
    try {
      const reward = setRewardEnabled(req.params.idOrKey, false, boolValue(req.body && req.body.is_paused, true));
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, action: "disabled_local_only", reward, twitchWrite: false, note: "Diese Version deaktiviert nur lokal system_enabled/is_paused. Twitch is_enabled=false kommt in einem späteren Twitch-Sync/API-Ausbau." });
    } catch (err) { sendError(res, 400, err); }
  });

  app.post(`${ROUTE_PREFIX}/rewards/:idOrKey/enable`, (req, res) => {
    try {
      const reward = setRewardEnabled(req.params.idOrKey, true, boolValue(req.body && req.body.is_paused, false));
      if (!reward) return res.status(404).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: "reward_not_found" });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, action: "enabled_local_only", reward, twitchWrite: false });
    } catch (err) { sendError(res, 400, err); }
  });


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

  app.get(`${ROUTE_PREFIX}/bus-test`, (req, res) => {
    try { const result = emitBusSelfTest(req); res.json(buildStatus({ busTest: true, result })); } catch (err) {
      const currentBus = getBus();
      if (currentBus && typeof currentBus.trackIssue === "function") currentBus.trackIssue("channelpoints_bus_test_failed", "Channelpoints bus self-test failed", { level: "error", details: { error: err && err.message ? err.message : String(err) } });
      sendError(res, 500, err, { busTest: true });
    }
  });

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} API routes registered (${ROUTE_PREFIX})`);
}

module.exports = { MODULE_META, init, buildStatus, buildModel, buildMediaPlan, buildSchemaPreview, getDbStatus, buildExecutionCheck, executeReward, registerAtCommunicationBus, heartbeatBus, publishStatus };
