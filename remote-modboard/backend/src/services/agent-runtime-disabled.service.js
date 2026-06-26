'use strict';

const MODULE = 'remote_agent_runtime_disabled';
const MODULE_BUILD = 'RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON';
const STATUS_API_VERSION = 'rdap_agent82.v1';

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

    rejectUpgrade(socket, {
      code: 503,
      reason: 'agent_runtime_disabled',
      message: 'Stream-PC connection runtime is disabled.'
    });
  });

  console.log(`[remote-agent-runtime] ${MODULE_BUILD} registered disabled upgrade guard for ${wsPath}. Runtime enabled=false, actions=false.`);

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
    accessKeyConfigured: runtime.accessKeyConfigured === true
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
    writeEnabled: false
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
    // Intentionally do not log request headers or connection secrets.
  } finally {
    if (socket && typeof socket.destroy === 'function') socket.destroy();
  }
}

function safeReason(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9_.:\-\s]/g, '')
    .slice(0, 160);
}

module.exports = {
  MODULE,
  MODULE_BUILD,
  STATUS_API_VERSION,
  registerAgentRuntimeDisabledSkeleton,
  getAgentRuntimeConfig,
  buildRegistrationSummary
};
