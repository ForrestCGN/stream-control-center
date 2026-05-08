'use strict';

const fs = require('fs');
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

function safeCall(label, fn, fallback = null) {
  try {
    return { ok: true, value: fn(), error: '' };
  } catch (err) {
    return {
      ok: false,
      value: fallback,
      error: err?.message || String(err)
    };
  }
}

function fileCheck(label, filePath) {
  const value = String(filePath || '').trim();
  if (!value) {
    return {
      ok: false,
      label,
      path: '',
      exists: false,
      isFile: false,
      isDirectory: false,
      error: 'missing_path'
    };
  }

  try {
    const stat = fs.statSync(value);
    return {
      ok: true,
      label,
      path: value,
      exists: true,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      error: ''
    };
  } catch (err) {
    return {
      ok: false,
      label,
      path: value,
      exists: false,
      isFile: false,
      isDirectory: false,
      error: err?.message || String(err)
    };
  }
}

function getMessagesStatusSafe() {
  const statusResult = safeCall('status', () => textHelper.getStatus(), {});
  const status = statusResult.value || {};
  return {
    ok: statusResult.ok,
    status,
    error: statusResult.error
  };
}

function extractPossiblePaths(status) {
  const paths = [];

  function add(label, value) {
    const pathValue = String(value || '').trim();
    if (pathValue) paths.push({ label, path: pathValue });
  }

  add('configPath', status.configPath);
  add('messagesPath', status.messagesPath);
  add('messagePath', status.messagePath);
  add('textsPath', status.textsPath);
  add('basePath', status.basePath);
  add('configDir', status.configDir);
  add('messagesDir', status.messagesDir);
  add('defaultMessagesDir', status.defaultMessagesDir);

  if (status.paths && typeof status.paths === 'object') {
    for (const [key, value] of Object.entries(status.paths)) add(`paths.${key}`, value);
  }

  if (Array.isArray(status.files)) {
    status.files.forEach((file, index) => {
      if (file && typeof file === 'object') {
        add(`files.${file.file || index}`, file.path || file.fullPath || file.filePath || '');
      } else {
        add(`files.${index}`, file);
      }
    });
  } else if (status.files && typeof status.files === 'object') {
    for (const [key, value] of Object.entries(status.files)) {
      if (value && typeof value === 'object') {
        add(`files.${value.file || key}`, value.path || value.fullPath || value.filePath || '');
      } else {
        add(`files.${key}`, value);
      }
    }
  }

  return paths;
}

function countStatusCollection(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return 0;
}

function buildMessagesRoutes(req = null) {
  const routeList = [
    { method: 'GET', path: '/api/messages/status', auth: 'local_or_auth', category: 'status', description: 'Messages/Text-System Status inklusive Scheduler-Status.' },
    { method: 'GET', path: '/api/messages/config', auth: 'local_or_auth', category: 'config', description: 'Read-only effektive Messages-Konfiguration/Status ohne Secrets.' },
    { method: 'GET', path: '/api/messages/settings', auth: 'local_or_auth', category: 'settings', description: 'Read-only Messages-Settings/Status und Scheduler-Zustand.' },
    { method: 'GET', path: '/api/messages/routes', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Routenübersicht des Messages-Moduls.' },
    { method: 'GET', path: '/api/messages/integration-check', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Integration-Check des Messages-Moduls.' },
    { method: 'POST', path: '/api/messages/reload', auth: 'local_or_auth', category: 'admin', description: 'Message-/Textdaten neu laden.' },
    { method: 'GET', path: '/api/messages/reload', auth: 'local_or_auth', category: 'admin', description: 'Message-/Textdaten neu laden, GET-kompatibel für einfache Clients.' },
    { method: 'GET', path: '/api/messages/random', auth: 'local_or_auth', category: 'render', description: 'Message-Key zufällig/rendern.' },
    { method: 'POST', path: '/api/messages/random', auth: 'local_or_auth', category: 'render', description: 'Message-Key zufällig/rendern.' },
    { method: 'GET', path: '/api/messages/render', auth: 'local_or_auth', category: 'render', description: 'Message-Key rendern.' },
    { method: 'POST', path: '/api/messages/render', auth: 'local_or_auth', category: 'render', description: 'Message-Key rendern.' },
    { method: 'GET', path: '/api/messages/send', auth: 'local_or_auth', category: 'send', description: 'Message bauen und optional an Ziel senden.' },
    { method: 'POST', path: '/api/messages/send', auth: 'local_or_auth', category: 'send', description: 'Message bauen und optional an Ziel senden.' },
    { method: 'POST', path: '/api/messages/scheduler/start', auth: 'local_or_auth', category: 'scheduler', description: 'Messages-Scheduler starten.' },
    { method: 'POST', path: '/api/messages/scheduler/stop', auth: 'local_or_auth', category: 'scheduler', description: 'Messages-Scheduler stoppen.' },
    { method: 'GET', path: '/api/messages/scheduler/status', auth: 'local_or_auth', category: 'scheduler', description: 'Messages-Scheduler-Status lesen.' },

    { method: 'GET', path: '/messages/status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Messages-Status.' },
    { method: 'GET', path: '/messages/config', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Messages-Config.' },
    { method: 'GET', path: '/messages/settings', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Messages-Settings.' },
    { method: 'GET', path: '/messages/routes', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Messages-Routenübersicht.' },
    { method: 'GET', path: '/messages/integration-check', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Messages-Integration-Check.' },
    { method: 'GET', path: '/messages/reload', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reload.' },
    { method: 'POST', path: '/messages/reload', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reload.' },
    { method: 'GET', path: '/messages/random', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Random.' },
    { method: 'POST', path: '/messages/random', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Random.' },
    { method: 'GET', path: '/messages/render', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Render.' },
    { method: 'POST', path: '/messages/render', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Render.' },
    { method: 'GET', path: '/messages/send', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Send.' },
    { method: 'POST', path: '/messages/send', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Send.' },
    { method: 'POST', path: '/messages/scheduler/start', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Scheduler Start.' },
    { method: 'POST', path: '/messages/scheduler/stop', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Scheduler Stop.' },
    { method: 'GET', path: '/messages/scheduler/status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Scheduler Status.' }
  ];

  return {
    ok: true,
    module: 'messages',
    version: 1,
    standardPrefix: '/api/messages',
    legacyPrefixes: ['/messages'],
    standardEndpoints: {
      status: '/api/messages/status',
      config: '/api/messages/config',
      settings: '/api/messages/settings',
      routes: '/api/messages/routes',
      integrationCheck: '/api/messages/integration-check',
      reload: '/api/messages/reload'
    },
    routes: routeList,
    count: routeList.length,
    categories: Array.from(new Set(routeList.map(route => route.category))).sort(),
    notes: [
      'Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.',
      'Bestehende Legacy-Routen bleiben erhalten.',
      'Schreibende Routen sind nur dokumentiert, nicht neu angelegt.',
      '/api/messages/config und /api/messages/settings sind read-only Standard-Aliase.'
    ],
    security: req ? security.securitySummary(req) : security.securitySummary()
  };
}

function buildMessagesConfig() {
  const statusInfo = getMessagesStatusSafe();
  return {
    ok: statusInfo.ok,
    module: 'messages',
    config: {
      source: 'helper_texts_status',
      scheduler: schedulerStatus(),
      statusError: statusInfo.error
    },
    status: statusInfo.status,
    error: statusInfo.error
  };
}

function buildMessagesSettings() {
  const statusInfo = getMessagesStatusSafe();
  return {
    ok: statusInfo.ok,
    module: 'messages',
    settings: {
      source: 'runtime_and_helper_status',
      scheduler: schedulerStatus(),
      cooldownEntries: cooldownState.size,
      statusError: statusInfo.error
    },
    status: statusInfo.status,
    error: statusInfo.error
  };
}

function buildMessagesIntegrationCheck() {
  const warnings = [];
  const errors = [];

  const statusInfo = getMessagesStatusSafe();
  const status = statusInfo.status || {};

  if (!statusInfo.ok) errors.push(`textHelperStatus:${statusInfo.error}`);

  const pathChecks = {};
  for (const item of extractPossiblePaths(status)) {
    pathChecks[item.label] = fileCheck(item.label, item.path);
    if (!pathChecks[item.label].ok) warnings.push(`${item.label}:${pathChecks[item.label].error}`);
  }

  const sampleKeys = ['follow_reminder', 'discord_reminder', 'youtube_reminder'];
  const sampleResults = {};
  for (const key of sampleKeys) {
    sampleResults[key] = safeCall(key, () => textHelper.buildChatResult(key, {}, { target: 'twitch_chat' }), null);
    if (!sampleResults[key].ok) warnings.push(`sample:${key}:${sampleResults[key].error}`);
  }

  const messageCounts = {
    keys: countStatusCollection(status.keys),
    messages: countStatusCollection(status.messages),
    categories: countStatusCollection(status.categories),
    files: Object.keys(pathChecks).length
  };

  return {
    ok: errors.length === 0,
    module: 'messages',
    version: 1,
    healthy: errors.length === 0,
    warnings,
    errors,
    checks: {
      status: {
        ok: statusInfo.ok,
        error: statusInfo.error,
        keys: Object.keys(status || {})
      },
      files: pathChecks,
      scheduler: {
        ok: true,
        state: schedulerStatus()
      },
      cooldown: {
        ok: true,
        entries: cooldownState.size
      },
      samples: sampleResults,
      counts: messageCounts
    },
    routes: {
      status: '/api/messages/status',
      config: '/api/messages/config',
      settings: '/api/messages/settings',
      routes: '/api/messages/routes',
      integrationCheck: '/api/messages/integration-check',
      reload: '/api/messages/reload'
    },
    notes: [
      'Read-only Integration-Check für Dashboard-/Modul-Standardisierung.',
      'Es werden keine DB-, JSON- oder Dateiänderungen vorgenommen.',
      'Warnungen bei Sample-Keys bedeuten nur, dass einzelne Beispiel-Message-Keys fehlen oder anders heißen.'
    ]
  };
}

function handleConfig(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
  return res.json(buildMessagesConfig());
}

function handleSettings(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
  return res.json(buildMessagesSettings());
}

function handleRoutes(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);
  return res.json(buildMessagesRoutes(req));
}

function handleIntegrationCheck(req, res) {
  const auth = checkAuth(req);
  if (!auth.ok) return reply(req, res, { ok: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

  try {
    return res.json(buildMessagesIntegrationCheck());
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: 'messages',
      healthy: false,
      warnings: [],
      errors: [err?.message || String(err)]
    });
  }
}



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

  routes.registerGet(app, ['/messages/config', '/api/messages/config'], handleConfig);
  routes.registerGet(app, ['/messages/settings', '/api/messages/settings'], handleSettings);
  routes.registerGet(app, ['/messages/routes', '/api/messages/routes'], handleRoutes);
  routes.registerGet(app, ['/messages/integration-check', '/api/messages/integration-check'], handleIntegrationCheck);

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
