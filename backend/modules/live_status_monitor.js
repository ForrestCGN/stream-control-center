"use strict";

const http = require("http");
const https = require("https");
const database = require("../core/database");

const MODULE_NAME = "live_status_monitor";
const MODULE_VERSION = "0.1.2";
const MODULE_BUILD = "CAN-44.12.2";
const API_PREFIX = "/api/live-status-monitor";

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: "diagnostics",
  category: "stream",
  description: "Live-Status source monitor, test routes and short-term source logging.",
  routesPrefix: [API_PREFIX],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

const state = {
  initialized: false,
  startedAt: new Date().toISOString(),
  lastCheckedAt: "",
  lastLoggedAt: "",
  lastError: "",
  lastSnapshot: null,
  sampleTimer: null,
  sampleRunning: false,
  sampleCount: 0
};

function nowIso() { return new Date().toISOString(); }
function boolEnv(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return !/^(0|false|no|off)$/i.test(String(value).trim());
}
function intEnv(value, fallback, min, max) {
  const n = Number(value);
  const out = Number.isFinite(n) ? Math.round(n) : fallback;
  return Math.min(max, Math.max(min, out));
}
function cleanLogin(value) { return String(value || "").trim().replace(/^@+/, "").toLowerCase(); }
function firstData(payload) { return payload && Array.isArray(payload.data) && payload.data.length ? payload.data[0] : null; }
function get(obj, path, fallback = undefined) {
  let cur = obj;
  for (const p of String(path || "").split(".")) {
    if (!p) continue;
    if (!cur || typeof cur !== "object" || !(p in cur)) return fallback;
    cur = cur[p];
  }
  return cur === undefined ? fallback : cur;
}
function isLiveValue(value) {
  return value === true || value === "true" || value === "online" || value === "live" || value === "stream.online";
}

function getConfig(env = process.env) {
  const login = cleanLogin(env.TWITCH_BOT_CHANNEL || env.TWITCH_CHANNEL || env.TWITCH_BROADCASTER_LOGIN || "forrestcgn") || "forrestcgn";
  const baseUrl = String(env.LIVE_STATUS_MONITOR_BASE_URL || "http://127.0.0.1:8080").replace(/\/+$/, "");
  return {
    login,
    baseUrl,
    requestTimeoutMs: intEnv(env.LIVE_STATUS_MONITOR_TIMEOUT_MS, 7000, 1000, 30000),
    autoLogEnabled: boolEnv(env.LIVE_STATUS_MONITOR_AUTO_LOG_ENABLED, true),
    autoLogIntervalMs: intEnv(env.LIVE_STATUS_MONITOR_AUTO_LOG_INTERVAL_MS, 60000, 10000, 900000),
    retentionDays: intEnv(env.LIVE_STATUS_MONITOR_LOG_RETENTION_DAYS, 7, 1, 90),
    startDelayMs: intEnv(env.LIVE_STATUS_MONITOR_START_DELAY_MS, 8000, 1000, 120000)
  };
}

function requestJson(url, timeoutMs) {
  return new Promise((resolve) => {
    const startedAt = nowIso();
    let parsed;
    try { parsed = new URL(url); } catch (err) {
      resolve({ ok: false, url, requestedAt: startedAt, receivedAt: nowIso(), error: `invalid_url:${err.message || String(err)}` });
      return;
    }
    const client = parsed.protocol === "https:" ? https : http;
    const req = client.request(parsed, { method: "GET", timeout: timeoutMs }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => {
        const receivedAt = nowIso();
        let data = null;
        try { data = body ? JSON.parse(body) : {}; } catch (err) {
          resolve({ ok: false, url, status: res.statusCode, requestedAt: startedAt, receivedAt, error: `json:${err.message || String(err)}`, body: body.slice(0, 2000) });
          return;
        }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, url, status: res.statusCode, requestedAt: startedAt, receivedAt, data });
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => resolve({ ok: false, url, requestedAt: startedAt, receivedAt: nowIso(), error: err.message || String(err) }));
    req.end();
  });
}

function ensureSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS live_status_monitor_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      effective_live INTEGER NOT NULL DEFAULT 0,
      obs_streaming INTEGER NOT NULL DEFAULT 0,
      eventsub_live TEXT NOT NULL DEFAULT 'unknown',
      twitch_streams_live INTEGER NOT NULL DEFAULT 0,
      twitch_search_live INTEGER NOT NULL DEFAULT 0,
      stream_status_live INTEGER NOT NULL DEFAULT 0,
      confidence TEXT NOT NULL DEFAULT '',
      source_summary TEXT NOT NULL DEFAULT '',
      warnings_json TEXT NOT NULL DEFAULT '[]',
      title TEXT NOT NULL DEFAULT '',
      game_name TEXT NOT NULL DEFAULT '',
      stream_id TEXT NOT NULL DEFAULT '',
      scene_name TEXT NOT NULL DEFAULT '',
      snapshot_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_live_status_monitor_log_created ON live_status_monitor_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_live_status_monitor_log_live ON live_status_monitor_log(effective_live, created_at);
  `);
}

function cleanupOldLogs(retentionDays) {
  try {
    ensureSchema();
    const cutoff = new Date(Date.now() - Math.max(1, retentionDays) * 86400000).toISOString();
    database.run(`DELETE FROM live_status_monitor_log WHERE created_at < :cutoff`, { cutoff });
  } catch (err) {
    state.lastError = err.message || String(err);
  }
}

function parseObs(source) {
  const payload = source && source.data;
  const data = payload && payload.data ? payload.data : payload;
  const diagState = payload && payload.diagnostics && payload.diagnostics.state ? payload.diagnostics.state : {};
  const streamActive = !!(data && data.streamActive === true) || !!(diagState && diagState.streamActive === true);
  return {
    ok: !!(source && source.ok),
    obsConnected: !!(data && data.obsConnected === true) || !!(diagState && diagState.obsConnected === true),
    obsDetected: !!(data && data.obsDetected === true) || !!(diagState && diagState.obsDetected === true),
    streamActive,
    currentScene: String((data && data.currentProgramSceneName) || (diagState && diagState.currentProgramSceneName) || ""),
    lastError: String((data && data.lastError) || get(payload, "diagnostics.lastError", "") || source.error || "")
  };
}

function parseTwitchStream(source) {
  const payload = source && source.data;
  const row = firstData(payload);
  const live = !!(row && (row.type === "live" || row._fallback === true || row._source === "search_channels_fallback"));
  return {
    ok: !!(source && source.ok),
    live,
    streamId: String(row && row.id || ""),
    title: String(row && row.title || ""),
    gameName: String(row && (row.game_name || row.gameName) || ""),
    source: String(row && row._source || get(payload, "diagnostics.selectedSource", "")),
    streamsByIdCount: Number(get(payload, "diagnostics.streamsByIdCount", 0)) || 0,
    streamsByLoginCount: Number(get(payload, "diagnostics.streamsByLoginCount", 0)) || 0,
    searchLiveExactMatch: get(payload, "diagnostics.searchLiveExactMatch", false) === true,
    fallbackUsed: get(payload, "diagnostics.searchFallbackUsed", false) === true,
    error: String(source && source.error || "")
  };
}

function parseTwitchSummary(source) {
  const payload = source && source.data;
  return {
    ok: !!(source && source.ok),
    live: !!(payload && payload.is_live === true),
    source: String(payload && payload.live_source || get(payload, "diagnostics.selectedSource", "")),
    title: String(payload && payload.title || ""),
    gameName: String(payload && (payload.game_name || payload.gameName) || ""),
    streamId: String(payload && (payload.stream_id || payload.streamId) || ""),
    searchLiveExactMatch: get(payload, "diagnostics.searchLiveExactMatch", false) === true,
    fallbackUsed: get(payload, "diagnostics.searchFallbackUsed", false) === true,
    error: String(source && source.error || "")
  };
}

function parseStreamStatus(source) {
  const payload = source && source.data;
  return {
    ok: !!(source && source.ok),
    live: !!(payload && payload.live === true),
    title: String(payload && payload.title || ""),
    gameName: String(payload && payload.gameName || ""),
    streamId: String(payload && payload.streamId || ""),
    source: String(payload && payload.source || ""),
    upstreamSource: String(payload && payload.upstreamSource || ""),
    sessionStatus: String(payload && payload.sessionStatus || ""),
    lastError: String(payload && payload.lastError || source.error || "")
  };
}

function parseEventSub(source) {
  const payload = source && source.data;
  const text = JSON.stringify(payload || {}).toLowerCase();
  const connected = /connected|open|ready|enabled/.test(text) || !!get(payload, "eventsub.connected", false) || !!get(payload, "connected", false);
  let live = "unknown";
  const candidates = [
    get(payload, "live"), get(payload, "isLive"), get(payload, "eventSubLive"), get(payload, "eventsubLive"), get(payload, "streamLive"), get(payload, "state.live"), get(payload, "status.live")
  ];
  if (candidates.some(v => v === true || v === "true" || v === "online" || v === "live")) live = "online";
  if (candidates.some(v => v === false || v === "false" || v === "offline")) live = "offline";
  return {
    ok: !!(source && source.ok),
    connected,
    live,
    routeAvailable: !!(source && source.status !== 404 && !String(source.error || "").includes("404")),
    error: String(source && source.error || "")
  };
}

function warning(key, message) { return { key, message }; }

function buildDecision(parsed) {
  const obsStreaming = parsed.obs.streamActive === true;
  const twitchStreamsLive = parsed.twitchStream.live === true;
  const twitchSearchLive = parsed.twitchSummary.live === true || parsed.twitchStream.source === "search_channels_fallback" || parsed.twitchStream.searchLiveExactMatch === true;
  const streamStatusLive = parsed.streamStatus.live === true;
  const eventSubOnline = parsed.eventSub.live === "online";
  const eventSubOffline = parsed.eventSub.live === "offline";
  const effectiveLive = obsStreaming || eventSubOnline || twitchStreamsLive || twitchSearchLive || streamStatusLive;
  const sourceParts = [];
  if (obsStreaming) sourceParts.push("obs");
  if (eventSubOnline) sourceParts.push("eventsub");
  if (twitchStreamsLive) sourceParts.push("twitch_streams");
  if (twitchSearchLive) sourceParts.push("twitch_search");
  if (streamStatusLive) sourceParts.push("stream_status");

  const warnings = [];
  if (obsStreaming && !twitchStreamsLive && !twitchSearchLive) warnings.push(warning("obs_live_twitch_offline", "OBS sendet, aber Twitch-Livequellen melden nicht live."));
  if (!obsStreaming && (twitchStreamsLive || twitchSearchLive || eventSubOnline)) warnings.push(warning("twitch_live_obs_not_streaming", "Twitch/EventSub meldet live, aber OBS streamActive ist false."));
  if ((twitchSearchLive || eventSubOnline || obsStreaming) && !twitchStreamsLive) warnings.push(warning("twitch_streams_empty", "Twitch /streams liefert leer, aber mindestens eine andere Quelle meldet live."));
  if (eventSubOffline && (obsStreaming || twitchStreamsLive || twitchSearchLive)) warnings.push(warning("eventsub_offline_conflict", "EventSub wirkt offline, aber andere Quellen melden live."));
  if (parsed.obs.ok && !parsed.obs.obsConnected) warnings.push(warning("obs_not_connected", "OBS-Modul ist nicht verbunden."));
  if (!parsed.eventSub.routeAvailable) warnings.push(warning("eventsub_status_unavailable", "EventSub-Statusroute nicht verfügbar oder nicht erreichbar."));

  let confidence = "low";
  const liveVotes = [obsStreaming, eventSubOnline, twitchStreamsLive, twitchSearchLive, streamStatusLive].filter(Boolean).length;
  if (effectiveLive && liveVotes >= 2) confidence = "high";
  else if (effectiveLive && liveVotes === 1) confidence = obsStreaming ? "medium" : "medium";
  else if (!effectiveLive && parsed.obs.ok && parsed.twitchStream.ok && parsed.twitchSummary.ok) confidence = "high";

  const title = parsed.streamStatus.title || parsed.twitchStream.title || parsed.twitchSummary.title || "";
  const gameName = parsed.streamStatus.gameName || parsed.twitchStream.gameName || parsed.twitchSummary.gameName || "";
  const streamId = parsed.streamStatus.streamId || parsed.twitchStream.streamId || parsed.twitchSummary.streamId || "";

  return {
    effectiveLive,
    obsStreaming,
    eventSubLive: parsed.eventSub.live,
    twitchStreamsLive,
    twitchSearchLive,
    streamStatusLive,
    confidence,
    sourceSummary: sourceParts.length ? sourceParts.join("+") : "none",
    warnings,
    title,
    gameName,
    streamId,
    sceneName: parsed.obs.currentScene || ""
  };
}

async function collectStatus(cfg, options = {}) {
  const login = encodeURIComponent(cfg.login);
  const base = cfg.baseUrl;
  const urls = {
    obs: `${base}/api/obs/status`,
    twitchUser: `${base}/api/twitch/user?login=${login}`,
    twitchChannel: "",
    twitchStream: `${base}/api/twitch/stream?login=${login}&debug=1`,
    twitchSummary: `${base}/api/twitch/stream/summary?login=${login}&debug=1`,
    streamStatus: `${base}/api/stream-status/status?forceApi=1`,
    eventSub: `${base}/api/twitch/eventsub/status?refresh=1`
  };

  const baseResults = await Promise.all([
    requestJson(urls.obs, cfg.requestTimeoutMs),
    requestJson(urls.twitchUser, cfg.requestTimeoutMs),
    requestJson(urls.twitchStream, cfg.requestTimeoutMs),
    requestJson(urls.twitchSummary, cfg.requestTimeoutMs),
    requestJson(urls.streamStatus, cfg.requestTimeoutMs),
    requestJson(urls.eventSub, cfg.requestTimeoutMs)
  ]);
  const twitchUser = baseResults[1];
  const userId = String(firstData(twitchUser.data) && firstData(twitchUser.data).id || "");
  let twitchChannel = { ok: false, error: "user_id_missing", data: {} };
  if (userId) {
    urls.twitchChannel = `${base}/api/twitch/channel?id=${encodeURIComponent(userId)}`;
    twitchChannel = await requestJson(urls.twitchChannel, cfg.requestTimeoutMs);
  }

  const sources = {
    obs: baseResults[0],
    twitchUser,
    twitchChannel,
    twitchStream: baseResults[2],
    twitchSummary: baseResults[3],
    streamStatus: baseResults[4],
    eventSub: baseResults[5]
  };
  const parsed = {
    obs: parseObs(sources.obs),
    twitchStream: parseTwitchStream(sources.twitchStream),
    twitchSummary: parseTwitchSummary(sources.twitchSummary),
    streamStatus: parseStreamStatus(sources.streamStatus),
    eventSub: parseEventSub(sources.eventSub)
  };
  const decision = buildDecision(parsed);
  const snapshot = {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    checkedAt: nowIso(),
    broadcasterLogin: cfg.login,
    decision,
    parsed,
    urls,
    sources: options.includeRaw === false ? undefined : sources,
    logger: {
      autoLogEnabled: cfg.autoLogEnabled,
      autoLogIntervalMs: cfg.autoLogIntervalMs,
      retentionDays: cfg.retentionDays,
      sampleCount: state.sampleCount,
      lastLoggedAt: state.lastLoggedAt,
      lastError: state.lastError
    }
  };
  state.lastCheckedAt = snapshot.checkedAt;
  state.lastSnapshot = snapshot;
  return snapshot;
}

function logSnapshot(snapshot, reason = "manual") {
  ensureSchema();
  const d = snapshot && snapshot.decision ? snapshot.decision : {};
  database.run(`
    INSERT INTO live_status_monitor_log (
      created_at, effective_live, obs_streaming, eventsub_live, twitch_streams_live, twitch_search_live,
      stream_status_live, confidence, source_summary, warnings_json, title, game_name, stream_id, scene_name, snapshot_json
    ) VALUES (
      :createdAt, :effectiveLive, :obsStreaming, :eventSubLive, :twitchStreamsLive, :twitchSearchLive,
      :streamStatusLive, :confidence, :sourceSummary, :warningsJson, :title, :gameName, :streamId, :sceneName, :snapshotJson
    )
  `, {
    createdAt: nowIso(),
    effectiveLive: d.effectiveLive ? 1 : 0,
    obsStreaming: d.obsStreaming ? 1 : 0,
    eventSubLive: String(d.eventSubLive || "unknown"),
    twitchStreamsLive: d.twitchStreamsLive ? 1 : 0,
    twitchSearchLive: d.twitchSearchLive ? 1 : 0,
    streamStatusLive: d.streamStatusLive ? 1 : 0,
    confidence: String(d.confidence || ""),
    sourceSummary: String(d.sourceSummary || ""),
    warningsJson: JSON.stringify(d.warnings || []),
    title: String(d.title || ""),
    gameName: String(d.gameName || ""),
    streamId: String(d.streamId || ""),
    sceneName: String(d.sceneName || ""),
    snapshotJson: JSON.stringify({ reason, snapshot })
  });
  state.lastLoggedAt = nowIso();
}

function readLogs(limit = 200) {
  ensureSchema();
  const safeLimit = Math.min(1000, Math.max(1, Number(limit) || 200));
  const rows = database.all(`SELECT * FROM live_status_monitor_log ORDER BY id DESC LIMIT ${safeLimit}`);
  return rows.map(row => ({
    ...row,
    effective_live: !!row.effective_live,
    obs_streaming: !!row.obs_streaming,
    twitch_streams_live: !!row.twitch_streams_live,
    twitch_search_live: !!row.twitch_search_live,
    stream_status_live: !!row.stream_status_live,
    warnings: (() => { try { return JSON.parse(row.warnings_json || "[]"); } catch (_) { return []; } })()
  }));
}

function getPublicState() {
  return {
    initialized: state.initialized === true,
    startedAt: state.startedAt || "",
    lastCheckedAt: state.lastCheckedAt || "",
    lastLoggedAt: state.lastLoggedAt || "",
    lastError: state.lastError || "",
    hasLastSnapshot: !!state.lastSnapshot,
    autoLogActive: !!state.sampleTimer,
    sampleRunning: state.sampleRunning === true,
    sampleCount: Number(state.sampleCount || 0) || 0
  };
}

function routeList() {
  return [
    { method: "GET", path: `${API_PREFIX}/status`, purpose: "collect current live source status; use ?log=1 to persist" },
    { method: "POST", path: `${API_PREFIX}/test`, purpose: "collect and persist a manual test snapshot" },
    { method: "GET", path: `${API_PREFIX}/logs`, purpose: "read recent live source monitor log entries" },
    { method: "GET", path: `${API_PREFIX}/routes`, purpose: "list module routes" }
  ];
}

function setHeaders(res) {
  res.set("Cache-Control", "no-store");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
}
function ok(res, data) { setHeaders(res); res.json(data); }
function fail(res, err, status = 500) { setHeaders(res); res.status(status).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) }); }

function scheduleAutoLog(cfg) {
  if (state.sampleTimer) clearTimeout(state.sampleTimer);
  if (!cfg.autoLogEnabled) return;
  state.sampleTimer = setTimeout(async () => {
    state.sampleTimer = null;
    if (state.sampleRunning) {
      scheduleAutoLog(cfg);
      return;
    }
    state.sampleRunning = true;
    try {
      const snap = await collectStatus(cfg, { includeRaw: false });
      logSnapshot(snap, "auto");
      cleanupOldLogs(cfg.retentionDays);
      state.sampleCount += 1;
      state.lastError = "";
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
    } finally {
      state.sampleRunning = false;
      scheduleAutoLog(cfg);
    }
  }, cfg.autoLogIntervalMs);
}

function init(ctx) {
  const { app, env } = ctx;
  const cfg = getConfig(env);
  ensureSchema();
  cleanupOldLogs(cfg.retentionDays);

  app.options(new RegExp(`^${API_PREFIX.replace(/[\/]/g, "\\/")}(?:\\/.*)?$`), (req, res) => { setHeaders(res); res.status(204).end(); });

  app.get(`${API_PREFIX}/routes`, (req, res) => ok(res, { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, routes: routeList() }));

  app.get(`${API_PREFIX}/status`, async (req, res) => {
    try {
      const snap = await collectStatus(cfg, { includeRaw: String(req.query.raw || "1") !== "0" });
      if (/^(1|true|yes|on)$/i.test(String(req.query.log || ""))) {
        logSnapshot(snap, "manual-status");
        cleanupOldLogs(cfg.retentionDays);
      }
      ok(res, snap);
    } catch (err) { fail(res, err); }
  });

  app.post(`${API_PREFIX}/test`, async (req, res) => {
    try {
      const snap = await collectStatus(cfg, { includeRaw: true });
      logSnapshot(snap, "manual-test");
      cleanupOldLogs(cfg.retentionDays);
      ok(res, { ...snap, logged: true });
    } catch (err) { fail(res, err); }
  });

  app.get(`${API_PREFIX}/logs`, (req, res) => {
    try { ok(res, { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, logs: readLogs(req.query.limit || 200), state: getPublicState() }); }
    catch (err) { fail(res, err); }
  });

  state.initialized = true;
  if (cfg.autoLogEnabled) {
    setTimeout(() => scheduleAutoLog(cfg), cfg.startDelayMs);
  }
}

module.exports = { init, MODULE_META, MODULE_VERSION, version: MODULE_VERSION };
