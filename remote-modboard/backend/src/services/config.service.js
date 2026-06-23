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

  return {
    service: 'remote-modboard',
    module: 'remote_node_base',
    host,
    port,
    envPath,
    envFileExists,
    publicBaseUrl: readString('REMOTE_PUBLIC_BASE_URL', 'https://mods.forrestcgn.de'),
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
    }
  };
}

module.exports = {
  loadConfig,
  isDatabaseConfigured,
  buildPublicConfigSummary
};
