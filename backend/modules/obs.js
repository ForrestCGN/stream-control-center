"use strict";

const fs = require("fs");
const { getSharedObs } = require("./obs_shared");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");

const MODULE_NAME = "obs";
const MODULE_VERSION = "0.1.1";
const MODULE_BUILD = "diagnostics-standard";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "obs",
  description: "OBS API routes, dashboard status and source/scene control helpers.",
  routesPrefix: ["/api/obs", "/obs"],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

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

  function ok(res, route, data, statusCode = 200, extra = {}) {
    setCommonHeaders(res);
    res.status(statusCode).json({
      ok: true,
      module: "obs",
      route,
      timestamp: core.nowIso(),
      ...(extra && typeof extra === "object" ? extra : {}),
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


  function buildObsDataEndpoints() {
    return {
      status: "/api/obs/status",
      config: "/api/obs/config",
      settings: "/api/obs/settings",
      routes: "/api/obs/routes",
      integrationCheck: "/api/obs/integration-check",
      stats: "/api/obs/stats",
      scenes: "/api/obs/scenes",
      sources: "/api/obs/sources",
      browserSources: "/api/obs/browser-sources",
      sceneItems: "/api/obs/scene-items"
    };
  }

  function countArray(value) {
    return Array.isArray(value) ? value.length : 0;
  }

  function buildObsDiagnostics(publicStatus = {}) {
    const routeCount = buildObsRouteList().length;
    const sceneCount = countArray(publicStatus.obsSceneNames);
    const sourceAliasCount = Object.keys(sourceAliases || {}).length;
    const sceneAliasCount = Object.keys(sceneAliases || {}).length;
    const audioActiveCount = countArray(shared.state && shared.state.audioActive);
    const warnings = [];
    const errors = [];
    const lastError = String(publicStatus.lastError || "").trim();

    if (publicStatus.obsDetected !== true) {
      warnings.push({ key: "obs_not_detected", message: "OBS wurde aktuell nicht erkannt." });
    }
    if (publicStatus.obsConnected !== true) {
      warnings.push({ key: "obs_not_connected", message: lastError || "OBS-WebSocket ist aktuell nicht verbunden." });
    }
    if (lastError && publicStatus.obsConnected === true) {
      warnings.push({ key: "obs_last_error", message: lastError });
    }

    return {
      ok: errors.length === 0,
      health: errors.length > 0 ? "error" : (warnings.length > 0 ? "warn" : "ok"),
      module: MODULE_NAME,
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      schemaVersion: 0,
      schemaReady: true,
      counts: {
        routes: routeCount,
        scenes: sceneCount,
        sourceAliases: sourceAliasCount,
        sceneAliases: sceneAliasCount,
        audioActive: audioActiveCount,
        obsConnected: publicStatus.obsConnected === true ? 1 : 0,
        obsDetected: publicStatus.obsDetected === true ? 1 : 0,
        obsConnecting: publicStatus.obsConnecting === true ? 1 : 0,
        streamActive: publicStatus.streamActive === true ? 1 : 0,
        recordActive: publicStatus.recordActive === true ? 1 : 0,
        recordPaused: publicStatus.recordPaused === true ? 1 : 0,
        replayBufferActive: publicStatus.replayBufferActive === true ? 1 : 0
      },
      database: {
        enabled: false,
        adapter: "none",
        schemaVersion: 0,
        expectedSchemaVersion: 0,
        schemaReady: true,
        lastError: ""
      },
      state: {
        obsUrl: String(publicStatus.obsUrl || ""),
        obsConnected: publicStatus.obsConnected === true,
        obsConnecting: publicStatus.obsConnecting === true,
        obsDetected: publicStatus.obsDetected === true,
        currentProgramSceneName: String(publicStatus.currentProgramSceneName || ""),
        currentPreviewSceneName: String(publicStatus.currentPreviewSceneName || ""),
        studioModeEnabled: publicStatus.studioModeEnabled === true,
        streamActive: publicStatus.streamActive === true,
        recordActive: publicStatus.recordActive === true,
        recordPaused: publicStatus.recordPaused === true,
        replayBufferActive: publicStatus.replayBufferActive === true,
        lastCheck: String(publicStatus.lastCheck || ""),
        audioBusy: shared.state && shared.state.audioBusy === true,
        audioActive: Array.isArray(shared.state && shared.state.audioActive) ? shared.state.audioActive.slice(0, 20) : []
      },
      warnings,
      errors,
      lastError
    };
  }

  function buildObsStatusEnvelope(publicStatus = {}) {
    const routes = buildObsRouteList();
    return {
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      version: MODULE_VERSION,
      diagnosticVersion: MODULE_VERSION,
      enabled: true,
      obsConnected: publicStatus.obsConnected === true,
      obsDetected: publicStatus.obsDetected === true,
      routeCount: routes.length,
      routes,
      dataEndpoints: buildObsDataEndpoints(),
      diagnostics: buildObsDiagnostics(publicStatus)
    };
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
      const publicStatus = shared.getPublicStatus();
      ok(res, route, publicStatus, 200, buildObsStatusEnvelope(publicStatus));
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


  function getFileStatus(name, filePath, required = false) {
    const exists = Boolean(filePath && fs.existsSync(filePath));
    return {
      name,
      ok: required ? exists : true,
      level: exists ? "ok" : (required ? "error" : "warning"),
      path: filePath || "",
      exists,
      required,
      error: exists || !required ? "" : "file_not_found"
    };
  }

  function buildObsRouteList() {
    return [
      { method: "GET", path: "/api/obs/status", purpose: "OBS runtime status" },
      { method: "GET", path: "/api/obs/config", purpose: "sanitized dashboard config and files" },
      { method: "GET", path: "/api/obs/settings", purpose: "runtime settings and shared OBS summary" },
      { method: "GET", path: "/api/obs/routes", purpose: "list OBS API routes" },
      { method: "GET", path: "/api/obs/integration-check", purpose: "run non-destructive OBS integration check" },
      { method: "POST", path: "/api/obs/reload", purpose: "reload config/status cache without OBS actions" },
      { method: "GET/POST", path: "/api/obs/dashboard/config", purpose: "read/write OBS dashboard config" },
      { method: "GET", path: "/api/obs/stats", purpose: "OBS stats/status details" },
      { method: "GET", path: "/api/obs/scenes", purpose: "list scenes and aliases" },
      { method: "POST", path: "/api/obs/scene/switch", purpose: "switch program scene" },
      { method: "POST", path: "/api/obs/scene/preview", purpose: "set preview scene" },
      { method: "GET", path: "/api/obs/sources", purpose: "list inputs/sources" },
      { method: "GET", path: "/api/obs/browser-sources", purpose: "list browser sources" },
      { method: "GET", path: "/api/obs/scene-items", purpose: "list scene items" },
      { method: "POST", path: "/api/obs/source/show", purpose: "show source/scene item" },
      { method: "POST", path: "/api/obs/source/hide", purpose: "hide source/scene item" },
      { method: "POST", path: "/api/obs/source/toggle", purpose: "toggle source/scene item" },
      { method: "GET", path: "/api/obs/audio/busy", purpose: "legacy audio busy json state" },
      { method: "GET", path: "/api/obs/audio/state", purpose: "legacy audio busy text state" },
      { method: "POST", path: "/api/obs/audio/mute", purpose: "mute OBS input" },
      { method: "POST", path: "/api/obs/audio/unmute", purpose: "unmute OBS input" },
      { method: "POST", path: "/api/obs/audio/toggle", purpose: "toggle OBS input mute" },
      { method: "POST", path: "/api/obs/audio/volume", purpose: "set OBS input volume" },
      { method: "POST", path: "/api/obs/media/action", purpose: "trigger OBS media input action" },
      { method: "GET", path: "/api/obs/replay/status", purpose: "read replay buffer status" },
      { method: "POST", path: "/api/obs/replay/start", purpose: "start replay buffer" },
      { method: "POST", path: "/api/obs/replay/stop", purpose: "stop replay buffer" },
      { method: "POST", path: "/api/obs/replay/save", purpose: "save replay buffer" },
      { method: "GET", path: "/api/obs/filter/list", purpose: "list source filters" },
      { method: "POST", path: "/api/obs/filter/enable", purpose: "enable source filter" },
      { method: "POST", path: "/api/obs/filter/disable", purpose: "disable source filter" },
      { method: "POST", path: "/api/obs/filter/toggle", purpose: "toggle source filter" }
    ];
  }

  function buildObsConfigResponse() {
    const loaded = loadDashboardConfig();
    const configPath = configHelper.resolveConfigFile("obs_dashboard.json");
    return {
      prefix: "/api/obs",
      legacyPrefix: "/obs",
      dashboardConfigPath: configPath,
      files: {
        dashboardConfig: getFileStatus("obs_dashboard_config", configPath, false)
      },
      dashboardConfig: loaded.config,
      defaults: DEFAULT_DASHBOARD_CONFIG,
      aliases: {
        sourceAliasCount: Object.keys(sourceAliases || {}).length,
        sceneAliasCount: Object.keys(sceneAliases || {}).length
      },
      updatedAt: core.nowIso()
    };
  }

  async function buildObsSettingsResponse() {
    const loaded = loadDashboardConfig();
    const status = shared.getPublicStatus();
    return {
      prefix: "/api/obs",
      legacyPrefix: "/obs",
      dashboard: loaded.config,
      shared: {
        obsUrl: status.obsUrl || "",
        obsConnected: Boolean(status.obsConnected),
        obsConnecting: Boolean(status.obsConnecting),
        obsDetected: Boolean(status.obsDetected),
        currentProgramSceneName: status.currentProgramSceneName || "",
        currentPreviewSceneName: status.currentPreviewSceneName || "",
        studioModeEnabled: Boolean(status.studioModeEnabled),
        streamActive: Boolean(status.streamActive),
        recordActive: Boolean(status.recordActive),
        replayBufferActive: Boolean(status.replayBufferActive),
        obsSceneCount: Array.isArray(status.obsSceneNames) ? status.obsSceneNames.length : 0,
        lastError: status.lastError || ""
      },
      aliases: {
        sourceAliasCount: Object.keys(sourceAliases || {}).length,
        sceneAliasCount: Object.keys(sceneAliases || {}).length
      },
      updatedAt: core.nowIso()
    };
  }

  function buildObsCheck(name, okValue, level, extra = {}) {
    return {
      name,
      ok: Boolean(okValue),
      level: level || (okValue ? "ok" : "error"),
      ...extra
    };
  }

  async function buildObsIntegrationCheck() {
    const checks = [];
    const configResponse = buildObsConfigResponse();
    checks.push(configResponse.files.dashboardConfig);

    let status = shared.getPublicStatus();
    try {
      await shared.refreshSnapshot();
      status = shared.getPublicStatus();
      checks.push(buildObsCheck("shared_snapshot", true, "ok", { error: "" }));
    } catch (err) {
      status = shared.getPublicStatus();
      checks.push(buildObsCheck("shared_snapshot", false, status.obsDetected ? "warning" : "warning", { error: err?.message || String(err || "refresh_failed") }));
    }

    checks.push(buildObsCheck("obs_detected", Boolean(status.obsDetected), status.obsDetected ? "ok" : "warning", {
      detected: Boolean(status.obsDetected),
      error: status.obsDetected ? "" : "obs_not_detected"
    }));
    checks.push(buildObsCheck("obs_connected", Boolean(status.obsConnected), status.obsConnected ? "ok" : "warning", {
      connected: Boolean(status.obsConnected),
      error: status.obsConnected ? "" : (status.lastError || "obs_not_connected")
    }));

    let sceneCount = Array.isArray(status.obsSceneNames) ? status.obsSceneNames.length : 0;
    try {
      const scenes = await shared.refreshScenes();
      sceneCount = Array.isArray(scenes) ? scenes.length : sceneCount;
      checks.push(buildObsCheck("obs_scenes", sceneCount > 0, sceneCount > 0 ? "ok" : "warning", { count: sceneCount, error: sceneCount > 0 ? "" : "no_scenes_loaded" }));
    } catch (err) {
      checks.push(buildObsCheck("obs_scenes", false, "warning", { count: sceneCount, error: err?.message || String(err || "scenes_unavailable") }));
    }

    checks.push(buildObsCheck("dashboard_config", true, "ok", {
      autoRefreshEnabled: Boolean(configResponse.dashboardConfig.autoRefreshEnabled),
      fastRefreshMs: configResponse.dashboardConfig.fastRefreshMs,
      fullRefreshMs: configResponse.dashboardConfig.fullRefreshMs
    }));
    checks.push(buildObsCheck("routes", true, "ok", { prefix: "/api/obs", count: buildObsRouteList().length }));

    const errors = checks.filter(x => x.level === "error" || (x.required && !x.ok)).length;
    const warnings = checks.filter(x => x.level === "warning").length;
    const okCount = checks.filter(x => x.ok).length;

    return {
      prefix: "/api/obs",
      legacyPrefix: "/obs",
      checks,
      summary: {
        total: checks.length,
        ok: okCount,
        warnings,
        errors
      },
      notes: [
        "This integration check is non-destructive.",
        "OBS connection warnings are expected when OBS is closed or WebSocket is unavailable.",
        "Productive prefix remains /api/obs; legacy /obs routes remain available."
      ],
      updatedAt: core.nowIso()
    };
  }

  app.get("/api/obs/config", (req, res) => {
    const route = "/api/obs/config";
    try {
      ok(res, route, buildObsConfigResponse());
    } catch (err) {
      fail(res, route, "OBS_CONFIG_FAILED", err.message || "OBS-Konfiguration konnte nicht gelesen werden.", null, 500);
    }
  });

  app.get("/api/obs/settings", async (req, res) => {
    const route = "/api/obs/settings";
    try {
      ok(res, route, await buildObsSettingsResponse());
    } catch (err) {
      fail(res, route, "OBS_SETTINGS_FAILED", err.message || "OBS-Settings konnten nicht gelesen werden.", null, 500);
    }
  });

  app.get("/api/obs/routes", (req, res) => {
    const route = "/api/obs/routes";
    try {
      ok(res, route, {
        prefix: "/api/obs",
        legacyPrefix: "/obs",
        routes: buildObsRouteList(),
        count: buildObsRouteList().length,
        updatedAt: core.nowIso()
      });
    } catch (err) {
      fail(res, route, "OBS_ROUTES_FAILED", err.message || "OBS-Routen konnten nicht gelesen werden.", null, 500);
    }
  });

  app.get("/api/obs/integration-check", async (req, res) => {
    const route = "/api/obs/integration-check";
    try {
      ok(res, route, await buildObsIntegrationCheck());
    } catch (err) {
      fail(res, route, "OBS_INTEGRATION_CHECK_FAILED", err.message || "OBS-Integration-Check konnte nicht ausgefuehrt werden.", null, 500);
    }
  });

  app.post("/api/obs/reload", async (req, res) => {
    const route = "/api/obs/reload";
    try {
      const dashboard = loadDashboardConfig();
      let refreshed = false;
      let refreshError = "";
      try {
        await shared.refreshSnapshot();
        refreshed = true;
      } catch (err) {
        refreshError = err?.message || String(err || "refresh_failed");
      }

      ok(res, route, {
        action: "reload",
        reloaded: true,
        destructive: false,
        obsActionTriggered: false,
        replayActionTriggered: false,
        sceneSwitchTriggered: false,
        configReloaded: true,
        dashboardConfig: dashboard.config,
        snapshotRefreshed: refreshed,
        refreshWarning: refreshError,
        status: shared.getPublicStatus(),
        updatedAt: core.nowIso()
      });
    } catch (err) {
      fail(res, route, "OBS_RELOAD_FAILED", err.message || "OBS-Reload konnte nicht ausgefuehrt werden.", null, 500);
    }
  });

  console.log("[obs] Legacy- und neue OBS-Routen aktiv.");
};

