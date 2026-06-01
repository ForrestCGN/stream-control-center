const fs = require("fs");
const path = require("path");

const MODULE_NAME = "overlay_data";
const MODULE_VERSION = "0.1.0";
const MODULE_BUILD = "step278-meta";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "overlay",
  description: "Start overlay data endpoint for stream and game background data.",
  routesPrefix: ["/api/overlay/start-data"],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

function readJsonSafe(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function init({ app, paths }) {
  const rootDir =
    paths?.ROOT_DIR ||
    process.env.STREAM_ASSETS_ROOT ||
    "D:\\Streaming\\stramAssets";

  const overlayDataDir = path.join(rootDir, "data", "overlay");

  const channelOverlayFile = path.join(overlayDataDir, "twitch_channel_overlay.json");
  const gameBackgroundsFile = path.join(overlayDataDir, "game_backgrounds.json");

  app.get("/api/overlay/start-data", (req, res) => {
    const stream = readJsonSafe(channelOverlayFile, {});
    const backgrounds = readJsonSafe(gameBackgroundsFile, {});

    res.json({
      ok: true,
      route: "/api/overlay/start-data",
      stream,
      backgrounds,
      ts: Date.now()
    });
  });

  console.log(`[${MODULE_NAME}] /api/overlay/start-data aktiv`);
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init };

