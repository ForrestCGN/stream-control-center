"use strict";

/**
 * Hug DB text store foundation.
 *
 * STEP009:
 * - legt DB-Tabellen fuer Hug-Settings, Hug-Typen und Hug-Texte an
 * - importiert config/messages/hug.json einmalig, wenn noch keine DB-Texte vorhanden sind
 * - veraendert bestehende Hug-/Rehug-Routen nicht
 */

const fs = require("fs");
const sqlite = require("./sqlite_core");
const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");

const MODULE_NAME = "hug_text_store";
const SCHEMA_VERSION = 1;

let appRef = null;
let lastImport = null;
let lastError = "";
let configPath = "";
let messagesPath = "";

const DEFAULT_HUG_SYSTEM_CONFIG = {
  version: 1,
  enabled: true,
  rehugWindowSeconds: 300,
  topLimit: 5,
  output: {
    mode: "streamerbot",
    prefer: "bot",
    fallbackToStreamer: true,
    fallbackToStreamerbot: true,
    returnChatMessage: true
  }
};

function nowIso() {
  return core.nowIso();
}

function readJsonSafe(filePath, fallback) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    lastError = err.message || String(err);
    return fallback;
  }
}

function mergePlainObject(base, extra) {
  const out = { ...(base || {}) };
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = mergePlainObject(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function ensureSqlite(ctx) {
  try {
    sqlite.getDb();
  } catch (_) {
    sqlite.init(ctx || {});
  }
}

function ensureSchema() {
  sqlite.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS hug_settings (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hug_types (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          weight INTEGER NOT NULL DEFAULT 1,
          enabled INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hug_types_enabled_sort
          ON hug_types(enabled, sort_order, id);

        CREATE TABLE IF NOT EXISTS hug_texts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text_key TEXT NOT NULL DEFAULT '',
          type_id INTEGER NULL,
          kind TEXT NOT NULL,
          text TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          weight INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(text_key, type_id, kind, text)
        );

        CREATE INDEX IF NOT EXISTS idx_hug_texts_kind_type
          ON hug_texts(kind, type_id, enabled, sort_order, id);

        CREATE INDEX IF NOT EXISTS idx_hug_texts_key
          ON hug_texts(text_key, kind, enabled);
      `);
    }
  });
}

function tableCount(tableName) {
  try {
    const row = sqlite.get(`SELECT COUNT(*) AS count FROM ${tableName}`);
    return Number(row?.count || 0);
  } catch (_) {
    return 0;
  }
}

function saveSetting(key, value) {
  const now = nowIso();
  sqlite.run(
    `
    INSERT INTO hug_settings (key, value_json, created_at, updated_at)
    VALUES (:key, :valueJson, :now, :now)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
    `,
    {
      key,
      valueJson: JSON.stringify(value || {}),
      now
    }
  );
}

function insertHugType(type, sortOrder) {
  const now = nowIso();
  sqlite.run(
    `
    INSERT INTO hug_types (id, name, weight, enabled, sort_order, created_at, updated_at)
    VALUES (:id, :name, :weight, 1, :sortOrder, :now, :now)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      weight = excluded.weight,
      sort_order = excluded.sort_order,
      updated_at = excluded.updated_at
    `,
    {
      id: Number(type.id),
      name: String(type.name || `Typ ${type.id}`),
      weight: Math.max(1, Number(type.weight || 1)),
      sortOrder: Number(sortOrder || 0),
      now
    }
  );
}

function insertText({ textKey = "", typeId = null, kind, text, sortOrder = 0, weight = 1 }) {
  const cleanText = String(text || "").trim();
  if (!cleanText || !kind) return false;
  const now = nowIso();
  sqlite.run(
    `
    INSERT OR IGNORE INTO hug_texts (
      text_key, type_id, kind, text,
      enabled, weight, sort_order,
      created_at, updated_at
    )
    VALUES (
      :textKey, :typeId, :kind, :text,
      1, :weight, :sortOrder,
      :now, :now
    )
    `,
    {
      textKey: String(textKey || ""),
      typeId: typeId === null || typeId === undefined ? null : Number(typeId),
      kind: String(kind),
      text: cleanText,
      weight: Math.max(1, Number(weight || 1)),
      sortOrder: Number(sortOrder || 0),
      now
    }
  );
  return true;
}

function importFromJsonIfEmpty(options = {}) {
  const force = options.force === true;
  const existingTypes = tableCount("hug_types");
  const existingTexts = tableCount("hug_texts");

  if (!force && (existingTypes > 0 || existingTexts > 0)) {
    lastImport = {
      ok: true,
      skipped: true,
      reason: "db_not_empty",
      existingTypes,
      existingTexts,
      importedTypes: 0,
      importedTexts: 0,
      importedAt: nowIso()
    };
    return lastImport;
  }

  const systemConfig = mergePlainObject(DEFAULT_HUG_SYSTEM_CONFIG, readJsonSafe(configPath, {}));
  const messagesConfig = readJsonSafe(messagesPath, {});

  if (!messagesConfig || typeof messagesConfig !== "object") {
    lastImport = {
      ok: false,
      skipped: false,
      reason: "messages_config_invalid",
      importedTypes: 0,
      importedTexts: 0,
      importedAt: nowIso()
    };
    return lastImport;
  }

  let importedTypes = 0;
  let importedTexts = 0;

  const tx = sqlite.transaction(() => {
    saveSetting("main", systemConfig);

    const hugAllTexts = Array.isArray(messagesConfig.hugAllTexts) ? messagesConfig.hugAllTexts : [];
    hugAllTexts.forEach((text, index) => {
      if (insertText({ textKey: "hug_all", kind: "hug_all", text, sortOrder: index })) importedTexts += 1;
    });

    const hugTypes = Array.isArray(messagesConfig.hugTypes) ? messagesConfig.hugTypes : [];
    hugTypes.forEach((type, typeIndex) => {
      if (!type || type.id === undefined || type.id === null) return;
      insertHugType(type, typeIndex);
      importedTypes += 1;

      const hugTexts = Array.isArray(type.hugTexts) ? type.hugTexts : [];
      hugTexts.forEach((text, index) => {
        if (insertText({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "hug", text, sortOrder: index, weight: type.weight || 1 })) importedTexts += 1;
      });

      const rehugTexts = Array.isArray(type.rehugTexts) ? type.rehugTexts : [];
      rehugTexts.forEach((text, index) => {
        if (insertText({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "rehug", text, sortOrder: index, weight: type.weight || 1 })) importedTexts += 1;
      });
    });

    const responses = messagesConfig.responses && typeof messagesConfig.responses === "object" ? messagesConfig.responses : {};
    Object.entries(responses).forEach(([key, text], index) => {
      if (insertText({ textKey: key, kind: "response", text, sortOrder: index })) importedTexts += 1;
    });

    const topTitles = messagesConfig.topTitles && typeof messagesConfig.topTitles === "object" ? messagesConfig.topTitles : {};
    Object.entries(topTitles).forEach(([key, text], index) => {
      if (insertText({ textKey: key, kind: "top_title", text, sortOrder: index })) importedTexts += 1;
    });
  });

  tx();

  lastImport = {
    ok: true,
    skipped: false,
    reason: force ? "forced_import" : "initial_import",
    importedTypes,
    importedTexts,
    importedAt: nowIso(),
    source: {
      config: configPath,
      messages: messagesPath
    }
  };

  return lastImport;
}

function getKindCounts() {
  try {
    return sqlite.all(
      `
      SELECT kind, COUNT(*) AS count
      FROM hug_texts
      GROUP BY kind
      ORDER BY kind ASC
      `
    );
  } catch (_) {
    return [];
  }
}

function getStatus() {
  return {
    ok: true,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    databasePath: sqlite.getDbPath ? sqlite.getDbPath() : null,
    configPath,
    messagesPath,
    files: {
      config: !!configPath && fs.existsSync(configPath),
      messages: !!messagesPath && fs.existsSync(messagesPath)
    },
    tables: {
      hug_settings: tableCount("hug_settings"),
      hug_types: tableCount("hug_types"),
      hug_texts: tableCount("hug_texts"),
      hug_users: tableCount("hug_users"),
      hug_pair_stats: tableCount("hug_pair_stats"),
      hug_pending_rehugs: tableCount("hug_pending_rehugs")
    },
    textKinds: getKindCounts(),
    lastImport,
    lastError
  };
}

function init(ctx) {
  appRef = ctx.app;
  configPath = config.resolveFromConfig("hug_system.json");
  messagesPath = config.resolveFromConfig("messages", "hug.json");

  ensureSqlite(ctx);
  ensureSchema();
  importFromJsonIfEmpty({ force: false });

  routes.registerGet(appRef, ["/api/hug/text-store/status", "/api/dashboard/community/hug/text-store/status"], (req, res) => {
    res.json(getStatus());
  });

  routes.registerPost(appRef, ["/api/hug/text-store/reload"], (req, res) => {
    // Reload bedeutet hier bewusst nur: Config neu lesen und, falls DB leer ist, importieren.
    // Kein Loeschen, kein Ueberschreiben bestehender DB-Texte.
    const result = importFromJsonIfEmpty({ force: false });
    res.json({ ok: true, result, status: getStatus() });
  });

  return { name: MODULE_NAME, step: "009" };
}

module.exports = {
  init,
  getStatus,
  importFromJsonIfEmpty
};
