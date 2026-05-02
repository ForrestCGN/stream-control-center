'use strict';

/**
 * Control-Center auth/permission helper foundation.
 * STEP004: vorbereitet, aber noch nicht als vollständiges Login-System aktiv.
 * Bestehende Projektfunktionen werden dadurch nicht verändert.
 */

const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function uniq(list) {
  return Array.from(new Set((list || []).filter(Boolean)));
}

function resolveRolePermissions(rolesConfig, roleName, seen = new Set()) {
  const roles = rolesConfig && rolesConfig.roles ? rolesConfig.roles : {};
  const role = roles[roleName];
  if (!role || seen.has(roleName)) return [];
  seen.add(roleName);
  const inherited = [];
  for (const parent of role.inherits || []) {
    inherited.push(...resolveRolePermissions(rolesConfig, parent, seen));
  }
  return uniq([...inherited, ...(role.permissions || [])]);
}

function hasPermission(rolesConfig, roleName, permission) {
  if (!permission) return true;
  const perms = resolveRolePermissions(rolesConfig, roleName);
  return perms.includes('owner.all') || perms.includes(permission);
}

function getClientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.socket?.remoteAddress || req.ip || '';
}

function normalizeIp(ip) {
  return String(ip || '').replace(/^::ffff:/, '');
}

function isLocalRequest(req) {
  const ip = normalizeIp(getClientIp(req));
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

function getDashboardRole(req) {
  // STEP004-Fallback: Bis ein echtes Login existiert, kann lokal per Header getestet werden.
  // Später ersetzen durch Session/JWT/Twitch-Login.
  return String(req.headers['x-cgn-dashboard-role'] || '').trim() || 'streamer';
}

function createDashboardAuth(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const configDir = options.configDir || path.resolve(rootDir, '..', 'config');
  const rolesPath = options.rolesPath || path.join(configDir, 'dashboard_roles.json');

  function loadRoles() {
    return readJsonSafe(rolesPath, { roles: {} });
  }

  function requirePermission(permission, opts = {}) {
    return (req, res, next) => {
      const rolesConfig = loadRoles();
      const role = getDashboardRole(req);
      const allowed = hasPermission(rolesConfig, role, permission);
      if (!allowed) return res.status(403).json({ ok:false, error:'dashboard_permission_denied', permission, role });
      if (opts.localOnly && !isLocalRequest(req)) return res.status(403).json({ ok:false, error:'dashboard_local_access_required', permission, role });
      return next();
    };
  }

  return {
    loadRoles,
    getDashboardRole,
    resolveRolePermissions: role => resolveRolePermissions(loadRoles(), role),
    hasPermission: (role, permission) => hasPermission(loadRoles(), role, permission),
    requirePermission,
    isLocalRequest
  };
}

module.exports = {
  createDashboardAuth,
  readJsonSafe,
  resolveRolePermissions,
  hasPermission,
  isLocalRequest,
  getClientIp
};
