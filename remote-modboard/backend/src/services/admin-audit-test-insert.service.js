'use strict';

const crypto = require('crypto');
const { buildDatabaseReadiness, withWriteConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');

const MODULE = 'remote_admin_audit_test_insert';
const MODULE_BUILD = 'RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED';
const STATUS_API_VERSION = 'rdap_audit36.v1';
const AUDIT_TABLE = 'dashboard_audit_log';

function buildStatusBase({ context, req, action = 'status' } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: false,
    prepared: true,
    action,
    route: '/api/remote/admin/audit/test-insert',
    tableName: AUDIT_TABLE,
    localOnly: true,
    confirmWriteRequired: true,
    bodyConfirmOnly: true,
    testOnlyRequired: true,
    writeEnabled: true,
    databaseWriteEnabled: Boolean(readiness.writeEnabled),
    productiveWritesEnabled: false,
    writesStillBlockedForProductiveActions: true,
    createsAdminNote: false,
    updatesAdminNote: false,
    deactivatesAdminNote: false,
    createsLock: false,
    updatesLock: false,
    deletesLock: false,
    auditTestInsertEnabled: true,
    auditProductiveInsertEnabled: false,
    physicalDeleteEnabled: false,
    uiWriteButtonsEnabled: false,
    database: readiness,
    safety: context ? context.safety : null,
    request: buildRequestInfo(req),
    notes: [
      'RDAP36 ist nur fuer einen kontrollierten Audit-Testinsert.',
      'Die Route akzeptiert nur lokale Requests von 127.0.0.1/::1.',
      'confirmWrite muss im JSON-Body stehen; Query-Confirm wird bewusst nicht genutzt.',
      'testOnly=true ist Pflicht.',
      'Es werden keine Admin-Notizen, Locks, User, Rollen oder Sessions geaendert.',
      'Der Audit-Eintrag ist eindeutig als RDAP36-Test markiert und enthaelt keine Secrets.'
    ]
  };
}

async function buildAdminAuditTestInsertStatus({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'status' });
  return {
    status: 200,
    body: {
      ...base,
      ok: true,
      reason: 'audit_test_insert_route_ready',
      writeExecuted: false,
      readBackPerformed: false
    }
  };
}

async function runAdminAuditTestInsert({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'test_insert' });
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};

  if (!isLocalRequest(req)) {
    return {
      status: 403,
      body: {
        ...base,
        ok: false,
        reason: 'local_request_required',
        error: 'local_request_required',
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        reason: 'confirm_write_required',
        error: 'confirm_write_required',
        confirmWriteAccepted: false,
        confirm,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  if (body.testOnly !== true && body.test_only !== true) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        reason: 'test_only_required',
        error: 'test_only_required',
        confirmWriteAccepted: true,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  if (!base.database.configured || !base.database.driverAvailable) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        reason: base.database.error || 'db_not_ready',
        error: base.database.error || 'db_not_ready',
        confirmWriteAccepted: true,
        writeExecuted: false,
        readBackPerformed: false
      }
    };
  }

  const auditUid = buildAuditUid();
  const now = new Date();
  const safeMetadata = {
    step: MODULE_BUILD,
    testOnly: true,
    purpose: 'controlled_audit_test_insert_after_schema_migration',
    productiveAction: false,
    adminNoteWrite: false,
    lockWrite: false,
    generatedAt: now.toISOString()
  };

  const row = {
    audit_uid: auditUid,
    actor_user_uid: safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap36-local-test', 64),
    actor_display_name: safeString(body.actorDisplayName || body.actor_display_name || 'RDAP36 Local Test', 120),
    actor_login: safeString(body.actorLogin || body.actor_login || 'rdap36-local-test', 128),
    source: 'remote-modboard/rdap36',
    action: 'admin.audit.test_insert',
    resource_type: 'admin_audit_test',
    permission_key: 'admin.audit.test',
    resource_key: `audit:test:${auditUid}`,
    status: 'success',
    error_code: null,
    old_value_summary: null,
    new_value_summary: 'RDAP36 kontrollierter Audit-Testinsert; keine produktive Admin-Aktion.',
    safe_metadata_json: JSON.stringify(safeMetadata),
    completed_at: now
  };

  try {
    return await withWriteConnection(context.config, async (connection) => {
      await connection.execute(
        `INSERT INTO dashboard_audit_log
          (audit_uid, actor_user_uid, actor_display_name, actor_login, source, action, resource_type,
           permission_key, resource_key, status, error_code, old_value_summary, new_value_summary,
           safe_metadata_json, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.audit_uid,
          row.actor_user_uid,
          row.actor_display_name,
          row.actor_login,
          row.source,
          row.action,
          row.resource_type,
          row.permission_key,
          row.resource_key,
          row.status,
          row.error_code,
          row.old_value_summary,
          row.new_value_summary,
          row.safe_metadata_json,
          row.completed_at
        ]
      );

      const [readRows] = await connection.execute(
        `SELECT id, audit_uid, created_at, completed_at, actor_user_uid, actor_display_name, actor_login,
                source, action, resource_type, permission_key, resource_key, status, error_code,
                old_value_summary, new_value_summary
           FROM dashboard_audit_log
          WHERE audit_uid = ?
          LIMIT 1`,
        [auditUid]
      );

      const readBack = readRows && readRows[0] ? sanitizeAuditRow(readRows[0]) : null;

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          reason: 'audit_test_insert_executed',
          confirmWriteAccepted: true,
          testOnly: true,
          writeExecuted: true,
          databaseWriteExecuted: true,
          readBackPerformed: true,
          readBackFound: Boolean(readBack),
          insertedAuditUid: auditUid,
          audit: readBack,
          productiveWritesEnabled: false,
          writesStillBlockedForProductiveActions: true,
          adminNoteWriteExecuted: false,
          lockWriteExecuted: false
        }
      };
    });
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      status: 500,
      body: {
        ...base,
        ok: false,
        reason: publicError || 'audit_test_insert_failed',
        error: publicError || 'audit_test_insert_failed',
        confirmWriteAccepted: true,
        testOnly: true,
        writeExecuted: false,
        databaseWriteExecuted: false,
        readBackPerformed: false
      }
    };
  }
}

function isLocalRequest(req) {
  const ip = String((req && req.ip) || (req && req.socket && req.socket.remoteAddress) || '');
  const forwardedFor = req && req.headers ? String(req.headers['x-forwarded-for'] || '') : '';
  if (forwardedFor && !/^127\.0\.0\.1$|^::1$|^::ffff:127\.0\.0\.1$/.test(forwardedFor.split(',')[0].trim())) {
    return false;
  }
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '::ffff:127.0.0.1';
}

function buildRequestInfo(req) {
  return {
    ip: req && req.ip ? req.ip : null,
    remoteAddress: req && req.socket ? req.socket.remoteAddress : null,
    method: req && req.method ? req.method : null,
    path: req && req.path ? req.path : null,
    userAgentPresent: Boolean(req && req.headers && req.headers['user-agent'])
  };
}

function buildAuditUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap36_audit_test_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function safeString(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

function sanitizeAuditRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row || {})) {
    if (/metadata|token|secret|password|cookie|session/i.test(key)) {
      result[key] = '[redacted]';
      continue;
    }
    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }
    result[key] = value;
  }
  return result;
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildAdminAuditTestInsertStatus,
  runAdminAuditTestInsert
};
