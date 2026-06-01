// modules/credits.js — Proxy zu Legacy-Credits-Service mit CORS
// Standard: CREDITS_URL=http://127.0.0.1:7474/GetCredits
const axios = require('axios');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');

const MODULE_NAME = 'credits';
const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'community',
  legacy: false,
  routesPrefix: ['/credits', '/api/credits'],
  bus: {
    publishes: [],
    consumes: []
  },
  description: 'Credits proxy runtime for legacy credits service'
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const CREDITS_URL = core.pickFirst(env.CREDITS_URL, 'http://127.0.0.1:7474/GetCredits');
  const CREDITS_TIMEOUT_MS = core.intParam(env.CREDITS_TIMEOUT_MS, 5000);

  routes.registerGet(app, ['/credits', '/api/credits'], async (req, res) => {
    try {
      const response = await axios.get(CREDITS_URL, { timeout: CREDITS_TIMEOUT_MS });
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.json(response.data);
    } catch (error) {
      console.error('Fehler beim Abrufen der Credits:', error?.message || error);
      res.status(500).json({ error: 'Credits konnten nicht geladen werden' });
    }
  });

  console.log(`[credits] Proxy aktiv → ${CREDITS_URL}`);
};
