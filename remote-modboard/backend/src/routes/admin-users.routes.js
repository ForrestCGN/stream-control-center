'use strict';

const { buildAdminUserPermissionDiagnostic } = require('../services/admin-user-permission-read.service');

function registerAdminUsersRoutes(app, context) {
  app.get('/api/remote/admin/users/permission-diagnostic', async (req, res) => {
    const result = await buildAdminUserPermissionDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerAdminUsersRoutes };
