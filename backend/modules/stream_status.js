"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");
const database = require("../core/database");

const MODULE_NAME = "stream_status";
const MODULE_VERSION = "0.1.2";
const MODULE_BUILD = "step278-meta";
const API_PREFIX = "/api/stream-status";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "runtime",
  category: "stream",
  description: "Central stream live/session status and refresh routes.",
  routesPrefix: [API_PREFIX],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

const DEFAULT_FILES = [
  "htdocs/data/twitch_stream_raw.json",
  "htdocs/data/twitch_live_data.json"
];

const state = {
  initialized: false,
  loadedAt: core.nowIso(),
  lastCheckedAt: "",
  lastError: "",
  lastStatus: null,
  refreshCount: 0,
  lastApiRefreshAt: "",
  lastApiError: "",
  autoRefreshEnabled: false,
  autoRefreshStartedAt: "",
  autoRefreshLastRunAt: "",
  autoRefreshNextRunAt: "",
  autoRefreshIntervalMs: 0,
  autoRefreshRunning: false,
  autoRefreshTimer: null
};

function nowIso() {
  return core.nowIso();
}

function cleanLogin(value) {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function msFromIso(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : 0;
}

function isoFromMs(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : "";
}

function compactIsoForId(value) {
  const ms = msFromIso(value) || Date.now();
  return new Date(ms).toISOString().replace(/[-:.]/g, "").replace(/Z$/, "Z");
}

function resolveRootFile(inputPath) {
  const raw = String(inputPath || "").trim();
  if (!raw) return "";
  if (path.isAbsolute(raw)) return raw;
  return configHelper.resolveFromRoot(raw);
}

function getConfig(env = process.env) {
  const filesRaw = String(env.STREAM_STATUS_FILES || "").trim();
  const files = filesRaw ? filesRaw.split(/[;,]/).map(v => v.trim()).filter(Boolean) : DEFAULT_FILES.slice();
  return {
    broadcasterLogin: cleanLogin(env.TWITCH_BOT_CHANNEL || env.TWITCH_CHANNEL || env.TWITCH_BROADCASTER_LOGIN || "forrestcgn") || "forrestcgn",
    files,
    staleAfterMs: Math.max(30000, Number(env.STREAM_STATUS_STALE_MS || 300000) || 300000),
    restartGraceMs: Math.max(0, Number(env.STREAM_STATUS_RESTART_GRACE_MS || 1800000) || 1800000),
    twitchApiEnabled: !/^(0|false|no|off)$/i.test(String(env.STREAM_STATUS_TWITCH_API_ENABLED || "true")),
    twitchApiUrl: String(env.STREAM_STATUS_TWITCH_API_URL || "http://127.0.0.1:8080/api/twitch/stream?login={login}").trim(),
    twitchApiTimeoutMs: Math.max(1000, Number(env.STREAM_STATUS_TWITCH_API_TIMEOUT_MS || 5000) || 5000),
    apiFirst: !/^(0|false|no|off)$/i.test(String(env.STREAM_STATUS_API_FIRST || "true")),
    autoRefreshEnabled: !/^(0|false|no|off)$/i.test(String(env.STREAM_STATUS_AUTO_REFRESH_ENABLED || "true")),
    autoRefreshIdleMs: Math.max(10000, Number(env.STREAM_STATUS_AUTO_REFRESH_IDLE_MS || 60000) || 60000),
    autoRefreshActiveMs: Math.max(10000, Number(env.STREAM_STATUS_AUTO_REFRESH_ACTIVE_MS || 30000) || 30000),
    cacheMaxAgeMs: Math.max(5000, Number(env.STREAM_STATUS_CACHE_MAX_AGE_MS || 15000) || 15000)
  };
}

function ensureSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS stream_status_state (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stream_status_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stream_session_id TEXT NOT NULL UNIQUE,
      stream_day_id TEXT NOT NULL,
      broadcaster_login TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      stream_id TEXT NOT NULL DEFAULT '',
      stream_started_at TEXT NOT NULL DEFAULT '',
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      ended_at TEXT NOT NULL DEFAULT '',
      restart_grace_until TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_stream_status_sessions_broadcaster_status ON stream_status_sessions(broadcaster_login, status, last_seen_at);
    CREATE INDEX IF NOT EXISTS idx_stream_status_sessions_day ON stream_status_sessions(stream_day_id);
  `);
}

function safeJsonParse(value, fallback = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function readStoredStatus() {
  try {
    ensureSchema();
    const row = database.get(`SELECT value_json FROM stream_status_state WHERE key='current'`);
    return safeJsonParse(row && row.value_json, null);
  } catch (_) {
    return null;
  }
}

function writeStoredStatus(status) {
  ensureSchema();
  database.run(`
    INSERT INTO stream_status_state (key, value_json, updated_at)
    VALUES ('current', :valueJson, :updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value_json=excluded.value_json,
      updated_at=excluded.updated_at
  `, { valueJson: JSON.stringify(status || {}), updatedAt: nowIso() });
}

function extractStatusFromPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const first = Array.isArray(payload.data) && payload.data.length ? payload.data[0] : null;
  const source = first || payload.stream || payload.channel || payload;
  const live = Boolean(first || source.live === true || source.isLive === true || source.online === true || source.type === "live");
  if (!live) return { live: false };
  return {
    live: true,
    streamId: String(source.id || source.stream_id || source.streamId || ""),
    startedAt: String(source.started_at || source.startedAt || source.stream_started_at || source.streamStartedAt || ""),
    title: String(source.title || ""),
    gameName: String(source.game_name || source.gameName || ""),
    viewerCount: Number(source.viewer_count ?? source.viewerCount ?? 0) || 0
  };
}

function readFileStatus(filePath, cfg) {
  const file = resolveRootFile(filePath);
  if (!file || !fs.existsSync(file)) return null;
  const stat = fs.statSync(file);
  const fileModifiedAt = stat.mtime.toISOString();
  const fileAgeSeconds = Math.max(0, Math.round((Date.now() - stat.mtimeMs) / 1000));
  const stale = Date.now() - stat.mtimeMs > cfg.staleAfterMs;
  const payload = safeJsonParse(fs.readFileSync(file, "utf8"), null);
  const extracted = extractStatusFromPayload(payload) || { live: false };
  return {
    ...extracted,
    source: "file",
    file,
    fileModifiedAt,
    fileAgeSeconds,
    stale,
    statusKnown: !stale,
    rawDataCount: Array.isArray(payload && payload.data) ? payload.data.length : 0
  };
}

function selectSourceStatus(cfg) {
  const rows = [];
  for (const file of cfg.files) {
    try {
      const status = readFileStatus(file, cfg);
      if (status) rows.push(status);
    } catch (err) {
      rows.push({ live: false, source: "file", file: resolveRootFile(file), stale: true, statusKnown: false, lastError: err.message || String(err) });
    }
  }
  const freshLive = rows.find(r => r.live && !r.stale);
  if (freshLive) return freshLive;
  const freshKnown = rows.find(r => !r.stale && r.statusKnown !== false);
  if (freshKnown) return freshKnown;
  const anyLive = rows.find(r => r.live);
  if (anyLive) return { ...anyLive, statusKnown: false, stale: true };
  if (rows.length) return { ...rows[0], statusKnown: false, stale: true };
  return { live: false, source: "none", file: "", fileModifiedAt: "", fileAgeSeconds: 0, stale: true, statusKnown: false, lastError: "stream_status_source_missing" };
}

function buildTwitchApiUrl(cfg) {
  const template = String(cfg.twitchApiUrl || "").trim();
  if (!template) return "";
  const login = encodeURIComponent(cfg.broadcasterLogin || "");
  if (template.includes("{login}")) return template.replace(/\{login\}/g, login);
  return template;
}

function requestJson(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const cleanUrl = String(url || "").trim();
    if (!cleanUrl) {
      reject(new Error("stream_status_twitch_api_url_missing"));
      return;
    }

    let parsed;
    try {
      parsed = new URL(cleanUrl);
    } catch (err) {
      reject(new Error(`stream_status_twitch_api_url_invalid:${err.message || String(err)}`));
      return;
    }

    const client = parsed.protocol === "https:" ? https : http;
    const req = client.request(parsed, { method: "GET", timeout: Math.max(1000, Number(timeoutMs || 5000) || 5000) }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`stream_status_twitch_api_http_${res.statusCode}`));
          return;
        }
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (err) {
          reject(new Error(`stream_status_twitch_api_json:${err.message || String(err)}`));
        }
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error("stream_status_twitch_api_timeout"));
    });
    req.on("error", reject);
    req.end();
  });
}

function normalizeApiStatus(payload, cfg, url) {
  const extracted = extractStatusFromPayload(payload) || { live: false };
  return {
    ...extracted,
    source: "twitch_api",
    upstreamSource: "api",
    apiUrl: url,
    file: "",
    fileModifiedAt: "",
    fileAgeSeconds: 0,
    stale: false,
    statusKnown: true,
    rawDataCount: Array.isArray(payload && payload.data) ? payload.data.length : 0,
    checkedViaApiAt: nowIso(),
    broadcasterLogin: cfg.broadcasterLogin
  };
}

async function readTwitchApiStatus(cfg) {
  if (!cfg.twitchApiEnabled) return null;
  const url = buildTwitchApiUrl(cfg);
  if (!url) return null;
  const payload = await requestJson(url, cfg.twitchApiTimeoutMs);
  state.lastApiRefreshAt = nowIso();
  state.lastApiError = "";
  return normalizeApiStatus(payload, cfg, url);
}

async function selectSourceStatusAsync(cfg, options = {}) {
  const fileStatus = selectSourceStatus(cfg);
  const forceApi = options.forceApi === true;
  const apiFirst = cfg.twitchApiEnabled !== false && cfg.apiFirst !== false;
  const fileUsable = fileStatus && fileStatus.statusKnown !== false && fileStatus.stale !== true;

  if ((apiFirst || forceApi || !fileUsable) && cfg.twitchApiEnabled !== false) {
    try {
      const apiStatus = await readTwitchApiStatus(cfg);
      if (apiStatus) return apiStatus;
    } catch (err) {
      state.lastApiError = err && err.message ? err.message : String(err);
      if (fileUsable) {
        return {
          ...fileStatus,
          apiEnabled: cfg.twitchApiEnabled,
          apiUrl: buildTwitchApiUrl(cfg),
          apiError: state.lastApiError,
          lastError: ""
        };
      }
      return {
        ...(fileStatus || {}),
        source: fileStatus && fileStatus.source ? fileStatus.source : "none",
        apiEnabled: cfg.twitchApiEnabled,
        apiUrl: buildTwitchApiUrl(cfg),
        apiError: state.lastApiError,
        lastError: fileStatus && fileStatus.lastError ? fileStatus.lastError : state.lastApiError,
        statusKnown: fileStatus && fileStatus.statusKnown !== false && !fileStatus.stale,
        stale: fileStatus ? !!fileStatus.stale : true
      };
    }
  }

  if (fileUsable) return fileStatus;
  return fileStatus || { live: false, source: "none", file: "", fileModifiedAt: "", fileAgeSeconds: 0, stale: true, statusKnown: false, lastError: "stream_status_source_missing" };
}

function makeSessionIds(cfg, sourceStatus) {
  const baseStart = sourceStatus.startedAt || nowIso();
  const streamId = String(sourceStatus.streamId || "manual").replace(/[^a-zA-Z0-9_-]+/g, "").slice(0, 48) || "manual";
  const channel = cfg.broadcasterLogin || "stream";
  const stamp = compactIsoForId(baseStart).toLowerCase();
  return {
    streamSessionId: `${channel}_${stamp}_${streamId}`.toLowerCase(),
    streamDayId: `${channel}_${stamp}_${streamId}`.toLowerCase()
  };
}

function getRecentSession(cfg) {
  return database.get(`
    SELECT * FROM stream_status_sessions
    WHERE broadcaster_login=:broadcaster AND status IN ('active','grace')
    ORDER BY id DESC LIMIT 1
  `, { broadcaster: cfg.broadcasterLogin });
}

function closeExpiredGraceSessions(now) {
  database.run(`
    UPDATE stream_status_sessions
    SET status='closed', last_seen_at=:now
    WHERE status='grace' AND restart_grace_until<>'' AND restart_grace_until<:now
  `, { now });
}

function updateSessionForStatus(cfg, sourceStatus) {
  ensureSchema();
  const now = nowIso();
  const nowMs = Date.now();
  closeExpiredGraceSessions(now);

  if (sourceStatus.live && !sourceStatus.stale && sourceStatus.statusKnown !== false) {
    const recent = getRecentSession(cfg);
    const recentGraceMs = msFromIso(recent && recent.restart_grace_until);
    const sameStream = recent && sourceStatus.streamId && String(recent.stream_id || "") === String(sourceStatus.streamId || "");
    const withinGrace = recent && recentGraceMs && recentGraceMs >= nowMs;
    if (recent && (sameStream || withinGrace || recent.status === "active")) {
      database.run(`
        UPDATE stream_status_sessions
        SET status='active', stream_id=CASE WHEN :streamId='' THEN stream_id ELSE :streamId END,
            stream_started_at=CASE WHEN :startedAt='' THEN stream_started_at ELSE :startedAt END,
            last_seen_at=:now, restart_grace_until='', source=:source, meta_json=:metaJson
        WHERE id=:id
      `, {
        id: recent.id,
        streamId: String(sourceStatus.streamId || ""),
        startedAt: String(sourceStatus.startedAt || ""),
        now,
        source: sourceStatus.source || "file",
        metaJson: JSON.stringify({ lastObserved: sourceStatus })
      });
      return database.get(`SELECT * FROM stream_status_sessions WHERE id=:id`, { id: recent.id });
    }

    const ids = makeSessionIds(cfg, sourceStatus);
    database.run(`
      INSERT INTO stream_status_sessions (
        stream_session_id, stream_day_id, broadcaster_login, status, stream_id, stream_started_at,
        first_seen_at, last_seen_at, ended_at, restart_grace_until, source, meta_json
      ) VALUES (
        :sessionId, :dayId, :broadcaster, 'active', :streamId, :startedAt,
        :now, :now, '', '', :source, :metaJson
      )
      ON CONFLICT(stream_session_id) DO UPDATE SET
        status='active', last_seen_at=excluded.last_seen_at, restart_grace_until='', source=excluded.source, meta_json=excluded.meta_json
    `, {
      sessionId: ids.streamSessionId,
      dayId: ids.streamDayId,
      broadcaster: cfg.broadcasterLogin,
      streamId: String(sourceStatus.streamId || ""),
      startedAt: String(sourceStatus.startedAt || now),
      now,
      source: sourceStatus.source || "file",
      metaJson: JSON.stringify({ lastObserved: sourceStatus })
    });
    return database.get(`SELECT * FROM stream_status_sessions WHERE stream_session_id=:sessionId`, { sessionId: ids.streamSessionId });
  }

  const recent = getRecentSession(cfg);
  if (!sourceStatus.stale && sourceStatus.statusKnown !== false && recent && recent.status === "active") {
    const graceUntil = isoFromMs(nowMs + cfg.restartGraceMs);
    database.run(`
      UPDATE stream_status_sessions
      SET status='grace', ended_at=CASE WHEN ended_at='' THEN :now ELSE ended_at END,
          restart_grace_until=:graceUntil, last_seen_at=:now, source=:source
      WHERE id=:id
    `, { id: recent.id, now, graceUntil, source: sourceStatus.source || "offline" });
    return database.get(`SELECT * FROM stream_status_sessions WHERE id=:id`, { id: recent.id });
  }

  if (recent && recent.status === "grace" && msFromIso(recent.restart_grace_until) >= nowMs) return recent;
  if (sourceStatus.stale && recent) return recent;
  return null;
}

function buildStatusFromSource(sourceStatus, session, cfg) {
  const now = nowIso();
  const status = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    live: !!(sourceStatus.live && !sourceStatus.stale && sourceStatus.statusKnown !== false),
    statusKnown: sourceStatus.statusKnown !== false,
    stale: !!sourceStatus.stale,
    broadcasterLogin: cfg.broadcasterLogin,
    streamId: String(sourceStatus.streamId || ""),
    startedAt: String(sourceStatus.startedAt || ""),
    endedAt: session && session.ended_at ? String(session.ended_at) : "",
    lastCheckedAt: now,
    lastLiveAt: sourceStatus.live && !sourceStatus.stale ? now : (readStoredStatus()?.lastLiveAt || ""),
    source: String(sourceStatus.source || "unknown"),
    upstreamSource: String(sourceStatus.upstreamSource || ""),
    apiUrl: String(sourceStatus.apiUrl || ""),
    apiEnabled: cfg.twitchApiEnabled !== false,
    apiFirst: cfg.apiFirst !== false,
    apiError: String(sourceStatus.apiError || state.lastApiError || ""),
    checkedViaApiAt: String(sourceStatus.checkedViaApiAt || state.lastApiRefreshAt || ""),
    file: String(sourceStatus.file || ""),
    fileModifiedAt: String(sourceStatus.fileModifiedAt || ""),
    fileAgeSeconds: Number(sourceStatus.fileAgeSeconds || 0),
    title: String(sourceStatus.title || ""),
    gameName: String(sourceStatus.gameName || ""),
    viewerCount: Number(sourceStatus.viewerCount || 0),
    streamSessionId: session ? String(session.stream_session_id || "") : "",
    streamDayId: session ? String(session.stream_day_id || "") : "",
    sessionStatus: session ? String(session.status || "") : "",
    restartGraceUntil: session ? String(session.restart_grace_until || "") : "",
    restartGraceMs: cfg.restartGraceMs,
    staleAfterMs: cfg.staleAfterMs,
    lastError: String(sourceStatus.lastError || "")
  };
  if (status.stale && !status.lastError) status.lastError = "stream_status_source_stale";
  if (!status.statusKnown && !status.lastError) status.lastError = "stream_status_unknown";
  return status;
}

function persistRefreshedStatus(sourceStatus, cfg) {
  const session = updateSessionForStatus(cfg, sourceStatus);
  const status = buildStatusFromSource(sourceStatus, session, cfg);
  writeStoredStatus(status);
  state.lastCheckedAt = status.lastCheckedAt;
  state.lastStatus = status;
  state.lastError = "";
  state.refreshCount += 1;
  return status;
}

function getStatusAgeMs(status) {
  const checked = msFromIso(status && status.lastCheckedAt);
  return checked ? Math.max(0, Date.now() - checked) : Number.POSITIVE_INFINITY;
}

function shouldUseActiveRefresh(status) {
  if (!status || typeof status !== "object") return false;
  if (status.live === true) return true;
  if (String(status.sessionStatus || "") === "active") return true;
  if (String(status.sessionStatus || "") === "grace") return true;
  const graceUntil = msFromIso(status.restartGraceUntil || "");
  return graceUntil > Date.now();
}

function getAutoRefreshIntervalMs(cfg, status) {
  return shouldUseActiveRefresh(status) ? cfg.autoRefreshActiveMs : cfg.autoRefreshIdleMs;
}

function scheduleAutoRefresh(env, delayMs) {
  if (state.autoRefreshTimer) clearTimeout(state.autoRefreshTimer);
  const delay = Math.max(1000, Number(delayMs || 0) || 1000);
  state.autoRefreshNextRunAt = isoFromMs(Date.now() + delay);
  state.autoRefreshTimer = setTimeout(() => {
    runAutoRefresh(env).catch(err => {
      state.lastError = err && err.message ? err.message : String(err);
    });
  }, delay);
  if (typeof state.autoRefreshTimer.unref === "function") state.autoRefreshTimer.unref();
}

async function runAutoRefresh(env) {
  const cfg = getConfig(env || process.env);
  if (!cfg.autoRefreshEnabled) {
    state.autoRefreshEnabled = false;
    state.autoRefreshNextRunAt = "";
    return;
  }
  if (state.autoRefreshRunning) return;

  state.autoRefreshRunning = true;
  state.autoRefreshLastRunAt = nowIso();
  try {
    const status = await refreshStatusAsync({ env, forceApi: cfg.apiFirst !== false, caller: "auto_refresh" });
    state.autoRefreshIntervalMs = getAutoRefreshIntervalMs(cfg, status);
  } finally {
    state.autoRefreshRunning = false;
    scheduleAutoRefresh(env, state.autoRefreshIntervalMs || cfg.autoRefreshIdleMs);
  }
}

function startAutoRefresh(env) {
  const cfg = getConfig(env || process.env);
  if (!cfg.autoRefreshEnabled) {
    state.autoRefreshEnabled = false;
    return;
  }
  if (state.autoRefreshEnabled) return;
  state.autoRefreshEnabled = true;
  state.autoRefreshStartedAt = nowIso();
  state.autoRefreshIntervalMs = cfg.autoRefreshIdleMs;
  scheduleAutoRefresh(env, 1000);
}

function maybeTriggerAsyncRefresh(env, options = {}) {
  const cfg = getConfig(env || process.env);
  if (!cfg.autoRefreshEnabled && cfg.twitchApiEnabled === false) return;
  const current = state.lastStatus || readStoredStatus();
  if (options.forceAsync === true || getStatusAgeMs(current) > cfg.cacheMaxAgeMs) {
    refreshStatusAsync({ env, forceApi: cfg.apiFirst !== false, caller: options.caller || "get_current" }).catch(err => {
      state.lastError = err && err.message ? err.message : String(err);
    });
  }
}

function refreshStatus(options = {}) {
  const cfg = getConfig(options.env || process.env);
  try {
    ensureSchema();
    const sourceStatus = selectSourceStatus(cfg);
    return persistRefreshedStatus(sourceStatus, cfg);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    const previous = readStoredStatus();
    return previous ? { ...previous, ok: false, lastError: state.lastError } : { ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, live: false, statusKnown: false, stale: true, lastError: state.lastError };
  }
}

async function refreshStatusAsync(options = {}) {
  const cfg = getConfig(options.env || process.env);
  try {
    ensureSchema();
    const sourceStatus = await selectSourceStatusAsync(cfg, options);
    return persistRefreshedStatus(sourceStatus, cfg);
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    const previous = readStoredStatus();
    return previous ? { ...previous, ok: false, lastError: state.lastError } : { ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, live: false, statusKnown: false, stale: true, lastError: state.lastError };
  }
}

function getCurrentStatus(options = {}) {
  const env = options.env || process.env;
  const current = state.lastStatus || readStoredStatus();
  if (options.refresh !== false) maybeTriggerAsyncRefresh(env, options);
  if (current) return current;
  return refreshStatus(options);
}

function listSessions(limit = 20) {
  ensureSchema();
  return database.all(`
    SELECT * FROM stream_status_sessions
    ORDER BY id DESC
    LIMIT :limit
  `, { limit: Math.max(1, Math.min(200, Number.parseInt(limit, 10) || 20)) });
}

function statusPayload(options = {}) {
  const current = getCurrentStatus({ refresh: options.refresh !== false, env: options.env || process.env });
  return {
    ...current,
    state: {
      initialized: state.initialized,
      loadedAt: state.loadedAt,
      refreshCount: state.refreshCount,
      lastApiRefreshAt: state.lastApiRefreshAt,
      lastApiError: state.lastApiError,
      autoRefreshEnabled: state.autoRefreshEnabled,
      autoRefreshStartedAt: state.autoRefreshStartedAt,
      autoRefreshLastRunAt: state.autoRefreshLastRunAt,
      autoRefreshNextRunAt: state.autoRefreshNextRunAt,
      autoRefreshIntervalMs: state.autoRefreshIntervalMs,
      autoRefreshRunning: state.autoRefreshRunning,
      lastError: state.lastError
    },
    routes: [
      { method: "GET", path: `${API_PREFIX}/status` },
      { method: "GET", path: `${API_PREFIX}/current` },
      { method: "GET/POST", path: `${API_PREFIX}/refresh` },
      { method: "GET", path: `${API_PREFIX}/sessions` }
    ]
  };
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
module.exports.getCurrentStatus = getCurrentStatus;
module.exports.refreshStatus = refreshStatus;
module.exports.refreshStatusAsync = refreshStatusAsync;
module.exports.statusPayload = statusPayload;
module.exports.startAutoRefresh = startAutoRefresh;

module.exports.init = function init(ctx = {}) {
  const { app, env } = ctx;
  state.initialized = true;
  refreshStatusAsync({ env, forceApi: getConfig(env || process.env).apiFirst !== false }).catch(err => { state.lastError = err && err.message ? err.message : String(err); });
  startAutoRefresh(env);

  app.get(`${API_PREFIX}/status`, async (req, res) => {
    try {
      const forceApi = String((req.query && req.query.forceApi) || "").toLowerCase() === "1" || String((req.query && req.query.forceApi) || "").toLowerCase() === "true";
      const current = await refreshStatusAsync({ env, forceApi });
      res.json({ ...current, state: statusPayload({ env, refresh: false }).state, routes: statusPayload({ env, refresh: false }).routes });
    }
    catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
  });

  app.get(`${API_PREFIX}/current`, (req, res) => {
    try { res.json(statusPayload({ env, refresh: false })); }
    catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
  });

  async function handleRefresh(req, res) {
    try {
      const forceApi = String((req.query && req.query.forceApi) || (req.body && req.body.forceApi) || "").toLowerCase() === "1" || String((req.query && req.query.forceApi) || (req.body && req.body.forceApi) || "").toLowerCase() === "true";
      const current = await refreshStatusAsync({ env, forceApi });
      res.json({ ...current, state: statusPayload({ env, refresh: false }).state, routes: statusPayload({ env, refresh: false }).routes });
    }
    catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
  }

  app.get(`${API_PREFIX}/refresh`, handleRefresh);
  app.post(`${API_PREFIX}/refresh`, handleRefresh);

  app.get(`${API_PREFIX}/sessions`, (req, res) => {
    try { res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, sessions: listSessions(req.query && req.query.limit) }); }
    catch (err) { res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }
  });

  console.log(`[${MODULE_NAME}] routes active: ${API_PREFIX}/*`);
};
