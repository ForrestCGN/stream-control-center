'use strict';

const { buildLockReadStatus } = require('../services/lock-read.service');
const { buildAuditReadStatus } = require('../services/audit-read.service');

function registerLockAuditDiagnosticRoutes(app, context) {
  app.get('/api/remote/lock-audit/status', async (req, res) => {
    const [locks, audit] = await Promise.all([
      buildLockReadStatus({ context, req }),
      buildAuditReadStatus({ context, req })
    ]);

    res.json({
      ok: Boolean(locks.ok && audit.ok),
      service: 'remote-modboard',
      module: 'remote_lock_audit_diagnostic',
      moduleBuild: context.moduleBuild,
      statusApiVersion: 'rdap11.v1',
      readOnly: true,
      writeEnabled: false,
      databaseWriteEnabled: false,
      migrationEnabled: false,
      authEnabled: false,
      loginEnabled: false,
      lockAuditDiagnosticPrepared: true,
      writeRoutesEnabled: false,
      lockAcquireEnabled: false,
      lockHeartbeatEnabled: false,
      lockReleaseEnabled: false,
      lockForceTakeoverEnabled: false,
      auditInsertEnabled: false,
      auditUpdateEnabled: false,
      productiveAuthorizationEnabled: false,
      agentActionsEnabled: false,
      obsControlEnabled: false,
      soundControlEnabled: false,
      overlayControlEnabled: false,
      commandControlEnabled: false,
      schemaInspectionRequested: req && req.query && req.query.db === '1',
      locks,
      audit,
      safety: context.safety,
      notes: [
        'RDAP11 ist ein read-only Lock-/Audit-Diagnose-Skeleton.',
        'Ohne db=1 werden keine DB-Abfragen ausgefuehrt.',
        'Mit db=1 werden nur INFORMATION_SCHEMA-SELECTs ueber read-only Connection ausgefuehrt.',
        'Es gibt keine Lock-Writes, keine Audit-Writes, keine Remote-Writes und keine Agent-Actions.'
      ]
    });
  });
}

module.exports = { registerLockAuditDiagnosticRoutes };
