'use strict';

const crypto = require('crypto');
const core = require('./helper_core');
const config = require('./helper_config');

const DEFAULT_SECURITY_CONFIG = {
  enabled: true,
  allowLocalhostWithoutAuth: true,
  allowConfiguredNetworksWithoutAuth: true,
  allowAllPrivateNetworksWithoutAuth: false,
  allowedNetworks: ['127.0.0.1', '::1', '192.168.16.0/24'],
  requireAuthForExternal: true,
  blockExternalWithoutAuth: true,
  trustedProxyHeaders: false,
  authParamNames: ['auth', 'key', 'apiKey', 'token'],
  authHeaderNames: ['x-api-key', 'x-auth-token'],
  envAuthNames: ['API_AUTH', 'API_KEY', 'DISCORD_API_KEY', 'LOCAL_API_KEY']
};

function getSecurityConfigPath() {
  return config.resolveFromConfig('security.json');
}

function cleanStringList(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  return value.map(String).map(v => v.trim()).filter(Boolean);
}

function mergeConfig(fileConfig) {
  const cfg = { ...DEFAULT_SECURITY_CONFIG, ...(fileConfig || {}) };
  cfg.allowedNetworks = cleanStringList(cfg.allowedNetworks, DEFAULT_SECURITY_CONFIG.allowedNetworks);
  cfg.authParamNames = cleanStringList(cfg.authParamNames, DEFAULT_SECURITY_CONFIG.authParamNames);
  cfg.authHeaderNames = cleanStringList(cfg.authHeaderNames, DEFAULT_SECURITY_CONFIG.authHeaderNames).map(v => v.toLowerCase());
  cfg.envAuthNames = cleanStringList(cfg.envAuthNames, DEFAULT_SECURITY_CONFIG.envAuthNames);
  cfg.authTokens = cleanStringList(cfg.authTokens, []);
  return cfg;
}

function loadSecurityConfig() {
  return mergeConfig(core.readJson(getSecurityConfigPath(), null));
}

function ensureSecurityConfig() {
  const filePath = getSecurityConfigPath();
  if (!core.fileExists(filePath)) core.writeJson(filePath, DEFAULT_SECURITY_CONFIG, { spaces: 2 });
  return loadSecurityConfig();
}

function stripPort(ip) {
  const value = String(ip || '').trim();
  if (!value) return '';
  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    if (end >= 0) return value.slice(1, end);
  }
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(value)) return value.replace(/:\d+$/, '');
  return value;
}

function normalizeIp(ip) {
  let value = stripPort(ip);
  if (!value) return '';
  if (value.startsWith('::ffff:')) value = value.slice(7);
  if (value === 'localhost') return '127.0.0.1';
  if (value === '0:0:0:0:0:0:0:1') return '::1';
  return value;
}

function getHeader(req, name) {
  if (!req || !name) return '';
  if (typeof req.get === 'function') return req.get(name) || '';
  if (req.headers) return req.headers[String(name).toLowerCase()] || '';
  return '';
}

function getClientIp(req, cfg = loadSecurityConfig()) {
  if (!req) return '';
  if (cfg.trustedProxyHeaders) {
    const forwarded = String(getHeader(req, 'x-forwarded-for') || '').split(',')[0].trim();
    if (forwarded) return normalizeIp(forwarded);
    const realIp = getHeader(req, 'x-real-ip');
    if (realIp) return normalizeIp(realIp);
  }
  return normalizeIp(req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || '');
}

function isLocalhostIp(ip) {
  const value = normalizeIp(ip);
  return value === '127.0.0.1' || value === '::1';
}

function isValidIpv4(ip) {
  const parts = String(ip || '').split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function ipv4ToInt(ip) {
  if (!isValidIpv4(ip)) return null;
  return String(ip).split('.').reduce((acc, part) => ((acc << 8) + Number(part)) >>> 0, 0) >>> 0;
}

function ipv4InCidr(ip, cidr) {
  const [network, bitsRaw] = String(cidr || '').split('/');
  const bits = Number(bitsRaw);
  if (!isValidIpv4(ip) || !isValidIpv4(network) || !Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(network) & mask);
}

function isPrivateIpv4(ip) {
  return ipv4InCidr(ip, '10.0.0.0/8') || ipv4InCidr(ip, '172.16.0.0/12') || ipv4InCidr(ip, '192.168.0.0/16');
}

function networkMatchesIp(ip, network) {
  const cleanIp = normalizeIp(ip);
  const cleanNetwork = String(network || '').trim();
  if (!cleanIp || !cleanNetwork) return false;
  if (cleanNetwork.includes('/')) return ipv4InCidr(cleanIp, cleanNetwork);
  return normalizeIp(cleanNetwork) === cleanIp;
}

function isAllowedNetworkIp(ip, cfg = loadSecurityConfig()) {
  const cleanIp = normalizeIp(ip);
  if (!cleanIp) return false;
  if (cfg.allowLocalhostWithoutAuth && isLocalhostIp(cleanIp)) return true;
  if (cfg.allowConfiguredNetworksWithoutAuth) {
    for (const network of cfg.allowedNetworks || []) {
      if (networkMatchesIp(cleanIp, network)) return true;
    }
  }
  if (cfg.allowAllPrivateNetworksWithoutAuth && isPrivateIpv4(cleanIp)) return true;
  return false;
}

function isAllowedLocalRequest(req, cfg = loadSecurityConfig()) {
  return isAllowedNetworkIp(getClientIp(req, cfg), cfg);
}

function getAuthFromRequest(req, cfg = loadSecurityConfig()) {
  if (!req) return '';
  for (const name of cfg.authParamNames || []) {
    const value = core.getParam(req, name, '');
    if (value) return String(value).trim();
  }
  for (const name of cfg.authHeaderNames || []) {
    const value = getHeader(req, name);
    if (value) return String(value).trim();
  }
  const authorization = getHeader(req, 'authorization');
  const match = String(authorization || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function getConfiguredAuthTokens(cfg = loadSecurityConfig()) {
  const tokens = [];
  for (const token of cfg.authTokens || []) if (token && !tokens.includes(token)) tokens.push(token);
  for (const envName of cfg.envAuthNames || []) {
    const value = config.getEnv(envName, '');
    if (value && !tokens.includes(value)) tokens.push(value);
  }
  return tokens;
}

function safeEquals(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function hasValidAuth(req, cfg = loadSecurityConfig()) {
  const provided = getAuthFromRequest(req, cfg);
  if (!provided) return false;
  return getConfiguredAuthTokens(cfg).some(token => safeEquals(provided, token));
}

function canAccess(req, options = {}) {
  const cfg = options.config || loadSecurityConfig();
  const clientIp = getClientIp(req, cfg);
  const localAllowed = isAllowedNetworkIp(clientIp, cfg);
  const authAllowed = hasValidAuth(req, cfg);
  if (!cfg.enabled) return { allowed: true, reason: 'security_disabled', clientIp, localAllowed, authAllowed };
  if (localAllowed) return { allowed: true, reason: 'local_or_trusted_network', clientIp, localAllowed, authAllowed };
  if (authAllowed) return { allowed: true, reason: 'valid_auth', clientIp, localAllowed, authAllowed };
  return { allowed: false, reason: 'forbidden', clientIp, localAllowed, authAllowed };
}

function deny(res, result, statusCode = 403) {
  return core.sendFail(res, 'Zugriff verweigert', statusCode, {
    reason: result && result.reason ? result.reason : 'forbidden',
    clientIp: result && result.clientIp ? result.clientIp : ''
  });
}

function requireLocalOrAuth(options = {}) {
  return function securityMiddleware(req, res, next) {
    const result = canAccess(req, options);
    if (result.allowed) return next();
    return deny(res, result, 403);
  };
}

function securitySummary(req = null) {
  const cfg = loadSecurityConfig();
  const clientIp = req ? getClientIp(req, cfg) : '';
  return {
    enabled: !!cfg.enabled,
    allowLocalhostWithoutAuth: !!cfg.allowLocalhostWithoutAuth,
    allowConfiguredNetworksWithoutAuth: !!cfg.allowConfiguredNetworksWithoutAuth,
    allowAllPrivateNetworksWithoutAuth: !!cfg.allowAllPrivateNetworksWithoutAuth,
    allowedNetworks: cfg.allowedNetworks,
    requireAuthForExternal: !!cfg.requireAuthForExternal,
    blockExternalWithoutAuth: !!cfg.blockExternalWithoutAuth,
    trustedProxyHeaders: !!cfg.trustedProxyHeaders,
    configPath: getSecurityConfigPath(),
    clientIp,
    clientAllowed: req ? isAllowedLocalRequest(req, cfg) : null,
    hasConfiguredAuthTokens: getConfiguredAuthTokens(cfg).length > 0
  };
}

module.exports = {
  DEFAULT_SECURITY_CONFIG,
  getSecurityConfigPath,
  loadSecurityConfig,
  ensureSecurityConfig,
  normalizeIp,
  getClientIp,
  isLocalhostIp,
  isValidIpv4,
  ipv4ToInt,
  ipv4InCidr,
  isPrivateIpv4,
  networkMatchesIp,
  isAllowedNetworkIp,
  isAllowedLocalRequest,
  getAuthFromRequest,
  getConfiguredAuthTokens,
  hasValidAuth,
  canAccess,
  deny,
  requireLocalOrAuth,
  securitySummary
};
