'use strict';

const {
  validateSessionReadOnly,
  inspectSessionCookie
} = require('./auth-session-read.service');

async function buildMeStatus({ context, req }) {
  const sessionValidation = await validateSessionReadOnly({ config: context.config, req });

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap7i.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    loginEnabled: false,
    sessionCreationEnabled: false,
    loggedIn: false,
    user: null,
    identity: null,
    roles: [],
    groups: [],
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
      'RDAP7I ist read-only. Dieser Endpunkt aktiviert keinen Login.',
      'Eine gueltige Session wird nur diagnostisch erkannt, aber noch nicht als Login verwendet.',
      'Es werden keine Cookies gesetzt, keine Sessions erstellt und keine dashboard_sessions-Zeilen veraendert.',
      'Das Frontend darf aus diesem Status keine Sicherheitsentscheidung ableiten.'
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
    statusApiVersion: 'rdap7i.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    loginEnabled: false,
    sessionCreationEnabled: false,
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
      'RDAP7I liest dashboard_sessions nur per SELECT und nur zur Diagnose/Validierung.',
      'Es wird keine dashboard_sessions-Zeile erstellt, aktualisiert, verlaengert oder geloescht.',
      'Es wird kein Set-Cookie gesendet und kein Login aktiviert.',
      'Session-Cookie-Werte werden nicht ausgegeben; nur ein kurzer SHA-256-Fingerprint wird angezeigt.'
    ]
  };
}

module.exports = {
  buildMeStatus,
  buildSessionStatus,
  inspectSessionCookie
};
