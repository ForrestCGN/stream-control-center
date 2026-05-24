'use strict';

/**
 * STEP278N - Communication Bus Status/Test/Replay API + WS client registration.
 *
 * This module exposes the prepared communication bus as test/status API and
 * handles optional WebSocket hello/heartbeat/ack messages.
 *
 * It does not migrate alert/sound/TTS/VIP traffic and does not replace
 * server.js broadcastWS.
 */

const helperConfig = require('./helpers/helper_config');
const { createCommunicationBus } = require('./helpers/helper_communication');
const security = require('./helpers/helper_security_context');

const MODULE_META = {
  name: 'communication_bus',
  version: '0.4.0',
  build: 'STEP278N',
  coreName: 'communication_core',
  coreVersion: '0.3.0',
  description: 'Communication Bus API, WebSocket client registration and controlled replay test route'
};

const DEFAULT_CONFIG = {
  enabled: true,
  testEndpointEnabled: true,
  ackEndpointEnabled: true,
  issueEndpointEnabled: true,
  replayEndpointEnabled: true,
  resetEndpointEnabled: true,
  wsClientRegistrationEnabled: true,
  wsAcksEnabled: true,
  maxMessageLength: 500
};

let loadedConfig = null;
let bus = null;

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function asInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
}

function loadCommunicationConfig() {
  const loaded = helperConfig.loadConfig('communication_bus.json', {}, { createIfMissing: false });
  loadedConfig = {
    ...DEFAULT_CONFIG,
    ...(loaded && loaded.data && typeof loaded.data === 'object' ? loaded.data : {})
  };
  return loadedConfig;
}

function getBus() {
  if (!bus) {
    const config = loadCommunicationConfig();
    bus = createCommunicationBus({
      config,
      security
    });
  }
  return bus;
}

function limitedMessage(value, fallback = 'Communication bus test event') {
  const max = Math.max(1, asInt(loadedConfig && loadedConfig.maxMessageLength, 500));
  return cleanString(value, fallback).slice(0, max);
}

function parseWsMessage(rawMessage) {
  if (rawMessage === undefined || rawMessage === null) return null;

  let text = rawMessage;
  if (Buffer.isBuffer(rawMessage)) text = rawMessage.toString('utf8');
  if (typeof text !== 'string') text = String(text);

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

function sendWsJson(ws, payload) {
  if (!ws || typeof ws.send !== 'function') return false;

  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch (_) {
    return false;
  }
}

function normalizeHelloPayload(data = {}) {
  const clientId = cleanString(data.clientId || data.id || data.name || data.client?.id, 'ws_client');
  const clientType = cleanString(data.clientType || data.typeName || data.client?.type, 'unknown');
  return {
    id: clientId,
    clientId,
    type: clientType,
    mode: cleanString(data.mode || data.client?.mode, 'standalone'),
    hostId: cleanString(data.hostId || data.host_id || data.client?.hostId, ''),
    module: cleanString(data.module || data.moduleId || data.client?.module, ''),
    name: cleanString(data.name || data.clientName || data.client?.name, clientId),
    version: cleanString(data.version || data.client?.version, ''),
    capabilities: toArray(data.capabilities || data.client?.capabilities),
    meta: {
      via: 'websocket',
      helloType: cleanString(data.type, 'hello')
    }
  };
}

function handleHello(ws, data) {
  const currentBus = getBus();
  const clientInfo = normalizeHelloPayload(data);
  const client = currentBus.registerClient(ws, clientInfo);

  sendWsJson(ws, {
    type: 'hello_ack',
    ok: true,
    bus: currentBus.getStatus().bus,
    clientId: client.id,
    client
  });

  return {
    handled: true,
    ok: true,
    action: 'hello',
    client
  };
}

function handleHeartbeat(ws, data) {
  const currentBus = getBus();
  const clientId = cleanString(data.clientId || data.id || ws._cgnBusClientId);
  const result = currentBus.heartbeat(clientId, {
    id: clientId,
    type: cleanString(data.clientType || data.typeName || ''),
    module: cleanString(data.module || ''),
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : undefined,
    version: cleanString(data.version || '')
  });

  sendWsJson(ws, {
    type: 'heartbeat_ack',
    ok: result.ok === true,
    clientId,
    client: result.client || null,
    reason: result.reason || ''
  });

  return {
    handled: true,
    ok: result.ok === true,
    action: 'heartbeat',
    result
  };
}

function handleAck(ws, data) {
  if (loadedConfig.wsAcksEnabled === false) {
    sendWsJson(ws, {
      type: 'ack_ack',
      ok: false,
      error: 'ws_acks_disabled'
    });
    return { handled: true, ok: false, action: 'ack', reason: 'ws_acks_disabled' };
  }

  const currentBus = getBus();
  const eventId = cleanString(data.eventId || data.id);
  const clientId = cleanString(data.clientId || ws._cgnBusClientId, 'ws_client');
  const status = cleanString(data.status, 'received');
  const result = currentBus.ack(eventId, clientId, status, {
    via: 'websocket',
    details: data.details || {}
  });

  sendWsJson(ws, {
    type: 'ack_ack',
    ok: result.ok === true,
    eventId,
    clientId,
    status,
    reason: result.reason || ''
  });

  return {
    handled: true,
    ok: result.ok === true,
    action: 'ack',
    result
  };
}

function handleWsMessage({ ws, rawMessage }) {
  if (loadedConfig === null) loadCommunicationConfig();
  if (loadedConfig.wsClientRegistrationEnabled === false) return { handled: false, reason: 'ws_client_registration_disabled' };

  const data = parseWsMessage(rawMessage);
  if (!data) return { handled: false, reason: 'not_json' };

  const type = cleanString(data.type || data.op || data.kind).toLowerCase();
  if (!type) return { handled: false, reason: 'type_missing' };

  if (type === 'hello' || type === 'bus_hello' || type === 'communication_hello') {
    return handleHello(ws, data);
  }

  if (type === 'heartbeat' || type === 'bus_heartbeat' || type === 'ping') {
    return handleHeartbeat(ws, data);
  }

  if (type === 'ack' || type === 'bus_ack' || type === 'communication_ack') {
    return handleAck(ws, data);
  }

  return { handled: false, reason: 'unknown_type', type };
}

function init({ app }) {
  if (!app) throw new Error('communication_bus.init: app fehlt.');

  loadCommunicationConfig();
  getBus();

  app.get('/api/communication/status', (req, res) => {
    const currentBus = getBus();
    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      coreName: MODULE_META.coreName,
      coreVersion: MODULE_META.coreVersion,
      step: MODULE_META.build,
      status: currentBus.getStatus()
    });
  });

  app.get('/api/communication/test', (req, res) => {
    if (loadedConfig.testEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_test_endpoint_disabled' });
    }

    const currentBus = getBus();
    const channel = cleanString(req.query.channel, 'test');
    const action = cleanString(req.query.action, 'ping');
    const message = limitedMessage(req.query.message, 'Communication bus test event');
    const requireAck = boolParam(req.query.requireAck, true);
    const replayable = boolParam(req.query.replayable, true);
    const ttlMs = Math.max(0, asInt(req.query.ttlMs, loadedConfig.defaultTtlMs || 15000));

    const result = currentBus.emit({
      type: 'event',
      channel,
      action,
      source: {
        type: 'api',
        id: 'communication_bus_api',
        module: 'communication_bus'
      },
      target: {
        type: cleanString(req.query.targetType, 'all'),
        id: cleanString(req.query.targetId, '*'),
        module: cleanString(req.query.targetModule, ''),
        capability: cleanString(req.query.targetCapability, '')
      },
      payload: {
        message,
        test: true,
        query: {
          channel,
          action,
          requireAck,
          replayable,
          ttlMs
        }
      },
      meta: {
        requireAck,
        replayable,
        ttlMs,
        preview: true,
        productionTarget: false
      }
    });

    res.json({
      ok: result.ok === true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      test: true,
      result
    });
  });

  app.get('/api/communication/ack', (req, res) => {
    if (loadedConfig.ackEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_ack_endpoint_disabled' });
    }

    const eventId = cleanString(req.query.eventId || req.query.id);
    const clientId = cleanString(req.query.clientId, 'test_client');
    const status = cleanString(req.query.status, 'received');

    if (!eventId) {
      return res.status(400).json({
        ok: false,
        error: 'eventId_required'
      });
    }

    const currentBus = getBus();
    const result = currentBus.ack(eventId, clientId, status, {
      test: true,
      via: 'api',
      message: limitedMessage(req.query.message, 'Ack test')
    });

    res.json({
      ok: result.ok === true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      ack: true,
      result
    });
  });

  app.get('/api/communication/replay', (req, res) => {
    if (loadedConfig.replayEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_replay_endpoint_disabled' });
    }

    const clientId = cleanString(req.query.clientId || req.query.id);
    if (!clientId) {
      return res.status(400).json({
        ok: false,
        error: 'clientId_required'
      });
    }

    const includeAckRequired = boolParam(req.query.includeAckRequired, true);
    const currentBus = getBus();
    const result = currentBus.replayForClient(clientId, {
      includeAckRequired
    });

    res.json({
      ok: result.ok === true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      replay: true,
      clientId,
      includeAckRequired,
      result
    });
  });

  app.get('/api/communication/issue', (req, res) => {
    if (loadedConfig.issueEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_issue_endpoint_disabled' });
    }

    const key = cleanString(req.query.key, 'test_issue');
    const message = limitedMessage(req.query.message, 'Communication bus test issue');
    const level = cleanString(req.query.level, 'warn');
    const throttleMs = Math.max(0, asInt(req.query.throttleMs, loadedConfig.issueThrottleMs || 60000));

    const currentBus = getBus();
    const result = currentBus.trackIssue(key, message, {
      level,
      throttleMs,
      details: {
        test: true,
        via: 'api'
      }
    });

    res.json({
      ok: result.ok === true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      issue: true,
      result
    });
  });

  app.get('/api/communication/reset', (req, res) => {
    if (loadedConfig.resetEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_reset_endpoint_disabled' });
    }

    if (String(req.query.confirm || '') !== '1') {
      return res.status(400).json({
        ok: false,
        error: 'confirm_required',
        hint: 'Use /api/communication/reset?confirm=1'
      });
    }

    const currentBus = getBus();
    const result = currentBus.reset({
      clients: boolParam(req.query.clients, false),
      events: true,
      issues: true
    });

    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      reset: true,
      result
    });
  });

  console.log(`[${MODULE_META.name}] v${MODULE_META.version} / ${MODULE_META.build} API routes and WS handler registered`);
}

module.exports = {
  MODULE_META,
  init,
  handleWsMessage
};
