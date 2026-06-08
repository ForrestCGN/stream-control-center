// modules/diagnostics.js — /diag/* routes moved out of core
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');

const MODULE_VERSION = '0.2.4';

const DIAGNOSTICS_REGISTRY_VERSION = 3;

const REGISTRY_KEY_ALIASES = {
  alert_system: 'alerts',
  alerts: 'alerts',
  vip_sound_overlay: 'vip',
  'vip-sound': 'vip',
  vip: 'vip',
  vip30: 'vip30',
  'vip30-system': 'vip30',
  sound: 'sound_system',
  sound_system: 'sound_system',
  message_rotator: 'message_rotator',
  communication_bus: 'communication_bus',
  overlay_monitor: 'overlay_monitor',
  bus_diagnostics: 'bus_diagnostics',
  obs: 'obs',
  media: 'media',
  birthday: 'birthday',
  hug: 'hug',
  commands: 'commands',
  todo: 'todo',
  tagebuch: 'tagebuch',
  loyalty_games: 'loyalty_games'
};

const REGISTRY_COVERAGE_EXCLUDE = new Set([
  'diagnostics',
  'sectionhome',
  'controlhome',
  'streamdesk',
  'clips',
  'shoutout',
  'twitch_events',
  'overlays',
  'adminconfigs',
  'sound_level',
  'soundalerts',
  'tts',
  'deathcounter',
  'loyalty',
  'channelpoints'
]);

function cleanKey(value) {
  let key = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  if (key.endsWith('_js')) key = key.slice(0, -3);
  return key;
}

function normalizeLoadedModuleName(item) {
  if (!item) return '';
  if (typeof item === 'string') return cleanKey(item);
  return cleanKey(item.name || item.module || item.key || item.id || item.moduleName || '');
}

function toRegistryKey(name) {
  const clean = cleanKey(name);
  return REGISTRY_KEY_ALIASES[clean] || clean;
}

function buildRegistryCoverage(loadedModules, entries) {
  const registryKeys = new Set(entries.map(entry => cleanKey(entry.key)).filter(Boolean));
  const loadedNames = [];
  const coveredLoadedModules = [];
  const missingLoadedModules = [];

  for (const item of loadedModules || []) {
    const rawName = normalizeLoadedModuleName(item);
    if (!rawName) continue;
    const registryKey = toRegistryKey(rawName);
    const row = { name: rawName, registryKey };
    loadedNames.push(row);

    if (registryKeys.has(registryKey)) {
      coveredLoadedModules.push(row);
    } else if (!REGISTRY_COVERAGE_EXCLUDE.has(registryKey) && REGISTRY_KEY_ALIASES[registryKey]) {
      missingLoadedModules.push(row);
    }
  }

  const loadedRegistryKeys = new Set(coveredLoadedModules.map(item => item.registryKey).filter(Boolean));
  const registryOnlyEntries = entries
    .filter(entry => !loadedRegistryKeys.has(cleanKey(entry.key)))
    .map(entry => ({ key: cleanKey(entry.key), label: entry.label || entry.key, status: entry.status || '' }));

  return {
    ok: missingLoadedModules.length === 0,
    registryEntries: entries.length,
    loadedModules: loadedNames.length,
    coveredLoadedModules: coveredLoadedModules.length,
    missingLoadedModules: missingLoadedModules.length,
    registryOnlyEntries: registryOnlyEntries.length,
    missingLoadedModuleRows: missingLoadedModules,
    registryOnlyRows: registryOnlyEntries
  };
}

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
  { key: 'vip30', label: '30 Tage VIP', group: 'community', status: '/api/vip30/status', health: '/api/vip30/health', slots: '/api/vip30/slots', logs: '/api/vip30/logs', stats: '/api/vip30/stats' },
  { key: 'loyalty_games', label: 'Loyalty Games', group: 'community', status: '/api/loyalty/games/status' },
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

  const entries = registryRows();
  const coverage = buildRegistryCoverage(loadedModules, entries);

  return {
    ok: true,
    module: MODULE_META.name,
    moduleVersion: MODULE_VERSION,
    version: MODULE_VERSION,
    registryVersion: DIAGNOSTICS_REGISTRY_VERSION,
    source: 'backend_static_registry_with_coverage',
    generatedAt: core.nowIso(),
    entries,
    counts: {
      entries: entries.length,
      loadedModules: loadedModules.length,
      coveredLoadedModules: coverage.coveredLoadedModules,
      missingLoadedModules: coverage.missingLoadedModules,
      registryOnlyEntries: coverage.registryOnlyEntries
    },
    coverage,
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
