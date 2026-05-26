'use strict';

const helperConfig = require('./helpers/helper_config');
const communicationBus = require('./communication_bus');

const MODULE_NAME = 'channelpoints';
const MODULE_VERSION = '0.1.0';
const ROUTE_PREFIX = '/api/channelpoints';

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  routePrefix: ROUTE_PREFIX,
  description: 'Twitch Channel Points management skeleton with Communication Bus registration'
};

const DEFAULT_CONFIG = {
  enabled: true,
  busEnabled: true,
  busSelfTestEnabled: true,
  twitchRewardManagementEnabled: false,
  twitchRewardSyncEnabled: false,
  dashboardEnabled: false
};

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
    mode: 'backend_skeleton',
    config: {
      busEnabled: config.busEnabled !== false,
      busSelfTestEnabled: config.busSelfTestEnabled !== false,
      twitchRewardManagementEnabled: config.twitchRewardManagementEnabled === true,
      twitchRewardSyncEnabled: config.twitchRewardSyncEnabled === true,
      dashboardEnabled: config.dashboardEnabled === true
    },
    twitch: {
      rewardManagementImplemented: false,
      rewardSyncImplemented: false,
      redemptionHandlingImplemented: false,
      writeActionsEnabled: false,
      requiredManageScope: 'channel:manage:redemptions',
      requiredReadScope: 'channel:read:redemptions',
      note: 'STEP489 is a safe skeleton only. Twitch reward reads/writes are planned for later steps.'
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
    rewardCount: 0,
    redemptionCount: 0,
    queueSize: 0,
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
      purpose: 'STEP489 bus receive smoke test'
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
      'channelpoints.test.ping'
    ],
    meta: {
      routePrefix: ROUTE_PREFIX,
      skeleton: true,
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
  registerAtCommunicationBus,
  heartbeatBus,
  publishStatus
};
