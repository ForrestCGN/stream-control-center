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
      statusApiVersion: 'rdap_admin_users7b.v1',
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
          adminUsersConfirmWriteHelperPrepared: true,
          confirmWriteHelperPrepared: true,
          confirmWriteHelperEnabledForRealWrites: false,
          confirmWriteHelperExecutesWrites: false,
          checkRouteEnabled: true,
          productiveAuthorizationEnabled: false,
          backendMustDecideRights: true,
          frontendIsDisplayOnly: true,
          writesRequirePermissionLockAudit: true
        },
        notes: [
          'RDAP_ADMIN_USERS7B bereinigt Confirm-Write-Metadaten fuer eindeutige Status-/Diagnose-Tests.',
          'Twitch Login und Session-Handling bleiben aktiv und unveraendert.',
          'RDAP5 Admin-User-Permission-Diagnose bleibt read-only verfuegbar.',
          'RDAP6/RDAP7 Write-Foundation-Diagnose bleibt read-only verfuegbar.',
          'Login-Daten, Twitch-Tokens oder Sessionwerte duerfen nicht im Frontend oder in Links weitergereicht werden.',
          'Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Command-Steuerung bleiben deaktiviert.'
        ]
      },
      adminUsersWriteFoundation: {
        routePrepared: true,
        confirmWriteHelperPrepared: true,
        confirmWriteHelperEnabledForRealWrites: false,
        confirmWriteHelperExecutesWrites: false,
        productiveWritesEnabled: false,
        writesStillBlocked: true,
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
        adminUsersConfirmWriteHelperPrepared: true,
        confirmWriteHelperPrepared: true,
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
