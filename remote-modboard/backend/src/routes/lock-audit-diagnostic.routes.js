'use strict';

const { buildLockReadStatus } = require('../services/lock-read.service');
const { buildAuditReadStatus } = require('../services/audit-read.service');
const { buildAdminAuditLockSchemaStatusReadonly } = require('../services/admin-audit-lock-schema-status-readonly.service');

function registerLockAuditDiagnosticRoutes(app, context) {
  app.get('/api/remote/lock-audit/status', async (req, res) => {
    const [locks, audit] = await Promise.all([
      buildLockReadStatus({ context, req }),
      buildAuditReadStatus({ context, req })
    ]);

    res.json(buildLockAuditResponse({ context, req, locks, audit, adapterOnly: false }));
  });

  app.get('/api/remote/lock-audit/schema-adapter/status', async (req, res) => {
    const [locks, audit] = await Promise.all([
      buildLockReadStatus({ context, req }),
      buildAuditReadStatus({ context, req })
    ]);

    res.json(buildLockAuditResponse({ context, req, locks, audit, adapterOnly: true }));
  });

  app.get('/api/remote/admin/audit-lock/schema-status', async (req, res) => {
    const result = await buildAdminAuditLockSchemaStatusReadonly({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/lock-audit/schema-status', async (req, res) => {
    const result = await buildAdminAuditLockSchemaStatusReadonly({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

function buildLockAuditResponse({ context, req, locks, audit, adapterOnly }) {
  const schemaInspectionRequested = req && req.query && req.query.db === '1';

  return {
    ok: Boolean(locks.ok && audit.ok),
    service: 'remote-modboard',
    module: adapterOnly ? 'remote_lock_audit_schema_adapter_diagnostic' : 'remote_lock_audit_diagnostic',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap14.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    loginEnabled: false,
    lockAuditDiagnosticPrepared: true,
    schemaAdapterPrepared: true,
    lockSchemaAdapterPrepared: true,
    auditSchemaAdapterPrepared: true,
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
    schemaInspectionRequested,
    rdap33SchemaStatusReadonly: {
      prepared: true,
      route: '/api/remote/admin/audit-lock/schema-status',
      aliasRoute: '/api/remote/lock-audit/schema-status',
      readOnly: true,
      writeEnabled: false,
      productiveWritesEnabled: false,
      writesStillBlocked: true
    },
    locks: adapterOnly ? buildAdapterOnlyLockBlock(locks) : locks,
    audit: adapterOnly ? buildAdapterOnlyAuditBlock(audit) : audit,
    safety: context.safety,
    notes: [
      'RDAP14 erweitert die bestehende Lock-/Audit-Diagnose um read-only Schema-Adapter-Ausgaben.',
      'Ohne db=1 werden keine DB-Abfragen ausgefuehrt.',
      'Mit db=1 werden nur INFORMATION_SCHEMA-SELECTs ueber read-only Connection ausgefuehrt.',
      'RDAP33 ergaenzt eine separate read-only Schema-/Runtime-Statusroute mit Counts und sicheren Previews.',
      'Es gibt keine Lock-Writes, keine Audit-Writes, keine Remote-Writes und keine Agent-Actions.',
      'compatibleForWrite bleibt in RDAP14 immer false.'
    ]
  };
}

function buildAdapterOnlyLockBlock(locks) {
  return {
    ok: locks.ok,
    module: locks.module,
    statusApiVersion: locks.statusApiVersion,
    readOnly: true,
    writeEnabled: false,
    table: locks.table,
    adapter: locks.adapter,
    database: locks.database,
    reason: locks.reason || null
  };
}

function buildAdapterOnlyAuditBlock(audit) {
  return {
    ok: audit.ok,
    module: audit.module,
    statusApiVersion: audit.statusApiVersion,
    readOnly: true,
    writeEnabled: false,
    table: audit.table,
    adapter: audit.adapter,
    database: audit.database,
    reason: audit.reason || null
  };
}

module.exports = { registerLockAuditDiagnosticRoutes };
