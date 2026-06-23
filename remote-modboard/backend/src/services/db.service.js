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
    writeEnabled: false,
    migrationEnabled: false,
    error: configured && loaded.driverAvailable ? null : (loaded.error || 'db_env_not_configured')
  };
}

async function createReadOnlyConnection(config) {
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
    await connection.query('SET SESSION TRANSACTION READ ONLY');
  } catch (err) {
    await connection.end();
    throw err;
  }

  return connection;
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
  withReadOnlyConnection,
  publicDbError
};
