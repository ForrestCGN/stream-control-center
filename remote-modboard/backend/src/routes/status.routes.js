'use strict';

const os = require('os');
const { buildPublicConfigSummary } = require('../services/config.service');
const { checkDatabaseHealth } = require('../services/db-health.service');

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
      statusApiVersion: 'rdap_admin_note_write38.v1',
      readOnly: !authEnabled,
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
          'RDAP_ADMIN_USERS9 bereitet einen Locking-Helper vor, aber Lock-/Audit-/Admin-Writes bleiben deaktiviert.',
          'Twitch Login und Session-Handling bleiben aktiv und unveraendert.',
          'RDAP5 Admin-User-Permission-Diagnose bleibt read-only verfuegbar.',
          'RDAP6/RDAP7/RDAP8 Write-Foundation/Confirm/Audit-Diagnosen bleiben read-only verfuegbar.',
          'Login-Daten, Twitch-Tokens oder Sessionwerte duerfen nicht im Frontend oder in Links weitergereicht werden.',
          'Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Command-Steuerung bleiben deaktiviert.',
          'RDAP14 Admin-Notiz-Diagnose prueft nur lesend, ob die spaetere Notiz-Tabelle vorbereitet ist.',
          'RDAP14B synchronisiert die Routenuebersicht fuer adminUserAdminNoteDiagnostic ohne Writes.',
          'RDAP38 ergaenzt nur eine read-only Planroute fuer spaetere Admin-Notiz-Writes mit Audit/Lock.'
        ]
      },
      adminUsersWriteFoundation: {
        routePrepared: true,
        confirmWriteHelperPrepared: true,
        confirmWriteHelperEnabledForRealWrites: false,
        auditHelperPrepared: true,
        auditWriteEnabled: false,
        auditInsertEnabled: false,
        auditUpdateEnabled: false,
        lockHelperPrepared: true,
        lockingHelperPrepared: true,
        lockWriteEnabled: false,
        lockAcquireEnabled: false,
        lockHeartbeatEnabled: false,
        lockReleaseEnabled: false,
        lockForceTakeoverEnabled: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
        auditRequiredForFutureWrites: true,
        lockingRequiredForFutureWrites: true,
        backupRequiredBeforeFutureWrites: true
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
        databaseWriteEnabled: false,
        productiveWritesEnabled: false,
        adminNoteWritesEnabled: false,
        uiWriteButtonsEnabled: false,
        physicalDeleteEnabled: false,
        routeRemainsReadOnly: true,
        plannedNextStep: 'RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED'
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
        productivePermissionEnforcementEnabled: false
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
