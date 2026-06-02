// modules/discord.js
// Allgemeiner Discord-Core / Bridge
// - Discord Client / Login
// - Voice / Sound
// - Allgemeine Post-Funktionen für Channel + Webhook
// - Status-Endpunkte für andere Module / Streamer.bot
//
// Fachlogik wie Tagebuch, Todo oder Verifikation gehört NICHT hier rein.
// Diese Module sollen die hier bereitgestellten Bridge-Funktionen nutzen.

'use strict';

const fs = require('fs');
const path = require('path');

// Gemeinsame Helper: keine Endpunkte ändern, nur interne Basisfunktionen zentralisieren.
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const configHelper = require('./helpers/helper_config');

const MODULE_NAME = 'discord';
const MODULE_VERSION = '0.1.1';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'integration',
  legacy: false,
  description: 'Discord bridge for channel posts, webhooks, voice and sound forwarding.',
  routesPrefix: ['/api/discord', '/discord'],
  bus: {
    publishes: false,
    subscribes: false,
    heartbeat: false
  }
};

// --------------------------------------------------
// TOOLS / FFMPEG SETUP
// --------------------------------------------------
const PROJECT_ROOT = configHelper.getRootDir ? configHelper.getRootDir() : path.resolve(__dirname, '..', '..');
const TOOLS_CONFIG_FILE = 'tools.json';
let toolsConfig = {};
let toolsConfigPath = '';
let resolvedFfmpegPath = '';
let resolvedFfmpegDir = '';
let ffmpegSetupError = '';

function readToolsConfig() {
  try {
    const configDir = configHelper.getConfigDir ? configHelper.getConfigDir() : path.join(PROJECT_ROOT, 'config');
    toolsConfigPath = path.join(configDir, TOOLS_CONFIG_FILE);
    if (!fs.existsSync(toolsConfigPath)) {
      toolsConfig = {};
      return toolsConfig;
    }
    const raw = fs.readFileSync(toolsConfigPath, 'utf8');
    toolsConfig = JSON.parse(raw || '{}');
    return toolsConfig;
  } catch (err) {
    ffmpegSetupError = err?.message || String(err);
    toolsConfig = {};
    return toolsConfig;
  }
}

function normalizeToolPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return path.isAbsolute(raw) ? raw : path.resolve(PROJECT_ROOT, raw);
}

function getFfmpegCandidates() {
  const cfg = readToolsConfig();
  const ffmpeg = cfg && typeof cfg === 'object' ? (cfg.ffmpeg || {}) : {};
  const list = [
    process.env.DISCORD_FFMPEG_PATH,
    process.env.FFMPEG_PATH,
    ffmpeg.path,
    ...(Array.isArray(ffmpeg.fallbackPaths) ? ffmpeg.fallbackPaths : []),
    path.join(PROJECT_ROOT, 'tools', 'ffmpeg', 'ffmpeg.exe'),
    path.join(PROJECT_ROOT, 'tools', 'ffmpeg', 'ffmpeg', 'ffmpeg.exe'),
  ];

  return Array.from(new Set(list.map(normalizeToolPath).filter(Boolean)));
}

function configureFfmpegPath() {
  ffmpegSetupError = '';
  const candidates = getFfmpegCandidates();

  for (const candidate of candidates) {
    try {
      const full = path.resolve(String(candidate));
      if (fs.existsSync(full)) {
        resolvedFfmpegPath = full;
        resolvedFfmpegDir = path.dirname(full);
        process.env.FFMPEG_PATH = full;
        process.env.DISCORD_FFMPEG_PATH = full;

        const delimiter = path.delimiter;
        const currentPath = process.env.PATH || '';
        const parts = currentPath.split(delimiter).filter(Boolean);
        const alreadyInPath = parts.some((p) => {
          try { return path.resolve(p).toLowerCase() === resolvedFfmpegDir.toLowerCase(); }
          catch (_) { return false; }
        });
        if (!alreadyInPath) {
          process.env.PATH = `${resolvedFfmpegDir}${delimiter}${currentPath}`;
        }
        return true;
      }
    } catch (err) {
      ffmpegSetupError = err?.message || String(err);
    }
  }

  resolvedFfmpegPath = '';
  resolvedFfmpegDir = '';
  return false;
}

configureFfmpegPath();

function getFfmpegSummary() {
  const pathParts = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  return {
    toolsConfigPath,
    configuredPath: process.env.DISCORD_FFMPEG_PATH || process.env.FFMPEG_PATH || '',
    resolvedPath: resolvedFfmpegPath || '',
    resolvedDir: resolvedFfmpegDir || '',
    exists: Boolean(resolvedFfmpegPath && fs.existsSync(resolvedFfmpegPath)),
    directoryInPath: Boolean(resolvedFfmpegDir && pathParts.some((p) => {
      try { return path.resolve(p).toLowerCase() === resolvedFfmpegDir.toLowerCase(); }
      catch (_) { return false; }
    })),
    setupError: ffmpegSetupError || '',
  };
}
const {
  Client,
  GatewayIntentBits,
} = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection,
} = require('@discordjs/voice');

// --------------------------------------------------
// ENV / CONFIG
// --------------------------------------------------
const TOKEN = process.env.DISCORD_TOKEN || '';
const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.GUILD_ID || '';
const DEFAULT_VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID || process.env.VOICE_CHANNEL_ID || '';
const API_KEY = process.env.DISCORD_API_KEY || process.env.API_KEY || 'change-me';
const MEDIA_DIR = process.env.DISCORD_MEDIA_DIR || process.env.MEDIA_DIR || path.join(process.cwd(), 'media');
const WEBROOT_DIR = process.env.DISCORD_WEBROOT_DIR || process.env.WEBROOT_DIR || path.join(PROJECT_ROOT, 'htdocs');
const ASSETS_DIR = process.env.DISCORD_ASSETS_DIR || process.env.ASSETS_DIR || path.join(WEBROOT_DIR, 'assets');
const IDLE_DISCONNECT_MS = Number(process.env.DISCORD_IDLE_DISCONNECT_MS ?? 15000);

// --------------------------------------------------
// INTERNAL STATE
// --------------------------------------------------
let client = null;
let discordReady = false;
let lastReadyAt = null;
let lastError = '';
let initDone = false;
let appRef = null;
let serviceRef = null;

// pro Guild: Audio-State
const guildState = new Map();
const idleTimers = new Map();

function nowIso() {
  return core.nowIso();
}

function authOk(req) {
  const key = core.pickFirst(req.query?.auth, req.headers['x-api-key'], req.body?.auth);
  return key === API_KEY;
}

function jsonForbidden(res) {
  return res.status(403).json({ ok: false, error: 'forbidden' });
}

function safeString(value) {
  return String(value || '').trim();
}

function normalizeContent(value) {
  return String(value || '').replace(/\r/g, '').trim();
}

function truncateDiscordName(value, maxLen = 80) {
  return safeString(value).slice(0, maxLen);
}

function cleanAllowedMentions(value) {
  if (!value || typeof value !== 'object') {
    return { parse: [] };
  }

  const parse = Array.isArray(value.parse)
    ? value.parse.filter((x) => ['roles', 'users'].includes(x))
    : [];

  const users = Array.isArray(value.users) ? value.users.map(String) : undefined;
  const roles = Array.isArray(value.roles) ? value.roles.map(String) : undefined;
  const repliedUser = Boolean(value.replied_user);

  return {
    parse,
    ...(users ? { users } : {}),
    ...(roles ? { roles } : {}),
    replied_user: repliedUser,
  };
}

function buildDiscordPayload({ content, embeds, allowedMentions }) {
  const normalizedContent = normalizeContent(content);
  const payload = {
    allowedMentions: cleanAllowedMentions(allowedMentions),
  };

  if (normalizedContent) {
    payload.content = normalizedContent;
  }

  if (Array.isArray(embeds) && embeds.length > 0) {
    payload.embeds = embeds;
  }

  if (!payload.content && !payload.embeds?.length) {
    throw new Error('content oder embeds fehlt');
  }

  return payload;
}

// --------------------------------------------------
// VOICE / SOUND HELPERS
// --------------------------------------------------
function ensureGuildAudioState(guildId) {
  if (!guildState.has(guildId)) {
    guildState.set(guildId, {
      player: createAudioPlayer(),
      queue: [],
      playing: false,
      currentFile: null,
      lastStartedAt: null,
      lastFinishedAt: null,
      lastPlayerError: '',
      lastQueuedAt: null,
      channelId: null,
      handlersAttached: false,
    });
  }
  return guildState.get(guildId);
}

function addMediaFileCandidates(candidates, baseDir, relativeKey) {
  const base = safeString(baseDir);
  const raw = safeString(relativeKey).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!base || !raw || raw.includes('..')) return;

  const resolvedBase = path.resolve(base);
  const direct = path.resolve(resolvedBase, raw);
  const tries = [direct];
  if (!path.extname(raw)) {
    tries.push(
      path.resolve(resolvedBase, `${raw}.mp3`),
      path.resolve(resolvedBase, `${raw}.wav`),
      path.resolve(resolvedBase, `${raw}.ogg`)
    );
  }

  for (const candidate of tries) {
    if (!candidate.toLowerCase().startsWith(resolvedBase.toLowerCase() + path.sep.toLowerCase()) && candidate.toLowerCase() !== resolvedBase.toLowerCase()) {
      continue;
    }
    candidates.push(candidate);
  }
}

function resolveMediaFile(key) {
  const cleanKey = safeString(key).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!cleanKey || cleanKey.includes('..')) return '';

  const tries = [];
  addMediaFileCandidates(tries, MEDIA_DIR, cleanKey);

  // Media-Registry Alerts liefern Pfade wie "media/alerts/bits/100-249.mp3".
  // MEDIA_DIR zeigt im Live-System auf htdocs/assets/sounds; diese Dateien liegen aber unter htdocs/assets/media.
  if (cleanKey.startsWith('media/')) {
    addMediaFileCandidates(tries, ASSETS_DIR, cleanKey);
  }

  // Webpfade aus Modulen/Configs dürfen ebenfalls sauber aufgelöst werden.
  if (cleanKey.startsWith('assets/')) {
    addMediaFileCandidates(tries, WEBROOT_DIR, cleanKey);
  }

  if (cleanKey.startsWith('sounds/')) {
    addMediaFileCandidates(tries, ASSETS_DIR, cleanKey);
  }

  const unique = Array.from(new Set(tries));
  return unique.find((p) => fs.existsSync(p)) || '';
}

async function connectToVoiceChannel(guild, channelId) {
  const connection = joinVoiceChannel({
    channelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 10000);
  return connection;
}

function clearIdleTimer(guildId) {
  const timer = idleTimers.get(guildId);
  if (timer) {
    clearTimeout(timer);
    idleTimers.delete(guildId);
  }
}

function scheduleIdleLeave(guildId) {
  clearIdleTimer(guildId);
  if (IDLE_DISCONNECT_MS <= 0) return;

  const timer = setTimeout(() => {
    try {
      const connection = getVoiceConnection(guildId);
      if (connection) connection.destroy();
    } catch (_) {
      // ignore
    } finally {
      idleTimers.delete(guildId);
    }
  }, IDLE_DISCONNECT_MS);

  idleTimers.set(guildId, timer);
}

function getConnectionSummary(guildId) {
  const connection = getVoiceConnection(guildId);
  return {
    exists: Boolean(connection),
    status: connection?.state?.status || null,
    hasSubscription: Boolean(connection?.state?.subscription),
  };
}

function getAudioStateSummary(guildId = GUILD_ID) {
  const state = guildState.get(guildId);
  const connection = getConnectionSummary(guildId);
  if (!state) {
    return {
      guildId,
      voiceConnection: connection,
      playerStatus: null,
      playing: false,
      queueLength: 0,
      currentSound: null,
      channelId: null,
      lastPlayerError: '',
      lastQueuedAt: null,
      lastStartedAt: null,
      lastFinishedAt: null,
    };
  }
  return {
    guildId,
    voiceConnection: connection,
    playerStatus: state.player?.state?.status || null,
    playing: Boolean(state.playing),
    queueLength: state.queue.length,
    currentSound: state.currentFile ? path.basename(state.currentFile) : null,
    channelId: state.channelId || null,
    lastPlayerError: state.lastPlayerError || '',
    lastQueuedAt: state.lastQueuedAt || null,
    lastStartedAt: state.lastStartedAt || null,
    lastFinishedAt: state.lastFinishedAt || null,
  };
}

function resetGuildAudioState(guildId = GUILD_ID, options = {}) {
  const clearQueue = options.clearQueue !== false;
  clearIdleTimer(guildId);
  const state = ensureGuildAudioState(guildId);
  try { state.player.stop(true); } catch (_) {}
  if (clearQueue) state.queue = [];
  state.playing = false;
  state.currentFile = null;
  state.lastFinishedAt = nowIso();
  return getAudioStateSummary(guildId);
}

function ensurePlayerCanStart(guildId) {
  const state = ensureGuildAudioState(guildId);
  const playerStatus = state.player?.state?.status;
  if (state.playing && playerStatus !== AudioPlayerStatus.Playing && playerStatus !== AudioPlayerStatus.Buffering) {
    state.playing = false;
    state.currentFile = null;
  }
  return state;
}

function playNext(guild) {
  const state = ensurePlayerCanStart(guild.id);
  if (state.playing) return;

  clearIdleTimer(guild.id);

  const connection = getVoiceConnection(guild.id);
  if (!connection) {
    state.playing = false;
    state.currentFile = null;
    state.lastPlayerError = 'voice connection fehlt';
    return;
  }
  connection.subscribe(state.player);

  const next = state.queue.shift();
  if (!next) {
    state.currentFile = null;
    scheduleIdleLeave(guild.id);
    return;
  }

  state.playing = true;
  state.currentFile = next;
  state.lastStartedAt = nowIso();
  state.lastPlayerError = '';

  try {
    state.player.play(createAudioResource(next));
  } catch (err) {
    state.lastPlayerError = err?.message || String(err);
    state.playing = false;
    state.currentFile = null;
    playNext(guild);
  }
}

function attachAudioHandlers(guild) {
  const state = ensureGuildAudioState(guild.id);
  if (state.handlersAttached) return;

  state.player.on(AudioPlayerStatus.Idle, () => {
    state.playing = false;
    state.currentFile = null;
    state.lastFinishedAt = nowIso();
    playNext(guild);
  });

  state.player.on('error', (err) => {
    state.lastPlayerError = err?.message || String(err);
    console.warn('[discord] audio player error:', state.lastPlayerError);
    state.playing = false;
    state.currentFile = null;
    state.lastFinishedAt = nowIso();
    playNext(guild);
  });

  state.handlersAttached = true;
}

async function joinConfiguredVoiceChannel(channelId = DEFAULT_VOICE_CHANNEL_ID) {
  if (!client) throw new Error('discord client not initialized');
  if (!GUILD_ID) throw new Error('DISCORD_GUILD_ID fehlt');
  if (!channelId) throw new Error('voice channelId fehlt');

  const guild = await client.guilds.fetch(GUILD_ID);
  attachAudioHandlers(guild);

  const connection = await connectToVoiceChannel(guild, channelId);
  const state = ensureGuildAudioState(guild.id);
  state.channelId = channelId;
  connection.subscribe(state.player);

  return {
    ok: true,
    guildId: guild.id,
    channelId,
  };
}

async function leaveVoiceChannel(guildId = GUILD_ID) {
  if (!guildId) throw new Error('guildId fehlt');
  const audioState = resetGuildAudioState(guildId, { clearQueue: true });

  const connection = getVoiceConnection(guildId);
  if (connection) connection.destroy();

  return { ok: true, guildId, audioState };
}

async function enqueueSound(soundKey, channelId = DEFAULT_VOICE_CHANNEL_ID) {
  if (!client) throw new Error('discord client not initialized');
  if (!GUILD_ID) throw new Error('DISCORD_GUILD_ID fehlt');

  const filePath = resolveMediaFile(soundKey);
  if (!filePath) {
    throw new Error(`sound nicht gefunden: ${soundKey}`);
  }

  const guild = await client.guilds.fetch(GUILD_ID);
  attachAudioHandlers(guild);
  const state = ensureGuildAudioState(guild.id);

  const targetChannelId = channelId || DEFAULT_VOICE_CHANNEL_ID;
  let connection = getVoiceConnection(guild.id);
  if (!connection || connection.state?.status === VoiceConnectionStatus.Destroyed) {
    connection = await connectToVoiceChannel(guild, targetChannelId);
  }

  state.channelId = targetChannelId;
  connection.subscribe(state.player);
  ensurePlayerCanStart(guild.id);

  state.queue.push(filePath);
  state.lastQueuedAt = nowIso();
  playNext(guild);

  return {
    ok: true,
    guildId: guild.id,
    channelId: state.channelId,
    queued: path.basename(filePath),
    queueLength: state.queue.length,
    audioState: getAudioStateSummary(guild.id),
  };
}

function listAvailableSounds() {
  try {
    if (!fs.existsSync(MEDIA_DIR)) {
      return [];
    }

    return fs.readdirSync(MEDIA_DIR)
      .filter((file) => /\.(mp3|wav|ogg)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, 'de'));
  } catch (err) {
    console.warn('[discord] failed to list sounds:', err?.message || err);
    return [];
  }
}

// --------------------------------------------------
// DISCORD BRIDGE HELPERS
// --------------------------------------------------
async function fetchTextChannel(channelId) {
  if (!client) throw new Error('discord client not initialized');
  if (!channelId) throw new Error('channelId fehlt');

  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    throw new Error('channel not found');
  }
  if (!channel.isTextBased() || typeof channel.send !== 'function') {
    throw new Error('channel ist nicht textbasiert');
  }
  return channel;
}

async function postToChannel({ channelId, content, embeds, allowedMentions }) {
  const payload = buildDiscordPayload({ content, embeds, allowedMentions });
  const channel = await fetchTextChannel(channelId);
  const sent = await channel.send(payload);

  return {
    ok: true,
    mode: 'channel',
    channelId,
    messageId: sent?.id || null,
    createdAt: nowIso(),
  };
}

async function postToWebhook({ webhookUrl, username, avatarUrl, content, embeds, allowedMentions }) {
  const cleanWebhookUrl = safeString(webhookUrl);
  if (!cleanWebhookUrl) {
    throw new Error('webhookUrl fehlt');
  }

  const payload = buildDiscordPayload({ content, embeds, allowedMentions });

  if (safeString(username)) {
    payload.username = truncateDiscordName(username, 80);
  }
  if (safeString(avatarUrl)) {
    payload.avatar_url = safeString(avatarUrl);
  }

  const response = await fetch(cleanWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Webhook POST fehlgeschlagen (${response.status}): ${text || response.statusText}`);
  }

  return {
    ok: true,
    mode: 'webhook',
    createdAt: nowIso(),
  };
}

async function postMessage({ mode, channelId, webhookUrl, username, avatarUrl, content, embeds, allowedMentions }) {
  const normalizedMode = safeString(mode).toLowerCase();

  if (normalizedMode === 'channel') {
    return postToChannel({ channelId, content, embeds, allowedMentions });
  }

  if (normalizedMode === 'webhook') {
    return postToWebhook({ webhookUrl, username, avatarUrl, content, embeds, allowedMentions });
  }

  throw new Error('ungültiger mode, erlaubt: channel oder webhook');
}

function buildStatus() {
  return {
    ok: true,
    module: 'discord',
    ready: discordReady,
    lastReadyAt,
    lastError,
    guildId: GUILD_ID || null,
    defaultVoiceChannelId: DEFAULT_VOICE_CHANNEL_ID || null,
    mediaDir: MEDIA_DIR,
    webrootDir: WEBROOT_DIR,
    assetsDir: ASSETS_DIR,
    soundsCount: listAvailableSounds().length,
    ffmpeg: getFfmpegSummary(),
    audio: GUILD_ID ? getAudioStateSummary(GUILD_ID) : null,
  };
}


const DISCORD_DIAGNOSTIC_ROUTES = [
  { method: 'GET', path: '/api/discord/status', purpose: 'Discord runtime status' },
  { method: 'GET', path: '/api/discord/config', purpose: 'sanitized Discord config and file paths' },
  { method: 'GET', path: '/api/discord/settings', purpose: 'runtime settings and bridge/audio summary' },
  { method: 'GET', path: '/api/discord/routes', purpose: 'list Discord API routes' },
  { method: 'GET', path: '/api/discord/integration-check', purpose: 'run non-destructive Discord integration check' },
  { method: 'POST', path: '/api/discord/reload', purpose: 'reload ffmpeg/tools snapshot without voice, queue or posting actions' },
  { method: 'GET', path: '/api/discord/sounds', purpose: 'list available Discord sounds' },
  { method: 'GET', path: '/api/discord/queue/status', purpose: 'read Discord voice queue status' },
  { method: 'GET/POST', path: '/api/discord/queue/clear', purpose: 'clear Discord voice queue' },
  { method: 'GET/POST', path: '/api/discord/join', purpose: 'join configured voice channel' },
  { method: 'GET/POST', path: '/api/discord/leave', purpose: 'leave voice channel' },
  { method: 'GET/POST', path: '/api/discord/play', purpose: 'enqueue/play Discord sound' },
  { method: 'POST', path: '/api/discord/post/channel', purpose: 'post message to Discord channel via bot' },
  { method: 'POST', path: '/api/discord/post/webhook', purpose: 'post message to Discord webhook' },
  { method: 'POST', path: '/api/discord/post/message', purpose: 'post message via selected mode' },
];

function fileCheck(name, filePath, required = false) {
  try {
    const exists = Boolean(filePath && fs.existsSync(filePath));
    return {
      name,
      ok: required ? exists : true,
      level: required && !exists ? 'error' : (exists ? 'ok' : 'warning'),
      path: filePath || '',
      exists,
      required: Boolean(required),
      error: required && !exists ? 'file_not_found' : '',
    };
  } catch (err) {
    return {
      name,
      ok: false,
      level: required ? 'error' : 'warning',
      path: filePath || '',
      exists: false,
      required: Boolean(required),
      error: err?.message || String(err),
    };
  }
}

function dirCheck(name, dirPath, required = false) {
  try {
    const exists = Boolean(dirPath && fs.existsSync(dirPath));
    const isDirectory = exists ? fs.statSync(dirPath).isDirectory() : false;
    const ok = required ? (exists && isDirectory) : true;
    return {
      name,
      ok,
      level: ok ? (exists ? 'ok' : 'warning') : 'error',
      path: dirPath || '',
      exists,
      isDirectory,
      required: Boolean(required),
      error: ok ? '' : (exists ? 'not_a_directory' : 'directory_not_found'),
    };
  } catch (err) {
    return {
      name,
      ok: false,
      level: required ? 'error' : 'warning',
      path: dirPath || '',
      exists: false,
      isDirectory: false,
      required: Boolean(required),
      error: err?.message || String(err),
    };
  }
}

function summarizeDiscordConfig() {
  const configDir = configHelper.getConfigDir ? configHelper.getConfigDir() : path.join(PROJECT_ROOT, 'config');
  const messagesPath = path.join(configDir, 'messages', 'discord.json');
  const channelsPath = path.join(configDir, 'discord_channels.json');
  return {
    prefix: '/api/discord',
    legacyPrefix: '/discord',
    projectRoot: PROJECT_ROOT,
    configDir,
    mediaDir: MEDIA_DIR,
    webrootDir: WEBROOT_DIR,
    assetsDir: ASSETS_DIR,
    toolsConfigPath,
    files: {
      toolsConfig: fileCheck('tools_config', toolsConfigPath, false),
      discordChannels: fileCheck('discord_channels', channelsPath, false),
      discordMessages: fileCheck('discord_messages', messagesPath, false),
      mediaDir: dirCheck('media_dir', MEDIA_DIR, false),
      webrootDir: dirCheck('webroot_dir', WEBROOT_DIR, false),
      assetsDir: dirCheck('assets_dir', ASSETS_DIR, false),
    },
    env: {
      tokenConfigured: Boolean(TOKEN),
      guildIdConfigured: Boolean(GUILD_ID),
      defaultVoiceChannelConfigured: Boolean(DEFAULT_VOICE_CHANNEL_ID),
      apiKeyConfigured: Boolean(API_KEY && API_KEY !== 'change-me'),
      idleDisconnectMs: IDLE_DISCONNECT_MS,
    },
    ffmpeg: getFfmpegSummary(),
    updatedAt: nowIso(),
  };
}

function buildDiscordSettings() {
  const audio = GUILD_ID ? getAudioStateSummary(GUILD_ID) : null;
  return {
    prefix: '/api/discord',
    legacyPrefix: '/discord',
    ready: discordReady,
    lastReadyAt,
    lastError,
    guildIdConfigured: Boolean(GUILD_ID),
    defaultVoiceChannelConfigured: Boolean(DEFAULT_VOICE_CHANNEL_ID),
    mediaDir: MEDIA_DIR,
    webrootDir: WEBROOT_DIR,
    assetsDir: ASSETS_DIR,
    soundsCount: listAvailableSounds().length,
    ffmpeg: getFfmpegSummary(),
    audio,
    bridgeAvailable: Boolean(serviceRef),
    updatedAt: nowIso(),
  };
}

function buildDiscordRoutes() {
  return {
    prefix: '/api/discord',
    legacyPrefix: '/discord',
    routes: DISCORD_DIAGNOSTIC_ROUTES,
    legacyMirrors: [
      '/discord/status',
      '/discord/sounds',
      '/discord/queue/status',
      '/discord/queue/clear',
      '/discord/join',
      '/discord/leave',
      '/discord/play',
      '/discord/post/channel',
      '/discord/post/webhook',
      '/discord/post/message',
    ],
    count: DISCORD_DIAGNOSTIC_ROUTES.length,
    updatedAt: nowIso(),
  };
}

function checkResult(name, ok, level, extra = {}) {
  return {
    name,
    ok: Boolean(ok),
    level: level || (ok ? 'ok' : 'warning'),
    error: ok ? '' : (extra.error || name),
    ...extra,
  };
}

function buildDiscordIntegrationCheck() {
  const cfg = summarizeDiscordConfig();
  const status = buildStatus();
  const sounds = listAvailableSounds();
  const audio = GUILD_ID ? getAudioStateSummary(GUILD_ID) : null;
  const checks = [];

  checks.push(checkResult('token_configured', Boolean(TOKEN), TOKEN ? 'ok' : 'warning', { configured: Boolean(TOKEN), error: TOKEN ? '' : 'DISCORD_TOKEN_missing' }));
  checks.push(checkResult('guild_configured', Boolean(GUILD_ID), GUILD_ID ? 'ok' : 'warning', { configured: Boolean(GUILD_ID), error: GUILD_ID ? '' : 'DISCORD_GUILD_ID_missing' }));
  checks.push(checkResult('default_voice_channel_configured', Boolean(DEFAULT_VOICE_CHANNEL_ID), DEFAULT_VOICE_CHANNEL_ID ? 'ok' : 'warning', { configured: Boolean(DEFAULT_VOICE_CHANNEL_ID), error: DEFAULT_VOICE_CHANNEL_ID ? '' : 'DISCORD_VOICE_CHANNEL_ID_missing' }));
  checks.push(checkResult('client_ready', Boolean(discordReady), discordReady ? 'ok' : 'warning', { ready: Boolean(discordReady), lastError: lastError || '' }));
  checks.push(checkResult('bridge_available', Boolean(serviceRef), serviceRef ? 'ok' : 'error', { available: Boolean(serviceRef) }));
  checks.push(checkResult('media_dir', cfg.files.mediaDir.exists && cfg.files.mediaDir.isDirectory, cfg.files.mediaDir.exists ? 'ok' : 'warning', cfg.files.mediaDir));
  checks.push(checkResult('sounds', sounds.length >= 0, 'ok', { count: sounds.length }));
  checks.push(checkResult('ffmpeg', Boolean(cfg.ffmpeg.exists), cfg.ffmpeg.exists ? 'ok' : 'warning', cfg.ffmpeg));
  checks.push(checkResult('audio_state', Boolean(audio || !GUILD_ID), 'ok', { audio }));
  checks.push(checkResult('routes', true, 'ok', { prefix: '/api/discord', count: DISCORD_DIAGNOSTIC_ROUTES.length }));

  const summary = checks.reduce((acc, item) => {
    acc.total += 1;
    if (item.level === 'error' || item.ok === false && item.level !== 'warning') acc.errors += 1;
    else if (item.level === 'warning') acc.warnings += 1;
    else acc.ok += 1;
    return acc;
  }, { total: 0, ok: 0, warnings: 0, errors: 0 });

  return {
    prefix: '/api/discord',
    legacyPrefix: '/discord',
    checks,
    summary,
    status,
    notes: [
      'This integration check is non-destructive.',
      'Voice connection warnings are expected when the bot is not connected to a voice channel.',
      'Productive prefix remains /api/discord; legacy /discord routes remain available.',
    ],
    updatedAt: nowIso(),
  };
}

function reloadDiscordDiagnostics() {
  configureFfmpegPath();
  return {
    action: 'reload',
    reloaded: true,
    destructive: false,
    voiceJoinTriggered: false,
    voiceLeaveTriggered: false,
    soundQueued: false,
    queueCleared: false,
    messagePosted: false,
    ffmpeg: getFfmpegSummary(),
    soundsCount: listAvailableSounds().length,
    status: buildStatus(),
    updatedAt: nowIso(),
  };
}

function getBridgeService() {
  return serviceRef;
}

// --------------------------------------------------
// HTTP ROUTES
// --------------------------------------------------
function registerRoutes(app) {
  // Status
  routes.registerGet(app, ['/discord/status', '/api/discord/status'], async (_req, res) => {
    return res.json(buildStatus());
  });

  routes.registerGet(app, '/api/discord/config', async (_req, res) => {
    return res.json({ ok: true, module: 'discord', route: '/api/discord/config', timestamp: nowIso(), data: summarizeDiscordConfig() });
  });

  routes.registerGet(app, '/api/discord/settings', async (_req, res) => {
    return res.json({ ok: true, module: 'discord', route: '/api/discord/settings', timestamp: nowIso(), data: buildDiscordSettings() });
  });

  routes.registerGet(app, '/api/discord/routes', async (_req, res) => {
    return res.json({ ok: true, module: 'discord', route: '/api/discord/routes', timestamp: nowIso(), data: buildDiscordRoutes() });
  });

  routes.registerGet(app, '/api/discord/integration-check', async (_req, res) => {
    return res.json({ ok: true, module: 'discord', route: '/api/discord/integration-check', timestamp: nowIso(), data: buildDiscordIntegrationCheck() });
  });

  routes.registerPost(app, '/api/discord/reload', async (_req, res) => {
    return res.json({ ok: true, module: 'discord', route: '/api/discord/reload', timestamp: nowIso(), data: reloadDiscordDiagnostics() });
  });

  // Sounds
  routes.registerGet(app, ['/discord/sounds', '/api/discord/sounds'], async (req, res) => {
    if (!authOk(req)) return jsonForbidden(res);
    return res.json({ ok: true, sounds: listAvailableSounds() });
  });

  routes.registerGet(app, ['/discord/queue/status', '/api/discord/queue/status'], async (_req, res) => {
    return res.json({ ok: true, audio: getAudioStateSummary(GUILD_ID) });
  });

  async function handleQueueClear(_req, res) {
    try {
      const audio = resetGuildAudioState(GUILD_ID, { clearQueue: true });
      return res.json({ ok: true, action: 'queue_clear', audio });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  routes.registerGet(app, ['/discord/queue/clear', '/api/discord/queue/clear'], handleQueueClear);
  routes.registerPost(app, ['/discord/queue/clear', '/api/discord/queue/clear'], handleQueueClear);

  async function handleJoin(req, res) {
    try {
      const result = await joinConfiguredVoiceChannel(req.body?.channelId || req.query.channelId || DEFAULT_VOICE_CHANNEL_ID);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  async function handleLeave(req, res) {
    try {
      const result = await leaveVoiceChannel(req.body?.guildId || req.query.guildId || GUILD_ID);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  async function handlePlay(req, res) {
    try {
      const sound = req.body?.sound || req.query.sound || req.body?.key || req.query.key;
      if (!safeString(sound)) {
        return res.status(400).json({ ok: false, error: 'sound fehlt' });
      }

      const result = await enqueueSound(sound, req.body?.channelId || req.query.channelId || DEFAULT_VOICE_CHANNEL_ID);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // Voice join (ohne API-Key)
  routes.registerGet(app, ['/discord/join', '/api/discord/join'], handleJoin);
  routes.registerPost(app, ['/discord/join', '/api/discord/join'], handleJoin);

  // Voice leave (ohne API-Key)
  routes.registerGet(app, ['/discord/leave', '/api/discord/leave'], handleLeave);
  routes.registerPost(app, ['/discord/leave', '/api/discord/leave'], handleLeave);

  // Voice play (ohne API-Key)
  routes.registerGet(app, ['/discord/play', '/api/discord/play'], handlePlay);
  routes.registerPost(app, ['/discord/play', '/api/discord/play'], handlePlay);

  // Allgemeiner Channel-Post
  routes.registerPost(app, ['/discord/post/channel', '/api/discord/post/channel'], async (req, res) => {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const result = await postToChannel({
        channelId: req.body?.channelId,
        content: req.body?.content,
        embeds: req.body?.embeds,
        allowedMentions: req.body?.allowedMentions,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Allgemeiner Webhook-Post
  routes.registerPost(app, ['/discord/post/webhook', '/api/discord/post/webhook'], async (req, res) => {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const result = await postToWebhook({
        webhookUrl: req.body?.webhookUrl,
        username: req.body?.username,
        avatarUrl: req.body?.avatarUrl,
        content: req.body?.content,
        embeds: req.body?.embeds,
        allowedMentions: req.body?.allowedMentions,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Einheitlicher Message-Endpunkt
  routes.registerPost(app, ['/discord/post/message', '/api/discord/post/message'], async (req, res) => {
    if (!authOk(req)) return jsonForbidden(res);
    try {
      const result = await postMessage({
        mode: req.body?.mode,
        channelId: req.body?.channelId,
        webhookUrl: req.body?.webhookUrl,
        username: req.body?.username,
        avatarUrl: req.body?.avatarUrl,
        content: req.body?.content,
        embeds: req.body?.embeds,
        allowedMentions: req.body?.allowedMentions,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
}

// --------------------------------------------------
// INIT
// --------------------------------------------------
function createDiscordClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
}

async function loginDiscord() {
  if (!TOKEN) {
    lastError = 'DISCORD_TOKEN fehlt';
    console.warn('[discord] DISCORD_TOKEN fehlt');
    return;
  }

  if (!client) {
    client = createDiscordClient();
  }

  client.once('clientReady', () => {
    discordReady = true;
    lastReadyAt = nowIso();
    lastError = '';
    console.log(`[discord] ready as ${client.user?.tag || client.user?.username || 'unknown'}`);
  });

  client.on('error', (err) => {
    lastError = err?.message || String(err);
    console.error('[discord] client error:', lastError);
  });

  client.on('shardError', (err) => {
    lastError = err?.message || String(err);
    console.error('[discord] shard error:', lastError);
  });

  client.on('disconnect', () => {
    discordReady = false;
  });

  try {
    await client.login(TOKEN);
  } catch (err) {
    lastError = err?.message || String(err);
    console.error('[discord] login failed:', lastError);
  }
}

function init(ctx) {
  if (initDone) return;
  initDone = true;

  appRef = ctx.app;

  serviceRef = {
    postToChannel,
    postToWebhook,
    postMessage,
    fetchTextChannel,
    buildStatus,
    joinConfiguredVoiceChannel,
    leaveVoiceChannel,
    enqueueSound,
    listAvailableSounds,
    getAudioStateSummary,
    resetGuildAudioState,
  };

  // Für andere Module zugänglich machen
  ctx.app.locals.discordBridge = serviceRef;
  ctx.discordBridge = serviceRef;

  registerRoutes(ctx.app);
  void loginDiscord();
}

module.exports = {
  MODULE_META,
  MODULE_VERSION,
  version: MODULE_VERSION,
  init,
  getBridgeService,
  postToChannel,
  postToWebhook,
  postMessage,
  buildStatus,
  getAudioStateSummary,
  resetGuildAudioState,
};
