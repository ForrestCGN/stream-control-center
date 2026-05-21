"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const media = require("./helpers/helper_media");
const database = require("../core/database");

const MODULE_NAME = "sound_system";
const CONFIG_FILE = "sound_system.json";
const MESSAGES_FILE = "messages/sound_system.json";

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
  version: "0.1.10",
  routes: { prefix: "/api/sound" },
  websocket: { enabled: true, op: "sound_system" },
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
    stats: { started: 0, queued: 0, stopped: 0, skipped: 0, cleared: 0, failed: 0, deviceStarted: 0, deviceFailed: 0, parallelStarted: 0, bundlesQueued: 0, bundleItemsQueued: 0 },
    activeBundleLock: null
  };

  let config = DEFAULT_CONFIG;
  let messages = DEFAULT_MESSAGES;
  let finishTimer = null;
  const recent = { sounds: new Map(), categories: new Map(), users: new Map(), userSounds: new Map() };
  const SOUND_SETTINGS_SCHEMA_MODULE = "sound_system_settings";
  const SOUND_SETTINGS_SCHEMA_VERSION = 1;
  const SOUND_SETTINGS_TABLE = "sound_settings";
  const SOUND_SETTINGS_BLOCKS = ["output", "overlay", "queue", "priorities", "defaults", "categoryDefaults", "targets", "soundsBaseDir", "allowedExtensions"];

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
      addedByStep: "STEP200.1",
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

  function emit(reason) {
    touch();
    if (config.websocket && config.websocket.enabled !== false && typeof broadcastWS === "function") {
      broadcastWS({ op: config.websocket.op || MODULE_NAME, reason: reason || "state", data: publicState() });
    }
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
    return results;
  }

  function publicState() {
    return {
      ok: true,
      module: MODULE_NAME,
      version: state.version,
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
      stats: { ...state.stats },
      config: {
        path: state.configPath,
        ok: state.configOk,
        error: state.configError,
        routes: config.routes || {},
        websocket: config.websocket || {},
        overlay: config.overlay || {},
        output: config.output || {},
        queue: config.queue || {},
        targets: config.targets || {},
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
      lifecycle: item.lifecycle || {},
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

  function clampVolume(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function normalizeTarget(rawTarget) {
    const fallback = (config.defaults && config.defaults.target) || "stream";
    const target = String(rawTarget || fallback).trim().toLowerCase();
    if (["stream", "discord", "both"].includes(target)) return target;
    return fallback;
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
  function isVideoItem(item) { return String(item && item.mediaType || item && item.type || "").toLowerCase() === "video" || !!(item && item.videoUrl); }
  function shouldWaitForOverlayEnd(item) { return isVideoItem(item) && shouldUseOverlay(item); }
  function videoFallbackFinishMs(item) {
    const overlayCfg = config.overlay || {};
    const duration = Number(item && item.durationMs || 0);
    const outro = Number(item && item.outroMs || 0);
    const buffer = Math.max(1000, Number(overlayCfg.videoFallbackBufferMs || 5000));
    const hardFallback = Math.max(30000, Number(overlayCfg.videoFallbackFinishMs || 300000));
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

  function normalizePlayRequest(raw) {
    const body = raw || {};
    const soundId = normalizeId(body.soundId || body.id || body.sound || "");
    const preset = soundId ? findSound(soundId) : null;
    if (soundId && !preset) throw new Error(msg("soundNotFound"));

    const base = applyCategoryDefaults(config.defaults || {}, preset || {}, body);
    const rawType = String(base.type || "file").trim().toLowerCase();
    const generatedBeep = rawType === "generated_beep";
    const target = normalizeTarget(base.target);
    const outputTarget = normalizeOutputTarget(base.outputTarget || base.output || base.targetOutput, target);
    if (!targetEnabled(target)) throw new Error(msg("targetDisabled"));
    if (!outputTargetEnabled(outputTarget)) throw new Error(`Sound-Ausgabeziel ist deaktiviert: ${outputTarget}`);

    const targetConfig = (config.targets && config.targets[target]) || {};
    const outputConfig = config.output?.targets?.[outputTarget] || {};
    const volume = clampVolume(base.volume, clampVolume(outputConfig.defaultVolume, clampVolume(targetConfig.defaultVolume, 85)));
    const fallbackDurationMs = Math.max(100, Number(config.overlay?.fallbackFinishMs || 12000));
    const frequency = Math.max(80, Math.min(2000, Number(base.frequency || 880)));

    let file = String(base.file || body.file || "").trim().replace(/\\/g, "/");
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

    if (generatedBeep) {
      type = "file";
      mediaType = "audio";
      file = "generated/beep.wav";
      const beepDuration = Number(base.durationMs || 350);
      audioUrl = `${(config.routes && config.routes.prefix) || "/api/sound"}/generated/beep.wav?frequency=${encodeURIComponent(frequency)}&durationMs=${encodeURIComponent(beepDuration)}&volume=${encodeURIComponent(volume)}`;
      mediaUrl = audioUrl;
      hasAudio = true;
      hasVideo = false;
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
    const effectiveOutputTarget = mediaType === "video" ? "overlay" : outputTarget;

    return {
      requestId: makeRequestId(),
      soundId: soundId || normalizeId(file ? path.basename(file, path.extname(file)) : "generated_beep"),
      label: String(base.label || soundId || file || "Generated Beep").trim(),
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
      lifecycle: { startSignalEmitted: false },
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
  }

  function sortQueue() {
    if (config.queue?.sortByPriority === false) {
      state.queue.sort((a, b) => a.queuedAt - b.queuedAt);
      return;
    }
    state.queue.sort(compareQueueItems);
  }

  function emitItemEvent(reason, item, extra = {}) {
    if (!item || !config.websocket || config.websocket.enabled === false || typeof broadcastWS !== "function") return;
    broadcastWS({
      op: config.websocket.op || MODULE_NAME,
      reason,
      item: publicItem(item),
      data: publicState(),
      ...extra
    });
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

  function activateItemAudio(item, parallel) {
    if (!itemStillActive(item, parallel)) return;

    item.startedAt = Date.now();
    item.endsAt = item.startedAt + item.durationMs + item.outroMs;
    item.lifecycle = { ...(item.lifecycle || {}), audioStartedAt: item.startedAt };

    playDeviceOutput(item);
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
      }
      emit(reason || "started");
    }

    if (visualLeadMs > 0) {
      emitItemEvent("item_starting", item, { parallel, visualLeadMs });
      setTimeout(() => activateItemAudio(item, parallel), visualLeadMs);
      return;
    }

    activateItemAudio(item, parallel);
  }

  function finishParallel(requestId, reason) {
    const index = state.parallel.findIndex(item => item.requestId === requestId);
    if (index < 0) return null;
    const [finished] = state.parallel.splice(index, 1);
    emit(reason || "parallel_finished");
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
    emit(reason || "finished");
    const gap = Number((finished && finished.gapAfterMs) || config.overlay?.gapBetweenSoundsMs || 750);
    if (finished && finished.bundleId && state.activeBundleLock && state.activeBundleLock.bundleId === finished.bundleId) {
      const hasMoreBundleItems = state.queue.some(item => item && item.bundleId === finished.bundleId);
      if (!hasMoreBundleItems) state.activeBundleLock = null;
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

  function clientRequestMatchesCurrent(req) {
    const requestId = String((req.body && req.body.requestId) || (req.query && req.query.requestId) || "").trim();
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
    if (clearQueue) { state.queue = []; state.activeBundleLock = null; }
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
    return res.json(core.ok({ message: msg("soundSkipped"), skipped: publicItem(skipped), status: publicState() }));
  });

  app.post(`${prefix}/clear`, (req, res) => {
    state.queue = [];
    state.activeBundleLock = null;
    state.stats.cleared += 1;
    emit("queue_cleared");
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

  app.post(`${prefix}/client/ready`, (req, res) => { markClient("ready"); emit("client_ready"); return res.json(publicState()); });
  app.post(`${prefix}/client/audio-started`, (req, res) => { markClient("audio_started"); emit("client_audio_started"); return res.json(core.ok({ current: state.current ? publicItem(state.current) : null })); });
  app.post(`${prefix}/client/audio-ended`, (req, res) => {
    markClient("audio_ended");
    if (clientRequestMatchesCurrent(req)) finishCurrent("client_audio_ended");
    return res.json(core.ok({ status: publicState() }));
  });
  app.post(`${prefix}/client/error`, (req, res) => {
    markClient("error");
    state.stats.failed += 1;
    if (clientRequestMatchesCurrent(req)) finishCurrent("client_error");
    return res.json(core.ok({ status: publicState() }));
  });

  console.log(`[${MODULE_NAME}] loaded prefix=${prefix}`);
};





