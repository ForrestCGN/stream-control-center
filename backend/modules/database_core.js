"use strict";

/**
 * Central database status module.
 *
 * Laedt die zentrale Core-Datenbank-Schicht und stellt Diagnose bereit.
 */

const database = require("../core/database");
const routes = require("./helpers/helper_routes");

const MODULE_VERSION = '0.1.3';
const MODULE_META = {
  name: 'database_core',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'core',
  routesPrefix: ['/api/database/status', '/api/system/database/status'],
  bus: {
    emits: [],
    listens: [],
    heartbeat: false
  },
  legacy: false
};

function init(ctx) {
  database.init(ctx);

  routes.registerGet(ctx.app, ["/api/database/status", "/api/system/database/status"], (req, res) => {
    res.json(database.status());
  });

  return { name: MODULE_META.name, version: MODULE_VERSION, step: "013" };
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init };
