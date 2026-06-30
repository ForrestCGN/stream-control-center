'use strict';

const { buildAgentStatusSummary } = require('./agent-status.service');

const MODULE = 'remote_local_logs_readonly';
const MODULE_BUILD = 'RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON';
const STATUS_API_VERSION = 'rdap_local_logs120.v1';
const STATUS_ROUTE = '/api/remote/local/logs/status';
const LIST_ROUTE = '/api/remote/local/logs/list';
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const LOG_AREAS = Object.freeze([
  { key: 'all', label: 'Alle lokalen Logs', prepared: true, active: false },
  { key: 'dashboard', label: 'Dashboard / Agent Status', prepared: true, active: false },
  { key: 'media', label: 'Media-System lokal', prepared: true, active: false },
  { key: 'sound', label: 'Sound / Playback spaeter', prepared: true, active: false },
  { key: 'overlays', label: 'OBS / Overlays spaeter', prepared: true, active: false },
  { key: 'system', label: 'System / Lokaler Server spaeter', prepared: true, active: false }
]);

const SAFETY = Object.freeze({
  readOnly: true,
  writeEnabled: false,
  databaseWriteEnabled: false,
  migrationEnabled: false,
  deleteEnabled: false,
  cleanupEnabled: false,
  pruneEnabled: false,
  agentActionsEnabled: false,
  localControlActionsEnabled: false,
  obsControlEnabled: false,
  soundControlEnabled: false,
  overlayControlEnabled: false,
  commandControlEnabled: false,
  shellOrProcessActionsEnabled: false,
  fileWriteEnabled: false,
  freeUrlExecutionEnabled: false,
  secretsLogged: false,
  rawPayloadLoggingEnabled: false
});

function buildLocalLogsStatus(context = {}) {
  const now = new Date().toISOString();
  const agentSummary = safeBuildAgentSummary(context);
  const connected = agentSummary.connected === true;
  const connectionState = agentSummary.connectionState || 'offline';

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: context.moduleBuild || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: STATUS_ROUTE,
    listRoute: LIST_ROUTE,
    method: 'GET',
    generatedAt: now,
    readOnly: true,
    prepared: true,
    active: false,
    skeleton: true,
    source: 'local-stream-pc-agent',
    sourcePrepared: true,
    sourceConnected: connected,
    sourceState: connected ? 'agent_connected_no_log_items_yet' : connectionState,
    status: connected ? 'prepared_waiting_for_local_log_items' : 'stream_pc_not_connected_or_not_enabled',
    itemsAvailable: false,
    itemAggregationEnabled: false,
    maxLimit: MAX_LIMIT,
    defaultLimit: DEFAULT_LIMIT,
    filters: ['limit', 'area', 'status', 'search'],
    areas: LOG_AREAS.map((item) => ({ ...item })),
    agent: {
      checked: true,
      connected,
      connectionState,
      runtimeEffectiveEnabled: agentSummary.runtimeEffectiveEnabled === true,
      heartbeatReceiverEnabled: agentSummary.heartbeatReceiverEnabled === true,
      lastHeartbeatAt: agentSummary.lastHeartbeatAt || null,
      heartbeatAgeMs: Number.isFinite(Number(agentSummary.heartbeatAgeMs)) ? Number(agentSummary.heartbeatAgeMs) : null,
      stale: agentSummary.stale === true,
      actionsEnabled: false,
      productiveAgentRuntime: false
    },
    safety: { ...SAFETY },
    notes: [
      'RDAP 0.2.120 stellt nur das read-only Skeleton fuer lokale Logs bereit.',
      'Die Listenroute aggregiert noch keine echten lokalen Agent-, Media-, Sound-, OBS- oder System-Items.',
      'Offline/nicht verbunden wird sauber als leerer read-only Zustand gemeldet.',
      'Keine Writes, keine Migration, keine Loeschung, keine Agent-Actions und keine lokalen Steueraktionen.'
    ]
  };
}

function buildLocalLogsList(context = {}, req = null) {
  const filters = buildFilters(req && req.query ? req.query : {});
  const status = buildLocalLogsStatus(context);
  const reason = status.sourceConnected ? 'local_logs_skeleton_no_items_yet' : 'stream_pc_not_connected_or_not_enabled';

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: context.moduleBuild || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: LIST_ROUTE,
    statusRoute: STATUS_ROUTE,
    method: 'GET',
    generatedAt: new Date().toISOString(),
    readOnly: true,
    prepared: true,
    active: false,
    skeleton: true,
    source: 'local-stream-pc-agent',
    sourceConnected: status.sourceConnected,
    sourceState: status.sourceState,
    reason,
    limit: filters.limit,
    filters: filters.publicFilters,
    count: 0,
    items: [],
    itemSchema: {
      source: 'local',
      area: 'dashboard|media|sound|overlays|obs|system',
      createdAt: 'ISO-8601',
      actor: 'system|agent|module',
      status: 'success|attempt|failure|warning|info',
      action: 'string',
      resourceType: 'string|null',
      resourceKey: 'string|null',
      summary: 'safe short text',
      detailsSafe: 'safe optional text'
    },
    safety: { ...SAFETY },
    notes: [
      'Skeleton-Listenroute: liefert absichtlich noch keine echten lokalen Log-Items.',
      'Query-Parameter werden vorbereitet und sicher normalisiert.',
      'Limit ist hart auf 100 begrenzt.',
      'Keine Secrets, Tokens, Cookies, ENV-Werte oder Rohpayloads.'
    ]
  };
}

function buildLocalLogsRoutesSummary(context = {}) {
  const status = buildLocalLogsStatus(context);
  return {
    prepared: true,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    statusRoute: STATUS_ROUTE,
    listRoute: LIST_ROUTE,
    sourcePrepared: true,
    sourceConnected: status.sourceConnected,
    sourceState: status.sourceState,
    itemAggregationEnabled: false,
    maxLimit: MAX_LIMIT,
    defaultLimit: DEFAULT_LIMIT,
    filters: ['limit', 'area', 'status', 'search'],
    areas: LOG_AREAS.map((item) => ({ ...item })),
    routes: [
      { method: 'GET', path: STATUS_ROUTE, description: 'RDAP 0.2.120 lokale Logs read-only Status-Skeleton; keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: LIST_ROUTE, description: 'RDAP 0.2.120 lokale Logs read-only Listen-Skeleton; aktuell leer, Filter vorbereitet, keine Writes', readOnly: true }
    ],
    safety: { ...SAFETY }
  };
}

function buildFilters(query = {}) {
  const limit = clampLimit(query.limit);
  const area = normalizeArea(query.area);
  const status = normalizeStatus(query.status);
  const search = normalizeSearch(query.search);
  return {
    limit,
    publicFilters: {
      limit,
      area,
      status,
      search
    }
  };
}

function clampLimit(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function normalizeArea(value) {
  const text = String(value || 'all').trim().toLowerCase();
  const allowed = new Set(LOG_AREAS.map((item) => item.key));
  return allowed.has(text) ? text : 'all';
}

function normalizeStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  const allowed = new Set(['success', 'attempt', 'failure', 'warning', 'info']);
  return allowed.has(text) ? text : '';
}

function normalizeSearch(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.slice(0, 80);
}

function safeBuildAgentSummary(context = {}) {
  try {
    return buildAgentStatusSummary(context) || {};
  } catch (err) {
    return {
      connected: false,
      connectionState: 'agent_status_unavailable',
      error: err && err.message ? 'agent_status_failed' : 'agent_status_failed'
    };
  }
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildLocalLogsStatus,
  buildLocalLogsList,
  buildLocalLogsRoutesSummary
};
