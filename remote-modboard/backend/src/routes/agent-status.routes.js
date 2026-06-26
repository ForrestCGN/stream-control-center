'use strict';

const { buildAgentStatusResponse } = require('../services/agent-status.service');

function registerAgentStatusRoutes(app, context) {
  app.get('/api/remote/agent/status', (req, res) => {
    res.json(buildAgentStatusResponse(context));
  });
}

module.exports = { registerAgentStatusRoutes };
