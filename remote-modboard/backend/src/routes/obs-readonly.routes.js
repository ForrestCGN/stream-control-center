'use strict';

const STATUS_API_VERSION = 'rdap_obs_local_inventory_source_0216.v1';
const BUILD = 'RDAP_0.2.16_LOCAL_OBS_INVENTORY_SOURCE_READONLY_PREPARED';
const OBS_STATUS_PATH = '/api/remote/local-dashboard/obs/status';
const OBS_MODEL_PATH = '/api/remote/local-dashboard/obs/model';
const INVENTORY_SOURCE_MODE = 'local_adapter_remote_agent_component_status';

function buildObsReadonlyPayload(context = {}) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_obs_readonly',
    moduleVersion: context.appVersion || '0.2.16',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: false,
    status: 'readonly_local_inventory_source_prepared',
    localDashboard: runtimeMode === 'local',
    remoteAgent: {
      checked: true,
      connected: false,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      safeReadOnly: true,
      componentStatusSourcePrepared: true,
      inventorySourceMode: INVENTORY_SOURCE_MODE,
      note: 'Online-Backend stellt nur OBS-read-only Status und Inventar-Modell fuer die UI bereit. Echte lokale Datenquelle ist fuer den lokalen Adapter/remote_agent-Komponentenstatus vorbereitet; Agent-Actions bleiben deaktiviert.'
    },
    obs: {
      available: true,
      status: 'not_reachable',
      reachable: false,
      name: 'OBS',
      port: 4455,
      checkedAt: generatedAt,
      detail: 'Online read-only Placeholder: Das Webserver-Backend baut keine OBS-WebSocket-Verbindung auf, liest kein echtes OBS-Inventar aus und sendet keine OBS-Kommandos. Lokale Inventarquelle ist nur als read-only Quelle ueber Adapter/remote_agent vorbereitet.',
      readOnly: true,
      controlEnabled: false,
      noAuthenticationAttempt: true,
      noObsRequestSent: true,
      noObsInventoryRequestSent: true,
      lastError: null
    },
    inventory: buildPreparedInventory(generatedAt),
    plannedReadOnlyEndpoints: [OBS_STATUS_PATH, OBS_MODEL_PATH],
    plannedActionsStillDisabled: [
      'obs.scene.switch',
      'obs.source.visibility.set',
      'obs.input.mute.set',
      'obs.media.stop',
      'obs.refresh'
    ],
    safety: buildObsSafety(),
    note: '0.2.16 bereitet die lokale OBS-Inventarquelle read-only ueber lokalen Adapter/remote_agent-Komponentenstatus vor. Keine echte OBS-Inventar-Abfrage, keine OBS-Actions, keine Agent-Actions, keine Writes.'
  };
}

function buildPreparedInventory(generatedAt) {
  return {
    prepared: true,
    active: false,
    status: 'source_prepared_empty',
    checkedAt: generatedAt,
    sourcePrepared: true,
    sourceActive: false,
    sourceMode: INVENTORY_SOURCE_MODE,
    sourceRoute: '/api/remote-agent/status',
    sourceField: 'componentStatus.obs.inventory',
    currentScene: null,
    scenes: [],
    sources: [],
    audioSources: [],
    groups: {
      scenes: { prepared: true, active: false, count: 0, items: [] },
      sources: { prepared: true, active: false, count: 0, items: [] },
      audioSources: { prepared: true, active: false, count: 0, items: [] }
    },
    counts: {
      scenes: 0,
      sources: 0,
      audioSources: 0,
      total: 0
    },
    capabilities: {
      sceneInventoryReadPrepared: true,
      sourceInventoryReadPrepared: true,
      audioInventoryReadPrepared: true,
      currentSceneReadPrepared: true,
      localInventorySourcePrepared: true,
      localAdapterSourcePrepared: true,
      remoteAgentComponentStatusSourcePrepared: true,
      realObsInventoryReadActive: false,
      obsWebSocketRequestsEnabled: false,
      actionsEnabled: false,
      controlEnabled: false
    },
    emptyReason: 'local_obs_inventory_source_prepared_but_real_obs_inventory_read_not_enabled_in_0_2_16',
    note: 'Lokale OBS-Inventarquelle ist read-only vorbereitet. Echte Szenen-/Quellen-/Audio-Abfrage ist noch nicht aktiv und folgt separat ohne Steuer-Actions.'
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
    localInventorySourcePrepared: true,
    realObsInventoryReadActive: false,
    noObsRequestSentByBackend: true,
    noObsInventoryRequestSentByBackend: true,
    noAgentActionExecution: true,
    noStreamingPcActionExecution: true,
    noFileWrite: true,
    noDatabaseWrite: true,
    noShellOrProcessActions: true
  };
}

function buildObsModuleMetadataPage() {
  return {
    pageId: 'obs',
    label: 'OBS',
    moduleId: 'system',
    runtime: 'both',
    permission: 'remote.view',
    title: 'OBS Status',
    tab: 'read-only',
    readOnly: true,
    inventoryReadOnlyPrepared: true,
    localInventorySourcePrepared: true,
    routeBuild: BUILD
  };
}

function buildObsRoutesSummary() {
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    inventoryReadOnlyPrepared: true,
    localInventorySourcePrepared: true,
    localInventorySourceMode: INVENTORY_SOURCE_MODE,
    routes: [
      { method: 'GET', path: OBS_STATUS_PATH, description: 'OBS read-only Status und lokale Inventarquelle vorbereitet; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: OBS_MODEL_PATH, description: 'OBS read-only Modell inklusive lokaler Inventarquellen-Struktur; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true }
    ],
    safety: buildObsSafety()
  };
}

function decorateStatusPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const page = buildObsModuleMetadataPage();
  const moduleMetadata = payload.moduleMetadata && typeof payload.moduleMetadata === 'object'
    ? payload.moduleMetadata
    : { prepared: true, modules: [], pages: [] };

  const pages = Array.isArray(moduleMetadata.pages) ? moduleMetadata.pages.slice() : [];
  const existingIndex = pages.findIndex(item => item && item.pageId === 'obs');
  if (existingIndex >= 0) pages[existingIndex] = { ...pages[existingIndex], ...page };
  else pages.push(page);

  payload.moduleMetadata = {
    ...moduleMetadata,
    pages,
    obsReadOnlyPagePrepared: true,
    obsReadOnlyStatusRoutePrepared: true,
    obsInventoryReadOnlyPrepared: true,
    obsLocalInventorySourcePrepared: true,
    obsLocalInventorySourceMode: INVENTORY_SOURCE_MODE,
    obsReadOnlyRouteBuild: BUILD
  };

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

function wrapJsonForPath(res, decorator) {
  const originalJson = res.json.bind(res);
  res.json = (payload) => originalJson(decorator(payload));
}

function installObsReadonlyResponseDecorators(app) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/remote/status') wrapJsonForPath(res, decorateStatusPayload);
    if (req.method === 'GET' && req.path === '/api/remote/routes') wrapJsonForPath(res, decorateRoutesPayload);
    next();
  });
}

function registerObsReadonlyRoutes(app, context = {}) {
  app.get(OBS_STATUS_PATH, (req, res) => res.json(buildObsReadonlyPayload(context)));
  app.get(OBS_MODEL_PATH, (req, res) => res.json(buildObsReadonlyPayload(context)));
}

module.exports = {
  BUILD,
  STATUS_API_VERSION,
  OBS_STATUS_PATH,
  OBS_MODEL_PATH,
  buildObsReadonlyPayload,
  buildPreparedInventory,
  buildObsModuleMetadataPage,
  buildObsRoutesSummary,
  decorateStatusPayload,
  decorateRoutesPayload,
  installObsReadonlyResponseDecorators,
  registerObsReadonlyRoutes
};
