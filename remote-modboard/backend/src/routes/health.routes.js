'use strict';

const { buildPublicConfigSummary } = require('../services/config.service');
const { checkDatabaseHealth } = require('../services/db-health.service');

function registerHealthRoutes(app, context) {
  app.get('/api/remote/health', async (req, res) => {
    const db = await checkDatabaseHealth(context.config, { connect: req.query.db === '1' });

    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_node_base',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap5f.v1',
      readOnly: true,
      writeEnabled: false,
      actionEnabled: false,
      productiveAgentRuntime: false,
      generatedAt: new Date().toISOString(),
      config: buildPublicConfigSummary(context.config),
      database: db,
      safety: context.safety
    });
  });
}

module.exports = { registerHealthRoutes };
