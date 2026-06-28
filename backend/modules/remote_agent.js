'use strict';

let routes = null;
try { routes = require('./helpers/helper_routes'); } catch (err) { routes = null; }

let WebSocket = null;
try { WebSocket = require('ws'); } catch (err) { WebSocket = null; }

let net = null;
try { net = require('net'); } catch (err) { net = null; }


let obsSharedModule = null;
try { obsSharedModule = require('./obs_shared'); } catch (err) { obsSharedModule = null; }

const MODULE = 'remote_agent';
const MODULE_VERSION = '0.1.6B';
const MODULE_BUILD = 'RDAP_0.2.20B_AGENT_HEARTBEAT_SLIM_LIVE_STATE_READONLY';
const STATUS_API_VERSION = 'rdap_agent_obs_live_state_0220b.v1';
const HANDSHAKE_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const COMPONENT_STATUS_PROTOCOL_VERSION = 'rdap-component-status.v1';
const LIVE_STATE_PROTOCOL_VERSION = 'rdap-agent-live-state.v1';
const DEFAULT_REMOTE_WS_URL = 'wss://mods.forrestcgn.de/agent-ws';
const LOADED_AT = new Date().toISOString();

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'remote-dashboard',
  description: 'Streaming-PC connection client with read-only component status, optional OBS inventory read and fast OBS live-state push over the existing agent WSS. No productive actions.',
  routesPrefix: ['/api/remote-agent', '/api/streaming-pc-connection'],
  bus: { registered: false, heartbeat: true, emits: [], listens: [] },
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
  obsStatusRead: true,
  obsInventoryRead: true,
  obsInventoryReadOnly: true,
  obsInventoryEnvDiagnostic: true,
  obsInventorySharedConnection: true,
  obsLiveStateRead: true,
  obsLiveStatePush: true,
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
  { key: 'owner', label: 'Owner', purpose: 'Vollzugriff, System-/Security-Hoheit und Notfalluebernahme.', criticalLimits: ['nur sehr begrenzt vergeben', 'alle kritischen Aenderungen auditpflichtig'] },
  { key: 'admin', label: 'Admin', purpose: 'Verwaltung freigegebener Module, Benutzer und Einstellungen.', criticalLimits: ['keine Owner-Sonderrechte ohne explizite Permission', 'keine freie Shell-/Datei-/Prozesssteuerung'] },
  { key: 'lead_mod', label: 'Lead-Mod', purpose: 'Erweiterte Mod-Team-Funktionen und ausgewaehlte Modulverwaltung.', criticalLimits: ['keine System-/Security-Rechte'] },
  { key: 'mod', label: 'Mod', purpose: 'Normale Stream-/Mod-Bedienung und freigegebene Event-Bedienung.', criticalLimits: ['keine globalen Config-/Security-Rechte'] },
  { key: 'media_manager', label: 'Media Manager', purpose: 'Optionale Medienpflege, falls spaeter getrennt benoetigt.', criticalLimits: ['keine Systemrechte'] },
  { key: 'readonly', label: 'Read-only', purpose: 'Nur-Lesen-Zugriff.', criticalLimits: ['keine produktiven Aktionen'] }
]);

const GROUP_MARKERS = Object.freeze([
  { key: 'sound_profi', label: 'Sound-Profi', type: 'group_marker', purpose: 'Fachliche Markierung fuer Personen, die spaeter gezielt Sound-, Media-, Command- und Kanalpunkte-Bereiche bearbeiten duerfen.', grantsPermissionsByItself: false, isDashboardRole: false, permissionSource: 'modulePermissionMatrix', permissionTargetModel: 'target_type + target_key', criticalLimits: ['keine Rolle', 'kein globales Permission-Preset', 'keine System-/Security-/Owner-Rechte', 'keine freien Dateipfade', 'keine Datenbankmigrationen'], plannedAllowedAreas: ['media', 'sound', 'sound-commands', 'channelpoints-sound-media'] }
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
  admin: ['dashboard.read', 'admin.audit.read', 'admin.users.manage', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release', 'locks.takeover', 'texts.read', 'texts.edit', 'config.read', 'config.edit', 'media.read', 'media.upload', 'media.edit', 'media.delete', 'sound.read', 'sound.test', 'sound.command.edit', 'channelpoints.edit', 'streaming_pc.connection.status.read'],
  lead_mod: ['dashboard.read', 'locks.read', 'locks.create', 'locks.heartbeat', 'locks.release', 'texts.read', 'texts.edit', 'config.read', 'media.read', 'sound.read', 'sound.test', 'streaming_pc.connection.status.read'],
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
  notes: ['Version 0.1.5D setzt keine produktiven Locks.', 'Speichern soll spaeter nur mit gueltigem Lock und passender Resource-Version erlaubt sein.']
});

const AUDIT_MODEL = Object.freeze({
  enabled: false,
  readOnlyPreview: true,
  retentionConfigurable: true,
  minimumFields: ['auditId', 'timestamp', 'actorUserId', 'actorDisplayName', 'source', 'action', 'permission', 'resourceKey', 'oldValueSummary', 'newValueSummary', 'status', 'requestId', 'correlationId'],
  plannedEventTypes: ['permission.check', 'locks.create', 'locks.heartbeat', 'locks.release', 'locks.takeover', 'resource.save.requested', 'resource.save.succeeded', 'resource.save.failed', 'streaming_pc.connection.started', 'streaming_pc.connection.heartbeat', 'streaming_pc.connection.failed', 'streaming_pc.action.requested', 'streaming_pc.action.accepted', 'streaming_pc.action.rejected', 'streaming_pc.action.failed'],
  sources: ['dashboard-local', 'remote-modboard', 'webserver', 'streaming-pc'],
  notes: ['Version 0.1.5D schreibt noch keine Audit-Daten.', 'Produktive Aenderungen muessen spaeter auditpflichtig sein.']
});

const OBS_STATUS_STATE = {
  prepared: true,
  readOnly: true,
  enabled: true,
  configured: true,
  host: '127.0.0.1',
  port: 4455,
  reachable: null,
  status: 'not_checked',
  checkedAt: null,
  lastError: null,
  checkInFlight: false,
  controlEnabled: false,
  noAuthenticationAttempt: true,
  noObsRequestSent: true,
  inventory: null,
  inventoryCheckInFlight: false,
  inventoryCheckedAt: null,
  inventoryLastError: null
};

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
  noRawPayloadStored: true,
  liveStateProtocolVersion: LIVE_STATE_PROTOCOL_VERSION,
  liveStateSeq: 0,
  liveStateIntervalMs: 500,
  lastLiveStateAt: null,
  liveStateUpdatedAt: null,
  liveState: null,
  liveStateSendErrorAt: null,
  liveStateSendError: null
};

let ws = null;
let heartbeatTimer = null;
let liveStateTimer = null;
let reconnectTimer = null;
let started = false;

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/remote-agent/status', (req, res) => { void req; res.json(buildStatusResponse()); });
  registerGet(app, '/api/streaming-pc-connection/status', (req, res) => { void req; res.json(buildStatusResponse()); });
  registerGet(app, '/api/remote-agent/obs/inventory/status', (req, res) => { void req; res.json(buildObsInventoryStatusResponse()); });
  registerGet(app, '/api/remote-agent/permissions/model', (req, res) => { void req; res.json(buildPermissionsModelResponse()); });
  registerGet(app, '/api/remote-agent/locks/status', (req, res) => { void req; res.json(buildLocksStatusResponse()); });
  registerGet(app, '/api/remote-agent/audit/model', (req, res) => { void req; res.json(buildAuditModelResponse()); });
  registerGet(app, '/api/remote-agent/routes', (req, res) => { void req; res.json(buildRoutesResponse()); });

  startStreamingPcConnectionClient();
  console.log(`[remote_agent] ${MODULE_BUILD} Streaming-PC connection client with read-only OBS inventory env diagnostic and live-state push registered. actions=false.`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') return routes.registerGet(app, routePath, handler);
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
  return {
    enabled: readBoolean('STREAMING_PC_CONNECTION_ENABLED', readBoolean('AGENT_CONNECTION_ENABLED', false)),
    remoteWsUrl,
    agentId: readString('STREAMING_PC_CONNECTION_ID', readString('AGENT_ID', 'stream-pc-main')),
    agentName: readString('STREAMING_PC_CONNECTION_NAME', readString('AGENT_NAME', 'Forrest Stream-PC')),
    accessKey: readString('STREAMING_PC_CONNECTION_KEY', readString('AGENT_ACCESS_KEY', '')),
    heartbeatIntervalMs: readInt('STREAMING_PC_HEARTBEAT_INTERVAL_MS', readInt('AGENT_HEARTBEAT_INTERVAL_MS', 30000), 5000, 300000),
    liveStateIntervalMs: readInt('STREAMING_PC_OBS_LIVE_STATE_INTERVAL_MS', readInt('AGENT_OBS_LIVE_STATE_INTERVAL_MS', 500), 250, 5000),
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
  CONNECTION_STATE.liveStateIntervalMs = config.liveStateIntervalMs;
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
        Authorization: `Bearer ${config.accessKey}`,
        'X-SCC-Agent-Id': config.agentId,
        'X-SCC-Agent-Protocol': HANDSHAKE_PROTOCOL_VERSION,
        'X-SCC-Agent-Version': MODULE_VERSION
      },
      handshakeTimeout: 10000
    });
    ws.on('open', () => handleOpen(config));
    ws.on('close', () => handleClose(config, 'socket_close'));
    ws.on('error', (err) => handleError(config, err));
    ws.on('message', () => { /* Version 0.1.6 ignores inbound data. No commands/actions are accepted. */ });
  } catch (err) {
    handleError(config, err);
    handleClose(config, 'connect_exception');
  }
}

function handleOpen(config) {
  const now = new Date().toISOString();
  CONNECTION_STATE.connected = true;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.reason = 'connected_readonly_heartbeat_live_state';
  CONNECTION_STATE.connectedSince = now;
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastError = null;
  CONNECTION_STATE.lastErrorAt = null;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveActionsEnabled = false;
  startHeartbeatTimer(config);
  startLiveStateTimer(config);
  sendHeartbeat(config);
  sendLiveState(config);
}

function handleClose(config, reason) {
  stopHeartbeatTimer();
  stopLiveStateTimer();
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
function stopHeartbeatTimer() { if (heartbeatTimer) clearInterval(heartbeatTimer); heartbeatTimer = null; }
function startLiveStateTimer(config) {
  stopLiveStateTimer();
  liveStateTimer = setInterval(() => sendLiveState(config), config.liveStateIntervalMs);
  if (liveStateTimer && typeof liveStateTimer.unref === 'function') liveStateTimer.unref();
}
function stopLiveStateTimer() { if (liveStateTimer) clearInterval(liveStateTimer); liveStateTimer = null; }
function scheduleReconnect(config) { clearReconnectTimer(); CONNECTION_STATE.reconnectCount += 1; reconnectTimer = setTimeout(() => connectStreamingPc(config), config.reconnectDelayMs); if (reconnectTimer && typeof reconnectTimer.unref === 'function') reconnectTimer.unref(); }
function clearReconnectTimer() { if (reconnectTimer) clearTimeout(reconnectTimer); reconnectTimer = null; }

function sendHeartbeat(config) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  CONNECTION_STATE.heartbeatSeq += 1;
  const now = new Date().toISOString();
  const componentStatus = buildSlimComponentStatus(now);
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
    CONNECTION_STATE.lastHeartbeatAt = now;
    CONNECTION_STATE.lastSeenAt = now;
    CONNECTION_STATE.connectionState = 'connected';
    CONNECTION_STATE.reason = 'heartbeat_sent_slim';
    CONNECTION_STATE.componentStatus = componentStatus;
    CONNECTION_STATE.componentStatusUpdatedAt = now;
    CONNECTION_STATE.actionsEnabled = false;
    CONNECTION_STATE.productiveActionsEnabled = false;
  } catch (err) { handleError(config, err); }
}

function buildSlimComponentStatus(now) {
  return {
    protocolVersion: COMPONENT_STATUS_PROTOCOL_VERSION,
    collectedAt: now,
    localDashboard: { available: true, reachable: true, status: 'available' },
    localServer: { available: true, reachable: true, status: 'running', port: 8080 },
    obs: buildSlimObsComponentStatus(),
    streamerbot: { available: false, reachable: null, status: 'not_checked' },
    actionsEnabled: false,
    productiveActionsEnabled: false,
    noCommands: true,
    noShellOrProcessActions: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    rawPayloadStored: false
  };
}

function buildSlimObsComponentStatus() {
  const liveState = CONNECTION_STATE.liveState && CONNECTION_STATE.liveState.obs ? CONNECTION_STATE.liveState.obs : buildObsLiveState({}).obs;
  return {
    available: liveState.connected === true || liveState.detected === true,
    reachable: liveState.reachable === true ? true : (liveState.connected === true ? true : null),
    status: liveState.connected === true ? 'connected' : (liveState.detected === true ? 'detected' : 'not_reported'),
    currentScene: safeText(liveState.currentScene || liveState.currentProgramSceneName || '', 160) || null,
    liveStatePrepared: true,
    inventoryInHeartbeat: false,
    inventorySource: 'separate_slow_local_status',
    readOnly: true,
    controlEnabled: false
  };
}

function sendLiveState(config) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  CONNECTION_STATE.liveStateSeq += 1;
  const liveState = buildObsLiveState(config);
  const payload = {
    type: 'live_state',
    protocolVersion: LIVE_STATE_PROTOCOL_VERSION,
    agentId: config.agentId,
    seq: CONNECTION_STATE.liveStateSeq,
    collectedAt: liveState.collectedAt,
    obs: liveState.obs
  };
  try {
    ws.send(JSON.stringify(payload));
    const now = new Date().toISOString();
    CONNECTION_STATE.lastLiveStateAt = now;
    CONNECTION_STATE.liveStateUpdatedAt = now;
    CONNECTION_STATE.liveState = liveState;
    CONNECTION_STATE.lastSeenAt = now;
    CONNECTION_STATE.connectionState = 'connected';
    CONNECTION_STATE.reason = 'live_state_sent';
    CONNECTION_STATE.liveStateSendErrorAt = null;
    CONNECTION_STATE.liveStateSendError = null;
    CONNECTION_STATE.actionsEnabled = false;
    CONNECTION_STATE.productiveActionsEnabled = false;
  } catch (err) {
    CONNECTION_STATE.liveStateSendErrorAt = new Date().toISOString();
    CONNECTION_STATE.liveStateSendError = err && err.message ? safeError(err.message) : 'live_state_send_failed';
    handleError(config, err);
  }
}

function buildObsLiveState(config) {
  void config;
  const collectedAt = new Date().toISOString();
  const status = getObsSharedPublicStatus();
  const currentScene = safeText(status.currentProgramSceneName || status.currentProgramScene || '', 160) || null;
  return {
    prepared: true,
    readOnly: true,
    protocolVersion: LIVE_STATE_PROTOCOL_VERSION,
    collectedAt,
    source: 'obs_shared_public_status',
    obs: {
      connected: status.obsConnected === true,
      detected: status.obsDetected === true,
      reachable: status.obsConnected === true || status.obsDetected === true,
      currentScene,
      currentProgramSceneName: currentScene,
      noNewObsWebSocketConnection: true,
      noObsControl: true
    },
    safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
  };
}

function getObsSharedPublicStatus() {
  try {
    if (!obsSharedModule || typeof obsSharedModule.getSharedObs !== 'function') return {};
    const shared = obsSharedModule.getSharedObs(process.env, console);
    if (!shared || typeof shared.getPublicStatus !== 'function') return {};
    return shared.getPublicStatus() || {};
  } catch (err) {
    return {};
  }
}

function buildComponentStatus(config) {
  void config;
  const now = new Date().toISOString();
  const localDashboardUrl = readString('STREAMING_PC_LOCAL_DASHBOARD_URL', 'http://192.168.16.200:8080/dashboard');
  return {
    protocolVersion: COMPONENT_STATUS_PROTOCOL_VERSION,
    collectedAt: now,
    localDashboard: { available: true, name: 'Lokales Dashboard', reachable: true, status: 'available', url: sanitizeLocalUrl(localDashboardUrl), checkedAt: now, detail: 'lokale Dashboard-Adresse hinterlegt' },
    localServer: { available: true, name: 'Lokaler Dashboard-Server', reachable: true, status: 'running', port: 8080, checkedAt: now, detail: 'dieser Node-Server liefert den Heartbeat' },
    obs: buildObsStatus(now),
    streamerbot: { available: false, name: 'Streamer.bot', reachable: null, status: 'not_checked', checkedAt: now, detail: 'Version 0.1.6 liest Streamer.bot noch nicht aktiv aus' },
    actionsEnabled: false,
    productiveActionsEnabled: false,
    noCommands: true,
    noShellOrProcessActions: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    rawPayloadStored: false
  };
}

function buildObsStatus(now) {
  const config = readObsStatusConfig();
  scheduleObsReachabilityCheck(config, now);
  scheduleObsInventoryRead(config, now);
  return buildObsStatusSnapshot(now, config);
}

function readObsStatusConfig() {
  const urlConfig = readObsUrlConfig();
  const enabled = readBoolean('STREAMING_PC_OBS_STATUS_ENABLED', readBoolean('OBS_STATUS_ENABLED', true));
  const host = sanitizeLocalHost(readString('STREAMING_PC_OBS_HOST', readString('OBS_WEBSOCKET_HOST', urlConfig.host)));
  const port = safePort(readInt('STREAMING_PC_OBS_PORT', readInt('OBS_WEBSOCKET_PORT', urlConfig.port), 1, 65535));
  const inventoryReadEnabled = readBoolean('STREAMING_PC_OBS_INVENTORY_READ_ENABLED', readBoolean('OBS_INVENTORY_READ_ENABLED', readBoolean('OBS_WS_INVENTORY_READ_ENABLED', Boolean(process.env.OBS_WS_URL))));
  const password = readStringAllowBlank('STREAMING_PC_OBS_PASSWORD', readStringAllowBlank('OBS_WEBSOCKET_PASSWORD', readStringAllowBlank('OBS_WS_PASSWORD', '')));
  return {
    enabled,
    host,
    port,
    url: `ws://${host}:${port}`,
    urlSource: urlConfig.source,
    inventoryReadEnabled,
    inventoryReadEnabledSource: resolveInventoryReadEnabledSource(inventoryReadEnabled),
    password,
    passwordConfigured: Boolean(password),
    passwordSource: resolvePasswordSource(password)
  };
}

function readObsUrlConfig() {
  const raw = readString('STREAMING_PC_OBS_WS_URL', readString('OBS_WEBSOCKET_URL', readString('OBS_WS_URL', 'ws://127.0.0.1:4455')));
  try {
    const url = new URL(raw);
    const protocolOk = url.protocol === 'ws:' || url.protocol === 'wss:';
    const host = protocolOk ? sanitizeLocalHost(url.hostname) : '127.0.0.1';
    const port = protocolOk ? safePort(url.port ? Number(url.port) : 4455) : 4455;
    return { raw: '', host, port, protocol: protocolOk ? url.protocol : 'ws:', source: envNamePresent('STREAMING_PC_OBS_WS_URL') || envNamePresent('OBS_WEBSOCKET_URL') || envNamePresent('OBS_WS_URL') || 'default' };
  } catch (err) {
    return { raw: '', host: '127.0.0.1', port: 4455, protocol: 'ws:', source: 'default_invalid_url_fallback' };
  }
}

function resolveInventoryReadEnabledSource(enabled) {
  if (envNamePresent('STREAMING_PC_OBS_INVENTORY_READ_ENABLED')) return 'STREAMING_PC_OBS_INVENTORY_READ_ENABLED';
  if (envNamePresent('OBS_INVENTORY_READ_ENABLED')) return 'OBS_INVENTORY_READ_ENABLED';
  if (envNamePresent('OBS_WS_INVENTORY_READ_ENABLED')) return 'OBS_WS_INVENTORY_READ_ENABLED';
  if (enabled && envNamePresent('OBS_WS_URL')) return 'OBS_WS_URL_present_auto_enabled';
  return 'default_false';
}

function resolvePasswordSource(password) {
  if (envNamePresent('STREAMING_PC_OBS_PASSWORD')) return password ? 'STREAMING_PC_OBS_PASSWORD' : 'STREAMING_PC_OBS_PASSWORD_blank';
  if (envNamePresent('OBS_WEBSOCKET_PASSWORD')) return password ? 'OBS_WEBSOCKET_PASSWORD' : 'OBS_WEBSOCKET_PASSWORD_blank';
  if (envNamePresent('OBS_WS_PASSWORD')) return password ? 'OBS_WS_PASSWORD' : 'OBS_WS_PASSWORD_blank';
  return 'not_set';
}

function buildObsStatusSnapshot(now, config) {
  const inventory = buildObsInventorySnapshot(now, config);
  if (!config.enabled) {
    return { available: false, name: 'OBS', reachable: null, status: 'disabled', port: config.port, checkedAt: now, detail: 'OBS-Status-Lesen ist lokal deaktiviert', readOnly: true, controlEnabled: false, noAuthenticationAttempt: true, noObsRequestSent: true, noObsInventoryRequestSent: true, inventory, config: buildObsConfigDiagnostic(config) };
  }
  const reachable = OBS_STATUS_STATE.reachable;
  const status = reachable === true ? 'reachable' : reachable === false ? 'not_reachable' : (OBS_STATUS_STATE.checkInFlight ? 'checking' : 'not_checked');
  const detail = reachable === true
    ? (inventory.active ? 'OBS-WebSocket-Port ist erreichbar; Inventar wurde read-only ueber obs_shared gelesen; keine OBS-Aktion ausgefuehrt' : 'OBS-WebSocket-Port ist lokal erreichbar; es wurde keine OBS-Aktion ausgefuehrt')
    : reachable === false ? 'OBS-WebSocket-Port ist lokal nicht erreichbar oder OBS-WebSocket ist aus' : 'OBS-Erreichbarkeit wird per lokalem TCP-Port geprueft; Inventar-Read ist separat abgesichert';
  return {
    available: true,
    name: 'OBS',
    reachable,
    status,
    port: config.port,
    checkedAt: OBS_STATUS_STATE.checkedAt || now,
    detail,
    readOnly: true,
    controlEnabled: false,
    noAuthenticationAttempt: inventory.status === 'read_disabled',
    noObsRequestSent: !config.inventoryReadEnabled,
    noObsInventoryRequestSent: !config.inventoryReadEnabled,
    inventory,
    config: buildObsConfigDiagnostic(config),
    lastError: OBS_STATUS_STATE.lastError || null
  };
}

function buildObsConfigDiagnostic(config) {
  return {
    enabled: Boolean(config.enabled),
    host: config.host,
    port: config.port,
    url: `ws://${config.host}:${config.port}`,
    urlSource: config.urlSource,
    inventoryReadEnabled: Boolean(config.inventoryReadEnabled),
    inventoryReadEnabledSource: config.inventoryReadEnabledSource,
    acceptedEnvNames: {
      url: ['STREAMING_PC_OBS_WS_URL', 'OBS_WEBSOCKET_URL', 'OBS_WS_URL'],
      password: ['STREAMING_PC_OBS_PASSWORD', 'OBS_WEBSOCKET_PASSWORD', 'OBS_WS_PASSWORD'],
      inventoryReadEnabled: ['STREAMING_PC_OBS_INVENTORY_READ_ENABLED', 'OBS_INVENTORY_READ_ENABLED', 'OBS_WS_INVENTORY_READ_ENABLED', 'OBS_WS_URL present auto-enable']
    },
    passwordConfigured: Boolean(config.passwordConfigured),
    passwordSource: config.passwordSource,
    passwordExposed: false,
    secretsExposed: false
  };
}

function buildObsInventorySnapshot(now, config) {
  const stored = OBS_STATUS_STATE.inventory && typeof OBS_STATUS_STATE.inventory === 'object' ? OBS_STATUS_STATE.inventory : null;
  if (!config.enabled) return preparedInventory(now, 'disabled', false, 'OBS-Status ist deaktiviert.', config);
  if (!config.inventoryReadEnabled) return preparedInventory(now, 'read_disabled', false, 'OBS-Inventar-Read ist vorbereitet, aber nicht aktiviert. Akzeptiert: STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true, OBS_INVENTORY_READ_ENABLED=true oder OBS_WS_URL gesetzt.', config);
  if (stored) return { ...stored, config: buildObsConfigDiagnostic(config) };
  return preparedInventory(now, OBS_STATUS_STATE.inventoryCheckInFlight ? 'checking' : 'not_checked', false, 'OBS-Inventar-Read ist aktiviert; erste read-only Abfrage laeuft oder steht noch aus.', config);
}

function preparedInventory(now, status, active, note, config = {}) {
  return {
    prepared: true,
    active: Boolean(active),
    status,
    checkedAt: now,
    currentScene: null,
    scenes: [],
    sources: [],
    audioSources: [],
    groups: {
      scenes: { prepared: true, active: false, count: 0, items: [] },
      sources: { prepared: true, active: false, count: 0, items: [] },
      audioSources: { prepared: true, active: false, count: 0, items: [] }
    },
    counts: { scenes: 0, sources: 0, audioSources: 0, total: 0 },
    capabilities: {
      sceneInventoryReadPrepared: true,
      sourceInventoryReadPrepared: true,
      audioInventoryReadPrepared: true,
      currentSceneReadPrepared: true,
      realObsInventoryReadActive: false,
      obsWebSocketRequestsEnabled: false, obsSharedConnectionUsed: false,
      actionsEnabled: false,
      controlEnabled: false
    },
    config: buildObsConfigDiagnostic(config),
    disabledReason: status === 'read_disabled' ? 'inventory_read_env_not_enabled_or_url_missing' : null,
    nextStep: status === 'read_disabled' ? 'Setze OBS_WS_URL=ws://127.0.0.1:4455 oder STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true vor dem Node-Start.' : null,
    noSecretExposed: true,
    noControlActions: true,
    note
  };
}

function scheduleObsReachabilityCheck(config, now) {
  if (!config.enabled || !net || OBS_STATUS_STATE.checkInFlight) return;
  const last = OBS_STATUS_STATE.checkedAt ? Date.parse(OBS_STATUS_STATE.checkedAt) : 0;
  if (Number.isFinite(last) && Date.now() - last < 10000) return;
  OBS_STATUS_STATE.enabled = true;
  OBS_STATUS_STATE.configured = true;
  OBS_STATUS_STATE.host = config.host;
  OBS_STATUS_STATE.port = config.port;
  OBS_STATUS_STATE.checkInFlight = true;
  const socket = new net.Socket();
  let finished = false;
  function finish(reachable, errorMessage) {
    if (finished) return;
    finished = true;
    try { socket.destroy(); } catch (err) { /* ignore */ }
    OBS_STATUS_STATE.reachable = reachable === true;
    OBS_STATUS_STATE.status = reachable === true ? 'reachable' : 'not_reachable';
    OBS_STATUS_STATE.checkedAt = new Date().toISOString();
    OBS_STATUS_STATE.lastError = errorMessage ? safeError(errorMessage) : null;
    OBS_STATUS_STATE.checkInFlight = false;
    if (CONNECTION_STATE.componentStatus && typeof CONNECTION_STATE.componentStatus === 'object') {
      CONNECTION_STATE.componentStatus.obs = buildObsStatusSnapshot(OBS_STATUS_STATE.checkedAt, config);
      CONNECTION_STATE.componentStatusUpdatedAt = OBS_STATUS_STATE.checkedAt;
    }
  }
  socket.setTimeout(1200);
  socket.once('connect', () => finish(true, null));
  socket.once('timeout', () => finish(false, 'obs_port_timeout'));
  socket.once('error', (err) => finish(false, err && err.code ? err.code : 'obs_port_not_reachable'));
  try { socket.connect(config.port, config.host); } catch (err) { finish(false, err && err.message ? err.message : 'obs_check_failed'); }
  void now;
}

function scheduleObsInventoryRead(config, now) {
  if (!config.enabled || !config.inventoryReadEnabled || OBS_STATUS_STATE.inventoryCheckInFlight || !obsSharedModule || typeof obsSharedModule.getSharedObs !== 'function') return;
  const last = OBS_STATUS_STATE.inventoryCheckedAt ? Date.parse(OBS_STATUS_STATE.inventoryCheckedAt) : 0;
  if (Number.isFinite(last) && Date.now() - last < 30000) return;
  OBS_STATUS_STATE.inventoryCheckInFlight = true;
  readObsInventory(config)
    .then((inventory) => {
      OBS_STATUS_STATE.inventory = { ...inventory, config: buildObsConfigDiagnostic(config) };
      OBS_STATUS_STATE.inventoryCheckedAt = inventory.checkedAt || new Date().toISOString();
      OBS_STATUS_STATE.inventoryLastError = null;
      OBS_STATUS_STATE.inventoryCheckInFlight = false;
      if (CONNECTION_STATE.componentStatus && typeof CONNECTION_STATE.componentStatus === 'object') {
        CONNECTION_STATE.componentStatus.obs = buildObsStatusSnapshot(OBS_STATUS_STATE.inventoryCheckedAt, config);
        CONNECTION_STATE.componentStatusUpdatedAt = OBS_STATUS_STATE.inventoryCheckedAt;
      }
    })
    .catch((err) => {
      const checkedAt = new Date().toISOString();
      OBS_STATUS_STATE.inventory = preparedInventory(checkedAt, safeObsInventoryErrorStatus(err), false, safeError(err && err.message ? err.message : 'obs_inventory_read_failed'), config);
      OBS_STATUS_STATE.inventoryCheckedAt = checkedAt;
      OBS_STATUS_STATE.inventoryLastError = OBS_STATUS_STATE.inventory.note;
      OBS_STATUS_STATE.inventoryCheckInFlight = false;
    });
  void now;
}

function readObsInventory(config) {
  if (!obsSharedModule || typeof obsSharedModule.getSharedObs !== 'function') {
    return Promise.reject(new Error('obs_shared_unavailable'));
  }
  const shared = obsSharedModule.getSharedObs(process.env, console);
  if (!shared || typeof shared.call !== 'function') {
    return Promise.reject(new Error('obs_shared_call_unavailable'));
  }
  return collectObsInventoryFromShared(shared, config);
}

async function collectObsInventoryFromShared(shared, config) {
  const sceneList = await shared.call('GetSceneList');
  const inputList = typeof shared.getInputList === 'function'
    ? { inputs: await shared.getInputList() }
    : await shared.call('GetInputList');
  const currentScene = await shared.call('GetCurrentProgramScene').catch(() => ({}));
  const inputs = Array.isArray(inputList.inputs) ? inputList.inputs : [];
  const audioItems = [];

  for (const input of inputs.slice(0, 80)) {
    const kind = String(input.inputKind || input.kind || '').toLowerCase();
    const name = String(input.inputName || input.name || '').trim();
    const isAudio = /audio|wasapi|pulse|alsa|coreaudio|dshow_input|browser_source/.test(kind);
    if (!name || !isAudio) continue;
    let muted = null;
    try {
      if (typeof shared.getInputMute === 'function') muted = await shared.getInputMute(name);
      else {
        const mute = await shared.call('GetInputMute', { inputName: name });
        muted = Object.prototype.hasOwnProperty.call(mute, 'inputMuted') ? Boolean(mute.inputMuted) : null;
      }
    } catch (err) { muted = null; }
    audioItems.push({ name: safeText(name, 140), label: safeText(name, 140), id: safeText(name, 140), type: safeText(input.inputKind || 'audio', 80), muted, readOnly: true });
  }

  const scenes = (Array.isArray(sceneList.scenes) ? sceneList.scenes : [])
    .map(scene => ({ name: safeText(scene.sceneName || scene.name, 140), label: safeText(scene.sceneName || scene.name, 140), id: safeText(scene.sceneUuid || scene.sceneName || scene.name, 160), type: 'scene', readOnly: true }))
    .filter(item => item.name)
    .slice(0, 250);
  const sources = inputs
    .map(input => ({ name: safeText(input.inputName || input.name, 140), label: safeText(input.inputName || input.name, 140), id: safeText(input.inputUuid || input.inputName || input.name, 160), type: safeText(input.inputKind || 'input', 80), readOnly: true }))
    .filter(item => item.name)
    .slice(0, 500);
  const checkedAt = new Date().toISOString();
  void config;
  return {
    prepared: true,
    active: true,
    status: 'readonly_inventory_available',
    checkedAt,
    currentScene: safeText(currentScene.currentProgramSceneName || sceneList.currentProgramSceneName || '', 140) || null,
    scenes,
    sources,
    audioSources: audioItems.slice(0, 250),
    groups: {
      scenes: { prepared: true, active: true, count: scenes.length, items: scenes },
      sources: { prepared: true, active: true, count: sources.length, items: sources },
      audioSources: { prepared: true, active: true, count: audioItems.length, items: audioItems.slice(0, 250) }
    },
    counts: { scenes: scenes.length, sources: sources.length, audioSources: audioItems.length, total: scenes.length + sources.length + audioItems.length },
    capabilities: { sceneInventoryReadPrepared: true, sourceInventoryReadPrepared: true, audioInventoryReadPrepared: true, currentSceneReadPrepared: true, realObsInventoryReadActive: true, obsWebSocketRequestsEnabled: true, obsSharedConnectionUsed: true, newObsWebSocketConnectionOpened: false, actionsEnabled: false, controlEnabled: false },
    noSecretExposed: true,
    noControlActions: true,
    newObsWebSocketConnectionOpened: false,
    source: 'obs_shared_existing_connection',
    note: 'OBS-Inventar wurde lokal read-only ueber die bestehende obs_shared-Verbindung gelesen. Keine Steuer-Actions aktiv.'
  };
}

function safeObsInventoryErrorStatus(err) {
  const message = err && err.message ? String(err.message) : '';
  if (message.includes('auth_required')) return 'auth_required';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('socket_closed')) return 'not_reachable';
  return 'read_failed';
}

function buildObsInventoryStatusResponse() {
  const now = new Date().toISOString();
  const obs = buildObsStatus(now);
  const inventory = obs.inventory || preparedInventory(now, 'unknown', false, 'Kein Inventarstatus vorhanden.', readObsStatusConfig());
  return buildBaseResponse({
    displayName: 'OBS Inventar read-only Diagnose',
    readOnly: true,
    route: '/api/remote-agent/obs/inventory/status',
    obs: {
      reachable: obs.reachable,
      status: obs.status,
      port: obs.port,
      checkedAt: obs.checkedAt,
      noObsRequestSent: obs.noObsRequestSent,
      noObsInventoryRequestSent: obs.noObsInventoryRequestSent,
      config: obs.config
    },
    inventoryReadEnabled: inventory.config ? inventory.config.inventoryReadEnabled : false,
    inventoryStatus: inventory.status,
    inventoryActive: inventory.active === true,
    currentScene: inventory.currentScene || null,
    counts: inventory.counts || { scenes: 0, sources: 0, audioSources: 0, total: 0 },
    disabledReason: inventory.disabledReason || null,
    nextStep: inventory.nextStep || null,
    config: inventory.config || obs.config,
    safety: { actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
  });
}

function buildBaseResponse(extra = {}) {
  return { ok: true, module: MODULE, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, statusApiVersion: STATUS_API_VERSION, readOnly: true, writeEnabled: false, actionEnabled: false, productiveAgentRuntime: false, generatedAt: new Date().toISOString(), loadedAt: LOADED_AT, ...extra };
}

function buildStatusResponse() {
  const now = new Date().toISOString();
  const state = buildConnectionStatus();
  return buildBaseResponse({
    displayName: 'Streaming-PC Verbindung',
    status: { connected: state.connected, connectionState: state.connectionState, reason: state.reason, lastSeenAt: state.lastSeenAt, connectedSince: state.connectedSince, lastHeartbeatAt: state.lastHeartbeatAt, heartbeatSeq: state.heartbeatSeq, heartbeatAgeMs: calculateHeartbeatAgeMs(state.lastHeartbeatAt), lastLiveStateAt: state.lastLiveStateAt, liveStateSeq: state.liveStateSeq, liveStateAgeMs: calculateHeartbeatAgeMs(state.lastLiveStateAt), reconnectCount: state.reconnectCount, stale: isHeartbeatStale(state.lastHeartbeatAt) },
    streamingPcConnection: state,
    agent: { agentId: state.agentId, agentName: state.agentName, agentVersion: state.agentVersion, protocolVersion: state.protocolVersion, heartbeatProtocolVersion: state.heartbeatProtocolVersion, liveStateProtocolVersion: state.liveStateProtocolVersion, expectedAgentId: 'stream-pc-main', expectedAgentName: 'Forrest Stream-PC' },
    host: { dashboardServer: 'local-stream-control-center', hostname: safeHostname(), platform: process.platform, nodeVersion: process.version, processUptimeSec: Math.floor(process.uptime()), localTime: now },
    remoteTarget: { publicDashboardUrl: 'https://mods.forrestcgn.de', remoteWsUrl: state.remoteWsUrl, plannedTransport: state.remoteWsUrl.startsWith('wss://') ? 'wss' : 'ws', plannedWsPath: state.wsPath, streamPcPublicPortRequired: false, outgoingConnectionOnly: true },
    capabilities: { ...CAPABILITIES },
    safety: buildSafetyBlock(),
    warnings: ['Version 0.1.6B sendet schlanke Heartbeats plus separaten read-only OBS-Live-State ueber die bestehende Agent-WSS-Verbindung zum Webserver.', 'OBS_WS_URL und OBS_WS_PASSWORD werden als lokale .env-Aliase erkannt; Inventar bleibt separat langsam und wird nicht im Heartbeat gesendet.', 'Es werden keine Steuerbefehle angenommen oder ausgefuehrt.', 'OBS-Steuerung, Sounds, Overlays, Commands, Shell, Dateien, Prozesse und Datenbank-Writes bleiben deaktiviert.', 'OBS-Passwort und Verbindungsschluessel werden nie in Status, UI oder Logs ausgegeben.'],
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
    liveStateProtocolVersion: CONNECTION_STATE.liveStateProtocolVersion,
    liveStateSeq: CONNECTION_STATE.liveStateSeq,
    liveStateIntervalMs: CONNECTION_STATE.liveStateIntervalMs,
    lastLiveStateAt: CONNECTION_STATE.lastLiveStateAt,
    liveStateUpdatedAt: CONNECTION_STATE.liveStateUpdatedAt,
    liveState: CONNECTION_STATE.liveState || buildObsLiveState({}),
    liveStateSendErrorAt: CONNECTION_STATE.liveStateSendErrorAt,
    liveStateSendError: CONNECTION_STATE.liveStateSendError,
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
    modelApiVersion: 'permissions.streaming_pc.v0.1.5',
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
    specialGroups: { sound_profi: { label: 'Sound-Profi', type: 'group_marker', grantsPermissionsByItself: false, permissionSource: 'modulePermissionMatrix', permissionTargetModel: 'target_type + target_key', mayNot: ['Owner-/Security-Rechte verwalten', 'freie Shell-/Datei-/Prozessaktionen ausloesen', 'Datenbankmigrationen starten'] } },
    specialRoles: {},
    legacyCompatibility: { previousSoundProfiRoleRemoved: true, soundProfiWasPreviouslyRoleInOldPlanning: true, soundProfiNowGroupMarker: true },
    warnings: ['Diese Route liefert nur das Modell. Es gibt noch keine produktive User-/Role-/Grant-Speicherung.', 'Permissions muessen spaeter serverseitig geprueft werden; Frontend-Anzeigen sind nie Sicherheitsentscheidung.']
  });
}

function buildLocksStatusResponse() { return buildBaseResponse({ modelApiVersion: 'locks.streaming_pc.v0.1.5', locks: clonePlain(LOCK_MODEL), activeLocks: [], summary: { enabled: false, activeLockCount: 0, staleLockCount: 0, takeoverPendingCount: 0 }, warnings: ['Version 0.1.6 liefert nur den geplanten Lock-Status. Es werden noch keine Locks erstellt oder gespeichert.'] }); }
function buildAuditModelResponse() { return buildBaseResponse({ modelApiVersion: 'audit.streaming_pc.v0.1.5', audit: clonePlain(AUDIT_MODEL), summary: { enabled: false, recentEventsAvailable: false, retentionConfigurable: true }, warnings: ['Version 0.1.6 schreibt noch keine Audit-Events.'] }); }

function buildRoutesResponse() {
  return buildBaseResponse({
    routes: [
      { method: 'GET', path: '/api/remote-agent/status', description: 'Read-only Status fuer lokale Streaming-PC-Verbindung, Komponentenstatus und optionales OBS-Inventar.' },
      { method: 'GET', path: '/api/streaming-pc-connection/status', description: 'Lesbarer Alias fuer Streaming-PC Verbindung. Keine Aktionen.' },
      { method: 'GET', path: '/api/remote-agent/obs/inventory/status', description: 'Kompakte read-only OBS-Inventar-/ENV-Diagnose. Keine OBS-Steuerung.' },
      { method: 'GET', path: '/api/remote-agent/obs/live/status', description: 'Lokaler read-only OBS-Live-Status ueber bestehende obs_shared-Instanz. Keine OBS-Steuerung.' },
      { method: 'GET', path: '/api/remote-agent/permissions/model', description: 'Read-only Rollen-/Permission-Modell. Keine User-/Grant-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/locks/status', description: 'Read-only Lock-Modell und aktueller Null-Status. Keine Lock-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/audit/model', description: 'Read-only Audit-Modell fuer spaetere produktive Aktionen. Keine Audit-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/routes', description: 'Read-only Routenuebersicht fuer Version 0.1.6.' }
    ]
  });
}

function buildSafetyBlock() {
  return { noSoundControl: true, noObsControl: true, noOverlayControl: true, noMediaWrite: true, noTextConfigWrite: true, noCommandsOrChannelpoints: true, noDatabaseWrite: true, noFileWrite: true, noShellOrProcessActions: true, noAgentActionExecution: true, noStreamingPcActionExecution: true, heartbeatOnly: false, liveStateReadOnlyPush: true, outgoingConnectionOnly: true, obsInventoryReadOnly: true, obsLiveStateReadOnly: true, obsInventoryEnvDiagnostic: true, obsInventorySharedConnection: true };
}

function readString(name, fallback) { const value = process.env[name]; if (typeof value !== 'string') return fallback; const trimmed = value.trim(); return trimmed || fallback; }
function readStringAllowBlank(name, fallback) { const value = process.env[name]; if (typeof value !== 'string') return fallback; return value.trim(); }
function readBoolean(name, fallback) { const value = process.env[name]; if (typeof value !== 'string') return Boolean(fallback); return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase()); }
function readInt(name, fallback, min, max) { const parsed = Number.parseInt(process.env[name], 10); if (!Number.isInteger(parsed)) return fallback; if (Number.isFinite(min) && parsed < min) return fallback; if (Number.isFinite(max) && parsed > max) return fallback; return parsed; }
function envNamePresent(name) { return Object.prototype.hasOwnProperty.call(process.env, name) ? name : ''; }
function sanitizeLocalHost(value) {
  const host = String(value || '127.0.0.1').trim().toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '192.168.16.200') return host;
  return '127.0.0.1';
}

function safePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : 4455;
}
function sanitizeLocalUrl(value) { try { const url = new URL(String(value || '').trim()); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad_protocol'); if (!['127.0.0.1', 'localhost', '192.168.16.200'].includes(url.hostname)) throw new Error('bad_host'); return url.toString().slice(0, 180); } catch (err) { return 'http://192.168.16.200:8080/dashboard'; } }
function sanitizeRemoteWsUrl(value) { try { const url = new URL(value || DEFAULT_REMOTE_WS_URL); if (url.protocol !== 'wss:' && url.protocol !== 'ws:') return DEFAULT_REMOTE_WS_URL; url.username = ''; url.password = ''; url.search = ''; url.hash = ''; return url.toString(); } catch (err) { return DEFAULT_REMOTE_WS_URL; } }
function safeWsPath(value) { try { return new URL(value || DEFAULT_REMOTE_WS_URL).pathname || '/agent-ws'; } catch (err) { return '/agent-ws'; } }
function safeAgentId(value) { const normalized = String(value || 'stream-pc-main').trim(); return /^[a-zA-Z0-9_-]{3,64}$/.test(normalized) ? normalized : 'stream-pc-main'; }
function safeAgentName(value) { const text = String(value || 'Forrest Stream-PC').trim().replace(/[^\p{L}\p{N} _.-]/gu, ''); return text.slice(0, 80) || 'Forrest Stream-PC'; }
function safeReason(value) { return String(value || 'unknown').trim().replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80) || 'unknown'; }
function safeText(value, max) { return String(value || '').trim().replace(/[\u0000-\u001f]/g, '').slice(0, max || 140); }
function safeError(value) { return String(value || 'connection_error').replace(/Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [masked]').replace(/[A-Za-z0-9_-]{24,}/g, '[masked]').slice(0, 240); }
function calculateHeartbeatAgeMs(value) { if (!value) return null; const time = Date.parse(value); if (!Number.isFinite(time)) return null; return Math.max(0, Date.now() - time); }
function isHeartbeatStale(value) { const age = calculateHeartbeatAgeMs(value); if (age === null) return false; return age > Math.max(90000, CONNECTION_STATE.heartbeatIntervalMs * 3); }
function clonePlain(value) { return JSON.parse(JSON.stringify(value)); }
function safeHostname() { try { return require('os').hostname(); } catch (err) { return 'unknown'; } }

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, buildStatusResponse, buildPermissionsModelResponse, GROUP_MARKERS, buildLocksStatusResponse, buildAuditModelResponse };
