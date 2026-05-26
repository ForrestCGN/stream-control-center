"use strict";

const http = require("http");
const https = require("https");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");
const database = require("../core/database");

const MODULE_NAME = "channelpoints_twitch_readonly_sync";
const MODULE_VERSION = "0.8.1";
const MODULE_BUILD = "twitch-rewards-readonly-sync";
const ROUTE_PREFIX = "/api/channelpoints";
const DEFAULT_TARGET_HOST = "127.0.0.1";
const DEFAULT_TARGET_PORT = 8080;
const TWITCH_REWARDS_URL = "https://api.twitch.tv/helix/channel_points/custom_rewards";

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  routePrefix: `${ROUTE_PREFIX}/twitch`,
  description: "Read-only Twitch Custom Rewards sync add-on for the Channelpoints system",
  build: MODULE_BUILD
};

const DEFAULT_CONFIG = {
  enabled: true,
  busEnabled: true,
  twitchRewardsReadOnlySyncEnabled: true,
  twitchRewardsReadUrl: "",
  twitchAuthValidateUrl: "/api/twitch/auth/validate",
  dryRunDefault: true,
  allowLocalRewardUpsert: true,
  defaultCategoryKey: "general",
  defaultSortOrder: 100,
  defaultActionType: "manual",
  defaultActionPayloadJson: "{}"
};

let loadedConfig = null;
let bus = null;
let registeredAtBus = false;
let lastError = "";
let lastReadAt = null;
let lastSyncAt = null;
let lastStatusAt = null;
let lastHeartbeatAt = null;
let lastReadResult = null;
let lastSyncResult = null;
let readStats = { attempted: 0, ok: 0, failed: 0 };
let syncStats = { attempted: 0, ok: 0, failed: 0, inserted: 0, updated: 0, unchanged: 0 };

function nowIso() { return new Date().toISOString(); }
function cleanString(value, fallback = "") { const clean = String(value ?? "").trim(); return clean || fallback; }
function intValue(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}
function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "ja", "on", "y"].includes(raw)) return true;
  if (["0", "false", "no", "nein", "off", "n"].includes(raw)) return false;
  return fallback;
}
function safeJsonString(value, fallback = {}) {
  try { return JSON.stringify(value === undefined ? fallback : value); } catch (_) { return JSON.stringify(fallback); }
}
function slugify(value, fallback = "reward") {
  const raw = cleanString(value, fallback).toLowerCase();
  const clean = raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function loadConfig() {
  const loaded = helperConfig.loadConfig("channelpoints.json", {}, { createIfMissing: false });
  loadedConfig = { ...DEFAULT_CONFIG, ...(loaded && loaded.data && typeof loaded.data === "object" ? loaded.data : {}) };
  return loadedConfig;
}
function getConfig() { return loadedConfig || loadConfig(); }
function getBus() {
  if (bus) return bus;
  if (!communicationBus || typeof communicationBus.getBus !== "function") return null;
  bus = communicationBus.getBus();
  return bus;
}
function ensureDbReady() { database.ensureReady(); return true; }

function getEnvToken() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_ACCESS_TOKEN || process.env.TWITCH_USER_ACCESS_TOKEN || process.env.TWITCH_ACCESS_TOKEN || "");
}
function getEnvClientId() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_CLIENT_ID || process.env.TWITCH_CLIENT_ID || "");
}
function getEnvBroadcasterId() {
  return cleanString(process.env.CHANNELPOINTS_TWITCH_BROADCASTER_ID || process.env.TWITCH_BROADCASTER_ID || "");
}

function localHttpGetJson(targetUrl) {
  const cleanUrl = cleanString(targetUrl);
  if (!cleanUrl) return Promise.reject(new Error("target_url_missing"));
  const options = {
    hostname: process.env.CHANNELPOINTS_TARGET_HOST || DEFAULT_TARGET_HOST,
    port: Number(process.env.CHANNELPOINTS_TARGET_PORT || DEFAULT_TARGET_PORT) || DEFAULT_TARGET_PORT,
    path: cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`,
    method: "GET",
    headers: { Accept: "application/json" }
  };
  return new Promise((resolve, reject) => {
    const request = http.request(options, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, statusCode: response.statusCode, data: parsed });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

function twitchGetJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: "GET", headers: { Accept: "application/json", ...headers } }, response => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) {}
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, statusCode: response.statusCode, data: parsed });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

function normalizeTwitchReward(raw = {}) {
  const id = cleanString(raw.id || raw.reward_id || "");
  const title = cleanString(raw.title || raw.name || "");
  const prompt = cleanString(raw.prompt || raw.description || "");
  const globalCooldown = raw.global_cooldown_setting || raw.global_cooldown || {};
  const maxPerStream = raw.max_per_stream_setting || raw.max_per_stream || {};
  const maxPerUser = raw.max_per_user_per_stream_setting || raw.max_per_user_per_stream || {};
  return {
    twitch_reward_id: id,
    reward_key: slugify(title || id || "twitch_reward"),
    title,
    prompt,
    cost: Math.max(1, intValue(raw.cost, 1)),
    twitch_is_enabled: raw.is_enabled === true,
    is_paused: raw.is_paused === true,
    require_user_input: raw.is_user_input_required === true || raw.require_user_input === true,
    cooldown_seconds: globalCooldown && globalCooldown.is_enabled ? intValue(globalCooldown.global_cooldown_seconds, 0) : 0,
    max_per_stream: maxPerStream && maxPerStream.is_enabled ? intValue(maxPerStream.max_per_stream, 0) : 0,
    max_per_user_per_stream: maxPerUser && maxPerUser.is_enabled ? intValue(maxPerUser.max_per_user_per_stream, 0) : 0,
    raw
  };
}

function normalizeTwitchRewardsPayload(payload = {}) {
  const data = Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []);
  return data.map(normalizeTwitchReward).filter(item => item.twitch_reward_id && item.title);
}

async function readTwitchRewards(req = {}) {
  const config = getConfig();
  if (config.enabled === false || config.twitchRewardsReadOnlySyncEnabled === false) {
    return { ok: false, skipped: true, reason: "disabled_by_config", rewards: [], twitchWrite: false };
  }

  readStats.attempted += 1;
  lastReadAt = nowIso();

  const configuredReadUrl = cleanString(config.twitchRewardsReadUrl || req.query?.sourceUrl || "");
  try {
    let response;
    let source;
    if (configuredReadUrl) {
      source = configuredReadUrl.startsWith("http://") || configuredReadUrl.startsWith("https://") ? "configured_url" : "local_proxy_route";
      response = configuredReadUrl.startsWith("http://") || configuredReadUrl.startsWith("https://")
        ? await twitchGetJson(configuredReadUrl)
        : await localHttpGetJson(configuredReadUrl);
    } else {
      const broadcasterId = cleanString(req.query?.broadcaster_id || getEnvBroadcasterId());
      const token = getEnvToken();
      const clientId = getEnvClientId();
      if (!broadcasterId) throw new Error("missing_broadcaster_id");
      if (!token) throw new Error("missing_user_access_token_env");
      if (!clientId) throw new Error("missing_client_id_env");
      const url = new URL(TWITCH_REWARDS_URL);
      url.searchParams.set("broadcaster_id", broadcasterId);
      const ids = String(req.query?.id || "").split(",").map(item => item.trim()).filter(Boolean).slice(0, 50);
      for (const id of ids) url.searchParams.append("id", id);
      source = "twitch_helix_direct_readonly";
      response = await twitchGetJson(url, { "Client-Id": clientId, Authorization: `Bearer ${token}` });
    }

    const rewards = normalizeTwitchRewardsPayload(response.data || {});
    const result = {
      ok: response.ok === true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      statusCode: response.statusCode || 0,
      source,
      rewardCount: rewards.length,
      rewards,
      rawReturned: req.query && boolValue(req.query.raw, false) ? response.data : undefined,
      twitchWrite: false,
      readOnly: true,
      readAt: lastReadAt
    };
    if (!response.ok) {
      result.error = response.data && (response.data.message || response.data.error) || `twitch_read_http_${response.statusCode}`;
      readStats.failed += 1;
      lastError = result.error;
    } else {
      readStats.ok += 1;
      lastError = "";
    }
    lastReadResult = { ...result, rewards: rewards.map(item => ({ twitch_reward_id: item.twitch_reward_id, title: item.title, cost: item.cost })) };
    emitDomainEvent("channelpoints.twitch.rewards.read", { rewardCount: rewards.length, source, ok: response.ok === true });
    publishStatus("twitch_rewards_read");
    return result;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    readStats.failed += 1;
    lastError = message;
    const result = { ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: message, rewards: [], twitchWrite: false, readOnly: true, readAt: lastReadAt };
    lastReadResult = result;
    emitDomainEvent("channelpoints.twitch.rewards.read_failed", { error: message });
    publishStatus("twitch_rewards_read_failed");
    return result;
  }
}

function findLocalRewardByTwitchId(twitchRewardId) {
  ensureDbReady();
  return database.get("SELECT * FROM channelpoints_rewards WHERE twitch_reward_id = :twitch_reward_id", { twitch_reward_id: twitchRewardId }) || null;
}
function findLocalRewardByKey(rewardKey) {
  ensureDbReady();
  return database.get("SELECT * FROM channelpoints_rewards WHERE reward_key = :reward_key", { reward_key: rewardKey }) || null;
}
function localRewardChanged(row, reward) {
  if (!row) return true;
  return String(row.title || "") !== reward.title ||
    String(row.prompt || "") !== reward.prompt ||
    Number(row.cost || 0) !== Number(reward.cost || 0) ||
    Number(row.twitch_is_enabled || 0) !== (reward.twitch_is_enabled ? 1 : 0) ||
    Number(row.is_paused || 0) !== (reward.is_paused ? 1 : 0) ||
    Number(row.require_user_input || 0) !== (reward.require_user_input ? 1 : 0);
}

function upsertLocalRewardFromTwitch(reward, dryRun = true) {
  const config = getConfig();
  const now = nowIso();
  const existingById = findLocalRewardByTwitchId(reward.twitch_reward_id);
  const existingByKey = existingById ? null : findLocalRewardByKey(reward.reward_key);
  const existing = existingById || existingByKey;
  const finalKey = existing ? cleanString(existing.reward_key, reward.reward_key) : reward.reward_key;
  const changed = localRewardChanged(existing, reward) || (existing && !existing.twitch_reward_id);

  if (!existing) {
    if (!dryRun) {
      database.run(`
        INSERT INTO channelpoints_rewards (
          reward_key, twitch_reward_id, title, prompt, cost, category_key, sort_order,
          system_enabled, twitch_is_enabled, is_paused, require_user_input, input_label,
          action_type, action_key, action_payload_json, media_asset_id, media_role,
          queue_mode, priority, cooldown_seconds, max_per_stream, max_per_user_per_stream,
          auto_fulfill, notes, created_at, updated_at
        ) VALUES (
          :reward_key, :twitch_reward_id, :title, :prompt, :cost, :category_key, :sort_order,
          :system_enabled, :twitch_is_enabled, :is_paused, :require_user_input, :input_label,
          :action_type, :action_key, :action_payload_json, :media_asset_id, :media_role,
          :queue_mode, :priority, :cooldown_seconds, :max_per_stream, :max_per_user_per_stream,
          :auto_fulfill, :notes, :created_at, :updated_at
        )
      `, {
        reward_key: finalKey,
        twitch_reward_id: reward.twitch_reward_id,
        title: reward.title,
        prompt: reward.prompt,
        cost: reward.cost,
        category_key: cleanString(config.defaultCategoryKey, "general"),
        sort_order: intValue(config.defaultSortOrder, 100),
        system_enabled: 1,
        twitch_is_enabled: reward.twitch_is_enabled ? 1 : 0,
        is_paused: reward.is_paused ? 1 : 0,
        require_user_input: reward.require_user_input ? 1 : 0,
        input_label: "",
        action_type: cleanString(config.defaultActionType, "manual"),
        action_key: "",
        action_payload_json: cleanString(config.defaultActionPayloadJson, "{}"),
        media_asset_id: "",
        media_role: "none",
        queue_mode: "none",
        priority: 0,
        cooldown_seconds: reward.cooldown_seconds,
        max_per_stream: reward.max_per_stream,
        max_per_user_per_stream: reward.max_per_user_per_stream,
        auto_fulfill: 0,
        notes: "Imported by Twitch rewards read-only sync.",
        created_at: now,
        updated_at: now
      });
    }
    return { action: "insert", rewardKey: finalKey, twitchRewardId: reward.twitch_reward_id, title: reward.title, changed: true };
  }

  if (!changed) return { action: "unchanged", rewardKey: finalKey, twitchRewardId: reward.twitch_reward_id, title: reward.title, changed: false };

  if (!dryRun) {
    database.run(`
      UPDATE channelpoints_rewards SET
        twitch_reward_id = :twitch_reward_id,
        title = :title,
        prompt = :prompt,
        cost = :cost,
        twitch_is_enabled = :twitch_is_enabled,
        is_paused = :is_paused,
        require_user_input = :require_user_input,
        cooldown_seconds = :cooldown_seconds,
        max_per_stream = :max_per_stream,
        max_per_user_per_stream = :max_per_user_per_stream,
        updated_at = :updated_at
      WHERE id = :id
    `, {
      id: existing.id,
      twitch_reward_id: reward.twitch_reward_id,
      title: reward.title,
      prompt: reward.prompt,
      cost: reward.cost,
      twitch_is_enabled: reward.twitch_is_enabled ? 1 : 0,
      is_paused: reward.is_paused ? 1 : 0,
      require_user_input: reward.require_user_input ? 1 : 0,
      cooldown_seconds: reward.cooldown_seconds,
      max_per_stream: reward.max_per_stream,
      max_per_user_per_stream: reward.max_per_user_per_stream,
      updated_at: now
    });
  }
  return { action: "update", rewardKey: finalKey, twitchRewardId: reward.twitch_reward_id, title: reward.title, changed: true };
}

async function syncTwitchRewards(req = {}) {
  const config = getConfig();
  if (config.allowLocalRewardUpsert === false) {
    return { ok: false, skipped: true, reason: "local_reward_upsert_disabled", twitchWrite: false };
  }
  const query = req.query || {};
  const body = req.body || {};
  const dryRun = body.dryRun !== undefined ? boolValue(body.dryRun, true) : boolValue(query.dryRun, config.dryRunDefault !== false);

  syncStats.attempted += 1;
  lastSyncAt = nowIso();
  const read = await readTwitchRewards(req);
  if (!read.ok) {
    syncStats.failed += 1;
    lastSyncResult = { ok: false, error: read.error || "read_failed", dryRun, twitchWrite: false, syncedAt: lastSyncAt };
    return lastSyncResult;
  }

  try {
    ensureDbReady();
    const changes = [];
    for (const reward of read.rewards) {
      const change = upsertLocalRewardFromTwitch(reward, dryRun);
      changes.push(change);
    }
    const summary = changes.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, { insert: 0, update: 0, unchanged: 0 });
    if (!dryRun) {
      syncStats.inserted += summary.insert || 0;
      syncStats.updated += summary.update || 0;
      syncStats.unchanged += summary.unchanged || 0;
    }
    syncStats.ok += 1;
    lastError = "";
    const result = {
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      moduleBuild: MODULE_BUILD,
      action: dryRun ? "preview_twitch_rewards_sync" : "sync_twitch_rewards_to_local_db",
      dryRun,
      rewardCount: read.rewards.length,
      summary,
      changes,
      twitchWrite: false,
      localDbWrite: !dryRun,
      syncedAt: lastSyncAt
    };
    lastSyncResult = result;
    emitDomainEvent(dryRun ? "channelpoints.twitch.rewards.sync_preview" : "channelpoints.twitch.rewards.synced", { rewardCount: read.rewards.length, summary, dryRun });
    publishStatus(dryRun ? "twitch_rewards_sync_preview" : "twitch_rewards_synced_local");
    return result;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    syncStats.failed += 1;
    lastError = message;
    const result = { ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: message, dryRun, twitchWrite: false, syncedAt: lastSyncAt };
    lastSyncResult = result;
    emitDomainEvent("channelpoints.twitch.rewards.sync_failed", { error: message, dryRun });
    publishStatus("twitch_rewards_sync_failed");
    return result;
  }
}

function countLocalMappedRewards() {
  try {
    ensureDbReady();
    if (!database.tableExists("channelpoints_rewards")) return { total: 0, mapped: 0 };
    const total = database.get("SELECT COUNT(*) AS count FROM channelpoints_rewards") || {};
    const mapped = database.get("SELECT COUNT(*) AS count FROM channelpoints_rewards WHERE twitch_reward_id IS NOT NULL AND twitch_reward_id <> ''") || {};
    return { total: Number(total.count || 0), mapped: Number(mapped.count || 0) };
  } catch (_) {
    return { total: 0, mapped: 0 };
  }
}

function emitDomainEvent(action, payload = {}) {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") return { ok: false, reason: "bus_emit_unavailable" };
  return currentBus.emit({
    type: "event",
    channel: "channelpoints.twitch",
    action,
    source: { type: "module", id: `module:${MODULE_NAME}`, module: MODULE_NAME },
    target: { type: "all", id: "*" },
    payload: { module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, ...payload, twitchWrite: false, timestamp: nowIso() },
    meta: { requireAck: false, replayable: true, ttlMs: 60000, productionTarget: true, localOnly: true, twitchWrite: false }
  });
}

function heartbeatBus(reason = "heartbeat") {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.heartbeatModule !== "function") return { ok: false, reason: "bus_heartbeatModule_unavailable" };
  lastHeartbeatAt = nowIso();
  return currentBus.heartbeatModule(MODULE_NAME, {
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    version: MODULE_VERSION,
    status: "online",
    health: lastError ? "warn" : "ok",
    reason,
    capabilities: ["module.lifecycle", "module.status", "channelpoints.twitch.readonly_rewards", "channelpoints.twitch.sync_preview", "channelpoints.twitch.local_sync"]
  });
}

function publishStatus(reason = "status") {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.publishModuleStatus !== "function") return { ok: false, reason: "bus_publishModuleStatus_unavailable" };
  lastStatusAt = nowIso();
  const mapped = countLocalMappedRewards();
  return currentBus.publishModuleStatus(MODULE_NAME, {
    module: MODULE_NAME,
    version: MODULE_VERSION,
    build: MODULE_BUILD,
    enabled: config.enabled !== false,
    health: lastError ? "warn" : "ok",
    status: "online",
    reason,
    routePrefix: `${ROUTE_PREFIX}/twitch`,
    twitchWrite: false,
    readOnly: true,
    localRewardCount: mapped.total,
    mappedRewardCount: mapped.mapped,
    readStats: { ...readStats },
    syncStats: { ...syncStats },
    lastReadAt,
    lastSyncAt,
    lastError,
    timestamp: lastStatusAt
  }, { action: "updated", replayable: true, requireAck: false });
}

function registerAtCommunicationBus() {
  const config = getConfig();
  if (config.busEnabled === false) return { ok: false, reason: "bus_disabled_by_config" };
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.registerModule !== "function") return { ok: false, reason: "bus_registerModule_unavailable" };
  const result = currentBus.registerModule({
    id: `module:${MODULE_NAME}`,
    module: MODULE_NAME,
    name: "Kanalpunkte Twitch Rewards Read-Only Sync",
    version: MODULE_VERSION,
    capabilities: ["module.lifecycle", "module.status", "channelpoints.twitch.readonly_rewards", "channelpoints.twitch.sync_preview", "channelpoints.twitch.local_sync"],
    meta: { routePrefix: `${ROUTE_PREFIX}/twitch`, parentModule: "channelpoints", twitchWrite: false, build: MODULE_BUILD }
  });
  registeredAtBus = result && result.ok === true;
  heartbeatBus("register");
  publishStatus("register");
  return result;
}

function buildStatus(extra = {}) {
  const config = getConfig();
  const mapped = countLocalMappedRewards();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    parentModule: "channelpoints",
    enabled: config.enabled !== false,
    routePrefix: `${ROUTE_PREFIX}/twitch`,
    mode: "twitch_rewards_readonly_sync_addon",
    twitchWrite: false,
    readOnly: true,
    localDbWriteOnlyOnSync: true,
    localRewards: mapped,
    bus: { registered: registeredAtBus, lastHeartbeatAt, lastStatusAt },
    readStats: { ...readStats },
    syncStats: { ...syncStats },
    lastReadAt,
    lastSyncAt,
    lastReadResult,
    lastSyncResult,
    lastError,
    routes: [
      `${ROUTE_PREFIX}/twitch/rewards-readonly/status`,
      `${ROUTE_PREFIX}/twitch/rewards-readonly/preview`,
      `${ROUTE_PREFIX}/twitch/rewards-readonly/sync`,
      `${ROUTE_PREFIX}/twitch/rewards`,
      `${ROUTE_PREFIX}/twitch/sync`
    ],
    safety: {
      noTwitchWrite: true,
      noRewardCreateUpdateDeleteOnTwitch: true,
      noRedemptionStatusUpdate: true,
      noDestructiveDbMigration: true,
      noDbReplacement: true
    },
    config: {
      twitchRewardsReadOnlySyncEnabled: config.twitchRewardsReadOnlySyncEnabled !== false,
      twitchRewardsReadUrlConfigured: !!cleanString(config.twitchRewardsReadUrl),
      dryRunDefault: config.dryRunDefault !== false,
      allowLocalRewardUpsert: config.allowLocalRewardUpsert !== false,
      defaultCategoryKey: cleanString(config.defaultCategoryKey, "general")
    },
    ...extra
  };
}

function sendError(res, statusCode, error, extra = {}) {
  const message = error && error.message ? error.message : String(error);
  lastError = message;
  res.status(statusCode).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: message, twitchWrite: false, ...extra });
}

function init({ app }) {
  if (!app) throw new Error("channelpoints_twitch_readonly_sync.init: app fehlt.");
  loadConfig();
  try { registerAtCommunicationBus(); } catch (err) { lastError = err && err.message ? err.message : String(err); }

  app.get(`${ROUTE_PREFIX}/twitch/rewards-readonly/status`, (req, res) => {
    try { heartbeatBus("status_route"); publishStatus("status_route"); res.json(buildStatus()); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/twitch/rewards-readonly/preview`, async (req, res) => {
    try { res.json(await syncTwitchRewards({ ...req, query: { ...(req.query || {}), dryRun: "1" } })); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/twitch/rewards`, async (req, res) => {
    try { res.json(await readTwitchRewards(req)); } catch (err) { sendError(res, 500, err); }
  });

  app.get(`${ROUTE_PREFIX}/twitch/sync`, async (req, res) => {
    try { res.json(await syncTwitchRewards(req)); } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/rewards-readonly/sync`, async (req, res) => {
    try { res.json(await syncTwitchRewards(req)); } catch (err) { sendError(res, 500, err); }
  });

  app.post(`${ROUTE_PREFIX}/twitch/sync`, async (req, res) => {
    try { res.json(await syncTwitchRewards(req)); } catch (err) { sendError(res, 500, err); }
  });

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} API routes registered (${ROUTE_PREFIX}/twitch) build=${MODULE_BUILD}`);
}

module.exports = {
  MODULE_META,
  init,
  buildStatus,
  readTwitchRewards,
  syncTwitchRewards,
  registerAtCommunicationBus,
  heartbeatBus,
  publishStatus
};
