'use strict';

const { buildDatabaseReadiness } = require('./db.service');

const MODULE = 'remote_admin_user_admin_note_write_plan';
const MODULE_BUILD = 'RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN';
const STATUS_API_VERSION = 'rdap_admin_note_write38.v1';
const TABLE_NAME = 'dashboard_user_admin_notes';
const USERS_TABLE_NAME = 'dashboard_users';
const AUDIT_TABLE_NAME = 'dashboard_audit_log';
const LOCK_TABLE_NAME = 'dashboard_locks';

const REMOTE_VIEW_PERMISSION = 'remote.view';
const READ_PERMISSION = 'admin.users.note.read';
const WRITE_PERMISSION = 'admin.users.note.write';
const MAX_NOTE_TEXT_LENGTH = 5000;

async function buildAdminUserAdminNoteWritePlan({ context, req } = {}) {
  const config = context && context.config ? context.config : {};
  const readiness = buildDatabaseReadiness(config);

  return {
    status: 200,
    body: {
      ok: true,
      service: 'remote-modboard',
      module: MODULE,
      moduleBuild: (context && context.moduleBuild) || MODULE_BUILD,
      routeBuild: MODULE_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      readOnly: true,
      routeRemainsReadOnly: true,
      prepared: true,
      action: 'admin_note_write_plan',
      route: '/api/remote/admin/users/admin-notes/write-plan',
      method: 'GET',
      tableName: TABLE_NAME,
      usersTableName: USERS_TABLE_NAME,
      auditTableName: AUDIT_TABLE_NAME,
      lockTableName: LOCK_TABLE_NAME,
      database: readiness,
      safety: context ? context.safety : null,
      request: buildRequestInfo(req),
      writePlanPrepared: true,
      writeEnabled: false,
      databaseWriteEnabled: false,
      productiveWritesEnabled: false,
      writesStillBlocked: true,
      adminNoteWritesEnabled: false,
      adminNoteCreateEnabled: false,
      adminNoteUpdateEnabled: false,
      adminNoteDeactivateEnabled: false,
      auditProductiveWritesEnabled: false,
      lockProductiveWritesEnabled: false,
      uiWriteButtonsEnabled: false,
      physicalDeleteEnabled: false,
      communityPagesMayReadAdminNotes: false,
      routeCreatesRoutesOnly: true,
      plannedPermissions: {
        remoteView: REMOTE_VIEW_PERMISSION,
        read: READ_PERMISSION,
        write: WRITE_PERMISSION,
        writePermissionRequired: WRITE_PERMISSION,
        permissionTargetType: 'global',
        permissionTargetKey: '*'
      },
      plannedConfirmWrite: {
        required: true,
        bodyOnly: true,
        acceptedKeys: ['confirmWrite', 'confirm_write'],
        queryConfirmAccepted: false,
        note: 'RDAP39 darf confirmWrite nur aus JSON-Body akzeptieren.'
      },
      plannedActions: {
        create: buildCreatePlan(),
        update: buildUpdatePlan(),
        deactivate: buildDeactivatePlan()
      },
      plannedWritePipeline: [
        'validate_session',
        'check_dashboard_access',
        'check_remote_view_permission',
        'check_admin_users_note_write_permission',
        'require_body_confirm_write',
        'validate_input',
        'read_target_user',
        'check_admin_note_table_schema',
        'acquire_lock',
        'write_audit_attempt',
        'execute_admin_note_write',
        'read_back_admin_note',
        'write_audit_success_or_failure',
        'release_lock',
        'return_sanitized_response'
      ],
      plannedFailurePolicy: buildFailurePolicy(),
      plannedBackupPolicy: {
        requiredBeforeFirstProductiveWrite: true,
        table: TABLE_NAME,
        suggestedBackupCommand: 'mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_user_admin_notes > /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap39_before_admin_note_write_$(date +%Y%m%d_%H%M%S).sql',
        verifyBackupNotEmpty: true,
        rollbackIsManual: true,
        physicalDeleteRollbackForbidden: true
      },
      plannedAuditFields: {
        source: 'remote-modboard/admin-notes',
        resourceType: 'admin_user_note',
        permissionKey: WRITE_PERMISSION,
        statuses: ['attempt', 'success', 'failed', 'denied', 'blocked'],
        safeMetadataOnly: true,
        secretsLogged: false,
        includeNoteTextRaw: false,
        includeNoteTextLength: true,
        includeTargetUserUid: true,
        includeNoteUid: true,
        includeLockUid: true,
        includeRequestIdWhenAvailable: true,
        includeCorrelationIdWhenAvailable: true
      },
      plannedLockPolicy: {
        acquireRequired: true,
        heartbeatRequiredForLongWrites: true,
        releaseRequired: true,
        forceTakeoverEnabled: false,
        physicalDeleteEnabled: false,
        ownerUserUid: '<actor_user_uid>',
        statusAfterSuccess: 'released',
        resourceKeys: {
          create: 'admin_user_note:<target_user_uid>:create',
          update: 'admin_user_note:<note_uid>:update',
          deactivate: 'admin_user_note:<note_uid>:deactivate'
        }
      },
      plannedReadBack: {
        requiredAfterWrite: true,
        sanitized: true,
        exposeRawNoteTextToApiCaller: true,
        exposeSecrets: false,
        communityPagesReadStillDisabled: true
      },
      plannedNextStep: 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED',
      nextStepAllowedOnlyAfter: [
        'RDAP38 plan reviewed and accepted',
        'dashboard_user_admin_notes schema confirmed',
        'backup command prepared and tested',
        'permission check path confirmed',
        'lock/audit failure policy accepted'
      ],
      notes: [
        'RDAP38 plant den ersten echten Admin-Notiz-Write, fuehrt ihn aber nicht aus.',
        'Bestehende disabled Admin-Notiz-Routen bleiben unveraendert blockiert.',
        'Keine UI-Schreibbuttons werden aktiviert.',
        'RDAP39 darf erst nach ausdruecklichem Go und Backup einen kontrollierten Backend-Write bauen.',
        'Physisches Delete bleibt verboten; Deactivate darf spaeter nur Status aendern.'
      ]
    }
  };
}

function buildCreatePlan() {
  return {
    action: 'create',
    route: '/api/remote/admin/users/admin-notes/create',
    currentlyEnabled: false,
    plannedEnableStep: 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED',
    requiredInput: ['targetUserUid', 'noteText', 'confirmWrite'],
    optionalInput: [],
    maxNoteTextLength: MAX_NOTE_TEXT_LENGTH,
    tableWrite: 'INSERT dashboard_user_admin_notes',
    createsNote: true,
    updatesNote: false,
    deactivatesNote: false,
    physicalDelete: false,
    resourceKey: 'admin_user_note:<target_user_uid>:create',
    auditAction: 'admin.user_note.create',
    readBack: 'read created note by note_uid and target_user_uid'
  };
}

function buildUpdatePlan() {
  return {
    action: 'update',
    route: '/api/remote/admin/users/admin-notes/update',
    currentlyEnabled: false,
    plannedEnableStep: 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED',
    requiredInput: ['targetUserUid', 'noteUid', 'noteText', 'confirmWrite'],
    optionalInput: [],
    maxNoteTextLength: MAX_NOTE_TEXT_LENGTH,
    tableWrite: 'UPDATE dashboard_user_admin_notes SET note_text, updated_by_user_uid, updated_at',
    createsNote: false,
    updatesNote: true,
    deactivatesNote: false,
    physicalDelete: false,
    resourceKey: 'admin_user_note:<note_uid>:update',
    auditAction: 'admin.user_note.update',
    readBack: 'read updated note by note_uid and target_user_uid'
  };
}

function buildDeactivatePlan() {
  return {
    action: 'deactivate',
    route: '/api/remote/admin/users/admin-notes/deactivate',
    currentlyEnabled: false,
    plannedEnableStep: 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED',
    requiredInput: ['targetUserUid', 'noteUid', 'confirmWrite'],
    optionalInput: [],
    tableWrite: 'UPDATE dashboard_user_admin_notes SET status, updated_by_user_uid, updated_at',
    createsNote: false,
    updatesNote: false,
    deactivatesNote: true,
    physicalDelete: false,
    resourceKey: 'admin_user_note:<note_uid>:deactivate',
    auditAction: 'admin.user_note.deactivate',
    readBack: 'read deactivated note by note_uid and target_user_uid'
  };
}

function buildFailurePolicy() {
  return {
    permissionDenied: {
      acquireLock: false,
      writeAdminNote: false,
      auditPolicy: 'denied audit only when audit write path is safely available; otherwise no write',
      responseReason: 'admin_note_write_permission_denied'
    },
    confirmMissing: {
      acquireLock: false,
      writeAdminNote: false,
      auditPolicy: 'no audit required for missing confirm in RDAP39 unless explicitly approved',
      responseReason: 'confirm_write_required'
    },
    lockAcquireFailed: {
      writeAdminNote: false,
      auditPolicy: 'audit blocked/failed if audit path available',
      releaseLock: false,
      responseReason: 'admin_note_lock_acquire_failed'
    },
    auditAttemptFailedBeforeWrite: {
      writeAdminNote: false,
      releaseLock: true,
      responseReason: 'admin_note_audit_attempt_failed'
    },
    adminNoteWriteFailedAfterLock: {
      auditFailure: true,
      releaseLock: true,
      responseReason: 'admin_note_write_failed'
    },
    auditSuccessFailedAfterWrite: {
      rollbackByDelete: false,
      releaseLock: true,
      responseReason: 'admin_note_write_succeeded_audit_followup_failed',
      markResponseField: 'auditFollowupFailed'
    },
    lockReleaseFailedAfterWrite: {
      rollbackByDelete: false,
      responseReason: 'admin_note_write_succeeded_lock_release_failed',
      markResponseField: 'lockReleaseFailed',
      requireFollowupDiagnostic: true
    }
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

module.exports = {
  MODULE_BUILD,
  STATUS_API_VERSION,
  buildAdminUserAdminNoteWritePlan
};
