'use strict';

const {
  buildMeStatus,
  buildSessionStatus
} = require('../services/auth-status.service');

function registerAuthStatusRoutes(app, context) {
  app.get('/api/remote/auth/me', async (req, res) => {
    res.json(await buildMeStatus({ context, req }));
  });

  app.get('/api/remote/auth/session-status', async (req, res) => {
    res.json(await buildSessionStatus({ context, req }));
  });
}

module.exports = { registerAuthStatusRoutes };
