'use strict';

const os = require('os');

const MODULE = 'remote_agent_status';
const MODULE_BUILD = 'RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION';
const STATUS_API_VERSION = 'rdap_agent80.v1';
const LOADED_AT = new Date().toISOString();

const EXPECTED_AGENT = Object.freeze({
  agentId: 'stream-pc-main',
  agentName: 'Forrest Stream-PC'
});

const TRANSPORT = Object.freeze({
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

function buildAgentStatusSummary() {
  return {
    enabled: false,
    connected: false,
    connectionState: 'offline',
    actionsEnabled: false,
    productiveAgentRuntime: false,
    plannedTransport: TRANSPORT.plannedTransport,
    plannedDirection: TRANSPORT.plannedDirection,
    plannedWsPath: TRANSPORT.plannedWsPath,
    streamPcPublicPortRequired: TRANSPORT.streamPcPublicPortRequired,
    expectedAgentId: EXPECTED_AGENT.agentId,
    expectedAgentName: EXPECTED_AGENT.agentName,
    lastHeartbeatAt: null,
    heartbeatAgeMs: null,
    stale: false,
    statusApiVersion: STATUS_API_VERSION
  };
}

function buildAgentStatusResponse(context = {}) {
  const now = new Date().toISOString();
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
      reason: 'rdap80_no_agent_runtime_yet',
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
      expectedAgentId: EXPECTED_AGENT.agentId,
      expectedAgentName: EXPECTED_AGENT.agentName
    },
    heartbeat: { ...HEARTBEAT_MODEL },
    transport: { ...TRANSPORT },
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
      'RDAP80 liefert nur eine read-only Agent-Status-Foundation.',
      'Es existiert noch kein produktiver WSS-Agent-Runtime.',
      'OBS, Sounds, Overlays, Commands, Shell, Datei-, Prozess- und URL-Ausfuehrung bleiben deaktiviert.'
    ],
    errors: []
  };
}

function buildAgentRoutesSummary() {
  return {
    prepared: true,
    route: '/api/remote/agent/status',
    method: 'GET',
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    heartbeatFoundationPrepared: true,
    heartbeatReceiverEnabled: false,
    wssRuntimeEnabled: false,
    plannedTransport: TRANSPORT.plannedTransport,
    plannedDirection: TRANSPORT.plannedDirection,
    plannedWsPath: TRANSPORT.plannedWsPath,
    streamPcPublicPortRequired: false,
    noAgentActions: true,
    safety: { ...SAFETY }
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
  buildAgentRoutesSummary
};
