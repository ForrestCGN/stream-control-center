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

  return {
    service: 'remote-modboard',
    module: 'remote_node_base',
    host,
    port,
    envPath,
    envFileExists,
    publicBaseUrl,
    database: {
      ...database,
      writeEnabled: authEffective,
      migrationEnabled: false
    },
    dashboardAccess: {
      // First practical gate: explicit env allowlist, with ForrestCGN as safe initial owner default for this project.
      allowedLogins: readList('DASHBOARD_ALLOWED_LOGINS', ['forrestcgn']),
      allowedUserUids: readList('DASHBOARD_ALLOWED_USER_UIDS', []),
      defaultRole: readString('DASHBOARD_DEFAULT_ROLE', 'owner')
    },
    auth: {
      authEnabled: authEffective,
      loginEnabled: authEffective,
      sessionCreationEnabled: authEffective,
      sessionWriteEnabled: authEffective,
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
        sameSite: readString('SESSION_COOKIE_SAMESITE', 'Lax')
      }
    },
    paths: {
      cwd: process.cwd(),
      appRoot: path.resolve(__dirname, '..', '..')
    }
  };
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
        sameSite: config.auth && config.auth.sessions ? config.auth.sessions.sameSite : 'Lax'
      }
    }
  };
}

module.exports = {
  loadConfig,
  isDatabaseConfigured,
  buildPublicConfigSummary
};
