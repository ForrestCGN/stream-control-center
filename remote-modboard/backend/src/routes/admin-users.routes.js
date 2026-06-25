'use strict';

const { buildAdminUserPermissionDiagnostic } = require('../services/admin-user-permission-read.service');
const { buildAdminUserWriteFoundationDiagnostic } = require('../services/admin-user-write-foundation.service');
const { buildAdminUserAdminNoteDiagnostic } = require('../services/admin-user-admin-note-diagnostic.service');
const { buildAdminUserAdminNoteReadDiagnostic } = require('../services/admin-user-admin-note-read-diagnostic.service');
const { buildAdminUserAdminNoteReadPermissionDiagnostic } = require('../services/admin-user-admin-note-read-permission-diagnostic.service');

function registerAdminUsersRoutes(app, context) {
  app.get('/api/remote/admin/users/permission-diagnostic', async (req, res) => {
    const result = await buildAdminUserPermissionDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/write-foundation-diagnostic', async (req, res) => {
    const result = await buildAdminUserWriteFoundationDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/admin-note-diagnostic', async (req, res) => {
    const result = await buildAdminUserAdminNoteDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/admin-note-read-diagnostic', async (req, res) => {
    const result = await buildAdminUserAdminNoteReadDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/admin-note-read-permission-diagnostic', async (req, res) => {
    const result = await buildAdminUserAdminNoteReadPermissionDiagnostic({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerAdminUsersRoutes };
