"use strict";

/**
 * Central settings helper.
 *
 * Purpose:
 * - Dashboard-editable settings should live in the database.
 * - JSON config files remain a fallback/import layer and are handled via helper_config.
 * - ENV remains for secrets and technical boot values.
 *
 * Read order for consumers:
 * 1. database setting
 * 2. optional JSON config fallback
 * 3. code default
 */

const database = require("../../core/database");
const configHelper = require("./helper_config");

const DEFAULT_SETTINGS_TABLE = "module_settings";

function nowIso() {
  return typeof database.nowIso === "function" ? database.nowIso() : new Date().toISOString();
}

function cleanKey(value) {
  const key = String(value || "").trim();
  if (!key) throw new Error("settings_key_required");
  return key;
}

function cleanTable(value) {
  const table = String(value || DEFAULT_SETTINGS_TABLE).trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) throw new Error(`invalid_settings_table:${table}`);
  return table;
}

function normalizeValueType(type, value) {
  const raw = String(type || "").trim().toLowerCase();
  if (["string", "number", "boolean", "json"].includes(raw)) return raw;

  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (value && typeof value === "object") return "json";
  return "string";
}

function encodeValue(value, type) {
  const valueType = normalizeValueType(type, value);

  if (valueType === "boolean") return value === true || value === 1 || String(value).toLowerCase() === "true" ? "true" : "false";
  if (valueType === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? String(n) : "0";
  }
  if (valueType === "json") return JSON.stringify(value ?? null);

  return String(value ?? "");
}

function decodeValue(rawValue, type, fallback = null) {
  const valueType = normalizeValueType(type);
  const raw = rawValue === undefined || rawValue === null ? "" : String(rawValue);

  if (valueType === "boolean") {
    const s = raw.trim().toLowerCase();
    if (["1", "true", "yes", "ja", "y", "on"].includes(s)) return true;
    if (["0", "false", "no", "nein", "n", "off"].includes(s)) return false;
    return !!fallback;
  }

  if (valueType === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : Number(fallback || 0);
  }

  if (valueType === "json") {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  return raw;
}

function rowToSetting(row) {
  if (!row) return null;
  const valueType = String(row.value_type || "string").trim().toLowerCase() || "string";
  return {
    key: row.setting_key,
    value: decodeValue(row.setting_value, valueType),
    rawValue: row.setting_value,
    valueType,
    description: row.description || "",
    source: row.source || "database",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function ensureSettingsTable(tableName = DEFAULT_SETTINGS_TABLE) {
  const table = cleanTable(tableName);
  const qTable = database.quoteIdentifier(table);

  database.exec(`
    CREATE TABLE IF NOT EXISTS ${qTable} (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      value_type TEXT NOT NULL DEFAULT 'string',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return table;
}

function normalizeDefaults(defaults = []) {
  if (Array.isArray(defaults)) return defaults;

  if (defaults && typeof defaults === "object") {
    return Object.entries(defaults).map(([key, value]) => ({
      key,
      value,
      valueType: normalizeValueType("", value),
      description: ""
    }));
  }

  return [];
}

function seedDefaults(tableName, defaults = []) {
  const table = ensureSettingsTable(tableName);
  const qTable = database.quoteIdentifier(table);
  const now = nowIso();
  let inserted = 0;

  for (const item of normalizeDefaults(defaults)) {
    const key = cleanKey(item.key || item.settingKey);
    const valueType = normalizeValueType(item.valueType || item.type, item.value);
    const rawValue = encodeValue(item.value, valueType);
    const description = String(item.description || "");

    const result = database.run(`
      INSERT OR IGNORE INTO ${qTable}
        (setting_key, setting_value, value_type, description, created_at, updated_at)
      VALUES
        (:key, :value, :valueType, :description, :createdAt, :updatedAt)
    `, {
      key,
      value: rawValue,
      valueType,
      description,
      createdAt: now,
      updatedAt: now
    });

    inserted += Number(result?.changes || 0);
  }

  return { ok: true, table, inserted };
}

function getSettingRow(tableName, key) {
  const table = ensureSettingsTable(tableName);
  const qTable = database.quoteIdentifier(table);
  return database.get(`
    SELECT setting_key, setting_value, value_type, description, created_at, updated_at
    FROM ${qTable}
    WHERE setting_key = :key
  `, { key: cleanKey(key) });
}

function getSetting(tableName, key, fallback = null, options = {}) {
  const row = getSettingRow(tableName, key);
  if (row) return { ...rowToSetting(row), found: true };

  const valueType = normalizeValueType(options.valueType || options.type, fallback);
  return {
    key: cleanKey(key),
    value: fallback,
    rawValue: encodeValue(fallback, valueType),
    valueType,
    description: options.description || "",
    source: "default",
    createdAt: "",
    updatedAt: "",
    found: false
  };
}

function setSetting(tableName, key, value, options = {}) {
  const table = ensureSettingsTable(tableName);
  const qTable = database.quoteIdentifier(table);
  const settingKey = cleanKey(key);
  const valueType = normalizeValueType(options.valueType || options.type, value);
  const rawValue = encodeValue(value, valueType);
  const description = String(options.description || "");
  const now = nowIso();

  const existing = getSettingRow(table, settingKey);

  if (existing) {
    database.run(`
      UPDATE ${qTable}
      SET setting_value = :value,
          value_type = :valueType,
          description = CASE WHEN :description = '' THEN description ELSE :description END,
          updated_at = :updatedAt
      WHERE setting_key = :key
    `, {
      key: settingKey,
      value: rawValue,
      valueType,
      description,
      updatedAt: now
    });
  } else {
    database.run(`
      INSERT INTO ${qTable}
        (setting_key, setting_value, value_type, description, created_at, updated_at)
      VALUES
        (:key, :value, :valueType, :description, :createdAt, :updatedAt)
    `, {
      key: settingKey,
      value: rawValue,
      valueType,
      description,
      createdAt: now,
      updatedAt: now
    });
  }

  return getSetting(table, settingKey, null);
}

function listSettings(tableName, options = {}) {
  const table = ensureSettingsTable(tableName);
  const qTable = database.quoteIdentifier(table);
  const search = String(options.search || "").trim();
  const limit = Math.max(1, Math.min(1000, Number(options.limit || 500)));

  const where = [];
  const params = { limit };

  if (search) {
    where.push("(setting_key LIKE :search OR description LIKE :search OR setting_value LIKE :search)");
    params.search = `%${search}%`;
  }

  const rows = database.all(`
    SELECT setting_key, setting_value, value_type, description, created_at, updated_at
    FROM ${qTable}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY setting_key ASC
    LIMIT :limit
  `, params).map(rowToSetting);

  return {
    ok: true,
    table,
    count: rows.length,
    rows
  };
}

function deleteSetting(tableName, key) {
  const table = ensureSettingsTable(tableName);
  const qTable = database.quoteIdentifier(table);
  const result = database.run(`DELETE FROM ${qTable} WHERE setting_key = :key`, { key: cleanKey(key) });
  return { ok: true, table, key: cleanKey(key), deleted: Number(result?.changes || 0) };
}

function readConfigFallback(configFile, defaults = {}, options = {}) {
  if (!configFile) {
    return {
      ok: false,
      exists: false,
      path: "",
      data: defaults,
      config: defaults,
      error: "config_file_not_set"
    };
  }

  return configHelper.loadConfig(configFile, defaults, {
    createIfMissing: options.createIfMissing === true,
    mergeDefaults: options.mergeDefaults !== false,
    spaces: Number.isInteger(options.spaces) ? options.spaces : 2
  });
}

function getNestedValue(object, dottedKey, fallback = undefined) {
  if (!object || typeof object !== "object") return fallback;
  const parts = String(dottedKey || "").split(".").map(part => part.trim()).filter(Boolean);
  let current = object;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return fallback;
    current = current[part];
  }

  return current === undefined ? fallback : current;
}

function getSettingWithFallback(tableName, key, fallback = null, options = {}) {
  const dbSetting = getSetting(tableName, key, undefined, options);
  if (dbSetting.found) return dbSetting;

  const configFile = options.configFile || "";
  if (configFile) {
    const cfg = readConfigFallback(configFile, options.configDefaults || {}, options.configOptions || {});
    const configKey = options.configKey || key;
    const configValue = getNestedValue(cfg.data || cfg.config || {}, configKey, undefined);

    if (configValue !== undefined) {
      const valueType = normalizeValueType(options.valueType || options.type, configValue);
      return {
        key: cleanKey(key),
        value: configValue,
        rawValue: encodeValue(configValue, valueType),
        valueType,
        description: options.description || "",
        source: "config",
        config: {
          ok: !!cfg.ok,
          exists: !!cfg.exists,
          path: cfg.path || "",
          error: cfg.error || ""
        },
        createdAt: "",
        updatedAt: "",
        found: true
      };
    }
  }

  const valueType = normalizeValueType(options.valueType || options.type, fallback);
  return {
    key: cleanKey(key),
    value: fallback,
    rawValue: encodeValue(fallback, valueType),
    valueType,
    description: options.description || "",
    source: "default",
    createdAt: "",
    updatedAt: "",
    found: false
  };
}

module.exports = {
  DEFAULT_SETTINGS_TABLE,
  nowIso,
  cleanKey,
  cleanTable,
  normalizeValueType,
  encodeValue,
  decodeValue,
  rowToSetting,
  ensureSettingsTable,
  seedDefaults,
  getSettingRow,
  getSetting,
  setSetting,
  listSettings,
  deleteSetting,
  readConfigFallback,
  getNestedValue,
  getSettingWithFallback
};
