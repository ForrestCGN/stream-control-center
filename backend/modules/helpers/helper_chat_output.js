'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const WebSocket = require('ws');
const core = require('./helper_core');
const config = require('./helper_config');
const messages = require('./helper_messages');

const DEFAULT_CONFIG = {
  version: 1,
  enabled: true,
  directSendEnabled: true,
  prefer: 'bot',
  fallbackToStreamer: true,
  fallbackToStreamerbot: true,
  maxLength: 450,
  irc: {
    enabled: true,
    url: 'wss://irc-ws.chat.twitch.tv:443',
    joinDelayMs: 700,
    timeoutMs: 10000
  },
  accounts: {
    bot: {
      enabled: true,
      usernameEnv: 'TWITCH_BOT_USERNAME',
      channelEnv: 'TWITCH_BOT_CHANNEL',
      clientIdEnv: 'TWITCH_BOT_CLIENT_ID',
      clientSecretEnv: 'TWITCH_BOT_CLIENT_SECRET',
      tokenStoreEnv: 'TWITCH_BOT_TOKEN_STORE',
      defaultTokenStore: 'tokens/twitch_bot_user.json'
    },
    streamer: {
      enabled: true,
      usernameEnv: 'TWITCH_CHANNEL_LOGIN',
      channelEnv: 'TWITCH_CHANNEL_LOGIN',
      clientIdEnv: 'TWITCH_CLIENT_ID',
      clientSecretEnv: 'TWITCH_CLIENT_SECRET',
      tokenStoreEnv: 'TWITCH_TOKEN_STORE',
      defaultTokenStore: 'tokens/twitch_user.json'
    }
  }
};

const state = {
  loadedAt: null,
  configPath: '',
  config: { ...DEFAULT_CONFIG },
  sent: 0,
  failed: 0,
  fallback: 0,
  lastSendAt: null,
  lastError: '',
  recent: []
};

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = clone(item);
    return out;
  }
  return value;
}

function deepMerge(base, override) {
  const out = clone(base || {});
  if (!override || typeof override !== 'object' || Array.isArray(override)) return out;
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = clone(value);
    }
  }
  return out;
}

function normalizeLogin(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}

function resolveRootRelative(filePath) {
  const raw = String(filePath || '').trim();
  if (!raw) return '';
  return path.isAbsolute(raw) ? raw : config.resolveFromRoot(raw);
}

function loadConfig() {
  const result = config.loadConfig('chat_output.json', DEFAULT_CONFIG, { createIfMissing: true, mergeDefaults: true });
  state.configPath = result.path;
  state.config = deepMerge(DEFAULT_CONFIG, result.config || {});
  state.loadedAt = core.nowIso();
  state.lastError = result.ok ? state.lastError : result.error;
  return state.config;
}

function getConfig() {
  if (!state.loadedAt) loadConfig();
  return state.config || DEFAULT_CONFIG;
}

function remember(entry) {
  state.recent.unshift({ at: core.nowIso(), ...entry });
  state.recent = state.recent.slice(0, 20);
}

function safeAccountStatus(accountName) {
  const cfg = getConfig();
  const account = cfg.accounts?.[accountName] || {};
  const tokenStorePath = getTokenStorePath(account);
  return {
    account: accountName,
    enabled: account.enabled !== false,
    usernameConfigured: !!normalizeLogin(process.env[account.usernameEnv] || ''),
    channelConfigured: !!normalizeLogin(process.env[account.channelEnv] || ''),
    clientIdConfigured: !!String(process.env[account.clientIdEnv] || '').trim(),
    clientSecretConfigured: !!String(process.env[account.clientSecretEnv] || '').trim(),
    tokenStorePath,
    tokenPresent: !!readTokenFile(tokenStorePath, false),
    tokenHasRefresh: !!readTokenFile(tokenStorePath, false)?.refresh_token
  };
}

function getTokenStorePath(account) {
  const envPath = account?.tokenStoreEnv ? process.env[account.tokenStoreEnv] : '';
  return resolveRootRelative(envPath || account?.defaultTokenStore || '');
}

function readTokenFile(filePath, includeData = true) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data || !data.access_token) return null;
    return includeData ? data : { access_token: true, refresh_token: !!data.refresh_token, expires_at: data.expires_at || null };
  } catch (_) {
    return null;
  }
}

function writeTokenFile(filePath, data) {
  core.ensureParentDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function epoch() {
  return Math.floor(Date.now() / 1000);
}

function formPost(url, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) { parsed = { raw: data }; }
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
        const err = new Error(`token_refresh_failed_${res.statusCode}`);
        err.statusCode = res.statusCode;
        err.payload = parsed;
        reject(err);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function refreshToken(account, tokenStorePath, currentToken) {
  if (!currentToken?.refresh_token) return null;
  const clientId = String(process.env[account.clientIdEnv] || '').trim();
  const clientSecret = String(process.env[account.clientSecretEnv] || '').trim();
  if (!clientId || !clientSecret) return null;

  const refreshed = await formPost('https://id.twitch.tv/oauth2/token', {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: currentToken.refresh_token
  });

  const updated = {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || currentToken.refresh_token,
    expires_at: epoch() + Number(refreshed.expires_in || 0)
  };
  writeTokenFile(tokenStorePath, updated);
  return updated;
}

async function getAccessToken(account) {
  const tokenStorePath = getTokenStorePath(account);
  const current = readTokenFile(tokenStorePath, true);
  if (!current) return { ok: false, error: 'token_missing', tokenStorePath };

  const now = epoch();
  if (current.expires_at && now < Number(current.expires_at) - 60) {
    return { ok: true, accessToken: current.access_token, tokenStorePath, refreshed: false };
  }

  try {
    const refreshed = await refreshToken(account, tokenStorePath, current);
    if (refreshed?.access_token) return { ok: true, accessToken: refreshed.access_token, tokenStorePath, refreshed: true };
  } catch (err) {
    return { ok: false, error: 'token_refresh_failed', message: err.message, tokenStorePath };
  }

  if (current.access_token) return { ok: true, accessToken: current.access_token, tokenStorePath, refreshed: false, warning: 'using_existing_token_without_refresh' };
  return { ok: false, error: 'token_unavailable', tokenStorePath };
}

function sendIrcMessage({ url, username, channel, accessToken, message, timeoutMs, joinDelayMs }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const ws = new WebSocket(url);
    const timer = setTimeout(() => finish(false, new Error('irc_send_timeout')), Math.max(1000, Number(timeoutMs || 10000)));

    function finish(ok, err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch (_) {}
      if (ok) resolve({ ok: true });
      else reject(err || new Error('irc_send_failed'));
    }

    ws.on('open', () => {
      try {
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        ws.send(`PASS oauth:${accessToken}`);
        ws.send(`NICK ${username}`);
        ws.send(`JOIN #${channel}`);
        setTimeout(() => {
          try {
            ws.send(`PRIVMSG #${channel} :${message}`);
            setTimeout(() => finish(true), 250);
          } catch (err) {
            finish(false, err);
          }
        }, Math.max(0, Number(joinDelayMs || 700)));
      } catch (err) {
        finish(false, err);
      }
    });

    ws.on('message', raw => {
      const text = raw.toString();
      if (text.startsWith('PING')) {
        try { ws.send(text.replace(/^PING/, 'PONG')); } catch (_) {}
      }
      if (text.includes('Login authentication failed')) finish(false, new Error('irc_auth_failed'));
    });

    ws.on('error', err => finish(false, err));
  });
}

function buildAccountOrder(options = {}) {
  const cfg = getConfig();
  const prefer = String(options.prefer || cfg.prefer || 'bot').toLowerCase();
  const order = [];
  if (prefer === 'streamer') order.push('streamer');
  else order.push('bot');

  if ((options.fallbackToStreamer ?? cfg.fallbackToStreamer) !== false && !order.includes('streamer')) order.push('streamer');
  if (!order.includes('bot')) order.push('bot');
  return order;
}

async function sendViaAccount(accountName, text) {
  const cfg = getConfig();
  const account = cfg.accounts?.[accountName] || null;
  if (!account || account.enabled === false) return { ok: false, error: 'account_disabled', account: accountName };

  const username = normalizeLogin(process.env[account.usernameEnv] || '');
  const channel = normalizeLogin(process.env[account.channelEnv] || '');
  if (!username) return { ok: false, error: 'username_missing', account: accountName };
  if (!channel) return { ok: false, error: 'channel_missing', account: accountName };

  const token = await getAccessToken(account);
  if (!token.ok) return { ok: false, error: token.error, account: accountName, message: token.message || '' };

  await sendIrcMessage({
    url: cfg.irc?.url || DEFAULT_CONFIG.irc.url,
    username,
    channel,
    accessToken: token.accessToken,
    message: text,
    timeoutMs: cfg.irc?.timeoutMs,
    joinDelayMs: cfg.irc?.joinDelayMs
  });

  return { ok: true, account: accountName, via: accountName, channel, username, refreshed: !!token.refreshed };
}

async function sendChatMessage(message, options = {}) {
  const cfg = getConfig();
  const text = messages.sanitizeChatMessage(message, options.maxLength || cfg.maxLength || 450);
  const source = String(options.source || 'unknown').trim() || 'unknown';
  const reason = String(options.reason || '').trim();

  if (!text) return messages.buildNoSendResponse('empty_message', { extra: { source, reason } });

  const directEnabled = options.directSendEnabled ?? cfg.directSendEnabled;
  if (cfg.enabled === false || directEnabled === false || cfg.irc?.enabled === false) {
    state.fallback += 1;
    remember({ source, reason, sent: false, via: 'streamerbot_fallback', message: text });
    return messages.buildSendResponse(text, { reason: 'streamerbot_fallback', extra: { source, via: 'streamerbot_fallback', sent: false } });
  }

  const errors = [];
  for (const accountName of buildAccountOrder(options)) {
    try {
      const result = await sendViaAccount(accountName, text);
      if (result.ok) {
        state.sent += 1;
        state.lastSendAt = core.nowIso();
        remember({ source, reason, sent: true, via: result.via, account: accountName, message: text });
        return {
          ok: true,
          send: false,
          sent: true,
          via: result.via,
          account: accountName,
          channel: result.channel,
          message: text,
          chatMessage: '',
          streamerbot_send: '0',
          streamerbot_message: '',
          reason,
          source,
          ts: core.nowIso()
        };
      }
      errors.push(result);
    } catch (err) {
      errors.push({ ok: false, account: accountName, error: err.message || String(err) });
    }
  }

  state.failed += 1;
  state.lastError = errors.map(item => `${item.account || '?'}:${item.error || item.message || 'failed'}`).join(' | ');
  remember({ source, reason, sent: false, via: 'streamerbot_fallback', error: state.lastError, message: text });

  if ((options.fallbackToStreamerbot ?? cfg.fallbackToStreamerbot) !== false) {
    state.fallback += 1;
    return messages.buildSendResponse(text, {
      reason: 'streamerbot_fallback',
      extra: {
        source,
        sent: false,
        via: 'streamerbot_fallback',
        directErrors: errors.map(item => ({ account: item.account, error: item.error || item.message || 'failed' }))
      }
    });
  }

  return messages.buildErrorResponse('chat_output_failed', {
    extra: {
      source,
      sent: false,
      via: 'none',
      directErrors: errors.map(item => ({ account: item.account, error: item.error || item.message || 'failed' }))
    }
  });
}

function getStatus() {
  const cfg = getConfig();
  return {
    ok: true,
    module: 'helper_chat_output',
    loadedAt: state.loadedAt,
    configPath: state.configPath,
    enabled: cfg.enabled !== false,
    directSendEnabled: cfg.directSendEnabled !== false,
    prefer: cfg.prefer || 'bot',
    fallbackToStreamer: cfg.fallbackToStreamer !== false,
    fallbackToStreamerbot: cfg.fallbackToStreamerbot !== false,
    maxLength: cfg.maxLength || 450,
    irc: {
      enabled: cfg.irc?.enabled !== false,
      url: cfg.irc?.url || DEFAULT_CONFIG.irc.url,
      joinDelayMs: cfg.irc?.joinDelayMs,
      timeoutMs: cfg.irc?.timeoutMs
    },
    accounts: {
      bot: safeAccountStatus('bot'),
      streamer: safeAccountStatus('streamer')
    },
    stats: {
      sent: state.sent,
      failed: state.failed,
      fallback: state.fallback,
      lastSendAt: state.lastSendAt,
      lastError: state.lastError
    },
    recent: state.recent
  };
}

module.exports = {
  loadConfig,
  getConfig,
  getStatus,
  sendChatMessage
};
