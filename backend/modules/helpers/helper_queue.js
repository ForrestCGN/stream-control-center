'use strict';

const core = require('./helper_core');

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function cleanId(value) {
  return String(value || '').trim();
}

function normalizePriority(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.floor(n)));
}

function createItem(input = {}, defaults = {}) {
  const createdAt = input.createdAt || nowIso();
  return {
    id: cleanId(input.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: cleanId(input.type) || cleanId(defaults.type) || 'queue.item',
    priority: normalizePriority(input.priority, normalizePriority(defaults.priority, 50)),
    createdAt,
    notBefore: input.notBefore || null,
    dedupeKey: cleanId(input.dedupeKey),
    payload: input.payload && typeof input.payload === 'object' ? input.payload : {},
    meta: input.meta && typeof input.meta === 'object' ? input.meta : {}
  };
}

function sortQueue(items) {
  return items.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  });
}

function createQueue(options = {}) {
  const maxItems = Number.isInteger(options.maxItems) ? options.maxItems : 100;
  const historyMax = Number.isInteger(options.historyMax) ? options.historyMax : 50;
  const items = [];
  const history = [];
  let current = null;
  let paused = options.paused === true;

  function trim() {
    while (items.length > maxItems) items.pop();
    while (history.length > historyMax) history.shift();
  }

  return {
    enqueue(input, defaults = {}) {
      const item = createItem(input, defaults);
      if (item.dedupeKey && items.some(existing => existing.dedupeKey === item.dedupeKey)) {
        return { ok: false, reason: 'duplicate', item, queueLength: items.length };
      }
      items.push(item);
      sortQueue(items);
      trim();
      return { ok: true, item, queueLength: items.length };
    },
    dequeue() {
      if (paused) return { ok: false, reason: 'paused', item: null };
      if (current) return { ok: false, reason: 'current_active', item: current };
      const item = items.shift() || null;
      current = item;
      return { ok: !!item, reason: item ? '' : 'empty', item };
    },
    complete(result = {}) {
      if (!current) return { ok: false, reason: 'no_current' };
      const done = { ...current, completedAt: nowIso(), result };
      history.push(done);
      current = null;
      trim();
      return { ok: true, item: done };
    },
    skip(reason = 'skipped') {
      if (!current) return { ok: false, reason: 'no_current' };
      return this.complete({ skipped: true, reason });
    },
    clear() {
      const count = items.length;
      items.length = 0;
      return { ok: true, cleared: count };
    },
    pause() { paused = true; return { ok: true, paused }; },
    resume() { paused = false; return { ok: true, paused }; },
    peek() { return items[0] || null; },
    current() { return current; },
    list() { return items.slice(); },
    history() { return history.slice(); },
    size() { return items.length; },
    isPaused() { return paused; },
    dump() {
      return { paused, current, items: items.slice(), history: history.slice() };
    },
    load(state = {}) {
      items.length = 0;
      history.length = 0;
      current = state.current || null;
      paused = state.paused === true;
      if (Array.isArray(state.items)) items.push(...state.items.map(createItem));
      if (Array.isArray(state.history)) history.push(...state.history);
      sortQueue(items);
      trim();
      return this.dump();
    }
  };
}

module.exports = {
  nowIso,
  createItem,
  createQueue,
  normalizePriority,
  sortQueue
};
