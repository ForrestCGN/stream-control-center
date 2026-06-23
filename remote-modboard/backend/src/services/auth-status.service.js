'use strict';

const SESSION_COOKIE_CANDIDATES = [
  'scc_session',
  'scc_remote_session',
  'remote_modboard_session'
];

function buildMeStatus({ context, req }) {
  const cookieState = inspectSessionCookie(req);

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap7b.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    sessionCreationEnabled: false,
    loggedIn: false,
    user: null,
    identity: null,
    roles: [],
    groups: [],
    permissions: [],
    session: {
      checked: true,
      cookiePresent: cookieState.cookiePresent,
      cookieNameDetected: cookieState.cookieNameDetected,
      sessionLookupEnabled: false,
      sessionLookupPerformed: false,
      sessionValid: false,
      reason: 'auth_disabled'
    },
    warnings: [
      'RDAP7B ist read-only. Dieser Endpunkt aktiviert keinen Login.',
      'Es werden keine Cookies gesetzt und keine Sessions erstellt.',
      'Das Frontend darf aus diesem Status keine Sicherheitsentscheidung ableiten.'
    ]
  };
}

function buildSessionStatus({ context, req }) {
  const cookieState = inspectSessionCookie(req);

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_status',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap7b.v1',
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    sessionCreationEnabled: false,
    session: {
      cookiePresent: cookieState.cookiePresent,
      cookieNameDetected: cookieState.cookieNameDetected,
      lookupEnabled: false,
      lookupPerformed: false,
      exists: false,
      valid: false,
      expiresAt: null,
      userId: null,
      reason: 'session_creation_disabled'
    },
    notes: [
      'RDAP7B prueft nur den Request-Zustand.',
      'Es wird keine dashboard_sessions-Zeile gelesen, geschrieben oder erzeugt.',
      'Ein spaeterer RDAP-Step darf Session-Lookup nur mit serverseitiger Auth-Logik aktivieren.'
    ]
  };
}

function inspectSessionCookie(req) {
  const cookieHeader = req && req.headers ? req.headers.cookie : '';
  if (typeof cookieHeader !== 'string' || cookieHeader.trim() === '') {
    return {
      cookiePresent: false,
      cookieNameDetected: null
    };
  }

  const names = cookieHeader
    .split(';')
    .map(part => part.trim().split('=')[0])
    .filter(Boolean);

  const detected = SESSION_COOKIE_CANDIDATES.find(name => names.includes(name));

  return {
    cookiePresent: Boolean(detected),
    cookieNameDetected: detected || null
  };
}

module.exports = {
  buildMeStatus,
  buildSessionStatus,
  inspectSessionCookie
};
