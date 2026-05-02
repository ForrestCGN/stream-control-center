const path = require('path');
const axios = require('axios');
const WebSocket = require('ws');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');

let twitchPresenceService = null;

module.exports.sendChatMessage = async function sendChatMessage(message, options = {}) {
  if (!twitchPresenceService || typeof twitchPresenceService.sendChatMessage !== 'function') {
    return { ok: false, error: 'twitch_presence_not_initialized' };
  }
  return twitchPresenceService.sendChatMessage(message, options);
};

module.exports.getPresenceStatus = function getPresenceStatus() {
  if (!twitchPresenceService || typeof twitchPresenceService.getStatus !== 'function') {
    return { ok: false, error: 'twitch_presence_not_initialized' };
  }
  return twitchPresenceService.getStatus();
};

module.exports.init = function init(ctx) {
  const { app, env } = ctx;

  const baseRoot = ctx.paths?.rootDir || path.join(__dirname, '..');

  const BOT_USERNAME = (env.TWITCH_BOT_USERNAME || '').toString().trim().toLowerCase();
  const BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL || '').toString().trim().toLowerCase();
  const BOT_CLIENT_ID = (env.TWITCH_BOT_CLIENT_ID || '').toString().trim();
  const BOT_CLIENT_SECRET = (env.TWITCH_BOT_CLIENT_SECRET || '').toString().trim();
  const SEND_JOIN_MESSAGE = /^(1|true|yes|on)$/i.test((env.TWITCH_BOT_SEND_JOIN_MESSAGE || '').toString().trim());
  const JOIN_MESSAGE = (env.TWITCH_BOT_JOIN_MESSAGE || '').toString();

  let defaultBotStorePath = path.join(baseRoot, 'tokens', 'twitch_bot_user.json');
  if (env.TWITCH_BOT_TOKEN_STORE) {
    defaultBotStorePath = path.isAbsolute(env.TWITCH_BOT_TOKEN_STORE)
      ? env.TWITCH_BOT_TOKEN_STORE
      : path.join(baseRoot, env.TWITCH_BOT_TOKEN_STORE);
  }
  const BOT_TOKEN_STORE = defaultBotStorePath;

  function readJSON(file, fallback = null) {
    try {
      return core.readJson(file, fallback);
    } catch (e) {
      console.warn('[twitch_presence] readJSON error:', e?.message || e);
      return fallback;
    }
  }

  function writeJSON(file, obj) {
    try {
      core.writeJson(file, obj);
      return true;
    } catch (e) {
      console.warn('[twitch_presence] writeJSON error:', e?.message || e);
      return false;
    }
  }

  const epoch = () => Math.floor(Date.now() / 1000);

  async function refreshBotTokens(refreshToken) {
    const params = {
      client_id: BOT_CLIENT_ID,
      client_secret: BOT_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };

    const r = await axios.post('https://id.twitch.tv/oauth2/token', null, { params });
    const now = epoch();

    return {
      access_token: r.data.access_token,
      refresh_token: r.data.refresh_token || refreshToken,
      expires_at: now + Number(r.data.expires_in || 0)
    };
  }

  function getStoredBotToken() {
    const d = readJSON(BOT_TOKEN_STORE, null);
    if (!d || !d.access_token) return null;
    return d;
  }

  async function getBotAccessTokenWithRefresh() {
    const s = getStoredBotToken();
    if (!s) return null;

    const now = epoch();
    if (s.expires_at && now < s.expires_at - 60) return s.access_token;

    if (s.refresh_token) {
      const upd = await refreshBotTokens(s.refresh_token);
      writeJSON(BOT_TOKEN_STORE, upd);
      return upd.access_token;
    }

    return s.access_token || null;
  }

  let ws = null;
  let reconnectTimer = null;
  let pingTimer = null;
  let desiredActive = false;
  let connected = false;
  let authenticated = false;
  let joined = false;
  let connecting = false;
  let reconnecting = false;
  let lastError = null;
  let lastClose = null;
  let startedAt = null;
  let lastJoinAt = null;
  let lastPongAt = null;
  let currentAccessTokenPreview = null;
  let joinMessageSentForSession = false;
  let lastJoinMessageAt = null;
  let lastChatMessageAt = null;
  let lastChatMessagePreview = null;
  let chatMessageSendCount = 0;

  function cleanupTimers() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }

  function resetStateForSocketClose() {
    connected = false;
    authenticated = false;
    joined = false;
    connecting = false;
  }

  function scheduleReconnect(reason) {
    if (!desiredActive) return;
    if (reconnectTimer) return;

    reconnecting = true;
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      try {
        await startConnectionInternal(`reconnect:${reason || 'unknown'}`);
      } catch (e) {
        lastError = e?.message || String(e);
        scheduleReconnect('retry-after-failure');
      }
    }, 3000);
  }

  function startPingLoop() {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send('PING :tmi.twitch.tv');
        }
      } catch (e) {
        lastError = e?.message || String(e);
      }
    }, 4 * 60 * 1000);
  }

  function safeCloseSocket() {
    try {
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close(1000, 'normal');
          } else {
            ws.terminate();
          }
        } catch {}
      }
    } finally {
      ws = null;
    }
  }

  function maybeSendJoinMessage(socket, trigger) {
    if (!SEND_JOIN_MESSAGE) return;
    if (!JOIN_MESSAGE) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (joinMessageSentForSession) return;
    if (typeof trigger === 'string' && trigger.startsWith('reconnect:')) return;

    try {
      socket.send(`PRIVMSG #${BOT_CHANNEL} :${JOIN_MESSAGE}`);
      joinMessageSentForSession = true;
      lastJoinMessageAt = core.nowIso();
    } catch (e) {
      lastError = e?.message || String(e);
    }
  }

  function sanitizeOutgoingChatMessage(message) {
    let text = String(message || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 450) text = text.slice(0, 447).trimEnd() + '...';
    return text;
  }

  async function sendChatMessageInternal(message, options = {}) {
    const text = sanitizeOutgoingChatMessage(message);
    const trigger = String(options.trigger || 'internal');

    if (!text) {
      return { ok: false, error: 'empty_message', trigger };
    }
    if (!BOT_CHANNEL) {
      return { ok: false, error: 'missing_channel', trigger };
    }
    if (!ws || ws.readyState !== WebSocket.OPEN || !connected || !joined) {
      return {
        ok: false,
        error: 'twitch_chat_not_connected',
        trigger,
        desiredActive,
        connected,
        authenticated,
        joined
      };
    }

    try {
      ws.send(`PRIVMSG #${BOT_CHANNEL} :${text}`);
      lastChatMessageAt = core.nowIso();
      lastChatMessagePreview = text.length > 120 ? text.slice(0, 117) + '...' : text;
      chatMessageSendCount += 1;
      return {
        ok: true,
        trigger,
        channel: BOT_CHANNEL,
        bot_username: BOT_USERNAME,
        sent_at: lastChatMessageAt,
        message_preview: lastChatMessagePreview,
        send_count: chatMessageSendCount
      };
    } catch (e) {
      lastError = e?.message || String(e);
      return { ok: false, error: lastError, trigger };
    }
  }

  async function startConnectionInternal(trigger = 'manual') {
    if (!BOT_USERNAME || !BOT_CHANNEL) {
      throw new Error('Missing TWITCH_BOT_USERNAME or TWITCH_BOT_CHANNEL in .env');
    }
    if (!BOT_CLIENT_ID || !BOT_CLIENT_SECRET) {
      throw new Error('Missing TWITCH_BOT_CLIENT_ID or TWITCH_BOT_CLIENT_SECRET in .env');
    }
    if (connecting) {
      return { ok: true, alreadyConnecting: true };
    }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return {
        ok: true,
        alreadyRunning: true,
        connected,
        authenticated,
        joined
      };
    }

    desiredActive = true;
    connecting = true;
    reconnecting = false;
    lastError = null;

    const accessToken = await getBotAccessTokenWithRefresh();
    if (!accessToken) {
      connecting = false;
      throw new Error('No bot access token available. Run /auth/bot/login first.');
    }

    currentAccessTokenPreview = accessToken.slice(0, 6) + '...';

    return await new Promise((resolve, reject) => {
      let settled = false;
      const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      ws = socket;

      const fail = (err) => {
        if (settled) return;
        settled = true;
        connecting = false;
        const msg = err?.message || String(err);
        lastError = msg;
        try { socket.close(); } catch {}
        reject(new Error(msg));
      };

      socket.on('open', () => {
        connected = true;
        startedAt = startedAt || core.nowIso();

        try {
          socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags twitch.tv/membership');
          socket.send(`PASS oauth:${accessToken}`);
          socket.send(`NICK ${BOT_USERNAME}`);
          socket.send(`JOIN #${BOT_CHANNEL}`);
          startPingLoop();
        } catch (e) {
          fail(e);
        }
      });

      socket.on('message', (raw) => {
        const text = raw.toString();
        const lines = text.split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('PING')) {
            try {
              socket.send(line.replace('PING', 'PONG'));
              lastPongAt = core.nowIso();
            } catch (e) {
              lastError = e?.message || String(e);
            }
            continue;
          }

          if (line.includes('Login authentication failed')) {
            fail(new Error('Twitch IRC authentication failed')); 
            return;
          }

          if (line.includes('Welcome, GLHF!')) {
            authenticated = true;
          }

          if (line.includes(` JOIN #${BOT_CHANNEL}`) || line.includes(` JOIN #${BOT_CHANNEL.toLowerCase()}`)) {
            joined = true;
            lastJoinAt = core.nowIso();
            connecting = false;
            reconnecting = false;
            maybeSendJoinMessage(socket, trigger);
            if (!settled) {
              settled = true;
              resolve({ ok: true, connected: true, joined: true, authenticated: true, trigger });
            }
          }

          if (line.includes(` 366 ${BOT_USERNAME} #${BOT_CHANNEL} `)) {
            joined = true;
            lastJoinAt = core.nowIso();
            connecting = false;
            reconnecting = false;
            maybeSendJoinMessage(socket, trigger);
            if (!settled) {
              settled = true;
              resolve({ ok: true, connected: true, joined: true, authenticated: true, trigger });
            }
          }
        }
      });

      socket.on('close', (code, reason) => {
        lastClose = {
          code,
          reason: reason?.toString?.() || '',
          at: core.nowIso()
        };
        cleanupTimers();
        ws = null;
        const wasDesired = desiredActive;
        resetStateForSocketClose();

        if (!settled) {
          settled = true;
          reject(new Error(`Twitch IRC socket closed before join (${code}) ${lastClose.reason || ''}`.trim()));
        }

        if (wasDesired) {
          scheduleReconnect(`close:${code}`);
        }
      });

      socket.on('error', (err) => {
        lastError = err?.message || String(err);
        if (!settled) {
          fail(err);
        }
      });
    });
  }

  async function stopConnectionInternal(trigger = 'manual') {
    desiredActive = false;
    reconnecting = false;
    joinMessageSentForSession = false;
    cleanupTimers();

    if (!ws) {
      resetStateForSocketClose();
      return { ok: true, alreadyStopped: true, trigger };
    }

    try {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(`PART #${BOT_CHANNEL}`); } catch {}
      }
    } finally {
      safeCloseSocket();
      resetStateForSocketClose();
    }

    return { ok: true, stopped: true, trigger };
  }

  async function handlePresenceStart(req, res) {
    try {
      const result = await startConnectionInternal('http-start');
      res.json({
        ok: true,
        ...result,
        desiredActive,
        bot_username: BOT_USERNAME,
        channel: BOT_CHANNEL
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  async function handlePresenceStop(req, res) {
    try {
      const result = await stopConnectionInternal('http-stop');
      res.json({
        ok: true,
        ...result,
        desiredActive,
        bot_username: BOT_USERNAME,
        channel: BOT_CHANNEL
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  async function handlePresenceSend(req, res) {
    try {
      const message = core.getParam(req, 'message', '');
      const result = await sendChatMessageInternal(message, { trigger: 'http-send' });
      const status = result.ok ? 200 : (result.error === 'empty_message' ? 400 : 409);
      res.status(status).json(result);
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  function buildPresenceStatus() {
    const tokenData = getStoredBotToken();
    const now = epoch();

    return {
      ok: true,
      desiredActive,
      connecting,
      reconnecting,
      connected,
      authenticated,
      joined,
      bot_username: BOT_USERNAME,
      channel: BOT_CHANNEL,
      token_store: BOT_TOKEN_STORE,
      token_present: !!tokenData,
      token_expires_at: tokenData?.expires_at || null,
      token_expires_in: tokenData?.expires_at ? tokenData.expires_at - now : null,
      has_refresh: !!tokenData?.refresh_token,
      access_token_preview: currentAccessTokenPreview,
      started_at: startedAt,
      last_join_at: lastJoinAt,
      last_join_message_at: lastJoinMessageAt,
      join_message_enabled: SEND_JOIN_MESSAGE,
      join_message_sent_for_session: joinMessageSentForSession,
      last_chat_message_at: lastChatMessageAt,
      last_chat_message_preview: lastChatMessagePreview,
      chat_message_send_count: chatMessageSendCount,
      last_pong_at: lastPongAt,
      last_close: lastClose,
      last_error: lastError
    };
  }

  function handlePresenceStatus(req, res) {
    res.json(buildPresenceStatus());
  }

  routes.registerGet(app, ['/twitch/presence/start', '/api/twitch/presence/start'], handlePresenceStart);
  routes.registerGet(app, ['/twitch/presence/stop', '/api/twitch/presence/stop'], handlePresenceStop);
  routes.registerGet(app, ['/twitch/presence/status', '/api/twitch/presence/status'], handlePresenceStatus);
  routes.registerGet(app, ['/twitch/presence/send', '/api/twitch/presence/send'], handlePresenceSend);
  routes.registerPost(app, ['/twitch/presence/send', '/api/twitch/presence/send'], handlePresenceSend);

  twitchPresenceService = {
    sendChatMessage: sendChatMessageInternal,
    getStatus: buildPresenceStatus
  };

  console.log('[twitch_presence] routes active: /twitch/presence/start, /twitch/presence/stop, /twitch/presence/status, /twitch/presence/send, /api/twitch/presence/start, /api/twitch/presence/stop, /api/twitch/presence/status, /api/twitch/presence/send');
};
