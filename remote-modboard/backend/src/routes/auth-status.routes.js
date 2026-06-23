'use strict';

const {
  buildMeStatus,
  buildSessionStatus
} = require('../services/auth-status.service');

function registerAuthStatusRoutes(app, context) {
  app.get('/api/remote/auth/me', (req, res) => {
    res.json(buildMeStatus({ context, req }));
  });

  app.get('/api/remote/auth/session-status', (req, res) => {
    res.json(buildSessionStatus({ context, req }));
  });
}

module.exports = { registerAuthStatusRoutes };
