'use strict';

/**
 * Communication Bus Settings API
 *
 * DB-basierte Config-Grundlage fuer den Event-/Communication-Bus.
 * Speichert normale Bus-Settings in der zentralen Datenbank. JSON bleibt
 * nur Seed/Fallback; das Dashboard greift ausschliesslich ueber diese API zu.
 * Produktive Bus-Flows werden in diesem STEP nicht umgebaut.
 */

const database = require('../core/database');
const routes = require('./helpers/helper_routes');

const MODULE = 'communication_bus_settings';
const VERSION = '0.1.0';
const SCHEMA_VERSION = 1;
const TABLE = 'communication_bus_settings';

const SETTING_DEFINITIONS = [
  { key: 'enabled', category: 'Basis', label: 'Bus aktiviert', type: 'boolean', defaultValue: true, editable: true, description: 'Globaler Schalter fuer den Communication Bus. Runtime-Uebernahme erfolgt nach Bus-Reload/Backend-Neustart.' },
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

function nowIso() {
  return new Date().toISOString();
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

function normalizeValue(value, definition) {
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

function ensureSchema() {
  database.ensureReady();
  database.ensureSchema(MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion !== 1) return;
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        setting_key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        value_type TEXT NOT NULL DEFAULT 'json',
        category TEXT NOT NULL DEFAULT '',
        label TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        is_editable INTEGER NOT NULL DEFAULT 1,
        is_sensitive INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT NOT NULL DEFAULT 'system'
      );
    `);
  });
}

function seedDefaults() {
  ensureSchema();
  const now = nowIso();
  for (const definition of SETTING_DEFINITIONS) {
    database.insertIgnore(TABLE, {
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

function definitionMap() {
  return new Map(SETTING_DEFINITIONS.map(item => [item.key, item]));
}

function getRows() {
  seedDefaults();
  return database.all(`SELECT * FROM ${TABLE} ORDER BY category ASC, setting_key ASC`) || [];
}

function rowToSetting(row) {
  const defs = definitionMap();
  const definition = defs.get(row.setting_key) || {};
  const rawValue = safeJsonDecode(row.value_json, definition.defaultValue ?? null);
  const value = normalizeValue(rawValue, { ...definition, type: row.value_type || definition.type });
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
  const settings = getRows().map(rowToSetting);
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

  return {
    ok: true,
    module: MODULE,
    moduleVersion: VERSION,
    schemaVersion: SCHEMA_VERSION,
    storage: 'database',
    adapter: database.getAdapter ? database.getAdapter() : 'sqlite',
    dialect: database.getDialect ? database.getDialect() : 'sqlite',
    table: TABLE,
    runtimeAppliedImmediately: false,
    runtimeApplyNote: 'Settings werden DB-basiert gespeichert. Produktive Runtime-Uebernahme erfolgt nach geplanter Bus-Config-Anbindung/Backend-Neustart.',
    settings,
    categories,
    effective
  };
}

function updateSettings(input = {}, updatedBy = 'dashboard') {
  seedDefaults();
  const defs = definitionMap();
  const settings = isPlainObject(input.settings) ? input.settings : input;
  if (!isPlainObject(settings)) throw new Error('settings_payload_required');

  const changed = [];
  const now = nowIso();

  for (const [key, rawValue] of Object.entries(settings)) {
    const definition = defs.get(key);
    if (!definition) continue;
    if (definition.editable === false) continue;
    const value = normalizeValue(rawValue, definition);
    database.updateByKey(TABLE, 'setting_key', key, {
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

  return { ok: true, changed, changedCount: changed.length, settings: buildSettingsResponse() };
}

function resetDefaults() {
  ensureSchema();
  database.exec(`DELETE FROM ${TABLE}`);
  seedDefaults();
  return buildSettingsResponse();
}

function init(ctx = {}) {
  if (!ctx.app) throw new Error(`${MODULE}.init: app fehlt.`);
  try {
    seedDefaults();
  } catch (err) {
    console.error(`[${MODULE}] DB init failed:`, err.message);
  }

  routes.registerGet(ctx.app, ['/api/communication/settings', '/api/event-bus/settings'], (req, res) => {
    try {
      res.json(buildSettingsResponse());
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE, moduleVersion: VERSION, error: err.message || String(err) });
    }
  });

  routes.registerPost(ctx.app, ['/api/communication/settings', '/api/event-bus/settings'], (req, res) => {
    try {
      const updatedBy = String(req.body?.updatedBy || req.query.updatedBy || 'dashboard').slice(0, 80);
      res.json(updateSettings(req.body || {}, updatedBy));
    } catch (err) {
      res.status(400).json({ ok: false, module: MODULE, moduleVersion: VERSION, error: err.message || String(err) });
    }
  });

  routes.registerPost(ctx.app, ['/api/communication/settings/reset-defaults', '/api/event-bus/settings/reset-defaults'], (req, res) => {
    try {
      if (String(req.query.confirm || req.body?.confirm || '') !== '1') {
        return res.status(400).json({ ok: false, error: 'confirm_required' });
      }
      res.json(resetDefaults());
    } catch (err) {
      res.status(400).json({ ok: false, module: MODULE, moduleVersion: VERSION, error: err.message || String(err) });
    }
  });

  console.log(`[${MODULE}] v${VERSION} DB settings API registered`);
  return { name: MODULE, version: VERSION };
}

module.exports = {
  init,
  buildSettingsResponse,
  updateSettings,
  resetDefaults,
  SETTING_DEFINITIONS
};
