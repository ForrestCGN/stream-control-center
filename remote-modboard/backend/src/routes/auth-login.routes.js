'use strict';

const {
  buildLoginEntry,
  buildPublicLoginPlan
} = require('../services/auth-login-entry.service');

function registerAuthLoginRoutes(app, context) {
  app.get('/api/remote/auth/login/plan', (req, res) => {
    void req;
    res.json(buildPublicLoginPlan({ context }));
  });

  app.get('/api/remote/auth/login/start', (req, res) => {
    const result = buildLoginEntry({ context, req });
    res.redirect(result.status || 302, result.redirectUrl || '/api/remote/auth/twitch/start');
  });
}

module.exports = { registerAuthLoginRoutes };
