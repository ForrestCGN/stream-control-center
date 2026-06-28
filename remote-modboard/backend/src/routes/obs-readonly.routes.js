'use strict';

const STATUS_API_VERSION = 'rdap_obs_readonly_online_status_0214c.v1';
const BUILD = 'RDAP_0.2.14C_OBS_READONLY_ONLINE_STATUS_FIX';
const OBS_STATUS_PATH = '/api/remote/local-dashboard/obs/status';
const OBS_MODEL_PATH = '/api/remote/local-dashboard/obs/model';

function buildObsReadonlyPayload(context = {}) {
  const runtimeMode = context && context.config && context.config.runtimeMode ? String(context.config.runtimeMode) : 'online';
  const generatedAt = new Date().toISOString();

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_obs_readonly',
    moduleVersion: context.appVersion || '0.2.14C',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    generatedAt,
    runtimeMode,
    readOnly: true,
    prepared: true,
    active: false,
    status: 'readonly_online_placeholder',
    localDashboard: runtimeMode === 'local',
    remoteAgent: {
      checked: true,
      connected: false,
      actionsEnabled: false,
      productiveActionsEnabled: false,
      safeReadOnly: true,
      note: 'Online-Backend stellt nur einen read-only OBS-Status fuer die UI bereit. Agent-Actions bleiben deaktiviert.'
    },
    obs: {
      available: true,
      status: 'not_reachable',
      reachable: false,
      name: 'OBS',
      port: 4455,
      checkedAt: generatedAt,
      detail: 'Online read-only Placeholder: Das Webserver-Backend baut keine OBS-WebSocket-Verbindung auf und sendet keine OBS-Kommandos. Echte Inventar-/Komponentenwerte folgen in einem separaten read-only Step.',
      readOnly: true,
      controlEnabled: false,
      noAuthenticationAttempt: true,
      noObsRequestSent: true,
      lastError: null
    },
    inventory: {
      prepared: true,
      active: false,
      scenes: [],
      sources: [],
      audioSources: [],
      currentScene: null,
      note: 'OBS-Inventar ist vorbereitet, aber online noch nicht aktiv. Keine Szenen-/Quellen-/Audio-Abfrage in diesem Step.'
    },
    plannedReadOnlyEndpoints: [OBS_STATUS_PATH, OBS_MODEL_PATH],
    plannedActionsStillDisabled: [
      'obs.scene.switch',
      'obs.source.visibility.set',
      'obs.input.mute.set',
      'obs.media.stop',
      'obs.refresh'
    ],
    safety: buildObsSafety(),
    note: '0.2.14C synchronisiert Online-Backend-Status und Routes mit der sichtbaren OBS-read-only UI. Keine OBS-Actions, keine Agent-Actions, keine Writes.'
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
    noObsRequestSentByBackend: true,
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
    routeBuild: BUILD
  };
}

function buildObsRoutesSummary() {
  return {
    prepared: true,
    routeBuild: BUILD,
    statusApiVersion: STATUS_API_VERSION,
    routes: [
      { method: 'GET', path: OBS_STATUS_PATH, description: 'OBS read-only Status fuer die sichtbare UI; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true },
      { method: 'GET', path: OBS_MODEL_PATH, description: 'OBS read-only Modell fuer die sichtbare UI; keine OBS-Kommandos, keine Agent-Actions, keine Writes', readOnly: true }
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
  if (!pages.some(item => item && item.pageId === 'obs')) pages.push(page);

  payload.moduleMetadata = {
    ...moduleMetadata,
    pages,
    obsReadOnlyPagePrepared: true,
    obsReadOnlyStatusRoutePrepared: true,
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
  buildObsModuleMetadataPage,
  buildObsRoutesSummary,
  decorateStatusPayload,
  decorateRoutesPayload,
  installObsReadonlyResponseDecorators,
  registerObsReadonlyRoutes
};
