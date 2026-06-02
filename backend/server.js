/**
 * ForrestCGN – Local Overlay & API Server
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

const SERVER_VERSION = "0.1.2-can31-1-ws-log-summary";
const MODULE_LOADER_DIAGNOSTICS_VERSION = "0.1.1";
const WS_LOG_SUMMARY_VERSION = "0.1.0";

// --------------------------------------------------
// STEP278 / CAN-28.1 loader/route diagnostics
// --------------------------------------------------
// Diagnostic-only layer. It does not change module loading behaviour.
// It records which owner registered which HTTP route and warns about duplicates.
const routeRegistry = [];
const duplicateRoutes = [];
const moduleDiagnostics = [];
let currentRouteOwner = "server.js";

const KNOWN_SHARED_MODULE_FILES = new Set([
  "obs_shared.js"
]);

function routePathToList(routePath) {
  if (Array.isArray(routePath)) return routePath.flatMap(routePathToList);
  if (typeof routePath === "string") return [routePath];
  if (routePath instanceof RegExp) return [routePath.toString()];
  return [];
}

function normalizeRoutePath(routePath) {
  return String(routePath || "").replace(/\/+$/, "") || "/";
}

function registerRouteDiagnostic(method, routePath, owner) {
  const paths = routePathToList(routePath);
  if (!paths.length) return;

  for (const rawPath of paths) {
    const normalizedPath = normalizeRoutePath(rawPath);
    const normalizedMethod = String(method || "").toUpperCase();
    const existing = routeRegistry.find(item => item.method === normalizedMethod && item.path === normalizedPath);
    const entry = {
      method: normalizedMethod,
      path: normalizedPath,
      owner: owner || currentRouteOwner || "unknown",
      rawPath: String(rawPath)
    };

    routeRegistry.push(entry);

    if (existing && existing.owner !== entry.owner) {
      const duplicate = {
        method: normalizedMethod,
        path: normalizedPath,
        firstOwner: existing.owner,
        secondOwner: entry.owner
      };
      duplicateRoutes.push(duplicate);
      console.warn(`[route-warning] duplicate ${duplicate.method} ${duplicate.path}: ${duplicate.firstOwner} -> ${duplicate.secondOwner}`);
    }
  }
}

function installRouteDiagnostics(expressApp) {
  const methods = ["get", "post", "put", "patch", "delete", "all"];

  for (const method of methods) {
    const original = expressApp[method];
    if (typeof original !== "function") continue;

    expressApp[method] = function patchedRouteMethod(routePath, ...handlers) {
      // app.get("env") and similar Express setting getters must stay untouched.
      if (handlers.length > 0) {
        registerRouteDiagnostic(method, routePath, currentRouteOwner);
      }
      return original.call(this, routePath, ...handlers);
    };
  }
}

function readModuleMeta(mod, file) {
  const meta = mod && typeof mod.MODULE_META === "object" ? mod.MODULE_META : null;
  const version =
    (meta && meta.version) ||
    (mod && mod.MODULE_VERSION) ||
    (mod && mod.version) ||
    "unknown";

  const name =
    (meta && meta.name) ||
    (mod && mod.moduleName) ||
    path.basename(file, ".js");

  return {
    name,
    version,
    hasModuleMeta: Boolean(meta),
    type: meta && meta.type ? meta.type : "unknown",
    legacy: Boolean(meta && meta.legacy),
    routesPrefix: meta && meta.routesPrefix ? meta.routesPrefix : null,
    knownShared: KNOWN_SHARED_MODULE_FILES.has(file)
  };
}

function suppressMissingModuleMetaWarnings(meta, status) {
  return Boolean(meta && meta.knownShared && status === "skipped");
}

function logModuleDiagnostic(file, meta, status, extra = {}) {
  const entry = {
    file,
    name: meta.name,
    version: meta.version,
    hasModuleMeta: meta.hasModuleMeta,
    type: meta.type,
    legacy: meta.legacy,
    knownShared: meta.knownShared,
    status,
    ...extra
  };

  moduleDiagnostics.push(entry);

  const metaFlag = meta.hasModuleMeta ? "meta=yes" : "meta=no";
  const legacyFlag = meta.legacy ? " legacy=yes" : "";
  const sharedFlag = meta.knownShared ? " shared=yes" : "";
  const reasonFlag = extra.reason ? ` reason=${extra.reason}` : "";
  console.log(`[module] ${status}: ${file} name=${meta.name} version=${meta.version} ${metaFlag}${legacyFlag}${sharedFlag}${reasonFlag}`);

  const suppressMissingWarnings = suppressMissingModuleMetaWarnings(meta, status);

  if (!suppressMissingWarnings && !meta.hasModuleMeta) console.warn(`[module-warning] ${file} has no exported MODULE_META`);
  if (!suppressMissingWarnings && (!meta.version || meta.version === "unknown")) console.warn(`[module-warning] ${file} has no exported version`);
  if (meta.legacy) console.warn(`[module-warning] ${file} is marked as legacy but was loaded`);
}

function getModuleDiagnosticWarningCount() {
  let count = duplicateRoutes.length;

  for (const entry of moduleDiagnostics) {
    const suppressMissingWarnings = suppressMissingModuleMetaWarnings(entry, entry.status);
    if (!suppressMissingWarnings && !entry.hasModuleMeta) count += 1;
    if (!suppressMissingWarnings && (!entry.version || entry.version === "unknown")) count += 1;
    if (entry.legacy) count += 1;
  }

  return count;
}

function logModuleLoaderSummary() {
  const failedItems = skippedModules.filter(item => item.reason === "load_failed");
  const skippedItems = skippedModules.filter(item => item.reason !== "load_failed");
  const warningCount = getModuleDiagnosticWarningCount();

  console.log(`[module-loader] summary loaded=${loadedModules.length} skipped=${skippedItems.length} failed=${failedItems.length} warnings=${warningCount} routes=${routeRegistry.length} duplicateRoutes=${duplicateRoutes.length}`);

  if (skippedItems.length) {
    for (const item of skippedItems) {
      const diagnostic = moduleDiagnostics.find(entry => entry.file === item.file);
      const sharedFlag = diagnostic && diagnostic.knownShared ? " shared=yes" : "";
      console.log(`[module-loader] skipped file=${item.file} reason=${item.reason}${sharedFlag}`);
    }
  }

  if (failedItems.length) {
    for (const item of failedItems) {
      console.error(`[module-loader] failed file=${item.file} reason=${item.reason} error=${item.error || "unknown"}`);
    }
  }
}

installRouteDiagnostics(app);

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
    serverVersion: SERVER_VERSION,
    loaderDiagnosticsVersion: MODULE_LOADER_DIAGNOSTICS_VERSION,
    wsLogSummaryVersion: WS_LOG_SUMMARY_VERSION,
    envLoadedFrom: paths.ENV_FILE,
    rootDir: paths.ROOT_DIR,
    webrootDir: paths.WEBROOT_DIR,
    modulesDir,
    modules: loadedModules,
    moduleDiagnostics,
    skippedModules: skippedModules,
    routeDiagnostics: {
      totalRoutes: routeRegistry.length,
      duplicateRoutes
    },
    wsClients: wss.clients.size,
    wsLogSummary: {
      version: WS_LOG_SUMMARY_VERSION,
      connectedTotal: wsLogSummary.connectedTotal,
      disconnectedTotal: wsLogSummary.disconnectedTotal,
      pendingConnected: wsLogSummary.pendingConnected,
      pendingDisconnected: wsLogSummary.pendingDisconnected
    }
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

function dispatchWsMessage(ws, rawMessage) {
  for (const item of loadedModuleInstances) {
    if (!item || !item.mod || typeof item.mod.handleWsMessage !== "function") continue;

    try {
      const result = item.mod.handleWsMessage({
        ws,
        rawMessage,
        wss,
        broadcastWS
      });

      if (result && result.handled === true) return result;
    } catch (err) {
      console.error(`[WS] module handler failed: ${item.file}`);
      console.error(err && err.message ? err.message : err);
    }
  }

  return { handled: false };
}

// --------------------------------------------------
// Fireworks API
// --------------------------------------------------
// STEP278 Block 34b:
// The /api/fireworks routes are owned by backend/modules/fireworks_api.js.
// Keeping them only in the module avoids duplicate route registration while
// preserving the same public URLs for Streamer.bot and overlays.

// --------------------------------------------------
// WebSocket connection logging
// --------------------------------------------------
// CAN-31.1: Summarize fast connect/disconnect bursts instead of logging every
// single browser/overlay client. This is diagnostic-only and does not alter
// WebSocket behaviour, dispatch, handlers or broadcasts.
const WS_LOG_DEBOUNCE_MS = 1000;
const wsLogSummary = {
  connectedTotal: 0,
  disconnectedTotal: 0,
  pendingConnected: 0,
  pendingDisconnected: 0,
  timer: null
};

function scheduleWsLogSummary() {
  if (wsLogSummary.timer) return;

  wsLogSummary.timer = setTimeout(() => {
    wsLogSummary.timer = null;

    const connected = wsLogSummary.pendingConnected;
    const disconnected = wsLogSummary.pendingDisconnected;
    wsLogSummary.pendingConnected = 0;
    wsLogSummary.pendingDisconnected = 0;

    console.log(`[WS] clients=${wss.clients.size} connectedDelta=${connected} disconnectedDelta=${disconnected} connectedTotal=${wsLogSummary.connectedTotal} disconnectedTotal=${wsLogSummary.disconnectedTotal}`);
  }, WS_LOG_DEBOUNCE_MS);
}

function recordWsConnected() {
  wsLogSummary.connectedTotal += 1;
  wsLogSummary.pendingConnected += 1;
  scheduleWsLogSummary();
}

function recordWsDisconnected() {
  wsLogSummary.disconnectedTotal += 1;
  wsLogSummary.pendingDisconnected += 1;
  scheduleWsLogSummary();
}

wss.on("connection", ws => {
  recordWsConnected();

  ws.on("message", rawMessage => {
    dispatchWsMessage(ws, rawMessage);
  });

  ws.on("close", () => {
    recordWsDisconnected();
  });
});

// --------------------------------------------------
// Load modules (old behaviour preserved)
// --------------------------------------------------
const modulesDir = paths.CURRENT_MODULES_DIR;
const loadedModules = [];
const skippedModules = [];
const loadedModuleInstances = [];

if (fs.existsSync(modulesDir)) {
  fs.readdirSync(modulesDir).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const mod = require(path.join(modulesDir, file));
      const meta = readModuleMeta(mod, file);

      if (typeof mod.init === "function") {
        currentRouteOwner = file;
        mod.init({
          app,
          server,
          wss,
          env: process.env,
          broadcastWS,
          getLoadedModules: () => [...loadedModules]
        });
        currentRouteOwner = "server.js";

        loadedModules.push(file);
        loadedModuleInstances.push({ file, mod });
        logModuleDiagnostic(file, meta, "loaded");
      } else {
        skippedModules.push({ file, reason: "no_init_export" });
        logModuleDiagnostic(file, meta, "skipped", { reason: "no_init_export" });
      }
    } catch (err) {
      currentRouteOwner = "server.js";
      skippedModules.push({
        file,
        reason: "load_failed",
        error: err && err.message ? err.message : String(err)
      });
      console.error(`[module] FAILED: ${file}`);
      console.error(err && err.message ? err.message : err);
    }
  });
}

logModuleLoaderSummary();

// --------------------------------------------------
// Start server
// --------------------------------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`======================================`);
  console.log(` ForrestCGN Local Server running`);
  console.log(` http://127.0.0.1:${PORT}`);
  console.log(`======================================`);
});
