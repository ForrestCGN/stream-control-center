'use strict';

const { buildAdminUserPermissionDiagnostic } = require('../services/admin-user-permission-read.service');
const { buildAdminUserWriteFoundationDiagnostic } = require('../services/admin-user-write-foundation.service');
const { buildAdminUserAdminNoteDiagnostic } = require('../services/admin-user-admin-note-diagnostic.service');
const { buildAdminUserAdminNoteWriteDisabled } = require('../services/admin-user-admin-note-write-disabled.service');
const { buildAdminUserAdminNoteWritePlan } = require('../services/admin-user-admin-note-write-plan.service');
const { buildAdminUserAdminNoteWriteConfirmed } = require('../services/admin-user-admin-note-write-confirmed.service');
const { buildAdminUserAdminNoteRealReadAuthed } = require('../services/admin-user-admin-note-real-read-authed.service');

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

  app.get('/api/remote/admin/users/admin-notes/read', async (req, res) => {
    const result = await buildAdminUserAdminNoteRealReadAuthed({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/users/admin-notes/write-plan', async (req, res) => {
    const result = await buildAdminUserAdminNoteWritePlan({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/admin/users/admin-notes/create', async (req, res) => {
    const result = await buildAdminUserAdminNoteWriteConfirmed({ context, req, action: 'create' });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/admin/users/admin-notes/update', async (req, res) => {
    const result = await buildAdminUserAdminNoteWriteConfirmed({ context, req, action: 'update' });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/admin/users/admin-notes/deactivate', async (req, res) => {
    const result = await buildAdminUserAdminNoteWriteDisabled({ context, req, action: 'deactivate' });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerAdminUsersRoutes };
