"use strict";

const http = require("http");
const https = require("https");
const { URL } = require("url");

const core = require("./helpers/helper_core");
const config = require("./helpers/helper_config");
const routes = require("./helpers/helper_routes");
const security = require("./helpers/helper_security");
const settings = require("./helpers/helper_settings");

const MODULE_NAME = "message_rotator_scheduler";
const SETTINGS_TABLE = "message_rotator_scheduler_settings";

const DEFAULT_CONFIG = {
  enabled: true,
  intervalSeconds: 30,
  commit: true,
  onlyWhenActive: true,
  startOnBackendStart: true,
  requestUrl: "http://127.0.0.1:8080/api/message-rotator/next",
  statusUrl: "http://127.0.0.1:8080/api/message-rotator/status",
  timeoutMs: 10000,
  logBlocked: false
};

let cfg = null;
let cfgInfo = null;
let timer = null;
let running = false;

const state = {
  active: false,
  startedAt: null,
  stoppedAt: null,
  lastRunAt: null,
  lastRunAtMs: 0,
  lastResult: null,
  lastReason: "",
  lastError: "",
  runCount: 0,
  skippedCount: 0,
  sentCount: 0,
  failedCount: 0
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cleanString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toBool(value, fallback = false) {
  return core.boolParam(value, fallback);
}

function positiveInt(value, fallback, min = 1, max = 3600) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeConfig(raw) {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    enabled: toBool(src.enabled, DEFAULT_CONFIG.enabled),
    intervalSeconds: positiveInt(src.intervalSeconds, DEFAULT_CONFIG.intervalSeconds, 5, 3600),
    commit: toBool(src.commit, DEFAULT_CONFIG.commit),
    onlyWhenActive: toBool(src.onlyWhenActive, DEFAULT_CONFIG.onlyWhenActive),
    startOnBackendStart: toBool(src.startOnBackendStart, DEFAULT_CONFIG.startOnBackendStart),
    requestUrl: cleanString(src.requestUrl, DEFAULT_CONFIG.requestUrl),
    statusUrl: cleanString(src.statusUrl, DEFAULT_CONFIG.statusUrl),
    timeoutMs: positiveInt(src.timeoutMs, DEFAULT_CONFIG.timeoutMs, 1000, 60000),
    logBlocked: toBool(src.logBlocked, DEFAULT_CONFIG.logBlocked)
  };
}

function flattenSettingsObject(input, prefix = "") {
  const result = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return result;

  for (const [key, value] of Object.entries(input)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result.push(...flattenSettingsObject(value, fullKey));
    } else {
      result.push({
        key: fullKey,
        value,
        valueType: settings.normalizeValueType("", value),
        description: ""
      });
    }
  }

  return result;
}

function setNestedValue(target, dottedKey, value) {
  const parts = String(dottedKey || "").split(".").map(part => part.trim()).filter(Boolean);
  if (!parts.length) return target;

  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) current[part] = {};
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return target;
}

function applyDbSettings(baseConfig) {
  const merged = { ...DEFAULT_CONFIG, ...(baseConfig || {}) };

  try {
    settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(merged));
    const listed = settings.listSettings(SETTINGS_TABLE, { limit: 1000 });
    for (const row of listed.rows || []) {
      setNestedValue(merged, row.key, row.value);
    }
    const normalized = normalizeConfig(merged);
    normalized.settingsTable = SETTINGS_TABLE;
    normalized.settingsSource = "database_with_json_fallback";
    normalized.settingsError = "";
    return normalized;
  } catch (err) {
    const fallback = normalizeConfig(merged);
    fallback.settingsTable = SETTINGS_TABLE;
    fallback.settingsSource = "json_fallback";
    fallback.settingsError = err.message || String(err);
    return fallback;
  }
}

function loadConfig() {
  const result = config.loadConfig("message_rotator_scheduler.json", DEFAULT_CONFIG, {
    createIfMissing: true,
    mergeDefaults: true,
    spaces: 2
  });

  cfg = applyDbSettings(result.config || DEFAULT_CONFIG);
  cfgInfo = {
    ok: true,
    configPath: result.path,
    loadedAt: core.nowIso(),
    settingsTable: cfg.settingsTable || SETTINGS_TABLE,
    settingsSource: cfg.settingsSource || "database_with_json_fallback",
    settingsError: cfg.settingsError || ""
  };

  return { ...cfgInfo, config: cfg };
}

function getConfig() {
  if (!cfg) loadConfig();
  return cfg;
}

function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value) !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function requestJson(rawUrl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (err) {
      reject(err);
      return;
    }

    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(parsed, { timeout: timeoutMs, headers: { accept: "application/json" } }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => {
        let data = null;
        try { data = body ? JSON.parse(body) : {}; } catch (_) { data = { raw: body }; }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.statusCode = res.statusCode;
          err.body = data;
          reject(err);
          return;
        }

        resolve(data);
      });
    });

    req.on("timeout", () => req.destroy(new Error(`timeout_${timeoutMs}ms`)));
    req.on("error", reject);
  });
}

function sanitizeResult(result) {
  if (!result || typeof result !== "object") return result;
  const copy = clone(result);
  if (copy.state && copy.state.config && copy.state.config.messageOptions) {
    // Kein Secret, aber Status schlank halten.
    copy.state = {
      active: copy.state.active,
      startedAt: copy.state.startedAt,
      chatMessagesSinceLastSend: copy.state.chatMessagesSinceLastSend,
      lastSentAt: copy.state.lastSentAt,
      lastItemId: copy.state.lastItemId,
      sendCount: copy.state.sendCount
    };
  }
  return copy;
}

async function schedulerRun(reason = "timer") {
  const c = getConfig();

  if (running) {
    state.skippedCount += 1;
    state.lastReason = "already_running";
    return { ok: true, skipped: true, reason: "already_running", state: publicState() };
  }

  if (!c.enabled) {
    state.skippedCount += 1;
    state.lastReason = "scheduler_disabled";
    return { ok: true, skipped: true, reason: "scheduler_disabled", state: publicState() };
  }

  running = true;
  state.runCount += 1;
  state.lastRunAt = core.nowIso();
  state.lastRunAtMs = Date.now();

  try {
    if (c.onlyWhenActive) {
      const status = await requestJson(c.statusUrl, c.timeoutMs);
      if (!status || status.active !== true) {
        state.skippedCount += 1;
        state.lastReason = "rotator_not_active";
        state.lastResult = sanitizeResult({ ok: true, send: false, reason: "rotator_not_active", status: { active: !!status?.active } });
        return { ok: true, skipped: true, reason: "rotator_not_active", status: { active: !!status?.active }, state: publicState() };
      }
    }

    const url = buildUrl(c.requestUrl, {
      commit: c.commit ? "1" : "0",
      source: "message_rotator_scheduler",
      schedulerReason: reason
    });

    const result = await requestJson(url, c.timeoutMs);
    state.lastResult = sanitizeResult(result);
    state.lastReason = result.reason || "";

    if (result && result.ok === false) {
      state.failedCount += 1;
      state.lastError = result.error || result.reason || "rotator_next_failed";
    } else if (result && result.send && (result.sent || result.reason === "backend_sent")) {
      state.sentCount += 1;
      state.lastError = "";
    } else {
      state.skippedCount += 1;
      state.lastError = "";
      if (c.logBlocked && result && result.reason) {
        console.log(`[message_rotator_scheduler] blocked: ${result.reason}`);
      }
    }

    return { ok: true, scheduler: publicState(), result: state.lastResult };
  } catch (err) {
    state.failedCount += 1;
    state.lastReason = "scheduler_error";
    state.lastError = err.message || String(err);
    state.lastResult = { ok: false, reason: "scheduler_error", error: state.lastError };
    return { ok: false, reason: "scheduler_error", error: state.lastError, state: publicState() };
  } finally {
    running = false;
  }
}

function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  state.active = false;
  state.stoppedAt = core.nowIso();
  return { ok: true, message: "Message-Rotator Scheduler gestoppt.", scheduler: publicState() };
}

function startScheduler() {
  const c = getConfig();
  if (timer) clearInterval(timer);

  if (!c.enabled) {
    state.active = false;
    state.stoppedAt = core.nowIso();
    return { ok: true, message: "Message-Rotator Scheduler ist deaktiviert.", scheduler: publicState() };
  }

  const intervalMs = Math.max(5000, Number(c.intervalSeconds || 30) * 1000);
  timer = setInterval(() => {
    schedulerRun("interval").catch(err => {
      state.failedCount += 1;
      state.lastReason = "scheduler_error";
      state.lastError = err.message || String(err);
      console.error("[message_rotator_scheduler] run failed:", err);
    });
  }, intervalMs);

  if (typeof timer.unref === "function") timer.unref();

  state.active = true;
  state.startedAt = state.startedAt || core.nowIso();
  state.stoppedAt = null;

  return { ok: true, message: "Message-Rotator Scheduler gestartet.", intervalSeconds: c.intervalSeconds, scheduler: publicState() };
}

function restartScheduler() {
  stopScheduler();
  return startScheduler();
}

function publicState() {
  const c = getConfig();
  return {
    module: MODULE_NAME,
    enabled: c.enabled,
    active: state.active,
    running,
    startedAt: state.startedAt,
    stoppedAt: state.stoppedAt,
    intervalSeconds: c.intervalSeconds,
    commit: c.commit,
    onlyWhenActive: c.onlyWhenActive,
    requestUrl: c.requestUrl,
    statusUrl: c.statusUrl,
    timeoutMs: c.timeoutMs,
    logBlocked: c.logBlocked,
    lastRunAt: state.lastRunAt,
    lastReason: state.lastReason,
    lastError: state.lastError,
    runCount: state.runCount,
    skippedCount: state.skippedCount,
    sentCount: state.sentCount,
    failedCount: state.failedCount,
    lastResult: state.lastResult,
    configInfo: cfgInfo
  };
}

function getAdminPayload(req) {
  if (req && req.body && typeof req.body === "object" && !Array.isArray(req.body)) return req.body;
  return req && req.query && typeof req.query === "object" ? req.query : {};
}

function listAdminSettings() {
  const current = getConfig();
  settings.seedDefaults(SETTINGS_TABLE, flattenSettingsObject(current));
  return {
    ok: true,
    module: MODULE_NAME,
    table: SETTINGS_TABLE,
    settings: settings.listSettings(SETTINGS_TABLE, { limit: 1000 }),
    scheduler: publicState()
  };
}

function setAdminSettings(payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const updates = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
    ? body.settings
    : (body.key ? { [body.key]: body.value } : {});

  if (!Object.keys(updates).length) throw new Error("settings_payload_empty");

  const rows = [];
  for (const [key, value] of Object.entries(updates)) {
    rows.push(settings.setSetting(SETTINGS_TABLE, key, value));
  }

  cfg = null;
  const loaded = loadConfig();
  restartScheduler();

  return {
    ok: true,
    module: MODULE_NAME,
    table: SETTINGS_TABLE,
    updated: rows.length,
    rows,
    configInfo: cfgInfo,
    config: loaded.config,
    scheduler: publicState()
  };
}

function checkAuth(req) {
  const result = security.canAccess(req);
  return { ok: result.allowed, reason: result.reason, clientIp: result.clientIp };
}

function guarded(handler) {
  return function routeHandler(req, res) {
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(403).json({ ok: false, error: "unauthorized", message: "Nicht autorisiert." });

    try {
      const result = handler(req, res);
      if (result && typeof result.then === "function") {
        return result.catch(err => {
          console.error("[message_rotator_scheduler] route error:", err);
          return res.status(500).json({ ok: false, error: err.message || String(err) });
        });
      }
      return result;
    } catch (err) {
      console.error("[message_rotator_scheduler] route error:", err);
      return res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  };
}

function routesPayload(req = null) {
  return {
    ok: true,
    module: MODULE_NAME,
    standardPrefix: "/api/message-rotator/scheduler",
    routes: [
      { method: "GET", path: "/api/message-rotator/scheduler/status", purpose: "Scheduler-Status lesen" },
      { method: "GET/POST", path: "/api/message-rotator/scheduler/reload", purpose: "Config/DB-Settings neu laden und Timer neu starten" },
      { method: "GET/POST", path: "/api/message-rotator/scheduler/start", purpose: "Scheduler-Timer starten" },
      { method: "GET/POST", path: "/api/message-rotator/scheduler/stop", purpose: "Scheduler-Timer stoppen" },
      { method: "GET/POST", path: "/api/message-rotator/scheduler/run", purpose: "Einmaligen Scheduler-Lauf ausführen" },
      { method: "GET", path: "/api/message-rotator/scheduler/settings", purpose: "Scheduler-Settings lesen" },
      { method: "POST", path: "/api/message-rotator/scheduler/settings", purpose: "Scheduler-Settings speichern" },
      { method: "GET", path: "/api/message-rotator/scheduler/routes", purpose: "Routen anzeigen" }
    ],
    security: req ? security.securitySummary(req) : security.securitySummary()
  };
}

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) throw new Error("Express app in ctx.app fehlt.");

  loadConfig();

  routes.registerGet(app, ["/api/message-rotator/scheduler/status", "/message-rotator/scheduler/status"], guarded((req, res) => res.json({ ok: true, scheduler: publicState() })));
  routes.registerGet(app, ["/api/message-rotator/scheduler/routes", "/message-rotator/scheduler/routes"], guarded((req, res) => res.json(routesPayload(req))));

  const settingsGet = guarded((req, res) => res.json(listAdminSettings()));
  const settingsPost = guarded((req, res) => res.json(setAdminSettings(getAdminPayload(req))));
  routes.registerGet(app, ["/api/message-rotator/scheduler/settings", "/message-rotator/scheduler/settings"], settingsGet);
  routes.registerPost(app, ["/api/message-rotator/scheduler/settings", "/message-rotator/scheduler/settings"], settingsPost);

  const reloadHandler = guarded((req, res) => {
    const loaded = loadConfig();
    const scheduler = restartScheduler();
    return res.json({ ok: true, ...loaded, scheduler });
  });
  routes.registerGet(app, ["/api/message-rotator/scheduler/reload", "/message-rotator/scheduler/reload"], reloadHandler);
  routes.registerPost(app, ["/api/message-rotator/scheduler/reload", "/message-rotator/scheduler/reload"], reloadHandler);

  const startHandler = guarded((req, res) => res.json(startScheduler()));
  routes.registerGet(app, ["/api/message-rotator/scheduler/start", "/message-rotator/scheduler/start"], startHandler);
  routes.registerPost(app, ["/api/message-rotator/scheduler/start", "/message-rotator/scheduler/start"], startHandler);

  const stopHandler = guarded((req, res) => res.json(stopScheduler()));
  routes.registerGet(app, ["/api/message-rotator/scheduler/stop", "/message-rotator/scheduler/stop"], stopHandler);
  routes.registerPost(app, ["/api/message-rotator/scheduler/stop", "/message-rotator/scheduler/stop"], stopHandler);

  const runHandler = guarded(async (req, res) => res.json(await schedulerRun("manual")));
  routes.registerGet(app, ["/api/message-rotator/scheduler/run", "/message-rotator/scheduler/run"], runHandler);
  routes.registerPost(app, ["/api/message-rotator/scheduler/run", "/message-rotator/scheduler/run"], runHandler);

  if (getConfig().startOnBackendStart) startScheduler();

  console.log("[message_rotator_scheduler] /api/message-rotator/scheduler/* aktiv");
}

module.exports = { init };
