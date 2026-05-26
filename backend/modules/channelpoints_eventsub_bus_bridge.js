"use strict";

const fs = require("fs");
const path = require("path");
const helperConfig = require("./helpers/helper_config");
const communicationBus = require("./communication_bus");

const MODULE_NAME = "channelpoints_eventsub_bus_bridge";
const MODULE_VERSION = "0.9.1";
const MODULE_BUILD = "eventbus-redemption-bridge";
const ROUTE_PREFIX = "/api/channelpoints/eventbus/redemption-bridge";
const CHANNELPOINTS_EVENTSUB_TYPE = "channel.channel_points_custom_reward_redemption.add";

const DEFAULT_CONFIG = {
  enabled: true,
  pollIntervalMs: 1000,
  auditLogPath: "data/logs/twitch_eventsub_audit.jsonl",
  cachePath: "tokens/eventsub_channel.channel_points_custom_reward_redemption.add.json",
  seekAuditEndOnStart: true,
  emitReplayable: true,
  eventTtlMs: 120000,
  maxSeenIds: 500
};

let loadedConfig = null;
let bus = null;
let timer = null;
let auditOffset = 0;
let startedAt = null;
let lastPollAt = null;
let lastEmitAt = null;
let lastError = "";
let seenIds = [];
let seenIdSet = new Set();
let stats = {
  polls: 0,
  auditLinesRead: 0,
  auditEventsSeen: 0,
  cacheEventsSeen: 0,
  emitted: 0,
  duplicates: 0,
  skipped: 0,
  errors: 0,
  lastRedemptionId: "",
  lastRewardId: "",
  lastRewardTitle: "",
  lastUserLogin: ""
};

function nowIso() { return new Date().toISOString(); }
function cleanString(value, fallback = "") { const clean = String(value ?? "").trim(); return clean || fallback; }
function intValue(value, fallback = 0) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}
function loadConfig() {
  const loaded = helperConfig.loadConfig("channelpoints_eventsub_bus_bridge.json", {}, { createIfMissing: false });
  loadedConfig = { ...DEFAULT_CONFIG, ...(loaded && loaded.data && typeof loaded.data === "object" ? loaded.data : {}) };
  loadedConfig.pollIntervalMs = Math.max(250, Math.min(10000, intValue(loadedConfig.pollIntervalMs, DEFAULT_CONFIG.pollIntervalMs)));
  loadedConfig.eventTtlMs = Math.max(10000, Math.min(600000, intValue(loadedConfig.eventTtlMs, DEFAULT_CONFIG.eventTtlMs)));
  loadedConfig.maxSeenIds = Math.max(50, Math.min(5000, intValue(loadedConfig.maxSeenIds, DEFAULT_CONFIG.maxSeenIds)));
  return loadedConfig;
}
function getConfig() { return loadedConfig || loadConfig(); }
function getRootDir() {
  if (helperConfig && typeof helperConfig.getRootDir === "function") return helperConfig.getRootDir();
  return process.cwd();
}
function resolvePath(configuredPath) {
  const clean = cleanString(configuredPath);
  if (!clean) return "";
  return path.isAbsolute(clean) ? clean : path.join(getRootDir(), clean);
}
function getBus() {
  if (bus) return bus;
  if (!communicationBus || typeof communicationBus.getBus !== "function") return null;
  bus = communicationBus.getBus();
  return bus;
}
function safeJsonParse(text, fallback = null) {
  try { return JSON.parse(String(text)); } catch (_) { return fallback; }
}
function addSeen(id) {
  const clean = cleanString(id);
  if (!clean) return false;
  if (seenIdSet.has(clean)) return false;
  seenIdSet.add(clean);
  seenIds.push(clean);
  const max = getConfig().maxSeenIds;
  while (seenIds.length > max) {
    const old = seenIds.shift();
    if (old) seenIdSet.delete(old);
  }
  return true;
}
function eventIdFromRawEvent(event = {}, fallback = "") {
  return cleanString(event.id || event.redemption_id || event.redemptionId || fallback);
}
function rewardFromRawEvent(event = {}) {
  return event && event.reward && typeof event.reward === "object" ? event.reward : {};
}
function normalizePayloadFromRawEvent(rawEvent = {}, meta = {}, subscription = {}, source = "audit") {
  const reward = rewardFromRawEvent(rawEvent);
  return {
    event: rawEvent,
    meta: meta || {},
    subscription: subscription || {},
    eventsubType: CHANNELPOINTS_EVENTSUB_TYPE,
    source: "twitch_eventsub_bus_bridge",
    bridgeSource: source,
    bridgeModule: MODULE_NAME,
    bridgeVersion: MODULE_VERSION,
    bridgeBuild: MODULE_BUILD,
    twitchRedemptionId: eventIdFromRawEvent(rawEvent, meta && meta.messageId || meta && meta.message_id || ""),
    twitchRewardId: cleanString(rawEvent.reward_id || rawEvent.rewardId || reward.id || ""),
    rewardTitle: cleanString(reward.title || rawEvent.reward_title || rawEvent.title || ""),
    rewardCost: Number(reward.cost || rawEvent.reward_cost || rawEvent.cost || 0),
    userId: cleanString(rawEvent.user_id || rawEvent.userId || ""),
    userLogin: cleanString(rawEvent.user_login || rawEvent.userLogin || rawEvent.user || "").toLowerCase(),
    userDisplayName: cleanString(rawEvent.user_name || rawEvent.userDisplayName || rawEvent.user_display_name || rawEvent.user_login || ""),
    userInput: cleanString(rawEvent.user_input || rawEvent.userInput || rawEvent.input || ""),
    redeemedAt: cleanString(rawEvent.redeemed_at || rawEvent.redeemedAt || meta && meta.message_timestamp || nowIso())
  };
}
function emitRedemption(rawEvent = {}, meta = {}, subscription = {}, source = "audit") {
  const currentBus = getBus();
  if (!currentBus || typeof currentBus.emit !== "function") {
    stats.skipped += 1;
    lastError = "communication_bus_unavailable";
    return { ok: false, reason: lastError };
  }

  const payload = normalizePayloadFromRawEvent(rawEvent, meta, subscription, source);
  const id = payload.twitchRedemptionId || cleanString(meta.message_id || meta.messageId || "");
  if (!id) {
    stats.skipped += 1;
    return { ok: false, reason: "redemption_id_missing" };
  }
  if (!addSeen(id)) {
    stats.duplicates += 1;
    return { ok: true, skipped: true, reason: "duplicate", twitchRedemptionId: id };
  }

  const result = currentBus.emit({
    type: "event",
    channel: "channelpoints.redemption",
    action: "received",
    source: { type: "module", id: `module:${MODULE_NAME}`, module: "twitch_eventsub" },
    target: { type: "all", id: "*" },
    payload,
    meta: {
      requireAck: false,
      replayable: getConfig().emitReplayable !== false,
      ttlMs: getConfig().eventTtlMs,
      productionTarget: true,
      eventsubType: CHANNELPOINTS_EVENTSUB_TYPE,
      bridgeModule: MODULE_NAME
    }
  });

  stats.emitted += 1;
  stats.lastRedemptionId = id;
  stats.lastRewardId = payload.twitchRewardId;
  stats.lastRewardTitle = payload.rewardTitle;
  stats.lastUserLogin = payload.userLogin;
  lastEmitAt = nowIso();
  lastError = "";
  return { ok: result && result.ok === true, busResult: result, payload };
}
function handleAuditRecord(record) {
  if (!record || typeof record !== "object") return;
  const type = cleanString(record.subscriptionType || record.subscription?.type || record.sourceType || "");
  if (type !== CHANNELPOINTS_EVENTSUB_TYPE) return;
  const rawEvent = record.rawEvent || record.raw_event || record.event || null;
  if (!rawEvent || typeof rawEvent !== "object") return;
  stats.auditEventsSeen += 1;
  emitRedemption(rawEvent, {
    message_id: record.messageId || record.message_id || "",
    message_timestamp: record.messageTimestamp || record.message_timestamp || record.receivedAt || ""
  }, {
    id: record.subscriptionId || "",
    type,
    version: record.subscriptionVersion || "",
    condition: record.condition || {}
  }, "audit");
}
function pollAuditFile() {
  const file = resolvePath(getConfig().auditLogPath);
  if (!file || !fs.existsSync(file)) return;
  const stat = fs.statSync(file);
  if (auditOffset > stat.size) auditOffset = 0;
  if (stat.size === auditOffset) return;
  const stream = fs.createReadStream(file, { start: auditOffset, end: stat.size - 1, encoding: "utf8" });
  auditOffset = stat.size;
  let text = "";
  stream.on("data", chunk => { text += chunk; });
  stream.on("end", () => {
    for (const line of text.split(/\r?\n/).filter(Boolean)) {
      stats.auditLinesRead += 1;
      const record = safeJsonParse(line, null);
      if (record) handleAuditRecord(record);
    }
  });
  stream.on("error", err => {
    stats.errors += 1;
    lastError = err && err.message ? err.message : String(err);
  });
}
function pollCacheFile() {
  const file = resolvePath(getConfig().cachePath);
  if (!file || !fs.existsSync(file)) return;
  const data = safeJsonParse(fs.readFileSync(file, "utf8"), null);
  const payload = data && data.payload && typeof data.payload === "object" ? data.payload : null;
  const event = payload && payload.event && typeof payload.event === "object" ? payload.event : null;
  const subscription = payload && payload.subscription && typeof payload.subscription === "object" ? payload.subscription : { type: CHANNELPOINTS_EVENTSUB_TYPE };
  const meta = payload && payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {};
  if (!event || cleanString(subscription.type || CHANNELPOINTS_EVENTSUB_TYPE) !== CHANNELPOINTS_EVENTSUB_TYPE) return;
  stats.cacheEventsSeen += 1;
  emitRedemption(event, meta, subscription, "cache");
}
function pollOnce() {
  if (getConfig().enabled === false) return;
  stats.polls += 1;
  lastPollAt = nowIso();
  try {
    pollAuditFile();
    pollCacheFile();
  } catch (err) {
    stats.errors += 1;
    lastError = err && err.message ? err.message : String(err);
  }
}
function buildStatus() {
  const config = getConfig();
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: config.enabled !== false,
    status: config.enabled === false ? "disabled" : "watching_twitch_eventsub_audit_and_cache",
    eventBusDriven: true,
    noHttpModuleBridge: true,
    eventsubType: CHANNELPOINTS_EVENTSUB_TYPE,
    paths: {
      auditLogPath: resolvePath(config.auditLogPath),
      cachePath: resolvePath(config.cachePath)
    },
    startedAt,
    lastPollAt,
    lastEmitAt,
    lastError,
    stats: { ...stats },
    seenCount: seenIds.length,
    routes: [ROUTE_PREFIX + "/status"]
  };
}
function init({ app }) {
  loadConfig();
  startedAt = nowIso();
  try {
    const auditFile = resolvePath(getConfig().auditLogPath);
    if (getConfig().seekAuditEndOnStart !== false && auditFile && fs.existsSync(auditFile)) {
      auditOffset = fs.statSync(auditFile).size;
    }
  } catch (err) {
    lastError = err && err.message ? err.message : String(err);
  }

  const currentBus = getBus();
  if (currentBus && typeof currentBus.registerModule === "function") {
    currentBus.registerModule({
      id: `module:${MODULE_NAME}`,
      module: MODULE_NAME,
      name: "Kanalpunkte EventSub EventBus Bridge",
      version: MODULE_VERSION,
      capabilities: ["channelpoints.redemption.received", "twitch.eventsub.audit.watch"],
      meta: { eventBusDriven: true, noHttpModuleBridge: true, eventsubType: CHANNELPOINTS_EVENTSUB_TYPE }
    });
    currentBus.publishModuleStatus(MODULE_NAME, buildStatus(), { action: "updated", replayable: true, requireAck: false });
  }

  if (getConfig().enabled !== false) {
    timer = setInterval(pollOnce, getConfig().pollIntervalMs);
    if (timer && typeof timer.unref === "function") timer.unref();
  }

  if (app && typeof app.get === "function") {
    app.get(`${ROUTE_PREFIX}/status`, (req, res) => {
      res.json(buildStatus());
    });
    app.get(`${ROUTE_PREFIX}/poll-now`, (req, res) => {
      pollOnce();
      res.json(buildStatus());
    });
  }

  console.log(`[${MODULE_NAME}] v${MODULE_VERSION} active (${MODULE_BUILD})`);
}

module.exports = { init, buildStatus, emitRedemption, MODULE_META: { name: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD } };
