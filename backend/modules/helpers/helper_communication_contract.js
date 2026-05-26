'use strict';

/**
 * Module-to-module contract layer for the existing Communication Bus.
 *
 * This helper decorates the current bus instance with backend module registry,
 * subscriptions and convenience methods. Existing WebSocket, replay and ACK
 * behaviour stays untouched; modules opt in by calling ensureModuleBus(bus).
 */

const MODULE_META = {
  name: 'helper_communication_contract',
  version: '0.1.0',
  description: 'Backend module-to-module contract layer for the Communication Bus'
};

const CONTRACT_KEY = Symbol.for('cgn.communication.moduleContract.v1');

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value ?? null));
  } catch (_) {
    return null;
  }
}

function sanitizeId(value, fallbackPrefix = 'module') {
  const clean = cleanString(value).replace(/[^a-zA-Z0-9_.:-]/g, '_');
  if (clean) return clean;
  return `${fallbackPrefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function asPattern(value, fallback = '*') {
  const clean = cleanString(value, fallback);
  return clean || fallback;
}

function patternMatches(pattern, value) {
  const p = asPattern(pattern, '*');
  const v = cleanString(value);
  return p === '*' || p === v;
}

function normalizeModuleInfo(moduleInfo = {}) {
  const raw = isPlainObject(moduleInfo) ? moduleInfo : {};
  const meta = isPlainObject(raw.meta) ? raw.meta : {};
  const moduleName = cleanString(raw.module || raw.name || meta.name || raw.moduleName, 'unknown_module');
  const id = sanitizeId(raw.id || raw.clientId || moduleName, 'module');
  return {
    id,
    module: moduleName,
    name: cleanString(raw.displayName || raw.title || raw.name || moduleName, moduleName),
    version: cleanString(raw.version || raw.moduleVersion || meta.version || ''),
    type: cleanString(raw.type, 'backend_module'),
    mode: cleanString(raw.mode, 'module_contract'),
    capabilities: toArray(raw.capabilities),
    enabled: raw.enabled !== false,
    health: cleanString(raw.health, 'unknown'),
    status: cleanString(raw.status, 'registered'),
    lastError: cleanString(raw.lastError || ''),
    dependencies: toArray(raw.dependencies),
    meta: isPlainObject(raw.meta) ? safeJson(raw.meta) || {} : {},
    registeredAt: cleanString(raw.registeredAt, nowIso()),
    lastHeartbeatAt: cleanString(raw.lastHeartbeatAt, ''),
    lastStatusAt: cleanString(raw.lastStatusAt, ''),
    updatedAt: nowIso()
  };
}

function normalizeSubscription(raw = {}) {
  const id = sanitizeId(raw.id || `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`, 'sub');
  return {
    id,
    moduleId: cleanString(raw.moduleId || raw.module || raw.sourceModule || ''),
    channel: asPattern(raw.channel, '*'),
    action: asPattern(raw.action, '*'),
    eventType: asPattern(raw.type || raw.eventType, '*'),
    once: raw.once === true,
    enabled: raw.enabled !== false,
    description: cleanString(raw.description || ''),
    registeredAt: nowIso(),
    lastDeliveredAt: '',
    deliveredCount: 0,
    errorCount: 0,
    lastError: '',
    handler: typeof raw.handler === 'function' ? raw.handler : null
  };
}

function publicModule(moduleInfo) {
  if (!moduleInfo) return null;
  return {
    id: moduleInfo.id,
    module: moduleInfo.module,
    name: moduleInfo.name,
    version: moduleInfo.version,
    type: moduleInfo.type,
    mode: moduleInfo.mode,
    capabilities: [...moduleInfo.capabilities],
    enabled: moduleInfo.enabled,
    health: moduleInfo.health,
    status: moduleInfo.status,
    lastError: moduleInfo.lastError,
    dependencies: [...moduleInfo.dependencies],
    registeredAt: moduleInfo.registeredAt,
    lastHeartbeatAt: moduleInfo.lastHeartbeatAt,
    lastStatusAt: moduleInfo.lastStatusAt,
    updatedAt: moduleInfo.updatedAt,
    meta: safeJson(moduleInfo.meta) || {}
  };
}

function publicSubscription(subscription) {
  if (!subscription) return null;
  return {
    id: subscription.id,
    moduleId: subscription.moduleId,
    channel: subscription.channel,
    action: subscription.action,
    eventType: subscription.eventType,
    once: subscription.once,
    enabled: subscription.enabled,
    description: subscription.description,
    registeredAt: subscription.registeredAt,
    lastDeliveredAt: subscription.lastDeliveredAt,
    deliveredCount: subscription.deliveredCount,
    errorCount: subscription.errorCount,
    lastError: subscription.lastError
  };
}

function getEventField(event, key, fallback = '') {
  if (!event || typeof event !== 'object') return fallback;
  return cleanString(event[key], fallback);
}

function subscriptionMatches(subscription, event) {
  if (!subscription || subscription.enabled === false || !event) return false;
  if (!patternMatches(subscription.eventType, getEventField(event, 'type', 'event'))) return false;
  if (!patternMatches(subscription.channel, getEventField(event, 'channel', 'system'))) return false;
  if (!patternMatches(subscription.action, getEventField(event, 'action', 'message'))) return false;
  return true;
}

function ensureModuleBus(bus, options = {}) {
  if (!bus || typeof bus !== 'object') {
    throw new Error('helper_communication_contract.ensureModuleBus: bus fehlt.');
  }

  if (bus[CONTRACT_KEY]) return bus[CONTRACT_KEY].api;

  const originalEmit = typeof bus.emit === 'function' ? bus.emit.bind(bus) : null;
  if (!originalEmit) {
    throw new Error('helper_communication_contract.ensureModuleBus: bus.emit fehlt.');
  }

  const modules = new Map();
  const subscriptions = new Map();
  const stats = {
    createdAt: nowIso(),
    moduleRegistrations: 0,
    moduleUnregistrations: 0,
    moduleHeartbeats: 0,
    moduleStatuses: 0,
    subscriptions: 0,
    unsubscriptions: 0,
    backendDeliveries: 0,
    backendDeliveryErrors: 0,
    emittedThroughContract: 0
  };

  function registerModule(moduleInfo = {}) {
    const normalized = normalizeModuleInfo(moduleInfo);
    const existing = modules.get(normalized.id);
    const merged = {
      ...(existing || {}),
      ...normalized,
      registeredAt: existing ? existing.registeredAt : normalized.registeredAt,
      updatedAt: nowIso(),
      status: cleanString(normalized.status, existing ? existing.status : 'registered'),
      health: cleanString(normalized.health, existing ? existing.health : 'unknown')
    };

    modules.set(merged.id, merged);
    stats.moduleRegistrations += 1;

    if (typeof bus.registerClient === 'function') {
      try {
        bus.registerClient(null, {
          id: merged.id,
          type: 'backend_module',
          mode: 'module_contract',
          module: merged.module,
          name: merged.name,
          version: merged.version,
          capabilities: merged.capabilities,
          meta: {
            ...(merged.meta || {}),
            via: 'module_contract'
          }
        });
      } catch (_) {}
    }

    return { ok: true, module: publicModule(merged) };
  }

  function unregisterModule(moduleId, reason = 'module_unregister') {
    const id = cleanString(moduleId);
    const existing = modules.get(id);
    if (!existing) return { ok: false, reason: 'module_not_found', moduleId: id };

    existing.status = 'offline';
    existing.health = 'unknown';
    existing.updatedAt = nowIso();
    modules.set(id, existing);
    stats.moduleUnregistrations += 1;

    if (typeof bus.unregisterClient === 'function') {
      try { bus.unregisterClient(id, reason); } catch (_) {}
    }

    return { ok: true, module: publicModule(existing) };
  }

  function heartbeatModule(moduleId, payload = {}) {
    const id = cleanString(moduleId || payload.id || payload.module);
    if (!id) return { ok: false, reason: 'module_id_missing' };

    if (!modules.has(id)) {
      registerModule({ ...payload, id });
    }

    const existing = modules.get(id);
    existing.status = cleanString(payload.status, 'online');
    existing.health = cleanString(payload.health, existing.health || 'ok');
    existing.lastHeartbeatAt = nowIso();
    existing.updatedAt = existing.lastHeartbeatAt;
    existing.lastError = cleanString(payload.lastError || existing.lastError || '');
    if (Array.isArray(payload.capabilities)) existing.capabilities = toArray(payload.capabilities);
    if (payload.version || payload.moduleVersion) existing.version = cleanString(payload.version || payload.moduleVersion);
    modules.set(id, existing);
    stats.moduleHeartbeats += 1;

    if (typeof bus.heartbeat === 'function') {
      try {
        bus.heartbeat(id, {
          id,
          type: 'backend_module',
          module: existing.module,
          version: existing.version,
          capabilities: existing.capabilities
        });
      } catch (_) {}
    }

    return { ok: true, module: publicModule(existing) };
  }

  function updateModuleStatus(moduleId, status = {}) {
    const id = cleanString(moduleId || status.id || status.module);
    if (!id) return { ok: false, reason: 'module_id_missing' };

    if (!modules.has(id)) {
      registerModule({ ...status, id });
    }

    const existing = modules.get(id);
    existing.enabled = status.enabled !== undefined ? status.enabled !== false : existing.enabled;
    existing.health = cleanString(status.health, existing.health || 'unknown');
    existing.status = cleanString(status.status, existing.status || 'status');
    existing.lastError = cleanString(status.lastError || existing.lastError || '');
    existing.lastStatusAt = nowIso();
    existing.updatedAt = existing.lastStatusAt;
    if (status.version || status.moduleVersion) existing.version = cleanString(status.version || status.moduleVersion);
    if (Array.isArray(status.capabilities)) existing.capabilities = toArray(status.capabilities);
    if (Array.isArray(status.dependencies)) existing.dependencies = toArray(status.dependencies);
    if (isPlainObject(status.meta)) existing.meta = safeJson({ ...(existing.meta || {}), ...status.meta }) || existing.meta;
    modules.set(id, existing);
    stats.moduleStatuses += 1;

    return { ok: true, module: publicModule(existing) };
  }

  function subscribe(rawSubscription = {}, maybeHandler = null) {
    const subscription = normalizeSubscription({
      ...(rawSubscription || {}),
      handler: typeof maybeHandler === 'function' ? maybeHandler : rawSubscription.handler
    });
    if (!subscription.handler) return { ok: false, reason: 'handler_required' };
    subscriptions.set(subscription.id, subscription);
    stats.subscriptions += 1;
    return { ok: true, subscription: publicSubscription(subscription) };
  }

  function unsubscribe(subscriptionId) {
    const id = cleanString(subscriptionId);
    const existing = subscriptions.get(id);
    if (!existing) return { ok: false, reason: 'subscription_not_found', subscriptionId: id };
    subscriptions.delete(id);
    stats.unsubscriptions += 1;
    return { ok: true, subscription: publicSubscription(existing) };
  }

  function deliverToModuleSubscribers(event, emitResult) {
    const delivered = [];
    const errors = [];

    for (const subscription of subscriptions.values()) {
      if (!subscriptionMatches(subscription, event)) continue;

      try {
        subscription.handler(event, {
          bus: api,
          rawBus: bus,
          emitResult: emitResult || null,
          subscription: publicSubscription(subscription)
        });
        subscription.deliveredCount += 1;
        subscription.lastDeliveredAt = nowIso();
        delivered.push(subscription.id);
        stats.backendDeliveries += 1;
        if (subscription.once === true) subscriptions.delete(subscription.id);
      } catch (err) {
        const errorMessage = err && err.message ? err.message : String(err);
        subscription.errorCount += 1;
        subscription.lastError = errorMessage;
        errors.push({ subscriptionId: subscription.id, moduleId: subscription.moduleId, error: errorMessage });
        stats.backendDeliveryErrors += 1;

        if (typeof bus.trackIssue === 'function') {
          try {
            bus.trackIssue(`module_contract_delivery_${subscription.id}`, `Module bus subscriber failed: ${subscription.id}`, {
              level: 'warn',
              details: {
                subscriptionId: subscription.id,
                moduleId: subscription.moduleId,
                channel: event.channel,
                action: event.action,
                error: errorMessage
              }
            });
          } catch (_) {}
        }
      }
    }

    return { delivered, errors };
  }

  function normalizeOutgoing(message = {}) {
    if (typeof bus.normalizeMessage === 'function') {
      return bus.normalizeMessage(message);
    }
    return {
      id: cleanString(message.id || message.eventId, `evt_${Date.now().toString(36)}`),
      type: cleanString(message.type, 'event'),
      channel: cleanString(message.channel, 'system'),
      action: cleanString(message.action || message.event, 'message'),
      source: isPlainObject(message.source) ? message.source : {},
      target: isPlainObject(message.target) ? message.target : { type: 'all', id: '*' },
      timestamp: cleanString(message.timestamp, nowIso()),
      payload: safeJson(message.payload || {}) || {},
      meta: isPlainObject(message.meta) ? safeJson(message.meta) || {} : {}
    };
  }

  function emit(message = {}) {
    const normalized = normalizeOutgoing(message);
    const result = originalEmit(normalized);
    const moduleDelivery = deliverToModuleSubscribers(normalized, result);
    stats.emittedThroughContract += 1;

    if (result && typeof result === 'object') {
      result.moduleSubscribers = {
        deliveredTo: moduleDelivery.delivered,
        deliveredCount: moduleDelivery.delivered.length,
        errors: moduleDelivery.errors,
        errorCount: moduleDelivery.errors.length
      };
    }

    return result;
  }

  function publishModuleStatus(moduleId, status = {}) {
    const updated = updateModuleStatus(moduleId, status);
    const moduleInfo = updated.module || publicModule(modules.get(cleanString(moduleId)));
    const result = emit({
      type: 'event',
      channel: 'module.status',
      action: 'update',
      source: {
        type: 'backend_module',
        id: moduleInfo ? moduleInfo.id : cleanString(moduleId),
        module: moduleInfo ? moduleInfo.module : cleanString(moduleId)
      },
      target: { type: 'all', id: '*' },
      payload: {
        module: moduleInfo,
        status: safeJson(status) || {}
      },
      meta: {
        requireAck: false,
        replayable: true,
        ttlMs: 30000,
        productionTarget: true
      }
    });

    return { ok: updated.ok === true, module: moduleInfo, event: result };
  }

  function getModuleContractStatus() {
    return {
      ok: true,
      helper: MODULE_META.name,
      helperVersion: MODULE_META.version,
      createdAt: stats.createdAt,
      now: nowIso(),
      stats: { ...stats },
      modules: [...modules.values()].map(publicModule),
      subscriptions: [...subscriptions.values()].map(publicSubscription)
    };
  }

  function createModuleClient(moduleInfo = {}) {
    const registered = registerModule(moduleInfo);
    const id = registered.module ? registered.module.id : sanitizeId(moduleInfo.id || moduleInfo.module || moduleInfo.name, 'module');

    return {
      id,
      module: registered.module || null,
      register: nextInfo => registerModule({ ...(moduleInfo || {}), ...(nextInfo || {}), id }),
      unregister: reason => unregisterModule(id, reason),
      heartbeat: payload => heartbeatModule(id, payload || {}),
      status: status => publishModuleStatus(id, status || {}),
      subscribe: (filter, handler) => subscribe({ ...(filter || {}), moduleId: id, handler }),
      unsubscribe,
      emit: message => emit({
        ...(message || {}),
        source: {
          type: 'backend_module',
          id,
          module: registered.module ? registered.module.module : cleanString(moduleInfo.module || moduleInfo.name || id),
          ...((message && message.source) || {})
        }
      })
    };
  }

  const api = {
    meta: MODULE_META,
    rawBus: bus,
    registerModule,
    unregisterModule,
    heartbeatModule,
    updateModuleStatus,
    publishModuleStatus,
    subscribe,
    unsubscribe,
    emit,
    createModuleClient,
    getModuleContractStatus
  };

  bus.emit = emit;
  bus.registerModule = registerModule;
  bus.unregisterModule = unregisterModule;
  bus.heartbeatModule = heartbeatModule;
  bus.updateModuleStatus = updateModuleStatus;
  bus.publishModuleStatus = publishModuleStatus;
  bus.subscribe = subscribe;
  bus.unsubscribe = unsubscribe;
  bus.createModuleClient = createModuleClient;
  bus.getModuleContractStatus = getModuleContractStatus;

  bus[CONTRACT_KEY] = {
    api,
    originalEmit,
    createdAt: nowIso(),
    options: safeJson(options) || {}
  };

  return api;
}

module.exports = {
  MODULE_META,
  ensureModuleBus,
  normalizeModuleInfo,
  normalizeSubscription,
  publicModule,
  publicSubscription
};
