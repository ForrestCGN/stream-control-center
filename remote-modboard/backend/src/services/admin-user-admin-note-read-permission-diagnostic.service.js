'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');

const MODULE = 'remote_admin_user_admin_note_read_permission_diagnostic';
const MODULE_BUILD = 'RDAP_ADMIN_USERS20_ADMIN_NOTE_READ_PERMISSION_DIAGNOSTIC_READONLY';
const STATUS_API_VERSION = 'rdap_admin_users20.v1';
const TABLE_NAME = 'dashboard_user_admin_notes';
const PERMISSION_KEY = 'admin.users.note.read';
const WRITE_PERMISSION_KEY = 'admin.users.note.write';
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

async function buildAdminUserAdminNoteReadPermissionDiagnostic({ context, req } = {}) {
  const config = context && context.config ? context.config : {};
  const sessionValidation = await validateSessionReadOnly({ config, req });
  const readiness = buildDatabaseReadiness(config);
  const query = req && req.query ? req.query : {};
  const targetUserUid = normalizeTargetUserUid(query.targetUserUid || query.target_user_uid || '');
  const base = buildBaseBody(context, readiness, sessionValidation, targetUserUid);

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
    const roles = unique([...(Array.isArray(readContext.roles) ? readContext.roles : []), ...(dashboardAccess.roles || [])]);
    const groups = Array.isArray(readContext.groups) ? readContext.groups : [];
    const isOwner = hasRole(roles, 'owner');
    const isAdmin = isOwner || hasRole(roles, 'admin');
    const effectiveReadAllowed = Boolean(readContext.evaluation && readContext.evaluation.allowed);
    const effectiveWriteWouldAllow = Boolean(writeContext.evaluation && writeContext.evaluation.allowed);
    const canReadAdminNotes = Boolean(dashboardAccess.allowed && (isOwner || isAdmin || effectiveReadAllowed));
    const tableStatus = await readAdminNoteTableStatus(config);

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
          actor: buildActor({ readContext, roles, groups, isOwner, isAdmin }),
          permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: false }),
          table: tableStatus
        }
      };
    }

    if (!canReadAdminNotes) {
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
          actor: buildActor({ readContext, roles, groups, isOwner, isAdmin }),
          permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: false }),
          table: tableStatus
        }
      };
    }

    return {
      status: 200,
      body: {
        ...base,
        ok: true,
        loggedIn: true,
        dashboardAccess: true,
        accessReason: dashboardAccess.reason,
        canReadAdminNotes: true,
        reason: 'admin_note_read_permission_diagnostic_ready',
        actor: buildActor({ readContext, roles, groups, isOwner, isAdmin }),
        permissions: buildPermissionSummary({ readContext, writeContext, effectiveReadAllowed, effectiveWriteWouldAllow, canReadAdminNotes: true }),
        table: tableStatus
      }
    };
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
        reason: publicError || 'admin_note_read_permission_diagnostic_failed',
        error: publicError || 'admin_note_read_permission_diagnostic_failed'
      }
    };
  }
}

function buildBaseBody(context, readiness, sessionValidation, targetUserUid) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    diagnosticBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    route: '/api/remote/admin/users/admin-note-read-permission-diagnostic',
    tableName: TABLE_NAME,
    targetUserUid: targetUserUid || null,
    permissionKey: PERMISSION_KEY,
    plannedFutureWritePermission: WRITE_PERMISSION_KEY,
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
    noteTextReturned: false,
    noteTextIsRedacted: true,
    authRequiredBeforeRealDisplay: true,
    communityPagesMayReadAdminNotes: false,
    database: readiness,
    session: buildPublicSessionState(sessionValidation),
    safety: context ? context.safety : null
  };
}

async function readAdminNoteTableStatus(config) {
  return await withReadOnlyConnection(config, async (connection) => {
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
  });
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

function buildActor({ readContext, roles, groups, isOwner, isAdmin }) {
  const user = readContext && readContext.user ? readContext.user : null;
  return {
    userUid: user ? user.userUid : null,
    displayName: user ? user.displayName : null,
    loginName: user ? user.loginName : null,
    status: user ? user.status : null,
    roles,
    groups,
    isOwner,
    isAdmin
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
  if (allowedUserUids.includes(userUid)) {
    return { allowed: true, reason: 'allowed_user_uid', roles: [access.defaultRole || 'owner'] };
  }
  if (allowedLogins.includes(login) || allowedLogins.includes(display)) {
    return { allowed: true, reason: 'allowed_login', roles: [access.defaultRole || 'owner'] };
  }
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

function hasRole(roles, key) {
  const normalized = String(key || '').toLowerCase();
  return Array.isArray(roles) && roles.some((role) => String(role || '').toLowerCase() === normalized);
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

module.exports = { buildAdminUserAdminNoteReadPermissionDiagnostic };
