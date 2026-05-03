"use strict";

/**
 * Central database status module.
 *
 * Laedt die zentrale Core-Datenbank-Schicht und stellt Diagnose bereit.
 */

const database = require("../core/database");
const routes = require("./helpers/helper_routes");

function init(ctx) {
  database.init(ctx);

  routes.registerGet(ctx.app, ["/api/database/status", "/api/system/database/status"], (req, res) => {
    res.json(database.status());
  });

  return { name: "database_core", step: "013" };
}

module.exports = { init };
