"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");
const database = require("../core/database");
const twitch = require("./twitch");
const twitchPresence = require("./twitch_presence");
let communicationBus = null;
try { communicationBus = require("./communication_bus"); } catch (_) { communicationBus = null; }

const MODULE_NAME = "clip_shoutout";
const MODULE_VERSION = "0.2.3";
const SHOUTOUT_BUS_CHANNEL = "shoutout.system";
const CONFIG_FILE = "clip_system.json";
const API_PREFIX = "/api/clip-shoutout";

const DEFAULT_CONFIG = {
  clipShoutout: {
    enabled: true,
    command: "so",
    aliases: ["vso", "clipso", "videoso"],
    permissionLevel: "mod",
    cooldownGlobalMs: 5000,
    cooldownUserMs: 15000,
    maxClipDurationSeconds: 30,
    allowLongerClipFallback: true,
    fallbackMaxClipDurationSeconds: 60,
    clipLookbackDays: 90,
    clipSearchRangesDays: [90, 365, 0],
    clipFetchFirst: 50,
    clipFetchPages: 3,
    randomPick: true,
    minViewCount: 0,
    avoidRecentClips: true,
    recentClipMemoryPerChannel: 5,
    recentClipFallbackWhenAllBlocked: true,
    allowBroadcasterSelfTarget: true,
    clipPlaybackMode: "direct",
    cacheDownloadedClips: false,
    downloadDir: "htdocs/assets/sounds/clip_shoutout",
    publicSoundFilePrefix: "clip_shoutout",
    soundBundleUrl: "http://127.0.0.1:8080/api/sound/bundle",
    soundCategory: "vip",
    soundSource: "clip_shoutout",
    soundPriority: 60,
    soundVolume: 100,
    sendChatMessage: true,
    chatMessage: "✅ Shouti für @{displayName} aufgenommen.",
    ttsAfterClipEnabled: false,
    ttsText: "Schaut gerne mal bei {displayName} vorbei.",
    ttsSynthesizeUrl: "http://127.0.0.1:8080/api/tts/synthesize",
    ttsVoice: "",
    ttsVolume: 100,
    ttsPriorityOffset: 0,
    ttsCategory: "tts",
    ttsSource: "clip_shoutout_tts",
    overlaySubline: "🧓 Altersheim-TV",
    avatarLookupEnabled: true,
    avatarLookupUrl: "http://127.0.0.1:8080/userinfo",
    gqlClientId: "kimne78kx3ncx6brgo4mv6wki5h1ko",
    eventBusEnabled: true,
    displayQueue: {
      enabled: true,
      displayCooldownMs: 120000,
      cooldownStartsAfterFinish: true,
      workerIntervalMs: 2000,
      sendChatMessages: true,
      acceptedMessage: "✅ Shouti für @{displayName} aufgenommen.",
      waitingMessage: "⏳ Shouti für @{displayName} aufgenommen und wartet in der Warteschlange.",
      startedMessage: "",
      failedMessage: "⚠️ Shouti für @{displayName} konnte nicht gestartet werden."
    },
    officialShoutout: {
      enabled: true,
      enqueueAfterDisplay: true,
      sendChatMessages: true,
      acceptedMessage: "✅ Shouti für @{displayName} aufgenommen.",
      queuedMessage: "⏳ Offizieller Shoutout für @{displayName} ist vorgemerkt und wird nach dem Cooldown gesendet.",
      sentMessage: "📣 Offizieller Twitch-Shoutout für @{displayName} wurde gesendet.",
      duplicateQueuedMessage: "ℹ️ Für @{displayName} ist bereits ein offizieller Shoutout vorgemerkt.",
      targetCooldownMessage: "ℹ️ Für @{displayName} läuft noch der Twitch-Ziel-Cooldown.",
      failedMessage: "⚠️ Offizieller Shoutout für @{displayName} konnte nicht gesendet werden.",
      globalCooldownMs: 120000,
      targetCooldownMs: 3600000,
      workerIntervalMs: 5000,
      maxAttempts: 5,
      displayFinishPaddingMs: 1500,
      streamWaitRetryMs: 60000,
      broadcasterId: "",
      moderatorId: ""
    }
  }
};

const state = {
  loadedAt: core.nowIso(),
  configPath: "",
  configOk: false,
  configError: "",
  registeredCommand: false,
  lastRunAt: "",
  lastRun: null,
  lastClipSearch: null,
  lastError: "",
  recentClipGuard: { memory: {}, lastSelection: null },
  stats: {
    requested: 0,
    queued: 0,
    failed: 0,
    noClips: 0,
    ttsPrepared: 0,
    chatSent: 0,
    displayQueued: 0,
    displayStarted: 0,
    displayFinished: 0,
    officialQueued: 0,
    officialSent: 0,
    officialFailed: 0,
    busEmitted: 0,
    busErrors: 0
  },
  displayQueue: {
    workerStarted: false,
    lastQueueId: 0,
    lastEnqueuedAt: "",
    lastStartedAt: "",
    lastFinishedAt: "",
    lastError: "",
    lastBusEvent: null
  },
  officialShoutout: {
    workerStarted: false,
    lastWorkerAt: "",
    lastQueueId: 0,
    lastSentAt: "",
    lastError: "",
    lastBusEvent: null
  }
};

let appToken = null;
let appTokenExpiresAt = 0;
const recentClipMemory = new Map();

function nowIso() {
  return core.nowIso();
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergePlain(base, extra) {
  const out = { ...(base || {}) };
  if (!isPlainObject(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (isPlainObject(value) && isPlainObject(out[key])) out[key] = mergePlain(out[key], value);
    else if (Array.isArray(value)) out[key] = value.slice();
    else out[key] = value;
  }
  return out;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(v)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(v)) return false;
  return fallback;
}

function intParam(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  const clean = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, clean));
}

function cleanLogin(value) {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function cleanDisplay(value, fallback = "") {
  return String(value || fallback || "").trim().replace(/^@+/, "");
}

function loadConfig() {
  const loaded = configHelper.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  const cfg = mergePlain(DEFAULT_CONFIG, loaded.config || {});
  state.configPath = loaded.path || "";
  state.configOk = !!loaded.ok;
  state.configError = loaded.error || "";
  return cfg;
}

function shoutoutConfig() {
  return mergePlain(DEFAULT_CONFIG.clipShoutout, (loadConfig().clipShoutout || {}));
}

function saveShoutoutConfig(partial = {}) {
  const loaded = configHelper.loadConfig(CONFIG_FILE, DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true, spaces: 2 });
  const current = mergePlain(DEFAULT_CONFIG, loaded.config || {});
  current.clipShoutout = mergePlain(current.clipShoutout || {}, partial || {});
  configHelper.writeJsonFile(configHelper.resolveConfigFile(CONFIG_FILE), current, { spaces: 2 });
  return current.clipShoutout;
}

function getCommunicationBus() {
  if (!communicationBus || typeof communicationBus.getBus !== "function") return null;
  try { return communicationBus.getBus(); } catch (_) { return null; }
}

function emitShoutoutBus(action, payload = {}, cfg = null) {
  const currentCfg = cfg || shoutoutConfig();
  if (currentCfg.eventBusEnabled === false) return { ok: true, skipped: true, reason: "eventbus_disabled" };
  const bus = getCommunicationBus();
  if (!bus || typeof bus.emit !== "function") {
    state.stats.busErrors += 1;
    state.officialShoutout.lastError = "communication_bus_unavailable";
    return { ok: false, skipped: true, reason: "communication_bus_unavailable" };
  }
  try {
    const result = bus.emit({
      channel: SHOUTOUT_BUS_CHANNEL,
      action: String(action || "state.updated"),
      source: { type: "module", id: MODULE_NAME, module: MODULE_NAME },
      target: { type: "all", id: "*", module: "", capability: "shoutout.system" },
      payload: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        action: String(action || ""),
        ...payload,
        emittedAt: nowIso()
      },
      meta: {
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        capability: "shoutout.system",
        replayable: false,
        requireAck: false,
        ttlMs: 30000
      }
    });
    state.stats.busEmitted += 1;
    state.officialShoutout.lastBusEvent = { action: String(action || ""), at: nowIso(), eventId: result && result.eventId ? String(result.eventId) : "" };
    return result || { ok: true };
  } catch (err) {
    state.stats.busErrors += 1;
    state.officialShoutout.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.officialShoutout.lastError };
  }
}


function displayConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.displayQueue, (cfg && cfg.displayQueue) || {});
}

function ensureDisplayQueueSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_display_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_login TEXT NOT NULL,
      target_display TEXT NOT NULL DEFAULT '',
      requested_by_login TEXT NOT NULL DEFAULT '',
      requested_by_display TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0,
      available_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT '',
      finished_at TEXT NOT NULL DEFAULT '',
      last_error TEXT NOT NULL DEFAULT '',
      input_json TEXT NOT NULL DEFAULT '{}',
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_clip_so_display_queue_status_available ON clip_shoutout_display_queue(status, available_at);
  `);
}

function resetStaleDisplayQueueActiveRows() {
  try {
    ensureDisplayQueueSchema();
    database.run(`UPDATE clip_shoutout_display_queue SET status='waiting', updated_at=:now, last_error='reset_stale_active_on_start' WHERE status='active'`, { now: nowIso() });
  } catch (_) {}
}

function listDisplayQueue(limit = 50) {
  ensureDisplayQueueSchema();
  const safeLimit = Math.max(1, Math.min(200, Number.parseInt(limit, 10) || 50));
  return database.all(`SELECT * FROM clip_shoutout_display_queue WHERE status IN ('queued','waiting','active','failed') ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, available_at ASC, id ASC LIMIT ${safeLimit}`);
}

function lastDisplayFinishedMs() {
  ensureDisplayQueueSchema();
  const row = database.get(`SELECT finished_at FROM clip_shoutout_display_queue WHERE status='done' AND finished_at<>'' ORDER BY finished_at DESC LIMIT 1`);
  return msFromIso(row && row.finished_at);
}

function calculateDisplayAvailableAt(cfg, baseMs = Date.now()) {
  const dcfg = displayConfig(cfg);
  const cooldown = Math.max(0, Number(dcfg.displayCooldownMs || 120000));
  const lastFinished = lastDisplayFinishedMs();
  return Math.max(Number(baseMs || Date.now()), lastFinished ? lastFinished + cooldown : 0);
}

function enqueueDisplayShoutout(job, cfg) {
  ensureDisplayQueueSchema();
  const login = cleanLogin(job.targetLogin);
  if (!login) return { ok: false, error: 'target_login_missing' };
  const now = nowIso();
  const availableAt = isoFromMs(calculateDisplayAvailableAt(cfg, Date.parse(job.availableAt || '') || Date.now()));
  const params = {
    targetLogin: login,
    targetDisplay: cleanDisplay(job.targetDisplay, login),
    requestedByLogin: cleanLogin(job.requestedByLogin || ''),
    requestedByDisplay: cleanDisplay(job.requestedByDisplay || ''),
    availableAt,
    createdAt: now,
    updatedAt: now,
    inputJson: JSON.stringify(job.input || {}),
    metaJson: JSON.stringify(job.meta || {})
  };
  const result = database.run(`
    INSERT INTO clip_shoutout_display_queue (
      target_login,target_display,requested_by_login,requested_by_display,
      status,attempts,available_at,created_at,updated_at,input_json,meta_json
    ) VALUES (
      :targetLogin,:targetDisplay,:requestedByLogin,:requestedByDisplay,
      'queued',0,:availableAt,:createdAt,:updatedAt,:inputJson,:metaJson
    )
  `, params);
  const rowId = result && (result.lastInsertRowid || result.lastInsertRowId) ? (result.lastInsertRowid || result.lastInsertRowId) : 0;
  const row = database.get(`SELECT * FROM clip_shoutout_display_queue WHERE id=:id`, { id: rowId });
  state.stats.displayQueued += 1;
  state.displayQueue.lastQueueId = row ? row.id : 0;
  state.displayQueue.lastEnqueuedAt = now;
  emitShoutoutBus('shoutout.display.queued', { queueId: row ? row.id : 0, targetLogin: login, availableAt }, cfg);
  return { ok: true, row, availableAt };
}

function markDisplayQueueDone(row, cfg) {
  ensureDisplayQueueSchema();
  const now = nowIso();
  database.run(`UPDATE clip_shoutout_display_queue SET status='done', updated_at=:now, finished_at=:now, last_error='' WHERE id=:id`, { id: row.id, now });
  state.stats.displayFinished += 1;
  state.displayQueue.lastFinishedAt = now;
  emitShoutoutBus('shoutout.display.queue_finished', { queueId: row.id, targetLogin: row.target_login }, cfg);
}

function markDisplayQueueFailed(row, error, cfg) {
  ensureDisplayQueueSchema();
  const now = nowIso();
  database.run(`UPDATE clip_shoutout_display_queue SET status='failed', attempts=attempts+1, updated_at=:now, last_error=:error WHERE id=:id`, { id: row.id, now, error: String(error || '') });
  state.displayQueue.lastError = String(error || '');
  emitShoutoutBus('shoutout.display.failed', { queueId: row.id, targetLogin: row.target_login, error: String(error || '') }, cfg);
}

function displayQueueStatus(cfg) {
  const queue = listDisplayQueue(50);
  const active = queue.find(row => row.status === 'active') || null;
  const dcfg = displayConfig(cfg);
  const nowMs = Date.now();
  const nextAllowedMs = active ? 0 : calculateDisplayAvailableAt(cfg);
  const cooldownRunning = Boolean(!active && nextAllowedMs > nowMs);
  const cooldownRemainingMs = cooldownRunning ? Math.max(0, nextAllowedMs - nowMs) : 0;
  return {
    enabled: dcfg.enabled !== false,
    workerStarted: state.displayQueue.workerStarted,
    pending: queue.filter(row => row.status === 'queued' || row.status === 'waiting' || row.status === 'active').length,
    active,
    activeTarget: active ? cleanLogin(active.target_login || "") : "",
    activeTargetDisplay: active ? cleanDisplay(active.target_display || active.target_login || "") : "",
    queue,
    displayCooldownMs: Math.max(0, Number(dcfg.displayCooldownMs || 120000)),
    cooldownStartsAfterFinish: true,
    cooldownRunning,
    cooldownRemainingMs,
    nextDisplayAllowedAt: active ? "" : (nextAllowedMs > 0 ? isoFromMs(nextAllowedMs) : ""),
    lastStartedAt: state.displayQueue.lastStartedAt,
    lastFinishedAt: state.displayQueue.lastFinishedAt,
    lastError: state.displayQueue.lastError
  };
}

function isTwitchLiveWaitError(errorText) {
  const text = String(errorText || '').toLowerCase();
  return text.includes('not streaming live') || text.includes('does not have one or more viewers') || text.includes('broadcaster is not streaming');
}

function officialConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.officialShoutout, (cfg && cfg.officialShoutout) || {});
}

function ensureOfficialShoutoutSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_official_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_login TEXT NOT NULL,
      target_display TEXT NOT NULL DEFAULT '',
      target_user_id TEXT NOT NULL DEFAULT '',
      requested_by_login TEXT NOT NULL DEFAULT '',
      requested_by_display TEXT NOT NULL DEFAULT '',
      clip_id TEXT NOT NULL DEFAULT '',
      clip_url TEXT NOT NULL DEFAULT '',
      bundle_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0,
      available_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sent_at TEXT NOT NULL DEFAULT '',
      last_error TEXT NOT NULL DEFAULT '',
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_clip_so_queue_status_available ON clip_shoutout_official_queue(status, available_at);
    CREATE TABLE IF NOT EXISTS clip_shoutout_official_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_login TEXT NOT NULL,
      target_display TEXT NOT NULL DEFAULT '',
      target_user_id TEXT NOT NULL DEFAULT '',
      queue_id INTEGER NOT NULL DEFAULT 0,
      result TEXT NOT NULL DEFAULT '',
      error TEXT NOT NULL DEFAULT '',
      sent_at TEXT NOT NULL,
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
  `);
}

function isoFromMs(ms) { return new Date(Math.max(0, Number(ms || 0))).toISOString(); }
function msFromIso(value) { const t = Date.parse(String(value || "")); return Number.isFinite(t) ? t : 0; }

function listOfficialQueue(limit = 50) {
  ensureOfficialShoutoutSchema();
  const safeLimit = Math.max(1, Math.min(200, Number.parseInt(limit, 10) || 50));
  return database.all(`SELECT * FROM clip_shoutout_official_queue WHERE status IN ('queued','waiting','failed') ORDER BY available_at ASC, id ASC LIMIT ${safeLimit}`);
}

function listOfficialHistory(limit = 20) {
  ensureOfficialShoutoutSchema();
  const safeLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 20));
  return database.all(`SELECT * FROM clip_shoutout_official_history ORDER BY id DESC LIMIT ${safeLimit}`);
}

function nextGlobalAllowedAt(cfg) {
  ensureOfficialShoutoutSchema();
  const cooldown = Math.max(0, Number(officialConfig(cfg).globalCooldownMs || 120000));
  const row = database.get(`SELECT sent_at FROM clip_shoutout_official_history WHERE result='sent' ORDER BY sent_at DESC LIMIT 1`);
  const last = msFromIso(row && row.sent_at);
  return last ? last + cooldown : 0;
}

function nextTargetAllowedAt(targetLogin, cfg) {
  ensureOfficialShoutoutSchema();
  const cooldown = Math.max(0, Number(officialConfig(cfg).targetCooldownMs || 3600000));
  const login = cleanLogin(targetLogin);
  const row = database.get(`SELECT sent_at FROM clip_shoutout_official_history WHERE result='sent' AND target_login=:login ORDER BY sent_at DESC LIMIT 1`, { login });
  const last = msFromIso(row && row.sent_at);
  return last ? last + cooldown : 0;
}

function calculateOfficialAvailableAt(targetLogin, cfg, baseMs = Date.now()) {
  return Math.max(Number(baseMs || Date.now()), nextGlobalAllowedAt(cfg), nextTargetAllowedAt(targetLogin, cfg));
}

function enqueueOfficialShoutout(job, cfg) {
  ensureOfficialShoutoutSchema();
  const login = cleanLogin(job.targetLogin);
  if (!login) return { ok: false, error: "target_login_missing" };
  const existing = database.get(`SELECT * FROM clip_shoutout_official_queue WHERE target_login=:login AND status IN ('queued','waiting') ORDER BY id ASC LIMIT 1`, { login });
  if (existing) {
    emitShoutoutBus("shoutout.official.duplicate", { targetLogin: login, queueId: existing.id }, cfg);
    return { ok: true, duplicate: true, row: existing };
  }
  const now = nowIso();
  const availableAt = isoFromMs(calculateOfficialAvailableAt(login, cfg, Date.parse(job.availableAt || '') || Date.now()));
  const params = {
    targetLogin: login,
    targetDisplay: cleanDisplay(job.targetDisplay, login),
    targetUserId: String(job.targetUserId || ""),
    requestedByLogin: cleanLogin(job.requestedByLogin || ""),
    requestedByDisplay: cleanDisplay(job.requestedByDisplay || ""),
    clipId: String(job.clipId || ""),
    clipUrl: String(job.clipUrl || ""),
    bundleId: String(job.bundleId || ""),
    availableAt,
    createdAt: now,
    updatedAt: now,
    metaJson: JSON.stringify(job.meta || {})
  };
  const result = database.run(`
    INSERT INTO clip_shoutout_official_queue (
      target_login,target_display,target_user_id,requested_by_login,requested_by_display,
      clip_id,clip_url,bundle_id,status,attempts,available_at,created_at,updated_at,meta_json
    ) VALUES (
      :targetLogin,:targetDisplay,:targetUserId,:requestedByLogin,:requestedByDisplay,
      :clipId,:clipUrl,:bundleId,'queued',0,:availableAt,:createdAt,:updatedAt,:metaJson
    )
  `, params);
  const row = database.get(`SELECT * FROM clip_shoutout_official_queue WHERE id=:id`, { id: result && result.lastInsertRowid ? result.lastInsertRowid : result.lastInsertRowId });
  state.stats.officialQueued += 1;
  state.officialShoutout.lastQueueId = row ? row.id : 0;
  emitShoutoutBus("shoutout.official.queued", { queueId: row ? row.id : 0, targetLogin: login, availableAt }, cfg);
  return { ok: true, row, availableAt };
}

function markOfficialQueueFailed(row, error, cfg) {
  ensureOfficialShoutoutSchema();
  const now = nowIso();
  database.run(`UPDATE clip_shoutout_official_queue SET status='failed', attempts=attempts+1, updated_at=:now, last_error=:error WHERE id=:id`, { id: row.id, now, error: String(error || "") });
  database.run(`INSERT INTO clip_shoutout_official_history (target_login,target_display,target_user_id,queue_id,result,error,sent_at,meta_json) VALUES (:login,:display,:userId,:queueId,'failed',:error,:sentAt,:metaJson)`, {
    login: row.target_login,
    display: row.target_display || row.target_login,
    userId: row.target_user_id || "",
    queueId: row.id,
    error: String(error || ""),
    sentAt: now,
    metaJson: row.meta_json || "{}"
  });
  state.stats.officialFailed += 1;
  state.officialShoutout.lastError = String(error || "");
  emitShoutoutBus("shoutout.official.failed", { queueId: row.id, targetLogin: row.target_login, error: String(error || "") }, cfg);
}

function markOfficialQueueSent(row, result, cfg) {
  ensureOfficialShoutoutSchema();
  const now = nowIso();
  database.run(`UPDATE clip_shoutout_official_queue SET status='sent', updated_at=:now, sent_at=:now, last_error='' WHERE id=:id`, { id: row.id, now });
  database.run(`INSERT INTO clip_shoutout_official_history (target_login,target_display,target_user_id,queue_id,result,error,sent_at,meta_json) VALUES (:login,:display,:userId,:queueId,'sent','',:sentAt,:metaJson)`, {
    login: row.target_login,
    display: row.target_display || row.target_login,
    userId: row.target_user_id || "",
    queueId: row.id,
    sentAt: now,
    metaJson: JSON.stringify({ result: result || {}, previousMeta: row.meta_json || "{}" })
  });
  state.stats.officialSent += 1;
  state.officialShoutout.lastSentAt = now;
  state.officialShoutout.lastError = "";
  emitShoutoutBus("shoutout.official.sent", { queueId: row.id, targetLogin: row.target_login }, cfg);
}

function twitchTokenStorePath(env) {
  const baseRoot = configHelper.getRootDir();
  const raw = String(env.TWITCH_TOKEN_STORE || "").trim();
  if (raw) return path.isAbsolute(raw) ? raw : path.join(baseRoot, raw);
  return path.join(baseRoot, "tokens", "twitch_user.json");
}

function readTwitchUserToken(env) {
  try {
    const file = twitchTokenStorePath(env);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data || !data.access_token) return null;
    return { file, data };
  } catch (_) { return null; }
}

function writeTwitchUserToken(env, data) {
  const file = twitchTokenStorePath(env);
  core.ensureParentDir(file);
  fs.writeFileSync(file, JSON.stringify(data || {}, null, 2), "utf8");
}

async function getTwitchUserAccessToken(env) {
  const stored = readTwitchUserToken(env);
  if (!stored || !stored.data) return "";
  const now = Math.floor(Date.now() / 1000);
  if (stored.data.expires_at && now < Number(stored.data.expires_at) - 60) return String(stored.data.access_token || "");
  const refreshToken = String(stored.data.refresh_token || "");
  if (!refreshToken) return String(stored.data.access_token || "");
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const clientSecret = String(env.TWITCH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) return String(stored.data.access_token || "");
  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: { client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token", refresh_token: refreshToken },
    timeout: 10000
  });
  const updated = {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token || refreshToken,
    expires_at: now + Number(response.data.expires_in || 0)
  };
  writeTwitchUserToken(env, updated);
  return updated.access_token;
}

async function validateTwitchUserTokenScopes(env) {
  const token = await getTwitchUserAccessToken(env);
  if (!token) return { ok: false, error: "twitch_user_token_missing", scopes: [] };
  const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
    timeout: 10000,
    headers: { Authorization: `OAuth ${token}` }
  });
  const scopes = Array.isArray(response.data && response.data.scopes) ? response.data.scopes.map(String) : [];
  return {
    ok: true,
    login: String(response.data && response.data.login || ""),
    userId: String(response.data && response.data.user_id || ""),
    broadcasterId: String(env.TWITCH_BROADCASTER_ID || ""),
    scopes,
    hasModeratorManageShoutouts: scopes.includes("moderator:manage:shoutouts")
  };
}

async function sendOfficialTwitchShoutout(env, row, cfg) {
  const token = await getTwitchUserAccessToken(env);
  if (!token) throw new Error("twitch_user_token_missing");
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const ocfg = officialConfig(cfg);
  const broadcasterId = String(ocfg.broadcasterId || env.TWITCH_BROADCASTER_ID || "").trim();
  const moderatorId = String(ocfg.moderatorId || broadcasterId || "").trim();
  const targetUserId = String(row.target_user_id || "").trim();
  if (!clientId) throw new Error("twitch_client_id_missing");
  if (!broadcasterId) throw new Error("broadcaster_id_missing");
  if (!moderatorId) throw new Error("moderator_id_missing");
  if (!targetUserId) throw new Error("target_user_id_missing");
  const url = new URL("https://api.twitch.tv/helix/chat/shoutouts");
  url.searchParams.set("from_broadcaster_id", broadcasterId);
  url.searchParams.set("to_broadcaster_id", targetUserId);
  url.searchParams.set("moderator_id", moderatorId);
  const response = await axios.post(url.toString(), null, {
    timeout: 10000,
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${token}`
    }
  });
  return { ok: true, status: response.status, data: response.data || {} };
}

async function processOfficialShoutoutQueue(env, cfg, options = {}) {
  const ocfg = officialConfig(cfg);
  if (ocfg.enabled === false) return { ok: true, skipped: true, reason: "official_shoutout_disabled" };
  ensureOfficialShoutoutSchema();
  state.officialShoutout.lastWorkerAt = nowIso();
  const row = database.get(`SELECT * FROM clip_shoutout_official_queue WHERE status IN ('queued','waiting') ORDER BY available_at ASC, id ASC LIMIT 1`);
  if (!row) return { ok: true, empty: true };
  const nowMs = Date.now();
  const availableMs = calculateOfficialAvailableAt(row.target_login, cfg, msFromIso(row.available_at));
  if (!options.force && availableMs > nowMs) {
    const availableAt = isoFromMs(availableMs);
    database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', available_at=:availableAt, updated_at=:now WHERE id=:id`, { id: row.id, availableAt, now: nowIso() });
    emitShoutoutBus("shoutout.official.waiting_cooldown", { queueId: row.id, targetLogin: row.target_login, availableAt }, cfg);
    return { ok: true, waiting: true, queueId: row.id, availableAt };
  }
  if (Number(row.attempts || 0) >= Number(ocfg.maxAttempts || 5)) {
    markOfficialQueueFailed(row, "max_attempts_reached", cfg);
    return { ok: false, failed: true, error: "max_attempts_reached" };
  }
  try {
    emitShoutoutBus("shoutout.official.sending", { queueId: row.id, targetLogin: row.target_login }, cfg);
    const result = await sendOfficialTwitchShoutout(env, row, cfg);
    markOfficialQueueSent(row, result, cfg);
    if (ocfg.sendChatMessages !== false) {
      await sendChatMessage(renderTemplate(ocfg.sentMessage, { login: row.target_login, displayName: row.target_display || row.target_login }).trim(), { targetLogin: row.target_login, queueId: row.id, officialShoutout: true });
    }
    return { ok: true, sent: true, queueId: row.id, result };
  } catch (err) {
    const error = err && err.response && err.response.data ? JSON.stringify(err.response.data).slice(0, 500) : (err && err.message ? err.message : String(err));
    if (isTwitchLiveWaitError(error)) {
      const next = isoFromMs(Date.now() + Math.max(15000, Number(ocfg.streamWaitRetryMs || 60000)));
      database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, { id: row.id, next, now: nowIso(), error });
      state.officialShoutout.lastError = error;
      emitShoutoutBus("shoutout.official.waiting_stream_live", { queueId: row.id, targetLogin: row.target_login, error, retryAt: next }, cfg);
      return { ok: true, waiting: true, reason: "waiting_stream_live", queueId: row.id, error, retryAt: next };
    }
    const next = isoFromMs(Date.now() + Math.max(30000, Number(ocfg.globalCooldownMs || 120000)));
    database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', attempts=attempts+1, available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, { id: row.id, next, now: nowIso(), error });
    state.officialShoutout.lastError = error;
    state.stats.officialFailed += 1;
    emitShoutoutBus("shoutout.official.failed", { queueId: row.id, targetLogin: row.target_login, error, retryAt: next }, cfg);
    return { ok: false, retry: true, queueId: row.id, error, retryAt: next };
  }
}

function startOfficialShoutoutWorker(env, cfg) {
  const ocfg = officialConfig(cfg);
  if (state.officialShoutout.workerStarted || ocfg.enabled === false) return;
  ensureOfficialShoutoutSchema();
  state.officialShoutout.workerStarted = true;
  const intervalMs = Math.max(2000, Math.min(60000, Number(ocfg.workerIntervalMs || 5000)));
  const timer = setInterval(() => {
    processOfficialShoutoutQueue(env, shoutoutConfig()).catch(err => {
      state.officialShoutout.lastError = err && err.message ? err.message : String(err);
    });
  }, intervalMs);
  if (timer && typeof timer.unref === "function") timer.unref();
}

function officialQueueStatus(cfg) {
  const queue = listOfficialQueue(50);
  const history = listOfficialHistory(20);
  return {
    enabled: officialConfig(cfg).enabled !== false,
    workerStarted: state.officialShoutout.workerStarted,
    pending: queue.length,
    queue,
    history,
    nextGlobalAllowedAt: isoFromMs(nextGlobalAllowedAt(cfg)) || "",
    lastSentAt: state.officialShoutout.lastSentAt,
    lastError: state.officialShoutout.lastError
  };
}

function resolveRootPath(inputPath) {
  const raw = String(inputPath || "").trim();
  if (!raw) return configHelper.resolveFromRoot("htdocs", "assets", "sounds", "clip_shoutout");
  if (path.isAbsolute(raw)) return raw;
  return configHelper.resolveFromRoot(raw);
}

function browserFileForDownload(cfg, fileName) {
  const prefix = String(cfg.publicSoundFilePrefix || "clip_shoutout").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return `${prefix}/${fileName}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeFilePart(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "_").replace(/^_+|_+$/g, "") || "clip";
}

function renderTemplate(template, vars) {
  return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = vars && Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
    return String(value ?? "");
  });
}

function readRequestData(req) {
  const body = req && req.body && typeof req.body === "object" ? req.body : {};
  const query = req && req.query && typeof req.query === "object" ? req.query : {};
  return { ...query, ...body };
}

function firstString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function sanitizeHttpUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  if (["false", "null", "undefined", "nan", "0", "none"].includes(lower)) return "";
  if (!/^https?:\/\//i.test(text)) return "";
  return text;
}

function sanitizeAvatarUrl(value) {
  return sanitizeHttpUrl(value);
}

function parseTarget(input = {}) {
  const args = Array.isArray(input.args) ? input.args : [];

  // STEP277A_FIX2:
  // Command-System payload contains actor fields like login/userLogin for the caller.
  // Those must never be used before the real command target, otherwise
  // !vso @urlug is parsed as ForrestCGN when Forrest triggers the command.
  const rawInput = firstString(
    input.target,
    input.targetLogin,
    input.shoutUser,
    input.channelTarget,
    input.input0,
    args[0],
    input.rawInput,
    input.input,
    input.text,
    input.message,
    input.channel
  );

  const parts = String(rawInput || "").trim().split(/\s+/).filter(Boolean);
  let candidate = parts[0] || "";
  if (candidate && ["so", "!so", "vso", "!vso", "clipso", "!clipso", "videoso", "!videoso"].includes(candidate.toLowerCase())) {
    candidate = parts[1] || "";
  }
  return cleanLogin(candidate);
}

function summarizeInput(input = {}) {
  return {
    target: String(input.target || ""),
    targetLogin: String(input.targetLogin || ""),
    input0: String(input.input0 || ""),
    args: Array.isArray(input.args) ? input.args.slice(0, 5).map(v => String(v || "")) : [],
    rawInput: String(input.rawInput || ""),
    input: String(input.input || ""),
    message: String(input.message || ""),
    userLogin: String(input.userLogin || input.login || ""),
    displayName: String(input.displayName || input.userName || "")
  };
}

async function getAppAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (appToken && appTokenExpiresAt && now < appTokenExpiresAt - 60) return appToken;

  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const clientSecret = String(env.TWITCH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) throw new Error("missing_twitch_client_credentials");

  const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    },
    timeout: 10000
  });

  appToken = response.data && response.data.access_token ? String(response.data.access_token) : "";
  appTokenExpiresAt = now + Number(response.data && response.data.expires_in || 0);
  if (!appToken) throw new Error("twitch_app_token_empty");
  return appToken;
}

async function helixGet(env, pathname, params = {}) {
  const token = await getAppAccessToken(env);
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const url = new URL("https://api.twitch.tv/helix" + pathname);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && String(value) !== "") url.searchParams.set(key, String(value));
  }
  const response = await axios.get(url.toString(), {
    timeout: 10000,
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${token}`
    }
  });
  return response.data || {};
}

function normalizeClipSearchRanges(cfg) {
  const source = Array.isArray(cfg.clipSearchRangesDays) && cfg.clipSearchRangesDays.length
    ? cfg.clipSearchRangesDays
    : [30, 90, Number(cfg.clipLookbackDays || 365), 0];
  const result = [];
  const seen = new Set();
  for (const value of source) {
    const days = Math.max(0, Number.parseInt(value, 10) || 0);
    const key = String(days);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(days);
  }
  if (!seen.has("0")) result.push(0);
  return result;
}

function clipDurationMs(clip) {
  return Math.round(Number(clip && clip.duration || 0) * 1000) || 0;
}

function filterClipsForDuration(clips, cfg, maxSeconds) {
  const maxMs = Math.max(1, Number(maxSeconds || 0)) * 1000;
  return (Array.isArray(clips) ? clips : []).filter(clip => {
    const durationMs = clipDurationMs(clip);
    return durationMs > 0 && durationMs <= maxMs;
  });
}

function dedupeClips(clips) {
  const out = [];
  const seen = new Set();
  for (const clip of Array.isArray(clips) ? clips : []) {
    const id = String(clip && clip.id || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(clip);
  }
  return out;
}

async function listClipsForBroadcaster(env, broadcasterId, cfg) {
  const first = intParam(cfg.clipFetchFirst, 50, 1, 100);
  const pages = intParam(cfg.clipFetchPages, 3, 1, 10);
  const minViewCount = Number(cfg.minViewCount || 0);
  const maxClipDurationSeconds = Number(cfg.maxClipDurationSeconds || 30);
  const fallbackMaxClipDurationSeconds = Number(cfg.fallbackMaxClipDurationSeconds || 60);
  const allowLongerClipFallback = boolParam(cfg.allowLongerClipFallback, true);
  const ranges = normalizeClipSearchRanges(cfg);
  const debug = {
    searchedAt: nowIso(),
    broadcasterId: String(broadcasterId || ""),
    first,
    pages,
    minViewCount,
    maxClipDurationSeconds,
    allowLongerClipFallback,
    fallbackMaxClipDurationSeconds,
    ranges: [],
    selectedRange: null,
    selectedMode: ""
  };

  for (const days of ranges) {
    const rangeInfo = {
      days,
      label: days > 0 ? `last_${days}_days` : "all_time",
      rawCount: 0,
      afterMinViewCount: 0,
      durationOkCount: 0,
      fallbackDurationCount: 0,
      fetchedPages: 0,
      error: ""
    };

    try {
      const collected = [];
      let cursor = "";
      for (let page = 0; page < pages; page += 1) {
        const params = { broadcaster_id: broadcasterId, first };
        if (days > 0) params.started_at = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        if (cursor) params.after = cursor;

        const data = await helixGet(env, "/clips", params);
        const rows = Array.isArray(data.data) ? data.data : [];
        collected.push(...rows);
        rangeInfo.fetchedPages += 1;
        cursor = String(data.pagination && data.pagination.cursor || "");
        if (!cursor || !rows.length) break;
      }

      const rawRows = dedupeClips(collected);
      rangeInfo.rawCount = rawRows.length;

      let viewRows = rawRows;
      if (minViewCount > 0) viewRows = viewRows.filter(row => Number(row.view_count || 0) >= minViewCount);
      rangeInfo.afterMinViewCount = viewRows.length;

      const durationOk = filterClipsForDuration(viewRows, cfg, maxClipDurationSeconds);
      rangeInfo.durationOkCount = durationOk.length;

      const fallbackOk = allowLongerClipFallback
        ? filterClipsForDuration(viewRows, cfg, Math.max(maxClipDurationSeconds, fallbackMaxClipDurationSeconds))
        : [];
      rangeInfo.fallbackDurationCount = fallbackOk.length;
      debug.ranges.push(rangeInfo);

      if (durationOk.length) {
        debug.selectedRange = rangeInfo;
        debug.selectedMode = "duration_ok";
        return { clips: durationOk, rawClips: rawRows, debug };
      }

      if (fallbackOk.length) {
        debug.selectedRange = rangeInfo;
        debug.selectedMode = "fallback_duration";
        return { clips: fallbackOk, rawClips: rawRows, debug };
      }

      if (viewRows.length && allowLongerClipFallback && fallbackMaxClipDurationSeconds <= 0) {
        debug.selectedRange = rangeInfo;
        debug.selectedMode = "unlimited_duration";
        return { clips: viewRows, rawClips: rawRows, debug };
      }
    } catch (err) {
      rangeInfo.error = err && err.message ? err.message : String(err);
      debug.ranges.push(rangeInfo);
    }
  }

  return { clips: [], rawClips: [], debug };
}

function clipMemoryLimit(cfg) {
  return intParam(cfg.recentClipMemoryPerChannel, 5, 0, 50);
}

function clipIdOf(clip) {
  return String(clip && clip.id || "").trim();
}

function recentKeyForLogin(login) {
  return cleanLogin(login || "");
}

function getRecentClipIds(login, cfg) {
  const key = recentKeyForLogin(login);
  if (!key) return [];
  const limit = clipMemoryLimit(cfg);
  if (limit <= 0) return [];
  const rows = Array.isArray(recentClipMemory.get(key)) ? recentClipMemory.get(key) : [];
  return rows.slice(0, limit).map(v => String(v || "")).filter(Boolean);
}

function rememberRecentClip(login, clip, cfg) {
  const key = recentKeyForLogin(login);
  const id = clipIdOf(clip);
  const limit = clipMemoryLimit(cfg);
  if (!key || !id || limit <= 0) return;
  const previous = Array.isArray(recentClipMemory.get(key)) ? recentClipMemory.get(key) : [];
  const next = [id, ...previous.filter(value => String(value || "") !== id)].slice(0, limit);
  recentClipMemory.set(key, next);
}

function publicRecentClipGuard(cfg) {
  const memory = {};
  const limit = clipMemoryLimit(cfg || {});
  for (const [login, ids] of recentClipMemory.entries()) {
    memory[login] = (Array.isArray(ids) ? ids : []).slice(0, limit);
  }
  return {
    enabled: (cfg || {}).avoidRecentClips !== false,
    memoryPerChannel: limit,
    fallbackWhenAllBlocked: (cfg || {}).recentClipFallbackWhenAllBlocked !== false,
    memory,
    lastSelection: state.recentClipGuard && state.recentClipGuard.lastSelection ? state.recentClipGuard.lastSelection : null
  };
}

function pickClip(clips, cfg, targetLogin = "") {
  const candidates = Array.isArray(clips) ? clips.filter(clip => clipIdOf(clip)) : [];
  if (!candidates.length) return { clip: null, selection: null };

  const avoidRecent = cfg.avoidRecentClips !== false && clipMemoryLimit(cfg) > 0;
  const recentIds = avoidRecent ? getRecentClipIds(targetLogin, cfg) : [];
  const recentSet = new Set(recentIds);
  const nonRecent = avoidRecent ? candidates.filter(clip => !recentSet.has(clipIdOf(clip))) : candidates.slice();

  let pool = nonRecent.length ? nonRecent : candidates;
  const usedFallbackBecauseAllBlocked = avoidRecent && !nonRecent.length && candidates.length > 0;
  if (usedFallbackBecauseAllBlocked && cfg.recentClipFallbackWhenAllBlocked === false) pool = candidates;

  let clip = null;
  if (cfg.randomPick === false) clip = pool[0] || candidates[0];
  else clip = pool[Math.floor(Math.random() * pool.length)] || pool[0] || candidates[0];

  const selection = {
    mode: cfg.randomPick === false ? (avoidRecent ? "first_avoid_recent" : "first") : (avoidRecent ? "random_avoid_recent" : "random"),
    candidateCount: candidates.length,
    recentMemory: recentIds,
    recentBlockedCount: avoidRecent ? candidates.filter(clipItem => recentSet.has(clipIdOf(clipItem))).length : 0,
    poolCount: pool.length,
    usedFallbackBecauseAllBlocked,
    selectedClipId: clipIdOf(clip),
    avoidRecentClips: avoidRecent,
    memoryPerChannel: clipMemoryLimit(cfg)
  };

  return { clip, selection };
}


function avatarUrlFromTwitchUser(value) {
  if (!value || typeof value !== "object") return "";
  const candidates = [
    value.avatarUrl,
    value.profileImageUrl,
    value.profile_image_url,
    value.avatar_url,
    value.imageUrl,
    value.image_url,
    value.user && value.user.profile_image_url,
    value.user && value.user.profileImageUrl,
    value.user && value.user.avatarUrl,
    value.raw && value.raw.profile_image_url,
    value.raw && value.raw.profileImageUrl,
    value.raw && value.raw.avatarUrl,
    Array.isArray(value.data) && value.data[0] && value.data[0].profile_image_url,
    Array.isArray(value.data) && value.data[0] && value.data[0].profileImageUrl,
    Array.isArray(value.data) && value.data[0] && value.data[0].avatarUrl
  ];

  for (const candidate of candidates) {
    const clean = sanitizeAvatarUrl(candidate);
    if (clean) return clean;
  }

  return "";
}

function displayNameFromTwitchUser(value, fallback = "") {
  if (!value || typeof value !== "object") return cleanDisplay(fallback, fallback);
  return cleanDisplay(firstString(
    value.displayName,
    value.display_name,
    value.userName,
    value.user_name,
    value.name,
    value.user && value.user.display_name,
    value.user && value.user.displayName,
    value.raw && value.raw.display_name,
    Array.isArray(value.data) && value.data[0] && value.data[0].display_name,
    fallback
  ), fallback);
}

async function lookupUserViaHelix(env, login) {
  const clean = cleanLogin(login);
  if (!clean) return null;
  try {
    const data = await helixGet(env, "/users", { login: clean });
    const row = Array.isArray(data && data.data) ? data.data[0] : null;
    if (!row) return null;
    return {
      userId: String(row.id || ""),
      login: cleanLogin(row.login || clean),
      displayName: cleanDisplay(row.display_name || row.login || clean, clean),
      avatarUrl: sanitizeAvatarUrl(row.profile_image_url)
    };
  } catch (_) {
    return null;
  }
}

async function lookupUserViaLocalUserinfo(login, cfg) {
  if (cfg.avatarLookupEnabled === false) return null;
  const baseUrl = String(cfg.avatarLookupUrl || "").trim();
  const clean = cleanLogin(login);
  if (!baseUrl || !clean) return null;
  try {
    const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}login=${encodeURIComponent(clean)}`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data || {};
    const row = Array.isArray(data && data.data) ? data.data[0] : data;
    return {
      userId: String(row.id || row.userId || row.user_id || ""),
      login: cleanLogin(row.login || row.user_login || row.name || clean),
      displayName: displayNameFromTwitchUser(row, clean),
      avatarUrl: avatarUrlFromTwitchUser(row)
    };
  } catch (_) {
    return null;
  }
}

async function resolveTargetUser(env, targetLogin, cfg) {
  const targetUserRaw = await twitch.resolveUserByLogin(targetLogin);
  if (!targetUserRaw || !targetUserRaw.userId) return null;

  const targetUser = {
    userId: String(targetUserRaw.userId),
    login: cleanLogin(targetUserRaw.login || targetLogin),
    displayName: displayNameFromTwitchUser(targetUserRaw, targetLogin),
    avatarUrl: avatarUrlFromTwitchUser(targetUserRaw)
  };

  if (!targetUser.avatarUrl) {
    const localUser = await lookupUserViaLocalUserinfo(targetUser.login, cfg);
    if (localUser) {
      if (localUser.userId) targetUser.userId = localUser.userId;
      if (localUser.login) targetUser.login = localUser.login;
      if (localUser.displayName) targetUser.displayName = localUser.displayName;
      if (localUser.avatarUrl) targetUser.avatarUrl = localUser.avatarUrl;
    }
  }

  if (!targetUser.avatarUrl) {
    const helixUser = await lookupUserViaHelix(env, targetUser.login);
    if (helixUser) {
      if (helixUser.userId) targetUser.userId = helixUser.userId;
      if (helixUser.login) targetUser.login = helixUser.login;
      if (helixUser.displayName) targetUser.displayName = helixUser.displayName;
      if (helixUser.avatarUrl) targetUser.avatarUrl = helixUser.avatarUrl;
    }
  }

  targetUser.avatarUrl = sanitizeAvatarUrl(targetUser.avatarUrl);
  return targetUser;
}

async function resolveClipPlaybackUrl(clipId, cfg) {
  const response = await axios.post("https://gql.twitch.tv/gql", {
    operationName: "VideoAccessToken_Clip",
    variables: { slug: String(clipId || "") },
    extensions: {
      persistedQuery: {
        version: 2,
        sha256Hash: "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"
      }
    }
  }, {
    timeout: 10000,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "Client-ID": String(cfg.gqlClientId || DEFAULT_CONFIG.clipShoutout.gqlClientId)
    }
  });

  const clip = response.data && response.data.data ? response.data.data.clip : null;
  if (!clip) throw new Error("clip_playback_missing");
  const qualities = Array.isArray(clip.videoQualities) ? clip.videoQualities.slice() : [];
  if (!qualities.length) throw new Error("clip_playback_no_qualities");
  qualities.sort((a, b) => Number(b.quality || 0) - Number(a.quality || 0));
  const best = qualities[0];
  const token = clip.playbackAccessToken || {};
  if (!best || !best.sourceURL || !token.signature || !token.value) throw new Error("clip_playback_incomplete");
  return `${best.sourceURL}?sig=${encodeURIComponent(token.signature)}&token=${encodeURIComponent(token.value)}`;
}

async function downloadClipToSoundAssets(playbackUrl, clip, targetUser, cfg) {
  const outDir = resolveRootPath(cfg.downloadDir);
  ensureDir(outDir);
  const fileName = `${safeFilePart(targetUser.login)}_${safeFilePart(clip.id)}.mp4`;
  const outFile = path.join(outDir, fileName);
  const relativeSoundFile = browserFileForDownload(cfg, fileName);

  if (cfg.cacheDownloadedClips !== false && fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
    return { file: outFile, soundSystemFile: relativeSoundFile, cached: true };
  }

  const response = await axios.get(playbackUrl, { responseType: "stream", timeout: 30000 });
  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outFile);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
    response.data.on("error", reject);
  });

  return { file: outFile, soundSystemFile: relativeSoundFile, cached: false };
}

function clipPlaybackMode(cfg) {
  const mode = String(cfg.clipPlaybackMode || "direct").trim().toLowerCase();
  if (["download", "cache", "cached", "local"].includes(mode)) return "download";
  return "direct";
}

async function prepareClipPlayback(playbackUrl, clip, targetUser, cfg) {
  const mode = clipPlaybackMode(cfg);
  if (mode === "download") {
    const downloaded = await downloadClipToSoundAssets(playbackUrl, clip, targetUser, cfg);
    return {
      mode: "download",
      direct: false,
      cached: !!downloaded.cached,
      file: downloaded.file,
      soundSystemFile: downloaded.soundSystemFile,
      mediaUrl: "",
      videoUrl: ""
    };
  }

  return {
    mode: "direct",
    direct: true,
    cached: false,
    file: "",
    soundSystemFile: "",
    mediaUrl: playbackUrl,
    videoUrl: playbackUrl
  };
}

async function postJson(url, payload, timeoutMs = 15000) {
  const response = await axios.post(url, payload || {}, {
    timeout: timeoutMs,
    headers: { "Content-Type": "application/json" }
  });
  return response.data || {};
}

async function prepareOptionalTts(input, cfg, vars) {
  const enabled = boolParam(input.tts ?? input.withTts ?? input.ttsAfterClip, cfg.ttsAfterClipEnabled);
  if (!enabled) return null;

  const text = renderTemplate(firstString(input.ttsText, cfg.ttsText), vars).trim();
  if (!text) return null;

  const payload = {
    text,
    message: text,
    input: text,
    source: "clip_shoutout",
    mode: "clip_shoutout",
    user: firstString(input.userLogin, input.login, vars.requestedByLogin, "clip_shoutout"),
    displayName: firstString(input.displayName, input.userName, vars.requestedByDisplay, "Clip-Shoutout"),
    voice: firstString(input.ttsVoice, cfg.ttsVoice),
    meta: {
      clipShoutout: true,
      targetLogin: vars.login,
      targetDisplayName: vars.displayName,
      clipId: vars.clipId
    }
  };

  const result = await postJson(cfg.ttsSynthesizeUrl, payload, 60000);
  if (!result || result.ok === false || !result.soundSystemFile) {
    throw new Error(`tts_prepare_failed:${result && (result.reason || result.error) || "unknown"}`);
  }
  state.stats.ttsPrepared += 1;
  return {
    role: "tts",
    file: result.soundSystemFile,
    label: `Clip-Shoutout TTS @${vars.displayName}`,
    category: cfg.ttsCategory || "tts",
    source: cfg.ttsSource || "clip_shoutout_tts",
    outputTarget: "overlay",
    target: "stream",
    volume: Number(cfg.ttsVolume || 100),
    priorityOffset: Number(cfg.ttsPriorityOffset || 0),
    durationMs: Number(result.durationMs || 0),
    queueIfBusy: true,
    canInterrupt: false,
    canBeInterrupted: true,
    meta: {
      clipShoutout: true,
      tts: true,
      ttsId: result.id || "",
      targetLogin: vars.login,
      targetDisplayName: vars.displayName,
      clipId: vars.clipId
    },
    visual: {
      module: "tts_overlay",
      type: "clip_shoutout_tts",
      displayName: vars.displayName,
      login: vars.login,
      text,
      title: "Video-Shoutout",
      source: "clip_shoutout"
    }
  };
}

function buildBundlePayload(cfg, vars, playback, clip, targetUser, ttsItem) {
  const maxDurationMs = Math.max(5000, Math.min(60000, Number(cfg.maxClipDurationSeconds || 30) * 1000));
  const clipDurationMs = Math.max(5000, Math.min(maxDurationMs, Math.round(Number(clip.duration || 0) * 1000) || maxDurationMs));
  const bundleId = `clipso_${Date.now()}_${safeFilePart(targetUser.login)}_${safeFilePart(clip.id)}`;

  const items = [{
    role: "clip",
    file: playback.soundSystemFile || "",
    mediaUrl: playback.mediaUrl || "",
    videoUrl: playback.videoUrl || "",
    label: `Video-Shoutout @${targetUser.displayName}`,
    category: cfg.soundCategory || "vip",
    source: cfg.soundSource || "clip_shoutout",
    mediaType: "video",
    type: "video",
    hasAudio: true,
    hasVideo: true,
    outputTarget: "overlay",
    target: "stream",
    volume: Number(cfg.soundVolume || 100),
    priority: Number(cfg.soundPriority || 60),
    durationMs: clipDurationMs,
    queueIfBusy: true,
    dropIfBusy: false,
    canInterrupt: false,
    canBeInterrupted: true,
    parallelAllowed: false,
    meta: {
      clipShoutout: true,
      targetLogin: targetUser.login,
      targetDisplayName: targetUser.displayName,
      clipId: clip.id,
      clipUrl: clip.url || "",
      twitchClipDurationMs: Math.round(Number(clip.duration || 0) * 1000) || 0,
      cached: !!playback.cached,
      directPlayback: playback.direct === true,
      playbackMode: playback.mode || "direct"
    },
    visual: {
      module: "clip_shoutout",
      layout: "vip30",
      displayName: targetUser.displayName,
      login: targetUser.login,
      user: targetUser.displayName,
      avatarUrl: sanitizeAvatarUrl(targetUser.avatarUrl),
      clipTitle: clip.title || "",
      clipUrl: clip.url || "",
      gameName: clip.game_id || "",
      subline: cfg.overlaySubline || "🧓 Altersheim-TV",
      durationMs: clipDurationMs
    }
  }];

  if (ttsItem) items.push(ttsItem);

  return {
    bundleId,
    bundleType: "clip_shoutout",
    priority: Number(cfg.soundPriority || 60),
    locked: true,
    source: "clip_shoutout",
    requestedBy: vars.requestedByLogin || vars.requestedByDisplay || "",
    meta: {
      clipShoutout: true,
      targetLogin: targetUser.login,
      targetDisplayName: targetUser.displayName,
      clipId: clip.id
    },
    items
  };
}

async function sendChatMessage(message, meta) {
  if (!message) return { ok: false, skipped: true, reason: "empty_message" };
  if (!twitchPresence || typeof twitchPresence.sendChatMessage !== "function") {
    return { ok: false, skipped: true, reason: "twitch_presence_unavailable" };
  }
  const result = await twitchPresence.sendChatMessage(message, { trigger: "clip-shoutout", module: MODULE_NAME, ...(meta || {}) });
  if (result && result.ok) state.stats.chatSent += 1;
  return result;
}

function ensureCommandSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS command_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger TEXT NOT NULL UNIQUE,
      aliases_json TEXT NOT NULL DEFAULT '[]',
      module_key TEXT NOT NULL DEFAULT '',
      action_key TEXT NOT NULL DEFAULT '',
      target_method TEXT NOT NULL DEFAULT 'POST',
      target_url TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      permission_level TEXT NOT NULL DEFAULT 'everyone',
      cooldown_global_ms INTEGER NOT NULL DEFAULT 0,
      cooldown_user_ms INTEGER NOT NULL DEFAULT 0,
      live_only INTEGER NOT NULL DEFAULT 0,
      response_mode TEXT NOT NULL DEFAULT 'module',
      config_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function registerCommand(cfg) {
  try {
    ensureCommandSchema();
    const trigger = cleanLogin(cfg.command || "so") || "so";
    const now = nowIso();
    const existing = database.get("SELECT id FROM command_definitions WHERE trigger = :trigger", { trigger });
    if (existing && existing.id) {
      state.registeredCommand = true;
      return { ok: true, existing: true, trigger };
    }

    database.run(`
      INSERT INTO command_definitions (
        trigger, aliases_json, module_key, action_key, target_method, target_url,
        enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only,
        response_mode, config_json, created_at, updated_at
      ) VALUES (
        :trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl,
        1, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, 0,
        'module', :configJson, :createdAt, :updatedAt
      )
    `, {
      trigger,
      aliasesJson: JSON.stringify(Array.isArray(cfg.aliases) ? cfg.aliases.map(cleanLogin).filter(Boolean) : []),
      moduleKey: MODULE_NAME,
      actionKey: "run",
      targetMethod: "POST",
      targetUrl: `${API_PREFIX}/run`,
      permissionLevel: String(cfg.permissionLevel || "mod").toLowerCase(),
      cooldownGlobalMs: Number(cfg.cooldownGlobalMs || 5000),
      cooldownUserMs: Number(cfg.cooldownUserMs || 15000),
      configJson: JSON.stringify({ seededBy: "clip_shoutout_0.2.3", rawInputMode: true }),
      createdAt: now,
      updatedAt: now
    });

    state.registeredCommand = true;
    return { ok: true, created: true, trigger };
  } catch (err) {
    state.registeredCommand = false;
    state.lastError = err.message || String(err);
    return { ok: false, error: state.lastError };
  }
}


function publicClipInfo(clip) {
  if (!clip || typeof clip !== "object") return null;
  return {
    id: String(clip.id || ""),
    title: String(clip.title || ""),
    url: String(clip.url || ""),
    embedUrl: String(clip.embed_url || ""),
    broadcasterId: String(clip.broadcaster_id || ""),
    broadcasterName: String(clip.broadcaster_name || ""),
    creatorId: String(clip.creator_id || ""),
    creatorName: String(clip.creator_name || ""),
    videoId: String(clip.video_id || ""),
    gameId: String(clip.game_id || ""),
    language: String(clip.language || ""),
    duration: Number(clip.duration || 0),
    viewCount: Number(clip.view_count || 0),
    createdAt: String(clip.created_at || ""),
    thumbnailUrl: String(clip.thumbnail_url || "")
  };
}

function buildClipSelectionPreview(clips, cfg, targetLogin) {
  const candidates = Array.isArray(clips) ? clips.filter(clip => clipIdOf(clip)) : [];
  const avoidRecent = cfg.avoidRecentClips !== false && clipMemoryLimit(cfg) > 0;
  const recentIds = avoidRecent ? getRecentClipIds(targetLogin, cfg) : [];
  const recentSet = new Set(recentIds);
  const recentBlockedCount = avoidRecent ? candidates.filter(clip => recentSet.has(clipIdOf(clip))).length : 0;
  const poolCount = avoidRecent ? candidates.length - recentBlockedCount : candidates.length;
  return {
    mode: cfg.randomPick === false ? (avoidRecent ? "first_avoid_recent" : "first") : (avoidRecent ? "random_avoid_recent" : "random"),
    candidateCount: candidates.length,
    recentMemory: recentIds,
    recentBlockedCount,
    poolCount: Math.max(0, poolCount),
    wouldFallbackBecauseAllBlocked: avoidRecent && candidates.length > 0 && recentBlockedCount >= candidates.length,
    avoidRecentClips: avoidRecent,
    memoryPerChannel: clipMemoryLimit(cfg)
  };
}

async function handleListClips(req, res, env) {
  const cfg = shoutoutConfig();
  const input = readRequestData(req);

  if (cfg.enabled === false) {
    return res.status(503).json({ ok: false, error: "clip_shoutout_disabled" });
  }

  const targetLogin = parseTarget(input);
  if (!targetLogin) {
    return res.json({ ok: false, error: "target_required", usage: `${API_PREFIX}/clips?target=kanal` });
  }

  try {
    const targetUser = await resolveTargetUser(env, targetLogin, cfg);
    if (!targetUser || !targetUser.userId) {
      return res.json({ ok: false, error: "target_user_not_found", targetLogin });
    }

    const clipSearch = await listClipsForBroadcaster(env, targetUser.userId, cfg);
    const clips = Array.isArray(clipSearch.clips) ? clipSearch.clips : [];
    const publicClips = clips.map(publicClipInfo).filter(Boolean);
    const selectionPreview = buildClipSelectionPreview(clips, cfg, targetUser.login);

    return res.json({
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      target: targetUser,
      count: publicClips.length,
      clips: publicClips,
      clipSearch: clipSearch.debug || null,
      clipSelectionPreview: selectionPreview,
      recentClipGuard: publicRecentClipGuard(cfg),
      note: "Diese Route listet passende Clips nur zur Kontrolle. Sie startet keinen Shoutout und veraendert die Recent-Clip-Memory nicht."
    });
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    state.lastError = error;
    return res.status(500).json({ ok: false, module: MODULE_NAME, error, targetLogin });
  }
}


async function runDisplayJob(row, env, cfg) {
  let input = {};
  try { input = JSON.parse(row.input_json || '{}'); } catch (_) { input = {}; }
  input.target = input.target || row.target_login;
  input.targetLogin = input.targetLogin || row.target_login;

  const targetLogin = cleanLogin(row.target_login || parseTarget(input));
  state.lastRunAt = nowIso();

  const targetUser = await resolveTargetUser(env, targetLogin, cfg);
  if (!targetUser || !targetUser.userId) {
    state.lastError = 'target_user_not_found';
    state.lastRun = { targetLogin, error: 'target_user_not_found', input: summarizeInput(input), failedAt: state.lastRunAt };
    throw new Error('target_user_not_found');
  }

  const clipSearch = await listClipsForBroadcaster(env, targetUser.userId, cfg);
  const clips = Array.isArray(clipSearch.clips) ? clipSearch.clips : [];
  state.lastClipSearch = clipSearch.debug || null;
  if (!clips.length) {
    state.stats.noClips += 1;
    state.lastError = 'no_clips_found';
    state.lastRun = { target: targetUser, targetLogin, error: 'no_clips_found', input: summarizeInput(input), clipSearch: clipSearch.debug || null, failedAt: state.lastRunAt };
    throw new Error('no_clips_found');
  }

  const pickedClip = pickClip(clips, cfg, targetUser.login);
  const clip = pickedClip.clip;
  const clipSelection = pickedClip.selection || null;
  if (!clip) {
    state.stats.noClips += 1;
    state.lastError = 'no_valid_clip_after_selection';
    state.lastRun = { target: targetUser, targetLogin, error: 'no_valid_clip_after_selection', input: summarizeInput(input), clipSearch: clipSearch.debug || null, failedAt: state.lastRunAt };
    throw new Error('no_valid_clip_after_selection');
  }

  const playbackUrl = await resolveClipPlaybackUrl(clip.id, cfg);
  const playback = await prepareClipPlayback(playbackUrl, clip, targetUser, cfg);

  const vars = {
    login: targetUser.login,
    displayName: targetUser.displayName,
    user: targetUser.displayName,
    url: `https://twitch.tv/${targetUser.login}`,
    twitchUrl: `https://twitch.tv/${targetUser.login}`,
    clipUrl: clip.url || '',
    clipTitle: clip.title || '',
    clipId: clip.id || '',
    requestedByLogin: cleanLogin(row.requested_by_login || input.userLogin || input.login || input.user || ''),
    requestedByDisplay: cleanDisplay(row.requested_by_display || input.displayName || input.userName || input.user || '')
  };

  const ttsItem = await prepareOptionalTts(input, cfg, vars);
  const bundlePayload = buildBundlePayload(cfg, vars, playback, clip, targetUser, ttsItem);
  emitShoutoutBus('shoutout.display.started', { queueId: row.id, target: targetUser, clip: publicClipInfo(clip), bundleId: bundlePayload.bundleId }, cfg);
  const soundResult = await postJson(cfg.soundBundleUrl, bundlePayload, 15000);
  rememberRecentClip(targetUser.login, clip, cfg);
  state.recentClipGuard = publicRecentClipGuard(cfg);
  state.recentClipGuard.lastSelection = clipSelection;

  const displayDurationMs = bundlePayload.items.reduce((sum, item) => sum + Math.max(0, Number(item.durationMs || 0)), 0) + Math.max(0, Number(officialConfig(cfg).displayFinishPaddingMs || 1500));
  const officialEnabled = officialConfig(cfg).enabled !== false && boolParam(input.officialShoutout ?? input.official ?? input.twitchShoutout, true);

  if (officialEnabled) {
    setTimeout(async () => {
      try {
        emitShoutoutBus('shoutout.display.finished', { queueId: row.id, target: targetUser, clip: publicClipInfo(clip), bundleId: bundlePayload.bundleId }, cfg);
        const queueResult = enqueueOfficialShoutout({
          targetLogin: targetUser.login,
          targetDisplay: targetUser.displayName,
          targetUserId: targetUser.userId,
          requestedByLogin: vars.requestedByLogin,
          requestedByDisplay: vars.requestedByDisplay,
          clipId: clip.id,
          clipUrl: clip.url || '',
          bundleId: bundlePayload.bundleId,
          availableAt: nowIso(),
          meta: { source: MODULE_NAME, displayQueueId: row.id, clipTitle: clip.title || '' }
        }, cfg);
        const ocfg = officialConfig(cfg);
        if (ocfg.sendChatMessages !== false && queueResult && queueResult.ok && queueResult.duplicate !== true) {
          await sendChatMessage(renderTemplate(ocfg.queuedMessage, vars).trim(), { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true, queueId: queueResult.row && queueResult.row.id });
        } else if (ocfg.sendChatMessages !== false && queueResult && queueResult.duplicate === true) {
          await sendChatMessage(renderTemplate(ocfg.duplicateQueuedMessage, vars).trim(), { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true });
        }
        await processOfficialShoutoutQueue(env, shoutoutConfig());
      } catch (err) {
        state.officialShoutout.lastError = err && err.message ? err.message : String(err);
        emitShoutoutBus('shoutout.official.failed', { targetLogin: targetUser.login, error: state.officialShoutout.lastError }, cfg);
      }
    }, displayDurationMs).unref?.();
  } else {
    setTimeout(() => {
      emitShoutoutBus('shoutout.display.finished', { queueId: row.id, target: targetUser, clip: publicClipInfo(clip), bundleId: bundlePayload.bundleId }, cfg);
    }, displayDurationMs).unref?.();
  }

  emitShoutoutBus('shoutout.accepted', { queueId: row.id, target: targetUser, clip: publicClipInfo(clip), bundleId: bundlePayload.bundleId, officialShoutout: officialEnabled }, cfg);
  state.stats.queued += 1;
  state.lastRunAt = nowIso();
  state.lastRun = {
    target: targetUser,
    clip: { id: clip.id, title: clip.title || '', url: clip.url || '', duration: clip.duration || 0 },
    clipSelection,
    clipSearch: clipSearch.debug || null,
    bundleId: bundlePayload.bundleId,
    ttsEnabled: Boolean(ttsItem),
    queuedAt: state.lastRunAt,
    parsedTargetLogin: targetLogin,
    input: summarizeInput(input),
    displayQueueId: row.id
  };
  state.lastError = '';
  return { ok: true, rowId: row.id, target: targetUser, clip, clipSelection, clipSearch, playback, ttsItem, bundlePayload, soundResult, officialEnabled, displayDurationMs };
}

async function processDisplayQueue(env, cfg, options = {}) {
  const dcfg = displayConfig(cfg);
  if (dcfg.enabled === false) return { ok: true, skipped: true, reason: 'display_queue_disabled' };
  ensureDisplayQueueSchema();
  const active = database.get(`SELECT * FROM clip_shoutout_display_queue WHERE status='active' ORDER BY id ASC LIMIT 1`);
  if (active && !options.force) return { ok: true, active: true, queueId: active.id };

  const row = database.get(`SELECT * FROM clip_shoutout_display_queue WHERE status IN ('queued','waiting') ORDER BY available_at ASC, id ASC LIMIT 1`);
  if (!row) return { ok: true, empty: true };

  const nowMs = Date.now();
  const availableMs = calculateDisplayAvailableAt(cfg, msFromIso(row.available_at));
  if (!options.force && availableMs > nowMs) {
    const availableAt = isoFromMs(availableMs);
    database.run(`UPDATE clip_shoutout_display_queue SET status='waiting', available_at=:availableAt, updated_at=:now WHERE id=:id`, { id: row.id, availableAt, now: nowIso() });
    emitShoutoutBus('shoutout.display.waiting_cooldown', { queueId: row.id, targetLogin: row.target_login, availableAt }, cfg);
    return { ok: true, waiting: true, queueId: row.id, availableAt };
  }

  const startedAt = nowIso();
  database.run(`UPDATE clip_shoutout_display_queue SET status='active', started_at=:startedAt, updated_at=:startedAt, last_error='' WHERE id=:id`, { id: row.id, startedAt });
  const activeRow = database.get(`SELECT * FROM clip_shoutout_display_queue WHERE id=:id`, { id: row.id }) || { ...row, started_at: startedAt, status: 'active' };
  state.stats.displayStarted += 1;
  state.displayQueue.lastStartedAt = startedAt;

  try {
    const result = await runDisplayJob(activeRow, env, cfg);
    const finishDelayMs = Math.max(1000, Number(result.displayDurationMs || 1000));
    setTimeout(() => {
      try {
        markDisplayQueueDone(activeRow, shoutoutConfig());
        processDisplayQueue(env, shoutoutConfig()).catch(err => { state.displayQueue.lastError = err && err.message ? err.message : String(err); });
      } catch (err) {
        state.displayQueue.lastError = err && err.message ? err.message : String(err);
      }
    }, finishDelayMs).unref?.();
    return { ok: true, started: true, queueId: activeRow.id, displayDurationMs: finishDelayMs };
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    markDisplayQueueFailed(activeRow, error, cfg);
    setTimeout(() => { processDisplayQueue(env, shoutoutConfig()).catch(() => {}); }, 1000).unref?.();
    return { ok: false, failed: true, queueId: activeRow.id, error };
  }
}

function startDisplayQueueWorker(env, cfg) {
  const dcfg = displayConfig(cfg);
  if (state.displayQueue.workerStarted || dcfg.enabled === false) return;
  ensureDisplayQueueSchema();
  resetStaleDisplayQueueActiveRows();
  state.displayQueue.workerStarted = true;
  const intervalMs = Math.max(1000, Math.min(60000, Number(dcfg.workerIntervalMs || 2000)));
  const timer = setInterval(() => {
    processDisplayQueue(env, shoutoutConfig()).catch(err => {
      state.displayQueue.lastError = err && err.message ? err.message : String(err);
    });
  }, intervalMs);
  if (timer && typeof timer.unref === 'function') timer.unref();
}

async function handleRun(req, res, env) {
  const cfg = shoutoutConfig();
  const input = readRequestData(req);
  state.stats.requested += 1;

  if (cfg.enabled === false) {
    return res.status(503).json({ ok: false, error: 'clip_shoutout_disabled' });
  }

  const targetLogin = parseTarget(input);
  state.lastRunAt = nowIso();

  if (!targetLogin) {
    state.lastError = 'target_required';
    state.lastRun = { error: 'target_required', input: summarizeInput(input), failedAt: state.lastRunAt };
    return res.json({ ok: false, error: 'target_required', usage: `!${cfg.command || 'so'} @kanal` });
  }

  try {
    const vars = {
      login: targetLogin,
      displayName: cleanDisplay(input.targetDisplay || input.targetDisplayName || input.targetName || targetLogin, targetLogin),
      requestedByLogin: cleanLogin(input.userLogin || input.login || input.user || ''),
      requestedByDisplay: cleanDisplay(input.displayName || input.userName || input.user || '')
    };
    const dcfg = displayConfig(cfg);
    const queueResult = enqueueDisplayShoutout({
      targetLogin,
      targetDisplay: vars.displayName,
      requestedByLogin: vars.requestedByLogin,
      requestedByDisplay: vars.requestedByDisplay,
      input,
      availableAt: nowIso(),
      meta: { source: MODULE_NAME, command: cfg.command || 'so' }
    }, cfg);

    if (!queueResult.ok) return res.status(500).json({ ok: false, error: queueResult.error || 'display_queue_enqueue_failed' });

    if (dcfg.sendChatMessages !== false) {
      const queue = listDisplayQueue(200);
      const pendingBeforeThis = queue.filter(row => Number(row.id || 0) < Number(queueResult.row?.id || 0) && ['queued','waiting','active'].includes(row.status)).length;
      const template = pendingBeforeThis > 0 ? firstString(dcfg.waitingMessage, dcfg.acceptedMessage) : firstString(dcfg.acceptedMessage, DEFAULT_CONFIG.clipShoutout.chatMessage);
      await sendChatMessage(renderTemplate(template, vars).trim(), { targetLogin, displayQueueId: queueResult.row && queueResult.row.id });
    }

    processDisplayQueue(env, shoutoutConfig()).catch(err => { state.displayQueue.lastError = err && err.message ? err.message : String(err); });

    return res.json({
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      queued: true,
      targetLogin,
      displayQueue: {
        id: queueResult.row ? queueResult.row.id : 0,
        status: queueResult.row ? queueResult.row.status : 'queued',
        availableAt: queueResult.availableAt,
        displayCooldownMs: Math.max(0, Number(displayConfig(cfg).displayCooldownMs || 120000)),
        cooldownStartsAfterFinish: true
      },
      officialShoutout: { queuedAfterDisplay: officialConfig(cfg).enabled !== false }
    });
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    state.stats.failed += 1;
    state.lastError = error;
    state.lastRunAt = nowIso();
    state.lastRun = { targetLogin, error, failedAt: state.lastRunAt };
    return res.status(500).json({ ok: false, module: MODULE_NAME, error, targetLogin });
  }
}


module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const cfg = shoutoutConfig();
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();
  resetStaleDisplayQueueActiveRows();
  registerCommand(cfg);
  startDisplayQueueWorker(env, cfg);
  startOfficialShoutoutWorker(env, cfg);

  app.get(`${API_PREFIX}/status`, (req, res) => {
    const currentCfg = shoutoutConfig();
    state.recentClipGuard = publicRecentClipGuard(currentCfg);
    const command = cleanLogin(currentCfg.command || "so") || "so";
    res.json({
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      enabled: currentCfg.enabled !== false,
      registeredCommand: state.registeredCommand,
      command,
      aliases: currentCfg.aliases || [],
      routes: [
        { method: "GET", path: `${API_PREFIX}/status` },
        { method: "GET/POST", path: `${API_PREFIX}/run` },
        { method: "GET", path: `${API_PREFIX}/clips` },
        { method: "GET/POST", path: "/api/clip/shoutout" },
        { method: "GET/POST", path: `${API_PREFIX}/settings` },
        { method: "GET", path: `${API_PREFIX}/queue` },
        { method: "POST", path: `${API_PREFIX}/queue/remove` },
        { method: "POST", path: `${API_PREFIX}/queue/retry` }
      ],
      config: {
        maxClipDurationSeconds: currentCfg.maxClipDurationSeconds,
        allowLongerClipFallback: currentCfg.allowLongerClipFallback,
        fallbackMaxClipDurationSeconds: currentCfg.fallbackMaxClipDurationSeconds,
        clipLookbackDays: currentCfg.clipLookbackDays,
        clipSearchRangesDays: currentCfg.clipSearchRangesDays,
        clipFetchFirst: currentCfg.clipFetchFirst,
        clipFetchPages: currentCfg.clipFetchPages,
        randomPick: currentCfg.randomPick !== false,
        avoidRecentClips: currentCfg.avoidRecentClips !== false,
        recentClipMemoryPerChannel: currentCfg.recentClipMemoryPerChannel,
        recentClipFallbackWhenAllBlocked: currentCfg.recentClipFallbackWhenAllBlocked !== false,
        ttsAfterClipEnabled: currentCfg.ttsAfterClipEnabled,
        clipPlaybackMode: currentCfg.clipPlaybackMode || "direct",
        cacheDownloadedClips: currentCfg.cacheDownloadedClips,
        directPlaybackSoundIdFix: true,
        soundBundleUrl: currentCfg.soundBundleUrl,
        soundCategory: currentCfg.soundCategory,
        soundPriority: currentCfg.soundPriority,
        avatarLookupEnabled: currentCfg.avatarLookupEnabled,
        avatarLookupUrl: currentCfg.avatarLookupUrl,
        eventBusEnabled: currentCfg.eventBusEnabled !== false,
        displayQueue: displayConfig(currentCfg),
        officialShoutout: officialConfig(currentCfg)
      },
      displayQueue: displayQueueStatus(currentCfg),
      officialQueue: officialQueueStatus(currentCfg),
      state
    });
  });

  app.get(`${API_PREFIX}/clips`, (req, res) => handleListClips(req, res, env));
  app.get(`${API_PREFIX}/run`, (req, res) => handleRun(req, res, env));
  app.post(`${API_PREFIX}/run`, (req, res) => handleRun(req, res, env));
  app.get("/api/clip/shoutout", (req, res) => handleRun(req, res, env));
  app.post("/api/clip/shoutout", (req, res) => handleRun(req, res, env));

  app.get(`${API_PREFIX}/settings`, (req, res) => {
    const currentCfg = shoutoutConfig();
    res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, settings: currentCfg });
  });

  app.post(`${API_PREFIX}/settings`, (req, res) => {
    try {
      const body = req.body || {};
      const allowed = {};
      const directKeys = [
        "enabled", "command", "aliases", "permissionLevel", "clipLookbackDays", "clipSearchRangesDays",
        "clipFetchFirst", "clipFetchPages", "randomPick", "sendChatMessage", "chatMessage", "eventBusEnabled"
      ];
      for (const key of directKeys) if (Object.prototype.hasOwnProperty.call(body, key)) allowed[key] = body[key];
      if (body.displayQueue && typeof body.displayQueue === "object") allowed.displayQueue = body.displayQueue;
      if (body.officialShoutout && typeof body.officialShoutout === "object") allowed.officialShoutout = body.officialShoutout;
      const settings = saveShoutoutConfig(allowed);
      emitShoutoutBus("shoutout.settings.updated", { changedKeys: Object.keys(allowed) }, settings);
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, settings });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/queue`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, displayQueue: displayQueueStatus(currentCfg), officialQueue: officialQueueStatus(currentCfg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });


  app.post(`${API_PREFIX}/display-queue/remove`, (req, res) => {
    try {
      ensureDisplayQueueSchema();
      const id = Number(req.body?.id || req.query?.id || 0);
      if (!id) return res.status(400).json({ ok: false, error: 'id_required' });
      database.run(`UPDATE clip_shoutout_display_queue SET status='removed', updated_at=:now WHERE id=:id AND status IN ('queued','waiting','failed')`, { id, now: nowIso() });
      emitShoutoutBus('shoutout.display.removed', { queueId: id }, shoutoutConfig());
      res.json({ ok: true, id });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/display-queue/retry`, async (req, res) => {
    try {
      ensureDisplayQueueSchema();
      const id = Number(req.body?.id || req.query?.id || 0);
      if (id) database.run(`UPDATE clip_shoutout_display_queue SET status='queued', available_at=:now, updated_at=:now, last_error='' WHERE id=:id AND status IN ('waiting','failed')`, { id, now: nowIso() });
      const result = await processDisplayQueue(env, shoutoutConfig(), { force: true });
      res.json({ ok: result && result.ok !== false, result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/queue/remove`, (req, res) => {
    try {
      ensureOfficialShoutoutSchema();
      const id = Number(req.body?.id || req.query?.id || 0);
      if (!id) return res.status(400).json({ ok: false, error: "id_required" });
      database.run(`UPDATE clip_shoutout_official_queue SET status='removed', updated_at=:now WHERE id=:id AND status IN ('queued','waiting','failed')`, { id, now: nowIso() });
      emitShoutoutBus("shoutout.official.removed", { queueId: id }, shoutoutConfig());
      res.json({ ok: true, id });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/queue/retry`, async (req, res) => {
    try {
      ensureOfficialShoutoutSchema();
      const id = Number(req.body?.id || req.query?.id || 0);
      if (id) database.run(`UPDATE clip_shoutout_official_queue SET status='queued', available_at=:now, updated_at=:now, last_error='' WHERE id=:id`, { id, now: nowIso() });
      const result = await processOfficialShoutoutQueue(env, shoutoutConfig(), { force: true });
      res.json({ ok: result && result.ok !== false, result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/official/auth-status`, async (req, res) => {
    try {
      const result = await validateTwitchUserTokenScopes(env);
      res.status(result.ok ? 200 : 401).json(result);
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  console.log(`[${MODULE_NAME}] loaded: ${API_PREFIX}/run, ${API_PREFIX}/clips, ${API_PREFIX}/queue, /api/clip/shoutout`);
};
