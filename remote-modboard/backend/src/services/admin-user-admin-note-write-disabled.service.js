'use strict';

const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, withReadOnlyConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');
const { requireAdminAuditDraft } = require('./admin-audit-write.service');
const { buildAdminLockOperationDraft } = require('./admin-lock-write.service');

const MODULE = 'remote_admin_user_admin_note_write_disabled';
const MODULE_BUILD = 'RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI';
const STATUS_API_VERSION = 'rdap_admin_note_write31.v1';

const TABLE_NAME = 'dashboard_user_admin_notes';
const USERS_TABLE_NAME = 'dashboard_users';
const REMOTE_VIEW_PERMISSION = 'remote.view';
const READ_PERMISSION = 'admin.users.note.read';
const WRITE_PERMISSION = 'admin.users.note.write';

const MAX_NOTE_TEXT_LENGTH = 5000;
const VALID_ACTIONS = Object.freeze(['create', 'update', 'deactivate']);

async function buildAdminUserAdminNoteWriteDisabled({ context, req, action } = {}) {
  const config = context && context.config ? context.config : {};
  const normalizedAction = normalizeAction(action);
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const query = req && req.query && typeof req.query === 'object' ? req.query : {};
  const input = { ...query, ...body };

  const sessionValidation = await validateSessionReadOnly({ config, req });
  const readiness = buildDatabaseReadiness(config);
  const confirm = requireAdminConfirmWrite({ query, body });

  const targetUserUid = normalizeUserUid(input.targetUserUid || input.target_user_uid);
  const noteUid = normalizeNoteUid(input.noteUid || input.note_uid);
  const noteText = normalizeNoteText(input.noteText || input.note_text);

  const base = buildBaseBody(context, readiness, sessionValidation, {
    action: normalizedAction,
    targetUserUid,
    noteUid,
    noteTextLength: noteText.length,
    confirm
  });

  if (!VALID_ACTIONS.includes(normalizedAction)) {
    return { status: 400, body: { ...base, ok: false, reason: 'invalid_admin_note_write_action' } };
  }

  if (!confirm.ok) {
    return {
      status: confirm.status || 400,
      body: {
        ...base,
        ok: false,
        reason: confirm.error || 'confirm_write_required',
        confirm
      }
    };
  }

  if (!sessionValidation.valid || !sessionValidation.userUid) {
    return {
      status: 401,
      body: {
        ...base,
        ok: false,
        loggedIn: false,
        dashboardAccess: false,
        reason: 'not_logged_in_or_session_invalid'
      }
    };
  }

  const validation = validateActionInput({ action: normalizedAction, targetUserUid, noteUid, noteText });
  if (!validation.valid) {
    return { status: 400, body: { ...base, ok: false, loggedIn: true, reason: validation.reason, validation } };
  }

  if (!readiness.configured || !readiness.driverAvailable) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        reason: readiness.error || 'db_not_ready',
        error: readiness.error || 'db_not_ready'
      }
    };
  }

  try {
    const remoteViewContext = await readPermissionContextReadOnly({
      config,
      userUid: sessionValidation.userUid,
      permissionKey: REMOTE_VIEW_PERMISSION,
      targetType: 'global',
      targetKey: '*'
    });

    const readContext = await readPermissionContextReadOnly({
      config,
      userUid: sessionValidation.userUid,
      permissionKey: READ_PERMISSION,
      targetType: 'global',
      targetKey: '*'
    });

    const writeContext = await readPermissionContextReadOnly({
      config,
      userUid: sessionValidation.userUid,
      permissionKey: WRITE_PERMISSION,
      targetType: 'global',
      targetKey: '*'
    });

    const actorContext = readContext && readContext.user && readContext.user.exists ? readContext : remoteViewContext;
    const groups = Array.isArray(actorContext.groups) ? actorContext.groups : [];
    const roles = Array.isArray(actorContext.roles) ? actorContext.roles : [];
    const dashboardAccess = buildDashboardAccess(config, actorContext.user, sessionValidation);

    const remoteViewAllowed = Boolean(remoteViewContext.evaluation && remoteViewContext.evaluation.allowed);
    const readAllowed = Boolean(readContext.evaluation && readContext.evaluation.allowed);
    const writeAllowed = Boolean(writeContext.evaluation && writeContext.evaluation.allowed);

    const permissionSummary = buildPermissionSummary({
      remoteViewContext,
      readContext,
      writeContext,
      remoteViewAllowed,
      readAllowed,
      writeAllowed
    });

    if (!dashboardAccess.allowed) {
      return {
        status: 403,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: false,
          accessReason: dashboardAccess.reason,
          reason: 'dashboard_access_denied',
          actor: buildActor({ contextResult: actorContext, roles, groups }),
          permissions: permissionSummary
        }
      };
    }

    if (!remoteViewAllowed) {
      return {
        status: 403,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          reason: 'remote_view_permission_denied',
          actor: buildActor({ contextResult: actorContext, roles, groups }),
          permissions: permissionSummary
        }
      };
    }

    if (!writeAllowed) {
      return {
        status: 403,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          reason: 'admin_note_write_permission_denied',
          actor: buildActor({ contextResult: actorContext, roles, groups }),
          permissions: permissionSummary,
          confirm,
          writeExecuted: false
        }
      };
    }

    return await withReadOnlyConnection(config, async (connection) => {
      const tableStatus = await readAdminNoteTableStatus(connection);
      const targetUser = await readTargetUser(connection, targetUserUid);
      const existingNote = noteUid ? await readExistingNote(connection, { targetUserUid, noteUid }) : null;

      if (!tableStatus.tableExists || !tableStatus.schemaReady) {
        return {
          status: 503,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: tableStatus.tableExists ? 'admin_note_schema_not_ready' : 'admin_note_table_missing',
            actor: buildActor({ contextResult: actorContext, roles, groups }),
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            writeExecuted: false
          }
        };
      }

      if (!targetUser.exists) {
        return {
          status: 404,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: 'target_user_not_found',
            actor: buildActor({ contextResult: actorContext, roles, groups }),
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            writeExecuted: false
          }
        };
      }

      if ((normalizedAction === 'update' || normalizedAction === 'deactivate') && (!existingNote || !existingNote.exists)) {
        return {
          status: 404,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: 'admin_note_not_found_for_target',
            actor: buildActor({ contextResult: actorContext, roles, groups }),
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            existingNote,
            writeExecuted: false
          }
        };
      }

      const lockScope = `admin.users.note:${targetUserUid}`;
      const resourceKey = noteUid ? `admin_user_note:${noteUid}` : `admin_user_note:${targetUserUid}:new`;
      const actor = buildActor({ contextResult: actorContext, roles, groups });

      const auditDraft = requireAdminAuditDraft({
        actorUserUid: actor.userUid,
        actorLogin: actor.loginName || actor.displayName || 'unknown',
        action: `admin.user_note.${normalizedAction}`,
        resourceType: 'admin_user_note',
        resourceKey,
        status: 'blocked_by_audit_lock_write_scope',
        reason: 'RDAP31 validates admin note write request but productive writes remain disabled.',
        safeMetadata: {
          step: MODULE_BUILD,
          targetUserUid,
          noteUid: noteUid || null,
          noteTextLength: noteText.length,
          confirmWriteAccepted: true
        }
      });

      const lockDraft = buildAdminLockOperationDraft({
        operation: 'acquire',
        input: {
          resourceType: 'admin_user_note',
          resourceKey,
          actorUserUid: actor.userUid,
          actorLogin: actor.loginName || actor.displayName || 'unknown',
          lockScope,
          reason: 'RDAP31 admin note write validation; lock write remains disabled.'
        }
      });

      return {
        status: 423,
        body: {
          ...base,
          ok: false,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          reason: 'admin_note_write_blocked_audit_lock_writes_disabled',
          actor,
          permissions: permissionSummary,
          table: tableStatus,
          targetUser,
          existingNote,
          confirm,
          audit: {
            draftValid: Boolean(auditDraft.draftValid),
            auditWriteEnabled: false,
            auditInsertEnabled: false,
            reason: auditDraft.reason || null
          },
          lock: {
            draftValid: Boolean(lockDraft.draftValid),
            lockScope,
            lockWriteEnabled: false,
            lockAcquireEnabled: false,
            reason: lockDraft.reason || null
          },
          validation,
          writeExecuted: false,
          databaseWriteExecuted: false,
          readBackPerformed: false,
          hint: 'RDAP31 validiert Permission/Confirm/Input/Schema nur lesend. Produktive Writes bleiben blockiert, bis Audit- und Lock-Writes in einem separaten Step wirklich aktiv sind.'
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
        reason: publicError || 'admin_note_write_validation_failed',
        error: publicError || 'admin_note_write_validation_failed',
        writeExecuted: false
      }
    };
  }
}

function buildBaseBody(context, readiness, sessionValidation, { action, targetUserUid, noteUid, noteTextLength, confirm }) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    routeRemainsReadOnly: true,
    prepared: true,
    action,
    routeFamily: '/api/remote/admin/users/admin-notes/*',
    tableName: TABLE_NAME,
    targetUserUid: targetUserUid || null,
    noteUid: noteUid || null,
    noteTextLength,
    permissionKey: WRITE_PERMISSION,
    remoteViewPermissionKey: REMOTE_VIEW_PERMISSION,
    readPermissionKey: READ_PERMISSION,
    writePermissionKey: WRITE_PERMISSION,
    confirmWriteRequired: true,
    confirmWriteAccepted: Boolean(confirm && confirm.confirmWriteAccepted),
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    uiWriteButtonsEnabled: false,
    createsNote: false,
    updatesNote: false,
    deactivatesNote: false,
    deletesNote: false,
    physicalDeleteEnabled: false,
    communityPagesMayReadAdminNotes: false,
    database: readiness,
    session: buildPublicSessionState(sessionValidation),
    safety: context ? context.safety : null
  };
}

function validateActionInput({ action, targetUserUid, noteUid, noteText }) {
  if (!targetUserUid) return { valid: false, reason: 'missing_or_invalid_target_user_uid' };
  if ((action === 'update' || action === 'deactivate') && !noteUid) return { valid: false, reason: 'missing_or_invalid_note_uid' };
  if ((action === 'create' || action === 'update') && !noteText) return { valid: false, reason: 'missing_or_empty_note_text' };
  if ((action === 'create' || action === 'update') && noteText.length > MAX_NOTE_TEXT_LENGTH) {
    return { valid: false, reason: 'note_text_too_long', maxNoteTextLength: MAX_NOTE_TEXT_LENGTH };
  }
  return { valid: true, reason: 'input_valid', maxNoteTextLength: MAX_NOTE_TEXT_LENGTH };
}

async function readAdminNoteTableStatus(connection) {
  const requiredColumns = [
    'id',
    'note_uid',
    'target_user_uid',
    'note_text',
    'status',
    'created_by_user_uid',
    'updated_by_user_uid',
    'created_at',
    'updated_at'
  ];

  const [tableRows] = await connection.query(
    `SELECT TABLE_NAME AS table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`,
    [TABLE_NAME]
  );

  const tableExists = Array.isArray(tableRows) && tableRows.length > 0;
  if (!tableExists) {
    return { tableExists: false, schemaReady: false, missingColumns: requiredColumns.slice(), rowCount: null };
  }

  const [columnRows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
    [TABLE_NAME]
  );

  const existingColumns = columnRows.map((row) => row.column_name).filter(Boolean);
  const missingColumns = requiredColumns.filter((column) => !existingColumns.includes(column));
  const [countRows] = await connection.query(`SELECT COUNT(*) AS count_value FROM ${TABLE_NAME}`);
  const rowCount = Number(countRows && countRows[0] ? countRows[0].count_value : 0);

  return {
    tableExists: true,
    schemaReady: missingColumns.length === 0,
    missingColumns,
    rowCount: Number.isFinite(rowCount) ? rowCount : 0
  };
}

async function readTargetUser(connection, targetUserUid) {
  const [rows] = await connection.query(
    `SELECT user_uid, display_name, login_name, status FROM ${USERS_TABLE_NAME} WHERE user_uid = ? LIMIT 1`,
    [targetUserUid]
  );
  const row = rows && rows[0] ? rows[0] : null;
  if (!row) return { exists: false, userUid: targetUserUid, status: null, displayName: null, loginName: null };
  return {
    exists: true,
    userUid: row.user_uid,
    displayName: row.display_name || null,
    loginName: row.login_name || null,
    status: row.status || null
  };
}

async function readExistingNote(connection, { targetUserUid, noteUid }) {
  const [rows] = await connection.query(
    `SELECT note_uid, target_user_uid, status, created_at, updated_at FROM ${TABLE_NAME} WHERE target_user_uid = ? AND note_uid = ? LIMIT 1`,
    [targetUserUid, noteUid]
  );
  const row = rows && rows[0] ? rows[0] : null;
  if (!row) return { exists: false, noteUid, targetUserUid, status: null };
  return {
    exists: true,
    noteUid: row.note_uid,
    targetUserUid: row.target_user_uid,
    status: row.status || null,
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

function buildPermissionSummary({ remoteViewContext, readContext, writeContext, remoteViewAllowed, readAllowed, writeAllowed }) {
  return {
    remoteViewPermission: REMOTE_VIEW_PERMISSION,
    readPermission: READ_PERMISSION,
    writePermission: WRITE_PERMISSION,
    canRemoteView: remoteViewAllowed,
    canReadAdminNotes: readAllowed,
    canWriteAdminNotes: false,
    effectiveWritePermissionWouldAllow: writeAllowed,
    remoteViewReason: remoteViewContext && remoteViewContext.evaluation ? remoteViewContext.evaluation.reason : null,
    readReason: readContext && readContext.evaluation ? readContext.evaluation.reason : null,
    writeReason: writeContext && writeContext.evaluation ? writeContext.evaluation.reason : null,
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

function buildActor({ contextResult, roles, groups }) {
  const user = contextResult && contextResult.user ? contextResult.user : null;
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

function normalizeAction(action) {
  return String(action || '').trim().toLowerCase();
}

function normalizeUserUid(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/^[a-zA-Z0-9:_-]{1,128}$/.test(trimmed)) return '';
  return trimmed;
}

function normalizeNoteUid(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/^[a-zA-Z0-9:_-]{1,128}$/.test(trimmed)) return '';
  return trimmed;
}

function normalizeNoteText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildAdminUserAdminNoteWriteDisabled
};
