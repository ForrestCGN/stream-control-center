"use strict";

/**
 * Loyalty / Kekskrümel Core
 *
 * STEP210:
 * - API-Cleanup: Ranking liefert total + rankTotal, Can-Afford liefert required + amount
 * - Status-/Dashboard-Felder bleiben rueckwaertskompatibel, aber eindeutiger fuer Tests
 *
 * STEP209:
 * - Zentrale Loyalty-Safety-Schicht: verfuegbare Kekskruemel, Reservierungen, sichere Buchungen und Punkte-Rang
 * - Points-Commands werden DB-basiert vorbereitet, bleiben aber deaktiviert bis Loyalty-Freigabe
 *
 * STEP208:
 * - Subscribe/Resub-Kollisionen werden dedupliziert: ein kurz vor einem Resub gebuchter Subscribe wird kompensiert
 *
 * STEP207:
 * - AutoRunner-Recovery startet den Runner nach Backend-Neustart erneut, wenn der gespeicherte Stream-State noch live ist
 *
 * STEP205:
 * - Doppelte Stream-State Start/Stop-Signale werden geloggt, ohne den bestehenden State-Source zu ueberschreiben
 *
 * STEP204:
 * - Stream-State Start/Stop koppelt AutoRunner konfigurierbar und idempotent
 * - Runner-Start/-Stop-Quellen werden in loyalty_runner_events geloggt
 *
 * STEP203:
 * - Shadow Mode zuerst
 * - StreamElements bleibt aktiv
 * - DB-first, JSON nur Seed/Fallback/technische Boot-Konfig
 * - alle Punkteänderungen als Transaktion
 */

const crypto = require("crypto");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const settingsHelper = require("./helpers/helper_settings");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");

const MODULE_NAME = "loyalty";
const VERSION = "0.1.16";
const MODULE_VERSION = VERSION;
const STREAM_STATUS_API_PATH = "/api/twitch/events/stream-state";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: "runtime",
  category: "loyalty",
  legacy: false,
  routesPrefix: ["/api/loyalty"],
  bus: {
    publishes: ["loyalty.status", "loyalty.event", "loyalty.points.balance.checked", "loyalty.points.transaction.created", "loyalty.points.reservation.created", "loyalty.points.reservation.released", "loyalty.points.reservation.committed"],
    consumes: ["twitch.stream.online", "twitch.stream.offline", "twitch.follow.received", "twitch.sub.received", "twitch.resub.received", "twitch.subgift.received", "twitch.giftbomb.received", "twitch.cheer.received", "twitch.raid.received"]
  },
  description: "Loyalty/Kekskruemel runtime, points, events and auto-runner"
};
const CONFIG_FILE = "loyalty.json";
const SCHEMA_MODULE = "loyalty";
const SCHEMA_VERSION = 4;
const SETTINGS_TABLE = "loyalty_settings";

const TWITCH_EVENT_BONUS_MAP = {
  "twitch.follow.received": "follow",
  "twitch.sub.received": "subscribe",
  "twitch.resub.received": "resub",
  "twitch.subgift.received": "gift_sub",
  "twitch.giftbomb.received": "gift_bomb",
  "twitch.cheer.received": "cheer",
  "twitch.raid.received": "raid"
};

const TWITCH_EVENT_BONUS_KEYS = Object.keys(TWITCH_EVENT_BONUS_MAP);

const POINTS_TEXT_MODULE = MODULE_NAME;

const CENTRAL_COMMAND_DEFINITIONS = [
  {
    trigger: "punkte",
    aliases: ["points"],
    moduleKey: MODULE_NAME,
    actionKey: "points_chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/runtime/points-command",
    enabled: false,
    permissionLevel: "everyone",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 5000,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP209",
      actionType: "module_command",
      moduleCommand: "punkte",
      rawInputMode: true,
      activationState: "prepared_disabled",
      note: "Ohne Zieluser fuer alle; @user-Abfrage wird in der Runtime erst ab Mod/Broadcaster erlaubt."
    }
  },
  {
    trigger: "givepoints",
    aliases: [],
    moduleKey: MODULE_NAME,
    actionKey: "points_chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/runtime/points-command",
    enabled: false,
    permissionLevel: "mod",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 2500,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP209",
      actionType: "module_command",
      moduleCommand: "givepoints",
      rawInputMode: true,
      activationState: "prepared_disabled"
    }
  },
  {
    trigger: "setpoint",
    aliases: [],
    moduleKey: MODULE_NAME,
    actionKey: "points_chat_command_runtime",
    targetMethod: "POST",
    targetUrl: "/api/loyalty/runtime/points-command",
    enabled: false,
    permissionLevel: "streamer",
    cooldownGlobalMs: 1000,
    cooldownUserMs: 2500,
    liveOnly: false,
    responseMode: "module",
    config: {
      seededBy: "STEP209",
      actionType: "module_command",
      moduleCommand: "setpoint",
      rawInputMode: true,
      activationState: "prepared_disabled"
    }
  }
];

const DEFAULT_CONFIG = {
  enabled: true,
  mode: "shadow",
  currency: {
    name: "Kekskrümel"
  },
  watch: {
    enabled: true,
    amount: 2,
    intervalMinutes: 10,
    subscriberMultiplier: 3,
    subscriberTierAmounts: { "1000": 6, "2000": 8, "3000": 10 }
  },
  features: {
    publicCommandsEnabled: false,
    modCommandsEnabled: true,
    watchEarningEnabled: true,
    eventBonusesEnabled: false,
    rewardsEnabled: false,
    giveawaysEnabled: false,
    gamesEnabled: false
  },
  bonuses: {
    follow: { enabled: true, amount: 10 },
    tip: { enabled: true, amountPerEuro: 10 },
    subscribe: { enabled: true, amount: 50, tierAmounts: { "1000": 50, "2000": 100, "3000": 150 } },
    resub: { enabled: true, amount: 50, tierAmounts: { "1000": 50, "2000": 100, "3000": 150 } },
    giftSubGiver: { enabled: false, amount: 50, tierAmounts: { "1000": 50, "2000": 100, "3000": 150 } },
    giftSubReceiver: { enabled: false, amount: 25, tierAmounts: { "1000": 25, "2000": 50, "3000": 75 } },
    subStreak: {
      enabled: false,
      rules: [
        { months: 3, amount: 25 },
        { months: 6, amount: 50 },
        { months: 12, amount: 100 }
      ]
    },
    cheer: { enabled: true, amountPer100Bits: 10 },
    raid: { enabled: true, amount: 50 }
  },
  ignoredUsers: [
    "streamelements",
    "forrestcgn"
  ],
  expiration: {
    enabled: true,
    inactiveAfterDays: 365
  },
  import: {
    status: "not_imported",
    provider: "streamelements"
  },
  streamState: {
    broadcasterLogin: "forrestcgn",
    broadcasterId: "127709954",
    autoProvider: "twitch",
    manualOverrideMaxHours: 12
  },
  presence: {
    activeMinutes: 30,
    includeJoinedOnly: true,
    maxUsersPerRun: 250
  },
  autoRunner: {
    enabledOnBoot: false,
    intervalSeconds: 60,
    runOnlyWhenLive: true,
    checkAutoLive: true,
    includeJoinedOnly: true,
    activeMinutes: 30,
    maxUsersPerRun: 250,
    startOnStreamStateStart: true,
    stopOnStreamStateStop: true,
    startOnAutoLive: true,
    stopOnAutoOffline: false
  },
  eventDedupe: {
    subscribeResubCollision: {
      enabled: true,
      windowSeconds: 60
    }
  }
};

const DEFAULT_TEXTS = {
  balance_reply: [
    "{displayName} hat aktuell {points} {currencyName}.",
    "Kontostand für {displayName}: {points} {currencyName}."
  ],
  balance_shadow_reply: [
    "{displayName} hat im Shadow Mode aktuell {points} {currencyName}."
  ],
  adjusted_reply: [
    "{displayName}: {amount} {currencyName} gebucht. Neuer Stand: {points}."
  ],
  ignored_user_reply: [
    "{displayName} ist für Loyalty ignoriert."
  ],
  error_user_required: [
    "Bitte einen User angeben."
  ],
  error_invalid_amount: [
    "Bitte eine gültige Punktzahl angeben."
  ],
  "points.self": [
    "{user}, die Heimleitung hat nachgezählt: {available} verfügbare {currencyName}. Platz {rank} von {rankTotal}.",
    "{user}, deine Keksdose klimpert mit {available} verfügbaren {currencyName}. Damit liegst du auf Platz {rank}/{rankTotal}.",
    "{user}, laut Rentnerkasse hast du {available} verfügbare {currencyName}. Die Heimleitung führt dich auf Platz {rank} von {rankTotal}."
  ],
  "points.self_unranked": [
    "{user}, die Keksdose ist noch leer: {available} verfügbare {currencyName}. Für die Rangliste braucht es mindestens einen Krümel.",
    "{user}, die Heimleitung findet aktuell {available} verfügbare {currencyName}. Noch kein Rang in der Krümel-Liga."
  ],
  "points.other": [
    "{actor}, die Heimleitung meldet: {target} hat {available} verfügbare {currencyName} und steht auf Platz {rank} von {rankTotal}.",
    "{target} hat {available} verfügbare {currencyName}. Die Rentnerkasse führt Platz {rank}/{rankTotal}."
  ],
  "points.permission_denied": [
    "{user}, fremde Keksdosen öffnet nur die Heimleitung. Dafür brauchst du mindestens Mod-Rechte.",
    "{user}, die Rentnerkasse bleibt zu. @User-Abfragen sind erst ab Mod erlaubt."
  ],
  "points.user_not_found": [
    "{user}, die Heimleitung findet diesen Namen nicht in der Keksdose.",
    "{user}, dieser User steht noch nicht im Krümel-Register."
  ],
  "points.disabled": [
    "{user}, das Kekskrümel-System ist vorbereitet, aber die Heimleitung hat den Schalter noch nicht freigegeben.",
    "{user}, die Keksdose ist noch im Verwaltungsmodus. Punkte-Commands sind noch deaktiviert."
  ],
  "points.give_success": [
    "{target} bekommt {amount} {currencyName} von der Heimleitung. Neuer verfügbarer Stand: {available}.",
    "Die Rentnerkasse bucht {target} {amount} {currencyName} gut. Verfügbar jetzt: {available}."
  ],
  "points.set_success": [
    "Die Heimleitung hat {target} auf {targetBalance} {currencyName} gesetzt. Verfügbar: {available}.",
    "Rentnerkasse korrigiert: {target} steht jetzt bei {targetBalance} {currencyName}. Verfügbar: {available}."
  ],
  "points.invalid_amount": [
    "{user}, diese Punktzahl bringt die Rentnerkasse durcheinander.",
    "{user}, bitte eine gültige Anzahl Kekskrümel angeben."
  ],
  "points.insufficient_balance": [
    "{user}, dafür reichen die verfügbaren Kekskrümel nicht. Verfügbar: {available}, benötigt: {amount}.",
    "{user}, die Heimleitung winkt ab: {amount} gebraucht, {available} verfügbar."
  ]
};

const SETTINGS_DEFINITIONS = [
  { key: "enabled", path: "enabled", valueType: "boolean", description: "Loyalty-System aktivieren/deaktivieren." },
  { key: "mode", path: "mode", valueType: "string", description: "Loyalty-Modus: off, shadow oder live." },
  { key: "currency.name", path: "currency.name", valueType: "string", description: "Name der Währung, z. B. Kekskrümel." },

  { key: "watch.enabled", path: "watch.enabled", valueType: "boolean", description: "Watch-Punkte grundsätzlich aktivieren." },
  { key: "watch.amount", path: "watch.amount", valueType: "number", description: "Punkte pro Watch-Intervall." },
  { key: "watch.intervalMinutes", path: "watch.intervalMinutes", valueType: "number", description: "Watch-Intervall in Minuten." },
  { key: "watch.subscriberMultiplier", path: "watch.subscriberMultiplier", valueType: "number", description: "Fallback-Multiplikator für Subscriber im Watch-Intervall." },
  { key: "watch.subscriberTierAmounts", path: "watch.subscriberTierAmounts", valueType: "json", description: "Watch-Punkte je Subscriber-Tier, z. B. 1000/2000/3000." },

  { key: "features.publicCommandsEnabled", path: "features.publicCommandsEnabled", valueType: "boolean", description: "Öffentliche Chat-Commands erlauben." },
  { key: "features.modCommandsEnabled", path: "features.modCommandsEnabled", valueType: "boolean", description: "Mod/Admin-Commands erlauben." },
  { key: "features.watchEarningEnabled", path: "features.watchEarningEnabled", valueType: "boolean", description: "Watch-Earning im aktuellen Modus aktivieren." },
  { key: "features.eventBonusesEnabled", path: "features.eventBonusesEnabled", valueType: "boolean", description: "Event-Boni im aktuellen Modus aktivieren." },
  { key: "features.rewardsEnabled", path: "features.rewardsEnabled", valueType: "boolean", description: "Rewards/Store im aktuellen Modus aktivieren." },
  { key: "features.giveawaysEnabled", path: "features.giveawaysEnabled", valueType: "boolean", description: "Giveaways im aktuellen Modus aktivieren." },
  { key: "features.gamesEnabled", path: "features.gamesEnabled", valueType: "boolean", description: "Chat-Games im aktuellen Modus aktivieren." },

  { key: "bonuses.follow.enabled", path: "bonuses.follow.enabled", valueType: "boolean", description: "Follow-Bonus aktivieren." },
  { key: "bonuses.follow.amount", path: "bonuses.follow.amount", valueType: "number", description: "Follow-Bonus in Punkten." },
  { key: "bonuses.tip.enabled", path: "bonuses.tip.enabled", valueType: "boolean", description: "Tip-Bonus aktivieren." },
  { key: "bonuses.tip.amountPerEuro", path: "bonuses.tip.amountPerEuro", valueType: "number", description: "Tip-Bonus pro 1 EUR." },
  { key: "bonuses.subscribe.enabled", path: "bonuses.subscribe.enabled", valueType: "boolean", description: "Sub-Bonus aktivieren." },
  { key: "bonuses.subscribe.amount", path: "bonuses.subscribe.amount", valueType: "number", description: "Sub-Bonus in Punkten." },
  { key: "bonuses.subscribe.tierAmounts", path: "bonuses.subscribe.tierAmounts", valueType: "json", description: "Sub-Bonus je Tier als JSON-Objekt, z. B. 1000/2000/3000." },
  { key: "bonuses.resub.enabled", path: "bonuses.resub.enabled", valueType: "boolean", description: "Resub-Bonus aktivieren." },
  { key: "bonuses.resub.amount", path: "bonuses.resub.amount", valueType: "number", description: "Resub-Bonus in Punkten." },
  { key: "bonuses.resub.tierAmounts", path: "bonuses.resub.tierAmounts", valueType: "json", description: "Resub-Bonus je Tier als JSON-Objekt, z. B. 1000/2000/3000." },
  { key: "bonuses.giftSubGiver.enabled", path: "bonuses.giftSubGiver.enabled", valueType: "boolean", description: "Gift-Sub-Gifter-Bonus aktivieren." },
  { key: "bonuses.giftSubGiver.amount", path: "bonuses.giftSubGiver.amount", valueType: "number", description: "Gift-Sub-Gifter-Bonus in Punkten." },
  { key: "bonuses.giftSubGiver.tierAmounts", path: "bonuses.giftSubGiver.tierAmounts", valueType: "json", description: "Gift-Sub-Gifter-Bonus je Tier als JSON-Objekt." },
  { key: "bonuses.giftSubReceiver.enabled", path: "bonuses.giftSubReceiver.enabled", valueType: "boolean", description: "Gift-Sub-Empfänger-Bonus aktivieren." },
  { key: "bonuses.giftSubReceiver.amount", path: "bonuses.giftSubReceiver.amount", valueType: "number", description: "Gift-Sub-Empfänger-Bonus in Punkten." },
  { key: "bonuses.giftSubReceiver.tierAmounts", path: "bonuses.giftSubReceiver.tierAmounts", valueType: "json", description: "Gift-Sub-Empfänger-Bonus je Tier als JSON-Objekt." },
  { key: "bonuses.subStreak.enabled", path: "bonuses.subStreak.enabled", valueType: "boolean", description: "Sub-Streak-Bonus aktivieren." },
  { key: "bonuses.subStreak.rules", path: "bonuses.subStreak.rules", valueType: "json", description: "Sub-Streak-Regeln als JSON-Array." },
  { key: "bonuses.cheer.enabled", path: "bonuses.cheer.enabled", valueType: "boolean", description: "Cheer/Bits-Bonus aktivieren." },
  { key: "bonuses.cheer.amountPer100Bits", path: "bonuses.cheer.amountPer100Bits", valueType: "number", description: "Punkte pro 100 Bits." },
  { key: "bonuses.raid.enabled", path: "bonuses.raid.enabled", valueType: "boolean", description: "Raid-Bonus aktivieren." },
  { key: "bonuses.raid.amount", path: "bonuses.raid.amount", valueType: "number", description: "Raid-Bonus in Punkten." },

  { key: "expiration.enabled", path: "expiration.enabled", valueType: "boolean", description: "Punkteverfall aktivieren." },
  { key: "expiration.inactiveAfterDays", path: "expiration.inactiveAfterDays", valueType: "number", description: "Inaktivitätstage bis Punkteverfall." },
  { key: "import.status", path: "import.status", valueType: "string", description: "Importstatus: not_imported, dry_run oder imported." },
  { key: "import.provider", path: "import.provider", valueType: "string", description: "Geplanter Import-Provider." },

  { key: "streamState.broadcasterLogin", path: "streamState.broadcasterLogin", valueType: "string", description: "Twitch Broadcaster Login fuer Live-Status-Pruefung." },
  { key: "streamState.broadcasterId", path: "streamState.broadcasterId", valueType: "string", description: "Twitch Broadcaster ID fuer Channel Summary." },
  { key: "streamState.autoProvider", path: "streamState.autoProvider", valueType: "string", description: "Automatischer Live-Status-Provider, aktuell twitch." },
  { key: "streamState.manualOverrideMaxHours", path: "streamState.manualOverrideMaxHours", valueType: "number", description: "Maximales Alter des manuellen Stream-State-Overrides in Stunden." },

  { key: "presence.activeMinutes", path: "presence.activeMinutes", valueType: "number", description: "Zeitfenster fuer aktive/presente Twitch-Presence-User." },
  { key: "presence.includeJoinedOnly", path: "presence.includeJoinedOnly", valueType: "boolean", description: "JOIN-only User im Presence Runner beruecksichtigen." },
  { key: "presence.maxUsersPerRun", path: "presence.maxUsersPerRun", valueType: "number", description: "Maximale Anzahl Presence-User pro Run." },

  { key: "autoRunner.enabledOnBoot", path: "autoRunner.enabledOnBoot", valueType: "boolean", description: "Auto Runner beim Backend-Start automatisch aktivieren." },
  { key: "autoRunner.intervalSeconds", path: "autoRunner.intervalSeconds", valueType: "number", description: "Auto Runner Intervall in Sekunden." },
  { key: "autoRunner.runOnlyWhenLive", path: "autoRunner.runOnlyWhenLive", valueType: "boolean", description: "Auto Runner nur bei Live-Status laufen lassen." },
  { key: "autoRunner.checkAutoLive", path: "autoRunner.checkAutoLive", valueType: "boolean", description: "Vor jedem Runner-Lauf Twitch Auto-Live-Status aktualisieren." },
  { key: "autoRunner.includeJoinedOnly", path: "autoRunner.includeJoinedOnly", valueType: "boolean", description: "JOIN-only Twitch-Presence-User im Auto Runner beruecksichtigen." },
  { key: "autoRunner.activeMinutes", path: "autoRunner.activeMinutes", valueType: "number", description: "Presence-Zeitfenster fuer Auto Runner." },
  { key: "autoRunner.maxUsersPerRun", path: "autoRunner.maxUsersPerRun", valueType: "number", description: "Maximale Presence-User pro Auto Runner Lauf." },
  { key: "autoRunner.startOnStreamStateStart", path: "autoRunner.startOnStreamStateStart", valueType: "boolean", description: "Auto Runner automatisch starten, wenn Stream-State manuell/extern auf live gesetzt wird." },
  { key: "autoRunner.stopOnStreamStateStop", path: "autoRunner.stopOnStreamStateStop", valueType: "boolean", description: "Auto Runner automatisch stoppen, wenn Stream-State manuell/extern auf offline gesetzt wird." },
  { key: "autoRunner.startOnAutoLive", path: "autoRunner.startOnAutoLive", valueType: "boolean", description: "Auto Runner automatisch starten, wenn die Twitch-Auto-Pruefung live meldet." },
  { key: "autoRunner.stopOnAutoOffline", path: "autoRunner.stopOnAutoOffline", valueType: "boolean", description: "Auto Runner automatisch stoppen, wenn die Twitch-Auto-Pruefung offline meldet." },

  { key: "eventDedupe.subscribeResubCollision.enabled", path: "eventDedupe.subscribeResubCollision.enabled", valueType: "boolean", description: "Subscribe/Resub-Kollisionen fuer denselben User deduplizieren." },
  { key: "eventDedupe.subscribeResubCollision.windowSeconds", path: "eventDedupe.subscribeResubCollision.windowSeconds", valueType: "number", description: "Zeitfenster in Sekunden, in dem ein Subscribe durch einen folgenden Resub ersetzt wird." }
];

const TEXT_CATEGORIES = {
  balance_reply: "chat",
  balance_shadow_reply: "chat",
  adjusted_reply: "chat",
  ignored_user_reply: "chat",
  error_user_required: "errors",
  error_invalid_amount: "errors",
  "points.self": "chat_points",
  "points.self_unranked": "chat_points",
  "points.other": "chat_points",
  "points.permission_denied": "chat_points",
  "points.user_not_found": "chat_points",
  "points.disabled": "chat_points",
  "points.give_success": "chat_admin",
  "points.set_success": "chat_admin",
  "points.invalid_amount": "chat_errors",
  "points.insufficient_balance": "chat_errors"
};

const TEXT_CATEGORY_LABELS = {
  chat: "Chat · Allgemein",
  errors: "Fehler",
  chat_points: "Chat · Punkte",
  chat_admin: "Chat · Punkteverwaltung",
  chat_errors: "Chat · Punkte-Fehler"
};

let state = {
  loadedAt: core.nowIso(),
  configPath: "",
  configOk: false,
  configError: "",
  settings: {
    ok: false,
    table: SETTINGS_TABLE,
    count: 0,
    inserted: 0,
    lastError: ""
  },
  texts: {
    ok: false,
    inserted: 0,
    lastError: ""
  },
  schema: {
    ok: false,
    version: SCHEMA_VERSION,
    lastError: ""
  },
  streamStatusBinding: {
    installed: false,
    subscriptionId: "",
    lastSyncAt: "",
    lastEventAt: "",
    lastEventKey: "",
    lastLive: null,
    lastSource: "",
    lastReason: "",
    lastResult: null,
    errors: 0,
    lastError: ""
  },
  twitchEventBonusBinding: {
    installed: false,
    subscriptionId: "",
    subscribedAction: "received",
    consumedEvents: [...TWITCH_EVENT_BONUS_KEYS],
    lastEventAt: "",
    lastEventKey: "",
    lastLogin: "",
    lastResult: null,
    received: 0,
    processed: 0,
    skipped: 0,
    duplicates: 0,
    errors: 0,
    lastError: ""
  },
  lastError: ""
};

const autoRunnerState = {
  enabled: false,
  running: false,
  timer: null,
  startedAt: "",
  stoppedAt: "",
  lastRunAt: "",
  lastRunResult: null,
  lastError: "",
  runCount: 0,
  successCount: 0,
  errorCount: 0,
  trigger: ""
};

let config = DEFAULT_CONFIG;

function getNestedValue(object, dottedPath, fallback = undefined) {
  if (!object || typeof object !== "object") return fallback;
  const parts = String(dottedPath || "").split(".").map(part => part.trim()).filter(Boolean);
  let current = object;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return fallback;
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

function setNestedValue(object, dottedPath, value) {
  const parts = String(dottedPath || "").split(".").map(part => part.trim()).filter(Boolean);
  if (!parts.length) return object;
  let current = object;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return object;
}

function hasNestedValue(object, dottedPath) {
  if (!object || typeof object !== "object") return false;
  const parts = String(dottedPath || "").split(".").map(part => part.trim()).filter(Boolean);
  let current = object;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return false;
    current = current[part];
  }
  return true;
}

function mergePlain(base, extra) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return { ...(base || {}) };
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = mergePlain(out[key], value);
    } else if (Array.isArray(value)) {
      out[key] = value.map(item => item && typeof item === "object" ? { ...item } : item);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function normalizeMode(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["off", "shadow", "live"].includes(raw)) return raw;
  return "shadow";
}

function normalizeImportStatus(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["not_imported", "dry_run", "imported"].includes(raw)) return raw;
  return "not_imported";
}

function normalizeSettingValue(def, value) {
  const key = String(def && def.key || "");
  const type = String(def && def.valueType || "").toLowerCase();

  if (key === "mode") return normalizeMode(value);
  if (key === "import.status") return normalizeImportStatus(value);

  if (type === "boolean") return value === true || value === 1 || ["1", "true", "yes", "ja", "on"].includes(String(value).trim().toLowerCase());
  if (type === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : Number(getNestedValue(DEFAULT_CONFIG, def.path, 0) || 0);
  }
  if (type === "json") {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return value;
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch (_) { return getNestedValue(DEFAULT_CONFIG, def.path, []); }
    }
    return getNestedValue(DEFAULT_CONFIG, def.path, []);
  }

  return String(value ?? "").trim();
}

function settingDefaultsFromConfig(sourceConfig) {
  const source = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : DEFAULT_CONFIG;
  return SETTINGS_DEFINITIONS.map(def => {
    const fallback = getNestedValue(DEFAULT_CONFIG, def.path, null);
    const value = getNestedValue(source, def.path, fallback);
    return {
      key: def.key,
      value: normalizeSettingValue(def, value),
      valueType: def.valueType,
      description: def.description
    };
  });
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
  config = mergePlain(DEFAULT_CONFIG, loaded.data || loaded.config || {});
  return config;
}

function ensureSettingsSeeded(sourceConfig) {
  const result = settingsHelper.seedDefaults(SETTINGS_TABLE, settingDefaultsFromConfig(sourceConfig || config));
  state.settings.ok = !!result.ok;
  state.settings.table = result.table || SETTINGS_TABLE;
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
  next.mode = normalizeMode(next.mode);
  next.import.status = normalizeImportStatus(next.import.status);
  return next;
}

function refreshConfigFromSettings() {
  config = applySettingsToConfig(config);
  return config;
}

function saveSettingsFromInput(input) {
  const source = input && typeof input === "object" ? input : {};
  const rows = [];
  let saved = 0;

  for (const def of SETTINGS_DEFINITIONS) {
    let value;
    let found = false;

    if (Object.prototype.hasOwnProperty.call(source, def.key)) {
      value = source[def.key];
      found = true;
    } else if (hasNestedValue(source, def.path)) {
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
      const result = textHelper.seedModuleTextVariants(MODULE_NAME, DEFAULT_TEXTS, {
        categories: TEXT_CATEGORIES,
        categoryLabels: TEXT_CATEGORY_LABELS,
        defaultCategory: "chat",
        source: "seed"
      });
      state.texts.ok = true;
      state.texts.inserted = Number(result.inserted || 0);
      state.texts.lastError = "";
      return result;
    }

    if (typeof textHelper.seedModuleTexts === "function") {
      const result = textHelper.seedModuleTexts(MODULE_NAME, DEFAULT_TEXTS, { source: "seed" });
      state.texts.ok = true;
      state.texts.inserted = Number(result.inserted || 0);
      state.texts.lastError = "";
      return result;
    }

    state.texts.ok = false;
    state.texts.lastError = "text_helper_seed_not_available";
    return { ok: false, error: state.texts.lastError };
  } catch (err) {
    state.texts.ok = false;
    state.texts.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.texts.lastError };
  }
}

function ensureSchema() {
  database.ensureReady();
  database.ensureSchema(SCHEMA_MODULE, SCHEMA_VERSION, (fromVersion, toVersion, db) => {
    if (toVersion === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_users (
          id ${database.primaryKeyAutoIncrementSql()},
          user_login TEXT NOT NULL UNIQUE,
          user_display_name TEXT NOT NULL DEFAULT '',
          balance_shadow INTEGER NOT NULL DEFAULT 0,
          balance_live INTEGER NOT NULL DEFAULT 0,
          total_earned_shadow INTEGER NOT NULL DEFAULT 0,
          total_spent_shadow INTEGER NOT NULL DEFAULT 0,
          total_earned_live INTEGER NOT NULL DEFAULT 0,
          total_spent_live INTEGER NOT NULL DEFAULT 0,
          last_seen_at TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_users_login ON loyalty_users(user_login);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_users_shadow ON loyalty_users(balance_shadow);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_users_live ON loyalty_users(balance_live);`);

      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id ${database.primaryKeyAutoIncrementSql()},
          transaction_uid TEXT NOT NULL UNIQUE,
          user_login TEXT NOT NULL,
          user_display_name TEXT NOT NULL DEFAULT '',
          amount INTEGER NOT NULL DEFAULT 0,
          balance_before INTEGER NOT NULL DEFAULT 0,
          balance_after INTEGER NOT NULL DEFAULT 0,
          balance_field TEXT NOT NULL DEFAULT 'shadow',
          type TEXT NOT NULL DEFAULT '',
          source_module TEXT NOT NULL DEFAULT 'loyalty',
          source_provider TEXT NOT NULL DEFAULT 'stream_control_center',
          mode TEXT NOT NULL DEFAULT 'shadow',
          reason TEXT NOT NULL DEFAULT '',
          reference_type TEXT NOT NULL DEFAULT '',
          reference_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_login);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created ON loyalty_transactions(created_at);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_mode ON loyalty_transactions(mode);`);

      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_reservations (
          id ${database.primaryKeyAutoIncrementSql()},
          reservation_uid TEXT NOT NULL UNIQUE,
          user_login TEXT NOT NULL,
          user_display_name TEXT NOT NULL DEFAULT '',
          amount INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'held',
          mode TEXT NOT NULL DEFAULT 'shadow',
          source_module TEXT NOT NULL DEFAULT 'loyalty',
          source_provider TEXT NOT NULL DEFAULT 'stream_control_center',
          reference_type TEXT NOT NULL DEFAULT '',
          reference_id TEXT NOT NULL DEFAULT '',
          reason TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          expires_at TEXT NOT NULL DEFAULT '',
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_user ON loyalty_reservations(user_login);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_status ON loyalty_reservations(status);`);

      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_imports (
          id ${database.primaryKeyAutoIncrementSql()},
          import_uid TEXT NOT NULL UNIQUE,
          source_provider TEXT NOT NULL DEFAULT 'streamelements',
          status TEXT NOT NULL DEFAULT 'created',
          mode TEXT NOT NULL DEFAULT 'shadow',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          source_imported_at TEXT NOT NULL DEFAULT '',
          source_external_id TEXT NOT NULL DEFAULT '',
          source_raw_json TEXT NOT NULL DEFAULT '{}',
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_ignored_users (
          id ${database.primaryKeyAutoIncrementSql()},
          user_login TEXT NOT NULL UNIQUE,
          reason TEXT NOT NULL DEFAULT '',
          enabled INTEGER NOT NULL DEFAULT 1,
          source TEXT NOT NULL DEFAULT 'seed',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_ignored_users_enabled ON loyalty_ignored_users(enabled);`);
    }

    if (toVersion === 2) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS loyalty_watch_state (
          user_login TEXT PRIMARY KEY,
          user_display_name TEXT NOT NULL DEFAULT '',
          mode TEXT NOT NULL DEFAULT 'shadow',
          subscriber INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'manual',
          last_heartbeat_at TEXT NOT NULL DEFAULT '',
          last_reward_at TEXT NOT NULL DEFAULT '',
          next_reward_at TEXT NOT NULL DEFAULT '',
          heartbeat_count INTEGER NOT NULL DEFAULT 0,
          reward_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_last_heartbeat ON loyalty_watch_state(last_heartbeat_at);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_next_reward ON loyalty_watch_state(next_reward_at);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_mode ON loyalty_watch_state(mode);`);
    }
  });

  // Safety net: keep the watch-state table available even if an older schema marker already existed.
  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_watch_state (
      user_login TEXT PRIMARY KEY,
      user_display_name TEXT NOT NULL DEFAULT '',
      mode TEXT NOT NULL DEFAULT 'shadow',
      subscriber INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual',
      last_heartbeat_at TEXT NOT NULL DEFAULT '',
      last_reward_at TEXT NOT NULL DEFAULT '',
      next_reward_at TEXT NOT NULL DEFAULT '',
      heartbeat_count INTEGER NOT NULL DEFAULT 0,
      reward_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_last_heartbeat ON loyalty_watch_state(last_heartbeat_at);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_next_reward ON loyalty_watch_state(next_reward_at);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_watch_state_mode ON loyalty_watch_state(mode);`);

  state.schema.ok = true;
  state.schema.lastError = "";
  seedIgnoredUsersFromConfig(config.ignoredUsers || []);
  return true;
}

function normalizeLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function cleanDisplayName(login, displayName = "") {
  const display = String(displayName || "").trim();
  return display || String(login || "").trim();
}

function uid(prefix) {
  const random = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${Date.now()}_${random}`;
}

function modeBalanceField(mode) {
  return normalizeMode(mode) === "live" ? "balance_live" : "balance_shadow";
}

function modeTotalFields(mode) {
  const suffix = normalizeMode(mode) === "live" ? "live" : "shadow";
  return {
    earned: `total_earned_${suffix}`,
    spent: `total_spent_${suffix}`
  };
}

function publicConfig() {
  return {
    enabled: !!config.enabled,
    mode: normalizeMode(config.mode),
    currency: { ...config.currency },
    watch: { ...config.watch },
    features: { ...config.features },
    bonuses: mergePlain({}, config.bonuses),
    expiration: { ...config.expiration },
    import: { ...config.import },
    streamState: { ...config.streamState },
    presence: { ...config.presence },
    autoRunner: { ...config.autoRunner }
  };
}

function getIgnoredUsers() {
  ensureSchema();
  return database.all(`
    SELECT id, user_login, reason, enabled, source, created_at, updated_at
    FROM loyalty_ignored_users
    ORDER BY user_login ASC
  `).map(row => ({
    id: row.id,
    login: row.user_login,
    reason: row.reason || "",
    enabled: Number(row.enabled) !== 0,
    source: row.source || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  }));
}

function seedIgnoredUsersFromConfig(list) {
  const now = core.nowIso();
  const source = Array.isArray(list) ? list : [];
  let inserted = 0;

  for (const item of source) {
    const login = normalizeLogin(item);
    if (!login) continue;
    const existing = database.get("SELECT user_login FROM loyalty_ignored_users WHERE user_login = :login", { login });
    if (existing) continue;
    const result = database.run(`
      INSERT INTO loyalty_ignored_users
        (user_login, reason, enabled, source, created_at, updated_at)
      VALUES
        (:login, :reason, 1, 'seed', :createdAt, :updatedAt)
    `, {
      login,
      reason: "seed_default",
      createdAt: now,
      updatedAt: now
    });
    inserted += Number(result?.changes || 0);
  }

  return { ok: true, inserted };
}

function isIgnoredUser(login) {
  const normalized = normalizeLogin(login);
  if (!normalized) return false;
  ensureSchema();
  const row = database.get(`
    SELECT enabled FROM loyalty_ignored_users
    WHERE user_login = :login
    LIMIT 1
  `, { login: normalized });
  return !!row && Number(row.enabled) !== 0;
}

function setIgnoredUser(login, options = {}) {
  const normalized = normalizeLogin(login);
  if (!normalized) throw new Error("user_login_required");
  ensureSchema();

  const now = core.nowIso();
  const reason = String(options.reason || "").trim();
  const enabled = options.enabled === false ? 0 : 1;
  const source = String(options.source || "database").trim() || "database";
  const existing = database.get("SELECT id FROM loyalty_ignored_users WHERE user_login = :login", { login: normalized });

  if (existing) {
    database.run(`
      UPDATE loyalty_ignored_users
      SET reason = CASE WHEN :reason = '' THEN reason ELSE :reason END,
          enabled = :enabled,
          source = :source,
          updated_at = :updatedAt
      WHERE user_login = :login
    `, { login: normalized, reason, enabled, source, updatedAt: now });
  } else {
    database.run(`
      INSERT INTO loyalty_ignored_users
        (user_login, reason, enabled, source, created_at, updated_at)
      VALUES
        (:login, :reason, :enabled, :source, :createdAt, :updatedAt)
    `, { login: normalized, reason, enabled, source, createdAt: now, updatedAt: now });
  }

  return getIgnoredUsers().find(row => row.login === normalized) || null;
}

function ensureUser(login, displayName = "") {
  const normalized = normalizeLogin(login);
  if (!normalized) throw new Error("user_login_required");
  ensureSchema();

  const now = core.nowIso();
  const display = cleanDisplayName(normalized, displayName);
  const existing = database.get("SELECT * FROM loyalty_users WHERE user_login = :login", { login: normalized });

  if (!existing) {
    database.run(`
      INSERT INTO loyalty_users
        (user_login, user_display_name, balance_shadow, balance_live, last_seen_at, created_at, updated_at, metadata_json)
      VALUES
        (:login, :displayName, 0, 0, :lastSeenAt, :createdAt, :updatedAt, '{}')
    `, {
      login: normalized,
      displayName: display,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    });
  } else {
    database.run(`
      UPDATE loyalty_users
      SET user_display_name = CASE WHEN :displayName = '' THEN user_display_name ELSE :displayName END,
          last_seen_at = :lastSeenAt,
          updated_at = :updatedAt
      WHERE user_login = :login
    `, {
      login: normalized,
      displayName: display,
      lastSeenAt: now,
      updatedAt: now
    });
  }

  return getUser(normalized);
}

function rowToUser(row) {
  if (!row) return null;
  const currentMode = normalizeMode(config.mode);
  const field = modeBalanceField(currentMode);
  return {
    id: row.id,
    login: row.user_login,
    displayName: row.user_display_name || row.user_login,
    balanceShadow: Number(row.balance_shadow || 0),
    balanceLive: Number(row.balance_live || 0),
    activeBalance: Number(row[field] || 0),
    activeMode: currentMode,
    totalEarnedShadow: Number(row.total_earned_shadow || 0),
    totalSpentShadow: Number(row.total_spent_shadow || 0),
    totalEarnedLive: Number(row.total_earned_live || 0),
    totalSpentLive: Number(row.total_spent_live || 0),
    lastSeenAt: row.last_seen_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    ignored: isIgnoredUser(row.user_login)
  };
}

function getUser(login) {
  const normalized = normalizeLogin(login);
  if (!normalized) return null;
  ensureSchema();
  return rowToUser(database.get("SELECT * FROM loyalty_users WHERE user_login = :login", { login: normalized }));
}

function listUsers(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
  const search = String(options.search || "").trim();
  const mode = normalizeMode(config.mode);
  const orderField = modeBalanceField(mode);
  const params = { limit };
  const where = [];

  if (search) {
    where.push("(user_login LIKE :search OR user_display_name LIKE :search)");
    params.search = `%${search.toLowerCase()}%`;
  }

  const rows = database.all(`
    SELECT *
    FROM loyalty_users
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ${database.quoteIdentifier(orderField)} DESC, user_login ASC
    LIMIT :limit
  `, params).map(rowToUser);

  return {
    ok: true,
    mode,
    count: rows.length,
    rows
  };
}

function rowToTransaction(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.transaction_uid,
    login: row.user_login,
    displayName: row.user_display_name || row.user_login,
    amount: Number(row.amount || 0),
    balanceBefore: Number(row.balance_before || 0),
    balanceAfter: Number(row.balance_after || 0),
    balanceField: row.balance_field || "shadow",
    type: row.type || "",
    sourceModule: row.source_module || "",
    sourceProvider: row.source_provider || "",
    mode: row.mode || "",
    reason: row.reason || "",
    referenceType: row.reference_type || "",
    referenceId: row.reference_id || "",
    createdAt: row.created_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function listTransactions(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
  const login = normalizeLogin(options.login || "");
  const mode = String(options.mode || "").trim();
  const type = String(options.type || "").trim();
  const where = [];
  const params = { limit };

  if (login) {
    where.push("user_login = :login");
    params.login = login;
  }
  if (mode) {
    where.push("mode = :mode");
    params.mode = normalizeMode(mode);
  }
  if (type) {
    where.push("type = :type");
    params.type = type;
  }

  const rows = database.all(`
    SELECT *
    FROM loyalty_transactions
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id DESC
    LIMIT :limit
  `, params).map(rowToTransaction);

  return {
    ok: true,
    count: rows.length,
    rows
  };
}


function emitLoyaltyEvent(type, payload = {}, options = {}) {
  const event = {
    type,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    event: "loyalty.event",
    createdAt: core.nowIso(),
    payload
  };
  try {
    const communicationBus = require("./communication_bus");
    const bus = communicationBus && typeof communicationBus.getBus === "function" ? communicationBus.getBus() : null;
    if (bus && typeof bus.emit === "function") {
      bus.emit(type, event, {
        replayable: options.replayable === true,
        ttlMs: Number(options.ttlMs || 0) || undefined
      });
      return { ok: true, delivered: true, mode: "communication_bus" };
    }
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
  }
  return { ok: false, delivered: false, reason: state.lastError || "communication_bus_unavailable" };
}

function ensureReservationSafetySchema() {
  ensureSchema();
  database.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_reservations (
      id ${database.primaryKeyAutoIncrementSql()},
      reservation_uid TEXT NOT NULL UNIQUE,
      user_login TEXT NOT NULL,
      user_display_name TEXT NOT NULL DEFAULT '',
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'held',
      mode TEXT NOT NULL DEFAULT 'shadow',
      source_module TEXT NOT NULL DEFAULT 'loyalty',
      source_provider TEXT NOT NULL DEFAULT 'stream_control_center',
      reference_type TEXT NOT NULL DEFAULT '',
      reference_id TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
  `);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_user ON loyalty_reservations(user_login);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_status ON loyalty_reservations(status);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_mode ON loyalty_reservations(mode);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_loyalty_reservations_expires ON loyalty_reservations(expires_at);`);
}

function expireHeldReservations(now = core.nowIso()) {
  ensureReservationSafetySchema();
  database.run(`
    UPDATE loyalty_reservations
    SET status = 'expired', updated_at = :updatedAt
    WHERE status = 'held'
      AND expires_at != ''
      AND expires_at <= :now
  `, { now, updatedAt: now });
}

function rowToReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.reservation_uid,
    login: row.user_login,
    displayName: row.user_display_name || row.user_login,
    amount: Number(row.amount || 0),
    status: row.status || "held",
    mode: row.mode || "shadow",
    sourceModule: row.source_module || "loyalty",
    sourceProvider: row.source_provider || "stream_control_center",
    referenceType: row.reference_type || "",
    referenceId: row.reference_id || "",
    reason: row.reason || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    expiresAt: row.expires_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function getReservation(reservationUid) {
  ensureReservationSafetySchema();
  const uidValue = String(reservationUid || "").trim();
  if (!uidValue) return null;
  return rowToReservation(database.get("SELECT * FROM loyalty_reservations WHERE reservation_uid = :uid", { uid: uidValue }));
}

function getReservedAmount(login, options = {}) {
  const normalized = normalizeLogin(login);
  if (!normalized) return 0;
  refreshConfigFromSettings();
  ensureReservationSafetySchema();
  const mode = normalizeMode(options.mode || config.mode);
  const now = core.nowIso();
  expireHeldReservations(now);
  const row = database.get(`
    SELECT COALESCE(SUM(amount), 0) AS amount
    FROM loyalty_reservations
    WHERE user_login = :login
      AND mode = :mode
      AND status = 'held'
      AND (expires_at = '' OR expires_at > :now)
  `, { login: normalized, mode, now });
  return Math.max(0, Number(row && row.amount || 0));
}

function getBalanceSummary(login, options = {}) {
  refreshConfigFromSettings();
  const normalized = normalizeLogin(login || options.userLogin || "");
  if (!normalized) throw new Error("user_login_required");
  ensureReservationSafetySchema();
  const displayName = cleanDisplayName(normalized, options.displayName || options.userDisplayName || normalized);
  const user = options.create === false ? getUser(normalized) : ensureUser(normalized, displayName);
  const mode = normalizeMode(options.mode || config.mode);
  const field = modeBalanceField(mode);
  const activeBalance = user ? Number(user[field === "balance_live" ? "balanceLive" : "balanceShadow"] || 0) : 0;
  const reserved = getReservedAmount(normalized, { mode });
  const available = Math.max(0, activeBalance - reserved);
  return {
    ok: true,
    login: normalized,
    displayName: user ? (user.displayName || displayName) : displayName,
    mode,
    currencyName: config.currency && config.currency.name || "Kekskrümel",
    balance: activeBalance,
    reserved,
    available,
    user: user || null,
    ignored: isIgnoredUser(normalized)
  };
}


function getAvailableBalance(login, options = {}) {
  const summary = getBalanceSummary(login, options);
  return {
    ok: true,
    login: summary.login,
    displayName: summary.displayName,
    mode: summary.mode,
    currencyName: summary.currencyName,
    balance: summary.balance,
    reserved: summary.reserved,
    available: summary.available,
    summary
  };
}

function listAvailableRankings(options = {}) {
  refreshConfigFromSettings();
  ensureReservationSafetySchema();
  const mode = normalizeMode(options.mode || config.mode);
  const field = modeBalanceField(mode);
  const now = core.nowIso();
  expireHeldReservations(now);
  const rows = database.all(`
    SELECT
      u.user_login,
      u.user_display_name,
      u.${database.quoteIdentifier(field)} AS balance,
      COALESCE((
        SELECT SUM(r.amount)
        FROM loyalty_reservations r
        WHERE r.user_login = u.user_login
          AND r.mode = :mode
          AND r.status = 'held'
          AND (r.expires_at = '' OR r.expires_at > :now)
      ), 0) AS reserved_amount
    FROM loyalty_users u
    WHERE NOT EXISTS (
      SELECT 1 FROM loyalty_ignored_users i
      WHERE i.user_login = u.user_login AND i.enabled = 1
    )
  `, { mode, now }).map(row => {
    const balance = Number(row.balance || 0);
    const reserved = Math.max(0, Number(row.reserved_amount || 0));
    return {
      login: row.user_login,
      displayName: row.user_display_name || row.user_login,
      balance,
      reserved,
      available: Math.max(0, balance - reserved)
    };
  }).filter(row => options.includeZero === true || row.available > 0)
    .sort((a, b) => b.available - a.available || String(a.login).localeCompare(String(b.login)));

  return rows.map((row, index) => ({ ...row, rank: index + 1, rankTotal: rows.length, total: rows.length }));
}

function getAvailableRank(login, options = {}) {
  const normalized = normalizeLogin(login);
  if (!normalized) return { rank: null, rankTotal: 0, total: 0 };
  const rows = listAvailableRankings(options);
  const row = rows.find(item => item.login === normalized);
  return { rank: row ? row.rank : null, rankTotal: rows.length, total: rows.length, row: row || null };
}

function canAfford(input = {}) {
  const amount = Math.floor(Number(input.amount || 0));
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, canAfford: false, reason: "invalid_amount", amount: input.amount, required: input.amount };
  const summary = getBalanceSummary(input.login || input.userLogin || input.user, input);
  const allowed = summary.available >= amount;
  return {
    ok: true,
    canAfford: allowed,
    reason: allowed ? "ok" : "insufficient_available_balance",
    amount,
    required: amount,
    balance: summary.balance,
    reserved: summary.reserved,
    available: summary.available,
    missing: allowed ? 0 : amount - summary.available,
    summary
  };
}

function spendPointsSafely(input = {}) {
  const amount = Math.floor(Number(input.amount || 0));
  const affordability = canAfford({ ...input, amount });
  if (!affordability.ok || !affordability.canAfford) {
    return { ok: false, error: affordability.reason || "insufficient_available_balance", ...affordability };
  }
  const result = recordTransaction({
    ...input,
    amount: -amount,
    type: input.type || "spend",
    reason: input.reason || "safe_spend",
    sourceModule: input.sourceModule || MODULE_NAME,
    sourceProvider: input.sourceProvider || "stream_control_center",
    metadata: { ...(input.metadata || {}), safety: { availableBefore: affordability.available, reservedBefore: affordability.reserved } }
  });
  emitLoyaltyEvent("loyalty.points.transaction.created", { kind: "spend", amount, result }, { replayable: true, ttlMs: 60000 });
  return { ok: true, amount, affordability, transaction: result.transaction, user: result.user };
}

function awardPoints(input = {}) {
  const amount = Math.floor(Number(input.amount || 0));
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "invalid_amount", amount: input.amount };
  const result = recordTransaction({
    ...input,
    amount,
    type: input.type || "award",
    reason: input.reason || "award_points",
    sourceModule: input.sourceModule || MODULE_NAME,
    sourceProvider: input.sourceProvider || "stream_control_center"
  });
  emitLoyaltyEvent("loyalty.points.transaction.created", { kind: "award", amount, result }, { replayable: true, ttlMs: 60000 });
  return { ok: true, amount, transaction: result.transaction, user: result.user };
}

function reservePoints(input = {}) {
  const amount = Math.floor(Number(input.amount || 0));
  const affordability = canAfford({ ...input, amount });
  if (!affordability.ok || !affordability.canAfford) {
    return { ok: false, error: affordability.reason || "insufficient_available_balance", ...affordability };
  }
  const login = normalizeLogin(input.login || input.userLogin || input.user);
  const displayName = cleanDisplayName(login, input.displayName || input.userDisplayName || login);
  const mode = normalizeMode(input.mode || config.mode);
  const now = core.nowIso();
  const reservationUid = String(input.reservationUid || uid("loyalty_res"));
  database.run(`
    INSERT INTO loyalty_reservations (
      reservation_uid, user_login, user_display_name, amount, status, mode,
      source_module, source_provider, reference_type, reference_id, reason,
      created_at, updated_at, expires_at, metadata_json
    ) VALUES (
      :reservationUid, :login, :displayName, :amount, 'held', :mode,
      :sourceModule, :sourceProvider, :referenceType, :referenceId, :reason,
      :createdAt, :updatedAt, :expiresAt, :metadataJson
    )
  `, {
    reservationUid,
    login,
    displayName,
    amount,
    mode,
    sourceModule: String(input.sourceModule || MODULE_NAME),
    sourceProvider: String(input.sourceProvider || "stream_control_center"),
    referenceType: String(input.referenceType || ""),
    referenceId: String(input.referenceId || ""),
    reason: String(input.reason || "reserve_points"),
    createdAt: now,
    updatedAt: now,
    expiresAt: String(input.expiresAt || input.expires_at || ""),
    metadataJson: JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
  });
  const reservation = getReservation(reservationUid);
  emitLoyaltyEvent("loyalty.points.reservation.created", { reservation }, { replayable: true, ttlMs: 60000 });
  return { ok: true, reservation, affordability };
}

function releaseReservation(reservationUid, options = {}) {
  ensureReservationSafetySchema();
  const reservation = getReservation(reservationUid);
  if (!reservation) return { ok: false, error: "reservation_not_found" };
  if (reservation.status !== "held") return { ok: true, skipped: true, reason: "reservation_not_held", reservation };
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_reservations
    SET status = :status, updated_at = :updatedAt,
        reason = CASE WHEN :reason = '' THEN reason ELSE :reason END
    WHERE reservation_uid = :uid
  `, {
    uid: reservation.uid,
    status: options.status || "released",
    updatedAt: now,
    reason: String(options.reason || "")
  });
  const updated = getReservation(reservation.uid);
  emitLoyaltyEvent("loyalty.points.reservation.released", { reservation: updated }, { replayable: true, ttlMs: 60000 });
  return { ok: true, reservation: updated };
}

function commitReservation(reservationUid, options = {}) {
  const reservation = getReservation(reservationUid);
  if (!reservation) return { ok: false, error: "reservation_not_found" };
  if (reservation.status !== "held") return { ok: true, skipped: true, reason: "reservation_not_held", reservation };
  const summary = getBalanceSummary(reservation.login, { mode: reservation.mode, create: false });
  if (summary.balance < reservation.amount) {
    return { ok: false, error: "balance_below_reserved_amount", balance: summary.balance, reserved: reservation.amount, reservation };
  }
  const spend = recordTransaction({
    login: reservation.login,
    displayName: reservation.displayName,
    amount: -reservation.amount,
    type: options.type || "reservation_commit",
    reason: options.reason || reservation.reason || "commit_reservation",
    mode: reservation.mode,
    sourceModule: options.sourceModule || reservation.sourceModule || MODULE_NAME,
    sourceProvider: options.sourceProvider || reservation.sourceProvider || "stream_control_center",
    referenceType: options.referenceType || reservation.referenceType || "reservation",
    referenceId: options.referenceId || reservation.uid,
    metadata: { ...(reservation.metadata || {}), ...(options.metadata || {}), reservationUid: reservation.uid }
  });
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_reservations
    SET status = 'committed', updated_at = :updatedAt
    WHERE reservation_uid = :uid
  `, { uid: reservation.uid, updatedAt: now });
  const updated = getReservation(reservation.uid);
  emitLoyaltyEvent("loyalty.points.reservation.committed", { reservation: updated, transaction: spend.transaction }, { replayable: true, ttlMs: 60000 });
  return { ok: true, reservation: updated, transaction: spend.transaction, user: spend.user };
}

function recordTransaction(input = {}) {
  refreshConfigFromSettings();
  const mode = normalizeMode(input.mode || config.mode);
  if (mode === "off") throw new Error("loyalty_mode_off");

  const login = normalizeLogin(input.login || input.userLogin);
  if (!login) throw new Error("user_login_required");

  const amount = Number.parseInt(input.amount, 10);
  if (!Number.isFinite(amount) || amount === 0) throw new Error("invalid_amount");

  if (isIgnoredUser(login) && input.allowIgnored !== true) {
    return {
      ok: true,
      ignored: true,
      login,
      reason: "ignored_user",
      transaction: null,
      user: getUser(login) || null
    };
  }

  const displayName = cleanDisplayName(login, input.displayName || input.userDisplayName);
  const user = ensureUser(login, displayName);
  const field = modeBalanceField(mode);
  const totalFields = modeTotalFields(mode);
  const before = Number(user[field === "balance_live" ? "balanceLive" : "balanceShadow"] || 0);
  const after = before + amount;
  const now = core.nowIso();

  database.run(`
    UPDATE loyalty_users
    SET ${database.quoteIdentifier(field)} = :balanceAfter,
        ${database.quoteIdentifier(amount >= 0 ? totalFields.earned : totalFields.spent)} =
          ${database.quoteIdentifier(amount >= 0 ? totalFields.earned : totalFields.spent)} + :absAmount,
        user_display_name = :displayName,
        last_seen_at = :lastSeenAt,
        updated_at = :updatedAt
    WHERE user_login = :login
  `, {
    login,
    displayName,
    balanceAfter: after,
    absAmount: Math.abs(amount),
    lastSeenAt: now,
    updatedAt: now
  });

  const transaction = {
    uid: uid("loyalty_tx"),
    login,
    displayName,
    amount,
    balanceBefore: before,
    balanceAfter: after,
    balanceField: field === "balance_live" ? "live" : "shadow",
    type: String(input.type || "admin_adjustment").trim() || "admin_adjustment",
    sourceModule: String(input.sourceModule || "loyalty").trim() || "loyalty",
    sourceProvider: String(input.sourceProvider || "stream_control_center").trim() || "stream_control_center",
    mode,
    reason: String(input.reason || "").trim(),
    referenceType: String(input.referenceType || "").trim(),
    referenceId: String(input.referenceId || "").trim(),
    createdAt: now,
    metadataJson: JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
  };

  database.run(`
    INSERT INTO loyalty_transactions
      (transaction_uid, user_login, user_display_name, amount, balance_before, balance_after, balance_field,
       type, source_module, source_provider, mode, reason, reference_type, reference_id, created_at, metadata_json)
    VALUES
      (:uid, :login, :displayName, :amount, :balanceBefore, :balanceAfter, :balanceField,
       :type, :sourceModule, :sourceProvider, :mode, :reason, :referenceType, :referenceId, :createdAt, :metadataJson)
  `, transaction);

  return {
    ok: true,
    ignored: false,
    transaction: rowToTransaction(database.get("SELECT * FROM loyalty_transactions WHERE transaction_uid = :uid", { uid: transaction.uid })),
    user: getUser(login)
  };
}

function isSubscriberInput(input = {}) {
  if (input === true) return true;
  if (!input || typeof input !== "object") return ["1", "true", "yes", "ja", "on"].includes(String(input || "").toLowerCase());
  return input.subscriber === true || input.isSubscriber === true || ["1", "true", "yes", "ja", "on"].includes(String(input.subscriber ?? input.isSubscriber ?? input.sub ?? "").toLowerCase());
}

function watchSubscriberTierAmount(tier) {
  const map = config.watch && config.watch.subscriberTierAmounts && typeof config.watch.subscriberTierAmounts === "object"
    ? config.watch.subscriberTierAmounts
    : {};
  const normalized = normalizeTier(tier);
  const keys = [normalized, tierLabel(normalized), normalized.replace(/^tier/, ""), String(tier || "")];
  for (const key of keys) {
    if (!key) continue;
    const value = Number(map[key]);
    if (Number.isFinite(value)) return Math.floor(value);
  }
  return null;
}

function calculateWatchAmount(input = {}) {
  const source = input && typeof input === "object" ? input : { subscriber: input };
  const amount = Number(config.watch && config.watch.amount || 0);
  const subscriber = isSubscriberInput(source);
  if (!subscriber) {
    const result = Math.floor(amount);
    return Number.isFinite(result) ? result : 0;
  }

  const tier = normalizeTier(source.subscriberTier || source.subscriber_tier || source.tier || source.subTier || source.subscriptionTier || "");
  const tierSpecific = watchSubscriberTierAmount(tier);
  if (tierSpecific !== null) return tierSpecific;

  const multiplier = Number(config.watch && config.watch.subscriberMultiplier || 1);
  const result = Math.floor(amount * multiplier);
  return Number.isFinite(result) ? result : 0;
}

function recordWatchInterval(input = {}) {
  refreshConfigFromSettings();
  if (!config.enabled || !config.watch.enabled || !config.features.watchEarningEnabled) {
    return { ok: false, skipped: true, reason: "watch_earning_disabled" };
  }

  const subscriber = isSubscriberInput(input);
  const subscriberTier = normalizeTier(input.subscriberTier || input.subscriber_tier || input.tier || input.subTier || input.subscriptionTier || "");
  const amount = calculateWatchAmount({ subscriber, subscriberTier });

  return recordTransaction({
    login: input.login || input.userLogin,
    displayName: input.displayName || input.userDisplayName,
    amount,
    type: "watch_interval",
    reason: subscriber ? "watch_interval_subscriber" : "watch_interval_viewer",
    mode: input.mode || config.mode,
    sourceModule: "loyalty",
    sourceProvider: "stream_control_center",
    referenceType: "watch_interval",
    referenceId: String(input.referenceId || ""),
    metadata: {
      subscriber,
      subscriberTier,
      intervalMinutes: Number(config.watch.intervalMinutes || 10),
      baseAmount: Number(config.watch.amount || 0),
      subscriberMultiplier: Number(config.watch.subscriberMultiplier || 1),
      subscriberTierAmounts: config.watch.subscriberTierAmounts || null,
      watchAmountSource: subscriber && watchSubscriberTierAmount(subscriberTier) !== null ? "subscriber_tier_amount" : (subscriber ? "subscriber_multiplier_fallback" : "viewer_base")
    }
  });
}

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(raw)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(raw)) return false;
  return fallback;
}

function addMinutesIso(iso, minutes) {
  const base = Date.parse(iso || "");
  const start = Number.isFinite(base) ? base : Date.now();
  return new Date(start + Math.max(1, Number(minutes || 10)) * 60 * 1000).toISOString();
}

function secondsUntilIso(iso) {
  const target = Date.parse(iso || "");
  if (!Number.isFinite(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / 1000));
}

function rowToWatchState(row) {
  if (!row) return null;
  return {
    login: row.user_login,
    displayName: row.user_display_name || row.user_login,
    mode: row.mode || "shadow",
    subscriber: Number(row.subscriber || 0) !== 0,
    source: row.source || "manual",
    lastHeartbeatAt: row.last_heartbeat_at || "",
    lastRewardAt: row.last_reward_at || "",
    nextRewardAt: row.next_reward_at || "",
    secondsUntilNextReward: secondsUntilIso(row.next_reward_at),
    heartbeatCount: Number(row.heartbeat_count || 0),
    rewardCount: Number(row.reward_count || 0),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function getWatchState(login) {
  const normalized = normalizeLogin(login);
  if (!normalized) return null;
  ensureSchema();
  return rowToWatchState(database.get("SELECT * FROM loyalty_watch_state WHERE user_login = :login", { login: normalized }));
}

function upsertWatchState(input = {}) {
  ensureSchema();
  const login = normalizeLogin(input.login || input.userLogin);
  if (!login) throw new Error("user_login_required");

  const now = input.now || core.nowIso();
  const displayName = cleanDisplayName(login, input.displayName || input.userDisplayName);
  const mode = normalizeMode(input.mode || config.mode);
  const subscriber = parseBool(input.subscriber ?? input.isSubscriber, false) ? 1 : 0;
  const source = String(input.source || "manual").trim() || "manual";
  const existing = database.get("SELECT * FROM loyalty_watch_state WHERE user_login = :login", { login });
  const metadataJson = JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {});

  if (!existing) {
    database.run(`
      INSERT INTO loyalty_watch_state
        (user_login, user_display_name, mode, subscriber, source, last_heartbeat_at, last_reward_at, next_reward_at,
         heartbeat_count, reward_count, created_at, updated_at, metadata_json)
      VALUES
        (:login, :displayName, :mode, :subscriber, :source, :lastHeartbeatAt, '', '', 1, 0, :createdAt, :updatedAt, :metadataJson)
    `, {
      login,
      displayName,
      mode,
      subscriber,
      source,
      lastHeartbeatAt: now,
      createdAt: now,
      updatedAt: now,
      metadataJson
    });
  } else {
    database.run(`
      UPDATE loyalty_watch_state
      SET user_display_name = :displayName,
          mode = :mode,
          subscriber = :subscriber,
          source = :source,
          last_heartbeat_at = :lastHeartbeatAt,
          heartbeat_count = heartbeat_count + 1,
          updated_at = :updatedAt,
          metadata_json = :metadataJson
      WHERE user_login = :login
    `, {
      login,
      displayName,
      mode,
      subscriber,
      source,
      lastHeartbeatAt: now,
      updatedAt: now,
      metadataJson
    });
  }

  return getWatchState(login);
}

function markWatchRewarded(login, rewardAt, nextRewardAt) {
  const normalized = normalizeLogin(login);
  if (!normalized) throw new Error("user_login_required");
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_watch_state
    SET last_reward_at = :lastRewardAt,
        next_reward_at = :nextRewardAt,
        reward_count = reward_count + 1,
        updated_at = :updatedAt
    WHERE user_login = :login
  `, {
    login: normalized,
    lastRewardAt: rewardAt,
    nextRewardAt,
    updatedAt: now
  });
  return getWatchState(normalized);
}

function setWatchNextRewardAt(login, nextRewardAt) {
  const normalized = normalizeLogin(login);
  if (!normalized) throw new Error("user_login_required");
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_watch_state
    SET next_reward_at = :nextRewardAt,
        updated_at = :updatedAt
    WHERE user_login = :login
  `, {
    login: normalized,
    nextRewardAt,
    updatedAt: now
  });
  return getWatchState(normalized);
}

function shouldRewardWatch(stateRow, nowIso, intervalMinutes) {
  if (!stateRow) return true;
  const nowMs = Date.parse(nowIso);
  if (!Number.isFinite(nowMs)) return true;

  const next = Date.parse(stateRow.nextRewardAt || "");
  if (Number.isFinite(next)) return nowMs >= next;

  if (!stateRow.lastRewardAt) return true;
  const last = Date.parse(stateRow.lastRewardAt);
  if (!Number.isFinite(last)) return true;
  return nowMs - last >= Math.max(1, Number(intervalMinutes || 10)) * 60 * 1000;
}

function recordWatchHeartbeat(input = {}) {
  refreshConfigFromSettings();
  const mode = normalizeMode(input.mode || config.mode);
  const login = normalizeLogin(input.login || input.userLogin || input.user);
  if (!login) throw new Error("user_login_required");

  if (!config.enabled || mode === "off" || !config.watch.enabled || !config.features.watchEarningEnabled) {
    return { ok: true, skipped: true, awarded: false, ignored: false, login, reason: "watch_earning_disabled" };
  }

  if (isIgnoredUser(login)) {
    return { ok: true, skipped: true, awarded: false, ignored: true, login, reason: "ignored_user", watchState: getWatchState(login) };
  }

  const now = core.nowIso();
  const intervalMinutes = Math.max(1, Number(config.watch.intervalMinutes || 10));
  const previous = getWatchState(login);
  const subscriberTier = normalizeTier(input.subscriberTier || input.subscriber_tier || input.tier || input.subTier || input.subscriptionTier || "");
  const watchStateBeforeReward = upsertWatchState({
    login,
    displayName: input.displayName || input.userDisplayName || input.display_name,
    subscriber: input.subscriber ?? input.isSubscriber ?? input.sub,
    source: input.source || input.sourceModule || "manual",
    mode,
    now,
    metadata: {
      userId: input.userId || input.user_id || "",
      rawSource: input.source || "",
      subscriberTier
    }
  });

  if (!previous) {
    const nextRewardAt = addMinutesIso(now, intervalMinutes);
    const watchState = setWatchNextRewardAt(login, nextRewardAt);
    return {
      ok: true,
      skipped: true,
      awarded: false,
      ignored: false,
      login,
      reason: "watch_interval_initial_wait",
      secondsUntilNextReward: secondsUntilIso(nextRewardAt),
      nextRewardAt,
      watchState,
      transaction: null,
      user: getUser(login)
    };
  }

  if (!shouldRewardWatch(previous, now, intervalMinutes)) {
    return {
      ok: true,
      skipped: true,
      awarded: false,
      ignored: false,
      login,
      reason: "watch_interval_not_due",
      secondsUntilNextReward: secondsUntilIso(previous.nextRewardAt || addMinutesIso(previous.lastRewardAt, intervalMinutes)),
      nextRewardAt: previous.nextRewardAt || addMinutesIso(previous.lastRewardAt, intervalMinutes),
      watchState: watchStateBeforeReward,
      transaction: null,
      user: getUser(login)
    };
  }

  const nextRewardAt = addMinutesIso(now, intervalMinutes);
  const result = recordWatchInterval({
    login,
    displayName: input.displayName || input.userDisplayName || input.display_name,
    subscriber: input.subscriber ?? input.isSubscriber ?? input.sub,
    subscriberTier,
    mode,
    referenceId: input.referenceId || input.reference_id || `watch_${login}_${now}`
  });

  if (result && result.ok && !result.ignored && result.transaction) {
    return {
      ok: true,
      skipped: false,
      awarded: true,
      ignored: false,
      login,
      reason: "watch_interval_awarded",
      secondsUntilNextReward: secondsUntilIso(nextRewardAt),
      nextRewardAt,
      watchState: markWatchRewarded(login, now, nextRewardAt),
      transaction: result.transaction,
      user: result.user
    };
  }

  return {
    ok: true,
    skipped: true,
    awarded: false,
    ignored: !!(result && result.ignored),
    login,
    reason: result && result.reason ? result.reason : "watch_interval_not_recorded",
    watchState: getWatchState(login),
    transaction: result && result.transaction || null,
    user: result && result.user || getUser(login)
  };
}

function listWatchStates(options = {}) {
  ensureSchema();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
  const rows = database.all(`
    SELECT *
    FROM loyalty_watch_state
    ORDER BY updated_at DESC, user_login ASC
    LIMIT :limit
  `, { limit }).map(rowToWatchState);
  return { ok: true, count: rows.length, rows };
}


function sanitizeRuntimeChatMessage(value, maxLength = 450) {
  const clean = String(value || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  const limit = Math.max(40, Math.min(500, Number.parseInt(maxLength, 10) || 450));
  return clean.length > limit ? clean.slice(0, limit - 1).trimEnd() + "…" : clean;
}

function renderLoyaltyText(key, context = {}, options = {}) {
  ensureTextsSeeded();
  try {
    const message = textHelper.renderModuleText(POINTS_TEXT_MODULE, key, DEFAULT_TEXTS, context, {
      categories: TEXT_CATEGORIES,
      categoryLabels: TEXT_CATEGORY_LABELS,
      ...options
    });
    return sanitizeRuntimeChatMessage(message, options.maxLength || options.max || 450);
  } catch (_) {
    const fallback = Array.isArray(DEFAULT_TEXTS[key]) ? DEFAULT_TEXTS[key][0] : "";
    return sanitizeRuntimeChatMessage(Object.entries(context || {}).reduce((text, [name, value]) => {
      return text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value ?? ""));
    }, fallback), options.maxLength || options.max || 450);
  }
}

function safeParseJson(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function commandSystemTableAvailable() {
  try {
    ensureSchema();
    if (typeof database.tableExists === "function") return database.tableExists("command_definitions");
    const row = database.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'command_definitions'");
    return !!row;
  } catch (_) {
    return false;
  }
}

function rowToCentralCommand(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    trigger: row.trigger || "",
    aliases: safeParseJson(row.aliases_json, []),
    moduleKey: row.module_key || "",
    actionKey: row.action_key || "",
    targetMethod: row.target_method || "POST",
    targetUrl: row.target_url || "",
    enabled: Number(row.enabled || 0) === 1,
    permissionLevel: row.permission_level || "everyone",
    cooldownGlobalMs: Number(row.cooldown_global_ms || 0),
    cooldownUserMs: Number(row.cooldown_user_ms || 0),
    liveOnly: Number(row.live_only || 0) === 1,
    responseMode: row.response_mode || "module",
    config: safeParseJson(row.config_json, {}),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function seedCentralCommandDefinitions() {
  ensureSchema();
  if (!commandSystemTableAvailable()) {
    return { ok: false, available: false, inserted: 0, existing: 0, count: 0, commands: [], warning: "Zentrales command_definitions-System ist noch nicht verfuegbar." };
  }
  const now = core.nowIso();
  let inserted = 0;
  let existing = 0;
  for (const definition of CENTRAL_COMMAND_DEFINITIONS) {
    const current = database.get("SELECT id FROM command_definitions WHERE trigger = :trigger", { trigger: definition.trigger });
    if (current && current.id) { existing += 1; continue; }
    const result = database.run(`
      INSERT INTO command_definitions (
        trigger, aliases_json, module_key, action_key, target_method, target_url,
        enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
        response_mode, config_json, created_at, updated_at
      ) VALUES (
        :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
        :enabled, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, :liveOnly,
        :responseMode, :configJson, :createdAt, :updatedAt
      )
    `, {
      trigger: definition.trigger,
      aliasesJson: JSON.stringify(definition.aliases || []),
      moduleKey: definition.moduleKey || MODULE_NAME,
      actionKey: definition.actionKey || "points_chat_command_runtime",
      targetMethod: definition.targetMethod || "POST",
      targetUrl: definition.targetUrl || "/api/loyalty/runtime/points-command",
      enabled: definition.enabled ? 1 : 0,
      permissionLevel: definition.permissionLevel || "everyone",
      cooldownGlobalMs: Math.max(0, Number(definition.cooldownGlobalMs || 0)),
      cooldownUserMs: Math.max(0, Number(definition.cooldownUserMs || 0)),
      liveOnly: definition.liveOnly ? 1 : 0,
      responseMode: definition.responseMode || "module",
      configJson: JSON.stringify(definition.config || {}),
      createdAt: now,
      updatedAt: now
    });
    inserted += Number(result && result.changes ? result.changes : 0);
  }
  return listCentralCommandDefinitions({ inserted, existing });
}

function listCentralCommandDefinitions(extra = {}) {
  ensureSchema();
  if (!commandSystemTableAvailable()) {
    return { ok: false, available: false, inserted: Number(extra.inserted || 0), existing: Number(extra.existing || 0), count: 0, commands: [], warning: "Zentrales command_definitions-System ist noch nicht verfuegbar." };
  }
  const triggers = CENTRAL_COMMAND_DEFINITIONS.map(item => item.trigger);
  const rows = database.all(`
    SELECT *
    FROM command_definitions
    WHERE trigger IN (${triggers.map((_, index) => `:trigger${index}`).join(", ")})
    ORDER BY trigger ASC
  `, triggers.reduce((acc, trigger, index) => { acc[`trigger${index}`] = trigger; return acc; }, {})).map(rowToCentralCommand);
  return {
    ok: true,
    available: true,
    active: rows.some(command => command && command.enabled),
    commandsActive: rows.some(command => command && command.enabled),
    inserted: Number(extra.inserted || 0),
    existing: Number(extra.existing || Math.max(0, rows.length - Number(extra.inserted || 0))),
    count: rows.length,
    commands: rows,
    note: "Punkte-Commands !punkte/!points, !givepoints und !setpoint sind vorbereitet und bleiben deaktiviert bis Loyalty-Freigabe."
  };
}

function getChatTextEditorPayload() {
  ensureSchema();
  ensureTextsSeeded();
  return textHelper.listModuleTextEditor(POINTS_TEXT_MODULE, DEFAULT_TEXTS, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS });
}

function handleChatTextEditorPayload(payload = {}) {
  ensureSchema();
  ensureTextsSeeded();
  return textHelper.handleModuleTextEditorPayload(POINTS_TEXT_MODULE, payload || {}, { categories: TEXT_CATEGORIES, categoryLabels: TEXT_CATEGORY_LABELS });
}

function normalizeCommandLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function commandArgs(input = {}) {
  if (Array.isArray(input.args)) return input.args.map(item => String(item || "").trim()).filter(Boolean);
  const raw = String(input.argText || input.rawArgs || input.text || input.message || "").trim();
  return raw ? raw.split(/\s+/).filter(Boolean) : [];
}

function commandUser(input = {}) {
  const login = normalizeCommandLogin(input.userLogin || input.login || input.username || input.user || input.actorLogin || "");
  const displayName = String(input.userDisplayName || input.displayName || input.username || input.user || login).trim() || login;
  const badges = input.badges && typeof input.badges === "object" ? input.badges : {};
  const roles = input.roles && typeof input.roles === "object" ? input.roles : {};
  const isBroadcaster = input.isBroadcaster === true || roles.broadcaster === true || roles.streamer === true || !!badges.broadcaster;
  const isMod = input.isMod === true || input.isModerator === true || roles.mod === true || roles.moderator === true || !!badges.moderator || isBroadcaster;
  return { login, displayName, isBroadcaster, isMod };
}

function buildCommandRuntimeResponse(input = {}, patch = {}) {
  const user = commandUser(input);
  const context = {
    user: user.displayName || user.login,
    actor: user.displayName || user.login,
    currencyName: config.currency && config.currency.name || "Kekskrümel",
    ...(patch.context || {})
  };
  const key = patch.messageKey || "";
  const message = key ? renderLoyaltyText(key, context, { maxLength: 450 }) : "";
  return {
    ok: patch.ok !== false,
    handled: patch.handled !== false,
    module: MODULE_NAME,
    command: String(input.command || input.cmd || "").replace(/^!/, "").toLowerCase(),
    action: patch.action || "points",
    message,
    messageKey: key,
    error: patch.error || "",
    data: patch.data || {},
    active: patch.active === true,
    commandsActive: patch.commandsActive === true,
    context
  };
}

function parsePositiveInt(value) {
  const raw = String(value || "").trim().replace(/[^0-9]/g, "");
  if (!raw) return 0;
  const amount = Number.parseInt(raw, 10);
  return Number.isFinite(amount) ? amount : 0;
}

function handlePointsCommandRuntime(input = {}) {
  refreshConfigFromSettings();
  ensureSchema();
  ensureTextsSeeded();
  seedCentralCommandDefinitions();
  const actor = commandUser(input);
  const args = commandArgs(input);
  const command = String(input.command || input.commandName || input.cmd || "punkte").trim().replace(/^!/, "").toLowerCase();
  const centralCommands = listCentralCommandDefinitions();
  const commandDefinition = (centralCommands.commands || []).find(row => row.trigger === command || (row.aliases || []).includes(command)) || null;
  const commandEnabled = !!(commandDefinition && commandDefinition.enabled);

  if (!commandEnabled) {
    return buildCommandRuntimeResponse({ ...input, command }, {
      ok: false,
      active: false,
      commandsActive: false,
      action: "points",
      messageKey: "points.disabled",
      error: "chat_commands_disabled",
      data: { commandDefinition }
    });
  }

  if (command === "givepoints") return handleGivePointsCommandRuntime({ ...input, args, command, actor, commandDefinition });
  if (command === "setpoint") return handleSetPointCommandRuntime({ ...input, args, command, actor, commandDefinition });

  if (args[0] && ["give", "geben", "add"].includes(args[0].toLowerCase())) {
    return handleGivePointsCommandRuntime({ ...input, args: args.slice(1), command: "punkte", actor, commandDefinition });
  }
  if (args[0] && ["set", "setzen"].includes(args[0].toLowerCase())) {
    return handleSetPointCommandRuntime({ ...input, args: args.slice(1), command: "punkte", actor, commandDefinition });
  }

  const targetRaw = args[0] && args[0].startsWith("@") ? args[0] : "";
  const targetLogin = normalizeCommandLogin(targetRaw || actor.login);
  const isOther = !!targetRaw && targetLogin !== actor.login;
  if (isOther && !actor.isMod) {
    return buildCommandRuntimeResponse({ ...input, command }, {
      ok: false,
      action: "points",
      messageKey: "points.permission_denied",
      error: "permission_denied",
      data: { targetLogin }
    });
  }
  const summary = getBalanceSummary(targetLogin, { displayName: isOther ? targetLogin : actor.displayName, create: !isOther });
  if (isOther && !summary.user) {
    return buildCommandRuntimeResponse({ ...input, command }, { ok: false, action: "points", messageKey: "points.user_not_found", error: "user_not_found", data: { targetLogin } });
  }
  const rank = getAvailableRank(targetLogin, { includeZero: false, mode: summary.mode });
  const context = {
    target: summary.displayName || targetLogin,
    points: summary.available,
    available: summary.available,
    balance: summary.balance,
    reserved: summary.reserved,
    rank: rank.rank || "-",
    rankTotal: rank.rankTotal || 0,
    currencyName: summary.currencyName
  };
  emitLoyaltyEvent("loyalty.points.balance.checked", { login: targetLogin, actor: actor.login, summary, rank }, { ttlMs: 15000 });
  return buildCommandRuntimeResponse({ ...input, command }, {
    ok: true,
    active: true,
    commandsActive: true,
    action: "points_balance",
    messageKey: isOther ? "points.other" : (rank.rank ? "points.self" : "points.self_unranked"),
    context,
    data: { summary, rank, commandDefinition }
  });
}

function handleGivePointsCommandRuntime(input = {}) {
  const actor = input.actor || commandUser(input);
  if (!actor.isMod) {
    return buildCommandRuntimeResponse(input, { ok: false, action: "points_give", messageKey: "points.permission_denied", error: "permission_denied" });
  }
  const args = Array.isArray(input.args) ? input.args : commandArgs(input);
  const targetLogin = normalizeCommandLogin(args[0]);
  const amount = parsePositiveInt(args[1]);
  if (!targetLogin) return buildCommandRuntimeResponse(input, { ok: false, action: "points_give", messageKey: "points.user_not_found", error: "user_required" });
  if (!amount) return buildCommandRuntimeResponse(input, { ok: false, action: "points_give", messageKey: "points.invalid_amount", error: "invalid_amount" });
  const result = awardPoints({
    login: targetLogin,
    displayName: targetLogin,
    amount,
    type: "points_admin_give",
    reason: "chat_givepoints",
    sourceModule: MODULE_NAME,
    sourceProvider: "chat_command",
    referenceType: "chat_command",
    referenceId: `givepoints:${actor.login}:${core.nowIso()}`,
    metadata: { actorLogin: actor.login, actorDisplayName: actor.displayName, command: input.command || "givepoints" }
  });
  const summary = getBalanceSummary(targetLogin, { create: false });
  const rank = getAvailableRank(targetLogin, { includeZero: false, mode: summary.mode });
  return buildCommandRuntimeResponse(input, {
    ok: true,
    active: true,
    commandsActive: true,
    action: "points_give",
    messageKey: "points.give_success",
    context: { target: summary.displayName || targetLogin, amount, available: summary.available, balance: summary.balance, reserved: summary.reserved, rank: rank.rank || "-", rankTotal: rank.rankTotal || 0, currencyName: summary.currencyName },
    data: { result, summary, rank }
  });
}

function handleSetPointCommandRuntime(input = {}) {
  const actor = input.actor || commandUser(input);
  if (!actor.isBroadcaster) {
    return buildCommandRuntimeResponse(input, { ok: false, action: "points_set", messageKey: "points.permission_denied", error: "permission_denied" });
  }
  const args = Array.isArray(input.args) ? input.args : commandArgs(input);
  const targetLogin = normalizeCommandLogin(args[0]);
  const targetBalance = parsePositiveInt(args[1]);
  if (!targetLogin) return buildCommandRuntimeResponse(input, { ok: false, action: "points_set", messageKey: "points.user_not_found", error: "user_required" });
  if (!Number.isFinite(targetBalance) || targetBalance < 0) return buildCommandRuntimeResponse(input, { ok: false, action: "points_set", messageKey: "points.invalid_amount", error: "invalid_amount" });
  const before = getBalanceSummary(targetLogin, { displayName: targetLogin, create: true });
  if (targetBalance < before.reserved) {
    return buildCommandRuntimeResponse(input, { ok: false, action: "points_set", messageKey: "points.insufficient_balance", error: "target_below_reserved", context: { amount: before.reserved, available: before.available }, data: { before, targetBalance } });
  }
  const diff = targetBalance - before.balance;
  let result = { ok: true, skipped: true, reason: "already_target_balance", transaction: null, user: before.user };
  if (diff !== 0) {
    result = recordTransaction({
      login: targetLogin,
      displayName: before.displayName || targetLogin,
      amount: diff,
      type: "points_admin_set",
      reason: "chat_setpoint",
      mode: before.mode,
      sourceModule: MODULE_NAME,
      sourceProvider: "chat_command",
      referenceType: "chat_command",
      referenceId: `setpoint:${actor.login}:${core.nowIso()}`,
      metadata: { actorLogin: actor.login, actorDisplayName: actor.displayName, command: input.command || "setpoint", targetBalance, balanceBefore: before.balance }
    });
    emitLoyaltyEvent("loyalty.points.transaction.created", { kind: "setpoint", amount: diff, result }, { replayable: true, ttlMs: 60000 });
  }
  const summary = getBalanceSummary(targetLogin, { create: false });
  const rank = getAvailableRank(targetLogin, { includeZero: false, mode: summary.mode });
  return buildCommandRuntimeResponse(input, {
    ok: true,
    active: true,
    commandsActive: true,
    action: "points_set",
    messageKey: "points.set_success",
    context: { target: summary.displayName || targetLogin, targetBalance, available: summary.available, balance: summary.balance, reserved: summary.reserved, rank: rank.rank || "-", rankTotal: rank.rankTotal || 0, currencyName: summary.currencyName },
    data: { result, summary, rank }
  });
}

function counts() {
  ensureSchema();
  return {
    users: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_users")?.count || 0),
    transactions: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_transactions")?.count || 0),
    reservations: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_reservations")?.count || 0),
    imports: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_imports")?.count || 0),
    ignoredUsers: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_ignored_users WHERE enabled = 1")?.count || 0),
    watchStates: Number(database.get("SELECT COUNT(*) AS count FROM loyalty_watch_state")?.count || 0),
    runnerEvents: (() => {
      try {
        ensureRunnerEventsTable();
        return Number(database.get("SELECT COUNT(*) AS count FROM loyalty_runner_events")?.count || 0);
      } catch (_) {
        return 0;
      }
    })(),
    loyaltyEvents: (() => {
      try {
        ensureLoyaltyEventsTable();
        return Number(database.get("SELECT COUNT(*) AS count FROM loyalty_events")?.count || 0);
      } catch (_) {
        return 0;
      }
    })()
  };
}

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



function ensureLoyaltyEventsTable() {
  database.run(`
    CREATE TABLE IF NOT EXISTS loyalty_events (
      id ${database.primaryKeyAutoIncrementSql()},
      event_uid TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL DEFAULT '',
      event_type TEXT NOT NULL DEFAULT '',
      source_type TEXT NOT NULL DEFAULT '',
      user_login TEXT NOT NULL DEFAULT '',
      user_display_name TEXT NOT NULL DEFAULT '',
      amount INTEGER NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      points INTEGER NOT NULL DEFAULT 0,
      mode TEXT NOT NULL DEFAULT 'shadow',
      processed INTEGER NOT NULL DEFAULT 0,
      duplicate INTEGER NOT NULL DEFAULT 0,
      skipped INTEGER NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      transaction_uid TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      raw_json TEXT NOT NULL DEFAULT '{}',
      metadata_json TEXT NOT NULL DEFAULT '{}'
    )
  `);
  database.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_events_created ON loyalty_events(created_at)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_events_user ON loyalty_events(user_login)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_events_type ON loyalty_events(event_type)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_loyalty_events_provider ON loyalty_events(provider)`);
}

function normalizeEventType(value) {
  const raw = String(value || "").trim().toLowerCase();
  const map = {
    bits: "cheer",
    cheer: "cheer",
    follow: "follow",
    sub: "subscribe",
    subscribe: "subscribe",
    subscription: "subscribe",
    resub: "resub",
    gift_sub: "gift_sub",
    giftsub: "gift_sub",
    giftbomb: "gift_bomb",
    gift_bomb: "gift_bomb",
    gifted_sub_received: "gifted_sub_received",
    giftedsubreceived: "gifted_sub_received",
    raid: "raid",
    tip: "tip",
    donation: "tip"
  };
  return map[raw] || raw || "unknown";
}

function normalizeTier(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["1000", "tier1", "tier_1", "1", "prime"].includes(raw)) return "1000";
  if (["2000", "tier2", "tier_2", "2"].includes(raw)) return "2000";
  if (["3000", "tier3", "tier_3", "3"].includes(raw)) return "3000";
  return raw || "none";
}

function tierLabel(tier) {
  const normalized = normalizeTier(tier);
  if (normalized === "1000") return "tier1";
  if (normalized === "2000") return "tier2";
  if (normalized === "3000") return "tier3";
  return normalized || "none";
}

function tierAmount(source, tier, fallback) {
  const normalized = normalizeTier(tier);
  const map = source && typeof source === "object" ? source : {};
  const keys = [normalized, tierLabel(normalized), normalized.replace(/^tier/, ""), String(tier || "")];
  for (const key of keys) {
    if (!key) continue;
    const value = Number(map[key]);
    if (Number.isFinite(value)) return Math.floor(value);
  }
  const base = Number(fallback || 0);
  return Number.isFinite(base) ? Math.floor(base) : 0;
}

function stableEventUid(input = {}) {
  const explicit = String(input.eventUid || input.eventId || input.id || input.referenceId || "").trim();
  if (explicit) return explicit;
  return uid("loyalty_evt");
}

function rowToLoyaltyEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.event_uid,
    provider: row.provider || "",
    eventType: row.event_type || "",
    sourceType: row.source_type || "",
    login: row.user_login || "",
    displayName: row.user_display_name || row.user_login || "",
    amount: Number(row.amount || 0),
    tier: row.tier || "",
    quantity: Number(row.quantity || 0),
    points: Number(row.points || 0),
    mode: row.mode || "shadow",
    processed: Number(row.processed || 0) === 1,
    duplicate: Number(row.duplicate || 0) === 1,
    skipped: Number(row.skipped || 0) === 1,
    reason: row.reason || "",
    transactionUid: row.transaction_uid || "",
    createdAt: row.created_at || "",
    raw: core.safeJsonParse(row.raw_json, {}),
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function calculateEventBonus(input = {}) {
  refreshConfigFromSettings();
  const type = normalizeEventType(input.eventType || input.type);
  const tier = normalizeTier(input.tier || input.subTier || input.subscriptionTier);
  const quantity = Math.max(1, Number.parseInt(input.quantity || input.total || input.count || 1, 10) || 1);
  const valueAmount = Number(input.amount || input.bits || input.viewers || input.amountEuro || 0) || 0;
  const bonuses = config.bonuses || {};

  if (!config.enabled) return { ok: false, skipped: true, reason: "loyalty_disabled", type, amount: 0, tier, quantity };
  if (!config.features || config.features.eventBonusesEnabled !== true) return { ok: false, skipped: true, reason: "event_bonuses_disabled", type, amount: 0, tier, quantity };

  if (type === "follow") {
    if (!bonuses.follow?.enabled) return { ok: false, skipped: true, reason: "follow_bonus_disabled", type, amount: 0, tier, quantity };
    return { ok: true, type, amount: Math.floor(Number(bonuses.follow.amount || 0)), tier, quantity };
  }

  if (type === "cheer") {
    if (!bonuses.cheer?.enabled) return { ok: false, skipped: true, reason: "cheer_bonus_disabled", type, amount: 0, tier, quantity };
    const bits = Math.max(0, Number(input.bits || input.amount || 0) || 0);
    const amount = Math.floor((bits / 100) * Number(bonuses.cheer.amountPer100Bits || 0));
    return { ok: true, type, amount, tier, quantity, bits };
  }

  if (type === "raid") {
    if (!bonuses.raid?.enabled) return { ok: false, skipped: true, reason: "raid_bonus_disabled", type, amount: 0, tier, quantity };
    return { ok: true, type, amount: Math.floor(Number(bonuses.raid.amount || 0)), tier, quantity, viewers: valueAmount };
  }

  if (type === "tip") {
    if (!bonuses.tip?.enabled) return { ok: false, skipped: true, reason: "tip_bonus_disabled", type, amount: 0, tier, quantity };
    return { ok: true, type, amount: Math.floor(valueAmount * Number(bonuses.tip.amountPerEuro || 0)), tier, quantity, amountEuro: valueAmount };
  }

  if (type === "subscribe") {
    if (!bonuses.subscribe?.enabled) return { ok: false, skipped: true, reason: "subscribe_bonus_disabled", type, amount: 0, tier, quantity };
    return { ok: true, type, amount: tierAmount(bonuses.subscribe.tierAmounts, tier, bonuses.subscribe.amount), tier, quantity };
  }

  if (type === "resub") {
    if (!bonuses.resub?.enabled) return { ok: false, skipped: true, reason: "resub_bonus_disabled", type, amount: 0, tier, quantity };
    let amount = tierAmount(bonuses.resub.tierAmounts, tier, bonuses.resub.amount);
    const months = Number(input.months || input.cumulativeMonths || input.cumulative_months || 0) || 0;
    if (bonuses.subStreak?.enabled && Array.isArray(bonuses.subStreak.rules)) {
      const matching = bonuses.subStreak.rules
        .filter(rule => months >= Number(rule.months || 0))
        .sort((a, b) => Number(b.months || 0) - Number(a.months || 0))[0];
      if (matching) amount += Math.floor(Number(matching.amount || 0));
    }
    return { ok: true, type, amount, tier, quantity, months };
  }

  if (type === "gift_sub" || type === "gift_bomb") {
    if (!bonuses.giftSubGiver?.enabled) return { ok: false, skipped: true, reason: "gift_sub_giver_bonus_disabled", type, amount: 0, tier, quantity };
    const single = tierAmount(bonuses.giftSubGiver.tierAmounts, tier, bonuses.giftSubGiver.amount);
    return { ok: true, type, amount: Math.floor(single * quantity), tier, quantity };
  }

  if (type === "gifted_sub_received") {
    if (!bonuses.giftSubReceiver?.enabled) return { ok: false, skipped: true, reason: "gift_sub_receiver_bonus_disabled", type, amount: 0, tier, quantity };
    return { ok: true, type, amount: tierAmount(bonuses.giftSubReceiver.tierAmounts, tier, bonuses.giftSubReceiver.amount), tier, quantity };
  }

  return { ok: false, skipped: true, reason: "unsupported_event_type", type, amount: 0, tier, quantity };
}

function insertLoyaltyEventRow(data) {
  ensureLoyaltyEventsTable();
  database.run(`
    INSERT INTO loyalty_events (
      event_uid, provider, event_type, source_type, user_login, user_display_name,
      amount, tier, quantity, points, mode, processed, duplicate, skipped, reason,
      transaction_uid, created_at, raw_json, metadata_json
    ) VALUES (
      :eventUid, :provider, :eventType, :sourceType, :login, :displayName,
      :amount, :tier, :quantity, :points, :mode, :processed, :duplicate, :skipped, :reason,
      :transactionUid, :createdAt, :rawJson, :metadataJson
    )
  `, data);
  return database.get("SELECT * FROM loyalty_events WHERE event_uid = :eventUid", { eventUid: data.eventUid });
}

function getSubscribeResubCollisionDedupeConfig() {
  refreshConfigFromSettings();
  const source = config?.eventDedupe?.subscribeResubCollision || {};
  const enabled = core.boolParam(source.enabled, true);
  const rawWindow = Number(source.windowSeconds || 60);
  const windowSeconds = Math.max(5, Math.min(600, Number.isFinite(rawWindow) ? rawWindow : 60));
  return { enabled, windowSeconds };
}

function findRecentSubscribeForResubCollision({ login, provider, tier, nowIso, windowSeconds }) {
  if (!login || !provider || !tier) return null;
  const nowMs = Date.parse(nowIso || core.nowIso());
  if (!Number.isFinite(nowMs)) return null;
  const cutoffIso = new Date(nowMs - windowSeconds * 1000).toISOString();
  const rows = database.all(`
    SELECT *
    FROM loyalty_events
    WHERE user_login = :login
      AND provider = :provider
      AND event_type = 'subscribe'
      AND tier = :tier
      AND processed = 1
      AND duplicate = 0
      AND created_at >= :cutoffIso
      AND created_at <= :nowIso
    ORDER BY created_at DESC
    LIMIT 5
  `, {
    login,
    provider,
    tier,
    cutoffIso,
    nowIso: nowIso || core.nowIso()
  });

  for (const row of rows) {
    const metadata = core.safeJsonParse(row.metadata_json, {});
    if (metadata?.dedupe?.replacedByResub === true) continue;
    const points = Number(row.points || 0);
    if (!Number.isFinite(points) || points <= 0) continue;
    return row;
  }
  return null;
}

function markSubscribeReplacedByResub(subscribeRow, details = {}) {
  if (!subscribeRow || !subscribeRow.event_uid) return null;
  const metadata = core.safeJsonParse(subscribeRow.metadata_json, {});
  const nextMetadata = {
    ...metadata,
    dedupe: {
      ...(metadata.dedupe && typeof metadata.dedupe === "object" ? metadata.dedupe : {}),
      replacedByResub: true,
      replacedByEventUid: String(details.resubEventUid || ""),
      adjustmentTransactionUid: String(details.adjustmentTransactionUid || ""),
      originalPoints: Number(subscribeRow.points || 0),
      originalReason: subscribeRow.reason || "",
      rule: "subscribe_resub_collision",
      windowSeconds: Number(details.windowSeconds || 0),
      replacedAt: core.nowIso()
    }
  };

  database.run(`
    UPDATE loyalty_events
    SET points = 0,
        reason = 'replaced_by_resub',
        metadata_json = :metadataJson
    WHERE event_uid = :eventUid
  `, {
    eventUid: subscribeRow.event_uid,
    metadataJson: JSON.stringify(nextMetadata)
  });

  return database.get("SELECT * FROM loyalty_events WHERE event_uid = :eventUid", { eventUid: subscribeRow.event_uid });
}

function compensateRecentSubscribeForResubCollision(input = {}) {
  const dedupeConfig = getSubscribeResubCollisionDedupeConfig();
  if (!dedupeConfig.enabled) return null;

  const subscribeRow = findRecentSubscribeForResubCollision({
    login: input.login,
    provider: input.provider,
    tier: input.tier,
    nowIso: input.nowIso,
    windowSeconds: dedupeConfig.windowSeconds
  });

  if (!subscribeRow) return null;

  const originalPoints = Number(subscribeRow.points || 0);
  if (!Number.isFinite(originalPoints) || originalPoints <= 0) return null;

  const adjustment = recordTransaction({
    login: input.login,
    displayName: input.displayName || subscribeRow.user_display_name || input.login,
    amount: -originalPoints,
    type: "event_dedupe_adjustment",
    reason: "event_subscribe_replaced_by_resub",
    mode: input.mode || config.mode,
    sourceModule: "loyalty",
    sourceProvider: input.provider,
    referenceType: "event_dedupe",
    referenceId: `${input.eventUid || "resub"}:replaces:${subscribeRow.event_uid}`,
    metadata: {
      rule: "subscribe_resub_collision",
      windowSeconds: dedupeConfig.windowSeconds,
      subscribeEventUid: subscribeRow.event_uid,
      subscribeTransactionUid: subscribeRow.transaction_uid || "",
      resubEventUid: input.eventUid || "",
      login: input.login,
      tier: input.tier,
      compensatedPoints: originalPoints,
      subscribeCreatedAt: subscribeRow.created_at || "",
      resubCreatedAt: input.nowIso || ""
    }
  });

  const updatedSubscribeRow = markSubscribeReplacedByResub(subscribeRow, {
    resubEventUid: input.eventUid,
    adjustmentTransactionUid: adjustment?.transaction?.uid || "",
    windowSeconds: dedupeConfig.windowSeconds
  });

  return {
    ok: true,
    rule: "subscribe_resub_collision",
    windowSeconds: dedupeConfig.windowSeconds,
    subscribeEvent: rowToLoyaltyEvent(updatedSubscribeRow || subscribeRow),
    adjustmentTransaction: adjustment?.transaction || null,
    compensatedPoints: originalPoints
  };
}

function recordEventBonus(input = {}) {
  refreshConfigFromSettings();
  ensureLoyaltyEventsTable();

  const eventUid = stableEventUid(input);
  const existing = database.get("SELECT * FROM loyalty_events WHERE event_uid = :eventUid", { eventUid });
  if (existing) {
    return { ok: true, duplicate: true, skipped: true, reason: "duplicate_event", event: rowToLoyaltyEvent(existing), transaction: null };
  }

  const eventType = normalizeEventType(input.eventType || input.type);
  const login = normalizeLogin(input.login || input.userLogin || input.user_login || input.user);
  const displayName = cleanDisplayName(login, input.displayName || input.userDisplayName || input.user_name || input.user);
  const provider = String(input.provider || input.sourceProvider || "unknown").trim() || "unknown";
  const sourceType = String(input.sourceType || input.eventsubType || input.rawType || "").trim();
  const mode = normalizeMode(input.mode || config.mode);
  const now = core.nowIso();
  const quantity = Math.max(1, Number.parseInt(input.quantity || input.total || input.count || 1, 10) || 1);
  const valueAmount = Number(input.amount || input.bits || input.viewers || input.amountEuro || 0) || 0;
  const tier = normalizeTier(input.tier || input.subTier || input.subscriptionTier);
  const raw = input.raw && typeof input.raw === "object" ? input.raw : input;
  const rawQuery = raw && raw.query && typeof raw.query === "object" ? raw.query : {};
  const rawEvent = raw && raw.event && typeof raw.event === "object" ? raw.event : {};
  const metadata = input.metadata && typeof input.metadata === "object" ? input.metadata : {};

  if (!login) {
    const row = insertLoyaltyEventRow({
      eventUid, provider, eventType, sourceType, login: "", displayName: "",
      amount: valueAmount, tier, quantity, points: 0, mode, processed: 0, duplicate: 0, skipped: 1,
      reason: "user_login_required", transactionUid: "", createdAt: now,
      rawJson: JSON.stringify(raw || {}), metadataJson: JSON.stringify(metadata || {})
    });
    return { ok: true, skipped: true, reason: "user_login_required", event: rowToLoyaltyEvent(row), transaction: null };
  }

  if (isIgnoredUser(login)) {
    const row = insertLoyaltyEventRow({
      eventUid, provider, eventType, sourceType, login, displayName,
      amount: valueAmount, tier, quantity, points: 0, mode, processed: 0, duplicate: 0, skipped: 1,
      reason: "ignored_user", transactionUid: "", createdAt: now,
      rawJson: JSON.stringify(raw || {}), metadataJson: JSON.stringify(metadata || {})
    });
    return { ok: true, skipped: true, ignored: true, reason: "ignored_user", event: rowToLoyaltyEvent(row), transaction: null };
  }

  const calculated = calculateEventBonus({ ...input, eventType, tier, quantity, amount: valueAmount });
  if (!calculated.ok || calculated.skipped || Number(calculated.amount || 0) <= 0) {
    const reason = calculated.reason || "no_points";
    const row = insertLoyaltyEventRow({
      eventUid, provider, eventType: calculated.type || eventType, sourceType, login, displayName,
      amount: valueAmount, tier, quantity, points: 0, mode, processed: 0, duplicate: 0, skipped: 1,
      reason, transactionUid: "", createdAt: now,
      rawJson: JSON.stringify(raw || {}), metadataJson: JSON.stringify({ ...metadata, calculated })
    });
    return { ok: true, skipped: true, reason, calculated, event: rowToLoyaltyEvent(row), transaction: null };
  }

  const dedupe = (calculated.type || eventType) === "resub"
    ? compensateRecentSubscribeForResubCollision({
        eventUid,
        login,
        displayName,
        provider,
        tier,
        mode,
        nowIso: now
      })
    : null;

  const result = recordTransaction({
    login,
    displayName,
    amount: calculated.amount,
    type: "event_bonus",
    reason: `event_${calculated.type || eventType}`,
    mode,
    sourceModule: "loyalty",
    sourceProvider: provider,
    referenceType: "event_bonus",
    referenceId: eventUid,
    metadata: { eventUid, eventType: calculated.type || eventType, sourceType, tier, quantity, valueAmount, calculated, raw }
  });

  const relatedTransactions = [];
  const relatedUsers = [];
  let receiverResult = null;
  let receiverCalculated = null;
  let receiverSkippedReason = "";

  const recipientLogin = normalizeLogin(
    input.recipientLogin || input.recipient_login || input.recipient ||
    input.receiverLogin || input.receiver_login || input.targetLogin || input.target_login ||
    rawQuery.recipientLogin || rawQuery.recipient_login || rawQuery.recipient ||
    rawQuery.receiverLogin || rawQuery.receiver_login || rawQuery.targetLogin || rawQuery.target_login ||
    rawEvent.recipientLogin || rawEvent.recipient_login || rawEvent.recipient_user_login ||
    rawEvent.receiverLogin || rawEvent.receiver_login || rawEvent.targetLogin || rawEvent.target_login ||
    rawEvent.user_login
  );
  const recipientDisplayName = cleanDisplayName(
    recipientLogin,
    input.recipientDisplayName || input.recipient_display_name ||
    input.receiverDisplayName || input.receiver_display_name || input.targetDisplayName || input.target_display_name ||
    rawQuery.recipientDisplayName || rawQuery.recipient_display_name || rawQuery.recipientDisplay || rawQuery.recipient_display ||
    rawQuery.receiverDisplayName || rawQuery.receiver_display_name || rawQuery.targetDisplayName || rawQuery.target_display_name ||
    rawEvent.recipientDisplayName || rawEvent.recipient_display_name || rawEvent.recipient_user_name || rawEvent.recipient_user_display_name ||
    rawEvent.receiverDisplayName || rawEvent.receiver_display_name || rawEvent.targetDisplayName || rawEvent.target_display_name ||
    rawEvent.user_name || recipientLogin
  );

  if ((calculated.type === "gift_sub" || calculated.type === "gift_bomb") && recipientLogin) {
    receiverCalculated = calculateEventBonus({
      ...input,
      eventType: "gifted_sub_received",
      type: "gifted_sub_received",
      tier,
      quantity: 1,
      amount: valueAmount
    });

    if (isIgnoredUser(recipientLogin)) {
      receiverSkippedReason = "receiver_ignored_user";
    } else if (receiverCalculated.ok && !receiverCalculated.skipped && Number(receiverCalculated.amount || 0) > 0) {
      receiverResult = recordTransaction({
        login: recipientLogin,
        displayName: recipientDisplayName,
        amount: receiverCalculated.amount,
        type: "event_bonus",
        reason: "event_gifted_sub_received",
        mode,
        sourceModule: "loyalty",
        sourceProvider: provider,
        referenceType: "event_bonus_receiver",
        referenceId: `${eventUid}:receiver:${recipientLogin}`,
        metadata: {
          eventUid,
          eventType: "gifted_sub_received",
          parentEventType: calculated.type || eventType,
          parentTransactionUid: result?.transaction?.uid || "",
          sourceType,
          tier,
          quantity: 1,
          valueAmount,
          calculated: receiverCalculated,
          raw
        }
      });
      if (receiverResult?.transaction) relatedTransactions.push(receiverResult.transaction);
      if (receiverResult?.user) relatedUsers.push(receiverResult.user);
    } else {
      receiverSkippedReason = receiverCalculated.reason || "receiver_no_points";
    }
  }

  const transactionUid = result?.transaction?.uid || "";
  const eventMetadata = {
    ...metadata,
    calculated,
    dedupe,
    receiver: recipientLogin ? {
      login: recipientLogin,
      displayName: recipientDisplayName,
      calculated: receiverCalculated,
      skipped: !receiverResult,
      reason: receiverResult ? "processed" : receiverSkippedReason,
      transactionUid: receiverResult?.transaction?.uid || ""
    } : null,
    transactions: [result?.transaction, ...relatedTransactions].filter(Boolean).map(tx => ({
      uid: tx.uid,
      login: tx.login,
      displayName: tx.displayName,
      amount: tx.amount,
      reason: tx.reason,
      referenceId: tx.referenceId
    }))
  };

  const row = insertLoyaltyEventRow({
    eventUid, provider, eventType: calculated.type || eventType, sourceType, login, displayName,
    amount: valueAmount, tier, quantity, points: calculated.amount + Number(receiverResult?.transaction?.amount || 0), mode, processed: 1, duplicate: 0, skipped: 0,
    reason: "processed", transactionUid, createdAt: now,
    rawJson: JSON.stringify(raw || {}), metadataJson: JSON.stringify(eventMetadata)
  });

  return {
    ok: true,
    skipped: false,
    duplicate: false,
    reason: "processed",
    calculated,
    receiver: eventMetadata.receiver,
    event: rowToLoyaltyEvent(row),
    transaction: result.transaction,
    relatedTransactions,
    user: result.user,
    relatedUsers
  };
}

function listLoyaltyEvents(options = {}) {
  ensureLoyaltyEventsTable();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 100)));
  const login = normalizeLogin(options.login || "");
  const type = normalizeEventType(options.type || "");
  const where = [];
  const params = { limit };

  if (login) {
    where.push("user_login = :login");
    params.login = login;
  }
  if (type && type !== "unknown") {
    where.push("event_type = :type");
    params.type = type;
  }

  const eventRows = database.all(`
    SELECT *
    FROM loyalty_events
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY id DESC
    LIMIT :limit
  `, params).map(rowToLoyaltyEvent);

  return { ok: true, count: eventRows.length, rows: eventRows };
}


function ensureRunnerEventsTable() {
  database.run(`
    CREATE TABLE IF NOT EXISTS loyalty_runner_events (
      id ${database.primaryKeyAutoIncrementSql()},
      runner_key TEXT NOT NULL DEFAULT 'auto_shadow',
      event_type TEXT NOT NULL,
      trigger TEXT NOT NULL DEFAULT '',
      ok INTEGER NOT NULL DEFAULT 0,
      skipped INTEGER NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      awarded INTEGER NOT NULL DEFAULT 0,
      processed_count INTEGER NOT NULL DEFAULT 0,
      error_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    )
  `);
}

function logRunnerEvent(eventType, payload = {}) {
  try {
    ensureRunnerEventsTable();
    database.run(`
      INSERT INTO loyalty_runner_events (
        runner_key, event_type, trigger, ok, skipped, reason,
        awarded, processed_count, error_count, created_at, metadata_json
      ) VALUES (
        :runnerKey, :eventType, :trigger, :ok, :skipped, :reason,
        :awarded, :processedCount, :errorCount, :createdAt, :metadataJson
      )
    `, {
      runnerKey: "auto_shadow",
      eventType: String(eventType || "event"),
      trigger: String(payload.trigger || ""),
      ok: payload.ok ? 1 : 0,
      skipped: payload.skipped ? 1 : 0,
      reason: String(payload.reason || ""),
      awarded: Number(payload.awarded || 0),
      processedCount: Number(payload.count || payload.processedCount || 0),
      errorCount: Number(Array.isArray(payload.errors) ? payload.errors.length : (payload.errorCount || 0)),
      createdAt: core.nowIso(),
      metadataJson: JSON.stringify(payload || {})
    });
  } catch (err) {
    autoRunnerState.lastError = err && err.message ? err.message : String(err);
  }
}

function getAutoRunnerIntervalSeconds() {
  refreshConfigFromSettings();
  const raw = Number(config?.autoRunner?.intervalSeconds || 60);
  return Math.max(15, Math.min(3600, Number.isFinite(raw) ? raw : 60));
}

function getAutoRunnerStatus() {
  refreshConfigFromSettings();
  return {
    enabled: autoRunnerState.enabled,
    running: autoRunnerState.running,
    timerActive: !!autoRunnerState.timer,
    startedAt: autoRunnerState.startedAt,
    stoppedAt: autoRunnerState.stoppedAt,
    lastRunAt: autoRunnerState.lastRunAt,
    lastRunResult: autoRunnerState.lastRunResult,
    lastError: autoRunnerState.lastError,
    runCount: autoRunnerState.runCount,
    successCount: autoRunnerState.successCount,
    errorCount: autoRunnerState.errorCount,
    trigger: autoRunnerState.trigger,
    config: {
      ...config.autoRunner,
      effectiveIntervalSeconds: getAutoRunnerIntervalSeconds()
    },
    streamState: getStreamState()
  };
}

async function executeAutoRunnerOnce(req = null, trigger = "auto_timer") {
  if (autoRunnerState.running) {
    const skipped = { ok: true, skipped: true, reason: "runner_already_running", trigger };
    autoRunnerState.lastRunResult = skipped;
    logRunnerEvent("run_skipped", skipped);
    return skipped;
  }

  autoRunnerState.running = true;
  autoRunnerState.lastError = "";
  autoRunnerState.lastRunAt = core.nowIso();
  autoRunnerState.runCount += 1;

  try {
    const result = await runPresenceOnce(req, {
      minutes: config?.autoRunner?.activeMinutes || config?.presence?.activeMinutes || 30,
      limit: config?.autoRunner?.maxUsersPerRun || config?.presence?.maxUsersPerRun || 250,
      includeJoinedOnly: config?.autoRunner?.includeJoinedOnly !== false,
      checkAuto: config?.autoRunner?.checkAutoLive !== false,
      force: false
    });

    const finalResult = { ...result, trigger, runnerAt: autoRunnerState.lastRunAt };
    autoRunnerState.lastRunResult = finalResult;

    if (result.ok !== false) {
      autoRunnerState.successCount += 1;
      logRunnerEvent(result.skipped ? "run_skipped" : "run_ok", finalResult);
    } else {
      autoRunnerState.errorCount += 1;
      autoRunnerState.lastError = result.reason || "runner_result_not_ok";
      logRunnerEvent("run_error", finalResult);
    }

    return finalResult;
  } catch (err) {
    const finalError = {
      ok: false,
      skipped: false,
      reason: "runner_exception",
      trigger,
      error: err && err.message ? err.message : String(err),
      runnerAt: autoRunnerState.lastRunAt
    };
    autoRunnerState.errorCount += 1;
    autoRunnerState.lastError = finalError.error;
    autoRunnerState.lastRunResult = finalError;
    logRunnerEvent("run_exception", finalError);
    return finalError;
  } finally {
    autoRunnerState.running = false;
  }
}

function scheduleAutoRunner(req = null) {
  if (!autoRunnerState.enabled) return;
  if (autoRunnerState.timer) clearTimeout(autoRunnerState.timer);

  autoRunnerState.timer = setTimeout(async () => {
    autoRunnerState.timer = null;
    if (!autoRunnerState.enabled) return;
    await executeAutoRunnerOnce(req, "auto_timer");
    scheduleAutoRunner(req);
  }, getAutoRunnerIntervalSeconds() * 1000);
}

function startAutoRunner(options = {}) {
  refreshConfigFromSettings();
  const trigger = String(options.trigger || "manual_start");
  if (autoRunnerState.enabled && autoRunnerState.timer) {
    const payload = { ok: true, alreadyRunning: true, trigger, status: getAutoRunnerStatus() };
    logRunnerEvent("runner_start_already_running", payload);
    return payload;
  }

  autoRunnerState.enabled = true;
  autoRunnerState.trigger = trigger;
  autoRunnerState.startedAt = core.nowIso();
  autoRunnerState.stoppedAt = "";
  autoRunnerState.lastError = "";
  scheduleAutoRunner(options.req || null);

  const payload = { ok: true, started: true, trigger: autoRunnerState.trigger, status: getAutoRunnerStatus() };
  logRunnerEvent("runner_started", payload);
  return payload;
}

function stopAutoRunner(options = {}) {
  const wasEnabled = !!autoRunnerState.enabled;
  const hadTimer = !!autoRunnerState.timer;
  if (autoRunnerState.timer) {
    clearTimeout(autoRunnerState.timer);
    autoRunnerState.timer = null;
  }

  autoRunnerState.enabled = false;
  autoRunnerState.running = false;
  autoRunnerState.trigger = String(options.trigger || "manual_stop");
  autoRunnerState.stoppedAt = core.nowIso();

  const payload = { ok: true, stopped: true, wasEnabled, hadTimer, trigger: autoRunnerState.trigger, status: getAutoRunnerStatus() };
  logRunnerEvent(wasEnabled || hadTimer ? "runner_stopped" : "runner_stop_already_stopped", payload);
  return payload;
}

function logStreamStateEvent(eventType, payload = {}) {
  logRunnerEvent(eventType, {
    ok: true,
    skipped: false,
    trigger: String(payload.source || payload.trigger || "stream_state"),
    reason: String(payload.reason || ""),
    streamState: payload.streamState || null,
    previousStreamState: payload.previousStreamState || null,
    signal: payload.signal || null,
    runner: payload.runner || null,
    automation: payload.automation || null
  });
}

function controlAutoRunnerForStreamState(live, options = {}) {
  refreshConfigFromSettings();
  const source = String(options.source || "stream_state").trim() || "stream_state";
  const reason = String(options.reason || "").trim();
  const sourceKind = String(options.sourceKind || "stream_state").trim() || "stream_state";
  const startSetting = sourceKind === "auto" ? "startOnAutoLive" : "startOnStreamStateStart";
  const stopSetting = sourceKind === "auto" ? "stopOnAutoOffline" : "stopOnStreamStateStop";
  const shouldControl = live
    ? core.boolParam(config?.autoRunner?.[startSetting], sourceKind !== "auto")
    : core.boolParam(config?.autoRunner?.[stopSetting], sourceKind !== "auto");

  const payload = {
    ok: true,
    live: !!live,
    source,
    sourceKind,
    setting: live ? startSetting : stopSetting,
    automationEnabled: shouldControl,
    reason,
    runner: null
  };

  if (!shouldControl) {
    logRunnerEvent(live ? "runner_auto_start_skipped_by_setting" : "runner_auto_stop_skipped_by_setting", {
      ...payload,
      skipped: true,
      trigger: source,
      reason: reason || "automation_setting_disabled"
    });
    return payload;
  }

  payload.runner = live
    ? startAutoRunner({ trigger: `${sourceKind}_start:${source}`, req: options.req || null })
    : stopAutoRunner({ trigger: `${sourceKind}_stop:${source}` });

  logRunnerEvent(live ? "runner_auto_started_by_stream_state" : "runner_auto_stopped_by_stream_state", {
    ...payload,
    trigger: source,
    reason
  });

  return payload;
}


function recoverAutoRunnerFromStoredStreamStateOnBoot(options = {}) {
  refreshConfigFromSettings();
  const trigger = String(options.trigger || "boot_recovery:stream_state_live").trim() || "boot_recovery:stream_state_live";
  let streamState = null;

  try {
    streamState = getStreamState();
  } catch (err) {
    const payload = {
      ok: false,
      skipped: true,
      trigger,
      reason: "stream_state_read_failed",
      error: err && err.message ? err.message : String(err)
    };
    logRunnerEvent("runner_boot_recovery_error", payload);
    return payload;
  }

  const live = !!(streamState && streamState.effective && streamState.effective.live);
  const automationEnabled = core.boolParam(config?.autoRunner?.startOnStreamStateStart, true);

  const payload = {
    ok: true,
    skipped: !live || !automationEnabled,
    trigger,
    live,
    streamState,
    automationEnabled,
    runner: null,
    reason: ""
  };

  if (!live) {
    payload.reason = "stream_state_not_live";
    return payload;
  }

  if (!automationEnabled) {
    payload.reason = "start_on_stream_state_start_disabled";
    logRunnerEvent("runner_boot_recovery_skipped_by_setting", payload);
    return payload;
  }

  payload.skipped = false;
  payload.reason = "stream_state_live_on_boot";
  payload.runner = startAutoRunner({ trigger, req: null });

  logRunnerEvent("runner_auto_started_on_boot_live_state", {
    ...payload,
    trigger,
    reason: payload.runner && payload.runner.alreadyRunning ? "runner_already_running" : payload.reason
  });

  return payload;
}

function listRunnerEvents(options = {}) {
  ensureRunnerEventsTable();
  const limit = Math.max(1, Math.min(500, Number(options.limit || 50) || 50));
  const rows = database.all(`
    SELECT *
    FROM loyalty_runner_events
    ORDER BY id DESC
    LIMIT :limit
  `, { limit }).map(row => ({
    id: row.id,
    runnerKey: row.runner_key,
    eventType: row.event_type,
    trigger: row.trigger,
    ok: Number(row.ok || 0) === 1,
    skipped: Number(row.skipped || 0) === 1,
    reason: row.reason || "",
    awarded: Number(row.awarded || 0),
    processedCount: Number(row.processed_count || 0),
    errorCount: Number(row.error_count || 0),
    createdAt: row.created_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  }));

  return { count: rows.length, rows };
}


function buildStatus() {
  refreshConfigFromSettings();
  return {
    module: MODULE_NAME,
    version: VERSION,
    loadedAt: state.loadedAt,
    mode: normalizeMode(config.mode),
    enabled: !!config.enabled,
    currencyName: config.currency && config.currency.name || "Kekskrümel",
    shadowMode: normalizeMode(config.mode) === "shadow",
    streamElementsStillActive: true,
    importStatus: config.import && config.import.status || "not_imported",
    config: {
      path: state.configPath,
      ok: state.configOk,
      error: state.configError
    },
    database: databaseStatus(),
    schema: { ...state.schema },
    settings: { ...state.settings },
    texts: { ...state.texts },
    counts: counts(),
    features: { ...config.features },
    safety: {
      availableBalance: true,
      reservations: true,
      ranking: true,
      noNegativeSpendGuard: true
    },
    centralCommands: state.schema.ok ? listCentralCommandDefinitions() : { ok: false, available: false },
    watch: { ...config.watch },
    autoRunner: getAutoRunnerStatus(),
    streamStatusBinding: { ...state.streamStatusBinding },
    twitchEventBonusBinding: { ...state.twitchEventBonusBinding }
  };
}


function streamStateKey() {
  return "main";
}

function ensureStreamStateTable() {
  database.run(`
    CREATE TABLE IF NOT EXISTS loyalty_stream_state (
      key TEXT PRIMARY KEY,
      manual_live INTEGER NOT NULL DEFAULT 0,
      manual_active INTEGER NOT NULL DEFAULT 0,
      manual_source TEXT NOT NULL DEFAULT '',
      manual_reason TEXT NOT NULL DEFAULT '',
      manual_updated_at TEXT NOT NULL DEFAULT '',
      auto_live INTEGER NOT NULL DEFAULT 0,
      auto_source TEXT NOT NULL DEFAULT '',
      auto_checked_at TEXT NOT NULL DEFAULT '',
      effective_live INTEGER NOT NULL DEFAULT 0,
      effective_source TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    )
  `);
}

function ensureStreamStateRow() {
  ensureStreamStateTable();
  const now = core.nowIso();
  const existing = database.get("SELECT key FROM loyalty_stream_state WHERE key = :key", { key: streamStateKey() });
  if (!existing) {
    database.run(`
      INSERT INTO loyalty_stream_state (
        key, manual_live, manual_active, manual_source, manual_reason, manual_updated_at,
        auto_live, auto_source, auto_checked_at,
        effective_live, effective_source,
        created_at, updated_at, metadata_json
      ) VALUES (
        :key, 0, 0, '', '', '',
        0, '', '',
        0, 'initial',
        :createdAt, :updatedAt, '{}'
      )
    `, { key: streamStateKey(), createdAt: now, updatedAt: now });
  }
}

function rowToStreamState(row) {
  if (!row) return null;
  const manualUpdatedAt = row.manual_updated_at || "";
  const maxHours = Number(config?.streamState?.manualOverrideMaxHours || 12);
  const manualAgeMs = manualUpdatedAt ? Date.now() - Date.parse(manualUpdatedAt) : null;
  const manualExpired = Number.isFinite(manualAgeMs) && manualAgeMs > maxHours * 60 * 60 * 1000;
  const manualActive = Number(row.manual_active || 0) === 1 && !manualExpired;
  const autoLive = Number(row.auto_live || 0) === 1;
  const effectiveLive = manualActive ? Number(row.manual_live || 0) === 1 : autoLive;

  return {
    key: row.key || streamStateKey(),
    manual: {
      active: manualActive,
      configuredActive: Number(row.manual_active || 0) === 1,
      live: Number(row.manual_live || 0) === 1,
      source: row.manual_source || "",
      reason: row.manual_reason || "",
      updatedAt: manualUpdatedAt,
      expired: manualExpired,
      maxHours
    },
    auto: {
      live: autoLive,
      source: row.auto_source || "",
      checkedAt: row.auto_checked_at || ""
    },
    effective: {
      live: effectiveLive,
      source: manualActive ? "manual" : (row.auto_source || "auto"),
      storedLive: Number(row.effective_live || 0) === 1,
      storedSource: row.effective_source || ""
    },
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    metadata: core.safeJsonParse(row.metadata_json, {})
  };
}

function getStreamState() {
  ensureSchema();
  ensureStreamStateRow();
  const row = database.get("SELECT * FROM loyalty_stream_state WHERE key = :key", { key: streamStateKey() });
  const stateRow = rowToStreamState(row);
  if (!stateRow) return null;

  const effectiveLive = stateRow.effective.live ? 1 : 0;
  const effectiveSource = stateRow.effective.source || "unknown";
  database.run(`
    UPDATE loyalty_stream_state
    SET effective_live = :effectiveLive,
        effective_source = :effectiveSource,
        updated_at = :updatedAt
    WHERE key = :key
  `, {
    key: streamStateKey(),
    effectiveLive,
    effectiveSource,
    updatedAt: core.nowIso()
  });

  const updated = database.get("SELECT * FROM loyalty_stream_state WHERE key = :key", { key: streamStateKey() });
  return rowToStreamState(updated);
}


function clearManualStreamState(options = {}) {
  ensureSchema();
  ensureStreamStateRow();
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_stream_state
    SET manual_active = 0,
        manual_source = :source,
        manual_reason = :reason,
        updated_at = :updatedAt
    WHERE key = :key
  `, {
    key: streamStateKey(),
    source: String(options.source || "clear").trim(),
    reason: String(options.reason || "manual_clear").trim(),
    updatedAt: now
  });
  return getStreamState();
}

function updateAutoStreamState(live, options = {}) {
  ensureSchema();
  ensureStreamStateRow();
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_stream_state
    SET auto_live = :autoLive,
        auto_source = :autoSource,
        auto_checked_at = :autoCheckedAt,
        updated_at = :updatedAt
    WHERE key = :key
  `, {
    key: streamStateKey(),
    autoLive: live ? 1 : 0,
    autoSource: String(options.source || "manual_check").trim() || "manual_check",
    autoCheckedAt: now,
    updatedAt: now
  });
  return getStreamState();
}


async function fetchJson(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { raw: text };
    }
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}


function getRequestBaseUrl(req) {
  const proto = req && req.protocol ? req.protocol : "http";
  const host = req && typeof req.get === "function" ? req.get("host") : "127.0.0.1:8080";
  return `${proto}://${host}`;
}

function parseCentralStreamStatusPayload(payload = {}) {
  const data = payload && typeof payload === "object" ? payload : {};
  const diagnostics = data.diagnostics && typeof data.diagnostics === "object" ? data.diagnostics : {};
  const streamState = data.streamState && typeof data.streamState === "object"
    ? data.streamState
    : (diagnostics.streamState && typeof diagnostics.streamState === "object" ? diagnostics.streamState : data);
  const manualOverride = streamState.manualOverride && typeof streamState.manualOverride === "object" ? streamState.manualOverride : {};
  const streamSession = streamState.streamSession && typeof streamState.streamSession === "object" ? streamState.streamSession : {};
  const overrideActive = manualOverride.active === true;
  const baseLive = streamState.live === true || streamState.isLive === true || streamState.status === "live" || streamState.sessionStatus === "live";
  const overrideLive = manualOverride.live === true || manualOverride.status === "live" || streamState.live === true || streamState.status === "live";
  const live = overrideActive ? overrideLive : baseLive;
  const statusKnown = data.statusKnown !== false && streamState.statusKnown !== false;
  const stale = data.stale === true || streamState.stale === true;
  const source = overrideActive
    ? String(streamState.provider || streamState.source || manualOverride.provider || manualOverride.source || "manual_override")
    : String(streamState.provider || streamState.source || data.source || "twitch_events_stream_state");
  const status = String(streamState.status || streamState.sessionStatus || manualOverride.status || (live ? "live" : "offline"));

  return {
    ok: data.ok !== false && statusKnown && !stale,
    live,
    statusKnown,
    stale,
    source,
    upstreamSource: String(streamState.upstreamSource || data.upstreamSource || ""),
    streamId: String(streamState.streamId || streamSession.streamId || data.streamId || ""),
    startedAt: String(streamState.startedAt || streamSession.startedAt || streamSession.started_at || data.startedAt || ""),
    title: String(streamState.title || streamSession.title || data.title || ""),
    gameName: String(streamState.gameName || streamState.game_name || streamSession.gameName || streamSession.game_name || data.gameName || ""),
    streamSessionId: String(streamState.streamSessionId || streamSession.streamSessionId || streamSession.id || data.streamSessionId || ""),
    streamDayId: String(streamState.streamDayId || streamSession.streamDayId || data.streamDayId || ""),
    sessionStatus: status,
    confidence: String(streamState.confidence || data.confidence || (overrideActive ? "manual" : "")),
    manualOverrideActive: overrideActive,
    manualOverride,
    lastCheckedAt: String(streamState.lastCheckedAt || data.checkedAt || data.lastCheckedAt || ""),
    lastError: String(streamState.lastError || data.lastError || data.error || "")
  };
}

function clearLegacyManualStreamStateForCentralStatus(reason = "central_stream_status") {
  const before = getStreamState();
  const manual = before && before.manual ? before.manual : null;
  if (!manual || manual.configuredActive !== true) {
    return { cleared: false, before };
  }
  const after = clearManualStreamState({ source: "central_stream_status", reason });
  return { cleared: true, before, after };
}

async function refreshAutoStreamStateFromCentralStatus(req, options = {}) {
  const url = `${getRequestBaseUrl(req)}${STREAM_STATUS_API_PATH}`;
  const controlRunner = options.controlRunner === true;
  const sourceKind = String(options.sourceKind || "auto").trim() || "auto";
  const triggerSource = String(options.source || "central_stream_status").trim() || "central_stream_status";

  try {
    const result = await fetchJson(url);
    const parsed = parseCentralStreamStatusPayload(result.data || {});
    if (!result.ok || !parsed.ok) {
      return {
        ok: false,
        skipped: true,
        reason: !result.ok ? "central_stream_status_http_not_ok" : (parsed.stale ? "central_stream_status_stale" : "central_stream_status_unknown"),
        url,
        status: result.status,
        live: parsed.live,
        parsed,
        state: getStreamState(),
        runner: null,
        error: parsed.lastError || (!result.ok ? "central_stream_status_http_not_ok" : "central_stream_status_not_usable")
      };
    }

    const manual = clearLegacyManualStreamStateForCentralStatus("central_stream_status_sync");
    const stateRow = updateAutoStreamState(parsed.live, { source: `${triggerSource}:${parsed.source || "stream_status"}` });
    const runner = controlRunner
      ? controlAutoRunnerForStreamState(parsed.live, {
          source: triggerSource,
          reason: `central_stream_status:${parsed.source || "stream_status"}`,
          sourceKind,
          req
        })
      : null;

    state.streamStatusBinding.lastSyncAt = core.nowIso();
    state.streamStatusBinding.lastLive = parsed.live === true;
    state.streamStatusBinding.lastSource = parsed.source || "stream_status";
    state.streamStatusBinding.lastReason = "central_status_sync";
    state.streamStatusBinding.lastError = "";
    state.streamStatusBinding.lastResult = { ok: true, live: parsed.live, source: parsed.source, manualOverrideActive: parsed.manualOverrideActive === true, manualCleared: manual.cleared };

    return {
      ok: true,
      live: parsed.live,
      url,
      status: result.status,
      parsed,
      state: stateRow,
      previousManual: manual.before ? manual.before.manual : null,
      manualCleared: manual.cleared,
      runner,
      error: ""
    };
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    state.streamStatusBinding.errors += 1;
    state.streamStatusBinding.lastError = error;
    return {
      ok: false,
      skipped: true,
      reason: "central_stream_status_fetch_failed",
      url,
      status: 0,
      live: false,
      parsed: null,
      state: getStreamState(),
      runner: null,
      error
    };
  }
}

function normalizeStreamBusPayload(envelope = {}) {
  const payload = envelope && typeof envelope.payload === "object" ? envelope.payload : {};
  const twitch = payload && typeof payload.twitch === "object" ? payload.twitch : {};
  const actionRaw = String(twitch.action || payload.action || envelope.action || "").trim().toLowerCase();
  const eventKey = String(payload.eventKey || twitch.eventKey || (actionRaw ? `twitch.stream.${actionRaw}` : "") || "").trim();
  const action = actionRaw || (eventKey === "twitch.stream.online" ? "online" : (eventKey === "twitch.stream.offline" ? "offline" : ""));
  const live = action === "online" || eventKey === "twitch.stream.online" || twitch.live === true || payload.live === true;
  return {
    eventKey: eventKey || (live ? "twitch.stream.online" : "twitch.stream.offline"),
    action: live ? "online" : "offline",
    live,
    previousLive: twitch.previousLive === true || payload.previousLive === true,
    reason: String(twitch.reason || payload.reason || "central_stream_event").trim(),
    sourceModule: String(payload.sourceModule || envelope.source?.module || "twitch_events").trim() || "twitch_events",
    busEventId: String(envelope.id || envelope.event?.id || "").trim(),
    streamId: String(twitch.streamId || payload.streamId || "").trim(),
    streamSessionId: String(twitch.streamSessionId || payload.streamSessionId || "").trim(),
    streamDayId: String(twitch.streamDayId || payload.streamDayId || "").trim(),
    sessionStatus: String(twitch.sessionStatus || payload.sessionStatus || payload.status || "").trim(),
    title: String(twitch.title || payload.title || "").trim(),
    gameName: String(twitch.gameName || payload.gameName || "").trim(),
    receivedAt: String(payload.receivedAt || twitch.receivedAt || envelope.timestamp || core.nowIso()).trim()
  };
}

function handleCentralStreamBusEvent(envelope = {}) {
  const binding = state.streamStatusBinding;
  binding.lastEventAt = core.nowIso();
  try {
    const parsed = normalizeStreamBusPayload(envelope);
    const manual = clearLegacyManualStreamStateForCentralStatus(`central_bus:${parsed.eventKey}`);
    const streamState = updateAutoStreamState(parsed.live, { source: parsed.eventKey || "twitch.stream" });
    const runner = controlAutoRunnerForStreamState(parsed.live, {
      source: parsed.eventKey || "twitch.stream",
      reason: parsed.reason || "central_stream_event",
      sourceKind: "stream_state",
      req: null
    });

    binding.lastEventKey = parsed.eventKey;
    binding.lastLive = parsed.live === true;
    binding.lastSource = parsed.sourceModule || "twitch_events";
    binding.lastReason = parsed.reason || "central_stream_event";
    binding.lastError = "";
    binding.lastResult = { ok: true, accepted: true, live: parsed.live, action: parsed.action, manualCleared: manual.cleared, runner };

    logStreamStateEvent(parsed.live ? "central_stream_online_received" : "central_stream_offline_received", {
      source: parsed.eventKey,
      reason: parsed.reason,
      streamState,
      previousStreamState: manual.before || null,
      signal: parsed,
      automation: runner
    });

    return { ok: true, accepted: true, reason: "central_stream_event_accepted", live: parsed.live, action: parsed.action };
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    binding.errors += 1;
    binding.lastError = error;
    binding.lastResult = { ok: false, error };
    return { ok: false, error };
  }
}

function getCommunicationBus() {
  try {
    const communicationBus = require("./communication_bus");
    return communicationBus && typeof communicationBus.getBus === "function" ? communicationBus.getBus() : null;
  } catch (err) {
    state.streamStatusBinding.errors += 1;
    state.streamStatusBinding.lastError = err && err.message ? err.message : String(err);
    return null;
  }
}

function stringValue(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function normalizeTwitchEventUser(user = {}) {
  const source = user && typeof user === "object" ? user : {};
  const login = normalizeLogin(source.login || source.userLogin || source.user_login || source.name || source.displayName || source.display_name || "");
  return {
    id: stringValue(source.id || source.userId || source.user_id),
    login,
    displayName: cleanDisplayName(login, source.displayName || source.display_name || source.name || source.userName || source.user_name || login)
  };
}

function normalizeTwitchEventBonusEnvelope(envelope = {}) {
  const payload = envelope && typeof envelope.payload === "object" ? envelope.payload : {};
  const twitch = payload && typeof payload.twitch === "object" ? payload.twitch : {};
  const eventKey = stringValue(payload.eventKey || twitch.eventKey || envelope.eventKey || envelope.meta?.eventKey);
  const eventType = TWITCH_EVENT_BONUS_MAP[eventKey] || "";
  if (!eventType) return { ok: false, skipped: true, reason: "unsupported_twitch_event", eventKey };

  const baseUser = normalizeTwitchEventUser(twitch.user || {});
  const gifter = normalizeTwitchEventUser(twitch.gifter || {});
  const recipient = normalizeTwitchEventUser(twitch.recipient || {});
  const fromBroadcaster = normalizeTwitchEventUser(twitch.fromBroadcaster || {});

  let actor = baseUser;
  if ((eventType === "gift_sub" || eventType === "gift_bomb") && gifter.login) actor = gifter;
  if (eventType === "raid" && fromBroadcaster.login) actor = fromBroadcaster;

  const tier = normalizeTier(twitch.tier || twitch.subTier || twitch.subscriptionTier || "");
  const quantity = Math.max(1, Number.parseInt(twitch.total || twitch.quantity || twitch.count || 1, 10) || 1);
  const bits = Math.max(0, Number(twitch.bits || 0) || 0);
  const viewers = Math.max(0, Number(twitch.viewers || twitch.viewerCount || 0) || 0);
  const amount = eventType === "cheer" ? bits : (eventType === "raid" ? viewers : 0);
  const explicitEventId = stringValue(
    twitch.eventId || twitch.event_id || twitch.id || twitch.messageId || twitch.message_id ||
    payload.correlationId || payload.eventSubMessageId || payload.eventsubMessageId ||
    envelope.id || envelope.event?.id
  );
  const receivedAt = stringValue(payload.receivedAt || twitch.receivedAt || envelope.timestamp || core.nowIso());
  const eventUid = explicitEventId || `${eventKey}:${actor.login || "unknown"}:${recipient.login || ""}:${tier}:${quantity}:${amount}:${receivedAt}`;

  return {
    ok: true,
    eventKey,
    eventType,
    eventUid,
    login: actor.login,
    displayName: actor.displayName,
    userId: actor.id,
    recipientLogin: recipient.login,
    recipientDisplayName: recipient.displayName,
    recipientUserId: recipient.id,
    tier,
    quantity,
    amount,
    bits,
    viewers,
    provider: "twitch_events",
    sourceType: eventKey,
    raw: payload,
    metadata: {
      source: "communication_bus",
      sourceModule: payload.sourceModule || envelope.source?.module || "twitch_events",
      eventKey,
      busEventId: stringValue(envelope.id || envelope.event?.id),
      receivedAt,
      normalizedAt: stringValue(payload.normalizedAt),
      twitch
    }
  };
}

function handleTwitchEventBonusBusEvent(envelope = {}) {
  const binding = state.twitchEventBonusBinding;
  binding.received += 1;
  binding.lastEventAt = core.nowIso();

  try {
    const parsed = normalizeTwitchEventBonusEnvelope(envelope);
    binding.lastEventKey = parsed.eventKey || "";

    if (!parsed.ok || parsed.skipped) {
      binding.skipped += 1;
      binding.lastResult = parsed;
      return parsed;
    }

    if (!parsed.login) {
      binding.skipped += 1;
      binding.lastLogin = "";
      binding.lastResult = { ok: false, skipped: true, reason: "user_login_required", eventKey: parsed.eventKey };
      return binding.lastResult;
    }

    const result = recordEventBonus(parsed);
    binding.lastLogin = parsed.login;
    binding.lastResult = {
      ok: result && result.ok === true,
      skipped: result && result.skipped === true,
      duplicate: result && result.duplicate === true,
      reason: result && result.reason || "",
      eventKey: parsed.eventKey,
      eventType: parsed.eventType,
      eventUid: parsed.eventUid,
      login: parsed.login
    };

    if (result && result.duplicate === true) binding.duplicates += 1;
    else if (result && result.skipped === true) binding.skipped += 1;
    else binding.processed += 1;

    binding.lastError = "";
    return binding.lastResult;
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    binding.errors += 1;
    binding.lastError = error;
    binding.lastResult = { ok: false, error };
    return binding.lastResult;
  }
}

function installTwitchEventBonusSubscriber() {
  const binding = state.twitchEventBonusBinding;
  if (binding.installed === true) return { ok: true, installed: true, alreadyInstalled: true, subscriptionId: binding.subscriptionId };
  const bus = getCommunicationBus();
  if (!bus || typeof bus.subscribe !== "function") {
    binding.installed = false;
    binding.lastError = "communication_bus_subscribe_unavailable";
    return { ok: false, installed: false, reason: binding.lastError };
  }

  const result = bus.subscribe({
    id: "loyalty:twitch.events:bonus_events",
    module: MODULE_NAME,
    sourceModule: "twitch_events",
    action: "received",
    meta: {
      step: "LC-CORE-POINTS-3A",
      purpose: "loyalty_event_bonus_from_twitch_events",
      sourceModule: "twitch_events",
      consumes: [...TWITCH_EVENT_BONUS_KEYS]
    }
  }, (envelope) => handleTwitchEventBonusBusEvent(envelope));

  if (!result || result.ok !== true) {
    binding.installed = false;
    binding.lastError = String(result && (result.reason || result.error) || "subscription_failed");
    return { ok: false, installed: false, reason: binding.lastError };
  }

  binding.installed = true;
  binding.subscriptionId = result.subscription && result.subscription.id ? String(result.subscription.id) : "loyalty:twitch.events:bonus_events";
  binding.lastError = "";
  binding.lastResult = { ok: true, installed: true, subscriptionId: binding.subscriptionId };
  return { ok: true, installed: true, subscriptionId: binding.subscriptionId };
}

function installCentralStreamStatusSubscriber() {
  const binding = state.streamStatusBinding;
  if (binding.installed === true) return { ok: true, installed: true, alreadyInstalled: true, subscriptionId: binding.subscriptionId };
  const bus = getCommunicationBus();
  if (!bus || typeof bus.subscribe !== "function") {
    binding.installed = false;
    binding.lastError = "communication_bus_subscribe_unavailable";
    return { ok: false, installed: false, reason: binding.lastError };
  }

  const result = bus.subscribe({
    id: "loyalty:twitch.stream:central_status",
    module: MODULE_NAME,
    channel: "twitch.stream",
    action: "",
    capability: "",
    meta: {
      step: "LC-CORE-LIVE-1",
      purpose: "loyalty_runner_central_stream_status",
      sourceModule: "twitch_events",
      consumes: ["twitch.stream.online", "twitch.stream.offline"]
    }
  }, (envelope) => handleCentralStreamBusEvent(envelope));

  if (!result || result.ok !== true) {
    binding.installed = false;
    binding.lastError = String(result && (result.reason || result.error) || "subscription_failed");
    return { ok: false, installed: false, reason: binding.lastError };
  }

  binding.installed = true;
  binding.subscriptionId = result.subscription && result.subscription.id ? String(result.subscription.id) : "loyalty:twitch.stream:central_status";
  binding.lastError = "";
  binding.lastResult = { ok: true, installed: true, subscriptionId: binding.subscriptionId };
  return { ok: true, installed: true, subscriptionId: binding.subscriptionId };
}

function scheduleInitialCentralStreamStatusSync() {
  const timer = setTimeout(() => {
    refreshAutoStreamStateFromCentralStatus(null, {
      controlRunner: true,
      sourceKind: "stream_state",
      source: "central_stream_status_boot_sync"
    }).catch(err => {
      state.streamStatusBinding.errors += 1;
      state.streamStatusBinding.lastError = err && err.message ? err.message : String(err);
    });
  }, 5000);
  if (typeof timer.unref === "function") timer.unref();
}


async function fetchPresenceActiveUsers(req, options = {}) {
  const proto = req && req.protocol ? req.protocol : "http";
  const host = req && typeof req.get === "function" ? req.get("host") : "127.0.0.1:8080";
  const minutes = Math.max(1, Math.min(240, Number(options.minutes || config?.presence?.activeMinutes || 30)));
  const limit = Math.max(1, Math.min(1000, Number(options.limit || config?.presence?.maxUsersPerRun || 250)));
  const includeJoinedOnly = options.includeJoinedOnly === false ? "false" : "true";
  const url = `${proto}://${host}/api/twitch/presence/activity/active?minutes=${encodeURIComponent(minutes)}&limit=${encodeURIComponent(limit)}&includeJoinedOnly=${encodeURIComponent(includeJoinedOnly)}`;
  const result = await fetchJson(url);
  const data = result.data && result.data.data ? result.data.data : result.data;
  const users = Array.isArray(data?.users) ? data.users : (Array.isArray(data?.rows) ? data.rows : []);
  return {
    ok: result.ok,
    status: result.status,
    url,
    minutes,
    limit,
    includeJoinedOnly: includeJoinedOnly === "true",
    users
  };
}

async function runPresenceOnce(req, options = {}) {
  refreshConfigFromSettings();
  const checkAuto = options.checkAuto !== false;
  const force = options.force === true;
  const results = [];
  const errors = [];

  let auto = null;
  if (checkAuto) {
    auto = await refreshAutoStreamStateFromCentralStatus(req);
  }

  const streamState = getStreamState();
  if (!force && (!streamState || !streamState.effective.live)) {
    return {
      ok: true,
      skipped: true,
      reason: "stream_offline",
      streamState,
      auto,
      presence: null,
      count: 0,
      awarded: 0,
      skippedUsers: 0,
      results: []
    };
  }

  const presence = await fetchPresenceActiveUsers(req, {
    minutes: options.minutes || config?.presence?.activeMinutes || 30,
    limit: options.limit || config?.presence?.maxUsersPerRun || 250,
    includeJoinedOnly: options.includeJoinedOnly !== false
  });

  if (!presence.ok) {
    return {
      ok: false,
      skipped: true,
      reason: "presence_fetch_failed",
      streamState,
      auto,
      presence,
      count: 0,
      awarded: 0,
      skippedUsers: 0,
      results: []
    };
  }

  for (const user of presence.users) {
    const login = normalizeLogin(user.login || user.user_login || "");
    if (!login) continue;
    try {
      const heartbeat = recordWatchHeartbeat({
        login,
        displayName: user.displayName || user.display_name || login,
        subscriber: !!user.subscriber,
        subscriberTier: user.subscriberTier || user.subscriber_tier || user.tier || user.subscriptionTier || "",
        source: "twitch_presence_runner",
        userId: user.userId || user.user_id || "",
        metadata: {
          subscriberTier: user.subscriberTier || user.subscriber_tier || "unknown",
          presenceStatus: user.status || "",
          lastSeenAt: user.lastSeenAt || "",
          presentUntil: user.presentUntil || ""
        }
      });
      results.push({
        login,
        displayName: user.displayName || user.display_name || login,
        status: user.status || "",
        subscriber: !!user.subscriber,
        subscriberTier: user.subscriberTier || user.subscriber_tier || "unknown",
        awarded: !!heartbeat.awarded,
        skipped: !!heartbeat.skipped,
        ignored: !!heartbeat.ignored,
        reason: heartbeat.reason || "",
        amount: heartbeat.transaction ? heartbeat.transaction.amount : 0,
        nextRewardAt: heartbeat.nextRewardAt || ""
      });
    } catch (err) {
      errors.push({
        login,
        error: err && err.message ? err.message : String(err)
      });
    }
  }

  const awarded = results.filter(row => row.awarded).length;
  const skippedUsers = results.filter(row => row.skipped || row.ignored).length;

  return {
    ok: errors.length === 0,
    skipped: false,
    reason: "",
    streamState: getStreamState(),
    auto,
    presence: {
      ok: presence.ok,
      count: presence.users.length,
      minutes: presence.minutes,
      includeJoinedOnly: presence.includeJoinedOnly
    },
    count: results.length,
    awarded,
    skippedUsers,
    errors,
    results
  };
}


function registerRoutes(app) {
  app.get("/api/loyalty/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, buildStatus());
  }));

  app.get("/api/loyalty/config", core.asyncRoute(async (req, res) => {
    refreshConfigFromSettings();
    core.sendOk(res, {
      module: MODULE_NAME,
      version: VERSION,
      config: publicConfig(),
      definitions: SETTINGS_DEFINITIONS.map(def => ({ ...def }))
    });
  }));

  app.get("/api/loyalty/settings", core.asyncRoute(async (req, res) => {
    ensureSettingsSeeded(config);
    const listed = settingsHelper.listSettings(SETTINGS_TABLE, { limit: 1000 });
    core.sendOk(res, {
      module: MODULE_NAME,
      table: SETTINGS_TABLE,
      definitions: SETTINGS_DEFINITIONS.map(def => ({ ...def })),
      settings: listed.rows,
      config: publicConfig()
    });
  }));

  app.post("/api/loyalty/settings", core.asyncRoute(async (req, res) => {
    const result = saveSettingsFromInput(req.body || {});
    core.sendOk(res, {
      module: MODULE_NAME,
      ...result
    });
  }));

  app.get("/api/loyalty/users", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listUsers({
      limit: req.query.limit,
      search: req.query.search
    }));
  }));

  app.get("/api/loyalty/users/:login", core.asyncRoute(async (req, res) => {
    const user = getUser(req.params.login);
    if (!user) return core.sendFail(res, "user_not_found", 404, { login: normalizeLogin(req.params.login) });
    core.sendOk(res, { user });
  }));

  app.get("/api/loyalty/balance/:login", core.asyncRoute(async (req, res) => {
    const login = normalizeLogin(req.params.login);
    const summary = getBalanceSummary(login, {
      displayName: req.query.displayName || req.query.display_name || login,
      create: true
    });
    const rank = getAvailableRank(login, { mode: summary.mode, includeZero: false });
    core.sendOk(res, {
      login,
      user: summary.user,
      currencyName: summary.currencyName,
      mode: summary.mode,
      balance: summary.balance,
      reserved: summary.reserved,
      available: summary.available,
      rank
    });
  }));

  app.get("/api/loyalty/available/:login", core.asyncRoute(async (req, res) => {
    const summary = getBalanceSummary(req.params.login, { create: true });
    const rank = getAvailableRank(summary.login, { mode: summary.mode, includeZero: false });
    core.sendOk(res, { summary, rank });
  }));

  app.post("/api/loyalty/points/can-afford", core.asyncRoute(async (req, res) => {
    core.sendOk(res, canAfford(req.body || {}));
  }));

  app.post("/api/loyalty/points/spend", core.asyncRoute(async (req, res) => {
    const result = spendPointsSafely(req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "spend_failed", 409, result);
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/points/award", core.asyncRoute(async (req, res) => {
    const result = awardPoints(req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "award_failed", 400, result);
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/points/reserve", core.asyncRoute(async (req, res) => {
    const result = reservePoints(req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "reserve_failed", 409, result);
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/points/reservations/:reservationUid/release", core.asyncRoute(async (req, res) => {
    const result = releaseReservation(req.params.reservationUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "release_failed", 404, result);
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/points/reservations/:reservationUid/commit", core.asyncRoute(async (req, res) => {
    const result = commitReservation(req.params.reservationUid, req.body || {});
    if (!result.ok) return core.sendFail(res, result.error || "commit_failed", 409, result);
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/points/ranking", core.asyncRoute(async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit || 100) || 100));
    core.sendOk(res, { ok: true, rows: listAvailableRankings({ includeZero: false }).slice(0, limit) });
  }));

  app.get("/api/loyalty/points/commands", core.asyncRoute(async (req, res) => {
    core.sendOk(res, seedCentralCommandDefinitions());
  }));

  app.get("/api/loyalty/texts", core.asyncRoute(async (req, res) => {
    core.sendOk(res, getChatTextEditorPayload());
  }));

  app.post("/api/loyalty/texts", core.asyncRoute(async (req, res) => {
    core.sendOk(res, handleChatTextEditorPayload(req.body || {}));
  }));

  app.post("/api/loyalty/runtime/points-command", core.asyncRoute(async (req, res) => {
    core.sendOk(res, handlePointsCommandRuntime(req.body || {}));
  }));

  app.get("/api/loyalty/transactions", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listTransactions({
      limit: req.query.limit,
      login: req.query.login,
      mode: req.query.mode,
      type: req.query.type
    }));
  }));

  app.post("/api/loyalty/transactions/adjust", core.asyncRoute(async (req, res) => {
    const body = req.body || {};
    const result = recordTransaction({
      login: body.login || body.userLogin || body.user,
      displayName: body.displayName || body.userDisplayName || body.display_name,
      amount: body.amount,
      type: body.type || "admin_adjustment",
      reason: body.reason || "manual_adjustment",
      mode: body.mode || config.mode,
      sourceModule: body.sourceModule || "loyalty",
      sourceProvider: body.sourceProvider || "stream_control_center",
      referenceType: body.referenceType || "manual",
      referenceId: body.referenceId || "",
      metadata: body.metadata || {}
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/test/watch", core.asyncRoute(async (req, res) => {
    const result = recordWatchInterval({
      login: req.query.login || req.query.user,
      displayName: req.query.displayName || req.query.display_name,
      subscriber: req.query.subscriber || req.query.sub || false,
      subscriberTier: req.query.subscriberTier || req.query.subscriber_tier || req.query.tier || req.query.subTier || req.query.subscriptionTier || "",
      mode: req.query.mode || config.mode,
      referenceId: req.query.referenceId || ""
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/watch/heartbeat", core.asyncRoute(async (req, res) => {
    const result = recordWatchHeartbeat({
      login: req.query.login || req.query.user,
      displayName: req.query.displayName || req.query.display_name,
      subscriber: req.query.subscriber || req.query.sub || false,
      subscriberTier: req.query.subscriberTier || req.query.subscriber_tier || req.query.tier || req.query.subTier || req.query.subscriptionTier || "",
      mode: req.query.mode || config.mode,
      source: req.query.source || "manual_get",
      userId: req.query.userId || req.query.user_id || "",
      referenceId: req.query.referenceId || req.query.reference_id || ""
    });
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/watch/heartbeat", core.asyncRoute(async (req, res) => {
    const body = req.body || {};
    const result = recordWatchHeartbeat({
      login: body.login || body.userLogin || body.user,
      displayName: body.displayName || body.userDisplayName || body.display_name,
      subscriber: body.subscriber ?? body.sub ?? body.isSubscriber ?? false,
      subscriberTier: body.subscriberTier || body.subscriber_tier || body.tier || body.subTier || body.subscriptionTier || "",
      mode: body.mode || config.mode,
      source: body.source || body.sourceModule || "manual_post",
      userId: body.userId || body.user_id || "",
      referenceId: body.referenceId || body.reference_id || ""
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/watch/states", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listWatchStates({ limit: req.query.limit }));
  }));

  app.get("/api/loyalty/stream-state", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: getStreamState()
    });
  }));


  app.get("/api/loyalty/presence/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: getStreamState(),
      presenceConfig: { ...config.presence },
      nextStep: "run /api/loyalty/presence/run-once to process currently active Twitch Presence users"
    });
  }));

  app.get("/api/loyalty/presence/run-once", core.asyncRoute(async (req, res) => {
    const result = await runPresenceOnce(req, {
      minutes: core.getParam(req, "minutes", config?.presence?.activeMinutes || 30),
      limit: core.getParam(req, "limit", config?.presence?.maxUsersPerRun || 250),
      includeJoinedOnly: core.boolParam(core.getParam(req, "includeJoinedOnly", config?.presence?.includeJoinedOnly !== false), true),
      checkAuto: core.boolParam(core.getParam(req, "checkAuto", true), true),
      force: core.boolParam(core.getParam(req, "force", false), false)
    });
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/presence/run-once", core.asyncRoute(async (req, res) => {
    const result = await runPresenceOnce(req, {
      minutes: core.getParam(req, "minutes", config?.presence?.activeMinutes || 30),
      limit: core.getParam(req, "limit", config?.presence?.maxUsersPerRun || 250),
      includeJoinedOnly: core.boolParam(core.getParam(req, "includeJoinedOnly", config?.presence?.includeJoinedOnly !== false), true),
      checkAuto: core.boolParam(core.getParam(req, "checkAuto", true), true),
      force: core.boolParam(core.getParam(req, "force", false), false)
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/runner/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, getAutoRunnerStatus());
  }));

  app.get("/api/loyalty/stream-status-binding/status", core.asyncRoute(async (req, res) => {
    core.sendOk(res, { ok: true, binding: { ...state.streamStatusBinding }, streamState: getStreamState(), autoRunner: getAutoRunnerStatus() });
  }));

  app.get("/api/loyalty/stream-status-binding/sync", core.asyncRoute(async (req, res) => {
    const result = await refreshAutoStreamStateFromCentralStatus(req, {
      controlRunner: String(req.query.controlRunner || "false") === "true",
      sourceKind: String(req.query.sourceKind || "auto"),
      source: "central_stream_status_manual_sync"
    });
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/stream-status-binding/sync", core.asyncRoute(async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const result = await refreshAutoStreamStateFromCentralStatus(req, {
      controlRunner: body.controlRunner === true,
      sourceKind: String(body.sourceKind || "auto"),
      source: "central_stream_status_manual_sync"
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/runner/start", core.asyncRoute(async (req, res) => {
    core.sendOk(res, startAutoRunner({ trigger: core.getParam(req, "source", "manual_get"), req }));
  }));

  app.post("/api/loyalty/runner/start", core.asyncRoute(async (req, res) => {
    core.sendOk(res, startAutoRunner({ trigger: core.getParam(req, "source", "manual_post"), req }));
  }));

  app.get("/api/loyalty/runner/stop", core.asyncRoute(async (req, res) => {
    core.sendOk(res, stopAutoRunner({ trigger: core.getParam(req, "source", "manual_get") }));
  }));

  app.post("/api/loyalty/runner/stop", core.asyncRoute(async (req, res) => {
    core.sendOk(res, stopAutoRunner({ trigger: core.getParam(req, "source", "manual_post") }));
  }));

  app.get("/api/loyalty/runner/run-once", core.asyncRoute(async (req, res) => {
    const result = await executeAutoRunnerOnce(req, core.getParam(req, "source", "manual_get"));
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/runner/run-once", core.asyncRoute(async (req, res) => {
    const result = await executeAutoRunnerOnce(req, core.getParam(req, "source", "manual_post"));
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/runner/events", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listRunnerEvents({ limit: req.query.limit }));
  }));

  app.get("/api/loyalty/events", core.asyncRoute(async (req, res) => {
    core.sendOk(res, listLoyaltyEvents({
      limit: req.query.limit,
      login: req.query.login,
      type: req.query.type
    }));
  }));

  app.post("/api/loyalty/events/ingest", core.asyncRoute(async (req, res) => {
    const result = recordEventBonus(req.body || {});
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/events/test/:type", core.asyncRoute(async (req, res) => {
    const type = normalizeEventType(req.params.type);
    const login = req.query.login || req.query.user || "loyaltytest";
    const result = recordEventBonus({
      eventUid: req.query.eventUid || req.query.eventId || uid(`test_${type}`),
      provider: "dashboard_test",
      sourceType: `test.${type}`,
      eventType: type,
      login,
      displayName: req.query.displayName || req.query.display || login,
      recipientLogin: req.query.recipientLogin || req.query.recipient_login || req.query.recipient || req.query.receiverLogin || req.query.receiver_login || req.query.targetLogin || req.query.target_login,
      recipientDisplayName: req.query.recipientDisplayName || req.query.recipient_display_name || req.query.recipientDisplay || req.query.recipient_display || req.query.receiverDisplayName || req.query.receiver_display_name || req.query.targetDisplayName || req.query.target_display_name,
      amount: req.query.amount || req.query.bits || req.query.viewers || req.query.amountEuro || 1,
      bits: req.query.bits,
      viewers: req.query.viewers,
      amountEuro: req.query.amountEuro,
      tier: req.query.tier || "1000",
      quantity: req.query.quantity || req.query.total || 1,
      months: req.query.months || req.query.cumulativeMonths || 1,
      raw: { query: req.query, test: true },
      metadata: { source: "test_endpoint" }
    });
    core.sendOk(res, result);
  }));

  app.get("/api/loyalty/ignored-users", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      count: getIgnoredUsers().length,
      rows: getIgnoredUsers()
    });
  }));

  app.post("/api/loyalty/ignored-users", core.asyncRoute(async (req, res) => {
    const row = setIgnoredUser(req.body && (req.body.login || req.body.user), {
      reason: req.body && req.body.reason,
      enabled: !(req.body && req.body.enabled === false),
      source: "database"
    });
    core.sendOk(res, { row });
  }));

  app.delete("/api/loyalty/ignored-users/:login", core.asyncRoute(async (req, res) => {
    const row = setIgnoredUser(req.params.login, {
      reason: "disabled_by_api",
      enabled: false,
      source: "database"
    });
    core.sendOk(res, { row });
  }));

  app.get("/api/loyalty/routes", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      module: MODULE_NAME,
      version: VERSION,
      routes: [
        "GET /api/loyalty/status",
        "GET /api/loyalty/config",
        "GET /api/loyalty/settings",
        "POST /api/loyalty/settings",
        "GET /api/loyalty/users",
        "GET /api/loyalty/users/:login",
        "GET /api/loyalty/balance/:login",
        "GET /api/loyalty/available/:login",
        "POST /api/loyalty/points/can-afford",
        "POST /api/loyalty/points/spend",
        "POST /api/loyalty/points/award",
        "POST /api/loyalty/points/reserve",
        "POST /api/loyalty/points/reservations/:reservationUid/release",
        "POST /api/loyalty/points/reservations/:reservationUid/commit",
        "GET /api/loyalty/points/ranking",
        "GET /api/loyalty/points/commands",
        "GET /api/loyalty/texts",
        "POST /api/loyalty/texts",
        "POST /api/loyalty/runtime/points-command",
        "GET /api/loyalty/transactions",
        "POST /api/loyalty/transactions/adjust",
        "GET /api/loyalty/test/watch",
        "GET /api/loyalty/watch/heartbeat",
        "POST /api/loyalty/watch/heartbeat",
        "GET /api/loyalty/watch/states",
        "GET /api/loyalty/stream-state",
        "GET /api/loyalty/presence/status",
        "POST /api/loyalty/presence/run-once",
        "GET /api/loyalty/presence/run-once",
        "GET /api/loyalty/runner/status",
        "GET /api/loyalty/stream-status-binding/status",
        "GET /api/loyalty/stream-status-binding/sync",
        "POST /api/loyalty/stream-status-binding/sync",
        "POST /api/loyalty/runner/start",
        "GET /api/loyalty/runner/start",
        "POST /api/loyalty/runner/stop",
        "GET /api/loyalty/runner/stop",
        "POST /api/loyalty/runner/run-once",
        "GET /api/loyalty/runner/run-once",
        "GET /api/loyalty/runner/events",
        "GET /api/loyalty/events",
        "POST /api/loyalty/events/ingest",
        "GET /api/loyalty/events/test/:type",
        "GET /api/loyalty/ignored-users",
        "POST /api/loyalty/ignored-users",
        "DELETE /api/loyalty/ignored-users/:login",
        "GET /api/loyalty/routes"
      ]
    });
  }));
}

function init(ctx = {}) {
  try {
    database.ensureReady(ctx);
    loadConfig();
    ensureSettingsSeeded(config);
    refreshConfigFromSettings();
    ensureSchema();
    ensureReservationSafetySchema();
    ensureLoyaltyEventsTable();
    ensureTextsSeeded();
    seedCentralCommandDefinitions();

    if (ctx && ctx.app) registerRoutes(ctx.app);

    installCentralStreamStatusSubscriber();
    installTwitchEventBonusSubscriber();
    scheduleInitialCentralStreamStatusSync();

    refreshConfigFromSettings();
    if (core.boolParam(config?.autoRunner?.enabledOnBoot, false)) {
      startAutoRunner({ trigger: "boot", req: null });
    }
    recoverAutoRunnerFromStoredStreamStateOnBoot({ trigger: "boot_recovery:stream_state_live" });

    console.log(`[${MODULE_NAME}] loaded v${VERSION} mode=${normalizeMode(config.mode)}`);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    state.schema.ok = false;
    state.schema.lastError = state.lastError;
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
    SETTINGS_DEFINITIONS,
    normalizeLogin,
    calculateWatchAmount,
    getReservedAmount,
    getAvailableBalance,
    getBalanceSummary,
    getAvailableRank,
    listAvailableRankings,
    canAfford,
    spendPointsSafely,
    awardPoints,
    reservePoints,
    releaseReservation,
    commitReservation,
    recordTransaction,
    recordWatchInterval,
    recordWatchHeartbeat,
    recordEventBonus,
    listLoyaltyEvents,
    compensateRecentSubscribeForResubCollision,
    getAutoRunnerStatus,
    startAutoRunner,
    stopAutoRunner,
    recoverAutoRunnerFromStoredStreamStateOnBoot,
    buildStatus,
    normalizeTwitchEventBonusEnvelope,
    handleTwitchEventBonusBusEvent,
    installTwitchEventBonusSubscriber
  }
};
