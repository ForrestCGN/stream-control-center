'use strict';

const helperConfig = require('./helpers/helper_config');
const communicationBus = require('./communication_bus');
const database = require('../core/database');

const MODULE_NAME = 'channelpoints';
const MODULE_VERSION = '0.4.0';
const ROUTE_PREFIX = '/api/channelpoints';

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  routePrefix: ROUTE_PREFIX,
  description: 'Twitch Channel Points safe DB migration foundation with Communication Bus registration and Media-System integration plan'
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
  mediaIntegrationPlanned: true,
  mediaSystem: {
    enabled: true,
    module: 'media',
    uploadUi: 'existing_dashboard_media_upload_mask',
    pickerComponent: 'htdocs/dashboard/components/media_picker.js',
    fieldComponent: 'htdocs/dashboard/components/media_field.js',
    note: 'Channelpoints must use the existing media system and upload mask. Do not create a second upload system.'
  }
};

const CHANNELPOINTS_MODEL_VERSION = '0.3.0';
const CHANNELPOINTS_SCHEMA_PREVIEW_VERSION = '0.2.0';
const CHANNELPOINTS_SCHEMA_TARGET_VERSION = 1;

const REWARD_FIELDS = [
  { name: 'id', type: 'integer', source: 'local', purpose: 'Local primary key, later DB-managed.' },
  { name: 'reward_key', type: 'text', source: 'local', purpose: 'Stable local key for dashboard/action mapping.' },
  { name: 'twitch_reward_id', type: 'text', source: 'twitch', purpose: 'Twitch Custom Reward ID after sync/create.' },
  { name: 'title', type: 'text', source: 'local_or_twitch', purpose: 'Reward title shown on Twitch and in dashboard.' },
  { name: 'prompt', type: 'text', source: 'local_or_twitch', purpose: 'Reward description/prompt.' },
  { name: 'cost', type: 'integer', source: 'local_or_twitch', purpose: 'Channel points cost.' },
  { name: 'category_key', type: 'text', source: 'local', purpose: 'Dashboard category/grouping key.' },
  { name: 'sort_order', type: 'integer', source: 'local', purpose: 'Dashboard sorting inside category.' },
  { name: 'system_enabled', type: 'boolean', source: 'local', purpose: 'Local feature switch for the control-center.' },
  { name: 'twitch_is_enabled', type: 'boolean', source: 'twitch', purpose: 'True Twitch reward visibility. Deactivate must later set Twitch is_enabled=false.' },
  { name: 'is_paused', type: 'boolean', source: 'local', purpose: 'Local temporary pause without deleting config.' },
  { name: 'require_user_input', type: 'boolean', source: 'local_or_twitch', purpose: 'Whether redemption requires viewer text input.' },
  { name: 'input_label', type: 'text', source: 'local', purpose: 'Dashboard/help label for required input.' },
  { name: 'action_type', type: 'text', source: 'local', purpose: 'What should happen: streamerbot_action, backend_route, overlay_event, sound, media, queue, custom.' },
  { name: 'action_key', type: 'text', source: 'local', purpose: 'Action identifier, route key, Streamer.bot action name or module action.' },
  { name: 'action_payload_json', type: 'json', source: 'local', purpose: 'Safe structured payload for action execution.' },
  { name: 'media_asset_id', type: 'text', source: 'media', purpose: 'Reference to existing media system asset. No separate upload storage.' },
  { name: 'media_role', type: 'text', source: 'local', purpose: 'How the asset is used: sound, image, video, overlay, icon.' },
  { name: 'queue_mode', type: 'text', source: 'local', purpose: 'none, per_reward, global, exclusive_group.' },
  { name: 'priority', type: 'integer', source: 'local', purpose: 'Queue priority for later execution engine.' },
  { name: 'cooldown_seconds', type: 'integer', source: 'local_or_twitch', purpose: 'Local/Twitch cooldown planning.' },
  { name: 'max_per_stream', type: 'integer', source: 'local_or_twitch', purpose: 'Limit per stream.' },
  { name: 'max_per_user_per_stream', type: 'integer', source: 'local_or_twitch', purpose: 'Viewer-specific stream limit.' },
  { name: 'auto_fulfill', type: 'boolean', source: 'local', purpose: 'Later redemption fulfil/cancel behavior.' },
  { name: 'notes', type: 'text', source: 'local', purpose: 'Internal notes for owner/admin.' },
  { name: 'created_at', type: 'datetime', source: 'local', purpose: 'Audit/created timestamp.' },
  { name: 'updated_at', type: 'datetime', source: 'local', purpose: 'Audit/updated timestamp.' }
];

const CATEGORY_FIELDS = [
  { name: 'id', type: 'integer', source: 'local', purpose: 'Local primary key, later DB-managed.' },
  { name: 'category_key', type: 'text', source: 'local', purpose: 'Stable key, e.g. fun, sounds, overlays, challenges.' },
  { name: 'label', type: 'text', source: 'local', purpose: 'Dashboard label.' },
  { name: 'description', type: 'text', source: 'local', purpose: 'Dashboard description/help.' },
  { name: 'sort_order', type: 'integer', source: 'local', purpose: 'Dashboard category order.' },
  { name: 'enabled', type: 'boolean', source: 'local', purpose: 'Category visible/active in dashboard.' },
  { name: 'created_at', type: 'datetime', source: 'local', purpose: 'Audit/created timestamp.' },
  { name: 'updated_at', type: 'datetime', source: 'local', purpose: 'Audit/updated timestamp.' }
];

const REDEMPTION_FIELDS = [
  { name: 'id', type: 'integer', source: 'local', purpose: 'Local primary key, later DB-managed.' },
  { name: 'twitch_redemption_id', type: 'text', source: 'twitch', purpose: 'Twitch redemption ID.' },
  { name: 'twitch_reward_id', type: 'text', source: 'twitch', purpose: 'Reward ID from Twitch event/API.' },
  { name: 'reward_key', type: 'text', source: 'local', purpose: 'Resolved local reward key.' },
  { name: 'user_id', type: 'text', source: 'twitch', purpose: 'Redeeming Twitch user ID.' },
  { name: 'user_login', type: 'text', source: 'twitch', purpose: 'Redeeming login.' },
  { name: 'user_display_name', type: 'text', source: 'twitch', purpose: 'Display name at redemption time.' },
  { name: 'user_input', type: 'text', source: 'twitch', purpose: 'Optional viewer input.' },
  { name: 'status', type: 'text', source: 'local_or_twitch', purpose: 'queued, running, fulfilled, canceled, failed.' },
  { name: 'queue_group', type: 'text', source: 'local', purpose: 'Later queue grouping.' },
  { name: 'result_json', type: 'json', source: 'local', purpose: 'Action execution result/error metadata.' },
  { name: 'redeemed_at', type: 'datetime', source: 'twitch', purpose: 'Twitch redemption timestamp.' },
  { name: 'created_at', type: 'datetime', source: 'local', purpose: 'Local created timestamp.' },
  { name: 'updated_at', type: 'datetime', source: 'local', purpose: 'Local updated timestamp.' }
];

const ACTION_TYPES = [
  {
    key: 'streamerbot_action',
    label: 'Streamer.bot Action',
    planned: true,
    description: 'Call a configured Streamer.bot action/bridge route later. No direct implementation in STEP490.'
  },
  {
    key: 'backend_route',
    label: 'Backend Route',
    planned: true,
    description: 'Call a local backend route/action with safe payload.'
  },
  {
    key: 'bus_event',
    label: 'Communication Bus Event',
    planned: true,
    description: 'Emit an event to another module through the Communication Bus.'
  },
  {
    key: 'media',
    label: 'Media-System Asset',
    planned: true,
    description: 'Use an asset selected through existing media.js/dashboard media picker.'
  },
  {
    key: 'sound',
    label: 'Sound-System',
    planned: true,
    description: 'Use existing sound/media bridge instead of separate audio handling.'
  },
  {
    key: 'overlay_event',
    label: 'Overlay Event',
    planned: true,
    description: 'Trigger overlay behavior through backend/WebSocket/bus.'
  },
  {
    key: 'manual',
    label: 'Manual/Review',
    planned: true,
    description: 'Store/queue the redemption for manual handling.'
  }
];

const DEFAULT_CATEGORIES = [
  { category_key: 'general', label: 'Allgemein', sort_order: 10, enabled: true },
  { category_key: 'sounds', label: 'Sounds', sort_order: 20, enabled: true },
  { category_key: 'media', label: 'Medien', sort_order: 30, enabled: true },
  { category_key: 'overlays', label: 'Overlays', sort_order: 40, enabled: true },
  { category_key: 'challenges', label: 'Challenges', sort_order: 50, enabled: true },
  { category_key: 'admin', label: 'Admin/Intern', sort_order: 90, enabled: false }
];

const SCHEMA_TABLES = [
  {
    name: 'channelpoints_categories',
    purpose: 'Dashboard grouping, sorting, visibility and later category permissions.',
    source: 'local',
    fields: CATEGORY_FIELDS,
    primaryKey: 'id',
    unique: ['category_key']
  },
  {
    name: 'channelpoints_rewards',
    purpose: 'Local reward configuration, Twitch mapping, action mapping and media references.',
    source: 'local_and_twitch',
    fields: REWARD_FIELDS,
    primaryKey: 'id',
    unique: ['reward_key'],
    indexes: ['twitch_reward_id', 'category_key', 'system_enabled', 'twitch_is_enabled', 'action_type', 'media_asset_id']
  },
  {
    name: 'channelpoints_redemptions',
    purpose: 'Redemption history, queue status, execution result and later fulfil/cancel tracking.',
    source: 'eventsub_and_local',
    fields: REDEMPTION_FIELDS,
    primaryKey: 'id',
    unique: ['twitch_redemption_id'],
    indexes: ['twitch_reward_id', 'reward_key', 'user_login', 'status', 'queue_group', 'redeemed_at']
  }
];

const SCHEMA_RULES = [
  'STEP492 executes only the reviewed local DB foundation migration.',
  'Migration is additive only and uses CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS / INSERT OR IGNORE.',
  'All schema changes must be additive and use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.',
  'The productive SQLite database D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite must never be replaced or overwritten.',
  'Media assets are referenced by media_asset_id and selected via the existing media system / media picker.',
  'Deactivate later must update Twitch Custom Reward is_enabled=false, not only a local system flag.',
  'EventBus status/health should be used for module monitoring and later reward execution events.'
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
let lastError = '';
let receivedBusEvents = 0;
let subscriptionIds = [];
let dbMigrationState = {
  attempted: false,
  executed: false,
  ok: false,
  reason: '',
  schemaVersionBefore: 0,
  schemaVersionAfter: 0,
  targetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
  lastRunAt: null,
  lastError: '',
  createdTables: [],
  createdIndexes: [],
  seededCategories: 0
};

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const raw = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(raw)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(raw)) return false;
  return fallback;
}

function loadConfig() {
  const loaded = helperConfig.loadConfig('channelpoints.json', {}, { createIfMissing: false });
  loadedConfig = {
    ...DEFAULT_CONFIG,
    ...(loaded && loaded.data && typeof loaded.data === 'object' ? loaded.data : {})
  };
  loadedConfig.mediaSystem = {
    ...DEFAULT_CONFIG.mediaSystem,
    ...(loadedConfig.mediaSystem && typeof loadedConfig.mediaSystem === 'object' ? loadedConfig.mediaSystem : {})
  };
  return loadedConfig;
}

function getConfig() {
  if (!loadedConfig) return loadConfig();
  return loadedConfig;
}

function getBus() {
  if (bus) return bus;
  if (!communicationBus || typeof communicationBus.getBus !== 'function') return null;
  bus = communicationBus.getBus();
  return bus;
}


function sqliteTypeForField(field) {
  const type = cleanString(field && field.type, 'text').toLowerCase();
  if (type === 'integer') return 'INTEGER';
  if (type === 'boolean') return 'INTEGER';
  if (type === 'json') return 'TEXT';
  if (type === 'datetime') return 'TEXT';
  return 'TEXT';
}

function buildColumnSql(field, table) {
  const name = cleanString(field && field.name);
  if (!name) return null;
  if (name === table.primaryKey) return `  ${name} INTEGER PRIMARY KEY AUTOINCREMENT`;
  const sqlType = sqliteTypeForField(field);
  const constraints = [];
  if (table.unique && table.unique.includes(name)) constraints.push('UNIQUE');
  return `  ${name} ${sqlType}${constraints.length ? ' ' + constraints.join(' ') : ''}`;
}

function buildCreateTableSql(table) {
  const columns = table.fields
    .map(field => buildColumnSql(field, table))
    .filter(Boolean)
    .join(',\n');
  return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${columns}\n);`;
}

function buildIndexSql(table) {
  const indexes = [];
  for (const column of table.indexes || []) {
    indexes.push(`CREATE INDEX IF NOT EXISTS idx_${table.name}_${column} ON ${table.name} (${column});`);
  }
  return indexes;
}

function buildSeedCategorySql() {
  return DEFAULT_CATEGORIES.map(category => ({
    category_key: category.category_key,
    label: category.label,
    sort_order: category.sort_order,
    enabled: category.enabled === true ? 1 : 0,
    previewSql: `INSERT OR IGNORE INTO channelpoints_categories (category_key, label, sort_order, enabled, created_at, updated_at) VALUES ('${category.category_key}', '${category.label.replace(/'/g, "''")}', ${category.sort_order}, ${category.enabled === true ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
  }));
}

function buildSchemaPreview() {
  const config = getConfig();
  const tables = SCHEMA_TABLES.map(table => ({
    name: table.name,
    purpose: table.purpose,
    source: table.source,
    primaryKey: table.primaryKey,
    fieldCount: table.fields.length,
    unique: table.unique || [],
    indexes: table.indexes || [],
    createTableSql: buildCreateTableSql(table),
    createIndexSql: buildIndexSql(table)
  }));

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    schemaPreviewVersion: CHANNELPOINTS_SCHEMA_PREVIEW_VERSION,
    status: 'schema_ready_migration_available',
    dbMigrationEnabled: config.dbMigrationEnabled === true,
    migrationExecutionEnabled: config.migrationExecutionEnabled === true,
    migrationExecutionImplemented: true,
    sqliteCompatible: true,
    tables,
    seedPreview: {
      defaultCategories: buildSeedCategorySql(),
      executionEnabled: config.dbMigrationEnabled === true && config.migrationExecutionEnabled === true
    },
    safety: {
      noUnsafeDbWriteInStep492: true,
      noTwitchWriteInStep492: true,
      additiveOnly: true,
      productiveDbMustNotBeReplaced: 'D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite'
    },
    mediaIntegration: buildMediaPlan().mediaSystem,
    rules: SCHEMA_RULES
  };
}

function buildModelPlan() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    modelVersion: CHANNELPOINTS_MODEL_VERSION,
    status: 'safe_db_migration_foundation',
    dbMigrationEnabled: getConfig().dbMigrationEnabled === true,
    schemaPreviewAvailable: true,
    migrationExecutionImplemented: true,
    schemaTargetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
    dbMigrationState,
    tablesPlanned: [
      {
        name: 'channelpoints_categories',
        planned: true,
        schemaPreviewCreated: true,
        migrationCreated: true,
        purpose: 'Dashboard grouping, sorting and visibility.'
      },
      {
        name: 'channelpoints_rewards',
        planned: true,
        schemaPreviewCreated: true,
        migrationCreated: true,
        purpose: 'Local reward configuration, Twitch mapping and action/media mapping.'
      },
      {
        name: 'channelpoints_redemptions',
        planned: true,
        schemaPreviewCreated: true,
        migrationCreated: true,
        purpose: 'Later redemption history, queue status and fulfil/cancel tracking.'
      }
    ],
    fields: {
      categories: CATEGORY_FIELDS,
      rewards: REWARD_FIELDS,
      redemptions: REDEMPTION_FIELDS
    },
    defaultCategories: DEFAULT_CATEGORIES,
    actionTypes: ACTION_TYPES,
    rules: [
      'No Twitch write action in STEP492.',
      'Only additive local DB migration execution in STEP492.',
      'Deactivate later must update Twitch Custom Reward is_enabled=false, not only a local flag.',
      'Media files must use the existing media system/upload mask.',
      'Reward execution should later use Communication Bus events where possible.',
      'Streamer.bot should be used as trigger/bridge where needed, not as long-running state machine.'
    ]
  };
}

function buildMediaPlan() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    status: 'planning_only_uses_existing_media_system',
    mediaSystem: {
      enabled: config.mediaSystem && config.mediaSystem.enabled !== false,
      module: cleanString(config.mediaSystem && config.mediaSystem.module, 'media'),
      uploadUi: cleanString(config.mediaSystem && config.mediaSystem.uploadUi, 'existing_dashboard_media_upload_mask'),
      pickerComponent: cleanString(config.mediaSystem && config.mediaSystem.pickerComponent, 'htdocs/dashboard/components/media_picker.js'),
      fieldComponent: cleanString(config.mediaSystem && config.mediaSystem.fieldComponent, 'htdocs/dashboard/components/media_field.js'),
      note: cleanString(
        config.mediaSystem && config.mediaSystem.note,
        'Channelpoints must use the existing media system and upload mask. Do not create a second upload system.'
      )
    },
    plannedRewardMediaFields: [
      'media_asset_id',
      'media_role',
      'action_payload_json.media',
      'dashboard preview via existing media picker'
    ],
    plannedMediaRoles: [
      'sound',
      'image',
      'video',
      'overlay',
      'icon'
    ],
    nonGoals: [
      'No new upload endpoint in channelpoints.js.',
      'No second media database/table for assets.',
      'No direct filesystem upload handling in channelpoints.js.'
    ]
  };
}


function getDbCountSafe(tableName) {
  try {
    if (!database || typeof database.tableExists !== 'function' || !database.tableExists(tableName)) return 0;
    return database.count(tableName);
  } catch (_) {
    return 0;
  }
}

function getTableExistsSafe(tableName) {
  try {
    return !!(database && typeof database.tableExists === 'function' && database.tableExists(tableName));
  } catch (_) {
    return false;
  }
}

function applyChannelpointsSchema() {
  const createdTables = [];
  const createdIndexes = [];

  for (const table of SCHEMA_TABLES) {
    database.exec(buildCreateTableSql(table));
    createdTables.push(table.name);
    for (const indexSql of buildIndexSql(table)) {
      database.exec(indexSql);
      createdIndexes.push(indexSql);
    }
  }

  let seededCategories = 0;
  for (const category of DEFAULT_CATEGORIES) {
    const result = database.run(
      `
      INSERT OR IGNORE INTO channelpoints_categories
        (category_key, label, description, sort_order, enabled, created_at, updated_at)
      VALUES
        (:category_key, :label, :description, :sort_order, :enabled, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      {
        category_key: category.category_key,
        label: category.label,
        description: category.description || '',
        sort_order: category.sort_order,
        enabled: category.enabled === true ? 1 : 0
      }
    );
    if (result && Number(result.changes || 0) > 0) seededCategories += Number(result.changes || 0);
  }

  return { createdTables, createdIndexes, seededCategories };
}

function runDbMigration(reason = 'init') {
  const config = getConfig();
  dbMigrationState.attempted = true;
  dbMigrationState.reason = reason;
  dbMigrationState.targetVersion = CHANNELPOINTS_SCHEMA_TARGET_VERSION;
  dbMigrationState.lastRunAt = nowIso();

  if (config.dbMigrationEnabled !== true || config.migrationExecutionEnabled !== true) {
    dbMigrationState.executed = false;
    dbMigrationState.ok = false;
    dbMigrationState.reason = 'migration_disabled_by_config';
    return { ok: false, reason: 'migration_disabled_by_config', state: dbMigrationState };
  }

  try {
    database.ensureReady();
    const before = database.getSchemaVersion(MODULE_NAME);
    dbMigrationState.schemaVersionBefore = before;

    if (before < CHANNELPOINTS_SCHEMA_TARGET_VERSION) {
      const tx = database.transaction(() => {
        const applied = applyChannelpointsSchema();
        database.setSchemaVersion(MODULE_NAME, CHANNELPOINTS_SCHEMA_TARGET_VERSION);
        dbMigrationState.createdTables = applied.createdTables;
        dbMigrationState.createdIndexes = applied.createdIndexes;
        dbMigrationState.seededCategories = applied.seededCategories;
      });
      tx();
      dbMigrationState.executed = true;
    } else {
      const applied = applyChannelpointsSchema();
      dbMigrationState.executed = false;
      dbMigrationState.reason = 'schema_already_at_target_verified_idempotently';
      dbMigrationState.createdTables = applied.createdTables;
      dbMigrationState.createdIndexes = applied.createdIndexes;
      dbMigrationState.seededCategories = applied.seededCategories;
    }

    const after = database.getSchemaVersion(MODULE_NAME);
    dbMigrationState.schemaVersionAfter = after;
    dbMigrationState.ok = after >= CHANNELPOINTS_SCHEMA_TARGET_VERSION;
    dbMigrationState.lastError = '';
    return { ok: dbMigrationState.ok, state: dbMigrationState };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    dbMigrationState.ok = false;
    dbMigrationState.lastError = msg;
    lastError = msg;
    return { ok: false, error: msg, state: dbMigrationState };
  }
}

function buildDbStatus() {
  let dbPath = null;
  let schemaVersion = 0;
  try {
    database.ensureReady();
    dbPath = typeof database.getDbPath === 'function' ? database.getDbPath() : null;
    schemaVersion = database.getSchemaVersion(MODULE_NAME);
  } catch (err) {
    return {
      ok: false,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      status: 'database_unavailable',
      error: err && err.message ? err.message : String(err),
      migration: dbMigrationState
    };
  }

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    status: 'safe_local_tables_ready',
    databasePath: dbPath,
    schemaVersion,
    targetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
    migration: dbMigrationState,
    tables: SCHEMA_TABLES.map(table => ({
      name: table.name,
      exists: getTableExistsSafe(table.name),
      count: getDbCountSafe(table.name),
      plannedFields: table.fields.length,
      indexes: table.indexes || []
    })),
    safety: {
      additiveOnly: true,
      noTwitchWriteInStep492: true,
      noDataReplacement: true,
      productiveDbMustNotBeReplaced: 'D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite'
    }
  };
}

function buildBusStatus() {
  const currentBus = getBus();
  const busStatus = currentBus && typeof currentBus.getStatus === 'function' ? currentBus.getStatus() : null;
  const clients = Array.isArray(busStatus && busStatus.clients) ? busStatus.clients : [];
  const subscriptions = Array.isArray(busStatus && busStatus.subscriptions) ? busStatus.subscriptions : [];
  const moduleClient = clients.find(client => client && client.module === MODULE_NAME && client.type === 'module') || null;

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
    core: busStatus ? {
      ok: busStatus.ok === true,
      bus: busStatus.bus,
      version: busStatus.version,
      moduleMeta: busStatus.moduleMeta || null,
      stats: busStatus.stats || null
    } : null
  };
}

function buildStatus(extra = {}) {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    routePrefix: ROUTE_PREFIX,
    enabled: config.enabled !== false,
    mode: 'backend_db_migration_safe',
    model: {
      version: CHANNELPOINTS_MODEL_VERSION,
      schemaPreviewVersion: CHANNELPOINTS_SCHEMA_PREVIEW_VERSION,
      schemaTargetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
      dbMigrationState,
      dbMigrationEnabled: config.dbMigrationEnabled === true,
      schemaPreviewEnabled: config.schemaPreviewEnabled !== false,
      migrationExecutionEnabled: config.migrationExecutionEnabled === true,
      tableCountPlanned: SCHEMA_TABLES.length,
      rewardFieldCount: REWARD_FIELDS.length,
      categoryFieldCount: CATEGORY_FIELDS.length,
      redemptionFieldCount: REDEMPTION_FIELDS.length,
      actionTypeCount: ACTION_TYPES.length,
      defaultCategoryCount: DEFAULT_CATEGORIES.length
    },
    media: {
      integrationPlanned: config.mediaIntegrationPlanned !== false,
      usesExistingMediaSystem: true,
      module: cleanString(config.mediaSystem && config.mediaSystem.module, 'media'),
      uploadUi: cleanString(config.mediaSystem && config.mediaSystem.uploadUi, 'existing_dashboard_media_upload_mask'),
      pickerComponent: cleanString(config.mediaSystem && config.mediaSystem.pickerComponent, 'htdocs/dashboard/components/media_picker.js')
    },
    config: {
      busEnabled: config.busEnabled !== false,
      busSelfTestEnabled: config.busSelfTestEnabled !== false,
      twitchRewardManagementEnabled: config.twitchRewardManagementEnabled === true,
      twitchRewardSyncEnabled: config.twitchRewardSyncEnabled === true,
      dashboardEnabled: config.dashboardEnabled === true,
      dbMigrationEnabled: config.dbMigrationEnabled === true,
      schemaPreviewEnabled: config.schemaPreviewEnabled !== false,
      migrationExecutionEnabled: config.migrationExecutionEnabled === true
    },
    twitch: {
      rewardManagementImplemented: false,
      rewardSyncImplemented: false,
      redemptionHandlingImplemented: false,
      writeActionsEnabled: false,
      requiredManageScope: 'channel:manage:redemptions',
      requiredReadScope: 'channel:read:redemptions',
      note: 'STEP492 is a safe local DB foundation step. Twitch reward reads/writes are planned for later steps.'
    },
    localState: {
      rewardCount: getDbCountSafe('channelpoints_rewards'),
      redemptionCount: getDbCountSafe('channelpoints_redemptions'),
      queueSize: 0,
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
      `${ROUTE_PREFIX}/bus-test`
    ],
    ...extra
  };
}

function publishStatus(reason = 'status') {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: 'bus_disabled_by_config' };

  const currentBus = getBus();
  if (!currentBus || typeof currentBus.publishModuleStatus !== 'function') {
    return { ok: false, reason: 'bus_publishModuleStatus_unavailable' };
  }

  const payload = {
    module: MODULE_NAME,
    version: MODULE_VERSION,
    enabled: config.enabled !== false,
    health: lastError ? 'warn' : 'ok',
    status: 'online',
    reason,
    routePrefix: ROUTE_PREFIX,
    modelVersion: CHANNELPOINTS_MODEL_VERSION,
    mode: 'backend_db_migration_safe',
    rewardCount: 0,
    redemptionCount: 0,
    queueSize: 0,
    mediaIntegrationPlanned: config.mediaIntegrationPlanned !== false,
    usesExistingMediaSystem: true,
    dbMigrationEnabled: config.dbMigrationEnabled === true,
    schemaPreviewEnabled: config.schemaPreviewEnabled !== false,
    schemaTargetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
    dbMigrationState,
    migrationExecutionEnabled: config.migrationExecutionEnabled === true,
    twitchWritesEnabled: false,
      dbMigrationOk: dbMigrationState.ok === true,
      schemaVersion: dbMigrationState.schemaVersionAfter || dbMigrationState.schemaVersionBefore || 0,
    lastError,
    timestamp: nowIso()
  };

  const result = currentBus.publishModuleStatus(MODULE_NAME, payload, {
    action: 'updated',
    replayable: true,
    requireAck: false
  });

  lastBusStatusAt = nowIso();
  return result;
}

function registerBusSubscription() {
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.subscribe !== 'function') return { ok: false, reason: 'bus_subscribe_unavailable' };
  if (subscriptionIds.includes('channelpoints:self-test')) return { ok: true, reason: 'already_registered' };

  const result = currentBus.subscribe({
    id: 'channelpoints:self-test',
    module: MODULE_NAME,
    channel: 'channelpoints.test',
    action: 'ping',
    capability: 'channelpoints.test.ping',
    meta: {
      purpose: 'STEP489/STEP490 bus receive smoke test'
    }
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

  if (result && result.ok === true) {
    subscriptionIds.push('channelpoints:self-test');
  }

  return result;
}

function registerAtCommunicationBus() {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: 'bus_disabled_by_config' };

  const currentBus = getBus();
  if (!currentBus || typeof currentBus.registerModule !== 'function') {
    return { ok: false, reason: 'bus_registerModule_unavailable' };
  }

  const registerResult = currentBus.registerModule({
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    name: 'Kanalpunkte-System',
    version: MODULE_VERSION,
    capabilities: [
      'module.lifecycle',
      'module.status',
      'channelpoints.status',
      'channelpoints.model',
      'channelpoints.media',
      'channelpoints.schema',
      'channelpoints.db',
      'channelpoints.test.ping'
    ],
    meta: {
      routePrefix: ROUTE_PREFIX,
      skeleton: true,
      modelPlan: true,
      schemaPreview: true,
      migrationExecutionImplemented: true,
      schemaTargetVersion: CHANNELPOINTS_SCHEMA_TARGET_VERSION,
      mediaIntegrationPlanned: true,
      usesExistingMediaSystem: true,
      twitchWritesEnabled: false
    }
  });

  registeredAtBus = registerResult && registerResult.ok === true;
  lastBusRegisterAt = registeredAtBus ? nowIso() : lastBusRegisterAt;

  const subscriptionResult = registerBusSubscription();
  const heartbeatResult = heartbeatBus('register');
  const statusResult = publishStatus('register');

  return {
    ok: registeredAtBus,
    registerResult,
    subscriptionResult,
    heartbeatResult,
    statusResult
  };
}

function heartbeatBus(reason = 'heartbeat') {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: 'bus_disabled_by_config' };

  const currentBus = getBus();
  if (!currentBus || typeof currentBus.heartbeatModule !== 'function') {
    return { ok: false, reason: 'bus_heartbeatModule_unavailable' };
  }

  const result = currentBus.heartbeatModule(MODULE_NAME, {
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    version: MODULE_VERSION,
    status: 'online',
    health: lastError ? 'warn' : 'ok',
    reason,
    capabilities: [
      'module.lifecycle',
      'module.status',
      'channelpoints.status',
      'channelpoints.model',
      'channelpoints.media',
      'channelpoints.schema',
      'channelpoints.db',
      'channelpoints.test.ping'
    ]
  });

  lastBusHeartbeatAt = nowIso();
  return result;
}

function emitBusSelfTest(req) {
  const config = getConfig();
  if (config.busSelfTestEnabled === false) return { ok: false, reason: 'bus_self_test_disabled' };

  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== 'function') return { ok: false, reason: 'bus_emit_unavailable' };

  const message = cleanString(req.query.message, 'channelpoints bus self test');
  const replayable = boolValue(req.query.replayable, true);
  const requireAck = boolValue(req.query.requireAck, false);
  const ttlMs = Math.max(1000, Number.parseInt(String(req.query.ttlMs || '15000'), 10) || 15000);

  lastBusTestAt = nowIso();

  const result = currentBus.emit({
    type: 'event',
    channel: 'channelpoints.test',
    action: 'ping',
    source: {
      type: 'module',
      id: `module:${MODULE_NAME}`,
      module: MODULE_NAME
    },
    target: {
      type: 'all',
      id: '*'
    },
    payload: {
      test: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      message,
      emittedAt: lastBusTestAt
    },
    meta: {
      requireAck,
      replayable,
      ttlMs,
      productionTarget: false
    }
  });

  publishStatus('bus_self_test');
  return result;
}

function init({ app }) {
  if (!app) throw new Error('channelpoints.init: app fehlt.');

  loadConfig();

  try {
    runDbMigration('init');
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
  }

  try {
    registerAtCommunicationBus();
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
  }

  app.get(`${ROUTE_PREFIX}/status`, (req, res) => {
    try {
      heartbeatBus('status_route');
      publishStatus('status_route');
      res.json(buildStatus());
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        error: lastError
      });
    }
  });

  app.get(`${ROUTE_PREFIX}/model`, (req, res) => {
    try {
      heartbeatBus('model_route');
      publishStatus('model_route');
      res.json(buildModelPlan());
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        error: lastError
      });
    }
  });

  app.get(`${ROUTE_PREFIX}/media-plan`, (req, res) => {
    try {
      heartbeatBus('media_plan_route');
      publishStatus('media_plan_route');
      res.json(buildMediaPlan());
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        error: lastError
      });
    }
  });

  app.get(`${ROUTE_PREFIX}/schema-preview`, (req, res) => {
    try {
      heartbeatBus('schema_preview_route');
      publishStatus('schema_preview_route');
      res.json(buildSchemaPreview());
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        error: lastError
      });
    }
  });

  app.get(`${ROUTE_PREFIX}/db-status`, (req, res) => {
    try {
      heartbeatBus('db_status_route');
      publishStatus('db_status_route');
      res.json(buildDbStatus());
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        error: lastError
      });
    }
  });

  app.get(`${ROUTE_PREFIX}/bus-test`, (req, res) => {
    try {
      const result = emitBusSelfTest(req);
      res.json(buildStatus({
        busTest: true,
        result
      }));
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      const currentBus = getBus();
      if (currentBus && typeof currentBus.trackIssue === 'function') {
        currentBus.trackIssue('channelpoints_bus_test_failed', 'Channelpoints bus self-test failed', {
          level: 'error',
          details: { error: lastError }
        });
      }
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        busTest: true,
        error: lastError
      });
    }
  });

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} API routes registered (${ROUTE_PREFIX})`);
}

module.exports = {
  MODULE_META,
  init,
  buildStatus,
  buildModelPlan,
  buildMediaPlan,
  buildSchemaPreview,
  buildDbStatus,
  runDbMigration,
  registerAtCommunicationBus,
  heartbeatBus,
  publishStatus
};
