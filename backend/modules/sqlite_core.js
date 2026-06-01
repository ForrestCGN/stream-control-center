"use strict";

const path = require("path");
const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const { DatabaseSync } = require("node:sqlite");

const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: 'sqlite_core',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'core',
  routesPrefix: [],
  bus: {
    emits: [],
    listens: [],
    heartbeat: false
  },
  legacy: false
};

let db = null;
let dbPath = null;
let initialized = false;

function ensureDir(dirPath) {
  return core.ensureDir(dirPath);
}

function nowIso() {
  return core.nowIso();
}

function initDatabase(dataDir) {
  if (initialized) return db;

  ensureDir(dataDir);

  dbPath = path.join(dataDir, "app.sqlite");
  db = new DatabaseSync(dbPath);

  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = FULL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      module_name TEXT PRIMARY KEY,
      version INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  initialized = true;
  console.log(`[${MODULE_META.name}] v${MODULE_VERSION} ready: ${dbPath}`);
  return db;
}

function getDb() {
  if (!initialized || !db) {
    throw new Error("sqlite_core not initialized");
  }
  return db;
}

function getDbPath() {
  return dbPath;
}

function isInitialized() {
  return Boolean(initialized && db);
}

function buildStatus() {
  return {
    ok: true,
    initialized: isInitialized(),
    databasePath: dbPath,
    journalMode: initialized ? getDb().prepare("PRAGMA journal_mode").get()?.journal_mode : null,
    foreignKeys: initialized ? getDb().prepare("PRAGMA foreign_keys").get()?.foreign_keys : null
  };
}

function exec(sql) {
  return getDb().exec(sql);
}

function run(sql, params = {}) {
  return getDb().prepare(sql).run(params);
}

function get(sql, params = {}) {
  return getDb().prepare(sql).get(params);
}

function all(sql, params = {}) {
  return getDb().prepare(sql).all(params);
}

function transaction(fn) {
  return (...args) => {
    const database = getDb();
    database.exec("BEGIN IMMEDIATE TRANSACTION");
    try {
      const result = fn(...args);
      database.exec("COMMIT");
      return result;
    } catch (err) {
      try {
        database.exec("ROLLBACK");
      } catch (_) {}
      throw err;
    }
  };
}

function getSchemaVersion(moduleName) {
  const row = get(
    `SELECT version FROM schema_versions WHERE module_name = :moduleName`,
    { moduleName }
  );
  return row ? Number(row.version) : 0;
}

function setSchemaVersion(moduleName, version) {
  run(
    `
    INSERT INTO schema_versions (module_name, version, updated_at)
    VALUES (:moduleName, :version, :updatedAt)
    ON CONFLICT(module_name) DO UPDATE SET
      version = excluded.version,
      updated_at = excluded.updated_at
    `,
    {
      moduleName,
      version,
      updatedAt: nowIso()
    }
  );
}

function ensureSchema(moduleName, targetVersion, migrateFn) {
  const currentVersion = getSchemaVersion(moduleName);

  if (currentVersion >= targetVersion) {
    return currentVersion;
  }

  const tx = transaction(() => {
    let v = currentVersion;
    while (v < targetVersion) {
      const nextVersion = v + 1;
      migrateFn(v, nextVersion, getDb());
      setSchemaVersion(moduleName, nextVersion);
      v = nextVersion;
    }
  });

  tx();

  console.log(`[sqlite_core] schema ensured for ${moduleName}: ${currentVersion} -> ${targetVersion}`);
  return targetVersion;
}

function close() {
  if (db) {
    db.close();
    db = null;
    initialized = false;
  }
}

function init(ctx) {
  try {
    initDatabase(config.resolveFromRoot("data", "sqlite"));
  } catch (err) {
    console.error("[sqlite_core] init failed:", err.message);
  }

  const shutdown = () => {
    try {
      close();
    } catch (_) {}
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  getDb,
  getDbPath,
  isInitialized,
  buildStatus,
  exec,
  run,
  get,
  all,
  transaction,
  ensureSchema,
  getSchemaVersion,
  setSchemaVersion,
  nowIso
};
