'use strict';

const { buildAdminMiniWriteFoundationDiagnostic } = require('../services/admin-mini-write-foundation.service');

function registerAdminMiniWriteFoundationRoutes(app, context) {
  app.get('/api/remote/admin/users/mini-write-foundation-diagnostic', async (req, res) => {
    const result = await buildAdminMiniWriteFoundationDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerAdminMiniWriteFoundationRoutes };
