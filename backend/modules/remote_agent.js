'use strict';

let routes = null;
try { routes = require('./helpers/helper_routes'); } catch (err) { routes = null; }

let WebSocket = null;
try { WebSocket = require('ws'); } catch (err) { WebSocket = null; }

let net = null;
try { net = require('net'); } catch (err) { net = null; }

let fs = null;
try { fs = require('fs'); } catch (err) { fs = null; }

let path = null;
try { path = require('path'); } catch (err) { path = null; }


let obsSharedModule = null;
try { obsSharedModule = require('./obs_shared'); } catch (err) { obsSharedModule = null; }

const MODULE = 'remote_agent';
const MODULE_VERSION = '0.1.8D';
const MODULE_BUILD = 'RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC';
const STATUS_API_VERSION = 'rdap_agent_media_inventory_exclude_tts_generated_058k.v1';
const HANDSHAKE_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const COMPONENT_STATUS_PROTOCOL_VERSION = 'rdap-component-status.v1';
const LIVE_STATE_PROTOCOL_VERSION = 'rdap-agent-live-state.v1';
const INVENTORY_SYNC_PROTOCOL_VERSION = 'rdap-agent-obs-inventory.v1';
const MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION = 'rdap-agent-media-inventory.v1';
const MEDIA_FULL_SYNC_PROTOCOL_VERSION = 'rdap-agent-media-full-sync.v1';
const DEFAULT_REMOTE_WS_URL = 'wss://mods.forrestcgn.de/agent-ws';

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const MEDIA_VIDEO_EXTENSIONS = new Set(['.webm', '.mp4']);
const MEDIA_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_SCAN_DEFAULT_LIMIT = 500;
const MEDIA_SCAN_HARD_LIMIT = 2000;
const MEDIA_SCAN_MAX_DEPTH = 5;
const MEDIA_WSS_TRANSPORT_MAX_BYTES = 60000;
const MEDIA_WSS_TRANSPORT_LIMITS = Object.freeze([120, 80, 40, 20]);
const MEDIA_FULL_SYNC_CHUNK_SIZE = 50;
const MEDIA_INDEX_SYNC_FOUNDATION_BUILD = 'RDAP_0.2.53_MEDIA_SYNC_STATUS_AND_INDEX_FOUNDATION';
const MEDIA_ROOTS = Object.freeze([
  { key: 'sounds', label: 'Sounds', localPathHint: 'htdocs/assets/sounds', publicBasePath: '/assets/sounds', types: ['audio', 'video'] },
  { key: 'videos', label: 'Videos', localPathHint: 'htdocs/assets/videos', publicBasePath: '/assets/videos', types: ['video'] },
  { key: 'images', label: 'Bilder', localPathHint: 'htdocs/assets/images', publicBasePath: '/assets/images', types: ['image'] }
]);
const MEDIA_SYNC_EXCLUDED_PATH_RULES = Object.freeze([
  {
    key: 'tts_generated_temp_files',
    rootKey: 'sounds',
    relativePathPrefix: 'tts/generated/',
    reason: 'tts_generated_files_are_temporary_and_not_part_of_persistent_media_sync'
  }
]);

const LOADED_AT = new Date().toISOString();

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'remote-dashboard',
  description: 'Streaming-PC connection client with read-only component status, OBS live-state/inventory and Media slow-sync over the existing agent WSS. No productive actions.',
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
  obsInventorySyncPush: true,
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
  liveStateSendError: null,
  inventorySyncProtocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
  inventorySyncSeq: 0,
  inventorySyncIntervalMs: 30000,
  lastInventorySyncAt: null,
  inventorySyncUpdatedAt: null,
  inventorySync: null,
  inventorySyncSendErrorAt: null,
  inventorySyncSendError: null,
  mediaInventorySyncProtocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
  mediaInventorySyncSeq: 0,
  mediaInventorySyncIntervalMs: 60000,
  lastMediaInventorySyncAt: null,
  mediaInventorySyncUpdatedAt: null,
  mediaInventorySync: null,
  mediaInventorySyncSendErrorAt: null,
  mediaInventorySyncSendError: null,
  mediaInventoryInitialSendPrepared: true,
  mediaInventoryInitialSendDelaysMs: [1500, 5000, 15000],
  mediaInventoryInitialSendScheduledAt: null,
  mediaInventoryInitialSendAttempts: 0,
  lastMediaInventoryInitialSendAttemptAt: null,
  lastMediaInventoryInitialSendSuccessAt: null,
  mediaInventoryInitialSendCompleted: false,
  mediaFullSyncProtocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
  mediaFullSyncPrepared: true,
  mediaFullSyncSeq: 0,
  mediaFullSyncState: 'pending',
  mediaFullSyncId: null,
  mediaFullSyncChunkSize: MEDIA_FULL_SYNC_CHUNK_SIZE,
  mediaFullSyncTotalChunks: 0,
  mediaFullSyncSentChunks: 0,
  mediaFullSyncTotalItems: 0,
  mediaFullSyncSentItems: 0,
  mediaFullSyncStartedAt: null,
  mediaFullSyncLastChunkAt: null,
  mediaFullSyncCompletedAt: null,
  mediaFullSyncLastError: null
};

let ws = null;
let heartbeatTimer = null;
let liveStateTimer = null;
let inventorySyncTimer = null;
let mediaInventorySyncTimer = null;
let reconnectTimer = null;
let started = false;

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/remote-agent/status', (req, res) => { void req; res.json(buildStatusResponse()); });
  registerGet(app, '/api/streaming-pc-connection/status', (req, res) => { void req; res.json(buildStatusResponse()); });
  registerGet(app, '/api/remote-agent/obs/inventory/status', (req, res) => { void req; res.json(buildObsInventoryStatusResponse()); });
  registerGet(app, '/api/remote-agent/media/inventory/status', (req, res) => { res.json(buildMediaInventoryStatusResponse(req)); });
  registerGet(app, '/api/remote-agent/permissions/model', (req, res) => { void req; res.json(buildPermissionsModelResponse()); });
  registerGet(app, '/api/remote-agent/locks/status', (req, res) => { void req; res.json(buildLocksStatusResponse()); });
  registerGet(app, '/api/remote-agent/audit/model', (req, res) => { void req; res.json(buildAuditModelResponse()); });
  registerGet(app, '/api/remote-agent/routes', (req, res) => { void req; res.json(buildRoutesResponse()); });

  startStreamingPcConnectionClient();
  console.log(`[remote_agent] ${MODULE_BUILD} Streaming-PC connection client with read-only OBS plus Media slow-sync registered. actions=false.`);
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
    inventorySyncIntervalMs: readInt('STREAMING_PC_OBS_INVENTORY_SYNC_INTERVAL_MS', readInt('AGENT_OBS_INVENTORY_SYNC_INTERVAL_MS', 30000), 10000, 300000),
    mediaInventorySyncIntervalMs: readInt('STREAMING_PC_MEDIA_INVENTORY_SYNC_INTERVAL_MS', readInt('AGENT_MEDIA_INVENTORY_SYNC_INTERVAL_MS', 60000), 30000, 300000),
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
  CONNECTION_STATE.inventorySyncIntervalMs = config.inventorySyncIntervalMs;
  CONNECTION_STATE.mediaInventorySyncIntervalMs = config.mediaInventorySyncIntervalMs;
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
  startInventorySyncTimer(config);
  startMediaInventorySyncTimer(config);
  sendHeartbeat(config);
  sendLiveState(config);
  setTimeout(() => sendInventorySync(config, 'initial'), 1000).unref?.();
  scheduleInitialMediaInventorySync(config);
}

function scheduleInitialMediaInventorySync(config) {
  const delays = Array.isArray(CONNECTION_STATE.mediaInventoryInitialSendDelaysMs)
    ? CONNECTION_STATE.mediaInventoryInitialSendDelaysMs
    : [1500, 5000, 15000];
  CONNECTION_STATE.mediaInventoryInitialSendPrepared = true;
  CONNECTION_STATE.mediaInventoryInitialSendScheduledAt = new Date().toISOString();
  CONNECTION_STATE.mediaInventoryInitialSendAttempts = 0;
  CONNECTION_STATE.lastMediaInventoryInitialSendAttemptAt = null;
  CONNECTION_STATE.lastMediaInventoryInitialSendSuccessAt = null;
  CONNECTION_STATE.mediaInventoryInitialSendCompleted = false;
  for (let index = 0; index < delays.length; index += 1) {
    const delay = Math.max(0, Number(delays[index]) || 0);
    const timer = setTimeout(() => {
      void attemptInitialMediaInventorySync(config, index + 1, delay);
    }, delay);
    if (timer && typeof timer.unref === 'function') timer.unref();
  }
}

async function attemptInitialMediaInventorySync(config, attempt, delayMs) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (CONNECTION_STATE.mediaInventoryInitialSendCompleted === true) return;
  CONNECTION_STATE.mediaInventoryInitialSendAttempts += 1;
  CONNECTION_STATE.lastMediaInventoryInitialSendAttemptAt = new Date().toISOString();
  CONNECTION_STATE.reason = `media_inventory_initial_send_attempt_${attempt}`;
  await sendMediaInventorySync(config, `initial_retry_${attempt}_${delayMs}ms`);
}


function handleClose(config, reason) {
  stopHeartbeatTimer();
  stopLiveStateTimer();
  stopInventorySyncTimer();
  stopMediaInventorySyncTimer();
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
function startInventorySyncTimer(config) {
  stopInventorySyncTimer();
  inventorySyncTimer = setInterval(() => sendInventorySync(config, 'timer'), config.inventorySyncIntervalMs);
  if (inventorySyncTimer && typeof inventorySyncTimer.unref === 'function') inventorySyncTimer.unref();
}
function stopInventorySyncTimer() { if (inventorySyncTimer) clearInterval(inventorySyncTimer); inventorySyncTimer = null; }
function startMediaInventorySyncTimer(config) {
  stopMediaInventorySyncTimer();
  mediaInventorySyncTimer = setInterval(() => sendMediaInventorySync(config, 'timer'), config.mediaInventorySyncIntervalMs);
  if (mediaInventorySyncTimer && typeof mediaInventorySyncTimer.unref === 'function') mediaInventorySyncTimer.unref();
}
function stopMediaInventorySyncTimer() { if (mediaInventorySyncTimer) clearInterval(mediaInventorySyncTimer); mediaInventorySyncTimer = null; }
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
    obs: buildLiveStateTransportObs(liveState.obs)
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


async function sendInventorySync(config, reason) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  CONNECTION_STATE.inventorySyncSeq += 1;
  try {
    const inventory = await buildObsInventorySyncSnapshot(config, reason || 'manual');
    const payload = {
      type: 'inventory_sync',
      protocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
      agentId: config.agentId,
      seq: CONNECTION_STATE.inventorySyncSeq,
      collectedAt: inventory.checkedAt,
      inventory: buildInventoryTransportPayload(inventory)
    };
    const json = JSON.stringify(payload);
    if (Buffer.byteLength(json, 'utf8') > 60000) {
      payload.inventory = buildInventoryTransportPayload(inventory, { compact: true });
    }
    ws.send(JSON.stringify(payload));
    const now = new Date().toISOString();
    CONNECTION_STATE.lastInventorySyncAt = now;
    CONNECTION_STATE.inventorySyncUpdatedAt = now;
    CONNECTION_STATE.inventorySync = payload.inventory;
    CONNECTION_STATE.lastSeenAt = now;
    CONNECTION_STATE.connectionState = 'connected';
    CONNECTION_STATE.reason = 'inventory_sync_sent';
    CONNECTION_STATE.inventorySyncSendErrorAt = null;
    CONNECTION_STATE.inventorySyncSendError = null;
  } catch (err) {
    CONNECTION_STATE.inventorySyncSendErrorAt = new Date().toISOString();
    CONNECTION_STATE.inventorySyncSendError = err && err.message ? safeError(err.message) : 'inventory_sync_failed';
  }
}


function buildMediaSyncFoundationStatus(inventory = {}) {
  const counts = inventory && inventory.counts ? inventory.counts : {};
  const totalSeen = Number(counts.totalSeen || counts.total || 0);
  const returned = Number(counts.returned || counts.total || 0);
  const truncated = inventory && inventory.truncated === true;
  return {
    prepared: true,
    build: MEDIA_INDEX_SYNC_FOUNDATION_BUILD,
    readOnly: true,
    localIsFileTruth: true,
    onlineIndexPlanned: true,
    onlineDatabaseTarget: 'remote_modboard_mariadb.remote_media_index',
    fullSyncPrepared: true,
    chunkSyncPrepared: true,
    deltaSyncPrepared: true,
    bidirectionalSyncPlanned: true,
    onlineToAgentQueuePlanned: true,
    currentTransport: 'agent_wss_compact_memory_only',
    currentTransportLimited: true,
    currentTransportLimitItems: MEDIA_WSS_TRANSPORT_LIMITS[0],
    currentTransportMaxBytes: MEDIA_WSS_TRANSPORT_MAX_BYTES,
    excludedPathRules: buildMediaSyncExcludedPathRules(),
    ttsGeneratedExcludedFromSync: safeNonNegativeNumber(counts.ttsGeneratedExcludedFromSync),
    completeInventoryInCurrentTransport: !truncated && returned >= totalSeen,
    progress: {
      state: truncated ? 'compact_limited' : (returned > 0 ? 'available' : 'pending'),
      returned,
      totalSeen,
      percent: totalSeen > 0 ? Math.min(100, Math.round((returned / totalSeen) * 100)) : 0,
      truncated
    },
    note: '0.2.58K sendet TTS-generated temp files unter sounds/tts/generated/ nicht mehr im Media-Inventory/Full-Sync. Alles bleibt read-only; keine Dateiaktion, kein DB-Write.'
  };
}


async function sendMediaInventorySync(config, reason) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  CONNECTION_STATE.mediaInventorySyncSeq += 1;
  try {
    const inventory = buildMediaInventorySyncSnapshot(reason || 'timer');
    const built = buildCompactMediaInventoryFrame(config, inventory, CONNECTION_STATE.mediaInventorySyncSeq);
    if (!built || !built.json || !built.payload) {
      CONNECTION_STATE.mediaInventorySyncSendErrorAt = new Date().toISOString();
      CONNECTION_STATE.mediaInventorySyncSendError = 'media_inventory_payload_too_large_after_compact';
      CONNECTION_STATE.reason = 'media_inventory_sync_failed_payload_too_large_after_compact';
      return;
    }
    ws.send(built.json);
    const now = new Date().toISOString();
    CONNECTION_STATE.lastMediaInventorySyncAt = now;
    CONNECTION_STATE.mediaInventorySyncUpdatedAt = now;
    CONNECTION_STATE.mediaInventorySync = built.payload.inventory;
    CONNECTION_STATE.lastSeenAt = now;
    CONNECTION_STATE.connectionState = 'connected';
    CONNECTION_STATE.reason = 'media_inventory_sync_sent_compact';
    CONNECTION_STATE.mediaInventorySyncSendErrorAt = null;
    CONNECTION_STATE.mediaInventorySyncSendError = null;
    CONNECTION_STATE.actionsEnabled = false;
    CONNECTION_STATE.productiveActionsEnabled = false;
    if (String(reason || '').startsWith('initial')) {
      CONNECTION_STATE.mediaInventoryInitialSendCompleted = true;
      CONNECTION_STATE.lastMediaInventoryInitialSendSuccessAt = now;
    }
    await sendMediaFullSyncChunks(config, inventory, reason || 'timer');
  } catch (err) {
    CONNECTION_STATE.mediaInventorySyncSendErrorAt = new Date().toISOString();
    CONNECTION_STATE.mediaInventorySyncSendError = err && err.message ? safeError(err.message) : 'media_inventory_sync_failed';
    CONNECTION_STATE.reason = 'media_inventory_sync_failed';
  }
}

async function sendMediaFullSyncChunks(config, compactInventory, reason) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const startedAt = new Date().toISOString();
  CONNECTION_STATE.mediaFullSyncState = 'running';
  CONNECTION_STATE.mediaFullSyncStartedAt = startedAt;
  CONNECTION_STATE.mediaFullSyncCompletedAt = null;
  CONNECTION_STATE.mediaFullSyncLastError = null;
  try {
    const inventory = scanLocalMediaInventory(MEDIA_SCAN_HARD_LIMIT);
    const items = Array.isArray(inventory.items) ? inventory.items.map(sanitizeMediaTransportItem).filter(Boolean) : [];
    const totalItems = items.length;
    const totalChunks = Math.max(1, Math.ceil(totalItems / MEDIA_FULL_SYNC_CHUNK_SIZE));
    const syncId = safeMediaId(`${config.agentId || 'stream-pc-main'}:${Date.now()}:${CONNECTION_STATE.mediaInventorySyncSeq}`);
    CONNECTION_STATE.mediaFullSyncId = syncId;
    CONNECTION_STATE.mediaFullSyncTotalChunks = totalChunks;
    CONNECTION_STATE.mediaFullSyncSentChunks = 0;
    CONNECTION_STATE.mediaFullSyncTotalItems = totalItems;
    CONNECTION_STATE.mediaFullSyncSentItems = 0;
    for (let index = 0; index < totalChunks; index += 1) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const chunkItems = items.slice(index * MEDIA_FULL_SYNC_CHUNK_SIZE, (index + 1) * MEDIA_FULL_SYNC_CHUNK_SIZE);
      CONNECTION_STATE.mediaFullSyncSeq += 1;
      const payload = {
        type: 'media_inventory_full_sync_chunk',
        protocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
        agentId: config.agentId,
        seq: CONNECTION_STATE.mediaFullSyncSeq,
        syncId,
        syncReason: safeReason(reason || 'timer'),
        confirmFullSync: true,
        mediaIndexDataOnly: true,
        collectedAt: inventory.scannedAt || startedAt,
        chunkIndex: index + 1,
        totalChunks,
        totalItems,
        chunkItems: chunkItems.length,
        inventory: {
          prepared: true,
          source: 'local_stream_pc_filesystem_readonly_full_sync_chunk',
          scannedAt: inventory.scannedAt || startedAt,
          counts: inventory.counts || (compactInventory && compactInventory.counts) || {},
          roots: inventory.roots || [],
          items: chunkItems
        },
        safety: {
          readOnlyAgentScan: true,
          noFileContent: true,
          noAbsolutePaths: true,
          noAgentActionExecution: true,
          uploadEnabled: false,
          editEnabled: false,
          deleteEnabled: false
        }
      };
      const json = JSON.stringify(payload);
      if (Buffer.byteLength(json, 'utf8') > MEDIA_WSS_TRANSPORT_MAX_BYTES) {
        CONNECTION_STATE.mediaFullSyncState = 'failed';
        CONNECTION_STATE.mediaFullSyncLastError = 'media_full_sync_chunk_too_large';
        return;
      }
      ws.send(json);
      const now = new Date().toISOString();
      CONNECTION_STATE.mediaFullSyncState = 'chunk';
      CONNECTION_STATE.mediaFullSyncSentChunks = index + 1;
      CONNECTION_STATE.mediaFullSyncSentItems += chunkItems.length;
      CONNECTION_STATE.mediaFullSyncLastChunkAt = now;
      CONNECTION_STATE.lastSeenAt = now;
    }
    CONNECTION_STATE.mediaFullSyncState = 'complete';
    CONNECTION_STATE.mediaFullSyncCompletedAt = new Date().toISOString();
  } catch (err) {
    CONNECTION_STATE.mediaFullSyncState = 'failed';
    CONNECTION_STATE.mediaFullSyncLastError = err && err.message ? safeError(err.message) : 'media_full_sync_failed';
  }
}

function buildMediaFullSyncStatus() {
  return {
    prepared: true,
    protocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
    state: CONNECTION_STATE.mediaFullSyncState,
    syncId: CONNECTION_STATE.mediaFullSyncId,
    chunkSize: CONNECTION_STATE.mediaFullSyncChunkSize,
    sentChunks: CONNECTION_STATE.mediaFullSyncSentChunks,
    totalChunks: CONNECTION_STATE.mediaFullSyncTotalChunks,
    sentItems: CONNECTION_STATE.mediaFullSyncSentItems,
    totalItems: CONNECTION_STATE.mediaFullSyncTotalItems,
    startedAt: CONNECTION_STATE.mediaFullSyncStartedAt,
    lastChunkAt: CONNECTION_STATE.mediaFullSyncLastChunkAt,
    completedAt: CONNECTION_STATE.mediaFullSyncCompletedAt,
    lastError: CONNECTION_STATE.mediaFullSyncLastError,
    gatedServerWriteRequired: true,
    requiredServerGates: ['MEDIA_INDEX_WRITE_ENABLED', 'MEDIA_INDEX_DATA_WRITE_ENABLED', 'MEDIA_INDEX_FULL_SYNC_ENABLED'],
    noFileContent: true,
    noAbsolutePaths: true,
    uploadEnabled: false,
    editEnabled: false,
    deleteEnabled: false
  };
}

function buildCompactMediaInventoryFrame(config, inventory, seq) {
  for (const limit of MEDIA_WSS_TRANSPORT_LIMITS) {
    const payload = {
      type: 'media_inventory_sync',
      protocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
      agentId: config.agentId,
      seq,
      collectedAt: inventory.scannedAt,
      inventory: buildMediaInventoryTransportPayload(inventory, { transport: true, compact: true, limit, omitGroupItems: true })
    };
    const json = JSON.stringify(payload);
    if (Buffer.byteLength(json, 'utf8') <= MEDIA_WSS_TRANSPORT_MAX_BYTES) return { payload, json };
  }
  return null;
}

function buildMediaInventorySyncSnapshot(reason) {
  const inventory = scanLocalMediaInventory(MEDIA_SCAN_DEFAULT_LIMIT);
  inventory.syncReason = safeReason(reason || 'timer');
  return inventory;
}

function buildMediaInventoryTransportPayload(inventory, options = {}) {
  const source = inventory && typeof inventory === 'object' && !Array.isArray(inventory) ? inventory : {};
  const compact = options.compact === true;
  const requestedLimit = Number(options.limit || (compact ? MEDIA_WSS_TRANSPORT_LIMITS[0] : MEDIA_SCAN_DEFAULT_LIMIT));
  const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : MEDIA_SCAN_DEFAULT_LIMIT, MEDIA_SCAN_HARD_LIMIT));
  const items = Array.isArray(source.items) ? source.items.slice(0, limit).map(sanitizeMediaTransportItem).filter(Boolean) : [];
  const groups = options.omitGroupItems === true ? stripMediaGroupItems(buildMediaGroupsFromItems(items, source.groups)) : buildMediaGroupsFromItems(items, source.groups);
  const counts = buildMediaCountsFromItems(items, source.counts);
  return {
    prepared: true,
    active: source.active === true && items.length > 0,
    status: source.active === true && items.length > 0 ? 'readonly_media_inventory_available' : safeReason(source.status || 'not_ready'),
    scannedAt: safeText(source.scannedAt || new Date().toISOString(), 40),
    checkedAt: safeText(source.scannedAt || new Date().toISOString(), 40),
    source: 'local_stream_pc_filesystem_readonly',
    items,
    groups,
    counts,
    syncFoundation: buildMediaSyncFoundationStatus({ ...source, items, counts, truncated: source.truncated === true }),
    exclusionPolicy: buildMediaInventoryExclusionPolicy(counts),
    onlineIndexTarget: { prepared: true, planned: true, database: 'remote_modboard_mariadb', table: 'remote_media_index', activeWrites: false },
    limit,
    hardLimit: MEDIA_SCAN_HARD_LIMIT,
    maxDepth: MEDIA_SCAN_MAX_DEPTH,
    truncated: source.truncated === true || (Array.isArray(source.items) && source.items.length > items.length),
    hasMore: source.hasMore === true || source.truncated === true || (Array.isArray(source.items) && source.items.length > items.length),
    nextCursor: source.truncated === true || (Array.isArray(source.items) && source.items.length > items.length) ? 'prepared_later' : null,
    emptyReason: items.length ? null : safeReason(source.emptyReason || 'no_allowed_media_files_found'),
    compact,
    readOnly: true,
    uploadEnabled: false,
    editEnabled: false,
    deleteEnabled: false
  };
}

function sanitizeMediaTransportItem(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const rootKey = safeMediaRootKey(source.rootKey);
  const relativePath = normalizeMediaRelativePath(source.relativePath || '');
  const extension = safeMediaExtension(source.extension || (path ? path.extname(relativePath) : ''));
  const kind = safeMediaKind(source.kind || mediaKindForExtension(extension));
  if (!rootKey || !relativePath || !extension || !kind) return null;
  const name = safeText(source.name || (path ? path.basename(relativePath) : relativePath.split('/').pop()) || '', 140);
  if (!name) return null;
  return {
    id: safeMediaId(source.id || `${rootKey}:${relativePath}`),
    rootKey,
    rootLabel: safeText(source.rootLabel || rootKey, 80),
    kind,
    name,
    relativePath,
    publicPath: safePublicMediaPath(source.publicPath || `/${rootKey}/${relativePath}`),
    extension,
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    readOnly: true
  };
}

function scanLocalMediaInventory(limit) {
  const generatedAt = new Date().toISOString();
  const safeLimit = Math.max(1, Math.min(Number(limit || MEDIA_SCAN_DEFAULT_LIMIT), MEDIA_SCAN_HARD_LIMIT));
  const items = [];
  const groups = emptyMediaGroups();
  const counts = { total: 0, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0, excludedFromSync: 0, ttsGeneratedExcludedFromSync: 0 };
  const errors = [];
  let truncated = false;

  if (!fs || !path) {
    return preparedMediaInventory(generatedAt, 'node_fs_or_path_unavailable', false, safeLimit, items, groups, counts, errors, truncated);
  }

  const projectRoot = path.resolve(__dirname, '..', '..');
  for (const root of MEDIA_ROOTS) {
    const absoluteRoot = path.resolve(projectRoot, root.localPathHint);
    if (!absoluteRoot.startsWith(projectRoot)) {
      errors.push({ rootKey: root.key, error: 'root_outside_project' });
      continue;
    }
    if (!fs.existsSync(absoluteRoot)) {
      groups[root.key].exists = false;
      groups[root.key].emptyReason = 'root_missing';
      continue;
    }
    walkMediaRoot({ root, absoluteRoot, currentDir: absoluteRoot, depth: 0, limit: safeLimit, items, groups, counts, errors, truncatedRef: () => truncated, setTruncated: () => { truncated = true; } });
    if (truncated) break;
  }

  items.sort((a, b) => String(a.rootKey).localeCompare(String(b.rootKey)) || String(a.relativePath).localeCompare(String(b.relativePath)));
  for (const key of Object.keys(groups)) groups[key].items.sort((a, b) => String(a.relativePath).localeCompare(String(b.relativePath)));
  counts.total = items.length;
  counts.returned = items.length;
  return preparedMediaInventory(generatedAt, items.length ? 'readonly_media_inventory_available' : 'no_allowed_media_files_found', items.length > 0, safeLimit, items, groups, counts, errors, truncated);
}

function preparedMediaInventory(scannedAt, status, active, limit, items, groups, counts, errors, truncated) {
  return {
    prepared: true,
    active: Boolean(active),
    status: safeReason(status || 'not_ready'),
    source: 'local_stream_pc_filesystem_readonly',
    scannedAt,
    roots: MEDIA_ROOTS.map(root => ({ key: root.key, label: root.label, exists: groups[root.key].exists, count: groups[root.key].count })),
    items,
    groups,
    counts,
    syncFoundation: buildMediaSyncFoundationStatus({ active: Boolean(active), items, counts, truncated: truncated === true, scannedAt, status }),
    exclusionPolicy: buildMediaInventoryExclusionPolicy(counts),
    onlineIndexTarget: { prepared: true, planned: true, database: 'remote_modboard_mariadb', table: 'remote_media_index', activeWrites: false },
    limit,
    hardLimit: MEDIA_SCAN_HARD_LIMIT,
    maxDepth: MEDIA_SCAN_MAX_DEPTH,
    truncated: truncated === true,
    hasMore: truncated === true,
    nextCursor: truncated === true ? 'prepared_later' : null,
    errors,
    emptyReason: items.length ? null : safeReason(status || 'no_allowed_media_files_found'),
    readOnly: true,
    uploadEnabled: false,
    editEnabled: false,
    deleteEnabled: false
  };
}

function emptyMediaGroups() {
  return {
    sounds: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    videos: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    images: { prepared: true, exists: true, count: 0, items: [], emptyReason: null }
  };
}

function walkMediaRoot({ root, absoluteRoot, currentDir, depth, limit, items, groups, counts, errors, truncatedRef, setTruncated }) {
  if (truncatedRef()) return;
  if (depth > MEDIA_SCAN_MAX_DEPTH) {
    counts.skipped += 1;
    return;
  }
  let entries = [];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch (err) {
    errors.push({ rootKey: root.key, error: 'read_dir_failed' });
    return;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (truncatedRef()) return;
    if (!entry || !entry.name || entry.name.startsWith('.')) continue;
    const absolutePath = path.join(currentDir, entry.name);
    if (!absolutePath.startsWith(absoluteRoot)) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isSymbolicLink()) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isDirectory()) {
      walkMediaRoot({ root, absoluteRoot, currentDir: absolutePath, depth: depth + 1, limit, items, groups, counts, errors, truncatedRef, setTruncated });
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!MEDIA_ALLOWED_EXTENSIONS.includes(ext)) {
      counts.skipped += 1;
      continue;
    }
    const rel = normalizeMediaRelativePath(path.relative(absoluteRoot, absolutePath));
    if (!rel || rel.includes('..')) {
      counts.skipped += 1;
      continue;
    }
    const kind = mediaKindForExtension(ext);
    const exclusion = classifyMediaSyncExclusion(root.key, rel, kind);
    if (exclusion.excluded === true) {
      counts.excludedFromSync += 1;
      if (exclusion.key === 'tts_generated_temp_files') counts.ttsGeneratedExcludedFromSync += 1;
      continue;
    }
    counts.totalSeen += 1;
    if (items.length >= limit) {
      setTruncated();
      return;
    }
    let stat = null;
    try { stat = fs.statSync(absolutePath); } catch (err) { counts.skipped += 1; continue; }
    const item = {
      id: `${root.key}:${rel}`,
      rootKey: root.key,
      rootLabel: root.label,
      kind,
      name: path.basename(rel),
      relativePath: rel,
      publicPath: `${root.publicBasePath}/${rel}`,
      extension: ext,
      sizeBytes: stat.size,
      modifiedAt: stat.mtime ? stat.mtime.toISOString() : null,
      readOnly: true
    };
    items.push(item);
    groups[root.key].items.push(item);
    groups[root.key].count += 1;
    counts[root.key] = (counts[root.key] || 0) + 1;
    counts[kind] = (counts[kind] || 0) + 1;
  }
}


function classifyMediaSyncExclusion(rootKey, relativePath, kind) {
  const safeRoot = safeMediaRootKey(rootKey);
  const rel = normalizeMediaRelativePath(relativePath).toLowerCase();
  const safeKind = safeMediaKind(kind || 'media');
  for (const rule of MEDIA_SYNC_EXCLUDED_PATH_RULES) {
    if (safeRoot === rule.rootKey && rel.startsWith(rule.relativePathPrefix) && safeKind === 'audio') {
      return { excluded: true, key: rule.key, reason: rule.reason };
    }
  }
  return { excluded: false, key: null, reason: null };
}

function buildMediaSyncExcludedPathRules() {
  return MEDIA_SYNC_EXCLUDED_PATH_RULES.map(rule => ({
    key: rule.key,
    rootKey: rule.rootKey,
    relativePathPrefix: rule.relativePathPrefix,
    audioOnly: true,
    reason: rule.reason
  }));
}

function buildMediaInventoryExclusionPolicy(counts = {}) {
  return {
    prepared: true,
    build: MODULE_BUILD,
    readOnly: true,
    active: true,
    excludesFromCompactInventory: true,
    excludesFromFullSync: true,
    databaseWritesEnabled: false,
    deleteEnabled: false,
    noFileContent: true,
    noAbsolutePaths: true,
    excludedFromSync: safeNonNegativeNumber(counts.excludedFromSync),
    ttsGeneratedExcludedFromSync: safeNonNegativeNumber(counts.ttsGeneratedExcludedFromSync),
    rules: buildMediaSyncExcludedPathRules()
  };
}

function buildMediaGroupsFromItems(items, sourceGroups) {
  const groups = emptyMediaGroups();
  for (const key of Object.keys(groups)) {
    const source = sourceGroups && sourceGroups[key] && typeof sourceGroups[key] === 'object' ? sourceGroups[key] : {};
    groups[key].exists = source.exists === false ? false : true;
  }
  for (const item of items) {
    if (!groups[item.rootKey]) continue;
    groups[item.rootKey].items.push(item);
    groups[item.rootKey].count += 1;
  }
  return groups;
}

function stripMediaGroupItems(groups) {
  const safeGroups = groups && typeof groups === 'object' && !Array.isArray(groups) ? groups : emptyMediaGroups();
  const result = emptyMediaGroups();
  for (const key of Object.keys(result)) {
    const source = safeGroups[key] && typeof safeGroups[key] === 'object' ? safeGroups[key] : {};
    result[key].prepared = true;
    result[key].exists = source.exists === false ? false : true;
    result[key].count = Number.isFinite(Number(source.count)) ? Math.max(0, Math.floor(Number(source.count))) : 0;
    result[key].emptyReason = source.emptyReason ? safeReason(source.emptyReason) : null;
    result[key].items = [];
  }
  return result;
}

function buildMediaCountsFromItems(items, sourceCounts) {
  const counts = { total: items.length, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: items.length, skipped: 0, totalSeen: items.length, excludedFromSync: 0, ttsGeneratedExcludedFromSync: 0 };
  if (sourceCounts && Number.isFinite(Number(sourceCounts.skipped))) counts.skipped = Math.max(0, Math.floor(Number(sourceCounts.skipped)));
  if (sourceCounts && Number.isFinite(Number(sourceCounts.excludedFromSync))) counts.excludedFromSync = Math.max(0, Math.floor(Number(sourceCounts.excludedFromSync)));
  if (sourceCounts && Number.isFinite(Number(sourceCounts.ttsGeneratedExcludedFromSync))) counts.ttsGeneratedExcludedFromSync = Math.max(0, Math.floor(Number(sourceCounts.ttsGeneratedExcludedFromSync)));
  if (sourceCounts && Number.isFinite(Number(sourceCounts.totalSeen))) counts.totalSeen = Math.max(items.length, Math.floor(Number(sourceCounts.totalSeen)));
  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(counts, item.rootKey)) counts[item.rootKey] += 1;
    if (Object.prototype.hasOwnProperty.call(counts, item.kind)) counts[item.kind] += 1;
  }
  return counts;
}

function buildMediaInventoryStatusResponse(req = null) {
  void req;
  const inventory = CONNECTION_STATE.mediaInventorySync || buildMediaInventoryTransportPayload(scanLocalMediaInventory(MEDIA_SCAN_DEFAULT_LIMIT));
  const counts = inventory.counts || { total: 0, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0 };
  return buildBaseResponse({
    displayName: 'Media Inventar read-only',
    readOnly: true,
    route: '/api/remote-agent/media/inventory/status',
    prepared: true,
    active: inventory.active === true || Number(counts.total || 0) > 0,
    status: inventory.active === true || Number(counts.total || 0) > 0 ? 'media_inventory_available' : 'media_inventory_empty_or_pending',
    agent: {
      connected: CONNECTION_STATE.connected === true,
      connectionState: CONNECTION_STATE.connectionState,
      agentId: CONNECTION_STATE.agentId,
      agentName: CONNECTION_STATE.agentName,
      lastSeenAt: CONNECTION_STATE.lastSeenAt,
      lastMediaInventorySyncAt: CONNECTION_STATE.mediaInventorySyncUpdatedAt,
      mediaInventorySyncSeq: CONNECTION_STATE.mediaInventorySyncSeq,
      mediaInventorySyncSendErrorAt: CONNECTION_STATE.mediaInventorySyncSendErrorAt,
      mediaInventorySyncSendError: CONNECTION_STATE.mediaInventorySyncSendError,
      mediaInventoryInitialSendPrepared: CONNECTION_STATE.mediaInventoryInitialSendPrepared,
      mediaInventoryInitialSendScheduledAt: CONNECTION_STATE.mediaInventoryInitialSendScheduledAt,
      mediaInventoryInitialSendAttempts: CONNECTION_STATE.mediaInventoryInitialSendAttempts,
      lastMediaInventoryInitialSendAttemptAt: CONNECTION_STATE.lastMediaInventoryInitialSendAttemptAt,
      lastMediaInventoryInitialSendSuccessAt: CONNECTION_STATE.lastMediaInventoryInitialSendSuccessAt,
      mediaInventoryInitialSendCompleted: CONNECTION_STATE.mediaInventoryInitialSendCompleted
    },
    inventory,
    items: inventory.items || [],
    groups: inventory.groups || emptyMediaGroups(),
    counts,
    syncFoundation: inventory.syncFoundation || buildMediaSyncFoundationStatus(inventory),
    fullSync: buildMediaFullSyncStatus(),
    exclusionPolicy: inventory.exclusionPolicy || buildMediaInventoryExclusionPolicy(counts),
    onlineIndexTarget: inventory.onlineIndexTarget || { prepared: true, planned: true, database: 'remote_modboard_mariadb', table: 'remote_media_index', activeWrites: false },
    safety: { readOnly: true, uploadEnabled: false, editEnabled: false, deleteEnabled: false, noFileContent: true, noAbsolutePaths: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
  });
}

function normalizeMediaRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/g, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 220);
}

function mediaKindForExtension(ext) {
  if (MEDIA_AUDIO_EXTENSIONS.has(ext)) return 'audio';
  if (MEDIA_VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (MEDIA_IMAGE_EXTENSIONS.has(ext)) return 'image';
  return 'media';
}

function safeMediaRootKey(value) {
  const key = safeReason(value);
  return ['sounds', 'videos', 'images'].includes(key) ? key : '';
}

function safeMediaKind(value) {
  const kind = safeReason(value);
  return ['audio', 'video', 'image', 'media'].includes(kind) ? kind : '';
}

function safeMediaExtension(value) {
  const ext = String(value || '').toLowerCase().trim();
  return MEDIA_ALLOWED_EXTENSIONS.includes(ext) ? ext : '';
}

function safePublicMediaPath(value) {
  const raw = String(value || '').replace(/\\/g, '/').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 260);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('http://') || raw.startsWith('https://')) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function safeIsoOrNull(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function safeMediaId(value) {
  const id = String(value || '').replace(/[^\w:./-]/g, '_').slice(0, 260);
  if (!id || id.includes('..') || /^[a-zA-Z]:/.test(id)) return '';
  return id;
}

async function buildObsInventorySyncSnapshot(config, reason) {
  const checkedAt = new Date().toISOString();
  if (!obsSharedModule || typeof obsSharedModule.getSharedObs !== 'function') {
    return preparedInventory(checkedAt, 'obs_shared_unavailable', false, 'OBS-Liste konnte noch nicht gelesen werden.', readObsStatusConfig());
  }
  const shared = obsSharedModule.getSharedObs(process.env, console);
  if (!shared || typeof shared.call !== 'function') {
    return preparedInventory(checkedAt, 'obs_shared_call_unavailable', false, 'OBS-Liste konnte noch nicht gelesen werden.', readObsStatusConfig());
  }
  const inventory = await collectObsInventoryFromShared(shared, readObsStatusConfig());
  inventory.syncReason = safeReason(reason || 'timer');
  return inventory;
}

function buildInventoryTransportPayload(inventory, options = {}) {
  const source = inventory && typeof inventory === 'object' && !Array.isArray(inventory) ? inventory : {};
  const compact = options.compact === true;
  const scenes = sanitizeInventoryItems(source.scenes || (source.groups && source.groups.scenes && source.groups.scenes.items), compact ? 120 : 250, 'scene');
  const sources = sanitizeInventoryItems(source.sources || (source.groups && source.groups.sources && source.groups.sources.items), compact ? 160 : 500, 'source');
  const audioSources = sanitizeInventoryItems(source.audioSources || (source.groups && source.groups.audioSources && source.groups.audioSources.items), compact ? 120 : 250, 'audio');
  return {
    prepared: true,
    active: source.active === true,
    status: safeReason(source.status || (source.active ? 'readonly_inventory_available' : 'not_ready')),
    checkedAt: safeText(source.checkedAt || new Date().toISOString(), 40),
    currentScene: safeText(source.currentScene || '', 160) || null,
    scenes,
    sources,
    audioSources,
    groups: {
      scenes: { prepared: true, active: source.active === true, count: scenes.length, items: scenes },
      sources: { prepared: true, active: source.active === true, count: sources.length, items: sources },
      audioSources: { prepared: true, active: source.active === true, count: audioSources.length, items: audioSources }
    },
    counts: { scenes: scenes.length, sources: sources.length, audioSources: audioSources.length, total: scenes.length + sources.length + audioSources.length },
    source: 'agent-wss-inventory-sync',
    readOnly: true,
    actionsEnabled: false,
    controlEnabled: false,
    compact: compact === true
  };
}

function sanitizeInventoryItems(items, limit, fallbackType) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, limit).map((item) => {
    const source = item && typeof item === 'object' && !Array.isArray(item) ? item : { name: item };
    const name = safeText(source.name || source.label || source.id || '', 140);
    if (!name) return null;
    return {
      name,
      label: safeText(source.label || name, 140),
      id: safeText(source.id || name, 160),
      type: safeText(source.type || source.kind || fallbackType || 'item', 80),
      muted: typeof source.muted === 'boolean' ? source.muted : null,
      readOnly: true
    };
  }).filter(Boolean);
}

function buildLiveStateTransportObs(obs) {
  const source = obs && typeof obs === 'object' && !Array.isArray(obs) ? obs : {};
  const currentScene = safeText(source.currentProgramSceneName || source.currentScene || '', 160) || null;
  return {
    connected: source.connected === true,
    detected: source.detected === true,
    reachable: source.reachable === true ? true : (source.reachable === false ? false : null),
    currentScene,
    currentProgramSceneName: currentScene
  };
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
  const stored = CONNECTION_STATE.inventorySync && typeof CONNECTION_STATE.inventorySync === 'object' ? CONNECTION_STATE.inventorySync : null;
  const obs = stored ? buildObsStatusSnapshot(now, readObsStatusConfig()) : buildObsStatus(now);
  const inventory = stored || obs.inventory || preparedInventory(now, 'unknown', false, 'Kein OBS-Listenstatus vorhanden.', readObsStatusConfig());
  const counts = inventory.counts || { scenes: 0, sources: 0, audioSources: 0, total: 0 };
  const active = inventory.active === true || Number(counts.total || 0) > 0;
  const currentScene = inventory.currentScene || inventory.currentProgramSceneName || (CONNECTION_STATE.liveState && (CONNECTION_STATE.liveState.currentScene || CONNECTION_STATE.liveState.currentProgramSceneName)) || null;
  return buildBaseResponse({
    displayName: 'OBS Listen read-only',
    readOnly: true,
    route: '/api/remote-agent/obs/inventory/status',
    prepared: true,
    active,
    status: active ? 'inventory_available' : (CONNECTION_STATE.connected ? 'connected_inventory_pending' : 'inventory_pending'),
    obs: {
      reachable: obs.reachable,
      status: active ? 'inventory_available' : obs.status,
      port: obs.port,
      checkedAt: obs.checkedAt,
      noObsRequestSent: obs.noObsRequestSent,
      noObsInventoryRequestSent: obs.noObsInventoryRequestSent,
      config: obs.config
    },
    agent: {
      connected: CONNECTION_STATE.connected === true,
      connectionState: CONNECTION_STATE.connectionState,
      agentId: CONNECTION_STATE.agentId,
      agentName: CONNECTION_STATE.agentName,
      lastSeenAt: CONNECTION_STATE.lastSeenAt,
      lastInventorySyncAt: CONNECTION_STATE.inventorySyncUpdatedAt,
      inventorySyncSeq: CONNECTION_STATE.inventorySyncSeq
    },
    inventory,
    scenes: inventory.scenes || [],
    sources: inventory.sources || [],
    audioSources: inventory.audioSources || [],
    inventoryReadEnabled: inventory.config ? inventory.config.inventoryReadEnabled : false,
    inventoryStatus: inventory.status,
    inventoryActive: active,
    currentScene,
    counts,
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
    status: { connected: state.connected, connectionState: state.connectionState, reason: state.reason, lastSeenAt: state.lastSeenAt, connectedSince: state.connectedSince, lastHeartbeatAt: state.lastHeartbeatAt, heartbeatSeq: state.heartbeatSeq, heartbeatAgeMs: calculateHeartbeatAgeMs(state.lastHeartbeatAt), lastLiveStateAt: state.lastLiveStateAt, liveStateSeq: state.liveStateSeq, lastInventorySyncAt: state.lastInventorySyncAt, inventorySyncSeq: state.inventorySyncSeq, inventorySyncAgeMs: calculateHeartbeatAgeMs(state.lastInventorySyncAt), lastMediaInventorySyncAt: state.lastMediaInventorySyncAt, mediaInventorySyncSeq: state.mediaInventorySyncSeq, mediaInventorySyncAgeMs: calculateHeartbeatAgeMs(state.lastMediaInventorySyncAt), mediaInventorySyncSendErrorAt: state.mediaInventorySyncSendErrorAt, mediaInventorySyncSendError: state.mediaInventorySyncSendError, mediaInventoryInitialSendAttempts: state.mediaInventoryInitialSendAttempts, lastMediaInventoryInitialSendAttemptAt: state.lastMediaInventoryInitialSendAttemptAt, lastMediaInventoryInitialSendSuccessAt: state.lastMediaInventoryInitialSendSuccessAt, mediaInventoryInitialSendCompleted: state.mediaInventoryInitialSendCompleted, liveStateAgeMs: calculateHeartbeatAgeMs(state.lastLiveStateAt), reconnectCount: state.reconnectCount, stale: isHeartbeatStale(state.lastHeartbeatAt) },
    streamingPcConnection: state,
    agent: { agentId: state.agentId, agentName: state.agentName, agentVersion: state.agentVersion, protocolVersion: state.protocolVersion, heartbeatProtocolVersion: state.heartbeatProtocolVersion, liveStateProtocolVersion: state.liveStateProtocolVersion, mediaInventorySyncProtocolVersion: state.mediaInventorySyncProtocolVersion, expectedAgentId: 'stream-pc-main', expectedAgentName: 'Forrest Stream-PC' },
    host: { dashboardServer: 'local-stream-control-center', hostname: safeHostname(), platform: process.platform, nodeVersion: process.version, processUptimeSec: Math.floor(process.uptime()), localTime: now },
    remoteTarget: { publicDashboardUrl: 'https://mods.forrestcgn.de', remoteWsUrl: state.remoteWsUrl, plannedTransport: state.remoteWsUrl.startsWith('wss://') ? 'wss' : 'ws', plannedWsPath: state.wsPath, streamPcPublicPortRequired: false, outgoingConnectionOnly: true },
    capabilities: { ...CAPABILITIES },
    safety: buildSafetyBlock(),
    warnings: ['Version 0.1.8D sendet schlanke Heartbeats plus separaten read-only OBS-Live-State, OBS-Inventory-Sync und Media-Slow-Sync ueber die bestehende Agent-WSS-Verbindung zum Webserver.', 'OBS- und Media-Listen werden separat langsam als Sync gesendet und nicht im Heartbeat transportiert.', 'Es werden keine Steuerbefehle angenommen oder ausgefuehrt.', 'OBS-Steuerung, Sounds, Overlays, Commands, Shell, Dateien, Prozesse und Datenbank-Writes bleiben deaktiviert.', 'OBS-Passwort und Verbindungsschluessel werden nie in Status, UI oder Logs ausgegeben.'],
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
    inventorySyncProtocolVersion: CONNECTION_STATE.inventorySyncProtocolVersion,
    inventorySyncSeq: CONNECTION_STATE.inventorySyncSeq,
    inventorySyncIntervalMs: CONNECTION_STATE.inventorySyncIntervalMs,
    lastInventorySyncAt: CONNECTION_STATE.lastInventorySyncAt,
    inventorySyncUpdatedAt: CONNECTION_STATE.inventorySyncUpdatedAt,
    inventorySync: CONNECTION_STATE.inventorySync,
    inventorySyncSendErrorAt: CONNECTION_STATE.inventorySyncSendErrorAt,
    inventorySyncSendError: CONNECTION_STATE.inventorySyncSendError,
    mediaInventorySyncProtocolVersion: CONNECTION_STATE.mediaInventorySyncProtocolVersion,
    mediaInventorySyncSeq: CONNECTION_STATE.mediaInventorySyncSeq,
    mediaInventorySyncIntervalMs: CONNECTION_STATE.mediaInventorySyncIntervalMs,
    lastMediaInventorySyncAt: CONNECTION_STATE.lastMediaInventorySyncAt,
    mediaInventorySyncUpdatedAt: CONNECTION_STATE.mediaInventorySyncUpdatedAt,
    mediaInventorySync: CONNECTION_STATE.mediaInventorySync,
    mediaInventorySyncSendErrorAt: CONNECTION_STATE.mediaInventorySyncSendErrorAt,
    mediaInventorySyncSendError: CONNECTION_STATE.mediaInventorySyncSendError,
    mediaInventoryInitialSendPrepared: CONNECTION_STATE.mediaInventoryInitialSendPrepared,
    mediaInventoryInitialSendDelaysMs: CONNECTION_STATE.mediaInventoryInitialSendDelaysMs,
    mediaInventoryInitialSendScheduledAt: CONNECTION_STATE.mediaInventoryInitialSendScheduledAt,
    mediaInventoryInitialSendAttempts: CONNECTION_STATE.mediaInventoryInitialSendAttempts,
    lastMediaInventoryInitialSendAttemptAt: CONNECTION_STATE.lastMediaInventoryInitialSendAttemptAt,
    lastMediaInventoryInitialSendSuccessAt: CONNECTION_STATE.lastMediaInventoryInitialSendSuccessAt,
    mediaInventoryInitialSendCompleted: CONNECTION_STATE.mediaInventoryInitialSendCompleted,
    mediaFullSyncState: CONNECTION_STATE.mediaFullSyncState,
    mediaFullSyncSentItems: CONNECTION_STATE.mediaFullSyncSentItems,
    mediaFullSyncTotalItems: CONNECTION_STATE.mediaFullSyncTotalItems,
    mediaFullSyncLastError: CONNECTION_STATE.mediaFullSyncLastError,
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
      { method: 'GET', path: '/api/remote-agent/obs/inventory/status', description: 'Lokale OBS-Listen read-only. Werden online separat per Inventory-Sync gesendet, nicht im Heartbeat.' },
      { method: 'GET', path: '/api/remote-agent/media/inventory/status', description: 'Lokales Media-Inventar read-only. Wird online separat per Media-Slow-Sync gesendet, nicht im Heartbeat.' },
      { method: 'GET', path: '/api/remote-agent/permissions/model', description: 'Read-only Rollen-/Permission-Modell. Keine User-/Grant-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/locks/status', description: 'Read-only Lock-Modell und aktueller Null-Status. Keine Lock-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/audit/model', description: 'Read-only Audit-Modell fuer spaetere produktive Aktionen. Keine Audit-Schreiboperation.' },
      { method: 'GET', path: '/api/remote-agent/routes', description: 'Read-only Routenuebersicht fuer Version 0.1.6.' }
    ]
  });
}

function buildSafetyBlock() {
  return { noSoundControl: true, noObsControl: true, noOverlayControl: true, noMediaWrite: true, noTextConfigWrite: true, noCommandsOrChannelpoints: true, noDatabaseWrite: true, noFileWrite: true, noShellOrProcessActions: true, noAgentActionExecution: true, noStreamingPcActionExecution: true, heartbeatOnly: false, liveStateReadOnlyPush: true, inventorySyncReadOnlyPush: true, obsInventorySyncReadOnlyPush: true, outgoingConnectionOnly: true, obsInventoryReadOnly: true, obsLiveStateReadOnly: true, obsInventorySyncReadOnly: true, mediaInventorySyncReadOnly: true, mediaInventoryReadOnly: true, obsInventoryEnvDiagnostic: true, obsInventorySharedConnection: true };
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

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, buildStatusResponse, buildMediaInventoryStatusResponse, buildMediaFullSyncStatus, buildPermissionsModelResponse, GROUP_MARKERS, buildLocksStatusResponse, buildAuditModelResponse };
