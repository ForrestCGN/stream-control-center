// modules/diagnostics.js — /diag/* routes moved out of core
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');

const MODULE_VERSION = '0.2.0';

const DIAGNOSTICS_REGISTRY_VERSION = 1;

const DIAGNOSTICS_REGISTRY = [
  { key: 'birthday', label: 'Birthday', group: 'community', status: '/api/birthday/status', today: '/api/birthday/today', showState: '/api/birthday/show/state' },
  { key: 'todo', label: 'Todo', group: 'community', status: '/api/todo/status', integration: '/api/todo/integration-check' },
  { key: 'tagebuch', label: 'Tagebuch', group: 'community', status: '/api/tagebuch/status', integration: '/api/tagebuch/integration-check' },
  { key: 'hug', label: 'Hug-System', group: 'community', status: '/api/hug/status' },
  { key: 'commands', label: 'Commands', group: 'community', status: '/api/commands/status' },
  { key: 'message_rotator', label: 'Message-Rotator', group: 'system', status: '/api/message-rotator/status' },
  { key: 'bus_diagnostics', label: 'Bus-Diagnose', group: 'admin', status: '/api/bus-diagnostics/status' },
  { key: 'communication_bus', label: 'Communication-Bus', group: 'admin', status: '/api/communication/status' },
  { key: 'overlay_monitor', label: 'Overlay-Monitor', group: 'control', status: '/api/overlay-monitor/status' },
  { key: 'obs', label: 'OBS', group: 'control', status: '/api/obs/status' },
  { key: 'sound_system', label: 'Sound-System', group: 'system', status: '/api/sound/status' },
  { key: 'media', label: 'Medienverwaltung', group: 'system', status: '/api/media/status' },
  { key: 'vip', label: 'VIP-System', group: 'community', status: '/api/vip-sound/status' },
  { key: 'alerts', label: 'Alerts', group: 'control', status: '/api/alerts/status' }
];

function registryRows() {
  return DIAGNOSTICS_REGISTRY.map((entry, index) => ({
    order: index + 1,
    enabled: true,
    ...entry
  }));
}

function buildRegistryResponse(getLoadedModules) {
  let loadedModules = [];
  try {
    const raw = typeof getLoadedModules === 'function' ? getLoadedModules() : [];
    loadedModules = Array.isArray(raw) ? raw : [];
  } catch (_) {
    loadedModules = [];
  }

  return {
    ok: true,
    module: MODULE_META.name,
    moduleVersion: MODULE_VERSION,
    version: MODULE_VERSION,
    registryVersion: DIAGNOSTICS_REGISTRY_VERSION,
    source: 'backend_static_registry',
    generatedAt: core.nowIso(),
    entries: registryRows(),
    counts: {
      entries: DIAGNOSTICS_REGISTRY.length,
      loadedModules: loadedModules.length
    },
    loadedModules
  };
}

const MODULE_META = {
  name: 'diagnostics',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'diagnostics',
  routesPrefix: ['/diag', '/api/diag', '/api/diagnostics'],
  bus: {
    emits: [],
    listens: [],
    heartbeat: false
  },
  legacy: false
};

module.exports.init = function init(ctx) {
  const { app, env, getLoadedModules, wss } = ctx;

  routes.registerGet(app, ['/diag/ping', '/api/diag/ping'], (req, res) => res.json({ ok: true, ts: Date.now(), isoTs: core.nowIso() }));
  routes.registerGet(app, ['/diag/env', '/api/diag/env'], (req, res) => res.json({
    loaded_from: env.ENV_LOADED_FROM || null,
    host: env.HOST || 'localhost',
    port: core.intParam(env.PORT, 8080),
    cwd: process.cwd(),
    modules: getLoadedModules(),
  }));
  routes.registerGet(app, ['/diag/ws', '/api/diag/ws'], (req, res) => res.json({ clients: wss.clients.size, ts: Date.now(), isoTs: core.nowIso() }));

  routes.registerGet(app, ['/api/diagnostics/registry', '/diag/registry', '/api/diag/registry'], (req, res) => res.json(buildRegistryResponse(getLoadedModules)));

  console.log(`[${MODULE_META.name}] v${MODULE_VERSION} /diag/*, /api/diag/* und /api/diagnostics/registry aktiv`);
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
