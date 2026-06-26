'use strict';

const os = require('os');
const { buildPublicConfigSummary } = require('../services/config.service');
const { checkDatabaseHealth } = require('../services/db-health.service');
const { ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY } = require('../services/admin-user-admin-note-write-confirmed.service');
const { buildAgentStatusSummary } = require('../services/agent-status.service');

const RDAP62_STATUS_API_VERSION = 'rdap_admin_note_update_status62.v1';
const RDAP62_BUILD = 'RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP';

function registerStatusRoutes(app, context) {
  app.get('/api/remote/status', async (req, res) => {
    const db = await checkDatabaseHealth(context.config, { connect: req.query.db === '1' });
    const publicConfig = buildPublicConfigSummary(context.config);
    const authEnabled = Boolean(publicConfig.auth.authEnabled);
    const oauthEnabled = Boolean(publicConfig.auth.twitchOAuth.effectiveEnabled);
    const sessionsEnabled = Boolean(publicConfig.auth.sessions.effectiveEnabled);

    res.json({
      ok: true,
      service: 'remote-modboard',
      module: 'remote_node_base',
      moduleBuild: context.moduleBuild,
      statusApiVersion: RDAP62_STATUS_API_VERSION,
      readOnly: false,
      writeEnabled: false,
      actionEnabled: false,
      productiveAgentRuntime: false,
      generatedAt: new Date().toISOString(),
      publicHost: 'mods.forrestcgn.de',
      webserver: 'web.cgn.community',
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        hostname: safeHostname(),
        uptimeSec: Math.floor(process.uptime()),
        pid: process.pid
      },
      config: publicConfig,
      dashboardAccess: publicConfig.dashboardAccess,
      centralAuth: {
        ...publicConfig.centralAuth,
        entryRoutePrepared: true,
        directModboardLoginAllowed: true,
        mainSiteLoginAllowed: true,
        sharedDatabaseIsTarget: true,
        noLoginDataInFrontend: true,
        noTokensInLinks: true
      },
      auth: {
        prepared: true,
        enabled: authEnabled,
        loginEnabled: authEnabled,
        loginEntryPath: publicConfig.auth.loginEntryPath,
        twitchOAuth: {
          ...publicConfig.auth.twitchOAuth,
          startRouteSkeletonPresent: true,
          callbackRouteSkeletonPresent: true,
          startRouteEnabled: oauthEnabled,
          callbackRouteEnabled: oauthEnabled,
          redirectToTwitch: oauthEnabled,
          tokenExchangeEnabled: oauthEnabled
        },
        sessions: {
          ...publicConfig.auth.sessions,
          storePrepared: true,
          readOnlyValidationPrepared: true,
          readOnlyValidationEnabled: true,
          readsDashboardSessions: true,
          createSession: sessionsEnabled,
          setCookie: sessionsEnabled,
          refreshSession: false,
          updateLastSeen: false,
          databaseWriteEnabled: Boolean(context.config.auth.sessionWriteEnabled),
          effectiveEnabled: sessionsEnabled
        },
        permissions: {
          middlewarePlanned: true,
          readOnlyResolverPrepared: true,
          diagnosticCheckRoutePrepared: true,
          adminUsersPermissionDiagnosticPrepared: true,
          adminUsersAdminNoteDiagnosticPrepared: true,
          adminUsersConfirmWriteHelperPrepared: true,
          adminUsersAuditHelperPrepared: true,
          adminUsersLockHelperPrepared: true,
          confirmWriteHelperPrepared: true,
          auditHelperPrepared: true,
          lockHelperPrepared: true,
          auditWriteEnabled: false,
          lockWriteEnabled: false,
          lockAcquireEnabled: false,
          lockHeartbeatEnabled: false,
          lockReleaseEnabled: false,
          lockForceTakeoverEnabled: false,
          checkRouteEnabled: true,
          productiveAuthorizationEnabled: false,
          backendMustDecideRights: true,
          frontendIsDisplayOnly: true,
          writesRequirePermissionLockAudit: true
        },
        notes: [
          'RDAP39 aktiviert den kontrollierten Backend-Create-Write fuer Admin-Notizen.',
          'RDAP40 hat die Create-UI bewusst fuer write-berechtigte Admins vorbereitet.',
          'RDAP61 aktiviert den kontrollierten Backend-Update-Write fuer aktive Admin-Notizen.',
          'RDAP62 bereinigt nur Status-Semantik; keine neue UI-Funktion.',
          'Twitch Login und Session-Handling bleiben aktiv und unveraendert.',
          'Admin-Notiz Update-UI, Deactivate und Delete bleiben deaktiviert.',
          'RDAP80 ergaenzt nur Agent-Status/Heartbeat-Foundation read-only; Remote-Actions bleiben deaktiviert.'
        ]
      },
      adminNoteWritePlan: {
        prepared: true,
        route: '/api/remote/admin/users/admin-notes/write-plan',
        method: 'GET',
        statusApiVersion: 'rdap_admin_note_write38.v1',
        tableName: 'dashboard_user_admin_notes',
        permissionRequired: 'admin.users.note.write',
        confirmWriteRequired: true,
        bodyConfirmOnly: true,
        auditRequired: true,
        lockRequired: true,
        backupRequiredBeforeProductiveWrite: true,
        readBackRequired: true,
        writeEnabled: false,
        productiveWritesEnabled: false,
        adminNoteWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        physicalDeleteEnabled: false,
        routeRemainsReadOnly: true
      },
      adminNoteWriteConfirmed: buildAdminNoteWriteConfirmedUiSemantics(),
      adminNoteUiStatusSemantics: buildAdminNoteUiStatusSemantics(),
      adminUsersWriteFoundation: {
        routePrepared: true,
        confirmWriteHelperPrepared: true,
        confirmWriteHelperEnabledForRealWrites: false,
        auditHelperPrepared: true,
        auditWriteEnabled: true,
        auditInsertEnabled: true,
        auditUpdateEnabled: false,
        lockHelperPrepared: true,
        lockingHelperPrepared: true,
        lockWriteEnabled: true,
        lockAcquireEnabled: true,
        lockHeartbeatEnabled: false,
        lockReleaseEnabled: true,
        lockForceTakeoverEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlockedForNonCreateActions: false,
        auditRequiredForFutureWrites: true,
        lockingRequiredForFutureWrites: true,
        backupRequiredBeforeFutureWrites: true,
        statusSemanticsCleanupBuild: RDAP62_BUILD,
        note: 'Create und Update sind als Admin-Note Backend-Writes aktiviert; Deactivate/Delete bleiben deaktiviert.'
      },
      database: db,
      agent: buildAgentStatusSummary(),
      permissionsModel: {
        active: false,
        diagnosticReadOnlyResolverPrepared: true,
        adminUsersPermissionDiagnosticPrepared: true,
        adminUsersAdminNoteDiagnosticPrepared: true,
        adminUsersConfirmWriteHelperPrepared: true,
        adminUsersAuditHelperPrepared: true,
        adminUsersLockHelperPrepared: true,
        plannedModel: 'RDAP5C3 roles-and-groups-separated',
        rolesAreSeparateFromGroups: true,
        soundProfiIsRole: false,
        soundProfiIsGroupMarker: true,
        modulePermissionMatrixUsesTargetTypeAndTargetKey: true,
        productivePermissionEnforcementEnabled: true
      },
      localLanMode: {
        planned: true,
        implemented: false,
        twitchLoginPlanned: true,
        engelCgnLanAccessPlanned: true,
        todoParkedUntilWebDashboardStable: true
      },
      safety: context.safety
    });
  });
}

function buildAdminNoteWriteConfirmedUiSemantics() {
  return {
    ...ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY,
    statusApiVersion: RDAP62_STATUS_API_VERSION,
    routeStatusCleanupBuild: RDAP62_BUILD,
    backendAutoUiWriteButtonsEnabled: false,
    createBackendEnabled: true,
    updateBackendEnabled: true,
    deactivateBackendEnabled: false,
    deleteBackendEnabled: false,
    uiWriteButtonsEnabled: true,
    uiWriteButtonsEnabledMeaning: 'Nur die RDAP40-Create-UI ist vorbereitet; RDAP62 aktiviert keine UI automatisch.',
    adminNoteCreateUiPrepared: true,
    adminNoteCreateButtonVisibleForWritePermission: true,
    adminNoteUpdateBackendEnabled: true,
    adminNoteUpdateUiPrepared: false,
    adminNoteDeactivateUiPrepared: false,
    adminNoteDeleteUiPrepared: false,
    adminNoteCreateButtonUsesExistingRoute: '/api/remote/admin/users/admin-notes/create',
    adminNoteUpdateBackendRoute: '/api/remote/admin/users/admin-notes/update',
    adminNoteCreateUiRequiresServerPermission: 'admin.users.note.write',
    adminNoteUpdateBackendRequiresServerPermission: 'admin.users.note.write',
    adminNoteCreateUiRequiresBodyConfirmWrite: true,
    adminNoteUpdateBackendRequiresBodyConfirmWrite: true,
    adminNoteUiReadbackRoute: '/api/remote/admin/users/admin-notes/read',
    noNewUiFunctionInRdap62: true
  };
}

function buildAdminNoteUiStatusSemantics() {
  return {
    prepared: true,
    statusApiVersion: RDAP62_STATUS_API_VERSION,
    routeStatusCleanupBuild: RDAP62_BUILD,
    purpose: 'RDAP62 bereinigt Status-Semantik nach RDAP61; keine neue UI-Funktion.',
    backendAutoUiWriteButtonsEnabled: false,
    adminNoteCreateBackendEnabled: true,
    adminNoteCreateUiPrepared: true,
    adminNoteCreateButtonVisibleForWritePermission: true,
    adminNoteCreateRoutePrepared: true,
    adminNoteCreateRoute: '/api/remote/admin/users/admin-notes/create',
    adminNoteUpdateBackendEnabled: true,
    adminNoteUpdateRoutePrepared: true,
    adminNoteUpdateRoute: '/api/remote/admin/users/admin-notes/update',
    adminNoteUpdateUiPrepared: false,
    adminNoteReadbackRoute: '/api/remote/admin/users/admin-notes/read',
    adminNoteDeactivateEnabled: false,
    adminNoteDeactivateUiPrepared: false,
    adminNoteDeleteUiPrepared: false,
    physicalDeleteEnabled: false,
    communityPagesMayReadAdminNotes: false,
    databaseMigrationExecuted: false,
    permissionChangesExecuted: false,
    newUiFunctionEnabled: false,
    notes: [
      'RDAP40 hat die Create-UI bewusst freigegeben, aber nur fuer write-berechtigte Admins.',
      'RDAP61 hat das Admin-Note Update-Backend aktiviert.',
      'RDAP62 trennt Status-Semantik: Update-Backend aktiv, Update-UI nicht gebaut.',
      'Deactivate und Delete bleiben deaktiviert.',
      'Community-Read bleibt verboten.'
    ]
  };
}

function safeHostname() {
  try {
    return os.hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = { registerStatusRoutes };
