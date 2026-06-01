"use strict";

/**
 * Final Hug/Rehug module.
 *
 * STEP014:
 * - ersetzt die bisherigen Hug-Bridge-/Zwischenmodule
 * - nutzt die zentrale Core-Datenbank-Schicht backend/core/database.js
 * - behält bestehende Routen und Streamer.bot-Kompatibilität bei
 * - Texte/Settings liegen in der DB, JSON bleibt Initial-Import/Fallback
 */

const fs = require("fs");
const db = require("../core/database");
const twitch = require("./twitch");
const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");
const chatOutput = require("./helpers/helper_chat_output");

const MODULE_NAME = "hug";
const SCHEMA_VERSION = 3;
const MODULE_VERSION = "0.1.0";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: "runtime",
  category: "community",
  legacy: false,
  routesPrefix: ["/api/hug", "/hug", "/api/dashboard/community/hug"],
  bus: {
    publishes: ["hug.status", "hug.command"],
    consumes: ["twitch.chat.command"]
  },
  description: "Hug/Rehug runtime, dashboard endpoints and chat command handling"
};

let appRef = null;
let systemConfigPath = "";
let messagesPath = "";
let cache = null;
let cacheLoadedAt = null;
let lastImport = null;
let lastError = "";

const DEFAULT_SETTINGS = {
  version: 2,
  enabled: true,
  rehugWindowSeconds: 300,
  topLimit: 5,
  output: {
    mode: "central",
    prefer: "bot",
    fallbackToStreamer: true,
    fallbackToStreamerbot: true,
    returnChatMessage: true
  }
};

const DEFAULT_MESSAGES = {
  version: 1,
  hugAllTexts: ["{from} verteilt einfach mal eine große Umarmung an den ganzen Chat 🤗"],
  hugTypes: [{
    id: 1,
    name: "Standard",
    weight: 1,
    hugTexts: ["{from} zieht {to} in eine richtig herzliche Umarmung 🤗"],
    rehugTexts: ["{from} erwidert die herzliche Umarmung von {to} direkt mit genauso viel Wärme 💜"]
  }],
  responses: {
    hugsEnabled: "@{actor}, Hugs sind für dich wieder aktiviert. 🤗",
    hugsDisabled: "@{actor}, du hast Hugs für dich deaktiviert.",
    userNotFound: "@{actor}, den Benutzer '{target}' gibt es nicht.",
    selfHug: "@{actor}, dich selbst zu umarmen ist etwas ineffizient 😄",
    selfRehug: "@{actor}, dich selbst zu rehuggen ist Quatsch 😄",
    targetDisabled: "@{actor}, {targetDisplay} möchte derzeit keine Hugs erhalten.",
    noPendingRehug: "@{actor}, du kannst {targetDisplay} nur rehuggen, wenn {targetDisplay} dich vorher gehuggt hat.",
    rehugExpired: "@{actor}, der Hug von {targetDisplay} ist älter als {minutes} Minuten. Das Rehug-Fenster ist abgelaufen.",
    missingRehugType: "@{actor}, der passende Rehug-Typ wurde nicht gefunden.",
    unknownAction: "Unbekannte Aktion '{action}'.",
    missingAction: "Fehlende Aktion.",
    missingActorData: "Fehlende Actor-Daten.",
    missingRequesterData: "Fehlende Requester-Daten.",
    noStats: "@{actor}, für diesen User gibt es noch keine Hug-Daten.",
    stats: "@{actor} | {targetDisplay} | vergeben: {givenTotal} | erhalten: {receivedTotal} | Rehugs vergeben: {rehugGivenTotal} | Rehugs erhalten: {rehugReceivedTotal}",
    topNoData: "{title}: Noch keine Daten vorhanden.",
    topList: "{title}: {items}",
    reloadOk: "Hug-System wurde neu geladen.",
    reloadFailed: "Hug-System konnte nicht neu geladen werden.",
    identityMismatch: "@{actor}, Twitch-ID und Login passen nicht zusammen. Bitte echte Twitch-User-ID verwenden.",
    internalError: "Interner Fehler im Hug-System.",
    internalStatsError: "Interner Fehler bei Hug-Stats.",
    internalTopError: "Interner Fehler bei Hug-Topliste.",
    systemDisabled: "@{actor}, das Hug-System ist aktuell deaktiviert."
  },
  topTitles: {
    given: "Top Hugs",
    received: "Top erhaltene Hugs",
    rehug: "Top Rehugs"
  }
};

function nowIso() { return db.nowIso ? db.nowIso() : core.nowIso(); }
function nowMs() { return Date.now(); }
function clean(value) { return String(value || "").trim(); }
function normalizeLogin(input) {
  let v = clean(input);
  if (v.startsWith("@")) v = v.slice(1);
  return v.toLowerCase();
}
function readJsonIfExists(filePath, fallback = null) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    lastError = err.message || String(err);
    return fallback;
  }
}
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = clone(item);
    return out;
  }
  return value;
}
function deepMerge(base, override) {
  const out = clone(base || {});
  if (!override || typeof override !== "object" || Array.isArray(override)) return out;
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) out[key] = deepMerge(out[key], value);
    else out[key] = clone(value);
  }
  return out;
}

function ensureSchema(ctx) {
  db.ensureReady(ctx);
  db.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_fromVersion, toVersion, database) => {
    if (toVersion === 1) {
      database.exec(`
        CREATE TABLE IF NOT EXISTS hug_users (
          user_id TEXT PRIMARY KEY,
          login TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          given_total INTEGER NOT NULL DEFAULT 0,
          received_total INTEGER NOT NULL DEFAULT 0,
          rehug_given_total INTEGER NOT NULL DEFAULT 0,
          rehug_received_total INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hug_users_display_name ON hug_users(display_name);

        CREATE TABLE IF NOT EXISTS hug_pair_stats (
          from_user_id TEXT NOT NULL,
          to_user_id TEXT NOT NULL,
          given_count INTEGER NOT NULL DEFAULT 0,
          rehug_count INTEGER NOT NULL DEFAULT 0,
          last_hug_at TEXT NULL,
          last_rehug_at TEXT NULL,
          PRIMARY KEY (from_user_id, to_user_id)
        );

        CREATE TABLE IF NOT EXISTS hug_pending_rehugs (
          id ${db.primaryKeyAutoIncrementSql()},
          target_user_id TEXT NOT NULL,
          from_user_id TEXT NOT NULL,
          type_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hug_pending_target ON hug_pending_rehugs(target_user_id);
        CREATE INDEX IF NOT EXISTS idx_hug_pending_target_from ON hug_pending_rehugs(target_user_id, from_user_id);
        CREATE INDEX IF NOT EXISTS idx_hug_pending_expires ON hug_pending_rehugs(expires_at);
      `);
    }

    if (toVersion === 2) {
      database.exec(`
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

        CREATE INDEX IF NOT EXISTS idx_hug_types_enabled_sort ON hug_types(enabled, sort_order, id);

        CREATE TABLE IF NOT EXISTS hug_texts (
          id ${db.primaryKeyAutoIncrementSql()},
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

        CREATE INDEX IF NOT EXISTS idx_hug_texts_kind_type ON hug_texts(kind, type_id, enabled, sort_order, id);
        CREATE INDEX IF NOT EXISTS idx_hug_texts_key ON hug_texts(text_key, kind, enabled);
      `);
    }

    if (toVersion === 3) {
      database.exec(`
        CREATE TABLE IF NOT EXISTS hug_text_pairs (
          id ${db.primaryKeyAutoIncrementSql()},
          type_id INTEGER NOT NULL,
          category TEXT NOT NULL DEFAULT 'hug_pairs',
          name TEXT NOT NULL DEFAULT '',
          hug_text TEXT NOT NULL,
          rehug_text TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          weight INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'database',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hug_text_pairs_type_enabled ON hug_text_pairs(type_id, enabled, sort_order, id);
        CREATE INDEX IF NOT EXISTS idx_hug_text_pairs_category ON hug_text_pairs(category, enabled, sort_order, id);
      `);
    }
  });
}


function columnExists(tableName, columnName) {
  try {
    return db.columnExists(tableName, columnName);
  } catch (_) {
    return false;
  }
}

function ensureHugTextPairSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hug_text_pairs (
      id ${db.primaryKeyAutoIncrementSql()},
      type_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'hug_pairs',
      name TEXT NOT NULL DEFAULT '',
      hug_text TEXT NOT NULL,
      rehug_text TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      weight INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'database',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hug_text_pairs_type_enabled ON hug_text_pairs(type_id, enabled, sort_order, id);
    CREATE INDEX IF NOT EXISTS idx_hug_text_pairs_category ON hug_text_pairs(category, enabled, sort_order, id);
  `);

  if (!columnExists("hug_pending_rehugs", "pair_id")) {
    db.exec(`ALTER TABLE hug_pending_rehugs ADD COLUMN pair_id INTEGER NULL;`);
  }
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hug_pending_pair ON hug_pending_rehugs(pair_id);`);
}

function rowToTextPair(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    typeId: Number(row.type_id),
    category: row.category || "hug_pairs",
    name: row.name || "",
    hugText: row.hug_text || "",
    rehugText: row.rehug_text || "",
    enabled: Number(row.enabled) === 1,
    weight: Math.max(1, Number(row.weight || 1)),
    sortOrder: Number(row.sort_order || 0),
    source: row.source || "database",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function getTextPairs(typeId = null, options = {}) {
  const where = [];
  const params = {};
  if (typeId !== null && typeId !== undefined && String(typeId) !== "") {
    where.push("type_id=:typeId");
    params.typeId = Number(typeId);
  }
  if (options.activeOnly === true) where.push("enabled=1");
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return db.all(`
    SELECT id, type_id, category, name, hug_text, rehug_text, enabled, weight, sort_order, source, created_at, updated_at
    FROM hug_text_pairs
    ${sqlWhere}
    ORDER BY type_id ASC, sort_order ASC, id ASC
  `, params).map(rowToTextPair);
}

function getTextPairById(pairId, options = {}) {
  const id = Number(pairId || 0);
  if (!id) return null;
  const activeWhere = options.activeOnly === true ? " AND enabled=1" : "";
  return rowToTextPair(db.get(`
    SELECT id, type_id, category, name, hug_text, rehug_text, enabled, weight, sort_order, source, created_at, updated_at
    FROM hug_text_pairs
    WHERE id=:id${activeWhere}
    LIMIT 1
  `, { id }));
}

function insertTextPairIfMissing({ typeId, category = "hug_pairs", name = "", hugText, rehugText, weight = 1, sortOrder = 0, source = "legacy_hug_texts" }) {
  const cleanHug = clean(hugText);
  const cleanRehug = clean(rehugText);
  const numericTypeId = Number(typeId || 0);
  if (!numericTypeId || !cleanHug || !cleanRehug) return false;
  const existing = db.get(`
    SELECT id FROM hug_text_pairs
    WHERE type_id=:typeId AND hug_text=:hugText AND rehug_text=:rehugText
    LIMIT 1
  `, { typeId: numericTypeId, hugText: cleanHug, rehugText: cleanRehug });
  if (existing) return false;
  db.run(`
    INSERT INTO hug_text_pairs
      (type_id, category, name, hug_text, rehug_text, enabled, weight, sort_order, source, created_at, updated_at)
    VALUES
      (:typeId, :category, :name, :hugText, :rehugText, 1, :weight, :sortOrder, :source, :now, :now)
  `, {
    typeId: numericTypeId,
    category: String(category || "hug_pairs"),
    name: String(name || ""),
    hugText: cleanHug,
    rehugText: cleanRehug,
    weight: Math.max(1, Number(weight || 1)),
    sortOrder: Number(sortOrder || 0),
    source: String(source || "legacy_hug_texts"),
    now: nowIso()
  });
  return true;
}

function migrateTextPairsFromLegacyTexts() {
  ensureHugTextPairSchema();
  const types = db.all(`SELECT id, name, weight FROM hug_types ORDER BY sort_order ASC, id ASC`);
  let insertedPairs = 0;
  for (const type of types) {
    const typeId = Number(type.id);
    const hugs = getTexts("hug", typeId);
    const rehugs = getTexts("rehug", typeId);
    const pairCount = Math.min(hugs.length, rehugs.length);
    for (let index = 0; index < pairCount; index += 1) {
      if (insertTextPairIfMissing({
        typeId,
        category: "hug_pairs",
        name: `${type.name || `Typ ${typeId}`} ${index + 1}`,
        hugText: hugs[index].text,
        rehugText: rehugs[index].text,
        weight: Math.max(1, Number(hugs[index].weight || rehugs[index].weight || type.weight || 1)),
        sortOrder: index,
        source: "legacy_hug_texts"
      })) insertedPairs += 1;
    }
  }
  if (lastImport && typeof lastImport === "object") lastImport.textPairs = { table: "hug_text_pairs", inserted: insertedPairs, total: count("hug_text_pairs") };
  return { ok: true, insertedPairs, totalPairs: count("hug_text_pairs") };
}

function pickTextPairForType(typeId) {
  const pairs = getTextPairs(typeId, { activeOnly: true });
  return pickWeighted(pairs);
}

function pickWeightedTextPair() {
  const pairs = getTextPairs(null, { activeOnly: true });
  return pickWeighted(pairs);
}

function pickWeightedHugTypeWithPairs() {
  const available = getCache().hugTypes.filter(type => Number(type.textPairCount || 0) > 0);
  return pickWeighted(available.map(type => ({ ...type, weight: type.weight || 1 }))) || available[0] || pickWeightedHugType();
}

function saveTextPair(pair = {}) {
  ensureHugTextPairSchema();
  const id = Number(pair.id || pair.pairId || 0);
  const typeId = Number(pair.typeId || pair.type_id || 1);
  const hugText = String(pair.hugText ?? pair.hug_text ?? "").trim();
  const rehugText = String(pair.rehugText ?? pair.rehug_text ?? "").trim();
  if (!typeId) throw new Error("type_id_required");
  if (!hugText) throw new Error("hug_text_required");
  if (!rehugText) throw new Error("rehug_text_required");
  const data = {
    id,
    typeId,
    category: String(pair.category || "hug_pairs"),
    name: String(pair.name || ""),
    hugText,
    rehugText,
    enabled: pair.enabled === false || pair.enabled === 0 || pair.enabled === "false" ? 0 : 1,
    weight: Math.max(1, Number(pair.weight || 1)),
    sortOrder: Number(pair.sortOrder ?? pair.sort_order ?? 0) || 0,
    now: nowIso()
  };

  if (id > 0) {
    db.run(`
      UPDATE hug_text_pairs
      SET type_id=:typeId,
          category=:category,
          name=:name,
          hug_text=:hugText,
          rehug_text=:rehugText,
          enabled=:enabled,
          weight=:weight,
          sort_order=:sortOrder,
          source='database',
          updated_at=:now
      WHERE id=:id
    `, data);
  } else {
    const insertData = { ...data };
    delete insertData.id;

    db.run(`
      INSERT INTO hug_text_pairs
        (type_id, category, name, hug_text, rehug_text, enabled, weight, sort_order, source, created_at, updated_at)
      VALUES
        (:typeId, :category, :name, :hugText, :rehugText, :enabled, :weight, :sortOrder, 'database', :now, :now)
    `, insertData);
  }
  cache = null;
  return getTextPairEditorPayload();
}

function deleteTextPair(pairId) {
  const id = Number(pairId || 0);
  if (!id) throw new Error("pair_id_required");
  const result = db.run(`DELETE FROM hug_text_pairs WHERE id=:id`, { id });
  cache = null;
  return { ok: true, deleted: Number(result?.changes || 0), pairs: getTextPairEditorPayload() };
}

function getTextPairEditorPayload() {
  ensureHugTextPairSchema();
  migrateTextPairsFromLegacyTexts();
  const pairs = getTextPairs(null, { activeOnly: false });
  const types = getTypes().map(type => ({
    ...type,
    textPairs: pairs.filter(pair => pair.typeId === type.id),
    textPairCount: pairs.filter(pair => pair.typeId === type.id).length,
    activeTextPairCount: pairs.filter(pair => pair.typeId === type.id && pair.enabled).length
  }));
  return {
    ok: true,
    module: MODULE_NAME,
    table: "hug_text_pairs",
    category: "hug_pairs",
    categories: [{ id: "hug_pairs", key: "hug_pairs", label: "Hug/Rehug-Paare", count: pairs.length, variantCount: pairs.length }],
    count: pairs.length,
    activeCount: pairs.filter(pair => pair.enabled).length,
    types,
    pairs
  };
}

function handleTextPairsPayload(payload = {}) {
  const body = payload && typeof payload === "object" ? payload : {};
  const action = String(body.action || "").trim();
  if (action === "deletePair" || action === "delete_pair") return deleteTextPair(body.id || body.pairId);
  if (action === "savePair" || action === "save_pair" || body.pair) return { ok: true, pairs: saveTextPair(body.pair || body) };
  return getTextPairEditorPayload();
}

function count(tableName) {
  try { return db.count(tableName); } catch (_) { return 0; }
}
function getSettingFromDb() {
  const row = db.get(`SELECT value_json FROM hug_settings WHERE key=:key`, { key: "main" });
  return db.jsonDecode(row?.value_json, {});
}
function saveSettings(settings) {
  const now = nowIso();
  const existing = db.get(`SELECT key FROM hug_settings WHERE key=:key`, { key: "main" });
  if (existing) {
    db.run(`UPDATE hug_settings SET value_json=:valueJson, updated_at=:now WHERE key=:key`, { key: "main", valueJson: db.jsonEncode(settings || {}), now });
  } else {
    db.run(`INSERT INTO hug_settings (key, value_json, created_at, updated_at) VALUES (:key, :valueJson, :now, :now)`, { key: "main", valueJson: db.jsonEncode(settings || {}), now });
  }
  cache = null;
  return settings;
}
function saveMainSettingIfMissing(settings) {
  const row = db.get(`SELECT key FROM hug_settings WHERE key=:key`, { key: "main" });
  if (!row) saveSettings(settings || DEFAULT_SETTINGS);
}
function upsertHugType(type, sortOrder) {
  if (type.id === undefined || type.id === null) return;
  const id = Number(type.id);
  const existing = db.get(`SELECT id FROM hug_types WHERE id=:id`, { id });
  const data = {
    id,
    name: String(type.name || id),
    weight: Math.max(1, Number(type.weight || 1)),
    sortOrder: Number(sortOrder || 0),
    now: nowIso()
  };
  if (existing) db.run(`UPDATE hug_types SET name=:name, weight=:weight, sort_order=:sortOrder, updated_at=:now WHERE id=:id`, data);
  else db.run(`INSERT INTO hug_types (id, name, weight, enabled, sort_order, created_at, updated_at) VALUES (:id, :name, :weight, 1, :sortOrder, :now, :now)`, data);
}
function insertTextIfMissing({ textKey = "", typeId = null, kind, text, sortOrder = 0, weight = 1 }) {
  const cleanText = clean(text);
  if (!cleanText || !kind) return false;
  const existing = db.get(
    `SELECT id FROM hug_texts WHERE text_key=:textKey AND kind=:kind AND text=:text AND ((type_id IS NULL AND :typeId IS NULL) OR type_id=:typeId)`,
    { textKey: String(textKey || ""), typeId: typeId === null || typeId === undefined ? null : Number(typeId), kind: String(kind), text: cleanText }
  );
  if (existing) return false;
  db.run(
    `INSERT INTO hug_texts (text_key, type_id, kind, text, enabled, weight, sort_order, created_at, updated_at) VALUES (:textKey, :typeId, :kind, :text, 1, :weight, :sortOrder, :now, :now)`,
    { textKey: String(textKey || ""), typeId: typeId === null || typeId === undefined ? null : Number(typeId), kind: String(kind), text: cleanText, weight: Math.max(1, Number(weight || 1)), sortOrder: Number(sortOrder || 0), now: nowIso() }
  );
  return true;
}

function importJsonIfEmpty(options = {}) {
  const force = options.force === true;
  const existingTypes = count("hug_types");
  const existingTexts = count("hug_texts");
  if (!force && (existingTypes > 0 || existingTexts > 0)) {
    lastImport = { ok: true, skipped: true, reason: "db_not_empty", existingTypes, existingTexts, importedTypes: 0, importedTexts: 0, importedAt: nowIso() };
    return lastImport;
  }

  const fileSettings = readJsonIfExists(systemConfigPath, {});
  const settings = deepMerge(DEFAULT_SETTINGS, fileSettings || {});
  const messageFile = readJsonIfExists(messagesPath, null);
  const messages = deepMerge(DEFAULT_MESSAGES, messageFile || {});
  let importedTypes = 0;
  let importedTexts = 0;

  const tx = db.transaction(() => {
    saveMainSettingIfMissing(settings);
    (Array.isArray(messages.hugTypes) ? messages.hugTypes : []).forEach((type, typeIndex) => {
      upsertHugType(type, typeIndex);
      importedTypes += 1;
      (Array.isArray(type.hugTexts) ? type.hugTexts : []).forEach((text, index) => { if (insertTextIfMissing({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "hug", text, sortOrder: index, weight: type.weight || 1 })) importedTexts += 1; });
      (Array.isArray(type.rehugTexts) ? type.rehugTexts : []).forEach((text, index) => { if (insertTextIfMissing({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "rehug", text, sortOrder: index, weight: type.weight || 1 })) importedTexts += 1; });
    });
    (Array.isArray(messages.hugAllTexts) ? messages.hugAllTexts : []).forEach((text, index) => { if (insertTextIfMissing({ textKey: "hug_all", kind: "hug_all", text, sortOrder: index })) importedTexts += 1; });
    Object.entries(messages.responses || {}).forEach(([key, text], index) => { if (insertTextIfMissing({ textKey: key, kind: "response", text, sortOrder: index })) importedTexts += 1; });
    Object.entries(messages.topTitles || {}).forEach(([key, text], index) => { if (insertTextIfMissing({ textKey: key, kind: "top_title", text, sortOrder: index })) importedTexts += 1; });
  });
  tx();

  lastImport = { ok: true, skipped: false, reason: force ? "forced_import" : "initial_import", importedTypes, importedTexts, importedAt: nowIso(), source: { config: systemConfigPath, messages: messagesPath } };
  return lastImport;
}

function getTexts(kind, typeId = null, textKey = null) {
  const where = ["kind=:kind", "enabled=1"];
  const params = { kind };
  if (typeId !== null && typeId !== undefined) { where.push("type_id=:typeId"); params.typeId = Number(typeId); }
  if (textKey !== null && textKey !== undefined) { where.push("text_key=:textKey"); params.textKey = String(textKey); }
  return db.all(`SELECT id, text_key, type_id, kind, text, enabled, weight, sort_order, updated_at FROM hug_texts WHERE ${where.join(" AND ")} ORDER BY sort_order ASC, id ASC`, params)
    .map(row => ({ id: Number(row.id), textKey: row.text_key || "", typeId: row.type_id === null || row.type_id === undefined ? null : Number(row.type_id), kind: row.kind || "", text: row.text || "", enabled: Number(row.enabled) === 1, weight: Math.max(1, Number(row.weight || 1)), sortOrder: Number(row.sort_order || 0), updatedAt: row.updated_at || null }));
}

function getTextsForEditor(kind, options = {}) {
  const allowedKinds = new Set(["hug_all", "response", "top_title"]);
  const cleanKind = String(kind || "").trim();
  if (!allowedKinds.has(cleanKind)) throw new Error("unsupported_text_kind");
  const activeOnly = options.activeOnly === true;
  const where = ["kind=:kind"];
  const params = { kind: cleanKind };
  if (activeOnly) where.push("enabled=1");
  return db.all(`
    SELECT id, text_key, type_id, kind, text, enabled, weight, sort_order, created_at, updated_at
    FROM hug_texts
    WHERE ${where.join(" AND ")}
    ORDER BY sort_order ASC, id ASC
  `, params).map(row => ({
    id: Number(row.id),
    textKey: row.text_key || cleanKind,
    typeId: row.type_id === null || row.type_id === undefined ? null : Number(row.type_id),
    kind: row.kind || cleanKind,
    text: row.text || "",
    enabled: Number(row.enabled) === 1,
    weight: Math.max(1, Number(row.weight || 1)),
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  }));
}

function saveHugTextItem(item = {}, forcedKind = "hug_all") {
  const kind = String(forcedKind || item.kind || "").trim();
  const allowedKinds = new Set(["hug_all", "response", "top_title"]);
  if (!allowedKinds.has(kind)) throw new Error("unsupported_text_kind");
  const id = Number(item.id || item.textId || 0);
  const text = String(item.text || "").trim();
  if (!text) throw new Error("text_required");
  const data = {
    id,
    textKey: String(item.textKey || item.text_key || kind),
    typeId: item.typeId === null || item.typeId === undefined || item.typeId === "" ? null : Number(item.typeId),
    kind,
    text,
    enabled: item.enabled === false || item.enabled === 0 || item.enabled === "false" ? 0 : 1,
    weight: Math.max(1, Number(item.weight || 1)),
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0) || 0,
    now: nowIso()
  };

  if (id > 0) {
    db.run(`
      UPDATE hug_texts
      SET text_key=:textKey,
          type_id=:typeId,
          kind=:kind,
          text=:text,
          enabled=:enabled,
          weight=:weight,
          sort_order=:sortOrder,
          updated_at=:now
      WHERE id=:id AND kind=:kind
    `, data);
  } else {
    const insertData = { ...data };
    delete insertData.id;

    db.run(`
      INSERT INTO hug_texts
        (text_key, type_id, kind, text, enabled, weight, sort_order, created_at, updated_at)
      VALUES
        (:textKey, :typeId, :kind, :text, :enabled, :weight, :sortOrder, :now, :now)
    `, insertData);
  }
  cache = null;
  return getHugAllTextEditorPayload();
}

function deleteHugTextItem(id, forcedKind = "hug_all") {
  const textId = Number(id || 0);
  const kind = String(forcedKind || "hug_all").trim();
  if (!textId) throw new Error("text_id_required");
  if (!["hug_all", "response", "top_title"].includes(kind)) throw new Error("unsupported_text_kind");
  const result = db.run(`DELETE FROM hug_texts WHERE id=:id AND kind=:kind`, { id: textId, kind });
  cache = null;
  return { ok: true, deleted: Number(result?.changes || 0), texts: getHugAllTextEditorPayload() };
}

function getHugAllTextEditorPayload() {
  const texts = getTextsForEditor("hug_all", { activeOnly: false });
  return {
    ok: true,
    module: MODULE_NAME,
    table: "hug_texts",
    kind: "hug_all",
    category: "hug_all",
    label: "Chatweite Hugs",
    count: texts.length,
    activeCount: texts.filter(item => item.enabled).length,
    texts
  };
}

function handleHugAllTextPayload(payload = {}) {
  const body = payload && typeof payload === "object" ? payload : {};
  const action = String(body.action || "").trim();
  if (action === "deleteText" || action === "delete_text") return deleteHugTextItem(body.id || body.textId, "hug_all");
  if (action === "saveText" || action === "save_text" || body.text) return { ok: true, texts: saveHugTextItem(body.text || body, "hug_all") };
  return getHugAllTextEditorPayload();
}

function getResponseTextEditorPayload() {
  const texts = getTextsForEditor("response", { activeOnly: false });
  return {
    ok: true,
    module: MODULE_NAME,
    table: "hug_texts",
    kind: "response",
    category: "responses",
    label: "Systemantworten",
    count: texts.length,
    activeCount: texts.filter(item => item.enabled).length,
    texts
  };
}

function handleResponseTextPayload(payload = {}) {
  const body = payload && typeof payload === "object" ? payload : {};
  const action = String(body.action || "").trim();
  if (action === "deleteText" || action === "delete_text") return deleteHugTextItem(body.id || body.textId, "response");
  if (action === "saveText" || action === "save_text" || body.text) return { ok: true, texts: saveHugTextItem(body.text || body, "response") };
  return getResponseTextEditorPayload();
}

function getTopTitleTextEditorPayload() {
  const texts = getTextsForEditor("top_title", { activeOnly: false });
  return {
    ok: true,
    module: MODULE_NAME,
    table: "hug_texts",
    kind: "top_title",
    category: "top_titles",
    label: "Toplisten",
    count: texts.length,
    activeCount: texts.filter(item => item.enabled).length,
    texts
  };
}

function handleTopTitleTextPayload(payload = {}) {
  const body = payload && typeof payload === "object" ? payload : {};
  const action = String(body.action || "").trim();
  if (action === "deleteText" || action === "delete_text") return deleteHugTextItem(body.id || body.textId, "top_title");
  if (action === "saveText" || action === "save_text" || body.text) return { ok: true, texts: saveHugTextItem(body.text || body, "top_title") };
  return getTopTitleTextEditorPayload();
}
function pickWeighted(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + Math.max(1, Number(item.weight || 1)), 0);
  let roll = Math.random() * total;
  for (const item of items) { roll -= Math.max(1, Number(item.weight || 1)); if (roll <= 0) return item; }
  return items[0];
}
function pickText(items, fallback = "") { const item = pickWeighted(items); return item ? item.text : fallback; }

function loadCache() {
  importJsonIfEmpty({ force: false });
  migrateTextPairsFromLegacyTexts();
  const dbSettings = getSettingFromDb();
  const fileSettings = readJsonIfExists(systemConfigPath, {});
  // DB gewinnt vor JSON, damit spaetere Dashboard-Aenderungen nicht von JSON ueberstimmt werden.
  const settings = deepMerge(deepMerge(DEFAULT_SETTINGS, fileSettings || {}), dbSettings || {});
  saveMainSettingIfMissing(settings);

  const typeRows = db.all(`SELECT id, name, weight FROM hug_types WHERE enabled=1 ORDER BY sort_order ASC, id ASC`);
  const types = typeRows.map(row => {
    const typeId = Number(row.id);
    const textPairs = getTextPairs(typeId, { activeOnly: true });
    return {
      id: typeId,
      name: row.name,
      weight: Math.max(1, Number(row.weight || 1)),
      hugTexts: getTexts("hug", typeId).map(x => x.text),
      rehugTexts: getTexts("rehug", typeId).map(x => x.text),
      textPairCount: textPairs.length,
      textPairs
    };
  }).filter(type => type.textPairCount > 0 || (type.hugTexts.length > 0 && type.rehugTexts.length > 0));

  const responses = { ...(DEFAULT_MESSAGES.responses || {}) };
  db.all(`SELECT text_key, text FROM hug_texts WHERE kind='response' AND enabled=1 ORDER BY sort_order ASC, id ASC`).forEach(row => { if (row.text_key) responses[row.text_key] = row.text; });
  const topTitles = { ...(DEFAULT_MESSAGES.topTitles || {}) };
  db.all(`SELECT text_key, text FROM hug_texts WHERE kind='top_title' AND enabled=1 ORDER BY sort_order ASC, id ASC`).forEach(row => { if (row.text_key) topTitles[row.text_key] = row.text; });

  cache = { version: 2, source: "database", enabled: settings.enabled !== false, rehugWindowSeconds: Number(settings.rehugWindowSeconds || 300), topLimit: Math.max(1, Number(settings.topLimit || 5)), output: deepMerge(DEFAULT_SETTINGS.output, settings.output || {}), hugTypes: types, hugAllTexts: getTexts("hug_all").map(x => x.text), responses, topTitles };
  cacheLoadedAt = nowIso();
  if (cache.hugTypes.length === 0 || cache.hugAllTexts.length === 0) throw new Error("hug_db_texts_empty_or_invalid");
  console.log(`[hug] loaded: types=${cache.hugTypes.length} | hugAll=${cache.hugAllTexts.length} | output=${cache.output.mode}`);
  return cache;
}
function getCache() { if (!cache) return loadCache(); return cache; }
function renderTemplate(text, context = {}) { let result = String(text || ""); for (const [key, value] of Object.entries(context || {})) result = result.replaceAll(`{${key}}`, value === undefined || value === null ? "" : String(value)); return result; }
function responseText(key, context = {}, fallback = "") { const cfg = getCache(); return renderTemplate(cfg.responses[key] || fallback || DEFAULT_MESSAGES.responses[key] || "", context); }
function getRehugWindowMinutes() { return Math.max(1, Math.round(Number(getCache().rehugWindowSeconds || 300) / 60)); }
function getTypeById(typeId) { return getCache().hugTypes.find(t => Number(t.id) === Number(typeId)) || null; }
function pickWeightedHugType() { return pickWeighted(getCache().hugTypes.map(type => ({ ...type, weight: type.weight || 1 }))) || getCache().hugTypes[0]; }

async function outputResponse(text, meta = {}) {
  const cfg = getCache();
  const mode = String(cfg.output?.mode || "streamerbot").toLowerCase();
  if (mode === "central") {
    return await chatOutput.sendChatMessage(text, { source: "hug_system", reason: meta.action || meta.reason || "hug", prefer: cfg.output.prefer || "bot", fallbackToStreamer: cfg.output.fallbackToStreamer !== false, fallbackToStreamerbot: cfg.output.fallbackToStreamerbot !== false });
  }
  return { ok: true, send: true, sent: false, via: "streamerbot", chatMessage: text, message: text, streamerbot_send: "1", streamerbot_message: text };
}
function mergeResult(actionResult, outputResult) { return { ...actionResult, ...outputResult, action: actionResult.action, typeId: actionResult.typeId, ok: actionResult.ok !== false && outputResult.ok !== false }; }
async function resolveUserByLogin(login) { const normalized = normalizeLogin(login); if (!normalized) return null; return await twitch.resolveUserByLogin(normalized); }
function createUserIdentityMismatchError(existingUser, incomingUser) { const err = new Error("HUG_USER_LOGIN_ID_MISMATCH"); err.code = "HUG_USER_LOGIN_ID_MISMATCH"; err.existingUser = existingUser; err.incomingUser = incomingUser; return err; }
function isUserIdentityMismatch(err) { return err && err.code === "HUG_USER_LOGIN_ID_MISMATCH"; }
function ensureHugUser(user) {
  const existingByLogin = db.get(`SELECT user_id, login, display_name FROM hug_users WHERE login=:login`, { login: user.login });
  if (existingByLogin && String(existingByLogin.user_id) !== String(user.userId)) throw createUserIdentityMismatchError(existingByLogin, user);
  const existingById = db.get(`SELECT user_id FROM hug_users WHERE user_id=:userId`, { userId: user.userId });
  const now = nowIso();
  if (existingById) db.run(`UPDATE hug_users SET login=:login, display_name=:displayName, updated_at=:now WHERE user_id=:userId`, { userId: user.userId, login: user.login, displayName: user.displayName, now });
  else db.run(`INSERT INTO hug_users (user_id, login, display_name, enabled, given_total, received_total, rehug_given_total, rehug_received_total, created_at, updated_at) VALUES (:userId, :login, :displayName, 1, 0, 0, 0, 0, :now, :now)`, { userId: user.userId, login: user.login, displayName: user.displayName, now });
}
function ensurePairRow(fromUserId, toUserId) { const existing = db.get(`SELECT from_user_id FROM hug_pair_stats WHERE from_user_id=:fromUserId AND to_user_id=:toUserId`, { fromUserId, toUserId }); if (!existing) db.run(`INSERT INTO hug_pair_stats (from_user_id, to_user_id, given_count, rehug_count, last_hug_at, last_rehug_at) VALUES (:fromUserId, :toUserId, 0, 0, NULL, NULL)`, { fromUserId, toUserId }); }
function getUserEnabled(userId) { const row = db.get(`SELECT enabled FROM hug_users WHERE user_id=:userId`, { userId }); return row ? Number(row.enabled) === 1 : true; }
function getStatsByUserId(userId) { return db.get(`SELECT user_id, login, display_name, enabled, given_total, received_total, rehug_given_total, rehug_received_total FROM hug_users WHERE user_id=:userId`, { userId }); }
function cleanupExpiredPendingForTarget(targetUserId) { db.run(`DELETE FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND expires_at < :now`, { targetUserId, now: nowIso() }); }
function cleanupExpiredPendingGlobal() { db.run(`DELETE FROM hug_pending_rehugs WHERE expires_at < :now`, { now: nowIso() }); }

const doHugTx = db.transaction((actor, target, type, textPair) => {
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + (Number(getCache().rehugWindowSeconds || 300) * 1000)).toISOString();
  ensureHugUser(actor); ensureHugUser(target); ensurePairRow(actor.userId, target.userId);
  db.run(`UPDATE hug_users SET given_total=given_total+1, updated_at=:now WHERE user_id=:userId`, { userId: actor.userId, now: createdAt });
  db.run(`UPDATE hug_users SET received_total=received_total+1, updated_at=:now WHERE user_id=:userId`, { userId: target.userId, now: createdAt });
  db.run(`UPDATE hug_pair_stats SET given_count=given_count+1, last_hug_at=:now WHERE from_user_id=:fromUserId AND to_user_id=:toUserId`, { fromUserId: actor.userId, toUserId: target.userId, now: createdAt });
  db.run(`DELETE FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND from_user_id=:fromUserId`, { targetUserId: target.userId, fromUserId: actor.userId });
  db.run(`INSERT INTO hug_pending_rehugs (target_user_id, from_user_id, type_id, pair_id, created_at, expires_at) VALUES (:targetUserId, :fromUserId, :typeId, :pairId, :createdAt, :expiresAt)`, { targetUserId: target.userId, fromUserId: actor.userId, typeId: Number(type.id), pairId: textPair?.id ? Number(textPair.id) : null, createdAt, expiresAt });
});

const doRehugTx = db.transaction((actor, target, pendingRow) => {
  const now = nowIso();
  ensureHugUser(actor); ensureHugUser(target); ensurePairRow(actor.userId, target.userId);
  db.run(`UPDATE hug_users SET given_total=given_total+1, rehug_given_total=rehug_given_total+1, updated_at=:now WHERE user_id=:userId`, { userId: actor.userId, now });
  db.run(`UPDATE hug_users SET received_total=received_total+1, rehug_received_total=rehug_received_total+1, updated_at=:now WHERE user_id=:userId`, { userId: target.userId, now });
  db.run(`UPDATE hug_pair_stats SET given_count=given_count+1, rehug_count=rehug_count+1, last_hug_at=:now, last_rehug_at=:now WHERE from_user_id=:fromUserId AND to_user_id=:toUserId`, { fromUserId: actor.userId, toUserId: target.userId, now });
  db.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pendingRow.id });
});

async function executeAction(action, actorUser, targetLogin) {
  ensureHugUser(actorUser);
  if (action === "on" || action === "off") {
    const enabled = action === "on" ? 1 : 0;
    db.run(`UPDATE hug_users SET enabled=:enabled, updated_at=:now WHERE user_id=:userId`, { enabled, userId: actorUser.userId, now: nowIso() });
    const text = responseText(action === "on" ? "hugsEnabled" : "hugsDisabled", { actor: actorUser.displayName });
    return mergeResult({ ok: true, action }, await outputResponse(text, { action }));
  }
  if (!getCache().enabled) return mergeResult({ ok: false, action }, await outputResponse(responseText("systemDisabled", { actor: actorUser.displayName }), { action }));
  if (action === "hugall") return mergeResult({ ok: true, action }, await outputResponse(renderTemplate(pickText(getTexts("hug_all"), "{from} verteilt eine Umarmung an den ganzen Chat 🤗"), { from: actorUser.displayName }), { action }));

  const targetUser = await resolveUserByLogin(targetLogin);
  if (!targetUser) return mergeResult({ ok: false, action }, await outputResponse(responseText("userNotFound", { actor: actorUser.displayName, target: targetLogin }), { action }));
  ensureHugUser(targetUser);
  if (actorUser.userId === targetUser.userId) return mergeResult({ ok: false, action }, await outputResponse(action === "rehug" ? responseText("selfRehug", { actor: actorUser.displayName }) : responseText("selfHug", { actor: actorUser.displayName }), { action }));
  if (!getUserEnabled(targetUser.userId)) return mergeResult({ ok: false, action }, await outputResponse(responseText("targetDisabled", { actor: actorUser.displayName, targetDisplay: targetUser.displayName }), { action }));

  if (action === "hug") {
    cleanupExpiredPendingForTarget(targetUser.userId);
    const textPair = pickWeightedTextPair();
    if (!textPair) return mergeResult({ ok: false, action }, await outputResponse(responseText("missingRehugType", { actor: actorUser.displayName }), { action }));
    const type = getTypeById(textPair.typeId) || pickWeightedHugTypeWithPairs() || pickWeightedHugType();
    doHugTx(actorUser, targetUser, type, textPair);
    const msg = renderTemplate(textPair.hugText, { from: actorUser.displayName, to: targetUser.displayName });
    return mergeResult({ ok: true, action, typeId: Number(type.id), pairId: Number(textPair.id) }, await outputResponse(msg, { action }));
  }
  if (action === "rehug") {
    cleanupExpiredPendingForTarget(actorUser.userId);
    const pending = db.get(`SELECT id, type_id, pair_id, created_at, expires_at FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND from_user_id=:fromUserId ORDER BY created_at DESC LIMIT 1`, { targetUserId: actorUser.userId, fromUserId: targetUser.userId });
    if (!pending) return mergeResult({ ok: false, action }, await outputResponse(responseText("noPendingRehug", { actor: actorUser.displayName, targetDisplay: targetUser.displayName }), { action }));
    if (new Date(pending.expires_at).getTime() < nowMs()) { db.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pending.id }); return mergeResult({ ok: false, action }, await outputResponse(responseText("rehugExpired", { actor: actorUser.displayName, targetDisplay: targetUser.displayName, minutes: getRehugWindowMinutes() }), { action })); }
    const type = getTypeById(pending.type_id);
    const textPair = pending.pair_id ? getTextPairById(pending.pair_id, { activeOnly: false }) : null;
    if (!type || (pending.pair_id && !textPair)) { db.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pending.id }); return mergeResult({ ok: false, action }, await outputResponse(responseText("missingRehugType", { actor: actorUser.displayName }), { action })); }
    doRehugTx(actorUser, targetUser, pending);
    const fallbackRehug = pickText(getTexts("rehug", Number(type.id)), type.rehugTexts[0]);
    const msg = renderTemplate(textPair ? textPair.rehugText : fallbackRehug, { from: actorUser.displayName, to: targetUser.displayName });
    return mergeResult({ ok: true, action, typeId: Number(type.id), pairId: textPair ? Number(textPair.id) : null }, await outputResponse(msg, { action }));
  }
  return mergeResult({ ok: false, action }, await outputResponse(responseText("unknownAction", { action }), { action }));
}

function makeActor(userId, login, displayName) { return { userId: clean(userId), login: normalizeLogin(login), displayName: clean(displayName) }; }
async function handleCmd(req, res) {
  try {
    const action = normalizeLogin(core.getParam(req, "action", ""));
    const actorUser = makeActor(core.getParam(req, "actorUserId", ""), core.getParam(req, "actorLogin", ""), core.getParam(req, "actorDisplay", ""));
    const targetLogin = normalizeLogin(core.getParam(req, "targetLogin", ""));
    if (!action) return res.json({ ok: false, chatMessage: responseText("missingAction") });
    if (!actorUser.userId || !actorUser.login || !actorUser.displayName) return res.json({ ok: false, chatMessage: responseText("missingActorData") });
    return res.json(await executeAction(action, actorUser, targetLogin));
  } catch (err) { console.error("[hug] cmd failed:", err); const display = clean(core.getParam(req, "actorDisplay", "User")) || "User"; if (isUserIdentityMismatch(err)) return res.json({ ok: false, chatMessage: responseText("identityMismatch", { actor: display }) }); return res.json({ ok: false, chatMessage: responseText("internalError") }); }
}
async function handleAction(req, res) {
  try {
    const action = normalizeLogin(req.body?.action || "");
    const actor = req.body?.actor || {};
    const target = req.body?.target || {};
    const actorUser = makeActor(actor.userId, actor.login, actor.displayName);
    if (!action) return res.json({ ok: false, chatMessage: responseText("missingAction") });
    if (!actorUser.userId || !actorUser.login || !actorUser.displayName) return res.json({ ok: false, chatMessage: responseText("missingActorData") });
    return res.json(await executeAction(action, actorUser, normalizeLogin(target.login || "")));
  } catch (err) { console.error("[hug] action failed:", err); return res.json({ ok: false, chatMessage: responseText("internalError") }); }
}
async function handleStatsCore(requesterUser, targetLogin) {
  ensureHugUser(requesterUser);
  let targetUserId = requesterUser.userId;
  if (targetLogin) {
    const resolved = await resolveUserByLogin(targetLogin);
    if (!resolved) return mergeResult({ ok: false, action: "stats" }, await outputResponse(responseText("userNotFound", { actor: requesterUser.displayName, target: targetLogin }), { action: "stats" }));
    ensureHugUser(resolved); targetUserId = resolved.userId;
  }
  const stats = getStatsByUserId(targetUserId);
  if (!stats) return mergeResult({ ok: false, action: "stats" }, await outputResponse(responseText("noStats", { actor: requesterUser.displayName }), { action: "stats" }));
  const text = responseText("stats", { actor: requesterUser.displayName, targetDisplay: stats.display_name, givenTotal: stats.given_total, receivedTotal: stats.received_total, rehugGivenTotal: stats.rehug_given_total, rehugReceivedTotal: stats.rehug_received_total });
  return mergeResult({ ok: true, action: "stats" }, await outputResponse(text, { action: "stats" }));
}
async function handleStatsCmd(req, res) { try { const requester = makeActor(core.getParam(req, "requesterUserId", ""), core.getParam(req, "requesterLogin", ""), core.getParam(req, "requesterDisplay", "")); if (!requester.userId || !requester.login || !requester.displayName) return res.json({ ok: false, chatMessage: responseText("missingRequesterData") }); return res.json(await handleStatsCore(requester, normalizeLogin(core.getParam(req, "targetLogin", "")))); } catch (err) { console.error("[hug] statscmd failed:", err); return res.json({ ok: false, chatMessage: responseText("internalStatsError") }); } }
async function handleStats(req, res) { try { const requester = req.body?.requester || {}; const target = req.body?.target || {}; const requesterUser = makeActor(requester.userId, requester.login, requester.displayName); if (!requesterUser.userId || !requesterUser.login || !requesterUser.displayName) return res.json({ ok: false, chatMessage: responseText("missingRequesterData") }); return res.json(await handleStatsCore(requesterUser, normalizeLogin(target.login || ""))); } catch (err) { console.error("[hug] stats failed:", err); return res.json({ ok: false, chatMessage: responseText("internalStatsError") }); } }
async function handleTop(req, res) {
  try {
    const mode = normalizeLogin(core.getParam(req, "mode", "given"));
    let orderBy = "given_total", titleKey = "given";
    if (mode === "received") { orderBy = "received_total"; titleKey = "received"; }
    else if (mode === "rehug") { orderBy = "rehug_given_total"; titleKey = "rehug"; }
    const title = getCache().topTitles[titleKey] || DEFAULT_MESSAGES.topTitles[titleKey] || "Top Hugs";
    const limit = Math.max(1, Number(getCache().topLimit || 5));
    const rows = db.all(`SELECT display_name, given_total, received_total, rehug_given_total FROM hug_users ORDER BY ${orderBy} DESC, display_name ASC LIMIT :limit`, { limit });
    if (!rows.length) return res.json(mergeResult({ ok: true, action: "top" }, await outputResponse(responseText("topNoData", { title }), { action: "top" })));
    const parts = rows.map((row, index) => `${index + 1}. ${row.display_name} (${mode === "received" ? row.received_total : mode === "rehug" ? row.rehug_given_total : row.given_total})`);
    return res.json(mergeResult({ ok: true, action: "top" }, await outputResponse(responseText("topList", { title, items: parts.join(" - ") }), { action: "top" })));
  } catch (err) { console.error("[hug] top failed:", err); return res.json({ ok: false, chatMessage: responseText("internalTopError") }); }
}
async function handleReload(req, res) { try { cache = null; loadCache(); return res.json(mergeResult({ ok: true, action: "reload", reloaded: true }, await outputResponse(responseText("reloadOk"), { action: "reload" }))); } catch (err) { console.error("[hug] reload failed:", err); return res.json({ ok: false, chatMessage: responseText("reloadFailed"), error: err.message || String(err) }); } }
function readCommandPayload(req) { const body = req.body && typeof req.body === "object" ? req.body : {}; return { command: normalizeLogin(body.command || core.getParam(req, "command", "hug")), actorUserId: clean(body.actorUserId || body.userId || core.getParam(req, "actorUserId", core.getParam(req, "userId", ""))), actorLogin: normalizeLogin(body.actorLogin || body.userName || body.login || core.getParam(req, "actorLogin", core.getParam(req, "userName", core.getParam(req, "login", "")))), actorDisplay: clean(body.actorDisplay || body.user || body.displayName || core.getParam(req, "actorDisplay", core.getParam(req, "user", core.getParam(req, "displayName", "")))), input0: normalizeLogin(body.input0 || core.getParam(req, "input0", "")), input1: normalizeLogin(body.input1 || core.getParam(req, "input1", "")) }; }
async function handleCommand(req, res) {
  try {
    const p = readCommandPayload(req);
    const command = p.command === "rehug" ? "rehug" : "hug";
    const actor = makeActor(p.actorUserId, p.actorLogin, p.actorDisplay);
    if (!actor.userId || !actor.login || !actor.displayName) return res.json({ ok: false, module: MODULE_NAME, result: await outputResponse(responseText("missingActorData"), { action: "missing_actor_data" }) });
    if (command === "rehug") { if (!p.input0) return res.json({ ok: true, module: MODULE_NAME, result: await outputResponse(`@${actor.displayName}, Nutzung: !rehug @user`, { action: "usage" }) }); return res.json({ ok: true, module: MODULE_NAME, command, input0: p.input0, result: await executeAction("rehug", actor, p.input0) }); }
    if (!p.input0) return res.json({ ok: true, module: MODULE_NAME, result: await outputResponse(`@${actor.displayName}, Nutzung: !hug @user | !hug @all | !hug on | !hug off | !hug stats [user] | !hug top | !hug reload`, { action: "usage" }) });
    if (p.input0 === "top") { const fakeReq = { query: { mode: p.input1 || "given" } }; return await handleTop(fakeReq, { json: result => res.json({ ok: result.ok !== false, module: MODULE_NAME, command, input0: p.input0, input1: p.input1, result }) }); }
    if (p.input0 === "reload") return await handleReload(req, { json: result => res.json({ ok: result.ok !== false, module: MODULE_NAME, command, result }) });
    if (p.input0 === "stats") return res.json({ ok: true, module: MODULE_NAME, command, input0: p.input0, input1: p.input1, result: await handleStatsCore(actor, p.input1) });
    const action = p.input0 === "all" ? "hugall" : (p.input0 === "on" || p.input0 === "off" ? p.input0 : "hug");
    const target = action === "hug" ? p.input0 : "";
    return res.json({ ok: true, module: MODULE_NAME, command, input0: p.input0, input1: p.input1, result: await executeAction(action, actor, target) });
  } catch (err) { console.error("[hug] command failed:", err); return res.status(500).json({ ok: false, module: MODULE_NAME, error: err.message || String(err), result: await outputResponse(responseText("internalError"), { action: "exception" }).catch(() => ({ ok: false })) }); }
}
function setOutputMode(mode) { const cleanMode = normalizeLogin(mode); if (cleanMode !== "central" && cleanMode !== "streamerbot") return { ok: false, error: "invalid_output_mode", allowed: ["streamerbot", "central"] }; const settings = deepMerge(DEFAULT_SETTINGS, getSettingFromDb()); settings.output = deepMerge(DEFAULT_SETTINGS.output, settings.output || {}); settings.output.mode = cleanMode; saveSettings(settings); loadCache(); return { ok: true, mode: cleanMode, output: settings.output }; }
function getTextKindCounts() { return db.all(`SELECT kind, COUNT(*) AS count FROM hug_texts GROUP BY kind ORDER BY kind ASC`).map(row => ({ kind: row.kind, count: Number(row.count || 0) })); }
function getDashboardStatus() { const cfg = getCache(); const totals = db.get(`SELECT COALESCE(SUM(given_total),0) AS given, COALESCE(SUM(received_total),0) AS received, COALESCE(SUM(rehug_given_total),0) AS rehug_given, COALESCE(SUM(rehug_received_total),0) AS rehug_received, COALESCE(SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END),0) AS enabled_users, COALESCE(SUM(CASE WHEN enabled=0 THEN 1 ELSE 0 END),0) AS disabled_users FROM hug_users`) || {}; return { ok: true, module: MODULE_NAME, schemaVersion: SCHEMA_VERSION, source: cfg.source, cacheLoadedAt, database: { adapter: db.getAdapter(), dialect: db.getDialect(), path: db.getDbPath(), mariaDbReady: "core_database_layer_prepared" }, configPath: systemConfigPath, messagesPath, enabled: cfg.enabled, output: cfg.output, topLimit: cfg.topLimit, rehugWindowSeconds: cfg.rehugWindowSeconds, counts: { users: count("hug_users"), enabledUsers: Number(totals.enabled_users || 0), disabledUsers: Number(totals.disabled_users || 0), pairStats: count("hug_pair_stats"), pendingRehugs: count("hug_pending_rehugs"), hugTypes: count("hug_types"), hugTextPairs: count("hug_text_pairs"), activeHugTextPairs: getTextPairs(null, { activeOnly: true }).length, hugAllTexts: cfg.hugAllTexts.length, dbTexts: count("hug_texts"), totalHugsGiven: Number(totals.given || 0), totalHugsReceived: Number(totals.received || 0), totalRehugsGiven: Number(totals.rehug_given || 0), totalRehugsReceived: Number(totals.rehug_received || 0) }, textKinds: getTextKindCounts(), top: { given: topRows("given"), received: topRows("received"), rehug: topRows("rehug") }, recentPairs: recentPairs(), lastImport, lastError }; }
function topRows(mode) { let col = "given_total"; if (mode === "received") col = "received_total"; if (mode === "rehug") col = "rehug_given_total"; return db.all(`SELECT login, display_name, given_total, received_total, rehug_given_total, rehug_received_total, enabled FROM hug_users ORDER BY ${col} DESC, display_name ASC LIMIT :limit`, { limit: Math.max(1, Number(getCache().topLimit || 5)) }).map(r => ({ login: r.login, displayName: r.display_name, givenTotal: Number(r.given_total || 0), receivedTotal: Number(r.received_total || 0), rehugGivenTotal: Number(r.rehug_given_total || 0), rehugReceivedTotal: Number(r.rehug_received_total || 0), enabled: Number(r.enabled) === 1 })); }
function recentPairs() { return db.all(`SELECT p.given_count, p.rehug_count, p.last_hug_at, p.last_rehug_at, fu.display_name AS from_display, tu.display_name AS to_display FROM hug_pair_stats p LEFT JOIN hug_users fu ON fu.user_id=p.from_user_id LEFT JOIN hug_users tu ON tu.user_id=p.to_user_id ORDER BY COALESCE(p.last_rehug_at, p.last_hug_at) DESC LIMIT 10`).map(r => ({ fromDisplayName: r.from_display || "", toDisplayName: r.to_display || "", givenCount: Number(r.given_count || 0), rehugCount: Number(r.rehug_count || 0), lastHugAt: r.last_hug_at || null, lastRehugAt: r.last_rehug_at || null })); }
function getTypes() { return db.all(`SELECT id, name, weight, enabled, sort_order FROM hug_types ORDER BY sort_order ASC, id ASC`).map(r => { const typeId = Number(r.id); return { id: typeId, name: r.name, weight: Number(r.weight || 1), enabled: Number(r.enabled) === 1, sortOrder: Number(r.sort_order || 0), hugTexts: getTexts("hug", typeId).length, rehugTexts: getTexts("rehug", typeId).length, textPairs: getTextPairs(typeId, { activeOnly: false }).length, activeTextPairs: getTextPairs(typeId, { activeOnly: true }).length }; }); }


function safeFileCheck(name, filePath, required = false) {
  const check = { name, ok: true, level: "ok", path: filePath || "", exists: false, required: !!required, error: "" };
  try {
    check.exists = !!filePath && fs.existsSync(filePath);
    if (required && !check.exists) {
      check.ok = false;
      check.level = "error";
      check.error = "missing_required_file";
    }
  } catch (err) {
    check.ok = false;
    check.level = required ? "error" : "warning";
    check.error = err.message || String(err);
  }
  return check;
}

function safeTableCount(tableName, required = true) {
  try {
    return { name: tableName, ok: true, level: "ok", count: count(tableName), required: !!required, error: "" };
  } catch (err) {
    return { name: tableName, ok: !required, level: required ? "error" : "warning", count: 0, required: !!required, error: err.message || String(err) };
  }
}

function getHugRouteList() {
  return [
    { method: "GET", path: "/api/hug/status", purpose: "dashboard/runtime status" },
    { method: "GET", path: "/api/hug/config", purpose: "sanitized config and seed-file summary" },
    { method: "GET", path: "/api/hug/settings", purpose: "runtime settings and cache summary" },
    { method: "GET", path: "/api/hug/routes", purpose: "list hug API routes" },
    { method: "GET", path: "/api/hug/integration-check", purpose: "run non-destructive integration check" },
    { method: "POST", path: "/api/hug/reload", purpose: "safe cache reload without chat output" },
    { method: "GET", path: "/api/hug/reload", purpose: "legacy command reload with existing chat output" },
    { method: "POST", path: "/api/hug/action", purpose: "execute hug/rehug action" },
    { method: "POST", path: "/api/hug/stats", purpose: "return stats for request body" },
    { method: "GET", path: "/api/hug/cmd", purpose: "Streamer.bot compatible command endpoint" },
    { method: "GET", path: "/api/hug/statscmd", purpose: "Streamer.bot compatible stats command" },
    { method: "GET", path: "/api/hug/top", purpose: "return hug top list" },
    { method: "GET/POST", path: "/api/hug/command", purpose: "unified command endpoint" },
    { method: "GET", path: "/api/hug/db/status", purpose: "legacy db status alias" },
    { method: "GET", path: "/api/dashboard/community/hug/status", purpose: "dashboard status alias" },
    { method: "GET", path: "/api/hug/text-store/status", purpose: "text store status alias" },
    { method: "POST", path: "/api/hug/text-store/reload", purpose: "legacy JSON seed import/reload" },
    { method: "GET", path: "/api/hug/db/output-mode", purpose: "read output mode" },
    { method: "POST", path: "/api/hug/db/output-mode", purpose: "write output mode" },
    { method: "GET", path: "/api/hug/types", purpose: "list hug types" },
    { method: "GET", path: "/api/hug/texts", purpose: "list hug texts by kind/type" },
    { method: "GET/POST", path: "/api/hug/admin/text-pairs", purpose: "admin text-pair editor" },
    { method: "GET/POST", path: "/api/dashboard/community/hug/text-pairs", purpose: "dashboard text-pair editor alias" },
    { method: "GET/POST", path: "/api/hug/admin/hug-all-texts", purpose: "admin chatwide hug text editor" },
    { method: "GET/POST", path: "/api/dashboard/community/hug/hug-all-texts", purpose: "dashboard chatwide hug text editor alias" },
    { method: "GET/POST", path: "/api/hug/admin/response-texts", purpose: "admin response text editor" },
    { method: "GET/POST", path: "/api/dashboard/community/hug/response-texts", purpose: "dashboard response text editor alias" },
    { method: "GET/POST", path: "/api/hug/admin/top-title-texts", purpose: "admin top title text editor" },
    { method: "GET/POST", path: "/api/dashboard/community/hug/top-title-texts", purpose: "dashboard top title text editor alias" }
  ];
}

function getHugConfigPayload() {
  const cfg = getCache();
  const fileSettings = readJsonIfExists(systemConfigPath, {}) || {};
  const fileMessages = readJsonIfExists(messagesPath, {}) || {};
  return {
    ok: true,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    prefix: "/api/hug",
    source: cfg.source,
    configPath: systemConfigPath,
    messagesPath,
    files: {
      config: safeFileCheck("config_file", systemConfigPath, false),
      messages: safeFileCheck("messages_file", messagesPath, false)
    },
    jsonConfig: {
      version: fileSettings.version ?? null,
      enabled: fileSettings.enabled ?? null,
      rehugWindowSeconds: fileSettings.rehugWindowSeconds ?? null,
      topLimit: fileSettings.topLimit ?? null
    },
    jsonMessages: {
      version: fileMessages.version ?? null,
      hugAllTexts: Array.isArray(fileMessages.hugAllTexts) ? fileMessages.hugAllTexts.length : 0,
      hugTypes: Array.isArray(fileMessages.hugTypes) ? fileMessages.hugTypes.length : 0,
      responseKeys: fileMessages.responses && typeof fileMessages.responses === "object" ? Object.keys(fileMessages.responses).length : 0,
      topTitleKeys: fileMessages.topTitles && typeof fileMessages.topTitles === "object" ? Object.keys(fileMessages.topTitles).length : 0
    },
    database: { adapter: db.getAdapter(), dialect: db.getDialect(), path: db.getDbPath(), mariaDbReady: "core_database_layer_prepared" },
    updatedAt: nowIso()
  };
}

function getHugSettingsPayload() {
  const status = getDashboardStatus();
  return {
    ok: true,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    prefix: "/api/hug",
    source: "database_cache",
    settings: {
      enabled: status.enabled,
      output: status.output,
      topLimit: status.topLimit,
      rehugWindowSeconds: status.rehugWindowSeconds,
      cacheLoadedAt: status.cacheLoadedAt,
      counts: status.counts,
      textKinds: status.textKinds
    },
    updatedAt: nowIso()
  };
}

function getHugRoutesPayload() {
  const routeList = getHugRouteList();
  return {
    ok: true,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    prefix: "/api/hug",
    intentionallyNotRegistered: ["/api/rehug", "/api/hug-system", "/api/hugs"],
    routes: routeList,
    count: routeList.length,
    updatedAt: nowIso()
  };
}

function getHugIntegrationCheckPayload() {
  const checks = [];
  checks.push(safeFileCheck("config_file", systemConfigPath, false));
  checks.push(safeFileCheck("messages_file", messagesPath, false));
  checks.push(safeTableCount("hug_users", true));
  checks.push(safeTableCount("hug_pair_stats", true));
  checks.push(safeTableCount("hug_pending_rehugs", true));
  checks.push(safeTableCount("hug_settings", true));
  checks.push(safeTableCount("hug_types", true));
  checks.push(safeTableCount("hug_texts", true));
  checks.push(safeTableCount("hug_text_pairs", true));
  try {
    const cfg = getCache();
    checks.push({ name: "runtime_cache", ok: true, level: "ok", source: cfg.source, enabled: cfg.enabled, hugTypes: cfg.hugTypes.length, hugAllTexts: cfg.hugAllTexts.length, rehugWindowSeconds: cfg.rehugWindowSeconds });
  } catch (err) {
    checks.push({ name: "runtime_cache", ok: false, level: "error", error: err.message || String(err) });
  }
  try {
    const pairs = getTextPairs(null, { activeOnly: true });
    checks.push({ name: "active_text_pairs", ok: pairs.length > 0, level: pairs.length > 0 ? "ok" : "error", count: pairs.length, required: true, error: pairs.length > 0 ? "" : "no_active_text_pairs" });
  } catch (err) {
    checks.push({ name: "active_text_pairs", ok: false, level: "error", count: 0, required: true, error: err.message || String(err) });
  }
  checks.push({ name: "routes", ok: true, level: "ok", prefix: "/api/hug", count: getHugRouteList().length });
  const errors = checks.filter(check => check.level === "error" || check.ok === false).length;
  const warnings = checks.filter(check => check.level === "warning").length;
  return {
    ok: errors === 0,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    prefix: "/api/hug",
    checks,
    summary: { total: checks.length, ok: checks.length - errors - warnings, warnings, errors },
    notes: [
      "This integration check is non-destructive.",
      "Productive prefix remains /api/hug.",
      "Hug/Rehug text pairs remain coupled: hug_text and rehug_text stay in the same pair row."
    ],
    updatedAt: nowIso()
  };
}

function handleDiagnosticReload(req, res) {
  try {
    cache = null;
    loadCache();
    return res.json({
      ok: true,
      module: MODULE_NAME,
      schemaVersion: SCHEMA_VERSION,
      action: "reload",
      reloaded: true,
      destructive: false,
      chatOutputTriggered: false,
      cachePreserved: true,
      textPairsPreserved: true,
      statsPreserved: true,
      status: getDashboardStatus(),
      updatedAt: nowIso()
    });
  } catch (err) {
    console.error("[hug] diagnostic reload failed:", err);
    return res.status(500).json({ ok: false, module: MODULE_NAME, action: "reload", error: err.message || String(err) });
  }
}

function init(ctx) {
  appRef = ctx.app;
  db.init(ctx);
  systemConfigPath = config.resolveFromConfig("hug_system.json");
  messagesPath = config.resolveFromConfig("messages", "hug.json");
  ensureSchema(ctx);
  ensureHugTextPairSchema();
  importJsonIfEmpty({ force: false });
  migrateTextPairsFromLegacyTexts();
  cleanupExpiredPendingGlobal();
  loadCache();

  routes.registerPost(appRef, ["/hug/action", "/api/hug/action"], handleAction);
  routes.registerPost(appRef, ["/hug/stats", "/api/hug/stats"], handleStats);
  routes.registerGet(appRef, ["/hug/cmd", "/api/hug/cmd"], handleCmd);
  routes.registerGet(appRef, ["/hug/statscmd", "/api/hug/statscmd"], handleStatsCmd);
  routes.registerGet(appRef, ["/hug/top", "/api/hug/top"], handleTop);
  routes.registerGet(appRef, ["/hug/reload", "/api/hug/reload"], handleReload);
  routes.registerPost(appRef, ["/api/hug/command"], handleCommand);
  routes.registerGet(appRef, ["/api/hug/command"], handleCommand);
  routes.registerGet(appRef, ["/api/hug/status", "/api/hug/db/status", "/api/dashboard/community/hug/status"], (req, res) => res.json(getDashboardStatus()));
  routes.registerGet(appRef, ["/api/hug/config"], (req, res) => res.json(getHugConfigPayload()));
  routes.registerGet(appRef, ["/api/hug/settings"], (req, res) => res.json(getHugSettingsPayload()));
  routes.registerGet(appRef, ["/api/hug/routes"], (req, res) => res.json(getHugRoutesPayload()));
  routes.registerGet(appRef, ["/api/hug/integration-check"], (req, res) => res.status(getHugIntegrationCheckPayload().ok ? 200 : 500).json(getHugIntegrationCheckPayload()));
  routes.registerPost(appRef, ["/api/hug/reload"], handleDiagnosticReload);
  routes.registerGet(appRef, ["/api/hug/text-store/status", "/api/dashboard/community/hug/text-store/status"], (req, res) => res.json(getDashboardStatus()));
  routes.registerPost(appRef, ["/api/hug/text-store/reload"], (req, res) => { const result = importJsonIfEmpty({ force: false }); cache = null; loadCache(); res.json({ ok: true, result, status: getDashboardStatus() }); });
  routes.registerGet(appRef, ["/api/hug/db/output-mode"], (req, res) => res.json({ ok: true, mode: getCache().output.mode, output: getCache().output }));
  routes.registerPost(appRef, ["/api/hug/db/output-mode"], (req, res) => { const result = setOutputMode(req.body?.mode); if (!result.ok) return res.status(400).json(result); res.json({ ok: true, mode: result.mode, output: result.output }); });
  routes.registerGet(appRef, ["/api/hug/types"], (req, res) => res.json({ ok: true, types: getTypes() }));
  routes.registerGet(appRef, ["/api/hug/texts"], (req, res) => res.json({ ok: true, texts: getTexts(clean(core.getParam(req, "kind", "")), core.getParam(req, "typeId", "") || null, null) }));
  routes.registerGet(appRef, ["/api/hug/admin/text-pairs", "/api/dashboard/community/hug/text-pairs"], (req, res) => res.json(getTextPairEditorPayload()));
  routes.registerPost(appRef, ["/api/hug/admin/text-pairs", "/api/dashboard/community/hug/text-pairs"], (req, res) => { try { res.json(handleTextPairsPayload(req.body)); } catch (err) { res.status(400).json({ ok: false, error: err.message || String(err) }); } });
  routes.registerGet(appRef, ["/api/hug/admin/hug-all-texts", "/api/dashboard/community/hug/hug-all-texts"], (req, res) => res.json(getHugAllTextEditorPayload()));
  routes.registerPost(appRef, ["/api/hug/admin/hug-all-texts", "/api/dashboard/community/hug/hug-all-texts"], (req, res) => { try { res.json(handleHugAllTextPayload(req.body)); } catch (err) { res.status(400).json({ ok: false, error: err.message || String(err) }); } });
  routes.registerGet(appRef, ["/api/hug/admin/response-texts", "/api/dashboard/community/hug/response-texts"], (req, res) => res.json(getResponseTextEditorPayload()));
  routes.registerPost(appRef, ["/api/hug/admin/response-texts", "/api/dashboard/community/hug/response-texts"], (req, res) => { try { res.json(handleResponseTextPayload(req.body)); } catch (err) { res.status(400).json({ ok: false, error: err.message || String(err) }); } });
  routes.registerGet(appRef, ["/api/hug/admin/top-title-texts", "/api/dashboard/community/hug/top-title-texts"], (req, res) => res.json(getTopTitleTextEditorPayload()));
  routes.registerPost(appRef, ["/api/hug/admin/top-title-texts", "/api/dashboard/community/hug/top-title-texts"], (req, res) => { try { res.json(handleTopTitleTextPayload(req.body)); } catch (err) { res.status(400).json({ ok: false, error: err.message || String(err) }); } });

  return { name: MODULE_NAME, step: "181.1" };
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, loadCache, getDashboardStatus, setOutputMode, getTextPairEditorPayload, getHugAllTextEditorPayload, getResponseTextEditorPayload, getTopTitleTextEditorPayload };
