// modules/clips.js
// STEP184 — Clip-System Backend-Integration + API-Readiness.
// - vorhandene /api/clip/status, /api/clip/title und /api/clip/register bleiben erhalten
// - Clip-Historie wird sanft in app.sqlite gespeichert
// - Discord-Posting nutzt die vorhandene Discord-Bridge
// - Clip-Texte koennen ueber den zentralen helper_texts als module_text_variants vorbereitet werden
// - Twitch-/OBS-/Discord-Readiness wird fuer den spaeteren Backend-Create-Flow sichtbar gemacht

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const database = require('../core/database');
const messageHelper = require('./helpers/helper_messages');
let textHelper = null;
try {
  textHelper = require('./helpers/helper_texts');
} catch (_) {
  textHelper = null;
}

const MODULE_NAME = 'clips';
const CLIP_SCHEMA_VERSION = 1;
const CLIP_HISTORY_TABLE = 'clip_history';

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
    const cfg = readJsonSafe(clipConfigPath, {});

    return {
      enabled: cfg.enabled !== false,
      defaultClipTitle: String(cfg.defaultClipTitle || 'Clip').trim() || 'Clip',
      includeGameInCustomTitle: cfg.includeGameInCustomTitle !== false,

      twitchClipDurationSeconds: toInt(cfg.twitchClipDurationSeconds, 30, 1, 120),
      obsReplaySaveDelayMs: toInt(cfg.obsReplaySaveDelayMs, 30000, 0, 300000),
      localReplayRenameDelayMs: toInt(cfg.localReplayRenameDelayMs, 3000, 0, 60000),
      localReplayDir: String(cfg.localReplayDir || '').trim(),
      localReplayLookbackMinutes: toInt(cfg.localReplayLookbackMinutes, 5, 1, 60),

      sendClipActivatedMessage: cfg.sendClipActivatedMessage !== false,
      sendTwitchClipResultMessage: cfg.sendTwitchClipResultMessage !== false,

      discordPostEnabled: cfg.discordPostEnabled === true,
      discordChannelKey: String(cfg.discordChannelKey || 'clips').trim() || 'clips',
      postOnlyWhenLive: cfg.postOnlyWhenLive === true,
      saveHistory: cfg.saveHistory !== false,

      messagesPath: String(cfg.messagesPath || 'messages/clips.json').trim() || 'messages/clips.json',

      broadcasterId: String(env?.TWITCH_BROADCASTER_ID || process.env.TWITCH_BROADCASTER_ID || '').trim(),
      channelSummaryUrl: `http://127.0.0.1:${String(env?.PORT || process.env.PORT || 8080).trim()}/api/twitch/channel/summary`
    };
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
        targetReplayWindowSeconds: 60,
        targetPreTriggerSeconds: 30,
        targetPostTriggerSeconds: 30,
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
        targetReplayWindowSeconds: 60,
        targetPreTriggerSeconds: 30,
        targetPostTriggerSeconds: 30,
        configuredPostTriggerDelayMs: cfg.obsReplaySaveDelayMs,
        blockers: ['obs_replay_status_route_unavailable'],
        error: err.message || String(err)
      };
    }
  }

  function buildDiscordReadiness(cfg, channels) {
    const channelConfigured = Boolean(channels && channels[cfg.discordChannelKey]);
    const bridgeAvailable = Boolean(app.locals.discordBridge && typeof app.locals.discordBridge.postToChannel === 'function');
    const readyForPost = Boolean(!cfg.discordPostEnabled || (channelConfigured && bridgeAvailable));
    const blockers = [];

    if (cfg.discordPostEnabled && !channelConfigured) blockers.push('discord_channel_not_configured');
    if (cfg.discordPostEnabled && !bridgeAvailable) blockers.push('discord_bridge_unavailable');

    return {
      discordPostEnabled: cfg.discordPostEnabled,
      discordChannelKey: cfg.discordChannelKey,
      discordChannelConfigured: channelConfigured,
      bridgeAvailable,
      readyForPost,
      blockers
    };
  }

  function buildBackendCreateReadiness(cfg, twitchApi, obsReplay, discord) {
    const blockers = [];
    if (!cfg.enabled) blockers.push('clip_system_disabled');
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
      twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
      obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
      localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
      localReplayDir: cfg.localReplayDir,
      localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
      sendClipActivatedMessage: cfg.sendClipActivatedMessage,
      sendTwitchClipResultMessage: cfg.sendTwitchClipResultMessage,
      discordPostEnabled: cfg.discordPostEnabled,
      discordChannelKey: cfg.discordChannelKey,
      postOnlyWhenLive: cfg.postOnlyWhenLive,
      saveHistory: cfg.saveHistory
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
        twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
        obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
        obsReplayWindowSeconds: 60,
        obsReplayPreTriggerSeconds: 30,
        obsReplayPostTriggerSeconds: 30,
        localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
        localReplayDirConfigured: Boolean(cfg.localReplayDir),
        localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
        saveHistory: cfg.saveHistory,
        messagesFromDbPrepared: Boolean(textHelper)
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
        discordChannelKey: cfg.discordChannelKey
      }
    });
  }

  async function maybePostClipToDiscord({ cfg, messages, received }) {
    if (!cfg.discordPostEnabled) return { attempted: false, posted: false, skipped: true, reason: 'discord_disabled' };
    if (received.status === 'skipped') return { attempted: false, posted: false, skipped: true, reason: 'clip_skipped' };

    const channels = loadDiscordChannels();
    const channelId = String(channels?.[cfg.discordChannelKey] || '').trim();
    if (!channelId) return { attempted: false, posted: false, skipped: true, reason: 'discord_channel_not_configured', channelKey: cfg.discordChannelKey };

    if (cfg.postOnlyWhenLive) {
      const liveInfo = await loadChannelInfoFromApi(cfg);
      if (liveInfo.is_live === false) {
        return { attempted: false, posted: false, skipped: true, reason: 'not_live', channelKey: cfg.discordChannelKey };
      }
    }

    const bridge = app.locals.discordBridge;
    if (!bridge || typeof bridge.postToChannel !== 'function') {
      return { attempted: false, posted: false, skipped: true, reason: 'discord_bridge_unavailable', channelKey: cfg.discordChannelKey };
    }

    const content = renderClipMessage(messages, 'discordClipPost', received);
    if (!content) return { attempted: false, posted: false, skipped: true, reason: 'discord_message_empty', channelKey: cfg.discordChannelKey };

    try {
      const result = await bridge.postToChannel({
        channelId,
        content,
        allowedMentions: { parse: [] }
      });
      return { attempted: true, posted: true, skipped: false, channelKey: cfg.discordChannelKey, channelId, result };
    } catch (err) {
      return { attempted: true, posted: false, skipped: false, channelKey: cfg.discordChannelKey, channelId, error: err.message || String(err) };
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
  for (const key of [
    'chatClipActivated',
    'chatClipCreated',
    'chatClipFailed',
    'chatClipCreatedWithoutUrl',
    'chatLocalReplayMissing',
    'chatLocalReplayInvalidDir',
    'chatReplaySaved',
    'discordClipPost'
  ]) {
    const value = messageContent(messages, key);
    if (value) defaults[key] = value;
  }
  return defaults;
}

function seedClipTexts(messages) {
  if (!textHelper || typeof textHelper.listModuleTextEditor !== 'function') return;
  try {
    textHelper.listModuleTextEditor(MODULE_NAME, buildTextDefaults(messages), {
      defaultCategory: 'clip',
      categoryLabels: { clip: 'Clip-System' },
      source: 'seed'
    });
  } catch (err) {
    console.warn('[clips] Text-Seed konnte nicht vorbereitet werden:', err.message || String(err));
  }
}

function resolveClipMessage(messages, key) {
  const fallback = messageContent(messages, key);
  if (!textHelper || typeof textHelper.pickModuleText !== 'function') return fallback;

  try {
    return String(textHelper.pickModuleText(MODULE_NAME, key, buildTextDefaults(messages), {
      defaultCategory: 'clip',
      categoryLabels: { clip: 'Clip-System' },
      source: 'seed'
    }) || fallback || '').trim();
  } catch (_) {
    return fallback;
  }
}

function renderClipMessage(messages, key, context) {
  const template = resolveClipMessage(messages, key);
  return messageHelper.replacePlaceholders(template, {
    clipId: context.clipId || '',
    clipUrl: context.clipUrl || '',
    clipTitle: context.clipTitle || '',
    customTitle: context.customTitle || '',
    streamTitle: context.streamTitle || '',
    gameName: context.gameName || '',
    triggerUser: context.triggerUser || '',
    status: context.status || '',
    reason: context.reason || ''
  });
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
