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
  noAgentActionExecution: true
});

const HEARTBEAT_MODEL = Object.freeze({
  prepared: true,
  runtimeEnabled: false,
  heartbeatReceiverEnabled: false,
  lastHeartbeatAt: null,
  heartbeatAgeMs: null,
  staleAfterMs: 90000,
  offlineAfterMs: 120000,
  plannedHeartbeatIntervalMs: 30000,
  storesHeartbeatInMemoryOnlyForNow: true,
  persistsHeartbeatToDatabase: false,
  note: 'RDAP92 akzeptiert maximal Transport; produktiver Heartbeat bleibt fuer RDAP93 separat.'
});

function buildAgentStatusSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();
  const connection = buildAgentConnectionSummary();

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
    heartbeatReceiverEnabled: false,
    accessKeyConfigured: runtime.accessKeyConfigured,
    accessKeyExposed: false,
    plannedTransport: transport.plannedTransport,
    plannedDirection: transport.plannedDirection,
    plannedWsPath: transport.plannedWsPath,
    streamPcPublicPortRequired: transport.streamPcPublicPortRequired,
    expectedAgentId: runtime.expectedAgentId,
    expectedAgentName: runtime.expectedAgentName,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
    agentId: connection.agentId,
    agentName: connection.agentName,
    agentVersion: connection.agentVersion,
    protocolVersion: connection.protocolVersion,
    connectedSince: connection.connectedSince,
    lastSeenAt: connection.lastSeenAt,
    lastHeartbeatAt: null,
    heartbeatAgeMs: null,
    stale: false,
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
      reason: runtime.effectiveEnabled ? 'rdap92_transport_accept_guarded_no_actions' : 'runtime_not_effectively_enabled',
      lastHeartbeatAt: null,
      connectedSince: connection.connectedSince,
      lastSeenAt: connection.lastSeenAt,
      heartbeatAgeMs: null,
      reconnectCount: connection.reconnectCount,
      stale: false,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      agentId: connection.agentId,
      agentName: connection.agentName,
      agentVersion: connection.agentVersion,
      protocolVersion: connection.protocolVersion || STATUS_API_VERSION,
      expectedAgentId: runtime.expectedAgentId,
      expectedAgentName: runtime.expectedAgentName,
      expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION
    },
    runtime: {
      skeletonPrepared: runtime.skeletonPrepared,
      requestedEnabled: runtime.requestedEnabled,
      acceptBuildPrepared: runtime.acceptBuildPrepared,
      acceptBuildEnabled: runtime.acceptBuildEnabled,
      twoStepRuntimeGate: runtime.twoStepRuntimeGate,
      effectiveEnabled: runtime.effectiveEnabled,
      wssRuntimeEnabled: runtime.wssRuntimeEnabled,
      heartbeatReceiverEnabled: false,
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
    heartbeat: { ...HEARTBEAT_MODEL },
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
      'RDAP92 akzeptiert maximal einen guarded WebSocket-Transport, wenn beide Runtime-Gates aktiv sind.',
      'Agent-Actions bleiben deaktiviert.',
      'Heartbeat-Receiver bleibt deaktiviert und wird separat geplant.',
      'OBS, Sounds, Overlays, Commands, Shell, Datei-, Prozess- und URL-Ausfuehrung bleiben deaktiviert.',
      'Authorization-Werte, Bearer-Token, AGENT_ACCESS_KEY, Header, Cookies, Query-Werte und rohe IP-Adressen werden nicht in Status, UI oder Logs ausgegeben.'
    ],
    errors: []
  };
}

function buildAgentRoutesSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();
  const connection = buildAgentConnectionSummary();

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
    heartbeatReceiverEnabled: false,
    wssRuntimeEnabled: runtime.wssRuntimeEnabled,
    upgradeGuardPrepared: true,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: runtime.effectiveEnabled,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: runtime.effectiveEnabled,
    acceptsAgentConnections: runtime.acceptsAgentConnections,
    connected: connection.connected,
    connectionState: connection.connectionState,
    accessKeyConfigured: runtime.accessKeyConfigured,
    accessKeyExposed: false,
    plannedTransport: transport.plannedTransport,
    plannedDirection: transport.plannedDirection,
    plannedWsPath: transport.plannedWsPath,
    expectedAgentId: runtime.expectedAgentId,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION,
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
    heartbeatReceiverEnabled: false,
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
