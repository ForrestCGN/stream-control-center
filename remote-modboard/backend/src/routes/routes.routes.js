'use strict';

function registerRoutesRoutes(app, context) {
  app.get('/api/remote/routes', (req, res) => {
    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_node_base',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap8a.v1',
      readOnly: true,
      writeEnabled: false,
      authPrepared: true,
      authEnabled: false,
      sessionCreationEnabled: false,
      sessionStoreReadOnlyValidationPrepared: true,
      permissionReadOnlyResolverPrepared: true,
      routes: [
        {
          method: 'GET',
          path: '/api/remote/health',
          description: 'Read-only health endpoint. Optional db=1 performs SELECT 1 when ENV and mysql2 are available.'
        },
        {
          method: 'GET',
          path: '/api/remote/status',
          description: 'Read-only service status, safety flags, DB config state, OAuth disabled state, session-store read-only validation state, permission diagnostic state and planned agent state.'
        },
        {
          method: 'GET',
          path: '/api/remote/auth/model',
          description: 'Read-only Auth-/Rollen-/Gruppen-/Permission-Modell aus MariaDB. Keine Auth-Aktivierung, keine Sessions, keine Writes.'
        },
        {
          method: 'GET',
          path: '/api/remote/auth/me',
          description: 'Read-only Auth-Status fuer aktuellen Request. Login ist deaktiviert, daher loggedIn=false. Session wird nur diagnostisch validiert.'
        },
        {
          method: 'GET',
          path: '/api/remote/auth/session-status',
          description: 'RDAP7I read-only Session-Store-Validation gegen dashboard_sessions. Keine Session-Erstellung, keine Cookies, keine DB-Writes.'
        },
        {
          method: 'GET',
          path: '/api/remote/auth/permissions/check',
          description: 'RDAP8A read-only Permission-Diagnose. Ohne aktiven Login bleibt allowed=false. Keine produktive Autorisierung, keine DB-Writes.'
        },
        {
          method: 'GET',
          path: '/api/remote/auth/twitch/start',
          description: 'RDAP7H disabled/read-only Twitch OAuth Start Skeleton. Kein Redirect zu Twitch, keine Cookies, keine Sessions.',
          enabled: false,
          productive: false
        },
        {
          method: 'GET',
          path: '/api/remote/auth/twitch/callback',
          description: 'RDAP7H disabled/read-only Twitch OAuth Callback Skeleton. Kein Token-Tausch, keine Cookies, keine Sessions, keine DB-Writes.',
          enabled: false,
          productive: false
        },
        {
          method: 'GET',
          path: '/api/remote/routes',
          description: 'Read-only route overview.'
        }
      ],
      disabled: [
        'POST/PUT/PATCH/DELETE remote writes',
        'auth/session creation',
        'productive permission enforcement',
        'productive Twitch OAuth start activation',
        'productive Twitch OAuth callback activation',
        'Redirect to Twitch',
        'OAuth code token exchange',
        'Set-Cookie/session cookie issuance',
        'DB migration',
        'agent action execution',
        'OBS/Sound/Overlay/Command control',
        'shell/file/process operations'
      ]
    });
  });
}

module.exports = { registerRoutesRoutes };
