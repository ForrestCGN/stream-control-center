"use strict";

/**
 * STEP199.1 - TTS standard admin/API routes.
 *
 * Adds read-only dashboard friendly routes for the existing TTS system without
 * changing playback, queue handling or command behaviour in tts_system.js.
 */

const fs = require("fs");
const path = require("path");

const database = require("../core/database");
const paths = require("../core/paths");
const settingsHelper = require("./helpers/helper_settings");

const MODULE_NAME = "tts_admin_api";
const VERSION = "0.1.0";
const TTS_SETTINGS_TABLE = "tts_settings";

const ROOT_DIR = paths.ROOT_DIR;
const CONFIG_FILE = path.join(ROOT_DIR, "config", "tts_config.json");

const ROUTES = [
  { method: "GET", path: "/api/tts/config", description: "Sanitized effective TTS configuration for dashboard/status use" },
  { method: "GET", path: "/api/tts/voices", description: "Configured TTS voices without secret values" },
  { method: "GET", path: "/api/tts/routes", description: "Known TTS routes and STEP199 route metadata" },
  { method: "GET", path: "/api/tts/admin/settings", description: "List DB-backed TTS settings" },
  { method: "POST", path: "/api/tts/admin/settings", description: "Upsert one DB-backed TTS setting" }
];

const EXISTING_TTS_ROUTES = [
  "GET/POST /api/tts/run",
  "GET/POST /api/tts/say",
  "GET/POST /api/tts/done",
  "GET /api/tts/status",
  "GET /api/tts/overlay-state",
  "GET/POST /api/tts/on",
  "GET/POST /api/tts/off",
  "GET/POST /api/tts/stop",
  "GET/POST /api/tts/clear",
  "GET/POST /api/tts/reload",
  "GET/POST /api/tts/command",
  "GET /api/tts/settings",
  "GET/POST /api/tts/settings/upsert",
  "GET /api/tts/events",
  "GET /api/tts/stats",
  "GET/POST /api/tts/prepare-alert",
  "GET/POST /api/tts/synthesize"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== "object") return base;
  for (const [key, value] of Object.entries(incoming)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      base[key] = deepMerge(base[key] && typeof base[key] === "object" ? base[key] : {}, value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function readJson(file, fallback = {}) {
  try {
    if (!fs.existsSync(file)) return clone(fallback);
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : clone(fallback);
  } catch (err) {
    return clone(fallback);
  }
}

function ensureDbReady(ctx = {}) {
  try {
    database.ensureReady(ctx);
    settingsHelper.ensureSettingsTable(TTS_SETTINGS_TABLE);
    return true;
  } catch (err) {
    return false;
  }
}

function listDbSettings(ctx = {}) {
  if (!ensureDbReady(ctx)) return { ok: false, rows: [], map: {}, error: "database_not_ready" };
  try {
    const result = settingsHelper.listSettings(TTS_SETTINGS_TABLE, { limit: 1000 });
    const map = {};
    for (const row of result.rows || []) map[row.key] = row.value;
    return { ok: true, rows: result.rows || [], map, error: "" };
  } catch (err) {
    return { ok: false, rows: [], map: {}, error: err.message || String(err) };
  }
}

function buildEffectiveConfig(ctx = {}) {
  const fallbackConfig = readJson(CONFIG_FILE, {});
  const dbSettings = listDbSettings(ctx);
  const effective = deepMerge(clone(fallbackConfig), dbSettings.map || {});

  return {
    config: sanitizeConfig(effective),
    sources: {
      json: {
        path: CONFIG_FILE,
        exists: fs.existsSync(CONFIG_FILE)
      },
      database: {
        table: TTS_SETTINGS_TABLE,
        ok: dbSettings.ok,
        count: dbSettings.rows.length,
        error: dbSettings.error || ""
      },
      rule: "database_over_json_fallback"
    }
  };
}

function sanitizeConfig(input) {
  const cfg = clone(input || {});
  if (cfg.voices && typeof cfg.voices === "object") {
    cfg.voices = sanitizeVoices(cfg.voices);
  }
  if (cfg.system && typeof cfg.system === "object") {
    if (Object.prototype.hasOwnProperty.call(cfg.system, "key")) {
      cfg.system.keyConfigured = String(cfg.system.key || "").length > 0;
      delete cfg.system.key;
    }
  }
  return cfg;
}

function sanitizeVoices(voices) {
  const result = {};
  for (const [voiceId, voice] of Object.entries(voices || {})) {
    const clean = clone(voice || {});
    for (const secretKey of ["key", "apiKey", "token", "secret", "credentials", "password"]) {
      if (Object.prototype.hasOwnProperty.call(clean, secretKey)) {
        clean[`${secretKey}Configured`] = String(clean[secretKey] || "").length > 0;
        delete clean[secretKey];
      }
    }
    if (Object.prototype.hasOwnProperty.call(clean, "keyFile")) {
      const keyFile = String(clean.keyFile || "");
      clean.keyFileConfigured = keyFile.length > 0;
      clean.keyFileExists = keyFile.length > 0 && fs.existsSync(keyFile);
      delete clean.keyFile;
    }
    result[voiceId] = clean;
  }
  return result;
}

function getBodyOrQuery(req) {
  return Object.assign({}, req.query || {}, req.body || {});
}

function normalizeSettingPayload(req) {
  const data = getBodyOrQuery(req);
  const key = String(data.key || data.settingKey || "").trim();
  if (!key) throw new Error("setting_key_required");

  let value = data.value;
  if (typeof value === "undefined" && typeof data.settingValue !== "undefined") value = data.settingValue;
  if (typeof value === "undefined" && typeof data.rawValue !== "undefined") value = data.rawValue;

  const valueType = String(data.valueType || data.type || "").trim();
  const description = String(data.description || "");

  if ((valueType === "json" || (!valueType && typeof value === "string")) && typeof value === "string") {
    const trimmed = value.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      value = JSON.parse(trimmed);
    }
  }

  return { key, value, valueType, description };
}

function init(ctx) {
  const { app } = ctx;
  ensureDbReady(ctx);

  app.get("/api/tts/config", (req, res) => {
    const effective = buildEffectiveConfig(ctx);
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      ttsModule: "tts_system",
      config: effective.config,
      sources: effective.sources
    });
  });

  app.get("/api/tts/voices", (req, res) => {
    const effective = buildEffectiveConfig(ctx);
    const voices = effective.config.voices && typeof effective.config.voices === "object" ? effective.config.voices : {};
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      count: Object.keys(voices).length,
      defaultVoice: effective.config.defaultVoice || "",
      fallbackVoice: effective.config.fallbackVoice || "",
      voices,
      sources: effective.sources
    });
  });

  app.get("/api/tts/routes", (req, res) => {
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      addedByStep: "STEP199.1",
      standardRoutes: ROUTES,
      knownExistingTtsRoutes: EXISTING_TTS_ROUTES,
      notes: [
        "tts_admin_api adds dashboard/status routes only.",
        "Existing playback, queue and command routes remain in tts_system.js."
      ]
    });
  });

  app.get("/api/tts/admin/settings", (req, res) => {
    const dbSettings = listDbSettings(ctx);
    res.json({
      ok: dbSettings.ok,
      module: MODULE_NAME,
      version: VERSION,
      table: TTS_SETTINGS_TABLE,
      count: dbSettings.rows.length,
      rows: dbSettings.rows,
      error: dbSettings.error || ""
    });
  });

  app.post("/api/tts/admin/settings", (req, res) => {
    try {
      ensureDbReady(ctx);
      const payload = normalizeSettingPayload(req);
      const row = settingsHelper.setSetting(TTS_SETTINGS_TABLE, payload.key, payload.value, {
        valueType: payload.valueType || undefined,
        description: payload.description
      });
      res.json({
        ok: true,
        module: MODULE_NAME,
        version: VERSION,
        table: TTS_SETTINGS_TABLE,
        setting: row
      });
    } catch (err) {
      res.status(400).json({
        ok: false,
        module: MODULE_NAME,
        version: VERSION,
        error: err.message || String(err)
      });
    }
  });

  console.log(`[module] ${MODULE_NAME} ${VERSION} routes ready`);
}

module.exports = { init };
