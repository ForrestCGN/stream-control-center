'use strict';

/**
 * VIP30 STEP8.7 Twitch EventSub -> Communication Bus Patch
 *
 * Patcht backend/modules/twitch.js in-place:
 * - abonniert channel.vip.add und channel.vip.remove im EventSub WebSocket-Setup
 * - leitet diese echten Twitch-EventSub-Notifications auf den Communication Bus weiter
 * - Ziel fuer VIP30: channel.vip.remove -> Slot external_removed / Platz frei
 *
 * Idempotent: Mehrfaches Ausfuehren erzeugt keine Doppel-Eintraege.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const twitchPath = path.join(root, 'backend', 'modules', 'twitch.js');

function fail(message) {
  console.error(`[VIP30-STEP8.7-PATCH] ERROR: ${message}`);
  process.exit(1);
}

function replaceOnce(text, needle, replacement, label) {
  if (!text.includes(needle)) fail(`Marker nicht gefunden: ${label}`);
  return text.replace(needle, replacement);
}

if (!fs.existsSync(twitchPath)) fail(`Datei nicht gefunden: ${twitchPath}`);
let text = fs.readFileSync(twitchPath, 'utf8');
const original = text;

if (!text.includes("const communicationBus = require('./communication_bus');") && !text.includes('const communicationBus = require("./communication_bus");')) {
  text = replaceOnce(
    text,
    "const database = require('../core/database');\n",
    "const database = require('../core/database');\nconst communicationBus = require('./communication_bus');\n",
    'require database'
  );
}

text = text.replace(
  "emits: [],",
  "emits: ['twitch.eventsub', 'twitch.vip'],"
);

if (!text.includes('let twitchEventSubBus = null;')) {
  text = replaceOnce(
    text,
    "module.exports.init = function init(ctx) {\n  const { app, env } = ctx;\n",
    `module.exports.init = function init(ctx) {\n  const { app, env } = ctx;\n  let twitchEventSubBus = null;\n\n  function getTwitchEventSubBus() {\n    if (twitchEventSubBus) return twitchEventSubBus;\n    if (!communicationBus || typeof communicationBus.getBus !== 'function') return null;\n    twitchEventSubBus = communicationBus.getBus();\n    return twitchEventSubBus;\n  }\n`,
    'init ctx'
  );
}

if (!text.includes('twitchVipBusForwarded: 0,')) {
  text = replaceOnce(
    text,
    "lastSubscribeError: '',\n",
    "lastSubscribeError: '',\n    twitchVipBusForwarded: 0,\n    twitchVipBusFailed: 0,\n    lastTwitchVipBusAt: null,\n    lastTwitchVipBusType: '',\n    lastTwitchVipBusError: '',\n",
    'eventSubState counters'
  );
}

if (!text.includes("type: 'channel.vip.add'")) {
  text = replaceOnce(
    text,
    `    {\n      type: 'channel.channel_points_custom_reward_redemption.add',\n      version: '1',\n      cacheKey: 'channel.channel_points_custom_reward_redemption.add',\n      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })\n    },\n`,
    `    {\n      type: 'channel.channel_points_custom_reward_redemption.add',\n      version: '1',\n      cacheKey: 'channel.channel_points_custom_reward_redemption.add',\n      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })\n    },\n    {\n      type: 'channel.vip.add',\n      version: '1',\n      cacheKey: 'channel.vip.add',\n      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })\n    },\n    {\n      type: 'channel.vip.remove',\n      version: '1',\n      cacheKey: 'channel.vip.remove',\n      buildCondition: (broadcasterId) => ({ broadcaster_user_id: broadcasterId })\n    },\n`,
    'eventSubConfigs redemption'
  );
}

if (!text.includes('function isVipEventSubType(subscriptionType)')) {
  text = replaceOnce(
    text,
    "  function getEventSubStatusSnapshot() {\n",
    `  function isVipEventSubType(subscriptionType) {\n    const type = String(subscriptionType || '').trim();\n    return type === 'channel.vip.add' || type === 'channel.vip.remove';\n  }\n\n  function normalizeTwitchVipEventSubBusPayload(subscriptionType, event = {}, meta = {}, subscription = {}) {\n    const type = String(subscriptionType || '').trim();\n    const userId = String(event.user_id || event.vip_user_id || event.target_user_id || '').trim();\n    const userLogin = String(event.user_login || event.vip_user_login || event.target_user_login || '').trim().toLowerCase();\n    const userDisplayName = String(event.user_name || event.vip_user_name || event.target_user_name || userLogin || '').trim();\n    const broadcasterId = String(event.broadcaster_user_id || event.broadcaster_id || '').trim();\n    const broadcasterLogin = String(event.broadcaster_user_login || '').trim().toLowerCase();\n    const broadcasterName = String(event.broadcaster_user_name || broadcasterLogin || '').trim();\n    return {\n      provider: 'twitch_eventsub',\n      subscriptionType: type,\n      eventType: type,\n      action: type === 'channel.vip.remove' ? 'remove' : 'add',\n      userId,\n      userLogin,\n      userDisplayName,\n      broadcasterId,\n      broadcasterLogin,\n      broadcasterName,\n      eventId: String(meta.message_id || meta.messageId || subscription.id || '').trim(),\n      messageId: String(meta.message_id || meta.messageId || '').trim(),\n      messageTimestamp: String(meta.message_timestamp || '').trim(),\n      subscriptionId: String(subscription.id || '').trim(),\n      receivedAt: core.nowIso(),\n      raw: event\n    };\n  }\n\n  async function emitTwitchVipEventSubToBus(subscriptionType, event = {}, meta = {}, subscription = {}) {\n    if (!isVipEventSubType(subscriptionType)) return { ok: true, skipped: true, reason: 'not_vip_eventsub' };\n    const currentBus = getTwitchEventSubBus();\n    if (!currentBus || typeof currentBus.emit !== 'function') {\n      eventSubState.twitchVipBusFailed = Number(eventSubState.twitchVipBusFailed || 0) + 1;\n      eventSubState.lastTwitchVipBusError = 'communication_bus_unavailable';\n      eventSubState.lastTwitchVipBusType = String(subscriptionType || '');\n      rememberEventSubState({ action: 'vip_event_bus_failed', type: subscriptionType, reason: eventSubState.lastTwitchVipBusError });\n      return { ok: false, error: eventSubState.lastTwitchVipBusError };\n    }\n    const payload = normalizeTwitchVipEventSubBusPayload(subscriptionType, event, meta, subscription);\n    const result = currentBus.emit({\n      type: 'event',\n      channel: 'twitch.eventsub',\n      action: String(subscriptionType || ''),\n      source: { type: 'module', id: 'twitch_eventsub', module: MODULE_NAME },\n      target: { type: 'all' },\n      payload,\n      meta: { replayable: true, ttlMs: 60000 }\n    });\n    eventSubState.twitchVipBusForwarded = Number(eventSubState.twitchVipBusForwarded || 0) + 1;\n    eventSubState.lastTwitchVipBusAt = core.nowIso();\n    eventSubState.lastTwitchVipBusType = String(subscriptionType || '');\n    eventSubState.lastTwitchVipBusError = '';\n    rememberEventSubState({\n      action: 'vip_event_bus_forwarded',\n      type: subscriptionType,\n      userLogin: payload.userLogin,\n      eventId: result && result.event ? result.event.id : (result && result.eventId ? result.eventId : '')\n    });\n    return result || { ok: true };\n  }\n\n  function getEventSubStatusSnapshot() {\n`,
    'getEventSubStatusSnapshot'
  );
}

if (!text.includes('vipEventBus: {')) {
  text = replaceOnce(
    text,
    "deathcounterSync: getDeathcounterSyncStatus(),\n",
    `deathcounterSync: getDeathcounterSyncStatus(),\n      vipEventBus: {\n        configured: eventSubConfigs.some(cfg => cfg.type === 'channel.vip.remove') && eventSubConfigs.some(cfg => cfg.type === 'channel.vip.add'),\n        knownRemove: Array.from(eventsubKnownSubscriptions).some(key => key.startsWith('channel.vip.remove|')),\n        knownAdd: Array.from(eventsubKnownSubscriptions).some(key => key.startsWith('channel.vip.add|')),\n        forwarded: Number(eventSubState.twitchVipBusForwarded || 0),\n        failed: Number(eventSubState.twitchVipBusFailed || 0),\n        lastForwardedAt: eventSubState.lastTwitchVipBusAt || null,\n        lastType: eventSubState.lastTwitchVipBusType || '',\n        lastError: eventSubState.lastTwitchVipBusError || ''\n      },\n`,
    'deathcounterSync status'
  );
}

if (!text.includes('await emitTwitchVipEventSubToBus(sub.type, event, meta, sub);')) {
  text = replaceOnce(
    text,
    "        cacheGenericEvent(sub, event);\n\n        try {\n          await forwardTwitchShoutoutEventToClipShoutout(sub.type, event, meta, sub);\n",
    `        cacheGenericEvent(sub, event);\n\n        try {\n          await emitTwitchVipEventSubToBus(sub.type, event, meta, sub);\n        } catch (e) {\n          rememberEventSubState({ action: 'vip_event_bus_handler_failed', type: sub.type || '', error: e?.message || String(e) });\n          console.warn('[eventsub-vip-bus] forward failed:', e?.message || e);\n        }\n\n        try {\n          await forwardTwitchShoutoutEventToClipShoutout(sub.type, event, meta, sub);\n`,
    'notification cacheGenericEvent'
  );
}

if (text === original) {
  console.log('[VIP30-STEP8.7-PATCH] Keine Aenderung noetig, twitch.js war bereits gepatcht.');
  process.exit(0);
}

const backupPath = `${twitchPath}.vip30_step8_7_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
fs.copyFileSync(twitchPath, backupPath);
fs.writeFileSync(twitchPath, text, 'utf8');
console.log('[VIP30-STEP8.7-PATCH] OK: backend/modules/twitch.js gepatcht.');
console.log(`[VIP30-STEP8.7-PATCH] Backup: ${backupPath}`);
