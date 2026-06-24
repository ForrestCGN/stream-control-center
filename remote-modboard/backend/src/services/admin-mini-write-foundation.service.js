'use strict';

const { evaluateAdminConfirmWrite, buildAdminConfirmWriteDiagnostic } = require('./admin-confirm-write.service');
const { buildAdminAuditDraft, buildAdminAuditWriteDiagnostic } = require('./admin-audit-write.service');
const { buildAdminLockOperationDraft, blockAdminLockOperation, buildAdminLockWriteDiagnostic } = require('./admin-lock-write.service');

const MODULE = 'remote_admin_mini_write_foundation';
const MODULE_BUILD = 'RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED';
const STATUS_API_VERSION = 'rdap_admin_users11.v1';

const FOUNDATION_WRITE_ENABLED = false;

const PLANNED_MINI_WRITE_ACTIONS = Object.freeze([
  'admin.users.approve.disabled_foundation',
  'admin.users.block.disabled_foundation',
  'admin.users.session.revoke.disabled_foundation'
]);

const REQUIRED_CHAIN = Object.freeze([
  'permission_check',
  'confirm_write',
  'audit_draft',
  'lock_draft',
  'backup_snapshot',
  'rollback_plan'
]);

function getModuleBuild(context) {
  return (context && context.moduleBuild) || MODULE_BUILD;
}

function getSafety(context) {
  return (context && context.safety) || {
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    agentActionsEnabled: false
  };
}

async function buildAdminMiniWriteFoundationDiagnostic({ context, req } = {}) {
  const requestInput = buildRequestInput(req);
  const confirmEvaluation = evaluateAdminConfirmWrite(requestInput);
  const permissionDraft = buildPermissionDraft(requestInput);
  const auditDraft = buildAuditDraft(requestInput);
  const lockDraft = buildLockDraft(requestInput);
  const backupRollback = buildBackupRollbackPlan(requestInput);
  const chain = buildFoundationChain({ permissionDraft, confirmEvaluation, auditDraft, lockDraft, backupRollback });

  return {
    status: 200,
    body: {
      ok: true,
      service: 'remote-modboard',
      module: MODULE,
      moduleBuild: getModuleBuild(context),
      foundationBuild: MODULE_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      readOnly: true,
      writeEnabled: false,
      databaseWriteEnabled: false,
      migrationEnabled: false,
      productiveWritesEnabled: false,
      adminWriteRoutesEnabled: false,
      miniWriteFoundationPrepared: true,
      miniWriteFoundationWriteEnabled: FOUNDATION_WRITE_ENABLED,
      writesStillBlocked: true,
      confirmsButDoesNotWrite: true,
      auditsButDoesNotInsert: true,
      locksButDoesNotAcquire: true,
      backupRollbackPlannedButNotExecuted: true,
      userApprovalEnabled: false,
      userBlockEnabled: false,
      roleGrantEnabled: false,
      roleRevokeEnabled: false,
      groupGrantEnabled: false,
      groupRevokeEnabled: false,
      sessionRevokeEnabled: false,
      uiWriteButtonsEnabled: false,
      agentActionsEnabled: false,
      obsControlEnabled: false,
      soundControlEnabled: false,
      overlayControlEnabled: false,
      commandControlEnabled: false,
      plannedMiniWriteActions: PLANNED_MINI_WRITE_ACTIONS.slice(),
      requiredChain: REQUIRED_CHAIN.slice(),
      chain,
      permissionDraft,
      confirmWrite: {
        required: true,
        acceptedInRequest: Boolean(confirmEvaluation.confirmWriteAccepted),
        acceptedButStillBlocked: Boolean(confirmEvaluation.confirmWriteAccepted),
        reason: confirmEvaluation.reason,
        diagnostic: buildAdminConfirmWriteDiagnostic()
      },
      auditDraft,
      auditDiagnostic: buildAdminAuditWriteDiagnostic(),
      lockDraft,
      lockDiagnostic: buildAdminLockWriteDiagnostic(),
      backupRollback,
      nextAllowedSteps: [
        'Einen kleinsten echten Admin-Write separat auswaehlen und planen.',
        'Vor jedem echten Write DB-Backup und Rollback-Befehl dokumentieren.',
        'Erst danach mit separatem Go eine weiterhin hart gegatete Write-Route bauen.',
        'UI-Schreibbuttons erst nach bestaetigter Backend-Write-Sicherheit vorbereiten.'
      ],
      notImplementedInThisStep: [
        'User freigeben/sperren',
        'Rollen vergeben/entziehen',
        'Gruppen/Freigaben setzen/entfernen',
        'Sessions widerrufen',
        'DB-Migration',
        'Audit-Inserts oder Audit-Updates',
        'Lock acquire/heartbeat/release/force-takeover',
        'Backup-Ausfuehrung',
        'Rollback-Ausfuehrung',
        'UI-Schreibbuttons',
        'Agent-/OBS-/Sound-/Overlay-/Command-Actions'
      ],
      safety: getSafety(context),
      notes: [
        'RDAP_ADMIN_USERS11 bereitet nur eine zentrale Mini-Write-Foundation vor.',
        'Dieser Endpunkt ist GET/read-only und fuehrt keine produktiven Writes aus.',
        'confirmWrite=true kann testweise erkannt werden, schaltet aber keine Writes frei.',
        'Audit- und Lock-Drafts werden nur gebaut/geprueft, nicht gespeichert.',
        'Backup/Rollback ist Pflicht fuer den spaeteren echten Mini-Write, wird hier aber nicht ausgefuehrt.'
      ]
    }
  };
}

function buildRequestInput(req) {
  const query = req && req.query && typeof req.query === 'object' ? req.query : {};
  return {
    confirmWrite: query.confirmWrite,
    confirm_write: query.confirm_write,
    actorUserUid: String(query.actorUserUid || query.actor_user_uid || 'user_forrestcgn_diagnostic').trim(),
    actorLogin: String(query.actorLogin || query.actor_login || 'ForrestCGN').trim(),
    action: String(query.action || 'admin.users.approve.disabled_foundation').trim(),
    resourceType: String(query.resourceType || query.resource_type || 'admin_user').trim(),
    resourceKey: String(query.resourceKey || query.resource_key || 'admin_user:user:diagnostic').trim(),
    status: 'blocked_by_step_scope',
    reason: String(query.reason || 'RDAP11 diagnostic only; writes disabled').trim(),
    safeMetadata: {
      step: MODULE_BUILD,
      source: 'mini_write_foundation_diagnostic',
      writeEnabled: false,
      exampleOnly: true
    },
    lockScope: String(query.lockScope || query.lock_scope || 'admin_users').trim()
  };
}

function buildPermissionDraft(input) {
  return {
    ok: true,
    required: true,
    prepared: true,
    readOnly: true,
    writeEnabled: false,
    productiveAuthorizationEnabled: false,
    requiredPermission: 'remote.admin.users.write',
    targetType: 'global',
    targetKey: '*',
    actorUserUid: input.actorUserUid,
    actorLogin: input.actorLogin,
    canWriteNow: false,
    wouldNeedOwnerOrAdmin: true,
    soundProfiIsNotAdminRole: true,
    reason: 'permission_step_prepared_but_productive_authorization_disabled'
  };
}

function buildAuditDraft(input) {
  const draft = buildAdminAuditDraft({
    actorUserUid: input.actorUserUid,
    actorLogin: input.actorLogin,
    action: input.action,
    resourceType: input.resourceType,
    resourceKey: input.resourceKey,
    status: input.status,
    reason: input.reason,
    safeMetadata: input.safeMetadata
  });

  return {
    ...draft,
    required: true,
    plannedButNotInserted: true,
    databaseInsertEnabled: false
  };
}

function buildLockDraft(input) {
  const draft = buildAdminLockOperationDraft({
    operation: 'acquire',
    input: {
      resourceType: input.resourceType,
      resourceKey: input.resourceKey,
      actorUserUid: input.actorUserUid,
      actorLogin: input.actorLogin,
      lockScope: input.lockScope,
      reason: input.reason
    }
  });

  const blocked = blockAdminLockOperation({
    operation: 'acquire',
    input: {
      resourceType: input.resourceType,
      resourceKey: input.resourceKey,
      actorUserUid: input.actorUserUid,
      actorLogin: input.actorLogin,
      lockScope: input.lockScope,
      reason: input.reason
    }
  });

  return {
    ...draft,
    required: true,
    plannedButNotAcquired: true,
    databaseWriteEnabled: false,
    blockedAcquire: blocked
  };
}

function buildBackupRollbackPlan(input) {
  return {
    ok: true,
    required: true,
    prepared: true,
    executed: false,
    databaseBackupRequired: true,
    rollbackCommandRequired: true,
    migrationAllowed: false,
    destructiveRollbackAllowed: false,
    targetResourceType: input.resourceType,
    targetResourceKey: input.resourceKey,
    minimumFutureChecklist: [
      'DB-Backup vor dem Write erstellen.',
      'Betroffene Tabelle(n) und Datensatz-Key dokumentieren.',
      'Rollback-Befehl fuer exakt diesen Mini-Write dokumentieren.',
      'Audit-Draft vor dem Write bauen.',
      'Lock vor dem Write erwerben und nachher freigeben.',
      'Confirm-Write und Permission pruefen.',
      'Nach dem Write gezielte Read-Back-Pruefung ausfuehren.'
    ],
    reason: 'backup_rollback_plan_prepared_but_not_executed'
  };
}

function buildFoundationChain({ permissionDraft, confirmEvaluation, auditDraft, lockDraft, backupRollback }) {
  return {
    okForFuturePlanning: true,
    okForCurrentWrite: false,
    currentWriteBlocked: true,
    steps: [
      {
        key: 'permission_check',
        required: true,
        prepared: Boolean(permissionDraft && permissionDraft.prepared),
        passedForCurrentWrite: false,
        reason: permissionDraft.reason
      },
      {
        key: 'confirm_write',
        required: true,
        prepared: true,
        passedForCurrentWrite: false,
        acceptedInRequest: Boolean(confirmEvaluation && confirmEvaluation.confirmWriteAccepted),
        reason: confirmEvaluation ? confirmEvaluation.reason : 'confirm_write_not_checked'
      },
      {
        key: 'audit_draft',
        required: true,
        prepared: Boolean(auditDraft && auditDraft.auditHelperPrepared),
        passedForCurrentWrite: false,
        draftValid: Boolean(auditDraft && auditDraft.draftValid),
        reason: auditDraft ? auditDraft.reason : 'audit_draft_not_checked'
      },
      {
        key: 'lock_draft',
        required: true,
        prepared: Boolean(lockDraft && lockDraft.helperPrepared),
        passedForCurrentWrite: false,
        draftValid: Boolean(lockDraft && lockDraft.draftValid),
        reason: lockDraft ? lockDraft.reason : 'lock_draft_not_checked'
      },
      {
        key: 'backup_snapshot',
        required: true,
        prepared: Boolean(backupRollback && backupRollback.prepared),
        passedForCurrentWrite: false,
        executed: false,
        reason: backupRollback ? backupRollback.reason : 'backup_plan_not_checked'
      },
      {
        key: 'rollback_plan',
        required: true,
        prepared: Boolean(backupRollback && backupRollback.rollbackCommandRequired),
        passedForCurrentWrite: false,
        executed: false,
        reason: backupRollback ? backupRollback.reason : 'rollback_plan_not_checked'
      }
    ]
  };
}

module.exports = {
  MODULE,
  MODULE_BUILD,
  STATUS_API_VERSION,
  FOUNDATION_WRITE_ENABLED,
  PLANNED_MINI_WRITE_ACTIONS,
  REQUIRED_CHAIN,
  buildAdminMiniWriteFoundationDiagnostic
};
