'use strict';

/**
 * Communication Bus Status/Test/Replay/Watchdog API + WS client registration.
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
  version: '0.8.1',
  coreName: 'communication_core',
  coreVersion: '0.3.0',
  description: 'Communication Bus API, WebSocket client registration, controlled replay, watchdog diagnostics, alert mirror tests and real alert mirror transport and shared bus access'
};

const DEFAULT_CONFIG = {
  enabled: true,
  testEndpointEnabled: true,
  testAlertEndpointEnabled: true,
  mirrorAlertEndpointEnabled: true,
  ackEndpointEnabled: true,
  issueEndpointEnabled: true,
  replayEndpointEnabled: true,
  watchdogEndpointEnabled: true,
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

function addWatchdogEntry(list, key, message, level, details = {}) {
  list.push({
    key,
    message,
    level: cleanString(level, 'warn'),
    details
  });
}

function analyzeWatchdog(status = {}, options = {}) {
  const clients = Array.isArray(status.clients) ? status.clients : [];
  const events = Array.isArray(status.events) ? status.events : [];
  const issues = [];
  const recovered = [];
  const targetClientId = cleanString(options.clientId || '');
  const includeRecovered = options.includeRecovered === true;

  if (clients.length === 0) {
    addWatchdogEntry(issues, 'communication_no_clients', 'Communication Bus has no registered clients.', 'warn', {
      clientCount: 0
    });
  }

  const connectedClients = clients.filter(client => client && client.connected === true);
  if (clients.length > 0 && connectedClients.length === 0) {
    addWatchdogEntry(issues, 'communication_no_connected_clients', 'Communication Bus has registered clients but none are currently connected.', 'warn', {
      clientCount: clients.length,
      connectedCount: connectedClients.length
    });
  }

  for (const client of clients) {
    if (!client || client.connected === true) continue;
    addWatchdogEntry(issues, `communication_client_offline_${client.id || 'unknown'}`, `Communication client is offline: ${client.id || 'unknown'}`, 'warn', {
      clientId: client.id || '',
      type: client.type || '',
      module: client.module || '',
      status: client.status || '',
      disconnectedAt: client.disconnectedAt || '',
      disconnectReason: client.disconnectReason || ''
    });
  }

  if (targetClientId && !clients.some(client => client && client.id === targetClientId)) {
    addWatchdogEntry(issues, `communication_replay_target_missing_${targetClientId}`, `Replay/watchdog target client is not registered: ${targetClientId}`, 'warn', {
      clientId: targetClientId
    });
  }

  for (const event of events) {
    if (!event || !event.id) continue;

    const deliveredTo = Array.isArray(event.deliveredTo) ? event.deliveredTo : [];
    const ackCount = Number(event.ackCount || 0);
    const hasAck = ackCount > 0;
    const wasDeliveredDirectly = deliveredTo.length > 0;
    const recoveredByAck = !wasDeliveredDirectly && hasAck;

    if (!wasDeliveredDirectly && !hasAck) {
      addWatchdogEntry(issues, `communication_event_not_delivered_${event.id}`, `Communication event was not delivered to any client: ${event.id}`, 'warn', {
        eventId: event.id,
        channel: event.channel || '',
        action: event.action || '',
        target: event.target || {},
        replayable: event.replayable === true,
        requireAck: event.requireAck === true,
        ackCount,
        expiresAt: event.expiresAt || ''
      });
    }

    if (event.requireAck === true && !hasAck) {
      addWatchdogEntry(issues, `communication_ack_missing_${event.id}`, `Communication event still has no ACK: ${event.id}`, 'warn', {
        eventId: event.id,
        channel: event.channel || '',
        action: event.action || '',
        deliveredTo,
        replayable: event.replayable === true,
        ackCount,
        expiresAt: event.expiresAt || ''
      });
    }

    if (event.expired === true && event.requireAck === true && !hasAck) {
      addWatchdogEntry(issues, `communication_event_expired_without_ack_${event.id}`, `Communication event expired without ACK: ${event.id}`, 'error', {
        eventId: event.id,
        channel: event.channel || '',
        action: event.action || '',
        deliveredTo,
        expiresAt: event.expiresAt || ''
      });
    }

    if (includeRecovered && recoveredByAck) {
      addWatchdogEntry(recovered, `communication_event_recovered_${event.id}`, `Communication event recovered by later ACK: ${event.id}`, 'info', {
        eventId: event.id,
        channel: event.channel || '',
        action: event.action || '',
        deliveredTo,
        ackCount,
        lastAckAt: event.lastAckAt || '',
        replayable: event.replayable === true,
        requireAck: event.requireAck === true,
        recoveryReason: 'ack_received_after_initial_no_delivery'
      });
    }
  }

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    clientCount: clients.length,
    connectedClientCount: connectedClients.length,
    eventCount: events.length,
    issueCount: issues.length,
    recoveredCount: recovered.length,
    issues,
    recovered
  };
}

function buildModuleResponse(extra = {}) {
  return {
    ok: true,
    module: MODULE_META.name,
    moduleVersion: MODULE_META.version,
    ...extra
  };
}

function init({ app }) {
  if (!app) throw new Error('communication_bus.init: app fehlt.');

  loadCommunicationConfig();
  getBus();

  app.get('/api/communication/status', (req, res) => {
    const currentBus = getBus();
    res.json(buildModuleResponse({
      coreName: MODULE_META.coreName,
      coreVersion: MODULE_META.coreVersion,
      status: currentBus.getStatus()
    }));
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

    res.json(buildModuleResponse({
      test: true,
      result
    }));
  });

  app.get('/api/communication/test-alert', (req, res) => {
    if (loadedConfig.testAlertEndpointEnabled === false || loadedConfig.testEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_test_alert_endpoint_disabled' });
    }

    const currentBus = getBus();
    const user = limitedMessage(req.query.user, 'ForrestCGN');
    const type = cleanString(req.query.type, 'bits');
    const amount = asInt(req.query.amount, 100);
    const message = limitedMessage(req.query.message, 'Alert Mirror Test');
    const durationMs = Math.max(1000, asInt(req.query.durationMs, loadedConfig.defaultAlertMirrorDurationMs || 7000));
    const replayable = boolParam(req.query.replayable, true);
    const requireAck = boolParam(req.query.requireAck, true);
    const ttlMs = Math.max(durationMs + 5000, asInt(req.query.ttlMs, loadedConfig.defaultTtlMs || 30000));

    const value = type === 'bits'
      ? `${amount} Bits`
      : amount > 0
        ? `${amount} ${type}`
        : type;

    const result = currentBus.emit({
      type: 'event',
      channel: 'visual.alert',
      action: 'play',
      source: {
        type: 'api',
        id: 'communication_bus_alert_mirror_test',
        module: 'communication_bus'
      },
      target: {
        type: cleanString(req.query.targetType, 'all'),
        id: cleanString(req.query.targetId, '*'),
        module: cleanString(req.query.targetModule, ''),
        capability: cleanString(req.query.targetCapability, '')
      },
      payload: {
        test: true,
        mirror: true,
        alert: {
          source: 'communication_test',
          provider: 'test',
          type,
          user,
          headline: user,
          title: 'Alert Mirror Test',
          value,
          amount,
          message,
          durationMs
        }
      },
      meta: {
        requireAck,
        replayable,
        ttlMs,
        preview: true,
        mirror: true,
        productionTarget: false
      }
    });

    res.json(buildModuleResponse({
      testAlert: true,
      result
    }));
  });



  app.get('/api/communication/mirror-alert', (req, res) => {
    if (loadedConfig.mirrorAlertEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_mirror_alert_endpoint_disabled' });
    }

    const currentBus = getBus();
    const provider = cleanString(req.query.provider || req.query.source, 'alert_system');
    const type = cleanString(req.query.type || req.query.type_key, 'alert');
    const user = limitedMessage(req.query.user || req.query.userDisplay || req.query.user_display, 'Alert');
    const amount = asInt(req.query.amount, 0);
    const message = limitedMessage(req.query.message, '');
    const eventUid = cleanString(req.query.eventUid || req.query.event_uid, '');
    const avatarUrl = cleanString(req.query.avatarUrl || req.query.avatar_url, '');
    const title = cleanString(req.query.title, 'Alert Mirror');
    const durationMs = Math.max(1000, asInt(req.query.durationMs, loadedConfig.defaultAlertMirrorDurationMs || 7000));
    const replayable = boolParam(req.query.replayable, true);
    const requireAck = boolParam(req.query.requireAck, true);
    const ttlMs = Math.max(durationMs + 5000, asInt(req.query.ttlMs, loadedConfig.defaultTtlMs || 60000));

    const value = cleanString(req.query.value, amount > 0 ? String(amount) : type);

    const result = currentBus.emit({
      type: 'event',
      channel: 'visual.alert',
      action: 'play',
      source: {
        type: 'module',
        id: cleanString(req.query.sourceId, 'alert_bus_mirror'),
        module: cleanString(req.query.sourceModule, 'alert_bus_mirror')
      },
      target: {
        type: cleanString(req.query.targetType, 'all'),
        id: cleanString(req.query.targetId, '*'),
        module: cleanString(req.query.targetModule, ''),
        capability: cleanString(req.query.targetCapability, '')
      },
      payload: {
        test: false,
        mirror: true,
        productionTarget: false,
        alert: {
          source: 'alert_system',
          provider,
          type,
          eventUid,
          user,
          headline: user,
          title,
          value,
          amount,
          message,
          avatarUrl,
          durationMs
        }
      },
      meta: {
        requireAck,
        replayable,
        ttlMs,
        preview: true,
        mirror: true,
        productionTarget: false,
        originalModule: 'alert_system',
        originalEventUid: eventUid
      }
    });

    res.json(buildModuleResponse({
      mirrorAlert: true,
      result
    }));
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

    res.json(buildModuleResponse({
      ack: true,
      result
    }));
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

    res.json(buildModuleResponse({
      replay: true,
      clientId,
      includeAckRequired,
      result
    }));
  });

  app.get('/api/communication/watchdog', (req, res) => {
    if (loadedConfig.watchdogEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_watchdog_endpoint_disabled' });
    }

    const currentBus = getBus();
    const track = boolParam(req.query.track, false);
    const trackRecovered = boolParam(req.query.trackRecovered, false);
    const includeRecovered = boolParam(req.query.includeRecovered, false) || trackRecovered;
    const clientId = cleanString(req.query.clientId || req.query.id);
    const throttleMs = Math.max(0, asInt(req.query.throttleMs, loadedConfig.issueThrottleMs || 60000));
    const statusBefore = currentBus.getStatus();
    const diagnosis = analyzeWatchdog(statusBefore, { clientId, includeRecovered });
    const trackedIssues = [];
    const trackedRecovered = [];

    if (track) {
      for (const issue of diagnosis.issues) {
        const result = currentBus.trackIssue(issue.key, issue.message, {
          level: issue.level || 'warn',
          throttleMs,
          details: {
            ...(issue.details || {}),
            watchdog: true,
            recovered: false,
            via: 'api',
            module: MODULE_META.name,
            moduleVersion: MODULE_META.version
          }
        });
        trackedIssues.push({
          key: issue.key,
          ok: result && result.ok === true,
          visible: result && result.visible === true,
          suppressed: result && result.issue ? result.issue.suppressed || 0 : 0,
          count: result && result.issue ? result.issue.count || 0 : 0
        });
      }
    }

    if (trackRecovered) {
      for (const item of diagnosis.recovered) {
        const result = currentBus.trackIssue(item.key, item.message, {
          level: item.level || 'info',
          throttleMs,
          details: {
            ...(item.details || {}),
            watchdog: true,
            recovered: true,
            via: 'api',
            module: MODULE_META.name,
            moduleVersion: MODULE_META.version
          }
        });
        trackedRecovered.push({
          key: item.key,
          ok: result && result.ok === true,
          visible: result && result.visible === true,
          suppressed: result && result.issue ? result.issue.suppressed || 0 : 0,
          count: result && result.issue ? result.issue.count || 0 : 0
        });
      }
    }

    res.json(buildModuleResponse({
      watchdog: true,
      tracked: track,
      trackRecovered,
      includeRecovered,
      trackedCount: trackedIssues.length,
      trackedRecoveredCount: trackedRecovered.length,
      trackedIssues,
      trackedRecovered,
      diagnosis,
      status: (track || trackRecovered) ? currentBus.getStatus() : statusBefore
    }));
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

    res.json(buildModuleResponse({
      issue: true,
      result
    }));
  });


  app.get('/api/communication/client/forget', (req, res) => {
    if (String(req.query.confirm || '') !== '1') {
      return res.status(400).json({
        ok: false,
        error: 'confirm_required',
        hint: 'Use /api/communication/client/forget?clientId=<id>&confirm=1'
      });
    }

    const clientId = cleanString(req.query.clientId || req.query.id);
    if (!clientId) {
      return res.status(400).json({ ok: false, error: 'clientId_required' });
    }

    const currentBus = getBus();
    if (!currentBus || typeof currentBus.forgetClient !== 'function') {
      return res.status(500).json({ ok: false, error: 'communication_forget_client_unavailable' });
    }

    const force = boolParam(req.query.force, false);
    const result = currentBus.forgetClient(clientId, { force });
    const status = result && result.ok === true ? 200 : (result && result.reason === 'client_is_connected' ? 409 : 404);

    res.status(status).json(buildModuleResponse({
      forgetClient: true,
      clientId,
      force,
      result,
      status: currentBus.getStatus()
    }));
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

    res.json(buildModuleResponse({
      reset: true,
      result
    }));
  });

  console.log(`[${MODULE_META.name}] v${MODULE_META.version} API routes, mirror transport and WS handler registered`);
}

module.exports = {
  MODULE_META,
  init,
  handleWsMessage,
  getBus
};
