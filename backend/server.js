/**
 * ForrestCGN â€“ Local Overlay & API Server
 * Stable baseline version (Node.js + Express)
 * Port: 8080
 */

const paths = require("./core/paths");
require("dotenv").config({ path: paths.ENV_FILE });

const path = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 8080;

// --------------------------------------------------
// Basic Express setup
// --------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Phase 1A: secured public paths only)
// Important:
// - htdocs/scripts, htdocs/tokens and internal project folders are blocked.
// - /data stays temporarily public for legacy overlay JSON compatibility.
// - Do not remove /data yet; migrate overlay JSON reads later to API/state routes.
const WEBROOT_DIR = paths.WEBROOT_DIR;
const PUBLIC_STATIC_OPTIONS = { index: false, dotfiles: "deny" };

function blockInternalPath(req, res) {
  res.status(403).json({
    ok: false,
    error: "blocked_internal_path"
  });
}

app.use([
  "/scripts",
  "/tokens",
  "/config",
  "/secrets",
  "/backend",
  "/archive",
  "/docs"
], blockInternalPath);

app.use("/overlays", express.static(paths.OVERLAYS_DIR, PUBLIC_STATIC_OPTIONS));
app.use("/assets", express.static(paths.ASSETS_DIR, PUBLIC_STATIC_OPTIONS));
app.use("/alerts", express.static(paths.ALERTS_DIR, PUBLIC_STATIC_OPTIONS));
app.use("/dashboard", express.static(paths.DASHBOARD_DIR, PUBLIC_STATIC_OPTIONS));
app.use("/public", express.static(paths.PUBLIC_DIR, PUBLIC_STATIC_OPTIONS));

app.get(["/dashboard", "/dashboard/"], (req, res) => {
  const dashboardIndex = path.join(paths.DASHBOARD_DIR, "index.html");
  if (fs.existsSync(dashboardIndex)) return res.sendFile(dashboardIndex);
  res.status(404).json({ ok: false, error: "dashboard_index_not_found" });
});

// Legacy compatibility: several existing overlays may still fetch JSON from /data.
// Keep for now; later migrate to explicit API routes or data/state endpoints.
app.use("/data", express.static(paths.LEGACY_HTDOCS_DATA_DIR, PUBLIC_STATIC_OPTIONS));

// Root helper files that were previously available through broad htdocs static hosting.
app.get("/", (req, res) => {
  const indexFile = paths.INDEX_FILE;
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(404).json({ ok: false, error: "not_found" });
});

app.get("/ws-client.js", (req, res) => {
  const wsClientFile = paths.WS_CLIENT_FILE;
  if (fs.existsSync(wsClientFile)) return res.sendFile(wsClientFile);
  res.status(404).json({ ok: false, error: "not_found" });
});


// --------------------------------------------------
// Simple status endpoint
// --------------------------------------------------
app.get("/api/_status", (req, res) => {
  res.json({
    ok: true,
    host: "localhost",
    port: PORT,
    envLoadedFrom: paths.ENV_FILE,
    rootDir: paths.ROOT_DIR,
    webrootDir: paths.WEBROOT_DIR,
    modulesDir,
    modules: loadedModules,
    wsClients: wss.clients.size
  });
});

// --------------------------------------------------
// WebSocket broadcast helper
// --------------------------------------------------
function broadcastWS(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

// --------------------------------------------------
// Fireworks API (used by Streamer.bot Fetch URL)
// --------------------------------------------------
app.get("/api/fireworks", (req, res) => {
  const intensity = Number(req.query.intensity || 10);
  const duration_ms = Number(req.query.duration_ms || 8000);
  const mode = String(req.query.mode || "burst");

  broadcastWS({
    op: "fireworks",
    intensity,
    duration_ms,
    mode
  });

  res.json({
    ok: true,
    intensity,
    duration_ms,
    mode
  });
});

app.get("/api/fireworks/stop", (req, res) => {
  broadcastWS({ op: "fireworks_stop" });
  res.json({ ok: true });
});

app.get("/api/fireworks/clear", (req, res) => {
  broadcastWS({ op: "fireworks_clear" });
  res.json({ ok: true });
});

// --------------------------------------------------
// WebSocket connection logging
// --------------------------------------------------
wss.on("connection", ws => {
  console.log("[WS] client connected");

  ws.on("close", () => {
    console.log("[WS] client disconnected");
  });
});

// --------------------------------------------------
// Load modules (old behaviour preserved)
// --------------------------------------------------
const modulesDir = paths.CURRENT_MODULES_DIR;
const loadedModules = [];

if (fs.existsSync(modulesDir)) {
  fs.readdirSync(modulesDir).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const mod = require(path.join(modulesDir, file));
      if (typeof mod.init === "function") {
        mod.init({
          app,
          server,
          wss,
          env: process.env,
          broadcastWS,
          getLoadedModules: () => [...loadedModules]
        });
        loadedModules.push(file);
        console.log(`[module] loaded: ${file}`);
      }
    } catch (err) {
      console.error(`[module] FAILED: ${file}`);
      console.error(err.message);
    }
  });
}

// --------------------------------------------------
// Start server
// --------------------------------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`======================================`);
  console.log(` ForrestCGN Local Server running`);
  console.log(` http://127.0.0.1:${PORT}`);
  console.log(`======================================`);
});


