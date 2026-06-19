"use strict";

/**
 * Shot-Alarm
 *
 * STEP SHOT-ALARM-1:
 * - Neues eigenständiges Modul für Support-Shot-Regeln.
 * - Konsumiert Twitch-Support-Events über den vorhandenen Communication Bus.
 * - Keine direkte Twitch-Abfrage, keine Änderung an Alerts/Loyalty/Ko-fi/Tipeee.
 */

const cfg = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const textHelper = require("./helpers/helper_texts");
const settingsHelper = require("./helpers/helper_settings");
const database = require("../core/database");
const auditHelper = require("./helpers/helper_audit_log");
const securityContext = require("./helpers/helper_security_context");
let chatOutputHelper = null;
try { chatOutputHelper = require("./helpers/helper_chat_output"); } catch (_) { chatOutputHelper = null; }

const MODULE_NAME = "shot_alarm";
const MODULE_VERSION = "0.2.8";
const MODULE_BUILD = "STEP_SHOT_ALARM_2J2_RANDOM_SOUNDS_DEVICE_DISCORD_QUEUE";
const CONFIG_FILE = "shot_alarm.json";
const HISTORY_LIMIT = 200;
const TEXT_MODULE = "shot_alarm";
const SETTINGS_TABLE = settingsHelper.DEFAULT_SETTINGS_TABLE || "module_settings";
const SETTINGS_KEY_CONFIG = "shot_alarm.config";
const SETTINGS_KEY_RUNTIME = "shot_alarm.runtime";
const HISTORY_TABLE = "shot_alarm_history";

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "community_events",
  legacy: false,
  routesPrefix: ["/api/shot-alarm"],
  bus: {
    consumes: [
      "twitch.sub.received",
      "twitch.resub.received",
      "twitch.subgift.received",
      "twitch.giftbomb.received",
      "twitch.cheer.received",
      "payment.kofi.received",
      "payment.tipeee.received"
    ],
    publishes: [
      "shot_alarm.status.updated",
      "shot_alarm.event.received",
      "shot_alarm.draw.started",
      "shot_alarm.draw.resolved",
      "shot_alarm.triggered",
      "shot_alarm.overlay.show",
      "shot_alarm.overlay.state",
      "shot_alarm.status_bar.update",
      "shot_alarm.runtime.started",
      "shot_alarm.runtime.stopped",
      "shot_alarm.runtime.stream_changed"
    ]
  },
  description: "Shot-Alarm fuer Twitch-Support-Events mit gebuendelter Auslosung, Counter, Overlay-Statusleiste, DB-basierten Texten/Config sowie Dashboard-Audit/Safety fuer produktive Aktionen."
};

const DEFAULT_CONFIG = {
  enabled: true,
  overlayEnabled: true,
  soundEnabled: true,
  dashboardCategory: "community_events",
  targetMode: "engel_roxxy_together",
  targetLabel: "Engel & Roxxy",
  display: {
    title: "SHOT-ALARM",
    drawDelayMs: 10000,
    drawHoldMs: 10000,
    resultHoldMs: 10000,
    holdMs: 10000,
    showChance: true,
    showRoll: false,
    showStatusBar: true,
    statusBarRefreshMs: 5000
  },
  rules: {
    finalRulesVersion: "2026-06-18-step2a-aggregated-draw",
    singleSubChancePercent: 20,
    resubChancePercent: 20,
    singleGiftSubChancePercent: 20,
    singleSupportFiveChancePercent: 50,
    singleSupportTenChancePercent: 100,
    giftBombFiveChancePercent: 50,
    giftBombTenBlockShots: 1,
    bits: {
      enabled: true,
      perThousandBits: 1000,
      thousandChancePercent: 50,
      perTenThousandBits: 10000,
      tenThousandChancePercent: 100,
      tenThousandShots: 1
    },
    payments: {
      enabled: true,
      providers: {
        kofi: { enabled: true, eurPerShot: 10, chancePercent: 50 },
        tipeee: { enabled: true, eurPerShot: 10, chancePercent: 50 }
      }
    }
  },
  dedupe: {
    subscribeResubBufferEnabled: true,
    subscribeResubBufferMs: 60000
  },
  sound: {
    endpoint: "http://127.0.0.1:8080/api/sound/play-media",
    category: "alert",
    source: "shot_alarm",
    target: "both",
    outputTarget: "device",
    queueIfBusy: true,
    dropIfBusy: false,
    priority: 80,
    volume: 85,
    overlayShot: {
      enabled: true,
      mediaId: "",
      mediaLabel: "",
      label: "Shot-Alarm Overlay-Einblendung",
      random: true,
      sounds: []
    },
    sounds: []
  },
  chat: {
    enabled: true,
    sendDrawStart: true,
    sendResultHit: true,
    sendResultMiss: true,
    prefer: "bot",
    maxLength: 420
  },
  texts: {
    drawStart: [
      "🚨 Heimleitung meldet: {user} hat {amountLabel} in den Rentner-Automaten geworfen. Die Shot-Auslosung läuft...",
      "🎲 Altersheim-Prüfung gestartet: {amountLabel} von {user}. Engel & Roxxy warten auf das Urteil der Heimleitung..."
    ],
    resultHit: [
      "🥃 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} ergibt {shotsAdded} Shot(s) für Engel & Roxxy. Offen: {shotsOpen}.",
      "🍻 Pflegeprotokoll aktualisiert: {user} hat mit {amountLabel} {shotsAdded} Shot(s) ausgelöst. Noch offen: {shotsOpen}."
    ],
    resultMiss: [
      "😇 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} – die Rentner-Leber wurde verschont. Kein Shot.",
      "🧓 Die Heimleitung hat gewürfelt: {amountLabel} von {user}, aber Engel & Roxxy sind diesmal davongekommen."
    ],
    overlayDrawTitle: ["SHOT-ALARM"],
    overlayDrawText: ["Die Heimleitung lost aus..."],
    overlayResultHitTitle: ["SHOT-ALARM"],
    overlayResultMissTitle: ["SHOT-ALARM"],
    overlayResultHitText: ["Engel & Roxxy müssen ran!"],
    overlayResultMissText: ["Die Rentner-Leber wurde verschont."]
  },
  historyLimit: HISTORY_LIMIT
};


const DEFAULT_TEXT_VARIANTS = {
  drawStart: [
    "🚨 Heimleitung meldet: {user} hat {amountLabel} in den Rentner-Automaten geworfen. Die Shot-Auslosung läuft...",
    "🎲 Altersheim-Prüfung gestartet: {amountLabel} von {user}. Engel & Roxxy warten auf das Urteil der Heimleitung...",
    "🧓 Die Heimleitung sortiert die Gebisse und würfelt aus: {amountLabel} von {user}. Ergebnis folgt gleich..."
  ],
  resultHit: [
    "🥃 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} ergibt {shotsAdded} Shot(s) für Engel & Roxxy. Offen: {shotsOpen}.",
    "🍻 Pflegeprotokoll aktualisiert: {user} hat mit {amountLabel} {shotsAdded} Shot(s) ausgelöst. Noch offen: {shotsOpen}.",
    "🚨 Rentner-Alarm: {amountLabel} von {user} hat {shotsAdded} Shot(s) aus dem Automaten gespuckt. Engel & Roxxy, antreten! Offen: {shotsOpen}."
  ],
  resultMiss: [
    "😇 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} – die Rentner-Leber wurde verschont. Kein Shot.",
    "🧓 Die Heimleitung hat gewürfelt: {amountLabel} von {user}, aber Engel & Roxxy sind diesmal davongekommen.",
    "📋 Pflegebericht: {amountLabel} von {user} geprüft, keine Trinkpflicht. Die Rentner dürfen weiter atmen."
  ],
  shotDone: [
    "✅ Pflegeprotokoll aktualisiert: {user} meldet einen getrunkenen Shot. Noch offen: {shotsOpen}.",
    "🥃 Heimleitung bestätigt: Ein Shot wurde abgehakt. Noch offen für Engel & Roxxy: {shotsOpen}.",
    "🧓 Rentnerdienst erledigt: {user} hat einen Shot gemeldet. Offene Pflichtportionen: {shotsOpen}."
  ],
  shotDoneEmpty: [
    "📋 Die Heimleitung hat nachgezählt: Aktuell stehen keine Shots offen. Noch.",
    "😇 Kein offener Shot im Pflegeplan. Engel & Roxxy sind gerade offiziell unschuldig.",
    "🧓 Der Medikamentenwagen ist leer: keine offenen Shots vorhanden."
  ],
  overlayDrawTitle: ["SHOT-ALARM", "HEIMLEITUNG PRÜFT", "RENTNER-LOTTERIE"],
  overlayDrawText: ["Die Heimleitung lost aus...", "Der Rentner-Automat rattert...", "Engel & Roxxy warten auf das Urteil..."],
  overlayResultHitTitle: ["SHOT-ALARM", "PFLEGEPROTOKOLL", "RENTNER-ALARM"],
  overlayResultMissTitle: ["SHOT-ALARM", "ENTWARNUNG", "HEIMLEITUNG MELDET"],
  overlayResultHitText: ["Engel & Roxxy müssen ran!", "Der Pflegewagen bringt Nachschub!", "Pflichtportion für Engel & Roxxy!"],
  overlayResultMissText: ["Die Rentner-Leber wurde verschont.", "Heute nochmal davongekommen.", "Kein Shot im Pflegeplan."]
};

const TEXT_CATEGORIES = {
  drawStart: "chat",
  resultHit: "chat",
  resultMiss: "chat",
  shotDone: "chat",
  shotDoneEmpty: "chat",
  overlayDrawTitle: "overlay",
  overlayDrawText: "overlay",
  overlayResultHitTitle: "overlay",
  overlayResultMissTitle: "overlay",
  overlayResultHitText: "overlay",
  overlayResultMissText: "overlay"
};

const TEXT_CATEGORY_LABELS = {
  chat: "Chat-Texte",
  overlay: "Overlay-Texte"
};

const TEXT_OPTIONS = {
  defaultCategory: "chat",
  categories: TEXT_CATEGORIES,
  categoryLabels: TEXT_CATEGORY_LABELS,
  source: "shot_alarm_seed"
};

const state = {
  initialized: false,
  enabled: true,
  busAvailable: false,
  registeredOnBus: false,
  subscriptions: [],
  routeCount: 0,
  configPath: "",
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastError: "",
  lastWarning: "",
  lastEvent: null,
  lastShot: null,
  lastOverlay: null,
  lastSound: null,
  lastDraw: null,
  lastResult: null,
  singleSupportCounter: 0,
  shotsOpen: 0,
  shotsDrunk: 0,
  shotsAddedTotal: 0,
  runtime: {
    desiredActive: false,
    effectiveActive: false,
    visible: false,
    currentStreamSessionId: "",
    currentStreamDayId: "",
    streamDateLabel: "",
    streamStatus: "offline",
    streamLive: false,
    activeSince: "",
    stoppedAt: "",
    lastChangedAt: "",
    lastReason: "init",
    restoredAt: ""
  },
  drawsPending: new Map(),
  counts: {
    received: 0,
    processed: 0,
    skipped: 0,
    pending: 0,
    rolls: 0,
    hits: 0,
    misses: 0,
    shots: 0,
    overlayShows: 0,
    soundRequests: 0,
    soundErrors: 0,
    chatMessages: 0,
    chatErrors: 0,
    drawsStarted: 0,
    drawsResolved: 0,
    shotsOpen: 0,
    shotsDrunk: 0,
    shotsAddedTotal: 0,
    singleSupportCounter: 0,
    byType: {},
    bySource: {}
  },
  pendingSubTimers: new Map(),
  pendingSubEvents: new Map(),
  history: [],
  storageReady: false,
  storageError: "",
  textVariantsReady: false,
  textVariantsError: "",
  configSource: "json",
  auditReady: true,
  auditEntriesWritten: 0,
  auditLastEntryAt: "",
  auditLastError: "",
  safetyDenied: 0
};

let config = clone(DEFAULT_CONFIG);
let bus = null;
let broadcastWS = null;
let heartbeatTimer = null;

const auditLogger = auditHelper.createAuditLogger({
  config: {
    enabled: true,
    maxMemoryEntries: 300,
    retentionDays: 30,
    allowedCategories: [
      "system", "security", "api", "dashboard", "communication", "overlay", "alert",
      "sound", "tts", "vip", "streamerbot", "obs", "discord", "twitch",
      "database", "config", "error", "shot_alarm"
    ],
    allowedResults: [
      "ok", "failed", "denied", "ignored", "skipped", "queued", "started",
      "finished", "timeout", "warning"
    ]
  }
});

const CONFIRM_WRITE_ACTIONS = [
  "manual-trigger",
  "resolve-pending",
  "flush-pending",
  "reset-state"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampPercent(value, fallback = 0) {
  return Math.max(0, Math.min(100, asNumber(value, fallback)));
}

function safeJson(value) {
  try { return JSON.parse(JSON.stringify(value ?? null)); } catch (_) { return null; }
}


function boolLike(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const clean = cleanString(value).toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(clean)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(clean)) return false;
  return fallback;
}

function parseRoles(value) {
  if (Array.isArray(value)) return value.map(v => cleanString(v)).filter(Boolean);
  return cleanString(value).split(/[;,\s]+/).map(v => cleanString(v)).filter(Boolean);
}

function actorFromRequest(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const headers = req && req.headers ? req.headers : {};
  const actor = body.actor && typeof body.actor === "object" ? body.actor : {};
  const id = cleanString(actor.id || body.actorId || body.actorLogin || headers["x-cgn-actor-id"] || headers["x-cgn-actor-login"] || "dashboard");
  const name = cleanString(actor.name || body.actorName || body.actorDisplayName || headers["x-cgn-actor-name"] || id || "Dashboard");
  const roles = parseRoles(actor.roles || body.actorRoles || body.actorRole || headers["x-cgn-actor-roles"] || ["dashboard_user"]);
  return { type: "dashboard", id, name, roles: roles.length ? roles : ["dashboard_user"] };
}

function auditContextFromRequest(req) {
  return securityContext.contextFromExpressRequest(req, MODULE_NAME, { actor: actorFromRequest(req), mayLogPayload: false });
}

function logDashboardAction(req, options = {}) {
  try {
    const logged = auditLogger.log({
      context: auditContextFromRequest(req),
      level: options.level || "info",
      category: options.category || "shot_alarm",
      action: options.action || "shot_alarm.dashboard_action",
      result: options.result || "ok",
      message: options.message || "Shot-Alarm dashboard action",
      details: options.details || {},
      payload: options.payload || undefined,
      mayLogPayload: options.mayLogPayload === true
    });
    if (logged && logged.ok) {
      state.auditEntriesWritten += 1;
      state.auditLastEntryAt = logged.entry && logged.entry.at ? logged.entry.at : nowIso();
      state.auditLastError = "";
    }
    return logged;
  } catch (err) {
    state.auditLastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.auditLastError };
  }
}

function confirmWriteAccepted(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const query = req && req.query && typeof req.query === "object" ? req.query : {};
  return boolLike(body.confirmWrite, false)
    || boolLike(query.confirmWrite, false)
    || cleanString(body.confirm).toUpperCase() === "SHOT_ALARM_WRITE"
    || cleanString(query.confirm).toUpperCase() === "SHOT_ALARM_WRITE";
}

function normalizeAuditActionSegment(action) {
  return cleanString(action).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function shotAlarmAuditAction(action) {
  const segment = normalizeAuditActionSegment(action) || "dashboard_action";
  return `shot_alarm.${segment}`;
}

function requireConfirmWrite(req, action) {
  if (confirmWriteAccepted(req)) return { ok: true };
  state.safetyDenied += 1;
  logDashboardAction(req, {
    level: "warn",
    result: "denied",
    action: shotAlarmAuditAction(action),
    message: `Shot-Alarm write action denied: confirmWrite missing`,
    details: { action, normalizedAction: shotAlarmAuditAction(action), required: "confirmWrite=true" }
  });
  return {
    ok: false,
    status: 400,
    payload: {
      ok: false,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      error: "confirm_write_required",
      action,
      hint: "Diese produktive Shot-Alarm-Aktion braucht confirmWrite=true."
    }
  };
}

function publicAuditStatus() {
  const status = auditLogger.getStatus();
  return {
    enabled: status.enabled,
    memoryEntries: status.memory.entries,
    maxMemoryEntries: status.memory.maxEntries,
    retentionDays: status.memory.retentionDays,
    written: state.auditEntriesWritten,
    lastEntryAt: state.auditLastEntryAt,
    lastError: state.auditLastError,
    denied: state.safetyDenied
  };
}

function randomFrom(list, fallback = "") {
  const arr = Array.isArray(list) ? list.filter(v => String(v ?? "").trim()) : [];
  if (!arr.length) return fallback;
  return String(arr[Math.floor(Math.random() * arr.length)]);
}

function formatAmountLabel(summary = {}) {
  if (summary.bits > 0) return `${summary.bits.toLocaleString("de-DE")} Bits`;
  if (summary.amountEur > 0) return `${summary.amountEur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  if (summary.total > 0 && summary.eventType === "gift_bomb") return `${summary.total}er Sub-Bombe`;
  return summary.eventLabel || summary.eventType || "Support-Event";
}

function replaceTokens(template, values = {}) {
  return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => String(values[key] ?? ""));
}

function buildText(key, summary = {}) {
  const displayName = summary.user && summary.user.displayName ? summary.user.displayName : "Unbekannt";
  const values = {
    user: displayName,
    amountLabel: summary.amountLabel || formatAmountLabel(summary),
    eventLabel: summary.eventLabel || "Support-Event",
    shotsAdded: summary.shotsAdded || 0,
    shotsOpen: state.shotsOpen || 0,
    shotsDrunk: state.shotsDrunk || 0,
    shotsTotal: state.shotsAddedTotal || 0,
    chanceSummary: summary.chanceSummary || ""
  };
  const legacyFallback = config.texts && config.texts[key] ? randomFrom(config.texts[key], "") : "";
  const hardFallback = key === "drawStart"
    ? "🚨 Heimleitung meldet: {user} hat {amountLabel} in den Rentner-Automaten geworfen. Die Shot-Auslosung läuft..."
    : key === "resultMiss"
      ? "😇 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} – kein Shot."
      : key === "shotDone"
        ? "✅ Pflegeprotokoll aktualisiert: {user} meldet einen getrunkenen Shot. Noch offen: {shotsOpen}."
        : key === "shotDoneEmpty"
          ? "📋 Die Heimleitung hat nachgezählt: Aktuell stehen keine Shots offen. Noch."
          : "🥃 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} ergibt {shotsAdded} Shot(s). Offen: {shotsOpen}.";
  try {
    const rendered = textHelper.renderModuleText(TEXT_MODULE, key, DEFAULT_TEXT_VARIANTS, values, TEXT_OPTIONS);
    if (String(rendered || "").trim()) return rendered;
  } catch (err) {
    state.textVariantsError = err && err.message ? err.message : String(err);
  }
  return replaceTokens(legacyFallback || hardFallback, values);
}

function pickOverlayText(key, summary = {}) {
  return buildText(key, summary);
}

async function sendChatText(key, summary = {}, options = {}) {
  if (!config.chat || config.chat.enabled === false) return { ok: false, skipped: true, reason: "chat_disabled" };
  if (!chatOutputHelper || typeof chatOutputHelper.sendChatMessage !== "function") return { ok: false, skipped: true, reason: "chat_helper_unavailable" };
  const message = buildText(key, summary);
  try {
    const result = await chatOutputHelper.sendChatMessage(message, {
      source: MODULE_NAME,
      reason: `shot_alarm_${key}`,
      prefer: config.chat.prefer || "bot",
      maxLength: config.chat.maxLength || 420,
      ...options
    });
    if (result && result.ok && result.sent !== false) state.counts.chatMessages += 1;
    else state.counts.chatErrors += 1;
    return result;
  } catch (err) {
    state.counts.chatErrors += 1;
    state.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.lastError };
  }
}

function deepMerge(base, override) {
  const out = Array.isArray(base) ? [...base] : { ...(base || {}) };
  if (!override || typeof override !== "object" || Array.isArray(override)) return clone(out);
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = clone(value);
    }
  }
  return out;
}

function increment(map, key, amount = 1) {
  const clean = cleanString(key, "unknown");
  map[clean] = Number(map[clean] || 0) + amount;
}

function applyFinalRuleDefaults() {
  config.rules = config.rules || {};
  if (config.rules.finalRulesVersion === DEFAULT_CONFIG.rules.finalRulesVersion) return false;

  config.rules.finalRulesVersion = DEFAULT_CONFIG.rules.finalRulesVersion;
  config.rules.singleSubChancePercent = 20;
  config.rules.resubChancePercent = 20;
  config.rules.singleGiftSubChancePercent = 20;
  config.rules.singleSupportFiveChancePercent = 50;
  config.rules.singleSupportTenChancePercent = 100;
  config.rules.giftBombFiveChancePercent = 50;
  config.rules.giftBombTenBlockShots = 1;
  config.rules.bits = clone(DEFAULT_CONFIG.rules.bits);
  config.rules.payments = clone(DEFAULT_CONFIG.rules.payments);
  return true;
}


function applySoundMediaDefaults() {
  if (!config.sound || typeof config.sound !== "object") config.sound = {};
  let changed = false;
  if (!config.sound.overlayShot || typeof config.sound.overlayShot !== "object") {
    config.sound.overlayShot = clone(DEFAULT_CONFIG.sound.overlayShot);
    changed = true;
  }
  if (config.sound.overlayShot.enabled !== false) config.sound.overlayShot.enabled = true;
  if (!Object.prototype.hasOwnProperty.call(config.sound.overlayShot, "mediaId")) { config.sound.overlayShot.mediaId = ""; changed = true; }
  if (!Object.prototype.hasOwnProperty.call(config.sound.overlayShot, "mediaLabel")) { config.sound.overlayShot.mediaLabel = ""; changed = true; }
  if (!Object.prototype.hasOwnProperty.call(config.sound.overlayShot, "random")) { config.sound.overlayShot.random = true; changed = true; }
  if (!Array.isArray(config.sound.overlayShot.sounds)) { config.sound.overlayShot.sounds = []; changed = true; }
  const existingSingleMediaId = cleanString(config.sound.overlayShot.mediaId || config.sound.overlayShot.mediaAssetId || config.sound.overlayShot.assetId || "");
  if (existingSingleMediaId && !config.sound.overlayShot.sounds.some(item => cleanString(item && (item.mediaId || item.mediaAssetId || item.assetId)) === existingSingleMediaId)) {
    config.sound.overlayShot.sounds.push({
      enabled: true,
      mediaId: existingSingleMediaId,
      mediaLabel: cleanString(config.sound.overlayShot.mediaLabel || ""),
      label: cleanString(config.sound.overlayShot.label || DEFAULT_CONFIG.sound.overlayShot.label)
    });
    changed = true;
  }
  const normalizedSounds = [];
  const seenSounds = new Set();
  for (const item of config.sound.overlayShot.sounds) {
    if (!item || typeof item !== "object") { changed = true; continue; }
    const mediaId = cleanString(item.mediaId || item.mediaAssetId || item.assetId || "");
    if (!mediaId || seenSounds.has(mediaId)) { changed = true; continue; }
    seenSounds.add(mediaId);
    normalizedSounds.push({
      enabled: item.enabled !== false,
      mediaId,
      mediaLabel: cleanString(item.mediaLabel || item.label || ""),
      label: cleanString(item.label || item.mediaLabel || DEFAULT_CONFIG.sound.overlayShot.label),
      volume: Number.isFinite(Number(item.volume)) ? Number(item.volume) : undefined
    });
  }
  if (JSON.stringify(normalizedSounds) !== JSON.stringify(config.sound.overlayShot.sounds)) {
    config.sound.overlayShot.sounds = normalizedSounds;
    changed = true;
  }
  if (!cleanString(config.sound.overlayShot.label)) { config.sound.overlayShot.label = DEFAULT_CONFIG.sound.overlayShot.label; changed = true; }
  if (!cleanString(config.sound.endpoint) || String(config.sound.endpoint).includes("/api/sound/play")) {
    if (config.sound.endpoint !== DEFAULT_CONFIG.sound.endpoint) changed = true;
    config.sound.endpoint = DEFAULT_CONFIG.sound.endpoint;
  }
  if (!cleanString(config.sound.category)) { config.sound.category = DEFAULT_CONFIG.sound.category; changed = true; }
  if (!cleanString(config.sound.source)) { config.sound.source = DEFAULT_CONFIG.sound.source; changed = true; }
  // SHOT-ALARM-2J.2: Shot-MP3s sollen standardmäßig über Device + Discord laufen.
  // Alte Overlay-Defaults werden bewusst migriert, damit gespeicherte 2J/2J.1-Configs nicht stumm wirken,
  // wenn das Sound-System-Overlay in OBS nicht in der aktiven Szene liegt.
  const normalizedTarget = cleanString(config.sound.target);
  if (!normalizedTarget || normalizedTarget === "stream") { config.sound.target = DEFAULT_CONFIG.sound.target; changed = true; }
  const normalizedOutputTarget = cleanString(config.sound.outputTarget);
  if (!normalizedOutputTarget || normalizedOutputTarget === "overlay") { config.sound.outputTarget = DEFAULT_CONFIG.sound.outputTarget; changed = true; }
  if (!Number.isFinite(Number(config.sound.priority))) { config.sound.priority = DEFAULT_CONFIG.sound.priority; changed = true; }
  if (!Number.isFinite(Number(config.sound.volume))) { config.sound.volume = DEFAULT_CONFIG.sound.volume; changed = true; }
  return changed;
}

function ensureTextVariants() {
  try {
    const seeded = textHelper.seedModuleTextVariants(TEXT_MODULE, DEFAULT_TEXT_VARIANTS, TEXT_OPTIONS);
    state.textVariantsReady = true;
    state.textVariantsError = "";
    return seeded;
  } catch (err) {
    state.textVariantsReady = false;
    state.textVariantsError = err && err.message ? err.message : String(err);
    state.lastWarning = `text_variants_unavailable: ${state.textVariantsError}`;
    return { ok: false, error: state.textVariantsError };
  }
}

function ensureStorage() {
  try {
    database.ensureReady();
    const qTable = database.quoteIdentifier(HISTORY_TABLE);
    database.exec(`
      CREATE TABLE IF NOT EXISTS ${qTable} (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        phase TEXT NOT NULL DEFAULT '',
        event_type TEXT NOT NULL DEFAULT '',
        event_label TEXT NOT NULL DEFAULT '',
        user_login TEXT NOT NULL DEFAULT '',
        user_display_name TEXT NOT NULL DEFAULT '',
        amount_label TEXT NOT NULL DEFAULT '',
        chance_summary TEXT NOT NULL DEFAULT '',
        shots_added INTEGER NOT NULL DEFAULT 0,
        shots_open_after INTEGER NOT NULL DEFAULT 0,
        shots_drunk_after INTEGER NOT NULL DEFAULT 0,
        stream_session_id TEXT NOT NULL DEFAULT '',
        stream_day_id TEXT NOT NULL DEFAULT '',
        stream_date_label TEXT NOT NULL DEFAULT '',
        payload_json TEXT NOT NULL DEFAULT '{}'
      );
    `);
    try { database.ensureColumn(HISTORY_TABLE, "stream_session_id", "TEXT NOT NULL DEFAULT ''"); } catch (_) {}
    try { database.ensureColumn(HISTORY_TABLE, "stream_day_id", "TEXT NOT NULL DEFAULT ''"); } catch (_) {}
    try { database.ensureColumn(HISTORY_TABLE, "stream_date_label", "TEXT NOT NULL DEFAULT ''"); } catch (_) {}
    try { database.exec(`CREATE INDEX IF NOT EXISTS idx_${HISTORY_TABLE}_created_at ON ${qTable} (created_at);`); } catch (_) {}
    try { database.exec(`CREATE INDEX IF NOT EXISTS idx_${HISTORY_TABLE}_event_type ON ${qTable} (event_type);`); } catch (_) {}
    try { database.exec(`CREATE INDEX IF NOT EXISTS idx_${HISTORY_TABLE}_stream_session ON ${qTable} (stream_session_id);`); } catch (_) {}
    try { database.exec(`CREATE INDEX IF NOT EXISTS idx_${HISTORY_TABLE}_stream_day ON ${qTable} (stream_day_id);`); } catch (_) {}
    settingsHelper.ensureSettingsTable(SETTINGS_TABLE);
    state.storageReady = true;
    state.storageError = "";
    return { ok: true, table: HISTORY_TABLE, settingsTable: SETTINGS_TABLE };
  } catch (err) {
    state.storageReady = false;
    state.storageError = err && err.message ? err.message : String(err);
    state.lastWarning = `storage_unavailable: ${state.storageError}`;
    return { ok: false, error: state.storageError };
  }
}

function persistHistory(entry) {
  if (!state.storageReady) return { ok: false, skipped: true, reason: "storage_not_ready" };
  try {
    database.insert(HISTORY_TABLE, {
      id: String(entry.historyId || entry.storageId || entry.id || `shot_${Date.now().toString(36)}`),
      created_at: String(entry.at || nowIso()),
      phase: String(entry.phase || entry.kind || ""),
      event_type: String(entry.eventType || entry.event_type || ""),
      event_label: String(entry.eventLabel || entry.event_label || ""),
      user_login: String(entry.user?.login || ""),
      user_display_name: String(entry.user?.displayName || ""),
      amount_label: String(entry.amountLabel || ""),
      chance_summary: String(entry.chanceSummary || ""),
      shots_added: Math.max(0, Math.floor(asNumber(entry.shotsAdded ?? entry.shots, 0))),
      shots_open_after: Math.max(0, Math.floor(asNumber(entry.shotsOpenAfter ?? entry.shotsOpen, state.shotsOpen))),
      shots_drunk_after: Math.max(0, Math.floor(asNumber(entry.shotsDrunk ?? state.shotsDrunk, 0))),
      stream_session_id: String(entry.streamSessionId || entry.stream_session_id || state.runtime.currentStreamSessionId || ""),
      stream_day_id: String(entry.streamDayId || entry.stream_day_id || state.runtime.currentStreamDayId || ""),
      stream_date_label: String(entry.streamDateLabel || entry.stream_date_label || state.runtime.streamDateLabel || ""),
      payload_json: database.jsonEncode(entry)
    });
    return { ok: true };
  } catch (err) {
    state.storageError = err && err.message ? err.message : String(err);
    state.lastWarning = `history_persist_failed: ${state.storageError}`;
    return { ok: false, error: state.storageError };
  }
}


function streamFilterWhere(streamSessionId = "") {
  const clean = cleanString(streamSessionId || "");
  if (!clean || clean === "current") {
    const current = cleanString(state.runtime.currentStreamSessionId || "");
    return current ? { where: "WHERE stream_session_id = :streamSessionId", params: { streamSessionId: current }, selected: current } : { where: "", params: {}, selected: "" };
  }
  if (clean === "all") return { where: "", params: {}, selected: "all" };
  return { where: "WHERE stream_session_id = :streamSessionId", params: { streamSessionId: clean }, selected: clean };
}

function listStoredHistory(limit = 200, options = {}) {
  if (!state.storageReady) return [];
  try {
    const filter = streamFilterWhere(options.streamSessionId || "");
    const params = { ...filter.params, limit: Math.max(1, Math.min(1000, Number(limit || 200))) };
    const rows = database.all(`
      SELECT payload_json
      FROM ${database.quoteIdentifier(HISTORY_TABLE)}
      ${filter.where}
      ORDER BY created_at DESC
      LIMIT :limit
    `, params);
    return rows.map(row => database.jsonDecode(row.payload_json, null)).filter(Boolean);
  } catch (err) {
    state.storageError = err && err.message ? err.message : String(err);
    return [];
  }
}

function listStreamSessions() {
  const current = getStreamContext();
  const currentId = cleanString(current.streamSessionId || state.runtime.currentStreamSessionId || "");
  const rows = [];
  if (currentId) {
    rows.push({
      streamSessionId: currentId,
      streamDayId: cleanString(current.streamDayId || state.runtime.currentStreamDayId || ""),
      streamDateLabel: cleanString(current.streamDateLabel || state.runtime.streamDateLabel || "Aktueller Stream"),
      status: "current",
      current: true,
      events: 0,
      shots: 0,
      startedAt: cleanString(current.startedAt || "")
    });
  }
  if (state.storageReady) {
    try {
      const stored = database.all(`
        SELECT
          stream_session_id AS streamSessionId,
          stream_day_id AS streamDayId,
          stream_date_label AS streamDateLabel,
          MIN(created_at) AS firstAt,
          MAX(created_at) AS lastAt,
          COUNT(*) AS events,
          SUM(shots_added) AS shots
        FROM ${database.quoteIdentifier(HISTORY_TABLE)}
        WHERE stream_session_id <> ''
        GROUP BY stream_session_id, stream_day_id, stream_date_label
        ORDER BY MAX(created_at) DESC
        LIMIT 100
      `);
      for (const row of stored) {
        const id = cleanString(row.streamSessionId || "");
        if (!id) continue;
        const existing = rows.find(item => item.streamSessionId === id);
        const item = {
          streamSessionId: id,
          streamDayId: cleanString(row.streamDayId || ""),
          streamDateLabel: cleanString(row.streamDateLabel || id),
          status: id === currentId ? "current" : "stored",
          current: id === currentId,
          events: Number(row.events || 0),
          shots: Number(row.shots || 0),
          firstAt: cleanString(row.firstAt || ""),
          lastAt: cleanString(row.lastAt || "")
        };
        if (existing) Object.assign(existing, item, { current: true, status: "current" });
        else rows.push(item);
      }
    } catch (err) {
      state.storageError = err && err.message ? err.message : String(err);
    }
  }
  rows.push({ streamSessionId: "all", streamDayId: "", streamDateLabel: "Alle Streams", status: "all", current: false, events: 0, shots: 0 });
  return rows;
}

function buildStats(options = {}) {
  ensureCurrentStreamRuntime("stats");
  const filter = streamFilterWhere(options.streamSessionId || "current");
  const base = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    selectedStreamSessionId: filter.selected,
    currentStreamSessionId: state.runtime.currentStreamSessionId,
    currentStreamDayId: state.runtime.currentStreamDayId,
    streamDateLabel: state.runtime.streamDateLabel,
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsAddedTotal: state.shotsAddedTotal,
    runtime: clone(state.counts),
    database: { ready: state.storageReady, table: HISTORY_TABLE, error: state.storageError },
    streams: listStreamSessions(),
    byEventType: [],
    topUsers: []
  };
  if (!state.storageReady) return base;
  try {
    const where = filter.where;
    const params = filter.params;
    base.byEventType = database.all(`
      SELECT event_type AS eventType, COUNT(*) AS events, SUM(shots_added) AS shots
      FROM ${database.quoteIdentifier(HISTORY_TABLE)}
      ${where}
      GROUP BY event_type
      ORDER BY shots DESC, events DESC
      LIMIT 20
    `, params).map(row => ({ eventType: row.eventType || "unknown", events: Number(row.events || 0), shots: Number(row.shots || 0) }));
    base.topUsers = database.all(`
      SELECT user_display_name AS displayName, COUNT(*) AS events, SUM(shots_added) AS shots
      FROM ${database.quoteIdentifier(HISTORY_TABLE)}
      ${where ? `${where} AND user_display_name <> ''` : "WHERE user_display_name <> ''"}
      GROUP BY user_display_name
      ORDER BY shots DESC, events DESC
      LIMIT 20
    `, params).map(row => ({ displayName: row.displayName || "Unbekannt", events: Number(row.events || 0), shots: Number(row.shots || 0) }));
  } catch (err) {
    base.database.error = err && err.message ? err.message : String(err);
  }
  return base;
}


function getTwitchEventsModule() {
  try { return require("./twitch_events"); } catch (_) { return null; }
}

function getStreamContext() {
  const fallbackDay = new Date().toISOString().slice(0, 10);
  try {
    const twitchEvents = getTwitchEventsModule();
    const streamState = twitchEvents && typeof twitchEvents.getStreamState === "function" ? twitchEvents.getStreamState() : null;
    const session = streamState && typeof streamState === "object" ? (streamState.streamSession || {}) : {};
    const live = streamState?.live === true || session.active === true || session.status === "online" || session.status === "confirmed";
    const sessionId = cleanString(session.streamSessionId || streamState?.streamSessionId || "");
    const dayId = cleanString(session.streamDayId || streamState?.streamDayId || "");
    return {
      ok: true,
      live,
      status: cleanString(session.status || streamState?.status || (live ? "online" : "offline")),
      streamSessionId: live ? sessionId : "",
      streamDayId: live ? dayId : "",
      streamDateLabel: cleanString(session.streamDateLabel || streamState?.streamDateLabel || dayId || fallbackDay),
      startedAt: cleanString(session.startedAt || streamState?.startedAt || ""),
      source: cleanString(streamState?.source || session.source || "twitch_events"),
      rawLive: streamState?.live === true
    };
  } catch (err) {
    return { ok: false, live: false, status: "unknown", streamSessionId: "", streamDayId: "", streamDateLabel: fallbackDay, startedAt: "", source: "fallback", error: err && err.message ? err.message : String(err) };
  }
}

function runtimeCounterSnapshot() {
  return {
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsAddedTotal: state.shotsAddedTotal,
    counts: {
      received: state.counts.received,
      processed: state.counts.processed,
      skipped: state.counts.skipped,
      rolls: state.counts.rolls,
      hits: state.counts.hits,
      misses: state.counts.misses,
      shots: state.counts.shots,
      drawsStarted: state.counts.drawsStarted,
      drawsResolved: state.counts.drawsResolved,
      byType: state.counts.byType,
      bySource: state.counts.bySource
    }
  };
}

function applyRuntimeCounters(snapshot = {}) {
  state.shotsOpen = Math.max(0, Math.floor(asNumber(snapshot.shotsOpen, 0)));
  state.shotsDrunk = Math.max(0, Math.floor(asNumber(snapshot.shotsDrunk, 0)));
  state.shotsAddedTotal = Math.max(0, Math.floor(asNumber(snapshot.shotsAddedTotal, 0)));
  state.counts.shotsOpen = state.shotsOpen;
  state.counts.shotsDrunk = state.shotsDrunk;
  state.counts.shotsAddedTotal = state.shotsAddedTotal;
  if (snapshot.counts && typeof snapshot.counts === "object") {
    for (const key of ["received", "processed", "skipped", "rolls", "hits", "misses", "shots", "drawsStarted", "drawsResolved"]) {
      if (key in snapshot.counts) state.counts[key] = Math.max(0, Math.floor(asNumber(snapshot.counts[key], state.counts[key] || 0)));
    }
    if (snapshot.counts.byType && typeof snapshot.counts.byType === "object") state.counts.byType = clone(snapshot.counts.byType) || {};
    if (snapshot.counts.bySource && typeof snapshot.counts.bySource === "object") state.counts.bySource = clone(snapshot.counts.bySource) || {};
  }
}

function loadRuntimeState() {
  try {
    const fallback = {
      desiredActive: false,
      currentStreamSessionId: "",
      currentStreamDayId: "",
      streamDateLabel: "",
      streamStatus: "offline",
      streamLive: false,
      activeSince: "",
      stoppedAt: "",
      lastChangedAt: "",
      lastReason: "init",
      restoredAt: nowIso(),
      counters: runtimeCounterSnapshot()
    };
    const setting = settingsHelper.getSetting(SETTINGS_TABLE, SETTINGS_KEY_RUNTIME, fallback, { valueType: "json" });
    const value = setting && setting.value && typeof setting.value === "object" ? setting.value : fallback;
    state.runtime = { ...state.runtime, ...value, restoredAt: nowIso() };
    if (value.counters && typeof value.counters === "object") applyRuntimeCounters(value.counters);
    state.counts.shotsOpen = state.shotsOpen;
    state.counts.shotsDrunk = state.shotsDrunk;
    state.counts.shotsAddedTotal = state.shotsAddedTotal;
    ensureCurrentStreamRuntime("runtime_loaded", { save: false });
    saveRuntimeState("runtime_loaded");
  } catch (err) {
    state.lastWarning = `runtime_load_failed: ${err && err.message ? err.message : String(err)}`;
  }
}

function saveRuntimeState(reason = "runtime_save") {
  try {
    const payload = {
      desiredActive: state.runtime.desiredActive === true,
      effectiveActive: state.runtime.effectiveActive === true,
      visible: state.runtime.visible === true,
      currentStreamSessionId: cleanString(state.runtime.currentStreamSessionId || ""),
      currentStreamDayId: cleanString(state.runtime.currentStreamDayId || ""),
      streamDateLabel: cleanString(state.runtime.streamDateLabel || ""),
      streamStatus: cleanString(state.runtime.streamStatus || "offline"),
      streamLive: state.runtime.streamLive === true,
      activeSince: cleanString(state.runtime.activeSince || ""),
      stoppedAt: cleanString(state.runtime.stoppedAt || ""),
      lastChangedAt: cleanString(state.runtime.lastChangedAt || ""),
      lastReason: cleanString(reason || state.runtime.lastReason || ""),
      counters: runtimeCounterSnapshot()
    };
    settingsHelper.setSetting(SETTINGS_TABLE, SETTINGS_KEY_RUNTIME, payload, { valueType: "json", description: "Shot-Alarm Runtime-State je StreamSession inklusive gewünschtem Aktiv-Zustand." });
    return { ok: true, runtime: payload };
  } catch (err) {
    state.lastWarning = `runtime_save_failed: ${err && err.message ? err.message : String(err)}`;
    return { ok: false, error: state.lastWarning };
  }
}

function clearRuntimeCounters(reason = "runtime_reset") {
  state.singleSupportCounter = 0;
  state.shotsOpen = 0;
  state.shotsDrunk = 0;
  state.shotsAddedTotal = 0;
  state.drawsPending.clear();
  state.pendingSubEvents.clear();
  for (const timer of state.pendingSubTimers.values()) {
    try { clearTimeout(timer); } catch (_) {}
  }
  state.pendingSubTimers.clear();
  state.counts = {
    ...state.counts,
    received: 0,
    processed: 0,
    skipped: 0,
    pending: 0,
    rolls: 0,
    hits: 0,
    misses: 0,
    shots: 0,
    overlayShows: 0,
    soundRequests: 0,
    soundErrors: 0,
    chatMessages: 0,
    chatErrors: 0,
    drawsStarted: 0,
    drawsResolved: 0,
    shotsOpen: 0,
    shotsDrunk: 0,
    shotsAddedTotal: 0,
    singleSupportCounter: 0,
    byType: {},
    bySource: {}
  };
  state.lastEvent = null;
  state.lastShot = null;
  state.lastDraw = null;
  state.lastResult = null;
  state.lastOverlay = null;
  state.lastSound = null;
  state.runtime.lastReason = reason;
  state.runtime.lastChangedAt = nowIso();
}

function ensureCurrentStreamRuntime(reason = "runtime_check", options = {}) {
  const ctx = getStreamContext();
  const oldSessionId = cleanString(state.runtime.currentStreamSessionId || "");
  const newSessionId = cleanString(ctx.streamSessionId || "");
  const streamChanged = ctx.live === true && newSessionId && oldSessionId && oldSessionId !== newSessionId;
  const firstOnlineSession = ctx.live === true && newSessionId && !oldSessionId;

  if (streamChanged || (firstOnlineSession && (state.shotsOpen > 0 || state.shotsDrunk > 0 || state.shotsAddedTotal > 0))) {
    clearRuntimeCounters("stream_session_changed");
    emitBus("runtime.stream_changed", { oldStreamSessionId: oldSessionId, newStreamSessionId, streamDayId: ctx.streamDayId, at: nowIso() }, { replayable: true, ttlMs: 60000 });
  }

  if (ctx.live === true && newSessionId) {
    state.runtime.currentStreamSessionId = newSessionId;
    state.runtime.currentStreamDayId = cleanString(ctx.streamDayId || "");
    state.runtime.streamDateLabel = cleanString(ctx.streamDateLabel || "");
  }
  state.runtime.streamStatus = cleanString(ctx.status || (ctx.live ? "online" : "offline"));
  state.runtime.streamLive = ctx.live === true;
  state.runtime.effectiveActive = config.enabled !== false && config.overlayEnabled !== false && state.runtime.desiredActive === true && ctx.live === true;
  state.runtime.visible = state.runtime.effectiveActive === true;
  if (options.save !== false) saveRuntimeState(reason);
  return { ...ctx, desiredActive: state.runtime.desiredActive === true, effectiveActive: state.runtime.effectiveActive === true, visible: state.runtime.visible === true };
}

function buildOverlayStatePayload(reason = "state") {
  const ctx = ensureCurrentStreamRuntime(reason, { save: false });
  return {
    type: "shot_alarm.overlay.state",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    at: nowIso(),
    reason,
    active: ctx.effectiveActive === true,
    visible: ctx.visible === true,
    desiredActive: state.runtime.desiredActive === true,
    effectiveActive: ctx.effectiveActive === true,
    enabled: config.enabled !== false,
    overlayEnabled: config.overlayEnabled !== false,
    streamLive: ctx.live === true,
    streamStatus: ctx.status,
    streamSessionId: state.runtime.currentStreamSessionId,
    streamDayId: state.runtime.currentStreamDayId,
    streamDateLabel: state.runtime.streamDateLabel,
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsAddedTotal: state.shotsAddedTotal,
    pendingDraws: state.drawsPending.size
  };
}

function sendOverlayState(reason = "state") {
  const payload = buildOverlayStatePayload(reason);
  if (typeof broadcastWS === "function") {
    try { broadcastWS(payload); } catch (err) { state.lastError = err && err.message ? err.message : String(err); }
  }
  emitBus("overlay.state", payload, { replayable: true, ttlMs: 60000 });
  publishStatus(reason);
  return payload;
}

function setRuntimeActive(active, actor = {}, reason = "dashboard") {
  ensureCurrentStreamRuntime(reason);
  const next = active === true;
  state.runtime.desiredActive = next;
  state.runtime.lastChangedAt = nowIso();
  state.runtime.lastReason = reason;
  if (next && !state.runtime.activeSince) state.runtime.activeSince = nowIso();
  if (!next) state.runtime.stoppedAt = nowIso();
  ensureCurrentStreamRuntime(next ? "start" : "stop");
  saveRuntimeState(next ? "start" : "stop");
  const payload = sendOverlayState(next ? "start" : "stop");
  emitBus(next ? "runtime.started" : "runtime.stopped", { ...payload, actor: safeJson(actor || {}) }, { replayable: true, ttlMs: 60000 });
  return payload;
}

function isRuntimeEffective(options = {}) {
  if (options.force === true) return true;
  ensureCurrentStreamRuntime("runtime_gate", { save: false });
  return state.runtime.effectiveActive === true;
}


function loadConfig() {
  ensureStorage();
  ensureTextVariants();
  const loaded = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, spaces: 2 });
  const fileConfig = loaded && loaded.data ? loaded.data : clone(DEFAULT_CONFIG);
  let sourceConfig = fileConfig;
  state.configSource = "json";
  try {
    const setting = settingsHelper.getSettingWithFallback(SETTINGS_TABLE, SETTINGS_KEY_CONFIG, fileConfig, {
      valueType: "json",
      configFile: CONFIG_FILE,
      configDefaults: DEFAULT_CONFIG,
      createIfMissing: true
    });
    if (setting && setting.value && typeof setting.value === "object") {
      sourceConfig = setting.value;
      state.configSource = setting.source || (setting.found ? "database" : "default");
      if (setting.source !== "database") {
        settingsHelper.setSetting(SETTINGS_TABLE, SETTINGS_KEY_CONFIG, sourceConfig, {
          valueType: "json",
          description: "Shot-Alarm Dashboard-Config als DB-Quelle; JSON bleibt Mirror/Fallback."
        });
        state.configSource = "database_seeded_from_config";
      }
    }
  } catch (err) {
    state.lastWarning = `settings_fallback_json: ${err && err.message ? err.message : String(err)}`;
  }
  config = deepMerge(DEFAULT_CONFIG, sourceConfig || {});
  const migrated = applyFinalRuleDefaults();
  const soundMigrated = applySoundMediaDefaults();
  config.enabled = config.enabled !== false;
  state.enabled = config.enabled;
  state.configPath = loaded && loaded.path ? loaded.path : cfg.resolveConfigFile(CONFIG_FILE);
  if (migrated || soundMigrated) {
    try {
      settingsHelper.setSetting(SETTINGS_TABLE, SETTINGS_KEY_CONFIG, config, { valueType: "json", description: "Shot-Alarm Dashboard-Config" });
      cfg.writeJsonFile(state.configPath, config, { spaces: 2 });
    } catch (err) { state.lastWarning = `config_migration_save_failed: ${err && err.message ? err.message : String(err)}`; }
  }
  state.updatedAt = nowIso();
  return config;
}
function saveConfig(nextConfig) {
  const merged = deepMerge(DEFAULT_CONFIG, nextConfig || {});
  settingsHelper.setSetting(SETTINGS_TABLE, SETTINGS_KEY_CONFIG, merged, {
    valueType: "json",
    description: "Shot-Alarm Dashboard-Config als DB-Quelle; JSON bleibt Mirror/Fallback."
  });
  cfg.writeJsonFile(cfg.resolveConfigFile(CONFIG_FILE), merged, { spaces: 2 });
  config = merged;
  state.configSource = "database";
  state.enabled = config.enabled !== false;
  state.updatedAt = nowIso();
  publishStatus("config_saved");
  return config;
}
function publicHistoryItem(item) {
  return safeJson(item) || {};
}

function addHistory(item) {
  ensureCurrentStreamRuntime("history", { save: false });
  const source = safeJson(item);
  const sourceId = cleanString(source.id || "");
  const historyId = `hist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    ...source,
    id: sourceId || historyId,
    historyId,
    storageId: historyId,
    sourceId,
    drawId: cleanString(source.drawId || (sourceId.startsWith("draw_") ? sourceId : "")),
    streamSessionId: cleanString(source.streamSessionId || state.runtime.currentStreamSessionId || ""),
    streamDayId: cleanString(source.streamDayId || state.runtime.currentStreamDayId || ""),
    streamDateLabel: cleanString(source.streamDateLabel || state.runtime.streamDateLabel || ""),
    at: source.at || nowIso()
  };
  state.history.unshift(entry);
  const limit = Math.max(20, Math.min(1000, Number(config.historyLimit || HISTORY_LIMIT)));
  state.history = state.history.slice(0, limit);
  persistHistory(entry);
  return entry;
}

function publicStatus() {
  ensureCurrentStreamRuntime("status", { save: false });
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: config.enabled !== false,
    overlayEnabled: config.overlayEnabled !== false,
    soundEnabled: config.soundEnabled !== false,
    targetMode: config.targetMode,
    targetLabel: config.targetLabel,
    busAvailable: state.busAvailable,
    registeredOnBus: state.registeredOnBus,
    subscriptions: state.subscriptions,
    routeCount: state.routeCount,
    configPath: state.configPath,
    configSource: state.configSource,
    database: { adapter: database.getAdapter ? database.getAdapter() : "sqlite", dialect: database.getDialect ? database.getDialect() : "sqlite", storageReady: state.storageReady, historyTable: HISTORY_TABLE, settingsTable: SETTINGS_TABLE, settingsKey: SETTINGS_KEY_CONFIG, error: state.storageError },
    texts: { module: TEXT_MODULE, variantsReady: state.textVariantsReady, variantsTable: textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE || "module_text_variants", error: state.textVariantsError },
    safety: { dashboardAuditEnabled: true, confirmWriteRequired: true, confirmWriteActions: CONFIRM_WRITE_ACTIONS, dashboardAuditEndpoint: "/api/shot-alarm/dashboard-audit" },
    audit: publicAuditStatus(),
    runtime: {
      desiredActive: state.runtime.desiredActive === true,
      effectiveActive: state.runtime.effectiveActive === true,
      visible: state.runtime.visible === true,
      streamLive: state.runtime.streamLive === true,
      streamStatus: state.runtime.streamStatus,
      currentStreamSessionId: state.runtime.currentStreamSessionId,
      currentStreamDayId: state.runtime.currentStreamDayId,
      streamDateLabel: state.runtime.streamDateLabel,
      activeSince: state.runtime.activeSince,
      stoppedAt: state.runtime.stoppedAt,
      lastChangedAt: state.runtime.lastChangedAt,
      lastReason: state.runtime.lastReason
    },
    overlayState: buildOverlayStatePayload("status"),
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    lastError: state.lastError,
    lastWarning: state.lastWarning,
    lastEvent: state.lastEvent,
    lastShot: state.lastShot,
    lastDraw: state.lastDraw,
    lastResult: state.lastResult,
    lastOverlay: state.lastOverlay,
    lastSound: state.lastSound,
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsAddedTotal: state.shotsAddedTotal,
    counts: {
      ...state.counts,
      pending: state.pendingSubEvents.size,
      drawPending: state.drawsPending.size,
      shotsOpen: state.shotsOpen,
      shotsDrunk: state.shotsDrunk,
      shotsAddedTotal: state.shotsAddedTotal
    },
    rules: {
      singleSubChancePercent: config.rules.singleSubChancePercent,
      resubChancePercent: config.rules.resubChancePercent,
      singleGiftSubChancePercent: config.rules.singleGiftSubChancePercent,
      singleSupportFiveChancePercent: config.rules.singleSupportFiveChancePercent,
      singleSupportTenChancePercent: config.rules.singleSupportTenChancePercent,
      giftBombFiveChancePercent: config.rules.giftBombFiveChancePercent,
      giftBombTenBlockShots: config.rules.giftBombTenBlockShots,
      bits: config.rules.bits,
      payments: config.rules.payments,
      subscribeResubBufferMs: config.dedupe.subscribeResubBufferMs,
      subscribeResubBufferEnabled: config.dedupe.subscribeResubBufferEnabled !== false
    },
    overlayUrl: "/overlays/shot_alarm/shot_alarm_overlay.html"
  };
}

function publishStatus(trigger = "manual") {
  if (!bus || typeof bus.publishModuleStatus !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return bus.publishModuleStatus(MODULE_NAME, { ...publicStatus(), trigger }, { ttlMs: 30000 });
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: "publish_failed", error: state.lastError };
  }
}

function emitBus(action, payload = {}, meta = {}) {
  if (!bus || typeof bus.emit !== "function") return { ok: false, reason: "bus_unavailable" };
  try {
    return bus.emit({
      type: "event",
      channel: "shot_alarm",
      action,
      source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
      target: { type: "all", id: "*" },
      payload,
      meta: { requireAck: false, replayable: action === "overlay.show", ttlMs: action === "overlay.show" ? 30000 : 15000, ...meta }
    });
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return { ok: false, reason: "emit_failed", error: state.lastError };
  }
}

function normalizeUser(payload = {}) {
  const rawUserString = typeof payload.user === "string" ? payload.user : "";
  const user = payload.user && typeof payload.user === "object" ? payload.user : {};
  const gifter = payload.gifter && typeof payload.gifter === "object" ? payload.gifter : {};
  const from = payload.fromBroadcaster && typeof payload.fromBroadcaster === "object" ? payload.fromBroadcaster : {};
  const candidate = user.login || user.displayName || gifter.login || gifter.displayName || from.login || from.displayName || payload.userLogin || payload.userName || payload.userDisplayName || payload.displayName || payload.login || rawUserString || "";
  return {
    login: cleanString(user.login || gifter.login || from.login || payload.userLogin || payload.login || candidate).toLowerCase(),
    displayName: cleanString(user.displayName || gifter.displayName || from.displayName || payload.userDisplayName || payload.displayName || payload.userName || rawUserString || candidate, "Unbekannt")
  };
}

function subscriptionDedupeKey(payload = {}) {
  const user = normalizeUser(payload);
  const tier = cleanString(payload.tier || "unknown").toLowerCase();
  return `${user.login || user.displayName.toLowerCase()}:${tier}`;
}

function pickSound() {
  const overlayShot = config.sound && typeof config.sound.overlayShot === "object" ? config.sound.overlayShot : {};
  if (config.soundEnabled === false || overlayShot.enabled === false) return null;
  const soundList = Array.isArray(overlayShot.sounds)
    ? overlayShot.sounds
        .filter(item => item && typeof item === "object" && item.enabled !== false)
        .map(item => ({ ...item, mediaId: cleanString(item.mediaId || item.mediaAssetId || item.assetId || "") }))
        .filter(item => !!item.mediaId)
    : [];
  if (soundList.length > 0) {
    const selected = soundList[Math.floor(Math.random() * soundList.length)];
    return clone({
      ...overlayShot,
      ...selected,
      mediaId: selected.mediaId,
      mediaLabel: selected.mediaLabel || selected.label || "",
      label: selected.label || selected.mediaLabel || overlayShot.label || "Shot-Alarm Overlay-Einblendung",
      randomPoolSize: soundList.length
    });
  }
  const mediaId = cleanString(overlayShot.mediaId || overlayShot.mediaAssetId || overlayShot.assetId || "");
  if (!mediaId) return null;
  return clone({
    ...overlayShot,
    mediaId,
    mediaLabel: cleanString(overlayShot.mediaLabel || ""),
    label: overlayShot.label || overlayShot.mediaLabel || "Shot-Alarm Overlay-Einblendung",
    randomPoolSize: 1
  });
}

async function requestSound(sound, context) {
  if (config.soundEnabled === false || !sound) return { ok: false, skipped: true, reason: "sound_disabled_or_missing" };
  const mediaId = cleanString(sound.mediaId || sound.mediaAssetId || sound.assetId || "");
  if (!mediaId) {
    state.lastSound = { ok: false, skipped: true, reason: "sound_media_not_configured", at: nowIso() };
    return state.lastSound;
  }
  const endpoint = cleanString(config.sound.endpoint, "http://127.0.0.1:8080/api/sound/play-media");
  const body = {
    mediaId,
    label: sound.label || `Shot-Alarm ${context.eventLabel || ""}`.trim() || "Shot-Alarm Overlay-Einblendung",
    category: sound.category || config.sound.category || "alert",
    source: config.sound.source || MODULE_NAME,
    requestedBy: MODULE_NAME,
    target: sound.target || config.sound.target || "both",
    outputTarget: sound.outputTarget || config.sound.outputTarget || "device",
    queueIfBusy: config.sound.queueIfBusy !== false,
    dropIfBusy: config.sound.dropIfBusy === true,
    priority: Number(config.sound.priority || 80),
    volume: Number(sound.volume || config.sound.volume || 85),
    meta: {
      ...(sound.meta || {}),
      module: MODULE_NAME,
      shotAlarm: true,
      mediaId,
      mediaLabel: cleanString(sound.mediaLabel || ""),
      randomPoolSize: Number(sound.randomPoolSize || 0),
      soundRole: "overlay_shot_result",
      soundSystemQueue: true,
      triggerId: context.triggerId || "",
      drawId: context.drawId || "",
      historyId: context.historyId || "",
      eventType: context.eventType || "",
      user: context.user && context.user.displayName ? context.user.displayName : "",
      shotsAdded: Number(context.shotsAdded || 0)
    }
  };

  state.counts.soundRequests += 1;
  try {
    if (typeof fetch !== "function") {
      state.lastSound = { ok: false, skipped: true, reason: "fetch_unavailable", at: nowIso(), sound: body };
      return state.lastSound;
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    state.lastSound = { ok: response.ok, status: response.status, at: nowIso(), endpoint, sound: body, response: data };
    if (!response.ok) state.counts.soundErrors += 1;
    return state.lastSound;
  } catch (err) {
    state.counts.soundErrors += 1;
    state.lastSound = { ok: false, at: nowIso(), endpoint, error: err && err.message ? err.message : String(err), sound: body };
    state.lastError = state.lastSound.error;
    return state.lastSound;
  }
}

function buildStatusPayload() {
  return {
    type: "shot_alarm.status_bar",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    at: nowIso(),
    targetLabel: cleanString(config.targetLabel, "Engel & Roxxy"),
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsAddedTotal: state.shotsAddedTotal,
    pendingDraws: state.drawsPending.size,
    enabled: config.enabled !== false,
    overlayEnabled: config.overlayEnabled !== false,
    desiredActive: state.runtime.desiredActive === true,
    effectiveActive: state.runtime.effectiveActive === true,
    active: state.runtime.effectiveActive === true,
    visible: state.runtime.visible === true,
    streamLive: state.runtime.streamLive === true,
    streamSessionId: state.runtime.currentStreamSessionId,
    streamDayId: state.runtime.currentStreamDayId,
    streamDateLabel: state.runtime.streamDateLabel
  };
}

function sendStatusBar() {
  const payload = buildStatusPayload();
  if (typeof broadcastWS === "function") {
    try { broadcastWS(payload); } catch (err) { state.lastError = err && err.message ? err.message : String(err); }
  }
  emitBus("status_bar.update", payload);
  emitBus("overlay.state", buildOverlayStatePayload("status_bar"), { replayable: true, ttlMs: 60000 });
  return payload;
}

function sendOverlay(phase, summary) {
  if (config.overlayEnabled === false) return { ok: false, skipped: true, reason: "overlay_disabled" };
  if (!isRuntimeEffective()) {
    sendOverlayState("overlay_suppressed_inactive");
    return { ok: false, skipped: true, reason: "shot_alarm_inactive" };
  }
  const isDraw = phase === "draw";
  const isHit = Number(summary.shotsAdded || 0) > 0;
  const titleKey = isDraw ? "overlayDrawTitle" : isHit ? "overlayResultHitTitle" : "overlayResultMissTitle";
  const textKey = isDraw ? "overlayDrawText" : isHit ? "overlayResultHitText" : "overlayResultMissText";
  const payload = {
    type: isDraw ? "shot_alarm.draw" : "shot_alarm.result",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    at: nowIso(),
    phase,
    title: pickOverlayText(titleKey, summary) || cleanString(config.display.title, "SHOT-ALARM"),
    message: pickOverlayText(textKey, summary) || (isDraw ? "Die Heimleitung lost aus..." : isHit ? "Engel & Roxxy müssen ran!" : "Die Rentner-Leber wurde verschont."),
    holdMs: isDraw ? Number(config.display.drawHoldMs || config.display.drawDelayMs || 10000) : Number(config.display.resultHoldMs || config.display.holdMs || 10000),
    targetLabel: cleanString(config.targetLabel, "Engel & Roxxy"),
    summary: safeJson(summary),
    status: buildStatusPayload()
  };
  state.lastOverlay = payload;
  state.counts.overlayShows += 1;
  if (typeof broadcastWS === "function") {
    try { broadcastWS(payload); } catch (err) { state.lastError = err && err.message ? err.message : String(err); }
  }
  emitBus("overlay.show", payload);
  sendStatusBar();
  return { ok: true, payload };
}

function rollChance(chancePercent, options = {}) {
  const chance = clampPercent(chancePercent, 0);
  const roll = Number.isFinite(Number(options.forceRoll)) ? Math.max(0, Math.min(100, Number(options.forceRoll))) : Math.random() * 100;
  return { chancePercent: chance, rollValue: Number(roll.toFixed(4)), hit: chance >= 100 || roll < chance };
}

function buildRollsForInput(input = {}, options = {}) {
  const eventType = cleanString(input.eventType || input.type || "unknown");
  const total = Math.max(1, Math.floor(asNumber(input.total ?? input.amount ?? 1, 1)));
  const bits = Math.max(0, Math.floor(asNumber(input.bits, 0)));
  const amountEur = Math.max(0, asNumber(input.amountEur ?? input.amount_eur ?? input.amount, 0));
  const provider = cleanString(input.provider || input.source || "").toLowerCase();

  if (eventType === "sub") {
    return [buildSingleSupportRoll("single_sub", "Sub", config.rules.singleSubChancePercent, options)];
  }

  if (eventType === "resub") {
    return [buildSingleSupportRoll("resub", "Resub", config.rules.resubChancePercent, options)];
  }

  if (eventType === "gift_sub" || eventType === "subgift") {
    if (total >= 5) return buildGiftBombRolls(total, options);
    return [buildSingleSupportRoll("single_gift_sub", "GiftSub", config.rules.singleGiftSubChancePercent, options)];
  }

  if (eventType === "gift_bomb" || eventType === "giftbomb") {
    return buildGiftBombRolls(total, options);
  }

  if (eventType === "cheer" || eventType === "bits") {
    return buildBitsRolls(bits, options);
  }

  if (eventType === "payment" || eventType === "kofi" || eventType === "tipeee") {
    const paymentProvider = provider || eventType;
    const providerConfig = config.rules.payments && config.rules.payments.providers ? config.rules.payments.providers[paymentProvider] : null;
    if (!providerConfig || providerConfig.enabled === false || config.rules.payments.enabled === false) {
      return [{ kind: "payment", eventType, eventLabel: paymentProvider, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "payment_provider_disabled" }];
    }
    const eurPerShot = Math.max(1, asNumber(providerConfig.eurPerShot, 10));
    const fullBlocks = Math.floor(amountEur / eurPerShot);
    if (fullBlocks <= 0) {
      return [{ kind: "payment", eventType, eventLabel: `${paymentProvider.toUpperCase()} ${amountEur.toFixed(2)} EUR`, amountEur, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "below_payment_threshold" }];
    }
    const chancePercent = clampPercent(providerConfig.chancePercent, 50);
    const rolls = [];
    for (let i = 1; i <= fullBlocks; i += 1) {
      rolls.push({
        kind: "payment_10eur_block",
        eventType,
        eventLabel: `${paymentProvider.toUpperCase()} ${amountEur.toFixed(2)} EUR - 10EUR Block ${i}/${fullBlocks}`,
        amountEur,
        paymentBlock: i,
        paymentBlocks: fullBlocks,
        shots: 1,
        ...rollChance(chancePercent, options)
      });
    }
    return rolls;
  }

  return [{ kind: "unknown", eventType, eventLabel: eventType, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "unsupported_event_type" }];
}

function buildSingleSupportRoll(kind, label, normalChancePercent, options = {}) {
  const counter = Math.max(0, Math.floor(asNumber(options.singleSupportCounterOverride, state.singleSupportCounter + 1)));
  if (!Number.isFinite(Number(options.singleSupportCounterOverride))) {
    state.singleSupportCounter = counter;
    state.counts.singleSupportCounter = counter;
  }

  if (counter > 0 && counter % 10 === 0) {
    return {
      kind,
      eventType: kind === "resub" ? "resub" : kind === "single_gift_sub" ? "gift_sub" : "sub",
      eventLabel: `${counter}. ${label} - 10er-Schwelle`,
      singleSupportCounter: counter,
      shots: 1,
      chancePercent: clampPercent(config.rules.singleSupportTenChancePercent, 100),
      rollValue: 0,
      hit: true
    };
  }

  if (counter > 0 && counter % 5 === 0) {
    return {
      kind,
      eventType: kind === "resub" ? "resub" : kind === "single_gift_sub" ? "gift_sub" : "sub",
      eventLabel: `${counter}. ${label} - 5er-Schwelle`,
      singleSupportCounter: counter,
      shots: 1,
      ...rollChance(config.rules.singleSupportFiveChancePercent, options)
    };
  }

  return {
    kind,
    eventType: kind === "resub" ? "resub" : kind === "single_gift_sub" ? "gift_sub" : "sub",
    eventLabel: `${counter}. ${label}`,
    singleSupportCounter: counter,
    shots: 1,
    ...rollChance(normalChancePercent, options)
  };
}

function buildGiftBombRolls(total, options = {}) {
  const safeTotal = Math.max(1, Math.floor(asNumber(total, 1)));
  const guaranteedBlocks = Math.floor(safeTotal / 10);
  const rest = safeTotal % 10;
  const rolls = [];
  if (guaranteedBlocks > 0) {
    rolls.push({ kind: "gift_bomb_10_block", eventType: "gift_bomb", eventLabel: `${safeTotal}er Sub-Bombe`, total: safeTotal, shots: guaranteedBlocks * Math.max(1, Math.floor(asNumber(config.rules.giftBombTenBlockShots, 1))), chancePercent: 100, rollValue: 0, hit: true });
  }
  if (rest >= 5 || (safeTotal >= 5 && safeTotal < 10)) {
    const isPureFiveBomb = guaranteedBlocks === 0;
    rolls.push({
      kind: isPureFiveBomb ? "gift_bomb_5" : "gift_bomb_5_rest",
      eventType: "gift_bomb",
      eventLabel: isPureFiveBomb ? `${safeTotal}er Sub-Bombe` : `${safeTotal}er Sub-Bombe Rest-5er`,
      total: safeTotal,
      shots: 1,
      ...rollChance(config.rules.giftBombFiveChancePercent, options)
    });
  }
  if (!rolls.length) {
    rolls.push({ kind: "gift_bomb_below_5", eventType: "gift_bomb", eventLabel: `${safeTotal}er GiftSub`, total: safeTotal, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "gift_bomb_below_5" });
  }
  return rolls;
}

function buildBitsRolls(bits, options = {}) {
  const safeBits = Math.max(0, Math.floor(asNumber(bits, 0)));
  const bitsConfig = config.rules && config.rules.bits && typeof config.rules.bits === "object" && !Array.isArray(config.rules.bits)
    ? config.rules.bits
    : DEFAULT_CONFIG.rules.bits;

  if (bitsConfig.enabled === false) {
    return [{ kind: "bits", eventType: "cheer", eventLabel: `${safeBits} Bits`, bits: safeBits, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "bits_disabled" }];
  }

  const tenThousandSize = Math.max(1, Math.floor(asNumber(bitsConfig.perTenThousandBits, 10000)));
  const thousandSize = Math.max(1, Math.floor(asNumber(bitsConfig.perThousandBits, 1000)));
  const tenThousandBlocks = Math.floor(safeBits / tenThousandSize);
  const restBits = safeBits % tenThousandSize;
  const thousandBlocks = Math.floor(restBits / thousandSize);
  const rolls = [];

  if (tenThousandBlocks > 0) {
    rolls.push({
      kind: "bits_10000_block",
      eventType: "cheer",
      eventLabel: `${safeBits} Bits - ${tenThousandBlocks}x 10000er-Block`,
      bits: safeBits,
      bitsBlock: 10000,
      bitsBlocks: tenThousandBlocks,
      shots: tenThousandBlocks * Math.max(1, Math.floor(asNumber(bitsConfig.tenThousandShots, 1))),
      chancePercent: clampPercent(bitsConfig.tenThousandChancePercent, 100),
      rollValue: 0,
      hit: true
    });
  }

  for (let i = 1; i <= thousandBlocks; i += 1) {
    rolls.push({
      kind: "bits_1000_block",
      eventType: "cheer",
      eventLabel: `${safeBits} Bits - 1000er 50/50 Block ${i}/${thousandBlocks}`,
      bits: safeBits,
      bitsBlock: 1000,
      bitsBlocks: thousandBlocks,
      shots: 1,
      ...rollChance(bitsConfig.thousandChancePercent, options)
    });
  }

  if (!rolls.length) {
    return [{ kind: "bits", eventType: "cheer", eventLabel: `${safeBits} Bits`, bits: safeBits, shots: 0, chancePercent: 0, rollValue: 0, hit: false, skippedReason: "no_bits_rule" }];
  }

  return rolls;
}

function normalizeEnvelope(envelope = {}) {
  const channel = cleanString(envelope.channel || "");
  const action = cleanString(envelope.action || "");
  const payload = envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {};
  const eventKey = `${channel}.${action}`;
  let eventType = "unknown";
  if (eventKey === "twitch.sub.received") eventType = "sub";
  if (eventKey === "twitch.resub.received") eventType = "resub";
  if (eventKey === "twitch.subgift.received") eventType = Number(payload.total || 1) >= 5 ? "gift_bomb" : "gift_sub";
  if (eventKey === "twitch.giftbomb.received") eventType = "gift_bomb";
  if (eventKey === "twitch.cheer.received") eventType = "cheer";
  if (eventKey === "payment.kofi.received") eventType = "kofi";
  if (eventKey === "payment.tipeee.received") eventType = "tipeee";
  return { eventKey, channel, action, payload, eventType };
}

function processEnvelope(envelope, options = {}) {
  ensureCurrentStreamRuntime("event_received");
  if (config.enabled === false && options.force !== true) {
    state.counts.skipped += 1;
    return { ok: false, reason: "module_disabled" };
  }
  if (!isRuntimeEffective(options)) {
    state.counts.skipped += 1;
    publishStatus("event_skipped_inactive");
    return { ok: false, reason: "shot_alarm_inactive", runtime: buildOverlayStatePayload("event_skipped_inactive") };
  }
  const normalized = normalizeEnvelope(envelope);
  const input = {
    ...normalized.payload,
    eventType: normalized.eventType,
    provider: normalized.eventType === "kofi" || normalized.eventType === "tipeee" ? normalized.eventType : ""
  };
  return processInput(input, { ...options, eventKey: normalized.eventKey, busEventId: envelope.id || "" });
}

function summarizeRolls(input = {}, rolls = [], options = {}) {
  const user = normalizeUser(input);
  const eventType = cleanString(input.eventType || input.type || "unknown");
  const total = Math.max(0, Math.floor(asNumber(input.total ?? input.amount ?? 0, 0)));
  const bits = Math.max(0, Math.floor(asNumber(input.bits, 0)));
  const amountEur = Math.max(0, asNumber(input.amountEur ?? input.amount_eur ?? input.amount, 0));
  const shotsAdded = rolls.reduce((sum, roll) => sum + (roll.hit ? Math.max(0, Math.floor(asNumber(roll.shots, 0))) : 0), 0);
  const rollHits = rolls.filter(roll => roll.hit && Math.max(0, Math.floor(asNumber(roll.shots, 0))) > 0).length;
  const rollMisses = rolls.length - rollHits;
  const firstLabel = rolls[0] && rolls[0].eventLabel ? rolls[0].eventLabel : eventType;
  const labels = rolls.map(roll => roll.eventLabel).filter(Boolean);
  let eventLabel = firstLabel;
  if (eventType === "cheer" || eventType === "bits") eventLabel = `${bits.toLocaleString("de-DE")} Bits`;
  if (eventType === "gift_bomb" || eventType === "giftbomb") eventLabel = `${total}er Sub-Bombe`;
  if (eventType === "kofi") eventLabel = `Ko-fi ${amountEur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
  if (eventType === "tipeee") eventLabel = `Tipeee ${amountEur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
  const chanceParts = [];
  const sure = rolls.filter(roll => Number(roll.chancePercent) >= 100).reduce((sum, roll) => sum + Math.max(0, Math.floor(asNumber(roll.shots, 0))), 0);
  const fifty = rolls.filter(roll => Number(roll.chancePercent) === 50).length;
  const twenty = rolls.filter(roll => Number(roll.chancePercent) === 20).length;
  if (sure) chanceParts.push(`${sure} sicher`);
  if (fifty) chanceParts.push(`${fifty}x 50/50`);
  if (twenty) chanceParts.push(`${twenty}x 20%`);
  const summary = {
    id: `draw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    triggerId: `trigger_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: nowIso(),
    eventKey: options.eventKey || "manual.test",
    busEventId: options.busEventId || "",
    eventType,
    user,
    targetMode: config.targetMode,
    targetLabel: cleanString(config.targetLabel, "Engel & Roxxy"),
    eventLabel,
    amountLabel: formatAmountLabel({ eventType, eventLabel, total, bits, amountEur }),
    chanceSummary: chanceParts.join(" + ") || "keine passende Regel",
    rollsTotal: rolls.length,
    rollHits,
    rollMisses,
    shotsAdded,
    shotsOpenBefore: state.shotsOpen,
    shotsOpenAfter: state.shotsOpen + shotsAdded,
    total,
    bits,
    amountEur,
    singleSupportCounter: Math.max(...rolls.map(roll => Number(roll.singleSupportCounter || 0)), 0),
    skippedReason: shotsAdded > 0 ? "" : (rolls.find(roll => roll.skippedReason)?.skippedReason || "no_shot_hit"),
    rollDetails: rolls.map((roll, index) => ({ index: index + 1, ...safeJson(roll) })),
    raw: options.includeRaw === true ? safeJson(input) : undefined,
    phase: "prepared"
  };
  return summary;
}

function rememberRollStats(rolls = [], shotsAdded = 0) {
  for (const roll of rolls) {
    state.counts.rolls += 1;
    const shots = roll.hit ? Math.max(0, Math.floor(asNumber(roll.shots, 0))) : 0;
    if (roll.hit && shots > 0) state.counts.hits += 1;
    else state.counts.misses += 1;
  }
  state.counts.shots += Math.max(0, Math.floor(asNumber(shotsAdded, 0)));
}

function startDraw(summary, options = {}) {
  const drawEntry = addHistory({ ...summary, phase: "draw_started", shotsOpenAfter: summary.shotsOpenBefore });
  state.lastDraw = drawEntry;
  state.lastEvent = drawEntry;
  state.counts.drawsStarted += 1;
  emitBus("draw.started", drawEntry);
  if (config.chat && config.chat.sendDrawStart !== false) sendChatText("drawStart", summary).catch(() => {});
  sendOverlay("draw", summary);
  const delay = Math.max(0, Number(config.display.drawDelayMs || 10000));
  if (options.immediate === true || delay <= 0) return resolveDraw(summary.id, options);
  const timer = setTimeout(() => resolveDraw(summary.id, options), delay);
  if (timer && typeof timer.unref === "function") timer.unref();
  state.drawsPending.set(summary.id, { summary, timer, at: nowIso() });
  publishStatus("draw_started");
  return { ok: true, pending: true, draw: drawEntry, summary: safeJson(summary), status: publicStatus() };
}

async function resolveDraw(drawId, options = {}) {
  const pending = state.drawsPending.get(drawId);
  const summary = pending ? pending.summary : options.summary;
  if (!summary) return { ok: false, reason: "draw_not_found", drawId };
  if (pending && pending.timer) clearTimeout(pending.timer);
  state.drawsPending.delete(drawId);

  const shotsAdded = Math.max(0, Math.floor(asNumber(summary.shotsAdded, 0)));
  if (shotsAdded > 0) {
    state.shotsOpen += shotsAdded;
    state.shotsAddedTotal += shotsAdded;
  }
  state.counts.shotsOpen = state.shotsOpen;
  state.counts.shotsAddedTotal = state.shotsAddedTotal;
  const resultSummary = {
    ...summary,
    phase: "resolved",
    resolvedAt: nowIso(),
    shotsOpenBefore: summary.shotsOpenBefore,
    shotsOpenAfter: state.shotsOpen,
    shotsOpen: state.shotsOpen,
    shotsDrunk: state.shotsDrunk,
    shotsTotal: state.shotsAddedTotal
  };
  const entry = addHistory(resultSummary);
  state.lastResult = entry;
  state.lastEvent = entry;
  if (shotsAdded > 0) state.lastShot = entry;
  state.counts.drawsResolved += 1;
  emitBus("draw.resolved", entry);
  if (shotsAdded > 0) emitBus("triggered", entry);
  if (shotsAdded > 0 && config.chat && config.chat.sendResultHit !== false) sendChatText("resultHit", resultSummary).catch(() => {});
  if (shotsAdded <= 0 && config.chat && config.chat.sendResultMiss !== false) sendChatText("resultMiss", resultSummary).catch(() => {});
  sendOverlay("result", resultSummary);
  if (shotsAdded > 0) requestSound(pickSound(), resultSummary).catch(() => {});
  saveRuntimeState("draw_resolved");
  publishStatus("draw_resolved");
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result: [entry], summary: entry, status: publicStatus() };
}

function processInput(input = {}, options = {}) {
  ensureCurrentStreamRuntime("process_input");
  state.counts.received += options.countReceived === false ? 0 : 1;
  state.counts.processed += 1;
  state.updatedAt = nowIso();
  const eventType = cleanString(input.eventType || input.type || "unknown");
  increment(state.counts.byType, eventType);
  increment(state.counts.bySource, cleanString(options.eventKey || input.source || "manual"));

  const rolls = buildRollsForInput(input, options);
  const summary = summarizeRolls(input, rolls, options);
  rememberRollStats(rolls, summary.shotsAdded);
  const result = startDraw(summary, { ...options, summary, immediate: options.immediate === true });
  saveRuntimeState("event_processed");
  publishStatus("event_processed");
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result: result.result || result.draw ? [result.result || result.draw].filter(Boolean) : [], summary: result.summary || summary, pending: !!result.pending, status: publicStatus() };
}

function receiveBusEvent(envelope) {
  const normalized = normalizeEnvelope(envelope);
  if (normalized.eventType === "unknown") {
    state.counts.skipped += 1;
    return { ok: false, reason: "unsupported_event", eventKey: normalized.eventKey };
  }

  if (normalized.eventType === "sub" && config.dedupe.subscribeResubBufferEnabled !== false) {
    const key = subscriptionDedupeKey(normalized.payload);
    const delay = Math.max(0, Number(config.dedupe.subscribeResubBufferMs || 60000));
    clearPendingSub(key, "replace_pending_sub");
    const timer = setTimeout(() => {
      state.pendingSubTimers.delete(key);
      const pending = state.pendingSubEvents.get(key);
      state.pendingSubEvents.delete(key);
      if (pending) processEnvelope(pending.envelope, { eventKey: pending.eventKey, busEventId: pending.envelope.id || "", countReceived: true });
    }, delay);
    state.pendingSubTimers.set(key, timer);
    state.pendingSubEvents.set(key, { envelope, eventKey: normalized.eventKey, at: nowIso() });
    state.counts.pending = state.pendingSubEvents.size;
    state.lastEvent = { at: nowIso(), eventKey: normalized.eventKey, pending: true, dedupeKey: key, delayMs: delay };
    publishStatus("sub_pending");
    return { ok: true, pending: true, dedupeKey: key, delayMs: delay };
  }

  if (normalized.eventType === "resub" && config.dedupe.subscribeResubBufferEnabled !== false) {
    const key = subscriptionDedupeKey(normalized.payload);
    clearPendingSub(key, "resub_won_collision");
  }

  return processEnvelope(envelope, { eventKey: normalized.eventKey, busEventId: envelope.id || "" });
}

function clearPendingSub(key, reason = "cleared") {
  const clean = cleanString(key);
  if (!clean) return false;
  const timer = state.pendingSubTimers.get(clean);
  if (timer) clearTimeout(timer);
  const existed = state.pendingSubEvents.has(clean);
  state.pendingSubTimers.delete(clean);
  state.pendingSubEvents.delete(clean);
  state.counts.pending = state.pendingSubEvents.size;
  if (existed) addHistory({ eventType: "dedupe", kind: "pending_sub_cleared", dedupeKey: clean, reason, hit: false, shots: 0 });
  return existed;
}

function flushPending() {
  const pending = [...state.pendingSubEvents.entries()];
  for (const [key, item] of pending) {
    clearPendingSub(key, "manual_flush");
    if (item && item.envelope) processEnvelope(item.envelope, { eventKey: item.eventKey, busEventId: item.envelope.id || "", countReceived: true });
  }
  return pending.length;
}

function resetState() {
  for (const key of [...state.pendingSubTimers.keys()]) clearPendingSub(key, "reset_state");
  state.history = [];
  state.singleSupportCounter = 0;
  state.lastEvent = null;
  state.lastShot = null;
  state.lastOverlay = null;
  state.lastSound = null;
  state.lastDraw = null;
  state.lastResult = null;
  state.shotsOpen = 0;
  state.shotsDrunk = 0;
  state.shotsAddedTotal = 0;
  for (const item of [...state.drawsPending.values()]) if (item && item.timer) clearTimeout(item.timer);
  state.drawsPending.clear();
  state.lastError = "";
  state.lastWarning = "";
  state.counts = {
    received: 0,
    processed: 0,
    skipped: 0,
    pending: 0,
    rolls: 0,
    hits: 0,
    misses: 0,
    shots: 0,
    overlayShows: 0,
    soundRequests: 0,
    soundErrors: 0,
    chatMessages: 0,
    chatErrors: 0,
    drawsStarted: 0,
    drawsResolved: 0,
    shotsOpen: 0,
    shotsDrunk: 0,
    shotsAddedTotal: 0,
    singleSupportCounter: 0,
    byType: {},
    bySource: {}
  };
  state.updatedAt = nowIso();
  publishStatus("reset_state");
}

function subscribeBus(channel) {
  if (!bus || typeof bus.subscribe !== "function") return null;
  const result = bus.subscribe({ id: `${MODULE_NAME}:${channel}:received`, module: MODULE_NAME, channel, action: "received" }, receiveBusEvent);
  if (result && result.ok && result.subscription) state.subscriptions.push(result.subscription);
  return result;
}

function registerBus() {
  try {
    bus = communicationBus.getBus();
    state.busAvailable = !!bus;
    if (!bus) return;
    if (typeof bus.registerModule === "function") {
      const result = bus.registerModule({
        id: `module:${MODULE_NAME}`,
        module: MODULE_NAME,
        name: "Shot-Alarm",
        version: MODULE_VERSION,
        capabilities: [...MODULE_META.bus.consumes, ...MODULE_META.bus.publishes],
        meta: { build: MODULE_BUILD, role: "support-shot-runtime" }
      });
      state.registeredOnBus = result && result.ok === true;
    }
    ["twitch.sub", "twitch.resub", "twitch.subgift", "twitch.giftbomb", "twitch.cheer", "payment.kofi", "payment.tipeee"].forEach(subscribeBus);
    ["online", "offline", "updated"].forEach(action => {
      const result = bus.subscribe({ id: `${MODULE_NAME}:twitch.stream:${action}`, module: MODULE_NAME, channel: "twitch.stream", action }, () => {
        ensureCurrentStreamRuntime(`twitch_stream_${action}`);
        sendOverlayState(`twitch_stream_${action}`);
        return { ok: true };
      });
      if (result && result.ok && result.subscription) state.subscriptions.push(result.subscription);
    });
    if (typeof bus.heartbeatModule === "function") bus.heartbeatModule(MODULE_NAME, { module: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD, runtime: buildOverlayStatePayload("heartbeat") });
    publishStatus("init");
    heartbeatTimer = setInterval(() => {
      if (bus && typeof bus.heartbeatModule === "function") bus.heartbeatModule(MODULE_NAME, { module: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD, counts: state.counts, runtime: buildOverlayStatePayload("heartbeat") });
      publishStatus("heartbeat");
      sendOverlayState("heartbeat");
    }, 30000);
    if (heartbeatTimer && typeof heartbeatTimer.unref === "function") heartbeatTimer.unref();
  } catch (err) {
    state.busAvailable = false;
    state.lastError = err && err.message ? err.message : String(err);
  }
}

function init(ctx = {}) {
  const app = ctx.app;
  broadcastWS = typeof ctx.broadcastWS === "function" ? ctx.broadcastWS : null;
  loadConfig();
  loadRuntimeState();
  registerBus();
  state.initialized = true;
  state.updatedAt = nowIso();

  if (!app) return;
  const routes = [];
  const get = (path, handler) => { app.get(path, handler); routes.push(`GET ${path}`); };
  const post = (path, handler) => { app.post(path, handler); routes.push(`POST ${path}`); };

  get("/api/shot-alarm/status", (req, res) => res.json(publicStatus()));
  get("/api/shot-alarm/streams", (req, res) => res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, currentStreamSessionId: state.runtime.currentStreamSessionId, streams: listStreamSessions() }));
  post("/api/shot-alarm/start", (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const payload = setRuntimeActive(true, body.actor || {}, "dashboard_start");
    logDashboardAction(req, { action: "shot_alarm.start", result: "ok", message: "Shot-Alarm activated", details: { desiredActive: true, effectiveActive: payload.effectiveActive, streamSessionId: payload.streamSessionId } });
    res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, runtime: payload, status: publicStatus() });
  });
  post("/api/shot-alarm/stop", (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const payload = setRuntimeActive(false, body.actor || {}, "dashboard_stop");
    logDashboardAction(req, { action: "shot_alarm.stop", result: "ok", message: "Shot-Alarm deactivated", details: { desiredActive: false, effectiveActive: payload.effectiveActive, streamSessionId: payload.streamSessionId } });
    res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, runtime: payload, status: publicStatus() });
  });
  get("/api/shot-alarm/dashboard-audit", (req, res) => {
    const limit = Math.max(0, Math.min(Number(req.query && req.query.limit || 50), 200));
    res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, audit: publicAuditStatus(), entries: auditLogger.getRecent(limit, { module: MODULE_NAME }) });
  });
  get("/api/shot-alarm/config", (req, res) => res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, config, path: state.configPath }));
  post("/api/shot-alarm/config", (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const next = saveConfig(body);
      logDashboardAction(req, { action: "shot_alarm.config.save", category: "config", result: "ok", message: "Shot-Alarm config saved", details: { changedKeys: Object.keys(body).filter(k => !["actor", "actorId", "actorName", "actorRoles"].includes(k)), configSource: state.configSource } });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, config: next, status: publicStatus() });
    } catch (err) {
      logDashboardAction(req, { action: "shot_alarm.config.save", category: "config", result: "failed", level: "error", message: "Shot-Alarm config save failed", details: { error: err && err.message ? err.message : String(err) } });
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  get("/api/shot-alarm/history", (req, res) => {
    const limit = Number(req.query && req.query.limit || config.historyLimit || HISTORY_LIMIT);
    const streamSessionId = cleanString(req.query && req.query.streamSessionId || "current");
    const stored = listStoredHistory(limit, { streamSessionId });
    const items = stored.length ? stored : state.history.map(publicHistoryItem);
    res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, streamSessionId, items, source: stored.length ? "database" : "runtime", pending: [...state.pendingSubEvents.values()].map(item => ({ at: item.at, eventKey: item.eventKey })) });
  });
  get("/api/shot-alarm/stats", (req, res) => res.json(buildStats({ streamSessionId: cleanString(req.query && req.query.streamSessionId || "current") })));
  get("/api/shot-alarm/texts", (req, res) => {
    try {
      ensureTextVariants();
      res.json(textHelper.listModuleTextEditor(TEXT_MODULE, DEFAULT_TEXT_VARIANTS, TEXT_OPTIONS));
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  post("/api/shot-alarm/texts", (req, res) => {
    try {
      ensureTextVariants();
      const body = req.body || {};
      const result = textHelper.handleModuleTextEditorPayload(TEXT_MODULE, body, TEXT_OPTIONS);
      logDashboardAction(req, { action: `shot_alarm.texts.${cleanString(body.action, "update")}`, category: "config", result: "ok", message: "Shot-Alarm text variants changed", details: { textAction: cleanString(body.action, "update"), key: body.variant && body.variant.key ? body.variant.key : "", id: body.id || body.variant?.id || 0 } });
      res.json(result);
    } catch (err) {
      logDashboardAction(req, { action: "shot_alarm.texts.update", category: "config", result: "failed", level: "error", message: "Shot-Alarm text update failed", details: { error: err && err.message ? err.message : String(err) } });
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  post("/api/shot-alarm/test", (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const result = processInput({ ...body, eventType: cleanString(body.eventType || body.type || "sub") }, { force: true, forceRoll: body.forceRoll, immediate: body.immediate === true, includeRaw: true, eventKey: "manual.test", countReceived: true });
      logDashboardAction(req, { action: "shot_alarm.test", result: "ok", message: "Shot-Alarm synthetic test triggered", details: { type: cleanString(body.type || body.eventType || "sub"), bits: asNumber(body.bits, 0), amountEur: asNumber(body.amountEur, 0), immediate: body.immediate === true } });
      res.json(result);
    } catch (err) {
      logDashboardAction(req, { action: "shot_alarm.test", result: "failed", level: "error", message: "Shot-Alarm synthetic test failed", details: { error: err && err.message ? err.message : String(err) } });
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  post("/api/shot-alarm/manual-trigger", (req, res) => {
    const confirm = requireConfirmWrite(req, "manual-trigger");
    if (!confirm.ok) return res.status(confirm.status).json(confirm.payload);
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const shots = Math.max(1, Math.floor(asNumber(body.shots, 1)));
      const trigger = {
        triggerId: `manual_${Date.now().toString(36)}`,
        eventKey: "manual.trigger",
        eventType: "manual",
        kind: "manual",
        eventLabel: cleanString(body.reason || body.label, "Manueller Shot-Alarm"),
        user: { login: "manual", displayName: cleanString(body.user || body.displayName, "Dashboard") },
        targetMode: config.targetMode,
        targetLabel: config.targetLabel,
        chancePercent: 100,
        rollValue: 0,
        hit: true,
        shots
      };
      const entry = addHistory(trigger);
      state.counts.hits += 1;
      state.counts.shots += shots;
      state.shotsOpen += shots;
      state.shotsAddedTotal += shots;
      state.counts.shotsOpen = state.shotsOpen;
      state.counts.shotsAddedTotal = state.shotsAddedTotal;
      state.lastShot = entry;
      sendOverlay("result", { ...trigger, shotsAdded: shots, shotsOpen: state.shotsOpen, amountLabel: trigger.eventLabel, user: trigger.user });
      requestSound(pickSound(), trigger).catch(() => {});
      emitBus("triggered", entry);
      saveRuntimeState("manual_trigger");
      publishStatus("manual_trigger");
      logDashboardAction(req, { action: "shot_alarm.manual_trigger", result: "ok", message: "Manual Shot-Alarm triggered", details: { shots, reason: trigger.eventLabel, shotsOpen: state.shotsOpen } });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, trigger: entry, status: publicStatus() });
    } catch (err) {
      logDashboardAction(req, { action: "shot_alarm.manual_trigger", result: "failed", level: "error", message: "Manual Shot-Alarm trigger failed", details: { error: err && err.message ? err.message : String(err) } });
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  get("/api/shot-alarm/status-bar", (req, res) => res.json({ ok: true, module: MODULE_NAME, statusBar: buildStatusPayload() }));
  post("/api/shot-alarm/resolve-pending", async (req, res) => {
    const confirm = requireConfirmWrite(req, "resolve-pending");
    if (!confirm.ok) return res.status(confirm.status).json(confirm.payload);
    try {
      const ids = [...state.drawsPending.keys()];
      const results = [];
      for (const id of ids) results.push(await resolveDraw(id, {}));
      logDashboardAction(req, { action: "shot_alarm.resolve_pending", result: "ok", message: "Pending Shot-Alarm draws resolved", details: { resolved: results.length } });
      res.json({ ok: true, module: MODULE_NAME, resolved: results.length, results, status: publicStatus() });
    } catch (err) {
      logDashboardAction(req, { action: "shot_alarm.resolve_pending", result: "failed", level: "error", message: "Pending Shot-Alarm resolve failed", details: { error: err && err.message ? err.message : String(err) } });
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  post("/api/shot-alarm/shot-done", (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const count = Math.max(1, Math.floor(asNumber(body.count, 1)));
    const done = Math.min(count, state.shotsOpen);
    if (done > 0) {
      state.shotsOpen -= done;
      state.shotsDrunk += done;
      state.counts.shotsOpen = state.shotsOpen;
      state.counts.shotsDrunk = state.shotsDrunk;
      const entry = addHistory({ eventType: "shot_done", kind: "shot_done", done, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, user: { login: cleanString(body.user || "manual"), displayName: cleanString(body.user || body.displayName, "Dashboard") } });
      state.lastEvent = entry;
      sendChatText("shotDone", { ...entry, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, user: entry.user }).catch(() => {});
      sendStatusBar();
      saveRuntimeState("shot_done");
      publishStatus("shot_done");
      logDashboardAction(req, { action: "shot_alarm.shot_done", result: "ok", message: "Shot marked as done", details: { requested: count, done, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, user: entry.user.displayName } });
      return res.json({ ok: true, module: MODULE_NAME, done, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, status: publicStatus() });
    }
    sendChatText("shotDoneEmpty", { user: { login: cleanString(body.user || "manual"), displayName: cleanString(body.user || body.displayName, "Dashboard") }, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk }).catch(() => {});
    sendStatusBar();
    logDashboardAction(req, { action: "shot_alarm.shot_done", result: "skipped", message: "Shot done skipped, no open shots", details: { requested: count, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk } });
    return res.json({ ok: true, module: MODULE_NAME, done: 0, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, skippedReason: "no_open_shots", status: publicStatus() });
  });
  post("/api/shot-alarm/flush-pending", (req, res) => {
    const confirm = requireConfirmWrite(req, "flush-pending");
    if (!confirm.ok) return res.status(confirm.status).json(confirm.payload);
    const flushed = flushPending();
    logDashboardAction(req, { action: "shot_alarm.flush_pending", result: "ok", message: "Pending Shot-Alarm support buffer flushed", details: { flushed } });
    res.json({ ok: true, module: MODULE_NAME, flushed, status: publicStatus() });
  });
  post("/api/shot-alarm/reset-state", (req, res) => {
    const confirm = requireConfirmWrite(req, "reset-state");
    if (!confirm.ok) return res.status(confirm.status).json(confirm.payload);
    resetState();
    saveRuntimeState("reset_state");
    sendStatusBar();
    sendOverlayState("reset_state");
    logDashboardAction(req, { action: "shot_alarm.reset_state", level: "warn", result: "ok", message: "Shot-Alarm runtime state reset", details: { reset: true } });
    res.json({ ok: true, module: MODULE_NAME, status: publicStatus() });
  });

  state.routeCount = routes.length;
  console.log(`[${MODULE_NAME}] loaded v${MODULE_VERSION} build=${MODULE_BUILD} routes=${state.routeCount}`);
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  _private: {
    DEFAULT_CONFIG,
    buildGiftBombRolls,
    buildSingleSupportRoll,
    buildRollsForInput,
    buildBitsRolls,
    summarizeRolls,
    normalizeEnvelope,
    processInput,
    resetState
  }
};
