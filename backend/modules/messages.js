'use strict';

const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const textHelper = require('./helpers/helper_texts');
const msgHelper = require('./helpers/helper_messages');

const cooldownState = new Map();
const schedulerState = {
  enabled: false,
  timer: null,
  startedAt: null,
  lastRunAt: null,
  lastKey: null,
  lastMessage: null
};

function getInput(req, key, fallback = '') {
  return core.getParam(req, key, fallback);
}

function wantsPlain(req) {
  return String(getInput(req, 'plain', '') || '').trim() === '1';
}

function reply(req, res, payload, statusCode = 200) {
  if (wantsPlain(req)) {
    return res.status(statusCode).type('text/plain; charset=utf-8').send(payload.message || payload.text || '');
  }
  return res.status(statusCode).json(payload);
}

function checkAuth(req) {
  const result = security.canAccess(req);
  return { ok: result.allowed, reason: result.reason, clientIp: result.clientIp };
}

function collectContext(req) {
  const rawContext = getInput(req, 'context', '');
  let parsedContext = {};

  if (rawContext && typeof rawContext === 'string') {
    parsedContext = core.safeJsonParse(rawContext, {}) || {};
  } else if (rawContext && typeof rawContext === 'object') {
    parsedContext = rawContext;
  }

  return textHelper.flattenContext({
    ...parsedContext,
    user: getInput(req, 'user', parsedContext.user || ''),
    displayName: getInput(req, 'displayName', parsedContext.displayName || ''),
    login: getInput(req, 'login', parsedContext.login || ''),
    username: getInput(req, 'username', parsedContext.username || ''),
    game: getInput(req, 'game', parsedContext.game || ''),
    streamTitle: getInput(req, 'streamTitle', parsedContext.streamTitle || ''),
    count: getInput(req, 'count', parsedContext.count || ''),
    channel: getInput(req, 'channel', parsedContext.channel || ''),
    youtubeUrl: getInput(req, 'youtubeUrl', parsedContext.youtubeUrl || ''),
    discordUrl: getInput(req, 'discordUrl', parsedContext.discordUrl || '')
  });
}

function buildOptions(req) {
  return {
    target: getInput(req, 'target', 'twitch_chat'),
    mode: getInput(req, 'mode', ''),
    index: getInput(req, 'index', ''),
    maxLength: getInput(req, 'maxLength', getInput(req, 'max', 450))
  };
}

function cooldownKey(target, key) {
  return `${String(target || 'default')}::${String(key || '')}`;
}

function checkCooldown(req, key, target) {
  const seconds = core.intParam(getInput(req, 'cooldownSeconds', getInput(req, 'cooldown', 0)), 0);
  if (seconds <= 0) return { allowed: true, cooldownSeconds: 0, remainingSeconds: 0 };

  const id = cooldownKey(target, key);
  const now = Date.now();
  const previous = cooldownState.get(id) || 0;
  const diff = now - previous;
  const cooldownMs = seconds * 1000;

  if (previous > 0 && diff < cooldownMs) {
    return {
      allowed: false,
      cooldownSeconds: seconds,
      remainingSeconds: Math.ceil((cooldownMs - diff) / 1000)
    };
  }

  cooldownState.set(id, now);
  return { allowed: true, cooldownSeconds: seconds, remainingSeconds: 0 };
}

async function sendDiscordIfRequested(ctx, result, req) {
  const target = String(result.target || '').toLowerCase();
  if (target !== 'discord' && target !== 'discord_channel') return result;

  const channelId = getInput(req, 'channelId', getInput(req, 'discordChannelId', ''));
  if (!channelId) {
    return { ...result, ok: false, error: 'missing_discord_channel_id', message: 'Discord-Channel fehlt.' };
  }

  const bridge = ctx?.app?.locals?.discordBridge;
  if (!bridge || typeof bridge.postToChannel !== 'function') {
    return { ...result, ok: false, error: 'discord_bridge_unavailable', message: 'Discord-Bridge ist nicht verfügbar.' };
  }

  const postResult = await bridge.postToChannel({ channelId, content: result.message });
  return { ...result, discord: { channelId, postResult } };
}

async function buildAndMaybeSend(ctx, req) {
  const key = String(getInput(req, 'key', '') || '').trim();
  if (!key) {
    return { ok: false, error: 'missing_key', message: 'Message-Key fehlt.' };
  }

  const context = collectContext(req);
  const options = buildOptions(req);
  const cooldown = checkCooldown(req, key, options.target);

  if (!cooldown.allowed) {
    return {
      ok: false,
      error: 'cooldown_active',
      key,
      cooldownSeconds: cooldown.cooldownSeconds,
      remainingSeconds: cooldown.remainingSeconds,
      message: textHelper.renderKey('command_cooldown', context, { mode: 'first' }) || `Bitte noch ${cooldown.remainingSeconds}s warten.`
    };
  }

  const result = textHelper.buildChatResult(key, context, options);
  if (!result.ok) return result;

  result.cooldown = cooldown;
  result.streamerbotPayload = msgHelper.streamerbotChatPayload(result.message, {
    target: options.target,
    maxLength: options.maxLength
  });

  return sendDiscordIfRequested(ctx, result, req);
}

function schedulerStatus() {
  return {
    enabled: schedulerState.enabled,
    startedAt: schedulerState.startedAt,
    lastRunAt: schedulerState.lastRunAt,
    lastKey: schedulerState.lastKey,
    lastMessage: schedulerState.lastMessage
  };
}

function stopScheduler() {
  if (schedulerState.timer) clearInterval(schedulerState.timer);
  schedulerState.enabled = false;
  schedulerState.timer = null;
  return schedulerStatus();
}

function startScheduler(ctx, options = {}) {
  stopScheduler();

  const intervalMinutes = Math.max(1, Number.parseInt(options.intervalMinutes || process.env.MESSAGE_SCHEDULER_INTERVAL_MINUTES || 20, 10));
  const keysRaw = String(options.keys || process.env.MESSAGE_SCHEDULER_KEYS || 'youtube_reminder,discord_reminder,follow_reminder').trim();
  const keys = keysRaw.split(',').map(v => v.trim()).filter(Boolean);

  if (keys.length === 0) throw new Error('Scheduler braucht mindestens einen Message-Key.');

  let index = 0;
  schedulerState.enabled = true;
  schedulerState.startedAt = core.nowIso();

  schedulerState.timer = setInterval(() => {
    const key = keys[index % keys.length];
    index += 1;
    const result = textHelper.buildChatResult(key, {}, { target: 'twitch_chat' });
    schedulerState.lastRunAt = core.nowIso();
    schedulerState.lastKey = key;
    schedulerState.lastMessage = result.message || '';

    if (ctx && typeof ctx.broadcastWS === 'function') {
      ctx.broadcastWS({ op: 'message_scheduler_tick', key, result });
    }
  }, intervalMinutes * 60 * 1000);

  return { ...schedulerStatus(), intervalMinutes, keys };
}

function init(ctx) {
  const app = ctx?.app;
  if (!app) throw new Error('Express app in ctx.app fehlt.');

  textHelper.ensureDefaultMessageFiles();
  textHelper.reload();

  routes.registerGet(app, ['/messages/status', '/api/messages/status'], (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

    return res.json({
      ...textHelper.getStatus(),
      scheduler: schedulerStatus()
    });
  });

  const reloadHandler = (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
    return res.json(textHelper.reload());
  };
  routes.registerGet(app, ['/messages/reload', '/api/messages/reload'], reloadHandler);
  routes.registerPost(app, ['/messages/reload', '/api/messages/reload'], reloadHandler);

  const randomHandler = (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

    const key = String(getInput(req, 'key', '') || '').trim();
    const context = collectContext(req);
    const result = textHelper.buildChatResult(key, context, buildOptions(req));
    return reply(req, res, result, result.ok ? 200 : 404);
  };
  routes.registerGet(app, ['/messages/random', '/api/messages/random', '/messages/render', '/api/messages/render'], randomHandler);
  routes.registerPost(app, ['/messages/random', '/api/messages/random', '/messages/render', '/api/messages/render'], randomHandler);

  const sendHandler = core.asyncRoute(async (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

    const result = await buildAndMaybeSend(ctx, req);
    return reply(req, res, result, result.ok ? 200 : 400);
  });
  routes.registerGet(app, ['/messages/send', '/api/messages/send'], sendHandler);
  routes.registerPost(app, ['/messages/send', '/api/messages/send'], sendHandler);

  const schedulerStartHandler = (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

    try {
      const result = startScheduler(ctx, {
        intervalMinutes: getInput(req, 'intervalMinutes', ''),
        keys: getInput(req, 'keys', '')
      });
      return res.json({ ok: true, ...result });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err?.message || String(err) });
    }
  };

  const schedulerStopHandler = (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
    return res.json({ ok: true, ...stopScheduler() });
  };

  routes.registerPost(app, ['/messages/scheduler/start', '/api/messages/scheduler/start'], schedulerStartHandler);
  routes.registerPost(app, ['/messages/scheduler/stop', '/api/messages/scheduler/stop'], schedulerStopHandler);
  routes.registerGet(app, ['/messages/scheduler/status', '/api/messages/scheduler/status'], (req, res) => {
    const auth = checkAuth(req);
    if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
    return res.json({ ok: true, ...schedulerStatus() });
  });

  console.log('[messages] /messages/* und /api/messages/* aktiv');
}

module.exports = { init };
