"use strict";

/**
 * Loyalty Games host module.
 *
 * STEP LWG-4B:
 * - Keeps the existing wheel spin API working.
 * - Adds wheel presets and preset fields in the central database.
 * - Keeps spin logic inside wheel.js.
 * - Adds preset management in presets.js.
 * - Does not add Giveaway logic yet.
 */

const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");
const database = require("../core/database");
const wheelFactory = require("./loyalty_games/wheel");
const presetFactory = require("./loyalty_games/presets");

const MODULE_NAME = "loyalty_games";
const MODULE_VERSION = "0.2.0";
const MODULE_BUILD = "STEP_LWG_4B";
const CONFIG_FILE = "loyalty_games.json";
const SCHEMA_MODULE = "loyalty_games";
const SCHEMA_VERSION = 2;

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "loyalty",
  routesPrefix: ["/api/loyalty/games"],
  bus: {
    publishes: [
      "loyalty.event",
      "loyalty.wheel.preset.created",
      "loyalty.wheel.preset.copied",
      "loyalty.wheel.preset.activated",
      "loyalty.wheel.preset.paused",
      "loyalty.wheel.preset.finished",
      "loyalty.wheel.preset.deleted",
      "loyalty.wheel.spin.started",
      "loyalty.wheel.spin.finished"
    ],
    consumes: []
  },
  legacy: false,
  description: "Loyalty games host module with wheel presets and configurable wheel game"
};

const DEFAULT_CONFIG = {
  enabled: true,
  version: 1,
  games: {
    wheel: {
      enabled: true,
      mode: "shadow",
      cost: {
        enabled: false,
        amount: 0
      },
      spin: {
        defaultDurationMs: 7000,
        minDurationMs: 2500,
        maxDurationMs: 20000,
        minExtraTurns: 5,
        maxExtraTurns: 8,
        oneActiveSpinOnly: true
      },
      overlay: {
        eventType: "loyalty.wheel.spin",
        resetEventType: "loyalty.wheel.reset"
      },
      minVisibleSlots: 12,
      fields: [
        { id: "vip_1_day", label: "VIP", sub: "1 Tag", weight: 1, enabled: true, reward: { type: "none", amount: 0 }, colorA: "#d03cff", colorB: "#18d6ff" },
        { id: "points_1000", label: "1000", sub: "Punkte", weight: 1, enabled: true, reward: { type: "points", amount: 1000 }, colorA: "#18d6ff", colorB: "#d03cff" },
        { id: "bonus_spin_1", label: "Bonus", sub: "Dreh", weight: 1, enabled: true, reward: { type: "bonus_spin", amount: 1 }, colorA: "#d03cff", colorB: "#18d6ff" },
        { id: "coupon_20", label: "20€", sub: "Gutschein", weight: 1, enabled: true, reward: { type: "manual", amount: 0 }, colorA: "#18d6ff", colorB: "#d03cff" },
        { id: "sound_free", label: "Sound", sub: "frei", weight: 1, enabled: true, reward: { type: "manual", amount: 0 }, colorA: "#d03cff", colorB: "#18d6ff" },
        { id: "miss_1", label: "Niete", sub: "", weight: 2, enabled: true, reward: { type: "none", amount: 0 }, colorA: "#7d27b8", colorB: "#124b72" },
        { id: "game_key", label: "Key", sub: "Game", weight: 1, enabled: true, reward: { type: "manual", amount: 0 }, colorA: "#18d6ff", colorB: "#d03cff" },
        { id: "points_500", label: "500", sub: "Punkte", weight: 1, enabled: true, reward: { type: "points", amount: 500 }, colorA: "#d03cff", colorB: "#18d6ff" },
        { id: "bonus_spin_2", label: "Bonus", sub: "Dreh", weight: 1, enabled: true, reward: { type: "bonus_spin", amount: 1 }, colorA: "#18d6ff", colorB: "#d03cff" },
        { id: "free_spin", label: "Free", sub: "Spin", weight: 1, enabled: true, reward: { type: "bonus_spin", amount: 1 }, colorA: "#d03cff", colorB: "#18d6ff" },
        { id: "vip_3_days", label: "VIP", sub: "3 Tage", weight: 1, enabled: true, reward: { type: "none", amount: 0 }, colorA: "#18d6ff", colorB: "#d03cff" },
        { id: "miss_2", label: "Niete", sub: "", weight: 2, enabled: true, reward: { type: "none", amount: 0 }, colorA: "#7d27b8", colorB: "#124b72" }
      ]
    }
  }
};

let state = {
  loadedAt: core.nowIso(),
  configPath: "",
  configOk: false,
  configError: "",
  schemaReady: false,
  lastError: "",
  routeCount: 0,
  eventBusReady: false
};

let config = DEFAULT_CONFIG;
let wheel = null;
let presetStore = null;
let broadcastWS = null;
let eventBus = null;

function databaseStatus() {
  try {
    const status = database.status();
    return {
      ok: !!status.ok,
      adapter: status.adapter,
      dialect: status.dialect,
      path: status.sqlite && status.sqlite.databasePath ? status.sqlite.databasePath : "",
      lastError: status.lastError || ""
    };
  } catch (err) {
    return {
      ok: false,
      adapter: "unknown",
      dialect: "unknown",
      path: "",
      lastError: err && err.message ? err.message : String(err)
    };
  }
}

function loadConfig() {
  const loaded = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, {
    createIfMissing: false,
    mergeDefaults: true,
    spaces: 2
  });

  state.configPath = loaded.path || "";
  state.configOk = !!loaded.ok || !!loaded.exists;
  state.configError = loaded.error || "";
  config = loaded.data || loaded.config || DEFAULT_CONFIG;
  return config;
}

function emitEvent(type, payload = {}) {
  const event = {
    type,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    event: "loyalty.event",
    createdAt: core.nowIso(),
    payload
  };

  let delivered = false;
  try {
    if (eventBus && typeof eventBus.emit === "function") {
      eventBus.emit(type, event);
      delivered = true;
    } else if (eventBus && typeof eventBus.publish === "function") {
      eventBus.publish(type, event);
      delivered = true;
    }
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
  }

  if (typeof broadcastWS === "function") {
    broadcastWS(event);
    delivered = true;
  }

  return delivered;
}

function ensureSchema() {
  database.ensureReady();
  database.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_game_sessions (
        id ${database.primaryKeyAutoIncrementSql()},
        session_uid TEXT NOT NULL UNIQUE,
        game_key TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '',
        duration_ms INTEGER NOT NULL DEFAULT 0,
        selected_field_id TEXT NOT NULL DEFAULT '',
        selected_field_index INTEGER NOT NULL DEFAULT 0,
        selected_field_label TEXT NOT NULL DEFAULT '',
        cost_amount INTEGER NOT NULL DEFAULT 0,
        mode TEXT NOT NULL DEFAULT 'shadow',
        started_at TEXT NOT NULL DEFAULT '',
        finished_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );
    `);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_game ON loyalty_game_sessions(game_key);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_status ON loyalty_game_sessions(status);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_created ON loyalty_game_sessions(created_at);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_user ON loyalty_game_sessions(user_login);`);
  });

  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_game_sessions (
      id ${database.primaryKeyAutoIncrementSql()},
      session_uid TEXT NOT NULL UNIQUE,
      game_key TEXT NOT NULL DEFAULT '',
      user_login TEXT NOT NULL DEFAULT '',
      user_display_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      duration_ms INTEGER NOT NULL DEFAULT 0,
      selected_field_id TEXT NOT NULL DEFAULT '',
      selected_field_index INTEGER NOT NULL DEFAULT 0,
      selected_field_label TEXT NOT NULL DEFAULT '',
      cost_amount INTEGER NOT NULL DEFAULT 0,
      mode TEXT NOT NULL DEFAULT 'shadow',
      started_at TEXT NOT NULL DEFAULT '',
      finished_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_game ON loyalty_game_sessions(game_key);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_status ON loyalty_game_sessions(status);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_created ON loyalty_game_sessions(created_at);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_game_sessions_user ON loyalty_game_sessions(user_login);`);

  if (presetStore && typeof presetStore.ensureSchema === "function") {
    presetStore.ensureSchema();
  }

  state.schemaReady = true;
  return true;
}

function rowToSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionUid: row.session_uid,
    gameKey: row.game_key,
    login: row.user_login,
    displayName: row.user_display_name || row.user_login,
    status: row.status,
    source: row.source || "",
    durationMs: Number(row.duration_ms || 0),
    selectedFieldId: row.selected_field_id || "",
    selectedFieldIndex: Number(row.selected_field_index || 0),
    selectedFieldLabel: row.selected_field_label || "",
    costAmount: Number(row.cost_amount || 0),
    mode: row.mode || "shadow",
    startedAt: row.started_at || "",
    finishedAt: row.finished_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function insertSession(input = {}) {
  ensureSchema();
  const now = core.nowIso();
  const metadata = input.metadata && typeof input.metadata === "object" ? input.metadata : {};
  database.run(`
    INSERT INTO loyalty_game_sessions (
      session_uid, game_key, user_login, user_display_name, status, source,
      duration_ms, selected_field_id, selected_field_index, selected_field_label,
      cost_amount, mode, started_at, finished_at, created_at, updated_at, metadata_json
    ) VALUES (
      :sessionUid, :gameKey, :login, :displayName, :status, :source,
      :durationMs, :selectedFieldId, :selectedFieldIndex, :selectedFieldLabel,
      :costAmount, :mode, :startedAt, :finishedAt, :createdAt, :updatedAt, :metadataJson
    )
  `, {
    sessionUid: input.sessionUid,
    gameKey: input.gameKey || "",
    login: input.login || "",
    displayName: input.displayName || input.login || "",
    status: input.status || "running",
    source: input.source || "",
    durationMs: Number(input.durationMs || 0),
    selectedFieldId: input.selectedFieldId || "",
    selectedFieldIndex: Number(input.selectedFieldIndex || 0),
    selectedFieldLabel: input.selectedFieldLabel || "",
    costAmount: Number(input.costAmount || 0),
    mode: input.mode || "shadow",
    startedAt: input.startedAt || now,
    finishedAt: input.finishedAt || "",
    createdAt: now,
    updatedAt: now,
    metadataJson: JSON.stringify(metadata)
  });

  return getSession(input.sessionUid);
}

function updateSession(sessionUid, patch = {}) {
  ensureSchema();
  const now = core.nowIso();
  const metadata = patch.metadata && typeof patch.metadata === "object" ? patch.metadata : null;
  const existing = getSession(sessionUid);
  if (!existing) return null;

  const nextMetadata = metadata ? { ...(existing.metadata || {}), ...metadata } : (existing.metadata || {});
  database.run(`
    UPDATE loyalty_game_sessions
    SET status = :status,
        finished_at = :finishedAt,
        updated_at = :updatedAt,
        metadata_json = :metadataJson
    WHERE session_uid = :sessionUid
  `, {
    sessionUid,
    status: patch.status || existing.status,
    finishedAt: patch.finishedAt !== undefined ? patch.finishedAt : existing.finishedAt,
    updatedAt: now,
    metadataJson: JSON.stringify(nextMetadata)
  });

  return getSession(sessionUid);
}

function getSession(sessionUid) {
  ensureSchema();
  const uid = String(sessionUid || "").trim();
  if (!uid) return null;
  return rowToSession(database.get("SELECT * FROM loyalty_game_sessions WHERE session_uid = :uid", { uid }));
}

function listSessions(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(200, Number(options.limit || 50) || 50));
  const gameKey = String(options.gameKey || "").trim();
  const where = [];
  const params = { limit };

  if (gameKey) {
    where.push("game_key = :gameKey");
    params.gameKey = gameKey;
  }

  const rows = database.all(`
    SELECT *
    FROM loyalty_game_sessions
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id DESC
    LIMIT :limit
  `, params).map(rowToSession);

  return { ok: true, count: rows.length, rows };
}

function sessionCounts() {
  ensureSchema();
  const total = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_game_sessions")?.count || 0);
  const running = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_game_sessions WHERE status = 'running'")?.count || 0);
  const finished = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_game_sessions WHERE status = 'finished'")?.count || 0);
  const failed = Number(database.get("SELECT COUNT(*) AS count FROM loyalty_game_sessions WHERE status IN ('failed', 'reset')")?.count || 0);
  return { total, running, finished, failed };
}

function broadcast(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (typeof broadcastWS !== "function") return false;
  broadcastWS(payload);
  return true;
}

function publicConfig() {
  return {
    enabled: !!config.enabled,
    version: config.version || 1,
    games: {
      wheel: wheel ? wheel.getPublicConfig() : (config.games && config.games.wheel ? config.games.wheel : {})
    }
  };
}

function buildStatus() {
  const wheelStatus = wheel ? wheel.getStatus() : { ok: false, enabled: false, lastError: "wheel_not_loaded" };
  const counts = state.schemaReady ? sessionCounts() : { total: 0, running: 0, finished: 0, failed: 0 };
  const presetStatus = presetStore && state.schemaReady ? presetStore.status() : { ok: false, presets: 0, fields: 0, spins: 0 };

  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    enabled: !!config.enabled,
    routeCount: state.routeCount,
    loadedAt: state.loadedAt,
    lastError: state.lastError,
    config: {
      path: state.configPath,
      ok: state.configOk,
      error: state.configError
    },
    diagnostics: {
      ok: !state.lastError,
      health: state.lastError ? "error" : "ok",
      module: MODULE_NAME,
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      schemaVersion: SCHEMA_VERSION,
      schemaReady: !!state.schemaReady,
      lastError: state.lastError,
      counts,
      presets: presetStatus,
      database: databaseStatus(),
      eventBus: {
        ready: !!state.eventBusReady,
        mode: state.eventBusReady ? "ctx_event_bus" : "broadcast_only"
      },
      state: {
        gamesLoaded: wheel ? 1 : 0,
        enabled: !!config.enabled
      },
      queue: {
        activeSpin: !!(wheelStatus && wheelStatus.running),
        mode: "one_active_spin_only"
      },
      runtime: {
        loadedAt: state.loadedAt,
        configPath: state.configPath
      },
      warnings: [],
      errors: state.lastError ? [state.lastError] : []
    },
    games: {
      wheel: wheelStatus
    }
  };
}

function registerRoutes(app) {
  const registered = [];

  registered.push(...routes.registerGet(app, "/api/loyalty/games/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, buildStatus());
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/config", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      config: publicConfig()
    });
  })));

  const routeNames = [
    "GET /api/loyalty/games/status",
    "GET /api/loyalty/games/config",
    "GET /api/loyalty/games/routes",
    "GET /api/loyalty/games/sessions",
    "GET /api/loyalty/games/wheel/status",
    "GET /api/loyalty/games/wheel/config",
    "GET /api/loyalty/games/wheel/spin",
    "POST /api/loyalty/games/wheel/spin",
    "POST /api/loyalty/games/wheel/reset",
    "GET /api/loyalty/games/wheel/presets",
    "GET /api/loyalty/games/wheel/presets/:presetUid",
    "POST /api/loyalty/games/wheel/presets",
    "POST /api/loyalty/games/wheel/presets/:presetUid/copy",
    "POST /api/loyalty/games/wheel/presets/:presetUid/activate",
    "POST /api/loyalty/games/wheel/presets/:presetUid/pause",
    "POST /api/loyalty/games/wheel/presets/:presetUid/finish",
    "POST /api/loyalty/games/wheel/presets/:presetUid/delete",
    "GET /api/loyalty/games/wheel/presets/:presetUid/fields",
    "POST /api/loyalty/games/wheel/presets/:presetUid/fields",
    "PUT /api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid",
    "POST /api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid/delete",
    "GET /api/loyalty/games/wheel/spins"
  ];

  registered.push(...routes.registerGet(app, "/api/loyalty/games/routes", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      routes: routeNames
    });
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/sessions", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listSessions({
      limit: req.query.limit,
      gameKey: req.query.gameKey || req.query.game || ""
    }));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, wheel.getStatus());
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/config", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      game: "wheel",
      config: wheel.getPublicConfig()
    });
  })));

  async function handleWheelSpin(req, res) {
    const input = {
      ...(req.query || {}),
      ...(req.body || {})
    };
    const result = wheel.spin(input);
    if (!result.ok) {
      return core.sendFail(res, result.error || "wheel_spin_failed", result.statusCode || 409, result);
    }
    return core.sendOk(res, result);
  }

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/spin", core.asyncRoute(handleWheelSpin)));
  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/spin", core.asyncRoute(handleWheelSpin)));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/reset", core.asyncRoute(async (req, res) => {
    core.sendOk(res, wheel.reset({
      source: req.body?.source || req.query?.source || "api"
    }));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/presets", core.asyncRoute(async (req, res) => {
    core.sendOk(res, presetStore.listPresets(req.query || {}));
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/presets/:presetUid", core.asyncRoute(async (req, res) => {
    const preset = presetStore.getPreset(req.params.presetUid, true);
    if (!preset) return core.sendFail(res, "preset_not_found", 404);
    return core.sendOk(res, { ok: true, preset });
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets", core.asyncRoute(async (req, res) => {
    const body = req.body || {};
    const result = presetStore.createPreset({
      name: body.name,
      description: body.description,
      minVisibleSlots: body.minVisibleSlots,
      status: body.status || "draft",
      presetType: "standalone",
      createdBy: body.createdBy || body.actor || "dashboard",
      fields: Array.isArray(body.fields) ? body.fields : []
    });
    if (!result.ok) return core.sendFail(res, result.error || "preset_create_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/copy", core.asyncRoute(async (req, res) => {
    const result = presetStore.copyPreset(req.params.presetUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_copy_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/activate", core.asyncRoute(async (req, res) => {
    const result = presetStore.setPresetStatus(req.params.presetUid, "active", req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_activate_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/pause", core.asyncRoute(async (req, res) => {
    const result = presetStore.setPresetStatus(req.params.presetUid, "paused", req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_pause_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/finish", core.asyncRoute(async (req, res) => {
    const result = presetStore.setPresetStatus(req.params.presetUid, "finished", req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_finish_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/delete", core.asyncRoute(async (req, res) => {
    const result = presetStore.setPresetStatus(req.params.presetUid, "deleted", req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_delete_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/presets/:presetUid/fields", core.asyncRoute(async (req, res) => {
    core.sendOk(res, presetStore.listFields(req.params.presetUid, req.query || {}));
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/fields", core.asyncRoute(async (req, res) => {
    const result = presetStore.createField(req.params.presetUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "field_create_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPut(app, "/api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid", core.asyncRoute(async (req, res) => {
    const result = presetStore.updateField(req.params.presetUid, req.params.fieldUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "field_update_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid/delete", core.asyncRoute(async (req, res) => {
    const result = presetStore.deleteField(req.params.presetUid, req.params.fieldUid);
    if (!result.ok) return core.sendFail(res, result.error || "field_delete_failed", result.statusCode || 409, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerGet(app, "/api/loyalty/games/wheel/spins", core.asyncRoute(async (req, res) => {
    core.sendOk(res, presetStore.listSpins(req.query || {}));
  })));

  state.routeCount = registered.length;
  return registered;
}

function init(ctx = {}) {
  try {
    broadcastWS = ctx.broadcastWS;
    eventBus = ctx.eventBus || ctx.bus || ctx.communicationBus || null;
    state.eventBusReady = !!eventBus;
    database.ensureReady(ctx);
    loadConfig();

    presetStore = presetFactory.createPresetStore({
      database,
      core,
      nowIso: core.nowIso,
      defaultFields: config.games && config.games.wheel && Array.isArray(config.games.wheel.fields) ? config.games.wheel.fields : DEFAULT_CONFIG.games.wheel.fields,
      emitEvent
    });

    ensureSchema();
    presetStore.seedDefaultPresetIfEmpty();

    wheel = wheelFactory.createWheelGame({
      hostModule: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      config: config.games && config.games.wheel ? config.games.wheel : DEFAULT_CONFIG.games.wheel,
      hostEnabled: !!config.enabled,
      presetStore,
      db: {
        insertSession,
        updateSession,
        getSession,
        listSessions
      },
      broadcast,
      emitEvent,
      nowIso: core.nowIso
    });

    if (ctx && ctx.app) registerRoutes(ctx.app);

    console.log(`[${MODULE_NAME}] loaded v${MODULE_VERSION} games=wheel presets=true enabled=${!!config.enabled}`);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    state.schemaReady = false;
    console.error(`[${MODULE_NAME}] failed: ${state.lastError}`);
  }
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  _private: {
    DEFAULT_CONFIG,
    buildStatus,
    loadConfig,
    ensureSchema,
    emitEvent
  }
};
