const path = require('path');
const fs = require('fs');
const axios = require('axios');
const WebSocket = require('ws');
const core = require('./helpers/helper_core');
const routes = require('./helpers/helper_routes');
const database = require('../core/database');
const commands = require('./commands');

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

module.exports.getActiveUsers = function getActiveUsers(options = {}) {
  if (!twitchPresenceService || typeof twitchPresenceService.getActiveUsers !== 'function') {
    return { ok: false, error: 'twitch_presence_not_initialized', users: [] };
  }
  return twitchPresenceService.getActiveUsers(options);
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

  const ACTIVITY_PRESENT_MINUTES = Math.max(5, Number(env.TWITCH_PRESENCE_PRESENT_MINUTES || 30) || 30);
  const ACTIVITY_ACTIVE_MINUTES = Math.max(5, Number(env.TWITCH_PRESENCE_ACTIVE_MINUTES || 60) || 60);
  const ACTIVITY_JOIN_ONLY_MINUTES = Math.max(5, Number(env.TWITCH_PRESENCE_JOIN_ONLY_MINUTES || 30) || 30);
  const ACTIVITY_MAX_ROWS = Math.max(10, Math.min(1000, Number(env.TWITCH_PRESENCE_ACTIVITY_MAX_ROWS || 250) || 250));

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

  const activity = {
    schemaOk: false,
    schemaError: '',
    lastEventAt: '',
    counters: {
      join: 0,
      part: 0,
      privmsg: 0,
      usernotice: 0,
      parsed: 0,
      ignored: 0
    },
    users: new Map()
  };

  function nowIso() {
    return core.nowIso();
  }

  function isoMs(value) {
    const ts = Date.parse(value || '');
    return Number.isFinite(ts) ? ts : 0;
  }

  function addMinutesIso(minutes, baseIso = '') {
    const base = baseIso ? isoMs(baseIso) : Date.now();
    return new Date(base + Math.max(1, Number(minutes || 1)) * 60 * 1000).toISOString();
  }

  function cleanLogin(value) {
    return String(value || '').trim().replace(/^@/, '').toLowerCase();
  }

  function cleanDisplayName(login, value) {
    const display = String(value || '').trim();
    return display || String(login || '').trim();
  }

  function normalizeSubscriberTier(value, badges = {}) {
    const raw = String(value || '').trim().toLowerCase();
    if (['prime', 'tier1', 'tier2', 'tier3', 'none', 'unknown'].includes(raw)) return raw;

    const badgeValue = String(badges.subscriber || badges.founder || '').trim().toLowerCase();
    if (badgeValue) {
      const months = Number.parseInt(badgeValue, 10);
      if (Number.isFinite(months) && months > 0) return 'unknown';
      return 'unknown';
    }

    if (badges.premium) return 'prime';
    return 'none';
  }

  function parseTags(rawTags = '') {
    const tags = {};
    const clean = String(rawTags || '').replace(/^@/, '');
    if (!clean) return tags;

    for (const part of clean.split(';')) {
      const idx = part.indexOf('=');
      if (idx < 0) {
        tags[part] = '';
      } else {
        const key = part.slice(0, idx);
        const value = part.slice(idx + 1)
          .replace(/\\s/g, ' ')
          .replace(/\\:/g, ';')
          .replace(/\\\\/g, '\\');
        tags[key] = value;
      }
    }
    return tags;
  }

  function parseBadges(value = '') {
    const badges = {};
    const raw = String(value || '').trim();
    if (!raw) return badges;
    for (const item of raw.split(',')) {
      if (!item) continue;
      const [name, version] = item.split('/');
      if (!name) continue;
      badges[name] = version || '1';
    }
    return badges;
  }

  function extractLoginFromPrefix(prefix = '') {
    const raw = String(prefix || '').trim().replace(/^:/, '');
    if (!raw) return '';
    const bang = raw.indexOf('!');
    const source = bang >= 0 ? raw.slice(0, bang) : raw;
    return cleanLogin(source);
  }

  function parseIrcLine(line) {
    const text = String(line || '').trim();
    if (!text) return null;

    let rest = text;
    let rawTags = '';
    let prefix = '';

    if (rest.startsWith('@')) {
      const idx = rest.indexOf(' ');
      if (idx > 0) {
        rawTags = rest.slice(0, idx);
        rest = rest.slice(idx + 1);
      }
    }

    if (rest.startsWith(':')) {
      const idx = rest.indexOf(' ');
      if (idx > 0) {
        prefix = rest.slice(0, idx);
        rest = rest.slice(idx + 1);
      }
    }

    const params = [];
    let trailing = '';
    const trailingIdx = rest.indexOf(' :');
    if (trailingIdx >= 0) {
      trailing = rest.slice(trailingIdx + 2);
      rest = rest.slice(0, trailingIdx);
    }

    const head = rest.split(/\s+/).filter(Boolean);
    const command = head.shift() || '';
    params.push(...head);
    if (trailing !== '') params.push(trailing);

    const tags = parseTags(rawTags);
    const badges = parseBadges(tags.badges || '');

    return {
      raw: text,
      tags,
      badges,
      prefix,
      command,
      params,
      login: cleanLogin(tags.login || extractLoginFromPrefix(prefix)),
      displayName: tags['display-name'] || ''
    };
  }

  function getActivityStatusForUser(row, atIso = '') {
    const now = atIso ? isoMs(atIso) : Date.now();
    const presentUntilMs = isoMs(row.presentUntil || row.present_until || '');
    const lastPartMs = isoMs(row.lastPartAt || row.last_part_at || '');
    const lastJoinMs = isoMs(row.lastJoinAt || row.last_join_at || '');
    const lastMessageMs = isoMs(row.lastMessageAt || row.last_message_at || '');
    const lastChattersMs = isoMs(row.lastChattersSeenAt || row.last_chatters_seen_at || '');

    if (lastPartMs && lastPartMs >= Math.max(lastJoinMs, lastMessageMs, lastChattersMs)) return 'left';
    if (presentUntilMs && now > presentUntilMs) return 'stale';
    if (lastMessageMs && now - lastMessageMs <= ACTIVITY_ACTIVE_MINUTES * 60 * 1000) return 'active';
    if (presentUntilMs && now <= presentUntilMs) return 'present';
    return 'unknown';
  }

  function ensureActivitySchema() {
    if (activity.schemaOk) return true;
    try {
      database.ensureReady();
      database.exec(`
        CREATE TABLE IF NOT EXISTS twitch_presence_activity (
          user_login TEXT PRIMARY KEY,
          user_display_name TEXT NOT NULL DEFAULT '',
          user_id TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'unknown',
          subscriber INTEGER NOT NULL DEFAULT 0,
          subscriber_tier TEXT NOT NULL DEFAULT 'none',
          badges_json TEXT NOT NULL DEFAULT '{}',
          last_join_at TEXT NOT NULL DEFAULT '',
          last_part_at TEXT NOT NULL DEFAULT '',
          last_message_at TEXT NOT NULL DEFAULT '',
          last_usernotice_at TEXT NOT NULL DEFAULT '',
          last_chatters_seen_at TEXT NOT NULL DEFAULT '',
          last_seen_at TEXT NOT NULL DEFAULT '',
          present_until TEXT NOT NULL DEFAULT '',
          source TEXT NOT NULL DEFAULT '',
          join_count INTEGER NOT NULL DEFAULT 0,
          part_count INTEGER NOT NULL DEFAULT 0,
          message_count INTEGER NOT NULL DEFAULT 0,
          usernotice_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}'
        );
      `);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_twitch_presence_activity_status ON twitch_presence_activity(status);`);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_twitch_presence_activity_last_seen ON twitch_presence_activity(last_seen_at);`);
      database.exec(`CREATE INDEX IF NOT EXISTS idx_twitch_presence_activity_present_until ON twitch_presence_activity(present_until);`);
      activity.schemaOk = true;
      activity.schemaError = '';
      return true;
    } catch (err) {
      activity.schemaOk = false;
      activity.schemaError = err?.message || String(err);
      return false;
    }
  }

  function rowToActivityUser(row) {
    if (!row) return null;
    const item = {
      login: row.user_login || row.login || '',
      displayName: row.user_display_name || row.displayName || row.user_login || row.login || '',
      userId: row.user_id || row.userId || '',
      status: row.status || 'unknown',
      subscriber: Number(row.subscriber || 0) === 1 || row.subscriber === true,
      subscriberTier: row.subscriber_tier || row.subscriberTier || 'none',
      badges: core.safeJsonParse(row.badges_json || row.badgesJson, {}),
      lastJoinAt: row.last_join_at || row.lastJoinAt || '',
      lastPartAt: row.last_part_at || row.lastPartAt || '',
      lastMessageAt: row.last_message_at || row.lastMessageAt || '',
      lastUsernoticeAt: row.last_usernotice_at || row.lastUsernoticeAt || '',
      lastChattersSeenAt: row.last_chatters_seen_at || row.lastChattersSeenAt || '',
      lastSeenAt: row.last_seen_at || row.lastSeenAt || '',
      presentUntil: row.present_until || row.presentUntil || '',
      source: row.source || '',
      joinCount: Number(row.join_count ?? row.joinCount ?? 0),
      partCount: Number(row.part_count ?? row.partCount ?? 0),
      messageCount: Number(row.message_count ?? row.messageCount ?? 0),
      usernoticeCount: Number(row.usernotice_count ?? row.usernoticeCount ?? 0),
      createdAt: row.created_at || row.createdAt || '',
      updatedAt: row.updated_at || row.updatedAt || '',
      metadata: core.safeJsonParse(row.metadata_json || row.metadataJson, {})
    };
    item.status = getActivityStatusForUser(item);
    return item;
  }

  function saveActivityUser(item) {
    if (!ensureActivitySchema()) return null;
    const login = cleanLogin(item.login);
    if (!login) return null;

    const now = nowIso();
    const existing = database.get('SELECT * FROM twitch_presence_activity WHERE user_login = :login', { login });
    const createdAt = existing?.created_at || now;
    const current = existing ? rowToActivityUser(existing) : null;
    const badges = item.badges && typeof item.badges === 'object' ? item.badges : (current?.badges || {});
    const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : (current?.metadata || {});

    const data = {
      login,
      displayName: cleanDisplayName(login, item.displayName || current?.displayName || ''),
      userId: String(item.userId || current?.userId || ''),
      status: item.status || current?.status || 'unknown',
      subscriber: item.subscriber === true || current?.subscriber === true ? 1 : 0,
      subscriberTier: item.subscriberTier || current?.subscriberTier || 'none',
      badgesJson: JSON.stringify(badges),
      lastJoinAt: item.lastJoinAt ?? current?.lastJoinAt ?? '',
      lastPartAt: item.lastPartAt ?? current?.lastPartAt ?? '',
      lastMessageAt: item.lastMessageAt ?? current?.lastMessageAt ?? '',
      lastUsernoticeAt: item.lastUsernoticeAt ?? current?.lastUsernoticeAt ?? '',
      lastChattersSeenAt: item.lastChattersSeenAt ?? current?.lastChattersSeenAt ?? '',
      lastSeenAt: item.lastSeenAt || current?.lastSeenAt || now,
      presentUntil: item.presentUntil || current?.presentUntil || '',
      source: item.source || current?.source || '',
      joinCount: Number(item.joinCount ?? current?.joinCount ?? 0),
      partCount: Number(item.partCount ?? current?.partCount ?? 0),
      messageCount: Number(item.messageCount ?? current?.messageCount ?? 0),
      usernoticeCount: Number(item.usernoticeCount ?? current?.usernoticeCount ?? 0),
      createdAt,
      updatedAt: now,
      metadataJson: JSON.stringify(metadata)
    };

    data.status = getActivityStatusForUser({
      lastPartAt: data.lastPartAt,
      lastJoinAt: data.lastJoinAt,
      lastMessageAt: data.lastMessageAt,
      lastChattersSeenAt: data.lastChattersSeenAt,
      presentUntil: data.presentUntil
    }, now);

    database.run(`
      INSERT INTO twitch_presence_activity (
        user_login, user_display_name, user_id, status, subscriber, subscriber_tier,
        badges_json, last_join_at, last_part_at, last_message_at, last_usernotice_at,
        last_chatters_seen_at, last_seen_at, present_until, source,
        join_count, part_count, message_count, usernotice_count,
        created_at, updated_at, metadata_json
      ) VALUES (
        :login, :displayName, :userId, :status, :subscriber, :subscriberTier,
        :badgesJson, :lastJoinAt, :lastPartAt, :lastMessageAt, :lastUsernoticeAt,
        :lastChattersSeenAt, :lastSeenAt, :presentUntil, :source,
        :joinCount, :partCount, :messageCount, :usernoticeCount,
        :createdAt, :updatedAt, :metadataJson
      )
      ON CONFLICT(user_login) DO UPDATE SET
        user_display_name = excluded.user_display_name,
        user_id = CASE WHEN excluded.user_id = '' THEN twitch_presence_activity.user_id ELSE excluded.user_id END,
        status = excluded.status,
        subscriber = excluded.subscriber,
        subscriber_tier = excluded.subscriber_tier,
        badges_json = excluded.badges_json,
        last_join_at = excluded.last_join_at,
        last_part_at = excluded.last_part_at,
        last_message_at = excluded.last_message_at,
        last_usernotice_at = excluded.last_usernotice_at,
        last_chatters_seen_at = excluded.last_chatters_seen_at,
        last_seen_at = excluded.last_seen_at,
        present_until = excluded.present_until,
        source = excluded.source,
        join_count = excluded.join_count,
        part_count = excluded.part_count,
        message_count = excluded.message_count,
        usernotice_count = excluded.usernotice_count,
        updated_at = excluded.updated_at,
        metadata_json = excluded.metadata_json
    `, data);

    const saved = rowToActivityUser(database.get('SELECT * FROM twitch_presence_activity WHERE user_login = :login', { login }));
    activity.users.set(login, saved);
    activity.lastEventAt = now;
    return saved;
  }

  function getActivityUser(login) {
    const normalized = cleanLogin(login);
    if (!normalized) return null;
    if (!ensureActivitySchema()) return activity.users.get(normalized) || null;
    const row = database.get('SELECT * FROM twitch_presence_activity WHERE user_login = :login', { login: normalized });
    return rowToActivityUser(row);
  }

  function markActivity(eventType, parsed) {
    const type = String(eventType || '').toLowerCase();
    const login = cleanLogin(parsed?.login || '');
    if (!login) return null;
    if (login === BOT_USERNAME) return null;

    const at = nowIso();
    const current = getActivityUser(login) || {
      login,
      displayName: cleanDisplayName(login, parsed.displayName),
      joinCount: 0,
      partCount: 0,
      messageCount: 0,
      usernoticeCount: 0,
      badges: {},
      metadata: {}
    };

    const badges = parsed.badges || current.badges || {};
    const subscriber = Boolean(badges.subscriber || badges.founder || parsed.tags?.subscriber === '1');
    const subscriberTier = subscriber ? normalizeSubscriberTier(parsed.subscriberTier || '', badges) : 'none';

    const next = {
      ...current,
      login,
      displayName: cleanDisplayName(login, parsed.displayName || current.displayName),
      userId: parsed.tags?.['user-id'] || current.userId || '',
      subscriber,
      subscriberTier,
      badges,
      source: type,
      lastSeenAt: at,
      metadata: {
        ...(current.metadata || {}),
        lastRawCommand: parsed.command || '',
        lastRawSource: type
      }
    };

    if (type === 'join') {
      next.lastJoinAt = at;
      next.presentUntil = addMinutesIso(ACTIVITY_JOIN_ONLY_MINUTES, at);
      next.joinCount = Number(current.joinCount || 0) + 1;
      activity.counters.join += 1;
    } else if (type === 'part') {
      next.lastPartAt = at;
      next.presentUntil = at;
      next.partCount = Number(current.partCount || 0) + 1;
      next.status = 'left';
      activity.counters.part += 1;
    } else if (type === 'privmsg') {
      next.lastMessageAt = at;
      next.presentUntil = addMinutesIso(ACTIVITY_ACTIVE_MINUTES, at);
      next.messageCount = Number(current.messageCount || 0) + 1;
      activity.counters.privmsg += 1;
    } else if (type === 'usernotice') {
      next.lastUsernoticeAt = at;
      next.presentUntil = addMinutesIso(ACTIVITY_ACTIVE_MINUTES, at);
      next.usernoticeCount = Number(current.usernoticeCount || 0) + 1;
      activity.counters.usernotice += 1;
    } else if (type === 'chatters') {
      next.lastChattersSeenAt = at;
      next.presentUntil = addMinutesIso(ACTIVITY_PRESENT_MINUTES, at);
    }

    next.status = getActivityStatusForUser(next, at);
    activity.counters.parsed += 1;
    return saveActivityUser(next);
  }

  function handleIrcActivity(parsed) {
    if (!parsed || !parsed.command) return;
    const command = String(parsed.command || '').toUpperCase();

    if (command === 'JOIN') {
      markActivity('join', parsed);
      return;
    }

    if (command === 'PART') {
      markActivity('part', parsed);
      return;
    }

    if (command === 'PRIVMSG') {
      markActivity('privmsg', parsed);
      return;
    }

    if (command === 'USERNOTICE') {
      markActivity('usernotice', parsed);
    }
  }

  function refreshActivityStatuses() {
    if (!ensureActivitySchema()) return [];
    const rows = database.all('SELECT * FROM twitch_presence_activity ORDER BY last_seen_at DESC LIMIT :limit', { limit: ACTIVITY_MAX_ROWS });
    const updated = [];
    for (const row of rows) {
      const user = rowToActivityUser(row);
      if (!user) continue;
      if (user.status !== row.status) {
        database.run('UPDATE twitch_presence_activity SET status = :status, updated_at = :updatedAt WHERE user_login = :login', {
          status: user.status,
          updatedAt: nowIso(),
          login: user.login
        });
      }
      activity.users.set(user.login, user);
      updated.push(user);
    }
    return updated;
  }

  function listActivityUsers(options = {}) {
    ensureActivitySchema();
    refreshActivityStatuses();

    const limit = Math.max(1, Math.min(1000, Number(options.limit || ACTIVITY_MAX_ROWS) || ACTIVITY_MAX_ROWS));
    const status = String(options.status || '').trim().toLowerCase();
    const search = String(options.search || '').trim().toLowerCase();
    const where = [];
    const params = { limit };

    if (status) {
      where.push('status = :status');
      params.status = status;
    }

    if (search) {
      where.push('(user_login LIKE :search OR user_display_name LIKE :search)');
      params.search = `%${search}%`;
    }

    const rows = database.all(`
      SELECT *
      FROM twitch_presence_activity
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY last_seen_at DESC, user_login ASC
      LIMIT :limit
    `, params).map(rowToActivityUser);

    return {
      ok: true,
      count: rows.length,
      rows
    };
  }

  function listActiveUsers(options = {}) {
    const minutes = Math.max(1, Math.min(240, Number(options.minutes || ACTIVITY_PRESENT_MINUTES) || ACTIVITY_PRESENT_MINUTES));
    const includeJoinedOnly = core.boolParam(options.includeJoinedOnly, true);
    const now = Date.now();
    const minLastSeen = new Date(now - minutes * 60 * 1000).toISOString();

    const rows = listActivityUsers({ limit: options.limit || ACTIVITY_MAX_ROWS }).rows
      .filter(user => {
        if (!user || !user.login) return false;
        if (user.status === 'left' || user.status === 'stale') return false;
        if (!includeJoinedOnly && !user.lastMessageAt && !user.lastChattersSeenAt) return false;
        if (user.presentUntil && isoMs(user.presentUntil) >= now) return true;
        return user.lastSeenAt && user.lastSeenAt >= minLastSeen;
      });

    return {
      ok: true,
      minutes,
      includeJoinedOnly,
      count: rows.length,
      users: rows,
      rows
    };
  }

  function clearActivity(options = {}) {
    ensureActivitySchema();
    const result = database.run('DELETE FROM twitch_presence_activity');
    activity.users.clear();
    return {
      ok: true,
      deleted: Number(result?.changes || 0),
      at: nowIso(),
      reason: String(options.reason || 'manual_clear')
    };
  }

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

          const parsed = parseIrcLine(line);
          handleIrcActivity(parsed);

          if (parsed && String(parsed.command || '').toUpperCase() === 'PRIVMSG') {
            commands.handleChatMessage(parsed, { source: 'twitch_presence', channel: BOT_CHANNEL })
              .catch((err) => {
                lastError = err?.message || String(err);
                console.warn('[twitch_presence] command hook error:', lastError);
              });
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
      last_error: lastError,
      activity: {
        schemaOk: activity.schemaOk,
        schemaError: activity.schemaError,
        lastEventAt: activity.lastEventAt,
        counters: { ...activity.counters },
        presentMinutes: ACTIVITY_PRESENT_MINUTES,
        activeMinutes: ACTIVITY_ACTIVE_MINUTES,
        joinOnlyMinutes: ACTIVITY_JOIN_ONLY_MINUTES
      }
    };
  }

  function handlePresenceStatus(req, res) {
    res.json(buildPresenceStatus());
  }

  function fileCheck(name, filePath, required = false) {
    try {
      const exists = Boolean(filePath && fs.existsSync(filePath));
      return {
        name,
        ok: required ? exists : true,
        level: required && !exists ? 'error' : (exists ? 'ok' : 'warning'),
        exists,
        configured: Boolean(filePath),
        required,
        error: required && !exists ? 'missing_file' : ''
      };
    } catch (e) {
      return {
        name,
        ok: !required,
        level: required ? 'error' : 'warning',
        exists: false,
        configured: Boolean(filePath),
        required,
        error: e?.message || String(e)
      };
    }
  }

  function buildPresenceRoutes() {
    return [
      { method: 'GET', path: '/api/twitch/presence/status', purpose: 'Twitch chat presence runtime status' },
      { method: 'GET', path: '/api/twitch/presence/config', purpose: 'sanitized Twitch presence config' },
      { method: 'GET', path: '/api/twitch/presence/settings', purpose: 'runtime settings and socket summary' },
      { method: 'GET', path: '/api/twitch/presence/routes', purpose: 'list Twitch presence API routes' },
      { method: 'GET', path: '/api/twitch/presence/integration-check', purpose: 'run non-destructive Twitch presence integration check' },
      { method: 'POST', path: '/api/twitch/presence/reload', purpose: 'refresh status snapshot without reconnect/send actions' },
      { method: 'GET', path: '/api/twitch/presence/start', purpose: 'start Twitch IRC presence connection' },
      { method: 'GET', path: '/api/twitch/presence/stop', purpose: 'stop Twitch IRC presence connection' },
      { method: 'GET/POST', path: '/api/twitch/presence/send', purpose: 'send a Twitch chat message through the presence bot' },
      { method: 'GET', path: '/api/twitch/presence/activity', purpose: 'list collected Twitch presence activity users' },
      { method: 'GET', path: '/api/twitch/presence/activity/active', purpose: 'list currently point-eligible active/present users' },
      { method: 'POST', path: '/api/twitch/presence/activity/clear', purpose: 'clear collected Twitch presence activity users' },
      { method: 'GET', path: '/api/twitch/presence/activity/test', purpose: 'inject a local non-Twitch test activity event' }
    ];
  }

  function buildPresenceConfig() {
    const tokenData = getStoredBotToken();
    return {
      prefix: '/api/twitch/presence',
      legacyPrefix: '/twitch/presence',
      projectRoot: baseRoot,
      bot: {
        usernameConfigured: Boolean(BOT_USERNAME),
        channelConfigured: Boolean(BOT_CHANNEL),
        clientIdConfigured: Boolean(BOT_CLIENT_ID),
        clientSecretConfigured: Boolean(BOT_CLIENT_SECRET),
        sendJoinMessage: SEND_JOIN_MESSAGE,
        joinMessageConfigured: Boolean(JOIN_MESSAGE)
      },
      tokenStore: {
        configured: Boolean(BOT_TOKEN_STORE),
        exists: Boolean(tokenData),
        hasAccessToken: Boolean(tokenData?.access_token),
        hasRefreshToken: Boolean(tokenData?.refresh_token),
        expiresAt: tokenData?.expires_at || null
      },
      activity: {
        presentMinutes: ACTIVITY_PRESENT_MINUTES,
        activeMinutes: ACTIVITY_ACTIVE_MINUTES,
        joinOnlyMinutes: ACTIVITY_JOIN_ONLY_MINUTES,
        maxRows: ACTIVITY_MAX_ROWS,
        table: 'twitch_presence_activity'
      },
      files: {
        tokenStore: fileCheck('token_store', BOT_TOKEN_STORE, false)
      },
      updatedAt: core.nowIso()
    };
  }

  function buildPresenceSettings() {
    const status = buildPresenceStatus();
    return {
      prefix: '/api/twitch/presence',
      legacyPrefix: '/twitch/presence',
      desiredActive: status.desiredActive,
      connecting: status.connecting,
      reconnecting: status.reconnecting,
      connected: status.connected,
      authenticated: status.authenticated,
      joined: status.joined,
      botUsernameConfigured: Boolean(BOT_USERNAME),
      channelConfigured: Boolean(BOT_CHANNEL),
      tokenPresent: Boolean(status.token_present),
      tokenExpiresAt: status.token_expires_at,
      tokenExpiresIn: status.token_expires_in,
      hasRefresh: Boolean(status.has_refresh),
      joinMessageEnabled: status.join_message_enabled,
      joinMessageSentForSession: status.join_message_sent_for_session,
      lastJoinAt: status.last_join_at,
      lastChatMessageAt: status.last_chat_message_at,
      chatMessageSendCount: status.chat_message_send_count,
      lastPongAt: status.last_pong_at,
      lastClose: status.last_close,
      lastError: status.last_error || '',
      activity: status.activity,
      updatedAt: core.nowIso()
    };
  }

  function buildCheck(name, ok, failLevel = null, extra = {}) {
    const passed = Boolean(ok);
    return {
      name,
      ok: passed,
      level: passed ? 'ok' : (failLevel || 'error'),
      error: passed ? '' : (extra.error || name),
      ...extra
    };
  }

  function summarizeChecks(checks) {
    return {
      total: checks.length,
      ok: checks.filter((check) => check.ok).length,
      warnings: checks.filter((check) => check.level === 'warning').length,
      errors: checks.filter((check) => check.level === 'error').length
    };
  }

  function buildPresenceIntegrationCheck() {
    const tokenData = getStoredBotToken();
    const status = buildPresenceStatus();
    const tokenFresh = Boolean(tokenData?.expires_at && tokenData.expires_at > epoch() + 60);
    const tokenUsable = Boolean(tokenData?.access_token && (tokenFresh || tokenData?.refresh_token));
    const activitySchemaOk = ensureActivitySchema();

    const checks = [
      buildCheck('bot_username_configured', Boolean(BOT_USERNAME), 'error', { configured: Boolean(BOT_USERNAME) }),
      buildCheck('bot_channel_configured', Boolean(BOT_CHANNEL), 'error', { configured: Boolean(BOT_CHANNEL) }),
      buildCheck('bot_client_id_configured', Boolean(BOT_CLIENT_ID), 'error', { configured: Boolean(BOT_CLIENT_ID) }),
      buildCheck('bot_client_secret_configured', Boolean(BOT_CLIENT_SECRET), 'error', { configured: Boolean(BOT_CLIENT_SECRET) }),
      buildCheck('token_store_configured', Boolean(BOT_TOKEN_STORE), 'warning', { configured: Boolean(BOT_TOKEN_STORE) }),
      buildCheck('token_present', Boolean(tokenData?.access_token), tokenData?.access_token ? 'ok' : 'warning', { present: Boolean(tokenData?.access_token) }),
      buildCheck('token_usable_or_refreshable', tokenUsable, tokenUsable ? 'ok' : 'warning', {
        hasAccessToken: Boolean(tokenData?.access_token),
        hasRefreshToken: Boolean(tokenData?.refresh_token),
        expiresAt: tokenData?.expires_at || null,
        tokenFresh
      }),
      buildCheck('socket_state_readable', true, 'ok', {
        desiredActive: status.desiredActive,
        connected: status.connected,
        authenticated: status.authenticated,
        joined: status.joined,
        connecting: status.connecting,
        reconnecting: status.reconnecting
      }),
      buildCheck('activity_schema', activitySchemaOk, 'error', { table: 'twitch_presence_activity', error: activity.schemaError || '' }),
      buildCheck('routes', true, 'ok', { prefix: '/api/twitch/presence', count: buildPresenceRoutes().length })
    ];

    return {
      prefix: '/api/twitch/presence',
      legacyPrefix: '/twitch/presence',
      checks,
      summary: summarizeChecks(checks),
      status,
      notes: [
        'This integration check is non-destructive.',
        'It does not start, stop, reconnect or send Twitch chat messages.',
        'Activity collection uses Twitch IRC JOIN/PART/PRIVMSG/USERNOTICE.',
        'Warnings are expected if the bot token is missing while the presence connection is intentionally inactive.'
      ],
      updatedAt: core.nowIso()
    };
  }

  function handlePresenceConfig(req, res) {
    res.json({
      ok: true,
      module: 'twitch_presence',
      route: '/api/twitch/presence/config',
      timestamp: core.nowIso(),
      data: buildPresenceConfig()
    });
  }

  function handlePresenceSettings(req, res) {
    res.json({
      ok: true,
      module: 'twitch_presence',
      route: '/api/twitch/presence/settings',
      timestamp: core.nowIso(),
      data: buildPresenceSettings()
    });
  }

  function handlePresenceRoutes(req, res) {
    res.json({
      ok: true,
      module: 'twitch_presence',
      route: '/api/twitch/presence/routes',
      timestamp: core.nowIso(),
      data: {
        prefix: '/api/twitch/presence',
        legacyPrefix: '/twitch/presence',
        routes: buildPresenceRoutes(),
        legacyMirrors: [
          '/twitch/presence/start',
          '/twitch/presence/stop',
          '/twitch/presence/status',
          '/twitch/presence/send'
        ],
        count: buildPresenceRoutes().length,
        updatedAt: core.nowIso()
      }
    });
  }

  function handlePresenceIntegrationCheck(req, res) {
    const data = buildPresenceIntegrationCheck();
    const hasErrors = data.summary.errors > 0;
    res.status(hasErrors ? 500 : 200).json({
      ok: !hasErrors,
      module: 'twitch_presence',
      route: '/api/twitch/presence/integration-check',
      timestamp: core.nowIso(),
      data
    });
  }

  function handlePresenceReload(req, res) {
    const statusBefore = buildPresenceStatus();
    const data = {
      action: 'reload',
      reloaded: true,
      destructive: false,
      startTriggered: false,
      stopTriggered: false,
      reconnectTriggered: false,
      chatMessageSent: false,
      desiredActiveBefore: statusBefore.desiredActive,
      connectedBefore: statusBefore.connected,
      joinedBefore: statusBefore.joined,
      status: buildPresenceStatus(),
      updatedAt: core.nowIso()
    };

    res.json({
      ok: true,
      module: 'twitch_presence',
      route: '/api/twitch/presence/reload',
      timestamp: core.nowIso(),
      data
    });
  }

  function handleActivityList(req, res) {
    try {
      res.json({
        ok: true,
        module: 'twitch_presence',
        route: '/api/twitch/presence/activity',
        timestamp: core.nowIso(),
        data: {
          ...listActivityUsers({
            status: core.getParam(req, 'status', ''),
            search: core.getParam(req, 'search', ''),
            limit: core.getParam(req, 'limit', ACTIVITY_MAX_ROWS)
          }),
          counters: { ...activity.counters }
        }
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  function handleActivityActive(req, res) {
    try {
      res.json({
        ok: true,
        module: 'twitch_presence',
        route: '/api/twitch/presence/activity/active',
        timestamp: core.nowIso(),
        data: listActiveUsers({
          minutes: core.getParam(req, 'minutes', ACTIVITY_PRESENT_MINUTES),
          includeJoinedOnly: core.getParam(req, 'includeJoinedOnly', true),
          limit: core.getParam(req, 'limit', ACTIVITY_MAX_ROWS)
        })
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  function handleActivityClear(req, res) {
    try {
      res.json({
        ok: true,
        module: 'twitch_presence',
        route: '/api/twitch/presence/activity/clear',
        timestamp: core.nowIso(),
        data: clearActivity({ reason: 'http_clear' })
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  function handleActivityTest(req, res) {
    try {
      const login = cleanLogin(core.getParam(req, 'login', 'testpresence'));
      const displayName = cleanDisplayName(login, core.getParam(req, 'displayName', login));
      const event = String(core.getParam(req, 'event', 'privmsg')).trim().toLowerCase();
      const subscriber = core.boolParam(core.getParam(req, 'subscriber', false), false);
      const subscriberTier = String(core.getParam(req, 'subscriberTier', subscriber ? 'unknown' : 'none')).trim().toLowerCase();

      const badges = {};
      if (subscriber) badges.subscriber = '1';

      const saved = markActivity(event, {
        login,
        displayName,
        command: event.toUpperCase(),
        tags: {
          login,
          'display-name': displayName,
          subscriber: subscriber ? '1' : '0'
        },
        badges,
        subscriberTier
      });

      res.json({
        ok: true,
        module: 'twitch_presence',
        route: '/api/twitch/presence/activity/test',
        timestamp: core.nowIso(),
        data: {
          event,
          saved
        }
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  ensureActivitySchema();

  routes.registerGet(app, ['/twitch/presence/start', '/api/twitch/presence/start'], handlePresenceStart);
  routes.registerGet(app, ['/twitch/presence/stop', '/api/twitch/presence/stop'], handlePresenceStop);
  routes.registerGet(app, ['/twitch/presence/status', '/api/twitch/presence/status'], handlePresenceStatus);
  routes.registerGet(app, '/api/twitch/presence/config', handlePresenceConfig);
  routes.registerGet(app, '/api/twitch/presence/settings', handlePresenceSettings);
  routes.registerGet(app, '/api/twitch/presence/routes', handlePresenceRoutes);
  routes.registerGet(app, '/api/twitch/presence/integration-check', handlePresenceIntegrationCheck);
  routes.registerPost(app, '/api/twitch/presence/reload', handlePresenceReload);
  routes.registerGet(app, ['/twitch/presence/send', '/api/twitch/presence/send'], handlePresenceSend);
  routes.registerPost(app, ['/twitch/presence/send', '/api/twitch/presence/send'], handlePresenceSend);

  routes.registerGet(app, '/api/twitch/presence/activity', handleActivityList);
  routes.registerGet(app, '/api/twitch/presence/activity/active', handleActivityActive);
  routes.registerPost(app, '/api/twitch/presence/activity/clear', handleActivityClear);
  routes.registerGet(app, '/api/twitch/presence/activity/test', handleActivityTest);

  twitchPresenceService = {
    sendChatMessage: sendChatMessageInternal,
    getStatus: buildPresenceStatus,
    getActiveUsers: listActiveUsers,
    getActivityUsers: listActivityUsers
  };

  console.log('[twitch_presence] routes active: /twitch/presence/start, /twitch/presence/stop, /twitch/presence/status, /twitch/presence/send, /api/twitch/presence/*, /api/twitch/presence/activity*');
};
