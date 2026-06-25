'use strict';

const crypto = require('crypto');
const { buildDatabaseReadiness, withWriteConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');

const MODULE = 'remote_admin_lock_test';
const MODULE_BUILD = 'RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED';
const STATUS_API_VERSION = 'rdap_lock37.v1';
const LOCK_TABLE = 'dashboard_locks';

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
    statusRoute: '/api/remote/admin/locks/test/status',
    route: '/api/remote/admin/locks/test-cycle',
    tableName: LOCK_TABLE,
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
    auditProductiveInsertEnabled: false,
    createsTestLock: action === 'test_cycle',
    updatesTestLock: action === 'test_cycle',
    deletesLock: false,
    physicalDeleteEnabled: false,
    uiWriteButtonsEnabled: false,
    lockAcquireEnabled: true,
    lockHeartbeatEnabled: true,
    lockReleaseEnabled: true,
    lockForceTakeoverEnabled: false,
    database: readiness,
    safety: context ? context.safety : null,
    request: buildRequestInfo(req),
    notes: [
      'RDAP37 ist nur fuer einen kontrollierten lokalen Lock-Test.',
      'Die Route akzeptiert nur lokale Requests von 127.0.0.1/::1.',
      'confirmWrite muss im JSON-Body stehen; Query-Confirm wird bewusst nicht genutzt.',
      'testOnly=true ist Pflicht.',
      'Es werden keine Admin-Notizen, User, Rollen oder Sessions geaendert.',
      'Der Test-Lock wird eindeutig als RDAP37-Test markiert und am Ende per Release geschlossen.',
      'Es wird nichts physisch geloescht.'
    ]
  };
}

async function buildAdminLockTestStatus({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'status' });
  return {
    status: 200,
    body: {
      ...base,
      ok: true,
      reason: 'lock_test_route_ready',
      writeExecuted: false,
      readBackPerformed: false
    }
  };
}

async function runAdminLockTestCycle({ context, req } = {}) {
  const base = buildStatusBase({ context, req, action: 'test_cycle' });
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};

  if (!isLocalRequest(req)) {
    return blocked(base, 403, 'local_request_required', {
      writeExecuted: false,
      readBackPerformed: false
    });
  }

  const confirm = requireAdminConfirmWrite({ body });
  if (!confirm.confirmWriteAccepted) {
    return blocked(base, 400, 'confirm_write_required', {
      confirmWriteAccepted: false,
      confirm,
      writeExecuted: false,
      readBackPerformed: false
    });
  }

  if (body.testOnly !== true && body.test_only !== true) {
    return blocked(base, 400, 'test_only_required', {
      confirmWriteAccepted: true,
      writeExecuted: false,
      readBackPerformed: false
    });
  }

  if (!base.database.configured || !base.database.driverAvailable) {
    return blocked(base, 503, base.database.error || 'db_not_ready', {
      confirmWriteAccepted: true,
      writeExecuted: false,
      readBackPerformed: false
    });
  }

  const lockUid = buildLockUid();
  const now = new Date();
  const heartbeatAt = new Date(now.getTime() + 15000);
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  const releaseAt = new Date(now.getTime() + 30000);
  const resourceKey = safeString(body.resourceKey || body.resource_key || `rdap37:test:${lockUid}`, 180);
  const actorUserUid = safeString(body.actorUserUid || body.actor_user_uid || 'system:rdap37-local-test', 128);
  const actorLogin = safeString(body.actorLogin || body.actor_login || 'rdap37-local-test', 128);
  const clientId = safeString(body.clientId || body.client_id || 'rdap37-local-cli', 128);
  const editSessionId = safeString(body.editSessionId || body.edit_session_id || `rdap37-session-${lockUid}`, 180);

  try {
    return await withWriteConnection(context.config, async (connection) => {
      const schema = await readLockSchema(connection);
      const compatibility = buildCompatibility(schema);

      if (!schema.tableExists) {
        return {
          status: 500,
          body: {
            ...base,
            ok: false,
            reason: 'lock_table_missing',
            error: 'lock_table_missing',
            confirmWriteAccepted: true,
            testOnly: true,
            writeExecuted: false,
            readBackPerformed: false,
            schema,
            compatibility
          }
        };
      }

      if (!compatibility.compatibleForTestWrite) {
        return {
          status: 500,
          body: {
            ...base,
            ok: false,
            reason: 'lock_schema_not_compatible_for_test_write',
            error: 'lock_schema_not_compatible_for_test_write',
            confirmWriteAccepted: true,
            testOnly: true,
            writeExecuted: false,
            readBackPerformed: false,
            schema,
            compatibility
          }
        };
      }

      const insertPlan = buildInsertPlan(schema, {
        lockUid,
        resourceKey,
        actorUserUid,
        actorLogin,
        clientId,
        editSessionId,
        now,
        expiresAt
      });

      await connection.execute(insertPlan.sql, insertPlan.values);
      const afterAcquire = await readLockByIdentifier(connection, schema, lockUid, resourceKey);

      const heartbeatPlan = buildHeartbeatPlan(schema, {
        lockUid,
        resourceKey,
        heartbeatAt,
        expiresAt
      });
      await connection.execute(heartbeatPlan.sql, heartbeatPlan.values);
      const afterHeartbeat = await readLockByIdentifier(connection, schema, lockUid, resourceKey);

      const releasePlan = buildReleasePlan(schema, {
        lockUid,
        resourceKey,
        releaseAt
      });
      await connection.execute(releasePlan.sql, releasePlan.values);
      const afterRelease = await readLockByIdentifier(connection, schema, lockUid, resourceKey);

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          reason: 'lock_test_cycle_executed',
          confirmWriteAccepted: true,
          testOnly: true,
          writeExecuted: true,
          databaseWriteExecuted: true,
          readBackPerformed: true,
          readBackFoundAfterAcquire: Boolean(afterAcquire),
          readBackFoundAfterHeartbeat: Boolean(afterHeartbeat),
          readBackFoundAfterRelease: Boolean(afterRelease),
          insertedLockUid: lockUid,
          resourceKey,
          schema,
          compatibility,
          lock: {
            afterAcquire,
            afterHeartbeat,
            afterRelease
          },
          operations: {
            acquired: Boolean(afterAcquire),
            heartbeat: Boolean(afterHeartbeat),
            released: Boolean(afterRelease && String(afterRelease.status || '').toLowerCase() === 'released')
          },
          productiveWritesEnabled: false,
          writesStillBlockedForProductiveActions: true,
          adminNoteWriteExecuted: false,
          auditProductiveWriteExecuted: false,
          lockTestWriteExecuted: true,
          physicalDeleteExecuted: false,
          uiWriteButtonsEnabled: false
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
        reason: publicError || 'lock_test_cycle_failed',
        error: publicError || 'lock_test_cycle_failed',
        confirmWriteAccepted: true,
        testOnly: true,
        writeExecuted: false,
        databaseWriteExecuted: false,
        readBackPerformed: false,
        adminNoteWriteExecuted: false,
        auditProductiveWriteExecuted: false,
        physicalDeleteExecuted: false
      }
    };
  }
}

function blocked(base, status, reason, extra) {
  return {
    status,
    body: {
      ...base,
      ok: false,
      reason,
      error: reason,
      ...extra
    }
  };
}

async function readLockSchema(connection) {
  const [tableRows] = await connection.query(
    `SELECT TABLE_NAME AS table_name
       FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1`,
    [LOCK_TABLE]
  );

  const tableExists = Array.isArray(tableRows) && tableRows.length > 0;
  if (!tableExists) {
    return {
      tableExists: false,
      columns: [],
      detectedColumns: [],
      detectedTypes: {}
    };
  }

  const [columnRows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
    [LOCK_TABLE]
  );

  const columns = columnRows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type
  })).filter((row) => row.name);

  return {
    tableExists: true,
    columns,
    detectedColumns: columns.map((row) => row.name),
    detectedTypes: Object.fromEntries(columns.map((row) => [row.name, row.dataType]))
  };
}

function buildCompatibility(schema) {
  const set = new Set(schema.detectedColumns || []);
  const identifierColumn = set.has('lock_uid') ? 'lock_uid' : (set.has('lock_id') ? 'lock_id' : null);
  const ownerColumn = set.has('owner_user_uid') ? 'owner_user_uid' : (set.has('user_uid') ? 'user_uid' : null);
  const required = ['resource_key', 'status', 'heartbeat_at', 'expires_at'];
  const missing = required.filter((column) => !set.has(column));
  if (!identifierColumn) missing.push('lock_uid_or_lock_id');
  if (!ownerColumn) missing.push('owner_user_uid_or_user_uid');

  return {
    compatibleForTestWrite: schema.tableExists && missing.length === 0,
    identifierColumn,
    ownerColumn,
    hasLockUid: set.has('lock_uid'),
    hasLockId: set.has('lock_id'),
    hasOwnerUserUid: set.has('owner_user_uid'),
    hasUserUid: set.has('user_uid'),
    missingRequiredColumns: missing
  };
}

function buildInsertPlan(schema, values) {
  const set = new Set(schema.detectedColumns || []);
  const row = {};

  setIf(row, set, 'lock_uid', values.lockUid);
  setIf(row, set, 'lock_id', values.lockUid);
  setIf(row, set, 'resource_type', 'admin_lock_test');
  setIf(row, set, 'resource_key', values.resourceKey);
  setIf(row, set, 'version_token', `rdap37-${values.lockUid}`);
  if (set.has('resource_version')) {
    row.resource_version = numberLikeColumn(schema, 'resource_version') ? 1 : `rdap37-${values.lockUid}`;
  }
  setIf(row, set, 'edit_session_id', values.editSessionId);
  setIf(row, set, 'owner_user_uid', values.actorUserUid);
  setIf(row, set, 'user_uid', values.actorUserUid);
  setIf(row, set, 'owner_login', values.actorLogin);
  setIf(row, set, 'client_id', values.clientId);
  setIf(row, set, 'status', 'active');
  setIf(row, set, 'heartbeat_at', values.now);
  setIf(row, set, 'expires_at', values.expiresAt);
  setIf(row, set, 'created_at', values.now);
  setIf(row, set, 'updated_at', values.now);
  setIf(row, set, 'released_at', null);

  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(', ');
  return {
    sql: `INSERT INTO ${LOCK_TABLE} (${columns.join(', ')}) VALUES (${placeholders})`,
    values: columns.map((column) => row[column])
  };
}

function buildHeartbeatPlan(schema, values) {
  const set = new Set(schema.detectedColumns || []);
  const assignments = [];
  const params = [];

  addAssignment(assignments, params, set, 'heartbeat_at', values.heartbeatAt);
  addAssignment(assignments, params, set, 'expires_at', values.expiresAt);
  addAssignment(assignments, params, set, 'updated_at', values.heartbeatAt);
  addAssignment(assignments, params, set, 'status', 'active');

  const where = buildWhereClause(schema, values.lockUid, values.resourceKey, params);
  return {
    sql: `UPDATE ${LOCK_TABLE} SET ${assignments.join(', ')} WHERE ${where} LIMIT 1`,
    values: params
  };
}

function buildReleasePlan(schema, values) {
  const set = new Set(schema.detectedColumns || []);
  const assignments = [];
  const params = [];

  addAssignment(assignments, params, set, 'status', 'released');
  addAssignment(assignments, params, set, 'released_at', values.releaseAt);
  addAssignment(assignments, params, set, 'updated_at', values.releaseAt);

  const where = buildWhereClause(schema, values.lockUid, values.resourceKey, params);
  return {
    sql: `UPDATE ${LOCK_TABLE} SET ${assignments.join(', ')} WHERE ${where} LIMIT 1`,
    values: params
  };
}

function buildWhereClause(schema, lockUid, resourceKey, params) {
  const set = new Set(schema.detectedColumns || []);
  if (set.has('lock_uid')) {
    params.push(lockUid);
    return 'lock_uid = ?';
  }
  if (set.has('lock_id')) {
    params.push(lockUid);
    return 'lock_id = ?';
  }
  params.push(resourceKey);
  return 'resource_key = ?';
}

async function readLockByIdentifier(connection, schema, lockUid, resourceKey) {
  const set = new Set(schema.detectedColumns || []);
  const allowed = [
    'id',
    'lock_uid',
    'lock_id',
    'resource_type',
    'resource_key',
    'version_token',
    'resource_version',
    'owner_user_uid',
    'user_uid',
    'edit_session_id',
    'client_id',
    'status',
    'heartbeat_at',
    'expires_at',
    'created_at',
    'updated_at',
    'released_at'
  ];
  const columns = allowed.filter((column) => set.has(column));
  if (!columns.length) return null;

  const params = [];
  const where = buildWhereClause(schema, lockUid, resourceKey, params);
  const [rows] = await connection.execute(
    `SELECT ${columns.join(', ')} FROM ${LOCK_TABLE} WHERE ${where} LIMIT 1`,
    params
  );

  return rows && rows[0] ? sanitizeLockRow(rows[0]) : null;
}

function addAssignment(assignments, params, set, column, value) {
  if (!set.has(column)) return;
  assignments.push(`${column} = ?`);
  params.push(value);
}

function setIf(row, set, column, value) {
  if (!set.has(column)) return;
  row[column] = value;
}

function numberLikeColumn(schema, column) {
  const type = schema && schema.detectedTypes ? String(schema.detectedTypes[column] || '') : '';
  return /int|decimal|numeric|float|double|bit|bool/i.test(type);
}

function isLocalRequest(req) {
  const ip = String((req && req.ip) || (req && req.socket && req.socket.remoteAddress) || '');
  const forwardedFor = req && req.headers ? String(req.headers['x-forwarded-for'] || '') : '';
  if (forwardedFor && !/^127\.0\.0\.1$|^::1$|^::ffff:127\.0\.0\.1$/.test(forwardedFor.split(',')[0].trim())) {
    return false;
  }
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
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

function buildLockUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap37_lock_test_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function safeString(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

function sanitizeLockRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row || {})) {
    if (/token|secret|password|cookie|session/i.test(key) && key !== 'version_token' && key !== 'edit_session_id') {
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
  buildAdminLockTestStatus,
  runAdminLockTestCycle
};
