"use strict";

const fs = require("fs");
const path = require("path");
const express = require("express");

const MODULE_NAME = "local_remote_modboard_adapter";
const MODULE_VERSION = "0.2.11";
const MODULE_BUILD = "RDAP_0_2_11_RUNTIME_PROFILE_AGENT_SYNC_FOUNDATION";
const API_PREFIX = "/api/remote";

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "local-dashboard-adapter",
  category: "dashboard-v2",
  description: "Local compatibility adapter so /dashboard-v2 can run the real Remote-Modboard frontend shell on port 8080. Provides local runtime-profile diagnostics and blocks productive writes/actions.",
  routesPrefix: [
    API_PREFIX,
    "/assets/remote-modboard.css",
    "/assets/remote-modboard.js",
    "/assets/modules",
    "/assets/languages",
    "/assets/runtime-profile.js",
    "/dashboard-v2/assets"
  ],
  legacy: false
};

function nowIso() {
  return new Date().toISOString();
}

function getProjectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function getRemotePublicDir() {
  return path.join(getProjectRoot(), "remote-modboard", "backend", "public");
}

function getRemoteAssetsDir() {
  return path.join(getRemotePublicDir(), "assets");
}

function getRemoteAssetsUpstream() {
  return String(process.env.LOCAL_REMOTE_MODBOARD_ASSETS_UPSTREAM || "https://mods.forrestcgn.de/assets").replace(/\/+$/, "");
}

function safeAssetPath(value) {
  const raw = String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!raw || raw.includes("..") || raw.includes("\0")) return "";
  if (!/^(remote-modboard\.css|remote-modboard\.js|runtime-profile\.js|languages\/|modules\/)/.test(raw)) return "";
  return raw;
}

function redirectRemoteAsset(req, res, assetPath) {
  const safePath = safeAssetPath(assetPath);
  if (!safePath) return res.status(404).json({ ok: false, error: "asset_not_allowed" });
  res.redirect(302, `${getRemoteAssetsUpstream()}/${safePath}`);
}

function getLoadedModules(ctx = {}) {
  return typeof ctx.getLoadedModules === "function" ? ctx.getLoadedModules() : [];
}

function localUser() {
  return {
    userUid: "local-forrestcgn",
    twitchUserId: "local-forrestcgn",
    twitchId: "local-forrestcgn",
    login: "forrestcgn",
    userLogin: "forrestcgn",
    displayName: "ForrestCGN",
    avatarUrl: "",
    roles: ["owner"],
    groups: ["owner", "admin"],
    permissions: ["remote.view", "remote.admin.read", "remote.dashboard.local.read"],
    runtime: "local",
    localOnly: true
  };
}

function localArchitecturePayload(ctx = {}) {
  const remoteAssetsDir = getRemoteAssetsDir();
  const remoteAssetsAvailable = fs.existsSync(remoteAssetsDir);
  const loadedModules = getLoadedModules(ctx);

  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.runtime_profile.v1",
    generatedAt: nowIso(),
    runtimeMode: "local",
    localDashboard: true,
    ui: {
      source: "remote-modboard",
      sourceLabel: "Remote-Modboard UI",
      localUiFork: false,
      separateLocalNavigation: false,
      localDesignAllowed: false,
      note: "Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil."
    },
    access: {
      mods: {
        entry: "https://mods.forrestcgn.de/",
        localAccess: false
      },
      forrestEngelHome: {
        entry: "/dashboard-v2/",
        mode: "local-stream-pc-lan"
      },
      forrestEngelAway: {
        entry: "https://mods.forrestcgn.de/",
        mode: "online"
      }
    },
    agentExecutor: {
      prepared: true,
      active: false,
      status: "planned",
      centralExecutor: true,
      requiredForStreamingPcActions: true,
      localPath: "Dashboard-v2 lokal -> lokaler Server/Adapter -> Agent -> Streaming-PC-Aktion",
      onlinePath: "Modboard online -> Webserver -> Agent -> Streaming-PC-Aktion",
      enabledActions: [],
      blockedActions: [
        "obs",
        "sound",
        "overlay",
        "command",
        "file",
        "process",
        "shell",
        "productiveWrite"
      ],
      note: "0.2.11 bereitet nur Status/Profil vor. Es aktiviert keine Agent-Actions."
    },
    rightsSync: {
      prepared: true,
      active: false,
      status: "planned",
      localAndOnlineChangesAllowed: "planned",
      onlineRevocationImmediate: true,
      conflictRule: "planned: revocations win immediately; normal changes use revision/timestamp.",
      requiredFields: ["actor", "timestamp", "source", "revision", "audit"],
      note: "User/Rechte-Sync ist dokumentiert, aber technisch noch nicht aktiv."
    },
    safety: localSafetyPayload(),
    loadedModules: {
      count: loadedModules.length,
      files: loadedModules
    }
  };
}

function localSafetyPayload() {
  return {
    readOnly: true,
    productiveWritesEnabled: false,
    remoteWritesEnabled: false,
    agentActionsEnabled: false,
    obsActionsEnabled: false,
    soundActionsEnabled: false,
    overlayActionsEnabled: false,
    commandActionsEnabled: false,
    shellActionsEnabled: false,
    fileActionsEnabled: false,
    processActionsEnabled: false,
    dbMigration: false,
    dashboardLegacyChanged: false
  };
}

function localAuthPayload(extra = {}) {
  const user = localUser();
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    authenticated: true,
    loggedIn: true,
    authorized: true,
    allowed: true,
    canAccess: true,
    accessGranted: true,
    user,
    me: user,
    profile: user,
    account: user,
    session: {
      authenticated: true,
      authorized: true,
      localOnly: true,
      createdAt: nowIso(),
      expiresAt: ""
    },
    roles: user.roles,
    groups: user.groups,
    permissions: user.permissions,
    ...extra
  };
}

function localStatusPayload(ctx = {}) {
  const loadedModules = getLoadedModules(ctx);
  const architecture = localArchitecturePayload(ctx);
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.v2",
    runtimeMode: "local",
    runtime: {
      mode: "local",
      label: "Lokalmodus",
      localDashboard: true,
      readOnly: true,
      remoteShell: true,
      profileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`
    },
    serviceStatus: "ok",
    status: "ok",
    localDashboard: true,
    readOnly: true,
    prepared: true,
    online: true,
    loginEnabled: false,
    oauthEnabled: false,
    remoteWritesEnabled: false,
    productiveWritesEnabled: false,
    agentActionsEnabled: false,
    obsActionsEnabled: false,
    soundActionsEnabled: false,
    overlayActionsEnabled: false,
    commandActionsEnabled: false,
    runtimeProfile: {
      uiSource: architecture.ui.source,
      agentExecutor: architecture.agentExecutor.status,
      rightsSync: architecture.rightsSync.status,
      writeActions: "disabled"
    },
    loadedModules: loadedModules.length,
    generatedAt: nowIso(),
    note: "/dashboard-v2 nutzt die echte Remote-Modboard-Frontend-Shell mit lokalen read-only API-Adaptern."
  };
}

function localRoutesPayload(ctx = {}) {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    statusApiVersion: "local_remote_modboard_adapter.v2",
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    routes: [
      { method: "GET", path: `${API_PREFIX}/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/routes`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/me`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/login/plan`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/model`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/auth/permissions/check`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/lock-audit/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/lock-audit/schema-adapter/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/adapter/status`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/runtime-profile`, readOnly: true },
      { method: "GET", path: `${API_PREFIX}/local-dashboard/architecture`, readOnly: true }
    ],
    localSafety: localSafetyPayload(),
    loadedModules: getLoadedModules(ctx),
    generatedAt: nowIso()
  };
}

function authModelPayload() {
  const user = localUser();
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    roles: [
      { id: "owner", label: "Owner", localOnly: true, permissions: user.permissions },
      { id: "admin", label: "Admin", localOnly: true, permissions: ["remote.view", "remote.admin.read"] }
    ],
    groups: [
      { id: "owner", label: "Owner", localOnly: true },
      { id: "admin", label: "Admin", localOnly: true }
    ],
    permissions: user.permissions.map((permission) => ({ id: permission, permission, allowed: true, localOnly: true, readOnly: true })),
    model: {
      loginEnabled: false,
      oauthEnabled: false,
      sessionEnabled: false,
      localReadOnlyAdapter: true,
      runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`
    },
    user
  };
}

function permissionPayload(req) {
  const permission = String((req.query && req.query.permission) || "remote.view").trim() || "remote.view";
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    permission,
    allowed: true,
    hasPermission: true,
    canRead: true,
    canWrite: false,
    user: localUser(),
    decision: {
      allowed: true,
      reason: "local_read_only_adapter"
    }
  };
}

function lockAuditStatusPayload() {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    lock: {
      enabled: true,
      activeLocks: 0,
      locks: []
    },
    audit: {
      enabled: true,
      localReadOnly: true,
      recent: []
    },
    canRead: true,
    canWrite: false
  };
}

function schemaAdapterPayload() {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    adapter: {
      prepared: true,
      mode: "local-read-only",
      dbRequired: false
    },
    schema: {
      ready: true,
      localOnly: true,
      migrationsRequired: false
    }
  };
}

function localPlaceholderPayload(req) {
  return {
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    placeholder: true,
    path: req.path,
    query: req.query || {},
    data: [],
    items: [],
    users: [],
    notes: [],
    connections: [],
    runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`,
    message: "Lokaler read-only Platzhalter. Echte Remote-Modboard-UI bleibt identisch; produktive Daten/Writes sind lokal blockiert."
  };
}

function writeBlockedPayload(req) {
  return {
    ok: false,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    error: "local_remote_write_blocked",
    method: req.method,
    path: req.path,
    message: "Lokale Remote-Modboard-Kopie ist read-only. Writes, Sync, Agent-, OBS-, Sound-, Overlay-, Command-, Shell-, Datei- und Prozess-Actions sind blockiert."
  };
}

function mountRemoteAssetFiles(app, remoteAssetsDir) {
  const staticOptions = { index: false, dotfiles: "deny", fallthrough: true };

  app.use("/assets/modules", express.static(path.join(remoteAssetsDir, "modules"), staticOptions));
  app.use("/assets/languages", express.static(path.join(remoteAssetsDir, "languages"), staticOptions));
  app.use("/dashboard-v2/assets/modules", express.static(path.join(remoteAssetsDir, "modules"), staticOptions));
  app.use("/dashboard-v2/assets/languages", express.static(path.join(remoteAssetsDir, "languages"), staticOptions));

  function sendLocalOrRedirect(localName, assetName) {
    return (req, res) => {
      const file = path.join(remoteAssetsDir, localName);
      if (fs.existsSync(file)) return res.sendFile(file);
      return redirectRemoteAsset(req, res, assetName || localName);
    };
  }

  app.get("/assets/remote-modboard.css", sendLocalOrRedirect("remote-modboard.css"));
  app.get("/assets/remote-modboard.js", sendLocalOrRedirect("remote-modboard.js"));
  app.get("/assets/runtime-profile.js", sendLocalOrRedirect("runtime-profile.js"));
  app.get("/dashboard-v2/assets/remote-modboard.css", sendLocalOrRedirect("remote-modboard.css"));
  app.get("/dashboard-v2/assets/remote-modboard.js", sendLocalOrRedirect("remote-modboard.js"));
  app.get("/dashboard-v2/assets/runtime-profile.js", sendLocalOrRedirect("runtime-profile.js"));

  app.get(/^\/assets\/(languages\/.+|modules\/.+)$/, (req, res) => redirectRemoteAsset(req, res, req.params[0]));
  app.get(/^\/dashboard-v2\/assets\/(languages\/.+|modules\/.+)$/, (req, res) => redirectRemoteAsset(req, res, req.params[0]));
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.init = function init(ctx = {}) {
  const { app } = ctx;
  if (!app || typeof app.get !== "function") {
    console.warn(`[${MODULE_NAME}] Express app missing; adapter not mounted`);
    return;
  }

  const remotePublicDir = getRemotePublicDir();
  const remoteAssetsDir = getRemoteAssetsDir();
  const remoteAssetsAvailable = fs.existsSync(remoteAssetsDir);

  mountRemoteAssetFiles(app, remoteAssetsDir);

  app.get(`${API_PREFIX}/status`, (req, res) => res.json(localStatusPayload(ctx)));
  app.get(`${API_PREFIX}/routes`, (req, res) => res.json(localRoutesPayload(ctx)));
  app.get(`${API_PREFIX}/auth/me`, (req, res) => res.json(localAuthPayload()));
  app.get(`${API_PREFIX}/auth/login/plan`, (req, res) => res.json({
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    localDashboard: true,
    readOnly: true,
    loginEnabled: false,
    oauthEnabled: false,
    startUrl: "",
    reason: "local_dashboard_read_only_adapter"
  }));
  app.get(`${API_PREFIX}/auth/model`, (req, res) => res.json(authModelPayload()));
  app.get(`${API_PREFIX}/auth/permissions/check`, (req, res) => res.json(permissionPayload(req)));
  app.get(`${API_PREFIX}/lock-audit/status`, (req, res) => res.json(lockAuditStatusPayload()));
  app.get(`${API_PREFIX}/lock-audit/schema-adapter/status`, (req, res) => res.json(schemaAdapterPayload()));

  app.get(`${API_PREFIX}/local-dashboard/runtime-profile`, (req, res) => res.json(localArchitecturePayload(ctx)));
  app.get(`${API_PREFIX}/local-dashboard/architecture`, (req, res) => res.json(localArchitecturePayload(ctx)));

  app.get(`${API_PREFIX}/local-dashboard/adapter/status`, (req, res) => res.json({
    ok: true,
    service: "remote-modboard",
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    runtimeMode: "local",
    remotePublicDir,
    remoteAssetsDir,
    remoteAssetsAvailable,
    remoteAssetsUpstream: getRemoteAssetsUpstream(),
    assetFallback: remoteAssetsAvailable ? "local-files" : "upstream-redirect",
    readOnly: true,
    runtimeProfileEndpoint: `${API_PREFIX}/local-dashboard/runtime-profile`,
    agentExecutor: {
      prepared: true,
      active: false,
      status: "planned"
    },
    rightsSync: {
      prepared: true,
      active: false,
      status: "planned"
    }
  }));

  app.get(`${API_PREFIX}/auth/login/start`, (req, res) => {
    res.redirect(302, "/dashboard-v2/");
  });

  app.get(`${API_PREFIX}/*`, (req, res) => res.json(localPlaceholderPayload(req)));
  app.all(`${API_PREFIX}/*`, (req, res) => res.status(405).json(writeBlockedPayload(req)));

  console.log(`[${MODULE_NAME}] routes active: ${API_PREFIX}/* read-only adapter; runtimeProfile=prepared; remoteAssetsAvailable=${remoteAssetsAvailable}; assetFallback=${remoteAssetsAvailable ? "local-files" : "upstream-redirect"}`);
};
