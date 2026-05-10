"use strict";

/**
 * Central database layer.
 *
 * STEP013:
 * - zentrale DB-Schicht fuer neue Module und kuenftige Refactors
 * - aktuell Adapter: SQLite ueber backend/modules/sqlite_core.js
 * - MariaDB ist bewusst vorbereitet, aber noch nicht implementiert
 *
 * STEP208:
 * - SQL-/Dialekt-Helper fuer SQLite, MySQL und MariaDB vorbereitet
 * - SQLite bleibt einziger aktiver Adapter
 * - MySQL/MariaDB werden nicht verbunden und nicht produktiv genutzt
 *
 * STEP219:
 * - Helper-Stabilisierung fuer Phase 2 der DB-Portabilitaet
 * - zusaetzliche Tabellen-/Spalten-/Insert-Helper ohne Modul-Umbau
 * - SQLite bleibt einziger aktiver Adapter
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

function normalizeAdapterName(value) {
  const raw = String(value || "sqlite").trim().toLowerCase();
  if (raw === "mysql" || raw === "mysql2") return "mysql";
  if (raw === "mariadb" || raw === "maria") return "mariadb";
  return "sqlite";
}

function getConfiguredAdapter() {
  return normalizeAdapterName(process.env.DB_ADAPTER || process.env.DATABASE_ADAPTER || "sqlite");
}

function getDialectForAdapter(adapter) {
  const clean = normalizeAdapterName(adapter);
  if (clean === "mysql") return "mysql";
  if (clean === "mariadb") return "mariadb";
  return "sqlite";
}

function isMysqlFamilyDialect(dialect = state.dialect) {
  return dialect === "mysql" || dialect === "mariadb";
}

function isSqliteDialect(dialect = state.dialect) {
  return dialect === "sqlite";
}

function getDatabaseFamily() {
  return isMysqlFamilyDialect() ? "mysql-family" : "sqlite";
}

function loadSqliteCore() {
  if (!sqlite) {
    sqlite = require(path.join(corePaths.ROOT_DIR, "backend", "modules", "sqlite_core.js"));
  }
  return sqlite;
}

function init(ctx = {}) {
  state.adapter = getConfiguredAdapter();
  state.dialect = getDialectForAdapter(state.adapter);

  if (isMysqlFamilyDialect()) {
    state.initialized = false;
    state.readyAt = null;
    state.lastError = `${state.adapter}_adapter_not_implemented_yet`;
    console.warn(`[database] ${state.adapter} adapter is planned but not implemented yet. SQLite remains the active production database.`);
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
    databaseFamily: getDatabaseFamily(),
    initialized: state.initialized,
    readyAt: state.readyAt,
    lastError: state.lastError,
    sqlite: sqliteStatus ? {
      initialized: !!sqliteStatus.initialized,
      databasePath: sqliteStatus.databasePath,
      journalMode: sqliteStatus.journalMode,
      foreignKeys: sqliteStatus.foreignKeys
    } : null,
    mysqlFamily: {
      planned: true,
      implemented: false,
      active: false,
      acceptedAdapters: ["mysql", "mariadb"],
      note: "Prepared for later MySQL/MariaDB support. No driver is loaded and no connection is opened yet.",
      envKeys: [
        "DB_ADAPTER=mysql|mariadb",
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
  return isMysqlFamilyDialect() ? `\`${clean}\`` : `"${clean}"`;
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

function primaryKeyAutoIncrementSql() {
  if (isMysqlFamilyDialect()) return "INT AUTO_INCREMENT PRIMARY KEY";
  return "INTEGER PRIMARY KEY AUTOINCREMENT";
}

function textTypeSql(options = {}) {
  if (options.long === true && isMysqlFamilyDialect()) return "LONGTEXT";
  return "TEXT";
}

function integerTypeSql() {
  return "INTEGER";
}

function realTypeSql() {
  return isMysqlFamilyDialect() ? "DOUBLE" : "REAL";
}

function boolTypeSql() {
  return isMysqlFamilyDialect() ? "TINYINT(1)" : "INTEGER";
}

function dateTimeTypeSql() {
  return isMysqlFamilyDialect() ? "DATETIME" : "TEXT";
}

function jsonTypeSql() {
  return isMysqlFamilyDialect() ? "JSON" : "TEXT";
}

function nowSql() {
  return isMysqlFamilyDialect() ? "CURRENT_TIMESTAMP" : "CURRENT_TIMESTAMP";
}

function buildInsertSql(table, data = {}, options = {}) {
  const keys = Object.keys(data || {});
  if (!keys.length) throw new Error("insert_requires_data");

  const tableName = quoteIdentifier(table);
  const columns = keys.map(quoteIdentifier).join(", ");
  const values = keys.map(key => `:${key}`).join(", ");

  if (options.ignore === true) {
    if (isMysqlFamilyDialect()) return `INSERT IGNORE INTO ${tableName} (${columns}) VALUES (${values})`;
    return `INSERT OR IGNORE INTO ${tableName} (${columns}) VALUES (${values})`;
  }

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
}

function buildInsertIgnoreSql(table, data = {}) {
  return buildInsertSql(table, data, { ignore: true });
}

function buildUpsertSql(table, data = {}, conflictColumns = [], updateColumns = null) {
  const keys = Object.keys(data || {});
  if (!keys.length) throw new Error("upsert_requires_data");

  const conflicts = Array.isArray(conflictColumns) ? conflictColumns : [conflictColumns];
  if (!conflicts.length || conflicts.some(column => !column)) throw new Error("upsert_requires_conflict_columns");

  const updates = Array.isArray(updateColumns) ? updateColumns : keys.filter(key => !conflicts.includes(key));
  if (!updates.length) return buildInsertSql(table, data, { ignore: true });

  const insertSql = buildInsertSql(table, data);

  if (isMysqlFamilyDialect()) {
    const updateSql = updates
      .map(key => `${quoteIdentifier(key)} = VALUES(${quoteIdentifier(key)})`)
      .join(", ");
    return `${insertSql} ON DUPLICATE KEY UPDATE ${updateSql}`;
  }

  const conflictSql = conflicts.map(quoteIdentifier).join(", ");
  const updateSql = updates
    .map(key => `${quoteIdentifier(key)} = excluded.${quoteIdentifier(key)}`)
    .join(", ");
  return `${insertSql} ON CONFLICT(${conflictSql}) DO UPDATE SET ${updateSql}`;
}

function insert(table, data = {}, options = {}) {
  return run(buildInsertSql(table, data, options), data);
}

function insertIgnore(table, data = {}) {
  return run(buildInsertIgnoreSql(table, data), data);
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

function upsert(table, data = {}, conflictColumns = [], updateColumns = null) {
  return run(buildUpsertSql(table, data, conflictColumns, updateColumns), data);
}

function count(tableName) {
  const table = quoteIdentifier(tableName);
  const row = get(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(row?.count || 0);
}

function tableInfo(tableName) {
  ensureReady();
  const cleanTable = String(tableName || "").trim();
  if (!cleanTable) throw new Error("table_info_requires_table");

  if (isMysqlFamilyDialect()) {
    return all(
      `
      SELECT
        COLUMN_NAME AS name,
        DATA_TYPE AS type,
        IS_NULLABLE AS nullable,
        COLUMN_DEFAULT AS default_value,
        COLUMN_KEY AS column_key,
        EXTRA AS extra
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = :tableName
      ORDER BY ORDINAL_POSITION ASC
      `,
      { tableName: cleanTable }
    ) || [];
  }

  return all(`PRAGMA table_info(${quoteIdentifier(cleanTable)})`) || [];
}

function tableColumns(tableName) {
  return tableInfo(tableName).map(row => row.name).filter(Boolean);
}

function tableExists(tableName) {
  ensureReady();
  const cleanTable = String(tableName || "").trim();
  if (!cleanTable) throw new Error("table_exists_requires_table");

  if (isMysqlFamilyDialect()) {
    const row = get(
      `
      SELECT TABLE_NAME AS table_name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = :tableName
      LIMIT 1
      `,
      { tableName: cleanTable }
    );
    return !!row;
  }

  const row = get(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = :tableName
    LIMIT 1
    `,
    { tableName: cleanTable }
  );
  return !!row;
}

function columnExists(tableName, columnName) {
  const cleanColumn = String(columnName || "").trim();
  if (!cleanColumn) throw new Error("column_exists_requires_column");
  return tableInfo(tableName).some(row => row.name === cleanColumn || row.column_name === cleanColumn);
}

function buildAddColumnSql(tableName, columnName, definition) {
  const cleanDefinition = String(definition || "").trim();
  if (!cleanDefinition) throw new Error("add_column_requires_definition");
  return `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${quoteIdentifier(columnName)} ${cleanDefinition}`;
}

function addColumn(tableName, columnName, definition) {
  return exec(buildAddColumnSql(tableName, columnName, definition));
}

function ensureColumn(tableName, columnName, definition) {
  if (columnExists(tableName, columnName)) return { changed: false, tableName, columnName };
  addColumn(tableName, columnName, definition);
  return { changed: true, tableName, columnName };
}

module.exports = {
  init,
  ensureReady,
  status,
  getAdapter,
  getDialect,
  getDatabaseFamily,
  getDbPath,
  exec,
  run,
  get,
  all,
  transaction,
  ensureSchema,
  getSchemaVersion,
  setSchemaVersion,
  normalizeAdapterName,
  getDialectForAdapter,
  isMysqlFamilyDialect,
  isSqliteDialect,
  quoteIdentifier,
  normalizeBool,
  boolFromDb,
  jsonEncode,
  jsonDecode,
  primaryKeyAutoIncrementSql,
  textTypeSql,
  integerTypeSql,
  realTypeSql,
  boolTypeSql,
  dateTimeTypeSql,
  jsonTypeSql,
  nowSql,
  buildInsertSql,
  buildInsertIgnoreSql,
  buildUpsertSql,
  insert,
  insertIgnore,
  updateByKey,
  upsertByKey,
  upsert,
  count,
  tableInfo,
  tableColumns,
  tableExists,
  columnExists,
  buildAddColumnSql,
  addColumn,
  ensureColumn,
  nowIso
};
