"use strict";

const path = require("path");
const core = require("./helpers/helper_core");
const cfg = require("./helpers/helper_config");
const media = require("./helpers/helper_media");

const MODULE_NAME = "sound_system";
const CONFIG_FILE = "sound_system.json";
const MESSAGES_FILE = "messages/sound_system.json";

const DEFAULT_CONFIG = {
  enabled: true,
  version: "0.1.1",
  routes: { prefix: "/api/sound" },
  websocket: { enabled: true, op: "sound_system" },
  overlay: { enabled: true, clientRequired: true, fallbackFinishMs: 12000, introMs: 0, outroMs: 350, gapBetweenSoundsMs: 750 },
  queue: { enabled: true, maxLength: 50, dropWhenFull: true, defaultPriority: 50 },
  targets: {
    stream: { enabled: true, defaultVolume: 85 },
    discord: { enabled: false, defaultVolume: 80 },
    both: { enabled: false, defaultVolume: 85 }
  },
  defaults: {
    target: "stream",
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
    queue: [],
    enabled: true,
    paused: false,
    updatedAt: core.nowIso(),
    client: { connected: false, lastSeenAt: 0, lastEvent: "" },
    stats: { started: 0, queued: 0, stopped: 0, skipped: 0, cleared: 0, failed: 0 }
  };

  let config = DEFAULT_CONFIG;
  let messages = DEFAULT_MESSAGES;
  let finishTimer = null;

  function loadAll() {
    const loadedConfig = cfg.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true });
    const loadedMessages = cfg.loadConfig(MESSAGES_FILE, DEFAULT_MESSAGES, { createIfMissing: true, mergeDefaults: true });

    config = loadedConfig.config || DEFAULT_CONFIG;
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
      queue: state.queue.map(publicItem),
      queuedCount: state.queue.length,
      client: { ...state.client },
      stats: { ...state.stats },
      config: {
        path: state.configPath,
        ok: state.configOk,
        error: state.configError,
        routes: config.routes || {},
        websocket: config.websocket || {},
        overlay: config.overlay || {},
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
      priority: item.priority,
      volume: item.volume,
      file: item.file,
      audioUrl: item.audioUrl,
      durationMs: item.durationMs,
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

  function targetEnabled(target) {
    const t = config.targets && config.targets[target];
    return !!t && t.enabled !== false;
  }

  function normalizePlayRequest(raw) {
    const body = raw || {};
    const soundId = normalizeId(body.soundId || body.id || body.sound || "");
    const preset = soundId ? findSound(soundId) : null;
    if (soundId && !preset) throw new Error(msg("soundNotFound"));

    const base = { ...(config.defaults || {}), ...(preset || {}), ...body };
    const type = String(base.type || "file").trim().toLowerCase();
    const target = normalizeTarget(base.target);
    if (!targetEnabled(target)) throw new Error(msg("targetDisabled"));

    const targetConfig = (config.targets && config.targets[target]) || {};
    const volume = clampVolume(base.volume, clampVolume(targetConfig.defaultVolume, 85));
    const durationMs = Math.max(100, Number(base.durationMs || config.overlay?.fallbackFinishMs || 12000));

    let file = String(base.file || body.file || "").trim().replace(/\\/g, "/");
    let fullPath = "";
    let audioUrl = "";

    if (type !== "generated_beep") {
      if (!file) throw new Error(msg("soundFileMissing"));
      const audioInfo = media.getAudioInfo(file, {
        baseDir: getSoundsBaseDir(),
        allowedExtensions: Array.isArray(config.allowedExtensions) ? config.allowedExtensions : media.DEFAULT_ALLOWED_EXTENSIONS
      });
      if (!audioInfo.ok) throw new Error(`${msg("soundFileMissing")} (${audioInfo.error || "unknown"}: ${file})`);
      fullPath = audioInfo.path;
      audioUrl = browserUrlFromRelative(audioInfo.relative || file);
    } else {
      file = "";
    }

    return {
      requestId: makeRequestId(),
      soundId: soundId || normalizeId(file ? path.basename(file, path.extname(file)) : "generated_beep"),
      label: String(base.label || soundId || file || "Generated Beep").trim(),
      type,
      category: String(base.category || "fun").trim().toLowerCase(),
      target,
      priority: Number.isFinite(Number(base.priority)) ? Number(base.priority) : Number(config.queue?.defaultPriority || 50),
      volume,
      file,
      fullPath,
      audioUrl,
      durationMs: type === "generated_beep" ? durationMs : Math.max(100, durationMs),
      frequency: Math.max(80, Math.min(2000, Number(base.frequency || 880))),
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

  function sortQueue() {
    state.queue.sort((a, b) => b.priority !== a.priority ? b.priority - a.priority : a.queuedAt - b.queuedAt);
  }

  function clearFinishTimer() {
    if (finishTimer) clearTimeout(finishTimer);
    finishTimer = null;
  }

  function startItem(item, reason) {
    clearFinishTimer();
    item.startedAt = Date.now();
    item.endsAt = item.startedAt + item.durationMs + item.outroMs;
    state.current = item;
    state.stats.started += 1;
    emit(reason || "started");
    if (item.target === "stream" || item.target === "both") emit("play_stream");
    finishTimer = setTimeout(() => finishCurrent("auto_finished"), Math.max(1000, item.durationMs + item.outroMs + 250));
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
      result: { started: result.started, queued: result.queued, dropped: !!result.dropped, queuePosition: result.queuePosition, reason: result.reason || "" },
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
  app.post(`${prefix}/reset`, (req, res) => { clearFinishTimer(); state.current = null; state.queue = []; state.paused = false; emit("reset"); return res.json(core.ok({ status: publicState() })); });

  app.post(`${prefix}/client/ready`, (req, res) => { markClient("ready"); emit("client_ready"); return res.json(publicState()); });
  app.post(`${prefix}/client/audio-started`, (req, res) => { markClient("audio_started"); emit("client_audio_started"); return res.json(core.ok({ current: state.current ? publicItem(state.current) : null })); });
  app.post(`${prefix}/client/audio-ended`, (req, res) => { markClient("audio_ended"); finishCurrent("client_audio_ended"); return res.json(core.ok({ status: publicState() })); });
  app.post(`${prefix}/client/error`, (req, res) => { markClient("error"); state.stats.failed += 1; finishCurrent("client_error"); return res.json(core.ok({ status: publicState() })); });

  console.log(`[${MODULE_NAME}] loaded prefix=${prefix}`);
};
