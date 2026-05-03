"use strict";

/**
 * Central database layer.
 *
 * STEP013:
 * - zentrale DB-Schicht fuer neue Module und kuenftige Refactors
 * - aktuell Adapter: SQLite ueber backend/modules/sqlite_core.js
 * - MariaDB ist bewusst vorbereitet, aber noch nicht implementiert
 *
 * Ziel:
 * Dashboard-/API-/Service-Code soll langfristig nicht direkt an sqlite_core haengen.
 */

const path = require("path");
const corePaths = require("./paths");

let sqlite = null;
let state = {
  initialized: false,
  adapter: "sqlite",
  dialect: "sqlite",
  readyAt: null,
  lastError: ""
};

function nowIso() {
  return new Date().toISOString();
}

function getConfiguredAdapter() {
  const raw = String(process.env.DB_ADAPTER || process.env.DATABASE_ADAPTER || "sqlite").trim().toLowerCase();
  if (raw === "mariadb" || raw === "mysql") return "mariadb";
  return "sqlite";
}

function loadSqliteCore() {
  if (!sqlite) {
    sqlite = require(path.join(corePaths.ROOT_DIR, "backend", "modules", "sqlite_core.js"));
  }
  return sqlite;
}

function init(ctx = {}) {
  state.adapter = getConfiguredAdapter();
  state.dialect = state.adapter === "mariadb" ? "mariadb" : "sqlite";

  if (state.adapter === "mariadb") {
    state.initialized = false;
    state.readyAt = null;
    state.lastError = "mariadb_adapter_not_implemented_yet";
    console.warn("[database] MariaDB adapter is planned but not implemented yet.");
    return state;
  }

  try {
    const sqliteCore = loadSqliteCore();
    if (!sqliteCore.isInitialized()) sqliteCore.init(ctx);
    state.initialized = true;
    state.readyAt = nowIso();
    state.lastError = "";
    return state;
  } catch (err) {
    state.initialized = false;
    state.readyAt = null;
    state.lastError = err.message || String(err);
    throw err;
  }
}

function ensureReady(ctx = {}) {
  if (!state.initialized) init(ctx);
  if (!state.initialized) throw new Error(state.lastError || "database_not_initialized");
  return true;
}

function getAdapter() {
  return state.adapter;
}

function getDialect() {
  return state.dialect;
}

function getDbPath() {
  if (state.adapter !== "sqlite") return null;
  const sqliteCore = loadSqliteCore();
  return sqliteCore.getDbPath ? sqliteCore.getDbPath() : null;
}

function status() {
  let sqliteStatus = null;
  if (state.adapter === "sqlite") {
    try {
      const sqliteCore = loadSqliteCore();
      sqliteStatus = sqliteCore.buildStatus ? sqliteCore.buildStatus() : null;
    } catch (_) {
      sqliteStatus = null;
    }
  }

  return {
    ok: state.adapter === "sqlite" ? !!sqliteStatus?.initialized : false,
    module: "core_database",
    adapter: state.adapter,
    dialect: state.dialect,
    initialized: state.initialized,
    readyAt: state.readyAt,
    lastError: state.lastError,
    sqlite: sqliteStatus ? {
      initialized: !!sqliteStatus.initialized,
      databasePath: sqliteStatus.databasePath,
      journalMode: sqliteStatus.journalMode,
      foreignKeys: sqliteStatus.foreignKeys
    } : null,
    mariaDb: {
      planned: true,
      implemented: false,
      envKeys: [
        "DB_ADAPTER=mariadb",
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PASSWORD"
      ]
    }
  };
}

function exec(sql) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().exec(sql);
}

function run(sql, params = {}) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().run(sql, params);
}

function get(sql, params = {}) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().get(sql, params);
}

function all(sql, params = {}) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().all(sql, params);
}

function transaction(fn) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().transaction(fn);
}

function ensureSchema(moduleName, targetVersion, migrateFn) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().ensureSchema(moduleName, targetVersion, migrateFn);
}

function getSchemaVersion(moduleName) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().getSchemaVersion(moduleName);
}

function setSchemaVersion(moduleName, version) {
  ensureReady();
  if (state.adapter !== "sqlite") throw new Error("adapter_not_implemented");
  return loadSqliteCore().setSchemaVersion(moduleName, version);
}

function quoteIdentifier(identifier) {
  const clean = String(identifier || "").trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) throw new Error(`invalid_identifier:${identifier}`);
  return state.dialect === "mariadb" ? `\`${clean}\`` : `"${clean}"`;
}

function normalizeBool(value) {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true" ? 1 : 0;
}

function boolFromDb(value) {
  return value === true || Number(value) === 1 || String(value).toLowerCase() === "true";
}

function jsonEncode(value) {
  return JSON.stringify(value ?? null);
}

function jsonDecode(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function buildInsertSql(table, data = {}, options = {}) {
  const keys = Object.keys(data || {});
  if (!keys.length) throw new Error("insert_requires_data");

  const tableName = quoteIdentifier(table);
  const columns = keys.map(quoteIdentifier).join(", ");
  const values = keys.map(key => `:${key}`).join(", ");

  if (options.ignore === true) {
    if (state.dialect === "mariadb") return `INSERT IGNORE INTO ${tableName} (${columns}) VALUES (${values})`;
    return `INSERT OR IGNORE INTO ${tableName} (${columns}) VALUES (${values})`;
  }

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
}

function insert(table, data = {}, options = {}) {
  return run(buildInsertSql(table, data, options), data);
}

function updateByKey(table, keyColumn, keyValue, data = {}) {
  const keys = Object.keys(data || {});
  if (!keys.length) throw new Error("update_requires_data");
  const tableName = quoteIdentifier(table);
  const keyName = quoteIdentifier(keyColumn);
  const setSql = keys.map(key => `${quoteIdentifier(key)} = :${key}`).join(", ");
  return run(`UPDATE ${tableName} SET ${setSql} WHERE ${keyName} = :__keyValue`, { ...data, __keyValue: keyValue });
}

function upsertByKey(table, keyColumn, keyValue, data = {}) {
  const tableName = quoteIdentifier(table);
  const keyName = quoteIdentifier(keyColumn);
  const existing = get(`SELECT ${keyName} AS key_value FROM ${tableName} WHERE ${keyName} = :keyValue`, { keyValue });
  if (existing) return updateByKey(table, keyColumn, keyValue, data);
  return insert(table, { [keyColumn]: keyValue, ...data });
}

function count(tableName) {
  const table = quoteIdentifier(tableName);
  const row = get(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(row?.count || 0);
}

module.exports = {
  init,
  ensureReady,
  status,
  getAdapter,
  getDialect,
  getDbPath,
  exec,
  run,
  get,
  all,
  transaction,
  ensureSchema,
  getSchemaVersion,
  setSchemaVersion,
  quoteIdentifier,
  normalizeBool,
  boolFromDb,
  jsonEncode,
  jsonDecode,
  buildInsertSql,
  insert,
  updateByKey,
  upsertByKey,
  count,
  nowIso
};
