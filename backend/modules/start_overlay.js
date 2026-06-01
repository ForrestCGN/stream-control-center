'use strict';

const core = require('./helpers/helper_core');
const configHelper = require('./helpers/helper_config');
const routes = require('./helpers/helper_routes');
const messageHelper = require('./helpers/helper_messages');
const textHelper = require('./helpers/helper_texts');

const MODULE_NAME = 'start_overlay';
const VERSION = '0.3.0';
const MODULE_VERSION = VERSION;
const MODULE_BUILD = 'step278-meta';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'overlay',
  description: 'Start overlay configuration, chat snapshot and rotator endpoints.',
  routesPrefix: ['/api/overlay/start'],
  bus: { registered: false, heartbeat: false, emits: [], listens: [] },
  legacy: false
};

const DEFAULT_CONFIG = {
  enabled: true,
  websocket: {
    enabled: true,
    configEventOp: 'start_overlay_config',
    chatMessageOp: 'start_chat_message',
    chatSnapshotOp: 'start_chat_snapshot',
    chatClearOp: 'start_chat_clear'
  },
  chat: {
    enabled: true,
    maxMessages: 6,
    maxStoredMessages: 40,
    maxTextLength: 500,
    allowEmptyMessages: false,
    ignoreUsers: [
      'streamelements',
      'streamlabs',
      'nightbot'
    ],
    fallbackLabel: 'Fallback / wartet auf WebSocket',
    liveLabel: 'Live über WebSocket'
  },
  leftRotator: {
    enabled: true,
    mode: 'random',
    intervalMs: 300000,
    demoFastIntervalMs: 12000
  },
  // Legacy-Alias, damit ältere Test-Overlays nicht brechen.
  rightRotator: {
    enabled: true,
    mode: 'random',
    intervalMs: 300000,
    demoFastIntervalMs: 12000
  }
};

const DEFAULT_MESSAGES = {
  _meta: {
    description: 'Texte und Hinweis-Karten für das Start-Overlay V2 / Neon Galaxy.'
  },
  leftRotatorMessages: [
    {
      icon: '🔔',
      title: 'Folgen lohnt sich',
      text: 'Dann verpasst du keinen Stream mehr.'
    },
    {
      icon: '▶',
      title: 'YouTube Highlights',
      text: 'Clips und Highlights findet ihr auch später auf YouTube.'
    },
    {
      icon: '💬',
      title: 'Discord',
      text: 'Komm gern in die Community und bleib auf dem Laufenden.'
    },
    {
      icon: '♡',
      title: 'Bleibt legendär',
      text: 'Danke fürs Zuschauen und Unterstützen.'
    }
  ],
  fallbackChatMessages: [
    {
      user: 'ForrestCGN',
      text: 'Willkommen im Stream 💜'
    },
    {
      user: 'EngelCGN',
      text: 'Gleich geht es los.'
    },
    {
      user: 'HeimaufsichtCGN',
      text: 'Bitte langsam reinrollen. Rentner-Tempo.'
    }
  ]
};

function init(ctx) {
  const { app, wss, broadcastWS } = ctx;

  const state = {
    module: MODULE_NAME,
    version: VERSION,
    config: DEFAULT_CONFIG,
    messages: DEFAULT_MESSAGES,
    chat: [],
    startedAt: core.nowIso(),
    updatedAt: core.nowIso()
  };

  function configFilePath() {
    return configHelper.resolveConfigFile('start_overlay.json');
  }

  function messagesFilePath() {
    return configHelper.resolveFromConfig('messages', 'start_overlay.json');
  }

  function ensureMessagesFile() {
    const file = messagesFilePath();
    if (!core.fileExists(file)) {
      core.writeJson(file, DEFAULT_MESSAGES, { spaces: 2 });
    }
    return file;
  }

  function normalizeRotatorMessages(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .map((item) => {
        if (typeof item === 'string') {
          return {
            icon: '💜',
            title: 'Hinweis',
            text: messageHelper.sanitizeChatMessage(item, 220)
          };
        }

        if (!item || typeof item !== 'object') return null;

        const icon = messageHelper.sanitizeChatMessage(item.icon || '💜', 12) || '💜';
        const title = messageHelper.sanitizeChatMessage(item.title || 'Hinweis', 80) || 'Hinweis';
        const text = messageHelper.sanitizeChatMessage(item.text || item.message || '', 240);

        if (!text && !title) return null;
        return { icon, title, text };
      })
      .filter(Boolean);
  }

  function normalizeFallbackChatMessages(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const user = messageHelper.sanitizeChatMessage(item.user || item.displayName || item.login || 'Chat', 48) || 'Chat';
        const text = messageHelper.sanitizeChatMessage(item.text || item.message || '', state.config.chat.maxTextLength || 180);
        if (!text) return null;
        return { user, text };
      })
      .filter(Boolean);
  }

  function loadRuntime() {
    const loadedConfig = configHelper.loadConfig('start_overlay.json', DEFAULT_CONFIG, {
      createIfMissing: true,
      mergeDefaults: true,
      spaces: 2
    });

    state.config = loadedConfig.config || DEFAULT_CONFIG;

    ensureMessagesFile();
    const loadedMessages = core.readJson(messagesFilePath(), DEFAULT_MESSAGES) || DEFAULT_MESSAGES;
    const leftRotatorMessages = normalizeRotatorMessages(loadedMessages.leftRotatorMessages || loadedMessages.rightRotatorMessages);
    const fallbackChatMessages = normalizeFallbackChatMessages(loadedMessages.fallbackChatMessages);

    state.messages = {
      ...DEFAULT_MESSAGES,
      ...loadedMessages,
      leftRotatorMessages: leftRotatorMessages.length ? leftRotatorMessages : DEFAULT_MESSAGES.leftRotatorMessages,
      rightRotatorMessages: leftRotatorMessages.length ? leftRotatorMessages : DEFAULT_MESSAGES.leftRotatorMessages,
      fallbackChatMessages: fallbackChatMessages.length ? fallbackChatMessages : DEFAULT_MESSAGES.fallbackChatMessages
    };

    try {
      textHelper.reload();
    } catch (_) {}

    state.updatedAt = core.nowIso();
    return publicStatus();
  }

  function isIgnoredUser(loginOrName) {
    const value = String(loginOrName || '').trim().toLowerCase();
    if (!value) return false;
    const ignored = Array.isArray(state.config.chat?.ignoreUsers) ? state.config.chat.ignoreUsers : [];
    return ignored.map((item) => String(item || '').trim().toLowerCase()).includes(value);
  }

  function bodyOrQuery(req, key, fallback = '') {
    return core.getParam(req, key, fallback);
  }

  function pickRequestValue(req, keys, fallback = '') {
    for (const key of keys) {
      const value = bodyOrQuery(req, key, '');
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return fallback;
  }


  function normalizeChatSegments(value) {
    const list = Array.isArray(value) ? value : [];
    const clean = [];

    for (const segment of list) {
      if (!segment || typeof segment !== 'object') continue;
      const type = String(segment.type || 'text').trim().toLowerCase();

      if (type === 'emote') {
        const name = messageHelper.sanitizeChatMessage(segment.name || segment.text || '', 80);
        const url = String(segment.url || '').trim();
        const id = messageHelper.sanitizeChatMessage(segment.id || '', 80);

        if (!name || !url) continue;

        clean.push({
          type: 'emote',
          id,
          name,
          url
        });
        continue;
      }

      const text = messageHelper.sanitizeChatMessage(segment.text || segment.value || '', state.config.chat.maxTextLength || 500);
      if (text) clean.push({ type: 'text', text });
    }

    return clean;
  }

  function normalizeChatItem(input = {}) {
    const maxTextLength = Number(state.config.chat?.maxTextLength || 500);

    const login = messageHelper.sanitizeChatMessage(
      input.login || input.userName || input.username || '',
      48
    );

    const displayName = messageHelper.sanitizeChatMessage(
      input.user || input.displayName || input.display_name || input.display || login || 'Chat',
      48
    ) || 'Chat';

    const rawText = input.text || input.message || input.rawInput || input.input || '';
    const text = messageHelper.sanitizeChatMessage(rawText, maxTextLength);

    return {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      user: displayName,
      login,
      text,
      source: input.source || 'streamerbot',
      segments: normalizeChatSegments(input.segments),
      createdAt: core.nowIso()
    };
  }

  function addChatMessage(input) {
    if (state.config.enabled === false || state.config.chat?.enabled === false) {
      return { ok: false, skipped: true, reason: 'disabled' };
    }

    const item = normalizeChatItem(input);
    if (!item.segments || item.segments.length === 0) item.segments = item.text ? [{ type: 'text', text: item.text }] : [];

    if (!item.text && state.config.chat?.allowEmptyMessages !== true) {
      return { ok: false, skipped: true, reason: 'empty_message' };
    }

    if (isIgnoredUser(item.login) || isIgnoredUser(item.user)) {
      return { ok: false, skipped: true, reason: 'ignored_user', item };
    }

    const maxStored = Math.max(
      Number(state.config.chat?.maxStoredMessages || 40),
      Number(state.config.chat?.maxMessages || 4)
    );

    state.chat.push(item);
    if (state.chat.length > maxStored) state.chat = state.chat.slice(-maxStored);
    state.updatedAt = core.nowIso();

    broadcast({
      op: state.config.websocket?.chatMessageOp || 'start_chat_message',
      item,
      data: item,
      ts: state.updatedAt
    });

    return { ok: true, item };
  }

  function clearChat() {
    state.chat = [];
    state.updatedAt = core.nowIso();

    broadcast({
      op: state.config.websocket?.chatClearOp || 'start_chat_clear',
      ts: state.updatedAt
    });

    return true;
  }

  function publicChatSnapshot() {
    const max = Number(state.config.chat?.maxMessages || 6);
    return state.chat.slice(-max).map((item) => ({ ...item }));
  }

  function publicConfig() {
    return {
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      enabled: state.config.enabled !== false,
      configPath: configFilePath(),
      messagesPath: messagesFilePath(),
      websocket: {
        enabled: state.config.websocket?.enabled !== false,
        configEventOp: state.config.websocket?.configEventOp || 'start_overlay_config',
        chatMessageOp: state.config.websocket?.chatMessageOp || 'start_chat_message',
        chatSnapshotOp: state.config.websocket?.chatSnapshotOp || 'start_chat_snapshot',
        chatClearOp: state.config.websocket?.chatClearOp || 'start_chat_clear'
      },
      chat: {
        enabled: state.config.chat?.enabled !== false,
        maxMessages: Number(state.config.chat?.maxMessages || 6),
        maxTextLength: Number(state.config.chat?.maxTextLength || 500),
        fallbackLabel: state.config.chat?.fallbackLabel || 'Fallback / wartet auf WebSocket',
        liveLabel: state.config.chat?.liveLabel || 'Live über WebSocket',
        fallbackMessages: normalizeFallbackChatMessages(state.messages.fallbackChatMessages)
      },
      leftRotator: {
        enabled: (state.config.leftRotator || state.config.rightRotator)?.enabled !== false,
        mode: (state.config.leftRotator || state.config.rightRotator)?.mode || 'random',
        intervalMs: Number((state.config.leftRotator || state.config.rightRotator)?.intervalMs || 300000),
        demoFastIntervalMs: Number((state.config.leftRotator || state.config.rightRotator)?.demoFastIntervalMs || 12000),
        messages: normalizeRotatorMessages(state.messages.leftRotatorMessages || state.messages.rightRotatorMessages)
      },
      // Legacy-Alias für ältere Test-Overlays.
      rightRotator: {
        enabled: (state.config.leftRotator || state.config.rightRotator)?.enabled !== false,
        mode: (state.config.leftRotator || state.config.rightRotator)?.mode || 'random',
        intervalMs: Number((state.config.leftRotator || state.config.rightRotator)?.intervalMs || 300000),
        demoFastIntervalMs: Number((state.config.leftRotator || state.config.rightRotator)?.demoFastIntervalMs || 12000),
        messages: normalizeRotatorMessages(state.messages.leftRotatorMessages || state.messages.rightRotatorMessages)
      },
      updatedAt: state.updatedAt
    };
  }

  function publicStatus() {
    return {
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      enabled: state.config.enabled !== false,
      startedAt: state.startedAt,
      updatedAt: state.updatedAt,
      chatCount: state.chat.length,
      chat: publicChatSnapshot(),
      configPath: configFilePath(),
      messagesPath: messagesFilePath()
    };
  }

  function broadcast(payload) {
    if (state.config.websocket?.enabled === false) return false;
    if (typeof broadcastWS !== 'function') return false;
    broadcastWS(payload);
    return true;
  }

  function sendOverlayBootstrap(ws) {
    if (!ws || ws.readyState !== 1) return;

    try {
      ws.send(JSON.stringify({
        op: state.config.websocket?.configEventOp || 'start_overlay_config',
        data: publicConfig(),
        ts: core.nowIso()
      }));

      ws.send(JSON.stringify({
        op: state.config.websocket?.chatSnapshotOp || 'start_chat_snapshot',
        items: publicChatSnapshot(),
        ts: core.nowIso()
      }));
    } catch (_) {}
  }

  function attachWebSocketListener() {
    if (!wss || typeof wss.on !== 'function') return;

    wss.on('connection', (ws) => {
      ws.on('message', (raw) => {
        let msg = null;
        try {
          msg = JSON.parse(String(raw || ''));
        } catch (_) {
          return;
        }

        if (!msg || typeof msg !== 'object') return;
        if (msg.op !== 'overlay_hello') return;
        if (msg.overlay && msg.overlay !== 'start') return;

        sendOverlayBootstrap(ws);
      });
    });
  }

  function handleChat(req, res) {
    const result = addChatMessage({
      user: pickRequestValue(req, ['user', 'displayName', 'display_name', 'display', 'actor', 'name'], ''),
      login: pickRequestValue(req, ['login', 'userName', 'username', 'userLogin'], ''),
      text: pickRequestValue(req, ['text', 'message', 'rawInput', 'input', 'body'], ''),
      source: pickRequestValue(req, ['source'], 'streamerbot'),
      segments: req.body && Array.isArray(req.body.segments) ? req.body.segments : []
    });

    if (result.ok) {
      return core.sendOk(res, {
        module: MODULE_NAME,
        item: result.item,
        chatCount: state.chat.length
      });
    }

    return core.sendOk(res, {
      module: MODULE_NAME,
      skipped: true,
      reason: result.reason || 'skipped',
      item: result.item || null
    }, 'skipped');
  }

  function handleClear(req, res) {
    clearChat();
    return core.sendOk(res, {
      module: MODULE_NAME,
      chatCount: 0
    });
  }

  function handleReload(req, res) {
    const status = loadRuntime();
    broadcast({
      op: state.config.websocket?.configEventOp || 'start_overlay_config',
      data: publicConfig(),
      ts: core.nowIso()
    });

    return core.sendOk(res, {
      module: MODULE_NAME,
      status,
      config: publicConfig()
    });
  }

  loadRuntime();
  attachWebSocketListener();

  routes.registerGet(app, '/api/overlay/start/status', (req, res) => {
    return core.sendOk(res, publicStatus());
  });

  routes.registerGet(app, '/api/overlay/start/config', (req, res) => {
    return res.json(publicConfig());
  });

  routes.registerGet(app, '/api/overlay/start-chat', handleChat);
  routes.registerPost(app, '/api/overlay/start-chat', handleChat);

  routes.registerGet(app, '/api/overlay/start-chat/clear', handleClear);
  routes.registerPost(app, '/api/overlay/start-chat/clear', handleClear);

  routes.registerGet(app, '/api/overlay/start/reload', handleReload);
  routes.registerPost(app, '/api/overlay/start/reload', handleReload);

  console.log(`[${MODULE_NAME}] aktiv → /api/overlay/start/*`);
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init };
