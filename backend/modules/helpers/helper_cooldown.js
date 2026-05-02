'use strict';

const core = require('./helper_core');

function nowMs() {
  return Date.now();
}

function toMs(value, unit = 'seconds') {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  switch (unit) {
    case 'ms':
    case 'millisecond':
    case 'milliseconds': return Math.floor(n);
    case 'minute':
    case 'minutes': return Math.floor(n * 60 * 1000);
    case 'hour':
    case 'hours': return Math.floor(n * 60 * 60 * 1000);
    case 'second':
    case 'seconds':
    default: return Math.floor(n * 1000);
  }
}

function isoFromMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n).toISOString();
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function normalizeKey(...parts) {
  return parts
    .flat()
    .map(part => String(part ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join(':');
}

function checkCooldown(lastAtMs, cooldownMs, currentMs = nowMs()) {
  const last = Number(lastAtMs) || 0;
  const cooldown = Math.max(0, Number(cooldownMs) || 0);
  const now = Number(currentMs) || nowMs();
  const elapsed = last > 0 ? Math.max(0, now - last) : null;
  const remaining = last > 0 ? Math.max(0, cooldown - (elapsed || 0)) : 0;
  const allowed = cooldown <= 0 || last <= 0 || remaining <= 0;

  return {
    ok: true,
    allowed,
    reason: allowed ? 'cooldown_ready' : 'cooldown_active',
    lastAtMs: last,
    lastAt: isoFromMs(last),
    cooldownMs: cooldown,
    cooldownSeconds: Math.ceil(cooldown / 1000),
    elapsedMs: elapsed,
    remainingMs: allowed ? 0 : remaining,
    remainingSeconds: allowed ? 0 : Math.ceil(remaining / 1000),
    remainingText: formatDuration(allowed ? 0 : remaining),
    nextAtMs: last > 0 ? last + cooldown : now,
    nextAt: isoFromMs(last > 0 ? last + cooldown : now)
  };
}

function roleRank(user = {}) {
  const roles = user.roles || user.badges || user || {};
  const login = String(user.login || user.user || '').toLowerCase();
  if (roles.broadcaster === true || roles.isBroadcaster === true || user.isBroadcaster === true) return 'broadcaster';
  if (roles.mod === true || roles.moderator === true || roles.isMod === true || user.isMod === true) return 'mod';
  if (roles.vip === true || roles.isVip === true || user.isVip === true) return 'vip';
  if (roles.sub === true || roles.subscriber === true || roles.isSub === true || user.isSub === true) return 'sub';
  if (login && roles[login] === 'broadcaster') return 'broadcaster';
  return 'default';
}

function resolveRoleCooldown(config = {}, user = {}) {
  const role = roleRank(user);
  const roles = config.roles || config.perRole || config.perUserSeconds || {};
  let seconds = roles[role];
  if (seconds === undefined || seconds === null) seconds = roles.default;
  if (seconds === undefined || seconds === null) seconds = config.defaultSeconds;
  if (seconds === undefined || seconds === null) seconds = config.seconds;
  return { role, seconds: Number(seconds) || 0, ms: toMs(Number(seconds) || 0, 'seconds') };
}

function createCooldownStore(initial = {}) {
  const store = new Map();
  if (initial && typeof initial === 'object') {
    for (const [key, value] of Object.entries(initial)) store.set(normalizeKey(key), Number(value) || 0);
  }

  return {
    get(key) {
      return store.get(normalizeKey(key)) || 0;
    },
    set(key, valueMs = nowMs()) {
      const cleanKey = normalizeKey(key);
      if (!cleanKey) return 0;
      store.set(cleanKey, Number(valueMs) || nowMs());
      return store.get(cleanKey);
    },
    touch(key, valueMs = nowMs()) {
      return this.set(key, valueMs);
    },
    check(key, cooldownMs, currentMs = nowMs()) {
      const cleanKey = normalizeKey(key);
      const result = checkCooldown(this.get(cleanKey), cooldownMs, currentMs);
      return { ...result, key: cleanKey };
    },
    checkAndTouch(key, cooldownMs, currentMs = nowMs()) {
      const cleanKey = normalizeKey(key);
      const result = this.check(cleanKey, cooldownMs, currentMs);
      if (result.allowed) this.set(cleanKey, currentMs);
      return result;
    },
    clear(key) {
      if (key === undefined || key === null || String(key).trim() === '') {
        store.clear();
        return true;
      }
      return store.delete(normalizeKey(key));
    },
    dump() {
      const out = {};
      for (const [key, value] of store.entries()) out[key] = value;
      return out;
    },
    load(data = {}) {
      store.clear();
      if (data && typeof data === 'object') {
        for (const [key, value] of Object.entries(data)) store.set(normalizeKey(key), Number(value) || 0);
      }
      return this.dump();
    }
  };
}

function checkRule(store, rule = {}, context = {}) {
  const moduleName = context.module || context.moduleName || 'module';
  const type = context.type || rule.type || 'global';
  const user = context.user || {};
  const command = context.command || '';
  const item = context.item || context.sound || context.alertType || '';

  let key = rule.key || normalizeKey(type, moduleName, user.login || user.displayName || '', command, item);
  let cooldownMs = 0;

  if (rule.cooldownMs !== undefined) cooldownMs = Number(rule.cooldownMs) || 0;
  else if (rule.seconds !== undefined) cooldownMs = toMs(rule.seconds, 'seconds');
  else if (rule.minutes !== undefined) cooldownMs = toMs(rule.minutes, 'minutes');
  else if (rule.roles || rule.perRole || rule.perUserSeconds || rule.defaultSeconds !== undefined) cooldownMs = resolveRoleCooldown(rule, user).ms;

  const result = store.check(key, cooldownMs, context.nowMs || nowMs());
  return { ...result, key, type, role: resolveRoleCooldown(rule, user).role };
}

module.exports = {
  nowMs,
  toMs,
  isoFromMs,
  formatDuration,
  normalizeKey,
  checkCooldown,
  roleRank,
  resolveRoleCooldown,
  createCooldownStore,
  checkRule
};
