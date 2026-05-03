"use strict";

/**
 * STEP010 - DB-backed Hug/Rehug API bridge.
 *
 * Wichtig:
 * - Diese Datei registriert die bestehenden GET-Routen VOR `hug_system.js`.
 * - Bestehende Streamer.bot-Skripte muessen dadurch nicht angepasst werden.
 * - Das alte `hug_system.js` bleibt unveraendert als Altlogik/Fallback im Repo.
 */

const fs = require("fs");
const path = require("path");
const sqlite = require("./sqlite_core");
const twitch = require("./twitch");
const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");
const chatOutput = require("./helpers/helper_chat_output");

const MODULE_NAME = "hug_00_api_db";
const SCHEMA_VERSION = 1;

let appRef = null;
let systemConfigPath = "";
let messagesPath = "";
let cache = null;
let cacheLoadedAt = null;
let lastError = "";

const DEFAULT_SETTINGS = {
  version: 1,
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

const DEFAULT_RESPONSES = {
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
  reloadOk: "Hug-System V2 wurde neu geladen.",
  reloadFailed: "Hug-System V2 konnte nicht neu geladen werden.",
  identityMismatch: "@{actor}, Twitch-ID und Login passen nicht zusammen. Bitte echte Twitch-User-ID verwenden.",
  internalError: "Interner Fehler im Hug-System.",
  internalStatsError: "Interner Fehler bei Hug-Stats.",
  internalTopError: "Interner Fehler bei Hug-Topliste.",
  systemDisabled: "@{actor}, das Hug-System ist aktuell deaktiviert."
};

const DEFAULT_TOP_TITLES = {
  given: "Top Hugs",
  received: "Top erhaltene Hugs",
  rehug: "Top Rehugs"
};

function nowIso() {
  return core.nowIso();
}

function nowMs() {
  return Date.now();
}

function normalizeLogin(input) {
  if (!input) return "";
  let v = String(input).trim();
  if (v.startsWith("@")) v = v.slice(1);
  return v.toLowerCase();
}

function readJsonIfExists(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    lastError = err.message || String(err);
    return null;
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
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = clone(value);
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

function getSettingFromDb() {
  try {
    const row = sqlite.get(`SELECT value_json FROM hug_settings WHERE key='main'`);
    if (!row || !row.value_json) return {};
    return JSON.parse(row.value_json);
  } catch (_) {
    return {};
  }
}

function saveMainSettingIfMissing(settings) {
  try {
    const row = sqlite.get(`SELECT key FROM hug_settings WHERE key='main'`);
    if (row) return;
    const now = nowIso();
    sqlite.run(
      `INSERT INTO hug_settings (key, value_json, created_at, updated_at) VALUES ('main', :valueJson, :now, :now)`,
      { valueJson: JSON.stringify(settings || DEFAULT_SETTINGS), now }
    );
  } catch (_) {}
}

function insertText({ textKey = "", typeId = null, kind, text, sortOrder = 0, weight = 1 }) {
  const cleanText = String(text || "").trim();
  if (!cleanText || !kind) return false;
  const now = nowIso();
  sqlite.run(
    `
    INSERT OR IGNORE INTO hug_texts (text_key, type_id, kind, text, enabled, weight, sort_order, created_at, updated_at)
    VALUES (:textKey, :typeId, :kind, :text, 1, :weight, :sortOrder, :now, :now)
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

function importJsonIfEmpty() {
  if (tableCount("hug_types") > 0 || tableCount("hug_texts") > 0) return { skipped: true, reason: "db_not_empty" };

  const fileSettings = readJsonIfExists(systemConfigPath) || {};
  const settings = deepMerge(DEFAULT_SETTINGS, fileSettings);
  const messages = readJsonIfExists(messagesPath) || {};
  const now = nowIso();

  const tx = sqlite.transaction(() => {
    saveMainSettingIfMissing(settings);

    const hugTypes = Array.isArray(messages.hugTypes) ? messages.hugTypes : [];
    hugTypes.forEach((type, typeIndex) => {
      if (type.id === undefined || type.id === null) return;
      sqlite.run(
        `
        INSERT INTO hug_types (id, name, weight, enabled, sort_order, created_at, updated_at)
        VALUES (:id, :name, :weight, 1, :sortOrder, :now, :now)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, weight=excluded.weight, sort_order=excluded.sort_order, updated_at=excluded.updated_at
        `,
        { id: Number(type.id), name: String(type.name || type.id), weight: Math.max(1, Number(type.weight || 1)), sortOrder: typeIndex, now }
      );
      (Array.isArray(type.hugTexts) ? type.hugTexts : []).forEach((text, index) => insertText({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "hug", text, sortOrder: index, weight: type.weight || 1 }));
      (Array.isArray(type.rehugTexts) ? type.rehugTexts : []).forEach((text, index) => insertText({ textKey: String(type.name || type.id), typeId: Number(type.id), kind: "rehug", text, sortOrder: index, weight: type.weight || 1 }));
    });

    (Array.isArray(messages.hugAllTexts) ? messages.hugAllTexts : []).forEach((text, index) => insertText({ textKey: "hug_all", kind: "hug_all", text, sortOrder: index }));

    Object.entries(messages.responses || {}).forEach(([key, text], index) => insertText({ textKey: key, kind: "response", text, sortOrder: index }));
    Object.entries(messages.topTitles || {}).forEach(([key, text], index) => insertText({ textKey: key, kind: "top_title", text, sortOrder: index }));
  });

  tx();
  return { skipped: false, reason: "initial_import" };
}

function getTexts(kind, typeId = null, textKey = null) {
  const where = ["kind=:kind", "enabled=1"];
  const params = { kind };

  if (typeId !== null && typeId !== undefined) {
    where.push("type_id=:typeId");
    params.typeId = Number(typeId);
  }

  if (textKey !== null && textKey !== undefined) {
    where.push("text_key=:textKey");
    params.textKey = String(textKey);
  }

  return sqlite.all(
    `SELECT text, weight FROM hug_texts WHERE ${where.join(" AND ")} ORDER BY sort_order ASC, id ASC`,
    params
  ).map(row => ({ text: row.text, weight: Math.max(1, Number(row.weight || 1)) }));
}

function pickWeighted(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + Math.max(1, Number(item.weight || 1)), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(1, Number(item.weight || 1));
    if (roll <= 0) return item;
  }
  return items[0];
}

function pickText(items, fallback = "") {
  const item = pickWeighted(items);
  return item ? item.text : fallback;
}

function loadCache() {
  importJsonIfEmpty();

  const dbSettings = getSettingFromDb();
  const fileSettings = readJsonIfExists(systemConfigPath) || {};
  const settings = deepMerge(deepMerge(DEFAULT_SETTINGS, dbSettings), fileSettings);
  saveMainSettingIfMissing(settings);

  const typeRows = sqlite.all(`SELECT id, name, weight FROM hug_types WHERE enabled=1 ORDER BY sort_order ASC, id ASC`);
  const types = typeRows.map(row => ({
    id: Number(row.id),
    name: row.name,
    weight: Math.max(1, Number(row.weight || 1)),
    hugTexts: getTexts("hug", Number(row.id)).map(x => x.text),
    rehugTexts: getTexts("rehug", Number(row.id)).map(x => x.text)
  })).filter(type => type.hugTexts.length > 0 && type.rehugTexts.length > 0);

  const responses = { ...DEFAULT_RESPONSES };
  sqlite.all(`SELECT text_key, text FROM hug_texts WHERE kind='response' AND enabled=1 ORDER BY sort_order ASC, id ASC`).forEach(row => {
    if (row.text_key) responses[row.text_key] = row.text;
  });

  const topTitles = { ...DEFAULT_TOP_TITLES };
  sqlite.all(`SELECT text_key, text FROM hug_texts WHERE kind='top_title' AND enabled=1 ORDER BY sort_order ASC, id ASC`).forEach(row => {
    if (row.text_key) topTitles[row.text_key] = row.text;
  });

  cache = {
    version: 2,
    source: "sqlite",
    enabled: settings.enabled !== false,
    rehugWindowSeconds: Number(settings.rehugWindowSeconds || 300),
    topLimit: Math.max(1, Number(settings.topLimit || 5)),
    output: deepMerge(DEFAULT_SETTINGS.output, settings.output || {}),
    hugTypes: types,
    hugAllTexts: getTexts("hug_all").map(x => x.text),
    responses,
    topTitles
  };

  cacheLoadedAt = nowIso();

  if (cache.hugTypes.length === 0 || cache.hugAllTexts.length === 0) {
    throw new Error("hug_db_texts_empty_or_invalid");
  }

  console.log(`[hug_api_db] loaded from DB: types=${cache.hugTypes.length} | hugAll=${cache.hugAllTexts.length} | mode=${cache.output.mode}`);
  return cache;
}

function getCache() {
  if (!cache) return loadCache();
  return cache;
}

function renderTemplate(text, context = {}) {
  let result = String(text || "");
  for (const [key, value] of Object.entries(context || {})) {
    result = result.replaceAll(`{${key}}`, value === undefined || value === null ? "" : String(value));
  }
  return result;
}

function responseText(key, context = {}, fallback = "") {
  const cfg = getCache();
  const template = cfg.responses[key] || fallback || DEFAULT_RESPONSES[key] || "";
  return renderTemplate(template, context);
}

function getRehugWindowMinutes() {
  return Math.max(1, Math.round(Number(getCache().rehugWindowSeconds || 300) / 60));
}

function getTypeById(typeId) {
  return getCache().hugTypes.find(t => Number(t.id) === Number(typeId)) || null;
}

function pickWeightedHugType() {
  const types = getCache().hugTypes;
  const weighted = types.map(type => ({ ...type, weight: type.weight || 1 }));
  return pickWeighted(weighted) || types[0];
}

async function outputResponse(text, meta = {}) {
  const cfg = getCache();
  const mode = String(cfg.output?.mode || "streamerbot").toLowerCase();

  if (mode === "central") {
    return await chatOutput.sendChatMessage(text, {
      source: "hug_system",
      reason: meta.action || meta.reason || "hug",
      prefer: cfg.output.prefer || "bot",
      fallbackToStreamer: cfg.output.fallbackToStreamer !== false,
      fallbackToStreamerbot: cfg.output.fallbackToStreamerbot !== false
    });
  }

  return { ok: true, send: true, sent: false, via: "streamerbot", chatMessage: text, message: text, streamerbot_send: "1", streamerbot_message: text };
}

function mergeResult(actionResult, outputResult) {
  return {
    ...actionResult,
    ...outputResult,
    action: actionResult.action,
    typeId: actionResult.typeId,
    ok: actionResult.ok !== false && outputResult.ok !== false
  };
}

async function resolveUserByLogin(login) {
  const normalized = normalizeLogin(login);
  if (!normalized) return null;
  return await twitch.resolveUserByLogin(normalized);
}

function createUserIdentityMismatchError(existingUser, incomingUser) {
  const err = new Error("HUG_USER_LOGIN_ID_MISMATCH");
  err.code = "HUG_USER_LOGIN_ID_MISMATCH";
  err.existingUser = existingUser;
  err.incomingUser = incomingUser;
  return err;
}

function isUserIdentityMismatch(err) {
  return err && err.code === "HUG_USER_LOGIN_ID_MISMATCH";
}

function ensureHugUser(user) {
  const existingByLogin = sqlite.get(`SELECT user_id, login, display_name FROM hug_users WHERE login = :login`, { login: user.login });
  if (existingByLogin && String(existingByLogin.user_id) !== String(user.userId)) throw createUserIdentityMismatchError(existingByLogin, user);

  sqlite.run(
    `
    INSERT INTO hug_users (user_id, login, display_name, enabled, given_total, received_total, rehug_given_total, rehug_received_total, created_at, updated_at)
    VALUES (:userId, :login, :displayName, 1, 0, 0, 0, 0, :now, :now)
    ON CONFLICT(user_id) DO UPDATE SET login=excluded.login, display_name=excluded.display_name, updated_at=excluded.updated_at
    `,
    { userId: user.userId, login: user.login, displayName: user.displayName, now: nowIso() }
  );
}

function ensurePairRow(fromUserId, toUserId) {
  sqlite.run(
    `
    INSERT INTO hug_pair_stats (from_user_id, to_user_id, given_count, rehug_count, last_hug_at, last_rehug_at)
    VALUES (:fromUserId, :toUserId, 0, 0, NULL, NULL)
    ON CONFLICT(from_user_id, to_user_id) DO NOTHING
    `,
    { fromUserId, toUserId }
  );
}

function getUserEnabled(userId) {
  const row = sqlite.get(`SELECT enabled FROM hug_users WHERE user_id=:userId`, { userId });
  return row ? Number(row.enabled) === 1 : true;
}

function getStatsByUserId(userId) {
  return sqlite.get(
    `SELECT user_id, login, display_name, enabled, given_total, received_total, rehug_given_total, rehug_received_total FROM hug_users WHERE user_id=:userId`,
    { userId }
  );
}

function cleanupExpiredPendingForTarget(targetUserId) {
  sqlite.run(`DELETE FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND expires_at < :now`, { targetUserId, now: nowIso() });
}

function cleanupExpiredPendingGlobal() {
  sqlite.run(`DELETE FROM hug_pending_rehugs WHERE expires_at < :now`, { now: nowIso() });
}

const doHugTx = sqlite.transaction((actor, target, type) => {
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + (Number(getCache().rehugWindowSeconds || 300) * 1000)).toISOString();

  ensureHugUser(actor);
  ensureHugUser(target);
  ensurePairRow(actor.userId, target.userId);

  sqlite.run(`UPDATE hug_users SET given_total=given_total+1, updated_at=:now WHERE user_id=:userId`, { userId: actor.userId, now: createdAt });
  sqlite.run(`UPDATE hug_users SET received_total=received_total+1, updated_at=:now WHERE user_id=:userId`, { userId: target.userId, now: createdAt });
  sqlite.run(`UPDATE hug_pair_stats SET given_count=given_count+1, last_hug_at=:now WHERE from_user_id=:fromUserId AND to_user_id=:toUserId`, { fromUserId: actor.userId, toUserId: target.userId, now: createdAt });
  sqlite.run(`DELETE FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND from_user_id=:fromUserId`, { targetUserId: target.userId, fromUserId: actor.userId });
  sqlite.run(`INSERT INTO hug_pending_rehugs (target_user_id, from_user_id, type_id, created_at, expires_at) VALUES (:targetUserId, :fromUserId, :typeId, :createdAt, :expiresAt)`, { targetUserId: target.userId, fromUserId: actor.userId, typeId: Number(type.id), createdAt, expiresAt });
});

const doRehugTx = sqlite.transaction((actor, target, pendingRow) => {
  const now = nowIso();
  ensureHugUser(actor);
  ensureHugUser(target);
  ensurePairRow(actor.userId, target.userId);
  sqlite.run(`UPDATE hug_users SET given_total=given_total+1, rehug_given_total=rehug_given_total+1, updated_at=:now WHERE user_id=:userId`, { userId: actor.userId, now });
  sqlite.run(`UPDATE hug_users SET received_total=received_total+1, rehug_received_total=rehug_received_total+1, updated_at=:now WHERE user_id=:userId`, { userId: target.userId, now });
  sqlite.run(`UPDATE hug_pair_stats SET given_count=given_count+1, rehug_count=rehug_count+1, last_hug_at=:now, last_rehug_at=:now WHERE from_user_id=:fromUserId AND to_user_id=:toUserId`, { fromUserId: actor.userId, toUserId: target.userId, now });
  sqlite.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pendingRow.id });
});

async function executeAction(action, actorUser, targetLogin) {
  ensureHugUser(actorUser);

  if (action === "on") {
    sqlite.run(`UPDATE hug_users SET enabled=1, updated_at=:now WHERE user_id=:userId`, { userId: actorUser.userId, now: nowIso() });
    const text = responseText("hugsEnabled", { actor: actorUser.displayName });
    return mergeResult({ ok: true, action: "on" }, await outputResponse(text, { action }));
  }

  if (action === "off") {
    sqlite.run(`UPDATE hug_users SET enabled=0, updated_at=:now WHERE user_id=:userId`, { userId: actorUser.userId, now: nowIso() });
    const text = responseText("hugsDisabled", { actor: actorUser.displayName });
    return mergeResult({ ok: true, action: "off" }, await outputResponse(text, { action }));
  }

  if (!getCache().enabled) {
    const text = responseText("systemDisabled", { actor: actorUser.displayName });
    return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
  }

  if (action === "hugall") {
    const text = pickText(getTexts("hug_all"), "{from} verteilt eine Umarmung an den ganzen Chat 🤗");
    const msg = renderTemplate(text, { from: actorUser.displayName });
    return mergeResult({ ok: true, action: "hugall" }, await outputResponse(msg, { action }));
  }

  const targetUser = await resolveUserByLogin(targetLogin);
  if (!targetUser) {
    const text = responseText("userNotFound", { actor: actorUser.displayName, target: targetLogin });
    return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
  }

  ensureHugUser(targetUser);

  if (actorUser.userId === targetUser.userId) {
    const text = action === "rehug" ? responseText("selfRehug", { actor: actorUser.displayName }) : responseText("selfHug", { actor: actorUser.displayName });
    return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
  }

  if (!getUserEnabled(targetUser.userId)) {
    const text = responseText("targetDisabled", { actor: actorUser.displayName, targetDisplay: targetUser.displayName });
    return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
  }

  if (action === "hug") {
    cleanupExpiredPendingForTarget(targetUser.userId);
    const type = pickWeightedHugType();
    doHugTx(actorUser, targetUser, type);
    const msg = renderTemplate(pickText(getTexts("hug", Number(type.id)), type.hugTexts[0]), { from: actorUser.displayName, to: targetUser.displayName });
    return mergeResult({ ok: true, action: "hug", typeId: Number(type.id) }, await outputResponse(msg, { action }));
  }

  if (action === "rehug") {
    cleanupExpiredPendingForTarget(actorUser.userId);
    const pending = sqlite.get(
      `SELECT id, type_id, created_at, expires_at FROM hug_pending_rehugs WHERE target_user_id=:targetUserId AND from_user_id=:fromUserId ORDER BY created_at DESC LIMIT 1`,
      { targetUserId: actorUser.userId, fromUserId: targetUser.userId }
    );

    if (!pending) {
      const text = responseText("noPendingRehug", { actor: actorUser.displayName, targetDisplay: targetUser.displayName });
      return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
    }

    if (new Date(pending.expires_at).getTime() < nowMs()) {
      sqlite.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pending.id });
      const text = responseText("rehugExpired", { actor: actorUser.displayName, targetDisplay: targetUser.displayName, minutes: getRehugWindowMinutes() });
      return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
    }

    const type = getTypeById(pending.type_id);
    if (!type) {
      sqlite.run(`DELETE FROM hug_pending_rehugs WHERE id=:id`, { id: pending.id });
      const text = responseText("missingRehugType", { actor: actorUser.displayName });
      return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
    }

    doRehugTx(actorUser, targetUser, pending);
    const msg = renderTemplate(pickText(getTexts("rehug", Number(type.id)), type.rehugTexts[0]), { from: actorUser.displayName, to: targetUser.displayName });
    return mergeResult({ ok: true, action: "rehug", typeId: Number(type.id) }, await outputResponse(msg, { action }));
  }

  const text = responseText("unknownAction", { action });
  return mergeResult({ ok: false, action }, await outputResponse(text, { action }));
}

async function handleCmd(req, res) {
  try {
    const action = normalizeLogin(core.getParam(req, "action", ""));
    const actorUserId = String(core.getParam(req, "actorUserId", "")).trim();
    const actorLogin = normalizeLogin(core.getParam(req, "actorLogin", ""));
    const actorDisplay = String(core.getParam(req, "actorDisplay", "")).trim();
    const targetLogin = normalizeLogin(core.getParam(req, "targetLogin", ""));

    if (!action) return res.json({ ok: false, chatMessage: responseText("missingAction") });
    if (!actorUserId || !actorLogin || !actorDisplay) return res.json({ ok: false, chatMessage: responseText("missingActorData") });

    const actorUser = { userId: actorUserId, login: actorLogin, displayName: actorDisplay };
    return res.json(await executeAction(action, actorUser, targetLogin));
  } catch (err) {
    console.error("[hug_api_db] /hug/cmd failed:", err);
    const display = String(core.getParam(req, "actorDisplay", "User")).trim() || "User";
    if (isUserIdentityMismatch(err)) return res.json({ ok: false, chatMessage: responseText("identityMismatch", { actor: display }) });
    return res.json({ ok: false, chatMessage: responseText("internalError") });
  }
}

async function handleStatsCmd(req, res) {
  try {
    const requesterUserId = String(core.getParam(req, "requesterUserId", "")).trim();
    const requesterLogin = normalizeLogin(core.getParam(req, "requesterLogin", ""));
    const requesterDisplay = String(core.getParam(req, "requesterDisplay", "")).trim();
    const targetLogin = normalizeLogin(core.getParam(req, "targetLogin", ""));

    if (!requesterUserId || !requesterLogin || !requesterDisplay) return res.json({ ok: false, chatMessage: responseText("missingRequesterData") });

    const requesterUser = { userId: requesterUserId, login: requesterLogin, displayName: requesterDisplay };
    ensureHugUser(requesterUser);

    let targetUserId = requesterUser.userId;
    if (targetLogin) {
      const resolved = await resolveUserByLogin(targetLogin);
      if (!resolved) {
        const text = responseText("userNotFound", { actor: requesterUser.displayName, target: targetLogin });
        return res.json(mergeResult({ ok: false, action: "stats" }, await outputResponse(text, { action: "stats" })));
      }
      ensureHugUser(resolved);
      targetUserId = resolved.userId;
    }

    const stats = getStatsByUserId(targetUserId);
    if (!stats) {
      const text = responseText("noStats", { actor: requesterUser.displayName });
      return res.json(mergeResult({ ok: false, action: "stats" }, await outputResponse(text, { action: "stats" })));
    }

    const text = responseText("stats", {
      actor: requesterUser.displayName,
      targetDisplay: stats.display_name,
      givenTotal: stats.given_total,
      receivedTotal: stats.received_total,
      rehugGivenTotal: stats.rehug_given_total,
      rehugReceivedTotal: stats.rehug_received_total
    });
    return res.json(mergeResult({ ok: true, action: "stats" }, await outputResponse(text, { action: "stats" })));
  } catch (err) {
    console.error("[hug_api_db] /hug/statscmd failed:", err);
    return res.json({ ok: false, chatMessage: responseText("internalStatsError") });
  }
}

async function handleTop(req, res) {
  try {
    const mode = String(core.getParam(req, "mode", "given")).trim().toLowerCase();
    let orderBy = "given_total";
    let titleKey = "given";
    if (mode === "received") { orderBy = "received_total"; titleKey = "received"; }
    else if (mode === "rehug") { orderBy = "rehug_given_total"; titleKey = "rehug"; }

    const title = getCache().topTitles[titleKey] || DEFAULT_TOP_TITLES[titleKey] || "Top Hugs";
    const limit = Math.max(1, Number(getCache().topLimit || 5));
    const rows = sqlite.all(`SELECT display_name, given_total, received_total, rehug_given_total FROM hug_users ORDER BY ${orderBy} DESC, display_name ASC LIMIT :limit`, { limit });

    if (!rows.length) {
      const text = responseText("topNoData", { title });
      return res.json(mergeResult({ ok: true, action: "top" }, await outputResponse(text, { action: "top" })));
    }

    const parts = rows.map((row, index) => {
      const value = mode === "received" ? row.received_total : mode === "rehug" ? row.rehug_given_total : row.given_total;
      return `${index + 1}. ${row.display_name} (${value})`;
    });
    const text = responseText("topList", { title, items: parts.join(" - ") });
    return res.json(mergeResult({ ok: true, action: "top" }, await outputResponse(text, { action: "top" })));
  } catch (err) {
    console.error("[hug_api_db] /hug/top failed:", err);
    return res.json({ ok: false, chatMessage: responseText("internalTopError") });
  }
}

async function handleReload(req, res) {
  try {
    cache = null;
    loadCache();
    const text = responseText("reloadOk");
    return res.json(mergeResult({ ok: true, action: "reload", reloaded: true }, await outputResponse(text, { action: "reload" })));
  } catch (err) {
    console.error("[hug_api_db] /hug/reload failed:", err);
    const text = responseText("reloadFailed");
    return res.json({ ok: false, chatMessage: text, error: err.message || String(err) });
  }
}

function getStatus() {
  const cfg = getCache();
  return {
    ok: true,
    module: MODULE_NAME,
    schemaVersion: SCHEMA_VERSION,
    source: cfg.source,
    cacheLoadedAt,
    databasePath: sqlite.getDbPath ? sqlite.getDbPath() : null,
    configPath: systemConfigPath,
    messagesPath,
    enabled: cfg.enabled,
    output: cfg.output,
    topLimit: cfg.topLimit,
    rehugWindowSeconds: cfg.rehugWindowSeconds,
    counts: {
      hugTypes: cfg.hugTypes.length,
      hugAllTexts: cfg.hugAllTexts.length,
      hugUsers: tableCount("hug_users"),
      pairStats: tableCount("hug_pair_stats"),
      pendingRehugs: tableCount("hug_pending_rehugs"),
      dbTexts: tableCount("hug_texts")
    },
    lastError
  };
}

function init(ctx) {
  appRef = ctx.app;
  systemConfigPath = config.resolveFromConfig("hug_system.json");
  messagesPath = config.resolveFromConfig("messages", "hug.json");

  ensureSqlite(ctx);
  ensureSchema();
  cleanupExpiredPendingGlobal();
  loadCache();

  routes.registerGet(appRef, ["/hug/cmd", "/api/hug/cmd"], handleCmd);
  routes.registerGet(appRef, ["/hug/statscmd", "/api/hug/statscmd"], handleStatsCmd);
  routes.registerGet(appRef, ["/hug/top", "/api/hug/top"], handleTop);
  routes.registerGet(appRef, ["/hug/reload", "/api/hug/reload"], handleReload);
  routes.registerGet(appRef, ["/api/hug/db/status", "/api/dashboard/community/hug/status"], (req, res) => res.json(getStatus()));

  return { name: MODULE_NAME, step: "010" };
}

module.exports = { init, getStatus, loadCache };
