'use strict';

const { readAuthDbModel } = require('../services/auth-db-read.service');

function registerAuthModelRoutes(app, context) {
  app.get('/api/remote/auth/model', async (req, res) => {
    const result = await readAuthDbModel(context.config);

    res.status(result.ok ? 200 : 503).json({
      ...result,
      moduleBuild: context.moduleBuild,
      safety: context.safety
    });
  });
}

module.exports = { registerAuthModelRoutes };
