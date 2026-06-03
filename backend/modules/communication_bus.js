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
const database = require('../core/database');

const MODULE_META = {
  name: 'communication_bus',
  version: '0.8.4',
  build: 'diagnostics-standard',
  type: 'runtime',
  category: 'communication',
  coreName: 'communication_core',
  coreVersion: '0.3.0',
  description: 'Communication Bus API with separated hello and heartbeat metadata for overlay monitoring',
  routesPrefix: ['/api/communication'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: ['communication.status', 'communication.test', 'communication.replay'],
    listens: ['ws.hello', 'ws.heartbeat', 'ws.ack']
  },
  legacy: false
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


const SETTINGS_SCHEMA_VERSION = 1;
const SETTINGS_TABLE = 'communication_bus_settings';

const SETTING_DEFINITIONS = [
  { key: 'enabled', category: 'Basis', label: 'Bus aktiviert', type: 'boolean', defaultValue: true, editable: true, description: 'Globaler Schalter fuer den Communication Bus. Runtime-Uebernahme erfolgt nach geplanter Bus-Config-Anbindung/Backend-Neustart.' },
  { key: 'wsClientRegistrationEnabled', category: 'WebSocket', label: 'WS-Client-Registrierung', type: 'boolean', defaultValue: true, editable: true, description: 'Erlaubt bus_hello/hello Registrierung von Dashboard-, Tool- und Overlay-Clients.' },
  { key: 'wsAcksEnabled', category: 'WebSocket', label: 'WS-ACKs', type: 'boolean', defaultValue: true, editable: true, description: 'Erlaubt ACK-Meldungen ueber WebSocket.' },
  { key: 'heartbeatIntervalMs', category: 'Clients', label: 'Heartbeat-Intervall ms', type: 'number', defaultValue: 5000, min: 1000, max: 60000, editable: true, description: 'Erwartetes Heartbeat-Intervall fuer Bus-Clients.' },
  { key: 'staleAfterMs', category: 'Clients', label: 'Stale nach ms', type: 'number', defaultValue: 15000, min: 1000, max: 600000, editable: true, description: 'Client gilt nach dieser Zeit ohne Kontakt als stale.' },
  { key: 'offlineAfterMs', category: 'Clients', label: 'Offline nach ms', type: 'number', defaultValue: 30000, min: 1000, max: 900000, editable: true, description: 'Client gilt nach dieser Zeit ohne Kontakt als offline.' },
  { key: 'deadAfterMs', category: 'Clients', label: 'Dead nach ms', type: 'number', defaultValue: 60000, min: 1000, max: 1800000, editable: true, description: 'Client gilt nach dieser Zeit ohne Kontakt als dead.' },
  { key: 'defaultTtlMs', category: 'Events', label: 'Event TTL ms', type: 'number', defaultValue: 15000, min: 0, max: 3600000, editable: true, description: 'Standard-Lebenszeit fuer replayable Bus-Events.' },
  { key: 'maxReplayEvents', category: 'Events', label: 'Replay Events max.', type: 'number', defaultValue: 200, min: 0, max: 5000, editable: true, description: 'Maximale Anzahl gehaltener Replay-Events im Bus-Speicher.' },
  { key: 'maxIssueEntries', category: 'Issues', label: 'Issue-Eintraege max.', type: 'number', defaultValue: 200, min: 0, max: 5000, editable: true, description: 'Maximale Anzahl gehaltener Issue-Eintraege.' },
  { key: 'issueThrottleMs', category: 'Issues', label: 'Issue-Throttle ms', type: 'number', defaultValue: 60000, min: 0, max: 3600000, editable: true, description: 'Wiederholte Issues werden innerhalb dieses Fensters zusammengefasst.' },
  { key: 'maxMessageLength', category: 'API', label: 'Max. Testnachricht', type: 'number', defaultValue: 500, min: 1, max: 5000, editable: true, description: 'Maximale Laenge fuer Test-/Diagnose-Nachrichten.' },
  { key: 'testEndpointEnabled', category: 'API', label: 'Test-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/test.' },
  { key: 'testAlertEndpointEnabled', category: 'API', label: 'Test-Alert aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/test-alert.' },
  { key: 'mirrorAlertEndpointEnabled', category: 'API', label: 'Alert-Mirror aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/mirror-alert.' },
  { key: 'ackEndpointEnabled', category: 'API', label: 'ACK-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/ack.' },
  { key: 'issueEndpointEnabled', category: 'API', label: 'Issue-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/issue.' },
  { key: 'replayEndpointEnabled', category: 'API', label: 'Replay-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/replay.' },
  { key: 'watchdogEndpointEnabled', category: 'API', label: 'Watchdog-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/watchdog.' },
  { key: 'resetEndpointEnabled', category: 'API', label: 'Reset-Endpunkt aktiv', type: 'boolean', defaultValue: true, editable: true, description: 'Schalter fuer /api/communication/reset.' },
  { key: 'monitoring.enabled', category: 'Monitoring', label: 'Monitoring aktiv', type: 'boolean', defaultValue: false, editable: true, description: 'Grundschalter fuer aktive Monitoring-Wertung.' },
  { key: 'monitoring.requireLiveOrManual', category: 'Monitoring', label: 'Live/Manual erforderlich', type: 'boolean', defaultValue: true, editable: true, description: 'Monitoring nur live oder manuell aktiv werten.' },
  { key: 'monitoring.manualEnabled', category: 'Monitoring', label: 'Manual Monitoring', type: 'boolean', defaultValue: false, editable: true, description: 'Manueller Monitoring-Schalter fuer Tests.' },
  { key: 'monitoring.testMode', category: 'Monitoring', label: 'Testmodus', type: 'boolean', defaultValue: false, editable: true, description: 'Monitoring-Testmodus ohne produktive Reparaturaktionen.' },
  { key: 'monitoring.watchWindowMs', category: 'Monitoring', label: 'Watch-Fenster ms', type: 'number', defaultValue: 30000, min: 1000, max: 3600000, editable: true, description: 'Zeitfenster fuer Monitoring-Bewertungen.' },
  { key: 'monitoring.obsRequiredForOverlayErrors', category: 'Monitoring', label: 'OBS fuer Overlay-Fehler noetig', type: 'boolean', defaultValue: true, editable: true, description: 'Overlay-Fehler nur werten, wenn OBS-Bezug spaeter vorhanden ist.' },
  { key: 'audit.enabled', category: 'Audit', label: 'Audit aktiv', type: 'boolean', defaultValue: false, editable: true, description: 'Audit-Grundschalter fuer Bus-Ereignisse.' },
  { key: 'audit.logEmit', category: 'Audit', label: 'Emit loggen', type: 'boolean', defaultValue: false, editable: true, description: 'Bus-Emits auditieren.' },
  { key: 'audit.logAck', category: 'Audit', label: 'ACK loggen', type: 'boolean', defaultValue: false, editable: true, description: 'ACKs auditieren.' },
  { key: 'audit.logIssues', category: 'Audit', label: 'Issues loggen', type: 'boolean', defaultValue: true, editable: true, description: 'Bus-Issues auditieren.' },
  { key: 'audit.logPayload', category: 'Audit', label: 'Payload loggen', type: 'boolean', defaultValue: false, editable: true, description: 'Payloads auditieren. Nur mit Vorsicht aktivieren.' }
];

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
  const incomingMeta = data.meta && typeof data.meta === 'object' ? data.meta : {};
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
      ...incomingMeta,
      via: 'websocket',
      helloType: cleanString(data.type, 'hello'),
      lastHelloPayloadAt: new Date().toISOString()
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
    mode: cleanString(data.mode || ''),
    hostId: cleanString(data.hostId || data.host_id || ''),
    module: cleanString(data.module || ''),
    name: cleanString(data.name || ''),
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : undefined,
    version: cleanString(data.version || ''),
    lastError: cleanString(data.lastError || ''),
    meta: data.meta && typeof data.meta === 'object' ? data.meta : {}
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


function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function safeJsonDecode(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function safeJsonEncode(value) {
  return JSON.stringify(value ?? null);
}

function normalizeBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  const clean = String(value ?? '').trim().toLowerCase();
  if (['true', 'yes', 'ja', 'on', 'y'].includes(clean)) return true;
  if (['false', 'no', 'nein', 'off', 'n'].includes(clean)) return false;
  return fallback;
}

function normalizeNumber(value, definition) {
  const fallback = Number(definition.defaultValue ?? 0);
  const n = Number(value);
  const raw = Number.isFinite(n) ? Math.round(n) : fallback;
  const min = Number.isFinite(Number(definition.min)) ? Number(definition.min) : raw;
  const max = Number.isFinite(Number(definition.max)) ? Number(definition.max) : raw;
  return Math.max(min, Math.min(max, raw));
}

function normalizeSettingValue(value, definition) {
  if (definition.type === 'boolean') return normalizeBool(value, definition.defaultValue === true);
  if (definition.type === 'number') return normalizeNumber(value, definition);
  return String(value ?? definition.defaultValue ?? '');
}

function setPath(target, path, value) {
  const parts = String(path || '').split('.').filter(Boolean);
  if (!parts.length) return target;
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (!isPlainObject(node[part])) node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
  return target;
}

function shortTextTypeSql() {
  return database.isMysqlFamilyDialect && database.isMysqlFamilyDialect() ? 'VARCHAR(191)' : database.textTypeSql();
}

function mediumTextTypeSql() {
  return database.isMysqlFamilyDialect && database.isMysqlFamilyDialect() ? 'VARCHAR(255)' : database.textTypeSql();
}

function ensureSettingsSchema() {
  database.ensureReady();
  database.ensureSchema('communication_bus_settings', SETTINGS_SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion !== 1) return;
    const table = database.quoteIdentifier(SETTINGS_TABLE);
    const keyText = shortTextTypeSql();
    const text = mediumTextTypeSql();
    const longText = database.textTypeSql({ long: true });
    const boolType = database.boolTypeSql();
    const dateType = database.dateTimeTypeSql();
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${table} (
        setting_key ${keyText} PRIMARY KEY,
        value_json ${longText} NOT NULL,
        value_type ${text} NOT NULL DEFAULT 'json',
        category ${text} NOT NULL DEFAULT '',
        label ${text} NOT NULL DEFAULT '',
        description ${longText} NOT NULL DEFAULT '',
        is_editable ${boolType} NOT NULL DEFAULT 1,
        is_sensitive ${boolType} NOT NULL DEFAULT 0,
        created_at ${dateType} NOT NULL,
        updated_at ${dateType} NOT NULL,
        updated_by ${text} NOT NULL DEFAULT 'system'
      );
    `);
  });
}

function seedSettingsDefaults() {
  ensureSettingsSchema();
  const now = new Date().toISOString();
  for (const definition of SETTING_DEFINITIONS) {
    database.insertIgnore(SETTINGS_TABLE, {
      setting_key: definition.key,
      value_json: safeJsonEncode(definition.defaultValue),
      value_type: definition.type || 'json',
      category: definition.category || 'Allgemein',
      label: definition.label || definition.key,
      description: definition.description || '',
      is_editable: definition.editable === false ? 0 : 1,
      is_sensitive: definition.sensitive === true ? 1 : 0,
      created_at: now,
      updated_at: now,
      updated_by: 'seed'
    });
  }
}

function settingsDefinitionMap() {
  return new Map(SETTING_DEFINITIONS.map(item => [item.key, item]));
}

function getSettingsRows() {
  seedSettingsDefaults();
  return database.all(`SELECT * FROM ${database.quoteIdentifier(SETTINGS_TABLE)} ORDER BY ${database.quoteIdentifier('category')} ASC, ${database.quoteIdentifier('setting_key')} ASC`) || [];
}

function rowToSetting(row) {
  const defs = settingsDefinitionMap();
  const definition = defs.get(row.setting_key) || {};
  const rawValue = safeJsonDecode(row.value_json, definition.defaultValue ?? null);
  const value = normalizeSettingValue(rawValue, { ...definition, type: row.value_type || definition.type });
  return {
    key: row.setting_key,
    value,
    type: row.value_type || definition.type || 'json',
    category: row.category || definition.category || 'Allgemein',
    label: row.label || definition.label || row.setting_key,
    description: row.description || definition.description || '',
    editable: Number(row.is_editable) === 1,
    sensitive: Number(row.is_sensitive) === 1,
    defaultValue: definition.defaultValue,
    min: definition.min,
    max: definition.max,
    updatedAt: row.updated_at || '',
    updatedBy: row.updated_by || ''
  };
}

function buildSettingsResponse() {
  const settings = getSettingsRows().map(rowToSetting);
  const categories = [];
  const categoryMap = new Map();
  const effective = {};

  for (const setting of settings) {
    if (!categoryMap.has(setting.category)) {
      const item = { name: setting.category, settings: [] };
      categoryMap.set(setting.category, item);
      categories.push(item);
    }
    categoryMap.get(setting.category).settings.push(setting);
    setPath(effective, setting.key, setting.value);
  }

  return buildModuleResponse({
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    storage: 'database',
    adapter: database.getAdapter ? database.getAdapter() : 'sqlite',
    dialect: database.getDialect ? database.getDialect() : 'sqlite',
    table: SETTINGS_TABLE,
    runtimeAppliedImmediately: false,
    runtimeApplyNote: 'Settings werden DB-basiert gespeichert. Produktive Runtime-Uebernahme erfolgt nach geplanter Bus-Config-Anbindung/Backend-Neustart.',
    settings,
    categories,
    effective
  });
}

function updateSettings(input = {}, updatedBy = 'dashboard') {
  seedSettingsDefaults();
  const defs = settingsDefinitionMap();
  const settings = isPlainObject(input.settings) ? input.settings : input;
  if (!isPlainObject(settings)) throw new Error('settings_payload_required');

  const changed = [];
  const now = new Date().toISOString();

  for (const [key, rawValue] of Object.entries(settings)) {
    const definition = defs.get(key);
    if (!definition) continue;
    if (definition.editable === false) continue;
    const value = normalizeSettingValue(rawValue, definition);
    database.updateByKey(SETTINGS_TABLE, 'setting_key', key, {
      value_json: safeJsonEncode(value),
      value_type: definition.type || 'json',
      category: definition.category || 'Allgemein',
      label: definition.label || key,
      description: definition.description || '',
      is_editable: definition.editable === false ? 0 : 1,
      is_sensitive: definition.sensitive === true ? 1 : 0,
      updated_at: now,
      updated_by: updatedBy
    });
    changed.push(key);
  }

  return buildModuleResponse({
    changed,
    changedCount: changed.length,
    settings: buildSettingsResponse()
  });
}

function resetSettingsDefaults() {
  ensureSettingsSchema();
  database.exec(`DELETE FROM ${database.quoteIdentifier(SETTINGS_TABLE)}`);
  seedSettingsDefaults();
  return buildSettingsResponse();
}


function publicCommunicationRoutes() {
  return [
    { method: 'GET', path: '/api/communication/status', description: 'Communication-Bus Status.' },
    { method: 'GET', path: '/api/communication/settings', description: 'Communication-Bus Einstellungen.' },
    { method: 'GET', path: '/api/event-bus/settings', description: 'Legacy-Alias fuer Einstellungen.' },
    { method: 'POST', path: '/api/communication/settings', description: 'Communication-Bus Einstellungen speichern.' },
    { method: 'POST', path: '/api/event-bus/settings', description: 'Legacy-Alias fuer Einstellungen speichern.' },
    { method: 'POST', path: '/api/communication/settings/reset-defaults', description: 'Communication-Bus Einstellungen zuruecksetzen.' },
    { method: 'POST', path: '/api/event-bus/settings/reset-defaults', description: 'Legacy-Alias fuer Einstellungen zuruecksetzen.' },
    { method: 'GET', path: '/api/communication/test', description: 'Diagnose-Testevent ueber den Bus.' },
    { method: 'GET', path: '/api/communication/test-alert', description: 'Diagnose-Testalert ueber den Bus.' },
    { method: 'GET', path: '/api/communication/mirror-alert', description: 'Alert-Mirror Diagnose/Transport.' },
    { method: 'GET', path: '/api/communication/ack', description: 'ACK-Diagnoseroute.' },
    { method: 'GET', path: '/api/communication/replay', description: 'Replay-Diagnoseroute fuer Clients.' },
    { method: 'GET', path: '/api/communication/watchdog', description: 'Watchdog-Diagnose.' },
    { method: 'GET', path: '/api/communication/issue', description: 'Issue-Diagnoseroute.' },
    { method: 'GET', path: '/api/communication/client/forget', description: 'Manuelles Entfernen eines Bus-Clients mit Confirm.' },
    { method: 'GET', path: '/api/communication/test-vip-overlay-preview', description: 'VIP-Overlay Preview-Diagnose ueber den Bus.' },
    { method: 'GET', path: '/api/communication/test-vip-overlay', description: 'VIP-Overlay Shadow-Test ueber den Bus.' },
    { method: 'GET', path: '/api/communication/reset', description: 'Communication-Bus Reset mit Confirm.' }
  ];
}

function safeCountTableRows(tableName) {
  try {
    if (!database || typeof database.get !== 'function') return { ok: false, count: 0, error: 'database_unavailable' };
    const table = typeof database.quoteIdentifier === 'function' ? database.quoteIdentifier(tableName) : tableName;
    const row = database.get(`SELECT COUNT(*) AS count FROM ${table}`) || {};
    return { ok: true, count: Number(row.count || 0), error: '' };
  } catch (err) {
    return { ok: false, count: 0, error: err && err.message ? err.message : String(err) };
  }
}

function buildStandardDiagnostics(busStatus = null, routeList = null) {
  const status = busStatus && typeof busStatus === 'object' ? busStatus : (getBus() && typeof getBus().getStatus === 'function' ? getBus().getStatus() : null);
  const routes = Array.isArray(routeList) ? routeList : publicCommunicationRoutes();
  const settingsRows = safeCountTableRows(SETTINGS_TABLE);
  const stats = status && status.stats && typeof status.stats === 'object' ? status.stats : {};
  const clients = status && Array.isArray(status.clients) ? status.clients : [];
  const events = status && Array.isArray(status.events) ? status.events : [];
  const issues = status && Array.isArray(status.issues) ? status.issues : [];
  const subscriptions = status && Array.isArray(status.subscriptions) ? status.subscriptions : [];
  const warnings = [];
  const errors = [];

  if (!status || status.ok === false) errors.push('communication_bus_status_unavailable');
  if (status && status.enabled === false) warnings.push('communication_bus_disabled');
  if (!settingsRows.ok) warnings.push(settingsRows.error || 'communication_settings_table_unavailable');
  if (Number(stats.dropped || 0) > 0) warnings.push('communication_bus_has_dropped_events');
  if (Number(stats.subscriberErrors || 0) > 0) warnings.push('communication_bus_has_subscriber_errors');
  if (Number(stats.auditErrors || 0) > 0) warnings.push('communication_bus_has_audit_errors');
  if (issues.some(issue => String(issue.level || '').toLowerCase() === 'error')) errors.push('communication_bus_has_error_issues');

  const ok = errors.length === 0;
  const health = ok ? (warnings.length ? 'warn' : 'ok') : 'error';

  return {
    ok,
    health,
    module: MODULE_META.name,
    version: MODULE_META.version,
    build: MODULE_META.build,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    schemaReady: settingsRows.ok,
    coreName: MODULE_META.coreName,
    coreVersion: MODULE_META.coreVersion,
    database: {
      ok: settingsRows.ok,
      adapter: typeof database.getAdapter === 'function' ? database.getAdapter() : 'sqlite',
      path: typeof database.getDbPath === 'function' ? (database.getDbPath() || '') : '',
      schemaVersion: typeof database.getSchemaVersion === 'function' ? (settingsRows.ok ? database.getSchemaVersion('communication_bus_settings') : 0) : SETTINGS_SCHEMA_VERSION,
      expectedSchemaVersion: SETTINGS_SCHEMA_VERSION,
      table: SETTINGS_TABLE,
      error: settingsRows.error || ''
    },
    counts: {
      clients: clients.length,
      connectedClients: clients.filter(client => client && client.connected === true).length,
      disconnectedClients: clients.filter(client => !client || client.connected !== true).length,
      overlayClients: clients.filter(client => String(client.type || '').toLowerCase() === 'overlay' || String(client.id || '').toLowerCase().startsWith('overlay:')).length,
      clientsWithHeartbeat: clients.filter(client => client && client.hasHeartbeat === true).length,
      events: events.length,
      replayableEvents: events.filter(event => event && event.replayable === true).length,
      ackRequiredEvents: events.filter(event => event && event.requireAck === true).length,
      issues: issues.length,
      errorIssues: issues.filter(issue => String(issue.level || '').toLowerCase() === 'error').length,
      subscriptions: subscriptions.length,
      settingsRows: settingsRows.count,
      settingDefinitions: SETTING_DEFINITIONS.length,
      routes: routes.length,
      emitted: Number(stats.emitted || 0),
      delivered: Number(stats.delivered || 0),
      acks: Number(stats.acks || 0),
      replays: Number(stats.replays || 0),
      dropped: Number(stats.dropped || 0),
      subscriberDeliveries: Number(stats.subscriberDeliveries || 0),
      subscriberErrors: Number(stats.subscriberErrors || 0),
      auditWrites: Number(stats.auditWrites || 0),
      auditSkipped: Number(stats.auditSkipped || 0),
      auditErrors: Number(stats.auditErrors || 0)
    },
    state: {
      enabled: status ? status.enabled !== false : false,
      bus: status ? cleanString(status.bus) : '',
      busVersion: status ? status.version : '',
      phase: status && status.enabled !== false ? 'running' : 'disabled',
      createdAt: status ? cleanString(status.createdAt) : '',
      now: status ? cleanString(status.now) : '',
      securityAvailable: !!(status && status.hooks && status.hooks.securityAvailable === true),
      securityEnabled: !!(status && status.hooks && status.hooks.securityEnabled === true),
      auditAvailable: !!(status && status.hooks && status.hooks.auditAvailable === true),
      auditEnabled: !!(status && status.hooks && status.hooks.auditEnabled === true),
      wsClientRegistrationEnabled: loadedConfig ? loadedConfig.wsClientRegistrationEnabled !== false : true,
      wsAcksEnabled: loadedConfig ? loadedConfig.wsAcksEnabled !== false : true
    },
    warnings,
    errors,
    lastError: errors[0] || warnings[0] || ''
  };
}

function buildModuleResponse(extra = {}) {
  return {
    ok: true,
    module: MODULE_META.name,
    moduleVersion: MODULE_META.version,
    moduleBuild: MODULE_META.build,
    ...extra
  };
}

function init({ app }) {
  if (!app) throw new Error('communication_bus.init: app fehlt.');

  loadCommunicationConfig();
  getBus();
  try { seedSettingsDefaults(); } catch (err) { console.error(`[${MODULE_META.name}] settings DB init failed:`, err.message); }

  app.get('/api/communication/status', (req, res) => {
    const currentBus = getBus();
    const status = currentBus.getStatus();
    const routeList = publicCommunicationRoutes();
    res.json(buildModuleResponse({
      version: MODULE_META.version,
      diagnosticVersion: MODULE_META.version,
      coreName: MODULE_META.coreName,
      coreVersion: MODULE_META.coreVersion,
      enabled: status.enabled !== false,
      bus: status.bus,
      busVersion: status.version,
      routes: routeList,
      routeCount: routeList.length,
      dataEndpoints: {
        status: '/api/communication/status',
        settings: '/api/communication/settings',
        test: '/api/communication/test',
        watchdog: '/api/communication/watchdog',
        replay: '/api/communication/replay',
        issues: '/api/communication/issue',
        reset: '/api/communication/reset'
      },
      diagnostics: buildStandardDiagnostics(status, routeList),
      status
    }));
  });


  app.get(['/api/communication/settings', '/api/event-bus/settings'], (req, res) => {
    try {
      res.json(buildSettingsResponse());
    } catch (err) {
      res.status(500).json(buildModuleResponse({ error: err.message || String(err) }));
    }
  });

  app.post(['/api/communication/settings', '/api/event-bus/settings'], (req, res) => {
    try {
      const updatedBy = String(req.body?.updatedBy || req.query.updatedBy || 'dashboard').slice(0, 80);
      res.json(updateSettings(req.body || {}, updatedBy));
    } catch (err) {
      res.status(400).json(buildModuleResponse({ error: err.message || String(err) }));
    }
  });

  app.post(['/api/communication/settings/reset-defaults', '/api/event-bus/settings/reset-defaults'], (req, res) => {
    try {
      if (String(req.query.confirm || req.body?.confirm || '') !== '1') {
        return res.status(400).json(buildModuleResponse({ error: 'confirm_required' }));
      }
      res.json(resetSettingsDefaults());
    } catch (err) {
      res.status(400).json(buildModuleResponse({ error: err.message || String(err) }));
    }
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



  app.get('/api/communication/test-vip-overlay-preview', (req, res) => {
    const currentBus = getBus();
    if (!currentBus || typeof currentBus.emit !== 'function') {
      return res.status(500).json({ ok: false, error: 'communication_bus_unavailable' });
    }

    const action = cleanString(req.query.action || 'show').toLowerCase();
    if (!['show', 'hide', 'update'].includes(action)) {
      return res.status(400).json({ ok: false, error: 'invalid_action', allowed: ['show', 'hide', 'update'] });
    }

    const displayName = cleanString(req.query.displayName || req.query.user || 'STEP403_VIP_Preview');
    const durationRaw = Number.parseInt(String(req.query.durationMs || '5000'), 10);
    const durationMs = Math.max(1000, Math.min(30000, Number.isFinite(durationRaw) ? durationRaw : 5000));
    const requestId = cleanString(req.query.requestId || ('step403-vip-preview-' + Date.now()));
    const requireAck = boolParam(req.query.requireAck, true);
    const replayable = boolParam(req.query.replayable, true);

    const result = currentBus.emit({
      type: 'event',
      channel: 'vip.overlay',
      action,
      source: { type: 'diagnostic', id: 'STEP403', module: 'vip_sound_overlay' },
      target: { type: 'module', module: 'vip_sound_overlay', capability: 'vip.overlay.' + action },
      payload: {
        test: true,
        previewOnly: true,
        step: 403,
        requestId,
        displayName,
        user: displayName,
        title: cleanString(req.query.title || 'VIP EVENT-BUS PREVIEW'),
        text: cleanString(req.query.text || 'Preview-Test ueber vip.overlay.show/hide.'),
        avatarUrl: cleanString(req.query.avatarUrl || ''),
        type: cleanString(req.query.type || 'bus-preview'),
        durationMs,
        emittedAt: new Date().toISOString()
      },
      meta: {
        module: 'vip_sound_overlay',
        step: 403,
        previewOnly: true,
        requireAck,
        replayable,
        ttlMs: durationMs + 8000
      }
    });

    return res.json(buildModuleResponse({
      testVipOverlayPreview: true,
      previewOnly: true,
      action,
      result,
      status: currentBus.getStatus()
    }));
  });

  app.get('/api/communication/test-vip-overlay', (req, res) => {
    const currentBus = getBus();
    if (!currentBus || typeof currentBus.emit !== 'function') {
      return res.status(500).json({ ok: false, error: 'communication_bus_unavailable' });
    }

    const displayName = cleanString(req.query.displayName || req.query.user || 'STEP401_VIP_Test');
    const durationRaw = Number.parseInt(String(req.query.durationMs || '5000'), 10);
    const durationMs = Math.max(1000, Math.min(30000, Number.isFinite(durationRaw) ? durationRaw : 5000));
    const requestId = cleanString(req.query.requestId || ('step401-vip-' + Date.now()));
    const requireAck = boolParam(req.query.requireAck, true);
    const replayable = boolParam(req.query.replayable, true);

    const result = currentBus.emit({
      type: 'event',
      channel: 'vip.overlay',
      action: 'test',
      source: { type: 'diagnostic', id: 'STEP401', module: 'vip_sound_overlay' },
      target: { type: 'module', module: 'vip_sound_overlay', capability: 'vip.overlay.test' },
      payload: {
        test: true,
        shadowOnly: true,
        step: 401,
        requestId,
        displayName,
        user: displayName,
        title: cleanString(req.query.title || 'VIP Event-Bus Shadow Test'),
        text: cleanString(req.query.text || 'Shadow-Test: Empfang/Ack ohne Anzeige-Umbau.'),
        avatarUrl: cleanString(req.query.avatarUrl || ''),
        durationMs,
        emittedAt: new Date().toISOString()
      },
      meta: {
        module: 'vip_sound_overlay',
        step: 401,
        shadowOnly: true,
        requireAck,
        replayable,
        ttlMs: durationMs + 5000
      }
    });

    return res.json(buildModuleResponse({
      testVipOverlay: true,
      shadowOnly: true,
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
  MODULE_VERSION: MODULE_META.version,
  version: MODULE_META.version,
  init,
  handleWsMessage,
  getBus,
  buildSettingsResponse,
  updateSettings,
  resetSettingsDefaults
};
