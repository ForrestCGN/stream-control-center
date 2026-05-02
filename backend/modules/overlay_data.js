const fs = require("fs");
const path = require("path");

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

  console.log("[overlay_data] /api/overlay/start-data aktiv");
}

module.exports = { init };

