'use strict';

const crypto = require('crypto');

const MODULE = 'remote_agent_runtime';
const MODULE_BUILD = 'RDAP_0.2.20C_AGENT_LIVE_STATE_SCENE_MAPPING_READONLY';
const STATUS_API_VERSION = 'rdap_agent_live_state_scene_mapping_runtime_0220c.v1';
const EXPECTED_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const COMPONENT_STATUS_PROTOCOL_VERSION = 'rdap-component-status.v1';
const LIVE_STATE_PROTOCOL_VERSION = 'rdap-agent-live-state.v1';
const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const HEARTBEAT_RECEIVER_BUILD_ENABLED = true;
const MAX_HEARTBEAT_PAYLOAD_BYTES = 4096;
const MAX_LIVE_STATE_PAYLOAD_BYTES = 2048;
const PLANNED_HEARTBEAT_INTERVAL_MS = 30000;
const PLANNED_LIVE_STATE_INTERVAL_MS = 500;
const LIVE_STATE_STALE_AFTER_MS = 5000;
const LIVE_STATE_OFFLINE_AFTER_MS = 15000;
const STALE_AFTER_MS = 90000;
const OFFLINE_AFTER_MS = 120000;

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
  lastLiveStatePayloadStored: false
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

  const frame = decodeClientWebSocketFrame(chunk);
  if (!frame.ok) {
    recordHeartbeatReject(frame.reason || 'invalid_websocket_frame');
    if (frame.closeSocket) safeSocketEnd(socket);
    return;
  }

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
  if (Buffer.byteLength(text, 'utf8') > MAX_HEARTBEAT_PAYLOAD_BYTES) {
    recordHeartbeatReject('heartbeat_payload_too_large');
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
    processLiveStatePayload(payload, details, Buffer.byteLength(text, 'utf8'));
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
  if (!Buffer.isBuffer(chunk) || chunk.length < 2) return { ok: false, reason: 'invalid_websocket_frame' };
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
    if (chunk.length < offset + 2) return { ok: false, reason: 'invalid_websocket_frame' };
    length = chunk.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    return { ok: false, reason: 'heartbeat_payload_too_large', closeSocket: true };
  }
  if (length > MAX_HEARTBEAT_PAYLOAD_BYTES) return { ok: false, reason: 'heartbeat_payload_too_large', closeSocket: true };
  if (chunk.length < offset + 4 + length) return { ok: false, reason: 'invalid_websocket_frame' };

  const mask = chunk.subarray(offset, offset + 4);
  offset += 4;
  const payload = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) payload[i] = chunk[offset + i] ^ mask[i % 4];
  return { ok: true, opcode, payload };
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
  buildAgentObsLiveStatusResponse,
  buildRejectDiagnosticSummary
};
