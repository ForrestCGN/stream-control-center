'use strict';

function registerRoutesRoutes(app, context) {
  app.get('/api/remote/routes', (req, res) => {
    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_routes',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap_auth4.v1',
      readOnly: true,
      writeEnabled: false,
      authEnabled: Boolean(context.config && context.config.auth && context.config.auth.authEnabled),
      routes: [
        { method: 'GET', path: '/api/remote/health', description: 'Read-only Healthcheck' },
        { method: 'GET', path: '/api/remote/status', description: 'Read-only Service-/Security-/Auth-Status' },
        { method: 'GET', path: '/api/remote/routes', description: 'Read-only Routenuebersicht' },
        { method: 'GET', path: '/api/remote/auth/model', description: 'Read-only Auth-/Rechte-Modell' },
        { method: 'GET', path: '/api/remote/auth/me', description: 'Aktueller Login-/Session-Status' },
        { method: 'POST', path: '/api/remote/auth/me/sync-twitch', description: 'Self-Service: eigenes Twitch-Profil synchronisieren' },
        { method: 'GET', path: '/api/remote/auth/session-status', description: 'Read-only Session-Diagnose' },
        { method: 'GET', path: '/api/remote/auth/permissions/check', description: 'Read-only Permission-Diagnose' },
        { method: 'GET', path: '/api/remote/auth/login/plan', description: 'Read-only Plan fuer zentrale Login-Schicht' },
        { method: 'GET', path: '/api/remote/auth/login/start', description: 'Neutraler Login-Einstieg; aktuell Fallback auf Twitch, spaeter zentrale Auth' },
        { method: 'GET', path: '/api/remote/auth/twitch/start', description: 'Gated Twitch OAuth Start' },
        { method: 'GET', path: '/api/remote/auth/twitch/callback', description: 'Gated Twitch OAuth Callback' },
        { method: 'POST', path: '/api/remote/auth/logout', description: 'Gated Logout nur fuer aktuelle Auth-Session' },
        { method: 'GET', path: '/api/remote/lock-audit/status', description: 'Read-only Lock-/Audit-Diagnose' },
        { method: 'GET', path: '/api/remote/lock-audit/schema-adapter/status', description: 'Read-only Schema-Adapter-Diagnose' },
        { method: 'GET', path: '/', description: 'Remote-Modboard UI' },
        { method: 'GET', path: '/remote', description: 'Remote-Modboard UI Alias' },
        { method: 'GET', path: '/modboard', description: 'Remote-Modboard UI Alias' }
      ],
      safety: context.safety
    });
  });
}

module.exports = { registerRoutesRoutes };
