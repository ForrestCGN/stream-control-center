'use strict';

const crypto = require('crypto');
const { withWriteConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_agent_runtime';
const MODULE_BUILD = 'RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY';
const STATUS_API_VERSION = 'rdap_agent_media_root_remote_accept_075.v1';
const EXPECTED_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const COMPONENT_STATUS_PROTOCOL_VERSION = 'rdap-component-status.v1';
const LIVE_STATE_PROTOCOL_VERSION = 'rdap-agent-live-state.v1';
const INVENTORY_SYNC_PROTOCOL_VERSION = 'rdap-agent-obs-inventory.v1';
const MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION = 'rdap-agent-media-inventory.v1';
const MEDIA_FULL_SYNC_PROTOCOL_VERSION = 'rdap-agent-media-full-sync.v1';
const MEDIA_INDEX_SYNC_FOUNDATION_BUILD = 'RDAP_0.2.53_MEDIA_SYNC_STATUS_AND_INDEX_FOUNDATION';
const MEDIA_FULL_SYNC_RECEIVER_BUILD = 'RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY';
const MEDIA_FULL_SYNC_COMPARE_SNAPSHOT_BUILD = 'RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY';
const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const HEARTBEAT_RECEIVER_BUILD_ENABLED = true;
const MAX_HEARTBEAT_PAYLOAD_BYTES = 4096;
const MAX_LIVE_STATE_PAYLOAD_BYTES = 2048;
const MAX_INVENTORY_SYNC_PAYLOAD_BYTES = 65536;
const MAX_MEDIA_INVENTORY_SYNC_PAYLOAD_BYTES = 65536;
const MAX_AGENT_WS_BUFFER_BYTES = MAX_INVENTORY_SYNC_PAYLOAD_BYTES + 4096;
const PLANNED_HEARTBEAT_INTERVAL_MS = 30000;
const PLANNED_LIVE_STATE_INTERVAL_MS = 500;
const PLANNED_INVENTORY_SYNC_INTERVAL_MS = 30000;
const PLANNED_MEDIA_INVENTORY_SYNC_INTERVAL_MS = 60000;
const MEDIA_FULL_SYNC_CHUNK_MAX_ITEMS = 100;
const LIVE_STATE_STALE_AFTER_MS = 5000;
const LIVE_STATE_OFFLINE_AFTER_MS = 15000;
const STALE_AFTER_MS = 90000;
const OFFLINE_AFTER_MS = 120000;

const FORBIDDEN_INVENTORY_SYNC_FIELDS = new Set(['capabilities', 'commands', 'requestedActions', 'actionQueue', 'env', 'paths', 'tokens', 'secrets', 'shell', 'stdout', 'stderr', 'configDump', 'processList', 'fileList']);

const FORBIDDEN_MEDIA_INVENTORY_SYNC_FIELDS = new Set(['capabilities', 'commands', 'requestedActions', 'actionQueue', 'env', 'paths', 'absolutePath', 'absolutePaths', 'tokens', 'secrets', 'shell', 'stdout', 'stderr', 'configDump', 'processList', 'fileList', 'fileContent', 'content', 'buffer', 'base64']);
const FORBIDDEN_MEDIA_FULL_SYNC_FIELDS = FORBIDDEN_MEDIA_INVENTORY_SYNC_FIELDS;
const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const MEDIA_VIDEO_EXTENSIONS = new Set(['.webm', '.mp4']);
const MEDIA_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_PLANNED_ROOT_KEYS = new Set(['sounds', 'videos', 'images', 'media']);

const FORBIDDEN_LIVE_STATE_FIELDS = new Set(['capabilities', 'commands', 'requestedActions', 'actionQueue', 'env', 'paths', 'tokens', 'secrets', 'shell', 'stdout', 'stderr', 'configDump', 'processList', 'fileList']);

const FORBIDDEN_HEARTBEAT_FIELDS = new Set([
  'capabilities',
  'commands',
  'requestedActions',
  'actionQueue',
  'obsState',
  'soundState',
  'overlayState',
  'processList',
  'fileList',
  'env',
  'paths',
  'tokens',
  'secrets',
  'ip',
  'hostname',
  'freeUrls',
  'shell',
  'stdout',
  'stderr',
  'configDump'
]);

const EMPTY_COMPONENT_STATUS = Object.freeze({
  prepared: true,
  protocolVersion: COMPONENT_STATUS_PROTOCOL_VERSION,
  available: false,
  collectedAt: null,
  source: 'streaming-pc-heartbeat',
  localDashboard: { available: false, url: null, reachable: null },
  localServer: { available: false, name: 'Lokaler Dashboard-Server', reachable: null, port: 8080 },
  obs: { available: false, name: 'OBS', reachable: null, status: 'not_reported' },
  streamerbot: { available: false, name: 'Streamer.bot', reachable: null, status: 'not_reported' },
  actionsEnabled: false,
  productiveActionsEnabled: false,
  noCommands: true,
  noShellOrProcessActions: true,
  noFileWrite: true,
  noDatabaseWrite: true,
  rawPayloadStored: false
});

const EMPTY_OBS_INVENTORY_SYNC = Object.freeze({
  prepared: true,
  readOnly: true,
  protocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
  source: 'agent-wss-inventory-sync',
  available: false,
  active: false,
  status: 'not_reported',
  checkedAt: null,
  receivedAt: null,
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
  safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
});

const EMPTY_MEDIA_INVENTORY_SYNC = Object.freeze({
  prepared: true,
  readOnly: true,
  protocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
  source: 'agent-wss-media-inventory-sync',
  available: false,
  active: false,
  status: 'not_reported',
  scannedAt: null,
  checkedAt: null,
  receivedAt: null,
  items: [],
  groups: {
    sounds: { prepared: true, exists: true, active: false, count: 0, items: [] },
    videos: { prepared: true, exists: true, active: false, count: 0, items: [] },
    images: { prepared: true, exists: true, active: false, count: 0, items: [] },
    media: { prepared: true, exists: true, active: false, count: 0, items: [] }
  },
  counts: { total: 0, sounds: 0, videos: 0, images: 0, media: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0 },
  syncFoundation: { prepared: true, build: 'RDAP_0.2.53_MEDIA_SYNC_STATUS_AND_INDEX_FOUNDATION', readOnly: true, onlineIndexPlanned: true, fullSyncPrepared: true, chunkSyncPrepared: true, deltaSyncPrepared: true, bidirectionalSyncPlanned: true, activeWrites: false },
  limit: 500,
  hardLimit: 2000,
  maxDepth: 5,
  truncated: false,
  hasMore: false,
  nextCursor: null,
  safety: { readOnly: true, uploadEnabled: false, editEnabled: false, deleteEnabled: false, noFileContent: true, noAbsolutePaths: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
});

const EMPTY_MEDIA_FULL_SYNC_STATE = Object.freeze({
  prepared: true,
  build: MEDIA_FULL_SYNC_RECEIVER_BUILD,
  protocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
  state: 'pending',
  syncId: null,
  receivedChunks: 0,
  totalChunks: 0,
  receivedItems: 0,
  totalItems: 0,
  startedAt: null,
  lastChunkAt: null,
  completedAt: null,
  lastError: null,
  lastRejectAt: null,
  lastRejectReason: null,
  lastDbWriteAt: null,
  lastDbWriteItems: 0,
  writeEnabled: false,
  writesBlocked: true,
  uploadEditDeleteEnabled: false,
  noFileContent: true,
  noAbsolutePaths: true
});

const EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT = Object.freeze({
  prepared: true,
  build: MEDIA_FULL_SYNC_COMPARE_SNAPSHOT_BUILD,
  protocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
  readOnly: true,
  inMemoryOnly: true,
  persistsToDatabase: false,
  source: 'agent_full_sync_readonly_memory_snapshot',
  available: false,
  complete: false,
  status: 'pending',
  syncId: null,
  receivedChunks: 0,
  totalChunks: 0,
  receivedItems: 0,
  totalItems: 0,
  itemCount: 0,
  items: [],
  truncated: false,
  startedAt: null,
  lastChunkAt: null,
  completedAt: null,
  lastError: null,
  writeEnabled: false,
  writesBlocked: true,
  noFileContent: true,
  noAbsolutePaths: true,
  noAgentActionExecution: true,
  noDatabaseWrite: true,
  uploadEditDeleteEnabled: false
});

const CONNECTION_STATE = {
  prepared: true,
  inMemoryOnly: true,
  persistsToDatabase: false,
  connected: false,
  connectionState: 'offline',
  agentId: null,
  agentName: null,
  agentVersion: null,
  protocolVersion: null,
  connectedSince: null,
  lastSeenAt: null,
  reconnectCount: 0,
  closeReason: null,
  actionsEnabled: false,
  productiveAgentRuntime: false,
  heartbeatReceiverEnabled: false,
  heartbeatReceiverBuildEnabled: HEARTBEAT_RECEIVER_BUILD_ENABLED,
  heartbeatInMemoryOnly: true,
  heartbeatPersistsToDatabase: false,
  heartbeatExecutesActions: false,
  heartbeatAcceptsCommands: false,
  heartbeatAcceptsCapabilities: false,
  lastHeartbeatAt: null,
  heartbeatAgeMs: null,
  heartbeatSeq: null,
  heartbeatProtocolVersion: null,
  plannedHeartbeatIntervalMs: PLANNED_HEARTBEAT_INTERVAL_MS,
  staleAfterMs: STALE_AFTER_MS,
  offlineAfterMs: OFFLINE_AFTER_MS,
  stale: false,
  heartbeatRejectCount: 0,
  lastHeartbeatRejectAt: null,
  lastHeartbeatRejectReason: null,
  lastHeartbeatPayloadStored: false,
  componentStatus: clonePlain(EMPTY_COMPONENT_STATUS),
  componentStatusUpdatedAt: null,
  liveStateReceiverPrepared: true,
  liveStateInMemoryOnly: true,
  liveStatePersistsToDatabase: false,
  liveStateExecutesActions: false,
  liveStateAcceptsCommands: false,
  liveStateProtocolVersion: LIVE_STATE_PROTOCOL_VERSION,
  liveState: null,
  liveStateUpdatedAt: null,
  lastLiveStateAt: null,
  liveStateSeq: null,
  liveStateAgeMs: null,
  liveStateStaleAfterMs: LIVE_STATE_STALE_AFTER_MS,
  liveStateOfflineAfterMs: LIVE_STATE_OFFLINE_AFTER_MS,
  liveStateStale: false,
  liveStateRejectCount: 0,
  lastLiveStateRejectAt: null,
  lastLiveStateRejectReason: null,
  lastLiveStatePayloadStored: false,
  inventorySyncReceiverPrepared: true,
  inventorySyncInMemoryOnly: true,
  inventorySyncPersistsToDatabase: false,
  inventorySyncExecutesActions: false,
  inventorySyncAcceptsCommands: false,
  inventorySyncProtocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
  inventorySync: clonePlain(EMPTY_OBS_INVENTORY_SYNC),
  inventorySyncUpdatedAt: null,
  lastInventorySyncAt: null,
  inventorySyncSeq: null,
  inventorySyncRejectCount: 0,
  lastInventorySyncRejectAt: null,
  lastInventorySyncRejectReason: null,
  lastInventorySyncPayloadStored: false,
  mediaInventorySyncReceiverPrepared: true,
  mediaInventorySyncInMemoryOnly: true,
  mediaInventorySyncPersistsToDatabase: false,
  mediaInventorySyncExecutesActions: false,
  mediaInventorySyncAcceptsCommands: false,
  mediaInventorySyncProtocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
  mediaInventorySync: clonePlain(EMPTY_MEDIA_INVENTORY_SYNC),
  mediaInventorySyncUpdatedAt: null,
  lastMediaInventorySyncAt: null,
  mediaInventorySyncSeq: null,
  mediaInventorySyncRejectCount: 0,
  lastMediaInventorySyncRejectAt: null,
  lastMediaInventorySyncRejectReason: null,
  lastMediaInventorySyncPayloadStored: false,
  mediaFullSyncReceiverPrepared: true,
  mediaFullSyncProtocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
  mediaFullSyncPersistsToDatabase: false,
  mediaFullSyncExecutesActions: false,
  mediaFullSyncAcceptsCommands: false,
  mediaFullSync: clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE),
  mediaFullSyncReceivedChunkIndexes: new Set(),
  mediaFullSyncCompareSnapshot: clonePlain(EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT),
  mediaFullSyncCompareItemsByChunk: new Map()
};

const REJECT_DIAGNOSTIC = {
  prepared: true,
  enabled: true,
  inMemoryOnly: true,
  persistsToDatabase: false,
  handshakePrecheckPrepared: true,
  handshakePrecheckAcceptsConnections: true,
  accessKeyComparePrepared: true,
  accessKeyCompareAcceptsConnections: true,
  expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
  rejectCount: 0,
  lastRejectAt: null,
  lastRejectReason: null,
  lastRejectPath: null,
  lastRejectStatusCode: null,
  lastRejectMethod: null,
  lastRejectHasAuthorizationHeader: false,
  lastRejectHasCookieHeader: false,
  lastRejectHasQueryString: false,
  lastRejectHasAgentIdHeader: false,
  lastRejectHasProtocolHeader: false,
  lastRejectAgentIdHint: null,
  lastRejectProtocolHint: null,
  lastRejectAccessKeyConfigured: false,
  lastRejectConnectionProofCompared: false,
  lastRejectUserAgentHint: null,
  secretsExposed: false,
  secretsLogged: false,
  headersLogged: false,
  rawIpLogged: false,
  queryStringLogged: false,
  authorizationHeaderLogged: false,
  cookieHeaderLogged: false,
  agentIdHeaderValueLogged: false,
  protocolHeaderValueLogged: false,
  bearerTokenLogged: false,
  tokenLengthLogged: false,
  tokenHashLogged: false
};

let activeSocket = null;

function registerAgentRuntime(server, config = {}, options = {}) {
  const agentRuntime = getAgentRuntimeConfig(config);
  const wsPath = agentRuntime.wsPath || '/agent-ws';
  const moduleBuild = options.moduleBuild || MODULE_BUILD;

  if (!server || typeof server.on !== 'function') {
    return buildRegistrationSummary({ registered: false, reason: 'http_server_missing', wsPath, moduleBuild, agentRuntime });
  }

  server.on('upgrade', (req, socket) => {
    if (!isAgentWsPath(req, wsPath, config)) return;

    const precheck = evaluateHandshakePrecheck(req, agentRuntime);
    if (precheck.reason !== 'ok') {
      recordRejectDiagnostic(req, {
        code: 503,
        reason: precheck.reason,
        wsPath,
        agentIdHint: precheck.agentIdHint,
        protocolHint: precheck.protocolHint,
        accessKeyConfigured: precheck.accessKeyConfigured,
        connectionProofCompared: precheck.connectionProofCompared
      });
      rejectUpgrade(socket, { code: 503, reason: precheck.reason, message: 'Stream-PC connection rejected.' });
      return;
    }

    if (activeSocket && !activeSocket.destroyed) {
      recordRejectDiagnostic(req, {
        code: 503,
        reason: 'agent_already_connected',
        wsPath,
        agentIdHint: precheck.agentIdHint,
        protocolHint: precheck.protocolHint,
        accessKeyConfigured: precheck.accessKeyConfigured,
        connectionProofCompared: precheck.connectionProofCompared
      });
      rejectUpgrade(socket, { code: 503, reason: 'agent_already_connected', message: 'Stream-PC connection already active.' });
      return;
    }

    acceptUpgrade(req, socket, {
      agentRuntime,
      config,
      agentId: precheck.agentId,
      protocolVersion: precheck.protocolVersion
    });
  });

  console.log(`[remote-agent-runtime] ${moduleBuild} registered guarded transport runtime for ${wsPath}. accepts=${agentRuntime.acceptsAgentConnections}, actions=false, heartbeat=${agentRuntime.heartbeatReceiverEnabled}.`);

  return buildRegistrationSummary({ registered: true, reason: 'guarded_transport_runtime_registered', wsPath, moduleBuild, agentRuntime });
}

function getAgentRuntimeConfig(config = {}) {
  const runtime = config && config.agent && config.agent.runtime ? config.agent.runtime : {};
  const requestedEnabled = runtime.requestedEnabled === true;
  const acceptBuildEnabled = runtime.acceptBuildEnabled === true;
  const effectiveEnabled = requestedEnabled && acceptBuildEnabled;
  const heartbeatReceiverEnabled = effectiveEnabled && HEARTBEAT_RECEIVER_BUILD_ENABLED;

  return {
    skeletonPrepared: runtime.skeletonPrepared === true,
    requestedEnabled,
    acceptBuildPrepared: runtime.acceptBuildPrepared === true,
    acceptBuildEnabled,
    twoStepRuntimeGate: runtime.twoStepRuntimeGate === true,
    effectiveEnabled,
    wssRuntimeEnabled: effectiveEnabled,
    heartbeatReceiverBuildEnabled: HEARTBEAT_RECEIVER_BUILD_ENABLED,
    heartbeatReceiverEnabled,
    liveStateReceiverPrepared: true,
    liveStateProtocolVersion: LIVE_STATE_PROTOCOL_VERSION,
    plannedLiveStateIntervalMs: PLANNED_LIVE_STATE_INTERVAL_MS,
    inventorySyncReceiverPrepared: true,
    inventorySyncProtocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
    plannedInventorySyncIntervalMs: PLANNED_INVENTORY_SYNC_INTERVAL_MS,
    mediaInventorySyncReceiverPrepared: true,
    mediaInventorySyncProtocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
    plannedMediaInventorySyncIntervalMs: PLANNED_MEDIA_INVENTORY_SYNC_INTERVAL_MS,
    mediaFullSyncReceiverPrepared: true,
    mediaFullSyncProtocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
    mediaFullSyncReceiverBuild: MEDIA_FULL_SYNC_RECEIVER_BUILD,
    acceptsAgentConnections: effectiveEnabled,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    wsPath: runtime.wsPath || '/agent-ws',
    expectedAgentId: runtime.expectedAgentId || 'stream-pc-main',
    expectedAgentName: runtime.expectedAgentName || 'Forrest Stream-PC',
    accessKeyConfigured: runtime.accessKeyConfigured === true,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
    heartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION
  };
}

function buildRegistrationSummary(input = {}) {
  const agentRuntime = input.agentRuntime || getAgentRuntimeConfig();
  return {
    ok: Boolean(input.registered),
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: input.moduleBuild || MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    registered: Boolean(input.registered),
    reason: input.reason || 'unknown',
    wsPath: input.wsPath || '/agent-ws',
    runtimeEnabled: agentRuntime.effectiveEnabled === true,
    requestedEnabled: agentRuntime.requestedEnabled === true,
    acceptBuildPrepared: agentRuntime.acceptBuildPrepared === true,
    acceptBuildEnabled: agentRuntime.acceptBuildEnabled === true,
    twoStepRuntimeGate: agentRuntime.twoStepRuntimeGate === true,
    wssRuntimeEnabled: agentRuntime.wssRuntimeEnabled === true,
    heartbeatReceiverBuildEnabled: HEARTBEAT_RECEIVER_BUILD_ENABLED,
    heartbeatReceiverEnabled: agentRuntime.heartbeatReceiverEnabled === true,
    componentStatusReceiverPrepared: true,
    componentStatusInMemoryOnly: true,
    obsLiveStateReceiverPrepared: true,
    obsLiveStateInMemoryOnly: true,
    obsLiveStateRoute: '/api/remote/agent/obs/live/status',
    obsInventorySyncReceiverPrepared: true,
    obsInventorySyncRoute: '/api/remote/agent/obs/inventory/status',
    mediaInventorySyncReceiverPrepared: true,
    mediaInventorySyncRoute: '/api/remote/agent/media/inventory/status',
    mediaFullSyncReceiverPrepared: true,
    mediaFullSyncReceiverBuild: MEDIA_FULL_SYNC_RECEIVER_BUILD,
    mediaFullSyncPersistsToDatabaseOnlyWithGates: true,
    actionEnabled: false,
    productiveAgentRuntime: false,
    noAgentActions: true,
    readOnly: true,
    writeEnabled: false,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: agentRuntime.effectiveEnabled === true,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: agentRuntime.effectiveEnabled === true,
    acceptsAgentConnections: agentRuntime.acceptsAgentConnections === true,
    connection: buildAgentConnectionSummary(),
    rejectDiagnostic: buildRejectDiagnosticSummary()
  };
}

function isAgentWsPath(req, wsPath, config = {}) {
  if (!req || typeof req.url !== 'string') return false;
  try {
    const baseUrl = config.publicBaseUrl || 'https://mods.forrestcgn.de';
    const parsed = new URL(req.url, baseUrl);
    return parsed.pathname === wsPath;
  } catch (err) {
    return req.url === wsPath || req.url.startsWith(`${wsPath}?`);
  }
}

function evaluateHandshakePrecheck(req, agentRuntime = {}) {
  if (!req || typeof req.url !== 'string') return buildPrecheckResult('malformed_upgrade_request');

  const expectedAgentId = agentRuntime.expectedAgentId || 'stream-pc-main';
  const expectedProtocolVersion = agentRuntime.expectedProtocolVersion || EXPECTED_PROTOCOL_VERSION;
  const agentId = readHeaderValue(req, 'x-scc-agent-id');
  const authorization = readHeaderValue(req, 'authorization');
  const protocolVersion = readHeaderValue(req, 'x-scc-agent-protocol');
  const accessKey = getConfiguredAccessKey();
  const accessKeyConfigured = agentRuntime.accessKeyConfigured === true && Boolean(accessKey);

  if (!agentId) return buildPrecheckResult('missing_agent_id', { protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured });
  if (agentId !== expectedAgentId) return buildPrecheckResult('unknown_agent_id', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured });
  if (!authorization) return buildPrecheckResult('missing_connection_proof', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured });

  const bearerToken = extractBearerToken(authorization);
  if (!bearerToken) return buildPrecheckResult('invalid_connection_proof', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured });
  if (protocolVersion !== expectedProtocolVersion) return buildPrecheckResult('protocol_version_unsupported', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured });
  if (!accessKeyConfigured) return buildPrecheckResult('access_key_not_configured', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured: false });

  const proofMatches = compareSecretSafely(bearerToken, accessKey);
  if (!proofMatches) return buildPrecheckResult('invalid_connection_proof', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured: true, connectionProofCompared: true });
  if (!agentRuntime.effectiveEnabled) return buildPrecheckResult('runtime_not_effectively_enabled', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured: true, connectionProofCompared: true });
  if (!hasValidWebSocketUpgrade(req)) return buildPrecheckResult('invalid_websocket_upgrade', { agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured: true, connectionProofCompared: true });

  return buildPrecheckResult('ok', { agentId, protocolVersion, agentIdHint: safeAgentIdHint(agentId), protocolHint: safeProtocolHint(protocolVersion), accessKeyConfigured: true, connectionProofCompared: true });
}

function buildPrecheckResult(reason, details = {}) {
  return {
    reason,
    agentId: details.agentId || null,
    protocolVersion: details.protocolVersion || null,
    agentIdHint: details.agentIdHint || null,
    protocolHint: details.protocolHint || null,
    accessKeyConfigured: details.accessKeyConfigured === true,
    connectionProofCompared: details.connectionProofCompared === true
  };
}

function acceptUpgrade(req, socket, details = {}) {
  const key = readHeaderValue(req, 'sec-websocket-key');
  const accept = crypto.createHash('sha1').update(`${key}${WEBSOCKET_GUID}`).digest('base64');

  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    'X-SCC-Agent-Runtime: rdap-0.2.20-agent-obs-live-state-readonly',
    'X-SCC-Agent-Actions: disabled',
    'X-SCC-Agent-Heartbeat: readonly-in-memory',
    '',
    ''
  ].join('\r\n'));

  activeSocket = socket;
  const now = new Date().toISOString();
  const heartbeatEnabled = details.agentRuntime && details.agentRuntime.heartbeatReceiverEnabled === true;

  CONNECTION_STATE.connected = true;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.agentId = details.agentId || null;
  CONNECTION_STATE.agentName = details.agentRuntime && details.agentRuntime.expectedAgentName ? details.agentRuntime.expectedAgentName : 'Forrest Stream-PC';
  CONNECTION_STATE.agentVersion = safeHeaderHint(readHeaderValue(req, 'x-scc-agent-version'));
  CONNECTION_STATE.protocolVersion = details.protocolVersion || EXPECTED_PROTOCOL_VERSION;
  CONNECTION_STATE.connectedSince = now;
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.closeReason = null;
  CONNECTION_STATE.reconnectCount += 1;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.heartbeatReceiverEnabled = heartbeatEnabled;
  CONNECTION_STATE.heartbeatReceiverBuildEnabled = HEARTBEAT_RECEIVER_BUILD_ENABLED;
  CONNECTION_STATE.heartbeatInMemoryOnly = true;
  CONNECTION_STATE.heartbeatPersistsToDatabase = false;
  CONNECTION_STATE.heartbeatExecutesActions = false;
  CONNECTION_STATE.heartbeatAcceptsCommands = false;
  CONNECTION_STATE.heartbeatAcceptsCapabilities = false;
  CONNECTION_STATE.lastHeartbeatAt = null;
  CONNECTION_STATE.heartbeatAgeMs = null;
  CONNECTION_STATE.heartbeatSeq = null;
  CONNECTION_STATE.heartbeatProtocolVersion = null;
  CONNECTION_STATE.stale = false;
  CONNECTION_STATE.lastHeartbeatRejectAt = null;
  CONNECTION_STATE.lastHeartbeatRejectReason = null;
  CONNECTION_STATE.lastHeartbeatPayloadStored = false;
  CONNECTION_STATE.componentStatus = clonePlain(EMPTY_COMPONENT_STATUS);
  CONNECTION_STATE.componentStatusUpdatedAt = null;

  socket.on('data', chunk => handleSocketData(socket, chunk, details));
  socket.on('close', () => clearConnectionState('socket_close'));
  socket.on('end', () => clearConnectionState('socket_end'));
  socket.on('error', () => clearConnectionState('socket_error'));
}

function handleSocketData(socket, chunk, details = {}) {
  if (!CONNECTION_STATE.heartbeatReceiverEnabled) {
    recordHeartbeatReject('heartbeat_ignored_receiver_disabled');
    return;
  }

  const incoming = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk || '');
  if (!incoming.length) return;

  const previous = Buffer.isBuffer(socket._rdapFrameBuffer) && socket._rdapFrameBuffer.length ? socket._rdapFrameBuffer : null;
  const buffer = previous ? Buffer.concat([previous, incoming]) : incoming;

  if (buffer.length > MAX_AGENT_WS_BUFFER_BYTES) {
    socket._rdapFrameBuffer = Buffer.alloc(0);
    recordHeartbeatReject('agent_frame_buffer_too_large');
    safeSocketEnd(socket);
    return;
  }

  let offset = 0;
  while (offset < buffer.length) {
    const frame = decodeClientWebSocketFrame(buffer.subarray(offset));
    if (!frame.ok) {
      if (frame.incomplete) break;
      socket._rdapFrameBuffer = Buffer.alloc(0);
      recordHeartbeatReject(frame.reason || 'invalid_websocket_frame');
      if (frame.closeSocket) safeSocketEnd(socket);
      return;
    }

    offset += frame.bytesConsumed || buffer.length;
    processDecodedAgentFrame(socket, frame, details);
    if (!socket || socket.destroyed) {
      socket._rdapFrameBuffer = Buffer.alloc(0);
      return;
    }
  }

  socket._rdapFrameBuffer = offset < buffer.length ? Buffer.from(buffer.subarray(offset)) : Buffer.alloc(0);
}

function processDecodedAgentFrame(socket, frame, details = {}) {
  if (frame.opcode === 0x8) {
    clearConnectionState('client_close_frame');
    safeSocketEnd(socket);
    return;
  }
  if (frame.opcode === 0x9) {
    writePong(socket, frame.payload);
    return;
  }
  if (frame.opcode === 0xA) return;
  if (frame.opcode !== 0x1) {
    recordHeartbeatReject('unsupported_websocket_opcode');
    return;
  }

  const text = frame.payload.toString('utf8');
  processHeartbeatText(text, details);
}

function processHeartbeatText(text, details = {}) {
  const payloadBytes = Buffer.byteLength(text, 'utf8');
  if (payloadBytes > MAX_INVENTORY_SYNC_PAYLOAD_BYTES) {
    recordHeartbeatReject('agent_payload_too_large');
    return;
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (err) {
    recordHeartbeatReject('invalid_heartbeat_json');
    return;
  }

  if (payload && payload.type === 'live_state') {
    processLiveStatePayload(payload, details, payloadBytes);
    return;
  }
  if (payload && payload.type === 'inventory_sync') {
    processInventorySyncPayload(payload, details, payloadBytes);
    return;
  }
  if (payload && payload.type === 'media_inventory_sync') {
    processMediaInventorySyncPayload(payload, details, payloadBytes);
    return;
  }
  if (payload && payload.type === 'media_inventory_full_sync_chunk') {
    void processMediaFullSyncChunkPayload(payload, details, payloadBytes);
    return;
  }
  if (payloadBytes > MAX_HEARTBEAT_PAYLOAD_BYTES) {
    recordHeartbeatReject('heartbeat_payload_too_large');
    return;
  }

  const validation = validateHeartbeatPayload(payload, details);
  if (!validation.ok) {
    recordHeartbeatReject(validation.reason);
    return;
  }

  const now = new Date().toISOString();
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastHeartbeatAt = now;
  CONNECTION_STATE.heartbeatSeq = validation.seq;
  CONNECTION_STATE.heartbeatProtocolVersion = HEARTBEAT_PROTOCOL_VERSION;
  CONNECTION_STATE.agentVersion = validation.agentVersion || CONNECTION_STATE.agentVersion;
  CONNECTION_STATE.stale = false;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.lastHeartbeatRejectReason = null;
  CONNECTION_STATE.lastHeartbeatPayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.heartbeatExecutesActions = false;
  CONNECTION_STATE.heartbeatAcceptsCommands = false;
  CONNECTION_STATE.heartbeatAcceptsCapabilities = false;
  CONNECTION_STATE.componentStatus = sanitizeComponentStatus(payload.componentStatus, now);
  CONNECTION_STATE.componentStatusUpdatedAt = CONNECTION_STATE.componentStatus.available ? now : null;
}

function validateHeartbeatPayload(payload, details = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, reason: 'invalid_heartbeat_json' };
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_HEARTBEAT_FIELDS.has(key)) return { ok: false, reason: 'heartbeat_forbidden_fields' };
  }
  if (payload.type !== 'heartbeat') return { ok: false, reason: 'unsupported_heartbeat_type' };
  if (payload.protocolVersion !== HEARTBEAT_PROTOCOL_VERSION) return { ok: false, reason: 'unsupported_heartbeat_protocol' };

  const expectedAgentId = details.agentId || CONNECTION_STATE.agentId || 'stream-pc-main';
  if (payload.agentId !== expectedAgentId) return { ok: false, reason: 'heartbeat_agent_mismatch' };

  const seq = Number(payload.seq);
  if (!Number.isFinite(seq) || seq < 1 || Math.floor(seq) !== seq) return { ok: false, reason: 'heartbeat_seq_invalid' };

  const agentVersion = safeHeaderHint(payload.agentVersion || CONNECTION_STATE.agentVersion || '');
  if (payload.agentVersion && !agentVersion) return { ok: false, reason: 'heartbeat_agent_version_invalid' };

  return { ok: true, seq, agentVersion };
}

function processLiveStatePayload(payload, details = {}, payloadBytes = 0) {
  if (payloadBytes > MAX_LIVE_STATE_PAYLOAD_BYTES) {
    recordLiveStateReject('live_state_payload_too_large');
    return;
  }
  const validation = validateLiveStatePayload(payload, details);
  if (!validation.ok) {
    recordLiveStateReject(validation.reason);
    return;
  }
  const now = new Date().toISOString();
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastLiveStateAt = now;
  CONNECTION_STATE.liveStateSeq = validation.seq;
  CONNECTION_STATE.liveState = validation.liveState;
  CONNECTION_STATE.liveStateUpdatedAt = now;
  CONNECTION_STATE.liveStateAgeMs = 0;
  CONNECTION_STATE.liveStateStale = false;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.lastLiveStateRejectReason = null;
  CONNECTION_STATE.lastLiveStatePayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.liveStateExecutesActions = false;
  CONNECTION_STATE.liveStateAcceptsCommands = false;
}

function validateLiveStatePayload(payload, details = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, reason: 'invalid_live_state_json' };
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_LIVE_STATE_FIELDS.has(key)) return { ok: false, reason: 'live_state_forbidden_fields' };
  }
  const allowedTop = new Set(['type', 'protocolVersion', 'agentId', 'seq', 'collectedAt', 'obs']);
  for (const key of Object.keys(payload)) {
    if (!allowedTop.has(key)) return { ok: false, reason: 'live_state_unexpected_field' };
  }
  if (payload.type !== 'live_state') return { ok: false, reason: 'unsupported_live_state_type' };
  if (payload.protocolVersion !== LIVE_STATE_PROTOCOL_VERSION) return { ok: false, reason: 'unsupported_live_state_protocol' };
  const expectedAgentId = details.agentId || CONNECTION_STATE.agentId || 'stream-pc-main';
  if (payload.agentId !== expectedAgentId) return { ok: false, reason: 'live_state_agent_mismatch' };
  const seq = Number(payload.seq);
  if (!Number.isFinite(seq) || seq < 1 || Math.floor(seq) !== seq) return { ok: false, reason: 'live_state_seq_invalid' };
  const collectedAt = safeIsoOrNull(payload.collectedAt) || new Date().toISOString();
  const obs = sanitizeLiveObs(payload.obs);
  return {
    ok: true,
    seq,
    liveState: {
      prepared: true,
      readOnly: true,
      protocolVersion: LIVE_STATE_PROTOCOL_VERSION,
      source: 'agent-wss-live-state',
      agentId: expectedAgentId,
      seq,
      collectedAt,
      receivedAt: new Date().toISOString(),
      obs,
      currentScene: obs.currentScene,
      currentProgramSceneName: obs.currentProgramSceneName,
      safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
    }
  };
}

function sanitizeLiveObs(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const allowed = new Set(['connected', 'detected', 'reachable', 'currentScene', 'currentProgramSceneName', 'noObsControl', 'noNewObsWebSocketConnection']);
  for (const key of Object.keys(source)) {
    if (!allowed.has(key)) return { connected: false, detected: false, reachable: null, currentScene: null, currentProgramSceneName: null, status: 'invalid_live_obs_fields' };
  }
  const currentScene = safeLabel(source.currentProgramSceneName || source.currentScene || '') || null;
  return {
    connected: source.connected === true,
    detected: source.detected === true,
    reachable: source.reachable === true ? true : source.reachable === false ? false : null,
    currentScene,
    currentProgramSceneName: currentScene,
    status: currentScene ? 'live_scene_available' : (source.connected === true ? 'connected_no_scene' : 'not_connected_or_not_ready'),
    noObsControl: true
  };
}


function processInventorySyncPayload(payload, details = {}, payloadBytes = 0) {
  if (payloadBytes > MAX_INVENTORY_SYNC_PAYLOAD_BYTES) {
    recordInventorySyncReject('inventory_sync_payload_too_large');
    return;
  }
  const validation = validateInventorySyncPayload(payload, details);
  if (!validation.ok) {
    recordInventorySyncReject(validation.reason);
    return;
  }
  const now = new Date().toISOString();
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastInventorySyncAt = now;
  CONNECTION_STATE.inventorySyncSeq = validation.seq;
  CONNECTION_STATE.inventorySync = validation.inventory;
  CONNECTION_STATE.inventorySyncUpdatedAt = now;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.lastInventorySyncRejectReason = null;
  CONNECTION_STATE.lastInventorySyncPayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.inventorySyncExecutesActions = false;
  CONNECTION_STATE.inventorySyncAcceptsCommands = false;
}

function validateInventorySyncPayload(payload, details = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, reason: 'invalid_inventory_sync_json' };
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_INVENTORY_SYNC_FIELDS.has(key)) return { ok: false, reason: 'inventory_sync_forbidden_fields' };
  }
  const allowedTop = new Set(['type', 'protocolVersion', 'agentId', 'seq', 'collectedAt', 'inventory']);
  for (const key of Object.keys(payload)) {
    if (!allowedTop.has(key)) return { ok: false, reason: 'inventory_sync_unexpected_field' };
  }
  if (payload.type !== 'inventory_sync') return { ok: false, reason: 'unsupported_inventory_sync_type' };
  if (payload.protocolVersion !== INVENTORY_SYNC_PROTOCOL_VERSION) return { ok: false, reason: 'unsupported_inventory_sync_protocol' };
  const expectedAgentId = details.agentId || CONNECTION_STATE.agentId || 'stream-pc-main';
  if (payload.agentId !== expectedAgentId) return { ok: false, reason: 'inventory_sync_agent_mismatch' };
  const seq = Number(payload.seq);
  if (!Number.isFinite(seq) || seq < 1 || Math.floor(seq) !== seq) return { ok: false, reason: 'inventory_sync_seq_invalid' };
  const collectedAt = safeIsoOrNull(payload.collectedAt) || new Date().toISOString();
  const inventory = sanitizeInventorySync(payload.inventory, collectedAt, expectedAgentId, seq);
  return { ok: true, seq, inventory };
}

function sanitizeInventorySync(input, collectedAt, agentId, seq) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const scenes = sanitizeInventoryItems(source.scenes || (source.groups && source.groups.scenes && source.groups.scenes.items), 250, 'scene');
  const sources = sanitizeInventoryItems(source.sources || (source.groups && source.groups.sources && source.groups.sources.items), 500, 'source');
  const audioSources = sanitizeInventoryItems(source.audioSources || (source.groups && source.groups.audioSources && source.groups.audioSources.items), 250, 'audio');
  const active = source.active === true || scenes.length > 0 || sources.length > 0 || audioSources.length > 0;
  const currentScene = safeLabel(source.currentScene || '') || (CONNECTION_STATE.liveState && CONNECTION_STATE.liveState.currentScene) || null;
  return {
    prepared: true,
    readOnly: true,
    protocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
    source: 'agent-wss-inventory-sync',
    agentId,
    seq,
    available: active,
    active,
    status: active ? 'readonly_inventory_available' : safeStatus(source.status || 'not_ready'),
    checkedAt: safeIsoOrNull(source.checkedAt) || collectedAt,
    receivedAt: new Date().toISOString(),
    currentScene,
    scenes,
    sources,
    audioSources,
    groups: {
      scenes: { prepared: true, active, count: scenes.length, items: scenes },
      sources: { prepared: true, active, count: sources.length, items: sources },
      audioSources: { prepared: true, active, count: audioSources.length, items: audioSources }
    },
    counts: { scenes: scenes.length, sources: sources.length, audioSources: audioSources.length, total: scenes.length + sources.length + audioSources.length },
    safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
  };
}

function sanitizeInventoryItems(items, limit, fallbackType) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, limit).map((item) => {
    const source = item && typeof item === 'object' && !Array.isArray(item) ? item : { name: item };
    const name = safeLabel(source.name || source.label || source.id || '');
    if (!name) return null;
    return { name, label: safeLabel(source.label || name), id: safeLabel(source.id || name), type: safeStatus(source.type || source.kind || fallbackType || 'item'), muted: typeof source.muted === 'boolean' ? source.muted : null, readOnly: true };
  }).filter(Boolean);
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
    currentTransportLimited: truncated || (totalSeen > returned),
    completeInventoryInCurrentTransport: !truncated && returned >= totalSeen,
    progress: {
      state: truncated ? 'compact_limited' : (returned > 0 ? 'available' : 'pending'),
      returned,
      totalSeen,
      percent: totalSeen > 0 ? Math.min(100, Math.round((returned / totalSeen) * 100)) : 0,
      truncated
    },
    note: '0.2.53 Foundation: Online-DB als persistenter Media-Index, Full-Sync in Chunks, Delta-Sync und spaetere Online->Agent-Auftragsqueue sind vorbereitet/beschrieben. Dieser Build schreibt noch keine Media-Daten.'
  };
}


function processMediaInventorySyncPayload(payload, details = {}, payloadBytes = 0) {
  if (payloadBytes > MAX_MEDIA_INVENTORY_SYNC_PAYLOAD_BYTES) {
    recordMediaInventorySyncReject('media_inventory_sync_payload_too_large');
    return;
  }
  const validation = validateMediaInventorySyncPayload(payload, details);
  if (!validation.ok) {
    recordMediaInventorySyncReject(validation.reason);
    return;
  }
  const now = new Date().toISOString();
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.lastMediaInventorySyncAt = now;
  CONNECTION_STATE.mediaInventorySyncSeq = validation.seq;
  CONNECTION_STATE.mediaInventorySync = validation.inventory;
  CONNECTION_STATE.mediaInventorySyncUpdatedAt = now;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.lastMediaInventorySyncRejectReason = null;
  CONNECTION_STATE.lastMediaInventorySyncPayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.mediaInventorySyncExecutesActions = false;
  CONNECTION_STATE.mediaInventorySyncAcceptsCommands = false;
}

function validateMediaInventorySyncPayload(payload, details = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, reason: 'invalid_media_inventory_sync_json' };
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_MEDIA_INVENTORY_SYNC_FIELDS.has(key)) return { ok: false, reason: 'media_inventory_sync_forbidden_fields' };
  }
  const allowedTop = new Set(['type', 'protocolVersion', 'agentId', 'seq', 'collectedAt', 'inventory']);
  for (const key of Object.keys(payload)) {
    if (!allowedTop.has(key)) return { ok: false, reason: 'media_inventory_sync_unexpected_field' };
  }
  if (payload.type !== 'media_inventory_sync') return { ok: false, reason: 'unsupported_media_inventory_sync_type' };
  if (payload.protocolVersion !== MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION) return { ok: false, reason: 'unsupported_media_inventory_sync_protocol' };
  const expectedAgentId = details.agentId || CONNECTION_STATE.agentId || 'stream-pc-main';
  if (payload.agentId !== expectedAgentId) return { ok: false, reason: 'media_inventory_sync_agent_mismatch' };
  const seq = Number(payload.seq);
  if (!Number.isFinite(seq) || seq < 1 || Math.floor(seq) !== seq) return { ok: false, reason: 'media_inventory_sync_seq_invalid' };
  const collectedAt = safeIsoOrNull(payload.collectedAt) || new Date().toISOString();
  const inventory = sanitizeMediaInventorySync(payload.inventory, collectedAt, expectedAgentId, seq);
  return { ok: true, seq, inventory };
}

function sanitizeMediaInventorySync(input, collectedAt, agentId, seq) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const limit = safePositiveInt(source.limit, 500, 1, 2000);
  const hardLimit = safePositiveInt(source.hardLimit, 2000, 1, 2000);
  const maxDepth = safePositiveInt(source.maxDepth, 5, 1, 10);
  const items = sanitizeMediaInventoryItems(source.items, limit);
  const groups = buildMediaGroupsFromItems(items, source.groups);
  const counts = buildMediaCounts(items, source.counts);
  const active = source.active === true || items.length > 0;
  return {
    prepared: true,
    readOnly: true,
    protocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
    source: 'agent-wss-media-inventory-sync',
    agentId,
    seq,
    available: active,
    active,
    status: active ? 'readonly_media_inventory_available' : safeStatus(source.status || 'not_ready'),
    scannedAt: safeIsoOrNull(source.scannedAt || source.checkedAt) || collectedAt,
    checkedAt: safeIsoOrNull(source.checkedAt || source.scannedAt) || collectedAt,
    receivedAt: new Date().toISOString(),
    items,
    groups,
    counts,
    syncFoundation: buildMediaSyncFoundationStatus({ ...source, items, counts, truncated: source.truncated === true }),
    onlineIndexTarget: { prepared: true, planned: true, database: 'remote_modboard_mariadb', table: 'remote_media_index', activeWrites: false },
    limit,
    hardLimit,
    maxDepth,
    truncated: source.truncated === true,
    hasMore: source.hasMore === true || source.truncated === true,
    nextCursor: source.truncated === true || source.hasMore === true ? 'prepared_later' : null,
    emptyReason: active ? null : safeStatus(source.emptyReason || 'media_inventory_empty_or_not_ready'),
    safety: { readOnly: true, uploadEnabled: false, editEnabled: false, deleteEnabled: false, noFileContent: true, noAbsolutePaths: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false }
  };
}

function sanitizeMediaInventoryItems(items, limit) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, limit).map((item) => {
    const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
    const rootKey = safeMediaRootKey(source.rootKey);
    const relativePath = safeRelativeMediaPath(source.relativePath);
    const name = safeLabel(source.name || relativePath.split('/').pop() || source.id || '');
    const extension = safeMediaExtension(source.extension || '');
    const kind = safeMediaKind(source.kind || source.type || '');
    if (!rootKey || !relativePath || !name || !extension || !kind) return null;
    const mediaContext = buildSafeMediaContext(source, rootKey, relativePath);
    const publicPath = safePublicMediaPath(source.publicPath || mediaContext.publicPath || `/${rootKey}/${relativePath}`);
    const webPath = safePublicMediaPath(source.webPath || publicPath);
    return {
      id: safeMediaId(source.id || `${rootKey}:${relativePath}`),
      rootKey,
      rootLabel: safeLabel(source.rootLabel || rootKey),
      source: mediaContext.source,
      moduleKey: mediaContext.moduleKey,
      categoryKey: mediaContext.categoryKey,
      fullCategoryKey: mediaContext.fullCategoryKey,
      assetRelativePath: mediaContext.assetRelativePath,
      webPath,
      kind,
      name,
      relativePath,
      publicPath,
      extension,
      sizeBytes: safeNonNegativeNumber(source.sizeBytes),
      modifiedAt: safeIsoOrNull(source.modifiedAt) || null,
      readOnly: true
    };
  }).filter(Boolean);
}

function buildMediaGroupsFromItems(items, sourceGroups) {
  const groups = {
    sounds: { prepared: true, exists: true, active: false, count: 0, items: [] },
    videos: { prepared: true, exists: true, active: false, count: 0, items: [] },
    images: { prepared: true, exists: true, active: false, count: 0, items: [] },
    media: { prepared: true, exists: true, active: false, count: 0, items: [] }
  };
  for (const key of Object.keys(groups)) {
    const source = sourceGroups && sourceGroups[key] && typeof sourceGroups[key] === 'object' ? sourceGroups[key] : {};
    groups[key].exists = source.exists === false ? false : true;
  }
  for (const item of items) {
    if (!groups[item.rootKey]) continue;
    groups[item.rootKey].items.push(item);
    groups[item.rootKey].count += 1;
    groups[item.rootKey].active = true;
  }
  return groups;
}

function buildMediaCounts(items, sourceCounts) {
  const counts = { total: items.length, sounds: 0, videos: 0, images: 0, media: 0, audio: 0, video: 0, image: 0, returned: items.length, skipped: 0, totalSeen: items.length };
  const rawSkipped = sourceCounts && Number(sourceCounts.skipped);
  const rawTotalSeen = sourceCounts && Number(sourceCounts.totalSeen);
  if (Number.isFinite(rawSkipped) && rawSkipped >= 0) counts.skipped = Math.floor(rawSkipped);
  if (Number.isFinite(rawTotalSeen) && rawTotalSeen >= items.length) counts.totalSeen = Math.floor(rawTotalSeen);
  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(counts, item.rootKey)) counts[item.rootKey] += 1;
    if (Object.prototype.hasOwnProperty.call(counts, item.kind)) counts[item.kind] += 1;
  }
  return counts;
}

function safePositiveInt(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function buildSafeMediaContext(source, rootKey, relativePath) {
  const rel = safeRelativeMediaPath(relativePath);
  const parts = rel.split('/').filter(Boolean);
  const defaultModuleKey = rootKey === 'media' ? 'uncategorized' : rootKey;
  const defaultCategoryKey = rootKey === 'media' ? 'general' : 'legacy';
  const moduleKey = safeMediaSegment(source.moduleKey || (rootKey === 'media' ? parts[0] : defaultModuleKey), defaultModuleKey);
  const categoryKey = safeMediaSegment(source.categoryKey || (rootKey === 'media' ? parts[1] : defaultCategoryKey), defaultCategoryKey);
  const fullCategoryKey = safeMediaFullCategoryKey(source.fullCategoryKey || `${moduleKey}/${categoryKey}`, moduleKey, categoryKey);
  const assetRelativePath = safeRelativeMediaPath(source.assetRelativePath || (rootKey === 'media' ? parts.slice(2).join('/') : rel) || rel);
  const publicPath = safePublicMediaPath(source.publicPath || source.webPath || `/${rootKey}/${rel}`);
  return {
    source: safeMediaSource(source.source || (rootKey === 'media' ? 'media_system' : 'legacy_asset_root')),
    moduleKey,
    categoryKey,
    fullCategoryKey,
    assetRelativePath,
    publicPath
  };
}

function safeMediaSource(value) {
  const source = safeStatus(value);
  return ['legacy_asset_root', 'legacy_assets', 'media_system', 'agent_full_sync', 'local_stream_pc_filesystem_readonly'].includes(source) ? source : 'local_stream_pc_filesystem_readonly';
}

function safeMediaSegment(value, fallback) {
  const raw = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 80);
  return raw || fallback || 'uncategorized';
}

function safeMediaFullCategoryKey(value, moduleKey, categoryKey) {
  const raw = String(value || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_.\/-]/g, '_').slice(0, 180);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('~')) return `${moduleKey || 'uncategorized'}/${categoryKey || 'general'}`;
  return raw;
}

function safeMediaRootKey(value) {
  const key = safeStatus(value);
  return MEDIA_PLANNED_ROOT_KEYS.has(key) ? key : '';
}

function safeMediaKind(value) {
  const kind = safeStatus(value);
  return ['audio', 'video', 'image', 'media'].includes(kind) ? kind : '';
}

function safeMediaExtension(value) {
  const ext = String(value || '').toLowerCase().trim();
  return MEDIA_ALLOWED_EXTENSIONS.includes(ext) ? ext : '';
}

function safeRelativeMediaPath(value) {
  const rel = String(value || '').replace(/\\/g, '/').replace(/^\/+/g, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 220);
  if (!rel || rel.includes('..') || /^[a-zA-Z]:/.test(rel) || rel.startsWith('~')) return '';
  return rel;
}

function safePublicMediaPath(value) {
  const raw = String(value || '').replace(/\\/g, '/').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 260);
  if (!raw || raw.includes('..') || /^[a-zA-Z]:/.test(raw) || raw.startsWith('http://') || raw.startsWith('https://')) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function safeMediaId(value) {
  const id = String(value || '').replace(/[^\w:./-]/g, '_').slice(0, 260);
  if (!id || id.includes('..') || /^[a-zA-Z]:/.test(id)) return '';
  return id;
}

function recordMediaInventorySyncReject(reason) {
  CONNECTION_STATE.mediaInventorySyncRejectCount += 1;
  CONNECTION_STATE.lastMediaInventorySyncRejectAt = new Date().toISOString();
  CONNECTION_STATE.lastMediaInventorySyncRejectReason = safeReason(reason || 'media_inventory_sync_rejected');
  CONNECTION_STATE.lastMediaInventorySyncPayloadStored = false;
}

function resetMediaFullSyncState(input = {}) {
  CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes = new Set();
  CONNECTION_STATE.mediaFullSyncCompareItemsByChunk = new Map();
  CONNECTION_STATE.mediaFullSync = {
    ...clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE),
    state: input.state || 'pending',
    syncId: input.syncId || null,
    totalChunks: input.totalChunks || 0,
    totalItems: input.totalItems || 0,
    startedAt: input.startedAt || null,
    writeEnabled: input.writeEnabled === true,
    writesBlocked: input.writeEnabled !== true
  };
  CONNECTION_STATE.mediaFullSyncCompareSnapshot = {
    ...clonePlain(EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT),
    status: input.state || 'pending',
    syncId: input.syncId || null,
    totalChunks: input.totalChunks || 0,
    totalItems: input.totalItems || 0,
    startedAt: input.startedAt || null,
    writeEnabled: input.writeEnabled === true,
    writesBlocked: input.writeEnabled !== true
  };
}

function recordMediaFullSyncReject(reason) {
  const state = CONNECTION_STATE.mediaFullSync || clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE);
  CONNECTION_STATE.mediaFullSync = {
    ...state,
    state: 'failed',
    lastError: safeReason(reason || 'media_full_sync_rejected'),
    lastRejectAt: new Date().toISOString(),
    lastRejectReason: safeReason(reason || 'media_full_sync_rejected'),
    writesBlocked: true,
    writeEnabled: false
  };
}


function recordMediaFullSyncCompareSnapshotChunk(validation, now, writeGate = {}) {
  if (!validation || !validation.syncId) return;
  if (!(CONNECTION_STATE.mediaFullSyncCompareItemsByChunk instanceof Map)) CONNECTION_STATE.mediaFullSyncCompareItemsByChunk = new Map();
  const chunkItems = Array.isArray(validation.items) ? validation.items.map(item => ({ ...item })) : [];
  CONNECTION_STATE.mediaFullSyncCompareItemsByChunk.set(validation.chunkIndex, chunkItems);

  const receivedChunks = CONNECTION_STATE.mediaFullSyncCompareItemsByChunk.size;
  const receivedItems = Array.from(CONNECTION_STATE.mediaFullSyncCompareItemsByChunk.values()).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  const complete = receivedChunks >= validation.totalChunks && receivedItems >= validation.totalItems;
  const assembled = [];
  if (complete) {
    for (let index = 1; index <= validation.totalChunks; index += 1) {
      const items = CONNECTION_STATE.mediaFullSyncCompareItemsByChunk.get(index) || [];
      for (const item of items) assembled.push({ ...item });
    }
  }
  const previous = CONNECTION_STATE.mediaFullSyncCompareSnapshot || clonePlain(EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT);
  CONNECTION_STATE.mediaFullSyncCompareSnapshot = {
    ...previous,
    prepared: true,
    build: MEDIA_FULL_SYNC_COMPARE_SNAPSHOT_BUILD,
    protocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
    readOnly: true,
    inMemoryOnly: true,
    persistsToDatabase: false,
    source: 'agent_full_sync_readonly_memory_snapshot',
    available: complete && assembled.length > 0,
    complete,
    status: complete ? 'complete_readonly_compare_snapshot' : 'collecting_readonly_compare_snapshot',
    syncId: validation.syncId,
    receivedChunks,
    totalChunks: validation.totalChunks,
    receivedItems: Math.min(validation.totalItems, receivedItems),
    totalItems: validation.totalItems,
    itemCount: complete ? assembled.length : 0,
    items: complete ? assembled : [],
    truncated: complete ? assembled.length < validation.totalItems : false,
    startedAt: previous.startedAt || now,
    lastChunkAt: now,
    completedAt: complete ? (previous.completedAt || now) : null,
    lastError: null,
    writeEnabled: writeGate.enabled === true,
    writesBlocked: writeGate.enabled !== true,
    noFileContent: true,
    noAbsolutePaths: true,
    noAgentActionExecution: true,
    noDatabaseWrite: true,
    uploadEditDeleteEnabled: false
  };
}

async function processMediaFullSyncChunkPayload(payload, details = {}, payloadBytes = 0) {
  if (payloadBytes > MAX_MEDIA_INVENTORY_SYNC_PAYLOAD_BYTES) {
    recordMediaFullSyncReject('media_full_sync_chunk_payload_too_large');
    return;
  }
  const validation = validateMediaFullSyncChunkPayload(payload, details);
  if (!validation.ok) {
    recordMediaFullSyncReject(validation.reason);
    return;
  }
  const config = details.config || {};
  const writeGate = buildMediaFullSyncWriteGate(config);
  const now = new Date().toISOString();
  if (validation.chunkIndex === 1 || !CONNECTION_STATE.mediaFullSync || CONNECTION_STATE.mediaFullSync.syncId !== validation.syncId) {
    resetMediaFullSyncState({ state: 'running', syncId: validation.syncId, totalChunks: validation.totalChunks, totalItems: validation.totalItems, startedAt: now, writeEnabled: writeGate.enabled });
  }
  recordMediaFullSyncCompareSnapshotChunk(validation, now, writeGate);
  if (!writeGate.enabled) {
    const previousState = CONNECTION_STATE.mediaFullSync || clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE);
    CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes.add(validation.chunkIndex);
    const receivedChunks = CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes.size;
    const previousItems = Number(previousState.receivedItems || 0) || 0;
    const receivedItems = Math.min(validation.totalItems, previousItems + validation.items.length);
    const complete = receivedChunks >= validation.totalChunks && receivedItems >= validation.totalItems;
    CONNECTION_STATE.mediaFullSync = {
      ...previousState,
      state: complete ? 'received_write_blocked' : 'blocked_by_gate',
      syncId: validation.syncId,
      receivedChunks,
      totalChunks: validation.totalChunks,
      receivedItems,
      totalItems: validation.totalItems,
      lastChunkAt: now,
      completedAt: complete ? (previousState.completedAt || now) : null,
      lastError: writeGate.reason,
      writeEnabled: false,
      writesBlocked: true
    };
    CONNECTION_STATE.lastSeenAt = now;
    return;
  }
  try {
    const written = await writeMediaFullSyncChunkToDatabase(config, validation.items, validation.syncVersion);
    const previousState = CONNECTION_STATE.mediaFullSync || clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE);
    CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes.add(validation.chunkIndex);
    const receivedChunks = CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes.size;
    const previousItems = Number(previousState.receivedItems || 0) || 0;
    const receivedItems = Math.min(validation.totalItems, previousItems + validation.items.length);
    const complete = receivedChunks >= validation.totalChunks && receivedItems >= validation.totalItems;
    CONNECTION_STATE.mediaFullSync = {
      ...previousState,
      state: complete ? 'complete' : 'chunk',
      syncId: validation.syncId,
      receivedChunks,
      totalChunks: validation.totalChunks,
      receivedItems,
      totalItems: validation.totalItems,
      lastChunkAt: now,
      completedAt: complete ? (previousState.completedAt || now) : null,
      lastError: null,
      lastDbWriteAt: now,
      lastDbWriteItems: written,
      writeEnabled: true,
      writesBlocked: false
    };
    CONNECTION_STATE.mediaFullSyncPersistsToDatabase = true;
    CONNECTION_STATE.lastSeenAt = now;
  } catch (err) {
    const code = publicDbError(err).code || 'media_full_sync_db_write_failed';
    CONNECTION_STATE.mediaFullSync = {
      ...(CONNECTION_STATE.mediaFullSync || clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE)),
      state: 'failed',
      lastError: code,
      lastChunkAt: now,
      writeEnabled: true,
      writesBlocked: false
    };
  }
}

function validateMediaFullSyncChunkPayload(payload, details = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, reason: 'invalid_media_full_sync_json' };
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_MEDIA_FULL_SYNC_FIELDS.has(key)) return { ok: false, reason: 'media_full_sync_forbidden_fields' };
  }
  const allowedTop = new Set(['type', 'protocolVersion', 'agentId', 'seq', 'syncId', 'syncReason', 'confirmFullSync', 'mediaIndexDataOnly', 'collectedAt', 'chunkIndex', 'totalChunks', 'totalItems', 'chunkItems', 'inventory', 'safety']);
  for (const key of Object.keys(payload)) {
    if (!allowedTop.has(key)) return { ok: false, reason: 'media_full_sync_unexpected_field' };
  }
  if (payload.type !== 'media_inventory_full_sync_chunk') return { ok: false, reason: 'unsupported_media_full_sync_type' };
  if (payload.protocolVersion !== MEDIA_FULL_SYNC_PROTOCOL_VERSION) return { ok: false, reason: 'unsupported_media_full_sync_protocol' };
  if (payload.confirmFullSync !== true || payload.mediaIndexDataOnly !== true) return { ok: false, reason: 'media_full_sync_confirm_required' };
  const expectedAgentId = details.agentId || CONNECTION_STATE.agentId || 'stream-pc-main';
  if (payload.agentId !== expectedAgentId) return { ok: false, reason: 'media_full_sync_agent_mismatch' };
  const seq = safePositiveInt(payload.seq, 0, 1, Number.MAX_SAFE_INTEGER);
  if (!seq) return { ok: false, reason: 'media_full_sync_seq_invalid' };
  const syncId = safeMediaId(payload.syncId || '');
  if (!syncId) return { ok: false, reason: 'media_full_sync_id_invalid' };
  const chunkIndex = safePositiveInt(payload.chunkIndex, 0, 1, 100000);
  const totalChunks = safePositiveInt(payload.totalChunks, 0, 1, 100000);
  const totalItems = safePositiveInt(payload.totalItems, 0, 0, 200000);
  if (!chunkIndex || !totalChunks || chunkIndex > totalChunks) return { ok: false, reason: 'media_full_sync_chunk_index_invalid' };
  const inventory = payload.inventory && typeof payload.inventory === 'object' && !Array.isArray(payload.inventory) ? payload.inventory : {};
  const items = sanitizeMediaFullSyncItems(inventory.items, MEDIA_FULL_SYNC_CHUNK_MAX_ITEMS);
  const declaredChunkItems = safePositiveInt(payload.chunkItems, items.length, 0, MEDIA_FULL_SYNC_CHUNK_MAX_ITEMS);
  if (items.length !== declaredChunkItems) return { ok: false, reason: 'media_full_sync_chunk_item_count_mismatch' };
  return { ok: true, seq, syncId, chunkIndex, totalChunks, totalItems, items, syncVersion: seq };
}

function sanitizeMediaFullSyncItems(items, limit) {
  const list = Array.isArray(items) ? items : [];
  return list.slice(0, limit).map(sanitizeMediaFullSyncItem).filter(Boolean);
}

function sanitizeMediaFullSyncItem(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const rootKey = safeMediaRootKey(source.rootKey);
  const relativePath = safeRelativeMediaPath(source.relativePath);
  if (!rootKey || !relativePath) return null;
  const extension = safeMediaExtension(pathExtname(relativePath) || source.extension || '');
  if (!extension) return null;
  const kind = mediaKindForExtension(extension);
  if (!kind) return null;
  const name = safeLabel(source.name || relativePath.split('/').pop() || '');
  const id = safeMediaId(source.id || `${rootKey}:${relativePath}`);
  if (!id || !name) return null;
  const mediaContext = buildSafeMediaContext(source, rootKey, relativePath);
  const publicPath = safePublicMediaPath(source.publicPath || mediaContext.publicPath || `/${rootKey}/${relativePath}`);
  const webPath = safePublicMediaPath(source.webPath || publicPath);
  return {
    id,
    rootKey,
    source: mediaContext.source,
    moduleKey: mediaContext.moduleKey,
    categoryKey: mediaContext.categoryKey,
    fullCategoryKey: mediaContext.fullCategoryKey,
    assetRelativePath: mediaContext.assetRelativePath,
    webPath,
    kind,
    relativePath,
    publicPath,
    name,
    extension,
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    readOnly: true
  };
}

async function writeMediaFullSyncChunkToDatabase(config, items, syncVersion) {
  if (!items.length) return 0;
  return await withWriteConnection(config, async (connection) => {
    let written = 0;
    for (const item of items) {
      await connection.query(
        `INSERT INTO remote_media_index (id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, deleted, source, sync_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0, 'agent_full_sync', ?)
         ON DUPLICATE KEY UPDATE kind = VALUES(kind), name = VALUES(name), extension = VALUES(extension), size_bytes = VALUES(size_bytes), modified_at = VALUES(modified_at), last_seen_at = NOW(), deleted = 0, source = VALUES(source), sync_version = VALUES(sync_version)`,
        [item.id, item.rootKey, item.kind, item.relativePath, item.name, item.extension, item.sizeBytes, mysqlDateOrNull(item.modifiedAt), syncVersion]
      );
      written += 1;
    }
    return written;
  }, { scope: 'media_index_data' });
}

function buildMediaFullSyncWriteGate(config = {}) {
  const mediaIndex = config && config.mediaIndex ? config.mediaIndex : {};
  const enabled = mediaIndex.writeEnabled === true && mediaIndex.dataWriteEnabled === true && mediaIndex.fullSyncEnabled === true;
  let reason = 'ok';
  if (mediaIndex.writeEnabled !== true) reason = 'media_index_write_gate_disabled';
  else if (mediaIndex.dataWriteEnabled !== true) reason = 'media_index_data_write_gate_disabled';
  else if (mediaIndex.fullSyncEnabled !== true) reason = 'media_index_full_sync_gate_disabled';
  return { enabled, reason };
}

function pathExtname(value) {
  const text = String(value || '');
  const slash = text.split('/').pop() || text;
  const dot = slash.lastIndexOf('.');
  return dot >= 0 ? slash.slice(dot).toLowerCase() : '';
}

function mediaKindForExtension(ext) {
  if (MEDIA_AUDIO_EXTENSIONS.has(ext)) return 'audio';
  if (MEDIA_VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (MEDIA_IMAGE_EXTENSIONS.has(ext)) return 'image';
  return '';
}

function mysqlDateOrNull(value) {
  const iso = safeIsoOrNull(value);
  if (!iso) return null;
  return iso.slice(0, 19).replace('T', ' ');
}

function sanitizeComponentStatus(input, fallbackCollectedAt) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return clonePlain(EMPTY_COMPONENT_STATUS);

  return {
    prepared: true,
    protocolVersion: input.protocolVersion === COMPONENT_STATUS_PROTOCOL_VERSION ? COMPONENT_STATUS_PROTOCOL_VERSION : COMPONENT_STATUS_PROTOCOL_VERSION,
    available: true,
    collectedAt: safeIsoOrNull(input.collectedAt) || fallbackCollectedAt || new Date().toISOString(),
    source: 'streaming-pc-heartbeat',
    localDashboard: sanitizeComponent(input.localDashboard, { name: 'Lokales Dashboard', url: 'http://192.168.16.200:8080/dashboard' }),
    localServer: sanitizeComponent(input.localServer, { name: 'Lokaler Dashboard-Server', port: 8080 }),
    obs: sanitizeComponent(input.obs, { name: 'OBS' }),
    streamerbot: sanitizeComponent(input.streamerbot, { name: 'Streamer.bot' }),
    actionsEnabled: false,
    productiveActionsEnabled: false,
    noCommands: true,
    noShellOrProcessActions: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    rawPayloadStored: false
  };
}

function sanitizeComponent(input, fallback = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    available: source.available === true || fallback.available === true,
    name: safeLabel(source.name || fallback.name || 'Komponente'),
    reachable: source.reachable === true ? true : source.reachable === false ? false : null,
    status: safeStatus(source.status || fallback.status || 'unknown'),
    url: safeLocalUrl(source.url || fallback.url || null),
    port: Number.isFinite(Number(source.port || fallback.port)) ? Number(source.port || fallback.port) : null,
    checkedAt: safeIsoOrNull(source.checkedAt) || null,
    detail: safeLabel(source.detail || fallback.detail || '')
  };
}

function decodeClientWebSocketFrame(chunk) {
  if (!Buffer.isBuffer(chunk) || chunk.length < 2) return { ok: false, incomplete: true, reason: 'incomplete_websocket_frame' };
  const first = chunk[0];
  const second = chunk[1];
  const fin = (first & 0x80) === 0x80;
  const opcode = first & 0x0f;
  const masked = (second & 0x80) === 0x80;
  let length = second & 0x7f;
  let offset = 2;

  if (!fin) return { ok: false, reason: 'fragmented_websocket_frame_unsupported', closeSocket: true };
  if (!masked) return { ok: false, reason: 'unmasked_client_frame', closeSocket: true };
  if (length === 126) {
    if (chunk.length < offset + 2) return { ok: false, incomplete: true, reason: 'incomplete_websocket_frame' };
    length = chunk.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (chunk.length < offset + 8) return { ok: false, incomplete: true, reason: 'incomplete_websocket_frame' };
    return { ok: false, reason: 'agent_payload_too_large_64bit_frame', closeSocket: true };
  }
  if (length > MAX_INVENTORY_SYNC_PAYLOAD_BYTES) return { ok: false, reason: 'agent_payload_too_large', closeSocket: true };

  const totalLength = offset + 4 + length;
  if (chunk.length < totalLength) return { ok: false, incomplete: true, reason: 'incomplete_websocket_frame' };

  const mask = chunk.subarray(offset, offset + 4);
  offset += 4;
  const payload = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) payload[i] = chunk[offset + i] ^ mask[i % 4];
  return { ok: true, opcode, payload, bytesConsumed: totalLength };
}

function writePong(socket, payload) {
  if (!socket || socket.destroyed) return;
  const data = Buffer.isBuffer(payload) ? payload : Buffer.alloc(0);
  const length = Math.min(data.length, 125);
  const frame = Buffer.alloc(2 + length);
  frame[0] = 0x8A;
  frame[1] = length;
  data.copy(frame, 2, 0, length);
  try { socket.write(frame); } catch (err) { /* ignore */ }
}

function safeSocketEnd(socket) {
  try { if (socket && !socket.destroyed) socket.end(); } catch (err) { /* ignore */ }
}

function clearConnectionState(reason) {
  if (!CONNECTION_STATE.connected && CONNECTION_STATE.connectionState === 'offline') return;
  CONNECTION_STATE.connected = false;
  CONNECTION_STATE.connectionState = 'offline';
  CONNECTION_STATE.agentId = null;
  CONNECTION_STATE.agentName = null;
  CONNECTION_STATE.agentVersion = null;
  CONNECTION_STATE.protocolVersion = null;
  CONNECTION_STATE.connectedSince = null;
  CONNECTION_STATE.lastSeenAt = new Date().toISOString();
  CONNECTION_STATE.closeReason = safeReason(reason || 'socket_closed');
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.heartbeatReceiverEnabled = false;
  CONNECTION_STATE.lastHeartbeatAt = null;
  CONNECTION_STATE.heartbeatAgeMs = null;
  CONNECTION_STATE.heartbeatSeq = null;
  CONNECTION_STATE.heartbeatProtocolVersion = null;
  CONNECTION_STATE.stale = false;
  CONNECTION_STATE.lastHeartbeatPayloadStored = false;
  CONNECTION_STATE.componentStatus = clonePlain(EMPTY_COMPONENT_STATUS);
  CONNECTION_STATE.componentStatusUpdatedAt = null;
  CONNECTION_STATE.liveState = null;
  CONNECTION_STATE.liveStateUpdatedAt = null;
  CONNECTION_STATE.lastLiveStateAt = null;
  CONNECTION_STATE.liveStateSeq = null;
  CONNECTION_STATE.liveStateAgeMs = null;
  CONNECTION_STATE.liveStateStale = false;
  CONNECTION_STATE.lastLiveStatePayloadStored = false;
  CONNECTION_STATE.inventorySync = clonePlain(EMPTY_OBS_INVENTORY_SYNC);
  CONNECTION_STATE.inventorySyncUpdatedAt = null;
  CONNECTION_STATE.lastInventorySyncAt = null;
  CONNECTION_STATE.inventorySyncSeq = null;
  CONNECTION_STATE.lastInventorySyncPayloadStored = false;
  CONNECTION_STATE.mediaInventorySync = clonePlain(EMPTY_MEDIA_INVENTORY_SYNC);
  CONNECTION_STATE.mediaFullSync = clonePlain(EMPTY_MEDIA_FULL_SYNC_STATE);
  CONNECTION_STATE.mediaFullSyncReceivedChunkIndexes = new Set();
  CONNECTION_STATE.mediaFullSyncCompareSnapshot = clonePlain(EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT);
  CONNECTION_STATE.mediaFullSyncCompareItemsByChunk = new Map();
  CONNECTION_STATE.mediaInventorySyncUpdatedAt = null;
  CONNECTION_STATE.lastMediaInventorySyncAt = null;
  CONNECTION_STATE.mediaInventorySyncSeq = null;
  CONNECTION_STATE.lastMediaInventorySyncPayloadStored = false;
  activeSocket = null;
}

function recordRejectDiagnostic(req, details = {}) {
  const safePath = extractSafePath(req, details.wsPath || '/agent-ws');
  REJECT_DIAGNOSTIC.rejectCount += 1;
  REJECT_DIAGNOSTIC.lastRejectAt = new Date().toISOString();
  REJECT_DIAGNOSTIC.lastRejectReason = safeReason(details.reason || 'agent_runtime_rejected');
  REJECT_DIAGNOSTIC.lastRejectPath = safePath;
  REJECT_DIAGNOSTIC.lastRejectStatusCode = Number.isInteger(details.code) ? details.code : 503;
  REJECT_DIAGNOSTIC.lastRejectMethod = safeMethod(req && req.method ? req.method : 'GET');
  REJECT_DIAGNOSTIC.lastRejectHasAuthorizationHeader = hasHeader(req, 'authorization');
  REJECT_DIAGNOSTIC.lastRejectHasCookieHeader = hasHeader(req, 'cookie');
  REJECT_DIAGNOSTIC.lastRejectHasQueryString = hasQueryString(req);
  REJECT_DIAGNOSTIC.lastRejectHasAgentIdHeader = hasHeader(req, 'x-scc-agent-id');
  REJECT_DIAGNOSTIC.lastRejectHasProtocolHeader = hasHeader(req, 'x-scc-agent-protocol');
  REJECT_DIAGNOSTIC.lastRejectAgentIdHint = details.agentIdHint || null;
  REJECT_DIAGNOSTIC.lastRejectProtocolHint = details.protocolHint || null;
  REJECT_DIAGNOSTIC.lastRejectAccessKeyConfigured = details.accessKeyConfigured === true;
  REJECT_DIAGNOSTIC.lastRejectConnectionProofCompared = details.connectionProofCompared === true;
  REJECT_DIAGNOSTIC.lastRejectUserAgentHint = safeUserAgentHint(req);
  REJECT_DIAGNOSTIC.secretsExposed = false;
  REJECT_DIAGNOSTIC.secretsLogged = false;
  REJECT_DIAGNOSTIC.headersLogged = false;
  REJECT_DIAGNOSTIC.rawIpLogged = false;
  REJECT_DIAGNOSTIC.queryStringLogged = false;
  REJECT_DIAGNOSTIC.authorizationHeaderLogged = false;
  REJECT_DIAGNOSTIC.cookieHeaderLogged = false;
  REJECT_DIAGNOSTIC.agentIdHeaderValueLogged = false;
  REJECT_DIAGNOSTIC.protocolHeaderValueLogged = false;
  REJECT_DIAGNOSTIC.bearerTokenLogged = false;
  REJECT_DIAGNOSTIC.tokenLengthLogged = false;
  REJECT_DIAGNOSTIC.tokenHashLogged = false;
}

function recordHeartbeatReject(reason) {
  CONNECTION_STATE.heartbeatRejectCount += 1;
  CONNECTION_STATE.lastHeartbeatRejectAt = new Date().toISOString();
  CONNECTION_STATE.lastHeartbeatRejectReason = safeReason(reason || 'heartbeat_rejected');
  CONNECTION_STATE.lastHeartbeatPayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
}

function recordLiveStateReject(reason) {
  CONNECTION_STATE.liveStateRejectCount += 1;
  CONNECTION_STATE.lastLiveStateRejectAt = new Date().toISOString();
  CONNECTION_STATE.lastLiveStateRejectReason = safeReason(reason || 'live_state_rejected');
  CONNECTION_STATE.lastLiveStatePayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
}

function recordInventorySyncReject(reason) {
  CONNECTION_STATE.inventorySyncRejectCount += 1;
  CONNECTION_STATE.lastInventorySyncRejectAt = new Date().toISOString();
  CONNECTION_STATE.lastInventorySyncRejectReason = safeReason(reason || 'inventory_sync_rejected');
  CONNECTION_STATE.lastInventorySyncPayloadStored = false;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
}

function buildRejectDiagnosticSummary() {
  return {
    prepared: true,
    enabled: true,
    inMemoryOnly: true,
    persistsToDatabase: false,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: true,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: true,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
    rejectCount: REJECT_DIAGNOSTIC.rejectCount,
    lastRejectAt: REJECT_DIAGNOSTIC.lastRejectAt,
    lastRejectReason: REJECT_DIAGNOSTIC.lastRejectReason,
    lastRejectPath: REJECT_DIAGNOSTIC.lastRejectPath,
    lastRejectStatusCode: REJECT_DIAGNOSTIC.lastRejectStatusCode,
    lastRejectMethod: REJECT_DIAGNOSTIC.lastRejectMethod,
    lastRejectHasAuthorizationHeader: REJECT_DIAGNOSTIC.lastRejectHasAuthorizationHeader,
    lastRejectHasCookieHeader: REJECT_DIAGNOSTIC.lastRejectHasCookieHeader,
    lastRejectHasQueryString: REJECT_DIAGNOSTIC.lastRejectHasQueryString,
    lastRejectHasAgentIdHeader: REJECT_DIAGNOSTIC.lastRejectHasAgentIdHeader,
    lastRejectHasProtocolHeader: REJECT_DIAGNOSTIC.lastRejectHasProtocolHeader,
    lastRejectAgentIdHint: REJECT_DIAGNOSTIC.lastRejectAgentIdHint,
    lastRejectProtocolHint: REJECT_DIAGNOSTIC.lastRejectProtocolHint,
    lastRejectAccessKeyConfigured: REJECT_DIAGNOSTIC.lastRejectAccessKeyConfigured,
    lastRejectConnectionProofCompared: REJECT_DIAGNOSTIC.lastRejectConnectionProofCompared,
    lastRejectUserAgentHint: REJECT_DIAGNOSTIC.lastRejectUserAgentHint,
    visibleRejectReasons: [
      'agent_runtime_rejected',
      'malformed_upgrade_request',
      'runtime_not_effectively_enabled',
      'missing_agent_id',
      'unknown_agent_id',
      'missing_connection_proof',
      'invalid_connection_proof',
      'protocol_version_unsupported',
      'access_key_not_configured',
      'invalid_websocket_upgrade',
      'agent_already_connected'
    ],
    neverLogged: [
      'authorization_header_value',
      'bearer_token',
      'bearer_token_length',
      'bearer_token_hash',
      'agent_access_key',
      'cookies',
      'complete_headers',
      'query_string_values',
      'raw_ip_address',
      'request_body',
      'local_absolute_paths',
      'raw_heartbeat_payload'
    ],
    secretsExposed: false,
    secretsLogged: false,
    headersLogged: false,
    rawIpLogged: false,
    queryStringLogged: false,
    authorizationHeaderLogged: false,
    cookieHeaderLogged: false,
    agentIdHeaderValueLogged: false,
    protocolHeaderValueLogged: false,
    bearerTokenLogged: false,
    tokenLengthLogged: false,
    tokenHashLogged: false,
    acceptsAgentConnections: true,
    actionEnabled: false,
    productiveAgentRuntime: false
  };
}


function buildMediaFullSyncCompareSnapshotSummary() {
  const snapshot = clonePlain(CONNECTION_STATE.mediaFullSyncCompareSnapshot || EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT);
  snapshot.items = [];
  return snapshot;
}

function buildMediaFullSyncCompareSnapshotStatusResponse() {
  return clonePlain(CONNECTION_STATE.mediaFullSyncCompareSnapshot || EMPTY_MEDIA_FULL_SYNC_COMPARE_SNAPSHOT);
}

function buildAgentConnectionSummary() {
  updateDerivedHeartbeatState();
  return {
    prepared: true,
    inMemoryOnly: true,
    persistsToDatabase: false,
    connected: CONNECTION_STATE.connected === true,
    connectionState: CONNECTION_STATE.connectionState,
    agentId: CONNECTION_STATE.agentId,
    agentName: CONNECTION_STATE.agentName,
    agentVersion: CONNECTION_STATE.agentVersion,
    protocolVersion: CONNECTION_STATE.protocolVersion,
    connectedSince: CONNECTION_STATE.connectedSince,
    lastSeenAt: CONNECTION_STATE.lastSeenAt,
    reconnectCount: CONNECTION_STATE.reconnectCount,
    closeReason: CONNECTION_STATE.closeReason,
    heartbeatReceiverEnabled: CONNECTION_STATE.heartbeatReceiverEnabled === true,
    heartbeatReceiverBuildEnabled: HEARTBEAT_RECEIVER_BUILD_ENABLED,
    heartbeatInMemoryOnly: true,
    heartbeatPersistsToDatabase: false,
    lastHeartbeatAt: CONNECTION_STATE.lastHeartbeatAt,
    heartbeatAgeMs: CONNECTION_STATE.heartbeatAgeMs,
    heartbeatSeq: CONNECTION_STATE.heartbeatSeq,
    heartbeatProtocolVersion: CONNECTION_STATE.heartbeatProtocolVersion,
    plannedHeartbeatIntervalMs: PLANNED_HEARTBEAT_INTERVAL_MS,
    staleAfterMs: STALE_AFTER_MS,
    offlineAfterMs: OFFLINE_AFTER_MS,
    stale: CONNECTION_STATE.stale === true,
    heartbeatRejectCount: CONNECTION_STATE.heartbeatRejectCount,
    lastHeartbeatRejectAt: CONNECTION_STATE.lastHeartbeatRejectAt,
    lastHeartbeatRejectReason: CONNECTION_STATE.lastHeartbeatRejectReason,
    lastHeartbeatPayloadStored: false,
    liveStateReceiverPrepared: true,
    liveStateInMemoryOnly: true,
    liveStatePersistsToDatabase: false,
    liveStateExecutesActions: false,
    liveStateAcceptsCommands: false,
    liveStateProtocolVersion: LIVE_STATE_PROTOCOL_VERSION,
    plannedLiveStateIntervalMs: PLANNED_LIVE_STATE_INTERVAL_MS,
    lastLiveStateAt: CONNECTION_STATE.lastLiveStateAt,
    liveStateSeq: CONNECTION_STATE.liveStateSeq,
    liveStateAgeMs: CONNECTION_STATE.liveStateAgeMs,
    liveStateStaleAfterMs: LIVE_STATE_STALE_AFTER_MS,
    liveStateOfflineAfterMs: LIVE_STATE_OFFLINE_AFTER_MS,
    liveStateStale: CONNECTION_STATE.liveStateStale === true,
    liveStateRejectCount: CONNECTION_STATE.liveStateRejectCount,
    lastLiveStateRejectAt: CONNECTION_STATE.lastLiveStateRejectAt,
    lastLiveStateRejectReason: CONNECTION_STATE.lastLiveStateRejectReason,
    lastLiveStatePayloadStored: false,
    liveState: clonePlain(CONNECTION_STATE.liveState || buildEmptyLiveState()),
    inventorySyncReceiverPrepared: true,
    inventorySyncInMemoryOnly: true,
    inventorySyncPersistsToDatabase: false,
    inventorySyncProtocolVersion: INVENTORY_SYNC_PROTOCOL_VERSION,
    plannedInventorySyncIntervalMs: PLANNED_INVENTORY_SYNC_INTERVAL_MS,
    mediaInventorySyncReceiverPrepared: true,
    mediaInventorySyncProtocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
    plannedMediaInventorySyncIntervalMs: PLANNED_MEDIA_INVENTORY_SYNC_INTERVAL_MS,
    lastInventorySyncAt: CONNECTION_STATE.lastInventorySyncAt,
    inventorySyncSeq: CONNECTION_STATE.inventorySyncSeq,
    inventorySyncRejectCount: CONNECTION_STATE.inventorySyncRejectCount,
    lastInventorySyncRejectAt: CONNECTION_STATE.lastInventorySyncRejectAt,
    lastInventorySyncRejectReason: CONNECTION_STATE.lastInventorySyncRejectReason,
    lastInventorySyncPayloadStored: false,
    inventorySync: clonePlain(CONNECTION_STATE.inventorySync || EMPTY_OBS_INVENTORY_SYNC),
    mediaInventorySyncReceiverPrepared: true,
    mediaInventorySyncInMemoryOnly: true,
    mediaInventorySyncPersistsToDatabase: false,
    mediaInventorySyncProtocolVersion: MEDIA_INVENTORY_SYNC_PROTOCOL_VERSION,
    plannedMediaInventorySyncIntervalMs: PLANNED_MEDIA_INVENTORY_SYNC_INTERVAL_MS,
    lastMediaInventorySyncAt: CONNECTION_STATE.lastMediaInventorySyncAt,
    mediaInventorySyncSeq: CONNECTION_STATE.mediaInventorySyncSeq,
    mediaInventorySyncRejectCount: CONNECTION_STATE.mediaInventorySyncRejectCount,
    lastMediaInventorySyncRejectAt: CONNECTION_STATE.lastMediaInventorySyncRejectAt,
    lastMediaInventorySyncRejectReason: CONNECTION_STATE.lastMediaInventorySyncRejectReason,
    lastMediaInventorySyncPayloadStored: false,
    mediaInventorySync: clonePlain(CONNECTION_STATE.mediaInventorySync || EMPTY_MEDIA_INVENTORY_SYNC),
    mediaFullSyncReceiverPrepared: true,
    mediaFullSyncProtocolVersion: MEDIA_FULL_SYNC_PROTOCOL_VERSION,
    mediaFullSyncPersistsToDatabase: CONNECTION_STATE.mediaFullSyncPersistsToDatabase === true,
    mediaFullSync: clonePlain(CONNECTION_STATE.mediaFullSync || EMPTY_MEDIA_FULL_SYNC_STATE),
    mediaFullSyncCompareSnapshot: buildMediaFullSyncCompareSnapshotSummary(),
    componentStatus: clonePlain(CONNECTION_STATE.componentStatus || EMPTY_COMPONENT_STATUS),
    componentStatusUpdatedAt: CONNECTION_STATE.componentStatusUpdatedAt,
    componentStatusInMemoryOnly: true,
    componentStatusPersistsToDatabase: false,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    heartbeatExecutesActions: false,
    heartbeatAcceptsCommands: false,
    heartbeatAcceptsCapabilities: false,
    secretsExposed: false,
    bearerTokenLogged: false,
    tokenLengthLogged: false,
    tokenHashLogged: false
  };
}

function updateDerivedHeartbeatState() {
  updateDerivedLiveState();
  if (!CONNECTION_STATE.connected) {
    CONNECTION_STATE.connectionState = 'offline';
    CONNECTION_STATE.stale = false;
    CONNECTION_STATE.heartbeatAgeMs = null;
    return;
  }

  if (!CONNECTION_STATE.lastHeartbeatAt) {
    CONNECTION_STATE.heartbeatAgeMs = null;
    CONNECTION_STATE.stale = false;
    CONNECTION_STATE.connectionState = 'connected';
    return;
  }

  const last = Date.parse(CONNECTION_STATE.lastHeartbeatAt);
  if (!Number.isFinite(last)) {
    CONNECTION_STATE.heartbeatAgeMs = null;
    CONNECTION_STATE.stale = false;
    CONNECTION_STATE.connectionState = 'connected';
    return;
  }

  const age = Math.max(0, Date.now() - last);
  CONNECTION_STATE.heartbeatAgeMs = age;
  if (age >= OFFLINE_AFTER_MS) {
    CONNECTION_STATE.connectionState = 'offline';
    CONNECTION_STATE.stale = true;
    return;
  }
  if (age >= STALE_AFTER_MS) {
    CONNECTION_STATE.connectionState = 'stale';
    CONNECTION_STATE.stale = true;
    return;
  }
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.stale = false;
}

function updateDerivedLiveState() {
  if (!CONNECTION_STATE.connected || !CONNECTION_STATE.lastLiveStateAt) {
    CONNECTION_STATE.liveStateAgeMs = null;
    CONNECTION_STATE.liveStateStale = false;
    return;
  }
  const last = Date.parse(CONNECTION_STATE.lastLiveStateAt);
  if (!Number.isFinite(last)) {
    CONNECTION_STATE.liveStateAgeMs = null;
    CONNECTION_STATE.liveStateStale = false;
    return;
  }
  const age = Math.max(0, Date.now() - last);
  CONNECTION_STATE.liveStateAgeMs = age;
  CONNECTION_STATE.liveStateStale = age >= LIVE_STATE_STALE_AFTER_MS;
}

function buildEmptyLiveState() {
  return { prepared: true, readOnly: true, protocolVersion: LIVE_STATE_PROTOCOL_VERSION, source: 'agent-wss-live-state', available: false, collectedAt: null, receivedAt: null, obs: { connected: false, detected: false, reachable: null, currentScene: null, currentProgramSceneName: null, status: 'not_reported', noObsControl: true }, currentScene: null, currentProgramSceneName: null, safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false } };
}

function buildAgentObsLiveStatusResponse() {
  updateDerivedHeartbeatState();
  const connected = CONNECTION_STATE.connected === true;
  const liveState = CONNECTION_STATE.liveState || buildEmptyLiveState();
  const available = connected && liveState && liveState.obs && Boolean(liveState.obs.currentScene);
  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: 'rdap_agent_live_state_scene_mapping_status_0220c.v1',
    route: '/api/remote/agent/obs/live/status',
    generatedAt: new Date().toISOString(),
    readOnly: true,
    prepared: true,
    active: available,
    status: available ? 'live_scene_available' : (connected ? 'connected_no_live_scene' : 'agent_offline'),
    agent: { connected, connectionState: CONNECTION_STATE.connectionState, agentId: CONNECTION_STATE.agentId, agentName: CONNECTION_STATE.agentName, lastSeenAt: CONNECTION_STATE.lastSeenAt, lastLiveStateAt: CONNECTION_STATE.lastLiveStateAt, liveStateAgeMs: CONNECTION_STATE.liveStateAgeMs, liveStateStale: CONNECTION_STATE.liveStateStale === true },
    liveState: clonePlain(liveState),
    obs: clonePlain(liveState.obs || buildEmptyLiveState().obs),
    currentScene: liveState.currentScene || null,
    currentProgramSceneName: liveState.currentProgramSceneName || null,
    safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false, inMemoryOnly: true, persistsToDatabase: false }
  };
}


function buildAgentObsInventoryStatusResponse() {
  updateDerivedHeartbeatState();
  const connected = CONNECTION_STATE.connected === true;
  const inventory = clonePlain(CONNECTION_STATE.inventorySync || EMPTY_OBS_INVENTORY_SYNC);
  const active = connected && inventory && (inventory.active === true || (inventory.counts && Number(inventory.counts.total) > 0));
  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: 'rdap_agent_obs_inventory_sync_status_0222b.v1',
    route: '/api/remote/agent/obs/inventory/status',
    generatedAt: new Date().toISOString(),
    readOnly: true,
    prepared: true,
    active,
    status: active ? 'inventory_available' : (connected ? 'connected_inventory_pending' : 'agent_offline'),
    agent: { connected, connectionState: CONNECTION_STATE.connectionState, agentId: CONNECTION_STATE.agentId, agentName: CONNECTION_STATE.agentName, lastSeenAt: CONNECTION_STATE.lastSeenAt, lastInventorySyncAt: CONNECTION_STATE.lastInventorySyncAt, inventorySyncSeq: CONNECTION_STATE.inventorySyncSeq },
    inventory,
    scenes: inventory.scenes || [],
    sources: inventory.sources || [],
    audioSources: inventory.audioSources || [],
    counts: inventory.counts || { scenes: 0, sources: 0, audioSources: 0, total: 0 },
    currentScene: inventory.currentScene || (CONNECTION_STATE.liveState && CONNECTION_STATE.liveState.currentScene) || null,
    safety: { readOnly: true, actionsEnabled: false, controlEnabled: false, noObsControl: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false, inMemoryOnly: true, persistsToDatabase: false }
  };
}


function buildAgentMediaInventoryStatusResponse() {
  updateDerivedHeartbeatState();
  const connected = CONNECTION_STATE.connected === true;
  const inventory = clonePlain(CONNECTION_STATE.mediaInventorySync || EMPTY_MEDIA_INVENTORY_SYNC);
  const counts = inventory.counts || EMPTY_MEDIA_INVENTORY_SYNC.counts;
  const active = connected && inventory && (inventory.active === true || Number(counts.total || 0) > 0);
  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: 'rdap_agent_media_inventory_sync_status_027.v1',
    route: '/api/remote/agent/media/inventory/status',
    generatedAt: new Date().toISOString(),
    readOnly: true,
    prepared: true,
    active,
    status: active ? 'media_inventory_available' : (connected ? 'connected_media_inventory_pending' : 'agent_offline'),
    agent: { connected, connectionState: CONNECTION_STATE.connectionState, agentId: CONNECTION_STATE.agentId, agentName: CONNECTION_STATE.agentName, lastSeenAt: CONNECTION_STATE.lastSeenAt, lastMediaInventorySyncAt: CONNECTION_STATE.lastMediaInventorySyncAt, mediaInventorySyncSeq: CONNECTION_STATE.mediaInventorySyncSeq },
    inventory,
    items: inventory.items || [],
    groups: inventory.groups || EMPTY_MEDIA_INVENTORY_SYNC.groups,
    counts,
    syncFoundation: inventory.syncFoundation || buildMediaSyncFoundationStatus(inventory),
    fullSync: clonePlain(CONNECTION_STATE.mediaFullSync || EMPTY_MEDIA_FULL_SYNC_STATE),
    fullSyncCompareSnapshot: buildMediaFullSyncCompareSnapshotSummary(),
    onlineIndexTarget: inventory.onlineIndexTarget || { prepared: true, planned: true, database: 'remote_modboard_mariadb', table: 'remote_media_index', activeWrites: false },
    safety: { readOnly: true, uploadEnabled: false, editEnabled: false, deleteEnabled: false, noFileContent: true, noAbsolutePaths: true, noAgentActionExecution: true, noFileWrite: true, noDatabaseWrite: true, noShellOrProcessActions: true, secretsExposed: false, inMemoryOnly: true, persistsToDatabase: CONNECTION_STATE.mediaFullSyncPersistsToDatabase === true }
  };
}

function rejectUpgrade(socket, details = {}) {
  const code = Number.isInteger(details.code) ? details.code : 503;
  const reason = safeReason(details.reason || 'agent_runtime_rejected');
  const message = safeHeaderText(details.message || 'Stream-PC connection rejected.');
  try {
    socket.write([
      `HTTP/1.1 ${code} Service Unavailable`,
      'Connection: close',
      'Content-Type: text/plain; charset=utf-8',
      'X-SCC-Agent-Runtime: transport-guarded',
      'X-SCC-Agent-Actions: disabled',
      `X-SCC-Agent-Reject-Reason: ${reason}`,
      '',
      `${message}\nreason=${reason}\n`
    ].join('\r\n'));
  } catch (err) {
    // ignore socket write errors; do not log request details
  } finally {
    socket.destroy();
  }
}

function hasValidWebSocketUpgrade(req) {
  const upgrade = readHeaderValue(req, 'upgrade').toLowerCase();
  const connection = readHeaderValue(req, 'connection').toLowerCase();
  const key = readHeaderValue(req, 'sec-websocket-key');
  const version = readHeaderValue(req, 'sec-websocket-version');
  return upgrade === 'websocket' && connection.includes('upgrade') && version === '13' && /^[A-Za-z0-9+/=]{20,60}$/.test(key);
}

function readHeaderValue(req, name) {
  if (!req || !req.headers) return '';
  const value = req.headers[String(name).toLowerCase()];
  if (Array.isArray(value)) return value[0] ? String(value[0]).trim() : '';
  return typeof value === 'string' ? value.trim() : '';
}

function hasHeader(req, name) {
  if (!req || !req.headers) return false;
  return Object.prototype.hasOwnProperty.call(req.headers, String(name).toLowerCase());
}

function hasQueryString(req) {
  return Boolean(req && typeof req.url === 'string' && req.url.includes('?'));
}

function extractSafePath(req, fallback) {
  if (!req || typeof req.url !== 'string') return fallback;
  try {
    const parsed = new URL(req.url, 'https://mods.forrestcgn.de');
    return parsed.pathname || fallback;
  } catch (err) {
    return req.url.split('?')[0] || fallback;
  }
}

function extractBearerToken(authorization) {
  const value = typeof authorization === 'string' ? authorization.trim() : '';
  const match = /^Bearer\s+(.+)$/i.exec(value);
  if (!match) return '';
  return match[1].trim();
}

function getConfiguredAccessKey() {
  const value = process.env.AGENT_ACCESS_KEY;
  return typeof value === 'string' ? value.trim() : '';
}

function compareSecretSafely(candidate, expected) {
  if (!candidate || !expected) return false;
  const candidateDigest = crypto.createHash('sha256').update(candidate).digest();
  const expectedDigest = crypto.createHash('sha256').update(expected).digest();
  if (candidateDigest.length !== expectedDigest.length) return false;
  return crypto.timingSafeEqual(candidateDigest, expectedDigest);
}

function safeAgentIdHint(value) {
  const safe = safeHeaderHint(value);
  if (!safe) return null;
  if (safe === 'stream-pc-main') return 'expected_agent_id_seen';
  return 'unexpected_agent_id_seen';
}

function safeProtocolHint(value) {
  const safe = safeHeaderHint(value);
  if (!safe) return null;
  if (safe === EXPECTED_PROTOCOL_VERSION) return 'expected_protocol_seen';
  return 'unexpected_protocol_seen';
}

function safeUserAgentHint(req) {
  const userAgent = readHeaderValue(req, 'user-agent');
  if (!userAgent) return null;
  return 'user_agent_present';
}

function safeHeaderHint(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, 80);
}

function safeReason(value) {
  const cleaned = String(value || 'unknown').replace(/[^a-zA-Z0-9._:-]/g, '_').slice(0, 80);
  return cleaned || 'unknown';
}

function safeMethod(value) {
  const cleaned = String(value || 'GET').replace(/[^A-Z]/g, '').slice(0, 12);
  return cleaned || 'GET';
}

function safeHeaderText(value) {
  return String(value || '').replace(/[\r\n]/g, ' ').replace(/[^\x20-\x7E]/g, '').slice(0, 160);
}

function safeLabel(value) {
  return String(value || '').replace(/[<>]/g, '').slice(0, 120);
}

function safeStatus(value) {
  const cleaned = String(value || 'unknown').replace(/[^a-zA-Z0-9._:-]/g, '_').slice(0, 40);
  return cleaned || 'unknown';
}

function safeIsoOrNull(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function safeLocalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (!['127.0.0.1', 'localhost', '192.168.16.200'].includes(url.hostname)) return null;
    return url.toString().slice(0, 180);
  } catch (err) {
    return null;
  }
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  registerAgentRuntime,
  buildRegistrationSummary,
  buildAgentConnectionSummary,
  buildMediaFullSyncCompareSnapshotStatusResponse,
  buildAgentObsLiveStatusResponse,
  buildAgentObsInventoryStatusResponse,
  buildAgentMediaInventoryStatusResponse,
  buildRejectDiagnosticSummary
};
