'use strict';

const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const commands = require('./commands');
const communicationBus = require('./communication_bus');

const MODULE_NAME = 'twitch_chat_bus_bridge';
const MODULE_VERSION = '0.1.0';
const MODULE_BUILD = 'STEP_LWG_4O_1';

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'communication',
  description: 'Leichte Twitch-Chat-zu-Communication-Bus-Bruecke fuer PRIVMSG aus twitch_presence.',
  routesPrefix: ['/api/twitch/chat-bus'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: ['twitch.chat.message'],
    listens: []
  },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  onlyWhenSubscribed: true,
  maxMessageLength: 450,
  includeBadges: true,
  includeRaw: false,
  target: {
    type: 'module',
    id: '*',
    module: '',
    capability: ''
  },
  meta: {
    replayable: false,
    requireAck: false,
    ttlMs: 0,
    priority: 'P2'
  }
};

const state = {
  loadedAt: core.nowIso ? core.nowIso() : new Date().toISOString(),
  initialized: false,
  wrapped: false,
  enabled: true,
  config: { ...DEFAULT_CONFIG },
  stats: {
    seenPrivmsg: 0,
    emitted: 0,
    skipped: 0,
    skippedSource: 0,
    skippedNoSubscriber: 0,
    skippedNoBus: 0,
    skippedDisabled: 0,
    errors: 0
  },
  lastMessageAt: '',
  lastEmittedAt: '',
  lastSkippedReason: '',
  lastError: '',
  lastEventId: '',
  lastUserLogin: '',
  lastMessagePreview: ''
};

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function cleanLogin(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}

function boolEnv(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const clean = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(clean)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(clean)) return false;
  return fallback;
}

function intEnv(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  const n = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, n));
}

function shortPreview(value, limit = 120) {
  const text = String(value || '').replace(/[\r\n]+/g, ' ').trim();
  return text.length > limit ? text.slice(0, Math.max(0, limit - 3)).trimEnd() + '...' : text;
}

function messageFromParsed(parsed = {}) {
  const params = Array.isArray(parsed.params) ? parsed.params : [];
  return cleanString(params[1] || params[params.length - 1] || '');
}

function channelFromParsed(parsed = {}, source = {}) {
  const params = Array.isArray(parsed.params) ? parsed.params : [];
  return cleanString(source.channel || params[0] || parsed.channel || '').replace(/^#/, '').toLowerCase();
}

function tagsFromParsed(parsed = {}) {
  return parsed && typeof parsed.tags === 'object' && parsed.tags ? parsed.tags : {};
}

function badgesFromParsed(parsed = {}) {
  return parsed && typeof parsed.badges === 'object' && parsed.badges ? parsed.badges : {};
}

function userPayloadFromParsed(parsed = {}) {
  const tags = tagsFromParsed(parsed);
  const badges = badgesFromParsed(parsed);
  const login = cleanLogin(parsed.login || tags.login || '');
  const displayName = cleanString(parsed.displayName || tags['display-name'] || login, login);
  return {
    userLogin: login,
    userDisplayName: displayName,
    userId: cleanString(tags['user-id'] || ''),
    roles: {
      broadcaster: Boolean(badges.broadcaster),
      mod: Boolean(badges.moderator) || tags.mod === '1',
      vip: Boolean(badges.vip),
      subscriber: Boolean(badges.subscriber || badges.founder) || tags.subscriber === '1'
    },
    badges: state.config.includeBadges ? badges : undefined
  };
}

function isCommandMessage(message) {
  const prefix = cleanString(process.env.COMMAND_PREFIX || '!', '!');
  return Boolean(message && message.startsWith(prefix));
}

function isTwitchPresenceSource(source = {}) {
  const sourceName = cleanString(source.source || source.module || '').toLowerCase();
  return sourceName === 'twitch_presence';
}

function getCurrentBus() {
  try {
    if (!communicationBus || typeof communicationBus.getBus !== 'function') return null;
    return communicationBus.getBus();
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return null;
  }
}

function hasMatchingSubscriber(bus) {
  if (!state.config.onlyWhenSubscribed) return true;
  if (!bus || typeof bus.getStatus !== 'function') return false;
  try {
    const status = bus.getStatus();
    const subscriptions = Array.isArray(status.subscriptions) ? status.subscriptions : [];
    return subscriptions.some((sub) => {
      if (!sub || sub.enabled === false) return false;
      const channel = cleanString(sub.channel || '');
      const action = cleanString(sub.action || '');
      return (!channel || channel === 'twitch.chat') && (!action || action === 'message');
    });
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return false;
  }
}

function buildChatPayload(parsed = {}, source = {}) {
  const message = messageFromParsed(parsed).slice(0, state.config.maxMessageLength);
  const user = userPayloadFromParsed(parsed);
  const payload = {
    provider: 'twitch_irc',
    sourceModule: 'twitch_presence',
    channel: channelFromParsed(parsed, source),
    message,
    messagePreview: shortPreview(message),
    isCommand: isCommandMessage(message),
    receivedAt: nowIso(),
    ...user
  };

  if (state.config.includeRaw) {
    payload.raw = {
      command: parsed.command || '',
      params: Array.isArray(parsed.params) ? parsed.params : [],
      tags: tagsFromParsed(parsed)
    };
  }

  if (payload.badges === undefined) delete payload.badges;
  return payload;
}

function emitChatMessage(parsed = {}, source = {}) {
  if (!state.enabled || state.config.enabled === false) {
    state.stats.skipped += 1;
    state.stats.skippedDisabled += 1;
    state.lastSkippedReason = 'disabled';
    return { ok: true, skipped: true, reason: 'disabled' };
  }

  if (!isTwitchPresenceSource(source)) {
    state.stats.skipped += 1;
    state.stats.skippedSource += 1;
    state.lastSkippedReason = 'source_not_twitch_presence';
    return { ok: true, skipped: true, reason: 'source_not_twitch_presence' };
  }

  if (String(parsed.command || '').toUpperCase() !== 'PRIVMSG') {
    state.stats.skipped += 1;
    state.lastSkippedReason = 'not_privmsg';
    return { ok: true, skipped: true, reason: 'not_privmsg' };
  }

  const bus = getCurrentBus();
  if (!bus || typeof bus.emit !== 'function') {
    state.stats.skipped += 1;
    state.stats.skippedNoBus += 1;
    state.lastSkippedReason = 'communication_bus_unavailable';
    return { ok: false, skipped: true, reason: 'communication_bus_unavailable' };
  }

  if (!hasMatchingSubscriber(bus)) {
    state.stats.skipped += 1;
    state.stats.skippedNoSubscriber += 1;
    state.lastSkippedReason = 'no_twitch_chat_subscriber';
    return { ok: true, skipped: true, reason: 'no_twitch_chat_subscriber' };
  }

  const payload = buildChatPayload(parsed, source);
  const result = bus.emit({
    type: 'event',
    channel: 'twitch.chat',
    action: 'message',
    source: { type: 'module', id: MODULE_NAME, module: MODULE_NAME },
    target: state.config.target,
    payload,
    meta: {
      replayable: false,
      requireAck: false,
      ttlMs: 0,
      priority: state.config.meta.priority,
      chatEvent: true,
      productionTarget: true
    }
  });

  state.stats.emitted += 1;
  state.lastEmittedAt = nowIso();
  state.lastEventId = result && result.eventId ? result.eventId : '';
  state.lastUserLogin = payload.userLogin || '';
  state.lastMessagePreview = payload.messagePreview || '';
  state.lastSkippedReason = '';
  return result || { ok: true };
}

function wrapCommandChatHandler() {
  if (commands.__cgnChatBusBridgeWrapped === true) {
    state.wrapped = true;
    return { ok: true, alreadyWrapped: true };
  }

  if (typeof commands.handleChatMessage !== 'function') {
    return { ok: false, error: 'commands_handleChatMessage_missing' };
  }

  const originalHandleChatMessage = commands.handleChatMessage;

  commands.handleChatMessage = async function chatBusBridgeWrappedHandleChatMessage(parsed, source = {}) {
    if (parsed && String(parsed.command || '').toUpperCase() === 'PRIVMSG' && isTwitchPresenceSource(source)) {
      state.stats.seenPrivmsg += 1;
      state.lastMessageAt = nowIso();
      try {
        emitChatMessage(parsed, source);
      } catch (err) {
        state.stats.errors += 1;
        state.lastError = err && err.message ? err.message : String(err);
      }
    }

    return originalHandleChatMessage.call(this, parsed, source);
  };

  commands.__cgnChatBusBridgeWrapped = true;
  commands.__cgnChatBusBridgeOriginalHandleChatMessage = originalHandleChatMessage;
  state.wrapped = true;
  return { ok: true, wrapped: true };
}

function loadConfigFromEnv(env = process.env) {
  state.config = {
    ...DEFAULT_CONFIG,
    enabled: boolEnv(env.TWITCH_CHAT_BUS_ENABLED, DEFAULT_CONFIG.enabled),
    onlyWhenSubscribed: boolEnv(env.TWITCH_CHAT_BUS_ONLY_WHEN_SUBSCRIBED, DEFAULT_CONFIG.onlyWhenSubscribed),
    maxMessageLength: intEnv(env.TWITCH_CHAT_BUS_MAX_MESSAGE_LENGTH, DEFAULT_CONFIG.maxMessageLength, 20, 5000),
    includeBadges: boolEnv(env.TWITCH_CHAT_BUS_INCLUDE_BADGES, DEFAULT_CONFIG.includeBadges),
    includeRaw: boolEnv(env.TWITCH_CHAT_BUS_INCLUDE_RAW, DEFAULT_CONFIG.includeRaw),
    target: { ...DEFAULT_CONFIG.target },
    meta: { ...DEFAULT_CONFIG.meta }
  };
  state.enabled = state.config.enabled !== false;
  return state.config;
}

function statusPayload() {
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    initialized: state.initialized,
    wrapped: state.wrapped,
    enabled: state.enabled,
    config: state.config,
    stats: state.stats,
    lastMessageAt: state.lastMessageAt,
    lastEmittedAt: state.lastEmittedAt,
    lastSkippedReason: state.lastSkippedReason,
    lastError: state.lastError,
    lastEventId: state.lastEventId,
    lastUserLogin: state.lastUserLogin,
    lastMessagePreview: state.lastMessagePreview,
    routes: [
      { method: 'GET', path: '/api/twitch/chat-bus/status', description: 'Status der Twitch-Chat-Bus-Bruecke.' }
    ],
    busContract: {
      channel: 'twitch.chat',
      action: 'message',
      replayable: false,
      requireAck: false,
      ttlMs: 0,
      priority: state.config.meta.priority,
      onlyWhenSubscribed: state.config.onlyWhenSubscribed
    }
  };
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
module.exports.getStatus = statusPayload;
module.exports.emitChatMessage = emitChatMessage;

module.exports.init = function init(ctx = {}) {
  const { app, env } = ctx;
  state.initialized = true;
  loadConfigFromEnv(env || process.env);

  const wrapResult = wrapCommandChatHandler();
  if (!wrapResult.ok) {
    state.lastError = wrapResult.error || 'wrap_failed';
    console.warn(`[${MODULE_NAME}] wrap failed: ${state.lastError}`);
  }

  if (app) {
    routes.registerGet(app, ['/api/twitch/chat-bus/status', '/api/twitch/presence/chat-bus/status'], (_req, res) => {
      res.json(statusPayload());
    });
  }

  console.log(`[${MODULE_NAME}] ${MODULE_VERSION} ${MODULE_BUILD} initialized wrapped=${state.wrapped} enabled=${state.enabled} onlyWhenSubscribed=${state.config.onlyWhenSubscribed}`);
};
