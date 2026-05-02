"use strict";

const { default: OBSWebSocket, EventSubscription } = require("obs-websocket-js");
const { execFile } = require("child_process");
const net = require("net");
const path = require("path");
const fs = require("fs");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");

let sharedInstance = null;

function createSharedObs(env = {}, logger = console) {
  const OBS_URL =
    env.OBS_WS_URL ||
    env.OBS_AUDIO_WS_URL ||
    "ws://127.0.0.1:4455";

  const OBS_PASSWORD =
    env.OBS_WS_PASSWORD ||
    env.OBS_AUDIO_WS_PASSWORD ||
    "";

  const AUDIO_INPUTS = String(env.OBS_AUDIO_INPUTS || "SoundAlerts,_Alert,Streamstickers,_start")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const AUDIO_THRESH_DB = Number(env.OBS_AUDIO_THRESH_DB || -50);
  const IDLE_CHECK_MS = core.intParam(env.OBS_AUDIO_IDLE_CHECK_MS, 60000);
  const CONNECT_TIMEOUT_MS = core.intParam(env.OBS_AUDIO_CONNECT_TIMEOUT_MS, 4000);
  const LEGACY_SCENE_DATA_DIR = path.join(configHelper.getWebrootDir(), "scripts", "data");
  const SCENE_DATA_DIR =
    env.SCENE_CONTROL_DATA_DIR ||
    configHelper.resolveFromRoot("config");

  const DEFAULT_SCENE_CONFIG_PATH = path.join(SCENE_DATA_DIR, "scene_aliases.json");
  const LEGACY_SCENE_CONFIG_PATH = path.join(LEGACY_SCENE_DATA_DIR, "scene_aliases.json");

  const SCENE_CONFIG_PATH =
    env.SCENE_CONTROL_CONFIG_PATH ||
    (fs.existsSync(DEFAULT_SCENE_CONFIG_PATH) ? DEFAULT_SCENE_CONFIG_PATH : LEGACY_SCENE_CONFIG_PATH);
  const SCENE_RECONNECT_MS = core.intParam(env.SCENE_CONTROL_RECONNECT_MS, 5000);

  const urlLike = new URL(OBS_URL.replace(/^ws(s)?:\/\//, "http$1://"));
  const OBS_HOST = urlLike.hostname || "127.0.0.1";
  const OBS_PORT = core.intParam(urlLike.port, 4455);

  const obs = new OBSWebSocket();

  const state = {
    version: "1.0.0",
    obsUrl: OBS_URL,
    obsConnected: false,
    obsConnecting: false,
    obsDetected: false,
    lastConnectAttemptAt: 0,
    lastConnectedAt: 0,
    lastError: "",
    lastCheck: 0,
    currentProgramSceneName: "",
    currentPreviewSceneName: "",
    studioModeEnabled: false,
    streamActive: false,
    recordActive: false,
    recordPaused: false,
    replayBufferActive: false,
    stats: null,
    audioBusy: false,
    audioActive: [],
    audioTs: 0,
    obsSceneNames: [],
    sceneCacheUpdatedAt: 0
  };

  let idleTimer = null;
  let reconnectTimer = null;
  let connectPromise = null;
  let sceneRefreshPromise = null;

  function normalize(value) {
    return String(value || "").trim();
  }

  function normalizeLookup(value) {
    return normalize(value).toLowerCase();
  }

  function isFiniteNum(v) {
    return typeof v === "number" && Number.isFinite(v);
  }

  function maxFinite(arr) {
    return Array.isArray(arr) ? Math.max(...arr.filter(Number.isFinite)) : -Infinity;
  }

  function collapseMul(levelsMul) {
    if (!Array.isArray(levelsMul)) return [0, 0];
    if (Array.isArray(levelsMul[0])) {
      const left = maxFinite(levelsMul[0]);
      const right = maxFinite(levelsMul[1] || []);
      return [isFiniteNum(left) ? left : 0, isFiniteNum(right) ? right : 0];
    }
    return [
      isFiniteNum(levelsMul[0]) ? levelsMul[0] : 0,
      isFiniteNum(levelsMul[1]) ? levelsMul[1] : 0
    ];
  }

  function mulToDb(m) {
    if (!isFiniteNum(m) || m <= 0) return -Infinity;
    return 20 * Math.log10(m);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function scheduleIdleCheck(ms = IDLE_CHECK_MS) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(async () => {
      state.lastCheck = Date.now();
      state.obsDetected = await isObsAvailable().catch(() => false);
      if (!state.obsConnected && !state.obsConnecting && state.obsDetected) {
        connect().catch(() => {});
      } else {
        scheduleIdleCheck();
      }
    }, ms);
  }

  function scheduleReconnect(ms = SCENE_RECONNECT_MS) {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect().catch(() => {
        scheduleReconnect();
      });
    }, ms);
  }

  async function detectObsProcess() {
    return new Promise(resolve => {
      execFile(
        "tasklist",
        ["/FI", "IMAGENAME eq obs64.exe"],
        { windowsHide: true },
        (err, stdout) => {
          if (err) return resolve(false);
          resolve(/obs64\.exe/i.test(stdout || ""));
        }
      );
    });
  }

  async function detectObsPort() {
    return new Promise(resolve => {
      const sock = new net.Socket();
      let done = false;
      const finish = ok => {
        if (done) return;
        done = true;
        try { sock.destroy(); } catch (_) {}
        resolve(ok);
      };
      sock.setTimeout(CONNECT_TIMEOUT_MS);
      sock.once("error", () => finish(false));
      sock.once("timeout", () => finish(false));
      sock.connect(OBS_PORT, OBS_HOST, () => finish(true));
    });
  }

  async function isObsAvailable() {
    const byProc = await detectObsProcess().catch(() => false);
    if (byProc) return true;
    return detectObsPort().catch(() => false);
  }

  async function connect() {
    if (state.obsConnected) return true;
    if (connectPromise) return connectPromise;

    connectPromise = (async () => {
      state.obsConnecting = true;
      state.lastConnectAttemptAt = Date.now();
      state.lastError = "";

      try {
        await obs.connect(OBS_URL, OBS_PASSWORD || undefined, {
          rpcVersion: 1,
          eventSubscriptions:
            (EventSubscription.General || 0) |
            (EventSubscription.Config || 0) |
            (EventSubscription.Scenes || 0) |
            (EventSubscription.Inputs || 0) |
            (EventSubscription.Transitions || 0) |
            (EventSubscription.Filters || 0) |
            (EventSubscription.Outputs || 0) |
            (EventSubscription.Ui || 0) |
            (EventSubscription.InputVolumeMeters || 0)
        });

        state.obsConnected = true;
        state.obsConnecting = false;
        state.lastConnectedAt = Date.now();
        state.lastError = "";

        logger.log("[obs_shared] OBS verbunden:", OBS_URL);
        await refreshSnapshot().catch(() => {});
        await refreshScenes().catch(() => {});
        return true;
      } catch (err) {
        state.obsConnected = false;
        state.obsConnecting = false;
        state.lastError = err && err.message ? err.message : String(err);
        logger.warn("[obs_shared] OBS connect fehlgeschlagen:", state.lastError);
        scheduleIdleCheck();
        throw err;
      } finally {
        connectPromise = null;
      }
    })();

    return connectPromise;
  }

  async function ensureConnected() {
    if (state.obsConnected) return true;
    state.obsDetected = await isObsAvailable().catch(() => false);
    if (!state.obsDetected) return false;
    await connect();
    return state.obsConnected;
  }

  async function call(requestType, requestData = {}) {
    const ok = await ensureConnected();
    if (!ok) {
      const err = new Error("OBS nicht verbunden");
      err.code = "OBS_NOT_CONNECTED";
      throw err;
    }
    return obs.call(requestType, requestData);
  }

  async function refreshSnapshot() {
    const [program, preview, studio, stream, record, replay, stats] = await Promise.all([
      call("GetCurrentProgramScene").catch(() => ({ currentProgramSceneName: "" })),
      call("GetCurrentPreviewScene").catch(() => ({ currentPreviewSceneName: "" })),
      call("GetStudioModeEnabled").catch(() => ({ studioModeEnabled: false })),
      call("GetStreamStatus").catch(() => ({ outputActive: false })),
      call("GetRecordStatus").catch(() => ({ outputActive: false, outputPaused: false })),
      call("GetReplayBufferStatus").catch(() => ({ outputActive: false })),
      call("GetStats").catch(() => null)
    ]);

    state.currentProgramSceneName = normalize(program.currentProgramSceneName);
    state.currentPreviewSceneName = normalize(preview.currentPreviewSceneName);
    state.studioModeEnabled = !!studio.studioModeEnabled;
    state.streamActive = !!stream.outputActive;
    state.recordActive = !!record.outputActive;
    state.recordPaused = !!record.outputPaused;
    state.replayBufferActive = !!replay.outputActive;
    state.stats = stats || null;
    return getPublicStatus();
  }

  async function refreshScenes() {
    if (sceneRefreshPromise) return sceneRefreshPromise;
    sceneRefreshPromise = (async () => {
      const result = await call("GetSceneList");
      state.obsSceneNames = Array.isArray(result.scenes)
        ? result.scenes.map(s => normalize(s.sceneName)).filter(Boolean)
        : [];
      state.currentProgramSceneName = normalize(result.currentProgramSceneName || state.currentProgramSceneName);
      state.sceneCacheUpdatedAt = Date.now();
      return [...state.obsSceneNames];
    })();

    try {
      return await sceneRefreshPromise;
    } finally {
      sceneRefreshPromise = null;
    }
  }

  function getPublicStatus() {
    return {
      version: state.version,
      obsUrl: state.obsUrl,
      obsConnected: state.obsConnected,
      obsConnecting: state.obsConnecting,
      obsDetected: state.obsDetected,
      lastConnectAttemptAt: state.lastConnectAttemptAt,
      lastConnectedAt: state.lastConnectedAt,
      lastError: state.lastError,
      lastCheck: state.lastCheck,
      currentProgramSceneName: state.currentProgramSceneName,
      currentPreviewSceneName: state.currentPreviewSceneName,
      studioModeEnabled: state.studioModeEnabled,
      streamActive: state.streamActive,
      recordActive: state.recordActive,
      recordPaused: state.recordPaused,
      replayBufferActive: state.replayBufferActive,
      stats: state.stats,
      audioBusy: state.audioBusy,
      audioActive: [...state.audioActive],
      audioTs: state.audioTs,
      obsSceneNames: [...state.obsSceneNames],
      sceneCacheUpdatedAt: state.sceneCacheUpdatedAt
    };
  }

  function getLegacyAudioState() {
    return {
      busy: state.audioBusy,
      active: [...state.audioActive],
      ts: state.audioTs,
      obsConnected: state.obsConnected,
      obsDetected: state.obsDetected,
      lastCheck: state.lastCheck
    };
  }

  function getSceneAliasesConfig() {
    try {
      const parsed = core.readJson(SCENE_CONFIG_PATH, {});
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (err) {
      logger.error("[obs_shared] scene_aliases.json Fehler:", err.message);
      return {};
    }
  }

  function buildConfiguredScenes(configObj) {
    const out = [];

    for (const [sceneNameRaw, entry] of Object.entries(configObj || {})) {
      const sceneName = normalize(sceneNameRaw);
      if (!sceneName || sceneName.startsWith("_")) continue;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;

      const id = Number(entry.id);
      if (!Number.isInteger(id) || id <= 0) continue;

      const aliases = Array.isArray(entry.aliases)
        ? entry.aliases.map(a => normalize(a)).filter(Boolean)
        : [];

      out.push({
        id,
        name: sceneName,
        aliases,
        display: normalize(entry.display) || aliases[0] || sceneName,
        primaryAlias: aliases[0] || null
      });
    }

    out.sort((a, b) => a.id - b.id);
    return out;
  }

  function buildAllowedScenes(configuredScenes, obsSceneNames) {
    const visible = new Set((obsSceneNames || []).map(normalize).filter(Boolean).filter(x => !x.startsWith("_")));
    return configuredScenes.filter(scene => visible.has(scene.name));
  }

  async function getAllowedScenes() {
    const obsSceneNames = await refreshScenes();
    const config = getSceneAliasesConfig();
    const configured = buildConfiguredScenes(config);
    return buildAllowedScenes(configured, obsSceneNames);
  }

  async function getSceneListWithMeta() {
    const allowedScenes = await getAllowedScenes();
    return {
      currentProgramSceneName: state.currentProgramSceneName,
      obsSceneNames: [...state.obsSceneNames],
      allowedScenes: clone(allowedScenes)
    };
  }

  function resolveSceneSelection(input, sceneList) {
    const clean = normalize(input);
    const lookup = normalizeLookup(input);
    if (!clean) return null;

    if (/^\d+$/.test(clean)) {
      const id = Number(clean);
      return sceneList.find(scene => scene.id === id) || null;
    }

    const byAlias = sceneList.find(scene => scene.aliases.some(alias => normalizeLookup(alias) === lookup));
    if (byAlias) return byAlias;

    return sceneList.find(scene => normalizeLookup(scene.name) === lookup) || null;
  }

  async function setProgramScene(sceneName) {
    await call("SetCurrentProgramScene", { sceneName });
    state.currentProgramSceneName = normalize(sceneName);
    return state.currentProgramSceneName;
  }

  async function setPreviewScene(sceneName) {
    await call("SetCurrentPreviewScene", { sceneName });
    state.currentPreviewSceneName = normalize(sceneName);
    return state.currentPreviewSceneName;
  }

  async function triggerStudioTransition() {
    await call("TriggerStudioModeTransition");
    return true;
  }

  async function getInputList() {
    const result = await call("GetInputList");
    return Array.isArray(result.inputs) ? result.inputs : [];
  }

  async function getInputSettings(inputName) {
  const result = await call("GetInputSettings", { inputName });
  return result || {};
}
async function findInputByNameOrAlias(inputName, aliasMap = {}) {
    const wanted = normalizeLookup(aliasMap[inputName] || inputName);
    const inputs = await getInputList();
    return inputs.find(x => normalizeLookup(x.inputName) === wanted) || null;
  }

  async function getSceneItemList(sceneName) {
    const result = await call("GetSceneItemList", { sceneName });
    return Array.isArray(result.sceneItems) ? result.sceneItems : [];
  }

  async function findSceneItem(sceneName, sourceName) {
    const items = await getSceneItemList(sceneName);
    return items.find(x => normalizeLookup(x.sourceName) === normalizeLookup(sourceName)) || null;
  }

  async function setSceneItemEnabled(sceneName, sceneItemId, enabled) {
    await call("SetSceneItemEnabled", {
      sceneName,
      sceneItemId,
      sceneItemEnabled: !!enabled
    });
    return !!enabled;
  }

  async function getInputMute(inputName) {
    const result = await call("GetInputMute", { inputName });
    return !!result.inputMuted;
  }

  async function setInputMute(inputName, muted) {
    await call("SetInputMute", { inputName, inputMuted: !!muted });
    return !!muted;
  }

  async function toggleInputMute(inputName) {
    await call("ToggleInputMute", { inputName });
    return getInputMute(inputName);
  }

  async function getInputVolume(inputName) {
    const result = await call("GetInputVolume", { inputName });
    return {
      inputVolumeDb: result.inputVolumeDb,
      inputVolumeMul: result.inputVolumeMul
    };
  }

  async function setInputVolume(inputName, payload) {
    await call("SetInputVolume", { inputName, ...payload });
    return getInputVolume(inputName);
  }

  async function triggerMediaInputAction(inputName, mediaAction) {
    await call("TriggerMediaInputAction", { inputName, mediaAction });
    return true;
  }

  async function getReplayBufferStatus() {
    const result = await call("GetReplayBufferStatus");
    state.replayBufferActive = !!result.outputActive;
    return state.replayBufferActive;
  }

  async function startReplayBuffer() {
    await call("StartReplayBuffer");
    state.replayBufferActive = true;
    return true;
  }

  async function stopReplayBuffer() {
    await call("StopReplayBuffer");
    state.replayBufferActive = false;
    return true;
  }

  async function saveReplayBuffer() {
    await call("SaveReplayBuffer");
    return true;
  }

  async function getSourceFilterList(sourceName) {
    const result = await call("GetSourceFilterList", { sourceName });
    return Array.isArray(result.filters) ? result.filters : [];
  }

  async function setSourceFilterEnabled(sourceName, filterName, enabled) {
    await call("SetSourceFilterEnabled", { sourceName, filterName, filterEnabled: !!enabled });
    return !!enabled;
  }

  obs.on("ConnectionClosed", () => {
    state.obsConnected = false;
    state.obsConnecting = false;
    state.lastError = "OBS-Verbindung geschlossen";
    logger.warn("[obs_shared] OBS-Verbindung geschlossen");
    scheduleReconnect();
  });

  obs.on("CurrentProgramSceneChanged", data => {
    state.currentProgramSceneName = normalize(data && (data.sceneName || data.currentProgramSceneName));
  });

  obs.on("CurrentPreviewSceneChanged", data => {
    state.currentPreviewSceneName = normalize(data && (data.sceneName || data.currentPreviewSceneName));
  });

  obs.on("StudioModeStateChanged", data => {
    state.studioModeEnabled = !!(data && data.studioModeEnabled);
  });

  obs.on("StreamStateChanged", data => {
    state.streamActive = !!(data && data.outputActive);
  });

  obs.on("RecordStateChanged", data => {
    state.recordActive = !!(data && data.outputActive);
    state.recordPaused = !!(data && data.outputPaused);
  });

  obs.on("ReplayBufferStateChanged", data => {
    state.replayBufferActive = !!(data && data.outputActive);
  });

  obs.on("SceneCreated", () => { refreshScenes().catch(() => {}); });
  obs.on("SceneRemoved", () => { refreshScenes().catch(() => {}); });
  obs.on("SceneNameChanged", () => { refreshScenes().catch(() => {}); });

  obs.on("InputVolumeMeters", evt => {
    const subset = (evt.inputs || []).filter(i => AUDIO_INPUTS.includes(i.inputName));
    const active = [];

    for (const input of subset) {
      const [mL, mR] = collapseMul(input.inputLevelsMul);
      const dL = Array.isArray(input.inputLevelsDb) && isFiniteNum(input.inputLevelsDb[0])
        ? input.inputLevelsDb[0]
        : mulToDb(mL);
      const dR = Array.isArray(input.inputLevelsDb) && isFiniteNum(input.inputLevelsDb[1])
        ? input.inputLevelsDb[1]
        : mulToDb(mR);

      if (dL > AUDIO_THRESH_DB || dR > AUDIO_THRESH_DB) {
        active.push(input.inputName);
      }
    }

    state.audioBusy = active.length > 0;
    state.audioActive = active;
    state.audioTs = Date.now();
  });

  setTimeout(() => scheduleIdleCheck(2000), 0);

  return {
    connect,
    ensureConnected,
    call,
    refreshSnapshot,
    refreshScenes,
    getPublicStatus,
    getLegacyAudioState,
    getSceneAliasesConfig,
    getAllowedScenes,
    getSceneListWithMeta,
    resolveSceneSelection,
    setProgramScene,
    setPreviewScene,
    triggerStudioTransition,
    getInputList,
    getInputSettings,
    findInputByNameOrAlias,
    getSceneItemList,
    findSceneItem,
    setSceneItemEnabled,
    getInputMute,
    setInputMute,
    toggleInputMute,
    getInputVolume,
    setInputVolume,
    triggerMediaInputAction,
    getReplayBufferStatus,
    startReplayBuffer,
    stopReplayBuffer,
    saveReplayBuffer,
    getSourceFilterList,
    setSourceFilterEnabled,
    normalize,
    normalizeLookup,
    state,
    sceneConfigPath: SCENE_CONFIG_PATH
  };
}

function getSharedObs(env = {}, logger = console) {
  if (!sharedInstance) {
    sharedInstance = createSharedObs(env, logger);
  }
  return sharedInstance;
}

module.exports = {
  getSharedObs
};


