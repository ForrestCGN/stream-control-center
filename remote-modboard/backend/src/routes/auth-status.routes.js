'use strict';

const {
  buildMeStatus,
  buildSessionStatus
} = require('../services/auth-status.service');
const {
  buildPermissionCheckStatus
} = require('../services/auth-permission-read.service');

function registerAuthStatusRoutes(app, context) {
  app.get('/api/remote/auth/me', async (req, res) => {
    res.json(await buildMeStatus({ context, req }));
  });

  app.get('/api/remote/auth/session-status', async (req, res) => {
    res.json(await buildSessionStatus({ context, req }));
  });

  app.get('/api/remote/auth/permissions/check', async (req, res) => {
    res.json(await buildPermissionCheckStatus({ context, req }));
  });
}

module.exports = { registerAuthStatusRoutes };
