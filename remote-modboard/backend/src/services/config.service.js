'use strict';

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const DEFAULT_ENV_PATH = '/etc/stream-control-center/remote-modboard.env';

function loadConfig() {
  const envPath = process.env.REMOTE_MODBOARD_ENV_FILE || DEFAULT_ENV_PATH;
  const envFileExists = fs.existsSync(envPath);

  if (envFileExists) dotenv.config({ path: envPath });
  else dotenv.config();

  const host = readString('REMOTE_MODBOARD_HOST', '127.0.0.1');
  const port = readPort('REMOTE_MODBOARD_PORT', 3010);
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

  const dbConfigured = Boolean(database.host && database.name && database.user && database.passwordConfigured);
  const authEffective = authRequested
    && twitchRequested
    && sessionRequested
    && sessionWriteRequested
    && twitchClientIdConfigured
    && twitchClientSecretConfigured
    && sessionSecretConfigured
    && oauthStateSecretConfigured
    && dbConfigured;

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

  return {
    service: 'remote-modboard',
    module: 'remote_node_base',
    host,
    port,
    envPath,
    envFileExists,
    publicBaseUrl,
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
      migrationEnabled: false
    },
    dashboardAccess: {
      allowedLogins: readList('DASHBOARD_ALLOWED_LOGINS', ['forrestcgn']),
      allowedUserUids: readList('DASHBOARD_ALLOWED_USER_UIDS', []),
      defaultRole: readString('DASHBOARD_DEFAULT_ROLE', 'owner')
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

function buildCentralAuthUrl({ baseUrl, pathName, returnTo }) {
  try {
    const url = new URL(pathName, baseUrl.replace(/\/+$/, '/') || 'https://forrestcgn.de/');
    if (returnTo) url.searchParams.set('returnTo', returnTo);
    return url.toString();
  } catch (err) {
    return 'https://forrestcgn.de/login?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F';
  }
}

function readString(key, fallback) {
  const value = process.env[key];
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  return value.trim();
}

function readList(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  return raw
    .split(/[\s,;]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function readPort(key, fallback) {
  const raw = process.env[key];
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) return fallback;
  return parsed;
}

function readInt(key, fallback) {
  const raw = process.env[key];
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

function readBoolean(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== 'string' || raw.trim() === '') return Boolean(fallback);
  const normalized = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return Boolean(fallback);
}

function readScopes(key) {
  const raw = process.env[key];
  if (typeof raw !== 'string' || raw.trim() === '') return [];
  return raw
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function isConfiguredSecret(key) {
  const value = process.env[key];
  if (typeof value !== 'string' || value.trim() === '') return false;
  return !/^change-me/i.test(value.trim());
}

function isDatabaseConfigured(config) {
  const db = config && config.database ? config.database : {};
  return Boolean(db.host && db.name && db.user && db.passwordConfigured);
}

function buildPublicConfigSummary(config) {
  return {
    service: config.service,
    publicBaseUrl: config.publicBaseUrl,
    host: config.host,
    port: config.port,
    envFileExists: config.envFileExists,
    envPathHint: config.envPath,
    centralAuth: {
      prepared: Boolean(config.centralAuth && config.centralAuth.prepared),
      mode: config.centralAuth ? config.centralAuth.mode : 'local_twitch_fallback',
      baseUrl: config.centralAuth ? config.centralAuth.baseUrl : 'https://forrestcgn.de',
      loginEntryPath: config.centralAuth ? config.centralAuth.loginEntryPath : '/api/remote/auth/login/start',
      localTwitchStartPath: config.centralAuth ? config.centralAuth.localTwitchStartPath : '/api/remote/auth/twitch/start',
      loginUrl: config.centralAuth ? config.centralAuth.loginUrl : '/api/remote/auth/twitch/start',
      centralLoginUrl: config.centralAuth ? config.centralAuth.centralLoginUrl : 'https://forrestcgn.de/login?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F',
      centralLogoutUrl: config.centralAuth ? config.centralAuth.centralLogoutUrl : 'https://forrestcgn.de/logout?returnTo=https%3A%2F%2Fmods.forrestcgn.de%2F',
      sharedDatabasePlanned: Boolean(config.centralAuth && config.centralAuth.sharedDatabasePlanned),
      sharedCookieDomainPlanned: config.centralAuth ? config.centralAuth.sharedCookieDomainPlanned : '.forrestcgn.de',
      sessionTables: config.centralAuth ? config.centralAuth.sessionTables : ['dashboard_users', 'dashboard_identities', 'dashboard_sessions']
    },
    database: {
      engine: config.database.engine,
      driver: config.database.driver,
      configured: isDatabaseConfigured(config),
      hostConfigured: Boolean(config.database.host),
      port: config.database.port,
      nameConfigured: Boolean(config.database.name),
      userConfigured: Boolean(config.database.user),
      passwordConfigured: config.database.passwordConfigured,
      writeEnabled: Boolean(config.database.writeEnabled),
      migrationEnabled: false
    },
    dashboardAccess: {
      allowlistConfigured: Boolean(config.dashboardAccess && (
        (Array.isArray(config.dashboardAccess.allowedLogins) && config.dashboardAccess.allowedLogins.length > 0)
        || (Array.isArray(config.dashboardAccess.allowedUserUids) && config.dashboardAccess.allowedUserUids.length > 0)
      )),
      defaultRole: config.dashboardAccess ? config.dashboardAccess.defaultRole : 'owner'
    },
    auth: {
      authEnabled: Boolean(config.auth && config.auth.authEnabled),
      loginEnabled: Boolean(config.auth && config.auth.loginEnabled),
      sessionCreationEnabled: Boolean(config.auth && config.auth.sessionCreationEnabled),
      sessionWriteEnabled: Boolean(config.auth && config.auth.sessionWriteEnabled),
      loginEntryPath: config.auth ? config.auth.loginEntryPath : '/api/remote/auth/login/start',
      twitchOAuth: {
        prepared: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.prepared),
        requestedEnabled: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.requestedEnabled),
        effectiveEnabled: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.effectiveEnabled),
        clientIdConfigured: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.clientIdConfigured),
        clientSecretConfigured: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.clientSecretConfigured),
        redirectUri: config.auth && config.auth.twitchOAuth ? config.auth.twitchOAuth.redirectUri : null,
        scopes: config.auth && config.auth.twitchOAuth ? config.auth.twitchOAuth.scopes : []
      },
      sessions: {
        requestedEnabled: Boolean(config.auth && config.auth.sessions && config.auth.sessions.requestedEnabled),
        writeRequested: Boolean(config.auth && config.auth.sessions && config.auth.sessions.writeRequested),
        effectiveEnabled: Boolean(config.auth && config.auth.sessions && config.auth.sessions.effectiveEnabled),
        cookieName: config.auth && config.auth.sessions ? config.auth.sessions.cookieName : 'scc_remote_session',
        stateCookieName: config.auth && config.auth.sessions ? config.auth.sessions.stateCookieName : 'scc_remote_oauth_state',
        sessionSecretConfigured: Boolean(config.auth && config.auth.sessions && config.auth.sessions.sessionSecretConfigured),
        oauthStateSecretConfigured: Boolean(config.auth && config.auth.sessions && config.auth.sessions.oauthStateSecretConfigured),
        ttlSeconds: config.auth && config.auth.sessions ? config.auth.sessions.ttlSeconds : null,
        secureCookie: config.auth && config.auth.sessions ? Boolean(config.auth.sessions.secureCookie) : true,
        sameSite: config.auth && config.auth.sessions ? config.auth.sessions.sameSite : 'Lax',
        sharedCookieDomainPlanned: config.auth && config.auth.sessions ? config.auth.sessions.sharedCookieDomainPlanned : '.forrestcgn.de'
      }
    }
  };
}

module.exports = {
  loadConfig,
  isDatabaseConfigured,
  buildPublicConfigSummary
};
