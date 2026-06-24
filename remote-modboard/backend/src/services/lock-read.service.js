'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const LOCK_TABLE = 'dashboard_locks';
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

async function buildLockReadStatus({ context, req }) {
  const readiness = buildDatabaseReadiness(context.config);
  const inspectSchema = req && req.query && req.query.db === '1';
  const base = {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_lock_read',
    moduleBuild: context.moduleBuild,
    statusApiVersion: 'rdap11.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    lockReadPrepared: true,
    lockWritePrepared: false,
    lockWriteEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
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
      name: LOCK_TABLE,
      inspected: false,
      detected: null,
      expectedColumns: EXPECTED_LOCK_COLUMNS,
      detectedColumns: [],
      missingExpectedColumns: []
    },
    safety: context.safety,
    notes: [
      'RDAP11 liest Lock-Informationen nur diagnostisch.',
      'Dieser Service erstellt, verlaengert, uebernimmt oder loescht keine Locks.',
      'Schema-Inspektion erfolgt nur bei db=1 und nur per SELECT/INFORMATION_SCHEMA.',
      'Produktive Lock-Writes bleiben deaktiviert.'
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
    const columns = await readTableColumns(context.config, LOCK_TABLE);
    return {
      ...base,
      table: buildTableStatus(LOCK_TABLE, columns, EXPECTED_LOCK_COLUMNS),
      reason: 'lock_schema_inspected_readonly'
    };
  } catch (err) {
    const publicError = publicDbError(err).code;
    return {
      ...base,
      ok: false,
      reason: publicError || 'lock_schema_read_failed',
      error: publicError || 'lock_schema_read_failed'
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
  buildLockReadStatus,
  EXPECTED_LOCK_COLUMNS
};
