'use strict';

const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_admin_user_admin_note_read_diagnostic';
const MODULE_BUILD = 'RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC_READONLY';
const STATUS_API_VERSION = 'rdap_admin_users17.v1';
const TABLE_NAME = 'dashboard_user_admin_notes';
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

async function buildAdminUserAdminNoteReadDiagnostic({ context, req } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);
  const query = req && req.query ? req.query : {};
  const targetUserUid = normalizeTargetUserUid(query.targetUserUid || query.target_user_uid || '');
  const limit = normalizeLimit(query.limit);
  const base = buildBaseBody(context, readiness, { targetUserUid, limit });

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        databaseReadable: false,
        tableExists: false,
        schemaReady: false,
        reason: readiness.error || 'db_not_ready',
        dbError: readiness.error || null
      }
    };
  }

  try {
    return await withReadOnlyConnection(config, async (connection) => {
      const tableExists = await readTableExists(connection);
      if (!tableExists) {
        return {
          status: 200,
          body: {
            ...base,
            ok: true,
            databaseReadable: true,
            tableExists: false,
            schemaReady: false,
            reason: 'admin_note_table_missing',
            totalCount: null,
            notes: []
          }
        };
      }

      const totalCount = await readTotalCount(connection);
      const targetSummary = targetUserUid ? await readTargetSummary(connection, targetUserUid) : null;
      const notes = targetUserUid ? await readTargetNotesRedacted(connection, targetUserUid, limit) : [];

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          databaseReadable: true,
          tableExists: true,
          schemaReady: true,
          reason: 'admin_note_read_diagnostic_ready_readonly',
          totalCount,
          targetSummary,
          notes,
          notesRedacted: true,
          noteTextReturned: false,
          requiresFutureAuthForRealDisplay: true
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
        reason: 'db_read_failed',
        dbError: publicDbError(err)
      }
    };
  }
}

function buildBaseBody(context, readiness, { targetUserUid, limit }) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    diagnosticBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    route: '/api/remote/admin/users/admin-note-read-diagnostic',
    tableName: TABLE_NAME,
    targetUserUid: targetUserUid || null,
    limit,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    uiWriteButtonsEnabled: false,
    createsTable: false,
    insertsNote: false,
    updatesNote: false,
    deletesNote: false,
    returnsNoteText: false,
    noteTextIsRedacted: true,
    authRequiredBeforeRealDisplay: true,
    plannedFutureDisplayRouteRequiresPermission: 'admin.users.note.read',
    plannedFutureWritePermission: 'admin.users.note.write',
    database: readiness
  };
}

function normalizeTargetUserUid(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/^[a-zA-Z0-9:_-]{1,128}$/.test(trimmed)) return '';
  return trimmed;
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

async function readTableExists(connection) {
  const [rows] = await connection.query(
    `SELECT TABLE_NAME AS table_name
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
     LIMIT 1`,
    [TABLE_NAME]
  );
  return rows.length > 0;
}

async function readTotalCount(connection) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${TABLE_NAME}`);
  return numberFromFirstRow(rows, 'count_value');
}

async function readTargetSummary(connection, targetUserUid) {
  const [rows] = await connection.query(
    `SELECT
       COUNT(*) AS total_count,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
       MAX(updated_at) AS last_updated_at
     FROM ${TABLE_NAME}
     WHERE target_user_uid = ?`,
    [targetUserUid]
  );
  const first = rows && rows[0] ? rows[0] : {};
  return {
    totalCount: numberValue(first.total_count),
    activeCount: numberValue(first.active_count),
    lastUpdatedAt: first.last_updated_at || null
  };
}

async function readTargetNotesRedacted(connection, targetUserUid, limit) {
  const [rows] = await connection.query(
    `SELECT note_uid, target_user_uid, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
     FROM ${TABLE_NAME}
     WHERE target_user_uid = ?
     ORDER BY updated_at DESC, id DESC
     LIMIT ?`,
    [targetUserUid, limit]
  );
  return rows.map((row) => ({
    noteUid: row.note_uid,
    targetUserUid: row.target_user_uid,
    status: row.status,
    createdByUserUid: row.created_by_user_uid || null,
    updatedByUserUid: row.updated_by_user_uid || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    noteText: null,
    noteTextRedacted: true
  }));
}

function numberFromFirstRow(rows, key) {
  const first = rows && rows[0] ? rows[0] : {};
  return numberValue(first[key]);
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = { buildAdminUserAdminNoteReadDiagnostic };
