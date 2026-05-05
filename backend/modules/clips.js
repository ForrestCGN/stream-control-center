// modules/clips.js
// STEP185.5 — Clip-System Discord-Channel-Setting + Textkategorie-Cleanup.
// - vorhandene /api/clip/status, /api/clip/title und /api/clip/register bleiben erhalten
// - Clip-Historie wird sanft in app.sqlite gespeichert
// - Discord-Posting nutzt die vorhandene Discord-Bridge
// - Clip-Texte koennen ueber den zentralen helper_texts als module_text_variants vorbereitet werden
// - Twitch-/OBS-/Discord-Readiness wird fuer den spaeteren Backend-Create-Flow sichtbar gemacht
// - Clip-Settings werden ueber helper_settings in clip_settings vorbereitet
// - Clip-Texte werden ueber helper_texts in module_text_variants kategorisiert und variantenfaehig vorbereitet
// - Discord-Zielkanal kann per Key oder direkter Channel-ID aus DB-Settings kommen
// - alte Clip-Textkategorie "clip" wird sanft auf chat/discord/errors/system migriert

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const database = require('../core/database');
const messageHelper = require('./helpers/helper_messages');
let settingsHelper = null;
try {
  settingsHelper = require('./helpers/helper_settings');
} catch (_) {
  settingsHelper = null;
}
let textHelper = null;
try {
  textHelper = require('./helpers/helper_texts');
} catch (_) {
  textHelper = null;
}

const MODULE_NAME = 'clips';
const CLIP_SCHEMA_VERSION = 1;
const CLIP_HISTORY_TABLE = 'clip_history';
const CLIP_SETTINGS_TABLE = 'clip_settings';

const DEFAULT_CLIP_SETTINGS_META = [
  { key: 'enabled', valueType: 'boolean', description: 'Clip-System aktiv/inaktiv.' },
  { key: 'backendCreateEnabled', valueType: 'boolean', description: 'Backend darf spaeter Twitch-Clip und OBS-Replay zentral erstellen.' },
  { key: 'defaultClipTitle', valueType: 'string', description: 'Fallback-Titel, wenn kein Streamtitel/Game gefunden wird.' },
  { key: 'includeGameInCustomTitle', valueType: 'boolean', description: 'Game-Name an eigene Clip-Titel anhaengen.' },
  { key: 'twitchClipDurationSeconds', valueType: 'number', description: 'Zielwert fuer Twitch-Clips; Twitch veroeffentlicht standardmaessig bis ca. 30 Sekunden.' },
  { key: 'twitchClipPollMs', valueType: 'number', description: 'Polling-Abstand fuer spaetere Twitch-Clip-Abfrage.' },
  { key: 'twitchClipPollMaxAttempts', valueType: 'number', description: 'Maximale Polling-Versuche fuer spaetere Twitch-Clip-Abfrage.' },
  { key: 'obsReplaySaveEnabled', valueType: 'boolean', description: 'Lokalen OBS-Replay-Clip speichern.' },
  { key: 'obsReplayWindowSeconds', valueType: 'number', description: 'Fachliche OBS-Replay-Gesamtlaenge. Ziel: 60 Sekunden.' },
  { key: 'obsReplayPreTriggerSeconds', valueType: 'number', description: 'Sekunden vor !clip im lokalen OBS-Replay. Ziel: 30 Sekunden.' },
  { key: 'obsReplayPostTriggerSeconds', valueType: 'number', description: 'Sekunden nach !clip im lokalen OBS-Replay. Ziel: 30 Sekunden.' },
  { key: 'obsReplaySaveDelayMs', valueType: 'number', description: 'Delay nach !clip bis SaveReplayBuffer. Ziel: 30000ms fuer 30s Nachlauf.' },
  { key: 'localReplayRenameEnabled', valueType: 'boolean', description: 'OBS-Replay-Datei nach dem Speichern automatisch suchen/umbenennen.' },
  { key: 'localReplayRenameDelayMs', valueType: 'number', description: 'Wartezeit nach SaveReplayBuffer vor der Dateisuche.' },
  { key: 'localReplayDir', valueType: 'string', description: 'Ordner, in dem OBS ReplayBuffer-Dateien landen.' },
  { key: 'localReplayLookbackMinutes', valueType: 'number', description: 'Wie weit rueckwaerts nach einer frischen Replay-Datei gesucht wird.' },
  { key: 'sendClipActivatedMessage', valueType: 'boolean', description: 'Startmeldung im Twitch-Chat vorbereiten.' },
  { key: 'sendTwitchClipResultMessage', valueType: 'boolean', description: 'Ergebnisnachricht im Twitch-Chat vorbereiten.' },
  { key: 'sendChatResponse', valueType: 'boolean', description: 'Backend gibt Chat-Antworten fuer Streamer.bot zurueck.' },
  { key: 'discordPostEnabled', valueType: 'boolean', description: 'Clip-Eintraege nach Discord posten.' },
  { key: 'discordChannelMode', valueType: 'string', description: 'Discord-Ziel: key nutzt discord_channels.json, custom nutzt discordChannelId.' },
  { key: 'discordChannelKey', valueType: 'string', description: 'Key aus config/discord_channels.json fuer Clip-Posts.' },
  { key: 'discordChannelId', valueType: 'string', description: 'Direkte Discord-Channel-ID fuer Clip-Posts, wenn discordChannelMode=custom.' },
  { key: 'postOnlyWhenLive', valueType: 'boolean', description: 'Discord-Post nur wenn Twitch live ist.' },
  { key: 'saveHistory', valueType: 'boolean', description: 'Clip-Historie in app.sqlite speichern.' },
  { key: 'duplicatePolicy', valueType: 'string', description: 'Umgang mit Duplikaten: ignore, update oder allow.' },
  { key: 'messagesPath', valueType: 'string', description: 'JSON-Fallback fuer Clip-Texte.' }
];

const CLIP_TEXT_CATEGORIES = {
  chatClipActivated: 'chat',
  chatClipCreated: 'chat',
  chatClipFailed: 'errors',
  chatClipCreatedWithoutUrl: 'errors',
  chatLocalReplayMissing: 'errors',
  chatLocalReplayInvalidDir: 'errors',
  chatReplaySaved: 'chat',
  chatClipDuplicate: 'chat',
  discordClipPost: 'discord',
  discordClipPartial: 'discord',
  discordClipFailed: 'discord',
  systemDisabled: 'system',
  systemBackendNotReady: 'system',
  systemTwitchScopeMissing: 'system',
  systemObsReplayNotReady: 'system'
};

const CLIP_TEXT_CATEGORY_LABELS = {
  chat: 'Chat-Texte',
  discord: 'Discord-Texte',
  errors: 'Fehlertexte',
  system: 'Systemtexte'
};

const DEFAULT_CLIP_TEXTS = {
  chatClipActivated: [
    '/me 🎬 Clip wird gesichert...',
    '/me 🎥 Moment markiert. Die Heimleitung sichert den Clip.'
  ],
  chatClipCreated: [
    '/me 📺 Twitch-Clip: {clipUrl}',
    '/me 🎬 Clip ist da: {clipUrl}'
  ],
  chatClipFailed: [
    '/me ❌ Twitch-Clip konnte nicht erstellt werden.',
    '/me ⚠️ Clip-Erstellung ist gerade fehlgeschlagen.'
  ],
  chatClipCreatedWithoutUrl: [
    '/me ⚠️ Twitch-Clip wurde erstellt, aber URL/ID ist noch nicht verfügbar.'
  ],
  chatLocalReplayMissing: [
    '/me ❌ Kein frischer Replay-Clip gefunden.'
  ],
  chatLocalReplayInvalidDir: [
    '/me ⚠️ Ungültiger Clip-Ordner: {clipsDir}'
  ],
  chatReplaySaved: [
    '/me ✅ Lokaler Replay-Clip wurde gespeichert.'
  ],
  chatClipDuplicate: [
    '/me ℹ️ Dieser Clip wurde bereits verarbeitet.'
  ],
  discordClipPost: [
    '🎬 Die Heimleitung hat einen neuen Clip gesichert.\n\n**Titel:** {clipTitle}\n**Spiel:** {gameName}\n**Ausgelöst von:** {triggerUser}\n\n{clipUrl}',
    '📺 Neuer Clip im Archiv.\n\n**{clipTitle}**\nGame: {gameName}\nAusgelöst von: {triggerUser}\n\n{clipUrl}'
  ],
  discordClipPartial: [
    '⚠️ Clip teilweise verarbeitet.\n\n**Titel:** {clipTitle}\n**Status:** {status}\n**Grund:** {reason}\n{clipUrl}'
  ],
  discordClipFailed: [
    '❌ Clip konnte nicht vollständig verarbeitet werden.\n\n**Titel:** {clipTitle}\n**Grund:** {reason}'
  ],
  systemDisabled: [
    'Clip-System ist deaktiviert.'
  ],
  systemBackendNotReady: [
    'Clip-Backend ist noch nicht bereit.'
  ],
  systemTwitchScopeMissing: [
    'Twitch-OAuth-Scope clips:edit fehlt.'
  ],
  systemObsReplayNotReady: [
    'OBS Replay Buffer ist nicht bereit.'
  ]
};

module.exports.init = function init(ctx) {
  const { app, env } = ctx;

  const rootDir = resolveRootDir(ctx, env);
  const configDir = path.join(rootDir, 'config');
  const messagesDir = path.join(configDir, 'messages');

  const clipConfigPath = path.join(configDir, 'clip_system.json');
  const discordChannelsPath = path.join(configDir, 'discord_channels.json');

  try {
    ensureClipSchema();
  } catch (err) {
    console.warn('[clips] DB-Schema konnte beim Start nicht vorbereitet werden:', err.message || String(err));
  }

  function loadClipConfig() {
    const raw = readJsonSafe(clipConfigPath, {});
    const base = buildClipConfigFromRaw(raw, env);
    const settingsSeed = buildClipSettingsSeed(base);
    seedClipSettings(settingsSeed);

    const cfg = { ...base };
    const settingSources = {};

    for (const item of DEFAULT_CLIP_SETTINGS_META) {
      const result = readClipSetting(item.key, base[item.key], item.valueType, item.description);
      cfg[item.key] = result.value;
      settingSources[item.key] = result.source;
    }

    cfg.enabled = Boolean(cfg.enabled);
    cfg.backendCreateEnabled = Boolean(cfg.backendCreateEnabled);
    cfg.defaultClipTitle = String(cfg.defaultClipTitle || 'Clip').trim() || 'Clip';
    cfg.includeGameInCustomTitle = Boolean(cfg.includeGameInCustomTitle);
    cfg.twitchClipDurationSeconds = toInt(cfg.twitchClipDurationSeconds, 30, 1, 120);
    cfg.twitchClipPollMs = toInt(cfg.twitchClipPollMs, 2000, 500, 10000);
    cfg.twitchClipPollMaxAttempts = toInt(cfg.twitchClipPollMaxAttempts, 8, 1, 30);
    cfg.obsReplaySaveEnabled = Boolean(cfg.obsReplaySaveEnabled);
    cfg.obsReplayWindowSeconds = toInt(cfg.obsReplayWindowSeconds, 60, 1, 600);
    cfg.obsReplayPreTriggerSeconds = toInt(cfg.obsReplayPreTriggerSeconds, 30, 0, 300);
    cfg.obsReplayPostTriggerSeconds = toInt(cfg.obsReplayPostTriggerSeconds, 30, 0, 300);
    cfg.obsReplaySaveDelayMs = toInt(cfg.obsReplaySaveDelayMs, cfg.obsReplayPostTriggerSeconds * 1000, 0, 300000);
    cfg.localReplayRenameEnabled = Boolean(cfg.localReplayRenameEnabled);
    cfg.localReplayRenameDelayMs = toInt(cfg.localReplayRenameDelayMs, 3000, 0, 60000);
    cfg.localReplayDir = String(cfg.localReplayDir || '').trim();
    cfg.localReplayLookbackMinutes = toInt(cfg.localReplayLookbackMinutes, 5, 1, 60);
    cfg.sendClipActivatedMessage = Boolean(cfg.sendClipActivatedMessage);
    cfg.sendTwitchClipResultMessage = Boolean(cfg.sendTwitchClipResultMessage);
    cfg.sendChatResponse = Boolean(cfg.sendChatResponse);
    cfg.discordPostEnabled = Boolean(cfg.discordPostEnabled);
    cfg.discordChannelMode = normalizeDiscordChannelMode(cfg.discordChannelMode);
    cfg.discordChannelKey = String(cfg.discordChannelKey || 'clips').trim() || 'clips';
    cfg.discordChannelId = normalizeDiscordChannelId(cfg.discordChannelId);
    cfg.postOnlyWhenLive = Boolean(cfg.postOnlyWhenLive);
    cfg.saveHistory = Boolean(cfg.saveHistory);
    cfg.duplicatePolicy = normalizeDuplicatePolicy(cfg.duplicatePolicy);
    cfg.messagesPath = String(cfg.messagesPath || 'messages/clips.json').trim() || 'messages/clips.json';
    cfg.broadcasterId = base.broadcasterId;
    cfg.channelSummaryUrl = base.channelSummaryUrl;
    cfg.settingsTable = CLIP_SETTINGS_TABLE;
    cfg.settingsFromDbPrepared = Boolean(settingsHelper);
    cfg.settingSources = settingSources;

    return cfg;
  }

  function loadDiscordChannels() {
    return readJsonSafe(discordChannelsPath, {});
  }

  function loadClipMessages(cfg) {
    const fallback = readJsonSafe(resolveMaybeAbsolute(configDir, cfg.messagesPath), {});
    seedClipTexts(fallback);
    return fallback;
  }

  async function loadChannelInfoFromApi(cfg) {
    if (!cfg.broadcasterId) {
      return {
        ok: false,
        source: 'api',
        title: '',
        game_name: '',
        is_live: null,
        error: 'Missing TWITCH_BROADCASTER_ID in .env.'
      };
    }

    const url = appendQuery(cfg.channelSummaryUrl, { id: cfg.broadcasterId });

    try {
      const data = await httpJsonGet(url, 3500);
      if (!data || data.ok === false) {
        return {
          ok: false,
          source: 'api',
          url,
          title: '',
          game_name: '',
          is_live: null,
          error: data?.error || 'Channel summary returned no usable data.'
        };
      }

      return {
        ok: true,
        source: 'api',
        url,
        title: firstString(data.title, data.stream_title, data.channel_title),
        game_name: firstString(data.game_name, data.gameName, data.category, data.game),
        is_live: typeof data.is_live === 'boolean' ? data.is_live : null,
        raw: data
      };
    } catch (err) {
      return {
        ok: false,
        source: 'api',
        url,
        title: '',
        game_name: '',
        is_live: null,
        error: err.message || String(err)
      };
    }
  }

  function localApiBaseUrl() {
    return `http://127.0.0.1:${String(env?.PORT || process.env.PORT || 8080).trim()}`;
  }

  async function loadTwitchAuthReadiness(cfg) {
    const url = `${localApiBaseUrl()}/api/twitch/auth/validate`;
    try {
      const data = await httpJsonGet(url, 3500);
      const tokenUserMatchesBroadcaster = Boolean(data?.tokenUserMatchesBroadcaster);
      const hasClipsEdit = Boolean(data?.hasClipsEdit);
      const broadcasterIdConfigured = Boolean(cfg.broadcasterId);
      const readyForCreateClip = Boolean(data?.ok && broadcasterIdConfigured && tokenUserMatchesBroadcaster && hasClipsEdit);
      const blockers = [];

      if (!data?.ok) blockers.push('token_validate_failed');
      if (!broadcasterIdConfigured) blockers.push('broadcaster_id_missing');
      if (data?.ok && !tokenUserMatchesBroadcaster) blockers.push('token_user_does_not_match_broadcaster');
      if (data?.ok && !hasClipsEdit) blockers.push('missing_scope_clips_edit');

      return {
        ok: Boolean(data?.ok),
        validateUrl: url,
        tokenPresent: Boolean(data?.present),
        login: String(data?.login || ''),
        userId: String(data?.userId || ''),
        broadcasterId: String(data?.broadcasterId || cfg.broadcasterId || ''),
        tokenUserMatchesBroadcaster,
        hasClipsEdit,
        expiresIn: Number(data?.expiresIn || 0),
        scopes: Array.isArray(data?.scopes) ? data.scopes : [],
        readyForCreateClip,
        blockers
      };
    } catch (err) {
      return {
        ok: false,
        validateUrl: url,
        tokenPresent: false,
        login: '',
        userId: '',
        broadcasterId: cfg.broadcasterId || '',
        tokenUserMatchesBroadcaster: false,
        hasClipsEdit: false,
        expiresIn: 0,
        scopes: [],
        readyForCreateClip: false,
        blockers: ['token_validate_route_unavailable'],
        error: err.message || String(err)
      };
    }
  }

  async function loadObsReplayReadiness(cfg) {
    const url = `${localApiBaseUrl()}/api/obs/replay/status`;
    try {
      const data = await httpJsonGet(url, 3500);
      const replayBufferActive = Boolean(data?.data?.replayBufferActive);
      const readyForBackendSave = Boolean(data?.ok && replayBufferActive);
      const blockers = [];
      if (!data?.ok) blockers.push('obs_replay_status_failed');
      if (!replayBufferActive) blockers.push('obs_replay_buffer_not_active');

      return {
        ok: Boolean(data?.ok),
        statusUrl: url,
        bridgeAvailable: Boolean(data?.ok),
        replayBufferActive,
        readyForBackendSave,
        targetReplayWindowSeconds: cfg.obsReplayWindowSeconds,
        targetPreTriggerSeconds: cfg.obsReplayPreTriggerSeconds,
        targetPostTriggerSeconds: cfg.obsReplayPostTriggerSeconds,
        configuredPostTriggerDelayMs: cfg.obsReplaySaveDelayMs,
        blockers
      };
    } catch (err) {
      return {
        ok: false,
        statusUrl: url,
        bridgeAvailable: false,
        replayBufferActive: false,
        readyForBackendSave: false,
        targetReplayWindowSeconds: cfg.obsReplayWindowSeconds,
        targetPreTriggerSeconds: cfg.obsReplayPreTriggerSeconds,
        targetPostTriggerSeconds: cfg.obsReplayPostTriggerSeconds,
        configuredPostTriggerDelayMs: cfg.obsReplaySaveDelayMs,
        blockers: ['obs_replay_status_route_unavailable'],
        error: err.message || String(err)
      };
    }
  }

  function resolveEffectiveDiscordChannel(cfg, channels) {
    const mode = normalizeDiscordChannelMode(cfg.discordChannelMode);
    const customId = normalizeDiscordChannelId(cfg.discordChannelId);
    const key = String(cfg.discordChannelKey || 'clips').trim() || 'clips';
    const keyId = normalizeDiscordChannelId(channels?.[key]);

    if (mode === 'custom') {
      return {
        mode,
        channelKey: key,
        channelId: customId,
        source: customId ? 'clip_settings.discordChannelId' : '',
        configured: Boolean(customId)
      };
    }

    return {
      mode: 'key',
      channelKey: key,
      channelId: keyId,
      source: keyId ? 'config/discord_channels.json' : '',
      configured: Boolean(keyId)
    };
  }

  function buildDiscordReadiness(cfg, channels) {
    const effectiveChannel = resolveEffectiveDiscordChannel(cfg, channels);
    const bridgeAvailable = Boolean(app.locals.discordBridge && typeof app.locals.discordBridge.postToChannel === 'function');
    const readyForPost = Boolean(!cfg.discordPostEnabled || (effectiveChannel.configured && bridgeAvailable));
    const blockers = [];

    if (cfg.discordPostEnabled && !effectiveChannel.configured) blockers.push('discord_channel_not_configured');
    if (cfg.discordPostEnabled && !bridgeAvailable) blockers.push('discord_bridge_unavailable');

    return {
      discordPostEnabled: cfg.discordPostEnabled,
      discordChannelMode: effectiveChannel.mode,
      discordChannelKey: effectiveChannel.channelKey,
      discordChannelId: effectiveChannel.channelId,
      discordChannelSource: effectiveChannel.source,
      discordChannelConfigured: effectiveChannel.configured,
      bridgeAvailable,
      readyForPost,
      blockers
    };
  }

  function buildBackendCreateReadiness(cfg, twitchApi, obsReplay, discord) {
    const blockers = [];
    if (!cfg.enabled) blockers.push('clip_system_disabled');
    if (!cfg.backendCreateEnabled) blockers.push('backend_create_disabled');
    if (!twitchApi.readyForCreateClip) blockers.push(...(twitchApi.blockers || ['twitch_not_ready']));
    if (!obsReplay.readyForBackendSave) blockers.push(...(obsReplay.blockers || ['obs_replay_not_ready']));
    if (!discord.readyForPost) blockers.push(...(discord.blockers || ['discord_not_ready']));

    return {
      ready: blockers.length === 0,
      twitchCreateReady: Boolean(twitchApi.readyForCreateClip),
      obsReplayReady: Boolean(obsReplay.readyForBackendSave),
      discordReady: Boolean(discord.readyForPost),
      blockers: Array.from(new Set(blockers))
    };
  }

  function buildClipTitle(input, cfg, channelInfo) {
    const rawInput = String(input || '').trim();
    const customTitle = extractCustomTitle(rawInput);
    const streamTitle = String(channelInfo.title || '').trim();
    const gameName = String(channelInfo.game_name || '').trim();

    let clipTitle = '';

    if (customTitle) {
      clipTitle = cfg.includeGameInCustomTitle && gameName ? `${customTitle} | ${gameName}` : customTitle;
    } else if (streamTitle) {
      clipTitle = streamTitle;
    } else if (gameName) {
      clipTitle = gameName;
    } else {
      clipTitle = cfg.defaultClipTitle || 'Clip';
    }

    clipTitle = sanitizeOneLine(clipTitle);
    if (!clipTitle) clipTitle = cfg.defaultClipTitle || 'Clip';

    return {
      clipTitle,
      customTitle,
      streamTitle,
      gameName,
      rawInput
    };
  }

  function publicMessages(messages) {
    return {
      chatClipActivated: resolveClipMessage(messages, 'chatClipActivated'),
      chatClipCreated: resolveClipMessage(messages, 'chatClipCreated'),
      chatClipFailed: resolveClipMessage(messages, 'chatClipFailed'),
      chatClipCreatedWithoutUrl: resolveClipMessage(messages, 'chatClipCreatedWithoutUrl'),
      chatLocalReplayMissing: resolveClipMessage(messages, 'chatLocalReplayMissing'),
      chatLocalReplayInvalidDir: resolveClipMessage(messages, 'chatLocalReplayInvalidDir'),
      chatReplaySaved: resolveClipMessage(messages, 'chatReplaySaved'),
      discordClipPost: resolveClipMessage(messages, 'discordClipPost')
    };
  }

  function publicClipRuntimeConfig(cfg) {
    return {
      backendCreateEnabled: cfg.backendCreateEnabled,
      twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
      twitchClipPollMs: cfg.twitchClipPollMs,
      twitchClipPollMaxAttempts: cfg.twitchClipPollMaxAttempts,
      obsReplaySaveEnabled: cfg.obsReplaySaveEnabled,
      obsReplayWindowSeconds: cfg.obsReplayWindowSeconds,
      obsReplayPreTriggerSeconds: cfg.obsReplayPreTriggerSeconds,
      obsReplayPostTriggerSeconds: cfg.obsReplayPostTriggerSeconds,
      obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
      localReplayRenameEnabled: cfg.localReplayRenameEnabled,
      localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
      localReplayDir: cfg.localReplayDir,
      localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
      sendClipActivatedMessage: cfg.sendClipActivatedMessage,
      sendTwitchClipResultMessage: cfg.sendTwitchClipResultMessage,
      sendChatResponse: cfg.sendChatResponse,
      discordPostEnabled: cfg.discordPostEnabled,
      discordChannelMode: cfg.discordChannelMode,
      discordChannelKey: cfg.discordChannelKey,
      discordChannelId: cfg.discordChannelId,
      postOnlyWhenLive: cfg.postOnlyWhenLive,
      saveHistory: cfg.saveHistory,
      duplicatePolicy: cfg.duplicatePolicy
    };
  }

  app.get('/api/clip/status', async (req, res) => {
    const cfg = loadClipConfig();
    const channels = loadDiscordChannels();
    const messages = loadClipMessages(cfg);
    const channelInfo = await loadChannelInfoFromApi(cfg);
    const clipMessagesPath = resolveMaybeAbsolute(configDir, cfg.messagesPath);
    const dbStatus = getClipDbStatus();
    const twitchApi = await loadTwitchAuthReadiness(cfg);
    const obsReplay = await loadObsReplayReadiness(cfg);
    const discord = buildDiscordReadiness(cfg, channels);
    const backendCreate = buildBackendCreateReadiness(cfg, twitchApi, obsReplay, discord);

    res.json({
      ok: true,
      module: MODULE_NAME,
      version: 2,
      schemaVersion: CLIP_SCHEMA_VERSION,
      enabled: cfg.enabled,
      rootDir,
      config: {
        channelInfoSource: 'api',
        broadcasterIdConfigured: Boolean(cfg.broadcasterId),
        backendCreateEnabled: cfg.backendCreateEnabled,
        twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
        twitchClipPollMs: cfg.twitchClipPollMs,
        twitchClipPollMaxAttempts: cfg.twitchClipPollMaxAttempts,
        obsReplaySaveEnabled: cfg.obsReplaySaveEnabled,
        obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
        obsReplayWindowSeconds: cfg.obsReplayWindowSeconds,
        obsReplayPreTriggerSeconds: cfg.obsReplayPreTriggerSeconds,
        obsReplayPostTriggerSeconds: cfg.obsReplayPostTriggerSeconds,
        localReplayRenameEnabled: cfg.localReplayRenameEnabled,
        localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
        localReplayDirConfigured: Boolean(cfg.localReplayDir),
        localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
        discordChannelMode: cfg.discordChannelMode,
        discordChannelKey: cfg.discordChannelKey,
        discordChannelIdConfigured: Boolean(cfg.discordChannelId),
        saveHistory: cfg.saveHistory,
        duplicatePolicy: cfg.duplicatePolicy,
        settingsTable: CLIP_SETTINGS_TABLE,
        settingsFromDbPrepared: Boolean(settingsHelper),
        messagesFromDbPrepared: Boolean(textHelper),
        textCategories: CLIP_TEXT_CATEGORY_LABELS
      },
      database: dbStatus,
      files: {
        clipConfigPath,
        clipConfigExists: fs.existsSync(clipConfigPath),
        discordChannelsPath,
        discordChannelsExists: fs.existsSync(discordChannelsPath),
        clipMessagesPath,
        clipMessagesExists: fs.existsSync(clipMessagesPath),
        messagesDir,
        messagesDirExists: fs.existsSync(messagesDir)
      },
      twitchApi,
      obsReplay,
      discord,
      backendCreate,
      messages: {
        chatClipActivatedConfigured: Boolean(resolveClipMessage(messages, 'chatClipActivated')),
        chatClipCreatedConfigured: Boolean(resolveClipMessage(messages, 'chatClipCreated')),
        chatClipFailedConfigured: Boolean(resolveClipMessage(messages, 'chatClipFailed')),
        chatClipCreatedWithoutUrlConfigured: Boolean(resolveClipMessage(messages, 'chatClipCreatedWithoutUrl')),
        chatLocalReplayMissingConfigured: Boolean(resolveClipMessage(messages, 'chatLocalReplayMissing')),
        chatLocalReplayInvalidDirConfigured: Boolean(resolveClipMessage(messages, 'chatLocalReplayInvalidDir')),
        discordClipPostConfigured: Boolean(resolveClipMessage(messages, 'discordClipPost'))
      },
      channelInfo: {
        ok: channelInfo.ok,
        source: channelInfo.source,
        title: channelInfo.title,
        game_name: channelInfo.game_name,
        is_live: channelInfo.is_live,
        error: channelInfo.ok ? '' : (channelInfo.error || '')
      }
    });
  });

  app.get('/api/clip/title', async (req, res) => {
    const cfg = loadClipConfig();
    if (!cfg.enabled) {
      return res.status(503).json({ ok: false, error: 'Clip-System ist deaktiviert.' });
    }

    const messages = loadClipMessages(cfg);
    const input = firstString(req.query.input, req.query.rawInput, req.query.commandRawInput, '');
    const channelInfo = await loadChannelInfoFromApi(cfg);
    const result = buildClipTitle(input, cfg, channelInfo);

    res.json({
      ok: true,
      clipTitle: result.clipTitle,
      customTitle: result.customTitle,
      streamTitle: result.streamTitle,
      gameName: result.gameName,
      rawInput: result.rawInput,
      source: channelInfo.source || 'api',
      channelInfoOk: channelInfo.ok,
      channelInfoError: channelInfo.ok ? '' : (channelInfo.error || ''),
      config: publicClipRuntimeConfig(cfg),
      messages: publicMessages(messages),

      // Flache Felder fuer Streamer.bot, damit C# ohne echten JSON-Parser leicht lesen kann.
      twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
      obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
      localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
      localReplayDir: cfg.localReplayDir,
      localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
      chatClipActivatedMessage: resolveClipMessage(messages, 'chatClipActivated'),
      chatClipCreatedMessage: resolveClipMessage(messages, 'chatClipCreated'),
      chatClipFailedMessage: resolveClipMessage(messages, 'chatClipFailed'),
      chatClipCreatedWithoutUrlMessage: resolveClipMessage(messages, 'chatClipCreatedWithoutUrl'),
      chatLocalReplayMissingMessage: resolveClipMessage(messages, 'chatLocalReplayMissing'),
      chatLocalReplayInvalidDirMessage: resolveClipMessage(messages, 'chatLocalReplayInvalidDir')
    });
  });

  app.get('/api/clip/register', async (req, res) => {
    await handleClipRegister(req, res, req.query || {}, 'get');
  });

  app.post('/api/clip/register', async (req, res) => {
    await handleClipRegister(req, res, req.body || {}, 'post');
  });

  app.get('/api/clip/history', (req, res) => {
    try {
      const limit = toInt(req.query.limit, 20, 1, 100);
      const rows = listClipHistory(limit);
      res.json({ ok: true, module: MODULE_NAME, table: CLIP_HISTORY_TABLE, limit, count: rows.length, rows });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  function sendClipSettingsPayload(res) {
    try {
      const cfg = loadClipConfig();
      const rows = listClipSettings(cfg);
      res.json({
        ok: true,
        module: MODULE_NAME,
        table: CLIP_SETTINGS_TABLE,
        settingsAvailable: Boolean(settingsHelper),
        count: rows.length,
        rows,
        config: publicClipRuntimeConfig(cfg)
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  }

  app.get(['/api/clip/admin/settings', '/api/dashboard/clips/settings'], (req, res) => {
    sendClipSettingsPayload(res);
  });

  app.post(['/api/clip/admin/settings', '/api/dashboard/clips/settings'], (req, res) => {
    try {
      if (!settingsHelper || typeof settingsHelper.setSetting !== 'function') {
        return res.status(501).json({ ok: false, error: 'helper_settings_unavailable' });
      }

      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const values = body.settings && typeof body.settings === 'object' ? body.settings : body;
      const updates = {};

      for (const item of DEFAULT_CLIP_SETTINGS_META) {
        if (Object.prototype.hasOwnProperty.call(values, item.key)) {
          updates[item.key] = values[item.key];
        }
      }

      for (const [key, value] of Object.entries(updates)) {
        const meta = DEFAULT_CLIP_SETTINGS_META.find(x => x.key === key) || { valueType: 'string', description: '' };
        settingsHelper.setSetting(CLIP_SETTINGS_TABLE, key, value, { valueType: meta.valueType, description: meta.description });
      }

      const cfg = loadClipConfig();
      res.json({
        ok: true,
        module: MODULE_NAME,
        table: CLIP_SETTINGS_TABLE,
        updated: Object.keys(updates),
        count: Object.keys(updates).length,
        rows: listClipSettings(cfg),
        config: publicClipRuntimeConfig(cfg)
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  function sendClipTextsPayload(res, messages) {
    try {
      if (!textHelper || typeof textHelper.listModuleTextEditor !== 'function') {
        return res.status(501).json({ ok: false, error: 'helper_texts_unavailable' });
      }
      const payload = textHelper.listModuleTextEditor(MODULE_NAME, buildTextDefaults(messages), clipTextOptions());
      res.json({ ok: true, module: MODULE_NAME, texts: payload });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  }

  app.get(['/api/clip/admin/texts', '/api/dashboard/clips/texts'], (req, res) => {
    const cfg = loadClipConfig();
    const messages = loadClipMessages(cfg);
    sendClipTextsPayload(res, messages);
  });

  app.post(['/api/clip/admin/texts', '/api/dashboard/clips/texts'], (req, res) => {
    try {
      if (!textHelper || typeof textHelper.handleModuleTextEditorPayload !== 'function') {
        return res.status(501).json({ ok: false, error: 'helper_texts_editor_unavailable' });
      }
      const cfg = loadClipConfig();
      const messages = loadClipMessages(cfg);
      const result = textHelper.handleModuleTextEditorPayload(MODULE_NAME, req.body || {}, {
        ...clipTextOptions(),
        defaults: buildTextDefaults(messages)
      });
      res.json({ ok: true, module: MODULE_NAME, result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  async function handleClipRegister(req, res, source, method) {
    const cfg = loadClipConfig();
    if (!cfg.enabled) {
      return res.status(503).json({ ok: false, error: 'Clip-System ist deaktiviert.' });
    }

    const messages = loadClipMessages(cfg);
    const clipId = firstString(source.clipId, source.clip_id, source.id, '');
    const clipUrl = firstString(source.clipUrl, source.clip_url, source.url, '');
    const clipTitle = firstString(source.clipTitle, source.clip_title, source.title, '');
    const triggerUser = firstString(source.triggerUser, source.trigger_user, source.user, source.userName, source.username, '');
    const customTitle = firstString(source.customTitle, source.custom_title, '');
    const gameName = firstString(source.gameName, source.game_name, '');
    const streamTitle = firstString(source.streamTitle, source.stream_title, '');
    const status = firstString(source.status, 'created');
    const reason = firstString(source.reason, '');

    if (status !== 'skipped' && !clipId && !clipUrl) {
      return res.status(400).json({
        ok: false,
        error: 'Missing clipId or clipUrl.'
      });
    }

    const received = {
      clipId,
      clipUrl,
      clipTitle,
      customTitle,
      streamTitle,
      gameName,
      triggerUser,
      status,
      reason
    };

    let history = { saved: false, id: null, error: '' };
    if (cfg.saveHistory) {
      history = saveClipHistory(received, method, source);
    }

    const discord = await maybePostClipToDiscord({ cfg, messages, received });

    if (history.saved && discord) {
      markClipDiscordResult(history.id, discord);
    }

    console.log('[clips] register ' + method + ': status=' + status + ' clip=' + (clipId || clipUrl || '-') + ' title=' + (clipTitle || '-') + ' user=' + (triggerUser || '-') + (reason ? ' reason=' + reason : ''));

    res.json({
      ok: true,
      registered: history.saved,
      method,
      message: 'Clip wurde verarbeitet. History/Discord laufen ueber das integrierte Backend.',
      received,
      history,
      discord,
      planned: {
        saveHistory: cfg.saveHistory,
        discordPostEnabled: cfg.discordPostEnabled,
        discordChannelMode: cfg.discordChannelMode,
        discordChannelKey: cfg.discordChannelKey,
        discordChannelId: cfg.discordChannelId
      }
    });
  }

  async function maybePostClipToDiscord({ cfg, messages, received }) {
    if (!cfg.discordPostEnabled) return { attempted: false, posted: false, skipped: true, reason: 'discord_disabled' };
    if (received.status === 'skipped') return { attempted: false, posted: false, skipped: true, reason: 'clip_skipped' };

    const channels = loadDiscordChannels();
    const effectiveChannel = resolveEffectiveDiscordChannel(cfg, channels);
    const channelId = effectiveChannel.channelId;
    if (!channelId) {
      return {
        attempted: false,
        posted: false,
        skipped: true,
        reason: 'discord_channel_not_configured',
        channelMode: effectiveChannel.mode,
        channelKey: effectiveChannel.channelKey,
        channelId: '',
        channelSource: effectiveChannel.source
      };
    }

    if (cfg.postOnlyWhenLive) {
      const liveInfo = await loadChannelInfoFromApi(cfg);
      if (liveInfo.is_live === false) {
        return { attempted: false, posted: false, skipped: true, reason: 'not_live', channelMode: effectiveChannel.mode, channelKey: effectiveChannel.channelKey, channelId, channelSource: effectiveChannel.source };
      }
    }

    const bridge = app.locals.discordBridge;
    if (!bridge || typeof bridge.postToChannel !== 'function') {
      return { attempted: false, posted: false, skipped: true, reason: 'discord_bridge_unavailable', channelMode: effectiveChannel.mode, channelKey: effectiveChannel.channelKey, channelId, channelSource: effectiveChannel.source };
    }

    const content = renderClipMessage(messages, 'discordClipPost', received);
    if (!content) return { attempted: false, posted: false, skipped: true, reason: 'discord_message_empty', channelMode: effectiveChannel.mode, channelKey: effectiveChannel.channelKey, channelId, channelSource: effectiveChannel.source };

    try {
      const result = await bridge.postToChannel({
        channelId,
        content,
        allowedMentions: { parse: [] }
      });
      return { attempted: true, posted: true, skipped: false, channelMode: effectiveChannel.mode, channelKey: effectiveChannel.channelKey, channelId, channelSource: effectiveChannel.source, result };
    } catch (err) {
      return { attempted: true, posted: false, skipped: false, channelMode: effectiveChannel.mode, channelKey: effectiveChannel.channelKey, channelId, channelSource: effectiveChannel.source, error: err.message || String(err) };
    }
  }

  console.log('[clips] /api/clip/status, /api/clip/title, /api/clip/register und /api/clip/history aktiv');
};

function ensureClipSchema() {
  database.ensureReady();
  database.ensureSchema(MODULE_NAME, CLIP_SCHEMA_VERSION, () => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS ${CLIP_HISTORY_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clip_id TEXT NOT NULL DEFAULT '',
        clip_url TEXT NOT NULL DEFAULT '',
        clip_title TEXT NOT NULL DEFAULT '',
        custom_title TEXT NOT NULL DEFAULT '',
        stream_title TEXT NOT NULL DEFAULT '',
        game_name TEXT NOT NULL DEFAULT '',
        trigger_user TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'created',
        reason TEXT NOT NULL DEFAULT '',
        source_method TEXT NOT NULL DEFAULT '',
        discord_posted INTEGER NOT NULL DEFAULT 0,
        discord_error TEXT NOT NULL DEFAULT '',
        raw_payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );
    `);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_history_created_at ON ${CLIP_HISTORY_TABLE} (created_at);`);
    database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_history_clip_id ON ${CLIP_HISTORY_TABLE} (clip_id);`);
  });
}

function getClipDbStatus() {
  try {
    ensureClipSchema();
    return {
      ok: true,
      databasePath: database.getDbPath(),
      table: CLIP_HISTORY_TABLE,
      schemaVersion: database.getSchemaVersion(MODULE_NAME),
      historyCount: database.count(CLIP_HISTORY_TABLE)
    };
  } catch (err) {
    return {
      ok: false,
      databasePath: database.getDbPath ? database.getDbPath() : null,
      table: CLIP_HISTORY_TABLE,
      schemaVersion: null,
      historyCount: 0,
      error: err.message || String(err)
    };
  }
}

function saveClipHistory(received, method, rawPayload) {
  try {
    ensureClipSchema();
    const now = database.nowIso ? database.nowIso() : new Date().toISOString();
    const result = database.run(`
      INSERT INTO ${CLIP_HISTORY_TABLE}
        (clip_id, clip_url, clip_title, custom_title, stream_title, game_name, trigger_user, status, reason, source_method, raw_payload_json, created_at)
      VALUES
        (:clipId, :clipUrl, :clipTitle, :customTitle, :streamTitle, :gameName, :triggerUser, :status, :reason, :sourceMethod, :rawPayloadJson, :createdAt)
    `, {
      clipId: received.clipId || '',
      clipUrl: received.clipUrl || '',
      clipTitle: received.clipTitle || '',
      customTitle: received.customTitle || '',
      streamTitle: received.streamTitle || '',
      gameName: received.gameName || '',
      triggerUser: received.triggerUser || '',
      status: received.status || 'created',
      reason: received.reason || '',
      sourceMethod: method || '',
      rawPayloadJson: safeJson(rawPayload),
      createdAt: now
    });

    return { saved: true, id: Number(result?.lastInsertRowid || result?.lastID || 0), error: '' };
  } catch (err) {
    return { saved: false, id: null, error: err.message || String(err) };
  }
}

function markClipDiscordResult(historyId, discord) {
  const id = Number(historyId || 0);
  if (!id) return;
  try {
    database.run(`
      UPDATE ${CLIP_HISTORY_TABLE}
      SET discord_posted = :posted,
          discord_error = :error
      WHERE id = :id
    `, {
      id,
      posted: discord?.posted ? 1 : 0,
      error: discord?.error || discord?.reason || ''
    });
  } catch (err) {
    console.warn('[clips] Discord-Status konnte nicht in History gespeichert werden:', err.message || String(err));
  }
}

function listClipHistory(limit) {
  ensureClipSchema();
  return database.all(`
    SELECT id, clip_id, clip_url, clip_title, custom_title, stream_title, game_name, trigger_user, status, reason,
           source_method, discord_posted, discord_error, created_at
    FROM ${CLIP_HISTORY_TABLE}
    ORDER BY id DESC
    LIMIT :limit
  `, { limit }).map(row => ({
    id: row.id,
    clipId: row.clip_id || '',
    clipUrl: row.clip_url || '',
    clipTitle: row.clip_title || '',
    customTitle: row.custom_title || '',
    streamTitle: row.stream_title || '',
    gameName: row.game_name || '',
    triggerUser: row.trigger_user || '',
    status: row.status || '',
    reason: row.reason || '',
    sourceMethod: row.source_method || '',
    discordPosted: Number(row.discord_posted || 0) === 1,
    discordError: row.discord_error || '',
    createdAt: row.created_at || ''
  }));
}

function resolveRootDir(ctx, env) {
  const candidates = [
    ctx?.paths?.rootDir,
    env?.ROOT_DIR,
    env?.STRAMASSETS_ROOT,
    path.resolve(__dirname, '..', '..')
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      const full = path.resolve(String(c));
      if (fs.existsSync(full)) return full;
    } catch (_) {}
  }

  return path.resolve(__dirname, '..', '..');
}

function resolveMaybeAbsolute(rootDir, value) {
  const v = String(value || '').trim();
  if (!v) return '';
  return path.isAbsolute(v) ? v : path.join(rootDir, v);
}

function readJsonSafe(filePath, fallback) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[clips] JSON konnte nicht gelesen werden: ${filePath} – ${err.message}`);
    return fallback;
  }
}

function firstString(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return '';
}

function toInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
}

function extractCustomTitle(rawInput) {
  let input = String(rawInput || '').trim();
  if (!input) return '';
  if (/^!clip$/i.test(input)) return '';
  if (/^!clip\s+/i.test(input)) return input.replace(/^!clip\s+/i, '').trim();
  return input;
}

function sanitizeOneLine(value) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function messageContent(messages, key) {
  const entry = messages?.[key];
  if (!entry || entry.enabled === false) return '';
  return String(entry.content || '').trim();
}

function buildTextDefaults(messages) {
  const defaults = {};
  const knownKeys = new Set([...Object.keys(DEFAULT_CLIP_TEXTS), ...Object.keys(messages || {}).filter(key => !String(key).startsWith('_'))]);

  for (const key of knownKeys) {
    const values = [];
    const configured = messageContent(messages, key);
    if (configured) values.push(configured);

    const base = DEFAULT_CLIP_TEXTS[key];
    if (Array.isArray(base)) {
      for (const item of base) {
        const text = String(item || '').trim();
        if (text && !values.includes(text)) values.push(text);
      }
    } else if (typeof base === 'string' && base.trim() && !values.includes(base.trim())) {
      values.push(base.trim());
    }

    if (values.length === 1) defaults[key] = values[0];
    else if (values.length > 1) defaults[key] = values;
  }

  return defaults;
}

function clipTextOptions() {
  return {
    defaultCategory: 'system',
    categories: CLIP_TEXT_CATEGORIES,
    categoryLabels: CLIP_TEXT_CATEGORY_LABELS,
    source: 'seed'
  };
}

function migrateLegacyClipTextCategories() {
  if (!textHelper) return;
  try {
    database.ensureReady();
    for (const [textKey, category] of Object.entries(CLIP_TEXT_CATEGORIES)) {
      database.run(`
        UPDATE module_text_variants
        SET category = :category,
            updated_at = :updatedAt
        WHERE module_name = :moduleName
          AND text_key = :textKey
          AND category = 'clip'
      `, {
        moduleName: MODULE_NAME,
        textKey,
        category,
        updatedAt: database.nowIso ? database.nowIso() : new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('[clips] Legacy-Textkategorien konnten nicht bereinigt werden:', err.message || String(err));
  }
}

function seedClipTexts(messages) {
  if (!textHelper || typeof textHelper.listModuleTextEditor !== 'function') return;
  try {
    textHelper.listModuleTextEditor(MODULE_NAME, buildTextDefaults(messages), clipTextOptions());
    migrateLegacyClipTextCategories();
  } catch (err) {
    console.warn('[clips] Text-Seed konnte nicht vorbereitet werden:', err.message || String(err));
  }
}

function resolveClipMessage(messages, key) {
  const fallback = messageContent(messages, key) || firstDefaultText(DEFAULT_CLIP_TEXTS[key]);
  if (!textHelper || typeof textHelper.pickModuleText !== 'function') return fallback;

  try {
    return String(textHelper.pickModuleText(MODULE_NAME, key, buildTextDefaults(messages), clipTextOptions()) || fallback || '').trim();
  } catch (_) {
    return fallback;
  }
}

function firstDefaultText(value) {
  if (Array.isArray(value)) return String(value.find(item => String(item || '').trim()) || '').trim();
  return String(value || '').trim();
}

function renderClipMessage(messages, key, context) {
  const template = resolveClipMessage(messages, key);
  return messageHelper.replacePlaceholders(template, {
    clipId: context.clipId || '',
    clipUrl: context.clipUrl || '',
    editUrl: context.editUrl || '',
    clipTitle: context.clipTitle || '',
    customTitle: context.customTitle || '',
    streamTitle: context.streamTitle || '',
    gameName: context.gameName || '',
    triggerUser: context.triggerUser || '',
    localReplayFile: context.localReplayFile || '',
    localReplayPath: context.localReplayPath || '',
    createdAt: context.createdAt || '',
    status: context.status || '',
    reason: context.reason || '',
    clipsDir: context.clipsDir || ''
  });
}

function buildClipConfigFromRaw(raw, env) {
  const cfg = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const postSeconds = toInt(cfg.obsReplayPostTriggerSeconds, 30, 0, 300);

  return {
    enabled: cfg.enabled !== false,
    backendCreateEnabled: cfg.backendCreateEnabled !== false,
    defaultClipTitle: String(cfg.defaultClipTitle || 'Clip').trim() || 'Clip',
    includeGameInCustomTitle: cfg.includeGameInCustomTitle !== false,
    twitchClipDurationSeconds: toInt(cfg.twitchClipDurationSeconds, 30, 1, 120),
    twitchClipPollMs: toInt(cfg.twitchClipPollMs, 2000, 500, 10000),
    twitchClipPollMaxAttempts: toInt(cfg.twitchClipPollMaxAttempts, 8, 1, 30),
    obsReplaySaveEnabled: cfg.obsReplaySaveEnabled !== false,
    obsReplayWindowSeconds: toInt(cfg.obsReplayWindowSeconds, 60, 1, 600),
    obsReplayPreTriggerSeconds: toInt(cfg.obsReplayPreTriggerSeconds, 30, 0, 300),
    obsReplayPostTriggerSeconds: postSeconds,
    obsReplaySaveDelayMs: toInt(cfg.obsReplaySaveDelayMs, postSeconds * 1000, 0, 300000),
    localReplayRenameEnabled: cfg.localReplayRenameEnabled !== false,
    localReplayRenameDelayMs: toInt(cfg.localReplayRenameDelayMs, 3000, 0, 60000),
    localReplayDir: String(cfg.localReplayDir || '').trim(),
    localReplayLookbackMinutes: toInt(cfg.localReplayLookbackMinutes, 5, 1, 60),
    sendClipActivatedMessage: cfg.sendClipActivatedMessage !== false,
    sendTwitchClipResultMessage: cfg.sendTwitchClipResultMessage !== false,
    sendChatResponse: cfg.sendChatResponse !== false,
    discordPostEnabled: cfg.discordPostEnabled === true,
    discordChannelMode: normalizeDiscordChannelMode(cfg.discordChannelMode || 'key'),
    discordChannelKey: String(cfg.discordChannelKey || 'clips').trim() || 'clips',
    discordChannelId: normalizeDiscordChannelId(cfg.discordChannelId || ''),
    postOnlyWhenLive: cfg.postOnlyWhenLive === true,
    saveHistory: cfg.saveHistory !== false,
    duplicatePolicy: normalizeDuplicatePolicy(cfg.duplicatePolicy || 'ignore'),
    messagesPath: String(cfg.messagesPath || 'messages/clips.json').trim() || 'messages/clips.json',
    broadcasterId: String(env?.TWITCH_BROADCASTER_ID || process.env.TWITCH_BROADCASTER_ID || '').trim(),
    channelSummaryUrl: `http://127.0.0.1:${String(env?.PORT || process.env.PORT || 8080).trim()}/api/twitch/channel/summary`
  };
}

function buildClipSettingsSeed(base) {
  return DEFAULT_CLIP_SETTINGS_META.map(item => ({
    key: item.key,
    value: base[item.key],
    valueType: item.valueType,
    description: item.description
  }));
}

function seedClipSettings(defaults) {
  if (!settingsHelper || typeof settingsHelper.seedDefaults !== 'function') return;
  try {
    settingsHelper.seedDefaults(CLIP_SETTINGS_TABLE, defaults);
  } catch (err) {
    console.warn('[clips] Settings-Seed konnte nicht vorbereitet werden:', err.message || String(err));
  }
}

function readClipSetting(key, fallback, valueType, description) {
  if (!settingsHelper || typeof settingsHelper.getSetting !== 'function') {
    return { key, value: fallback, source: 'config', found: false };
  }

  try {
    return settingsHelper.getSetting(CLIP_SETTINGS_TABLE, key, fallback, { valueType, description });
  } catch (err) {
    return { key, value: fallback, source: 'fallback', found: false, error: err.message || String(err) };
  }
}

function listClipSettings(cfg) {
  if (!settingsHelper || typeof settingsHelper.listSettings !== 'function') {
    return DEFAULT_CLIP_SETTINGS_META.map(item => ({
      key: item.key,
      value: cfg[item.key],
      valueType: item.valueType,
      description: item.description,
      source: 'config'
    }));
  }

  try {
    seedClipSettings(buildClipSettingsSeed(cfg));
    return settingsHelper.listSettings(CLIP_SETTINGS_TABLE).rows || [];
  } catch (err) {
    return DEFAULT_CLIP_SETTINGS_META.map(item => ({
      key: item.key,
      value: cfg[item.key],
      valueType: item.valueType,
      description: item.description,
      source: 'fallback',
      error: err.message || String(err)
    }));
  }
}

function normalizeDiscordChannelMode(value) {
  const mode = String(value || 'key').trim().toLowerCase();
  return mode === 'custom' ? 'custom' : 'key';
}

function normalizeDiscordChannelId(value) {
  return String(value || '').trim().replace(/[^0-9]/g, '');
}

function normalizeDuplicatePolicy(value) {
  const policy = String(value || 'ignore').trim().toLowerCase();
  if (policy === 'allow' || policy === 'update' || policy === 'ignore') return policy;
  return 'ignore';
}

function appendQuery(baseUrl, params) {
  const urlObj = new URL(baseUrl);

  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      urlObj.searchParams.set(key, String(value).trim());
    }
  }

  return urlObj.toString();
}

function httpJsonGet(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const req = lib.request(urlObj, {
      method: 'GET',
      timeout: timeoutMs || 3500,
      headers: { Accept: 'application/json' }
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 300)}`));
        }

        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch (err) {
          reject(new Error(`JSON parse error: ${err.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Timeout after ${timeoutMs || 3500}ms`));
    });

    req.on('error', reject);
    req.end();
  });
}

function safeJson(value) {
  try {
    return JSON.stringify(value || {});
  } catch (_) {
    return '{}';
  }
}
