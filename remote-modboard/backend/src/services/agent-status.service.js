'use strict';

const os = require('os');
const {
  MODULE_BUILD: AGENT_RUNTIME_BUILD,
  STATUS_API_VERSION,
  buildAgentConnectionSummary,
  buildRejectDiagnosticSummary
} = require('./agent-runtime.service');

const MODULE = 'remote_agent_status';
const MODULE_BUILD = AGENT_RUNTIME_BUILD;
const EXPECTED_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const LOADED_AT = new Date().toISOString();

const EXPECTED_AGENT = Object.freeze({
  agentId: 'stream-pc-main',
  agentName: 'Forrest Stream-PC'
});

const DEFAULT_TRANSPORT = Object.freeze({
  plannedTransport: 'wss',
  plannedDirection: 'stream-pc-agent-to-webserver',
  plannedWsPath: '/agent-ws',
  streamPcPublicPortRequired: false,
  incomingInternetConnectionToStreamPcRequired: false,
  dynamicStreamPcIpAllowed: true
});

const SAFETY = Object.freeze({
  noObsControl: true,
  noSoundControl: true,
  noOverlayControl: true,
  noCommandsOrChannelpoints: true,
  noShellOrProcessActions: true,
  noFileWrite: true,
  noProcessControl: true,
  noFreeUrlExecution: true,
  noDatabaseWrite: true,
  noProductiveWrites: true,
  noAgentActionExecution: true,
  noRawHeartbeatPayload: true
});

function buildAgentStatusSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();
  const connection = buildAgentConnectionSummary();
  const heartbeat = buildHeartbeatSummary(runtime, connection);

  return {
    enabled: runtime.effectiveEnabled,
    connected: connection.connected,
    connectionState: connection.connectionState,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    runtimeSkeletonPrepared: runtime.skeletonPrepared,
    runtimeRequestedEnabled: runtime.requestedEnabled,
    runtimeAcceptBuildPrepared: runtime.acceptBuildPrepared,
    runtimeAcceptBuildEnabled: runtime.acceptBuildEnabled,
    runtimeEffectiveEnabled: runtime.effectiveEnabled,
    acceptsAgentConnections: runtime.acceptsAgentConnections,
    heartbeatReceiverEnabled: heartbeat.heartbeatReceiverEnabled,
    heartbeatReceiverBuildEnabled: heartbeat.heartbeatReceiverBuildEnabled,
    accessKeyConfigured: runtime.accessKeyConfigured,
    accessKeyExposed: false,
    plannedTransport: transport.plannedTransport,
    plannedDirection: transport.plannedDirection,
    plannedWsPath: transport.plannedWsPath,
    streamPcPublicPortRequired: transport.streamPcPublicPortRequired,
    expectedAgentId: runtime.expectedAgentId,
    expectedAgentName: runtime.expectedAgentName,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
    expectedHeartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION,
    agentId: connection.agentId,
    agentName: connection.agentName,
    agentVersion: connection.agentVersion,
    protocolVersion: connection.protocolVersion,
    connectedSince: connection.connectedSince,
    lastSeenAt: connection.lastSeenAt,
    lastHeartbeatAt: heartbeat.lastHeartbeatAt,
    heartbeatAgeMs: heartbeat.heartbeatAgeMs,
    heartbeatSeq: heartbeat.heartbeatSeq,
    heartbeatProtocolVersion: heartbeat.heartbeatProtocolVersion,
    stale: heartbeat.stale,
    handshakePrecheckPrepared: rejectDiagnostic.handshakePrecheckPrepared,
    handshakePrecheckAcceptsConnections: runtime.effectiveEnabled,
    accessKeyComparePrepared: rejectDiagnostic.accessKeyComparePrepared,
    accessKeyCompareAcceptsConnections: runtime.effectiveEnabled,
    rejectDiagnosticPrepared: rejectDiagnostic.prepared,
    rejectDiagnosticInMemoryOnly: rejectDiagnostic.inMemoryOnly,
    rejectCount: rejectDiagnostic.rejectCount,
    lastRejectAt: rejectDiagnostic.lastRejectAt,
    lastRejectReason: rejectDiagnostic.lastRejectReason,
    lastRejectHasAgentIdHeader: rejectDiagnostic.lastRejectHasAgentIdHeader,
    lastRejectHasProtocolHeader: rejectDiagnostic.lastRejectHasProtocolHeader,
    lastRejectAgentIdHint: rejectDiagnostic.lastRejectAgentIdHint,
    lastRejectProtocolHint: rejectDiagnostic.lastRejectProtocolHint,
    lastRejectAccessKeyConfigured: rejectDiagnostic.lastRejectAccessKeyConfigured,
    lastRejectConnectionProofCompared: rejectDiagnostic.lastRejectConnectionProofCompared,
    rejectSecretsExposed: false,
    statusApiVersion: STATUS_API_VERSION
  };
}

function buildAgentStatusResponse(context = {}) {
  const now = new Date().toISOString();
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();
  const connection = buildAgentConnectionSummary();
  const heartbeat = buildHeartbeatSummary(runtime, connection);

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: context.moduleBuild || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    generatedAt: now,
    loadedAt: LOADED_AT,
    agent: {
      enabled: runtime.effectiveEnabled,
      connected: connection.connected,
      connectionState: connection.connectionState,
      reason: runtime.effectiveEnabled ? 'rdap94_heartbeat_readonly_in_memory' : 'runtime_not_effectively_enabled',
      lastHeartbeatAt: heartbeat.lastHeartbeatAt,
      connectedSince: connection.connectedSince,
      lastSeenAt: connection.lastSeenAt,
      heartbeatAgeMs: heartbeat.heartbeatAgeMs,
      heartbeatSeq: heartbeat.heartbeatSeq,
      heartbeatProtocolVersion: heartbeat.heartbeatProtocolVersion,
      reconnectCount: connection.reconnectCount,
      stale: heartbeat.stale,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      agentId: connection.agentId,
      agentName: connection.agentName,
      agentVersion: connection.agentVersion,
      protocolVersion: connection.protocolVersion || STATUS_API_VERSION,
      expectedAgentId: runtime.expectedAgentId,
      expectedAgentName: runtime.expectedAgentName,
      expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
      expectedHeartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION
    },
    runtime: {
      skeletonPrepared: runtime.skeletonPrepared,
      requestedEnabled: runtime.requestedEnabled,
      acceptBuildPrepared: runtime.acceptBuildPrepared,
      acceptBuildEnabled: runtime.acceptBuildEnabled,
      twoStepRuntimeGate: runtime.twoStepRuntimeGate,
      effectiveEnabled: runtime.effectiveEnabled,
      wssRuntimeEnabled: runtime.wssRuntimeEnabled,
      heartbeatReceiverBuildEnabled: heartbeat.heartbeatReceiverBuildEnabled,
      heartbeatReceiverEnabled: heartbeat.heartbeatReceiverEnabled,
      accessKeyConfigured: runtime.accessKeyConfigured,
      accessKeyExposed: false,
      accessKeyLogged: false,
      defaultDisabled: !runtime.effectiveEnabled,
      upgradeGuardPrepared: true,
      handshakePrecheckPrepared: true,
      handshakePrecheckAcceptsConnections: runtime.effectiveEnabled,
      accessKeyComparePrepared: true,
      accessKeyCompareAcceptsConnections: runtime.effectiveEnabled,
      acceptsAgentConnections: runtime.acceptsAgentConnections,
      actionsEnabled: false,
      productiveAgentRuntime: false
    },
    rejectDiagnostic,
    connection,
    heartbeat,
    transport,
    host: {
      webserverService: 'remote-modboard',
      publicHost: 'mods.forrestcgn.de',
      hostname: safeHostname(),
      platform: process.platform,
      nodeVersion: process.version,
      processUptimeSec: Math.floor(process.uptime()),
      localTime: now
    },
    safety: { ...SAFETY },
    warnings: [
      'RDAP94 akzeptiert Heartbeat nur read-only und in-memory auf einer bereits akzeptierten Verbindung.',
      'Agent-Actions bleiben deaktiviert.',
      'Heartbeat aktiviert keine OBS-, Sound-, Overlay-, Command-, Shell-, Datei-, Prozess- oder URL-Ausfuehrung.',
      'Heartbeat schreibt keine Datenbank.',
      'Authorization-Werte, Bearer-Token, AGENT_ACCESS_KEY, Header, Cookies, Query-Werte, rohe IP-Adressen und rohe Heartbeat-Payloads werden nicht in Status, UI oder Logs ausgegeben.'
    ],
    errors: []
  };
}

function buildAgentRoutesSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();
  const connection = buildAgentConnectionSummary();
  const heartbeat = buildHeartbeatSummary(runtime, connection);

  return {
    prepared: true,
    route: '/api/remote/agent/status',
    method: 'GET',
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    runtimeSkeletonPrepared: runtime.skeletonPrepared,
    runtimeRequestedEnabled: runtime.requestedEnabled,
    runtimeAcceptBuildPrepared: runtime.acceptBuildPrepared,
    runtimeAcceptBuildEnabled: runtime.acceptBuildEnabled,
    runtimeEffectiveEnabled: runtime.effectiveEnabled,
    heartbeatFoundationPrepared: true,
    heartbeatReceiverBuildEnabled: heartbeat.heartbeatReceiverBuildEnabled,
    heartbeatReceiverEnabled: heartbeat.heartbeatReceiverEnabled,
    heartbeatInMemoryOnly: true,
    heartbeatPersistsToDatabase: false,
    wssRuntimeEnabled: runtime.wssRuntimeEnabled,
    upgradeGuardPrepared: true,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: runtime.effectiveEnabled,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: runtime.effectiveEnabled,
    acceptsAgentConnections: runtime.acceptsAgentConnections,
    connected: connection.connected,
    connectionState: connection.connectionState,
    lastHeartbeatAt: heartbeat.lastHeartbeatAt,
    heartbeatAgeMs: heartbeat.heartbeatAgeMs,
    stale: heartbeat.stale,
    accessKeyConfigured: runtime.accessKeyConfigured,
    accessKeyExposed: false,
    plannedTransport: transport.plannedTransport,
    plannedDirection: transport.plannedDirection,
    plannedWsPath: transport.plannedWsPath,
    expectedAgentId: runtime.expectedAgentId,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
    expectedHeartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION,
    streamPcPublicPortRequired: false,
    rejectDiagnosticPrepared: rejectDiagnostic.prepared,
    rejectDiagnosticInMemoryOnly: rejectDiagnostic.inMemoryOnly,
    rejectCount: rejectDiagnostic.rejectCount,
    lastRejectAt: rejectDiagnostic.lastRejectAt,
    lastRejectReason: rejectDiagnostic.lastRejectReason,
    lastRejectHasAgentIdHeader: rejectDiagnostic.lastRejectHasAgentIdHeader,
    lastRejectHasProtocolHeader: rejectDiagnostic.lastRejectHasProtocolHeader,
    lastRejectAgentIdHint: rejectDiagnostic.lastRejectAgentIdHint,
    lastRejectProtocolHint: rejectDiagnostic.lastRejectProtocolHint,
    lastRejectAccessKeyConfigured: rejectDiagnostic.lastRejectAccessKeyConfigured,
    lastRejectConnectionProofCompared: rejectDiagnostic.lastRejectConnectionProofCompared,
    rejectSecretsExposed: false,
    noAgentActions: true,
    safety: { ...SAFETY }
  };
}

function buildRuntimeConfigSummary(config = {}) {
  const runtime = config && config.agent && config.agent.runtime ? config.agent.runtime : {};
  const requestedEnabled = runtime.requestedEnabled === true;
  const acceptBuildEnabled = runtime.acceptBuildEnabled === true;
  const effectiveEnabled = requestedEnabled && acceptBuildEnabled;

  return {
    skeletonPrepared: runtime.skeletonPrepared === true || true,
    requestedEnabled,
    acceptBuildPrepared: runtime.acceptBuildPrepared === true,
    acceptBuildEnabled,
    twoStepRuntimeGate: runtime.twoStepRuntimeGate === true,
    effectiveEnabled,
    wssRuntimeEnabled: effectiveEnabled,
    heartbeatReceiverBuildEnabled: true,
    heartbeatReceiverEnabled: effectiveEnabled,
    acceptsAgentConnections: effectiveEnabled,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    wsPath: runtime.wsPath || DEFAULT_TRANSPORT.plannedWsPath,
    expectedAgentId: runtime.expectedAgentId || EXPECTED_AGENT.agentId,
    expectedAgentName: runtime.expectedAgentName || EXPECTED_AGENT.agentName,
    accessKeyConfigured: runtime.accessKeyConfigured === true,
    accessKeyExposed: false,
    accessKeyLogged: false
  };
}

function buildHeartbeatSummary(runtime = {}, connection = {}) {
  return {
    prepared: true,
    runtimeEnabled: runtime.effectiveEnabled === true,
    heartbeatReceiverBuildEnabled: true,
    heartbeatReceiverEnabled: connection.heartbeatReceiverEnabled === true || runtime.effectiveEnabled === true,
    heartbeatInMemoryOnly: true,
    storesHeartbeatInMemoryOnlyForNow: true,
    persistsHeartbeatToDatabase: false,
    heartbeatPersistsToDatabase: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    lastHeartbeatAt: connection.lastHeartbeatAt || null,
    heartbeatAgeMs: Number.isFinite(connection.heartbeatAgeMs) ? connection.heartbeatAgeMs : null,
    heartbeatSeq: Number.isFinite(connection.heartbeatSeq) ? connection.heartbeatSeq : null,
    heartbeatProtocolVersion: connection.heartbeatProtocolVersion || null,
    stale: connection.stale === true,
    staleAfterMs: connection.staleAfterMs || 90000,
    offlineAfterMs: connection.offlineAfterMs || 120000,
    plannedHeartbeatIntervalMs: connection.plannedHeartbeatIntervalMs || 30000,
    heartbeatRejectCount: connection.heartbeatRejectCount || 0,
    lastHeartbeatRejectAt: connection.lastHeartbeatRejectAt || null,
    lastHeartbeatRejectReason: connection.lastHeartbeatRejectReason || null,
    lastHeartbeatPayloadStored: false,
    maxHeartbeatPayloadBytes: 2048,
    expectedHeartbeatProtocolVersion: HEARTBEAT_PROTOCOL_VERSION,
    heartbeatExecutesActions: false,
    heartbeatAcceptsCommands: false,
    heartbeatAcceptsCapabilities: false,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    note: 'RDAP94 verarbeitet Heartbeat nur read-only und in-memory.'
  };
}

function buildTransportSummary(runtime = {}) {
  return {
    ...DEFAULT_TRANSPORT,
    plannedWsPath: runtime.wsPath || DEFAULT_TRANSPORT.plannedWsPath
  };
}

function safeHostname() {
  try {
    return os.hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = {
  buildAgentStatusSummary,
  buildAgentStatusResponse,
  buildAgentRoutesSummary
};
