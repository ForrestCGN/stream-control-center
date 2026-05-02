"use strict";

const fs = require("fs");
const path = require("path");
const sqlite = require("./sqlite_core");
const twitch = require("./twitch");
const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");

const MODULE_NAME = "hug_system";
const SCHEMA_VERSION = 1;

let appRef = null;
let hugTypesConfig = null;
let systemConfig = null;
let systemConfigPath = null;
let messagesPath = null;
let legacyTypesPath = null;

const DEFAULT_SYSTEM_CONFIG = {
  version: 1,
  enabled: true,
  rehugWindowSeconds: 300,
  topLimit: 5
};

const DEFAULT_MESSAGES = {
  version: 1,
  hugAllTexts: [
    "{from} verteilt einfach mal eine große Umarmung an den ganzen Chat 🤗"
  ],
  hugTypes: [
    {
      id: 1,
      name: "Standard",
      weight: 1,
      hugTexts: ["{from} zieht {to} in eine richtig herzliche Umarmung 🤗"],
      rehugTexts: ["{from} erwidert die herzliche Umarmung von {to} direkt mit genauso viel Wärme 💜"]
    }
  ],
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
    reloadOk: "Hug-System V2 wurde neu geladen.",
    reloadFailed: "Hug-System V2 konnte nicht neu geladen werden.",
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

function nowIso() {
  return core.nowIso();
}

function nowMs() {
  return Date.now();
}

function ensureDir(dirPath) {
  return core.ensureDir(dirPath);
}

function readJsonIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function deepMerge(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...(base || {}) };
  if (!override || typeof override !== "object") return out;

  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      out[key] = value.slice();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }

  return out;
}

function loadHugTypes() {
  const loadedSystemConfig = readJsonIfExists(systemConfigPath) || {};
  const legacyConfig = readJsonIfExists(legacyTypesPath) || null;
  const loadedMessages = readJsonIfExists(messagesPath) || legacyConfig || {};

  systemConfig = deepMerge(DEFAULT_SYSTEM_CONFIG, loadedSystemConfig);
  const messageConfig = deepMerge(DEFAULT_MESSAGES, loadedMessages);

  if (!messageConfig || !Array.isArray(messageConfig.hugTypes) || messageConfig.hugTypes.length === 0) {
    throw new Error("config/messages/hug.json invalid or empty");
  }

  if (!Array.isArray(messageConfig.hugAllTexts) || messageConfig.hugAllTexts.length === 0) {
    throw new Error("config/messages/hug.json missing hugAllTexts");
  }

  hugTypesConfig = {
    ...messageConfig,
    rehugWindowSeconds: Number(systemConfig.rehugWindowSeconds || 300),
    topLimit: Math.max(1, Number(systemConfig.topLimit || 5)),
    enabled: systemConfig.enabled !== false
  };

  console.log(
    `[hug_system] loaded: hugTypes=${messageConfig.hugTypes.length} | hugAllTexts=${messageConfig.hugAllTexts.length} | config=${systemConfigPath} | messages=${messagesPath}`
  );
}

function normalizeLogin(input) {
  if (!input) return "";
  let v = String(input).trim();
  if (v.startsWith("@")) v = v.slice(1);
  return v.toLowerCase();
}

async function resolveUserByLogin(login) {
  const normalized = normalizeLogin(login);
  if (!normalized) return null;

  return await twitch.resolveUserByLogin(normalized);
}

function pickWeightedHugType() {
  const types = hugTypesConfig.hugTypes;
  const totalWeight = types.reduce((sum, t) => sum + Math.max(1, Number(t.weight || 1)), 0);
  let roll = Math.random() * totalWeight;

  for (const type of types) {
    roll -= Math.max(1, Number(type.weight || 1));
    if (roll <= 0) return type;
  }

  return types[0];
}

function getTypeById(typeId) {
  return hugTypesConfig.hugTypes.find(t => Number(t.id) === Number(typeId)) || null;
}

function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTemplate(text, fromDisplay, toDisplay) {
  let result = String(text || "").replaceAll("{from}", fromDisplay);
  if (typeof toDisplay === "string") {
    result = result.replaceAll("{to}", toDisplay);
  }
  return result;
}

function renderTemplate(text, context = {}) {
  let result = String(text || "");
  for (const [key, value] of Object.entries(context || {})) {
    result = result.replaceAll(`{${key}}`, value === undefined || value === null ? "" : String(value));
  }
  return result;
}

function responseText(key, context = {}, fallback = "") {
  const responses = (hugTypesConfig && hugTypesConfig.responses) || DEFAULT_MESSAGES.responses;
  const template = responses[key] || fallback || DEFAULT_MESSAGES.responses[key] || "";
  return renderTemplate(template, context);
}

function getRehugWindowMinutes() {
  const seconds = Number((hugTypesConfig && hugTypesConfig.rehugWindowSeconds) || 300);
  return Math.max(1, Math.round(seconds / 60));
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
  const existingByLogin = sqlite.get(
    `SELECT user_id, login, display_name FROM hug_users WHERE login = :login`,
    { login: user.login }
  );

  if (existingByLogin && String(existingByLogin.user_id) !== String(user.userId)) {
    throw createUserIdentityMismatchError(existingByLogin, user);
  }

  sqlite.run(
    `
    INSERT INTO hug_users (
      user_id, login, display_name, enabled,
      given_total, received_total, rehug_given_total, rehug_received_total,
      created_at, updated_at
    )
    VALUES (
      :userId, :login, :displayName, 1,
      0, 0, 0, 0,
      :now, :now
    )
    ON CONFLICT(user_id) DO UPDATE SET
      login = excluded.login,
      display_name = excluded.display_name,
      updated_at = excluded.updated_at
    `,
    {
      userId: user.userId,
      login: user.login,
      displayName: user.displayName,
      now: nowIso()
    }
  );
}

function ensurePairRow(fromUserId, toUserId) {
  sqlite.run(
    `
    INSERT INTO hug_pair_stats (
      from_user_id, to_user_id,
      given_count, rehug_count,
      last_hug_at, last_rehug_at
    )
    VALUES (
      :fromUserId, :toUserId,
      0, 0,
      NULL, NULL
    )
    ON CONFLICT(from_user_id, to_user_id) DO NOTHING
    `,
    {
      fromUserId,
      toUserId
    }
  );
}

function cleanupExpiredPendingForTarget(targetUserId) {
  sqlite.run(
    `
    DELETE FROM hug_pending_rehugs
    WHERE target_user_id = :targetUserId
      AND expires_at < :now
    `,
    {
      targetUserId,
      now: nowIso()
    }
  );
}

function cleanupExpiredPendingGlobal() {
  const result = sqlite.run(
    `
    DELETE FROM hug_pending_rehugs
    WHERE expires_at < :now
    `,
    { now: nowIso() }
  );

  if (result.changes > 0) {
    console.log(`[hug_system] cleaned ${result.changes} expired pending rehugs`);
  }
}

function getUserEnabled(userId) {
  const row = sqlite.get(
    `SELECT enabled FROM hug_users WHERE user_id = :userId`,
    { userId }
  );
  return row ? Number(row.enabled) === 1 : true;
}

function getStatsByUserId(userId) {
  return sqlite.get(
    `
    SELECT
      user_id,
      login,
      display_name,
      enabled,
      given_total,
      received_total,
      rehug_given_total,
      rehug_received_total
    FROM hug_users
    WHERE user_id = :userId
    `,
    { userId }
  );
}

function buildStatsMessage(requesterDisplay, statsRow) {
  return responseText("stats", {
    actor: requesterDisplay,
    targetDisplay: statsRow.display_name,
    givenTotal: statsRow.given_total,
    receivedTotal: statsRow.received_total,
    rehugGivenTotal: statsRow.rehug_given_total,
    rehugReceivedTotal: statsRow.rehug_received_total
  });
}

const doHugTx = sqlite.transaction((actor, target, type) => {
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + (Number(hugTypesConfig.rehugWindowSeconds || 300) * 1000)).toISOString();

  ensureHugUser(actor);
  ensureHugUser(target);

  ensurePairRow(actor.userId, target.userId);

  sqlite.run(
    `
    UPDATE hug_users
    SET given_total = given_total + 1,
        updated_at = :now
    WHERE user_id = :userId
    `,
    { userId: actor.userId, now: createdAt }
  );

  sqlite.run(
    `
    UPDATE hug_users
    SET received_total = received_total + 1,
        updated_at = :now
    WHERE user_id = :userId
    `,
    { userId: target.userId, now: createdAt }
  );

  sqlite.run(
    `
    UPDATE hug_pair_stats
    SET given_count = given_count + 1,
        last_hug_at = :now
    WHERE from_user_id = :fromUserId
      AND to_user_id = :toUserId
    `,
    {
      fromUserId: actor.userId,
      toUserId: target.userId,
      now: createdAt
    }
  );

  // Pro Actor/Ziel-Paar darf immer nur ein offener Rehug existieren.
  // Sonst kann ein späteres !rehug einen älteren offenen Hug verwenden und dadurch
  // eine unpassende Rehug-Meldung ausgeben.
  sqlite.run(
    `
    DELETE FROM hug_pending_rehugs
    WHERE target_user_id = :targetUserId
      AND from_user_id = :fromUserId
    `,
    {
      targetUserId: target.userId,
      fromUserId: actor.userId
    }
  );

  sqlite.run(
    `
    INSERT INTO hug_pending_rehugs (
      target_user_id, from_user_id, type_id, created_at, expires_at
    )
    VALUES (
      :targetUserId, :fromUserId, :typeId, :createdAt, :expiresAt
    )
    `,
    {
      targetUserId: target.userId,
      fromUserId: actor.userId,
      typeId: Number(type.id),
      createdAt,
      expiresAt
    }
  );
});

const doRehugTx = sqlite.transaction((actor, target, pendingRow) => {
  const now = nowIso();

  ensureHugUser(actor);
  ensureHugUser(target);
  ensurePairRow(actor.userId, target.userId);

  sqlite.run(
    `
    UPDATE hug_users
    SET given_total = given_total + 1,
        rehug_given_total = rehug_given_total + 1,
        updated_at = :now
    WHERE user_id = :userId
    `,
    { userId: actor.userId, now }
  );

  sqlite.run(
    `
    UPDATE hug_users
    SET received_total = received_total + 1,
        rehug_received_total = rehug_received_total + 1,
        updated_at = :now
    WHERE user_id = :userId
    `,
    { userId: target.userId, now }
  );

  sqlite.run(
    `
    UPDATE hug_pair_stats
    SET given_count = given_count + 1,
        rehug_count = rehug_count + 1,
        last_hug_at = :now,
        last_rehug_at = :now
    WHERE from_user_id = :fromUserId
      AND to_user_id = :toUserId
    `,
    {
      fromUserId: actor.userId,
      toUserId: target.userId,
      now
    }
  );

  sqlite.run(
    `DELETE FROM hug_pending_rehugs WHERE id = :id`,
    { id: pendingRow.id }
  );
});

async function executeAction(action, actorUser, targetLogin) {
  ensureHugUser(actorUser);

  if (action === "on") {
    sqlite.run(
      `
      UPDATE hug_users
      SET enabled = 1,
          updated_at = :now
      WHERE user_id = :userId
      `,
      { userId: actorUser.userId, now: nowIso() }
    );

    return {
      ok: true,
      action: "on",
      chatMessage: responseText("hugsEnabled", { actor: actorUser.displayName })
    };
  }

  if (action === "off") {
    sqlite.run(
      `
      UPDATE hug_users
      SET enabled = 0,
          updated_at = :now
      WHERE user_id = :userId
      `,
      { userId: actorUser.userId, now: nowIso() }
    );

    return {
      ok: true,
      action: "off",
      chatMessage: responseText("hugsDisabled", { actor: actorUser.displayName })
    };
  }

  if (!hugTypesConfig.enabled) {
    return {
      ok: false,
      chatMessage: responseText("systemDisabled", { actor: actorUser.displayName })
    };
  }

  if (action === "hugall") {
    const text = pickRandom(hugTypesConfig.hugAllTexts);
    const msg = formatTemplate(text, actorUser.displayName);
    return {
      ok: true,
      action: "hugall",
      chatMessage: msg
    };
  }

  const targetUser = await resolveUserByLogin(targetLogin);
  if (!targetUser) {
    return {
      ok: false,
      chatMessage: responseText("userNotFound", { actor: actorUser.displayName, target: targetLogin })
    };
  }

  ensureHugUser(targetUser);

  if (actorUser.userId === targetUser.userId) {
    return {
      ok: false,
      chatMessage: action === "rehug"
        ? responseText("selfRehug", { actor: actorUser.displayName })
        : responseText("selfHug", { actor: actorUser.displayName })
    };
  }

  if (!getUserEnabled(targetUser.userId)) {
    return {
      ok: false,
      chatMessage: responseText("targetDisabled", { actor: actorUser.displayName, targetDisplay: targetUser.displayName })
    };
  }

  if (action === "hug") {
    cleanupExpiredPendingForTarget(targetUser.userId);

    const type = pickWeightedHugType();
    doHugTx(actorUser, targetUser, type);

    const msg = formatTemplate(
      pickRandom(type.hugTexts),
      actorUser.displayName,
      targetUser.displayName
    );

    return {
      ok: true,
      action: "hug",
      typeId: Number(type.id),
      chatMessage: msg
    };
  }

  if (action === "rehug") {
    cleanupExpiredPendingForTarget(actorUser.userId);

    const pending = sqlite.get(
      `
      SELECT id, type_id, created_at, expires_at
      FROM hug_pending_rehugs
      WHERE target_user_id = :targetUserId
        AND from_user_id = :fromUserId
      ORDER BY created_at DESC
      LIMIT 1
      `,
      {
        targetUserId: actorUser.userId,
        fromUserId: targetUser.userId
      }
    );

    if (!pending) {
      return {
        ok: false,
        chatMessage: responseText("noPendingRehug", { actor: actorUser.displayName, targetDisplay: targetUser.displayName })
      };
    }

    if (new Date(pending.expires_at).getTime() < nowMs()) {
      sqlite.run(`DELETE FROM hug_pending_rehugs WHERE id = :id`, { id: pending.id });
      return {
        ok: false,
        chatMessage: responseText("rehugExpired", { actor: actorUser.displayName, targetDisplay: targetUser.displayName, minutes: getRehugWindowMinutes() })
      };
    }

    const type = getTypeById(pending.type_id);
    if (!type) {
      sqlite.run(`DELETE FROM hug_pending_rehugs WHERE id = :id`, { id: pending.id });
      return {
        ok: false,
        chatMessage: responseText("missingRehugType", { actor: actorUser.displayName })
      };
    }

    doRehugTx(actorUser, targetUser, pending);

    const msg = formatTemplate(
      pickRandom(type.rehugTexts),
      actorUser.displayName,
      targetUser.displayName
    );

    return {
      ok: true,
      action: "rehug",
      typeId: Number(type.id),
      chatMessage: msg
    };
  }

  return { ok: false, chatMessage: responseText("unknownAction", { action }) };
}

async function handleAction(req, res) {
  try {
    const action = String(req.body.action || "").trim().toLowerCase();
    const actor = req.body.actor || {};
    const targetInput = req.body.target || {};

    if (!action) {
      return res.json({ ok: false, chatMessage: responseText("missingAction") });
    }

    if (!actor.userId || !actor.login || !actor.displayName) {
      return res.json({ ok: false, chatMessage: responseText("missingActorData") });
    }

    const actorUser = {
      userId: String(actor.userId),
      login: normalizeLogin(actor.login),
      displayName: String(actor.displayName).trim()
    };

    const result = await executeAction(action, actorUser, normalizeLogin(targetInput.login || ""));
    return res.json(result);
  } catch (err) {
    console.error("[hug_system] /hug/action failed:", err);
    return res.json({
      ok: false,
      chatMessage: responseText("internalError")
    });
  }
}

async function handleCmd(req, res) {
  try {
    const action = normalizeLogin(core.getParam(req, "action", ""));
    const actorUserId = String(core.getParam(req, "actorUserId", "")).trim();
    const actorLogin = normalizeLogin(core.getParam(req, "actorLogin", ""));
    const actorDisplay = String(core.getParam(req, "actorDisplay", "")).trim();
    const targetLogin = normalizeLogin(core.getParam(req, "targetLogin", ""));

    if (!action) {
      return res.json({ ok: false, chatMessage: responseText("missingAction") });
    }

    if (!actorUserId || !actorLogin || !actorDisplay) {
      return res.json({ ok: false, chatMessage: responseText("missingActorData") });
    }

    const actorUser = {
      userId: actorUserId,
      login: actorLogin,
      displayName: actorDisplay
    };

    const result = await executeAction(action, actorUser, targetLogin);
    return res.json(result);
  } catch (err) {
    console.error("[hug_system] /hug/cmd failed:", err);
    return res.json({
      ok: false,
      chatMessage: responseText("internalError")
    });
  }
}

async function handleStats(req, res) {
  try {
    const requester = req.body.requester || {};
    if (!requester.userId || !requester.login || !requester.displayName) {
      return res.json({ ok: false, chatMessage: responseText("missingRequesterData") });
    }

    const requesterUser = {
      userId: String(requester.userId),
      login: normalizeLogin(requester.login),
      displayName: String(requester.displayName).trim()
    };

    ensureHugUser(requesterUser);

    let targetUserId = requesterUser.userId;

    const targetInput = req.body.target || {};
    const targetLogin = normalizeLogin(targetInput.login);
    if (targetLogin) {
      const resolved = await resolveUserByLogin(targetLogin);
      if (!resolved) {
        return res.json({
          ok: false,
          chatMessage: responseText("userNotFound", { actor: requesterUser.displayName, target: targetLogin })
        });
      }
      ensureHugUser(resolved);
      targetUserId = resolved.userId;
    }

    const stats = getStatsByUserId(targetUserId);
    if (!stats) {
      return res.json({
        ok: false,
        chatMessage: responseText("noStats", { actor: requesterUser.displayName })
      });
    }

    return res.json({
      ok: true,
      chatMessage: buildStatsMessage(requesterUser.displayName, stats)
    });
  } catch (err) {
    console.error("[hug_system] /hug/stats failed:", err);
    return res.json({
      ok: false,
      chatMessage: responseText("internalStatsError")
    });
  }
}

async function handleStatsCmd(req, res) {
  try {
    const requesterUserId = String(core.getParam(req, "requesterUserId", "")).trim();
    const requesterLogin = normalizeLogin(core.getParam(req, "requesterLogin", ""));
    const requesterDisplay = String(core.getParam(req, "requesterDisplay", "")).trim();
    const targetLogin = normalizeLogin(core.getParam(req, "targetLogin", ""));

    if (!requesterUserId || !requesterLogin || !requesterDisplay) {
      return res.json({ ok: false, chatMessage: responseText("missingRequesterData") });
    }

    const requesterUser = {
      userId: requesterUserId,
      login: requesterLogin,
      displayName: requesterDisplay
    };

    ensureHugUser(requesterUser);

    let targetUserId = requesterUser.userId;

    if (targetLogin) {
      const resolved = await resolveUserByLogin(targetLogin);
      if (!resolved) {
        return res.json({
          ok: false,
          chatMessage: responseText("userNotFound", { actor: requesterUser.displayName, target: targetLogin })
        });
      }
      ensureHugUser(resolved);
      targetUserId = resolved.userId;
    }

    const stats = getStatsByUserId(targetUserId);
    if (!stats) {
      return res.json({
        ok: false,
        chatMessage: responseText("noStats", { actor: requesterUser.displayName })
      });
    }

    return res.json({
      ok: true,
      chatMessage: buildStatsMessage(requesterUser.displayName, stats)
    });
  } catch (err) {
    console.error("[hug_system] /hug/statscmd failed:", err);

    if (isUserIdentityMismatch(err)) {
      const display = String(core.getParam(req, "requesterDisplay", "User")).trim() || "User";
      return res.json({
        ok: false,
        chatMessage: responseText("identityMismatch", { actor: display })
      });
    }

    return res.json({
      ok: false,
      chatMessage: responseText("internalStatsError")
    });
  }
}

function handleTop(req, res) {
  try {
    const mode = String(core.getParam(req, "mode", "given")).trim().toLowerCase();

    let orderBy = "given_total";
    let titleKey = "given";

    if (mode === "received") {
      orderBy = "received_total";
      titleKey = "received";
    } else if (mode === "rehug") {
      orderBy = "rehug_given_total";
      titleKey = "rehug";
    }

    const topTitles = (hugTypesConfig && hugTypesConfig.topTitles) || DEFAULT_MESSAGES.topTitles;
    const title = topTitles[titleKey] || DEFAULT_MESSAGES.topTitles[titleKey] || "Top Hugs";
    const limit = Math.max(1, Number((hugTypesConfig && hugTypesConfig.topLimit) || 5));

    const rows = sqlite.all(
      `
      SELECT display_name, given_total, received_total, rehug_given_total
      FROM hug_users
      ORDER BY ${orderBy} DESC, display_name ASC
      LIMIT :limit
      `,
      { limit }
    );

    if (!rows.length) {
      return res.json({
        ok: true,
        chatMessage: responseText("topNoData", { title })
      });
    }

    const parts = rows.map((row, index) => {
      const value =
        mode === "received"
          ? row.received_total
          : mode === "rehug"
            ? row.rehug_given_total
            : row.given_total;

      return `${index + 1}. ${row.display_name} (${value})`;
    });

    return res.json({
      ok: true,
      chatMessage: responseText("topList", { title, items: parts.join(" - ") })
    });
  } catch (err) {
    console.error("[hug_system] /hug/top failed:", err);
    return res.json({
      ok: false,
      chatMessage: responseText("internalTopError")
    });
  }
}

function handleReload(req, res) {
  try {
    loadHugTypes();
    return res.json({
      ok: true,
      chatMessage: responseText("reloadOk")
    });
  } catch (err) {
    console.error("[hug_system] /hug/reload failed:", err);
    return res.json({
      ok: false,
      chatMessage: responseText("reloadFailed")
    });
  }
}

function ensureSchema() {
  sqlite.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
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

        CREATE INDEX IF NOT EXISTS idx_hug_users_display_name
          ON hug_users(display_name);

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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_user_id TEXT NOT NULL,
          from_user_id TEXT NOT NULL,
          type_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_hug_pending_target
          ON hug_pending_rehugs(target_user_id);

        CREATE INDEX IF NOT EXISTS idx_hug_pending_target_from
          ON hug_pending_rehugs(target_user_id, from_user_id);

        CREATE INDEX IF NOT EXISTS idx_hug_pending_expires
          ON hug_pending_rehugs(expires_at);
      `);
    }
  });
}

function init(ctx) {
  appRef = ctx.app;
  systemConfigPath = config.resolveFromConfig("hug_system.json");
  messagesPath = config.resolveFromConfig("messages", "hug.json");
  legacyTypesPath = config.resolveFromRoot("data", "hug", "hug_types.json");

  ensureDir(path.dirname(systemConfigPath));
  ensureDir(path.dirname(messagesPath));

  try {
    sqlite.getDb();
  } catch (_) {
    sqlite.init(ctx);
  }

  ensureSchema();
  loadHugTypes();
  cleanupExpiredPendingGlobal();

  routes.registerPost(appRef, ["/hug/action", "/api/hug/action"], handleAction);
  routes.registerPost(appRef, ["/hug/stats", "/api/hug/stats"], handleStats);
  routes.registerGet(appRef, ["/hug/cmd", "/api/hug/cmd"], handleCmd);
  routes.registerGet(appRef, ["/hug/statscmd", "/api/hug/statscmd"], handleStatsCmd);
  routes.registerGet(appRef, ["/hug/top", "/api/hug/top"], handleTop);
  routes.registerGet(appRef, ["/hug/reload", "/api/hug/reload"], handleReload);

  console.log("[hug_system] routes ready: /hug/* + /api/hug/* aliases");
}

module.exports = {
  init
};
