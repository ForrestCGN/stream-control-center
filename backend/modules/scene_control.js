"use strict";

const { getSharedObs } = require("./obs_shared");
const core = require("./helpers/helper_core");

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const shared = getSharedObs(env, console);

  const MODULE_NAME = "scene_control";
  const VERSION = "1.2.0";

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

  function publicState() {
    const s = shared.getPublicStatus();
    return {
      ok: true,
      version: VERSION,
      module: MODULE_NAME,
      obsConnected: s.obsConnected,
      obsConnecting: s.obsConnecting,
      lastConnectAttemptAt: s.lastConnectAttemptAt,
      lastConnectedAt: s.lastConnectedAt,
      lastError: s.lastError,
      currentProgramSceneName: s.currentProgramSceneName,
      obsSceneCount: s.obsSceneNames.length,
      allowedSceneCount: null,
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
