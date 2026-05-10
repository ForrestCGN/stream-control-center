/**
 * ForrestCGN TTS System V2
 * - One chat command: !tts <text|subcommand>
 * - Google de-DE-Wavenet-H for Broadcaster/Mods/VIPs
 * - Piper/Thorsten for Subscribers
 * - Config/messages/state/bans outside htdocs: D:\Streaming\stramAssets\config\
 * - OBS browser overlay playback through WebSocket
 */

const fs = require("fs");
const path = require("path");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const media = require("./helpers/helper_media");
const settingsHelper = require("./helpers/helper_settings");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");
const crypto = require("crypto");
const { spawn } = require("child_process");
const http = require("http");
const https = require("https");

let textToSpeech = null;
try {
  textToSpeech = require("@google-cloud/text-to-speech");
} catch (_) {
  textToSpeech = null;
}

function init(ctx) {
  const { app, broadcastWS } = ctx;

  const MODULE_DIR = __dirname;
  const BACKEND_DIR = path.resolve(MODULE_DIR, "..");
  const ROOT_DIR = path.resolve(BACKEND_DIR, "..");
  const HTDOCS_DIR = path.join(ROOT_DIR, "htdocs");
  const CONFIG_DIR = path.join(ROOT_DIR, "config");
  const GENERATED_DIR = path.join(HTDOCS_DIR, "assets", "sounds", "tts", "generated");
  const GENERATED_PUBLIC_URL = "/assets/sounds/tts/generated";
  const GENERATED_SOUND_SYSTEM_PREFIX = "tts/generated";

  const MODULE_NAME = "tts_system";
  const TTS_SCHEMA_MODULE = "tts_system";
  const TTS_SCHEMA_VERSION = 1;
  const TTS_SETTINGS_TABLE = "tts_settings";
  const TTS_TEXTS_MODULE = "tts";
  const TTS_EVENTS_TABLE = "tts_events";
  const TTS_USAGE_TABLE = "tts_usage_daily";

  const CONFIG_FILE = path.join(CONFIG_DIR, "tts_config.json");
  const MESSAGES_FILE = path.join(CONFIG_DIR, "tts_messages.json");
  const BANS_FILE = path.join(CONFIG_DIR, "tts_bans.json");
  const STATE_FILE = path.join(CONFIG_DIR, "tts_state.json");

  const RESERVED_COMMANDS = new Set([
    "on", "off", "status", "debug", "stop", "clear", "mute", "unmute", "ban", "unban", "list", "help", "reload"
  ]);

  const DEFAULT_CONFIG = {
    enabled: true,
    command: "!tts",
    defaultVoice: "google_wavenet_h",
    fallbackVoice: "piper_thorsten",
    rejectWhenFallbackUnavailable: true,
    limits: {
      googleDailyCharacterLimit: 15000,
      googleMonthlyCharacterLimit: 300000
    },
    queue: {
      maxSize: 8,
      gapAfterMs: 350,
      deleteGeneratedAfterHours: 6
    },
    text: {
      removeUrls: true,
      blockEmpty: true,
      maxRepeatedChar: 5
    },
    voices: {
      google_wavenet_h: {
        enabled: true,
        engine: "google",
        label: "Google Deutsch Wavenet H",
        keyFile: path.join(ROOT_DIR, "config", "google_tts_service_account.json"),
        languageCode: "de-DE",
        name: "de-DE-Wavenet-H",
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0
      },
      piper_thorsten: {
        enabled: true,
        engine: "piper",
        label: "Piper Thorsten High",
        exe: path.join(ROOT_DIR, "tools", "piper", "piper.exe"),
        model: path.join(ROOT_DIR, "tools", "piper", "voice", "de_DE-thorsten-high.onnx"),
        config: path.join(ROOT_DIR, "tools", "piper", "voice", "de_DE-thorsten-high.onnx.json"),
        audioEncoding: "WAV"
      }
    },
    roles: {
      broadcaster: { enabled: true, voice: "google_wavenet_h", maxLength: 5000, userCooldownSeconds: 0, globalCooldownSeconds: 0, priority: 100 },
      moderator: { enabled: true, voice: "google_wavenet_h", maxLength: 400, userCooldownSeconds: 30, globalCooldownSeconds: 0, priority: 90 },
      vip: { enabled: true, voice: "google_wavenet_h", maxLength: 320, userCooldownSeconds: 60, globalCooldownSeconds: 10, priority: 70 },
      subscriber: { enabled: true, voice: "piper_thorsten", maxLength: 260, userCooldownSeconds: 120, globalCooldownSeconds: 15, priority: 40 },
      viewer: { enabled: false, voice: "piper_thorsten", maxLength: 120, userCooldownSeconds: 900, globalCooldownSeconds: 120, priority: 0 }
    },
    permissions: {
      moderatorCommands: ["on", "off", "status", "stop", "clear", "mute", "unmute", "list", "help", "reload"],
      broadcasterOnlyCommands: ["ban", "unban"],
      banManagers: []
    }
  };

  const DEFAULT_MESSAGES = {
    ttsQueued: "🎙️ Durchsage aufgenommen. Die Heimleitung reicht sie gleich weiter.",
    ttsDisabled: "🔇 Die Sprechanlage ist aktuell abgeschaltet.",
    notAllowed: "🚫 Diese Sprechanlage ist nur für Mods, VIPs und Subs freigegeben.",
    cooldown: "⏳ Langsam, junger Hüpfer. Du darfst in {seconds} Sekunden wieder an die Sprechanlage.",
    tooLong: "📏 Die Durchsage ist zu lang. Maximal erlaubt: {maxLength} Zeichen.",
    queueFull: "🧓 Die Sprechanlage ist gerade überfüllt. Bitte später nochmal versuchen.",
    systemOn: "✅ Die Heimleitung hat die Sprechanlage wieder eingeschaltet.",
    systemOff: "🔇 Die Heimleitung hat die Sprechanlage vorübergehend abgeschaltet.",
    status: "📋 Heimleitungsbericht: Sprechanlage {enabledText}, Warteschlange {queueCount}/{queueMax}, heute Google {dailyChars}/{dailyLimit} Zeichen, Monat {monthlyChars}/{monthlyLimit} Zeichen.",
    stop: "🛑 Die Heimleitung unterbricht die aktuelle Durchsage.",
    clear: "🧹 Die Heimleitung hat die Warteschlange der Sprechanlage geleert.",
    muteSuccess: "🔇 Die Heimleitung hat @{user} für diesen Stream vom Mikrofon entfernt.",
    unmuteSuccess: "🔊 @{user} darf in diesem Stream wieder an die Sprechanlage.",
    banSuccess: "🚫 Die Heimleitung hat @{user} dauerhaft aus dem TTS-Aufenthaltsraum begleitet.",
    unbanSuccess: "✅ Die Heimleitung hat @{user} wieder auf die TTS-Liste gesetzt.",
    alreadyMuted: "🔇 @{user} sitzt bereits in der TTS-Stillecke.",
    alreadyBanned: "🚫 @{user} hat bereits dauerhaftes TTS-Hausverbot.",
    notMuted: "🔊 @{user} war gar nicht in der TTS-Stillecke.",
    notBanned: "✅ @{user} hatte kein dauerhaftes TTS-Hausverbot.",
    listEmpty: "📋 Heimleitungsbericht: Keine aktiven TTS-Mutes und keine dauerhaften TTS-Bans.",
    list: "📋 Heimleitungsbericht: Mikrofon-Pause: {mutes} | Hausverbot: {bans}",
    missingText: "🧓 Die Heimleitung hat nichts gehört. Nutzung: !tts dein Text",
    missingUser: "📋 Die Heimleitung braucht einen Namen. Beispiel: !tts mute @User",
    unknownCommand: "❓ Die Heimleitung kennt diesen TTS-Befehl nicht. Versuch: !tts help",
    noPermission: "🚫 Dafür fehlt dir der Schlüssel zur Heimleitungszentrale.",
    cloudUnavailable: "❌ Cloud-TTS ist gerade nicht verfügbar und der Fallback ist nicht bereit.",
    mutedUser: "🔇 Du bist für diesen Stream von der Sprechanlage abgemeldet.",
    bannedUser: "🚫 Du hast dauerhaftes TTS-Hausverbot.",
    help: "📋 Heimleitungszettel: !tts <Text> | Mods: on/off/status/stop/clear/list/mute/unmute | Chefetage: ban/unban | Chef: debug/debug full",
    debug: "📋 TTS-Debug: aktiv={enabledText} | spielt={playingText} | Queue={queueCount}/{queueMax} | Google heute {googleDaily}/{googleDailyLimit}, Monat {googleMonthly}/{googleMonthlyLimit} | Piper heute {piperDaily}, Monat {piperMonthly} | Mutes={muteCount} | Bans={banCount}",
    debugFull: "📋 TTS-Full: aktiv={enabledText} | spielt={playingText} | current={currentText} | Queue={queueCount}/{queueMax} | Google heute {googleDaily}/{googleDailyLimit}, Monat {googleMonthly}/{googleMonthlyLimit} | Piper heute {piperDaily}, Monat {piperMonthly} | Requests heute={requestsToday}, Monat={requestsMonth} | Mutes={muteCount} | Bans={banCount} | Rollen: {rolesText}",
    systemQueued: "📢 Heimleitungs-Durchsage wurde an die Sprechanlage übergeben."
  };

  const TEXT_CATEGORY_LABELS = {
    chat: "Chat-Antworten",
    permissions: "Rechte & Freigaben",
    moderation: "Mute/Ban Verwaltung",
    status: "Status & Listen",
    system: "Systemtexte",
    errors: "Fehlertexte",
    debug: "Debugtexte"
  };

  const TEXT_CATEGORIES = {
    ttsQueued: "chat",
    systemQueued: "chat",
    ttsDisabled: "system",
    notAllowed: "permissions",
    cooldown: "chat",
    tooLong: "chat",
    queueFull: "chat",
    systemOn: "system",
    systemOff: "system",
    status: "status",
    stop: "system",
    clear: "system",
    muteSuccess: "moderation",
    unmuteSuccess: "moderation",
    banSuccess: "moderation",
    unbanSuccess: "moderation",
    alreadyMuted: "moderation",
    alreadyBanned: "moderation",
    notMuted: "moderation",
    notBanned: "moderation",
    listEmpty: "status",
    list: "status",
    missingText: "errors",
    missingUser: "errors",
    unknownCommand: "errors",
    noPermission: "permissions",
    cloudUnavailable: "errors",
    mutedUser: "permissions",
    bannedUser: "permissions",
    help: "status",
    debug: "debug",
    debugFull: "debug"
  };

  const DEFAULT_STATE = {
    enabled: true,
    usage: {
      date: "",
      month: "",
      googleDailyCharacters: 0,
      googleMonthlyCharacters: 0,
      piperDailyCharacters: 0,
      piperMonthlyCharacters: 0,
      totalRequestsToday: 0,
      totalRequestsMonth: 0
    },
    cooldowns: { global: {}, users: {} },
    sessionMutes: {}
  };

  const DEFAULT_BANS = { users: {} };

  core.ensureDir(CONFIG_DIR);
  core.ensureDir(GENERATED_DIR);

  try { database.ensureReady(ctx); } catch (err) { console.error(`[TTS] database init failed: ${err.message}`); }

  let config = loadJson(CONFIG_FILE, DEFAULT_CONFIG);
  let messages = loadDbMessages(loadJson(MESSAGES_FILE, DEFAULT_MESSAGES));
  let state = loadJson(STATE_FILE, DEFAULT_STATE);
  let bans = loadJson(BANS_FILE, DEFAULT_BANS);

  ensureDbSchema();
  seedDbSettings();
  applyDbSettingsToConfig();
  let googleClients = {};
  let current = null;
  let playing = false;
  const queue = [];

  normalizeUsageDate();
  saveState();
  cleanupGeneratedFiles();

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return base;
    for (const [key, value] of Object.entries(incoming)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        base[key] = deepMerge(base[key] || {}, value);
      } else {
        base[key] = value;
      }
    }
    return base;
  }

  function loadJson(file, fallback) {
    try {
      if (!core.fileExists(file)) {
        core.writeJson(file, fallback);
        return structuredCloneSafe(fallback);
      }
      const parsed = core.readJson(file, null);
      if (!parsed || typeof parsed !== "object") throw new Error("invalid_json");
      return deepMerge(structuredCloneSafe(fallback), parsed);
    } catch (err) {
      console.error(`[TTS] Could not load ${file}: ${err.message}`);
      return structuredCloneSafe(fallback);
    }
  }

  function saveJson(file, data) {
    try {
      core.writeJson(file, data);
      return true;
    } catch (err) {
      console.error(`[TTS] Could not save ${file}: ${err.message}`);
      return false;
    }
  }

  function saveState() { saveJson(STATE_FILE, state); }
  function saveBans() { saveJson(BANS_FILE, bans); }

  function dbReady() {
    try { database.ensureReady(); return true; } catch (_) { return false; }
  }

  function ensureDbSchema() {
    if (!dbReady()) return false;
    const ttsEventIdPrimaryKey = database.primaryKeyAutoIncrementSql();
    database.ensureSchema(TTS_SCHEMA_MODULE, TTS_SCHEMA_VERSION, (fromVersion, toVersion, db) => {
      if (toVersion !== 1) return;
      db.exec(`
        CREATE TABLE IF NOT EXISTS tts_events (
          id ${ttsEventIdPrimaryKey},
          event_uid TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL DEFAULT 'chat',
          mode TEXT NOT NULL DEFAULT 'chat',
          status TEXT NOT NULL DEFAULT 'queued',
          user_login TEXT NOT NULL DEFAULT '',
          user_display TEXT NOT NULL DEFAULT '',
          role_key TEXT NOT NULL DEFAULT '',
          text TEXT NOT NULL DEFAULT '',
          chars INTEGER NOT NULL DEFAULT 0,
          voice_id TEXT NOT NULL DEFAULT '',
          engine TEXT NOT NULL DEFAULT '',
          audio_file TEXT NOT NULL DEFAULT '',
          audio_url TEXT NOT NULL DEFAULT '',
          duration_ms INTEGER NOT NULL DEFAULT 0,
          error TEXT NOT NULL DEFAULT '',
          meta_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          started_at TEXT,
          finished_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_tts_events_created ON tts_events(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_tts_events_source_mode ON tts_events(source, mode, created_at DESC);

        CREATE TABLE IF NOT EXISTS tts_usage_daily (
          usage_date TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'chat',
          mode TEXT NOT NULL DEFAULT 'chat',
          engine TEXT NOT NULL DEFAULT '',
          requests_total INTEGER NOT NULL DEFAULT 0,
          requests_ok INTEGER NOT NULL DEFAULT 0,
          requests_failed INTEGER NOT NULL DEFAULT 0,
          chars_total INTEGER NOT NULL DEFAULT 0,
          duration_ms_total INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (usage_date, source, mode, engine)
        );
      `);
    });
    settingsHelper.ensureSettingsTable(TTS_SETTINGS_TABLE);
    return true;
  }

  function defaultSettingsBlocks() {
    return [
      { key: 'enabled', value: DEFAULT_CONFIG.enabled, valueType: 'boolean', description: 'TTS insgesamt aktiv/inaktiv' },
      { key: 'command', value: DEFAULT_CONFIG.command, valueType: 'string', description: 'Chat-Befehl fuer TTS' },
      { key: 'defaultVoice', value: DEFAULT_CONFIG.defaultVoice, valueType: 'string', description: 'Standard-Stimme' },
      { key: 'fallbackVoice', value: DEFAULT_CONFIG.fallbackVoice, valueType: 'string', description: 'Fallback-Stimme' },
      { key: 'rejectWhenFallbackUnavailable', value: DEFAULT_CONFIG.rejectWhenFallbackUnavailable, valueType: 'boolean', description: 'Ablehnen wenn Fallback fehlt' },
      { key: 'limits', value: DEFAULT_CONFIG.limits, valueType: 'json', description: 'Google/Piper Limits' },
      { key: 'queue', value: DEFAULT_CONFIG.queue, valueType: 'json', description: 'Queue- und Cleanup-Regeln' },
      { key: 'text', value: DEFAULT_CONFIG.text, valueType: 'json', description: 'Textfilter' },
      { key: 'voices', value: DEFAULT_CONFIG.voices, valueType: 'json', description: 'Voice-Konfiguration ohne Secret-Inhalt' },
      { key: 'roles', value: DEFAULT_CONFIG.roles, valueType: 'json', description: 'Rollenregeln fuer Chat-TTS' },
      { key: 'permissions', value: DEFAULT_CONFIG.permissions, valueType: 'json', description: 'TTS Command-Rechte' },
      { key: 'system', value: { enabled: true, requireKey: false, key: '', respectGlobalEnabled: true, voice: DEFAULT_CONFIG.defaultVoice, user: 'heimaufsichtcgn', displayName: 'HeimaufsichtCGN', maxLength: 500, priority: 95 }, valueType: 'json', description: 'System-/Alert-TTS Defaults' },
      { key: 'alertTts', value: { enabled: true, voice: DEFAULT_CONFIG.defaultVoice, maxChars: 500, delayAfterSoundMs: 0, outroBufferMs: 900 }, valueType: 'json', description: 'Defaults fuer Alert-TTS' },
      { key: 'chatTts', value: { playbackMode: 'sound_system', overlayVisualEnabled: true, soundSystemEnabled: true, soundSystemPlayUrl: 'http://127.0.0.1:8080/api/sound/play', soundSystemStatusUrl: 'http://127.0.0.1:8080/api/sound/status', soundSystemCategory: 'tts', soundSystemSource: 'tts_system', soundSystemOutputTarget: 'device', soundSystemVolume: 100, soundSystemPriority: 50, doneMode: 'sound_system_status', doneExtraBufferMs: 500, statusPollMs: 350, statusMaxWaitMs: 120000, fallbackToOverlay: true, blockDuringAlerts: true, alertStatusUrl: 'http://127.0.0.1:8080/api/alerts/queue', alertPollMs: 350, alertMaxWaitMs: 120000, overlayDelayAfterAlertMs: 1500 }, valueType: 'json', description: 'Chat-TTS Ausgabe ueber Sound-System oder Overlay' }
    ];
  }

  function seedDbSettings() {
    if (!dbReady()) return false;
    try { settingsHelper.seedDefaults(TTS_SETTINGS_TABLE, defaultSettingsBlocks()); return true; }
    catch (err) { console.error(`[TTS] settings seed failed: ${err.message}`); return false; }
  }

  function listDbSettingsMap() {
    if (!dbReady()) return {};
    try {
      const result = settingsHelper.listSettings(TTS_SETTINGS_TABLE, { limit: 1000 });
      const map = {};
      for (const row of result.rows || []) map[row.key] = row.value;
      return map;
    } catch (err) {
      console.error(`[TTS] settings read failed: ${err.message}`);
      return {};
    }
  }

  function applyDbSettingsToConfig() {
    const dbSettings = listDbSettingsMap();
    if (!dbSettings || typeof dbSettings !== 'object') return config;
    config = deepMerge(config, dbSettings);
    return config;
  }

  function textEditorOptions() {
    return {
      categories: TEXT_CATEGORIES,
      categoryLabels: TEXT_CATEGORY_LABELS,
      defaultCategory: "chat"
    };
  }

  function loadDbMessages(baseMessages) {
    const fallback = deepMerge(structuredCloneSafe(DEFAULT_MESSAGES), baseMessages && typeof baseMessages === "object" ? baseMessages : {});
    try {
      const result = textHelper.getModuleTexts(TTS_TEXTS_MODULE, fallback, { ...textEditorOptions(), seed: true });
      return {
        ...result.texts,
        _textsTable: textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
        _legacyTextsTable: result.table,
        _textsSource: "database_variants_with_json_fallback"
      };
    } catch (err) {
      console.error(`[TTS] texts DB fallback: ${err.message}`);
      return {
        ...fallback,
        _textsTable: textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE,
        _legacyTextsTable: textHelper.DEFAULT_MODULE_TEXTS_TABLE,
        _textsSource: "json_fallback",
        _textsError: err.message
      };
    }
  }

  function listAdminTexts() {
    return textHelper.listModuleTextEditor(TTS_TEXTS_MODULE, messages || DEFAULT_MESSAGES, { ...textEditorOptions(), seed: true });
  }

  function setAdminTexts(payload) {
    const result = textHelper.handleModuleTextEditorPayload(TTS_TEXTS_MODULE, payload, textEditorOptions());
    reloadAllConfig();
    return { ok: true, module: MODULE_NAME, ...result, status: publicStatus() };
  }

  function reloadAllConfig() {
    config = loadJson(CONFIG_FILE, DEFAULT_CONFIG);
    messages = loadDbMessages(loadJson(MESSAGES_FILE, DEFAULT_MESSAGES));
    bans = loadJson(BANS_FILE, DEFAULT_BANS);
    seedDbSettings();
    applyDbSettingsToConfig();
    googleClients = {};
    normalizeUsageDate();
    saveState();
    return true;
  }


  function scrubSensitiveForDashboard(value) {
    if (Array.isArray(value)) return value.map((entry) => scrubSensitiveForDashboard(entry));
    if (!value || typeof value !== "object") return value;

    const result = {};
    for (const [key, rawValue] of Object.entries(value)) {
      const lowerKey = String(key || "").toLowerCase();

      if (["key", "apikey", "token", "secret", "credentials", "password"].includes(lowerKey)) {
        result[`${key}Configured`] = String(rawValue || "").length > 0;
        continue;
      }

      if (lowerKey === "keyfile") {
        const keyFile = String(rawValue || "");
        result.keyFileConfigured = keyFile.length > 0;
        result.keyFileExists = keyFile.length > 0 && core.fileExists(keyFile);
        continue;
      }

      result[key] = scrubSensitiveForDashboard(rawValue);
    }
    return result;
  }

  function sanitizeForDashboard(value) {
    const cloned = structuredCloneSafe(value || {});
    const clean = scrubSensitiveForDashboard(cloned);
    if (clean.voices && typeof clean.voices === "object") clean.voices = sanitizeVoicesForDashboard(clean.voices);
    return clean;
  }

  function sanitizeVoicesForDashboard(voices) {
    const result = {};
    for (const [voiceId, voice] of Object.entries(voices || {})) {
      result[voiceId] = scrubSensitiveForDashboard(structuredCloneSafe(voice || {}));
    }
    return result;
  }

  function sanitizeSettingRowForDashboard(row) {
    const clean = structuredCloneSafe(row || {});
    clean.value = sanitizeForDashboard(clean.value);
    if (Object.prototype.hasOwnProperty.call(clean, "rawValue")) {
      if (clean.value && typeof clean.value === "object") clean.rawValue = JSON.stringify(clean.value);
      else clean.rawValue = clean.value === undefined || clean.value === null ? "" : String(clean.value);
    }
    return clean;
  }

  function sanitizeSettingsListForDashboard(settings) {
    const clean = structuredCloneSafe(settings || { ok: true, table: TTS_SETTINGS_TABLE, count: 0, rows: [] });
    clean.rows = (clean.rows || []).map(sanitizeSettingRowForDashboard);
    clean.count = Number(clean.count || clean.rows.length || 0);
    return clean;
  }

  function publicSettings() {
    const result = settingsListSafe();
    return {
      ok: result.ok,
      table: TTS_SETTINGS_TABLE,
      settings: sanitizeSettingsListForDashboard(result.settings),
      effective: sanitizeForDashboard(config),
      error: result.error || ""
    };
  }

  function settingsListSafe() {
    try {
      const settings = settingsHelper.listSettings(TTS_SETTINGS_TABLE, { limit: 1000 });
      return { ok: true, settings, error: "" };
    } catch (err) {
      return { ok: false, settings: { ok: false, table: TTS_SETTINGS_TABLE, count: 0, rows: [] }, error: err.message || String(err) };
    }
  }

  function configSources() {
    const settings = settingsListSafe();
    return {
      json: {
        path: CONFIG_FILE,
        exists: core.fileExists(CONFIG_FILE)
      },
      database: {
        table: TTS_SETTINGS_TABLE,
        ok: settings.ok,
        count: settings.settings?.count || settings.settings?.rows?.length || 0,
        error: settings.error || ""
      },
      rule: "database_over_json_fallback"
    };
  }

  function publicConfig() {
    return {
      ok: true,
      module: MODULE_NAME,
      schemaVersion: TTS_SCHEMA_VERSION,
      config: sanitizeForDashboard(config),
      sources: configSources()
    };
  }

  function publicVoices() {
    const voices = sanitizeVoicesForDashboard(config.voices || {});
    return {
      ok: true,
      module: MODULE_NAME,
      count: Object.keys(voices).length,
      defaultVoice: config.defaultVoice || "",
      fallbackVoice: config.fallbackVoice || "",
      voices,
      sources: configSources()
    };
  }

  function publicIntegrationCheck() {
    const warnings = [];
    const errors = [];
    const sources = configSources();
    const voices = publicVoices().voices || {};
    const defaultVoice = String(config.defaultVoice || "");
    const fallbackVoice = String(config.fallbackVoice || "");
    const chatTts = config.chatTts || {};

    if (!sources.json.exists) warnings.push("config_json_missing_uses_defaults");
    if (!sources.database.ok) errors.push("settings_database_unavailable");
    if (sources.database.ok && Number(sources.database.count || 0) <= 0) warnings.push("settings_database_empty_json_fallback_only");

    if (!config.enabled) warnings.push("tts_disabled");
    if (!defaultVoice || !voices[defaultVoice]) errors.push("default_voice_missing");
    if (defaultVoice && voices[defaultVoice] && voices[defaultVoice].enabled === false) errors.push("default_voice_disabled");
    if (!fallbackVoice || !voices[fallbackVoice]) warnings.push("fallback_voice_missing");

    for (const [voiceId, voice] of Object.entries(voices)) {
      const engine = String(voice.engine || "").toLowerCase();
      if (voice.enabled === false) continue;

      if (engine === "google") {
        if (!voice.keyFileConfigured) errors.push(`voice_${voiceId}_google_keyfile_not_configured`);
        else if (!voice.keyFileExists) errors.push(`voice_${voiceId}_google_keyfile_missing`);
      } else if (engine === "piper") {
        for (const fileKey of ["exe", "model", "config"]) {
          const filePath = String((config.voices || {})[voiceId]?.[fileKey] || "");
          if (!filePath) errors.push(`voice_${voiceId}_piper_${fileKey}_not_configured`);
          else if (!core.fileExists(filePath)) errors.push(`voice_${voiceId}_piper_${fileKey}_missing`);
        }
      } else {
        warnings.push(`voice_${voiceId}_unknown_engine`);
      }
    }

    if (chatTts.soundSystemEnabled) {
      if (String(chatTts.playbackMode || "") !== "sound_system") warnings.push("chat_tts_sound_system_enabled_but_playback_mode_not_sound_system");
      if (!chatTts.soundSystemPlayUrl) errors.push("chat_tts_sound_system_play_url_missing");
      if (!chatTts.soundSystemStatusUrl) warnings.push("chat_tts_sound_system_status_url_missing");
      if (chatTts.fallbackToOverlay === true) warnings.push("chat_tts_overlay_fallback_enabled_may_duplicate_audio");
    } else {
      warnings.push("chat_tts_sound_system_disabled");
    }

    return {
      ok: true,
      module: MODULE_NAME,
      healthy: errors.length === 0,
      warnings,
      errors,
      checks: {
        enabled: Boolean(config.enabled),
        dbSettingsOk: Boolean(sources.database.ok),
        dbSettingsCount: Number(sources.database.count || 0),
        jsonConfigExists: Boolean(sources.json.exists),
        defaultVoice,
        fallbackVoice,
        voiceCount: Object.keys(voices).length,
        soundSystemEnabled: Boolean(chatTts.soundSystemEnabled),
        playbackMode: String(chatTts.playbackMode || ""),
        outputTarget: String(chatTts.soundSystemOutputTarget || ""),
        current: current ? publicItem(current) : null,
        queueSize: queue.length
      },
      sources
    };
  }

  function publicRoutes() {
    return {
      ok: true,
      module: MODULE_NAME,
      addedByStep: "STEP199.1",
      routes: [
        { method: "ALL", path: "/api/tts/run", description: "Main TTS command parser endpoint" },
        { method: "ALL", path: "/api/tts/say", description: "Queue chat/API TTS text" },
        { method: "ALL", path: "/api/tts/done", description: "Mark current overlay playback done" },
        { method: "GET", path: "/api/tts/status", description: "Runtime status" },
        { method: "GET", path: "/api/tts/overlay-state", description: "Overlay state" },
        { method: "ALL", path: "/api/tts/on", description: "Enable TTS" },
        { method: "ALL", path: "/api/tts/off", description: "Disable TTS" },
        { method: "ALL", path: "/api/tts/stop", description: "Stop current playback" },
        { method: "ALL", path: "/api/tts/clear", description: "Clear queue" },
        { method: "ALL", path: "/api/tts/reload", description: "Reload config/messages/bans/settings" },
        { method: "ALL", path: "/api/tts/command", description: "Run admin command" },
        { method: "GET", path: "/api/tts/settings", description: "Existing settings endpoint" },
        { method: "POST", path: "/api/tts/settings/upsert", description: "Existing settings upsert endpoint" },
        { method: "GET", path: "/api/tts/events", description: "TTS event history" },
        { method: "GET", path: "/api/tts/stats", description: "TTS statistics" },
        { method: "ALL", path: "/api/tts/prepare-alert", description: "Prepare alert TTS audio" },
        { method: "ALL", path: "/api/tts/synthesize", description: "Synthesize TTS audio" },
        { method: "GET", path: "/api/tts/config", description: "Sanitized effective dashboard config" },
        { method: "GET", path: "/api/tts/voices", description: "Sanitized voice list" },
        { method: "GET", path: "/api/tts/routes", description: "Route self-documentation" },
        { method: "GET", path: "/api/tts/integration-check", description: "Integration and DB/JSON/Sound-System consistency check" },
        { method: "GET", path: "/api/tts/admin/settings", description: "Alias for DB-backed settings list" },
        { method: "POST", path: "/api/tts/admin/settings", description: "Alias for DB-backed setting upsert" },
        { method: "GET", path: "/api/tts/admin/texts", description: "List DB-backed TTS text variants" },
        { method: "POST", path: "/api/tts/admin/texts", description: "Create/update/delete DB-backed TTS text variants" }
      ],
      notes: [
        "TTS erzeugt Audiodateien; Ausgabe soll standardmaessig ueber das Sound-System laufen.",
        "DB-Settings gewinnen gegen JSON-Fallback.",
        "Dashboard nutzt Backend-APIs und liest keine Dateien/SQLite direkt."
      ]
    };
  }

  function upsertSettingFromRequest(req, res) {
    try {
      const data = getRequestData(req);
      const key = String(data.key || data.settingKey || '').trim();
      if (!key) return res.status(400).json({ ok: false, error: 'setting_key_required' });

      let value = data.value !== undefined ? data.value : data.setting_value;
      if (value === undefined && data.rawValue !== undefined) value = data.rawValue;

      const valueType = String(data.valueType || data.type || '').trim();
      if ((valueType === 'json' || (!valueType && typeof value === 'string')) && typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          value = JSON.parse(trimmed);
        }
      }

      const saved = settingsHelper.setSetting(TTS_SETTINGS_TABLE, key, value, { valueType, description: data.description || '' });
      reloadAllConfig();
      return res.json({ ok: true, table: TTS_SETTINGS_TABLE, setting: saved, effective: sanitizeForDashboard(config) });
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'settings_upsert_failed', message: err.message || String(err) });
    }
  }

  function msg(key, vars = {}) {
    try {
      const rendered = textHelper.renderModuleText(TTS_TEXTS_MODULE, key, messages || DEFAULT_MESSAGES, vars, { ...textEditorOptions(), seed: false });
      if (rendered) return rendered;
    } catch (err) {
      // Keep TTS chat responses working even when the text variants layer is unavailable.
    }
    const template = String(messages[key] || DEFAULT_MESSAGES[key] || key);
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`;
    });
  }

  function todayKey() { return core.nowIso().slice(0, 10); }
  function monthKey() { return core.nowIso().slice(0, 7); }

  function normalizeUsageDate() {
    const today = todayKey();
    const month = monthKey();
    if (!state.usage) state.usage = structuredCloneSafe(DEFAULT_STATE.usage);
    if (state.usage.date !== today) {
      state.usage.date = today;
      state.usage.googleDailyCharacters = 0;
      state.usage.piperDailyCharacters = 0;
      state.usage.totalRequestsToday = 0;
    }
    if (state.usage.month !== month) {
      state.usage.month = month;
      state.usage.googleMonthlyCharacters = 0;
      state.usage.piperMonthlyCharacters = 0;
      state.usage.totalRequestsMonth = 0;
    }
    if (!state.cooldowns) state.cooldowns = { global: {}, users: {} };
    if (!state.cooldowns.global) state.cooldowns.global = {};
    if (!state.cooldowns.users) state.cooldowns.users = {};
    if (!state.sessionMutes) state.sessionMutes = {};
    if (!bans.users) bans.users = {};
  }

  function getRequestData(req) {
    return Object.assign({}, req.query || {}, req.body || {});
  }

  function toBool(value) {
    return core.boolParam(value, false);
  }

  function resolveRole(data) {
    const explicit = String(data.role || "").toLowerCase().trim();
    if (["broadcaster", "moderator", "vip", "subscriber", "viewer"].includes(explicit)) return explicit;

    if (toBool(data.isBroadcaster) || toBool(data.broadcaster)) return "broadcaster";
    if (toBool(data.isModerator) || toBool(data.moderator) || toBool(data.isMod) || toBool(data.mod)) return "moderator";
    if (toBool(data.isVip) || toBool(data.vip) || toBool(data.isVIP)) return "vip";
    if (toBool(data.isSubscriber) || toBool(data.subscriber) || toBool(data.isSub) || toBool(data.sub)) return "subscriber";
    return "viewer";
  }

  function sanitizeText(raw) {
    let text = String(raw || "");
    text = text.replace(/[\r\n\t]+/g, " ");
    text = text.replace(/<[^>]*>/g, " ");
    if (config.text?.removeUrls) {
      text = text.replace(/https?:\/\/\S+/gi, " Link entfernt ");
      text = text.replace(/www\.\S+/gi, " Link entfernt ");
    }
    const maxRep = Number(config.text?.maxRepeatedChar || 0);
    if (maxRep > 1) {
      const re = new RegExp(`(.)\\1{${maxRep},}`, "gi");
      text = text.replace(re, (m, ch) => ch.repeat(maxRep));
    }
    return text.replace(/\s{2,}/g, " ").trim();
  }

  function makeId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function roleConfig(role) {
    return config.roles?.[role] || config.roles?.viewer || DEFAULT_CONFIG.roles.viewer;
  }

  function voiceConfig(voiceId) {
    const id = String(voiceId || config.defaultVoice || "google_wavenet_h");
    return { id, cfg: config.voices?.[id] || null };
  }

  function userKey(data) {
    return normalizeLogin(data.login || data.userName || data.user || data.displayName || "unknown") || "unknown";
  }

  function displayName(data) {
    return String(data.displayName || data.user || data.userName || data.login || "Unbekannt").replace(/^@+/, "").trim();
  }

  function normalizeLogin(value) {
    return String(value || "").replace(/^@+/, "").trim().toLowerCase();
  }

  function parseRawInput(data) {
    let raw = String(data.raw || data.rawInput || data.input || data.message || data.text || "").trim();
    const command = String(config.command || "!tts").toLowerCase();
    if (raw.toLowerCase().startsWith(command + " ")) raw = raw.slice(command.length).trim();
    if (raw.toLowerCase() === command) raw = "";
    return raw;
  }

  function parseCommand(raw) {
    const cleaned = String(raw || "").trim();
    if (!cleaned) return { kind: "empty", command: "", rest: "" };
    const parts = cleaned.split(/\s+/);
    const first = String(parts[0] || "").toLowerCase();
    if (RESERVED_COMMANDS.has(first)) {
      return { kind: "admin", command: first, rest: cleaned.slice(parts[0].length).trim() };
    }
    return { kind: "say", command: "say", rest: cleaned };
  }

  function canRunSubcommand(role, command, actorLogin) {
    if (role === "broadcaster") return true;

    const login = normalizeLogin(actorLogin || "");
    const banManagers = Array.isArray(config.permissions?.banManagers)
      ? config.permissions.banManagers.map(normalizeLogin).filter(Boolean)
      : [];

    if (["ban", "unban"].includes(command) && banManagers.includes(login)) {
      return true;
    }

    if (config.permissions?.broadcasterOnlyCommands?.includes(command)) return false;
    if (role === "moderator" && config.permissions?.moderatorCommands?.includes(command)) return true;
    return false;
  }

  function checkCooldown(role, user) {
    const rc = roleConfig(role);
    const now = Date.now();
    const globalCd = Number(rc.globalCooldownSeconds || 0) * 1000;
    const userCd = Number(rc.userCooldownSeconds || 0) * 1000;

    if (globalCd > 0) {
      const lastGlobal = Number(state.cooldowns.global[role] || 0);
      const diff = now - lastGlobal;
      if (diff < globalCd) {
        return { ok: false, reason: "global_cooldown", waitSeconds: Math.ceil((globalCd - diff) / 1000) };
      }
    }

    if (userCd > 0) {
      const key = `${role}:${user}`;
      const lastUser = Number(state.cooldowns.users[key] || 0);
      const diff = now - lastUser;
      if (diff < userCd) {
        return { ok: false, reason: "user_cooldown", waitSeconds: Math.ceil((userCd - diff) / 1000) };
      }
    }

    return { ok: true };
  }

  function touchCooldown(role, user) {
    const now = Date.now();
    state.cooldowns.global[role] = now;
    state.cooldowns.users[`${role}:${user}`] = now;
    saveState();
  }

  function isMuted(user) {
    normalizeUsageDate();
    return Boolean(state.sessionMutes?.[user]);
  }

  function isBanned(user) {
    normalizeUsageDate();
    return Boolean(bans.users?.[user]);
  }

  function canUseGoogle(chars) {
    normalizeUsageDate();
    const dailyLimit = Number(config.limits?.googleDailyCharacterLimit || 0);
    const monthlyLimit = Number(config.limits?.googleMonthlyCharacterLimit || 0);
    if (dailyLimit > 0 && (state.usage.googleDailyCharacters + chars) > dailyLimit) {
      return { ok: false, reason: "daily_limit" };
    }
    if (monthlyLimit > 0 && (state.usage.googleMonthlyCharacters + chars) > monthlyLimit) {
      return { ok: false, reason: "monthly_limit" };
    }
    return { ok: true };
  }

  function addUsage(engine, chars) {
    normalizeUsageDate();
    if (engine === "google") {
      state.usage.googleDailyCharacters += chars;
      state.usage.googleMonthlyCharacters += chars;
    } else if (engine === "piper") {
      state.usage.piperDailyCharacters += chars;
      state.usage.piperMonthlyCharacters += chars;
    }
    state.usage.totalRequestsToday += 1;
    state.usage.totalRequestsMonth += 1;
    saveState();
  }

  function recordUsageDaily(source, mode, engine, chars, durationMs, ok) {
    if (!dbReady()) return;
    try {
      const usageDate = todayKey();
      database.run(`
        INSERT INTO tts_usage_daily (usage_date, source, mode, engine, requests_total, requests_ok, requests_failed, chars_total, duration_ms_total, updated_at)
        VALUES (:usageDate, :source, :mode, :engine, 1, :okCount, :failedCount, :chars, :durationMs, :updatedAt)
        ON CONFLICT(usage_date, source, mode, engine) DO UPDATE SET
          requests_total = requests_total + 1,
          requests_ok = requests_ok + excluded.requests_ok,
          requests_failed = requests_failed + excluded.requests_failed,
          chars_total = chars_total + excluded.chars_total,
          duration_ms_total = duration_ms_total + excluded.duration_ms_total,
          updated_at = excluded.updated_at
      `, {
        usageDate,
        source: String(source || 'chat'),
        mode: String(mode || 'chat'),
        engine: String(engine || ''),
        okCount: ok ? 1 : 0,
        failedCount: ok ? 0 : 1,
        chars: Number(chars || 0),
        durationMs: Number(durationMs || 0),
        updatedAt: core.nowIso()
      });
    } catch (err) {
      console.error(`[TTS] usage db write failed: ${err.message}`);
    }
  }

  function insertTtsEvent(item, status, extra = {}) {
    if (!dbReady() || !item) return;
    try {
      database.run(`
        INSERT INTO tts_events (event_uid, source, mode, status, user_login, user_display, role_key, text, chars, voice_id, engine, audio_file, audio_url, duration_ms, error, meta_json, created_at, started_at, finished_at)
        VALUES (:eventUid, :source, :mode, :status, :userLogin, :userDisplay, :roleKey, :text, :chars, :voiceId, :engine, :audioFile, :audioUrl, :durationMs, :error, :metaJson, :createdAt, :startedAt, :finishedAt)
        ON CONFLICT(event_uid) DO UPDATE SET
          status=excluded.status,
          engine=excluded.engine,
          audio_file=excluded.audio_file,
          audio_url=excluded.audio_url,
          duration_ms=excluded.duration_ms,
          error=excluded.error,
          meta_json=excluded.meta_json,
          started_at=COALESCE(excluded.started_at, started_at),
          finished_at=COALESCE(excluded.finished_at, finished_at)
      `, {
        eventUid: item.id,
        source: String(item.source || extra.source || 'chat'),
        mode: String(item.mode || extra.mode || 'chat'),
        status: String(status || item.status || 'queued'),
        userLogin: String(item.user || ''),
        userDisplay: String(item.displayName || ''),
        roleKey: String(item.role || ''),
        text: String(item.text || ''),
        chars: Number(item.chars || 0),
        voiceId: String(item.voiceUsed || item.voice || ''),
        engine: String(item.engineUsed || extra.engine || ''),
        audioFile: String(item.audioFile || extra.audioFile || ''),
        audioUrl: String(item.audioUrl || extra.audioUrl || ''),
        durationMs: Number(item.durationMs || extra.durationMs || 0),
        error: String(extra.error || item.error || ''),
        metaJson: JSON.stringify(extra.meta || item.meta || {}),
        createdAt: item.createdAt || core.nowIso(),
        startedAt: extra.startedAt || null,
        finishedAt: extra.finishedAt || null
      });
    } catch (err) {
      console.error(`[TTS] event db write failed: ${err.message}`);
    }
  }

  function readAudioDurationMs(audioFile, chars = 0) {
    const probed = media.readAudioDurationMs(audioFile, { timeoutMs: 5000 });
    if (probed.ok && Number(probed.durationMs) > 0) return { durationMs: Number(probed.durationMs), durationOk: true, source: 'ffprobe' };
    const estimated = Math.max(900, Math.min(60000, Math.round(Number(chars || 0) * 72 + 650)));
    return { durationMs: estimated, durationOk: false, source: probed.error || 'estimated' };
  }

  function normalizePlaybackMode(value, fallback = 'sound_system') {
    const mode = String(value || fallback || '').trim().toLowerCase();
    if (mode === 'sound-system' || mode === 'soundsystem' || mode === 'sound') return 'sound_system';
    if (['sound_system', 'overlay', 'off'].includes(mode)) return mode;
    return fallback;
  }

  function normalizeChatDoneMode(value) {
    const mode = String(value || '').trim().toLowerCase();
    if (['sound_system_status', 'sound-status', 'sound_status', 'status', 'sound_system'].includes(mode)) return 'sound_system_status';
    if (['duration_timer', 'timer', 'duration'].includes(mode)) return 'duration_timer';
    return 'sound_system_status';
  }

  function deriveSoundSystemStatusUrl(playUrl) {
    try {
      const u = new URL(String(playUrl || 'http://127.0.0.1:8080/api/sound/play'));
      u.pathname = u.pathname.replace(/\/play\/?$/i, '/status');
      return u.toString();
    } catch (_) {
      return 'http://127.0.0.1:8080/api/sound/status';
    }
  }

  function getChatTtsConfig() {
    const raw = config.chatTts && typeof config.chatTts === 'object' ? config.chatTts : {};
    return {
      playbackMode: normalizePlaybackMode(raw.playbackMode, 'sound_system'),
      overlayVisualEnabled: raw.overlayVisualEnabled !== false,
      soundSystemEnabled: raw.soundSystemEnabled !== false,
      soundSystemPlayUrl: String(raw.soundSystemPlayUrl || 'http://127.0.0.1:8080/api/sound/play'),
      soundSystemStatusUrl: String(raw.soundSystemStatusUrl || deriveSoundSystemStatusUrl(raw.soundSystemPlayUrl || 'http://127.0.0.1:8080/api/sound/play')),
      soundSystemCategory: String(raw.soundSystemCategory || 'tts'),
      soundSystemSource: String(raw.soundSystemSource || 'tts_system'),
      soundSystemOutputTarget: String(raw.soundSystemOutputTarget || 'device'),
      soundSystemVolume: Math.max(0, Math.min(100, Number(raw.soundSystemVolume ?? 100) || 100)),
      soundSystemPriority: Number(raw.soundSystemPriority ?? 50) || 50,
      doneMode: normalizeChatDoneMode(raw.doneMode || 'sound_system_status'),
      doneExtraBufferMs: Math.max(0, Number(raw.doneExtraBufferMs ?? 500) || 0),
      statusPollMs: Math.max(150, Number(raw.statusPollMs ?? 350) || 350),
      statusMaxWaitMs: Math.max(5000, Number(raw.statusMaxWaitMs ?? 120000) || 120000),
      fallbackToOverlay: raw.fallbackToOverlay !== false,
      blockDuringAlerts: raw.blockDuringAlerts !== false,
      alertStatusUrl: String(raw.alertStatusUrl || 'http://127.0.0.1:8080/api/alerts/queue'),
      alertPollMs: Math.max(150, Number(raw.alertPollMs ?? 350) || 350),
      alertMaxWaitMs: Math.max(1000, Number(raw.alertMaxWaitMs ?? 120000) || 120000),
      overlayDelayAfterAlertMs: Math.max(0, Number(raw.overlayDelayAfterAlertMs ?? 1500) || 0)
    };
  }


  function isNormalChatTtsItem(item) {
    if (!item) return false;
    const source = String(item.source || 'chat').toLowerCase();
    const mode = String(item.mode || 'chat').toLowerCase();
    return source === 'chat' && mode === 'chat';
  }

  function sleepMs(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms || 0))));
  }

  function alertQueueIsBusy(status) {
    if (!status || status.ok === false) return false;
    return Boolean(status.current) || Number(status.queueLength || 0) > 0;
  }

  async function waitForChatTtsPlaybackSlot(item, chatCfg) {
    if (!chatCfg || chatCfg.blockDuringAlerts === false) return { waited: false, reason: 'disabled' };
    if (!isNormalChatTtsItem(item)) return { waited: false, reason: 'not_chat_tts' };

    const statusUrl = String(chatCfg.alertStatusUrl || '').trim();
    if (!statusUrl) return { waited: false, reason: 'missing_alert_status_url' };

    const pollMs = Math.max(150, Number(chatCfg.alertPollMs || 350));
    const maxWaitMs = Math.max(1000, Number(chatCfg.alertMaxWaitMs || 120000));
    const startedAt = Date.now();
    let waited = false;
    let lastBusy = false;
    let lastError = '';

    while ((Date.now() - startedAt) < maxWaitMs) {
      try {
        const status = await getJson(statusUrl, 3500);
        const busy = alertQueueIsBusy(status);
        if (!busy) {
          if (waited || lastBusy) {
            const delayMs = Math.max(0, Number(chatCfg.overlayDelayAfterAlertMs || 0));
            if (delayMs > 0) await sleepMs(delayMs);
          }
          return { waited, reason: waited ? 'alerts_finished' : 'alerts_idle' };
        }
        waited = true;
        lastBusy = true;
        item.alertBlockWait = {
          startedAt: item.alertBlockWait?.startedAt || core.nowIso(),
          lastSeenAt: core.nowIso(),
          statusCurrent: status.current ? (status.current.eventUid || status.current.id || true) : null,
          queueLength: Number(status.queueLength || 0)
        };
        insertTtsEvent(item, 'waiting_for_alerts', { meta: item.alertBlockWait });
      } catch (err) {
        lastError = err && err.message ? err.message : String(err);
        item.alertBlockWaitError = lastError;
        break;
      }
      await sleepMs(pollMs);
    }

    if (waited) {
      insertTtsEvent(item, 'alert_wait_timeout', { error: lastError, meta: { maxWaitMs, waited } });
    }
    return { waited, reason: waited ? 'timeout' : 'status_error', error: lastError };
  }

  function postJson(url, payload, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      let parsed;
      try { parsed = new URL(url); } catch (err) { reject(err); return; }
      const body = JSON.stringify(payload || {});
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request({
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: `${parsed.pathname}${parsed.search || ''}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: timeoutMs
      }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try { json = data ? JSON.parse(data) : null; } catch (_) { json = { raw: data }; }
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json || { ok: true });
          else reject(new Error(`http_${res.statusCode}:${data}`));
        });
      });
      req.on('timeout', () => { req.destroy(new Error('request_timeout')); });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  function getJson(url, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      let parsed;
      try { parsed = new URL(url); } catch (err) { reject(err); return; }
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request({
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: `${parsed.pathname}${parsed.search || ''}`,
        method: 'GET',
        timeout: timeoutMs
      }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try { json = data ? JSON.parse(data) : null; } catch (_) { json = { raw: data }; }
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json || { ok: true });
          else reject(new Error(`http_${res.statusCode}:${data}`));
        });
      });
      req.on('timeout', () => { req.destroy(new Error('request_timeout')); });
      req.on('error', reject);
      req.end();
    });
  }

  function soundItemMatchesTts(item, soundItem) {
    if (!item || !soundItem) return false;
    const ttsId = String(item.id || '');
    const visual = soundItem.visual || {};
    const meta = soundItem.meta || soundItem.meta_json || {};
    const values = [
      soundItem.id,
      soundItem.requestId,
      soundItem.request_id,
      visual.requestId,
      visual.ttsId,
      meta.ttsId,
      meta.tts_id
    ].map(v => String(v || '')).filter(Boolean);
    if (ttsId && values.includes(ttsId)) return true;
    const file = String(soundItem.file || soundItem.soundFile || soundItem.path || '');
    return !!(item.soundSystemFile && file && file.includes(item.soundSystemFile));
  }

  function findMatchingSoundItem(status, item) {
    if (!status || !item) return null;
    const candidates = [];
    if (status.current) candidates.push(status.current);
    if (Array.isArray(status.parallel)) candidates.push(...status.parallel);
    if (Array.isArray(status.queue)) candidates.push(...status.queue);
    return candidates.find(x => soundItemMatchesTts(item, x)) || null;
  }

  function waitForSoundSystemFinish(item, chatCfg) {
    const statusUrl = chatCfg.soundSystemStatusUrl || deriveSoundSystemStatusUrl(chatCfg.soundSystemPlayUrl);
    const pollMs = Math.max(150, Number(chatCfg.statusPollMs || 350));
    const maxWaitMs = Math.max(
      Number(chatCfg.statusMaxWaitMs || 0),
      Number(item.durationMs || 0) + Number(chatCfg.doneExtraBufferMs || 0) + 15000
    );
    const startedAtMs = Date.now();
    let seenStarted = false;
    let startEventWritten = false;
    let stopped = false;

    const finish = (reason) => {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      finishCurrentById(item.id, reason);
    };

    const tick = async () => {
      if (stopped) return;
      try {
        const status = await getJson(statusUrl, 3500);
        const match = findMatchingSoundItem(status, item);
        if (match) {
          seenStarted = true;
          if (!startEventWritten) {
            startEventWritten = true;
            item.soundSystemStartedAt = core.nowIso();
            insertTtsEvent(item, 'sound_system_current', { startedAt: item.soundSystemStartedAt, meta: { soundRequestId: match.requestId || match.id || '' } });
          }
          return;
        }
        if (seenStarted) return finish('sound_system_status_finished');
      } catch (err) {
        item.soundSystemStatusError = err.message || String(err);
      }

      if ((Date.now() - startedAtMs) > maxWaitMs) {
        insertTtsEvent(item, 'sound_system_status_timeout', { error: item.soundSystemStatusError || '', meta: { maxWaitMs, seenStarted } });
        return finish(seenStarted ? 'sound_system_status_timeout_after_start' : 'sound_system_status_timeout_before_start');
      }
    };

    const timer = setInterval(tick, pollMs);
    timer.unref?.();
    setTimeout(tick, 40).unref?.();
  }

  async function playChatTtsViaSoundSystem(item, chatCfg) {
    if (!item.soundSystemFile) throw new Error('tts_sound_system_file_missing');
    const payload = {
      file: item.soundSystemFile,
      category: chatCfg.soundSystemCategory || 'tts',
      source: chatCfg.soundSystemSource || 'tts_system',
      outputTarget: chatCfg.soundSystemOutputTarget || 'device',
      volume: Number(chatCfg.soundSystemVolume ?? 100),
      priority: Number(chatCfg.soundSystemPriority ?? item.priority ?? 50),
      queueIfBusy: true,
      canInterrupt: false,
      canBeInterrupted: true,
      durationMs: Number(item.durationMs || 0),
      meta: {
        tts: true,
        mode: 'chat',
        ttsId: item.id,
        user: item.user,
        displayName: item.displayName,
        role: item.role
      },
      visual: {
        module: 'tts_overlay',
        type: 'chat_tts',
        requestId: item.id,
        displayName: item.displayName || item.user || 'TTS',
        login: item.user || '',
        user: item.displayName || item.user || 'TTS',
        role: item.role || 'tts',
        text: item.text || '',
        title: 'Text to Speech',
        voice: item.voiceUsed || item.voice || '',
        voiceLabel: item.voiceLabel || '',
        engine: item.engineUsed || '',
        durationMs: Number(item.durationMs || 0),
        source: 'tts_system'
      }
    };
    return postJson(chatCfg.soundSystemPlayUrl, payload, 10000);
  }

  function finishCurrentById(id, reason = 'timer') {
    if (current && (!id || current.id === id)) {
      current.finishedAt = core.nowIso();
      insertTtsEvent(current, 'finished', { finishedAt: current.finishedAt, durationMs: current.durationMs || 0, meta: { reason } });
      current = null;
      playing = false;
      saveState();
      broadcastState();
      setTimeout(startNext, Number(config.queue?.gapAfterMs || 350));
      return true;
    }
    return false;
  }

  function googleAvailable(vc) {
    if (!vc?.enabled) return { ok: false, reason: "google_voice_disabled" };
    if (!textToSpeech) return { ok: false, reason: "google_package_missing" };
    if (!vc.keyFile || !fs.existsSync(vc.keyFile)) return { ok: false, reason: "google_key_missing" };
    return { ok: true };
  }

  function piperAvailable(vc) {
    if (!vc?.enabled) return { ok: false, reason: "piper_voice_disabled" };
    if (!vc.exe || !fs.existsSync(vc.exe)) return { ok: false, reason: "piper_exe_missing" };
    if (!vc.model || !fs.existsSync(vc.model)) return { ok: false, reason: "piper_model_missing" };
    return { ok: true };
  }

  async function synthesizeGoogle(item, voiceId, vc) {
    const ga = googleAvailable(vc);
    if (!ga.ok) throw new Error(ga.reason);

    const limit = canUseGoogle(item.chars);
    if (!limit.ok) throw new Error(limit.reason);

    if (!googleClients[voiceId]) {
      googleClients[voiceId] = new textToSpeech.TextToSpeechClient({ keyFilename: vc.keyFile });
    }

    const ext = String(vc.audioEncoding || "MP3").toLowerCase() === "mp3" ? "mp3" : "mp3";
    const fileName = `tts_${Date.now()}_${item.id}.${ext}`;
    const outputFile = path.join(GENERATED_DIR, fileName);

    const [response] = await googleClients[voiceId].synthesizeSpeech({
      input: { text: item.text },
      voice: {
        languageCode: vc.languageCode || "de-DE",
        name: vc.name || "de-DE-Wavenet-H"
      },
      audioConfig: {
        audioEncoding: vc.audioEncoding || "MP3",
        speakingRate: Number(vc.speakingRate || 1.0),
        pitch: Number(vc.pitch || 0.0)
      }
    });

    fs.writeFileSync(outputFile, response.audioContent, "binary");
    addUsage("google", item.chars);

    return { file: outputFile, url: `${GENERATED_PUBLIC_URL}/${fileName}`, soundSystemFile: `${GENERATED_SOUND_SYSTEM_PREFIX}/${fileName}`, engine: "google", voice: voiceId, label: vc.label || vc.name };
  }

  async function synthesizePiper(item, voiceId, vc) {
    const pa = piperAvailable(vc);
    if (!pa.ok) throw new Error(pa.reason);

    const fileName = `tts_${Date.now()}_${item.id}.wav`;
    const outputFile = path.join(GENERATED_DIR, fileName);

    await new Promise((resolve, reject) => {
      const args = ["--model", vc.model, "--output_file", outputFile];
      if (vc.config && fs.existsSync(vc.config)) args.push("--config", vc.config);

      const child = spawn(vc.exe, args, { windowsHide: true });
      let stderr = "";
      child.stderr.on("data", d => stderr += d.toString());
      child.on("error", reject);
      child.on("close", code => {
        if (code === 0 && fs.existsSync(outputFile)) return resolve();
        reject(new Error(stderr || `piper exited with code ${code}`));
      });
      child.stdin.write(item.text);
      child.stdin.end();
    });

    addUsage("piper", item.chars);
    return { file: outputFile, url: `${GENERATED_PUBLIC_URL}/${fileName}`, soundSystemFile: `${GENERATED_SOUND_SYSTEM_PREFIX}/${fileName}`, engine: "piper", voice: voiceId, label: vc.label || voiceId };
  }

  async function synthesize(item) {
    let { id: voiceId, cfg: vc } = voiceConfig(item.voice);
    if (!vc) throw new Error(`unknown_voice_${voiceId}`);

    try {
      if (vc.engine === "google") return await synthesizeGoogle(item, voiceId, vc);
      if (vc.engine === "piper") return await synthesizePiper(item, voiceId, vc);
      throw new Error(`unknown_engine_${vc.engine}`);
    } catch (firstErr) {
      const fallbackId = config.fallbackVoice;
      if (fallbackId && fallbackId !== voiceId) {
        const fb = voiceConfig(fallbackId);
        if (fb.cfg) {
          try {
            if (fb.cfg.engine === "google") return await synthesizeGoogle(item, fb.id, fb.cfg);
            if (fb.cfg.engine === "piper") return await synthesizePiper(item, fb.id, fb.cfg);
          } catch (fallbackErr) {
            throw new Error(`${firstErr.message}; fallback_failed: ${fallbackErr.message}`);
          }
        }
      }
      throw firstErr;
    }
  }

  function publicItem(item) {
    return {
      id: item.id,
      user: item.displayName,
      role: item.role,
      text: item.text,
      chars: item.chars,
      voice: item.voice,
      engine: item.engineUsed || null,
      priority: item.priority,
      createdAt: item.createdAt,
      audioUrl: item.audioUrl || null,
      audioFile: item.audioFile || null,
      durationMs: item.durationMs || 0,
      durationOk: !!item.durationOk,
      durationSource: item.durationSource || ""
    };
  }

  function publicStatus() {
    normalizeUsageDate();
    return {
      ok: true,
      enabled: Boolean(state.enabled && config.enabled),
      playing,
      current: current ? publicItem(current) : null,
      queueSize: queue.length,
      queueMax: Number(config.queue?.maxSize || 8),
      queue: queue.map(publicItem),
      usage: state.usage,
      limits: config.limits,
      roles: Object.fromEntries(Object.entries(config.roles || {}).map(([role, rc]) => [role, {
        enabled: rc.enabled,
        voice: rc.voice,
        maxLength: rc.maxLength,
        userCooldownSeconds: rc.userCooldownSeconds,
        globalCooldownSeconds: rc.globalCooldownSeconds,
        priority: rc.priority
      }])),
      mutes: Object.keys(state.sessionMutes || {}),
      bans: Object.keys(bans.users || {})
    };
  }

  function publicOverlayItem(item) {
    if (!item) return null;
    const now = Date.now();
    const durationMs = Number(item.durationMs || 0);
    const displayStartedAtMs = Number(item.displayStartedAtMs || item.startedAtMs || item.createdAtMs || now);
    const displayEndsAtMs = Number(item.displayEndsAtMs || (displayStartedAtMs + Math.max(1200, durationMs + Number(config.queue?.gapAfterMs || 350) + 500)));
    return {
      id: item.id,
      user: item.displayName,
      role: item.role,
      text: item.text,
      chars: item.chars,
      voice: item.voiceUsed || item.voice,
      voiceLabel: item.voiceLabel || '',
      engine: item.engineUsed || null,
      playbackMode: item.playbackMode || 'overlay',
      visualOnly: item.playbackMode === 'sound_system' || item.playbackMode === 'off',
      durationMs,
      startedAt: item.displayStartedAt || item.createdAt || null,
      endsAt: item.displayEndsAt || null,
      displayStartedAtMs,
      displayEndsAtMs,
      remainingMs: Math.max(0, displayEndsAtMs - now)
    };
  }

  function publicOverlayState() {
    const item = playing && current ? publicOverlayItem(current) : null;
    return {
      ok: true,
      module: 'tts_system',
      overlay: true,
      show: Boolean(item),
      playing: Boolean(playing),
      item,
      queueSize: queue.length,
      updatedAt: core.nowIso()
    };
  }

  function broadcastState() {
    broadcastWS({ op: "tts_state", data: publicStatus() });
  }

  function sortQueue() {
    queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAtMs - b.createdAtMs;
    });
  }

  async function startNext() {
    if (playing || current || queue.length === 0) {
      broadcastState();
      return;
    }

    sortQueue();
    const item = queue.shift();
    current = item;
    playing = true;

    try {
      const audio = await synthesize(item);
      item.audioFile = audio.file;
      item.audioUrl = audio.url;
      item.soundSystemFile = audio.soundSystemFile || "";
      item.engineUsed = audio.engine;
      item.voiceUsed = audio.voice;
      item.voiceLabel = audio.label;
      const duration = readAudioDurationMs(item.audioFile, item.chars);
      item.durationMs = duration.durationMs;
      item.durationOk = duration.durationOk;
      item.durationSource = duration.source;

      const chatCfg = getChatTtsConfig();
      const alertWaitResult = await waitForChatTtsPlaybackSlot(item, chatCfg);
      if (alertWaitResult && alertWaitResult.waited) item.alertWaitResult = alertWaitResult;

      item.startedAtMs = Date.now();
      item.displayStartedAtMs = item.startedAtMs;
      item.displayStartedAt = core.nowIso();
      insertTtsEvent(item, "playing", { startedAt: item.displayStartedAt, durationMs: item.durationMs, meta: { alertWaitResult } });
      recordUsageDaily(item.source || "chat", item.mode || "chat", item.engineUsed || "", item.chars, item.durationMs, true);

      const playbackMode = normalizePlaybackMode(chatCfg.playbackMode, 'sound_system');
      item.playbackMode = playbackMode;

      let effectiveMode = item.playbackMode || playbackMode;
      let visualOnly = effectiveMode === 'sound_system' || effectiveMode === 'off';
      const visualGapMs = Number(config.queue?.gapAfterMs || 350);
      const doneBufferMs = Number(chatCfg.doneExtraBufferMs || 0);
      item.displayEndsAtMs = item.displayStartedAtMs + Math.max(1200, Number(item.durationMs || 0) + visualGapMs + doneBufferMs + 250);
      item.displayEndsAt = new Date(item.displayEndsAtMs).toISOString();

      if (chatCfg.overlayVisualEnabled !== false || effectiveMode === 'overlay') {
        broadcastWS({
          op: "tts_play",
          item: publicItem(item),
          audioUrl: effectiveMode === 'overlay' ? item.audioUrl : '',
          playbackMode: effectiveMode,
          visualOnly,
          durationMs: Number(item.durationMs || 0),
          gapAfterMs: Number(config.queue?.gapAfterMs || 350)
        });
      }

      if (playbackMode === 'sound_system' && chatCfg.soundSystemEnabled) {
        try {
          playChatTtsViaSoundSystem(item, chatCfg)
            .then(soundResult => {
              item.soundSystemResult = soundResult || null;
              insertTtsEvent(item, 'sound_system_started', { meta: { soundResult } });
            })
            .catch(soundErr => {
              console.error(`[TTS] sound-system playback failed: ${soundErr.message}`);
              item.soundSystemError = soundErr.message || String(soundErr);
              insertTtsEvent(item, 'sound_system_failed', { error: item.soundSystemError });
            });
        } catch (soundErr) {
          console.error(`[TTS] sound-system playback dispatch failed: ${soundErr.message}`);
          item.soundSystemError = soundErr.message || String(soundErr);
          insertTtsEvent(item, 'sound_system_failed', { error: item.soundSystemError });
          if (chatCfg.fallbackToOverlay) {
            effectiveMode = 'overlay';
            item.playbackMode = 'overlay';
            visualOnly = false;
            broadcastWS({
              op: "tts_play",
              item: publicItem(item),
              audioUrl: item.audioUrl,
              playbackMode: 'overlay',
              visualOnly: false,
              durationMs: Number(item.durationMs || 0),
              gapAfterMs: Number(config.queue?.gapAfterMs || 350)
            });
          } else {
            throw soundErr;
          }
        }
      }

      if (effectiveMode === 'sound_system') {
        if (chatCfg.doneMode === 'sound_system_status') {
          waitForSoundSystemFinish(item, chatCfg);
        } else {
          const waitMs = Math.max(250, Number(item.durationMs || 0) + Number(chatCfg.doneExtraBufferMs || 0));
          setTimeout(() => finishCurrentById(item.id, 'sound_system_timer'), waitMs).unref?.();
        }
      } else if (effectiveMode === 'off') {
        const waitMs = Math.max(250, Number(item.durationMs || 0) + Number(chatCfg.doneExtraBufferMs || 0));
        setTimeout(() => finishCurrentById(item.id, 'off_timer'), waitMs).unref?.();
      }

      broadcastState();
    } catch (err) {
      console.error(`[TTS] synth failed: ${err.message}`);
      item.error = err.message;
      insertTtsEvent(item, "failed", { error: err.message, finishedAt: core.nowIso() });
      recordUsageDaily(item.source || "chat", item.mode || "chat", item.engineUsed || "", item.chars, 0, false);
      broadcastWS({ op: "tts_error", error: err.message, item: publicItem(item) });
      current = null;
      playing = false;
      setTimeout(startNext, 250);
    }
  }

  function enqueue(item) {
    insertTtsEvent(item, "queued");
    queue.push(item);
    sortQueue();
    setTimeout(startNext, 10);
  }

  function sayWithData(data) {
    normalizeUsageDate();
    const role = resolveRole(data);
    const rc = roleConfig(role);
    const user = userKey(data);
    const name = displayName(data);
    const text = sanitizeText(data.text || data.message || data.input || data.rawInput || "");

    if (!state.enabled || !config.enabled) {
      return { ok: false, reason: "tts_disabled", chat: msg("ttsDisabled") };
    }

    if (isBanned(user)) {
      return { ok: false, reason: "user_banned", chat: msg("bannedUser") };
    }

    if (isMuted(user)) {
      return { ok: false, reason: "user_muted", chat: msg("mutedUser") };
    }

    if (!rc.enabled) {
      return { ok: false, reason: "role_not_allowed", role, chat: msg("notAllowed") };
    }

    if (config.text?.blockEmpty && !text) {
      return { ok: false, reason: "empty_text", chat: msg("missingText") };
    }

    const maxLength = Number(rc.maxLength || 120);
    if (text.length > maxLength) {
      return { ok: false, reason: "text_too_long", maxLength, chars: text.length, chat: msg("tooLong", { maxLength }) };
    }

    const maxQueue = Number(config.queue?.maxSize || 8);
    if (queue.length >= maxQueue) {
      return { ok: false, reason: "queue_full", queueSize: queue.length, chat: msg("queueFull") };
    }

    const cd = checkCooldown(role, user);
    if (!cd.ok) {
      return { ok: false, reason: cd.reason, waitSeconds: cd.waitSeconds, chat: msg("cooldown", { seconds: cd.waitSeconds }) };
    }

    const voiceId = String(data.voice || rc.voice || config.defaultVoice || "google_wavenet_h");
    const voice = voiceConfig(voiceId);
    if (!voice.cfg) {
      return { ok: false, reason: "voice_not_found", chat: msg("cloudUnavailable") };
    }

    if (voice.cfg.engine === "google") {
      const ga = googleAvailable(voice.cfg);
      const limit = canUseGoogle(text.length);
      if (!ga.ok || !limit.ok) {
        const fb = voiceConfig(config.fallbackVoice);
        const fbOk = fb.cfg?.engine === "piper" ? piperAvailable(fb.cfg) : { ok: false, reason: "no_piper_fallback" };
        if (!fbOk.ok && config.rejectWhenFallbackUnavailable) {
          return { ok: false, reason: `cloud_unavailable_${ga.reason || limit.reason}_fallback_${fbOk.reason}`, chat: msg("cloudUnavailable") };
        }
      }
    }

    const item = {
      id: makeId(),
      user,
      displayName: name,
      role,
      text,
      chars: text.length,
      voice: voiceId,
      priority: Number(rc.priority || 10),
      createdAt: core.nowIso(),
      createdAtMs: Date.now(),
      source: String(data.source || "chat"),
      mode: String(data.mode || "chat"),
      meta: data.meta && typeof data.meta === "object" ? data.meta : {}
    };

    touchCooldown(role, user);
    enqueue(item);
    const pos = queue.findIndex(x => x.id === item.id) + 1;
    return { ok: true, item: publicItem(item), queuePosition: pos > 0 ? pos : 0, chat: msg("ttsQueued") };
  }

  function done(req, res) {
    const data = getRequestData(req);
    const id = String(data.id || "");
    if (finishCurrentById(id, 'overlay_done')) {
      return res.json({ ok: true, nextQueueSize: queue.length });
    }
    res.json({ ok: true, ignored: true, current: current ? current.id : null });
  }

  function setEnabled(value) {
    state.enabled = Boolean(value);
    saveState();
    broadcastState();
  }

  function stopCurrent() {
    broadcastWS({ op: "tts_stop" });
    current = null;
    playing = false;
    saveState();
    broadcastState();
  }

  function clearQueue(stopAlso) {
    queue.length = 0;
    if (stopAlso) stopCurrent();
    broadcastState();
  }

  function formatNameList(obj, emptyText) {
    const values = Object.values(obj || {}).map(x => x.displayName || x.login).filter(Boolean);
    if (values.length === 0) return emptyText;
    const shown = values.slice(0, 5).join(", ");
    return values.length > 5 ? `${shown} +${values.length - 5} weitere` : shown;
  }

  function splitTargetAndReason(rest) {
    const parts = String(rest || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { target: "", reason: "" };
    const targetRaw = parts.shift();
    return { target: normalizeLogin(targetRaw), display: targetRaw.replace(/^@+/, ""), reason: parts.join(" ").trim() };
  }

  function handleSubcommand(command, rest, data) {
    const actorRole = resolveRole(data);
    const actorLogin = userKey(data);
    const actorName = displayName(data);

    if (!canRunSubcommand(actorRole, command, actorLogin)) {
      return { ok: false, reason: "no_permission", chat: msg("noPermission") };
    }

    if (command === "on") {
      setEnabled(true);
      return { ok: true, chat: msg("systemOn") };
    }

    if (command === "off") {
      setEnabled(false);
      return { ok: true, chat: msg("systemOff") };
    }

    if (command === "status") {
      const s = publicStatus();
      return {
        ok: true,
        status: s,
        chat: msg("status", {
          enabledText: s.enabled ? "aktiv" : "abgeschaltet",
          queueCount: s.queueSize,
          queueMax: s.queueMax,
          dailyChars: s.usage.googleDailyCharacters,
          dailyLimit: s.limits.googleDailyCharacterLimit,
          monthlyChars: s.usage.googleMonthlyCharacters,
          monthlyLimit: s.limits.googleMonthlyCharacterLimit
        })
      };
    }

    if (command === "debug") {
      const s = publicStatus();
      const full = String(rest || "").trim().toLowerCase() === "full";
      const currentText = s.current
        ? `${s.current.user}/${s.current.role}/${s.current.voice}/${s.current.chars} Zeichen`
        : "none";
      const rolesText = Object.entries(s.roles || {})
        .filter(([role, rc]) => role !== "viewer" && rc && rc.enabled)
        .map(([role, rc]) => `${role}:${rc.maxLength}/${rc.userCooldownSeconds}s`)
        .join(", ");
      const vars = {
        enabledText: s.enabled ? "ja" : "nein",
        playingText: s.playing ? "ja" : "nein",
        currentText,
        queueCount: s.queueSize,
        queueMax: s.queueMax,
        googleDaily: s.usage.googleDailyCharacters || 0,
        googleDailyLimit: s.limits.googleDailyCharacterLimit || 0,
        googleMonthly: s.usage.googleMonthlyCharacters || 0,
        googleMonthlyLimit: s.limits.googleMonthlyCharacterLimit || 0,
        piperDaily: s.usage.piperDailyCharacters || 0,
        piperMonthly: s.usage.piperMonthlyCharacters || 0,
        requestsToday: s.usage.totalRequestsToday || 0,
        requestsMonth: s.usage.totalRequestsMonth || 0,
        muteCount: (s.mutes || []).length,
        banCount: (s.bans || []).length,
        rolesText
      };
      return { ok: true, status: s, chat: msg(full ? "debugFull" : "debug", vars) };
    }

    if (command === "stop") {
      stopCurrent();
      setTimeout(startNext, 250);
      return { ok: true, chat: msg("stop") };
    }

    if (command === "clear") {
      clearQueue(false);
      return { ok: true, chat: msg("clear") };
    }

    if (command === "reload") {
      reloadAllConfig();
      cleanupGeneratedFiles();
      broadcastState();
      return { ok: true, chat: "🔁 Die Heimleitung hat die TTS-Akten neu geladen." };
    }

    if (command === "help") {
      return { ok: true, chat: msg("help") };
    }

    if (command === "list") {
      const mutes = formatNameList(state.sessionMutes, "keine");
      const banList = formatNameList(bans.users, "keine");
      const isEmpty = Object.keys(state.sessionMutes || {}).length === 0 && Object.keys(bans.users || {}).length === 0;
      return { ok: true, chat: isEmpty ? msg("listEmpty") : msg("list", { mutes, bans: banList }) };
    }

    if (["mute", "unmute", "ban", "unban"].includes(command)) {
      const parsed = splitTargetAndReason(rest);
      if (!parsed.target) return { ok: false, reason: "missing_user", chat: msg("missingUser") };
      const target = parsed.target;
      const display = parsed.display || parsed.target;

      if (command === "mute") {
        if (state.sessionMutes[target]) return { ok: false, reason: "already_muted", chat: msg("alreadyMuted", { user: display }) };
        state.sessionMutes[target] = {
          login: target,
          displayName: display,
          reason: parsed.reason,
          mutedBy: actorName,
          mutedByLogin: actorLogin,
          mutedAt: core.nowIso()
        };
        saveState();
        return { ok: true, chat: msg("muteSuccess", { user: display }) };
      }

      if (command === "unmute") {
        if (!state.sessionMutes[target]) return { ok: false, reason: "not_muted", chat: msg("notMuted", { user: display }) };
        delete state.sessionMutes[target];
        saveState();
        return { ok: true, chat: msg("unmuteSuccess", { user: display }) };
      }

      if (command === "ban") {
        if (bans.users[target]) return { ok: false, reason: "already_banned", chat: msg("alreadyBanned", { user: display }) };
        bans.users[target] = {
          login: target,
          displayName: display,
          reason: parsed.reason,
          bannedBy: actorName,
          bannedByLogin: actorLogin,
          bannedAt: core.nowIso()
        };
        saveBans();
        return { ok: true, chat: msg("banSuccess", { user: display }) };
      }

      if (command === "unban") {
        if (!bans.users[target]) return { ok: false, reason: "not_banned", chat: msg("notBanned", { user: display }) };
        delete bans.users[target];
        saveBans();
        return { ok: true, chat: msg("unbanSuccess", { user: display }) };
      }
    }

    return { ok: false, reason: "unknown_command", chat: msg("unknownCommand") };
  }

  async function prepareAlertTts(data) {
    normalizeUsageDate();
    const systemCfg = config.system || {};
    const alertCfg = config.alertTts || {};
    const rawText = String(data.text || data.message || data.input || '').trim();
    const text = sanitizeText(rawText);
    const maxLength = Number(data.maxChars || alertCfg.maxChars || systemCfg.maxLength || 500);

    if (alertCfg.enabled === false || systemCfg.enabled === false) return { ok: false, enabled: false, reason: 'alert_tts_disabled' };
    if (!text) return { ok: false, enabled: false, reason: 'empty_text' };
    if (text.length > maxLength) return { ok: false, enabled: false, reason: 'text_too_long', maxLength, chars: text.length };
    if (systemCfg.respectGlobalEnabled !== false && (!state.enabled || !config.enabled)) return { ok: false, enabled: false, reason: 'tts_disabled' };

    const voiceId = String(data.voice || alertCfg.voice || systemCfg.voice || config.defaultVoice || 'google_wavenet_h');
    const item = {
      id: makeId(),
      user: normalizeLogin(data.userLogin || data.user || systemCfg.user || 'alert_system') || 'alert_system',
      displayName: String(data.displayName || data.userDisplay || data.user || systemCfg.displayName || 'Alert-System'),
      role: 'system',
      text,
      chars: text.length,
      voice: voiceId,
      priority: Number(systemCfg.priority || 95),
      createdAt: core.nowIso(),
      createdAtMs: Date.now(),
      source: String(data.source || 'alert'),
      mode: 'alert',
      meta: data.meta && typeof data.meta === 'object' ? data.meta : {}
    };

    insertTtsEvent(item, 'preparing');

    try {
      const audio = await synthesize(item);
      item.audioFile = audio.file;
      item.audioUrl = audio.url;
      item.soundSystemFile = audio.soundSystemFile || "";
      item.engineUsed = audio.engine;
      item.voiceUsed = audio.voice;
      item.voiceLabel = audio.label;
      const duration = readAudioDurationMs(item.audioFile, item.chars);
      item.durationMs = duration.durationMs;
      item.durationOk = duration.durationOk;
      item.durationSource = duration.source;
      const delayAfterSoundMs = Math.max(0, Number(data.delayAfterSoundMs ?? alertCfg.delayAfterSoundMs ?? 0) || 0);
      const startAfterMs = Math.max(0, Number(data.startAfterMs || 0) || 0) + delayAfterSoundMs;
      const result = {
        ok: true,
        enabled: true,
        id: item.id,
        text: item.text,
        chars: item.chars,
        audioUrl: item.audioUrl,
        audioFile: item.audioFile,
        soundSystemFile: item.soundSystemFile || "",
        durationMs: item.durationMs,
        durationOk: item.durationOk,
        durationSource: item.durationSource,
        voice: item.voiceUsed,
        voiceLabel: item.voiceLabel,
        engine: item.engineUsed,
        startAfterMs,
        endsAfterMs: startAfterMs + item.durationMs,
        outroBufferMs: Math.max(0, Number(data.outroBufferMs ?? alertCfg.outroBufferMs ?? 900) || 0)
      };
      insertTtsEvent(item, 'prepared', { durationMs: item.durationMs, finishedAt: core.nowIso(), meta: result });
      recordUsageDaily(item.source, item.mode, item.engineUsed || '', item.chars, item.durationMs, true);
      return result;
    } catch (err) {
      item.error = err.message || String(err);
      insertTtsEvent(item, 'failed', { error: item.error, finishedAt: core.nowIso() });
      recordUsageDaily(item.source, item.mode, '', item.chars, 0, false);
      return { ok: false, enabled: true, reason: 'synthesize_failed', error: item.error };
    }
  }

  function listEvents(filter = {}) {
    if (!dbReady()) return { ok: false, error: 'database_unavailable', rows: [] };
    const limit = Math.max(1, Math.min(500, Number(filter.limit || 100)));
    const source = String(filter.source || '').trim();
    const mode = String(filter.mode || '').trim();
    const where = [];
    const params = { limit };
    if (source) { where.push('source = :source'); params.source = source; }
    if (mode) { where.push('mode = :mode'); params.mode = mode; }
    const rows = database.all(`SELECT * FROM tts_events ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT :limit`, params);
    return { ok: true, rows, count: rows.length };
  }

  function stats() {
    if (!dbReady()) return { ok: false, error: 'database_unavailable' };
    const usage = database.all(`SELECT * FROM tts_usage_daily ORDER BY usage_date DESC, source ASC, mode ASC, engine ASC LIMIT 500`);
    const totals = database.get(`SELECT COUNT(*) AS events, COALESCE(SUM(chars),0) AS chars, COALESCE(SUM(duration_ms),0) AS durationMs FROM tts_events`);
    const recent = database.all(`SELECT source, mode, status, COUNT(*) AS count FROM tts_events GROUP BY source, mode, status ORDER BY count DESC`);
    return { ok: true, totals, usage, byStatus: recent };
  }


  function statsUsers(filter = {}) {
    if (!dbReady()) return { ok: false, error: 'database_unavailable', rows: [] };

    const range = String(filter.range || filter.period || 'all').trim().toLowerCase();
    const source = String(filter.source || '').trim();
    const mode = String(filter.mode || '').trim();
    const role = String(filter.role || filter.roleKey || '').trim();
    const engine = String(filter.engine || '').trim();
    const status = String(filter.status || '').trim();
    const limit = Math.max(1, Math.min(500, Number(filter.limit || 100)));
    const sort = String(filter.sort || 'requests').trim().toLowerCase();

    const where = ["COALESCE(user_login, '') <> ''"];
    const params = { limit };

    function isoDaysAgo(days) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }

    function isoTodayStart() {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }

    function isoMonthStart() {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }

    if (range === 'today' || range === 'day') {
      where.push('created_at >= :fromDate');
      params.fromDate = isoTodayStart();
    } else if (range === '7d' || range === 'week') {
      where.push('created_at >= :fromDate');
      params.fromDate = isoDaysAgo(7);
    } else if (range === '30d' || range === 'month30') {
      where.push('created_at >= :fromDate');
      params.fromDate = isoDaysAgo(30);
    } else if (range === 'month') {
      where.push('created_at >= :fromDate');
      params.fromDate = isoMonthStart();
    }

    if (source) { where.push('source = :source'); params.source = source; }
    if (mode) { where.push('mode = :mode'); params.mode = mode; }
    if (role) { where.push('role_key = :role'); params.role = role; }
    if (engine) { where.push('engine = :engine'); params.engine = engine; }
    if (status) { where.push('status = :status'); params.status = status; }

    const orderBy = {
      requests: 'requestsTotal DESC, lastUsedAt DESC',
      chars: 'charsTotal DESC, requestsTotal DESC',
      duration: 'durationMsTotal DESC, requestsTotal DESC',
      failed: 'requestsFailed DESC, requestsTotal DESC',
      google: 'googleRequests DESC, requestsTotal DESC',
      piper: 'piperRequests DESC, requestsTotal DESC',
      last: 'lastUsedAt DESC',
      user: 'userDisplay COLLATE NOCASE ASC'
    }[sort] || 'requestsTotal DESC, lastUsedAt DESC';

    const queryParams = { ...params };
    const aggregateParams = { ...params };
    delete aggregateParams.limit;

    const rows = database.all(`
      SELECT
        user_login AS userLogin,
        COALESCE(NULLIF(MAX(user_display), ''), user_login) AS userDisplay,
        COALESCE(NULLIF(MAX(role_key), ''), '') AS roleKey,
        COUNT(*) AS requestsTotal,
        SUM(CASE WHEN status LIKE '%failed%' OR status LIKE '%timeout%' THEN 0 ELSE 1 END) AS requestsOk,
        SUM(CASE WHEN status LIKE '%failed%' OR status LIKE '%timeout%' THEN 1 ELSE 0 END) AS requestsFailed,
        COALESCE(SUM(chars), 0) AS charsTotal,
        COALESCE(SUM(duration_ms), 0) AS durationMsTotal,
        SUM(CASE WHEN engine = 'google' THEN 1 ELSE 0 END) AS googleRequests,
        SUM(CASE WHEN engine = 'piper' THEN 1 ELSE 0 END) AS piperRequests,
        SUM(CASE WHEN source = 'chat' THEN 1 ELSE 0 END) AS chatRequests,
        SUM(CASE WHEN source = 'dashboard' THEN 1 ELSE 0 END) AS dashboardRequests,
        SUM(CASE WHEN source = 'alert' THEN 1 ELSE 0 END) AS alertRequests,
        MIN(created_at) AS firstUsedAt,
        MAX(created_at) AS lastUsedAt
      FROM tts_events
      WHERE ${where.join(' AND ')}
      GROUP BY user_login
      ORDER BY ${orderBy}
      LIMIT :limit
    `, queryParams);

    const totals = database.get(`
      SELECT
        COUNT(*) AS requestsTotal,
        SUM(CASE WHEN status LIKE '%failed%' OR status LIKE '%timeout%' THEN 0 ELSE 1 END) AS requestsOk,
        SUM(CASE WHEN status LIKE '%failed%' OR status LIKE '%timeout%' THEN 1 ELSE 0 END) AS requestsFailed,
        COALESCE(SUM(chars), 0) AS charsTotal,
        COALESCE(SUM(duration_ms), 0) AS durationMsTotal,
        COUNT(DISTINCT user_login) AS usersTotal,
        SUM(CASE WHEN engine = 'google' THEN 1 ELSE 0 END) AS googleRequests,
        SUM(CASE WHEN engine = 'piper' THEN 1 ELSE 0 END) AS piperRequests
      FROM tts_events
      WHERE ${where.join(' AND ')}
    `, aggregateParams);

    const byRole = database.all(`
      SELECT
        COALESCE(NULLIF(role_key, ''), 'unknown') AS roleKey,
        COUNT(*) AS requestsTotal,
        COALESCE(SUM(chars), 0) AS charsTotal,
        COUNT(DISTINCT user_login) AS usersTotal
      FROM tts_events
      WHERE ${where.join(' AND ')}
      GROUP BY COALESCE(NULLIF(role_key, ''), 'unknown')
      ORDER BY requestsTotal DESC
    `, aggregateParams);

    return {
      ok: true,
      range,
      filters: { source, mode, role, engine, status, sort, limit },
      totals: totals || {},
      byRole,
      rows,
      count: rows.length
    };
  }

  function run(req, res) {
    const data = getRequestData(req);
    const raw = parseRawInput(data);
    const parsed = parseCommand(raw);

    if (parsed.kind === "empty") {
      return res.json({ ok: false, reason: "empty_text", chat: msg("missingText") });
    }

    if (parsed.kind === "admin") {
      return res.json(handleSubcommand(parsed.command, parsed.rest, data));
    }

    return res.json(sayWithData({ ...data, text: parsed.rest }));
  }

  function cleanupGeneratedFiles() {
    const hours = Number(config.queue?.deleteGeneratedAfterHours || 0);
    if (hours <= 0) return;
    const maxAge = hours * 60 * 60 * 1000;
    const now = Date.now();
    try {
      for (const file of fs.readdirSync(GENERATED_DIR)) {
        if (!/^tts_.*\.(mp3|wav)$/i.test(file)) continue;
        const full = path.join(GENERATED_DIR, file);
        const stat = fs.statSync(full);
        if (now - stat.mtimeMs > maxAge) fs.unlinkSync(full);
      }
    } catch (err) {
      console.error(`[TTS] cleanup failed: ${err.message}`);
    }
  }

  // Main endpoints.
  app.all("/api/tts/run", run);
  app.all("/api/tts/say", (req, res) => res.json(sayWithData(getRequestData(req))));
  app.all("/api/tts/done", done);
  app.get("/api/tts/status", (req, res) => res.json(publicStatus()));
  app.get("/api/tts/overlay-state", (req, res) => res.json(publicOverlayState()));

  // Compatibility endpoints.
  app.all("/api/tts/on", (req, res) => res.json(handleSubcommand("on", "", getRequestData(req))));
  app.all("/api/tts/off", (req, res) => res.json(handleSubcommand("off", "", getRequestData(req))));
  app.all("/api/tts/stop", (req, res) => res.json(handleSubcommand("stop", "", getRequestData(req))));
  app.all("/api/tts/clear", (req, res) => res.json(handleSubcommand("clear", "", getRequestData(req))));
  app.all("/api/tts/reload", (req, res) => res.json(handleSubcommand("reload", "", getRequestData(req))));
  app.all("/api/tts/command", (req, res) => {
    const data = getRequestData(req);
    const command = String(data.cmd || data.command || "status").toLowerCase().trim();
    res.json(handleSubcommand(command, String(data.rest || ""), data));
  });

  app.get("/api/tts/settings", (req, res) => res.json(publicSettings()));
  app.post("/api/tts/settings/upsert", (req, res) => {
    try {
      const data = getRequestData(req);
      const key = String(data.key || data.settingKey || '').trim();
      if (key) {
        const value = data.value !== undefined ? data.value : data.setting_value;
        const saved = settingsHelper.setSetting(TTS_SETTINGS_TABLE, key, value, { valueType: data.valueType || data.type || '', description: data.description || '' });
        reloadAllConfig();
        return res.json({ ok: true, setting: sanitizeSettingRowForDashboard(saved), effective: sanitizeForDashboard(config) });
      }
      const settings = data.settings && typeof data.settings === 'object' ? data.settings : {};
      for (const [settingKey, value] of Object.entries(settings)) settingsHelper.setSetting(TTS_SETTINGS_TABLE, settingKey, value);
      reloadAllConfig();
      return res.json(publicSettings());
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'settings_upsert_failed', message: err.message || String(err) });
    }
  });
  app.get("/api/tts/config", (req, res) => res.json(publicConfig()));
  app.get("/api/tts/voices", (req, res) => res.json(publicVoices()));
  app.get("/api/tts/routes", (req, res) => res.json(publicRoutes()));
  app.get("/api/tts/integration-check", (req, res) => res.json(publicIntegrationCheck()));
  app.get("/api/tts/admin/settings", (req, res) => res.json(publicSettings()));
  app.post("/api/tts/admin/settings", upsertSettingFromRequest);
  app.get("/api/tts/admin/texts", (req, res) => {
    try {
      return res.json({ ok: true, module: MODULE_NAME, texts: listAdminTexts() });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "texts_list_failed", message: err.message || String(err) });
    }
  });
  app.post("/api/tts/admin/texts", (req, res) => {
    try {
      return res.json(setAdminTexts(getRequestData(req)));
    } catch (err) {
      return res.status(400).json({ ok: false, error: "texts_update_failed", message: err.message || String(err) });
    }
  });
  app.get("/api/tts/events", (req, res) => res.json(listEvents(req.query || {})));
  app.get("/api/tts/stats", (req, res) => res.json(stats()));
  app.get("/api/tts/stats/users", (req, res) => res.json(statsUsers(req.query || {})));
  app.all("/api/tts/prepare-alert", async (req, res) => res.json(await prepareAlertTts(getRequestData(req))));
  app.all("/api/tts/synthesize", async (req, res) => res.json(await prepareAlertTts({ ...getRequestData(req), source: getRequestData(req).source || 'api', mode: getRequestData(req).mode || 'prepare' })));

  setInterval(() => {
    normalizeUsageDate();
    saveState();
    cleanupGeneratedFiles();
  }, 15 * 60 * 1000).unref?.();

  console.log("[TTS] module ready: /api/tts/run, /api/tts/status, /api/tts/config, /api/tts/voices, /api/tts/routes, /api/tts/integration-check");
  console.log(`[TTS] config dir: ${CONFIG_DIR}`);
}

module.exports = { init };
