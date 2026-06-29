"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");

const MODULE_NAME = "local_remote_modboard_adapter";
const MODULE_VERSION = "0.2.27";
const MODULE_BUILD = "RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY";
const API_PREFIX = "/api/remote";
const INVENTORY_SOURCE_MODE = "local_adapter_remote_agent_component_status";

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze([".mp3", ".wav", ".ogg", ".webm", ".m4a", ".mp4", ".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MEDIA_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a"]);
const MEDIA_VIDEO_EXTENSIONS = new Set([".webm", ".mp4"]);
const MEDIA_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MEDIA_SCAN_DEFAULT_LIMIT = 500;
const MEDIA_SCAN_HARD_LIMIT = 2000;
const MEDIA_SCAN_MAX_DEPTH = 5;
const MEDIA_ROOTS = Object.freeze([
  { key: "sounds", label: "Sounds", localPathHint: "htdocs/assets/sounds", publicBasePath: "/assets/sounds", types: ["audio", "video"] },
  { key: "videos", label: "Videos", localPathHint: "htdocs/assets/videos", publicBasePath: "/assets/videos", types: ["video"] },
  { key: "images", label: "Bilder", localPathHint: "htdocs/assets/images", publicBasePath: "/assets/images", types: ["image"] }
]);

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "local-dashboard-adapter",
  category: "dashboard-v2",
  description: "Local compatibility adapter so /dashboard-v2 can run the real Remote-Modboard frontend shell on port 8080. Provides local runtime-profile, agent-executor and OBS read-only diagnostics/inventory-source preparation and blocks productive writes/actions and exposes local Media inventory read-only; online Media is handled by Agent-WSS slow-sync.",
  routesPrefix: [
    API_PREFIX,
    "/assets/remote-modboard.css",
    "/assets/remote-modboard.js",
    "/assets/modules",
    "/assets/languages",
    "/assets/runtime-profile.js",
    "/dashboard-v2/assets"
  ],
  legacy: false
};

function nowIso() {
  return new Date().toISOString();
}

function getProjectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function getRemotePublicDir() {
  return path.join(getProjectRoot(), "remote-modboard", "backend", "public");
}

function getRemoteAssetsDir() {
  return path.join(getRemotePublicDir(), "assets");
}

function getDashboardV2AssetsDir() {
  return path.join(getProjectRoot(), "htdocs", "dashboard-v2", "assets");
}

function getRemoteAssetsUpstream() {
  return String(process.env.LOCAL_REMOTE_MODBOARD_ASSETS_UPSTREAM || "https://mods.forrestcgn.de/assets").replace(/\/+$/, "");
}

function safeAssetPath(value) {
  const raw = String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!raw || raw.includes("..") || raw.includes("\0")) return "";
  if (!/^(remote-modboard\.css|remote-modboard\.js|runtime-profile\.js|languages\/|modules\/)/.test(raw)) return "";
  return raw;
}

function redirectRemoteAsset(req, res, assetPath) {
  const safePath = safeAssetPath(assetPath);
  if (!safePath) return res.status(404).json({ ok: false, error: "asset_not_allowed" });
  res.redirect(302, `${getRemoteAssetsUpstream()}/${safePath}`);
}

function getLoadedModules(ctx = {}) {
  return typeof ctx.getLoadedModules === "function" ? ctx.getLoadedModules() : [];
}

function getLocalHttpPort() {
  const parsed = Number.parseInt(process.env.PORT || "", 10);
  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 65535) return parsed;
  return 8080;
}

function fetchLocalJson(pathname, timeoutMs = 900) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const options = {
      hostname: "127.0.0.1",
      port: getLocalHttpPort(),
      path: pathname,
      method: "GET",
      timeout: timeoutMs,
      headers: {
        Accept: "application/json",
        "X-SCC-Local-Dashboard-Adapter": MODULE_VERSION
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
        if (body.length > 250000) req.destroy(new Error("local_json_response_too_large"));
      });
      res.on("end", () => {
        const durationMs = Date.now() - startedAt;
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, durationMs, json });
        } catch (err) {
          resolve({ ok: false, statusCode: res.statusCode, durationMs, error: "local_json_parse_failed" });
        }
      });
    });

    req.on("timeout", () => req.destroy(new Error("local_agent_status_timeout")));
    req.on("error", (err) => resolve({
      ok: false,
      statusCode: 0,
      durationMs: Date.now() - startedAt,
      error: err && err.message ? String(err.message).slice(0, 160) : "local_agent_status_error"
    }));
    req.end();
  });
}

function summarizeRemoteAgentStatus(result) {
  const json = result && result.json && typeof result.json === "object" ? result.json : null;
  const connection = json && (json.connection || json.streamingPcConnection || json.status || {});
  const streamingPcConnection = json && json.streamingPcConnection && typeof json.streamingPcConnection === "object" ? json.streamingPcConnection : {};
  const componentStatus = streamingPcConnection.componentStatus || (json && json.componentStatus) || null;

  return {
    ok: Boolean(result && result.ok && json && json.ok !== false),
    checked: true,
    checkedAt: nowIso(),
    sourceRoute: "/api/remote-agent/status",
    httpStatusCode: result ? result.statusCode : 0,
    durationMs: result ? result.durationMs : 0,
    module: json && json.module ? json.module : "remote_agent",
    moduleVersion: json && json.moduleVersion ? json.moduleVersion : "",
    moduleBuild: json && json.moduleBuild ? json.moduleBuild : "",
    configured: Boolean(connection.configured || streamingPcConnection.configured),
    enabled: Boolean(connection.enabled || streamingPcConnection.enabled),
    connected: Boolean(connection.connected || streamingPcConnection.connected),
    connectionState: String(connection.connectionState || streamingPcConnection.connectionState || "unknown"),
    reason: String(connection.reason || streamingPcConnection.reason || result.error || ""),
    lastHeartbeatAt: String(connection.lastHeartbeatAt || streamingPcConnection.lastHeartbeatAt || ""),
    heartbeatSeq: Number(connection.heartbeatSeq || streamingPcConnection.heartbeatSeq || 0),
    componentStatusAvailable: Boolean(componentStatus),
    inventorySourcePrepared: true,
    actionsEnabled: false,
    productiveActionsEnabled: false,
    safeReadOnly: true
  };
}

async function getRemoteAgentStatusSummary() {
  const statusResult = await fetchLocalJson("/api/remote-agent/status");
  return {
    result: statusResult,
    summary: summarizeRemoteAgentStatus(statusResult)
  };
}

function getComponentStatusFromRemoteAgentResult(result) {
  const json = result && result.json && typeof result.json === "object" ? result.json : null;
  if (!json) return null;
  const streamingPcConnection = json.streamingPcConnection && typeof json.streamingPcConnection === "object" ? json.streamingPcConnection : {};
  return streamingPcConnection.componentStatus || json.componentStatus || null;
}

function sanitizeInventoryItem(item, fallbackType) {
  if (typeof item === "string") return { name: item.slice(0, 140), type: fallbackType || "read-only" };
  if (!item || typeof item !== "object") return null;
  const name = String(item.name || item.label || item.id || "").trim();
  if (!name) return null;
  return {
    name: name.slice(0, 140),
    label: String(item.label || name).slice(0, 140),
    id: item.id ? String(item.id).slice(0, 140) : name.slice(0, 140),
    type: String(item.type || item.kind || fallbackType || "read-only").slice(0, 80),
    readOnly: true
  };
}

function readInventoryArray(source, key, fallbackType) {
  const value = source && Array.isArray(source[key]) ? source[key] : [];
  return value.map(item => sanitizeInventoryItem(item, fallbackType)).filter(Boolean).slice(0, 250);
}

function extractPreparedInventory(result, generatedAt) {
  const componentStatus = getComponentStatusFromRemoteAgentResult(result);
  const obs = componentStatus && componentStatus.obs && typeof componentStatus.obs === "object" ? componentStatus.obs : null;
  const rawInventory = obs && obs.inventory && typeof obs.inventory === "object" ? obs.inventory : null;
  const scenes = readInventoryArray(rawInventory, "scenes", "scene");
  const sources = readInventoryArray(rawInventory, "sources", "source");
  const audioSources = readInventoryArray(rawInventory, "audioSources", "audio");
  const realActive = Boolean(rawInventory && rawInventory.active === true && (scenes.length || sources.length || audioSources.length));

  return {
    prepared: true,
    active: realActive,
    status: realActive ? "source_readonly_data_available" : "source_prepared_empty",
    checkedAt: generatedAt,
    sourcePrepared: true,
    sourceActive: realActive,
    sourceMode: INVENTORY_SOURCE_MODE,
    sourceRoute: "/api/remote-agent/status",
    sourceField: "componentStatus.obs.inventory",
    currentScene: rawInventory && rawInventory.currentScene ? String(rawInventory.currentScene).slice(0, 140) : null,
    scenes,
    sources,
    audioSources,
    groups: {
      scenes: { prepared: true, active: realActive, count: scenes.length, items: scenes },
      sources: { prepared: true, active: realActive, count: sources.length, items: sources },
      audioSources: { prepared: true, active: realActive, count: audioSources.length, items: audioSources }
    },
    counts: {
      scenes: scenes.length,
      sources: sources.length,
      audioSources: audioSources.length,
      total: scenes.length + sources.length + audioSources.length
    },
    capabilities: {
      sceneInventoryReadPrepared: true,
      sourceInventoryReadPrepared: true,
      audioInventoryReadPrepared: true,
      currentSceneReadPrepared: true,
      localInventorySourcePrepared: true,
      localAdapterSourcePrepared: true,
      remoteAgentComponentStatusSourcePrepared: true,
      realObsInventoryReadActive: realActive,
      obsWebSocketRequestsEnabled: false,
      actionsEnabled: false,
      controlEnabled: false
    },
    emptyReason: realActive ? null : "local_obs_inventory_source_prepared_but_real_obs_inventory_read_not_enabled_in_0_2_16",
    note: realActive
      ? "Lokale OBS-Inventardaten wurden read-only aus remote_agent-Komponentenstatus uebernommen. Keine Steuer-Actions aktiv."
      : "Lokale OBS-Inventarquelle ist read-only vorbereitet. Echte Szenen-/Quellen-/Audio-Abfrage ist noch nicht aktiv und folgt separat ohne Steuer-Actions."
  };
}

function summarizeObsStatusFromRemoteAgentResult(result) {
  const componentStatus = getComponentStatusFromRemoteAgentResult(result);
  const obs = componentStatus && componentStatus.obs && typeof componentStatus.obs === "object" ? componentStatus.obs : null;
  return {
    available: Boolean(obs && obs.available !== false),
    status: obs && obs.status ? String(obs.status) : "not_available",
    reachable: obs && Object.prototype.hasOwnProperty.call(obs, "reachable") ? obs.reachable : null,
    name: obs && obs.name ? String(obs.name) : "OBS",
    port: obs && obs.port ? obs.port : 4455,
    checkedAt: obs && obs.checkedAt ? String(obs.checkedAt) : "",
    detail: obs && obs.detail ? String(obs.detail) : "OBS wird read-only ueber remote_agent-Komponentenstatus gelesen. Inventarquelle ist vorbereitet, echte Inventarabfrage bleibt separat deaktiviert.",
    readOnly: true,
    controlEnabled: false,
    noAuthenticationAttempt: obs ? obs.noAuthenticationAttempt !== false : true,
    noObsRequestSent: obs ? obs.noObsRequestSent !== false : true,
    noObsInventoryRequestSent: true,
    lastError: obs && obs.lastError ? String(obs.lastError) : null
  };
}

function obsModelPayload(obsStatus, remoteAgent, inventory, generatedAt) {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.obs_inventory_source_0216.v1",
    generatedAt,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    prepared: true,
    active: false,
    status: "readonly_local_inventory_source_prepared",
    remoteAgent,
    obs: obsStatus,
    inventory,
    plannedReadOnlyEndpoints: [
      `${API_PREFIX}/local-dashboard/obs/status`,
      `${API_PREFIX}/local-dashboard/obs/model`
    ],
    plannedActionsStillDisabled: [
      "obs.scene.switch",
      "obs.source.visibility.set",
      "obs.input.mute.set",
      "obs.media.stop",
      "obs.refresh"
    ],
    safety: {
      readOnly: true,
      obsControlEnabled: false,
      sceneSwitchEnabled: false,
      sourceVisibilityEnabled: false,
      muteControlEnabled: false,
      mediaControlEnabled: false,
      inventoryReadPrepared: true,
      localInventorySourcePrepared: true,
      realObsInventoryReadActive: inventory.capabilities.realObsInventoryReadActive === true,
      noObsRequestSentByAdapter: true,
      noObsInventoryRequestSentByAdapter: true,
      noAgentActionExecution: true,
      noStreamingPcActionExecution: true,
      noFileWrite: true,
      noDatabaseWrite: true,
      noShellOrProcessActions: true
    },
    note: "0.2.16 bereitet die lokale OBS-Inventarquelle read-only ueber local_remote_modboard_adapter -> remote_agent componentStatus vor. Es wird keine OBS-Aktion und keine Agent-Aktion ausgefuehrt."
  };
}

async function localObsReadOnlyPayload() {
  const generatedAt = nowIso();
  const remote = await getRemoteAgentStatusSummary();
  const obsStatus = summarizeObsStatusFromRemoteAgentResult(remote.result);
  const inventory = extractPreparedInventory(remote.result, generatedAt);
  return obsModelPayload(obsStatus, remote.summary, inventory, generatedAt);
}

async function agentExecutorDiagnosticPayload(ctx = {}) {
  const loadedModules = getLoadedModules(ctx);
  const remoteAgentLoaded = loadedModules.includes("remote_agent.js");
  const remote = await getRemoteAgentStatusSummary();
  const remoteAgent = remote.summary;

  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.agent_executor_diagnostic.v1",
    generatedAt: nowIso(),
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    prepared: true,
    active: false,
    status: "diagnostic_only",
    remoteAgentLoaded,
    remoteAgent,
    executorModel: {
      centralExecutor: "remote_agent",
      localPath: "Dashboard-v2 lokal -> lokaler Server/Adapter -> remote_agent -> Streaming-PC-Aktion",
      onlinePath: "Modboard online -> Webserver -> remote_agent -> Streaming-PC-Aktion",
      handshakePrepared: true,
      handshakeActive: remoteAgent.connected === true,
      actionQueuePrepared: false,
      commandAcceptanceEnabled: false,
      productiveActionsEnabled: false
    },
    obsReadOnly: {
      prepared: true,
      endpoint: `${API_PREFIX}/local-dashboard/obs/status`,
      inventorySourcePrepared: true,
      inventorySourceMode: INVENTORY_SOURCE_MODE,
      actionEnabled: false
    },
    safety: {
      readOnly: true,
      noAgentActionExecution: true,
      noStreamingPcActionExecution: true,
      noSoundControl: true,
      noObsControl: true,
      noOverlayControl: true,
      noCommandControl: true,
      noFileWrite: true,
      noDatabaseWrite: true,
      noShellOrProcessActions: true
    },
    routes: [
      { method: "GET", path: `${API_PREFIX}/local-dashboard/agent-executor/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/agent-executor/handshake`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/obs/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/obs/model`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/media/status`, readOnly: true, localMediaInventoryReadonlyPrepared: true },
      { method: "GET", path: "/api/remote-agent/status", readOnly: true, source: "remote_agent" }
    ],
    note: "0.2.16 liest nur bestehenden remote_agent-Status und bereitet die lokale OBS-Inventarquelle read-only vor. Es werden keine Agent-Kommandos angenommen oder ausgefuehrt."
  };
}

function localUser() {
  return {
    userUid: "local-forrestcgn",
    twitchUserId: "local-forrestcgn",
    twitchId: "local-forrestcgn",
    login: "forrestcgn",
    userLogin: "forrestcgn",
    displayName: "ForrestCGN",
    avatarUrl: "",
    roles: ["owner"],
    groups: ["owner", "admin"],
    permissions: ["remote.view", "remote.admin.read", "remote.dashboard.local.read", "media.read"],
    runtime: "local",
    localOnly: true
  };
}

function localSafetyPayload() {
  return {
    readOnly: true,
    productiveWritesEnabled: false,
    remoteWritesEnabled: false,
    agentActionsEnabled: false,
    obsActionsEnabled: false,
    soundActionsEnabled: false,
    overlayActionsEnabled: false,
    commandActionsEnabled: false,
    shellActionsEnabled: false,
    fileActionsEnabled: false,
    processActionsEnabled: false,
    dbMigration: false,
    dashboardLegacyChanged: false
  };
}

function localArchitecturePayload(ctx = {}) {
  const remoteAssetsDir = getRemoteAssetsDir();
  const remoteAssetsAvailable = fs.existsSync(remoteAssetsDir);
  const loadedModules = getLoadedModules(ctx);

  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.runtime_profile.v1",
    generatedAt: nowIso(),
    runtimeMode: "local",
    localDashboard: true,
    ui: {
      source: "remote-modboard",
      sourceLabel: "Remote-Modboard UI",
      localUiFork: false,
      separateLocalNavigation: false,
      localDesignAllowed: false,
      note: "Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil."
    },
    access: {
      mods: { entry: "https://mods.forrestcgn.de/", localAccess: false },
      forrestEngelHome: { entry: "/dashboard-v2/", mode: "local-stream-pc-lan" },
      forrestEngelAway: { entry: "https://mods.forrestcgn.de/", mode: "online" }
    },
    agentExecutor: {
      prepared: true,
      active: false,
      status: "diagnostic_only",
      diagnosticEndpoint: `${API_PREFIX}/local-dashboard/agent-executor/status`,
      handshakeEndpoint: `${API_PREFIX}/local-dashboard/agent-executor/handshake`,
      centralExecutor: true,
      requiredForStreamingPcActions: true,
      localPath: "Dashboard-v2 lokal -> lokaler Server/Adapter -> Agent -> Streaming-PC-Aktion",
      onlinePath: "Modboard online -> Webserver -> Agent -> Streaming-PC-Aktion",
      enabledActions: [],
      blockedActions: ["obs", "sound", "overlay", "command", "file", "process", "shell", "productiveWrite"],
      note: "0.2.16 bereitet Agent-Executor-Diagnose und OBS-Inventarquelle read-only vor. Es aktiviert keine Agent-Actions."
    },
    obsModule: {
      prepared: true,
      active: false,
      status: "readonly_local_inventory_source_prepared",
      statusEndpoint: `${API_PREFIX}/local-dashboard/obs/status`,
      modelEndpoint: `${API_PREFIX}/local-dashboard/obs/model`,
      inventorySourcePrepared: true,
      inventorySourceMode: INVENTORY_SOURCE_MODE,
      controlEnabled: false,
      note: "OBS-Inventarquelle ist read-only ueber Adapter/remote_agent vorbereitet. Echte OBS-Inventarabfrage und Steuerung bleiben aus."
    },
    rightsSync: {
      prepared: true,
      active: false,
      status: "planned",
      localAndOnlineChangesAllowed: "planned",
      onlineRevocationImmediate: true,
      conflictRule: "planned: revocations win immediately; normal changes use revision/timestamp.",
      requiredFields: ["actor", "timestamp", "source", "revision", "audit"],
      note: "User/Rechte-Sync ist dokumentiert, aber technisch noch nicht aktiv."
    },
    safety: localSafetyPayload(),
    loadedModules: { count: loadedModules.length, files: loadedModules }
  };
}

function localStatusPayload(ctx = {}) {
  const loadedModules = getLoadedModules(ctx);
  const architecture = localArchitecturePayload(ctx);
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.v2",
    runtimeMode: "local",
    runtime: {
      mode: "local",
      label: "Lokalmodus",
      localDashboard: true,
      readOnly: true,
      remoteShell: true,
      profileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`
    },
    serviceStatus: "ok",
    status: "ok",
    localDashboard: true,
    readOnly: true,
    prepared: true,
    online: true,
    loginEnabled: false,
    oauthEnabled: false,
    remoteWritesEnabled: false,
    productiveWritesEnabled: false,
    agentActionsEnabled: false,
    obsActionsEnabled: false,
    soundActionsEnabled: false,
    overlayActionsEnabled: false,
    commandActionsEnabled: false,
    runtimeProfile: {
      uiSource: architecture.ui.source,
      agentExecutor: architecture.agentExecutor.status,
      agentExecutorEndpoint: `${API_PREFIX}/local-dashboard/agent-executor/status`,
      obsModule: architecture.obsModule.status,
      obsEndpoint: `${API_PREFIX}/local-dashboard/obs/status`,
      obsInventorySourcePrepared: true,
      rightsSync: architecture.rightsSync.status,
      writeActions: "disabled"
    },
    loadedModules: loadedModules.length,
    generatedAt: nowIso(),
    note: "/dashboard-v2 nutzt die echte Remote-Modboard-Frontend-Shell mit lokalen read-only API-Adaptern."
  };
}

function localRoutesPayload(ctx = {}) {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.v2",
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    routes: [
      { method: "GET", path: `${API_PREFIX}/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/routes`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/me`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/login/plan`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/model`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/permissions/check`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/lock-audit/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/lock-audit/schema-adapter/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/adapter/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/runtime-profile`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/architecture`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/agent-executor/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/agent-executor/handshake`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/obs/status`, readOnly: true, inventorySourcePrepared: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/obs/model`, readOnly: true, inventorySourcePrepared: true }
    ],
    localSafety: localSafetyPayload(),
    loadedModules: getLoadedModules(ctx),
    generatedAt: nowIso()
  };
}

function localAuthPayload(extra = {}) {
  const user = localUser();
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    authenticated: true,
    loggedIn: true,
    authorized: true,
    allowed: true,
    canAccess: true,
    accessGranted: true,
    user,
    me: user,
    profile: user,
    account: user,
    session: { authenticated: true, authorized: true, localOnly: true, createdAt: nowIso(), expiresAt: "" },
    roles: user.roles,
    groups: user.groups,
    permissions: user.permissions,
    ...extra
  };
}

function authModelPayload() {
  const user = localUser();
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    roles: [
      { id: "owner", label: "Owner", localOnly: true, permissions: user.permissions },
      { id: "admin", label: "Admin", localOnly: true, permissions: ["remote.view", "remote.admin.read"] }
    ],
    groups: [
      { id: "owner", label: "Owner", localOnly: true },
      { id: "admin", label: "Admin", localOnly: true }
    ],
    permissions: user.permissions.map((permission) => ({ id: permission, permission, allowed: true, localOnly: true, readOnly: true })),
    model: { loginEnabled: false, oauthEnabled: false, sessionEnabled: false, localReadOnlyAdapter: true, runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile` },
    user
  };
}

function permissionPayload(req) {
  const permission = String((req.query && req.query.permission) || "remote.view").trim() || "remote.view";
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    permission,
    allowed: true,
    hasPermission: true,
    canRead: true,
    canWrite: false,
    user: localUser(),
    decision: { allowed: true, reason: "local_read_only_adapter" }
  };
}

function lockAuditStatusPayload() {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    lock: { enabled: true, activeLocks: 0, locks: [] },
    audit: { enabled: true, localReadOnly: true, recent: [] },
    canRead: true,
    canWrite: false
  };
}

function schemaAdapterPayload() {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    adapter: { prepared: true, mode: "local-read-only", dbRequired: false },
    schema: { ready: true, localOnly: true, migrationsRequired: false }
  };
}


function readMediaLimit(req) {
  const raw = req && req.query ? Number.parseInt(String(req.query.limit || ""), 10) : 0;
  if (!Number.isFinite(raw) || raw <= 0) return MEDIA_SCAN_DEFAULT_LIMIT;
  return Math.max(1, Math.min(raw, MEDIA_SCAN_HARD_LIMIT));
}

function emptyMediaGroups() {
  return {
    sounds: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    videos: { prepared: true, exists: true, count: 0, items: [], emptyReason: null },
    images: { prepared: true, exists: true, count: 0, items: [], emptyReason: null }
  };
}

function mediaKindForExtension(ext) {
  if (MEDIA_AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (MEDIA_VIDEO_EXTENSIONS.has(ext)) return "video";
  if (MEDIA_IMAGE_EXTENSIONS.has(ext)) return "image";
  return "media";
}

function normalizeMediaRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function walkMediaRoot({ root, absoluteRoot, currentDir, depth, limit, items, groups, counts, errors, truncatedRef, setTruncated }) {
  if (truncatedRef()) return;
  if (depth > MEDIA_SCAN_MAX_DEPTH) {
    counts.skipped += 1;
    return;
  }

  let entries = [];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch (_) {
    errors.push({ rootKey: root.key, error: "read_dir_failed" });
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (truncatedRef()) return;
    if (!entry || !entry.name || entry.name.startsWith(".")) continue;
    const absolutePath = path.join(currentDir, entry.name);
    if (!absolutePath.startsWith(absoluteRoot)) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isSymbolicLink()) {
      counts.skipped += 1;
      continue;
    }
    if (entry.isDirectory()) {
      walkMediaRoot({ root, absoluteRoot, currentDir: absolutePath, depth: depth + 1, limit, items, groups, counts, errors, truncatedRef, setTruncated });
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!MEDIA_ALLOWED_EXTENSIONS.includes(ext)) {
      counts.skipped += 1;
      continue;
    }
    counts.totalSeen += 1;
    if (items.length >= limit) {
      setTruncated();
      return;
    }
    const rel = normalizeMediaRelativePath(path.relative(absoluteRoot, absolutePath));
    if (!rel || rel.includes("..")) {
      counts.skipped += 1;
      continue;
    }
    let stat = null;
    try { stat = fs.statSync(absolutePath); } catch (_) { counts.skipped += 1; continue; }
    const kind = mediaKindForExtension(ext);
    const item = {
      id: `${root.key}:${rel}`,
      rootKey: root.key,
      rootLabel: root.label,
      kind,
      name: path.basename(rel),
      relativePath: rel,
      publicPath: `${root.publicBasePath}/${rel}`,
      extension: ext,
      sizeBytes: stat.size,
      modifiedAt: stat.mtime ? stat.mtime.toISOString() : null,
      readOnly: true
    };
    items.push(item);
    groups[root.key].items.push(item);
    groups[root.key].count += 1;
    counts[root.key] = (counts[root.key] || 0) + 1;
    counts[kind] = (counts[kind] || 0) + 1;
  }
}

function buildLocalMediaInventory(req = null) {
  const generatedAt = nowIso();
  const limit = readMediaLimit(req);
  const projectRoot = getProjectRoot();
  const items = [];
  const groups = emptyMediaGroups();
  const counts = { total: 0, sounds: 0, videos: 0, images: 0, audio: 0, video: 0, image: 0, returned: 0, skipped: 0, totalSeen: 0 };
  const errors = [];
  let truncated = false;

  for (const root of MEDIA_ROOTS) {
    const absoluteRoot = path.resolve(projectRoot, root.localPathHint);
    if (!absoluteRoot.startsWith(projectRoot)) {
      errors.push({ rootKey: root.key, error: "root_outside_project" });
      continue;
    }
    if (!fs.existsSync(absoluteRoot)) {
      groups[root.key].exists = false;
      groups[root.key].emptyReason = "root_missing";
      continue;
    }
    walkMediaRoot({ root, absoluteRoot, currentDir: absoluteRoot, depth: 0, limit, items, groups, counts, errors, truncatedRef: () => truncated, setTruncated: () => { truncated = true; } });
    if (truncated) break;
  }

  items.sort((a, b) => String(a.rootKey).localeCompare(String(b.rootKey)) || String(a.relativePath).localeCompare(String(b.relativePath)));
  for (const key of Object.keys(groups)) groups[key].items.sort((a, b) => String(a.relativePath).localeCompare(String(b.relativePath)));
  counts.total = items.length;
  counts.returned = items.length;

  return {
    prepared: true,
    active: items.length > 0,
    source: "local_stream_pc_filesystem_readonly",
    routePreparedLater: "/api/remote-agent/media/inventory/status",
    scannedAt: generatedAt,
    roots: MEDIA_ROOTS.map(root => ({ key: root.key, label: root.label, exists: groups[root.key].exists, count: groups[root.key].count, localPathHint: root.localPathHint })),
    items,
    groups,
    counts,
    limit,
    hardLimit: MEDIA_SCAN_HARD_LIMIT,
    maxDepth: MEDIA_SCAN_MAX_DEPTH,
    truncated,
    hasMore: truncated,
    nextCursor: truncated ? "prepared_later" : null,
    errors,
    emptyReason: items.length ? null : "no_allowed_media_files_found"
  };
}

function localMediaStatusPayload(req = null) {
  const inventory = buildLocalMediaInventory(req);
  return {
    ok: true,
    service: "remote-modboard",
    module: "remote_media_readonly",
    moduleVersion: "0.2.27",
    moduleBuild: MODULE_BUILD,
    routeBuild: MODULE_BUILD,
    statusApiVersion: "rdap_media_local_inventory_readonly_025.v1",
    route: `${API_PREFIX}/media/status`,
    generatedAt: nowIso(),
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    prepared: true,
    active: true,
    status: inventory.active ? "local_media_inventory_available" : "local_media_inventory_empty",
    title: "Media-System",
    summary: "Lokales Media-Inventar wurde read-only erfasst. Upload, Bearbeiten und Loeschen bleiben aus.",
    mode: { local: true, online: false, localInventoryExpected: true, onlineAgentInventorySyncPreparedLater: true, singleUiTruth: true, remoteModboardUi: true, localDashboardProfileUsesSameUi: true },
    permissions: { prepared: true, modelOnly: true, backendEnforcementRequiredBeforeWrites: true, readPermission: "media.read", uploadPermission: "media.upload", editPermission: "media.edit", deletePermission: "media.delete", uploadEnabled: false, editEnabled: false, deleteEnabled: false },
    inventory,
    plannedRoots: MEDIA_ROOTS.map(item => ({ ...item })),
    allowedExtensions: MEDIA_ALLOWED_EXTENSIONS.slice(),
    scanPolicy: { readOnly: true, defaultLimit: MEDIA_SCAN_DEFAULT_LIMIT, hardLimit: MEDIA_SCAN_HARD_LIMIT, maxDepth: MEDIA_SCAN_MAX_DEPTH, acceptsLimitQuery: true, cursorPreparedLater: true, nextCursor: inventory.truncated ? "prepared_later" : null },
    safety: { readOnly: true, uploadEnabled: false, editEnabled: false, deleteEnabled: false, fileWrite: false, databaseWrite: false, migrationEnabled: false, shellOrProcessActions: false, agentActionsEnabled: false, freePathAccessEnabled: false, absolutePathsReturned: false, secretsExposed: false, noUploadInThisStep: true, noDeleteInThisStep: true },
    nextSteps: ["Online-Media-Inventar spaeter per Agent-WSS Memory-only synchronisieren.", "Filter/Paging spaeter ohne Breaking Change ueber limit/root/type/cursor ausbauen.", "Upload/Edit/Delete erst nach separatem Permission-/Audit-/Confirm-Step."]
  };
}

function localPlaceholderPayload(req) {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    placeholder: true,
    path: req.path,
    query: req.query || {},
    data: [],
    items: [],
    users: [],
    notes: [],
    connections: [],
    runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`,
    message: "Lokaler read-only Platzhalter. Echte Remote-Modboard-UI bleibt identisch; produktive Daten/Writes sind lokal blockiert."
  };
}

function writeBlockedPayload(req) {
  return {
    ok: false,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    error: "local_remote_write_blocked",
    method: req.method,
    path: req.path,
    message: "Lokale Remote-Modboard-Kopie ist read-only. Writes, Sync, Agent-, OBS-, Sound-, Overlay-, Command-, Shell-, Datei- und Prozess-Actions sind blockiert."
  };
}

function mountRemoteAssetFiles(app, remoteAssetsDir) {
  const staticOptions = { index: false, dotfiles: "deny", fallthrough: true };
  const dashboardAssetsDir = getDashboardV2AssetsDir();

  app.use("/assets/modules", express.static(path.join(dashboardAssetsDir, "modules"), staticOptions));
  app.use("/assets/languages", express.static(path.join(dashboardAssetsDir, "languages"), staticOptions));
  app.use("/dashboard-v2/assets/modules", express.static(path.join(dashboardAssetsDir, "modules"), staticOptions));
  app.use("/dashboard-v2/assets/languages", express.static(path.join(dashboardAssetsDir, "languages"), staticOptions));

  app.use("/assets/modules", express.static(path.join(remoteAssetsDir, "modules"), staticOptions));
  app.use("/assets/languages", express.static(path.join(remoteAssetsDir, "languages"), staticOptions));
  app.use("/dashboard-v2/assets/modules", express.static(path.join(remoteAssetsDir, "modules"), staticOptions));
  app.use("/dashboard-v2/assets/languages", express.static(path.join(remoteAssetsDir, "languages"), staticOptions));

  function sendLocalOrRedirect(localName, assetName) {
    return (req, res) => {
      const dashboardFile = path.join(dashboardAssetsDir, localName);
      if (fs.existsSync(dashboardFile)) return res.sendFile(dashboardFile);
      const file = path.join(remoteAssetsDir, localName);
      if (fs.existsSync(file)) return res.sendFile(file);
      return redirectRemoteAsset(req, res, assetName || localName);
    };
  }

  app.get("/assets/remote-modboard.css", sendLocalOrRedirect("remote-modboard.css"));
  app.get("/assets/remote-modboard.js", sendLocalOrRedirect("remote-modboard.js"));
  app.get("/assets/runtime-profile.js", sendLocalOrRedirect("runtime-profile.js"));
  app.get("/dashboard-v2/assets/remote-modboard.css", sendLocalOrRedirect("remote-modboard.css"));
  app.get("/dashboard-v2/assets/remote-modboard.js", sendLocalOrRedirect("remote-modboard.js"));
  app.get("/dashboard-v2/assets/runtime-profile.js", sendLocalOrRedirect("runtime-profile.js"));

  app.get(/^\/assets\/(languages\/.+|modules\/.+)$/, (req, res) => redirectRemoteAsset(req, res, req.params[0]));
  app.get(/^\/dashboard-v2\/assets\/(languages\/.+|modules\/.+)$/, (req, res) => redirectRemoteAsset(req, res, req.params[0]));
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.init = function init(ctx = {}) {
  const { app } = ctx;
  if (!app || typeof app.get !== "function") {
    console.warn(`[${MODULE_NAME}] Express app missing; adapter not mounted`);
    return;
  }

  const remotePublicDir = getRemotePublicDir();
  const remoteAssetsDir = getRemoteAssetsDir();
  const remoteAssetsAvailable = fs.existsSync(remoteAssetsDir);

  mountRemoteAssetFiles(app, remoteAssetsDir);

  app.get(`${API_PREFIX}/status`, (req, res) => res.json(localStatusPayload(ctx)));
  app.get(`${API_PREFIX}/routes`, (req, res) => res.json(localRoutesPayload(ctx)));
  app.get(`${API_PREFIX}/auth/me`, (req, res) => res.json(localAuthPayload()));
  app.get(`${API_PREFIX}/auth/login/plan`, (req, res) => res.json({
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    loginEnabled: false,
    oauthEnabled: false,
    startUrl: "",
    reason: "local_dashboard_read_only_adapter"
  }));
  app.get(`${API_PREFIX}/auth/model`, (req, res) => res.json(authModelPayload()));
  app.get(`${API_PREFIX}/auth/permissions/check`, (req, res) => res.json(permissionPayload(req)));
  app.get(`${API_PREFIX}/lock-audit/status`, (req, res) => res.json(lockAuditStatusPayload()));
  app.get(`${API_PREFIX}/lock-audit/schema-adapter/status`, (req, res) => res.json(schemaAdapterPayload()));
  app.get(`${API_PREFIX}/media/status`, (req, res) => res.json(localMediaStatusPayload(req)));

  app.get(`${API_PREFIX}/local-dashboard/runtime-profile`, (req, res) => res.json(localArchitecturePayload(ctx)));
  app.get(`${API_PREFIX}/local-dashboard/architecture`, (req, res) => res.json(localArchitecturePayload(ctx)));
  app.get(`${API_PREFIX}/local-dashboard/agent-executor/status`, async (req, res) => res.json(await agentExecutorDiagnosticPayload(ctx)));
  app.get(`${API_PREFIX}/local-dashboard/agent-executor/handshake`, async (req, res) => res.json(await agentExecutorDiagnosticPayload(ctx)));
  app.get(`${API_PREFIX}/local-dashboard/obs/status`, async (req, res) => res.json(await localObsReadOnlyPayload()));
  app.get(`${API_PREFIX}/local-dashboard/obs/model`, async (req, res) => res.json(await localObsReadOnlyPayload()));

  app.get(`${API_PREFIX}/local-dashboard/adapter/status`, (req, res) => res.json({
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    remotePublicDir,
    remoteAssetsDir,
    remoteAssetsAvailable,
    remoteAssetsUpstream: getRemoteAssetsUpstream(),
    assetFallback: remoteAssetsAvailable ? "local-files" : "upstream-redirect",
    readOnly: true,
    runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`,
    agentExecutor: { prepared: true, active: false, status: "diagnostic_only", diagnosticEndpoint: `${API_PREFIX}/local-dashboard/agent-executor/status` },
    obsModule: {
      prepared: true,
      active: false,
      status: "readonly_local_inventory_source_prepared",
      statusEndpoint: `${API_PREFIX}/local-dashboard/obs/status`,
      modelEndpoint: `${API_PREFIX}/local-dashboard/obs/model`,
      inventorySourcePrepared: true,
      inventorySourceMode: INVENTORY_SOURCE_MODE
    },
    rightsSync: { prepared: true, active: false, status: "planned" },
    mediaModule: { prepared: true, active: true, statusEndpoint: `${API_PREFIX}/media/status`, inventoryReadonlyPrepared: true }
  }));

  app.get(`${API_PREFIX}/auth/login/start`, (req, res) => {
    res.redirect(302, "/dashboard-v2/");
  });

  app.get(`${API_PREFIX}/*`, (req, res) => res.json(localPlaceholderPayload(req)));
  app.all(`${API_PREFIX}/*`, (req, res) => res.status(405).json(writeBlockedPayload(req)));

  console.log(`[${MODULE_NAME}] routes active: ${API_PREFIX}/* read-only adapter; runtimeProfile=prepared; agentExecutorDiagnostic=prepared; obsLocalInventorySource=prepared; mediaLocalInventoryReadonly=prepared; obsUi=visible; remoteAssetsAvailable=${remoteAssetsAvailable}; assetFallback=${remoteAssetsAvailable ? "local-files" : "upstream-redirect"}`);
};
