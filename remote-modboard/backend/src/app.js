'use strict';

const path = require('path');
const express = require('express');
const { buildSafetyBlock } = require('./security/safety');
const { registerHealthRoutes } = require('./routes/health.routes');
const { registerStatusRoutes } = require('./routes/status.routes');
const { registerAuthModelRoutes } = require('./routes/auth-model.routes');
const { registerAuthStatusRoutes } = require('./routes/auth-status.routes');
const { registerAuthLoginRoutes } = require('./routes/auth-login.routes');
const { registerAuthTwitchRoutes } = require('./routes/auth-twitch.routes');
const { registerLockAuditDiagnosticRoutes } = require('./routes/lock-audit-diagnostic.routes');
const { registerRoutesRoutes } = require('./routes/routes.routes');

function createApp({ config, moduleBuild }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '128kb' }));
  app.use((req, res, next) => {
    res.setHeader('X-Remote-Modboard-Build', moduleBuild);
    res.setHeader('X-Remote-Modboard-Mode', 'readonly');
    next();
  });

  const context = { config, moduleBuild, safety: buildSafetyBlock() };

  registerHealthRoutes(app, context);
  registerStatusRoutes(app, context);
  registerAuthModelRoutes(app, context);
  registerAuthStatusRoutes(app, context);
  registerAuthLoginRoutes(app, context);
  registerAuthTwitchRoutes(app, context);
  registerLockAuditDiagnosticRoutes(app, context);
  registerRoutesRoutes(app, context);

  const publicDir = path.join(__dirname, '..', 'public');

  app.use(express.static(publicDir, {
    index: 'index.html',
    extensions: ['html'],
    fallthrough: true,
    maxAge: '5m',
    setHeaders(res) {
      res.setHeader('X-Remote-Modboard-Ui', 'readonly');
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
  }));

  app.get(['/', '/remote', '/modboard'], (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'), {
      headers: {
        'X-Remote-Modboard-Ui': 'readonly',
        'Cache-Control': 'no-store'
      }
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      service: 'remote-modboard',
      moduleBuild,
      error: 'not_found',
      path: req.path,
      readOnly: true,
      writeEnabled: false,
      authEnabled: false,
      sessionCreationEnabled: false
    });
  });

  app.use((err, req, res, next) => {
    void next;
    console.error('[remote-modboard] request_failed', err && err.message ? err.message : err);
    res.status(500).json({
      ok: false,
      service: 'remote-modboard',
      moduleBuild,
      error: 'internal_error',
      readOnly: true,
      writeEnabled: false,
      authEnabled: false,
      sessionCreationEnabled: false
    });
  });

  return app;
}

module.exports = { createApp };
