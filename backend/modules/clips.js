// modules/clips.js
// STEP195 — Clip Backend-Create: Twitch Create Clip sendet title/duration direkt mit.
// - vorhandene /api/clip/status, /api/clip/title und /api/clip/register bleiben erhalten
// - Clip-Historie wird sanft in app.sqlite gespeichert
// - Discord-Posting nutzt die vorhandene Discord-Bridge
// - Clip-Texte koennen ueber den zentralen helper_texts als module_text_variants vorbereitet werden
// - Twitch-/OBS-/Discord-Readiness wird fuer den spaeteren Backend-Create-Flow sichtbar gemacht
// - Clip-Settings werden ueber helper_settings in clip_settings vorbereitet
// - Clip-Texte werden ueber helper_texts in module_text_variants kategorisiert und variantenfaehig vorbereitet
// - Discord-Zielkanal kann per Key oder direkter Channel-ID aus DB-Settings kommen
// - alte Clip-Textkategorie "clip" wird sanft auf chat/discord/errors/system migriert
// - lokale OBS-Replay-Dateien werden nach SaveReplayBuffer gesucht, freigeprueft und umbenannt

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const database = require('../core/database');
const twitch = require('./twitch');
const twitchPresence = require('./twitch_presence');
const { getSharedObs } = require('./obs_shared');
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
const CLIP_SCHEMA_VERSION = 3;
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
  systemObsReplayNotReady: 'system',
  systemStreamNotLive: 'system'
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
  ],
  systemStreamNotLive: [
    'Clips koennen nur erstellt werden, wenn der Stream live ist.',
    'Der Stream ist gerade nicht live. Clip-Erstellung wurde uebersprungen.'
  ]
};

module.exports.init = function init(ctx) {
  const { app, env } = ctx;
  const sharedObs = getSharedObs(env, console);

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

  app.get('/api/clip/create', async (req, res) => {
    await handleClipCreate(req, res, req.query || {}, 'get');
  });

  app.post('/api/clip/create', async (req, res) => {
    await handleClipCreate(req, res, req.body || {}, 'post');
  });

  app.get('/api/clip/job/:jobId', (req, res) => {
    try {
      const jobId = String(req.params.jobId || '').trim();
      if (!jobId) return res.status(400).json({ ok: false, error: 'job_id_required' });
      const row = getClipHistoryByJobId(jobId);
      if (!row) return res.status(404).json({ ok: false, error: 'job_not_found', jobId });
      return res.json({ ok: true, module: MODULE_NAME, jobId, row });
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


  async function sendClipChatMessage(cfg, message, meta = {}) {
    if (!cfg || !cfg.sendChatResponse) {
      return { ok: false, skipped: true, reason: 'chat_response_disabled' };
    }

    const text = String(message || '').trim();
    if (!text) {
      return { ok: false, skipped: true, reason: 'empty_message' };
    }

    if (!twitchPresence || typeof twitchPresence.sendChatMessage !== 'function') {
      return { ok: false, skipped: true, reason: 'twitch_presence_helper_unavailable' };
    }

    try {
      return await twitchPresence.sendChatMessage(text, {
        trigger: 'clip-system',
        module: MODULE_NAME,
        ...meta
      });
    } catch (err) {
      return { ok: false, error: err.message || String(err), trigger: meta.trigger || 'clip-system' };
    }
  }

  async function sendAndBuildChatMeta(cfg, message, meta = {}) {
    const result = await sendClipChatMessage(cfg, message, meta);
    return {
      sendChat: Boolean(cfg?.sendChatResponse),
      chatMessage: String(message || ''),
      chatSent: Boolean(result?.ok),
      chatResult: result
    };
  }

  async function handleClipCreate(req, res, source, method) {
    const cfg = loadClipConfig();
    const messages = loadClipMessages(cfg);
    const channels = loadDiscordChannels();
    const input = firstString(source.input, source.rawInput, source.commandRawInput, source.text, '');
    const triggerUser = firstString(source.triggerUser, source.trigger_user, source.user, source.displayName, source.userName, source.username, '');
    const triggerLogin = firstString(source.triggerLogin, source.trigger_login, source.login, source.userLogin, '');
    const channelInfo = await loadChannelInfoFromApi(cfg);
    const title = buildClipTitle(input, cfg, channelInfo);
    const baseContext = {
      ...title,
      triggerUser,
      triggerLogin,
      status: 'starting',
      reason: ''
    };
    const startMessage = cfg.sendClipActivatedMessage ? renderClipMessage(messages, 'chatClipActivated', baseContext) : '';

    if (!cfg.enabled) {
      const chatMessage = renderClipMessage(messages, 'systemDisabled', baseContext) || startMessage;
      const chatMeta = await sendAndBuildChatMeta(cfg, chatMessage, { trigger: 'clip-disabled' });
      return res.status(503).json({
        ok: false,
        accepted: false,
        error: 'clip_system_disabled',
        ...chatMeta
      });
    }

    if (!cfg.backendCreateEnabled) {
      const chatMessage = renderClipMessage(messages, 'systemBackendNotReady', baseContext) || startMessage;
      const chatMeta = await sendAndBuildChatMeta(cfg, chatMessage, { trigger: 'clip-backend-disabled' });
      return res.status(409).json({
        ok: false,
        accepted: false,
        error: 'backend_create_disabled',
        ...chatMeta
      });
    }

    // STEP193.1:
    // Der Vorab-Live-Guard wurde bewusst entfernt.
    // Grund: Twitch Helix /streams meldete im Live-Test data: [], obwohl der Kanal live war.
    // /api/clip/create blockiert deshalb nicht mehr anhand von channelInfo.is_live === false.
    // Wenn der Kanal wirklich offline ist, entscheidet Twitch Create Clip selbst und der Flow schreibt failed statt skipped.

    const twitchApi = await loadTwitchAuthReadiness(cfg);
    const obsReplay = await loadObsReplayReadiness(cfg);
    const discord = buildDiscordReadiness(cfg, channels);
    const backendCreate = buildBackendCreateReadiness(cfg, twitchApi, obsReplay, discord);

    if (!backendCreate.ready) {
      const reason = backendCreate.blockers.join(',') || 'backend_not_ready';
      const key = backendCreate.blockers.includes('missing_scope_clips_edit') ? 'systemTwitchScopeMissing'
        : backendCreate.blockers.some(x => String(x).includes('obs')) ? 'systemObsReplayNotReady'
          : 'systemBackendNotReady';
      const chatMessage = renderClipMessage(messages, key, { ...baseContext, reason }) || startMessage;
      const chatMeta = await sendAndBuildChatMeta(cfg, chatMessage, { trigger: 'clip-backend-not-ready', reason });
      return res.status(409).json({
        ok: false,
        accepted: false,
        error: 'backend_not_ready',
        reason,
        backendCreate,
        ...chatMeta
      });
    }

    let created;
    try {
      if (!twitch || typeof twitch.createClipForBroadcaster !== 'function') throw new Error('twitch_create_helper_unavailable');
      created = await twitch.createClipForBroadcaster(cfg.broadcasterId, {
        hasDelay: false,
        title: title.clipTitle,
        duration: cfg.twitchClipDurationSeconds
      }); // STEP195_TWITCH_CREATE_TITLE_DURATION
    } catch (err) {
      const reason = err.message || String(err);
      const failed = {
        clipId: '',
        clipUrl: '',
        clipTitle: title.clipTitle,
        customTitle: title.customTitle,
        streamTitle: title.streamTitle,
        gameName: title.gameName,
        triggerUser,
        status: 'failed',
        reason
      };
      const history = cfg.saveHistory ? saveClipHistory(failed, 'backend_create_failed', { ...source, error: reason }) : { saved: false, id: null, error: '' };
      const chatMessage = renderClipMessage(messages, 'chatClipFailed', failed);
      const chatMeta = await sendAndBuildChatMeta(cfg, chatMessage, { trigger: 'clip-twitch-create-failed', reason });
      return res.status(502).json({
        ok: false,
        accepted: false,
        error: 'twitch_create_failed',
        reason,
        history,
        ...chatMeta
      });
    }

    const clipId = String(created.clipId || created.clip?.id || '').trim();
    const editUrl = String(created.editUrl || created.clip?.edit_url || '').trim();
    const fallbackClipUrl = clipId ? `https://clips.twitch.tv/${clipId}` : '';
    const jobId = makeJobId();
    const now = nowIso();
    const received = {
      jobId,
      clipId,
      clipUrl: fallbackClipUrl,
      editUrl,
      clipTitle: title.clipTitle,
      customTitle: title.customTitle,
      streamTitle: title.streamTitle,
      gameName: title.gameName,
      triggerUser,
      triggerLogin,
      status: 'twitch_created',
      reason: '',
      createdAt: now
    };

    let history = { saved: false, id: null, error: '' };
    if (cfg.saveHistory) {
      history = saveClipHistory(received, 'backend_create', { ...source, twitch: created, jobId });
      if (history.saved) {
        updateClipHistoryExtra(history.id, {
          job_id: jobId,
          twitch_edit_url: editUrl,
          twitch_status: 'created',
          updated_at: now
        });
      }
    }

    runBackendClipJob({
      cfg,
      messages,
      historyId: history.id,
      jobId,
      title,
      triggerUser,
      triggerLogin,
      clipId,
      editUrl,
      fallbackClipUrl,
      sourceMethod: method
    }).catch(err => {
      console.warn('[clips] Backend-Clip-Job fehlgeschlagen:', err.message || String(err));
      if (history.saved) updateClipHistoryExtra(history.id, { status: 'partial', reason: err.message || String(err), updated_at: nowIso() });
    });

    const chatMeta = await sendAndBuildChatMeta(cfg, startMessage, { trigger: 'clip-started', jobId, clipId });

    return res.json({
      ok: true,
      accepted: true,
      module: MODULE_NAME,
      method,
      jobId,
      history,
      twitch: {
        clipId,
        editUrl,
        clipUrl: fallbackClipUrl,
        raw: created.raw || null
      },
      title,
      timing: {
        twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
        obsReplayWindowSeconds: cfg.obsReplayWindowSeconds,
        obsReplayPreTriggerSeconds: cfg.obsReplayPreTriggerSeconds,
        obsReplayPostTriggerSeconds: cfg.obsReplayPostTriggerSeconds,
        obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
        localReplayRenameDelayMs: cfg.localReplayRenameDelayMs
      },
      ...chatMeta,
      next: {
        pollTwitchClip: true,
        postDiscord: cfg.discordPostEnabled,
        obsReplaySaveScheduled: cfg.obsReplaySaveEnabled,
        localReplayRenameScheduled: cfg.localReplayRenameEnabled
      }
    });
  }

  async function runBackendClipJob(job) {
    const obsPromise = scheduleObsReplaySave(job);
    const poll = await pollTwitchClip(job.clipId, job.cfg);
    const clip = poll.clip || null;
    const clipUrl = firstString(clip?.url, job.fallbackClipUrl);
    const status = poll.found ? 'created' : 'partial';
    const reason = poll.found ? '' : 'twitch_clip_not_available_after_polling';
    const received = {
      jobId: job.jobId,
      clipId: job.clipId,
      clipUrl,
      editUrl: job.editUrl,
      clipTitle: job.title.clipTitle,
      customTitle: job.title.customTitle,
      streamTitle: job.title.streamTitle,
      gameName: job.title.gameName,
      triggerUser: job.triggerUser,
      triggerLogin: job.triggerLogin,
      status,
      reason,
      createdAt: nowIso()
    };

    if (job.historyId) {
      updateClipHistoryExtra(job.historyId, {
        clip_url: clipUrl,
        status,
        reason,
        twitch_status: poll.found ? 'available' : 'pending',
        updated_at: nowIso()
      });
    }

    const obs = await obsPromise;
    if (obs?.localReplaySaved) {
      received.localReplayPath = obs.localReplayPath || '';
      received.localReplayFile = obs.localReplayFile || '';
    }

    if (job.historyId && obs) {
      updateClipHistoryExtra(job.historyId, {
        obs_replay_requested: obs.requested ? 1 : 0,
        obs_replay_saved: obs.saved ? 1 : 0,
        obs_replay_error: obs.error || obs.reason || '',
        obs_replay_requested_at: obs.requestedAt || '',
        local_replay_saved: obs.localReplaySaved ? 1 : 0,
        local_replay_path: obs.localReplayPath || '',
        local_replay_file: obs.localReplayFile || '',
        local_replay_error: obs.localReplayError || '',
        local_replay_renamed_at: obs.localReplayRenamedAt || '',
        updated_at: nowIso()
      });
    }

    const discord = await maybePostClipToDiscord({ cfg: job.cfg, messages: job.messages, received });
    if (job.historyId && discord) markClipDiscordResult(job.historyId, discord);

    let chat = { ok: false, skipped: true, reason: 'result_message_disabled' };
    if (job.cfg.sendTwitchClipResultMessage) {
      const messageKey = status === 'created' ? 'chatClipCreated' : 'chatClipCreatedWithoutUrl';
      const resultMessage = renderClipMessage(job.messages, messageKey, received);
      chat = await sendClipChatMessage(job.cfg, resultMessage, {
        trigger: 'clip-result',
        jobId: job.jobId,
        clipId: job.clipId,
        status
      });
    }

    return { ok: true, jobId: job.jobId, poll, obs, discord, chat };
  }

  async function pollTwitchClip(clipId, cfg) {
    const id = String(clipId || '').trim();
    if (!id) return { found: false, clip: null, attempts: 0, error: 'clip_id_missing' };
    const maxAttempts = toInt(cfg.twitchClipPollMaxAttempts, 8, 1, 30);
    const waitMs = toInt(cfg.twitchClipPollMs, 2000, 500, 10000);
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (attempt > 1) await sleep(waitMs);
      try {
        if (!twitch || typeof twitch.getClipById !== 'function') throw new Error('twitch_get_clip_helper_unavailable');
        const result = await twitch.getClipById(id);
        if (result?.ok && result.clip) return { found: true, clip: result.clip, attempts: attempt, error: '' };
      } catch (err) {
        lastError = err.message || String(err);
      }
    }

    return { found: false, clip: null, attempts: maxAttempts, error: lastError };
  }

  async function scheduleObsReplaySave(job) {
    const base = {
      requested: false,
      saved: false,
      skipped: false,
      requestedAt: '',
      error: '',
      localReplaySaved: false,
      localReplayPath: '',
      localReplayFile: '',
      localReplayError: '',
      localReplayRenamedAt: ''
    };

    if (!job.cfg.obsReplaySaveEnabled) return { ...base, skipped: true, reason: 'obs_replay_disabled' };

    const delayMs = toInt(job.cfg.obsReplaySaveDelayMs, 30000, 0, 300000);
    await sleep(delayMs);
    const requestedAt = nowIso();

    try {
      if (!sharedObs || typeof sharedObs.saveReplayBuffer !== 'function') throw new Error('obs_shared_save_unavailable');
      await sharedObs.saveReplayBuffer();
      const result = { ...base, requested: true, saved: true, requestedAt, error: '' };
      const local = await handleLocalReplayFile(job, requestedAt);
      return { ...result, ...local };
    } catch (err) {
      return { ...base, requested: true, saved: false, requestedAt, error: err.message || String(err) };
    }
  }

  async function handleLocalReplayFile(job, requestedAt = '') {
    const out = {
      localReplaySaved: false,
      localReplayPath: '',
      localReplayFile: '',
      localReplayError: '',
      localReplayRenamedAt: ''
    };

    if (!job.cfg.localReplayRenameEnabled) return { ...out, localReplayError: 'local_replay_rename_disabled' };

    const clipsDir = String(job.cfg.localReplayDir || '').trim();
    if (!clipsDir || !fs.existsSync(clipsDir)) {
      return { ...out, localReplayError: 'local_replay_dir_invalid' };
    }

    const renameDelayMs = toInt(job.cfg.localReplayRenameDelayMs, 3000, 0, 60000);
    if (renameDelayMs > 0) await sleep(renameDelayMs);

    const candidate = await findNewestReadyReplayFile(clipsDir, job.cfg.localReplayLookbackMinutes, {
      requestedAt,
      maxWaitMs: 20000,
      pollEveryMs: 500
    });

    if (!candidate) {
      return { ...out, localReplayError: 'local_replay_file_missing_or_locked' };
    }

    try {
      const targetPath = buildLocalReplayTargetPath(clipsDir, candidate.fullPath, job);
      fs.renameSync(candidate.fullPath, targetPath);
      return {
        localReplaySaved: true,
        localReplayPath: targetPath,
        localReplayFile: path.basename(targetPath),
        localReplayError: '',
        localReplayRenamedAt: nowIso()
      };
    } catch (err) {
      return { ...out, localReplayError: err.message || String(err) };
    }
  }

  async function findNewestReadyReplayFile(dir, lookbackMinutes, options = {}) {
    const maxWaitMs = toInt(options.maxWaitMs, 20000, 0, 60000);
    const pollEveryMs = toInt(options.pollEveryMs, 500, 100, 5000);
    const started = Date.now();
    let lastCandidates = [];

    while ((Date.now() - started) <= maxWaitMs) {
      const candidates = listRecentReplayCandidates(dir, lookbackMinutes, options.requestedAt);
      lastCandidates = candidates;

      for (const candidate of candidates) {
        if (isFileReady(candidate.fullPath)) return candidate;
      }

      await sleep(pollEveryMs);
    }

    const candidates = lastCandidates.length ? lastCandidates : listRecentReplayCandidates(dir, lookbackMinutes, options.requestedAt);
    for (const candidate of candidates) {
      if (isFileReady(candidate.fullPath)) return candidate;
    }

    return null;
  }

  function listRecentReplayCandidates(dir, lookbackMinutes, requestedAt = '') {
    const maxAgeMs = Math.max(1, toInt(lookbackMinutes, 5, 1, 60)) * 60 * 1000;
    const now = Date.now();
    const minMtimeMs = requestedAt ? Math.max(0, new Date(requestedAt).getTime() - 15000) : 0;
    const allowedExt = new Set(['.mp4', '.mkv', '.mov', '.flv', '.ts', '.m4v', '.webm']);
    const candidates = [];

    try {
      const names = fs.readdirSync(dir);

      for (const name of names) {
        const fullPath = path.join(dir, name);
        const ext = path.extname(name).toLowerCase();

        // STEP193.3:
        // OBS ReplayBuffer-Dateien heißen bei Forrest z. B.:
        // "Replay 2026-05-06 19-02-19.mp4"
        // Normale laufende Aufnahmen heißen z. B.:
        // "2026-05-06 18-14-05.mp4"
        // Deshalb dürfen hier nur Replay-Dateien berücksichtigt werden.
        if (!/^Replay\s+/i.test(name)) continue;

        if (!allowedExt.has(ext)) continue;
        if (/^Clip-\d{4}-\d{2}-\d{2}_/i.test(name)) continue;

        let stat;
        try { stat = fs.statSync(fullPath); } catch (_) { continue; }

        if (!stat.isFile()) continue;
        if (stat.size <= 0) continue;
        if ((now - stat.mtimeMs) > maxAgeMs) continue;

        // Die Replay-Datei muss zeitlich zum aktuellen SaveReplayBuffer-Vorgang passen.
        // Damit werden alte Replay-Dateien nicht versehentlich genommen.
        if (minMtimeMs && stat.mtimeMs < minMtimeMs) continue;

        candidates.push({
          fullPath,
          name,
          mtimeMs: stat.mtimeMs,
          birthtimeMs: stat.birthtimeMs || 0,
          size: stat.size
        });
      }
    } catch (_) {
      return [];
    }

    candidates.sort((a, b) => {
      if (b.mtimeMs !== a.mtimeMs) return b.mtimeMs - a.mtimeMs;
      if (b.birthtimeMs !== a.birthtimeMs) return b.birthtimeMs - a.birthtimeMs;
      return b.size - a.size;
    });

    return candidates;
  }

  async function waitForFileReady(filePath, maxWaitMs = 5000, pollEveryMs = 200) {
    const started = Date.now();
    while ((Date.now() - started) <= maxWaitMs) {
      if (isFileReady(filePath)) return true;
      await sleep(pollEveryMs);
    }
    return isFileReady(filePath);
  }

  function isFileReady(filePath) {
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile() || stat.size <= 0) return false;
      const fd = fs.openSync(filePath, 'r+');
      fs.closeSync(fd);
      return true;
    } catch (_) {
      return false;
    }
  }

  function buildLocalReplayTargetPath(clipsDir, sourcePath, job) {
    const ext = path.extname(sourcePath) || '.mp4';
    const stamp = formatLocalTimestamp(new Date());
    const userPart = sanitizeFileName(job.triggerUser || job.triggerLogin || 'unknown');
    const titlePart = sanitizeFileName(job.title?.customTitle || job.title?.clipTitle || 'Clip');
    const parts = ['Clip', stamp];
    if (userPart) parts.push(userPart);
    if (titlePart) parts.push(titlePart);
    const base = parts.join('-');
    let target = path.join(clipsDir, base + ext);
    let index = 1;
    while (fs.existsSync(target)) {
      target = path.join(clipsDir, `${base}_${index}${ext}`);
      index += 1;
    }
    return target;
  }

  function formatLocalTimestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  }

  function sanitizeFileName(input) {
    return String(input || '')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\s]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

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

  console.log('[clips] /api/clip/status, /api/clip/title, /api/clip/register, /api/clip/history und /api/clip/create aktiv');
};

function ensureClipSchema() {
  database.ensureReady();

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

  safeAddClipHistoryColumn('job_id', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('twitch_edit_url', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('twitch_status', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('obs_replay_requested', 'INTEGER NOT NULL DEFAULT 0');
  safeAddClipHistoryColumn('obs_replay_saved', 'INTEGER NOT NULL DEFAULT 0');
  safeAddClipHistoryColumn('obs_replay_error', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('obs_replay_requested_at', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('local_replay_saved', 'INTEGER NOT NULL DEFAULT 0');
  safeAddClipHistoryColumn('local_replay_path', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('local_replay_file', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('local_replay_error', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('local_replay_renamed_at', "TEXT NOT NULL DEFAULT ''");
  safeAddClipHistoryColumn('updated_at', "TEXT NOT NULL DEFAULT ''");

  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_history_created_at ON ${CLIP_HISTORY_TABLE} (created_at);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_history_clip_id ON ${CLIP_HISTORY_TABLE} (clip_id);`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_clip_history_job_id ON ${CLIP_HISTORY_TABLE} (job_id);`);

  try {
    database.setSchemaVersion(MODULE_NAME, CLIP_SCHEMA_VERSION);
  } catch (err) {
    console.warn('[clips] Schema-Version konnte nicht gesetzt werden:', err.message || String(err));
  }
}

function safeAddClipHistoryColumn(columnName, definition) {
  try {
    database.exec(`ALTER TABLE ${CLIP_HISTORY_TABLE} ADD COLUMN ${columnName} ${definition};`);
  } catch (err) {
    const msg = String(err?.message || err || '').toLowerCase();
    if (!msg.includes('duplicate column')) {
      console.warn(`[clips] Spalte ${columnName} konnte nicht angelegt werden:`, err.message || String(err));
    }
  }
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
           source_method, discord_posted, discord_error, job_id, twitch_edit_url, twitch_status,
           obs_replay_requested, obs_replay_saved, obs_replay_error, obs_replay_requested_at, local_replay_saved, local_replay_path, local_replay_file, local_replay_error, local_replay_renamed_at, updated_at, created_at
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
    jobId: row.job_id || '',
    twitchEditUrl: row.twitch_edit_url || '',
    twitchStatus: row.twitch_status || '',
    obsReplayRequested: Number(row.obs_replay_requested || 0) === 1,
    obsReplaySaved: Number(row.obs_replay_saved || 0) === 1,
    obsReplayError: row.obs_replay_error || '',
    obsReplayRequestedAt: row.obs_replay_requested_at || '',
    localReplaySaved: Number(row.local_replay_saved || 0) === 1,
    localReplayPath: row.local_replay_path || '',
    localReplayFile: row.local_replay_file || '',
    localReplayError: row.local_replay_error || '',
    localReplayRenamedAt: row.local_replay_renamed_at || '',
    updatedAt: row.updated_at || '',
    createdAt: row.created_at || ''
  }));
}

function getClipHistoryByJobId(jobId) {
  ensureClipSchema();
  const row = database.get(`
    SELECT id, clip_id, clip_url, clip_title, custom_title, stream_title, game_name, trigger_user, status, reason,
           source_method, discord_posted, discord_error, job_id, twitch_edit_url, twitch_status,
           obs_replay_requested, obs_replay_saved, obs_replay_error, obs_replay_requested_at, local_replay_saved, local_replay_path, local_replay_file, local_replay_error, local_replay_renamed_at, updated_at, created_at
    FROM ${CLIP_HISTORY_TABLE}
    WHERE job_id = :jobId
    LIMIT 1
  `, { jobId: String(jobId || '').trim() });
  if (!row) return null;
  return {
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
    jobId: row.job_id || '',
    twitchEditUrl: row.twitch_edit_url || '',
    twitchStatus: row.twitch_status || '',
    obsReplayRequested: Number(row.obs_replay_requested || 0) === 1,
    obsReplaySaved: Number(row.obs_replay_saved || 0) === 1,
    obsReplayError: row.obs_replay_error || '',
    obsReplayRequestedAt: row.obs_replay_requested_at || '',
    localReplaySaved: Number(row.local_replay_saved || 0) === 1,
    localReplayPath: row.local_replay_path || '',
    localReplayFile: row.local_replay_file || '',
    localReplayError: row.local_replay_error || '',
    localReplayRenamedAt: row.local_replay_renamed_at || '',
    updatedAt: row.updated_at || '',
    createdAt: row.created_at || ''
  };
}

function updateClipHistoryExtra(historyId, patch = {}) {
  const id = Number(historyId || 0);
  if (!id || !patch || typeof patch !== 'object') return false;
  const allowed = new Set([
    'clip_url', 'status', 'reason', 'job_id', 'twitch_edit_url', 'twitch_status',
    'obs_replay_requested', 'obs_replay_saved', 'obs_replay_error', 'obs_replay_requested_at',
    'local_replay_saved', 'local_replay_path', 'local_replay_file', 'local_replay_error', 'local_replay_renamed_at', 'updated_at'
  ]);
  const entries = Object.entries(patch).filter(([key]) => allowed.has(key));
  if (!entries.length) return false;
  const setSql = entries.map(([key]) => `${key} = :${key}`).join(', ');
  const params = { id };
  for (const [key, value] of entries) params[key] = value === undefined || value === null ? '' : value;
  try {
    database.run(`UPDATE ${CLIP_HISTORY_TABLE} SET ${setSql} WHERE id = :id`, params);
    return true;
  } catch (err) {
    console.warn('[clips] History-Update fehlgeschlagen:', err.message || String(err));
    return false;
  }
}

function makeJobId() {
  return `clip_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function nowIso() {
  return database.nowIso ? database.nowIso() : new Date().toISOString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
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
