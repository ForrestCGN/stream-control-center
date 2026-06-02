'use strict';

/**
 * Overlay Monitor
 *
 * Read-only Fachmodul fuer Overlay-Clients auf Basis des vorhandenen
 * Communication Bus. Dieses Modul baut keine eigene WebSocket-Registry,
 * fuehrt OBS-Reparaturaktionen nur manuell aus und refresht Browserquellen nicht automatisch.
 */

let routes = null;
let helperConfig = null;
let communicationBusModule = null;
let database = null;
let obsSharedModule = null;

try { routes = require('./helpers/helper_routes'); } catch (_) { routes = null; }
try { helperConfig = require('./helpers/helper_config'); } catch (_) { helperConfig = null; }
try { communicationBusModule = require('./communication_bus'); } catch (_) { communicationBusModule = null; }
try { database = require('../core/database'); } catch (_) { database = null; }
try { obsSharedModule = require('./obs_shared'); } catch (_) { obsSharedModule = null; }

const MODULE = 'overlay_monitor';
const VERSION = '0.1.8';
const MODULE_VERSION = VERSION;
const STATUS_API_VERSION = '1.0.8';

const MODULE_META = {
  name: MODULE,
  version: VERSION,
  build: 'CAN-26.2',
  type: 'runtime',
  category: 'diagnostics',
  description: 'Read-only Overlay-Monitor mit robuster Scene-Awareness-Diagnose, OBS-Inventar und manuellen Reparaturaktionen.',
  routesPrefix: ['/api/overlay-monitor'],
  bus: {
    registered: true,
    heartbeat: true,
    emits: ['overlay_monitor.status', 'overlay_monitor.issue'],
    listens: ['communication.clients']
  },
  legacy: false
};

const ISSUE_TABLE = 'monitoring_issues';
const ISSUE_SCHEMA_VERSION = 1;
const INVENTORY_TABLE = 'monitoring_obs_inventory_cache';
const INVENTORY_SCHEMA_VERSION = 1;

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
  obsInventory: null,
  obsInventoryRefreshing: false,
  stats: {
    scans: 0,
    statusChanges: 0,
    busErrors: 0,
    consoleLogsSuppressed: 0,
    issueDbErrors: 0,
    inventoryDbErrors: 0,
    inventoryRefreshes: 0,
    inventoryCacheHits: 0,
    obsRepairActions: 0,
    issuesActivated: 0,
    issuesResolved: 0,
    issuesTouched: 0,
    lastError: ''
  }
};

let config = { ...DEFAULT_CONFIG };
let busModuleRegistered = false;
let sharedObs = null;

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

function registerPost(app, routePath, handler) {
  if (routes && typeof routes.registerPost === 'function') {
    routes.registerPost(app, routePath, handler);
    return;
  }
  app.post(routePath, handler);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
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


function getSharedObsInstance(env = {}) {
  if (!obsSharedModule || typeof obsSharedModule.getSharedObs !== 'function') return null;
  if (!sharedObs) {
    try { sharedObs = obsSharedModule.getSharedObs(env || process.env || {}, console); }
    catch (err) {
      state.stats.lastError = err && err.message ? err.message : String(err);
      return null;
    }
  }
  return sharedObs;
}

function ensureInventorySchema() {
  if (!issueDbAvailable()) return { ok: false, reason: 'database_unavailable' };
  try {
    database.ensureReady();
    database.ensureSchema(MODULE + '_obs_inventory', INVENTORY_SCHEMA_VERSION, () => {
      database.exec(`
        CREATE TABLE IF NOT EXISTS ${INVENTORY_TABLE} (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          updated_at TEXT NOT NULL,
          data_json TEXT NOT NULL
        )
      `);
    });
    return { ok: true };
  } catch (err) {
    state.stats.inventoryDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: 'inventory_schema_failed', error: state.stats.lastError };
  }
}

function saveInventoryCache(inventory) {
  const schema = ensureInventorySchema();
  if (!schema.ok) return;
  try {
    database.run(`
      INSERT INTO ${INVENTORY_TABLE} (id, updated_at, data_json)
      VALUES (1, :updatedAt, :dataJson)
      ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at, data_json = excluded.data_json
    `, { updatedAt: cleanString(inventory.updatedAt || nowIso()), dataJson: encodeIssueDetails(inventory) });
  } catch (err) {
    state.stats.inventoryDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
  }
}

function loadInventoryCache() {
  const schema = ensureInventorySchema();
  if (!schema.ok) return null;
  try {
    const row = database.get(`SELECT updated_at, data_json FROM ${INVENTORY_TABLE} WHERE id = 1 LIMIT 1`) || null;
    if (!row || !row.data_json) return null;
    const data = decodeIssueDetails(row.data_json);
    if (!data || typeof data !== 'object') return null;
    data.fromCache = true;
    data.cacheUpdatedAt = cleanString(row.updated_at || data.updatedAt);
    state.stats.inventoryCacheHits += 1;
    return normalizeInventoryStatuses(data);
  } catch (err) {
    state.stats.inventoryDbErrors += 1;
    state.stats.lastError = err && err.message ? err.message : String(err);
    return null;
  }
}

function normalizeObsList(raw, keys) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const data = raw.data && typeof raw.data === 'object' ? raw.data : raw;
  if (Array.isArray(data)) return data;
  for (const itemKey of keys) {
    if (Array.isArray(data[itemKey])) return data[itemKey];
  }
  return [];
}

function inventoryKey(value) {
  return cleanString(value).toLowerCase().replace(/\.html?$/i, '').replace(/[^a-z0-9]+/g, '');
}

function inventoryBasename(value) {
  const text = cleanString(value).split('?')[0].replace(/\\/g, '/');
  return text.split('/').filter(Boolean).pop() || text;
}

function inventorySourceUrl(src) {
  return cleanString(src.url || src.local_file || src.file || src.path || src.inputSettings?.url || src.inputSettings?.local_file || '');
}

function inventoryHost(url) {
  const value = cleanString(url);
  if (!value) return '';
  try {
    const parsed = new URL(value, 'http://localhost');
    return cleanString(parsed.hostname).toLowerCase();
  } catch (_) {
    return '';
  }
}

function inventoryIsPlaceholder(src) {
  const url = inventorySourceUrl(src).toLowerCase();
  return !url || url === 'about:blank' || url === 'about:srcdoc' || url === 'blank';
}

function inventoryIsLocalOverlay(src) {
  const url = inventorySourceUrl(src);
  const lower = url.toLowerCase();
  if (!url) return false;
  if (src && (src.is_local_file === true || src.local_file)) return true;
  if (lower.startsWith('/overlays/') || lower.startsWith('overlays/') || lower.includes('/overlays/')) return true;
  const host = inventoryHost(url);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function inventoryIsExternal(src) {
  if (inventoryIsPlaceholder(src)) return false;
  if (inventoryIsLocalOverlay(src)) return false;
  return !!inventoryHost(inventorySourceUrl(src));
}

function inventoryDisplayName(value, fallback = 'Overlay') {
  const raw = cleanString(value);
  const normalized = inventoryKey(raw);
  const known = [
    ['soundalerts', 'SoundAlerts'], ['streamstickers', 'StreamStickers'], ['viewerattack', 'ViewerAttack'],
    ['vipsound', 'VIP Sound Overlay'], ['vipoverlay', 'VIP Sound Overlay'], ['vip', 'VIP Sound Overlay'],
    ['alertsv2', 'Alerts V2'], ['alertoverlayv2', 'Alerts V2'], ['alert', 'Alerts V2'],
    ['soundsystemoverlay', 'Sound-System Overlay'], ['soundoverlay', 'Sound-System Overlay'], ['soundsystem', 'Sound-System Overlay'],
    ['tts', 'TTS Overlay'], ['deathcounterv2', 'Deathcounter V2'], ['deathcounter', 'Deathcounter V2'],
    ['challengestatus', 'Challenge Status'], ['challenge', 'Challenge Status'],
    ['fireworks', 'Firework Overlay'], ['firework', 'Firework Overlay'],
    ['rahmen', 'Rahmen Overlay'], ['frameoverlay', 'Rahmen Overlay'],
    ['birthday', 'Birthday Overlay'], ['geburtstag', 'Birthday Overlay'],
    ['eastereggwinner', 'Easteregg Winner Overlay'], ['easteregg', 'Easteregg Winner Overlay'],
    ['clipshoutout', 'Clip-Shoutout Platzhalter'], ['clipplayer', 'Clip-Player Overlay'],
    ['mediaplayer', 'Media-Player Overlay'], ['megashoutout', 'Mega-Shoutout Overlay'],
    ['pause', 'Pause Overlay'], ['startv2neongalaxy', 'Start Overlay Neon Galaxy'], ['startv2', 'Start Overlay V2'], ['start', 'Start Overlay'],
    ['ende', 'Ende Overlay'], ['eventbustest', 'EventBus Test Overlay']
  ];
  for (const [needle, label] of known) {
    if (normalized.includes(needle)) return label;
  }
  if (!raw) return fallback;
  return raw.replace(/^overlay[:_-]?/i, '').replace(/^_+/, '').replace(/[-_]+/g, ' ').replace(/\.html?$/i, '').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()) || fallback;
}

function scoreInventoryClientForSource(client, src, pathText = '') {
  const srcName = cleanString(src.inputName || src.sourceName || src.name || src.id);
  const url = inventorySourceUrl(src);
  const base = inventoryBasename(url);
  const hay = [srcName, url, base, pathText].map(inventoryKey).filter(Boolean).join('|');
  const clientId = inventoryKey(client.id);
  const module = inventoryKey(client.module);
  const clientName = inventoryKey(client.name);
  let score = 0;

  const aliases = [
    ['rahmen', 'frameoverlay'], ['rahmen', 'rahmen'], ['frame', 'frameoverlay'],
    ['overlaybirthday', 'birthday'], ['birthday', 'birthday'], ['geburtstag', 'birthday'],
    ['eastereggwinner', 'easteregg'], ['clipshoutout', 'clip']
  ];
  for (const [sourceToken, clientToken] of aliases) {
    if (hay.includes(sourceToken) && (clientId.includes(clientToken) || module.includes(clientToken) || clientName.includes(clientToken))) score += 85;
  }

  if (clientId && hay.includes(clientId)) score += 100;
  if (clientId && clientId.includes(inventoryKey(base))) score += 60;
  if (module && hay.includes(module)) score += 50;
  if (clientName && hay.includes(clientName)) score += 35;

  const loose = ['vip','alert','sound','tts','death','deathcounter','challenge','firework','rahmen','frame','birthday','geburtstag','clip','easteregg','start','ende','pause','media','megashoutout'];
  for (const token of loose) {
    if (hay.includes(token) && (clientId.includes(token) || module.includes(token) || clientName.includes(token))) score += 18;
  }

  return score;
}

function findInventoryClientForSource(src, pathText = '', overlayStatus = null) {
  const clients = Array.isArray(overlayStatus?.overlays) ? overlayStatus.overlays : [];
  const srcName = cleanString(src.inputName || src.sourceName || src.name || src.id);
  const url = inventorySourceUrl(src);
  const forcedHay = [srcName, url, inventoryBasename(url), pathText].map(inventoryKey).filter(Boolean).join('|');
  const forcedTokens = [];
  if (forcedHay.includes('rahmen') || forcedHay.includes('frameoverlay')) forcedTokens.push('frameoverlay', 'rahmenoverlay');
  if (forcedHay.includes('overlaybirthday') || forcedHay.includes('birthday') || forcedHay.includes('geburtstag')) forcedTokens.push('birthdayoverlay', 'birthday', 'geburtstag');

  for (const token of forcedTokens) {
    const forced = clients.find(client => [client.id, client.module, client.name].map(inventoryKey).join('|').includes(token));
    if (forced) return { client: forced, score: 250 };
  }

  let best = null;
  let bestScore = 0;
  for (const client of clients) {
    const score = scoreInventoryClientForSource(client, src, pathText);
    if (score > bestScore) {
      best = client;
      bestScore = score;
    }
  }
  return bestScore >= 18 ? { client: best, score: bestScore } : { client: null, score: 0 };
}

function evaluateInventoryNode(node) {
  if (node.kind === 'scene') return 'scene';
  if (node.placeholder) return 'placeholder';
  if (node.external) return 'external';
  if (!node.busExpected) return 'ok';

  // Nur Quellen, die in der aktuellen Program-Szene effektiv erreichbar sind,
  // dürfen echte Warnungen erzeugen. Quellen in anderen Szenen sind Inventar,
  // aber gerade nicht aktiv im Live-Pfad.
  if (node.activeInProgram !== true) return 'standby';
  if (node.effectiveVisible !== true) return 'standby';

  const hasBusClient = !!node.busClient || !!node.busClientId;
  if (!hasBusClient) return 'warning';
  if (!node.hasHeartbeat) return 'warning';

  const status = cleanString(node.busStatus).toLowerCase();
  if (status === 'offline' || status === 'dead') return 'error';
  if (status === 'stale') return 'warning';

  // Wenn ein echter Heartbeat vorliegt, ist der Inventarstatus OK. Das verhindert
  // falsche Warnungen bei Clients, deren letzter Hello-/Statuswert noch anders lautet.
  return 'ok';
}

function normalizeInventoryStatuses(inventory) {
  if (!inventory || typeof inventory !== 'object') return inventory;
  const seen = new Set();
  const currentKey = inventoryKey(inventory.currentProgramSceneName || '');
  const normalizeNode = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.kind === 'scene') {
      const rootKey = inventoryKey(Array.isArray(node.path) && node.path.length ? node.path[0] : node.sceneName);
      if (currentKey && rootKey) {
        node.activeInProgram = rootKey === currentKey && node.effectiveVisible === true;
      }
    }
    if (node.kind === 'source') {
      const rootKey = inventoryKey(Array.isArray(node.path) && node.path.length ? node.path[0] : node.sceneName);
      if (currentKey && rootKey) {
        node.activeInProgram = rootKey === currentKey && node.effectiveVisible === true;
      }
      node.status = evaluateInventoryNode(node);
      seen.add(node);
    }
    if (Array.isArray(node.children)) node.children.forEach(normalizeNode);
  };
  if (Array.isArray(inventory.sceneTrees)) inventory.sceneTrees.forEach(normalizeNode);
  if (inventory.currentSceneTree) normalizeNode(inventory.currentSceneTree);
  if (Array.isArray(inventory.sources)) {
    inventory.sources.forEach(node => {
      if (!node || typeof node !== 'object') return;
      const rootKey = inventoryKey(Array.isArray(node.path) && node.path.length ? node.path[0] : node.sceneName);
      if (currentKey && rootKey) {
        node.activeInProgram = rootKey === currentKey && node.effectiveVisible === true;
      }
      if (!seen.has(node)) node.status = evaluateInventoryNode(node);
    });
  }
  inventory.summary = buildInventorySummary(inventory);
  return inventory;
}

function buildInventorySummary(inventory) {
  const rows = inventory.sources || [];
  return {
    scenes: inventory.scenes.length,
    sources: rows.length,
    visible: rows.filter(row => row.effectiveVisible).length,
    cgn: rows.filter(row => row.sourceType === 'cgn').length,
    external: rows.filter(row => row.sourceType === 'external').length,
    placeholder: rows.filter(row => row.sourceType === 'placeholder').length,
    withBus: rows.filter(row => !!row.busClientId).length,
    warnings: rows.filter(row => row.status === 'warning' || row.status === 'error').length
  };
}

function overlayMonitorRiskFromStatus(status) {
  const value = cleanString(status).toLowerCase();
  if (value === 'dead' || value === 'offline') return 'error';
  if (value === 'stale' || value === 'registered' || value === 'unknown' || !value) return 'warning';
  if (value === 'expected_inactive' || value === 'expected_idle') return 'info';
  return 'ok';
}

function isExpectedIdleOverlayClient(client = {}, sources = []) {
  const hay = [
    client.id,
    client.clientId,
    client.name,
    client.module,
    client.scene,
    client.sceneName,
    client.source,
    client.sourceName,
    client.path,
    client.url,
    ...sources.map(src => [src.obsSourceName, src.url, src.pathText, src.displayName].join('|'))
  ].map(value => inventoryKey(value)).filter(Boolean).join('|');

  // Event-/OneShot-Overlays sind im OBS-Inventar vorhanden, muessen aber im Idle
  // nicht dauerhaft aktiv rendern. Das bleibt rein diagnostisch: rawStatus bleibt sichtbar.
  return [
    'easteregg', 'eastereggwinner', 'winneroverlay',
    'birthdayoverlay', 'geburtstagoverlay',
    'clipshoutout', 'megashoutout', 'msooverlay'
  ].some(token => hay.includes(token));
}

function buildOverlaySceneAwarenessMap(overlays = []) {
  const awareness = new Map();
  const inventory = normalizeInventoryStatuses(state.obsInventory || loadInventoryCache());
  const sources = inventory && Array.isArray(inventory.sources) ? inventory.sources : [];
  const scenes = inventory && Array.isArray(inventory.scenes) ? inventory.scenes : [];
  const currentProgramSceneName = cleanString(inventory && inventory.currentProgramSceneName);
  const currentPreviewSceneName = cleanString(inventory && inventory.currentPreviewSceneName);
  const currentProgramSceneKnown = currentProgramSceneName
    ? (inventory && inventory.currentProgramSceneKnown === true)
      || scenes.some(scene => inventoryKey(scene.sceneName || scene.name || scene) === inventoryKey(currentProgramSceneName))
    : false;
  const sceneAwarenessMode = currentProgramSceneKnown ? 'program_scene_known' : 'program_scene_unknown_safe_inactive';
  const overlayList = Array.isArray(overlays) ? overlays : [];

  awareness.diagnostics = {
    inventoryAvailable: !!inventory,
    inventoryOk: !!(inventory && inventory.ok !== false),
    inventoryUpdatedAt: cleanString(inventory && inventory.updatedAt),
    inventoryFromCache: !!(inventory && inventory.fromCache === true),
    inventoryFromMemory: !!(inventory && inventory.fromMemory === true),
    refreshError: cleanString(inventory && inventory.refreshError),
    currentProgramSceneName,
    currentPreviewSceneName,
    currentProgramSceneKnown,
    sceneAwarenessMode,
    sceneCount: scenes.length,
    sourceCount: sources.length
  };

  function ensure(id, overlay = null) {
    const key = cleanString(id);
    if (!key) return null;
    if (!awareness.has(key)) {
      awareness.set(key, {
        known: false,
        currentProgramSceneName,
        currentPreviewSceneName,
        currentProgramSceneKnown,
        sceneAwarenessMode,
        inventoryUpdatedAt: awareness.diagnostics.inventoryUpdatedAt,
        inventoryFromCache: awareness.diagnostics.inventoryFromCache,
        inventoryFromMemory: awareness.diagnostics.inventoryFromMemory,
        sourceCount: 0,
        activeInProgramCount: 0,
        inactiveCount: 0,
        activeExpected: false,
        expectedInactive: false,
        expectedIdle: false,
        sources: [],
        overlay
      });
    }
    const record = awareness.get(key);
    if (overlay && !record.overlay) record.overlay = overlay;
    return record;
  }

  for (const overlay of overlayList) {
    ensure(overlay.id || overlay.clientId || overlay.name, overlay);
  }

  for (const source of sources) {
    if (!source || source.kind !== 'source') continue;
    if (source.external === true || source.placeholder === true) continue;

    let clientId = cleanString(source.busClientId);
    if (!clientId) {
      let best = null;
      let bestScore = 0;
      for (const overlay of overlayList) {
        const score = scoreInventoryClientForSource(overlay, {
          inputName: source.obsSourceName || source.displayName || '',
          url: source.url || '',
          local_file: source.url || ''
        }, source.pathText || '');
        if (score > bestScore) {
          best = overlay;
          bestScore = score;
        }
      }
      if (best && bestScore >= 18) clientId = cleanString(best.id || best.clientId || best.name);
    }

    const record = ensure(clientId);
    if (!record) continue;

    const sourceInfo = {
      obsSourceName: cleanString(source.obsSourceName || source.displayName),
      sceneName: cleanString(source.sceneName),
      pathText: cleanString(source.pathText),
      url: cleanString(source.url),
      effectiveVisible: source.effectiveVisible === true,
      activeInProgram: currentProgramSceneKnown === true && source.activeInProgram === true,
      rawActiveInProgram: source.activeInProgram === true,
      status: cleanString(source.status)
    };

    record.known = true;
    record.sourceCount += 1;
    record.sources.push(sourceInfo);
    if (sourceInfo.activeInProgram === true && sourceInfo.effectiveVisible === true) {
      record.activeInProgramCount += 1;
      record.activeExpected = true;
    } else {
      record.inactiveCount += 1;
    }
  }

  for (const record of awareness.values()) {
    record.expectedInactive = record.known === true && record.sourceCount > 0 && record.activeExpected !== true;
    record.expectedIdle = isExpectedIdleOverlayClient(record.overlay || {}, record.sources);
  }

  return awareness;
}

function applyOverlaySceneAwareness(overlay = {}, awarenessRecord = null) {
  const record = awarenessRecord || null;
  const rawStatus = cleanString(overlay.status || 'unknown').toLowerCase();
  const expectedInactiveAny = !!(record && record.expectedInactive === true);
  const expectedIdle = !!(record && record.expectedIdle === true);
  const expectedInactive = expectedInactiveAny && !expectedIdle;
  const expectedNotActive = expectedInactiveAny || expectedIdle;
  const monitorStatus = expectedIdle ? 'expected_idle' : (expectedInactive ? 'expected_inactive' : rawStatus);
  const monitorRisk = overlayMonitorRiskFromStatus(monitorStatus);

  return {
    ...overlay,
    rawStatus,
    monitorStatus,
    monitorRisk,
    activeExpected: record ? record.activeExpected === true : null,
    expectedInactive,
    expectedIdle,
    expectedNotActive,
    sceneAwareness: record ? {
      known: record.known === true,
      currentProgramSceneName: cleanString(record.currentProgramSceneName),
      currentPreviewSceneName: cleanString(record.currentPreviewSceneName),
      currentProgramSceneKnown: record.currentProgramSceneKnown === true,
      sceneAwarenessMode: cleanString(record.sceneAwarenessMode),
      inventoryUpdatedAt: cleanString(record.inventoryUpdatedAt),
      inventoryFromCache: record.inventoryFromCache === true,
      inventoryFromMemory: record.inventoryFromMemory === true,
      sourceCount: Number(record.sourceCount || 0),
      activeInProgramCount: Number(record.activeInProgramCount || 0),
      inactiveCount: Number(record.inactiveCount || 0),
      activeExpected: record.activeExpected === true,
      expectedInactive,
      expectedIdle,
      expectedNotActive,
      expectedInactiveRaw: expectedInactiveAny,
      sources: Array.isArray(record.sources) ? record.sources.slice(0, 10) : []
    } : {
      known: false,
      currentProgramSceneName: '',
      currentPreviewSceneName: '',
      currentProgramSceneKnown: false,
      sceneAwarenessMode: 'no_inventory_record',
      inventoryUpdatedAt: '',
      inventoryFromCache: false,
      inventoryFromMemory: false,
      sourceCount: 0,
      activeInProgramCount: 0,
      inactiveCount: 0,
      activeExpected: null,
      expectedInactive: false,
      expectedIdle: false,
      expectedNotActive: false,
      expectedInactiveRaw: false,
      sources: []
    }
  };
}

async function collectObsInventory(env = {}, options = {}) {
  const shared = getSharedObsInstance(env);
  if (!shared) throw new Error('OBS-Shared-Modul ist nicht verfügbar.');
  if (typeof shared.refreshSnapshot === 'function') {
    await shared.refreshSnapshot();
  }
  const publicStatus = typeof shared.getPublicStatus === 'function' ? shared.getPublicStatus() : {};
  const sceneNames = typeof shared.refreshScenes === 'function' ? await shared.refreshScenes() : [];
  const inputs = typeof shared.getInputList === 'function' ? await shared.getInputList() : [];
  const browserInputs = inputs.filter(input => String(input.inputKind || input.unversionedInputKind || '').toLowerCase().includes('browser'));
  const browserSources = [];

  for (const input of browserInputs) {
    let settings = {};
    try {
      const result = await shared.getInputSettings(input.inputName);
      settings = result.inputSettings || result.settings || result || {};
    } catch (err) {
      settings = { error: err && err.message ? err.message : String(err) };
    }
    browserSources.push({
      inputName: cleanString(input.inputName),
      inputKind: cleanString(input.inputKind),
      unversionedInputKind: cleanString(input.unversionedInputKind),
      url: cleanString(settings.url),
      local_file: cleanString(settings.local_file),
      is_local_file: !!settings.is_local_file,
      width: settings.width || '',
      height: settings.height || '',
      fps: settings.fps || '',
      settingsError: cleanString(settings.error)
    });
  }

  const sceneItemsByScene = {};
  for (const sceneName of sceneNames) {
    try {
      const items = await shared.getSceneItemList(sceneName);
      sceneItemsByScene[sceneName] = (Array.isArray(items) ? items : []).map(item => ({
        sceneItemId: item.sceneItemId,
        sourceName: cleanString(item.sourceName),
        enabled: item.sceneItemEnabled === true,
        locked: item.sceneItemLocked === true,
        raw: safeJson(item) || {}
      })).filter(item => item.sourceName);
    } catch (err) {
      sceneItemsByScene[sceneName] = [];
    }
  }

  const sourceMap = new Map();
  for (const src of browserSources) {
    const sourceKey = inventoryKey(src.inputName);
    if (sourceKey && !sourceMap.has(sourceKey)) sourceMap.set(sourceKey, src);
  }
  const sceneSet = new Set(sceneNames.map(inventoryKey).filter(Boolean));
  const currentProgramSceneName = cleanString(publicStatus.currentProgramSceneName);
  const currentPreviewSceneName = cleanString(publicStatus.currentPreviewSceneName);
  const currentProgramSceneKnown = !!currentProgramSceneName && sceneNames.some(sceneName => inventoryKey(sceneName) === inventoryKey(currentProgramSceneName));
  const overlayStatus = getOverlayStatus({ limitEvents: 0 });
  const allSources = [];

  function sourceNode(src, item, sceneName, pathParts, parentVisible, activePath, depth) {
    const url = inventorySourceUrl(src);
    const placeholder = inventoryIsPlaceholder(src);
    const external = inventoryIsExternal(src);
    const match = (external || placeholder) ? { client: null, score: 0 } : findInventoryClientForSource(src, pathParts.join(' → '), overlayStatus);
    const client = match.client || null;
    const hasHeartbeat = !!(client && (client.hasHeartbeat === true || client.lastHeartbeatAt));
    const effectiveVisible = parentVisible && item.enabled === true;
    const activeInProgram = activePath === true && effectiveVisible === true;
    const sourceType = placeholder ? 'placeholder' : (external ? 'external' : 'cgn');
    const node = {
      kind: 'source',
      sourceType,
      displayName: sourceType === 'external' ? inventoryDisplayName(src.inputName || url, src.inputName || 'Externe Browserquelle') : inventoryDisplayName([src.inputName, url, client?.name, client?.id, client?.module].filter(Boolean).join(' '), src.inputName || 'CGN Overlay'),
      obsSourceName: cleanString(src.inputName),
      sceneName,
      sceneItemId: item.sceneItemId || '',
      path: [...pathParts],
      pathText: pathParts.join(' → '),
      fileName: inventoryBasename(url),
      url,
      directVisible: item.enabled === true,
      effectiveVisible,
      activeInProgram,
      parentVisible,
      external,
      placeholder,
      busExpected: !(external || placeholder),
      busClientId: cleanString(client?.id),
      busClientName: cleanString(client?.name),
      module: cleanString(client?.module),
      mode: cleanString(client?.mode),
      version: cleanString(client?.version),
      busStatus: cleanString(client?.status),
      connected: client ? client.connected === true : false,
      hasHeartbeat,
      heartbeatAgeSeconds: client ? client.heartbeatAgeSeconds : null,
      lastHeartbeatAt: cleanString(client?.lastHeartbeatAt),
      lastHelloAt: cleanString(client?.lastHelloAt),
      matchScore: match.score || 0,
      children: []
    };
    node.status = evaluateInventoryNode(node);
    allSources.push(node);
    return node;
  }

  function sceneNode(sceneName, parentVisible, activePath, pathParts, visited, depth) {
    const currentKey = inventoryKey(sceneName);
    const node = {
      kind: 'scene',
      sceneName,
      displayName: sceneName,
      path: [...pathParts],
      pathText: pathParts.join(' → '),
      directVisible: true,
      effectiveVisible: parentVisible,
      activeInProgram: activePath === true && parentVisible === true,
      depth,
      children: []
    };
    if (!currentKey || visited.has(currentKey) || depth > 12) return node;
    const nextVisited = new Set(visited);
    nextVisited.add(currentKey);
    const items = sceneItemsByScene[sceneName] || [];
    for (const item of items) {
      const itemName = cleanString(item.sourceName);
      const itemKey = inventoryKey(itemName);
      const effectiveVisible = parentVisible && item.enabled === true;
      const nextPath = [...pathParts, itemName];
      if (sourceMap.has(itemKey)) {
        node.children.push(sourceNode(sourceMap.get(itemKey), item, sceneName, nextPath, parentVisible, activePath, depth + 1));
      } else if (sceneSet.has(itemKey)) {
        const child = sceneNode(itemName, effectiveVisible, activePath === true && effectiveVisible === true, nextPath, nextVisited, depth + 1);
        child.directVisible = item.enabled === true;
        child.effectiveVisible = effectiveVisible;
        node.children.push(child);
      } else {
        node.children.push({
          kind: 'other',
          displayName: itemName,
          obsSourceName: itemName,
          sceneName,
          path: nextPath,
          pathText: nextPath.join(' → '),
          directVisible: item.enabled === true,
          effectiveVisible,
          activeInProgram: activePath === true && effectiveVisible === true,
          status: 'other',
          children: []
        });
      }
    }
    return node;
  }

  const sceneTrees = sceneNames.map(sceneName => {
    const rootActive = currentProgramSceneKnown === true && inventoryKey(sceneName) === inventoryKey(currentProgramSceneName);
    return sceneNode(sceneName, true, rootActive, [sceneName], new Set(), 0);
  });
  const currentSceneTree = sceneTrees.find(tree => inventoryKey(tree.sceneName) === inventoryKey(currentProgramSceneName)) || null;

  const inventory = {
    ok: true,
    module: MODULE,
    version: VERSION,
    feature: 'obs_overlay_inventory',
    readOnly: true,
    refreshed: true,
    fromCache: false,
    updatedAt: nowIso(),
    currentProgramSceneName,
    currentPreviewSceneName,
    currentProgramSceneKnown,
    sceneAwarenessMode: currentProgramSceneKnown ? 'program_scene_known' : 'program_scene_unknown_safe_inactive',
    obsConnected: publicStatus.obsConnected === true,
    sceneCount: sceneNames.length,
    browserSourceCount: browserSources.length,
    scenes: sceneNames.map(name => ({ sceneName: name })),
    browserSources,
    sceneItemsByScene,
    sceneTrees,
    currentSceneTree,
    sources: allSources
  };
  inventory.summary = buildInventorySummary(inventory);
  return inventory;
}

async function getObsInventory(env = {}, options = {}) {
  if (options.force !== true && state.obsInventory && options.cacheOnly !== true) {
    return normalizeInventoryStatuses({ ...safeJson(state.obsInventory), fromMemory: true });
  }
  if (options.cacheOnly === true) {
    return normalizeInventoryStatuses(state.obsInventory || loadInventoryCache()) || { ok: false, reason: 'inventory_cache_empty', sources: [], scenes: [], sceneTrees: [], summary: {} };
  }
  if (state.obsInventoryRefreshing) {
    return normalizeInventoryStatuses(state.obsInventory || loadInventoryCache()) || { ok: false, reason: 'inventory_refresh_running', sources: [], scenes: [], sceneTrees: [], summary: {} };
  }

  state.obsInventoryRefreshing = true;
  try {
    const inventory = await collectObsInventory(env, options);
    normalizeInventoryStatuses(inventory);
    state.obsInventory = inventory;
    state.stats.inventoryRefreshes += 1;
    saveInventoryCache(inventory);
    return inventory;
  } catch (err) {
    const cached = normalizeInventoryStatuses(state.obsInventory || loadInventoryCache());
    if (cached) {
      cached.ok = true;
      cached.fromCache = true;
      cached.refreshError = err && err.message ? err.message : String(err);
      return cached;
    }
    return {
      ok: false,
      module: MODULE,
      version: VERSION,
      feature: 'obs_overlay_inventory',
      readOnly: true,
      reason: 'inventory_refresh_failed',
      error: err && err.message ? err.message : String(err),
      updatedAt: '',
      currentProgramSceneName: '',
      scenes: [],
      browserSources: [],
      sceneTrees: [],
      currentSceneTree: null,
      sources: [],
      summary: {}
    };
  } finally {
    state.obsInventoryRefreshing = false;
  }
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
    expectedInactive: 0,
    expectedIdle: 0,
    expectedNotActive: 0,
    withHeartbeat: 0,
    withoutHeartbeat: 0,
    connected: 0,
    disconnected: 0,
    activeExpected: 0,
    inactiveExpected: 0,
    withErrors: 0
  };

  for (const overlay of overlays) {
    const monitorStatus = cleanString(overlay.monitorStatus || overlay.status || 'unknown').replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
    const expectedIdle = overlay.expectedIdle === true;
    const expectedInactive = overlay.expectedInactive === true && !expectedIdle;
    const expectedNotActive = expectedIdle || expectedInactive || overlay.expectedNotActive === true;
    const summaryKey = expectedIdle ? 'expectedIdle' : (expectedInactive ? 'expectedInactive' : monitorStatus);
    if (Object.prototype.hasOwnProperty.call(summary, summaryKey)) summary[summaryKey] += 1;
    if (overlay.connected) summary.connected += 1;
    else summary.disconnected += 1;
    if (overlay.hasHeartbeat) summary.withHeartbeat += 1;
    else summary.withoutHeartbeat += 1;
    if (overlay.activeExpected === true) summary.activeExpected += 1;
    if (expectedNotActive) {
      summary.expectedNotActive += 1;
      summary.inactiveExpected += 1;
    }
    if (!expectedNotActive && (overlay.lastErrorAt || overlay.disconnectReason)) summary.withErrors += 1;
  }

  summary.status = summary.dead > 0 || summary.offline > 0 ? 'error' : (summary.stale > 0 || summary.registered > 0 || summary.withoutHeartbeat > 0 || summary.withErrors > 0 ? 'warning' : 'ok');
  return summary;
}

function buildIssues(overlays) {
  const issues = [];
  for (const overlay of overlays) {
    const status = cleanString(overlay.monitorStatus || overlay.status || 'unknown').toLowerCase();
    if (status === 'online' || status === 'expected_inactive' || status === 'expected_idle') continue;
    const level = status === 'stale' || status === 'registered' ? 'warn' : 'error';
    issues.push({
      key: `overlay_${status}_${overlay.id.replace(/[^a-zA-Z0-9_.:-]/g, '_')}`,
      level,
      overlayId: overlay.id,
      status,
      rawStatus: overlay.rawStatus || overlay.status,
      monitorStatus: status,
      monitorRisk: overlay.monitorRisk || overlayMonitorRiskFromStatus(status),
      expectedInactive: overlay.expectedInactive === true,
      expectedIdle: overlay.expectedIdle === true,
      activeExpected: overlay.activeExpected,
      sceneAwareness: overlay.sceneAwareness || null,
      message: status === 'registered' ? `Overlay ${overlay.id} ist nur angemeldet, aber ohne echten Heartbeat.` : `Overlay ${overlay.id} ist ${status}.`,
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

  const rawOverlays = clients
    .filter(isOverlayClient)
    .map(client => normalizeOverlayClient(client, currentMs))
    .sort((a, b) => a.id.localeCompare(b.id));
  const sceneAwareness = buildOverlaySceneAwarenessMap(rawOverlays);
  const sceneAwarenessDiagnostics = isPlainObject(sceneAwareness.diagnostics) ? safeJson(sceneAwareness.diagnostics) || {} : {};
  const overlays = rawOverlays.map(overlay => applyOverlaySceneAwareness(overlay, sceneAwareness.get(overlay.id)));

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
    sceneAwareness: sceneAwarenessDiagnostics,
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

function classifyOverlayClientPurpose(client = {}) {
  const raw = [
    client.id,
    client.clientId,
    client.name,
    client.module,
    client.scene,
    client.sceneName,
    client.source,
    client.sourceName,
    client.path,
    client.url
  ].map(value => cleanString(value)).join('|').toLowerCase();

  const testTokens = ['test', 'debug', 'demo', 'preview', 'sample', 'old', 'alt', 'legacy', 'backup', 'bak', 'tmp'];
  const productiveTokens = [
    'alert', 'alerts', 'vip', 'sound', 'overlay', 'birthday', 'geburtstag',
    'fireworks', 'deathcounter', 'start', 'challenge', 'hug', 'shoutout',
    'mso', 'credits', 'frame', 'rahmen'
  ];

  const matchedTestTokens = testTokens.filter(token => raw.includes(token));
  const matchedProductiveTokens = productiveTokens.filter(token => raw.includes(token));

  let purpose = 'unknown';
  let confidence = 'low';
  let reason = 'no_known_token';

  if (matchedTestTokens.length > 0) {
    purpose = 'test_or_legacy';
    confidence = 'medium';
    reason = `matched_test_token:${matchedTestTokens[0]}`;
  } else if (matchedProductiveTokens.length > 0) {
    purpose = 'productive_candidate';
    confidence = matchedProductiveTokens.length > 1 ? 'high' : 'medium';
    reason = `matched_productive_token:${matchedProductiveTokens[0]}`;
  }

  return {
    purpose,
    confidence,
    reason,
    matchedProductiveTokens,
    matchedTestTokens
  };
}

function normalizeOverlayClientIdentity(client = {}) {
  const rawId = cleanString(client.id || client.clientId || client.name || client.module || 'unknown');
  const moduleName = cleanString(client.module || client.name || rawId || 'overlay');
  const safeModule = moduleName.toLowerCase().replace(/[^a-z0-9_.:-]+/g, '_').replace(/^_+|_+$/g, '') || 'overlay';
  const safeId = rawId.toLowerCase().replace(/[^a-z0-9_.:-]+/g, '_').replace(/^_+|_+$/g, '') || safeModule;
  const normalizedId = safeId.includes(':') ? safeId : `overlay:${safeId}`;
  const clientType = cleanString(client.type || client.clientType || 'overlay').toLowerCase() || 'overlay';
  const classification = classifyOverlayClientPurpose(client);
  const caps = Array.isArray(client.capabilities) ? client.capabilities.map(value => cleanString(value)).filter(Boolean) : [];
  const capabilitySet = new Set(caps);
  capabilitySet.add('overlay.client');
  if (client.hasHeartbeat === true || client.heartbeat === true || client.lastHeartbeatAt || client.lastSeenAt) capabilitySet.add('overlay.heartbeat');
  if (classification.purpose === 'productive_candidate') capabilitySet.add('overlay.productive_candidate');
  if (classification.purpose === 'test_or_legacy') capabilitySet.add('overlay.test_or_legacy');
  if (cleanString(client.module).toLowerCase().includes('alert')) capabilitySet.add('overlay.alert');
  if (cleanString(client.module).toLowerCase().includes('vip')) capabilitySet.add('overlay.vip');
  if (cleanString(client.module).toLowerCase().includes('sound')) capabilitySet.add('overlay.sound');

  return {
    rawId,
    normalizedId,
    module: safeModule,
    clientType,
    classification,
    capabilities: Array.from(capabilitySet).sort(),
    displayName: cleanString(client.name || client.id || normalizedId),
    scene: cleanString(client.scene || client.sceneName || ''),
    source: cleanString(client.source || client.sourceName || ''),
    path: cleanString(client.path || client.url || ''),
    recommendedEventSource: {
      type: 'overlay',
      id: normalizedId,
      module: safeModule
    },
    recommendedHeartbeatPayload: {
      clientId: normalizedId,
      module: safeModule,
      clientType,
      capabilities: Array.from(capabilitySet).sort()
    }
  };
}

function buildOverlayClientIdentityContractStatus() {
  const classification = buildOverlayClientClassificationStatus();
  const clients = Array.isArray(classification.clients) ? classification.clients.map(client => normalizeOverlayClientIdentity(client)) : [];
  const duplicateMap = new Map();
  for (const client of clients) {
    const key = client.normalizedId;
    duplicateMap.set(key, (duplicateMap.get(key) || 0) + 1);
  }
  const duplicates = Array.from(duplicateMap.entries())
    .filter(([, count]) => count > 1)
    .map(([normalizedId, count]) => ({ normalizedId, count }));

  const capabilityCounts = {};
  for (const client of clients) {
    for (const cap of client.capabilities || []) {
      capabilityCounts[cap] = (capabilityCounts[cap] || 0) + 1;
    }
  }

  return {
    ok: true,
    module: MODULE,
    version: MODULE_VERSION,
    statusApiVersion: STATUS_API_VERSION,
    feature: 'overlay_client_identity_contract_status',
    mode: 'read_only_identity_contract',
    readOnly: true,
    overlayTouched: false,
    obsTouched: false,
    obsRefreshTriggered: false,
    obsRepairTriggered: false,
    eventBusEmit: false,
    recoveryTriggered: false,
    contract: {
      idFormat: 'overlay:<stable-id>',
      requiredHeartbeatFields: ['clientId', 'module', 'clientType', 'capabilities'],
      recommendedSourceShape: { type: 'overlay', id: 'overlay:<stable-id>', module: '<module-name>' },
      capabilityNaming: [
        'overlay.client',
        'overlay.heartbeat',
        'overlay.productive_candidate',
        'overlay.test_or_legacy',
        'overlay.alert',
        'overlay.vip',
        'overlay.sound'
      ],
      notes: [
        'Normalized IDs are read-only recommendations in this step.',
        'Existing overlay clients are not renamed here.',
        'Do not use duplicates as automatic cleanup trigger without confirmation.'
      ]
    },
    summary: {
      total: clients.length,
      normalized: clients.filter(client => client.normalizedId).length,
      duplicates: duplicates.length,
      productiveCandidates: clients.filter(client => client.classification && client.classification.purpose === 'productive_candidate').length,
      testOrLegacy: clients.filter(client => client.classification && client.classification.purpose === 'test_or_legacy').length,
      unknown: clients.filter(client => !client.classification || client.classification.purpose === 'unknown').length,
      capabilityKinds: Object.keys(capabilityCounts).length
    },
    duplicates,
    capabilityCounts,
    clients,
    routes: {
      clientControl: '/api/overlay-monitor/client-control/status',
      classification: '/api/overlay-monitor/client-control/classification',
      identityContract: '/api/overlay-monitor/client-control/identity-contract'
    },
    safety: {
      identityContractTouchesObs: false,
      identityContractRenamesClients: false,
      identityContractRefreshesBrowserSources: false,
      identityContractRepairsObs: false,
      automaticRecovery: false,
      destructiveActionAllowed: false
    },
    nextSteps: [
      'Use this route as a naming/capability reference before changing overlay clients.',
      'Apply normalized clientId/capabilities inside overlay HTML files one by one later.',
      'Keep legacy IDs accepted until every productive overlay has a stable normalized ID.',
      'Mark legacy/direct REST and broadcastWS paths next.'
    ],
    updatedAt: nowIso()
  };
}

function buildOverlayClientClassificationStatus() {
  const control = buildOverlayClientControlStatus();
  const sceneAwarenessDiagnostics = isPlainObject(control.sceneAwareness) ? control.sceneAwareness : {};
  const rows = Array.isArray(control.clients) ? control.clients.map(client => {
    const classification = classifyOverlayClientPurpose(client);
    return {
      ...client,
      classification
    };
  }) : [];

  const summary = {
    total: rows.length,
    productiveCandidates: rows.filter(row => row.classification && row.classification.purpose === 'productive_candidate').length,
    testOrLegacy: rows.filter(row => row.classification && row.classification.purpose === 'test_or_legacy').length,
    unknown: rows.filter(row => !row.classification || row.classification.purpose === 'unknown').length,
    highConfidence: rows.filter(row => row.classification && row.classification.confidence === 'high').length,
    mediumConfidence: rows.filter(row => row.classification && row.classification.confidence === 'medium').length,
    lowConfidence: rows.filter(row => row.classification && row.classification.confidence === 'low').length
  };

  return {
    ok: true,
    module: MODULE,
    version: MODULE_VERSION,
    statusApiVersion: STATUS_API_VERSION,
    feature: 'overlay_client_classification_status',
    mode: 'read_only_overlay_classification',
    readOnly: true,
    overlayTouched: false,
    obsTouched: false,
    obsRefreshTriggered: false,
    obsRepairTriggered: false,
    eventBusEmit: false,
    recoveryTriggered: false,
    summary,
    sceneAwareness: sceneAwarenessDiagnostics,
    currentProgramSceneName: cleanString(sceneAwarenessDiagnostics.currentProgramSceneName),
    currentPreviewSceneName: cleanString(sceneAwarenessDiagnostics.currentPreviewSceneName),
    currentProgramSceneKnown: sceneAwarenessDiagnostics.currentProgramSceneKnown === true,
    sceneAwarenessMode: cleanString(sceneAwarenessDiagnostics.sceneAwarenessMode),
    inventoryUpdatedAt: cleanString(sceneAwarenessDiagnostics.inventoryUpdatedAt),
    inventoryFromCache: sceneAwarenessDiagnostics.inventoryFromCache === true,
    inventoryFromMemory: sceneAwarenessDiagnostics.inventoryFromMemory === true,
    clients: rows,
    classifier: {
      productivePurpose: 'productive_candidate',
      testPurpose: 'test_or_legacy',
      unknownPurpose: 'unknown',
      note: 'Token-based first-pass classification only. Do not hide/move/remove overlays based on this without manual confirmation.'
    },
    routes: {
      clientControl: '/api/overlay-monitor/client-control/status',
      classification: '/api/overlay-monitor/client-control/classification'
    },
    safety: {
      classificationTouchesObs: false,
      classificationRefreshesBrowserSources: false,
      classificationRepairsObs: false,
      automaticRecovery: false,
      destructiveActionAllowed: false
    },
    nextSteps: [
      'Use this view to identify likely productive overlays and likely test/legacy overlays.',
      'Confirm classifications manually before any future cleanup or dashboard filtering.',
      'Standardize overlay client IDs and capabilities next.',
      'Keep OBS refresh/repair behind Confirm/SafetyStop later.'
    ],
    updatedAt: nowIso()
  };
}

function buildOverlayClientControlStatus() {
  const status = getOverlayStatus({ includeConfig: false, limitEvents: 30 });
  const overlays = Array.isArray(status.overlays) ? status.overlays : [];
  const sceneAwarenessDiagnostics = isPlainObject(status.sceneAwareness) ? status.sceneAwareness : {};
  const now = Date.now();
  const thresholds = isPlainObject(config.thresholds) ? config.thresholds : {};
  const staleAfterMs = Math.max(1000, asInt(thresholds.staleAfterMs, DEFAULT_CONFIG.thresholds.staleAfterMs));
  const deadAfterMs = Math.max(staleAfterMs, asInt(thresholds.deadAfterMs, DEFAULT_CONFIG.thresholds.deadAfterMs));

  const rows = overlays.map(client => {
    const lastHeartbeatAt = cleanString(client.lastHeartbeatAt || client.lastSeenAt || client.lastAt || '');
    const lastHeartbeatMs = parseTimeMs(lastHeartbeatAt);
    const heartbeatAgeFromStatus = Number(client.heartbeatAgeMs);
    const ageMs = Number.isFinite(heartbeatAgeFromStatus)
      ? Math.max(0, heartbeatAgeFromStatus)
      : (lastHeartbeatMs > 0 ? Math.max(0, now - lastHeartbeatMs) : 0);
    const busStatus = cleanString(client.busStatus || '').toLowerCase();
    const clientStatus = cleanString(client.status || busStatus || '').toLowerCase();
    const hasHeartbeat = client.hasHeartbeat === true || client.heartbeat === true || lastHeartbeatMs > 0;
    const stale = hasHeartbeat && ageMs > staleAfterMs;
    const dead = hasHeartbeat && ageMs > deadAfterMs;
    const connected = client.connected !== false;
    const rawEffectiveStatus = !connected
      ? 'offline'
      : (dead ? 'dead' : (stale ? 'stale' : (hasHeartbeat ? 'online' : (clientStatus || 'unknown'))));
    const expectedIdle = client.expectedIdle === true;
    const expectedInactive = client.expectedInactive === true && !expectedIdle;
    const expectedNotActive = expectedIdle || expectedInactive || client.expectedNotActive === true;
    const effectiveStatus = expectedIdle ? 'expected_idle' : (expectedInactive ? 'expected_inactive' : rawEffectiveStatus);
    const risk = overlayMonitorRiskFromStatus(effectiveStatus);
    const productiveHint = !/test|debug|demo|preview|sample|old|alt/i.test([
      client.id,
      client.name,
      client.module,
      client.path,
      client.url
    ].map(v => cleanString(v)).join('|'));

    return {
      id: cleanString(client.id || client.clientId || client.name || 'unknown'),
      name: cleanString(client.name || client.id || ''),
      module: cleanString(client.module || ''),
      status: effectiveStatus,
      monitorStatus: effectiveStatus,
      busStatus,
      rawStatus: client.rawStatus || clientStatus || rawEffectiveStatus,
      rawEffectiveStatus,
      activeExpected: client.activeExpected,
      expectedInactive,
      expectedIdle,
      expectedNotActive,
      sceneAwareness: client.sceneAwareness || null,
      currentProgramSceneName: cleanString(client.sceneAwareness && client.sceneAwareness.currentProgramSceneName),
      currentProgramSceneKnown: !!(client.sceneAwareness && client.sceneAwareness.currentProgramSceneKnown === true),
      sceneAwarenessMode: cleanString(client.sceneAwareness && client.sceneAwareness.sceneAwarenessMode),
      inventoryUpdatedAt: cleanString(client.sceneAwareness && client.sceneAwareness.inventoryUpdatedAt),
      inventoryFromCache: !!(client.sceneAwareness && client.sceneAwareness.inventoryFromCache === true),
      inventoryFromMemory: !!(client.sceneAwareness && client.sceneAwareness.inventoryFromMemory === true),
      hasHeartbeat,
      lastHeartbeatAt,
      ageMs,
      stale,
      dead,
      capabilities: Array.isArray(client.capabilities) ? client.capabilities : [],
      scene: cleanString(client.scene || client.sceneName || ''),
      source: cleanString(client.source || client.sourceName || ''),
      path: cleanString(client.path || client.url || ''),
      productiveHint,
      testOrLegacyHint: !productiveHint,
      risk
    };
  });

  const summary = {
    total: rows.length,
    online: rows.filter(row => row.risk === 'ok').length,
    info: rows.filter(row => row.risk === 'info').length,
    warning: rows.filter(row => row.risk === 'warning').length,
    error: rows.filter(row => row.risk === 'error').length,
    heartbeat: rows.filter(row => row.hasHeartbeat).length,
    stale: rows.filter(row => row.stale && row.expectedInactive !== true && row.expectedIdle !== true).length,
    dead: rows.filter(row => row.dead && row.expectedInactive !== true && row.expectedIdle !== true).length,
    expectedInactive: rows.filter(row => row.expectedInactive === true && row.expectedIdle !== true).length,
    expectedIdle: rows.filter(row => row.expectedIdle === true).length,
    expectedNotActive: rows.filter(row => row.expectedNotActive === true || row.expectedInactive === true || row.expectedIdle === true).length,
    activeExpected: rows.filter(row => row.activeExpected === true).length,
    productiveHint: rows.filter(row => row.productiveHint).length,
    testOrLegacyHint: rows.filter(row => row.testOrLegacyHint).length
  };

  return {
    ok: true,
    module: MODULE,
    version: MODULE_VERSION,
    statusApiVersion: STATUS_API_VERSION,
    feature: 'overlay_client_control_status',
    mode: 'read_only_overlay_clients',
    readOnly: true,
    overlayTouched: false,
    obsTouched: false,
    obsRefreshTriggered: false,
    obsRepairTriggered: false,
    eventBusEmit: false,
    recoveryTriggered: false,
    summary,
    sceneAwareness: sceneAwarenessDiagnostics,
    currentProgramSceneName: cleanString(sceneAwarenessDiagnostics.currentProgramSceneName),
    currentPreviewSceneName: cleanString(sceneAwarenessDiagnostics.currentPreviewSceneName),
    currentProgramSceneKnown: sceneAwarenessDiagnostics.currentProgramSceneKnown === true,
    sceneAwarenessMode: cleanString(sceneAwarenessDiagnostics.sceneAwarenessMode),
    inventoryUpdatedAt: cleanString(sceneAwarenessDiagnostics.inventoryUpdatedAt),
    inventoryFromCache: sceneAwarenessDiagnostics.inventoryFromCache === true,
    inventoryFromMemory: sceneAwarenessDiagnostics.inventoryFromMemory === true,
    clients: rows,
    thresholds: {
      staleAfterMs,
      deadAfterMs
    },
    routes: {
      status: '/api/overlay-monitor/status',
      clientControl: '/api/overlay-monitor/client-control/status',
      obsInventory: '/api/overlay-monitor/obs-inventory',
      manualRepair: '/api/overlay-monitor/obs-source/action'
    },
    safety: {
      clientControlTouchesObs: false,
      clientControlRefreshesBrowserSources: false,
      clientControlRepairsObs: false,
      manualRepairRouteExistsButNotUsedHere: true,
      automaticRecovery: false
    },
    nextSteps: [
      'Use this route as dashboard/control visibility only.',
      'Do not trigger OBS refresh or repair from this status route.',
      'Use productiveHint/testOrLegacyHint only as a first-pass classification; confirm before hiding or moving overlays.',
      'Later align overlay client IDs and capabilities across productive overlays.'
    ],
    updatedAt: nowIso()
  };
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
    const monitorStatus = cleanString(overlay.monitorStatus || overlay.status || 'unknown').toLowerCase();
    seen.add(overlay.id);
    const previous = state.lastStatuses.get(overlay.id);
    if (!previous) {
      state.lastStatuses.set(overlay.id, monitorStatus);
      pushEvent('info', 'overlay_seen', `Overlay erkannt: ${overlay.id} (${monitorStatus})`, { overlay, monitorStatus, rawStatus: overlay.rawStatus || overlay.status });
      if (config.emitStatusChangesToBus === true) {
        emitBusEvent('overlay.monitor', 'seen', { overlay }, { replayable: true, requireAck: false });
      }
      continue;
    }

    if (previous !== monitorStatus) {
      state.stats.statusChanges += 1;
      state.lastStatuses.set(overlay.id, monitorStatus);
      const level = monitorStatus === 'online' || monitorStatus === 'expected_inactive' || monitorStatus === 'expected_idle'
        ? 'info'
        : (monitorStatus === 'stale' ? 'warn' : 'error');
      pushEvent(level, 'overlay_status_changed', `Overlay ${overlay.id}: ${previous} -> ${monitorStatus}`, {
        overlayId: overlay.id,
        previousStatus: previous,
        status: monitorStatus,
        rawStatus: overlay.rawStatus || overlay.status,
        activeExpected: overlay.activeExpected,
        expectedInactive: overlay.expectedInactive === true,
        expectedIdle: overlay.expectedIdle === true,
        overlay
      });
      if (config.emitStatusChangesToBus === true) {
        emitBusEvent('overlay.monitor', 'status_changed', {
          overlayId: overlay.id,
          previousStatus: previous,
          status: monitorStatus,
          rawStatus: overlay.rawStatus || overlay.status,
          activeExpected: overlay.activeExpected,
          expectedInactive: overlay.expectedInactive === true,
          expectedIdle: overlay.expectedIdle === true,
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

async function pressBrowserSourceButton(shared, inputName, propertyNames) {
  let lastError = null;
  const tried = [];
  for (const propertyName of propertyNames) {
    if (!propertyName) continue;
    tried.push(propertyName);
    try {
      await shared.call('PressInputPropertiesButton', { inputName, propertyName });
      return { ok: true, propertyName, tried };
    } catch (err) {
      lastError = err;
    }
  }
  const error = new Error(lastError && lastError.message ? lastError.message : 'Browser-Refresh konnte nicht ausgefuehrt werden.');
  error.tried = tried;
  throw error;
}

async function performObsSourceRepairAction(env, payload = {}) {
  const action = cleanString(payload.action || payload.mode || payload.repairAction).toLowerCase();
  const sceneName = cleanString(payload.sceneName || payload.scene || payload.parentScene);
  const sourceName = cleanString(payload.sourceName || payload.source || payload.obsSourceName || payload.inputName);
  const inputName = cleanString(payload.inputName || payload.sourceName || payload.source || payload.obsSourceName);
  const requestedSceneItemId = asInt(payload.sceneItemId, 0);
  const shared = getSharedObsInstance(env);

  if (!shared || typeof shared.call !== 'function') {
    const err = new Error('OBS-Shared-Modul ist nicht verfuegbar.');
    err.code = 'OBS_SHARED_UNAVAILABLE';
    throw err;
  }

  if (!action) {
    const err = new Error('Es fehlt action.');
    err.code = 'MISSING_ACTION';
    throw err;
  }

  const result = {
    ok: true,
    action,
    sceneName,
    sourceName,
    inputName,
    before: null,
    after: null,
    propertyName: '',
    message: ''
  };

  if (action === 'refresh' || action === 'reload') {
    if (!inputName) {
      const err = new Error('Es fehlt inputName/sourceName fuer Browser-Refresh.');
      err.code = 'MISSING_INPUT';
      throw err;
    }
    const pressed = await pressBrowserSourceButton(shared, inputName, ['refresh']);
    result.propertyName = pressed.propertyName;
    result.message = `Browserquelle '${inputName}' wurde neu geladen.`;
    return result;
  }

  if (action === 'refresh-cache' || action === 'cache' || action === 'nocache') {
    if (!inputName) {
      const err = new Error('Es fehlt inputName/sourceName fuer Browser-Cache-Refresh.');
      err.code = 'MISSING_INPUT';
      throw err;
    }
    const pressed = await pressBrowserSourceButton(shared, inputName, ['refreshnocache', 'refresh']);
    result.propertyName = pressed.propertyName;
    result.message = pressed.propertyName === 'refreshnocache'
      ? `Browserquelle '${inputName}' wurde mit Cache-Refresh neu geladen.`
      : `Browserquelle '${inputName}' wurde neu geladen. Cache-Button war nicht verfuegbar.`;
    return result;
  }

  if (!sceneName) {
    const err = new Error('Es fehlt sceneName fuer Sichtbarkeits-Aktion.');
    err.code = 'MISSING_SCENE';
    throw err;
  }
  if (!sourceName) {
    const err = new Error('Es fehlt sourceName fuer Sichtbarkeits-Aktion.');
    err.code = 'MISSING_SOURCE';
    throw err;
  }
  if (typeof shared.findSceneItem !== 'function' || typeof shared.setSceneItemEnabled !== 'function') {
    const err = new Error('OBS-Sichtbarkeitsfunktionen sind nicht verfuegbar.');
    err.code = 'OBS_VISIBILITY_UNAVAILABLE';
    throw err;
  }

  let item = null;
  if (requestedSceneItemId > 0 && typeof shared.getSceneItemList === 'function') {
    const items = await shared.getSceneItemList(sceneName);
    item = (Array.isArray(items) ? items : []).find(candidate => asInt(candidate.sceneItemId, 0) === requestedSceneItemId) || null;
  }
  if (!item) {
    item = await shared.findSceneItem(sceneName, sourceName);
  }
  if (!item) {
    const err = new Error(`Source '${sourceName}' wurde in Scene '${sceneName}' nicht gefunden.`);
    err.code = 'SCENE_ITEM_NOT_FOUND';
    throw err;
  }

  const before = item.sceneItemEnabled === true;
  result.before = before;
  result.sceneItemId = item.sceneItemId;
  result.sourceName = cleanString(item.sourceName, sourceName);

  if (action === 'show' || action === 'enable') {
    await shared.setSceneItemEnabled(sceneName, item.sceneItemId, true);
    result.after = true;
    result.message = `Quelle '${result.sourceName}' wurde aktiviert.`;
    return result;
  }

  if (action === 'hide' || action === 'disable') {
    await shared.setSceneItemEnabled(sceneName, item.sceneItemId, false);
    result.after = false;
    result.message = `Quelle '${result.sourceName}' wurde deaktiviert.`;
    return result;
  }

  if (action === 'toggle') {
    const after = !before;
    await shared.setSceneItemEnabled(sceneName, item.sceneItemId, after);
    result.after = after;
    result.message = `Quelle '${result.sourceName}' wurde umgeschaltet.`;
    return result;
  }

  if (action === 'cycle' || action === 'restart' || action === 'hide-show') {
    const delayMs = Math.max(100, Math.min(3000, asInt(payload.delayMs, 350)));
    await shared.setSceneItemEnabled(sceneName, item.sceneItemId, false);
    await sleep(delayMs);
    await shared.setSceneItemEnabled(sceneName, item.sceneItemId, true);
    result.after = true;
    result.delayMs = delayMs;
    result.message = `Quelle '${result.sourceName}' wurde kurz deaktiviert und wieder aktiviert.`;
    return result;
  }

  const err = new Error(`Unbekannte Reparaturaktion '${action}'.`);
  err.code = 'UNKNOWN_ACTION';
  throw err;
}

function init({ app, env } = {}) {
  if (!app) throw new Error(`${MODULE}.init: app fehlt.`);

  loadConfig();
  ensureIssueSchema();
  ensureInventorySchema();

  const bus = getBus();
  if (bus && typeof bus.registerModule === 'function' && !busModuleRegistered) {
    try {
      bus.registerModule({
        module: MODULE,
        name: 'Overlay Monitor',
        version: VERSION,
        capabilities: ['overlay.monitor.status', 'overlay.monitor.events', 'overlay.monitor.obs_repair'],
        meta: { readOnly: false, obsTouched: true, overlayTouched: false, manualOnly: true }
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

  registerGet(app, '/api/overlay-monitor/client-control/status', (req, res) => {
    res.json(buildOverlayClientControlStatus());
  });

  registerGet(app, '/api/overlay-monitor/client-control/classification', (req, res) => {
    res.json(buildOverlayClientClassificationStatus());
  });

  registerGet(app, '/api/overlay-monitor/client-control/identity-contract', (req, res) => {
    res.json(buildOverlayClientIdentityContractStatus());
  });

  registerGet(app, '/api/overlay-monitor/issues', (req, res) => {
    const status = cleanString(req.query.status || 'all', 'all').toLowerCase();
    const limit = Math.max(1, Math.min(500, asInt(req.query.limit, 100)));
    const result = listStoredIssues({ status, limit });
    res.json(result);
  });

  registerGet(app, '/api/overlay-monitor/obs-inventory', async (req, res) => {
    const refresh = String(req.query.refresh || '') === '1' || String(req.query.force || '') === '1';
    const cacheOnly = String(req.query.cache || '') === '1';
    const result = await getObsInventory(env || process.env || {}, { force: refresh, cacheOnly });
    res.json(result);
  });

  registerPost(app, '/api/overlay-monitor/obs-source/action', async (req, res) => {
    try {
      const payload = req && req.body && typeof req.body === 'object' ? req.body : {};
      const result = await performObsSourceRepairAction(env || process.env || {}, payload);
      state.stats.obsRepairActions += 1;
      pushEvent('info', 'obs_source_repair', result.message || 'OBS-Quelle wurde manuell repariert.', {
        action: result.action,
        sceneName: result.sceneName,
        sourceName: result.sourceName,
        inputName: result.inputName,
        propertyName: result.propertyName || '',
        before: result.before,
        after: result.after
      });
      await getObsInventory(env || process.env || {}, { force: true }).catch(() => null);
      res.json({ ok: true, module: MODULE, version: VERSION, result });
    } catch (err) {
      const status = err && err.code === 'OBS_NOT_CONNECTED' ? 503 : (err && err.code === 'SCENE_ITEM_NOT_FOUND' ? 404 : 400);
      state.stats.lastError = err && err.message ? err.message : String(err);
      res.status(status).json({
        ok: false,
        module: MODULE,
        version: VERSION,
        error: { code: err && err.code ? err.code : 'OBS_SOURCE_ACTION_FAILED', message: err && err.message ? err.message : String(err) }
      });
    }
  });

  registerGet(app, '/api/overlay-monitor/events', (req, res) => {
    const limit = Math.max(1, Math.min(100, asInt(req.query.limit, 50)));
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      readOnly: false,
      manualActions: true,
      events: state.events.slice(0, limit),
      stats: { ...state.stats }
    });
  });

  registerGet(app, '/api/overlay-monitor/routes', (req, res) => {
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      readOnly: false,
      manualActions: true,
      routes: [
        { method: 'GET', path: '/api/overlay-monitor/status', description: 'Read-only Overlay-Monitor Status aus dem Communication Bus.' },
        { method: 'GET', path: '/api/overlay-monitor/events', description: 'Read-only Statuswechsel/Auffaelligkeiten des Overlay-Monitors.' },
        { method: 'GET', path: '/api/overlay-monitor/issues', description: 'Persistierte Monitoring-Issues mit active/resolved Status.' },
        { method: 'GET', path: '/api/overlay-monitor/obs-inventory', description: 'Persistiertes/aktuelles OBS-Overlay-Inventar als rekursive Struktur.' },
        { method: 'POST', path: '/api/overlay-monitor/obs-source/action', description: 'Manuelle OBS-Reparaturaktion fuer Browserquellen: refresh/cache/show/hide/toggle/cycle.' },
        { method: 'GET', path: '/api/overlay-monitor/routes', description: 'Routenuebersicht.' }
      ]
    });
  });

  scan();
  getObsInventory(env || process.env || {}, { force: true }).catch(err => {
    state.stats.lastError = err && err.message ? err.message : String(err);
  });
  startTimer();
  console.log(`[${MODULE}] v${VERSION} overlay monitor registered`);
}

module.exports = {
  MODULE_META,
  MODULE_VERSION: VERSION,
  version: VERSION,
  init,
  getOverlayStatus,
  scan,
  listStoredIssues,
  getObsInventory
};
