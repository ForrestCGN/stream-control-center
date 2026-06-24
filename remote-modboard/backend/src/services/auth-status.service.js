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

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap_auth1.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: Boolean(context.config.auth && context.config.auth.authEnabled),
    loginEnabled: Boolean(context.config.auth && context.config.auth.loginEnabled),
    sessionCreationEnabled: Boolean(context.config.auth && context.config.auth.sessionCreationEnabled),
    loggedIn: Boolean(sessionValidation.valid && user),
    user,
    identity: null,
    roles: permissionContext ? permissionContext.roles : [],
    groups: permissionContext ? permissionContext.groups : [],
    permissions: [],
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
      'AUTH1 aktiviert nur Login/Session, wenn die Env-Gates aktiv sind.',
      'Remote-Writes, Agent-Actions und Stream-Steuerungen bleiben deaktiviert.',
      'Produktive Rechte muessen spaeter serverseitig erzwungen werden.'
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
    statusApiVersion: 'rdap_auth1.v1',
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
      'AUTH1 liest dashboard_sessions per SELECT zur Session-Erkennung.',
      'last_seen_at wird in AUTH1 nicht aktualisiert.',
      'Session-Cookie-Werte werden nicht ausgegeben; nur ein kurzer SHA-256-Fingerprint wird angezeigt.'
    ]
  };
}

module.exports = {
  buildMeStatus,
  buildSessionStatus,
  inspectSessionCookie
};
