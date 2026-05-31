'use strict';

/**
 * Overlay Monitor
 *
 * Read-only Fachmodul fuer Overlay-Clients auf Basis des vorhandenen
 * Communication Bus. Dieses Modul baut keine eigene WebSocket-Registry,
 * aendert keine OBS-Quellen und refresht keine Browserquellen.
 */

let routes = null;
let helperConfig = null;
let communicationBusModule = null;
let database = null;

try { routes = require('./helpers/helper_routes'); } catch (_) { routes = null; }
try { helperConfig = require('./helpers/helper_config'); } catch (_) { helperConfig = null; }
try { communicationBusModule = require('./communication_bus'); } catch (_) { communicationBusModule = null; }
try { database = require('../core/database'); } catch (_) { database = null; }

const MODULE = 'overlay_monitor';
const VERSION = '0.1.4';
const STATUS_API_VERSION = '1.0.4';

const ISSUE_TABLE = 'monitoring_issues';
const ISSUE_SCHEMA_VERSION = 1;

const DEFAULT_CONFIG = {
  enabled: true,
  readOnly: true,
  monitorIntervalMs: 5000,
  maxEvents: 100,
  publishStatusToBus: true,
  publishStatusEveryMs: 15000,
  emitStatusChangesToBus: true,
  overlayClientType: 'overlay',
  thresholds: {
    staleAfterMs: 15000,
    offlineAfterMs: 30000,
    deadAfterMs: 60000
  },
  logging: {
    consoleEnabled: true,
    seenConsole: false,
    suppressOnlineStaleConsole: true,
    statusChangeThrottleMs: 60000,
    alwaysLogStatuses: ['offline', 'dead'],
    alwaysLogTypes: ['overlay_missing']
  }
};

const state = {
  loadedAt: new Date().toISOString(),
  lastScanAt: '',
  lastPublishAtMs: 0,
  scanTimer: null,
  lastStatuses: new Map(),
  consoleLogThrottle: new Map(),
  events: [],
  stats: {
    scans: 0,
    statusChanges: 0,
    busErrors: 0,
    consoleLogsSuppressed: 0,
    issueDbErrors: 0,
    issuesActivated: 0,
    issuesResolved: 0,
    issuesTouched: 0,
    lastError: ''
  }
};

let config = { ...DEFAULT_CONFIG };
let busModuleRegistered = false;

function nowMs() { return Date.now(); }
function nowIso() { return new Date().toISOString(); }

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function asInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function safeJson(value) {
  try { return JSON.parse(JSON.stringify(value ?? null)); }
  catch (_) { return null; }
}

function mergeConfig(base, override) {
  const result = { ...base };
  if (!isPlainObject(override)) return result;

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeConfig(result[key], value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
}

function loadConfig() {
  let loaded = null;
  if (helperConfig && typeof helperConfig.loadConfig === 'function') {
    try {
      loaded = helperConfig.loadConfig('overlay_monitor.json', {}, { createIfMissing: false });
    } catch (_) {
      loaded = null;
    }
  }

  const loadedData = loaded && loaded.data && typeof loaded.data === 'object' ? loaded.data : {};
  config = mergeConfig(DEFAULT_CONFIG, loadedData);

  config.monitorIntervalMs = Math.max(1000, asInt(config.monitorIntervalMs, DEFAULT_CONFIG.monitorIntervalMs));
  config.maxEvents = Math.max(10, asInt(config.maxEvents, DEFAULT_CONFIG.maxEvents));
  config.publishStatusEveryMs = Math.max(5000, asInt(config.publishStatusEveryMs, DEFAULT_CONFIG.publishStatusEveryMs));

  config.thresholds = mergeConfig(DEFAULT_CONFIG.thresholds, isPlainObject(config.thresholds) ? config.thresholds : {});
  config.thresholds.staleAfterMs = Math.max(1000, asInt(config.thresholds.staleAfterMs, DEFAULT_CONFIG.thresholds.staleAfterMs));
  config.thresholds.offlineAfterMs = Math.max(config.thresholds.staleAfterMs, asInt(config.thresholds.offlineAfterMs, DEFAULT_CONFIG.thresholds.offlineAfterMs));
  config.thresholds.deadAfterMs = Math.max(config.thresholds.offlineAfterMs, asInt(config.thresholds.deadAfterMs, DEFAULT_CONFIG.thresholds.deadAfterMs));

  config.logging = mergeConfig(DEFAULT_CONFIG.logging, isPlainObject(config.logging) ? config.logging : {});
  config.logging.statusChangeThrottleMs = Math.max(0, asInt(config.logging.statusChangeThrottleMs, DEFAULT_CONFIG.logging.statusChangeThrottleMs));
  config.logging.alwaysLogStatuses = toStringArray(config.logging.alwaysLogStatuses).map(item => item.toLowerCase());
  config.logging.alwaysLogTypes = toStringArray(config.logging.alwaysLogTypes);

  return config;
}

function getBus() {
  if (!communicationBusModule || typeof communicationBusModule.getBus !== 'function') return null;
  try { return communicationBusModule.getBus(); }
  catch (err) {
    state.stats.busErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return null;
  }
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}


function issueDbAvailable() {
  return !!database && typeof database.ensureReady === 'function';
}

function ensureIssueSchema() {
  if (!issueDbAvailable()) return { ok: false, reason: 'database_unavailable' };
  try {
    database.ensureReady();
    database.ensureSchema(MODULE + '_issues', ISSUE_SCHEMA_VERSION, () => {
      database.exec(`
        CREATE TABLE IF NOT EXISTS ${ISSUE_TABLE} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          issue_key TEXT NOT NULL,
          scope TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_name TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL,
          first_seen_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          resolved_at TEXT,
          seen_count INTEGER NOT NULL DEFAULT 1,
          message TEXT NOT NULL,
          resolved_message TEXT,
          details_json TEXT
        )
      `);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_monitoring_issues_status ON ${ISSUE_TABLE} (status)`);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_monitoring_issues_key_status ON ${ISSUE_TABLE} (issue_key, status)`);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_monitoring_issues_scope_status ON ${ISSUE_TABLE} (scope, status)`);
    });
    return { ok: true };
  } catch (err) {
    state.stats.issueDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: 'issue_schema_failed', error: state.stats.lastError };
  }
}

function encodeIssueDetails(details) {
  try { return JSON.stringify(details || {}); }
  catch (_) { return '{}'; }
}

function decodeIssueDetails(value) {
  if (!value) return {};
  try { return JSON.parse(String(value)); }
  catch (_) { return {}; }
}

function normalizeIssueRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    issueKey: cleanString(row.issue_key),
    scope: cleanString(row.scope),
    targetType: cleanString(row.target_type),
    targetName: cleanString(row.target_name),
    severity: cleanString(row.severity),
    status: cleanString(row.status),
    firstSeenAt: cleanString(row.first_seen_at),
    lastSeenAt: cleanString(row.last_seen_at),
    resolvedAt: cleanString(row.resolved_at),
    seenCount: Number(row.seen_count || 0),
    message: cleanString(row.message),
    resolvedMessage: cleanString(row.resolved_message),
    details: decodeIssueDetails(row.details_json)
  };
}

function listStoredIssues(options = {}) {
  const schema = ensureIssueSchema();
  if (!schema.ok) return { ok: false, reason: schema.reason, error: schema.error || '', issues: [], summary: { active: 0, resolved: 0, total: 0 } };

  const status = cleanString(options.status, 'active').toLowerCase();
  const limit = Math.max(1, Math.min(500, asInt(options.limit, 100)));
  const params = { limit };
  let where = '';
  if (status === 'active' || status === 'resolved') {
    where = 'WHERE status = :status';
    params.status = status;
  }

  try {
    const rows = database.all(`
      SELECT *
      FROM ${ISSUE_TABLE}
      ${where}
      ORDER BY
        CASE WHEN status = 'active' THEN 0 ELSE 1 END ASC,
        COALESCE(last_seen_at, first_seen_at) DESC,
        id DESC
      LIMIT :limit
    `, params) || [];
    const counts = database.get(`
      SELECT
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
        COUNT(*) AS total
      FROM ${ISSUE_TABLE}
    `) || {};
    return {
      ok: true,
      module: MODULE,
      version: VERSION,
      table: ISSUE_TABLE,
      status,
      issues: rows.map(normalizeIssueRow).filter(Boolean),
      summary: {
        active: Number(counts.active || 0),
        resolved: Number(counts.resolved || 0),
        total: Number(counts.total || 0)
      }
    };
  } catch (err) {
    state.stats.issueDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: 'issue_query_failed', error: state.stats.lastError, issues: [], summary: { active: 0, resolved: 0, total: 0 } };
  }
}

function issueFromRuntimeIssue(issue) {
  const overlayId = cleanString(issue.overlayId || issue.clientId || issue.key, 'overlay');
  const status = cleanString(issue.status || 'problem').toLowerCase();
  return {
    issueKey: cleanString(issue.key || `overlay_${status}_${overlayId.replace(/[^a-zA-Z0-9_.:-]/g, '_')}`),
    scope: 'overlay_monitor',
    targetType: 'overlay_client',
    targetName: overlayId,
    severity: cleanString(issue.level, status === 'registered' || status === 'stale' ? 'warn' : 'error'),
    message: cleanString(issue.message, `Overlay ${overlayId}: ${status}`),
    details: safeJson(issue) || {}
  };
}

function touchIssue(runtimeIssue, seenAt) {
  const schema = ensureIssueSchema();
  if (!schema.ok) return;
  const issue = issueFromRuntimeIssue(runtimeIssue);
  try {
    const active = database.get(`
      SELECT id, seen_count
      FROM ${ISSUE_TABLE}
      WHERE issue_key = :issueKey AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
    `, { issueKey: issue.issueKey });

    if (active) {
      database.run(`
        UPDATE ${ISSUE_TABLE}
        SET last_seen_at = :lastSeenAt,
            seen_count = :seenCount,
            severity = :severity,
            message = :message,
            details_json = :detailsJson
        WHERE id = :id
      `, {
        id: active.id,
        lastSeenAt: seenAt,
        seenCount: Number(active.seen_count || 0) + 1,
        severity: issue.severity,
        message: issue.message,
        detailsJson: encodeIssueDetails(issue.details)
      });
      state.stats.issuesTouched += 1;
      return;
    }

    database.run(`
      INSERT INTO ${ISSUE_TABLE} (
        issue_key, scope, target_type, target_name, severity, status,
        first_seen_at, last_seen_at, resolved_at, seen_count,
        message, resolved_message, details_json
      ) VALUES (
        :issueKey, :scope, :targetType, :targetName, :severity, 'active',
        :firstSeenAt, :lastSeenAt, NULL, 1,
        :message, '', :detailsJson
      )
    `, {
      issueKey: issue.issueKey,
      scope: issue.scope,
      targetType: issue.targetType,
      targetName: issue.targetName,
      severity: issue.severity,
      firstSeenAt: seenAt,
      lastSeenAt: seenAt,
      message: issue.message,
      detailsJson: encodeIssueDetails(issue.details)
    });
    state.stats.issuesActivated += 1;
    pushEvent(issue.severity === 'error' ? 'error' : 'warn', 'monitoring_issue_active', issue.message, { issueKey: issue.issueKey, targetName: issue.targetName });
  } catch (err) {
    state.stats.issueDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
  }
}

function resolveInactiveIssues(activeKeys, resolvedAt) {
  const schema = ensureIssueSchema();
  if (!schema.ok) return;
  try {
    const activeRows = database.all(`
      SELECT id, issue_key, target_name
      FROM ${ISSUE_TABLE}
      WHERE scope = 'overlay_monitor' AND status = 'active'
    `) || [];
    for (const row of activeRows) {
      if (activeKeys.has(row.issue_key)) continue;
      const resolvedMessage = `Problem behoben: ${row.target_name || row.issue_key}`;
      database.run(`
        UPDATE ${ISSUE_TABLE}
        SET status = 'resolved',
            resolved_at = :resolvedAt,
            last_seen_at = :resolvedAt,
            resolved_message = :resolvedMessage
        WHERE id = :id
      `, { id: row.id, resolvedAt, resolvedMessage });
      state.stats.issuesResolved += 1;
      pushEvent('info', 'monitoring_issue_resolved', resolvedMessage, { issueKey: row.issue_key, targetName: row.target_name });
    }
  } catch (err) {
    state.stats.issueDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
  }
}

function syncMonitoringIssues(runtimeIssues) {
  if (!Array.isArray(runtimeIssues)) return;
  const seenAt = nowIso();
  const activeKeys = new Set();
  for (const runtimeIssue of runtimeIssues) {
    const issue = issueFromRuntimeIssue(runtimeIssue);
    if (!issue.issueKey) continue;
    activeKeys.add(issue.issueKey);
    touchIssue(runtimeIssue, seenAt);
  }
  resolveInactiveIssues(activeKeys, seenAt);
}

function shouldWriteConsole(entry) {
  const logging = config.logging || {};
  if (logging.consoleEnabled === false) return false;

  if (entry.level === 'error') return true;
  if ((logging.alwaysLogTypes || []).includes(entry.type)) return true;

  const details = isPlainObject(entry.details) ? entry.details : {};
  const status = cleanString(details.status).toLowerCase();
  const previousStatus = cleanString(details.previousStatus).toLowerCase();

  if ((logging.alwaysLogStatuses || []).includes(status)) return true;

  if (entry.type === 'overlay_seen' && logging.seenConsole !== true) return false;

  if (entry.type === 'overlay_status_changed' && logging.suppressOnlineStaleConsole !== false) {
    const pair = [previousStatus, status].sort().join(':');
    if (pair === 'online:stale') return false;
  }

  if (entry.type === 'overlay_status_changed') {
    const throttleMs = Math.max(0, asInt(logging.statusChangeThrottleMs, 0));
    if (throttleMs > 0) {
      const overlayId = cleanString(details.overlayId, 'unknown');
      const key = `${entry.type}:${overlayId}:${previousStatus}->${status}`;
      const current = nowMs();
      const last = state.consoleLogThrottle.get(key) || 0;
      if (current - last < throttleMs) return false;
      state.consoleLogThrottle.set(key, current);
    }
  }

  return true;
}

function writeConsole(entry) {
  if (!shouldWriteConsole(entry)) {
    state.stats.consoleLogsSuppressed += 1;
    return;
  }

  const logMessage = `[${MODULE}] ${entry.type}: ${entry.message}`;
  if (entry.level === 'error') console.error(logMessage);
  else if (entry.level === 'warn') console.warn(logMessage);
  else console.log(logMessage);
}

function pushEvent(level, type, message, details = {}) {
  const entry = {
    at: nowIso(),
    level: cleanString(level, 'info'),
    type: cleanString(type, 'event'),
    message: cleanString(message, 'Overlay monitor event'),
    details: safeJson(details) || {}
  };

  state.events.unshift(entry);
  if (state.events.length > config.maxEvents) state.events.length = config.maxEvents;

  writeConsole(entry);
  return entry;
}

function parseTimeMs(value) {
  const time = Date.parse(String(value || ''));
  return Number.isFinite(time) ? time : 0;
}

function getClientLastSeenMs(client) {
  return Math.max(
    parseTimeMs(client.lastHeartbeatAt),
    parseTimeMs(client.lastHelloAt),
    parseTimeMs(client.lastSeenAt),
    parseTimeMs(client.connectedAt),
    parseTimeMs(client.registeredAt)
  );
}

function deriveOverlayStatus(client, currentMs) {
  const heartbeatMs = parseTimeMs(client.lastHeartbeatAt);
  const helloMs = parseTimeMs(client.lastHelloAt);
  const lastMs = getClientLastSeenMs(client);
  const ageMs = heartbeatMs > 0 ? currentMs - heartbeatMs : (lastMs > 0 ? currentMs - lastMs : Number.MAX_SAFE_INTEGER);
  const heartbeatAgeMs = heartbeatMs > 0 ? currentMs - heartbeatMs : null;
  const helloAgeMs = helloMs > 0 ? currentMs - helloMs : null;
  const connected = client.connected === true;
  const hasHeartbeat = heartbeatMs > 0;

  if (!connected) return { status: 'offline', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
  if (!hasHeartbeat) return { status: 'registered', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
  if (heartbeatAgeMs >= config.thresholds.deadAfterMs) return { status: 'dead', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
  if (heartbeatAgeMs >= config.thresholds.offlineAfterMs) return { status: 'offline', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
  if (heartbeatAgeMs >= config.thresholds.staleAfterMs) return { status: 'stale', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
  return { status: 'online', ageMs, heartbeatAgeMs, helloAgeMs, lastMs, heartbeatMs, helloMs, hasHeartbeat };
}

function isOverlayClient(client) {
  if (!client) return false;
  const type = cleanString(client.type).toLowerCase();
  const id = cleanString(client.id).toLowerCase();
  const mode = cleanString(client.mode).toLowerCase();
  const configuredType = cleanString(config.overlayClientType, 'overlay').toLowerCase();

  return type === configuredType || type === 'overlay' || id.startsWith('overlay:') || mode === 'overlay';
}

function normalizeOverlayClient(client, currentMs) {
  const derived = deriveOverlayStatus(client, currentMs);
  const ageSeconds = Number.isFinite(derived.ageMs) ? Math.max(0, Math.round(derived.ageMs / 1000)) : null;
  const heartbeatAgeSeconds = Number.isFinite(derived.heartbeatAgeMs) ? Math.max(0, Math.round(derived.heartbeatAgeMs / 1000)) : null;
  const helloAgeSeconds = Number.isFinite(derived.helloAgeMs) ? Math.max(0, Math.round(derived.helloAgeMs / 1000)) : null;

  return {
    id: cleanString(client.id),
    type: cleanString(client.type),
    mode: cleanString(client.mode),
    hostId: cleanString(client.hostId),
    module: cleanString(client.module),
    name: cleanString(client.name || client.id),
    version: cleanString(client.version),
    capabilities: Array.isArray(client.capabilities) ? client.capabilities.map(String) : [],
    connected: client.connected === true,
    busStatus: cleanString(client.status),
    status: derived.status,
    ageMs: Number.isFinite(derived.ageMs) ? derived.ageMs : null,
    ageSeconds,
    hasHeartbeat: derived.hasHeartbeat === true,
    heartbeatAgeMs: Number.isFinite(derived.heartbeatAgeMs) ? derived.heartbeatAgeMs : null,
    heartbeatAgeSeconds,
    helloAgeMs: Number.isFinite(derived.helloAgeMs) ? derived.helloAgeMs : null,
    helloAgeSeconds,
    heartbeatCount: Number.isFinite(Number(client.heartbeatCount)) ? Number(client.heartbeatCount) : 0,
    registeredAt: cleanString(client.registeredAt),
    connectedAt: cleanString(client.connectedAt),
    disconnectedAt: cleanString(client.disconnectedAt),
    lastHelloAt: cleanString(client.lastHelloAt),
    lastHeartbeatAt: cleanString(client.lastHeartbeatAt),
    lastSeenAt: cleanString(client.lastSeenAt),
    lastAckAt: cleanString(client.lastAckAt),
    lastErrorAt: cleanString(client.lastErrorAt),
    disconnectReason: cleanString(client.disconnectReason),
    meta: isPlainObject(client.meta) ? safeJson(client.meta) || {} : {}
  };
}

function buildSummary(overlays) {
  const summary = {
    total: overlays.length,
    online: 0,
    registered: 0,
    stale: 0,
    offline: 0,
    dead: 0,
    withHeartbeat: 0,
    withoutHeartbeat: 0,
    connected: 0,
    disconnected: 0,
    withErrors: 0
  };

  for (const overlay of overlays) {
    if (Object.prototype.hasOwnProperty.call(summary, overlay.status)) summary[overlay.status] += 1;
    if (overlay.connected) summary.connected += 1;
    else summary.disconnected += 1;
    if (overlay.hasHeartbeat) summary.withHeartbeat += 1;
    else summary.withoutHeartbeat += 1;
    if (overlay.lastErrorAt || overlay.disconnectReason) summary.withErrors += 1;
  }

  summary.status = summary.dead > 0 || summary.offline > 0 ? 'error' : (summary.stale > 0 || summary.withoutHeartbeat > 0 || summary.withErrors > 0 ? 'warning' : 'ok');
  return summary;
}

function buildIssues(overlays) {
  const issues = [];
  for (const overlay of overlays) {
    if (overlay.status === 'online') continue;
    const level = overlay.status === 'stale' || overlay.status === 'registered' ? 'warn' : 'error';
    issues.push({
      key: `overlay_${overlay.status}_${overlay.id.replace(/[^a-zA-Z0-9_.:-]/g, '_')}`,
      level,
      overlayId: overlay.id,
      status: overlay.status,
      message: overlay.status === 'registered' ? `Overlay ${overlay.id} ist nur angemeldet, aber ohne echten Heartbeat.` : `Overlay ${overlay.id} ist ${overlay.status}.`,
      ageSeconds: overlay.ageSeconds,
      hasHeartbeat: overlay.hasHeartbeat,
      lastHelloAt: overlay.lastHelloAt,
      lastHeartbeatAt: overlay.lastHeartbeatAt,
      connected: overlay.connected,
      disconnectReason: overlay.disconnectReason
    });
  }
  return issues;
}

function getOverlayStatus(options = {}) {
  const bus = getBus();
  const currentMs = nowMs();
  let busStatus = null;
  let clients = [];

  if (bus && typeof bus.getStatus === 'function') {
    busStatus = bus.getStatus();
    clients = Array.isArray(busStatus.clients) ? busStatus.clients : [];
  }

  const overlays = clients
    .filter(isOverlayClient)
    .map(client => normalizeOverlayClient(client, currentMs))
    .sort((a, b) => a.id.localeCompare(b.id));

  const summary = buildSummary(overlays);
  const issues = buildIssues(overlays);

  return {
    ok: !issues.some(issue => issue.level === 'error'),
    module: MODULE,
    version: VERSION,
    statusApiVersion: STATUS_API_VERSION,
    feature: 'overlay_monitor_read_only',
    readOnly: true,
    overlayTouched: false,
    obsTouched: false,
    refreshTouched: false,
    fetchedAt: nowIso(),
    loadedAt: state.loadedAt,
    lastScanAt: state.lastScanAt,
    communication: {
      available: !!bus,
      ok: !!(busStatus && busStatus.ok !== false),
      bus: busStatus ? busStatus.bus : '',
      version: busStatus ? busStatus.version : '',
      clientCount: clients.length
    },
    config: options.includeConfig ? safeJson(config) || {} : {
      monitorIntervalMs: config.monitorIntervalMs,
      thresholds: safeJson(config.thresholds) || {},
      logging: safeJson(config.logging) || {},
      publishStatusToBus: config.publishStatusToBus === true,
      emitStatusChangesToBus: config.emitStatusChangesToBus === true
    },
    summary,
    overlays,
    issues,
    recentEvents: state.events.slice(0, options.limitEvents || 20),
    stats: { ...state.stats }
  };
}

function emitBusEvent(channel, action, payload, options = {}) {
  const bus = getBus();
  if (!bus || typeof bus.emit !== 'function') return { ok: false, reason: 'bus_unavailable' };

  try {
    return bus.emit({
      type: 'event',
      channel,
      action,
      source: { type: 'module', id: `module:${MODULE}`, module: MODULE },
      target: options.target || { type: 'all', id: '*', module: '', capability: '' },
      payload: safeJson(payload) || {},
      meta: {
        requireAck: options.requireAck === true,
        replayable: options.replayable !== false,
        ttlMs: Number.isFinite(Number(options.ttlMs)) ? Number(options.ttlMs) : 15000
      }
    });
  } catch (err) {
    state.stats.busErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: 'bus_emit_failed', error: state.stats.lastError };
  }
}

function publishModuleHeartbeat() {
  const bus = getBus();
  if (!bus || typeof bus.heartbeatModule !== 'function') return;
  try {
    bus.heartbeatModule(MODULE, {
      module: MODULE,
      name: 'Overlay Monitor',
      version: VERSION,
      capabilities: ['overlay.monitor.status', 'overlay.monitor.events']
    });
  } catch (err) {
    state.stats.busErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
  }
}

function maybePublishStatus(status) {
  if (config.publishStatusToBus !== true) return;
  const current = nowMs();
  if (current - state.lastPublishAtMs < config.publishStatusEveryMs) return;
  state.lastPublishAtMs = current;

  const bus = getBus();
  if (bus && typeof bus.publishModuleStatus === 'function') {
    try {
      bus.publishModuleStatus(MODULE, {
        module: MODULE,
        version: VERSION,
        summary: status.summary,
        issueCount: status.issues.length,
        overlayCount: status.overlays.length,
        readOnly: true,
        at: nowIso()
      }, {
        channel: 'overlay.monitor',
        action: 'status',
        replayable: true,
        requireAck: false,
        ttlMs: Math.max(config.publishStatusEveryMs * 2, 15000)
      });
    } catch (err) {
      state.stats.busErrors += 1;
      state.stats.lastError = err && err.message ? err.message : String(err);
    }
  }
}

function processStatusChanges(status) {
  const seen = new Set();

  for (const overlay of status.overlays) {
    seen.add(overlay.id);
    const previous = state.lastStatuses.get(overlay.id);
    if (!previous) {
      state.lastStatuses.set(overlay.id, overlay.status);
      pushEvent('info', 'overlay_seen', `Overlay erkannt: ${overlay.id} (${overlay.status})`, { overlay });
      if (config.emitStatusChangesToBus === true) {
        emitBusEvent('overlay.monitor', 'seen', { overlay }, { replayable: true, requireAck: false });
      }
      continue;
    }

    if (previous !== overlay.status) {
      state.stats.statusChanges += 1;
      state.lastStatuses.set(overlay.id, overlay.status);
      const level = overlay.status === 'online' ? 'info' : (overlay.status === 'stale' ? 'warn' : 'error');
      pushEvent(level, 'overlay_status_changed', `Overlay ${overlay.id}: ${previous} -> ${overlay.status}`, {
        overlayId: overlay.id,
        previousStatus: previous,
        status: overlay.status,
        overlay
      });
      if (config.emitStatusChangesToBus === true) {
        emitBusEvent('overlay.monitor', 'status_changed', {
          overlayId: overlay.id,
          previousStatus: previous,
          status: overlay.status,
          overlay
        }, { replayable: true, requireAck: false });
      }
    }
  }

  for (const [id, previous] of [...state.lastStatuses.entries()]) {
    if (seen.has(id)) continue;
    state.stats.statusChanges += 1;
    state.lastStatuses.delete(id);
    pushEvent('warn', 'overlay_missing', `Overlay nicht mehr im Bus-Status: ${id}`, {
      overlayId: id,
      previousStatus: previous
    });
    if (config.emitStatusChangesToBus === true) {
      emitBusEvent('overlay.monitor', 'missing', { overlayId: id, previousStatus: previous }, { replayable: true, requireAck: false });
    }
  }
}

function scan() {
  if (config.enabled === false) return null;
  state.lastScanAt = nowIso();
  state.stats.scans += 1;
  publishModuleHeartbeat();
  const status = getOverlayStatus({ limitEvents: 10 });
  processStatusChanges(status);
  syncMonitoringIssues(status.issues);
  maybePublishStatus(status);
  return status;
}

function startTimer() {
  if (state.scanTimer) clearInterval(state.scanTimer);
  state.scanTimer = setInterval(scan, config.monitorIntervalMs);
  if (state.scanTimer && typeof state.scanTimer.unref === 'function') state.scanTimer.unref();
}

function init({ app }) {
  if (!app) throw new Error(`${MODULE}.init: app fehlt.`);

  loadConfig();
  ensureIssueSchema();

  const bus = getBus();
  if (bus && typeof bus.registerModule === 'function' && !busModuleRegistered) {
    try {
      bus.registerModule({
        module: MODULE,
        name: 'Overlay Monitor',
        version: VERSION,
        capabilities: ['overlay.monitor.status', 'overlay.monitor.events'],
        meta: { readOnly: true, obsTouched: false, overlayTouched: false }
      });
      busModuleRegistered = true;
    } catch (err) {
      state.stats.busErrors += 1;
      state.stats.lastError = err && err.message ? err.message : String(err);
    }
  }

  registerGet(app, '/api/overlay-monitor/status', (req, res) => {
    const includeConfig = String(req.query.config || '') === '1';
    const limitEvents = Math.max(0, Math.min(100, asInt(req.query.events, 20)));
    const status = getOverlayStatus({ includeConfig, limitEvents });
    res.json(status);
  });

  registerGet(app, '/api/overlay-monitor/issues', (req, res) => {
    const status = cleanString(req.query.status || 'all', 'all').toLowerCase();
    const limit = Math.max(1, Math.min(500, asInt(req.query.limit, 100)));
    const result = listStoredIssues({ status, limit });
    res.json(result);
  });

  registerGet(app, '/api/overlay-monitor/events', (req, res) => {
    const limit = Math.max(1, Math.min(100, asInt(req.query.limit, 50)));
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      readOnly: true,
      events: state.events.slice(0, limit),
      stats: { ...state.stats }
    });
  });

  registerGet(app, '/api/overlay-monitor/routes', (req, res) => {
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      readOnly: true,
      routes: [
        { method: 'GET', path: '/api/overlay-monitor/status', description: 'Read-only Overlay-Monitor Status aus dem Communication Bus.' },
        { method: 'GET', path: '/api/overlay-monitor/events', description: 'Read-only Statuswechsel/Auffaelligkeiten des Overlay-Monitors.' },
        { method: 'GET', path: '/api/overlay-monitor/issues', description: 'Persistierte Monitoring-Issues mit active/resolved Status.' },
        { method: 'GET', path: '/api/overlay-monitor/routes', description: 'Routenuebersicht.' }
      ]
    });
  });

  scan();
  startTimer();
  console.log(`[${MODULE}] v${VERSION} read-only overlay monitor registered`);
}

module.exports = {
  init,
  getOverlayStatus,
  scan,
  listStoredIssues
};
