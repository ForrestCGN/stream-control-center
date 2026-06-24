'use strict';

const {
  validateSessionReadOnly,
  inspectSessionCookie
} = require('./auth-session-read.service');
const {
  readPermissionContextReadOnly
} = require('./auth-permission-read.service');

async function buildMeStatus({ context, req }) {
  const sessionValidation = await validateSessionReadOnly({ config: context.config, req });
  let permissionContext = null;

  if (sessionValidation.valid && sessionValidation.userUid) {
    try {
      permissionContext = await readPermissionContextReadOnly({
        config: context.config,
        userUid: sessionValidation.userUid,
        permissionKey: 'remote.view',
        targetType: 'global',
        targetKey: '*'
      });
    } catch (err) {
      permissionContext = null;
    }
  }

  const user = permissionContext && permissionContext.user && permissionContext.user.exists
    ? permissionContext.user
    : null;

  const access = buildDashboardAccess(context.config, user, sessionValidation);
  const roles = mergeRoles(permissionContext ? permissionContext.roles : [], access.roles);

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_dashboard2.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: Boolean(context.config.auth && context.config.auth.authEnabled),
    loginEnabled: Boolean(context.config.auth && context.config.auth.loginEnabled),
    sessionCreationEnabled: Boolean(context.config.auth && context.config.auth.sessionCreationEnabled),
    loggedIn: Boolean(sessionValidation.valid && user),
    dashboardAccess: access.allowed,
    accessReason: access.reason,
    user,
    identity: null,
    roles,
    groups: permissionContext ? permissionContext.groups : [],
    permissions: access.allowed ? ['remote.dashboard.view'] : [],
    session: {
      checked: true,
      cookiePresent: sessionValidation.cookiePresent,
      cookieNameDetected: sessionValidation.cookieNameDetected,
      cookieValuePresent: sessionValidation.cookieValuePresent,
      cookieValueFingerprint: sessionValidation.cookieValueFingerprint,
      sessionLookupEnabled: sessionValidation.lookupEnabled,
      sessionLookupPerformed: sessionValidation.lookupPerformed,
      sessionExists: sessionValidation.exists,
      sessionValid: sessionValidation.valid,
      expiresAt: sessionValidation.expiresAt,
      userUid: sessionValidation.userUid,
      reason: sessionValidation.reason,
      readOnlyValidation: true,
      createsSession: false,
      setsCookie: false,
      updatesLastSeen: false
    },
    warnings: [
      'DASHBOARD2 entscheidet Dashboard-Zugriff serverseitig anhand der Allowlist.',
      'Frontend zeigt nur an. Spaetere produktive Actions brauchen serverseitige Permission-Middleware.',
      'Remote-Writes, Agent-Actions und Stream-Steuerungen bleiben deaktiviert.'
    ]
  };
}

async function buildSessionStatus({ context, req }) {
  const sessionValidation = await validateSessionReadOnly({ config: context.config, req });
  const cookieState = inspectSessionCookie(req, context.config);

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_dashboard2.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: Boolean(context.config.auth && context.config.auth.authEnabled),
    loginEnabled: Boolean(context.config.auth && context.config.auth.loginEnabled),
    sessionCreationEnabled: Boolean(context.config.auth && context.config.auth.sessionCreationEnabled),
    session: {
      cookiePresent: sessionValidation.cookiePresent,
      cookieNameDetected: sessionValidation.cookieNameDetected,
      cookieValuePresent: sessionValidation.cookieValuePresent,
      cookieValueFingerprint: sessionValidation.cookieValueFingerprint,
      candidateCookieNames: cookieState.candidateNames,
      lookupEnabled: sessionValidation.lookupEnabled,
      lookupPerformed: sessionValidation.lookupPerformed,
      exists: sessionValidation.exists,
      valid: sessionValidation.valid,
      status: sessionValidation.status,
      expiresAt: sessionValidation.expiresAt,
      revokedAt: sessionValidation.revokedAt,
      lastSeenAt: sessionValidation.lastSeenAt,
      userId: sessionValidation.userUid,
      reason: sessionValidation.reason,
      database: sessionValidation.database,
      safety: sessionValidation.safety
    },
    notes: [
      'DASHBOARD2 liest dashboard_sessions per SELECT zur Session-Erkennung.',
      'last_seen_at wird weiterhin nicht aktualisiert.',
      'Session-Cookie-Werte werden nicht ausgegeben; nur ein kurzer SHA-256-Fingerprint wird angezeigt.'
    ]
  };
}

function buildDashboardAccess(config, user, sessionValidation) {
  if (!sessionValidation.valid || !user) {
    return {
      allowed: false,
      reason: 'not_logged_in',
      roles: []
    };
  }

  const login = String(user.loginName || '').trim().toLowerCase();
  const display = String(user.displayName || '').trim().toLowerCase();
  const userUid = String(user.userUid || '').trim().toLowerCase();
  const access = config.dashboardAccess || {};
  const allowedLogins = Array.isArray(access.allowedLogins) ? access.allowedLogins : [];
  const allowedUserUids = Array.isArray(access.allowedUserUids) ? access.allowedUserUids : [];

  if (allowedUserUids.includes(userUid)) {
    return {
      allowed: true,
      reason: 'allowed_user_uid',
      roles: [access.defaultRole || 'owner']
    };
  }

  if (allowedLogins.includes(login) || allowedLogins.includes(display)) {
    return {
      allowed: true,
      reason: 'allowed_login',
      roles: [access.defaultRole || 'owner']
    };
  }

  return {
    allowed: false,
    reason: 'not_allowed',
    roles: []
  };
}

function mergeRoles(existing, additional) {
  return [...new Set([
    ...(Array.isArray(existing) ? existing : []),
    ...(Array.isArray(additional) ? additional : [])
  ].filter(Boolean))];
}

module.exports = {
  buildMeStatus,
  buildSessionStatus,
  inspectSessionCookie
};
