"use strict";

/**
 * Stream Events backend foundation.
 *
 * STEP EVS-13:
 * - Keeps EVS-12 Text-Runtime dashboard report.
 * - Adds user statistics list/detail endpoints for dropdown filtering.
 * - Prepares text and future sound statistics in one user-focused report.
 * - Still does not send directly into Twitch chat.
 */

const crypto = require("crypto");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");

let streamStatusModule = null;
try { streamStatusModule = require("./stream_status"); } catch (_) { streamStatusModule = null; }

const MODULE_NAME = "stream_events";
const MODULE_VERSION = "0.5.24";
const MODULE_BUILD = "STEP_EVENT_RUNTIME_1_READONLY_OVERLAY_STATE";
const SCHEMA_MODULE = "stream_events";
const SCHEMA_VERSION = 1;
const TEXT_MODULE = "stream_events";

const STATUS = {
  DRAFT: "draft",
  READY: "ready",
  ACTIVE: "active",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  ARCHIVED: "archived"
};

const EVENT_TEXT_DEFAULTS = {
  "event.created": [
    "📋 {eventName} wurde vorbereitet. Die Heimleitung hat das Klemmbrett gezückt.",
    "📝 {eventName} liegt bereit. Die Rentnergang darf sich schon mal warmraten.",
    "💜 {eventName} ist im System. Die CGN-Heimleitung sortiert noch die Stifte.",
    "🏠 {eventName} wurde angelegt. Im Aufenthaltsraum wird schon getuschelt.",
    "🎮 {eventName} ist vorbereitet. Forrests Event-Akte ist eröffnet."
  ],
  "event.not_ready": [
    "⚠️ {eventName} ist noch nicht startklar. Da fehlt noch ein Häkchen im Heimleitungsordner.",
    "🧓 {eventName} braucht noch etwas Pflege. Die Rentner dürfen noch nicht losrennen.",
    "📋 {eventName} ist noch unvollständig. Die CGN-Akte ist noch nicht abgestempelt.",
    "⏳ {eventName} ist noch nicht bereit. Die Heimleitung sucht noch den letzten Zettel.",
    "🔧 {eventName} muss noch kurz eingestellt werden. Noch kein Startsignal aus dem Altersheim."
  ],
  "event.started": [
    "🚨 {eventName} läuft jetzt. Die Rentnergang darf raten und Punkte sammeln!",
    "🎮 {eventName} ist gestartet. CGN-Community, die Heimleitung schaut genau hin!",
    "🏁 {eventName} geht los. Brillen putzen, Hörgeräte rein, Punkte sammeln!",
    "💜 {eventName} ist live. Das Altersheim ist offiziell im Rätselmodus.",
    "📢 {eventName} startet. Wer zuerst richtig liegt, bekommt den Heimleitungsstempel!"
  ],
  "event.finished": [
    "🏆 {eventName} ist beendet. Die Heimleitung zählt jetzt in Ruhe die Punkte.",
    "📋 {eventName} ist durch. Die Rentnergang darf kurz durchatmen.",
    "💜 {eventName} ist vorbei. CGN zählt nach, wer den Rollator vorne hatte.",
    "🎉 {eventName} ist abgeschlossen. Die Heimleitung klappt das Klemmbrett zu.",
    "🧓 {eventName} ist beendet. Die Punkte gehen jetzt in die Altersheim-Abrechnung."
  ],
  "sound.round.started": [
    "🔊 Soundrunde gestartet. Lauscher auf, Rentnergang!",
    "👂 Hörgeräte auf Maximum: Der nächste Sound läuft!",
    "🔊 Die Heimleitung spielt etwas ab. Wer erkennt den Schnipsel?",
    "🎧 CGN-Soundalarm! Jetzt gut hinhören und schnell tippen.",
    "📻 Aus dem Aufenthaltsraum kommt ein Geräusch. Wer weiß, was es ist?"
  ],
  "sound.solved": [
    "✅ {user} hat den Sound erkannt und bekommt {points} Punkt(e)!",
    "🎉 {user} hat richtig gelauscht. {points} Punkt(e) gehen aufs CGN-Konto!",
    "👂 {user} hat die Heimleitungsprüfung bestanden: Sound erkannt, {points} Punkt(e)!",
    "🏆 {user} war schneller als der Rentnerbus und bekommt {points} Punkt(e)!",
    "💜 {user} hat den Schnipsel gelöst. Die Heimleitung notiert {points} Punkt(e)."
  ],
  "sound.unresolved": [
    "⏱️ Niemand hat den Sound erkannt. Die Heimleitung legt ihn erstmal zurück.",
    "🤔 Der Sound bleibt ungelöst. Das Altersheim murmelt ratlos weiter.",
    "📻 Keine richtige Antwort. Der Schnipsel wandert zurück in die CGN-Schublade.",
    "🧓 Niemand war schnell genug. Die Heimleitung hebt den Sound für später auf.",
    "🔇 Runde vorbei. Der Sound bleibt erstmal ein kleines Heimleitungsgeheimnis."
  ],
  "text.partial.general": [
    "👀 {user} hat {wordCount} Wort/Wörter aus einem geheimen Satz erwischt.",
    "🧓 {user} schnuppert am richtigen Satz: {wordCount} Wort/Wörter gefunden.",
    "📋 Die Heimleitung notiert: {user} hat {wordCount} Wort/Wörter gefunden.",
    "💜 {user} ist auf der richtigen Spur: {wordCount} Wort/Wörter passen.",
    "🔎 {user} hat im CGN-Satzpuzzle {wordCount} Wort/Wörter entdeckt."
  ],
  "text.partial.with_sentence": [
    "👀 {user} hat {wordCount} Wort/Wörter aus Satz {phraseNumber} gefunden.",
    "📋 Satz {phraseNumber}: {user} hat {wordCount} Wort/Wörter auf dem Heimleitungszettel.",
    "🧓 {user} wühlt in Satz {phraseNumber} und hat {wordCount} Wort/Wörter erwischt.",
    "💜 CGN-Hinweis: {user} hat bei Satz {phraseNumber} schon {wordCount} Wort/Wörter gefunden.",
    "🔎 Satz {phraseNumber} knistert: {user} liegt mit {wordCount} Wort/Wörter(n) richtig."
  ],
  "text.word_points.added": [
    "⭐ {user} bekommt {points} Punkt(e) für neue Worttreffer.",
    "📋 Die Heimleitung schreibt {user} {points} Wortpunkt(e) gut.",
    "🧓 {user} hat Wortpunkte abgestaubt: +{points} Punkt(e).",
    "💜 CGN-Konto aktualisiert: {user} bekommt +{points} Punkt(e) für neue Wörter.",
    "🏠 Wortfund im Altersheim! {user} sammelt +{points} Punkt(e)."
  ],
  "text.phrase.solved": [
    "🎉 {user} hat Satz {phraseNumber} gelöst und bekommt {points} Punkt(e)!",
    "🏆 Satz {phraseNumber} ist geknackt! {user} bekommt {points} Punkt(e) von der Heimleitung.",
    "💜 {user} hat den geheimen Satz {phraseNumber} gefunden. +{points} Punkt(e) fürs CGN-Konto!",
    "🧓 Rollator-Speed! {user} löst Satz {phraseNumber} und kassiert {points} Punkt(e).",
    "📋 Die Heimleitung bestätigt: {user} hat Satz {phraseNumber} gelöst. {points} Punkt(e)!"
  ],
  "points.added": [
    "{user} bekommt {points} Punkt(e). Die Heimleitung hat es notiert.",
    "📋 +{points} Punkt(e) für {user}. Der CGN-Stempel sitzt.",
    "🧓 {user} sammelt {points} Punkt(e). Das Altersheim nickt anerkennend.",
    "💜 {points} Punkt(e) gehen an {user}. Die Heimleitung führt Buch.",
    "🏠 {user} bekommt {points} Punkt(e) auf das Event-Konto."
  ],
  "ranking.updated": [
    "Die Rangliste wurde aktualisiert.",
    "📊 Die Heimleitung hat die Rangliste neu sortiert.",
    "🏆 Das CGN-Ranking wurde aktualisiert.",
    "🧓 Die Rentnerwertung ist auf dem neuesten Stand.",
    "📋 Punkte gezählt, Ranking angepasst."
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
    defaultAnswerSeconds: 60,
    defaultPoints: 10,
    playbackMode: "random_auto",
    autoStartFirstRound: true,
    autoAdvanceRounds: true,
    intervalMinutes: 5,
    intervalJitterMinutes: 2,
    orderMode: "random",
    roundDelaySeconds: 5,
    solvedPolicy: "remove_from_rotation",
    unresolvedPolicy: "requeue_later",
    avoidImmediateRepeat: true,
    minRepeatDistance: 3,
    revealVideoEnabled: true,
    revealVideoMode: "after_solved",
    preRollEnabled: false,
    preRollSeconds: 3,
    countdownPreRollEnabled: false,
    countdownPreRollSeconds: 3,
    manualTriggerEnabled: true
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
    showPartialHints: true,
    runtimeOverlayEnabled: true,
    runtimeOverlayPollMs: 900
  },
  chatOutputDefaults: {
    dispatcherEnabled: false,
    liveEnabled: false,
    allowDirectSend: false,
    preparedOnly: true,
    requireEventChatOutputEnabled: true,
    requireEventLiveEnabled: true,
    maxPreviewOutputs: 50
  }
};

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "events",
  description: "Zentrales Event-System Backend: Entwürfe, Validierung, Punkte, Ranking, Bus-Status, Text-Multi-Satz-Config, Textvarianten, globale Config, Communication-Bus Heartbeat, Text- und Sound-Chat-Runtime ueber Twitch-Chat-Bus-Events sowie vorbereiteter ChatOutput-Dispatcher ohne Live-Send und geschuetzter Event-Archiv-/Delete-Lifecycle sowie einfache Active-Event-Runtime-Gate-Logik: Stream offline oder kein aktives Event bedeutet keine Event-Chat-Auswertung; weiterhin ohne Live-Send.",
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
      "stream_events.event.archived",
      "stream_events.event.deleted",
      "stream_events.event.duplicated",
      "stream_events.points.added",
      "stream_events.ranking.updated",
      "stream_events.text.word_found",
      "stream_events.text.phrase_solved",
      "stream_events.sound.round_prepared",
      "stream_events.sound.round_started",
      "stream_events.sound.solved",
      "stream_events.sound.unresolved",
      "stream_events.sound.answer_checked",
      "stream_events.sound.answer_missed"
    ],
    consumes: [
      "twitch.chat.message"
    ]
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
    twitchChatMessages: 0,
    textMessagesProcessed: 0,
    textWordHits: 0,
    textPhraseSolves: 0,
    textRuntimeSkipped: 0,
    busEmitted: 0,
    busErrors: 0,
    soundRoundsPrepared: 0,
    soundRoundsStarted: 0,
    soundRoundsSolved: 0,
    soundRoundsUnresolved: 0,
    soundChatMessagesProcessed: 0,
    soundAnswerMatches: 0,
    soundAnswerMisses: 0,
    soundRuntimeSkipped: 0,
    eventsArchived: 0,
    eventsDeleted: 0,
    runtimeGateSkipped: 0,
    runtimeGateStreamOffline: 0,
    runtimeGateNoActiveEvent: 0
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

function normalizeTextValue(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9äöüÄÖÜ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeText(value, options = {}) {
  const minLength = Math.max(1, intValue(options.minLength, 3));
  const stopWords = new Set(Array.isArray(options.stopWords) ? options.stopWords.map(normalizeTextValue).filter(Boolean) : []);
  const normalized = normalizeTextValue(value);
  if (!normalized) return [];
  const seen = new Set();
  const tokens = [];
  for (const raw of normalized.split(" ")) {
    const token = normalizeTextValue(raw);
    if (!token || token.length < minLength || stopWords.has(token) || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }
  return tokens;
}

function normalizeAcceptedAnswers(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => normalizeTextValue(item)).filter(Boolean);
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

function safeJson(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
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

  cfg.soundDefaults.defaultAnswerSeconds = clampNumber(cfg.soundDefaults.defaultAnswerSeconds, 5, 300, 60);
  cfg.soundDefaults.defaultPoints = clampNumber(cfg.soundDefaults.defaultPoints, 0, 10000, 10);
  cfg.soundDefaults.playbackMode = normalizePolicy(cfg.soundDefaults.playbackMode, ["manual", "random_auto", "sequence_auto"], "random_auto");
  cfg.soundDefaults.autoStartFirstRound = boolValue(cfg.soundDefaults.autoStartFirstRound, cfg.soundDefaults.playbackMode !== "manual");
  cfg.soundDefaults.autoAdvanceRounds = boolValue(cfg.soundDefaults.autoAdvanceRounds, cfg.soundDefaults.playbackMode !== "manual");
  cfg.soundDefaults.intervalMinutes = clampNumber(cfg.soundDefaults.intervalMinutes, 1, 240, 5);
  cfg.soundDefaults.intervalJitterMinutes = clampNumber(cfg.soundDefaults.intervalJitterMinutes, 0, 120, 2);
  cfg.soundDefaults.orderMode = normalizePolicy(cfg.soundDefaults.orderMode, ["list", "random"], cfg.soundDefaults.playbackMode === "sequence_auto" ? "list" : "random");
  cfg.soundDefaults.roundDelaySeconds = clampNumber(cfg.soundDefaults.roundDelaySeconds, 0, 3600, 5);
  cfg.soundDefaults.solvedPolicy = normalizePolicy(cfg.soundDefaults.solvedPolicy, ["remove_from_rotation", "keep_available", "manual"], "remove_from_rotation");
  cfg.soundDefaults.unresolvedPolicy = normalizePolicy(cfg.soundDefaults.unresolvedPolicy, ["requeue_later", "remove", "manual"], "requeue_later");
  cfg.soundDefaults.avoidImmediateRepeat = boolValue(cfg.soundDefaults.avoidImmediateRepeat, true);
  cfg.soundDefaults.minRepeatDistance = clampNumber(cfg.soundDefaults.minRepeatDistance, 0, 100, 3);
  cfg.soundDefaults.revealVideoEnabled = boolValue(cfg.soundDefaults.revealVideoEnabled, true);
  cfg.soundDefaults.revealVideoMode = normalizePolicy(cfg.soundDefaults.revealVideoMode, ["after_solved", "manual", "disabled"], cfg.soundDefaults.revealVideoEnabled === false ? "disabled" : "after_solved");
  cfg.soundDefaults.preRollEnabled = boolValue(cfg.soundDefaults.preRollEnabled, false);
  cfg.soundDefaults.preRollSeconds = clampNumber(cfg.soundDefaults.preRollSeconds, 0, 30, 3);
  cfg.soundDefaults.countdownPreRollEnabled = boolValue(cfg.soundDefaults.countdownPreRollEnabled, false);
  cfg.soundDefaults.countdownPreRollSeconds = clampNumber(cfg.soundDefaults.countdownPreRollSeconds, 0, 30, 3);
  cfg.soundDefaults.manualTriggerEnabled = true;

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
  cfg.overlayDefaults.runtimeOverlayEnabled = boolValue(cfg.overlayDefaults.runtimeOverlayEnabled, true);
  cfg.overlayDefaults.runtimeOverlayPollMs = clampNumber(cfg.overlayDefaults.runtimeOverlayPollMs, 300, 5000, 900);

  cfg.chatOutputDefaults = cfg.chatOutputDefaults && typeof cfg.chatOutputDefaults === "object" ? cfg.chatOutputDefaults : {};
  cfg.chatOutputDefaults.dispatcherEnabled = boolValue(cfg.chatOutputDefaults.dispatcherEnabled, false);
  cfg.chatOutputDefaults.liveEnabled = boolValue(cfg.chatOutputDefaults.liveEnabled, false);
  cfg.chatOutputDefaults.allowDirectSend = boolValue(cfg.chatOutputDefaults.allowDirectSend, false);
  cfg.chatOutputDefaults.preparedOnly = boolValue(cfg.chatOutputDefaults.preparedOnly, true);
  cfg.chatOutputDefaults.requireEventChatOutputEnabled = boolValue(cfg.chatOutputDefaults.requireEventChatOutputEnabled, true);
  cfg.chatOutputDefaults.requireEventLiveEnabled = boolValue(cfg.chatOutputDefaults.requireEventLiveEnabled, true);
  cfg.chatOutputDefaults.maxPreviewOutputs = clampNumber(cfg.chatOutputDefaults.maxPreviewOutputs, 1, 500, 50);

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

    database.exec(`
      CREATE TABLE IF NOT EXISTS stream_events_text_word_hits (
        id ${database.primaryKeyAutoIncrementSql()},
        hit_uid TEXT NOT NULL UNIQUE,
        event_uid TEXT NOT NULL,
        phrase_uid TEXT NOT NULL DEFAULT '',
        phrase_index ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        phrase_number ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        word_key TEXT NOT NULL,
        word_original TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL,
        user_display_name TEXT NOT NULL DEFAULT '',
        points_awarded ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        chat_message_id TEXT NOT NULL DEFAULT '',
        chat_message TEXT NOT NULL DEFAULT '',
        created_at ${database.dateTimeTypeSql()} NOT NULL,
        metadata_json ${database.jsonTypeSql()} NOT NULL,
        UNIQUE(event_uid, phrase_uid, user_login, word_key)
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_text_hits_event ON stream_events_text_word_hits(event_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_text_hits_user ON stream_events_text_word_hits(event_uid, user_login);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_text_hits_phrase ON stream_events_text_word_hits(event_uid, phrase_uid);`);

    database.exec(`
      CREATE TABLE IF NOT EXISTS stream_events_text_phrase_solves (
        id ${database.primaryKeyAutoIncrementSql()},
        solve_uid TEXT NOT NULL UNIQUE,
        event_uid TEXT NOT NULL,
        phrase_uid TEXT NOT NULL DEFAULT '',
        phrase_index ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        phrase_number ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        user_login TEXT NOT NULL,
        user_display_name TEXT NOT NULL DEFAULT '',
        points_awarded ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        chat_message_id TEXT NOT NULL DEFAULT '',
        chat_message TEXT NOT NULL DEFAULT '',
        created_at ${database.dateTimeTypeSql()} NOT NULL,
        metadata_json ${database.jsonTypeSql()} NOT NULL,
        UNIQUE(event_uid, phrase_uid)
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_text_solves_event ON stream_events_text_phrase_solves(event_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_text_solves_user ON stream_events_text_phrase_solves(event_uid, user_login);`);

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
  event.startable = event.validation && event.validation.ok === true && event.status !== STATUS.ACTIVE && event.status !== STATUS.FINISHED && event.status !== STATUS.CANCELLED && event.status !== STATUS.ARCHIVED;
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
function getStreamStatusSnapshot() {
  if (!streamStatusModule || typeof streamStatusModule.getCurrentStatus !== "function") {
    return { ok: false, available: false, online: false, live: false, statusKnown: false, stale: true, reason: "stream_status_unavailable", label: "Stream-Status nicht verfügbar" };
  }
  try {
    const status = streamStatusModule.getCurrentStatus({ refresh: false }) || {};
    const online = status.live === true || status.online === true || status.isLive === true || String(status.status || "").toLowerCase() === "online" || String(status.type || "").toLowerCase() === "live";
    const known = status.statusKnown !== false && !status.lastError;
    const stale = status.stale === true;
    let reason = online ? "stream_online" : "stream_offline";
    if (!known) reason = "stream_status_unknown";
    if (stale) reason = "stream_status_stale";
    return {
      ok: true,
      available: true,
      online,
      live: online,
      statusKnown: known,
      stale,
      reason,
      label: online ? "Stream online" : (known ? "Stream offline" : "Stream-Status unbekannt"),
      source: cleanString(status.source || "stream_status"),
      streamId: cleanString(status.streamId || status.stream_id || ""),
      title: cleanString(status.title || ""),
      gameName: cleanString(status.gameName || status.game_name || ""),
      startedAt: cleanString(status.startedAt || status.streamStartedAt || status.stream_started_at || ""),
      lastCheckedAt: cleanString(status.lastCheckedAt || status.checkedAt || status.updatedAt || ""),
      lastError: cleanString(status.lastError || "")
    };
  } catch (err) {
    return { ok: false, available: true, online: false, live: false, statusKnown: false, stale: true, reason: "stream_status_error", label: "Stream-Status Fehler", lastError: err && err.message ? err.message : String(err) };
  }
}

function getRuntimeGateStatus(options = {}) {
  ensureSchema();
  const event = options.event || (cleanString(options.eventUid) ? getEventByUid(options.eventUid) : getActiveEvent());
  const activeEvent = event && normalizeStatus(event.status) === STATUS.ACTIVE ? event : getActiveEvent();
  const stream = getStreamStatusSnapshot();
  const hasActiveEvent = !!activeEvent;
  const hasChatRuntime = !!(activeEvent && (activeEvent.soundEnabled === true || activeEvent.textEnabled === true));
  let active = false;
  let reason = "no_active_event";
  let label = "Kein Event läuft";

  if (!hasActiveEvent) {
    reason = "no_active_event";
    label = "Kein Event läuft";
  } else if (!hasChatRuntime) {
    reason = "active_event_without_chat_runtime";
    label = "Aktives Event ohne Sound/Text-Chatspiel";
  } else if (!stream.online) {
    reason = stream.reason || "stream_offline";
    label = stream.label || "Stream offline";
  } else {
    active = true;
    reason = "active_event_and_stream_online";
    label = "Event läuft und Stream ist online";
  }

  return {
    ok: true,
    active,
    status: active ? "active" : "inactive",
    reason,
    label,
    event: publicEventSummary(activeEvent),
    eventUid: activeEvent ? activeEvent.eventUid : "",
    eventName: activeEvent ? activeEvent.name : "",
    soundEnabled: !!(activeEvent && activeEvent.soundEnabled),
    textEnabled: !!(activeEvent && activeEvent.textEnabled),
    chatEvaluationActive: active,
    chatOutputLiveSend: false,
    stream,
    rules: {
      streamOfflineDisablesRuntime: true,
      noActiveEventDisablesRuntime: true,
      activeEventRequired: true,
      liveSendStillDisabled: true
    },
    updatedAt: nowIso()
  };
}


function summarizeConfig(config = {}) {
  const raw = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  return raw;
}

function normalizeSoundEventSettings(config = {}, defaults = null) {
  const raw = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  const base = defaults && typeof defaults === "object" ? defaults : ((getEventConfig().config || DEFAULT_EVENT_CONFIG).soundDefaults || DEFAULT_EVENT_CONFIG.soundDefaults);
  const playbackMode = normalizePolicy(raw.playbackMode ?? base.playbackMode, ["manual", "random_auto", "sequence_auto"], "random_auto");
  return {
    answerSeconds: clampNumber(raw.answerSeconds ?? raw.defaultAnswerSeconds ?? base.defaultAnswerSeconds, 5, 300, 60),
    defaultPoints: clampNumber(raw.defaultPoints ?? base.defaultPoints, 0, 10000, 10),
    playbackMode,
    manualTriggerEnabled: true,
    autoStartFirstRound: raw.autoStartFirstRound !== undefined ? boolValue(raw.autoStartFirstRound) : boolValue(base.autoStartFirstRound, playbackMode !== "manual"),
    autoAdvanceRounds: raw.autoAdvanceRounds !== undefined ? boolValue(raw.autoAdvanceRounds) : boolValue(base.autoAdvanceRounds, playbackMode !== "manual"),
    intervalMinutes: clampNumber(raw.intervalMinutes ?? base.intervalMinutes, 1, 240, 5),
    intervalJitterMinutes: clampNumber(raw.intervalJitterMinutes ?? base.intervalJitterMinutes, 0, 120, 2),
    orderMode: normalizePolicy(raw.orderMode ?? base.orderMode, ["list", "random"], playbackMode === "sequence_auto" ? "list" : "random"),
    roundDelaySeconds: clampNumber(raw.roundDelaySeconds ?? base.roundDelaySeconds, 0, 3600, 5),
    solvedPolicy: normalizePolicy(raw.solvedPolicy ?? base.solvedPolicy, ["remove_from_rotation", "keep_available", "manual"], "remove_from_rotation"),
    unresolvedPolicy: normalizePolicy(raw.unresolvedPolicy ?? base.unresolvedPolicy, ["requeue_later", "remove", "manual"], "requeue_later"),
    avoidImmediateRepeat: raw.avoidImmediateRepeat !== undefined ? boolValue(raw.avoidImmediateRepeat) : boolValue(base.avoidImmediateRepeat, true),
    minRepeatDistance: clampNumber(raw.minRepeatDistance ?? base.minRepeatDistance, 0, 100, 3),
    revealVideoEnabled: raw.revealVideoEnabled !== undefined ? boolValue(raw.revealVideoEnabled) : boolValue(base.revealVideoEnabled, true),
    revealVideoMode: normalizePolicy(raw.revealVideoMode ?? base.revealVideoMode, ["after_solved", "manual", "disabled"], raw.revealVideoEnabled === false ? "disabled" : "after_solved"),
    preRollEnabled: raw.preRollEnabled !== undefined ? boolValue(raw.preRollEnabled) : boolValue(base.preRollEnabled, false),
    preRollSeconds: clampNumber(raw.preRollSeconds ?? base.preRollSeconds, 0, 30, 3),
    countdownPreRollEnabled: raw.countdownPreRollEnabled !== undefined ? boolValue(raw.countdownPreRollEnabled) : boolValue(base.countdownPreRollEnabled, false),
    countdownPreRollSeconds: clampNumber(raw.countdownPreRollSeconds ?? base.countdownPreRollSeconds, 0, 30, 3)
  };
}

function mergeSoundEventConfig(config = {}, defaults = null) {
  const raw = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  return {
    ...raw,
    ...normalizeSoundEventSettings(raw, defaults),
    snippets: Array.isArray(raw.snippets) ? raw.snippets : []
  };
}

function validateSoundConfig(config = {}) {
  const issues = [];
  const warnings = [];
  const raw = mergeSoundEventConfig(summarizeConfig(config));
  const snippets = Array.isArray(raw.snippets) ? raw.snippets : [];

  if (!snippets.length) issues.push("sound.no_snippets");

  snippets.forEach((snippet, index) => {
    const label = `sound.snippet.${index + 1}`;
    const title = cleanString(snippet && (snippet.title || snippet.name));
    if (!title) issues.push(`${label}.title_missing`);
    const mediaRef = cleanString(snippet && (snippet.mediaId || snippet.mediaPath || snippet.file || snippet.snippetMediaId));
    if (!mediaRef) issues.push(`${label}.media_missing`);
    const rawAnswers = Array.isArray(snippet && snippet.acceptedAnswers)
      ? snippet.acceptedAnswers
      : (Array.isArray(snippet && snippet.answers) ? snippet.answers : []);
    const answers = rawAnswers.map(value => cleanString(value)).filter(Boolean);
    if (!answers.length) issues.push(`${label}.answers_missing`);
  });

  const answerSeconds = intValue(raw.answerSeconds ?? raw.defaultAnswerSeconds, 60);
  if (answerSeconds < 10) warnings.push("sound.answer_seconds_very_short");

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    counts: { snippets: snippets.length },
    settings: {
      answerSeconds,
      defaultPoints: raw.defaultPoints,
      playbackMode: raw.playbackMode,
      orderMode: raw.orderMode,
      intervalMinutes: raw.intervalMinutes,
      intervalJitterMinutes: raw.intervalJitterMinutes,
      roundDelaySeconds: raw.roundDelaySeconds,
      unresolvedPolicy: cleanString(raw.unresolvedPolicy, "requeue_later"),
      solvedPolicy: cleanString(raw.solvedPolicy, "remove_from_rotation"),
      avoidImmediateRepeat: raw.avoidImmediateRepeat,
      minRepeatDistance: raw.minRepeatDistance,
      revealVideoEnabled: raw.revealVideoEnabled,
      revealVideoMode: raw.revealVideoMode,
      preRollEnabled: raw.preRollEnabled,
      preRollSeconds: raw.preRollSeconds,
      countdownPreRollEnabled: raw.countdownPreRollEnabled,
      countdownPreRollSeconds: raw.countdownPreRollSeconds,
      manualTriggerEnabled: true
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
    soundConfig: input.soundConfig !== undefined ? mergeSoundEventConfig(input.soundConfig) : (existing ? mergeSoundEventConfig(existing.soundConfig) : mergeSoundEventConfig({})),
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


function renameEvent(eventUid, body = {}) {
  ensureSchema();
  const existing = getEventByUid(eventUid);
  if (!existing) return { ok: false, error: "event_not_found", eventUid };

  const nextName = cleanString(body.name || body.newName || body.eventName || "");
  if (!nextName) return { ok: false, error: "name_required", eventUid, message: "Bitte einen Eventnamen eingeben." };

  const now = nowIso();
  const metadata = safeJson(existing.metadata, {});
  metadata.renamedAt = now;
  metadata.renamedBy = cleanString(body.actor || body.updatedBy || body.user || "dashboard");
  metadata.previousName = existing.name || "";

  database.updateByKey("stream_events_events", "event_uid", eventUid, {
    name: nextName,
    updated_at: now,
    metadata_json: jsonEncode(metadata)
  });

  runtimeState.counters.eventsUpdated += 1;
  markAction("renamed", eventUid);
  const event = getEventByUid(eventUid);
  emitBus("stream_events.event", "renamed", { event: publicEventSummary(event), previousName: existing.name || "" });
  publishStatus("event.renamed", { lastEventUid: eventUid });
  return { ok: true, event, previousName: existing.name || "" };
}

function validateStoredEvent(eventUid) {
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  const validation = validateEventPayload(event);
  let nextStatus = event.status;
  if (validation.ok && event.status === STATUS.DRAFT) nextStatus = STATUS.READY;
  if (!validation.ok && event.status === STATUS.READY) nextStatus = STATUS.DRAFT;
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
  if ([STATUS.FINISHED, STATUS.CANCELLED, STATUS.ARCHIVED].includes(event.status)) return { ok: false, error: "event_already_final", eventUid, status: event.status };

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

function getEventLifecycleCounts(eventUid) {
  ensureSchema();
  const uid = cleanString(eventUid);
  const count = (table) => {
    const row = database.get(`SELECT COUNT(*) AS count FROM ${table} WHERE event_uid = :eventUid`, { eventUid: uid });
    return intValue(row && row.count, 0);
  };
  return {
    scoreEntries: count("stream_events_score_entries"),
    rounds: count("stream_events_rounds"),
    textWordHits: count("stream_events_text_word_hits"),
    textPhraseSolves: count("stream_events_text_phrase_solves")
  };
}

function archiveEvent(eventUid, body = {}) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if (event.status === STATUS.ARCHIVED) return { ok: true, alreadyArchived: true, event, counts: getEventLifecycleCounts(eventUid) };
  if (event.status !== STATUS.FINISHED) {
    return {
      ok: false,
      error: "event_not_finished",
      eventUid,
      status: event.status,
      rule: "archive_allowed_only_for_finished_events"
    };
  }

  const now = nowIso();
  const metadata = safeJson(event.metadata, {});
  metadata.archivedAt = now;
  metadata.archivedBy = cleanString(body.actor || body.updatedBy || body.user || "stream_events");
  metadata.previousStatusBeforeArchive = event.status;

  database.updateByKey("stream_events_events", "event_uid", eventUid, {
    status: STATUS.ARCHIVED,
    metadata_json: jsonEncode(metadata),
    updated_at: now
  });

  runtimeState.counters.eventsArchived += 1;
  markAction("archived", eventUid);
  const updated = getEventByUid(eventUid);
  const counts = getEventLifecycleCounts(eventUid);
  emitBus("stream_events.event", "archived", { event: publicEventSummary(updated), counts });
  publishStatus("event.archived", { lastEventUid: eventUid });
  return { ok: true, event: updated, counts, rule: "archive_allowed_only_for_finished_events" };
}

function deleteEvent(eventUid, body = {}) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };

  const confirm = cleanString(body.confirm || body.confirmDelete || body.deleteConfirm);
  if (confirm !== "DELETE") {
    return {
      ok: false,
      error: "delete_confirmation_required",
      eventUid,
      requiredConfirm: "DELETE",
      rule: "delete_allowed_for_any_event_status_with_explicit_confirmation"
    };
  }

  const countsBefore = getEventLifecycleCounts(eventUid);
  database.run("DELETE FROM stream_events_text_phrase_solves WHERE event_uid = :eventUid", { eventUid });
  database.run("DELETE FROM stream_events_text_word_hits WHERE event_uid = :eventUid", { eventUid });
  database.run("DELETE FROM stream_events_rounds WHERE event_uid = :eventUid", { eventUid });
  database.run("DELETE FROM stream_events_score_entries WHERE event_uid = :eventUid", { eventUid });
  database.run("DELETE FROM stream_events_events WHERE event_uid = :eventUid", { eventUid });

  runtimeState.counters.eventsDeleted += 1;
  markAction("deleted", eventUid);
  const summary = publicEventSummary(event);
  emitBus("stream_events.event", "deleted", { event: summary, countsDeleted: countsBefore });
  publishStatus("event.deleted", { lastEventUid: eventUid });
  return {
    ok: true,
    eventUid,
    deletedEvent: summary,
    countsDeleted: countsBefore,
    rule: "delete_allowed_for_any_event_status_with_explicit_confirmation"
  };
}


function duplicateEvent(eventUid, body = {}) {
  ensureSchema();
  const source = getEventByUid(eventUid);
  if (!source) return { ok: false, error: "event_not_found", eventUid };

  const now = nowIso();
  const copyUid = newUid("evs_event");
  const actor = cleanString(body.actor || body.updatedBy || body.user || "dashboard");
  const requestedName = cleanString(body.name || body.newName || body.copyName || "");
  const baseName = cleanString(source.name || "Unbenanntes Event");
  const copyName = requestedName || `Kopie von ${baseName}`;

  const metadata = safeJson(source.metadata, {});
  delete metadata.startedAt;
  delete metadata.finishedAt;
  delete metadata.cancelledAt;
  delete metadata.archivedAt;
  delete metadata.activeRoundUid;
  delete metadata.currentRoundUid;
  metadata.duplicatedFromEventUid = source.eventUid;
  metadata.duplicatedFromName = source.name || "";
  metadata.duplicatedAt = now;
  metadata.duplicatedBy = actor;

  const copyInput = {
    name: copyName,
    description: source.description || "",
    soundEnabled: source.soundEnabled === true,
    textEnabled: source.textEnabled === true,
    soundConfig: safeJson(source.soundConfig, {}),
    textConfig: safeJson(source.textConfig, {}),
    scoringConfig: safeJson(source.scoringConfig, defaultScoringConfig()),
    settings: safeJson(source.settings, defaultEventSettings()),
    metadata,
    createdBy: actor
  };
  const validation = validateEventPayload(copyInput);
  const status = validation.ok ? STATUS.READY : STATUS.DRAFT;

  database.insert("stream_events_events", {
    event_uid: copyUid,
    name: copyInput.name,
    description: copyInput.description,
    status,
    sound_enabled: copyInput.soundEnabled ? 1 : 0,
    text_enabled: copyInput.textEnabled ? 1 : 0,
    sound_config_json: jsonEncode(copyInput.soundConfig),
    text_config_json: jsonEncode(copyInput.textConfig),
    scoring_config_json: jsonEncode(copyInput.scoringConfig),
    settings_json: jsonEncode(copyInput.settings),
    validation_json: jsonEncode(validation),
    created_by: copyInput.createdBy,
    created_at: now,
    updated_at: now,
    started_at: "",
    finished_at: "",
    cancelled_at: "",
    metadata_json: jsonEncode(copyInput.metadata)
  });

  runtimeState.counters.eventsCreated += 1;
  markAction("duplicated", copyUid);
  const copied = getEventByUid(copyUid);
  emitBus("stream_events.event", "duplicated", { event: publicEventSummary(copied), sourceEvent: publicEventSummary(source), validation });
  publishStatus("event.duplicated", { lastEventUid: copyUid, sourceEventUid: source.eventUid });
  return {
    ok: true,
    event: copied,
    sourceEvent: publicEventSummary(source),
    validation,
    countsCopied: {
      scoreEntries: 0,
      rounds: 0,
      textWordHits: 0,
      textPhraseSolves: 0
    },
    rule: "copies_event_configuration_without_runtime_data"
  };
}

function finalizeEvent(eventUid, status, action) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if ([STATUS.FINISHED, STATUS.CANCELLED, STATUS.ARCHIVED].includes(event.status)) return { ok: true, alreadyFinal: true, event };
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

function getTextRuntimeConfig(event = null) {
  const globalConfig = getEventConfig().config || DEFAULT_EVENT_CONFIG;
  const textDefaults = globalConfig.textDefaults || DEFAULT_EVENT_CONFIG.textDefaults;
  const eventConfig = event && event.textConfig && typeof event.textConfig === "object" ? event.textConfig : {};
  return {
    partialHintsEnabled: eventConfig.partialHintsEnabled !== undefined ? boolValue(eventConfig.partialHintsEnabled) : boolValue(textDefaults.partialHintsEnabled),
    partialHintVisibility: cleanString(eventConfig.partialHintVisibility || eventConfig.partialHintDisplayMode || textDefaults.partialHintVisibility, "general"),
    showPartialWordCount: eventConfig.showPartialWordCount !== undefined ? boolValue(eventConfig.showPartialWordCount) : boolValue(textDefaults.showPartialWordCount),
    wordPointsEnabled: eventConfig.wordPointsEnabled !== undefined ? boolValue(eventConfig.wordPointsEnabled) : boolValue(textDefaults.wordPointsEnabled),
    pointsPerNewWord: clampNumber(eventConfig.pointsPerNewWord ?? eventConfig.wordPointsPerNewWord ?? textDefaults.pointsPerNewWord, 0, 1000, 1),
    maxWordPointsPerUserPhrase: clampNumber(eventConfig.maxWordPointsPerUserPhrase ?? eventConfig.maxWordPointsPerUserAndPhrase ?? textDefaults.maxWordPointsPerUserPhrase, 0, 10000, 5),
    partialHintCooldownSeconds: clampNumber(eventConfig.partialHintCooldownSeconds ?? eventConfig.hintCooldownSeconds ?? textDefaults.partialHintCooldownSeconds, 0, 3600, 0),
    uniqueWordPerUserPhrase: eventConfig.uniqueWordPerUserPhrase !== undefined ? boolValue(eventConfig.uniqueWordPerUserPhrase) : boolValue(textDefaults.uniqueWordPerUserPhrase),
    tokenMinLength: clampNumber(eventConfig.tokenMinLength ?? textDefaults.tokenMinLength, 1, 20, 3)
  };
}

function getPhraseUid(phrase = {}, index = 0) {
  return cleanString(phrase.uid || phrase.phraseUid || phrase.id || phrase.key, `phrase_${index + 1}`);
}

function getPhraseText(phrase = {}) {
  return cleanString(phrase.phrase || phrase.text || phrase.solution || phrase.name);
}

function getTextPhrases(event = {}) {
  const raw = event && event.textConfig && typeof event.textConfig === "object" ? event.textConfig : {};
  const phrases = Array.isArray(raw.phrases) ? raw.phrases : [];
  return phrases.map((phrase, index) => ({
    phraseUid: getPhraseUid(phrase, index),
    phrase: getPhraseText(phrase),
    acceptedAnswers: Array.isArray(phrase.acceptedAnswers) ? phrase.acceptedAnswers.map(cleanString).filter(Boolean) : [],
    pointsFirst: clampNumber(phrase.pointsFirst ?? phrase.firstPoints ?? phrase.points, 0, 10000, 0),
    raw: safeJson(phrase, {})
  })).filter(item => item.phrase || item.acceptedAnswers.length);
}

function phraseIsSolved(eventUid, phraseUid) {
  const row = database.get(`
    SELECT solve_uid FROM stream_events_text_phrase_solves
    WHERE event_uid = :eventUid AND phrase_uid = :phraseUid
    LIMIT 1
  `, { eventUid, phraseUid });
  return !!row;
}

function getExistingWordHits(eventUid, phraseUid, userLogin) {
  const rows = database.all(`
    SELECT word_key FROM stream_events_text_word_hits
    WHERE event_uid = :eventUid AND phrase_uid = :phraseUid AND user_login = :userLogin
  `, { eventUid, phraseUid, userLogin });
  return new Set(rows.map(row => row.word_key).filter(Boolean));
}

function getWordPointSum(eventUid, phraseUid, userLogin) {
  const row = database.get(`
    SELECT COALESCE(SUM(points_awarded), 0) AS total
    FROM stream_events_text_word_hits
    WHERE event_uid = :eventUid AND phrase_uid = :phraseUid AND user_login = :userLogin
  `, { eventUid, phraseUid, userLogin }) || {};
  return Number(row.total || 0);
}

function renderEventText(key, context = {}) {
  try {
    return textHelper.renderModuleText(TEXT_MODULE, key, EVENT_TEXT_DEFAULTS, context, {
      categories: EVENT_TEXT_CATEGORIES,
      categoryLabels: EVENT_TEXT_CATEGORY_LABELS
    });
  } catch (_) {
    return "";
  }
}

function buildChatOutput(textKey, context = {}, options = {}) {
  const text = renderEventText(textKey, context);
  return {
    prepared: Boolean(text),
    directSend: false,
    textKey,
    text,
    target: "twitch_chat",
    via: "bus_payload",
    style: "altersheim_cgn_rentner_heimleitung",
    context: safeJson(context, {}),
    meta: {
      source: MODULE_NAME,
      reason: cleanString(options.reason || "runtime_text_output"),
      preparedAt: nowIso()
    }
  };
}

function getChatOutputDispatcherConfig(event = null) {
  const globalConfig = getEventConfig().config || DEFAULT_EVENT_CONFIG;
  const defaults = globalConfig.chatOutputDefaults || DEFAULT_EVENT_CONFIG.chatOutputDefaults;
  const settings = event && event.settings && typeof event.settings === "object" ? event.settings : {};
  return {
    dispatcherEnabled: boolValue(defaults.dispatcherEnabled, false),
    globalLiveEnabled: boolValue(defaults.liveEnabled, false),
    allowDirectSend: boolValue(defaults.allowDirectSend, false),
    preparedOnly: boolValue(defaults.preparedOnly, true),
    requireEventChatOutputEnabled: boolValue(defaults.requireEventChatOutputEnabled, true),
    requireEventLiveEnabled: boolValue(defaults.requireEventLiveEnabled, true),
    eventChatOutputEnabled: boolValue(settings.chatOutputEnabled, false),
    eventLiveEnabled: boolValue(settings.chatOutputLiveEnabled || settings.chatLiveEnabled || settings.liveChatOutputEnabled, false),
    maxPreviewOutputs: clampNumber(defaults.maxPreviewOutputs, 1, 500, 50)
  };
}

function normalizeChatOutputForDispatch(output = {}, index = 0, source = "runtime_report") {
  const raw = output && typeof output === "object" ? output : {};
  const meta = raw.meta && typeof raw.meta === "object" ? raw.meta : {};
  return {
    index,
    source: cleanString(source, "runtime_report"),
    kind: cleanString(raw.kind || meta.reason || raw.reason || "chat_output"),
    prepared: boolValue(raw.prepared, false),
    directSend: boolValue(raw.directSend, false),
    textKey: cleanString(raw.textKey || raw.key),
    text: cleanString(raw.text),
    target: cleanString(raw.target, "twitch_chat"),
    via: cleanString(raw.via, "bus_payload"),
    context: safeJson(raw.context, {}),
    meta: safeJson(meta, {}),
    raw: safeJson(raw, {})
  };
}

function evaluateChatOutputDispatch(output = {}, options = {}) {
  const event = options.event || null;
  const eventUid = cleanString(options.eventUid || (event && event.eventUid));
  const config = options.config || getChatOutputDispatcherConfig(event);
  const normalized = normalizeChatOutputForDispatch(output, options.index || 0, options.source || "runtime_report");
  const blockedBy = [];
  const warnings = [];

  if (!normalized.prepared) blockedBy.push("output_not_prepared");
  if (!normalized.text) blockedBy.push("output_without_text");
  if (normalized.target !== "twitch_chat") warnings.push("target_is_not_twitch_chat");
  if (!config.dispatcherEnabled) blockedBy.push("dispatcher_disabled");
  if (!config.globalLiveEnabled) blockedBy.push("global_live_disabled");
  if (!config.allowDirectSend) blockedBy.push("direct_send_not_allowed");
  if (config.preparedOnly) blockedBy.push("prepared_only_mode");
  if (config.requireEventChatOutputEnabled && !config.eventChatOutputEnabled) blockedBy.push("event_chat_output_disabled");
  if (config.requireEventLiveEnabled && !config.eventLiveEnabled) blockedBy.push("event_live_disabled");
  if (!normalized.directSend) blockedBy.push("output_direct_send_false");

  return {
    ok: true,
    eventUid,
    output: normalized,
    wouldSend: blockedBy.length === 0,
    directSend: false,
    dispatched: false,
    preparedOnly: true,
    blockedBy,
    warnings,
    safety: {
      dispatcherEnabled: config.dispatcherEnabled,
      globalLiveEnabled: config.globalLiveEnabled,
      allowDirectSend: config.allowDirectSend,
      preparedOnly: config.preparedOnly,
      eventChatOutputEnabled: config.eventChatOutputEnabled,
      eventLiveEnabled: config.eventLiveEnabled
    },
    note: "EVS-20 prueft nur, ob ein ChatOutput dispatch-faehig waere. Es wird nichts in Twitch gesendet."
  };
}

function collectPreparedChatOutputs(eventUid = "") {
  ensureSchema();
  const event = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  const uid = event ? event.eventUid : cleanString(eventUid);
  if (!uid) return { ok: true, event: null, eventUid: "", outputs: [], sourceReports: {}, note: "Kein aktives Event und keine eventUid angegeben." };

  const sourceReports = {};
  const outputs = [];
  try {
    const soundReport = getSoundRuntimeReport(uid);
    sourceReports.sound = { ok: soundReport.ok === true, counts: soundReport.counts || {} };
    if (Array.isArray(soundReport.chatOutputs)) {
      for (const item of soundReport.chatOutputs) outputs.push(normalizeChatOutputForDispatch(item, outputs.length, "sound_runtime_report"));
    }
  } catch (err) {
    sourceReports.sound = { ok: false, error: err && err.message ? err.message : String(err) };
  }
  try {
    const textReport = getTextRuntimeReport(uid);
    sourceReports.text = { ok: textReport.ok === true, counts: textReport.counts || {} };
    if (Array.isArray(textReport.chatOutputs)) {
      for (const item of textReport.chatOutputs) outputs.push(normalizeChatOutputForDispatch(item, outputs.length, "text_runtime_report"));
    }
  } catch (err) {
    sourceReports.text = { ok: false, error: err && err.message ? err.message : String(err) };
  }

  return { ok: true, event: publicEventSummary(event || getEventByUid(uid)), eventUid: uid, outputs, sourceReports };
}

function getChatOutputDispatchReport(eventUid = "", options = {}) {
  const collected = collectPreparedChatOutputs(eventUid);
  const event = collected.eventUid ? getEventByUid(collected.eventUid) : null;
  const config = getChatOutputDispatcherConfig(event);
  const max = clampNumber(options.maxPreviewOutputs ?? config.maxPreviewOutputs, 1, 500, config.maxPreviewOutputs);
  const outputs = collected.outputs.slice(0, max);
  const evaluations = outputs.map((output, index) => evaluateChatOutputDispatch(output.raw || output, {
    event,
    eventUid: collected.eventUid,
    index,
    source: output.source,
    config
  }));
  const blockedReasons = {};
  for (const item of evaluations) {
    for (const reason of item.blockedBy || []) blockedReasons[reason] = (blockedReasons[reason] || 0) + 1;
  }
  return {
    ok: collected.ok === true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    event: collected.event,
    eventUid: collected.eventUid,
    config,
    counts: {
      preparedOutputs: collected.outputs.length,
      previewedOutputs: outputs.length,
      wouldSend: evaluations.filter(item => item.wouldSend).length,
      blocked: evaluations.filter(item => !item.wouldSend).length
    },
    blockedReasons,
    outputs: evaluations,
    sourceReports: collected.sourceReports,
    directSend: false,
    dispatched: false,
    note: "EVS-20 Dispatcher-Prep: Status/Report pruefen vorbereitete ChatOutputs. Es wird weiterhin nichts oeffentlich gesendet.",
    updatedAt: nowIso()
  };
}

function testChatOutputDispatch(input = {}) {
  const eventUid = cleanString(input.eventUid || input.event_uid || "");
  const event = eventUid ? getEventByUid(eventUid) : getActiveEvent();
  const config = getChatOutputDispatcherConfig(event);
  const rawOutputs = Array.isArray(input.chatOutputs) ? input.chatOutputs : (input.chatOutput ? [input.chatOutput] : []);
  const outputs = rawOutputs.length ? rawOutputs : collectPreparedChatOutputs(eventUid).outputs.map(item => item.raw || item);
  const evaluations = outputs.map((output, index) => evaluateChatOutputDispatch(output, {
    event,
    eventUid: event ? event.eventUid : eventUid,
    index,
    source: "test_dispatch_input",
    config
  }));
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    event: publicEventSummary(event),
    eventUid: event ? event.eventUid : eventUid,
    counts: {
      inputOutputs: outputs.length,
      wouldSend: evaluations.filter(item => item.wouldSend).length,
      blocked: evaluations.filter(item => !item.wouldSend).length
    },
    outputs: evaluations,
    directSend: false,
    dispatched: false,
    note: "Test-Dispatch ist absichtlich dry-run only. Keine Twitch-Ausgabe, kein Bot-Send, keine Queue.",
    updatedAt: nowIso()
  };
}

function extractChatPayload(envelope = {}) {
  const payload = envelope && envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {};
  const twitch = payload.twitch && typeof payload.twitch === "object" ? payload.twitch : payload;
  const user = twitch.user && typeof twitch.user === "object" ? twitch.user : {};
  const message = cleanString(twitch.message || twitch.text || payload.message || payload.text);
  const userLogin = cleanString(user.login || twitch.userLogin || twitch.login || payload.userLogin || payload.login).replace(/^@/, "").toLowerCase();
  const userDisplayName = cleanString(user.displayName || twitch.userDisplayName || twitch.displayName || payload.userDisplayName || payload.displayName, userLogin);
  const messageId = cleanString(twitch.messageId || twitch.message_id || payload.messageId || payload.message_id || envelope.id);
  return { message, userLogin, userDisplayName, messageId, raw: twitch };
}

function messageSolvesPhrase(message, phrase = {}) {
  const normalizedMessage = normalizeTextValue(message);
  if (!normalizedMessage) return false;
  const phraseText = getPhraseText(phrase);
  const candidates = [normalizeTextValue(phraseText), ...normalizeAcceptedAnswers(phrase.acceptedAnswers)].filter(Boolean);
  return candidates.some(candidate => normalizedMessage === candidate);
}

function insertPhraseSolve(event, phrase, phraseIndex, chat, points) {
  const phraseUid = getPhraseUid(phrase, phraseIndex);
  if (phraseIsSolved(event.eventUid, phraseUid)) return { ok: false, skipped: true, reason: "phrase_already_solved" };
  const solveUid = newUid("evs_text_solve");
  const now = nowIso();
  database.insert("stream_events_text_phrase_solves", {
    solve_uid: solveUid,
    event_uid: event.eventUid,
    phrase_uid: phraseUid,
    phrase_index: phraseIndex,
    phrase_number: phraseIndex + 1,
    user_login: chat.userLogin,
    user_display_name: chat.userDisplayName,
    points_awarded: points,
    chat_message_id: chat.messageId,
    chat_message: chat.message.slice(0, 500),
    created_at: now,
    metadata_json: jsonEncode({ phrase: getPhraseText(phrase), acceptedAnswers: phrase.acceptedAnswers || [] })
  });
  runtimeState.counters.textPhraseSolves += 1;
  const pointsResult = points > 0 ? addPoints(event.eventUid, {
    userLogin: chat.userLogin,
    userDisplayName: chat.userDisplayName,
    points,
    sourceType: "text_phrase_solve",
    sourceUid: solveUid,
    reason: `text_phrase_${phraseIndex + 1}_solved`,
    createdBy: MODULE_NAME,
    metadata: { phraseUid, phraseIndex, phraseNumber: phraseIndex + 1 }
  }) : { ok: true, ranking: getRanking(event.eventUid).rows };
  const chatOutput = buildChatOutput("text.phrase.solved", {
    user: chat.userDisplayName,
    displayName: chat.userDisplayName,
    phraseNumber: phraseIndex + 1,
    points
  }, { reason: "text_phrase_solved" });
  const chatText = chatOutput.text;
  emitBus("stream_events.text", "phrase_solved", {
    eventUid: event.eventUid,
    phraseUid,
    phraseIndex,
    phraseNumber: phraseIndex + 1,
    userLogin: chat.userLogin,
    userDisplayName: chat.userDisplayName,
    points,
    message: chat.message,
    chatText,
    chatOutput,
    ranking: pointsResult.ranking || []
  });
  publishStatus("text.phrase_solved", { lastEventUid: event.eventUid, phraseNumber: phraseIndex + 1 });
  return { ok: true, solveUid, phraseUid, phraseNumber: phraseIndex + 1, points, chatText, chatOutput, pointsResult };
}

function insertWordHit(event, phrase, phraseIndex, wordKey, chat, runtimeConfig) {
  const phraseUid = getPhraseUid(phrase, phraseIndex);
  const existing = getExistingWordHits(event.eventUid, phraseUid, chat.userLogin);
  if (existing.has(wordKey)) return { ok: false, skipped: true, reason: "word_already_hit", wordKey };
  let points = 0;
  if (runtimeConfig.wordPointsEnabled && runtimeConfig.pointsPerNewWord > 0) {
    const alreadyAwarded = getWordPointSum(event.eventUid, phraseUid, chat.userLogin);
    const remaining = runtimeConfig.maxWordPointsPerUserPhrase > 0 ? Math.max(0, runtimeConfig.maxWordPointsPerUserPhrase - alreadyAwarded) : runtimeConfig.pointsPerNewWord;
    points = Math.min(runtimeConfig.pointsPerNewWord, remaining);
  }
  const hitUid = newUid("evs_text_word");
  const now = nowIso();
  database.insert("stream_events_text_word_hits", {
    hit_uid: hitUid,
    event_uid: event.eventUid,
    phrase_uid: phraseUid,
    phrase_index: phraseIndex,
    phrase_number: phraseIndex + 1,
    word_key: wordKey,
    word_original: wordKey,
    user_login: chat.userLogin,
    user_display_name: chat.userDisplayName,
    points_awarded: points,
    chat_message_id: chat.messageId,
    chat_message: chat.message.slice(0, 500),
    created_at: now,
    metadata_json: jsonEncode({ phrase: getPhraseText(phrase) })
  });
  runtimeState.counters.textWordHits += 1;
  let pointsResult = null;
  if (points > 0) {
    pointsResult = addPoints(event.eventUid, {
      userLogin: chat.userLogin,
      userDisplayName: chat.userDisplayName,
      points,
      sourceType: "text_word_hit",
      sourceUid: hitUid,
      reason: `text_phrase_${phraseIndex + 1}_word_hit`,
      createdBy: MODULE_NAME,
      metadata: { phraseUid, phraseIndex, phraseNumber: phraseIndex + 1, wordKey }
    });
  }
  return { ok: true, hitUid, phraseUid, phraseNumber: phraseIndex + 1, wordKey, points, pointsResult };
}

function processTextChatMessage(chat = {}, options = {}) {
  ensureSchema();
  runtimeState.counters.twitchChatMessages += 1;
  if (!chat.message || !chat.userLogin) {
    runtimeState.counters.textRuntimeSkipped += 1;
    return { ok: false, skipped: true, reason: "invalid_chat_payload" };
  }
  const event = cleanString(options.eventUid) ? getEventByUid(options.eventUid) : getActiveEvent();
  if (!event || !event.textEnabled) {
    runtimeState.counters.textRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "no_active_text_event" };
  }
  const phrases = Array.isArray(event.textConfig && event.textConfig.phrases) ? event.textConfig.phrases : [];
  if (!phrases.length) {
    runtimeState.counters.textRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "active_event_without_text_phrases", eventUid: event.eventUid };
  }

  const runtimeConfig = getTextRuntimeConfig(event);
  const messageTokens = new Set(tokenizeText(chat.message, { minLength: runtimeConfig.tokenMinLength }));
  const solved = [];
  const wordHits = [];
  const chatOutputs = [];

  phrases.forEach((phrase, index) => {
    const phraseText = getPhraseText(phrase);
    if (!phraseText) return;
    const phraseUid = getPhraseUid(phrase, index);
    if (phraseIsSolved(event.eventUid, phraseUid)) return;
    const solvePoints = clampNumber(phrase.pointsFirst ?? phrase.points ?? event.textConfig.defaultPhrasePoints ?? getEventConfig().config.textDefaults.defaultPhrasePoints, 0, 10000, 40);
    if (messageSolvesPhrase(chat.message, phrase)) {
      const result = insertPhraseSolve(event, phrase, index, chat, solvePoints);
      if (result.ok) {
        solved.push(result);
        if (result.chatOutput) {
          chatOutputs.push({
            kind: "phrase_solved",
            phraseUid: result.phraseUid,
            phraseNumber: result.phraseNumber,
            points: result.points,
            ...result.chatOutput
          });
        }
      }
      return;
    }
    if (!runtimeConfig.partialHintsEnabled && !runtimeConfig.wordPointsEnabled) return;
    const phraseTokens = tokenizeText(phraseText, { minLength: runtimeConfig.tokenMinLength });
    for (const wordKey of phraseTokens) {
      if (!messageTokens.has(wordKey)) continue;
      const hit = insertWordHit(event, phrase, index, wordKey, chat, runtimeConfig);
      if (hit.ok) wordHits.push(hit);
    }
  });

  if (wordHits.length > 0) {
    const byPhrase = new Map();
    for (const hit of wordHits) {
      const item = byPhrase.get(hit.phraseUid) || { phraseUid: hit.phraseUid, phraseNumber: hit.phraseNumber, hits: [], points: 0 };
      item.hits.push(hit.wordKey);
      item.points += Number(hit.points || 0);
      byPhrase.set(hit.phraseUid, item);
    }
    for (const item of byPhrase.values()) {
      const totalKnown = getExistingWordHits(event.eventUid, item.phraseUid, chat.userLogin).size;
      const textKey = runtimeConfig.partialHintVisibility === "with_sentence" ? "text.partial.with_sentence" : "text.partial.general";
      const chatContext = {
        user: chat.userDisplayName,
        displayName: chat.userDisplayName,
        wordCount: runtimeConfig.showPartialWordCount ? totalKnown : item.hits.length,
        phraseNumber: item.phraseNumber,
        points: item.points
      };
      const chatOutput = runtimeConfig.partialHintsEnabled ? buildChatOutput(textKey, chatContext, { reason: "text_word_found" }) : null;
      const wordPointsChatOutput = item.points > 0 ? buildChatOutput("text.word_points.added", chatContext, { reason: "text_word_points_added" }) : null;
      if (chatOutput) {
        chatOutputs.push({
          kind: "word_found",
          phraseUid: item.phraseUid,
          phraseNumber: item.phraseNumber,
          points: item.points,
          newWordCount: item.hits.length,
          totalKnownWords: totalKnown,
          ...chatOutput
        });
      }
      if (wordPointsChatOutput) {
        chatOutputs.push({
          kind: "word_points_added",
          phraseUid: item.phraseUid,
          phraseNumber: item.phraseNumber,
          points: item.points,
          newWordCount: item.hits.length,
          totalKnownWords: totalKnown,
          ...wordPointsChatOutput
        });
      }
      emitBus("stream_events.text", "word_found", {
        eventUid: event.eventUid,
        phraseUid: item.phraseUid,
        phraseNumber: item.phraseNumber,
        userLogin: chat.userLogin,
        userDisplayName: chat.userDisplayName,
        newWords: item.hits,
        newWordCount: item.hits.length,
        totalKnownWords: totalKnown,
        points: item.points,
        chatText: chatOutput ? chatOutput.text : "",
        chatOutput,
        wordPointsChatText: wordPointsChatOutput ? wordPointsChatOutput.text : "",
        wordPointsChatOutput
      });
    }
    publishStatus("text.word_found", { lastEventUid: event.eventUid, wordHitCount: wordHits.length });
  }

  if (solved.length > 0 || wordHits.length > 0) markAction("text.chat.processed", event.eventUid);
  runtimeState.counters.textMessagesProcessed += 1;
  return { ok: true, eventUid: event.eventUid, solved, wordHits, chatOutputs, solvedCount: solved.length, wordHitCount: wordHits.length, chatOutputCount: chatOutputs.length };
}

function processParallelChatMessage(chat = {}, context = {}) {
  const source = cleanString(context.source, "api:parallel-test-chat");
  const busChat = source === "bus:twitch.chat.message" || source.startsWith("bus:");
  const event = cleanString(context.eventUid) ? getEventByUid(context.eventUid) : getActiveEvent();
  const runtimeGate = getRuntimeGateStatus({ eventUid: event ? event.eventUid : "" });
  if (busChat && !runtimeGate.active) {
    runtimeState.counters.textRuntimeSkipped += 1;
    runtimeState.counters.soundRuntimeSkipped += 1;
    runtimeState.counters.runtimeGateSkipped += 1;
    if (runtimeGate.reason === "no_active_event") runtimeState.counters.runtimeGateNoActiveEvent += 1;
    if (String(runtimeGate.reason || "").startsWith("stream_")) runtimeState.counters.runtimeGateStreamOffline += 1;
    return { ok: true, skipped: true, reason: runtimeGate.reason || "runtime_gate_inactive", source, runtimeGate };
  }
  if (!event) {
    runtimeState.counters.textRuntimeSkipped += 1;
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "no_active_chat_runtime", source, runtimeGate };
  }

  const result = {
    ok: true,
    source,
    eventUid: event.eventUid,
    mode: "sound_text_parallel_and",
    soundEnabled: event.soundEnabled === true,
    textEnabled: event.textEnabled === true,
    sound: null,
    text: null,
    soundSolved: false,
    textSolved: false,
    textWordHitCount: 0,
    solved: false,
    handled: false,
    handledBy: [],
    chatOutputs: [],
    chatOutputCount: 0,
    directSend: false,
    directPlayback: false,
    soundSystemQueueTouched: false,
    runtimeGate,
    note: "EVS-24: Chat wird nur bei aktivem Event und online erkanntem Stream fuer stream_events ausgewertet. Sound blockiert Text nicht, Text blockiert Sound nicht."
  };

  if (!event.soundEnabled && !event.textEnabled) {
    runtimeState.counters.textRuntimeSkipped += 1;
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "active_event_without_chat_runtime", eventUid: event.eventUid, source, runtimeGate };
  }

  if (event.soundEnabled) {
    const soundResult = processSoundChatMessage(chat, { source, eventUid: event.eventUid });
    result.sound = soundResult;
    result.handled = true;
    result.handledBy.push("sound");
    result.soundSolved = !!(soundResult && soundResult.ok === true && soundResult.solved === true);
    if (Array.isArray(soundResult && soundResult.chatOutputs)) {
      result.chatOutputs.push(...soundResult.chatOutputs);
    }
  }

  if (event.textEnabled) {
    const textResult = processTextChatMessage(chat, { source, eventUid: event.eventUid });
    result.text = textResult;
    result.handled = true;
    result.handledBy.push("text");
    result.textSolved = !!(textResult && Number(textResult.solvedCount || 0) > 0);
    result.textWordHitCount = Number(textResult && textResult.wordHitCount || 0);
    if (Array.isArray(textResult && textResult.chatOutputs)) {
      result.chatOutputs.push(...textResult.chatOutputs);
    }
  }

  result.solved = result.soundSolved || result.textSolved;
  result.chatOutputCount = result.chatOutputs.length;
  result.reason = result.handled ? "parallel_chat_runtime_processed" : "chat_runtime_not_handled";
  return result;
}

function handleTwitchChatEnvelope(envelope = {}) {
  const chat = extractChatPayload(envelope);
  runtimeState.counters.twitchChatMessages += 1;
  return processParallelChatMessage(chat, { source: "bus:twitch.chat.message" });
}

function registerTextChatSubscription() {
  const bus = getBus();
  if (!bus || typeof bus.subscribe !== "function") return { ok: false, reason: "communication_bus_subscribe_unavailable" };
  const result = bus.subscribe({
    id: `${MODULE_NAME}:twitch.chat.message`,
    module: MODULE_NAME,
    channel: "twitch.chat",
    action: "message",
    meta: { step: MODULE_BUILD, purpose: "stream_events_chat_runtime", acceptedSources: ["twitch_presence", "twitch_events"] }
  }, (envelope) => handleTwitchChatEnvelope(envelope));
  if (result && result.ok === true) {
    publishStatus("chat.subscription.ready", { twitchChatSubscription: true, streamEventsChatRuntime: true });
  }
  return result;
}

function normalizeSoundSnippet(snippet = {}, index = 0) {
  const raw = snippet && typeof snippet === "object" ? snippet : {};
  const mediaId = cleanString(raw.mediaId || raw.snippetMediaId || raw.media_id || raw.mediaPath || raw.file || raw.path);
  const snippetUid = cleanString(raw.uid || raw.snippetUid || raw.id || raw.key || mediaId, `sound_snippet_${index + 1}`);
  const title = cleanString(raw.title || raw.name || raw.label || `Sound-Schnipsel ${index + 1}`);
  const acceptedAnswers = Array.isArray(raw.acceptedAnswers) ? raw.acceptedAnswers : (Array.isArray(raw.answers) ? raw.answers : []);
  return {
    snippetUid,
    index,
    number: index + 1,
    title,
    mediaId,
    mediaPath: cleanString(raw.mediaPath || raw.file || raw.path),
    revealVideoId: cleanString(raw.revealVideoId || raw.videoMediaId || raw.revealMediaId),
    acceptedAnswers: acceptedAnswers.map(cleanString).filter(Boolean),
    points: clampNumber(raw.points ?? raw.firstPoints ?? raw.score, 0, 10000, 10),
    answerSeconds: clampNumber(raw.answerSeconds ?? raw.seconds, 5, 300, 20),
    raw: safeJson(raw, {})
  };
}

function getSoundSnippets(event = {}) {
  const raw = event && event.soundConfig && typeof event.soundConfig === "object" ? event.soundConfig : {};
  const snippets = Array.isArray(raw.snippets) ? raw.snippets : [];
  return snippets.map((snippet, index) => normalizeSoundSnippet(snippet, index)).filter(item => item.mediaId || item.mediaPath || item.title);
}

function getSoundRuntimeConfig(event = {}) {
  const globalConfig = getEventConfig().config || DEFAULT_EVENT_CONFIG;
  const soundDefaults = globalConfig.soundDefaults || DEFAULT_EVENT_CONFIG.soundDefaults || {};
  const eventConfig = event && event.soundConfig && typeof event.soundConfig === "object" ? event.soundConfig : {};
  const settings = normalizeSoundEventSettings(eventConfig, soundDefaults);
  return {
    ...settings,
    directPlaybackEnabled: false,
    outputPreparedOnly: true
  };
}

function buildSoundAcceptedAnswersDebug(snippet = {}) {
  const answers = Array.isArray(snippet.acceptedAnswers) ? snippet.acceptedAnswers.map(cleanString).filter(Boolean) : [];
  return {
    testOnly: true,
    visibleFor: "dashboard_api_debug_only",
    acceptedAnswerCount: answers.length,
    acceptedAnswers: answers,
    acceptedAnswersText: answers.join(" | "),
    note: "Nur fuer Dashboard/API-Test sichtbar. Nicht fuer Overlay oder Twitch-Chat verwenden."
  };
}

function buildSoundPreRollPlan(runtimeConfig = {}) {
  const configuredPreRoll = boolValue(runtimeConfig.preRollEnabled, false);
  const configuredCountdown = boolValue(runtimeConfig.countdownPreRollEnabled, false);
  const preRollSeconds = clampNumber(runtimeConfig.preRollSeconds, 0, 30, 3);
  const countdownSeconds = clampNumber(runtimeConfig.countdownPreRollSeconds, 0, 30, preRollSeconds);

  return {
    planned: true,
    mode: "planned_only",
    extensionPoint: "stream_events.before_sound_system_play_request",
    configuredPreRollEnabled: configuredPreRoll,
    configuredCountdownEnabled: configuredCountdown,
    effectivePreRollEnabled: false,
    effectiveCountdownEnabled: false,
    preRollSeconds,
    countdownSeconds,
    queueTouched: false,
    audioTouched: false,
    note: "SOUND-SAFE-1 legt nur den Erweiterungspunkt fest. PreRoll/Countdown werden noch nicht ausgefuehrt."
  };
}

function buildSoundRuntimeSafetyPlan(eventUid = "") {
  const status = getSoundRuntimeStatus(eventUid);
  const runtimeConfig = status.runtimeConfig || getSoundRuntimeConfig(null);

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    step: "SOUND-SAFE-1",
    purpose: "Sound-System-Pruefung und sicherer Erweiterungspunkt fuer EventSound-Playback + Countdown-PreRoll.",
    currentMode: {
      preparedOnly: true,
      directPlayback: false,
      soundSystemQueueTouched: false,
      audioTouched: false
    },
    soundSystemEntryPoints: {
      readOnlyContract: "/api/sound/eventbus/command/contract",
      safeDryRun: "/api/sound/eventbus/command/dry-run",
      explicitManualPlayTest: "/api/sound/eventbus/command/play-test",
      legacyProductivePlay: "/api/sound/play",
      status: "/api/sound/status",
      queue: "/api/sound/queue"
    },
    selectedExtensionPoint: {
      name: "before_sound_system_play_request",
      ownerModule: MODULE_NAME,
      location: "buildSoundPlaybackPayload(event, round, snippet, runtimeConfig)",
      executionOrder: [
        "create sound round",
        "prepare playback payload",
        "optional preRoll/countdown window",
        "validate via sound-system dry-run",
        "single explicit sound-system play request",
        "answer window and solve/unresolved handling"
      ],
      reason: "Das Eventsystem bleibt Owner von Runde/Antwortzeit. Das Sound-System bleibt Owner von Queue/Playback.",
      currentStepExecutesPlayback: false
    },
    preRollPlan: buildSoundPreRollPlan(runtimeConfig),
    safetyRules: {
      noSoundSystemCodeChangedInThisStep: true,
      noQueueTouchInThisStep: true,
      noAudioTouchInThisStep: true,
      noOverlayPlaybackChangeInThisStep: true,
      noDatabaseDataMigration: true,
      dryRunBeforeFuturePlaybackRequired: true,
      useExistingSoundSystemEntryPoints: true
    },
    nextImplementationGate: {
      requiredBeforePlayback: [
        "sound-system status ok pruefen",
        "payload gegen /api/sound/eventbus/command/dry-run validieren",
        "genau einen produktiven Entry-Point festlegen",
        "Countdown/PreRoll darf Sound-System-Queue nicht mehrfach anfassen",
        "Antwortfenster erst nach akzeptiertem Sound-Start starten"
      ],
      recommendedFirstPlaybackRoute: "/api/sound/eventbus/command/play-test fuer manuelle Tests, danach produktive Route separat freigeben"
    },
    activeRuntime: {
      activeEvent: status.activeEvent || null,
      activeRound: status.activeRound || null,
      snippets: status.snippets || [],
      counters: status.counters || {}
    },
    updatedAt: nowIso()
  };
}


function publicRoundOverlaySummary(round, options = {}) {
  if (!round) return null;
  const reveal = options.reveal === true;
  const config = round.config && typeof round.config === "object" ? round.config : {};
  const snippet = config.snippet && typeof config.snippet === "object" ? config.snippet : {};
  const resultData = round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  const answerSeconds = clampNumber(config.answerSeconds, 0, 3600, 0);
  return {
    roundUid: round.roundUid || "",
    eventUid: round.eventUid || "",
    gameType: round.gameType || "sound",
    status: round.status || "",
    startedAt: round.startedAt || "",
    finishedAt: round.finishedAt || "",
    answerSeconds,
    itemVisible: reveal,
    item: reveal ? {
      title: cleanString(snippet.title || snippet.name || ""),
      mediaId: cleanString(snippet.mediaId || snippet.media_id || ""),
      points: clampNumber(snippet.points, 0, 10000, 0),
      result: cleanString(round.result || resultData.result || "")
    } : {
      titleHidden: true,
      mediaHidden: true,
      reason: "active_answer_window_or_viewer_safe_state"
    }
  };
}

function buildRuntimeOverlayPhase(event, activeRound, latestRound) {
  if (!event) {
    return { key: "idle", label: "Kein aktives Event", visible: false, reason: "no_event" };
  }
  const status = normalizeStatus(event.status, event.status || STATUS.DRAFT);
  if (status === STATUS.DRAFT || status === STATUS.READY) {
    return { key: "event_ready", label: "Event bereit", visible: false, reason: `event_${status}` };
  }
  if (status === STATUS.CANCELLED) {
    return { key: "cancelled", label: "Event abgebrochen", visible: true, reason: "event_cancelled" };
  }
  if (status === STATUS.ARCHIVED) {
    return { key: "archived", label: "Event archiviert", visible: false, reason: "event_archived" };
  }
  if (status === STATUS.FINISHED) {
    return { key: "finished", label: "Event beendet", visible: true, reason: "event_finished" };
  }
  if (status === STATUS.ACTIVE) {
    if (event.soundEnabled && activeRound) {
      return { key: "sound_answer_window", label: "Soundrunde aktiv", visible: true, reason: "active_sound_round" };
    }
    if (event.soundEnabled && latestRound && latestRound.status === "solved") {
      return { key: "sound_solved", label: "Sound erkannt", visible: true, reason: "latest_sound_round_solved" };
    }
    if (event.soundEnabled && latestRound && latestRound.status === "unresolved") {
      return { key: "sound_unresolved", label: "Sound nicht erkannt", visible: true, reason: "latest_sound_round_unresolved" };
    }
    if (event.soundEnabled) {
      return { key: "sound_waiting", label: "Soundrunde wartet", visible: true, reason: "sound_enabled_no_active_round" };
    }
    if (event.textEnabled) {
      return { key: "text_active", label: "Textevent aktiv", visible: true, reason: "text_event_active" };
    }
    return { key: "event_active", label: "Event aktiv", visible: true, reason: "event_active_without_runtime" };
  }
  return { key: "unknown", label: "Eventstatus unbekannt", visible: false, reason: `status_${status || "unknown"}` };
}

function buildRuntimeOverlayDisplay(event, phase, activeRound, latestRound, ranking) {
  const eventName = event ? cleanString(event.name || "Event") : "Eventsystem";
  const top3 = ranking && Array.isArray(ranking.top3) ? ranking.top3.map(row => ({
    rank: row.rank,
    userLogin: row.userLogin,
    userDisplayName: row.userDisplayName,
    points: row.points
  })) : [];
  let headline = "Eventsystem";
  let subline = "Bereit";
  if (phase.key === "idle") {
    headline = "Eventsystem";
    subline = "Kein aktives Event";
  } else if (phase.key === "sound_answer_window") {
    headline = "Soundrunde läuft";
    subline = "Jetzt im Chat raten!";
  } else if (phase.key === "sound_solved") {
    headline = "Richtig erkannt";
    subline = "Die Heimleitung notiert die Punkte.";
  } else if (phase.key === "sound_unresolved") {
    headline = "Nicht erkannt";
    subline = "Der Schnipsel bleibt erstmal in der CGN-Schublade.";
  } else if (phase.key === "sound_waiting") {
    headline = eventName;
    subline = "Nächste Soundrunde wird vorbereitet.";
  } else if (phase.key === "text_active") {
    headline = eventName;
    subline = "Textrunde aktiv.";
  } else if (phase.key === "finished") {
    headline = `${eventName} beendet`;
    subline = top3.length ? "Die Rentnerwertung ist ausgezählt." : "Die Heimleitung zählt nach.";
  } else if (phase.key === "cancelled") {
    headline = `${eventName} abgebrochen`;
    subline = "Die Runde wurde gestoppt.";
  } else {
    headline = eventName;
    subline = phase.label || "Event aktiv";
  }
  const roundForTimer = activeRound || latestRound || null;
  const answerSeconds = roundForTimer && roundForTimer.config ? clampNumber(roundForTimer.config.answerSeconds, 0, 3600, 0) : 0;
  return {
    headline,
    subline,
    eventName,
    phaseLabel: phase.label || "",
    answerSeconds,
    showCountdown: phase.key === "sound_answer_window" && answerSeconds > 0,
    showTop3: top3.length > 0,
    top3
  };
}

function getRuntimeOverlayState(eventUid = "") {
  ensureSchema();
  const selectedEvent = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  const uid = selectedEvent ? selectedEvent.eventUid : cleanString(eventUid);
  const activeEvent = getActiveEvent();
  const activeRound = uid ? getActiveSoundRound(uid) : null;
  const latestRound = uid ? (getSoundRounds(uid, 1)[0] || null) : null;
  const runtimeConfig = selectedEvent ? getSoundRuntimeConfig(selectedEvent) : getSoundRuntimeConfig(null);
  const phase = buildRuntimeOverlayPhase(selectedEvent, activeRound, latestRound);
  const ranking = uid ? getRanking(uid) : { ok: true, eventUid: "", count: 0, rows: [], top3: [] };
  const revealLatest = ["sound_solved", "sound_unresolved", "finished", "cancelled"].includes(phase.key);
  const overlayConfig = (getEventConfig().config || DEFAULT_EVENT_CONFIG).overlayDefaults || DEFAULT_EVENT_CONFIG.overlayDefaults;

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    step: "EVENT-RUNTIME-1",
    purpose: "Read-only State-Vertrag fuer das spaetere kombinierte Event-Runtime-Overlay.",
    mode: {
      readOnly: true,
      overlayBuilt: false,
      directPlayback: false,
      soundSystemQueueTouched: false,
      audioTouched: false,
      databaseWrite: false,
      viewerSafe: true
    },
    overlay: {
      plannedFile: "htdocs/overlays/stream_events/event_runtime_overlay.html",
      stateRoute: "/api/stream-events/runtime-overlay/state",
      pollMs: clampNumber(overlayConfig.runtimeOverlayPollMs, 300, 5000, 900),
      busHeartbeatScript: "/overlays/shared/overlay_bus_client.js",
      refreshViaBusPlanned: true,
      moduleName: MODULE_NAME
    },
    activeEvent: publicEventSummary(activeEvent),
    event: publicEventSummary(selectedEvent),
    eventUid: uid,
    phase,
    display: buildRuntimeOverlayDisplay(selectedEvent, phase, activeRound, latestRound, ranking),
    sound: {
      enabled: !!(selectedEvent && selectedEvent.soundEnabled),
      activeRound: publicRoundOverlaySummary(activeRound, { reveal: false }),
      latestRound: publicRoundOverlaySummary(latestRound, { reveal: revealLatest }),
      snippetCount: selectedEvent ? getSoundSnippets(selectedEvent).length : 0,
      runtimeConfig: {
        answerSeconds: runtimeConfig.answerSeconds,
        playbackMode: runtimeConfig.playbackMode,
        preRollEnabled: runtimeConfig.preRollEnabled,
        preRollSeconds: runtimeConfig.preRollSeconds,
        countdownPreRollEnabled: runtimeConfig.countdownPreRollEnabled,
        countdownPreRollSeconds: runtimeConfig.countdownPreRollSeconds
      },
      preRollPlan: buildSoundPreRollPlan(runtimeConfig)
    },
    text: {
      enabled: !!(selectedEvent && selectedEvent.textEnabled)
    },
    ranking: {
      count: ranking.count || 0,
      top3: Array.isArray(ranking.top3) ? ranking.top3.map(row => ({ rank: row.rank, userLogin: row.userLogin, userDisplayName: row.userDisplayName, points: row.points })) : []
    },
    safetyRules: {
      noAcceptedAnswersInOverlayState: true,
      noFullSnippetListInOverlayState: true,
      noSoundSystemOverlayChange: true,
      noSoundSystemPlaybackChange: true,
      countdownOverlayWillBeEventOwned: true,
      resultOverlayWillUseSameCombinedOverlay: true
    },
    updatedAt: nowIso()
  };
}


function rowToRound(row) {
  if (!row) return null;
  return {
    roundUid: row.round_uid,
    eventUid: row.event_uid,
    gameType: row.game_type,
    status: row.status,
    itemUid: row.item_uid || "",
    result: row.result || "",
    startedAt: row.started_at || "",
    finishedAt: row.finished_at || "",
    config: safeJsonParse(row.config_json, {}),
    resultData: safeJsonParse(row.result_json, {}),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function getActiveSoundRound(eventUid = "") {
  ensureSchema();
  const params = {};
  const where = ["game_type = 'sound'", "status = 'active'"];
  if (cleanString(eventUid)) {
    where.push("event_uid = :eventUid");
    params.eventUid = cleanString(eventUid);
  }
  const row = database.get(`
    SELECT * FROM stream_events_rounds
    WHERE ${where.join(" AND ")}
    ORDER BY started_at DESC, id DESC
    LIMIT 1
  `, params);
  return rowToRound(row);
}

function getSoundRounds(eventUid, limit = 100) {
  ensureSchema();
  return database.all(`
    SELECT * FROM stream_events_rounds
    WHERE event_uid = :eventUid AND game_type = 'sound'
    ORDER BY created_at DESC, id DESC
    LIMIT :limit
  `, { eventUid, limit: clampNumber(limit, 1, 500, 100) }).map(rowToRound);
}

function pickNextSoundSnippet(event, options = {}) {
  const snippets = getSoundSnippets(event);
  if (!snippets.length) return { ok: false, error: "sound_no_snippets" };
  const rounds = getSoundRounds(event.eventUid, 500);
  const blockedStatuses = new Set(["active", "solved"]);
  const used = new Set(rounds.filter(row => blockedStatuses.has(row.status)).map(row => row.itemUid).filter(Boolean));
  const active = rounds.find(row => row.status === "active");
  if (active) return { ok: false, error: "sound_round_already_active", activeRound: active };
  let candidates = snippets.filter(item => !used.has(item.snippetUid));
  if (!candidates.length && options.allowReuse === true) candidates = snippets.slice();
  if (!candidates.length) return { ok: false, error: "sound_no_unused_snippet", used: used.size, total: snippets.length };
  const runtimeConfig = getSoundRuntimeConfig(event);
  if (runtimeConfig.avoidImmediateRepeat && candidates.length > 1) {
    const last = rounds[0] ? rounds[0].itemUid : "";
    candidates = candidates.filter(item => item.snippetUid !== last);
  }
  const selected = candidates[0];
  return { ok: true, snippet: selected, runtimeConfig, total: snippets.length, remaining: candidates.length };
}

function buildSoundPlaybackPayload(event, round, snippet, runtimeConfig) {
  return {
    prepared: true,
    directPlay: false,
    target: "sound_system",
    via: "bus_payload",
    channel: "sound.command",
    action: "play.request.prepared",
    reason: "stream_events_sound_round_prepared",
    soundSystemTouched: false,
    queueTouched: false,
    item: {
      sourceModule: MODULE_NAME,
      eventUid: event.eventUid,
      roundUid: round.roundUid,
      snippetUid: snippet.snippetUid,
      mediaId: snippet.mediaId,
      mediaPath: snippet.mediaPath,
      label: snippet.title,
      category: "stream_event_sound_snippet",
      requestedBy: MODULE_NAME,
      priority: 70,
      outputTarget: "overlay"
    },
    preRoll: buildSoundPreRollPlan(runtimeConfig),
    meta: {
      preparedAt: nowIso(),
      answerSeconds: runtimeConfig.answerSeconds,
      soundSafeStep: "SOUND-SAFE-1",
      extensionPoint: "stream_events.before_sound_system_play_request",
      note: "SOUND-SAFE-1 bereitet nur die Sound-System-Anforderung und den PreRoll-Erweiterungspunkt vor. Abspielen/Queue-Touch kommt in einem spaeteren Step."
    }
  };
}

function createSoundRound(options = {}) {
  ensureSchema();
  const event = cleanString(options.eventUid) ? getEventByUid(options.eventUid) : getActiveEvent();
  if (!event) return { ok: false, error: "active_event_missing" };
  if (event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: event.eventUid, status: event.status };
  if (!event.soundEnabled) return { ok: false, error: "sound_not_enabled", eventUid: event.eventUid };
  const picked = pickNextSoundSnippet(event, options);
  if (!picked.ok) return { ok: false, eventUid: event.eventUid, ...picked };
  const snippet = picked.snippet;
  const runtimeConfig = picked.runtimeConfig;
  const roundUid = newUid("evs_sound_round");
  const now = nowIso();
  const roundConfig = {
    snippet,
    runtimeConfig,
    answerSeconds: clampNumber(snippet.answerSeconds || runtimeConfig.answerSeconds, 5, 300, runtimeConfig.answerSeconds)
  };
  database.insert("stream_events_rounds", {
    round_uid: roundUid,
    event_uid: event.eventUid,
    game_type: "sound",
    status: "active",
    item_uid: snippet.snippetUid,
    result: "",
    started_at: now,
    finished_at: "",
    config_json: jsonEncode(roundConfig),
    result_json: jsonEncode({ preparedOnly: true }),
    created_at: now,
    updated_at: now
  });
  const round = getActiveSoundRound(event.eventUid);
  const playback = buildSoundPlaybackPayload(event, round, snippet, runtimeConfig);
  const chatOutput = buildChatOutput("sound.round.started", {
    title: snippet.title,
    soundTitle: snippet.title,
    answerSeconds: roundConfig.answerSeconds,
    points: snippet.points || runtimeConfig.defaultPoints
  }, { reason: "sound_round_started" });
  runtimeState.counters.soundRoundsPrepared += 1;
  runtimeState.counters.soundRoundsStarted += 1;
  markAction("sound.round.started", event.eventUid);
  emitBus("stream_events.sound", "round_started", { eventUid: event.eventUid, round, snippet: safeJson(snippet, {}), playback, chatOutput });
  publishStatus("sound.round_started", { lastEventUid: event.eventUid, roundUid });
  return { ok: true, eventUid: event.eventUid, round, snippet, acceptedAnswersDebug: buildSoundAcceptedAnswersDebug(snippet), playback, chatOutput, directPlayback: false };
}

function answerMatchesSoundSnippet(answer, snippet = {}) {
  const normalized = normalizeTextValue(answer);
  if (!normalized) return false;
  const answers = normalizeAcceptedAnswers(snippet.acceptedAnswers || []);
  return answers.some(item => item === normalized);
}

function resolveSoundRound(body = {}) {
  ensureSchema();
  const round = getActiveSoundRound(body.eventUid || "");
  if (!round) return { ok: false, error: "active_sound_round_missing" };
  const event = getEventByUid(round.eventUid);
  if (!event || event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: round.eventUid };
  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const userLogin = cleanString(body.userLogin || body.login || body.user).replace(/^@/, "").toLowerCase();
  const userDisplayName = cleanString(body.userDisplayName || body.displayName || body.user, userLogin);
  const answer = cleanString(body.answer || body.message || body.text);
  if (!userLogin) return { ok: false, error: "user_login_required" };
  if (!answer) return { ok: false, error: "answer_required" };
  const correct = answerMatchesSoundSnippet(answer, snippet);
  if (!correct) return { ok: true, solved: false, reason: "answer_not_accepted", eventUid: event.eventUid, roundUid: round.roundUid };
  const points = clampNumber(body.points ?? snippet.points ?? getSoundRuntimeConfig(event).defaultPoints, 0, 10000, 10);
  const now = nowIso();
  const resultData = { solved: true, userLogin, userDisplayName, answer, points, solvedAt: now, chatMessageId: cleanString(body.messageId || body.chatMessageId || body.message_id) };
  database.updateByKey("stream_events_rounds", "round_uid", round.roundUid, {
    status: "solved",
    result: "solved",
    finished_at: now,
    updated_at: now,
    result_json: jsonEncode(resultData)
  });
  const pointsResult = points > 0 ? addPoints(event.eventUid, {
    userLogin,
    userDisplayName,
    points,
    sourceType: "sound_solved",
    sourceUid: round.roundUid,
    reason: "sound_snippet_solved",
    createdBy: MODULE_NAME,
    metadata: { roundUid: round.roundUid, snippetUid: snippet.snippetUid, title: snippet.title, answer, chatMessageId: cleanString(body.messageId || body.chatMessageId || body.message_id) }
  }) : { ok: true, ranking: getRanking(event.eventUid).rows };
  const chatOutput = buildChatOutput("sound.solved", { user: userDisplayName, displayName: userDisplayName, title: snippet.title, soundTitle: snippet.title, points }, { reason: "sound_solved" });
  runtimeState.counters.soundRoundsSolved += 1;
  markAction("sound.round.solved", event.eventUid);
  const updatedRound = database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid", { roundUid: round.roundUid });
  emitBus("stream_events.sound", "solved", { eventUid: event.eventUid, round: rowToRound(updatedRound), userLogin, userDisplayName, answer, points, chatOutput, ranking: pointsResult.ranking || [] });
  publishStatus("sound.solved", { lastEventUid: event.eventUid, roundUid: round.roundUid });
  return { ok: true, solved: true, eventUid: event.eventUid, roundUid: round.roundUid, points, chatOutput, pointsResult };
}


function processSoundChatMessage(chat = {}, options = {}) {
  ensureSchema();
  if (!chat.message || !chat.userLogin) {
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: false, skipped: true, reason: "invalid_chat_payload" };
  }
  const event = cleanString(options.eventUid) ? getEventByUid(options.eventUid) : getActiveEvent();
  if (!event || !event.soundEnabled) {
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "no_active_sound_event" };
  }
  const round = getActiveSoundRound(event.eventUid);
  if (!round) {
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "no_active_sound_round", eventUid: event.eventUid };
  }
  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const answer = cleanString(chat.message);
  const userLogin = cleanString(chat.userLogin).replace(/^@/, "").toLowerCase();
  const userDisplayName = cleanString(chat.userDisplayName || chat.displayName || userLogin, userLogin);
  const correct = answerMatchesSoundSnippet(answer, snippet);
  runtimeState.counters.soundChatMessagesProcessed += 1;

  if (!correct) {
    runtimeState.counters.soundAnswerMisses += 1;
    emitBus("stream_events.sound", "answer_missed", {
      eventUid: event.eventUid,
      roundUid: round.roundUid,
      snippetUid: snippet.snippetUid || round.itemUid,
      userLogin,
      userDisplayName,
      answer,
      messageId: cleanString(chat.messageId),
      preparedOnly: true,
      directSend: false
    });
    publishStatus("sound.answer_missed", { lastEventUid: event.eventUid, roundUid: round.roundUid });
    return {
      ok: true,
      solved: false,
      reason: "answer_not_accepted",
      eventUid: event.eventUid,
      roundUid: round.roundUid,
      snippetUid: snippet.snippetUid || round.itemUid,
      userLogin,
      answer,
      chatOutputs: [],
      chatOutputCount: 0
    };
  }

  const result = resolveSoundRound({
    eventUid: event.eventUid,
    userLogin,
    userDisplayName,
    answer,
    messageId: cleanString(chat.messageId),
    source: cleanString(options.source || "sound_chat_runtime")
  });
  if (result && result.ok === true && result.solved === true) {
    runtimeState.counters.soundAnswerMatches += 1;
    const chatOutputs = result.chatOutput ? [{
      kind: "sound_solved",
      roundUid: result.roundUid,
      points: result.points,
      ...result.chatOutput
    }] : [];
    return {
      ...result,
      source: cleanString(options.source || "sound_chat_runtime"),
      snippetUid: snippet.snippetUid || round.itemUid,
      userLogin,
      userDisplayName,
      answer,
      chatOutputs,
      chatOutputCount: chatOutputs.length
    };
  }
  return result;
}

function markSoundRoundUnresolved(body = {}) {
  ensureSchema();
  const round = getActiveSoundRound(body.eventUid || "");
  if (!round) return { ok: false, error: "active_sound_round_missing" };
  const event = getEventByUid(round.eventUid);
  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const runtimeConfig = getSoundRuntimeConfig(event);
  const now = nowIso();
  const policy = cleanString(body.policy || runtimeConfig.unresolvedPolicy, "requeue_later");
  const resultData = { solved: false, policy, reason: cleanString(body.reason || "manual_unresolved"), unresolvedAt: now };
  database.updateByKey("stream_events_rounds", "round_uid", round.roundUid, {
    status: "unresolved",
    result: "unresolved",
    finished_at: now,
    updated_at: now,
    result_json: jsonEncode(resultData)
  });
  const chatOutput = buildChatOutput("sound.unresolved", { title: snippet.title, soundTitle: snippet.title, policy }, { reason: "sound_unresolved" });
  runtimeState.counters.soundRoundsUnresolved += 1;
  markAction("sound.round.unresolved", round.eventUid);
  emitBus("stream_events.sound", "unresolved", { eventUid: round.eventUid, roundUid: round.roundUid, policy, chatOutput });
  publishStatus("sound.unresolved", { lastEventUid: round.eventUid, roundUid: round.roundUid });
  return { ok: true, eventUid: round.eventUid, roundUid: round.roundUid, policy, chatOutput };
}

function getSoundRuntimeStatus(eventUid = "") {
  ensureSchema();
  const event = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  const activeRound = event ? getActiveSoundRound(event.eventUid) : null;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    activeEvent: publicEventSummary(event),
    activeSoundRuntime: Boolean(event && event.status === STATUS.ACTIVE && event.soundEnabled),
    activeRound,
    snippets: event ? getSoundSnippets(event).map(item => ({ snippetUid: item.snippetUid, title: item.title, mediaId: item.mediaId, acceptedAnswerCount: item.acceptedAnswers.length, acceptedAnswersDebug: buildSoundAcceptedAnswersDebug(item), points: item.points })) : [],
    runtimeConfig: event ? getSoundRuntimeConfig(event) : getSoundRuntimeConfig(null),
    counters: safeJson(runtimeState.counters, {}),
    rules: {
      preparedOnly: true,
      directPlayback: false,
      soundSystemQueueTouched: false,
      preRollExtensionPointPrepared: true,
      safetyPlanRoute: "/api/stream-events/sound-runtime/safety-plan",
      oneActiveSoundRoundPerEvent: true,
      solvedRoundsRemovedFromRotation: true,
      unresolvedPolicyPrepared: true
    },
    updatedAt: nowIso()
  };
}

function buildSoundReportDerivedOutputs(event, rounds = []) {
  const chatOutputs = [];
  const playbackPayloads = [];
  for (const round of rounds) {
    const snippet = round && round.config && round.config.snippet ? round.config.snippet : {};
    const runtimeConfig = round && round.config && round.config.runtimeConfig ? round.config.runtimeConfig : getSoundRuntimeConfig(event);
    if (!round || !round.roundUid) continue;
    if (round.status === "active") {
      playbackPayloads.push(buildSoundPlaybackPayload(event, round, snippet, runtimeConfig));
      chatOutputs.push({
        kind: "sound_round_started",
        roundUid: round.roundUid,
        snippetUid: snippet.snippetUid || round.itemUid || "",
        title: snippet.title || round.itemUid || "",
        status: round.status,
        createdAt: round.startedAt || round.createdAt || "",
        ...buildChatOutput("sound.round.started", {
          title: snippet.title || "Sound-Schnipsel",
          soundTitle: snippet.title || "Sound-Schnipsel",
          answerSeconds: round.config && round.config.answerSeconds ? round.config.answerSeconds : runtimeConfig.answerSeconds,
          points: snippet.points || runtimeConfig.defaultPoints
        }, { reason: "sound_report_round_started" })
      });
    } else if (round.status === "solved" || round.result === "solved") {
      const result = round.resultData || {};
      chatOutputs.push({
        kind: "sound_solved",
        roundUid: round.roundUid,
        snippetUid: snippet.snippetUid || round.itemUid || "",
        title: snippet.title || round.itemUid || "",
        status: round.status,
        createdAt: round.finishedAt || round.updatedAt || "",
        userLogin: result.userLogin || "",
        userDisplayName: result.userDisplayName || result.userLogin || "",
        answer: result.answer || "",
        points: Number(result.points || snippet.points || runtimeConfig.defaultPoints || 0),
        ...buildChatOutput("sound.solved", {
          user: result.userDisplayName || result.userLogin || "",
          displayName: result.userDisplayName || result.userLogin || "",
          title: snippet.title || "Sound-Schnipsel",
          soundTitle: snippet.title || "Sound-Schnipsel",
          points: Number(result.points || snippet.points || runtimeConfig.defaultPoints || 0)
        }, { reason: "sound_report_solved" })
      });
    } else if (round.status === "unresolved" || round.result === "unresolved") {
      const result = round.resultData || {};
      chatOutputs.push({
        kind: "sound_unresolved",
        roundUid: round.roundUid,
        snippetUid: snippet.snippetUid || round.itemUid || "",
        title: snippet.title || round.itemUid || "",
        status: round.status,
        createdAt: round.finishedAt || round.updatedAt || "",
        policy: result.policy || runtimeConfig.unresolvedPolicy || "",
        ...buildChatOutput("sound.unresolved", {
          title: snippet.title || "Sound-Schnipsel",
          soundTitle: snippet.title || "Sound-Schnipsel",
          policy: result.policy || runtimeConfig.unresolvedPolicy || ""
        }, { reason: "sound_report_unresolved" })
      });
    }
  }
  return { chatOutputs, playbackPayloads };
}

function getSoundRuntimeReport(eventUid = "") {
  ensureSchema();
  const event = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  const uid = event ? event.eventUid : cleanString(eventUid);
  if (!uid) return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, event: null, rounds: [], chatOutputs: [], playbackPayloads: [], note: "Kein aktives Event und keine eventUid angegeben.", updatedAt: nowIso() };
  const eventRow = event || getEventByUid(uid);
  const rounds = getSoundRounds(uid, 200);
  const scoreRows = database.all(`
    SELECT * FROM stream_events_score_entries
    WHERE event_uid = :eventUid AND source_type LIKE 'sound%'
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `, { eventUid: uid }).map(row => ({
    entryUid: row.entry_uid,
    eventUid: row.event_uid,
    userLogin: row.user_login,
    userDisplayName: row.user_display_name || row.user_login,
    sourceType: row.source_type,
    sourceUid: row.source_uid,
    reason: row.reason,
    points: Number(row.points || 0),
    createdAt: row.created_at,
    metadata: safeJsonParse(row.metadata_json, {})
  }));
  const derived = buildSoundReportDerivedOutputs(eventRow || {}, rounds);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    activeEvent: publicEventSummary(getActiveEvent()),
    event: publicEventSummary(eventRow),
    eventUid: uid,
    counts: {
      rounds: rounds.length,
      active: rounds.filter(row => row.status === "active").length,
      solved: rounds.filter(row => row.status === "solved").length,
      unresolved: rounds.filter(row => row.status === "unresolved").length,
      soundScoreEntries: scoreRows.length,
      chatOutputs: derived.chatOutputs.length,
      playbackPayloads: derived.playbackPayloads.length
    },
    rounds,
    scoreEntries: scoreRows,
    chatOutputs: derived.chatOutputs,
    playbackPayloads: derived.playbackPayloads,
    ranking: getRanking(uid),
    note: "EVS-16 zeigt Sound-Runden, Punkte, Ranking und vorbereitete Sound-/Chat-Payloads im Dashboard; es wird noch nichts direkt abgespielt.",
    updatedAt: nowIso()
  };
}


function getTextRuntimeReport(eventUid = "") {
  ensureSchema();
  const selectedEvent = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  const uid = selectedEvent ? selectedEvent.eventUid : cleanString(eventUid);
  if (!uid) {
    return {
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      activeEvent: null,
      event: null,
      wordHits: [],
      phraseSolves: [],
      ranking: { ok: false, error: "event_uid_required", rows: [] },
      note: "Kein aktives Event und keine eventUid angegeben.",
      updatedAt: nowIso()
    };
  }

  const wordHits = database.all(`
    SELECT hit_uid, event_uid, phrase_uid, phrase_index, phrase_number, word_key, word_original,
           user_login, user_display_name, points_awarded, chat_message_id, chat_message, created_at
    FROM stream_events_text_word_hits
    WHERE event_uid = :eventUid
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `, { eventUid: uid }).map(row => ({
    hitUid: row.hit_uid,
    eventUid: row.event_uid,
    phraseUid: row.phrase_uid,
    phraseIndex: Number(row.phrase_index || 0),
    phraseNumber: Number(row.phrase_number || 0),
    wordKey: row.word_key || "",
    wordOriginal: row.word_original || row.word_key || "",
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    pointsAwarded: Number(row.points_awarded || 0),
    chatMessageId: row.chat_message_id || "",
    chatMessage: row.chat_message || "",
    createdAt: row.created_at || ""
  }));

  const phraseSolves = database.all(`
    SELECT solve_uid, event_uid, phrase_uid, phrase_index, phrase_number,
           user_login, user_display_name, points_awarded, chat_message_id, chat_message, created_at
    FROM stream_events_text_phrase_solves
    WHERE event_uid = :eventUid
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `, { eventUid: uid }).map(row => ({
    solveUid: row.solve_uid,
    eventUid: row.event_uid,
    phraseUid: row.phrase_uid,
    phraseIndex: Number(row.phrase_index || 0),
    phraseNumber: Number(row.phrase_number || 0),
    userLogin: row.user_login || "",
    userDisplayName: row.user_display_name || row.user_login || "",
    pointsAwarded: Number(row.points_awarded || 0),
    chatMessageId: row.chat_message_id || "",
    chatMessage: row.chat_message || "",
    createdAt: row.created_at || ""
  }));

  const runtimeConfig = selectedEvent ? getTextRuntimeConfig(selectedEvent) : getTextRuntimeConfig(null);
  const chatOutputs = buildRuntimeReportChatOutputs(selectedEvent, wordHits, phraseSolves, runtimeConfig);

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    activeEvent: publicEventSummary(getActiveEvent()),
    event: publicEventSummary(selectedEvent),
    eventUid: uid,
    counts: {
      wordHits: wordHits.length,
      phraseSolves: phraseSolves.length,
      chatOutputs: chatOutputs.length
    },
    wordHits,
    phraseSolves,
    chatOutputs,
    ranking: getRanking(uid),
    updatedAt: nowIso()
  };
}

function countKnownWordsForReport(eventUid, phraseUid, userLogin) {
  try {
    const row = database.get(`
      SELECT COUNT(*) AS total
      FROM stream_events_text_word_hits
      WHERE event_uid = :eventUid AND phrase_uid = :phraseUid AND user_login = :userLogin
    `, { eventUid, phraseUid, userLogin }) || {};
    return Number(row.total || 0);
  } catch (_) {
    return 0;
  }
}

function buildRuntimeReportChatOutputs(event, wordHits = [], phraseSolves = [], runtimeConfig = {}) {
  const outputs = [];
  if (!event) return outputs;
  for (const hit of wordHits.slice(0, 60)) {
    const totalKnown = countKnownWordsForReport(event.eventUid, hit.phraseUid, hit.userLogin);
    const textKey = runtimeConfig.partialHintVisibility === "with_sentence" ? "text.partial.with_sentence" : "text.partial.general";
    const context = {
      user: hit.userDisplayName || hit.userLogin,
      displayName: hit.userDisplayName || hit.userLogin,
      wordCount: runtimeConfig.showPartialWordCount ? totalKnown : 1,
      phraseNumber: hit.phraseNumber,
      points: hit.pointsAwarded
    };
    if (runtimeConfig.partialHintsEnabled !== false) {
      outputs.push({
        kind: "word_found",
        eventUid: hit.eventUid,
        phraseUid: hit.phraseUid,
        phraseNumber: hit.phraseNumber,
        userLogin: hit.userLogin,
        userDisplayName: hit.userDisplayName,
        points: hit.pointsAwarded,
        createdAt: hit.createdAt,
        reportPreview: true,
        ...buildChatOutput(textKey, context, { reason: "runtime_report_word_found_preview" })
      });
    }
    if (Number(hit.pointsAwarded || 0) > 0) {
      outputs.push({
        kind: "word_points_added",
        eventUid: hit.eventUid,
        phraseUid: hit.phraseUid,
        phraseNumber: hit.phraseNumber,
        userLogin: hit.userLogin,
        userDisplayName: hit.userDisplayName,
        points: hit.pointsAwarded,
        createdAt: hit.createdAt,
        reportPreview: true,
        ...buildChatOutput("text.word_points.added", context, { reason: "runtime_report_word_points_preview" })
      });
    }
  }
  for (const solve of phraseSolves.slice(0, 60)) {
    const context = {
      user: solve.userDisplayName || solve.userLogin,
      displayName: solve.userDisplayName || solve.userLogin,
      phraseNumber: solve.phraseNumber,
      points: solve.pointsAwarded
    };
    outputs.push({
      kind: "phrase_solved",
      eventUid: solve.eventUid,
      phraseUid: solve.phraseUid,
      phraseNumber: solve.phraseNumber,
      userLogin: solve.userLogin,
      userDisplayName: solve.userDisplayName,
      points: solve.pointsAwarded,
      createdAt: solve.createdAt,
      reportPreview: true,
      ...buildChatOutput("text.phrase.solved", context, { reason: "runtime_report_phrase_solved_preview" })
    });
  }
  return outputs.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 100);
}


function eventFilterSql(eventUid, alias = "") {
  const uid = cleanString(eventUid);
  if (!uid) return { sql: "", params: {} };
  const prefix = alias ? `${alias}.` : "";
  return { sql: ` AND ${prefix}event_uid = :eventUid`, params: { eventUid: uid } };
}

function rowEventInfoMap(eventUids = []) {
  const unique = [...new Set(eventUids.map(cleanString).filter(Boolean))];
  if (!unique.length) return new Map();
  const placeholders = unique.map((_, idx) => `:eventUid${idx}`).join(",");
  const params = Object.fromEntries(unique.map((uid, idx) => [`eventUid${idx}`, uid]));
  const rows = database.all(`
    SELECT event_uid, name, status, started_at, finished_at, cancelled_at, created_at
    FROM stream_events_events
    WHERE event_uid IN (${placeholders})
  `, params);
  return new Map(rows.map(row => [row.event_uid, {
    eventUid: row.event_uid,
    eventName: row.name || row.event_uid,
    eventStatus: normalizeStatus(row.status),
    startedAt: row.started_at || "",
    finishedAt: row.finished_at || "",
    cancelledAt: row.cancelled_at || "",
    createdAt: row.created_at || ""
  }]));
}

function makeUserAccumulator(login, displayName = "") {
  const userLogin = cleanString(login).replace(/^@/, "").toLowerCase();
  return {
    userLogin,
    userDisplayName: cleanString(displayName, userLogin),
    totalPoints: 0,
    wordPoints: 0,
    phrasePoints: 0,
    soundPoints: 0,
    manualPoints: 0,
    scoreEntries: 0,
    wordHits: 0,
    phraseSolves: 0,
    soundHits: 0,
    events: new Set(),
    firstActivityAt: "",
    lastActivityAt: ""
  };
}

function touchUserAccumulator(acc, eventUid, createdAt) {
  if (eventUid) acc.events.add(eventUid);
  const at = cleanString(createdAt);
  if (at && (!acc.firstActivityAt || at < acc.firstActivityAt)) acc.firstActivityAt = at;
  if (at && (!acc.lastActivityAt || at > acc.lastActivityAt)) acc.lastActivityAt = at;
}

function getStatisticsUsers(eventUid = "") {
  ensureSchema();
  const uid = cleanString(eventUid);
  const users = new Map();
  function accFor(login, displayName) {
    const key = cleanString(login).replace(/^@/, "").toLowerCase();
    if (!key) return null;
    if (!users.has(key)) users.set(key, makeUserAccumulator(key, displayName));
    const acc = users.get(key);
    if (displayName && (!acc.userDisplayName || acc.userDisplayName === acc.userLogin)) acc.userDisplayName = cleanString(displayName, acc.userLogin);
    return acc;
  }
  const filter = eventFilterSql(uid);

  const scoreRows = database.all(`
    SELECT event_uid, user_login, user_display_name, source_type, points, created_at
    FROM stream_events_score_entries
    WHERE user_login <> ''${filter.sql}
  `, filter.params);
  for (const row of scoreRows) {
    const acc = accFor(row.user_login, row.user_display_name);
    if (!acc) continue;
    const points = Number(row.points || 0);
    const sourceType = cleanString(row.source_type);
    acc.totalPoints += points;
    acc.scoreEntries += 1;
    if (sourceType === "text_word_hit") acc.wordPoints += points;
    else if (sourceType === "text_phrase_solve") acc.phrasePoints += points;
    else if (sourceType.startsWith("sound")) acc.soundPoints += points;
    else acc.manualPoints += points;
    touchUserAccumulator(acc, row.event_uid, row.created_at);
  }

  const hitRows = database.all(`
    SELECT event_uid, user_login, user_display_name, points_awarded, created_at
    FROM stream_events_text_word_hits
    WHERE user_login <> ''${filter.sql}
  `, filter.params);
  for (const row of hitRows) {
    const acc = accFor(row.user_login, row.user_display_name);
    if (!acc) continue;
    acc.wordHits += 1;
    touchUserAccumulator(acc, row.event_uid, row.created_at);
  }

  const solveRows = database.all(`
    SELECT event_uid, user_login, user_display_name, points_awarded, created_at
    FROM stream_events_text_phrase_solves
    WHERE user_login <> ''${filter.sql}
  `, filter.params);
  for (const row of solveRows) {
    const acc = accFor(row.user_login, row.user_display_name);
    if (!acc) continue;
    acc.phraseSolves += 1;
    touchUserAccumulator(acc, row.event_uid, row.created_at);
  }

  const rows = [...users.values()].map(acc => ({
    userLogin: acc.userLogin,
    userDisplayName: acc.userDisplayName || acc.userLogin,
    totalPoints: acc.totalPoints,
    wordPoints: acc.wordPoints,
    phrasePoints: acc.phrasePoints,
    soundPoints: acc.soundPoints,
    manualPoints: acc.manualPoints,
    scoreEntries: acc.scoreEntries,
    wordHits: acc.wordHits,
    phraseSolves: acc.phraseSolves,
    soundHits: acc.soundHits,
    eventCount: acc.events.size,
    firstActivityAt: acc.firstActivityAt,
    lastActivityAt: acc.lastActivityAt
  })).sort((a, b) => (b.totalPoints - a.totalPoints) || (b.wordHits + b.phraseSolves - a.wordHits - a.phraseSolves) || String(b.lastActivityAt).localeCompare(String(a.lastActivityAt)) || a.userLogin.localeCompare(b.userLogin));

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    eventUid: uid,
    activeEvent: publicEventSummary(getActiveEvent()),
    count: rows.length,
    users: rows,
    updatedAt: nowIso()
  };
}

function getStatisticsUser(login, eventUid = "") {
  ensureSchema();
  const userLogin = cleanString(login).replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, error: "user_login_required" };
  const uid = cleanString(eventUid);
  const params = { userLogin };
  const eventClause = uid ? " AND event_uid = :eventUid" : "";
  if (uid) params.eventUid = uid;

  const scoreEntries = database.all(`
    SELECT entry_uid, event_uid, user_login, user_display_name, source_type, source_uid, reason,
           points, created_by, created_at, metadata_json
    FROM stream_events_score_entries
    WHERE user_login = :userLogin${eventClause}
    ORDER BY created_at DESC, id DESC
    LIMIT 500
  `, params).map(row => ({
    entryUid: row.entry_uid,
    eventUid: row.event_uid,
    userLogin: row.user_login,
    userDisplayName: row.user_display_name || row.user_login,
    sourceType: row.source_type || "",
    sourceUid: row.source_uid || "",
    reason: row.reason || "",
    points: Number(row.points || 0),
    createdBy: row.created_by || "",
    createdAt: row.created_at || "",
    metadata: safeJsonParse(row.metadata_json, {})
  }));

  const wordHits = database.all(`
    SELECT hit_uid, event_uid, phrase_uid, phrase_index, phrase_number, word_key, word_original,
           user_login, user_display_name, points_awarded, chat_message_id, chat_message, created_at, metadata_json
    FROM stream_events_text_word_hits
    WHERE user_login = :userLogin${eventClause}
    ORDER BY created_at DESC, id DESC
    LIMIT 500
  `, params).map(row => ({
    hitUid: row.hit_uid,
    eventUid: row.event_uid,
    phraseUid: row.phrase_uid,
    phraseIndex: Number(row.phrase_index || 0),
    phraseNumber: Number(row.phrase_number || 0),
    wordKey: row.word_key || "",
    wordOriginal: row.word_original || row.word_key || "",
    userLogin: row.user_login,
    userDisplayName: row.user_display_name || row.user_login,
    pointsAwarded: Number(row.points_awarded || 0),
    chatMessageId: row.chat_message_id || "",
    chatMessage: row.chat_message || "",
    createdAt: row.created_at || "",
    metadata: safeJsonParse(row.metadata_json, {})
  }));

  const phraseSolves = database.all(`
    SELECT solve_uid, event_uid, phrase_uid, phrase_index, phrase_number,
           user_login, user_display_name, points_awarded, chat_message_id, chat_message, created_at, metadata_json
    FROM stream_events_text_phrase_solves
    WHERE user_login = :userLogin${eventClause}
    ORDER BY created_at DESC, id DESC
    LIMIT 500
  `, params).map(row => ({
    solveUid: row.solve_uid,
    eventUid: row.event_uid,
    phraseUid: row.phrase_uid,
    phraseIndex: Number(row.phrase_index || 0),
    phraseNumber: Number(row.phrase_number || 0),
    userLogin: row.user_login,
    userDisplayName: row.user_display_name || row.user_login,
    pointsAwarded: Number(row.points_awarded || 0),
    chatMessageId: row.chat_message_id || "",
    chatMessage: row.chat_message || "",
    createdAt: row.created_at || "",
    metadata: safeJsonParse(row.metadata_json, {})
  }));

  const eventMap = rowEventInfoMap([...scoreEntries, ...wordHits, ...phraseSolves].map(row => row.eventUid));
  const enrich = row => ({ ...(eventMap.get(row.eventUid) || { eventUid: row.eventUid, eventName: row.eventUid, eventStatus: "" }), ...row });
  const enrichedScoreEntries = scoreEntries.map(enrich);
  const enrichedWordHits = wordHits.map(enrich);
  const enrichedPhraseSolves = phraseSolves.map(enrich);
  const soundEntries = enrichedScoreEntries.filter(row => cleanString(row.sourceType).startsWith("sound"));

  const events = new Map();
  function eventAcc(row) {
    const key = row.eventUid || "unknown";
    if (!events.has(key)) {
      const info = eventMap.get(key) || { eventUid: key, eventName: key, eventStatus: "" };
      events.set(key, { ...info, totalPoints: 0, wordHits: 0, phraseSolves: 0, soundEntries: 0, scoreEntries: 0, lastActivityAt: "" });
    }
    const item = events.get(key);
    if (row.createdAt && row.createdAt > item.lastActivityAt) item.lastActivityAt = row.createdAt;
    return item;
  }
  for (const row of enrichedScoreEntries) {
    const item = eventAcc(row);
    item.totalPoints += Number(row.points || 0);
    item.scoreEntries += 1;
    if (cleanString(row.sourceType).startsWith("sound")) item.soundEntries += 1;
  }
  for (const row of enrichedWordHits) eventAcc(row).wordHits += 1;
  for (const row of enrichedPhraseSolves) eventAcc(row).phraseSolves += 1;

  const timeline = [
    ...enrichedWordHits.map(row => ({ kind: "word_hit", gameType: "text", label: `Wort gefunden: ${row.wordOriginal || row.wordKey}`, points: row.pointsAwarded, createdAt: row.createdAt, row })),
    ...enrichedPhraseSolves.map(row => ({ kind: "phrase_solved", gameType: "text", label: `Satz ${row.phraseNumber} gelöst`, points: row.pointsAwarded, createdAt: row.createdAt, row })),
    ...soundEntries.map(row => ({ kind: "sound_score", gameType: "sound", label: row.reason || row.sourceType || "Sound-Punkte", points: row.points, createdAt: row.createdAt, row }))
  ].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 500);

  const summary = {
    userLogin,
    userDisplayName: (enrichedScoreEntries[0] || enrichedWordHits[0] || enrichedPhraseSolves[0] || {}).userDisplayName || userLogin,
    eventCount: events.size,
    totalPoints: enrichedScoreEntries.reduce((sum, row) => sum + Number(row.points || 0), 0),
    wordPoints: enrichedScoreEntries.filter(row => row.sourceType === "text_word_hit").reduce((sum, row) => sum + Number(row.points || 0), 0),
    phrasePoints: enrichedScoreEntries.filter(row => row.sourceType === "text_phrase_solve").reduce((sum, row) => sum + Number(row.points || 0), 0),
    soundPoints: soundEntries.reduce((sum, row) => sum + Number(row.points || 0), 0),
    manualPoints: enrichedScoreEntries.filter(row => !["text_word_hit", "text_phrase_solve"].includes(row.sourceType) && !cleanString(row.sourceType).startsWith("sound")).reduce((sum, row) => sum + Number(row.points || 0), 0),
    scoreEntries: enrichedScoreEntries.length,
    wordHits: enrichedWordHits.length,
    phraseSolves: enrichedPhraseSolves.length,
    soundEntries: soundEntries.length,
    firstActivityAt: [...timeline].reverse()[0]?.createdAt || "",
    lastActivityAt: timeline[0]?.createdAt || ""
  };

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    eventUid: uid,
    activeEvent: publicEventSummary(getActiveEvent()),
    user: summary,
    events: [...events.values()].sort((a, b) => String(b.lastActivityAt || "").localeCompare(String(a.lastActivityAt || ""))),
    text: {
      wordHits: enrichedWordHits,
      phraseSolves: enrichedPhraseSolves
    },
    sound: {
      available: soundEntries.length > 0,
      note: soundEntries.length > 0 ? "Sound-bezogene Punkte aus score_entries." : "Sound-Snippet-Runtime ist noch nicht eingebaut; dieser Bereich ist vorbereitet.",
      rows: soundEntries
    },
    scoreEntries: enrichedScoreEntries,
    timeline,
    updatedAt: nowIso()
  };
}


function createSoundRuntimeTestEvent(body = {}) {
  ensureSchema();
  const name = cleanString(body.name, "EVS Sound-Runtime Test");
  const startImmediately = body.start !== undefined || body.startImmediately !== undefined ? boolValue(body.start ?? body.startImmediately) : true;
  const finishExistingTestActive = body.finishExistingTestActive !== undefined ? boolValue(body.finishExistingTestActive) : true;
  const snippets = Array.isArray(body.snippets) && body.snippets.length ? body.snippets : [
    {
      uid: "test_sound_1",
      title: "Forrest Heimleitung Hymne",
      mediaId: "evs_test_audio_forrest_heimleitung",
      mediaPath: "",
      acceptedAnswers: ["forrest heimleitung", "heimleitung", "forrest hymn", "forrest hymne"],
      points: 25,
      answerSeconds: 20,
      active: true
    },
    {
      uid: "test_sound_2",
      title: "Engel Rentner Disco",
      mediaId: "evs_test_audio_engel_rentner_disco",
      mediaPath: "",
      acceptedAnswers: ["engel disco", "rentner disco", "engel rentner disco"],
      points: 30,
      answerSeconds: 20,
      active: true
    },
    {
      uid: "test_sound_3",
      title: "CGN Kaffeemaschine Alarm",
      mediaId: "evs_test_audio_cgn_kaffee_alarm",
      mediaPath: "",
      acceptedAnswers: ["kaffeemaschine", "kaffee alarm", "cgn kaffee", "kaffeemaschine alarm"],
      points: 20,
      answerSeconds: 20,
      active: true
    }
  ];

  const event = createEvent({
    name,
    description: cleanString(body.description, "Automatisch angelegtes Test-Event fuer die EVS Sound-Runtime. Es wird nichts direkt abgespielt."),
    soundEnabled: true,
    textEnabled: false,
    soundConfig: {
      snippets,
      answerSeconds: clampNumber(body.answerSeconds, 5, 300, 60),
      defaultPoints: clampNumber(body.defaultPoints, 0, 10000, 10),
      unresolvedPolicy: cleanString(body.unresolvedPolicy, "requeue_later"),
      solvedPolicy: cleanString(body.solvedPolicy, "remove_from_rotation"),
      avoidImmediateRepeat: body.avoidImmediateRepeat !== undefined ? boolValue(body.avoidImmediateRepeat) : true,
      revealVideoEnabled: body.revealVideoEnabled !== undefined ? boolValue(body.revealVideoEnabled) : true,
      directPlaybackEnabled: false,
      outputPreparedOnly: true
    },
    metadata: {
      testEvent: true,
      createdByHelper: "sound-runtime-test-event",
      preparedOnly: true,
      soundSystemQueueTouched: false,
      step: MODULE_BUILD
    },
    createdBy: cleanString(body.createdBy || body.actor, "evs_test_helper")
  });

  const validated = validateStoredEvent(event.eventUid);
  const started = startImmediately ? startEvent(event.eventUid) : null;
  const active = getActiveEvent();
  return {
    ok: true,
    event: publicEventSummary(getEventByUid(event.eventUid)),
    eventUid: event.eventUid,
    validated: publicEventSummary(validated),
    started,
    activeEvent: publicEventSummary(active),
    snippets: getSoundSnippets(getEventByUid(event.eventUid)).map(item => ({
      snippetUid: item.snippetUid,
      title: item.title,
      mediaId: item.mediaId,
      acceptedAnswers: item.acceptedAnswers,
      points: item.points,
      answerSeconds: item.answerSeconds
    })),
    testFlow: [
      { step: 1, method: "POST", route: "/api/stream-events/sound-runtime/next-round", note: "Bereitet eine Sound-Runde vor. Spielt nichts ab." },
      { step: 2, method: "POST", route: "/api/stream-events/sound-runtime/resolve", body: { user: "soundtester", answer: "heimleitung" }, note: "Loest die aktive Runde, wenn die Antwort passt." },
      { step: 3, method: "GET", route: "/api/stream-events/sound-runtime/report", note: "Zeigt Runden, Punkte und Ranking." }
    ],
    routes: {
      nextRound: "/api/stream-events/sound-runtime/next-round",
      resolve: "/api/stream-events/sound-runtime/resolve",
      unresolved: "/api/stream-events/sound-runtime/unresolved",
      report: "/api/stream-events/sound-runtime/report"
    },
    note: "Dieser Helper legt nur auf ausdrueckliches confirm=1 ein Sound-Test-Event an. Er spielt nichts direkt ab und fasst die Sound-System-Queue nicht an."
  };
}

function createTextRuntimeTestEvent(body = {}) {
  ensureSchema();
  const name = cleanString(body.name, "EVS Text-Runtime Test");
  const startImmediately = body.start !== undefined || body.startImmediately !== undefined ? boolValue(body.start ?? body.startImmediately) : true;
  const finishExistingTestActive = body.finishExistingTestActive !== undefined ? boolValue(body.finishExistingTestActive) : true;
  const phrases = Array.isArray(body.phrases) && body.phrases.length ? body.phrases : [
    {
      uid: "test_phrase_1",
      phrase: "Forrest und Engel machen Party mit der Community",
      acceptedAnswers: [
        "Forrest und Engel machen Party mit der Community",
        "forrest engel party community"
      ],
      pointsFirst: 40,
      active: true
    },
    {
      uid: "test_phrase_2",
      phrase: "Die Rentnergang findet den geheimen Satz",
      acceptedAnswers: [
        "Die Rentnergang findet den geheimen Satz",
        "rentnergang geheimer satz"
      ],
      pointsFirst: 35,
      active: true
    }
  ];

  const event = createEvent({
    name,
    description: cleanString(body.description, "Automatisch angelegtes Test-Event fuer die EVS Text-Chat-Runtime."),
    soundEnabled: false,
    textEnabled: true,
    textConfig: {
      phrases,
      partialHintsEnabled: body.partialHintsEnabled !== undefined ? boolValue(body.partialHintsEnabled) : true,
      partialHintVisibility: cleanString(body.partialHintVisibility, "with_sentence"),
      showPartialWordCount: body.showPartialWordCount !== undefined ? boolValue(body.showPartialWordCount) : true,
      wordPointsEnabled: body.wordPointsEnabled !== undefined ? boolValue(body.wordPointsEnabled) : true,
      pointsPerNewWord: clampNumber(body.pointsPerNewWord, 0, 1000, 1),
      maxWordPointsPerUserPhrase: clampNumber(body.maxWordPointsPerUserPhrase, 0, 10000, 5),
      partialHintCooldownSeconds: clampNumber(body.partialHintCooldownSeconds, 0, 3600, 0),
      tokenMinLength: clampNumber(body.tokenMinLength, 1, 20, 3),
      uniqueWordPerUserPhrase: true
    },
    metadata: {
      testEvent: true,
      createdByHelper: "text-runtime-test-event",
      step: MODULE_BUILD
    },
    createdBy: cleanString(body.createdBy || body.actor, "evs_test_helper")
  });

  const validated = validateStoredEvent(event.eventUid);
  const started = startImmediately ? startEvent(event.eventUid) : null;
  return {
    ok: true,
    event: publicEventSummary(getEventByUid(event.eventUid)),
    eventUid: event.eventUid,
    validated: publicEventSummary(validated),
    started,
    testMessages: [
      { user: "testuser", message: "Party" },
      { user: "testuser", message: "Forrest Engel Party" },
      { user: "andereruser", message: "Forrest und Engel machen Party mit der Community" }
    ],
    routes: {
      testChat: "/api/stream-events/text-runtime/test-chat",
      report: "/api/stream-events/text-runtime/report"
    },
    note: "Dieser Helper legt nur auf ausdrueckliches confirm=1 ein Test-Event an. Er sendet nichts direkt in den Twitch-Chat."
  };
}

function isSafeAutoFinalizableTestEvent(event = {}) {
  const meta = event && event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  const name = cleanString(event.name || "").toLowerCase();
  return Boolean(
    meta.testEvent === true ||
    meta.stealthTestEvent === true ||
    cleanString(meta.createdByHelper) ||
    name.includes("testevent") ||
    name.includes("stealth") ||
    name.includes("evs-")
  );
}

function createCombinedRuntimeStealthTestEvent(body = {}) {
  ensureSchema();
  const name = cleanString(body.name, "EVS-19 Kombi Stealth-Testevent");
  const startImmediately = body.start !== undefined || body.startImmediately !== undefined ? boolValue(body.start ?? body.startImmediately) : true;
  const finishExistingTestActive = body.finishExistingTestActive !== undefined ? boolValue(body.finishExistingTestActive) : true;
  const snippets = Array.isArray(body.snippets) && body.snippets.length ? body.snippets : [
    {
      uid: "evs19_sound_heimleitung",
      title: "EVS19 Heimleitung Stealth-Sound",
      mediaId: "evs19_test_audio_heimleitung",
      mediaPath: "",
      acceptedAnswers: ["heimleitung", "ich geh kurz kaffee holen", "rentnerbus ist unterwegs"],
      points: 25,
      answerSeconds: 20,
      active: true
    },
    {
      uid: "evs19_sound_schluessel",
      title: "EVS19 Schluessel Stealth-Sound",
      mediaId: "evs19_test_audio_schluessel",
      mediaPath: "",
      acceptedAnswers: ["die heimleitung sucht den schluessel", "schluessel gefunden", "kaffee ist fertig"],
      points: 30,
      answerSeconds: 20,
      active: true
    }
  ];
  const phrases = Array.isArray(body.phrases) && body.phrases.length ? body.phrases : [
    {
      uid: "evs19_phrase_heimleitung_schluessel",
      phrase: "die heimleitung sucht den schluessel",
      acceptedAnswers: [
        "die heimleitung sucht den schluessel",
        "heimleitung sucht schluessel"
      ],
      pointsFirst: 40,
      active: true
    },
    {
      uid: "evs19_phrase_kaffee_rentnerbus",
      phrase: "ich geh kurz kaffee holen",
      acceptedAnswers: [
        "ich geh kurz kaffee holen",
        "kaffee holen"
      ],
      pointsFirst: 30,
      active: true
    }
  ];

  const event = createEvent({
    name,
    description: cleanString(body.description, "EVS-19 Testevent fuer parallele Sound- und Text-Runtime. Es sendet nichts in den Chat und spielt nichts ab."),
    soundEnabled: true,
    textEnabled: true,
    soundConfig: {
      snippets,
      answerSeconds: clampNumber(body.answerSeconds, 5, 300, 60),
      defaultPoints: clampNumber(body.defaultPoints, 0, 10000, 10),
      unresolvedPolicy: cleanString(body.unresolvedPolicy, "requeue_later"),
      solvedPolicy: cleanString(body.solvedPolicy, "remove_from_rotation"),
      avoidImmediateRepeat: body.avoidImmediateRepeat !== undefined ? boolValue(body.avoidImmediateRepeat) : true,
      revealVideoEnabled: body.revealVideoEnabled !== undefined ? boolValue(body.revealVideoEnabled) : false,
      directPlaybackEnabled: false,
      outputPreparedOnly: true
    },
    textConfig: {
      phrases,
      partialHintsEnabled: body.partialHintsEnabled !== undefined ? boolValue(body.partialHintsEnabled) : true,
      partialHintVisibility: cleanString(body.partialHintVisibility, "with_sentence"),
      showPartialWordCount: body.showPartialWordCount !== undefined ? boolValue(body.showPartialWordCount) : true,
      wordPointsEnabled: body.wordPointsEnabled !== undefined ? boolValue(body.wordPointsEnabled) : true,
      pointsPerNewWord: clampNumber(body.pointsPerNewWord, 0, 1000, 1),
      maxWordPointsPerUserPhrase: clampNumber(body.maxWordPointsPerUserPhrase, 0, 10000, 5),
      partialHintCooldownSeconds: clampNumber(body.partialHintCooldownSeconds, 0, 3600, 0),
      tokenMinLength: clampNumber(body.tokenMinLength, 1, 20, 3),
      uniqueWordPerUserPhrase: true
    },
    metadata: {
      testEvent: true,
      stealthTestEvent: true,
      createdByHelper: "combined-runtime-stealth-test-event",
      preparedOnly: true,
      directSend: false,
      directPlayback: false,
      soundSystemQueueTouched: false,
      step: MODULE_BUILD
    },
    createdBy: cleanString(body.createdBy || body.actor, "evs_test_helper")
  });

  const validated = validateStoredEvent(event.eventUid);
  let finalizedPreviousActive = null;
  if (startImmediately) {
    const activeBeforeStart = getActiveEvent();
    if (activeBeforeStart && activeBeforeStart.eventUid !== event.eventUid && finishExistingTestActive && isSafeAutoFinalizableTestEvent(activeBeforeStart)) {
      finalizedPreviousActive = finishEvent(activeBeforeStart.eventUid);
    }
  }
  const started = startImmediately ? startEvent(event.eventUid) : null;
  return {
    ok: true,
    event: publicEventSummary(getEventByUid(event.eventUid)),
    eventUid: event.eventUid,
    validated: publicEventSummary(validated),
    started,
    finalizedPreviousActive,
    activeEvent: publicEventSummary(getActiveEvent()),
    snippets: getSoundSnippets(getEventByUid(event.eventUid)).map(item => ({
      snippetUid: item.snippetUid,
      title: item.title,
      acceptedAnswers: item.acceptedAnswers,
      points: item.points
    })),
    phrases: getTextPhrases(getEventByUid(event.eventUid)).map(item => ({
      phraseUid: item.phraseUid,
      phrase: item.phrase,
      acceptedAnswers: item.acceptedAnswers,
      pointsFirst: item.pointsFirst
    })),
    testFlow: [
      { step: 1, method: "POST", route: "/api/stream-events/sound-runtime/next-round", body: { allowReuse: true }, note: "Aktive Soundrunde fuer das aktive Stealth-Testevent vorbereiten, ohne Playback." },
      { step: 2, method: "POST", route: "/api/stream-events/chat-runtime/test-chat", body: { message: "heimleitung" }, note: "Eine Nachricht wird parallel gegen Sound und Text geprueft." },
      { step: 3, method: "GET", route: "/api/stream-events/sound-runtime/report", note: "Report zeigt Sound/Text/Punkte/ChatOutputs prepared-only." }
    ],
    routes: {
      createStealthTestEvent: "/api/stream-events/chat-runtime/create-stealth-test-event?confirm=1",
      testChat: "/api/stream-events/chat-runtime/test-chat",
      nextRound: "/api/stream-events/sound-runtime/next-round",
      report: "/api/stream-events/sound-runtime/report"
    },
    note: "Dieser Helper legt nur mit confirm=1 ein Kombi-Testevent an. Jede Nachricht wird parallel gegen Sound und Text geprueft. Es gibt keine direkte Twitch-Ausgabe und kein Playback."
  };
}

function getTextRuntimeStatus() {
  ensureSchema();
  const activeEvent = getActiveEvent();
  const hits = database.get("SELECT COUNT(*) AS count FROM stream_events_text_word_hits") || {};
  const solves = database.get("SELECT COUNT(*) AS count FROM stream_events_text_phrase_solves") || {};
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    activeEvent: publicEventSummary(activeEvent),
    activeTextRuntime: !!(activeEvent && activeEvent.textEnabled),
    counters: runtimeState.counters,
    counts: {
      wordHits: Number(hits.count || 0),
      phraseSolves: Number(solves.count || 0)
    },
    rules: {
      oneWinnerPerPhrase: true,
      wordHitUniquePerEventPhraseUserWord: true,
      phraseSolvedRemovedFromRotation: true,
      chatOutputDirectSend: false,
      chatOutputPreparedAsBusPayload: true
    },
    updatedAt: nowIso()
  };
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
    textWordHits: database.count("stream_events_text_word_hits"),
    textPhraseSolves: database.count("stream_events_text_phrase_solves"),
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
  let runtimeGate = null;
  try {
    if (runtimeState.schemaReady) {
      counts = getCounts();
      activeEvent = publicEventSummary(getActiveEvent());
      runtimeGate = getRuntimeGateStatus();
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
    runtimeGate,
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
    runtimeOverlay: {
      prepared: true,
      built: false,
      stateRoute: "/api/stream-events/runtime-overlay/state",
      plannedFile: "htdocs/overlays/stream_events/event_runtime_overlay.html",
      viewerSafe: true
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
      { method: "GET", path: `${prefix}/text-runtime/status`, description: "Text-Spiel Chat-Runtime Status" },
      { method: "GET", path: `${prefix}/text-runtime/report`, description: "Text-Spiel Runtime Report fuer aktives oder angegebenes Event" },
      { method: "GET", path: `${prefix}/sound-runtime/status`, description: "Sound-Spiel Runtime Status und aktive Runde" },
      { method: "GET", path: `${prefix}/sound-runtime/report`, description: "Sound-Spiel Runtime Report fuer aktives oder angegebenes Event" },
      { method: "GET", path: `${prefix}/sound-runtime/safety-plan`, description: "SOUND-SAFE-1: Read-only Plan fuer Sound-System-Erweiterungspunkt, PreRoll/Countdown und Tests" },
      { method: "GET", path: `${prefix}/runtime-overlay/state`, description: "EVENT-RUNTIME-1: Viewer-sicherer Read-only State fuer das spaetere kombinierte Event-Runtime-Overlay" },
      { method: "GET", path: `${prefix}/statistics/users`, description: "Statistik-Userliste fuer Dropdown/Filter, optional eventUid" },
      { method: "GET", path: `${prefix}/statistics/user/:login`, description: "User-Detailstatistik fuer Text/Sound/Punkte, optional eventUid" },
      { method: "POST", path: `${prefix}/text-runtime/test-chat`, description: "Testet eine Chatnachricht gegen das aktive Text-Event" },
      { method: "POST", path: `${prefix}/text-runtime/create-test-event`, description: "Legt mit confirm=1 ein sicheres Text-Runtime-Testevent an" },
      { method: "POST", path: `${prefix}/sound-runtime/create-test-event`, description: "Legt mit confirm=1 ein sicheres Sound-Runtime-Testevent an" },
      { method: "POST", path: `${prefix}/sound-runtime/test-chat`, description: "Testet eine Chatantwort gegen die aktive Sound-Runde, ohne direkt in Twitch zu senden" },
      { method: "POST", path: `${prefix}/chat-runtime/test-chat`, description: "EVS-19: Testet eine Chatnachricht parallel gegen Sound und Text, ohne direkt zu senden" },
      { method: "POST", path: `${prefix}/chat-runtime/create-stealth-test-event`, description: "EVS-19: Legt mit confirm=1 ein Kombi-Stealth-Testevent fuer Sound + Text an" },
      { method: "GET", path: `${prefix}/runtime-gate/status`, description: "EVS-24: einfache Aktiv/Inaktiv-Runtime-Gate-Anzeige ueber Stream online + aktives Event" },
      { method: "GET", path: `${prefix}/chat-output/status`, description: "EVS-20: ChatOutput-Dispatcher Sicherheitsstatus, dry-run only" },
      { method: "GET", path: `${prefix}/chat-output/report`, description: "EVS-20: Vorbereitete ChatOutputs aus Sound/Text mit Dispatch-Preview, dry-run only" },
      { method: "POST", path: `${prefix}/chat-output/test-dispatch`, description: "EVS-20: Testet ChatOutput-Dispatch-Regeln ohne Twitch-Ausgabe" },
      { method: "POST", path: `${prefix}/sound-runtime/next-round`, description: "Bereitet die naechste Sound-Runde vor, ohne direkt abzuspielen" },
      { method: "POST", path: `${prefix}/sound-runtime/resolve`, description: "Wertet die aktive Sound-Runde als geloest, wenn die Antwort passt" },
      { method: "POST", path: `${prefix}/sound-runtime/unresolved`, description: "Markiert die aktive Sound-Runde als nicht geloest" },
      { method: "GET", path: `${prefix}/routes`, description: "Route-Selbstdokumentation" },
      { method: "GET", path: `${prefix}/config`, description: "Globale Event-System Config lesen" },
      { method: "POST", path: `${prefix}/config`, description: "Globale Event-System Config speichern" },
      { method: "GET", path: `${prefix}/texts`, description: "DB-/Dashboardfähige Textvarianten für stream_events lesen" },
      { method: "POST", path: `${prefix}/texts`, description: "Textvariante speichern oder löschen" },
      { method: "GET", path: `${prefix}/events`, description: "Events listen" },
      { method: "POST", path: `${prefix}/events`, description: "Event-Entwurf erstellen" },
      { method: "GET", path: `${prefix}/events/:eventUid`, description: "Eventdetails lesen" },
      { method: "PUT", path: `${prefix}/events/:eventUid`, description: "Event-Entwurf bearbeiten" },
      { method: "POST", path: `${prefix}/events/:eventUid/rename`, description: "EVS-27C-FIX1: Eventname bearbeiten, ohne Konfiguration oder Verlauf zu ändern" },
      { method: "POST", path: `${prefix}/events/:eventUid/validate`, description: "Event validieren" },
      { method: "POST", path: `${prefix}/events/:eventUid/start`, description: "Event starten, wenn startbereit und kein anderes Event aktiv ist" },
      { method: "POST", path: `${prefix}/events/:eventUid/finish`, description: "Event beenden und Ranking liefern" },
      { method: "POST", path: `${prefix}/events/:eventUid/cancel`, description: "Event abbrechen" },
      { method: "POST", path: `${prefix}/events/:eventUid/archive`, description: "EVS-21: Beendetes Event archivieren; nur status=finished" },
      { method: "POST", path: `${prefix}/events/:eventUid/delete`, description: "EVS-21: Event und zugehoerige Eventdaten mit confirm=DELETE loeschen" },
      { method: "POST", path: `${prefix}/events/:eventUid/duplicate`, description: "EVS-27C: Event-Konfiguration als neue Kopie ohne Punkte/Runden duplizieren" },
      { method: "GET", path: `${prefix}/events/:eventUid/ranking`, description: "Event-Ranking lesen" },
      { method: "POST", path: `${prefix}/events/:eventUid/points`, description: "Manuelle/Modul-Punkte buchen (nur aktives Event)" }
    ],
    notes: [
      "SOUND-SAFE-1 legt nur den Erweiterungspunkt fuer EventSound-Playback + Countdown-PreRoll fest; kein direktes Sound-/Video-Playback und kein Queue-Touch.",
      "EVENT-RUNTIME-1 liefert nur einen viewer-sicheren Overlay-State-Vertrag; das kombinierte Overlay wird noch nicht gebaut.",
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
  const textChatSubscription = registerTextChatSubscription();
  if (textChatSubscription && textChatSubscription.ok !== true) runtimeState.lastError = textChatSubscription.reason || textChatSubscription.error || runtimeState.lastError;

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

  reg("get", `${prefix}/text-runtime/status`, (req, res) => {
    try {
      sendJson(res, getTextRuntimeStatus());
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/text-runtime/report`, (req, res) => {
    try {
      sendJson(res, getTextRuntimeReport(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/sound-runtime/status`, (req, res) => {
    try {
      sendJson(res, getSoundRuntimeStatus(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/sound-runtime/report`, (req, res) => {
    try {
      sendJson(res, getSoundRuntimeReport(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/sound-runtime/safety-plan`, (req, res) => {
    try {
      sendJson(res, buildSoundRuntimeSafetyPlan(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/runtime-overlay/state`, (req, res) => {
    try {
      sendJson(res, getRuntimeOverlayState(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/sound-runtime/create-test-event`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, {
          ok: false,
          error: "confirm_required",
          hint: "POST /api/stream-events/sound-runtime/create-test-event?confirm=1 optional mit { start: true }"
        }, 400);
      }
      sendJson(res, createSoundRuntimeTestEvent(req.body || {}));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/next-round`, (req, res) => {
    try {
      const result = createSoundRound({ ...(req.body || {}), eventUid: (req.body && (req.body.eventUid || req.body.event_uid)) || req.query.eventUid || req.query.event_uid || "", allowReuse: boolValue((req.body && req.body.allowReuse) ?? req.query.allowReuse) });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/resolve`, (req, res) => {
    try {
      const result = resolveSoundRound({ ...(req.body || {}), eventUid: (req.body && (req.body.eventUid || req.body.event_uid)) || req.query.eventUid || req.query.event_uid || "" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/unresolved`, (req, res) => {
    try {
      const result = markSoundRoundUnresolved({ ...(req.body || {}), eventUid: (req.body && (req.body.eventUid || req.body.event_uid)) || req.query.eventUid || req.query.event_uid || "" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/test-chat`, (req, res) => {
    try {
      const body = req.body || {};
      const result = processSoundChatMessage({
        message: body.message || body.answer || body.text || req.query.message || req.query.answer || req.query.text,
        userLogin: body.userLogin || body.login || body.user || req.query.user || "soundtester",
        userDisplayName: body.userDisplayName || body.displayName || body.user || req.query.displayName || req.query.user || "SoundTester",
        messageId: body.messageId || req.query.messageId || newUid("test_sound_chat")
      }, { source: "api:sound-test-chat" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/chat-runtime/create-stealth-test-event`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, {
          ok: false,
          error: "confirm_required",
          hint: "POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1 optional mit { start: true }"
        }, 400);
      }
      sendJson(res, createCombinedRuntimeStealthTestEvent(req.body || {}));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/chat-runtime/test-chat`, (req, res) => {
    try {
      const body = req.body || {};
      const result = processParallelChatMessage({
        message: body.message || body.answer || body.text || req.query.message || req.query.answer || req.query.text,
        userLogin: body.userLogin || body.login || body.user || req.query.user || "stealthtester",
        userDisplayName: body.userDisplayName || body.displayName || body.user || req.query.displayName || req.query.user || "StealthTester",
        messageId: body.messageId || req.query.messageId || newUid("parallel_test_chat")
      }, { source: "api:parallel-test-chat", eventUid: body.eventUid || body.event_uid || req.query.eventUid || req.query.event_uid || "" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/runtime-gate/status`, (req, res) => {
    try {
      sendJson(res, {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        ...getRuntimeGateStatus({ eventUid: req.query.eventUid || req.query.event_uid || "" })
      });
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/chat-output/status`, (req, res) => {
    try {
      const eventUid = req.query.eventUid || req.query.event_uid || "";
      const report = getChatOutputDispatchReport(eventUid, { maxPreviewOutputs: req.query.maxPreviewOutputs });
      sendJson(res, {
        ok: report.ok,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        event: report.event,
        eventUid: report.eventUid,
        runtimeGate: getRuntimeGateStatus({ eventUid: report.eventUid }),
        config: report.config,
        counts: report.counts,
        blockedReasons: report.blockedReasons,
        directSend: false,
        dispatched: false,
        note: report.note,
        updatedAt: report.updatedAt
      });
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/chat-output/report`, (req, res) => {
    try {
      sendJson(res, getChatOutputDispatchReport(req.query.eventUid || req.query.event_uid || "", { maxPreviewOutputs: req.query.maxPreviewOutputs }));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/chat-output/test-dispatch`, (req, res) => {
    try {
      const result = testChatOutputDispatch(req.body || {});
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/statistics/users`, (req, res) => {
    try {
      sendJson(res, getStatisticsUsers(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/statistics/user/:login`, (req, res) => {
    try {
      sendJson(res, getStatisticsUser(req.params.login || req.query.login || "", req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/text-runtime/create-test-event`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, {
          ok: false,
          error: "confirm_required",
          hint: "POST /api/stream-events/text-runtime/create-test-event?confirm=1 optional mit { start: true }"
        }, 400);
      }
      sendJson(res, createTextRuntimeTestEvent(req.body || {}));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/text-runtime/test-chat`, (req, res) => {
    try {
      const body = req.body || {};
      const result = processTextChatMessage({
        message: body.message || body.text || req.query.message || req.query.text,
        userLogin: body.userLogin || body.login || body.user || req.query.user || "testuser",
        userDisplayName: body.userDisplayName || body.displayName || body.user || req.query.displayName || req.query.user || "TestUser",
        messageId: body.messageId || req.query.messageId || newUid("test_chat")
      }, { source: "api:test-chat" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
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

  reg("post", `${prefix}/events/:eventUid/rename`, (req, res) => {
    try {
      const result = renameEvent(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 200 : (result.error === "event_not_found" ? 404 : 400));
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

  reg("post", `${prefix}/events/:eventUid/archive`, (req, res) => {
    try {
      const result = archiveEvent(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/delete`, (req, res) => {
    try {
      const result = deleteEvent(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/events/:eventUid/duplicate`, (req, res) => {
    try {
      const result = duplicateEvent(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 201 : (result.error === "event_not_found" ? 404 : 400));
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
  renameEvent,
  startEvent,
  finishEvent,
  cancelEvent,
  archiveEvent,
  deleteEvent,
  duplicateEvent,
  getEventLifecycleCounts,
  addPoints,
  getRanking,
  getEventConfig,
  saveEventConfig,
  buildStatus,
  buildBusStatus,
  processTextChatMessage,
  processSoundChatMessage,
  getTextRuntimeStatus,
  getSoundRuntimeStatus,
  getSoundRuntimeReport,
  getChatOutputDispatchReport,
  testChatOutputDispatch,
  createSoundRound,
  resolveSoundRound,
  markSoundRoundUnresolved
};
