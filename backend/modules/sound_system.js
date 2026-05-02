"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const media = require("./helpers/helper_media");

const MODULE_NAME = "sound_system";
const CONFIG_FILE = "sound_system.json";
const MESSAGES_FILE = "messages/sound_system.json";

const DEFAULT_OUTPUT = {
  defaultTarget: "overlay",
  allowPerSoundOverride: true,
  targets: {
    overlay: { enabled: true, label: "OBS Overlay", mode: "browser_overlay", overlayUrl: "/overlays/sound_system_overlay.html", defaultVolume: 85 },
    device: { enabled: true, label: "Audiogerät", mode: "local_device", selectedDeviceId: "default", selectedDeviceName: "Windows Standardgerät", defaultVolume: 80, helper: { enabled: true, path: "tools/audio-device-helper/dist/AudioDeviceHelper.exe", timeoutMs: 30000, playbackMode: "auto" } },
    both: { enabled: false, label: "Overlay + Audiogerät", mode: "combined", defaultVolume: 85 }
  }
};

const DEFAULT_CONFIG = {
  enabled: true,
  version: "0.1.6",
  routes: { prefix: "/api/sound" },
  websocket: { enabled: true, op: "sound_system" },
  overlay: { enabled: true, clientRequired: true, fallbackFinishMs: 12000, introMs: 0, outroMs: 350, gapBetweenSoundsMs: 750 },
  output: DEFAULT_OUTPUT,
  queue: {
    enabled: true,
    maxLength: 50,
    dropWhenFull: true,
    defaultPriority: 50,
    allowParallel: true,
    maxParallel: 3,
    parallelCategories: ["system", "admin", "ui", "test"],
    parallelSoundIds: []
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
  soundsBaseDir: "htdocs/assets/sounds",
  allowedExtensions: [".mp3", ".wav", ".ogg", ".webm", ".m4a"],
  sounds: []
};

const DEFAULT_MESSAGES = {
  moduleReady: "Sound-System bereit.",
  systemDisabled: "Sound-System ist deaktiviert.",
  soundQueued: "Sound wurde in die Warteschlange gelegt.",
  soundStarted: "Sound wird abgespielt.",
  soundStopped: "Sound-Ausgabe wurde gestoppt.",
  soundSkipped: "Aktueller Sound wurde übersprungen.",
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
    stats: { started: 0, queued: 0, stopped: 0, skipped: 0, cleared: 0, failed: 0, deviceStarted: 0, deviceFailed: 0, parallelStarted: 0 }
  };

  let config = DEFAULT_CONFIG;
  let messages = DEFAULT_MESSAGES;
  let finishTimer = null;

  function loadAll() {
    const loadedConfig = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true });
    const loadedMessages = cfg.loadConfig(MESSAGES_FILE, DEFAULT_MESSAGES, { createIfMissing: true, mergeDefaults: true });

    config = loadedConfig.config || DEFAULT_CONFIG;
    if (!config.output) config.output = DEFAULT_OUTPUT;
    if (!config.queue) config.queue = DEFAULT_CONFIG.queue;
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
      durationMs: item.durationMs,
      durationOk: !!item.durationOk,
      durationSource: item.durationSource || "",
      frequency: item.frequency,
      source: item.source,
      requestedBy: item.requestedBy,
      queuedAt: item.queuedAt,
      startedAt: item.startedAt || 0,
      endsAt: item.endsAt || 0,
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

    const base = { ...(config.defaults || {}), ...(preset || {}), ...body };
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
    let type = rawType;
    let audioInfo = null;

    if (generatedBeep) {
      type = "file";
      file = "generated/beep.wav";
      const beepDuration = Number(base.durationMs || 350);
      audioUrl = `${(config.routes && config.routes.prefix) || "/api/sound"}/generated/beep.wav?frequency=${encodeURIComponent(frequency)}&durationMs=${encodeURIComponent(beepDuration)}&volume=${encodeURIComponent(volume)}`;
    } else {
      if (!file) throw new Error(msg("soundFileMissing"));
      audioInfo = media.getAudioInfo(file, {
        baseDir: getSoundsBaseDir(),
        allowedExtensions: Array.isArray(config.allowedExtensions) ? config.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS
      });
      if (!audioInfo.ok) throw new Error(`${msg("soundFileMissing")} (${audioInfo.error || "unknown"}: ${file})`);
      fullPath = audioInfo.path;
      audioUrl = browserUrlFromRelative(audioInfo.relative || file);
    }

    const resolvedDuration = resolveDurationMs(base, audioInfo, fallbackDurationMs, generatedBeep);

    return {
      requestId: makeRequestId(),
      soundId: soundId || normalizeId(file ? path.basename(file, path.extname(file)) : "generated_beep"),
      label: String(base.label || soundId || file || "Generated Beep").trim(),
      type,
      category: String(base.category || "fun").trim().toLowerCase(),
      target,
      outputTarget,
      priority: Number.isFinite(Number(base.priority)) ? Number(base.priority) : Number(config.queue?.defaultPriority || 50),
      volume,
      file,
      fullPath,
      audioUrl,
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
      override: core.boolParam(base.override, false),
      force: core.boolParam(base.force, false),
      clearQueue: core.boolParam(base.clearQueue, false),
      canInterrupt: core.boolParam(base.canInterrupt, false),
      canBeInterrupted: core.boolParam(base.canBeInterrupted, true),
      queueIfBusy: core.boolParam(base.queueIfBusy, true),
      dropIfBusy: core.boolParam(base.dropIfBusy, false),
      parallelAllowed: core.boolParam(base.parallelAllowed, false),
      queuedAt: Date.now(),
      startedAt: 0,
      endsAt: 0
    };
  }

  function sortQueue() { state.queue.sort((a, b) => b.priority !== a.priority ? b.priority - a.priority : a.queuedAt - b.queuedAt); }
  function clearFinishTimer() { if (finishTimer) clearTimeout(finishTimer); finishTimer = null; }

  function playDeviceOutput(item) {
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
    state.stats.deviceStarted += 1;
    state.device = { lastOk: false, lastAt: Date.now(), lastError: "", lastResult: { started: true, helperPath, args: ["play", "--file", item.file, "--device", selectedDeviceId, "--volume", String(item.volume), "--mode", mode] } };
    emit("device_play_started");
    childProcess.execFile(helperPath, args, { windowsHide: true, timeout: Number(helper.timeoutMs || 30000) }, (err, stdout, stderr) => {
      let parsed = null;
      try { parsed = stdout ? JSON.parse(stdout) : null; } catch (_) { parsed = null; }
      if (err || !parsed || parsed.ok === false) {
        state.stats.deviceFailed += 1;
        state.device = { lastOk: false, lastAt: Date.now(), lastError: err ? (err.message || String(err)) : (parsed && (parsed.error || parsed.message)) || stderr || "device_play_failed", lastResult: parsed || { stdout, stderr } };
        emit("device_play_failed");
        return;
      }
      state.device = { lastOk: true, lastAt: Date.now(), lastError: "", lastResult: parsed };
      emit("device_play_finished");
    });
  }

  function startItem(item, reason, options = {}) {
    item.startedAt = Date.now();
    item.endsAt = item.startedAt + item.durationMs + item.outroMs;
    state.stats.started += 1;
    playDeviceOutput(item);

    if (options.parallel) {
      state.parallel.push(item);
      state.stats.parallelStarted += 1;
      setTimeout(() => finishParallel(item.requestId, "parallel_auto_finished"), Math.max(1000, item.durationMs + item.outroMs + 250));
      emit(reason || "parallel_started");
      if (shouldUseOverlay(item)) emit("play_stream");
      return;
    }

    clearFinishTimer();
    state.current = item;
    emit(reason || "started");
    if (shouldUseOverlay(item)) emit("play_stream");
    finishTimer = setTimeout(() => finishCurrent("auto_finished"), Math.max(1000, item.durationMs + item.outroMs + 250));
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
    const next = state.queue.shift();
    startItem(next, reason || "next_started");
    return true;
  }

  function finishCurrent(reason) {
    clearFinishTimer();
    const finished = state.current;
    state.current = null;
    emit(reason || "finished");
    const gap = Number((finished && finished.gapAfterMs) || config.overlay?.gapBetweenSoundsMs || 750);
    setTimeout(() => startNextIfPossible("gap_finished"), Math.max(0, gap));
    return finished;
  }

  function stopCurrent(reason) {
    const stopped = state.current;
    clearFinishTimer();
    state.current = null;
    state.stats.stopped += 1;
    emit(reason || "stopped");
    setTimeout(() => startNextIfPossible("after_stop"), 0);
    return stopped;
  }

  function enqueueOrStart(item) {
    if (!state.enabled) throw new Error(msg("systemDisabled"));
    if (item.clearQueue) state.queue = [];

    if (state.current && parallelAllowedByPolicy(item)) {
      startItem(item, "parallel_started", { parallel: true });
      return { started: true, queued: false, parallel: true, queuePosition: 0, item };
    }

    if (state.current) {
      const mayInterrupt = item.force || item.override || (item.canInterrupt && state.current.canBeInterrupted && item.priority > state.current.priority);
      if (mayInterrupt) {
        const old = state.current;
        state.current = null;
        clearFinishTimer();
        if (old.queueIfBusy !== false) state.queue.unshift(old);
        startItem(item, "interrupted_started");
        return { started: true, queued: false, queuePosition: 0, item };
      }
      if (item.dropIfBusy || item.queueIfBusy === false) return { started: false, queued: false, dropped: true, queuePosition: -1, item };
      const maxLength = Number(config.queue?.maxLength || 50);
      if (state.queue.length >= maxLength) {
        if (config.queue?.dropWhenFull !== false) return { started: false, queued: false, dropped: true, queuePosition: -1, item, reason: "queue_full" };
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
      result: { started: result.started, queued: result.queued, dropped: !!result.dropped, parallel: !!result.parallel, queuePosition: result.queuePosition, reason: result.reason || "" },
      item: publicItem(item),
      status: publicState()
    }));
  }

  app.post(`${prefix}/play`, core.asyncRoute(async (req, res) => playResponse(req, res, req.body || {})));
  app.get(`${prefix}/play`, core.asyncRoute(async (req, res) => playResponse(req, res, req.query || {})));

  app.post(`${prefix}/stop`, (req, res) => {
    const clearQueue = core.boolParam(core.getParam(req, "clearQueue", false), false);
    if (clearQueue) state.queue = [];
    const stopped = stopCurrent("manual_stop");
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
    state.stats.cleared += 1;
    emit("queue_cleared");
    return res.json(core.ok({ message: msg("queueCleared"), status: publicState() }));
  });

  app.post(`${prefix}/pause`, (req, res) => { state.paused = true; emit("paused"); return res.json(core.ok({ paused: true, status: publicState() })); });
  app.post(`${prefix}/resume`, (req, res) => { state.paused = false; const started = startNextIfPossible("resumed"); emit("resumed"); return res.json(core.ok({ paused: false, started, status: publicState() })); });
  app.post(`${prefix}/reset`, (req, res) => { clearFinishTimer(); state.current = null; state.parallel = []; state.queue = []; state.paused = false; emit("reset"); return res.json(core.ok({ status: publicState() })); });

  app.post(`${prefix}/client/ready`, (req, res) => { markClient("ready"); emit("client_ready"); return res.json(publicState()); });
  app.post(`${prefix}/client/audio-started`, (req, res) => { markClient("audio_started"); emit("client_audio_started"); return res.json(core.ok({ current: state.current ? publicItem(state.current) : null })); });
  app.post(`${prefix}/client/audio-ended`, (req, res) => { markClient("audio_ended"); finishCurrent("client_audio_ended"); return res.json(core.ok({ status: publicState() })); });
  app.post(`${prefix}/client/error`, (req, res) => { markClient("error"); state.stats.failed += 1; finishCurrent("client_error"); return res.json(core.ok({ status: publicState() })); });

  console.log(`[${MODULE_NAME}] loaded prefix=${prefix}`);
};
