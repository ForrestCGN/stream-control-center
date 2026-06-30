'use strict';

const { buildLockReadStatus } = require('../services/lock-read.service');
const {
  buildAuditReadStatus,
  buildAuditLogReadonlyList,
  buildAuditRetentionReadonlyStatus
} = require('../services/audit-read.service');
const { buildAdminAuditLockSchemaStatusReadonly } = require('../services/admin-audit-lock-schema-status-readonly.service');
const {
  buildAdminAuditTestInsertStatus,
  runAdminAuditTestInsert
} = require('../services/admin-audit-test-insert.service');
const {
  buildAdminLockTestStatus,
  runAdminLockTestCycle
} = require('../services/admin-lock-test.service');

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

  app.get('/api/remote/admin/audit/log', async (req, res) => {
    const result = await buildAuditLogReadonlyList({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/audit/retention/status', async (req, res) => {
    const result = await buildAuditRetentionReadonlyStatus({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/audit/test-insert/status', async (req, res) => {
    const result = await buildAdminAuditTestInsertStatus({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/admin/audit/test-insert', async (req, res) => {
    const result = await runAdminAuditTestInsert({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.get('/api/remote/admin/locks/test/status', async (req, res) => {
    const result = await buildAdminLockTestStatus({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/admin/locks/test-cycle', async (req, res) => {
    const result = await runAdminLockTestCycle({ context, req });
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
    statusApiVersion: 'rdap_lock37.v1',
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
    auditLogReadonlyApiPrepared: true,
    auditLogReadonlyApiRoute: '/api/remote/admin/audit/log',
    auditRetentionStatusPrepared: true,
    auditRetentionStatusRoute: '/api/remote/admin/audit/retention/status',
    writeRoutesEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    auditCleanupEnabled: false,
    auditPruneEnabled: false,
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
    rdap113AuditLogReadonly: {
      prepared: true,
      route: '/api/remote/admin/audit/log',
      method: 'GET',
      statusApiVersion: 'rdap_audit113.v1',
      tableName: 'dashboard_audit_log',
      readOnly: true,
      writeEnabled: false,
      productiveWritesEnabled: false,
      migrationEnabled: false,
      maxLimit: 100,
      filters: ['limit', 'status', 'action', 'actor'],
      purpose: 'Mod-taugliche read-only Liste: wer, wann, was gemacht hat und Status.'
    },
    rdap115AuditRetentionStatus: {
      prepared: true,
      route: '/api/remote/admin/audit/retention/status',
      method: 'GET',
      statusApiVersion: 'rdap_audit115.v1',
      tableName: 'dashboard_audit_log',
      readOnly: true,
      writeEnabled: false,
      productiveWritesEnabled: false,
      cleanupEnabled: false,
      pruneEnabled: false,
      autoCleanupEnabled: false,
      purpose: 'Admin-Bereich Retention-Status: Anzahl, aeltester/neuster Eintrag, Zeitraum, Cleanup-Status.'
    },
    rdap36AuditTestInsert: {
      prepared: true,
      statusRoute: '/api/remote/admin/audit/test-insert/status',
      route: '/api/remote/admin/audit/test-insert',
      method: 'POST',
      localOnly: true,
      confirmWriteRequired: true,
      bodyConfirmOnly: true,
      testOnlyRequired: true,
      auditTestInsertEnabled: true,
      productiveWritesEnabled: false,
      adminNoteWritesEnabled: false,
      lockWritesEnabled: false,
      uiWriteButtonsEnabled: false
    },
    rdap37LockTest: {
      prepared: true,
      statusRoute: '/api/remote/admin/locks/test/status',
      route: '/api/remote/admin/locks/test-cycle',
      method: 'POST',
      localOnly: true,
      confirmWriteRequired: true,
      bodyConfirmOnly: true,
      testOnlyRequired: true,
      lockTestCycleEnabled: true,
      productiveWritesEnabled: false,
      adminNoteWritesEnabled: false,
      auditProductiveWritesEnabled: false,
      uiWriteButtonsEnabled: false,
      physicalDeleteEnabled: false
    },
    locks: adapterOnly ? buildAdapterOnlyLockBlock(locks) : locks,
    audit: adapterOnly ? buildAdapterOnlyAuditBlock(audit) : audit,
    safety: context.safety,
    notes: [
      'RDAP14 erweitert die bestehende Lock-/Audit-Diagnose um read-only Schema-Adapter-Ausgaben.',
      'Ohne db=1 werden keine DB-Abfragen ausgefuehrt.',
      'Mit db=1 werden nur INFORMATION_SCHEMA-SELECTs ueber read-only Connection ausgefuehrt.',
      'RDAP33 ergaenzt eine separate read-only Schema-/Runtime-Statusroute mit Counts und sicheren Previews.',
      'RDAP113 ergaenzt eine read-only Audit-Log-Liste fuer wer/wann/was/Status.',
      'RDAP115 ergaenzt read-only Retention-Status fuer Admin-Bereich und UI-Planung.',
      'RDAP36 ergaenzt einen lokalen, bestaetigten Audit-Testinsert; produktive Writes bleiben gesperrt.',
      'RDAP37 ergaenzt einen lokalen, bestaetigten Lock-Test fuer Acquire/Heartbeat/Release.',
      'Es gibt keine Admin-Notiz-Writes, keine Remote-Writes und keine Agent-Actions.',
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
