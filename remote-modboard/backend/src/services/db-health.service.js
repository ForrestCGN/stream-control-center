'use strict';

const { isDatabaseConfigured } = require('./config.service');

function loadMysqlDriver() {
  try {
    return { driverAvailable: true, mysql: require('mysql2/promise') };
  } catch (err) {
    return { driverAvailable: false, mysql: null, error: err && err.code ? err.code : 'mysql2_not_available' };
  }
}

async function checkDatabaseHealth(config, options = {}) {
  const configured = isDatabaseConfigured(config);
  const loaded = loadMysqlDriver();
  const shouldConnect = options.connect === true && configured && loaded.driverAvailable;

  const result = {
    engine: config.database.engine,
    driver: config.database.driver,
    driverAvailable: loaded.driverAvailable,
    configured,
    connectionTested: false,
    reachable: null,
    writeEnabled: false,
    migrationEnabled: false,
    error: null
  };

  if (!loaded.driverAvailable) {
    result.error = loaded.error || 'mysql2_not_available';
    return result;
  }

  if (!configured) {
    result.error = 'db_env_not_configured';
    return result;
  }

  if (!shouldConnect) return result;

  let connection = null;
  try {
    connection = await loaded.mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: process.env.DB_PASSWORD,
      database: config.database.name,
      charset: 'utf8mb4',
      connectTimeout: 3000
    });

    await connection.query('SELECT 1 AS ok');
    result.connectionTested = true;
    result.reachable = true;
    result.error = null;
    return result;
  } catch (err) {
    result.connectionTested = true;
    result.reachable = false;
    result.error = err && err.code ? err.code : 'db_connection_failed';
    return result;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore close errors in health checks.
      }
    }
  }
}

module.exports = { checkDatabaseHealth };
