'use strict';

const crypto = require('crypto');

const MODULE = 'remote_agent_runtime';
const MODULE_BUILD = 'RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS';
const STATUS_API_VERSION = 'rdap_agent92.v1';
const EXPECTED_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';
const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

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
  heartbeatReceiverEnabled: false
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
    return buildRegistrationSummary({
      registered: false,
      reason: 'http_server_missing',
      wsPath,
      moduleBuild,
      agentRuntime
    });
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

      rejectUpgrade(socket, {
        code: 503,
        reason: precheck.reason,
        message: 'Stream-PC connection rejected.'
      });
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

      rejectUpgrade(socket, {
        code: 503,
        reason: 'agent_already_connected',
        message: 'Stream-PC connection already active.'
      });
      return;
    }

    acceptUpgrade(req, socket, {
      agentRuntime,
      agentId: precheck.agentId,
      protocolVersion: precheck.protocolVersion
    });
  });

  console.log(`[remote-agent-runtime] ${moduleBuild} registered guarded transport runtime for ${wsPath}. accepts=${agentRuntime.acceptsAgentConnections}, actions=false, heartbeat=false.`);

  return buildRegistrationSummary({
    registered: true,
    reason: 'guarded_transport_runtime_registered',
    wsPath,
    moduleBuild,
    agentRuntime
  });
}

function getAgentRuntimeConfig(config = {}) {
  const runtime = config && config.agent && config.agent.runtime ? config.agent.runtime : {};
  const requestedEnabled = runtime.requestedEnabled === true;
  const acceptBuildEnabled = runtime.acceptBuildEnabled === true;
  const effectiveEnabled = requestedEnabled && acceptBuildEnabled;

  return {
    skeletonPrepared: runtime.skeletonPrepared === true,
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
    wsPath: runtime.wsPath || '/agent-ws',
    expectedAgentId: runtime.expectedAgentId || 'stream-pc-main',
    expectedAgentName: runtime.expectedAgentName || 'Forrest Stream-PC',
    accessKeyConfigured: runtime.accessKeyConfigured === true,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION
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
    heartbeatReceiverEnabled: false,
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
  if (!req || typeof req.url !== 'string') {
    return buildPrecheckResult('malformed_upgrade_request');
  }

  const expectedAgentId = agentRuntime.expectedAgentId || 'stream-pc-main';
  const expectedProtocolVersion = agentRuntime.expectedProtocolVersion || EXPECTED_PROTOCOL_VERSION;
  const agentId = readHeaderValue(req, 'x-scc-agent-id');
  const authorization = readHeaderValue(req, 'authorization');
  const protocolVersion = readHeaderValue(req, 'x-scc-agent-protocol');
  const accessKey = getConfiguredAccessKey();
  const accessKeyConfigured = agentRuntime.accessKeyConfigured === true && Boolean(accessKey);

  if (!agentId) {
    return buildPrecheckResult('missing_agent_id', {
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured
    });
  }

  if (agentId !== expectedAgentId) {
    return buildPrecheckResult('unknown_agent_id', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured
    });
  }

  if (!authorization) {
    return buildPrecheckResult('missing_connection_proof', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured
    });
  }

  const bearerToken = extractBearerToken(authorization);
  if (!bearerToken) {
    return buildPrecheckResult('invalid_connection_proof', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured
    });
  }

  if (protocolVersion !== expectedProtocolVersion) {
    return buildPrecheckResult('protocol_version_unsupported', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured
    });
  }

  if (!accessKeyConfigured) {
    return buildPrecheckResult('access_key_not_configured', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured: false
    });
  }

  const proofMatches = compareSecretSafely(bearerToken, accessKey);
  if (!proofMatches) {
    return buildPrecheckResult('invalid_connection_proof', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured: true,
      connectionProofCompared: true
    });
  }

  if (!agentRuntime.effectiveEnabled) {
    return buildPrecheckResult('runtime_not_effectively_enabled', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured: true,
      connectionProofCompared: true
    });
  }

  if (!hasValidWebSocketUpgrade(req)) {
    return buildPrecheckResult('invalid_websocket_upgrade', {
      agentIdHint: safeAgentIdHint(agentId),
      protocolHint: safeProtocolHint(protocolVersion),
      accessKeyConfigured: true,
      connectionProofCompared: true
    });
  }

  return buildPrecheckResult('ok', {
    agentId,
    protocolVersion,
    agentIdHint: safeAgentIdHint(agentId),
    protocolHint: safeProtocolHint(protocolVersion),
    accessKeyConfigured: true,
    connectionProofCompared: true
  });
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
  const accept = crypto
    .createHash('sha1')
    .update(`${key}${WEBSOCKET_GUID}`)
    .digest('base64');

  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    'X-SCC-Agent-Runtime: rdap92-transport-only',
    'X-SCC-Agent-Actions: disabled',
    '',
    ''
  ].join('\r\n'));

  activeSocket = socket;

  const now = new Date().toISOString();
  CONNECTION_STATE.connected = true;
  CONNECTION_STATE.connectionState = 'connected';
  CONNECTION_STATE.agentId = details.agentId || null;
  CONNECTION_STATE.agentName = details.agentRuntime && details.agentRuntime.expectedAgentName
    ? details.agentRuntime.expectedAgentName
    : 'Forrest Stream-PC';
  CONNECTION_STATE.agentVersion = safeHeaderHint(readHeaderValue(req, 'x-scc-agent-version'));
  CONNECTION_STATE.protocolVersion = details.protocolVersion || EXPECTED_PROTOCOL_VERSION;
  CONNECTION_STATE.connectedSince = now;
  CONNECTION_STATE.lastSeenAt = now;
  CONNECTION_STATE.closeReason = null;
  CONNECTION_STATE.reconnectCount += 1;
  CONNECTION_STATE.actionsEnabled = false;
  CONNECTION_STATE.productiveAgentRuntime = false;
  CONNECTION_STATE.heartbeatReceiverEnabled = false;

  socket.on('close', () => clearConnectionState('socket_close'));
  socket.on('end', () => clearConnectionState('socket_end'));
  socket.on('error', () => clearConnectionState('socket_error'));
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
      'local_absolute_paths'
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
    heartbeatReceiverEnabled: false,
    lastHeartbeatAt: null,
    heartbeatAgeMs: null,
    stale: false,
    actionsEnabled: false,
    productiveAgentRuntime: false,
    secretsExposed: false,
    bearerTokenLogged: false,
    tokenLengthLogged: false,
    tokenHashLogged: false
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

  return upgrade === 'websocket'
    && connection.includes('upgrade')
    && version === '13'
    && /^[A-Za-z0-9+/=]{20,60}$/.test(key);
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

  return candidateDigest.length === expectedDigest.length
    && crypto.timingSafeEqual(candidateDigest, expectedDigest);
}

function safeReason(reason) {
  const value = typeof reason === 'string' ? reason : 'unknown';
  return value.replace(/[^a-z0-9_.-]/gi, '_').slice(0, 80) || 'unknown';
}

function safeMethod(method) {
  const value = typeof method === 'string' ? method : 'GET';
  return value.replace(/[^A-Z]/g, '').slice(0, 12) || 'GET';
}

function safeHeaderText(value) {
  return String(value || '').replace(/[\r\n]/g, ' ').slice(0, 120);
}

function safeAgentIdHint(agentId) {
  return safeHeaderHint(agentId);
}

function safeProtocolHint(protocolVersion) {
  return safeHeaderHint(protocolVersion);
}

function safeUserAgentHint(req) {
  const value = readHeaderValue(req, 'user-agent');
  return safeHeaderHint(value);
}

function safeHeaderHint(value) {
  if (!value) return null;
  return String(value).replace(/[^a-z0-9_.:/ -]/gi, '_').slice(0, 80);
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  registerAgentRuntime,
  buildAgentConnectionSummary,
  buildRejectDiagnosticSummary
};
