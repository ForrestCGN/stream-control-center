'use strict';

const path = require('path');
const WebSocket = require('ws');
const axios = require('axios');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const messageHelper = require('./helpers/helper_messages');

const MODULE_NAME = 'twitch_chat_overlay';
const VERSION = '0.5.0';

module.exports.init = function init(ctx) {
  const { app, env, broadcastWS, wss } = ctx;

  // Vorhandenes Twitch-OAuth-Modul nutzen, keine neue Auth-Parallelstruktur.
  let twitchAuth = null;
  try {
    twitchAuth = require('./twitch');
  } catch (_) {}

  const BOT_USERNAME = (env.TWITCH_BOT_USERNAME || '').toString().trim().toLowerCase();
  const BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL || '').toString().trim().replace(/^#/, '').toLowerCase();
  const ENABLED = /^(1|true|yes|on)$/i.test((env.START_OVERLAY_CHAT_IRC_ENABLED || 'true').toString().trim());
  const AUTO_CONNECT = /^(1|true|yes|on)$/i.test((env.START_OVERLAY_CHAT_IRC_AUTOCONNECT || 'true').toString().trim());
  const MAX_STORED = Math.max(10, Number(env.START_OVERLAY_CHAT_MAX_STORED || 60));
  const MAX_TEXT_LENGTH = Math.max(50, Number(env.START_OVERLAY_CHAT_MAX_TEXT_LENGTH || 500));
  const IGNORE_USERS = (env.START_OVERLAY_CHAT_IGNORE_USERS || 'streamelements,streamlabs,nightbot')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const TWITCH_CLIENT_ID = (env.TWITCH_BOT_CLIENT_ID || env.TWITCH_CLIENT_ID || '').toString().trim();
  const BROADCASTER_ID_ENV = (env.TWITCH_BROADCASTER_ID || '').toString().trim();
  const EMOTE_CACHE_TTL_MS = Math.max(60000, Number(env.START_OVERLAY_CHAT_EMOTE_CACHE_TTL_MS || 30 * 60 * 1000));

  const state = {
    module: MODULE_NAME,
    version: VERSION,
    enabled: ENABLED,
    desiredActive: false,
    connecting: false,
    connected: false,
    authenticated: false,
    joined: false,
    botUsername: BOT_USERNAME,
    channel: BOT_CHANNEL,
    startedAt: null,
    lastJoinAt: null,
    lastMessageAt: null,
    lastError: null,
    lastClose: null,
    reconnectTimer: null,
    pingTimer: null,
    ws: null,
    chat: [],
    emotes: {
      byName: new Map(),
      channelCount: 0,
      globalCount: 0,
      loadedAt: null,
      lastError: null,
      broadcasterId: BROADCASTER_ID_ENV || null
    },
    debug: {
      lastRawPrivmsg: null,
      lastEmoteTag: null,
      lastText: null,
      lastSegments: null,
      lastMatchedEmotes: [],
      lastUnmatchedTokens: []
    }
  };

  function isIgnoredUser(name) {
    const value = String(name || '').trim().toLowerCase();
    if (!value) return false;
    return IGNORE_USERS.includes(value);
  }

  function broadcast(payload) {
    if (typeof broadcastWS !== 'function') return false;
    broadcastWS(payload);
    return true;
  }

  function emoteUrl(id, scale = '2.0') {
    // default/light liefert animierte Twitch-Emotes, wenn Twitch Animation anbietet.
    return `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(id)}/default/light/${scale}`;
  }

  function normalizeEmoteName(name) {
    return String(name || '').trim();
  }

  function pickEmoteImage(item) {
    if (!item || typeof item !== 'object') return '';

    const id = item.id || '';
    if (id) return emoteUrl(id, '2.0');

    if (item.images?.url_2x) return item.images.url_2x;
    if (item.images?.url_4x) return item.images.url_4x;
    if (item.images?.url_1x) return item.images.url_1x;

    return '';
  }

  function storeEmote(item, source) {
    const name = normalizeEmoteName(item?.name);
    const id = String(item?.id || '').trim();
    const url = pickEmoteImage(item);

    if (!name || !url) return false;

    // Case-sensitive Name behalten, Lookup zusätzlich lower-case.
    const payload = {
      type: 'emote',
      source,
      id,
      name,
      url
    };

    state.emotes.byName.set(name, payload);
    state.emotes.byName.set(name.toLowerCase(), payload);
    return true;
  }

  async function getBotAccessToken() {
    if (!twitchAuth || typeof twitchAuth.getBotAccessTokenWithRefresh !== 'function') {
      throw new Error('twitch_auth_helper_unavailable');
    }
    const token = await twitchAuth.getBotAccessTokenWithRefresh();
    if (!token) throw new Error('no_bot_token_available_run_auth_bot_login');
    return token;
  }

  async function resolveBroadcasterId() {
    if (state.emotes.broadcasterId) return state.emotes.broadcasterId;

    if (BROADCASTER_ID_ENV) {
      state.emotes.broadcasterId = BROADCASTER_ID_ENV;
      return state.emotes.broadcasterId;
    }

    if (!BOT_CHANNEL) return '';

    if (twitchAuth && typeof twitchAuth.resolveUserByLogin === 'function') {
      const user = await twitchAuth.resolveUserByLogin(BOT_CHANNEL);
      if (user?.userId) {
        state.emotes.broadcasterId = String(user.userId);
        return state.emotes.broadcasterId;
      }
    }

    return '';
  }

  async function helixGet(pathname, params = {}) {
    const token = await getBotAccessToken();
    if (!TWITCH_CLIENT_ID) throw new Error('missing_twitch_client_id');

    const url = new URL(`https://api.twitch.tv/helix${pathname}`);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await axios.get(url.toString(), {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });

    return response.data || {};
  }

  async function loadTwitchEmotes(force = false) {
    const now = Date.now();

    if (
      !force &&
      state.emotes.loadedAt &&
      now - new Date(state.emotes.loadedAt).getTime() < EMOTE_CACHE_TTL_MS &&
      state.emotes.byName.size > 0
    ) {
      return publicEmoteStatus();
    }

    const broadcasterId = await resolveBroadcasterId();
    const nextMap = new Map();
    const prevMap = state.emotes.byName;
    state.emotes.byName = nextMap;

    let channelCount = 0;
    let globalCount = 0;

    try {
      if (broadcasterId) {
        const channel = await helixGet('/chat/emotes', { broadcaster_id: broadcasterId });
        const channelItems = Array.isArray(channel?.data) ? channel.data : [];
        channelItems.forEach(item => {
          if (storeEmote(item, 'channel')) channelCount++;
        });
      }

      const global = await helixGet('/chat/emotes/global', {});
      const globalItems = Array.isArray(global?.data) ? global.data : [];
      globalItems.forEach(item => {
        if (storeEmote(item, 'global')) globalCount++;
      });

      state.emotes.channelCount = channelCount;
      state.emotes.globalCount = globalCount;
      state.emotes.loadedAt = core.nowIso();
      state.emotes.lastError = null;
      state.emotes.broadcasterId = broadcasterId || null;

      console.log(`[${MODULE_NAME}] emotes loaded: channel=${channelCount}, global=${globalCount}, broadcasterId=${broadcasterId || '-'}`);

      return publicEmoteStatus();
    } catch (e) {
      state.emotes.byName = prevMap;
      state.emotes.lastError = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || String(e));
      console.warn(`[${MODULE_NAME}] emote load failed:`, state.emotes.lastError);
      return publicEmoteStatus();
    } finally {
      if (state.emotes.byName !== nextMap && nextMap.size === 0) {
        // already restored
      }
    }
  }

  function publicEmoteStatus() {
    return {
      ok: !state.emotes.lastError,
      loadedAt: state.emotes.loadedAt,
      lastError: state.emotes.lastError,
      broadcasterId: state.emotes.broadcasterId,
      channelCount: state.emotes.channelCount,
      globalCount: state.emotes.globalCount,
      totalLookupKeys: state.emotes.byName.size,
      cacheTtlMs: EMOTE_CACHE_TTL_MS
    };
  }

  function unescapeIrcTagValue(value) {
    return String(value || '')
      .replace(/\\s/g, ' ')
      .replace(/\\:/g, ';')
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\');
  }

  function parseTags(rawTags) {
    const tags = {};
    String(rawTags || '').split(';').forEach(pair => {
      const idx = pair.indexOf('=');
      if (idx === -1) {
        tags[pair] = true;
        return;
      }
      const key = pair.slice(0, idx);
      const value = pair.slice(idx + 1);
      tags[key] = unescapeIrcTagValue(value);
    });
    return tags;
  }

  function parseIrcLine(line) {
    let rest = String(line || '');
    let tags = {};

    if (rest.startsWith('@')) {
      const firstSpace = rest.indexOf(' ');
      if (firstSpace !== -1) {
        tags = parseTags(rest.slice(1, firstSpace));
        rest = rest.slice(firstSpace + 1);
      }
    }

    let prefix = '';
    if (rest.startsWith(':')) {
      const firstSpace = rest.indexOf(' ');
      if (firstSpace !== -1) {
        prefix = rest.slice(1, firstSpace);
        rest = rest.slice(firstSpace + 1);
      }
    }

    const parts = rest.split(' ');
    const command = parts[0] || '';
    const params = parts.slice(1);

    let message = '';
    const msgIndex = rest.indexOf(' :');
    if (msgIndex !== -1) message = rest.slice(msgIndex + 2);

    return { tags, prefix, command, params, message };
  }

  function loginFromPrefix(prefix) {
    const raw = String(prefix || '');
    const bang = raw.indexOf('!');
    return (bang === -1 ? raw : raw.slice(0, bang)).toLowerCase();
  }

  function parseEmoteTag(emoteTag, text) {
    const ranges = [];
    const raw = String(emoteTag || '').trim();
    if (!raw) return ranges;

    // Format: emoteId:start-end,start-end/emoteId:start-end
    raw.split('/').forEach(group => {
      const [id, positions] = group.split(':');
      if (!id || !positions) return;

      positions.split(',').forEach(pos => {
        const [startRaw, endRaw] = pos.split('-');
        const start = Number.parseInt(startRaw, 10);
        const end = Number.parseInt(endRaw, 10);
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) return;

        const name = text.slice(start, end + 1);
        if (!name) return;

        ranges.push({
          id: String(id),
          start,
          end,
          name,
          url: emoteUrl(id)
        });
      });
    });

    ranges.sort((a, b) => a.start - b.start || a.end - b.end);
    return ranges;
  }

  function buildSegmentsFromKnownNames(text) {
    const cleanText = messageHelper.sanitizeChatMessage(text, MAX_TEXT_LENGTH);
    if (!cleanText) return [];

    const parts = cleanText.split(/(\s+)/);
    const segments = [];
    const matched = [];
    const unmatched = [];

    for (const part of parts) {
      if (!part) continue;

      if (/^\s+$/.test(part)) {
        segments.push({ type: 'text', text: part });
        continue;
      }

      // Twitch-Emote-Namen können Zahlen, Buchstaben und _ enthalten.
      // Außenstehende Satzzeichen abtrennen, damit "Emote!" trotzdem erkannt wird.
      const match = part.match(/^([^A-Za-z0-9_]*)([A-Za-z0-9_]+)([^A-Za-z0-9_]*)$/);
      if (!match) {
        segments.push({ type: 'text', text: part });
        unmatched.push(part);
        continue;
      }

      const [, prefix, coreToken, suffix] = match;
      const emote = state.emotes.byName.get(coreToken) || state.emotes.byName.get(coreToken.toLowerCase());

      if (!emote) {
        segments.push({ type: 'text', text: part });
        unmatched.push(coreToken);
        continue;
      }

      matched.push({
        token: coreToken,
        name: emote.name,
        id: emote.id,
        source: emote.source || 'cache',
        url: emote.url
      });

      if (prefix) segments.push({ type: 'text', text: prefix });
      segments.push({
        type: 'emote',
        id: emote.id,
        name: emote.name,
        url: emote.url,
        source: emote.source || 'cache'
      });
      if (suffix) segments.push({ type: 'text', text: suffix });
    }

    state.debug.lastMatchedEmotes = matched;
    state.debug.lastUnmatchedTokens = unmatched.slice(0, 30);

    return segments.length ? segments : [{ type: 'text', text: cleanText }];
  }

  function buildSegments(text, emoteTag) {
    const cleanText = messageHelper.sanitizeChatMessage(text, MAX_TEXT_LENGTH);
    const ranges = parseEmoteTag(emoteTag, cleanText);

    // Wenn Twitch IRC echte Emote-Positionen liefert, nutzen wir die zuerst.
    if (ranges.length) {
      const segments = [];
      let cursor = 0;

      for (const range of ranges) {
        if (range.start < cursor) continue;

        if (range.start > cursor) {
          const before = cleanText.slice(cursor, range.start);
          if (before) segments.push({ type: 'text', text: before });
        }

        segments.push({
          type: 'emote',
          id: range.id,
          name: range.name,
          url: range.url,
          source: 'irc_tag'
        });

        cursor = range.end + 1;
      }

      if (cursor < cleanText.length) {
        const rest = cleanText.slice(cursor);
        if (rest) segments.push({ type: 'text', text: rest });
      }

      return segments.length ? segments : [{ type: 'text', text: cleanText }];
    }

    // Fallback: Channel-/Global-Emotes aus Helix-Cache per Name erkennen.
    return buildSegmentsFromKnownNames(cleanText);
  }

  function addChatItem(item) {
    if (!item || !item.text) return false;
    if (isIgnoredUser(item.login) || isIgnoredUser(item.user)) return false;

    state.chat.push(item);
    if (state.chat.length > MAX_STORED) state.chat = state.chat.slice(-MAX_STORED);
    state.lastMessageAt = item.createdAt;

    broadcast({
      op: 'start_chat_message',
      item,
      data: item,
      ts: core.nowIso()
    });

    return true;
  }

  function handlePrivmsg(parsed) {
    const tags = parsed.tags || {};
    const channel = String(parsed.params?.[0] || '').replace(/^#/, '').toLowerCase();
    if (BOT_CHANNEL && channel && channel !== BOT_CHANNEL) return;

    const login = (tags['login'] || loginFromPrefix(parsed.prefix) || '').toString().toLowerCase();
    const displayName = tags['display-name'] || login || 'Chat';
    const text = messageHelper.sanitizeChatMessage(parsed.message || '', MAX_TEXT_LENGTH);
    if (!text) return;

    const segments = buildSegments(text, tags.emotes || '');
    state.debug.lastSegments = segments;

    addChatItem({
      id: tags.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      user: displayName,
      login,
      text,
      segments,
      badges: tags.badges || '',
      color: tags.color || '',
      source: 'twitch_irc',
      createdAt: core.nowIso()
    });
  }


  function cleanupTimers() {
    if (state.pingTimer) {
      clearInterval(state.pingTimer);
      state.pingTimer = null;
    }
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }
  }

  function scheduleReconnect(reason) {
    if (!state.desiredActive) return;
    if (state.reconnectTimer) return;

    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = null;
      startConnection(`reconnect:${reason || 'unknown'}`).catch(err => {
        state.lastError = err?.message || String(err);
        scheduleReconnect('retry-after-error');
      });
    }, 3000);
  }

  function sendRaw(line) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(line);
      return true;
    }
    return false;
  }

  async function startConnection(trigger = 'manual') {
    if (!ENABLED) return { ok: false, error: 'disabled' };
    if (!BOT_USERNAME || !BOT_CHANNEL) throw new Error('missing_TWITCH_BOT_USERNAME_or_TWITCH_BOT_CHANNEL');

    if (state.connecting) return { ok: true, alreadyConnecting: true };
    if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) {
      return { ok: true, alreadyRunning: true, status: publicStatus() };
    }

    state.desiredActive = true;
    state.connecting = true;
    state.lastError = null;

    await loadTwitchEmotes(false);

    const accessToken = await getBotAccessToken();

    return await new Promise((resolve, reject) => {
      let settled = false;
      const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      state.ws = socket;

      const fail = (err) => {
        if (settled) return;
        settled = true;
        state.connecting = false;
        state.lastError = err?.message || String(err);
        try { socket.close(); } catch (_) {}
        reject(err instanceof Error ? err : new Error(String(err)));
      };

      socket.on('open', () => {
        state.connected = true;
        state.startedAt = state.startedAt || core.nowIso();
        try {
          socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
          socket.send(`PASS oauth:${accessToken}`);
          socket.send(`NICK ${BOT_USERNAME}`);
          socket.send(`JOIN #${BOT_CHANNEL}`);
          state.pingTimer = setInterval(() => sendRaw('PING :tmi.twitch.tv'), 4 * 60 * 1000);
        } catch (e) {
          fail(e);
        }
      });

      socket.on('message', (raw) => {
        const lines = raw.toString('utf8').split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('PING')) {
            sendRaw(line.replace('PING', 'PONG'));
            continue;
          }

          if (line.includes('Login authentication failed')) {
            fail(new Error('Twitch IRC authentication failed'));
            return;
          }

          const parsed = parseIrcLine(line);

          if (parsed.command === 'PRIVMSG') {
            state.debug.lastRawPrivmsg = line.length > 1200 ? line.slice(0, 1200) + '...' : line;
            state.debug.lastEmoteTag = parsed.tags?.emotes || '';
            state.debug.lastText = parsed.message || '';
          }

          if (line.includes('Welcome, GLHF!')) {
            state.authenticated = true;
          }

          if (parsed.command === 'PRIVMSG') {
            handlePrivmsg(parsed);
            continue;
          }

          if (line.includes(` 366 ${BOT_USERNAME} #${BOT_CHANNEL} `) || line.includes(` JOIN #${BOT_CHANNEL}`)) {
            state.joined = true;
            state.connecting = false;
            state.lastJoinAt = core.nowIso();
            if (!settled) {
              settled = true;
              resolve({ ok: true, trigger, status: publicStatus() });
            }
          }
        }
      });

      socket.on('close', (code, reason) => {
        state.lastClose = { code, reason: reason?.toString?.() || '', at: core.nowIso() };
        state.ws = null;
        state.connected = false;
        state.authenticated = false;
        state.joined = false;
        state.connecting = false;
        if (state.pingTimer) {
          clearInterval(state.pingTimer);
          state.pingTimer = null;
        }

        if (!settled) {
          settled = true;
          reject(new Error(`Twitch IRC closed before join (${code})`));
        }

        scheduleReconnect(`close-${code}`);
      });

      socket.on('error', (err) => {
        state.lastError = err?.message || String(err);
        if (!settled) fail(err);
      });
    });
  }

  async function stopConnection(trigger = 'manual') {
    state.desiredActive = false;
    cleanupTimers();

    if (state.ws) {
      try {
        if (state.ws.readyState === WebSocket.OPEN) {
          state.ws.send(`PART #${BOT_CHANNEL}`);
          state.ws.close(1000, trigger);
        } else {
          state.ws.terminate();
        }
      } catch (_) {}
    }

    state.ws = null;
    state.connected = false;
    state.authenticated = false;
    state.joined = false;
    state.connecting = false;
    return { ok: true, trigger, status: publicStatus() };
  }

  function clearChat() {
    state.chat = [];
    broadcast({ op: 'start_chat_clear', ts: core.nowIso() });
  }

  function publicStatus() {
    return {
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      enabled: ENABLED,
      desiredActive: state.desiredActive,
      connecting: state.connecting,
      connected: state.connected,
      authenticated: state.authenticated,
      joined: state.joined,
      botUsername: BOT_USERNAME,
      channel: BOT_CHANNEL,
      maxStored: MAX_STORED,
      maxTextLength: MAX_TEXT_LENGTH,
      chatCount: state.chat.length,
      startedAt: state.startedAt,
      lastJoinAt: state.lastJoinAt,
      lastMessageAt: state.lastMessageAt,
      lastClose: state.lastClose,
      lastError: state.lastError,
      emotes: publicEmoteStatus(),
      debug: {
        lastEmoteTag: state.debug.lastEmoteTag,
        lastText: state.debug.lastText,
        lastSegments: state.debug.lastSegments,
        lastMatchedEmotes: state.debug.lastMatchedEmotes,
        lastUnmatchedTokens: state.debug.lastUnmatchedTokens
      }
    };
  }


  function responseEnvelope(route, data) {
    return {
      ok: true,
      module: MODULE_NAME,
      route,
      timestamp: core.nowIso(),
      data
    };
  }

  function buildCheck(name, ok, details = {}, failLevel = 'error') {
    const isOk = !!ok;
    return {
      name,
      ok: isOk,
      level: isOk ? 'ok' : (failLevel || 'error'),
      error: isOk ? '' : (details.error || name),
      ...details
    };
  }

  function summarizeChecks(checks) {
    const rows = Array.isArray(checks) ? checks : [];
    return {
      total: rows.length,
      ok: rows.filter(check => check && check.ok).length,
      warnings: rows.filter(check => check && !check.ok && check.level === 'warning').length,
      errors: rows.filter(check => check && !check.ok && check.level === 'error').length
    };
  }

  function diagnosticsConfig() {
    return {
      prefix: '/api/overlay/chat',
      legacyPrefixes: [
        '/api/overlay/start-chat/irc',
        '/api/overlay/start-chat'
      ],
      version: VERSION,
      enabled: ENABLED,
      autoConnect: AUTO_CONNECT,
      bot: {
        usernameConfigured: !!BOT_USERNAME,
        channelConfigured: !!BOT_CHANNEL,
        clientIdConfigured: !!TWITCH_CLIENT_ID,
        broadcasterIdConfigured: !!BROADCASTER_ID_ENV
      },
      limits: {
        maxStored: MAX_STORED,
        maxTextLength: MAX_TEXT_LENGTH,
        ignoreUsers: IGNORE_USERS.slice()
      },
      emotes: {
        cacheTtlMs: EMOTE_CACHE_TTL_MS,
        status: publicEmoteStatus()
      },
      runtime: {
        desiredActive: state.desiredActive,
        connected: state.connected,
        authenticated: state.authenticated,
        joined: state.joined,
        chatCount: state.chat.length,
        lastError: state.lastError || ''
      },
      updatedAt: core.nowIso()
    };
  }

  function diagnosticsSettings() {
    return {
      prefix: '/api/overlay/chat',
      version: VERSION,
      enabled: ENABLED,
      autoConnect: AUTO_CONNECT,
      desiredActive: state.desiredActive,
      connecting: state.connecting,
      connected: state.connected,
      authenticated: state.authenticated,
      joined: state.joined,
      botUsernameConfigured: !!BOT_USERNAME,
      channelConfigured: !!BOT_CHANNEL,
      clientIdConfigured: !!TWITCH_CLIENT_ID,
      maxStored: MAX_STORED,
      maxTextLength: MAX_TEXT_LENGTH,
      chatCount: state.chat.length,
      startedAt: state.startedAt,
      lastJoinAt: state.lastJoinAt,
      lastMessageAt: state.lastMessageAt,
      lastClose: state.lastClose,
      lastError: state.lastError || '',
      emotes: publicEmoteStatus(),
      updatedAt: core.nowIso()
    };
  }

  function diagnosticsRoutes() {
    const prefix = '/api/overlay/chat';
    return {
      prefix,
      routes: [
        { method: 'GET', path: `${prefix}/status`, purpose: 'Twitch overlay chat runtime status' },
        { method: 'GET', path: `${prefix}/config`, purpose: 'sanitized overlay chat config' },
        { method: 'GET', path: `${prefix}/settings`, purpose: 'runtime settings and socket summary' },
        { method: 'GET', path: `${prefix}/routes`, purpose: 'list overlay chat API routes' },
        { method: 'GET', path: `${prefix}/integration-check`, purpose: 'run non-destructive overlay chat integration check' },
        { method: 'POST', path: `${prefix}/reload`, purpose: 'refresh diagnostic snapshot without IRC, clear or emote reload actions' },
        { method: 'GET/POST', path: `${prefix}/start`, purpose: 'start Twitch IRC overlay chat connection' },
        { method: 'GET/POST', path: `${prefix}/stop`, purpose: 'stop Twitch IRC overlay chat connection' },
        { method: 'GET/POST', path: `${prefix}/reconnect`, purpose: 'reconnect Twitch IRC overlay chat connection' },
        { method: 'GET/POST', path: `${prefix}/clear`, purpose: 'clear overlay chat items' },
        { method: 'GET', path: `${prefix}/debug`, purpose: 'debug snapshot with last chat items and emote state' },
        { method: 'GET', path: `${prefix}/emotes/status`, purpose: 'emote cache status' },
        { method: 'GET/POST', path: `${prefix}/emotes/reload`, purpose: 'force reload Twitch channel/global emotes' },
        { method: 'GET', path: `${prefix}/emotes/lookup`, purpose: 'lookup one emote by name' }
      ],
      legacyMirrors: [
        '/api/overlay/start-chat/irc/status',
        '/api/overlay/start-chat/irc/start',
        '/api/overlay/start-chat/irc/stop',
        '/api/overlay/start-chat/irc/reconnect',
        '/api/overlay/start-chat/clear-live',
        '/api/overlay/start-chat/debug',
        '/api/overlay/start-chat/emotes/status',
        '/api/overlay/start-chat/emotes/reload',
        '/api/overlay/start-chat/emotes/lookup'
      ],
      intentionallyNotRegistered: [
        '/api/twitch-chat-overlay',
        '/api/chat-overlay'
      ],
      count: 14,
      updatedAt: core.nowIso()
    };
  }

  function diagnosticsIntegrationCheck() {
    const emotes = publicEmoteStatus();
    const routesData = diagnosticsRoutes();
    const connectedExpected = state.desiredActive || AUTO_CONNECT;
    const checks = [
      buildCheck('module_enabled', ENABLED, { enabled: ENABLED }, 'warning'),
      buildCheck('bot_username_configured', !!BOT_USERNAME, { configured: !!BOT_USERNAME }, 'error'),
      buildCheck('bot_channel_configured', !!BOT_CHANNEL, { configured: !!BOT_CHANNEL }, 'error'),
      buildCheck('bot_client_id_configured', !!TWITCH_CLIENT_ID, { configured: !!TWITCH_CLIENT_ID }, 'warning'),
      buildCheck('emote_cache_readable', !!emotes, { emotes }, 'error'),
      buildCheck('emote_cache_loaded', !!emotes.loadedAt && !emotes.lastError, {
        loadedAt: emotes.loadedAt,
        lastError: emotes.lastError || '',
        channelCount: emotes.channelCount,
        globalCount: emotes.globalCount,
        totalLookupKeys: emotes.totalLookupKeys
      }, 'warning'),
      buildCheck('socket_state_readable', true, {
        desiredActive: state.desiredActive,
        connected: state.connected,
        authenticated: state.authenticated,
        joined: state.joined,
        connecting: state.connecting
      }),
      buildCheck('connected_when_expected', !connectedExpected || state.connected, {
        autoConnect: AUTO_CONNECT,
        desiredActive: state.desiredActive,
        connected: state.connected,
        joined: state.joined
      }, 'warning'),
      buildCheck('chat_storage_readable', Array.isArray(state.chat), {
        chatCount: state.chat.length,
        maxStored: MAX_STORED
      }, 'error'),
      buildCheck('routes', routesData.count >= 6, {
        prefix: routesData.prefix,
        count: routesData.count
      }, 'error')
    ];

    const summary = summarizeChecks(checks);
    return {
      prefix: '/api/overlay/chat',
      checks,
      summary,
      status: publicStatus(),
      notes: [
        'This integration check is non-destructive.',
        'It does not start, stop, reconnect, clear chat or send Twitch chat messages.',
        'It does not force reload Twitch emotes; use /api/overlay/chat/emotes/reload for that.'
      ],
      updatedAt: core.nowIso()
    };
  }

  function diagnosticsReload() {
    const chatCountBefore = state.chat.length;
    const connectedBefore = state.connected;
    const joinedBefore = state.joined;
    const emoteStatusBefore = publicEmoteStatus();

    return {
      action: 'reload',
      reloaded: true,
      destructive: false,
      startTriggered: false,
      stopTriggered: false,
      reconnectTriggered: false,
      chatCleared: false,
      chatMessageSent: false,
      emotesReloadTriggered: false,
      chatCountBefore,
      chatCountAfter: state.chat.length,
      chatPreserved: chatCountBefore === state.chat.length,
      connectedBefore,
      connectedAfter: state.connected,
      connectionPreserved: connectedBefore === state.connected && joinedBefore === state.joined,
      emoteStatusBefore,
      emoteStatusAfter: publicEmoteStatus(),
      status: publicStatus(),
      updatedAt: core.nowIso()
    };
  }

  function sendSnapshot(ws) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify({
        op: 'start_chat_snapshot',
        items: state.chat.slice(-10),
        ts: core.nowIso()
      }));
    } catch (_) {}
  }

  if (wss && typeof wss.on === 'function') {
    wss.on('connection', (ws) => {
      ws.on('message', (raw) => {
        let msg = null;
        try { msg = JSON.parse(String(raw || '')); } catch (_) { return; }
        if (!msg || msg.op !== 'overlay_hello') return;
        if (msg.overlay && msg.overlay !== 'start') return;
        sendSnapshot(ws);
      });
    });
  }

  routes.registerGet(app, '/api/overlay/chat/config', (req, res) => {
    return res.json(responseEnvelope('/api/overlay/chat/config', diagnosticsConfig()));
  });

  routes.registerGet(app, '/api/overlay/chat/settings', (req, res) => {
    return res.json(responseEnvelope('/api/overlay/chat/settings', diagnosticsSettings()));
  });

  routes.registerGet(app, '/api/overlay/chat/routes', (req, res) => {
    return res.json(responseEnvelope('/api/overlay/chat/routes', diagnosticsRoutes()));
  });

  routes.registerGet(app, '/api/overlay/chat/integration-check', (req, res) => {
    const data = diagnosticsIntegrationCheck();
    const statusCode = data.summary.errors > 0 ? 500 : 200;
    return res.status(statusCode).json(responseEnvelope('/api/overlay/chat/integration-check', data));
  });

  routes.registerPost(app, '/api/overlay/chat/reload', (req, res) => {
    return res.json(responseEnvelope('/api/overlay/chat/reload', diagnosticsReload()));
  });

  routes.registerGet(app, ['/api/overlay/chat/status', '/api/overlay/start-chat/irc/status'], (req, res) => res.json(publicStatus()));

  routes.registerGet(app, ['/api/overlay/chat/start', '/api/overlay/start-chat/irc/start'], core.asyncRoute(async (req, res) => {
    const result = await startConnection('http-start');
    return res.json(result);
  }));
  routes.registerPost(app, ['/api/overlay/chat/start', '/api/overlay/start-chat/irc/start'], core.asyncRoute(async (req, res) => {
    const result = await startConnection('http-start');
    return res.json(result);
  }));

  routes.registerGet(app, ['/api/overlay/chat/stop', '/api/overlay/start-chat/irc/stop'], core.asyncRoute(async (req, res) => {
    const result = await stopConnection('http-stop');
    return res.json(result);
  }));
  routes.registerPost(app, ['/api/overlay/chat/stop', '/api/overlay/start-chat/irc/stop'], core.asyncRoute(async (req, res) => {
    const result = await stopConnection('http-stop');
    return res.json(result);
  }));

  routes.registerGet(app, ['/api/overlay/chat/reconnect', '/api/overlay/start-chat/irc/reconnect'], core.asyncRoute(async (req, res) => {
    await stopConnection('http-reconnect');
    const result = await startConnection('http-reconnect');
    return res.json(result);
  }));
  routes.registerPost(app, ['/api/overlay/chat/reconnect', '/api/overlay/start-chat/irc/reconnect'], core.asyncRoute(async (req, res) => {
    await stopConnection('http-reconnect');
    const result = await startConnection('http-reconnect');
    return res.json(result);
  }));

  routes.registerGet(app, ['/api/overlay/chat/clear', '/api/overlay/start-chat/clear-live'], (req, res) => {
    clearChat();
    return res.json({ ok: true, module: MODULE_NAME, chatCount: 0 });
  });
  routes.registerPost(app, ['/api/overlay/chat/clear', '/api/overlay/start-chat/clear-live'], (req, res) => {
    clearChat();
    return res.json({ ok: true, module: MODULE_NAME, chatCount: 0 });
  });

  function lookupEmoteByName(nameInput) {
    const name = String(nameInput || '').trim();
    if (!name) return null;

    const direct = state.emotes.byName.get(name);
    const lower = state.emotes.byName.get(name.toLowerCase());
    return direct || lower || null;
  }

  routes.registerGet(app, ['/api/overlay/chat/emotes/lookup', '/api/overlay/start-chat/emotes/lookup'], (req, res) => {
    const name = String(req.query.name || '').trim();
    const found = lookupEmoteByName(name);

    return res.json({
      ok: !!found,
      name,
      found,
      loadedAt: state.emotes.loadedAt,
      channelCount: state.emotes.channelCount,
      globalCount: state.emotes.globalCount
    });
  });

  routes.registerGet(app, ['/api/overlay/chat/debug', '/api/overlay/start-chat/debug'], (req, res) => {
    return res.json({
      ok: true,
      module: MODULE_NAME,
      version: VERSION,
      connected: state.connected,
      authenticated: state.authenticated,
      joined: state.joined,
      emotes: publicEmoteStatus(),
      debug: state.debug,
      lastChatItems: state.chat.slice(-10)
    });
  });

  routes.registerGet(app, ['/api/overlay/chat/emotes/status', '/api/overlay/start-chat/emotes/status'], (req, res) => {
    return res.json(publicEmoteStatus());
  });

  routes.registerGet(app, ['/api/overlay/chat/emotes/reload', '/api/overlay/start-chat/emotes/reload'], core.asyncRoute(async (req, res) => {
    const status = await loadTwitchEmotes(true);
    return res.json(status);
  }));
  routes.registerPost(app, ['/api/overlay/chat/emotes/reload', '/api/overlay/start-chat/emotes/reload'], core.asyncRoute(async (req, res) => {
    const status = await loadTwitchEmotes(true);
    return res.json(status);
  }));

  if (ENABLED && AUTO_CONNECT) {
    setTimeout(() => {
      startConnection('auto').catch(err => {
        state.lastError = err?.message || String(err);
        console.warn(`[${MODULE_NAME}] auto connect failed:`, state.lastError);
      });
    }, 1500);
  }

  console.log(`[${MODULE_NAME}] aktiv → /api/overlay/chat/* (IRC direct chat with Twitch emotes)`);
};
