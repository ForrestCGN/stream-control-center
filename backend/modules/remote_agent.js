'use strict';

let routes = null;
try {
  routes = require('./helpers/helper_routes');
} catch (err) {
  routes = null;
}

let WebSocket = null;
try {
  WebSocket = require('ws');
} catch (err) {
  WebSocket = null;
}

const MODULE = 'remote_agent';
const MODULE_VERSION = '0.1.1';
const MODULE_BUILD = 'RDAP121_STREAMING_PC_COMPONENT_STATUS_READONLY';
const STATUS_API_VERSION = 'rdap121_streaming_pc_component_status.v1';
const HANDSHAKE_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const COMPONENT_STATUS_PROTOCOL_VERSION = 'rdap-component-status.v1';
const DEFAULT_REMOTE_WS_URL = 'wss://mods.forrestcgn.de/agent-ws';
const LOADED_AT = new Date().toISOString();

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'remote-dashboard',
  description: 'Streaming-PC connection client with read-only local component status. Sends safe heartbeat summaries only. No productive actions.',
  routesPrefix: ['/api/remote-agent', '/api/streaming-pc-connection'],
  bus: {
    registered: false,
    heartbeat: true,
    emits: [],
    listens: []
  },
  legacy: false
};

const CAPABILITIES = Object.freeze({
  status: true,
  ping: false,
  statusRequest: false,
  permissionsModel: true,
  locksStatus: true,
  auditModel: true,
  streamingPcConnectionClient: true,
  heartbeatSender: true,
  componentStatusSender: true,
  obsControl: false,
  soundControl: false,
  overlayControl: false,
  mediaWrite: false,
  textConfigWrite: false,
  commandControl: false,
  databaseWrite: false,
  fileWrite: false,
  shell: false,
  processControl: false
});

const ROLES = Object.freeze([
  {
    key: 'owner',
    label: 'Owner',
    purpose: 'Vollzugriff, System-/Security-Hoheit und Notfalluebernahme.',
    criticalLimits: ['nur sehr begrenzt vergeben', 'alle kritischen Aenderungen auditpflichtig']
  },
  {
    key: 'admin',
    label: 'Admin',
    purpose: 'Verwaltung freigegebener Module, Benutzer und Einstellungen.',
    criticalLimits: ['keine Owner-Sonderrechte ohne explizite Permission', 'keine freie Shell-/Datei-/Prozesssteuerung']
  },
  {
    key: 'lead_mod',
    label: 'Lead-Mod',
    purpose: 'Erweiterte Mod-Team-Funktionen und ausgewaehlte Modulverwaltung.',
    criticalLimits: ['keine System-/Security-Rechte']
  },
  {
    key: 'mod',
    label: 'Mod',
    purpose: 'Normale Stream-/Mod-Bedienung und freigegebene Event-Bedienung.',
    criticalLimits: ['keine globalen Config-/Security-Rechte']
  },
  {
    key: 'media_manager',
    label: 'Media Manager',
    purpose: 'Optionale Medienpflege, falls spaeter getrennt benoetigt.',
    criticalLimits: ['keine Systemrechte']
  },
  {
    key: 'readonly',
    label: 'Read-only',
    purpose: 'Nur-Lesen-Zugriff.',
    criticalLimits: ['keine produktiven Aktionen']
  }
]);

const GROUP_MARKERS = Object.freeze([
  {
    key: 'sound_profi',
    label: 'Sound-Profi',
    type: 'group_marker',
    purpose: 'Fachliche Markierung fuer Personen, die spaeter gezielt Sound-, Media-, Command- und Kanalpunkte-Bereiche bearbeiten duerfen.',
    grantsPermissionsByItself: false,
    isDashboardRole: false,
    permissionSource: 'modulePermissionMatrix',
    permissionTargetModel: 'target_type + target_key',
    criticalLimits: [
      'keine Rolle',
      'kein globales Permission-Preset',
      'keine System-/Security-/Owner-Rechte',
      'keine freien Dateipfade',
      'keine Datenbankmigrationen'
    ],
    plannedAllowedAreas: [
      'media',
      'sound',
      'sound-commands',
      'channelpoints-sound-media'
    ]
  }
]);

const PERMISSIONS = Object.freeze([
  { key: 'dashboard.read', label: 'Dashboard lesen', area: 'dashboard', protectionLevel: 'low' },
  { key: 'admin.audit.read', label: 'Audit lesen', area: 'admin', protectionLevel: 'medium' },
  { key: 'admin.users.manage', label: 'Benutzer verwalten', area: 'admin', protectionLevel: 'critical' },
  { key: 'admin.roles.manage', label: 'Rollen/Rechte verwalten', area: 'admin', protectionLevel: 'critical' },
  { key: 'locks.read', label: 'Locks lesen', area: 'locks', protectionLevel: 'low' },
  { key: 'locks.create', label: 'Locks erstellen', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.heartbeat', label: 'Lock-Heartbeat senden', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.release', label: 'Locks freigeben', area: 'locks', protectionLevel: 'medium' },
  { key: 'locks.takeover', label: 'Locks uebernehmen', area: 'locks', protectionLevel: 'critical' },
  { key: 'texts.read', label: 'Texte lesen', area: 'texts', protectionLevel: 'low' },
  { key: 'texts.edit', label: 'Texte bearbeiten', area: 'texts', protectionLevel: 'medium' },
  { key: 'config.read', label: 'Configs lesen', area: 'config', protectionLevel: 'low' },
  { key: 'config.edit', label: 'Configs bearbeiten', area: 'config', protectionLevel: 'high' },
  { key: 'media.read', label: 'Media lesen', area: 'media', protectionLevel: 'low' },
  { key: 'media.upload', label: 'Media hochladen', area: 'media', protectionLevel: 'medium' },
  { key: 'media.edit', label: 'Media bearbeiten', area: 'media', protectionLevel: 'medium' },
  { key: 'media.delete', label: 'Media loeschen', area: 'media', protectionLevel: 'high' },
  { key: 'sound.read', label: 'Sounds lesen', area: 'sound', protectionLevel: 'low' },
  { key: 'sound.test', label: 'Sounds testen', area: 'sound', protectionLevel: 'medium' },
  { key: 'sound.command.edit', label: 'Sound-Commands bearbeiten', area: 'sound', protectionLevel: 'high' },
  { key: 'channelpoints.edit', label: 'Kanalpunkte-Aktionen bearbeiten', area: 'twitch', protectionLevel: 'high' },
  { key: 'obs.control', label: 'OBS steuern', area: 'obs', protectionLevel: 'critical' },
  { key: 'overlay.control', label: 'Overlays steuern', area: 'overlays', protectionLevel: 'critical' },
  { key: 'streaming_pc.connection.status.read', label: 'Streaming-PC Verbindung lesen', area: 'streaming-pc', protectionLevel: 'low' },
  { key: 'streaming_pc.action.requested', label: 'Streaming-PC Aktion anfordern', area: 'streaming-pc', protectionLevel: 'critical' }
]);

const ROLE_PERMISSION_PRESETS = Object.freeze({
  owner: ['*'],
  admin: [
    'dashboard.read', 'admin.audit.read', 'admin.users.manage', 'locks.read', 'locks.create',
    'locks.heartbeat', 'locks.release', 'locks.takeover', 'texts.read', 'texts.edit',
    'config.read', 'config.edit', 'media.read', 'media.upload', 'media.edit', 'media.delete',
    'sound.read', 'sound.test', 'sound.command.edit', 'channelpoints.edit', 'streaming_pc.connection.status.read'
  ],
  lead_mod: [
    'dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release',
    'texts.read', 'texts.edit', 'config.read', 'media.read', 'sound.read', 'sound.test',
    'streaming_pc.connection.status.read'
  ],
  mod: ['dashboard.read', 'locks.read', 'texts.read', 'config.read', 'media.read', 'sound.read', 'streaming_pc.connection.status.read'],
  media_manager: ['dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release', 'media.read', 'media.upload', 'media.edit', 'texts.read', 'streaming_pc.connection.status.read'],
  readonly: ['dashboard.read', 'locks.read', 'texts.read', 'config.read', 'media.read', 'sound.read', 'streaming_pc.connection.status.read']
});

const LOCK_MODEL = Object.freeze({
  enabled: false,
  readOnlyPreview: true,
  activeLocks: [],
  plannedResourceKeyFormat: '<bereich>:<modul>:<resource-id>',
  plannedStates: ['free', 'locked', 'expired', 'takeover_requested', 'takeover_done'],
  heartbeatIntervalSec: 20,
  timeoutSec: 90,
  takeoverAllowedFor: ['owner', 'admin'],
  versionCheckRequired: true,
  saveRequiresValidLock: true,
  sharedReadWhileLocked: true,
  notes: [
    'RDAP119 setzt keine produktiven Locks.',
    'Speichern soll spaeter nur mit gueltigem Lock und passender Resource-Version erlaubt sein.',
    'Owner/Admin duerfen Locks spaeter uebernehmen; jede Uebernahme ist auditpflichtig.'
  ]
});

const AUDIT_MODEL = Object.freeze({
  enabled: false,
  readOnlyPreview: true,
  retentionConfigurable: true,
  minimumFields: [
    'auditId', 'timestamp', 'actorUserId', 'actorDisplayName', 'source', 'action',
    'permission', 'resourceKey', 'oldValueSummary', 'newValueSummary', 'status',
    'requestId', 'correlationId'
  ],
  plannedEventTypes: [
    'permission.check',
    'locks.create',
    'locks.heartbeat',
    'locks.release',
    'locks.takeover',
    'resource.save.requested',
    'resource.save.succeeded',
    'resource.save.failed',
    'streaming_pc.connection.started',
    'streaming_pc.connection.heartbeat',
    'streaming_pc.connection.failed',
    'streaming_pc.action.requested',
    'streaming_pc.action.accepted',
    'streaming_pc.action.rejected',
    'streaming_pc.action.failed'
  ],
  sources: ['dashboard-local', 'remote-modboard', 'webserver', 'streaming-pc'],
  notes: [
    'RDAP119 schreibt noch keine Audit-Daten.',
    'Produktive Aenderungen muessen spaeter auditpflichtig sein.',
    'Sensible Werte duerfen nur maskiert oder zusammengefasst im Audit landen.'
  ]
});

const CONNECTION_STATE = {
  enabled: false,
  configured: false,
  connectAttempted: false,
  connected: false,
  connectionState: 'disabled',
  reason: 'not_initialized',
  remoteWsUrl: DEFAULT_REMOTE_WS_URL,
  wsPath: '/agent-ws',
  agentId: 'stream-pc-main',
  agentName: 'Forrest Stream-PC',
  agentVersion: MODULE_VERSION,
  protocolVersion: HANDSHAKE_PROTOCOL_VERSION,
  heartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION,
  connectedSince: null,
  lastSeenAt: null,
  lastHeartbeatAt: null,
  heartbeatSeq: 0,
  componentStatus: null,
  componentStatusUpdatedAt: null,
  heartbeatIntervalMs: 30000,
  reconnectDelayMs: 5000,
  reconnectCount: 0,
  lastConnectAttemptAt: null,
  lastDisconnectAt: null,
  lastErrorAt: null,
  lastError: null,
  keyConfigured: false,
  keyExposed: false,
  actionsEnabled: false,
  productiveActionsEnabled: false,
  noShellOrProcessActions: true,
  noFileWrite: true,
  noDatabaseWrite: true,
  noRawPayloadStored: true
};

let ws = null;
let heartbeatTimer = null;
let reconnectTimer = null;
let started = false;

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/remote-agent/status', (req, res) => {
    void req;
    res.json(buildStatusResponse());
  });

  registerGet(app, '/api/streaming-pc-connection/status', (req, res) => {
    void req;
    res.json(buildStatusResponse());
  });

  registerGet(app, '/api/remote-agent/permissions/model', (req, res) => {
    void req;
    res.json(buildPermissionsModelResponse());
  });

  registerGet(app, '/api/remote-agent/locks/status', (req, res) => {
    void req;
    res.json(buildLocksStatusResponse());
  });

  registerGet(app, '/api/remote-agent/audit/model', (req, res) => {
    void req;
    res.json(buildAuditModelResponse());
  });

  registerGet(app, '/api/remote-agent/routes', (req, res) => {
    void req;
    res.json(buildRoutesResponse());
  });

  startStreamingPcConnectionClient();

  console.log(`[remote_agent] ${MODULE_BUILD} Streaming-PC connection client with component status registered. actions=false.`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}

function startStreamingPcConnectionClient() {
  if (started) return;
  started = true;

  const config = readConnectionConfig();
  applyConnectionConfig(config);

  if (!config.enabled) {
    CONNECTION_STATE.connectionState = 'disabled';
    CONNECTION_STATE.reason = 'streaming_pc_connection_disabled';
    return;
  }

  if (!WebSocket) {
    CONNECTION_STATE.connectionState = 'error';
    CONNECTION_STATE.reason = 'ws_dependency_missing';
    CONNECTION_STATE.lastError = 'ws dependency missing';
    CONNECTION_STATE.lastErrorAt = new Date().toISOString();
    return;
  }

  if (!config.accessKey) {
    CONNECTION_STATE.connectionState = 'not_configured';
    CONNECTION_STATE.reason = 'connection_key_missing';
    return;
  }

  connectStreamingPc(config);
}

function readConnectionConfig() {
  const remoteWsUrl = readString('STREAMING_PC_REMOTE_WS_URL', readString('AGENT_REMOTE_WS_URL', DEFAULT_REMOTE_WS_URL));
  const agentId = readString('STREAMING_PC_CONNECTION_ID', readString('AGENT_ID', 'stream-pc-main'));
  const agentName = readString('STREAMING_PC_CONNECTION_NAME', readString('AGENT_NAME', 'Forrest Stream-PC'));
  const accessKey = readString('STREAMING_PC_CONNECTION_KEY', readString('AGENT_ACCESS_KEY', ''));

  return {
    enabled: readBoolean('STREAMING_PC_CONNECTION_ENABLED', readBoolean('AGENT_CONNECTION_ENABLED', false)),
    remoteWsUrl,
    agentId,
    agentName,
    accessKey,
    heartbeatIntervalMs: readInt('STREAMING_PC_HEARTBEAT_INTERVAL_MS', readInt('AGENT_HEARTBEAT_INTERVAL_MS', 30000), 5000, 300000),
    reconnectDelayMs: readInt('STREAMING_PC_RECONNECT_DELAY_MS', readInt('AGENT_RECONNECT_DELAY_MS', 5000), 1000, 300000)
  };
}

function applyConnectionConfig(config) {
  CONNECTION_STATE.enabled = Boolean(config.enabled);
  CONNECTION_STATE.configured = Boolean(config.enabled && config.accessKey && config.remoteWsUrl && config.agentId);
  CONNECTION_STATE.remoteWsUrl = sanitizeRemoteWsUrl(config.remoteWsUrl);
  CONNECTION_STATE.wsPath = safeWsPath(config.remoteWsUrl);
  CONNECTION_STATE.agentId = safeAgentId(config.agentId);
  CONNECTION_STATE.agentName = safeAgentName(config.agentName);
  CONNECTION_STATE.heartbeatIntervalMs = config.heartbeatIntervalMs;
  CONNECTION_STATE.reconnectDelayMs = config.reconnectDelayMs;
  CONNECTION_STATE.keyConfigured = Boolean(config.accessKey);
  CONNECTION_STATE.keyExposed = false;
}

function connectStreamingPc(config) {
  clearReconnectTimer();
  CONNECTION_STATE.connectAttempted = true;
  CONNECTION_STATE.lastConnectAttemptAt = new Date().toISOString();
  CONNECTION_STATE.connectionState = 'connecting';
  CONNECTION_STATE.reason = 'connecting_to_webserver';

  try {
    ws = new WebSocket(config.remoteWsUrl, {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'X-SCC-Agent-Id': config.agentId,
        'X-SCC-Agent-Protocol': HANDSHAKE_PROTOCOL_VERSION,
        'X-SCC-Agent-Version': MODULE_VERSION
      },
      handshakeTimeout: 10000
    });

    ws.on('open', () => handleOpen(config));
    ws.on('close', () => handleClose(config, 'socket_close'));
    ws.on('error', (err) => handleError(config, err));
    ws.on('message', () => {
      // RDAP119 client ignores inbound data. No commands/actions are accepted.
    });
  } catch (err) {
    handleError(config, err);
    handleClose(config, 'connect_exception');
  }
}

function handleOpen(config) {
  const now = new Date().toISOString();
  CONNECTION_STATE.connected = true;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.reason = 'connected_readonly_heartbeat';
  CONNECTION_STATE.connectedSince = now;
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastError = null;
  CONNECTION_STATE.lastErrorAt = null;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveActionsEnabled = false;
  startHeartbeatTimer(config);
  sendHeartbeat(config);
}

function handleClose(config, reason) {
  stopHeartbeatTimer();
  CONNECTION_STATE.connected = false;
  CONNECTION_STATE.connectionState = CONNECTION_STATE.enabled ? 'reconnecting' : 'disabled';
  CONNECTION_STATE.reason = safeReason(reason || 'socket_close');
  CONNECTION_STATE.lastDisconnectAt = new Date().toISOString();
  CONNECTION_STATE.lastSeenAt = CONNECTION_STATE.lastDisconnectAt;
  if (CONNECTION_STATE.enabled && CONNECTION_STATE.keyConfigured) scheduleReconnect(config);
}

function handleError(config, err) {
  CONNECTION_STATE.connected = false;
  CONNECTION_STATE.connectionState = 'error';
  CONNECTION_STATE.reason = 'connection_error';
  CONNECTION_STATE.lastErrorAt = new Date().toISOString();
  CONNECTION_STATE.lastError = err && err.message ? safeError(err.message) : 'connection_error';
  void config;
}

function startHeartbeatTimer(config) {
  stopHeartbeatTimer();
  heartbeatTimer = setInterval(() => sendHeartbeat(config), config.heartbeatIntervalMs);
  if (heartbeatTimer && typeof heartbeatTimer.unref === 'function') heartbeatTimer.unref();
}

function stopHeartbeatTimer() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function scheduleReconnect(config) {
  clearReconnectTimer();
  CONNECTION_STATE.reconnectCount += 1;
  reconnectTimer = setTimeout(() => connectStreamingPc(config), config.reconnectDelayMs);
  if (reconnectTimer && typeof reconnectTimer.unref === 'function') reconnectTimer.unref();
}

function clearReconnectTimer() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

function sendHeartbeat(config) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  CONNECTION_STATE.heartbeatSeq += 1;
  const componentStatus = buildComponentStatus(config);
  const payload = {
    type: 'heartbeat',
    protocolVersion: HEARTBEAT_PROTOCOL_VERSION,
    agentId: config.agentId,
    seq: CONNECTION_STATE.heartbeatSeq,
    agentVersion: MODULE_VERSION,
    componentStatus
  };

  try {
    ws.send(JSON.stringify(payload));
    const now = new Date().toISOString();
    CONNECTION_STATE.lastHeartbeatAt = now;
    CONNECTION_STATE.lastSeenAt = now;
    CONNECTION_STATE.connectionState = 'connected';
    CONNECTION_STATE.reason = 'heartbeat_sent';
    CONNECTION_STATE.componentStatus = componentStatus;
    CONNECTION_STATE.componentStatusUpdatedAt = now;
    CONNECTION_STATE.actionsEnabled = false;
    CONNECTION_STATE.productiveActionsEnabled = false;
  } catch (err) {
    handleError(config, err);
  }
}


function buildComponentStatus(config) {
  const now = new Date().toISOString();
  const localDashboardUrl = readString('STREAMING_PC_LOCAL_DASHBOARD_URL', 'http://192.168.16.200:8080/dashboard');

  return {
    protocolVersion: COMPONENT_STATUS_PROTOCOL_VERSION,
    collectedAt: now,
    localDashboard: {
      available: true,
      name: 'Lokales Dashboard',
      reachable: true,
      status: 'available',
      url: sanitizeLocalUrl(localDashboardUrl),
      checkedAt: now,
      detail: 'lokale Dashboard-Adresse hinterlegt'
    },
    localServer: {
      available: true,
      name: 'Lokaler Dashboard-Server',
      reachable: true,
      status: 'running',
      port: 8080,
      checkedAt: now,
      detail: 'dieser Node-Server liefert den Heartbeat'
    },
    obs: {
      available: false,
      name: 'OBS',
      reachable: null,
      status: 'not_checked',
      checkedAt: now,
      detail: 'RDAP121 liest OBS noch nicht aktiv aus'
    },
    streamerbot: {
      available: false,
      name: 'Streamer.bot',
      reachable: null,
      status: 'not_checked',
      checkedAt: now,
      detail: 'RDAP121 liest Streamer.bot noch nicht aktiv aus'
    },
    actionsEnabled: false,
    productiveActionsEnabled: false,
    noCommands: true,
    noShellOrProcessActions: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    rawPayloadStored: false
  };
}

function buildBaseResponse(extra = {}) {
  return {
    ok: true,
    module: MODULE,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    generatedAt: new Date().toISOString(),
    loadedAt: LOADED_AT,
    ...extra
  };
}

function buildStatusResponse() {
  const now = new Date().toISOString();
  const state = buildConnectionStatus();

  return buildBaseResponse({
    displayName: 'Streaming-PC Verbindung',
    status: {
      connected: state.connected,
      connectionState: state.connectionState,
      reason: state.reason,
      lastSeenAt: state.lastSeenAt,
      connectedSince: state.connectedSince,
      lastHeartbeatAt: state.lastHeartbeatAt,
      heartbeatSeq: state.heartbeatSeq,
      heartbeatAgeMs: calculateHeartbeatAgeMs(state.lastHeartbeatAt),
      reconnectCount: state.reconnectCount,
      stale: isHeartbeatStale(state.lastHeartbeatAt)
    },
    streamingPcConnection: state,
    agent: {
      agentId: state.agentId,
      agentName: state.agentName,
      agentVersion: state.agentVersion,
      protocolVersion: state.protocolVersion,
      heartbeatProtocolVersion: state.heartbeatProtocolVersion,
      expectedAgentId: 'stream-pc-main',
      expectedAgentName: 'Forrest Stream-PC'
    },
    host: {
      dashboardServer: 'local-stream-control-center',
      hostname: safeHostname(),
      platform: process.platform,
      nodeVersion: process.version,
      processUptimeSec: Math.floor(process.uptime()),
      localTime: now
    },
    remoteTarget: {
      publicDashboardUrl: 'https://mods.forrestcgn.de',
      remoteWsUrl: state.remoteWsUrl,
      plannedTransport: state.remoteWsUrl.startsWith('wss://') ? 'wss' : 'ws',
      plannedWsPath: state.wsPath,
      streamPcPublicPortRequired: false,
      outgoingConnectionOnly: true
    },
    capabilities: { ...CAPABILITIES },
    safety: buildSafetyBlock(),
    warnings: [
      'RDAP121 sendet Heartbeats plus sicheren Komponentenstatus vom Streaming-PC zum Webserver.',
      'Es werden keine Steuerbefehle angenommen oder ausgefuehrt.',
      'OBS, Sounds, Overlays, Commands, Shell, Dateien, Prozesse und Datenbank-Writes bleiben deaktiviert.',
      'Verbindungsschluessel wird nie in Status, UI oder Logs ausgegeben. Komponentenstatus ist read-only und enthaelt keine Secrets, Pfade oder Prozesslisten.'
    ],
    errors: state.lastError ? [{ at: state.lastErrorAt, message: state.lastError }] : []
  });
}

function buildConnectionStatus() {
  return {
    enabled: CONNECTION_STATE.enabled,
    configured: CONNECTION_STATE.configured,
    connectAttempted: CONNECTION_STATE.connectAttempted,
    connected: CONNECTION_STATE.connected,
    connectionState: CONNECTION_STATE.connectionState,
    reason: CONNECTION_STATE.reason,
    remoteWsUrl: CONNECTION_STATE.remoteWsUrl,
    wsPath: CONNECTION_STATE.wsPath,
    agentId: CONNECTION_STATE.agentId,
    agentName: CONNECTION_STATE.agentName,
    agentVersion: CONNECTION_STATE.agentVersion,
    protocolVersion: CONNECTION_STATE.protocolVersion,
    heartbeatProtocolVersion: CONNECTION_STATE.heartbeatProtocolVersion,
    connectedSince: CONNECTION_STATE.connectedSince,
    lastSeenAt: CONNECTION_STATE.lastSeenAt,
    lastHeartbeatAt: CONNECTION_STATE.lastHeartbeatAt,
    heartbeatSeq: CONNECTION_STATE.heartbeatSeq,
    componentStatus: CONNECTION_STATE.componentStatus || buildComponentStatus({}),
    componentStatusUpdatedAt: CONNECTION_STATE.componentStatusUpdatedAt,
    heartbeatIntervalMs: CONNECTION_STATE.heartbeatIntervalMs,
    reconnectDelayMs: CONNECTION_STATE.reconnectDelayMs,
    reconnectCount: CONNECTION_STATE.reconnectCount,
    lastConnectAttemptAt: CONNECTION_STATE.lastConnectAttemptAt,
    lastDisconnectAt: CONNECTION_STATE.lastDisconnectAt,
    lastErrorAt: CONNECTION_STATE.lastErrorAt,
    lastError: CONNECTION_STATE.lastError,
    keyConfigured: CONNECTION_STATE.keyConfigured,
    keyExposed: false,
    actionsEnabled: false,
    productiveActionsEnabled: false,
    noShellOrProcessActions: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    noRawPayloadStored: true
  };
}

function buildPermissionsModelResponse() {
  return buildBaseResponse({
    modelApiVersion: 'permissions.rdap119.v1',
    permissionDecisionRule: 'roles are presets; groups are markers; concrete permission keys and module matrix grants decide',
    twitchRolesAreNotDashboardRoles: true,
    rolesAreSeparateFromGroups: true,
    soundProfiIsRole: false,
    soundProfiIsGroupMarker: true,
    modulePermissionMatrixUsesTargetTypeAndTargetKey: true,
    roles: ROLES.map(clonePlain),
    groups: GROUP_MARKERS.map(clonePlain),
    groupMarkers: GROUP_MARKERS.map(clonePlain),
    permissions: PERMISSIONS.map(clonePlain),
    rolePermissionPresets: clonePlain(ROLE_PERMISSION_PRESETS),
    groupPermissionPresets: {},
    specialGroups: {
      sound_profi: {
        label: 'Sound-Profi',
        type: 'group_marker',
        grantsPermissionsByItself: false,
        permissionSource: 'modulePermissionMatrix',
        permissionTargetModel: 'target_type + target_key',
        mayBeGrantedLaterForTargets: [
          'Media/Sounds hochladen',
          'Media/Sounds bearbeiten',
          'Sounds testen',
          'Sounds zuordnen',
          'Sound-Commands bearbeiten',
          'Kanalpunkte-Aktionen fuer Sound-/Media-Funktionen bearbeiten'
        ],
        mayNot: [
          'Owner-/Security-Rechte verwalten',
          'Verbindungsschluessel verwalten',
          'freie Shell-/Datei-/Prozessaktionen ausloesen',
          'Datenbankmigrationen starten',
          'globale System-Konfiguration aendern'
        ]
      }
    },
    specialRoles: {},
    legacyCompatibility: {
      previousSoundProfiRoleRemoved: true,
      soundProfiWasRoleInRdap4b: true,
      soundProfiNowGroupMarker: true
    },
    warnings: [
      'Diese Route liefert nur das Modell. Es gibt noch keine produktive User-/Role-/Grant-Speicherung.',
      'Permissions muessen spaeter serverseitig geprueft werden; Frontend-Anzeigen sind nie Sicherheitsentscheidung.'
    ]
  });
}

function buildLocksStatusResponse() {
  return buildBaseResponse({
    modelApiVersion: 'locks.rdap119.v1',
    locks: clonePlain(LOCK_MODEL),
    activeLocks: [],
    summary: {
      enabled: false,
      activeLockCount: 0,
      staleLockCount: 0,
      takeoverPendingCount: 0
    },
    warnings: [
      'RDAP119 liefert nur den geplanten Lock-Status. Es werden noch keine Locks erstellt oder gespeichert.',
      'Produktives Speichern darf spaeter nur mit gueltigem Lock und Resource-Version erfolgen.'
    ]
  });
}

function buildAuditModelResponse() {
  return buildBaseResponse({
    modelApiVersion: 'audit.rdap119.v1',
    audit: clonePlain(AUDIT_MODEL),
    summary: {
      enabled: false,
      recentEventsAvailable: false,
      retentionConfigurable: true
    },
    warnings: [
      'RDAP119 schreibt noch keine Audit-Events.',
      'Produktive Remote-/Dashboard-Aktionen muessen spaeter Audit schreiben, bevor sie als fertig gelten.'
    ]
  });
}

function buildRoutesResponse() {
  return buildBaseResponse({
    routes: [
      {
        method: 'GET',
        path: '/api/remote-agent/status',
        description: 'Read-only Status fuer lokale Streaming-PC-Verbindung und Sicherheitsmodell.'
      },
      {
        method: 'GET',
        path: '/api/streaming-pc-connection/status',
        description: 'Lesbarer Alias fuer Streaming-PC Verbindung. Keine Aktionen.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/permissions/model',
        description: 'Read-only Rollen-/Permission-Modell. Keine User-/Grant-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/locks/status',
        description: 'Read-only Lock-Modell und aktueller Null-Status. Keine Lock-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/audit/model',
        description: 'Read-only Audit-Modell fuer spaetere produktive Aktionen. Keine Audit-Schreiboperation.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/routes',
        description: 'Read-only Routenuebersicht fuer RDAP119.'
      }
    ]
  });
}

function buildSafetyBlock() {
  return {
    noSoundControl: true,
    noObsControl: true,
    noOverlayControl: true,
    noMediaWrite: true,
    noTextConfigWrite: true,
    noCommandsOrChannelpoints: true,
    noDatabaseWrite: true,
    noFileWrite: true,
    noShellOrProcessActions: true,
    noAgentActionExecution: true,
    noStreamingPcActionExecution: true,
    heartbeatOnly: true,
    outgoingConnectionOnly: true
  };
}

function readString(name, fallback) {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function readBoolean(name, fallback) {
  const value = process.env[name];
  if (typeof value !== 'string') return Boolean(fallback);
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readInt(name, fallback, min, max) {
  const parsed = Number.parseInt(process.env[name], 10);
  if (!Number.isInteger(parsed)) return fallback;
  if (Number.isFinite(min) && parsed < min) return fallback;
  if (Number.isFinite(max) && parsed > max) return fallback;
  return parsed;
}

function sanitizeLocalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return 'http://192.168.16.200:8080/dashboard';
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return 'http://192.168.16.200:8080/dashboard';
    if (!['127.0.0.1', 'localhost', '192.168.16.200'].includes(url.hostname)) return 'http://192.168.16.200:8080/dashboard';
    return url.toString().slice(0, 180);
  } catch (err) {
    return 'http://192.168.16.200:8080/dashboard';
  }
}

function sanitizeRemoteWsUrl(value) {
  try {
    const url = new URL(value || DEFAULT_REMOTE_WS_URL);
    if (url.protocol !== 'wss:' && url.protocol !== 'ws:') return DEFAULT_REMOTE_WS_URL;
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (err) {
    return DEFAULT_REMOTE_WS_URL;
  }
}

function safeWsPath(value) {
  try {
    const url = new URL(value || DEFAULT_REMOTE_WS_URL);
    return url.pathname || '/agent-ws';
  } catch (err) {
    return '/agent-ws';
  }
}

function safeAgentId(value) {
  const normalized = String(value || 'stream-pc-main').trim();
  return /^[a-zA-Z0-9_-]{3,64}$/.test(normalized) ? normalized : 'stream-pc-main';
}

function safeAgentName(value) {
  const text = String(value || 'Forrest Stream-PC').trim().replace(/[^\p{L}\p{N} _.-]/gu, '');
  return text.slice(0, 80) || 'Forrest Stream-PC';
}

function safeReason(value) {
  return String(value || 'unknown').trim().replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80) || 'unknown';
}

function safeError(value) {
  return String(value || 'connection_error')
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [masked]')
    .replace(/[A-Za-z0-9_-]{24,}/g, '[masked]')
    .slice(0, 240);
}

function calculateHeartbeatAgeMs(value) {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Date.now() - time);
}

function isHeartbeatStale(value) {
  const age = calculateHeartbeatAgeMs(value);
  if (age === null) return false;
  return age > Math.max(90000, CONNECTION_STATE.heartbeatIntervalMs * 3);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeHostname() {
  try {
    return require('os').hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  buildStatusResponse,
  buildPermissionsModelResponse,
  GROUP_MARKERS,
  buildLocksStatusResponse,
  buildAuditModelResponse
};
