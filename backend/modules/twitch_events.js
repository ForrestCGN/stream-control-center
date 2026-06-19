'use strict';

/**
 * BUS-TWITCH.10 – EventSub Chat Autostart Restart Safety
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
 * - keeps guarded EventSub channel.chat.message activation
 * - enables EventSub chat autostart by default with env override
 * - keeps duplicate-protection for IRC/EventSub parallel mode
 * - keeps existing twitch.js EventSub flows active
 *
 * This module keeps old paths available but makes EventSub chat restart-safe for the new bus command default.
 */

const fs = require('fs');
const path = require('path');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const configHelper = require('./helpers/helper_config');
const communicationBus = require('./communication_bus');
const axios = require('axios');
const WebSocket = require('ws');

const MODULE_NAME = 'twitch_events';
const MODULE_VERSION = '0.1.14';
const MODULE_BUILD = 'STEP_HT1_HYPETRAIN_RECORD_SOUND_DASHBOARD';
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
      'twitch.stream.session.started',
      'twitch.stream.session.pending',
      'twitch.stream.session.confirmed',
      'twitch.stream.session.warning',
      'twitch.stream.session.grace',
      'twitch.stream.session.reconnect',
      'twitch.stream.session.resumed',
      'twitch.stream.session.ended',
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
      'twitch.hypetrain.record_broken',
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
  eventDef('twitch.hypetrain.record_broken', 'twitch.hypetrain', 'record_broken', 'hypetrain', 'Hype-Train Rekord wurde gebrochen.', IMPORTANT_POLICY),

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


const DEFAULT_HYPETRAIN_CONFIG = {
  enabled: true,
  recordDetection: {
    enabled: true,
    totalRecordEnabled: true,
    levelRecordEnabled: true,
    triggerOnlyOncePerTrain: true
  },
  recordSound: {
    enabled: true,
    mediaId: 0,
    label: 'Hype-Train Rekord',
    priority: 1000,
    queueIfBusy: true,
    dropIfBusy: false,
    canInterrupt: false,
    canBeInterrupted: false,
    parallelAllowed: false,
    target: 'stream',
    outputTarget: 'overlay',
    volume: 1
  },
  diary: {
    enabled: true,
    systemUsername: 'CGN-HypeTrain',
    writeOnEnd: true,
    includeRecordInfo: true
  },
  media: {
    moduleKey: 'twitch_events',
    categoryKey: 'hypetrain-record',
    allowedTypes: ['audio']
  },
  endpoints: {
    soundPlayUrl: 'http://127.0.0.1:8080/api/sound/play',
    tagebuchEntryUrl: 'http://127.0.0.1:8080/api/tagebuch/entry'
  },
  texts: {
    recordBroken: '🚂💜 Hype-Train-Rekord! Die Rentner haben den Zug entgleisen lassen: Level {level}, Gesamt {total}. Alter Rekord: Level {oldLevel}, Gesamt {oldTotal}.',
    trainEnded: '🚂 Hype-Train beendet: Level {level}, Gesamt {total}, Ziel {goal}. {recordText}',
    recordShort: 'Neuer Rekord: {recordTypes}.'
  }
};

let runtimeConfig = null;
let runtimeConfigPath = '';


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

  hypeTrain: {
    current: null,
    byId: {},
    recent: [],
    recordBrokenEvents: [],
    lastRecordBrokenAt: '',
    lastEndedAt: '',
    lastSoundResult: null,
    lastDiaryResult: null,
    lastError: '',
    counters: {
      started: 0,
      progress: 0,
      ended: 0,
      recordBroken: 0,
      totalRecordBroken: 0,
      levelRecordBroken: 0,
      soundQueued: 0,
      soundSkipped: 0,
      soundFailed: 0,
      diaryWritten: 0,
      diarySkipped: 0,
      diaryFailed: 0
    }
  },
  eventSubChat: {
    enabled: false,
    autostart: true,
    autostartEvaluated: false,
    lastAutostartAt: '',
    lastAutostartResult: '',
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
      ircPrivmsgReceived: 0,
      ircChatMessagesEmitted: 0,
      ircChatMessagesSkipped: 0,
      duplicateSkipped: 0,
      websocketErrors: 0,
      reconnects: 0
    }
  },
  streamState: {
    enabled: true,
    provider: 'live_status_monitor',
    sourceUrl: '',
    fallbackUrl: '',
    pollIntervalMs: 30000,
    initialized: false,
    known: false,
    live: false,
    previousLive: null,
    source: 'unknown',
    sourceSummary: '',
    confidence: 'unknown',
    eventSubRequired: false,
    broadcasterLogin: '',
    streamId: '',
    startedAt: '',
    title: '',
    gameName: '',
    viewerCount: 0,
    streamSessionId: '',
    streamDayId: '',
    sessionStatus: '',
    restartGraceUntil: '',
    obsStreaming: false,
    obsConnected: false,
    obsDetected: false,
    bandwidthTest: false,
    bandwidthTestKey: '',
    twitchStreamsLive: false,
    twitchSearchLive: false,
    streamStatusLive: false,
    eventSubLive: 'unknown',
    status: 'offline',
    calendarDay: '',
    streamDateLabel: '',
    streamDayMode: 'stream_session',
    streamSession: {
      active: false,
      status: 'offline',
      streamSessionId: '',
      streamDayId: '',
      calendarDay: '',
      streamDateLabel: '',
      startedAt: '',
      confirmedAt: '',
      lastSeenAt: '',
      graceStartedAt: '',
      graceUntil: '',
      endedAt: '',
      closedAt: '',
      closedReason: '',
      source: '',
      confidence: 'unknown',
      twitchStreamId: '',
      obsStarted: false,
      twitchConfirmed: false,
      bandwidthTest: false,
      pendingWarningAt: '',
      meta: {}
    },
    lastCheckedAt: '',
    lastChangedAt: '',
    lastPublishedAt: '',
    lastEventKey: '',
    lastEventId: '',
    lastAction: '',
    lastReason: '',
    lastRefreshReason: '',
    lastError: '',
    warnings: [],
    counters: {
      refreshes: 0,
      transitions: 0,
      onlineEmitted: 0,
      offlineEmitted: 0,
      overrideSet: 0,
      overrideCleared: 0,
      errors: 0,
      sessionStarted: 0,
      sessionPending: 0,
      sessionConfirmed: 0,
      sessionGrace: 0,
      sessionResumed: 0,
      sessionEnded: 0,
      sessionWarnings: 0,
      bandwidthTestDetected: 0
    },
    manualOverride: {
      active: false,
      live: false,
      setAt: '',
      expiresAt: '',
      reason: '',
      source: 'manual_override'
    }
  }
};

let bus = null;
let twitchCore = null;
let eventSubChatWs = null;
let eventSubChatReconnectTimer = null;
let streamStateTimer = null;
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
module.exports.getStreamState = getStreamState;
module.exports.refreshStreamState = refreshStreamState;
module.exports.getHypeTrainRuntimeStatus = getHypeTrainRuntimeStatus;
module.exports.getHypeTrainConfig = getHypeTrainConfig;

module.exports.init = function init(ctx = {}) {
  const app = ctx.app;
  state.env = ctx.env || process.env || {};
  state.initialized = true;
  state.updatedAt = nowIso();
  ensureHypeTrainConfigLoaded();

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

    registered.push(...routes.registerGet(app, ['/api/twitch/events/hypetrain/status', '/twitch/events/hypetrain/status'], (req, res) => {
      res.json(getHypeTrainRuntimeStatus());
    }));

    registered.push(...routes.registerGet(app, ['/api/twitch/events/hypetrain/config', '/twitch/events/hypetrain/config'], (req, res) => {
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, configPath: runtimeConfigPath || resolveHypeTrainConfigPath(), config: publicHypeTrainConfig(), hypetrain: getHypeTrainRuntimeStatus() });
    }));

    registered.push(...routes.registerPost(app, ['/api/twitch/events/hypetrain/config', '/twitch/events/hypetrain/config'], (req, res) => {
      try {
        const body = req.body || {};
        const current = ensureHypeTrainConfigLoaded();
        const nextHypeTrain = deepMergeLocal(current.hypetrain || DEFAULT_HYPETRAIN_CONFIG, body.hypetrain || body.config || body || {});
        const saved = saveHypeTrainConfig({ ...current, hypetrain: nextHypeTrain });
        res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, configPath: runtimeConfigPath, config: cloneJson(saved.hypetrain, {}), hypetrain: getHypeTrainRuntimeStatus() });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: err && err.message ? err.message : String(err) });
      }
    }));

    registered.push(...routes.registerPost(app, ['/api/twitch/events/hypetrain/test', '/twitch/events/hypetrain/test'], (req, res) => {
      const result = runHypeTrainSyntheticTest(req.body || {}, req.query || {});
      res.status(result.ok ? 200 : 400).json(result);
    }));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/hypetrain/test', '/twitch/events/hypetrain/test'], (req, res) => {
      const result = runHypeTrainSyntheticTest({}, req.query || {});
      res.status(result.ok ? 200 : 400).json(result);
    }));

    const streamStateRoute = async (req, res) => {
      try {
        const refresh = /^1|true|yes|on$/i.test(String((req.query && req.query.refresh) || ''));
        const data = refresh ? await refreshStreamState({ reason: 'route_refresh', forcePublish: false }) : getStreamState();
        res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, streamState: data });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: err && err.message ? err.message : String(err), streamState: getStreamState() });
      }
    };
    registered.push(...routes.registerGet(app, ['/api/twitch/events/stream-state', '/twitch/events/stream-state'], streamStateRoute));
    const streamSessionRoute = async (req, res) => {
      try {
        const refresh = String(req.query && req.query.refresh || '').trim() === '1';
        const data = refresh ? await refreshStreamState({ reason: 'stream_session_route_refresh', forcePublish: false }) : getStreamState();
        res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, streamSession: data.streamSession, streamState: data });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: err && err.message ? err.message : String(err), streamSession: getStreamState().streamSession });
      }
    };
    registered.push(...routes.registerGet(app, ['/api/twitch/events/stream-session', '/twitch/events/stream-session'], streamSessionRoute));

    const overrideStreamStateRoute = async (req, res) => {
      try {
        const body = req.body || {};
        const rawLive = firstValue(body.live, req.query && req.query.live, body.online, req.query && req.query.online, '');
        const parsedLive = parseLiveOverrideValue(rawLive);
        if (parsedLive === null) {
          res.status(400).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: 'live_required_boolean' });
          return;
        }
        const ttlMs = Math.max(0, Number(firstValue(body.ttlMs, req.query && req.query.ttlMs, 600000)) || 600000);
        const reason = cleanString(firstValue(body.reason, req.query && req.query.reason, 'manual_override'), 'manual_override');
        const status = cleanString(firstValue(body.status, req.query && req.query.status, ''));
        const forceConfirmedRaw = firstValue(body.forceConfirmed, req.query && req.query.forceConfirmed, body.confirmed, req.query && req.query.confirmed, '');
        const forceConfirmedParsed = forceConfirmedRaw === '' ? null : parseLiveOverrideValue(forceConfirmedRaw);
        const streamId = cleanString(firstValue(body.streamId, req.query && req.query.streamId, body.twitchStreamId, req.query && req.query.twitchStreamId, ''));
        const data = await setStreamStateOverride(parsedLive, {
          reason,
          ttlMs,
          status,
          forceConfirmed: forceConfirmedParsed === true,
          streamId
        });
        res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, streamState: data });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: err && err.message ? err.message : String(err), streamState: getStreamState() });
      }
    };
    registered.push(...routes.registerPost(app, ['/api/twitch/events/stream-state/override', '/twitch/events/stream-state/override'], overrideStreamStateRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/stream-state/override', '/twitch/events/stream-state/override'], overrideStreamStateRoute));

    const clearStreamStateOverrideRoute = async (req, res) => {
      try {
        const reason = cleanString(firstValue(req.body && req.body.reason, req.query && req.query.reason, 'clear_override'), 'clear_override');
        const data = await clearStreamStateOverride({ reason });
        res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, streamState: data });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: err && err.message ? err.message : String(err), streamState: getStreamState() });
      }
    };
    registered.push(...routes.registerPost(app, ['/api/twitch/events/stream-state/clear-override', '/twitch/events/stream-state/clear-override'], clearStreamStateOverrideRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/stream-state/clear-override', '/twitch/events/stream-state/clear-override'], clearStreamStateOverrideRoute));
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

    const restartChatRoute = async (req, res) => {
      try {
        stopEventSubChat({ reason: firstValue(req.query && req.query.reason, req.body && req.body.reason, 'restart_route_stop') });
        const result = await startEventSubChat({ reason: firstValue(req.query && req.query.reason, req.body && req.body.reason, 'restart_route_start') });
        res.status(result.ok ? 200 : 409).json({ ok: result.ok === true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, result, eventSubChat: getEventSubChatStatus() });
      } catch (err) {
        res.status(500).json({ ok: false, module: MODULE_NAME, error: err && err.message ? err.message : String(err), eventSubChat: getEventSubChatStatus() });
      }
    };

    registered.push(...routes.registerPost(app, ['/api/twitch/events/eventsub/chat/start', '/twitch/events/eventsub/chat/start'], startChatRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/start', '/twitch/events/eventsub/chat/start'], startChatRoute));
    registered.push(...routes.registerPost(app, ['/api/twitch/events/eventsub/chat/stop', '/twitch/events/eventsub/chat/stop'], stopChatRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/stop', '/twitch/events/eventsub/chat/stop'], stopChatRoute));
    registered.push(...routes.registerPost(app, ['/api/twitch/events/eventsub/chat/restart', '/twitch/events/eventsub/chat/restart'], restartChatRoute));
    registered.push(...routes.registerGet(app, ['/api/twitch/events/eventsub/chat/restart', '/twitch/events/eventsub/chat/restart'], restartChatRoute));

    state.routeCount = registered.length;
  }

  state.eventSubChat.autostart = boolEnv('TWITCH_EVENTS_EVENTSUB_CHAT_AUTOSTART', true);
  state.eventSubChat.autostartEvaluated = true;
  if (state.eventSubChat.autostart === true) {
    state.eventSubChat.lastAutostartAt = nowIso();
    state.eventSubChat.lastAutostartResult = 'starting';
    startEventSubChat({ reason: 'env_autostart_default_true' })
      .then(result => { state.eventSubChat.lastAutostartResult = result && result.reason ? result.reason : 'started'; })
      .catch(err => {
        state.eventSubChat.lastAutostartResult = 'failed';
        setEventSubChatError(err, 'autostart_failed');
      });
  } else {
    state.eventSubChat.lastAutostartResult = 'disabled_by_env';
  }

  return getStatus();
};



function cloneJson(value, fallback = null) {
  try { return JSON.parse(JSON.stringify(value ?? fallback)); }
  catch (_) { return fallback; }
}

function isPlainObjectLocal(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeLocal(base, extra) {
  const out = cloneJson(base || {}, {});
  if (!isPlainObjectLocal(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (isPlainObjectLocal(value) && isPlainObjectLocal(out[key])) out[key] = deepMergeLocal(out[key], value);
    else out[key] = cloneJson(value, value);
  }
  return out;
}

function resolveHypeTrainConfigPath() {
  try { return configHelper.resolveConfigFile('twitch_events.json'); }
  catch (_) { return path.resolve(process.cwd(), 'config', 'twitch_events.json'); }
}

function ensureHypeTrainConfigLoaded() {
  if (runtimeConfig) return runtimeConfig;
  runtimeConfigPath = resolveHypeTrainConfigPath();
  let loaded = {};
  try {
    if (fs.existsSync(runtimeConfigPath)) loaded = JSON.parse(fs.readFileSync(runtimeConfigPath, 'utf8')) || {};
  } catch (err) {
    state.lastWarning = `hypetrain_config_load_failed:${err && err.message ? err.message : String(err)}`;
    loaded = {};
  }
  runtimeConfig = deepMergeLocal({ hypetrain: DEFAULT_HYPETRAIN_CONFIG }, loaded || {});
  if (!runtimeConfig.hypetrain) runtimeConfig.hypetrain = cloneJson(DEFAULT_HYPETRAIN_CONFIG, {});
  return runtimeConfig;
}

function saveHypeTrainConfig(nextConfig) {
  runtimeConfigPath = resolveHypeTrainConfigPath();
  const merged = deepMergeLocal({ hypetrain: DEFAULT_HYPETRAIN_CONFIG }, nextConfig || {});
  configHelper.writeJsonFile(runtimeConfigPath, merged, { spaces: 2 });
  runtimeConfig = merged;
  state.updatedAt = nowIso();
  return runtimeConfig;
}

function getHypeTrainConfig() {
  const cfg = ensureHypeTrainConfigLoaded();
  return deepMergeLocal({ hypetrain: DEFAULT_HYPETRAIN_CONFIG }, cfg || {}).hypetrain;
}

function publicHypeTrainConfig() {
  return cloneJson(getHypeTrainConfig(), {});
}

function numberOrZero(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function boolFromConfig(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(text)) return false;
  return fallback;
}

function replaceTextVars(template, vars = {}) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => String(vars[key] ?? ''));
}

function normalizeHypeTrain(input = {}) {
  const hypeTrain = isPlainObjectLocal(input.hypeTrain) ? input.hypeTrain : input;
  const id = cleanString(firstValue(hypeTrain.id, input.id, `hypetrain_${Date.now()}`));
  return {
    id,
    level: numberOrZero(firstValue(hypeTrain.level, input.level)),
    total: numberOrZero(firstValue(hypeTrain.total, input.total)),
    progress: numberOrZero(firstValue(hypeTrain.progress, input.progress)),
    goal: numberOrZero(firstValue(hypeTrain.goal, input.goal)),
    allTimeHighLevel: numberOrZero(firstValue(hypeTrain.allTimeHighLevel, hypeTrain.all_time_high_level, input.allTimeHighLevel, input.all_time_high_level)),
    allTimeHighTotal: numberOrZero(firstValue(hypeTrain.allTimeHighTotal, hypeTrain.all_time_high_total, input.allTimeHighTotal, input.all_time_high_total)),
    startedAt: cleanString(firstValue(hypeTrain.startedAt, hypeTrain.started_at, input.startedAt, input.started_at)),
    expiresAt: cleanString(firstValue(hypeTrain.expiresAt, hypeTrain.expires_at, input.expiresAt, input.expires_at)),
    endedAt: cleanString(firstValue(hypeTrain.endedAt, hypeTrain.ended_at, input.endedAt, input.ended_at)),
    cooldownEndsAt: cleanString(firstValue(hypeTrain.cooldownEndsAt, hypeTrain.cooldown_ends_at, input.cooldownEndsAt, input.cooldown_ends_at)),
    type: cleanString(firstValue(hypeTrain.type, input.type)),
    isSharedTrain: hypeTrain.isSharedTrain === true || hypeTrain.is_shared_train === true || input.isSharedTrain === true || input.is_shared_train === true,
    topContributions: Array.isArray(hypeTrain.topContributions) ? hypeTrain.topContributions : (Array.isArray(hypeTrain.top_contributions) ? hypeTrain.top_contributions : (Array.isArray(input.top_contributions) ? input.top_contributions : []))
  };
}

function rememberHypeTrainRecent(kind, data) {
  const entry = { at: nowIso(), kind, hypeTrain: cloneJson(data, {}) };
  state.hypeTrain.recent.unshift(entry);
  state.hypeTrain.recent = state.hypeTrain.recent.slice(0, 20);
}

function getHypeTrainMemory(id) {
  const cleanId = cleanString(id || `hypetrain_${Date.now()}`);
  if (!state.hypeTrain.byId[cleanId]) {
    state.hypeTrain.byId[cleanId] = {
      id: cleanId,
      startedAt: '',
      lastProgressAt: '',
      endedAt: '',
      baselineAllTimeHighLevel: 0,
      baselineAllTimeHighTotal: 0,
      maxLevel: 0,
      maxTotal: 0,
      totalRecordBroken: false,
      levelRecordBroken: false,
      recordBroken: false,
      recordTypes: [],
      soundTriggered: false,
      diaryWritten: false,
      lastPayload: null
    };
  }
  return state.hypeTrain.byId[cleanId];
}

function pruneHypeTrainMemory() {
  const keys = Object.keys(state.hypeTrain.byId || {});
  if (keys.length <= 25) return;
  const sorted = keys.sort((a, b) => String(state.hypeTrain.byId[b].endedAt || state.hypeTrain.byId[b].lastProgressAt || '').localeCompare(String(state.hypeTrain.byId[a].endedAt || state.hypeTrain.byId[a].lastProgressAt || '')));
  for (const key of sorted.slice(25)) delete state.hypeTrain.byId[key];
}

function detectHypeTrainRecord(memory, hypeTrain, cfg) {
  const detection = cfg.recordDetection || {};
  if (cfg.enabled === false || detection.enabled === false) return { broken: false, types: [] };
  const once = detection.triggerOnlyOncePerTrain !== false;
  const types = [];
  const baselineTotal = numberOrZero(memory.baselineAllTimeHighTotal || hypeTrain.allTimeHighTotal || 0);
  const baselineLevel = numberOrZero(memory.baselineAllTimeHighLevel || hypeTrain.allTimeHighLevel || 0);

  if (detection.totalRecordEnabled !== false && !memory.totalRecordBroken && baselineTotal > 0 && hypeTrain.total > baselineTotal) {
    types.push('total');
  }
  if (detection.levelRecordEnabled !== false && !memory.levelRecordBroken && baselineLevel > 0 && hypeTrain.level > baselineLevel) {
    types.push('level');
  }
  if (!types.length) return { broken: false, types: [] };
  if (once && memory.recordBroken) return { broken: false, types: [] };
  return { broken: true, types };
}

async function triggerHypeTrainRecordSound(recordPayload, cfg) {
  const soundCfg = cfg.recordSound || {};
  if (soundCfg.enabled === false) {
    state.hypeTrain.counters.soundSkipped += 1;
    state.hypeTrain.lastSoundResult = { ok: true, skipped: true, reason: 'record_sound_disabled', at: nowIso() };
    return state.hypeTrain.lastSoundResult;
  }
  const mediaId = Number(soundCfg.mediaId || soundCfg.media_id || 0) || 0;
  if (!mediaId) {
    state.hypeTrain.counters.soundSkipped += 1;
    state.hypeTrain.lastSoundResult = { ok: true, skipped: true, reason: 'record_sound_media_missing', at: nowIso() };
    return state.hypeTrain.lastSoundResult;
  }

  const request = {
    mediaId,
    mediaAssetId: mediaId,
    label: cleanString(soundCfg.label || 'Hype-Train Rekord'),
    category: 'hypetrain_record',
    source: MODULE_NAME,
    requestedBy: 'twitch_events_hypetrain_record',
    target: cleanString(soundCfg.target || 'stream'),
    outputTarget: cleanString(soundCfg.outputTarget || 'overlay'),
    priority: Number(soundCfg.priority || 1000),
    volume: Number(soundCfg.volume || 1),
    queueIfBusy: soundCfg.queueIfBusy !== false,
    dropIfBusy: soundCfg.dropIfBusy === true,
    canInterrupt: soundCfg.canInterrupt === true,
    canBeInterrupted: soundCfg.canBeInterrupted !== false,
    parallelAllowed: soundCfg.parallelAllowed === true,
    meta: {
      module: MODULE_NAME,
      owner: MODULE_NAME,
      purpose: 'hypetrain_record_sound',
      hypeTrainRecord: true,
      hypeTrain: recordPayload.hypeTrain,
      recordTypes: recordPayload.recordTypes || []
    }
  };

  try {
    const url = cleanString(cfg.endpoints && cfg.endpoints.soundPlayUrl || 'http://127.0.0.1:8080/api/sound/play');
    const response = await axios.post(url, request, { timeout: 5000 });
    const data = response && response.data ? response.data : {};
    const queued = data.result && data.result.queued === true;
    const started = data.result && data.result.started === true;
    if (queued || started) state.hypeTrain.counters.soundQueued += 1;
    state.hypeTrain.lastSoundResult = { ok: true, at: nowIso(), queued, started, mediaId, result: data.result || {}, item: data.item || null };
    return state.hypeTrain.lastSoundResult;
  } catch (err) {
    state.hypeTrain.counters.soundFailed += 1;
    state.hypeTrain.lastSoundResult = { ok: false, at: nowIso(), mediaId, error: err && err.message ? err.message : String(err) };
    state.hypeTrain.lastError = state.hypeTrain.lastSoundResult.error;
    return state.hypeTrain.lastSoundResult;
  }
}

async function writeHypeTrainDiaryEntry(hypeTrain, memory, cfg) {
  const diaryCfg = cfg.diary || {};
  if (diaryCfg.enabled === false || diaryCfg.writeOnEnd === false) {
    state.hypeTrain.counters.diarySkipped += 1;
    state.hypeTrain.lastDiaryResult = { ok: true, skipped: true, reason: 'diary_disabled', at: nowIso() };
    return state.hypeTrain.lastDiaryResult;
  }
  if (memory.diaryWritten) {
    state.hypeTrain.counters.diarySkipped += 1;
    state.hypeTrain.lastDiaryResult = { ok: true, skipped: true, reason: 'already_written_for_train', at: nowIso() };
    return state.hypeTrain.lastDiaryResult;
  }
  const recordTypes = Array.isArray(memory.recordTypes) ? memory.recordTypes : [];
  const recordText = recordTypes.length
    ? replaceTextVars((cfg.texts || {}).recordShort || DEFAULT_HYPETRAIN_CONFIG.texts.recordShort, { recordTypes: recordTypes.join(', ') })
    : 'Kein neuer Rekord.';
  const message = replaceTextVars((cfg.texts || {}).trainEnded || DEFAULT_HYPETRAIN_CONFIG.texts.trainEnded, {
    level: hypeTrain.level,
    total: hypeTrain.total,
    progress: hypeTrain.progress,
    goal: hypeTrain.goal,
    oldLevel: memory.baselineAllTimeHighLevel || hypeTrain.allTimeHighLevel || 0,
    oldTotal: memory.baselineAllTimeHighTotal || hypeTrain.allTimeHighTotal || 0,
    recordText
  });
  try {
    const url = cleanString(cfg.endpoints && cfg.endpoints.tagebuchEntryUrl || 'http://127.0.0.1:8080/api/tagebuch/entry');
    const response = await axios.post(url, {
      message,
      system: true,
      systemUsername: cleanString(diaryCfg.systemUsername || 'CGN-HypeTrain'),
      authorDisplay: cleanString(diaryCfg.systemUsername || 'CGN-HypeTrain'),
      authorLogin: 'system'
    }, { timeout: 5000 });
    memory.diaryWritten = true;
    state.hypeTrain.counters.diaryWritten += 1;
    state.hypeTrain.lastDiaryResult = { ok: true, at: nowIso(), response: response && response.data ? response.data : {} };
    return state.hypeTrain.lastDiaryResult;
  } catch (err) {
    state.hypeTrain.counters.diaryFailed += 1;
    state.hypeTrain.lastDiaryResult = { ok: false, at: nowIso(), error: err && err.message ? err.message : String(err) };
    state.hypeTrain.lastError = state.hypeTrain.lastDiaryResult.error;
    return state.hypeTrain.lastDiaryResult;
  }
}

function buildHypeTrainRecordPayload(hypeTrain, memory, recordTypes) {
  return {
    source: 'internal',
    eventSubType: 'internal.hypetrain.record_broken',
    broadcaster: cloneJson(memory.lastPayload && memory.lastPayload.broadcaster || {}, {}),
    hypeTrain: cloneJson(hypeTrain, {}),
    recordTypes: recordTypes.slice(),
    oldRecord: {
      level: numberOrZero(memory.baselineAllTimeHighLevel || hypeTrain.allTimeHighLevel || 0),
      total: numberOrZero(memory.baselineAllTimeHighTotal || hypeTrain.allTimeHighTotal || 0)
    },
    newRecord: {
      level: numberOrZero(hypeTrain.level || 0),
      total: numberOrZero(hypeTrain.total || 0)
    },
    brokenAt: nowIso()
  };
}

function processHypeTrainEvent(eventKey, payload = {}) {
  if (!String(eventKey || '').startsWith('twitch.hypetrain.')) return { ok: true, skipped: true, reason: 'not_hypetrain' };
  const cfg = getHypeTrainConfig();
  const hypeTrain = normalizeHypeTrain(payload.hypeTrain || payload);
  const memory = getHypeTrainMemory(hypeTrain.id);
  memory.lastPayload = cloneJson(payload, {});
  memory.maxLevel = Math.max(numberOrZero(memory.maxLevel), hypeTrain.level);
  memory.maxTotal = Math.max(numberOrZero(memory.maxTotal), hypeTrain.total);

  if (eventKey === 'twitch.hypetrain.started') {
    state.hypeTrain.counters.started += 1;
    memory.startedAt = hypeTrain.startedAt || nowIso();
    memory.baselineAllTimeHighLevel = hypeTrain.allTimeHighLevel || memory.baselineAllTimeHighLevel || 0;
    memory.baselineAllTimeHighTotal = hypeTrain.allTimeHighTotal || memory.baselineAllTimeHighTotal || 0;
    state.hypeTrain.current = cloneJson(hypeTrain, {});
    rememberHypeTrainRecent('started', hypeTrain);
    pruneHypeTrainMemory();
    return { ok: true, action: 'started', hypeTrainId: hypeTrain.id };
  }

  if (!memory.baselineAllTimeHighLevel && hypeTrain.allTimeHighLevel) memory.baselineAllTimeHighLevel = hypeTrain.allTimeHighLevel;
  if (!memory.baselineAllTimeHighTotal && hypeTrain.allTimeHighTotal) memory.baselineAllTimeHighTotal = hypeTrain.allTimeHighTotal;

  if (eventKey === 'twitch.hypetrain.progress') {
    state.hypeTrain.counters.progress += 1;
    memory.lastProgressAt = nowIso();
    state.hypeTrain.current = cloneJson(hypeTrain, {});
    rememberHypeTrainRecent('progress', hypeTrain);
    const detected = detectHypeTrainRecord(memory, hypeTrain, cfg);
    if (detected.broken) {
      if (detected.types.includes('total')) {
        memory.totalRecordBroken = true;
        state.hypeTrain.counters.totalRecordBroken += 1;
      }
      if (detected.types.includes('level')) {
        memory.levelRecordBroken = true;
        state.hypeTrain.counters.levelRecordBroken += 1;
      }
      memory.recordBroken = true;
      memory.recordTypes = Array.from(new Set([...(memory.recordTypes || []), ...detected.types]));
      state.hypeTrain.counters.recordBroken += 1;
      state.hypeTrain.lastRecordBrokenAt = nowIso();
      const recordPayload = buildHypeTrainRecordPayload(hypeTrain, memory, detected.types);
      state.hypeTrain.recordBrokenEvents.unshift({ at: recordPayload.brokenAt, recordTypes: detected.types, hypeTrain: cloneJson(hypeTrain, {}) });
      state.hypeTrain.recordBrokenEvents = state.hypeTrain.recordBrokenEvents.slice(0, 20);
      publishTwitchEvent('twitch.hypetrain.record_broken', recordPayload, { source: 'twitch_events', originModule: MODULE_NAME }, { priority: 'P1', target: DEFAULT_TARGET });
      if (!memory.soundTriggered) {
        memory.soundTriggered = true;
        triggerHypeTrainRecordSound(recordPayload, cfg).catch(err => {
          state.hypeTrain.counters.soundFailed += 1;
          state.hypeTrain.lastError = err && err.message ? err.message : String(err);
        });
      }
      return { ok: true, action: 'record_broken', hypeTrainId: hypeTrain.id, recordTypes: detected.types };
    }
    return { ok: true, action: 'progress', hypeTrainId: hypeTrain.id };
  }

  if (eventKey === 'twitch.hypetrain.ended') {
    state.hypeTrain.counters.ended += 1;
    state.hypeTrain.lastEndedAt = nowIso();
    memory.endedAt = hypeTrain.endedAt || nowIso();
    state.hypeTrain.current = null;
    rememberHypeTrainRecent('ended', hypeTrain);
    writeHypeTrainDiaryEntry(hypeTrain, memory, cfg).catch(err => {
      state.hypeTrain.counters.diaryFailed += 1;
      state.hypeTrain.lastError = err && err.message ? err.message : String(err);
    });
    pruneHypeTrainMemory();
    return { ok: true, action: 'ended', hypeTrainId: hypeTrain.id };
  }

  return { ok: true, skipped: true, reason: 'unsupported_hypetrain_action', eventKey };
}

function getHypeTrainRuntimeStatus() {
  return {
    ok: !state.hypeTrain.lastError,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    configPath: runtimeConfigPath || resolveHypeTrainConfigPath(),
    config: publicHypeTrainConfig(),
    current: cloneJson(state.hypeTrain.current, null),
    recent: cloneJson(state.hypeTrain.recent, []),
    recordBrokenEvents: cloneJson(state.hypeTrain.recordBrokenEvents, []),
    counters: cloneJson(state.hypeTrain.counters, {}),
    lastRecordBrokenAt: state.hypeTrain.lastRecordBrokenAt,
    lastEndedAt: state.hypeTrain.lastEndedAt,
    lastSoundResult: cloneJson(state.hypeTrain.lastSoundResult, null),
    lastDiaryResult: cloneJson(state.hypeTrain.lastDiaryResult, null),
    lastError: state.hypeTrain.lastError,
    updatedAt: nowIso()
  };
}

function buildSyntheticHypeTrainEvent(type, body = {}) {
  const now = nowIso();
  const id = cleanString(firstValue(body.id, body.hypeTrainId, `test_hypetrain_${Date.now()}`));
  const level = Number(firstValue(body.level, type === 'channel.hype_train.begin' ? 1 : 6)) || 1;
  const total = Number(firstValue(body.total, type === 'channel.hype_train.begin' ? 100 : 1500)) || 0;
  const allTimeHighLevel = Number(firstValue(body.allTimeHighLevel, body.all_time_high_level, 5)) || 0;
  const allTimeHighTotal = Number(firstValue(body.allTimeHighTotal, body.all_time_high_total, 1000)) || 0;
  return {
    metadata: { message_id: `synthetic_${Date.now()}`, message_timestamp: now, message_type: 'notification' },
    subscription: { id: `synthetic_${type}`, type, version: '1', condition: {} },
    event: {
      id,
      broadcaster_user_id: cleanString(body.broadcasterUserId || 'synthetic_broadcaster'),
      broadcaster_user_login: cleanString(body.broadcasterLogin || 'forrestcgn'),
      broadcaster_user_name: cleanString(body.broadcasterName || 'ForrestCGN'),
      level,
      total,
      progress: Number(firstValue(body.progress, total)) || 0,
      goal: Number(firstValue(body.goal, 2000)) || 0,
      all_time_high_level: allTimeHighLevel,
      all_time_high_total: allTimeHighTotal,
      started_at: cleanString(body.startedAt || now),
      expires_at: cleanString(body.expiresAt || new Date(Date.now() + 300000).toISOString()),
      ended_at: type === 'channel.hype_train.end' ? cleanString(body.endedAt || now) : undefined,
      cooldown_ends_at: type === 'channel.hype_train.end' ? cleanString(body.cooldownEndsAt || new Date(Date.now() + 3600000).toISOString()) : undefined,
      top_contributions: Array.isArray(body.topContributions) ? body.topContributions : []
    }
  };
}

function runHypeTrainSyntheticTest(body = {}, query = {}) {
  const merged = { ...(query && isPlainObjectLocal(query) ? query : {}), ...(body && isPlainObjectLocal(body) ? body : {}) };
  const confirm = cleanString(firstValue(merged.confirm, merged.confirmed, ''));
  if (confirm !== '1' && confirm.toLowerCase() !== 'true') {
    return { ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, error: 'confirm_required', hint: 'POST /api/twitch/events/hypetrain/test?confirm=1' };
  }
  const trainId = cleanString(firstValue(merged.id, merged.hypeTrainId, `test_hypetrain_${Date.now()}`));
  const begin = handleEventSubNotification({ payload: buildSyntheticHypeTrainEvent('channel.hype_train.begin', { ...merged, id: trainId, level: Number(merged.oldLevel || merged.allTimeHighLevel || 5), total: Number(merged.oldTotal || merged.allTimeHighTotal || 1000) }) }, { source: 'synthetic_hypetrain_test' }, { target: DEFAULT_TARGET });
  const progress = handleEventSubNotification({ payload: buildSyntheticHypeTrainEvent('channel.hype_train.progress', { ...merged, id: trainId }) }, { source: 'synthetic_hypetrain_test' }, { target: DEFAULT_TARGET });
  const end = handleEventSubNotification({ payload: buildSyntheticHypeTrainEvent('channel.hype_train.end', { ...merged, id: trainId }) }, { source: 'synthetic_hypetrain_test' }, { target: DEFAULT_TARGET });
  return { ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, moduleBuild: MODULE_BUILD, test: { begin, progress, end }, hypetrain: getHypeTrainRuntimeStatus() };
}


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
    step: 'BUS-TWITCH.10',
    mode: 'guarded-autostart-runtime',
    enabled: state.eventSubChat.enabled === true,
    autostart: state.eventSubChat.autostart === true,
    autostartEvaluated: state.eventSubChat.autostartEvaluated === true,
    lastAutostartAt: state.eventSubChat.lastAutostartAt,
    lastAutostartResult: state.eventSubChat.lastAutostartResult,
    active: state.eventSubChat.active === true,
    connecting: state.eventSubChat.connecting === true,
    duplicateProtectionEnabled: state.eventSubChat.duplicateProtectionEnabled === true,
    currentLiveChatSource: state.eventSubChat.active ? 'twitch_events EventSub channel.chat.message + twitch_presence/irc parallel' : 'twitch_presence/irc parallel bridge',
    targetLiveChatSource: 'twitch_events EventSub channel.chat.message',
    routes: {
      start: '/api/twitch/events/eventsub/chat/start',
      stop: '/api/twitch/events/eventsub/chat/stop',
      restart: '/api/twitch/events/eventsub/chat/restart',
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

function streamStateConfig() {
  const env = state.env || process.env || {};
  return {
    enabled: boolEnv('TWITCH_EVENTS_STREAM_STATE_PROVIDER_ENABLED', true),
    sourceUrl: cleanString(env.TWITCH_EVENTS_STREAM_STATE_SOURCE_URL || 'http://127.0.0.1:8080/api/live-status-monitor/status?raw=1'),
    fallbackUrl: cleanString(env.TWITCH_EVENTS_STREAM_STATE_FALLBACK_URL || 'http://127.0.0.1:8080/api/stream-status/status?forceApi=1'),
    pollIntervalMs: Math.max(5000, Number(env.TWITCH_EVENTS_STREAM_STATE_POLL_MS || 30000) || 30000),
    requestTimeoutMs: Math.max(1000, Number(env.TWITCH_EVENTS_STREAM_STATE_TIMEOUT_MS || 5000) || 5000),
    overrideDefaultTtlMs: Math.max(0, Number(env.TWITCH_EVENTS_STREAM_STATE_OVERRIDE_TTL_MS || 600000) || 600000),
    pendingConfirmMs: Math.max(10000, Number(env.TWITCH_EVENTS_STREAM_SESSION_PENDING_CONFIRM_MS || 60000) || 60000),
    pendingWarningMs: Math.max(30000, Number(env.TWITCH_EVENTS_STREAM_SESSION_PENDING_WARNING_MS || 300000) || 300000),
    reconnectGraceMs: Math.max(60000, Number(env.TWITCH_EVENTS_STREAM_SESSION_RECONNECT_GRACE_MS || 2700000) || 2700000),
    endingGraceMs: Math.max(10000, Number(env.TWITCH_EVENTS_STREAM_SESSION_ENDING_GRACE_MS || 120000) || 120000),
    bandwidthTestKeys: cleanString(env.TWITCH_EVENTS_STREAM_SESSION_BANDWIDTH_KEYS || 'bwtest,bandwidthtest,bandwidthTest,bandwidth_test,testBandwidth,enableBandwidthTest')
      .split(/[;,]/).map(v => v.trim()).filter(Boolean)
  };
}

function parseLiveOverrideValue(value) {
  if (value === true || value === false) return value;
  const raw = String(value ?? '').trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'online', 'live'].includes(raw)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'offline'].includes(raw)) return false;
  return null;
}

function isManualOverrideActive() {
  const override = state.streamState.manualOverride || {};
  if (override.active !== true) return false;
  const expiresMs = Date.parse(String(override.expiresAt || ''));
  if (Number.isFinite(expiresMs) && expiresMs > 0 && expiresMs <= Date.now()) {
    override.active = false;
    state.streamState.manualOverride = override;
    return false;
  }
  return true;
}

function publicManualOverride() {
  const override = state.streamState.manualOverride || {};
  return {
    active: override.active === true,
    live: override.live === true,
    setAt: cleanString(override.setAt || ''),
    expiresAt: cleanString(override.expiresAt || ''),
    reason: cleanString(override.reason || ''),
    source: cleanString(override.source || 'manual_override'),
    status: cleanString(override.status || ''),
    forceConfirmed: override.forceConfirmed === true,
    streamId: cleanString(override.streamId || '')
  };
}

function getStreamState() {
  const cfg = streamStateConfig();
  return {
    schemaVersion: 1,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    moduleBuild: MODULE_BUILD,
    enabled: cfg.enabled === true,
    provider: state.streamState.provider,
    sourceUrl: state.streamState.sourceUrl || cfg.sourceUrl,
    fallbackUrl: state.streamState.fallbackUrl || cfg.fallbackUrl,
    pollIntervalMs: state.streamState.pollIntervalMs || cfg.pollIntervalMs,
    initialized: state.streamState.initialized === true,
    known: state.streamState.known === true,
    live: state.streamState.live === true,
    status: state.streamState.status || state.streamState.sessionStatus || 'offline',
    previousLive: state.streamState.previousLive,
    source: state.streamState.source,
    sourceSummary: state.streamState.sourceSummary,
    confidence: state.streamState.confidence,
    eventSubRequired: false,
    broadcasterLogin: state.streamState.broadcasterLogin,
    streamId: state.streamState.streamId,
    startedAt: state.streamState.startedAt,
    title: state.streamState.title,
    gameName: state.streamState.gameName,
    viewerCount: state.streamState.viewerCount,
    streamSessionId: state.streamState.streamSessionId,
    streamDayId: state.streamState.streamDayId,
    sessionStatus: state.streamState.sessionStatus,
    restartGraceUntil: state.streamState.restartGraceUntil,
    calendarDay: state.streamState.calendarDay || '',
    streamDateLabel: state.streamState.streamDateLabel || '',
    streamDayMode: state.streamState.streamDayMode || 'stream_session',
    streamSession: safeJson(state.streamState.streamSession, {}),
    sources: {
      obsStreaming: state.streamState.obsStreaming === true,
      twitchStreamsLive: state.streamState.twitchStreamsLive === true,
      twitchSearchLive: state.streamState.twitchSearchLive === true,
      streamStatusLive: state.streamState.streamStatusLive === true,
      eventSubLive: state.streamState.eventSubLive
    },
    lastCheckedAt: state.streamState.lastCheckedAt,
    lastChangedAt: state.streamState.lastChangedAt,
    lastPublishedAt: state.streamState.lastPublishedAt,
    lastEventKey: state.streamState.lastEventKey,
    lastEventId: state.streamState.lastEventId,
    lastAction: state.streamState.lastAction,
    lastReason: state.streamState.lastReason,
    lastRefreshReason: state.streamState.lastRefreshReason,
    lastError: state.streamState.lastError,
    warnings: Array.isArray(state.streamState.warnings) ? state.streamState.warnings : [],
    manualOverride: publicManualOverride(),
    counters: safeJson(state.streamState.counters, {}),
    routes: {
      status: '/api/twitch/events/stream-state',
      refresh: '/api/twitch/events/stream-state?refresh=1',
      override: '/api/twitch/events/stream-state/override',
      clearOverride: '/api/twitch/events/stream-state/clear-override',
      streamSession: '/api/twitch/events/stream-session'
    }
  };
}

function responseData(response) {
  return response && response.data && typeof response.data === 'object' ? response.data : {};
}

async function fetchJsonForStreamState(url, timeoutMs) {
  const cleanUrl = cleanString(url || '');
  if (!cleanUrl) throw new Error('stream_state_url_missing');
  const response = await axios.get(cleanUrl, { timeout: Math.max(1000, Number(timeoutMs || 5000) || 5000) });
  return responseData(response);
}

function normalizeStreamStateFromMonitor(payload) {
  const d = payload && payload.decision ? payload.decision : {};
  const parsed = payload && payload.parsed ? payload.parsed : {};
  const sources = payload && payload.sources ? payload.sources : {};
  const streamStatusRaw = sources && sources.streamStatus && sources.streamStatus.data ? sources.streamStatus.data : {};
  const eventSubLive = d.eventSubLive || (parsed.eventSub && parsed.eventSub.live) || 'unknown';
  return {
    provider: 'live_status_monitor',
    known: payload && payload.ok === true,
    live: d.effectiveLive === true,
    source: 'live_status_monitor',
    sourceSummary: cleanString(d.sourceSummary || 'none'),
    confidence: cleanString(d.confidence || 'unknown'),
    broadcasterLogin: cleanString(payload && payload.broadcasterLogin || streamStatusRaw.broadcasterLogin || ''),
    streamId: cleanString(d.streamId || streamStatusRaw.streamId || ''),
    startedAt: cleanString(streamStatusRaw.startedAt || ''),
    title: cleanString(d.title || streamStatusRaw.title || ''),
    gameName: cleanString(d.gameName || streamStatusRaw.gameName || ''),
    viewerCount: Number(streamStatusRaw.viewerCount || 0) || 0,
    streamSessionId: cleanString(streamStatusRaw.streamSessionId || ''),
    streamDayId: cleanString(streamStatusRaw.streamDayId || ''),
    sessionStatus: cleanString(streamStatusRaw.sessionStatus || ''),
    restartGraceUntil: cleanString(streamStatusRaw.restartGraceUntil || ''),
    obsStreaming: d.obsStreaming === true,
    obsConnected: parsed.obs && parsed.obs.obsConnected === true,
    obsDetected: parsed.obs && parsed.obs.obsDetected === true,
    bandwidthTest: d.bandwidthTest === true || (parsed.obs && parsed.obs.bandwidthTest === true),
    bandwidthTestKey: cleanString(d.bandwidthTestKey || (parsed.obs && parsed.obs.bandwidthTestKey) || ''),
    twitchStreamsLive: d.twitchStreamsLive === true,
    twitchSearchLive: d.twitchSearchLive === true,
    streamStatusLive: d.streamStatusLive === true,
    eventSubLive,
    warnings: Array.isArray(d.warnings) ? d.warnings : [],
    lastCheckedAt: cleanString(payload && payload.checkedAt || nowIso())
  };
}

function normalizeStreamStateFromStreamStatus(payload) {
  return {
    provider: 'stream_status',
    known: payload && payload.statusKnown !== false,
    live: payload && payload.live === true,
    source: cleanString(payload && payload.source || 'stream_status'),
    sourceSummary: payload && payload.live === true ? 'stream_status' : 'none',
    confidence: payload && payload.statusKnown !== false ? 'high' : 'low',
    broadcasterLogin: cleanString(payload && payload.broadcasterLogin || ''),
    streamId: cleanString(payload && payload.streamId || ''),
    startedAt: cleanString(payload && payload.startedAt || ''),
    title: cleanString(payload && payload.title || ''),
    gameName: cleanString(payload && payload.gameName || ''),
    viewerCount: Number(payload && payload.viewerCount || 0) || 0,
    streamSessionId: cleanString(payload && payload.streamSessionId || ''),
    streamDayId: cleanString(payload && payload.streamDayId || ''),
    sessionStatus: cleanString(payload && payload.sessionStatus || ''),
    restartGraceUntil: cleanString(payload && payload.restartGraceUntil || ''),
    obsStreaming: false,
    obsConnected: false,
    obsDetected: false,
    bandwidthTest: false,
    bandwidthTestKey: '',
    twitchStreamsLive: payload && payload.live === true,
    twitchSearchLive: false,
    streamStatusLive: payload && payload.live === true,
    eventSubLive: 'unknown',
    warnings: payload && payload.lastError ? [{ key: 'stream_status_warning', message: payload.lastError }] : [],
    lastCheckedAt: cleanString(payload && payload.lastCheckedAt || nowIso())
  };
}

function applyManualOverride(normalized, reason = 'manual_override') {
  if (!isManualOverrideActive()) return normalized;
  const override = state.streamState.manualOverride || {};
  const cleanStatus = cleanString(override.status || '').toLowerCase();
  const forceConfirmed = override.forceConfirmed === true || (override.live === true && ['confirmed', 'live_confirmed', 'online_confirmed', 'twitch_confirmed', 'live'].includes(cleanStatus) && cleanString(override.streamId || ''));
  const now = nowIso();
  const manualStreamId = forceConfirmed
    ? cleanSessionToken(override.streamId || state.streamState.streamId || `manual_${streamSessionCompactId(override.setAt || now)}`, `manual_${streamSessionCompactId(override.setAt || now)}`)
    : cleanString(override.streamId || normalized.streamId || state.streamState.streamId || '');
  const manualStatus = cleanStatus || (forceConfirmed ? 'live' : (override.live === true ? 'pending' : 'offline'));
  const manualStartedAt = cleanString(state.streamState.startedAt || normalized.startedAt || override.setAt || now);
  return {
    ...normalized,
    provider: 'manual_override',
    known: true,
    live: forceConfirmed ? true : false,
    status: forceConfirmed ? 'live' : manualStatus,
    manualStatus: forceConfirmed ? 'live' : manualStatus,
    sessionStatus: forceConfirmed ? 'live' : manualStatus,
    source: 'manual_override',
    sourceSummary: forceConfirmed ? 'manual_override_confirmed' : 'manual_override',
    confidence: forceConfirmed ? 'manual_confirmed' : 'manual',
    streamId: forceConfirmed ? manualStreamId : manualStreamId,
    startedAt: manualStartedAt,
    obsStreaming: override.live === true,
    twitchStreamsLive: forceConfirmed,
    streamStatusLive: forceConfirmed,
    eventSubLive: forceConfirmed ? 'online' : (override.live === true ? 'online' : 'offline'),
    bandwidthTest: manualStatus === 'bandwidth_test',
    warnings: [
      ...(forceConfirmed ? [{ key: 'manual_confirmed_live_override', message: 'Dashboard/manual override marks the stream as confirmed live for tests.' }] : []),
      ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
      { key: 'manual_override_active', message: `Manual stream-state override active (${reason || override.reason || 'manual_override'}).` }
    ],
    lastCheckedAt: now
  };
}


function streamSessionCalendarDay(value) {
  const ms = Date.parse(String(value || ''));
  const d = Number.isFinite(ms) ? new Date(ms) : new Date();
  return d.toISOString().slice(0, 10);
}

function streamSessionCompactId(value) {
  const ms = Date.parse(String(value || '')) || Date.now();
  return new Date(ms).toISOString().replace(/[-:.]/g, '').replace(/Z$/, 'Z').toLowerCase();
}

function cleanSessionToken(value, fallback = 'manual') {
  const text = cleanString(value || fallback).replace(/[^a-zA-Z0-9_-]+/g, '').slice(0, 64);
  return text || fallback;
}

function makeAuthoritySessionIds(normalized, startedAt) {
  const broadcaster = cleanString(normalized.broadcasterLogin || state.streamState.broadcasterLogin || 'forrestcgn').toLowerCase() || 'stream';
  const streamId = cleanSessionToken(normalized.streamId || 'pending', 'pending');
  const stamp = streamSessionCompactId(startedAt);
  const sessionId = normalized.streamSessionId || `${broadcaster}_${stamp}_${streamId}`.toLowerCase();
  const dayId = normalized.streamDayId || `stream_${sessionId}`.toLowerCase();
  return { sessionId, dayId };
}

function publicStreamSession(session) {
  const s = session && typeof session === 'object' ? session : {};
  return {
    active: s.active === true,
    status: cleanString(s.status || 'offline'),
    streamSessionId: cleanString(s.streamSessionId || ''),
    streamDayId: cleanString(s.streamDayId || ''),
    calendarDay: cleanString(s.calendarDay || ''),
    streamDateLabel: cleanString(s.streamDateLabel || ''),
    startedAt: cleanString(s.startedAt || ''),
    confirmedAt: cleanString(s.confirmedAt || ''),
    lastSeenAt: cleanString(s.lastSeenAt || ''),
    graceStartedAt: cleanString(s.graceStartedAt || ''),
    graceUntil: cleanString(s.graceUntil || ''),
    endedAt: cleanString(s.endedAt || ''),
    closedAt: cleanString(s.closedAt || ''),
    closedReason: cleanString(s.closedReason || ''),
    source: cleanString(s.source || ''),
    confidence: cleanString(s.confidence || 'unknown'),
    twitchStreamId: cleanString(s.twitchStreamId || ''),
    obsStarted: s.obsStarted === true,
    twitchConfirmed: s.twitchConfirmed === true,
    bandwidthTest: s.bandwidthTest === true,
    pendingWarningAt: cleanString(s.pendingWarningAt || ''),
    meta: safeJson(s.meta, {})
  };
}

function makeOfflineStreamSession(now = nowIso()) {
  return {
    active: false,
    status: 'offline',
    streamSessionId: '',
    streamDayId: '',
    calendarDay: '',
    streamDateLabel: '',
    startedAt: '',
    confirmedAt: '',
    lastSeenAt: now,
    graceStartedAt: '',
    graceUntil: '',
    endedAt: '',
    closedAt: '',
    closedReason: '',
    source: '',
    confidence: 'unknown',
    twitchStreamId: '',
    obsStarted: false,
    twitchConfirmed: false,
    bandwidthTest: false,
    pendingWarningAt: '',
    meta: {}
  };
}

function isBandwidthTestState(normalized) {
  return !!(normalized && (normalized.bandwidthTest === true || cleanString(normalized.sessionStatus || normalized.status || '').toLowerCase() === 'bandwidth_test'));
}

function isPendingLikeStreamStatus(normalized) {
  const status = cleanString(normalized && (normalized.sessionStatus || normalized.status || normalized.manualStatus || '')).toLowerCase();
  return ['pending', 'pending_warning', 'starting', 'reconnect', 'ending', 'grace', 'closed', 'offline', 'bandwidth_test'].includes(status);
}

function hasPublishedOnlineStreamState() {
  return state.streamState && (state.streamState.lastAction === 'online' || state.streamState.lastEventKey === 'twitch.stream.online');
}

function shouldPublishStreamStateTransition(normalized, previousKnown, previousLive, changed, options = {}) {
  if (isBandwidthTestState(normalized) && previousLive !== true && !hasPublishedOnlineStreamState()) return false;
  if (!normalized || normalized.live !== true) {
    if (isPendingLikeStreamStatus(normalized) && previousLive !== true && !hasPublishedOnlineStreamState()) return false;
    if (previousLive !== true && !hasPublishedOnlineStreamState()) return false;
  }
  return changed || options.forcePublish === true;
}

function isAuthoritySessionActive(session) {
  return !!(session && session.active === true && ['pending', 'pending_warning', 'live', 'degraded', 'grace', 'reconnect', 'ending'].includes(String(session.status || '')));
}

function hasTwitchLiveConfirmation(normalized) {
  return !!(normalized && (normalized.twitchStreamsLive === true || normalized.twitchSearchLive === true || normalized.streamStatusLive === true || cleanString(normalized.streamId || '')));
}

function detectBandwidthTest(normalized, cfg) {
  if (!normalized || typeof normalized !== 'object') return { detected: false, key: '' };
  if (normalized.bandwidthTest === true) return { detected: true, key: cleanString(normalized.bandwidthTestKey || 'bandwidthTest') };
  const keys = Array.isArray(cfg && cfg.bandwidthTestKeys) ? cfg.bandwidthTestKeys : [];
  const candidates = [normalized, normalized.obs || {}, normalized.streamServiceSettings || {}, normalized.serviceSettings || {}];
  for (const obj of candidates) {
    if (!obj || typeof obj !== 'object') continue;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === '1') {
          return { detected: true, key };
        }
      }
    }
  }
  return { detected: false, key: '' };
}

function publishStreamSessionEvent(action, session, normalized, reason = '') {
  if (!bus || typeof publishTwitchEvent !== 'function') return { ok: false, reason: 'bus_unavailable' };
  const cleanAction = cleanString(action || 'updated');
  const eventKey = `twitch.stream.session.${cleanAction}`;
  const publicSession = publicStreamSession(session);
  const payload = {
    eventKey,
    action: cleanAction,
    reason: cleanString(reason || cleanAction),
    live: normalized && normalized.live === true,
    status: publicSession.status,
    streamSessionId: publicSession.streamSessionId,
    streamDayId: publicSession.streamDayId,
    calendarDay: publicSession.calendarDay,
    streamDateLabel: publicSession.streamDateLabel,
    startedAt: publicSession.startedAt,
    confirmedAt: publicSession.confirmedAt,
    endedAt: publicSession.endedAt,
    graceUntil: publicSession.graceUntil,
    broadcasterLogin: normalized && normalized.broadcasterLogin || state.streamState.broadcasterLogin || '',
    streamId: normalized && normalized.streamId || publicSession.twitchStreamId || '',
    title: normalized && normalized.title || '',
    gameName: normalized && normalized.gameName || '',
    source: normalized && normalized.source || '',
    sourceSummary: normalized && normalized.sourceSummary || '',
    confidence: normalized && normalized.confidence || publicSession.confidence || '',
    obsStreaming: normalized && normalized.obsStreaming === true,
    obsConnected: normalized && normalized.obsConnected === true,
    twitchConfirmed: publicSession.twitchConfirmed === true,
    bandwidthTest: publicSession.bandwidthTest === true,
    eventSubRequired: false,
    generatedBy: MODULE_NAME,
    provider: 'stream_session_authority',
    streamSession: publicSession,
    warnings: normalized && Array.isArray(normalized.warnings) ? normalized.warnings : [],
    receivedAt: normalized && normalized.lastCheckedAt || nowIso()
  };
  const result = publishTwitchEvent(eventKey, payload, { source: 'twitch_events_stream_session', receivedAt: payload.receivedAt }, {
    requireAck: false,
    replayable: true,
    ttlMs: 3600000,
    priority: 'P1',
    target: { type: 'all', id: '*' }
  });
  if (cleanAction === 'started') state.streamState.counters.sessionStarted += 1;
  if (cleanAction === 'pending') state.streamState.counters.sessionPending += 1;
  if (cleanAction === 'confirmed') state.streamState.counters.sessionConfirmed += 1;
  if (cleanAction === 'grace' || cleanAction === 'reconnect') state.streamState.counters.sessionGrace += 1;
  if (cleanAction === 'resumed') state.streamState.counters.sessionResumed += 1;
  if (cleanAction === 'ended') state.streamState.counters.sessionEnded += 1;
  if (cleanAction === 'warning') state.streamState.counters.sessionWarnings += 1;
  return result;
}

function applyStreamSessionAuthority(normalized, options = {}) {
  const cfg = streamStateConfig();
  const now = normalized.lastCheckedAt || nowIso();
  const nowMs = Date.parse(now) || Date.now();
  const manualStatus = cleanString(normalized.manualStatus || options.status || '').toLowerCase();
  const bandwidth = manualStatus === 'bandwidth_test' ? { detected: true, key: 'manual_status' } : detectBandwidthTest(normalized, cfg);
  const twitchConfirmed = hasTwitchLiveConfirmation(normalized);
  const obsStreaming = normalized.obsStreaming === true;
  const obsConnected = normalized.obsConnected === true;
  let session = publicStreamSession(state.streamState.streamSession);
  const oldSessionStatus = session.status || 'offline';
  let sessionEvent = '';
  let sessionEventReason = options.reason || 'stream_session_update';

  if (bandwidth.detected) {
    state.streamState.counters.bandwidthTestDetected += 1;
    normalized.live = false;
    normalized.bandwidthTest = true;
    normalized.sessionStatus = 'bandwidth_test';
    normalized.confidence = 'bandwidth_test';
    normalized.streamSessionId = '';
    normalized.streamDayId = '';
    normalized.warnings = [
      ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
      { key: 'obs_bandwidth_test', message: `OBS bandwidth test mode detected${bandwidth.key ? ` (${bandwidth.key})` : ''}. No stream session is opened.` }
    ];
    state.streamState.streamSession = { ...session, active: false, status: 'bandwidth_test', bandwidthTest: true, closedReason: 'bandwidth_test', lastSeenAt: now };
    return normalized;
  }

  if (!isAuthoritySessionActive(session)) {
    if (twitchConfirmed || obsStreaming) {
      const startedAt = normalized.startedAt || now;
      const ids = makeAuthoritySessionIds(normalized, startedAt);
      const status = twitchConfirmed ? 'live' : 'pending';
      session = {
        active: true,
        status,
        streamSessionId: ids.sessionId,
        streamDayId: ids.dayId,
        calendarDay: streamSessionCalendarDay(startedAt),
        streamDateLabel: streamSessionCalendarDay(startedAt),
        startedAt,
        confirmedAt: twitchConfirmed ? now : '',
        lastSeenAt: now,
        graceStartedAt: '',
        graceUntil: '',
        endedAt: '',
        closedAt: '',
        closedReason: '',
        source: twitchConfirmed ? 'twitch_confirmed' : 'obs_pending',
        confidence: twitchConfirmed ? 'high' : 'pending',
        twitchStreamId: normalized.streamId || '',
        obsStarted: obsStreaming === true,
        twitchConfirmed,
        bandwidthTest: false,
        pendingWarningAt: '',
        meta: { createdReason: sessionEventReason, createdBy: MODULE_NAME }
      };
      sessionEvent = 'started';
      normalized.live = twitchConfirmed === true;
      normalized.sessionStatus = status;
      if (!twitchConfirmed) {
        normalized.warnings = [
          ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
          { key: 'obs_online_twitch_pending', message: 'OBS is streaming, Twitch has not confirmed the stream yet.' }
        ];
      }
    } else {
      normalized.live = false;
      normalized.sessionStatus = 'offline';
      normalized.streamSessionId = '';
      normalized.streamDayId = '';
      state.streamState.streamSession = makeOfflineStreamSession(now);
      normalized.streamSession = publicStreamSession(state.streamState.streamSession);
      return normalized;
    }
  } else {
    const startedAt = session.startedAt || normalized.startedAt || now;
    if (twitchConfirmed) {
      const wasRecovering = ['pending', 'pending_warning', 'grace', 'reconnect', 'ending', 'degraded'].includes(session.status);
      const wasPending = ['pending', 'pending_warning'].includes(session.status);
      session.status = 'live';
      session.active = true;
      session.lastSeenAt = now;
      session.graceStartedAt = '';
      session.graceUntil = '';
      session.closedReason = '';
      session.source = 'twitch_confirmed';
      session.confidence = 'high';
      session.twitchStreamId = normalized.streamId || session.twitchStreamId || '';
      session.twitchConfirmed = true;
      session.obsStarted = session.obsStarted || obsStreaming === true;
      if (!session.confirmedAt) session.confirmedAt = now;
      normalized.live = true;
      normalized.sessionStatus = 'live';
      if (wasPending) sessionEvent = 'confirmed';
      else if (wasRecovering) sessionEvent = 'resumed';
    } else if (obsStreaming) {
      session.active = true;
      session.lastSeenAt = now;
      session.obsStarted = true;
      if (session.twitchConfirmed === true) {
        session.status = 'degraded';
        session.source = 'obs_protected_twitch_missing';
        session.confidence = 'medium';
        normalized.live = true;
        normalized.sessionStatus = 'degraded';
        normalized.warnings = [
          ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
          { key: 'twitch_missing_but_obs_streaming', message: 'Twitch is not confirming live, but OBS is still streaming. Keeping stream session alive.' }
        ];
        if (oldSessionStatus !== session.status) sessionEvent = 'warning';
      } else {
        const pendingAge = nowMs - (Date.parse(session.startedAt || startedAt) || nowMs);
        session.status = pendingAge >= cfg.pendingWarningMs ? 'pending_warning' : 'pending';
        session.source = 'obs_pending';
        session.confidence = pendingAge >= cfg.pendingWarningMs ? 'warning' : 'pending';
        session.pendingWarningAt = pendingAge >= cfg.pendingWarningMs ? (session.pendingWarningAt || now) : session.pendingWarningAt || '';
        normalized.live = false;
        normalized.sessionStatus = session.status;
        normalized.warnings = [
          ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
          { key: pendingAge >= cfg.pendingWarningMs ? 'obs_online_twitch_not_confirmed_timeout' : 'obs_online_twitch_pending', message: pendingAge >= cfg.pendingWarningMs ? 'OBS is streaming, but Twitch has not confirmed the stream within the warning window.' : 'OBS is streaming, Twitch has not confirmed the stream yet.' }
        ];
        if (oldSessionStatus !== session.status) sessionEvent = pendingAge >= cfg.pendingWarningMs ? 'warning' : 'pending';
      }
    } else {
      const graceMs = obsConnected ? cfg.endingGraceMs : cfg.reconnectGraceMs;
      const graceStatus = obsConnected ? 'ending' : 'reconnect';
      const graceReason = obsConnected ? 'obs_not_streaming_ending_grace' : 'obs_lost_or_twitch_offline_reconnect_grace';
      let graceUntilMs = Date.parse(session.graceUntil || '');
      if (!Number.isFinite(graceUntilMs) || graceUntilMs <= 0 || !['ending', 'reconnect', 'grace'].includes(session.status)) {
        session.graceStartedAt = now;
        session.graceUntil = new Date(nowMs + graceMs).toISOString();
        graceUntilMs = nowMs + graceMs;
        sessionEvent = obsConnected ? 'grace' : 'reconnect';
      }
      session.status = graceStatus;
      session.source = graceReason;
      session.confidence = 'grace';
      session.lastSeenAt = now;
      normalized.live = false;
      normalized.sessionStatus = graceStatus;
      normalized.restartGraceUntil = session.graceUntil;
      normalized.warnings = [
        ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
        { key: graceReason, message: obsConnected ? 'OBS is connected but not streaming. Waiting briefly before closing the stream session.' : 'OBS/Twitch is not confirming live. Keeping the stream session open during reconnect grace.' }
      ];
      if (graceUntilMs <= nowMs) {
        session.status = 'closed';
        session.active = false;
        session.endedAt = session.endedAt || now;
        session.closedAt = now;
        session.closedReason = obsConnected ? 'obs_stream_stopped_grace_expired' : 'reconnect_timeout';
        normalized.sessionStatus = 'closed';
        normalized.live = false;
        sessionEvent = 'ended';
      }
    }
    session.calendarDay = session.calendarDay || streamSessionCalendarDay(startedAt);
    session.streamDateLabel = session.streamDateLabel || streamSessionCalendarDay(startedAt);
  }

  normalized.streamSessionId = session.streamSessionId || '';
  normalized.streamDayId = session.streamDayId || '';
  normalized.startedAt = normalized.startedAt || session.startedAt || '';
  normalized.sessionStatus = normalized.sessionStatus || session.status || 'offline';
  normalized.restartGraceUntil = normalized.restartGraceUntil || session.graceUntil || '';
  normalized.calendarDay = streamSessionCalendarDay(now);
  normalized.streamDateLabel = session.streamDateLabel || '';
  normalized.streamSession = publicStreamSession(session);
  state.streamState.streamSession = publicStreamSession(session);

  if (sessionEvent) publishStreamSessionEvent(sessionEvent, session, normalized, sessionEventReason);
  return normalized;
}

function streamPayloadFromState(normalized, previousLive, action, reason) {
  return {
    eventKey: action === 'online' ? 'twitch.stream.online' : 'twitch.stream.offline',
    action,
    reason: cleanString(reason || 'stream_state_changed'),
    live: normalized.live === true,
    status: normalized.sessionStatus || normalized.status || (normalized.live === true ? 'live' : 'offline'),
    previousLive: previousLive === true,
    known: normalized.known === true,
    broadcasterLogin: normalized.broadcasterLogin || '',
    streamId: normalized.streamId || '',
    startedAt: normalized.startedAt || '',
    title: normalized.title || '',
    gameName: normalized.gameName || '',
    viewerCount: Number(normalized.viewerCount || 0) || 0,
    streamSessionId: normalized.streamSessionId || '',
    streamSession: normalized.streamSession || publicStreamSession(state.streamState.streamSession),
    streamDayId: normalized.streamDayId || '',
    sessionStatus: normalized.sessionStatus || '',
    calendarDay: normalized.calendarDay || streamSessionCalendarDay(normalized.lastCheckedAt || nowIso()),
    streamDateLabel: normalized.streamDateLabel || (normalized.streamSession && normalized.streamSession.streamDateLabel) || '',
    streamDayMode: 'stream_session',
    restartGraceUntil: normalized.restartGraceUntil || '',
    source: normalized.source || '',
    sourceSummary: normalized.sourceSummary || '',
    confidence: normalized.confidence || '',
    obsStreaming: normalized.obsStreaming === true,
    twitchStreamsLive: normalized.twitchStreamsLive === true,
    twitchSearchLive: normalized.twitchSearchLive === true,
    streamStatusLive: normalized.streamStatusLive === true,
    eventSubLive: normalized.eventSubLive || 'unknown',
    obsConnected: normalized.obsConnected === true,
    obsDetected: normalized.obsDetected === true,
    bandwidthTest: normalized.bandwidthTest === true,
    eventSubRequired: false,
    generatedBy: MODULE_NAME,
    provider: 'stream_state_provider',
    warnings: Array.isArray(normalized.warnings) ? normalized.warnings : [],
    receivedAt: normalized.lastCheckedAt || nowIso()
  };
}

function publishStreamStateTransition(normalized, previousLive, reason = 'stream_state_changed') {
  const action = normalized.live === true ? 'online' : 'offline';
  const eventKey = action === 'online' ? 'twitch.stream.online' : 'twitch.stream.offline';
  const payload = streamPayloadFromState(normalized, previousLive, action, reason);
  const result = publishTwitchEvent(eventKey, payload, { source: 'twitch_events_stream_state', receivedAt: payload.receivedAt }, {
    requireAck: false,
    replayable: true,
    ttlMs: 3600000,
    priority: 'P1',
    target: { type: 'all', id: '*' }
  });
  state.streamState.counters.transitions += 1;
  if (action === 'online') state.streamState.counters.onlineEmitted += 1;
  if (action === 'offline') state.streamState.counters.offlineEmitted += 1;
  state.streamState.lastPublishedAt = nowIso();
  state.streamState.lastEventKey = eventKey;
  state.streamState.lastEventId = result && result.busEventId ? result.busEventId : '';
  state.streamState.lastAction = action;
  state.streamState.lastReason = cleanString(reason || 'stream_state_changed');
  return result;
}

function updateStreamState(normalized, options = {}) {
  normalized = applyStreamSessionAuthority(normalized, options);
  const now = nowIso();
  const previousKnown = state.streamState.initialized === true && state.streamState.known === true;
  const previousLive = state.streamState.live === true;
  const changed = previousKnown && previousLive !== (normalized.live === true);
  state.streamState.initialized = true;
  state.streamState.known = normalized.known === true;
  state.streamState.previousLive = previousKnown ? previousLive : null;
  state.streamState.live = normalized.live === true;
  state.streamState.provider = normalized.provider || state.streamState.provider || 'stream_status';
  state.streamState.source = normalized.source || '';
  state.streamState.sourceSummary = normalized.sourceSummary || '';
  state.streamState.confidence = normalized.confidence || 'unknown';
  state.streamState.eventSubRequired = false;
  state.streamState.broadcasterLogin = normalized.broadcasterLogin || '';
  state.streamState.streamId = normalized.streamId || '';
  state.streamState.startedAt = normalized.startedAt || '';
  state.streamState.title = normalized.title || '';
  state.streamState.gameName = normalized.gameName || '';
  state.streamState.viewerCount = Number(normalized.viewerCount || 0) || 0;
  state.streamState.streamSessionId = normalized.streamSessionId || '';
  state.streamState.streamDayId = normalized.streamDayId || '';
  state.streamState.sessionStatus = normalized.sessionStatus || normalized.status || '';
  state.streamState.status = normalized.sessionStatus || normalized.status || (normalized.live === true ? 'live' : 'offline');
  state.streamState.calendarDay = normalized.calendarDay || streamSessionCalendarDay(now);
  state.streamState.streamDateLabel = normalized.streamDateLabel || (normalized.streamSession && normalized.streamSession.streamDateLabel) || '';
  state.streamState.streamDayMode = 'stream_session';
  if (normalized.streamSession) state.streamState.streamSession = publicStreamSession(normalized.streamSession);
  state.streamState.restartGraceUntil = normalized.restartGraceUntil || '';
  state.streamState.obsStreaming = normalized.obsStreaming === true;
  state.streamState.twitchStreamsLive = normalized.twitchStreamsLive === true;
  state.streamState.twitchSearchLive = normalized.twitchSearchLive === true;
  state.streamState.streamStatusLive = normalized.streamStatusLive === true;
  state.streamState.eventSubLive = normalized.eventSubLive || 'unknown';
  state.streamState.lastCheckedAt = normalized.lastCheckedAt || now;
  state.streamState.lastRefreshReason = cleanString(options.reason || 'refresh');
  state.streamState.lastError = '';
  state.streamState.warnings = Array.isArray(normalized.warnings) ? normalized.warnings : [];
  if (changed) state.streamState.lastChangedAt = now;
  if (shouldPublishStreamStateTransition(normalized, previousKnown, previousLive, changed, options)) {
    publishStreamStateTransition(normalized, previousKnown ? previousLive : !normalized.live, options.reason || (changed ? 'live_state_changed' : 'manual_publish'));
  }
  state.updatedAt = nowIso();
  return getStreamState();
}

async function readStreamStateSource(cfg) {
  try {
    const monitorPayload = await fetchJsonForStreamState(cfg.sourceUrl, cfg.requestTimeoutMs);
    const normalized = normalizeStreamStateFromMonitor(monitorPayload);
    state.streamState.provider = 'live_status_monitor';
    state.streamState.sourceUrl = cfg.sourceUrl;
    return normalized;
  } catch (err) {
    state.streamState.lastError = err && err.message ? err.message : String(err);
    const fallbackPayload = await fetchJsonForStreamState(cfg.fallbackUrl, cfg.requestTimeoutMs);
    const normalized = normalizeStreamStateFromStreamStatus(fallbackPayload);
    normalized.warnings = [
      ...(Array.isArray(normalized.warnings) ? normalized.warnings : []),
      { key: 'live_status_monitor_fallback', message: state.streamState.lastError }
    ];
    state.streamState.provider = 'stream_status_fallback';
    state.streamState.fallbackUrl = cfg.fallbackUrl;
    return normalized;
  }
}

async function refreshStreamState(options = {}) {
  const cfg = streamStateConfig();
  state.streamState.enabled = cfg.enabled === true;
  state.streamState.pollIntervalMs = cfg.pollIntervalMs;
  state.streamState.sourceUrl = cfg.sourceUrl;
  state.streamState.fallbackUrl = cfg.fallbackUrl;
  if (!cfg.enabled) return getStreamState();
  try {
    let normalized = await readStreamStateSource(cfg);
    normalized = applyManualOverride(normalized, options.reason || 'refresh');
    state.streamState.counters.refreshes += 1;
    return updateStreamState(normalized, options);
  } catch (err) {
    state.streamState.counters.errors += 1;
    state.streamState.lastError = err && err.message ? err.message : String(err);
    state.updatedAt = nowIso();
    return getStreamState();
  }
}

function startStreamStateProvider() {
  const cfg = streamStateConfig();
  state.streamState.enabled = cfg.enabled === true;
  state.streamState.pollIntervalMs = cfg.pollIntervalMs;
  state.streamState.sourceUrl = cfg.sourceUrl;
  state.streamState.fallbackUrl = cfg.fallbackUrl;
  if (!cfg.enabled) return;
  refreshStreamState({ reason: 'provider_start', forcePublish: false }).catch(err => { state.streamState.lastError = err && err.message ? err.message : String(err); });
  streamStateTimer = setInterval(() => {
    refreshStreamState({ reason: 'provider_interval', forcePublish: false }).catch(err => { state.streamState.lastError = err && err.message ? err.message : String(err); });
  }, cfg.pollIntervalMs);
  if (streamStateTimer && typeof streamStateTimer.unref === 'function') streamStateTimer.unref();
}

async function setStreamStateOverride(live, options = {}) {
  const cfg = streamStateConfig();
  const ttlMs = Math.max(0, Number(options.ttlMs || cfg.overrideDefaultTtlMs || 600000) || 600000);
  const now = nowIso();
  const requestedStatus = cleanString(options.status || '');
  const requestedStatusLower = requestedStatus.toLowerCase();
  const forceConfirmed = live === true && (
    options.forceConfirmed === true ||
    options.confirmed === true ||
    ['confirmed', 'live_confirmed', 'online_confirmed', 'twitch_confirmed'].includes(requestedStatusLower)
  );
  const manualStreamId = forceConfirmed
    ? cleanSessionToken(options.streamId || state.streamState.streamId || `manual_${streamSessionCompactId(now)}`, `manual_${streamSessionCompactId(now)}`)
    : cleanString(options.streamId || '');

  state.streamState.manualOverride = {
    active: true,
    live: live === true,
    setAt: now,
    expiresAt: ttlMs > 0 ? new Date(Date.now() + ttlMs).toISOString() : '',
    reason: cleanString(options.reason || 'manual_override'),
    source: 'manual_override',
    status: requestedStatus,
    forceConfirmed,
    streamId: manualStreamId
  };
  state.streamState.counters.overrideSet += 1;
  const normalized = applyManualOverride({
    provider: 'manual_override',
    known: true,
    live: live === true,
    source: 'manual_override',
    sourceSummary: forceConfirmed ? 'manual_override_confirmed' : 'manual_override',
    confidence: forceConfirmed ? 'manual_confirmed' : 'manual',
    broadcasterLogin: state.streamState.broadcasterLogin || '',
    streamId: forceConfirmed ? manualStreamId : (state.streamState.streamId || ''),
    startedAt: state.streamState.startedAt || now,
    title: state.streamState.title || '',
    gameName: state.streamState.gameName || '',
    viewerCount: state.streamState.viewerCount || 0,
    streamSessionId: state.streamState.streamSessionId || '',
    streamDayId: state.streamState.streamDayId || '',
    sessionStatus: forceConfirmed ? 'live' : (state.streamState.sessionStatus || ''),
    restartGraceUntil: state.streamState.restartGraceUntil || '',
    obsStreaming: live === true,
    twitchStreamsLive: forceConfirmed,
    twitchSearchLive: false,
    streamStatusLive: forceConfirmed,
    eventSubLive: live === true ? 'online' : 'offline',
    manualStatus: forceConfirmed ? 'live' : requestedStatus,
    bandwidthTest: requestedStatusLower === 'bandwidth_test',
    warnings: forceConfirmed ? [{ key: 'manual_confirmed_live_override', message: 'Dashboard/manual override marks the stream as confirmed live for tests.' }] : [],
    lastCheckedAt: now
  }, options.reason || 'manual_override');
  return updateStreamState(normalized, { reason: options.reason || 'manual_override', status: forceConfirmed ? 'live' : requestedStatus, forcePublish: true });
}

async function clearStreamStateOverride(options = {}) {
  state.streamState.manualOverride.active = false;
  state.streamState.manualOverride.live = false;
  state.streamState.manualOverride.setAt = '';
  state.streamState.manualOverride.expiresAt = '';
  state.streamState.manualOverride.reason = cleanString(options.reason || 'clear_override');
  const currentSession = state.streamState.streamSession || {};
  if (currentSession.bandwidthTest === true || cleanString(currentSession.status || '').toLowerCase() === 'bandwidth_test') {
    state.streamState.streamSession = makeOfflineStreamSession(nowIso());
    state.streamState.streamSessionId = '';
    state.streamState.streamDayId = '';
    state.streamState.sessionStatus = 'offline';
    state.streamState.status = 'offline';
    state.streamState.bandwidthTest = false;
    state.streamState.bandwidthTestKey = '';
  }
  state.streamState.counters.overrideCleared += 1;
  return refreshStreamState({ reason: options.reason || 'clear_override', forcePublish: false });
}

function startTimers() {
  stopTimers();
  state.heartbeatTimer = setInterval(sendHeartbeat, 5000);
  state.statusTimer = setInterval(() => publishStatus('interval'), 30000);
  startStreamStateProvider();
  if (state.heartbeatTimer && typeof state.heartbeatTimer.unref === 'function') state.heartbeatTimer.unref();
  if (state.statusTimer && typeof state.statusTimer.unref === 'function') state.statusTimer.unref();
}

function stopTimers() {
  if (state.heartbeatTimer) clearInterval(state.heartbeatTimer);
  if (state.statusTimer) clearInterval(state.statusTimer);
  if (streamStateTimer) clearInterval(streamStateTimer);
  state.heartbeatTimer = null;
  state.statusTimer = null;
  streamStateTimer = null;
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
    hypeTrain: getHypeTrainRuntimeStatus(),
    streamState: getStreamState(),
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
      hypeTrain: getHypeTrainRuntimeStatus(),
      streamState: getStreamState(),
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
      currentStep: 'STEP_HT1_HYPETRAIN_RECORD_SOUND_DASHBOARD',
      nextStep: 'Hype-Train im echten Stream testen: begin/progress/end, Rekord-Sound, Tagebuch-Eintrag.'
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
    state.eventSubChat.counters.ircPrivmsgReceived += 1;
    const user = normalizeIrcUser(parsed);
    const message = messageFromParsed(parsed);
    if (!user.login || !message) {
      state.eventSubChat.counters.ircChatMessagesSkipped += 1;
      return { ok: false, reason: 'invalid_privmsg', userLogin: user.login || '', hasMessage: Boolean(message) };
    }
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
    const result = publishTwitchEvent('twitch.chat.message', payload, { ...context, source: context.source || 'twitch_presence' }, options);
    if (result && result.ok === true) state.eventSubChat.counters.ircChatMessagesEmitted += 1;
    else state.eventSubChat.counters.ircChatMessagesSkipped += 1;
    return result;
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
        allTimeHighLevel: Number(firstValue(event.all_time_high_level, event.allTimeHighLevel, 0)) || 0,
        allTimeHighTotal: Number(firstValue(event.all_time_high_total, event.allTimeHighTotal, 0)) || 0,
        startedAt: cleanString(firstValue(event.started_at, event.startedAt)),
        expiresAt: cleanString(firstValue(event.expires_at, event.expiresAt)),
        endedAt: cleanString(firstValue(event.ended_at, event.endedAt)),
        cooldownEndsAt: cleanString(firstValue(event.cooldown_ends_at, event.cooldownEndsAt)),
        type: cleanString(firstValue(event.type, event.hype_train_type, event.hypeTrainType)),
        isSharedTrain: event.is_shared_train === true || event.isSharedTrain === true,
        topContributions: Array.isArray(event.top_contributions) ? safeJson(event.top_contributions, []) : (Array.isArray(event.topContributions) ? safeJson(event.topContributions, []) : [])
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

    if (eventKey.startsWith('twitch.hypetrain.')) {
      try {
        const hypeTrainResult = processHypeTrainEvent(eventKey, payload);
        result.hypeTrain = hypeTrainResult;
      } catch (err) {
        state.hypeTrain.counters.errors = Number(state.hypeTrain.counters.errors || 0) + 1;
        state.hypeTrain.lastError = err && err.message ? err.message : String(err);
        result.hypeTrain = { ok: false, error: state.hypeTrain.lastError };
      }
    }
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
