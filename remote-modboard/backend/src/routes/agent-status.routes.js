'use strict';

const { buildAgentStatusResponse } = require('../services/agent-status.service');
const { buildAgentMediaInventoryStatusResponse } = require('../services/agent-runtime.service');

function registerAgentStatusRoutes(app, context) {
  app.get('/api/remote/agent/status', (req, res) => {
    res.json(buildAgentStatusResponse(context));
  });

  app.get('/api/remote/agent/media/inventory/status', (req, res) => {
    void req;
    res.json(buildAgentMediaInventoryStatusResponse());
  });
}

module.exports = { registerAgentStatusRoutes };
