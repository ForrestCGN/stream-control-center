'use strict';

const crypto = require('crypto');
const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, withWriteConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');

const MODULE = 'remote_admin_user_admin_note_write_confirmed';
const MODULE_BUILD = 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED';
const STATUS_API_VERSION = 'rdap_admin_note_write39.v1';

const TABLE_NAME = 'dashboard_user_admin_notes';
const USERS_TABLE_NAME = 'dashboard_users';
const AUDIT_TABLE_NAME = 'dashboard_audit_log';
const LOCK_TABLE_NAME = 'dashboard_locks';

const REMOTE_VIEW_PERMISSION = 'remote.view';
const READ_PERMISSION = 'admin.users.note.read';
const WRITE_PERMISSION = 'admin.users.note.write';
const MAX_NOTE_TEXT_LENGTH = 5000;
const CREATE_ACTION = 'create';

const ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY = Object.freeze({
  prepared: true,
  route: '/api/remote/admin/users/admin-notes/create',
  method: 'POST',
  statusApiVersion: STATUS_API_VERSION,
  tableName: TABLE_NAME,
  permissionRequired: WRITE_PERMISSION,
  confirmWriteRequired: true,
  bodyConfirmOnly: true,
  auditRequired: true,
  lockRequired: true,
  backupRequiredBeforeProductiveWrite: true,
  readBackRequired: true,
  writeEnabled: true,
  databaseWriteEnabled: true,
  productiveWritesEnabled: true,
  adminNoteWritesEnabled: true,
  adminNoteCreateEnabled: true,
  adminNoteUpdateEnabled: false,
  adminNoteDeactivateEnabled: false,
  uiWriteButtonsEnabled: false,
  physicalDeleteEnabled: false,
  communityPagesMayReadAdminNotes: false,
  routeRemainsRestricted: true,
  plannedFollowupStep: 'RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS'
});

async function buildAdminUserAdminNoteWriteConfirmed({ context, req, action } = {}) {
  const normalizedAction = normalizeAction(action);
  const config = context && context.config ? context.config : {};
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const readiness = buildDatabaseReadiness(config);
  const sessionValidation = await validateSessionReadOnly({ config, req });
  const confirm = requireAdminConfirmWrite({ body });

  const targetUserUid = normalizeUserUid(body.targetUserUid || body.target_user_uid);
  const noteText = normalizeNoteText(body.noteText || body.note_text);

  const base = buildBaseBody(context, readiness, sessionValidation, {
    action: normalizedAction,
    targetUserUid,
    noteTextLength: noteText.length,
    confirm,
    req
  });

  if (normalizedAction !== CREATE_ACTION) {
    return {
      status: 423,
      body: {
        ...base,
        ok: false,
        reason: 'admin_note_action_still_disabled_in_rdAP39'.toLowerCase(),
        writeExecuted: false,
        adminNoteCreateEnabled: true,
        adminNoteUpdateEnabled: false,
        adminNoteDeactivateEnabled: false
      }
    };
  }

  if (!confirm.ok) {
    return {
      status: confirm.status || 400,
      body: {
        ...base,
        ok: false,
        reason: confirm.error || 'confirm_write_required',
        confirmWriteAccepted: false,
        confirm,
        writeExecuted: false,
        lockAcquired: false,
        auditAttemptWritten: false,
        readBackPerformed: false
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
        reason: 'not_logged_in_or_session_invalid',
        writeExecuted: false
      }
    };
  }

  const validation = validateCreateInput({ targetUserUid, noteText });
  if (!validation.valid) {
    return {
      status: 400,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        reason: validation.reason,
        validation,
        writeExecuted: false
      }
    };
  }

  if (!readiness.configured || !readiness.driverAvailable || !readiness.writeEnabled) {
    return {
      status: 503,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        reason: readiness.error || (!readiness.writeEnabled ? 'db_write_disabled' : 'db_not_ready'),
        error: readiness.error || (!readiness.writeEnabled ? 'db_write_disabled' : 'db_not_ready'),
        writeExecuted: false
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
    const actor = buildActor({ contextResult: actorContext, roles, groups });

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
          actor,
          permissions: permissionSummary,
          writeExecuted: false
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
          actor,
          permissions: permissionSummary,
          writeExecuted: false
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
          actor,
          permissions: permissionSummary,
          confirm,
          writeExecuted: false
        }
      };
    }

    return await withWriteConnection(config, async (connection) => {
      const tableStatus = await readAdminNoteTableStatus(connection);
      const targetUser = await readTargetUser(connection, targetUserUid);

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
            actor,
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
            actor,
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            writeExecuted: false
          }
        };
      }

      const now = new Date();
      const noteUid = buildNoteUid();
      const lockUid = buildLockUid();
      const resourceKey = `admin_user_note:${targetUserUid}:create`;
      const versionToken = `rdap39-${lockUid}`;
      const auditAttemptUid = buildAuditUid('attempt');
      const auditSuccessUid = buildAuditUid('success');
      let lockAcquired = false;
      let lockReleased = false;
      let noteWritten = false;
      let readBack = null;
      let auditAttemptWritten = false;
      let auditSuccessWritten = false;
      let auditFailureWritten = false;
      let auditFollowupFailed = false;
      let lockReleaseFailed = false;
      let failureReason = null;

      try {
        await connection.execute(
          `INSERT INTO dashboard_locks
            (lock_uid, resource_key, owner_user_uid, status, heartbeat_at, expires_at, version_token, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lockUid,
            resourceKey,
            actor.userUid,
            'active',
            now,
            new Date(now.getTime() + 5 * 60 * 1000),
            versionToken,
            now,
            now
          ]
        );
        lockAcquired = true;
      } catch (err) {
        return {
          status: 423,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: 'admin_note_lock_acquire_failed',
            error: publicDbError(err),
            actor,
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            resourceKey,
            lock: { lockUid, acquired: false },
            writeExecuted: false,
            adminNoteWriteExecuted: false,
            lockReleaseAttempted: false
          }
        };
      }

      try {
        await insertAudit(connection, {
          auditUid: auditAttemptUid,
          actor,
          source: 'remote-modboard/admin-notes',
          action: 'admin.user_note.create',
          resourceType: 'admin_user_note',
          permissionKey: WRITE_PERMISSION,
          resourceKey,
          status: 'attempt',
          errorCode: null,
          oldValueSummary: null,
          newValueSummary: `Admin-Notiz Create versucht; target=${targetUserUid}; noteTextLength=${noteText.length}.`,
          safeMetadata: {
            step: MODULE_BUILD,
            noteUid,
            targetUserUid,
            noteTextLength: noteText.length,
            lockUid,
            confirmWriteAccepted: true,
            rawNoteTextLogged: false
          },
          completedAt: now
        });
        auditAttemptWritten = true;
      } catch (err) {
        failureReason = 'admin_note_audit_attempt_failed';
        await safeReleaseLock(connection, { lockUid, now: new Date() }).then((released) => { lockReleased = released; });
        return {
          status: 500,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: failureReason,
            error: publicDbError(err),
            actor,
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            resourceKey,
            lock: { lockUid, acquired: lockAcquired, released: lockReleased },
            auditAttemptWritten: false,
            writeExecuted: false,
            adminNoteWriteExecuted: false
          }
        };
      }

      try {
        await connection.execute(
          `INSERT INTO dashboard_user_admin_notes
            (note_uid, target_user_uid, note_text, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [noteUid, targetUserUid, noteText, 'active', actor.userUid, actor.userUid, now, now]
        );
        noteWritten = true;

        readBack = await readNoteByUid(connection, { noteUid, targetUserUid });
        if (!readBack || !readBack.exists) {
          throw buildError('admin_note_readback_missing_after_write');
        }
      } catch (err) {
        failureReason = publicDbError(err).code || 'admin_note_write_failed';
        try {
          await insertAudit(connection, {
            auditUid: buildAuditUid('failed'),
            actor,
            source: 'remote-modboard/admin-notes',
            action: 'admin.user_note.create',
            resourceType: 'admin_user_note',
            permissionKey: WRITE_PERMISSION,
            resourceKey,
            status: 'failed',
            errorCode: failureReason,
            oldValueSummary: null,
            newValueSummary: `Admin-Notiz Create fehlgeschlagen; target=${targetUserUid}; noteTextLength=${noteText.length}.`,
            safeMetadata: {
              step: MODULE_BUILD,
              noteUid,
              targetUserUid,
              noteTextLength: noteText.length,
              lockUid,
              noteWritten,
              rawNoteTextLogged: false
            },
            completedAt: new Date()
          });
          auditFailureWritten = true;
        } catch (auditErr) {
          auditFollowupFailed = true;
        }
        await safeReleaseLock(connection, { lockUid, now: new Date() }).then((released) => { lockReleased = released; lockReleaseFailed = !released; });
        return {
          status: 500,
          body: {
            ...base,
            ok: false,
            loggedIn: true,
            dashboardAccess: true,
            accessReason: dashboardAccess.reason,
            reason: failureReason || 'admin_note_write_failed',
            actor,
            permissions: permissionSummary,
            table: tableStatus,
            targetUser,
            resourceKey,
            noteUid,
            lock: { lockUid, acquired: lockAcquired, released: lockReleased, releaseFailed: lockReleaseFailed },
            auditAttemptWritten,
            auditFailureWritten,
            auditFollowupFailed,
            writeExecuted: noteWritten,
            adminNoteWriteExecuted: noteWritten,
            readBackPerformed: Boolean(readBack),
            readBackFound: Boolean(readBack && readBack.exists)
          }
        };
      }

      try {
        await insertAudit(connection, {
          auditUid: auditSuccessUid,
          actor,
          source: 'remote-modboard/admin-notes',
          action: 'admin.user_note.create',
          resourceType: 'admin_user_note',
          permissionKey: WRITE_PERMISSION,
          resourceKey: `admin_user_note:${noteUid}:create`,
          status: 'success',
          errorCode: null,
          oldValueSummary: null,
          newValueSummary: `Admin-Notiz erstellt; target=${targetUserUid}; noteUid=${noteUid}; noteTextLength=${noteText.length}.`,
          safeMetadata: {
            step: MODULE_BUILD,
            noteUid,
            targetUserUid,
            noteTextLength: noteText.length,
            lockUid,
            auditAttemptUid,
            rawNoteTextLogged: false
          },
          completedAt: new Date()
        });
        auditSuccessWritten = true;
      } catch (err) {
        auditFollowupFailed = true;
        failureReason = 'admin_note_write_succeeded_audit_followup_failed';
      }

      lockReleased = await safeReleaseLock(connection, { lockUid, now: new Date() });
      lockReleaseFailed = !lockReleased;

      return {
        status: auditFollowupFailed || lockReleaseFailed ? 207 : 200,
        body: {
          ...base,
          ok: !auditFollowupFailed && !lockReleaseFailed,
          loggedIn: true,
          dashboardAccess: true,
          accessReason: dashboardAccess.reason,
          reason: auditFollowupFailed
            ? 'admin_note_write_succeeded_audit_followup_failed'
            : (lockReleaseFailed ? 'admin_note_write_succeeded_lock_release_failed' : 'admin_note_create_executed'),
          actor,
          permissions: permissionSummary,
          table: tableStatus,
          targetUser,
          confirmWriteAccepted: true,
          noteUid,
          resourceKey,
          lock: {
            lockUid,
            acquired: lockAcquired,
            released: lockReleased,
            releaseFailed: lockReleaseFailed
          },
          audit: {
            attemptUid: auditAttemptUid,
            successUid: auditSuccessWritten ? auditSuccessUid : null,
            attemptWritten: auditAttemptWritten,
            successWritten: auditSuccessWritten,
            failureWritten: auditFailureWritten,
            auditFollowupFailed
          },
          writeExecuted: true,
          databaseWriteExecuted: true,
          adminNoteWriteExecuted: true,
          adminNoteCreateExecuted: true,
          adminNoteUpdateExecuted: false,
          adminNoteDeactivateExecuted: false,
          physicalDeleteExecuted: false,
          uiWriteButtonsEnabled: false,
          readBackPerformed: true,
          readBackFound: Boolean(readBack && readBack.exists),
          note: readBack,
          warning: auditFollowupFailed || lockReleaseFailed ? failureReason : null
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
        loggedIn: Boolean(sessionValidation && sessionValidation.valid),
        reason: publicError || 'admin_note_write_failed',
        error: publicError || 'admin_note_write_failed',
        writeExecuted: false
      }
    };
  }
}

function buildBaseBody(context, readiness, sessionValidation, { action, targetUserUid, noteTextLength, confirm, req }) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: false,
    prepared: true,
    action,
    route: '/api/remote/admin/users/admin-notes/create',
    tableName: TABLE_NAME,
    usersTableName: USERS_TABLE_NAME,
    auditTableName: AUDIT_TABLE_NAME,
    lockTableName: LOCK_TABLE_NAME,
    targetUserUid: targetUserUid || null,
    noteTextLength,
    permissionKey: WRITE_PERMISSION,
    remoteViewPermissionKey: REMOTE_VIEW_PERMISSION,
    readPermissionKey: READ_PERMISSION,
    writePermissionKey: WRITE_PERMISSION,
    confirmWriteRequired: true,
    bodyConfirmOnly: true,
    queryConfirmAccepted: false,
    confirmWriteAccepted: Boolean(confirm && confirm.confirmWriteAccepted),
    writeEnabled: true,
    databaseWriteEnabled: Boolean(readiness.writeEnabled),
    productiveWritesEnabled: true,
    writesStillBlockedForOtherActions: true,
    adminNoteWritesEnabled: true,
    adminNoteCreateEnabled: true,
    adminNoteUpdateEnabled: false,
    adminNoteDeactivateEnabled: false,
    createsNote: action === CREATE_ACTION,
    updatesNote: false,
    deactivatesNote: false,
    deletesNote: false,
    physicalDeleteEnabled: false,
    communityPagesMayReadAdminNotes: false,
    auditRequired: true,
    lockRequired: true,
    readBackRequired: true,
    uiWriteButtonsEnabled: false,
    database: readiness,
    request: buildRequestInfo(req),
    session: buildPublicSessionState(sessionValidation),
    safety: context ? context.safety : null,
    notes: [
      'RDAP39 aktiviert nur den kontrollierten Backend-Create-Write fuer Admin-Notizen.',
      'confirmWrite wird nur aus dem JSON-Body akzeptiert.',
      'Update und Deactivate bleiben in RDAP39 deaktiviert.',
      'UI-Schreibbuttons bleiben deaktiviert.',
      'Physisches Delete bleibt verboten.',
      'Raw note_text wird nicht im Audit gespeichert.'
    ]
  };
}

function validateCreateInput({ targetUserUid, noteText }) {
  if (!targetUserUid) return { valid: false, reason: 'missing_or_invalid_target_user_uid' };
  if (!noteText) return { valid: false, reason: 'missing_or_empty_note_text' };
  if (noteText.length > MAX_NOTE_TEXT_LENGTH) {
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
    existingColumns,
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

async function readNoteByUid(connection, { noteUid, targetUserUid }) {
  const [rows] = await connection.query(
    `SELECT id, note_uid, target_user_uid, note_text, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
       FROM ${TABLE_NAME}
      WHERE note_uid = ? AND target_user_uid = ?
      LIMIT 1`,
    [noteUid, targetUserUid]
  );
  const row = rows && rows[0] ? rows[0] : null;
  if (!row) return { exists: false, noteUid, targetUserUid };
  return sanitizeNoteRow(row);
}

async function insertAudit(connection, input) {
  await connection.execute(
    `INSERT INTO dashboard_audit_log
      (audit_uid, actor_user_uid, actor_display_name, actor_login, source, action, resource_type,
       permission_key, resource_key, status, error_code, old_value_summary, new_value_summary,
       safe_metadata_json, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.auditUid,
      input.actor.userUid,
      safeString(input.actor.displayName || input.actor.loginName || 'unknown', 120),
      safeString(input.actor.loginName || input.actor.displayName || 'unknown', 128),
      input.source,
      input.action,
      input.resourceType,
      input.permissionKey,
      input.resourceKey,
      input.status,
      input.errorCode,
      input.oldValueSummary,
      input.newValueSummary,
      JSON.stringify(input.safeMetadata || {}),
      input.completedAt
    ]
  );
}

async function safeReleaseLock(connection, { lockUid, now }) {
  try {
    const [result] = await connection.execute(
      `UPDATE dashboard_locks
          SET status = 'released', updated_at = ?
        WHERE lock_uid = ? AND status = 'active'
        LIMIT 1`,
      [now, lockUid]
    );
    return Boolean(result && result.affectedRows >= 1);
  } catch (err) {
    return false;
  }
}

function buildPermissionSummary({ remoteViewContext, readContext, writeContext, remoteViewAllowed, readAllowed, writeAllowed }) {
  return {
    remoteViewPermission: REMOTE_VIEW_PERMISSION,
    readPermission: READ_PERMISSION,
    writePermission: WRITE_PERMISSION,
    canRemoteView: remoteViewAllowed,
    canReadAdminNotes: readAllowed,
    canWriteAdminNotes: writeAllowed,
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

function buildRequestInfo(req) {
  return {
    ip: req && req.ip ? req.ip : null,
    remoteAddress: req && req.socket ? req.socket.remoteAddress : null,
    method: req && req.method ? req.method : null,
    path: req && req.path ? req.path : null,
    userAgentPresent: Boolean(req && req.headers && req.headers['user-agent'])
  };
}

function sanitizeNoteRow(row) {
  return {
    exists: true,
    id: row.id,
    note_uid: row.note_uid,
    target_user_uid: row.target_user_uid,
    note_text: row.note_text,
    noteTextLength: String(row.note_text || '').length,
    status: row.status || null,
    created_by_user_uid: row.created_by_user_uid || null,
    updated_by_user_uid: row.updated_by_user_uid || null,
    created_at: normalizeDate(row.created_at),
    updated_at: normalizeDate(row.updated_at)
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

function buildNoteUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `admin_note_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function buildLockUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap39_admin_note_lock_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function buildAuditUid(kind) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap39_admin_note_${kind}_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function safeString(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

function buildError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY,
  buildAdminUserAdminNoteWriteConfirmed
};
