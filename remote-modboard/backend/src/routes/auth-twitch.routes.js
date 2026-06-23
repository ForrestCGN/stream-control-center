'use strict';

function registerAuthTwitchRoutes(app, context) {
  app.get('/api/remote/auth/twitch/start', (req, res) => {
    res.status(403).json(buildDisabledOAuthResponse({
      context,
      route: '/api/remote/auth/twitch/start',
      action: 'start',
      reason: 'twitch_oauth_start_disabled',
      message: 'Twitch OAuth Start ist in RDAP7H nur als disabled/read-only Skeleton vorhanden.'
    }));
  });

  app.get('/api/remote/auth/twitch/callback', (req, res) => {
    res.status(403).json(buildDisabledOAuthResponse({
      context,
      route: '/api/remote/auth/twitch/callback',
      action: 'callback',
      reason: 'twitch_oauth_callback_disabled',
      message: 'Twitch OAuth Callback ist in RDAP7H nur als disabled/read-only Skeleton vorhanden.'
    }));
  });
}

function buildDisabledOAuthResponse({ context, route, action, reason, message }) {
  const authConfig = context.config && context.config.auth ? context.config.auth : {};
  const twitchOAuth = authConfig.twitchOAuth || {};
  const sessions = authConfig.sessions || {};

  return {
    ok: false,
    service: 'remote-modboard',
    module: 'remote_auth_twitch',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap7h.v1',
    route,
    action,
    error: reason,
    message,
    readOnly: true,
    writeEnabled: false,
    authPrepared: true,
    authEnabled: false,
    loginEnabled: false,
    oauthPrepared: true,
    oauthEnabled: false,
    twitchOAuth: {
      prepared: Boolean(twitchOAuth.prepared),
      requestedEnabled: Boolean(twitchOAuth.requestedEnabled),
      effectiveEnabled: false,
      startRouteEnabled: false,
      callbackRouteEnabled: false,
      redirectToTwitch: false,
      tokenExchangeEnabled: false,
      clientIdConfigured: Boolean(twitchOAuth.clientIdConfigured),
      clientSecretConfigured: Boolean(twitchOAuth.clientSecretConfigured),
      redirectUri: twitchOAuth.redirectUri || null,
      scopes: Array.isArray(twitchOAuth.scopes) ? twitchOAuth.scopes : []
    },
    sessions: {
      requestedEnabled: Boolean(sessions.requestedEnabled),
      effectiveEnabled: false,
      cookieName: sessions.cookieName || 'scc_remote_session',
      sessionSecretConfigured: Boolean(sessions.sessionSecretConfigured),
      oauthStateSecretConfigured: Boolean(sessions.oauthStateSecretConfigured),
      createSession: false,
      setCookie: false
    },
    databaseWriteEnabled: false,
    agentActionsEnabled: false,
    safety: context.safety,
    notes: [
      'RDAP7H Skeleton antwortet absichtlich mit HTTP 403 disabled.',
      'Es gibt keinen Redirect zu Twitch.',
      'Es wird kein OAuth-Code gegen Tokens getauscht.',
      'Es werden keine Cookies gesetzt und keine Sessions erstellt.',
      'Es werden keine DB-Writes, Agent-Actions oder Stream-Steuerungen ausgefuehrt.'
    ]
  };
}

module.exports = {
  registerAuthTwitchRoutes,
  buildDisabledOAuthResponse
};
