'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_admin_user_admin_note_diagnostic';
const MODULE_BUILD = 'RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC';
const STATUS_API_VERSION = 'rdap_admin_users14.v1';

const TABLE_NAME = 'dashboard_user_admin_notes';
const REQUIRED_COLUMNS = Object.freeze([
  'id',
  'note_uid',
  'target_user_uid',
  'note_text',
  'status',
  'created_by_user_uid',
  'created_at',
  'updated_at'
]);

const PLANNED_ACTION = 'admin.users.note.set';
const PLANNED_PERMISSION = 'admin.users.note.write';
const PLANNED_LOCK_SCOPE = 'admin:user-note:<target_user_uid>';

async function buildAdminUserAdminNoteDiagnostic({ context } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  const base = buildBaseBody(context, readiness);

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        databaseReadable: false,
        tableExists: false,
        schemaReady: false,
        migrationRequired: true,
        reason: readiness.error || 'db_not_ready',
        dbError: readiness.error || null
      }
    };
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const tableExists = await readTableExists(connection, TABLE_NAME);
      const existingColumns = tableExists ? await readColumns(connection, TABLE_NAME) : [];
      const missingColumns = REQUIRED_COLUMNS.filter((columnName) => !existingColumns.includes(columnName));
      const rowCount = tableExists ? await readRowCount(connection, TABLE_NAME) : null;
      const schemaReady = tableExists && missingColumns.length === 0;

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          databaseReadable: true,
          tableExists,
          existingColumns,
          requiredColumns: REQUIRED_COLUMNS.slice(),
          missingColumns,
          rowCount,
          schemaReady,
          migrationRequired: !schemaReady,
          reason: schemaReady ? 'admin_note_table_ready_readonly' : 'admin_note_table_missing_or_incomplete',
          plannedMigration: buildPlannedMigrationSummary(),
          nextAllowedSteps: [
            'RDAP15 darf hoechstens eine weiterhin disabled Migration-/Route-Foundation planen.',
            'Eine echte Migration braucht separaten Backup-/Rollback-Plan und ausdrueckliches Go.',
            'Ein echter Admin-Notiz-Write darf erst nach bestaetigter Tabelle, Permission, Confirm, Audit, Lock und Read-Back gebaut werden.'
          ]
        }
      };
    });
  } catch (err) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        databaseReadable: false,
        tableExists: false,
        schemaReady: false,
        migrationRequired: true,
        reason: 'db_read_failed',
        dbError: publicDbError(err)
      }
    };
  }
}

function buildBaseBody(context, readiness) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    diagnosticBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    route: '/api/remote/admin/users/admin-note-diagnostic',
    tableName: TABLE_NAME,
    writeEnabled: false,
    databaseWriteEnabled: false,
    migrationEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    uiWriteButtonsEnabled: false,
    createsTable: false,
    insertsNote: false,
    updatesNote: false,
    deletesNote: false,
    auditInsertEnabled: false,
    lockAcquireEnabled: false,
    backupExecuted: false,
    rollbackExecuted: false,
    plannedAction: PLANNED_ACTION,
    plannedPermission: PLANNED_PERMISSION,
    plannedLockScope: PLANNED_LOCK_SCOPE,
    confirmWriteRequiredForFutureWrite: true,
    auditRequiredForFutureWrite: true,
    lockRequiredForFutureWrite: true,
    readBackRequiredForFutureWrite: true,
    database: readiness
  };
}

async function readTableExists(connection, tableName) {
  const [rows] = await connection.query(`
    SELECT TABLE_NAME AS table_name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    LIMIT 1
  `, [tableName]);

  return rows.length > 0;
}

async function readColumns(connection, tableName) {
  const [rows] = await connection.query(`
    SELECT COLUMN_NAME AS column_name
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION ASC
  `, [tableName]);

  return rows.map((row) => row.column_name).filter(Boolean);
}

async function readRowCount(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${TABLE_NAME}`);
  const first = rows && rows[0] ? rows[0] : {};
  const value = Number(first.count_value);
  return Number.isFinite(value) ? value : null;
}

function buildPlannedMigrationSummary() {
  return {
    executeInThisStep: false,
    tableName: TABLE_NAME,
    statementType: 'CREATE TABLE IF NOT EXISTS',
    requiresSeparateGo: true,
    requiresBackupBeforeExecution: true,
    requiresRollbackPlanBeforeExecution: true,
    notes: [
      'Diese Route fuehrt keine Migration aus.',
      'RDAP14 prueft nur lesend, ob die spaetere Admin-Notiz-Tabelle vorhanden ist.',
      'SQL darf erst in einem separaten Migration-Step mit Backup/Rollback ausgefuehrt werden.'
    ]
  };
}

module.exports = {
  buildAdminUserAdminNoteDiagnostic
};
