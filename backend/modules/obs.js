"use strict";

const { getSharedObs } = require("./obs_shared");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const shared = getSharedObs(env, console);

  const sourceAliases = safeJsonParse(env.OBS_SOURCE_ALIASES_JSON || "{}", {});
  const sceneAliases = safeJsonParse(env.OBS_SCENE_ALIASES_JSON || "{}", {});


  const DEFAULT_DASHBOARD_CONFIG = {
    autoRefreshEnabled: true,
    fastRefreshMs: 2000,
    fullRefreshMs: 10000,
    showStatusLine: true,
    showPerformance: true,
    showOverview: true,
    hideInternalScenesOnMain: true
  };

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function boolValue(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    const v = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "ja", "on"].includes(v)) return true;
    if (["0", "false", "no", "nein", "off"].includes(v)) return false;
    return fallback;
  }

  function sanitizeDashboardConfig(input = {}) {
    const cfg = { ...DEFAULT_DASHBOARD_CONFIG, ...(input || {}) };
    cfg.autoRefreshEnabled = boolValue(cfg.autoRefreshEnabled, DEFAULT_DASHBOARD_CONFIG.autoRefreshEnabled);
    cfg.fastRefreshMs = clampNumber(cfg.fastRefreshMs, 1000, 60000, DEFAULT_DASHBOARD_CONFIG.fastRefreshMs);
    cfg.fullRefreshMs = clampNumber(cfg.fullRefreshMs, 3000, 120000, DEFAULT_DASHBOARD_CONFIG.fullRefreshMs);
    if (cfg.fullRefreshMs < cfg.fastRefreshMs) cfg.fullRefreshMs = cfg.fastRefreshMs;
    cfg.showStatusLine = boolValue(cfg.showStatusLine, DEFAULT_DASHBOARD_CONFIG.showStatusLine);
    cfg.showPerformance = boolValue(cfg.showPerformance, DEFAULT_DASHBOARD_CONFIG.showPerformance);
    cfg.showOverview = boolValue(cfg.showOverview, DEFAULT_DASHBOARD_CONFIG.showOverview);
    cfg.hideInternalScenesOnMain = boolValue(cfg.hideInternalScenesOnMain, DEFAULT_DASHBOARD_CONFIG.hideInternalScenesOnMain);
    return cfg;
  }

  function loadDashboardConfig() {
    const loaded = configHelper.loadConfig("obs_dashboard.json", DEFAULT_DASHBOARD_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
    return { ...loaded, config: sanitizeDashboardConfig(loaded.config || DEFAULT_DASHBOARD_CONFIG) };
  }

  function saveDashboardConfig(input = {}) {
    const current = loadDashboardConfig().config;
    const raw = input && typeof input === "object" && input.config && typeof input.config === "object" ? input.config : input;
    const next = sanitizeDashboardConfig({ ...current, ...(raw || {}) });
    const filePath = configHelper.resolveConfigFile("obs_dashboard.json");
    configHelper.writeJsonFile(filePath, next, { spaces: 2 });
    return { config: next, path: filePath };
  }

  function setCommonHeaders(res) {
    res.set("Cache-Control", "no-store");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }

  function ok(res, route, data, statusCode = 200) {
    setCommonHeaders(res);
    res.status(statusCode).json({
      ok: true,
      module: "obs",
      route,
      timestamp: core.nowIso(),
      data
    });
  }

  function fail(res, route, code, message, details = null, statusCode = 400) {
    setCommonHeaders(res);
    res.status(statusCode).json({
      ok: false,
      module: "obs",
      route,
      timestamp: core.nowIso(),
      error: {
        code,
        message,
        details: details || undefined
      }
    });
  }

  function body(req, key) {
    return core.getParam({ body: req && req.body ? req.body : {} }, key, undefined);
  }

  function normalize(value) {
    return shared.normalize(value);
  }

  function normalizeLookup(value) {
    return shared.normalizeLookup(value);
  }

  function safeJsonParse(input, fallback) {
    try {
      return JSON.parse(input);
    } catch (_) {
      return fallback;
    }
  }

  async function resolveSceneName(sceneOrAlias) {
    const raw = normalize(sceneOrAlias);
    const mapped = sceneAliases[raw] || sceneAliases[normalizeLookup(raw)] || raw;
    const sceneNames = await shared.refreshScenes();
    return sceneNames.find(x => normalizeLookup(x) === normalizeLookup(mapped)) || null;
  }

  async function resolveInputName(inputOrAlias) {
    const raw = normalize(inputOrAlias);
    const mapped = sourceAliases[raw] || sourceAliases[normalizeLookup(raw)] || raw;
    const input = await shared.findInputByNameOrAlias(mapped);
    return input ? input.inputName : null;
  }

  app.options(/.*/, (req, res) => {
    setCommonHeaders(res);
    res.status(204).end();
  });

  function obsRoutes(legacyPath) {
    if (!legacyPath || typeof legacyPath !== "string") return legacyPath;
    if (!legacyPath.startsWith("/obs/") && legacyPath !== "/obs") return legacyPath;
    return [legacyPath, `/api${legacyPath}`];
  }

  // Legacy routes behalten
  app.get(obsRoutes("/obs/audio/busy"), (req, res) => {
    setCommonHeaders(res);
    res.json(shared.getLegacyAudioState());
  });

  app.get(obsRoutes("/obs/audio/state"), (req, res) => {
    setCommonHeaders(res);
    res.type("text/plain; charset=utf-8");
    res.send(shared.state.audioBusy ? "BUSY" : "IDLE");
  });

  app.get(obsRoutes("/obs/health"), (req, res) => {
    setCommonHeaders(res);
    const s = shared.getPublicStatus();
    res.json({
      connected: s.obsConnected,
      detected: s.obsDetected,
      lastCheck: s.lastCheck,
      ts: Date.now()
    });
  });

  app.get(obsRoutes("/obs/audio/busy/text"), (req, res) => {
    setCommonHeaders(res);
    res.type("text/plain; charset=utf-8");
    res.send(shared.state.audioBusy ? `Ton aktiv auf: ${shared.state.audioActive.join(", ")}` : "Kein Ton aktiv");
  });

  // Neue Routen
  app.get(obsRoutes("/obs/dashboard/config"), (req, res) => {
    const route = "/obs/dashboard/config";
    try {
      const loaded = loadDashboardConfig();
      ok(res, route, { config: loaded.config, defaults: DEFAULT_DASHBOARD_CONFIG, path: loaded.path, created: !!loaded.created });
    } catch (err) {
      fail(res, route, "OBS_DASHBOARD_CONFIG_LOAD_FAILED", err.message || "OBS-Dashboard-Config konnte nicht gelesen werden.", null, 500);
    }
  });

  app.post(obsRoutes("/obs/dashboard/config"), (req, res) => {
    const route = "/obs/dashboard/config";
    try {
      const saved = saveDashboardConfig(req.body || {});
      ok(res, route, { config: saved.config, defaults: DEFAULT_DASHBOARD_CONFIG, path: saved.path });
    } catch (err) {
      fail(res, route, "OBS_DASHBOARD_CONFIG_SAVE_FAILED", err.message || "OBS-Dashboard-Config konnte nicht gespeichert werden.", null, 500);
    }
  });

  app.get(obsRoutes("/obs/status"), async (req, res) => {
    const route = "/obs/status";
    try {
      await shared.refreshSnapshot();
      ok(res, route, shared.getPublicStatus());
    } catch (err) {
      fail(res, route, "OBS_STATUS_FAILED", err.message || "OBS-Status konnte nicht gelesen werden.", null, 500);
    }
  });

  app.get(obsRoutes("/obs/stats"), async (req, res) => {
    const route = "/obs/stats";
    try {
      await shared.refreshSnapshot();
      const publicStatus = shared.getPublicStatus();

      const [statsResult, streamResult, recordResult, replayResult] = await Promise.allSettled([
        shared.call("GetStats"),
        shared.call("GetStreamStatus"),
        shared.call("GetRecordStatus"),
        shared.call("GetReplayBufferStatus")
      ]);

      ok(res, route, {
        obsConnected: publicStatus.obsConnected,
        obsDetected: publicStatus.obsDetected,
        currentProgramSceneName: publicStatus.currentProgramSceneName,
        currentPreviewSceneName: publicStatus.currentPreviewSceneName,
        studioModeEnabled: publicStatus.studioModeEnabled,
        streamActive: publicStatus.streamActive,
        recordActive: publicStatus.recordActive,
        recordPaused: publicStatus.recordPaused,
        replayBufferActive: publicStatus.replayBufferActive,
        stats: statsResult.status === "fulfilled" ? statsResult.value : (publicStatus.stats || null),
        stream: streamResult.status === "fulfilled" ? streamResult.value : { outputActive: publicStatus.streamActive },
        record: recordResult.status === "fulfilled" ? recordResult.value : { outputActive: publicStatus.recordActive, outputPaused: publicStatus.recordPaused },
        replay: replayResult.status === "fulfilled" ? replayResult.value : { outputActive: publicStatus.replayBufferActive },
        warnings: [
          statsResult.status === "rejected" ? { key: "stats_unavailable", message: statsResult.reason && statsResult.reason.message ? statsResult.reason.message : String(statsResult.reason || "GetStats failed") } : null,
          streamResult.status === "rejected" ? { key: "stream_status_unavailable", message: streamResult.reason && streamResult.reason.message ? streamResult.reason.message : String(streamResult.reason || "GetStreamStatus failed") } : null,
          recordResult.status === "rejected" ? { key: "record_status_unavailable", message: recordResult.reason && recordResult.reason.message ? recordResult.reason.message : String(recordResult.reason || "GetRecordStatus failed") } : null,
          replayResult.status === "rejected" ? { key: "replay_status_unavailable", message: replayResult.reason && replayResult.reason.message ? replayResult.reason.message : String(replayResult.reason || "GetReplayBufferStatus failed") } : null
        ].filter(Boolean)
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "OBS_STATS_FAILED", err.message || "OBS-Statistiken konnten nicht gelesen werden.", null, status);
    }
  });

  app.get(obsRoutes("/obs/scenes"), async (req, res) => {
    const route = "/obs/scenes";
    try {
      const scenes = await shared.refreshScenes();
      ok(res, route, {
        currentProgramSceneName: shared.state.currentProgramSceneName,
        currentPreviewSceneName: shared.state.currentPreviewSceneName,
        scenes: scenes.map(sceneName => ({ sceneName })),
        aliases: Object.entries(sceneAliases).map(([alias, sceneName]) => ({ alias, sceneName }))
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_SCENES_FAILED", err.message || "Szenen konnten nicht gelesen werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/scene/switch"), async (req, res) => {
    const route = "/obs/scene/switch";
    try {
      const input = body(req, "scene") || body(req, "alias");
      if (!input) return fail(res, route, "MISSING_SCENE", 'Es fehlt "scene" oder "alias".');

      const sceneName = await resolveSceneName(input);
      if (!sceneName) {
        return fail(res, route, "SCENE_NOT_FOUND", `Scene '${input}' wurde nicht gefunden.`, { scene: input }, 404);
      }

      const fromScene = shared.state.currentProgramSceneName;
      await shared.setProgramScene(sceneName);
      ok(res, route, {
        fromScene,
        toScene: sceneName,
        usedAlias: normalize(input) !== sceneName ? normalize(input) : null
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SCENE_SWITCH_FAILED", err.message || "Scene konnte nicht umgeschaltet werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/scene/preview"), async (req, res) => {
    const route = "/obs/scene/preview";
    try {
      const input = body(req, "scene") || body(req, "alias");
      if (!input) return fail(res, route, "MISSING_SCENE", 'Es fehlt "scene" oder "alias".');

      const sceneName = await resolveSceneName(input);
      if (!sceneName) {
        return fail(res, route, "SCENE_NOT_FOUND", `Scene '${input}' wurde nicht gefunden.`, { scene: input }, 404);
      }

      await shared.setPreviewScene(sceneName);
      ok(res, route, { previewScene: sceneName });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "PREVIEW_SCENE_FAILED", err.message || "Preview-Scene konnte nicht gesetzt werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/studio/transition"), async (req, res) => {
    const route = "/obs/studio/transition";
    try {
      await shared.refreshSnapshot();
      if (!shared.state.studioModeEnabled) {
        return fail(res, route, "STUDIO_MODE_DISABLED", "Studio Mode ist deaktiviert.", null, 409);
      }
      await shared.triggerStudioTransition();
      ok(res, route, { transitionTriggered: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "STUDIO_TRANSITION_FAILED", err.message || "Studio-Transition konnte nicht ausgelÃ¶st werden.", null, status);
    }
  });

  app.get(obsRoutes("/obs/sources"), async (req, res) => {
    const route = "/obs/sources";
    try {
      const inputs = await shared.getInputList();
      ok(res, route, {
        inputs: inputs.map(x => ({
          inputName: x.inputName,
          inputKind: x.inputKind,
          unversionedInputKind: x.unversionedInputKind
        })),
        aliases: Object.entries(sourceAliases).map(([alias, inputName]) => ({ alias, inputName }))
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_INPUTS_FAILED", err.message || "Inputs konnten nicht gelesen werden.", null, status);
    }
  });

  app.get(obsRoutes("/obs/browser-sources"), async (req, res) => {
    const route = "/obs/browser-sources";

    try {
      const inputs = await shared.getInputList();
      const browserInputs = inputs.filter(x => {
        const kind = String(x.inputKind || x.unversionedInputKind || "").toLowerCase();
        return kind.includes("browser");
      });

      const browserSources = [];

      for (const input of browserInputs) {
        let settings = {};
        try {
          const result = await shared.getInputSettings(input.inputName);
          settings = result.inputSettings || result.settings || result || {};
        } catch (err) {
          settings = { error: err.message || String(err) };
        }

        browserSources.push({
          inputName: input.inputName,
          inputKind: input.inputKind,
          unversionedInputKind: input.unversionedInputKind,
          url: settings.url || "",
          local_file: settings.local_file || "",
          is_local_file: !!settings.is_local_file,
          width: settings.width,
          height: settings.height,
          fps: settings.fps
        });
      }

      ok(res, route, {
        count: browserSources.length,
        browserSources
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_BROWSER_SOURCES_FAILED", err.message || "Browserquellen konnten nicht gelesen werden.", null, status);
    }
  });
  app.get(obsRoutes("/obs/scene-items"), async (req, res) => {
    const route = "/obs/scene-items";
    try {
      const input = core.pickFirst(core.getParam(req, "scene"), core.getParam(req, "alias"));
      if (!input) return fail(res, route, "MISSING_SCENE", 'Es fehlt Query-Parameter "scene" oder "alias".');

      const sceneName = await resolveSceneName(input);
      if (!sceneName) {
        return fail(res, route, "SCENE_NOT_FOUND", `Scene '${input}' wurde nicht gefunden.`, { scene: input }, 404);
      }

      const items = await shared.getSceneItemList(sceneName);
      ok(res, route, {
        sceneName,
        sceneItems: items.map(x => ({
          sceneItemId: x.sceneItemId,
          sourceName: x.sourceName,
          enabled: x.sceneItemEnabled,
          locked: x.sceneItemLocked
        }))
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_SCENE_ITEMS_FAILED", err.message || "Scene-Items konnten nicht gelesen werden.", null, status);
    }
  });

  async function handleSceneItemVisibility(req, res, mode) {
    const route = `/obs/source/${mode}`;
    try {
      const sceneInput = body(req, "scene") || body(req, "sceneAlias") || body(req, "alias");
      const sourceInput = body(req, "source") || body(req, "sourceAlias") || body(req, "input") || body(req, "inputName");

      if (!sceneInput) return fail(res, route, "MISSING_SCENE", 'Es fehlt "scene".');
      if (!sourceInput) return fail(res, route, "MISSING_SOURCE", 'Es fehlt "source".');

      const sceneName = await resolveSceneName(sceneInput);
      if (!sceneName) {
        return fail(res, route, "SCENE_NOT_FOUND", `Scene '${sceneInput}' wurde nicht gefunden.`, { scene: sceneInput }, 404);
      }

      const sourceName = await resolveInputName(sourceInput) || normalize(sourceInput);
      const item = await shared.findSceneItem(sceneName, sourceName);
      if (!item) {
        return fail(res, route, "SCENE_ITEM_NOT_FOUND", `Source '${sourceInput}' wurde in Scene '${sceneName}' nicht gefunden.`, { scene: sceneName, source: sourceInput }, 404);
      }

      const before = !!item.sceneItemEnabled;
      const after = mode === "show" ? true : mode === "hide" ? false : !before;
      await shared.setSceneItemEnabled(sceneName, item.sceneItemId, after);

      ok(res, route, {
        sceneName,
        sourceName: item.sourceName,
        sceneItemId: item.sceneItemId,
        before,
        after,
        enabled: after
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SET_SCENE_ITEM_ENABLED_FAILED", err.message || "Scene-Item konnte nicht geÃ¤ndert werden.", null, status);
    }
  }

  app.post(obsRoutes("/obs/source/show"), (req, res) => handleSceneItemVisibility(req, res, "show"));
  app.post(obsRoutes("/obs/source/hide"), (req, res) => handleSceneItemVisibility(req, res, "hide"));
  app.post(obsRoutes("/obs/source/toggle"), (req, res) => handleSceneItemVisibility(req, res, "toggle"));

  app.post(obsRoutes("/obs/audio/mute"), async (req, res) => {
    const route = "/obs/audio/mute";
    try {
      const input = body(req, "inputName") || body(req, "source") || body(req, "alias");
      if (!input) return fail(res, route, "MISSING_INPUT", 'Es fehlt "inputName".');

      const inputName = await resolveInputName(input);
      if (!inputName) return fail(res, route, "INPUT_NOT_FOUND", `Input '${input}' wurde nicht gefunden.`, { inputName: input }, 404);

      await shared.setInputMute(inputName, true);
      ok(res, route, { inputName, muted: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SET_INPUT_MUTE_FAILED", err.message || "Input konnte nicht gemutet werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/audio/unmute"), async (req, res) => {
    const route = "/obs/audio/unmute";
    try {
      const input = body(req, "inputName") || body(req, "source") || body(req, "alias");
      if (!input) return fail(res, route, "MISSING_INPUT", 'Es fehlt "inputName".');

      const inputName = await resolveInputName(input);
      if (!inputName) return fail(res, route, "INPUT_NOT_FOUND", `Input '${input}' wurde nicht gefunden.`, { inputName: input }, 404);

      await shared.setInputMute(inputName, false);
      ok(res, route, { inputName, muted: false });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SET_INPUT_MUTE_FAILED", err.message || "Input konnte nicht entmutet werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/audio/toggle"), async (req, res) => {
    const route = "/obs/audio/toggle";
    try {
      const input = body(req, "inputName") || body(req, "source") || body(req, "alias");
      if (!input) return fail(res, route, "MISSING_INPUT", 'Es fehlt "inputName".');

      const inputName = await resolveInputName(input);
      if (!inputName) return fail(res, route, "INPUT_NOT_FOUND", `Input '${input}' wurde nicht gefunden.`, { inputName: input }, 404);

      const muted = await shared.toggleInputMute(inputName);
      ok(res, route, { inputName, muted });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "TOGGLE_INPUT_MUTE_FAILED", err.message || "Input-Mute konnte nicht umgeschaltet werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/audio/volume"), async (req, res) => {
    const route = "/obs/audio/volume";
    try {
      const input = body(req, "inputName") || body(req, "source") || body(req, "alias");
      const volumeDb = body(req, "volumeDb");
      const volumeMultiplier = body(req, "volumeMultiplier");

      if (!input) return fail(res, route, "MISSING_INPUT", 'Es fehlt "inputName".');
      const hasDb = typeof volumeDb !== "undefined";
      const hasMul = typeof volumeMultiplier !== "undefined";
      if ((hasDb && hasMul) || (!hasDb && !hasMul)) {
        return fail(res, route, "INVALID_VOLUME_PAYLOAD", 'Genau einer der Werte "volumeDb" oder "volumeMultiplier" muss gesetzt sein.');
      }

      const inputName = await resolveInputName(input);
      if (!inputName) return fail(res, route, "INPUT_NOT_FOUND", `Input '${input}' wurde nicht gefunden.`, { inputName: input }, 404);

      const volume = await shared.setInputVolume(
        inputName,
        hasDb ? { inputVolumeDb: Number(volumeDb) } : { inputVolumeMul: Number(volumeMultiplier) }
      );

      ok(res, route, {
        inputName,
        volumeDb: volume.inputVolumeDb,
        volumeMultiplier: volume.inputVolumeMul
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SET_INPUT_VOLUME_FAILED", err.message || "Input-LautstÃ¤rke konnte nicht gesetzt werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/media/action"), async (req, res) => {
    const route = "/obs/media/action";
    try {
      const input = body(req, "inputName") || body(req, "source") || body(req, "alias");
      const actionRaw = normalizeLookup(body(req, "action"));
      if (!input) return fail(res, route, "MISSING_INPUT", 'Es fehlt "inputName".');
      if (!actionRaw) return fail(res, route, "MISSING_ACTION", 'Es fehlt "action".');

      const actionMap = {
        play: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY",
        pause: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE",
        stop: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP",
        restart: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART",
        next: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT",
        previous: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS"
      };

      const mediaAction = actionMap[actionRaw];
      if (!mediaAction) return fail(res, route, "INVALID_ACTION", `UngÃ¼ltige action '${actionRaw}'.`);

      const inputName = await resolveInputName(input);
      if (!inputName) return fail(res, route, "INPUT_NOT_FOUND", `Input '${input}' wurde nicht gefunden.`, { inputName: input }, 404);

      await shared.triggerMediaInputAction(inputName, mediaAction);
      ok(res, route, { inputName, action: actionRaw, executed: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "MEDIA_ACTION_FAILED", err.message || "Media-Action konnte nicht ausgefÃ¼hrt werden.", null, status);
    }
  });

  app.get(obsRoutes("/obs/replay/status"), async (req, res) => {
    const route = "/obs/replay/status";
    try {
      const replayBufferActive = await shared.getReplayBufferStatus();
      ok(res, route, { replayBufferActive });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_REPLAY_STATUS_FAILED", err.message || "Replay-Status konnte nicht gelesen werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/replay/start"), async (req, res) => {
    const route = "/obs/replay/start";
    try {
      await shared.startReplayBuffer();
      ok(res, route, { replayBufferActive: true, started: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "START_REPLAY_FAILED", err.message || "Replay Buffer konnte nicht gestartet werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/replay/stop"), async (req, res) => {
    const route = "/obs/replay/stop";
    try {
      await shared.stopReplayBuffer();
      ok(res, route, { replayBufferActive: false, stopped: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "STOP_REPLAY_FAILED", err.message || "Replay Buffer konnte nicht gestoppt werden.", null, status);
    }
  });

  app.post(obsRoutes("/obs/replay/save"), async (req, res) => {
    const route = "/obs/replay/save";
    try {
      await shared.saveReplayBuffer();
      ok(res, route, { saved: true });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SAVE_REPLAY_FAILED", err.message || "Replay Buffer konnte nicht gespeichert werden.", null, status);
    }
  });

  app.get(obsRoutes("/obs/filter/list"), async (req, res) => {
    const route = "/obs/filter/list";
    try {
      const sourceInput = core.pickFirst(core.getParam(req, "sourceName"), core.getParam(req, "source"), core.getParam(req, "alias"));
      if (!sourceInput) return fail(res, route, "MISSING_SOURCE", 'Es fehlt Query-Parameter "sourceName".');

      const sourceName = await resolveInputName(sourceInput) || normalize(sourceInput);
      const filters = await shared.getSourceFilterList(sourceName);
      ok(res, route, {
        sourceName,
        filters: filters.map(x => ({
          filterName: x.filterName,
          filterKind: x.filterKind,
          filterEnabled: x.filterEnabled
        }))
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "GET_FILTERS_FAILED", err.message || "Filter konnten nicht gelesen werden.", null, status);
    }
  });

  async function handleFilter(req, res, mode) {
    const route = `/obs/filter/${mode}`;
    try {
      const sourceInput = body(req, "sourceName") || body(req, "source") || body(req, "alias");
      const filterName = body(req, "filterName");
      if (!sourceInput) return fail(res, route, "MISSING_SOURCE", 'Es fehlt "sourceName".');
      if (!filterName) return fail(res, route, "MISSING_FILTER", 'Es fehlt "filterName".');

      const sourceName = await resolveInputName(sourceInput) || normalize(sourceInput);
      const filters = await shared.getSourceFilterList(sourceName);
      const filter = filters.find(x => normalizeLookup(x.filterName) === normalizeLookup(filterName));
      if (!filter) {
        return fail(res, route, "FILTER_NOT_FOUND", `Filter '${filterName}' wurde auf '${sourceName}' nicht gefunden.`, { sourceName, filterName }, 404);
      }

      const before = !!filter.filterEnabled;
      const after = mode === "enable" ? true : mode === "disable" ? false : !before;
      await shared.setSourceFilterEnabled(sourceName, filter.filterName, after);
      ok(res, route, {
        sourceName,
        filterName: filter.filterName,
        before,
        after,
        enabled: after
      });
    } catch (err) {
      const status = err.code === "OBS_NOT_CONNECTED" ? 503 : 500;
      fail(res, route, err.code || "SET_FILTER_ENABLED_FAILED", err.message || "Filter konnte nicht geÃ¤ndert werden.", null, status);
    }
  }

  app.post(obsRoutes("/obs/filter/enable"), (req, res) => handleFilter(req, res, "enable"));
  app.post(obsRoutes("/obs/filter/disable"), (req, res) => handleFilter(req, res, "disable"));
  app.post(obsRoutes("/obs/filter/toggle"), (req, res) => handleFilter(req, res, "toggle"));

  console.log("[obs] Legacy- und neue OBS-Routen aktiv.");
};

