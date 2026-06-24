'use strict';

const { buildAdminUserPermissionDiagnostic } = require('../services/admin-user-permission-read.service');
const { buildAdminUserWriteFoundationDiagnostic } = require('../services/admin-user-write-foundation.service');

function registerAdminUsersRoutes(app, context) {
  app.get('/api/remote/admin/users/permission-diagnostic', async (req, res) => {
    const result = await buildAdminUserPermissionDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/write-foundation-diagnostic', async (req, res) => {
    const result = await buildAdminUserWriteFoundationDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerAdminUsersRoutes };
