'use strict';

// modules/fireworks_api.js — /api/fireworks -> wsBroadcast({op:"fireworks", ...})
const core = require('./helpers/helper_core');

const MODULE_VERSION = '0.1.0';

const MODULE_META = {
  name: 'fireworks_api',
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'effects',
  legacy: false,
  description: 'Fireworks API bridge for Streamer.bot GET triggers and overlay WebSocket broadcasts.',
  routesPrefix: ['/api/fireworks'],
  bus: {
    publishes: ['fireworks', 'fireworks_stop', 'fireworks_clear'],
    subscribes: []
  }
};

function init(ctx) {
  const { app, wsBroadcast } = ctx;

  function clampInt(v, min, max, fallback) {
    const n = core.intParam(v, fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function normMode(m) {
    m = String(m || "burst").toLowerCase();
    const allowed = new Set(["burst", "finale", "heart", "heart_big", "ground"]);
    return allowed.has(m) ? m : "burst";
  }

  // Streamer.bot 1.0.1 friendly: GET via Fetch URL
  app.get("/api/fireworks", (req, res) => {
    const intensity   = clampInt(core.getParam(req, "intensity", 10), 1, 50, 10);
    const duration_ms = clampInt(core.getParam(req, "duration_ms", 8000), 300, 60000, 8000);
    const mode        = normMode(core.getParam(req, "mode", "burst"));

    wsBroadcast({ op: "fireworks", intensity, duration_ms, mode });
    res.json({ ok: true, intensity, duration_ms, mode });
  });

  // optional helpers
  app.get("/api/fireworks/stop", (req, res) => {
    wsBroadcast({ op: "fireworks_stop" });
    res.json({ ok: true });
  });

  app.get("/api/fireworks/clear", (req, res) => {
    wsBroadcast({ op: "fireworks_clear" });
    res.json({ ok: true });
  });

  console.log(`[${MODULE_META.name}] v${MODULE_VERSION} /api/fireworks ready`);
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init
};
