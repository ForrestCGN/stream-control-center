'use strict';

function getModuleBuild(context) {
  return (context && context.moduleBuild) || 'RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION';
}

function getSafety(context) {
  return (context && context.safety) || {
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    agentActionsEnabled: false
  };
}

function buildAdminUserWriteFoundationDiagnostic({ context } = {}) {
  const moduleBuild = getModuleBuild(context);
  const safety = getSafety(context);

  const plannedResourceKeys = [
    'admin_user:user:<userUid>',
    'admin_user:role:<roleKey>',
    'admin_user:group:<groupKey>',
    'admin_user:session:<sessionId>',
    'admin_user:permission:<permissionKey>'
  ];

  const plannedActions = [
    'admin.users.approve',
    'admin.users.block',
    'admin.users.role.grant',
    'admin.users.role.revoke',
    'admin.users.group.grant',
    'admin.users.group.revoke',
    'admin.users.session.revoke',
    'admin.users.permission.grant',
    'admin.users.permission.revoke'
  ];

  const plannedConfirmWrite = {
    required: true,
    acceptedKeys: [
      'confirmWrite',
      'confirm_write'
    ],
    acceptedValues: [
      true,
      'true',
      '1',
      1
    ],
    futureRule: 'Produktive Admin-Writes duerfen spaeter nur mit explizitem Confirm-Write ausgefuehrt werden.'
  };

  const plannedAudit = {
    required: true,
    targetTable: 'dashboard_audit_log',
    plannedFields: [
      'actor_user_uid',
      'actor_login',
      'action',
      'target_type',
      'target_uid',
      'before_json',
      'after_json',
      'reason',
      'created_at'
    ],
    futureRule: 'Jede produktive Admin-Aktion muss spaeter vor/nach-Werte und Actor nachvollziehbar auditieren.'
  };

  const plannedLocking = {
    required: true,
    targetTable: 'dashboard_locks',
    plannedLockScope: 'admin_users',
    plannedLockKeys: plannedResourceKeys,
    futureRule: 'Produktive Admin-Aenderungen duerfen spaeter nur mit aktivem Lock/Owner/Timeout-Regel laufen.'
  };

  return {
    status: 200,
    body: {
      ok: true,
      service: 'remote-modboard',
      module: 'remote_admin_user_write_foundation',
      moduleBuild,
      statusApiVersion: 'rdap_admin_users6.v1',
      readOnly: true,
      writeEnabled: false,
      databaseWriteEnabled: false,
      migrationEnabled: false,
      productiveWritesEnabled: false,
      adminWriteRoutesEnabled: false,
      userRoleWritesEnabled: false,
      userGroupWritesEnabled: false,
      sessionRevocationWritesEnabled: false,
      agentActionsEnabled: false,
      confirmWriteRequired: true,
      auditRequired: true,
      lockingRequired: true,
      backupRequiredBeforeFutureWrites: true,
      writesStillBlocked: true,
      plannedResourceKeys,
      plannedActions,
      plannedConfirmWrite,
      plannedAudit,
      plannedLocking,
      ownerAdminBoundary: {
        ownerMayManageAdminSecurityLater: true,
        adminMayManageNormalUsersLater: true,
        adminsMustNotChangeOwnerSecurityWithoutOwnScope: true,
        soundProfiIsNotAdminRole: true,
        soundProfiIsGroupOrModulePermissionMarker: true
      },
      nextAllowedSteps: [
        'Confirm-Write Helper read-only/disabled vorbereiten',
        'Audit-Write Helper mit writes deaktiviert vorbereiten',
        'Locking-Helper mit acquire/release noch deaktiviert vorbereiten',
        'Danach erst kleinsten echten Admin-Write mit Backup/Rollback und separatem Go planen'
      ],
      notImplementedInThisStep: [
        'User freigeben/sperren',
        'Rollen vergeben/entziehen',
        'Gruppen/Freigaben setzen/entfernen',
        'Sessions widerrufen',
        'DB-Migration',
        'UI-Schreibbuttons',
        'Agent-/OBS-/Sound-/Overlay-/Command-Actions'
      ],
      safety,
      notes: [
        'RDAP_ADMIN_USERS6 ist eine Confirm-/Audit-/Locking-Foundation-Diagnose.',
        'Dieser Endpunkt fuehrt keine User-/Rollen-/Gruppen-/Session-Writes aus.',
        'Produktive Admin-Writes bleiben in diesem Step absichtlich blockiert.',
        'Local/LAN/Twitch-Login bleibt als TODO geparkt, bis das Web-Dashboard stabiler ist.'
      ]
    }
  };
}

module.exports = { buildAdminUserWriteFoundationDiagnostic };
