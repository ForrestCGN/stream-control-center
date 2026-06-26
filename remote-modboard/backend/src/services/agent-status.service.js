'use strict';

const os = require('os');
const { buildRejectDiagnosticSummary } = require('./agent-runtime-disabled.service');

const MODULE = 'remote_agent_status';
const MODULE_BUILD = 'RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED';
const STATUS_API_VERSION = 'rdap_agent85.v1';
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
  persistsHeartbeatToDatabase: false
});

function buildAgentStatusSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();

  return {
    enabled: false,
    connected: false,
    connectionState: 'offline',
    actionsEnabled: false,
    productiveAgentRuntime: false,
    runtimeSkeletonPrepared: runtime.skeletonPrepared,
    runtimeRequestedEnabled: runtime.requestedEnabled,
    runtimeEffectiveEnabled: false,
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
    lastHeartbeatAt: null,
    heartbeatAgeMs: null,
    stale: false,
    handshakePrecheckPrepared: rejectDiagnostic.handshakePrecheckPrepared,
    handshakePrecheckAcceptsConnections: false,
    rejectDiagnosticPrepared: rejectDiagnostic.prepared,
    rejectDiagnosticInMemoryOnly: rejectDiagnostic.inMemoryOnly,
    rejectCount: rejectDiagnostic.rejectCount,
    lastRejectAt: rejectDiagnostic.lastRejectAt,
    lastRejectReason: rejectDiagnostic.lastRejectReason,
    lastRejectHasAgentIdHeader: rejectDiagnostic.lastRejectHasAgentIdHeader,
    lastRejectHasProtocolHeader: rejectDiagnostic.lastRejectHasProtocolHeader,
    lastRejectAgentIdHint: rejectDiagnostic.lastRejectAgentIdHint,
    lastRejectProtocolHint: rejectDiagnostic.lastRejectProtocolHint,
    rejectSecretsExposed: false,
    statusApiVersion: STATUS_API_VERSION
  };
}

function buildAgentStatusResponse(context = {}) {
  const now = new Date().toISOString();
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();

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
      enabled: false,
      connected: false,
      connectionState: 'offline',
      reason: 'rdap85_handshake_precheck_disabled_reject_only',
      lastHeartbeatAt: null,
      connectedSince: null,
      heartbeatAgeMs: null,
      reconnectCount: 0,
      stale: false,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      agentId: null,
      agentName: null,
      agentVersion: null,
      protocolVersion: STATUS_API_VERSION,
      expectedAgentId: runtime.expectedAgentId,
      expectedAgentName: runtime.expectedAgentName,
      expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION
    },
    runtime: {
      skeletonPrepared: runtime.skeletonPrepared,
      requestedEnabled: runtime.requestedEnabled,
      effectiveEnabled: false,
      wssRuntimeEnabled: false,
      heartbeatReceiverEnabled: false,
      accessKeyConfigured: runtime.accessKeyConfigured,
      accessKeyExposed: false,
      accessKeyLogged: false,
      defaultDisabled: true,
      upgradeGuardPrepared: true,
      handshakePrecheckPrepared: true,
      handshakePrecheckAcceptsConnections: false,
      acceptsAgentConnections: false
    },
    rejectDiagnostic,
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
      'RDAP85 liefert nur einen disabled Handshake-Precheck fuer abgelehnte /agent-ws Verbindungsversuche.',
      'WSS/Upgrade-Guard nimmt weiterhin keine produktive Agent-Verbindung an.',
      'OBS, Sounds, Overlays, Commands, Shell, Datei-, Prozess- und URL-Ausfuehrung bleiben deaktiviert.',
      'Geheime Zugangswerte, Header, Cookies, Query-Werte und rohe IP-Adressen werden nicht in Status, UI oder Logs ausgegeben.'
    ],
    errors: []
  };
}

function buildAgentRoutesSummary(context = {}) {
  const runtime = buildRuntimeConfigSummary(context.config);
  const transport = buildTransportSummary(runtime);
  const rejectDiagnostic = buildRejectDiagnosticSummary();

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
    runtimeEffectiveEnabled: false,
    heartbeatFoundationPrepared: true,
    heartbeatReceiverEnabled: false,
    wssRuntimeEnabled: false,
    upgradeGuardPrepared: true,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: false,
    acceptsAgentConnections: false,
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
    rejectSecretsExposed: false,
    noAgentActions: true,
    safety: { ...SAFETY }
  };
}

function buildRuntimeConfigSummary(config = {}) {
  const runtime = config && config.agent && config.agent.runtime ? config.agent.runtime : {};
  return {
    skeletonPrepared: runtime.skeletonPrepared === true || true,
    requestedEnabled: runtime.requestedEnabled === true,
    effectiveEnabled: false,
    wssRuntimeEnabled: false,
    heartbeatReceiverEnabled: false,
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
  MODULE,
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildAgentStatusSummary,
  buildAgentStatusResponse,
  buildAgentRoutesSummary,
  buildRuntimeConfigSummary
};
