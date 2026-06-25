'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_admin_user_admin_note_real_read_authed';
const MODULE_BUILD = 'RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED';
const STATUS_API_VERSION = 'rdap_admin_users27.v1';
const TABLE_NAME = 'dashboard_user_admin_notes';
const PERMISSION_KEY = 'admin.users.note.read';
const WRITE_PERMISSION_KEY = 'admin.users.note.write';
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const REQUIRED_COLUMNS = Object.freeze([
  'id',
  'note_uid',
  'target_user_uid',
  'note_text',
  'status',
  'created_by_user_uid',
  'updated_by_user_uid',
  'created_at',
  'updated_at'
]);

async function buildAdminUserAdminNoteRealReadAuthed({ context, req } = {}) {
  const config = context && context.config ? context.config : {};
  const query = req && req.query ? req.query : {};
  const sessionValidation = await validateSessionReadOnly({ config, req });
  const readiness = buildDatabaseReadiness(config);
  const targetUserUid = normalizeTargetUserUid(query.targetUserUid || query.target_user_uid || '');
  const limit = normalizeLimit(query.limit);
  const includeInactive = normalizeBoolean(query.includeInactive || query.include_inactive || query.all);
  const base = buildBaseBody(context, readiness, sessionValidation, {
    targetUserUid,
    limit,
    includeInactive
  });

  if (!sessionValidation.valid || !sessionValidation.userUid) {
    return {
      status: 401,
      body: {
        ...base,
        ok: false,
        loggedIn: false,
        dashboardAccess: false,
        canReadAdminNotes: false,
        reason: 'not_logged_in_or_session_invalid'
      }
    };
  }

  if (!targetUserUid) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: false,
        canReadAdminNotes: false,
        reason: 'missing_or_invalid_target_user_uid'
      }
    };
  }

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: false,
        canReadAdminNotes: false,
        reason: readiness.error || 'db_not_ready',
        error: readiness.error || 'db_not_ready'
      }
    };
  }

  try {
    const readContext = await readPermissionContextReadOnly({
      config,
      userUid: sessionValidation.userUid,
      permissionKey: PERMISSION_KEY,
      targetType: 'global',
      targetKey: '*'
    });

    const writeContext = await readPermissionContextReadOnly({
      config,
      userUid: sessionValidation.userUid,
      permissionKey: WRITE_PERMISSION_KEY,
      targetType: 'global',
      targetKey: '*'
    });

    const dashboardAccess = buildDashboardAccess(config, readContext.user, sessionValidation);
    const groups = Array.isArray(readContext.groups) ? readContext.groups : [];
    const rolesFromDb = Array.isArray(readContext.roles) ? readContext.roles : [];
    const effectiveReadAllowed = Boolean(readContext.evaluation && readContext.evaluation.allowed);
    const effectiveWriteWouldAllow = Boolean(writeContext.evaluation && writeContext.evaluation.allowed);

    if (!dashboardAccess.allowed) {
      return {
        status: 403,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: false,
          accessReason: dashboardAccess.reason,
          canReadAdminNotes: false,
          reason: 'dashboard_access_denied',
          actor: buildActor({ readContext, roles: rolesFromDb, groups }),
          permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: false })
        }
      };
    }

    if (!effectiveReadAllowed) {
      return {
        status: 403,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          canReadAdminNotes: false,
          reason: 'admin_note_read_permission_denied',
          actor: buildActor({ readContext, roles: rolesFromDb, groups }),
          permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: false })
        }
      };
    }

    return await withReadOnlyConnection(config, async (connection) => {
      const tableStatus = await readAdminNoteTableStatus(connection);

      if (!tableStatus.tableExists) {
        return {
          status: 503,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            canReadAdminNotes: true,
            reason: 'admin_note_table_missing',
            actor: buildActor({ readContext, roles: rolesFromDb, groups }),
            permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: true }),
            table: tableStatus,
            notes: []
          }
        };
      }

      if (!tableStatus.schemaReady) {
        return {
          status: 503,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            canReadAdminNotes: true,
            reason: 'admin_note_schema_not_ready',
            actor: buildActor({ readContext, roles: rolesFromDb, groups }),
            permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: true }),
            table: tableStatus,
            notes: []
          }
        };
      }

      const targetSummary = await readTargetSummary(connection, targetUserUid);
      const notes = await readTargetNotes(connection, { targetUserUid, limit, includeInactive });

      return {
        status: 200,
        body: {
          ...base,
          ok: true,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          canReadAdminNotes: true,
          reason: 'admin_note_real_read_ready',
          actor: buildActor({ readContext, roles: rolesFromDb, groups }),
          permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: true }),
          table: tableStatus,
          targetSummary,
          notes,
          noteTextReturned: true,
          noteTextIsRedacted: false
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
        loggedIn: true,
        dashboardAccess: false,
        canReadAdminNotes: false,
        reason: publicError || 'admin_note_real_read_failed',
        error: publicError || 'admin_note_real_read_failed',
        noteTextReturned: false
      }
    };
  }
}

function buildBaseBody(context, readiness, sessionValidation, { targetUserUid, limit, includeInactive }) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    route: '/api/remote/admin/users/admin-notes/read',
    tableName: TABLE_NAME,
    targetUserUid: targetUserUid || null,
    limit,
    includeInactive,
    permissionKey: PERMISSION_KEY,
    writePermissionKey: WRITE_PERMISSION_KEY,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    uiWriteButtonsEnabled: false,
    createsTable: false,
    insertsNote: false,
    updatesNote: false,
    deletesNote: false,
    returnsNoteText: true,
    noteTextReturned: false,
    noteTextIsRedacted: false,
    communityPagesMayReadAdminNotes: false,
    database: readiness,
    session: buildPublicSessionState(sessionValidation),
    safety: context ? context.safety : null
  };
}

async function readAdminNoteTableStatus(connection) {
  const [tableRows] = await connection.query(
    `SELECT TABLE_NAME AS table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`,
    [TABLE_NAME]
  );
  const tableExists = Array.isArray(tableRows) && tableRows.length > 0;
  if (!tableExists) {
    return { tableExists: false, schemaReady: false, missingColumns: REQUIRED_COLUMNS.slice(), rowCount: null };
  }

  const [columnRows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
    [TABLE_NAME]
  );
  const existingColumns = columnRows.map((row) => row.column_name).filter(Boolean);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !existingColumns.includes(column));
  const [countRows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${TABLE_NAME}`);
  const rowCount = Number(countRows && countRows[0] ? countRows[0].count_value : 0);
  return { tableExists: true, schemaReady: missingColumns.length === 0, missingColumns, rowCount: Number.isFinite(rowCount) ? rowCount : 0 };
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
    lastUpdatedAt: normalizeDate(first.last_updated_at)
  };
}

async function readTargetNotes(connection, { targetUserUid, limit, includeInactive }) {
  const where = includeInactive
    ? 'target_user_uid = ?'
    : "target_user_uid = ? AND status = 'active'";
  const [rows] = await connection.query(
    `SELECT
       note_uid,
       target_user_uid,
       note_text,
       status,
       created_by_user_uid,
       updated_by_user_uid,
       created_at,
       updated_at
     FROM ${TABLE_NAME}
     WHERE ${where}
     ORDER BY updated_at DESC, id DESC
     LIMIT ?`,
    [targetUserUid, limit]
  );

  return rows.map((row) => ({
    noteUid: row.note_uid,
    targetUserUid: row.target_user_uid,
    status: row.status,
    noteText: row.note_text || '',
    noteTextRedacted: false,
    createdByUserUid: row.created_by_user_uid || null,
    updatedByUserUid: row.updated_by_user_uid || null,
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  }));
}

function buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes }) {
  return {
    requestedReadPermission: PERMISSION_KEY,
    requestedWritePermission: WRITE_PERMISSION_KEY,
    canReadAdminNotes,
    canWriteAdminNotes: false,
    effectiveReadPermissionWouldAllow: effectiveReadAllowed,
    effectiveWritePermissionWouldAllow: effectiveWriteWouldAllow,
    readReason: readContext && readContext.evaluation ? readContext.evaluation.reason : null,
    writeReason: writeContext && writeContext.evaluation ? writeContext.evaluation.reason : null,
    readRows: summarizePermissionRows(readContext),
    writeRows: summarizePermissionRows(writeContext)
  };
}

function summarizePermissionRows(contextResult) {
  return {
    rolePermissions: contextResult && Array.isArray(contextResult.rolePermissions) ? contextResult.rolePermissions.length : 0,
    modulePermissions: contextResult && Array.isArray(contextResult.modulePermissions) ? contextResult.modulePermissions.length : 0,
    matchedAllowCount: contextResult && contextResult.evaluation ? contextResult.evaluation.matchedAllowCount : 0,
    matchedDenyCount: contextResult && contextResult.evaluation ? contextResult.evaluation.matchedDenyCount : 0
  };
}

function buildActor({ readContext, roles, groups }) {
  const user = readContext && readContext.user ? readContext.user : null;
  return {
    userUid: user ? user.userUid : null,
    displayName: user ? user.displayName : null,
    loginName: user ? user.loginName : null,
    status: user ? user.status : null,
    roles,
    groups
  };
}

function buildDashboardAccess(config, user, sessionValidation) {
  if (!sessionValidation.valid || !user || !user.exists) {
    return { allowed: false, reason: 'not_logged_in', roles: [] };
  }
  const login = String(user.loginName || '').trim().toLowerCase();
  const display = String(user.displayName || '').trim().toLowerCase();
  const userUid = String(user.userUid || '').trim().toLowerCase();
  const access = config.dashboardAccess || {};
  const allowedLogins = Array.isArray(access.allowedLogins) ? access.allowedLogins : [];
  const allowedUserUids = Array.isArray(access.allowedUserUids) ? access.allowedUserUids : [];
  if (allowedUserUids.includes(userUid)) return { allowed: true, reason: 'allowed_user_uid', roles: [access.defaultRole || 'owner'] };
  if (allowedLogins.includes(login) || allowedLogins.includes(display)) return { allowed: true, reason: 'allowed_login', roles: [access.defaultRole || 'owner'] };
  return { allowed: false, reason: 'not_allowed', roles: [] };
}

function buildPublicSessionState(sessionValidation) {
  return {
    checked: true,
    cookiePresent: sessionValidation.cookiePresent,
    cookieNameDetected: sessionValidation.cookieNameDetected,
    cookieValuePresent: sessionValidation.cookieValuePresent,
    cookieValueFingerprint: sessionValidation.cookieValueFingerprint,
    sessionLookupEnabled: sessionValidation.lookupEnabled,
    sessionLookupPerformed: sessionValidation.lookupPerformed,
    sessionExists: sessionValidation.exists,
    sessionValid: sessionValidation.valid,
    expiresAt: sessionValidation.expiresAt,
    userUid: sessionValidation.userUid,
    reason: sessionValidation.reason,
    createsSession: false,
    setsCookie: false,
    updatesLastSeen: false
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

function normalizeBoolean(value) {
  if (typeof value !== 'string') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

module.exports = { buildAdminUserAdminNoteRealReadAuthed };
