"use strict";

/**
 * STEP011 - Sicherer Umschalter fuer Hug-Output-Modus.
 *
 * Erlaubte Modi:
 * - streamerbot: Node gibt chatMessage zurueck, Streamer.bot sendet wie bisher.
 * - central: Node sendet direkt ueber helper_chat_output / Heimleitung.
 */

const sqlite = require("./sqlite_core");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const hugApiDb = require("./hug_00_api_db");

const MODULE_NAME = "hug_output_mode";

const DEFAULT_SETTINGS = {
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

function ensureSqlite(ctx) {
  try {
    sqlite.getDb();
  } catch (_) {
    sqlite.init(ctx || {});
  }
}

function ensureTable() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS hug_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function getMainSettings() {
  const row = sqlite.get(`SELECT value_json FROM hug_settings WHERE key='main'`);
  if (!row || !row.value_json) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value_json) };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveMainSettings(settings) {
  const now = nowIso();
  sqlite.run(
    `
    INSERT INTO hug_settings (key, value_json, created_at, updated_at)
    VALUES ('main', :valueJson, :now, :now)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
    `,
    {
      valueJson: JSON.stringify(settings || DEFAULT_SETTINGS),
      now
    }
  );
}

function normalizeMode(input) {
  const mode = String(input || "").trim().toLowerCase();
  if (mode === "central" || mode === "streamerbot") return mode;
  return "";
}

function setOutputMode(mode) {
  const cleanMode = normalizeMode(mode);
  if (!cleanMode) {
    return {
      ok: false,
      error: "invalid_output_mode",
      allowed: ["streamerbot", "central"]
    };
  }

  const settings = getMainSettings();
  settings.output = {
    ...(DEFAULT_SETTINGS.output || {}),
    ...(settings.output || {}),
    mode: cleanMode
  };

  saveMainSettings(settings);

  let reloaded = false;
  let reloadError = "";
  try {
    if (typeof hugApiDb.loadCache === "function") {
      hugApiDb.loadCache();
      reloaded = true;
    }
  } catch (err) {
    reloadError = err.message || String(err);
  }

  return {
    ok: true,
    mode: cleanMode,
    reloaded,
    reloadError,
    settings
  };
}

function init(ctx) {
  const app = ctx.app;
  ensureSqlite(ctx);
  ensureTable();

  routes.registerGet(app, ["/api/hug/db/output-mode"], (req, res) => {
    const settings = getMainSettings();
    res.json({
      ok: true,
      module: MODULE_NAME,
      mode: settings.output?.mode || "streamerbot",
      output: settings.output || DEFAULT_SETTINGS.output
    });
  });

  routes.registerPost(app, ["/api/hug/db/output-mode"], (req, res) => {
    const body = req.body || {};
    const result = setOutputMode(body.mode);
    if (!result.ok) return res.status(400).json(result);
    res.json({
      ok: true,
      module: MODULE_NAME,
      mode: result.mode,
      reloaded: result.reloaded,
      reloadError: result.reloadError,
      output: result.settings.output
    });
  });

  return { name: MODULE_NAME, step: "011" };
}

module.exports = {
  init,
  setOutputMode,
  getMainSettings
};
