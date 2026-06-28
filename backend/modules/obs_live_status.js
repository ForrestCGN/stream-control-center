"use strict";

let routes = null;
try { routes = require("./helpers/helper_routes"); } catch (err) { routes = null; }

let obsSharedModule = null;
try { obsSharedModule = require("./obs_shared"); } catch (err) { obsSharedModule = null; }

const MODULE = "obs_live_status";
const MODULE_VERSION = "0.2.19";
const MODULE_BUILD = "RDAP_0.2.19_OBS_LIVE_STATUS_READONLY";
const STATUS_API_VERSION = "rdap_obs_live_status_0219.v1";
const ROUTE = "/api/remote-agent/obs/live/status";

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "obs",
  description: "Read-only near-realtime OBS live scene status via existing obs_shared instance. No OBS control, no writes, no new OBS websocket.",
  routesPrefix: [ROUTE],
  legacy: false
};

function init(ctx = {}) {
  const app = ctx && ctx.app;
  if (!app || typeof app.get !== "function") return;
  registerGet(app, ROUTE, (req, res) => {
    void req;
    res.json(buildLiveStatusPayload());
  });
  console.log(`[${MODULE}] ${MODULE_BUILD} route active: ${ROUTE}; readOnly=true actions=false`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === "function") return routes.registerGet(app, routePath, handler);
  app.get(routePath, handler);
}

function buildLiveStatusPayload() {
  const generatedAt = new Date().toISOString();
  const publicStatus = getObsPublicStatus();
  const currentScene = safeText(publicStatus.currentProgramSceneName || publicStatus.currentProgramScene || "", 160) || null;
  return {
    ok: true,
    module: MODULE,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    route: ROUTE,
    generatedAt,
    readOnly: true,
    prepared: true,
    active: Boolean(currentScene || publicStatus.obsConnected || publicStatus.obsDetected),
    status: currentScene ? "live_scene_available" : (publicStatus.obsConnected ? "connected_no_scene" : "not_connected_or_not_ready"),
    obs: {
      connected: publicStatus.obsConnected === true,
      connecting: publicStatus.obsConnecting === true,
      detected: publicStatus.obsDetected === true,
      currentScene,
      currentProgramSceneName: currentScene,
      checkedAt: generatedAt,
      source: "obs_shared_public_status",
      noNewObsWebSocketConnection: true,
      noObsControl: true
    },
    currentScene,
    currentProgramSceneName: currentScene,
    safety: {
      readOnly: true,
      actionsEnabled: false,
      controlEnabled: false,
      noObsControl: true,
      noAgentActionExecution: true,
      noFileWrite: true,
      noDatabaseWrite: true,
      noShellOrProcessActions: true,
      secretsExposed: false
    },
    note: "Near-realtime Status der aktuellen OBS-Szene aus der bestehenden obs_shared-Instanz. Kein Set*-Request, keine Steuerung."
  };
}

function getObsPublicStatus() {
  try {
    if (!obsSharedModule || typeof obsSharedModule.getSharedObs !== "function") return {};
    const shared = obsSharedModule.getSharedObs(process.env, console);
    if (!shared || typeof shared.getPublicStatus !== "function") return {};
    return shared.getPublicStatus() || {};
  } catch (err) {
    return {};
  }
}

function safeText(value, maxLen) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, maxLen || 120);
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, buildLiveStatusPayload };
