// modules/diagnostics.js — /diag/* routes moved out of core
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');

const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: 'diagnostics',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'diagnostics',
  routesPrefix: ['/diag', '/api/diag'],
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

  console.log(`[${MODULE_META.name}] v${MODULE_VERSION} /diag/* und /api/diag/* aktiv`);
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
