'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const AUDIT_TABLE = 'dashboard_audit_log';
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

async function buildAuditReadStatus({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const inspectSchema = req && req.query && req.query.db === '1';
  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_audit_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap11.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    auditReadPrepared: true,
    auditWritePrepared: false,
    auditWriteEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    secretsLogged: false,
    rawPayloadLoggingEnabled: false,
    productiveAuthorizationEnabled: false,
    schemaInspectionRequested: inspectSchema,
    database: {
      configured: readiness.configured,
      driverAvailable: readiness.driverAvailable,
      writeEnabled: false,
      migrationEnabled: false,
      error: readiness.error
    },
    table: {
      name: AUDIT_TABLE,
      inspected: false,
      detected: null,
      expectedColumns: EXPECTED_AUDIT_COLUMNS,
      detectedColumns: [],
      missingExpectedColumns: []
    },
    safety: context.safety,
    notes: [
      'RDAP11 liest Audit-Struktur nur diagnostisch.',
      'Dieser Service schreibt keine Audit-Eintraege und aktualisiert keine bestehenden Zeilen.',
      'Schema-Inspektion erfolgt nur bei db=1 und nur per SELECT/INFORMATION_SCHEMA.',
      'Secrets, Tokens, Cookies, ENV-Werte und Rohpayloads duerfen nicht geloggt werden.'
    ]
  };

  if (!inspectSchema) return base;

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      ...base,
      ok: false,
      reason: readiness.error || 'db_not_ready'
    };
  }

  try {
    const columns = await readTableColumns(context.config, AUDIT_TABLE);
    return {
      ...base,
      table: buildTableStatus(AUDIT_TABLE, columns, EXPECTED_AUDIT_COLUMNS),
      reason: 'audit_schema_inspected_readonly'
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'audit_schema_read_failed',
      error: publicError || 'audit_schema_read_failed'
    };
  }
}

async function readTableColumns(config, tableName) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `
      SELECT COLUMN_NAME AS column_name
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION ASC
      `,
      [tableName]
    );

    return rows.map((row) => row.column_name).filter(Boolean);
  });
}

function buildTableStatus(tableName, detectedColumns, expectedColumns) {
  const detectedSet = new Set(detectedColumns);
  return {
    name: tableName,
    inspected: true,
    detected: detectedColumns.length > 0,
    expectedColumns,
    detectedColumns,
    missingExpectedColumns: expectedColumns.filter((column) => !detectedSet.has(column))
  };
}

module.exports = {
  buildAuditReadStatus,
  EXPECTED_AUDIT_COLUMNS
};
