'use strict';

const crypto = require('crypto');

const MODULE = 'remote_agent_runtime_disabled';
const MODULE_BUILD = 'RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED';
const STATUS_API_VERSION = 'rdap_agent86.v1';
const EXPECTED_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';

const REJECT_DIAGNOSTIC = {
  prepared: true,
  enabled: true,
  inMemoryOnly: true,
  persistsToDatabase: false,
  handshakePrecheckPrepared: true,
  handshakePrecheckAcceptsConnections: false,
  accessKeyComparePrepared: true,
  accessKeyCompareAcceptsConnections: false,
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

function registerAgentRuntimeDisabledSkeleton(server, config = {}, options = {}) {
  const agentRuntime = getAgentRuntimeConfig(config);
  const wsPath = agentRuntime.wsPath || '/agent-ws';
  const moduleBuild = options.moduleBuild || MODULE_BUILD;

  if (!server || typeof server.on !== 'function') {
    return buildRegistrationSummary({
      registered: false,
      reason: 'http_server_missing',
      wsPath,
      moduleBuild
    });
  }

  server.on('upgrade', (req, socket) => {
    if (!isAgentWsPath(req, wsPath, config)) return;

    const precheck = evaluateHandshakePrecheck(req, agentRuntime);

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
      message: 'Stream-PC connection runtime is disabled.'
    });
  });

  console.log(`[remote-agent-runtime] ${MODULE_BUILD} registered disabled upgrade guard for ${wsPath}. Runtime enabled=false, actions=false, accessKeyCompare=disabled-reject-only.`);

  return buildRegistrationSummary({
    registered: true,
    reason: 'disabled_upgrade_guard_registered',
    wsPath,
    moduleBuild
  });
}

function getAgentRuntimeConfig(config = {}) {
  const runtime = config && config.agent && config.agent.runtime ? config.agent.runtime : {};
  return {
    skeletonPrepared: runtime.skeletonPrepared === true,
    requestedEnabled: runtime.requestedEnabled === true,
    effectiveEnabled: false,
    wssRuntimeEnabled: false,
    heartbeatReceiverEnabled: false,
    wsPath: runtime.wsPath || '/agent-ws',
    expectedAgentId: runtime.expectedAgentId || 'stream-pc-main',
    expectedAgentName: runtime.expectedAgentName || 'Forrest Stream-PC',
    accessKeyConfigured: runtime.accessKeyConfigured === true,
    expectedProtocolVersion: EXPECTED_PROTOCOL_VERSION
  };
}

function buildRegistrationSummary(input = {}) {
  return {
    ok: Boolean(input.registered),
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: input.moduleBuild || MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    registered: Boolean(input.registered),
    reason: input.reason || 'unknown',
    wsPath: input.wsPath || '/agent-ws',
    runtimeEnabled: false,
    wssRuntimeEnabled: false,
    heartbeatReceiverEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    noAgentActions: true,
    readOnly: true,
    writeEnabled: false,
    handshakePrecheckPrepared: true,
    handshakePrecheckAcceptsConnections: false,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: false,
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

  return buildPrecheckResult('runtime_not_effectively_enabled', {
    agentIdHint: safeAgentIdHint(agentId),
    protocolHint: safeProtocolHint(protocolVersion),
    accessKeyConfigured: true,
    connectionProofCompared: true
  });
}

function buildPrecheckResult(reason, details = {}) {
  return {
    reason,
    agentIdHint: details.agentIdHint || null,
    protocolHint: details.protocolHint || null,
    accessKeyConfigured: details.accessKeyConfigured === true,
    connectionProofCompared: details.connectionProofCompared === true
  };
}

function recordRejectDiagnostic(req, details = {}) {
  const safePath = extractSafePath(req, details.wsPath || '/agent-ws');

  REJECT_DIAGNOSTIC.rejectCount += 1;
  REJECT_DIAGNOSTIC.lastRejectAt = new Date().toISOString();
  REJECT_DIAGNOSTIC.lastRejectReason = safeReason(details.reason || 'agent_runtime_disabled');
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
    handshakePrecheckAcceptsConnections: false,
    accessKeyComparePrepared: true,
    accessKeyCompareAcceptsConnections: false,
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
      'agent_runtime_disabled',
      'malformed_upgrade_request',
      'invalid_agent_ws_path',
      'runtime_not_effectively_enabled',
      'missing_agent_id',
      'unknown_agent_id',
      'missing_connection_proof',
      'invalid_connection_proof',
      'protocol_version_unsupported',
      'access_key_not_configured'
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
    acceptsAgentConnections: false,
    actionEnabled: false,
    productiveAgentRuntime: false
  };
}

function rejectUpgrade(socket, details = {}) {
  const code = Number.isInteger(details.code) ? details.code : 503;
  const reason = safeReason(details.reason || 'agent_runtime_disabled');
  const message = safeReason(details.message || 'Stream-PC connection runtime is disabled.');

  try {
    if (socket && socket.writable) {
      socket.write([
        `HTTP/1.1 ${code} Service Unavailable`,
        'Connection: close',
        'Content-Type: text/plain; charset=utf-8',
        'Cache-Control: no-store',
        'X-Remote-Modboard-Agent-Runtime: disabled',
        '',
        `${message}\nreason=${reason}\n`
      ].join('\r\n'));
    }
  } catch (err) {
    // Intentionally do not log request headers, IP addresses, cookies or connection secrets.
  } finally {
    if (socket && typeof socket.destroy === 'function') socket.destroy();
  }
}

function readHeaderValue(req, headerName) {
  if (!req || !req.headers || typeof req.headers !== 'object') return '';
  const value = req.headers[headerName];
  if (Array.isArray(value)) return String(value[0] || '').trim();
  if (typeof value === 'string') return value.trim();
  return '';
}

function extractBearerToken(authorization) {
  const match = String(authorization || '').match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : '';
}

function getConfiguredAccessKey() {
  const raw = process.env.AGENT_ACCESS_KEY;
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  return trimmed || '';
}

function compareSecretSafely(candidate, expected) {
  const candidateValue = String(candidate || '');
  const expectedValue = String(expected || '');
  if (!candidateValue || !expectedValue) return false;

  const candidateDigest = crypto.createHash('sha256').update(candidateValue, 'utf8').digest();
  const expectedDigest = crypto.createHash('sha256').update(expectedValue, 'utf8').digest();

  return crypto.timingSafeEqual(candidateDigest, expectedDigest) && candidateValue.length === expectedValue.length;
}

function extractSafePath(req, fallback) {
  if (!req || typeof req.url !== 'string') return fallback || '/agent-ws';

  try {
    const parsed = new URL(req.url, 'https://mods.forrestcgn.de');
    return safeReason(parsed.pathname || fallback || '/agent-ws');
  } catch (err) {
    const rawPath = req.url.split('?')[0] || fallback || '/agent-ws';
    return safeReason(rawPath);
  }
}

function hasQueryString(req) {
  if (!req || typeof req.url !== 'string') return false;
  return req.url.includes('?');
}

function hasHeader(req, headerName) {
  if (!req || !req.headers || typeof req.headers !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(req.headers, headerName);
}

function safeMethod(value) {
  return String(value || 'GET')
    .replace(/[^A-Z]/g, '')
    .slice(0, 16) || 'GET';
}

function safeAgentIdHint(value) {
  const safe = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_.:\-]/g, '')
    .slice(0, 80);
  return safe || null;
}

function safeProtocolHint(value) {
  const safe = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_.:\-]/g, '')
    .slice(0, 80);
  return safe || null;
}

function safeUserAgentHint(req) {
  if (!req || !req.headers || typeof req.headers['user-agent'] !== 'string') return null;

  const raw = req.headers['user-agent'].trim();
  if (!raw) return null;

  const firstToken = raw.split(/[\s/;()]+/).filter(Boolean)[0] || '';
  const safe = firstToken
    .replace(/[^a-zA-Z0-9_.:\-]/g, '')
    .slice(0, 40);

  return safe || 'present';
}

function safeReason(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9_.:\-\s/]/g, '')
    .slice(0, 160);
}

module.exports = {
  MODULE,
  MODULE_BUILD,
  STATUS_API_VERSION,
  registerAgentRuntimeDisabledSkeleton,
  getAgentRuntimeConfig,
  buildRegistrationSummary,
  buildRejectDiagnosticSummary,
  evaluateHandshakePrecheck
};
