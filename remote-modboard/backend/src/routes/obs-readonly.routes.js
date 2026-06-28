'use strict';

const { buildAgentObsLiveStatusResponse, buildAgentObsInventoryStatusResponse } = require('../services/agent-runtime.service');

const STATUS_API_VERSION = 'rdap_obs_inventory_sync_readonly_0222.v1';
const BUILD = 'RDAP_0.2.22BB_OBS_INVENTORY_SYNC_RECEIVER_FIX_READONLY';
const OBS_STATUS_PATH = '/api/remote/local-dashboard/obs/status';
const OBS_MODEL_PATH = '/api/remote/local-dashboard/obs/model';
const OBS_AGENT_LIVE_STATUS_PATH = '/api/remote/agent/obs/live/status';
const OBS_AGENT_INVENTORY_STATUS_PATH = '/api/remote/agent/obs/inventory/status';
const INVENTORY_SOURCE_MODE = 'agent_wss_inventory_sync_memory';

const OBS_ALLOWLIST_MODEL = Object.freeze({
  prepared: true,
  readOnly: true,
  active: false,
  modelVersion: 'obs_allowlist_rights_model.v1',
  defaultProductiveSceneRule: 'scene.name must not start with underscore',
  switchableSceneMode: 'explicit_allowlist_required_later',
  switchableScenes: [],
  controllableAudioSources: [],
  controllableSources: [],
  targetTypes: [
    { key: 'scene', permission: 'obs.scene.switch', action: 'switch', requiresAllowlist: true, enabled: false },
    { key: 'audio', permission: 'obs.audio.mute', action: 'mute-toggle', requiresAllowlist: true, enabled: false },
    { key: 'source', permission: 'obs.source.visibility', action: 'visibility-toggle', requiresAllowlist: true, enabled: false }
  ],
  notes: [
    'Produktive Szenen ohne fuehrenden Unterstrich bleiben sichtbar.',
    'Schaltbar wird spaeter nur, was explizit in einer Allowlist steht.',
    '0.2.22B aktiviert keine OBS-Actions und sendet keine OBS-Kommandos.'
  ]
});

const OBS_RIGHTS_MODEL = Object.freeze({
  prepared: true,
  readOnly: true,
  active: false,
  permissions: [
    { key: 'obs.read', label: 'OBS sehen', area: 'obs', prepared: true, enabled: false, actionEnabled: false },
    { key: 'obs.scene.switch', label: 'Szenen wechseln', area: 'obs', prepared: true, enabled: false, actionEnabled: false, allowlistRequired: true },
    { key: 'obs.audio.mute', label: 'Audio stumm/aktiv', area: 'obs', prepared: true, enabled: false, actionEnabled: false, allowlistRequired: true },
    { key: 'obs.source.visibility', label: 'Quellen sichtbar/unsichtbar', area: 'obs', prepared: true, enabled: false, actionEnabled: false, allowlistRequired: true },
    { key: 'obs.admin.diagnostics', label: 'OBS Diagnose', area: 'obs', prepared: true, enabled: false, actionEnabled: false }
  ],
  rolePreview: [
    { role: 'owner', planned: ['obs.read', 'obs.scene.switch', 'obs.audio.mute', 'obs.source.visibility', 'obs.admin.diagnostics'], enabledNow: [] },
    { role: 'admin', planned: ['obs.read', 'obs.scene.switch', 'obs.audio.mute', 'obs.source.visibility', 'obs.admin.diagnostics'], enabledNow: [] },
    { role: 'lead_mod', planned: ['obs.read', 'obs.scene.switch', 'obs.audio.mute'], enabledNow: [] },
    { role: 'mod', planned: ['obs.read'], enabledNow: [] },
    { role: 'readonly', planned: ['obs.read'], enabledNow: [] }
  ],
  auditTargetPrepared: true,
  lockTargetPrepared: true,
  writesEnabled: false,
  actionsEnabled: false
});

function buildObsReadonlyPayload(context = {}) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();
  const agentInventoryStatus = buildAgentObsInventoryStatusResponse();
  const agentInventory = agentInventoryStatus && agentInventoryStatus.active ? agentInventoryStatus.inventory : null;
  const liveStatus = buildAgentObsLiveStatusResponse();
  const liveConnected = liveStatus && liveStatus.active === true;
  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_obs_readonly',
    moduleVersion: context.appVersion || '0.2.22BB',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: Boolean(agentInventory),
    status: agentInventory ? 'readonly_inventory_sync_available' : 'readonly_inventory_sync_pending',
    localDashboard: runtimeMode === 'local',
    remoteAgent: {
      checked: true,
      connected: liveStatus && liveStatus.agent ? liveStatus.agent.connected === true : false,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      safeReadOnly: true,
      componentStatusSourcePrepared: true,
      inventorySourceMode: INVENTORY_SOURCE_MODE,
      obsInventoryEnvDiagnosticPrepared: true,
      obsLiveStateReadOnlyPrepared: true,
      obsLiveStateRoute: OBS_AGENT_LIVE_STATUS_PATH,
      obsInventorySyncReadOnlyPrepared: true,
      obsInventorySyncRoute: OBS_AGENT_INVENTORY_STATUS_PATH,
      inventorySyncActive: Boolean(agentInventory),
      obsAllowlistRightsModelPrepared: true,
      diagnosticRoute: OBS_AGENT_INVENTORY_STATUS_PATH,
      note: 'OBS-Listen kommen online separat per Agent Inventory-Sync. Agent-Actions bleiben deaktiviert.'
    },
    obs: {
      available: liveConnected || Boolean(agentInventory),
      status: liveConnected ? 'live_connected' : (agentInventory ? 'inventory_available' : 'not_ready'),
      reachable: liveConnected || Boolean(agentInventory),
      name: 'OBS',
      checkedAt: generatedAt,
      detail: 'Webserver baut keine OBS-WebSocket-Verbindung auf. OBS-Daten kommen read-only vom Stream-PC-Agent.',
      readOnly: true,
      controlEnabled: false,
      noAuthenticationAttempt: true,
      noObsRequestSent: true,
      noObsInventoryRequestSent: true,
      lastError: null
    },
    inventory: agentInventory || buildPreparedInventory(generatedAt),
    allowlistModel: buildObsAllowlistModel(),
    rightsModel: buildObsRightsModel(),
    plannedReadOnlyEndpoints: [OBS_STATUS_PATH, OBS_MODEL_PATH, OBS_AGENT_LIVE_STATUS_PATH, OBS_AGENT_INVENTORY_STATUS_PATH],
    plannedActionsStillDisabled: ['obs.scene.switch', 'obs.source.visibility.set', 'obs.input.mute.set', 'obs.media.stop', 'obs.refresh'],
    plannedPermissions: buildObsRightsModel().permissions.map(item => item.key),
    productiveSceneRule: 'scene.name must not start with underscore',
    switchableSceneRule: 'explicit allowlist required before any future switch action',
    safety: buildObsSafety(),
    note: '0.2.22B uebernimmt OBS-Szenen/Audio/Quellen separat per Agent Inventory-Sync read-only. Keine OBS-Actions, keine Agent-Actions, keine Writes.'
  };
}

function buildObsAllowlistModel() { return clonePlain(OBS_ALLOWLIST_MODEL); }
function buildObsRightsModel() { return clonePlain(OBS_RIGHTS_MODEL); }

function buildPreparedInventory(generatedAt) {
  return {
    prepared: true,
    active: false,
    status: 'inventory_sync_pending',
    checkedAt: generatedAt,
    sourcePrepared: true,
    sourceActive: false,
    sourceMode: INVENTORY_SOURCE_MODE,
    sourceRoute: OBS_AGENT_INVENTORY_STATUS_PATH,
    currentScene: null,
    scenes: [],
    sources: [],
    audioSources: [],
    groups: {
      scenes: { prepared: true, active: false, count: 0, items: [] },
      sources: { prepared: true, active: false, count: 0, items: [] },
      audioSources: { prepared: true, active: false, count: 0, items: [] }
    },
    counts: { scenes: 0, sources: 0, audioSources: 0, total: 0 },
    capabilities: {
      sceneInventoryReadPrepared: true,
      sourceInventoryReadPrepared: true,
      audioInventoryReadPrepared: true,
      currentSceneReadPrepared: true,
      agentInventorySyncPrepared: true,
      obsInventoryUiDisplayPrepared: true,
      productiveSceneFilterPrepared: true,
      obsModControlSurfacePrepared: true,
      obsAllowlistRightsModelPrepared: true,
      realObsInventoryReadActive: false,
      obsWebSocketRequestsEnabled: false,
      actionsEnabled: false,
      controlEnabled: false
    },
    emptyReason: 'agent_inventory_sync_pending',
    note: 'OBS-Listen werden separat vom Stream-PC-Agent erwartet. Keine Steuer-Actions aktiv.'
  };
}

function buildObsSafety() {
  return {
    readOnly: true,
    obsControlEnabled: false,
    sceneSwitchEnabled: false,
    sourceVisibilityEnabled: false,
    muteControlEnabled: false,
    mediaControlEnabled: false,
    inventoryReadPrepared: true,
    agentInventorySyncPrepared: true,
    obsInventoryUiDisplayPrepared: true,
    obsLiveStateReadOnlyPrepared: true,
    obsInventorySyncReadOnlyPrepared: true,
    obsAllowlistRightsModelPrepared: true,
    productiveSceneFilterPrepared: true,
    noObsRequestSentByBackend: true,
    noObsInventoryRequestSentByBackend: true,
    noAgentActionExecution: true,
    noStreamingPcActionExecution: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    noShellOrProcessActions: true,
    noFreeObsPayloads: true
  };
}

function buildObsModuleMetadataPage() {
  return {
    pageId: 'obs', label: 'OBS', moduleId: 'system', runtime: 'both', permission: 'remote.view', title: 'OBS Bedienung', tab: 'read-only', readOnly: true,
    inventoryReadOnlyPrepared: true, agentInventorySyncPrepared: true, obsInventoryUiDisplayPrepared: true, obsLiveStateReadOnlyPrepared: true,
    obsInventorySyncReadOnlyPrepared: true, obsAllowlistRightsModelPrepared: true,
    obsLiveStateRoute: OBS_AGENT_LIVE_STATUS_PATH, obsInventorySyncRoute: OBS_AGENT_INVENTORY_STATUS_PATH,
    productiveSceneFilterPrepared: true, allowlistModel: buildObsAllowlistModel(), plannedPermissions: buildObsRightsModel().permissions.map(item => item.key), routeBuild: BUILD
  };
}

function buildObsRoutesSummary() {
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    inventoryReadOnlyPrepared: true,
    inventorySourcePrepared: true,
    inventorySourceMode: INVENTORY_SOURCE_MODE,
    obsInventoryUiDisplayPrepared: true,
    obsLiveStateReadOnlyPrepared: true,
    obsInventorySyncReadOnlyPrepared: true,
    obsInventorySyncRoute: OBS_AGENT_INVENTORY_STATUS_PATH,
    obsAllowlistRightsModelPrepared: true,
    allowlistModel: buildObsAllowlistModel(),
    rightsModel: buildObsRightsModel(),
    productiveSceneFilterPrepared: true,
    plannedPermissions: buildObsRightsModel().permissions.map(item => item.key),
    routes: [
      { method: 'GET', path: OBS_STATUS_PATH, description: 'OBS Mod-Ansicht mit Live-State und Inventory-Sync read-only; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: OBS_MODEL_PATH, description: 'OBS read-only Modell inklusive produktiver Szenen-Regel, Allowlist- und Rechte-Zielbild; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: OBS_AGENT_LIVE_STATUS_PATH, description: 'Online read-only OBS-Live-State aus Agent-WSS Memory; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: OBS_AGENT_INVENTORY_STATUS_PATH, description: 'Online read-only OBS-Szenen/Audio/Quellen aus Agent-WSS Inventory-Sync Memory; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true }
    ],
    safety: buildObsSafety()
  };
}

function decorateStatusPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const page = buildObsModuleMetadataPage();
  const moduleMetadata = payload.moduleMetadata && typeof payload.moduleMetadata === 'object' ? payload.moduleMetadata : { prepared: true, modules: [], pages: [] };
  const pages = Array.isArray(moduleMetadata.pages) ? moduleMetadata.pages.slice() : [];
  const existingIndex = pages.findIndex(item => item && item.pageId === 'obs');
  if (existingIndex >= 0) pages[existingIndex] = { ...pages[existingIndex], ...page };
  else pages.push(page);
  payload.moduleMetadata = { ...moduleMetadata, pages, obsReadOnlyPagePrepared: true, obsReadOnlyStatusRoutePrepared: true, obsInventoryReadOnlyPrepared: true, obsInventorySyncReadOnlyPrepared: true, obsInventorySyncRoute: OBS_AGENT_INVENTORY_STATUS_PATH, obsLiveStateReadOnlyPrepared: true, obsLiveStateRoute: OBS_AGENT_LIVE_STATUS_PATH, obsAllowlistRightsModelPrepared: true, obsProductiveSceneFilterPrepared: true, obsReadOnlyRouteBuild: BUILD };
  payload.obsReadOnly = buildObsRoutesSummary();
  return payload;
}

function decorateRoutesPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const routes = Array.isArray(payload.routes) ? payload.routes.slice() : [];
  for (const route of buildObsRoutesSummary().routes) {
    if (!routes.some(item => item && item.method === route.method && item.path === route.path)) routes.push(route);
  }
  payload.routes = routes;
  payload.obsReadOnly = buildObsRoutesSummary();
  return payload;
}

function clonePlain(value) { return JSON.parse(JSON.stringify(value)); }
function wrapJsonForPath(res, decorator) { const originalJson = res.json.bind(res); res.json = (payload) => originalJson(decorator(payload)); }
function installObsReadonlyResponseDecorators(app) { app.use((req, res, next) => { if (req.method === 'GET' && req.path === '/api/remote/status') wrapJsonForPath(res, decorateStatusPayload); if (req.method === 'GET' && req.path === '/api/remote/routes') wrapJsonForPath(res, decorateRoutesPayload); next(); }); }
function registerObsReadonlyRoutes(app, context = {}) { app.get(OBS_STATUS_PATH, (req, res) => res.json(buildObsReadonlyPayload(context))); app.get(OBS_MODEL_PATH, (req, res) => res.json(buildObsReadonlyPayload(context))); app.get(OBS_AGENT_LIVE_STATUS_PATH, (req, res) => res.json(buildAgentObsLiveStatusResponse())); app.get(OBS_AGENT_INVENTORY_STATUS_PATH, (req, res) => res.json(buildAgentObsInventoryStatusResponse())); }

module.exports = { BUILD, STATUS_API_VERSION, OBS_STATUS_PATH, OBS_MODEL_PATH, OBS_AGENT_LIVE_STATUS_PATH, OBS_AGENT_INVENTORY_STATUS_PATH, buildObsReadonlyPayload, buildObsAllowlistModel, buildObsRightsModel, buildPreparedInventory, buildObsModuleMetadataPage, buildObsRoutesSummary, decorateStatusPayload, decorateRoutesPayload, installObsReadonlyResponseDecorators, registerObsReadonlyRoutes };
