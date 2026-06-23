'use strict';

let routes = null;
try {
  routes = require('./helpers/helper_routes');
} catch (err) {
  routes = null;
}

const MODULE = 'remote_agent';
const MODULE_VERSION = '0.0.1';
const MODULE_BUILD = 'RDAP3A_DASHUI7_READONLY_STATUS';
const STATUS_API_VERSION = 'rdap3a.v1';
const LOADED_AT = new Date().toISOString();

const MODULE_META = {
  name: MODULE,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'remote-dashboard',
  description: 'Read-only Remote-Agent status contract for Dashboard-v2. No WSS agent runtime and no productive actions in RDAP3A.',
  routesPrefix: ['/api/remote-agent'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

const CAPABILITIES = Object.freeze({
  status: true,
  ping: false,
  statusRequest: false,
  obsControl: false,
  soundControl: false,
  overlayControl: false,
  mediaWrite: false,
  textConfigWrite: false,
  commandControl: false,
  databaseWrite: false,
  fileWrite: false,
  shell: false,
  processControl: false
});

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/remote-agent/status', (req, res) => {
    res.json(buildStatusResponse());
  });

  registerGet(app, '/api/remote-agent/routes', (req, res) => {
    res.json(buildRoutesResponse());
  });

  console.log(`[remote_agent] ${MODULE_BUILD} read-only status route registered. No agent actions enabled.`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}

function buildStatusResponse() {
  const now = new Date().toISOString();

  return {
    ok: true,
    module: MODULE,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    productiveAgentRuntime: false,
    generatedAt: now,
    loadedAt: LOADED_AT,
    status: {
      connected: false,
      connectionState: 'offline',
      reason: 'rdap3a_no_agent_runtime_yet',
      lastSeenAt: null,
      connectedSince: null,
      heartbeatAgeMs: null,
      reconnectCount: 0,
      stale: false
    },
    agent: {
      agentId: null,
      agentName: null,
      agentVersion: null,
      protocolVersion: STATUS_API_VERSION,
      expectedAgentId: 'stream-pc-main',
      expectedAgentName: 'Forrest Stream-PC'
    },
    host: {
      dashboardServer: 'local-stream-control-center',
      hostname: safeHostname(),
      platform: process.platform,
      nodeVersion: process.version,
      processUptimeSec: Math.floor(process.uptime()),
      localTime: now
    },
    remoteTarget: {
      publicDashboardUrl: 'https://mods.forrestcgn.de',
      plannedTransport: 'wss',
      plannedWsPath: '/agent-ws',
      streamPcPublicPortRequired: false
    },
    capabilities: { ...CAPABILITIES },
    safety: {
      noSoundControl: true,
      noObsControl: true,
      noOverlayControl: true,
      noMediaWrite: true,
      noTextConfigWrite: true,
      noCommandsOrChannelpoints: true,
      noDatabaseWrite: true,
      noFileWrite: true,
      noShellOrProcessActions: true
    },
    warnings: [
      'RDAP3A ist nur der read-only API-Vertrag plus Dashboard-Anzeige.',
      'Es existiert in diesem Step noch kein produktiver WSS-Agent.'
    ],
    errors: []
  };
}

function buildRoutesResponse() {
  return {
    ok: true,
    module: MODULE,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    readOnly: true,
    routes: [
      {
        method: 'GET',
        path: '/api/remote-agent/status',
        description: 'Read-only Remote-Agent Status. Liefert echten Offline-Startzustand und fuehrt keine Aktionen aus.'
      },
      {
        method: 'GET',
        path: '/api/remote-agent/routes',
        description: 'Read-only Routenuebersicht fuer RDAP3A.'
      }
    ]
  };
}

function safeHostname() {
  try {
    return require('os').hostname();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  buildStatusResponse
};
