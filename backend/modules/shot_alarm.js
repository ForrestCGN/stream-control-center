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
let chatOutputHelper = null;
try { chatOutputHelper = require("./helpers/helper_chat_output"); } catch (_) { chatOutputHelper = null; }

const MODULE_NAME = "shot_alarm";
const MODULE_VERSION = "0.2.0";
const MODULE_BUILD = "STEP_SHOT_ALARM_2A_AGGREGATED_DRAW_OVERLAY_COUNTER";
const CONFIG_FILE = "shot_alarm.json";
const HISTORY_LIMIT = 200;

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "events",
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
      "shot_alarm.status_bar.update"
    ]
  },
  description: "Shot-Alarm fuer Twitch-Support-Events mit gebuendelter Auslosung, Counter, Overlay-Statusleiste und Altersheim-/Heimleitungs-Texten."
};

const DEFAULT_CONFIG = {
  enabled: true,
  overlayEnabled: true,
  soundEnabled: true,
  dashboardCategory: "events",
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
    endpoint: "http://127.0.0.1:8080/api/sound/play",
    category: "fun",
    source: "shot_alarm",
    target: "stream",
    outputTarget: "overlay",
    queueIfBusy: true,
    dropIfBusy: false,
    priority: 80,
    sounds: [
      {
        type: "generated_beep",
        label: "Shot-Alarm Test-Beep",
        durationMs: 900,
        frequency: 880,
        volume: 0.35
      }
    ]
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
  history: []
};

let config = clone(DEFAULT_CONFIG);
let bus = null;
let broadcastWS = null;
let heartbeatTimer = null;

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
  const fallback = key === "drawStart"
    ? "🚨 Heimleitung meldet: {user} hat {amountLabel} in den Rentner-Automaten geworfen. Die Shot-Auslosung läuft..."
    : key === "resultMiss"
      ? "😇 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} – kein Shot."
      : "🥃 Ergebnis der Heimleitungs-Auslosung: {amountLabel} von {user} ergibt {shotsAdded} Shot(s). Offen: {shotsOpen}.";
  return replaceTokens(randomFrom(config.texts && config.texts[key], fallback), values);
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

function loadConfig() {
  const loaded = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, spaces: 2 });
  config = deepMerge(DEFAULT_CONFIG, loaded && loaded.data ? loaded.data : {});
  const migrated = applyFinalRuleDefaults();
  config.enabled = config.enabled !== false;
  state.enabled = config.enabled;
  state.configPath = loaded && loaded.path ? loaded.path : cfg.resolveConfigFile(CONFIG_FILE);
  if (migrated) {
    try { cfg.writeJsonFile(state.configPath, config, { spaces: 2 }); } catch (err) { state.lastWarning = `config_migration_save_failed: ${err && err.message ? err.message : String(err)}`; }
  }
  state.updatedAt = nowIso();
  return config;
}

function saveConfig(nextConfig) {
  const merged = deepMerge(DEFAULT_CONFIG, nextConfig || {});
  cfg.writeJsonFile(cfg.resolveConfigFile(CONFIG_FILE), merged, { spaces: 2 });
  config = merged;
  state.enabled = config.enabled !== false;
  state.updatedAt = nowIso();
  publishStatus("config_saved");
  return config;
}

function publicHistoryItem(item) {
  return safeJson(item) || {};
}

function addHistory(item) {
  const entry = {
    id: `shot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: nowIso(),
    ...safeJson(item)
  };
  state.history.unshift(entry);
  const limit = Math.max(20, Math.min(1000, Number(config.historyLimit || HISTORY_LIMIT)));
  state.history = state.history.slice(0, limit);
  return entry;
}

function publicStatus() {
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
  const sounds = Array.isArray(config.sound && config.sound.sounds) ? config.sound.sounds.filter(Boolean) : [];
  if (!sounds.length) return null;
  return clone(sounds[Math.floor(Math.random() * sounds.length)]);
}

async function requestSound(sound, context) {
  if (config.soundEnabled === false || !sound) return { ok: false, skipped: true, reason: "sound_disabled_or_missing" };
  const endpoint = cleanString(config.sound.endpoint, "http://127.0.0.1:8080/api/sound/play");
  const body = {
    ...sound,
    label: sound.label || `Shot-Alarm ${context.eventLabel || ""}`.trim(),
    category: sound.category || config.sound.category || "fun",
    source: config.sound.source || MODULE_NAME,
    requestedBy: MODULE_NAME,
    target: sound.target || config.sound.target || "stream",
    outputTarget: sound.outputTarget || config.sound.outputTarget || "overlay",
    queueIfBusy: config.sound.queueIfBusy !== false,
    dropIfBusy: config.sound.dropIfBusy === true,
    priority: Number(config.sound.priority || 80),
    meta: {
      ...(sound.meta || {}),
      module: MODULE_NAME,
      shotAlarm: true,
      triggerId: context.triggerId || "",
      eventType: context.eventType || ""
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
    state.lastSound = { ok: response.ok, status: response.status, at: nowIso(), sound: body, response: data };
    if (!response.ok) state.counts.soundErrors += 1;
    return state.lastSound;
  } catch (err) {
    state.counts.soundErrors += 1;
    state.lastSound = { ok: false, at: nowIso(), error: err && err.message ? err.message : String(err), sound: body };
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
    enabled: config.enabled !== false
  };
}

function sendStatusBar() {
  const payload = buildStatusPayload();
  if (typeof broadcastWS === "function") {
    try { broadcastWS(payload); } catch (err) { state.lastError = err && err.message ? err.message : String(err); }
  }
  emitBus("status_bar.update", payload);
  return payload;
}

function sendOverlay(phase, summary) {
  if (config.overlayEnabled === false) return { ok: false, skipped: true, reason: "overlay_disabled" };
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
    title: randomFrom(config.texts && config.texts[titleKey], cleanString(config.display.title, "SHOT-ALARM")),
    message: randomFrom(config.texts && config.texts[textKey], isDraw ? "Die Heimleitung lost aus..." : isHit ? "Engel & Roxxy müssen ran!" : "Die Rentner-Leber wurde verschont."),
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
  if (config.enabled === false && options.force !== true) {
    state.counts.skipped += 1;
    return { ok: false, reason: "module_disabled" };
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
  publishStatus("draw_resolved");
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result: [entry], summary: entry, status: publicStatus() };
}

function processInput(input = {}, options = {}) {
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
    if (typeof bus.heartbeatModule === "function") bus.heartbeatModule(MODULE_NAME, { module: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD });
    publishStatus("init");
    heartbeatTimer = setInterval(() => {
      if (bus && typeof bus.heartbeatModule === "function") bus.heartbeatModule(MODULE_NAME, { module: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD, counts: state.counts });
      publishStatus("heartbeat");
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
  registerBus();
  state.initialized = true;
  state.updatedAt = nowIso();

  if (!app) return;
  const routes = [];
  const get = (path, handler) => { app.get(path, handler); routes.push(`GET ${path}`); };
  const post = (path, handler) => { app.post(path, handler); routes.push(`POST ${path}`); };

  get("/api/shot-alarm/status", (req, res) => res.json(publicStatus()));
  get("/api/shot-alarm/config", (req, res) => res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, config, path: state.configPath }));
  post("/api/shot-alarm/config", (req, res) => {
    try {
      const next = saveConfig(req.body && typeof req.body === "object" ? req.body : {});
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, config: next, status: publicStatus() });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  get("/api/shot-alarm/history", (req, res) => res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, items: state.history.map(publicHistoryItem), pending: [...state.pendingSubEvents.values()].map(item => ({ at: item.at, eventKey: item.eventKey })) }));
  post("/api/shot-alarm/test", (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const result = processInput({ ...body, eventType: cleanString(body.eventType || body.type || "sub") }, { force: true, forceRoll: body.forceRoll, immediate: body.immediate === true, includeRaw: true, eventKey: "manual.test", countReceived: true });
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  post("/api/shot-alarm/manual-trigger", (req, res) => {
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
      publishStatus("manual_trigger");
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, trigger: entry, status: publicStatus() });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });
  get("/api/shot-alarm/status-bar", (req, res) => res.json({ ok: true, module: MODULE_NAME, statusBar: buildStatusPayload() }));
  post("/api/shot-alarm/resolve-pending", async (req, res) => {
    try {
      const ids = [...state.drawsPending.keys()];
      const results = [];
      for (const id of ids) results.push(await resolveDraw(id, {}));
      res.json({ ok: true, module: MODULE_NAME, resolved: results.length, results, status: publicStatus() });
    } catch (err) {
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
      sendStatusBar();
      publishStatus("shot_done");
      return res.json({ ok: true, module: MODULE_NAME, done, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, status: publicStatus() });
    }
    sendStatusBar();
    return res.json({ ok: true, module: MODULE_NAME, done: 0, shotsOpen: state.shotsOpen, shotsDrunk: state.shotsDrunk, skippedReason: "no_open_shots", status: publicStatus() });
  });
  post("/api/shot-alarm/flush-pending", (req, res) => res.json({ ok: true, module: MODULE_NAME, flushed: flushPending(), status: publicStatus() }));
  post("/api/shot-alarm/reset-state", (req, res) => { resetState(); sendStatusBar(); res.json({ ok: true, module: MODULE_NAME, status: publicStatus() }); });

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
