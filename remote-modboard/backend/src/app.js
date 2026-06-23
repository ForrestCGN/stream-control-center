'use strict';

const express = require('express');
const { buildSafetyBlock } = require('./security/safety');
const { registerHealthRoutes } = require('./routes/health.routes');
const { registerStatusRoutes } = require('./routes/status.routes');
const { registerAuthModelRoutes } = require('./routes/auth-model.routes');
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

  const context = {
    config,
    moduleBuild,
    safety: buildSafetyBlock()
  };

  registerHealthRoutes(app, context);
  registerStatusRoutes(app, context);
  registerAuthModelRoutes(app, context);
  registerRoutesRoutes(app, context);

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      service: 'remote-modboard',
      moduleBuild,
      error: 'not_found',
      path: req.path,
      readOnly: true,
      writeEnabled: false
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
      writeEnabled: false
    });
  });

  return app;
}

module.exports = { createApp };
