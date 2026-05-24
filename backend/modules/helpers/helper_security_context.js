'use strict';

/**
 * STEP278C - Security Context helper core.
 *
 * This helper does not enforce permissions in production routes yet.
 * It prepares a normalized security/audit context for later API, dashboard,
 * Streamer.bot, overlay, module and Communication Bus integrations.
 */

const net = require('net');
const core = require('./helper_core');

const DEFAULT_CONFIG = {
  enabled: true,
  defaultTrustLevel: 'unknown',
  allowLocalhostWithoutAuth: true,
  trustedNetworks: [
    '127.0.0.1/32',
    '::1/128',
    '192.168.0.0/16',
    '10.0.0.0/8',
    '172.16.0.0/12'
  ],
  actorDefaults: {
    local: {
      id: 'localhost',
      name: 'Localhost',
      roles: ['system_local'],
      permissions: []
    },
    module: {
      id: 'module',
      name: 'Internal Module',
      roles: ['module'],
      permissions: []
    },
    streamerbot: {
      id: 'streamerbot',
      name: 'Streamer.bot',
      roles: ['streamerbot'],
      permissions: []
    },
    overlay: {
      id: 'overlay',
      name: 'Overlay',
      roles: ['overlay'],
      permissions: []
    },
    dashboard: {
      id: 'dashboard',
      name: 'Dashboard',
      roles: ['dashboard_user'],
      permissions: []
    },
    external: {
      id: 'external',
      name: 'External',
      roles: ['external', 'anonymous'],
      permissions: []
    },
    anonymous: {
      id: 'anonymous',
      name: 'Anonymous',
      roles: ['anonymous'],
      permissions: []
    }
  },
  rolePermissions: {
    system: ['*'],
    system_local: ['system.local', 'api.local', 'bus.local'],
    module: ['module.emit', 'bus.emit'],
    streamerbot: ['streamerbot.trigger', 'api.local'],
    overlay: ['overlay.ack', 'overlay.heartbeat'],
    dashboard_owner: ['*'],
    dashboard_admin: ['dashboard.read', 'dashboard.write', 'api.read', 'api.write'],
    dashboard_mod: ['dashboard.read', 'api.read'],
    dashboard_user: ['dashboard.read'],
    external: [],
    anonymous: []
  },
  sensitiveKeys: [
    'token',
    'access_token',
    'refresh_token',
    'authorization',
    'auth',
    'password',
    'passwd',
    'secret',
    'client_secret',
    'api_key',
    'apikey',
    'webhook',
    'cookie',
    'set-cookie',
    'session',
    'bearer'
  ],
  maskValue: '***masked***',
  audit: {
    mayLogPayloadByDefault: false,
    maxStringLength: 500,
    maxArrayLength: 50,
    maxDepth: 6
  }
};

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = clone(item);
    return out;
  }
  return value;
}

function deepMerge(base, override) {
  const result = clone(base || {});
  if (!isPlainObject(override)) return result;
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = clone(value);
    }
  }
  return result;
}

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function uniqueStrings(values) {
  const set = new Set();
  for (const value of Array.isArray(values) ? values : [values]) {
    const clean = cleanString(value);
    if (clean) set.add(clean);
  }
  return [...set];
}

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value ?? null));
  } catch (_) {
    return null;
  }
}

function stripPort(ip) {
  let value = cleanString(ip);
  if (!value) return '';

  if (value.startsWith('::ffff:')) value = value.slice(7);
  if (value.startsWith('[') && value.includes(']')) value = value.slice(1, value.indexOf(']'));

  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount === 1 && value.includes('.')) {
    const parts = value.split(':');
    if (parts[0]) value = parts[0];
  }

  return value;
}

function normalizeIp(ip) {
  const value = stripPort(ip);
  if (!value) return '';
  if (value === 'localhost') return '127.0.0.1';
  return value;
}

function isLocalIp(ip) {
  const value = normalizeIp(ip);
  return value === '127.0.0.1' || value === '::1' || value === '0:0:0:0:0:0:0:1';
}

function ipv4ToInt(ip) {
  const parts = String(ip || '').split('.').map(n => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function ipv4CidrMatch(ip, cidr) {
  const [range, bitsRaw] = String(cidr || '').split('/');
  const bits = Number.parseInt(bitsRaw, 10);
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

function matchesTrustedNetwork(ip, trustedNetworks = []) {
  const value = normalizeIp(ip);
  if (!value) return false;
  if (isLocalIp(value)) return true;

  for (const network of trustedNetworks || []) {
    const entry = cleanString(network);
    if (!entry) continue;

    if (entry === value) return true;
    if (entry === 'localhost' && isLocalIp(value)) return true;
    if (entry.includes('/') && value.includes('.') && ipv4CidrMatch(value, entry)) return true;

    if (entry === '::1/128' && value === '::1') return true;
  }

  return false;
}

function getRequestIp(req) {
  if (!req) return '';

  const headers = req.headers || {};
  const forwarded = cleanString(headers['x-forwarded-for'] || headers['X-Forwarded-For']);
  if (forwarded) return normalizeIp(forwarded.split(',')[0]);

  return normalizeIp(
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.info?.remoteAddress ||
    ''
  );
}

function getUserAgent(req) {
  if (!req || !req.headers) return '';
  return cleanString(req.headers['user-agent'] || req.headers['User-Agent']);
}

function inferActorType(input = {}, source = {}, trust = {}) {
  const explicitType = cleanString(input.actor?.type || input.actorType || input.type);
  if (explicitType) return explicitType;

  const kind = cleanString(source.kind);
  if (kind === 'dashboard') return 'dashboard';
  if (kind === 'overlay') return 'overlay';
  if (kind === 'streamerbot') return 'streamerbot';
  if (kind === 'module' || kind === 'bus') return 'module';

  if (trust.isLocal) return 'local';
  if (trust.isExternal) return 'external';
  return 'anonymous';
}

function buildPermissions(roles, config) {
  const permissions = new Set();
  for (const role of roles || []) {
    const rolePerms = config.rolePermissions && config.rolePermissions[role];
    for (const permission of Array.isArray(rolePerms) ? rolePerms : []) permissions.add(permission);
  }
  return [...permissions];
}

function normalizeActor(input = {}, source = {}, trust = {}, config = DEFAULT_CONFIG) {
  const actorInput = isPlainObject(input.actor) ? input.actor : {};
  const actorType = inferActorType(input, source, trust);
  const defaults = (config.actorDefaults && config.actorDefaults[actorType]) || config.actorDefaults.anonymous || {};
  const roles = uniqueStrings([
    ...(Array.isArray(defaults.roles) ? defaults.roles : []),
    ...(Array.isArray(actorInput.roles) ? actorInput.roles : []),
    ...(Array.isArray(input.roles) ? input.roles : [])
  ]);
  const defaultPermissions = buildPermissions(roles, config);
  const permissions = uniqueStrings([
    ...defaultPermissions,
    ...(Array.isArray(defaults.permissions) ? defaults.permissions : []),
    ...(Array.isArray(actorInput.permissions) ? actorInput.permissions : []),
    ...(Array.isArray(input.permissions) ? input.permissions : [])
  ]);

  return {
    type: actorType,
    id: cleanString(actorInput.id || input.actorId || defaults.id, defaults.id || actorType),
    name: cleanString(actorInput.name || input.actorName || defaults.name, defaults.name || actorType),
    roles,
    permissions,
    meta: isPlainObject(actorInput.meta) ? safeJson(actorInput.meta) || {} : {}
  };
}

function normalizeSource(input = {}, config = DEFAULT_CONFIG) {
  const sourceInput = isPlainObject(input.source) ? input.source : {};
  return {
    kind: cleanString(sourceInput.kind || input.kind || input.sourceKind || 'unknown'),
    module: cleanString(sourceInput.module || input.module || ''),
    route: cleanString(sourceInput.route || input.route || ''),
    method: cleanString(sourceInput.method || input.method || ''),
    ip: normalizeIp(sourceInput.ip || input.ip || ''),
    userAgent: cleanString(sourceInput.userAgent || input.userAgent || ''),
    clientId: cleanString(sourceInput.clientId || input.clientId || ''),
    eventId: cleanString(sourceInput.eventId || input.eventId || '')
  };
}

function buildTrust(source = {}, config = DEFAULT_CONFIG) {
  const ip = normalizeIp(source.ip);
  const isLocal = isLocalIp(ip);
  const isTrustedNetwork = matchesTrustedNetwork(ip, config.trustedNetworks);
  const isExternal = !!ip && !isLocal && !isTrustedNetwork;
  let level = cleanString(config.defaultTrustLevel, 'unknown');

  if (isLocal) level = 'local';
  else if (isTrustedNetwork) level = 'trusted_network';
  else if (isExternal) level = 'external';

  return {
    level,
    isLocal,
    isTrustedNetwork,
    isExternal,
    ip
  };
}

function createSecurityContext(input = {}, options = {}) {
  const config = deepMerge(DEFAULT_CONFIG, options.config || {});
  const raw = isPlainObject(input) ? input : {};
  const source = normalizeSource(raw, config);
  const trust = buildTrust(source, config);
  const actor = normalizeActor(raw, source, trust, config);

  const safeActorLabel = `${actor.type}:${actor.name || actor.id}`;
  const safeSourceLabel = [source.kind, source.module || source.route || source.clientId || source.ip || 'unknown']
    .filter(Boolean)
    .join(':');

  return {
    ok: true,
    createdAt: nowIso(),
    actor,
    source,
    trust,
    audit: {
      safeActorLabel,
      safeSourceLabel,
      mayLogPayload: options.mayLogPayload === true || config.audit.mayLogPayloadByDefault === true
    }
  };
}

function contextFromExpressRequest(req, moduleName = '', options = {}) {
  const routePath = cleanString(req?.originalUrl || req?.url || req?.path || '');
  const method = cleanString(req?.method || '');
  const ip = getRequestIp(req);
  return createSecurityContext({
    kind: 'api',
    module: moduleName,
    route: routePath,
    method,
    ip,
    userAgent: getUserAgent(req),
    actor: options.actor || {}
  }, options);
}

function contextFromBusMessage(message = {}, options = {}) {
  const source = isPlainObject(message.source) ? message.source : {};
  return createSecurityContext({
    kind: 'bus',
    module: source.module || source.id || message.channel || '',
    eventId: message.id || message.eventId || '',
    actor: {
      type: source.type || 'module',
      id: source.id || source.module || 'bus_source',
      name: source.name || source.id || source.module || 'Bus Source',
      roles: source.type === 'overlay' ? ['overlay'] : ['module']
    }
  }, options);
}

function contextFromClientInfo(clientInfo = {}, options = {}) {
  const client = isPlainObject(clientInfo) ? clientInfo : {};
  return createSecurityContext({
    kind: client.type || 'client',
    module: client.module || '',
    clientId: client.id || client.clientId || '',
    actor: {
      type: client.type || 'unknown',
      id: client.id || client.clientId || '',
      name: client.name || client.id || client.clientId || '',
      roles: client.type ? [client.type] : []
    }
  }, options);
}

function hasRole(context, role) {
  const wanted = cleanString(role);
  if (!wanted || !context || !context.actor) return false;
  return (context.actor.roles || []).includes(wanted);
}

function hasPermission(context, permission) {
  const wanted = cleanString(permission);
  if (!wanted || !context || !context.actor) return false;
  const permissions = context.actor.permissions || [];
  return permissions.includes('*') || permissions.includes(wanted);
}

function requirePermission(context, permission) {
  if (hasPermission(context, permission)) {
    return { ok: true, permission, actor: context.actor };
  }

  return {
    ok: false,
    error: 'permission_denied',
    permission: cleanString(permission),
    actor: context && context.actor ? {
      type: context.actor.type,
      id: context.actor.id,
      name: context.actor.name,
      roles: [...(context.actor.roles || [])]
    } : null
  };
}

function isSensitiveKey(key, config = DEFAULT_CONFIG) {
  const clean = cleanString(key).toLowerCase();
  if (!clean) return false;
  return (config.sensitiveKeys || []).some(pattern => clean.includes(String(pattern).toLowerCase()));
}

function maskSensitive(value, options = {}) {
  const config = deepMerge(DEFAULT_CONFIG, options.config || {});
  const maxDepth = Number(options.maxDepth ?? config.audit.maxDepth ?? 6);
  const maxArrayLength = Number(options.maxArrayLength ?? config.audit.maxArrayLength ?? 50);
  const maxStringLength = Number(options.maxStringLength ?? config.audit.maxStringLength ?? 500);
  const maskValue = cleanString(options.maskValue, config.maskValue || '***masked***');

  function maskInner(input, depth, parentKey = '') {
    if (isSensitiveKey(parentKey, config)) return maskValue;
    if (depth > maxDepth) return '[max_depth]';

    if (input === null || input === undefined) return input;

    if (typeof input === 'string') {
      if (input.length > maxStringLength) return `${input.slice(0, maxStringLength)}…[truncated]`;
      return input;
    }

    if (typeof input !== 'object') return input;

    if (Array.isArray(input)) {
      return input.slice(0, maxArrayLength).map(item => maskInner(item, depth + 1, parentKey));
    }

    const out = {};
    for (const [key, item] of Object.entries(input)) {
      out[key] = isSensitiveKey(key, config) ? maskValue : maskInner(item, depth + 1, key);
    }
    return out;
  }

  return maskInner(value, 0, '');
}

function toAuditSnapshot(context, payload = undefined, options = {}) {
  const config = deepMerge(DEFAULT_CONFIG, options.config || {});
  const mayLogPayload = options.mayLogPayload === true || context?.audit?.mayLogPayload === true;

  return {
    at: nowIso(),
    actor: context && context.actor ? {
      type: context.actor.type,
      id: context.actor.id,
      name: context.actor.name,
      roles: [...(context.actor.roles || [])]
    } : null,
    source: context && context.source ? {
      kind: context.source.kind,
      module: context.source.module,
      route: context.source.route,
      method: context.source.method,
      ip: context.source.ip,
      clientId: context.source.clientId,
      eventId: context.source.eventId
    } : null,
    trust: context && context.trust ? { ...context.trust } : null,
    labels: context && context.audit ? {
      actor: context.audit.safeActorLabel,
      source: context.audit.safeSourceLabel
    } : {},
    payload: mayLogPayload ? maskSensitive(payload, { config }) : undefined,
    payloadLogged: mayLogPayload
  };
}

module.exports = {
  DEFAULT_CONFIG,
  createSecurityContext,
  contextFromExpressRequest,
  contextFromBusMessage,
  contextFromClientInfo,
  hasRole,
  hasPermission,
  requirePermission,
  maskSensitive,
  toAuditSnapshot,
  normalizeIp,
  isLocalIp,
  matchesTrustedNetwork
};
