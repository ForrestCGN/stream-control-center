"use strict";

/**
 * Stream Events backend foundation.
 *
 * STEP EVS-9:
 * - Keeps the EVS-8 config/dashboard foundation.
 * - Makes the existing Communication-Bus registration, heartbeat and module-status integration explicit.
 * - Adds a Stream-Events bus-status diagnostic endpoint.
 * - Still keeps gameplay runtime, Twitch chat handling, sound/media playback and overlay out of this step.
 */

const crypto = require("crypto");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");

const MODULE_NAME = "stream_events";
const MODULE_VERSION = "0.3.2";
const MODULE_BUILD = "STEP_EVS_9_EVENTBUS_HEARTBEAT_INTEGRATION";
const SCHEMA_MODULE = "stream_events";
const SCHEMA_VERSION = 1;
const TEXT_MODULE = "stream_events";

const STATUS = {
  DRAFT: "draft",
  READY: "ready",
  ACTIVE: "active",
  FINISHED: "finished",
  CANCELLED: "cancelled"
};

const EVENT_TEXT_DEFAULTS = {
  "event.created": [
    "Das Event {eventName} wurde vorbereitet. Die Heimleitung legt schon mal die Klemmbretter raus."
  ],
  "event.not_ready": [
    "{eventName} ist noch nicht startklar. Da fehlt noch etwas in der Vorbereitung."
  ],
  "event.started": [
    "Das Event {eventName} läuft jetzt. Die Rentnergang darf raten und Punkte sammeln."
  ],
  "event.finished": [
    "Das Event {eventName} ist beendet. Die Heimleitung zählt die Punkte zusammen."
  ],
  "sound.round.started": [
    "🔊 Soundrunde gestartet. Lauscher auf, Rentnergang!"
  ],
  "sound.solved": [
    "✅ {user} hat den Sound erkannt und bekommt {points} Punkt(e)!"
  ],
  "sound.unresolved": [
    "⏱️ Niemand hat den Sound erkannt. Die Heimleitung legt ihn erstmal zurück."
  ],
  "text.partial.general": [
    "👀 {user} hat {wordCount} Wort/Wörter aus einem geheimen Satz gefunden."
  ],
  "text.partial.with_sentence": [
    "👀 {user} hat {wordCount} Wort/Wörter aus Satz {phraseNumber} gefunden."
  ],
  "text.word_points.added": [
    "⭐ {user} bekommt {points} Punkt(e) für neue Worttreffer."
  ],
  "text.phrase.solved": [
    "🎉 {user} hat Satz {phraseNumber} gelöst und bekommt {points} Punkt(e)!"
  ],
  "points.added": [
    "{user} bekommt {points} Punkt(e). Die Heimleitung hat es notiert."
  ],
  "ranking.updated": [
    "Die Rangliste wurde aktualisiert."
  ]
};

const EVENT_TEXT_CATEGORIES = {
  "event.created": "event_status",
  "event.not_ready": "event_status",
  "event.started": "event_status",
  "event.finished": "event_status",
  "sound.round.started": "sound_game",
  "sound.solved": "sound_game",
  "sound.unresolved": "sound_game",
  "text.partial.general": "text_game",
  "text.partial.with_sentence": "text_game",
  "text.word_points.added": "text_game",
  "text.phrase.solved": "text_game",
  "points.added": "scoring",
  "ranking.updated": "scoring"
};

const EVENT_TEXT_CATEGORY_LABELS = {
  event_status: "Event · Status",
  sound_game: "Sound-Spiel",
  text_game: "Text-Spiel",
  scoring: "Event · Punkte"
};

const DEFAULT_EVENT_CONFIG = {
  eventDefaults: {
    defaultTopWinners: 3,
    allowOnlyOneActiveEvent: true,
    overviewShowsOnlyRunningEvents: true
  },
  soundDefaults: {
    defaultAnswerSeconds: 20,
    defaultPoints: 10,
    unresolvedPolicy: "requeue_later",
    avoidImmediateRepeat: true,
    revealVideoEnabled: true
  },
  textDefaults: {
    defaultPhrasePoints: 40,
    partialHintsEnabled: true,
    partialHintVisibility: "general",
    showPartialWordCount: true,
    wordPointsEnabled: false,
    pointsPerNewWord: 1,
    maxWordPointsPerUserPhrase: 5,
    partialHintCooldownSeconds: 0,
    uniqueWordPerUserPhrase: true
  },
  overlayDefaults: {
    showTop3: true,
    showCurrentRound: true,
    showPartialHints: true
  }
};

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "events",
  description: "Zentrales Event-System Backend: Entwürfe, Validierung, Punkte, Ranking, Bus-Status, Text-Multi-Satz-Config, Textvarianten, globale Config und Communication-Bus Heartbeat.",
  routesPrefix: ["/api/stream-events"],
  bus: {
    registered: true,
    heartbeat: true,
    publishes: [
      "stream_events.event.created",
      "stream_events.event.updated",
      "stream_events.event.validated",
      "stream_events.event.started",
      "stream_events.event.finished",
      "stream_events.event.cancelled",
      "stream_events.points.added",
      "stream_events.ranking.updated"
    ],
    consumes: []
  },
  legacy: false
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.MODULE_BUILD = MODULE_BUILD;
module.exports.version = MODULE_VERSION;

let eventBus = null;
let moduleBusHandle = null;
let runtimeState = {
  loadedAt: core.nowIso(),
  schemaReady: false,
  schemaError: "",
  routeCount: 0,
  textSeed: null,
  lastError: "",
  lastEventUid: "",
  lastAction: "",
  lastActionAt: "",
  counters: {
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsStarted: 0,
    eventsFinished: 0,
    eventsCancelled: 0,
    pointsAdded: 0,
    busEmitted: 0,
    busErrors: 0
  }
};

function createCommunicationBusHandle(meta, buildStatusFn) {
  const moduleName = meta && meta.name ? String(meta.name) : "unknown_module";
  const intervalMs = 5000;
  const state = {
    ok: false,
    registered: false,
    heartbeatStarted: false,
    heartbeatCount: 0,
    lastHeartbeatAt: "",
    lastStatusPublishedAt: "",
    lastError: "",
    timer: null,
    bus: null
  };

  function getBus() {
    if (state.bus) return state.bus;
    try {
      const communicationBus = require("./communication_bus");
      if (communicationBus && typeof communicationBus.getBus === "function") {
        state.bus = communicationBus.getBus();
        state.ok = !!state.bus;
        return state.bus;
      }
      state.lastError = "communication_bus_getBus_unavailable";
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
    }
    return null;
  }

  function buildCapabilities() {
    const capabilities = [];
    if (Array.isArray(meta.routesPrefix)) {
      for (const route of meta.routesPrefix) capabilities.push(`route:${route}`);
    }
    if (meta.bus && Array.isArray(meta.bus.publishes)) {
      for (const eventName of meta.bus.publishes) capabilities.push(`publishes:${eventName}`);
    }
    if (meta.bus && Array.isArray(meta.bus.consumes)) {
      for (const eventName of meta.bus.consumes) capabilities.push(`consumes:${eventName}`);
    }
    return capabilities;
  }

  function buildModuleInfo() {
    return {
      id: `module:${moduleName}`,
      module: moduleName,
      name: moduleName,
      displayName: meta.label || meta.name || moduleName,
      version: meta.version || "",
      capabilities: buildCapabilities(),
      meta: {
        category: meta.category || "",
        build: meta.build || "",
        type: meta.type || "runtime",
        routesPrefix: Array.isArray(meta.routesPrefix) ? meta.routesPrefix : [],
        registeredBy: "stream_events_eventbus_heartbeat_integration",
        registeredAt: core.nowIso()
      }
    };
  }

  function buildStatusPayload(extra = {}) {
    let base = {};
    try {
      base = typeof buildStatusFn === "function" ? (buildStatusFn() || {}) : {};
    } catch (err) {
      const error = err && err.message ? err.message : String(err);
      base = { ok: false, lastError: error, diagnostics: { health: "error", errors: [error] } };
    }

    const diagnostics = base.diagnostics || {};
    return {
      module: moduleName,
      moduleVersion: meta.version || base.moduleVersion || base.version || "",
      moduleBuild: meta.build || base.moduleBuild || "",
      category: meta.category || "",
      ok: base.ok !== false,
      health: diagnostics.health || (base.ok === false ? "error" : "ok"),
      enabled: base.enabled !== false,
      loadedAt: base.loadedAt || "",
      heartbeatAt: core.nowIso(),
      lastError: base.lastError || diagnostics.lastError || "",
      routeCount: Number(base.routeCount || 0),
      schemaReady: diagnostics.schemaReady,
      warnings: Array.isArray(diagnostics.warnings) ? diagnostics.warnings : [],
      errors: Array.isArray(diagnostics.errors) ? diagnostics.errors : [],
      counts: base.counts || {},
      activeEvent: base.activeEvent || null,
      ...extra
    };
  }

  function register() {
    const bus = getBus();
    if (!bus || typeof bus.registerModule !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const result = bus.registerModule(buildModuleInfo());
    state.registered = result && result.ok === true;
    if (!state.registered) state.lastError = result && result.reason ? result.reason : "register_failed";
    return result;
  }

  function heartbeat(extra = {}) {
    const bus = getBus();
    if (!bus || typeof bus.heartbeatModule !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const payload = buildStatusPayload(extra);
    const result = bus.heartbeatModule(`module:${moduleName}`, {
      module: moduleName,
      version: meta.version || "",
      name: moduleName,
      lastError: payload.lastError || "",
      capabilities: buildCapabilities(),
      meta: payload
    });
    state.heartbeatCount += 1;
    state.lastHeartbeatAt = payload.heartbeatAt;
    if (result && result.ok !== true) state.lastError = result.reason || "heartbeat_failed";
    return result;
  }

  function publishStatus(action = "updated", extra = {}) {
    const bus = getBus();
    if (!bus || typeof bus.publishModuleStatus !== "function") {
      return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    }
    const result = bus.publishModuleStatus(moduleName, buildStatusPayload(extra), {
      action,
      replayable: true,
      ttlMs: intervalMs * 4
    });
    state.lastStatusPublishedAt = core.nowIso();
    if (result && result.ok !== true) state.lastError = result.reason || "publish_failed";
    return result;
  }

  function start() {
    const bus = getBus();
    if (!bus) return { ok: false, reason: state.lastError || "communication_bus_unavailable" };
    if (!state.registered) register();
    heartbeat({ lifecycle: "started" });
    publishStatus("ready", { lifecycle: "ready" });
    if (!state.timer) {
      state.timer = setInterval(() => {
        heartbeat();
        publishStatus("heartbeat");
      }, intervalMs);
      if (typeof state.timer.unref === "function") state.timer.unref();
    }
    state.heartbeatStarted = true;
    return { ok: true, module: moduleName, intervalMs };
  }

  function getState() {
    return {
      ok: state.ok,
      registered: state.registered,
      heartbeatStarted: state.heartbeatStarted,
      heartbeatCount: state.heartbeatCount,
      lastHeartbeatAt: state.lastHeartbeatAt,
      lastStatusPublishedAt: state.lastStatusPublishedAt,
      lastError: state.lastError,
      intervalMs
    };
  }

  return { register, heartbeat, publishStatus, start, getState };
}

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function boolValue(value) {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function intValue(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function cleanString(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function normalizeStatus(value, fallback = STATUS.DRAFT) {
  const clean = cleanString(value, fallback).toLowerCase();
  if (Object.values(STATUS).includes(clean)) return clean;
  return fallback;
}

function newUid(prefix) {
  const random = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function safeJsonParse(value, fallback = {}) {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    const parsed = JSON.parse(String(value));
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (_) {
    return fallback;
  }
}

function jsonEncode(value) {
  return database.jsonEncode ? database.jsonEncode(value ?? null) : JSON.stringify(value ?? null);
}

function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value) && base && typeof base[key] === "object" && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function normalizePolicy(value, allowed, fallback) {
  const clean = String(value || "").trim();
  return allowed.includes(clean) ? clean : fallback;
}

function clampNumber(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeEventConfig(input = {}) {
  const raw = deepMerge(DEFAULT_EVENT_CONFIG, input);
  const cfg = deepMerge(DEFAULT_EVENT_CONFIG, raw);

  cfg.eventDefaults.defaultTopWinners = clampNumber(cfg.eventDefaults.defaultTopWinners, 1, 10, 3);
  cfg.eventDefaults.allowOnlyOneActiveEvent = boolValue(cfg.eventDefaults.allowOnlyOneActiveEvent, true);
  cfg.eventDefaults.overviewShowsOnlyRunningEvents = boolValue(cfg.eventDefaults.overviewShowsOnlyRunningEvents, true);

  cfg.soundDefaults.defaultAnswerSeconds = clampNumber(cfg.soundDefaults.defaultAnswerSeconds, 5, 300, 20);
  cfg.soundDefaults.defaultPoints = clampNumber(cfg.soundDefaults.defaultPoints, 0, 10000, 10);
  cfg.soundDefaults.unresolvedPolicy = normalizePolicy(cfg.soundDefaults.unresolvedPolicy, ["requeue_later", "remove", "manual"], "requeue_later");
  cfg.soundDefaults.avoidImmediateRepeat = boolValue(cfg.soundDefaults.avoidImmediateRepeat, true);
  cfg.soundDefaults.revealVideoEnabled = boolValue(cfg.soundDefaults.revealVideoEnabled, true);

  cfg.textDefaults.defaultPhrasePoints = clampNumber(cfg.textDefaults.defaultPhrasePoints, 0, 10000, 40);
  cfg.textDefaults.partialHintsEnabled = boolValue(cfg.textDefaults.partialHintsEnabled, true);
  cfg.textDefaults.partialHintVisibility = normalizePolicy(cfg.textDefaults.partialHintVisibility, ["off", "general", "with_sentence"], "general");
  cfg.textDefaults.showPartialWordCount = boolValue(cfg.textDefaults.showPartialWordCount, true);
  cfg.textDefaults.wordPointsEnabled = boolValue(cfg.textDefaults.wordPointsEnabled, false);
  cfg.textDefaults.pointsPerNewWord = clampNumber(cfg.textDefaults.pointsPerNewWord, 0, 1000, 1);
  cfg.textDefaults.maxWordPointsPerUserPhrase = clampNumber(cfg.textDefaults.maxWordPointsPerUserPhrase, 0, 10000, 5);
  cfg.textDefaults.partialHintCooldownSeconds = clampNumber(cfg.textDefaults.partialHintCooldownSeconds, 0, 3600, 0);
  cfg.textDefaults.uniqueWordPerUserPhrase = boolValue(cfg.textDefaults.uniqueWordPerUserPhrase, true);

  cfg.overlayDefaults.showTop3 = boolValue(cfg.overlayDefaults.showTop3, true);
  cfg.overlayDefaults.showCurrentRound = boolValue(cfg.overlayDefaults.showCurrentRound, true);
  cfg.overlayDefaults.showPartialHints = boolValue(cfg.overlayDefaults.showPartialHints, true);

  return cfg;
}

function ensureConfigTable() {
  const table = "stream_events_config";
  const qTable = database.quoteIdentifier(table);
  database.exec(`
    CREATE TABLE IF NOT EXISTS ${qTable} (
      id ${database.primaryKeyAutoIncrementSql()},
      config_key TEXT NOT NULL UNIQUE,
      config_json ${database.jsonTypeSql()} NOT NULL,
      updated_by TEXT NOT NULL DEFAULT '',
      created_at ${database.dateTimeTypeSql()} NOT NULL,
      updated_at ${database.dateTimeTypeSql()} NOT NULL
    );
  `);
  return table;
}

function getEventConfig() {
  const table = ensureConfigTable();
  const qTable = database.quoteIdentifier(table);
  const row = database.get(`SELECT config_json, updated_by, created_at, updated_at FROM ${qTable} WHERE config_key = :key`, { key: "global" });
  const stored = row ? safeJsonParse(row.config_json, {}) : {};
  return {
    ok: true,
    module: MODULE_NAME,
    config: normalizeEventConfig(stored),
    source: row ? "database" : "default",
    updatedBy: row ? row.updated_by || "" : "",
    createdAt: row ? row.created_at || "" : "",
    updatedAt: row ? row.updated_at || "" : ""
  };
}

function saveEventConfig(input = {}, actor = "") {
  const table = ensureConfigTable();
  const qTable = database.quoteIdentifier(table);
  const config = normalizeEventConfig(input.config || input);
  const now = nowIso();
  database.run(`
    INSERT INTO ${qTable} (config_key, config_json, updated_by, created_at, updated_at)
    VALUES (:key, :configJson, :updatedBy, :createdAt, :updatedAt)
    ON CONFLICT(config_key) DO UPDATE SET
      config_json = excluded.config_json,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `, {
    key: "global",
    configJson: jsonEncode(config),
    updatedBy: String(actor || "dashboard"),
    createdAt: now,
    updatedAt: now
  });
  markAction("config_updated");
  publishStatus("config_updated", { configUpdated: true });
  return getEventConfig();
}

function getEventTypes(rowOrBody = {}) {
  return {
    sound: boolValue(rowOrBody.sound_enabled ?? rowOrBody.soundEnabled),
    text: boolValue(rowOrBody.text_enabled ?? rowOrBody.textEnabled)
  };
}

function ensureSchema() {
  try {
    database.ensureReady();
    database.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
      if (toVersion === 1) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS stream_events_events (
            id ${database.primaryKeyAutoIncrementSql()},
            event_uid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft',
            sound_enabled ${database.boolTypeSql()} NOT NULL DEFAULT 0,
            text_enabled ${database.boolTypeSql()} NOT NULL DEFAULT 0,
            sound_config_json ${database.jsonTypeSql()} NOT NULL,
            text_config_json ${database.jsonTypeSql()} NOT NULL,
            scoring_config_json ${database.jsonTypeSql()} NOT NULL,
            settings_json ${database.jsonTypeSql()} NOT NULL,
            validation_json ${database.jsonTypeSql()} NOT NULL,
            created_by TEXT NOT NULL DEFAULT '',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL,
            started_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
            finished_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
            cancelled_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
            metadata_json ${database.jsonTypeSql()} NOT NULL
          );
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_events_status ON stream_events_events(status);`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_events_updated ON stream_events_events(updated_at);`);

        db.exec(`
          CREATE TABLE IF NOT EXISTS stream_events_score_entries (
            id ${database.primaryKeyAutoIncrementSql()},
            entry_uid TEXT NOT NULL UNIQUE,
            event_uid TEXT NOT NULL,
            user_login TEXT NOT NULL,
            user_display_name TEXT NOT NULL DEFAULT '',
            source_module TEXT NOT NULL DEFAULT 'stream_events',
            source_type TEXT NOT NULL DEFAULT 'manual',
            source_uid TEXT NOT NULL DEFAULT '',
            reason TEXT NOT NULL DEFAULT '',
            points ${database.integerTypeSql()} NOT NULL DEFAULT 0,
            created_by TEXT NOT NULL DEFAULT '',
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            metadata_json ${database.jsonTypeSql()} NOT NULL
          );
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_score_event ON stream_events_score_entries(event_uid);`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_score_user ON stream_events_score_entries(event_uid, user_login);`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_score_created ON stream_events_score_entries(created_at);`);

        db.exec(`
          CREATE TABLE IF NOT EXISTS stream_events_rounds (
            id ${database.primaryKeyAutoIncrementSql()},
            round_uid TEXT NOT NULL UNIQUE,
            event_uid TEXT NOT NULL,
            game_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            item_uid TEXT NOT NULL DEFAULT '',
            result TEXT NOT NULL DEFAULT '',
            started_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
            finished_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
            config_json ${database.jsonTypeSql()} NOT NULL,
            result_json ${database.jsonTypeSql()} NOT NULL,
            created_at ${database.dateTimeTypeSql()} NOT NULL,
            updated_at ${database.dateTimeTypeSql()} NOT NULL
          );
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_rounds_event ON stream_events_rounds(event_uid);`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_rounds_type ON stream_events_rounds(event_uid, game_type);`);
      }
    });
    ensureConfigTable();
    runtimeState.schemaReady = true;
    runtimeState.schemaError = "";
    return true;
  } catch (err) {
    runtimeState.schemaReady = false;
    runtimeState.schemaError = err && err.message ? err.message : String(err);
    runtimeState.lastError = runtimeState.schemaError;
    return false;
  }
}

function seedTexts() {
  try {
    const result = textHelper.seedModuleTextVariants(TEXT_MODULE, EVENT_TEXT_DEFAULTS, {
      categories: EVENT_TEXT_CATEGORIES,
      categoryLabels: EVENT_TEXT_CATEGORY_LABELS,
      source: "seed"
    });
    runtimeState.textSeed = result;
    return result;
  } catch (err) {
    runtimeState.textSeed = { ok: false, error: err && err.message ? err.message : String(err) };
    return runtimeState.textSeed;
  }
}

function rowToEvent(row) {
  if (!row) return null;
  const event = {
    id: row.id,
    eventUid: row.event_uid,
    name: row.name || "",
    description: row.description || "",
    status: normalizeStatus(row.status),
    soundEnabled: boolValue(row.sound_enabled),
    textEnabled: boolValue(row.text_enabled),
    soundConfig: safeJsonParse(row.sound_config_json, {}),
    textConfig: safeJsonParse(row.text_config_json, {}),
    scoringConfig: safeJsonParse(row.scoring_config_json, {}),
    settings: safeJsonParse(row.settings_json, {}),
    validation: safeJsonParse(row.validation_json, { ok: false, issues: ["not_validated"] }),
    createdBy: row.created_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    startedAt: row.started_at || "",
    finishedAt: row.finished_at || "",
    cancelledAt: row.cancelled_at || "",
    metadata: safeJsonParse(row.metadata_json, {})
  };
  event.gameTypes = getEventTypes(event);
  event.startable = event.validation && event.validation.ok === true && event.status !== STATUS.ACTIVE && event.status !== STATUS.FINISHED && event.status !== STATUS.CANCELLED;
  return event;
}

function listEvents(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, intValue(options.limit, 100)));
  const status = cleanString(options.status);
  const params = { limit };
  const where = [];
  if (status && status !== "all") {
    where.push("status = :status");
    params.status = normalizeStatus(status, status);
  }
  const rows = database.all(`
    SELECT *
    FROM stream_events_events
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY updated_at DESC, id DESC
    LIMIT :limit
  `, params).map(rowToEvent);

  return { ok: true, count: rows.length, rows };
}

function getEventByUid(eventUid) {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return null;
  const row = database.get("SELECT * FROM stream_events_events WHERE event_uid = :eventUid", { eventUid: uid });
  return rowToEvent(row);
}

function getActiveEvent() {
  ensureSchema();
  const row = database.get("SELECT * FROM stream_events_events WHERE status = 'active' ORDER BY started_at DESC, id DESC LIMIT 1");
  return rowToEvent(row);
}

function summarizeConfig(config = {}) {
  const raw = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  return raw;
}

function validateSoundConfig(config = {}) {
  const issues = [];
  const warnings = [];
  const raw = summarizeConfig(config);
  const snippets = Array.isArray(raw.snippets) ? raw.snippets : [];

  if (!snippets.length) issues.push("sound.no_snippets");

  snippets.forEach((snippet, index) => {
    const label = `sound.snippet.${index + 1}`;
    if (!cleanString(snippet && (snippet.title || snippet.name))) issues.push(`${label}.title_missing`);
    const mediaRef = cleanString(snippet && (snippet.mediaId || snippet.mediaPath || snippet.file || snippet.snippetMediaId));
    if (!mediaRef) issues.push(`${label}.media_missing`);
    const answers = Array.isArray(snippet && snippet.acceptedAnswers) ? snippet.acceptedAnswers : [];
    if (!answers.map(value => cleanString(value)).filter(Boolean).length) issues.push(`${label}.answers_missing`);
  });

  const answerSeconds = intValue(raw.answerSeconds ?? raw.defaultAnswerSeconds, 20);
  if (answerSeconds < 5) warnings.push("sound.answer_seconds_very_short");

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    counts: { snippets: snippets.length },
    settings: {
      answerSeconds,
      unresolvedPolicy: cleanString(raw.unresolvedPolicy, "requeue_later"),
      solvedPolicy: cleanString(raw.solvedPolicy, "remove_from_rotation")
    }
  };
}

function validateTextConfig(config = {}) {
  const issues = [];
  const warnings = [];
  const raw = summarizeConfig(config);
  const phrases = Array.isArray(raw.phrases) ? raw.phrases : [];

  if (!phrases.length) issues.push("text.no_phrases");

  phrases.forEach((phrase, index) => {
    const label = `text.phrase.${index + 1}`;
    if (!cleanString(phrase && (phrase.phrase || phrase.text || phrase.solution))) issues.push(`${label}.phrase_missing`);
    const answers = Array.isArray(phrase && phrase.acceptedAnswers) ? phrase.acceptedAnswers : [];
    if (!answers.map(value => cleanString(value)).filter(Boolean).length) warnings.push(`${label}.answers_empty_uses_phrase`);
    const points = intValue(phrase && (phrase.pointsFirst ?? phrase.points), 0);
    if (points <= 0) warnings.push(`${label}.points_not_set`);
  });

  const partialHintVisibility = cleanString(raw.partialHintVisibility || raw.partialHintDisplayMode || (raw.hintTokensEnabled === false || raw.partialHintsEnabled === false ? "off" : "general"), "general");
  const partialHintsEnabled = partialHintVisibility !== "off" && raw.hintTokensEnabled !== false && raw.partialHintsEnabled !== false;
  const wordPointsEnabled = raw.wordPointsEnabled === true;
  const pointsPerNewWord = intValue(raw.pointsPerNewWord ?? raw.wordPointsPerNewWord, 0);
  const maxWordPointsPerUserPhrase = intValue(raw.maxWordPointsPerUserPhrase ?? raw.maxWordPointsPerUserAndPhrase, 0);

  if (wordPointsEnabled && pointsPerNewWord <= 0) warnings.push("text.word_points_enabled_but_zero_points");

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    counts: { phrases: phrases.length },
    settings: {
      hintTokensEnabled: partialHintsEnabled,
      partialHintVisibility,
      showPartialCount: raw.showPartialCount === true || raw.partialHintShowCount === true,
      uniqueWordsPerUser: raw.uniqueWordsPerUser !== false,
      wordPointsEnabled,
      pointsPerNewWord,
      maxWordPointsPerUserPhrase,
      allowFollowupSolves: false,
      solvedPolicy: cleanString(raw.solvedPolicy, "remove_from_rotation"),
      partialHintCooldownSeconds: intValue(raw.partialHintCooldownSeconds ?? raw.hintCooldownSeconds, 0)
    }
  };
}

function validateEventPayload(event) {
  const issues = [];
  const warnings = [];
  const selected = [];

  if (!cleanString(event.name)) issues.push("event.name_missing");
  if (event.soundEnabled) selected.push("sound");
  if (event.textEnabled) selected.push("text");
  if (!selected.length) issues.push("event.no_game_type_selected");

  const details = {};
  if (event.soundEnabled) {
    details.sound = validateSoundConfig(event.soundConfig || {});
    issues.push(...details.sound.issues);
    warnings.push(...details.sound.warnings);
  }
  if (event.textEnabled) {
    details.text = validateTextConfig(event.textConfig || {});
    issues.push(...details.text.issues);
    warnings.push(...details.text.warnings);
  }

  return {
    ok: issues.length === 0,
    startable: issues.length === 0,
    issues,
    warnings,
    selectedGameTypes: selected,
    details,
    checkedAt: nowIso()
  };
}

function normalizeEventInput(body = {}, existing = null) {
  const input = body && typeof body === "object" ? body : {};
  const soundEnabled = input.soundEnabled !== undefined || input.sound_enabled !== undefined
    ? boolValue(input.soundEnabled ?? input.sound_enabled)
    : (existing ? existing.soundEnabled : false);
  const textEnabled = input.textEnabled !== undefined || input.text_enabled !== undefined
    ? boolValue(input.textEnabled ?? input.text_enabled)
    : (existing ? existing.textEnabled : false);

  return {
    name: cleanString(input.name, existing ? existing.name : ""),
    description: cleanString(input.description, existing ? existing.description : ""),
    soundEnabled,
    textEnabled,
    soundConfig: input.soundConfig !== undefined ? summarizeConfig(input.soundConfig) : (existing ? existing.soundConfig : {}),
    textConfig: input.textConfig !== undefined ? summarizeConfig(input.textConfig) : (existing ? existing.textConfig : {}),
    scoringConfig: input.scoringConfig !== undefined ? summarizeConfig(input.scoringConfig) : (existing ? existing.scoringConfig : defaultScoringConfig()),
    settings: input.settings !== undefined ? summarizeConfig(input.settings) : (existing ? existing.settings : defaultEventSettings()),
    metadata: input.metadata !== undefined ? summarizeConfig(input.metadata) : (existing ? existing.metadata : {}),
    createdBy: cleanString(input.createdBy || input.user || input.actor, existing ? existing.createdBy : "dashboard")
  };
}

function defaultScoringConfig() {
  return {
    winners: 3,
    allowManualPoints: true,
    sound: {
      first: 10,
      second: 7,
      third: 5,
      other: 2
    },
    text: {
      firstSolve: 40,
      followupSolve: 15,
      followupSeconds: 60
    }
  };
}

function defaultEventSettings() {
  return {
    rankingVisible: true,
    overlayEnabled: true,
    chatOutputEnabled: true,
    maxActiveSoundGames: 1,
    maxActiveTextGames: 1
  };
}

function createEvent(body = {}) {
  ensureSchema();
  const eventUid = newUid("evs_event");
  const input = normalizeEventInput(body);
  const validation = validateEventPayload(input);
  const now = nowIso();
  const status = validation.ok ? STATUS.READY : STATUS.DRAFT;

  database.insert("stream_events_events", {
    event_uid: eventUid,
    name: input.name || "Neues Event",
    description: input.description,
    status,
    sound_enabled: input.soundEnabled ? 1 : 0,
    text_enabled: input.textEnabled ? 1 : 0,
    sound_config_json: jsonEncode(input.soundConfig),
    text_config_json: jsonEncode(input.textConfig),
    scoring_config_json: jsonEncode(input.scoringConfig),
    settings_json: jsonEncode(input.settings),
    validation_json: jsonEncode(validation),
    created_by: input.createdBy,
    created_at: now,
    updated_at: now,
    started_at: "",
    finished_at: "",
    cancelled_at: "",
    metadata_json: jsonEncode(input.metadata)
  });

  runtimeState.counters.eventsCreated += 1;
  markAction("created", eventUid);
  const event = getEventByUid(eventUid);
  emitBus("stream_events.event", "created", { event: publicEventSummary(event), validation });
  publishStatus("event.created", { lastEventUid: eventUid });
  return event;
}

function updateEvent(eventUid, body = {}) {
  ensureSchema();
  const existing = getEventByUid(eventUid);
  if (!existing) return { ok: false, error: "event_not_found", eventUid };
  if ([STATUS.ACTIVE, STATUS.FINISHED, STATUS.CANCELLED].includes(existing.status)) {
    return { ok: false, error: "event_not_editable_in_current_status", eventUid, status: existing.status };
  }

  const input = normalizeEventInput(body, existing);
  const validation = validateEventPayload(input);
  const status = validation.ok ? STATUS.READY : STATUS.DRAFT;
  const now = nowIso();

  database.updateByKey("stream_events_events", "event_uid", eventUid, {
    name: input.name || existing.name,
    description: input.description,
    status,
    sound_enabled: input.soundEnabled ? 1 : 0,
    text_enabled: input.textEnabled ? 1 : 0,
    sound_config_json: jsonEncode(input.soundConfig),
    text_config_json: jsonEncode(input.textConfig),
    scoring_config_json: jsonEncode(input.scoringConfig),
    settings_json: jsonEncode(input.settings),
    validation_json: jsonEncode(validation),
    updated_at: now,
    metadata_json: jsonEncode(input.metadata)
  });

  runtimeState.counters.eventsUpdated += 1;
  markAction("updated", eventUid);
  const event = getEventByUid(eventUid);
  emitBus("stream_events.event", "updated", { event: publicEventSummary(event), validation });
  publishStatus("event.updated", { lastEventUid: eventUid });
  return event;
}

function validateStoredEvent(eventUid) {
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  const validation = validateEventPayload(event);
  const nextStatus = validation.ok && event.status === STATUS.DRAFT ? STATUS.READY : event.status;
  database.updateByKey("stream_events_events", "event_uid", eventUid, {
    status: nextStatus,
    validation_json: jsonEncode(validation),
    updated_at: nowIso()
  });
  markAction("validated", eventUid);
  const updated = getEventByUid(eventUid);
  emitBus("stream_events.event", "validated", { event: publicEventSummary(updated), validation });
  publishStatus("event.validated", { lastEventUid: eventUid });
  return updated;
}

function startEvent(eventUid) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if (event.status === STATUS.ACTIVE) return { ok: true, alreadyActive: true, event };
  if ([STATUS.FINISHED, STATUS.CANCELLED].includes(event.status)) return { ok: false, error: "event_already_final", eventUid, status: event.status };

  const validation = validateEventPayload(event);
  if (!validation.ok) {
    database.updateByKey("stream_events_events", "event_uid", eventUid, {
      status: STATUS.DRAFT,
      validation_json: jsonEncode(validation),
      updated_at: nowIso()
    });
    return { ok: false, error: "event_not_ready", event: getEventByUid(eventUid), validation };
  }

  const active = getActiveEvent();
  if (active && active.eventUid !== eventUid) {
    return { ok: false, error: "another_event_active", activeEvent: publicEventSummary(active) };
  }

  const now = nowIso();
  database.updateByKey("stream_events_events", "event_uid", eventUid, {
    status: STATUS.ACTIVE,
    validation_json: jsonEncode(validation),
    started_at: now,
    updated_at: now
  });

  runtimeState.counters.eventsStarted += 1;
  markAction("started", eventUid);
  const updated = getEventByUid(eventUid);
  emitBus("stream_events.event", "started", { event: publicEventSummary(updated), validation });
  publishStatus("event.started", { lastEventUid: eventUid });
  return { ok: true, event: updated };
}

function finishEvent(eventUid) {
  return finalizeEvent(eventUid, STATUS.FINISHED, "finished");
}

function cancelEvent(eventUid) {
  return finalizeEvent(eventUid, STATUS.CANCELLED, "cancelled");
}

function finalizeEvent(eventUid, status, action) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if ([STATUS.FINISHED, STATUS.CANCELLED].includes(event.status)) return { ok: true, alreadyFinal: true, event };
  const now = nowIso();
  const patch = {
    status,
    updated_at: now
  };
  if (status === STATUS.FINISHED) patch.finished_at = now;
  if (status === STATUS.CANCELLED) patch.cancelled_at = now;
  database.updateByKey("stream_events_events", "event_uid", eventUid, patch);

  if (status === STATUS.FINISHED) runtimeState.counters.eventsFinished += 1;
  if (status === STATUS.CANCELLED) runtimeState.counters.eventsCancelled += 1;
  markAction(action, eventUid);
  const updated = getEventByUid(eventUid);
  emitBus("stream_events.event", action, { event: publicEventSummary(updated), ranking: getRanking(eventUid).rows });
  publishStatus(`event.${action}`, { lastEventUid: eventUid });
  return { ok: true, event: updated, ranking: getRanking(eventUid).rows };
}

function addPoints(eventUid, body = {}) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if (event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid, status: event.status };

  const userLogin = cleanString(body.userLogin || body.login || body.user || body.userName).replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, error: "user_login_required" };
  const points = intValue(body.points, 0);
  if (!Number.isFinite(points) || points === 0) return { ok: false, error: "points_required" };

  const entryUid = cleanString(body.entryUid) || newUid("evs_score");
  const now = nowIso();
  database.insert("stream_events_score_entries", {
    entry_uid: entryUid,
    event_uid: eventUid,
    user_login: userLogin,
    user_display_name: cleanString(body.userDisplayName || body.displayName || body.userName, userLogin),
    source_module: cleanString(body.sourceModule, MODULE_NAME),
    source_type: cleanString(body.sourceType, "manual"),
    source_uid: cleanString(body.sourceUid || body.roundUid || body.itemUid),
    reason: cleanString(body.reason, "manual_points"),
    points,
    created_by: cleanString(body.createdBy || body.actor, "dashboard"),
    created_at: now,
    metadata_json: jsonEncode(body.metadata || {})
  });

  runtimeState.counters.pointsAdded += 1;
  markAction("points.added", eventUid);
  const ranking = getRanking(eventUid);
  emitBus("stream_events.points", "added", { eventUid, entryUid, userLogin, points, ranking: ranking.rows.slice(0, 10) });
  emitBus("stream_events.ranking", "updated", { eventUid, ranking: ranking.rows.slice(0, 10) });
  publishStatus("points.added", { lastEventUid: eventUid });
  return { ok: true, entryUid, eventUid, userLogin, points, ranking: ranking.rows };
}

function getRanking(eventUid) {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return { ok: false, error: "event_uid_required", rows: [] };
  const rows = database.all(`
    SELECT
      user_login,
      MAX(user_display_name) AS user_display_name,
      SUM(points) AS total_points,
      COUNT(*) AS entry_count,
      MAX(created_at) AS last_points_at
    FROM stream_events_score_entries
    WHERE event_uid = :eventUid
    GROUP BY user_login
    ORDER BY total_points DESC, last_points_at ASC, user_login ASC
  `, { eventUid: uid }).map((row, index) => ({
    rank: index + 1,
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    points: Number(row.total_points || 0),
    entries: Number(row.entry_count || 0),
    lastPointsAt: row.last_points_at || ""
  }));
  return { ok: true, eventUid: uid, count: rows.length, rows, top3: rows.slice(0, 3) };
}

function publicEventSummary(event) {
  if (!event) return null;
  return {
    eventUid: event.eventUid,
    name: event.name,
    status: event.status,
    soundEnabled: event.soundEnabled,
    textEnabled: event.textEnabled,
    validation: event.validation,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    startedAt: event.startedAt,
    finishedAt: event.finishedAt,
    cancelledAt: event.cancelledAt
  };
}

function getCounts() {
  ensureSchema();
  const byStatus = database.all(`
    SELECT status, COUNT(*) AS count
    FROM stream_events_events
    GROUP BY status
  `);
  const counts = {
    events: database.count("stream_events_events"),
    scoreEntries: database.count("stream_events_score_entries"),
    rounds: database.count("stream_events_rounds"),
    byStatus: {}
  };
  for (const row of byStatus) counts.byStatus[row.status || "unknown"] = Number(row.count || 0);
  return counts;
}

function buildStatus() {
  const warnings = [];
  const errors = [];
  if (!runtimeState.schemaReady) errors.push(runtimeState.schemaError || "schema_not_ready");
  let counts = { events: 0, scoreEntries: 0, rounds: 0, byStatus: {} };
  let activeEvent = null;
  try {
    if (runtimeState.schemaReady) {
      counts = getCounts();
      activeEvent = publicEventSummary(getActiveEvent());
    }
  } catch (err) {
    errors.push(err && err.message ? err.message : String(err));
  }

  return {
    ok: errors.length === 0,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    version: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: true,
    loadedAt: runtimeState.loadedAt,
    routeCount: runtimeState.routeCount,
    counts,
    activeEvent,
    lastEventUid: runtimeState.lastEventUid,
    lastAction: runtimeState.lastAction,
    lastActionAt: runtimeState.lastActionAt,
    lastError: runtimeState.lastError,
    textSeed: runtimeState.textSeed,
    bus: moduleBusHandle ? moduleBusHandle.getState() : { ok: false, registered: false, heartbeatStarted: false, lastError: "not_started" },
    diagnostics: {
      ok: errors.length === 0,
      health: errors.length ? "error" : (warnings.length ? "warn" : "ok"),
      schemaReady: runtimeState.schemaReady,
      schemaVersion: SCHEMA_VERSION,
      warnings,
      errors,
      lastError: runtimeState.lastError || runtimeState.schemaError || ""
    },
    runtime: {
      counters: runtimeState.counters
    },
    updatedAt: nowIso()
  };
}

function buildBusStatus() {
  const bus = getBus();
  const handleState = moduleBusHandle ? moduleBusHandle.getState() : null;
  const status = bus && typeof bus.getStatus === "function" ? bus.getStatus() : null;
  const clients = status && Array.isArray(status.clients) ? status.clients : [];
  const events = status && Array.isArray(status.events) ? status.events : [];
  const subscriptions = status && Array.isArray(status.subscriptions) ? status.subscriptions : [];
  const streamEventClients = clients.filter(client => client && (client.module === MODULE_NAME || client.id === `module:${MODULE_NAME}`));
  const streamEvents = events.filter(event => {
    const source = event && event.source ? event.source : {};
    return source.module === MODULE_NAME || source.id === `module:${MODULE_NAME}` || String(event.channel || "").startsWith("stream_events");
  });

  return {
    ok: !!bus,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    handle: handleState || { ok: false, registered: false, heartbeatStarted: false, lastError: "not_started" },
    communicationBusAvailable: !!bus,
    communicationBusEnabled: status ? status.enabled !== false : false,
    busName: status ? status.bus || "" : "",
    busVersion: status ? status.version || "" : "",
    clients: streamEventClients,
    clientCount: streamEventClients.length,
    events: streamEvents,
    eventCount: streamEvents.length,
    subscriptionCount: subscriptions.length,
    stats: status && status.stats ? status.stats : {},
    updatedAt: nowIso()
  };
}

function publicRoutes(prefix = "/api/stream-events") {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    routes: [
      { method: "GET", path: `${prefix}/status`, description: "Stream-Events Backendstatus" },
      { method: "GET", path: `${prefix}/bus-status`, description: "Stream-Events Communication-Bus Registrierung, Heartbeat und letzte Bus-Events" },
      { method: "GET", path: `${prefix}/routes`, description: "Route-Selbstdokumentation" },
      { method: "GET", path: `${prefix}/config`, description: "Globale Event-System Config lesen" },
      { method: "POST", path: `${prefix}/config`, description: "Globale Event-System Config speichern" },
      { method: "GET", path: `${prefix}/texts`, description: "DB-/Dashboardfähige Textvarianten für stream_events lesen" },
      { method: "POST", path: `${prefix}/texts`, description: "Textvariante speichern oder löschen" },
      { method: "GET", path: `${prefix}/events`, description: "Events listen" },
      { method: "POST", path: `${prefix}/events`, description: "Event-Entwurf erstellen" },
      { method: "GET", path: `${prefix}/events/:eventUid`, description: "Eventdetails lesen" },
      { method: "PUT", path: `${prefix}/events/:eventUid`, description: "Event-Entwurf bearbeiten" },
      { method: "POST", path: `${prefix}/events/:eventUid/validate`, description: "Event validieren" },
      { method: "POST", path: `${prefix}/events/:eventUid/start`, description: "Event starten, wenn startbereit und kein anderes Event aktiv ist" },
      { method: "POST", path: `${prefix}/events/:eventUid/finish`, description: "Event beenden und Ranking liefern" },
      { method: "POST", path: `${prefix}/events/:eventUid/cancel`, description: "Event abbrechen" },
      { method: "GET", path: `${prefix}/events/:eventUid/ranking`, description: "Event-Ranking lesen" },
      { method: "POST", path: `${prefix}/events/:eventUid/points`, description: "Manuelle/Modul-Punkte buchen (nur aktives Event)" }
    ],
    notes: [
      "EVS-9 macht die Communication-Bus Anmeldung/Heartbeat transparent; keine Chat-Auswertung und kein Sound-/Video-Playback.",
      "Sound/Text-Konfiguration wird als DB-Snapshot am Event gespeichert.",
      "Nur ein aktives Event gleichzeitig."
    ]
  };
}

function markAction(action, eventUid = "") {
  runtimeState.lastAction = action;
  runtimeState.lastActionAt = nowIso();
  runtimeState.lastEventUid = eventUid || runtimeState.lastEventUid || "";
  runtimeState.lastError = "";
}

function getBus() {
  if (eventBus) return eventBus;
  try {
    const communicationBus = require("./communication_bus");
    if (communicationBus && typeof communicationBus.getBus === "function") eventBus = communicationBus.getBus();
  } catch (err) {
    runtimeState.lastError = err && err.message ? err.message : String(err);
  }
  return eventBus;
}

function emitBus(channel, action, payload = {}, options = {}) {
  const bus = getBus();
  if (!bus || typeof bus.emit !== "function") return { ok: false, skipped: true, reason: "communication_bus_unavailable" };
  try {
    const result = bus.emit({
      type: "event",
      channel,
      action,
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload,
      meta: {
        requireAck: options.requireAck === true,
        replayable: options.replayable !== false,
        ttlMs: Number.isFinite(Number(options.ttlMs)) ? Number(options.ttlMs) : 30000
      }
    });
    runtimeState.counters.busEmitted += 1;
    return result;
  } catch (err) {
    runtimeState.counters.busErrors += 1;
    runtimeState.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: runtimeState.lastError };
  }
}

function publishStatus(action = "updated", extra = {}) {
  if (!moduleBusHandle || typeof moduleBusHandle.publishStatus !== "function") return { ok: false, reason: "module_bus_handle_missing" };
  return moduleBusHandle.publishStatus(action, extra);
}

function sendJson(res, payload, statusCode = 200) {
  res.status(statusCode).json(payload);
}

function handleError(res, err, fallbackStatus = 500) {
  const message = err && err.message ? err.message : String(err);
  runtimeState.lastError = message;
  sendJson(res, { ok: false, module: MODULE_NAME, error: message }, fallbackStatus);
}

module.exports.init = function init(ctx) {
  const { app } = ctx;
  database.ensureReady(ctx);
  ensureSchema();
  seedTexts();

  moduleBusHandle = createCommunicationBusHandle(MODULE_META, buildStatus);
  moduleBusHandle.start();

  const prefix = "/api/stream-events";
  const registeredRoutes = [];

  function reg(method, route, handler) {
    if (method === "get") registeredRoutes.push(...routes.registerGet(app, route, handler));
    else if (method === "post") registeredRoutes.push(...routes.registerPost(app, route, handler));
    else if (method === "put") registeredRoutes.push(...routes.registerPut(app, route, handler));
  }

  reg("get", `${prefix}/status`, (req, res) => {
    try {
      sendJson(res, buildStatus());
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/bus-status`, (req, res) => {
    try {
      sendJson(res, buildBusStatus());
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/routes`, (req, res) => sendJson(res, publicRoutes(prefix)));

  reg("get", `${prefix}/config`, (req, res) => {
    try {
      sendJson(res, getEventConfig());
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/config`, (req, res) => {
    try {
      sendJson(res, saveEventConfig(req.body || {}, req.body?.updatedBy || req.body?.actor || "dashboard"));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/texts`, (req, res) => {
    try {
      const texts = textHelper.listModuleTextEditor(TEXT_MODULE, EVENT_TEXT_DEFAULTS, {
        categories: EVENT_TEXT_CATEGORIES,
        categoryLabels: EVENT_TEXT_CATEGORY_LABELS
      });
      sendJson(res, texts);
    } catch (err) {
      handleError(res, err);
    }
  });


  reg("post", `${prefix}/texts`, (req, res) => {
    try {
      const result = textHelper.handleModuleTextEditorPayload(TEXT_MODULE, req.body || {}, {
        categories: EVENT_TEXT_CATEGORIES,
        categoryLabels: EVENT_TEXT_CATEGORY_LABELS
      });
      markAction("texts_updated");
      publishStatus("texts_updated", { textUpdated: true });
      sendJson(res, result);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/events`, (req, res) => {
    try {
      sendJson(res, listEvents({ limit: req.query.limit, status: req.query.status }));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/events`, (req, res) => {
    try {
      const event = createEvent(req.body || {});
      sendJson(res, { ok: true, event }, 201);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/events/:eventUid`, (req, res) => {
    try {
      const event = getEventByUid(req.params.eventUid);
      if (!event) return sendJson(res, { ok: false, error: "event_not_found", eventUid: req.params.eventUid }, 404);
      sendJson(res, { ok: true, event });
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("put", `${prefix}/events/:eventUid`, (req, res) => {
    try {
      const event = updateEvent(req.params.eventUid, req.body || {});
      if (event && event.ok === false) return sendJson(res, event, event.error === "event_not_found" ? 404 : 400);
      sendJson(res, { ok: true, event });
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/validate`, (req, res) => {
    try {
      const event = validateStoredEvent(req.params.eventUid);
      if (event && event.ok === false) return sendJson(res, event, event.error === "event_not_found" ? 404 : 400);
      sendJson(res, { ok: true, event, validation: event.validation });
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/start`, (req, res) => {
    try {
      const result = startEvent(req.params.eventUid);
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/finish`, (req, res) => {
    try {
      const result = finishEvent(req.params.eventUid);
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/cancel`, (req, res) => {
    try {
      const result = cancelEvent(req.params.eventUid);
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/events/:eventUid/ranking`, (req, res) => {
    try {
      const event = getEventByUid(req.params.eventUid);
      if (!event) return sendJson(res, { ok: false, error: "event_not_found", eventUid: req.params.eventUid }, 404);
      sendJson(res, getRanking(req.params.eventUid));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/events/:eventUid/points`, (req, res) => {
    try {
      const result = addPoints(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  runtimeState.routeCount = registeredRoutes.length;
  publishStatus("routes.registered", { routeCount: runtimeState.routeCount });
  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} ${MODULE_BUILD} routes=${runtimeState.routeCount}`);
};

module.exports._internal = {
  ensureSchema,
  validateEventPayload,
  createEvent,
  updateEvent,
  startEvent,
  finishEvent,
  cancelEvent,
  addPoints,
  getRanking,
  getEventConfig,
  saveEventConfig,
  buildStatus,
  buildBusStatus
};
