'use strict';

const core = require('./helpers/helper_core');
const config = require('./helpers/helper_config');
const routes = require('./helpers/helper_routes');
const security = require('./helpers/helper_security');
const textHelper = require('./helpers/helper_texts');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  enabled: true,
  description: 'Konfiguration fuer wiederkehrende Chat-Hinweise. Texte kommen aus dem zentralen Config-/Messages-Ordner.',
  runtime: {
    onlyWhenLive: true,
    startActiveOnServerStart: false,
    firstMessageDelayMinutes: 15,
    globalCooldownMinutes: 20,
    minChatMessagesBetweenRotations: 8,
    resetChatCounterAfterSend: true,
    avoidSameItemBackToBack: true
  },
  chat: {
    ignoreBots: true,
    botNames: ['streamelements', 'nightbot']
  },
  messageOptions: {
    target: 'twitch_chat',
    maxLength: 450
  },
  liveStatus: {
    enabled: true,
    mode: 'twitch_stream_route',
    url: 'http://localhost:8080/api/twitch/stream?login=forrestcgn',
    onlineCheck: 'data_has_items',
    timeoutMs: 3000,
    failClosed: true,
    cacheSeconds: 15
  },
  items: [
    {
      id: 'follow',
      category: 'follow',
      messageFile: 'follow.json',
      enabled: true,
      messageKey: 'follow_reminder',
      cooldownMinutes: 45,
      weight: 8,
      manualEnabled: true,
      manualCooldownSeconds: 30,
      commands: ['!follow']
    },
    {
      id: 'discord',
      category: 'discord',
      messageFile: 'discord.json',
      enabled: true,
      messageKey: 'discord_reminder',
      cooldownMinutes: 60,
      weight: 7,
      manualEnabled: true,
      manualCooldownSeconds: 30,
      commands: ['!discord', '!dc']
    },
    {
      id: 'youtube',
      category: 'youtube',
      messageFile: 'youtube.json',
      enabled: true,
      messageKey: 'youtube_reminder',
      cooldownMinutes: 50,
      weight: 7,
      manualEnabled: true,
      manualCooldownSeconds: 30,
      commands: ['!youtube', '!yt']
    }
  ]
};

let cfg = null;
let cfgInfo = null;

const state = {
  active: false,
  startedAtMs: 0,
  startedAt: null,
  stoppedAt: null,
  chatMessagesSinceLastSend: 0,
  totalTicks: 0,
  ignoredTicks: 0,
  lastTickAt: null,
  lastTickUser: '',
  lastSentAtMs: 0,
  lastSentAt: null,
  lastItemId: '',
  lastMessageKey: '',
  lastMessage: '',
  sendCount: 0,
  itemState: {},
  manualState: {},
  liveStatus: {
    checkedAt: null,
    checkedAtMs: 0,
    online: null,
    ok: null,
    reason: 'not_checked',
    source: '',
    mode: '',
    dataCount: null,
    ageSeconds: null,
    error: ''
  }
};

function getConfigPath() {
  return config.resolveFromConfig('message_rotator.json');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toBool(value, fallback = false) {
  return core.boolParam(value, fallback);
}

function toPositiveNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function cleanId(value) {
  return String(value || '').trim();
}

function cleanLower(value) {
  return cleanId(value).toLowerCase();
}

function cleanStringList(value, fallback = []) {
  if (!Array.isArray(value)) return [...fallback];
  return value.map(v => String(v || '').trim()).filter(Boolean);
}

function mergeConfig(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const merged = clone(DEFAULT_CONFIG);

  merged.enabled = toBool(src.enabled, DEFAULT_CONFIG.enabled);
  merged.description = cleanId(src.description || DEFAULT_CONFIG.description);
  merged.runtime = { ...DEFAULT_CONFIG.runtime, ...(src.runtime || {}) };
  merged.chat = { ...DEFAULT_CONFIG.chat, ...(src.chat || {}) };
  merged.messageOptions = { ...DEFAULT_CONFIG.messageOptions, ...(src.messageOptions || {}) };
  merged.liveStatus = { ...DEFAULT_CONFIG.liveStatus, ...(src.liveStatus || {}) };

  merged.runtime.onlyWhenLive = toBool(merged.runtime.onlyWhenLive, DEFAULT_CONFIG.runtime.onlyWhenLive);
  merged.runtime.startActiveOnServerStart = toBool(merged.runtime.startActiveOnServerStart, DEFAULT_CONFIG.runtime.startActiveOnServerStart);
  merged.runtime.firstMessageDelayMinutes = toPositiveNumber(merged.runtime.firstMessageDelayMinutes, DEFAULT_CONFIG.runtime.firstMessageDelayMinutes);
  merged.runtime.globalCooldownMinutes = toPositiveNumber(merged.runtime.globalCooldownMinutes, DEFAULT_CONFIG.runtime.globalCooldownMinutes);
  merged.runtime.minChatMessagesBetweenRotations = Math.max(0, Number.parseInt(merged.runtime.minChatMessagesBetweenRotations, 10) || 0);
  merged.runtime.resetChatCounterAfterSend = toBool(merged.runtime.resetChatCounterAfterSend, DEFAULT_CONFIG.runtime.resetChatCounterAfterSend);
  merged.runtime.avoidSameItemBackToBack = toBool(merged.runtime.avoidSameItemBackToBack, DEFAULT_CONFIG.runtime.avoidSameItemBackToBack);

  merged.chat.ignoreBots = toBool(merged.chat.ignoreBots, DEFAULT_CONFIG.chat.ignoreBots);
  merged.chat.botNames = cleanStringList(merged.chat.botNames, DEFAULT_CONFIG.chat.botNames).map(v => v.toLowerCase());

  merged.messageOptions.target = cleanId(merged.messageOptions.target || DEFAULT_CONFIG.messageOptions.target);
  merged.messageOptions.maxLength = Math.max(1, Number.parseInt(merged.messageOptions.maxLength, 10) || DEFAULT_CONFIG.messageOptions.maxLength);

  merged.liveStatus.enabled = toBool(merged.liveStatus.enabled, DEFAULT_CONFIG.liveStatus.enabled);
  merged.liveStatus.mode = cleanLower(merged.liveStatus.mode || DEFAULT_CONFIG.liveStatus.mode);
  merged.liveStatus.url = cleanId(merged.liveStatus.url || DEFAULT_CONFIG.liveStatus.url);
  merged.liveStatus.onlineCheck = cleanLower(merged.liveStatus.onlineCheck || DEFAULT_CONFIG.liveStatus.onlineCheck);
  merged.liveStatus.timeoutMs = Math.max(500, Number.parseInt(merged.liveStatus.timeoutMs, 10) || DEFAULT_CONFIG.liveStatus.timeoutMs);
  merged.liveStatus.failClosed = toBool(merged.liveStatus.failClosed, DEFAULT_CONFIG.liveStatus.failClosed);
  merged.liveStatus.cacheSeconds = Math.max(0, Number.parseInt(merged.liveStatus.cacheSeconds, 10) || DEFAULT_CONFIG.liveStatus.cacheSeconds);

  const inputItems = Array.isArray(src.items) ? src.items : DEFAULT_CONFIG.items;
  merged.items = inputItems.map((item, index) => {
    const rawItem = item && typeof item === 'object' ? item : {};
    return {
      id: cleanId(rawItem.id || rawItem.category || `item_${index + 1}`),
      category: cleanLower(rawItem.category || rawItem.file || rawItem.messageFile || rawItem.id || `item_${index + 1}`).replace(/\.json$/i, ''),
      messageFile: cleanId(rawItem.messageFile || rawItem.file || (rawItem.category ? `${cleanLower(rawItem.category).replace(/\.json$/i, '')}.json` : '')),
      enabled: toBool(rawItem.enabled, true),
      messageKey: cleanId(rawItem.messageKey || rawItem.key || ''),
      cooldownMinutes: toPositiveNumber(rawItem.cooldownMinutes, 30),
      weight: Math.max(1, Number.parseInt(rawItem.weight, 10) || 1),
      manualEnabled: toBool(rawItem.manualEnabled, true),
      manualCooldownSeconds: toPositiveNumber(rawItem.manualCooldownSeconds, 30),
      commands: cleanStringList(rawItem.commands || [], [])
    };
  }).filter(item => item.id && item.messageKey);

  return merged;
}

function ensureConfigFile() {
  const filePath = getConfigPath();
  if (!core.fileExists(filePath)) core.writeJson(filePath, DEFAULT_CONFIG, { spaces: 2 });
  return filePath;
}

function loadConfig() {
  const filePath = ensureConfigFile();
  const raw = core.readJson(filePath, null);
  cfg = mergeConfig(raw);
  cfgInfo = {
    ok: true,
    configPath: filePath,
    loadedAt: core.nowIso(),
    itemCount: cfg.items.length,
    enabledItems: cfg.items.filter(item => item.enabled).length
  };
  return { ...cfgInfo, config: cfg };
}

function getConfig() {
  if (!cfg) loadConfig();
  return cfg;
}

function msFromMinutes(minutes) {
  return Math.max(0, Number(minutes || 0)) * 60 * 1000;
}

function ageSeconds(ms) {
  if (!ms) return null;
  return Math.max(0, Math.floor((Date.now() - ms) / 1000));
}

function publicState() {
  const c = getConfig();
  return {
    active: state.active,
    startedAt: state.startedAt,
    stoppedAt: state.stoppedAt,
    chatMessagesSinceLastSend: state.chatMessagesSinceLastSend,
    totalTicks: state.totalTicks,
    ignoredTicks: state.ignoredTicks,
    lastTickAt: state.lastTickAt,
    lastTickUser: state.lastTickUser,
    lastSentAt: state.lastSentAt,
    lastSentAgeSeconds: ageSeconds(state.lastSentAtMs),
    lastItemId: state.lastItemId,
    lastMessageKey: state.lastMessageKey,
    lastMessage: state.lastMessage,
    sendCount: state.sendCount,
    itemState: state.itemState,
    manualState: state.manualState,
    config: {
      enabled: c.enabled,
      runtime: c.runtime,
      chat: c.chat,
      messageOptions: c.messageOptions,
      liveStatus: c.liveStatus,
      items: c.items
    },
    configInfo: cfgInfo
  };
}

function resetRuntimeCounters(options = {}) {
  state.chatMessagesSinceLastSend = 0;
  if (options.full) {
    state.totalTicks = 0;
    state.ignoredTicks = 0;
    state.lastTickAt = null;
    state.lastTickUser = '';
    state.lastSentAtMs = 0;
    state.lastSentAt = null;
    state.lastItemId = '';
    state.lastMessageKey = '';
    state.lastMessage = '';
    state.sendCount = 0;
    state.itemState = {};
    state.manualState = {};
    state.liveStatus = {
      checkedAt: null,
      checkedAtMs: 0,
      online: null,
      ok: null,
      reason: 'not_checked',
      source: '',
      mode: '',
      dataCount: null,
      ageSeconds: null,
      error: ''
    };
  }
}

function startRotator() {
  const c = getConfig();
  state.active = true;
  state.startedAtMs = Date.now();
  state.startedAt = core.nowIso();
  state.stoppedAt = null;
  resetRuntimeCounters({ full: true });
  return { ok: true, message: 'Message-Rotator gestartet.', state: publicState(), enabled: c.enabled };
}

function stopRotator() {
  state.active = false;
  state.stoppedAt = core.nowIso();
  return { ok: true, message: 'Message-Rotator gestoppt.', state: publicState() };
}

function isBotName(name) {
  const c = getConfig();
  const value = cleanLower(name);
  if (!value) return false;
  return (c.chat.botNames || []).includes(value);
}

function getTickUser(req) {
  return cleanId(
    core.getParam(req, 'user', '') ||
    core.getParam(req, 'userName', '') ||
    core.getParam(req, 'username', '') ||
    core.getParam(req, 'login', '') ||
    core.getParam(req, 'displayName', '')
  );
}

function tick(req) {
  const c = getConfig();
  const user = getTickUser(req);
  const explicitBot = toBool(core.getParam(req, 'isBot', core.getParam(req, 'bot', '')), false);
  const ignored = !!(c.chat.ignoreBots && (explicitBot || isBotName(user)));

  state.totalTicks += 1;
  state.lastTickAt = core.nowIso();
  state.lastTickUser = user;

  if (!state.active && c.runtime.onlyWhenLive) {
    return { ok: true, counted: false, ignored: true, reason: 'rotator_not_active', state: publicState() };
  }

  if (ignored) {
    state.ignoredTicks += 1;
    return { ok: true, counted: false, ignored: true, reason: 'ignored_bot', user, state: publicState() };
  }

  state.chatMessagesSinceLastSend += 1;
  return { ok: true, counted: true, ignored: false, user, state: publicState() };
}

function itemRuntime(id) {
  if (!state.itemState[id]) {
    state.itemState[id] = {
      lastSentAt: null,
      lastSentAtMs: 0,
      sendCount: 0
    };
  }
  return state.itemState[id];
}

function getDueItems() {
  const c = getConfig();
  const now = Date.now();
  const due = [];
  const blocked = [];

  for (const item of c.items) {
    const runtime = itemRuntime(item.id);

    if (!item.enabled) {
      blocked.push({ id: item.id, reason: 'item_disabled' });
      continue;
    }

    if (!textHelper.hasKey(item.messageKey)) {
      blocked.push({ id: item.id, messageKey: item.messageKey, reason: 'message_key_not_found' });
      continue;
    }

    const cooldownMs = msFromMinutes(item.cooldownMinutes);
    const elapsed = runtime.lastSentAtMs ? now - runtime.lastSentAtMs : Number.POSITIVE_INFINITY;
    if (runtime.lastSentAtMs && elapsed < cooldownMs) {
      blocked.push({
        id: item.id,
        messageKey: item.messageKey,
        reason: 'item_cooldown',
        remainingSeconds: Math.ceil((cooldownMs - elapsed) / 1000)
      });
      continue;
    }

    due.push({ ...item, runtime });
  }

  return { due, blocked };
}

function chooseWeighted(items) {
  if (items.length === 0) return null;
  const c = getConfig();
  let candidates = [...items];

  if (c.runtime.avoidSameItemBackToBack && candidates.length > 1 && state.lastItemId) {
    candidates = candidates.filter(item => item.id !== state.lastItemId);
  }

  const totalWeight = candidates.reduce((sum, item) => sum + Math.max(1, Number(item.weight || 1)), 0);
  let roll = Math.random() * totalWeight;

  for (const item of candidates) {
    roll -= Math.max(1, Number(item.weight || 1));
    if (roll <= 0) return item;
  }

  return candidates[candidates.length - 1] || null;
}

function block(reason, extra = {}) {
  return {
    ok: true,
    send: false,
    reason,
    rotator_message: '',
    message: '',
    ...extra,
    state: publicState()
  };
}

function buildContext(req) {
  const contextRaw = core.getParam(req, 'context', '');
  let parsed = {};
  if (contextRaw) parsed = core.safeJsonParse(contextRaw, {}) || {};

  return textHelper.flattenContext({
    ...parsed,
    user: core.getParam(req, 'user', parsed.user || ''),
    displayName: core.getParam(req, 'displayName', parsed.displayName || ''),
    login: core.getParam(req, 'login', parsed.login || ''),
    username: core.getParam(req, 'username', parsed.username || ''),
    game: core.getParam(req, 'game', parsed.game || ''),
    gameName: core.getParam(req, 'gameName', parsed.gameName || ''),
    streamTitle: core.getParam(req, 'streamTitle', parsed.streamTitle || '')
  });
}

function updateLiveStatusCache(result) {
  const now = Date.now();
  state.liveStatus = {
    checkedAt: core.nowIso(),
    checkedAtMs: now,
    online: result.online,
    ok: result.ok,
    reason: result.reason || '',
    source: result.source || '',
    mode: result.mode || '',
    dataCount: typeof result.dataCount === 'number' ? result.dataCount : null,
    ageSeconds: 0,
    error: result.error || ''
  };
  return { ...state.liveStatus };
}

function getCachedLiveStatus() {
  if (!state.liveStatus || !state.liveStatus.checkedAtMs) return null;
  const c = getConfig();
  const maxAgeMs = Math.max(0, Number(c.liveStatus.cacheSeconds || 0)) * 1000;
  if (maxAgeMs <= 0) return null;
  const ageMs = Date.now() - state.liveStatus.checkedAtMs;
  if (ageMs > maxAgeMs) return null;
  return { ...state.liveStatus, ageSeconds: Math.floor(ageMs / 1000), fromCache: true };
}

function fetchJsonUrl(rawUrl, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (err) {
      reject(new Error('Ungueltige Live-Status-URL: ' + rawUrl));
      return;
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get(parsed, { timeout: timeoutMs, headers: { accept: 'application/json' } }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('Live-Status HTTP ' + res.statusCode));
          return;
        }
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (err) {
          reject(new Error('Live-Status Antwort ist kein gueltiges JSON'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Live-Status Timeout nach ' + timeoutMs + 'ms'));
    });
    req.on('error', reject);
  });
}

function evaluateOnlineStatus(payload, onlineCheck) {
  const check = cleanLower(onlineCheck || 'data_has_items');
  const data = Array.isArray(payload && payload.data) ? payload.data : [];

  if (check === 'type_live') {
    return { online: data.some(entry => cleanLower(entry && entry.type) === 'live'), dataCount: data.length };
  }

  return { online: data.length > 0, dataCount: data.length };
}

async function checkLiveStatus(options = {}) {
  const c = getConfig();
  const liveCfg = c.liveStatus || {};

  if (!c.runtime.onlyWhenLive) {
    return { ok: true, online: true, reason: 'only_when_live_disabled', skipped: true };
  }

  if (!liveCfg.enabled) {
    return { ok: true, online: true, reason: 'live_status_disabled', skipped: true };
  }

  if (!options.force) {
    const cached = getCachedLiveStatus();
    if (cached) return cached;
  }

  if (liveCfg.mode !== 'twitch_stream_route') {
    return updateLiveStatusCache({
      ok: false,
      online: !liveCfg.failClosed,
      reason: 'unsupported_live_status_mode',
      source: liveCfg.url || '',
      mode: liveCfg.mode || '',
      error: 'Nicht unterstuetzter Live-Status-Modus: ' + liveCfg.mode
    });
  }

  try {
    const payload = await fetchJsonUrl(liveCfg.url, liveCfg.timeoutMs);
    const evaluated = evaluateOnlineStatus(payload, liveCfg.onlineCheck);
    return updateLiveStatusCache({
      ok: true,
      online: evaluated.online,
      reason: evaluated.online ? 'live' : 'not_live',
      source: liveCfg.url,
      mode: liveCfg.mode,
      dataCount: evaluated.dataCount,
      error: ''
    });
  } catch (err) {
    return updateLiveStatusCache({
      ok: false,
      online: !liveCfg.failClosed,
      reason: 'live_status_error',
      source: liveCfg.url,
      mode: liveCfg.mode,
      dataCount: null,
      error: err.message || String(err)
    });
  }
}

async function nextMessage(req) {
  const c = getConfig();
  const now = Date.now();
  const commit = !['0', 'false', 'no', 'nein', 'off'].includes(String(core.getParam(req, 'commit', '1')).trim().toLowerCase());

  if (!c.enabled) return block('rotator_disabled');
  if (!state.active) return block('rotator_not_active');

  if (c.runtime.onlyWhenLive) {
    const live = await checkLiveStatus();
    if (!live.online) {
      return block(live.reason === 'live_status_error' ? 'live_status_error' : 'not_live', { liveStatus: live });
    }
  }
  if (state.startedAtMs) {
    const firstDelayMs = msFromMinutes(c.runtime.firstMessageDelayMinutes);
    const elapsedSinceStart = now - state.startedAtMs;
    if (elapsedSinceStart < firstDelayMs) {
      return block('first_message_delay', {
        remainingSeconds: Math.ceil((firstDelayMs - elapsedSinceStart) / 1000)
      });
    }
  }

  const globalCooldownMs = msFromMinutes(c.runtime.globalCooldownMinutes);
  if (state.lastSentAtMs && (now - state.lastSentAtMs) < globalCooldownMs) {
    return block('global_cooldown', {
      remainingSeconds: Math.ceil((globalCooldownMs - (now - state.lastSentAtMs)) / 1000)
    });
  }

  const minChat = Math.max(0, Number.parseInt(c.runtime.minChatMessagesBetweenRotations, 10) || 0);
  if (state.chatMessagesSinceLastSend < minChat) {
    return block('not_enough_chat_messages', {
      needed: minChat,
      current: state.chatMessagesSinceLastSend
    });
  }

  const { due, blocked } = getDueItems();
  if (due.length === 0) return block('no_due_items', { blockedItems: blocked });

  const item = chooseWeighted(due);
  if (!item) return block('no_item_selected', { blockedItems: blocked });

  const result = textHelper.buildChatResult(item.messageKey, buildContext(req), c.messageOptions || {});
  if (!result.ok) return block(result.error || 'message_build_failed', { result, item });

  if (commit) {
    const runtime = itemRuntime(item.id);
    runtime.lastSentAtMs = now;
    runtime.lastSentAt = core.nowIso();
    runtime.sendCount += 1;

    state.lastSentAtMs = now;
    state.lastSentAt = runtime.lastSentAt;
    state.lastItemId = item.id;
    state.lastMessageKey = item.messageKey;
    state.lastMessage = result.message;
    state.sendCount += 1;

    if (c.runtime.resetChatCounterAfterSend) state.chatMessagesSinceLastSend = 0;
  }

  return {
    ok: true,
    send: true,
    reason: 'ok',
    id: item.id,
    itemId: item.id,
    category: item.category || item.id,
    messageFile: item.messageFile || '',
    messageKey: item.messageKey,
    key: item.messageKey,
    rotator_message: result.message,
    message: result.message,
    text: result.message,
    commit,
    state: publicState()
  };
}

function manualRuntime(id) {
  if (!state.manualState[id]) {
    state.manualState[id] = {
      lastUsedAt: null,
      lastUsedAtMs: 0,
      useCount: 0
    };
  }
  return state.manualState[id];
}

function normalizeCommand(value) {
  const text = cleanLower(value);
  if (!text) return '';
  return text.startsWith('!') ? text : `!${text}`;
}

function findManualItem(req) {
  const c = getConfig();
  const id = cleanLower(
    core.getParam(req, 'id', '') ||
    core.getParam(req, 'item', '') ||
    core.getParam(req, 'itemId', '') ||
    core.getParam(req, 'name', '')
  );
  const category = cleanLower(
    core.getParam(req, 'category', '') ||
    core.getParam(req, 'cat', '') ||
    core.getParam(req, 'file', '') ||
    core.getParam(req, 'messageFile', '')
  ).replace(/\.json$/i, '');
  const command = normalizeCommand(
    core.getParam(req, 'command', '') ||
    core.getParam(req, 'cmd', '') ||
    core.getParam(req, 'input0', '')
  );

  if (id) {
    const byId = c.items.find(item => cleanLower(item.id) === id);
    if (byId) return { item: byId, matchedBy: 'id', value: id };
  }

  if (category) {
    const byCategory = c.items.find(item => cleanLower(item.category || item.id).replace(/\.json$/i, '') === category);
    if (byCategory) return { item: byCategory, matchedBy: 'category', value: category };
  }

  if (command) {
    const byCommand = c.items.find(item => (item.commands || []).map(normalizeCommand).includes(command));
    if (byCommand) return { item: byCommand, matchedBy: 'command', value: command };
  }

  return { item: null, matchedBy: id ? 'id' : (category ? 'category' : (command ? 'command' : '')), value: id || category || command };
}

function manualMessage(req) {
  const c = getConfig();
  const commit = !['0', 'false', 'no', 'nein', 'off'].includes(String(core.getParam(req, 'commit', '1')).trim().toLowerCase());
  const ignoreCooldown = ['1', 'true', 'yes', 'ja', 'on'].includes(String(core.getParam(req, 'ignoreCooldown', core.getParam(req, 'force', ''))).trim().toLowerCase());

  if (!c.enabled) return block('rotator_disabled');

  const found = findManualItem(req);
  const item = found.item;

  if (!item) {
    return block('manual_item_not_found', {
      requested: found.value || '',
      availableItems: c.items.map(entry => ({ id: entry.id, category: entry.category || entry.id, messageFile: entry.messageFile || '', commands: entry.commands || [] }))
    });
  }

  if (!item.enabled) return block('item_disabled', { id: item.id, itemId: item.id });
  if (!item.manualEnabled) return block('manual_disabled', { id: item.id, itemId: item.id });

  if (!textHelper.hasKey(item.messageKey)) {
    return block('message_key_not_found', { id: item.id, itemId: item.id, messageKey: item.messageKey });
  }

  const runtime = manualRuntime(item.id);
  const now = Date.now();
  const cooldownMs = Math.max(0, Number(item.manualCooldownSeconds || 0)) * 1000;

  if (!ignoreCooldown && runtime.lastUsedAtMs && cooldownMs > 0 && (now - runtime.lastUsedAtMs) < cooldownMs) {
    return block('manual_cooldown', {
      id: item.id,
      itemId: item.id,
      messageKey: item.messageKey,
      cooldownSeconds: item.manualCooldownSeconds,
      remainingSeconds: Math.ceil((cooldownMs - (now - runtime.lastUsedAtMs)) / 1000)
    });
  }

  const result = textHelper.buildChatResult(item.messageKey, buildContext(req), c.messageOptions || {});
  if (!result.ok) return block(result.error || 'message_build_failed', { result, item });

  if (commit) {
    runtime.lastUsedAtMs = now;
    runtime.lastUsedAt = core.nowIso();
    runtime.useCount += 1;
  }

  return {
    ok: true,
    send: true,
    reason: 'ok',
    mode: 'manual',
    id: item.id,
    itemId: item.id,
    category: item.category || item.id,
    messageFile: item.messageFile || '',
    matchedBy: found.matchedBy,
    matchedValue: found.value,
    commands: item.commands || [],
    manualCooldownSeconds: item.manualCooldownSeconds,
    messageKey: item.messageKey,
    key: item.messageKey,
    rotator_message: result.message,
    message: result.message,
    text: result.message,
    commit,
    state: publicState()
  };
}


function fileCheck(label, filePath) {
  const cleanPath = String(filePath || '').trim();
  const result = {
    ok: false,
    label,
    path: cleanPath,
    exists: false,
    isFile: false,
    isDirectory: false,
    error: ''
  };

  if (!cleanPath) {
    result.error = 'missing_path';
    return result;
  }

  try {
    const stat = fs.statSync(cleanPath);
    result.exists = true;
    result.isFile = stat.isFile();
    result.isDirectory = stat.isDirectory();
    result.ok = true;
  } catch (err) {
    result.error = err.message || String(err);
  }

  return result;
}

function safeCall(label, fn, fallback = null) {
  try {
    return { ok: true, value: fn(), error: '' };
  } catch (err) {
    return { ok: false, value: fallback, error: err.message || String(err), label };
  }
}

function getMessagesDir() {
  return path.join(path.dirname(getConfigPath()), 'messages');
}

function resolveMessageFilePath(item) {
  const fileName = cleanId(item && item.messageFile ? item.messageFile : '');
  if (!fileName) return '';
  if (path.isAbsolute(fileName)) return fileName;
  return path.join(getMessagesDir(), fileName);
}

function buildMessageRotatorConfig() {
  const c = getConfig();
  return {
    ok: true,
    module: 'message_rotator',
    config: clone(c),
    configInfo: cfgInfo,
    configPath: getConfigPath(),
    source: 'json_with_defaults',
    status: publicState()
  };
}

function buildMessageRotatorSettings() {
  const c = getConfig();
  return {
    ok: true,
    module: 'message_rotator',
    settings: {
      source: 'runtime_and_json_config',
      enabled: c.enabled,
      runtime: clone(c.runtime || {}),
      chat: clone(c.chat || {}),
      messageOptions: clone(c.messageOptions || {}),
      liveStatus: clone(c.liveStatus || {}),
      items: clone(c.items || []),
      state: publicState()
    }
  };
}

function buildMessageRotatorRoutes(req = null) {
  const routeList = [
    { method: 'GET', path: '/api/message-rotator/status', auth: 'local_or_auth', category: 'status', description: 'Message-Rotator Status und Runtime-State.' },
    { method: 'GET', path: '/api/message-rotator/config', auth: 'local_or_auth', category: 'config', description: 'Read-only effektive Message-Rotator-Config.' },
    { method: 'GET', path: '/api/message-rotator/settings', auth: 'local_or_auth', category: 'settings', description: 'Read-only Runtime-/Config-Settings des Message-Rotators.' },
    { method: 'GET', path: '/api/message-rotator/routes', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Routenübersicht des Message-Rotators.' },
    { method: 'GET', path: '/api/message-rotator/integration-check', auth: 'local_or_auth', category: 'diagnostics', description: 'Read-only Integration-Check des Message-Rotators.' },
    { method: 'GET', path: '/api/message-rotator/reload', auth: 'local_or_auth', category: 'admin', description: 'Message-Rotator Config und Texte neu laden.' },
    { method: 'POST', path: '/api/message-rotator/reload', auth: 'local_or_auth', category: 'admin', description: 'Message-Rotator Config und Texte neu laden.' },
    { method: 'GET', path: '/api/message-rotator/start', auth: 'local_or_auth', category: 'control', description: 'Message-Rotator starten.' },
    { method: 'POST', path: '/api/message-rotator/start', auth: 'local_or_auth', category: 'control', description: 'Message-Rotator starten.' },
    { method: 'GET', path: '/api/message-rotator/stop', auth: 'local_or_auth', category: 'control', description: 'Message-Rotator stoppen.' },
    { method: 'POST', path: '/api/message-rotator/stop', auth: 'local_or_auth', category: 'control', description: 'Message-Rotator stoppen.' },
    { method: 'GET', path: '/api/message-rotator/tick', auth: 'local_or_auth', category: 'runtime', description: 'Chat-Tick registrieren.' },
    { method: 'POST', path: '/api/message-rotator/tick', auth: 'local_or_auth', category: 'runtime', description: 'Chat-Tick registrieren.' },
    { method: 'GET', path: '/api/message-rotator/next', auth: 'local_or_auth', category: 'send', description: 'Nächste Rotator-Message prüfen/senden.' },
    { method: 'POST', path: '/api/message-rotator/next', auth: 'local_or_auth', category: 'send', description: 'Nächste Rotator-Message prüfen/senden.' },
    { method: 'GET', path: '/api/message-rotator/manual', auth: 'local_or_auth', category: 'send', description: 'Manuelle Rotator-Message per Command/Item senden.' },
    { method: 'POST', path: '/api/message-rotator/manual', auth: 'local_or_auth', category: 'send', description: 'Manuelle Rotator-Message per Command/Item senden.' },
    { method: 'GET', path: '/api/message-rotator/live-status', auth: 'local_or_auth', category: 'diagnostics', description: 'Live-Status prüfen/lesen.' },
    { method: 'POST', path: '/api/message-rotator/live-status', auth: 'local_or_auth', category: 'diagnostics', description: 'Live-Status prüfen/lesen.' },

    { method: 'GET', path: '/message-rotator/status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Status.' },
    { method: 'GET', path: '/message-rotator/config', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Config.' },
    { method: 'GET', path: '/message-rotator/settings', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Settings.' },
    { method: 'GET', path: '/message-rotator/routes', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Routenübersicht.' },
    { method: 'GET', path: '/message-rotator/integration-check', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Integration-Check.' },
    { method: 'GET', path: '/message-rotator/reload', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reload.' },
    { method: 'POST', path: '/message-rotator/reload', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Reload.' },
    { method: 'GET', path: '/message-rotator/start', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Start.' },
    { method: 'POST', path: '/message-rotator/start', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Start.' },
    { method: 'GET', path: '/message-rotator/stop', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Stop.' },
    { method: 'POST', path: '/message-rotator/stop', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Stop.' },
    { method: 'GET', path: '/message-rotator/tick', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Tick.' },
    { method: 'POST', path: '/message-rotator/tick', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Tick.' },
    { method: 'GET', path: '/message-rotator/next', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Next.' },
    { method: 'POST', path: '/message-rotator/next', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Next.' },
    { method: 'GET', path: '/message-rotator/manual', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Manual.' },
    { method: 'POST', path: '/message-rotator/manual', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Manual.' },
    { method: 'GET', path: '/message-rotator/live-status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Live-Status.' },
    { method: 'POST', path: '/message-rotator/live-status', auth: 'legacy/local_or_auth', category: 'legacy', description: 'Legacy-Route für Live-Status.' }
  ];

  return {
    ok: true,
    module: 'message_rotator',
    version: 1,
    standardPrefix: '/api/message-rotator',
    legacyPrefixes: ['/message-rotator'],
    standardEndpoints: {
      status: '/api/message-rotator/status',
      config: '/api/message-rotator/config',
      settings: '/api/message-rotator/settings',
      routes: '/api/message-rotator/routes',
      integrationCheck: '/api/message-rotator/integration-check',
      reload: '/api/message-rotator/reload'
    },
    routes: routeList,
    count: routeList.length,
    categories: Array.from(new Set(routeList.map(route => route.category))).sort(),
    notes: [
      'Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.',
      'Bestehende Legacy-Routen bleiben erhalten.',
      'Schreibende Routen sind nur dokumentiert, nicht neu angelegt.',
      '/api/message-rotator/config und /api/message-rotator/settings sind read-only Standard-Aliase.'
    ],
    security: req ? security.securitySummary(req) : security.securitySummary()
  };
}

function buildMessageRotatorIntegrationCheck(req = null) {
  const warnings = [];
  const errors = [];
  const checks = {};

  const configCheck = safeCall('config', () => {
    const c = getConfig();
    return {
      ok: !!c,
      enabled: !!c.enabled,
      configPath: getConfigPath(),
      itemCount: Array.isArray(c.items) ? c.items.length : 0,
      enabledItems: Array.isArray(c.items) ? c.items.filter(item => item.enabled).length : 0,
      source: 'json_with_defaults',
      error: ''
    };
  }, { ok: false, error: 'config_check_failed' });
  checks.config = configCheck.ok ? configCheck.value : { ok: false, error: configCheck.error };

  checks.files = {
    config: fileCheck('config', getConfigPath()),
    messagesDir: fileCheck('messagesDir', getMessagesDir())
  };

  const c = getConfig();
  const itemFiles = {};
  (c.items || []).forEach(item => {
    const label = `messageFile.${item.id || item.messageKey || item.messageFile || 'unknown'}`;
    itemFiles[label] = fileCheck(label, resolveMessageFilePath(item));
  });
  checks.messageFiles = itemFiles;

  const textStatusCheck = safeCall('textHelperStatus', () => textHelper.getStatus ? textHelper.getStatus() : null, null);
  checks.texts = {
    ok: textStatusCheck.ok && !!textStatusCheck.value && textStatusCheck.value.ok !== false,
    status: textStatusCheck.value,
    error: textStatusCheck.error
  };

  const sampleChecks = {};
  (c.items || []).filter(item => item.enabled).slice(0, 5).forEach(item => {
    const result = safeCall(`sample.${item.messageKey}`, () => textHelper.buildChatResult(item.messageKey, {}, c.messageOptions || {}), null);
    sampleChecks[item.messageKey] = {
      ok: result.ok && !!result.value && result.value.ok !== false,
      value: result.value,
      error: result.error
    };
  });
  checks.samples = sampleChecks;

  checks.runtime = {
    ok: true,
    active: state.active,
    totalTicks: state.totalTicks,
    ignoredTicks: state.ignoredTicks,
    sendCount: state.sendCount,
    chatMessagesSinceLastSend: state.chatMessagesSinceLastSend,
    lastSentAt: state.lastSentAt,
    lastItemId: state.lastItemId,
    liveStatus: clone(state.liveStatus || {})
  };

  checks.liveStatusConfig = {
    ok: !!(c.liveStatus && c.liveStatus.url),
    enabled: !!(c.liveStatus && c.liveStatus.enabled),
    mode: c.liveStatus ? c.liveStatus.mode : '',
    url: c.liveStatus ? c.liveStatus.url : '',
    failClosed: c.liveStatus ? !!c.liveStatus.failClosed : null,
    cacheSeconds: c.liveStatus ? c.liveStatus.cacheSeconds : null
  };

  Object.entries(checks.files).forEach(([key, check]) => {
    if (!check.ok) errors.push(`${key}:${check.error || 'not_ok'}`);
  });
  Object.entries(checks.messageFiles).forEach(([key, check]) => {
    if (!check.ok) errors.push(`${key}:${check.error || 'not_ok'}`);
  });
  if (!checks.config.ok) errors.push(`config:${checks.config.error || 'not_ok'}`);
  if (!checks.texts.ok) errors.push(`texts:${checks.texts.error || 'not_ok'}`);
  Object.entries(checks.samples).forEach(([key, check]) => {
    if (!check.ok) warnings.push(`sample.${key}:${check.error || (check.value && check.value.error) || 'not_ok'}`);
  });
  if (!checks.liveStatusConfig.ok) warnings.push('liveStatusConfig:url_missing');

  return {
    ok: errors.length === 0,
    module: 'message_rotator',
    version: 1,
    healthy: errors.length === 0,
    warnings,
    errors,
    checks,
    routes: {
      status: '/api/message-rotator/status',
      config: '/api/message-rotator/config',
      settings: '/api/message-rotator/settings',
      routes: '/api/message-rotator/routes',
      integrationCheck: '/api/message-rotator/integration-check',
      reload: '/api/message-rotator/reload'
    },
    notes: [
      'Read-only Integration-Check für Dashboard-/Modul-Standardisierung.',
      'Es werden keine DB-, JSON- oder Dateiänderungen vorgenommen.',
      'Sample-Warnungen bedeuten nur, dass einzelne Message-Keys fehlen oder nicht rendern.'
    ],
    security: req ? security.securitySummary(req) : security.securitySummary()
  };
}

function wantsPlain(req) {
  return String(core.getParam(req, 'plain', '') || '').trim() === '1';
}

function sendResponse(req, res, payload, statusCode = 200) {
  if (wantsPlain(req)) {
    return res.status(statusCode).type('text/plain; charset=utf-8').send(payload && payload.send ? (payload.message || '') : '');
  }
  return res.status(statusCode).json(payload);
}

function checkAuth(req) {
  const result = security.canAccess(req);
  return { ok: result.allowed, reason: result.reason, clientIp: result.clientIp };
}

function guarded(handler) {
  return function routeHandler(req, res) {
    const auth = checkAuth(req);
    if (!auth.ok) return sendResponse(req, res, { ok: false, send: false, error: 'unauthorized', message: 'Nicht autorisiert.' }, 403);

    try {
      const result = handler(req, res);
      if (result && typeof result.then === 'function') {
        return result.catch(err => {
          console.error('[message_rotator] route error:', err);
          return sendResponse(req, res, { ok: false, send: false, error: err.message || String(err), message: '' }, 500);
        });
      }
      return result;
    } catch (err) {
      console.error('[message_rotator] route error:', err);
      return sendResponse(req, res, { ok: false, send: false, error: err.message || String(err), message: '' }, 500);
    }
  };
}

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) throw new Error('Express app in ctx.app fehlt.');

  loadConfig();
  textHelper.ensureDefaultMessageFiles();
  textHelper.reload();

  if (cfg.runtime.startActiveOnServerStart) startRotator();

  const statusHandler = guarded((req, res) => res.json({ ok: true, ...publicState() }));
  routes.registerGet(app, ['/message-rotator/status', '/api/message-rotator/status'], statusHandler);

  const configHandler = guarded((req, res) => res.json(buildMessageRotatorConfig()));
  routes.registerGet(app, ['/message-rotator/config', '/api/message-rotator/config'], configHandler);

  const settingsHandler = guarded((req, res) => res.json(buildMessageRotatorSettings()));
  routes.registerGet(app, ['/message-rotator/settings', '/api/message-rotator/settings'], settingsHandler);

  const routesHandler = guarded((req, res) => res.json(buildMessageRotatorRoutes(req)));
  routes.registerGet(app, ['/message-rotator/routes', '/api/message-rotator/routes'], routesHandler);

  const integrationCheckHandler = guarded((req, res) => res.json(buildMessageRotatorIntegrationCheck(req)));
  routes.registerGet(app, ['/message-rotator/integration-check', '/api/message-rotator/integration-check'], integrationCheckHandler);

  const reloadHandler = guarded((req, res) => {
    const result = loadConfig();
    textHelper.reload();
    return res.json({ ok: true, ...result, state: publicState() });
  });
  routes.registerGet(app, ['/message-rotator/reload', '/api/message-rotator/reload'], reloadHandler);
  routes.registerPost(app, ['/message-rotator/reload', '/api/message-rotator/reload'], reloadHandler);

  const startHandler = guarded((req, res) => sendResponse(req, res, startRotator()));
  routes.registerGet(app, ['/message-rotator/start', '/api/message-rotator/start'], startHandler);
  routes.registerPost(app, ['/message-rotator/start', '/api/message-rotator/start'], startHandler);

  const stopHandler = guarded((req, res) => sendResponse(req, res, stopRotator()));
  routes.registerGet(app, ['/message-rotator/stop', '/api/message-rotator/stop'], stopHandler);
  routes.registerPost(app, ['/message-rotator/stop', '/api/message-rotator/stop'], stopHandler);

  const tickHandler = guarded((req, res) => sendResponse(req, res, tick(req)));
  routes.registerGet(app, ['/message-rotator/tick', '/api/message-rotator/tick'], tickHandler);
  routes.registerPost(app, ['/message-rotator/tick', '/api/message-rotator/tick'], tickHandler);

  const nextHandler = guarded(async (req, res) => sendResponse(req, res, await nextMessage(req)));
  routes.registerGet(app, ['/message-rotator/next', '/api/message-rotator/next'], nextHandler);
  routes.registerPost(app, ['/message-rotator/next', '/api/message-rotator/next'], nextHandler);

  const manualHandler = guarded((req, res) => sendResponse(req, res, manualMessage(req)));
  routes.registerGet(app, ['/message-rotator/manual', '/api/message-rotator/manual'], manualHandler);
  routes.registerPost(app, ['/message-rotator/manual', '/api/message-rotator/manual'], manualHandler);

  const liveStatusHandler = guarded(async (req, res) => {
    const force = ['1', 'true', 'yes', 'ja', 'on'].includes(String(core.getParam(req, 'force', '')).trim().toLowerCase());
    const liveStatus = await checkLiveStatus({ force });
    return res.json({ ok: true, liveStatus, state: publicState() });
  });
  routes.registerGet(app, ['/message-rotator/live-status', '/api/message-rotator/live-status'], liveStatusHandler);
  routes.registerPost(app, ['/message-rotator/live-status', '/api/message-rotator/live-status'], liveStatusHandler);

  console.log('[message_rotator] /message-rotator/* und /api/message-rotator/* aktiv');
}

module.exports = { init };
