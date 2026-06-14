"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
const core = require("./helpers/helper_core");
const configHelper = require("./helpers/helper_config");
const textHelper = require("./helpers/helper_texts");
const database = require("../core/database");
const twitch = require("./twitch");
const twitchPresence = require("./twitch_presence");
const commands = require("./commands");
let communicationBus = null;
try { communicationBus = require("./communication_bus"); } catch (_) { communicationBus = null; }
let streamStatus = null;
try { streamStatus = require("./stream_status"); } catch (_) { streamStatus = null; }
let getSharedObs = null;
try { ({ getSharedObs } = require("./obs_shared")); } catch (_) { getSharedObs = null; }

const MODULE_NAME = "clip_shoutout";
const MODULE_VERSION = "0.2.46";
const SHOUTOUT_BUS_CHANNEL = "shoutout.system";
const CONFIG_FILE = "clip_system.json";
const API_PREFIX = "/api/clip-shoutout";
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: "runtime",
  legacy: false,
  routesPrefix: [API_PREFIX, "/api/clip/shoutout"],
  capabilities: ["shoutout.display_queue", "shoutout.official_queue", "shoutout.event_output", "twitch.chat.message", "twitch.chat.message.consumer"],
  bus: {
    emits: true,
    listens: ["twitch.chat.message"],
    registered: false,
    heartbeat: false,
    channel: SHOUTOUT_BUS_CHANNEL
  },
  note: "CAN-44.32: AutoShoutout stream-day reliability fix; stale active stream-days are closed, new Twitch stream IDs create new days, and stream-day diagnostics are exposed."
};

const AUTO_SHOUTOUT_TEXT_DEFAULTS = {
  'auto.greeting': [
    "📼 Die Heimleitung hat die VHS von @{displayName} gefunden. Der alte Beamer wird angeworfen.",
    "🎬 Im CGN-Altersheimkino läuft der Beamer von anno dazumal warm. Gleich auf der Leinwand: @{displayName}.",
    "🧓 Die Rentnercrew sitzt schon im Kinosaal. Die Heimaufsicht stellt noch das Bild von @{displayName} scharf.",
    "💿 Die DVD von @{displayName} wurde vorsichtig aus der Hülle genommen. Vorstellung beginnt gleich.",
    "📺 Programmänderung im CGN-Altersheim: @{displayName} kommt auf den großen Bildschirm."
]
};

const AUTO_SHOUTOUT_TEXT_OPTIONS = {
  defaultCategory: 'auto_shoutout',
  categories: {
    'auto.greeting': 'auto_shoutout'
  },
  categoryLabels: {
    auto_shoutout: 'AutoShoutout'
  },
  source: 'seed'
};


const SHOUTOUT_TEXT_DEFAULTS = {
  'shoutout.chat.accepted': [
    "📼 Die Heimleitung hat @{displayName} in den Sendeplan aufgenommen.",
    "🎬 @{displayName} wurde fürs CGN-Altersheimkino vorgemerkt.",
    "📺 Programmänderung bestätigt: @{displayName} kommt ins Heimkino.",
    "💿 Die DVD von @{displayName} liegt bereit. Die Vorstellung wird vorbereitet.",
    "🎞️ @{displayName} steht jetzt auf dem Kinoplan der Heimleitung."
],
  'shoutout.chat.waiting': [
    "⏳ @{displayName} steht im Sendeplan und wartet auf freie Leinwand.",
    "📼 Die VHS von @{displayName} liegt bereit, muss aber noch warten.",
    "🎬 @{displayName} wartet im Vorführraum des CGN-Altersheimkinos.",
    "📺 Der TV-Raum ist noch belegt. @{displayName} kommt gleich dran.",
    "💿 @{displayName} wurde eingelegt, aber der alte Beamer braucht noch einen Moment."
],
  'shoutout.chat.alreadyActive': [
    "📺 @{displayName} läuft gerade bereits im Shoutout."
],
  'shoutout.chat.alreadyWaiting': [
    "⏳ @{displayName} steht bereits in der SO-Liste. Position: {position}."
],
  'shoutout.chat.alreadyWaitingForce': [
    "⏳ @{displayName} steht bereits in der SO-Liste. Position: {position}."
],
  'shoutout.chat.failed': [
    "⚠️ Die Heimleitung meldet: Die Vorführung von @{displayName} konnte nicht gestartet werden.",
    "📼 Bandsalat! Der Shoutout für @{displayName} ist gerade hängen geblieben.",
    "🎬 Der alte Beamer streikt. @{displayName} konnte nicht gezeigt werden.",
    "📺 Die Heimaufsicht findet den richtigen Eingang nicht. @{displayName} startet gerade nicht.",
    "💿 Die DVD von @{displayName} wird nicht gelesen. Vorführung fehlgeschlagen."
],
  'shoutout.chat.duplicate': [
    "📼 @{displayName} lief heute schon im Altersheimkino. Wiederholung nur mit --force.",
    "🚨 Heimaufsicht sagt: @{displayName} war heute bereits im Programm. Extra-Vorführung nur mit --force.",
    "🎞️ Die Leinwand kennt @{displayName} heute schon. Wiederholung nur mit Sondergenehmigung: --force.",
    "📋 Im Sendeplan steht: @{displayName} hatte heute schon Ausstrahlung. Noch mal nur mit --force.",
    "📺 @{displayName} war heute schon auf dem großen Bildschirm. Für die Wiederholung bitte --force nutzen."
],
  'shoutout.auto.greeting': [
    "📼 Die Heimleitung hat die VHS von @{displayName} gefunden. Der alte Beamer wird angeworfen.",
    "🎬 Im CGN-Altersheimkino läuft der Beamer von anno dazumal warm. Gleich auf der Leinwand: @{displayName}.",
    "🧓 Die Rentnercrew sitzt schon im Kinosaal. Die Heimaufsicht stellt noch das Bild von @{displayName} scharf.",
    "💿 Die DVD von @{displayName} wurde vorsichtig aus der Hülle genommen. Vorstellung beginnt gleich.",
    "📺 Programmänderung im CGN-Altersheim: @{displayName} kommt auf den großen Bildschirm."
],
  'shoutout.auto.queued': [
    "📋 @{displayName} wurde in den Kinoplan eingetragen. Wartezeit: ca. {waitTime}.",
    "📼 Die VHS von @{displayName} liegt auf dem Wagen. Vorstellung in ca. {waitTime}.",
    "🎬 @{displayName} steht im Vorführplan. Der Beamer braucht noch ca. {waitTime}.",
    "📺 Der Fernsehraum wird vorbereitet. @{displayName} läuft in ca. {waitTime}.",
    "💿 Die DVD von @{displayName} ist vorgemerkt. Sendestart in ca. {waitTime}."
],
  'shoutout.auto.alreadyQueued': [
    "⏳ @{displayName} steht bereits im Kinoplan. Wartezeit: ca. {waitTime}.",
    "📋 Die Heimleitung hat @{displayName} schon auf der Liste. Noch ca. {waitTime}.",
    "📼 Die VHS von @{displayName} liegt bereits bereit. Vorstellung in ca. {waitTime}.",
    "🎬 @{displayName} wartet schon im Vorführraum. Der Beamer ist noch nicht frei.",
    "📺 @{displayName} ist schon fürs Heimkino vorgemerkt. Bitte im TV-Raum Platz nehmen."
],
  'shoutout.auto.alreadyReceived': [
    "✅ @{displayName} hatte heute schon eine Vorstellung im CGN-Altersheimkino.",
    "📼 Die VHS von @{displayName} wurde heute bereits abgespielt.",
    "🎬 @{displayName} lief heute schon auf der großen Leinwand.",
    "📺 @{displayName} war heute bereits im Altersheim-TV zu sehen.",
    "📋 Die Heimaufsicht bestätigt: @{displayName} steht heute schon als gezeigt im Sendeplan."
],
  'shoutout.auto.cooldown': [
    "⏳ Die Heimleitung sagt: @{displayName} muss noch ca. {waitTime} auf die nächste Ausstrahlung warten.",
    "📼 Die VHS von @{displayName} steckt noch im Rückspulmodus. Nächster Versuch in ca. {waitTime}.",
    "🎬 Der alte Beamer braucht Pause. @{displayName} kann in ca. {waitTime} wieder gezeigt werden.",
    "📺 Der TV-Raum ist im Ruhemodus. @{displayName} darf in ca. {waitTime} wieder ins Programm.",
    "💿 Die DVD von @{displayName} liegt auf Wiedervorlage. Noch ca. {waitTime}."
],
  'shoutout.auto.waitingStartScene': [
    "🎬 @{displayName} steht bereit, aber der Vorhang bleibt bis nach der Start-Szene zu.",
    "📺 Der Fernseher läuft noch im Startprogramm. @{displayName} kommt danach dran.",
    "📼 Die VHS von @{displayName} ist eingelegt. Abgespielt wird nach der Start-Szene.",
    "🧓 Die Rentnercrew sitzt schon, aber die Heimaufsicht startet den Film erst nach dem Streamstart.",
    "🎞️ Der Beamer ist warm, die Leinwand hängt. @{displayName} wartet nur noch auf das Ende der Start-Szene."
],
  'shoutout.auto.disabled': [
    "ℹ️ Die Heimleitung hat das Altersheimkino aktuell geschlossen.",
    "📺 Das CGN-TV-Programm ist gerade pausiert. Auto-Shoutouts sind aus.",
    "📼 Der VHS-Wagen bleibt heute stehen. Auto-Shoutouts sind deaktiviert.",
    "🎬 Der Beamer von anno dazumal ist aus. Auto-Shoutouts laufen gerade nicht.",
    "🚪 Der Kinosaal ist abgeschlossen. Die Heimaufsicht hat Auto-Shoutouts deaktiviert."
],
  'shoutout.official.queued': [
    "⏳ Der offizielle Twitch-Shoutout für @{displayName} wurde in den Sendeplan der Heimleitung eingetragen.",
    "📋 Heimleitung meldet: Offizieller Shoutout für @{displayName} ist vorgemerkt.",
    "📺 @{displayName} steht für den offiziellen Twitch-Sendeplatz bereit.",
    "🎬 Der offizielle Shoutout für @{displayName} wartet auf seinen Platz im Programm.",
    "📼 Die Heimaufsicht hat @{displayName} für den offiziellen Shoutout notiert."
],
  'shoutout.official.waiting': [
    "⚠️ Twitch-SO für @{displayName} wartet."
],
  'shoutout.official.sent': [
    "✅ Twitch-SO für @{displayName} gesendet."
],
  'shoutout.official.failed': [
    "⚠️ Der offizielle Twitch-Shoutout für @{displayName} konnte nicht gesendet werden.",
    "📺 Die Heimleitung meldet Störung im offiziellen Twitch-Programm für @{displayName}.",
    "🎬 Der offizielle Sendeplatz für @{displayName} ist gerade ausgefallen.",
    "📼 Die Heimaufsicht hat es versucht, aber Twitch wollte @{displayName} gerade nicht senden.",
    "💿 Der offizielle Shoutout für @{displayName} konnte nicht abgespielt werden."
],
  'shoutout.overlay.headline': [
    "Schaut gerne mal vorbei!",
    "Heute im Altersheim-TV!",
    "Die Heimleitung empfiehlt!",
    "Der Beamer läuft!",
    "Frisch aus dem VHS-Regal!"
],
  'shoutout.overlay.subline': [
    "Heute im Altersheim-TV: {displayName}",
    "Die Heimleitung zeigt heute: {displayName}",
    "Der Beamer läuft für {displayName}",
    "Frisch eingelegt: {displayName}",
    "Die Rentnercrew schaut heute bei {displayName} rein"
],
  'shoutout.system.textsSaved': [
    "💾 Die Heimleitung hat den neuen Sendeplan gespeichert.",
    "📋 Die Textmappe der Heimaufsicht wurde aktualisiert.",
    "📼 Die neuen VHS-Beschriftungen wurden sauber einsortiert.",
    "✅ Die Shoutout-Texte wurden im CGN-Altersheim archiviert.",
    "🎬 Programmheft gespeichert. Die nächste Vorstellung kann kommen."
]
};


const SHOUTOUT_OVERLAY_SET_DEFAULTS = [
  {
    id: "rentner-kino",
    enabled: true,
    weight: 1,
    headline: "Rentner-Kino läuft!",
    subline: "Heute auf der Leinwand: {displayName}"
  },
  {
    id: "vhs-archiv",
    enabled: true,
    weight: 1,
    headline: "Aus dem VHS-Archiv!",
    subline: "Archivband bereit für {displayName}"
  },
  {
    id: "altersheim-tv",
    enabled: true,
    weight: 1,
    headline: "Altersheim-TV präsentiert!",
    subline: "Heute im Programm: {displayName}"
  },
  {
    id: "heimleitung-empfiehlt",
    enabled: true,
    weight: 1,
    headline: "Die Heimleitung empfiehlt!",
    subline: "Einschalten lohnt sich bei {displayName}"
  },
  {
    id: "clip-archiv",
    enabled: true,
    weight: 1,
    headline: "Heute aus dem Clip-Archiv!",
    subline: "Die Rentnercrew schaut bei {displayName} rein"
  }
];

const SHOUTOUT_TEXT_OPTIONS = {
  defaultCategory: 'shoutout.system',
  categories: {
    'shoutout.chat.accepted': 'shoutout.chat',
    'shoutout.chat.waiting': 'shoutout.chat',
    'shoutout.chat.alreadyActive': 'shoutout.chat',
    'shoutout.chat.alreadyWaiting': 'shoutout.chat',
    'shoutout.chat.alreadyWaitingForce': 'shoutout.chat',
    'shoutout.chat.failed': 'shoutout.chat',
    'shoutout.chat.duplicate': 'shoutout.chat',
    'shoutout.auto.greeting': 'shoutout.auto',
    'shoutout.auto.queued': 'shoutout.auto',
    'shoutout.auto.alreadyQueued': 'shoutout.auto',
    'shoutout.auto.alreadyReceived': 'shoutout.auto',
    'shoutout.auto.cooldown': 'shoutout.auto',
    'shoutout.auto.waitingStartScene': 'shoutout.auto',
    'shoutout.auto.disabled': 'shoutout.auto',
    'shoutout.official.queued': 'shoutout.official',
    'shoutout.official.waiting': 'shoutout.official',
    'shoutout.official.sent': 'shoutout.official',
    'shoutout.official.failed': 'shoutout.official',
    'shoutout.overlay.headline': 'shoutout.overlay',
    'shoutout.overlay.subline': 'shoutout.overlay',
    'shoutout.system.textsSaved': 'shoutout.system'
  },
  categoryLabels: {
    'shoutout.chat': 'Chat-Shoutout',
    'shoutout.auto': 'AutoShoutout',
    'shoutout.official': 'Offizieller Twitch-Shoutout',
    'shoutout.overlay': 'Shoutout Overlay',
    'shoutout.dashboard': 'Dashboard',
    'shoutout.system': 'System'
  },
  source: 'seed'
};

const DEFAULT_CONFIG = {
  clipShoutout: {
    enabled: true,
    command: "so",
    aliases: ["vso"],
    directIntake: {
      enabled: true
    },
    permissionLevel: "mod",
    cooldownGlobalMs: 0,
    cooldownUserMs: 0,
    maxClipDurationSeconds: 30,
    allowLongerClipFallback: true,
    fallbackMaxClipDurationSeconds: 60,
    clipLookbackDays: 90,
    clipSearchRangesDays: [90, 365, 730, 1095, 0],
    clipPlaybackCandidateLimit: 8,
    clipFetchFirst: 50,
    clipFetchPages: 3,
    randomPick: true,
    minViewCount: 0,
    avoidRecentClips: true,
    recentClipMemoryPerChannel: 5,
    recentClipFallbackWhenAllBlocked: true,
    allowBroadcasterSelfTarget: true,
    clipPlaybackMode: "twitch_clip",
    cacheDownloadedClips: false,
    downloadDir: "htdocs/assets/sounds/clip_shoutout",
    publicSoundFilePrefix: "clip_shoutout",
    soundBundleUrl: "http://127.0.0.1:8080/api/sound/bundle",
    soundCategory: "vip",
    soundSource: "clip_shoutout",
    soundPriority: 60,
    soundVolume: 100,
    sendChatMessage: true,
    chatMessage: "✅ Shoutout für @{displayName} aufgenommen.",
    ttsAfterClipEnabled: false,
    ttsText: "Schaut gerne mal bei {displayName} vorbei.",
    ttsSynthesizeUrl: "http://127.0.0.1:8080/api/tts/synthesize",
    ttsVoice: "",
    ttsVolume: 100,
    ttsPriorityOffset: 0,
    ttsCategory: "tts",
    ttsSource: "clip_shoutout_tts",
    overlaySubline: "🧓 Altersheim-TV",
    overlayBranding: "CGN Altersheim-TV",
    overlaySets: SHOUTOUT_OVERLAY_SET_DEFAULTS,
    avatarLookupEnabled: true,
    avatarLookupUrl: "http://127.0.0.1:8080/userinfo",
    gqlClientId: "kimne78kx3ncx6brgo4mv6wki5h1ko",
    eventBusEnabled: true,
    inboundShoutout: {
      enabled: true,
      storeRawEvent: true,
      recentLimit: 80
    },
    displayQueue: {
      enabled: true,
      displayCooldownMs: 120000,
      cooldownStartsAfterFinish: true,
      workerIntervalMs: 2000,
      sendChatMessages: true,
      acceptedMessage: "✅ Shoutout für @{displayName} aufgenommen und startet gleich.",
      waitingMessage: "⏳ Shoutout für @{displayName} wurde eingereiht. Position in der SO-Liste: {position}.",
      startedMessage: "",
      failedMessage: "⚠️ Shoutout für @{displayName} konnte nicht gestartet werden."
    },
    officialShoutout: {
      enabled: true,
      enqueueAfterDisplay: true,
      sendChatMessages: true,
      acceptedMessage: "✅ Shoutout für @{displayName} aufgenommen.",
      queuedMessage: "⏳ Offizieller Twitch-Shoutout für @{displayName} liegt in der Warteschlange und wird gesendet, sobald Twitch ihn erlaubt.",
      sentMessage: "",
      duplicateQueuedMessage: "⏳ Offizieller Twitch-Shoutout für @{displayName} liegt bereits in der Warteschlange.",
      targetCooldownMessage: "⏳ Offizieller Twitch-Shoutout für @{displayName} ist aktuell nicht möglich und bleibt in der Warteschlange.",
      failedMessage: "⚠️ Offizieller Twitch-Shoutout für @{displayName} konnte nicht gesendet werden und bleibt in der Warteschlange.",
      globalCooldownMs: 120000,
      targetCooldownMs: 3600000,
      workerIntervalMs: 5000,
      maxAttempts: 5,
      displayFinishPaddingMs: 1500,
      streamWaitRetryMs: 120000,
      liveGateEnabled: true,
      liveGateRetryMs: 120000,
      broadcasterId: "",
      moderatorId: ""
    },
    streamDayLimit: {
      enabled: true,
      allowOverride: true,
      overrideFlag: "--force",
      duplicateMessage: "⚠️ @{displayName} hatte in diesem Stream bereits einen Shoutout. Nutze !so @{login} --force, wenn du ihn trotzdem einreihen möchtest.",
      restartGraceMs: 1800000,
      fallbackWhenStreamUnknown: true,
      fallbackSessionHours: 12,
      liveStateFiles: [
        "htdocs/data/twitch_stream_raw.json",
        "htdocs/data/twitch_live_data.json"
      ]
    },
    streamStatus: {
      enabled: true,
      preferCentralStatus: true
    },
    autoShoutout: {
      enabled: false,
      onlyWhenLive: false,
      triggerOnFirstMessageOnly: true,
      minMessagesBeforeTrigger: 3,
      instantTriggerMessagesEnabled: true,
      instantTriggerBypassMinMessages: true,
      instantTriggerMessages: ["!lurk", "!lurke", "lurk"],
      messageWindowMs: 1800000,
      greetingEnabled: true,
      greetingOnlyWhenTriggering: true,
      greetingTextKey: 'auto.greeting',
      respectStreamDayLimit: true,
      globalCooldownMs: 120000,
      perStreamerCooldownMs: 43200000,
      sendChatMessage: true,
      storeSkippedEvents: true,
      suppressImmediateQueuedMessage: true,
      immediateQueuedMessageThresholdMs: 10000,
      queuedMessage: "📺 @{displayName} wurde der Shoutout-Warteliste hinzugefügt. Wartezeit: ca. {waitTime}.",
      messages: {
        queued: "📺 @{displayName} wurde der Shoutout-Warteliste hinzugefügt. Wartezeit: ca. {waitTime}.",
        alreadyQueued: "⏳ @{displayName} steht bereits auf der Shoutout-Warteliste. Wartezeit: ca. {waitTime}.",
        alreadyReceived: "✅ @{displayName} hat bereits einen Shouti erhalten.",
        cooldown: "⏳ @{displayName} ist im Auto-SO-Cooldown. Nächster Versuch in ca. {waitTime}.",
        waitingStartScene: "⏳ @{displayName} ist eingetragen. Shoutout wartet bis nach der Start-Szene. Wartezeit: ca. {waitTime}.",
        disabled: "ℹ️ Auto-Shoutouts sind aktuell deaktiviert."
      },
      sceneGate: {
        enabled: true,
        blockDuringStartScene: true,
        startSceneNames: ["Stream startet", "Stream Start", "Start", "START", "Starting", "Stream starting"],
        retryMs: 15000
      },
      streamers: []
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
    inboundReceived: 0,
    outboundCreated: 0,
    inboundDuplicates: 0,
    autoTriggered: 0,
    autoSkipped: 0,
    busEmitted: 0,
    busErrors: 0,
    autoBusReceived: 0,
    autoBusDelivered: 0,
    autoBusErrors: 0
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
  },
  inboundShoutout: {
    lastEventAt: "",
    lastEventType: "",
    lastDirection: "",
    lastFromLogin: "",
    lastToLogin: "",
    lastError: ""
  },
  autoShoutout: {
    lastCheckedAt: "",
    lastTriggeredAt: "",
    lastTriggeredLogin: "",
    lastSkippedAt: "",
    lastSkippedLogin: "",
    lastSkipReason: "",
    lastError: "",
    noticeMemory: {},
    noticeMemoryMax: 500,
    activity: {
      lastLogin: '',
      lastDisplayName: '',
      lastStreamDayId: '',
      lastMessageCount: 0,
      lastRequiredMessages: 0,
      lastWindowStartedAt: '',
      lastWindowEndsAt: '',
      lastTriggeredByThreshold: false
    },
    busSubscriber: {
      installed: false,
      subscriptionId: '',
      channel: 'twitch.chat',
      action: 'message',
      delivered: 0,
      errors: 0,
      lastReceivedAt: '',
      lastHandledAt: '',
      lastResultReason: '',
      lastEventId: '',
      lastSourceModule: '',
      lastLogin: '',
      lastMessagePreview: '',
      lastError: ''
    }
  },
  sceneGate: {
    lastCheckedAt: "",
    active: false,
    reason: "",
    currentScene: "",
    lastError: ""
  },
  commandIntakeTrace: []
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


function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return database.boolFromDb(database.normalizeBool(value));
}

function normalizeStringArray(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;
  return source.map(v => String(v || "").trim()).filter(Boolean);
}

function normalizeAutoMessages(input = {}, fallback = {}) {
  const base = isPlainObject(fallback) ? fallback : {};
  const raw = isPlainObject(input) ? input : {};
  const defaults = DEFAULT_CONFIG.clipShoutout.autoShoutout.messages || {};
  const fixWaitTimeTemplate = (value, fallbackValue) => {
    const text = String(value ?? fallbackValue ?? "");
    if (!text.trim()) return "";
    if (text.includes("{waitTime}")) return text;
    return String(fallbackValue || text);
  };
  const queued = fixWaitTimeTemplate(
    raw.queued ?? base.queued ?? raw.queuedMessage ?? base.queuedMessage ?? DEFAULT_CONFIG.clipShoutout.autoShoutout.queuedMessage,
    defaults.queued || DEFAULT_CONFIG.clipShoutout.autoShoutout.queuedMessage
  );
  const alreadyQueued = fixWaitTimeTemplate(
    raw.alreadyQueued ?? base.alreadyQueued,
    defaults.alreadyQueued || "⏳ @{displayName} steht bereits auf der Shoutout-Warteliste. Wartezeit: ca. {waitTime}."
  );
  const cooldown = fixWaitTimeTemplate(
    raw.cooldown ?? base.cooldown,
    defaults.cooldown || "⏳ @{displayName} ist im Auto-SO-Cooldown. Nächster Versuch in ca. {waitTime}."
  );
  const waitingStartScene = fixWaitTimeTemplate(
    raw.waitingStartScene ?? base.waitingStartScene,
    defaults.waitingStartScene || "⏳ @{displayName} ist eingetragen. Shoutout wartet bis nach der Start-Szene. Wartezeit: ca. {waitTime}."
  );
  return {
    queued,
    alreadyQueued,
    alreadyReceived: String(raw.alreadyReceived ?? base.alreadyReceived ?? defaults.alreadyReceived ?? "✅ @{displayName} hat bereits einen Shouti erhalten."),
    cooldown,
    waitingStartScene,
    disabled: String(raw.disabled ?? base.disabled ?? defaults.disabled ?? "ℹ️ Auto-Shoutouts sind aktuell deaktiviert.")
  };
}

function normalizeSceneGate(input = {}, fallback = {}) {
  const base = isPlainObject(fallback) ? fallback : {};
  const raw = isPlainObject(input) ? input : {};
  const defaultGate = DEFAULT_CONFIG.clipShoutout.autoShoutout.sceneGate || {};
  return {
    enabled: asBool(raw.enabled, base.enabled !== undefined ? base.enabled === true : defaultGate.enabled !== false),
    blockDuringStartScene: asBool(raw.blockDuringStartScene, base.blockDuringStartScene !== undefined ? base.blockDuringStartScene !== false : defaultGate.blockDuringStartScene !== false),
    startSceneNames: normalizeStringArray(raw.startSceneNames, normalizeStringArray(base.startSceneNames, defaultGate.startSceneNames || [])),
    retryMs: Math.max(1000, Number(raw.retryMs === undefined ? (base.retryMs === undefined ? defaultGate.retryMs : base.retryMs) : raw.retryMs) || 15000)
  };
}

function sceneNameKey(value) {
  return String(value || "").trim().toLowerCase();
}

function readShoutoutSceneGateState(cfg, env = process.env) {
  const acfg = autoShoutoutConfig(cfg || shoutoutConfig());
  const gate = normalizeSceneGate(acfg.sceneGate || {}, DEFAULT_CONFIG.clipShoutout.autoShoutout.sceneGate || {});
  const checkedAt = nowIso();
  const out = {
    enabled: gate.enabled === true,
    blockDuringStartScene: gate.blockDuringStartScene !== false,
    active: false,
    reason: "",
    currentScene: "",
    startSceneNames: gate.startSceneNames || [],
    retryMs: Math.max(1000, Number(gate.retryMs || 15000)),
    obsConnected: false,
    obsDetected: false,
    source: "obs_shared",
    lastCheckedAt: checkedAt,
    lastError: ""
  };
  if (!out.enabled || !out.blockDuringStartScene) {
    state.sceneGate = { lastCheckedAt: checkedAt, active: false, reason: "disabled", currentScene: "", lastError: "" };
    return out;
  }
  try {
    if (typeof getSharedObs !== "function") throw new Error("obs_shared_unavailable");
    const shared = getSharedObs(env || process.env, console);
    const status = shared && typeof shared.getPublicStatus === "function" ? shared.getPublicStatus() : {};
    out.obsConnected = status && status.obsConnected === true;
    out.obsDetected = status && status.obsDetected === true;
    out.currentScene = String(status && status.currentProgramSceneName || "").trim();
    const names = new Set((out.startSceneNames || []).map(sceneNameKey).filter(Boolean));
    out.active = !!out.currentScene && names.has(sceneNameKey(out.currentScene));
    out.reason = out.active ? "start_scene_active" : "";
  } catch (err) {
    out.lastError = err && err.message ? err.message : String(err);
  }
  state.sceneGate = {
    lastCheckedAt: checkedAt,
    active: out.active === true,
    reason: out.reason || "",
    currentScene: out.currentScene || "",
    lastError: out.lastError || ""
  };
  return out;
}

function blockQueueBySceneGate(tableName, row, gate, eventName, cfg) {
  const retryMs = Math.max(1000, Number(gate && gate.retryMs || 15000));
  const next = isoFromMs(Date.now() + retryMs);
  const error = "waiting_start_scene";
  database.run(`UPDATE ${database.quoteIdentifier(tableName)} SET status='waiting', available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, { id: row.id, next, now: nowIso(), error });
  emitShoutoutBus(eventName, { queueId: row.id, targetLogin: row.target_login, retryAt: next, sceneGate: gate }, cfg);
  return { ok: true, waiting: true, reason: error, queueId: row.id, retryAt: next, sceneGate: gate };
}

function formatApproxDuration(ms) {
  const n = Math.max(0, Number(ms || 0));
  if (!n) return "wenige Sekunden";
  const totalSeconds = Math.ceil(n / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} Std. ${minutes} Min.`;
  if (minutes > 0) return `${minutes} Min. ${seconds ? seconds + " Sek." : ""}`.trim();
  if (seconds <= 10) return "wenige Sekunden";
  return `${seconds} Sek.`;
}

function estimateDisplayWaitMsForQueueId(queueId, cfg) {
  const id = Number(queueId || 0);
  const dcfg = displayConfig(cfg || shoutoutConfig());
  const cooldown = Math.max(0, Number(dcfg.displayCooldownMs || 120000));
  if (!id) return cooldown;
  const rows = listDisplayQueue(200).filter(row => ['queued','waiting','active'].includes(String(row.status || '')));
  const index = rows.findIndex(row => Number(row.id || 0) === id);
  if (index < 0) return cooldown;
  return Math.max(0, index * cooldown);
}

function displayQueueNoticeInfo(queueRow, cfg) {
  const rowId = Number(queueRow && queueRow.id || 0);
  const dcfg = displayConfig(cfg || shoutoutConfig());
  const cooldown = Math.max(0, Number(dcfg.displayCooldownMs || 120000));
  const rows = listDisplayQueue(200).filter(row => ['queued','waiting','active'].includes(String(row.status || '')));
  const index = rows.findIndex(row => Number(row.id || 0) === rowId);
  const pendingBefore = index >= 0 ? index : rows.filter(row => Number(row.id || 0) < rowId).length;
  const availableMs = queueRow && queueRow.available_at ? Date.parse(queueRow.available_at) : 0;
  const availableWaitMs = Number.isFinite(availableMs) && availableMs > 0 ? Math.max(0, availableMs - Date.now()) : 0;
  const estimatedWaitMs = Math.max(0, availableWaitMs + Math.max(0, pendingBefore) * cooldown);
  return {
    pendingBefore,
    position: Math.max(1, pendingBefore + 1),
    waitMs: estimatedWaitMs,
    waitTime: formatApproxDuration(estimatedWaitMs),
    cooldownMs: cooldown,
    availableWaitMs
  };
}

function appendDisplayWaitInfo(message, noticeInfo) {
  const base = String(message || '').trim();
  if (!base) return base;
  const position = Number(noticeInfo && noticeInfo.position || 0);
  if (!position || /position/i.test(base)) return stripChatTimePromise(base);
  return stripChatTimePromise(`${base} Position in der SO-Liste: ${position}.`);
}

function stripChatTimePromise(message) {
  return String(message || '')
    .replace(/\s*Start\s+in\s+ca\.\s+[^.。!?:;]+[.。]?/gi, '')
    .replace(/\s*Wartezeit\s*:\s*ca\.\s*[^.。!?:;]+[.。]?/gi, '')
    .replace(/\s*Nächster\s+Versuch\s+in\s+ca\.\s*[^.。!?:;]+[.。]?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatDisplayMention(displayName, login) {
  const text = cleanDisplay(displayName || login || '', login || '');
  return '@' + (text || cleanLogin(login) || 'user');
}

function buildManualDisplayChatMessage(kind, vars = {}, noticeInfo = null) {
  const mention = formatDisplayMention(vars.displayName || vars.targetDisplay, vars.login || vars.targetLogin);
  const position = Math.max(1, Number(noticeInfo && noticeInfo.position || vars.position || vars.queuePosition || 1));
  const textKeyByKind = {
    accepted: 'shoutout.chat.accepted',
    waiting: 'shoutout.chat.waiting',
    already_active: 'shoutout.chat.alreadyActive',
    already_waiting: 'shoutout.chat.alreadyWaiting',
    already_waiting_force: 'shoutout.chat.alreadyWaitingForce',
    failed: 'shoutout.chat.failed',
    duplicate: 'shoutout.chat.duplicate'
  };
  const textKey = textKeyByKind[kind] || '';
  const textVars = {
    ...vars,
    displayName: vars.displayName || vars.targetDisplay || vars.targetLogin || vars.login || '',
    login: vars.login || vars.targetLogin || '',
    targetLogin: vars.targetLogin || vars.login || '',
    position,
    queuePosition: position,
    reason: vars.reason || 'Status unbekannt'
  };
  const rendered = textKey ? renderShoutoutModuleText(textKey, textVars) : '';
  if (rendered) return stripChatTimePromise(rendered);
  if (kind === 'accepted') return `✅ Shoutout für ${mention} aufgenommen und startet gleich.`;
  if (kind === 'waiting') return `⏳ Shoutout für ${mention} wurde eingereiht. Position in der SO-Liste: ${position}.`;
  if (kind === 'already_active') return `📺 ${mention} läuft gerade bereits im Shoutout.`;
  if (kind === 'already_waiting_force') return `⏳ ${mention} steht bereits in der SO-Liste. Position: ${position}.`;
  if (kind === 'already_waiting') return `⏳ ${mention} steht bereits in der SO-Liste. Position: ${position}.`;
  if (kind === 'failed') return `⚠️ Shoutout für ${mention} konnte nicht gestartet werden.`;
  return `ℹ️ Shoutout für ${mention}: ${String(vars.reason || 'Status unbekannt')}.`;
}

function findPendingDisplayShoutout(login) {
  const clean = cleanLogin(login);
  if (!clean) return null;
  ensureDisplayQueueSchema();
  return database.get(`
    SELECT * FROM ${database.quoteIdentifier('clip_shoutout_display_queue')}
    WHERE target_login=:login AND status IN ('queued','waiting','active')
    ORDER BY id ASC LIMIT 1
  `, { login: clean });
}

function existingDisplayQueueResponse(existingRow, cfg) {
  if (!existingRow) return null;
  const status = String(existingRow.status || '');
  const notice = displayQueueNoticeInfo(existingRow, cfg || shoutoutConfig());
  return {
    id: Number(existingRow.id || 0),
    status,
    availableAt: existingRow.available_at || '',
    position: notice.position,
    notice
  };
}

function renderAutoMessage(template, vars = {}) {
  const displayName = cleanDisplay(vars.displayName || vars.login || '', vars.login || '');
  return renderTemplate(String(template || ''), { ...vars, displayName })
    .replace(/@\{displayName\}/g, `@${displayName || vars.login || ''}`)
    .replace(/\{waitTime\}/g, String(vars.waitTime || 'kurz'))
    .replace(/\{reason\}/g, String(vars.reason || ''))
    .trim();
}

function renderAutoModuleText(key, vars = {}, options = {}) {
  const displayName = cleanDisplay(vars.displayName || vars.login || '', vars.login || '');
  const context = { ...vars, displayName, user: displayName, username: vars.login || '' };
  const rendered = textHelper.renderModuleText(MODULE_NAME, key, AUTO_SHOUTOUT_TEXT_DEFAULTS, context, {
    ...AUTO_SHOUTOUT_TEXT_OPTIONS,
    ...(options || {})
  });
  return renderAutoMessage(rendered, { ...vars, displayName });
}

function renderShoutoutModuleText(key, vars = {}, options = {}) {
  const displayName = cleanDisplay(vars.displayName || vars.targetDisplay || vars.login || '', vars.login || '');
  const context = {
    ...vars,
    displayName,
    user: displayName,
    username: vars.login || vars.targetLogin || '',
    targetLogin: vars.targetLogin || vars.login || '',
    login: vars.login || vars.targetLogin || ''
  };
  const rendered = textHelper.renderModuleText(MODULE_NAME, key, SHOUTOUT_TEXT_DEFAULTS, context, {
    ...SHOUTOUT_TEXT_OPTIONS,
    ...(options || {})
  });
  return renderAutoMessage(rendered, { ...vars, displayName, login: context.login });
}


function sanitizeShoutoutOverlaySet(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const headline = String(raw.headline || "").trim();
  const subline = String(raw.subline || "").trim();
  if (!headline && !subline) return null;
  const rawId = String(raw.id || raw.key || "").trim();
  const id = rawId || `overlay-set-${index + 1}`;
  return {
    id,
    enabled: raw.enabled !== false,
    weight: Math.max(0, Number(raw.weight || 1) || 1),
    headline: headline || "Schaut gerne mal vorbei!",
    subline: subline || "Heute im Altersheim-TV: {displayName}"
  };
}

function normalizeShoutoutOverlaySets(value) {
  const source = Array.isArray(value) ? value : SHOUTOUT_OVERLAY_SET_DEFAULTS;
  const result = [];
  source.forEach((entry, index) => {
    const set = sanitizeShoutoutOverlaySet(entry, index);
    if (set) result.push(set);
  });
  return result.length ? result : SHOUTOUT_OVERLAY_SET_DEFAULTS.map((entry, index) => sanitizeShoutoutOverlaySet(entry, index)).filter(Boolean);
}

function pickWeightedShoutoutOverlaySet(sets = []) {
  const normalized = normalizeShoutoutOverlaySets(sets);
  const enabled = normalized.filter(set => set.enabled !== false && Number(set.weight || 0) > 0);
  const candidates = enabled.length ? enabled : normalized;
  const total = candidates.reduce((sum, set) => sum + Math.max(0, Number(set.weight || 1) || 1), 0);
  if (!candidates.length) return null;
  if (total <= 0) return candidates[Math.floor(Math.random() * candidates.length)] || candidates[0];
  let roll = Math.random() * total;
  for (const set of candidates) {
    roll -= Math.max(0, Number(set.weight || 1) || 1);
    if (roll <= 0) return set;
  }
  return candidates[candidates.length - 1] || candidates[0];
}

function renderOverlayTemplate(template, vars = {}) {
  return renderTemplate(String(template || ""), {
    ...vars,
    displayName: vars.displayName || vars.targetDisplay || vars.user || "",
    login: vars.login || vars.targetLogin || vars.username || "",
    user: vars.displayName || vars.targetDisplay || vars.user || "",
    username: vars.login || vars.targetLogin || vars.username || ""
  }).trim();
}

function buildShoutoutOverlayVisualText(cfg = {}, vars = {}) {
  const sets = normalizeShoutoutOverlaySets(cfg.overlaySets);
  const picked = pickWeightedShoutoutOverlaySet(sets);
  if (picked) {
    return {
      mode: "overlaySet",
      setId: picked.id,
      headline: renderOverlayTemplate(picked.headline, vars) || "Schaut gerne mal vorbei!",
      subline: renderOverlayTemplate(picked.subline, vars) || `Heute im Altersheim-TV: ${vars.displayName || vars.login || "User"}`
    };
  }

  return {
    mode: "legacyTextVariants",
    setId: "",
    headline: renderShoutoutOverlayText("shoutout.overlay.headline", vars, "Schaut gerne mal vorbei!"),
    subline: renderShoutoutOverlayText("shoutout.overlay.subline", vars, `Heute im Altersheim-TV: ${vars.displayName || vars.login || "User"}`)
  };
}

function publicShoutoutOverlaySets(cfg = {}) {
  return {
    enabled: true,
    mode: "paired_sets",
    sets: normalizeShoutoutOverlaySets(cfg.overlaySets),
    defaults: normalizeShoutoutOverlaySets(SHOUTOUT_OVERLAY_SET_DEFAULTS),
    placeholders: ["{displayName}", "{login}", "{clipTitle}", "{clipUrl}", "{gameName}"],
    fallbackTextKeys: ["shoutout.overlay.headline", "shoutout.overlay.subline"]
  };
}

function renderShoutoutOverlayText(key, vars = {}, fallback = "") {
  try {
    const rendered = renderShoutoutModuleText(key, vars);
    const clean = String(rendered || "").trim();
    return clean || String(fallback || "").trim();
  } catch (err) {
    return String(fallback || "").trim();
  }
}

function autoNoticeTextKey(key) {
  const map = {
    queued: 'shoutout.auto.queued',
    alreadyQueued: 'shoutout.auto.alreadyQueued',
    alreadyReceived: 'shoutout.auto.alreadyReceived',
    cooldown: 'shoutout.auto.cooldown',
    waitingStartScene: 'shoutout.auto.waitingStartScene',
    disabled: 'shoutout.auto.disabled'
  };
  return map[key] || `shoutout.auto.${key}`;
}

async function sendAutoGreetingNotice(acfg, vars = {}, cfg = null) {
  if (!acfg || acfg.sendChatMessage === false || acfg.greetingEnabled === false) return false;
  const key = String(acfg.greetingTextKey || 'auto.greeting').trim() || 'auto.greeting';
  const msg = renderAutoModuleText(key, vars);
  if (!msg) return false;
  await sendChatMessage(msg, { targetLogin: vars.login, autoShoutout: true, reason: 'auto_greeting', textKey: key });
  return true;
}

function pruneAutoNoticeMemory() {
  const mem = state.autoShoutout.noticeMemory || {};
  const max = Math.max(50, Number(state.autoShoutout.noticeMemoryMax || 500));
  const keys = Object.keys(mem);
  if (keys.length <= max) return;
  keys
    .sort((a, b) => Number(mem[a] || 0) - Number(mem[b] || 0))
    .slice(0, Math.max(0, keys.length - max))
    .forEach(key => { delete mem[key]; });
}

function autoNoticeMemoryKey(key, vars = {}) {
  const noticeKey = String(key || '').trim();
  const login = cleanLogin(vars.login || vars.targetLogin || '');
  const streamDayId = String(vars.streamDayId || '').trim() || 'no_stream_day';
  if (!noticeKey || !login) return '';
  if (noticeKey === 'alreadyReceived') return `${noticeKey}:${login}:${streamDayId}`;
  if (noticeKey === 'alreadyQueued') {
    const queueId = Number(vars.displayQueueId || vars.existingDisplayQueueId || 0);
    return `${noticeKey}:${login}:${queueId > 0 ? `queue_${queueId}` : streamDayId}`;
  }
  if (noticeKey === 'cooldown') {
    const next = String(vars.cooldown && vars.cooldown.nextAllowedAt || vars.nextAllowedAt || vars.waitUntil || streamDayId || '').trim();
    return `${noticeKey}:${login}:${next || streamDayId}`;
  }
  if (noticeKey === 'disabled') return `${noticeKey}:${login}`;
  return '';
}

function shouldSuppressAutoChatNotice(key, vars = {}) {
  const noticeKey = String(key || '').trim();

  // AutoShoutout must not spam the chat for skip states.
  // These are internal decisions, not useful public announcements.
  if (['alreadyReceived', 'cooldown', 'disabled'].includes(noticeKey)) return true;

  if (!['alreadyQueued'].includes(noticeKey)) return false;
  const memKey = autoNoticeMemoryKey(noticeKey, vars);
  if (!memKey) return false;
  const mem = state.autoShoutout.noticeMemory || (state.autoShoutout.noticeMemory = {});
  if (mem[memKey]) return true;
  mem[memKey] = Date.now();
  pruneAutoNoticeMemory();
  return false;
}

async function sendAutoChatNotice(acfg, key, vars = {}, cfg = null) {
  if (!acfg || acfg.sendChatMessage === false) return false;
  if (shouldSuppressAutoChatNotice(key, vars)) return false;
  const textKey = autoNoticeTextKey(key);
  let msg = renderShoutoutModuleText(textKey, vars);
  if (!msg) {
    const messages = normalizeAutoMessages(acfg.messages || {}, acfg || {});
    const template = messages[key] || acfg[`${key}Message`] || '';
    msg = renderAutoMessage(template, vars);
  }
  if (!msg) return false;
  await sendChatMessage(msg, { targetLogin: vars.login, autoShoutout: true, reason: vars.reason || key, textKey });
  return true;
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
  const cleanPartial = { ...(partial || {}) };
  if (isPlainObject(cleanPartial.directIntake)) {
    current.clipShoutout = current.clipShoutout || {};
    current.clipShoutout.directIntake = sanitizeDirectIntakeSettings(cleanPartial.directIntake);
    delete cleanPartial.directIntake;
  }
  current.clipShoutout = mergePlain(current.clipShoutout || {}, cleanPartial);
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

function streamDayLimitConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.streamDayLimit, (cfg && cfg.streamDayLimit) || {});
}


function safeJsonParse(value, fallback = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function ensureTableColumn(tableName, columnName, definition) {
  const table = String(tableName || "").trim();
  const column = String(columnName || "").trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) return false;
  const rows = database.all(`PRAGMA table_info(${table})`);
  if (rows.some(row => String(row.name || "") === column)) return true;
  database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  return true;
}

function resolveRootFile(inputPath) {
  const raw = String(inputPath || "").trim();
  if (!raw) return "";
  if (path.isAbsolute(raw)) return raw;
  return configHelper.resolveFromRoot(raw);
}

function readJsonFileSafe(filePath, fallback = null) {
  try {
    const file = resolveRootFile(filePath);
    if (!file || !fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function extractStreamStateFromPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const first = Array.isArray(payload.data) && payload.data.length ? payload.data[0] : null;
  const source = first || payload.stream || payload.channel || payload;
  const live = Boolean(first || source.live === true || source.isLive === true || source.online === true || source.type === "live");
  if (!live) return { live: false, source: "file" };
  return {
    live: true,
    source: "file",
    streamId: String(source.id || source.stream_id || source.streamId || ""),
    startedAt: String(source.started_at || source.startedAt || source.stream_started_at || source.streamStartedAt || ""),
    title: String(source.title || ""),
    gameName: String(source.game_name || source.gameName || "")
  };
}

function normalizeCentralStreamStatus(status) {
  if (!status || typeof status !== "object") return null;
  return {
    live: status.live === true,
    source: "stream_status",
    upstreamSource: String(status.source || ""),
    file: String(status.file || ""),
    fileModifiedAt: String(status.fileModifiedAt || ""),
    fileAgeSeconds: Number(status.fileAgeSeconds || 0),
    stale: status.stale === true,
    statusKnown: status.statusKnown !== false,
    streamId: String(status.streamId || ""),
    startedAt: String(status.startedAt || ""),
    title: String(status.title || ""),
    gameName: String(status.gameName || ""),
    viewerCount: Number(status.viewerCount || 0),
    streamSessionId: String(status.streamSessionId || ""),
    streamDayId: String(status.streamDayId || ""),
    sessionStatus: String(status.sessionStatus || ""),
    restartGraceUntil: String(status.restartGraceUntil || ""),
    lastCheckedAt: String(status.lastCheckedAt || ""),
    lastLiveAt: String(status.lastLiveAt || ""),
    error: String(status.lastError || status.error || "")
  };
}

function readCentralStreamStatus() {
  if (!streamStatus || typeof streamStatus.getCurrentStatus !== "function") return null;
  try {
    const status = streamStatus.getCurrentStatus({ refresh: true, caller: MODULE_NAME });
    return normalizeCentralStreamStatus(status);
  } catch (_) {
    return null;
  }
}

function readCurrentStreamState(cfg) {
  const centralCfg = (cfg && cfg.streamStatus) || {};
  if (centralCfg.enabled !== false && centralCfg.preferCentralStatus !== false) {
    const central = readCentralStreamStatus();
    if (central) return central;
  }

  const scfg = streamDayLimitConfig(cfg);
  const files = Array.isArray(scfg.liveStateFiles) ? scfg.liveStateFiles : [];
  for (const file of files) {
    const payload = readJsonFileSafe(file, null);
    const state = extractStreamStateFromPayload(payload);
    if (state && state.live) return { ...state, file: resolveRootFile(file) };
  }
  for (const file of files) {
    const payload = readJsonFileSafe(file, null);
    const state = extractStreamStateFromPayload(payload);
    if (state) return { ...state, file: resolveRootFile(file) };
  }
  return { live: false, source: "unknown", file: "", statusKnown: false, stale: true };
}

function compactIsoForId(value) {
  const ms = msFromIso(value) || Date.now();
  return new Date(ms).toISOString().replace(/[-:.]/g, "").replace(/Z$/, "Z");
}

function makeStreamDayId(env, streamState) {
  if (streamState && streamState.streamDayId) return String(streamState.streamDayId).trim().toLowerCase();
  const channel = cleanLogin(env.TWITCH_BOT_CHANNEL || env.TWITCH_CHANNEL || env.TWITCH_BROADCASTER_LOGIN || "forrestcgn") || "stream";
  const startedAt = streamState && streamState.startedAt ? streamState.startedAt : nowIso();
  const streamId = String(streamState && streamState.streamId || "manual").replace(/[^a-zA-Z0-9_-]+/g, "").slice(0, 48) || "manual";
  return `${channel}_${compactIsoForId(startedAt)}_${streamId}`.toLowerCase();
}

function ensureStreamDaySchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_stream_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stream_day_id TEXT NOT NULL UNIQUE,
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
    CREATE INDEX IF NOT EXISTS idx_clip_so_stream_days_status ON clip_shoutout_stream_days(status, last_seen_at);
  `);
}

function clipShoutoutStreamDayRowLastSeenMs(row) {
  return msFromIso(row && (row.last_seen_at || row.first_seen_at || row.stream_started_at));
}

function closeClipShoutoutStreamDayRow(row, now, source = 'offline', reason = 'closed', streamState = null) {
  if (!row || !row.id) return false;
  const previousMeta = safeJsonParse(row.meta_json, {});
  database.run(`
    UPDATE clip_shoutout_stream_days
    SET status='closed', ended_at=CASE WHEN ended_at='' THEN :now ELSE ended_at END,
        restart_grace_until='', last_seen_at=:now, source=:source, meta_json=:metaJson
    WHERE id=:id
  `, {
    id: row.id,
    now,
    source: String(source || 'offline'),
    metaJson: JSON.stringify({ ...previousMeta, closedReason: String(reason || 'closed'), closedAt: now, lastObserved: streamState || previousMeta.lastObserved || null })
  });
  return true;
}

function closeExpiredClipShoutoutStreamDayGraceRows(now) {
  database.run(`
    UPDATE clip_shoutout_stream_days
    SET status='closed', ended_at=CASE WHEN ended_at='' THEN :now ELSE ended_at END,
        restart_grace_until='', last_seen_at=:now
    WHERE status='grace' AND restart_grace_until<>'' AND restart_grace_until<:now
  `, { now });
}

function publicAutoStreamDayDecision(streamDay = {}) {
  const streamState = streamDay && streamDay.streamState ? streamDay.streamState : {};
  return {
    lastResolvedAt: nowIso(),
    lastStreamDayId: String(streamDay.streamDayId || ''),
    lastOk: streamDay.ok === true,
    lastSource: String(streamState.source || ''),
    lastStatus: String(streamState.sessionStatus || ''),
    lastLive: streamState.live === true,
    lastStatusKnown: streamState.statusKnown !== false,
    lastStale: streamState.stale === true,
    lastGrace: streamDay.grace === true,
    lastFallback: streamDay.fallback === true,
    lastError: String(streamDay.error || ''),
    lastClosedStaleActive: streamDay.closedStaleActive === true,
    lastClosedReason: String(streamDay.closedReason || '')
  };
}

function resolveCurrentStreamDay(env, cfg) {
  ensureStreamDaySchema();
  const scfg = streamDayLimitConfig(cfg);
  const now = nowIso();
  const nowMs = Date.now();
  const graceMs = Math.max(0, Number(scfg.restartGraceMs || 1800000));
  const broadcaster = cleanLogin(env.TWITCH_BOT_CHANNEL || env.TWITCH_CHANNEL || env.TWITCH_BROADCASTER_LOGIN || "forrestcgn") || "forrestcgn";
  const streamState = readCurrentStreamState(cfg);
  closeExpiredClipShoutoutStreamDayGraceRows(now);

  if (streamState.live) {
    const recent = database.get(`
      SELECT * FROM clip_shoutout_stream_days
      WHERE broadcaster_login=:broadcaster AND status IN ('active','grace')
      ORDER BY id DESC LIMIT 1
    `, { broadcaster });
    const recentGraceMs = msFromIso(recent && recent.restart_grace_until);
    const incomingStreamId = String(streamState.streamId || '');
    const recentStreamId = String(recent && recent.stream_id || '');
    const sameStream = recent && incomingStreamId && recentStreamId && recentStreamId === incomingStreamId;
    const withinGrace = recent && recentGraceMs && recentGraceMs >= nowMs;
    const canReuseActiveWithoutReliableStreamId = recent && recent.status === 'active' && (!incomingStreamId || !recentStreamId);

    if (recent && incomingStreamId && recentStreamId && !sameStream && !withinGrace) {
      closeClipShoutoutStreamDayRow(recent, now, streamState.source || 'stream_status', 'new_stream_id_detected', streamState);
    } else if (recent && (sameStream || withinGrace || canReuseActiveWithoutReliableStreamId)) {
      database.run(`
        UPDATE clip_shoutout_stream_days
        SET status='active', stream_id=CASE WHEN :streamId='' THEN stream_id ELSE :streamId END,
            last_seen_at=:now, restart_grace_until='', source=:source,
            meta_json=:metaJson
        WHERE id=:id
      `, {
        id: recent.id,
        streamId: String(streamState.streamId || ""),
        now,
        source: streamState.source || "file",
        metaJson: JSON.stringify({ ...(safeJsonParse(recent.meta_json, {})), lastObserved: streamState })
      });
      return { ok: true, streamDayId: recent.stream_day_id, row: database.get(`SELECT * FROM clip_shoutout_stream_days WHERE id=:id`, { id: recent.id }), streamState };
    }

    const streamDayId = makeStreamDayId(env, streamState);
    database.run(`
      INSERT INTO clip_shoutout_stream_days (
        stream_day_id,broadcaster_login,status,stream_id,stream_started_at,
        first_seen_at,last_seen_at,ended_at,restart_grace_until,source,meta_json
      ) VALUES (
        :streamDayId,:broadcaster,'active',:streamId,:startedAt,
        :now,:now,'','',:source,:metaJson
      )
      ON CONFLICT(stream_day_id) DO UPDATE SET
        status='active', last_seen_at=excluded.last_seen_at, restart_grace_until='', source=excluded.source, meta_json=excluded.meta_json
    `, {
      streamDayId,
      broadcaster,
      streamId: String(streamState.streamId || ""),
      startedAt: String(streamState.startedAt || now),
      now,
      source: streamState.source || "file",
      metaJson: JSON.stringify({ lastObserved: streamState })
    });
    return { ok: true, streamDayId, row: database.get(`SELECT * FROM clip_shoutout_stream_days WHERE stream_day_id=:streamDayId`, { streamDayId }), streamState };
  }

  const active = database.get(`
    SELECT * FROM clip_shoutout_stream_days
    WHERE broadcaster_login=:broadcaster AND status='active'
    ORDER BY id DESC LIMIT 1
  `, { broadcaster });
  if (active) {
    const lastSeenMs = clipShoutoutStreamDayRowLastSeenMs(active);
    const activeCanEnterGrace = lastSeenMs > 0 && (nowMs - lastSeenMs) <= graceMs;
    if (!activeCanEnterGrace) {
      closeClipShoutoutStreamDayRow(active, now, streamState.source || 'offline', 'stale_active_closed_before_grace', streamState);
    } else {
      const graceUntil = isoFromMs(nowMs + graceMs);
      database.run(`
        UPDATE clip_shoutout_stream_days
        SET status='grace', ended_at=CASE WHEN ended_at='' THEN :now ELSE ended_at END,
            restart_grace_until=:graceUntil, last_seen_at=:now, source=:source
        WHERE id=:id
      `, { id: active.id, now, graceUntil, source: streamState.source || "offline" });
      return { ok: true, streamDayId: active.stream_day_id, row: database.get(`SELECT * FROM clip_shoutout_stream_days WHERE id=:id`, { id: active.id }), streamState, grace: true };
    }
  }

  const grace = database.get(`
    SELECT * FROM clip_shoutout_stream_days
    WHERE broadcaster_login=:broadcaster AND status='grace' AND restart_grace_until>=:now
    ORDER BY id DESC LIMIT 1
  `, { broadcaster, now });
  if (grace) return { ok: true, streamDayId: grace.stream_day_id, row: grace, streamState, grace: true };

  if (scfg.fallbackWhenStreamUnknown === false) return { ok: false, streamDayId: "", streamState, error: "stream_day_unknown" };
  const fallbackHours = Math.max(1, Number(scfg.fallbackSessionHours || 12));
  const fallbackFloor = isoFromMs(nowMs - fallbackHours * 60 * 60 * 1000);
  const fallback = database.get(`
    SELECT * FROM clip_shoutout_stream_days
    WHERE broadcaster_login=:broadcaster AND source='fallback' AND last_seen_at>=:fallbackFloor
    ORDER BY id DESC LIMIT 1
  `, { broadcaster, fallbackFloor });
  if (fallback) {
    database.run(`UPDATE clip_shoutout_stream_days SET last_seen_at=:now WHERE id=:id`, { id: fallback.id, now });
    return { ok: true, streamDayId: fallback.stream_day_id, row: database.get(`SELECT * FROM clip_shoutout_stream_days WHERE id=:id`, { id: fallback.id }), streamState, fallback: true };
  }

  const streamDayId = makeStreamDayId(env, { startedAt: now, streamId: "fallback" });
  database.run(`
    INSERT INTO clip_shoutout_stream_days (
      stream_day_id,broadcaster_login,status,stream_id,stream_started_at,
      first_seen_at,last_seen_at,ended_at,restart_grace_until,source,meta_json
    ) VALUES (
      :streamDayId,:broadcaster,'active','fallback',:now,
      :now,:now,'','', 'fallback', :metaJson
    )
  `, { streamDayId, broadcaster, now, metaJson: JSON.stringify({ reason: "stream_state_unknown", streamState }) });
  return { ok: true, streamDayId, row: database.get(`SELECT * FROM clip_shoutout_stream_days WHERE stream_day_id=:streamDayId`, { streamDayId }), streamState, fallback: true };
}

function hasForceOverride(input, cfg) {
  const scfg = streamDayLimitConfig(cfg);
  if (scfg.allowOverride === false) return false;
  const flag = String(scfg.overrideFlag || "--force").trim().toLowerCase() || "--force";
  const args = Array.isArray(input.args) ? input.args.map(v => String(v || "").trim().toLowerCase()) : [];
  const raw = String(input.rawInput || input.input || input.message || "").toLowerCase();
  return args.includes(flag) || raw.split(/\s+/).includes(flag);
}

function findExistingStreamDayShoutout(targetLogin, streamDayId) {
  ensureDisplayQueueSchema();
  const login = cleanLogin(targetLogin);
  const id = String(streamDayId || "").trim();
  if (!login || !id) return null;
  return database.get(`
    SELECT * FROM clip_shoutout_display_queue
    WHERE target_login=:login AND stream_day_id=:streamDayId
      AND status IN ('queued','waiting','active','done')
    ORDER BY id ASC LIMIT 1
  `, { login, streamDayId: id });
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
  ensureTableColumn('clip_shoutout_display_queue', 'stream_day_id', "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn('clip_shoutout_display_queue', 'override_used', "INTEGER NOT NULL DEFAULT 0");
  ensureTableColumn('clip_shoutout_display_queue', 'override_by_login', "TEXT NOT NULL DEFAULT ''");
  ensureTableColumn('clip_shoutout_display_queue', 'override_reason', "TEXT NOT NULL DEFAULT ''");
  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_so_display_stream_day_target ON clip_shoutout_display_queue(stream_day_id, target_login, status);`);
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
    streamDayId: String(job.streamDayId || ''),
    overrideUsed: job.overrideUsed ? 1 : 0,
    overrideByLogin: cleanLogin(job.overrideByLogin || ''),
    overrideReason: String(job.overrideReason || ''),
    inputJson: JSON.stringify(job.input || {}),
    metaJson: JSON.stringify(job.meta || {})
  };
  const result = database.run(`
    INSERT INTO clip_shoutout_display_queue (
      target_login,target_display,requested_by_login,requested_by_display,
      status,attempts,available_at,created_at,updated_at,stream_day_id,override_used,override_by_login,override_reason,input_json,meta_json
    ) VALUES (
      :targetLogin,:targetDisplay,:requestedByLogin,:requestedByDisplay,
      'queued',0,:availableAt,:createdAt,:updatedAt,:streamDayId,:overrideUsed,:overrideByLogin,:overrideReason,:inputJson,:metaJson
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

function buildOfficialLiveGateState(cfg) {
  const ocfg = officialConfig(cfg);
  const streamState = readCurrentStreamState(cfg);
  const enabled = ocfg.liveGateEnabled !== false;
  const stale = !!(streamState && streamState.stale);
  const statusKnown = streamState ? streamState.statusKnown !== false : false;
  let reason = "";
  if (enabled && stale) reason = "waiting_stream_status_stale";
  else if (enabled && !statusKnown) reason = "waiting_stream_status_unknown";
  else if (enabled && !(streamState && streamState.live)) reason = "waiting_stream_live_offline";
  return {
    enabled,
    live: !!(streamState && streamState.live),
    statusKnown,
    stale,
    reason,
    source: streamState && streamState.source ? String(streamState.source) : 'unknown',
    upstreamSource: streamState && streamState.upstreamSource ? String(streamState.upstreamSource) : '',
    file: streamState && streamState.file ? String(streamState.file) : '',
    fileModifiedAt: streamState && streamState.fileModifiedAt ? String(streamState.fileModifiedAt) : '',
    fileAgeSeconds: streamState && Number.isFinite(Number(streamState.fileAgeSeconds)) ? Number(streamState.fileAgeSeconds) : 0,
    streamId: streamState && streamState.streamId ? String(streamState.streamId) : '',
    startedAt: streamState && streamState.startedAt ? String(streamState.startedAt) : '',
    title: streamState && streamState.title ? String(streamState.title) : '',
    gameName: streamState && streamState.gameName ? String(streamState.gameName) : '',
    viewerCount: streamState && Number.isFinite(Number(streamState.viewerCount)) ? Number(streamState.viewerCount) : 0,
    streamSessionId: streamState && streamState.streamSessionId ? String(streamState.streamSessionId) : '',
    streamDayId: streamState && streamState.streamDayId ? String(streamState.streamDayId) : '',
    sessionStatus: streamState && streamState.sessionStatus ? String(streamState.sessionStatus) : '',
    restartGraceUntil: streamState && streamState.restartGraceUntil ? String(streamState.restartGraceUntil) : '',
    lastCheckedAt: streamState && streamState.lastCheckedAt ? String(streamState.lastCheckedAt) : '',
    lastLiveAt: streamState && streamState.lastLiveAt ? String(streamState.lastLiveAt) : ''
  };
}

function markOfficialQueueWaitingLiveGate(row, cfg, reason = 'waiting_stream_live_offline') {
  const ocfg = officialConfig(cfg);
  const retryMs = Math.max(30000, Number(ocfg.liveGateRetryMs || ocfg.streamWaitRetryMs || ocfg.globalCooldownMs || 120000));
  const next = isoFromMs(Date.now() + retryMs);
  const error = reason;
  database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, {
    id: row.id,
    next,
    now: nowIso(),
    error
  });
  state.officialShoutout.lastError = error;
  emitShoutoutBus('shoutout.official.waiting_stream_live', {
    queueId: row.id,
    targetLogin: row.target_login,
    error,
    retryAt: next,
    liveGate: true
  }, cfg);
  return { ok: true, waiting: true, reason: error, queueId: row.id, error, retryAt: next, liveGate: true };
}

function officialConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.officialShoutout, (cfg && cfg.officialShoutout) || {});
}

function shouldSendOfficialChatMessages(cfg) {
  return officialConfig(cfg).sendChatMessages !== false;
}


function officialRowVars(row = {}, extra = {}) {
  const login = cleanLogin(row.target_login || extra.login || extra.targetLogin || '');
  const displayName = cleanDisplay(row.target_display || extra.displayName || extra.targetDisplay || login, login);
  return {
    ...extra,
    login,
    targetLogin: login,
    displayName,
    targetDisplay: displayName,
    user: displayName,
    reason: extra.reason || row.last_error || '',
    queueId: Number(row.id || extra.queueId || 0)
  };
}

function rawOfficialErrorText(err) {
  if (err && err.response && err.response.data) {
    try { return JSON.stringify(err.response.data); } catch (_) { return String(err.response.data); }
  }
  return err && err.message ? String(err.message) : String(err || 'official_shoutout_error');
}

function friendlyOfficialQueueError(rawError) {
  const text = String(rawError || '').toLowerCase();
  if (isTwitchLiveWaitError(rawError)) return 'waiting_stream_live';
  if (text.includes('cooldown') || text.includes('too often') || text.includes('too frequently')) return 'waiting_twitch_cooldown';
  if (text.includes('not allowed') || text.includes('cannot') || text.includes('bad request') || text.includes('400')) return 'twitch_shoutout_currently_not_allowed';
  if (text.includes('twitch_user_token_missing')) return 'twitch_user_token_missing';
  if (text.includes('twitch_client_id_missing')) return 'twitch_client_id_missing';
  if (text.includes('broadcaster_id_missing')) return 'broadcaster_id_missing';
  if (text.includes('moderator_id_missing')) return 'moderator_id_missing';
  if (text.includes('target_user_id_missing')) return 'target_user_id_missing';
  return 'twitch_shoutout_retrying';
}

function buildOfficialWaitingChatMessage(row, cfg, reason = '') {
  const ocfg = officialConfig(cfg);
  const vars = officialRowVars(row, { reason });
  const fromTextSystem = renderShoutoutModuleText('shoutout.official.waiting', vars)
    || renderShoutoutModuleText('shoutout.official.queued', vars);
  const fallback = renderTemplate(firstString(ocfg.targetCooldownMessage, ocfg.queuedMessage, DEFAULT_CONFIG.clipShoutout.officialShoutout.targetCooldownMessage), vars).trim();
  return stripChatTimePromise(fromTextSystem || fallback);
}

function buildOfficialFailedChatMessage(row, cfg, reason = '') {
  const ocfg = officialConfig(cfg);
  const vars = officialRowVars(row, { reason });
  const fromTextSystem = renderShoutoutModuleText('shoutout.official.failed', vars);
  const fallback = renderTemplate(firstString(ocfg.failedMessage, DEFAULT_CONFIG.clipShoutout.officialShoutout.failedMessage), vars).trim();
  return stripChatTimePromise(fromTextSystem || fallback);
}

async function sendOfficialWaitingNotice(row, cfg, reason, meta = {}) {
  if (!shouldSendOfficialChatMessages(cfg)) return { ok: false, skipped: true, reason: 'official_chat_disabled' };
  const message = buildOfficialWaitingChatMessage(row, cfg, reason);
  if (!message) return { ok: false, skipped: true, reason: 'empty_message' };
  return sendChatMessage(message, {
    targetLogin: row.target_login,
    queueId: row.id,
    officialShoutout: true,
    textKey: 'shoutout.official.waiting',
    officialWaitingReason: reason,
    ...(meta || {})
  });
}

async function sendOfficialFailedNotice(row, cfg, reason, meta = {}) {
  if (!shouldSendOfficialChatMessages(cfg)) return { ok: false, skipped: true, reason: 'official_chat_disabled' };
  const message = buildOfficialFailedChatMessage(row, cfg, reason);
  if (!message) return { ok: false, skipped: true, reason: 'empty_message' };
  return sendChatMessage(message, {
    targetLogin: row.target_login,
    queueId: row.id,
    officialShoutout: true,
    textKey: 'shoutout.official.failed',
    officialWaitingReason: reason,
    ...(meta || {})
  });
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
  ensureTableColumn('clip_shoutout_official_queue', 'display_queue_id', 'INTEGER NOT NULL DEFAULT 0');
  ensureTableColumn('clip_shoutout_official_history', 'display_queue_id', 'INTEGER NOT NULL DEFAULT 0');
  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_so_official_display_queue ON clip_shoutout_official_queue(display_queue_id);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_so_history_display_queue ON clip_shoutout_official_history(display_queue_id);`);
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
    const now = nowIso();
    database.run(`
      UPDATE clip_shoutout_official_queue
      SET target_display = CASE WHEN :targetDisplay <> '' THEN :targetDisplay ELSE target_display END,
          target_user_id = CASE WHEN :targetUserId <> '' THEN :targetUserId ELSE target_user_id END,
          requested_by_login = CASE WHEN :requestedByLogin <> '' THEN :requestedByLogin ELSE requested_by_login END,
          requested_by_display = CASE WHEN :requestedByDisplay <> '' THEN :requestedByDisplay ELSE requested_by_display END,
          clip_id = CASE WHEN :clipId <> '' THEN :clipId ELSE clip_id END,
          clip_url = CASE WHEN :clipUrl <> '' THEN :clipUrl ELSE clip_url END,
          bundle_id = CASE WHEN :bundleId <> '' THEN :bundleId ELSE bundle_id END,
          display_queue_id = CASE WHEN :displayQueueId > 0 THEN :displayQueueId ELSE display_queue_id END,
          updated_at = :updatedAt
      WHERE id = :id
    `, {
      id: existing.id,
      targetDisplay: cleanDisplay(job.targetDisplay, login),
      targetUserId: String(job.targetUserId || ''),
      requestedByLogin: cleanLogin(job.requestedByLogin || ''),
      requestedByDisplay: cleanDisplay(job.requestedByDisplay || ''),
      clipId: String(job.clipId || ''),
      clipUrl: String(job.clipUrl || ''),
      bundleId: String(job.bundleId || ''),
      displayQueueId: Number(job.displayQueueId || 0),
      updatedAt: now
    });
    const refreshed = database.get(`SELECT * FROM clip_shoutout_official_queue WHERE id=:id`, { id: existing.id }) || existing;
    emitShoutoutBus("shoutout.official.duplicate", { targetLogin: login, queueId: existing.id, reused: true }, cfg);
    return { ok: true, duplicate: true, row: refreshed };
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
    displayQueueId: Number(job.displayQueueId || 0),
    availableAt,
    createdAt: now,
    updatedAt: now,
    metaJson: JSON.stringify(job.meta || {})
  };
  const result = database.run(`
    INSERT INTO clip_shoutout_official_queue (
      target_login,target_display,target_user_id,requested_by_login,requested_by_display,
      clip_id,clip_url,bundle_id,display_queue_id,status,attempts,available_at,created_at,updated_at,meta_json
    ) VALUES (
      :targetLogin,:targetDisplay,:targetUserId,:requestedByLogin,:requestedByDisplay,
      :clipId,:clipUrl,:bundleId,:displayQueueId,'queued',0,:availableAt,:createdAt,:updatedAt,:metaJson
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
  database.run(`INSERT INTO clip_shoutout_official_history (target_login,target_display,target_user_id,queue_id,display_queue_id,result,error,sent_at,meta_json) VALUES (:login,:display,:userId,:queueId,:displayQueueId,'failed',:error,:sentAt,:metaJson)`, {
    login: row.target_login,
    display: row.target_display || row.target_login,
    userId: row.target_user_id || "",
    queueId: row.id,
    displayQueueId: Number(row.display_queue_id || 0),
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
  database.run(`INSERT INTO clip_shoutout_official_history (target_login,target_display,target_user_id,queue_id,display_queue_id,result,error,sent_at,meta_json) VALUES (:login,:display,:userId,:queueId,:displayQueueId,'sent','',:sentAt,:metaJson)`, {
    login: row.target_login,
    display: row.target_display || row.target_login,
    userId: row.target_user_id || "",
    queueId: row.id,
    displayQueueId: Number(row.display_queue_id || 0),
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

async function processOfficialShoutoutQueueRow(env, rowInput, cfg, options = {}) {
  const ocfg = officialConfig(cfg);
  if (ocfg.enabled === false) return { ok: true, skipped: true, reason: "official_shoutout_disabled" };
  ensureOfficialShoutoutSchema();

  const rowId = Number(rowInput && rowInput.id || 0);
  const row = rowId
    ? database.get(`SELECT * FROM clip_shoutout_official_queue WHERE id=:id AND status IN ('queued','waiting') LIMIT 1`, { id: rowId })
    : null;
  if (!row) return { ok: true, empty: true, reason: 'official_queue_row_not_open', queueId: rowId };

  state.officialShoutout.lastWorkerAt = nowIso();
  const notifyChat = options.notifyChat === true;
  const nowMs = Date.now();
  const availabilityBaseMs = options.manualAttempt === true ? Date.now() : msFromIso(row.available_at);
  const availableMs = calculateOfficialAvailableAt(row.target_login, cfg, availabilityBaseMs);

  if (!options.force && availableMs > nowMs) {
    const availableAt = isoFromMs(availableMs);
    const reason = 'waiting_official_cooldown';
    database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', available_at=:availableAt, updated_at=:now, last_error=:reason WHERE id=:id`, {
      id: row.id,
      availableAt,
      now: nowIso(),
      reason
    });
    state.officialShoutout.lastError = reason;
    emitShoutoutBus("shoutout.official.waiting_cooldown", { queueId: row.id, targetLogin: row.target_login, availableAt }, cfg);
    if (notifyChat) await sendOfficialWaitingNotice(row, cfg, reason, { manualOfficialAttempt: true, availableAt });
    return { ok: true, waiting: true, queueId: row.id, reason, availableAt };
  }

  if (Number(row.attempts || 0) >= Number(ocfg.maxAttempts || 5)) {
    const reason = 'max_attempts_reached';
    markOfficialQueueFailed(row, reason, cfg);
    if (notifyChat) await sendOfficialFailedNotice(row, cfg, reason, { manualOfficialAttempt: true });
    return { ok: false, failed: true, error: reason, queueId: row.id };
  }

  const sceneGate = readShoutoutSceneGateState(cfg, env);
  if (!options.force && sceneGate.active === true) {
    const result = blockQueueBySceneGate('clip_shoutout_official_queue', row, sceneGate, 'shoutout.official.waiting_start_scene', cfg);
    if (notifyChat) await sendOfficialWaitingNotice(row, cfg, result.reason || 'waiting_start_scene', { manualOfficialAttempt: true, sceneGate: true });
    return result;
  }

  const liveGate = buildOfficialLiveGateState(cfg);
  if (liveGate.enabled && !liveGate.live) {
    const result = markOfficialQueueWaitingLiveGate(row, cfg, liveGate.reason || 'waiting_stream_live_offline');
    if (notifyChat) await sendOfficialWaitingNotice(row, cfg, result.reason || 'waiting_stream_live_offline', { manualOfficialAttempt: true, liveGate: true });
    return result;
  }

  try {
    emitShoutoutBus("shoutout.official.sending", { queueId: row.id, targetLogin: row.target_login, liveGate }, cfg);
    const result = await sendOfficialTwitchShoutout(env, row, cfg);
    markOfficialQueueSent(row, result, cfg);
    return { ok: true, sent: true, queueId: row.id, result };
  } catch (err) {
    const rawError = rawOfficialErrorText(err);
    const friendlyError = friendlyOfficialQueueError(rawError);

    if (isTwitchLiveWaitError(rawError)) {
      const next = isoFromMs(Date.now() + Math.max(30000, Number(ocfg.streamWaitRetryMs || ocfg.liveGateRetryMs || ocfg.globalCooldownMs || 120000)));
      database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, {
        id: row.id,
        next,
        now: nowIso(),
        error: friendlyError
      });
      state.officialShoutout.lastError = friendlyError;
      emitShoutoutBus("shoutout.official.waiting_stream_live", { queueId: row.id, targetLogin: row.target_login, error: friendlyError, retryAt: next }, cfg);
      if (notifyChat) await sendOfficialWaitingNotice(row, cfg, friendlyError, { manualOfficialAttempt: true, retryAt: next });
      return { ok: true, waiting: true, reason: friendlyError, queueId: row.id, error: friendlyError, retryAt: next };
    }

    const next = isoFromMs(Date.now() + Math.max(30000, Number(ocfg.globalCooldownMs || 120000)));
    database.run(`UPDATE clip_shoutout_official_queue SET status='waiting', attempts=attempts+1, available_at=:next, updated_at=:now, last_error=:error WHERE id=:id`, {
      id: row.id,
      next,
      now: nowIso(),
      error: friendlyError
    });
    state.officialShoutout.lastError = friendlyError;
    state.stats.officialFailed += 1;
    emitShoutoutBus("shoutout.official.failed", { queueId: row.id, targetLogin: row.target_login, error: friendlyError, retryAt: next }, cfg);
    if (notifyChat) await sendOfficialWaitingNotice(row, cfg, friendlyError, { manualOfficialAttempt: true, retryAt: next });
    return { ok: false, retry: true, queueId: row.id, error: friendlyError, retryAt: next };
  }
}

async function processOfficialShoutoutQueue(env, cfg, options = {}) {
  const ocfg = officialConfig(cfg);
  if (ocfg.enabled === false) return { ok: true, skipped: true, reason: "official_shoutout_disabled" };
  ensureOfficialShoutoutSchema();
  state.officialShoutout.lastWorkerAt = nowIso();
  const row = database.get(`SELECT * FROM clip_shoutout_official_queue WHERE status IN ('queued','waiting') ORDER BY available_at ASC, id ASC LIMIT 1`);
  if (!row) return { ok: true, empty: true };
  return processOfficialShoutoutQueueRow(env, row, cfg, {
    ...options,
    notifyChat: options.notifyChat === true,
    manualAttempt: options.manualAttempt === true
  });
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
  const ocfg = officialConfig(cfg);
  return {
    enabled: ocfg.enabled !== false,
    workerStarted: state.officialShoutout.workerStarted,
    liveGate: {
      ...buildOfficialLiveGateState(cfg),
      retryMs: Math.max(30000, Number(ocfg.liveGateRetryMs || ocfg.streamWaitRetryMs || ocfg.globalCooldownMs || 120000))
    },
    pending: queue.length,
    queue,
    history,
    nextGlobalAllowedAt: isoFromMs(nextGlobalAllowedAt(cfg)) || "",
    lastSentAt: state.officialShoutout.lastSentAt,
    lastError: state.officialShoutout.lastError
  };
}

function normalizeTimelineDisplayRow(row) {
  if (!row) return null;
  const officialQueue = database.get(`
    SELECT * FROM clip_shoutout_official_queue
    WHERE display_queue_id=:displayQueueId
    ORDER BY id DESC LIMIT 1
  `, { displayQueueId: Number(row.id || 0) });
  const officialHistory = database.get(`
    SELECT * FROM clip_shoutout_official_history
    WHERE display_queue_id=:displayQueueId
    ORDER BY id DESC LIMIT 1
  `, { displayQueueId: Number(row.id || 0) });
  const meta = safeJsonParse(row.meta_json, {});
  const input = safeJsonParse(row.input_json, {});
  return {
    id: Number(row.id || 0),
    targetLogin: row.target_login || '',
    targetDisplay: row.target_display || row.target_login || '',
    requestedByLogin: row.requested_by_login || '',
    requestedByDisplay: row.requested_by_display || '',
    status: row.status || '',
    streamDayId: row.stream_day_id || '',
    overrideUsed: Number(row.override_used || 0) === 1,
    overrideByLogin: row.override_by_login || '',
    overrideReason: row.override_reason || '',
    requestedAt: row.created_at || '',
    displayQueuedAt: row.created_at || '',
    displayAvailableAt: row.available_at || '',
    displayStartedAt: row.started_at || '',
    displayFinishedAt: row.finished_at || '',
    displayLastError: row.last_error || '',
    officialQueueId: officialQueue ? Number(officialQueue.id || 0) : 0,
    officialQueuedAt: officialQueue ? (officialQueue.created_at || '') : '',
    officialAvailableAt: officialQueue ? (officialQueue.available_at || '') : '',
    officialSentAt: officialQueue ? (officialQueue.sent_at || '') : (officialHistory ? (officialHistory.sent_at || '') : ''),
    officialStatus: officialQueue ? (officialQueue.status || '') : '',
    officialResult: officialHistory ? (officialHistory.result || '') : '',
    officialError: officialHistory ? (officialHistory.error || '') : (officialQueue ? (officialQueue.last_error || '') : ''),
    meta,
    inputSummary: summarizeInput(input)
  };
}

function buildShoutoutTimeline(options = {}) {
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();
  ensureStreamDaySchema();
  const limit = Math.max(1, Math.min(500, Number.parseInt(options.limit, 10) || 100));
  const targetLogin = cleanLogin(options.target || options.targetLogin || '');
  const streamDayId = String(options.streamDayId || '').trim();
  const where = [];
  const params = { limit };
  if (targetLogin) {
    where.push('target_login=:targetLogin');
    params.targetLogin = targetLogin;
  }
  if (streamDayId) {
    where.push('stream_day_id=:streamDayId');
    params.streamDayId = streamDayId;
  }
  if (options.since) {
    where.push('created_at>=:since');
    params.since = String(options.since);
  }
  if (options.until) {
    where.push('created_at<:until');
    params.until = String(options.until);
  }
  const rows = database.all(`
    SELECT * FROM clip_shoutout_display_queue
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY id DESC
    LIMIT :limit
  `, params);
  const items = rows.map(normalizeTimelineDisplayRow).filter(Boolean);
  const streamDays = database.all(`
    SELECT * FROM clip_shoutout_stream_days
    ORDER BY id DESC
    LIMIT 20
  `);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    count: items.length,
    items,
    streamDays
  };
}


function normalizeStatsRow(row = {}) {
  const out = {};
  for (const [key, value] of Object.entries(row || {})) {
    if (typeof value === 'bigint') out[key] = Number(value);
    else out[key] = value;
  }
  return out;
}

function normalizeStatsRows(rows) {
  return Array.isArray(rows) ? rows.map(normalizeStatsRow) : [];
}

function buildShoutoutStats(options = {}) {
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();
  ensureStreamDaySchema();

  const limit = Math.max(1, Math.min(200, Number.parseInt(options.limit, 10) || 50));
  const detailLimit = Math.max(1, Math.min(300, Number.parseInt(options.detailLimit, 10) || 120));
  const targetLogin = cleanLogin(options.target || options.targetLogin || '');
  const requesterLogin = cleanLogin(options.requester || options.requestedBy || options.requestedByLogin || '');
  const streamDayId = String(options.streamDayId || '').trim();

  const baseWhere = ["status<>'removed'"];
  const baseParams = {};
  if (streamDayId) {
    baseWhere.push('stream_day_id=:streamDayId');
    baseParams.streamDayId = streamDayId;
  }
  const baseWhereSql = baseWhere.length ? `WHERE ${baseWhere.join(' AND ')}` : '';

  const totals = normalizeStatsRow(database.get(`
    SELECT
      COUNT(*) AS totalRequests,
      COUNT(DISTINCT NULLIF(target_login,'')) AS uniqueTargets,
      COUNT(DISTINCT NULLIF(requested_by_login,'')) AS uniqueRequesters,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
      SUM(CASE WHEN status IN ('queued','waiting','active') THEN 1 ELSE 0 END) AS displayPending,
      SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS displayFailed,
      SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
      MIN(created_at) AS firstRequestedAt,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    ${baseWhereSql}
  `, baseParams) || {});

  const officialTotals = normalizeStatsRow(database.get(`
    SELECT
      COUNT(*) AS officialHistoryTotal,
      SUM(CASE WHEN result='sent' THEN 1 ELSE 0 END) AS officialSent,
      SUM(CASE WHEN result='failed' THEN 1 ELSE 0 END) AS officialFailed,
      MAX(sent_at) AS lastOfficialAt
    FROM clip_shoutout_official_history
  `) || {});

  const officialQueueTotals = normalizeStatsRow(database.get(`
    SELECT
      COUNT(*) AS officialQueueOpen,
      SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS officialQueued,
      SUM(CASE WHEN status='waiting' THEN 1 ELSE 0 END) AS officialWaiting,
      SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS officialOpenFailed
    FROM clip_shoutout_official_queue
    WHERE status IN ('queued','waiting','failed')
  `) || {});

  const targetStats = normalizeStatsRows(database.all(`
    SELECT
      target_login AS targetLogin,
      COALESCE(NULLIF(MAX(target_display),''), target_login) AS targetDisplay,
      COUNT(*) AS total,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
      SUM(CASE WHEN status IN ('queued','waiting','active') THEN 1 ELSE 0 END) AS displayPending,
      SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS displayFailed,
      SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
      COUNT(DISTINCT NULLIF(requested_by_login,'')) AS uniqueRequesters,
      MIN(created_at) AS firstRequestedAt,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    ${baseWhereSql}
    GROUP BY target_login
    ORDER BY total DESC, lastRequestedAt DESC
    LIMIT :limit
  `, { ...baseParams, limit }));

  const requesterStats = normalizeStatsRows(database.all(`
    SELECT
      requested_by_login AS requesterLogin,
      COALESCE(NULLIF(MAX(requested_by_display),''), requested_by_login) AS requesterDisplay,
      COUNT(*) AS total,
      COUNT(DISTINCT NULLIF(target_login,'')) AS uniqueTargets,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
      SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
      MIN(created_at) AS firstRequestedAt,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    ${baseWhereSql}
    GROUP BY requested_by_login
    ORDER BY total DESC, lastRequestedAt DESC
    LIMIT :limit
  `, { ...baseParams, limit }));

  const pairStats = normalizeStatsRows(database.all(`
    SELECT
      requested_by_login AS requesterLogin,
      COALESCE(NULLIF(MAX(requested_by_display),''), requested_by_login) AS requesterDisplay,
      target_login AS targetLogin,
      COALESCE(NULLIF(MAX(target_display),''), target_login) AS targetDisplay,
      COUNT(*) AS total,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
      SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    ${baseWhereSql}
    GROUP BY requested_by_login, target_login
    ORDER BY total DESC, lastRequestedAt DESC
    LIMIT :limit
  `, { ...baseParams, limit }));

  const streamDayStats = normalizeStatsRows(database.all(`
    SELECT
      stream_day_id AS streamDayId,
      COUNT(*) AS total,
      COUNT(DISTINCT NULLIF(target_login,'')) AS uniqueTargets,
      COUNT(DISTINCT NULLIF(requested_by_login,'')) AS uniqueRequesters,
      SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
      MIN(created_at) AS firstRequestedAt,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    WHERE status<>'removed' AND stream_day_id<>''
    GROUP BY stream_day_id
    ORDER BY lastRequestedAt DESC
    LIMIT 20
  `));

  const targetOptions = normalizeStatsRows(database.all(`
    SELECT
      target_login AS login,
      COALESCE(NULLIF(MAX(target_display),''), target_login) AS display,
      COUNT(*) AS total,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    WHERE status<>'removed' AND target_login<>''
    GROUP BY target_login
    ORDER BY display COLLATE NOCASE ASC
  `));

  const requesterOptions = normalizeStatsRows(database.all(`
    SELECT
      requested_by_login AS login,
      COALESCE(NULLIF(MAX(requested_by_display),''), requested_by_login) AS display,
      COUNT(*) AS total,
      MAX(created_at) AS lastRequestedAt
    FROM clip_shoutout_display_queue
    WHERE status<>'removed' AND requested_by_login<>''
    GROUP BY requested_by_login
    ORDER BY display COLLATE NOCASE ASC
  `));

  let selectedTarget = null;
  if (targetLogin) {
    const summary = normalizeStatsRow(database.get(`
      SELECT
        target_login AS targetLogin,
        COALESCE(NULLIF(MAX(target_display),''), target_login) AS targetDisplay,
        COUNT(*) AS total,
        COUNT(DISTINCT NULLIF(requested_by_login,'')) AS uniqueRequesters,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
        SUM(CASE WHEN status IN ('queued','waiting','active') THEN 1 ELSE 0 END) AS displayPending,
        SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS displayFailed,
        SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
        MIN(created_at) AS firstRequestedAt,
        MAX(created_at) AS lastRequestedAt
      FROM clip_shoutout_display_queue
      WHERE status<>'removed' AND target_login=:targetLogin
      ${streamDayId ? 'AND stream_day_id=:streamDayId' : ''}
      GROUP BY target_login
    `, { targetLogin, ...(streamDayId ? { streamDayId } : {}) }) || { targetLogin, targetDisplay: targetLogin });
    selectedTarget = {
      summary,
      byRequester: normalizeStatsRows(database.all(`
        SELECT
          requested_by_login AS requesterLogin,
          COALESCE(NULLIF(MAX(requested_by_display),''), requested_by_login) AS requesterDisplay,
          COUNT(*) AS total,
          SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
          MAX(created_at) AS lastRequestedAt
        FROM clip_shoutout_display_queue
        WHERE status<>'removed' AND target_login=:targetLogin
        ${streamDayId ? 'AND stream_day_id=:streamDayId' : ''}
        GROUP BY requested_by_login
        ORDER BY total DESC, lastRequestedAt DESC
        LIMIT :limit
      `, { targetLogin, ...(streamDayId ? { streamDayId } : {}), limit })),
      timeline: buildShoutoutTimeline({ targetLogin, streamDayId, limit: detailLimit }).items || []
    };
  }

  let selectedRequester = null;
  if (requesterLogin) {
    const summary = normalizeStatsRow(database.get(`
      SELECT
        requested_by_login AS requesterLogin,
        COALESCE(NULLIF(MAX(requested_by_display),''), requested_by_login) AS requesterDisplay,
        COUNT(*) AS total,
        COUNT(DISTINCT NULLIF(target_login,'')) AS uniqueTargets,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS displayDone,
        SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
        MIN(created_at) AS firstRequestedAt,
        MAX(created_at) AS lastRequestedAt
      FROM clip_shoutout_display_queue
      WHERE status<>'removed' AND requested_by_login=:requesterLogin
      ${streamDayId ? 'AND stream_day_id=:streamDayId' : ''}
      GROUP BY requested_by_login
    `, { requesterLogin, ...(streamDayId ? { streamDayId } : {}) }) || { requesterLogin, requesterDisplay: requesterLogin });
    selectedRequester = {
      summary,
      byTarget: normalizeStatsRows(database.all(`
        SELECT
          target_login AS targetLogin,
          COALESCE(NULLIF(MAX(target_display),''), target_login) AS targetDisplay,
          COUNT(*) AS total,
          SUM(CASE WHEN override_used=1 THEN 1 ELSE 0 END) AS overrideCount,
          MAX(created_at) AS lastRequestedAt
        FROM clip_shoutout_display_queue
        WHERE status<>'removed' AND requested_by_login=:requesterLogin
        ${streamDayId ? 'AND stream_day_id=:streamDayId' : ''}
        GROUP BY target_login
        ORDER BY total DESC, lastRequestedAt DESC
        LIMIT :limit
      `, { requesterLogin, ...(streamDayId ? { streamDayId } : {}), limit })),
      timeline: buildShoutoutTimeline({ limit: detailLimit, streamDayId }).items.filter(item => cleanLogin(item.requestedByLogin) === requesterLogin)
    };
  }

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    filters: { targetLogin, requesterLogin, streamDayId, limit, detailLimit },
    totals: { ...totals, ...officialTotals, ...officialQueueTotals },
    targetStats,
    requesterStats,
    pairStats,
    streamDayStats,
    targetOptions,
    requesterOptions,
    selectedTarget,
    selectedRequester
  };
}


function inboundShoutoutConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.inboundShoutout, (cfg && cfg.inboundShoutout) || {});
}

function ensureInboundShoutoutSchema() {
  database.ensureReady();
  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_inbound_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_uid TEXT NOT NULL UNIQUE,
      direction TEXT NOT NULL DEFAULT '',
      event_type TEXT NOT NULL DEFAULT '',
      subscription_id TEXT NOT NULL DEFAULT '',
      message_id TEXT NOT NULL DEFAULT '',
      message_timestamp TEXT NOT NULL DEFAULT '',
      broadcaster_user_id TEXT NOT NULL DEFAULT '',
      broadcaster_login TEXT NOT NULL DEFAULT '',
      broadcaster_display TEXT NOT NULL DEFAULT '',
      from_broadcaster_user_id TEXT NOT NULL DEFAULT '',
      from_broadcaster_login TEXT NOT NULL DEFAULT '',
      from_broadcaster_display TEXT NOT NULL DEFAULT '',
      to_broadcaster_user_id TEXT NOT NULL DEFAULT '',
      to_broadcaster_login TEXT NOT NULL DEFAULT '',
      to_broadcaster_display TEXT NOT NULL DEFAULT '',
      moderator_user_id TEXT NOT NULL DEFAULT '',
      moderator_login TEXT NOT NULL DEFAULT '',
      moderator_display TEXT NOT NULL DEFAULT '',
      viewer_count INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL DEFAULT '',
      cooldown_ends_at TEXT NOT NULL DEFAULT '',
      target_cooldown_ends_at TEXT NOT NULL DEFAULT '',
      received_at TEXT NOT NULL,
      raw_json TEXT NOT NULL DEFAULT '{}',
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_clip_so_inbound_direction_received ON clip_shoutout_inbound_events(direction, received_at);
    CREATE INDEX IF NOT EXISTS idx_clip_so_inbound_from_login ON clip_shoutout_inbound_events(from_broadcaster_login, received_at);
    CREATE INDEX IF NOT EXISTS idx_clip_so_inbound_to_login ON clip_shoutout_inbound_events(to_broadcaster_login, received_at);
  `);
}

function isShoutoutEventType(value) {
  const type = String(value || '').trim();
  return type === 'channel.shoutout.receive' || type === 'channel.shoutout.create';
}

function makeInboundEventUid(eventType, event = {}, meta = {}, subscription = {}) {
  const messageId = String(meta.message_id || meta.messageId || '').trim();
  if (messageId) return `eventsub:${messageId}`;
  const subId = String(subscription.id || '').trim();
  const basis = JSON.stringify({ eventType, subId, event });
  return `eventsub:${crypto.createHash('sha256').update(basis).digest('hex').slice(0, 40)}`;
}

function normalizeTwitchShoutoutEvent(eventType, event = {}, meta = {}, subscription = {}) {
  const type = String(eventType || '').trim();
  if (!isShoutoutEventType(type)) return null;

  const isReceive = type === 'channel.shoutout.receive';
  const direction = isReceive ? 'incoming' : 'outgoing';
  const broadcasterLogin = cleanLogin(event.broadcaster_user_login || '');
  const broadcasterDisplay = cleanDisplay(event.broadcaster_user_name || broadcasterLogin, broadcasterLogin);
  const fromLogin = cleanLogin(isReceive ? event.from_broadcaster_user_login : event.broadcaster_user_login);
  const fromDisplay = cleanDisplay(isReceive ? event.from_broadcaster_user_name : event.broadcaster_user_name, fromLogin);
  const toLogin = cleanLogin(isReceive ? event.broadcaster_user_login : event.to_broadcaster_user_login);
  const toDisplay = cleanDisplay(isReceive ? event.broadcaster_user_name : event.to_broadcaster_user_name, toLogin);

  return {
    eventUid: makeInboundEventUid(type, event, meta, subscription),
    direction,
    eventType: type,
    subscriptionId: String(subscription.id || ''),
    messageId: String(meta.message_id || meta.messageId || ''),
    messageTimestamp: String(meta.message_timestamp || meta.messageTimestamp || ''),
    broadcasterUserId: String(event.broadcaster_user_id || ''),
    broadcasterLogin,
    broadcasterDisplay,
    fromBroadcasterUserId: String(isReceive ? (event.from_broadcaster_user_id || '') : (event.broadcaster_user_id || '')),
    fromBroadcasterLogin: fromLogin,
    fromBroadcasterDisplay: fromDisplay,
    toBroadcasterUserId: String(isReceive ? (event.broadcaster_user_id || '') : (event.to_broadcaster_user_id || '')),
    toBroadcasterLogin: toLogin,
    toBroadcasterDisplay: toDisplay,
    moderatorUserId: String(event.moderator_user_id || ''),
    moderatorLogin: cleanLogin(event.moderator_user_login || ''),
    moderatorDisplay: cleanDisplay(event.moderator_user_name || event.moderator_user_login || ''),
    viewerCount: Number(event.viewer_count || event.viewers || 0) || 0,
    startedAt: String(event.started_at || ''),
    cooldownEndsAt: String(event.cooldown_ends_at || ''),
    targetCooldownEndsAt: String(event.target_cooldown_ends_at || ''),
    receivedAt: nowIso(),
    rawEvent: event || {},
    meta: { meta: meta || {}, subscription: subscription || {} }
  };
}

function insertInboundShoutoutRecord(record, cfg = null) {
  ensureInboundShoutoutSchema();
  const currentCfg = cfg || shoutoutConfig();
  const icfg = inboundShoutoutConfig(currentCfg);
  if (icfg.enabled === false) return { ok: true, skipped: true, reason: 'inbound_shoutout_disabled' };

  const params = {
    eventUid: record.eventUid,
    direction: record.direction,
    eventType: record.eventType,
    subscriptionId: record.subscriptionId,
    messageId: record.messageId,
    messageTimestamp: record.messageTimestamp,
    broadcasterUserId: record.broadcasterUserId,
    broadcasterLogin: record.broadcasterLogin,
    broadcasterDisplay: record.broadcasterDisplay,
    fromBroadcasterUserId: record.fromBroadcasterUserId,
    fromBroadcasterLogin: record.fromBroadcasterLogin,
    fromBroadcasterDisplay: record.fromBroadcasterDisplay,
    toBroadcasterUserId: record.toBroadcasterUserId,
    toBroadcasterLogin: record.toBroadcasterLogin,
    toBroadcasterDisplay: record.toBroadcasterDisplay,
    moderatorUserId: record.moderatorUserId,
    moderatorLogin: record.moderatorLogin,
    moderatorDisplay: record.moderatorDisplay,
    viewerCount: Number(record.viewerCount || 0),
    startedAt: record.startedAt,
    cooldownEndsAt: record.cooldownEndsAt,
    targetCooldownEndsAt: record.targetCooldownEndsAt,
    receivedAt: record.receivedAt || nowIso(),
    rawJson: icfg.storeRawEvent === false ? '{}' : JSON.stringify(record.rawEvent || {}),
    metaJson: JSON.stringify(record.meta || {})
  };

  const existing = database.get(`SELECT id FROM clip_shoutout_inbound_events WHERE event_uid=:eventUid`, { eventUid: params.eventUid });
  if (existing) {
    state.stats.inboundDuplicates += 1;
    return { ok: true, duplicate: true, id: existing.id, record };
  }

  const result = database.run(`
    INSERT INTO clip_shoutout_inbound_events (
      event_uid,direction,event_type,subscription_id,message_id,message_timestamp,
      broadcaster_user_id,broadcaster_login,broadcaster_display,
      from_broadcaster_user_id,from_broadcaster_login,from_broadcaster_display,
      to_broadcaster_user_id,to_broadcaster_login,to_broadcaster_display,
      moderator_user_id,moderator_login,moderator_display,
      viewer_count,started_at,cooldown_ends_at,target_cooldown_ends_at,
      received_at,raw_json,meta_json
    ) VALUES (
      :eventUid,:direction,:eventType,:subscriptionId,:messageId,:messageTimestamp,
      :broadcasterUserId,:broadcasterLogin,:broadcasterDisplay,
      :fromBroadcasterUserId,:fromBroadcasterLogin,:fromBroadcasterDisplay,
      :toBroadcasterUserId,:toBroadcasterLogin,:toBroadcasterDisplay,
      :moderatorUserId,:moderatorLogin,:moderatorDisplay,
      :viewerCount,:startedAt,:cooldownEndsAt,:targetCooldownEndsAt,
      :receivedAt,:rawJson,:metaJson
    )
  `, params);

  const id = result && (result.lastInsertRowid || result.lastInsertRowId) ? (result.lastInsertRowid || result.lastInsertRowId) : 0;
  if (record.direction === 'incoming') state.stats.inboundReceived += 1;
  if (record.direction === 'outgoing') state.stats.outboundCreated += 1;
  state.inboundShoutout.lastEventAt = params.receivedAt;
  state.inboundShoutout.lastEventType = params.eventType;
  state.inboundShoutout.lastDirection = params.direction;
  state.inboundShoutout.lastFromLogin = params.fromBroadcasterLogin;
  state.inboundShoutout.lastToLogin = params.toBroadcasterLogin;
  state.inboundShoutout.lastError = '';

  emitShoutoutBus(record.direction === 'incoming' ? 'shoutout.inbound.received' : 'shoutout.outbound.created', {
    id,
    eventUid: record.eventUid,
    eventType: record.eventType,
    direction: record.direction,
    fromBroadcasterLogin: record.fromBroadcasterLogin,
    fromBroadcasterDisplay: record.fromBroadcasterDisplay,
    toBroadcasterLogin: record.toBroadcasterLogin,
    toBroadcasterDisplay: record.toBroadcasterDisplay,
    viewerCount: record.viewerCount,
    startedAt: record.startedAt
  }, currentCfg);

  return { ok: true, id, record };
}

function recordTwitchShoutoutEvent(eventType, event = {}, meta = {}, subscription = {}) {
  try {
    const record = normalizeTwitchShoutoutEvent(eventType, event, meta, subscription);
    if (!record) return { ok: true, skipped: true, reason: 'not_shoutout_event' };
    return insertInboundShoutoutRecord(record, shoutoutConfig());
  } catch (err) {
    state.inboundShoutout.lastError = err && err.message ? err.message : String(err);
    return { ok: false, error: state.inboundShoutout.lastError };
  }
}

function normalizeInboundDbRow(row = {}) {
  return {
    id: Number(row.id || 0),
    eventUid: row.event_uid || '',
    direction: row.direction || '',
    eventType: row.event_type || '',
    subscriptionId: row.subscription_id || '',
    messageId: row.message_id || '',
    messageTimestamp: row.message_timestamp || '',
    broadcasterUserId: row.broadcaster_user_id || '',
    broadcasterLogin: row.broadcaster_login || '',
    broadcasterDisplay: row.broadcaster_display || row.broadcaster_login || '',
    fromBroadcasterUserId: row.from_broadcaster_user_id || '',
    fromBroadcasterLogin: row.from_broadcaster_login || '',
    fromBroadcasterDisplay: row.from_broadcaster_display || row.from_broadcaster_login || '',
    toBroadcasterUserId: row.to_broadcaster_user_id || '',
    toBroadcasterLogin: row.to_broadcaster_login || '',
    toBroadcasterDisplay: row.to_broadcaster_display || row.to_broadcaster_login || '',
    moderatorUserId: row.moderator_user_id || '',
    moderatorLogin: row.moderator_login || '',
    moderatorDisplay: row.moderator_display || row.moderator_login || '',
    viewerCount: Number(row.viewer_count || 0),
    startedAt: row.started_at || '',
    cooldownEndsAt: row.cooldown_ends_at || '',
    targetCooldownEndsAt: row.target_cooldown_ends_at || '',
    receivedAt: row.received_at || '',
    raw: safeJsonParse(row.raw_json, {}),
    meta: safeJsonParse(row.meta_json, {})
  };
}

function listInboundShoutoutEvents(options = {}) {
  ensureInboundShoutoutSchema();
  const limit = Math.max(1, Math.min(500, Number.parseInt(options.limit, 10) || 80));
  const direction = String(options.direction || '').trim().toLowerCase();
  const login = cleanLogin(options.login || '');
  const where = [];
  const params = { limit };
  if (direction === 'incoming' || direction === 'outgoing') {
    where.push('direction=:direction');
    params.direction = direction;
  }
  if (login) {
    where.push('(from_broadcaster_login=:login OR to_broadcaster_login=:login OR broadcaster_login=:login)');
    params.login = login;
  }
  const rows = database.all(`
    SELECT * FROM clip_shoutout_inbound_events
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY received_at DESC, id DESC
    LIMIT :limit
  `, params);
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    filters: { direction, login, limit },
    count: rows.length,
    items: rows.map(normalizeInboundDbRow)
  };
}

function buildInboundShoutoutStats(options = {}) {
  ensureInboundShoutoutSchema();
  const limit = Math.max(1, Math.min(200, Number.parseInt(options.limit, 10) || 50));
  const totals = normalizeStatsRow(database.get(`
    SELECT
      COUNT(*) AS totalEvents,
      SUM(CASE WHEN direction='incoming' THEN 1 ELSE 0 END) AS incomingTotal,
      SUM(CASE WHEN direction='outgoing' THEN 1 ELSE 0 END) AS outgoingTotal,
      COUNT(DISTINCT NULLIF(from_broadcaster_login,'')) AS uniqueFromChannels,
      COUNT(DISTINCT NULLIF(to_broadcaster_login,'')) AS uniqueToChannels,
      SUM(viewer_count) AS viewerCountTotal,
      MAX(received_at) AS lastReceivedAt
    FROM clip_shoutout_inbound_events
  `) || {});

  const incomingByFrom = normalizeStatsRows(database.all(`
    SELECT
      from_broadcaster_login AS login,
      COALESCE(NULLIF(MAX(from_broadcaster_display),''), from_broadcaster_login) AS display,
      COUNT(*) AS total,
      SUM(viewer_count) AS viewerCountTotal,
      MAX(received_at) AS lastReceivedAt
    FROM clip_shoutout_inbound_events
    WHERE direction='incoming'
    GROUP BY from_broadcaster_login
    ORDER BY total DESC, lastReceivedAt DESC
    LIMIT :limit
  `, { limit }));

  const outgoingByTarget = normalizeStatsRows(database.all(`
    SELECT
      to_broadcaster_login AS login,
      COALESCE(NULLIF(MAX(to_broadcaster_display),''), to_broadcaster_login) AS display,
      COUNT(*) AS total,
      SUM(viewer_count) AS viewerCountTotal,
      MAX(received_at) AS lastReceivedAt
    FROM clip_shoutout_inbound_events
    WHERE direction='outgoing'
    GROUP BY to_broadcaster_login
    ORDER BY total DESC, lastReceivedAt DESC
    LIMIT :limit
  `, { limit }));

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    totals,
    incomingByFrom,
    outgoingByTarget,
    recent: listInboundShoutoutEvents({ limit }).items
  };
}

async function buildShoutoutProductionCheck() {
  const requiredEventSubTypes = ['channel.shoutout.create', 'channel.shoutout.receive'];
  const requiredEventSubScopesAny = ['moderator:read:shoutouts', 'moderator:manage:shoutouts'];
  const requiredSendScope = 'moderator:manage:shoutouts';

  let auth = null;
  try {
    auth = await twitch.validateStoredUserToken();
  } catch (err) {
    auth = { ok: false, error: err && err.message ? err.message : String(err), scopes: [] };
  }

  let eventSub = null;
  try {
    eventSub = typeof twitch.getEventSubStatusSnapshot === 'function'
      ? twitch.getEventSubStatusSnapshot()
      : { ok: false, error: 'twitch_eventsub_status_export_missing' };
  } catch (err) {
    eventSub = { ok: false, error: err && err.message ? err.message : String(err) };
  }

  const scopes = Array.isArray(auth && auth.scopes) ? auth.scopes.map(String) : [];
  const hasReadOrManage = requiredEventSubScopesAny.some(scope => scopes.includes(scope));
  const hasManage = scopes.includes(requiredSendScope);
  const knownSubscriptions = Array.isArray(eventSub && eventSub.knownSubscriptions) ? eventSub.knownSubscriptions.map(String) : [];
  const configuredSubscriptions = Array.isArray(eventSub && eventSub.configuredSubscriptions) ? eventSub.configuredSubscriptions : [];
  const subscriptionChecks = requiredEventSubTypes.map(type => ({
    type,
    configured: configuredSubscriptions.some(row => String(row && row.type || '') === type),
    known: knownSubscriptions.some(key => key.startsWith(`${type}|`))
  }));
  const missingKnown = subscriptionChecks.filter(row => !row.known).map(row => row.type);
  const missingConfigured = subscriptionChecks.filter(row => !row.configured).map(row => row.type);
  const tokenUserMatchesBroadcaster = auth && Object.prototype.hasOwnProperty.call(auth, 'tokenUserMatchesBroadcaster')
    ? auth.tokenUserMatchesBroadcaster === true
    : Boolean(auth && auth.userId && eventSub && eventSub.broadcasterId && String(auth.userId) === String(eventSub.broadcasterId));

  const checks = {
    userTokenPresent: Boolean(auth && auth.ok),
    broadcasterIdConfigured: Boolean(eventSub && eventSub.broadcasterIdConfigured),
    tokenUserMatchesBroadcaster,
    shoutoutReadScope: hasReadOrManage,
    shoutoutManageScope: hasManage,
    eventSubConnected: Boolean(eventSub && eventSub.connected),
    shoutoutSubscriptionsConfigured: missingConfigured.length === 0,
    shoutoutSubscriptionsKnown: missingKnown.length === 0
  };

  const blocking = [];
  if (!checks.userTokenPresent) blocking.push('stored_user_token_missing_or_invalid');
  if (!checks.broadcasterIdConfigured) blocking.push('twitch_broadcaster_id_missing');
  if (!checks.tokenUserMatchesBroadcaster) blocking.push('websocket_moderator_user_id_must_match_user_token');
  if (!checks.shoutoutReadScope) blocking.push('missing_moderator_read_or_manage_shoutouts_scope');
  if (!checks.eventSubConnected) blocking.push('eventsub_websocket_not_connected');
  if (!checks.shoutoutSubscriptionsConfigured) blocking.push('shoutout_subscription_types_not_configured');
  if (!checks.shoutoutSubscriptionsKnown) blocking.push('shoutout_subscriptions_not_confirmed_in_current_session');

  const warnings = [];
  if (!checks.shoutoutManageScope) warnings.push('moderator_manage_shoutouts_missing_official_send_may_fail');
  if (eventSub && eventSub.state && eventSub.state.lastSubscribeError) warnings.push(`last_subscribe_error: ${eventSub.state.lastSubscribeError}`);
  if (eventSub && eventSub.state && eventSub.state.lastBootstrapError) warnings.push(`last_bootstrap_error: ${eventSub.state.lastBootstrapError}`);

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    ready: blocking.length === 0,
    sendReady: blocking.filter(item => item !== 'shoutout_subscriptions_not_confirmed_in_current_session').length === 0 && hasManage,
    requiredEventSubTypes,
    requiredEventSubScopesAny,
    requiredSendScope,
    checks,
    blocking,
    warnings,
    auth: {
      ok: Boolean(auth && auth.ok),
      login: String(auth && auth.login || ''),
      userId: String(auth && auth.userId || ''),
      broadcasterId: String(auth && auth.broadcasterId || eventSub?.broadcasterId || ''),
      tokenUserMatchesBroadcaster,
      scopes,
      hasShoutoutReadOrManage: hasReadOrManage,
      hasModeratorManageShoutouts: hasManage,
      error: String(auth && auth.error || '')
    },
    eventSub: {
      ok: eventSub && eventSub.ok !== false,
      connected: Boolean(eventSub && eventSub.connected),
      readyState: String(eventSub && eventSub.readyState || ''),
      broadcasterIdConfigured: Boolean(eventSub && eventSub.broadcasterIdConfigured),
      broadcasterId: String(eventSub && eventSub.broadcasterId || ''),
      lastSessionId: String(eventSub && eventSub.state && eventSub.state.lastSessionId || eventSub?.lastSessionId || ''),
      lastNotificationAt: String(eventSub && eventSub.state && eventSub.state.lastNotificationAt || ''),
      lastNotificationType: String(eventSub && eventSub.state && eventSub.state.lastNotificationType || ''),
      lastSubscribeType: String(eventSub && eventSub.state && eventSub.state.lastSubscribeType || ''),
      lastSubscribeError: String(eventSub && eventSub.state && eventSub.state.lastSubscribeError || ''),
      lastBootstrapError: String(eventSub && eventSub.state && eventSub.state.lastBootstrapError || ''),
      subscriptionChecks,
      missingKnown,
      missingConfigured,
      shoutoutReadiness: eventSub && eventSub.shoutoutReadiness ? eventSub.shoutoutReadiness : null,
      error: String(eventSub && eventSub.error || '')
    },
    notes: [
      'EventSub WebSockets verlangen bei diesen Shoutout-Subscriptions, dass moderator_user_id zur User-ID des User-OAuth-Tokens passt.',
      'Für eingehende/erstellte Shoutout-Events reicht moderator:read:shoutouts oder moderator:manage:shoutouts.',
      'Für das aktive Senden offizieller Twitch-Shoutouts wird moderator:manage:shoutouts benötigt.'
    ]
  };
}


async function buildShoutoutLiveTestDecision() {
  const production = await buildShoutoutProductionCheck();
  ensureInboundShoutoutSchema();

  const observation = normalizeStatsRow(database.get(`
    SELECT
      COUNT(*) AS totalEvents,
      SUM(CASE WHEN subscription_id='debug' THEN 1 ELSE 0 END) AS debugTotal,
      SUM(CASE WHEN subscription_id<>'debug' THEN 1 ELSE 0 END) AS realTotal,
      SUM(CASE WHEN direction='incoming' THEN 1 ELSE 0 END) AS incomingTotal,
      SUM(CASE WHEN direction='outgoing' THEN 1 ELSE 0 END) AS outgoingTotal,
      SUM(CASE WHEN direction='incoming' AND subscription_id='debug' THEN 1 ELSE 0 END) AS debugIncomingTotal,
      SUM(CASE WHEN direction='outgoing' AND subscription_id='debug' THEN 1 ELSE 0 END) AS debugOutgoingTotal,
      SUM(CASE WHEN direction='incoming' AND subscription_id<>'debug' THEN 1 ELSE 0 END) AS realIncomingTotal,
      SUM(CASE WHEN direction='outgoing' AND subscription_id<>'debug' THEN 1 ELSE 0 END) AS realOutgoingTotal,
      MAX(received_at) AS lastObservedAt
    FROM clip_shoutout_inbound_events
  `) || {});

  const recent = listInboundShoutoutEvents({ limit: 10 }).items || [];
  const productionReady = production.ready === true;
  const sendReady = production.sendReady === true;
  const debugObserved = Number(observation.debugTotal || 0) > 0;
  const realIncomingObserved = Number(observation.realIncomingTotal || 0) > 0;
  const realOutgoingObserved = Number(observation.realOutgoingTotal || 0) > 0;
  const realAnyObserved = Number(observation.realTotal || 0) > 0;

  const blockers = [];
  const warnings = [];
  if (!productionReady) blockers.push('production_check_not_ready');
  if (!debugObserved) warnings.push('debug_event_not_observed_yet');
  if (!realIncomingObserved) warnings.push('real_channel_shoutout_receive_not_observed_yet');
  if (!realOutgoingObserved) warnings.push('real_channel_shoutout_create_not_observed_yet');
  if (!sendReady) warnings.push('official_send_not_fully_ready_or_manage_scope_missing');

  const readyForReceiveLiveTest = productionReady;
  const readyForCreateLiveTest = productionReady && sendReady;
  const readyForProductionSwitch = productionReady && sendReady && realIncomingObserved && realOutgoingObserved;

  let recommendedNextAction = 'run_production_check';
  if (!productionReady) recommendedNextAction = 'fix_production_check_blockers_first';
  else if (!debugObserved) recommendedNextAction = 'run_local_debug_inbound_event';
  else if (!realIncomingObserved) recommendedNextAction = 'perform_real_receive_shoutout_test';
  else if (!realOutgoingObserved) recommendedNextAction = sendReady ? 'perform_real_create_shoutout_test' : 'refresh_oauth_with_manage_scope_before_create_test';
  else if (!readyForProductionSwitch) recommendedNextAction = 'review_remaining_warnings_before_switch';
  else recommendedNextAction = 'ready_for_explicit_so_switch_decision';

  const testPlan = [
    {
      id: 'production_check',
      label: 'Produktions-Check prüfen',
      ready: productionReady,
      required: true,
      route: `${API_PREFIX}/production-check`,
      command: `curl http://127.0.0.1:8080${API_PREFIX}/production-check`,
      note: 'Muss ohne Blocker sein, bevor echte EventSub-Shoutout-Tests sinnvoll sind.'
    },
    {
      id: 'debug_inbound',
      label: 'Lokales Debug-Event speichern',
      ready: debugObserved,
      required: true,
      route: `${API_PREFIX}/inbound/debug`,
      command: `curl -X POST http://127.0.0.1:8080${API_PREFIX}/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"`,
      note: 'Prüft nur DB-Route, Normalisierung, Dashboard und EventBus-Emit im Shoutout-System.'
    },
    {
      id: 'real_receive',
      label: 'Echtes channel.shoutout.receive beobachten',
      ready: realIncomingObserved,
      required: true,
      route: `${API_PREFIX}/inbound?direction=incoming`,
      command: `curl http://127.0.0.1:8080${API_PREFIX}/inbound?direction=incoming`,
      note: 'Ein anderer Kanal muss ForrestCGN offiziell shoutouten. Danach sollte ein echter incoming-Datensatz erscheinen.'
    },
    {
      id: 'real_create',
      label: 'Echtes channel.shoutout.create beobachten',
      ready: realOutgoingObserved,
      required: true,
      route: `${API_PREFIX}/inbound?direction=outgoing`,
      command: `curl http://127.0.0.1:8080${API_PREFIX}/inbound?direction=outgoing`,
      note: 'Erst testen, wenn manage-Scope vorhanden ist. Dies ist noch keine automatische !so-Produktivumstellung.'
    },
    {
      id: 'decision',
      label: 'Entscheidung zur produktiven !so-Nutzung treffen',
      ready: readyForProductionSwitch,
      required: true,
      route: `${API_PREFIX}/live-test`,
      command: `curl http://127.0.0.1:8080${API_PREFIX}/live-test`,
      note: 'Nur eine Entscheidungsvorbereitung. Der produktive Wechsel passiert weiterhin nur ausdrücklich.'
    }
  ];

  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    productionReady,
    sendReady,
    readyForReceiveLiveTest,
    readyForCreateLiveTest,
    readyForProductionSwitch,
    recommendedNextAction,
    blockers,
    warnings,
    observation,
    production,
    testPlan,
    recent,
    safeDecision: {
      automaticSwitchPerformed: false,
      reason: 'STEP486 bereitet nur Live-Test und Entscheidung vor. Eine produktive !so-Umstellung erfolgt nicht automatisch.',
      explicitUserDecisionRequired: true
    }
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

function parseTarget(input = {}, cfg = null) {
  const args = Array.isArray(input.args) ? input.args : [];

  // Command-System payload contains actor fields like login/userLogin for the caller.
  // Those must never be used before the real command target, otherwise
  // !so @urlug is parsed as ForrestCGN when Forrest triggers the command.
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
  const commandWords = cfg ? directCommandTriggers(cfg) : [];
  const candidateCommand = cleanLogin(candidate);
  if (candidateCommand && commandWords.includes(candidateCommand)) {
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

const COMMAND_INTAKE_TRACE_MAX = 80;

function traceSafe(value, depth = 0) {
  if (depth > 4) return '[depth-limit]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.length > 1200 ? value.slice(0, 1200) + '…' : value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, 25).map(v => traceSafe(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [key, raw] of Object.entries(value).slice(0, 60)) {
      if (/token|secret|authorization|oauth|password/i.test(key)) {
        out[key] = '[redacted]';
      } else {
        out[key] = traceSafe(raw, depth + 1);
      }
    }
    return out;
  }
  return String(value);
}

function createCommandIntakeTrace(initial = {}) {
  const id = `intake_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
  const row = {
    id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    final: false,
    outcome: 'started',
    ...traceSafe(initial),
    stages: []
  };
  state.commandIntakeTrace.unshift(row);
  if (state.commandIntakeTrace.length > COMMAND_INTAKE_TRACE_MAX) state.commandIntakeTrace.length = COMMAND_INTAKE_TRACE_MAX;
  return id;
}

function findCommandIntakeTrace(id) {
  const text = String(id || '').trim();
  if (!text) return null;
  return state.commandIntakeTrace.find(row => row && row.id === text) || null;
}

function addCommandIntakeTraceStep(id, step, data = {}) {
  const row = findCommandIntakeTrace(id);
  if (!row) return null;
  row.updatedAt = nowIso();
  row.stages.push({ at: row.updatedAt, step: String(step || 'step'), data: traceSafe(data) });
  if (row.stages.length > 80) row.stages = row.stages.slice(-80);
  return row;
}

function finishCommandIntakeTrace(id, outcome, data = {}) {
  const row = addCommandIntakeTraceStep(id, 'finish', { outcome, ...data });
  if (!row) return null;
  row.final = true;
  row.outcome = String(outcome || 'finished');
  row.result = traceSafe(data);
  row.updatedAt = nowIso();
  return row;
}

function publicCommandIntakeTrace(limit = 30) {
  const max = Math.max(1, Math.min(80, Number.parseInt(limit, 10) || 30));
  return state.commandIntakeTrace.slice(0, max).map(row => traceSafe(row));
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
    : [90, 365, 730, 1095, Number(cfg.clipLookbackDays || 365), 0];
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
    selectedMode: "",
    fallbackDeferred: false
  };

  let bestFallback = null;

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

      if (!bestFallback && fallbackOk.length) {
        bestFallback = { clips: fallbackOk, rawClips: rawRows, rangeInfo, mode: "fallback_duration" };
        debug.fallbackDeferred = true;
      }

      if (!bestFallback && viewRows.length && allowLongerClipFallback && fallbackMaxClipDurationSeconds <= 0) {
        bestFallback = { clips: viewRows, rawClips: rawRows, rangeInfo, mode: "unlimited_duration" };
        debug.fallbackDeferred = true;
      }
    } catch (err) {
      rangeInfo.error = err && err.message ? err.message : String(err);
      debug.ranges.push(rangeInfo);
    }
  }

  if (bestFallback && Array.isArray(bestFallback.clips) && bestFallback.clips.length) {
    debug.selectedRange = bestFallback.rangeInfo;
    debug.selectedMode = bestFallback.mode;
    return { clips: bestFallback.clips, rawClips: bestFallback.rawClips, debug };
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


function pickClipCandidates(clips, cfg, targetLogin = "", limit = 8) {
  const candidates = Array.isArray(clips) ? clips.filter(clip => clipIdOf(clip)) : [];
  if (!candidates.length) return { clips: [], selection: null };

  const avoidRecent = cfg.avoidRecentClips !== false && clipMemoryLimit(cfg) > 0;
  const recentIds = avoidRecent ? getRecentClipIds(targetLogin, cfg) : [];
  const recentSet = new Set(recentIds);
  const nonRecent = avoidRecent ? candidates.filter(clip => !recentSet.has(clipIdOf(clip))) : candidates.slice();

  let pool = nonRecent.length ? nonRecent : candidates;
  const usedFallbackBecauseAllBlocked = avoidRecent && !nonRecent.length && candidates.length > 0;
  if (usedFallbackBecauseAllBlocked && cfg.recentClipFallbackWhenAllBlocked === false) pool = candidates;

  let ordered = pool.slice();
  if (cfg.randomPick !== false) {
    for (let i = ordered.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = ordered[i];
      ordered[i] = ordered[j];
      ordered[j] = tmp;
    }
  }

  const orderedIds = new Set(ordered.map(clipIdOf));
  for (const candidate of candidates) {
    const id = clipIdOf(candidate);
    if (id && !orderedIds.has(id)) {
      ordered.push(candidate);
      orderedIds.add(id);
    }
  }

  const safeLimit = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 8));
  ordered = ordered.slice(0, safeLimit);

  const selection = {
    mode: cfg.randomPick === false ? (avoidRecent ? "first_avoid_recent_candidates" : "first_candidates") : (avoidRecent ? "random_avoid_recent_candidates" : "random_candidates"),
    candidateCount: candidates.length,
    recentMemory: recentIds,
    recentBlockedCount: avoidRecent ? candidates.filter(clipItem => recentSet.has(clipIdOf(clipItem))).length : 0,
    poolCount: pool.length,
    usedFallbackBecauseAllBlocked,
    selectedClipId: "",
    attemptedClipIds: ordered.map(clipIdOf).filter(Boolean),
    playbackCandidateLimit: safeLimit,
    avoidRecentClips: avoidRecent,
    memoryPerChannel: clipMemoryLimit(cfg)
  };

  return { clips: ordered, selection };
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
  const mode = String(cfg.clipPlaybackMode || "twitch_clip").trim().toLowerCase();
  if (["download", "cache", "cached", "local"].includes(mode)) return "download";
  if (["direct", "mp4", "playback_url"].includes(mode)) return "direct";
  if (["twitch_clip", "clip_player", "clip_player_overlay", "legacy", "legacy_overlay"].includes(mode)) return "twitch_clip";
  return "twitch_clip";
}

function prepareTwitchClipPlayback(clip) {
  return {
    mode: "twitch_clip",
    direct: false,
    cached: false,
    file: "",
    soundSystemFile: "",
    mediaUrl: "",
    videoUrl: "",
    clipId: clipIdOf(clip),
    twitchClip: true
  };
}

async function prepareClipPlayback(playbackUrl, clip, targetUser, cfg) {
  const mode = clipPlaybackMode(cfg);
  if (mode === "twitch_clip") {
    return prepareTwitchClipPlayback(clip);
  }

  if (mode === "download") {
    const downloaded = await downloadClipToSoundAssets(playbackUrl, clip, targetUser, cfg);
    return {
      mode: "download",
      direct: false,
      cached: !!downloaded.cached,
      file: downloaded.file,
      soundSystemFile: downloaded.soundSystemFile,
      mediaUrl: "",
      videoUrl: "",
      clipId: clipIdOf(clip),
      twitchClip: false
    };
  }

  return {
    mode: "direct",
    direct: true,
    cached: false,
    file: "",
    soundSystemFile: "",
    mediaUrl: playbackUrl,
    videoUrl: playbackUrl,
    clipId: clipIdOf(clip),
    twitchClip: false
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

  const playbackMode = playback.mode || "direct";
  const useTwitchClipPlayer = playbackMode === "twitch_clip";

  const overlayTextVars = {
    displayName: targetUser.displayName,
    login: targetUser.login,
    targetDisplay: targetUser.displayName,
    targetLogin: targetUser.login,
    clipTitle: clip.title || "",
    clipUrl: clip.url || "",
    gameName: clip.game_id || ""
  };
  const overlayVisualText = buildShoutoutOverlayVisualText(cfg, overlayTextVars);
  const overlayHeadline = overlayVisualText.headline;
  const overlaySubline = overlayVisualText.subline;
  const overlayBranding = String(cfg.overlayBranding || "CGN Altersheim-TV").trim() || "CGN Altersheim-TV";

  const items = [{
    role: "clip",
    file: useTwitchClipPlayer ? "" : (playback.soundSystemFile || ""),
    mediaUrl: useTwitchClipPlayer ? "" : (playback.mediaUrl || ""),
    videoUrl: useTwitchClipPlayer ? "" : (playback.videoUrl || ""),
    clipId: clip.id || playback.clipId || "",
    label: `Video-Shoutout @${targetUser.displayName}`,
    category: cfg.soundCategory || "vip",
    source: cfg.soundSource || "clip_shoutout",
    mediaType: useTwitchClipPlayer ? "twitch_clip" : "video",
    type: useTwitchClipPlayer ? "twitch_clip" : "video",
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
      twitchClipPlayer: useTwitchClipPlayer,
      playbackMode: playbackMode
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
      headline: overlayHeadline,
      subline: overlaySubline || cfg.overlaySubline || "🧓 Altersheim-TV",
      brand: overlayBranding,
      overlayTextMode: overlayVisualText.mode,
      overlaySetId: overlayVisualText.setId,
      durationMs: clipDurationMs,
      clipId: clip.id || playback.clipId || "",
      theme: "forrest_neon"
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

function commandDefinitionRows() {
  try {
    ensureCommandSchema();
    return database.all(`SELECT trigger, aliases_json, enabled FROM command_definitions WHERE module_key=:moduleKey AND action_key='run' ORDER BY trigger ASC`, { moduleKey: MODULE_NAME });
  } catch (err) {
    state.lastError = err && err.message ? err.message : String(err);
    return [];
  }
}

function cleanupStaleClipShoutoutCommands(activeTrigger) {
  database.run(`DELETE FROM command_definitions WHERE module_key=:moduleKey AND action_key='run' AND trigger<>:activeTrigger`, { moduleKey: MODULE_NAME, activeTrigger });
}

function commandParamsFromConfig(cfg = {}, forceDefault = false) {
  const src = forceDefault ? { ...cfg, command: "so", aliases: ["vso"] } : cfg;
  const queueMode = displayConfig(cfg).enabled !== false;
  const now = nowIso();
  return {
    trigger: cleanLogin(src.command || DEFAULT_CONFIG.clipShoutout.command) || DEFAULT_CONFIG.clipShoutout.command,
    aliasesJson: JSON.stringify(normalizeStringArray(src.aliases, DEFAULT_CONFIG.clipShoutout.aliases || []).map(cleanLogin).filter(Boolean)),
    moduleKey: MODULE_NAME,
    actionKey: "run",
    targetMethod: "POST",
    targetUrl: `${API_PREFIX}/run`,
    permissionLevel: String(cfg.permissionLevel || "mod").toLowerCase(),
    cooldownGlobalMs: queueMode ? 0 : Number(cfg.cooldownGlobalMs || 0),
    cooldownUserMs: queueMode ? 0 : Number(cfg.cooldownUserMs || 0),
    configJson: JSON.stringify({ seededBy: "clip_so", rawInputMode: true, displayQueueOwnsCooldown: queueMode }),
    createdAt: now,
    updatedAt: now
  };
}

function upsertCommandDefinition(p) {
  const row = database.get("SELECT id FROM command_definitions WHERE trigger=:trigger", { trigger: p.trigger });
  if (row && row.id) {
    database.run(`UPDATE command_definitions SET aliases_json=:aliasesJson,module_key=:moduleKey,action_key=:actionKey,target_method=:targetMethod,target_url=:targetUrl,enabled=1,permission_level=:permissionLevel,cooldown_global_ms=:cooldownGlobalMs,cooldown_user_ms=:cooldownUserMs,live_only=0,response_mode='module',config_json=:configJson,updated_at=:updatedAt WHERE id=:id`, { ...p, id: row.id });
    return { updated: true };
  }
  database.run(`INSERT INTO command_definitions (trigger, aliases_json, module_key, action_key, target_method, target_url, enabled, permission_level, cooldown_global_ms, cooldown_user_ms, live_only, response_mode, config_json, created_at, updated_at) VALUES (:trigger, :aliasesJson, :moduleKey, :actionKey, :targetMethod, :targetUrl, 1, :permissionLevel, :cooldownGlobalMs, :cooldownUserMs, 0, 'module', :configJson, :createdAt, :updatedAt)`, p);
  return { created: true };
}

function isLegacyVsoCommand(row) {
  const aliases = parseCommandAliasesJson(row && row.aliases_json).map(cleanLogin);
  return cleanLogin(row && row.trigger) === "vso" && (aliases.includes("clipso") || aliases.includes("videoso"));
}

function registerCommand(cfg = {}, options = {}) {
  try {
    ensureCommandSchema();
    const syncFromConfig = options && options.syncFromConfig === true;
    const rows = commandDefinitionRows();
    if (!syncFromConfig && rows.length > 0) {
      const enabledRows = rows.filter(row => Number(row.enabled) !== 0);
      const soRow = rows.find(row => cleanLogin(row.trigger) === "so");
      if (soRow) {
        cleanupStaleClipShoutoutCommands("so");
        state.registeredCommand = true;
        return { ok: true, existing: true, source: "command_definitions", count: 1, pruned: rows.length > 1 };
      }
      if (rows.length !== 1 || !isLegacyVsoCommand(rows[0])) {
        state.registeredCommand = enabledRows.length > 0;
        return { ok: true, existing: true, source: "command_definitions", count: rows.length, enabledCount: enabledRows.length };
      }
    }
    const params = commandParamsFromConfig(cfg, !syncFromConfig);
    const result = upsertCommandDefinition(params);
    cleanupStaleClipShoutoutCommands(params.trigger);
    state.registeredCommand = true;
    return { ok: true, ...result, trigger: params.trigger, cooldownGlobalMs: params.cooldownGlobalMs, cooldownUserMs: params.cooldownUserMs };
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

  const targetLogin = parseTarget(input, cfg);
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

  const targetLogin = cleanLogin(row.target_login || parseTarget(input, cfg));
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

  const candidateLimit = intParam(cfg.clipPlaybackCandidateLimit, 8, 1, 50);
  const pickedClip = pickClipCandidates(clips, cfg, targetUser.login, candidateLimit);
  const clipSelection = pickedClip.selection || null;
  const playbackAttempts = [];
  let clip = null;
  let playback = null;

  const desiredPlaybackMode = clipPlaybackMode(cfg);
  for (const candidate of pickedClip.clips || []) {
    const candidateInfo = publicClipInfo(candidate) || { id: clipIdOf(candidate) };
    const attempt = {
      clipId: String(candidateInfo.id || ''),
      title: String(candidateInfo.title || ''),
      duration: Number(candidateInfo.duration || 0),
      ok: false,
      error: '',
      mode: desiredPlaybackMode
    };
    playbackAttempts.push(attempt);
    try {
      if (desiredPlaybackMode === "twitch_clip") {
        playback = prepareTwitchClipPlayback(candidate);
      } else {
        const playbackUrl = await resolveClipPlaybackUrl(candidate.id, cfg);
        playback = await prepareClipPlayback(playbackUrl, candidate, targetUser, cfg);
      }
      clip = candidate;
      attempt.ok = true;
      attempt.mode = playback && playback.mode ? playback.mode : desiredPlaybackMode;
      break;
    } catch (err) {
      attempt.error = err && err.message ? err.message : String(err);
    }
  }

  if (!clip || !playback) {
    const fallbackClip = (pickedClip.clips || [])[0] || null;
    if (fallbackClip) {
      clip = fallbackClip;
      playback = prepareTwitchClipPlayback(fallbackClip);
      playbackAttempts.push({
        clipId: String(clipIdOf(fallbackClip) || ''),
        title: String(fallbackClip.title || ''),
        duration: Number(fallbackClip.duration || 0),
        ok: true,
        error: '',
        mode: "twitch_clip",
        fallback: true
      });
    }
  }

  if (!clip || !playback) {
    state.stats.noClips += 1;
    const error = playbackAttempts.length ? 'clip_playback_failed_all_candidates' : 'no_valid_clip_after_selection';
    state.lastError = error;
    state.lastRun = { target: targetUser, targetLogin, error, input: summarizeInput(input), clipSearch: clipSearch.debug || null, clipSelection, playbackAttempts, failedAt: state.lastRunAt };
    throw new Error(error);
  }

  if (clipSelection) clipSelection.selectedClipId = clipIdOf(clip);

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
          displayQueueId: row.id,
          availableAt: nowIso(),
          meta: { source: MODULE_NAME, displayQueueId: row.id, clipTitle: clip.title || '' }
        }, cfg);
        const manualOfficialChat = input.autoShoutout !== true
          && input.__debugSuppressChat !== true
          && input.debugSuppressChat !== true;
        if (queueResult && queueResult.ok && queueResult.row) {
          await processOfficialShoutoutQueueRow(env, queueResult.row, shoutoutConfig(), {
            manualAttempt: true,
            notifyChat: manualOfficialChat
          });
        }
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
    playbackAttempts,
    clipSearch: clipSearch.debug || null,
    bundleId: bundlePayload.bundleId,
    ttsEnabled: Boolean(ttsItem),
    queuedAt: state.lastRunAt,
    parsedTargetLogin: targetLogin,
    input: summarizeInput(input),
    displayQueueId: row.id
  };
  state.lastError = '';
  return { ok: true, rowId: row.id, target: targetUser, clip, clipSelection, clipSearch, playbackAttempts, playback, ttsItem, bundlePayload, soundResult, officialEnabled, displayDurationMs };
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

  const sceneGate = readShoutoutSceneGateState(cfg, env);
  if (!options.force && sceneGate.active === true) {
    return blockQueueBySceneGate('clip_shoutout_display_queue', row, sceneGate, 'shoutout.display.waiting_start_scene', cfg);
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


function boolFromDebugValue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'nein', 'off'].includes(text)) return false;
  return fallback;
}

function parseDebugQueueTargets(input) {
  const raw = firstString(input.targets, input.target, input.logins, input.login, input.users, input.user);
  return String(raw || '')
    .split(/[\s,;|]+/)
    .map(v => cleanLogin(v))
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .slice(0, 8);
}

async function invokeHandleRunForQueueDebug(env, input) {
  let statusCode = 200;
  let payload = null;
  const req = {
    method: 'POST',
    query: {},
    body: input || {},
    headers: {},
    params: {},
    originalUrl: `${API_PREFIX}/run?debug=queue-test`
  };
  const res = {
    status(code) { statusCode = Number(code || 200); return this; },
    json(obj) { payload = obj; return this; }
  };
  await handleRun(req, res, env);
  return { statusCode, payload };
}

function debugQueueRowSummary(row) {
  if (!row) return null;
  return {
    id: Number(row.id || 0),
    targetLogin: cleanLogin(row.target_login || ''),
    targetDisplay: cleanDisplay(row.target_display || row.target_login || ''),
    status: String(row.status || ''),
    availableAt: String(row.available_at || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    startedAt: String(row.started_at || ''),
    finishedAt: String(row.finished_at || ''),
    lastError: String(row.last_error || ''),
    overrideUsed: Number(row.override_used || 0) ? true : false,
    overrideReason: String(row.override_reason || '')
  };
}

function cleanupDebugDisplayQueueRows(rowIds) {
  const ids = Array.isArray(rowIds) ? rowIds.map(v => Number(v || 0)).filter(Boolean) : [];
  if (!ids.length) return { removed: 0, ids: [] };
  const now = nowIso();
  let removed = 0;
  for (const id of ids) {
    database.run(`UPDATE clip_shoutout_display_queue SET status='debug_removed', updated_at=:now, last_error='' WHERE id=:id AND status IN ('queued','waiting')`, { id, now });
    removed += 1;
  }
  return { removed, ids };
}

async function handleDebugQueueTest(req, res, env) {
  const input = readRequestData(req);
  const cfg = shoutoutConfig();
  const targets = parseDebugQueueTargets(input);
  if (!targets.length) {
    return res.status(400).json({
      ok: false,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      error: 'targets_required',
      usage: `${API_PREFIX}/debug/test-queue?targets=pretos1,together_not_alone&force=1`
    });
  }

  const force = boolFromDebugValue(input.force, true);
  const sendChat = boolFromDebugValue(input.chat, false);
  const noProcess = boolFromDebugValue(input.process, false) === false;
  const cleanup = boolFromDebugValue(input.cleanup, false);
  const holdMs = Math.max(0, Math.min(60 * 60 * 1000, Number(input.holdMs || input.hold || 10 * 60 * 1000) || 0));
  const debugAvailableAt = holdMs > 0 ? isoFromMs(Date.now() + holdMs) : nowIso();
  const before = displayQueueStatus(cfg);
  const results = [];
  const createdIds = [];

  for (const target of targets) {
    const rawInput = `so @${target}${force ? ' --force' : ''}`;
    const debugInput = {
      command: 'so',
      cmd: 'so',
      rawInput,
      input: rawInput,
      rawMessage: `!${rawInput}`,
      message: `!${rawInput}`,
      args: force ? [`@${target}`, '--force'] : [`@${target}`],
      target: target,
      targetLogin: target,
      input0: `@${target}`,
      input1: force ? '--force' : '',
      user: 'QueueTest',
      userName: 'QueueTest',
      userLogin: 'queue_test',
      login: 'queue_test',
      displayName: 'QueueTest',
      userDisplayName: 'QueueTest',
      chatOutput: sendChat,
      sendChat,
      source: 'clip_shoutout_debug_test_queue',
      __debugSuppressChat: !sendChat,
      __debugNoProcess: noProcess,
      __debugAvailableAt: debugAvailableAt
    };

    const result = await invokeHandleRunForQueueDebug(env, debugInput);
    const payload = result.payload || {};
    const displayQueueId = Number(payload.displayQueue && payload.displayQueue.id || 0);
    if (displayQueueId) createdIds.push(displayQueueId);
    const row = displayQueueId
      ? database.get(`SELECT * FROM clip_shoutout_display_queue WHERE id=:id`, { id: displayQueueId })
      : findPendingDisplayShoutout(target);
    const notice = row ? displayQueueNoticeInfo(row, cfg) : null;
    results.push({
      target,
      force,
      statusCode: result.statusCode,
      ok: payload.ok === true,
      queued: payload.queued === true,
      blocked: payload.blocked === true,
      reason: String(payload.reason || payload.error || ''),
      displayQueueId,
      row: debugQueueRowSummary(row),
      notice,
      silentDropDetected: payload.ok === true && payload.queued !== true && payload.blocked !== true && !displayQueueId,
      rawResponse: payload
    });
  }

  const cleanupResult = cleanup ? cleanupDebugDisplayQueueRows(createdIds) : { removed: 0, ids: [] };
  const after = displayQueueStatus(shoutoutConfig());
  const silentDrops = results.filter(row => row.silentDropDetected);
  const notQueued = results.filter(row => row.queued !== true);

  return res.json({
    ok: silentDrops.length === 0,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    diagnostic: 'clip_shoutout_queue_intake',
    options: { targets, force, sendChat, noProcess, cleanup, holdMs, debugAvailableAt },
    summary: {
      requested: targets.length,
      queued: results.filter(row => row.queued === true).length,
      blocked: results.filter(row => row.blocked === true).length,
      notQueued: notQueued.length,
      silentDrops: silentDrops.length,
      createdIds,
      cleanup: cleanupResult
    },
    results,
    before: { pending: before.pending, cooldownRunning: before.cooldownRunning, cooldownRemainingMs: before.cooldownRemainingMs, queue: before.queue.map(debugQueueRowSummary) },
    after: { pending: after.pending, cooldownRunning: after.cooldownRunning, cooldownRemainingMs: after.cooldownRemainingMs, queue: after.queue.map(debugQueueRowSummary) }
  });
}

async function handleRun(req, res, env) {
  const cfg = shoutoutConfig();
  const input = readRequestData(req);
  const intakeTraceId = String(input.__intakeTraceId || input.intakeTraceId || '').trim();
  state.stats.requested += 1;
  if (intakeTraceId) addCommandIntakeTraceStep(intakeTraceId, 'handleRun.enter', { input: summarizeInput(input), enabled: cfg.enabled !== false });

  if (cfg.enabled === false) {
    if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'blocked_disabled', { error: 'clip_shoutout_disabled' });
    return res.status(503).json({ ok: false, error: 'clip_shoutout_disabled' });
  }

  const targetLogin = parseTarget(input, cfg);
  state.lastRunAt = nowIso();
  if (intakeTraceId) addCommandIntakeTraceStep(intakeTraceId, 'handleRun.target_parsed', { targetLogin });

  if (!targetLogin) {
    state.lastError = 'target_required';
    state.lastRun = { error: 'target_required', input: summarizeInput(input), failedAt: state.lastRunAt };
    if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'blocked_target_required', { error: 'target_required' });
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
    const scfg = streamDayLimitConfig(cfg);
    const streamDay = resolveCurrentStreamDay(env, cfg);
    const overrideUsed = hasForceOverride(input, cfg);
    const existingStreamDayShoutout = scfg.enabled !== false && !overrideUsed
      ? findExistingStreamDayShoutout(targetLogin, streamDay.streamDayId)
      : null;

    if (intakeTraceId) {
      addCommandIntakeTraceStep(intakeTraceId, 'handleRun.gates_checked', {
        targetLogin,
        overrideUsed,
        streamDayId: streamDay.streamDayId || '',
        streamLive: Boolean(streamDay.streamState && streamDay.streamState.live),
        duplicateFound: Boolean(existingStreamDayShoutout),
        existingDisplayQueueId: existingStreamDayShoutout && existingStreamDayShoutout.id || 0
      });
    }

    const existingPendingDisplay = findPendingDisplayShoutout(targetLogin);
    if (existingPendingDisplay) {
      const existingInfo = existingDisplayQueueResponse(existingPendingDisplay, cfg);
      const isActive = String(existingPendingDisplay.status || '') === 'active';
      const messageKind = isActive ? 'already_active' : (overrideUsed ? 'already_waiting_force' : 'already_waiting');
      const messageTextKey = isActive
        ? 'shoutout.chat.alreadyActive'
        : (overrideUsed ? 'shoutout.chat.alreadyWaitingForce' : 'shoutout.chat.alreadyWaiting');
      const message = buildManualDisplayChatMessage(messageKind, vars, existingInfo && existingInfo.notice);
      if (dcfg.sendChatMessages !== false && input.__debugSuppressChat !== true && input.debugSuppressChat !== true && message) {
        await sendChatMessage(message, {
          targetLogin,
          displayQueueId: existingPendingDisplay.id,
          textKey: messageTextKey,
          queuePosition: existingInfo && existingInfo.position || 0,
          overrideUsed,
          duplicatePending: true
        });
      }
      emitShoutoutBus('shoutout.display.duplicate_pending', {
        targetLogin,
        displayQueueId: existingPendingDisplay.id,
        status: existingPendingDisplay.status,
        overrideUsed,
        requestedByLogin: vars.requestedByLogin
      }, cfg);
      if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, messageKind, { targetLogin, existingDisplayQueue: existingInfo, overrideUsed });
      return res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        queued: false,
        duplicatePending: true,
        reason: isActive ? 'already_active_same_target' : 'already_waiting_same_target',
        targetLogin,
        displayQueue: existingInfo,
        officialShoutout: { duplicateSuppressed: true, reason: 'existing_display_queue_same_target' },
        streamDay,
        overrideUsed
      });
    }

    if (existingStreamDayShoutout) {
      const message = renderShoutoutModuleText('shoutout.chat.duplicate', vars) || renderTemplate(firstString(scfg.duplicateMessage), vars).trim();
      if (message) await sendChatMessage(message, { targetLogin, streamDayId: streamDay.streamDayId, duplicate: true, textKey: 'shoutout.chat.duplicate' });
      emitShoutoutBus('shoutout.streamday.duplicate_blocked', {
        targetLogin,
        streamDayId: streamDay.streamDayId,
        existingDisplayQueueId: existingStreamDayShoutout.id,
        requestedByLogin: vars.requestedByLogin
      }, cfg);
      if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'blocked_duplicate_stream_day', { targetLogin, existingDisplayQueueId: existingStreamDayShoutout.id, overrideAvailable: scfg.allowOverride !== false });
      return res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        queued: false,
        blocked: true,
        reason: 'already_had_shoutout_this_stream_day',
        targetLogin,
        streamDay,
        existingDisplayQueue: {
          id: existingStreamDayShoutout.id,
          status: existingStreamDayShoutout.status,
          createdAt: existingStreamDayShoutout.created_at,
          startedAt: existingStreamDayShoutout.started_at,
          finishedAt: existingStreamDayShoutout.finished_at
        },
        override: {
          available: scfg.allowOverride !== false,
          flag: String(scfg.overrideFlag || '--force')
        }
      });
    }

    const queueResult = enqueueDisplayShoutout({
      targetLogin,
      targetDisplay: vars.displayName,
      requestedByLogin: vars.requestedByLogin,
      requestedByDisplay: vars.requestedByDisplay,
      input,
      availableAt: input.__debugAvailableAt || nowIso(),
      streamDayId: streamDay.streamDayId || '',
      overrideUsed,
      overrideByLogin: overrideUsed ? vars.requestedByLogin : '',
      overrideReason: overrideUsed ? String(scfg.overrideFlag || '--force') : '',
      meta: { source: MODULE_NAME, command: cfg.command || 'so', streamDay, overrideUsed }
    }, cfg);

    if (!queueResult.ok) {
      if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'enqueue_failed', { targetLogin, error: queueResult.error || 'display_queue_enqueue_failed' });
      return res.status(500).json({ ok: false, error: queueResult.error || 'display_queue_enqueue_failed' });
    }

    if (intakeTraceId) {
      addCommandIntakeTraceStep(intakeTraceId, 'handleRun.display_enqueued', {
        targetLogin,
        displayQueueId: queueResult.row && queueResult.row.id || 0,
        status: queueResult.row && queueResult.row.status || '',
        availableAt: queueResult.availableAt || '',
        overrideUsed
      });
    }

    if (dcfg.sendChatMessages !== false && input.__debugSuppressChat !== true && input.debugSuppressChat !== true) {
      const noticeInfo = displayQueueNoticeInfo(queueResult.row, cfg);
      const rowStatus = String(queueResult.row && queueResult.row.status || 'queued');
      const shouldWait = noticeInfo.pendingBefore > 0 || noticeInfo.availableWaitMs > 10000 || rowStatus === 'waiting';
      const textKey = shouldWait ? 'shoutout.chat.waiting' : 'shoutout.chat.accepted';
      const messageVars = {
        ...vars,
        position: noticeInfo.position,
        queuePosition: noticeInfo.position,
        displayQueueId: queueResult.row && queueResult.row.id,
        overrideUsed
      };
      let message = buildManualDisplayChatMessage(shouldWait ? 'waiting' : 'accepted', messageVars, noticeInfo);
      message = stripChatTimePromise(message);
      if (intakeTraceId) addCommandIntakeTraceStep(intakeTraceId, 'handleRun.chat_feedback_prepared', { textKey, shouldWait, message });
      if (message) {
        await sendChatMessage(message, {
          targetLogin,
          displayQueueId: queueResult.row && queueResult.row.id,
          textKey,
          queuePosition: noticeInfo.position,
          overrideUsed
        });
        if (intakeTraceId) addCommandIntakeTraceStep(intakeTraceId, 'handleRun.chat_feedback_sent', { textKey, targetLogin });
      }
    } else if (intakeTraceId) {
      addCommandIntakeTraceStep(intakeTraceId, 'handleRun.chat_feedback_suppressed', {
        sendChatMessages: dcfg.sendChatMessages !== false,
        debugSuppressChat: input.__debugSuppressChat === true || input.debugSuppressChat === true
      });
    }

    if (input.__debugNoProcess !== true && input.debugNoProcess !== true && input.noProcess !== true) {
      processDisplayQueue(env, shoutoutConfig()).catch(err => { state.displayQueue.lastError = err && err.message ? err.message : String(err); });
      if (intakeTraceId) addCommandIntakeTraceStep(intakeTraceId, 'handleRun.process_scheduled', { targetLogin });
    } else if (intakeTraceId) {
      addCommandIntakeTraceStep(intakeTraceId, 'handleRun.process_suppressed', { debugNoProcess: true });
    }

    if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'queued', { targetLogin, displayQueueId: queueResult.row && queueResult.row.id || 0, status: queueResult.row && queueResult.row.status || '' });

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
        notice: displayQueueNoticeInfo(queueResult.row, cfg),
        displayCooldownMs: Math.max(0, Number(displayConfig(cfg).displayCooldownMs || 120000)),
        cooldownStartsAfterFinish: true,
        streamDayId: streamDay.streamDayId || '',
        overrideUsed
      },
      streamDay,
      officialShoutout: { queuedAfterDisplay: officialConfig(cfg).enabled !== false }
    });
  } catch (err) {
    const error = err && err.message ? err.message : String(err);
    state.stats.failed += 1;
    state.lastError = error;
    state.lastRunAt = nowIso();
    state.lastRun = { targetLogin, error, failedAt: state.lastRunAt };
    if (intakeTraceId) finishCommandIntakeTrace(intakeTraceId, 'error', { targetLogin, error });
    return res.status(500).json({ ok: false, module: MODULE_NAME, error, targetLogin });
  }
}



function autoShoutoutJsonConfig(cfg) {
  return mergePlain(DEFAULT_CONFIG.clipShoutout.autoShoutout, (cfg && cfg.autoShoutout) || {});
}

function normalizeAutoStreamer(row = {}) {
  const login = cleanLogin(row.login || row.user || row.channel || row.name || row.targetLogin || row.target_login || '');
  if (!login) return null;
  return {
    login,
    displayName: cleanDisplay(row.displayName || row.display_name || row.display || row.name || login, login),
    enabled: row.enabled !== false && database.boolFromDb(row.enabled) !== false,
    officialShoutout: row.officialShoutout !== false && row.official_shoutout !== false && database.boolFromDb(row.official_shoutout === undefined ? 1 : row.official_shoutout) !== false,
    videoShoutout: row.videoShoutout !== false && row.video_shoutout !== false && database.boolFromDb(row.video_shoutout === undefined ? 1 : row.video_shoutout) !== false,
    note: String(row.note || '')
  };
}

function normalizeAutoSettings(input = {}, fallback = {}) {
  const base = mergePlain(DEFAULT_CONFIG.clipShoutout.autoShoutout, fallback || {});
  const messages = normalizeAutoMessages(input.messages || {}, base.messages || base || {});
  const sceneGate = normalizeSceneGate(input.sceneGate || {}, base.sceneGate || DEFAULT_CONFIG.clipShoutout.autoShoutout.sceneGate || {});
  const queuedMessage = String(input.queuedMessage === undefined ? (base.queuedMessage || messages.queued || '') : (input.queuedMessage || ''));
  if (!messages.queued && queuedMessage) messages.queued = queuedMessage;
  return {
    enabled: input.enabled === undefined ? base.enabled === true : database.boolFromDb(database.normalizeBool(input.enabled)),
    onlyWhenLive: input.onlyWhenLive === undefined ? base.onlyWhenLive === true : database.boolFromDb(database.normalizeBool(input.onlyWhenLive)),
    triggerOnFirstMessageOnly: input.triggerOnFirstMessageOnly === undefined ? base.triggerOnFirstMessageOnly !== false : database.boolFromDb(database.normalizeBool(input.triggerOnFirstMessageOnly)),
    minMessagesBeforeTrigger: Math.max(1, Number.parseInt(input.minMessagesBeforeTrigger === undefined ? base.minMessagesBeforeTrigger : input.minMessagesBeforeTrigger, 10) || 3),
    instantTriggerMessagesEnabled: input.instantTriggerMessagesEnabled === undefined ? base.instantTriggerMessagesEnabled !== false : database.boolFromDb(database.normalizeBool(input.instantTriggerMessagesEnabled)),
    instantTriggerBypassMinMessages: input.instantTriggerBypassMinMessages === undefined ? base.instantTriggerBypassMinMessages !== false : database.boolFromDb(database.normalizeBool(input.instantTriggerBypassMinMessages)),
    instantTriggerMessages: normalizeStringArray(input.instantTriggerMessages, normalizeStringArray(base.instantTriggerMessages, DEFAULT_CONFIG.clipShoutout.autoShoutout.instantTriggerMessages || [])),
    messageWindowMs: Math.max(60000, Number(input.messageWindowMs === undefined ? base.messageWindowMs : input.messageWindowMs) || 1800000),
    greetingEnabled: input.greetingEnabled === undefined ? base.greetingEnabled !== false : database.boolFromDb(database.normalizeBool(input.greetingEnabled)),
    greetingOnlyWhenTriggering: input.greetingOnlyWhenTriggering === undefined ? base.greetingOnlyWhenTriggering !== false : database.boolFromDb(database.normalizeBool(input.greetingOnlyWhenTriggering)),
    greetingTextKey: String(input.greetingTextKey === undefined ? (base.greetingTextKey || 'auto.greeting') : input.greetingTextKey || 'auto.greeting'),
    respectStreamDayLimit: input.respectStreamDayLimit === undefined ? base.respectStreamDayLimit !== false : database.boolFromDb(database.normalizeBool(input.respectStreamDayLimit)),
    globalCooldownMs: Math.max(0, Number(input.globalCooldownMs === undefined ? base.globalCooldownMs : input.globalCooldownMs) || 0),
    perStreamerCooldownMs: Math.max(0, Number(input.perStreamerCooldownMs === undefined ? base.perStreamerCooldownMs : input.perStreamerCooldownMs) || 0),
    sendChatMessage: input.sendChatMessage === undefined ? base.sendChatMessage !== false : database.boolFromDb(database.normalizeBool(input.sendChatMessage)),
    suppressImmediateQueuedMessage: input.suppressImmediateQueuedMessage === undefined ? base.suppressImmediateQueuedMessage !== false : database.boolFromDb(database.normalizeBool(input.suppressImmediateQueuedMessage)),
    immediateQueuedMessageThresholdMs: Math.max(0, Number(input.immediateQueuedMessageThresholdMs === undefined ? base.immediateQueuedMessageThresholdMs : input.immediateQueuedMessageThresholdMs) || 0),
    storeSkippedEvents: input.storeSkippedEvents === undefined ? base.storeSkippedEvents !== false : database.boolFromDb(database.normalizeBool(input.storeSkippedEvents)),
    queuedMessage,
    messages,
    sceneGate,
    streamers: []
  };
}

function ensureAutoShoutoutSchema() {
  database.ensureReady();
  const pk = database.primaryKeyAutoIncrementSql();
  const text = database.textTypeSql();
  const shortText = database.isMysqlFamilyDialect() ? "VARCHAR(191)" : database.textTypeSql();
  const longText = database.textTypeSql({ long: true });
  const integer = database.integerTypeSql();
  const bool = database.boolTypeSql();
  const dt = database.dateTimeTypeSql();
  const json = database.jsonTypeSql();

  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_auto_settings (
      key ${shortText} PRIMARY KEY,
      value_json ${json} NOT NULL,
      updated_at ${dt} NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_auto_streamers (
      id ${pk},
      login ${shortText} NOT NULL UNIQUE,
      display_name ${text} NOT NULL DEFAULT '',
      enabled ${bool} NOT NULL DEFAULT 1,
      official_shoutout ${bool} NOT NULL DEFAULT 1,
      video_shoutout ${bool} NOT NULL DEFAULT 1,
      note ${text} NOT NULL DEFAULT '',
      meta_json ${json} NOT NULL,
      created_at ${dt} NOT NULL,
      updated_at ${dt} NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_auto_events (
      id ${pk},
      target_login ${text} NOT NULL,
      target_display ${text} NOT NULL DEFAULT '',
      trigger_login ${text} NOT NULL DEFAULT '',
      trigger_display ${text} NOT NULL DEFAULT '',
      stream_day_id ${text} NOT NULL DEFAULT '',
      status ${text} NOT NULL DEFAULT '',
      reason ${text} NOT NULL DEFAULT '',
      display_queue_id ${integer} NOT NULL DEFAULT 0,
      created_at ${dt} NOT NULL,
      meta_json ${longText} NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS clip_shoutout_auto_message_activity (
      id ${pk},
      target_login ${shortText} NOT NULL,
      target_display ${text} NOT NULL DEFAULT '',
      stream_day_id ${shortText} NOT NULL DEFAULT '',
      window_started_at ${dt} NOT NULL,
      last_message_at ${dt} NOT NULL,
      message_count ${integer} NOT NULL DEFAULT 0,
      required_messages ${integer} NOT NULL DEFAULT 3,
      window_ms ${integer} NOT NULL DEFAULT 1800000,
      greeted_at ${dt} NOT NULL DEFAULT '',
      triggered_at ${dt} NOT NULL DEFAULT '',
      updated_at ${dt} NOT NULL,
      meta_json ${longText} NOT NULL,
      UNIQUE(target_login, stream_day_id)
    )
  `);

  const jsonColumnDefinition = database.isMysqlFamilyDialect() ? `${json} NOT NULL` : `${json} NOT NULL DEFAULT '{}'`;
  const longJsonColumnDefinition = database.isMysqlFamilyDialect() ? `${longText} NOT NULL` : `${longText} NOT NULL DEFAULT '{}'`;
  database.ensureColumn('clip_shoutout_auto_streamers', 'meta_json', jsonColumnDefinition);
  database.ensureColumn('clip_shoutout_auto_events', 'meta_json', longJsonColumnDefinition);
}

function getAutoSettingRow(key) {
  ensureAutoShoutoutSchema();
  return database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_settings')} WHERE ${database.quoteIdentifier('key')}=:key`, { key: String(key || '') });
}

function setAutoSettingValue(key, value) {
  ensureAutoShoutoutSchema();
  const now = nowIso();
  const data = {
    key: String(key || ''),
    value_json: database.jsonEncode(value || {}),
    updated_at: now
  };
  database.upsert('clip_shoutout_auto_settings', data, ['key'], ['value_json', 'updated_at']);
  return data;
}

function hasAutoSettingMarker(key) {
  return !!getAutoSettingRow(key);
}

function seedAutoStreamersFromJson(cfg) {
  ensureAutoShoutoutSchema();
  if (hasAutoSettingMarker('json_streamers_seeded')) return { seeded: false, reason: 'already_seeded' };
  const jsonCfg = autoShoutoutJsonConfig(cfg);
  const rows = Array.isArray(jsonCfg.streamers) ? jsonCfg.streamers.map(normalizeAutoStreamer).filter(Boolean) : [];
  if (!rows.length) {
    setAutoSettingValue('json_streamers_seeded', { seeded: false, reason: 'json_streamers_empty', at: nowIso() });
    return { seeded: false, reason: 'json_streamers_empty' };
  }
  let count = 0;
  for (const row of rows) {
    saveAutoStreamer(row, { seed: 'json' });
    count += 1;
  }
  setAutoSettingValue('json_streamers_seeded', { seeded: true, count, at: nowIso() });
  return { seeded: true, count };
}

function autoShoutoutConfig(cfg) {
  ensureAutoShoutoutSchema();
  const jsonCfg = autoShoutoutJsonConfig(cfg);
  const row = getAutoSettingRow('settings');
  const dbSettings = row ? database.jsonDecode(row.value_json, {}) : null;
  const settings = normalizeAutoSettings(dbSettings || {}, jsonCfg);
  settings.streamers = listAutoStreamers(cfg);
  settings.configSource = row ? 'database' : 'json_fallback';
  settings.jsonFallbackUsed = !row;
  settings.database = { settingsStored: !!row, streamersStored: settings.streamers.length };
  return settings;
}

function saveAutoShoutoutSettings(partial = {}, cfg = null) {
  const current = autoShoutoutConfig(cfg || shoutoutConfig());
  const settings = normalizeAutoSettings(partial || {}, current);
  delete settings.streamers;
  delete settings.configSource;
  delete settings.jsonFallbackUsed;
  delete settings.database;
  setAutoSettingValue('settings', settings);
  return autoShoutoutConfig(cfg || shoutoutConfig());
}

function normalizeAutoStreamerDbRow(row = {}) {
  const login = cleanLogin(row.login || '');
  if (!login) return null;
  return {
    id: Number(row.id || 0),
    login,
    displayName: cleanDisplay(row.display_name || row.displayName || login, login),
    enabled: database.boolFromDb(row.enabled),
    officialShoutout: database.boolFromDb(row.official_shoutout),
    videoShoutout: database.boolFromDb(row.video_shoutout),
    note: String(row.note || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    meta: database.jsonDecode(row.meta_json, {}) || {}
  };
}

function listAutoStreamers(cfg = null) {
  ensureAutoShoutoutSchema();
  seedAutoStreamersFromJson(cfg || shoutoutConfig());
  const rows = database.all(`
    SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_streamers')}
    ORDER BY enabled DESC, login ASC
  `) || [];
  return rows.map(normalizeAutoStreamerDbRow).filter(Boolean);
}

function findAutoStreamer(login, cfg = null) {
  const clean = cleanLogin(login);
  if (!clean) return null;
  ensureAutoShoutoutSchema();
  seedAutoStreamersFromJson(cfg || shoutoutConfig());
  const row = database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_streamers')} WHERE login=:login LIMIT 1`, { login: clean });
  const normalized = normalizeAutoStreamerDbRow(row || {});
  return normalized && normalized.enabled !== false ? normalized : null;
}

function saveAutoStreamer(input = {}, meta = {}) {
  ensureAutoShoutoutSchema();
  const normalized = normalizeAutoStreamer(input);
  if (!normalized) return { ok: false, error: 'login_required' };
  const now = nowIso();
  const existing = database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_streamers')} WHERE login=:login LIMIT 1`, { login: normalized.login });
  const data = {
    login: normalized.login,
    display_name: normalized.displayName || normalized.login,
    enabled: database.normalizeBool(normalized.enabled !== false),
    official_shoutout: database.normalizeBool(normalized.officialShoutout !== false),
    video_shoutout: database.normalizeBool(normalized.videoShoutout !== false),
    note: String(normalized.note || ''),
    meta_json: database.jsonEncode(meta || {}),
    created_at: existing ? String(existing.created_at || now) : now,
    updated_at: now
  };
  database.upsert('clip_shoutout_auto_streamers', data, ['login'], ['display_name', 'enabled', 'official_shoutout', 'video_shoutout', 'note', 'meta_json', 'updated_at']);
  return { ok: true, streamer: findAutoStreamer(normalized.login, null) || normalizeAutoStreamerDbRow(database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_streamers')} WHERE login=:login`, { login: normalized.login })) };
}

function removeAutoStreamer(login) {
  ensureAutoShoutoutSchema();
  const clean = cleanLogin(login);
  if (!clean) return { ok: false, error: 'login_required' };
  const table = database.quoteIdentifier('clip_shoutout_auto_streamers');
  const result = database.run(`DELETE FROM ${table} WHERE login=:login`, { login: clean }) || {};
  const changes = Number(result.changes || result.rowsAffected || 0);
  return { ok: true, login: clean, deleted: changes > 0, changes };
}

function insertAutoShoutoutEvent(event = {}) {
  ensureAutoShoutoutSchema();
  const now = nowIso();
  const data = {
    target_login: cleanLogin(event.targetLogin || ''),
    target_display: cleanDisplay(event.targetDisplay || event.targetLogin || ''),
    trigger_login: cleanLogin(event.triggerLogin || event.targetLogin || ''),
    trigger_display: cleanDisplay(event.triggerDisplay || event.triggerLogin || event.targetDisplay || ''),
    stream_day_id: String(event.streamDayId || ''),
    status: String(event.status || ''),
    reason: String(event.reason || ''),
    display_queue_id: Number(event.displayQueueId || 0),
    created_at: String(event.createdAt || now),
    meta_json: database.jsonEncode(event.meta || {})
  };
  const result = database.insert('clip_shoutout_auto_events', data);
  return result && (result.lastInsertRowid || result.lastInsertRowId) ? (result.lastInsertRowid || result.lastInsertRowId) : 0;
}

function lastAutoEvent(whereSql = '', params = {}) {
  ensureAutoShoutoutSchema();
  return database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_events')} ${whereSql} ORDER BY created_at DESC, id DESC LIMIT 1`, params);
}

function listAutoShoutoutEvents(limit = 25) {
  ensureAutoShoutoutSchema();
  const safeLimit = Math.max(1, Math.min(200, Number.parseInt(limit, 10) || 25));
  return database.all(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_events')} ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`) || [];
}

function normalizeAutoActivityRow(row = {}) {
  if (!row) return null;
  const nowMs = Date.now();
  const windowMs = Math.max(60000, Number(row.window_ms || 1800000));
  const startedMs = msFromIso(row.window_started_at);
  return {
    id: Number(row.id || 0),
    login: cleanLogin(row.target_login || ''),
    displayName: cleanDisplay(row.target_display || row.target_login || '', row.target_login || ''),
    streamDayId: String(row.stream_day_id || ''),
    windowStartedAt: String(row.window_started_at || ''),
    lastMessageAt: String(row.last_message_at || ''),
    messageCount: Number(row.message_count || 0),
    requiredMessages: Number(row.required_messages || 3),
    windowMs,
    windowEndsAt: startedMs ? isoFromMs(startedMs + windowMs) : '',
    remainingMessages: Math.max(0, Number(row.required_messages || 3) - Number(row.message_count || 0)),
    windowRemainingMs: startedMs ? Math.max(0, startedMs + windowMs - nowMs) : 0,
    greetedAt: String(row.greeted_at || ''),
    triggeredAt: String(row.triggered_at || ''),
    updatedAt: String(row.updated_at || ''),
    meta: database.jsonDecode(row.meta_json, {}) || {}
  };
}

function recordAutoMessageActivity(login, displayName, streamDayId, acfg, source = {}) {
  ensureAutoShoutoutSchema();
  const clean = cleanLogin(login);
  if (!clean) return null;
  const now = nowIso();
  const nowMs = Date.now();
  const dayId = String(streamDayId || 'no_stream_day');
  const requiredMessages = Math.max(1, Number.parseInt(acfg.minMessagesBeforeTrigger || 3, 10) || 3);
  const windowMs = Math.max(60000, Number(acfg.messageWindowMs || 1800000) || 1800000);
  const existing = database.get(`
    SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_message_activity')}
    WHERE target_login=:login AND stream_day_id=:streamDayId
    LIMIT 1
  `, { login: clean, streamDayId: dayId });

  let messageCount = 1;
  let windowStartedAt = now;
  let greetedAt = '';
  let triggeredAt = '';
  const existingWindowStartedMs = msFromIso(existing && existing.window_started_at);
  const existingLastMessageMs = msFromIso(existing && existing.last_message_at);
  const windowExpired = existing && (
    (existingWindowStartedMs && existingWindowStartedMs + Number(existing.window_ms || windowMs) < nowMs) ||
    (existingLastMessageMs && existingLastMessageMs + Number(existing.window_ms || windowMs) < nowMs)
  );

  if (existing && !windowExpired) {
    messageCount = Math.max(0, Number(existing.message_count || 0)) + 1;
    windowStartedAt = String(existing.window_started_at || now);
    greetedAt = String(existing.greeted_at || '');
    triggeredAt = String(existing.triggered_at || '');
  }

  const meta = { source: source || {}, previousCount: existing && !windowExpired ? Number(existing.message_count || 0) : 0, resetBecauseWindowExpired: Boolean(existing && windowExpired) };
  const data = {
    target_login: clean,
    target_display: cleanDisplay(displayName || clean, clean),
    stream_day_id: dayId,
    window_started_at: windowStartedAt,
    last_message_at: now,
    message_count: messageCount,
    required_messages: requiredMessages,
    window_ms: windowMs,
    greeted_at: greetedAt,
    triggered_at: triggeredAt,
    updated_at: now,
    meta_json: database.jsonEncode(meta)
  };
  database.upsert('clip_shoutout_auto_message_activity', data, ['target_login', 'stream_day_id'], [
    'target_display', 'window_started_at', 'last_message_at', 'message_count', 'required_messages', 'window_ms', 'updated_at', 'meta_json'
  ]);
  const row = database.get(`SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_message_activity')} WHERE target_login=:login AND stream_day_id=:streamDayId`, { login: clean, streamDayId: dayId });
  const activity = normalizeAutoActivityRow(row);
  state.autoShoutout.activity = {
    lastLogin: clean,
    lastDisplayName: cleanDisplay(displayName || clean, clean),
    lastStreamDayId: dayId,
    lastMessageCount: activity ? activity.messageCount : messageCount,
    lastRequiredMessages: requiredMessages,
    lastWindowStartedAt: activity ? activity.windowStartedAt : windowStartedAt,
    lastWindowEndsAt: activity ? activity.windowEndsAt : isoFromMs(msFromIso(windowStartedAt) + windowMs),
    lastTriggeredByThreshold: activity ? activity.messageCount >= requiredMessages : messageCount >= requiredMessages
  };
  return activity;
}


function previewAutoMessageActivity(login, displayName, streamDayId, acfg, source = {}) {
  ensureAutoShoutoutSchema();
  const clean = cleanLogin(login);
  if (!clean) return null;
  const now = nowIso();
  const nowMs = Date.now();
  const dayId = String(streamDayId || 'no_stream_day');
  const requiredMessages = Math.max(1, Number.parseInt(acfg.minMessagesBeforeTrigger || 3, 10) || 3);
  const windowMs = Math.max(60000, Number(acfg.messageWindowMs || 1800000) || 1800000);
  const existing = database.get(`
    SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_message_activity')}
    WHERE target_login=:login AND stream_day_id=:streamDayId
    LIMIT 1
  `, { login: clean, streamDayId: dayId });

  let messageCount = 1;
  let windowStartedAt = now;
  let greetedAt = '';
  let triggeredAt = '';
  const existingWindowStartedMs = msFromIso(existing && existing.window_started_at);
  const existingLastMessageMs = msFromIso(existing && existing.last_message_at);
  const windowExpired = existing && (
    (existingWindowStartedMs && existingWindowStartedMs + Number(existing.window_ms || windowMs) < nowMs) ||
    (existingLastMessageMs && existingLastMessageMs + Number(existing.window_ms || windowMs) < nowMs)
  );

  if (existing && !windowExpired) {
    messageCount = Math.max(0, Number(existing.message_count || 0)) + 1;
    windowStartedAt = String(existing.window_started_at || now);
    greetedAt = String(existing.greeted_at || '');
    triggeredAt = String(existing.triggered_at || '');
  }

  const startedMs = msFromIso(windowStartedAt);
  return {
    id: existing && !windowExpired ? Number(existing.id || 0) : 0,
    login: clean,
    displayName: cleanDisplay(displayName || clean, clean),
    streamDayId: dayId,
    windowStartedAt,
    lastMessageAt: now,
    messageCount,
    requiredMessages,
    windowMs,
    windowEndsAt: startedMs ? isoFromMs(startedMs + windowMs) : '',
    remainingMessages: Math.max(0, requiredMessages - messageCount),
    windowRemainingMs: startedMs ? Math.max(0, startedMs + windowMs - nowMs) : 0,
    greetedAt,
    triggeredAt,
    updatedAt: now,
    meta: { source: source || {}, previousCount: existing && !windowExpired ? Number(existing.message_count || 0) : 0, resetBecauseWindowExpired: Boolean(existing && windowExpired), dryRun: true }
  };
}

async function simulateAutoShoutoutChatActivity(parsed, source = {}, env = process.env) {
  const cfg = shoutoutConfig();
  const acfg = autoShoutoutConfig(cfg);
  const login = cleanLogin(parsed && (parsed.login || parsed.tags?.login || ''));
  const displayName = cleanDisplay(parsed && (parsed.displayName || parsed.tags?.['display-name'] || login), login);
  state.autoShoutout.lastCheckedAt = nowIso();

  if (acfg.enabled !== true) return { ok: true, dryRun: true, skipped: true, reason: 'auto_shoutout_disabled', wouldTrigger: false };
  if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, dryRun: true, skipped: true, reason: 'not_privmsg', wouldTrigger: false };
  if (!login) return { ok: true, dryRun: true, skipped: true, reason: 'login_missing', wouldTrigger: false };

  const streamer = findAutoStreamer(login, cfg);
  if (!streamer) return { ok: true, dryRun: true, skipped: true, reason: 'not_configured_streamer', wouldTrigger: false, targetLogin: login };
  if (streamer.videoShoutout === false && streamer.officialShoutout === false) return { ok: true, dryRun: true, skipped: true, reason: 'streamer_actions_disabled', wouldTrigger: false, targetLogin: login };

  const streamState = readCurrentStreamState(cfg);
  const sceneGate = readShoutoutSceneGateState(cfg, env);
  if (acfg.onlyWhenLive === true && !(streamState && streamState.live === true && streamState.stale !== true && streamState.statusKnown !== false)) {
    return { ok: true, dryRun: true, skipped: true, reason: 'stream_not_live', wouldTrigger: false, targetLogin: login, streamState };
  }

  const streamDay = resolveCurrentStreamDay(env, cfg);
  const streamDayId = streamDay && streamDay.streamDayId ? String(streamDay.streamDayId) : '';
  state.autoShoutout.streamDay = publicAutoStreamDayDecision(streamDay || {});
  const varsBase = { login, displayName: streamer.displayName || displayName || login, waitTime: 'wenige Sekunden', streamDayId };
  const autoRawMessage = autoMessageTextFromParsed(parsed);
  const instantTrigger = isAutoInstantTriggerMessage(autoRawMessage, acfg);

  if (!streamDayId) {
    return { ok: true, dryRun: true, skipped: true, reason: streamDay && streamDay.error ? streamDay.error : 'stream_day_unavailable', wouldTrigger: false, targetLogin: login, streamDay, streamState };
  }

  const pendingDisplay = findPendingDisplayShoutout(login);
  if (pendingDisplay) {
    const waitTime = formatApproxDuration(estimateDisplayWaitMsForQueueId(pendingDisplay.id, cfg));
    return { ok: true, dryRun: true, skipped: true, reason: 'already_queued', wouldTrigger: false, targetLogin: login, existingDisplayQueueId: pendingDisplay.id, waitTime, streamDayId };
  }

  if (acfg.triggerOnFirstMessageOnly !== false) {
    const existingAuto = database.get(`
      SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_events')}
      WHERE target_login=:login AND stream_day_id=:streamDayId AND status='triggered'
      ORDER BY id DESC LIMIT 1
    `, { login, streamDayId });
    if (existingAuto) return { ok: true, dryRun: true, skipped: true, reason: 'already_auto_triggered_this_stream_day', wouldTrigger: false, targetLogin: login, existingAutoId: existingAuto.id, streamDayId };
  }

  if (acfg.respectStreamDayLimit !== false) {
    const existingManualOrAuto = findExistingStreamDayShoutout(login, streamDayId);
    if (existingManualOrAuto) return { ok: true, dryRun: true, skipped: true, reason: 'already_had_shoutout_this_stream_day', wouldTrigger: false, targetLogin: login, existingDisplayQueueId: existingManualOrAuto.id, streamDayId };
  }

  const cooldown = autoCooldownStatus(login, cfg);
  if (!cooldown.ok) {
    const waitMs = Math.max(0, msFromIso(cooldown.nextAllowedAt) - Date.now());
    return { ok: true, dryRun: true, skipped: true, reason: cooldown.blockedBy || 'cooldown', wouldTrigger: false, targetLogin: login, cooldown, waitTime: formatApproxDuration(waitMs), streamDayId };
  }

  const activity = previewAutoMessageActivity(login, streamer.displayName || displayName || login, streamDayId, acfg, { ...source, autoRawMessage, instantTrigger });
  const requiredMessages = Math.max(1, Number(acfg.minMessagesBeforeTrigger || 3));
  const bypassMessageThreshold = instantTrigger.matched === true && acfg.instantTriggerBypassMinMessages !== false;
  const wouldTrigger = Boolean((activity && activity.messageCount >= requiredMessages) || bypassMessageThreshold);
  const waitMs = wouldTrigger ? 0 : Math.max(0, activity ? activity.windowRemainingMs : 0);
  return {
    ok: true,
    dryRun: true,
    targetLogin: login,
    wouldTrigger,
    wouldSendGreeting: wouldTrigger && acfg.greetingEnabled !== false && (!activity || !activity.greetedAt),
    wouldQueueDisplay: wouldTrigger,
    wouldSendQueuedMessage: false,
    reason: wouldTrigger ? (sceneGate.active ? 'would_queue_waiting_start_scene' : 'would_queue') : 'message_threshold_waiting',
    waitTime: wouldTrigger ? 'wenige Sekunden' : formatApproxDuration(waitMs),
    waitMs,
    activity,
    instantTrigger: bypassMessageThreshold,
    matchedToken: instantTrigger.token || '',
    sceneGate,
    streamDay,
    streamState,
    note: 'Dry-Run: Es wurde nichts in die Shoutout-Queue gelegt und keine Chatmeldung gesendet.'
  };
}

function markAutoMessageActivityGreeting(login, streamDayId) {
  const clean = cleanLogin(login);
  const dayId = String(streamDayId || 'no_stream_day');
  const now = nowIso();
  database.run(`UPDATE ${database.quoteIdentifier('clip_shoutout_auto_message_activity')} SET greeted_at=CASE WHEN greeted_at='' THEN :now ELSE greeted_at END, updated_at=:now WHERE target_login=:login AND stream_day_id=:streamDayId`, { login: clean, streamDayId: dayId, now });
}

function markAutoMessageActivityTriggered(login, streamDayId) {
  const clean = cleanLogin(login);
  const dayId = String(streamDayId || 'no_stream_day');
  const now = nowIso();
  database.run(`UPDATE ${database.quoteIdentifier('clip_shoutout_auto_message_activity')} SET triggered_at=CASE WHEN triggered_at='' THEN :now ELSE triggered_at END, updated_at=:now WHERE target_login=:login AND stream_day_id=:streamDayId`, { login: clean, streamDayId: dayId, now });
}

function listAutoMessageActivity(limit = 25) {
  ensureAutoShoutoutSchema();
  const safeLimit = Math.max(1, Math.min(200, Number.parseInt(limit, 10) || 25));
  return database.all(`
    SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_message_activity')}
    ORDER BY updated_at DESC, id DESC LIMIT ${safeLimit}
  `).map(normalizeAutoActivityRow).filter(Boolean);
}


function normalizeShoutoutTextValues(values = []) {
  return (Array.isArray(values) ? values : String(values || '').split(/\r?\n/))
    .map(value => String(value || '').trim())
    .filter(Boolean);
}

function shoutoutTextEditor(options = {}) {
  return textHelper.listModuleTextEditor(MODULE_NAME, SHOUTOUT_TEXT_DEFAULTS, {
    ...SHOUTOUT_TEXT_OPTIONS,
    ...(options || {})
  });
}

function replaceShoutoutTextVariants(key, values = [], options = {}) {
  const textKey = String(key || '').trim();
  if (!textKey) throw new Error('text_key_required');
  const lines = normalizeShoutoutTextValues(values);
  if (!lines.length) throw new Error('text_variants_required');
  const table = textHelper.ensureModuleTextVariantsTable(textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  database.run(`DELETE FROM ${qTable} WHERE module_name=:moduleName AND text_key=:textKey`, { moduleName: MODULE_NAME, textKey });
  lines.forEach((value, index) => {
    textHelper.setModuleTextVariant(MODULE_NAME, {
      key: textKey,
      category: options.category || (SHOUTOUT_TEXT_OPTIONS.categories && SHOUTOUT_TEXT_OPTIONS.categories[textKey]) || SHOUTOUT_TEXT_OPTIONS.defaultCategory,
      value,
      enabled: true,
      weight: 1,
      sortOrder: index
    }, SHOUTOUT_TEXT_OPTIONS);
  });
  return shoutoutTextEditor();
}

function buildShoutoutTextMigrationPlan(cfg = null) {
  const currentCfg = cfg || shoutoutConfig();
  const acfg = autoShoutoutConfig(currentCfg);
  const dcfg = displayConfig(currentCfg);
  const ocfg = officialConfig(currentCfg);
  const streamLimit = streamDayLimitConfig(currentCfg);
  const autoMessages = normalizeAutoMessages(acfg.messages || {}, acfg || {});
  return {
    ok: true,
    module: MODULE_NAME,
    moduleVersion: MODULE_VERSION,
    generatedAt: nowIso(),
    dryRun: true,
    noRuntimeChange: true,
    targetModule: MODULE_NAME,
    targetTable: textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE || 'module_text_variants',
    targetCategories: SHOUTOUT_TEXT_OPTIONS.categoryLabels,
    plannedKeys: Object.keys(SHOUTOUT_TEXT_DEFAULTS).sort(),
    legacyMappings: [
      { from: 'clipShoutout.chatMessage', to: 'shoutout.chat.accepted', category: 'shoutout.chat', currentValue: String(currentCfg.chatMessage || '') },
      { from: 'clipShoutout.displayQueue.acceptedMessage', to: 'shoutout.chat.accepted', category: 'shoutout.chat', currentValue: String(dcfg.acceptedMessage || '') },
      { from: 'clipShoutout.displayQueue.waitingMessage', to: 'shoutout.chat.waiting', category: 'shoutout.chat', currentValue: String(dcfg.waitingMessage || '') },
      { from: 'clipShoutout.displayQueue.failedMessage', to: 'shoutout.chat.failed', category: 'shoutout.chat', currentValue: String(dcfg.failedMessage || '') },
      { from: 'clipShoutout.streamDayLimit.duplicateMessage', to: 'shoutout.chat.duplicate', category: 'shoutout.chat', currentValue: String(streamLimit.duplicateMessage || '') },
      { from: 'clipShoutout.autoShoutout.greetingTextKey/auto.greeting', to: 'shoutout.auto.greeting', category: 'shoutout.auto', currentValue: 'legacy key auto.greeting remains fallback' },
      { from: 'clipShoutout.autoShoutout.messages.queued', to: 'shoutout.auto.queued', category: 'shoutout.auto', currentValue: String(autoMessages.queued || '') },
      { from: 'clipShoutout.autoShoutout.messages.alreadyQueued', to: 'shoutout.auto.alreadyQueued', category: 'shoutout.auto', currentValue: String(autoMessages.alreadyQueued || '') },
      { from: 'clipShoutout.autoShoutout.messages.alreadyReceived', to: 'shoutout.auto.alreadyReceived', category: 'shoutout.auto', currentValue: String(autoMessages.alreadyReceived || '') },
      { from: 'clipShoutout.autoShoutout.messages.cooldown', to: 'shoutout.auto.cooldown', category: 'shoutout.auto', currentValue: String(autoMessages.cooldown || '') },
      { from: 'clipShoutout.autoShoutout.messages.waitingStartScene', to: 'shoutout.auto.waitingStartScene', category: 'shoutout.auto', currentValue: String(autoMessages.waitingStartScene || '') },
      { from: 'clipShoutout.autoShoutout.messages.disabled', to: 'shoutout.auto.disabled', category: 'shoutout.auto', currentValue: String(autoMessages.disabled || '') },
      { from: 'clipShoutout.officialShoutout.queuedMessage', to: 'shoutout.official.queued', category: 'shoutout.official', currentValue: String(ocfg.queuedMessage || '') },
      { from: 'clipShoutout.officialShoutout.failedMessage', to: 'shoutout.official.failed', category: 'shoutout.official', currentValue: String(ocfg.failedMessage || '') }
    ],
    compatibility: {
      oldConfigTextsRemainFallback: true,
      oldAutoTextsRouteRemains: `${API_PREFIX}/auto/texts`,
      newTextsRoute: `${API_PREFIX}/texts`,
      migrationDoesNotDeleteLegacyKeys: true,
      oldAutoGreetingKeyRemainsFallback: true
    },
    nextImplementationStep: 'Dashboard-Texttab auf GET/POST /api/clip-shoutout/texts aufbauen und Runtime-Nutzung danach schrittweise auf shoutout.* Keys umstellen.'
  };
}

function replaceAutoTextVariants(key, values = [], options = {}) {
  const textKey = String(key || 'auto.greeting').trim() || 'auto.greeting';
  const lines = (Array.isArray(values) ? values : String(values || '').split(/\r?\n/))
    .map(value => String(value || '').trim())
    .filter(Boolean);
  if (!lines.length) throw new Error('text_variants_required');
  const table = textHelper.ensureModuleTextVariantsTable(textHelper.DEFAULT_MODULE_TEXT_VARIANTS_TABLE);
  const qTable = database.quoteIdentifier(table);
  database.run(`DELETE FROM ${qTable} WHERE module_name=:moduleName AND text_key=:textKey`, { moduleName: MODULE_NAME, textKey });
  lines.forEach((value, index) => {
    textHelper.setModuleTextVariant(MODULE_NAME, {
      key: textKey,
      category: options.category || 'auto_shoutout',
      value,
      enabled: true,
      weight: 1,
      sortOrder: index
    }, AUTO_SHOUTOUT_TEXT_OPTIONS);
  });
  return textHelper.listModuleTextEditor(MODULE_NAME, AUTO_SHOUTOUT_TEXT_DEFAULTS, AUTO_SHOUTOUT_TEXT_OPTIONS);
}

function autoCooldownStatus(login, cfg) {
  const acfg = autoShoutoutConfig(cfg);
  const nowMs = Date.now();
  const globalMs = Math.max(0, Number(acfg.globalCooldownMs || 0));
  const perStreamerMs = Math.max(0, Number(acfg.perStreamerCooldownMs || 0));
  const lastGlobal = lastAutoEvent(`WHERE status='triggered'`, {});
  const lastTarget = lastAutoEvent(`WHERE status='triggered' AND target_login=:login`, { login: cleanLogin(login) });
  const lastGlobalMs = msFromIso(lastGlobal && lastGlobal.created_at);
  const lastTargetMs = msFromIso(lastTarget && lastTarget.created_at);
  const globalUntilMs = lastGlobalMs && globalMs > 0 ? lastGlobalMs + globalMs : 0;
  const targetUntilMs = lastTargetMs && perStreamerMs > 0 ? lastTargetMs + perStreamerMs : 0;
  const nextAllowedMs = Math.max(nowMs, globalUntilMs || 0, targetUntilMs || 0);
  let blockedBy = '';
  if (globalUntilMs > nowMs && globalUntilMs >= targetUntilMs) blockedBy = 'global_cooldown';
  else if (targetUntilMs > nowMs) blockedBy = 'streamer_cooldown';
  return {
    ok: !blockedBy,
    blockedBy,
    nextAllowedAt: blockedBy ? isoFromMs(nextAllowedMs) : '',
    globalUntilAt: globalUntilMs ? isoFromMs(globalUntilMs) : '',
    targetUntilAt: targetUntilMs ? isoFromMs(targetUntilMs) : '',
    lastGlobalAt: lastGlobal ? String(lastGlobal.created_at || '') : '',
    lastTargetAt: lastTarget ? String(lastTarget.created_at || '') : ''
  };
}

function autoSkip(login, displayName, reason, extra = {}, cfg = null) {
  const currentCfg = cfg || shoutoutConfig();
  state.stats.autoSkipped += 1;
  state.autoShoutout.lastSkippedAt = nowIso();
  state.autoShoutout.lastSkippedLogin = cleanLogin(login);
  state.autoShoutout.lastSkipReason = String(reason || 'skipped');
  if (autoShoutoutConfig(currentCfg).storeSkippedEvents === true) {
    insertAutoShoutoutEvent({
      targetLogin: login,
      targetDisplay: displayName || login,
      triggerLogin: login,
      triggerDisplay: displayName || login,
      status: 'skipped',
      reason: String(reason || 'skipped'),
      streamDayId: extra.streamDayId || '',
      meta: extra
    });
  }
  emitShoutoutBus('shoutout.auto.skipped', { targetLogin: cleanLogin(login), reason: String(reason || 'skipped'), ...extra }, currentCfg);
  return { ok: true, skipped: true, reason: String(reason || 'skipped') };
}


function autoMessageTextFromParsed(parsed = {}) {
  const params = Array.isArray(parsed.params) ? parsed.params : [];
  return String(parsed.message || parsed.rawMessage || parsed.text || params[1] || params[params.length - 1] || '').trim();
}

function normalizeAutoInstantTriggerToken(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isAutoInstantTriggerMessage(message, acfg = {}) {
  if (acfg.instantTriggerMessagesEnabled === false) return { matched: false, token: '', message: String(message || '') };
  const raw = normalizeAutoInstantTriggerToken(message);
  if (!raw) return { matched: false, token: '', message: raw };
  const firstWord = raw.split(/\s+/)[0] || raw;
  const list = normalizeStringArray(acfg.instantTriggerMessages, DEFAULT_CONFIG.clipShoutout.autoShoutout.instantTriggerMessages || [])
    .map(normalizeAutoInstantTriggerToken)
    .filter(Boolean);
  const matched = list.find(token => token === raw || token === firstWord || (token.startsWith('!') && token.slice(1) === firstWord) || (!token.startsWith('!') && `!${token}` === firstWord));
  return { matched: Boolean(matched), token: matched || '', message: raw, firstWord };
}

async function handleAutoShoutoutChatActivity(parsed, source = {}, env = process.env) {
  const cfg = shoutoutConfig();
  const acfg = autoShoutoutConfig(cfg);
  state.autoShoutout.lastCheckedAt = nowIso();

  if (acfg.enabled !== true) return { ok: true, skipped: true, reason: 'auto_shoutout_disabled' };
  if (!parsed || String(parsed.command || '').toUpperCase() !== 'PRIVMSG') return { ok: true, skipped: true, reason: 'not_privmsg' };

  const login = cleanLogin(parsed.login || parsed.tags?.login || '');
  const displayName = cleanDisplay(parsed.displayName || parsed.tags?.['display-name'] || login, login);
  if (!login) return { ok: true, skipped: true, reason: 'login_missing' };

  const streamer = findAutoStreamer(login, cfg);
  if (!streamer) return { ok: true, skipped: true, reason: 'not_configured_streamer' };
  if (streamer.videoShoutout === false && streamer.officialShoutout === false) return autoSkip(login, displayName, 'streamer_actions_disabled', {}, cfg);

  const streamState = readCurrentStreamState(cfg);
  const sceneGate = readShoutoutSceneGateState(cfg, env);
  if (acfg.onlyWhenLive === true && !(streamState && streamState.live === true && streamState.stale !== true && streamState.statusKnown !== false)) {
    return autoSkip(login, displayName, 'stream_not_live', { streamState }, cfg);
  }

  const streamDay = resolveCurrentStreamDay(env, cfg);
  const streamDayId = streamDay && streamDay.streamDayId ? String(streamDay.streamDayId) : '';
  state.autoShoutout.streamDay = publicAutoStreamDayDecision(streamDay || {});
  const varsBase = { login, displayName: streamer.displayName || displayName || login, waitTime: 'wenige Sekunden', streamDayId };
  const autoRawMessage = autoMessageTextFromParsed(parsed);
  const instantTrigger = isAutoInstantTriggerMessage(autoRawMessage, acfg);

  if (!streamDayId) {
    return autoSkip(login, displayName, streamDay && streamDay.error ? streamDay.error : 'stream_day_unavailable', { streamDay, streamState }, cfg);
  }

  const pendingDisplay = findPendingDisplayShoutout(login);
  if (pendingDisplay) {
    const waitTime = formatApproxDuration(estimateDisplayWaitMsForQueueId(pendingDisplay.id, cfg));
    await sendAutoChatNotice(acfg, 'alreadyQueued', { ...varsBase, waitTime, reason: 'already_queued', displayQueueId: pendingDisplay.id }, cfg).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
    return autoSkip(login, displayName, 'already_queued', { streamDayId, existingDisplayQueueId: pendingDisplay.id, waitTime }, cfg);
  }

  if (acfg.triggerOnFirstMessageOnly !== false) {
    const existingAuto = database.get(`
      SELECT * FROM ${database.quoteIdentifier('clip_shoutout_auto_events')}
      WHERE target_login=:login AND stream_day_id=:streamDayId AND status='triggered'
      ORDER BY id DESC LIMIT 1
    `, { login, streamDayId });
    if (existingAuto) {
      await sendAutoChatNotice(acfg, 'alreadyReceived', { ...varsBase, reason: 'already_auto_triggered_this_stream_day', existingAutoId: existingAuto.id }, cfg).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
      return autoSkip(login, displayName, 'already_auto_triggered_this_stream_day', { streamDayId, existingAutoId: existingAuto.id }, cfg);
    }
  }

  if (acfg.respectStreamDayLimit !== false) {
    const existingManualOrAuto = findExistingStreamDayShoutout(login, streamDayId);
    if (existingManualOrAuto) {
      await sendAutoChatNotice(acfg, 'alreadyReceived', { ...varsBase, reason: 'already_had_shoutout_this_stream_day', existingDisplayQueueId: existingManualOrAuto.id }, cfg).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
      return autoSkip(login, displayName, 'already_had_shoutout_this_stream_day', { streamDayId, existingDisplayQueueId: existingManualOrAuto.id }, cfg);
    }
  }

  const cooldown = autoCooldownStatus(login, cfg);
  if (!cooldown.ok) {
    const waitMs = Math.max(0, msFromIso(cooldown.nextAllowedAt) - Date.now());
    const waitTime = formatApproxDuration(waitMs);
    await sendAutoChatNotice(acfg, 'cooldown', { ...varsBase, waitTime, reason: cooldown.blockedBy || 'cooldown', cooldown }, cfg).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
    return autoSkip(login, displayName, cooldown.blockedBy || 'cooldown', { streamDayId, cooldown, waitTime }, cfg);
  }

  const activity = recordAutoMessageActivity(login, streamer.displayName || displayName || login, streamDayId, acfg, { ...source, autoRawMessage, instantTrigger });
  const requiredMessages = Math.max(1, Number(acfg.minMessagesBeforeTrigger || 3));
  const bypassMessageThreshold = instantTrigger.matched === true && acfg.instantTriggerBypassMinMessages !== false;
  if (activity && activity.messageCount < requiredMessages && !bypassMessageThreshold) {
    emitShoutoutBus('shoutout.auto.waiting_message_threshold', {
      targetLogin: login,
      displayName: streamer.displayName || displayName || login,
      streamDayId,
      messageCount: activity.messageCount,
      requiredMessages,
      remainingMessages: activity.remainingMessages,
      windowEndsAt: activity.windowEndsAt,
      windowRemainingMs: activity.windowRemainingMs
    }, cfg);
    return { ok: true, skipped: true, reason: 'message_threshold_waiting', targetLogin: login, activity };
  }
  if (bypassMessageThreshold) {
    emitShoutoutBus('shoutout.auto.instant_trigger_message', {
      targetLogin: login,
      displayName: streamer.displayName || displayName || login,
      streamDayId,
      messageCount: activity ? activity.messageCount : 1,
      requiredMessages,
      matchedToken: instantTrigger.token,
      rawMessage: autoRawMessage
    }, cfg);
  }

  const input = {
    target: login,
    targetLogin: login,
    input0: login,
    args: [login],
    rawInput: `${cfg.command || 'vso'} @${login}`,
    input: `${cfg.command || 'vso'} @${login}`,
    text: `@${login}`,
    message: `AUTO_SHOUTOUT @${login}`,
    rawMessage: `AUTO_SHOUTOUT @${login}`,
    user: 'Auto-Shoutout',
    userName: 'Auto-Shoutout',
    userLogin: 'auto_shoutout',
    login: 'auto_shoutout',
    displayName: 'Auto-Shoutout',
    userDisplayName: 'Auto-Shoutout',
    targetDisplay: streamer.displayName || displayName || login,
    officialShoutout: streamer.officialShoutout !== false,
    twitchShoutout: streamer.officialShoutout !== false,
    autoShoutout: true,
    source: source.source || 'twitch_presence',
    channel: source.channel || '',
    autoInstantTrigger: bypassMessageThreshold,
    autoInstantTriggerToken: instantTrigger.token || '',
    autoMessageCount: activity ? activity.messageCount : 0,
    autoRequiredMessages: requiredMessages
  };

  try {
    if (acfg.greetingEnabled !== false && (!activity || !activity.greetedAt)) {
      await sendAutoGreetingNotice(acfg, {
        ...varsBase,
        messageCount: activity ? activity.messageCount : requiredMessages,
        requiredMessages,
        windowEndsAt: activity ? activity.windowEndsAt : '',
        windowRemainingMs: activity ? activity.windowRemainingMs : 0
      }, cfg).then(sent => { if (sent) markAutoMessageActivityGreeting(login, streamDayId); }).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
    }
    const result = await invokeHandleRunDirect(input, env);
    const data = result && result.data ? result.data : {};
    const displayQueueId = Number(data.displayQueue && data.displayQueue.id || data.rowId || 0);
    const ok = Boolean(data.ok && data.queued !== false && !data.blocked);
    const status = ok ? 'triggered' : 'skipped';
    const reason = ok ? (sceneGate.active ? 'queued_waiting_start_scene' : 'queued') : (data.reason || data.error || 'handle_run_not_queued');
    const waitMs = estimateDisplayWaitMsForQueueId(displayQueueId, cfg);
    const waitTime = formatApproxDuration(waitMs);

    insertAutoShoutoutEvent({
      targetLogin: login,
      targetDisplay: streamer.displayName || displayName || login,
      triggerLogin: login,
      triggerDisplay: displayName || login,
      streamDayId,
      status,
      reason,
      displayQueueId,
      meta: { source, streamState, sceneGate, streamDay, result: data, waitTime, waitMs, autoRawMessage, instantTrigger, bypassMessageThreshold, activity }
    });

    if (ok) {
      markAutoMessageActivityTriggered(login, streamDayId);
      state.stats.autoTriggered += 1;
      state.autoShoutout.lastTriggeredAt = nowIso();
      state.autoShoutout.lastTriggeredLogin = login;
      state.autoShoutout.lastError = '';
      if (acfg.sendChatMessage !== false) {
        const key = sceneGate.active ? 'waitingStartScene' : 'queued';
        const thresholdMs = Math.max(0, Number(acfg.immediateQueuedMessageThresholdMs || 0));
        const isImmediate = !sceneGate.active && waitMs <= thresholdMs;
        if (!(acfg.suppressImmediateQueuedMessage !== false && isImmediate)) {
          sendAutoChatNotice(acfg, key, { login, displayName: streamer.displayName || displayName || login, waitTime, reason, displayQueueId, waitMs }, cfg).catch(err => { state.autoShoutout.lastError = err && err.message ? err.message : String(err); });
        }
      }
      emitShoutoutBus('shoutout.auto.triggered', { targetLogin: login, displayName: streamer.displayName || displayName || login, displayQueueId, streamDayId, sceneGate, waitTime, waitMs, instantTrigger: bypassMessageThreshold, matchedToken: instantTrigger.token || '' }, cfg);
      return { ok: true, triggered: true, targetLogin: login, displayQueueId, reason, waitTime, waitMs, sceneGate, instantTrigger: bypassMessageThreshold, matchedToken: instantTrigger.token || '', result: data };
    }

    state.stats.autoSkipped += 1;
    state.autoShoutout.lastSkippedAt = nowIso();
    state.autoShoutout.lastSkippedLogin = login;
    state.autoShoutout.lastSkipReason = reason;
    emitShoutoutBus('shoutout.auto.skipped', { targetLogin: login, reason, streamDayId, result: data }, cfg);
    return { ok: true, skipped: true, reason, result: data };
  } catch (err) {
    state.autoShoutout.lastError = err && err.message ? err.message : String(err);
    insertAutoShoutoutEvent({ targetLogin: login, targetDisplay: displayName || login, triggerLogin: login, triggerDisplay: displayName || login, streamDayId, status: 'error', reason: state.autoShoutout.lastError, meta: { source, sceneGate } });
    emitShoutoutBus('shoutout.auto.failed', { targetLogin: login, error: state.autoShoutout.lastError, streamDayId }, cfg);
    return { ok: false, error: state.autoShoutout.lastError };
  }
}

function resetAutoShoutoutRuntimeState(reason = 'manual_reset') {
  state.autoShoutout.lastCheckedAt = '';
  state.autoShoutout.lastTriggeredAt = '';
  state.autoShoutout.lastTriggeredLogin = '';
  state.autoShoutout.lastSkippedAt = '';
  state.autoShoutout.lastSkippedLogin = '';
  state.autoShoutout.lastSkipReason = '';
  state.autoShoutout.lastError = '';
  state.autoShoutout.noticeMemory = {};
  emitShoutoutBus('shoutout.auto.runtime_reset', { reason: String(reason || 'manual_reset') }, shoutoutConfig());
}

function previewText(value, max = 120) {
  const text = String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}

function getNestedBusValue(source, pathName) {
  if (!source || typeof source !== 'object' || !pathName) return undefined;
  const parts = String(pathName).split('.').filter(Boolean);
  let current = source;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

function firstNonEmptyBusValue(source, paths = []) {
  for (const pathName of paths) {
    const value = getNestedBusValue(source, pathName);
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return { value: text, source: pathName };
  }
  return { value: '', source: '' };
}

function normalizeBusChatPayload(envelope = {}) {
  const root = envelope && typeof envelope === 'object' ? envelope : {};
  const payload = root.payload && typeof root.payload === 'object' ? root.payload : {};
  const eventPayload = root.event && root.event.payload && typeof root.event.payload === 'object' ? root.event.payload : {};
  const eventData = root.event && root.event.data && typeof root.event.data === 'object' ? root.event.data : {};
  const user = payload.user && typeof payload.user === 'object' ? payload.user : {};
  const chatter = payload.chatter && typeof payload.chatter === 'object' ? payload.chatter : {};
  const dataUser = payload.data && payload.data.user && typeof payload.data.user === 'object' ? payload.data.user : {};
  const twitch = payload.twitch && typeof payload.twitch === 'object' ? payload.twitch : {};
  const twitchUser = twitch.user && typeof twitch.user === 'object' ? twitch.user : {};

  const aliasRoot = {
    envelope: root,
    payload,
    eventPayload,
    eventData,
    user,
    chatter,
    dataUser,
    twitch,
    twitchUser
  };

  const loginResult = firstNonEmptyBusValue(aliasRoot, [
    'payload.userLogin',
    'payload.login',
    'payload.user_login',
    'payload.chatterUserLogin',
    'payload.chatter_user_login',
    'payload.chatter_login',
    'payload.chatter.login',
    'payload.chatter.userLogin',
    'payload.chatter.user_login',
    'payload.user.login',
    'payload.user.userLogin',
    'payload.user.user_login',
    'payload.user.name',
    'payload.twitch.user.login',
    'payload.twitch.user.userLogin',
    'payload.twitch.user.user_login',
    'payload.twitch.login',
    'payload.twitch.userLogin',
    'payload.twitch.user_login',
    'payload.twitch.chatter_user_login',
    'payload.twitch.chatterUserLogin',
    'payload.data.login',
    'payload.data.userLogin',
    'payload.data.user_login',
    'payload.data.chatterUserLogin',
    'payload.data.chatter_user_login',
    'payload.data.chatter.login',
    'payload.data.user.login',
    'eventPayload.login',
    'eventPayload.userLogin',
    'eventPayload.user_login',
    'eventPayload.chatterUserLogin',
    'eventPayload.chatter_user_login',
    'eventPayload.user.login',
    'eventData.login',
    'eventData.userLogin',
    'eventData.user_login',
    'eventData.chatterUserLogin',
    'eventData.chatter_user_login',
    'eventData.user.login',
    'twitch.user.login',
    'twitch.user.userLogin',
    'twitch.user.user_login',
    'twitch.login',
    'twitch.userLogin',
    'twitch.user_login',
    'twitch.chatter_user_login',
    'twitch.chatterUserLogin',
    'twitchUser.login',
    'twitchUser.userLogin',
    'twitchUser.user_login',
    'user.login',
    'user.userLogin',
    'user.user_login',
    'chatter.login',
    'chatter.userLogin',
    'chatter.user_login',
    'dataUser.login',
    'dataUser.userLogin',
    'dataUser.user_login'
  ]);

  const displayResult = firstNonEmptyBusValue(aliasRoot, [
    'payload.userDisplayName',
    'payload.displayName',
    'payload.display_name',
    'payload.user_display_name',
    'payload.chatterUserName',
    'payload.chatterUserDisplayName',
    'payload.chatter_user_name',
    'payload.chatter_display_name',
    'payload.user.displayName',
    'payload.user.display_name',
    'payload.user.name',
    'payload.chatter.displayName',
    'payload.chatter.display_name',
    'payload.twitch.user.displayName',
    'payload.twitch.user.display_name',
    'payload.twitch.user.name',
    'payload.twitch.displayName',
    'payload.twitch.display_name',
    'payload.twitch.userDisplayName',
    'payload.twitch.user_display_name',
    'payload.twitch.chatter_user_name',
    'payload.twitch.chatterUserName',
    'payload.data.userDisplayName',
    'payload.data.displayName',
    'payload.data.display_name',
    'payload.data.user_name',
    'payload.data.chatter_user_name',
    'payload.data.chatterUserName',
    'eventPayload.userDisplayName',
    'eventPayload.displayName',
    'eventPayload.user.displayName',
    'eventData.userDisplayName',
    'eventData.displayName',
    'eventData.user_name',
    'eventData.chatter_user_name',
    'twitch.user.displayName',
    'twitch.user.display_name',
    'twitch.user.name',
    'twitch.displayName',
    'twitch.display_name',
    'twitch.userDisplayName',
    'twitch.user_display_name',
    'twitch.chatter_user_name',
    'twitch.chatterUserName',
    'twitchUser.displayName',
    'twitchUser.display_name',
    'twitchUser.name',
    'user.displayName',
    'user.display_name',
    'chatter.displayName',
    'chatter.display_name',
    'dataUser.displayName',
    'dataUser.display_name'
  ]);

  const messageResult = firstNonEmptyBusValue(aliasRoot, [
    'payload.message',
    'payload.rawMessage',
    'payload.text',
    'payload.body',
    'payload.chatMessage',
    'payload.twitch.message',
    'payload.twitch.text',
    'payload.twitch.rawMessage',
    'payload.twitch.body',
    'payload.data.message',
    'payload.data.text',
    'payload.event.message',
    'eventPayload.message',
    'eventPayload.text',
    'eventData.message',
    'eventData.text',
    'twitch.message',
    'twitch.text',
    'twitch.rawMessage',
    'twitch.body'
  ]);

  const userIdResult = firstNonEmptyBusValue(aliasRoot, [
    'payload.userId',
    'payload.user_id',
    'payload.chatterUserId',
    'payload.chatter_user_id',
    'payload.user.userId',
    'payload.user.user_id',
    'payload.twitch.user.userId',
    'payload.twitch.user.user_id',
    'payload.twitch.userId',
    'payload.twitch.user_id',
    'payload.twitch.chatter_user_id',
    'payload.twitch.chatterUserId',
    'payload.data.userId',
    'payload.data.user_id',
    'payload.data.chatter_user_id',
    'eventPayload.userId',
    'eventPayload.user_id',
    'eventData.userId',
    'eventData.user_id',
    'twitch.user.userId',
    'twitch.user.user_id',
    'twitch.userId',
    'twitch.user_id',
    'twitch.chatter_user_id',
    'twitch.chatterUserId',
    'twitchUser.userId',
    'twitchUser.user_id',
    'user.userId',
    'user.user_id',
    'chatter.userId',
    'chatter.user_id',
    'dataUser.userId',
    'dataUser.user_id'
  ]);

  const messageIdResult = firstNonEmptyBusValue(aliasRoot, [
    'payload.messageId',
    'payload.message_id',
    'payload.id',
    'payload.twitch.messageId',
    'payload.twitch.message_id',
    'payload.twitch.id',
    'payload.data.messageId',
    'payload.data.message_id',
    'eventPayload.messageId',
    'eventPayload.message_id',
    'eventData.messageId',
    'eventData.message_id',
    'twitch.messageId',
    'twitch.message_id',
    'twitch.id',
    'envelope.id'
  ]);

  const badges = payload.badges && typeof payload.badges === 'object'
    ? payload.badges
    : (twitch.badges && typeof twitch.badges === 'object'
      ? twitch.badges
      : (twitchUser.badges && typeof twitchUser.badges === 'object'
        ? twitchUser.badges
        : (user.badges && typeof user.badges === 'object'
          ? user.badges
          : (chatter.badges && typeof chatter.badges === 'object' ? chatter.badges : {}))));
  const roles = (user.roles && typeof user.roles === 'object')
    ? user.roles
    : (twitchUser.roles && typeof twitchUser.roles === 'object' ? twitchUser.roles : {});

  const login = cleanLogin(loginResult.value);
  const displayName = cleanDisplay(displayResult.value || login, login);
  const message = String(messageResult.value || '').trim();
  const channel = String(payload.channel || twitch.channel || root.channel || eventPayload.channel || eventData.channel || '').replace(/^#/, '').toLowerCase();

  if (!login || !message) return null;

  return {
    command: 'PRIVMSG',
    login,
    displayName,
    params: [channel ? `#${channel}` : '', message],
    message,
    rawMessage: message,
    text: message,
    channel,
    badges,
    tags: {
      login,
      'display-name': displayName,
      'user-id': String(userIdResult.value || ''),
      id: String(messageIdResult.value || root.id || ''),
      mod: roles.mod || roles.moderator || badges.moderator ? '1' : '0',
      subscriber: roles.subscriber || badges.subscriber || badges.founder ? '1' : '0',
      source: String(payload.source || twitch.source || root.source?.module || '')
    },
    roles,
    sourceEvent: {
      busEventId: String(root.id || root.event?.id || ''),
      sourceModule: String(payload.sourceModule || root.source?.module || ''),
      eventKey: String(payload.eventKey || 'twitch.chat.message'),
      receivedAt: String(payload.receivedAt || payload.received_at || twitch.receivedAt || twitch.received_at || root.timestamp || eventPayload.receivedAt || eventData.receivedAt || nowIso()),
      loginSource: loginResult.source,
      displayNameSource: displayResult.source
    }
  };
}

function handleAutoShoutoutBusChatEvent(envelope = {}, env = process.env) {
  const subscriber = state.autoShoutout.busSubscriber;
  subscriber.delivered += 1;
  state.stats.autoBusDelivered += 1;
  subscriber.lastReceivedAt = nowIso();
  subscriber.lastEventId = String(envelope.id || envelope.event?.id || '');
  subscriber.lastSourceModule = String(envelope.payload?.sourceModule || envelope.source?.module || '');

  const parsed = normalizeBusChatPayload(envelope);
  if (!parsed) {
    subscriber.lastResultReason = 'invalid_chat_payload';
    subscriber.lastError = '';
    return { ok: true, skipped: true, reason: 'invalid_chat_payload' };
  }

  subscriber.lastLogin = parsed.login;
  subscriber.lastMessagePreview = previewText(parsed.message || parsed.rawMessage || '');

  Promise.resolve(handleAutoShoutoutChatActivity(parsed, {
    source: parsed.sourceEvent?.sourceModule || 'twitch_events',
    channel: parsed.channel || '',
    busEventId: parsed.sourceEvent?.busEventId || subscriber.lastEventId,
    eventKey: parsed.sourceEvent?.eventKey || 'twitch.chat.message',
    busSubscriber: true
  }, env)).then((result) => {
    subscriber.lastHandledAt = nowIso();
    subscriber.lastResultReason = result && (result.reason || result.error || (result.triggered ? 'triggered' : 'ok')) || 'ok';
    subscriber.lastError = '';
    return result;
  }).catch((err) => {
    const error = err && err.message ? err.message : String(err);
    subscriber.errors += 1;
    state.stats.autoBusErrors += 1;
    subscriber.lastError = error;
    subscriber.lastResultReason = 'error';
    state.autoShoutout.lastError = error;
    try {
      emitShoutoutBus('shoutout.auto.bus_handler_failed', { error, busEventId: subscriber.lastEventId, targetLogin: subscriber.lastLogin }, shoutoutConfig());
    } catch (_) {}
  });

  return { ok: true, accepted: true, reason: 'auto_shoutout_bus_handler_scheduled' };
}

function installAutoShoutoutBusSubscriber(env = process.env) {
  const subscriber = state.autoShoutout.busSubscriber;
  if (subscriber.installed === true) return { ok: true, installed: true, alreadyInstalled: true, subscriptionId: subscriber.subscriptionId };

  const bus = getCommunicationBus();
  if (!bus || typeof bus.subscribe !== 'function') {
    subscriber.installed = false;
    subscriber.lastError = 'communication_bus_subscribe_unavailable';
    return { ok: false, installed: false, reason: 'communication_bus_subscribe_unavailable' };
  }

  const result = bus.subscribe({
    id: 'clip_shoutout:twitch.chat:message:auto_shoutout',
    module: MODULE_NAME,
    channel: 'twitch.chat',
    action: 'message',
    capability: 'twitch.chat.message',
    meta: {
      step: 'CAN44.29',
      purpose: 'auto_shoutout_runtime',
      sourceModule: 'twitch_events',
      fallbackDirectWrapperKept: true
    }
  }, (envelope) => {
    subscriber.lastReceivedAt = nowIso();
    state.stats.autoBusReceived += 1;
    return handleAutoShoutoutBusChatEvent(envelope, env);
  });

  if (!result || result.ok !== true) {
    subscriber.installed = false;
    subscriber.lastError = String(result && (result.reason || result.error) || 'subscription_failed');
    return { ok: false, installed: false, reason: subscriber.lastError };
  }

  subscriber.installed = true;
  subscriber.subscriptionId = result.subscription && result.subscription.id ? String(result.subscription.id) : 'clip_shoutout:twitch.chat:message:auto_shoutout';
  subscriber.lastError = '';
  subscriber.lastResultReason = 'installed';
  emitShoutoutBus('shoutout.auto.bus_subscriber.installed', { subscriptionId: subscriber.subscriptionId, channel: subscriber.channel, action: subscriber.action }, shoutoutConfig());
  return { ok: true, installed: true, subscriptionId: subscriber.subscriptionId };
}

function autoResetStartIso(mode = 'today') {
  const now = new Date();
  const normalized = String(mode || 'today').trim().toLowerCase();
  if (normalized === 'stream' || normalized === 'streamday' || normalized === 'current_stream') {
    const cfg = shoutoutConfig();
    const streamDay = resolveCurrentStreamDay(process.env, cfg);
    const started = streamDay && streamDay.row && streamDay.row.stream_started_at ? String(streamDay.row.stream_started_at || '') : '';
    if (started) return { mode: normalized, since: started, streamDayId: String(streamDay.streamDayId || '') };
  }
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return { mode: 'today', since: start.toISOString(), streamDayId: '' };
}

function autoResetTargetLogins(body = {}, cfg = null) {
  const currentCfg = cfg || shoutoutConfig();
  const raw = body.login || body.target || body.user || body.name || body.channel || '';
  const explicit = cleanLogin(raw);
  if (explicit) return [explicit];
  const streamers = listAutoStreamers(currentCfg).map(row => cleanLogin(row.login)).filter(Boolean);
  return Array.from(new Set(streamers));
}


function clearAutoShoutoutTarget(body = {}) {
  ensureAutoShoutoutSchema();
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();

  const cfg = shoutoutConfig();
  const login = cleanLogin(body.login || body.target || body.user || body.name || body.channel || '');
  if (!login) return { ok: false, error: 'login_required' };

  const mode = String(body.mode || body.scope || 'today').trim().toLowerCase();
  const resetInfo = autoResetStartIso(mode);
  const since = String(body.since || body.start || resetInfo.since || '').trim();
  const streamDayId = String(body.streamDayId || body.stream_day_id || '').trim();
  const reason = String(body.reason || 'auto_shoutout_clear_target').trim();
  const now = nowIso();
  const params = { login, since };
  const streamDaySql = streamDayId ? ' AND stream_day_id=:streamDayId' : '';
  if (streamDayId) params.streamDayId = streamDayId;
  const updateParams = { ...params, now, reason };

  const affectedDisplayRows = database.all(`
    SELECT id,target_login,status,stream_day_id,created_at,meta_json,input_json
    FROM clip_shoutout_display_queue
    WHERE target_login=:login
      AND created_at >= :since
      ${streamDaySql}
      AND status IN ('queued','waiting','active','done','failed')
  `, params) || [];
  const displayIds = affectedDisplayRows.map(row => Number(row.id || 0)).filter(Boolean);
  const displayIdParams = {};
  const displayIdSql = displayIds.length
    ? ` OR display_queue_id IN (${displayIds.map((id, idx) => { const key = `displayId${idx}`; displayIdParams[key] = id; return `:${key}`; }).join(',')})`
    : '';

  const removedOfficialQueue = database.run(`
    UPDATE clip_shoutout_official_queue
    SET status='removed', updated_at=:now, last_error=:reason
    WHERE status IN ('queued','waiting','failed')
      AND (
        (target_login=:login AND created_at >= :since)
        ${displayIdSql}
      )
  `, { ...updateParams, ...displayIdParams });

  const historyDisplayIdParams = {};
  const historyDisplayIdSql = displayIds.length
    ? `AND display_queue_id IN (${displayIds.map((id, idx) => { const key = `histDisplayId${idx}`; historyDisplayIdParams[key] = id; return `:${key}`; }).join(',')})`
    : '';

  const deletedOfficialHistory = database.run(`
    DELETE FROM clip_shoutout_official_history
    WHERE target_login=:login
      AND sent_at >= :since
      ${historyDisplayIdSql}
  `, { ...params, ...historyDisplayIdParams });

  const removedDisplay = database.run(`
    UPDATE clip_shoutout_display_queue
    SET status='removed', updated_at=:now, last_error=:reason
    WHERE target_login=:login
      AND created_at >= :since
      ${streamDaySql}
      AND status IN ('queued','waiting','active','done','failed')
  `, updateParams);

  const deletedEvents = database.run(`
    DELETE FROM clip_shoutout_auto_events
    WHERE target_login=:login
      AND created_at >= :since
      ${streamDaySql}
  `, params);

  const activityParams = streamDayId ? { login, streamDayId } : { login };
  const deletedActivity = database.run(`
    DELETE FROM clip_shoutout_auto_message_activity
    WHERE target_login=:login
      ${streamDayId ? 'AND stream_day_id=:streamDayId' : ''}
  `, activityParams);

  resetAutoShoutoutRuntimeState('auto_clear_target');
  emitShoutoutBus('shoutout.auto.target_cleared', {
    login,
    mode: resetInfo.mode || mode || 'today',
    since,
    streamDayId,
    reason,
    affectedDisplayQueueIds: displayIds,
    removedDisplay: Number(removedDisplay && (removedDisplay.changes ?? removedDisplay.affectedRows) || 0),
    removedOfficialQueue: Number(removedOfficialQueue && (removedOfficialQueue.changes ?? removedOfficialQueue.affectedRows) || 0),
    deletedOfficialHistory: Number(deletedOfficialHistory && (deletedOfficialHistory.changes ?? deletedOfficialHistory.affectedRows) || 0),
    deletedEvents: Number(deletedEvents && (deletedEvents.changes ?? deletedEvents.affectedRows) || 0),
    deletedActivity: Number(deletedActivity && (deletedActivity.changes ?? deletedActivity.affectedRows) || 0)
  }, cfg);

  return {
    ok: true,
    login,
    mode: resetInfo.mode || mode || 'today',
    since,
    streamDayId,
    affectedDisplayQueueIds: displayIds,
    removedDisplay: Number(removedDisplay && (removedDisplay.changes ?? removedDisplay.affectedRows) || 0),
    removedOfficialQueue: Number(removedOfficialQueue && (removedOfficialQueue.changes ?? removedOfficialQueue.affectedRows) || 0),
    deletedOfficialHistory: Number(deletedOfficialHistory && (deletedOfficialHistory.changes ?? deletedOfficialHistory.affectedRows) || 0),
    deletedEvents: Number(deletedEvents && (deletedEvents.changes ?? deletedEvents.affectedRows) || 0),
    deletedActivity: Number(deletedActivity && (deletedActivity.changes ?? deletedActivity.affectedRows) || 0),
    runtimeReset: true
  };
}

function resetAutoShoutoutDay(body = {}) {
  ensureAutoShoutoutSchema();
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();

  const cfg = shoutoutConfig();
  const mode = String(body.mode || body.scope || 'today').trim().toLowerCase();
  const resetInfo = autoResetStartIso(mode);
  const since = String(body.since || body.start || resetInfo.since || '').trim();
  const targets = autoResetTargetLogins(body, cfg);
  const now = nowIso();
  const params = { since };
  const updateParams = { since, now };
  const targetParams = {};
  const targetSql = targets.length
    ? ` AND target_login IN (${targets.map((login, idx) => { const key = `login${idx}`; targetParams[key] = login; return `:${key}`; }).join(',')})`
    : '';

  const affectedDisplayRows = database.all(`
    SELECT id,target_login,status,stream_day_id,created_at,meta_json,input_json
    FROM clip_shoutout_display_queue
    WHERE created_at >= :since
      ${targetSql}
      AND status IN ('queued','waiting','active','failed')
  `, { ...params, ...targetParams }) || [];
  const displayIds = affectedDisplayRows.map(row => Number(row.id || 0)).filter(Boolean);
  const displayIdParams = {};
  const displayIdSql = displayIds.length
    ? ` OR display_queue_id IN (${displayIds.map((id, idx) => { const key = `displayId${idx}`; displayIdParams[key] = id; return `:${key}`; }).join(',')})`
    : '';

  const removedOfficial = database.run(`
    UPDATE clip_shoutout_official_queue
    SET status='removed', updated_at=:now, last_error='auto_shoutout_reset'
    WHERE status IN ('queued','waiting','failed')
      AND (
        created_at >= :since
        ${targetSql}
        ${displayIdSql}
      )
  `, { ...updateParams, ...targetParams, ...displayIdParams });

  const removedDisplay = database.run(`
    UPDATE clip_shoutout_display_queue
    SET status='removed', updated_at=:now, last_error='auto_shoutout_reset'
    WHERE created_at >= :since
      ${targetSql}
      AND status IN ('queued','waiting','active','failed')
  `, { ...updateParams, ...targetParams });

  const deletedEvents = database.run(`
    DELETE FROM clip_shoutout_auto_events
    WHERE created_at >= :since
      ${targetSql}
      AND (
        status <> 'triggered'
        ${displayIdSql}
      )
  `, { ...params, ...targetParams, ...displayIdParams });

  resetAutoShoutoutRuntimeState('auto_reset_day');
  emitShoutoutBus('shoutout.auto.day_reset', {
    mode: resetInfo.mode || mode || 'today',
    since,
    streamDayId: resetInfo.streamDayId || '',
    targets,
    removedDisplay: Number(removedDisplay && (removedDisplay.changes ?? removedDisplay.affectedRows) || 0),
    removedOfficial: Number(removedOfficial && (removedOfficial.changes ?? removedOfficial.affectedRows) || 0),
    deletedEvents: Number(deletedEvents && (deletedEvents.changes ?? deletedEvents.affectedRows) || 0)
  }, cfg);

  return {
    ok: true,
    mode: resetInfo.mode || mode || 'today',
    since,
    streamDayId: resetInfo.streamDayId || '',
    targets,
    affectedDisplayQueueIds: displayIds,
    removedDisplay: Number(removedDisplay && (removedDisplay.changes ?? removedDisplay.affectedRows) || 0),
    removedOfficial: Number(removedOfficial && (removedOfficial.changes ?? removedOfficial.affectedRows) || 0),
    deletedEvents: Number(deletedEvents && (deletedEvents.changes ?? deletedEvents.affectedRows) || 0),
    runtimeReset: true
  };
}

function autoShoutoutStatus(cfg) {
  const acfg = autoShoutoutConfig(cfg);
  return {
    enabled: acfg.enabled === true,
    onlyWhenLive: acfg.onlyWhenLive === true,
    triggerOnFirstMessageOnly: acfg.triggerOnFirstMessageOnly !== false,
    minMessagesBeforeTrigger: Math.max(1, Number(acfg.minMessagesBeforeTrigger || 3)),
    messageWindowMs: Math.max(60000, Number(acfg.messageWindowMs || 1800000)),
    greetingEnabled: acfg.greetingEnabled !== false,
    greetingOnlyWhenTriggering: acfg.greetingOnlyWhenTriggering !== false,
    greetingTextKey: String(acfg.greetingTextKey || 'auto.greeting'),
    respectStreamDayLimit: acfg.respectStreamDayLimit !== false,
    globalCooldownMs: Math.max(0, Number(acfg.globalCooldownMs || 0)),
    perStreamerCooldownMs: Math.max(0, Number(acfg.perStreamerCooldownMs || 0)),
    sendChatMessage: acfg.sendChatMessage !== false,
    storeSkippedEvents: acfg.storeSkippedEvents === true,
    queuedMessage: String(acfg.queuedMessage || ''),
    messages: normalizeAutoMessages(acfg.messages || {}, acfg || {}),
    sceneGate: readShoutoutSceneGateState(cfg),
    configSource: acfg.configSource || 'database',
    jsonFallbackUsed: acfg.jsonFallbackUsed === true,
    database: acfg.database || {},
    configuredStreamers: listAutoStreamers(cfg),
    configuredStreamerCount: listAutoStreamers(cfg).length,
    recentEvents: listAutoShoutoutEvents(20),
    recentActivity: listAutoMessageActivity(20),
    textEditor: textHelper.listModuleTextEditor(MODULE_NAME, AUTO_SHOUTOUT_TEXT_DEFAULTS, AUTO_SHOUTOUT_TEXT_OPTIONS),
    state: {
      lastCheckedAt: state.autoShoutout.lastCheckedAt,
      lastTriggeredAt: state.autoShoutout.lastTriggeredAt,
      lastTriggeredLogin: state.autoShoutout.lastTriggeredLogin,
      lastSkippedAt: state.autoShoutout.lastSkippedAt,
      lastSkippedLogin: state.autoShoutout.lastSkippedLogin,
      lastSkipReason: state.autoShoutout.lastSkipReason,
      lastError: state.autoShoutout.lastError,
      noticeMemoryCount: Object.keys(state.autoShoutout.noticeMemory || {}).length,
      activity: state.autoShoutout.activity || {},
      streamDay: state.autoShoutout.streamDay || {},
      busSubscriber: { ...(state.autoShoutout.busSubscriber || {}) }
    }
  };
}


let directChatCommandBypassInstalled = false;
let originalCommandsHandleChatMessage = null;

function directIntakeConfig(cfg = {}) {
  const raw = isPlainObject(cfg.directIntake) ? cfg.directIntake : {};
  const fallback = DEFAULT_CONFIG.clipShoutout.directIntake || {};
  return {
    enabled: asBool(raw.enabled, fallback.enabled !== false)
  };
}

function sanitizeDirectIntakeSettings(input = {}) {
  const raw = isPlainObject(input) ? input : {};
  const fallback = DEFAULT_CONFIG.clipShoutout.directIntake || {};
  return {
    enabled: asBool(raw.enabled, fallback.enabled !== false)
  };
}

function parseCommandAliasesJson(value) {
  if (Array.isArray(value)) return value;
  const text = String(value || '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return text.split(',').map(item => item.trim()).filter(Boolean);
  }
}

function directCommandInfo(cfg = {}) {
  const intake = directIntakeConfig(cfg);
  if (intake.enabled === false) {
    return { enabled: false, triggers: [], primaryTrigger: "", source: "disabled", commandDefinitionCount: 0, fallbackUsed: false };
  }
  const rows = commandDefinitionRows().filter(row => Number(row.enabled) !== 0);
  const names = rows.flatMap(row => [row.trigger, ...parseCommandAliasesJson(row.aliases_json)]);
  const triggers = Array.from(new Set(names.map(cleanLogin).filter(Boolean)));
  return {
    enabled: true,
    triggers,
    primaryTrigger: cleanLogin(rows[0] && rows[0].trigger) || "",
    source: "command_definitions",
    commandDefinitionCount: rows.length,
    fallbackUsed: false
  };
}

function directCommandTriggers(cfg = {}) {
  return directCommandInfo(cfg).triggers;
}

function directIntakeStatus(cfg = {}) {
  const info = directCommandInfo(cfg);
  return {
    enabled: info.enabled,
    source: info.source,
    commandDefinitionCount: info.commandDefinitionCount,
    fallbackUsed: info.fallbackUsed
  };
}

function hasDirectCommandPermission(cfg, parsed = {}) {
  const level = String(cfg.permissionLevel || "mod").trim().toLowerCase();
  if (!level || level === "everyone" || level === "all") return true;
  const badges = parsed.badges || {};
  const tags = parsed.tags || {};
  const isBroadcaster = Boolean(badges.broadcaster || tags.badges?.includes?.("broadcaster/1"));
  const isMod = Boolean(badges.moderator || tags.mod === "1");
  const isVip = Boolean(badges.vip);
  const isSubscriber = Boolean(badges.subscriber || badges.founder || tags.subscriber === "1");
  if (level === "subscriber" || level === "sub") return isSubscriber || isVip || isMod || isBroadcaster;
  if (level === "vip") return isVip || isMod || isBroadcaster;
  if (level === "mod" || level === "moderator") return isMod || isBroadcaster;
  if (level === "streamer" || level === "broadcaster" || level === "owner") return isBroadcaster;
  return false;
}

function parseDirectChatCommand(rawMessage, cfg) {
  const prefix = String(process.env.COMMAND_PREFIX || "!").trim() || "!";
  const text = String(rawMessage || "").trim();
  if (!text || !text.startsWith(prefix)) return null;
  const withoutPrefix = text.slice(prefix.length).trim();
  if (!withoutPrefix) return null;
  const parts = withoutPrefix.split(/\s+/).filter(Boolean);
  const trigger = cleanLogin(parts.shift() || "");
  if (!trigger) return null;
  const triggers = directCommandTriggers(cfg);
  if (!triggers.includes(trigger)) return null;
  return {
    trigger,
    args: parts,
    argText: parts.join(" "),
    rawInput: withoutPrefix,
    rawMessage: text,
    target: parts[0] || ""
  };
}

async function invokeHandleRunDirect(input, env) {
  return await new Promise((resolve) => {
    const req = { body: input || {}, query: {} };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = Number(code || 200);
        return this;
      },
      json(data) {
        resolve({ statusCode: this.statusCode || 200, data });
        return data;
      }
    };
    Promise.resolve(handleRun(req, res, env)).catch(err => {
      resolve({
        statusCode: 500,
        data: {
          ok: false,
          module: MODULE_NAME,
          moduleVersion: MODULE_VERSION,
          error: err && err.message ? err.message : String(err)
        }
      });
    });
  });
}

function installDirectChatCommandBypass(env) {
  if (directChatCommandBypassInstalled) return { ok: true, installed: true, alreadyInstalled: true };
  if (!commands || typeof commands.handleChatMessage !== "function") {
    return { ok: false, installed: false, error: "commands_handleChatMessage_unavailable" };
  }

  originalCommandsHandleChatMessage = commands.handleChatMessage;
  commands.handleChatMessage = async function clipShoutoutDirectCommandWrapper(parsed, source = {}) {
    try {
      if (parsed && String(parsed.command || "").toUpperCase() === "PRIVMSG") {
        const cfg = shoutoutConfig();
        const rawMessage = String(parsed.params?.[1] || parsed.params?.[parsed.params.length - 1] || "").trim();
        const commandPrefix = String(process.env.COMMAND_PREFIX || "!").trim() || "!";
        const traceId = rawMessage.startsWith(commandPrefix)
          ? createCommandIntakeTrace({
              source: 'direct_chat_command_bypass',
              rawMessage,
              userLogin: cleanLogin(parsed.login || ''),
              userDisplayName: cleanDisplay(parsed.displayName || parsed.login || '', parsed.login || ''),
              channel: source.channel || '',
              sourceName: source.source || 'twitch_presence'
            })
          : '';
        if (traceId) addCommandIntakeTraceStep(traceId, 'wrapper.raw_message', { rawMessage });
        const parsedCommand = parseDirectChatCommand(rawMessage, cfg);
        if (traceId) addCommandIntakeTraceStep(traceId, 'wrapper.parse_result', { matched: Boolean(parsedCommand), parsedCommand: parsedCommand || null, triggers: directCommandTriggers(cfg) });

        if (parsedCommand) {
          if (!hasDirectCommandPermission(cfg, parsed)) {
            if (traceId) finishCommandIntakeTrace(traceId, 'permission_denied', { trigger: parsedCommand.trigger, targetRaw: parsedCommand.target, userLogin: cleanLogin(parsed.login || '') });
            emitShoutoutBus("shoutout.command.permission_denied", {
              trigger: parsedCommand.trigger,
              userLogin: cleanLogin(parsed.login || ""),
              targetRaw: parsedCommand.target
            }, cfg);
            return {
              ok: false,
              ignored: true,
              reason: "permission_denied",
              command: parsedCommand.trigger,
              module: MODULE_NAME,
              directClipShoutout: true
            };
          }

          const input = {
            target: parsedCommand.target,
            targetLogin: parsedCommand.target,
            input0: parsedCommand.target,
            args: parsedCommand.args,
            rawInput: parsedCommand.rawInput,
            input: parsedCommand.rawInput,
            text: parsedCommand.argText,
            message: rawMessage,
            rawMessage,
            user: parsed.displayName || parsed.login || "",
            userName: parsed.displayName || parsed.login || "",
            userLogin: parsed.login || "",
            login: parsed.login || "",
            displayName: parsed.displayName || parsed.login || "",
            userDisplayName: parsed.displayName || parsed.login || "",
            badges: parsed.badges || {},
            tags: parsed.tags || {},
            isBroadcaster: Boolean(parsed.badges?.broadcaster),
            isMod: Boolean(parsed.badges?.moderator || parsed.tags?.mod === "1"),
            isVip: Boolean(parsed.badges?.vip),
            isSubscriber: Boolean(parsed.badges?.subscriber || parsed.badges?.founder || parsed.tags?.subscriber === "1"),
            source: source.source || "twitch_presence",
            channel: source.channel || "",
            __intakeTraceId: traceId,
            directClipShoutoutBypass: true,
            commandSystemBypassed: true
          };

          if (traceId) addCommandIntakeTraceStep(traceId, 'wrapper.invoke_handleRun', { target: parsedCommand.target, trigger: parsedCommand.trigger });
          const result = await invokeHandleRunDirect(input, env);
          if (traceId) addCommandIntakeTraceStep(traceId, 'wrapper.handleRun_result', { statusCode: result.statusCode || 0, ok: Boolean(result.data && result.data.ok), queued: Boolean(result.data && result.data.queued), blocked: Boolean(result.data && result.data.blocked), reason: result.data && result.data.reason || '', displayQueueId: result.data && result.data.displayQueue && result.data.displayQueue.id || 0 });
          state.lastRun = {
            ...(state.lastRun || {}),
            directChatCommandBypass: true,
            commandTrigger: parsedCommand.trigger,
            source: source.source || "twitch_presence",
            commandStatusCode: result.statusCode || 0,
            commandResultOk: Boolean(result.data && result.data.ok)
          };
          const traceRowAfterRun = findCommandIntakeTrace(traceId);
          if (traceId && traceRowAfterRun && !traceRowAfterRun.final) finishCommandIntakeTrace(traceId, 'wrapper_finished', { ok: Boolean(result.data && result.data.ok), statusCode: result.statusCode || 0 });
          emitShoutoutBus("shoutout.command.direct_bypass", {
            trigger: parsedCommand.trigger,
            targetLogin: cleanLogin(parsedCommand.target),
            ok: Boolean(result.data && result.data.ok),
            statusCode: result.statusCode || 0
          }, cfg);
          return {
            ok: Boolean(result.data && result.data.ok),
            command: parsedCommand.trigger,
            module: MODULE_NAME,
            directClipShoutout: true,
            statusCode: result.statusCode || 0,
            result: result.data
          };
        }
        if (!parsedCommand) {
          if (state.autoShoutout.busSubscriber && state.autoShoutout.busSubscriber.installed === true) {
            state.autoShoutout.busSubscriber.lastResultReason = 'direct_wrapper_auto_fallback_skipped_bus_subscriber_installed';
          } else {
            handleAutoShoutoutChatActivity(parsed, source, env).catch(err => {
              state.autoShoutout.lastError = err && err.message ? err.message : String(err);
            });
          }
        }
        if (traceId) finishCommandIntakeTrace(traceId, 'not_clip_shoutout_command', { rawMessage });
      }
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
      try {
        emitShoutoutBus("shoutout.command.direct_bypass_failed", { error: state.lastError }, shoutoutConfig());
      } catch (_) {}
      return {
        ok: false,
        command: "",
        module: MODULE_NAME,
        directClipShoutout: true,
        error: state.lastError
      };
    }

    return originalCommandsHandleChatMessage(parsed, source);
  };

  directChatCommandBypassInstalled = true;
  return { ok: true, installed: true, directClipShoutoutBypass: true };
}



function buildClipShoutoutRouteStatus() {
  return `GET status status|GET/POST run runtime|GET/POST /api/clip/shoutout runtime legacy|GET clips clips|GET/POST settings settings|GET/POST texts texts|GET/POST overlay-sets overlay_sets|GET texts/migration texts|GET queue queue_status|POST display-queue/remove display_queue|POST display-queue/retry display_queue|POST queue/remove official_queue legacy|POST queue/retry official_queue legacy|GET official/auth-status official_queue|GET/POST debug/test-queue debug|GET/POST debug/intake-trace debug|GET timeline stats|GET stats stats|GET stats/user stats|GET inbound inbound|GET inbound/stats inbound|POST inbound/debug inbound|GET auto auto_shoutout|GET/POST auto/settings auto_shoutout|GET/POST auto/texts auto_shoutout|GET/POST auto/streamers auto_shoutout|POST auto/streamers/remove auto_shoutout|POST auto/test-chat auto_shoutout|POST auto/clear-target auto_shoutout|POST auto/reset-day auto_shoutout|GET scene-gate scene_gate|GET production-check diagnostics|GET live-test diagnostics|GET decision-prep diagnostics|GET /api/stream-status/status external_status`
    .split('|')
    .map(row => {
      const [method, rawPath, group, legacy] = row.split(' ');
      const path = rawPath.startsWith('/') ? rawPath : `${API_PREFIX}/${rawPath}`;
      return { method, path, group, legacy: legacy === 'legacy' };
    });
}

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

module.exports.recordTwitchShoutoutEvent = recordTwitchShoutoutEvent;
module.exports.buildInboundShoutoutStats = buildInboundShoutoutStats;
module.exports.handleAutoShoutoutChatActivity = handleAutoShoutoutChatActivity;

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const cfg = shoutoutConfig();
  ensureDisplayQueueSchema();
  ensureOfficialShoutoutSchema();
  ensureInboundShoutoutSchema();
  ensureAutoShoutoutSchema();
  textHelper.seedModuleTextVariants(MODULE_NAME, AUTO_SHOUTOUT_TEXT_DEFAULTS, AUTO_SHOUTOUT_TEXT_OPTIONS);
  textHelper.seedModuleTextVariants(MODULE_NAME, SHOUTOUT_TEXT_DEFAULTS, SHOUTOUT_TEXT_OPTIONS);
  resetStaleDisplayQueueActiveRows();
  registerCommand(cfg);
  installDirectChatCommandBypass(env);
  installAutoShoutoutBusSubscriber(env);
  startDisplayQueueWorker(env, cfg);
  startOfficialShoutoutWorker(env, cfg);

  app.get(`${API_PREFIX}/status`, (req, res) => {
    const currentCfg = shoutoutConfig();
    state.recentClipGuard = publicRecentClipGuard(currentCfg);
    const commandInfo = directCommandInfo(currentCfg);
    const command = commandInfo.primaryTrigger || cleanLogin(currentCfg.command || "so") || "so";
    res.json({
      ok: true,
      module: MODULE_NAME,
      moduleVersion: MODULE_VERSION,
      enabled: currentCfg.enabled !== false,
      registeredCommand: state.registeredCommand,
      directChatCommandBypassInstalled,
      officialRetryChatMessagesSuppressed: true,
      officialManualChatMessagesEnabled: shouldSendOfficialChatMessages(currentCfg),
      command,
      aliases: currentCfg.aliases || [],
      directIntake: directIntakeStatus(currentCfg),
      effectiveCommandTriggers: commandInfo.triggers,
      routes: buildClipShoutoutRouteStatus(),
      config: {
        maxClipDurationSeconds: currentCfg.maxClipDurationSeconds,
        allowLongerClipFallback: currentCfg.allowLongerClipFallback,
        fallbackMaxClipDurationSeconds: currentCfg.fallbackMaxClipDurationSeconds,
        clipLookbackDays: currentCfg.clipLookbackDays,
        clipSearchRangesDays: currentCfg.clipSearchRangesDays,
        clipPlaybackCandidateLimit: currentCfg.clipPlaybackCandidateLimit,
        clipFetchFirst: currentCfg.clipFetchFirst,
        clipFetchPages: currentCfg.clipFetchPages,
        randomPick: currentCfg.randomPick !== false,
        avoidRecentClips: currentCfg.avoidRecentClips !== false,
        recentClipMemoryPerChannel: currentCfg.recentClipMemoryPerChannel,
        recentClipFallbackWhenAllBlocked: currentCfg.recentClipFallbackWhenAllBlocked !== false,
        ttsAfterClipEnabled: currentCfg.ttsAfterClipEnabled,
        clipPlaybackMode: currentCfg.clipPlaybackMode || "twitch_clip",
        cacheDownloadedClips: currentCfg.cacheDownloadedClips,
        directPlaybackSoundIdFix: true,
        soundBundleUrl: currentCfg.soundBundleUrl,
        soundCategory: currentCfg.soundCategory,
        soundPriority: currentCfg.soundPriority,
        avatarLookupEnabled: currentCfg.avatarLookupEnabled,
        avatarLookupUrl: currentCfg.avatarLookupUrl,
        eventBusEnabled: currentCfg.eventBusEnabled !== false,
        inboundShoutout: inboundShoutoutConfig(currentCfg),
        autoShoutout: autoShoutoutConfig(currentCfg),
        displayQueue: displayConfig(currentCfg),
        officialShoutout: officialConfig(currentCfg),
        streamDayLimit: streamDayLimitConfig(currentCfg),
        directIntake: directIntakeStatus(currentCfg),
        effectiveCommandTriggers: commandInfo.triggers,
        streamStatus: currentCfg.streamStatus || {},
        overlaySets: publicShoutoutOverlaySets(currentCfg)
      },
      displayQueue: displayQueueStatus(currentCfg),
      officialQueue: officialQueueStatus(currentCfg),
      inboundShoutout: buildInboundShoutoutStats({ limit: 12 }),
      autoShoutout: autoShoutoutStatus(currentCfg),
      streamStatus: readCurrentStreamState(currentCfg),
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


  app.get(`${API_PREFIX}/overlay-sets`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        overlaySets: publicShoutoutOverlaySets(currentCfg),
        settingsRoute: `${API_PREFIX}/settings`,
        textsRoute: `${API_PREFIX}/texts`
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/overlay-sets`, (req, res) => {
    try {
      const body = req.body || {};
      const sets = normalizeShoutoutOverlaySets(body.sets || body.overlaySets || body);
      const settings = saveShoutoutConfig({ overlaySets: sets });
      emitShoutoutBus('shoutout.overlaySets.updated', { count: sets.length }, settings);
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        overlaySets: publicShoutoutOverlaySets(settings)
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/texts`, (req, res) => {
    try {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        texts: shoutoutTextEditor(),
        migration: buildShoutoutTextMigrationPlan(shoutoutConfig()),
        compatibility: {
          legacyAutoTextsRoute: `${API_PREFIX}/auto/texts`,
          runtimeUsesLegacyFallbacks: true,
          dashboardReady: true
        },
        dashboard: {
          category: 'shoutout.overlay',
          categoryLabel: 'Shoutout Overlay',
          keys: ['shoutout.overlay.sets', 'shoutout.overlay.headline', 'shoutout.overlay.subline'],
          placeholders: ['{displayName}', '{login}', '{clipTitle}', '{clipUrl}', '{gameName}'],
          settingsRoute: `${API_PREFIX}/settings`,
          setsRoute: `${API_PREFIX}/overlay-sets`,
          preferredMode: 'paired_sets'
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/texts`, (req, res) => {
    try {
      const body = req.body || {};
      const action = String(body.action || '').trim();
      const texts = action === 'replaceKeyVariants'
        ? replaceShoutoutTextVariants(body.key || body.textKey || '', body.variants || body.values || body.text || '', { category: body.category || '' })
        : textHelper.handleModuleTextEditorPayload(MODULE_NAME, body, SHOUTOUT_TEXT_OPTIONS);
      emitShoutoutBus('shoutout.texts.updated', { action: action || 'helper_payload', key: body.key || body.textKey || '' }, shoutoutConfig());
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        texts,
        migration: buildShoutoutTextMigrationPlan(shoutoutConfig())
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/texts/migration`, (req, res) => {
    try {
      res.json(buildShoutoutTextMigrationPlan(shoutoutConfig()));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/settings`, (req, res) => {
    try {
      const body = req.body || {};
      const allowed = {};
      const directKeys = [
        "enabled", "command", "aliases", "permissionLevel", "clipLookbackDays", "clipSearchRangesDays",
        "clipPlaybackCandidateLimit", "clipFetchFirst", "clipFetchPages", "maxClipDurationSeconds",
        "allowLongerClipFallback", "fallbackMaxClipDurationSeconds", "randomPick", "avoidRecentClips",
        "recentClipFallbackWhenAllBlocked", "sendChatMessage", "chatMessage", "overlaySubline", "overlayBranding", "eventBusEnabled"
      , "overlaySets"];
      for (const key of directKeys) if (Object.prototype.hasOwnProperty.call(body, key)) allowed[key] = body[key];
      if (body.displayQueue && typeof body.displayQueue === "object") allowed.displayQueue = body.displayQueue;
      if (body.officialShoutout && typeof body.officialShoutout === "object") allowed.officialShoutout = body.officialShoutout;
      if (body.streamDayLimit && typeof body.streamDayLimit === "object") allowed.streamDayLimit = body.streamDayLimit;
      if (body.directIntake && typeof body.directIntake === "object") allowed.directIntake = sanitizeDirectIntakeSettings(body.directIntake);
      if (body.streamStatus && typeof body.streamStatus === "object") allowed.streamStatus = body.streamStatus;
      if (body.inboundShoutout && typeof body.inboundShoutout === "object") allowed.inboundShoutout = body.inboundShoutout;

      let autoSettings = null;
      let autoStreamerUpdates = [];
      if (body.autoShoutout && typeof body.autoShoutout === "object") {
        autoSettings = saveAutoShoutoutSettings(body.autoShoutout, shoutoutConfig());
        if (Array.isArray(body.autoShoutout.streamers)) {
          autoStreamerUpdates = body.autoShoutout.streamers.map(row => saveAutoStreamer(row, { source: "settings_route" }));
        }
      }

      const settings = Object.keys(allowed).length ? saveShoutoutConfig(allowed) : shoutoutConfig();
      const commandRegistration = registerCommand(settings, { syncFromConfig: Object.prototype.hasOwnProperty.call(body, "command") || Object.prototype.hasOwnProperty.call(body, "aliases") });
      emitShoutoutBus("shoutout.settings.updated", { changedKeys: Object.keys(allowed), autoShoutoutChanged: !!autoSettings, commandRegistration }, settings);
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, settings: shoutoutConfig(), autoSettings, autoStreamerUpdates, commandRegistration });
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

  app.get(`${API_PREFIX}/debug/test-queue`, (req, res) => {
    handleDebugQueueTest(req, res, env).catch(err => {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    });
  });

  app.post(`${API_PREFIX}/debug/test-queue`, (req, res) => {
    handleDebugQueueTest(req, res, env).catch(err => {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    });
  });

  app.get(`${API_PREFIX}/debug/intake-trace`, (req, res) => {
    try {
      const clear = database.boolFromDb(database.normalizeBool((req.query || {}).clear || false));
      const limit = Number.parseInt((req.query || {}).limit, 10) || 30;
      const before = state.commandIntakeTrace.length;
      const traces = publicCommandIntakeTrace(limit);
      if (clear) state.commandIntakeTrace = [];
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, count: before, cleared: clear, traces });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/debug/intake-trace`, (req, res) => {
    try {
      const body = req.body || {};
      const clear = database.boolFromDb(database.normalizeBool(body.clear || false));
      const limit = Number.parseInt(body.limit, 10) || 30;
      const before = state.commandIntakeTrace.length;
      const traces = publicCommandIntakeTrace(limit);
      if (clear) state.commandIntakeTrace = [];
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, count: before, cleared: clear, traces });
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/timeline`, (req, res) => {
    try {
      res.json(buildShoutoutTimeline({
        limit: req.query?.limit,
        target: req.query?.target,
        targetLogin: req.query?.targetLogin,
        streamDayId: req.query?.streamDayId,
        since: req.query?.since,
        until: req.query?.until
      }));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/stats`, (req, res) => {
    try {
      res.json(buildShoutoutStats({
        limit: req.query?.limit,
        detailLimit: req.query?.detailLimit,
        target: req.query?.target,
        targetLogin: req.query?.targetLogin,
        requester: req.query?.requester,
        requestedBy: req.query?.requestedBy,
        requestedByLogin: req.query?.requestedByLogin,
        streamDayId: req.query?.streamDayId
      }));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/stats/user`, (req, res) => {
    try {
      res.json(buildShoutoutStats({
        limit: req.query?.limit,
        detailLimit: req.query?.detailLimit,
        target: req.query?.target,
        targetLogin: req.query?.targetLogin,
        requester: req.query?.requester,
        requestedBy: req.query?.requestedBy,
        requestedByLogin: req.query?.requestedByLogin,
        streamDayId: req.query?.streamDayId
      }));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });


  app.get(`${API_PREFIX}/production-check`, async (req, res) => {
    try {
      const result = await buildShoutoutProductionCheck();
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    }
  });

  const handleLiveTestDecision = async (req, res) => {
    try {
      const result = await buildShoutoutLiveTestDecision();
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: err && err.message ? err.message : String(err) });
    }
  };

  app.get(`${API_PREFIX}/live-test`, handleLiveTestDecision);
  app.get(`${API_PREFIX}/decision-prep`, handleLiveTestDecision);


  app.get(`${API_PREFIX}/inbound`, (req, res) => {
    try {
      res.json(listInboundShoutoutEvents({
        limit: req.query?.limit,
        direction: req.query?.direction,
        login: req.query?.login
      }));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/inbound/stats`, (req, res) => {
    try {
      res.json(buildInboundShoutoutStats({ limit: req.query?.limit }));
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/auto`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, autoShoutout: autoShoutoutStatus(currentCfg), streamStatus: readCurrentStreamState(currentCfg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/scene-gate`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, sceneGate: readShoutoutSceneGateState(currentCfg, env) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/auto/settings`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, settings: autoShoutoutConfig(currentCfg), status: autoShoutoutStatus(currentCfg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/settings`, (req, res) => {
    try {
      const body = req.body || {};
      const input = body.autoShoutout && typeof body.autoShoutout === 'object' ? body.autoShoutout : body;
      const settings = saveAutoShoutoutSettings(input, shoutoutConfig());
      emitShoutoutBus('shoutout.auto.settings.updated', { changedKeys: Object.keys(input || {}) }, shoutoutConfig());
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, settings, status: autoShoutoutStatus(shoutoutConfig()) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/auto/texts`, (req, res) => {
    try {
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        texts: textHelper.listModuleTextEditor(MODULE_NAME, AUTO_SHOUTOUT_TEXT_DEFAULTS, AUTO_SHOUTOUT_TEXT_OPTIONS)
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/texts`, (req, res) => {
    try {
      const body = req.body || {};
      const action = String(body.action || '').trim();
      const texts = action === 'replaceKeyVariants'
        ? replaceAutoTextVariants(body.key || 'auto.greeting', body.variants || body.values || body.text || '', { category: body.category || 'auto_shoutout' })
        : textHelper.handleModuleTextEditorPayload(MODULE_NAME, body, AUTO_SHOUTOUT_TEXT_OPTIONS);
      res.json({
        ok: true,
        module: MODULE_NAME,
        moduleVersion: MODULE_VERSION,
        texts
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.get(`${API_PREFIX}/auto/streamers`, (req, res) => {
    try {
      const currentCfg = shoutoutConfig();
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, streamers: listAutoStreamers(currentCfg), status: autoShoutoutStatus(currentCfg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/streamers`, (req, res) => {
    try {
      const body = req.body || {};
      const rows = Array.isArray(body.streamers) ? body.streamers : [body.streamer && typeof body.streamer === 'object' ? body.streamer : body];
      const results = rows.map(row => saveAutoStreamer(row, { source: 'auto_streamers_route' }));
      const failed = results.find(row => row && row.ok === false);
      if (failed) return res.status(400).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, results, error: failed.error || 'auto_streamer_save_failed' });
      emitShoutoutBus('shoutout.auto.streamers.updated', { count: results.length }, shoutoutConfig());
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, results, streamers: listAutoStreamers(shoutoutConfig()), status: autoShoutoutStatus(shoutoutConfig()) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/streamers/remove`, (req, res) => {
    try {
      const body = req.body || {};
      const login = cleanLogin(body.login || body.user || body.target || req.query?.login || '');
      const result = removeAutoStreamer(login);
      if (result.ok === false) return res.status(400).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: result.error || 'auto_streamer_remove_failed' });
      emitShoutoutBus('shoutout.auto.streamer.removed', { login: result.login, deleted: result.deleted, changes: result.changes }, shoutoutConfig());
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, result, streamers: listAutoStreamers(shoutoutConfig()), status: autoShoutoutStatus(shoutoutConfig()) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/test-chat`, async (req, res) => {
    try {
      const body = req.body || {};
      const login = cleanLogin(body.login || body.user || body.target || req.query?.login || '');
      if (!login) return res.status(400).json({ ok: false, error: 'login_required' });
      const parsed = {
        command: 'PRIVMSG',
        login,
        displayName: cleanDisplay(body.displayName || body.display || login, login),
        params: [String(req.query?.channel || body.channel || ''), String(body.message || 'Hallo')],
        badges: {},
        tags: { login, 'display-name': cleanDisplay(body.displayName || body.display || login, login) }
      };
      const dryRunRaw = body.dryRun ?? body.dry_run ?? req.query?.dryRun ?? req.query?.dry_run;
      const executeRaw = body.execute ?? body.run ?? req.query?.execute ?? req.query?.run;
      const execute = executeRaw === true || String(executeRaw || '').toLowerCase() === 'true' || String(executeRaw || '') === '1';
      const dryRun = execute ? false : !(dryRunRaw === false || String(dryRunRaw || '').toLowerCase() === 'false' || String(dryRunRaw || '') === '0');
      const source = { source: dryRun ? 'api_auto_test_dry_run' : 'api_auto_test', channel: String(req.query?.channel || body.channel || ''), dryRun };
      const result = dryRun
        ? await simulateAutoShoutoutChatActivity(parsed, source, env)
        : await handleAutoShoutoutChatActivity(parsed, source, env);
      res.json({ ok: result && result.ok !== false, dryRun, result, autoShoutout: autoShoutoutStatus(shoutoutConfig()) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });


  app.post(`${API_PREFIX}/auto/clear-target`, (req, res) => {
    try {
      const body = req.body || {};
      const result = clearAutoShoutoutTarget({ ...body, ...(req.query || {}) });
      if (result.ok === false) return res.status(400).json({ ok: false, module: MODULE_NAME, moduleVersion: MODULE_VERSION, error: result.error || 'auto_clear_target_failed' });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, result, autoShoutout: autoShoutoutStatus(shoutoutConfig()), queue: { displayQueue: displayQueueStatus(shoutoutConfig()), officialQueue: officialQueueStatus(shoutoutConfig()) } });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/auto/reset-day`, (req, res) => {
    try {
      const body = req.body || {};
      const result = resetAutoShoutoutDay({ ...body, ...(req.query || {}) });
      res.json({ ok: true, module: MODULE_NAME, moduleVersion: MODULE_VERSION, result, autoShoutout: autoShoutoutStatus(shoutoutConfig()), queue: { displayQueue: displayQueueStatus(shoutoutConfig()), officialQueue: officialQueueStatus(shoutoutConfig()) } });
    } catch (err) {
      res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
  });

  app.post(`${API_PREFIX}/inbound/debug`, (req, res) => {
    try {
      const body = req.body || {};
      const direction = cleanLogin(body.direction || req.query?.direction || 'incoming') === 'outgoing' ? 'outgoing' : 'incoming';
      const fromLogin = cleanLogin(body.from || body.fromLogin || req.query?.from || 'testsender');
      const toLogin = cleanLogin(body.to || body.toLogin || req.query?.to || 'forrestcgn');
      const eventType = direction === 'outgoing' ? 'channel.shoutout.create' : 'channel.shoutout.receive';
      const event = direction === 'outgoing' ? {
        broadcaster_user_id: String(body.fromId || '1000'),
        broadcaster_user_login: fromLogin,
        broadcaster_user_name: cleanDisplay(body.fromDisplay || fromLogin, fromLogin),
        to_broadcaster_user_id: String(body.toId || '2000'),
        to_broadcaster_user_login: toLogin,
        to_broadcaster_user_name: cleanDisplay(body.toDisplay || toLogin, toLogin),
        moderator_user_id: String(body.moderatorId || body.fromId || '1000'),
        moderator_user_login: cleanLogin(body.moderator || fromLogin),
        moderator_user_name: cleanDisplay(body.moderatorDisplay || body.moderator || fromLogin, fromLogin),
        viewer_count: Number(body.viewerCount || req.query?.viewerCount || 0),
        started_at: nowIso(),
        cooldown_ends_at: '',
        target_cooldown_ends_at: ''
      } : {
        broadcaster_user_id: String(body.toId || '2000'),
        broadcaster_user_login: toLogin,
        broadcaster_user_name: cleanDisplay(body.toDisplay || toLogin, toLogin),
        from_broadcaster_user_id: String(body.fromId || '1000'),
        from_broadcaster_user_login: fromLogin,
        from_broadcaster_user_name: cleanDisplay(body.fromDisplay || fromLogin, fromLogin),
        viewer_count: Number(body.viewerCount || req.query?.viewerCount || 0),
        started_at: nowIso()
      };
      const result = recordTwitchShoutoutEvent(eventType, event, { message_id: `debug_shoutout_${Date.now()}`, message_timestamp: nowIso() }, { id: 'debug', type: eventType });
      res.status(result && result.ok === false ? 500 : 200).json({ ok: result && result.ok !== false, eventType, event, result });
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

  console.log(`[${MODULE_NAME}] loaded v${MODULE_VERSION}: ${API_PREFIX}/run, ${API_PREFIX}/clips, ${API_PREFIX}/queue, ${API_PREFIX}/inbound, /api/clip/shoutout`);
};
