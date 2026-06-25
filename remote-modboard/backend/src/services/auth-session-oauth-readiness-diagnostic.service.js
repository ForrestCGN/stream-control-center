'use strict';

const { buildPublicConfigSummary } = require('./config.service');
const { buildDatabaseReadiness } = require('./db.service');
const { inspectSessionCookie } = require('./auth-session-read.service');

function buildAuthSessionOauthReadinessDiagnostic({ context, req }) {
  const config = context.config || {};
  const summary = buildPublicConfigSummary(config);
  const db = buildDatabaseReadiness(config);
  const cookie = inspectSessionCookie(req, config);
  const auth = summary.auth || {};
  const twitchOAuth = auth.twitchOAuth || {};
  const sessions = auth.sessions || {};
  const blockers = buildBlockers({ summary, db });
  const oauthWouldRedirectToTwitch = Boolean(
    auth.authEnabled
    && auth.loginEnabled
    && twitchOAuth.effectiveEnabled
    && sessions.effectiveEnabled
    && auth.sessionWriteEnabled
    && db.configured
    && db.driverAvailable
  );

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_auth_session_oauth_readiness_diagnostic',
    moduleBuild: context.moduleBuild,
    diagnosticBuild: 'RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC_READONLY',
    statusApiVersion: 'rdap_admin_users24.v1',
    readOnly: true,
    routeRemainsReadOnly: true,
    route: '/api/remote/auth/readiness-diagnostic',
    writeEnabled: false,
    databaseWriteExecuted: false,
    sessionWriteExecuted: false,
    createsSession: false,
    setsCookie: false,
    updatesLastSeen: false,
    revokesSession: false,
    tokenExchangeExecuted: false,
    callsTwitchApi: false,
    redirectsToTwitch: false,
    agentActionsEnabled: false,
    returnsSecrets: false,
    authSummary: {
      envPathHint: summary.envPathHint,
      envFileExists: summary.envFileExists,
      authEnabled: Boolean(auth.authEnabled),
      loginEnabled: Boolean(auth.loginEnabled),
      sessionCreationEnabled: Boolean(auth.sessionCreationEnabled),
      sessionWriteEnabled: Boolean(auth.sessionWriteEnabled),
      twitchOAuth: {
        prepared: Boolean(twitchOAuth.prepared),
        requestedEnabled: Boolean(twitchOAuth.requestedEnabled),
        effectiveEnabled: Boolean(twitchOAuth.effectiveEnabled),
        clientIdConfigured: Boolean(twitchOAuth.clientIdConfigured),
        clientSecretConfigured: Boolean(twitchOAuth.clientSecretConfigured),
        redirectUri: twitchOAuth.redirectUri || null,
        scopes: Array.isArray(twitchOAuth.scopes) ? twitchOAuth.scopes : []
      },
      sessions: {
        requestedEnabled: Boolean(sessions.requestedEnabled),
        writeRequested: Boolean(sessions.writeRequested),
        effectiveEnabled: Boolean(sessions.effectiveEnabled),
        cookieName: sessions.cookieName || 'scc_remote_session',
        stateCookieName: sessions.stateCookieName || 'scc_remote_oauth_state',
        sessionSecretConfigured: Boolean(sessions.sessionSecretConfigured),
        oauthStateSecretConfigured: Boolean(sessions.oauthStateSecretConfigured),
        ttlSeconds: sessions.ttlSeconds || null,
        secureCookie: Boolean(sessions.secureCookie),
        sameSite: sessions.sameSite || 'Lax',
        sharedCookieDomainPlanned: sessions.sharedCookieDomainPlanned || '.forrestcgn.de'
      },
      centralAuth: summary.centralAuth || null
    },
    database: {
      configured: Boolean(db.configured),
      driverAvailable: Boolean(db.driverAvailable),
      error: db.error || null,
      writeEnabledByConfig: Boolean(config.database && config.database.writeEnabled),
      migrationEnabled: false,
      writeExecuted: false
    },
    currentRequestSessionCookie: {
      checked: true,
      cookiePresent: Boolean(cookie.cookiePresent),
      cookieNameDetected: cookie.cookieNameDetected || null,
      cookieValuePresent: Boolean(cookie.cookieValuePresent),
      cookieValueFingerprint: cookie.cookieValueFingerprint || null,
      candidateCookieNames: cookie.candidateNames || [],
      lookupPerformed: false
    },
    expectedHttpBehaviour: {
      twitchStartRoute: '/api/remote/auth/twitch/start',
      twitchCallbackRoute: '/api/remote/auth/twitch/callback',
      startWithoutEnabledLogin: '403 JSON, no redirect, no cookie',
      startWithEnabledLogin: '302 redirect to Twitch plus OAuth-state cookie',
      callbackWithoutValidStateOrCode: '403 JSON/HTML error, no login session',
      callbackWithValidTwitchFlow: '200 HTML plus session cookie after successful token exchange',
      oauthWouldRedirectToTwitch,
      deploySafetyRule: oauthWouldRedirectToTwitch
        ? 'Expect 302/403 for start/callback when login is intentionally enabled.'
        : 'Expect 403/403 while login remains disabled.'
    },
    readiness: {
      readyForLoginSmokeTest: oauthWouldRedirectToTwitch,
      readyForRealAdminNoteTextDisplay: false,
      adminNoteTextDisplayStillBlockedUntil: [
        'valid session cookie exists',
        'dashboard user exists and is allowed',
        'admin.users.note.read permission is confirmed',
        'real read route is built with server-side auth/permission enforcement'
      ],
      blockers
    },
    safety: {
      readOnly: true,
      remoteWritesEnabled: false,
      userRoleWritesEnabled: false,
      adminNoteWritesEnabled: false,
      noteTextReturned: false,
      communityPagesMayReadAdminNotes: false,
      agentActionsEnabled: false,
      obsControlEnabled: false,
      soundControlEnabled: false,
      overlayControlEnabled: false,
      commandControlEnabled: false
    },
    notes: [
      'RDAP24 prueft Auth/OAuth/Session nur lesend und aktiviert nichts.',
      'Ein 302 auf /api/remote/auth/twitch/start ist nur dann korrekt, wenn alle Auth-/Session-/OAuth-Gates bewusst aktiv sind.',
      'Echte Admin-Notiztexte bleiben bis zu gueltiger Session und admin.users.note.read blockiert.'
    ]
  };
}

function buildBlockers({ summary, db }) {
  const blockers = [];
  const auth = summary.auth || {};
  const twitchOAuth = auth.twitchOAuth || {};
  const sessions = auth.sessions || {};

  if (!summary.envFileExists) blockers.push('env_file_missing');
  if (!db.configured) blockers.push('database_not_configured');
  if (!db.driverAvailable) blockers.push('database_driver_unavailable');
  if (!auth.authEnabled) blockers.push('auth_not_effective');
  if (!auth.loginEnabled) blockers.push('login_not_effective');
  if (!twitchOAuth.requestedEnabled) blockers.push('TWITCH_OAUTH_ENABLED_not_requested');
  if (!twitchOAuth.effectiveEnabled) blockers.push('twitch_oauth_not_effective');
  if (!twitchOAuth.clientIdConfigured) blockers.push('TWITCH_CLIENT_ID_missing');
  if (!twitchOAuth.clientSecretConfigured) blockers.push('TWITCH_CLIENT_SECRET_missing');
  if (!sessions.requestedEnabled) blockers.push('SESSION_ENABLED_not_requested');
  if (!sessions.writeRequested) blockers.push('AUTH_SESSION_WRITE_ENABLED_not_requested');
  if (!sessions.effectiveEnabled) blockers.push('sessions_not_effective');
  if (!sessions.sessionSecretConfigured) blockers.push('SESSION_SECRET_missing');
  if (!sessions.oauthStateSecretConfigured) blockers.push('OAUTH_STATE_SECRET_missing');

  return blockers;
}

module.exports = { buildAuthSessionOauthReadinessDiagnostic };
