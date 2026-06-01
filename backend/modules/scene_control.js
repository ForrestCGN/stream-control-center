"use strict";

const fs = require("fs");
const { getSharedObs } = require("./obs_shared");
const core = require("./helpers/helper_core");

const MODULE_NAME = "scene_control";
const MODULE_VERSION = "1.2.1";
const MODULE_BUILD = "step278-meta";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "obs",
  description: "Scene control routes using the shared OBS connection.",
  routesPrefix: ["/api/scene"],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const shared = getSharedObs(env, console);

  const MODULE_NAME = "scene_control";
  const VERSION = "1.2.1";
  const PREFIX = "/api/scene";

  function ok(payload) {
    return { ok: true, ...payload };
  }

  function fail(message, errorCode) {
    return { ok: false, error: errorCode || "error", chatMessage: message };
  }

  function normalizeInput(value) {
    return shared.normalize(value);
  }

  function normalizeLookup(value) {
    return shared.normalizeLookup(value);
  }

  function bodyOrQuery(req, key) {
    return core.getParam(req, key, undefined);
  }

  function buildChatListMessage(sceneList) {
    if (!sceneList.length) return "Keine freigegebenen Szenen gefunden.";
    return "Verfügbare Szenen: " + sceneList
      .map(scene => `${scene.id}=${scene.display || scene.primaryAlias || scene.name}`)
      .join(" | ");
  }

  function checkFile(name, filePath, required = false) {
    const exists = Boolean(filePath) && fs.existsSync(filePath);
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

  function safeReadJson(filePath, fallback = {}) {
    try {
      if (!filePath || !fs.existsSync(filePath)) return { ok: false, data: fallback, error: "file_not_found" };
      const raw = fs.readFileSync(filePath, "utf8");
      return { ok: true, data: JSON.parse(raw), error: "" };
    } catch (err) {
      return { ok: false, data: fallback, error: err?.message || String(err) };
    }
  }

  function summarizeSceneConfig(data) {
    const configuredScenes = Array.isArray(data?.scenes) ? data.scenes : [];
    const aliases = configuredScenes.reduce((sum, scene) => {
      if (Array.isArray(scene?.aliases)) return sum + scene.aliases.length;
      return sum;
    }, 0);

    return {
      sceneCount: configuredScenes.length,
      aliasCount: aliases,
      hasScenesArray: Array.isArray(data?.scenes)
    };
  }

  function publicState() {
    const s = shared.getPublicStatus();
    return {
      ok: true,
      version: VERSION,
      module: MODULE_NAME,
      prefix: PREFIX,
      obsConnected: s.obsConnected,
      obsConnecting: s.obsConnecting,
      obsDetected: s.obsDetected,
      lastConnectAttemptAt: s.lastConnectAttemptAt,
      lastConnectedAt: s.lastConnectedAt,
      lastError: s.lastError,
      currentProgramSceneName: s.currentProgramSceneName,
      obsSceneCount: s.obsSceneNames.length,
      allowedSceneCount: null,
      sceneConfigPath: shared.sceneConfigPath,
      updatedAt: core.nowIso()
    };
  }

  async function getSceneMeta() {
    const data = await shared.getSceneListWithMeta();
    return {
      currentProgramSceneName: data.currentProgramSceneName,
      obsSceneNames: data.obsSceneNames,
      allowedScenes: data.allowedScenes
    };
  }

  async function buildStatusPayload() {
    const state = publicState();
    const meta = await getSceneMeta().catch(() => null);

    if (meta) {
      state.currentProgramSceneName = meta.currentProgramSceneName || state.currentProgramSceneName;
      state.obsSceneCount = Array.isArray(meta.obsSceneNames) ? meta.obsSceneNames.length : state.obsSceneCount;
      state.allowedSceneCount = Array.isArray(meta.allowedScenes) ? meta.allowedScenes.length : 0;
      state.allowedScenes = (meta.allowedScenes || []).map(scene => ({
        id: scene.id,
        name: scene.name,
        display: scene.display,
        alias: scene.primaryAlias,
        aliases: scene.aliases
      }));
    } else {
      state.allowedSceneCount = 0;
      state.allowedScenes = [];
    }

    return state;
  }

  function buildRoutes() {
    return [
      { method: "GET", path: "/api/scene/status", purpose: "standard scene-control status" },
      { method: "GET", path: "/api/scene/config", purpose: "sanitized scene alias config summary" },
      { method: "GET", path: "/api/scene/settings", purpose: "runtime settings and shared OBS summary" },
      { method: "GET", path: "/api/scene/routes", purpose: "list scene-control API routes" },
      { method: "GET", path: "/api/scene/integration-check", purpose: "run non-destructive scene-control integration check" },
      { method: "POST", path: "/api/scene/reload", purpose: "refresh scene metadata without switching scenes" },
      { method: "GET", path: "/api/scene/health", purpose: "legacy health/status endpoint" },
      { method: "GET", path: "/api/scene/list", purpose: "list allowed scenes for chat/dashboard" },
      { method: "GET", path: "/api/scene/set", purpose: "legacy scene switch endpoint" }
    ];
  }

  function buildCheck(name, okValue, level, extra = {}) {
    return {
      name,
      ok: Boolean(okValue),
      level: level || (okValue ? "ok" : "error"),
      ...extra
    };
  }

  async function buildIntegrationCheck() {
    const checks = [];
    const s = shared.getPublicStatus();
    const fileCheck = checkFile("scene_aliases_config", shared.sceneConfigPath, false);
    const configRead = safeReadJson(shared.sceneConfigPath, {});
    const configSummary = summarizeSceneConfig(configRead.data);

    checks.push(fileCheck);
    checks.push(buildCheck("scene_aliases_json", configRead.ok, configRead.ok ? "ok" : (fileCheck.exists ? "error" : "warning"), {
      sceneCount: configSummary.sceneCount,
      aliasCount: configSummary.aliasCount,
      error: configRead.error
    }));

    checks.push(buildCheck("shared_snapshot", true, "ok", {
      obsConnected: Boolean(s.obsConnected),
      obsDetected: Boolean(s.obsDetected),
      obsSceneCount: Array.isArray(s.obsSceneNames) ? s.obsSceneNames.length : 0
    }));

    checks.push(buildCheck("obs_detected", Boolean(s.obsDetected), s.obsDetected ? "ok" : "warning", {
      detected: Boolean(s.obsDetected),
      error: s.obsDetected ? "" : "obs_not_detected"
    }));

    checks.push(buildCheck("obs_connected", Boolean(s.obsConnected), s.obsConnected ? "ok" : "warning", {
      connected: Boolean(s.obsConnected),
      error: s.obsConnected ? "" : "obs_not_connected"
    }));

    let meta = null;
    let metaError = "";
    try {
      meta = await getSceneMeta();
    } catch (err) {
      metaError = err?.message || String(err);
    }

    checks.push(buildCheck("scene_metadata", Boolean(meta), meta ? "ok" : "warning", {
      error: metaError
    }));

    checks.push(buildCheck("obs_scenes", Boolean(meta && meta.obsSceneNames && meta.obsSceneNames.length), (meta && meta.obsSceneNames && meta.obsSceneNames.length) ? "ok" : "warning", {
      count: meta?.obsSceneNames?.length || 0,
      error: meta && meta.obsSceneNames && meta.obsSceneNames.length ? "" : "no_obs_scenes"
    }));

    checks.push(buildCheck("allowed_scenes", Boolean(meta && meta.allowedScenes && meta.allowedScenes.length), (meta && meta.allowedScenes && meta.allowedScenes.length) ? "ok" : "warning", {
      count: meta?.allowedScenes?.length || 0,
      error: meta && meta.allowedScenes && meta.allowedScenes.length ? "" : "no_allowed_scenes"
    }));

    checks.push(buildCheck("routes", true, "ok", {
      prefix: PREFIX,
      count: buildRoutes().length
    }));

    const errors = checks.filter(check => check.level === "error").length;
    const warnings = checks.filter(check => check.level === "warning").length;

    return {
      ok: errors === 0,
      module: MODULE_NAME,
      version: VERSION,
      prefix: PREFIX,
      checks,
      summary: {
        total: checks.length,
        ok: checks.filter(check => check.ok).length,
        warnings,
        errors
      },
      notes: [
        "This integration check is non-destructive.",
        "Productive prefix remains /api/scene.",
        "Scene switching still happens only through /api/scene/set."
      ],
      updatedAt: core.nowIso()
    };
  }

  app.get("/api/scene/status", async (req, res) => {
    try {
      res.json(await buildStatusPayload());
    } catch (err) {
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        error: err?.message || "scene_status_failed"
      });
    }
  });

  app.get("/api/scene/config", (req, res) => {
    const fileCheck = checkFile("scene_aliases_config", shared.sceneConfigPath, false);
    const configRead = safeReadJson(shared.sceneConfigPath, {});
    const configSummary = summarizeSceneConfig(configRead.data);

    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      prefix: PREFIX,
      configPath: shared.sceneConfigPath,
      files: {
        sceneAliases: fileCheck
      },
      jsonConfig: configSummary,
      jsonConfigLoaded: configRead.ok,
      jsonConfigError: configRead.error,
      updatedAt: core.nowIso()
    });
  });

  app.get("/api/scene/settings", async (req, res) => {
    const s = shared.getPublicStatus();
    const meta = await getSceneMeta().catch(() => null);

    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      prefix: PREFIX,
      settings: {
        sceneConfigPath: shared.sceneConfigPath,
        obsConnected: Boolean(s.obsConnected),
        obsDetected: Boolean(s.obsDetected),
        currentProgramSceneName: s.currentProgramSceneName || "",
        obsSceneCount: Array.isArray(s.obsSceneNames) ? s.obsSceneNames.length : 0,
        allowedSceneCount: meta?.allowedScenes?.length || 0,
        allowInternalScenes: false,
        selectionEndpoint: "/api/scene/set",
        listEndpoint: "/api/scene/list"
      },
      updatedAt: core.nowIso()
    });
  });

  app.get("/api/scene/routes", (req, res) => {
    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      prefix: PREFIX,
      intentionallyNotRegistered: [
        "/api/scene-control",
        "/api/scene_control",
        "/api/scenes"
      ],
      routes: buildRoutes(),
      count: buildRoutes().length,
      updatedAt: core.nowIso()
    });
  });

  app.get("/api/scene/integration-check", async (req, res) => {
    try {
      const result = await buildIntegrationCheck();
      res.status(result.ok ? 200 : 500).json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        module: MODULE_NAME,
        error: err?.message || "scene_integration_check_failed"
      });
    }
  });

  app.post("/api/scene/reload", async (req, res) => {
    const before = shared.getPublicStatus();
    let meta = null;
    let refreshWarning = "";

    try {
      meta = await getSceneMeta();
    } catch (err) {
      refreshWarning = err?.message || String(err);
    }

    const after = shared.getPublicStatus();

    res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      prefix: PREFIX,
      action: "reload",
      reloaded: true,
      destructive: false,
      sceneSwitchTriggered: false,
      obsActionTriggered: false,
      currentSceneBefore: before.currentProgramSceneName || "",
      currentSceneAfter: after.currentProgramSceneName || "",
      scenePreserved: (before.currentProgramSceneName || "") === (after.currentProgramSceneName || ""),
      metadataRefreshed: Boolean(meta),
      refreshWarning,
      obsSceneCount: meta?.obsSceneNames?.length || 0,
      allowedSceneCount: meta?.allowedScenes?.length || 0,
      updatedAt: core.nowIso()
    });
  });

  app.get("/api/scene/health", async (req, res) => {
    try {
      const meta = await getSceneMeta().catch(() => null);
      const state = publicState();
      state.allowedSceneCount = meta ? meta.allowedScenes.length : 0;
      res.json(state);
    } catch (err) {
      res.json(publicState());
    }
  });

  app.get("/api/scene/list", async (req, res) => {
    try {
      const data = await getSceneMeta();
      return res.json(ok({
        currentScene: data.currentProgramSceneName,
        scenes: data.allowedScenes.map(scene => ({
          id: scene.id,
          name: scene.name,
          display: scene.display,
          alias: scene.primaryAlias,
          aliases: scene.aliases
        })),
        chatMessage: buildChatListMessage(data.allowedScenes)
      }));
    } catch (err) {
      return res.status(500).json(fail(
        "Szenenliste konnte nicht geladen werden.",
        err.message || "scene_list_failed"
      ));
    }
  });

  app.get("/api/scene/set", async (req, res) => {
    try {
      const input = normalizeInput(
        bodyOrQuery(req, "input") ||
        bodyOrQuery(req, "name") ||
        bodyOrQuery(req, "scene")
      );

      if (!input) {
        return res.status(400).json(fail(
          "Keine Eingabe übergeben. Nutze !scene für die Liste.",
          "missing_input"
        ));
      }

      const data = await getSceneMeta();
      const selectedScene = shared.resolveSceneSelection(input, data.allowedScenes);

      if (!selectedScene) {
        return res.status(404).json(fail(
          "Szene nicht gefunden. Nutze !scene für die Liste.",
          "scene_not_found"
        ));
      }

      if (normalizeLookup(selectedScene.name) === normalizeLookup(data.currentProgramSceneName)) {
        return res.json(ok({
          changed: false,
          sceneId: selectedScene.id,
          sceneName: selectedScene.name,
          display: selectedScene.display,
          chatMessage: `Szene ist bereits aktiv: ${selectedScene.name}`
        }));
      }

      await shared.setProgramScene(selectedScene.name);

      return res.json(ok({
        changed: true,
        sceneId: selectedScene.id,
        sceneName: selectedScene.name,
        display: selectedScene.display,
        chatMessage: `Szene gewechselt zu: ${selectedScene.name}`
      }));
    } catch (err) {
      return res.status(500).json(fail(
        "Szene konnte nicht umgeschaltet werden.",
        err.message || "scene_set_failed"
      ));
    }
  });

  console.log(`[${MODULE_NAME}] aktiv (shared OBS)`);
  console.log(`[${MODULE_NAME}] Config: ${shared.sceneConfigPath}`);
};
