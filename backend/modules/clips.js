// modules/clips.js
// STEP87D.4 — Clip-System Config-/Message-Cleanup.
// - TWITCH_BROADCASTER_ID kommt aus .env
// - keine dauerhafte Channelinfo-Datei mehr
// - Clip-Optionen aus config/clip_system.json
// - Texte aus config/messages/clips.json
// - /api/clip/title liefert Clip-Titel + relevante Config/Message-Werte für Streamer.bot

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

module.exports.init = function init(ctx) {
  const { app, env } = ctx;

  const rootDir = resolveRootDir(ctx, env);
  const configDir = path.join(rootDir, 'config');
  const messagesDir = path.join(configDir, 'messages');

  const clipConfigPath = path.join(configDir, 'clip_system.json');
  const discordChannelsPath = path.join(configDir, 'discord_channels.json');

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
    return readJsonSafe(resolveMaybeAbsolute(configDir, cfg.messagesPath), {});
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
      chatClipActivated: messageContent(messages, 'chatClipActivated'),
      chatClipCreated: messageContent(messages, 'chatClipCreated'),
      chatClipFailed: messageContent(messages, 'chatClipFailed'),
      chatClipCreatedWithoutUrl: messageContent(messages, 'chatClipCreatedWithoutUrl'),
      chatLocalReplayMissing: messageContent(messages, 'chatLocalReplayMissing'),
      chatLocalReplayInvalidDir: messageContent(messages, 'chatLocalReplayInvalidDir'),
      chatReplaySaved: messageContent(messages, 'chatReplaySaved'),
      discordClipPost: messageContent(messages, 'discordClipPost')
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

    res.json({
      ok: true,
      module: 'clips',
      enabled: cfg.enabled,
      rootDir,
      config: {
        channelInfoSource: 'api',
        broadcasterIdConfigured: Boolean(cfg.broadcasterId),
        twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
        obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
        localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
        localReplayDirConfigured: Boolean(cfg.localReplayDir),
        localReplayLookbackMinutes: cfg.localReplayLookbackMinutes
      },
      files: {
        clipConfigPath,
        clipConfigExists: fs.existsSync(clipConfigPath),
        discordChannelsPath,
        discordChannelsExists: fs.existsSync(discordChannelsPath),
        clipMessagesPath,
        clipMessagesExists: fs.existsSync(clipMessagesPath)
      },
      discord: {
        discordPostEnabled: cfg.discordPostEnabled,
        discordChannelKey: cfg.discordChannelKey,
        discordChannelConfigured: Boolean(channels && channels[cfg.discordChannelKey])
      },
      messages: {
        chatClipActivatedConfigured: Boolean(messages?.chatClipActivated?.content),
        chatClipCreatedConfigured: Boolean(messages?.chatClipCreated?.content),
        chatClipFailedConfigured: Boolean(messages?.chatClipFailed?.content),
        chatClipCreatedWithoutUrlConfigured: Boolean(messages?.chatClipCreatedWithoutUrl?.content),
        chatLocalReplayMissingConfigured: Boolean(messages?.chatLocalReplayMissing?.content),
        chatLocalReplayInvalidDirConfigured: Boolean(messages?.chatLocalReplayInvalidDir?.content),
        discordClipPostConfigured: Boolean(messages?.discordClipPost?.content)
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

      // Flache Felder für Streamer.bot, damit C# ohne echten JSON-Parser leicht lesen kann.
      twitchClipDurationSeconds: cfg.twitchClipDurationSeconds,
      obsReplaySaveDelayMs: cfg.obsReplaySaveDelayMs,
      localReplayRenameDelayMs: cfg.localReplayRenameDelayMs,
      localReplayDir: cfg.localReplayDir,
      localReplayLookbackMinutes: cfg.localReplayLookbackMinutes,
      chatClipActivatedMessage: messageContent(messages, 'chatClipActivated'),
      chatClipCreatedMessage: messageContent(messages, 'chatClipCreated'),
      chatClipFailedMessage: messageContent(messages, 'chatClipFailed'),
      chatClipCreatedWithoutUrlMessage: messageContent(messages, 'chatClipCreatedWithoutUrl'),
      chatLocalReplayMissingMessage: messageContent(messages, 'chatLocalReplayMissing'),
      chatLocalReplayInvalidDirMessage: messageContent(messages, 'chatLocalReplayInvalidDir')
    });
  });

  app.get('/api/clip/register', (req, res) => {
    handleClipRegister(req, res, req.query || {}, 'get');
  });

  app.post('/api/clip/register', (req, res) => {
    handleClipRegister(req, res, req.body || {}, 'post');
  });

  function handleClipRegister(req, res, source, method) {
    const cfg = loadClipConfig();
    if (!cfg.enabled) {
      return res.status(503).json({ ok: false, error: 'Clip-System ist deaktiviert.' });
    }

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

    console.log('[clips] register ' + method + ': status=' + status + ' clip=' + (clipId || clipUrl || '-') + ' title=' + (clipTitle || '-') + ' user=' + (triggerUser || '-') + (reason ? ' reason=' + reason : ''));

    res.json({
      ok: true,
      registered: false,
      method,
      message: 'Register-Endpunkt ist GET/POST-kompatibel vorbereitet. SQLite/Discord werden im nächsten Schritt aktiviert.',
      received,
      planned: {
        saveHistory: cfg.saveHistory,
        discordPostEnabled: cfg.discordPostEnabled,
        discordChannelKey: cfg.discordChannelKey
      }
    });
  }

  console.log('[clips] /api/clip/status, /api/clip/title und /api/clip/register aktiv');
};

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
