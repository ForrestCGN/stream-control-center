'use strict';

/**
 * BUS-TWITCH.6 – Guarded EventSub Chat Enable
 *
 * Central Twitch event contract, normalization and Communication-Bus publisher.
 *
 * Current step:
 * - keeps the central module active
 * - keeps ACK/replay prepared but disabled by default
 * - accepts parallel IRC chat events from twitch_presence
 * - prepares future EventSub ownership in twitch_events without taking over yet
 * - documents channel.chat.message readiness and required authorization
 * - keeps live readiness checks for token scopes and channel/bot IDs
 * - adds guarded EventSub channel.chat.message activation
 * - enables duplicate-protection for IRC/EventSub parallel mode
 * - keeps existing twitch.js EventSub flows active
 *
 * This module does not replace the existing command direct hook yet.
 */

const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const communicationBus = require('./communication_bus');
const axios = require('axios');
const WebSocket = require('ws');

const MODULE_NAME = 'twitch_events';
const MODULE_VERSION = '0.1.5';
const MODULE_BUILD = 'BUS_TWITCH_6_EVENTSUB_CHAT_ENABLE';
const MODULE_ID = `module:${MODULE_NAME}`;
const MODULE_STARTED_AT = nowIso();

const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'integration',
  description: 'Zentrale Twitch-Event-Schicht: normalisiert Twitch-Ereignisse und stellt sie ueber den Communication Bus abonnierbar bereit.',
  routesPrefix: ['/api/twitch/events', '/twitch/events'],
  bus: {
    registered: true,
    heartbeat: true,
    emits: [
      'module.lifecycle.registered',
      'module.status.updated',
      'twitch.chat.message',
      'twitch.notice.received',
      'twitch.usernotice.received',
      'twitch.eventsub.connected',
      'twitch.eventsub.disconnected',
      'twitch.eventsub.reconnecting',
      'twitch.eventsub.reconnected',
      'twitch.eventsub.notification.received',
      'twitch.eventsub.subscription.created',
      'twitch.eventsub.subscription.failed',
      'twitch.eventsub.subscription.removed',
      'twitch.eventsub.session.keepalive',
      'twitch.eventsub.session.reconnect',
      'twitch.stream.online',
      'twitch.stream.offline',
      'twitch.stream.updated',
      'twitch.channel.updated',
      'twitch.follow.received',
      'twitch.sub.received',
      'twitch.resub.received',
      'twitch.subgift.received',
      'twitch.giftbomb.received',
      'twitch.cheer.received',
      'twitch.raid.received',
      'twitch.channelpoints.redemption.created',
      'twitch.channelpoints.redemption.fulfill.requested',
      'twitch.channelpoints.redemption.cancel.requested',
      'twitch.channelpoints.redemption.fulfilled',
      'twitch.channelpoints.redemption.canceled',
      'twitch.channelpoints.redemption.failed',
      'twitch.vip.added',
      'twitch.vip.removed',
      'twitch.hypetrain.started',
      'twitch.hypetrain.progress',
      'twitch.hypetrain.ended',
      'twitch.shoutout.created',
      'twitch.shoutout.received'
    ],
    listens: []
  },
  legacy: false
};

const DEFAULT_POLICY = {
  ackSupported: true,
  defaultRequireAck: false,
  replaySupported: true,
  defaultReplayable: false,
  defaultTtlMs: 0,
  queued: false,
  priority: 'P2',
  payload: 'minimal'
};

const HIGH_FREQUENCY_POLICY = {
  ...DEFAULT_POLICY,
  priority: 'P2',
  payload: 'minimal',
  defaultTtlMs: 0
};

const IMPORTANT_POLICY = {
  ...DEFAULT_POLICY,
  priority: 'P1',
  payload: 'normalized',
  defaultTtlMs: 0
};

const RUNTIME_POLICY = {
  ...DEFAULT_POLICY,
  priority: 'P3',
  payload: 'minimal',
  defaultTtlMs: 0
};

const CRITICAL_POLICY = {
  ...DEFAULT_POLICY,
  priority: 'P0',
  payload: 'normalized',
  defaultTtlMs: 0
};

const EVENT_CATALOG = [
  eventDef('twitch.chat.message', 'twitch.chat', 'message', 'chat', 'Normale Twitch-Chatnachricht aus IRC/EventSub.', HIGH_FREQUENCY_POLICY),
  eventDef('twitch.notice.received', 'twitch.notice', 'received', 'chat', 'Twitch NOTICE aus IRC.', HIGH_FREQUENCY_POLICY),
  eventDef('twitch.usernotice.received', 'twitch.usernotice', 'received', 'chat', 'Twitch USERNOTICE aus IRC.', HIGH_FREQUENCY_POLICY),

  eventDef('twitch.eventsub.connected', 'twitch.eventsub', 'connected', 'eventsub', 'EventSub-Verbindung ist verbunden.', RUNTIME_POLICY),
  eventDef('twitch.eventsub.disconnected', 'twitch.eventsub', 'disconnected', 'eventsub', 'EventSub-Verbindung wurde getrennt.', IMPORTANT_POLICY),
  eventDef('twitch.eventsub.reconnecting', 'twitch.eventsub', 'reconnecting', 'eventsub', 'EventSub-Reconnect startet.', RUNTIME_POLICY),
  eventDef('twitch.eventsub.reconnected', 'twitch.eventsub', 'reconnected', 'eventsub', 'EventSub-Reconnect erfolgreich.', RUNTIME_POLICY),
  eventDef('twitch.eventsub.notification.received', 'twitch.eventsub.notification', 'received', 'eventsub', 'Rohe EventSub-Notification wurde angenommen und normalisiert.', RUNTIME_POLICY),
  eventDef('twitch.eventsub.subscription.created', 'twitch.eventsub.subscription', 'created', 'eventsub', 'EventSub-Subscription wurde erstellt.', RUNTIME_POLICY),
  eventDef('twitch.eventsub.subscription.failed', 'twitch.eventsub.subscription', 'failed', 'eventsub', 'EventSub-Subscription ist fehlgeschlagen.', CRITICAL_POLICY),
  eventDef('twitch.eventsub.subscription.removed', 'twitch.eventsub.subscription', 'removed', 'eventsub', 'EventSub-Subscription wurde entfernt.', IMPORTANT_POLICY),

  eventDef('twitch.stream.online', 'twitch.stream', 'online', 'stream', 'Stream ist online.', IMPORTANT_POLICY),
  eventDef('twitch.stream.offline', 'twitch.stream', 'offline', 'stream', 'Stream ist offline.', IMPORTANT_POLICY),
  eventDef('twitch.stream.updated', 'twitch.stream', 'updated', 'stream', 'Streamdaten wurden aktualisiert.', RUNTIME_POLICY),
  eventDef('twitch.channel.updated', 'twitch.channel', 'updated', 'stream', 'Channel-Titel/Kategorie wurden aktualisiert.', RUNTIME_POLICY),

  eventDef('twitch.follow.received', 'twitch.follow', 'received', 'support', 'Neuer Follow wurde empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.sub.received', 'twitch.sub', 'received', 'support', 'Neuer Sub wurde empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.resub.received', 'twitch.resub', 'received', 'support', 'Resub wurde empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.subgift.received', 'twitch.subgift', 'received', 'support', 'Einzelner Gift-Sub wurde empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.giftbomb.received', 'twitch.giftbomb', 'received', 'support', 'Gift-Bomb/Mystery-Gift wurde empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.cheer.received', 'twitch.cheer', 'received', 'support', 'Cheer/Bits wurden empfangen.', IMPORTANT_POLICY),
  eventDef('twitch.raid.received', 'twitch.raid', 'received', 'support', 'Raid wurde empfangen.', IMPORTANT_POLICY),

  eventDef('twitch.channelpoints.redemption.created', 'twitch.channelpoints.redemption', 'created', 'channelpoints', 'Channel-Point-Redemption wurde erstellt.', IMPORTANT_POLICY),
  eventDef('twitch.channelpoints.redemption.fulfill.requested', 'twitch.channelpoints.redemption', 'fulfill.requested', 'channelpoints', 'Fachmodul fordert Fulfill einer Redemption an.', IMPORTANT_POLICY),
  eventDef('twitch.channelpoints.redemption.cancel.requested', 'twitch.channelpoints.redemption', 'cancel.requested', 'channelpoints', 'Fachmodul fordert Cancel/Refund einer Redemption an.', IMPORTANT_POLICY),
  eventDef('twitch.channelpoints.redemption.fulfilled', 'twitch.channelpoints.redemption', 'fulfilled', 'channelpoints', 'Redemption wurde bei Twitch fulfilled.', IMPORTANT_POLICY),
  eventDef('twitch.channelpoints.redemption.canceled', 'twitch.channelpoints.redemption', 'canceled', 'channelpoints', 'Redemption wurde bei Twitch gecanceled/erstattet.', IMPORTANT_POLICY),
  eventDef('twitch.channelpoints.redemption.failed', 'twitch.channelpoints.redemption', 'failed', 'channelpoints', 'Redemption-Fulfill/Cancel ist fehlgeschlagen.', CRITICAL_POLICY),

  eventDef('twitch.vip.added', 'twitch.vip', 'added', 'vip', 'VIP wurde hinzugefuegt.', IMPORTANT_POLICY),
  eventDef('twitch.vip.removed', 'twitch.vip', 'removed', 'vip', 'VIP wurde entfernt.', IMPORTANT_POLICY),

  eventDef('twitch.hypetrain.started', 'twitch.hypetrain', 'started', 'hypetrain', 'Hype-Train hat begonnen.', IMPORTANT_POLICY),
  eventDef('twitch.hypetrain.progress', 'twitch.hypetrain', 'progress', 'hypetrain', 'Hype-Train Fortschritt.', RUNTIME_POLICY),
  eventDef('twitch.hypetrain.ended', 'twitch.hypetrain', 'ended', 'hypetrain', 'Hype-Train wurde beendet.', IMPORTANT_POLICY),

  eventDef('twitch.shoutout.created', 'twitch.shoutout', 'created', 'shoutout', 'Twitch-Shoutout wurde erstellt.', IMPORTANT_POLICY),
  eventDef('twitch.shoutout.received', 'twitch.shoutout', 'received', 'shoutout', 'Twitch-Shoutout wurde empfangen.', IMPORTANT_POLICY)
];

const EVENT_MAP = new Map(EVENT_CATALOG.map(item => [item.event, item]));
const EVENTSUB_TYPE_MAP = {
  'channel.chat.message': 'twitch.chat.message',
  'stream.online': 'twitch.stream.online',
  'stream.offline': 'twitch.stream.offline',
  'channel.update': 'twitch.channel.updated',
  'channel.follow': 'twitch.follow.received',
  'channel.subscribe': 'twitch.sub.received',
  'channel.subscription.message': 'twitch.resub.received',
  'channel.subscription.gift': 'twitch.subgift.received',
  'channel.cheer': 'twitch.cheer.received',
  'channel.raid': 'twitch.raid.received',
  'channel.channel_points_custom_reward_redemption.add': 'twitch.channelpoints.redemption.created',
  'channel.vip.add': 'twitch.vip.added',
  'channel.vip.remove': 'twitch.vip.removed',
  'channel.hype_train.begin': 'twitch.hypetrain.started',
  'channel.hype_train.progress': 'twitch.hypetrain.progress',
  'channel.hype_train.end': 'twitch.hypetrain.ended',
  'channel.shoutout.create': 'twitch.shoutout.created',
  'channel.shoutout.receive': 'twitch.shoutout.received'
};

const DEFAULT_TARGET = {
  type: 'id',
  id: 'internal:twitch_events',
  module: '',
  capability: ''
};


const EVENTSUB_CHAT_READINESS = {
  schemaVersion: 1,
  step: 'BUS-TWITCH.6',
  status: 'guarded-enable-ready',
  active: false,
  subscriptionCreationEnabled: false,
  websocketOwnershipEnabled: true,
  currentLiveChatSource: 'twitch_presence/irc parallel bridge',
  targetLiveChatSource: 'twitch_events EventSub channel.chat.message',
  subscription: {
    type: 'channel.chat.message',
    version: '1',
    eventKey: 'twitch.chat.message',
    transport: 'websocket',
    conditionShape: {
      broadcaster_user_id: '<broadcaster/channel user id>',
      user_id: '<chatting user/bot id>'
    }
  },
  authorization: {
    userAccessToken: {
      requiredScopes: ['user:read:chat'],
      note: 'Scope muss vom chatting user kommen. Fuer uns ist das sinnvollerweise der Bot/Heimleitung-User.'
    },
    appAccessToken: {
      additionalRequiredScopes: ['user:bot'],
      broadcasterRequirement: 'channel:bot scope from broadcaster or bot/moderator status in the channel',
      note: 'App-Token-Variante ist erst spaeter sinnvoll, wenn Bot-/Broadcaster-Scopes sauber vorhanden und dokumentiert sind.'
    },
    currentTwitchJsDefaultScopes: {
      mainUserDefaultScopesIncludeUserReadChat: false,
      botDefaultScopesIncludeUserReadChat: false,
      botDefaultScopes: ['chat:read', 'chat:edit'],
      conclusion: 'Live-.env kann mehr enthalten, aber die Code-Defaults reichen fuer channel.chat.message nicht aus.'
    }
  },
  readinessChecks: [
    { id: 'broadcaster_user_id', label: 'Broadcaster/Channel User-ID verfuegbar', required: true, status: 'must_verify_live' },
    { id: 'chat_user_id', label: 'Chatting Bot/User-ID verfuegbar', required: true, status: 'must_verify_live' },
    { id: 'user_read_chat_scope', label: 'user:read:chat Scope vorhanden', required: true, status: 'must_verify_live' },
    { id: 'eventsub_ws_owner', label: 'twitch_events darf EventSub WebSocket oeffnen', required: true, status: 'planned_disabled' },
    { id: 'subscription_create_guard', label: 'Subscription-Erstellung per Config/Go geschuetzt', required: true, status: 'prepared' },
    { id: 'duplicate_protection', label: 'Duplikat-Schutz IRC + EventSub', required: true, status: 'active_when_eventsub_chat_running' },
    { id: 'commands_direct_hook_kept', label: 'Command-Direktaufruf bleibt aktiv', required: true, status: 'kept' },
    { id: 'old_flows_kept', label: 'twitch.js EventSub-Flows bleiben aktiv', required: true, status: 'kept' }
  ],
  duplicateProtection: {
    prepared: true,
    active: false,
    cacheTtlMs: 30000,
    primaryKey: 'eventsub.message_id or irc.tags.id',
    fallbackKey: 'source + channel + userId/login + message + 2s time bucket',
    reason: 'IRC und EventSub koennen im Migrationsbetrieb parallel dieselbe Chatnachricht liefern.'
  },
  activationRule: 'Nicht automatisch aktivieren. Erst Live-Scopes/IDs pruefen, dann explizites Go fuer BUS-TWITCH.6.',
  noChangeGuarantee: {
    twitchJsChanged: false,
    twitchPresenceChanged: false,
    commandsChanged: false,
    existingFlowsChanged: false,
    databaseChanged: false
  }
};

const EVENTSUB_OWNERSHIP = {
  schemaVersion: 2,
  mode: 'prepared-disabled',
  currentOwner: 'twitch.js',
  desiredOwner: 'twitch_events',
  activeOwner: 'twitch.js',
  takeoverEnabled: false,
  websocketEnabled: false,
  subscriptionCreationEnabled: false,
  notificationForwardingRequired: false,
  existingTwitchJsEventSubKept: true,
  existingFlowsChanged: false,
  duplicateProtectionPrepared: true,
  duplicateProtectionEnabled: false,
  chatReadiness: EVENTSUB_CHAT_READINESS,
  note: 'BUS-TWITCH.6 aktiviert EventSub channel.chat.message kontrolliert per Start/Stop-Route. twitch.js bleibt fuer bestehende EventSub-Flows aktiv.',
  migrationModes: ['disabled', 'prepared-disabled', 'mirror-readonly', 'chat-owner', 'owner'],
  currentTwitchJsSubscriptions: [
    'stream.online',
    'stream.offline',
    'channel.update',
    'channel.hype_train.begin',
    'channel.hype_train.progress',
    'channel.hype_train.end',
    'channel.channel_points_custom_reward_redemption.add',
    'channel.vip.add',
    'channel.vip.remove',
    'channel.follow',
    'channel.subscribe',
    'channel.subscription.gift',
    'channel.subscription.message',
    'channel.cheer',
    'channel.raid',
    'channel.shoutout.create',
    'channel.shoutout.receive'
  ],
  plannedSubscriptions: [
    {
      type: 'channel.chat.message',
      version: '1',
      eventKey: 'twitch.chat.message',
      source: 'eventsub',
      enabled: false,
      status: 'guarded-enable-ready',
      conditionShape: EVENTSUB_CHAT_READINESS.subscription.conditionShape,
      requiredScopes: EVENTSUB_CHAT_READINESS.authorization.userAccessToken.requiredScopes,
      appTokenAdditionalScopes: EVENTSUB_CHAT_READINESS.authorization.appAccessToken.additionalRequiredScopes,
      transport: 'websocket',
      replayable: false,
      requireAck: false,
      ttlMs: 0,
      payload: 'minimal',
      migrationNote: 'Darf erst aktiviert werden, wenn Token/Scopes, Subscription-Erstellung und Duplikat-Schutz separat getestet sind.'
    }
  ],
  cutoverRule: 'Bestehende EventSub-/IRC-/Command-Flows werden erst entfernt, wenn der jeweilige Subscriber ueber twitch_events erfolgreich getestet und dokumentiert ist.'
};

const state = {
  initialized: false,
  enabled: true,
  loadedAt: MODULE_STARTED_AT,
  updatedAt: MODULE_STARTED_AT,
  lastHeartbeatAt: '',
  heartbeatCount: 0,
  heartbeatTimer: null,
  statusTimer: null,
  routeCount: 0,
  env: {},
  registeredOnBus: false,
  busAvailable: false,
  lastError: '',
  lastWarning: '',
  lastEvent: null,
  counts: {
    received: 0,
    emitted: 0,
    skipped: 0,
    errors: 0,
    byEvent: {},
    byCategory: {},
    bySource: {}
  },
  eventSubChat: {
    enabled: false,
    active: false,
    connecting: false,
    duplicateProtectionEnabled: true,
    websocketUrl: 'wss://eventsub.wss.twitch.tv/ws',
    readyState: 'idle',
    sessionId: '',
    subscriptionId: '',
    subscriptionStatus: '',
    broadcasterUserId: '',
    chatUserId: '',
    startedAt: '',
    stoppedAt: '',
    lastOpenAt: '',
    lastWelcomeAt: '',
    lastKeepaliveAt: '',
    lastReconnectAt: '',
    lastNotificationAt: '',
    lastNotificationMessageId: '',
    lastSubscribeAt: '',
    lastSubscribeError: '',
    lastError: '',
    lastErrorAt: '',
    counters: {
      startAttempts: 0,
      startBlocked: 0,
      subscriptionsCreated: 0,
      subscriptionSkippedExisting: 0,
      subscriptionFailed: 0,
      notifications: 0,
      chatMessagesEmitted: 0,
      duplicateSkipped: 0,
      websocketErrors: 0,
      reconnects: 0
    }
  }
};

let bus = null;
let twitchCore = null;
let eventSubChatWs = null;
let eventSubChatReconnectTimer = null;
const chatDedupeCache = new Map();

function getTwitchCore() {
  if (twitchCore) return twitchCore;
  try {
    twitchCore = require('./twitch');
    return twitchCore;
  } catch (_) {
    return null;
  }
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
module.exports.getStatus = getStatus;
module.exports.getCatalog = getCatalog;
module.exports.getEventSubOwnership = getEventSubOwnership;
module.exports.getEventSubChatReadiness = getEventSubChatReadiness;
module.exports.getEventSubChatLiveReadiness = getEventSubChatLiveReadiness;
module.exports.getEventSubChatStatus = getEventSubChatStatus;
module.exports.startEventSubChat = startEventSubChat;
module.exports.stopEventSubChat = stopEventSubChat;
module.exports.publishTwitchEvent = publishTwitchEvent;
module.exports.handleIrcEvent = handleIrcEvent;
module.exports.handleEventSubNotification = handleEventSubNotification;
module.exports.handleEventSubLifecycle = handleEventSubLifecycle;
module.exports.handleRedemptionLifecycleEvent = handleRedemptionLifecycleEvent;

module.exports.init = function init(ctx = {}) {
  const app = ctx.app;
  state.env = ctx.env || process.env || {};
  state.initialized = true;
  state.updatedAt = nowIso();

  try {
    bus = communicationBus.getBus();
    state.busAvailable = !!bus;
    if (bus && typeof bus.registerModule === 'function') {
      const result = bus.registerModule({
        id: MODULE_ID,
        module: MODULE_NAME,
        name: 'Twitch Events',
        version: MODULE_VERSION,
        capabilities: MODULE_META.bus.emits,
        meta: {
          build: MODULE_BUILD,
          role: 'twitch-event-center',
          migrationMode: 'eventsub-chat-guarded-enable',
          ackDefaultEnabled: false,
          replayDefaultEnabled: false
        }
      });
      state.registeredOnBus = result && result.ok === true;
    }
    sendHeartbeat();
    publishStatus('init');
    startTimers();
  } catch (err) {
    setError(err, 'bus_init_failed');
  }

  if (app) {
    const registered = [];
    registered.push(...routes.registerGet(app, ['/api/twitch/events/status', '/twitch/events/status'], (req, res) => {
      res.json(getStatus());
    }));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/catalog', '/twitch/events/catalog'], (req, res) => {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        count: EVENT_CATALOG.length,
        events: getCatalog()
      });
    }));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/ownership', '/twitch/events/eventsub/ownership'], (req, res) => {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        ownership: getEventSubOwnership()
      });
    }));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat-readiness', '/twitch/events/eventsub/chat-readiness'], (req, res) => {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        readiness: getEventSubChatReadiness()
      });
    }));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/live-readiness', '/twitch/events/eventsub/live-readiness'], async (req, res) => {
      try {
        const liveReadiness = await getEventSubChatLiveReadiness({
          validateUserToken: String((req && req.query && req.query.validateUserToken) ?? '1') !== '0',
          resolveLogins: String((req && req.query && req.query.resolveLogins) ?? '1') !== '0'
        });
        res.json({
          ok: true,
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          moduleBuild: MODULE_BUILD,
          liveReadiness
        });
      } catch (err) {
        setError(err, 'eventsub_live_readiness_failed');
        res.status(500).json({
          ok: false,
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          moduleBuild: MODULE_BUILD,
          error: state.lastError
        });
      }
    }));

    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/status', '/twitch/events/eventsub/chat/status'], (req, res) => {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        moduleBuild: MODULE_BUILD,
        eventSubChat: getEventSubChatStatus()
      });
    }));

    const startChatRoute = async (req, res) => {
      try {
        const result = await startEventSubChat({ reason: firstValue(req.query && req.query.reason, req.body && req.body.reason, 'manual_route') });
        res.status(result.ok ? 200 : 409).json({ ok: result.ok === true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result, eventSubChat: getEventSubChatStatus() });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err), eventSubChat: getEventSubChatStatus() });
      }
    };

    const stopChatRoute = (req, res) => {
      const result = stopEventSubChat({ reason: firstValue(req.query && req.query.reason, req.body && req.body.reason, 'manual_route') });
      res.status(result.ok ? 200 : 409).json({ ok: result.ok === true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result, eventSubChat: getEventSubChatStatus() });
    };

    registered.push(...routes.registerPost(app, ['/api/twitch/events/eventsub/chat/start', '/twitch/events/eventsub/chat/start'], startChatRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/start', '/twitch/events/eventsub/chat/start'], startChatRoute));
    registered.push(...routes.registerPost(app, ['/api/twitch/events/eventsub/chat/stop', '/twitch/events/eventsub/chat/stop'], stopChatRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/stop', '/twitch/events/eventsub/chat/stop'], stopChatRoute));

    state.routeCount = registered.length;
  }

  if (boolEnv('TWITCH_EVENTS_EVENTSUB_CHAT_AUTOSTART', false)) {
    startEventSubChat({ reason: 'env_autostart' }).catch(err => setEventSubChatError(err, 'autostart_failed'));
  }

  return getStatus();
};



function boolEnv(name, fallback = false) {
  const env = state.env || process.env || {};
  const value = env[name];
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function eventSubChatClientId() {
  return cleanString((state.env || process.env || {}).TWITCH_CLIENT_ID || '');
}

function getEventSubChatStatus() {
  const readyState = eventSubChatWs && typeof eventSubChatWs.readyState === 'number'
    ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][eventSubChatWs.readyState] || String(eventSubChatWs.readyState)
    : state.eventSubChat.readyState;
  return {
    schemaVersion: 1,
    step: 'BUS-TWITCH.6',
    mode: 'guarded-runtime-simple',
    enabled: state.eventSubChat.enabled === true,
    active: state.eventSubChat.active === true,
    connecting: state.eventSubChat.connecting === true,
    duplicateProtectionEnabled: state.eventSubChat.duplicateProtectionEnabled === true,
    currentLiveChatSource: state.eventSubChat.active ? 'twitch_events EventSub channel.chat.message + twitch_presence/irc parallel' : 'twitch_presence/irc parallel bridge',
    targetLiveChatSource: 'twitch_events EventSub channel.chat.message',
    routes: {
      start: '/api/twitch/events/eventsub/chat/start',
      stop: '/api/twitch/events/eventsub/chat/stop',
      status: '/api/twitch/events/eventsub/chat/status'
    },
    websocket: {
      url: state.eventSubChat.websocketUrl,
      readyState,
      sessionId: state.eventSubChat.sessionId,
      lastOpenAt: state.eventSubChat.lastOpenAt,
      lastWelcomeAt: state.eventSubChat.lastWelcomeAt,
      lastKeepaliveAt: state.eventSubChat.lastKeepaliveAt,
      lastReconnectAt: state.eventSubChat.lastReconnectAt
    },
    subscription: {
      type: 'channel.chat.message',
      version: '1',
      id: state.eventSubChat.subscriptionId,
      status: state.eventSubChat.subscriptionStatus,
      broadcasterUserId: state.eventSubChat.broadcasterUserId,
      userId: state.eventSubChat.chatUserId,
      lastSubscribeAt: state.eventSubChat.lastSubscribeAt,
      lastSubscribeError: state.eventSubChat.lastSubscribeError
    },
    counters: safeJson(state.eventSubChat.counters, {}),
    lastNotificationAt: state.eventSubChat.lastNotificationAt,
    lastNotificationMessageId: state.eventSubChat.lastNotificationMessageId,
    lastError: state.eventSubChat.lastError,
    lastErrorAt: state.eventSubChat.lastErrorAt,
    existingTwitchJsEventSubKept: true,
    existingPresenceBridgeKept: true,
    commandDirectHookKept: true
  };
}

function setEventSubChatError(err, prefix = 'eventsub_chat_error') {
  const msg = err && err.response ? `${err.response.status || ''} ${JSON.stringify(err.response.data || err.message)}`.trim() : (err && err.message ? err.message : String(err || prefix));
  state.eventSubChat.lastError = `[${prefix}] ${msg}`.slice(0, 700);
  state.eventSubChat.lastErrorAt = nowIso();
  state.updatedAt = nowIso();
  return state.eventSubChat.lastError;
}

async function getEventSubUserToken() {
  const twitch = getTwitchCore();
  if (!twitch || typeof twitch.getUserAccessTokenWithRefresh !== 'function') {
    throw new Error('twitch_user_access_token_helper_unavailable');
  }
  const token = await twitch.getUserAccessTokenWithRefresh();
  if (!token) throw new Error('twitch_user_access_token_missing');
  return token;
}

function eventSubHeaders(token) {
  const clientId = eventSubChatClientId();
  if (!clientId) throw new Error('TWITCH_CLIENT_ID_missing');
  return { 'Client-Id': clientId, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function createEventSubChatSubscription(sessionId, broadcasterUserId, chatUserId) {
  const token = await getEventSubUserToken();
  const body = {
    type: 'channel.chat.message',
    version: '1',
    condition: {
      broadcaster_user_id: String(broadcasterUserId || ''),
      user_id: String(chatUserId || '')
    },
    transport: { method: 'websocket', session_id: String(sessionId || '') }
  };
  const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', body, { headers: eventSubHeaders(token) });
  const row = Array.isArray(response.data && response.data.data) ? response.data.data[0] : null;
  state.eventSubChat.subscriptionId = cleanString(row && row.id || '');
  state.eventSubChat.subscriptionStatus = cleanString(row && row.status || 'enabled');
  state.eventSubChat.lastSubscribeAt = nowIso();
  state.eventSubChat.lastSubscribeError = '';
  state.eventSubChat.counters.subscriptionsCreated += 1;
  handleEventSubLifecycle('subscription_created', {
    source: 'twitch_events_eventsub_chat',
    type: 'channel.chat.message',
    version: '1',
    subscriptionId: state.eventSubChat.subscriptionId,
    status: state.eventSubChat.subscriptionStatus
  }, { source: 'twitch_events' });
  return { ok: true, subscriptionId: state.eventSubChat.subscriptionId, status: state.eventSubChat.subscriptionStatus };
}

function closeEventSubChatSocket(reason = 'close') {
  if (eventSubChatReconnectTimer) {
    clearTimeout(eventSubChatReconnectTimer);
    eventSubChatReconnectTimer = null;
  }
  if (eventSubChatWs) {
    try { eventSubChatWs.close(1000, String(reason).slice(0, 120)); } catch (_) {}
    eventSubChatWs = null;
  }
  state.eventSubChat.connecting = false;
  state.eventSubChat.active = false;
  state.eventSubChat.readyState = 'stopped';
  state.eventSubChat.stoppedAt = nowIso();
}

async function startEventSubChat(options = {}) {
  state.eventSubChat.counters.startAttempts += 1;
  if (state.eventSubChat.active || state.eventSubChat.connecting) {
    return { ok: true, reason: 'already_running_or_connecting', eventSubChat: getEventSubChatStatus() };
  }
  const live = await getEventSubChatLiveReadiness({ validateUserToken: true, resolveLogins: true });
  const blockers = live && live.conclusion && Array.isArray(live.conclusion.blockers) ? live.conclusion.blockers.filter(item => item !== 'eventsub_ws_owner') : [];
  if (blockers.length > 0 || !live.conclusion || live.conclusion.readyForGuardedSubscription !== true) {
    state.eventSubChat.counters.startBlocked += 1;
    return { ok: false, reason: 'live_readiness_blocked', blockers, liveReadiness: live };
  }
  const broadcaster = live.checks.find(check => check.id === 'broadcaster_user_id');
  const chatUser = live.checks.find(check => check.id === 'chat_user_id');
  state.eventSubChat.broadcasterUserId = cleanString(broadcaster && broadcaster.value || '');
  state.eventSubChat.chatUserId = cleanString(chatUser && chatUser.value || '');
  if (!state.eventSubChat.broadcasterUserId || !state.eventSubChat.chatUserId) {
    state.eventSubChat.counters.startBlocked += 1;
    return { ok: false, reason: 'missing_broadcaster_or_chat_user_id' };
  }
  state.eventSubChat.enabled = true;
  state.eventSubChat.connecting = true;
  state.eventSubChat.readyState = 'connecting';
  state.eventSubChat.startedAt = nowIso();
  state.eventSubChat.lastError = '';
  connectEventSubChatWebSocket(state.eventSubChat.websocketUrl);
  return { ok: true, reason: 'eventsub_chat_connecting', eventSubChat: getEventSubChatStatus() };
}

function stopEventSubChat(options = {}) {
  state.eventSubChat.enabled = false;
  closeEventSubChatSocket(options.reason || 'manual_stop');
  return { ok: true, reason: 'eventsub_chat_stopped', eventSubChat: getEventSubChatStatus() };
}

function scheduleEventSubChatReconnect(reason = 'reconnect') {
  if (eventSubChatReconnectTimer || state.eventSubChat.enabled !== true) return;
  state.eventSubChat.counters.reconnects += 1;
  eventSubChatReconnectTimer = setTimeout(() => {
    eventSubChatReconnectTimer = null;
    if (state.eventSubChat.enabled === true) connectEventSubChatWebSocket(state.eventSubChat.websocketUrl);
  }, 5000);
  if (typeof eventSubChatReconnectTimer.unref === 'function') eventSubChatReconnectTimer.unref();
  state.eventSubChat.lastReconnectAt = nowIso();
  state.eventSubChat.readyState = `reconnect_scheduled:${reason}`.slice(0, 120);
}

function connectEventSubChatWebSocket(url) {
  if (!url) url = state.eventSubChat.websocketUrl;
  if (eventSubChatWs && (eventSubChatWs.readyState === WebSocket.OPEN || eventSubChatWs.readyState === WebSocket.CONNECTING)) return;
  state.eventSubChat.connecting = true;
  state.eventSubChat.readyState = 'connecting';
  const socket = new WebSocket(url);
  eventSubChatWs = socket;

  socket.on('open', () => {
    state.eventSubChat.lastOpenAt = nowIso();
    state.eventSubChat.readyState = 'open';
  });

  socket.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString('utf8')); } catch (_) { return; }
    const meta = msg.metadata || {};
    const payload = msg.payload || {};
    const messageType = cleanString(meta.message_type || '');

    if (messageType === 'session_welcome') {
      const sessionId = cleanString(payload.session && payload.session.id || '');
      state.eventSubChat.sessionId = sessionId;
      state.eventSubChat.lastWelcomeAt = nowIso();
      state.eventSubChat.connecting = false;
      state.eventSubChat.active = true;
      state.eventSubChat.readyState = 'session_welcome';
      handleEventSubLifecycle('connected', { source: 'twitch_events_eventsub_chat', sessionId }, { source: 'twitch_events' });
      try {
        await createEventSubChatSubscription(sessionId, state.eventSubChat.broadcasterUserId, state.eventSubChat.chatUserId);
      } catch (err) {
        state.eventSubChat.counters.subscriptionFailed += 1;
        state.eventSubChat.lastSubscribeAt = nowIso();
        state.eventSubChat.lastSubscribeError = setEventSubChatError(err, 'subscription_create_failed');
        handleEventSubLifecycle('subscription_failed', { source: 'twitch_events_eventsub_chat', type: 'channel.chat.message', error: state.eventSubChat.lastSubscribeError }, { source: 'twitch_events' });
      }
      return;
    }

    if (messageType === 'session_keepalive') {
      state.eventSubChat.lastKeepaliveAt = nowIso();
      state.eventSubChat.readyState = 'keepalive';
      return;
    }

    if (messageType === 'session_reconnect') {
      const reconnectUrl = cleanString(payload.session && payload.session.reconnect_url || '');
      state.eventSubChat.lastReconnectAt = nowIso();
      if (reconnectUrl) {
        try { socket.close(1000, 'twitch_reconnect'); } catch (_) {}
        if (eventSubChatWs === socket) eventSubChatWs = null;
        connectEventSubChatWebSocket(reconnectUrl);
      } else {
        scheduleEventSubChatReconnect('missing_reconnect_url');
      }
      return;
    }

    if (messageType === 'notification') {
      const sub = payload.subscription || {};
      if (sub.type !== 'channel.chat.message') return;
      state.eventSubChat.counters.notifications += 1;
      state.eventSubChat.lastNotificationAt = nowIso();
      state.eventSubChat.lastNotificationMessageId = cleanString(payload.event && payload.event.message_id || meta.message_id || '');
      const result = handleEventSubNotification({ metadata: meta, payload }, { source: 'twitch_events_eventsub_chat' }, { target: DEFAULT_TARGET });
      if (result && result.ok === true) state.eventSubChat.counters.chatMessagesEmitted += 1;
      return;
    }

    if (messageType === 'revocation') {
      handleEventSubLifecycle('subscription_removed', { source: 'twitch_events_eventsub_chat', subscription: payload.subscription || {} }, { source: 'twitch_events' });
    }
  });

  socket.on('close', (code, reasonBuffer) => {
    const reason = reasonBuffer ? reasonBuffer.toString() : '';
    if (eventSubChatWs === socket) eventSubChatWs = null;
    state.eventSubChat.active = false;
    state.eventSubChat.connecting = false;
    state.eventSubChat.readyState = `closed:${code}`;
    handleEventSubLifecycle('disconnected', { source: 'twitch_events_eventsub_chat', code, reason }, { source: 'twitch_events' });
    if (state.eventSubChat.enabled === true && code !== 1000) scheduleEventSubChatReconnect(`close_${code}`);
  });

  socket.on('error', (err) => {
    state.eventSubChat.counters.websocketErrors += 1;
    setEventSubChatError(err, 'websocket_error');
  });
}

function pruneChatDedupeCache(now = Date.now()) {
  for (const [key, expiresAt] of chatDedupeCache.entries()) {
    if (expiresAt <= now) chatDedupeCache.delete(key);
  }
}

function chatDedupeKey(payload = {}) {
  const twitch = payload.twitch && isPlainObject(payload.twitch) ? payload.twitch : payload;
  const messageId = cleanString(firstValue(twitch.messageId, twitch.message_id, twitch.tags && twitch.tags.id));
  if (messageId) return `message_id:${messageId}`;
  const userLogin = cleanLogin(firstValue(twitch.user && twitch.user.login, twitch.userLogin, twitch.login));
  const channel = cleanLogin(firstValue(twitch.channel, twitch.broadcaster && twitch.broadcaster.login));
  const msg = cleanString(firstValue(twitch.message, twitch.text)).slice(0, 200);
  const bucket = Math.floor(Date.now() / 5000);
  if (!userLogin || !channel || !msg) return '';
  return `fallback:${channel}:${userLogin}:${msg}:${bucket}`;
}

function markOrSkipChatDedupe(payload = {}) {
  if (state.eventSubChat.duplicateProtectionEnabled !== true) return { duplicate: false };
  const key = chatDedupeKey(payload);
  if (!key) return { duplicate: false };
  const now = Date.now();
  pruneChatDedupeCache(now);
  if (chatDedupeCache.has(key)) {
    state.eventSubChat.counters.duplicateSkipped += 1;
    return { duplicate: true, key };
  }
  chatDedupeCache.set(key, now + 30000);
  return { duplicate: false, key };
}

function getEventSubOwnership() {
  return safeJson(EVENTSUB_OWNERSHIP, {});
}

function getEventSubChatReadiness() {
  return safeJson(EVENTSUB_CHAT_READINESS, {});
}


async function getEventSubChatLiveReadiness(options = {}) {
  const env = state.env || process.env || {};
  const twitch = getTwitchCore();
  const requiredScopes = ['user:read:chat'];
  const envBroadcasterId = cleanString(env.TWITCH_BROADCASTER_ID || env.TWITCH_CHANNEL_USER_ID || env.BROADCASTER_USER_ID);
  const envBotLogin = cleanLogin(env.TWITCH_BOT_USERNAME || env.TWITCH_CHAT_USER || env.TWITCH_BOT_LOGIN);
  const envChannelLogin = cleanLogin(env.TWITCH_BOT_CHANNEL || env.TWITCH_CHANNEL || env.TWITCH_BROADCASTER_LOGIN);

  const result = {
    schemaVersion: 1,
    step: 'BUS-TWITCH.6',
    status: 'live-readiness-check',
    active: false,
    subscriptionCreationEnabled: false,
    existingTwitchJsEventSubKept: true,
    currentOwner: EVENTSUB_OWNERSHIP.currentOwner,
    desiredOwner: EVENTSUB_OWNERSHIP.desiredOwner,
    targetSubscription: EVENTSUB_CHAT_READINESS.subscription,
    checks: [],
    env: {
      broadcasterIdConfigured: Boolean(envBroadcasterId),
      broadcasterId: envBroadcasterId,
      botLoginConfigured: Boolean(envBotLogin),
      botLogin: envBotLogin,
      channelLoginConfigured: Boolean(envChannelLogin),
      channelLogin: envChannelLogin
    },
    twitchCore: {
      available: !!twitch,
      hasValidateStoredUserToken: !!(twitch && typeof twitch.validateStoredUserToken === 'function'),
      hasResolveUserByLogin: !!(twitch && typeof twitch.resolveUserByLogin === 'function'),
      hasEventSubStatusSnapshot: !!(twitch && typeof twitch.getEventSubStatusSnapshot === 'function')
    },
    userToken: {
      checked: false,
      ok: false,
      present: false,
      login: '',
      userId: '',
      broadcasterId: envBroadcasterId,
      scopes: [],
      requiredScopes,
      missingScopes: requiredScopes,
      expiresIn: null,
      tokenUserMatchesBroadcaster: false,
      error: ''
    },
    resolvedIds: {
      broadcaster: { login: envChannelLogin, id: envBroadcasterId, source: envBroadcasterId ? 'env' : '', ok: Boolean(envBroadcasterId), error: '' },
      chatUser: { login: envBotLogin, id: '', source: '', ok: false, error: '' }
    },
    eventSubCurrent: {},
    conclusion: {
      readyForGuardedSubscription: false,
      blockers: [],
      warnings: []
    }
  };

  if (twitch && typeof twitch.getEventSubStatusSnapshot === 'function') {
    try {
      result.eventSubCurrent = safeJson(twitch.getEventSubStatusSnapshot(), {});
    } catch (err) {
      result.eventSubCurrent = { ok: false, error: err && err.message ? err.message : String(err) };
      result.conclusion.warnings.push('eventsub_status_snapshot_failed');
    }
  }

  if (options.validateUserToken !== false && twitch && typeof twitch.validateStoredUserToken === 'function') {
    result.userToken.checked = true;
    try {
      const validation = await twitch.validateStoredUserToken();
      const scopes = Array.isArray(validation && validation.scopes) ? validation.scopes.map(String) : [];
      const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));
      result.userToken = {
        ...result.userToken,
        ok: validation && validation.ok === true,
        present: validation && validation.present === true,
        login: cleanLogin(validation && validation.login),
        userId: cleanString(validation && validation.userId),
        broadcasterId: cleanString((validation && validation.broadcasterId) || envBroadcasterId),
        scopes,
        missingScopes,
        expiresIn: Number.isFinite(Number(validation && validation.expiresIn)) ? Number(validation.expiresIn) : null,
        tokenUserMatchesBroadcaster: validation && validation.tokenUserMatchesBroadcaster === true,
        error: cleanString(validation && validation.error)
      };
      if (!result.resolvedIds.chatUser.id && result.userToken.userId) {
        result.resolvedIds.chatUser = { login: result.userToken.login || envBotLogin, id: result.userToken.userId, source: 'validated_user_token', ok: true, error: '' };
      }
      if (!result.resolvedIds.broadcaster.id && result.userToken.broadcasterId) {
        result.resolvedIds.broadcaster = { login: envChannelLogin, id: result.userToken.broadcasterId, source: 'twitch_validate_broadcasterId', ok: true, error: '' };
      }
    } catch (err) {
      result.userToken.error = err && err.message ? err.message : String(err);
    }
  }

  if (options.resolveLogins !== false && twitch && typeof twitch.resolveUserByLogin === 'function') {
    if (!result.resolvedIds.broadcaster.id && envChannelLogin) {
      try {
        const found = await twitch.resolveUserByLogin(envChannelLogin);
        const user = Array.isArray(found && found.data) ? found.data[0] : (found && found.id ? found : null);
        const id = cleanString(firstValue(user && user.id, found && found.id));
        if (id) result.resolvedIds.broadcaster = { login: envChannelLogin, id, source: 'helix_login_lookup', ok: true, error: '' };
      } catch (err) {
        result.resolvedIds.broadcaster.error = err && err.message ? err.message : String(err);
      }
    }
    if (!result.resolvedIds.chatUser.id && envBotLogin) {
      try {
        const found = await twitch.resolveUserByLogin(envBotLogin);
        const user = Array.isArray(found && found.data) ? found.data[0] : (found && found.id ? found : null);
        const id = cleanString(firstValue(user && user.id, found && found.id));
        if (id) result.resolvedIds.chatUser = { login: envBotLogin, id, source: 'helix_login_lookup', ok: true, error: '' };
      } catch (err) {
        result.resolvedIds.chatUser.error = err && err.message ? err.message : String(err);
      }
    }
  }

  addLiveCheck(result, 'broadcaster_user_id', 'Broadcaster/Channel User-ID verfuegbar', true, !!result.resolvedIds.broadcaster.id, result.resolvedIds.broadcaster.id || '', result.resolvedIds.broadcaster.error || '');
  addLiveCheck(result, 'chat_user_id', 'Chatting Bot/User-ID verfuegbar', true, !!result.resolvedIds.chatUser.id, result.resolvedIds.chatUser.id || '', result.resolvedIds.chatUser.error || '');
  addLiveCheck(result, 'user_read_chat_scope', 'user:read:chat Scope im validierten User-Token vorhanden', true, result.userToken.missingScopes.length === 0 && result.userToken.ok === true, result.userToken.scopes.join(' '), result.userToken.error || '');
  addLiveCheck(result, 'eventsub_ws_owner', 'twitch_events EventSub WebSocket Ownership fuer Chat guarded verfuegbar', true, true, 'guarded-enabled', '');
  addLiveCheck(result, 'subscription_create_guard', 'Subscription-Erstellung bleibt per Config/Go gesperrt', true, EVENTSUB_CHAT_READINESS.subscriptionCreationEnabled === false, 'subscriptionCreationEnabled=false', '');
  addLiveCheck(result, 'duplicate_protection', 'Duplikat-Schutz vorbereitet, aber nicht aktiv', true, EVENTSUB_CHAT_READINESS.duplicateProtection.prepared === true, 'active_when_eventsub_chat_running', '');

  for (const check of result.checks) {
    if (check.required && check.status !== 'ok') result.conclusion.blockers.push(check.id);
  }
  result.conclusion.readyForGuardedSubscription = result.conclusion.blockers.length === 0;
  if (!result.conclusion.readyForGuardedSubscription) {
    result.conclusion.warnings.push('guarded_subscription_not_ready');
  }
  return result;
}

function addLiveCheck(result, id, label, required, ok, value, error) {
  result.checks.push({
    id,
    label,
    required: required === true,
    status: ok ? 'ok' : 'blocked',
    value: cleanString(value),
    error: cleanString(error)
  });
}

function eventDef(event, channel, action, category, description, policy = DEFAULT_POLICY) {
  return {
    event,
    channel,
    action,
    category,
    description,
    policy: {
      ...DEFAULT_POLICY,
      ...policy,
      defaultRequireAck: false,
      defaultReplayable: false,
      queued: false
    }
  };
}

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

function safeJson(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch (_) {
    return fallback;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function shortPreview(value, limit = 120) {
  const text = String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > limit ? text.slice(0, Math.max(0, limit - 3)).trimEnd() + '...' : text;
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function getCatalog() {
  return EVENT_CATALOG.map(item => ({
    event: item.event,
    channel: item.channel,
    action: item.action,
    category: item.category,
    description: item.description,
    policy: { ...item.policy }
  }));
}

function incrementMap(map, key) {
  const clean = cleanString(key, 'unknown');
  map[clean] = Number(map[clean] || 0) + 1;
}

function setError(err, fallback = 'unknown_error') {
  state.counts.errors += 1;
  state.lastError = err && err.message ? err.message : cleanString(err, fallback);
  state.updatedAt = nowIso();
  return state.lastError;
}

function startTimers() {
  stopTimers();
  state.heartbeatTimer = setInterval(sendHeartbeat, 5000);
  state.statusTimer = setInterval(() => publishStatus('interval'), 30000);
  if (state.heartbeatTimer && typeof state.heartbeatTimer.unref === 'function') state.heartbeatTimer.unref();
  if (state.statusTimer && typeof state.statusTimer.unref === 'function') state.statusTimer.unref();
}

function stopTimers() {
  if (state.heartbeatTimer) clearInterval(state.heartbeatTimer);
  if (state.statusTimer) clearInterval(state.statusTimer);
  state.heartbeatTimer = null;
  state.statusTimer = null;
}

function sendHeartbeat() {
  if (!bus || typeof bus.heartbeatModule !== 'function') return { ok: false, reason: 'bus_unavailable' };
  try {
    const at = nowIso();
    const result = bus.heartbeatModule(MODULE_ID, {
      module: MODULE_NAME,
      name: 'Twitch Events',
      version: MODULE_VERSION,
      build: MODULE_BUILD,
      status: state.lastError ? 'degraded' : 'online',
      health: state.lastError ? 'warn' : 'ok',
      counts: {
        received: state.counts.received,
        emitted: state.counts.emitted,
        errors: state.counts.errors
      }
    });
    state.lastHeartbeatAt = at;
    state.heartbeatCount += 1;
    return result;
  } catch (err) {
    setError(err, 'heartbeat_failed');
    return { ok: false, reason: 'heartbeat_failed', error: state.lastError };
  }
}

function publishStatus(trigger = 'manual') {
  if (!bus || typeof bus.publishModuleStatus !== 'function') return { ok: false, reason: 'bus_unavailable' };
  try {
    return bus.publishModuleStatus(MODULE_NAME, getStatusPayload(trigger), {
      id: MODULE_ID,
      replayable: false,
      requireAck: false,
      ttlMs: 0
    });
  } catch (err) {
    setError(err, 'publish_status_failed');
    return { ok: false, reason: 'publish_status_failed', error: state.lastError };
  }
}

function getStatusPayload(trigger = 'status') {
  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    build: MODULE_BUILD,
    enabled: state.enabled,
    health: state.lastError ? 'warn' : 'ok',
    status: state.initialized ? 'ready' : 'starting',
    trigger,
    routeCount: state.routeCount,
    schemaReady: true,
    lastError: state.lastError,
    warnings: state.lastWarning ? [state.lastWarning] : [],
    counts: safeJson(state.counts, {}),
    eventSubOwnership: safeJson(EVENTSUB_OWNERSHIP, {}),
    eventSubChatReadiness: safeJson(EVENTSUB_CHAT_READINESS, {}),
    eventSubChat: getEventSubChatStatus(),
    bus: {
      registered: state.registeredOnBus,
      heartbeat: true,
      available: state.busAvailable,
      emits: MODULE_META.bus.emits.length,
      listens: MODULE_META.bus.listens.length,
      ackPrepared: true,
      ackDefaultEnabled: false,
      replayPrepared: true,
      replayDefaultEnabled: false
    },
    heartbeat: {
      enabled: true,
      lastHeartbeatAt: state.lastHeartbeatAt,
      heartbeatCount: state.heartbeatCount,
      intervalMs: 5000
    },
    runtime: {
      loadedAt: state.loadedAt,
      updatedAt: state.updatedAt,
      lastEvent: state.lastEvent
    }
  };
}

function getStatus() {
  const catalog = getCatalog();
  return {
    ok: !state.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    version: MODULE_VERSION,
    build: MODULE_BUILD,
    enabled: state.enabled,
    health: state.lastError ? 'warn' : 'ok',
    initialized: state.initialized,
    routeCount: state.routeCount,
    schemaReady: true,
    lastError: state.lastError,
    diagnostics: {
      ok: !state.lastError,
      health: state.lastError ? 'warn' : 'ok',
      module: MODULE_NAME,
      version: MODULE_VERSION,
      moduleVersion: MODULE_VERSION,
      build: MODULE_BUILD,
      schemaVersion: 1,
      schemaReady: true,
      counts: safeJson(state.counts, {}),
      database: {
        used: false,
        note: 'BUS-TWITCH.4 speichert keine Twitch-Events in SQLite.'
      },
      eventSubOwnership: safeJson(EVENTSUB_OWNERSHIP, {}),
      eventSubChatReadiness: safeJson(EVENTSUB_CHAT_READINESS, {}),
      eventSubChat: getEventSubChatStatus(),
      runtime: {
        loadedAt: state.loadedAt,
        updatedAt: state.updatedAt,
        lastEvent: state.lastEvent
      },
      bus: {
        registered: state.registeredOnBus,
        heartbeat: true,
        available: state.busAvailable,
        emits: MODULE_META.bus.emits,
        listens: MODULE_META.bus.listens,
        ackPrepared: true,
        ackDefaultEnabled: false,
        replayPrepared: true,
        replayDefaultEnabled: false
      },
      heartbeat: {
        enabled: true,
        lastHeartbeatAt: state.lastHeartbeatAt,
        heartbeatCount: state.heartbeatCount,
        intervalMs: 5000
      },
      warnings: state.lastWarning ? [state.lastWarning] : [],
      errors: state.lastError ? [state.lastError] : []
    },
    eventCatalog: {
      count: catalog.length,
      categories: [...new Set(catalog.map(item => item.category))].sort(),
      events: catalog
    },
    migration: {
      mode: 'eventsub-ownership-prep',
      rule: 'twitch_events wird als zukuenftiger EventSub-Besitzer vorbereitet. twitch.js bleibt aktuell produktiver EventSub-Besitzer. Alte Direktlogik wird erst entfernt, wenn ein Modul erfolgreich abonniert, getestet und dokumentiert ist.',
      currentStep: 'BUS-TWITCH.6',
      nextStep: 'BUS-TWITCH.7 – Commands als Subscriber vorbereiten, Direkt-Hook bleibt bis Test aktiv'
    },
    updatedAt: nowIso()
  };
}

function buildMeta(eventDefItem, options = {}) {
  const policy = eventDefItem.policy || DEFAULT_POLICY;
  const requireAck = options.requireAck === true && policy.ackSupported === true;
  const replayable = options.replayable === true && policy.replaySupported === true;
  const ttlMs = Number.isFinite(Number(options.ttlMs)) ? Math.max(0, Number(options.ttlMs)) : (replayable ? Math.max(0, Number(policy.defaultTtlMs || 0)) : 0);
  return {
    requireAck,
    replayable,
    ttlMs,
    priority: cleanString(options.priority || policy.priority || 'P2'),
    queued: false,
    ackSupported: policy.ackSupported === true,
    replaySupported: policy.replaySupported === true,
    ackDefaultEnabled: false,
    replayDefaultEnabled: false,
    correlationId: cleanString(options.correlationId || ''),
    eventKey: eventDefItem.event
  };
}

function buildBasePayload(eventDefItem, payload = {}, context = {}) {
  const now = nowIso();
  return {
    eventKey: eventDefItem.event,
    category: eventDefItem.category,
    sourceModule: cleanString(context.source || context.sourceModule || ''),
    receivedAt: cleanString(context.receivedAt || payload.receivedAt || now),
    normalizedAt: now,
    correlationId: cleanString(context.correlationId || payload.correlationId || ''),
    twitch: safeJson(payload, {})
  };
}

function publishTwitchEvent(eventKey, payload = {}, context = {}, options = {}) {
  const eventDefItem = EVENT_MAP.get(eventKey);
  state.counts.received += 1;
  state.updatedAt = nowIso();

  if (!eventDefItem) {
    state.counts.skipped += 1;
    state.lastWarning = `unknown_event:${eventKey}`;
    return { ok: false, reason: 'unknown_event', eventKey };
  }

  if (!state.enabled) {
    state.counts.skipped += 1;
    return { ok: false, reason: 'module_disabled', eventKey };
  }

  if (eventDefItem.event === 'twitch.chat.message') {
    const dedupe = markOrSkipChatDedupe(payload);
    if (dedupe.duplicate === true) {
      state.counts.skipped += 1;
      state.updatedAt = nowIso();
      return { ok: false, reason: 'duplicate_chat_event', eventKey, dedupeKey: dedupe.key };
    }
  }

  const currentBus = options.bus || bus || (communicationBus && typeof communicationBus.getBus === 'function' ? communicationBus.getBus() : null);
  if (!currentBus || typeof currentBus.emit !== 'function') {
    state.counts.skipped += 1;
    setError('bus_unavailable', 'bus_unavailable');
    return { ok: false, reason: 'bus_unavailable', eventKey };
  }

  const normalizedPayload = buildBasePayload(eventDefItem, payload, context);
  const meta = buildMeta(eventDefItem, options);
  const message = {
    type: 'event',
    channel: eventDefItem.channel,
    action: eventDefItem.action,
    source: {
      type: 'module',
      id: MODULE_ID,
      module: MODULE_NAME
    },
    target: options.target || DEFAULT_TARGET,
    payload: normalizedPayload,
    meta
  };

  try {
    const result = currentBus.emit(message);
    state.counts.emitted += 1;
    incrementMap(state.counts.byEvent, eventDefItem.event);
    incrementMap(state.counts.byCategory, eventDefItem.category);
    incrementMap(state.counts.bySource, normalizedPayload.sourceModule || 'unknown');
    state.lastEvent = {
      eventKey: eventDefItem.event,
      channel: eventDefItem.channel,
      action: eventDefItem.action,
      category: eventDefItem.category,
      at: nowIso(),
      busEventId: result && result.event ? result.event.id : '',
      delivered: Number(result && result.deliveredCount || 0),
      subscribers: Number(result && result.subscriberDeliveredCount || 0),
      preview: shortPreview(JSON.stringify(normalizedPayload.twitch || {}), 180)
    };
    state.lastError = '';
    state.updatedAt = nowIso();
    return {
      ok: true,
      eventKey: eventDefItem.event,
      busEventId: state.lastEvent.busEventId,
      bus: result
    };
  } catch (err) {
    const error = setError(err, 'emit_failed');
    return { ok: false, reason: 'emit_failed', eventKey, error };
  }
}

function tagsFromParsed(parsed = {}) {
  return isPlainObject(parsed.tags) ? parsed.tags : {};
}

function badgesFromParsed(parsed = {}) {
  return isPlainObject(parsed.badges) ? parsed.badges : {};
}

function paramsFromParsed(parsed = {}) {
  return Array.isArray(parsed.params) ? parsed.params : [];
}

function messageFromParsed(parsed = {}) {
  const params = paramsFromParsed(parsed);
  return cleanString(params[1] || params[params.length - 1] || '');
}

function channelFromParsed(parsed = {}, context = {}) {
  const params = paramsFromParsed(parsed);
  return cleanString(context.channel || params[0] || parsed.channel || '').replace(/^#/, '').toLowerCase();
}

function normalizeIrcUser(parsed = {}) {
  const tags = tagsFromParsed(parsed);
  const badges = badgesFromParsed(parsed);
  const login = cleanLogin(parsed.login || tags.login || '');
  const displayName = cleanString(parsed.displayName || tags['display-name'] || login, login);
  return {
    login,
    displayName,
    userId: cleanString(tags['user-id'] || ''),
    roles: {
      broadcaster: Boolean(badges.broadcaster),
      mod: Boolean(badges.moderator) || tags.mod === '1',
      vip: Boolean(badges.vip),
      subscriber: Boolean(badges.subscriber || badges.founder) || tags.subscriber === '1'
    },
    badges
  };
}

function handleIrcEvent(parsed = {}, context = {}, options = {}) {
  const command = cleanString(parsed.command || '').toUpperCase();
  if (!command) return { ok: false, reason: 'missing_command' };

  if (command === 'PRIVMSG') {
    const user = normalizeIrcUser(parsed);
    const message = messageFromParsed(parsed);
    if (!user.login || !message) return { ok: false, reason: 'invalid_privmsg' };
    const payload = {
      source: 'irc',
      command,
      channel: channelFromParsed(parsed, context),
      message: shortPreview(message, Number(options.maxMessageLength || 450)),
      messageLength: message.length,
      messageId: cleanString(firstValue(tagsFromParsed(parsed).id, tagsFromParsed(parsed)['message-id'])),
      user,
      tags: options.includeTags === true ? safeJson(tagsFromParsed(parsed), {}) : undefined,
      raw: options.includeRaw === true ? cleanString(parsed.raw || '') : undefined
    };
    return publishTwitchEvent('twitch.chat.message', payload, { ...context, source: context.source || 'twitch_presence' }, options);
  }

  if (command === 'NOTICE') {
    return publishTwitchEvent('twitch.notice.received', {
      source: 'irc',
      command,
      channel: channelFromParsed(parsed, context),
      message: messageFromParsed(parsed),
      tags: options.includeTags === true ? safeJson(tagsFromParsed(parsed), {}) : undefined,
      raw: options.includeRaw === true ? cleanString(parsed.raw || '') : undefined
    }, { ...context, source: context.source || 'twitch_presence' }, options);
  }

  if (command === 'USERNOTICE') {
    const user = normalizeIrcUser(parsed);
    const tags = tagsFromParsed(parsed);
    return publishTwitchEvent('twitch.usernotice.received', {
      source: 'irc',
      command,
      channel: channelFromParsed(parsed, context),
      user,
      noticeType: cleanString(tags['msg-id'] || ''),
      message: messageFromParsed(parsed),
      tags: options.includeTags === true ? safeJson(tags, {}) : undefined,
      raw: options.includeRaw === true ? cleanString(parsed.raw || '') : undefined
    }, { ...context, source: context.source || 'twitch_presence' }, options);
  }

  return { ok: false, reason: 'unsupported_irc_command', command };
}

function normalizeEventSubEnvelope(notification = {}) {
  const root = isPlainObject(notification) ? notification : {};
  const payload = isPlainObject(root.payload) ? root.payload : root;
  const subscription = isPlainObject(payload.subscription) ? payload.subscription : (isPlainObject(root.subscription) ? root.subscription : {});
  const event = isPlainObject(payload.event) ? payload.event : (isPlainObject(root.event) ? root.event : {});
  const metadata = isPlainObject(payload.metadata) ? payload.metadata : (isPlainObject(root.metadata) ? root.metadata : {});
  const type = cleanString(subscription.type || root.type || root.subscriptionType || '');
  return { root, payload, subscription, event, metadata, type };
}

function normalizeEventSubUser(event = {}, prefix = 'user') {
  const userId = firstValue(event[`${prefix}_id`], event[`${prefix}Id`], event.user_id, event.userId);
  const login = firstValue(event[`${prefix}_login`], event[`${prefix}Login`], event.user_login, event.userLogin);
  const displayName = firstValue(event[`${prefix}_name`], event[`${prefix}Name`], event.user_name, event.userName, login);
  return {
    id: cleanString(userId),
    login: cleanLogin(login),
    displayName: cleanString(displayName || login)
  };
}

function normalizeBroadcaster(event = {}) {
  return {
    id: cleanString(firstValue(event.broadcaster_user_id, event.broadcasterUserId, event.to_broadcaster_user_id, event.toBroadcasterUserId)),
    login: cleanLogin(firstValue(event.broadcaster_user_login, event.broadcasterUserLogin, event.to_broadcaster_user_login, event.toBroadcasterUserLogin)),
    displayName: cleanString(firstValue(event.broadcaster_user_name, event.broadcasterUserName, event.to_broadcaster_user_name, event.toBroadcasterUserName))
  };
}

function normalizeReward(event = {}) {
  const reward = isPlainObject(event.reward) ? event.reward : {};
  return {
    id: cleanString(firstValue(reward.id, event.reward_id, event.rewardId)),
    title: cleanString(firstValue(reward.title, event.reward_title, event.rewardTitle)),
    prompt: cleanString(firstValue(reward.prompt, event.reward_prompt, event.rewardPrompt)),
    cost: Number(firstValue(reward.cost, event.reward_cost, event.rewardCost, 0)) || 0
  };
}

function normalizeEventSubPayload(eventKey, type, event = {}, subscription = {}, metadata = {}) {
  const broadcaster = normalizeBroadcaster(event);
  const base = {
    source: 'eventsub',
    eventSubType: type,
    eventSubVersion: cleanString(subscription.version || ''),
    eventSubMessageId: cleanString(metadata.message_id || metadata.messageId || ''),
    broadcaster
  };

  if (eventKey === 'twitch.chat.message' && type === 'channel.chat.message') {
    const messageObj = isPlainObject(event.message) ? event.message : {};
    const text = cleanString(firstValue(messageObj.text, event.message_text, event.messageText, event.text));
    const rawBadges = Array.isArray(event.badges) ? event.badges : [];
    const badges = rawBadges.reduce((acc, badge) => {
      const key = cleanString(firstValue(badge.set_id, badge.setId, badge.id));
      if (key) acc[key] = cleanString(firstValue(badge.id, badge.info, '1')) || true;
      return acc;
    }, {});
    const user = {
      login: cleanLogin(firstValue(event.chatter_user_login, event.user_login, event.login)),
      displayName: cleanString(firstValue(event.chatter_user_name, event.user_name, event.displayName)),
      userId: cleanString(firstValue(event.chatter_user_id, event.user_id, event.userId)),
      roles: {
        broadcaster: Boolean(badges.broadcaster),
        mod: Boolean(badges.moderator),
        vip: Boolean(badges.vip),
        subscriber: Boolean(badges.subscriber || badges.founder)
      },
      badges
    };
    return {
      ...base,
      source: 'eventsub',
      channel: broadcaster.login,
      message: shortPreview(text, 450),
      messageLength: text.length,
      messageId: cleanString(firstValue(event.message_id, event.messageId)),
      messageType: cleanString(firstValue(event.message_type, event.messageType, 'text')),
      user,
      color: cleanString(event.color || ''),
      cheer: isPlainObject(event.cheer) ? safeJson(event.cheer, null) : null,
      reply: isPlainObject(event.reply) ? safeJson(event.reply, null) : null,
      channelPointsCustomRewardId: cleanString(firstValue(event.channel_points_custom_reward_id, event.channelPointsCustomRewardId)),
      sharedChat: {
        sourceBroadcasterUserId: cleanString(firstValue(event.source_broadcaster_user_id, event.sourceBroadcasterUserId)),
        sourceBroadcasterUserLogin: cleanLogin(firstValue(event.source_broadcaster_user_login, event.sourceBroadcasterUserLogin)),
        sourceBroadcasterUserName: cleanString(firstValue(event.source_broadcaster_user_name, event.sourceBroadcasterUserName)),
        sourceMessageId: cleanString(firstValue(event.source_message_id, event.sourceMessageId)),
        isSourceOnly: event.is_source_only === true
      },
      fragments: Array.isArray(messageObj.fragments) ? safeJson(messageObj.fragments, []) : []
    };
  }

  if (eventKey === 'twitch.channelpoints.redemption.created') {
    return {
      ...base,
      redemption: {
        id: cleanString(firstValue(event.id, event.redemption_id, event.redemptionId)),
        status: cleanString(firstValue(event.status, 'unfulfilled')).toLowerCase(),
        userInput: cleanString(firstValue(event.user_input, event.userInput, event.input)),
        redeemedAt: cleanString(firstValue(event.redeemed_at, event.redeemedAt))
      },
      reward: normalizeReward(event),
      user: normalizeEventSubUser(event, 'user')
    };
  }

  if (eventKey.startsWith('twitch.stream.')) {
    return {
      ...base,
      stream: {
        id: cleanString(event.id || ''),
        type: cleanString(event.type || ''),
        title: cleanString(event.title || ''),
        categoryId: cleanString(firstValue(event.category_id, event.categoryId, event.game_id, event.gameId)),
        categoryName: cleanString(firstValue(event.category_name, event.categoryName, event.game_name, event.gameName)),
        startedAt: cleanString(firstValue(event.started_at, event.startedAt))
      }
    };
  }

  if (eventKey === 'twitch.channel.updated') {
    return {
      ...base,
      channel: {
        title: cleanString(event.title || ''),
        language: cleanString(event.language || ''),
        categoryId: cleanString(firstValue(event.category_id, event.categoryId, event.game_id, event.gameId)),
        categoryName: cleanString(firstValue(event.category_name, event.categoryName, event.game_name, event.gameName)),
        contentClassificationLabels: Array.isArray(event.content_classification_labels) ? event.content_classification_labels : []
      }
    };
  }

  if (eventKey === 'twitch.follow.received') {
    return {
      ...base,
      user: normalizeEventSubUser(event, 'user'),
      followedAt: cleanString(firstValue(event.followed_at, event.followedAt))
    };
  }

  if (eventKey === 'twitch.cheer.received') {
    return {
      ...base,
      user: normalizeEventSubUser(event, 'user'),
      bits: Number(event.bits || 0),
      message: cleanString(event.message || '')
    };
  }

  if (eventKey === 'twitch.raid.received') {
    return {
      ...base,
      fromBroadcaster: {
        id: cleanString(firstValue(event.from_broadcaster_user_id, event.fromBroadcasterUserId)),
        login: cleanLogin(firstValue(event.from_broadcaster_user_login, event.fromBroadcasterUserLogin)),
        displayName: cleanString(firstValue(event.from_broadcaster_user_name, event.fromBroadcasterUserName))
      },
      toBroadcaster: {
        id: cleanString(firstValue(event.to_broadcaster_user_id, event.toBroadcasterUserId)),
        login: cleanLogin(firstValue(event.to_broadcaster_user_login, event.toBroadcasterUserLogin)),
        displayName: cleanString(firstValue(event.to_broadcaster_user_name, event.toBroadcasterUserName))
      },
      viewers: Number(event.viewers || 0)
    };
  }

  if (eventKey === 'twitch.sub.received' || eventKey === 'twitch.resub.received') {
    return {
      ...base,
      user: normalizeEventSubUser(event, 'user'),
      tier: cleanString(firstValue(event.tier, event.sub_tier, 'unknown')).toLowerCase(),
      isGift: event.is_gift === true,
      cumulativeMonths: Number(firstValue(event.cumulative_months, event.cumulativeMonths, event.duration_months, 0)) || 0,
      streakMonths: Number(firstValue(event.streak_months, event.streakMonths, 0)) || 0,
      message: cleanString(isPlainObject(event.message) ? event.message.text : event.message || '')
    };
  }

  if (eventKey === 'twitch.subgift.received' || eventKey === 'twitch.giftbomb.received') {
    return {
      ...base,
      user: normalizeEventSubUser(event, 'user'),
      gifter: normalizeEventSubUser(event, 'gifter'),
      tier: cleanString(firstValue(event.tier, event.sub_tier, 'unknown')).toLowerCase(),
      total: Number(firstValue(event.total, event.amount, 1)) || 1,
      cumulativeTotal: Number(firstValue(event.cumulative_total, event.cumulativeTotal, 0)) || 0,
      recipient: {
        id: cleanString(firstValue(event.recipient_user_id, event.recipientUserId)),
        login: cleanLogin(firstValue(event.recipient_user_login, event.recipientUserLogin)),
        displayName: cleanString(firstValue(event.recipient_user_name, event.recipientUserName))
      }
    };
  }

  if (eventKey.startsWith('twitch.vip.')) {
    return {
      ...base,
      user: normalizeEventSubUser(event, 'user')
    };
  }

  if (eventKey.startsWith('twitch.hypetrain.')) {
    return {
      ...base,
      hypeTrain: {
        id: cleanString(event.id || ''),
        level: Number(event.level || 0),
        total: Number(event.total || 0),
        progress: Number(event.progress || 0),
        goal: Number(event.goal || 0),
        startedAt: cleanString(firstValue(event.started_at, event.startedAt)),
        expiresAt: cleanString(firstValue(event.expires_at, event.expiresAt)),
        endedAt: cleanString(firstValue(event.ended_at, event.endedAt)),
        cooldownEndsAt: cleanString(firstValue(event.cooldown_ends_at, event.cooldownEndsAt))
      }
    };
  }

  if (eventKey.startsWith('twitch.shoutout.')) {
    return {
      ...base,
      fromBroadcaster: {
        id: cleanString(firstValue(event.from_broadcaster_user_id, event.fromBroadcasterUserId)),
        login: cleanLogin(firstValue(event.from_broadcaster_user_login, event.fromBroadcasterUserLogin)),
        displayName: cleanString(firstValue(event.from_broadcaster_user_name, event.fromBroadcasterUserName))
      },
      toBroadcaster: {
        id: cleanString(firstValue(event.to_broadcaster_user_id, event.toBroadcasterUserId)),
        login: cleanLogin(firstValue(event.to_broadcaster_user_login, event.toBroadcasterUserLogin)),
        displayName: cleanString(firstValue(event.to_broadcaster_user_name, event.toBroadcasterUserName))
      },
      startedAt: cleanString(firstValue(event.started_at, event.startedAt)),
      viewerCount: Number(firstValue(event.viewer_count, event.viewerCount, 0)) || 0
    };
  }

  return {
    ...base,
    event: safeJson(event, {})
  };
}

function handleEventSubNotification(notification = {}, context = {}, options = {}) {
  const envelope = normalizeEventSubEnvelope(notification);
  const eventKey = EVENTSUB_TYPE_MAP[envelope.type] || cleanString(context.eventKey || '');
  if (!eventKey) return { ok: false, reason: 'unsupported_eventsub_type', type: envelope.type };

  const payload = normalizeEventSubPayload(eventKey, envelope.type, envelope.event, envelope.subscription, envelope.metadata);
  const result = publishTwitchEvent(eventKey, payload, { ...context, source: context.source || 'twitch' }, options);

  if (result && result.ok === true) {
    publishTwitchEvent('twitch.eventsub.notification.received', {
      source: 'eventsub',
      eventSubType: envelope.type,
      eventKey,
      eventSubMessageId: cleanString(envelope.metadata.message_id || envelope.metadata.messageId || '')
    }, { ...context, source: context.source || 'twitch' }, { ...options, target: DEFAULT_TARGET });
  }

  return result;
}

function handleEventSubLifecycle(kind, payload = {}, context = {}, options = {}) {
  const cleanKind = cleanString(kind).toLowerCase();
  const map = {
    connected: 'twitch.eventsub.connected',
    disconnected: 'twitch.eventsub.disconnected',
    reconnecting: 'twitch.eventsub.reconnecting',
    reconnected: 'twitch.eventsub.reconnected',
    subscription_created: 'twitch.eventsub.subscription.created',
    subscription_failed: 'twitch.eventsub.subscription.failed',
    subscription_removed: 'twitch.eventsub.subscription.removed'
  };
  const eventKey = map[cleanKind] || cleanString(context.eventKey || '');
  if (!eventKey) return { ok: false, reason: 'unsupported_eventsub_lifecycle', kind: cleanKind };
  return publishTwitchEvent(eventKey, {
    source: 'eventsub',
    kind: cleanKind,
    ...safeJson(payload, {})
  }, { ...context, source: context.source || 'twitch_events' }, options);
}

function handleRedemptionLifecycleEvent(kind, payload = {}, context = {}, options = {}) {
  const cleanKind = cleanString(kind).toLowerCase().replace(/_/g, '.');
  const map = {
    'fulfill.requested': 'twitch.channelpoints.redemption.fulfill.requested',
    'cancel.requested': 'twitch.channelpoints.redemption.cancel.requested',
    fulfilled: 'twitch.channelpoints.redemption.fulfilled',
    canceled: 'twitch.channelpoints.redemption.canceled',
    cancelled: 'twitch.channelpoints.redemption.canceled',
    failed: 'twitch.channelpoints.redemption.failed'
  };
  const eventKey = map[cleanKind] || cleanString(context.eventKey || '');
  if (!eventKey) return { ok: false, reason: 'unsupported_redemption_lifecycle', kind: cleanKind };

  return publishTwitchEvent(eventKey, {
    source: 'redemption_lifecycle',
    kind: cleanKind,
    redemption: {
      id: cleanString(firstValue(payload.redemptionId, payload.redemption_id, payload.id)),
      status: cleanString(firstValue(payload.status, cleanKind))
    },
    reward: {
      id: cleanString(firstValue(payload.rewardId, payload.reward_id, payload.reward?.id)),
      title: cleanString(firstValue(payload.rewardTitle, payload.reward_title, payload.reward?.title))
    },
    user: {
      id: cleanString(firstValue(payload.userId, payload.user_id, payload.user?.id)),
      login: cleanLogin(firstValue(payload.userLogin, payload.user_login, payload.login, payload.user?.login)),
      displayName: cleanString(firstValue(payload.userDisplayName, payload.user_display_name, payload.displayName, payload.user?.displayName))
    },
    error: cleanString(payload.error || payload.lastError || '')
  }, { ...context, source: context.source || 'twitch_events' }, options);
}
