'use strict';

const helperConfig = require('./helpers/helper_config');
const communicationBus = require('./communication_bus');

const MODULE_NAME = 'channelpoints';
const MODULE_VERSION = '0.2.0';
const ROUTE_PREFIX = '/api/channelpoints';

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  routePrefix: ROUTE_PREFIX,
  description: 'Twitch Channel Points backend model plan with Communication Bus registration and Media-System integration plan'
};

const DEFAULT_CONFIG = {
  enabled: true,
  busEnabled: true,
  busSelfTestEnabled: true,
  twitchRewardManagementEnabled: false,
  twitchRewardSyncEnabled: false,
  dashboardEnabled: false,
  dbMigrationEnabled: false,
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

const CHANNELPOINTS_MODEL_VERSION = '0.1.0';

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

function buildModelPlan() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    modelVersion: CHANNELPOINTS_MODEL_VERSION,
    status: 'planning_only_no_db_migration',
    dbMigrationEnabled: getConfig().dbMigrationEnabled === true,
    tablesPlanned: [
      {
        name: 'channelpoints_categories',
        planned: true,
        migrationCreated: false,
        purpose: 'Dashboard grouping, sorting and visibility.'
      },
      {
        name: 'channelpoints_rewards',
        planned: true,
        migrationCreated: false,
        purpose: 'Local reward configuration, Twitch mapping and action/media mapping.'
      },
      {
        name: 'channelpoints_redemptions',
        planned: true,
        migrationCreated: false,
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
      'No Twitch write action in STEP490.',
      'No database migration in STEP490.',
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
    mode: 'backend_model_plan',
    model: {
      version: CHANNELPOINTS_MODEL_VERSION,
      dbMigrationEnabled: config.dbMigrationEnabled === true,
      tableCountPlanned: 3,
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
      dbMigrationEnabled: config.dbMigrationEnabled === true
    },
    twitch: {
      rewardManagementImplemented: false,
      rewardSyncImplemented: false,
      redemptionHandlingImplemented: false,
      writeActionsEnabled: false,
      requiredManageScope: 'channel:manage:redemptions',
      requiredReadScope: 'channel:read:redemptions',
      note: 'STEP490 is a model/media planning step. Twitch reward reads/writes are planned for later steps.'
    },
    localState: {
      rewardCount: 0,
      redemptionCount: 0,
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
    mode: 'backend_model_plan',
    rewardCount: 0,
    redemptionCount: 0,
    queueSize: 0,
    mediaIntegrationPlanned: config.mediaIntegrationPlanned !== false,
    usesExistingMediaSystem: true,
    dbMigrationEnabled: config.dbMigrationEnabled === true,
    twitchWritesEnabled: false,
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
      'channelpoints.test.ping'
    ],
    meta: {
      routePrefix: ROUTE_PREFIX,
      skeleton: true,
      modelPlan: true,
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
  registerAtCommunicationBus,
  heartbeatBus,
  publishStatus
};
