"use strict";

/**
 * HypeTrain Fachmodul HT2.3
 *
 * Zweck:
 * - vorhandene Twitch-Events aus dem Communication-Bus abonnieren
 * - HypeTrain-Runs, Beiträge und Runtime-Events DB-basiert speichern
 * - Status, Statistik, Config und Textvarianten für ein späteres Dashboard bereitstellen
 * - Discord-/Tagebuch-Nachrichten und Rekord-Sound sicher konfigurierbar produktiv ausführen
 *
 * Wichtig:
 * - Kein eigenes EventSub-System.
 * - Kein Umbau von twitch_events.
 * - Produktive Aktionen bleiben standardmäßig AUS und laufen nur bei expliziter Config-Aktivierung.
 * - Keine Top-Unterstützer-Namen standardmäßig.
 */

const database = require("../core/database");
const core = require("./helpers/helper_core");
const routes = require("./helpers/helper_routes");
const settings = require("./helpers/helper_settings");
const texts = require("./helpers/helper_texts");
const communicationBus = require("./communication_bus");

const MODULE_NAME = "hypetrain";
const MODULE_VERSION = "0.1.2";
const MODULE_BUILD = "STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS";
const MODULE_ID = `module:${MODULE_NAME}`;
const SCHEMA_VERSION = 1;
const SETTINGS_TABLE = "hypetrain_settings";
const TEXTS_MODULE = "hypetrain";

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "community",
  description: "HypeTrain Fachmodul mit DB-Config, Status, Statistik, Textvarianten und sicher schaltbaren Discord-/Tagebuch-/Sound-Endaktionen.",
  routesPrefix: ["/api/hypetrain"],
  bus: {
    registered: false,
    heartbeat: false,
    emits: ["hypetrain.status.updated", "hypetrain.preview.generated", "hypetrain.end_actions.executed"],
    listens: [
      "twitch.hypetrain.started",
      "twitch.hypetrain.progress",
      "twitch.hypetrain.ended",
      "twitch.hypetrain.record_broken",
      "twitch.cheer.received",
      "twitch.sub.received",
      "twitch.resub.received",
      "twitch.subgift.received",
      "twitch.giftbomb.received",
      "twitch.raid.received"
    ]
  },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  privacy: {
    includeTopContributors: false,
    includeContributorNames: false
  },
  display: {
    includeHypeTrainPoints: true,
    includeDuration: true,
    includeCooldown: false,
    includeContributionSummary: true
  },
  record: {
    enabled: true,
    includeRecordInfo: true,
    levelRecordEnabled: true,
    pointsRecordEnabled: true
  },
  contributionSummary: {
    bits: true,
    subs: true,
    resubs: true,
    giftSubs: true
  },
  raidContext: {
    enabled: true,
    windowSeconds: 300
  },
  discord: {
    enabled: false,
    writeOnEnd: false,
    mode: "webhook",
    webhookUrlEnv: "DISCORD_WEBHOOK_HYPETRAIN",
    channelId: "",
    username: "CGN-HypeTrain",
    avatarUrl: ""
  },
  diary: {
    enabled: false,
    writeOnEnd: false,
    systemUsername: "CGN-HypeTrain",
    apiUrl: "http://127.0.0.1:8080/api/tagebuch/entry"
  },
  sound: {
    recordSoundEnabled: false,
    mediaId: 0,
    soundId: "",
    label: "Hype-Train Rekord",
    priority: 1000,
    queueIfBusy: true,
    dropIfBusy: false,
    canInterrupt: false,
    canBeInterrupted: true,
    parallelAllowed: false,
    volume: 85,
    target: "stream",
    outputTarget: "overlay"
  },
  tests: {
    previewOnlyDefault: true,
    productiveSendRequiresConfirm: true
  }
};

const SETTING_DEFINITIONS = [
  { key: "enabled", value: true, valueType: "boolean", category: "Allgemein", label: "HypeTrain-Modul aktiv", description: "Aktiviert das HypeTrain-Fachmodul. EventSub bleibt weiterhin beim bestehenden twitch_events-Modul." },

  { key: "privacy.includeTopContributors", value: false, valueType: "boolean", category: "Privatsphäre", label: "Top-Unterstützer anzeigen", description: "Standard AUS. Zeigt Top-Unterstützer-Blöcke nur nach bewusster Aktivierung." },
  { key: "privacy.includeContributorNames", value: false, valueType: "boolean", category: "Privatsphäre", label: "Namen anzeigen", description: "Standard AUS. Keine Supporter-Namen in Discord/Tagebuch ausgeben, solange dies nicht bewusst aktiviert wurde." },

  { key: "display.includeHypeTrainPoints", value: true, valueType: "boolean", category: "Ausgabe", label: "HypeTrain-Punkte anzeigen", description: "Zeigt Twitch-HypeTrain-Punkte zusätzlich zu Bits/Subs/GiftSubs." },
  { key: "display.includeDuration", value: true, valueType: "boolean", category: "Ausgabe", label: "Dauer anzeigen", description: "Zeigt die Dauer des HypeTrains, wenn Start/Ende bekannt sind." },
  { key: "display.includeCooldown", value: false, valueType: "boolean", category: "Ausgabe", label: "Cooldown anzeigen", description: "Zeigt den Zeitpunkt, ab dem der nächste HypeTrain möglich ist." },
  { key: "display.includeContributionSummary", value: true, valueType: "boolean", category: "Ausgabe", label: "Beiträge zusammenfassen", description: "Zeigt aggregiert Bits, Subs, Resubs und GiftSubs." },

  { key: "record.enabled", value: true, valueType: "boolean", category: "Rekord", label: "Rekorderkennung aktiv", description: "Merkt Rekordinformationen aus twitch_events und eigenen Laufdaten." },
  { key: "record.includeRecordInfo", value: true, valueType: "boolean", category: "Rekord", label: "Rekord deutlich anzeigen", description: "Discord-/Tagebuch-Vorschau enthält eine klare Rekordzeile." },
  { key: "record.levelRecordEnabled", value: true, valueType: "boolean", category: "Rekord", label: "Level-Rekord erkennen", description: "Level-Rekord markieren." },
  { key: "record.pointsRecordEnabled", value: true, valueType: "boolean", category: "Rekord", label: "Punkte-Rekord erkennen", description: "Punkte-/Total-Rekord markieren." },

  { key: "contributionSummary.bits", value: true, valueType: "boolean", category: "Beiträge", label: "Bits anzeigen", description: "Bits/Cheers aggregiert anzeigen." },
  { key: "contributionSummary.subs", value: true, valueType: "boolean", category: "Beiträge", label: "Subs anzeigen", description: "Normale Subs aggregiert anzeigen." },
  { key: "contributionSummary.resubs", value: true, valueType: "boolean", category: "Beiträge", label: "Resubs anzeigen", description: "Resubs aggregiert anzeigen." },
  { key: "contributionSummary.giftSubs", value: true, valueType: "boolean", category: "Beiträge", label: "GiftSubs anzeigen", description: "GiftSubs/Giftbombs aggregiert anzeigen." },

  { key: "raidContext.enabled", value: true, valueType: "boolean", category: "Raid-Kontext", label: "Raid-Kontext aktiv", description: "Wenn kurz vor/während dem HypeTrain ein Raid erkannt wurde, wird ein Raid-Template genutzt." },
  { key: "raidContext.windowSeconds", value: 300, valueType: "number", category: "Raid-Kontext", label: "Raid-Fenster Sekunden", description: "Zeitfenster, in dem ein Raid als HypeTrain-Kontext gilt." },

  { key: "discord.enabled", value: false, valueType: "boolean", category: "Discord", label: "Discord-Ausgabe aktiv", description: "In HT2.1 noch nicht produktiv sendend; Vorschau/Config vorbereitet." },
  { key: "discord.writeOnEnd", value: false, valueType: "boolean", category: "Discord", label: "Bei Ende senden", description: "Später: Discord-Nachricht beim HypeTrain-Ende senden." },
  { key: "discord.mode", value: "webhook", valueType: "string", category: "Discord", label: "Discord-Modus", description: "webhook oder channel. In HT2.1 nur vorbereitet." },
  { key: "discord.webhookUrlEnv", value: "DISCORD_WEBHOOK_HYPETRAIN", valueType: "string", category: "Discord", label: "Webhook ENV-Key", description: "ENV-Key für den Discord-Webhook; Secret selbst nicht in der DB speichern." },
  { key: "discord.channelId", value: "", valueType: "string", category: "Discord", label: "Channel-ID", description: "Optionaler Discord-Channel für Bot-Posting." },
  { key: "discord.username", value: "CGN-HypeTrain", valueType: "string", category: "Discord", label: "Webhook-Name", description: "Anzeigename für Webhook-Posting." },
  { key: "discord.avatarUrl", value: "", valueType: "string", category: "Discord", label: "Webhook-Avatar", description: "Optionaler Avatar für den HypeTrain-Webhook." },

  { key: "diary.enabled", value: false, valueType: "boolean", category: "Tagebuch", label: "Tagebuch aktiv", description: "Tagebuch-Ausgabe vorbereitet. In HT2.1 nicht produktiv umgestellt." },
  { key: "diary.writeOnEnd", value: false, valueType: "boolean", category: "Tagebuch", label: "Bei Ende schreiben", description: "Später: HypeTrain-Ende ins Tagebuch schreiben." },
  { key: "diary.systemUsername", value: "CGN-HypeTrain", valueType: "string", category: "Tagebuch", label: "Systemname", description: "Name für spätere Systemeinträge." },
  { key: "diary.apiUrl", value: "http://127.0.0.1:8080/api/tagebuch/entry", valueType: "string", category: "Tagebuch", label: "Tagebuch API-URL", description: "Interne lokale API-Route für spätere Tagebuch-Systemeinträge." },

  { key: "sound.recordSoundEnabled", value: false, valueType: "boolean", category: "Sound", label: "Rekord-Sound aktiv", description: "Spielt bei Rekord-Ende einen Sound über das bestehende Sound-System ab. Standard AUS." },
  { key: "sound.mediaId", value: 0, valueType: "number", category: "Sound", label: "Media-ID", description: "Media-ID für Rekord-Sound aus dem Media-System." },
  { key: "sound.soundId", value: "", valueType: "string", category: "Sound", label: "Sound-ID", description: "Optionaler Sound-System-Preset-Key, falls keine Media-ID genutzt wird." },
  { key: "sound.priority", value: 1000, valueType: "number", category: "Sound", label: "Priorität", description: "Priorität für Sound-System-Aufruf." },
  { key: "sound.volume", value: 85, valueType: "number", category: "Sound", label: "Lautstärke", description: "Lautstärke für Rekord-Sound." },
  { key: "sound.target", value: "stream", valueType: "string", category: "Sound", label: "Ziel", description: "Sound-System Ziel: stream, discord oder both." },
  { key: "sound.outputTarget", value: "overlay", valueType: "string", category: "Sound", label: "Ausgabeziel", description: "Sound-System Ausgabeziel: overlay, device oder both." },

  { key: "tests.previewOnlyDefault", value: true, valueType: "boolean", category: "Tests", label: "Tests standardmäßig Vorschau", description: "Tests lösen standardmäßig keine produktiven Ausgaben aus." },
  { key: "tests.productiveSendRequiresConfirm", value: true, valueType: "boolean", category: "Tests", label: "Produktives Senden bestätigen", description: "Produktive Tests nur mit ausdrücklicher Bestätigung erlauben." }
];

const DEFAULT_TEXTS = {
  "discord.normal_end": [
    "🚂💜 HypeTrain beendet: Level {level}\n\n{contributionSummary}{pointsLine}{durationLine}{cooldownLine}{recordText}\n\nDie CGN-Rentner haben den Zug wieder sicher gegen den Fahrplan gefahren."
  ],
  "discord.normal_record": [
    "🚂💜 HypeTrain-Rekord erreicht!\n\nDer CGN-HypeTrain ist mit Level {level} eingelaufen.\n{recordText}\n\n{contributionSummary}{pointsLine}{durationLine}{cooldownLine}\nDie Heimleitung meldet: Der Fahrplan wurde offiziell beerdigt."
  ],
  "discord.raid_end": [
    "🚂💜 Raid-HypeTrain beendet!\n\nEin Raid hat den CGN-Zug ordentlich angeschoben: Level {level}.\n\n{contributionSummary}{pointsLine}{durationLine}{cooldownLine}{recordText}\n\nKein neuer Rekord, aber die Rentnerabteilung war hörbar wach."
  ],
  "discord.raid_record": [
    "🚂💜 Raid-HypeTrain-Rekord erreicht!\n\nDer Raid ist eingefahren und hat direkt den Fahrplan gesprengt.\n{recordText}\n\n{contributionSummary}{pointsLine}{durationLine}{cooldownLine}\nDie Heimleitung bestätigt: Das war kein Raid mehr, das war betreutes Entgleisen."
  ],
  "diary.normal_end": [
    "Der HypeTrain ist mit Level {level} im CGN-Altersheim eingelaufen. {recordText}"
  ],
  "diary.normal_record": [
    "Die Heimleitung notiert einen HypeTrain-Rekord: Level {level}, {points} Punkte. {recordText}"
  ],
  "diary.raid_end": [
    "Ein Raid hat den HypeTrain angeschoben. Am Ende stand Level {level}. {recordText}"
  ],
  "diary.raid_record": [
    "Raid plus HypeTrain gleich Fahrplan-Chaos: Neuer Rekord bei Level {level}. {recordText}"
  ],
  "record.none": ["Kein neuer Rekord."],
  "record.level": ["🏆 Neuer Level-Rekord erreicht: Level {level}."],
  "record.points": ["🏆 Neuer Punkte-Rekord erreicht: {points} Punkte."],
  "record.both": ["🏆 Neuer Level- und Punkte-Rekord erreicht: Level {level} · {points} Punkte."],
  "contribution.summary": [
    "Beiträge im Zug:\n💎 Bits: {bits}\n⭐ Subs/Resubs: {subsPlusResubs}\n🎁 GiftSubs: {giftSubs}\n"
  ]
};

const TEXT_CATEGORIES = {
  "discord.normal_end": "discord",
  "discord.normal_record": "discord",
  "discord.raid_end": "discord",
  "discord.raid_record": "discord",
  "diary.normal_end": "diary",
  "diary.normal_record": "diary",
  "diary.raid_end": "diary",
  "diary.raid_record": "diary",
  "record.none": "record",
  "record.level": "record",
  "record.points": "record",
  "record.both": "record",
  "contribution.summary": "contribution"
};

const TEXT_CATEGORY_LABELS = {
  discord: "Discord",
  diary: "Tagebuch",
  record: "Rekord-Zeilen",
  contribution: "Beitragsübersicht",
  errors: "Fehlertexte"
};

let appRef = null;
let busRef = null;
let runtimeConfig = null;
let runtimeTexts = null;

const state = {
  loadedAt: nowIso(),
  updatedAt: nowIso(),
  registeredOnBus: false,
  busAvailable: false,
  subscriptions: [],
  currentTrainId: "",
  lastRaid: null,
  lastEndedRun: null,
  lastPreview: null,
  lastEndActions: null,
  lastError: "",
  counters: {
    started: 0,
    progress: 0,
    ended: 0,
    recordBroken: 0,
    supportEventsSeen: 0,
    supportEventsCaptured: 0,
    raidsSeen: 0,
    previewsGenerated: 0,
    dbWrites: 0,
    dbErrors: 0,
    subscriberErrors: 0,
    endActionsPlanned: 0,
    discordPosted: 0,
    diaryPosted: 0,
    recordSoundRequested: 0,
    endActionErrors: 0
  },
  active: {}
};

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function safeString(value, fallback = "") {
  const clean = String(value ?? "").trim();
  return clean || fallback;
}

function boolValue(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  const s = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on"].includes(s)) return true;
  if (["0", "false", "no", "nein", "off"].includes(s)) return false;
  return fallback;
}

function numberValue(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function jsonClone(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch (_) {
    return fallback;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, extra) {
  const out = jsonClone(base || {}, {});
  if (!isPlainObject(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (isPlainObject(value) && isPlainObject(out[key])) out[key] = deepMerge(out[key], value);
    else out[key] = jsonClone(value, value);
  }
  return out;
}

function setNestedValue(target, dottedKey, value) {
  const parts = String(dottedKey || "").split(".").map(part => part.trim()).filter(Boolean);
  if (!parts.length) return target;
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!isPlainObject(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return target;
}

function getNestedValue(target, dottedKey, fallback = undefined) {
  const parts = String(dottedKey || "").split(".").map(part => part.trim()).filter(Boolean);
  let current = target;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return fallback;
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

function settingDefaultsForHelper() {
  return SETTING_DEFINITIONS.map(item => ({
    key: item.key,
    value: getNestedValue(DEFAULT_CONFIG, item.key, item.value),
    valueType: item.valueType || item.type || "string",
    description: item.description || ""
  }));
}

function applyDbSettings(baseConfig) {
  const merged = deepMerge(DEFAULT_CONFIG, baseConfig || {});
  try {
    settings.seedDefaults(SETTINGS_TABLE, settingDefaultsForHelper());
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) setNestedValue(merged, row.key, row.value);
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = "database_with_code_defaults";
  } catch (err) {
    merged.settingsTable = SETTINGS_TABLE;
    merged.settingsSource = "code_defaults";
    merged.settingsError = err && err.message ? err.message : String(err);
  }
  return merged;
}

function getConfig() {
  if (!runtimeConfig) runtimeConfig = applyDbSettings(DEFAULT_CONFIG);
  return runtimeConfig;
}

function reloadConfig() {
  runtimeConfig = null;
  runtimeTexts = null;
  return getConfig();
}

function textEditorOptions() {
  return {
    categories: TEXT_CATEGORIES,
    categoryLabels: TEXT_CATEGORY_LABELS,
    defaultCategory: "discord"
  };
}

function seedTexts() {
  try {
    if (typeof texts.seedModuleTextVariants === "function") {
      texts.seedModuleTextVariants(TEXTS_MODULE, DEFAULT_TEXTS, textEditorOptions());
    } else if (typeof texts.seedModuleTexts === "function") {
      texts.seedModuleTexts(TEXTS_MODULE, DEFAULT_TEXTS, {});
    }
  } catch (_) {}
}

function getTextRows() {
  seedTexts();
  if (typeof texts.listModuleTextEditor === "function") {
    return texts.listModuleTextEditor(TEXTS_MODULE, DEFAULT_TEXTS, { ...textEditorOptions(), seed: true });
  }
  if (typeof texts.listModuleTexts === "function") return texts.listModuleTexts(TEXTS_MODULE, DEFAULT_TEXTS, { seed: true });
  return { ok: true, module: TEXTS_MODULE, rows: [] };
}

function getRuntimeTexts() {
  if (runtimeTexts) return runtimeTexts;
  seedTexts();
  try {
    if (typeof texts.getModuleTexts === "function") {
      const result = texts.getModuleTexts(TEXTS_MODULE, DEFAULT_TEXTS, { seed: true });
      runtimeTexts = result.texts || DEFAULT_TEXTS;
      return runtimeTexts;
    }
  } catch (_) {}
  runtimeTexts = DEFAULT_TEXTS;
  return runtimeTexts;
}

function pickText(key, vars = {}) {
  let template = "";
  try {
    if (typeof texts.pickModuleText === "function") {
      template = texts.pickModuleText(TEXTS_MODULE, key, getRuntimeTexts(), { ...textEditorOptions(), seed: false }) || "";
    }
  } catch (_) {
    template = "";
  }
  if (!template) {
    const value = getRuntimeTexts()[key] ?? DEFAULT_TEXTS[key] ?? "";
    if (Array.isArray(value)) template = value[0] || "";
    else template = String(value || "");
  }
  return replaceVars(template, vars);
}

function replaceVars(template, vars = {}) {
  return String(template || "").replace(/\{([a-zA-Z0-9_.:-]+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function ensureSchema() {
  database.ensureSchema(MODULE_NAME, SCHEMA_VERSION, (_from, toVersion, db) => {
    if (toVersion !== 1) return;

    db.exec(`
      CREATE TABLE IF NOT EXISTS hypetrain_runs (
        id ${database.primaryKeyAutoIncrementSql()},
        train_id TEXT NOT NULL UNIQUE,
        context_type TEXT NOT NULL DEFAULT 'normal',
        hype_type TEXT NOT NULL DEFAULT '',
        level ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        points_total ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        bits_total ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        subs_total ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        resubs_total ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        gift_subs_total ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        contribution_events ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        record_reached ${database.boolTypeSql()} NOT NULL DEFAULT 0,
        record_level ${database.boolTypeSql()} NOT NULL DEFAULT 0,
        record_points ${database.boolTypeSql()} NOT NULL DEFAULT 0,
        record_types_json ${database.jsonTypeSql()},
        started_at ${database.dateTimeTypeSql()},
        ended_at ${database.dateTimeTypeSql()},
        cooldown_ends_at ${database.dateTimeTypeSql()},
        raid_detected ${database.boolTypeSql()} NOT NULL DEFAULT 0,
        raid_at ${database.dateTimeTypeSql()},
        preview_message ${database.textTypeSql({ long: true })},
        raw_json ${database.jsonTypeSql()},
        created_at ${database.dateTimeTypeSql()} NOT NULL,
        updated_at ${database.dateTimeTypeSql()} NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS hypetrain_contributions (
        id ${database.primaryKeyAutoIncrementSql()},
        train_id TEXT NOT NULL,
        contribution_type TEXT NOT NULL,
        amount ${database.integerTypeSql()} NOT NULL DEFAULT 0,
        tier TEXT NOT NULL DEFAULT '',
        source_event TEXT NOT NULL DEFAULT '',
        event_id TEXT NOT NULL DEFAULT '',
        raw_json ${database.jsonTypeSql()},
        created_at ${database.dateTimeTypeSql()} NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS hypetrain_runtime_events (
        id ${database.primaryKeyAutoIncrementSql()},
        event_type TEXT NOT NULL,
        event_key TEXT NOT NULL DEFAULT '',
        train_id TEXT NOT NULL DEFAULT '',
        payload_json ${database.jsonTypeSql()},
        created_at ${database.dateTimeTypeSql()} NOT NULL
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_hypetrain_runs_ended_at ON hypetrain_runs(ended_at);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_hypetrain_contributions_train_id ON hypetrain_contributions(train_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_hypetrain_runtime_events_created_at ON hypetrain_runtime_events(created_at);`);
  });
}

function logRuntimeEvent(eventType, eventKey, trainId, payload = {}) {
  try {
    database.insert("hypetrain_runtime_events", {
      event_type: safeString(eventType),
      event_key: safeString(eventKey),
      train_id: safeString(trainId),
      payload_json: database.jsonEncode(jsonClone(payload, {})),
      created_at: nowIso()
    });
  } catch (err) {
    state.counters.dbErrors += 1;
    state.lastError = err && err.message ? err.message : String(err);
  }
}

function normalizeHypeTrain(input = {}) {
  const data = isPlainObject(input.hypeTrain) ? input.hypeTrain : input;
  return {
    id: safeString(data.id, `hypetrain_${Date.now()}`),
    level: numberValue(data.level, 0),
    total: numberValue(data.total ?? data.pointsTotal ?? data.points, 0),
    progress: numberValue(data.progress, 0),
    goal: numberValue(data.goal, 0),
    allTimeHighLevel: numberValue(data.allTimeHighLevel ?? data.all_time_high_level, 0),
    allTimeHighTotal: numberValue(data.allTimeHighTotal ?? data.all_time_high_total, 0),
    startedAt: safeString(data.startedAt ?? data.started_at),
    expiresAt: safeString(data.expiresAt ?? data.expires_at),
    endedAt: safeString(data.endedAt ?? data.ended_at),
    cooldownEndsAt: safeString(data.cooldownEndsAt ?? data.cooldown_ends_at),
    type: safeString(data.type),
    isSharedTrain: data.isSharedTrain === true || data.is_shared_train === true,
    topContributions: Array.isArray(data.topContributions) ? data.topContributions : []
  };
}

function normalizeBusPayload(envelope = {}) {
  const payload = isPlainObject(envelope.payload) ? envelope.payload : {};
  const twitch = isPlainObject(payload.twitch) ? payload.twitch : payload;
  const eventKey = safeString(payload.eventKey || twitch.eventKey || `${envelope.channel || ""}.${envelope.action || ""}`);
  return { eventKey, payload, twitch };
}

function initialContributionTotals() {
  return { bits: 0, subs: 0, resubs: 0, giftSubs: 0, events: 0 };
}

function getMemory(trainId) {
  const id = safeString(trainId, `hypetrain_${Date.now()}`);
  if (!state.active[id]) {
    state.active[id] = {
      trainId: id,
      contextType: "normal",
      startedAt: "",
      endedAt: "",
      cooldownEndsAt: "",
      hypeType: "",
      level: 0,
      pointsTotal: 0,
      baselineLevel: 0,
      baselineTotal: 0,
      recordReached: false,
      recordLevel: false,
      recordPoints: false,
      recordTypes: [],
      contributions: initialContributionTotals(),
      lastPayload: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
  }
  return state.active[id];
}

function raidIsInWindow(atIso = nowIso()) {
  const cfg = getConfig();
  if (cfg.raidContext?.enabled === false || !state.lastRaid?.at) return false;
  const windowMs = Math.max(0, numberValue(cfg.raidContext?.windowSeconds, 300)) * 1000;
  const raidMs = Date.parse(state.lastRaid.at);
  const atMs = Date.parse(atIso) || Date.now();
  return Number.isFinite(raidMs) && atMs >= raidMs && atMs - raidMs <= windowMs;
}

function memoryToRunRow(memory, hypeTrain = {}, extra = {}) {
  const now = nowIso();
  const contributions = memory.contributions || initialContributionTotals();
  return {
    train_id: safeString(memory.trainId || hypeTrain.id),
    context_type: safeString(extra.contextType || memory.contextType || "normal"),
    hype_type: safeString(hypeTrain.type || memory.hypeType || ""),
    level: numberValue(hypeTrain.level || memory.level, 0),
    points_total: numberValue(hypeTrain.total || memory.pointsTotal, 0),
    bits_total: numberValue(contributions.bits, 0),
    subs_total: numberValue(contributions.subs, 0),
    resubs_total: numberValue(contributions.resubs, 0),
    gift_subs_total: numberValue(contributions.giftSubs, 0),
    contribution_events: numberValue(contributions.events, 0),
    record_reached: memory.recordReached ? 1 : 0,
    record_level: memory.recordLevel ? 1 : 0,
    record_points: memory.recordPoints ? 1 : 0,
    record_types_json: database.jsonEncode(memory.recordTypes || []),
    started_at: safeString(memory.startedAt || hypeTrain.startedAt) || null,
    ended_at: safeString(memory.endedAt || hypeTrain.endedAt) || null,
    cooldown_ends_at: safeString(memory.cooldownEndsAt || hypeTrain.cooldownEndsAt) || null,
    raid_detected: (memory.contextType === "raid" || extra.raidDetected) ? 1 : 0,
    raid_at: state.lastRaid?.at || null,
    preview_message: safeString(extra.previewMessage || ""),
    raw_json: database.jsonEncode(jsonClone(hypeTrain, {})),
    created_at: safeString(memory.createdAt, now),
    updated_at: now
  };
}

function upsertRun(memory, hypeTrain = {}, extra = {}) {
  const row = memoryToRunRow(memory, hypeTrain, extra);
  database.upsert("hypetrain_runs", row, ["train_id"], [
    "context_type",
    "hype_type",
    "level",
    "points_total",
    "bits_total",
    "subs_total",
    "resubs_total",
    "gift_subs_total",
    "contribution_events",
    "record_reached",
    "record_level",
    "record_points",
    "record_types_json",
    "started_at",
    "ended_at",
    "cooldown_ends_at",
    "raid_detected",
    "raid_at",
    "preview_message",
    "raw_json",
    "updated_at"
  ]);
  state.counters.dbWrites += 1;
  return row;
}

function normalizeSupportContribution(eventKey, twitch = {}) {
  if (eventKey === "twitch.cheer.received") {
    return { type: "bits", amount: numberValue(twitch.bits, 0), tier: "", sourceEvent: eventKey };
  }
  if (eventKey === "twitch.sub.received") {
    return { type: "sub", amount: 1, tier: safeString(twitch.tier), sourceEvent: eventKey };
  }
  if (eventKey === "twitch.resub.received") {
    return { type: "resub", amount: 1, tier: safeString(twitch.tier), sourceEvent: eventKey };
  }
  if (eventKey === "twitch.subgift.received" || eventKey === "twitch.giftbomb.received") {
    return { type: "gift_sub", amount: Math.max(1, numberValue(twitch.total, 1)), tier: safeString(twitch.tier), sourceEvent: eventKey };
  }
  return null;
}

function addContribution(memory, contribution, envelope = {}, twitch = {}) {
  if (!memory || !contribution || contribution.amount <= 0) return { ok: false, reason: "invalid_contribution" };
  const totals = memory.contributions || initialContributionTotals();
  if (contribution.type === "bits") totals.bits += contribution.amount;
  if (contribution.type === "sub") totals.subs += contribution.amount;
  if (contribution.type === "resub") totals.resubs += contribution.amount;
  if (contribution.type === "gift_sub") totals.giftSubs += contribution.amount;
  totals.events += 1;
  memory.contributions = totals;
  memory.updatedAt = nowIso();

  database.insert("hypetrain_contributions", {
    train_id: memory.trainId,
    contribution_type: contribution.type,
    amount: contribution.amount,
    tier: contribution.tier || "",
    source_event: contribution.sourceEvent || "",
    event_id: safeString(envelope.id || twitch.eventSubMessageId || ""),
    raw_json: database.jsonEncode(jsonClone(twitch, {})),
    created_at: nowIso()
  });

  upsertRun(memory, memory.lastPayload?.hypeTrain || {});
  state.counters.dbWrites += 1;
  return { ok: true, contribution, totals };
}

function markRecord(memory, recordTypes = []) {
  const types = Array.from(new Set((recordTypes || []).map(type => {
    const clean = safeString(type).toLowerCase();
    if (clean === "total") return "points";
    return clean;
  }).filter(Boolean)));

  if (!types.length) return;
  memory.recordReached = true;
  if (types.includes("level")) memory.recordLevel = true;
  if (types.includes("points")) memory.recordPoints = true;
  memory.recordTypes = Array.from(new Set([...(memory.recordTypes || []), ...types]));
  memory.updatedAt = nowIso();
}

function detectRecordFromHypeTrain(memory, hypeTrain) {
  const cfg = getConfig();
  if (cfg.record?.enabled === false) return;
  const types = [];
  const baselineLevel = numberValue(memory.baselineLevel || hypeTrain.allTimeHighLevel, 0);
  const baselineTotal = numberValue(memory.baselineTotal || hypeTrain.allTimeHighTotal, 0);
  if (cfg.record?.levelRecordEnabled !== false && baselineLevel > 0 && hypeTrain.level > baselineLevel) types.push("level");
  if (cfg.record?.pointsRecordEnabled !== false && baselineTotal > 0 && hypeTrain.total > baselineTotal) types.push("points");
  markRecord(memory, types);
}

function processHypeTrainBusEvent(envelope, eventKey, twitch) {
  const hypeTrain = normalizeHypeTrain(twitch.hypeTrain || twitch);
  const memory = getMemory(hypeTrain.id);
  memory.lastPayload = { hypeTrain: jsonClone(hypeTrain, {}), twitch: jsonClone(twitch, {}) };
  memory.level = Math.max(numberValue(memory.level, 0), hypeTrain.level);
  memory.pointsTotal = Math.max(numberValue(memory.pointsTotal, 0), hypeTrain.total);
  memory.hypeType = safeString(hypeTrain.type || memory.hypeType);
  memory.cooldownEndsAt = safeString(hypeTrain.cooldownEndsAt || memory.cooldownEndsAt);

  if (eventKey === "twitch.hypetrain.started") {
    state.counters.started += 1;
    state.currentTrainId = hypeTrain.id;
    memory.startedAt = safeString(hypeTrain.startedAt || memory.startedAt || nowIso());
    memory.baselineLevel = numberValue(hypeTrain.allTimeHighLevel || memory.baselineLevel, 0);
    memory.baselineTotal = numberValue(hypeTrain.allTimeHighTotal || memory.baselineTotal, 0);
    if (raidIsInWindow(memory.startedAt)) memory.contextType = "raid";
    upsertRun(memory, hypeTrain);
    logRuntimeEvent("started", eventKey, hypeTrain.id, twitch);
    publishStatus("started");
    return { ok: true, action: "started", trainId: hypeTrain.id };
  }

  if (eventKey === "twitch.hypetrain.progress") {
    state.counters.progress += 1;
    detectRecordFromHypeTrain(memory, hypeTrain);
    upsertRun(memory, hypeTrain);
    logRuntimeEvent("progress", eventKey, hypeTrain.id, twitch);
    publishStatus("progress");
    return { ok: true, action: "progress", trainId: hypeTrain.id };
  }

  if (eventKey === "twitch.hypetrain.record_broken") {
    state.counters.recordBroken += 1;
    const types = Array.isArray(twitch.recordTypes) ? twitch.recordTypes : [];
    markRecord(memory, types);
    upsertRun(memory, hypeTrain);
    logRuntimeEvent("record_broken", eventKey, hypeTrain.id, twitch);
    publishStatus("record_broken");
    return { ok: true, action: "record_broken", trainId: hypeTrain.id, recordTypes: memory.recordTypes };
  }

  if (eventKey === "twitch.hypetrain.ended") {
    state.counters.ended += 1;
    memory.endedAt = safeString(hypeTrain.endedAt || nowIso());
    detectRecordFromHypeTrain(memory, hypeTrain);
    const preview = buildPreviewFromMemory(memory, hypeTrain, "discord");
    upsertRun(memory, hypeTrain, { previewMessage: preview.message });
    state.lastEndedRun = jsonClone(memory, {});
    state.lastPreview = preview;
    executeEndActions(memory, hypeTrain, preview, { dryRun: false, trigger: "hypetrain.ended" }).catch(err => {
      state.counters.endActionErrors += 1;
      state.lastError = err && err.message ? err.message : String(err);
      state.lastEndActions = { ok: false, trigger: "hypetrain.ended", error: state.lastError, at: nowIso() };
      logRuntimeEvent("end_actions_error", eventKey, hypeTrain.id, state.lastEndActions);
      publishStatus("end_actions_error");
    });
    if (state.currentTrainId === hypeTrain.id) state.currentTrainId = "";
    logRuntimeEvent("ended", eventKey, hypeTrain.id, { ...twitch, preview });
    publishStatus("ended");
    return { ok: true, action: "ended", trainId: hypeTrain.id, preview };
  }

  return { ok: true, skipped: true, reason: "unsupported_hypetrain_event", eventKey };
}

function processSupportBusEvent(envelope, eventKey, twitch) {
  state.counters.supportEventsSeen += 1;

  if (eventKey === "twitch.raid.received") {
    state.counters.raidsSeen += 1;
    state.lastRaid = {
      at: safeString(envelope.timestamp, nowIso()),
      viewers: numberValue(twitch.viewers, 0),
      fromBroadcaster: jsonClone(twitch.fromBroadcaster, null)
    };
    if (state.currentTrainId && state.active[state.currentTrainId]) {
      state.active[state.currentTrainId].contextType = "raid";
      upsertRun(state.active[state.currentTrainId], state.active[state.currentTrainId].lastPayload?.hypeTrain || {}, { raidDetected: true });
    }
    logRuntimeEvent("raid", eventKey, state.currentTrainId || "", twitch);
    publishStatus("raid");
    return { ok: true, action: "raid_seen", activeTrainId: state.currentTrainId || "" };
  }

  const contribution = normalizeSupportContribution(eventKey, twitch);
  if (!contribution) return { ok: true, skipped: true, reason: "not_a_supported_contribution", eventKey };
  if (!state.currentTrainId || !state.active[state.currentTrainId]) {
    return { ok: true, skipped: true, reason: "no_active_hypetrain", eventKey };
  }

  const result = addContribution(state.active[state.currentTrainId], contribution, envelope, twitch);
  if (result.ok) state.counters.supportEventsCaptured += 1;
  logRuntimeEvent("support", eventKey, state.currentTrainId, { contribution, twitch });
  publishStatus("support");
  return result;
}

function handleBusEnvelope(envelope = {}) {
  try {
    if (getConfig().enabled === false) return { ok: true, skipped: true, reason: "module_disabled" };
    const { eventKey, twitch } = normalizeBusPayload(envelope);
    if (eventKey.startsWith("twitch.hypetrain.")) return processHypeTrainBusEvent(envelope, eventKey, twitch);
    if (eventKey.startsWith("twitch.cheer.") || eventKey.startsWith("twitch.sub.") || eventKey.startsWith("twitch.resub.") || eventKey.startsWith("twitch.subgift.") || eventKey.startsWith("twitch.giftbomb.") || eventKey.startsWith("twitch.raid.")) {
      return processSupportBusEvent(envelope, eventKey, twitch);
    }
    return { ok: true, skipped: true, reason: "event_not_relevant", eventKey };
  } catch (err) {
    state.counters.subscriberErrors += 1;
    state.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.lastError };
  } finally {
    state.updatedAt = nowIso();
  }
}

function contributionSummaryVars(memory) {
  const c = memory?.contributions || initialContributionTotals();
  return {
    bits: numberValue(c.bits, 0),
    subs: numberValue(c.subs, 0),
    resubs: numberValue(c.resubs, 0),
    subsPlusResubs: numberValue(c.subs, 0) + numberValue(c.resubs, 0),
    giftSubs: numberValue(c.giftSubs, 0),
    contributionEvents: numberValue(c.events, 0)
  };
}

function formatDuration(startedAt, endedAt) {
  const start = Date.parse(startedAt || "");
  const end = Date.parse(endedAt || "");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "";
  const seconds = Math.round((end - start) / 1000);
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min <= 0) return `${sec} Sek.`;
  return `${min} Min. ${sec} Sek.`;
}

function ensureTrailingNewline(value) {
  const text = safeString(value);
  if (!text) return "";
  return text.endsWith("\n") ? text : `${text}\n`;
}

function buildRecordText(memory, hypeTrain) {
  if (!memory?.recordReached) return pickText("record.none", {});
  const vars = {
    level: numberValue(hypeTrain.level || memory.level, 0),
    points: numberValue(hypeTrain.total || memory.pointsTotal, 0)
  };
  if (memory.recordLevel && memory.recordPoints) return pickText("record.both", vars);
  if (memory.recordLevel) return pickText("record.level", vars);
  if (memory.recordPoints) return pickText("record.points", vars);
  return pickText("record.none", vars);
}

function buildPreviewFromMemory(memory, hypeTrain = {}, target = "discord") {
  const cfg = getConfig();
  const cVars = contributionSummaryVars(memory);
  const recordText = cfg.record?.includeRecordInfo === false ? "" : buildRecordText(memory, hypeTrain);
  const duration = formatDuration(memory.startedAt || hypeTrain.startedAt, memory.endedAt || hypeTrain.endedAt);
  const contextType = safeString(memory.contextType, "normal");
  const recordReached = memory.recordReached === true;
  const key = `${target}.${contextType === "raid" ? "raid" : "normal"}_${recordReached ? "record" : "end"}`;

  const contributionSummary = cfg.display?.includeContributionSummary === false
    ? ""
    : ensureTrailingNewline(pickText("contribution.summary", cVars));

  const points = numberValue(hypeTrain.total || memory.pointsTotal, 0);
  const vars = {
    ...cVars,
    level: numberValue(hypeTrain.level || memory.level, 0),
    points,
    context: contextType,
    recordText,
    contributionSummary,
    pointsLine: cfg.display?.includeHypeTrainPoints === false ? "" : `🚂 HypeTrain-Punkte: ${points}\n`,
    duration,
    durationLine: cfg.display?.includeDuration === false || !duration ? "" : `⏱️ Dauer: ${duration}\n`,
    cooldownTime: safeString(hypeTrain.cooldownEndsAt || memory.cooldownEndsAt),
    cooldownLine: cfg.display?.includeCooldown === true && safeString(hypeTrain.cooldownEndsAt || memory.cooldownEndsAt) ? `🕒 Nächster HypeTrain möglich ab: ${safeString(hypeTrain.cooldownEndsAt || memory.cooldownEndsAt)}\n` : ""
  };

  const message = pickText(key, vars).replace(/\n{3,}/g, "\n\n").trim();
  state.counters.previewsGenerated += 1;

  return {
    ok: true,
    target,
    key,
    contextType,
    recordReached,
    recordTypes: jsonClone(memory.recordTypes || [], []),
    message,
    vars,
    generatedAt: nowIso()
  };
}


function publicActionResult(result = {}) {
  const clean = jsonClone(result, {});
  if (clean && clean.discord && clean.discord.webhookUrl) clean.discord.webhookUrl = "***";
  return clean;
}

function buildEndActionPlan(memory, hypeTrain = {}, preview = null) {
  const cfg = getConfig();
  const recordReached = !!(memory && memory.recordReached);
  const message = safeString(preview && preview.message);
  const hasSoundMedia = numberValue(cfg.sound?.mediaId, 0) > 0 || !!safeString(cfg.sound?.soundId);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    trainId: safeString(memory?.trainId || hypeTrain.id),
    recordReached,
    dryRunAvailable: true,
    actions: {
      discord: {
        enabled: cfg.discord?.enabled === true && cfg.discord?.writeOnEnd === true,
        configuredEnabled: cfg.discord?.enabled === true,
        writeOnEnd: cfg.discord?.writeOnEnd === true,
        mode: safeString(cfg.discord?.mode, "webhook"),
        channelIdConfigured: !!safeString(cfg.discord?.channelId),
        webhookEnv: safeString(cfg.discord?.webhookUrlEnv, "DISCORD_WEBHOOK_HYPETRAIN"),
        webhookConfigured: !!process.env[safeString(cfg.discord?.webhookUrlEnv, "DISCORD_WEBHOOK_HYPETRAIN")],
        messageLength: message.length
      },
      diary: {
        enabled: cfg.diary?.enabled === true && cfg.diary?.writeOnEnd === true,
        configuredEnabled: cfg.diary?.enabled === true,
        writeOnEnd: cfg.diary?.writeOnEnd === true,
        systemUsername: safeString(cfg.diary?.systemUsername, "CGN-HypeTrain"),
        apiUrl: safeString(cfg.diary?.apiUrl, "http://127.0.0.1:8080/api/tagebuch/entry")
      },
      recordSound: {
        enabled: recordReached && cfg.sound?.recordSoundEnabled === true && hasSoundMedia,
        configuredEnabled: cfg.sound?.recordSoundEnabled === true,
        mediaId: numberValue(cfg.sound?.mediaId, 0),
        soundId: safeString(cfg.sound?.soundId),
        label: safeString(cfg.sound?.label, "Hype-Train Rekord"),
        priority: numberValue(cfg.sound?.priority, 1000),
        target: safeString(cfg.sound?.target, "stream"),
        outputTarget: safeString(cfg.sound?.outputTarget, "overlay"),
        reason: recordReached ? (hasSoundMedia ? "record_reached" : "missing_media_or_sound_id") : "no_record"
      }
    },
    generatedAt: nowIso()
  };
}

function getDiscordBridge() {
  if (appRef && appRef.locals && appRef.locals.discordBridge) return appRef.locals.discordBridge;
  try {
    const discord = require("./discord");
    if (discord && typeof discord.postMessage === "function") return discord;
  } catch (_) {}
  return null;
}

async function runDiscordEndAction(message, memory, hypeTrain, preview) {
  const cfg = getConfig();
  const bridge = getDiscordBridge();
  if (!bridge || typeof bridge.postMessage !== "function") throw new Error("discord_bridge_unavailable");
  const mode = safeString(cfg.discord?.mode, "webhook").toLowerCase() === "channel" ? "channel" : "webhook";
  const webhookEnv = safeString(cfg.discord?.webhookUrlEnv, "DISCORD_WEBHOOK_HYPETRAIN");
  const payload = {
    mode,
    channelId: safeString(cfg.discord?.channelId),
    webhookUrl: mode === "webhook" ? safeString(process.env[webhookEnv]) : "",
    username: safeString(cfg.discord?.username, "CGN-HypeTrain"),
    avatarUrl: safeString(cfg.discord?.avatarUrl),
    content: message,
    allowedMentions: { parse: [] }
  };
  if (mode === "webhook" && !payload.webhookUrl) throw new Error(`${webhookEnv} fehlt`);
  if (mode === "channel" && !payload.channelId) throw new Error("discord.channelId fehlt");
  const result = await bridge.postMessage(payload);
  state.counters.discordPosted += 1;
  return { ok: true, mode, result };
}

async function runDiaryEndAction(message, memory, hypeTrain, preview) {
  const cfg = getConfig();
  const apiUrl = safeString(cfg.diary?.apiUrl, "http://127.0.0.1:8080/api/tagebuch/entry");
  if (!apiUrl) throw new Error("diary.apiUrl fehlt");
  if (typeof fetch !== "function") throw new Error("fetch_unavailable");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorLogin: "hypetrain",
      authorDisplay: safeString(cfg.diary?.systemUsername, "CGN-HypeTrain"),
      message,
      system: true,
      systemUsername: safeString(cfg.diary?.systemUsername, "CGN-HypeTrain")
    })
  });
  const text = await response.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }
  if (!response.ok || (data && data.ok === false)) throw new Error((data && (data.error || data.message)) || `tagebuch_http_${response.status}`);
  state.counters.diaryPosted += 1;
  return { ok: true, status: response.status, result: data };
}

async function runRecordSoundAction(memory, hypeTrain, preview) {
  const cfg = getConfig();
  if (typeof fetch !== "function") throw new Error("fetch_unavailable");
  const mediaId = numberValue(cfg.sound?.mediaId, 0);
  const soundId = safeString(cfg.sound?.soundId);
  if (!mediaId && !soundId) throw new Error("record_sound_media_missing");
  const body = {
    label: safeString(cfg.sound?.label, "Hype-Train Rekord"),
    category: "alert_critical",
    source: MODULE_NAME,
    requestedBy: MODULE_NAME,
    priority: numberValue(cfg.sound?.priority, 1000),
    volume: numberValue(cfg.sound?.volume, 85),
    target: safeString(cfg.sound?.target, "stream"),
    outputTarget: safeString(cfg.sound?.outputTarget, "overlay"),
    queueIfBusy: cfg.sound?.queueIfBusy !== false,
    dropIfBusy: cfg.sound?.dropIfBusy === true,
    canInterrupt: cfg.sound?.canInterrupt === true,
    canBeInterrupted: cfg.sound?.canBeInterrupted !== false,
    parallelAllowed: cfg.sound?.parallelAllowed === true,
    meta: {
      module: MODULE_NAME,
      trainId: safeString(memory?.trainId || hypeTrain.id),
      recordReached: true,
      recordTypes: jsonClone(memory?.recordTypes || [], [])
    }
  };
  if (mediaId > 0) body.mediaId = mediaId;
  if (soundId) body.soundId = soundId;
  const response = await fetch("http://127.0.0.1:8080/api/sound/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await response.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }
  if (!response.ok || (data && data.ok === false)) throw new Error((data && (data.error || data.message)) || `sound_http_${response.status}`);
  state.counters.recordSoundRequested += 1;
  return { ok: true, status: response.status, result: data };
}

async function executeEndActions(memory, hypeTrain = {}, preview = null, options = {}) {
  const dryRun = options.dryRun === true;
  const plan = buildEndActionPlan(memory, hypeTrain, preview);
  const message = safeString(preview && preview.message);
  const result = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    trainId: plan.trainId,
    trigger: safeString(options.trigger, "manual"),
    dryRun,
    plan,
    actions: {},
    errors: [],
    executedAt: nowIso()
  };
  state.counters.endActionsPlanned += 1;

  const runOne = async (name, enabled, fn) => {
    if (!enabled) {
      result.actions[name] = { ok: true, skipped: true, reason: "disabled_or_not_applicable" };
      return;
    }
    if (dryRun) {
      result.actions[name] = { ok: true, dryRun: true, wouldRun: true };
      return;
    }
    try {
      result.actions[name] = await fn();
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      result.actions[name] = { ok: false, error: message };
      result.errors.push(`${name}: ${message}`);
      state.counters.endActionErrors += 1;
    }
  };

  await runOne("discord", plan.actions.discord.enabled, () => runDiscordEndAction(message, memory, hypeTrain, preview));
  await runOne("diary", plan.actions.diary.enabled, () => runDiaryEndAction(message, memory, hypeTrain, preview));
  await runOne("recordSound", plan.actions.recordSound.enabled, () => runRecordSoundAction(memory, hypeTrain, preview));

  result.ok = result.errors.length === 0;
  state.lastEndActions = publicActionResult(result);
  logRuntimeEvent("end_actions", "hypetrain.end_actions", plan.trainId, state.lastEndActions);
  publishStatus("end_actions");
  return result;
}

function buildSyntheticMemory(input = {}) {
  const trainId = safeString(input.trainId || input.id, `preview_hypetrain_${Date.now()}`);
  const memory = {
    trainId,
    contextType: boolValue(input.raid, false) || input.contextType === "raid" ? "raid" : "normal",
    startedAt: safeString(input.startedAt || new Date(Date.now() - 5 * 60000).toISOString()),
    endedAt: safeString(input.endedAt || nowIso()),
    cooldownEndsAt: safeString(input.cooldownEndsAt || ""),
    hypeType: safeString(input.hypeType || "regular"),
    level: numberValue(input.level, 2),
    pointsTotal: numberValue(input.points || input.total, 2500),
    recordReached: boolValue(input.recordReached ?? input.record, false),
    recordLevel: boolValue(input.recordLevel, boolValue(input.recordReached ?? input.record, false)),
    recordPoints: boolValue(input.recordPoints, boolValue(input.recordReached ?? input.record, false)),
    recordTypes: [],
    contributions: {
      bits: numberValue(input.bits, 1500),
      subs: numberValue(input.subs, 1),
      resubs: numberValue(input.resubs, 1),
      giftSubs: numberValue(input.giftSubs, 1),
      events: 4
    },
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  if (memory.recordLevel) memory.recordTypes.push("level");
  if (memory.recordPoints) memory.recordTypes.push("points");
  return memory;
}

function buildPreview(input = {}) {
  const target = safeString(input.target || "discord");
  const memory = input.memory && isPlainObject(input.memory) ? input.memory : buildSyntheticMemory(input);
  const hypeTrain = {
    id: memory.trainId,
    level: memory.level,
    total: memory.pointsTotal,
    startedAt: memory.startedAt,
    endedAt: memory.endedAt,
    cooldownEndsAt: memory.cooldownEndsAt,
    type: memory.hypeType
  };
  const preview = buildPreviewFromMemory(memory, hypeTrain, target);
  state.lastPreview = preview;
  return preview;
}

function buildStats() {
  let totals = {
    runs: 0,
    records: 0,
    levelRecords: 0,
    pointsRecords: 0,
    highestLevel: 0,
    highestPoints: 0,
    bits: 0,
    subs: 0,
    resubs: 0,
    giftSubs: 0,
    raidRuns: 0
  };
  let recentRuns = [];
  try {
    const row = database.get(`
      SELECT
        COUNT(*) AS runs,
        COALESCE(SUM(record_reached), 0) AS records,
        COALESCE(SUM(record_level), 0) AS levelRecords,
        COALESCE(SUM(record_points), 0) AS pointsRecords,
        COALESCE(MAX(level), 0) AS highestLevel,
        COALESCE(MAX(points_total), 0) AS highestPoints,
        COALESCE(SUM(bits_total), 0) AS bits,
        COALESCE(SUM(subs_total), 0) AS subs,
        COALESCE(SUM(resubs_total), 0) AS resubs,
        COALESCE(SUM(gift_subs_total), 0) AS giftSubs,
        COALESCE(SUM(raid_detected), 0) AS raidRuns
      FROM hypetrain_runs
    `) || {};
    totals = {
      runs: numberValue(row.runs, 0),
      records: numberValue(row.records, 0),
      levelRecords: numberValue(row.levelRecords, 0),
      pointsRecords: numberValue(row.pointsRecords, 0),
      highestLevel: numberValue(row.highestLevel, 0),
      highestPoints: numberValue(row.highestPoints, 0),
      bits: numberValue(row.bits, 0),
      subs: numberValue(row.subs, 0),
      resubs: numberValue(row.resubs, 0),
      giftSubs: numberValue(row.giftSubs, 0),
      raidRuns: numberValue(row.raidRuns, 0)
    };
    recentRuns = database.all(`
      SELECT train_id, context_type, level, points_total, bits_total, subs_total, resubs_total, gift_subs_total, record_reached, record_level, record_points, started_at, ended_at, updated_at
      FROM hypetrain_runs
      ORDER BY COALESCE(ended_at, updated_at) DESC
      LIMIT 20
    `) || [];
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
  }
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, totals, recentRuns, updatedAt: nowIso() };
}

function buildSettingsPayload() {
  const cfg = getConfig();
  let rows = [];
  try {
    settings.seedDefaults(SETTINGS_TABLE, settingDefaultsForHelper());
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    const defs = new Map(SETTING_DEFINITIONS.map(item => [item.key, item]));
    rows = (listed.rows || []).map(row => {
      const def = defs.get(row.key) || {};
      return {
        ...row,
        category: def.category || "Allgemein",
        label: def.label || row.key,
        description: row.description || def.description || "",
        defaultValue: getNestedValue(DEFAULT_CONFIG, row.key, def.value),
        editable: true,
        sensitive: false
      };
    });
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err), config: cfg };
  }
  const categories = [];
  const map = new Map();
  for (const row of rows) {
    const cat = row.category || "Allgemein";
    if (!map.has(cat)) {
      const item = { name: cat, settings: [] };
      map.set(cat, item);
      categories.push(item);
    }
    map.get(cat).settings.push(row);
  }
  return { ok: true, module: MODULE_NAME, table: SETTINGS_TABLE, config: cfg, settings: rows, categories };
}

function updateSettings(payload = {}) {
  const body = isPlainObject(payload) ? payload : {};
  const updates = isPlainObject(body.settings) ? body.settings : body;
  const defs = new Map(SETTING_DEFINITIONS.map(item => [item.key, item]));
  const changed = [];
  for (const [key, value] of Object.entries(updates || {})) {
    const def = defs.get(key);
    if (!def) continue;
    settings.setSetting(SETTINGS_TABLE, key, value, { valueType: def.valueType || "string", description: def.description || "" });
    changed.push(key);
  }
  reloadConfig();
  return { ok: true, module: MODULE_NAME, changed, changedCount: changed.length, config: getConfig(), settings: buildSettingsPayload() };
}

function buildStatus() {
  const cfg = getConfig();
  const stats = buildStats();
  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    schemaVersion: SCHEMA_VERSION,
    settingsTable: SETTINGS_TABLE,
    textsModule: TEXTS_MODULE,
    database: {
      adapter: typeof database.getAdapter === "function" ? database.getAdapter() : "sqlite",
      dialect: typeof database.getDialect === "function" ? database.getDialect() : "sqlite",
      family: typeof database.getDatabaseFamily === "function" ? database.getDatabaseFamily() : "sqlite",
      schemaVersion: typeof database.getSchemaVersion === "function" ? database.getSchemaVersion(MODULE_NAME) : SCHEMA_VERSION
    },
    config: {
      enabled: cfg.enabled !== false,
      discordEnabled: cfg.discord?.enabled === true,
      diaryEnabled: cfg.diary?.enabled === true,
      recordSoundEnabled: cfg.sound?.recordSoundEnabled === true,
      includeTopContributors: cfg.privacy?.includeTopContributors === true,
      includeContributorNames: cfg.privacy?.includeContributorNames === true,
      includeHypeTrainPoints: cfg.display?.includeHypeTrainPoints !== false,
      raidContextEnabled: cfg.raidContext?.enabled !== false
    },
    bus: {
      available: state.busAvailable,
      registered: state.registeredOnBus,
      subscriptions: state.subscriptions
    },
    runtime: {
      loadedAt: state.loadedAt,
      updatedAt: state.updatedAt,
      currentTrainId: state.currentTrainId,
      lastRaid: state.lastRaid,
      lastEndedRun: state.lastEndedRun,
      lastPreview: state.lastPreview,
      lastEndActions: state.lastEndActions,
      counters: state.counters,
      lastError: state.lastError
    },
    stats: stats.totals,
    updatedAt: nowIso()
  };
}

function publishStatus(reason = "updated") {
  try {
    if (!busRef || typeof busRef.publishModuleStatus !== "function") return { ok: false, reason: "bus_unavailable" };
    return busRef.publishModuleStatus(MODULE_NAME, buildStatus(), {
      channel: "hypetrain.status",
      action: safeString(reason, "updated"),
      replayable: true,
      ttlMs: 60000
    });
  } catch (_) {
    return { ok: false, reason: "publish_failed" };
  }
}

function subscribeBus() {
  try {
    busRef = communicationBus && typeof communicationBus.getBus === "function" ? communicationBus.getBus() : null;
    state.busAvailable = !!(busRef && typeof busRef.subscribe === "function");
    if (!state.busAvailable) return { ok: false, reason: "bus_unavailable" };

    if (typeof busRef.registerModule === "function") {
      busRef.registerModule({
        id: MODULE_ID,
        module: MODULE_NAME,
        name: MODULE_NAME,
        version: MODULE_VERSION,
        capabilities: MODULE_META.bus.listens
      });
      state.registeredOnBus = true;
    }

    const subscriptions = [
      ["twitch.hypetrain", "started"],
      ["twitch.hypetrain", "progress"],
      ["twitch.hypetrain", "ended"],
      ["twitch.hypetrain", "record_broken"],
      ["twitch.cheer", "received"],
      ["twitch.sub", "received"],
      ["twitch.resub", "received"],
      ["twitch.subgift", "received"],
      ["twitch.giftbomb", "received"],
      ["twitch.raid", "received"]
    ];

    state.subscriptions = [];
    for (const [channel, action] of subscriptions) {
      const result = busRef.subscribe({
        id: `${MODULE_NAME}:${channel}:${action}`,
        module: MODULE_NAME,
        channel,
        action
      }, handleBusEnvelope);
      state.subscriptions.push(result.subscription || { channel, action, ok: result.ok === true, reason: result.reason || "" });
    }

    publishStatus("registered");
    return { ok: true, subscriptions: state.subscriptions };
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.lastError };
  }
}

function registerRoutes(app) {
  const registered = [];
  const get = (paths, handler) => {
    if (routes && typeof routes.registerGet === "function") registered.push(...routes.registerGet(app, paths, handler));
    else for (const p of Array.isArray(paths) ? paths : [paths]) { app.get(p, handler); registered.push(p); }
  };
  const post = (paths, handler) => {
    if (routes && typeof routes.registerPost === "function") registered.push(...routes.registerPost(app, paths, handler));
    else for (const p of Array.isArray(paths) ? paths : [paths]) { app.post(p, handler); registered.push(p); }
  };

  get(["/api/hypetrain/status", "/hypetrain/status"], (_req, res) => res.json(buildStatus()));
  get(["/api/hypetrain/config", "/hypetrain/config"], (_req, res) => res.json(buildSettingsPayload()));
  post(["/api/hypetrain/config", "/hypetrain/config"], (req, res) => {
    try { res.json(updateSettings(req.body || {})); }
    catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) }); }
  });

  get(["/api/hypetrain/texts", "/hypetrain/texts"], (_req, res) => res.json({ ok: true, module: MODULE_NAME, texts: getTextRows() }));
  post(["/api/hypetrain/texts", "/hypetrain/texts"], (req, res) => {
    try {
      if (typeof texts.handleModuleTextEditorPayload !== "function") throw new Error("text_editor_helper_unavailable");
      const result = texts.handleModuleTextEditorPayload(TEXTS_MODULE, req.body || {}, textEditorOptions());
      runtimeTexts = null;
      res.json({ ok: true, module: MODULE_NAME, ...result, texts: getTextRows() });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });

  get(["/api/hypetrain/stats", "/hypetrain/stats"], (_req, res) => res.json(buildStats()));

  const previewHandler = (req, res) => {
    try {
      const input = { ...(req.query || {}), ...(req.body || {}) };
      const preview = buildPreview(input);
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, preview });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  };
  get(["/api/hypetrain/preview", "/hypetrain/preview"], previewHandler);
  post(["/api/hypetrain/preview", "/hypetrain/preview"], previewHandler);

  post(["/api/hypetrain/test/synthetic", "/hypetrain/test/synthetic"], (req, res) => {
    try {
      const input = { ...(req.query || {}), ...(req.body || {}) };
      if (safeString(input.confirm) !== "1") {
        res.status(400).json({ ok: false, module: MODULE_NAME, error: "confirm_required", hint: "POST /api/hypetrain/test/synthetic?confirm=1", productiveActions: false });
        return;
      }
      const memory = buildSyntheticMemory(input);
      state.active[memory.trainId] = memory;
      state.currentTrainId = "";
      const preview = buildPreview({ memory, target: input.target || "discord" });
      upsertRun(memory, { id: memory.trainId, level: memory.level, total: memory.pointsTotal, startedAt: memory.startedAt, endedAt: memory.endedAt, cooldownEndsAt: memory.cooldownEndsAt, type: memory.hypeType }, { previewMessage: preview.message, contextType: memory.contextType });
      logRuntimeEvent("synthetic_preview", "hypetrain.synthetic.preview", memory.trainId, { input, preview });
      res.json({ ok: true, module: MODULE_NAME, productiveActions: false, preview, status: buildStatus() });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });


  post(["/api/hypetrain/test/end-actions", "/hypetrain/test/end-actions"], async (req, res) => {
    try {
      const input = { ...(req.query || {}), ...(req.body || {}) };
      if (safeString(input.confirm) !== "1") {
        res.status(400).json({ ok: false, module: MODULE_NAME, error: "confirm_required", hint: "POST /api/hypetrain/test/end-actions?confirm=1", productiveActions: false });
        return;
      }
      const productive = boolValue(input.productive, false) || boolValue(input.dryRun, true) === false;
      if (productive && safeString(input.confirmProductive) !== "HYPETRAIN_PRODUCTIVE_ACTIONS") {
        res.status(400).json({ ok: false, module: MODULE_NAME, error: "confirm_productive_required", hint: "Set confirmProductive=HYPETRAIN_PRODUCTIVE_ACTIONS to run real Discord/Tagebuch/Sound actions.", productiveActions: false });
        return;
      }
      const memory = buildSyntheticMemory(input);
      const hypeTrain = { id: memory.trainId, level: memory.level, total: memory.pointsTotal, startedAt: memory.startedAt, endedAt: memory.endedAt, cooldownEndsAt: memory.cooldownEndsAt, type: memory.hypeType };
      const preview = buildPreviewFromMemory(memory, hypeTrain, input.target || "discord");
      const result = await executeEndActions(memory, hypeTrain, preview, { dryRun: !productive, trigger: productive ? "manual_productive_test" : "manual_dry_run_test" });
      res.status(result.ok ? 200 : 500).json({ ok: result.ok, module: MODULE_NAME, productiveActions: productive, preview, result, status: buildStatus() });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err) });
    }
  });

  get(["/api/hypetrain/routes", "/hypetrain/routes"], (_req, res) => {
    res.json({
      ok: true,
      module: MODULE_NAME,
      routes: [
        "GET /api/hypetrain/status",
        "GET /api/hypetrain/config",
        "POST /api/hypetrain/config",
        "GET /api/hypetrain/texts",
        "POST /api/hypetrain/texts",
        "GET /api/hypetrain/stats",
        "GET|POST /api/hypetrain/preview",
        "POST /api/hypetrain/test/synthetic?confirm=1",
        "POST /api/hypetrain/test/end-actions?confirm=1",
        "GET /api/hypetrain/routes"
      ],
      registered
    });
  });

  return registered;
}

function init(ctx = {}) {
  appRef = ctx.app || null;
  ensureSchema();
  getConfig();
  seedTexts();
  const busResult = subscribeBus();
  const registeredRoutes = appRef ? registerRoutes(appRef) : [];
  state.updatedAt = nowIso();
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, bus: busResult, routes: registeredRoutes };
}

module.exports = {
  MODULE_META,
  MODULE_NAME,
  MODULE_VERSION,
  MODULE_BUILD,
  init,
  buildStatus,
  buildStats,
  buildPreview,
  handleBusEnvelope
};
