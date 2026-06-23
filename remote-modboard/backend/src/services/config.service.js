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

  return {
    service: 'remote-modboard',
    module: 'remote_node_base',
    host,
    port,
    envPath,
    envFileExists,
    publicBaseUrl,
    database: {
      engine: readString('DB_ENGINE', 'MariaDB 11.8.6'),
      driver: 'mysql2/promise',
      host: readString('DB_HOST', ''),
      port: readPort('DB_PORT', 3306),
      name: readString('DB_NAME', ''),
      user: readString('DB_USER', ''),
      passwordConfigured: Boolean(process.env.DB_PASSWORD),
      writeEnabled: false,
      migrationEnabled: false
    },
    auth: {
      authEnabled: false,
      sessionCreationEnabled: false,
      twitchOAuth: {
        prepared: true,
        requestedEnabled: readBoolean('TWITCH_OAUTH_ENABLED', false),
        effectiveEnabled: false,
        clientIdConfigured: isConfiguredSecret('TWITCH_CLIENT_ID'),
        clientSecretConfigured: isConfiguredSecret('TWITCH_CLIENT_SECRET'),
        redirectUri: twitchRedirectUri,
        scopes: readScopes('TWITCH_OAUTH_SCOPES')
      },
      sessions: {
        requestedEnabled: readBoolean('SESSION_ENABLED', false),
        effectiveEnabled: false,
        cookieName: readString('SESSION_COOKIE_NAME', 'scc_remote_session'),
        sessionSecretConfigured: isConfiguredSecret('SESSION_SECRET'),
        oauthStateSecretConfigured: isConfiguredSecret('OAUTH_STATE_SECRET')
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

function readPort(key, fallback) {
  const raw = process.env[key];
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) return fallback;
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
      writeEnabled: false,
      migrationEnabled: false
    },
    auth: {
      authEnabled: false,
      sessionCreationEnabled: false,
      twitchOAuth: {
        prepared: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.prepared),
        requestedEnabled: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.requestedEnabled),
        effectiveEnabled: false,
        clientIdConfigured: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.clientIdConfigured),
        clientSecretConfigured: Boolean(config.auth && config.auth.twitchOAuth && config.auth.twitchOAuth.clientSecretConfigured),
        redirectUri: config.auth && config.auth.twitchOAuth ? config.auth.twitchOAuth.redirectUri : null,
        scopes: config.auth && config.auth.twitchOAuth ? config.auth.twitchOAuth.scopes : []
      },
      sessions: {
        requestedEnabled: Boolean(config.auth && config.auth.sessions && config.auth.sessions.requestedEnabled),
        effectiveEnabled: false,
        cookieName: config.auth && config.auth.sessions ? config.auth.sessions.cookieName : 'scc_remote_session',
        sessionSecretConfigured: Boolean(config.auth && config.auth.sessions && config.auth.sessions.sessionSecretConfigured),
        oauthStateSecretConfigured: Boolean(config.auth && config.auth.sessions && config.auth.sessions.oauthStateSecretConfigured)
      }
    }
  };
}

module.exports = {
  loadConfig,
  isDatabaseConfigured,
  buildPublicConfigSummary
};
