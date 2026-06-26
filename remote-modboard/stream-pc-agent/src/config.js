'use strict';

const DEFAULTS = Object.freeze({
  wsUrl: 'wss://mods.forrestcgn.de/agent-ws',
  agentId: 'stream-pc-main',
  agentName: 'Forrest Stream-PC',
  agentVersion: 'rdap96-heartbeat-only',
  heartbeatIntervalMs: 30000,
  reconnectBackoffMs: [2000, 5000, 10000, 30000]
});

function loadConfig(env = process.env) {
  const wsUrl = readString(env, 'SCC_AGENT_WS_URL', DEFAULTS.wsUrl);
  const parsedUrl = parseWsUrl(wsUrl);
  const agentId = readSafeToken(env, 'SCC_AGENT_ID', DEFAULTS.agentId);
  const agentName = readSafeLabel(env, 'SCC_AGENT_NAME', DEFAULTS.agentName);
  const agentVersion = readSafeToken(env, 'SCC_AGENT_VERSION', DEFAULTS.agentVersion);
  const accessKey = readSecret(env, 'SCC_AGENT_ACCESS_KEY');
  const heartbeatIntervalMs = readInt(env, 'SCC_AGENT_HEARTBEAT_INTERVAL_MS', DEFAULTS.heartbeatIntervalMs, 5000, 300000);

  const errors = [];
  if (!accessKey) errors.push('missing_scc_agent_access_key');
  if (!parsedUrl.ok) errors.push(parsedUrl.reason);

  return {
    ok: errors.length === 0,
    errors,
    wsUrl,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    agentId,
    agentName,
    agentVersion,
    accessKey,
    heartbeatIntervalMs,
    reconnectBackoffMs: DEFAULTS.reconnectBackoffMs.slice(),
    logSafeSummary: {
      wsProtocol: parsedUrl.protocol || 'unknown',
      wsHostConfigured: Boolean(parsedUrl.hostname),
      wsPath: parsedUrl.path || '/agent-ws',
      agentId,
      agentName,
      agentVersion,
      accessKeyConfigured: Boolean(accessKey),
      heartbeatIntervalMs
    }
  };
}

function parseWsUrl(value) {
  try {
    const parsed = new URL(value);
    if (!['ws:', 'wss:'].includes(parsed.protocol)) {
      return { ok: false, reason: 'unsupported_ws_protocol' };
    }

    return {
      ok: true,
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port ? Number.parseInt(parsed.port, 10) : (parsed.protocol === 'wss:' ? 443 : 80),
      path: `${parsed.pathname || '/agent-ws'}${parsed.search || ''}`
    };
  } catch (err) {
    return { ok: false, reason: 'invalid_ws_url' };
  }
}

function readString(env, name, fallback) {
  const value = env[name];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function readSecret(env, name) {
  const value = env[name];
  if (typeof value !== 'string') return '';
  return value.trim();
}

function readSafeToken(env, name, fallback) {
  const raw = readString(env, name, fallback);
  const cleaned = raw.replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, 80);
  return cleaned || fallback;
}

function readSafeLabel(env, name, fallback) {
  const raw = readString(env, name, fallback);
  const cleaned = raw.replace(/[^a-zA-Z0-9 ._:-]/g, '').slice(0, 80).trim();
  return cleaned || fallback;
}

function readInt(env, name, fallback, min, max) {
  const value = Number.parseInt(env[name], 10);
  if (!Number.isInteger(value)) return fallback;
  if (value < min || value > max) return fallback;
  return value;
}

module.exports = {
  DEFAULTS,
  loadConfig,
  parseWsUrl
};
