'use strict';

const { isDatabaseConfigured } = require('./config.service');

function loadMysqlDriver() {
  try {
    return { driverAvailable: true, mysql: require('mysql2/promise') };
  } catch (err) {
    return {
      driverAvailable: false,
      mysql: null,
      error: err && err.code ? err.code : 'mysql2_not_available'
    };
  }
}

function buildDatabaseReadiness(config) {
  const configured = isDatabaseConfigured(config);
  const loaded = loadMysqlDriver();

  return {
    engine: config.database.engine,
    driver: config.database.driver,
    driverAvailable: loaded.driverAvailable,
    configured,
    writeEnabled: Boolean(config.database.writeEnabled),
    migrationEnabled: false,
    mediaIndexWriteGatePrepared: Boolean(config.mediaIndex && config.mediaIndex.writeGatePrepared),
    mediaIndexWriteEnabled: Boolean(config.mediaIndex && config.mediaIndex.writeEnabled),
    mediaIndexSchemaWriteEnabled: Boolean(config.mediaIndex && config.mediaIndex.schemaWriteEnabled),
    mediaIndexDataWriteEnabled: Boolean(config.mediaIndex && config.mediaIndex.dataWriteEnabled),
    error: configured && loaded.driverAvailable ? null : (loaded.error || 'db_env_not_configured')
  };
}

async function createConnection(config, { readOnly }) {
  const readiness = buildDatabaseReadiness(config);

  if (!readiness.configured) {
    const err = new Error('db_env_not_configured');
    err.code = 'db_env_not_configured';
    err.readiness = readiness;
    throw err;
  }

  const loaded = loadMysqlDriver();
  if (!loaded.driverAvailable) {
    const err = new Error(loaded.error || 'mysql2_not_available');
    err.code = loaded.error || 'mysql2_not_available';
    err.readiness = readiness;
    throw err;
  }

  const connection = await loaded.mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: process.env.DB_PASSWORD,
    database: config.database.name,
    charset: 'utf8mb4',
    connectTimeout: 3000,
    multipleStatements: false
  });

  try {
    if (readOnly) await connection.query('SET SESSION TRANSACTION READ ONLY');
  } catch (err) {
    await connection.end();
    throw err;
  }

  return connection;
}

async function createReadOnlyConnection(config) {
  return createConnection(config, { readOnly: true });
}

function isWriteScopeEnabled(config, scope) {
  const requestedScope = String(scope || 'general');
  const mediaIndex = config && config.mediaIndex ? config.mediaIndex : {};
  if (requestedScope === 'media_index_schema') return mediaIndex.schemaWriteEnabled === true;
  if (requestedScope === 'media_index_data') return mediaIndex.dataWriteEnabled === true;
  return Boolean(config && config.database && config.database.writeEnabled === true);
}

async function createWriteConnection(config, options = {}) {
  const scope = options.scope || 'general';
  if (!isWriteScopeEnabled(config, scope)) {
    const err = new Error(scope === 'general' ? 'db_write_disabled' : `${scope}_write_disabled`);
    err.code = scope === 'general' ? 'db_write_disabled' : `${scope}_write_disabled`;
    err.scope = scope;
    throw err;
  }

  return createConnection(config, { readOnly: false });
}

async function withReadOnlyConnection(config, fn) {
  let connection = null;

  try {
    connection = await createReadOnlyConnection(config);
    return await fn(connection);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore close errors for read-only diagnostic requests.
      }
    }
  }
}

async function withWriteConnection(config, fn, options = {}) {
  let connection = null;

  try {
    connection = await createWriteConnection(config, options);
    return await fn(connection);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore close errors after a gated auth write request.
      }
    }
  }
}

function publicDbError(err) {
  const code = err && err.code ? err.code : 'db_read_failed';

  return {
    code,
    message: code
  };
}

module.exports = {
  loadMysqlDriver,
  buildDatabaseReadiness,
  createReadOnlyConnection,
  createWriteConnection,
  isWriteScopeEnabled,
  withReadOnlyConnection,
  withWriteConnection,
  publicDbError
};
