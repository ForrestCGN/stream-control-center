'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_admin_audit_lock_schema_status_readonly';
const MODULE_BUILD = 'RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY';
const STATUS_API_VERSION = 'rdap_audit_lock33.v1';

const AUDIT_TABLE = 'dashboard_audit_log';
const LOCK_TABLE = 'dashboard_locks';

const EXPECTED_AUDIT_COLUMNS = [
  'id',
  'request_id',
  'correlation_id',
  'actor_user_uid',
  'actor_login',
  'action',
  'resource_type',
  'resource_key',
  'status',
  'error_code',
  'safe_metadata_json',
  'created_at',
  'completed_at'
];

const EXPECTED_LOCK_COLUMNS = [
  'id',
  'lock_id',
  'resource_type',
  'resource_key',
  'resource_version',
  'edit_session_id',
  'user_uid',
  'client_id',
  'heartbeat_at',
  'expires_at',
  'created_at',
  'updated_at',
  'released_at'
];

const AUDIT_PREVIEW_COLUMNS = [
  'id',
  'audit_uid',
  'request_id',
  'correlation_id',
  'actor_user_uid',
  'actor_login',
  'actor_display_name',
  'source',
  'action',
  'permission_key',
  'resource_type',
  'resource_key',
  'status',
  'error_code',
  'created_at',
  'completed_at'
];

const LOCK_PREVIEW_COLUMNS = [
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

async function buildAdminAuditLockSchemaStatusReadonly({ context, req } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  const limit = normalizeLimit(req && req.query ? req.query.limit : null);

  const base = {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    route: '/api/remote/admin/audit-lock/schema-status',
    aliases: ['/api/remote/lock-audit/schema-status'],
    limit,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    migrationEnabled: false,
    createsTables: false,
    insertsAudit: false,
    insertsLocks: false,
    updatesLocks: false,
    deletesLocks: false,
    uiWriteButtonsEnabled: false,
    physicalDeleteEnabled: false,
    database: readiness,
    safety: context ? context.safety : null,
    notes: [
      'RDAP33 liest Audit-/Lock-Schema und Runtime-Status nur read-only.',
      'Es werden nur SELECT/INFORMATION_SCHEMA-Abfragen ausgefuehrt.',
      'Es werden keine Audit-Eintraege geschrieben und keine Locks erstellt, verlaengert, uebernommen oder geloescht.',
      'Preview-Daten enthalten keine safe_metadata_json-Inhalte und keine Secrets.'
    ]
  };

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        reason: readiness.error || 'db_not_ready',
        error: readiness.error || 'db_not_ready'
      }
    };
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const [audit, locks] = await Promise.all([
        readAuditStatus(connection, limit),
        readLockStatus(connection, limit)
      ]);

      return {
        status: 200,
        body: {
          ...base,
          ok: Boolean(audit.ok && locks.ok),
          reason: 'audit_lock_schema_status_readonly',
          audit,
          locks,
          recommendedNextStep: buildRecommendedNextStep(audit, locks)
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
        reason: publicError || 'audit_lock_schema_status_failed',
        error: publicError || 'audit_lock_schema_status_failed'
      }
    };
  }
}

async function readAuditStatus(connection, limit) {
  const table = await readTableStatus(connection, AUDIT_TABLE, EXPECTED_AUDIT_COLUMNS);
  if (!table.tableExists) {
    return {
      ok: false,
      table,
      rowCount: null,
      latest: [],
      actionSummary: [],
      compatibleForRead: false,
      compatibleForWriteCandidate: false,
      writeEnabled: false,
      reason: 'audit_table_missing'
    };
  }

  const detected = new Set(table.detectedColumns);
  const rowCount = await readRowCount(connection, AUDIT_TABLE);
  const latest = await readLatestRows(connection, AUDIT_TABLE, detected, AUDIT_PREVIEW_COLUMNS, limit);
  const actionSummary = detected.has('action')
    ? await readGroupedCount(connection, AUDIT_TABLE, 'action', 10)
    : [];

  const requiredWriteCandidate = ['actor_user_uid', 'action', 'resource_type', 'resource_key', 'status', 'created_at'];
  const missingWriteCandidateColumns = requiredWriteCandidate.filter((column) => !detected.has(column));

  return {
    ok: true,
    table,
    rowCount,
    latest,
    actionSummary,
    compatibleForRead: table.missingExpectedColumns.filter((column) => column !== 'safe_metadata_json' && column !== 'completed_at' && column !== 'error_code').length === 0,
    compatibleForWriteCandidate: missingWriteCandidateColumns.length === 0,
    missingWriteCandidateColumns,
    writeEnabled: false,
    auditInsertEnabled: false,
    reason: 'audit_status_readonly'
  };
}

async function readLockStatus(connection, limit) {
  const table = await readTableStatus(connection, LOCK_TABLE, EXPECTED_LOCK_COLUMNS);
  if (!table.tableExists) {
    return {
      ok: false,
      table,
      rowCount: null,
      latest: [],
      activeCount: null,
      expiredCount: null,
      statusSummary: [],
      compatibleForRead: false,
      compatibleForWriteCandidate: false,
      writeEnabled: false,
      reason: 'lock_table_missing'
    };
  }

  const detected = new Set(table.detectedColumns);
  const rowCount = await readRowCount(connection, LOCK_TABLE);
  const latest = await readLatestRows(connection, LOCK_TABLE, detected, LOCK_PREVIEW_COLUMNS, limit);
  const statusSummary = detected.has('status')
    ? await readGroupedCount(connection, LOCK_TABLE, 'status', 10)
    : [];
  const activeCount = await readActiveLockCount(connection, detected);
  const expiredCount = await readExpiredLockCount(connection, detected);

  const requiredWriteCandidate = ['resource_key', 'status', 'heartbeat_at', 'expires_at'];
  const hasLockId = detected.has('lock_uid') || detected.has('lock_id');
  const hasOwner = detected.has('owner_user_uid') || detected.has('user_uid');
  const missingWriteCandidateColumns = requiredWriteCandidate.filter((column) => !detected.has(column));
  if (!hasLockId) missingWriteCandidateColumns.push('lock_uid_or_lock_id');
  if (!hasOwner) missingWriteCandidateColumns.push('owner_user_uid_or_user_uid');

  return {
    ok: true,
    table,
    rowCount,
    latest,
    activeCount,
    expiredCount,
    statusSummary,
    compatibleForRead: hasLockId && detected.has('resource_key') && hasOwner,
    compatibleForWriteCandidate: missingWriteCandidateColumns.length === 0,
    missingWriteCandidateColumns,
    writeEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
    reason: 'lock_status_readonly'
  };
}

async function readTableStatus(connection, tableName, expectedColumns) {
  const [tableRows] = await connection.query(
    `SELECT TABLE_NAME AS table_name
       FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1`,
    [tableName]
  );

  const tableExists = Array.isArray(tableRows) && tableRows.length > 0;
  if (!tableExists) {
    return {
      name: tableName,
      inspected: true,
      tableExists: false,
      schemaReady: false,
      expectedColumns,
      detectedColumns: [],
      missingExpectedColumns: expectedColumns.slice(),
      extraColumns: []
    };
  }

  const [columnRows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
    [tableName]
  );

  const detectedColumns = columnRows.map((row) => row.column_name).filter(Boolean);
  const detectedSet = new Set(detectedColumns);
  const expectedSet = new Set(expectedColumns);

  return {
    name: tableName,
    inspected: true,
    tableExists: true,
    schemaReady: expectedColumns.every((column) => detectedSet.has(column)),
    expectedColumns,
    detectedColumns,
    missingExpectedColumns: expectedColumns.filter((column) => !detectedSet.has(column)),
    extraColumns: detectedColumns.filter((column) => !expectedSet.has(column))
  };
}

async function readRowCount(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${tableName}`);
  return normalizeNumber(rows && rows[0] ? rows[0].count_value : null);
}

async function readLatestRows(connection, tableName, detectedSet, allowedColumns, limit) {
  const columns = allowedColumns.filter((column) => detectedSet.has(column));
  if (!columns.length) return [];

  const orderColumn = detectedSet.has('id') ? 'id' : (detectedSet.has('created_at') ? 'created_at' : columns[0]);
  const sql = `SELECT ${columns.join(', ')} FROM ${tableName} ORDER BY ${orderColumn} DESC LIMIT ?`;
  const [rows] = await connection.query(sql, [limit]);

  return rows.map((row) => sanitizePreviewRow(row));
}

async function readGroupedCount(connection, tableName, column, limit) {
  const [rows] = await connection.query(
    `SELECT ${column} AS group_key, COUNT(*) AS count_value
       FROM ${tableName}
      GROUP BY ${column}
      ORDER BY count_value DESC
      LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    key: safeString(row.group_key, 120),
    count: normalizeNumber(row.count_value)
  }));
}

async function readActiveLockCount(connection, detectedSet) {
  if (!detectedSet.has('status')) return null;
  const [rows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${LOCK_TABLE} WHERE status = 'active'`);
  return normalizeNumber(rows && rows[0] ? rows[0].count_value : null);
}

async function readExpiredLockCount(connection, detectedSet) {
  if (!detectedSet.has('expires_at')) return null;
  const [rows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${LOCK_TABLE} WHERE expires_at IS NOT NULL AND expires_at < NOW()`);
  return normalizeNumber(rows && rows[0] ? rows[0].count_value : null);
}

function sanitizePreviewRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row || {})) {
    result[key] = sanitizePreviewValue(key, value);
  }
  return result;
}

function sanitizePreviewValue(key, value) {
  if (value === null || typeof value === 'undefined') return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const text = String(value);
  if (/token|secret|password|cookie|session/i.test(key)) return '[redacted]';
  return safeString(text, 240);
}

function safeString(value, maxLength) {
  const text = String(value || '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

function normalizeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeLimit(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(1, Math.min(25, Math.floor(num)));
}

function buildRecommendedNextStep(audit, locks) {
  const blockers = [];
  if (!audit || !audit.table || !audit.table.tableExists) blockers.push('audit_table_missing');
  if (!locks || !locks.table || !locks.table.tableExists) blockers.push('lock_table_missing');
  if (audit && audit.missingWriteCandidateColumns && audit.missingWriteCandidateColumns.length) blockers.push('audit_write_candidate_columns_missing');
  if (locks && locks.missingWriteCandidateColumns && locks.missingWriteCandidateColumns.length) blockers.push('lock_write_candidate_columns_missing');

  return {
    nextStep: blockers.length ? 'RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN' : 'RDAP34_ADMIN_AUDIT_TEST_INSERT_CONFIRMED',
    writesMayBeBuiltNow: blockers.length === 0,
    blockers,
    note: blockers.length
      ? 'Erst Schema/Migration/Mapping klaeren, keine Writes bauen.'
      : 'Schema wirkt fuer kontrollierten Audit-Testwrite geeignet; Lock-Writes weiterhin separat testen.'
  };
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildAdminAuditLockSchemaStatusReadonly
};
