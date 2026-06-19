"use strict";

/**
 * Loyalty Games host module.
 *
 * STEP LWG-6.9 / STEP228:
 * - Adds protected Gamble dashboard write API with role checks and audit log.
 * - Keeps writes scoped to Gamble settings and !gamble command fields.
 *
 * STEP LWG-6.8 / STEP227:
 * - Adds a read-only dashboard configuration snapshot route for Gamble.
 * - Does not change settings, commands, balance or game logic.
 *
 * STEP LWG-6.5 / STEP224:
 * - Flattens Gamble runtime results for commands.js and command_execution_log.
 * - Adds bet/outcome/payout/profit/balance fields to module responses without changing game logic.
 *
 * STEP LWG-6.3 / STEP222:
 * - Gamble text cleanup with new CGN/Kekskruemel variants.
 * - Runtime response uses v2 text keys so existing old DB variants do not leak into chat.
 * - Keeps StreamElements parallel operation possible during migration.
 *
 * STEP LWG-6.1 / STEP220:
 * - Adds safe runtime settings routes for Loyalty Games so Gamble can be enabled temporarily and restored by scripts.
 * - Keeps !gamble disabled by default; no automatic live activation.
 *
 * STEP LWG-5.2 / STEP210:
 * - Status-Cleanup: Modul aktiv/online sauber von Chat-Command-Freigabe getrennt
 * - Gamble-Status liefert moduleEnabled, gameReady, commandEnabled/commandsEnabled und configEnabled
 *
 * STEP LWG-5.1:
 * - Gamble-Spiel vorbereitet: DB-Settings, Multitexte, deaktivierter Command, Safety-Layer-Nutzung
 * - !gamble bleibt deaktiviert bis Loyalty-Freigabe
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
const settingsHelper = require("./helpers/helper_settings");
const textHelper = require("./helpers/helper_texts");
const routes = require("./helpers/helper_routes");
const database = require("../core/database");
const wheelFactory = require("./loyalty_games/wheel");
const gambleFactory = require("./loyalty_games/gamble");
const presetFactory = require("./loyalty_games/presets");
const loyaltyCore = require("./loyalty");

const MODULE_NAME = "loyalty_games";
const MODULE_VERSION = "0.2.8";
const MODULE_BUILD = "LWG_BOUND_WHEEL_FIELD_COUNT_1";
const CONFIG_FILE = "loyalty_games.json";
const SCHEMA_MODULE = "loyalty_games";
const SCHEMA_VERSION = 4;
const SETTINGS_TABLE = "loyalty_games_settings";
const DASHBOARD_AUDIT_TABLE = "loyalty_games_dashboard_audit";
const TEXT_MODULE = MODULE_NAME;

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
      "loyalty.wheel.spin.finished",
      "loyalty.game.gamble.played"
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
    },
    gamble: {
      enabled: false,
      mode: "shadow",
      minBet: 1,
      maxBet: 1000,
      allowPercent: true,
      minPercent: 1,
      maxPercent: 100,
      allowAll: false,
      winChancePercent: 47,
      payoutMultiplier: 2,
      userCooldownMs: 60000,
      globalCooldownMs: 0,
      liveOnly: false
    }
  }
};

const SETTINGS_DEFINITIONS = [
  { key: "enabled", path: "enabled", valueType: "boolean", description: "Loyalty-Games Host aktivieren/deaktivieren." },
  { key: "games.gamble.enabled", path: "games.gamble.enabled", valueType: "boolean", description: "Gamble-Engine/API aktivieren/deaktivieren. Chat-Freigabe läuft separat über command_definitions." },
  { key: "games.gamble.minBet", path: "games.gamble.minBet", valueType: "number", description: "Minimaler Gamble-Einsatz." },
  { key: "games.gamble.maxBet", path: "games.gamble.maxBet", valueType: "number", description: "Maximaler Gamble-Einsatz." },
  { key: "games.gamble.allowPercent", path: "games.gamble.allowPercent", valueType: "boolean", description: "Prozent-Einsaetze wie !gamble 50% erlauben." },
  { key: "games.gamble.minPercent", path: "games.gamble.minPercent", valueType: "number", description: "Minimaler Prozent-Einsatz." },
  { key: "games.gamble.maxPercent", path: "games.gamble.maxPercent", valueType: "number", description: "Maximaler Prozent-Einsatz." },
  { key: "games.gamble.allowAll", path: "games.gamble.allowAll", valueType: "boolean", description: "All-in Einsatz erlauben. Standard bewusst aus." },
  { key: "games.gamble.winChancePercent", path: "games.gamble.winChancePercent", valueType: "number", description: "Gewinnchance in Prozent. Server entscheidet per crypto.randomInt." },
  { key: "games.gamble.payoutMultiplier", path: "games.gamble.payoutMultiplier", valueType: "number", description: "Brutto-Auszahlung bei Gewinn als Multiplikator des Einsatzes." },
  { key: "games.gamble.userCooldownMs", path: "games.gamble.userCooldownMs", valueType: "number", description: "User-Cooldown in Millisekunden." },
  { key: "games.gamble.globalCooldownMs", path: "games.gamble.globalCooldownMs", valueType: "number", description: "Globaler Cooldown in Millisekunden." },
  { key: "games.gamble.liveOnly", path: "games.gamble.liveOnly", valueType: "boolean", description: "Gamble nur live erlauben." }
];

const DEFAULT_TEXTS = {
  "gamble.win": [
    "{user} wirft {bet} {currencyName} in die Heimleitungs-Maschine... Gewinn! Neuer verfügbarer Stand: {points}.",
    "{user}, die Keksdose war gnädig: +{profit} {currencyName}. Verfügbar jetzt: {points}.",
    "Die Rentnergang jubelt: {user} gewinnt beim Gamble mit {bet} {currencyName}. Neuer Stand: {points}."
  ],
  "gamble.lose": [
    "{user} setzt {bet} {currencyName}. Die Heimleitung fegt die Krümel ein. Verfügbar bleiben {points}.",
    "{user}, die Keksmaschine knirscht... leider verloren. Einsatz: {bet} {currencyName}. Neuer Stand: {points}.",
    "Die Rentnerkasse sagt Nein: {user} verliert {bet} {currencyName}. Verfügbar: {points}."
  ],
  "gamble.win_v2": [
    "🎰 {user} setzt {bet} Kekskrümel und die Rentnergang rastet aus: gewonnen! Neuer Stand: {points}.",
    "🍪 Jackpot im Altersheim: {user} gewinnt mit {bet} Kekskrümeln. Neuer Stand: {points}.",
    "🎲 {user} riskiert {bet} Kekskrümel und sammelt den Gewinn ein. Neuer Stand: {points}."
  ],
  "gamble.lose_v2": [
    "🎰 {user} setzt {bet} Kekskrümel und die Keksdose bleibt zu. Verloren. Neuer Stand: {points}.",
    "🍪 {user} riskiert {bet} Kekskrümel. Die Rentnergang murmelt: Niete. Neuer Stand: {points}.",
    "🎲 {user} spielt mit {bet} Kekskrümeln. Diesmal gewinnt die Keksbank. Neuer Stand: {points}."
  ],
  "gamble.disabled": [
    "{user}, Gamble steht schon im Flur, aber die Heimleitung hat den Schalter noch nicht freigegeben.",
    "{user}, die Keksmaschine ist vorbereitet, aber noch deaktiviert."
  ],
  "gamble.disabled_v2": [
    "🎰 {user}, die Gamble-Kiste ist gerade noch abgeschlossen.",
    "🍪 {user}, Gamble ist im Node-System aktuell deaktiviert."
  ],
  "gamble.invalid_amount": [
    "{user}, mit diesem Einsatz kommt die Rentnerkasse durcheinander.",
    "{user}, bitte einen gültigen Einsatz angeben, z. B. !gamble 100 oder !gamble 50%."
  ],
  "gamble.invalid_amount_v2": [
    "🍪 {user}, bitte einen gültigen Einsatz angeben: !gamble 100 oder !gamble 10%.",
    "🎰 {user}, damit kann die Gamble-Kiste nichts anfangen. Beispiel: !gamble 100 oder !gamble 10%."
  ],
  "gamble.insufficient_balance": [
    "{user}, dafür reichen deine verfügbaren {currencyName} nicht. Verfügbar: {available}, benötigt: {bet}.",
    "{user}, die Heimleitung winkt ab: {bet} gebraucht, {available} verfügbar."
  ],
  "gamble.insufficient_balance_v2": [
    "🍪 {user}, dafür ist die Keksdose zu leer. Einsatz: {bet}, verfügbar: {available}.",
    "🎰 {user}, zu wenig Kekskrümel für diesen Einsatz. Verfügbar: {available}, gebraucht: {bet}."
  ],
  "gamble.cooldown": [
    "{user}, die Keksmaschine muss kurz abkühlen. Warte noch {seconds} Sekunden.",
    "{user}, die Heimleitung sortiert noch die Krümel. Cooldown: {seconds} Sekunden."
  ],
  "gamble.cooldown_v2": [
    "⏳ {user}, die Gamble-Kiste kühlt noch ab. Noch {seconds} Sekunden.",
    "🍪 {user}, kurz warten: Die Keksbank zählt noch. Cooldown: {seconds} Sekunden."
  ],
  "gamble.min_bet": [
    "{user}, unter {minBet} {currencyName} steht die Heimleitung gar nicht erst auf.",
    "{user}, Mindest-Einsatz: {minBet} {currencyName}."
  ],
  "gamble.min_bet_v2": [
    "🍪 {user}, Mindest-Einsatz sind {minBet} Kekskrümel.",
    "🎰 {user}, so klein spielt die Gamble-Kiste nicht. Minimum: {minBet}."
  ],
  "gamble.max_bet": [
    "{user}, so viele Krümel lässt die Heimleitung nicht auf einmal in die Maschine. Maximum: {maxBet}.",
    "{user}, maximal erlaubt sind {maxBet} {currencyName}."
  ],
  "gamble.max_bet_v2": [
    "🍪 {user}, so viele Kekskrümel passen nicht in die Gamble-Kiste. Maximum: {maxBet}.",
    "🎰 {user}, Einsatz zu hoch. Erlaubt sind maximal {maxBet} Kekskrümel."
  ],
  "gamble.percent_disabled_v2": [
    "🍪 {user}, Prozent-Einsätze sind gerade deaktiviert. Nimm bitte eine feste Zahl.",
    "🎰 {user}, Prozent-Gamble ist aktuell aus. Beispiel: !gamble 100."
  ],
  "gamble.all_disabled_v2": [
    "🍪 {user}, All-in ist hier noch Rentnerverbot. Nimm bitte eine Zahl oder Prozent.",
    "🎰 {user}, alles setzen ist aktuell deaktiviert."
  ]
};

const TEXT_CATEGORIES = {
  "gamble.win": "chat_gamble",
  "gamble.lose": "chat_gamble",
  "gamble.win_v2": "chat_gamble",
  "gamble.lose_v2": "chat_gamble",
  "gamble.disabled": "chat_gamble",
  "gamble.disabled_v2": "chat_gamble_errors",
  "gamble.invalid_amount": "chat_gamble_errors",
  "gamble.invalid_amount_v2": "chat_gamble_errors",
  "gamble.insufficient_balance": "chat_gamble_errors",
  "gamble.insufficient_balance_v2": "chat_gamble_errors",
  "gamble.cooldown": "chat_gamble_errors",
  "gamble.cooldown_v2": "chat_gamble_errors",
  "gamble.min_bet": "chat_gamble_errors",
  "gamble.min_bet_v2": "chat_gamble_errors",
  "gamble.max_bet": "chat_gamble_errors",
  "gamble.max_bet_v2": "chat_gamble_errors",
  "gamble.percent_disabled_v2": "chat_gamble_errors",
  "gamble.all_disabled_v2": "chat_gamble_errors"
};

const TEXT_CATEGORY_LABELS = {
  chat_gamble: "Chat · Gamble",
  chat_gamble_errors: "Chat · Gamble Fehler"
};

const CENTRAL_COMMAND_DEFINITIONS = [
  {
    trigger: "gamble",
    aliases: [],
    moduleKey: MODULE_NAME,
    actionKey: "chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/games/runtime/chat-command",
    enabled: false,
    permissionLevel: "everyone",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 60000,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP_LWG_5_1",
      actionType: "module_command",
      moduleCommand: "gamble",
      rawInputMode: true,
      activationState: "prepared_disabled"
    }
  }
];

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
        registeredBy: "direct_existing_communication_bus",
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


let state = {
  loadedAt: core.nowIso(),
  configPath: "",
  configOk: false,
  configError: "",
  schemaReady: false,
  lastError: "",
  routeCount: 0,
  eventBusReady: false,
  settings: { ok: false, table: SETTINGS_TABLE, inserted: 0, count: 0, lastError: "" },
  texts: { ok: false, inserted: 0, lastError: "" }
};

let config = DEFAULT_CONFIG;
let wheel = null;
let gamble = null;
let presetStore = null;
let broadcastWS = null;
let eventBus = null;
let moduleBusHandle = null;

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


function getNestedValue(object, dottedPath, fallback = undefined) {
  if (!object || typeof object !== "object") return fallback;
  const parts = String(dottedPath || "").split(".").filter(Boolean);
  let current = object;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return fallback;
    current = current[part];
  }
  return current;
}

function setNestedValue(object, dottedPath, value) {
  const parts = String(dottedPath || "").split(".").filter(Boolean);
  if (!parts.length) return object;
  let current = object;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return object;
}

function mergePlain(base, extra) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) out[key] = mergePlain(out[key], value);
    else if (Array.isArray(value)) out[key] = value.map(item => item && typeof item === "object" ? { ...item } : item);
    else out[key] = value;
  }
  return out;
}

function normalizeSettingValue(def, value) {
  const type = String(def && def.valueType || "").toLowerCase();
  if (type === "boolean") return value === true || value === 1 || ["1", "true", "yes", "ja", "on"].includes(String(value).trim().toLowerCase());
  if (type === "number") { const n = Number(value); return Number.isFinite(n) ? n : Number(getNestedValue(DEFAULT_CONFIG, def.path, 0) || 0); }
  if (type === "json") { if (Array.isArray(value) || (value && typeof value === "object")) return value; if (typeof value === "string") { try { return JSON.parse(value); } catch (_) {} } return getNestedValue(DEFAULT_CONFIG, def.path, []); }
  return String(value ?? "").trim();
}

function settingDefaultsFromConfig(sourceConfig) {
  const source = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : DEFAULT_CONFIG;
  return SETTINGS_DEFINITIONS.map(def => ({ key: def.key, value: normalizeSettingValue(def, getNestedValue(source, def.path, getNestedValue(DEFAULT_CONFIG, def.path, null))), valueType: def.valueType, description: def.description }));
}

function ensureSettingsSeeded(sourceConfig) {
  const result = settingsHelper.seedDefaults(SETTINGS_TABLE, settingDefaultsFromConfig(sourceConfig || config));
  state.settings.ok = !!result.ok;
  state.settings.inserted = Number(result.inserted || 0);
  state.settings.lastError = "";
  const listed = settingsHelper.listSettings(SETTINGS_TABLE, { limit: 1000 });
  state.settings.count = Number(listed.count || 0);
  return result;
}

function applySettingsToConfig(baseConfig) {
  const next = mergePlain(DEFAULT_CONFIG, baseConfig || {});
  for (const def of SETTINGS_DEFINITIONS) {
    const fallback = getNestedValue(next, def.path, getNestedValue(DEFAULT_CONFIG, def.path, null));
    const setting = settingsHelper.getSetting(SETTINGS_TABLE, def.key, fallback, { valueType: def.valueType, description: def.description });
    setNestedValue(next, def.path, normalizeSettingValue(def, setting.value));
  }
  return next;
}

function refreshConfigFromSettings() {
  config = applySettingsToConfig(config);
  if (gamble && typeof gamble.updateConfig === "function") gamble.updateConfig(config.games && config.games.gamble ? config.games.gamble : DEFAULT_CONFIG.games.gamble, !!config.enabled);
  return config;
}


function hasNestedSettingValue(object, dottedPath) {
  if (!object || typeof object !== "object") return false;
  const parts = String(dottedPath || "").split(".").filter(Boolean);
  let current = object;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return false;
    current = current[part];
  }
  return true;
}

function saveSettingsFromInput(input = {}) {
  ensureSchema();
  ensureSettingsSeeded(config);
  const source = input && typeof input === "object" ? input : {};
  const rows = [];
  let saved = 0;

  for (const def of SETTINGS_DEFINITIONS) {
    let value;
    let found = false;

    if (Object.prototype.hasOwnProperty.call(source, def.key)) {
      value = source[def.key];
      found = true;
    } else if (hasNestedSettingValue(source, def.path)) {
      value = getNestedValue(source, def.path);
      found = true;
    }

    if (!found) continue;

    const normalized = normalizeSettingValue(def, value);
    const row = settingsHelper.setSetting(SETTINGS_TABLE, def.key, normalized, {
      valueType: def.valueType,
      description: def.description
    });
    rows.push(row);
    saved += 1;
  }

  refreshConfigFromSettings();
  return { ok: true, table: SETTINGS_TABLE, saved, rows, config: publicConfig() };
}

function ensureTextsSeeded() {
  try {
    if (typeof textHelper.seedModuleTextVariants === "function") {
      const result = textHelper.seedModuleTextVariants(TEXT_MODULE, DEFAULT_TEXTS, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS, source: "seed" });
      state.texts.ok = true; state.texts.inserted = Number(result.inserted || 0); state.texts.lastError = "";
    }
    if (typeof textHelper.seedModuleTexts === "function") textHelper.seedModuleTexts(TEXT_MODULE, DEFAULT_TEXTS, { source: "seed" });
    return { ok: true };
  } catch (err) { state.texts.ok = false; state.texts.lastError = err && err.message ? err.message : String(err); return { ok: false, error: state.texts.lastError }; }
}

function pickSingleRenderedTextLine(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lines = raw
    .split(/[\r\n]+/g)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (lines.length <= 1) return lines[0] || raw.replace(/\s+/g, " ").trim();
  return lines[Math.floor(Math.random() * lines.length)];
}

function renderGameText(key, context = {}, options = {}) {
  ensureTextsSeeded();
  try {
    const message = textHelper.renderModuleText(TEXT_MODULE, key, DEFAULT_TEXTS, context, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS, ...options });
    const clean = pickSingleRenderedTextLine(message);
    return clean.length > 450 ? clean.slice(0, 449).trimEnd() + "…" : clean;
  } catch (_) {
    const fallback = Array.isArray(DEFAULT_TEXTS[key]) ? DEFAULT_TEXTS[key][0] : "";
    return Object.entries(context || {}).reduce((text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value ?? "")), fallback);
  }
}

function safeParseJson(value, fallback = null) { if (value === undefined || value === null || value === "") return fallback; try { return JSON.parse(String(value)); } catch (_) { return fallback; } }
function commandSystemTableAvailable() { try { ensureSchema(); if (typeof database.tableExists === "function") return database.tableExists("command_definitions"); const row = database.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'command_definitions'"); return !!row; } catch (_) { return false; } }
function rowToCentralCommand(row) { if (!row) return null; return { id: Number(row.id || 0), trigger: row.trigger || "", aliases: safeParseJson(row.aliases_json, []), moduleKey: row.module_key || "", actionKey: row.action_key || "", targetMethod: row.target_method || "POST", targetUrl: row.target_url || "", enabled: Number(row.enabled || 0) === 1, permissionLevel: row.permission_level || "everyone", cooldownGlobalMs: Number(row.cooldown_global_ms || 0), cooldownUserMs: Number(row.cooldown_user_ms || 0), liveOnly: Number(row.live_only || 0) === 1, responseMode: row.response_mode || "module", config: safeParseJson(row.config_json, {}), createdAt: row.created_at || "", updatedAt: row.updated_at || "" }; }
function seedCentralCommandDefinitions() {
  ensureSchema(); if (!commandSystemTableAvailable()) return { ok: false, available: false, inserted: 0, existing: 0, count: 0, commands: [], warning: "Zentrales command_definitions-System ist noch nicht verfuegbar." };
  const now = core.nowIso(); let inserted = 0; let existing = 0;
  for (const definition of CENTRAL_COMMAND_DEFINITIONS) {
    const current = database.get("SELECT id FROM command_definitions WHERE trigger = :trigger", { trigger: definition.trigger });
    if (current && current.id) { existing += 1; continue; }
    const result = database.run(`INSERT INTO command_definitions (trigger, aliases_json, module_key, action_key, target_method, target_url, enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only, response_mode, config_json, created_at, updated_at) VALUES (:trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl, :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, :liveOnly, :responseMode, :configJson, :createdAt, :updatedAt)`, { trigger: definition.trigger, aliasesJson: JSON.stringify(definition.aliases || []), moduleKey: definition.moduleKey || MODULE_NAME, actionKey: definition.actionKey || "chat_command_runtime", targetMethod: definition.targetMethod || "POST", targetUrl: definition.targetUrl || "/api/loyalty/games/runtime/chat-command", enabled: definition.enabled ? 1 : 0, permissionLevel: definition.permissionLevel || "everyone", cooldownGlobalMs: Math.max(0, Number(definition.cooldownGlobalMs || 0)), cooldownUserMs: Math.max(0, Number(definition.cooldownUserMs || 0)), liveOnly: definition.liveOnly ? 1 : 0, responseMode: definition.responseMode || "module", configJson: JSON.stringify(definition.config || {}), createdAt: now, updatedAt: now });
    inserted += Number(result && result.changes ? result.changes : 0);
  }
  return listCentralCommandDefinitions({ inserted, existing });
}
function listCentralCommandDefinitions(extra = {}) {
  ensureSchema(); if (!commandSystemTableAvailable()) return { ok: false, available: false, inserted: Number(extra.inserted || 0), existing: Number(extra.existing || 0), count: 0, commands: [], warning: "Zentrales command_definitions-System ist noch nicht verfuegbar." };
  const triggers = CENTRAL_COMMAND_DEFINITIONS.map(item => item.trigger);
  const rows = database.all(`SELECT * FROM command_definitions WHERE trigger IN (${triggers.map((_, index) => `:trigger${index}`).join(", ")}) ORDER BY trigger ASC`, triggers.reduce((acc, trigger, index) => { acc[`trigger${index}`] = trigger; return acc; }, {})).map(rowToCentralCommand);
  return { ok: true, available: true, active: rows.some(command => command && command.enabled), commandsActive: rows.some(command => command && command.enabled), inserted: Number(extra.inserted || 0), existing: Number(extra.existing || Math.max(0, rows.length - Number(extra.inserted || 0))), count: rows.length, commands: rows, note: "!gamble ist vorbereitet und bleibt deaktiviert bis Loyalty-Freigabe." };
}
function getChatTextEditorPayload() { ensureSchema(); ensureTextsSeeded(); return textHelper.listModuleTextEditor(TEXT_MODULE, DEFAULT_TEXTS, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS }); }
function handleChatTextEditorPayload(payload = {}) { ensureSchema(); ensureTextsSeeded(); return textHelper.handleModuleTextEditorPayload(TEXT_MODULE, payload || {}, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS }); }

function loadConfig() {
  const loaded = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, {
    createIfMissing: false,
    mergeDefaults: true,
    spaces: 2
  });

  state.configPath = loaded.path || "";
  state.configOk = !!loaded.ok || !!loaded.exists;
  state.configError = loaded.error || "";
  config = mergePlain(DEFAULT_CONFIG, loaded.data || loaded.config || {});
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

  database.exec(`
    CREATE TABLE IF NOT EXISTS ${DASHBOARD_AUDIT_TABLE} (
      id ${database.primaryKeyAutoIncrementSql()},
      audit_uid TEXT NOT NULL UNIQUE,
      feature TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      actor_login TEXT NOT NULL DEFAULT '',
      actor_display_name TEXT NOT NULL DEFAULT '',
      actor_role TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      before_json TEXT NOT NULL DEFAULT '{}',
      after_json TEXT NOT NULL DEFAULT '{}',
      changes_json TEXT NOT NULL DEFAULT '{}',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_games_audit_feature ON ${DASHBOARD_AUDIT_TABLE}(feature);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_games_audit_created ON ${DASHBOARD_AUDIT_TABLE}(created_at);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_games_audit_actor ON ${DASHBOARD_AUDIT_TABLE}(actor_login);`);

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
      wheel: wheel ? wheel.getPublicConfig() : (config.games && config.games.wheel ? config.games.wheel : {}),
      gamble: gamble ? gamble.getPublicConfig() : (config.games && config.games.gamble ? config.games.gamble : {})
    }
  };
}

function buildStatus() {
  refreshConfigFromSettings();
  const wheelStatus = wheel ? wheel.getStatus() : { ok: false, enabled: false, lastError: "wheel_not_loaded" };
  const gambleStatus = gamble ? gamble.getStatus() : { ok: false, enabled: false, lastError: "gamble_not_loaded" };
  const counts = state.schemaReady ? sessionCounts() : { total: 0, running: 0, finished: 0, failed: 0 };
  const presetStatus = presetStore && state.schemaReady ? presetStore.status() : { ok: false, presets: 0, fields: 0, spins: 0 };

  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    enabled: !!config.enabled,
    moduleEnabled: !!config.enabled,
    eventBusReady: !!state.eventBusReady,
    commandsEnabled: state.schemaReady ? !!(listCentralCommandDefinitions().commandsActive) : false,
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
        mode: state.eventBusReady ? "existing_communication_bus_direct" : "broadcast_only",
        moduleBus: moduleBusHandle && typeof moduleBusHandle.getState === "function" ? moduleBusHandle.getState() : null
      },
      state: {
        gamesLoaded: (wheel ? 1 : 0) + (gamble ? 1 : 0),
        enabled: !!config.enabled,
        settings: { ...state.settings },
        texts: { ...state.texts },
        centralCommands: state.schemaReady ? listCentralCommandDefinitions() : { ok: false, available: false }
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
      wheel: wheelStatus,
      gamble: gambleStatus
    }
  };
}


function startWheelSpin(input = {}) {
  if (!wheel || typeof wheel.spin !== "function") {
    return { ok: false, error: "wheel_not_ready", statusCode: 503 };
  }
  return wheel.spin(input);
}


function startGamble(input = {}) {
  if (!gamble || typeof gamble.play !== "function") return { ok: false, error: "gamble_not_ready", statusCode: 503 };
  refreshConfigFromSettings();
  return gamble.play(input);
}

function normalizeCommandLogin(value) { return String(value || "").trim().replace(/^@/, "").toLowerCase(); }
function commandUser(input = {}) { const login = normalizeCommandLogin(input.userLogin || input.login || input.username || input.user || ""); const displayName = String(input.userDisplayName || input.displayName || input.username || input.user || login).trim() || login; return { login, displayName }; }
function commandArgs(input = {}) { if (Array.isArray(input.args)) return input.args.map(item => String(item || "").trim()).filter(Boolean); const raw = String(input.argText || input.rawArgs || input.text || input.message || "").trim(); return raw ? raw.split(/\s+/).filter(Boolean) : []; }
function pickNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compactSummary(summary = {}) {
  if (!summary || typeof summary !== "object") return { balance: 0, available: 0, reserved: 0 };
  return {
    login: summary.login || summary.userLogin || "",
    displayName: summary.displayName || "",
    balance: pickNumber(summary.balance, 0),
    available: pickNumber(summary.available, 0),
    reserved: pickNumber(summary.reserved, 0),
    totalEarned: pickNumber(summary.totalEarned ?? summary.total_earned, 0),
    totalSpent: pickNumber(summary.totalSpent ?? summary.total_spent, 0),
    rank: summary.rank || null,
    rankTotal: summary.rankTotal || 0,
    currencyName: summary.currencyName || "Kekskrümel",
    mode: summary.mode || ""
  };
}

function flattenGambleResult(result = {}) {
  const before = compactSummary(result.summaryBefore || {});
  const after = compactSummary(result.summaryAfter || {});
  const rankAfter = result.rankAfter && typeof result.rankAfter === "object" ? result.rankAfter : {};
  const won = result.won === true;
  const outcome = won ? "win" : "lose";
  const bet = pickNumber(result.bet, 0);
  const grossPayout = pickNumber(result.grossPayout, 0);
  const netProfit = pickNumber(result.netProfit, grossPayout - bet);

  return {
    game: "gamble",
    action: "gamble",
    sessionUid: result.sessionUid || "",
    login: result.login || "",
    displayName: result.displayName || result.login || "",
    bet,
    amount: bet,
    rawBet: result.rawBet || "",
    betMode: result.betMode || "",
    percent: result.percent || null,
    outcome,
    won,
    grossPayout,
    payout: grossPayout,
    winAmount: grossPayout,
    netProfit,
    profit: netProfit,
    winChancePercent: pickNumber(result.winChancePercent, 0),
    payoutMultiplier: pickNumber(result.payoutMultiplier, 0),
    balanceBefore: before.balance,
    availableBefore: before.available,
    reservedBefore: before.reserved,
    balanceAfter: after.balance,
    availableAfter: after.available,
    reservedAfter: after.reserved,
    rank: rankAfter.rank || null,
    rankTotal: rankAfter.rankTotal || 0,
    startedAt: result.startedAt || "",
    finishedAt: result.finishedAt || "",
    summaryBefore: before,
    summaryAfter: after,
    random: result.random || {
      method: "crypto.randomInt",
      serverSide: true,
      predictableByUser: false
    }
  };
}

function buildGambleRuntimeResponse(input = {}, result = {}) {
  const user = commandUser(input);
  let messageKey = "";
  let context = {
    user: user.displayName || user.login,
    currencyName: "Kekskrümel",
    bet: result.bet || result.amount || 0,
    available: result.available || result.summary?.available || result.summaryAfter?.available || 0,
    rawBet: result.parsedBet?.raw || result.rawBet || "",
    percent: result.parsedBet?.percent || result.percent || ""
  };

  if (result.ok) {
    const flat = flattenGambleResult(result);
    return {
      ok: true,
      handled: true,
      module: MODULE_NAME,
      command: "gamble",
      action: "gamble",
      message: result.message || "",
      messageKey: result.messageKey || "",
      active: true,
      commandsActive: true,
      data: result,
      ...flat
    };
  }

  const seconds = Math.ceil(Number(result.waitMs || 0) / 1000);
  if (result.error === "gamble_disabled" || result.error === "loyalty_games_disabled") messageKey = "gamble.disabled_v2";
  else if (result.error === "gamble_insufficient_available_balance" || result.error === "insufficient_available_balance") messageKey = "gamble.insufficient_balance_v2";
  else if (result.error === "gamble_user_cooldown" || result.error === "gamble_global_cooldown") { messageKey = "gamble.cooldown_v2"; context = { ...context, seconds }; }
  else if (result.error === "gamble_bet_below_min") { messageKey = "gamble.min_bet_v2"; context = { ...context, minBet: result.minBet || 0 }; }
  else if (result.error === "gamble_bet_above_max") { messageKey = "gamble.max_bet_v2"; context = { ...context, maxBet: result.maxBet || 0 }; }
  else if (result.error === "gamble_percent_disabled") messageKey = "gamble.percent_disabled_v2";
  else if (result.error === "gamble_all_disabled") messageKey = "gamble.all_disabled_v2";
  else messageKey = "gamble.invalid_amount_v2";

  return {
    ok: false,
    handled: true,
    module: MODULE_NAME,
    command: "gamble",
    action: "gamble",
    message: renderGameText(messageKey, context),
    messageKey,
    error: result.error || "gamble_failed",
    data: result,
    active: false,
    commandsActive: false,
    game: "gamble",
    bet: pickNumber(result.bet || result.parsedBet?.bet, 0),
    rawBet: result.parsedBet?.raw || result.rawBet || "",
    betMode: result.parsedBet?.mode || result.betMode || "",
    percent: result.parsedBet?.percent || result.percent || null,
    available: pickNumber(result.available || result.summary?.available, 0)
  };
}
function handleChatCommandRuntime(input = {}) {
  ensureSchema(); ensureTextsSeeded(); seedCentralCommandDefinitions();
  const command = String(input.command || input.commandName || input.cmd || "").trim().replace(/^!/, "").toLowerCase();
  if (command !== "gamble") return { ok: false, handled: false, module: MODULE_NAME, command, error: "unsupported_command" };
  const central = listCentralCommandDefinitions(); const commandDefinition = (central.commands || []).find(row => row.trigger === "gamble") || null;
  if (!commandDefinition || !commandDefinition.enabled) return { ok: false, handled: true, module: MODULE_NAME, command, action: "gamble", message: renderGameText("gamble.disabled", { user: commandUser(input).displayName || commandUser(input).login }), messageKey: "gamble.disabled", error: "chat_commands_disabled", data: { commandDefinition }, active: false, commandsActive: false };
  const user = commandUser(input); const args = commandArgs(input); const result = startGamble({ ...input, login: user.login, displayName: user.displayName, args, source: "chat_runtime" });
  return buildGambleRuntimeResponse(input, result);
}


function decorateGambleStatus(status = {}) {
  const central = state.schemaReady ? listCentralCommandDefinitions() : { ok: false, available: false, commands: [] };
  const gambleCommand = (central.commands || []).find(row => row && row.trigger === "gamble") || null;
  const commandEnabled = !!(gambleCommand && gambleCommand.enabled);
  const moduleEnabled = !!config.enabled;
  const configEnabled = !!(status.config && status.config.enabled);
  const gameReady = moduleEnabled && status.ok !== false;
  return {
    ...status,
    enabled: moduleEnabled,
    moduleEnabled,
    moduleOnline: true,
    gameReady,
    configEnabled,
    playEnabled: moduleEnabled && configEnabled,
    commandEnabled,
    commandsEnabled: commandEnabled,
    command: gambleCommand,
    commandSource: "command_definitions",
    access: {
      moduleOnline: true,
      moduleEnabled,
      gameReady,
      configEnabled,
      playEnabled: moduleEnabled && configEnabled,
      commandEnabled,
      commandsEnabled: commandEnabled
    }
  };
}


function settingRowKey(row = {}) {
  return String(row.key || row.setting_key || row.name || "").trim();
}

function cleanActorLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function normalizeDashboardActor(input = {}) {
  const body = input && typeof input === "object" ? input : {};
  const nested = body.actor && typeof body.actor === "object" ? body.actor : {};
  const login = cleanActorLogin(body.actorLogin || body.userLogin || nested.login || nested.userLogin || nested.username || "");
  const displayName = String(body.actorDisplayName || body.displayName || nested.displayName || nested.name || login || "").trim();
  const role = String(body.actorRole || body.role || nested.role || "").trim().toLowerCase();
  const isBroadcaster = body.isBroadcaster === true || nested.isBroadcaster === true || role === "broadcaster" || role === "streamer" || role === "owner";
  const isAdmin = body.isAdmin === true || nested.isAdmin === true || role === "admin" || role === "owner";
  const isMod = body.isMod === true || nested.isMod === true || role === "mod" || role === "moderator" || isBroadcaster || isAdmin;
  return {
    login,
    displayName: displayName || login,
    role: role || (isAdmin ? "admin" : isBroadcaster ? "streamer" : isMod ? "mod" : "viewer"),
    isBroadcaster,
    isAdmin,
    isMod
  };
}

function actorCanWriteGambleDashboard(actor = {}) {
  return !!(actor && (actor.isBroadcaster || actor.isAdmin || ["streamer", "broadcaster", "owner", "admin"].includes(String(actor.role || "").toLowerCase())));
}

function auditUid(prefix = "gamble_dashboard") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeJson(value) {
  try { return JSON.stringify(value ?? {}); } catch (_) { return "{}"; }
}

function insertDashboardAudit(entry = {}) {
  ensureSchema();
  const now = core.nowIso();
  const actor = entry.actor || {};
  const data = {
    auditUid: entry.auditUid || auditUid(),
    feature: entry.feature || "gamble",
    action: entry.action || "dashboard_config_write",
    status: entry.status || "unknown",
    actorLogin: actor.login || "",
    actorDisplayName: actor.displayName || actor.login || "",
    actorRole: actor.role || "",
    reason: String(entry.reason || "").trim(),
    beforeJson: safeJson(entry.before || {}),
    afterJson: safeJson(entry.after || {}),
    changesJson: safeJson(entry.changes || {}),
    metadataJson: safeJson(entry.metadata || {}),
    createdAt: now
  };
  database.run(`
    INSERT INTO ${DASHBOARD_AUDIT_TABLE} (
      audit_uid, feature, action, status, actor_login, actor_display_name, actor_role,
      reason, before_json, after_json, changes_json, metadata_json, created_at
    ) VALUES (
      :auditUid, :feature, :action, :status, :actorLogin, :actorDisplayName, :actorRole,
      :reason, :beforeJson, :afterJson, :changesJson, :metadataJson, :createdAt
    )
  `, data);
  const row = database.get(`SELECT * FROM ${DASHBOARD_AUDIT_TABLE} WHERE audit_uid = :auditUid`, { auditUid: data.auditUid });
  return rowToDashboardAudit(row);
}

function rowToDashboardAudit(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    auditUid: row.audit_uid || "",
    feature: row.feature || "",
    action: row.action || "",
    status: row.status || "",
    actorLogin: row.actor_login || "",
    actorDisplayName: row.actor_display_name || row.actor_login || "",
    actorRole: row.actor_role || "",
    reason: row.reason || "",
    before: safeParseJson(row.before_json, {}),
    after: safeParseJson(row.after_json, {}),
    changes: safeParseJson(row.changes_json, {}),
    metadata: safeParseJson(row.metadata_json, {}),
    createdAt: row.created_at || ""
  };
}

function listDashboardAudit(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(200, Number(options.limit || 50) || 50));
  const rows = database.all(`SELECT * FROM ${DASHBOARD_AUDIT_TABLE} WHERE feature = :feature ORDER BY id DESC LIMIT :limit`, { feature: "gamble", limit }) || [];
  return {
    ok: true,
    table: DASHBOARD_AUDIT_TABLE,
    feature: "gamble",
    count: rows.length,
    rows: rows.map(rowToDashboardAudit).filter(Boolean)
  };
}

function settingDefinitionByKeyOrPath(keyOrPath) {
  const clean = String(keyOrPath || "").trim();
  if (!clean) return null;
  return SETTINGS_DEFINITIONS.find(def => def.key === clean || def.path === clean || def.key === `games.gamble.${clean}` || def.path === `games.gamble.${clean}`) || null;
}

function clampNumber(value, min, max, fallback = 0) {
  const n = Number(value);
  const base = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, base));
}

function normalizeDashboardSettingValue(def, value) {
  let normalized = normalizeSettingValue(def, value);
  if (!String(def.key || "").startsWith("games.gamble.")) return normalized;
  switch (def.key) {
    case "games.gamble.minBet":
      return Math.max(1, Math.floor(Number(normalized) || 1));
    case "games.gamble.maxBet":
      return Math.max(1, Math.floor(Number(normalized) || 1));
    case "games.gamble.minPercent":
      return Math.floor(clampNumber(normalized, 1, 100, 1));
    case "games.gamble.maxPercent":
      return Math.floor(clampNumber(normalized, 1, 100, 100));
    case "games.gamble.winChancePercent":
      return Math.floor(clampNumber(normalized, 0, 100, 47));
    case "games.gamble.payoutMultiplier":
      return Math.max(1, Number(normalized) || 2);
    case "games.gamble.userCooldownMs":
    case "games.gamble.globalCooldownMs":
      return Math.max(0, Math.floor(Number(normalized) || 0));
    default:
      return normalized;
  }
}

function collectDashboardSettingsPatch(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const out = {};
  const settings = source.settings && typeof source.settings === "object" ? source.settings : {};
  const engine = source.engine && typeof source.engine === "object" ? source.engine : {};

  for (const [key, value] of Object.entries(settings)) {
    const def = settingDefinitionByKeyOrPath(key);
    if (!def || !String(def.key || "").startsWith("games.gamble.")) continue;
    out[def.key] = normalizeDashboardSettingValue(def, value);
  }

  for (const [key, value] of Object.entries(engine)) {
    const def = settingDefinitionByKeyOrPath(`games.gamble.${key}`);
    if (!def) continue;
    out[def.key] = normalizeDashboardSettingValue(def, value);
  }

  const minBet = out["games.gamble.minBet"];
  const maxBet = out["games.gamble.maxBet"];
  if (minBet !== undefined && maxBet !== undefined && maxBet < minBet) out["games.gamble.maxBet"] = minBet;

  const minPercent = out["games.gamble.minPercent"];
  const maxPercent = out["games.gamble.maxPercent"];
  if (minPercent !== undefined && maxPercent !== undefined && maxPercent < minPercent) out["games.gamble.maxPercent"] = minPercent;

  // LWG-4Q.12M: Dashboard-Gamble nutzt einfache Gewinn/Verlust-Logik.
  // Der sichtbare Cooldown gehört zum zentralen Command-System, nicht doppelt in die Engine.
  out["games.gamble.payoutMultiplier"] = 2;
  out["games.gamble.userCooldownMs"] = 0;
  out["games.gamble.globalCooldownMs"] = 0;

  return out;
}

function readGambleCommandDefinition() {
  const central = seedCentralCommandDefinitions();
  return (central.commands || []).find(row => row && row.trigger === "gamble") || null;
}

function normalizeCommandPatch(payload = {}, currentCommand = null) {
  const command = payload && payload.command && typeof payload.command === "object" ? payload.command : {};
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(command, "enabled")) patch.enabled = command.enabled === true || command.enabled === 1 || ["1", "true", "yes", "on"].includes(String(command.enabled).toLowerCase());
  if (Object.prototype.hasOwnProperty.call(command, "cooldownUserMs")) patch.cooldownUserMs = Math.max(0, Math.floor(Number(command.cooldownUserMs) || 0));
  if (Object.prototype.hasOwnProperty.call(command, "cooldownGlobalMs")) patch.cooldownGlobalMs = Math.max(0, Math.floor(Number(command.cooldownGlobalMs) || 0));
  if (Object.prototype.hasOwnProperty.call(command, "sendResultToChat") || Object.prototype.hasOwnProperty.call(command, "activationState")) {
    const currentConfig = currentCommand && currentCommand.config && typeof currentCommand.config === "object" ? currentCommand.config : {};
    patch.config = { ...currentConfig };
    if (Object.prototype.hasOwnProperty.call(command, "sendResultToChat")) patch.config.sendResultToChat = command.sendResultToChat === true || command.sendResultToChat === 1 || ["1", "true", "yes", "on"].includes(String(command.sendResultToChat).toLowerCase());
    if (Object.prototype.hasOwnProperty.call(command, "activationState")) patch.config.activationState = String(command.activationState || "dashboard_step228").trim() || "dashboard_step228";
    patch.config.resultChatTarget = patch.config.resultChatTarget || "twitch_presence";
    patch.config.resultChatStep = "STEP228_LWG6_9";
  }
  return patch;
}

function applyGambleCommandPatch(patch = {}) {
  const current = readGambleCommandDefinition();
  if (!current) return { ok: false, error: "gamble_command_missing" };
  const data = {};
  if (Object.prototype.hasOwnProperty.call(patch, "enabled")) data.enabled = patch.enabled ? 1 : 0;
  if (Object.prototype.hasOwnProperty.call(patch, "cooldownUserMs")) data.cooldown_user_ms = Math.max(0, Math.floor(Number(patch.cooldownUserMs) || 0));
  if (Object.prototype.hasOwnProperty.call(patch, "cooldownGlobalMs")) data.cooldown_global_ms = Math.max(0, Math.floor(Number(patch.cooldownGlobalMs) || 0));
  if (Object.prototype.hasOwnProperty.call(patch, "config")) data.config_json = JSON.stringify(patch.config || {});
  if (!Object.keys(data).length) return { ok: true, changed: false, before: current, after: current };
  data.updated_at = core.nowIso();
  database.updateByKey("command_definitions", "trigger", "gamble", data);
  const after = readGambleCommandDefinition();
  return { ok: true, changed: true, before: current, after };
}

function buildGambleDashboardWritePreview(payload = {}) {
  ensureSchema();
  ensureSettingsSeeded(config);
  refreshConfigFromSettings();
  seedCentralCommandDefinitions();
  const before = buildGambleDashboardConfigPayload();
  const currentCommand = before.command && before.command.raw ? before.command.raw : readGambleCommandDefinition();
  const settingsPatch = collectDashboardSettingsPatch(payload);
  const commandPatch = normalizeCommandPatch(payload, currentCommand);
  return {
    before,
    settingsPatch,
    commandPatch,
    hasChanges: Object.keys(settingsPatch).length > 0 || Object.keys(commandPatch).length > 0
  };
}

function handleGambleDashboardWrite(payload = {}) {
  ensureSchema();
  const input = payload && typeof payload === "object" ? payload : {};
  const actor = normalizeDashboardActor(input);
  const reason = String(input.reason || input.changeReason || "dashboard_update").trim() || "dashboard_update";
  const dryRun = input.dryRun === true || input.dry_run === true;
  const confirmed = input.confirmWrite === true || input.confirm === true || input.confirmed === true;
  const preview = buildGambleDashboardWritePreview(input);

  if (!actorCanWriteGambleDashboard(actor)) {
    const audit = insertDashboardAudit({ actor, status: "denied", reason, before: preview.before, after: preview.before, changes: { settings: preview.settingsPatch, command: preview.commandPatch }, metadata: { error: "permission_denied", dryRun } });
    return { ok: false, statusCode: 403, error: "permission_denied", message: "Nur Streamer/Owner/Admin duerfen Gamble-Dashboard-Werte schreiben.", actor, audit };
  }

  if (!preview.hasChanges) {
    const audit = insertDashboardAudit({ actor, status: dryRun ? "dry_run_no_changes" : "no_changes", reason, before: preview.before, after: preview.before, changes: {}, metadata: { dryRun } });
    return { ok: true, dryRun, changed: false, saved: 0, commandChanged: false, actor, before: preview.before, after: preview.before, audit };
  }

  if (!dryRun && !confirmed) {
    const audit = insertDashboardAudit({ actor, status: "confirm_required", reason, before: preview.before, after: preview.before, changes: { settings: preview.settingsPatch, command: preview.commandPatch }, metadata: { dryRun } });
    return { ok: false, statusCode: 400, error: "confirm_required", message: "Setze confirmWrite=true fuer schreibende Dashboard-Aenderungen.", actor, audit };
  }

  if (dryRun) {
    return { ok: true, dryRun: true, changed: false, saved: 0, commandChanged: false, actor, before: preview.before, afterPreview: { settings: preview.settingsPatch, command: preview.commandPatch }, changes: { settings: preview.settingsPatch, command: preview.commandPatch } };
  }

  const settingsResult = Object.keys(preview.settingsPatch).length ? saveSettingsFromInput(preview.settingsPatch) : { ok: true, saved: 0, rows: [] };
  const commandResult = applyGambleCommandPatch(preview.commandPatch);
  const after = buildGambleDashboardConfigPayload();
  const audit = insertDashboardAudit({ actor, status: "applied", reason, before: preview.before, after, changes: { settings: preview.settingsPatch, command: preview.commandPatch }, metadata: { settingsSaved: Number(settingsResult.saved || 0), commandChanged: !!commandResult.changed } });

  return {
    ok: true,
    dryRun: false,
    changed: true,
    saved: Number(settingsResult.saved || 0),
    commandChanged: !!commandResult.changed,
    actor,
    before: preview.before,
    after,
    changes: { settings: preview.settingsPatch, command: preview.commandPatch },
    settings: settingsResult,
    command: commandResult,
    audit
  };
}

function buildGambleDashboardConfigPayload() {
  ensureSchema();
  ensureSettingsSeeded(config);
  refreshConfigFromSettings();
  ensureTextsSeeded();
  seedCentralCommandDefinitions();

  const publicCfg = publicConfig();
  const gambleConfig = publicCfg.games && publicCfg.games.gamble ? publicCfg.games.gamble : {};
  const rawStatus = gamble ? gamble.getStatus() : { ok: false, enabled: false, lastError: "gamble_not_loaded" };
  const status = decorateGambleStatus(rawStatus);
  const central = listCentralCommandDefinitions();
  const gambleCommand = (central.commands || []).find(row => row && row.trigger === "gamble") || null;
  const listed = settingsHelper.listSettings(SETTINGS_TABLE, { limit: 1000 });
  const rows = Array.isArray(listed.rows) ? listed.rows : [];
  const settingsByKey = rows.reduce((acc, row) => {
    const key = settingRowKey(row);
    if (key) acc[key] = row;
    return acc;
  }, {});

  const gambleSettings = SETTINGS_DEFINITIONS
    .filter(def => String(def.key || "").startsWith("games.gamble."))
    .map(def => ({
      key: def.key,
      path: def.path,
      valueType: def.valueType,
      description: def.description,
      value: getNestedValue(publicCfg, def.path, getNestedValue(DEFAULT_CONFIG, def.path, null)),
      writable: true,
      source: settingsByKey[def.key] ? "settings" : "default",
      row: settingsByKey[def.key] || null
    }));

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    feature: "gamble",
    readOnly: false,
    dashboard: {
      section: "Loyalty / Gamble",
      step: "STEP228_LWG6_9",
      mode: "read_write_with_audit",
      notes: [
        "GET ist weiterhin ein Snapshot fuer Dashboard-UI.",
        "POST ist schreibend und erfordert Streamer/Owner/Admin sowie confirmWrite=true.",
        "Jede schreibende Aktion wird in loyalty_games_dashboard_audit protokolliert."
      ]
    },
    access: status.access || {},
    status,
    command: {
      available: !!gambleCommand,
      trigger: gambleCommand ? gambleCommand.trigger : "gamble",
      enabled: !!(gambleCommand && gambleCommand.enabled),
      cooldownUserMs: gambleCommand ? Number(gambleCommand.cooldownUserMs || 0) : 0,
      cooldownGlobalMs: gambleCommand ? Number(gambleCommand.cooldownGlobalMs || 0) : 0,
      targetUrl: gambleCommand ? gambleCommand.targetUrl : "/api/loyalty/games/runtime/chat-command",
      responseMode: gambleCommand ? gambleCommand.responseMode : "module",
      sendResultToChat: !!(gambleCommand && gambleCommand.config && gambleCommand.config.sendResultToChat),
      raw: gambleCommand
    },
    settings: {
      table: SETTINGS_TABLE,
      count: Number(listed.count || rows.length || 0),
      gamble: gambleSettings
    },
    config: {
      engine: gambleConfig,
      command: gambleCommand
    },
    text: {
      module: TEXT_MODULE,
      categories: TEXT_CATEGORIES,
      categoryLabels: TEXT_CATEGORY_LABELS,
      keys: [
        "gamble.win_v2",
        "gamble.lose_v2",
        "gamble.invalid_amount_v2",
        "gamble.insufficient_balance_v2",
        "gamble.cooldown_v2",
        "gamble.min_bet_v2",
        "gamble.max_bet_v2",
        "gamble.percent_disabled_v2",
        "gamble.all_disabled_v2"
      ],
      editorEndpoint: "GET/POST /api/loyalty/games/texts"
    },
    endpoints: {
      status: "GET /api/loyalty/games/gamble/status",
      config: "GET /api/loyalty/games/gamble/config",
      dashboardConfig: "GET /api/loyalty/games/gamble/dashboard-config",
      settingsRead: "GET /api/loyalty/games/settings",
      settingsWrite: "POST /api/loyalty/games/settings",
      dashboardWrite: "POST /api/loyalty/games/gamble/dashboard-config",
      dashboardAudit: "GET /api/loyalty/games/gamble/dashboard-audit",
      commandRuntime: "POST /api/loyalty/games/runtime/chat-command",
      texts: "GET/POST /api/loyalty/games/texts"
    },
    safety: {
      writable: true,
      writeStep: "STEP228_LWG6_9",
      requiredRole: "streamer|broadcaster|owner|admin",
      confirmWriteRequired: true,
      auditRequired: true,
      auditTable: DASHBOARD_AUDIT_TABLE,
      safetyDisableAvailable: true
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


  registered.push(...routes.registerGet(app, "/api/loyalty/games/settings", core.asyncRoute(async (req, res) => {
    ensureSettingsSeeded(config);
    refreshConfigFromSettings();
    const listed = settingsHelper.listSettings(SETTINGS_TABLE, { limit: 1000 });
    core.sendOk(res, {
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      table: SETTINGS_TABLE,
      definitions: SETTINGS_DEFINITIONS.map(def => ({ ...def })),
      settings: listed.rows,
      config: publicConfig()
    });
  })));

  registered.push(...routes.registerPost(app, "/api/loyalty/games/settings", core.asyncRoute(async (req, res) => {
    const result = saveSettingsFromInput(req.body || {});
    core.sendOk(res, {
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      ...result
    });
  })));

  const routeNames = [
    "GET /api/loyalty/games/status",
    "GET /api/loyalty/games/config",
    "GET /api/loyalty/games/settings",
    "POST /api/loyalty/games/settings",
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
    "GET /api/loyalty/games/wheel/spins",
    "GET /api/loyalty/games/gamble/status",
    "GET /api/loyalty/games/gamble/config",
    "GET /api/loyalty/games/gamble/dashboard-config",
    "POST /api/loyalty/games/gamble/dashboard-config",
    "GET /api/loyalty/games/gamble/dashboard-audit",
    "POST /api/loyalty/games/gamble/play",
    "POST /api/loyalty/games/runtime/chat-command",
    "GET /api/loyalty/games/central-commands",
    "GET /api/loyalty/games/texts",
    "POST /api/loyalty/games/texts"
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


  registered.push(...routes.registerGet(app, "/api/loyalty/games/gamble/status", core.asyncRoute(async (req, res) => { refreshConfigFromSettings(); core.sendOk(res, decorateGambleStatus(gamble ? gamble.getStatus() : { ok: false, error: "gamble_not_loaded", lastError: "gamble_not_loaded" })); })));
  registered.push(...routes.registerGet(app, "/api/loyalty/games/gamble/config", core.asyncRoute(async (req, res) => { refreshConfigFromSettings(); core.sendOk(res, { game: "gamble", config: gamble ? gamble.getPublicConfig() : (config.games && config.games.gamble ? config.games.gamble : {}) }); })));
  registered.push(...routes.registerGet(app, "/api/loyalty/games/gamble/dashboard-config", core.asyncRoute(async (req, res) => { core.sendOk(res, buildGambleDashboardConfigPayload()); })));
  registered.push(...routes.registerPost(app, "/api/loyalty/games/gamble/dashboard-config", core.asyncRoute(async (req, res) => { const result = handleGambleDashboardWrite(req.body || {}); if (!result.ok) return core.sendFail(res, result.error || "dashboard_write_failed", result.statusCode || 400, result); core.sendOk(res, result); })));
  registered.push(...routes.registerGet(app, "/api/loyalty/games/gamble/dashboard-audit", core.asyncRoute(async (req, res) => { core.sendOk(res, listDashboardAudit({ limit: req.query.limit })); })));
  registered.push(...routes.registerPost(app, "/api/loyalty/games/gamble/play", core.asyncRoute(async (req, res) => { const result = startGamble({ ...(req.body || {}), ...(req.query || {}), source: req.body?.source || req.query?.source || "api" }); if (!result.ok) return core.sendFail(res, result.error || "gamble_failed", result.statusCode || 409, result); core.sendOk(res, result); })));
  registered.push(...routes.registerPost(app, "/api/loyalty/games/runtime/chat-command", core.asyncRoute(async (req, res) => { core.sendOk(res, handleChatCommandRuntime(req.body || {})); })));
  registered.push(...routes.registerGet(app, "/api/loyalty/games/central-commands", core.asyncRoute(async (req, res) => { core.sendOk(res, seedCentralCommandDefinitions()); })));
  registered.push(...routes.registerGet(app, "/api/loyalty/games/texts", core.asyncRoute(async (req, res) => { core.sendOk(res, getChatTextEditorPayload()); })));
  registered.push(...routes.registerPost(app, "/api/loyalty/games/texts", core.asyncRoute(async (req, res) => { core.sendOk(res, handleChatTextEditorPayload(req.body || {})); })));

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
      settings: { removeAfterWin: body.removeAfterWin !== false },
      fields: Array.isArray(body.fields) ? body.fields : []
    });
    if (!result.ok) return core.sendFail(res, result.error || "preset_create_failed", result.statusCode || 400, result);
    return core.sendOk(res, result);
  })));

  registered.push(...routes.registerPut(app, "/api/loyalty/games/wheel/presets/:presetUid", core.asyncRoute(async (req, res) => {
    const result = presetStore.updatePreset(req.params.presetUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "preset_update_failed", result.statusCode || 409, result);
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
    ensureSettingsSeeded(config);
    refreshConfigFromSettings();
    ensureTextsSeeded();

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

    gamble = gambleFactory.createGambleGame({
      hostModule: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      config: config.games && config.games.gamble ? config.games.gamble : DEFAULT_CONFIG.games.gamble,
      hostEnabled: !!config.enabled,
      loyalty: loyaltyCore._private || {},
      db: { insertSession, updateSession, getSession, listSessions },
      broadcast,
      emitEvent,
      renderText: renderGameText,
      nowIso: core.nowIso
    });

    seedCentralCommandDefinitions();

    if (ctx && ctx.app) registerRoutes(ctx.app);


    moduleBusHandle = createCommunicationBusHandle(MODULE_META, buildStatus);
    const moduleBusStart = moduleBusHandle.start();
    state.eventBusReady = moduleBusStart && moduleBusStart.ok === true;

    console.log(`[${MODULE_NAME}] loaded v${MODULE_VERSION} games=wheel,gamble presets=true enabled=${!!config.enabled} communicationBus=${state.eventBusReady ? "ready" : "unavailable"}`);
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
    emitEvent,
    startWheelSpin,
    startGamble,
    handleChatCommandRuntime,
    seedCentralCommandDefinitions,
    getChatTextEditorPayload,
    buildGambleDashboardConfigPayload
  }
};
