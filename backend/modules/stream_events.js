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
const http = require("http");

let streamStatusModule = null;
try { streamStatusModule = require("./stream_status"); } catch (_) { streamStatusModule = null; }

let twitchEventsModule = null;
try { twitchEventsModule = require("./twitch_events"); } catch (_) { twitchEventsModule = null; }

let soundSystemModule = null;
try { soundSystemModule = require("./sound_system"); } catch (_) { soundSystemModule = null; }

const MODULE_NAME = "stream_events";
const MODULE_VERSION = "0.5.66";
const MODULE_BUILD = "STEP_EVS50_5_POINTS_CHECK_ACTIVE_EVENT_FIX";
const SCHEMA_MODULE = "stream_events";
const SCHEMA_VERSION = 1;
const TEXT_MODULE = "stream_events";

const STATUS = {
  DRAFT: "draft",
  READY: "ready",
  ACTIVE: "active",
  FINISHED: "finished",
  FINALIZING: "finalizing",
  COMPLETED: "completed",
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
    preRollEnabled: true,
    preRollSeconds: 3,
    countdownPreRollEnabled: true,
    countdownPreRollSeconds: 3,
    outputTarget: "default",
    target: "both",
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
      "stream_events.sound.answer_missed",
      "stream_events.runtime.paused",
      "stream_events.runtime.resumed"
    ],
    consumes: [
      "twitch.stream.online",
      "twitch.stream.offline",
      "twitch.chat.message",
      "stream_events.runtime.countdown.start",
      "stream_events.runtime.guessing.start",
      "stream_events.runtime.hide"
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
    runtimeGateNoActiveEvent: 0,
    runtimeOverlayBusEvents: 0,
    soundRevealVideosRequested: 0,
    soundAutoAdvancesScheduled: 0,
    soundAutoAdvancesStarted: 0,
    soundWaitsSkipped: 0,
    eventsAutoFinished: 0,
    streamOfflinePauses: 0,
    streamOfflineAutoWaits: 0,
    streamRuntimeResumes: 0,
    streamOfflineAutoResumes: 0,
    eventFinalesStarted: 0,
    eventCommandsHandled: 0
  },
  runtimeOverlayBus: {
    subscribed: false,
    lastAction: "",
    lastEventId: "",
    lastAt: "",
    lastError: "",
    state: null
  },
  soundPlaybackBus: {
    subscribed: false,
    lastAction: "",
    lastEventId: "",
    lastAt: "",
    lastError: "",
    lastRoundUid: ""
  },
  streamStateBus: {
    subscribed: false,
    lastAction: "",
    lastEventKey: "",
    lastAt: "",
    lastError: "",
    lastResult: null
  }
};

const soundAnswerTimers = new Map();
const soundAutoAdvanceTimers = new Map();
const soundRevealTimers = new Map();

function clearTimerMapEntry(map, key) {
  const item = map.get(key);
  if (item) {
    const timer = item && typeof item === "object" && item.timer ? item.timer : item;
    if (timer) clearTimeout(timer);
  }
  map.delete(key);
}

function clearSoundRuntimeTimersForEvent(eventUid = "") {
  const uid = cleanString(eventUid);
  if (!uid) return;
  for (const [roundUid, item] of Array.from(soundAnswerTimers.entries())) {
    if (item && item.eventUid === uid) clearTimerMapEntry(soundAnswerTimers, roundUid);
  }
  for (const [roundUid, item] of Array.from(soundRevealTimers.entries())) {
    if (item && item.eventUid === uid) clearTimerMapEntry(soundRevealTimers, roundUid);
  }
  clearTimerMapEntry(soundAutoAdvanceTimers, uid);
}

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

function firstObjectLikeUserInfo(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value.map(firstObjectLikeUserInfo).find(Boolean) || null;
  if (typeof value === "object") {
    if (value.login || value.userLogin || value.user_login || value.display_name || value.displayName || value.profile_image_url || value.profileImageUrl || value.avatarUrl || value.avatar_url) return value;
    for (const key of ["data", "user", "userInfo", "userinfo", "result", "payload"]) {
      const found = firstObjectLikeUserInfo(value[key]);
      if (found) return found;
    }
  }
  return null;
}

function normalizeTwitchUserInfoObject(input, fallbackLogin = "") {
  const obj = firstObjectLikeUserInfo(input) || {};
  const login = cleanString(obj.login || obj.user_login || obj.userLogin || obj.name || fallbackLogin).replace(/^@/, "").toLowerCase();
  const displayName = cleanString(obj.display_name || obj.displayName || obj.user_display_name || obj.userDisplayName || obj.name || login, login);
  const avatarUrl = cleanString(obj.profile_image_url || obj.profileImageUrl || obj.avatar_url || obj.avatarUrl || obj.profileImage || "");
  return { login, displayName, avatarUrl, raw: obj };
}

function internalJsonRequest(method, pathName, payload = {}) {
  const body = JSON.stringify(payload || {});
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port: Number(process.env.PORT || 8080) || 8080,
      path: pathName,
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, res => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) { parsed = { raw: data }; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: parsed });
      });
    });
    req.on("error", err => resolve({ ok: false, error: err && err.message ? err.message : String(err) }));
    req.write(body);
    req.end();
  });
}

function resolveUserFromLocalTables(login = "") {
  const userLogin = cleanString(login).replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, login: "", displayName: "", avatarUrl: "", source: "", error: "login_missing" };
  const candidates = [
    {
      table: "birthday_show_profiles",
      sql: "SELECT user_login AS login, display_name_override AS displayName, avatar_url AS avatarUrl FROM birthday_show_profiles WHERE user_login = :login"
    },
    {
      table: "birthday_users",
      sql: "SELECT user_login AS login, user_display_name AS displayName, avatar_url AS avatarUrl FROM birthday_users WHERE user_login = :login"
    },
    {
      table: "twitch_presence_activity",
      sql: "SELECT user_login AS login, user_display_name AS displayName, '' AS avatarUrl FROM twitch_presence_activity WHERE user_login = :login"
    }
  ];
  for (const candidate of candidates) {
    try {
      const cols = typeof database.tableColumns === "function" ? new Set(database.tableColumns(candidate.table)) : null;
      if (cols && cols.size === 0) continue;
      const row = database.get(candidate.sql, { login: userLogin });
      if (!row) continue;
      const info = normalizeTwitchUserInfoObject(row, userLogin);
      if (info.login || info.displayName || info.avatarUrl) return { ok: true, source: `db:${candidate.table}`, ...info };
    } catch (_) {}
  }
  return { ok: false, login: userLogin, displayName: userLogin, avatarUrl: "", source: "", error: "local_user_not_found" };
}

async function resolveTwitchUserInfoSmall(login = "") {
  const userLogin = cleanString(login).replace(/^@/, "").toLowerCase();
  if (!userLogin) return { ok: false, login: "", displayName: "", avatarUrl: "", source: "", error: "login_missing" };

  const local = resolveUserFromLocalTables(userLogin);
  if (local.ok && (local.avatarUrl || local.displayName)) return local;

  const endpoints = [
    `/userinfo?login=${encodeURIComponent(userLogin)}`,
    `/api/twitch/userinfo?login=${encodeURIComponent(userLogin)}`,
    `/api/twitch/user?login=${encodeURIComponent(userLogin)}`
  ];
  for (const endpoint of endpoints) {
    const result = await internalJsonRequest("GET", endpoint, {});
    if (!result.ok) continue;
    const info = normalizeTwitchUserInfoObject(result.data, userLogin);
    if (info.login || info.displayName || info.avatarUrl) return { ok: true, source: endpoint, ...info };
  }

  return local.ok ? local : { ok: false, login: userLogin, displayName: userLogin, avatarUrl: "", source: "", error: "userinfo_unavailable" };
}

function mergeRoundResultData(roundUid = "", patch = {}) {
  const uid = cleanString(roundUid);
  if (!uid) return { ok: false, error: "round_uid_missing" };
  const row = database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid", { roundUid: uid });
  if (!row) return { ok: false, error: "round_not_found", roundUid: uid };
  const round = rowToRound(row);
  const existing = round && round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  const next = { ...existing, ...patch };
  database.updateByKey("stream_events_rounds", "round_uid", uid, {
    result_json: jsonEncode(next),
    updated_at: nowIso()
  });
  return { ok: true, roundUid: uid, resultData: next };
}

function scheduleSolvedUserAvatarResolve(roundUid = "", userLogin = "", fallbackDisplayName = "", fallbackAvatarUrl = "") {
  const uid = cleanString(roundUid);
  const login = cleanString(userLogin).replace(/^@/, "").toLowerCase();
  if (!uid || !login) return { ok: false, skipped: true, reason: "round_or_login_missing" };
  if (cleanString(fallbackAvatarUrl)) return { ok: true, skipped: true, reason: "avatar_already_available" };
  setTimeout(() => {
    resolveTwitchUserInfoSmall(login)
      .then(info => {
        const displayName = cleanString(info.displayName || fallbackDisplayName || login, login);
        const avatarUrl = cleanString(info.avatarUrl || fallbackAvatarUrl || "");
        if (!displayName && !avatarUrl) return;
        mergeRoundResultData(uid, {
          userDisplayName: displayName,
          userAvatarUrl: avatarUrl,
          userResolvedAt: nowIso(),
          userResolveSource: cleanString(info.source || "unknown"),
          userResolveOk: info.ok === true
        });
        publishStatus("sound.user_resolved", { roundUid: uid, userLogin: login, userDisplayName: displayName, avatarResolved: !!avatarUrl });
      })
      .catch(err => {
        runtimeState.lastError = `[sound_user_resolve] ${err && err.message ? err.message : String(err)}`;
      });
  }, 250).unref?.();
  return { ok: true, scheduled: true, roundUid: uid, userLogin: login };
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
  cfg.soundDefaults.preRollEnabled = boolValue(cfg.soundDefaults.preRollEnabled, true);
  cfg.soundDefaults.preRollSeconds = clampNumber(cfg.soundDefaults.preRollSeconds, 0, 30, 3);
  cfg.soundDefaults.countdownPreRollEnabled = boolValue(cfg.soundDefaults.countdownPreRollEnabled, true);
  cfg.soundDefaults.countdownPreRollSeconds = clampNumber(cfg.soundDefaults.countdownPreRollSeconds, 0, 30, 3);
  cfg.soundDefaults.outputTarget = normalizePolicy(cfg.soundDefaults.outputTarget, ["default", "overlay", "device", "both"], "default");
  cfg.soundDefaults.target = normalizePolicy(cfg.soundDefaults.target, ["stream", "discord", "both"], "both");
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

    database.exec(`
      CREATE TABLE IF NOT EXISTS stream_events_runtime_state (
        id ${database.primaryKeyAutoIncrementSql()},
        event_uid TEXT NOT NULL UNIQUE,
        runtime_status TEXT NOT NULL DEFAULT 'active',
        phase TEXT NOT NULL DEFAULT 'unknown',
        active_round_uid TEXT NOT NULL DEFAULT '',
        phase_started_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
        phase_ends_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
        next_auto_start_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
        last_heartbeat_at ${database.dateTimeTypeSql()} NOT NULL DEFAULT '',
        recovery_required ${database.boolTypeSql()} NOT NULL DEFAULT 0,
        recovery_reason TEXT NOT NULL DEFAULT '',
        recovery_note TEXT NOT NULL DEFAULT '',
        updated_at ${database.dateTimeTypeSql()} NOT NULL,
        metadata_json ${database.jsonTypeSql()} NOT NULL
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_runtime_state_event ON stream_events_runtime_state(event_uid);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_stream_events_runtime_state_status ON stream_events_runtime_state(runtime_status);`);

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
  event.startable = event.validation && event.validation.ok === true && event.status !== STATUS.ACTIVE && event.status !== STATUS.FINISHED && event.status !== STATUS.FINALIZING && event.status !== STATUS.COMPLETED && event.status !== STATUS.CANCELLED && event.status !== STATUS.ARCHIVED;
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
  // EVS43: RuntimeGate must use twitch_events as the effective stream-state owner.
  // This respects manual overrides and avoids falling back to raw Twitch API while the
  // dashboard clearly shows ONLINE (Override). stream_status remains diagnostic only.
  if (twitchEventsModule && typeof twitchEventsModule.getStreamState === "function") {
    try {
      const state = twitchEventsModule.getStreamState() || {};
      const manualOverride = state.manualOverride && typeof state.manualOverride === "object" ? state.manualOverride : {};
      const manualOverrideActive = manualOverride.active === true;
      const online = state.live === true || String(state.status || "").toLowerCase() === "live" || String(state.status || "").toLowerCase() === "online";
      const known = state.known !== false && !state.lastError;
      const stale = state.stale === true;
      let reason = online ? "stream_online" : "stream_offline";
      if (manualOverrideActive && online) reason = "manual_override_online";
      if (!known && !manualOverrideActive) reason = "stream_state_unknown";
      if (stale && !manualOverrideActive) reason = "stream_state_stale";
      return {
        ok: true,
        available: true,
        online,
        live: online,
        statusKnown: known || manualOverrideActive,
        stale: manualOverrideActive ? false : stale,
        reason,
        label: online ? (manualOverrideActive ? "Stream online (Override)" : "Stream online") : (known ? "Stream offline" : "Stream-Status unbekannt"),
        source: cleanString(state.source || (manualOverrideActive ? "manual_override" : "twitch_events")),
        effectiveSource: "twitch_events_stream_state",
        manualOverrideActive,
        confidence: cleanString(state.confidence || ""),
        streamId: cleanString(state.streamId || ""),
        title: cleanString(state.title || ""),
        gameName: cleanString(state.gameName || ""),
        startedAt: cleanString(state.startedAt || ""),
        streamSessionId: cleanString(state.streamSessionId || ""),
        streamDayId: cleanString(state.streamDayId || ""),
        lastCheckedAt: cleanString(state.lastCheckedAt || state.lastChangedAt || state.lastPublishedAt || ""),
        lastError: cleanString(state.lastError || ""),
        sources: state.sources && typeof state.sources === "object" ? state.sources : {},
        manualOverride
      };
    } catch (err) {
      return { ok: false, available: true, online: false, live: false, statusKnown: false, stale: true, reason: "twitch_events_stream_state_error", label: "Stream-State Fehler", source: "twitch_events", effectiveSource: "twitch_events_stream_state", lastError: err && err.message ? err.message : String(err) };
    }
  }

  if (!streamStatusModule || typeof streamStatusModule.getCurrentStatus !== "function") {
    return { ok: false, available: false, online: false, live: false, statusKnown: false, stale: true, reason: "stream_status_unavailable", label: "Stream-Status nicht verfügbar", source: "stream_status_fallback" };
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
      effectiveSource: "stream_status_fallback",
      manualOverrideActive: false,
      streamId: cleanString(status.streamId || status.stream_id || ""),
      title: cleanString(status.title || ""),
      gameName: cleanString(status.gameName || status.game_name || ""),
      startedAt: cleanString(status.startedAt || status.streamStartedAt || status.stream_started_at || ""),
      lastCheckedAt: cleanString(status.lastCheckedAt || status.checkedAt || status.updatedAt || ""),
      lastError: cleanString(status.lastError || "")
    };
  } catch (err) {
    return { ok: false, available: true, online: false, live: false, statusKnown: false, stale: true, reason: "stream_status_error", label: "Stream-Status Fehler", source: "stream_status_fallback", effectiveSource: "stream_status_fallback", manualOverrideActive: false, lastError: err && err.message ? err.message : String(err) };
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

  let eventRuntimeState = activeEvent ? getEventRuntimeState(activeEvent.eventUid) : null;
  const offlineWaiting = activeEvent ? isEventRuntimeOfflineWaiting(activeEvent.eventUid, eventRuntimeState) : false;
  if (activeEvent && offlineWaiting && stream.online) {
    resumeStreamOfflineWaitingEvents("runtime_gate_stream_online", { source: "getRuntimeGateStatus" });
    eventRuntimeState = getEventRuntimeState(activeEvent.eventUid);
  }
  const runtimePaused = isEventRuntimePaused(activeEvent ? activeEvent.eventUid : "", eventRuntimeState);
  const runtimeOfflineWaiting = activeEvent ? isEventRuntimeOfflineWaiting(activeEvent.eventUid, eventRuntimeState) : false;

  if (!hasActiveEvent) {
    reason = "no_active_event";
    label = "Kein Event läuft";
  } else if (runtimePaused) {
    reason = eventRuntimeState && eventRuntimeState.recoveryReason ? eventRuntimeState.recoveryReason : "event_runtime_paused";
    label = "Event pausiert";
  } else if (runtimeOfflineWaiting) {
    reason = stream.online ? "stream_online_auto_resume_pending" : (stream.reason || "stream_offline_waiting");
    label = stream.online ? "Stream online – Event wird fortgesetzt" : "Stream offline – Event wartet automatisch";
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
    runtimePaused,
    runtimeOfflineWaiting,
    eventRuntimeState,
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
    answerSeconds: clampNumber(raw.answerSeconds ?? raw.defaultAnswerSeconds ?? base.defaultAnswerSeconds, 5, 3600, 60),
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
    preRollEnabled: raw.preRollEnabled !== undefined ? boolValue(raw.preRollEnabled) : boolValue(base.preRollEnabled, true),
    preRollSeconds: clampNumber(raw.preRollSeconds ?? base.preRollSeconds, 0, 30, 3),
    countdownPreRollEnabled: raw.countdownPreRollEnabled !== undefined ? boolValue(raw.countdownPreRollEnabled) : boolValue(base.countdownPreRollEnabled, true),
    countdownPreRollSeconds: clampNumber(raw.countdownPreRollSeconds ?? base.countdownPreRollSeconds, 0, 30, 3),
    outputTarget: normalizePolicy(raw.outputTarget ?? raw.soundOutputTarget ?? base.outputTarget, ["default", "overlay", "device", "both"], "default"),
    target: normalizePolicy(raw.target ?? raw.soundTarget ?? base.target, ["stream", "discord", "both"], "both")
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
  if ([STATUS.FINISHED, STATUS.FINALIZING, STATUS.COMPLETED, STATUS.CANCELLED, STATUS.ARCHIVED].includes(event.status)) return { ok: false, error: "event_already_final", eventUid, status: event.status };

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


function closeActiveSoundRoundsForEvent(eventUid, reason = "event_finalized") {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return { ok: false, closed: 0, error: "event_uid_required" };
  const beforeRow = database.get("SELECT COUNT(*) AS count FROM stream_events_rounds WHERE event_uid = :eventUid AND status = 'active'", { eventUid: uid });
  const before = intValue(beforeRow && beforeRow.count, 0);
  if (before <= 0) return { ok: true, closed: 0, eventUid: uid, reason };
  const now = nowIso();
  database.run(`
    UPDATE stream_events_rounds
    SET status = :status,
        result = :result,
        finished_at = CASE WHEN finished_at = '' THEN :now ELSE finished_at END,
        updated_at = :now,
        result_json = :resultJson
    WHERE event_uid = :eventUid AND status = 'active'
  `, {
    eventUid: uid,
    status: reason === "event_finished" ? "event_finished" : "cancelled",
    result: reason,
    now,
    resultJson: jsonEncode({ autoClosed: true, reason, closedAt: now, step: "EVENT-SOUND-4D" })
  });
  const afterRow = database.get("SELECT COUNT(*) AS count FROM stream_events_rounds WHERE event_uid = :eventUid AND status = 'active'", { eventUid: uid });
  const after = intValue(afterRow && afterRow.count, 0);
  return { ok: true, eventUid: uid, reason, closed: Math.max(0, before - after), before, after };
}

function cleanupSoundRuntimeTestState(options = {}) {
  ensureSchema();
  const includeCurrentActive = boolValue(options.includeCurrentActive, false);
  const forceAllTestEvents = boolValue(options.forceAllTestEvents, false);
  const where = [
    "sound_enabled = 1",
    "(created_by = 'evs_test_helper' OR name = 'EVS Sound-Runtime Test' OR metadata_json LIKE '%sound-runtime-test-event%')"
  ];
  if (!forceAllTestEvents) where.push("status = 'active'");
  const rows = database.all(`
    SELECT event_uid, name, status, created_by, metadata_json
    FROM stream_events_events
    WHERE ${where.join(" AND ")}
    ORDER BY started_at DESC, id DESC
    LIMIT 25
  `, {});
  const cleaned = [];
  for (const row of rows) {
    const uid = row.event_uid || "";
    clearSoundRuntimeTimersForEvent(uid);
    const roundCleanup = closeActiveSoundRoundsForEvent(uid, "test_state_cleanup");
    let eventCancelled = false;
    if (row.status === STATUS.ACTIVE || includeCurrentActive) {
      const now = nowIso();
      database.updateByKey("stream_events_events", "event_uid", uid, {
        status: STATUS.CANCELLED,
        cancelled_at: row.status === STATUS.CANCELLED ? "" : now,
        updated_at: now
      });
      eventCancelled = true;
    }
    cleaned.push({ eventUid: uid, name: row.name || "", previousStatus: row.status || "", eventCancelled, roundCleanup });
  }
  publishStatus("sound.test_state_cleanup", { cleaned: cleaned.length });
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, step: "EVENT-SOUND-4D", cleanedCount: cleaned.length, cleaned };
}

function getSolvedSoundSnippetUidSet(eventUid = "") {
  ensureSchema();
  const rows = database.all(`
    SELECT DISTINCT item_uid
    FROM stream_events_rounds
    WHERE event_uid = :eventUid AND game_type = 'sound' AND status = 'solved'
  `, { eventUid: cleanString(eventUid) });
  return new Set(rows.map(row => cleanString(row.item_uid)).filter(Boolean));
}

function getEventRuntimePartsStatus(event = null) {
  ensureSchema();
  const selectedEvent = event && event.eventUid ? event : null;
  if (!selectedEvent) {
    return {
      ok: true,
      eventUid: "",
      enabledParts: [],
      allConfiguredPartsCompleted: false,
      sound: { enabled: false, status: "disabled", completed: true },
      text: { enabled: false, status: "disabled", completed: true }
    };
  }

  const eventUid = selectedEvent.eventUid;
  const snippets = getSoundSnippets(selectedEvent);
  const soundRounds = getSoundRounds(eventUid, 500);
  const solvedSoundUids = new Set(soundRounds.filter(row => row.status === "solved").map(row => cleanString(row.itemUid)).filter(Boolean));
  const activeSoundRound = soundRounds.find(row => row.status === "active") || null;
  const unresolvedSoundCount = soundRounds.filter(row => row.status === "unresolved").length;
  const soundRemaining = snippets.filter(item => !solvedSoundUids.has(item.snippetUid));
  const soundEnabled = selectedEvent.soundEnabled === true;
  const soundCompleted = !soundEnabled || (snippets.length > 0 && soundRemaining.length === 0 && !activeSoundRound);

  const phrases = getTextPhrases(selectedEvent);
  const solvedPhraseRows = selectedEvent.textEnabled ? database.all(`
    SELECT DISTINCT phrase_uid
    FROM stream_events_text_phrase_solves
    WHERE event_uid = :eventUid
  `, { eventUid }) : [];
  const solvedPhraseUids = new Set(solvedPhraseRows.map(row => cleanString(row.phrase_uid)).filter(Boolean));
  const textRemaining = phrases.filter(item => !solvedPhraseUids.has(item.phraseUid));
  const textEnabled = selectedEvent.textEnabled === true;
  const textCompleted = !textEnabled || (phrases.length > 0 && textRemaining.length === 0);

  const enabledParts = [];
  if (soundEnabled) enabledParts.push("sound");
  if (textEnabled) enabledParts.push("text");
  const allConfiguredPartsCompleted = enabledParts.length > 0 && soundCompleted && textCompleted;

  return {
    ok: true,
    eventUid,
    enabledParts,
    allConfiguredPartsCompleted,
    canAutoFinish: selectedEvent.status === STATUS.ACTIVE && allConfiguredPartsCompleted,
    sound: {
      enabled: soundEnabled,
      status: !soundEnabled ? "disabled" : (soundCompleted ? "completed" : (activeSoundRound ? "running" : "waiting")),
      completed: soundCompleted,
      total: snippets.length,
      solved: solvedSoundUids.size,
      remaining: soundRemaining.length,
      unresolved: unresolvedSoundCount,
      activeRoundUid: activeSoundRound ? activeSoundRound.roundUid : "",
      note: "Nur geloeste Sound-Schnipsel zaehlen als abgeschlossen. Unresolved bleibt nicht abgeschlossen und kann spaeter erneut kommen."
    },
    text: {
      enabled: textEnabled,
      status: !textEnabled ? "disabled" : (textCompleted ? "completed" : "running"),
      completed: textCompleted,
      total: phrases.length,
      solved: solvedPhraseUids.size,
      remaining: textRemaining.length,
      note: "Text/Saetze sind erst abgeschlossen, wenn alle konfigurierten Saetze geloest sind."
    }
  };
}

function maybeAutoFinishEventIfPartsCompleted(eventUid = "", reason = "parts_completed") {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event || event.status !== STATUS.ACTIVE) return { ok: true, skipped: true, reason: "event_not_active", eventUid: cleanString(eventUid) };
  const parts = getEventRuntimePartsStatus(event);
  if (!parts.canAutoFinish) {
    return { ok: true, skipped: true, reason: "parts_not_completed", eventUid: event.eventUid, parts };
  }
  runtimeState.counters.eventsAutoFinished += 1;
  const result = finalizeEvent(event.eventUid, STATUS.FINISHED, "finished");
  emitBus("stream_events.event", "auto_finished", { eventUid: event.eventUid, reason, parts, result: result && result.ok === true });
  publishStatus("event.auto_finished", { lastEventUid: event.eventUid, reason });
  return { ok: true, autoFinished: true, reason, parts, result };
}

function finalizeEvent(eventUid, status, action, options = {}) {
  ensureSchema();
  const event = getEventByUid(eventUid);
  if (!event) return { ok: false, error: "event_not_found", eventUid };
  if ([STATUS.FINISHED, STATUS.FINALIZING, STATUS.COMPLETED, STATUS.CANCELLED, STATUS.ARCHIVED].includes(event.status)) {
    return { ok: true, alreadyFinal: true, event, ranking: getRanking(eventUid).rows, winnerPreview: event.status === STATUS.FINISHED ? buildWinnerFinalePreview(eventUid) : null };
  }
  clearSoundRuntimeTimersForEvent(eventUid);
  const now = nowIso();
  const parts = getEventRuntimePartsStatus(event);
  const previousMetadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  const metadata = safeJson({ ...previousMetadata }, {});
  if (status === STATUS.FINISHED) {
    metadata.finishedMode = cleanString(options.mode || (parts.allConfiguredPartsCompleted ? "auto" : "manual"), "manual");
    metadata.finishedReason = cleanString(options.reason || action || "finished", "finished");
    metadata.finishedBy = cleanString(options.actor || options.createdBy || "system", "system");
    metadata.finishedAt = now;
    metadata.partsAtFinish = parts;
    metadata.manualFinish = metadata.finishedMode === "manual";
    metadata.openPartsAtManualFinish = parts.allConfiguredPartsCompleted ? [] : [
      parts.sound && parts.sound.enabled && !parts.sound.completed ? { part: "sound", remaining: parts.sound.remaining || 0, activeRoundUid: parts.sound.activeRoundUid || "" } : null,
      parts.text && parts.text.enabled && !parts.text.completed ? { part: "text", remaining: parts.text.remaining || 0 } : null
    ].filter(Boolean);
  }
  if (status === STATUS.CANCELLED) {
    metadata.cancelledReason = cleanString(options.reason || action || "cancelled", "cancelled");
    metadata.cancelledBy = cleanString(options.actor || options.createdBy || "system", "system");
    metadata.cancelledAt = now;
  }
  const patch = {
    status,
    updated_at: now,
    metadata_json: jsonEncode(metadata)
  };
  if (status === STATUS.FINISHED) patch.finished_at = now;
  if (status === STATUS.CANCELLED) patch.cancelled_at = now;
  database.updateByKey("stream_events_events", "event_uid", eventUid, patch);
  const activeRoundCleanup = closeActiveSoundRoundsForEvent(eventUid, status === STATUS.FINISHED ? "event_finished" : "event_cancelled");
  upsertEventRuntimeState(eventUid, {
    runtimeStatus: status === STATUS.FINISHED ? "finished" : "cancelled",
    phase: status === STATUS.FINISHED ? "winner_ready" : "cancelled",
    activeRoundUid: "",
    phaseStartedAt: now,
    phaseEndsAt: "",
    nextAutoStartAt: "",
    lastHeartbeatAt: now,
    recoveryRequired: false,
    recoveryReason: action,
    recoveryNote: status === STATUS.FINISHED ? "Event ist beendet. Gewinner-Finale darf manuell gestartet werden." : "Event wurde abgebrochen.",
    metadata: { moduleBuild: MODULE_BUILD, action, parts }
  });

  if (status === STATUS.FINISHED) runtimeState.counters.eventsFinished += 1;
  if (status === STATUS.CANCELLED) runtimeState.counters.eventsCancelled += 1;
  markAction(action, eventUid);
  const updated = getEventByUid(eventUid);
  const ranking = getRanking(eventUid);
  const winnerPreview = status === STATUS.FINISHED ? buildWinnerFinalePreview(eventUid) : null;
  emitBus("stream_events.event", action, { event: publicEventSummary(updated), ranking: ranking.rows, winnerPreview, manualFinish: metadata.manualFinish === true });
  publishStatus(`event.${action}`, { lastEventUid: eventUid });
  return { ok: true, event: updated, activeRoundCleanup, ranking: ranking.rows, winnerPreview, parts, manualFinish: metadata.manualFinish === true };
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
  const userAvatarUrl = cleanString(
    user.profile_image_url || user.profileImageUrl || user.avatarUrl || user.avatar_url ||
    twitch.profile_image_url || twitch.profileImageUrl || twitch.avatarUrl || twitch.avatar_url ||
    payload.profile_image_url || payload.profileImageUrl || payload.avatarUrl || payload.avatar_url
  );
  const messageId = cleanString(twitch.messageId || twitch.message_id || payload.messageId || payload.message_id || envelope.id);
  return { message, userLogin, userDisplayName, userAvatarUrl, messageId, raw: twitch };
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
  const partStatus = solved.length > 0 ? getEventRuntimePartsStatus(getEventByUid(event.eventUid)) : null;
  const autoFinish = partStatus && partStatus.text && partStatus.text.completed ? maybeAutoFinishEventIfPartsCompleted(event.eventUid, "text_part_completed") : null;
  runtimeState.counters.textMessagesProcessed += 1;
  return { ok: true, eventUid: event.eventUid, solved, wordHits, chatOutputs, solvedCount: solved.length, wordHitCount: wordHits.length, chatOutputCount: chatOutputs.length, partStatus, autoFinish };
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
  const commandResult = processEventCommand(chat);
  if (commandResult) return commandResult;
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

function handleSoundPlaybackBusEnvelope(envelope = {}) {
  const payload = envelope && envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {};
  const item = payload.item && typeof payload.item === "object" ? payload.item : {};
  const meta = item.meta && typeof item.meta === "object" ? item.meta : {};
  const action = cleanString(envelope.action || payload.action || "");
  const eventUid = cleanString(meta.eventUid || meta.streamEventUid || payload.eventUid || "");
  const roundUid = cleanString(meta.roundUid || meta.streamEventRoundUid || payload.roundUid || "");
  const category = cleanString(item.category || "");
  const isReveal = meta.revealVideo === true || category === "stream_event_reveal_video";
  if (!eventUid || !roundUid) return { ok: true, skipped: true, reason: "not_stream_event_round_playback" };
  if (isReveal) return { ok: true, skipped: true, reason: "reveal_video_does_not_open_answer_window", eventUid, roundUid };
  if (category && category !== "stream_event_sound_snippet") return { ok: true, skipped: true, reason: "not_sound_snippet_category", category, eventUid, roundUid };

  const round = rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid }));
  if (!round || round.eventUid !== eventUid) return { ok: true, skipped: true, reason: "round_missing_or_event_mismatch", eventUid, roundUid };
  if (round.status !== "active") return { ok: true, skipped: true, reason: "round_not_active", status: round.status, eventUid, roundUid };
  if (isSoundAnswerWindowOpen(round) || soundAnswerTimers.has(roundUid)) return { ok: true, skipped: true, reason: "answer_window_already_started", eventUid, roundUid };

  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const runtimeConfig = round.config && round.config.runtimeConfig ? round.config.runtimeConfig : getSoundRuntimeConfig(getEventByUid(eventUid));
  const answerSeconds = getEffectiveSoundAnswerSeconds(runtimeConfig);
  const result = scheduleSoundAnswerTimer(eventUid, roundUid, answerSeconds, {
    reason: action === "client.audio_ended" ? "sound_audio_ended" : "sound_playback_finished",
    playbackAction: action,
    requestId: cleanString(item.requestId || "")
  });
  runtimeState.soundPlaybackBus.lastAction = action;
  runtimeState.soundPlaybackBus.lastEventId = cleanString(envelope.id || envelope.eventId || "");
  runtimeState.soundPlaybackBus.lastAt = nowIso();
  runtimeState.soundPlaybackBus.lastError = result && result.ok === false ? cleanString(result.error) : "";
  runtimeState.soundPlaybackBus.lastRoundUid = roundUid;
  return result;
}

function registerSoundPlaybackBusSubscription() {
  const bus = getBus();
  if (!bus || typeof bus.subscribe !== "function") return { ok: false, reason: "communication_bus_subscribe_unavailable" };
  const actions = ["client.audio_ended", "finished"];
  const results = [];
  for (const action of actions) {
    const result = bus.subscribe({
      id: `${MODULE_NAME}:sound_playback:${action}`,
      module: MODULE_NAME,
      channel: "sound",
      action,
      meta: { step: MODULE_BUILD, purpose: "start_sound_answer_window_after_sound_audio_end" }
    }, (envelope) => handleSoundPlaybackBusEnvelope(envelope));
    results.push(result);
  }
  const ok = results.every(result => result && result.ok === true);
  runtimeState.soundPlaybackBus.subscribed = ok;
  runtimeState.soundPlaybackBus.lastError = ok ? "" : "sound_playback_subscription_failed";
  if (ok) publishStatus("sound.playback.subscription.ready", { soundPlaybackBusSubscription: true, actionCount: actions.length });
  return { ok, results };
}

function normalizeRuntimeOverlayBusPayload(envelope = {}) {
  const payload = envelope && envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {};
  const action = cleanString(envelope.action || payload.action || "");
  const mode = cleanString(payload.mode || (action === "countdown.start" ? "countdown" : (action === "guessing.start" ? "guessing" : "hidden")), "hidden");
  const seconds = clampNumber(payload.seconds, 1, 30, 3);
  const nowMs = Date.now();
  const payloadStartedAtMs = Number(payload.phaseStartedAtMs || payload.countdownStartedAtMs || payload.emittedAtMs || 0);
  const phaseStartedAtMs = Number.isFinite(payloadStartedAtMs) && payloadStartedAtMs > 0 ? payloadStartedAtMs : nowMs;
  let countdownEndsAtMs = Number(payload.countdownEndsAtMs || 0);
  if (!Number.isFinite(countdownEndsAtMs) || countdownEndsAtMs <= 0) countdownEndsAtMs = phaseStartedAtMs + (seconds * 1000);

  let ttlMs = 8000;
  let expiresAtMs = nowMs + ttlMs;
  if (mode === "countdown") {
    expiresAtMs = Math.max(countdownEndsAtMs + 600, nowMs + 600);
  } else if (mode === "guessing") {
    ttlMs = 30000;
    expiresAtMs = nowMs + ttlMs;
  } else if (mode === "hidden") {
    ttlMs = 1200;
    expiresAtMs = nowMs + ttlMs;
  }

  return {
    action,
    mode,
    visible: mode !== "hidden",
    eventId: cleanString(envelope.id || envelope.eventId || payload.eventId || ""),
    phaseKey: cleanString(payload.phaseKey || `${mode}:${cleanString(payload.requestId)}:${phaseStartedAtMs}`),
    eventUid: cleanString(payload.eventUid),
    roundUid: cleanString(payload.roundUid),
    requestId: cleanString(payload.requestId),
    soundId: cleanString(payload.soundId),
    label: cleanString(payload.label),
    seconds,
    startedAtMs: phaseStartedAtMs,
    phaseStartedAtMs,
    countdownStartedAtMs: mode === "countdown" ? phaseStartedAtMs : Number(payload.countdownStartedAtMs || 0) || null,
    countdownEndsAtMs: mode === "countdown" ? countdownEndsAtMs : Number(payload.countdownEndsAtMs || 0) || null,
    expiresAtMs,
    finalLabel: cleanString(payload.finalLabel, "LOS!"),
    caption: cleanString(payload.caption, "Sound startet gleich"),
    guessingLabel: cleanString(payload.guessingLabel, "Jetzt raten!"),
    owner: cleanString(payload.owner, "sound_system"),
    playbackOwner: cleanString(payload.playbackOwner, "sound_system"),
    overlayStartsSound: payload.overlayStartsSound === true,
    sourceModule: envelope.source && envelope.source.module ? cleanString(envelope.source.module) : "",
    receivedAt: nowIso()
  };
}

function handleRuntimeOverlayBusEnvelope(envelope = {}) {
  const normalized = normalizeRuntimeOverlayBusPayload(envelope);
  const current = runtimeState.runtimeOverlayBus.state || null;
  if (current && current.phaseKey && normalized.phaseKey && current.phaseKey === normalized.phaseKey && current.action === normalized.action) {
    runtimeState.runtimeOverlayBus.lastAt = nowIso();
    return { ok: true, action: normalized.action, mode: normalized.mode, deduped: true };
  }
  runtimeState.runtimeOverlayBus.state = normalized;
  runtimeState.runtimeOverlayBus.lastAction = normalized.action;
  runtimeState.runtimeOverlayBus.lastEventId = normalized.eventId;
  runtimeState.runtimeOverlayBus.lastAt = nowIso();
  runtimeState.runtimeOverlayBus.lastError = "";
  runtimeState.counters.runtimeOverlayBusEvents += 1;
  publishStatus("runtime_overlay.bus_event", { lastRuntimeOverlayAction: normalized.action, runtimeOverlayMode: normalized.mode, phaseKey: normalized.phaseKey });
  return { ok: true, action: normalized.action, mode: normalized.mode, phaseKey: normalized.phaseKey };
}

function registerRuntimeOverlayBusSubscription() {
  const bus = getBus();
  if (!bus || typeof bus.subscribe !== "function") return { ok: false, reason: "communication_bus_subscribe_unavailable" };
  const actions = ["countdown.start", "guessing.start", "hide", "cancel", "failed"];
  const results = [];
  for (const action of actions) {
    const result = bus.subscribe({
      id: `${MODULE_NAME}:runtime_overlay:${action}`,
      module: MODULE_NAME,
      channel: "stream_events.runtime",
      action,
      meta: { step: MODULE_BUILD, purpose: "stream_events_runtime_overlay_state_bridge", acceptedSource: "sound_system" }
    }, (envelope) => handleRuntimeOverlayBusEnvelope(envelope));
    results.push(result);
  }
  const ok = results.every(result => result && result.ok === true);
  runtimeState.runtimeOverlayBus.subscribed = ok;
  runtimeState.runtimeOverlayBus.lastError = ok ? "" : "runtime_overlay_subscription_failed";
  if (ok) publishStatus("runtime_overlay.subscription.ready", { runtimeOverlayBusSubscription: true, actionCount: actions.length });
  return { ok, results };
}

function normalizeStreamStateBusEnvelope(envelope = {}) {
  const payload = envelope && typeof envelope.payload === "object" ? envelope.payload : {};
  const twitch = payload && typeof payload.twitch === "object" ? payload.twitch : {};
  const rawAction = cleanString(twitch.action || payload.action || envelope.action || "").toLowerCase();
  const eventKey = cleanString(payload.eventKey || twitch.eventKey || (rawAction ? `twitch.stream.${rawAction}` : ""));
  const action = rawAction || (eventKey === "twitch.stream.online" ? "online" : (eventKey === "twitch.stream.offline" ? "offline" : ""));
  const live = action === "online" || eventKey === "twitch.stream.online" || twitch.live === true || payload.live === true;
  return {
    eventKey: eventKey || (live ? "twitch.stream.online" : "twitch.stream.offline"),
    action: live ? "online" : "offline",
    live,
    reason: cleanString(twitch.reason || payload.reason || "twitch_stream_state"),
    sourceModule: cleanString(payload.sourceModule || (envelope.source && envelope.source.module) || "twitch_events"),
    busEventId: cleanString(envelope.id || (envelope.event && envelope.event.id) || ""),
    receivedAt: cleanString(payload.receivedAt || twitch.receivedAt || envelope.timestamp || nowIso())
  };
}

function handleStreamStateBusEnvelope(envelope = {}) {
  const parsed = normalizeStreamStateBusEnvelope(envelope);
  runtimeState.streamStateBus.lastAction = parsed.action;
  runtimeState.streamStateBus.lastEventKey = parsed.eventKey;
  runtimeState.streamStateBus.lastAt = nowIso();
  runtimeState.streamStateBus.lastError = "";
  try {
    const result = parsed.live
      ? resumeStreamOfflineWaitingEvents(parsed.reason || "stream_online", { source: parsed.sourceModule, eventKey: parsed.eventKey, busEventId: parsed.busEventId })
      : putActiveStreamEventsIntoStreamOfflineWait(parsed.reason || "stream_offline", { source: parsed.sourceModule, eventKey: parsed.eventKey, busEventId: parsed.busEventId });
    runtimeState.streamStateBus.lastResult = result;
    publishStatus(parsed.live ? "stream.online.auto_resume_processed" : "stream.offline.auto_wait_processed", { eventKey: parsed.eventKey, result });
    return result;
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    runtimeState.streamStateBus.lastError = error;
    runtimeState.streamStateBus.lastResult = { ok: false, error };
    return { ok: false, error };
  }
}

function registerStreamStateSubscription() {
  const bus = getBus();
  if (!bus || typeof bus.subscribe !== "function") return { ok: false, reason: "communication_bus_subscribe_unavailable" };
  const result = bus.subscribe({
    id: `${MODULE_NAME}:twitch.stream:offline_pause`,
    module: MODULE_NAME,
    channel: "twitch.stream",
    action: "",
    meta: { step: MODULE_BUILD, purpose: "stream_events_auto_wait_on_stream_offline", consumes: ["twitch.stream.online", "twitch.stream.offline"] }
  }, (envelope) => handleStreamStateBusEnvelope(envelope));
  runtimeState.streamStateBus.subscribed = !!(result && result.ok === true);
  runtimeState.streamStateBus.lastError = runtimeState.streamStateBus.subscribed ? "" : cleanString(result && (result.reason || result.error) || "stream_state_subscription_failed");
  if (runtimeState.streamStateBus.subscribed) publishStatus("stream_state.subscription.ready", { streamOfflineAutoWait: true, manualResumeRequired: false });
  return result;
}

function getActiveRuntimeOverlayBusState() {
  const state = runtimeState.runtimeOverlayBus && runtimeState.runtimeOverlayBus.state ? runtimeState.runtimeOverlayBus.state : null;
  if (!state) return null;
  if (state.expiresAtMs && Date.now() > Number(state.expiresAtMs)) return null;
  return state;
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
    answerSeconds: raw.answerSeconds !== undefined || raw.seconds !== undefined ? clampNumber(raw.answerSeconds ?? raw.seconds, 5, 3600, 60) : 0,
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

function getEffectiveSoundAnswerSeconds(eventOrConfig = {}, fallbackSeconds = 60) {
  const runtimeConfig = eventOrConfig && typeof eventOrConfig === "object" && Object.prototype.hasOwnProperty.call(eventOrConfig, "answerSeconds")
    ? eventOrConfig
    : getSoundRuntimeConfig(eventOrConfig || {});
  return clampNumber(runtimeConfig && runtimeConfig.answerSeconds, 5, 3600, clampNumber(fallbackSeconds, 5, 3600, 60));
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

function buildEventSoundBusIntegrationPlan(eventUid = "") {
  const status = getSoundRuntimeStatus(eventUid);
  const runtimeConfig = status.runtimeConfig || getSoundRuntimeConfig(null);

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    step: "EVENT-SOUND-3B",
    purpose: "Sound-System-kompatibler PreRoll-Gate ist minimal additiv vorbereitet; produktiv nur fuer explizit markierte stream_events EventSound-Items.",
    currentMode: {
      readOnly: false,
      productivePlaybackChanged: true,
      productivePlaybackScope: "explicit_stream_events_preroll_items_only",
      queueTouched: false,
      audioTouched: false,
      databaseWrite: false,
      soundSystemOverlayChanged: false,
      runtimeOverlayChanged: false
    },
    existingCommunicationFindings: {
      communicationBus: {
        module: "communication_bus",
        supportsTargeting: ["target.type", "target.id", "target.module", "target.capability"],
        clientHelloCapabilities: true,
        heartbeatAndAckSupported: true
      },
      soundSystem: {
        ownerRole: "central_audio_media_layer",
        module: "sound_system",
        eventCapability: "sound.event_output",
        commandCapability: "sound.command_input",
        productiveOverlayCapability: "sound.event_output",
        queueEntryPoint: "enqueueOrStart(item)",
        selectedGatePoint: "sound_system.startItem(item) after current-item reservation and before activateItemAudio(item)",
        implementationStatus: "EVENT-SOUND-2 vorbereitet in sound_system.js",
        reason: "Nach state.current-Reservierung kann kein fremder Sound zwischen Countdown und exakt diesem Sound dazwischenfunken."
      },
      soundOverlay: {
        file: "htdocs/overlays/sound_system_overlay.html",
        role: "audio_playback_client",
        consumesCapability: "sound.event_output",
        reports: ["/api/sound/client/audio-started", "/api/sound/client/audio-ended", "/api/sound/client/error"],
        staysUnchangedForEventCountdown: true
      },
      runtimeOverlay: {
        file: "htdocs/overlays/stream_events/event_runtime_overlay.html",
        role: "visual_event_runtime_display",
        capability: "stream_events.runtime_display",
        startsSound: false,
        queueTouch: false,
        stateRoute: "/api/stream-events/runtime-overlay/state"
      }
    },
    proposedBusContract: {
      runtimeOverlayTarget: {
        type: "capability",
        capability: "stream_events.runtime_display",
        channel: "stream_events.runtime"
      },
      soundOverlayTarget: {
        type: "capability",
        capability: "sound.event_output",
        channel: "sound"
      },
      commandTarget: {
        type: "module",
        module: "sound_system",
        capability: "sound.command_input",
        channel: "sound.command"
      },
      eventNames: [
        { channel: "stream_events.runtime", action: "countdown.start", targetCapability: "stream_events.runtime_display", owner: "sound_system_orchestrated_gate" },
        { channel: "stream_events.runtime", action: "guessing.start", targetCapability: "stream_events.runtime_display", owner: "sound_system_orchestrated_gate" },
        { channel: "stream_events.runtime", action: "hide", targetCapability: "stream_events.runtime_display", owner: "sound_system_orchestrated_gate" },
        { channel: "sound", action: "starting", targetCapability: "sound.event_output", alreadyExisting: true },
        { channel: "sound", action: "started", targetCapability: "sound.event_output", alreadyExisting: true },
        { channel: "sound", action: "client.audio_started", targetCapability: "sound.event_output", alreadyExisting: true },
        { channel: "sound", action: "client.audio_ended", targetCapability: "sound.event_output", alreadyExisting: true },
        { channel: "sound", action: "finished", targetCapability: "sound.event_output", alreadyExisting: true }
      ]
    },
    recommendedLifecycle: [
      { step: 1, owner: "stream_events", action: "prepare_round", note: "Soundrunde und Payload vorbereiten; noch kein Audio." },
      { step: 2, owner: "sound_system", action: "accept_or_queue_item", note: "Sound-System nimmt den EventSound an oder queued ihn nach normaler Policy." },
      { step: 3, owner: "sound_system", action: "reserve_current_item", note: "state.current wird gesetzt; genau ab hier darf Countdown laufen, weil der Sound-Slot reserviert ist." },
      { step: 4, owner: "sound_system", action: "emit_runtime_countdown_start", note: "Bus an stream_events.runtime_display; Overlay zeigt 3/2/1." },
      { step: 5, owner: "sound_system", action: "emit_runtime_guessing_start", note: "LOS/JETZT RATEN wird sichtbar; direkt danach startet Sound-Playback." },
      { step: 6, owner: "sound_system", action: "activateItemAudio", note: "Bestehender Sound-Flow startet Overlay-/Device-/Discord-Ausgabe." },
      { step: 7, owner: "sound_system_overlay", action: "client_audio_started", note: "Bestehender ACK vom Sound-Overlay bleibt erhalten." },
      { step: 8, owner: "sound_system_overlay", action: "client_audio_ended", note: "Bestehender ACK beendet aktuellen Sound im Sound-System." },
      { step: 9, owner: "sound_system", action: "emit_runtime_hide", note: "Runtime-Overlay blendet sauber aus; Fallback ueber Sound-System-Finish bleibt moeglich." }
    ],
    selectedImplementationGate: {
      owner: "sound_system",
      function: "startItem(item, reason, options)",
      exactWindow: "after state.current/state.parallel reservation; before emitItemEvent('item_starting') and activateItemAudio(item)",
      fallback: "If no audio-ended ACK arrives, existing overlay_fallback_finished/auto_finished still ends the sound; runtime overlay can then hide from state/bus.",
      whyNotOverlayTimer: "Overlay-Timer waere nicht queue-sicher und koennte Soundstart/Ende nur raten.",
      whyNotStreamEventsDirectPlay: "Stream-Events darf nicht an der Sound-System-Queue vorbei starten."
    },
    payloadShapeDraft: {
      itemMeta: {
        sourceModule: MODULE_NAME,
        eventUid: "<eventUid>",
        roundUid: "<roundUid>",
        snippetUid: "<snippetUid>",
        preRoll: { enabled: true, countdownSeconds: runtimeConfig.countdownPreRollSeconds || 3, overlayCapability: "stream_events.runtime_display" }
      },
      busPayload: {
        eventUid: "<eventUid>",
        roundUid: "<roundUid>",
        requestId: "<soundSystemRequestId>",
        countdownSeconds: runtimeConfig.countdownPreRollSeconds || 3,
        finalLabel: busOverlay ? cleanString(busOverlay.finalLabel, "LOS!") : "LOS!",
        caption: ""
      }
    },
    safetyRules: {
      soundSystemStaysPlaybackOwner: true,
      streamEventsDoesNotStartAudioDirectly: true,
      runtimeOverlayDoesNotStartAudio: true,
      soundSystemOverlayDoesNotHandleEventCountdown: true,
      noNewWebSocketSystem: true,
      useCommunicationBusTargetCapabilities: true,
      viewerSafeOverlayStateRequired: true,
      noAcceptedAnswersInOverlayState: true
    },
    nextStep: {
      name: "EVENT-SOUND-2",
      goal: "Sound-System PreRoll-Gate minimal additiv vorbereiten: item.meta.preRoll erkennen, Bus-Countdown an Runtime-Overlay senden, danach bestehenden activateItemAudio-Flow starten.",
      filesToReviewOrChange: [
        "backend/modules/sound_system.js",
        "backend/modules/stream_events.js",
        "htdocs/overlays/stream_events/event_runtime_overlay.html"
      ]
    },
    activeRuntime: {
      activeEvent: status.activeEvent || null,
      activeRound: status.activeRound || null,
      counters: status.counters || {},
      preRollPlan: buildSoundPreRollPlan(runtimeConfig),
      controlledTestRoute: "/api/sound/event-preroll/test"
    },
    updatedAt: nowIso()
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
      result: cleanString(round.result || resultData.result || ""),
      answer: cleanString(resultData.answer || ""),
      solvedByLogin: cleanString(resultData.userLogin || ""),
      solvedByDisplayName: cleanString(resultData.userDisplayName || resultData.userLogin || ""),
      solvedByAvatarUrl: cleanString(resultData.userAvatarUrl || resultData.avatarUrl || ""),
      awardedPoints: clampNumber(resultData.points, 0, 10000, clampNumber(snippet.points, 0, 10000, 0))
    } : {
      titleHidden: true,
      mediaHidden: true,
      reason: "active_answer_window_or_viewer_safe_state"
    }
  };
}

function msSinceIso(value) {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms) || ms <= 0) return Number.POSITIVE_INFINITY;
  return Date.now() - ms;
}

function runtimeResultVisibleMs(latestRound) {
  if (!latestRound) return 0;
  const status = cleanString(latestRound.status || "").toLowerCase();
  if (status === "solved") return 10000;
  if (status === "unresolved") return 10000;
  return 0;
}

function isRuntimeResultStillVisible(latestRound) {
  const maxMs = runtimeResultVisibleMs(latestRound);
  if (!latestRound || maxMs <= 0) return false;
  const finishedAt = cleanString(latestRound.finishedAt || latestRound.finished_at || "");
  return msSinceIso(finishedAt) <= maxMs;
}

function hiddenRuntimeOverlayPhase(reason = "result_timeout_elapsed") {
  return { key: "hidden", label: "", visible: false, reason };
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
    const busOverlay = getActiveRuntimeOverlayBusState();
    if (event.soundEnabled && busOverlay) {
      if (busOverlay.mode === "countdown") return { key: "sound_preroll_countdown", label: "Sound startet gleich", visible: true, reason: "sound_system_runtime_bus_countdown", busOverlay };
      if (busOverlay.mode === "guessing") return { key: "sound_guessing", label: "Sound läuft", visible: false, reason: "sound_system_runtime_bus_guessing_hidden_until_answer_window", busOverlay };
    }
    if (event.soundEnabled && activeRound) {
      return { key: "sound_answer_window", label: "Soundrunde aktiv", visible: false, reason: "sound_playback_owned_by_sound_system" };
    }
    if (event.soundEnabled && latestRound && latestRound.status === "solved") {
      if (!isRuntimeResultStillVisible(latestRound)) return hiddenRuntimeOverlayPhase("sound_solved_result_timeout_elapsed");
      return { key: "sound_solved", label: "Sound erkannt", visible: true, reason: "latest_sound_round_solved" };
    }
    if (event.soundEnabled && latestRound && latestRound.status === "unresolved") {
      if (!isRuntimeResultStillVisible(latestRound)) return hiddenRuntimeOverlayPhase("sound_unresolved_result_timeout_elapsed");
      return { key: "sound_unresolved", label: "Sound nicht erkannt", visible: true, reason: "latest_sound_round_unresolved" };
    }
    if (event.soundEnabled) {
      return { key: "sound_waiting", label: "Soundrunde wartet", visible: false, reason: "countdown_only_overlay_waiting_for_preroll" };
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
  } else if (phase.key === "sound_preroll_countdown") {
    headline = "Sound startet gleich";
    subline = "Gleich kommt der Schnipsel.";
  } else if (phase.key === "sound_guessing") {
    headline = "LOS!";
    subline = "";
  } else if (phase.key === "sound_answer_window") {
    headline = "Soundrunde läuft";
    subline = "Jetzt im Chat raten!";
  } else if (phase.key === "sound_solved") {
    headline = "Richtig erkannt";
    subline = "Die Heimleitung notiert die Punkte.";
  } else if (phase.key === "sound_unresolved") {
    headline = "KEINE LÖSUNG";
    subline = "Die Heimleitung hat nichts Verwertbares gelesen.";
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
    overlayMode: runtimeOverlayModeForPhase(phase),
    showCountdown: phase.key === "sound_preroll_countdown" || phase.key === "countdown",
    showTop3: ["sound_solved", "sound_unresolved", "finished"].includes(phase.key) && top3.length > 0,
    countdownFinalLabel: phase.busOverlay ? cleanString(phase.busOverlay.finalLabel, "LOS!") : "LOS!",
    guessingLabel: phase.busOverlay ? cleanString(phase.busOverlay.guessingLabel, "") : "",
    top3
  };
}

function runtimeOverlayModeForPhase(phase = {}) {
  const key = String(phase.key || "");
  if (key === "sound_preroll_countdown" || key === "countdown") return "countdown";
  if (key === "sound_guessing") return "guessing";
  if (key === "sound_solved" || key === "sound_unresolved") return "result";
  if (key === "finished") return "finished";
  if (key === "cancelled") return "cancelled";
  return "hidden";
}

function buildRuntimeOverlayCountdownPlan(runtimeConfig = {}, phase = {}) {
  const preRollPlan = buildSoundPreRollPlan(runtimeConfig);
  const busOverlay = phase && phase.busOverlay ? phase.busOverlay : null;
  const seconds = busOverlay ? clampNumber(busOverlay.seconds, 1, 30, 3) : clampNumber(runtimeConfig.countdownPreRollSeconds ?? runtimeConfig.preRollSeconds, 1, 30, 3);
  const remainingSeconds = busOverlay && phase.key === "sound_preroll_countdown"
    ? Math.max(1, Math.min(seconds, Math.ceil((Number(busOverlay.countdownEndsAtMs || busOverlay.expiresAtMs || 0) - Date.now()) / 1000)))
    : null;
  return {
    prepared: true,
    active: !!(busOverlay && phase.key === "sound_preroll_countdown"),
    mode: busOverlay ? "sound_system_bus" : "planned_only",
    owner: "sound_system_compatible_event_flow",
    seconds,
    remainingSeconds,
    phaseKey: busOverlay ? cleanString(busOverlay.phaseKey) : "",
    requestId: busOverlay ? cleanString(busOverlay.requestId) : "",
    countdownStartedAtMs: busOverlay ? Number(busOverlay.countdownStartedAtMs || 0) || null : null,
    countdownEndsAtMs: busOverlay ? Number(busOverlay.countdownEndsAtMs || 0) || null : null,
    sequence: Array.from({ length: seconds }, (_, index) => seconds - index).filter(value => value > 0),
    finalLabel: busOverlay ? cleanString(busOverlay.finalLabel, "LOS!") : "LOS!",
    overlayFile: "htdocs/overlays/stream_events/event_runtime_overlay.html",
    stateRoute: "/api/stream-events/runtime-overlay/state",
    soundStartsAfterCountdown: true,
    overlayStartsSound: false,
    soundSystemControlsPlayback: true,
    preRollPlan
  };
}

function buildRuntimeOverlayAnswerWindowState(activeRound = null) {
  if (!activeRound || activeRound.status !== "active") return { active: false, seconds: 0, remainingSeconds: 0, startedAt: "", endsAt: "", roundUid: "", eventUid: "" };
  const resultData = activeRound.resultData && typeof activeRound.resultData === "object" ? activeRound.resultData : {};
  const state = cleanString(resultData.answerWindowState || "").toLowerCase();
  if (state !== "open" || resultData.answerWindowClosedAt) return { active: false, seconds: 0, remainingSeconds: 0, startedAt: "", endsAt: "", roundUid: activeRound.roundUid || "", eventUid: activeRound.eventUid || "" };
  const startedAt = cleanString(resultData.answerWindowStartedAt || "");
  const endsAt = cleanString(resultData.answerWindowEndsAt || "");
  const runtimeConfig = activeRound.config && activeRound.config.runtimeConfig ? activeRound.config.runtimeConfig : getSoundRuntimeConfig(getEventByUid(activeRound.eventUid));
  const seconds = getEffectiveSoundAnswerSeconds(runtimeConfig);
  const endsAtMs = Date.parse(endsAt);
  const remainingSeconds = Number.isFinite(endsAtMs) && endsAtMs > 0 ? Math.max(0, Math.min(seconds, Math.ceil((endsAtMs - Date.now()) / 1000))) : 0;
  return {
    active: remainingSeconds > 0,
    seconds,
    remainingSeconds,
    startedAt,
    endsAt,
    startedAtMs: Date.parse(startedAt) || 0,
    endsAtMs: Number.isFinite(endsAtMs) ? endsAtMs : 0,
    roundUid: activeRound.roundUid || "",
    eventUid: activeRound.eventUid || ""
  };
}

function buildRuntimeOverlayResultPlan(phase = {}, latestRound = null, ranking = null) {
  const key = String(phase.key || "");
  const visible = ["sound_solved", "sound_unresolved", "finished", "cancelled"].includes(key);
  const top3 = ranking && Array.isArray(ranking.top3) ? ranking.top3.slice(0, 3).map(row => ({
    rank: row.rank,
    userLogin: row.userLogin,
    userDisplayName: row.userDisplayName,
    points: row.points
  })) : [];
  return {
    prepared: true,
    visible,
    mode: runtimeOverlayModeForPhase(phase),
    animated: true,
    revealAllowed: visible,
    top3Prepared: true,
    top3,
    note: "Auswertung/Result-Animation ist vorbereitet, finale Darstellung wird separat abgestimmt."
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
    step: "EVENT-SOUND-3B",
    purpose: "Read-only State fuer das phasenbasierte Event-Runtime-Overlay: Countdown jetzt, Auswertung spaeter vorbereitet.",
    mode: {
      readOnly: true,
      overlayBuilt: true,
      phasedRuntimeOverlay: true,
      countdownOnlyCurrentFocus: true,
      resultAnimationPrepared: true,
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
    countdown: buildRuntimeOverlayCountdownPlan(runtimeConfig, phase),
    answerWindow: buildRuntimeOverlayAnswerWindowState(activeRound),
    result: {
      ...buildRuntimeOverlayResultPlan(phase, latestRound, ranking),
      visibleMs: runtimeResultVisibleMs(latestRound),
      elapsedMs: latestRound && latestRound.finishedAt ? Math.max(0, Math.round(msSinceIso(latestRound.finishedAt))) : 0,
      timeoutActive: latestRound ? isRuntimeResultStillVisible(latestRound) : false
    },
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
    parts: selectedEvent ? getEventRuntimePartsStatus(selectedEvent) : getEventRuntimePartsStatus(null),
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
      resultOverlayWillUseSameCombinedOverlay: true,
      overlayDoesNotStartSound: true,
      soundSystemMustGateCountdownAndPlayback: true
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

function rowToRuntimeState(row) {
  if (!row) return null;
  return {
    eventUid: row.event_uid || "",
    runtimeStatus: row.runtime_status || "",
    phase: row.phase || "",
    activeRoundUid: row.active_round_uid || "",
    phaseStartedAt: row.phase_started_at || "",
    phaseEndsAt: row.phase_ends_at || "",
    nextAutoStartAt: row.next_auto_start_at || "",
    lastHeartbeatAt: row.last_heartbeat_at || "",
    recoveryRequired: boolValue(row.recovery_required),
    recoveryReason: row.recovery_reason || "",
    recoveryNote: row.recovery_note || "",
    updatedAt: row.updated_at || "",
    metadata: safeJsonParse(row.metadata_json, {})
  };
}

function getEventRuntimeState(eventUid = "") {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return null;
  return rowToRuntimeState(database.get("SELECT * FROM stream_events_runtime_state WHERE event_uid = :eventUid LIMIT 1", { eventUid: uid }));
}

function upsertEventRuntimeState(eventUid = "", patch = {}) {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return { ok: false, error: "event_uid_missing" };
  const now = nowIso();
  const existing = getEventRuntimeState(uid);
  const metadata = patch.metadata && typeof patch.metadata === "object" ? patch.metadata : (existing && existing.metadata ? existing.metadata : {});
  const row = {
    event_uid: uid,
    runtime_status: cleanString(patch.runtimeStatus || patch.runtime_status || (existing && existing.runtimeStatus) || "active"),
    phase: cleanString(patch.phase || (existing && existing.phase) || "unknown"),
    active_round_uid: cleanString(patch.activeRoundUid || patch.active_round_uid || ""),
    phase_started_at: cleanString(patch.phaseStartedAt || patch.phase_started_at || ""),
    phase_ends_at: cleanString(patch.phaseEndsAt || patch.phase_ends_at || ""),
    next_auto_start_at: cleanString(patch.nextAutoStartAt || patch.next_auto_start_at || ""),
    last_heartbeat_at: cleanString(patch.lastHeartbeatAt || patch.last_heartbeat_at || now),
    recovery_required: boolValue(patch.recoveryRequired ?? patch.recovery_required, false) ? 1 : 0,
    recovery_reason: cleanString(patch.recoveryReason || patch.recovery_reason || ""),
    recovery_note: cleanString(patch.recoveryNote || patch.recovery_note || ""),
    updated_at: now,
    metadata_json: jsonEncode(metadata)
  };
  database.run(`
    INSERT INTO stream_events_runtime_state (
      event_uid, runtime_status, phase, active_round_uid, phase_started_at, phase_ends_at,
      next_auto_start_at, last_heartbeat_at, recovery_required, recovery_reason, recovery_note, updated_at, metadata_json
    ) VALUES (
      :event_uid, :runtime_status, :phase, :active_round_uid, :phase_started_at, :phase_ends_at,
      :next_auto_start_at, :last_heartbeat_at, :recovery_required, :recovery_reason, :recovery_note, :updated_at, :metadata_json
    )
    ON CONFLICT(event_uid) DO UPDATE SET
      runtime_status = excluded.runtime_status,
      phase = excluded.phase,
      active_round_uid = excluded.active_round_uid,
      phase_started_at = excluded.phase_started_at,
      phase_ends_at = excluded.phase_ends_at,
      next_auto_start_at = excluded.next_auto_start_at,
      last_heartbeat_at = excluded.last_heartbeat_at,
      recovery_required = excluded.recovery_required,
      recovery_reason = excluded.recovery_reason,
      recovery_note = excluded.recovery_note,
      updated_at = excluded.updated_at,
      metadata_json = excluded.metadata_json
  `, row);
  return { ok: true, state: getEventRuntimeState(uid) };
}

function requeueInterruptedActiveSoundRound(round, reason = "runtime_recovery") {
  const activeRound = round && round.roundUid ? round : null;
  if (!activeRound || activeRound.status !== "active") return { ok: true, skipped: true, reason: "round_not_active" };
  const now = nowIso();
  cancelSoundAnswerTimer(activeRound.roundUid);
  clearTimerMapEntry(soundRevealTimers, activeRound.roundUid);
  const existingResultData = activeRound.resultData && typeof activeRound.resultData === "object" ? activeRound.resultData : {};
  const resultData = {
    ...existingResultData,
    solved: false,
    interrupted: true,
    requeuedAfterRecovery: true,
    recoveryReason: cleanString(reason, "runtime_recovery"),
    recoveredAt: now,
    answerWindowState: "closed",
    answerWindowClosedAt: now,
    answerWindowCloseReason: "recovery_requeued",
    note: "Runde wurde nach Neustart/Unterbrechung nicht gewertet und wieder in die Rotation gelegt."
  };
  database.updateByKey("stream_events_rounds", "round_uid", activeRound.roundUid, {
    status: "interrupted",
    result: "interrupted_requeued",
    finished_at: now,
    updated_at: now,
    result_json: jsonEncode(resultData)
  });
  return { ok: true, eventUid: activeRound.eventUid, roundUid: activeRound.roundUid, itemUid: activeRound.itemUid, status: "interrupted", result: "interrupted_requeued", requeued: true };
}

function isEventRuntimePaused(eventUid = "", stateRow = null) {
  const state = stateRow || getEventRuntimeState(eventUid);
  if (!state) return false;
  const runtimeStatus = cleanString(state.runtimeStatus || "").toLowerCase();
  const phase = cleanString(state.phase || "").toLowerCase();
  return runtimeStatus === "paused" || phase === "manual_paused" || phase === "paused";
}

function isEventRuntimeOfflineWaiting(eventUid = "", stateRow = null) {
  const state = stateRow || getEventRuntimeState(eventUid);
  if (!state) return false;
  const phase = cleanString(state.phase || "").toLowerCase();
  return phase === "stream_offline_waiting" || phase === "stream_offline_auto_wait" || phase === "offline_waiting";
}

function putActiveStreamEventsIntoStreamOfflineWait(reason = "stream_offline", meta = {}) {
  ensureSchema();
  const activeEvents = listEvents({ status: STATUS.ACTIVE, limit: 100 }).rows || [];
  const waited = [];
  const now = nowIso();
  for (const event of activeEvents) {
    if (!event || !event.eventUid) continue;
    const beforeState = getEventRuntimeState(event.eventUid);
    const activeRound = event.soundEnabled ? getActiveSoundRound(event.eventUid) : null;
    clearSoundRuntimeTimersForEvent(event.eventUid);
    let requeue = null;
    if (activeRound) {
      requeue = requeueInterruptedActiveSoundRound(activeRound, reason || "stream_offline");
    }
    const state = upsertEventRuntimeState(event.eventUid, {
      runtimeStatus: "active",
      phase: "stream_offline_waiting",
      activeRoundUid: "",
      phaseStartedAt: now,
      phaseEndsAt: "",
      nextAutoStartAt: "",
      lastHeartbeatAt: now,
      recoveryRequired: false,
      recoveryReason: cleanString(reason, "stream_offline"),
      recoveryNote: activeRound
        ? "Stream ging offline. Aktive Sound-Runde wurde nicht gewertet und wieder in die Rotation gelegt. Event wartet automatisch bis der Stream wieder online ist."
        : "Stream ging offline. Event wartet automatisch bis der Stream wieder online ist.",
      metadata: { moduleBuild: MODULE_BUILD, autoWait: true, offlineAt: now, beforePhase: beforeState ? beforeState.phase : "", hadActiveRound: !!activeRound, meta }
    });
    waited.push({ eventUid: event.eventUid, eventName: event.name, hadActiveRound: !!activeRound, requeue, state: state.state });
    emitBus("stream_events.runtime", "stream_offline_waiting", { eventUid: event.eventUid, eventName: event.name, reason, hadActiveRound: !!activeRound, requeue, manualResumeRequired: false });
  }
  runtimeState.counters.streamOfflinePauses += waited.length;
  runtimeState.counters.streamOfflineAutoWaits += waited.length;
  const result = { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, reason: cleanString(reason, "stream_offline"), activeEvents: activeEvents.length, waitingCount: waited.length, pausedCount: 0, waited, manualResumeRequired: false, autoResumeOnStreamOnline: true, updatedAt: nowIso() };
  runtimeState.lastStreamOfflinePause = result;
  publishStatus("stream.offline.auto_wait_completed", { activeEvents: activeEvents.length, waitingCount: waited.length });
  return result;
}

function pauseActiveStreamEventsForStreamOffline(reason = "stream_offline", meta = {}) {
  // EVS44: stream-offline is no longer a sticky manual pause. Keep this public helper as
  // compatibility wrapper for existing routes/calls, but move events into auto-wait instead.
  return putActiveStreamEventsIntoStreamOfflineWait(reason, meta);
}

function resumeStreamOfflineWaitingEvents(reason = "stream_online", meta = {}) {
  ensureSchema();
  const activeEvents = listEvents({ status: STATUS.ACTIVE, limit: 100 }).rows || [];
  const resumed = [];
  const skipped = [];
  const now = nowIso();
  for (const event of activeEvents) {
    if (!event || !event.eventUid) continue;
    const state = getEventRuntimeState(event.eventUid);
    if (!isEventRuntimeOfflineWaiting(event.eventUid, state)) {
      skipped.push({ eventUid: event.eventUid, eventName: event.name, reason: "not_stream_offline_waiting", phase: state ? state.phase : "" });
      continue;
    }
    upsertEventRuntimeState(event.eventUid, {
      runtimeStatus: "active",
      phase: "waiting",
      activeRoundUid: "",
      phaseStartedAt: now,
      phaseEndsAt: "",
      nextAutoStartAt: "",
      lastHeartbeatAt: now,
      recoveryRequired: false,
      recoveryReason: cleanString(reason, "stream_online"),
      recoveryNote: "Stream ist wieder online. Event wurde automatisch fortgesetzt; nächste Auto-Wartezeit wird geplant.",
      metadata: { moduleBuild: MODULE_BUILD, autoResumedAt: now, previousPhase: state ? state.phase : "", meta }
    });
    let plan = null;
    if (event.soundEnabled) plan = scheduleNextSoundRound(event.eventUid, "stream_online_auto_resume");
    resumed.push({ eventUid: event.eventUid, eventName: event.name, plan });
    emitBus("stream_events.runtime", "auto_resumed", { eventUid: event.eventUid, eventName: event.name, reason, plan, manualResumeRequired: false });
  }
  runtimeState.counters.streamRuntimeResumes += resumed.length;
  runtimeState.counters.streamOfflineAutoResumes += resumed.length;
  const result = { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, reason: cleanString(reason, "stream_online"), activeEvents: activeEvents.length, resumedCount: resumed.length, resumed, skipped, manualResumeRequired: false, updatedAt: nowIso() };
  runtimeState.lastStreamRuntimeResume = result;
  publishStatus("stream.online.auto_resume_completed", { activeEvents: activeEvents.length, resumedCount: resumed.length });
  return result;
}

function resumeEventRuntimeAfterPause(eventUid = "", reason = "manual_resume") {
  ensureSchema();
  const event = cleanString(eventUid) ? getEventByUid(eventUid) : getActiveEvent();
  if (!event) return { ok: false, error: "active_event_missing" };
  if (event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: event.eventUid, status: event.status };
  const state = getEventRuntimeState(event.eventUid);
  if (!isEventRuntimePaused(event.eventUid, state) && !isEventRuntimeOfflineWaiting(event.eventUid, state)) return { ok: true, skipped: true, reason: "event_not_paused_or_offline_waiting", eventUid: event.eventUid, runtimeState: state };
  const now = nowIso();
  const update = upsertEventRuntimeState(event.eventUid, {
    runtimeStatus: "active",
    phase: "waiting",
    activeRoundUid: "",
    phaseStartedAt: now,
    phaseEndsAt: "",
    nextAutoStartAt: "",
    lastHeartbeatAt: now,
    recoveryRequired: false,
    recoveryReason: cleanString(reason, "manual_resume"),
    recoveryNote: "Event wurde fortgesetzt. Neue Auto-Wartezeit wird geplant.",
    metadata: { moduleBuild: MODULE_BUILD, resumedAt: now, previousPhase: state ? state.phase : "" }
  });
  let plan = null;
  if (event.soundEnabled) plan = scheduleNextSoundRound(event.eventUid, "manual_resume_after_pause_or_offline_wait");
  runtimeState.counters.streamRuntimeResumes += 1;
  const result = { ok: true, eventUid: event.eventUid, eventName: event.name, resumed: true, state: update.state, plan, updatedAt: nowIso() };
  runtimeState.lastStreamRuntimeResume = result;
  emitBus("stream_events.runtime", "resumed", { eventUid: event.eventUid, eventName: event.name, reason, plan });
  publishStatus("stream.runtime.resumed", { lastEventUid: event.eventUid });
  return result;
}

function recoverActiveStreamEvents(reason = "node_start") {
  ensureSchema();
  const activeEvents = listEvents({ status: STATUS.ACTIVE, limit: 100 }).rows || [];
  const recovered = [];
  const scheduled = [];
  const now = nowIso();
  for (const event of activeEvents) {
    if (!event || !event.eventUid) continue;
    const existingRuntimeState = getEventRuntimeState(event.eventUid);
    if (isEventRuntimePaused(event.eventUid, existingRuntimeState)) {
      upsertEventRuntimeState(event.eventUid, {
        runtimeStatus: "paused",
        phase: "manual_paused",
        activeRoundUid: "",
        lastHeartbeatAt: now,
        recoveryRequired: false,
        recoveryReason: cleanString(reason, "node_start"),
        recoveryNote: "Aktives Event war manuell pausiert und bleibt nach Neustart pausiert. Manuelles Fortsetzen erforderlich.",
        metadata: { moduleBuild: MODULE_BUILD, checkedAt: now, keptPaused: true, previousPhase: existingRuntimeState ? existingRuntimeState.phase : "" }
      });
      scheduled.push({ eventUid: event.eventUid, eventName: event.name, plan: { ok: true, skipped: true, reason: "event_runtime_manual_paused_resume_required" } });
      continue;
    }
    if (isEventRuntimeOfflineWaiting(event.eventUid, existingRuntimeState)) {
      const stream = getStreamStatusSnapshot();
      if (stream.online) {
        const resume = resumeStreamOfflineWaitingEvents("node_start_stream_online", { source: "recoverActiveStreamEvents" });
        scheduled.push({ eventUid: event.eventUid, eventName: event.name, plan: { ok: true, reason: "stream_online_auto_resume_after_node_start", resume } });
      } else {
        upsertEventRuntimeState(event.eventUid, {
          runtimeStatus: "active",
          phase: "stream_offline_waiting",
          activeRoundUid: "",
          lastHeartbeatAt: now,
          recoveryRequired: false,
          recoveryReason: cleanString(reason, "node_start"),
          recoveryNote: "Aktives Event wartet nach Neustart weiter automatisch auf Stream online.",
          metadata: { moduleBuild: MODULE_BUILD, checkedAt: now, keptOfflineWaiting: true, previousPhase: existingRuntimeState ? existingRuntimeState.phase : "" }
        });
        scheduled.push({ eventUid: event.eventUid, eventName: event.name, plan: { ok: true, skipped: true, reason: "stream_offline_auto_waiting" } });
      }
      continue;
    }
    const activeRound = event.soundEnabled ? getActiveSoundRound(event.eventUid) : null;
    let recovery = null;
    if (activeRound) {
      recovery = requeueInterruptedActiveSoundRound(activeRound, reason);
      recovered.push({ eventUid: event.eventUid, eventName: event.name, round: recovery });
      emitBus("stream_events.recovery", "sound_round_requeued", { eventUid: event.eventUid, eventName: event.name, round: recovery, reason });
    }
    upsertEventRuntimeState(event.eventUid, {
      runtimeStatus: "active",
      phase: activeRound ? "recovered_waiting" : "waiting",
      activeRoundUid: "",
      phaseStartedAt: now,
      phaseEndsAt: "",
      nextAutoStartAt: "",
      lastHeartbeatAt: now,
      recoveryRequired: false,
      recoveryReason: cleanString(reason, "node_start"),
      recoveryNote: activeRound
        ? "Aktive Sound-Runde wurde wegen Neustart/Unterbrechung zurueck in die Rotation gelegt. Punkte bleiben erhalten."
        : "Aktives Event wurde nach Neustart erkannt; Auto-Wartezeit wird neu geplant.",
      metadata: { moduleBuild: MODULE_BUILD, recoveredAt: now, hadActiveRound: !!activeRound }
    });
    if (event.soundEnabled) {
      const plan = scheduleNextSoundRound(event.eventUid, activeRound ? "recovery_requeued_active_round" : "recovery_reschedule_wait");
      scheduled.push({ eventUid: event.eventUid, eventName: event.name, plan });
    }
  }
  const result = { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, reason, activeEvents: activeEvents.length, recoveredCount: recovered.length, recovered, scheduled, updatedAt: nowIso() };
  runtimeState.lastRecovery = result;
  publishStatus("recovery.completed", { activeEvents: activeEvents.length, recoveredCount: recovered.length });
  return result;
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
  const blockedStatuses = new Set(["active", "solved", "unresolved"]);
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


function getRevealVideoMediaRef(snippet = {}) {
  const raw = snippet && typeof snippet === "object" ? snippet : {};
  return cleanString(raw.revealVideoId || raw.videoMediaId || raw.revealMediaId || (raw.raw && (raw.raw.revealVideoId || raw.raw.videoMediaId || raw.raw.revealMediaId)) || "");
}

function buildRevealVideoPlaybackPayload(event, round, snippet, runtimeConfig = {}) {
  const revealVideoId = getRevealVideoMediaRef(snippet);
  const title = cleanString(snippet.title || "Sound-Reveal");
  const resolvedReveal = resolveMediaAssetForPlaybackRef({ mediaId: revealVideoId }, { requireVideo: true });
  const mediaFields = resolvedReveal.ok
    ? {
        ok: true,
        mediaId: resolvedReveal.mediaId,
        mediaAssetId: resolvedReveal.mediaAssetId,
        assetId: resolvedReveal.assetId,
        mediaPath: resolvedReveal.mediaPath,
        mediaRelativePath: resolvedReveal.mediaRelativePath,
        registryPath: resolvedReveal.registryPath,
        webPath: resolvedReveal.webPath,
        mediaType: "video",
        type: "video",
        label: `Reveal: ${title}`,
        durationMs: resolvedReveal.durationMs || 0,
        hasAudio: resolvedReveal.hasAudio,
        hasVideo: true
      }
    : { ok: false, error: resolvedReveal.error || "reveal_media_resolve_failed", mediaId: revealVideoId, label: `Reveal: ${title}` };

  return {
    prepared: true,
    revealVideoId,
    mediaResolved: !!(mediaFields && mediaFields.ok),
    mediaResolution: mediaFields,
    item: {
      sourceModule: MODULE_NAME,
      eventUid: event.eventUid,
      roundUid: round.roundUid,
      snippetUid: snippet.snippetUid,
      mediaId: mediaFields.ok ? (mediaFields.mediaId || "") : revealVideoId,
      mediaAssetId: mediaFields.ok ? (mediaFields.mediaAssetId || mediaFields.mediaId || "") : revealVideoId,
      assetId: mediaFields.ok ? (mediaFields.assetId || mediaFields.mediaId || "") : revealVideoId,
      mediaPath: mediaFields.ok ? (mediaFields.mediaPath || "") : "",
      mediaRelativePath: mediaFields.ok ? (mediaFields.mediaRelativePath || mediaFields.mediaPath || "") : "",
      registryPath: mediaFields.ok ? (mediaFields.registryPath || mediaFields.mediaPath || "") : "",
      mediaResolutionError: mediaFields.ok ? "" : mediaFields.error,
      label: `Reveal: ${title}`,
      ...(mediaFields.ok ? mediaFields : {}),
      mediaType: "video",
      type: "video",
      category: "stream_event_reveal_video",
      requestedBy: MODULE_NAME,
      priority: 75,
      target: runtimeConfig.target || "both",
      outputTarget: "overlay",
      source: MODULE_NAME,
      meta: {
        module: MODULE_NAME,
        owner: MODULE_NAME,
        eventUid: event.eventUid,
        roundUid: round.roundUid,
        snippetUid: snippet.snippetUid,
        revealVideo: true,
        revealVideoId,
        revealMediaResolved: !!(mediaFields && mediaFields.ok),
        eventSoundReveal: true,
        eventPreRoll: {
          enabled: false,
          countdownEnabled: false,
          suppressedBy: MODULE_BUILD,
          reason: "winner_card_announces_reveal"
        }
      }
    }
  };
}

function requestRevealVideoForSolvedSoundRound(event, round, snippet, runtimeConfig = {}) {
  if (!event || !round || !snippet) return { ok: true, skipped: true, reason: "missing_context" };
  if (!boolValue(runtimeConfig.revealVideoEnabled, true)) return { ok: true, skipped: true, reason: "reveal_video_disabled" };
  if (cleanString(runtimeConfig.revealVideoMode, "after_solved") !== "after_solved") return { ok: true, skipped: true, reason: "reveal_video_mode_not_after_solved" };
  const revealVideoId = getRevealVideoMediaRef(snippet);
  if (!revealVideoId) return { ok: true, skipped: true, reason: "reveal_video_missing" };
  const playback = buildRevealVideoPlaybackPayload(event, round, snippet, runtimeConfig);
  if (playback.item && playback.item.mediaResolutionError) {
    return { ok: false, skipped: false, revealVideoId, error: playback.item.mediaResolutionError, playback };
  }
  const result = requestSoundSystemPlaybackForSoundRound(playback, { confirm: "1" });
  runtimeState.counters.soundRevealVideosRequested += 1;
  emitBus("stream_events.sound", "reveal_video_requested", {
    eventUid: event.eventUid,
    roundUid: round.roundUid,
    snippetUid: snippet.snippetUid,
    revealVideoId,
    result
  });
  publishStatus("sound.reveal_video_requested", { lastEventUid: event.eventUid, roundUid: round.roundUid });
  return { ok: !!(result && result.ok), revealVideoId, playbackRequested: true, result, playback };
}

function scheduleRevealVideoForSolvedSoundRound(event, round, snippet, runtimeConfig = {}) {
  if (!event || !round || !snippet) return { ok: true, skipped: true, reason: "missing_context" };
  const revealVideoId = getRevealVideoMediaRef(snippet);
  if (!boolValue(runtimeConfig.revealVideoEnabled, true)) return { ok: true, skipped: true, reason: "reveal_video_disabled" };
  if (cleanString(runtimeConfig.revealVideoMode, "after_solved") !== "after_solved") return { ok: true, skipped: true, reason: "reveal_video_mode_not_after_solved" };
  if (!revealVideoId) return { ok: true, skipped: true, reason: "reveal_video_missing" };

  const delaySeconds = 10;
  const roundUid = cleanString(round.roundUid);
  clearTimerMapEntry(soundRevealTimers, roundUid);

  const scheduledAt = nowIso();
  const dueAt = new Date(Date.now() + delaySeconds * 1000).toISOString();
  const timer = setTimeout(() => {
    try {
      const currentRound = rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid }));
      if (!currentRound || currentRound.status !== "solved") return;
      const currentEvent = getEventByUid(currentRound.eventUid);
      if (!currentEvent || currentEvent.status === STATUS.CANCELLED || currentEvent.status === STATUS.ARCHIVED) return;
      const currentSnippet = currentRound.config && currentRound.config.snippet ? currentRound.config.snippet : snippet;
      const currentRuntimeConfig = getSoundRuntimeConfig(currentEvent);
      const result = requestRevealVideoForSolvedSoundRound(currentEvent, currentRound, currentSnippet, currentRuntimeConfig);
      mergeRoundResultData(currentRound, {
        revealVideo: {
          ...(currentRound.resultData && currentRound.resultData.revealVideo && typeof currentRound.resultData.revealVideo === "object" ? currentRound.resultData.revealVideo : {}),
          ...result,
          delayed: true,
          requestedAt: nowIso()
        }
      });
      emitBus("stream_events.sound", "delayed_reveal_video_requested", {
        eventUid: currentRound.eventUid,
        roundUid,
        revealVideoId,
        delaySeconds,
        result
      });
      publishStatus("sound.delayed_reveal_video_requested", { lastEventUid: currentRound.eventUid, roundUid });
    } catch (err) {
      runtimeState.lastError = err && err.message ? err.message : String(err);
    } finally {
      clearTimerMapEntry(soundRevealTimers, roundUid);
    }
  }, delaySeconds * 1000);
  if (typeof timer.unref === "function") timer.unref();

  soundRevealTimers.set(roundUid, { timer, eventUid: event.eventUid, roundUid, reason: "sound_solved_reveal_after_result_card", delaySeconds, scheduledAt, dueAt, revealVideoId });
  return { ok: true, scheduled: true, delayed: true, eventUid: event.eventUid, roundUid, revealVideoId, delaySeconds, scheduledAt, dueAt, reason: "reveal_after_result_card" };
}

function mergeRoundResultData(round, patch = {}) {
  const rid = round && round.roundUid ? cleanString(round.roundUid) : cleanString(round);
  if (!rid) return { ok: false, error: "round_uid_missing" };
  const current = typeof round === "object" && round && round.resultData ? round : rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid: rid }));
  const existing = current && current.resultData && typeof current.resultData === "object" ? current.resultData : {};
  const merged = { ...existing, ...(patch && typeof patch === "object" ? patch : {}) };
  database.updateByKey("stream_events_rounds", "round_uid", rid, {
    result_json: jsonEncode(merged),
    updated_at: nowIso()
  });
  return { ok: true, roundUid: rid, resultData: merged };
}

function isSoundAnswerWindowOpen(round = null) {
  const item = round && round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  return item.answerWindowState === "open" && !!item.answerWindowStartedAt && !item.answerWindowClosedAt;
}

function markSoundAnswerWindowClosed(roundUid = "", reason = "closed") {
  const rid = cleanString(roundUid);
  if (!rid) return { ok: false, error: "round_uid_missing" };
  const round = rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid: rid }));
  if (!round) return { ok: true, skipped: true, reason: "round_missing" };
  const existing = round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  if (existing.answerWindowClosedAt) return { ok: true, skipped: true, reason: "answer_window_already_closed", roundUid: rid };
  return mergeRoundResultData(round, {
    answerWindowState: "closed",
    answerWindowClosedAt: nowIso(),
    answerWindowCloseReason: cleanString(reason, "closed")
  });
}

function cancelSoundAnswerTimer(roundUid = "") {
  clearTimerMapEntry(soundAnswerTimers, cleanString(roundUid));
}

function scheduleSoundAnswerTimer(eventUid = "", roundUid = "", answerSeconds = 60, options = {}) {
  const uid = cleanString(eventUid);
  const rid = cleanString(roundUid);
  if (!uid || !rid) return { ok: false, error: "event_or_round_missing" };
  const round = rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid: rid }));
  if (!round || round.eventUid !== uid) return { ok: true, skipped: true, reason: "round_missing_or_event_mismatch", eventUid: uid, roundUid: rid };
  if (round.status !== "active") return { ok: true, skipped: true, reason: "round_not_active", status: round.status, eventUid: uid, roundUid: rid };
  if (isSoundAnswerWindowOpen(round) && soundAnswerTimers.has(rid)) return { ok: true, skipped: true, reason: "answer_window_already_open", eventUid: uid, roundUid: rid };
  cancelSoundAnswerTimer(rid);
  const seconds = clampNumber(answerSeconds, 5, 3600, 60);
  const now = nowIso();
  const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
  mergeRoundResultData(round, {
    answerWindowState: "open",
    answerWindowStartedAt: now,
    answerWindowEndsAt: endsAt,
    answerWindowSeconds: seconds,
    answerWindowStartReason: cleanString(options.reason || "sound_audio_ended"),
    answerWindowPlaybackAction: cleanString(options.playbackAction || ""),
    answerWindowPlaybackRequestId: cleanString(options.requestId || "")
  });
  const timer = setTimeout(() => {
    try { handleSoundAnswerWindowExpired(uid, rid); } catch (err) { runtimeState.lastError = err && err.message ? err.message : String(err); }
  }, seconds * 1000);
  if (typeof timer.unref === "function") timer.unref();
  soundAnswerTimers.set(rid, { timer, eventUid: uid, roundUid: rid, answerSeconds: seconds, scheduledAt: now, startsAfter: "sound_audio_ended" });
  upsertEventRuntimeState(uid, {
    runtimeStatus: "active",
    phase: "answer_window",
    activeRoundUid: rid,
    phaseStartedAt: now,
    phaseEndsAt: endsAt,
    nextAutoStartAt: "",
    recoveryRequired: false,
    recoveryReason: cleanString(options.reason || "sound_audio_ended"),
    recoveryNote: "Antwortfenster läuft.",
    metadata: { source: "scheduleSoundAnswerTimer", roundUid: rid, answerSeconds: seconds, endsAt }
  });
  emitBus("stream_events.sound", "answer_window_started", { eventUid: uid, roundUid: rid, answerSeconds: seconds, startedAt: now, endsAt, reason: cleanString(options.reason || "sound_audio_ended") });
  publishStatus("sound.answer_window_started", { lastEventUid: uid, roundUid: rid, answerSeconds: seconds });
  return { ok: true, eventUid: uid, roundUid: rid, answerSeconds: seconds, startedAt: now, endsAt, startsAfter: "sound_audio_ended" };
}


function computeNextSoundRoundDelaySeconds(runtimeConfig = {}, reason = "auto_advance") {
  const playbackMode = cleanString(runtimeConfig.playbackMode || "random_auto").toLowerCase();
  const roundDelaySeconds = clampNumber(runtimeConfig.roundDelaySeconds, 0, 3600, 5);

  if (playbackMode === "random_auto" || playbackMode === "sequence_auto") {
    const intervalMinutes = clampNumber(runtimeConfig.intervalMinutes, 1, 240, 5);
    const jitterMinutes = clampNumber(runtimeConfig.intervalJitterMinutes, 0, 120, 0);
    const minMinutes = Math.max(0, intervalMinutes - jitterMinutes);
    const maxMinutes = Math.max(minMinutes, intervalMinutes + jitterMinutes);
    const randomMinutes = maxMinutes > minMinutes
      ? minMinutes + (Math.random() * (maxMinutes - minMinutes))
      : minMinutes;
    const intervalSeconds = Math.round(randomMinutes * 60);
    return {
      delaySeconds: Math.max(roundDelaySeconds, intervalSeconds),
      source: "auto_interval_jitter",
      playbackMode,
      intervalMinutes,
      jitterMinutes,
      minSeconds: Math.round(minMinutes * 60),
      maxSeconds: Math.round(maxMinutes * 60),
      floorSeconds: roundDelaySeconds,
      reason: `${reason}_auto_interval`
    };
  }

  return {
    delaySeconds: roundDelaySeconds,
    source: "round_delay_seconds",
    playbackMode,
    intervalMinutes: clampNumber(runtimeConfig.intervalMinutes, 1, 240, 5),
    jitterMinutes: clampNumber(runtimeConfig.intervalJitterMinutes, 0, 120, 0),
    minSeconds: roundDelaySeconds,
    maxSeconds: roundDelaySeconds,
    floorSeconds: roundDelaySeconds,
    reason
  };
}

function scheduleNextSoundRound(eventUid = "", reason = "auto_advance") {
  const event = getEventByUid(eventUid);
  if (!event || event.status !== STATUS.ACTIVE || !event.soundEnabled) return { ok: true, skipped: true, reason: "event_not_active_sound" };
  if (isEventRuntimePaused(event.eventUid)) return { ok: true, skipped: true, reason: "event_runtime_paused", eventUid: event.eventUid };
  if (isEventRuntimeOfflineWaiting(event.eventUid)) return { ok: true, skipped: true, reason: "stream_offline_auto_waiting", eventUid: event.eventUid };
  const runtimeGateForSchedule = getRuntimeGateStatus({ eventUid: event.eventUid });
  if (!runtimeGateForSchedule.active) {
    if (runtimeGateForSchedule.stream && runtimeGateForSchedule.stream.online === false) {
      putActiveStreamEventsIntoStreamOfflineWait(runtimeGateForSchedule.reason || "stream_offline", { source: "scheduleNextSoundRound" });
      return { ok: true, skipped: true, reason: "stream_offline_auto_waiting", eventUid: event.eventUid, runtimeGate: runtimeGateForSchedule };
    }
    return { ok: true, skipped: true, reason: runtimeGateForSchedule.reason || "runtime_gate_inactive", eventUid: event.eventUid, runtimeGate: runtimeGateForSchedule };
  }
  const runtimeConfig = getSoundRuntimeConfig(event);
  if (!boolValue(runtimeConfig.autoAdvanceRounds, true)) return { ok: true, skipped: true, reason: "auto_advance_disabled" };
  const parts = getEventRuntimePartsStatus(event);
  if (parts.sound.completed) return maybeAutoFinishEventIfPartsCompleted(event.eventUid, reason);
  if (parts.sound.activeRoundUid) return { ok: true, skipped: true, reason: "active_round_exists", parts };
  clearTimerMapEntry(soundAutoAdvanceTimers, event.eventUid);

  const schedulePlan = computeNextSoundRoundDelaySeconds(runtimeConfig, reason);
  const delaySeconds = clampNumber(schedulePlan.delaySeconds, 0, 24 * 60 * 60, 5);

  const timer = setTimeout(() => {
    try {
      const activeEvent = getEventByUid(event.eventUid);
      if (!activeEvent || activeEvent.status !== STATUS.ACTIVE) return;
      const currentParts = getEventRuntimePartsStatus(activeEvent);
      if (currentParts.sound.completed) {
        maybeAutoFinishEventIfPartsCompleted(activeEvent.eventUid, `${reason}:sound_completed`);
        return;
      }
      if (currentParts.sound.activeRoundUid) return;
      if (isEventRuntimePaused(activeEvent.eventUid) || isEventRuntimeOfflineWaiting(activeEvent.eventUid)) return;
      const timerGate = getRuntimeGateStatus({ eventUid: activeEvent.eventUid });
      if (!timerGate.active) {
        if (timerGate.stream && timerGate.stream.online === false) putActiveStreamEventsIntoStreamOfflineWait(timerGate.reason || "stream_offline", { source: "sound_auto_advance_timer" });
        return;
      }
      const result = createSoundRound({ eventUid: activeEvent.eventUid, play: true, confirm: "1" });
      runtimeState.counters.soundAutoAdvancesStarted += 1;
      emitBus("stream_events.sound", "auto_advance_started", { eventUid: activeEvent.eventUid, reason, schedulePlan, result });
      publishStatus("sound.auto_advance_started", { lastEventUid: activeEvent.eventUid });
    } catch (err) {
      runtimeState.lastError = err && err.message ? err.message : String(err);
    } finally {
      clearTimerMapEntry(soundAutoAdvanceTimers, event.eventUid);
    }
  }, delaySeconds * 1000);
  if (typeof timer.unref === "function") timer.unref();

  const scheduledAt = nowIso();
  const dueAt = new Date(Date.now() + (delaySeconds * 1000)).toISOString();
  soundAutoAdvanceTimers.set(event.eventUid, {
    timer,
    eventUid: event.eventUid,
    reason,
    delaySeconds,
    scheduledAt,
    dueAt,
    schedulePlan
  });
  upsertEventRuntimeState(event.eventUid, {
    runtimeStatus: "active",
    phase: "waiting",
    activeRoundUid: "",
    phaseStartedAt: scheduledAt,
    phaseEndsAt: dueAt,
    nextAutoStartAt: dueAt,
    recoveryRequired: false,
    recoveryReason: cleanString(reason || "auto_advance"),
    recoveryNote: "Nächster Sound-Schnipsel ist geplant.",
    metadata: { source: "scheduleNextSoundRound", reason, delaySeconds, dueAt, schedulePlan }
  });
  runtimeState.counters.soundAutoAdvancesScheduled += 1;
  return { ok: true, scheduled: true, eventUid: event.eventUid, delaySeconds, dueAt, reason, schedulePlan, parts };
}


function playPreparedActiveSoundRound(event, round, runtimeConfig = {}, options = {}) {
  const activeRound = round || getActiveSoundRound(event && event.eventUid ? event.eventUid : "");
  if (!event || !activeRound || activeRound.status !== "active") {
    return { ok: false, error: "prepared_round_missing", eventUid: event && event.eventUid ? event.eventUid : "" };
  }

  const roundConfig = activeRound.config && typeof activeRound.config === "object" ? activeRound.config : {};
  const snippet = roundConfig.snippet && typeof roundConfig.snippet === "object" ? roundConfig.snippet : null;
  const effectiveRuntimeConfig = runtimeConfig && typeof runtimeConfig === "object" && Object.keys(runtimeConfig).length
    ? runtimeConfig
    : (roundConfig.runtimeConfig && typeof roundConfig.runtimeConfig === "object" ? roundConfig.runtimeConfig : getSoundRuntimeConfig(event));

  if (!snippet || !cleanString(snippet.snippetUid || activeRound.itemUid)) {
    return { ok: false, error: "prepared_round_snippet_missing", eventUid: event.eventUid, roundUid: activeRound.roundUid };
  }

  const playback = buildSoundPlaybackPayload(event, activeRound, snippet, effectiveRuntimeConfig);
  const playbackResult = requestSoundSystemPlaybackForSoundRound(playback, { confirm: options.confirm || options.confirmed || "1" });
  const playbackResultData = { preparedOnly: false, playbackRequested: true, playbackResult, startedFromPreparedRound: true, startedBy: cleanString(options.actor || "skip_wait") };

  try {
    const update = {
      result_json: jsonEncode({
        ...(activeRound.resultData && typeof activeRound.resultData === "object" ? activeRound.resultData : {}),
        ...playbackResultData,
        answerWindowState: playbackResult && playbackResult.ok ? "waiting_for_sound_audio_end" : "playback_failed",
        answerWindowSeconds: getEffectiveSoundAnswerSeconds(effectiveRuntimeConfig),
        answerWindowStartRule: "after_sound_audio_end",
        answerWindowPreparedAt: nowIso(),
        preparedOnly: false
      }),
      updated_at: nowIso()
    };
    if (!(playbackResult && playbackResult.ok)) {
      update.status = "failed";
      update.result = "playback_failed";
      update.finished_at = nowIso();
    }
    database.updateByKey("stream_events_rounds", "round_uid", activeRound.roundUid, update);
  } catch (_) {}

  if (playbackResult && playbackResult.ok) {
    upsertEventRuntimeState(event.eventUid, {
      runtimeStatus: "active",
      phase: "sound_playing",
      activeRoundUid: activeRound.roundUid,
      phaseStartedAt: nowIso(),
      phaseEndsAt: "",
      nextAutoStartAt: "",
      recoveryRequired: false,
      recoveryReason: "prepared_round_started",
      recoveryNote: "Vorbereitete Sound-Runde wurde gestartet.",
      metadata: { source: "playPreparedActiveSoundRound", roundUid: activeRound.roundUid, snippetUid: snippet.snippetUid, title: snippet.title }
    });
  }

  return {
    ok: !!(playbackResult && playbackResult.ok),
    eventUid: event.eventUid,
    roundUid: activeRound.roundUid,
    reusedPreparedRound: true,
    snippet,
    round: getActiveSoundRound(event.eventUid) || activeRound,
    playbackRequested: true,
    playbackResult,
    error: playbackResult && playbackResult.error ? playbackResult.error : ""
  };
}

function isPreparedOnlyActiveSoundRound(round) {
  if (!round || round.status !== "active") return false;
  const resultData = round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  const state = cleanString(resultData.answerWindowState || "").toLowerCase();
  const playbackRequested = boolValue(resultData.playbackRequested, false);
  const playbackResult = resultData.playbackResult && typeof resultData.playbackResult === "object" ? resultData.playbackResult : null;
  const preparedOnly = boolValue(resultData.preparedOnly, false) || state === "prepared_only";
  const waitingForAudioEnd = state === "waiting_for_sound_audio_end";
  const answerOpen = state === "open" && !resultData.answerWindowClosedAt;
  const hasAnswerTimer = soundAnswerTimers.has(round.roundUid);

  if (answerOpen || hasAnswerTimer || waitingForAudioEnd) return false;
  if (preparedOnly) return true;
  if (!playbackRequested && (!playbackResult || boolValue(playbackResult.preparedOnly, false))) return true;
  return false;
}

function skipSoundRoundWait(body = {}) {
  ensureSchema();
  const event = cleanString(body.eventUid || body.event_uid) ? getEventByUid(body.eventUid || body.event_uid) : getActiveEvent();
  if (!event) return { ok: false, error: "active_event_missing", message: "Kein aktives Event gefunden." };
  if (event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: event.eventUid, status: event.status, message: "Das Event läuft nicht." };
  if (!event.soundEnabled) return { ok: false, error: "sound_not_enabled", eventUid: event.eventUid, message: "Dieses Event hat kein Sound-Spiel aktiviert." };
  if (isEventRuntimePaused(event.eventUid)) return { ok: false, error: "event_runtime_paused", eventUid: event.eventUid, message: "Das Event ist manuell pausiert. Erst im Dashboard/Backend fortsetzen." };
  if (isEventRuntimeOfflineWaiting(event.eventUid)) return { ok: false, error: "stream_offline_auto_waiting", eventUid: event.eventUid, message: "Stream ist offline. Das Event wartet automatisch und startet keinen Schnipsel." };
  const runtimeGateForSkip = getRuntimeGateStatus({ eventUid: event.eventUid });
  if (!runtimeGateForSkip.active) {
    if (runtimeGateForSkip.stream && runtimeGateForSkip.stream.online === false) putActiveStreamEventsIntoStreamOfflineWait(runtimeGateForSkip.reason || "stream_offline", { source: "skipSoundRoundWait" });
    return { ok: false, error: runtimeGateForSkip.reason || "runtime_gate_inactive", eventUid: event.eventUid, message: runtimeGateForSkip.label || "Wartezeit kann gerade nicht übersprungen werden.", runtimeGate: runtimeGateForSkip };
  }

  const runtimeConfig = getSoundRuntimeConfig(event);
  if (!boolValue(runtimeConfig.autoAdvanceRounds, true)) {
    return { ok: false, error: "auto_advance_disabled", eventUid: event.eventUid, message: "Automatischer Schnipsel-Ablauf ist für dieses Event deaktiviert." };
  }

  const parts = getEventRuntimePartsStatus(event);
  if (parts.sound && parts.sound.completed) {
    return { ok: false, error: "sound_completed", eventUid: event.eventUid, parts, message: "Der Sound-Teil ist bereits abgeschlossen." };
  }
  const activeRound = getActiveSoundRound(event.eventUid);
  const hasActivePreparedRound = activeRound && parts.sound && parts.sound.activeRoundUid && isPreparedOnlyActiveSoundRound(activeRound);
  if (parts.sound && parts.sound.activeRoundUid && !hasActivePreparedRound) {
    return { ok: false, error: "active_round_exists", eventUid: event.eventUid, parts, message: "Es läuft bereits ein Schnipsel oder ein Antwortfenster." };
  }

  const timerInfo = soundAutoAdvanceTimers.get(event.eventUid) || null;
  const result = hasActivePreparedRound
    ? playPreparedActiveSoundRound(event, activeRound, runtimeConfig, { confirm: "1", actor: cleanString(body.actor || "skip_wait") })
    : createSoundRound({
        eventUid: event.eventUid,
        play: true,
        confirm: "1",
        allowReuse: boolValue(body.allowReuse, false)
      });

  if (result && result.ok) {
    clearTimerMapEntry(soundAutoAdvanceTimers, event.eventUid);
    runtimeState.counters.soundWaitsSkipped += 1;
    markAction("sound.wait.skipped", event.eventUid);
    emitBus("stream_events.sound", "wait_skipped", {
      eventUid: event.eventUid,
      hadScheduledWait: !!timerInfo,
      cancelledWait: timerInfo ? {
        reason: timerInfo.reason || "",
        delaySeconds: timerInfo.delaySeconds || 0,
        scheduledAt: timerInfo.scheduledAt || "",
        dueAt: timerInfo.dueAt || "",
        schedulePlan: timerInfo.schedulePlan || null
      } : null,
      result
    });
    publishStatus("sound.wait_skipped", { lastEventUid: event.eventUid, roundUid: result.round && result.round.roundUid ? result.round.roundUid : "" });
  }

  return {
    ok: !!(result && result.ok),
    eventUid: event.eventUid,
    skippedWait: !!(result && result.ok),
    reusedPreparedRound: !!(result && result.reusedPreparedRound),
    hadScheduledWait: !!timerInfo,
    cancelledWait: result && result.ok && timerInfo ? {
      reason: timerInfo.reason || "",
      delaySeconds: timerInfo.delaySeconds || 0,
      scheduledAt: timerInfo.scheduledAt || "",
      dueAt: timerInfo.dueAt || "",
      schedulePlan: timerInfo.schedulePlan || null
    } : null,
    nextRound: result || null,
    round: result && result.round ? result.round : null,
    snippet: result && result.snippet ? result.snippet : null,
    playbackResult: result && result.playbackResult ? result.playbackResult : null,
    message: result && result.ok
      ? "Aktuelle Wartezeit übersprungen. Der nächste Schnipsel wurde über den normalen Event-Ablauf gestartet."
      : (result && (result.message || result.error)) || "Nächster Schnipsel konnte nicht gestartet werden."
  };
}

function handleSoundAnswerWindowExpired(eventUid = "", roundUid = "") {
  cancelSoundAnswerTimer(roundUid);
  const round = database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid LIMIT 1", { roundUid: cleanString(roundUid) });
  const parsed = rowToRound(round);
  if (!parsed || parsed.eventUid !== cleanString(eventUid)) return { ok: true, skipped: true, reason: "round_missing_or_event_mismatch" };
  if (parsed.status !== "active") return { ok: true, skipped: true, reason: "round_not_active", status: parsed.status };
  const unresolved = markSoundRoundUnresolved({ eventUid, roundUid, reason: "answer_window_timeout", policy: "requeue_later" });
  const next = unresolved && unresolved.ok ? scheduleNextSoundRound(eventUid, "answer_window_timeout") : null;
  return { ok: true, unresolved, next };
}

function buildSoundSystemMediaFieldsForSnippet(snippet = {}) {
  const mediaId = cleanString(snippet.mediaId || snippet.media_id || "");
  const mediaPath = cleanString(snippet.mediaPath || snippet.file || snippet.path || "");
  const title = cleanString(snippet.title || "EventSound");
  const lowerId = mediaId.toLowerCase();

  // Test-Helper-Sounds sind absichtlich keine echten Media-Registry-IDs.
  // Sie werden fuer kontrollierte Runtime-Tests als generated_beep an das Sound-System gegeben,
  // damit der PreRoll-/Countdown-Flow ohne geratenen lokalen Dateipfad testbar bleibt.
  if (lowerId.startsWith("evs_test_audio_") || lowerId.startsWith("evs19_test_audio_")) {
    let frequency = 740;
    if (lowerId.includes("engel")) frequency = 880;
    if (lowerId.includes("kaffee")) frequency = 990;
    if (lowerId.includes("schluessel")) frequency = 660;
    return {
      ok: true,
      testGeneratedBeep: true,
      type: "generated_beep",
      mediaType: "audio",
      durationMs: 1200,
      frequency,
      label: title,
      mediaId: "",
      mediaAssetId: "",
      mediaPath: "",
      mediaRelativePath: ""
    };
  }

  if (/^https?:\/\//i.test(mediaPath || mediaId)) {
    return {
      ok: true,
      mediaUrl: mediaPath || mediaId,
      audioUrl: mediaPath || mediaId,
      mediaType: "audio",
      label: title
    };
  }

  if (mediaPath) {
    return {
      ok: true,
      mediaPath,
      mediaRelativePath: mediaPath,
      registryPath: mediaPath,
      label: title
    };
  }

  if (mediaId && /^\d+$/.test(mediaId)) {
    return {
      ok: true,
      mediaId,
      mediaAssetId: mediaId,
      assetId: mediaId,
      label: title
    };
  }

  return {
    ok: false,
    error: "sound_media_file_missing",
    mediaId,
    mediaPath,
    label: title,
    note: "Sound-Schnipsel hat keine aufloesbare Media-Registry-ID, keinen Media-Pfad und ist kein Test-Beep."
  };
}

function buildSoundPlaybackPayload(event, round, snippet, runtimeConfig) {
  const mediaFields = buildSoundSystemMediaFieldsForSnippet(snippet);
  return {
    prepared: true,
    mediaResolved: !!(mediaFields && mediaFields.ok),
    mediaResolution: mediaFields,
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
      mediaId: mediaFields.ok ? (mediaFields.mediaId || "") : snippet.mediaId,
      mediaPath: mediaFields.ok ? (mediaFields.mediaPath || "") : snippet.mediaPath,
      mediaResolutionError: mediaFields.ok ? "" : mediaFields.error,
      label: snippet.title,
      ...(mediaFields.ok ? mediaFields : {}),
      category: "stream_event_sound_snippet",
      requestedBy: MODULE_NAME,
      priority: 70,
      target: runtimeConfig.target || "both",
      ...(runtimeConfig.outputTarget && runtimeConfig.outputTarget !== "default" ? { outputTarget: runtimeConfig.outputTarget } : {}),
      source: MODULE_NAME,
      meta: {
        module: MODULE_NAME,
        owner: MODULE_NAME,
        eventUid: event.eventUid,
        roundUid: round.roundUid,
        snippetUid: snippet.snippetUid,
        eventPreRoll: {
          enabled: boolValue(runtimeConfig.preRollEnabled, false) || boolValue(runtimeConfig.countdownPreRollEnabled, false),
          countdownEnabled: boolValue(runtimeConfig.countdownPreRollEnabled, false),
          owner: MODULE_NAME,
          eventUid: event.eventUid,
          roundUid: round.roundUid,
          seconds: clampNumber(runtimeConfig.countdownPreRollSeconds ?? runtimeConfig.preRollSeconds, 1, 30, 3),
          finalLabel: "LOS!",
          caption: "Sound startet gleich",
          guessingLabel: ""
        }
      }
    },
    preRoll: buildSoundPreRollPlan(runtimeConfig),
    meta: {
      preparedAt: nowIso(),
      answerSeconds: runtimeConfig.answerSeconds,
      soundSafeStep: "EVENT-SOUND-5B",
      extensionPoint: "stream_events.before_sound_system_play_request",
      note: "EVENT-SOUND-5B: EventSound nutzt standardmaessig die Sound-System-Ausgabequelle; outputTarget wird nur bei expliziter Config ueberschrieben."
    }
  };
}


function requestSoundSystemPlaybackForSoundRound(playback = {}, options = {}) {
  const item = playback && playback.item && typeof playback.item === "object" && !Array.isArray(playback.item) ? playback.item : null;
  if (!item) return { ok: false, error: "playback_item_missing" };
  if (!soundSystemModule || typeof soundSystemModule.playStreamEventPreRollItem !== "function") {
    return { ok: false, error: "sound_system_play_function_unavailable" };
  }
  const confirm = String(options.confirm || options.confirmed || "").trim();
  if (confirm !== "1" && confirm.toLowerCase() !== "true") {
    return { ok: false, error: "confirm_required", hint: "Setze play=1 und confirm=1 fuer kontrolliertes EventSound-Playback." };
  }
  const originalMeta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta) ? item.meta : {};
  const originalPreRoll = originalMeta.eventPreRoll && typeof originalMeta.eventPreRoll === "object" && !Array.isArray(originalMeta.eventPreRoll) ? originalMeta.eventPreRoll : {};
  const isRevealPlayback = boolValue(originalMeta.eventSoundReveal, false)
    || boolValue(originalMeta.revealVideo, false)
    || boolValue(item.eventSoundReveal, false)
    || boolValue(item.revealVideo, false)
    || cleanString(item.category) === "stream_event_reveal_video";
  const suppressRuntimePreRoll = isRevealPlayback
    || boolValue(originalPreRoll.suppressRuntimeOverlay, false)
    || boolValue(originalPreRoll.playbackOnly, false)
    || (!!originalPreRoll.suppressedBy && originalPreRoll.enabled === false);
  const eventPreRollPayload = suppressRuntimePreRoll
    ? {
        ...originalPreRoll,
        enabled: false,
        countdownEnabled: false,
        preRollEnabled: false,
        playbackOnly: true,
        suppressRuntimeOverlay: true,
        owner: MODULE_NAME,
        eventUid: originalPreRoll.eventUid || originalMeta.eventUid || item.eventUid || "",
        roundUid: originalPreRoll.roundUid || originalMeta.roundUid || item.roundUid || "",
        reason: originalPreRoll.reason || "winner_card_announces_reveal"
      }
    : {
        ...originalPreRoll,
        enabled: true,
        countdownEnabled: true,
        preRollEnabled: true,
        owner: MODULE_NAME,
        eventUid: originalPreRoll.eventUid || originalMeta.eventUid || item.eventUid || "",
        roundUid: originalPreRoll.roundUid || originalMeta.roundUid || item.roundUid || "",
        seconds: clampNumber(originalPreRoll.seconds ?? originalPreRoll.countdownSeconds ?? originalPreRoll.preRollSeconds, 1, 30, 3),
        finalLabel: originalPreRoll.finalLabel || "LOS!",
        caption: originalPreRoll.caption || "Sound startet gleich",
        guessingLabel: originalPreRoll.guessingLabel || ""
      };
  const requestedItem = {
    ...item,
    sourceModule: MODULE_NAME,
    source: MODULE_NAME,
    requestedBy: MODULE_NAME,
    meta: {
      ...originalMeta,
      module: MODULE_NAME,
      owner: MODULE_NAME,
      eventSoundRoundPlayback: !suppressRuntimePreRoll,
      eventSoundRevealPlayback: !!suppressRuntimePreRoll,
      eventSound4: true,
      eventSound4B: true,
      eventSound4C: true,
      eventSound5: true,
      eventSound5B: true,
      eventRuntimeOverlaySuppressed: !!suppressRuntimePreRoll,
      eventPreRoll: eventPreRollPayload
    }
  };
  if (requestedItem.mediaResolutionError) {
    return { ok: false, module: MODULE_NAME, step: "EVENT-SOUND-5B", playbackRequested: true, error: requestedItem.mediaResolutionError, mediaId: requestedItem.mediaId || "", mediaPath: requestedItem.mediaPath || "" };
  }
  try {
    const result = soundSystemModule.playStreamEventPreRollItem(requestedItem);
    return {
      ok: !!(result && result.ok),
      module: MODULE_NAME,
      step: "EVENT-SOUND-5B",
      playbackRequested: true,
      soundSystemResult: result || null,
      queueTouched: !!(result && result.result && (result.result.started || result.result.queued || result.result.parallel)),
      audioTouched: !!(result && result.result && (result.result.started || result.result.parallel)),
      error: result && result.error ? result.error : ""
    };
  } catch (err) {
    return { ok: false, module: MODULE_NAME, step: "EVENT-SOUND-5B", playbackRequested: true, error: err && err.message ? err.message : String(err) };
  }
}

function createSoundRound(options = {}) {
  ensureSchema();
  const forceResetTestState = boolValue(options.forceReset || options.forceResetTestState || options.resetTestState, false);
  const preCleanup = forceResetTestState ? cleanupSoundRuntimeTestState({ includeCurrentActive: true }) : null;
  const event = cleanString(options.eventUid) ? getEventByUid(options.eventUid) : getActiveEvent();
  if (!event) return { ok: false, error: "active_event_missing" };
  if (event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: event.eventUid, status: event.status };
  if (!event.soundEnabled) return { ok: false, error: "sound_not_enabled", eventUid: event.eventUid };
  if (isEventRuntimePaused(event.eventUid)) return { ok: false, error: "event_runtime_paused", eventUid: event.eventUid };
  if (isEventRuntimeOfflineWaiting(event.eventUid)) return { ok: false, error: "stream_offline_auto_waiting", eventUid: event.eventUid, message: "Stream ist offline. Event wartet automatisch bis der Stream wieder online ist." };
  const runtimeGateForRound = getRuntimeGateStatus({ eventUid: event.eventUid });
  const isDashboardTestEvent = boolValue(event.metadata && (event.metadata.dashboardTest || event.metadata.testEvent), false);
  const bypassRuntimeGateForTest = isDashboardTestEvent || boolValue(options.dashboardTest || options.testMode || options.allowOfflineTest || options.ignoreRuntimeGate, false);
  if (!runtimeGateForRound.active && !bypassRuntimeGateForTest) {
    if (runtimeGateForRound.stream && runtimeGateForRound.stream.online === false) putActiveStreamEventsIntoStreamOfflineWait(runtimeGateForRound.reason || "stream_offline", { source: "createSoundRound" });
    return { ok: false, error: runtimeGateForRound.reason || "runtime_gate_inactive", eventUid: event.eventUid, message: runtimeGateForRound.label || "Event-Runtime ist nicht aktiv.", runtimeGate: runtimeGateForRound };
  }
  const picked = pickNextSoundSnippet(event, options);
  if (!picked.ok) return { ok: false, eventUid: event.eventUid, preCleanup, ...picked };
  const snippet = picked.snippet;
  const runtimeConfig = picked.runtimeConfig;
  const roundUid = newUid("evs_sound_round");
  const now = nowIso();
  const roundConfig = {
    snippet,
    runtimeConfig,
    answerSeconds: getEffectiveSoundAnswerSeconds(runtimeConfig)
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
  const shouldPlay = boolValue(options.play || options.playback || options.startPlayback || options.withPlayback, false);
  const playbackResult = shouldPlay ? requestSoundSystemPlaybackForSoundRound(playback, { confirm: options.confirm || options.confirmed }) : { ok: true, playbackRequested: false, preparedOnly: true };
  const playbackResultData = { preparedOnly: !shouldPlay, playbackRequested: !!shouldPlay, playbackResult };
  try {
    const update = {
      result_json: jsonEncode(playbackResultData),
      updated_at: nowIso()
    };
    // Wenn kontrolliertes Playback vor dem Queue-/Start-Accept fehlschlaegt, darf keine aktive Testrunde haengen bleiben.
    if (shouldPlay && !(playbackResult && playbackResult.ok)) {
      update.status = "failed";
      update.result = "playback_failed";
      update.finished_at = nowIso();
    }
    database.updateByKey("stream_events_rounds", "round_uid", round.roundUid, update);
  } catch (_) {}
  const activeAfterPlayback = getActiveSoundRound(event.eventUid);
  const answerTimer = activeAfterPlayback && activeAfterPlayback.roundUid === round.roundUid
    ? { ok: true, skipped: true, reason: shouldPlay ? "waiting_for_sound_audio_end" : "playback_not_started_prepared_only", startsAfter: "sound_audio_ended", answerSeconds: roundConfig.answerSeconds }
    : { ok: true, skipped: true, reason: "round_not_active_after_playback" };
  if (activeAfterPlayback && activeAfterPlayback.roundUid === round.roundUid) {
    const preparedAt = nowIso();
    mergeRoundResultData(activeAfterPlayback, {
      answerWindowState: shouldPlay ? "waiting_for_sound_audio_end" : "prepared_only",
      answerWindowSeconds: roundConfig.answerSeconds,
      answerWindowStartRule: "after_sound_audio_end",
      answerWindowPreparedAt: preparedAt
    });
    upsertEventRuntimeState(event.eventUid, {
      runtimeStatus: "active",
      phase: shouldPlay ? "sound_playing" : "sound_prepared",
      activeRoundUid: round.roundUid,
      phaseStartedAt: preparedAt,
      phaseEndsAt: "",
      nextAutoStartAt: "",
      recoveryRequired: false,
      recoveryReason: shouldPlay ? "sound_round_started" : "sound_round_prepared",
      recoveryNote: shouldPlay ? "Sound-Schnipsel wurde gestartet." : "Sound-Schnipsel wurde vorbereitet.",
      metadata: { source: "createSoundRound", roundUid: round.roundUid, snippetUid: snippet.snippetUid, title: snippet.title, playbackRequested: shouldPlay }
    });
  }

  const chatOutput = buildChatOutput("sound.round.started", {
    title: snippet.title,
    soundTitle: snippet.title,
    answerSeconds: roundConfig.answerSeconds,
    points: snippet.points || runtimeConfig.defaultPoints
  }, { reason: "sound_round_started" });
  runtimeState.counters.soundRoundsPrepared += 1;
  runtimeState.counters.soundRoundsStarted += 1;
  markAction("sound.round.started", event.eventUid);
  emitBus("stream_events.sound", "round_started", { eventUid: event.eventUid, round, snippet: safeJson(snippet, {}), playback, chatOutput, answerTimer });
  publishStatus("sound.round_started", { lastEventUid: event.eventUid, roundUid });
  return { ok: true, eventUid: event.eventUid, preCleanup, round: getActiveSoundRound(event.eventUid) || round, snippet, acceptedAnswersDebug: buildSoundAcceptedAnswersDebug(snippet), playback, playbackResult, answerTimer, chatOutput, directPlayback: false, soundSystemPlaybackRequested: !!shouldPlay };
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
  const requestedRoundUid = cleanString(body.roundUid || body.round_uid);
  if (requestedRoundUid && requestedRoundUid !== round.roundUid) return { ok: true, skipped: true, reason: "active_round_uid_mismatch", activeRoundUid: round.roundUid, requestedRoundUid };
  cancelSoundAnswerTimer(round.roundUid);
  const event = getEventByUid(round.eventUid);
  if (!event || event.status !== STATUS.ACTIVE) return { ok: false, error: "event_not_active", eventUid: round.eventUid };
  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const userLogin = cleanString(body.userLogin || body.login || body.user).replace(/^@/, "").toLowerCase();
  const userDisplayName = cleanString(body.userDisplayName || body.displayName || body.user, userLogin);
  const userAvatarUrl = cleanString(body.userAvatarUrl || body.avatarUrl || body.avatar_url || body.profileImageUrl || body.profile_image_url);
  const answer = cleanString(body.answer || body.message || body.text);
  if (!userLogin) return { ok: false, error: "user_login_required" };
  if (!answer) return { ok: false, error: "answer_required" };
  const correct = answerMatchesSoundSnippet(answer, snippet);
  if (!correct) return { ok: true, solved: false, reason: "answer_not_accepted", eventUid: event.eventUid, roundUid: round.roundUid };
  const runtimeConfig = getSoundRuntimeConfig(event);
  const points = clampNumber(body.points ?? snippet.points ?? runtimeConfig.defaultPoints, 0, 10000, 10);
  const now = nowIso();
  const resultData = { solved: true, userLogin, userDisplayName, userAvatarUrl, answer, points, solvedAt: now, chatMessageId: cleanString(body.messageId || body.chatMessageId || body.message_id) };
  database.updateByKey("stream_events_rounds", "round_uid", round.roundUid, {
    status: "solved",
    result: "solved",
    finished_at: now,
    updated_at: now,
    result_json: jsonEncode(resultData)
  });
  cancelSoundAnswerTimer(round.roundUid);
  markSoundAnswerWindowClosed(round.roundUid, "solved");

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
  const revealVideoResult = scheduleRevealVideoForSolvedSoundRound(event, round, snippet, runtimeConfig);
  const partStatusAfterSolve = getEventRuntimePartsStatus(getEventByUid(event.eventUid));
  const nextSoundRound = !partStatusAfterSolve.sound.completed ? scheduleNextSoundRound(event.eventUid, "sound_solved") : null;
  const autoFinish = partStatusAfterSolve.sound.completed ? maybeAutoFinishEventIfPartsCompleted(event.eventUid, "sound_part_completed") : null;

  const chatOutput = buildChatOutput("sound.solved", { user: userDisplayName, displayName: userDisplayName, title: snippet.title, soundTitle: snippet.title, points }, { reason: "sound_solved" });
  runtimeState.counters.soundRoundsSolved += 1;
  markAction("sound.round.solved", event.eventUid);
  const updatedRound = database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid", { roundUid: round.roundUid });
  const updatedRoundPublic = rowToRound(updatedRound);
  const mergedResultData = { ...(updatedRoundPublic && updatedRoundPublic.resultData ? updatedRoundPublic.resultData : resultData), revealVideo: revealVideoResult, partStatus: partStatusAfterSolve, nextSoundRound, autoFinish };
  try {
    database.updateByKey("stream_events_rounds", "round_uid", round.roundUid, {
      result_json: jsonEncode(mergedResultData),
      updated_at: nowIso()
    });
  } catch (_) {}
  const finalRound = rowToRound(database.get("SELECT * FROM stream_events_rounds WHERE round_uid = :roundUid", { roundUid: round.roundUid })) || updatedRoundPublic;
  const userResolve = scheduleSolvedUserAvatarResolve(round.roundUid, userLogin, userDisplayName, userAvatarUrl);
  emitBus("stream_events.sound", "solved", { eventUid: event.eventUid, round: finalRound, userLogin, userDisplayName, userAvatarUrl, answer, points, chatOutput, ranking: pointsResult.ranking || [], revealVideo: revealVideoResult, partStatus: partStatusAfterSolve, nextSoundRound, autoFinish, userResolve });
  publishStatus("sound.solved", { lastEventUid: event.eventUid, roundUid: round.roundUid, userResolve });
  return { ok: true, solved: true, eventUid: event.eventUid, roundUid: round.roundUid, points, chatOutput, pointsResult, revealVideo: revealVideoResult, partStatus: partStatusAfterSolve, nextSoundRound, autoFinish, userResolve };
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
  if (!isSoundAnswerWindowOpen(round)) {
    runtimeState.counters.soundRuntimeSkipped += 1;
    return { ok: true, skipped: true, reason: "sound_answer_window_not_open", eventUid: event.eventUid, roundUid: round.roundUid, answerWindowState: round.resultData && round.resultData.answerWindowState ? round.resultData.answerWindowState : "not_started" };
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
      userAvatarUrl: cleanString(chat.userAvatarUrl || chat.avatarUrl || ""),
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
  const requestedRoundUid = cleanString(body.roundUid || body.round_uid);
  if (requestedRoundUid && requestedRoundUid !== round.roundUid) return { ok: true, skipped: true, reason: "active_round_uid_mismatch", activeRoundUid: round.roundUid, requestedRoundUid };
  cancelSoundAnswerTimer(round.roundUid);
  markSoundAnswerWindowClosed(round.roundUid, cleanString(body.reason || "unresolved"));
  const event = getEventByUid(round.eventUid);
  const snippet = round.config && round.config.snippet ? round.config.snippet : {};
  const runtimeConfig = getSoundRuntimeConfig(event);
  const now = nowIso();
  const policy = cleanString(body.policy || runtimeConfig.unresolvedPolicy, "requeue_later");
  const existingResultData = round.resultData && typeof round.resultData === "object" ? round.resultData : {};
  const resultData = { ...existingResultData, solved: false, policy, reason: cleanString(body.reason || "manual_unresolved"), unresolvedAt: now, answerWindowState: "closed", answerWindowClosedAt: now, answerWindowCloseReason: cleanString(body.reason || "unresolved") };
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
  const partStatus = getEventRuntimePartsStatus(getEventByUid(round.eventUid));
  const nextSoundRound = scheduleNextSoundRound(round.eventUid, cleanString(body.reason || "sound_unresolved"));
  emitBus("stream_events.sound", "unresolved", { eventUid: round.eventUid, roundUid: round.roundUid, policy, chatOutput, partStatus, nextSoundRound });
  publishStatus("sound.unresolved", { lastEventUid: round.eventUid, roundUid: round.roundUid });
  return { ok: true, eventUid: round.eventUid, roundUid: round.roundUid, policy, chatOutput, partStatus, nextSoundRound };
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
    runtimeState: event ? getEventRuntimeState(event.eventUid) : null,
    parts: event ? getEventRuntimePartsStatus(event) : getEventRuntimePartsStatus(null),
    timers: {
      answerTimers: soundAnswerTimers.size,
      autoAdvanceTimers: soundAutoAdvanceTimers.size
    },
    counters: safeJson(runtimeState.counters, {}),
    rules: {
      preparedOnly: false,
      directPlayback: false,
      soundSystemQueueTouched: "only_with_explicit_play_confirm",
      preRollExtensionPointPrepared: true,
      eventSoundPlaybackBindingPrepared: true,
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
          answerSeconds: getEffectiveSoundAnswerSeconds(runtimeConfig),
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


function millisecondsUntilIso(iso = "") {
  const ts = Date.parse(cleanString(iso));
  if (!Number.isFinite(ts)) return 0;
  return Math.max(0, ts - Date.now());
}

function secondsUntilIso(iso = "") {
  return Math.ceil(millisecondsUntilIso(iso) / 1000);
}

function publicSoundTimerInfo(eventUid = "") {
  const uid = cleanString(eventUid);
  const timerInfo = uid ? soundAutoAdvanceTimers.get(uid) : null;
  if (!timerInfo) return null;
  const dueAt = cleanString(timerInfo.dueAt || "");
  return {
    active: true,
    eventUid: uid,
    reason: cleanString(timerInfo.reason || ""),
    delaySeconds: Number(timerInfo.delaySeconds || 0),
    scheduledAt: cleanString(timerInfo.scheduledAt || ""),
    dueAt,
    remainingMs: millisecondsUntilIso(dueAt),
    remainingSeconds: secondsUntilIso(dueAt),
    schedulePlan: timerInfo.schedulePlan || null
  };
}

function buildNextSoundRuntimeStatus(event = null) {
  if (!event || !event.eventUid) {
    return { ok: true, enabled: false, status: "no_event", label: "Kein aktives Event", updatedAt: nowIso() };
  }
  if (!event.soundEnabled) {
    return { ok: true, enabled: false, eventUid: event.eventUid, status: "sound_disabled", label: "Sound-Spiel nicht aktiv", updatedAt: nowIso() };
  }

  const state = getEventRuntimeState(event.eventUid);
  const activeRound = getActiveSoundRound(event.eventUid);
  const timerInfo = publicSoundTimerInfo(event.eventUid);
  const parts = getEventRuntimePartsStatus(event);
  const runtimeStatus = cleanString(state && state.runtimeStatus || "active").toLowerCase();
  const phase = cleanString(state && state.phase || "").toLowerCase();

  if (phase === "stream_offline_waiting" || phase === "stream_offline_auto_wait" || phase === "offline_waiting") {
    return {
      ok: true,
      enabled: true,
      eventUid: event.eventUid,
      status: "offline_waiting",
      runtimeStatus: state ? state.runtimeStatus : "active",
      phase: state ? state.phase : "stream_offline_waiting",
      label: "Stream offline – Event wartet",
      detail: state && state.recoveryNote ? state.recoveryNote : "Event wartet automatisch und läuft weiter, sobald der Stream wieder online ist.",
      nextAutoStartAt: "",
      remainingSeconds: 0,
      activeRound: null,
      timer: null,
      runtimeState: state,
      parts,
      updatedAt: nowIso()
    };
  }

  if (runtimeStatus === "paused" || phase === "manual_paused" || phase === "paused") {
    return {
      ok: true,
      enabled: true,
      eventUid: event.eventUid,
      status: "paused",
      runtimeStatus: state ? state.runtimeStatus : "paused",
      phase: state ? state.phase : "paused",
      label: "Manuell pausiert · Fortsetzen erforderlich",
      detail: state && state.recoveryNote ? state.recoveryNote : "Event ist manuell pausiert.",
      nextAutoStartAt: "",
      remainingSeconds: 0,
      activeRound: null,
      timer: null,
      runtimeState: state,
      parts,
      updatedAt: nowIso()
    };
  }

  if (activeRound) {
    const rd = activeRound.resultData && typeof activeRound.resultData === "object" ? activeRound.resultData : {};
    const answerState = cleanString(rd.answerWindowState || "").toLowerCase();
    const snippet = activeRound.config && activeRound.config.snippet ? activeRound.config.snippet : {};
    const title = cleanString(snippet.title || snippet.name || activeRound.itemUid || activeRound.roundUid);
    const answerEndsAt = cleanString(rd.answerWindowEndsAt || "");
    let status = "round_active";
    let label = title ? `${title} · aktiv` : "Schnipsel aktiv";
    let detail = "Aktive Sound-Runde läuft.";
    let remainingSeconds = 0;
    let dueAt = "";

    if (answerState === "open") {
      status = "answer_window";
      dueAt = answerEndsAt;
      remainingSeconds = secondsUntilIso(answerEndsAt);
      label = `Antwortfenster · noch ${remainingSeconds}s`;
      detail = title ? `${title} · Antwortfenster läuft.` : "Antwortfenster läuft.";
    } else if (answerState === "waiting_for_sound_audio_end") {
      status = "sound_playing";
      label = title ? `${title} · Sound läuft` : "Sound läuft";
      detail = "Antwortfenster startet nach Sound-Ende.";
    } else if (answerState === "prepared_only") {
      status = "prepared";
      label = title ? `${title} · vorbereitet` : "Schnipsel vorbereitet";
      detail = "Schnipsel ist vorbereitet, aber noch nicht gestartet.";
    }

    return {
      ok: true,
      enabled: true,
      eventUid: event.eventUid,
      status,
      runtimeStatus: state ? state.runtimeStatus : "active",
      phase: state ? state.phase : status,
      label,
      detail,
      nextAutoStartAt: dueAt,
      remainingSeconds,
      activeRound,
      activeSnippet: snippet,
      timer: null,
      runtimeState: state,
      parts,
      updatedAt: nowIso()
    };
  }

  if (timerInfo) {
    const minutes = Math.floor(timerInfo.remainingSeconds / 60);
    const seconds = timerInfo.remainingSeconds % 60;
    return {
      ok: true,
      enabled: true,
      eventUid: event.eventUid,
      status: "waiting",
      runtimeStatus: state ? state.runtimeStatus : "active",
      phase: state ? state.phase : "waiting",
      label: `Nächster Schnipsel in ${minutes}:${String(seconds).padStart(2, "0")} Min.`,
      detail: timerInfo.dueAt ? `Geplant um ${timerInfo.dueAt}` : "Wartezeit läuft.",
      nextAutoStartAt: timerInfo.dueAt,
      remainingSeconds: timerInfo.remainingSeconds,
      timer: timerInfo,
      runtimeState: state,
      parts,
      updatedAt: nowIso()
    };
  }

  const persistedDueAt = cleanString(state && state.nextAutoStartAt || "");
  if (persistedDueAt) {
    const remainingSeconds = secondsUntilIso(persistedDueAt);
    return {
      ok: true,
      enabled: true,
      eventUid: event.eventUid,
      status: remainingSeconds > 0 ? "waiting_persisted" : "waiting_due",
      runtimeStatus: state ? state.runtimeStatus : "active",
      phase: state ? state.phase : "waiting",
      label: remainingSeconds > 0 ? `Nächster Schnipsel in ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")} Min.` : "Nächster Schnipsel fällig",
      detail: remainingSeconds > 0 ? `Geplant um ${persistedDueAt}` : "Geplante Startzeit ist erreicht. Status neu laden oder Wartezeit überspringen.",
      nextAutoStartAt: persistedDueAt,
      remainingSeconds,
      timer: null,
      runtimeState: state,
      parts,
      updatedAt: nowIso()
    };
  }

  return {
    ok: true,
    enabled: true,
    eventUid: event.eventUid,
    status: parts && parts.sound && parts.sound.completed ? "completed" : "waiting_unscheduled",
    runtimeStatus: state ? state.runtimeStatus : "active",
    phase: state ? state.phase : "waiting",
    label: parts && parts.sound && parts.sound.completed ? "Sound-Teil abgeschlossen" : "Keine Wartezeit geplant",
    detail: parts && parts.sound && parts.sound.completed ? "Alle Sound-Schnipsel sind erledigt." : "Aktuell ist kein Timer gespeichert. Status neu laden oder Wartezeit überspringen.",
    nextAutoStartAt: "",
    remainingSeconds: 0,
    timer: null,
    runtimeState: state,
    parts,
    updatedAt: nowIso()
  };
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
  const eventRuntimeState = eventRow ? getEventRuntimeState(eventRow.eventUid) : null;
  const nextSound = eventRow ? buildNextSoundRuntimeStatus(eventRow) : null;
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    activeEvent: publicEventSummary(getActiveEvent()),
    event: publicEventSummary(eventRow),
    eventUid: uid,
    runtimeState: eventRuntimeState,
    nextSound,
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

  const textScoreUids = new Set([
    ...enrichedWordHits.map(row => cleanString(row.hitUid)),
    ...enrichedPhraseSolves.map(row => cleanString(row.solveUid))
  ].filter(Boolean));
  const otherScoreEntries = enrichedScoreEntries.filter(row => {
    const sourceType = cleanString(row.sourceType);
    if (sourceType.startsWith("sound")) return false;
    if (sourceType === "text_word_hit" || sourceType === "text_phrase_solve") return !textScoreUids.has(cleanString(row.sourceUid));
    return true;
  });

  const timeline = [
    ...enrichedWordHits.map(row => ({ kind: "word_hit", gameType: "text", label: `Wort gefunden: ${row.wordOriginal || row.wordKey}`, points: row.pointsAwarded, createdAt: row.createdAt, row })),
    ...enrichedPhraseSolves.map(row => ({ kind: "phrase_solved", gameType: "text", label: `Satz ${row.phraseNumber} gelöst`, points: row.pointsAwarded, createdAt: row.createdAt, row })),
    ...soundEntries.map(row => ({ kind: "sound_score", gameType: "sound", label: row.metadata && row.metadata.title ? `Sound gelöst: ${row.metadata.title}` : (row.reason || row.sourceType || "Sound-Punkte"), points: row.points, createdAt: row.createdAt, row })),
    ...otherScoreEntries.map(row => ({ kind: row.sourceType || "score_entry", gameType: row.sourceType && row.sourceType.startsWith("text") ? "text" : "points", label: row.reason || row.sourceType || "Punkte-Eintrag", points: row.points, createdAt: row.createdAt, row }))
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
      note: soundEntries.length > 0 ? "Sound-bezogene Punkte aus score_entries." : "Noch keine Sound-Punkte fuer diesen User im gewaehlten Event.",
      rows: soundEntries
    },
    scoreEntries: enrichedScoreEntries,
    timeline,
    updatedAt: nowIso()
  };
}



function isAudioMediaAssetRow(row = {}) {
  const type = cleanString(row.type || row.media_type || row.mediaType).toLowerCase();
  const rel = cleanString(row.relative_path || row.relativePath || row.file_name || row.fileName || "").toLowerCase();
  if (type === "video") return false;
  if (/\.(mp4|mov|mkv|avi|wmv|m4v)$/i.test(rel)) return false;
  if (type === "audio") return true;
  return /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(rel);
}

function isVideoMediaAssetRow(row = {}) {
  const type = cleanString(row.type || row.media_type || row.mediaType).toLowerCase();
  const rel = cleanString(row.relative_path || row.relativePath || row.file_name || row.fileName || "").toLowerCase();
  if (type === "video") return true;
  return /\.(mp4|mov|mkv|avi|wmv|m4v|webm)$/i.test(rel);
}

function resolveMediaAssetForPlaybackRef(ref = {}, options = {}) {
  ensureSchema();
  const raw = ref && typeof ref === "object" && !Array.isArray(ref) ? ref : { mediaId: ref };
  const preferredId = cleanString(raw.mediaId || raw.media_id || raw.mediaAssetId || raw.assetId || raw.id || "");
  const preferredPath = cleanString(raw.mediaPath || raw.mediaRelativePath || raw.registryPath || raw.relativePath || raw.path || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const requireVideo = options.requireVideo === true;
  const requireAudio = options.requireAudio === true;

  let row = null;
  try {
    if (preferredId && /^\d+$/.test(preferredId)) {
      row = database.get("SELECT * FROM media_assets WHERE id = :id AND status = 'active' LIMIT 1", { id: Number(preferredId) }) || null;
    }
    if (!row && preferredPath) {
      row = database.get("SELECT * FROM media_assets WHERE relative_path = :path AND status = 'active' LIMIT 1", { path: preferredPath }) || null;
    }
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err), mediaId: preferredId, mediaPath: preferredPath };
  }

  if (!row) {
    return { ok: false, error: `media_asset_not_found:${preferredId || preferredPath}`, mediaId: preferredId, mediaPath: preferredPath };
  }

  if (requireVideo && !isVideoMediaAssetRow(row)) {
    return { ok: false, error: "media_asset_is_not_video", mediaId: String(row.id || preferredId || ""), mediaPath: preferredPath };
  }
  if (requireAudio && !isAudioMediaAssetRow(row)) {
    return { ok: false, error: "media_asset_is_not_audio", mediaId: String(row.id || preferredId || ""), mediaPath: preferredPath };
  }

  const id = String(row.id || preferredId || "").trim();
  const rel = cleanString(row.relative_path || row.relativePath || preferredPath).replace(/\\/g, "/").replace(/^\/+/, "");
  const webPath = cleanString(row.web_path || row.webPath || (rel ? `/assets/${rel}` : "")).replace(/\\/g, "/");
  const label = cleanString(row.display_name || row.displayName || row.file_name || row.fileName || row.original_name || row.originalName || (rel ? rel.split("/").pop() : `Media ${id}`), `Media ${id || ""}`);
  const type = isVideoMediaAssetRow(row) ? "video" : (isAudioMediaAssetRow(row) ? "audio" : cleanString(row.type || row.media_type || row.mediaType || "media"));

  return {
    ok: true,
    id,
    mediaId: id,
    mediaAssetId: id,
    assetId: id,
    mediaPath: rel,
    mediaRelativePath: rel,
    registryPath: rel,
    webPath,
    label,
    title: label,
    mediaType: type,
    type,
    durationMs: Number(row.duration_ms || row.durationMs || 0) || 0,
    hasAudio: row.has_audio === 1 || row.hasAudio === true,
    hasVideo: row.has_video === 1 || row.hasVideo === true || type === "video",
    row
  };
}

function findRevealVideoForTestAudio(audioRow = {}, options = {}) {
  ensureSchema();
  const explicitRevealId = cleanString(options.revealVideoId || options.videoMediaId || options.revealMediaId || "");
  if (explicitRevealId) return { id: explicitRevealId, explicit: true };

  const audioRel = cleanString(audioRow.relative_path || audioRow.relativePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const dir = audioRel.includes("/") ? audioRel.split("/").slice(0, -1).join("/") : "";
  const params = {};
  const where = ["status = 'active'", "(type = 'video' OR lower(relative_path) LIKE '%.mp4' OR lower(relative_path) LIKE '%.mov' OR lower(relative_path) LIKE '%.m4v' OR lower(relative_path) LIKE '%.mkv' OR lower(relative_path) LIKE '%.webm')"];
  if (dir) {
    where.push("relative_path LIKE :dirPrefix");
    params.dirPrefix = `${dir}/%`;
  } else {
    where.push("(relative_path LIKE 'media/stream_events/%' OR relative_path LIKE 'stream_events/%')");
  }
  try {
    const rows = database.all(`
      SELECT * FROM media_assets
      WHERE ${where.join(" AND ")}
      ORDER BY id ASC
      LIMIT 10
    `, params).filter(isVideoMediaAssetRow);
    const row = rows[0] || null;
    if (!row) return null;
    return {
      id: String(row.id || "").trim(),
      mediaPath: cleanString(row.relative_path || row.relativePath || "").replace(/\\/g, "/").replace(/^\/+/, ""),
      title: cleanString(row.display_name || row.displayName || row.file_name || row.fileName || row.original_name || row.originalName || "Reveal-Video")
    };
  } catch (_) {
    return null;
  }
}

function getEventSoundTestMediaAssets(options = {}) {
  ensureSchema();
  const limit = clampNumber(options.limit, 1, 10, 3);
  const preferredId = cleanString(options.mediaId || options.media_id || options.mediaAssetId || options.assetId || "");
  const preferredPath = cleanString(options.mediaPath || options.mediaRelativePath || options.registryPath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const audioWhere = `
    status = 'active'
    AND (
      type = 'audio'
      OR lower(relative_path) LIKE '%.mp3'
      OR lower(relative_path) LIKE '%.wav'
      OR lower(relative_path) LIKE '%.ogg'
      OR lower(relative_path) LIKE '%.m4a'
      OR lower(relative_path) LIKE '%.flac'
      OR lower(relative_path) LIKE '%.aac'
    )
    AND NOT (
      type = 'video'
      OR lower(relative_path) LIKE '%.mp4'
      OR lower(relative_path) LIKE '%.mov'
      OR lower(relative_path) LIKE '%.mkv'
      OR lower(relative_path) LIKE '%.avi'
      OR lower(relative_path) LIKE '%.wmv'
      OR lower(relative_path) LIKE '%.m4v'
    )
  `;
  try {
    let rows = [];
    if (preferredId && /^\d+$/.test(preferredId)) {
      rows = database.all(`
        SELECT * FROM media_assets
        WHERE id = :id AND ${audioWhere}
        LIMIT 1
      `, { id: Number(preferredId) });
    } else if (preferredPath) {
      rows = database.all(`
        SELECT * FROM media_assets
        WHERE relative_path = :path AND ${audioWhere}
        LIMIT 1
      `, { path: preferredPath });
    } else {
      rows = database.all(`
        SELECT * FROM media_assets
        WHERE ${audioWhere}
          AND (
            relative_path LIKE 'media/stream_events/%'
            OR relative_path LIKE 'stream_events/%'
            OR display_name LIKE '%sek%'
            OR file_name LIKE '%sek%'
          )
        ORDER BY id ASC
        LIMIT :limit
      `, { limit });
      if (!rows.length) {
        rows = database.all(`
          SELECT * FROM media_assets
          WHERE ${audioWhere}
          ORDER BY id ASC
          LIMIT :limit
        `, { limit });
      }
    }

    rows = rows.filter(isAudioMediaAssetRow);
    return rows.map((row, index) => {
      const id = String(row.id || "").trim();
      const rel = cleanString(row.relative_path || row.relativePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
      const title = cleanString(row.display_name || row.displayName || row.file_name || row.fileName || row.original_name || row.originalName || (rel ? rel.split("/").pop() : `Media ${id}`), `Media ${id || index + 1}`);
      const reveal = findRevealVideoForTestAudio(row, options);
      return {
        uid: `media_asset_${id || index + 1}`,
        title,
        mediaId: id,
        mediaPath: rel,
        revealVideoId: reveal && reveal.id ? reveal.id : "",
        acceptedAnswers: [title.toLowerCase(), cleanString(title).toLowerCase().replace(/\.[a-z0-9]+$/i, "")].filter(Boolean),
        points: 25,
        answerSeconds: 60,
        active: true,
        raw: {
          mediaAssetId: id,
          relativePath: rel,
          realMediaTest: true,
          audioOnlySnippet: true,
          revealVideo: reveal || null
        }
      };
    }).filter(item => item.mediaId || item.mediaPath);
  } catch (err) {
    return [];
  }
}

function buildSoundRuntimeTestSnippets(body = {}) {
  const useRealMedia = boolValue(body.useRealMedia ?? body.realMedia ?? body.mediaTest ?? body.useMediaRegistry, false);
  if (Array.isArray(body.snippets) && body.snippets.length) return body.snippets;
  if (useRealMedia) {
    const real = getEventSoundTestMediaAssets(body);
    if (real.length) return real;
  }
  return null;
}

function createSoundRuntimeTestEvent(body = {}) {
  ensureSchema();
  const name = cleanString(body.name, "EVS Sound-Runtime Test");
  const startImmediately = body.start !== undefined || body.startImmediately !== undefined ? boolValue(body.start ?? body.startImmediately) : true;
  const finishExistingTestActive = body.finishExistingTestActive !== undefined ? boolValue(body.finishExistingTestActive) : true;
  const preCleanup = finishExistingTestActive ? cleanupSoundRuntimeTestState({ includeCurrentActive: true }) : { ok: true, cleanedCount: 0, skipped: true };
  const realOrCustomSnippets = buildSoundRuntimeTestSnippets(body);
  const snippets = realOrCustomSnippets || [
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
      answerSeconds: clampNumber(body.answerSeconds, 5, 3600, 60),
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
    preCleanup,
    mediaTest: {
      requested: boolValue(body.useRealMedia ?? body.realMedia ?? body.mediaTest ?? body.useMediaRegistry, false),
      usedRealMedia: !!realOrCustomSnippets,
      fallbackGeneratedBeep: !realOrCustomSnippets
    },
    snippets: getSoundSnippets(getEventByUid(event.eventUid)).map(item => ({
      snippetUid: item.snippetUid,
      title: item.title,
      mediaId: item.mediaId,
      mediaPath: item.mediaPath,
      revealVideoId: item.revealVideoId,
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
      answerSeconds: clampNumber(body.answerSeconds, 5, 3600, 60),
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



function enrichWinnerFinaleRow(row = {}) {
  const login = cleanString(row.userLogin || row.user_login || row.login || "").replace(/^@/, "").toLowerCase();
  const local = login ? resolveUserFromLocalTables(login) : { ok: false };
  const displayName = cleanString(
    row.userDisplayName || row.user_display_name || row.displayName || row.display_name ||
    (local && local.displayName) || login,
    login
  );
  const avatarUrl = cleanString(
    row.avatarUrl || row.avatar_url || row.userAvatarUrl || row.user_avatar_url ||
    row.profileImageUrl || row.profile_image_url ||
    (local && local.avatarUrl) || ""
  );
  return {
    ...row,
    userLogin: login || cleanString(row.userLogin || row.login || ""),
    userDisplayName: displayName,
    displayName,
    avatarUrl,
    userAvatarUrl: avatarUrl
  };
}

function buildWinnerFinaleRowsFromPreview(preview = {}) {
  const rankingRows = preview && preview.ranking && Array.isArray(preview.ranking.rows) ? preview.ranking.rows : [];
  const ranking = rankingRows.map(enrichWinnerFinaleRow);
  return {
    ranking,
    podiumRows: ranking.slice(0, 3),
    honorRows: ranking.slice(3, 10)
  };
}

function withWinnerFinaleRows(finale = {}, preview = {}) {
  const rows = buildWinnerFinaleRowsFromPreview(preview);
  return {
    ...finale,
    ranking: Array.isArray(finale.ranking) && finale.ranking.length ? finale.ranking.map(enrichWinnerFinaleRow) : rows.ranking,
    podiumRows: Array.isArray(finale.podiumRows) && finale.podiumRows.length ? finale.podiumRows.map(enrichWinnerFinaleRow) : rows.podiumRows,
    honorRows: Array.isArray(finale.honorRows) && finale.honorRows.length ? finale.honorRows.map(enrichWinnerFinaleRow) : rows.honorRows,
    top3: Array.isArray(finale.top3) && finale.top3.length ? finale.top3.map(enrichWinnerFinaleRow) : rows.podiumRows
  };
}


async function enrichWinnerFinaleRowAsync(row = {}) {
  const base = enrichWinnerFinaleRow(row);
  if (cleanString(base.avatarUrl || base.userAvatarUrl)) return base;
  const login = cleanString(base.userLogin || row.userLogin || row.login || "").replace(/^@/, "").toLowerCase();
  if (!login) return base;
  try {
    const info = await resolveTwitchUserInfoSmall(login);
    const avatarUrl = cleanString(info && info.avatarUrl || "");
    const displayName = cleanString(info && info.displayName || base.userDisplayName || login, base.userDisplayName || login);
    return {
      ...base,
      userLogin: login,
      userDisplayName: displayName,
      displayName,
      avatarUrl,
      userAvatarUrl: avatarUrl,
      userResolveSource: cleanString(info && info.source || ""),
      userResolveOk: info && info.ok === true
    };
  } catch (err) {
    return {
      ...base,
      userResolveSource: "resolveTwitchUserInfoSmall:error",
      userResolveOk: false,
      userResolveError: err && err.message ? err.message : String(err)
    };
  }
}


function withTimeoutPromise(promise, timeoutMs = 4000, fallbackValue = null) {
  let timer = null;
  const timeout = new Promise(resolve => {
    timer = setTimeout(() => resolve(fallbackValue), Math.max(250, Number(timeoutMs) || 4000));
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function preloadTop3WinnerAvatars(rows = [], options = {}) {
  const timeoutMs = Math.max(500, Math.min(Number(options.timeoutMs || 4000) || 4000, 10000));
  const list = Array.isArray(rows) ? rows.slice() : [];
  const top3 = list.slice(0, 3);
  if (!top3.length) {
    return {
      rows: list,
      ok: true,
      attempted: 0,
      resolved: 0,
      withAvatar: 0,
      timeoutMs,
      note: "no_top3_rows"
    };
  }

  const startedAt = nowIso();
  const resolvedTop3 = await withTimeoutPromise(
    Promise.all(top3.map(row => enrichWinnerFinaleRowAsync(row))),
    timeoutMs,
    null
  );

  let usedTimeoutFallback = false;
  const nextTop3 = Array.isArray(resolvedTop3) ? resolvedTop3 : top3.map(enrichWinnerFinaleRow);
  if (!Array.isArray(resolvedTop3)) usedTimeoutFallback = true;

  const merged = list.map((row, index) => index < 3 ? nextTop3[index] : row);
  const withAvatar = nextTop3.filter(row => cleanString(row && (row.avatarUrl || row.userAvatarUrl))).length;
  const resolved = nextTop3.filter(row => row && row.userResolveOk === true).length;

  return {
    rows: merged,
    ok: true,
    attempted: top3.length,
    resolved,
    withAvatar,
    timeout: usedTimeoutFallback,
    timeoutMs,
    startedAt,
    finishedAt: nowIso(),
    rule: "winner_finale_top3_avatar_preload_before_bus_emit"
  };
}

async function buildWinnerFinaleRowsFromPreviewWithTop3Gate(preview = {}, options = {}) {
  const syncRows = buildWinnerFinaleRowsFromPreview(preview);
  const gate = await preloadTop3WinnerAvatars(syncRows.ranking || [], {
    timeoutMs: options.top3AvatarTimeoutMs || options.timeoutMs || 4000
  });

  const top3Logins = new Set((gate.rows || []).slice(0, 3).map(row => cleanString(row.userLogin || row.login).toLowerCase()).filter(Boolean));
  const restInput = (syncRows.ranking || []).slice(3);
  const rest = await Promise.all(restInput.map(enrichWinnerFinaleRowAsync));
  const ranking = (gate.rows || []).slice(0, 3).concat(rest).map((row, index) => ({ ...row, rank: index + 1 }));

  return {
    ranking,
    podiumRows: ranking.slice(0, 3),
    honorRows: ranking.slice(3, 10),
    avatarPreload: gate
  };
}


async function buildWinnerFinaleRowsFromPreviewAsync(preview = {}) {
  const rows = buildWinnerFinaleRowsFromPreview(preview);
  const ranking = await Promise.all((rows.ranking || []).map(enrichWinnerFinaleRowAsync));
  return {
    ranking,
    podiumRows: ranking.slice(0, 3),
    honorRows: ranking.slice(3, 10)
  };
}

async function withWinnerFinaleRowsAsync(finale = {}, preview = {}) {
  const rows = await buildWinnerFinaleRowsFromPreviewAsync(preview);
  return {
    ...finale,
    ranking: Array.isArray(finale.ranking) && finale.ranking.length ? await Promise.all(finale.ranking.map(enrichWinnerFinaleRowAsync)) : rows.ranking,
    podiumRows: Array.isArray(finale.podiumRows) && finale.podiumRows.length ? await Promise.all(finale.podiumRows.map(enrichWinnerFinaleRowAsync)) : rows.podiumRows,
    honorRows: Array.isArray(finale.honorRows) && finale.honorRows.length ? await Promise.all(finale.honorRows.map(enrichWinnerFinaleRowAsync)) : rows.honorRows,
    top3: Array.isArray(finale.top3) && finale.top3.length ? await Promise.all(finale.top3.map(enrichWinnerFinaleRowAsync)) : rows.podiumRows
  };
}

function buildWinnerFinalePreview(eventUid, options = {}) {
  ensureSchema();
  const uid = cleanString(eventUid);
  if (!uid) return { ok: false, error: "event_uid_required" };
  const event = getEventByUid(uid);
  if (!event) return { ok: false, error: "event_not_found", eventUid: uid };
  const ranking = getRanking(uid);
  const rows = Array.isArray(ranking.rows) ? ranking.rows : [];
  const topScore = rows.length ? Number(rows[0].points || 0) : 0;
  const topCandidates = rows.filter(row => Number(row.points || 0) === topScore && topScore > 0);
  const existing = event.metadata && event.metadata.winnerFinale && typeof event.metadata.winnerFinale === "object" ? event.metadata.winnerFinale : null;
  return {
    ok: true,
    event: publicEventSummary(event),
    eventUid: uid,
    status: event.status,
    allowed: event.status === STATUS.FINISHED,
    blockedReason: event.status !== STATUS.FINISHED ? "event_not_finished" : (rows.length ? "" : "ranking_empty"),
    ranking,
    top3: rows.slice(0, 3),
    topScore,
    topCandidates,
    candidateCount: topCandidates.length,
    hasTie: topCandidates.length > 1,
    existingFinale: existing,
    canStartFinale: event.status === STATUS.FINISHED && rows.length > 0,
    rule: "winner_finale_allowed_only_when_event_status_finished"
  };
}

async function startWinnerFinale(eventUid, body = {}) {
  ensureSchema();
  const uid = cleanString(eventUid);
  const event = getEventByUid(uid);
  if (!event) return { ok: false, error: "event_not_found", eventUid: uid };
  if (event.status !== STATUS.FINISHED) {
    return { ok: false, error: "event_not_finished", eventUid: uid, status: event.status, rule: "winner_finale_allowed_only_when_event_status_finished", preview: buildWinnerFinalePreview(uid) };
  }
  const preview = buildWinnerFinalePreview(uid);
  if (!preview.canStartFinale) return { ok: false, error: preview.blockedReason || "winner_finale_not_ready", eventUid: uid, preview };
  const metadata = safeJson({ ...(event.metadata || {}) }, {});
  const forceNew = boolValue(body.forceNewDraw || body.forceNew || false);
  if (metadata.winnerFinale && !forceNew) {
    const existingBase = await withWinnerFinaleRowsAsync(metadata.winnerFinale, preview);
    const existingGate = await preloadTop3WinnerAvatars(existingBase.ranking || existingBase.podiumRows || [], { timeoutMs: Number(body.top3AvatarTimeoutMs || 4000) || 4000 });
    const existingRanking = Array.isArray(existingBase.ranking) && existingBase.ranking.length ? existingBase.ranking.slice() : (existingBase.podiumRows || []).concat(existingBase.honorRows || []);
    const gatedRanking = existingRanking.map((row, index) => index < 3 ? existingGate.rows[index] || row : row);
    const existing = {
      ...existingBase,
      ranking: gatedRanking,
      podiumRows: gatedRanking.slice(0, 3),
      honorRows: gatedRanking.slice(3, 10),
      avatarPreload: existingGate,
      overlayReadyGate: existingGate
    };
    emitBus("stream_events.winner_finale", "replay_requested", { eventUid: uid, eventName: event.name, finale: existing, preview, avatarPreload: existingGate });
    return { ok: true, alreadyDrawn: true, replay: true, event: publicEventSummary(event), finale: existing, preview, avatarPreload: existingGate, rule: "existing_winner_finale_reused_unless_forceNewDraw" };
  }

  const finaleRows = await buildWinnerFinaleRowsFromPreviewWithTop3Gate(preview, { top3AvatarTimeoutMs: Number(body.top3AvatarTimeoutMs || 4000) || 4000 });
  const candidates = await Promise.all((preview.topCandidates || []).map(enrichWinnerFinaleRowAsync));
  const selectedIndex = candidates.length > 1 ? crypto.randomInt(0, candidates.length) : 0;
  const winner = candidates[selectedIndex] || finaleRows.podiumRows[0] || null;
  if (!winner) return { ok: false, error: "winner_missing", eventUid: uid, preview };
  const now = nowIso();
  const finale = {
    finaleUid: newUid("evs_finale"),
    eventUid: uid,
    eventName: event.name,
    startedAt: now,
    startedBy: cleanString(body.actor || body.createdBy || "dashboard", "dashboard"),
    mode: candidates.length > 1 ? "draw_among_tied_first_place" : "single_winner_presentation",
    style: "cgn_altersheim_rentner",
    winner,
    topScore: preview.topScore,
    candidates,
    candidateCount: candidates.length,
    ranking: finaleRows.ranking,
    podiumRows: finaleRows.podiumRows,
    honorRows: finaleRows.honorRows,
    top3: finaleRows.podiumRows,
    avatarPreload: finaleRows.avatarPreload,
    overlayReadyGate: finaleRows.avatarPreload,
    rankingCount: preview.ranking.count || 0,
    message: candidates.length > 1
      ? "Punktgleichstand auf Platz 1: Die Heimleitung lost den Gewinner aus."
      : "Eindeutiger Event-Gewinner: Die Heimleitung startet das Finale."
  };
  metadata.winnerFinale = finale;
  metadata.winnerFinaleLastStartedAt = now;
  database.updateByKey("stream_events_events", "event_uid", uid, {
    metadata_json: jsonEncode(metadata),
    updated_at: now
  });
  runtimeState.counters.eventFinalesStarted += 1;
  markAction("winner_finale.started", uid);
  const updated = getEventByUid(uid);
  emitBus("stream_events.winner_finale", "started", { event: publicEventSummary(updated), finale, preview, avatarPreload: finaleRows.avatarPreload });
  publishStatus("winner_finale.started", { lastEventUid: uid, top3AvatarPreload: finaleRows.avatarPreload });
  return { ok: true, event: updated, finale, preview, avatarPreload: finaleRows.avatarPreload, overlayReady: true, overlayStepPending: "EVS42_winner_overlay_animation" };
}

function isEventCommandModerator(chat = {}) {
  const raw = chat.raw && typeof chat.raw === "object" ? chat.raw : {};
  const badges = raw.badges || raw.badgeInfo || raw.badge_info || raw.userBadges || {};
  const badgeText = Array.isArray(badges) ? badges.join(" ").toLowerCase() : JSON.stringify(badges || {}).toLowerCase();
  return raw.isBroadcaster === true || raw.broadcaster === true || raw.isModerator === true || raw.mod === true || raw.isMod === true || badgeText.includes("broadcaster") || badgeText.includes("moderator");
}

function buildEventCommandMessage(key, context = {}) {
  const eventName = cleanString(context.eventName || (context.event && context.event.name) || "Event", "Event");
  const messages = {
    no_event: "🧓 Die Heimleitung findet gerade kein Event auf dem Klemmbrett.",
    status: `🧓 Aktuelles Event: ${eventName} · Status: ${cleanString(context.status || "unbekannt")}${context.nextLabel ? ` · ${context.nextLabel}` : ""}`,
    points: `${cleanString(context.userDisplayName || context.userLogin || "Du")} hat aktuell ${Number(context.points || 0)} Eventpunkt(e).`,
    top_empty: "🧓 Noch keine Eventpunkte im Heimleitungsordner.",
    top: `🏆 Event-Top: ${(context.rows || []).slice(0,3).map(row => `${row.rank}. ${row.userDisplayName || row.userLogin} ${row.points}`).join(" · ")}`,
    no_permission: "🧓 Das darf nur die Heimleitung oder ein Mod auslösen.",
    finished: `🏁 ${eventName} wurde manuell beendet. Die Auslosung ist jetzt freigegeben.`,
    finish_blocked: `🧓 ${eventName} konnte nicht beendet werden: ${cleanString(context.reason || "unbekannter Grund")}`,
    finale_started: `🎉 Die Heimleitung öffnet den goldenen Umschlag! Gewinner-Finale für ${eventName} startet.`,
    finale_blocked: "🧓 Die Auslosung darf erst starten, wenn das Event beendet ist.",
    help: "🧓 Event-Befehle: !event, !event top, !event punkte, !event status, !event fertig, !event auswertung"
  };
  return messages[key] || "🧓 Die Heimleitung hat den Event-Befehl notiert.";
}

async function processEventCommand(chat = {}) {
  const message = cleanString(chat.message);
  const parts = message.split(/\s+/).filter(Boolean);
  const root = (parts[0] || "").toLowerCase();
  if (root !== "!event") return null;
  const sub = cleanString(parts[1] || "status").toLowerCase();
  const active = getActiveEvent();
  const latestFinished = !active ? rowToEvent(database.get("SELECT * FROM stream_events_events WHERE status = 'finished' ORDER BY finished_at DESC, updated_at DESC, id DESC LIMIT 1")) : null;
  const event = active || latestFinished;
  const modAllowed = isEventCommandModerator(chat);
  let result = { ok: true, command: "event", subcommand: sub, handled: true, event: publicEventSummary(event), chatOutput: null };

  if (["hilfe", "help"].includes(sub)) {
    result.chatOutput = buildEventCommandMessage("help");
  } else if (!event) {
    result.chatOutput = buildEventCommandMessage("no_event");
    result.skipped = true;
    result.reason = "no_event";
  } else if (["top", "ranking"].includes(sub)) {
    const ranking = getRanking(event.eventUid);
    result.ranking = ranking;
    result.chatOutput = ranking.rows.length ? buildEventCommandMessage("top", { rows: ranking.rows }) : buildEventCommandMessage("top_empty");
  } else if (["punkte", "points", "me"].includes(sub)) {
    const ranking = getRanking(event.eventUid);
    const row = (ranking.rows || []).find(item => cleanString(item.userLogin).toLowerCase() === chat.userLogin);
    result.points = row ? row.points : 0;
    result.chatOutput = buildEventCommandMessage("points", { userLogin: chat.userLogin, userDisplayName: chat.userDisplayName, points: result.points });
  } else if (["fertig", "finished", "finish"].includes(sub)) {
    if (!modAllowed) {
      result.ok = false;
      result.error = "permission_denied";
      result.chatOutput = buildEventCommandMessage("no_permission");
    } else if (!active) {
      result.ok = false;
      result.error = "no_active_event";
      result.chatOutput = buildEventCommandMessage("no_event");
    } else {
      const finish = finalizeEvent(active.eventUid, STATUS.FINISHED, "finished", { mode: "manual", reason: "chat_command_event_finished", actor: chat.userLogin || "chat" });
      result.finish = finish;
      result.event = publicEventSummary(finish.event || active);
      result.chatOutput = finish.ok ? buildEventCommandMessage("finished", { eventName: active.name }) : buildEventCommandMessage("finish_blocked", { eventName: active.name, reason: finish.error });
    }
  } else if (["auswertung", "auswerten", "auslosung", "finale", "gewinner", "winner"].includes(sub)) {
    if (!modAllowed) {
      result.ok = false;
      result.error = "permission_denied";
      result.chatOutput = buildEventCommandMessage("no_permission");
    } else {
      const target = latestFinished || (event && event.status === STATUS.FINISHED ? event : null);
      if (!target) {
        result.ok = false;
        result.error = "event_not_finished";
        result.chatOutput = buildEventCommandMessage("finale_blocked");
      } else {
        const finale = await startWinnerFinale(target.eventUid, { actor: chat.userLogin || "chat_command" });
        result.finale = finale;
        result.event = publicEventSummary(finale.event || target);
        result.chatOutput = finale.ok ? buildEventCommandMessage("finale_started", { eventName: target.name }) : buildEventCommandMessage("finale_blocked");
      }
    }
  } else {
    const ranking = getRanking(event.eventUid);
    const nextSound = event.soundEnabled ? buildNextSoundRuntimeStatus(event) : null;
    result.ranking = ranking;
    result.nextSound = nextSound;
    result.chatOutput = buildEventCommandMessage("status", { eventName: event.name, status: event.status, nextLabel: nextSound && nextSound.label ? nextSound.label : "" });
  }

  runtimeState.counters.eventCommandsHandled += 1;
  runtimeState.lastEventCommand = { at: nowIso(), userLogin: chat.userLogin, subcommand: sub, ok: result.ok !== false, eventUid: result.event && result.event.eventUid ? result.event.eventUid : "", chatOutput: result.chatOutput || "" };
  emitBus("stream_events.command", "handled", result);
  publishStatus("command.handled", { lastEventUid: result.event && result.event.eventUid ? result.event.eventUid : "" });
  return result;
}


function tableExistsSafe(tableName = "") {
  const name = cleanString(tableName);
  if (!name) return false;
  try {
    const row = database.get("SELECT name FROM sqlite_master WHERE type='table' AND name = :name LIMIT 1", { name });
    return !!row;
  } catch (_) {
    return false;
  }
}

function collectWinnerDemoUsersFromTable(tableName = "", loginColumn = "", displayColumn = "", avatarColumn = "", limit = 80) {
  const table = cleanString(tableName);
  const loginCol = cleanString(loginColumn);
  const displayCol = cleanString(displayColumn);
  const avatarCol = cleanString(avatarColumn);
  if (!table || !loginCol || !tableExistsSafe(table)) return [];
  try {
    const cols = typeof database.tableColumns === "function" ? new Set(database.tableColumns(table)) : null;
    if (cols && cols.size && !cols.has(loginCol)) return [];
    const selectDisplay = displayCol && (!cols || cols.has(displayCol)) ? `${displayCol} AS userDisplayName` : `${loginCol} AS userDisplayName`;
    const selectAvatar = avatarCol && (!cols || cols.has(avatarCol)) ? `${avatarCol} AS avatarUrl` : `'' AS avatarUrl`;
    const rows = database.all(`
      SELECT
        ${loginCol} AS userLogin,
        ${selectDisplay},
        ${selectAvatar}
      FROM ${table}
      WHERE ${loginCol} IS NOT NULL AND TRIM(${loginCol}) <> ''
      GROUP BY ${loginCol}
      ORDER BY RANDOM()
      LIMIT ${Math.max(1, Math.min(Number(limit) || 80, 200))}
    `);
    return (rows || []).map(row => ({
      userLogin: cleanString(row.userLogin || "").replace(/^@/, "").toLowerCase(),
      userDisplayName: cleanString(row.userDisplayName || row.userLogin || ""),
      avatarUrl: cleanString(row.avatarUrl || ""),
      source: `db:${table}`
    })).filter(row => row.userLogin);
  } catch (err) {
    runtimeState.lastError = `[winner_demo_users:${table}] ${err && err.message ? err.message : String(err)}`;
    return [];
  }
}

function shuffleWinnerDemoUsers(rows = []) {
  const list = Array.isArray(rows) ? rows.slice() : [];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

function collectWinnerRandomDemoUserCandidates(limit = 80) {
  const sources = [
    ["twitch_presence_activity", "user_login", "user_display_name", ""],
    ["stream_events_score_entries", "user_login", "user_display_name", ""],
    ["birthday_show_profiles", "user_login", "display_name_override", "avatar_url"],
    ["birthday_users", "user_login", "user_display_name", "avatar_url"],
    ["loyalty_users", "user_login", "user_display_name", "avatar_url"],
    ["loyalty_points", "user_login", "user_display_name", "avatar_url"],
    ["chat_users", "user_login", "user_display_name", "avatar_url"]
  ];

  const seen = new Set();
  const out = [];
  for (const [table, loginCol, displayCol, avatarCol] of sources) {
    const rows = collectWinnerDemoUsersFromTable(table, loginCol, displayCol, avatarCol, limit);
    for (const row of rows) {
      if (!row.userLogin || seen.has(row.userLogin)) continue;
      seen.add(row.userLogin);
      out.push(row);
    }
  }

  const fallback = [
    "Urlug",
    "RoxxyFoxxyCGN",
    "UdoWB",
    "EngelCGN",
    "AdoredPenny",
    "AmpersandHD",
    "Araglor",
    "Tiegerpranke01",
    "ForrestCGN",
    "Heimleitung"
  ].map(name => ({
    userLogin: name.toLowerCase(),
    userDisplayName: name,
    avatarUrl: "",
    source: "fallback:cgn_demo_names"
  }));

  for (const row of fallback) {
    if (!row.userLogin || seen.has(row.userLogin)) continue;
    seen.add(row.userLogin);
    out.push(row);
  }

  return shuffleWinnerDemoUsers(out).slice(0, Math.max(1, Math.min(Number(limit) || 80, 200)));
}

async function buildWinnerRandomDemoFinale(options = {}) {
  const count = Math.max(1, Math.min(Number(options.count || options.demoCount || 10) || 10, 10));
  const candidates = collectWinnerRandomDemoUserCandidates(Math.max(40, count * 8));
  const picked = candidates.slice(0, count);
  const resolved = await Promise.all(picked.map(async (row) => {
    const base = enrichWinnerFinaleRow(row);
    if (base.avatarUrl || base.userAvatarUrl) return { ...base, source: row.source || base.source || "" };
    const info = await enrichWinnerFinaleRowAsync(base);
    return { ...info, source: row.source || info.userResolveSource || "" };
  }));

  const rows = resolved.map((user, index) => {
    const rank = index + 1;
    const base = {
      rank,
      ...user,
      points: Math.max(5, 130 - rank * 11)
    };
    if (rank <= 3) return { ...base, rewardLabel: "Amazon-Gutschein" };
    return { ...base, crumbBonus: Math.max(1000, (11 - rank) * 1000) };
  });

  return {
    ok: true,
    demo: true,
    source: "backend_random_demo_users",
    requestedCount: count,
    count: rows.length,
    fallbackUsed: picked.some(row => String(row.source || "").startsWith("fallback:")),
    finale: {
      finaleUid: newUid("evs_demo_finale"),
      eventUid: "demo_random",
      eventName: "CGN Event-Gewinner",
      subtitle: `Backend-Test mit ${rows.length} zufälligen Usern.`,
      startedAt: nowIso(),
      startedBy: cleanString(options.actor || "overlay_demo", "overlay_demo"),
      mode: "backend_random_demo",
      style: "cgn_altersheim_rentner",
      ranking: rows,
      podiumRows: rows.filter(row => row.rank <= 3),
      honorRows: rows.filter(row => row.rank >= 4 && row.rank <= 10),
      top3: rows.filter(row => row.rank <= 3),
      rankingCount: rows.length,
      message: "Backend-Testdaten: zufällige User aus vorhandenen Tabellen/Logs plus Avatar-Auflösung."
    },
    sourcesTried: [
      "twitch_presence_activity",
      "stream_events_score_entries",
      "birthday_show_profiles",
      "birthday_users",
      "loyalty_users",
      "loyalty_points",
      "chat_users",
      "fallback:cgn_demo_names"
    ],
    updatedAt: nowIso()
  };
}



function findLatestEventTestEvent() {
  ensureSchema();
  const row = database.get(`
    SELECT *
    FROM stream_events_events
    WHERE name LIKE 'EVS DASHBOARD TEST%' OR name LIKE 'EVS FULL FLOW TEST%' OR name LIKE 'EVS TEST SCRIPT%'
    ORDER BY id DESC
    LIMIT 1
  `);
  return rowToEvent(row);
}

function getEventTestTarget(eventUid = "") {
  const uid = cleanString(eventUid || "");
  if (uid) {
    const event = getEventByUid(uid);
    if (!event) return { ok: false, error: "event_not_found", eventUid: uid };
    return { ok: true, event };
  }
  const event = findLatestEventTestEvent();
  if (!event) return { ok: false, error: "test_event_missing" };
  return { ok: true, event };
}

function buildEventTestChat(userLogin = "testuser", displayName = "", message = "") {
  const login = cleanString(userLogin || "testuser").replace(/^@/, "").toLowerCase();
  return {
    message: cleanString(message || ""),
    userLogin: login,
    userDisplayName: cleanString(displayName || userLogin || login, login),
    userAvatarUrl: "",
    messageId: newUid("evs_dash_test_msg"),
    raw: { isModerator: true, isBroadcaster: false, badges: { moderator: "1" } }
  };
}

function addEventTestPoints(eventUid, userLogin, displayName, points, reason = "dashboard_event_test") {
  return addPoints(eventUid, {
    userLogin: cleanString(userLogin).replace(/^@/, "").toLowerCase(),
    userDisplayName: cleanString(displayName || userLogin),
    points: Number(points || 0),
    sourceType: "dashboard_test",
    sourceUid: `dashboard_test_${cleanString(userLogin).replace(/^@/, "").toLowerCase()}_${Date.now()}`,
    reason,
    createdBy: "dashboard_event_test",
    metadata: { testEvent: true, dashboardTest: true }
  });
}

function seedEventTestRanking(eventUid, count = 10) {
  const max = Math.max(1, Math.min(Number(count || 10) || 10, 10));
  const users = [
    { login: "urlug", display: "Urlug", points: 120 },
    { login: "roxxyfoxyycgn", display: "RoxxyFoxxyCGN", points: 108 },
    { login: "udowb", display: "UdoWB", points: 96 },
    { login: "engelcgn", display: "EngelCGN", points: 84 },
    { login: "adoredpenny", display: "AdoredPenny", points: 72 },
    { login: "ampersandhd", display: "AmpersandHD", points: 60 },
    { login: "araglor", display: "Araglor", points: 48 },
    { login: "tiegerpranke01", display: "Tiegerpranke01", points: 36 },
    { login: "forrestcgn", display: "ForrestCGN", points: 24 },
    { login: "heimleitung", display: "Heimleitung", points: 12 }
  ].slice(0, max);
  const results = users.map(user => addEventTestPoints(eventUid, user.login, user.display, user.points, "dashboard_event_test_seed_ranking"));
  return { ok: true, eventUid, count: users.length, results, ranking: getRanking(eventUid) };
}


function isDashboardEventTest(event) {
  if (!event) return false;
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  if (metadata.dashboardTest === true || metadata.testEvent === true) return true;
  if (event.validation && event.validation.dashboardTest === true) return true;
  const name = cleanString(event.name || "").toUpperCase();
  return name.startsWith("EVS PUNKTE CHECK") || name.startsWith("EVS DASHBOARD TEST") || name.startsWith("EVS TEXT TEST") || name.startsWith("EVS SOUND TEST");
}

function finishActiveDashboardTestEvents(options = {}) {
  ensureSchema();
  const exceptEventUid = cleanString(options.exceptEventUid || "");
  const reason = cleanString(options.reason || "dashboard_test_cleanup", "dashboard_test_cleanup");
  const activeEvents = listEvents({ status: STATUS.ACTIVE, limit: 100 }).rows || [];
  const finished = [];
  const skipped = [];
  for (const event of activeEvents) {
    if (!event || !event.eventUid) continue;
    if (exceptEventUid && event.eventUid === exceptEventUid) {
      skipped.push({ eventUid: event.eventUid, name: event.name || "", reason: "except_current" });
      continue;
    }
    if (!isDashboardEventTest(event)) {
      skipped.push({ eventUid: event.eventUid, name: event.name || "", reason: "not_dashboard_test" });
      continue;
    }
    const result = finalizeEvent(event.eventUid, STATUS.FINISHED, reason, {
      mode: "test_cleanup",
      reason,
      actor: "dashboard_event_test"
    });
    finished.push({ eventUid: event.eventUid, name: event.name || "", ok: !!(result && result.ok), status: result && result.event ? result.event.status : "" });
  }
  return { ok: true, finishedCount: finished.length, skippedCount: skipped.length, finished, skipped };
}

async function runEventTestWrongAnswers(eventUid = "") {
  const target = getEventTestTarget(eventUid);
  if (!target.ok) return target;
  const uid = target.event.eventUid;
  const messages = [
    buildEventTestChat("falschuser01", "FalschUser01", "banane rollator falsch"),
    buildEventTestChat("falschuser02", "FalschUser02", "ich weiss es nicht"),
    buildEventTestChat("falschuser03", "FalschUser03", "kaffee aber komplett falsch")
  ];
  const results = [];
  for (const chat of messages) {
    results.push(await processParallelChatMessage(chat, { source: "dashboard_event_test_wrong_answer" }));
  }
  return { ok: true, eventUid: uid, action: "wrong_answers", count: results.length, results };
}

async function runEventTestCorrectAnswers(eventUid = "") {
  const target = getEventTestTarget(eventUid);
  if (!target.ok) return target;
  const uid = target.event.eventUid;
  const messages = [
    buildEventTestChat("urlug", "Urlug", "die heimleitung sucht den schluessel"),
    buildEventTestChat("roxxyfoxyycgn", "RoxxyFoxxyCGN", "ich geh kurz kaffee holen"),
    buildEventTestChat("udowb", "UdoWB", "heimleitung")
  ];
  const results = [];
  for (const chat of messages) {
    results.push(await processParallelChatMessage(chat, { source: "dashboard_event_test_correct_answer" }));
  }
  return { ok: true, eventUid: uid, action: "correct_answers", count: results.length, results, ranking: getRanking(uid) };
}
async function runEventTestSoundCorrect(eventUid = "", body = {}) {
  const target = getEventTestTarget(eventUid);
  if (!target.ok) return target;
  const event = target.event;
  if (!event.soundEnabled) return { ok: false, error: "sound_not_enabled", eventUid: event.eventUid };
  if (event.status !== STATUS.ACTIVE) startDashboardEventTestEvent(event.eventUid);

  let round = getActiveSoundRound(event.eventUid);
  let roundResult = null;
  if (!round) {
    roundResult = createSoundRound({
      eventUid: event.eventUid,
      play: false,
      confirm: "1",
      allowReuse: body.allowReuse !== undefined ? boolValue(body.allowReuse, true) : true,
      forceReset: false,
      dashboardTest: true,
      allowOfflineTest: true
    });
    if (!roundResult || roundResult.ok !== true) return { ok: false, eventUid: event.eventUid, action: "sound_correct", error: "sound_round_create_failed", roundResult };
    round = getActiveSoundRound(event.eventUid);
  }

  const userLogin = cleanString(body.userLogin || "forrestcgn").replace(/^@/, "").toLowerCase();
  const userDisplayName = cleanString(body.userDisplayName || "ForrestCGN");
  const answer = cleanString(body.answer || "heimleitung");
  const resolved = resolveSoundRound({
    eventUid: event.eventUid,
    userLogin,
    userDisplayName,
    answer,
    messageId: newUid("evs_dash_test_sound"),
    source: "dashboard_event_test_sound_correct"
  });
  return {
    ok: !!(resolved && resolved.ok),
    eventUid: event.eventUid,
    action: "sound_correct",
    roundPrepared: roundResult,
    resolved,
    ranking: getRanking(event.eventUid),
    userStats: getStatisticsUser(userLogin, event.eventUid),
    parts: getEventRuntimePartsStatus(getEventByUid(event.eventUid))
  };
}

async function runEventTestPointsCheck(body = {}) {
  const preCleanup = finishActiveDashboardTestEvents({ reason: "dashboard_points_check_pre_cleanup" });
  const created = createDashboardEventTestEvent({
    name: `EVS PUNKTE CHECK · ${new Date().toLocaleString("de-DE")}`
  });
  const started = startDashboardEventTestEvent(created.eventUid);
  const wrong = await runEventTestWrongAnswers(created.eventUid);
  const sound = await runEventTestSoundCorrect(created.eventUid, {
    userLogin: "forrestcgn",
    userDisplayName: "ForrestCGN",
    answer: "heimleitung",
    allowReuse: true
  });
  const textMessages = [
    buildEventTestChat("forrestcgn", "ForrestCGN", "die heimleitung sucht den schluessel"),
    buildEventTestChat("forrestcgn", "ForrestCGN", "ich geh kurz kaffee holen")
  ];
  const text = [];
  for (const chat of textMessages) {
    text.push(await processParallelChatMessage(chat, { source: "dashboard_event_test_points_check", eventUid: created.eventUid }));
  }
  const ranking = getRanking(created.eventUid);
  const userStats = getStatisticsUser("forrestcgn", created.eventUid);
  const reportText = getTextRuntimeReport(created.eventUid);
  const reportSound = getSoundRuntimeReport(created.eventUid);
  const parts = getEventRuntimePartsStatus(getEventByUid(created.eventUid));
  const actualUser = userStats.user || null;
  const actualSoundPoints = actualUser ? Number(actualUser.soundPoints || 0) : 0;
  const actualPhrasePoints = actualUser ? Number(actualUser.phrasePoints || 0) : 0;
  const actualTotalPoints = actualUser ? Number(actualUser.totalPoints || 0) : 0;
  const expectedSoundPoints = 20;
  const expectedPhrasePoints = 30;
  const passed = !!(sound && sound.ok === true)
    && actualSoundPoints >= expectedSoundPoints
    && actualPhrasePoints >= expectedPhrasePoints
    && actualTotalPoints >= (expectedSoundPoints + expectedPhrasePoints);
  return {
    ok: passed,
    action: "points-check",
    eventUid: created.eventUid,
    event: created.event,
    created,
    started,
    preCleanup,
    activeEvent: publicEventSummary(getActiveEvent()),
    wrong,
    sound,
    text,
    ranking,
    userStats,
    reports: { text: reportText, sound: reportSound },
    parts,
    checks: {
      passed,
      expectedAtLeast: { soundPoints: expectedSoundPoints, phrasePoints: expectedPhrasePoints, totalPoints: expectedSoundPoints + expectedPhrasePoints },
      actual: actualUser,
      soundOk: !!(sound && sound.ok === true),
      soundError: sound && sound.error ? sound.error : "",
      note: "Wortpunkte koennen je nach Text-Konfig zusaetzlich zu den Satzpunkten entstehen. Entscheidend: Sound- und Satz-/Text-Punkte landen gemeinsam im Ranking und sind in der User-Historie getrennt sichtbar."
    }
  };
}


function createDashboardEventTestEvent(body = {}) {
  ensureSchema();
  const now = nowIso();
  const name = cleanString(body.name || `EVS DASHBOARD TEST · ${new Date().toLocaleString("de-DE")}`, "EVS DASHBOARD TEST");
  const eventUid = newUid("evs_event");
  const config = {
    sound: {
      enabled: true,
      snippets: [
        {
          snippetUid: newUid("evs_sound_snippet"),
          title: "Dashboard Test Sound",
          acceptedAnswers: ["heimleitung", "die heimleitung", "rentnerheim"],
          points: 20,
          answerSeconds: 20
        }
      ],
      runtime: { answerSeconds: 20, defaultPoints: 20 }
    },
    text: {
      enabled: true,
      phrases: [
        {
          phraseUid: newUid("evs_phrase"),
          text: "die heimleitung sucht den schluessel",
          acceptedAnswers: ["die heimleitung sucht den schluessel", "heimleitung sucht schluessel"],
          points: 15
        },
        {
          phraseUid: newUid("evs_phrase"),
          text: "ich geh kurz kaffee holen",
          acceptedAnswers: ["ich geh kurz kaffee holen", "kaffee holen"],
          points: 15
        }
      ],
      winnerMode: "first_complete_solver"
    },
    dashboardTest: true,
    testEvent: true
  };

  const insert = {
    event_uid: eventUid,
    name,
    status: STATUS.READY,
    sound_enabled: 1,
    text_enabled: 1,
    sound_config_json: jsonEncode(config.sound),
    text_config_json: jsonEncode(config.text),
    scoring_config_json: jsonEncode(defaultScoringConfig()),
    settings_json: jsonEncode(defaultEventSettings()),
    validation_json: jsonEncode({ ok: true, warnings: [], errors: [], dashboardTest: true }),
    created_by: "dashboard_event_test",
    metadata_json: jsonEncode({ testEvent: true, dashboardTest: true, createdBy: "dashboard_event_test", config }),
    created_at: now,
    updated_at: now,
    started_at: "",
    finished_at: "",
    cancelled_at: ""
  };

  database.insert("stream_events_events", insert);
  const event = getEventByUid(eventUid);
  markAction("dashboard_test.event_created", eventUid);
  emitBus("stream_events.test", "event_created", { event: publicEventSummary(event) });
  return { ok: true, eventUid, event: publicEventSummary(event), config };
}

function startDashboardEventTestEvent(eventUid = "") {
  const target = getEventTestTarget(eventUid);
  if (!target.ok) return target;
  const event = target.event;
  if (event.status === STATUS.ACTIVE) return { ok: true, alreadyActive: true, event: publicEventSummary(event) };
  database.updateByKey("stream_events_events", "event_uid", event.eventUid, {
    status: STATUS.ACTIVE,
    started_at: event.startedAt || nowIso(),
    updated_at: nowIso()
  });
  const updated = getEventByUid(event.eventUid);
  markAction("dashboard_test.event_started", event.eventUid);
  emitBus("stream_events.test", "event_started", { event: publicEventSummary(updated) });
  return { ok: true, event: publicEventSummary(updated) };
}

async function runDashboardEventTestStep(step = "", body = {}) {
  const action = cleanString(step || body.step || "").toLowerCase();
  const eventUid = cleanString(body.eventUid || body.event_uid || "");
  if (action === "create") return createDashboardEventTestEvent(body);
  if (action === "start") return startDashboardEventTestEvent(eventUid);
  if (action === "wrong") return runEventTestWrongAnswers(eventUid);
  if (action === "correct") return runEventTestCorrectAnswers(eventUid);
  if (action === "sound-correct") return runEventTestSoundCorrect(eventUid, body);
  if (action === "points-check") return runEventTestPointsCheck(body);
  if (action === "seed-ranking") {
    const target = getEventTestTarget(eventUid);
    if (!target.ok) return target;
    return seedEventTestRanking(target.event.eventUid, body.count || 10);
  }
  if (action === "finish") {
    const target = getEventTestTarget(eventUid);
    if (!target.ok) return target;
    const result = finalizeEvent(target.event.eventUid, STATUS.FINISHED, "finished", { mode: "dashboard_test", reason: "dashboard_event_test_finish", actor: "dashboard_event_test" });
    return { ...result, eventUid: target.event.eventUid, action: "finish" };
  }
  if (action === "finale") {
    const target = getEventTestTarget(eventUid);
    if (!target.ok) return target;
    const result = await startWinnerFinale(target.event.eventUid, { actor: "dashboard_event_test", top3AvatarTimeoutMs: 4000 });
    return { ...result, eventUid: target.event.eventUid, action: "finale" };
  }
  if (action === "full-flow") {
    const created = createDashboardEventTestEvent({ name: `EVS DASHBOARD TEST FULL FLOW · ${new Date().toLocaleString("de-DE")}` });
    const started = startDashboardEventTestEvent(created.eventUid);
    const wrong = await runEventTestWrongAnswers(created.eventUid);
    const correct = await runEventTestCorrectAnswers(created.eventUid);
    const sound = await runEventTestSoundCorrect(created.eventUid, { userLogin: "forrestcgn", userDisplayName: "ForrestCGN", answer: "heimleitung", allowReuse: true });
    const seeded = seedEventTestRanking(created.eventUid, body.count || 10);
    const finished = finalizeEvent(created.eventUid, STATUS.FINISHED, "finished", { mode: "dashboard_test_full_flow", reason: "dashboard_event_test_full_flow", actor: "dashboard_event_test" });
    const finale = await startWinnerFinale(created.eventUid, { actor: "dashboard_event_test_full_flow", top3AvatarTimeoutMs: 4000 });
    return { ok: true, action: "full-flow", eventUid: created.eventUid, created, started, wrong, correct, sound, seeded, finished, finale, ranking: getRanking(created.eventUid), userStats: getStatisticsUser("forrestcgn", created.eventUid) };
  }
  return { ok: false, error: "unknown_test_step", step: action };
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
    cancelledAt: event.cancelledAt,
    winnerFinale: event.metadata && event.metadata.winnerFinale ? event.metadata.winnerFinale : null
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
      built: true,
      phased: true,
      currentFocus: "countdown_before_sound",
      resultAnimationPrepared: true,
      stateRoute: "/api/stream-events/runtime-overlay/state",
      plannedFile: "htdocs/overlays/stream_events/event_runtime_overlay.html",
      viewerSafe: true,
      busBridge: {
        subscribed: !!(runtimeState.runtimeOverlayBus && runtimeState.runtimeOverlayBus.subscribed),
        lastAction: runtimeState.runtimeOverlayBus ? runtimeState.runtimeOverlayBus.lastAction : "",
        lastAt: runtimeState.runtimeOverlayBus ? runtimeState.runtimeOverlayBus.lastAt : "",
        active: !!getActiveRuntimeOverlayBusState()
      }
    },
    eventSoundBusIntegration: {
      planned: true,
      step: "EVENT-SOUND-4D",
      planRoute: "/api/stream-events/sound-runtime/bus-integration-plan",
      soundSystemGatekeeper: true,
      communicationBusRequired: true,
      runtimeOverlayCapability: "stream_events.runtime_display",
      soundOverlayCapability: "sound.event_output",
      playbackChanged: true,
      playbackChangeScope: "explicit_stream_events_preroll_items_only",
      soundSystemPreRollGatePrepared: true,
      controlledTestRoute: "/api/sound/event-preroll/test",
      countdownSecondsConfigurable: true,
      testFlowPrepared: true,
      roundPlaybackBindingPrepared: true,
      controlledRoundPlaybackRoute: "/api/stream-events/sound-runtime/next-round?play=1&confirm=1",
      countdownTimingFixed: true,
      countdownDedupeEnabled: true,
      testStateCleanupPrepared: true,
      testResetRoute: "/api/stream-events/sound-runtime/reset-test-state"
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
      { method: "GET", path: `${prefix}/sound-runtime/bus-integration-plan`, description: "EVENT-SOUND-2: Kommunikationsstatus fuer Countdown-before-Playback ueber Communication/EventBus und Sound-System-Gate" },
      { method: "GET", path: `${prefix}/runtime-overlay/state`, description: "EVENT-RUNTIME-2C: Viewer-sicherer Read-only State fuer Countdown-/Result-phasen des Event-Runtime-Overlays" },
      { method: "GET", path: `${prefix}/runtime-parts/status`, description: "EVENT-RUNTIME-PARTS-1: Status der getrennten Teilspiele Sound/Text und Gesamtabschluss-Regel" },
      { method: "GET", path: `${prefix}/statistics/users`, description: "Statistik-Userliste fuer Dropdown/Filter, optional eventUid" },
      { method: "GET", path: `${prefix}/statistics/user/:login`, description: "User-Detailstatistik fuer Text/Sound/Punkte, optional eventUid" },
      { method: "POST", path: `${prefix}/text-runtime/test-chat`, description: "Testet eine Chatnachricht gegen das aktive Text-Event" },
      { method: "POST", path: `${prefix}/text-runtime/create-test-event`, description: "Legt mit confirm=1 ein sicheres Text-Runtime-Testevent an" },
      { method: "POST", path: `${prefix}/sound-runtime/create-test-event`, description: "Legt mit confirm=1 ein sicheres Sound-Runtime-Testevent an; mit useRealMedia=1 werden echte Media-Snippets genutzt" },
      { method: "POST", path: `${prefix}/sound-runtime/reset-test-state`, description: "EVENT-SOUND-4D: Raeumt haengende Sound-Testevents und aktive Testrunden mit confirm=1 auf" },
      { method: "POST", path: `${prefix}/sound-runtime/test-chat`, description: "Testet eine Chatantwort gegen die aktive Sound-Runde, ohne direkt in Twitch zu senden" },
      { method: "POST", path: `${prefix}/chat-runtime/test-chat`, description: "EVS-19: Testet eine Chatnachricht parallel gegen Sound und Text, ohne direkt zu senden" },
      { method: "POST", path: `${prefix}/chat-runtime/create-stealth-test-event`, description: "EVS-19: Legt mit confirm=1 ein Kombi-Stealth-Testevent fuer Sound + Text an" },
      { method: "GET", path: `${prefix}/runtime-gate/status`, description: "EVS-24: einfache Aktiv/Inaktiv-Runtime-Gate-Anzeige ueber Stream online + aktives Event" },
      { method: "GET", path: `${prefix}/chat-output/status`, description: "EVS-20: ChatOutput-Dispatcher Sicherheitsstatus, dry-run only" },
      { method: "GET", path: `${prefix}/chat-output/report`, description: "EVS-20: Vorbereitete ChatOutputs aus Sound/Text mit Dispatch-Preview, dry-run only" },
      { method: "POST", path: `${prefix}/chat-output/test-dispatch`, description: "EVS-20: Testet ChatOutput-Dispatch-Regeln ohne Twitch-Ausgabe" },
      { method: "POST", path: `${prefix}/sound-runtime/next-round`, description: "Bereitet die naechste Sound-Runde vor; mit play=1&confirm=1 kontrolliert ueber Sound-System-PreRoll abspielen" },
      { method: "POST", path: `${prefix}/sound-runtime/skip-wait`, description: "Ueberspringt die aktuelle automatische Sound-Wartezeit und startet den naechsten Schnipsel ueber den normalen Sound-System-Flow" },
      { method: "GET", path: `${prefix}/sound-runtime/recovery-status`, description: "EVS37: Zeigt gespeicherten Runtime-/Recovery-Status aktiver Events" },
      { method: "POST", path: `${prefix}/sound-runtime/recover`, description: "EVS37: Fuehrt sichere Recovery aus: aktive Sound-Runde wird unterbrochen und zurueck in Rotation gelegt" },
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
      { method: "POST", path: `${prefix}/events/:eventUid/finish`, description: "Event manuell/fachlich beenden und Auslosung freigeben" },
      { method: "GET", path: `${prefix}/events/:eventUid/finale`, description: "EVS41: Gewinner-/Auslosungsdaten lesen; erlaubt nur bei finished" },
      { method: "POST", path: `${prefix}/events/:eventUid/finale/start`, description: "EVS41: Gewinner-Finale starten; nur bei status=finished" },
      { method: "POST", path: `${prefix}/events/:eventUid/cancel`, description: "Event abbrechen" },
      { method: "POST", path: `${prefix}/events/:eventUid/archive`, description: "EVS-21: Beendetes Event archivieren; nur status=finished" },
      { method: "POST", path: `${prefix}/events/:eventUid/delete`, description: "EVS-21: Event und zugehoerige Eventdaten mit confirm=DELETE loeschen" },
      { method: "POST", path: `${prefix}/events/:eventUid/duplicate`, description: "EVS-27C: Event-Konfiguration als neue Kopie ohne Punkte/Runden duplizieren" },
      { method: "GET", path: `${prefix}/events/:eventUid/ranking`, description: "Event-Ranking lesen" },
      { method: "POST", path: `${prefix}/events/:eventUid/points`, description: "Manuelle/Modul-Punkte buchen (nur aktives Event)" },
      { method: "POST", path: `${prefix}/commands/event/test`, description: "EVS41: Testet !event Befehle im stream_events-Kontext" }
    ],
    notes: [
      "SOUND-SAFE-1 legt nur den Erweiterungspunkt fuer EventSound-Playback + Countdown-PreRoll fest; kein direktes Sound-/Video-Playback und kein Queue-Touch.",
      "EVENT-RUNTIME-2 liefert den viewer-sicheren Overlay-State fuer das gebaute kombinierte Event-Runtime-Overlay.",
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
  const runtimeOverlaySubscription = registerRuntimeOverlayBusSubscription();
  if (runtimeOverlaySubscription && runtimeOverlaySubscription.ok !== true) runtimeState.lastError = runtimeOverlaySubscription.reason || runtimeOverlaySubscription.error || runtimeState.lastError;
  const streamStateSubscription = registerStreamStateSubscription();
  if (streamStateSubscription && streamStateSubscription.ok !== true) runtimeState.lastError = streamStateSubscription.reason || streamStateSubscription.error || runtimeState.lastError;
  const soundPlaybackSubscription = registerSoundPlaybackBusSubscription();
  if (soundPlaybackSubscription && soundPlaybackSubscription.ok !== true) runtimeState.lastError = soundPlaybackSubscription.reason || soundPlaybackSubscription.error || runtimeState.lastError;

  const startupRecovery = recoverActiveStreamEvents("node_start");
  if (startupRecovery && startupRecovery.ok !== true) runtimeState.lastError = startupRecovery.error || runtimeState.lastError;

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

  reg("get", `${prefix}/sound-runtime/recovery-status`, (req, res) => {
    try {
      const events = listEvents({ status: STATUS.ACTIVE, limit: 100 }).rows || [];
      const rows = events.map(event => ({
        event: publicEventSummary(event),
        runtimeState: getEventRuntimeState(event.eventUid),
        activeRound: event.soundEnabled ? getActiveSoundRound(event.eventUid) : null,
        nextSound: buildNextSoundRuntimeStatus(event),
        parts: getEventRuntimePartsStatus(event)
      }));
      sendJson(res, { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, count: rows.length, rows, lastRecovery: runtimeState.lastRecovery || null, updatedAt: nowIso() });
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/sound-runtime/recover`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, { ok: false, error: "confirm_required", hint: "POST /api/stream-events/sound-runtime/recover?confirm=1" }, 400);
      }
      const result = recoverActiveStreamEvents(cleanString((req.body && req.body.reason) || req.query.reason || "manual_recovery"));
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/runtime/pause-stream-offline`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, { ok: false, error: "confirm_required", hint: "POST /api/stream-events/runtime/pause-stream-offline?confirm=1" }, 400);
      }
      const result = pauseActiveStreamEventsForStreamOffline(cleanString((req.body && req.body.reason) || req.query.reason || "manual_stream_offline_auto_wait"), { source: "manual_route" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/runtime/resume`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, { ok: false, error: "confirm_required", hint: "POST /api/stream-events/runtime/resume?confirm=1" }, 400);
      }
      const result = resumeEventRuntimeAfterPause(cleanString((req.body && req.body.eventUid) || req.query.eventUid || ""), cleanString((req.body && req.body.reason) || req.query.reason || "manual_resume"));
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/sound-runtime/safety-plan`, (req, res) => {
    try {
      sendJson(res, buildSoundRuntimeSafetyPlan(req.query.eventUid || req.query.event_uid || ""));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("get", `${prefix}/sound-runtime/bus-integration-plan`, (req, res) => {
    try {
      sendJson(res, buildEventSoundBusIntegrationPlan(req.query.eventUid || req.query.event_uid || ""));
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

  reg("get", `${prefix}/runtime-parts/status`, (req, res) => {
    try {
      const event = (req.query.eventUid || req.query.event_uid) ? getEventByUid(req.query.eventUid || req.query.event_uid) : getActiveEvent();
      sendJson(res, { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, event: publicEventSummary(event), parts: getEventRuntimePartsStatus(event) });
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/sound-runtime/reset-test-state`, (req, res) => {
    try {
      const confirm = String(req.query.confirm || (req.body && req.body.confirm) || "").trim();
      if (confirm !== "1") {
        return sendJson(res, { ok: false, error: "confirm_required", hint: "POST /api/stream-events/sound-runtime/reset-test-state?confirm=1" }, 400);
      }
      const result = cleanupSoundRuntimeTestState({ includeCurrentActive: true, forceAllTestEvents: boolValue((req.body && req.body.forceAllTestEvents) ?? req.query.forceAllTestEvents, false) });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
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
      sendJson(res, createSoundRuntimeTestEvent({ ...(req.query || {}), ...(req.body || {}) }));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/next-round`, (req, res) => {
    try {
      const result = createSoundRound({ ...(req.body || {}), eventUid: (req.body && (req.body.eventUid || req.body.event_uid)) || req.query.eventUid || req.query.event_uid || "", allowReuse: boolValue((req.body && req.body.allowReuse) ?? req.query.allowReuse), forceReset: (req.body && (req.body.forceReset || req.body.forceResetTestState || req.body.resetTestState)) ?? req.query.forceReset ?? req.query.forceResetTestState ?? req.query.resetTestState, play: (req.body && (req.body.play || req.body.playback || req.body.startPlayback || req.body.withPlayback)) ?? req.query.play ?? req.query.playback ?? req.query.startPlayback ?? req.query.withPlayback, confirm: (req.body && (req.body.confirm || req.body.confirmed)) ?? req.query.confirm ?? req.query.confirmed });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/sound-runtime/skip-wait`, (req, res) => {
    try {
      const result = skipSoundRoundWait({
        ...(req.body || {}),
        eventUid: (req.body && (req.body.eventUid || req.body.event_uid)) || req.query.eventUid || req.query.event_uid || "",
        allowReuse: (req.body && req.body.allowReuse) ?? req.query.allowReuse
      });
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
        userAvatarUrl: body.userAvatarUrl || body.avatarUrl || body.avatar_url || body.profileImageUrl || req.query.avatarUrl || req.query.avatar_url || "",
        messageId: body.messageId || req.query.messageId || newUid("test_sound_chat")
      }, { source: "api:sound-test-chat" });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/sound-runtime/resolve-user`, async (req, res) => {
    try {
      const result = await resolveTwitchUserInfoSmall(req.query.login || req.query.user || "");
      sendJson(res, result, result.ok ? 200 : 404);
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

  reg("get", `${prefix}/events/:eventUid/finale`, (req, res) => {
    try {
      const result = buildWinnerFinalePreview(req.params.eventUid);
      sendJson(res, result, result.ok ? 200 : (result.error === "event_not_found" ? 404 : 400));
    } catch (err) {
      handleError(res, err);
    }
  });

  reg("post", `${prefix}/events/:eventUid/finale/start`, async (req, res) => {
    try {
      const confirm = String((req.query && req.query.confirm) || (req.body && req.body.confirm) || "").toLowerCase();
      if (!["1", "true", "yes", "ja", "confirm"].includes(confirm)) {
        return sendJson(res, { ok: false, error: "confirm_required", message: "Gewinner-Finale startet nur mit confirm=1.", eventUid: req.params.eventUid }, 400);
      }
      const result = await startWinnerFinale(req.params.eventUid, req.body || {});
      sendJson(res, result, result.ok ? 200 : (result.error === "event_not_found" ? 404 : 400));
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("get", `${prefix}/winner-finale/demo-random`, async (req, res) => {
    try {
      const result = await buildWinnerRandomDemoFinale({
        count: req.query.count || req.query.demoCount || req.query.demo_count || 10,
        actor: "overlay_demo"
      });
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });

  reg("post", `${prefix}/test/run`, async (req, res) => {
    try {
      const confirm = String((req.query && req.query.confirm) || (req.body && req.body.confirm) || "").toLowerCase();
      if (!["1", "true", "yes", "ja", "confirm"].includes(confirm)) {
        return sendJson(res, { ok: false, error: "confirm_required", message: "Event-Test startet nur mit confirm=1." }, 400);
      }
      const result = await runDashboardEventTestStep(req.query.step || (req.body && req.body.step) || "", req.body || {});
      sendJson(res, result, result.ok ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
    }
  });


  reg("post", `${prefix}/commands/event/test`, async (req, res) => {
    try {
      const body = req.body || {};
      const result = await processEventCommand({
        message: cleanString(body.message || "!event status"),
        userLogin: cleanString(body.userLogin || body.login || "dashboard").toLowerCase(),
        userDisplayName: cleanString(body.userDisplayName || body.displayName || body.userLogin || "Dashboard"),
        messageId: cleanString(body.messageId || "cmd_test"),
        raw: { isModerator: boolValue(body.isModerator, true), isBroadcaster: boolValue(body.isBroadcaster, false), badges: body.badges || { moderator: "1" } }
      });
      sendJson(res, result || { ok: false, error: "not_event_command" }, result && result.ok !== false ? 200 : 400);
    } catch (err) {
      handleError(res, err, 400);
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
  getEventRuntimePartsStatus,
  getTextRuntimeStatus,
  getSoundRuntimeStatus,
  getSoundRuntimeReport,
  getChatOutputDispatchReport,
  testChatOutputDispatch,
  createSoundRound,
  resolveSoundRound,
  markSoundRoundUnresolved
};
