"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const media = require("./helpers/helper_media");
const database = require("../core/database");

let communicationBus = null;
try {
  communicationBus = require("./communication_bus");
} catch (_) {
  communicationBus = null;
}

const MODULE_NAME = "sound_system";
const MODULE_VERSION = "0.1.25";
const MODULE_BUILD = "STEP_EVENT_SOUND_3B_COUNTDOWN_TIMING_DEDUPE_FIX";
const SOUND_BUS_CAPABILITY = "sound.event_output";
const SOUND_BUS_COMMAND_CAPABILITY = "sound.command_input";
const SOUND_BUS_STATUS_API_VERSION = "1.0.0";
const SOUND_BUS_COMMAND_API_VERSION = "1.0.0";
const SOUND_BUS_DELIVERY_CLASSIFICATION = "capability_scoped_bus_first_with_legacy_websocket_fallback";
const SOUND_BUS_COMMAND_DELIVERY_CLASSIFICATION = "module_scoped_command_dry_run_plus_play_test_stream";
const SOUND_BUS_TARGET_CAPABILITY = "sound.event_output";
const SOUND_CANBUS_HEARTBEAT_INTERVAL_MS = 5000;
const SOUND_CANBUS_STATUS_INTERVAL_MS = 10000;
const EVENT_RUNTIME_BUS_CAPABILITY = "stream_events.runtime_display";
const EVENT_RUNTIME_BUS_CHANNEL = "stream_events.runtime";
const CONFIG_FILE = "sound_system.json";
const MESSAGES_FILE = "messages/sound_system.json";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  legacy: false,
  statusApiVersion: SOUND_BUS_STATUS_API_VERSION,
  commandApiVersion: SOUND_BUS_COMMAND_API_VERSION,
  routesPrefix: ["/api/sound"],
  capabilities: [SOUND_BUS_CAPABILITY, SOUND_BUS_COMMAND_CAPABILITY],
  deliveryClassification: SOUND_BUS_DELIVERY_CLASSIFICATION,
  commandDeliveryClassification: SOUND_BUS_COMMAND_DELIVERY_CLASSIFICATION,
  bus: { emits: true, registered: true, heartbeat: true, status: true },
  note: "EVENT-SOUND-3B: Timing-/Dedupe-Fix fuer kontrollierten EventSound-Countdown; normale Sound-Flows bleiben unveraendert."
};

const DEFAULT_OUTPUT = {
  defaultTarget: "overlay",
  allowPerSoundOverride: true,
  targets: {
    overlay: { enabled: true, label: "OBS Overlay", mode: "browser_overlay", overlayUrl: "/overlays/sound_system_overlay.html", defaultVolume: 85 },
    device: { enabled: true, label: "AudiogerÃ¤t", mode: "local_device", selectedDeviceId: "default", selectedDeviceName: "Windows StandardgerÃ¤t", defaultVolume: 80, helper: { enabled: true, path: "tools/audio-device-helper/dist/AudioDeviceHelper.exe", timeoutMs: 30000, playbackMode: "auto" } },
    both: { enabled: false, label: "Overlay + AudiogerÃ¤t", mode: "combined", defaultVolume: 85 }
  }
};

const DEFAULT_CONFIG = {
  enabled: true,
  version: MODULE_VERSION,
  routes: { prefix: "/api/sound" },
  websocket: { enabled: true, op: "sound_system" },
  soundBus: {
    enabled: true,
    mode: "bus_first",
    legacyFallback: true,
    channel: "sound",
    requireAck: false,
    replayable: false,
    ttlMs: 30000,
    targetType: "all",
    targetId: "*",
    targetModule: "",
    targetCapability: SOUND_BUS_TARGET_CAPABILITY,
    includeState: true,
    includeItem: true,
    actions: {
      state: "state.updated",
      test: "test",
      queued: "queued",
      queueUpdated: "queue.updated",
      starting: "starting",
      started: "started",
      finished: "finished",
      stopped: "stopped",
      skipped: "skipped",
      cleared: "cleared",
      paused: "paused",
      resumed: "resumed",
      failed: "failed",
      bundleQueued: "bundle.queued",
      bundleLockStarted: "bundle.lock_started",
      bundleLockFinished: "bundle.lock_finished",
      deviceStarted: "device.started",
      deviceFinished: "device.finished",
      deviceFailed: "device.failed",
      discordStarted: "discord.started",
      discordQueued: "discord.queued",
      discordFailed: "discord.failed",
      clientReady: "client.ready",
      clientAudioStarted: "client.audio_started",
      clientAudioEnded: "client.audio_ended",
      clientError: "client.error"
    }
  },
  eventPreRoll: {
    enabled: true,
    maxSeconds: 10,
    fallbackSeconds: 3,
    runtimeOverlayCapability: EVENT_RUNTIME_BUS_CAPABILITY,
    runtimeChannel: EVENT_RUNTIME_BUS_CHANNEL,
    hideOnAudioEnded: true
  },
  soundBusCommand: {
    enabled: true,
    channel: "sound.command",
    action: "play.request.test",
    requireAck: false,
    replayable: false,
    ttlMs: 30000,
    targetType: "module",
    targetId: "sound_system",
    targetModule: "sound_system",
    targetCapability: SOUND_BUS_COMMAND_CAPABILITY,
    mode: "dry_run",
    consumerMode: "dry_run",
    allowQueueTouch: false,
    allowAudioTouch: false
  },
  overlay: { enabled: true, clientRequired: true, fallbackFinishMs: 12000, introMs: 0, outroMs: 350, gapBetweenSoundsMs: 750 },
  output: DEFAULT_OUTPUT,
  queue: {
    enabled: true,
    maxLength: 50,
    dropWhenFull: true,
    defaultPriority: 50,
    sortByPriority: true,
    allowParallel: true,
    maxParallel: 3,
    parallelCategories: ["system", "admin", "ui", "test"],
    parallelSoundIds: [],
    alertSync: { enabled: true, visualLeadMs: 150, maxVisualLeadMs: 500 },
    interruptRules: { enabled: true, minPriority: 100, requireHigherPriority: true, allowForce: true, allowOverride: false },
    dropRules: { enabled: true, dropIfQueueFullBelowPriority: 40, dropIfBusyBelowPriority: 20 },
    cooldowns: { enabled: true, defaultMs: 0, sameSoundMs: 3000, sameCategoryMs: 0, sameUserMs: 0 },
    dedupe: { enabled: true, sameSoundWindowMs: 3000, sameUserSoundWindowMs: 5000 }
  },
  targets: {
    stream: { enabled: true, defaultVolume: 85 },
    discord: { enabled: false, defaultVolume: 80 },
    both: { enabled: false, defaultVolume: 85 }
  },
  discordRouting: {
    enabled: true,
    mode: "category_or_source",
    target: "both",
    overrideExplicitTarget: false,
    categories: ["alert", "alert_critical", "channel_reward", "vip", "crew", "special", "tts"],
    sources: ["alert_system", "alert_tts", "soundalerts", "sound_alerts", "channel_reward", "vip_mod", "vip_sound_overlay", "tts_system", "tts"]
  },
  defaults: {
    target: "stream",
    outputTarget: "overlay",
    category: "fun",
    priority: 50,
    volume: 85,
    canInterrupt: false,
    canBeInterrupted: true,
    queueIfBusy: true,
    dropIfBusy: false,
    parallelAllowed: false,
    cooldownMs: 0
  },
  priorities: {
    admin: 100,
    system: 100,
    alert_critical: 90,
    alert: 80,
    channel_reward: 70,
    vip: 60,
    crew: 60,
    special: 60,
    tts: 50,
    fun: 50,
    background: 20,
    decor: 20
  },
  categoryDefaults: {
    alert: { priority: 80, canInterrupt: false, canBeInterrupted: false, queueIfBusy: true, dropIfBusy: false, parallelAllowed: false },
    alert_critical: { priority: 90, canInterrupt: false, canBeInterrupted: false, queueIfBusy: true, dropIfBusy: false, parallelAllowed: false },
    admin: { priority: 100, canInterrupt: true, canBeInterrupted: false, queueIfBusy: false, dropIfBusy: false, parallelAllowed: true },
    system: { priority: 100, canInterrupt: true, canBeInterrupted: false, queueIfBusy: false, dropIfBusy: false, parallelAllowed: true },
    vip: { priority: 60, canInterrupt: false, canBeInterrupted: true, queueIfBusy: true, dropIfBusy: false, parallelAllowed: false },
    fun: { priority: 50, canInterrupt: false, canBeInterrupted: true, queueIfBusy: true, dropIfBusy: false, parallelAllowed: false },
    background: { priority: 20, canInterrupt: false, canBeInterrupted: true, queueIfBusy: true, dropIfBusy: true, parallelAllowed: false }
  },
  soundsBaseDir: "htdocs/assets/sounds",
  allowedExtensions: [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".mp4"],
  sounds: []
};

const DEFAULT_LEVEL_CORRECTION_SETTINGS = {
  enabled: false,
  mode: "off",
  targetLufs: -18,
  truePeakLimitDbtp: -1.5,
  maxPlaybackVolume: 80,
  minPlaybackVolume: 35,
  maxBoostDb: 3,
  maxCutDb: 12,
  strengthPercent: 50,
  protectTruePeak: true,
  excludeTts: true,
  applyToTargets: ["stream", "discord", "both", "device", "overlay"]
};
const LEVEL_CORRECTION_SETTINGS_TABLE = "sound_loudness_settings";
const LEVEL_CORRECTION_FILES_TABLE = "sound_loudness_files";
const LEVEL_CORRECTION_EXCLUDED_SEGMENTS = ["tts", "tts_system", "alert_tts", "generated_tts", "temp_tts", "tts_cache"];

const DEFAULT_MESSAGES = {
  moduleReady: "Sound-System bereit.",
  systemDisabled: "Sound-System ist deaktiviert.",
  soundQueued: "Sound wurde in die Warteschlange gelegt.",
  soundStarted: "Sound wird abgespielt.",
  soundStopped: "Sound-Ausgabe wurde gestoppt.",
  soundSkipped: "Aktueller Sound wurde Ã¼bersprungen.",
  queueCleared: "Sound-Warteschlange wurde geleert.",
  configReloaded: "Sound-System Config wurde neu geladen.",
  soundNotFound: "Sound wurde nicht gefunden.",
  soundFileMissing: "Sound-Datei wurde nicht gefunden.",
  queueFull: "Sound-Warteschlange ist voll.",
  targetDisabled: "Dieses Sound-Ziel ist deaktiviert.",
  clientMissing: "Sound-Overlay ist noch nicht verbunden."
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.init = function init(ctx) {
  const { app, broadcastWS } = ctx;
  database.ensureReady(ctx);
  // sound_settings schema is ensured lazily after constants are initialized.

  const state = {
    module: MODULE_NAME,
    version: DEFAULT_CONFIG.version,
    loadedAt: core.nowIso(),
    configPath: "",
    messagesPath: "",
    configOk: false,
    messagesOk: false,
    configError: "",
    messagesError: "",
    current: null,
    parallel: [],
    queue: [],
    enabled: true,
    paused: false,
    updatedAt: core.nowIso(),
    client: { connected: false, lastSeenAt: 0, lastEvent: "" },
    device: { lastOk: false, lastAt: 0, lastError: "", lastResult: null },
    discord: { lastOk: false, lastAt: 0, lastError: "", lastResult: null },
    stats: { started: 0, queued: 0, stopped: 0, skipped: 0, cleared: 0, failed: 0, deviceStarted: 0, deviceFailed: 0, discordStarted: 0, discordFailed: 0, parallelStarted: 0, bundlesQueued: 0, bundleItemsQueued: 0, levelCorrected: 0, levelCorrectionSkipped: 0, levelCorrectionFailed: 0 },
    soundBus: {
      emitted: 0,
      skipped: 0,
      errors: 0,
      lastReason: "",
      lastAction: "",
      lastEventId: "",
      lastResult: null,
      lastError: "",
      lastAt: "",
      recentEvents: []
    },
    canBus: {
      registered: false,
      heartbeatCount: 0,
      statusPublished: 0,
      lastRegisteredAt: "",
      lastHeartbeatAt: "",
      lastStatusAt: "",
      lastError: ""
    },
    eventPreRoll: {
      prepared: true,
      enabled: true,
      active: false,
      emitted: 0,
      skipped: 0,
      errors: 0,
      lastAction: "",
      lastEventId: "",
      lastRequestId: "",
      lastSoundId: "",
      lastStartedAt: "",
      lastEndedAt: "",
      lastError: "",
      lastResult: null,
      current: null,
      recentEvents: []
    },
    soundBusCommand: {
      emitted: 0,
      skipped: 0,
      errors: 0,
      lastAction: "",
      lastEventId: "",
      consumed: 0,
      dryRunOk: 0,
      dryRunFailed: 0,
      lastDryRun: null,
      lastResult: null,
      lastError: "",
      lastAt: "",
      recentCommands: []
    },
    activeBundleLock: null
  };

  let config = DEFAULT_CONFIG;
  let messages = DEFAULT_MESSAGES;
  let finishTimer = null;
  let soundCanBusHeartbeatTimer = null;
  let soundCanBusLastStatusMs = 0;
  const recent = { sounds: new Map(), categories: new Map(), users: new Map(), userSounds: new Map() };
  const SOUND_SETTINGS_SCHEMA_MODULE = "sound_system_settings";
  const SOUND_SETTINGS_SCHEMA_VERSION = 1;
  const SOUND_SETTINGS_TABLE = "sound_settings";
  const SOUND_SETTINGS_BLOCKS = ["output", "overlay", "queue", "priorities", "defaults", "categoryDefaults", "targets", "discordRouting", "soundBus", "soundBusCommand", "eventPreRoll", "soundsBaseDir", "allowedExtensions"];

  function deepMergeRuntimeSettings(base, override) {
    if (!isPlainObject(base)) base = {};
    if (!isPlainObject(override)) return { ...base };
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = deepMergeRuntimeSettings(result[key], value);
      } else if (Array.isArray(value)) {
        result[key] = value.slice();
      } else if (isPlainObject(value)) {
        result[key] = deepMergeRuntimeSettings({}, value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  function ensureSoundSettingsSchema() {
    database.ensureReady();
    database.ensureSchema(SOUND_SETTINGS_SCHEMA_MODULE, SOUND_SETTINGS_SCHEMA_VERSION, (fromVersion, toVersion, db) => {
      if (toVersion === 1) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS sound_settings (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            updated_by TEXT NOT NULL DEFAULT ''
          );
        `);
      }
    });
    return true;
  }

  function parseSettingJson(raw, fallback) {
    if (raw === null || raw === undefined || raw === "") return fallback;
    try {
      return JSON.parse(String(raw));
    } catch (_) {
      return fallback;
    }
  }

  function getSoundSettings() {
    try {
      database.ensureReady();
    } catch (_) {
      return {};
    }
    ensureSoundSettingsSchema();
    const rows = database.all(`SELECT key, value_json FROM ${SOUND_SETTINGS_TABLE}`) || [];
    const settings = {};
    for (const row of rows) {
      const key = String(row.key || "");
      if (!SOUND_SETTINGS_BLOCKS.includes(key)) continue;
      settings[key] = parseSettingJson(row.value_json, {});
    }
    return settings;
  }

  function pickEffectiveSettings() {
    const effective = {};
    for (const key of SOUND_SETTINGS_BLOCKS) {
      if (hasOwn(config, key)) effective[key] = config[key];
    }
    return effective;
  }

  function publicSoundSettings() {
    const runtime = getSoundSettings();
    return {
      ok: true,
      module: MODULE_NAME,
      databasePath: database.getDbPath() || "",
      table: SOUND_SETTINGS_TABLE,
      allowedBlocks: SOUND_SETTINGS_BLOCKS.slice(),
      settings: runtime,
      effective: pickEffectiveSettings()
    };
  }

  function publicSoundRoutes(prefix) {
    return {
      ok: true,
      module: MODULE_NAME,
      routesVersion: "1.1.0",
      routes: [
        { method: "GET", path: `${prefix}/status`, description: "Runtime status, current item, queue, client and device state" },
        { method: "GET", path: `${prefix}/current`, description: "Current sound item" },
        { method: "GET", path: `${prefix}/queue`, description: "Queued sound items" },
        { method: "GET", path: `${prefix}/list`, description: "Configured JSON/seed sound presets" },
        { method: "GET", path: `${prefix}/config`, description: "Effective runtime config after DB settings over JSON fallback" },
        { method: "GET", path: `${prefix}/settings`, description: "DB-backed dashboard settings and effective config blocks" },
        { method: "POST", path: `${prefix}/settings`, description: "Save DB-backed dashboard settings" },
        { method: "POST", path: `${prefix}/reload`, description: "Reload JSON fallback and DB settings" },
        { method: "GET", path: `${prefix}/routes`, description: "Route self-documentation" },
        { method: "GET", path: `${prefix}/integration-check`, description: "Integration and DB/JSON/Sound overlay consistency check" },
        { method: "GET", path: `${prefix}/eventbus/status`, description: "Sound-System EventBus status and recent sound.* events" },
        { method: "GET", path: `${prefix}/eventbus/test`, description: "Emit a test-only sound.test EventBus event without playing audio or touching queue" },
        { method: "POST", path: `${prefix}/eventbus/test`, description: "Emit a test-only sound.test EventBus event without playing audio or touching queue" },
        { method: "GET", path: `${prefix}/eventbus/reset`, description: "Reset Sound-System EventBus counters only" },
        { method: "GET", path: `${prefix}/event-preroll/status`, description: "EVENT-SOUND-3B: Stream-Events Countdown/PreRoll-Gate Status mit Timing-/Dedupe-Fix" },
        { method: "GET", path: `${prefix}/event-preroll/test`, description: "EVENT-SOUND-3B: kontrollierter Test fuer Countdown -> Playback mit Timing-/Dedupe-Fix; confirm=1 erforderlich" },
        { method: "POST", path: `${prefix}/event-preroll/test`, description: "EVENT-SOUND-3B: kontrollierter Test fuer Countdown -> Playback mit Timing-/Dedupe-Fix; confirm=1 erforderlich" },
        { method: "GET", path: `${prefix}/eventbus/command/status`, description: "Sound EventBus command dry-run consumer status without playing audio" },
        { method: "GET", path: `${prefix}/eventbus/command/test`, description: "Emit a test-only sound.command play request without touching audio or queue" },
        { method: "POST", path: `${prefix}/eventbus/command/test`, description: "Emit a test-only sound.command play request without touching audio or queue" },
        { method: "GET", path: `${prefix}/eventbus/command/dry-run`, description: "Validate/consume a sound.command play request in dry-run mode without touching audio or queue" },
        { method: "POST", path: `${prefix}/eventbus/command/dry-run`, description: "Validate/consume a sound.command play request in dry-run mode without touching audio or queue" },
        { method: "GET", path: `${prefix}/eventbus/command/play-test`, description: "Execute a sound.command play request through the real Sound-System flow for manual testing only" },
        { method: "POST", path: `${prefix}/eventbus/command/play-test`, description: "Execute a sound.command play request through the real Sound-System flow for manual testing only" },
        { method: "GET", path: `${prefix}/eventbus/command/reset`, description: "Reset Sound EventBus command dry-run counters only" },
        { method: "GET", path: `${prefix}/generated/beep.wav`, description: "Generated test beep audio" },
        { method: "GET", path: `${prefix}/play`, description: "Play/queue a sound via query parameters" },
        { method: "POST", path: `${prefix}/play`, description: "Play/queue a sound via JSON body" },
        { method: "POST", path: `${prefix}/bundle`, description: "Play/queue a locked bundle of sound items, e.g. alert sound + alert TTS" },
        { method: "POST", path: `${prefix}/stop`, description: "Stop current sound, optionally clear queue" },
        { method: "POST", path: `${prefix}/skip`, description: "Skip current sound" },
        { method: "POST", path: `${prefix}/clear`, description: "Clear queue" },
        { method: "POST", path: `${prefix}/pause`, description: "Pause sound queue processing" },
        { method: "POST", path: `${prefix}/resume`, description: "Resume sound queue processing" },
        { method: "POST", path: `${prefix}/reset`, description: "Reset runtime sound state" },
        { method: "POST", path: `${prefix}/client/ready`, description: "Overlay client ready heartbeat" },
        { method: "POST", path: `${prefix}/client/audio-started`, description: "Overlay client started playback acknowledgement" },
        { method: "POST", path: `${prefix}/client/audio-ended`, description: "Overlay client ended playback acknowledgement" },
        { method: "POST", path: `${prefix}/client/error`, description: "Overlay client playback error acknowledgement" }
      ],
      notes: [
        "DB settings override JSON fallback for allowed blocks.",
        "output.targets is the active output-target model for overlay/device/both.",
        "targets is kept for legacy stream/discord/both compatibility and must not be removed until all callers are migrated."
      ]
    };
  }

  function publicSoundIntegrationCheck() {
    const warnings = [];
    const errors = [];
    let settings = {};
    let settingsError = "";
    try {
      settings = getSoundSettings();
    } catch (err) {
      settingsError = err && err.message ? err.message : String(err);
      errors.push("sound_settings_read_failed");
    }

    const outputTargets = config.output && isPlainObject(config.output.targets) ? Object.keys(config.output.targets) : [];
    const legacyTargets = config.targets && isPlainObject(config.targets) ? Object.keys(config.targets) : [];
    const discordRouting = config.discordRouting && isPlainObject(config.discordRouting) ? config.discordRouting : {};
    if (outputTargets.length && legacyTargets.length) {
      warnings.push("legacy_targets_and_output_targets_both_present");
    }
    if (!outputTargets.includes("overlay")) errors.push("missing_output_target_overlay");
    if (!outputTargets.includes("device")) warnings.push("missing_output_target_device");

    const allowedExtensions = Array.isArray(config.allowedExtensions) ? config.allowedExtensions.map(v => String(v).toLowerCase()) : [];
    if (!allowedExtensions.includes(".mp4")) warnings.push("allowed_extensions_missing_mp4");
    if (!allowedExtensions.includes(".webm")) warnings.push("allowed_extensions_missing_webm");

    const overlayUrl = String(config.output?.targets?.overlay?.overlayUrl || "");
    if (!overlayUrl) warnings.push("overlay_url_missing");

    const helperRel = String(config.output?.targets?.device?.helper?.path || "");
    let helperExists = false;
    let helperPath = "";
    if (helperRel) {
      helperPath = path.isAbsolute(helperRel) ? helperRel : cfg.resolveFromRoot(helperRel);
      helperExists = fs.existsSync(helperPath);
      if (config.output?.targets?.device?.enabled !== false && !helperExists) warnings.push("audio_device_helper_missing");
    }

    const soundsBaseDir = getSoundsBaseDir();
    const soundsBaseDirExists = fs.existsSync(soundsBaseDir);
    if (!soundsBaseDirExists) warnings.push("sounds_base_dir_missing");

    const settingsKeys = Object.keys(settings || {});
    const dbSettingsOk = !settingsError;
    const healthy = errors.length === 0;

    return {
      ok: true,
      module: MODULE_NAME,
      healthy,
      warnings,
      errors,
      checks: {
        enabled: state.enabled,
        paused: state.paused,
        current: state.current ? publicItem(state.current) : null,
        queuedCount: state.queue.length,
        parallelCount: state.parallel.length,
        clientConnected: !!state.client.connected,
        clientLastEvent: state.client.lastEvent || "",
        deviceLastOk: !!state.device.lastOk,
        failed: Number(state.stats.failed || 0),
        deviceFailed: Number(state.stats.deviceFailed || 0),
        dbSettingsOk,
        dbSettingsCount: settingsKeys.length,
        jsonConfigOk: !!state.configOk,
        outputTargets,
        legacyTargets,
        discordRoutingEnabled: discordRouting.enabled !== false,
        discordRoutingTarget: discordRouting.target || "",
        discordRoutingCategories: Array.isArray(discordRouting.categories) ? discordRouting.categories : [],
        discordRoutingSources: Array.isArray(discordRouting.sources) ? discordRouting.sources : [],
        defaultOutputTarget: config.output?.defaultTarget || "",
        overlayUrl,
        helperConfigured: !!helperRel,
        helperExists,
        soundsBaseDir,
        soundsBaseDirExists,
        allowedExtensions,
        hasMp4: allowedExtensions.includes(".mp4"),
        hasWebm: allowedExtensions.includes(".webm"),
        jsonPresetCount: getSoundList().length
      },
      sources: {
        json: {
          path: state.configPath,
          exists: !!state.configPath && fs.existsSync(state.configPath),
          ok: !!state.configOk,
          error: state.configError || ""
        },
        database: {
          path: database.getDbPath() || "",
          table: SOUND_SETTINGS_TABLE,
          ok: dbSettingsOk,
          count: settingsKeys.length,
          error: settingsError
        },
        rule: "database_over_json_fallback_for_allowed_blocks"
      }
    };
  }

  function sanitizeSoundSettingsPayload(body) {
    const input = isPlainObject(body && body.settings) ? body.settings : (isPlainObject(body) ? body : {});
    const clean = {};
    for (const key of SOUND_SETTINGS_BLOCKS) {
      if (!hasOwn(input, key)) continue;
      const value = input[key];

      if (key === "soundsBaseDir") {
        if (typeof value !== "string") throw new Error(`UngÃ¼ltiger sound_settings Block: ${key}`);
        clean[key] = value;
        continue;
      }

      if (key === "allowedExtensions") {
        if (!Array.isArray(value)) throw new Error(`UngÃ¼ltiger sound_settings Block: ${key}`);
        clean[key] = value.map(v => String(v || "").trim()).filter(Boolean);
        continue;
      }

      if (!isPlainObject(value) && !Array.isArray(value)) {
        throw new Error(`UngÃ¼ltiger sound_settings Block: ${key}`);
      }
      clean[key] = value;
    }
    return clean;
  }

  function saveSoundSettings(body, updatedBy) {
    database.ensureReady({});
    ensureSoundSettingsSchema();
    const clean = sanitizeSoundSettingsPayload(body);
    const keys = Object.keys(clean);
    if (!keys.length) return publicSoundSettings();

    const now = core.nowIso();
    for (const key of keys) {
      database.upsert(
        SOUND_SETTINGS_TABLE,
        {
          key,
          value_json: JSON.stringify(clean[key]),
          updated_at: now,
          updated_by: String(updatedBy || "")
        },
        ["key"],
        ["value_json", "updated_at", "updated_by"]
      );
    }

    loadAll();
    return publicSoundSettings();
  }

  function loadAll() {
    const loadedConfig = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true });
    const loadedMessages = cfg.loadConfig(MESSAGES_FILE, DEFAULT_MESSAGES, { createIfMissing: true, mergeDefaults: true });

    config = loadedConfig.config || DEFAULT_CONFIG;
    const runtimeSettings = getSoundSettings();
    config = deepMergeRuntimeSettings(config, runtimeSettings);
    if (!config.output) config.output = DEFAULT_OUTPUT;
    if (!config.queue) config.queue = DEFAULT_CONFIG.queue;
    if (!config.priorities) config.priorities = DEFAULT_CONFIG.priorities;
    if (!config.categoryDefaults) config.categoryDefaults = DEFAULT_CONFIG.categoryDefaults;
    if (!config.discordRouting) config.discordRouting = DEFAULT_CONFIG.discordRouting;
    if (!config.soundBus) config.soundBus = DEFAULT_CONFIG.soundBus;
    if (!config.soundBusCommand) config.soundBusCommand = DEFAULT_CONFIG.soundBusCommand;
    if (config.soundBus && config.soundBus.forceDisabled !== true) config.soundBus.enabled = true;
    messages = loadedMessages.config || DEFAULT_MESSAGES;

    state.version = config.version || DEFAULT_CONFIG.version;
    state.enabled = config.enabled !== false;
    state.configPath = loadedConfig.path || "";
    state.messagesPath = loadedMessages.path || "";
    state.configOk = !!loadedConfig.ok;
    state.messagesOk = !!loadedMessages.ok;
    state.configError = loadedConfig.error || "";
    state.messagesError = loadedMessages.error || "";
    state.loadedAt = core.nowIso();
    touch();
    emit("reloaded");
  }

  function touch() { state.updatedAt = core.nowIso(); }

  function soundBusConfig() {
    const busConfig = config.soundBus && isPlainObject(config.soundBus) ? config.soundBus : DEFAULT_CONFIG.soundBus;
    return { ...DEFAULT_CONFIG.soundBus, ...busConfig, actions: { ...(DEFAULT_CONFIG.soundBus.actions || {}), ...((busConfig && busConfig.actions) || {}) } };
  }

  function soundBusMode(busConfig = soundBusConfig()) {
    const raw = String(busConfig.mode || busConfig.busMode || "bus_first").trim().toLowerCase();
    if (raw === "bus_first") return "bus_first";
    if (raw === "legacy_parallel") return "legacy_parallel";
    return "bus_first";
  }

  function soundBusLegacyFallbackEnabled(busConfig = soundBusConfig()) {
    return busConfig.legacyFallback !== false && busConfig.legacyWebSocketFallback !== false;
  }

  function soundBusDelivered(result) {
    return !!(result && Number.isFinite(Number(result.deliveredCount)) && Number(result.deliveredCount) > 0);
  }

  function functionSafeBroadcastWS(payload) {
    if (config.websocket && config.websocket.enabled !== false && typeof broadcastWS === "function") {
      broadcastWS(payload);
      return true;
    }
    return false;
  }

  function soundBusTarget(busConfig) {
    const configuredCapability = String(busConfig.targetCapability || "").trim();
    return {
      type: String(busConfig.targetType || "all"),
      id: String(busConfig.targetId || "*"),
      module: String(busConfig.targetModule || ""),
      capability: configuredCapability || SOUND_BUS_TARGET_CAPABILITY
    };
  }

  function getCommunicationBus() {
    if (!communicationBus || typeof communicationBus.getBus !== "function") return null;
    try { return communicationBus.getBus(); } catch (_) { return null; }
  }


  function buildSoundCanBusStatus(phase = "updated") {
    const current = state.current ? publicItem(state.current) : null;
    return {
      module: MODULE_NAME,
      version: MODULE_VERSION,
      enabled: state.enabled !== false,
      initialized: true,
      healthy: state.enabled !== false && state.configOk !== false,
      phase: String(phase || (current ? "running" : (state.queue.length > 0 ? "queued" : "idle"))),
      queueLength: state.queue.length,
      parallelCount: state.parallel.length,
      current: current ? {
        requestId: current.requestId || "",
        soundId: current.soundId || "",
        type: current.type || "",
        category: current.category || "",
        source: current.source || "",
        requestedBy: current.requestedBy || ""
      } : null,
      activeBundleLock: state.activeBundleLock ? { ...state.activeBundleLock } : null,
      client: {
        connected: !!state.client.connected,
        lastEvent: state.client.lastEvent || "",
        lastSeenAt: state.client.lastSeenAt || 0
      },
      device: {
        lastOk: !!state.device.lastOk,
        lastAt: state.device.lastAt || 0,
        lastError: state.device.lastError || ""
      },
      discord: {
        lastOk: !!state.discord.lastOk,
        lastAt: state.discord.lastAt || 0,
        lastError: state.discord.lastError || ""
      },
      stats: { ...state.stats },
      canBus: { ...state.canBus },
      updatedAt: state.updatedAt,
      checkedAt: core.nowIso()
    };
  }

  function publishSoundCanBusStatus(phase = "updated") {
    const bus = getCommunicationBus();
    if (!bus || typeof bus.publishModuleStatus !== "function") {
      state.canBus.lastError = "communication_bus_unavailable";
      return { ok: false, skipped: true, reason: state.canBus.lastError };
    }

    try {
      const result = bus.publishModuleStatus(MODULE_NAME, buildSoundCanBusStatus(phase), {
        id: `module:${MODULE_NAME}`,
        channel: "module.status",
        action: "updated",
        replayable: true,
        requireAck: false,
        ttlMs: SOUND_CANBUS_STATUS_INTERVAL_MS * 3
      });
      state.canBus.statusPublished += 1;
      state.canBus.lastStatusAt = core.nowIso();
      state.canBus.lastError = "";
      soundCanBusLastStatusMs = Date.now();
      return result;
    } catch (err) {
      state.canBus.lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: state.canBus.lastError };
    }
  }

  function registerSoundCanBusParticipant() {
    const bus = getCommunicationBus();
    if (!bus || typeof bus.registerModule !== "function") {
      state.canBus.lastError = "communication_bus_unavailable";
      return { ok: false, skipped: true, reason: state.canBus.lastError };
    }

    try {
      const result = bus.registerModule({
        id: `module:${MODULE_NAME}`,
        module: MODULE_NAME,
        name: MODULE_NAME,
        version: MODULE_VERSION,
        capabilities: [SOUND_BUS_CAPABILITY, SOUND_BUS_COMMAND_CAPABILITY],
        meta: {
          canBusParticipant: true,
          statusApiVersion: SOUND_BUS_STATUS_API_VERSION,
          commandApiVersion: SOUND_BUS_COMMAND_API_VERSION,
          routesPrefix: "/api/sound",
          productiveFlowsTouched: false,
          queueTouched: false,
          soundSystemTouched: false,
          legacyFlow: "unchanged"
        }
      });
      state.canBus.registered = result && result.ok === true;
      state.canBus.lastRegisteredAt = core.nowIso();
      state.canBus.lastError = result && result.ok === true ? "" : "register_module_failed";
      publishSoundCanBusStatus("registered");
      return result;
    } catch (err) {
      state.canBus.lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: state.canBus.lastError };
    }
  }

  function heartbeatSoundCanBusParticipant() {
    const bus = getCommunicationBus();
    if (!bus || typeof bus.heartbeatModule !== "function") {
      state.canBus.lastError = "communication_bus_unavailable";
      return { ok: false, skipped: true, reason: state.canBus.lastError };
    }

    try {
      const phase = state.current ? "running" : (state.queue.length > 0 ? "queued" : "idle");
      const result = bus.heartbeatModule(MODULE_NAME, {
        id: `module:${MODULE_NAME}`,
        module: MODULE_NAME,
        name: MODULE_NAME,
        version: MODULE_VERSION,
        capabilities: [SOUND_BUS_CAPABILITY, SOUND_BUS_COMMAND_CAPABILITY],
        lastError: state.canBus.lastError || "",
        meta: {
          canBusParticipant: true,
          phase,
          enabled: state.enabled !== false,
          healthy: state.enabled !== false && state.configOk !== false,
          queueLength: state.queue.length,
          parallelCount: state.parallel.length,
          currentRequestId: state.current ? state.current.requestId || "" : "",
          activeBundleLock: !!state.activeBundleLock
        }
      });

      state.canBus.heartbeatCount += 1;
      state.canBus.lastHeartbeatAt = core.nowIso();
      state.canBus.lastError = "";
      if (Date.now() - soundCanBusLastStatusMs >= SOUND_CANBUS_STATUS_INTERVAL_MS) {
        publishSoundCanBusStatus(phase);
      }
      return result;
    } catch (err) {
      state.canBus.lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: state.canBus.lastError };
    }
  }

  function startSoundCanBusParticipant() {
    registerSoundCanBusParticipant();
    heartbeatSoundCanBusParticipant();
    if (soundCanBusHeartbeatTimer) return;
    soundCanBusHeartbeatTimer = setInterval(heartbeatSoundCanBusParticipant, SOUND_CANBUS_HEARTBEAT_INTERVAL_MS);
    if (soundCanBusHeartbeatTimer && typeof soundCanBusHeartbeatTimer.unref === "function") soundCanBusHeartbeatTimer.unref();
  }

  function soundBusActionForReason(reason) {
    const clean = String(reason || "state");
    const actions = soundBusConfig().actions || {};
    if (clean === "manual_test" || clean === "test") return actions.test || "test";
    if (clean === "queued") return actions.queueUpdated || "queue.updated";
    if (clean === "item_queued") return actions.queued || "queued";
    if (clean === "item_starting") return actions.starting || "starting";
    if (clean === "item_started" || clean === "started" || clean === "next_started" || clean === "bundle_next_started" || clean === "interrupted_started" || clean === "parallel_started") return actions.started || "started";
    if (clean === "item_finished" || clean === "finished" || clean === "client_audio_ended" || clean === "auto_finished" || clean === "overlay_fallback_finished" || clean === "parallel_finished" || clean === "parallel_auto_finished" || clean === "parallel_overlay_fallback_finished") return actions.finished || "finished";
    if (clean === "manual_stop" || clean === "stop_stream" || clean === "stopped" || clean === "device_play_stopped") return actions.stopped || "stopped";
    if (clean === "manual_skip" || clean === "skip_stream") return actions.skipped || "skipped";
    if (clean === "queue_cleared" || clean === "reset") return actions.cleared || "cleared";
    if (clean === "paused") return actions.paused || "paused";
    if (clean === "resumed") return actions.resumed || "resumed";
    if (clean === "bundle_queued") return actions.bundleQueued || "bundle.queued";
    if (clean === "bundle_lock_started") return actions.bundleLockStarted || "bundle.lock_started";
    if (clean === "bundle_lock_finished") return actions.bundleLockFinished || "bundle.lock_finished";
    if (clean === "device_play_started") return actions.deviceStarted || "device.started";
    if (clean === "device_play_finished") return actions.deviceFinished || "device.finished";
    if (clean.startsWith("device_") || clean === "device_file_missing" || clean === "device_helper_missing" || clean === "device_helper_disabled") return actions.deviceFailed || "device.failed";
    if (clean === "discord_play_started") return actions.discordStarted || "discord.started";
    if (clean === "discord_play_queued") return actions.discordQueued || "discord.queued";
    if (clean.startsWith("discord_")) return actions.discordFailed || "discord.failed";
    if (clean === "client_ready") return actions.clientReady || "client.ready";
    if (clean === "client_audio_started") return actions.clientAudioStarted || "client.audio_started";
    if (clean === "client_audio_ended") return actions.clientAudioEnded || "client.audio_ended";
    if (clean === "client_error") return actions.clientError || "client.error";
    if (clean.includes("failed") || clean.includes("error")) return actions.failed || "failed";
    return actions.state || "state.updated";
  }

  function publicSoundSummary() {
    return {
      enabled: state.enabled,
      paused: state.paused,
      current: state.current ? publicItem(state.current) : null,
      parallelCount: state.parallel.length,
      queuedCount: state.queue.length,
      activeBundleLock: state.activeBundleLock ? { ...state.activeBundleLock } : null,
      client: { ...state.client },
      device: { ...state.device },
      discord: { ...state.discord },
      soundBus: publicSoundBusStatus({ includeRecentEvents: false }),
      canBus: { ...state.canBus },
      stats: { ...state.stats },
      updatedAt: state.updatedAt
    };
  }

  function compactMetaValue(value) {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    return str.length > 240 ? `${str.slice(0, 237)}...` : str;
  }

  function soundBusConsumerContext(item, reason, action, options = {}) {
    const meta = item && isPlainObject(item.meta) ? item.meta : {};
    const visual = item && isPlainObject(item.visual) ? item.visual : {};
    const bundle = item && isPlainObject(item.bundle) ? item.bundle : {};
    const lifecycle = item && isPlainObject(item.lifecycle) ? item.lifecycle : {};
    const extra = isPlainObject(options.extra) ? options.extra : {};
    const requestId = item ? compactMetaValue(item.requestId || meta.requestId || visual.requestId || extra.requestId) : compactMetaValue(extra.requestId);
    const bundleId = compactMetaValue(bundle.bundleId || meta.bundleId || extra.bundleId);
    const alertEventUid = compactMetaValue(meta.alertEventUid || visual.alertEventUid || extra.alertEventUid);
    const correlationId = compactMetaValue(meta.correlationId || visual.correlationId || extra.correlationId || alertEventUid || bundleId || requestId);
    const context = {
      reason: String(reason || "state"),
      action: String(action || ""),
      kind: String(options.kind || (item ? "item" : "state")),
      requestId,
      soundId: item ? compactMetaValue(item.soundId) : "",
      label: item ? compactMetaValue(item.label || item.soundId) : "",
      category: item ? compactMetaValue(item.category) : "",
      source: item ? compactMetaValue(item.source || meta.source || visual.module) : "",
      sourceModule: compactMetaValue(meta.module || visual.module || (item ? item.source : "") || MODULE_NAME),
      requestedBy: item ? compactMetaValue(item.requestedBy || meta.user || meta.login || visual.login || visual.user) : "",
      target: item ? compactMetaValue(item.target) : "",
      outputTarget: item ? compactMetaValue(item.outputTarget) : "",
      mediaType: item ? compactMetaValue(item.mediaType) : "",
      file: item ? compactMetaValue(item.file) : "",
      durationMs: item ? Number(item.durationMs || 0) : 0,
      priority: item ? Number(item.priority || 0) : 0,
      bundleId,
      bundleType: compactMetaValue(bundle.bundleType || meta.bundleType || extra.bundleType),
      bundleRole: compactMetaValue(bundle.bundleRole || meta.bundleRole || visual.bundleRole),
      bundleOrder: Number(bundle.bundleOrder || meta.bundleOrder || 0),
      bundleSize: Number(bundle.bundleSize || meta.bundleSize || 0),
      alertEventUid,
      alertSource: compactMetaValue(meta.alertSource || visual.alertSource),
      alertType: compactMetaValue(meta.alertType || visual.alertType),
      vipRequestId: compactMetaValue(meta.requestId || visual.requestId),
      soundType: compactMetaValue(meta.soundType || visual.type),
      traceKind: compactMetaValue(meta.traceKind),
      error: compactMetaValue(extra.error || lifecycle.error || ""),
      queuedCount: state.queue.length,
      activeBundleLockId: state.activeBundleLock ? compactMetaValue(state.activeBundleLock.bundleId) : "",
      correlationId,
      traceIds: { requestId, correlationId, alertEventUid, bundleId }
    };
    return context;
  }

  function pushSoundBusRecentEvent(entry) {
    const max = 80;
    if (!state.soundBus || !Array.isArray(state.soundBus.recentEvents)) state.soundBus.recentEvents = [];
    state.soundBus.recentEvents.unshift(entry);
    if (state.soundBus.recentEvents.length > max) state.soundBus.recentEvents.length = max;
  }

  function emitSoundBus(reason, options = {}) {
    const busConfig = soundBusConfig();
    const bus = getCommunicationBus();
    const action = soundBusActionForReason(reason);
    if (busConfig.enabled === false || !bus || typeof bus.emit !== "function") {
      state.soundBus.skipped += 1;
      state.soundBus.lastReason = String(reason || "state");
      state.soundBus.lastAction = action;
      state.soundBus.lastAt = core.nowIso();
      state.soundBus.lastError = busConfig.enabled === false ? "sound_bus_disabled" : "communication_bus_unavailable";
      return { ok: false, skipped: true, reason: state.soundBus.lastError };
    }

    try {
      const item = options.item || null;
      const extra = isPlainObject(options.extra) ? options.extra : {};
      const context = soundBusConsumerContext(item, reason, action, { ...options, extra });
      const payload = {
        reason: String(reason || "state"),
        kind: String(options.kind || (item ? "item" : "state")),
        context,
        item: busConfig.includeItem !== false && item ? publicItem(item) : null,
        state: busConfig.includeState !== false ? publicSoundSummary() : null,
        extra,
        emittedAt: core.nowIso()
      };

      const result = bus.emit({
        channel: String(busConfig.channel || "sound"),
        action,
        source: { type: "module", id: MODULE_NAME, module: MODULE_NAME },
        target: soundBusTarget(busConfig),
        payload,
        meta: {
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          configVersion: state.version || "",
          capability: SOUND_BUS_CAPABILITY,
          statusApiVersion: SOUND_BUS_STATUS_API_VERSION,
          busMode: soundBusMode(busConfig),
          soundSystemRole: "central_audio_media_layer",
          reason: String(reason || "state"),
          replayable: busConfig.replayable === true,
          requireAck: busConfig.requireAck === true,
          ttlMs: Number(busConfig.ttlMs || 0)
        }
      });

      state.soundBus.emitted += 1;
      state.soundBus.lastReason = String(reason || "state");
      state.soundBus.lastAction = action;
      state.soundBus.lastEventId = result && result.eventId ? String(result.eventId) : "";
      state.soundBus.lastResult = result || null;
      state.soundBus.lastError = "";
      state.soundBus.lastAt = core.nowIso();
      pushSoundBusRecentEvent({
        at: state.soundBus.lastAt,
        eventId: state.soundBus.lastEventId,
        action,
        reason: String(reason || "state"),
        kind: payload.kind,
        context,
        deliveredCount: result && Number.isFinite(Number(result.deliveredCount)) ? Number(result.deliveredCount) : 0
      });
      return result;
    } catch (err) {
      state.soundBus.errors += 1;
      state.soundBus.lastReason = String(reason || "state");
      state.soundBus.lastAction = action;
      state.soundBus.lastError = err && err.message ? err.message : String(err);
      state.soundBus.lastAt = core.nowIso();
      return { ok: false, error: state.soundBus.lastError };
    }
  }


  function buildSoundBusAlertCorrelationSummary() {
    const recentEvents = Array.isArray(state.soundBus.recentEvents) ? state.soundBus.recentEvents : [];
    const byAlert = new Map();
    for (const ev of recentEvents) {
      const ctx = ev && ev.context && typeof ev.context === "object" ? ev.context : {};
      const alertId = String(ctx.alertEventUid || (ctx.bundleType === "alert" ? ctx.bundleId : "") || "").trim();
      if (!alertId) continue;
      if (!byAlert.has(alertId)) {
        byAlert.set(alertId, {
          alertEventUid: alertId,
          bundleId: String(ctx.bundleId || ""),
          alertSource: String(ctx.alertSource || ""),
          alertType: String(ctx.alertType || ""),
          requestedBy: String(ctx.requestedBy || ""),
          actions: {},
          roles: {},
          lastAt: ev.at || "",
          lastAction: ev.action || "",
          errorCount: 0
        });
      }
      const row = byAlert.get(alertId);
      const action = String(ev.action || "unknown");
      const role = String(ctx.bundleRole || ctx.category || "unknown");
      row.actions[action] = (row.actions[action] || 0) + 1;
      row.roles[role] = (row.roles[role] || 0) + 1;
      row.lastAt = ev.at || row.lastAt;
      row.lastAction = action;
      if (ctx.error) row.errorCount += 1;
    }
    return {
      alertCount: byAlert.size,
      recentAlerts: Array.from(byAlert.values()).slice(0, 10)
    };
  }

  function publicSoundBusStatus(options = {}) {
    const busConfig = soundBusConfig();
    const bus = getCommunicationBus();
    const includeRecentEvents = options.includeRecentEvents !== false;
    const stats = { ...state.soundBus };
    delete stats.recentEvents;
    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      configVersion: state.version || "",
      capability: SOUND_BUS_CAPABILITY,
      statusApiVersion: SOUND_BUS_STATUS_API_VERSION,
      busMode: soundBusMode(busConfig),
      deliveryClassification: SOUND_BUS_DELIVERY_CLASSIFICATION,
      soundSystemRole: "central_audio_media_layer",
      legacyWebSocketFlow: soundBusMode(busConfig) === "bus_first" ? "fallback_only_when_bus_has_no_delivery" : "unchanged",
      legacyApiFlow: "unchanged",
      legacyFallbackEnabled: soundBusLegacyFallbackEnabled(busConfig),
      enabled: busConfig.enabled !== false,
      configuredEnabled: config.soundBus && Object.prototype.hasOwnProperty.call(config.soundBus, "enabled") ? config.soundBus.enabled !== false : true,
      forceDisabled: busConfig.forceDisabled === true,
      channel: String(busConfig.channel || "sound"),
      requireAck: busConfig.requireAck === true,
      replayable: busConfig.replayable === true,
      ttlMs: Number(busConfig.ttlMs || 0),
      target: soundBusTarget(busConfig),
      communicationBusAvailable: !!bus,
      routes: {
        status: `${config.routes?.prefix || "/api/sound"}/eventbus/status`,
        test: `${config.routes?.prefix || "/api/sound"}/eventbus/test`,
        reset: `${config.routes?.prefix || "/api/sound"}/eventbus/reset`,
        commandStatus: `${config.routes?.prefix || "/api/sound"}/eventbus/command/status`,
        commandTest: `${config.routes?.prefix || "/api/sound"}/eventbus/command/test`,
        commandDryRun: `${config.routes?.prefix || "/api/sound"}/eventbus/command/dry-run`,
        commandPlayTest: `${config.routes?.prefix || "/api/sound"}/eventbus/command/play-test`,
        commandReset: `${config.routes?.prefix || "/api/sound"}/eventbus/command/reset`
      },
      notes: [
        "Sound-System remains the central audio/media layer.",
        "Legacy /api/sound routes and legacy sound_system WebSocket broadcasts remain unchanged.",
        "sound.* EventBus events are emitted bus-first in test/productive mode.",
        "Legacy sound_system WebSocket delivery is kept as fallback when the bus reaches no client.",
        "Default delivery is scoped by capability sound.event_output so unrelated overlay clients do not receive sound events.",
        "Existing modules can continue using the old Sound-System API while bus migration continues."
      ],
      stats,
      correlation: buildSoundBusAlertCorrelationSummary(),
      recentEvents: includeRecentEvents ? [...(state.soundBus.recentEvents || [])] : []
    };
  }

  function resetSoundBusRuntime() {
    if (!state.soundBus) state.soundBus = {};
    state.soundBus.emitted = 0;
    state.soundBus.skipped = 0;
    state.soundBus.errors = 0;
    state.soundBus.lastReason = "";
    state.soundBus.lastAction = "";
    state.soundBus.lastEventId = "";
    state.soundBus.lastResult = null;
    state.soundBus.lastError = "";
    state.soundBus.lastAt = core.nowIso();
    state.soundBus.recentEvents = [];
    touch();
    return publicSoundBusStatus({ includeRecentEvents: true });
  }

  function emitSoundBusTest(input = {}) {
    const body = isPlainObject(input) ? input : {};
    const result = emitSoundBus("manual_test", {
      kind: "test",
      extra: {
        testOnly: true,
        message: String(body.message || "Sound-System EventBus test"),
        requestedBy: String(body.requestedBy || body.user || "step412-test"),
        source: String(body.source || "sound_eventbus_test"),
        audioTouched: false,
        queueTouched: false,
        legacyFlowTouched: false
      }
    });
    return {
      ok: result && result.ok === true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      configVersion: state.version || "",
      capability: SOUND_BUS_CAPABILITY,
      statusApiVersion: SOUND_BUS_STATUS_API_VERSION,
      testOnly: true,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      legacyWebSocketFlow: "unchanged",
      legacyApiFlow: "unchanged",
      result: result || null,
      eventBus: publicSoundBusStatus({ includeRecentEvents: true }),
      updatedAt: core.nowIso()
    };
  }

  function soundBusCommandConfig() {
    const commandConfig = config.soundBusCommand && isPlainObject(config.soundBusCommand) ? config.soundBusCommand : DEFAULT_CONFIG.soundBusCommand;
    return { ...DEFAULT_CONFIG.soundBusCommand, ...commandConfig };
  }

  function soundBusCommandTarget(commandConfig) {
    return {
      type: String(commandConfig.targetType || "module"),
      id: String(commandConfig.targetId || MODULE_NAME),
      module: String(commandConfig.targetModule || MODULE_NAME),
      capability: String(commandConfig.targetCapability || SOUND_BUS_COMMAND_CAPABILITY)
    };
  }

  function pushSoundBusCommandRecent(entry) {
    if (!state.soundBusCommand || !Array.isArray(state.soundBusCommand.recentCommands)) state.soundBusCommand.recentCommands = [];
    state.soundBusCommand.recentCommands.unshift(entry);
    if (state.soundBusCommand.recentCommands.length > 25) state.soundBusCommand.recentCommands.length = 25;
  }

  function publicSoundBusCommandStatus(options = {}) {
    const includeRecentCommands = options.includeRecentCommands !== false;
    const commandConfig = soundBusCommandConfig();
    const bus = getCommunicationBus();
    const stats = { ...state.soundBusCommand };
    delete stats.recentCommands;
    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      configVersion: state.version || "",
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_command_play_test_layer",
      mode: String(commandConfig.mode || "dry_run"),
      commandLayerReady: true,
      commandConsumerEnabled: true,
      commandConsumerMode: String(commandConfig.consumerMode || "dry_run"),
      playTestRouteAvailable: true,
      playTestRequiresExplicitRoute: true,
      deliveryClassification: SOUND_BUS_COMMAND_DELIVERY_CLASSIFICATION,
      soundSystemRole: "central_audio_media_layer",
      legacyWebSocketFlow: "unchanged",
      legacyApiFlow: "unchanged",
      enabled: commandConfig.enabled !== false,
      channel: String(commandConfig.channel || "sound.command"),
      action: String(commandConfig.action || "play.request.test"),
      requireAck: commandConfig.requireAck === true,
      replayable: commandConfig.replayable === true,
      ttlMs: Number(commandConfig.ttlMs || 0),
      target: soundBusCommandTarget(commandConfig),
      communicationBusAvailable: !!bus,
      routes: {
        status: `${config.routes?.prefix || "/api/sound"}/eventbus/command/status`,
        test: `${config.routes?.prefix || "/api/sound"}/eventbus/command/test`,
        dryRun: `${config.routes?.prefix || "/api/sound"}/eventbus/command/dry-run`,
        playTest: `${config.routes?.prefix || "/api/sound"}/eventbus/command/play-test`,
        reset: `${config.routes?.prefix || "/api/sound"}/eventbus/command/reset`
      },
      protection: {
        testOnly: true,
        dryRunOnly: true,
        playTestAvailable: true,
        playTestRequiresExplicitRoute: true,
        queueTouched: false,
        audioTouched: false,
        legacyFlowTouched: false,
        allowQueueTouch: commandConfig.allowQueueTouch === true,
        allowAudioTouch: commandConfig.allowAudioTouch === true
      },
      notes: [
        "This is the Sound EventBus command dry-run plus explicit play-test layer.",
        "It emits and validates sound.command play requests for diagnostics and future consumers.",
        "Dry-run mode does not play audio and does not touch the queue.",
        "The explicit play-test route can execute a command-shaped request through the normal Sound-System flow for manual testing only.",
        "Legacy /api/sound/play remains the productive entry point."
      ],
      stats,
      recentCommands: includeRecentCommands ? [...(state.soundBusCommand.recentCommands || [])] : []
    };
  }

  function canonicalSoundBusLifecycleEvent(entry = {}) {
    const action = String(entry.action || entry.event || "").toLowerCase();
    if (entry.error || entry.accepted === false || action.includes("failed") || action.includes("rejected")) return "failed";
    if (action.includes("timeout") || action.includes("fallback")) return "timeout";
    if (action.includes("finished") || action.includes("ended")) return "finished";
    if (action.includes("queued")) return "queued";
    if (action.includes("started") || action.includes("play_test")) return "started";
    if (entry.accepted === true || action.includes("dry_run") || action.includes("accepted")) return "accepted";
    return "unknown";
  }

  function publicSoundBusCatalogStatus(query = {}) {
    const requestedSoundId = normalizeId(query.soundId || query.id || query.sound || query.mediaId || "");
    const requestedMediaId = Number(query.mediaId || query.media_id || query.mediaAssetId || query.assetId || (requestedSoundId && /^[0-9]+$/.test(requestedSoundId) ? requestedSoundId : 0)) || 0;
    const sounds = getSoundList();
    const soundRows = sounds.map(sound => ({
      id: String(sound.id || ""),
      normalizedId: normalizeId(sound.id || ""),
      label: String(sound.label || sound.name || sound.title || sound.id || ""),
      file: String(sound.file || ""),
      type: String(sound.type || "file"),
      category: String(sound.category || "")
    }));
    const soundMatch = requestedSoundId ? soundRows.find(sound => sound.normalizedId === requestedSoundId) || null : null;

    let mediaMatch = null;
    let mediaError = "";
    try {
      if (requestedMediaId) {
        mediaMatch = database.get("SELECT id, display_name, file_name, relative_path, web_path, type, status, duration_ms, has_audio, has_video FROM media_assets WHERE id = :id LIMIT 1", { id: requestedMediaId }) || null;
      }
    } catch (err) {
      mediaError = err && err.message ? err.message : String(err);
    }

    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_catalog_status",
      mode: "read_only_catalog_diagnosis",
      readOnly: true,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      legacyApiFlow: "unchanged",
      legacyWebSocketFlow: "unchanged",
      requested: {
        soundId: requestedSoundId,
        mediaId: requestedMediaId
      },
      summary: {
        soundPresetCount: soundRows.length,
        requestedSoundPresetFound: !!soundMatch,
        requestedMediaAssetFound: !!mediaMatch,
        mediaRegistryChecked: !!requestedMediaId,
        mediaRegistryError: mediaError
      },
      soundMatch,
      mediaMatch,
      samples: {
        soundPresets: soundRows.slice(0, 50)
      },
      diagnosis: {
        likelyIssue: requestedSoundId && !soundMatch && !!mediaMatch
          ? "requested id exists as media_assets id but not as sound preset id"
          : (requestedSoundId && !soundMatch ? "requested sound preset id not found" : ""),
        currentDryRunExpectation: "sound.play.request currently validates payload through normalizePlayRequest(soundId), so numeric mediaAssetId alone is not enough unless mapped or passed as mediaId.",
        suggestedNextStep: "Map Channelpoints mediaAssetId to mediaId in Sound-Bus payload or teach dry-run to accept mediaId/mediaAssetId separately."
      },
      routes: {
        list: `${(config.routes && config.routes.prefix) || "/api/sound"}/list`,
        catalogStatus: `${(config.routes && config.routes.prefix) || "/api/sound"}/eventbus/command/catalog-status`,
        dryRun: `${(config.routes && config.routes.prefix) || "/api/sound"}/eventbus/command/dry-run`
      },
      updatedAt: core.nowIso()
    };
  }

function publicSoundBusQueueStatus() {
    const current = state.current ? publicItem(state.current) : null;
    const queueItems = Array.isArray(state.queue) ? state.queue.map(publicItem) : [];
    const parallelItems = Array.isArray(state.parallel) ? state.parallel.map(publicItem) : [];
    const queueConfig = config.queue || {};
    const maxLength = Number(queueConfig.maxLength || 0);
    const queuedCount = queueItems.length;
    const busy = !!current || parallelItems.length > 0;
    const full = maxLength > 0 && queuedCount >= maxLength;

    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_queue_status",
      mode: "read_only_queue_status",
      readOnly: true,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      dryRunExecuted: false,
      playTestExecuted: false,
      eventBusEmit: false,
      current,
      parallel: parallelItems,
      queue: queueItems,
      summary: {
        busy,
        idle: !busy && queuedCount === 0,
        currentRequestId: current && current.requestId ? current.requestId : "",
        currentSoundId: current && (current.soundId || current.sound) ? (current.soundId || current.sound) : "",
        queuedCount,
        parallelCount: parallelItems.length,
        maxLength,
        full,
        hasActiveBundleLock: !!state.activeBundleLock,
        activeBundleLock: state.activeBundleLock || "",
        sortByPriority: queueConfig.sortByPriority !== false,
        queueIfBusyDefault: queueConfig.queueIfBusy !== false,
        dropWhenFull: queueConfig.dropWhenFull !== false
      },
      stats: {
        started: Number((state.stats || {}).started || 0),
        queued: Number((state.stats || {}).queued || 0),
        stopped: Number((state.stats || {}).stopped || 0),
        skipped: Number((state.stats || {}).skipped || 0),
        cleared: Number((state.stats || {}).cleared || 0),
        failed: Number((state.stats || {}).failed || 0),
        bundlesQueued: Number((state.stats || {}).bundlesQueued || 0),
        bundleItemsQueued: Number((state.stats || {}).bundleItemsQueued || 0)
      },
      nextSteps: [
        "Use this route for status visibility before migrating callers to bus requests.",
        "Do not clear or manipulate queue from this diagnostic route.",
        "Keep queue clear/replay actions behind Confirm/SafetyStop later.",
        "Use queuedCount/full/busy as dashboard indicators only."
      ],
      updatedAt: core.nowIso()
    };
  }

  function publicSoundPlayCompatibilityStatus() {
    const prefix = config.routes?.prefix || "/api/sound";
    const commandConfig = soundBusCommandConfig();
    const queueConfig = config.queue || {};
    const compatibility = {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_play_bus_request_compatibility",
      mode: "read_only_compatibility",
      readOnly: true,
      productiveEntryPoint: `${prefix}/play`,
      productiveEntryPointChanged: false,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      dryRunExecuted: false,
      playTestExecuted: false,
      eventBusEmit: false,
      usesSharedNormalizer: true,
      normalizer: "normalizePlayRequest",
      queueEntryPoint: "enqueueOrStart",
      busCommandName: "sound.play.request",
      busCommandLayerEnabled: commandConfig.enabled !== false,
      compatibilityLevel: "compatible_with_mapping",
      compatibleFields: [
        "requestId",
        "soundId",
        "sound",
        "label",
        "category",
        "target",
        "outputTarget",
        "requestedBy",
        "source",
        "reason",
        "priority",
        "volume",
        "durationMs",
        "queueIfBusy",
        "dropIfBusy",
        "meta",
        "visual"
      ],
      requiredBusFields: ["command", "soundId"],
      productiveAcceptedInputAliases: {
        soundId: ["soundId", "sound", "id", "key"],
        requestedBy: ["requestedBy", "user", "username"],
        source: ["source"],
        category: ["category"],
        target: ["target"],
        outputTarget: ["outputTarget"]
      },
      productiveResultFields: [
        "started",
        "queued",
        "dropped",
        "parallel",
        "queuePosition",
        "reason",
        "retryAfterMs",
        "item",
        "status"
      ],
      lifecycleMapping: {
        accepted: "Payload normalized and enqueueOrStart returned a result.",
        queued: "result.queued === true",
        started: "result.started === true or result.parallel === true",
        failed: "normalization or processing error",
        finished: "item lifecycle finish event from existing sound flow",
        timeout: "overlay/client fallback finish event"
      },
      queuePolicy: {
        defaultMaxLength: Number(queueConfig.maxLength || 0),
        defaultPriority: Number(queueConfig.defaultPriority || 0),
        sortByPriority: queueConfig.sortByPriority !== false,
        queueIfBusyDefault: queueConfig.queueIfBusy !== false,
        dropWhenFull: queueConfig.dropWhenFull !== false
      },
      migrationSafety: {
        keepLegacyPlayRoute: true,
        doNotReplaceProductiveEntryPointYet: true,
        requireDryRunAcceptanceFirst: true,
        requireDashboardVisibilityFirst: true,
        requireAlertSoundAckMappingBeforeAlertMigration: true,
        requireNoFunctionalityRemoval: true
      },
      nextSteps: [
        "Keep /api/sound/play as productive entry point for now.",
        "Map sound.play.request payloads through normalizePlayRequest only after dry-run acceptance.",
        "Expose queue/status visibility before moving callers away from direct /api/sound/play.",
        "Migrate one caller at a time after alert/vip/channelpoints dependencies are documented."
      ],
      updatedAt: core.nowIso()
    };

    return compatibility;
  }

  function publicSoundBusCommandLifecycleStatus() {
    const recent = Array.isArray(state.soundBusCommand && state.soundBusCommand.recentCommands)
      ? state.soundBusCommand.recentCommands
      : [];

    const events = recent.map(entry => ({
      at: entry.at || "",
      requestId: entry.requestId || "",
      command: entry.command || "",
      action: entry.action || "",
      soundId: entry.soundId || "",
      requestedBy: entry.requestedBy || "",
      source: entry.source || "",
      accepted: entry.accepted === true,
      queueTouched: entry.queueTouched === true,
      audioTouched: entry.audioTouched === true,
      error: entry.error || "",
      canonicalEvent: canonicalSoundBusLifecycleEvent(entry)
    }));

    const counts = events.reduce((acc, entry) => {
      acc[entry.canonicalEvent] = Number(acc[entry.canonicalEvent] || 0) + 1;
      return acc;
    }, {});

    const lifecycle = [
      { event: "accepted", required: true, meaning: "Payload was accepted by the command layer." },
      { event: "queued", required: true, meaning: "Request is queued because playback is busy or queueing is requested." },
      { event: "started", required: true, meaning: "Request started playback or explicit play-test execution." },
      { event: "failed", required: true, meaning: "Request was rejected or failed before/while processing." },
      { event: "finished", required: true, meaning: "Playback or overlay lifecycle finished." },
      { event: "timeout", required: true, meaning: "Overlay/client did not finish before fallback timeout." }
    ];

    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_command_lifecycle_status",
      mode: "read_only_lifecycle_status",
      readOnly: true,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      eventBusEmit: false,
      canonicalLifecycle: lifecycle,
      acknowledgement: {
        requiredNow: false,
        planned: true,
        recommendedAckFields: ["requestId", "clientId", "event", "receivedAt", "accepted", "error"],
        currentAckSource: "recent command diagnostics only"
      },
      recent: events,
      counts,
      stats: {
        emitted: Number((state.soundBusCommand || {}).emitted || 0),
        consumed: Number((state.soundBusCommand || {}).consumed || 0),
        dryRunOk: Number((state.soundBusCommand || {}).dryRunOk || 0),
        dryRunFailed: Number((state.soundBusCommand || {}).dryRunFailed || 0),
        playTestOk: Number((state.soundBusCommand || {}).playTestOk || 0),
        playTestFailed: Number((state.soundBusCommand || {}).playTestFailed || 0),
        errors: Number((state.soundBusCommand || {}).errors || 0),
        lastAction: (state.soundBusCommand || {}).lastAction || "",
        lastError: (state.soundBusCommand || {}).lastError || "",
        lastAt: (state.soundBusCommand || {}).lastAt || ""
      },
      nextSteps: [
        "Keep lifecycle event names stable before wiring productive bus commands.",
        "Use accepted/queued/started/failed/finished/timeout as canonical labels in dashboards and follow-up modules.",
        "Do not require ACK for productive sound flow until overlay/client ACK behaviour is verified.",
        "Keep /api/sound/play unchanged until the bus command lifecycle is accepted."
      ],
      updatedAt: core.nowIso()
    };
  }

  function publicSoundBusCommandContract() {
    const commandConfig = soundBusCommandConfig();
    const prefix = config.routes?.prefix || "/api/sound";
    return {
      ok: true,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_command_contract",
      mode: "read_only_contract",
      readOnly: true,
      commandLayerReady: commandConfig.enabled !== false,
      productiveEntryPointChanged: false,
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      eventBusEmit: false,
      contract: {
        name: "sound.play.request",
        version: SOUND_BUS_COMMAND_API_VERSION,
        command: "sound.play.request",
        requiredFields: ["command", "soundId OR mediaId/mediaAssetId"],
        recommendedFields: ["requestId", "source", "requestedBy", "category", "target", "priority", "reason", "meta"],
        optionalFields: ["label", "outputTarget", "visual", "volume", "durationMs", "queueIfBusy", "dropIfBusy"],
        identity: {
          requestId: "Unique request id. Generated for dry-run/play-test if missing.",
          source: "Originating module or system, e.g. alerts, channelpoints, vip_sound_overlay.",
          requestedBy: "User, system or module that requested the sound."
        },
        lifecycle: [
          { event: "accepted", meaning: "Payload valid and accepted by the sound command layer." },
          { event: "queued", meaning: "Request would be or was queued because another sound is active." },
          { event: "started", meaning: "Request started playback immediately." },
          { event: "failed", meaning: "Request was rejected or could not be processed." },
          { event: "finished", meaning: "Playback/visual lifecycle finished." },
          { event: "timeout", meaning: "Overlay/client did not finish before fallback timeout." }
        ],
        resultFields: ["ok", "accepted", "started", "queued", "dropped", "parallel", "queuePosition", "reason", "retryAfterMs", "error"],
        queueStatusFields: ["current", "queue", "queuedCount", "stats"],
        acknowledgement: {
          requiredNow: false,
          planned: true,
          recommendedAckFields: ["requestId", "clientId", "event", "receivedAt", "accepted", "error"]
        }
      },
      routes: {
        status: `${prefix}/eventbus/command/status`,
        contract: `${prefix}/eventbus/command/contract`,
        dryRun: `${prefix}/eventbus/command/dry-run`,
        playTest: `${prefix}/eventbus/command/play-test`,
        productiveLegacyPlay: `${prefix}/play`
      },
      safety: {
        contractRouteTouchesQueue: false,
        contractRouteTouchesAudio: false,
        dryRunTouchesQueue: false,
        dryRunTouchesAudio: false,
        playTestTouchesQueue: true,
        playTestTouchesAudio: true,
        productiveLegacyPlayUnchanged: true,
        requireConfirmForQueueClear: true,
        requireConfirmForReplay: true
      },
      nextSteps: [
        "Use dry-run for command validation without queue/audio touch.",
        "Do not use play-test from dashboard automation without explicit manual action.",
        "Unify ACK/accepted/queued/started/failed/finished event names before productive migration.",
        "Keep legacy /api/sound/play as productive entry point until the bus request flow is accepted."
      ],
      updatedAt: core.nowIso()
    };
  }

  function resetSoundBusCommandRuntime() {
    if (!state.soundBusCommand) state.soundBusCommand = {};
    state.soundBusCommand.emitted = 0;
    state.soundBusCommand.skipped = 0;
    state.soundBusCommand.errors = 0;
    state.soundBusCommand.lastAction = "";
    state.soundBusCommand.lastEventId = "";
    state.soundBusCommand.consumed = 0;
    state.soundBusCommand.dryRunOk = 0;
    state.soundBusCommand.dryRunFailed = 0;
    state.soundBusCommand.playTestOk = 0;
    state.soundBusCommand.playTestFailed = 0;
    state.soundBusCommand.lastDryRun = null;
    state.soundBusCommand.lastPlayTest = null;
    state.soundBusCommand.lastResult = null;
    state.soundBusCommand.lastError = "";
    state.soundBusCommand.lastAt = core.nowIso();
    state.soundBusCommand.recentCommands = [];
    touch();
    return publicSoundBusCommandStatus({ includeRecentCommands: true });
  }

  function emitSoundBusCommandTest(input = {}) {
    const body = isPlainObject(input) ? input : {};
    const commandConfig = soundBusCommandConfig();
    const bus = getCommunicationBus();
    const action = String(commandConfig.action || "play.request.test");
    const soundId = String(body.sound || body.soundId || "test_ping").trim() || "test_ping";
    const requestedBy = String(body.requestedBy || body.user || "step426-test").trim() || "step426-test";
    const source = String(body.source || "sound_eventbus_command_test").trim() || "sound_eventbus_command_test";
    const requestId = String(body.requestId || `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    if (commandConfig.enabled === false || !bus || typeof bus.emit !== "function") {
      state.soundBusCommand.skipped += 1;
      state.soundBusCommand.lastAction = action;
      state.soundBusCommand.lastAt = core.nowIso();
      state.soundBusCommand.lastError = commandConfig.enabled === false ? "sound_bus_command_disabled" : "communication_bus_unavailable";
      return {
        ok: false,
        skipped: true,
        reason: state.soundBusCommand.lastError,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    }

    const payload = {
      testOnly: true,
      command: "sound.play.request",
      requestId,
      soundId,
      label: String(body.label || "STEP426 Sound Bus Command Test"),
      category: String(body.category || "system"),
      target: String(body.target || "stream"),
      outputTarget: String(body.outputTarget || "overlay"),
      requestedBy,
      source,
      reason: "manual_command_test",
      message: String(body.message || "Sound-System Bus command test"),
      protection: {
        soundSystemTouched: false,
        queueTouched: false,
        audioTouched: false,
        legacyFlowTouched: false
      },
      emittedAt: core.nowIso()
    };

    try {
      const result = bus.emit({
        channel: String(commandConfig.channel || "sound.command"),
        action,
        source: { type: "module", id: MODULE_NAME, module: MODULE_NAME },
        target: soundBusCommandTarget(commandConfig),
        payload,
        meta: {
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          configVersion: state.version || "",
          capability: SOUND_BUS_COMMAND_CAPABILITY,
          statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
          busMode: "command_test_layer",
          soundSystemRole: "central_audio_media_layer",
          command: payload.command,
          testOnly: true,
          replayable: commandConfig.replayable === true,
          requireAck: commandConfig.requireAck === true,
          ttlMs: Number(commandConfig.ttlMs || 0)
        }
      });

      state.soundBusCommand.emitted += 1;
      state.soundBusCommand.lastAction = action;
      state.soundBusCommand.lastEventId = result && result.eventId ? String(result.eventId) : "";
      state.soundBusCommand.lastResult = result || null;
      state.soundBusCommand.lastError = "";
      state.soundBusCommand.lastAt = core.nowIso();
      pushSoundBusCommandRecent({
        at: state.soundBusCommand.lastAt,
        eventId: state.soundBusCommand.lastEventId,
        action,
        command: payload.command,
        requestId,
        soundId,
        requestedBy,
        source,
        deliveredCount: result && Number.isFinite(Number(result.deliveredCount)) ? Number(result.deliveredCount) : 0,
        deliveredTo: Array.isArray(result && result.deliveredTo) ? result.deliveredTo.slice() : []
      });

      return {
        ok: result && result.ok === true,
        module: MODULE_NAME,
        version: MODULE_VERSION,
        capability: SOUND_BUS_COMMAND_CAPABILITY,
        statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
        testOnly: true,
        commandLayerReady: true,
        commandConsumerEnabled: true,
        commandConsumerMode: "dry_run",
        soundSystemTouched: false,
        queueTouched: false,
        audioTouched: false,
        legacyWebSocketFlow: "unchanged",
        legacyApiFlow: "unchanged",
        request: payload,
        result: result || null,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true }),
        updatedAt: core.nowIso()
      };
    } catch (err) {
      state.soundBusCommand.errors += 1;
      state.soundBusCommand.lastAction = action;
      state.soundBusCommand.lastError = err && err.message ? err.message : String(err);
      state.soundBusCommand.lastAt = core.nowIso();
      return {
        ok: false,
        error: state.soundBusCommand.lastError,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    }
  }

  function normalizeSoundBusCommandDryRunInput(input = {}) {
    const body = isPlainObject(input) ? input : {};
    const payload = isPlainObject(body.payload) ? body.payload : body;
    const command = String(payload.command || body.command || "sound.play.request").trim();
    const soundId = String(payload.soundId || payload.sound || body.soundId || body.sound || "").trim();
    const mediaId = String(payload.mediaId || payload.media_id || payload.mediaAssetId || payload.assetId || body.mediaId || body.media_id || body.mediaAssetId || body.assetId || "").trim();
    const requestId = String(payload.requestId || body.requestId || `dry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim();
    const requestedBy = String(payload.requestedBy || payload.user || body.requestedBy || "sound_bus_dry_run").trim();

    return {
      ...payload,
      command,
      requestId,
      soundId,
      sound: soundId,
      mediaId,
      mediaAssetId: String(payload.mediaAssetId || body.mediaAssetId || mediaId || "").trim(),
      assetId: String(payload.assetId || body.assetId || mediaId || "").trim(),
      label: String(payload.label || body.label || `Dry-Run ${soundId || mediaId || "Sound"}`).trim(),
      category: String(payload.category || body.category || "system").trim(),
      target: String(payload.target || body.target || "stream").trim(),
      outputTarget: String(payload.outputTarget || body.outputTarget || "overlay").trim(),
      requestedBy,
      source: String(payload.source || body.source || "sound_bus_command_dry_run").trim(),
      reason: String(payload.reason || body.reason || "manual_command_dry_run").trim(),
      meta: objectValue(payload.meta || body.meta),
      visual: objectValue(payload.visual || body.visual)
    };
  }

  function consumeSoundBusCommandDryRun(input = {}) {
    const commandConfig = soundBusCommandConfig();
    const payload = normalizeSoundBusCommandDryRunInput(input);
    const at = core.nowIso();
    const resultBase = {
      ok: false,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_command_dry_run_layer",
      mode: "dry_run",
      dryRunOnly: true,
      commandLayerReady: true,
      commandConsumerEnabled: true,
      commandConsumerMode: "dry_run",
      soundSystemTouched: false,
      queueTouched: false,
      audioTouched: false,
      legacyWebSocketFlow: "unchanged",
      legacyApiFlow: "unchanged",
      protection: {
        dryRunOnly: true,
        queueTouched: false,
        audioTouched: false,
        legacyFlowTouched: false,
        allowQueueTouch: false,
        allowAudioTouch: false
      },
      request: payload,
      updatedAt: at
    };

    state.soundBusCommand.consumed = Number(state.soundBusCommand.consumed || 0) + 1;
    state.soundBusCommand.lastAction = "play.request.dry_run";
    state.soundBusCommand.lastAt = at;

    try {
      if (commandConfig.enabled === false) throw new Error("sound_bus_command_disabled");
      if (payload.command !== "sound.play.request") throw new Error(`unsupported_command: ${payload.command}`);
      const mediaId = String(payload.mediaId || payload.media_id || payload.mediaAssetId || payload.assetId || "").trim();
      if (!payload.soundId && !mediaId) throw new Error("missing_soundId_or_mediaId");

      const soundPreset = payload.soundId ? findSound(payload.soundId) : null;
      const playRequest = {
        ...payload,
        source: payload.source || "sound_bus_command_dry_run",
        requestedBy: payload.requestedBy || "sound_bus_dry_run"
      };
      if (soundPreset) {
        playRequest.soundId = payload.soundId;
        playRequest.sound = payload.soundId;
      } else if (mediaId) {
        delete playRequest.soundId;
        delete playRequest.sound;
        playRequest.mediaId = mediaId;
        playRequest.mediaAssetId = mediaId;
      } else {
        playRequest.soundId = payload.soundId;
        playRequest.sound = payload.soundId;
      }

      const normalized = normalizePlayRequest(playRequest);

      const dryRunResult = {
        ok: true,
        accepted: true,
        wouldPlay: true,
        wouldQueueOrStart: true,
        normalizedItem: publicItem(normalized),
        message: "Command payload validated in dry-run mode. No queue/audio action was executed."
      };

      state.soundBusCommand.dryRunOk = Number(state.soundBusCommand.dryRunOk || 0) + 1;
      state.soundBusCommand.lastError = "";
      state.soundBusCommand.lastDryRun = dryRunResult;
      state.soundBusCommand.lastResult = dryRunResult;
      pushSoundBusCommandRecent({
        at,
        action: "play.request.dry_run",
        command: payload.command,
        requestId: payload.requestId,
        soundId: payload.soundId,
        mediaId: payload.mediaId || payload.mediaAssetId || "",
        requestedBy: payload.requestedBy,
        source: payload.source,
        dryRunOnly: true,
        accepted: true,
        queueTouched: false,
        audioTouched: false
      });

      return {
        ...resultBase,
        ok: true,
        accepted: true,
        result: dryRunResult,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      const dryRunResult = {
        ok: false,
        accepted: false,
        wouldPlay: false,
        wouldQueueOrStart: false,
        error: message,
        message: "Command payload rejected in dry-run mode. No queue/audio action was executed."
      };

      state.soundBusCommand.dryRunFailed = Number(state.soundBusCommand.dryRunFailed || 0) + 1;
      state.soundBusCommand.errors = Number(state.soundBusCommand.errors || 0) + 1;
      state.soundBusCommand.lastError = message;
      state.soundBusCommand.lastDryRun = dryRunResult;
      state.soundBusCommand.lastResult = dryRunResult;
      pushSoundBusCommandRecent({
        at,
        action: "play.request.dry_run",
        command: payload.command,
        requestId: payload.requestId,
        soundId: payload.soundId,
        mediaId: payload.mediaId || payload.mediaAssetId || "",
        requestedBy: payload.requestedBy,
        source: payload.source,
        dryRunOnly: true,
        accepted: false,
        error: message,
        queueTouched: false,
        audioTouched: false
      });

      return {
        ...resultBase,
        ok: false,
        accepted: false,
        error: message,
        result: dryRunResult,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    }
  }


  function consumeSoundBusCommandPlayTest(input = {}) {
    const commandConfig = soundBusCommandConfig();
    const payload = normalizeSoundBusCommandDryRunInput(input);
    const at = core.nowIso();
    const resultBase = {
      ok: false,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      capability: SOUND_BUS_COMMAND_CAPABILITY,
      statusApiVersion: SOUND_BUS_COMMAND_API_VERSION,
      feature: "sound_bus_command_play_test_layer",
      mode: "play_test",
      dryRunOnly: false,
      playTestOnly: true,
      commandLayerReady: true,
      commandConsumerEnabled: true,
      commandConsumerMode: "explicit_play_test",
      legacyWebSocketFlow: "unchanged",
      legacyApiFlow: "unchanged",
      protection: {
        playTestOnly: true,
        explicitRouteRequired: true,
        queueTouchAllowed: true,
        audioTouchAllowed: true,
        legacyFlowTouched: false,
        productiveEntryPointChanged: false
      },
      request: payload,
      updatedAt: at
    };

    state.soundBusCommand.consumed = Number(state.soundBusCommand.consumed || 0) + 1;
    state.soundBusCommand.lastAction = "play.request.play_test";
    state.soundBusCommand.lastAt = at;

    try {
      if (commandConfig.enabled === false) throw new Error("sound_bus_command_disabled");
      if (payload.command !== "sound.play.request") throw new Error(`unsupported_command: ${payload.command}`);
      if (!payload.soundId) throw new Error("missing_soundId");

      const normalized = normalizePlayRequest({
        ...payload,
        soundId: payload.soundId,
        sound: payload.soundId,
        source: payload.source || "sound_bus_command_play_test",
        requestedBy: payload.requestedBy || "sound_bus_play_test"
      });

      const playResult = enqueueOrStart(normalized);
      const normalizedPublic = publicItem(normalized);
      const touchedQueue = !!playResult.queued || state.queue.some(item => item && item.requestId === normalized.requestId);
      const touchedAudio = !!playResult.started || !!playResult.parallel;
      const playTestResult = {
        ok: true,
        accepted: true,
        playedOrQueued: !!(playResult.started || playResult.queued || playResult.parallel),
        started: !!playResult.started,
        queued: !!playResult.queued,
        parallel: !!playResult.parallel,
        dropped: !!playResult.dropped,
        queuePosition: playResult.queuePosition || 0,
        reason: playResult.reason || "",
        retryAfterMs: playResult.retryAfterMs || 0,
        queueTouched: touchedQueue,
        audioTouched: touchedAudio,
        normalizedItem: normalizedPublic,
        status: publicState(),
        message: "Command payload executed through the explicit play-test route. Legacy /api/sound/play remains unchanged."
      };

      state.soundBusCommand.playTestOk = Number(state.soundBusCommand.playTestOk || 0) + 1;
      state.soundBusCommand.lastError = "";
      state.soundBusCommand.lastPlayTest = playTestResult;
      state.soundBusCommand.lastResult = playTestResult;
      pushSoundBusCommandRecent({
        at,
        action: "play.request.play_test",
        command: payload.command,
        requestId: payload.requestId,
        soundId: payload.soundId,
        requestedBy: payload.requestedBy,
        source: payload.source,
        playTestOnly: true,
        accepted: true,
        started: !!playResult.started,
        queued: !!playResult.queued,
        parallel: !!playResult.parallel,
        dropped: !!playResult.dropped,
        queueTouched: touchedQueue,
        audioTouched: touchedAudio
      });

      return {
        ...resultBase,
        ok: true,
        accepted: true,
        soundSystemTouched: true,
        queueTouched: touchedQueue,
        audioTouched: touchedAudio,
        result: playTestResult,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      const playTestResult = {
        ok: false,
        accepted: false,
        playedOrQueued: false,
        started: false,
        queued: false,
        parallel: false,
        dropped: false,
        queueTouched: false,
        audioTouched: false,
        error: message,
        message: "Command payload rejected in explicit play-test mode."
      };

      state.soundBusCommand.playTestFailed = Number(state.soundBusCommand.playTestFailed || 0) + 1;
      state.soundBusCommand.errors = Number(state.soundBusCommand.errors || 0) + 1;
      state.soundBusCommand.lastError = message;
      state.soundBusCommand.lastPlayTest = playTestResult;
      state.soundBusCommand.lastResult = playTestResult;
      pushSoundBusCommandRecent({
        at,
        action: "play.request.play_test",
        command: payload.command,
        requestId: payload.requestId,
        soundId: payload.soundId,
        requestedBy: payload.requestedBy,
        source: payload.source,
        playTestOnly: true,
        accepted: false,
        error: message,
        queueTouched: false,
        audioTouched: false
      });

      return {
        ...resultBase,
        ok: false,
        accepted: false,
        soundSystemTouched: false,
        queueTouched: false,
        audioTouched: false,
        error: message,
        result: playTestResult,
        command: publicSoundBusCommandStatus({ includeRecentCommands: true })
      };
    }
  }

  function broadcastSoundStateLegacy(reason, extra = {}) {
    return functionSafeBroadcastWS({ op: config.websocket.op || MODULE_NAME, reason: reason || "state", data: publicState(), ...extra });
  }

  function broadcastSoundState(reason, extra = {}) {
    touch();
    const busConfig = soundBusConfig();
    if (soundBusMode(busConfig) === "bus_first") {
      const result = emitSoundBus(reason || "state", { kind: "state", extra });
      if (!soundBusDelivered(result) && soundBusLegacyFallbackEnabled(busConfig)) {
        broadcastSoundStateLegacy(reason, extra);
      }
      return result;
    }

    broadcastSoundStateLegacy(reason, extra);
    return emitSoundBus(reason || "state", { kind: "state", extra });
  }

  function emit(reason) {
    broadcastSoundState(reason);
  }


  // STEP265A_SOUND_BUNDLE_CORE
  function publicBundleInfo(bundleId) {
    const id = String(bundleId || "").trim();
    if (!id) return null;
    const allItems = [];
    if (state.current) allItems.push(state.current);
    if (Array.isArray(state.parallel)) allItems.push(...state.parallel);
    if (Array.isArray(state.queue)) allItems.push(...state.queue);
    const items = allItems.filter(item => item && item.bundleId === id);
    if (!items.length) return null;
    const first = items[0];
    return {
      bundleId: id,
      bundleType: first.bundleType || "",
      bundlePriority: Number(first.bundlePriority || first.priority || 0),
      bundleQueuedAt: Number(first.bundleQueuedAt || first.queuedAt || 0),
      bundleLocked: !!first.bundleLocked,
      queuedItems: items.filter(item => state.queue.includes(item)).length,
      active: !!(state.current && state.current.bundleId === id) || state.parallel.some(item => item.bundleId === id),
      totalKnownItems: items.length
    };
  }

  function publicBundleQueue() {
    const map = new Map();
    const allItems = [];
    if (state.current) allItems.push(state.current);
    if (Array.isArray(state.parallel)) allItems.push(...state.parallel);
    if (Array.isArray(state.queue)) allItems.push(...state.queue);

    for (const item of allItems) {
      if (!item || !item.bundleId) continue;
      const id = item.bundleId;
      if (!map.has(id)) {
        map.set(id, {
          bundleId: id,
          bundleType: item.bundleType || "",
          bundlePriority: Number(item.bundlePriority || item.priority || 0),
          bundleQueuedAt: Number(item.bundleQueuedAt || item.queuedAt || 0),
          bundleLocked: !!item.bundleLocked,
          queuedItems: 0,
          activeItems: 0,
          totalKnownItems: 0,
          roles: []
        });
      }
      const row = map.get(id);
      row.totalKnownItems += 1;
      if (state.queue.includes(item)) row.queuedItems += 1;
      if ((state.current && state.current.requestId === item.requestId) || state.parallel.some(active => active.requestId === item.requestId)) row.activeItems += 1;
      if (item.bundleRole && !row.roles.includes(item.bundleRole)) row.roles.push(item.bundleRole);
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.bundlePriority !== a.bundlePriority) return b.bundlePriority - a.bundlePriority;
      return a.bundleQueuedAt - b.bundleQueuedAt;
    });
  }

  function bundleSortKey(item) {
    if (!item || !item.bundleId || !item.bundleLocked) {
      return {
        grouped: false,
        priority: Number(item && item.priority || 0),
        queuedAt: Number(item && item.queuedAt || 0),
        order: 0
      };
    }
    return {
      grouped: true,
      priority: Number(item.bundlePriority || item.priority || 0),
      queuedAt: Number(item.bundleQueuedAt || item.queuedAt || 0),
      order: Number(item.bundleOrder || 0)
    };
  }

  function compareQueueItems(a, b) {
    const ak = bundleSortKey(a);
    const bk = bundleSortKey(b);
    if (bk.priority !== ak.priority) return bk.priority - ak.priority;
    if (ak.queuedAt !== bk.queuedAt) return ak.queuedAt - bk.queuedAt;
    if (ak.order !== bk.order) return ak.order - bk.order;
    return Number(a.queuedAt || 0) - Number(b.queuedAt || 0);
  }

  function pickNextLockedBundleItem() {
    const lock = state.activeBundleLock;
    if (!lock || !lock.bundleId) return null;
    let bestIndex = -1;
    let best = null;
    for (let i = 0; i < state.queue.length; i++) {
      const item = state.queue[i];
      if (!item || item.bundleId !== lock.bundleId) continue;
      if (!best || Number(item.bundleOrder || 0) < Number(best.bundleOrder || 0)) {
        best = item;
        bestIndex = i;
      }
    }
    if (bestIndex < 0) return null;
    return state.queue.splice(bestIndex, 1)[0];
  }

  function applyBundleFields(item, bundle, order, count) {
    if (!item || !bundle || !bundle.bundleId) return item;
    item.bundleId = String(bundle.bundleId || "").trim();
    item.bundleType = String(bundle.bundleType || "bundle").trim().toLowerCase();
    item.bundleLocked = bundle.bundleLocked !== false;
    item.bundlePriority = Number.isFinite(Number(bundle.bundlePriority)) ? Number(bundle.bundlePriority) : Number(item.priority || 0);
    item.bundleQueuedAt = Number(bundle.bundleQueuedAt || Date.now());
    item.bundleOrder = Number(order || 0);
    item.bundleRole = String(bundle.bundleRole || item.bundleRole || "item").trim().toLowerCase();
    item.bundleSize = Number(count || 1);
    item.meta = { ...(item.meta || {}), bundleId: item.bundleId, bundleType: item.bundleType, bundleRole: item.bundleRole, bundleOrder: item.bundleOrder, bundleSize: item.bundleSize };
    item.lifecycle = { ...(item.lifecycle || {}), bundleLocked: item.bundleLocked };
    return item;
  }

  function normalizeBundlePayload(raw = {}) {
    const body = raw || {};
    const inputItems = Array.isArray(body.items) ? body.items : [];
    if (!inputItems.length) throw new Error("Bundle enthält keine items[].");

    const bundleQueuedAt = Date.now();
    const bundleId = String(body.bundleId || body.id || `bundle_${bundleQueuedAt}_${Math.random().toString(36).slice(2, 8)}`).trim();
    const bundleType = String(body.bundleType || body.type || "bundle").trim().toLowerCase();
    const bundlePriority = Number.isFinite(Number(body.priority ?? body.bundlePriority)) ? Number(body.priority ?? body.bundlePriority) : Number(config.queue?.defaultPriority || 50);
    const bundleLocked = body.locked !== false && body.bundleLocked !== false;
    const source = String(body.source || "bundle").trim();
    const requestedBy = String(body.requestedBy || body.user || "").trim();
    const bundleMeta = objectValue(body.meta);
    const bundleVisual = objectValue(body.visual);

    const items = inputItems.map((entry, index) => {
      const role = String(entry.role || entry.bundleRole || (index === 0 ? "main" : `item_${index + 1}`)).trim().toLowerCase();
      const priorityOffset = Number(entry.priorityOffset || 0);
      const itemPriority = Number.isFinite(Number(entry.priority)) ? Number(entry.priority) : bundlePriority + priorityOffset;
      const merged = {
        ...body.defaults,
        ...entry,
        source: entry.source || source,
        requestedBy: entry.requestedBy || requestedBy,
        priority: itemPriority,
        meta: { ...bundleMeta, ...objectValue(entry.meta), bundleId, bundleType, bundleRole: role },
        visual: { ...bundleVisual, ...objectValue(entry.visual), bundleId, bundleType, bundleRole: role }
      };
      delete merged.items;
      delete merged.defaults;
      const item = normalizePlayRequest(merged);
      return applyBundleFields(item, { bundleId, bundleType, bundlePriority, bundleQueuedAt, bundleLocked, bundleRole: role }, index + 1, inputItems.length);
    });

    return { bundleId, bundleType, bundlePriority, bundleQueuedAt, bundleLocked, itemCount: items.length, items };
  }

  function enqueueBundleItems(bundle) {
    if (!bundle || !Array.isArray(bundle.items) || !bundle.items.length) throw new Error("Bundle hat keine normalisierten Items.");
    const results = [];
    for (const item of bundle.items) {
      const result = enqueueOrStart(item);
      results.push(result);
    }
    state.stats.bundlesQueued = Number(state.stats.bundlesQueued || 0) + 1;
    state.stats.bundleItemsQueued = Number(state.stats.bundleItemsQueued || 0) + bundle.items.length;
    emit("bundle_queued");
    emitSoundBus("bundle_queued", {
      kind: "bundle",
      extra: {
        bundleId: bundle.bundleId,
        bundleType: bundle.bundleType,
        bundlePriority: bundle.bundlePriority,
        bundleQueuedAt: bundle.bundleQueuedAt,
        bundleLocked: bundle.bundleLocked,
        itemCount: bundle.itemCount,
        results: results.map(result => ({
          started: !!result.started,
          queued: !!result.queued,
          dropped: !!result.dropped,
          parallel: !!result.parallel,
          queuePosition: result.queuePosition,
          reason: result.reason || "",
          requestId: result.item && result.item.requestId ? result.item.requestId : ""
        }))
      }
    });
    return results;
  }


  function safeCountTableRows(tableName) {
    const clean = String(tableName || "").trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean)) return { ok: false, count: 0, error: "invalid_table" };
    try {
      database.ensureReady();
      const row = database.get(`SELECT COUNT(*) AS count FROM ${clean}`) || {};
      return { ok: true, count: Number(row.count || 0), error: "" };
    } catch (err) {
      return { ok: false, count: 0, error: err && err.message ? err.message : String(err) };
    }
  }

  function buildStandardDiagnostics(routeInfo = null) {
    const warnings = [];
    const errors = [];
    const dbSettings = safeCountTableRows(SOUND_SETTINGS_TABLE);
    const dbOk = dbSettings.ok;
    const routeList = routeInfo && Array.isArray(routeInfo.routes) ? routeInfo.routes : publicSoundRoutes((config.routes && config.routes.prefix) || "/api/sound").routes;
    const soundList = getSoundList();
    const outputTargets = config.output && isPlainObject(config.output.targets) ? Object.keys(config.output.targets) : [];
    const legacyTargets = config.targets && isPlainObject(config.targets) ? Object.keys(config.targets) : [];
    const allowedExtensions = Array.isArray(config.allowedExtensions) ? config.allowedExtensions : [];

    if (state.enabled === false) warnings.push("sound_system_disabled");
    if (state.paused === true) warnings.push("sound_system_paused");
    if (state.configOk === false) errors.push(state.configError || "config_not_ok");
    if (state.messagesOk === false) warnings.push(state.messagesError || "messages_not_ok");
    if (!dbOk) warnings.push(dbSettings.error || "sound_settings_table_unavailable");
    if (state.device.lastError) warnings.push(state.device.lastError);
    if (state.discord.lastError) warnings.push(state.discord.lastError);
    if (state.soundBus.lastError) warnings.push(state.soundBus.lastError);
    if (state.soundBusCommand.lastError) warnings.push(state.soundBusCommand.lastError);
    if (state.canBus.lastError) warnings.push(state.canBus.lastError);

    const ok = errors.length === 0;
    const health = ok ? (warnings.length ? "warn" : "ok") : "error";

    return {
      ok,
      health,
      module: MODULE_NAME,
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      schemaVersion: SOUND_SETTINGS_SCHEMA_VERSION,
      schemaReady: dbOk,
      configSource: "database_with_json_fallback",
      textSource: state.messagesOk ? "json" : "json_fallback",
      database: {
        ok: dbOk,
        adapter: typeof database.getAdapter === "function" ? database.getAdapter() : "sqlite",
        path: typeof database.getDbPath === "function" ? (database.getDbPath() || "") : "",
        schemaVersion: typeof database.getSchemaVersion === "function" ? (dbOk ? database.getSchemaVersion(SOUND_SETTINGS_SCHEMA_MODULE) : 0) : SOUND_SETTINGS_SCHEMA_VERSION,
        expectedSchemaVersion: SOUND_SETTINGS_SCHEMA_VERSION,
        table: SOUND_SETTINGS_TABLE,
        error: dbSettings.error || ""
      },
      counts: {
        current: state.current ? 1 : 0,
        parallel: state.parallel.length,
        queued: state.queue.length,
        activeBundleLock: state.activeBundleLock ? 1 : 0,
        configuredSounds: soundList.length,
        outputTargets: outputTargets.length,
        legacyTargets: legacyTargets.length,
        allowedExtensions: allowedExtensions.length,
        settingsRows: dbSettings.count,
        routes: routeList.length,
        started: Number(state.stats.started || 0),
        queuedTotal: Number(state.stats.queued || 0),
        stopped: Number(state.stats.stopped || 0),
        skipped: Number(state.stats.skipped || 0),
        failed: Number(state.stats.failed || 0),
        deviceStarted: Number(state.stats.deviceStarted || 0),
        deviceFailed: Number(state.stats.deviceFailed || 0),
        discordStarted: Number(state.stats.discordStarted || 0),
        discordFailed: Number(state.stats.discordFailed || 0),
        parallelStarted: Number(state.stats.parallelStarted || 0),
        bundlesQueued: Number(state.stats.bundlesQueued || 0),
        bundleItemsQueued: Number(state.stats.bundleItemsQueued || 0),
        levelCorrected: Number(state.stats.levelCorrected || 0),
        levelCorrectionSkipped: Number(state.stats.levelCorrectionSkipped || 0),
        levelCorrectionFailed: Number(state.stats.levelCorrectionFailed || 0),
        soundBusEmitted: Number(state.soundBus.emitted || 0),
        soundBusSkipped: Number(state.soundBus.skipped || 0),
        soundBusErrors: Number(state.soundBus.errors || 0),
        soundBusCommandEmitted: Number(state.soundBusCommand.emitted || 0),
        soundBusCommandConsumed: Number(state.soundBusCommand.consumed || 0),
        soundBusCommandErrors: Number(state.soundBusCommand.errors || 0),
        canBusHeartbeats: Number(state.canBus.heartbeatCount || 0),
        canBusStatusPublished: Number(state.canBus.statusPublished || 0)
      },
      state: {
        enabled: state.enabled !== false,
        paused: state.paused === true,
        phase: state.current ? "playing" : (state.queue.length ? "queued" : "idle"),
        clientConnected: !!state.client.connected,
        clientLastSeenAt: Number(state.client.lastSeenAt || 0),
        clientLastEvent: state.client.lastEvent || "",
        deviceLastOk: !!state.device.lastOk,
        deviceLastAt: Number(state.device.lastAt || 0),
        discordLastOk: !!state.discord.lastOk,
        discordLastAt: Number(state.discord.lastAt || 0),
        defaultTarget: config.defaults?.target || "",
        defaultOutputTarget: config.defaults?.outputTarget || "",
        soundBusMode: soundBusMode(soundBusConfig()),
        soundBusEnabled: soundBusConfig().enabled !== false,
        soundBusCommandMode: soundBusCommandConfig().mode || "",
        soundBusCommandConsumerMode: soundBusCommandConfig().consumerMode || "",
        canBusRegistered: !!state.canBus.registered
      },
      warnings,
      errors,
      lastError: errors[0] || warnings[0] || ""
    };
  }

  function publicState() {
    const routeInfo = publicSoundRoutes((config.routes && config.routes.prefix) || "/api/sound");
    return {
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      version: state.version,
      diagnosticVersion: MODULE_VERSION,
      enabled: state.enabled,
      paused: state.paused,
      current: state.current ? publicItem(state.current) : null,
      parallel: state.parallel.map(publicItem),
      parallelCount: state.parallel.length,
      queue: state.queue.map(publicItem),
      queuedCount: state.queue.length,
      currentBundle: state.current && state.current.bundleId ? publicBundleInfo(state.current.bundleId) : null,
      activeBundleLock: state.activeBundleLock ? { ...state.activeBundleLock } : null,
      bundles: publicBundleQueue(),
      client: { ...state.client },
      device: { ...state.device },
      discord: { ...state.discord },
      soundBus: publicSoundBusStatus(),
      eventPreRoll: publicEventPreRollStatus(),
      soundBusCommand: publicSoundBusCommandStatus({ includeRecentCommands: false }),
      canBus: { ...state.canBus },
      routes: routeInfo.routes,
      routeCount: routeInfo.routes.length,
      dataEndpoints: {
        current: `${(config.routes && config.routes.prefix) || "/api/sound"}/current`,
        queue: `${(config.routes && config.routes.prefix) || "/api/sound"}/queue`,
        list: `${(config.routes && config.routes.prefix) || "/api/sound"}/list`,
        settings: `${(config.routes && config.routes.prefix) || "/api/sound"}/settings`,
        integrationCheck: `${(config.routes && config.routes.prefix) || "/api/sound"}/integration-check`,
        eventBus: `${(config.routes && config.routes.prefix) || "/api/sound"}/eventbus/status`,
        commandBus: `${(config.routes && config.routes.prefix) || "/api/sound"}/eventbus/command/status`
      },
      diagnostics: buildStandardDiagnostics(routeInfo),
      stats: { ...state.stats },
      config: {
        path: state.configPath,
        ok: state.configOk,
        error: state.configError,
        routes: config.routes || {},
        websocket: config.websocket || {},
        soundBus: config.soundBus || {},
        eventPreRoll: config.eventPreRoll || {},
        soundBusCommand: config.soundBusCommand || {},
        overlay: config.overlay || {},
        output: config.output || {},
        queue: config.queue || {},
        targets: config.targets || {},
        discordRouting: config.discordRouting || {},
        levelCorrection: publicLevelCorrectionStatus(),
        priorities: config.priorities || {},
        categoryDefaults: config.categoryDefaults || {},
        defaults: config.defaults || {},
        soundsBaseDir: config.soundsBaseDir || "",
        allowedExtensions: config.allowedExtensions || []
      },
      updatedAt: state.updatedAt,
      loadedAt: state.loadedAt
    };
  }

  function publicLifecycle(lifecycle) {
    if (!lifecycle || !isPlainObject(lifecycle)) return {};
    const out = { ...lifecycle };
    if (out.eventPreRoll && isPlainObject(out.eventPreRoll)) {
      out.eventPreRoll = { ...out.eventPreRoll };
      delete out.eventPreRoll.timer;
      delete out.eventPreRoll.guessingTimer;
      delete out.eventPreRoll.candidate;
    }
    return out;
  }

  function publicItem(item) {
    if (!item) return null;
    return {
      requestId: item.requestId,
      soundId: item.soundId,
      label: item.label,
      type: item.type,
      category: item.category,
      target: item.target,
      outputTarget: item.outputTarget,
      priority: item.priority,
      volume: item.volume,
      file: item.file,
      audioUrl: item.audioUrl,
      mediaType: item.mediaType || "audio",
      mediaUrl: item.mediaUrl || item.audioUrl || item.videoUrl || "",
      videoUrl: item.videoUrl || "",
      clipId: item.clipId || (item.meta && item.meta.clipId) || (item.visual && item.visual.clipId) || "",
      videoWidth: Number(item.videoWidth || 0),
      videoHeight: Number(item.videoHeight || 0),
      hasAudio: item.hasAudio !== false,
      hasVideo: !!item.hasVideo,
      durationMs: item.durationMs,
      durationOk: !!item.durationOk,
      durationSource: item.durationSource || "",
      frequency: item.frequency,
      source: item.source,
      requestedBy: item.requestedBy,
      meta: item.meta || {},
      visual: item.visual || {},
      lifecycle: publicLifecycle(item.lifecycle),
      levelCorrection: item.levelCorrection || null,
      queuedAt: item.queuedAt,
      startedAt: item.startedAt || 0,
      endsAt: item.endsAt || 0,
      bundle: item.bundleId ? {
        bundleId: item.bundleId,
        bundleType: item.bundleType || "",
        bundleLocked: !!item.bundleLocked,
        bundlePriority: Number(item.bundlePriority || item.priority || 0),
        bundleQueuedAt: Number(item.bundleQueuedAt || item.queuedAt || 0),
        bundleOrder: Number(item.bundleOrder || 0),
        bundleRole: item.bundleRole || "",
        bundleSize: Number(item.bundleSize || 0)
      } : null,
      flags: {
        override: !!item.override,
        force: !!item.force,
        canInterrupt: !!item.canInterrupt,
        canBeInterrupted: !!item.canBeInterrupted,
        queueIfBusy: !!item.queueIfBusy,
        dropIfBusy: !!item.dropIfBusy,
        parallelAllowed: !!item.parallelAllowed
      }
    };
  }

  function msg(key) { return messages[key] || DEFAULT_MESSAGES[key] || key; }
  function makeRequestId() { return `snd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
  function normalizeId(value) { return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g, "_"); }
  function hasOwn(obj, key) { return !!obj && Object.prototype.hasOwnProperty.call(obj, key); }
  function isPlainObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function objectValue(value) {
    if (isPlainObject(value)) return value;
    if (typeof value !== "string" || !value.trim()) return {};
    try {
      const parsed = JSON.parse(value);
      return isPlainObject(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  function boolFromBase(base, key, fallback) { return core.boolParam(hasOwn(base, key) ? base[key] : fallback, fallback); }
  function numberFromBase(base, key, fallback) {
    const n = Number(hasOwn(base, key) ? base[key] : fallback);
    return Number.isFinite(n) ? n : fallback;
  }
  function priorityForCategory(category, fallback) {
    const priorities = config.priorities || {};
    const key = normalizeId(category);
    const direct = Number(priorities[key]);
    if (Number.isFinite(direct)) return direct;
    return fallback;
  }
  function resolvePriority(base, preset, body, category) {
    if (hasOwn(body, "priority")) {
      const n = Number(body.priority);
      if (Number.isFinite(n)) return n;
    }
    if (hasOwn(preset, "priority")) {
      const n = Number(preset.priority);
      if (Number.isFinite(n)) return n;
    }
    const categoryDefault = (config.categoryDefaults && config.categoryDefaults[normalizeId(category)]) || {};
    if (hasOwn(categoryDefault, "priority")) {
      const n = Number(categoryDefault.priority);
      if (Number.isFinite(n)) return n;
    }
    const byCategory = priorityForCategory(category, NaN);
    if (Number.isFinite(byCategory)) return byCategory;
    if (hasOwn(config.defaults || {}, "priority")) {
      const n = Number((config.defaults || {}).priority);
      if (Number.isFinite(n)) return n;
    }
    return Number(config.queue?.defaultPriority || 50);
  }
  function applyCategoryDefaults(defaults, preset, body) {
    const rawCategory = String(body.category || preset.category || defaults.category || "fun").trim().toLowerCase();
    const categoryDefaults = (config.categoryDefaults && config.categoryDefaults[normalizeId(rawCategory)]) || {};
    return { ...defaults, ...categoryDefaults, ...preset, ...body, category: rawCategory };
  }

  function getSoundsBaseDir() {
    const raw = String(config.soundsBaseDir || "htdocs/assets/sounds").trim();
    if (path.isAbsolute(raw)) return raw;
    return cfg.resolveFromRoot(raw);
  }

  function getSoundList() { return Array.isArray(config.sounds) ? config.sounds : []; }
  function findSound(soundId) { const id = normalizeId(soundId); return getSoundList().find(sound => normalizeId(sound.id) === id) || null; }

  function browserUrlFromRelative(relativeFile) {
    const clean = String(relativeFile || "").replace(/\\/g, "/").replace(/^\/+/, "");
    return `/assets/sounds/${clean}`;
  }

  // STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT
  // Erlaubt /api/sound/play und /api/sound/bundle Items mit mediaId/media_id direkt aus der Media-Registry.
  // Dadurch muessen neue Module nicht mehr zwingend nach htdocs/assets/sounds kopieren.
  function assetsBaseDir() {
    if (typeof cfg.getAssetsDir === "function") return cfg.getAssetsDir();
    return cfg.resolveFromRoot("htdocs", "assets");
  }

  function normalizeAssetRelativePath(value) {
    return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
  }

  function pathInside(parent, child) {
    const rootPath = path.resolve(parent);
    const targetPath = path.resolve(child);
    const rel = path.relative(rootPath, targetPath);
    return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel) || rel === "";
  }

  function mediaWebPathFromRelative(relativePath, fallbackWebPath) {
    const direct = String(fallbackWebPath || "").trim();
    if (direct) return direct.replace(/\\/g, "/");
    const rel = normalizeAssetRelativePath(relativePath);
    return rel ? `/assets/${rel}` : "";
  }

  function mediaTypeFromRegistry(row, info, rawType) {
    const rowType = String(row && row.type || "").toLowerCase();
    if (rowType === "video" || rowType === "animation") return "video";
    if (rowType === "audio") return "audio";
    if (info && info.hasVideo) return "video";
    if (rawType === "video") return "video";
    return "audio";
  }

  function resolveMediaRegistryPayload(body = {}) {
    const mediaId = Number(body.mediaId || body.media_id || body.mediaAssetId || body.assetId || 0);
    const mediaRef = normalizeAssetRelativePath(body.mediaPath || body.mediaRelativePath || body.registryPath || "");
    if (!mediaId && !mediaRef) return null;

    let row = null;
    if (mediaId) {
      row = database.get("SELECT * FROM media_assets WHERE id = :id AND status = :status LIMIT 1", { id: mediaId, status: "active" }) || null;
    } else if (mediaRef) {
      row = database.get("SELECT * FROM media_assets WHERE relative_path = :path AND status = :status LIMIT 1", { path: mediaRef, status: "active" }) || null;
    }
    if (!row) throw new Error(`Media-Registry Asset wurde nicht gefunden: ${mediaId || mediaRef}`);

    const assetsDir = assetsBaseDir();
    const relativePath = normalizeAssetRelativePath(row.relative_path || row.relativePath || mediaRef);
    const absolutePath = path.resolve(row.absolute_path || row.absolutePath || path.join(assetsDir, relativePath));
    if (!relativePath) throw new Error("Media-Registry Asset hat keinen relativen Pfad.");
    if (!pathInside(assetsDir, absolutePath)) throw new Error("Media-Registry Asset liegt ausserhalb des Assets-Ordners.");
    if (!fs.existsSync(absolutePath)) throw new Error(`Media-Registry Datei fehlt: ${relativePath}`);

    const allowed = Array.isArray(config.allowedExtensions) ? config.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS;
    if (!media.extensionAllowed(absolutePath, allowed)) throw new Error(`Media-Registry Dateityp ist fuer Sound-System nicht erlaubt: ${path.extname(absolutePath)}`);

    const info = media.readMediaInfo(absolutePath, {});
    const fallbackDuration = Number(row.duration_ms || row.durationMs || 0);
    if ((!info || !info.durationMs) && fallbackDuration > 0) {
      info.durationMs = fallbackDuration;
      info.durationOk = true;
    }
    if (row.has_audio === 1 || row.hasAudio === true) info.hasAudio = true;
    if (row.has_video === 1 || row.hasVideo === true) info.hasVideo = true;

    const webPath = mediaWebPathFromRelative(relativePath, row.web_path || row.webPath || "");
    return {
      id: Number(row.id || mediaId || 0),
      row,
      relativePath,
      absolutePath,
      webPath,
      info,
      mediaType: mediaTypeFromRegistry(row, info, String(body.mediaType || body.type || "").toLowerCase()),
      label: String(row.display_name || row.displayName || row.file_name || row.fileName || path.basename(relativePath) || "").trim()
    };
  }

  function clampVolume(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function clampDb(value, fallback, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function roundOne(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 10) / 10;
  }

  function gainDbToVolume(gainDb, maxVolume) {
    const gain = Number(gainDb);
    if (!Number.isFinite(gain)) return null;
    const base = clampVolume(maxVolume, DEFAULT_LEVEL_CORRECTION_SETTINGS.maxPlaybackVolume);
    const linear = Math.pow(10, gain / 20);
    return Math.max(1, Math.min(100, Math.round(base * linear)));
  }

  function sanitizeLevelCorrectionSettings(raw) {
    const input = isPlainObject(raw) ? raw : {};
    const mode = String(input.mode || DEFAULT_LEVEL_CORRECTION_SETTINGS.mode).trim().toLowerCase();
    const targets = Array.isArray(input.applyToTargets) ? input.applyToTargets : DEFAULT_LEVEL_CORRECTION_SETTINGS.applyToTargets;
    return {
      enabled: input.enabled === true,
      mode: ["off", "preview", "ready", "active", "apply"].includes(mode) ? mode : "off",
      targetLufs: clampDb(input.targetLufs, DEFAULT_LEVEL_CORRECTION_SETTINGS.targetLufs, -40, -6),
      truePeakLimitDbtp: clampDb(input.truePeakLimitDbtp, DEFAULT_LEVEL_CORRECTION_SETTINGS.truePeakLimitDbtp, -12, 0),
      maxPlaybackVolume: clampVolume(input.maxPlaybackVolume, DEFAULT_LEVEL_CORRECTION_SETTINGS.maxPlaybackVolume),
      minPlaybackVolume: clampVolume(input.minPlaybackVolume, DEFAULT_LEVEL_CORRECTION_SETTINGS.minPlaybackVolume),
      maxBoostDb: clampDb(input.maxBoostDb, DEFAULT_LEVEL_CORRECTION_SETTINGS.maxBoostDb, 0, 18),
      maxCutDb: clampDb(input.maxCutDb, DEFAULT_LEVEL_CORRECTION_SETTINGS.maxCutDb, 0, 12),
      strengthPercent: Math.max(0, Math.min(100, Math.round(Number(input.strengthPercent ?? DEFAULT_LEVEL_CORRECTION_SETTINGS.strengthPercent)))),
      protectTruePeak: input.protectTruePeak !== false,
      excludeTts: input.excludeTts !== false,
      applyToTargets: Array.from(new Set(targets.map(v => String(v || "").trim().toLowerCase()).filter(Boolean)))
    };
  }

  function readLevelCorrectionSettings() {
    const fallback = sanitizeLevelCorrectionSettings(DEFAULT_LEVEL_CORRECTION_SETTINGS);
    try {
      database.ensureReady();
      if (typeof database.tableExists === "function" && !database.tableExists(LEVEL_CORRECTION_SETTINGS_TABLE)) return fallback;
      const row = database.get(`SELECT value_json FROM ${LEVEL_CORRECTION_SETTINGS_TABLE} WHERE key = :key`, { key: "correction" }) || null;
      if (!row || !row.value_json) return fallback;
      const parsed = JSON.parse(String(row.value_json || "{}"));
      return sanitizeLevelCorrectionSettings({ ...fallback, ...(isPlainObject(parsed) ? parsed : {}) });
    } catch (_) {
      return fallback;
    }
  }

  function publicLevelCorrectionStatus() {
    const settings = readLevelCorrectionSettings();
    return {
      enabled: settings.enabled,
      mode: settings.mode,
      active: isLevelCorrectionActive(settings),
      targetLufs: settings.targetLufs,
      truePeakLimitDbtp: settings.truePeakLimitDbtp,
      maxPlaybackVolume: settings.maxPlaybackVolume,
      minPlaybackVolume: settings.minPlaybackVolume,
      maxBoostDb: settings.maxBoostDb,
      maxCutDb: settings.maxCutDb,
      strengthPercent: settings.strengthPercent,
      protectTruePeak: settings.protectTruePeak,
      excludeTts: settings.excludeTts,
      applyToTargets: settings.applyToTargets
    };
  }

  function isLevelCorrectionActive(settings) {
    return !!settings && settings.enabled === true && ["ready", "active", "apply"].includes(String(settings.mode || "").toLowerCase());
  }

  function normalizeRelativeSoundPath(value) {
    return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
  }

  function looksLikeTtsSoundPath(relativePath, item) {
    const clean = normalizeRelativeSoundPath(relativePath).toLowerCase();
    const segments = clean.split("/").filter(Boolean);
    if (segments.some(segment => LEVEL_CORRECTION_EXCLUDED_SEGMENTS.includes(segment))) return true;
    const baseName = path.basename(clean);
    if (/^tts[-_]/i.test(baseName)) return true;
    const source = normalizeId(item && item.source || "");
    const category = normalizeId(item && item.category || "");
    const soundId = normalizeId(item && item.soundId || "");
    return [source, category, soundId].some(value => value === "tts" || value === "tts_system" || value === "alert_tts" || value.startsWith("tts_"));
  }

  function levelCorrectionTargetMatches(item, settings) {
    const targets = Array.isArray(settings.applyToTargets) ? settings.applyToTargets.map(v => String(v || "").toLowerCase()) : [];
    if (!targets.length) return true;
    const legacyTarget = String(item.target || "").toLowerCase();
    const outputTarget = String(item.outputTarget || "").toLowerCase();
    return targets.includes(legacyTarget) || targets.includes(outputTarget);
  }

  function readLevelCorrectionRow(relativePath) {
    try {
      database.ensureReady();
      if (typeof database.tableExists === "function" && !database.tableExists(LEVEL_CORRECTION_FILES_TABLE)) return null;
      return database.get(`SELECT * FROM ${LEVEL_CORRECTION_FILES_TABLE} WHERE relative_path = :relativePath`, { relativePath }) || null;
    } catch (_) {
      return null;
    }
  }

  function buildLevelCorrectionResult(item, settings) {
    const result = {
      active: isLevelCorrectionActive(settings),
      applied: false,
      reason: "inactive",
      originalVolume: Number(item && item.volume || 0),
      correctedVolume: Number(item && item.volume || 0),
      gainDb: null,
      rawGainDb: null,
      file: normalizeRelativeSoundPath(item && item.file || ""),
      targetLufs: settings.targetLufs,
      inputI: null,
      inputTp: null,
      strengthPercent: Number(settings.strengthPercent ?? DEFAULT_LEVEL_CORRECTION_SETTINGS.strengthPercent),
      minPlaybackVolume: Number(settings.minPlaybackVolume ?? DEFAULT_LEVEL_CORRECTION_SETTINGS.minPlaybackVolume),
      notes: []
    };

    if (!result.active) return result;
    if (!item || !item.file || item.file === "generated/beep.wav") return { ...result, reason: "generated_or_missing_file" };
    if (isVideoItem(item)) return { ...result, reason: "video_skipped" };
    if (!levelCorrectionTargetMatches(item, settings)) return { ...result, reason: "target_not_enabled" };
    if (settings.excludeTts && looksLikeTtsSoundPath(result.file, item)) return { ...result, reason: "tts_excluded" };

    const row = readLevelCorrectionRow(result.file);
    if (!row) return { ...result, reason: "not_scanned" };
    if (String(row.status || "") === "error") return { ...result, reason: "scan_error" };

    const inputI = Number(row.input_i);
    const inputTp = Number(row.input_tp);
    if (!Number.isFinite(inputI)) return { ...result, reason: "missing_lufs" };

    const rawGainDb = Number(settings.targetLufs) - inputI;
    const strength = Math.max(0, Math.min(100, Number(settings.strengthPercent ?? DEFAULT_LEVEL_CORRECTION_SETTINGS.strengthPercent))) / 100;
    let gainDb = rawGainDb * strength;
    const notes = [];
    if (strength < 1) notes.push("strength_limited");
    if (gainDb > Number(settings.maxBoostDb)) {
      gainDb = Number(settings.maxBoostDb);
      notes.push("max_boost_limited");
    }
    if (gainDb < -Number(settings.maxCutDb)) {
      gainDb = -Number(settings.maxCutDb);
      notes.push("max_cut_limited");
    }
    if (settings.protectTruePeak && Number.isFinite(inputTp) && gainDb > 0 && inputTp + gainDb > Number(settings.truePeakLimitDbtp)) {
      gainDb = Number(settings.truePeakLimitDbtp) - inputTp;
      notes.push("true_peak_protected");
    }

    let correctedVolume = gainDbToVolume(gainDb, settings.maxPlaybackVolume);
    if (!Number.isFinite(Number(correctedVolume))) return { ...result, reason: "volume_unavailable", inputI: roundOne(inputI), inputTp: roundOne(inputTp), rawGainDb: roundOne(rawGainDb), gainDb: roundOne(gainDb), notes };
    const minPlaybackVolume = clampVolume(settings.minPlaybackVolume, DEFAULT_LEVEL_CORRECTION_SETTINGS.minPlaybackVolume);
    if (gainDb < 0 && correctedVolume < minPlaybackVolume) {
      correctedVolume = minPlaybackVolume;
      notes.push("min_volume_floor");
    }

    return {
      ...result,
      applied: true,
      reason: "applied_safe",
      correctedVolume,
      inputI: roundOne(inputI),
      inputTp: roundOne(inputTp),
      rawGainDb: roundOne(rawGainDb),
      gainDb: roundOne(gainDb),
      strengthPercent: Math.round(strength * 100),
      minPlaybackVolume,
      notes,
      scanId: String(row.scan_id || ""),
      scannedAt: String(row.scanned_at || "")
    };
  }

  function applyLevelCorrection(item) {
    if (!item) return item;
    const settings = readLevelCorrectionSettings();
    const correction = buildLevelCorrectionResult(item, settings);
    item.levelCorrection = correction;
    item.lifecycle = { ...(item.lifecycle || {}), levelCorrection: correction };
    if (!correction.active) return item;
    if (!correction.applied) {
      state.stats.levelCorrectionSkipped = Number(state.stats.levelCorrectionSkipped || 0) + 1;
      return item;
    }
    item.volume = correction.correctedVolume;
    state.stats.levelCorrected = Number(state.stats.levelCorrected || 0) + 1;
    return item;
  }

  function normalizeTarget(rawTarget) {
    const fallback = (config.defaults && config.defaults.target) || "stream";
    const target = String(rawTarget || fallback).trim().toLowerCase();
    if (["stream", "discord", "both"].includes(target)) return target;
    return fallback;
  }

  function normalizeDiscordRoutingTarget(rawTarget, fallback = "both") {
    const target = String(rawTarget || fallback).trim().toLowerCase();
    if (["stream", "discord", "both"].includes(target)) return target;
    return fallback;
  }

  function listMatchesNormalized(list, value) {
    const needle = normalizeId(value);
    if (!needle || !Array.isArray(list)) return false;
    return list.map(v => normalizeId(v)).filter(Boolean).includes(needle);
  }

  // STEP269B_SOUND_SYSTEM_DISCORD_AUTO_ROUTING
  // Automatische Discord-Zielwahl passiert zentral im Sound-System.
  // Module wie Alert-System, SoundAlerts, VIP/Mod oder TTS muessen dafuer nicht einzeln umgebaut werden.
  function resolveDiscordRoutedTarget(base, body, currentTarget) {
    const routing = config.discordRouting && isPlainObject(config.discordRouting) ? config.discordRouting : DEFAULT_CONFIG.discordRouting;
    if (!routing || routing.enabled === false) return currentTarget;

    const explicitTarget = hasOwn(body, "target") || hasOwn(body, "legacyTarget") || hasOwn(body, "soundTarget");
    if (explicitTarget && routing.overrideExplicitTarget !== true) return currentTarget;

    if (currentTarget === "discord" || currentTarget === "both") return currentTarget;

    const category = base.category || body.category || "";
    const source = base.source || body.source || "";
    const matchesCategory = listMatchesNormalized(routing.categories, category);
    const matchesSource = listMatchesNormalized(routing.sources, source);
    if (!matchesCategory && !matchesSource) return currentTarget;

    const routedTarget = normalizeDiscordRoutingTarget(routing.target || "both", "both");
    if (targetEnabled(routedTarget)) return routedTarget;
    if (routedTarget === "both" && targetEnabled("discord")) return "discord";
    return currentTarget;
  }

  function normalizeOutputTarget(rawOutputTarget, legacyTarget) {
    const fallback = (config.output && config.output.defaultTarget) || (config.defaults && config.defaults.outputTarget) || "overlay";
    const value = String(rawOutputTarget || fallback).trim().toLowerCase();
    if (["overlay", "device", "both"].includes(value)) return value;
    if (legacyTarget === "both") return "both";
    return fallback;
  }

  function shouldUseOverlay(item) { return item.outputTarget === "overlay" || item.outputTarget === "both"; }
  function shouldUseDevice(item) { return item.outputTarget === "device" || item.outputTarget === "both"; }
  function shouldUseDiscord(item) { return item.target === "discord" || item.target === "both"; }
  function isTwitchClipItem(item) {
    const mediaType = String(item && (item.mediaType || item.type) || "").toLowerCase();
    return mediaType === "twitch_clip" || mediaType === "clip_twitch" || !!(item && item.clipId && item.meta && item.meta.clipShoutout);
  }
  function isVideoItem(item) { return isTwitchClipItem(item) || String(item && item.mediaType || item && item.type || "").toLowerCase() === "video" || !!(item && item.videoUrl); }
  function shouldWaitForOverlayEnd(item) { return isVideoItem(item) && shouldUseOverlay(item); }
  function videoFallbackFinishMs(item) {
    const overlayCfg = config.overlay || {};
    const duration = Number(item && item.durationMs || 0);
    const outro = Number(item && item.outroMs || 0);
    const buffer = Math.max(1000, Number(overlayCfg.videoFallbackBufferMs || 5000));
    const hardFallback = Math.max(30000, Number(overlayCfg.videoFallbackFinishMs || 300000));
    if (isTwitchClipItem(item) && duration > 0) return Math.max(5000, duration + outro + Math.min(buffer, 2000));
    if (item && item.durationOk && duration > 0) return Math.max(5000, duration + outro + buffer);
    return hardFallback;
  }

  function targetEnabled(target) {
    const t = config.targets && config.targets[target];
    return !!t && t.enabled !== false;
  }

  function outputTargetEnabled(outputTarget) {
    const output = config.output || DEFAULT_OUTPUT;
    const targets = output.targets || DEFAULT_OUTPUT.targets;
    if (outputTarget === "overlay") return targets.overlay && targets.overlay.enabled !== false;
    if (outputTarget === "device") return targets.device && targets.device.enabled !== false;
    if (outputTarget === "both") return (targets.both && targets.both.enabled !== false) || true;
    return true;
  }

  function intInRange(value, fallback, min, max) {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function resolveHelperPath() {
    const output = config.output || DEFAULT_OUTPUT;
    const helper = output.targets?.device?.helper || DEFAULT_OUTPUT.targets.device.helper;
    const raw = String(helper.path || "tools/audio-device-helper/dist/AudioDeviceHelper.exe");
    if (path.isAbsolute(raw)) return raw;
    return cfg.resolveFromRoot(raw);
  }

  function getDeviceConfig() {
    const output = config.output || DEFAULT_OUTPUT;
    return output.targets?.device || DEFAULT_OUTPUT.targets.device;
  }

  function getDevicePlaybackMode(item) {
    const deviceConfig = getDeviceConfig();
    return String(item.deviceMode || item.outputMode || deviceConfig.helper?.playbackMode || deviceConfig.modeHint || "auto").trim().toLowerCase();
  }

  function effectiveHelperTimeoutMs(item, helper) {
    const configured = Number(helper && helper.timeoutMs ? helper.timeoutMs : 30000);
    const soundDuration = Number(item && item.durationMs ? item.durationMs : 0);
    const outroMs = Number(item && item.outroMs ? item.outroMs : 0);
    const needed = soundDuration + outroMs + 10000;
    return Math.max(1000, Math.ceil(Math.max(configured, needed)));
  }

  function createBeepWavBuffer(options = {}) {
    const sampleRate = 44100;
    const durationMs = intInRange(options.durationMs, 350, 80, 3000);
    const frequency = intInRange(options.frequency, 880, 80, 2000);
    const volume = Math.max(0.01, Math.min(1, Number(options.volume || 0.35)));
    const samples = Math.max(1, Math.floor(sampleRate * durationMs / 1000));
    const dataSize = samples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write("RIFF", 0, "ascii");
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write("WAVE", 8, "ascii");
    buffer.write("fmt ", 12, "ascii");
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write("data", 36, "ascii");
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const fadeSamples = Math.min(1400, Math.floor(samples / 3));
      const fadeIn = fadeSamples > 0 ? Math.min(1, i / fadeSamples) : 1;
      const fadeOut = fadeSamples > 0 ? Math.min(1, (samples - i) / fadeSamples) : 1;
      const fade = Math.max(0, Math.min(fadeIn, fadeOut));
      const value = Math.round(Math.sin(2 * Math.PI * frequency * t) * 28000 * volume * fade);
      buffer.writeInt16LE(value, 44 + i * 2);
    }
    return buffer;
  }

  function resolveDurationMs(base, audioInfo, fallbackMs, generatedBeep) {
    const explicit = Number(base.durationMs);
    if (Number.isFinite(explicit) && explicit > 0) {
      return { durationMs: Math.max(100, Math.round(explicit)), durationOk: true, source: "explicit" };
    }
    if (generatedBeep) {
      return { durationMs: Math.max(100, fallbackMs), durationOk: true, source: "generated" };
    }
    if (audioInfo && audioInfo.durationOk && Number(audioInfo.durationMs) > 0) {
      return { durationMs: Math.max(100, Math.round(Number(audioInfo.durationMs))), durationOk: true, source: "ffprobe" };
    }
    return { durationMs: Math.max(100, fallbackMs), durationOk: false, source: "fallback" };
  }

  function alertVisualLeadMs(item) {
    if (!item) return 0;
    const sync = config.queue?.alertSync || {};
    if (sync.enabled === false) return 0;

    const visualModule = normalizeId(item.visual && item.visual.module);
    const category = normalizeId(item.category);
    const hasAlertVisual = visualModule === "alert_system" || category === "alert" || category === "alert_critical";
    if (!hasAlertVisual) return 0;

    const fallbackLead = 150;
    const rawLead = Number(sync.visualLeadMs);
    const rawMax = Number(sync.maxVisualLeadMs);
    const maxLead = Number.isFinite(rawMax) ? Math.max(0, Math.min(1000, rawMax)) : 500;
    const lead = Number.isFinite(rawLead) ? rawLead : fallbackLead;
    return Math.max(0, Math.min(maxLead, Math.round(lead)));
  }

  function itemStillActive(item, parallel) {
    if (!item) return false;
    if (parallel) return state.parallel.some(active => active.requestId === item.requestId);
    return !!state.current && state.current.requestId === item.requestId;
  }

  function parallelAllowedByPolicy(item) {
    if (!item.parallelAllowed) return false;
    const queueCfg = config.queue || {};
    if (queueCfg.allowParallel === false) return false;
    const maxParallel = Number(queueCfg.maxParallel || 0);
    if (maxParallel > 0 && state.parallel.length >= maxParallel) return false;

    const categories = Array.isArray(queueCfg.parallelCategories) ? queueCfg.parallelCategories.map(v => normalizeId(v)) : [];
    const ids = Array.isArray(queueCfg.parallelSoundIds) ? queueCfg.parallelSoundIds.map(v => normalizeId(v)) : [];
    if (!categories.length && !ids.length) return true;
    return categories.includes(normalizeId(item.category)) || ids.includes(normalizeId(item.soundId));
  }

  function sanitizeDirectMediaUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (!/^https?:\/\//i.test(text)) return "";
    return text;
  }

  function directSoundIdFromUrl(value) {
    const url = sanitizeDirectMediaUrl(value);
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const base = path.basename(parsed.pathname || "");
      return normalizeId(base ? base.replace(path.extname(base), "") : parsed.hostname);
    } catch (_) {
      return normalizeId(url.split(/[?#]/)[0].split("/").filter(Boolean).pop() || "external_media");
    }
  }

  function normalizePlayRequest(raw) {
    const body = raw || {};
    const soundId = normalizeId(body.soundId || body.id || body.sound || "");
    const preset = soundId ? findSound(soundId) : null;
    if (soundId && !preset) throw new Error(msg("soundNotFound"));

    const base = applyCategoryDefaults(config.defaults || {}, preset || {}, body);
    const rawType = String(base.type || "file").trim().toLowerCase();
    const generatedBeep = rawType === "generated_beep";
    const baseMeta = objectValue(base.meta);
    const baseVisual = objectValue(base.visual);
    const requestedClipId = String(base.clipId || body.clipId || baseMeta.clipId || baseVisual.clipId || "").trim();
    const isTwitchClipRequest = rawType === "twitch_clip" || String(base.mediaType || base.kind || "").trim().toLowerCase() === "twitch_clip";
    const initialTarget = normalizeTarget(base.target);
    const target = resolveDiscordRoutedTarget(base, body, initialTarget);
    const outputTarget = normalizeOutputTarget(base.outputTarget || base.output || base.targetOutput, target);
    if (!targetEnabled(target)) throw new Error(msg("targetDisabled"));
    if (!outputTargetEnabled(outputTarget)) throw new Error(`Sound-Ausgabeziel ist deaktiviert: ${outputTarget}`);

    const targetConfig = (config.targets && config.targets[target]) || {};
    const outputConfig = config.output?.targets?.[outputTarget] || {};
    const volume = clampVolume(base.volume, clampVolume(outputConfig.defaultVolume, clampVolume(targetConfig.defaultVolume, 85)));
    const fallbackDurationMs = Math.max(100, Number(config.overlay?.fallbackFinishMs || 12000));
    const frequency = Math.max(80, Math.min(2000, Number(base.frequency || 880)));

    let file = String(base.file || body.file || "").trim().replace(/\\/g, "/");
    const directMediaUrl = sanitizeDirectMediaUrl(base.videoUrl || body.videoUrl || base.mediaUrl || body.mediaUrl || base.audioUrl || body.audioUrl || file);
    if (directMediaUrl && /^https?:\/\//i.test(file)) file = "";
    let fullPath = "";
    let audioUrl = "";
    let mediaUrl = "";
    let videoUrl = "";
    let type = rawType;
    let mediaType = String(base.mediaType || base.kind || "").trim().toLowerCase();
    let mediaInfo = null;
    let hasAudio = true;
    let hasVideo = false;
    let videoWidth = 0;
    let videoHeight = 0;
    const registryMedia = resolveMediaRegistryPayload(body);

    if (isTwitchClipRequest) {
      if (!requestedClipId) throw new Error("twitch_clip_id_missing");
      type = "twitch_clip";
      mediaType = "twitch_clip";
      file = "";
      fullPath = "";
      audioUrl = "";
      mediaUrl = "";
      videoUrl = "";
      hasAudio = true;
      hasVideo = true;
      videoWidth = Number(base.videoWidth || body.videoWidth || 0);
      videoHeight = Number(base.videoHeight || body.videoHeight || 0);
      base.meta = { ...baseMeta, twitchClip: true, externalMedia: { direct: false, mediaType: "twitch_clip" }, clipId: requestedClipId };
      base.visual = { ...baseVisual, clipId: requestedClipId };
    } else if (generatedBeep) {
      type = "file";
      mediaType = "audio";
      file = "generated/beep.wav";
      const beepDuration = Number(base.durationMs || 350);
      audioUrl = `${(config.routes && config.routes.prefix) || "/api/sound"}/generated/beep.wav?frequency=${encodeURIComponent(frequency)}&durationMs=${encodeURIComponent(beepDuration)}&volume=${encodeURIComponent(volume)}`;
      mediaUrl = audioUrl;
      hasAudio = true;
      hasVideo = false;
    } else if (registryMedia) {
      type = "file";
      file = registryMedia.relativePath;
      fullPath = registryMedia.absolutePath;
      mediaInfo = registryMedia.info || {};
      mediaUrl = registryMedia.webPath;
      hasAudio = mediaInfo.hasAudio !== false;
      hasVideo = !!mediaInfo.hasVideo;
      videoWidth = Number(mediaInfo.width || 0);
      videoHeight = Number(mediaInfo.height || 0);
      if (!mediaType || !["audio", "video"].includes(mediaType)) mediaType = registryMedia.mediaType || (hasVideo ? "video" : "audio");
      type = mediaType === "video" ? "video" : rawType;
      if (mediaType === "video") {
        videoUrl = mediaUrl;
      } else {
        audioUrl = mediaUrl;
      }
      base.meta = { ...objectValue(base.meta), mediaRegistry: { id: registryMedia.id, relativePath: registryMedia.relativePath, webPath: registryMedia.webPath, direct: true } };
      if (!base.label && registryMedia.label) base.label = registryMedia.label;
    } else if (directMediaUrl) {
      mediaUrl = directMediaUrl;
      if (!mediaType || !["audio", "video"].includes(mediaType)) {
        mediaType = rawType === "video" || base.hasVideo === true || body.hasVideo === true ? "video" : "audio";
      }
      type = mediaType === "video" ? "video" : (rawType === "video" ? "file" : rawType);
      hasAudio = base.hasAudio !== false && body.hasAudio !== false;
      hasVideo = mediaType === "video" || base.hasVideo === true || body.hasVideo === true;
      videoWidth = Number(base.videoWidth || body.videoWidth || 0);
      videoHeight = Number(base.videoHeight || body.videoHeight || 0);
      if (mediaType === "video") {
        videoUrl = mediaUrl;
      } else {
        audioUrl = mediaUrl;
      }
      base.meta = { ...objectValue(base.meta), externalMedia: { direct: true, mediaType } };
    } else {
      if (!file) throw new Error(msg("soundFileMissing"));
      mediaInfo = media.getMediaInfo(file, {
        baseDir: getSoundsBaseDir(),
        allowedExtensions: Array.isArray(config.allowedExtensions) ? config.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS
      });
      if (!mediaInfo.ok) throw new Error(`${msg("soundFileMissing")} (${mediaInfo.error || "unknown"}: ${file})`);
      fullPath = mediaInfo.path;
      mediaUrl = browserUrlFromRelative(mediaInfo.relative || file);
      hasAudio = mediaInfo.hasAudio !== false;
      hasVideo = !!mediaInfo.hasVideo;
      videoWidth = Number(mediaInfo.width || 0);
      videoHeight = Number(mediaInfo.height || 0);
      if (!mediaType || !["audio", "video"].includes(mediaType)) mediaType = hasVideo || rawType === "video" ? "video" : "audio";
      type = mediaType === "video" ? "video" : (rawType === "video" ? "file" : rawType);
      if (mediaType === "video") {
        videoUrl = mediaUrl;
      } else {
        audioUrl = mediaUrl;
      }
    }

    const resolvedDuration = resolveDurationMs(base, mediaInfo, fallbackDurationMs, generatedBeep);
    const effectiveOutputTarget = mediaType === "video" || mediaType === "twitch_clip" ? "overlay" : outputTarget;

    const normalizedItem = {
      requestId: makeRequestId(),
      soundId: soundId || normalizeId(requestedClipId ? `twitch_clip_${requestedClipId}` : (file ? path.basename(file, path.extname(file)) : (directSoundIdFromUrl(mediaUrl) || "generated_beep"))),
      label: String(base.label || soundId || file || (mediaUrl ? "External Media" : "Generated Beep")).trim(),
      type,
      category: String(base.category || "fun").trim().toLowerCase(),
      target,
      outputTarget: effectiveOutputTarget,
      priority: resolvePriority(base, preset || {}, body, base.category || "fun"),
      volume,
      file,
      fullPath,
      audioUrl,
      mediaType,
      mediaUrl,
      videoUrl,
      clipId: requestedClipId,
      videoWidth,
      videoHeight,
      hasAudio,
      hasVideo,
      durationMs: resolvedDuration.durationMs,
      durationOk: resolvedDuration.durationOk,
      durationSource: resolvedDuration.source,
      frequency,
      deviceMode: base.deviceMode || base.outputMode || "",
      introMs: Number(config.overlay?.introMs || 0),
      outroMs: Number(config.overlay?.outroMs || 350),
      gapAfterMs: Number(config.overlay?.gapBetweenSoundsMs || 750),
      source: String(base.source || "manual").trim(),
      requestedBy: String(base.requestedBy || base.user || "").trim(),
      meta: objectValue(base.meta),
      visual: objectValue(base.visual),
      lifecycle: { startSignalEmitted: false, discordRouted: target !== initialTarget, originalTarget: initialTarget },
      override: boolFromBase(base, "override", false),
      force: boolFromBase(base, "force", false),
      clearQueue: boolFromBase(base, "clearQueue", false),
      canInterrupt: boolFromBase(base, "canInterrupt", false),
      canBeInterrupted: boolFromBase(base, "canBeInterrupted", true),
      queueIfBusy: boolFromBase(base, "queueIfBusy", true),
      dropIfBusy: boolFromBase(base, "dropIfBusy", false),
      parallelAllowed: boolFromBase(base, "parallelAllowed", false),
      cooldownMs: numberFromBase(base, "cooldownMs", 0),
      queuedAt: Date.now(),
      startedAt: 0,
      endsAt: 0
    };

    return applyLevelCorrection(normalizedItem);
  }

  function sortQueue() {
    if (config.queue?.sortByPriority === false) {
      state.queue.sort((a, b) => a.queuedAt - b.queuedAt);
      return;
    }
    state.queue.sort(compareQueueItems);
  }

  function broadcastItemEventLegacy(reason, item, extra = {}) {
    if (!item) return false;
    return functionSafeBroadcastWS({
      op: config.websocket.op || MODULE_NAME,
      reason,
      item: publicItem(item),
      data: publicState(),
      ...extra
    });
  }

  function emitItemEvent(reason, item, extra = {}) {
    if (!item) return;
    const busConfig = soundBusConfig();
    if (soundBusMode(busConfig) === "bus_first") {
      const result = emitSoundBus(reason, { item, extra, kind: "item" });
      if (!soundBusDelivered(result) && soundBusLegacyFallbackEnabled(busConfig)) {
        broadcastItemEventLegacy(reason, item, extra);
      }
      return result;
    }

    broadcastItemEventLegacy(reason, item, extra);
    return emitSoundBus(reason, { item, extra, kind: "item" });
  }

  function canInterruptCurrent(item, current) {
    if (!item || !current) return false;
    const rules = config.queue?.interruptRules || {};
    if (item.force && rules.allowForce !== false) return true;
    if (rules.enabled === false) return false;
    if (item.override && rules.allowOverride !== false) {
      if (current.canBeInterrupted === false) return false;
      if (rules.requireHigherPriority !== false && item.priority <= current.priority) return false;
      return true;
    }
    if (!item.canInterrupt || current.canBeInterrupted === false) return false;
    const minPriority = Number.isFinite(Number(rules.minPriority)) ? Number(rules.minPriority) : 0;
    if (item.priority < minPriority) return false;
    if (rules.requireHigherPriority !== false && item.priority <= current.priority) return false;
    return true;
  }

  function shouldDropBusy(item) {
    if (!item) return false;
    if (item.dropIfBusy || item.queueIfBusy === false) return true;
    const rules = config.queue?.dropRules || {};
    if (rules.enabled === false) return false;
    const threshold = Number(rules.dropIfBusyBelowPriority);
    return Number.isFinite(threshold) && item.priority <= threshold;
  }

  function shouldDropQueueFull(item) {
    if (config.queue?.dropWhenFull === false) return false;
    const rules = config.queue?.dropRules || {};
    if (rules.enabled === false) return true;
    const threshold = Number(rules.dropIfQueueFullBelowPriority);
    if (!Number.isFinite(threshold)) return true;
    return item.priority <= threshold;
  }

  // STEP268B_ALERT_BUNDLE_DEDUPE_BYPASS_ROBUST
  // Alert-Bundle-Items sind echte Event-Sounds. Sie duerfen nicht durch globale
  // Same-Sound-/Same-User-Dedupe verworfen werden, sonst bleibt bei schnellen
  // gleichen Alerts nur die TTS uebrig.
  function isAlertBundleItem(item) {
    if (!item) return false;

    const meta = item.meta && typeof item.meta === "object" ? item.meta : {};
    const bundle = item.bundle && typeof item.bundle === "object" ? item.bundle : {};
    const visual = item.visual && typeof item.visual === "object" ? item.visual : {};

    const bundleType = String(item.bundleType || bundle.bundleType || meta.bundleType || visual.bundleType || "").trim().toLowerCase();
    const bundleRole = String(item.bundleRole || bundle.bundleRole || meta.bundleRole || visual.bundleRole || "").trim().toLowerCase();
    const managedBy = String(meta.bundleManagedBy || "").trim().toLowerCase();
    const moduleName = String(visual.module || meta.module || "").trim().toLowerCase();
    const source = String(item.source || "").trim().toLowerCase();
    const category = String(item.category || "").trim().toLowerCase();

    if (bundleType === "alert") return true;
    if (managedBy === "alert_system") return true;
    if (moduleName === "alert_system") return true;
    if (meta.alertEventUid || visual.alertEventUid) return true;
    if (source === "alert_system" && (category === "alert" || category === "alert_critical" || bundleRole === "main")) return true;
    if (source === "alert_tts" && (category === "tts" || meta.alertTts || meta.tts || bundleRole === "tts")) return true;

    return false;
  }

  function cooldownKeyUser(item) {
    return item.requestedBy ? normalizeId(item.requestedBy) : "";
  }

  function checkCooldown(item) {
    if (isAlertBundleItem(item)) return null;
    const cfgCooldown = config.queue?.cooldowns || {};
    const cfgDedupe = config.queue?.dedupe || {};
    if (cfgCooldown.enabled === false && cfgDedupe.enabled === false && !item.cooldownMs) return null;
    const now = Date.now();
    const soundKey = normalizeId(item.soundId || item.file);
    const categoryKey = normalizeId(item.category);
    const userKey = cooldownKeyUser(item);
    const sameSoundMs = Math.max(Number(item.cooldownMs || 0), Number(cfgCooldown.sameSoundMs || 0), Number(cfgDedupe.sameSoundWindowMs || 0));
    if (sameSoundMs > 0 && soundKey) {
      const last = recent.sounds.get(soundKey) || 0;
      if (now - last < sameSoundMs) return { dropped: true, reason: "cooldown_same_sound", retryAfterMs: sameSoundMs - (now - last) };
    }
    const sameCategoryMs = Number(cfgCooldown.sameCategoryMs || 0);
    if (sameCategoryMs > 0 && categoryKey) {
      const last = recent.categories.get(categoryKey) || 0;
      if (now - last < sameCategoryMs) return { dropped: true, reason: "cooldown_same_category", retryAfterMs: sameCategoryMs - (now - last) };
    }
    const sameUserMs = Number(cfgCooldown.sameUserMs || 0);
    if (sameUserMs > 0 && userKey) {
      const last = recent.users.get(userKey) || 0;
      if (now - last < sameUserMs) return { dropped: true, reason: "cooldown_same_user", retryAfterMs: sameUserMs - (now - last) };
    }
    const sameUserSoundMs = Number(cfgDedupe.sameUserSoundWindowMs || 0);
    if (sameUserSoundMs > 0 && userKey && soundKey) {
      const key = `${userKey}:${soundKey}`;
      const last = recent.userSounds.get(key) || 0;
      if (now - last < sameUserSoundMs) return { dropped: true, reason: "dedupe_same_user_sound", retryAfterMs: sameUserSoundMs - (now - last) };
    }
    return null;
  }

  function rememberCooldown(item) {
    if (!item) return;
    if (isAlertBundleItem(item)) return;
    const now = Date.now();
    const soundKey = normalizeId(item.soundId || item.file);
    const categoryKey = normalizeId(item.category);
    const userKey = cooldownKeyUser(item);
    if (soundKey) recent.sounds.set(soundKey, now);
    if (categoryKey) recent.categories.set(categoryKey, now);
    if (userKey) recent.users.set(userKey, now);
    if (userKey && soundKey) recent.userSounds.set(`${userKey}:${soundKey}`, now);
  }
  function clearFinishTimer() { if (finishTimer) clearTimeout(finishTimer); finishTimer = null; }

  function killProcessTree(proc, reason) {
    if (!proc || proc.killed) return false;
    try {
      if (process.platform === "win32" && proc.pid) {
        childProcess.execFile("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { windowsHide: true }, () => {});
      } else {
        proc.kill("SIGTERM");
      }
      return true;
    } catch (err) {
      try { proc.kill(); return true; } catch (_) { return false; }
    }
  }

  function killDeviceProcess(item, reason) {
    if (!item || !item._deviceProcess) return false;
    const proc = item._deviceProcess;
    item._deviceKilled = true;
    item._deviceKilledReason = reason || "stopped";
    item._deviceProcess = null;
    const killed = killProcessTree(proc, reason);
    if (killed) {
      state.device = {
        lastOk: false,
        lastAt: Date.now(),
        lastError: reason || "device_play_stopped",
        lastResult: { stopped: true, reason: reason || "device_play_stopped", requestId: item.requestId, file: item.file }
      };
      emit("device_play_stopped");
    }
    return killed;
  }

  function killParallelDeviceProcesses(reason) {
    state.parallel.forEach(item => killDeviceProcess(item, reason || "parallel_stopped"));
  }

  function playDeviceOutput(item) {
    if (isVideoItem(item)) return;
    if (!shouldUseDevice(item)) return;
    const helperPath = resolveHelperPath();
    const deviceConfig = getDeviceConfig();
    const helper = deviceConfig.helper || {};
    if (helper.enabled === false) {
      state.device = { lastOk: false, lastAt: Date.now(), lastError: "helper_disabled", lastResult: null };
      state.stats.deviceFailed += 1;
      emit("device_helper_disabled");
      return;
    }
    if (!fs.existsSync(helperPath)) {
      state.device = { lastOk: false, lastAt: Date.now(), lastError: `helper_missing: ${helperPath}`, lastResult: null };
      state.stats.deviceFailed += 1;
      emit("device_helper_missing");
      return;
    }
    if (!item.fullPath || !fs.existsSync(item.fullPath)) {
      state.device = { lastOk: false, lastAt: Date.now(), lastError: `device_file_missing: ${item.fullPath || item.file}`, lastResult: null };
      state.stats.deviceFailed += 1;
      emit("device_file_missing");
      return;
    }
    const selectedDeviceId = String(deviceConfig.selectedDeviceId || "default");
    const mode = getDevicePlaybackMode(item);
    const args = ["play", "--file", item.fullPath, "--device", selectedDeviceId, "--volume", String(item.volume), "--mode", mode];
    const timeoutMs = effectiveHelperTimeoutMs(item, helper);
    state.stats.deviceStarted += 1;
    state.device = { lastOk: false, lastAt: Date.now(), lastError: "", lastResult: { started: true, helperPath, timeoutMs, args: ["play", "--file", item.file, "--device", selectedDeviceId, "--volume", String(item.volume), "--mode", mode] } };
    emit("device_play_started");
    const child = childProcess.execFile(helperPath, args, { windowsHide: true, timeout: timeoutMs }, (err, stdout, stderr) => {
      if (item._deviceProcess === child) item._deviceProcess = null;
      let parsed = null;
      try { parsed = stdout ? JSON.parse(stdout) : null; } catch (_) { parsed = null; }
      if (item._deviceKilled) {
        state.device = {
          lastOk: false,
          lastAt: Date.now(),
          lastError: item._deviceKilledReason || "device_play_stopped",
          lastResult: { stopped: true, reason: item._deviceKilledReason || "device_play_stopped", requestId: item.requestId, file: item.file, stdout, stderr }
        };
        emit("device_play_stopped");
        return;
      }
      if (err || !parsed || parsed.ok === false) {
        state.stats.deviceFailed += 1;
        state.device = { lastOk: false, lastAt: Date.now(), lastError: err ? (err.message || String(err)) : (parsed && (parsed.error || parsed.message)) || stderr || "device_play_failed", lastResult: parsed || { stdout, stderr } };
        emit("device_play_failed");
        return;
      }
      state.device = { lastOk: true, lastAt: Date.now(), lastError: "", lastResult: { ...parsed, timeoutMs } };
      emit("device_play_finished");
    });
    item._deviceProcess = child;
    item._deviceKilled = false;
    item._deviceKilledReason = "";
  }

  function getDiscordBridge() {
    return (app && app.locals && app.locals.discordBridge) || ctx.discordBridge || null;
  }

  // STEP269A_SOUND_SYSTEM_DISCORD_TARGET_PLAYBACK
  // Discord bleibt ein Ausgabeziel des Sound-Systems. Die Sound-System-Queue bleibt Master.
  function playDiscordOutput(item) {
    if (!item || !shouldUseDiscord(item)) return;
    if (item.hasAudio === false) return;
    if (!item.file || item.file === "generated/beep.wav") {
      state.discord = {
        lastOk: false,
        lastAt: Date.now(),
        lastError: "discord_file_missing_or_generated",
        lastResult: item ? { requestId: item.requestId, file: item.file || "" } : null
      };
      state.stats.discordFailed += 1;
      emit("discord_play_skipped");
      return;
    }

    const bridge = getDiscordBridge();
    if (!bridge || typeof bridge.enqueueSound !== "function") {
      state.discord = {
        lastOk: false,
        lastAt: Date.now(),
        lastError: "discord_bridge_unavailable",
        lastResult: { requestId: item.requestId, file: item.file }
      };
      state.stats.discordFailed += 1;
      item.lifecycle = { ...(item.lifecycle || {}), discord: { attempted: true, ok: false, error: "discord_bridge_unavailable" } };
      emit("discord_bridge_unavailable");
      return;
    }

    state.stats.discordStarted += 1;
    state.discord = {
      lastOk: false,
      lastAt: Date.now(),
      lastError: "",
      lastResult: { started: true, requestId: item.requestId, file: item.file, soundId: item.soundId }
    };
    item.lifecycle = { ...(item.lifecycle || {}), discord: { attempted: true, startedAt: Date.now(), ok: null } };
    emit("discord_play_started");

    Promise.resolve()
      .then(() => bridge.enqueueSound(item.file))
      .then(result => {
        state.discord = {
          lastOk: true,
          lastAt: Date.now(),
          lastError: "",
          lastResult: { ...(result || {}), requestId: item.requestId, file: item.file, soundId: item.soundId }
        };
        item.lifecycle = { ...(item.lifecycle || {}), discord: { ...(item.lifecycle.discord || {}), ok: true, result } };
        emit("discord_play_queued");
      })
      .catch(err => {
        const error = err && err.message ? err.message : String(err);
        state.stats.discordFailed += 1;
        state.discord = {
          lastOk: false,
          lastAt: Date.now(),
          lastError: error,
          lastResult: { requestId: item.requestId, file: item.file, soundId: item.soundId }
        };
        item.lifecycle = { ...(item.lifecycle || {}), discord: { ...(item.lifecycle.discord || {}), ok: false, error } };
        emit("discord_play_failed");
      });
  }


  function publicEventPreRollStatus() {
    const cfg = config.eventPreRoll && isPlainObject(config.eventPreRoll) ? config.eventPreRoll : DEFAULT_CONFIG.eventPreRoll;
    return core.ok({
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      step: "EVENT-SOUND-3B",
      prepared: true,
      enabled: cfg.enabled !== false,
      gatePoint: "startItem(item) after reservation before item_starting/activateItemAudio",
      runtimeOverlayCapability: String(cfg.runtimeOverlayCapability || EVENT_RUNTIME_BUS_CAPABILITY),
      runtimeChannel: String(cfg.runtimeChannel || EVENT_RUNTIME_BUS_CHANNEL),
      playbackOwner: "sound_system",
      overlayStartsSound: false,
      queueTouchedByDefault: false,
      active: !!state.eventPreRoll.active,
      current: state.eventPreRoll.current || null,
      counters: {
        emitted: state.eventPreRoll.emitted,
        skipped: state.eventPreRoll.skipped,
        errors: state.eventPreRoll.errors
      },
      last: {
        action: state.eventPreRoll.lastAction,
        eventId: state.eventPreRoll.lastEventId,
        requestId: state.eventPreRoll.lastRequestId,
        soundId: state.eventPreRoll.lastSoundId,
        startedAt: state.eventPreRoll.lastStartedAt,
        endedAt: state.eventPreRoll.lastEndedAt,
        error: state.eventPreRoll.lastError,
        result: state.eventPreRoll.lastResult
      },
      recentEvents: Array.isArray(state.eventPreRoll.recentEvents) ? state.eventPreRoll.recentEvents.slice(0, 20) : [],
      safetyRules: {
        normalSoundsUnaffectedUnlessExplicitFlag: true,
        soundSystemStaysPlaybackOwner: true,
        runtimeOverlayDoesNotStartSound: true,
        soundSystemOverlayUnchanged: true,
        usesCommunicationBusTargetCapability: true
      },
      testRoute: `${(config.routes && config.routes.prefix) || "/api/sound"}/event-preroll/test`,
      testFlow: {
        enabled: true,
        confirmRequired: true,
        generatedBeepOnly: true,
        countdownSecondsConfigurable: true,
        countdownSecondsDefault: Number(cfg.fallbackSeconds || 3),
        countdownSecondsMax: Number(cfg.maxSeconds || 10),
        soundStartsAfterCountdown: true,
        hideAfterAudioEndedOrFallback: true,
        countdownTimingFixed: true,
        dedupeFields: ["requestId", "phaseKey", "countdownStartedAtMs", "countdownEndsAtMs"]
      },
      updatedAt: core.nowIso()
    });
  }

  function clampEventPreRollSeconds(value, fallback = 3) {
    const cfg = config.eventPreRoll && isPlainObject(config.eventPreRoll) ? config.eventPreRoll : DEFAULT_CONFIG.eventPreRoll;
    const max = Math.max(1, Math.min(30, Number(cfg.maxSeconds || 10)));
    const n = Number(value);
    if (!Number.isFinite(n)) return Math.max(1, Math.min(max, Number(fallback || cfg.fallbackSeconds || 3)));
    return Math.max(1, Math.min(max, Math.ceil(n)));
  }

  function eventPreRollCandidate(item) {
    if (!item) return null;
    const meta = item.meta && isPlainObject(item.meta) ? item.meta : {};
    const visual = item.visual && isPlainObject(item.visual) ? item.visual : {};
    const candidates = [
      meta.eventPreRoll,
      meta.eventRuntimePreRoll,
      meta.streamEventsPreRoll,
      meta.streamEventsRuntimePreRoll,
      visual.eventPreRoll,
      visual.eventRuntimePreRoll,
      visual.streamEventsPreRoll,
      visual.streamEventsRuntimePreRoll
    ].filter(isPlainObject);
    if (!candidates.length) return null;
    return candidates.find(candidate => candidate.enabled === true || candidate.countdownEnabled === true || candidate.preRollEnabled === true) || null;
  }

  function resolveEventPreRoll(item, options = {}) {
    const cfg = config.eventPreRoll && isPlainObject(config.eventPreRoll) ? config.eventPreRoll : DEFAULT_CONFIG.eventPreRoll;
    if (cfg.enabled === false) return { enabled: false, reason: "event_preroll_disabled" };
    if (!item || options.parallel) return { enabled: false, reason: options.parallel ? "parallel_not_gated" : "missing_item" };
    const meta = item.meta && isPlainObject(item.meta) ? item.meta : {};
    const visual = item.visual && isPlainObject(item.visual) ? item.visual : {};
    const candidate = eventPreRollCandidate(item);
    if (!candidate) return { enabled: false, reason: "no_explicit_event_preroll_flag" };
    const owner = String(candidate.owner || meta.owner || meta.module || visual.module || item.source || "").trim().toLowerCase();
    const eventUid = String(candidate.eventUid || candidate.eventUID || meta.eventUid || meta.eventUID || meta.streamEventUid || visual.eventUid || "").trim();
    const roundUid = String(candidate.roundUid || candidate.roundUID || meta.roundUid || meta.roundUID || visual.roundUid || "").trim();
    const fromStreamEvents = owner === "stream_events" || owner === "stream-events" || item.source === "stream_events" || !!eventUid || !!roundUid;
    if (!fromStreamEvents) return { enabled: false, reason: "not_stream_events_preroll" };
    const seconds = clampEventPreRollSeconds(candidate.seconds ?? candidate.countdownSeconds ?? candidate.preRollSeconds ?? meta.countdownPreRollSeconds ?? meta.preRollSeconds, cfg.fallbackSeconds || 3);
    return {
      enabled: true,
      seconds,
      eventUid,
      roundUid,
      finalLabel: String(candidate.finalLabel || candidate.countdownFinalLabel || "LOS!").trim() || "LOS!",
      caption: String(candidate.caption || candidate.countdownCaption || "Sound startet gleich").trim() || "Sound startet gleich",
      guessingLabel: String(candidate.guessingLabel || candidate.guessingCaption || "Jetzt raten!").trim() || "Jetzt raten!",
      source: "stream_events",
      candidate
    };
  }

  function rememberEventPreRollEvent(action, item, payload, result) {
    const entry = {
      at: core.nowIso(),
      action: String(action || ""),
      eventId: result && result.eventId ? String(result.eventId) : "",
      deliveredCount: result && Number.isFinite(Number(result.deliveredCount)) ? Number(result.deliveredCount) : 0,
      requestId: item ? String(item.requestId || "") : "",
      soundId: item ? String(item.soundId || "") : "",
      payload: payload && isPlainObject(payload) ? {
        mode: payload.mode || "",
        seconds: payload.seconds || 0,
        eventUid: payload.eventUid || "",
        roundUid: payload.roundUid || ""
      } : null
    };
    state.eventPreRoll.recentEvents.unshift(entry);
    if (state.eventPreRoll.recentEvents.length > 50) state.eventPreRoll.recentEvents.length = 50;
    state.eventPreRoll.lastAction = entry.action;
    state.eventPreRoll.lastEventId = entry.eventId;
    state.eventPreRoll.lastRequestId = entry.requestId;
    state.eventPreRoll.lastSoundId = entry.soundId;
    state.eventPreRoll.lastResult = result || null;
    state.eventPreRoll.lastError = "";
    if (action === "countdown.start") state.eventPreRoll.lastStartedAt = entry.at;
    if (action === "hide" || action === "cancel" || action === "failed") state.eventPreRoll.lastEndedAt = entry.at;
  }

  function emitRuntimeOverlayBus(action, item, preRoll = {}, extra = {}) {
    const bus = getCommunicationBus();
    const cfg = config.eventPreRoll && isPlainObject(config.eventPreRoll) ? config.eventPreRoll : DEFAULT_CONFIG.eventPreRoll;
    if (!bus || typeof bus.emit !== "function") {
      state.eventPreRoll.skipped += 1;
      state.eventPreRoll.lastError = "communication_bus_unavailable";
      return { ok: false, skipped: true, reason: state.eventPreRoll.lastError };
    }
    const cleanAction = String(action || "state").trim();
    const payload = {
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      owner: "sound_system",
      playbackOwner: "sound_system",
      overlayStartsSound: false,
      mode: cleanAction === "countdown.start" ? "countdown" : (cleanAction === "guessing.start" ? "guessing" : (cleanAction === "hide" ? "hidden" : "state")),
      eventUid: String(preRoll.eventUid || ""),
      roundUid: String(preRoll.roundUid || ""),
      requestId: item ? String(item.requestId || "") : "",
      soundId: item ? String(item.soundId || "") : "",
      label: item ? String(item.label || item.soundId || "") : "",
      seconds: Number(preRoll.seconds || 3),
      remainingSeconds: Number.isFinite(Number(extra.remainingSeconds)) ? Number(extra.remainingSeconds) : null,
      finalLabel: String(preRoll.finalLabel || "LOS!"),
      caption: String(preRoll.caption || "Sound startet gleich"),
      guessingLabel: String(preRoll.guessingLabel || "Jetzt raten!"),
      item: item ? publicItem(item) : null,
      extra: isPlainObject(extra) ? extra : {},
      emittedAt: core.nowIso()
    };

    const nowMs = Date.now();
    payload.emittedAtMs = nowMs;
    payload.phaseStartedAtMs = Number.isFinite(Number(extra.phaseStartedAtMs)) ? Number(extra.phaseStartedAtMs) : nowMs;
    if (cleanAction === "countdown.start") {
      const seconds = clampEventPreRollSeconds(preRoll.seconds || payload.seconds || cfg.fallbackSeconds || 3, cfg.fallbackSeconds || 3);
      payload.seconds = seconds;
      payload.remainingSeconds = seconds;
      payload.countdownStartedAtMs = payload.phaseStartedAtMs;
      payload.countdownEndsAtMs = payload.phaseStartedAtMs + (seconds * 1000);
      payload.phaseKey = `countdown:${payload.requestId}:${payload.countdownStartedAtMs}`;
    } else if (cleanAction === "guessing.start") {
      payload.phaseKey = `guessing:${payload.requestId}:${payload.phaseStartedAtMs}`;
    } else if (cleanAction === "hide" || cleanAction === "cancel" || cleanAction === "failed") {
      payload.phaseKey = `${cleanAction}:${payload.requestId}:${payload.phaseStartedAtMs}`;
    }
    try {
      const result = bus.emit({
        type: "event",
        channel: String(cfg.runtimeChannel || EVENT_RUNTIME_BUS_CHANNEL),
        action: cleanAction,
        source: { type: "module", id: MODULE_NAME, module: MODULE_NAME },
        target: { type: "all", id: "*", module: "", capability: String(cfg.runtimeOverlayCapability || EVENT_RUNTIME_BUS_CAPABILITY) },
        payload,
        meta: {
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          capability: String(cfg.runtimeOverlayCapability || EVENT_RUNTIME_BUS_CAPABILITY),
          requireAck: false,
          replayable: false,
          ttlMs: 15000
        }
      });
      state.eventPreRoll.emitted += 1;
      rememberEventPreRollEvent(cleanAction, item, payload, result);
      return result;
    } catch (err) {
      state.eventPreRoll.errors += 1;
      state.eventPreRoll.lastAction = cleanAction;
      state.eventPreRoll.lastError = err && err.message ? err.message : String(err);
      return { ok: false, error: state.eventPreRoll.lastError };
    }
  }

  function clearEventPreRollRuntime(item, action = "hide", reason = "finished") {
    if (!item || !item.lifecycle || !item.lifecycle.eventPreRoll || item.lifecycle.eventPreRoll.enabled !== true) return null;
    const preRoll = item.lifecycle.eventPreRoll;
    if (preRoll.timer) {
      clearTimeout(preRoll.timer);
      preRoll.timer = null;
    }
    if (preRoll.guessingTimer) {
      clearTimeout(preRoll.guessingTimer);
      preRoll.guessingTimer = null;
    }
    state.eventPreRoll.active = false;
    state.eventPreRoll.current = null;
    return emitRuntimeOverlayBus(action, item, preRoll, { reason });
  }


  function runEventPreRollTest(input = {}, query = {}) {
    const merged = { ...(query && isPlainObject(query) ? query : {}), ...(input && isPlainObject(input) ? input : {}) };
    const confirm = String(merged.confirm || merged.confirmed || "").trim();
    if (confirm !== "1" && confirm.toLowerCase() !== "true") {
      return core.fail("confirm_required", {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        step: "EVENT-SOUND-3B",
        hint: "POST /api/sound/event-preroll/test?confirm=1 oder GET /api/sound/event-preroll/test?confirm=1",
        touchesQueue: false,
        touchesAudio: false
      });
    }

    const countdownSeconds = clampEventPreRollSeconds(merged.countdownSeconds ?? merged.seconds ?? merged.preRollSeconds, 3);
    const eventUid = String(merged.eventUid || `evs_preroll_test_${Date.now()}`).trim();
    const roundUid = String(merged.roundUid || `evs_preroll_round_${Date.now()}`).trim();
    const durationMs = intInRange(merged.durationMs, 1200, 200, 8000);
    const frequency = intInRange(merged.frequency, 880, 120, 1600);
    const volume = Math.max(0.05, Math.min(1, Number(merged.volume || 0.35)));

    const item = normalizePlayRequest({
      type: "generated_beep",
      label: String(merged.label || "EVENT-SOUND-3B PreRoll Test-Beep"),
      category: "stream_event_sound_test",
      source: "stream_events",
      requestedBy: String(merged.requestedBy || "event_sound_test"),
      target: "stream",
      outputTarget: "overlay",
      priority: intInRange(merged.priority, 75, 1, 1000),
      durationMs,
      frequency,
      volume,
      queueIfBusy: true,
      dropIfBusy: false,
      canInterrupt: false,
      parallelAllowed: false,
      clearQueue: false,
      meta: {
        module: "stream_events",
        owner: "stream_events",
        eventUid,
        roundUid,
        eventPreRoll: {
          enabled: true,
          countdownEnabled: true,
          owner: "stream_events",
          eventUid,
          roundUid,
          seconds: countdownSeconds,
          countdownSeconds,
          finalLabel: String(merged.finalLabel || "LOS!"),
          caption: String(merged.caption || "Sound startet gleich"),
          guessingLabel: String(merged.guessingLabel || "Jetzt raten!")
        },
        testOnly: true,
        step: "EVENT-SOUND-3B"
      }
    });

    const result = enqueueOrStart(item);
    return core.ok({
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      step: "EVENT-SOUND-3B",
      message: result.started ? "EventSound-PreRoll-Test gestartet." : (result.queued ? "EventSound-PreRoll-Test wurde gequeued." : "EventSound-PreRoll-Test wurde nicht gestartet."),
      confirmRequired: true,
      testOnly: true,
      generatedBeepOnly: true,
      countdownSeconds,
      durationMs,
      eventUid,
      roundUid,
      result: {
        started: !!result.started,
        queued: !!result.queued,
        dropped: !!result.dropped,
        parallel: !!result.parallel,
        queuePosition: result.queuePosition,
        reason: result.reason || "",
        retryAfterMs: result.retryAfterMs || 0
      },
      item: publicItem(item),
      eventPreRoll: publicEventPreRollStatus(),
      safetyRules: {
        explicitConfirmRequired: true,
        generatedBeepOnly: true,
        normalSoundsUnaffectedUnlessExplicitFlag: true,
        soundSystemStaysPlaybackOwner: true,
        runtimeOverlayDoesNotStartSound: true,
        soundSystemOverlayUnchanged: true,
        countdownSecondsConfigurable: true
      },
      status: publicState()
    });
  }


  function activateItemAfterEventPreRoll(item, parallel) {
    if (!itemStillActive(item, parallel)) return;
    const preRoll = item.lifecycle && item.lifecycle.eventPreRoll ? item.lifecycle.eventPreRoll : null;
    if (preRoll && preRoll.enabled === true) {
      emitRuntimeOverlayBus("guessing.start", item, preRoll, { reason: "countdown_finished" });
    }
    emitItemEvent("item_starting", item, { parallel, visualLeadMs: 0, eventPreRoll: true });
    activateItemAudio(item, parallel);
  }

  function startItemEventPreRollGate(item, parallel, resolved) {
    item.lifecycle = {
      ...(item.lifecycle || {}),
      eventPreRoll: {
        ...(resolved || {}),
        enabled: true,
        startedAt: Date.now(),
        timer: null,
        guessingTimer: null
      }
    };
    state.eventPreRoll.active = true;
    const countdownStartedAtMs = Date.now();
    const seconds = clampEventPreRollSeconds(resolved.seconds || 3, 3);
    state.eventPreRoll.current = {
      requestId: item.requestId || "",
      soundId: item.soundId || "",
      label: item.label || item.soundId || "",
      eventUid: resolved.eventUid || "",
      roundUid: resolved.roundUid || "",
      seconds,
      startedAt: core.nowIso(),
      countdownStartedAtMs,
      countdownEndsAtMs: countdownStartedAtMs + (seconds * 1000)
    };
    item.lifecycle.eventPreRoll.seconds = seconds;
    item.lifecycle.eventPreRoll.countdownStartedAtMs = countdownStartedAtMs;
    item.lifecycle.eventPreRoll.countdownEndsAtMs = countdownStartedAtMs + (seconds * 1000);
    emitRuntimeOverlayBus("countdown.start", item, item.lifecycle.eventPreRoll, { reason: "sound_slot_reserved", phaseStartedAtMs: countdownStartedAtMs });
    const delayMs = Math.max(250, seconds * 1000);
    item.lifecycle.eventPreRoll.timer = setTimeout(() => activateItemAfterEventPreRoll(item, parallel), delayMs);
    if (item.lifecycle.eventPreRoll.timer && typeof item.lifecycle.eventPreRoll.timer.unref === "function") item.lifecycle.eventPreRoll.timer.unref();
  }

  function activateItemAudio(item, parallel) {
    if (!itemStillActive(item, parallel)) return;

    item.startedAt = Date.now();
    item.endsAt = item.startedAt + item.durationMs + item.outroMs;
    item.lifecycle = { ...(item.lifecycle || {}), audioStartedAt: item.startedAt };

    playDeviceOutput(item);
    playDiscordOutput(item);
    emitItemEvent("item_started", item, { parallel: !!parallel });

    if (shouldUseOverlay(item)) emit("play_stream");

    if (parallel) {
      const parallelWaitMs = shouldWaitForOverlayEnd(item) ? videoFallbackFinishMs(item) : Math.max(1000, item.durationMs + item.outroMs + 250);
      setTimeout(() => finishParallel(item.requestId, shouldWaitForOverlayEnd(item) ? "parallel_overlay_fallback_finished" : "parallel_auto_finished"), parallelWaitMs);
      return;
    }

    clearFinishTimer();
    const waitMs = shouldWaitForOverlayEnd(item) ? videoFallbackFinishMs(item) : Math.max(1000, item.durationMs + item.outroMs + 250);
    finishTimer = setTimeout(() => finishCurrent(shouldWaitForOverlayEnd(item) ? "overlay_fallback_finished" : "auto_finished"), waitMs);
  }

  function startItem(item, reason, options = {}) {
    const parallel = !!options.parallel;
    const visualLeadMs = alertVisualLeadMs(item);

    item.lifecycle = {
      ...(item.lifecycle || {}),
      visualSync: visualLeadMs > 0,
      visualLeadMs,
      visualStartingAt: visualLeadMs > 0 ? Date.now() : 0,
      startSignalEmitted: visualLeadMs > 0
    };

    state.stats.started += 1;
    rememberCooldown(item);

    if (parallel) {
      state.parallel.push(item);
      state.stats.parallelStarted += 1;
      emit(reason || "parallel_started");
    } else {
      clearFinishTimer();
      state.current = item;
      if (item.bundleId && item.bundleLocked) {
        state.activeBundleLock = {
          bundleId: item.bundleId,
          bundleType: item.bundleType || "",
          bundlePriority: Number(item.bundlePriority || item.priority || 0),
          bundleQueuedAt: Number(item.bundleQueuedAt || item.queuedAt || 0),
          startedAt: Date.now()
        };
        emitSoundBus("bundle_lock_started", { item, kind: "bundle_lock", extra: { activeBundleLock: { ...state.activeBundleLock } } });
      }
      emit(reason || "started");
    }

    const eventPreRoll = resolveEventPreRoll(item, { parallel });
    if (eventPreRoll.enabled === true) {
      startItemEventPreRollGate(item, parallel, eventPreRoll);
      return;
    }

    if (visualLeadMs > 0) {
      emitItemEvent("item_starting", item, { parallel, visualLeadMs });
      setTimeout(() => activateItemAudio(item, parallel), visualLeadMs);
      return;
    }

    emitItemEvent("item_starting", item, { parallel, visualLeadMs: 0 });
    activateItemAudio(item, parallel);
  }

  function finishParallel(requestId, reason) {
    const index = state.parallel.findIndex(item => item.requestId === requestId);
    if (index < 0) return null;
    const [finished] = state.parallel.splice(index, 1);
    clearEventPreRollRuntime(finished, "hide", reason || "parallel_finished");
    emit(reason || "parallel_finished");
    emitSoundBus("item_finished", { item: finished, kind: "item", extra: { reason: reason || "parallel_finished", parallel: true } });
    return finished;
  }

  function startNextIfPossible(reason) {
    if (state.paused || state.current || !state.queue.length) return false;
    const lockedNext = pickNextLockedBundleItem();
    const next = lockedNext || state.queue.shift();
    if (state.activeBundleLock && (!next || next.bundleId !== state.activeBundleLock.bundleId)) {
      state.activeBundleLock = null;
    }
    startItem(next, lockedNext ? "bundle_next_started" : (reason || "next_started"));
    return true;
  }

  function finishCurrent(reason) {
    clearFinishTimer();
    const finished = state.current;
    state.current = null;
    clearEventPreRollRuntime(finished, "hide", reason || "finished");
    emit(reason || "finished");
    if (finished) emitSoundBus("item_finished", { item: finished, kind: "item", extra: { reason: reason || "finished", parallel: false } });
    const gap = Number((finished && finished.gapAfterMs) || config.overlay?.gapBetweenSoundsMs || 750);
    if (finished && finished.bundleId && state.activeBundleLock && state.activeBundleLock.bundleId === finished.bundleId) {
      const hasMoreBundleItems = state.queue.some(item => item && item.bundleId === finished.bundleId);
      if (!hasMoreBundleItems) {
        const lock = { ...state.activeBundleLock };
        state.activeBundleLock = null;
        emitSoundBus("bundle_lock_finished", { item: finished, kind: "bundle_lock", extra: { activeBundleLock: lock, reason: reason || "finished" } });
      }
    }
    setTimeout(() => startNextIfPossible("gap_finished"), Math.max(0, gap));
    return finished;
  }

  function stopCurrent(reason) {
    const stopped = state.current;
    if (stopped) killDeviceProcess(stopped, reason || "stopped");
    clearFinishTimer();
    state.current = null;
    state.stats.stopped += 1;
    emit(reason || "stopped");
    if (stopped) emitSoundBus("manual_stop", { item: stopped, kind: "item", extra: { reason: reason || "stopped" } });

    const needsOverlayStopGap = !!stopped && shouldUseOverlay(stopped);
    const stopGapMs = needsOverlayStopGap
      ? Math.max(250, Number(config.overlay?.gapBetweenSoundsMs || 750))
      : 0;
    setTimeout(() => startNextIfPossible("after_stop"), stopGapMs);
    return stopped;
  }

  // STEP268C_ACTIVE_BUNDLE_LOCK_DIRECT_START_GUARD
  // Wenn ein locked Bundle aktiv ist, darf kein fremdes Item direkt starten.
  // Das ist besonders wichtig in der kurzen Luecke zwischen Alert-Hauptsound und Alert-TTS:
  // state.current kann kurz null sein, aber state.activeBundleLock zeigt noch auf das Alert-Bundle.
  function itemMatchesActiveBundleLock(item) {
    const lock = state.activeBundleLock;
    if (!lock || !lock.bundleId || !item) return true;
    return String(item.bundleId || "") === String(lock.bundleId || "");
  }

  function queueBehindActiveBundleLock(item) {
    const maxLength = Number(config.queue?.maxLength || 50);
    if (state.queue.length >= maxLength) {
      if (shouldDropQueueFull(item)) {
        return {
          started: false,
          queued: false,
          dropped: true,
          queuePosition: -1,
          item,
          reason: "queue_full_active_bundle_lock"
        };
      }
      throw new Error(msg("queueFull"));
    }

    item.lifecycle = {
      ...(item.lifecycle || {}),
      queuedBehindActiveBundleLock: true,
      activeBundleLockId: state.activeBundleLock && state.activeBundleLock.bundleId ? state.activeBundleLock.bundleId : ""
    };

    state.queue.push(item);
    sortQueue();
    state.stats.queued += 1;
    emit("queued");
    emitSoundBus("item_queued", { item, kind: "item", extra: { reason: "active_bundle_lock" } });
    return {
      started: false,
      queued: true,
      queuePosition: state.queue.findIndex(q => q.requestId === item.requestId) + 1,
      item,
      reason: "active_bundle_lock"
    };
  }

  function enqueueOrStart(item) {
    if (!state.enabled) throw new Error(msg("systemDisabled"));
    const cooldown = checkCooldown(item);
    if (cooldown) return { started: false, queued: false, dropped: true, queuePosition: -1, item, reason: cooldown.reason, retryAfterMs: cooldown.retryAfterMs };
    if (item.clearQueue) { state.queue = []; state.activeBundleLock = null; }

    if (state.activeBundleLock && !itemMatchesActiveBundleLock(item)) {
      return queueBehindActiveBundleLock(item);
    }

    if (state.current && parallelAllowedByPolicy(item)) {
      startItem(item, "parallel_started", { parallel: true });
      return { started: true, queued: false, parallel: true, queuePosition: 0, item };
    }

    if (state.current) {
      if (canInterruptCurrent(item, state.current)) {
        const old = state.current;
        killDeviceProcess(old, "interrupted");
        state.current = null;
        clearFinishTimer();
        if (old.queueIfBusy !== false) {
          old.startedAt = 0;
          old.endsAt = 0;
          old.lifecycle = { ...(old.lifecycle || {}), interruptedAt: Date.now(), restartQueued: true };
          state.queue.unshift(old);
        }
        startItem(item, "interrupted_started");
        return { started: true, queued: false, queuePosition: 0, item };
      }
      if (shouldDropBusy(item)) return { started: false, queued: false, dropped: true, queuePosition: -1, item, reason: "busy_drop_policy" };
      const maxLength = Number(config.queue?.maxLength || 50);
      if (state.queue.length >= maxLength) {
        if (shouldDropQueueFull(item)) return { started: false, queued: false, dropped: true, queuePosition: -1, item, reason: "queue_full" };
        throw new Error(msg("queueFull"));
      }
      state.queue.push(item);
      sortQueue();
      state.stats.queued += 1;
      emit("queued");
      emitSoundBus("item_queued", { item, kind: "item", extra: { reason: "busy_queue" } });
      return { started: false, queued: true, queuePosition: state.queue.findIndex(q => q.requestId === item.requestId) + 1, item };
    }

    startItem(item, "started");
    return { started: true, queued: false, queuePosition: 0, item };
  }

  function markClient(eventName) {
    state.client.connected = true;
    state.client.lastSeenAt = Date.now();
    state.client.lastEvent = eventName || "seen";
    touch();
  }

  function clientRequestId(req) {
    return String((req.body && req.body.requestId) || (req.query && req.query.requestId) || "").trim();
  }

  function findActiveItemByRequestId(requestId) {
    const clean = String(requestId || "").trim();
    if (!clean) return state.current || null;
    if (state.current && state.current.requestId === clean) return state.current;
    if (Array.isArray(state.parallel)) {
      const parallel = state.parallel.find(item => item && item.requestId === clean);
      if (parallel) return parallel;
    }
    return null;
  }

  function clientRequestMatchesCurrent(req) {
    const requestId = clientRequestId(req);
    if (!requestId) return true;
    return !!state.current && state.current.requestId === requestId;
  }

  app.get(`${(config.routes && config.routes.prefix) || "/api/sound"}/settings`, (req, res) => {
    try {
      res.json(publicSoundSettings());
    } catch (err) {
      res.status(500).json({ ok: false, error: "sound_settings_read_failed", message: err.message || String(err) });
    }
  });

  app.post(`${(config.routes && config.routes.prefix) || "/api/sound"}/settings`, (req, res) => {
    try {
      const updatedBy = req.headers["x-dashboard-user"] || req.headers["x-user"] || "";
      res.json(saveSoundSettings(req.body || {}, updatedBy));
    } catch (err) {
      res.status(400).json({ ok: false, error: "sound_settings_save_failed", message: err.message || String(err) });
    }
  });
  loadAll();
  const prefix = (config.routes && config.routes.prefix) || "/api/sound";

  app.use(prefix, (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get(`${prefix}/generated/beep.wav`, (req, res) => {
    const frequency = intInRange(req.query.frequency, 880, 80, 2000);
    const durationMs = intInRange(req.query.durationMs, 350, 80, 3000);
    const volume = Math.max(0.01, Math.min(1, Number(req.query.volume || 80) / 100 * 0.45));
    const wav = createBeepWavBuffer({ frequency, durationMs, volume });
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", wav.length);
    res.setHeader("Cache-Control", "no-store");
    return res.end(wav);
  });

  app.get(`${prefix}/routes`, (req, res) => res.json(publicSoundRoutes(prefix)));
  app.get(`${prefix}/integration-check`, (req, res) => res.json(publicSoundIntegrationCheck()));

  app.get(`${prefix}/status`, (req, res) => res.json(publicState()));
  app.get(`${prefix}/event-preroll/status`, (req, res) => res.json(publicEventPreRollStatus()));
  app.get(`${prefix}/event-preroll/test`, (req, res) => {
    const result = runEventPreRollTest({}, req.query || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.post(`${prefix}/event-preroll/test`, (req, res) => {
    const result = runEventPreRollTest(req.body || {}, req.query || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.get(`${prefix}/eventbus/status`, (req, res) => res.json(publicSoundBusStatus({ includeRecentEvents: true })));
  app.get(`${prefix}/eventbus/reset`, (req, res) => res.json({ ...resetSoundBusRuntime(), reset: true, resetAt: core.nowIso() }));
  app.get(`${prefix}/eventbus/test`, (req, res) => res.json(emitSoundBusTest(req.query || {})));
  app.post(`${prefix}/eventbus/test`, (req, res) => res.json(emitSoundBusTest(req.body || {})));
  app.get(`${prefix}/eventbus/command/status`, (req, res) => res.json(publicSoundBusCommandStatus({ includeRecentCommands: true })));
  app.get(`${prefix}/eventbus/command/contract`, (req, res) => res.json(publicSoundBusCommandContract()));
  app.get(`${prefix}/eventbus/command/lifecycle`, (req, res) => res.json(publicSoundBusCommandLifecycleStatus()));
  app.get(`${prefix}/eventbus/command/play-compatibility`, (req, res) => res.json(publicSoundPlayCompatibilityStatus()));
  app.get(`${prefix}/eventbus/command/queue-status`, (req, res) => res.json(publicSoundBusQueueStatus()));
  app.get(`${prefix}/eventbus/command/catalog-status`, (req, res) => res.json(publicSoundBusCatalogStatus(req.query || {})));
  app.get(`${prefix}/eventbus/command/reset`, (req, res) => res.json({ ...resetSoundBusCommandRuntime(), reset: true, resetAt: core.nowIso() }));
  app.get(`${prefix}/eventbus/command/test`, (req, res) => res.json(emitSoundBusCommandTest(req.query || {})));
  app.post(`${prefix}/eventbus/command/test`, (req, res) => res.json(emitSoundBusCommandTest(req.body || {})));
  app.get(`${prefix}/eventbus/command/dry-run`, (req, res) => {
    const result = consumeSoundBusCommandDryRun(req.query || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.post(`${prefix}/eventbus/command/dry-run`, (req, res) => {
    const result = consumeSoundBusCommandDryRun(req.body || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.get(`${prefix}/eventbus/command/play-test`, (req, res) => {
    const result = consumeSoundBusCommandPlayTest(req.query || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.post(`${prefix}/eventbus/command/play-test`, (req, res) => {
    const result = consumeSoundBusCommandPlayTest(req.body || {});
    res.status(result.ok ? 200 : 400).json(result);
  });
  app.get(`${prefix}/current`, (req, res) => res.json(core.ok({ current: state.current ? publicItem(state.current) : null })));
  app.get(`${prefix}/queue`, (req, res) => res.json(core.ok({ queue: state.queue.map(publicItem), queuedCount: state.queue.length })));
  app.get(`${prefix}/list`, (req, res) => res.json(core.ok({ sounds: getSoundList() })));
  app.get(`${prefix}/config`, (req, res) => res.json(core.ok({ config, path: state.configPath })));
  app.post(`${prefix}/reload`, (req, res) => { loadAll(); return res.json(core.ok({ message: msg("configReloaded"), status: publicState() })); });

  function playResponse(req, res, input) {
    const item = normalizePlayRequest(input || {});
    const result = enqueueOrStart(item);
    return res.json(core.ok({
      message: result.started ? msg("soundStarted") : (result.queued ? msg("soundQueued") : "Sound wurde verworfen."),
      result: { started: result.started, queued: result.queued, dropped: !!result.dropped, parallel: !!result.parallel, queuePosition: result.queuePosition, reason: result.reason || "", retryAfterMs: result.retryAfterMs || 0 },
      item: publicItem(item),
      status: publicState()
    }));
  }

  app.post(`${prefix}/play`, core.asyncRoute(async (req, res) => playResponse(req, res, req.body || {})));
  app.get(`${prefix}/play`, core.asyncRoute(async (req, res) => playResponse(req, res, req.query || {})));

  app.post(`${prefix}/bundle`, core.asyncRoute(async (req, res) => {
    const bundle = normalizeBundlePayload(req.body || {});
    const results = enqueueBundleItems(bundle);
    return res.json(core.ok({
      message: "Sound-Bundle wurde in die Warteschlange gelegt.",
      bundle: {
        bundleId: bundle.bundleId,
        bundleType: bundle.bundleType,
        bundlePriority: bundle.bundlePriority,
        bundleQueuedAt: bundle.bundleQueuedAt,
        bundleLocked: bundle.bundleLocked,
        itemCount: bundle.itemCount,
        items: bundle.items.map(publicItem)
      },
      results: results.map(result => ({
        started: !!result.started,
        queued: !!result.queued,
        dropped: !!result.dropped,
        parallel: !!result.parallel,
        queuePosition: result.queuePosition,
        reason: result.reason || "",
        retryAfterMs: result.retryAfterMs || 0,
        item: publicItem(result.item)
      })),
      status: publicState()
    }));
  }));

  app.post(`${prefix}/stop`, (req, res) => {
    const clearQueue = core.boolParam(core.getParam(req, "clearQueue", false), false);
    if (clearQueue) {
      const clearedCount = state.queue.length;
      state.queue = [];
      state.activeBundleLock = null;
      emitSoundBus("queue_cleared", { kind: "queue", extra: { reason: "manual_stop_clear_queue", clearedCount } });
    }
    const stopped = stopCurrent("manual_stop");
    killParallelDeviceProcesses("manual_stop_parallel");
    state.parallel = [];
    emit("stop_stream");
    return res.json(core.ok({ message: msg("soundStopped"), stopped: publicItem(stopped), status: publicState() }));
  });

  app.post(`${prefix}/skip`, (req, res) => {
    const skipped = stopCurrent("manual_skip");
    state.stats.skipped += 1;
    emit("skip_stream");
    if (skipped) emitSoundBus("manual_skip", { item: skipped, kind: "item", extra: { reason: "manual_skip" } });
    return res.json(core.ok({ message: msg("soundSkipped"), skipped: publicItem(skipped), status: publicState() }));
  });

  app.post(`${prefix}/clear`, (req, res) => {
    const clearedCount = state.queue.length;
    state.queue = [];
    state.activeBundleLock = null;
    state.stats.cleared += 1;
    emit("queue_cleared");
    emitSoundBus("queue_cleared", { kind: "queue", extra: { reason: "api_clear", clearedCount } });
    return res.json(core.ok({ message: msg("queueCleared"), status: publicState() }));
  });

  app.post(`${prefix}/pause`, (req, res) => { state.paused = true; emit("paused"); return res.json(core.ok({ paused: true, status: publicState() })); });
  app.post(`${prefix}/resume`, (req, res) => { state.paused = false; const started = startNextIfPossible("resumed"); emit("resumed"); return res.json(core.ok({ paused: false, started, status: publicState() })); });
  app.post(`${prefix}/reset`, (req, res) => {
    clearFinishTimer();
    if (state.current) killDeviceProcess(state.current, "reset_current");
    killParallelDeviceProcesses("reset_parallel");
    state.current = null;
    state.parallel = [];
    state.queue = [];
    state.activeBundleLock = null;
    state.paused = false;
    emit("reset");
    return res.json(core.ok({ status: publicState() }));
  });

  app.post(`${prefix}/client/ready`, (req, res) => {
    markClient("ready");
    emit("client_ready");
    return res.json(publicState());
  });

  app.post(`${prefix}/client/audio-started`, (req, res) => {
    markClient("audio_started");
    const requestId = clientRequestId(req);
    const item = findActiveItemByRequestId(requestId) || state.current || null;
    const matchedCurrent = !!(requestId && state.current && state.current.requestId === requestId);
    broadcastSoundState("client_audio_started", { clientEvent: { requestId, matchedCurrent, matchedActive: !!item } });
    emitSoundBus("client_audio_started", {
      item,
      kind: "client",
      extra: {
        requestId,
        matchedCurrent,
        matchedActive: !!item,
        mediaType: String((req.body && req.body.mediaType) || (req.query && req.query.mediaType) || ""),
        mutedFallback: !!((req.body && req.body.mutedFallback) || (req.query && req.query.mutedFallback))
      }
    });
    return res.json(core.ok({ current: state.current ? publicItem(state.current) : null, matchedActive: !!item }));
  });

  app.post(`${prefix}/client/audio-ended`, (req, res) => {
    markClient("audio_ended");
    const requestId = clientRequestId(req);
    const item = findActiveItemByRequestId(requestId) || state.current || null;
    emitSoundBus("client_audio_ended", { item, kind: "client", extra: { requestId, matchedActive: !!item } });
    if (clientRequestMatchesCurrent(req)) finishCurrent("client_audio_ended");
    return res.json(core.ok({ status: publicState() }));
  });

  app.post(`${prefix}/client/error`, (req, res) => {
    markClient("error");
    state.stats.failed += 1;
    const requestId = clientRequestId(req);
    const item = findActiveItemByRequestId(requestId) || state.current || null;
    emitSoundBus("client_error", {
      item,
      kind: "client",
      extra: {
        requestId,
        matchedActive: !!item,
        error: String((req.body && req.body.error) || (req.query && req.query.error) || "client_error")
      }
    });
    if (clientRequestMatchesCurrent(req)) finishCurrent("client_error");
    return res.json(core.ok({ status: publicState() }));
  });

  startSoundCanBusParticipant();

  console.log(`[${MODULE_NAME}] loaded prefix=${prefix}`);
};





