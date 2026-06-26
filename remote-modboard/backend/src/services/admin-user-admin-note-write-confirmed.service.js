'use strict';

const crypto = require('crypto');
const { validateSessionReadOnly } = require('./auth-session-read.service');
const { readPermissionContextReadOnly } = require('./auth-permission-read.service');
const { buildDatabaseReadiness, withWriteConnection, publicDbError } = require('./db.service');
const { requireAdminConfirmWrite } = require('./admin-confirm-write.service');

const MODULE = 'remote_admin_user_admin_note_write_confirmed';
const MODULE_BUILD = 'RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION';
const STATUS_API_VERSION = 'rdap_admin_note_write61.v1';

const TABLE_NAME = 'dashboard_user_admin_notes';
const USERS_TABLE_NAME = 'dashboard_users';
const AUDIT_TABLE_NAME = 'dashboard_audit_log';
const LOCK_TABLE_NAME = 'dashboard_locks';

const REMOTE_VIEW_PERMISSION = 'remote.view';
const READ_PERMISSION = 'admin.users.note.read';
const WRITE_PERMISSION = 'admin.users.note.write';
const MAX_NOTE_TEXT_LENGTH = 5000;
const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const CONFIRMED_ACTIONS = Object.freeze([CREATE_ACTION, UPDATE_ACTION]);

const ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY = Object.freeze({
  prepared: true,
  routeFamily: '/api/remote/admin/users/admin-notes/*',
  createRoute: '/api/remote/admin/users/admin-notes/create',
  updateRoute: '/api/remote/admin/users/admin-notes/update',
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
  adminNoteUpdateEnabled: true,
  adminNoteDeactivateEnabled: false,
  uiWriteButtonsEnabled: false,
  physicalDeleteEnabled: false,
  communityPagesMayReadAdminNotes: false,
  routeRemainsRestricted: true,
  plannedFollowupStep: 'RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS'
});

async function buildAdminUserAdminNoteWriteConfirmed({ context, req, action } = {}) {
  const normalizedAction = normalizeAction(action);
  const config = context && context.config ? context.config : {};
  const body = req && req.body && typeof req.body === 'object' ? req.body : {};
  const readiness = buildDatabaseReadiness(config);
  const sessionValidation = await validateSessionReadOnly({ config, req });
  const confirm = requireAdminConfirmWrite({ body });

  const targetUserUid = normalizeUserUid(body.targetUserUid || body.target_user_uid);
  const noteUid = normalizeNoteUid(body.noteUid || body.note_uid);
  const noteText = normalizeNoteText(body.noteText || body.note_text);

  const base = buildBaseBody(context, readiness, sessionValidation, {
    action: normalizedAction,
    targetUserUid,
    noteUid,
    noteTextLength: noteText.length,
    confirm,
    req
  });

  if (!CONFIRMED_ACTIONS.includes(normalizedAction)) {
    return {
      status: 423,
      body: {
        ...base,
        ok: false,
        reason: 'admin_note_action_still_disabled_in_rdap61',
        writeExecuted: false,
        adminNoteCreateEnabled: true,
        adminNoteUpdateEnabled: true,
        adminNoteDeactivateEnabled: false,
        physicalDeleteEnabled: false
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

  const validation = validateActionInput({ action: normalizedAction, targetUserUid, noteUid, noteText });
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

      if (normalizedAction === UPDATE_ACTION) {
        return executeUpdate({ connection, base, actor, permissions: permissionSummary, tableStatus, targetUser, dashboardAccess, targetUserUid, noteUid, noteText });
      }

      return executeCreate({ connection, base, actor, permissions: permissionSummary, tableStatus, targetUser, dashboardAccess, targetUserUid, noteText });
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

async function executeCreate({ connection, base, actor, permissions, tableStatus, targetUser, dashboardAccess, targetUserUid, noteText }) {
  const now = new Date();
  const noteUid = buildNoteUid();
  const lockUid = buildLockUid();
  const resourceKey = `admin_user_note:${targetUserUid}:create`;
  const versionToken = `rdap61-${lockUid}`;
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

  const lockResult = await acquireLock(connection, { lockUid, resourceKey, actorUserUid: actor.userUid, versionToken, now });
  if (!lockResult.ok) {
    return buildLockFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, error: lockResult.error });
  }
  lockAcquired = true;

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
    return buildAuditAttemptFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, lockAcquired, lockReleased, error: err, failureReason });
  }

  try {
    await connection.execute(
      `INSERT INTO dashboard_user_admin_notes
        (note_uid, target_user_uid, note_text, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [noteUid, targetUserUid, noteText, 'active', actor.userUid, actor.userUid, now, now]
    );
    noteWritten = true;

    readBack = await readNoteByUid(connection, { noteUid, targetUserUid, includeText: true });
    if (!readBack || !readBack.exists) {
      throw buildError('admin_note_readback_missing_after_write');
    }
  } catch (err) {
    failureReason = publicDbError(err).code || 'admin_note_write_failed';
    ({ auditFailureWritten, auditFollowupFailed } = await writeFailureAudit(connection, {
      actor,
      action: 'admin.user_note.create',
      resourceKey,
      targetUserUid,
      noteUid,
      noteTextLength: noteText.length,
      lockUid,
      noteWritten,
      failureReason
    }));
    await safeReleaseLock(connection, { lockUid, now: new Date() }).then((released) => { lockReleased = released; lockReleaseFailed = !released; });
    return buildWriteFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, noteUid, lockUid, lockAcquired, lockReleased, lockReleaseFailed, auditAttemptWritten, auditFailureWritten, auditFollowupFailed, writeExecuted: noteWritten, readBack, failureReason });
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

  return buildSuccessResponse({
    base,
    actor,
    permissions,
    tableStatus,
    targetUser,
    dashboardAccess,
    action: CREATE_ACTION,
    reason: auditFollowupFailed ? 'admin_note_write_succeeded_audit_followup_failed' : (lockReleaseFailed ? 'admin_note_write_succeeded_lock_release_failed' : 'admin_note_create_executed'),
    noteUid,
    resourceKey,
    lockUid,
    lockAcquired,
    lockReleased,
    lockReleaseFailed,
    auditAttemptUid,
    auditSuccessUid,
    auditAttemptWritten,
    auditSuccessWritten,
    auditFailureWritten,
    auditFollowupFailed,
    readBack,
    warning: auditFollowupFailed || lockReleaseFailed ? failureReason : null
  });
}

async function executeUpdate({ connection, base, actor, permissions, tableStatus, targetUser, dashboardAccess, targetUserUid, noteUid, noteText }) {
  const existingNote = await readExistingNote(connection, { targetUserUid, noteUid });
  if (!existingNote.exists) {
    return {
      status: 404,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: true,
        accessReason: dashboardAccess.reason,
        reason: 'admin_note_not_found_for_target',
        actor,
        permissions,
        table: tableStatus,
        targetUser,
        existingNote,
        writeExecuted: false,
        adminNoteUpdateExecuted: false
      }
    };
  }

  if (existingNote.status !== 'active') {
    return {
      status: 409,
      body: {
        ...base,
        ok: false,
        loggedIn: true,
        dashboardAccess: true,
        accessReason: dashboardAccess.reason,
        reason: 'admin_note_update_requires_active_note',
        actor,
        permissions,
        table: tableStatus,
        targetUser,
        existingNote: redactExistingNote(existingNote),
        writeExecuted: false,
        adminNoteUpdateExecuted: false
      }
    };
  }

  const now = new Date();
  const lockUid = buildLockUid();
  const resourceKey = `admin_user_note:${noteUid}`;
  const versionToken = `rdap61-${lockUid}`;
  const auditAttemptUid = buildAuditUid('attempt');
  const auditSuccessUid = buildAuditUid('success');
  const oldNoteTextLength = existingNote.noteTextLength;
  const newNoteTextLength = noteText.length;
  let lockAcquired = false;
  let lockReleased = false;
  let updateExecuted = false;
  let readBack = null;
  let auditAttemptWritten = false;
  let auditSuccessWritten = false;
  let auditFailureWritten = false;
  let auditFollowupFailed = false;
  let lockReleaseFailed = false;
  let failureReason = null;

  const lockResult = await acquireLock(connection, { lockUid, resourceKey, actorUserUid: actor.userUid, versionToken, now });
  if (!lockResult.ok) {
    return buildLockFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, error: lockResult.error });
  }
  lockAcquired = true;

  try {
    await insertAudit(connection, {
      auditUid: auditAttemptUid,
      actor,
      source: 'remote-modboard/admin-notes',
      action: 'admin.user_note.update',
      resourceType: 'admin_user_note',
      permissionKey: WRITE_PERMISSION,
      resourceKey,
      status: 'attempt',
      errorCode: null,
      oldValueSummary: `Admin-Notiz Update vorher; target=${targetUserUid}; noteUid=${noteUid}; oldLength=${oldNoteTextLength}.`,
      newValueSummary: `Admin-Notiz Update versucht; target=${targetUserUid}; noteUid=${noteUid}; oldLength=${oldNoteTextLength}; newLength=${newNoteTextLength}.`,
      safeMetadata: {
        step: MODULE_BUILD,
        targetUserUid,
        noteUid,
        oldNoteTextLength,
        newNoteTextLength,
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
    return buildAuditAttemptFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, lockAcquired, lockReleased, error: err, failureReason });
  }

  try {
    const [result] = await connection.execute(
      `UPDATE dashboard_user_admin_notes
          SET note_text = ?, updated_by_user_uid = ?, updated_at = ?
        WHERE note_uid = ? AND target_user_uid = ? AND status = 'active'
        LIMIT 1`,
      [noteText, actor.userUid, now, noteUid, targetUserUid]
    );

    if (!result || result.affectedRows < 1) {
      throw buildError('admin_note_update_affected_no_rows');
    }
    updateExecuted = true;

    readBack = await readNoteByUid(connection, { noteUid, targetUserUid, includeText: false });
    validateUpdateReadBack({ readBack, noteUid, targetUserUid, noteTextLength: noteText.length, actorUserUid: actor.userUid });
  } catch (err) {
    failureReason = publicDbError(err).code || 'admin_note_update_failed';
    ({ auditFailureWritten, auditFollowupFailed } = await writeFailureAudit(connection, {
      actor,
      action: 'admin.user_note.update',
      resourceKey,
      targetUserUid,
      noteUid,
      noteTextLength: newNoteTextLength,
      oldNoteTextLength,
      lockUid,
      noteWritten: updateExecuted,
      failureReason
    }));
    await safeReleaseLock(connection, { lockUid, now: new Date() }).then((released) => { lockReleased = released; lockReleaseFailed = !released; });
    return buildWriteFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, noteUid, lockUid, lockAcquired, lockReleased, lockReleaseFailed, auditAttemptWritten, auditFailureWritten, auditFollowupFailed, writeExecuted: updateExecuted, readBack, failureReason, update: true });
  }

  try {
    await insertAudit(connection, {
      auditUid: auditSuccessUid,
      actor,
      source: 'remote-modboard/admin-notes',
      action: 'admin.user_note.update',
      resourceType: 'admin_user_note',
      permissionKey: WRITE_PERMISSION,
      resourceKey,
      status: 'success',
      errorCode: null,
      oldValueSummary: `Admin-Notiz Update vorher; target=${targetUserUid}; noteUid=${noteUid}; oldLength=${oldNoteTextLength}.`,
      newValueSummary: `Admin-Notiz Update erfolgreich; target=${targetUserUid}; noteUid=${noteUid}; oldLength=${oldNoteTextLength}; newLength=${newNoteTextLength}.`,
      safeMetadata: {
        step: MODULE_BUILD,
        targetUserUid,
        noteUid,
        oldNoteTextLength,
        newNoteTextLength,
        lockUid,
        auditAttemptUid,
        rawNoteTextLogged: false
      },
      completedAt: new Date()
    });
    auditSuccessWritten = true;
  } catch (err) {
    auditFollowupFailed = true;
    failureReason = 'admin_note_update_succeeded_audit_followup_failed';
  }

  lockReleased = await safeReleaseLock(connection, { lockUid, now: new Date() });
  lockReleaseFailed = !lockReleased;

  return buildSuccessResponse({
    base,
    actor,
    permissions,
    tableStatus,
    targetUser,
    dashboardAccess,
    action: UPDATE_ACTION,
    reason: auditFollowupFailed ? 'admin_note_update_succeeded_audit_followup_failed' : (lockReleaseFailed ? 'admin_note_update_succeeded_lock_release_failed' : 'admin_note_update_executed'),
    noteUid,
    resourceKey,
    lockUid,
    lockAcquired,
    lockReleased,
    lockReleaseFailed,
    auditAttemptUid,
    auditSuccessUid,
    auditAttemptWritten,
    auditSuccessWritten,
    auditFailureWritten,
    auditFollowupFailed,
    readBack,
    warning: auditFollowupFailed || lockReleaseFailed ? failureReason : null,
    oldNoteTextLength,
    newNoteTextLength
  });
}

function buildBaseBody(context, readiness, sessionValidation, { action, targetUserUid, noteUid, noteTextLength, confirm, req }) {
  return {
    service: 'remote-modboard',
    module: MODULE,
    moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: false,
    prepared: true,
    action,
    route: buildRouteForAction(action),
    routeFamily: '/api/remote/admin/users/admin-notes/*',
    tableName: TABLE_NAME,
    usersTableName: USERS_TABLE_NAME,
    auditTableName: AUDIT_TABLE_NAME,
    lockTableName: LOCK_TABLE_NAME,
    targetUserUid: targetUserUid || null,
    noteUid: noteUid || null,
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
    adminNoteUpdateEnabled: true,
    adminNoteDeactivateEnabled: false,
    createsNote: action === CREATE_ACTION,
    updatesNote: action === UPDATE_ACTION,
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
      'RDAP61 aktiviert kontrollierten Backend-Update-Write fuer aktive Admin-Notizen.',
      'Create bleibt wie bisher kontrolliert aktiv.',
      'confirmWrite wird nur aus dem JSON-Body akzeptiert.',
      'Deactivate bleibt deaktiviert.',
      'UI-Schreibbuttons bleiben fuer Update deaktiviert.',
      'Physisches Delete bleibt verboten.',
      'Raw note_text wird nicht im Audit gespeichert.'
    ]
  };
}

function validateActionInput({ action, targetUserUid, noteUid, noteText }) {
  if (!targetUserUid) return { valid: false, reason: 'missing_or_invalid_target_user_uid' };
  if (action === UPDATE_ACTION && !noteUid) return { valid: false, reason: 'missing_or_invalid_note_uid' };
  if ((action === CREATE_ACTION || action === UPDATE_ACTION) && !noteText) return { valid: false, reason: 'missing_or_empty_note_text' };
  if ((action === CREATE_ACTION || action === UPDATE_ACTION) && noteText.length > MAX_NOTE_TEXT_LENGTH) {
    return { valid: false, reason: 'note_text_too_long', maxNoteTextLength: MAX_NOTE_TEXT_LENGTH };
  }
  return { valid: true, reason: 'input_valid', maxNoteTextLength: MAX_NOTE_TEXT_LENGTH };
}

async function acquireLock(connection, { lockUid, resourceKey, actorUserUid, versionToken, now }) {
  try {
    await connection.execute(
      `INSERT INTO dashboard_locks
        (lock_uid, resource_key, owner_user_uid, status, heartbeat_at, expires_at, version_token, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lockUid,
        resourceKey,
        actorUserUid,
        'active',
        now,
        new Date(now.getTime() + 5 * 60 * 1000),
        versionToken,
        now,
        now
      ]
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
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

async function readExistingNote(connection, { targetUserUid, noteUid }) {
  const [rows] = await connection.query(
    `SELECT id, note_uid, target_user_uid, note_text, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
       FROM ${TABLE_NAME}
      WHERE target_user_uid = ? AND note_uid = ?
      LIMIT 1`,
    [targetUserUid, noteUid]
  );
  const row = rows && rows[0] ? rows[0] : null;
  if (!row) return { exists: false, noteUid, targetUserUid, status: null };
  return sanitizeNoteRow(row, { includeText: true });
}

async function readNoteByUid(connection, { noteUid, targetUserUid, includeText = true }) {
  const [rows] = await connection.query(
    `SELECT id, note_uid, target_user_uid, note_text, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
       FROM ${TABLE_NAME}
      WHERE note_uid = ? AND target_user_uid = ?
      LIMIT 1`,
    [noteUid, targetUserUid]
  );
  const row = rows && rows[0] ? rows[0] : null;
  if (!row) return { exists: false, noteUid, targetUserUid };
  return sanitizeNoteRow(row, { includeText });
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

async function writeFailureAudit(connection, { actor, action, resourceKey, targetUserUid, noteUid, noteTextLength, oldNoteTextLength, lockUid, noteWritten, failureReason }) {
  let auditFailureWritten = false;
  let auditFollowupFailed = false;
  try {
    await insertAudit(connection, {
      auditUid: buildAuditUid('failed'),
      actor,
      source: 'remote-modboard/admin-notes',
      action,
      resourceType: 'admin_user_note',
      permissionKey: WRITE_PERMISSION,
      resourceKey,
      status: 'failed',
      errorCode: failureReason,
      oldValueSummary: Number.isFinite(oldNoteTextLength) ? `Admin-Notiz vorher; target=${targetUserUid}; noteUid=${noteUid}; oldLength=${oldNoteTextLength}.` : null,
      newValueSummary: `Admin-Notiz ${action.endsWith('.update') ? 'Update' : 'Create'} fehlgeschlagen; target=${targetUserUid}; noteUid=${noteUid || 'new'}; noteTextLength=${noteTextLength}.`,
      safeMetadata: {
        step: MODULE_BUILD,
        noteUid: noteUid || null,
        targetUserUid,
        oldNoteTextLength: Number.isFinite(oldNoteTextLength) ? oldNoteTextLength : null,
        noteTextLength,
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
  return { auditFailureWritten, auditFollowupFailed };
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

function validateUpdateReadBack({ readBack, noteUid, targetUserUid, noteTextLength, actorUserUid }) {
  if (!readBack || !readBack.exists) throw buildError('admin_note_update_readback_missing');
  if (readBack.note_uid !== noteUid) throw buildError('admin_note_update_readback_note_uid_mismatch');
  if (readBack.target_user_uid !== targetUserUid) throw buildError('admin_note_update_readback_target_user_uid_mismatch');
  if (readBack.status !== 'active') throw buildError('admin_note_update_readback_status_not_active');
  if (readBack.noteTextLength !== noteTextLength) throw buildError('admin_note_update_readback_length_mismatch');
  if (readBack.updated_by_user_uid !== actorUserUid) throw buildError('admin_note_update_readback_actor_mismatch');
  if (!readBack.updated_at) throw buildError('admin_note_update_readback_missing_updated_at');
}

function buildLockFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, error }) {
  return {
    status: 423,
    body: {
      ...base,
      ok: false,
      loggedIn: true,
      dashboardAccess: true,
      accessReason: dashboardAccess.reason,
      reason: 'admin_note_lock_acquire_failed',
      error: publicDbError(error),
      actor,
      permissions,
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

function buildAuditAttemptFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, lockUid, lockAcquired, lockReleased, error, failureReason }) {
  return {
    status: 500,
    body: {
      ...base,
      ok: false,
      loggedIn: true,
      dashboardAccess: true,
      accessReason: dashboardAccess.reason,
      reason: failureReason,
      error: publicDbError(error),
      actor,
      permissions,
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

function buildWriteFailureResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, resourceKey, noteUid, lockUid, lockAcquired, lockReleased, lockReleaseFailed, auditAttemptWritten, auditFailureWritten, auditFollowupFailed, writeExecuted, readBack, failureReason, update = false }) {
  return {
    status: 500,
    body: {
      ...base,
      ok: false,
      loggedIn: true,
      dashboardAccess: true,
      accessReason: dashboardAccess.reason,
      reason: failureReason || (update ? 'admin_note_update_failed' : 'admin_note_write_failed'),
      actor,
      permissions,
      table: tableStatus,
      targetUser,
      resourceKey,
      noteUid,
      lock: { lockUid, acquired: lockAcquired, released: lockReleased, releaseFailed: lockReleaseFailed },
      auditAttemptWritten,
      auditFailureWritten,
      auditFollowupFailed,
      writeExecuted,
      adminNoteWriteExecuted: writeExecuted,
      adminNoteCreateExecuted: update ? false : writeExecuted,
      adminNoteUpdateExecuted: update ? writeExecuted : false,
      adminNoteDeactivateExecuted: false,
      physicalDeleteExecuted: false,
      readBackPerformed: Boolean(readBack),
      readBackFound: Boolean(readBack && readBack.exists)
    }
  };
}

function buildSuccessResponse({ base, actor, permissions, tableStatus, targetUser, dashboardAccess, action, reason, noteUid, resourceKey, lockUid, lockAcquired, lockReleased, lockReleaseFailed, auditAttemptUid, auditSuccessUid, auditAttemptWritten, auditSuccessWritten, auditFailureWritten, auditFollowupFailed, readBack, warning, oldNoteTextLength, newNoteTextLength }) {
  const isUpdate = action === UPDATE_ACTION;
  return {
    status: auditFollowupFailed || lockReleaseFailed ? 207 : 200,
    body: {
      ...base,
      ok: !auditFollowupFailed && !lockReleaseFailed,
      loggedIn: true,
      dashboardAccess: true,
      accessReason: dashboardAccess.reason,
      reason,
      actor,
      permissions,
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
      adminNoteCreateExecuted: !isUpdate,
      adminNoteUpdateExecuted: isUpdate,
      adminNoteDeactivateExecuted: false,
      physicalDeleteExecuted: false,
      uiWriteButtonsEnabled: false,
      readBackPerformed: true,
      readBackFound: Boolean(readBack && readBack.exists),
      noteTextReturned: !isUpdate,
      oldNoteTextLength: Number.isFinite(oldNoteTextLength) ? oldNoteTextLength : null,
      newNoteTextLength: Number.isFinite(newNoteTextLength) ? newNoteTextLength : null,
      note: readBack,
      warning
    }
  };
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

function sanitizeNoteRow(row, { includeText = true } = {}) {
  const result = {
    exists: true,
    id: row.id,
    note_uid: row.note_uid,
    target_user_uid: row.target_user_uid,
    noteTextLength: String(row.note_text || '').length,
    status: row.status || null,
    created_by_user_uid: row.created_by_user_uid || null,
    updated_by_user_uid: row.updated_by_user_uid || null,
    created_at: normalizeDate(row.created_at),
    updated_at: normalizeDate(row.updated_at)
  };
  if (includeText) result.note_text = row.note_text;
  return result;
}

function redactExistingNote(note) {
  if (!note || !note.exists) return note;
  return {
    exists: true,
    note_uid: note.note_uid,
    target_user_uid: note.target_user_uid,
    noteTextLength: note.noteTextLength,
    status: note.status,
    created_at: note.created_at,
    updated_at: note.updated_at
  };
}

function buildRouteForAction(action) {
  if (action === UPDATE_ACTION) return '/api/remote/admin/users/admin-notes/update';
  return '/api/remote/admin/users/admin-notes/create';
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

function buildNoteUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `admin_note_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function buildLockUid() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap61_admin_note_lock_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
}

function buildAuditUid(kind) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `rdap61_admin_note_${kind}_${stamp}_${crypto.randomBytes(6).toString('hex')}`;
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
