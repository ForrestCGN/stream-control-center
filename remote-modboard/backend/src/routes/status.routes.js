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
      statusApiVersion: 'rdap_dashboard2.v1',
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
      auth: {
        prepared: true,
        enabled: authEnabled,
        loginEnabled: authEnabled,
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
          checkRouteEnabled: true,
          productiveAuthorizationEnabled: false,
          backendMustDecideRights: true,
          frontendIsDisplayOnly: true,
          writesRequirePermissionLockAudit: true
        },
        notes: [
          'AUTH1 aktiviert nur Twitch-Login und Session, wenn alle Env-Gates und Secrets gesetzt sind.',
          'OAuth Start/Callback bleiben ohne Gates HTTP 403.',
          'Auth-DB-Writes sind auf dashboard_users/dashboard_identities/dashboard_sessions begrenzt.',
          'Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Command-Steuerung bleiben deaktiviert.',
          'last_seen_at wird in AUTH1 nicht aktualisiert.'
        ]
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
        plannedModel: 'RDAP5C3 roles-and-groups-separated',
        rolesAreSeparateFromGroups: true,
        soundProfiIsRole: false,
        soundProfiIsGroupMarker: true,
        modulePermissionMatrixUsesTargetTypeAndTargetKey: true,
        productivePermissionEnforcementEnabled: false
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
