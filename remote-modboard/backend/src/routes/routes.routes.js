'use strict';

function registerRoutesRoutes(app, context) {
  app.get('/api/remote/routes', (req, res) => {
    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_node_base',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap5f.v1',
      readOnly: true,
      writeEnabled: false,
      routes: [
        {
          method: 'GET',
          path: '/api/remote/health',
          description: 'Read-only health endpoint. Optional db=1 performs SELECT 1 when ENV and mysql2 are available.'
        },
        {
          method: 'GET',
          path: '/api/remote/status',
          description: 'Read-only service status, safety flags, DB config state and planned agent state.'
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
        'DB migration',
        'agent action execution',
        'OBS/Sound/Overlay/Command control',
        'shell/file/process operations'
      ]
    });
  });
}

module.exports = { registerRoutesRoutes };
