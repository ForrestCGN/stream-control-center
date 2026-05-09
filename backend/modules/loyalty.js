"use strict";

/**
 * Loyalty / Kekskrümel Core
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
const VERSION = "0.1.3";
const CONFIG_FILE = "loyalty.json";
const SCHEMA_MODULE = "loyalty";
const SCHEMA_VERSION = 3;
const SETTINGS_TABLE = "loyalty_settings";

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
    subscriberMultiplier: 3
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
    subscribe: { enabled: true, amount: 50 },
    resub: { enabled: false, amount: 50 },
    giftSubGiver: { enabled: false, amount: 50 },
    giftSubReceiver: { enabled: false, amount: 25 },
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
    maxUsersPerRun: 250
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
  ]
};

const SETTINGS_DEFINITIONS = [
  { key: "enabled", path: "enabled", valueType: "boolean", description: "Loyalty-System aktivieren/deaktivieren." },
  { key: "mode", path: "mode", valueType: "string", description: "Loyalty-Modus: off, shadow oder live." },
  { key: "currency.name", path: "currency.name", valueType: "string", description: "Name der Währung, z. B. Kekskrümel." },

  { key: "watch.enabled", path: "watch.enabled", valueType: "boolean", description: "Watch-Punkte grundsätzlich aktivieren." },
  { key: "watch.amount", path: "watch.amount", valueType: "number", description: "Punkte pro Watch-Intervall." },
  { key: "watch.intervalMinutes", path: "watch.intervalMinutes", valueType: "number", description: "Watch-Intervall in Minuten." },
  { key: "watch.subscriberMultiplier", path: "watch.subscriberMultiplier", valueType: "number", description: "Multiplikator für Subscriber im Watch-Intervall." },

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
  { key: "bonuses.resub.enabled", path: "bonuses.resub.enabled", valueType: "boolean", description: "Resub-Bonus aktivieren." },
  { key: "bonuses.resub.amount", path: "bonuses.resub.amount", valueType: "number", description: "Resub-Bonus in Punkten." },
  { key: "bonuses.giftSubGiver.enabled", path: "bonuses.giftSubGiver.enabled", valueType: "boolean", description: "Gift-Sub-Gifter-Bonus aktivieren." },
  { key: "bonuses.giftSubGiver.amount", path: "bonuses.giftSubGiver.amount", valueType: "number", description: "Gift-Sub-Gifter-Bonus in Punkten." },
  { key: "bonuses.giftSubReceiver.enabled", path: "bonuses.giftSubReceiver.enabled", valueType: "boolean", description: "Gift-Sub-Empfänger-Bonus aktivieren." },
  { key: "bonuses.giftSubReceiver.amount", path: "bonuses.giftSubReceiver.amount", valueType: "number", description: "Gift-Sub-Empfänger-Bonus in Punkten." },
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
  { key: "autoRunner.maxUsersPerRun", path: "autoRunner.maxUsersPerRun", valueType: "number", description: "Maximale Presence-User pro Auto Runner Lauf." }
];

const TEXT_CATEGORIES = {
  balance_reply: "chat",
  balance_shadow_reply: "chat",
  adjusted_reply: "chat",
  ignored_user_reply: "chat",
  error_user_required: "errors",
  error_invalid_amount: "errors"
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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

function calculateWatchAmount(isSubscriber = false) {
  const amount = Number(config.watch && config.watch.amount || 0);
  const multiplier = isSubscriber ? Number(config.watch && config.watch.subscriberMultiplier || 1) : 1;
  const result = Math.floor(amount * multiplier);
  return Number.isFinite(result) ? result : 0;
}

function recordWatchInterval(input = {}) {
  refreshConfigFromSettings();
  if (!config.enabled || !config.watch.enabled || !config.features.watchEarningEnabled) {
    return { ok: false, skipped: true, reason: "watch_earning_disabled" };
  }

  const subscriber = input.subscriber === true || input.isSubscriber === true || ["1", "true", "yes", "ja", "on"].includes(String(input.subscriber || input.isSubscriber || "").toLowerCase());
  const amount = calculateWatchAmount(subscriber);

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
      intervalMinutes: Number(config.watch.intervalMinutes || 10),
      baseAmount: Number(config.watch.amount || 0),
      subscriberMultiplier: Number(config.watch.subscriberMultiplier || 1)
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

function shouldRewardWatch(stateRow, nowIso, intervalMinutes) {
  if (!stateRow || !stateRow.lastRewardAt) return true;
  const last = Date.parse(stateRow.lastRewardAt);
  const nowMs = Date.parse(nowIso);
  if (!Number.isFinite(last) || !Number.isFinite(nowMs)) return true;
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
  const watchStateBeforeReward = upsertWatchState({
    login,
    displayName: input.displayName || input.userDisplayName || input.display_name,
    subscriber: input.subscriber ?? input.isSubscriber ?? input.sub,
    source: input.source || input.sourceModule || "manual",
    mode,
    now,
    metadata: {
      userId: input.userId || input.user_id || "",
      rawSource: input.source || ""
    }
  });

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


function ensureRunnerEventsTable() {
  database.run(`
    CREATE TABLE IF NOT EXISTS loyalty_runner_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  if (autoRunnerState.enabled && autoRunnerState.timer) {
    return { ok: true, alreadyRunning: true, status: getAutoRunnerStatus() };
  }

  autoRunnerState.enabled = true;
  autoRunnerState.trigger = String(options.trigger || "manual_start");
  autoRunnerState.startedAt = core.nowIso();
  autoRunnerState.stoppedAt = "";
  autoRunnerState.lastError = "";
  scheduleAutoRunner(options.req || null);

  const payload = { ok: true, started: true, trigger: autoRunnerState.trigger, status: getAutoRunnerStatus() };
  logRunnerEvent("runner_started", payload);
  return payload;
}

function stopAutoRunner(options = {}) {
  if (autoRunnerState.timer) {
    clearTimeout(autoRunnerState.timer);
    autoRunnerState.timer = null;
  }

  autoRunnerState.enabled = false;
  autoRunnerState.running = false;
  autoRunnerState.trigger = String(options.trigger || "manual_stop");
  autoRunnerState.stoppedAt = core.nowIso();

  const payload = { ok: true, stopped: true, trigger: autoRunnerState.trigger, status: getAutoRunnerStatus() };
  logRunnerEvent("runner_stopped", payload);
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
    watch: { ...config.watch },
    autoRunner: getAutoRunnerStatus()
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

function setManualStreamState(live, options = {}) {
  ensureSchema();
  ensureStreamStateRow();
  const now = core.nowIso();
  database.run(`
    UPDATE loyalty_stream_state
    SET manual_live = :manualLive,
        manual_active = 1,
        manual_source = :manualSource,
        manual_reason = :manualReason,
        manual_updated_at = :manualUpdatedAt,
        updated_at = :updatedAt
    WHERE key = :key
  `, {
    key: streamStateKey(),
    manualLive: live ? 1 : 0,
    manualSource: String(options.source || "manual").trim() || "manual",
    manualReason: String(options.reason || "").trim(),
    manualUpdatedAt: now,
    updatedAt: now
  });
  return getStreamState();
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

function parseExternalLivePayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (payload.is_live === true || payload.isLive === true || payload.live === true) return true;
  if (Array.isArray(payload.data)) return payload.data.length > 0;
  if (payload.data && typeof payload.data === "object" && Array.isArray(payload.data.data)) return payload.data.data.length > 0;
  return false;
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

async function refreshAutoStreamStateFromTwitch(req) {
  const login = normalizeLogin(config?.streamState?.broadcasterLogin || "forrestcgn") || "forrestcgn";
  const proto = req && req.protocol ? req.protocol : "http";
  const host = req && typeof req.get === "function" ? req.get("host") : "127.0.0.1:8080";
  const url = `${proto}://${host}/api/twitch/stream?login=${encodeURIComponent(login)}`;
  try {
    const result = await fetchJson(url);
    const live = result.ok && parseExternalLivePayload(result.data);
    const stateRow = updateAutoStreamState(live, { source: result.ok ? "twitch_stream_api" : "twitch_stream_api_error" });
    return {
      ok: result.ok,
      live,
      url,
      status: result.status,
      state: stateRow,
      error: result.ok ? "" : "twitch_stream_api_not_ok"
    };
  } catch (err) {
    const stateRow = updateAutoStreamState(false, { source: "twitch_stream_api_error" });
    return {
      ok: false,
      live: false,
      url,
      status: 0,
      state: stateRow,
      error: err && err.message ? err.message : String(err)
    };
  }
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
    auto = await refreshAutoStreamStateFromTwitch(req);
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
    const user = getUser(login) || ensureUser(login, req.query.displayName || req.query.display_name || login);
    core.sendOk(res, {
      login,
      user,
      currencyName: config.currency && config.currency.name || "Kekskrümel",
      mode: normalizeMode(config.mode)
    });
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

  app.get("/api/loyalty/stream-state/start", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: setManualStreamState(true, {
        source: core.getParam(req, "source", "manual_get"),
        reason: core.getParam(req, "reason", "")
      })
    });
  }));

  app.post("/api/loyalty/stream-state/start", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: setManualStreamState(true, {
        source: core.getParam(req, "source", "manual_post"),
        reason: core.getParam(req, "reason", "")
      })
    });
  }));

  app.get("/api/loyalty/stream-state/stop", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: setManualStreamState(false, {
        source: core.getParam(req, "source", "manual_get"),
        reason: core.getParam(req, "reason", "")
      })
    });
  }));

  app.post("/api/loyalty/stream-state/stop", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: setManualStreamState(false, {
        source: core.getParam(req, "source", "manual_post"),
        reason: core.getParam(req, "reason", "")
      })
    });
  }));

  app.get("/api/loyalty/stream-state/clear-override", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: clearManualStreamState({
        source: core.getParam(req, "source", "manual_get"),
        reason: core.getParam(req, "reason", "clear_override")
      })
    });
  }));

  app.post("/api/loyalty/stream-state/clear-override", core.asyncRoute(async (req, res) => {
    core.sendOk(res, {
      streamState: clearManualStreamState({
        source: core.getParam(req, "source", "manual_post"),
        reason: core.getParam(req, "reason", "clear_override")
      })
    });
  }));

  app.get("/api/loyalty/stream-state/refresh-auto", core.asyncRoute(async (req, res) => {
    const result = await refreshAutoStreamStateFromTwitch(req);
    core.sendOk(res, result);
  }));

  app.post("/api/loyalty/stream-state/refresh-auto", core.asyncRoute(async (req, res) => {
    const result = await refreshAutoStreamStateFromTwitch(req);
    core.sendOk(res, result);
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
        "GET /api/loyalty/transactions",
        "POST /api/loyalty/transactions/adjust",
        "GET /api/loyalty/test/watch",
        "GET /api/loyalty/watch/heartbeat",
        "POST /api/loyalty/watch/heartbeat",
        "GET /api/loyalty/watch/states",
        "GET /api/loyalty/stream-state",
        "POST /api/loyalty/stream-state/start",
        "GET /api/loyalty/stream-state/start",
        "POST /api/loyalty/stream-state/stop",
        "GET /api/loyalty/stream-state/stop",
        "POST /api/loyalty/stream-state/clear-override",
        "GET /api/loyalty/stream-state/clear-override",
        "POST /api/loyalty/stream-state/refresh-auto",
        "GET /api/loyalty/stream-state/refresh-auto",
        "GET /api/loyalty/presence/status",
        "POST /api/loyalty/presence/run-once",
        "GET /api/loyalty/presence/run-once",
        "GET /api/loyalty/runner/status",
        "POST /api/loyalty/runner/start",
        "GET /api/loyalty/runner/start",
        "POST /api/loyalty/runner/stop",
        "GET /api/loyalty/runner/stop",
        "POST /api/loyalty/runner/run-once",
        "GET /api/loyalty/runner/run-once",
        "GET /api/loyalty/runner/events",
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
    ensureTextsSeeded();

    if (ctx && ctx.app) registerRoutes(ctx.app);

    refreshConfigFromSettings();
    if (core.boolParam(config?.autoRunner?.enabledOnBoot, false)) {
      startAutoRunner({ trigger: "boot", req: null });
    }

    console.log(`[${MODULE_NAME}] loaded v${VERSION} mode=${normalizeMode(config.mode)}`);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    state.schema.ok = false;
    state.schema.lastError = state.lastError;
    console.error(`[${MODULE_NAME}] failed: ${state.lastError}`);
  }
}

module.exports = {
  init,
  _private: {
    DEFAULT_CONFIG,
    SETTINGS_DEFINITIONS,
    normalizeLogin,
    calculateWatchAmount,
    recordTransaction,
    recordWatchInterval,
    recordWatchHeartbeat,
    getAutoRunnerStatus,
    startAutoRunner,
    stopAutoRunner,
    buildStatus
  }
};
