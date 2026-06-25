'use strict';

const os = require('os');
const { buildPublicConfigSummary } = require('../services/config.service');
const { checkDatabaseHealth } = require('../services/db-health.service');
const { ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY } = require('../services/admin-user-admin-note-write-confirmed.service');

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
      statusApiVersion: 'rdap_admin_note_write39.v1',
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
          'RDAP39 aktiviert nur den kontrollierten Backend-Create-Write fuer Admin-Notizen.',
          'Twitch Login und Session-Handling bleiben aktiv und unveraendert.',
          'Admin-Notiz Update/Deactivate bleiben deaktiviert.',
          'UI-Schreibbuttons bleiben deaktiviert.',
          'Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Command-Steuerung bleiben deaktiviert.'
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
      adminNoteWriteConfirmed: ADMIN_NOTE_WRITE_CONFIRMED_SUMMARY,
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
        writesStillBlockedForNonCreateActions: true,
        auditRequiredForFutureWrites: true,
        lockingRequiredForFutureWrites: true,
        backupRequiredBeforeFutureWrites: true
      },
      database: db,
      agent: {
        enabled: false,
        connected: false,
        actionsEnabled: false,
        plannedTransport: 'wss',
        plannedDirection: 'stream-pc-agent-to-webserver'
      },
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

function safeHostname() {
  try {
    return os.hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = { registerStatusRoutes };
