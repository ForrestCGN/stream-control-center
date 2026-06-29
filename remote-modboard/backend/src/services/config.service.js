'use strict';

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const DEFAULT_ENV_PATH = '/etc/stream-control-center/remote-modboard.env';
const AGENT_RUNTIME_ACCEPT_BUILD_ENABLED = true;

function loadConfig() {
  const envPath = process.env.REMOTE_MODBOARD_ENV_FILE || DEFAULT_ENV_PATH;
  const envFileExists = fs.existsSync(envPath);

  if (envFileExists) dotenv.config({ path: envPath });
  else dotenv.config();

  const host = readString('REMOTE_MODBOARD_HOST', '127.0.0.1');
  const port = readPort('REMOTE_MODBOARD_PORT', 3010);
  const runtimeMode = normalizeRuntimeMode(readString('REMOTE_MODBOARD_MODE', 'online'));
  const localLanAllowedCidrs = readList('REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS', ['127.0.0.1/32']);
  const localLanDisplayName = readString('REMOTE_MODBOARD_LOCAL_DISPLAY_NAME', 'ForrestCGN Lokales Dashboard');
  const publicBaseUrl = readString('REMOTE_PUBLIC_BASE_URL', 'https://mods.forrestcgn.de');
  const centralAuthBaseUrl = readString('CENTRAL_AUTH_BASE_URL', 'https://forrestcgn.de');
  const centralAuthLoginPath = readString('CENTRAL_AUTH_LOGIN_PATH', '/login');
  const centralAuthLogoutPath = readString('CENTRAL_AUTH_LOGOUT_PATH', '/logout');
  const centralAuthMode = readString('CENTRAL_AUTH_MODE', 'local_twitch_fallback');
  const twitchRedirectUri = readString(
    'TWITCH_REDIRECT_URI',
    `${publicBaseUrl.replace(/\/+$/, '')}/api/remote/auth/twitch/callback`
  );

  const authRequested = readBoolean('AUTH_ENABLED', false);
  const twitchRequested = readBoolean('TWITCH_OAUTH_ENABLED', false);
  const sessionRequested = readBoolean('SESSION_ENABLED', false);
  const sessionWriteRequested = readBoolean('AUTH_SESSION_WRITE_ENABLED', false);

  const twitchClientIdConfigured = isConfiguredSecret('TWITCH_CLIENT_ID');
  const twitchClientSecretConfigured = isConfiguredSecret('TWITCH_CLIENT_SECRET');
  const sessionSecretConfigured = isConfiguredSecret('SESSION_SECRET');
  const oauthStateSecretConfigured = isConfiguredSecret('OAUTH_STATE_SECRET');

  const agentRuntimeRequested = readBoolean('AGENT_RUNTIME_ENABLED', false);
  const agentAccessKeyConfigured = isConfiguredSecret('AGENT_ACCESS_KEY');
  const agentRuntimeEffective = agentRuntimeRequested && AGENT_RUNTIME_ACCEPT_BUILD_ENABLED;

  const database = {
    engine: readString('DB_ENGINE', 'MariaDB 11.8.6'),
    driver: 'mysql2/promise',
    host: readString('DB_HOST', ''),
    port: readPort('DB_PORT', 3306),
    name: readString('DB_NAME', ''),
    user: readString('DB_USER', ''),
    passwordConfigured: Boolean(process.env.DB_PASSWORD),
    writeEnabled: false,
    migrationEnabled: false
  };

  const dbConfigured = isDatabaseConfigured({ database });
  const authEffective = authRequested
    && twitchRequested
    && sessionRequested
    && sessionWriteRequested
    && twitchClientIdConfigured
    && twitchClientSecretConfigured
    && sessionSecretConfigured
    && oauthStateSecretConfigured
    && dbConfigured;

  const mediaIndexWriteRequested = readBoolean('MEDIA_INDEX_WRITE_ENABLED', false);
  const mediaIndexSchemaWriteRequested = readBoolean('MEDIA_INDEX_SCHEMA_WRITE_ENABLED', false);
  const mediaIndexDataWriteRequested = readBoolean('MEDIA_INDEX_DATA_WRITE_ENABLED', false);
  const mediaIndexFullSyncRequested = readBoolean('MEDIA_INDEX_FULL_SYNC_ENABLED', false);
  const mediaIndexWriteEnabled = dbConfigured && mediaIndexWriteRequested;
  const mediaIndexSchemaWriteEnabled = mediaIndexWriteEnabled && mediaIndexSchemaWriteRequested;
  const mediaIndexDataWriteEnabled = mediaIndexWriteEnabled && mediaIndexDataWriteRequested;
  const mediaIndexFullSyncEnabled = mediaIndexDataWriteEnabled && mediaIndexFullSyncRequested;

  const mediaIndex = {
    prepared: true,
    build: 'RDAP_0.2.54_MEDIA_INDEX_SCHEMA_AND_WRITE_GATE',
    databaseTarget: 'remote_modboard_mariadb.remote_media_index',
    table: 'remote_media_index',
    dbConfigured,
    writeGatePrepared: true,
    writeRequested: mediaIndexWriteRequested,
    writeEnabled: mediaIndexWriteEnabled,
    schemaWriteRequested: mediaIndexSchemaWriteRequested,
    schemaWriteEnabled: mediaIndexSchemaWriteEnabled,
    dataWriteRequested: mediaIndexDataWriteRequested,
    dataWriteEnabled: mediaIndexDataWriteEnabled,
    fullSyncRequested: mediaIndexFullSyncRequested,
    fullSyncEnabled: mediaIndexFullSyncEnabled,
    migrationEnabled: mediaIndexSchemaWriteEnabled,
    uploadEditDeleteEnabled: false,
    fileContentSyncEnabled: false,
    absolutePathSyncEnabled: false,
    envGates: {
      mediaIndexWrite: 'MEDIA_INDEX_WRITE_ENABLED',
      schemaWrite: 'MEDIA_INDEX_SCHEMA_WRITE_ENABLED',
      dataWrite: 'MEDIA_INDEX_DATA_WRITE_ENABLED',
      fullSync: 'MEDIA_INDEX_FULL_SYNC_ENABLED'
    },
    note: 'Media-Index-Writes sind bewusst von Auth-/Session-Writes getrennt und bleiben aus, bis die separaten MEDIA_INDEX_* Gates gesetzt sind.'
  };

  const localTwitchStartPath = '/api/remote/auth/twitch/start';
  const loginEntryPath = '/api/remote/auth/login/start';
  const returnToDefault = publicBaseUrl.replace(/\/+$/, '/') || 'https://mods.forrestcgn.de/';
  const centralAuthLoginUrl = buildCentralAuthUrl({
    baseUrl: centralAuthBaseUrl,
    pathName: centralAuthLoginPath,
    returnTo: returnToDefault
  });
  const centralAuthLogoutUrl = buildCentralAuthUrl({
    baseUrl: centralAuthBaseUrl,
    pathName: centralAuthLogoutPath,
    returnTo: returnToDefault
  });

  const localLan = buildLocalLanProfile({ runtimeMode, host, allowedCidrs: localLanAllowedCidrs, displayName: localLanDisplayName });

  return {
    service: 'remote-modboard',
    module: 'remote_node_base',
    host,
    port,
    envPath,
    envFileExists,
    publicBaseUrl,
    runtimeMode,
    localLan,
    localDashboard: buildLocalDashboardProfile({ runtimeMode, localLan }),
    centralAuth: {
      prepared: true,
      mode: centralAuthMode,
      baseUrl: centralAuthBaseUrl,
      loginPath: centralAuthLoginPath,
      logoutPath: centralAuthLogoutPath,
      loginEntryPath,
      localTwitchStartPath,
      loginUrl: centralAuthMode === 'central' ? centralAuthLoginUrl : localTwitchStartPath,
      centralLoginUrl: centralAuthLoginUrl,
      centralLogoutUrl: centralAuthLogoutUrl,
      sharedDatabasePlanned: true,
      sharedCookieDomainPlanned: '.forrestcgn.de',
      sessionTables: ['dashboard_users', 'dashboard_identities', 'dashboard_sessions'],
      notes: [
        'RDAP_AUTH2 bereitet mehrere Login-Einstiegspunkte vor: forrestcgn.de und mods.forrestcgn.de.',
        'Aktuell bleibt local_twitch_fallback Standard, damit der funktionierende Modboard-Login erhalten bleibt.',
        'Spaeter kann CENTRAL_AUTH_MODE=central auf zentrale Login-URL umschalten.'
      ]
    },
    database: {
      ...database,
      writeEnabled: authEffective,
      migrationEnabled: false,
      mediaIndexWriteGatePrepared: true,
      mediaIndexWriteEnabled: mediaIndex.writeEnabled,
      mediaIndexSchemaWriteEnabled: mediaIndex.schemaWriteEnabled,
      mediaIndexDataWriteEnabled: mediaIndex.dataWriteEnabled
    },
    mediaIndex,
    dashboardAccess: {
      allowedLogins: readList('DASHBOARD_ALLOWED_LOGINS', ['forrestcgn']),
      allowedUserUids: readList('DASHBOARD_ALLOWED_USER_UIDS', []),
      defaultRole: readString('DASHBOARD_DEFAULT_ROLE', 'owner')
    },
    agent: {
      runtime: {
        skeletonPrepared: true,
        requestedEnabled: agentRuntimeRequested,
        acceptBuildPrepared: true,
        acceptBuildEnabled: AGENT_RUNTIME_ACCEPT_BUILD_ENABLED,
        twoStepRuntimeGate: true,
        effectiveEnabled: agentRuntimeEffective,
        wssRuntimeEnabled: agentRuntimeEffective,
        heartbeatReceiverEnabled: false,
        acceptsAgentConnections: agentRuntimeEffective,
        actionsEnabled: false,
        productiveAgentRuntime: false,
        wsPath: readString('AGENT_WS_PATH', '/agent-ws'),
        expectedAgentId: readString('AGENT_EXPECTED_ID', 'stream-pc-main'),
        expectedAgentName: readString('AGENT_EXPECTED_NAME', 'Forrest Stream-PC'),
        accessKeyConfigured: agentAccessKeyConfigured,
        accessKeySource: 'environment',
        accessKeyExposed: false,
        accessKeyLogged: false,
        notes: [
          'RDAP92 bereitet minimalen Transport-Accept fuer /agent-ws vor.',
          'AGENT_RUNTIME_ENABLED allein reicht nicht; acceptBuildEnabled ist als zweites Gate im Build gesetzt.',
          'AGENT_ACCESS_KEY wird nur intern verglichen und nie ausgegeben.',
          'Heartbeat, Agent-Actions, OBS, Sounds, Overlays, Commands, Shell, Dateien, Prozesse und URL-Ausfuehrung bleiben deaktiviert.'
        ]
      }
    },
    auth: {
      authEnabled: authEffective,
      loginEnabled: authEffective,
      sessionCreationEnabled: authEffective,
      sessionWriteEnabled: authEffective,
      loginEntryPath,
      twitchOAuth: {
        prepared: true,
        requestedEnabled: twitchRequested,
        effectiveEnabled: authEffective,
        clientIdConfigured: twitchClientIdConfigured,
        clientSecretConfigured: twitchClientSecretConfigured,
        redirectUri: twitchRedirectUri,
        scopes: readScopes('TWITCH_OAUTH_SCOPES')
      },
      sessions: {
        requestedEnabled: sessionRequested,
        writeRequested: sessionWriteRequested,
        effectiveEnabled: authEffective,
        cookieName: readString('SESSION_COOKIE_NAME', 'scc_remote_session'),
        stateCookieName: readString('OAUTH_STATE_COOKIE_NAME', 'scc_remote_oauth_state'),
        sessionSecretConfigured,
        oauthStateSecretConfigured,
        ttlSeconds: readInt('SESSION_TTL_SECONDS', 60 * 60 * 8),
        stateTtlSeconds: readInt('OAUTH_STATE_TTL_SECONDS', 10 * 60),
        secureCookie: readBoolean('SESSION_COOKIE_SECURE', true),
        sameSite: readString('SESSION_COOKIE_SAMESITE', 'Lax'),
        sharedCookieDomainPlanned: '.forrestcgn.de'
      }
    },
    paths: {
      cwd: process.cwd(),
      appRoot: path.resolve(__dirname, '..', '..')
    }
  };
}

function buildLocalLanProfile({ runtimeMode, host, allowedCidrs, displayName }) {
  const localModeActive = runtimeMode === 'local';
  return {
    prepared: true,
    mode: localModeActive ? 'local' : 'online',
    displayName,
    bindHost: host,
    allowedCidrs: Array.isArray(allowedCidrs) && allowedCidrs.length ? allowedCidrs : ['127.0.0.1/32'],
    lanUseAllowed: localModeActive,
    streamPcLanUsePlanned: true,
    engelCgnLanAccessPlanned: true,
    safetyBoundary: 'LAN access is only a serving mode. Productive actions still require explicit backend permissions and scoped write flows.'
  };
}

function buildLocalDashboardProfile({ runtimeMode, localLan }) {
  const localModeActive = runtimeMode === 'local';
  return {
    prepared: true,
    mode: localModeActive ? 'local' : 'online',
    active: localModeActive,
    visibleLabel: localModeActive ? 'Lokalmodus' : 'Onlinemodus',
    localDashboardReplacementPrepared: true,
    sharedModularUiFoundation: true,
    moduleRuntimeScopesPrepared: true,
    localLan,
    actionsEnabled: false,
    productiveWritesEnabled: false,
    agentActionsEnabled: false,
    safetyNote: 'Das lokale Dashboard-Profil markiert nur den Betriebsmodus und Module. Es aktiviert keine OBS-, Sound-, Overlay-, Command-, Shell-, Datei- oder Prozess-Aktionen.'
  };
}

function normalizeRuntimeMode(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'local' || normalized === 'lan') return 'local';
  return 'online';
}

function buildPublicConfigSummary(config = {}) {
  const database = config.database || {};
  const agentRuntime = config.agent && config.agent.runtime ? config.agent.runtime : {};
  const auth = config.auth || {};
  const mediaIndex = config.mediaIndex || {};

  return {
    service: config.service || 'remote-modboard',
    module: config.module || 'remote_node_base',
    host: config.host,
    port: config.port,
    envPath: config.envPath,
    envFileExists: config.envFileExists,
    publicBaseUrl: config.publicBaseUrl,
    runtimeMode: config.runtimeMode || 'online',
    localLan: config.localLan || buildLocalLanProfile({ runtimeMode: config.runtimeMode || 'online', host: config.host, allowedCidrs: ['127.0.0.1/32'], displayName: 'ForrestCGN Lokales Dashboard' }),
    localDashboard: config.localDashboard || buildLocalDashboardProfile({ runtimeMode: config.runtimeMode || 'online', localLan: config.localLan || {} }),
    centralAuth: config.centralAuth || {},
    database: {
      engine: database.engine,
      driver: database.driver,
      configured: isDatabaseConfigured(config),
      writeEnabled: false,
      migrationEnabled: false,
      mediaIndexWriteGatePrepared: true,
      mediaIndexWriteEnabled: mediaIndex.writeEnabled === true,
      mediaIndexSchemaWriteEnabled: mediaIndex.schemaWriteEnabled === true,
      mediaIndexDataWriteEnabled: mediaIndex.dataWriteEnabled === true
    },
    mediaIndex: {
      prepared: mediaIndex.prepared === true,
      build: mediaIndex.build || 'RDAP_0.2.54_MEDIA_INDEX_SCHEMA_AND_WRITE_GATE',
      databaseTarget: mediaIndex.databaseTarget || 'remote_modboard_mariadb.remote_media_index',
      table: mediaIndex.table || 'remote_media_index',
      writeGatePrepared: mediaIndex.writeGatePrepared === true,
      writeRequested: mediaIndex.writeRequested === true,
      writeEnabled: mediaIndex.writeEnabled === true,
      schemaWriteRequested: mediaIndex.schemaWriteRequested === true,
      schemaWriteEnabled: mediaIndex.schemaWriteEnabled === true,
      dataWriteRequested: mediaIndex.dataWriteRequested === true,
      dataWriteEnabled: mediaIndex.dataWriteEnabled === true,
      fullSyncRequested: mediaIndex.fullSyncRequested === true,
      fullSyncEnabled: mediaIndex.fullSyncEnabled === true,
      uploadEditDeleteEnabled: false,
      fileContentSyncEnabled: false,
      absolutePathSyncEnabled: false
    },
    dashboardAccess: config.dashboardAccess || {},
    agent: {
      runtime: {
        skeletonPrepared: agentRuntime.skeletonPrepared === true,
        requestedEnabled: agentRuntime.requestedEnabled === true,
        acceptBuildPrepared: agentRuntime.acceptBuildPrepared === true,
        acceptBuildEnabled: agentRuntime.acceptBuildEnabled === true,
        twoStepRuntimeGate: agentRuntime.twoStepRuntimeGate === true,
        effectiveEnabled: agentRuntime.effectiveEnabled === true,
        wssRuntimeEnabled: agentRuntime.wssRuntimeEnabled === true,
        heartbeatReceiverEnabled: false,
        acceptsAgentConnections: agentRuntime.acceptsAgentConnections === true,
        actionsEnabled: false,
        productiveAgentRuntime: false,
        wsPath: agentRuntime.wsPath || '/agent-ws',
        expectedAgentId: agentRuntime.expectedAgentId || 'stream-pc-main',
        expectedAgentName: agentRuntime.expectedAgentName || 'Forrest Stream-PC',
        accessKeyConfigured: agentRuntime.accessKeyConfigured === true,
        accessKeySource: 'environment',
        accessKeyExposed: false,
        accessKeyLogged: false
      }
    },
    auth: {
      authEnabled: Boolean(auth.authEnabled),
      loginEnabled: Boolean(auth.loginEnabled),
      loginEntryPath: auth.loginEntryPath || '/api/remote/auth/login/start',
      twitchOAuth: auth.twitchOAuth || {},
      sessions: auth.sessions || {}
    },
    paths: {
      cwd: config.paths && config.paths.cwd ? config.paths.cwd : undefined,
      appRoot: config.paths && config.paths.appRoot ? config.paths.appRoot : undefined
    }
  };
}

function buildCentralAuthUrl({ baseUrl, pathName, returnTo }) {
  try {
    const url = new URL(pathName, baseUrl.replace(/\/+$/, '/') || 'https://forrestcgn.de/');
    if (returnTo) url.searchParams.set('returnTo', returnTo);
    return url.toString();
  } catch (err) {
    return 'https://forrestcgn.de/login?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F';
  }
}

function readString(name, fallback) {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function readBoolean(name, fallback) {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readPort(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : fallback;
}

function readInt(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function readList(name, fallback) {
  const raw = process.env[name];
  if (typeof raw !== 'string') return fallback;
  const values = raw.split(',').map(value => value.trim()).filter(Boolean);
  return values.length ? values : fallback;
}

function readScopes(name) {
  return readList(name, ['user:read:email']);
}

function isConfiguredSecret(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0;
}

function isDatabaseConfigured(config = {}) {
  const database = config.database || {};
  return Boolean(
    database.host
    && database.name
    && database.user
    && database.passwordConfigured
  );
}

module.exports = {
  loadConfig,
  buildPublicConfigSummary,
  isDatabaseConfigured
};
