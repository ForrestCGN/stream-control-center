'use strict';

const {
  buildTwitchStart,
  handleTwitchCallback,
  buildDisabledResponse,
  buildCookie
} = require('../services/auth-twitch-oauth.service');
const {
  revokeCurrentSession
} = require('../services/auth-session-write.service');

function registerAuthTwitchRoutes(app, context) {
  app.get('/api/remote/auth/twitch/start', (req, res) => {
    const result = buildTwitchStart({ context, req, res });

    if (result.handled && result.redirectUrl) {
      res.redirect(302, result.redirectUrl);
      return;
    }

    res.status(result.status || 403).json(result.body || buildDisabledOAuthResponse({
      context,
      route: '/api/remote/auth/twitch/start',
      action: 'start',
      reason: 'twitch_oauth_start_disabled',
      message: 'Twitch OAuth Start ist vorbereitet, aber nicht aktiv.'
    }));
  });

  app.get('/api/remote/auth/twitch/callback', async (req, res) => {
    try {
      const result = await handleTwitchCallback({ context, req, res });

      if (result.html) {
        res.status(result.status || 200).type('html').send(result.html);
        return;
      }

      res.status(result.status || 403).json(result.body);
    } catch (err) {
      console.error('[remote-auth] twitch_callback_failed', err && err.code ? err.code : err);
      res.status(500).json({
        ok: false,
        service: 'remote-modboard',
        module: 'remote_auth_twitch',
        moduleBuild: context.moduleBuild,
        statusApiVersion: 'rdap_auth1.v1',
        error: err && err.code ? err.code : 'twitch_callback_failed',
        authEnabled: Boolean(context.config && context.config.auth && context.config.auth.authEnabled),
        agentActionsEnabled: false,
        writeScope: 'auth_session_only'
      });
    }
  });

  app.post('/api/remote/auth/logout', async (req, res) => {
    try {
      if (!context.config.auth || context.config.auth.authEnabled !== true) {
        res.status(403).json(buildDisabledResponse({
          context,
          reason: 'auth_disabled',
          route: '/api/remote/auth/logout',
          action: 'logout'
        }));
        return;
      }

      const result = await revokeCurrentSession({ config: context.config, req });

      res.setHeader('Set-Cookie', buildCookie(context.config.auth.sessions.cookieName, '', {
        maxAge: 0,
        httpOnly: true,
        secure: context.config.auth.sessions.secureCookie,
        sameSite: context.config.auth.sessions.sameSite,
        path: '/'
      }));

      res.json({
        ok: true,
        service: 'remote-modboard',
        module: 'remote_auth_twitch',
        moduleBuild: context.moduleBuild,
        statusApiVersion: 'rdap_auth1.v1',
        loggedOut: true,
        result,
        agentActionsEnabled: false,
        remoteWritesEnabled: false
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        service: 'remote-modboard',
        module: 'remote_auth_twitch',
        moduleBuild: context.moduleBuild,
        statusApiVersion: 'rdap_auth1.v1',
        error: err && err.code ? err.code : 'logout_failed'
      });
    }
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
    statusApiVersion: 'rdap_auth1.v1',
    route,
    action,
    error: reason,
    message,
    readOnly: false,
    writeEnabled: false,
    authPrepared: true,
    authEnabled: Boolean(authConfig.authEnabled),
    loginEnabled: Boolean(authConfig.loginEnabled),
    oauthPrepared: true,
    oauthEnabled: Boolean(twitchOAuth.effectiveEnabled),
    twitchOAuth: {
      prepared: Boolean(twitchOAuth.prepared),
      requestedEnabled: Boolean(twitchOAuth.requestedEnabled),
      effectiveEnabled: Boolean(twitchOAuth.effectiveEnabled),
      startRouteEnabled: Boolean(twitchOAuth.effectiveEnabled),
      callbackRouteEnabled: Boolean(twitchOAuth.effectiveEnabled),
      redirectToTwitch: Boolean(twitchOAuth.effectiveEnabled),
      tokenExchangeEnabled: Boolean(twitchOAuth.effectiveEnabled),
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
      sessionSecretConfigured: Boolean(sessions.sessionSecretConfigured),
      oauthStateSecretConfigured: Boolean(sessions.oauthStateSecretConfigured),
      createSession: Boolean(authConfig.sessionCreationEnabled),
      setCookie: Boolean(sessions.effectiveEnabled)
    },
    databaseWriteEnabled: false,
    agentActionsEnabled: false,
    safety: context.safety,
    notes: [
      'AUTH1 ist gated. Ohne Env-Flags und Secrets bleibt OAuth gesperrt.',
      'Wenn aktiviert, schreibt AUTH1 nur User/Identity/Session fuer Login.',
      'Remote-Writes, Agent-Actions und Stream-Steuerungen bleiben aus.'
    ]
  };
}

module.exports = {
  registerAuthTwitchRoutes,
  buildDisabledOAuthResponse
};
