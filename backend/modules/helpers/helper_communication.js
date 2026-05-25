'use strict';

/**
 * STEP278F - Central Communication Bus helper core.
 *
 * This helper is intentionally not wired into production modules yet.
 * It provides a reusable bus foundation for later steps:
 * - client registry
 * - heartbeat tracking
 * - targeted event delivery
 * - ack tracking
 * - replayable event memory
 * - repeated issue throttling
 * - optional security context / audit logger hooks
 *
 * Existing broadcastWS flows are not removed by this helper.
 */

const core = require('./helper_core');

const MODULE_META = {
  name: 'helper_communication',
  version: '0.3.0',
  build: 'STEP278F',
  coreName: 'communication_core',
  coreVersion: '0.3.0',
  description: 'Communication Bus helper core'
};

const DEFAULT_CONFIG = {
  enabled: true,
  busName: 'cgn',
  version: 1,
  heartbeatIntervalMs: 5000,
  staleAfterMs: 15000,
  offlineAfterMs: 30000,
  deadAfterMs: 60000,
  defaultTtlMs: 15000,
  maxReplayEvents: 200,
  maxIssueEntries: 200,
  issueThrottleMs: 60000,
  monitoring: {
    enabled: false,
    requireLiveOrManual: true,
    manualEnabled: false,
    testMode: false,
    watchWindowMs: 30000,
    obsRequiredForOverlayErrors: true
  },
  security: {
    enabled: true
  },
  audit: {
    enabled: false,
    logEmit: false,
    logAck: false,
    logIssues: true,
    logPayload: false
  }
};

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = clone(item);
    return out;
  }
  return value;
}

function deepMerge(base, override) {
  const result = clone(base || {});
  if (!isPlainObject(override)) return result;
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = clone(value);
    }
  }
  return result;
}

function nowMs() {
  return Date.now();
}

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
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

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value ?? null));
  } catch (_) {
    return null;
  }
}

function sanitizeId(value, fallbackPrefix = 'client') {
  const clean = cleanString(value).replace(/[^a-zA-Z0-9_.:-]/g, '_');
  if (clean) return clean;
  return `${fallbackPrefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeClientInfo(clientInfo = {}) {
  const raw = isPlainObject(clientInfo) ? clientInfo : {};
  const id = sanitizeId(raw.id || raw.clientId || raw.name, 'client');
  return {
    id,
    type: cleanString(raw.type, 'unknown'),
    mode: cleanString(raw.mode, 'standalone'),
    hostId: cleanString(raw.hostId || raw.host_id || ''),
    module: cleanString(raw.module || raw.moduleId || ''),
    name: cleanString(raw.name || id, id),
    version: cleanString(raw.version || ''),
    capabilities: toArray(raw.capabilities),
    meta: isPlainObject(raw.meta) ? safeJson(raw.meta) || {} : {}
  };
}

function normalizeTarget(rawTarget = {}) {
  if (!rawTarget || rawTarget === '*' || rawTarget === 'all') return { type: 'all', id: '*', module: '', capability: '' };
  if (typeof rawTarget === 'string') return { type: 'id', id: rawTarget, module: '', capability: '' };
  const target = isPlainObject(rawTarget) ? rawTarget : {};
  return {
    type: cleanString(target.type, 'all'),
    id: cleanString(target.id || target.clientId || '*', '*'),
    module: cleanString(target.module || ''),
    capability: cleanString(target.capability || '')
  };
}

function normalizeSource(rawSource = {}) {
  if (typeof rawSource === 'string') return { type: 'unknown', id: rawSource };
  const source = isPlainObject(rawSource) ? rawSource : {};
  return {
    type: cleanString(source.type, 'system'),
    id: cleanString(source.id || source.module || 'communication_bus', 'communication_bus'),
    module: cleanString(source.module || '')
  };
}

function createEventId(prefix = 'evt') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isWsOpen(ws) {
  return !!ws && ws.readyState === 1;
}

function clientMatchesTarget(client, target, message) {
  if (!client || !target) return false;
  if (target.type === 'all' || target.id === '*') {
    if (target.module && client.module !== target.module) return false;
    if (target.capability && !client.capabilities.includes(target.capability)) return false;
    return true;
  }
  if (target.type === 'id') return client.id === target.id;
  if (target.type && target.type !== 'all' && client.type !== target.type) return false;
  if (target.id && target.id !== '*' && client.id !== target.id) return false;
  if (target.module && client.module !== target.module) return false;
  const capability = target.capability || `${message.channel || ''}.${message.action || ''}`.replace(/^\./, '').replace(/\.$/, '');
  if (target.capability && !client.capabilities.includes(capability)) return false;
  return true;
}

function publicClient(client) {
  if (!client) return null;
  return {
    id: client.id,
    type: client.type,
    mode: client.mode,
    hostId: client.hostId,
    module: client.module,
    name: client.name,
    version: client.version,
    capabilities: [...client.capabilities],
    connected: client.connected,
    status: client.status,
    registeredAt: client.registeredAt,
    connectedAt: client.connectedAt,
    disconnectedAt: client.disconnectedAt,
    lastHeartbeatAt: client.lastHeartbeatAt,
    lastSeenAt: client.lastSeenAt,
    lastAckAt: client.lastAckAt,
    lastErrorAt: client.lastErrorAt,
    disconnectReason: client.disconnectReason || '',
    meta: safeJson(client.meta) || {}
  };
}

function publicEvent(event) {
  if (!event) return null;
  return {
    id: event.id,
    type: event.type,
    channel: event.channel,
    action: event.action,
    source: event.source,
    target: event.target,
    createdAt: event.createdAt,
    expiresAt: event.expiresAt,
    replayable: event.meta.replayable === true,
    requireAck: event.meta.requireAck === true,
    deliveredTo: [...event.deliveredTo],
    ackCount: Object.keys(event.acks || {}).length,
    lastAckAt: event.lastAckAt || '',
    expired: event.expiresAtMs > 0 && event.expiresAtMs <= nowMs()
  };
}

function createCommunicationBus(options = {}) {
  const config = deepMerge(DEFAULT_CONFIG, options.config || {});
  const security = options.security || null;
  const auditLogger = options.auditLogger || options.audit || null;
  const clients = new Map();
  const events = new Map();
  const issues = new Map();
  const stats = {
    createdAt: nowIso(),
    emitted: 0,
    delivered: 0,
    acks: 0,
    replays: 0,
    dropped: 0,
    issues: 0,
    auditWrites: 0,
    auditSkipped: 0,
    auditErrors: 0
  };

  function isSecurityEnabled() {
    return config.security && config.security.enabled !== false && !!security;
  }

  function isAuditEnabled(kind) {
    if (!auditLogger || typeof auditLogger.log !== 'function') return false;
    const audit = config.audit || {};
    if (audit.enabled !== true) return false;
    if (kind === 'emit') return audit.logEmit === true;
    if (kind === 'ack') return audit.logAck === true;
    if (kind === 'issue') return audit.logIssues !== false;
    return true;
  }

  function buildContextFromMessage(message) {
    if (!isSecurityEnabled()) return null;
    if (typeof security.contextFromBusMessage === 'function') {
      try {
        return security.contextFromBusMessage(message, { mayLogPayload: config.audit && config.audit.logPayload === true });
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  function buildContextFromClient(clientInfo) {
    if (!isSecurityEnabled()) return null;
    if (typeof security.contextFromClientInfo === 'function') {
      try {
        return security.contextFromClientInfo(clientInfo, { mayLogPayload: false });
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  function audit(kind, entry = {}) {
    if (!isAuditEnabled(kind)) {
      stats.auditSkipped += 1;
      return { ok: false, reason: 'audit_disabled' };
    }

    try {
      const result = auditLogger.log(entry);
      if (result && result.ok === true) stats.auditWrites += 1;
      return result || { ok: false, reason: 'audit_no_result' };
    } catch (err) {
      stats.auditErrors += 1;
      return { ok: false, reason: 'audit_error', error: err && err.message ? err.message : String(err) };
    }
  }

  function normalizeMessage(message = {}) {
    const raw = isPlainObject(message) ? message : {};
    const meta = isPlainObject(raw.meta) ? raw.meta : {};
    const ttlMs = Number(meta.ttlMs ?? config.defaultTtlMs);
    const createdAtMs = nowMs();
    const eventId = cleanString(raw.id || raw.eventId || '', '') || createEventId(raw.type === 'request' ? 'req' : 'evt');

    return {
      bus: cleanString(raw.bus, config.busName),
      version: Number(raw.version || config.version || 1),
      id: eventId,
      type: cleanString(raw.type, 'event'),
      channel: cleanString(raw.channel, 'system'),
      action: cleanString(raw.action || raw.event, 'message'),
      source: normalizeSource(raw.source),
      target: normalizeTarget(raw.target),
      timestamp: cleanString(raw.timestamp, nowIso()),
      payload: safeJson(raw.payload || {}) || {},
      meta: {
        requireAck: meta.requireAck === true,
        replayable: meta.replayable === true,
        ttlMs: Number.isFinite(ttlMs) ? Math.max(0, ttlMs) : config.defaultTtlMs,
        mirror: meta.mirror === true,
        preview: meta.preview === true,
        productionTarget: meta.productionTarget !== false
      },
      createdAtMs,
      expiresAtMs: Number.isFinite(ttlMs) && ttlMs > 0 ? createdAtMs + ttlMs : 0,
      createdAt: new Date(createdAtMs).toISOString(),
      expiresAt: Number.isFinite(ttlMs) && ttlMs > 0 ? new Date(createdAtMs + ttlMs).toISOString() : '',
      deliveredTo: [],
      acks: {}
    };
  }

  function pruneEvents() {
    const current = nowMs();
    for (const [eventId, event] of events.entries()) {
      if (event.expiresAtMs > 0 && event.expiresAtMs <= current) {
        events.delete(eventId);
      }
    }

    if (events.size <= config.maxReplayEvents) return;

    const sorted = [...events.values()].sort((a, b) => a.createdAtMs - b.createdAtMs);
    const removeCount = Math.max(0, events.size - config.maxReplayEvents);
    for (const event of sorted.slice(0, removeCount)) {
      events.delete(event.id);
    }
  }

  function pruneIssues() {
    if (issues.size <= config.maxIssueEntries) return;
    const sorted = [...issues.entries()].sort((a, b) => (a[1].lastSeenMs || 0) - (b[1].lastSeenMs || 0));
    const removeCount = Math.max(0, issues.size - config.maxIssueEntries);
    for (const [key] of sorted.slice(0, removeCount)) issues.delete(key);
  }

  function registerClient(ws, clientInfo = {}) {
    const normalized = normalizeClientInfo(clientInfo);
    const existing = clients.get(normalized.id);
    const client = {
      ...(existing || {}),
      ...normalized,
      ws: ws || (existing && existing.ws) || null,
      connected: true,
      status: 'online',
      registeredAt: existing ? existing.registeredAt : nowIso(),
      connectedAt: nowIso(),
      disconnectedAt: '',
      lastHeartbeatAt: nowIso(),
      lastSeenAt: nowIso(),
      lastAckAt: existing ? existing.lastAckAt || '' : '',
      lastErrorAt: existing ? existing.lastErrorAt || '' : '',
      disconnectReason: ''
    };

    clients.set(client.id, client);

    if (ws) {
      try { ws._cgnBusClientId = client.id; } catch (_) {}
      if (typeof ws.on === 'function') {
        ws.on('close', () => unregisterClient(client.id, 'ws_close'));
        ws.on('error', () => markClientError(client.id, 'ws_error'));
      }
    }

    return publicClient(client);
  }

  function unregisterClient(clientId, reason = 'disconnect') {
    const id = cleanString(clientId);
    const client = clients.get(id);
    if (!client) return { ok: false, reason: 'client_not_found', clientId: id };
    client.connected = false;
    client.status = 'offline';
    client.disconnectedAt = nowIso();
    client.disconnectReason = cleanString(reason, 'disconnect');
    client.ws = null;
    client.lastSeenAt = nowIso();
    return { ok: true, client: publicClient(client) };
  }

  function forgetClient(clientId, options = {}) {
    const id = cleanString(clientId);
    const client = clients.get(id);
    if (!client) return { ok: false, reason: 'client_not_found', clientId: id };
    if (client.connected === true && options.force !== true) {
      return { ok: false, reason: 'client_is_connected', client: publicClient(client) };
    }
    const removed = publicClient(client);
    clients.delete(id);
    return { ok: true, clientId: id, removed };
  }

  function markClientError(clientId, reason = 'error') {
    const id = cleanString(clientId);
    const client = clients.get(id);
    if (!client) return { ok: false, reason: 'client_not_found', clientId: id };
    client.lastErrorAt = nowIso();
    client.disconnectReason = cleanString(reason, 'error');
    return { ok: true, client: publicClient(client) };
  }

  function heartbeat(clientId, payload = {}) {
    const id = cleanString(clientId || payload.clientId || payload.id);
    if (!id) return { ok: false, reason: 'client_id_missing' };

    let client = clients.get(id);
    if (!client) {
      registerClient(null, { ...payload, id, type: payload.type || 'unknown' });
      client = clients.get(id);
    }

    client.connected = true;
    client.status = 'online';
    client.lastHeartbeatAt = nowIso();
    client.lastSeenAt = nowIso();

    if (Array.isArray(payload.capabilities)) client.capabilities = toArray(payload.capabilities);
    if (payload.version) client.version = cleanString(payload.version);
    if (payload.module) client.module = cleanString(payload.module);

    return { ok: true, client: publicClient(client) };
  }

  function updateClientStatuses(context = {}) {
    const current = nowMs();
    const monitoringActive = context.monitoringActive === true || config.monitoring.manualEnabled === true || config.monitoring.testMode === true;
    const obsReachable = context.obsReachable !== false;

    for (const client of clients.values()) {
      const last = Date.parse(client.lastHeartbeatAt || client.lastSeenAt || client.connectedAt || client.registeredAt || '');
      const age = Number.isFinite(last) ? current - last : Number.MAX_SAFE_INTEGER;

      if (!monitoringActive) {
        client.status = client.connected ? 'online' : 'ignored';
      } else if (config.monitoring.obsRequiredForOverlayErrors && client.type.includes('overlay') && !obsReachable) {
        client.status = 'ignored';
      } else if (age >= config.deadAfterMs) {
        client.status = 'dead';
      } else if (age >= config.offlineAfterMs) {
        client.status = 'offline';
      } else if (age >= config.staleAfterMs) {
        client.status = 'stale';
      } else {
        client.status = 'online';
      }
    }

    return getClients();
  }

  function getClients() {
    return [...clients.values()].map(publicClient);
  }

  function sendToClient(client, event) {
    if (!client || !event) return false;
    const envelope = {
      bus: event.bus,
      version: event.version,
      id: event.id,
      type: event.type,
      channel: event.channel,
      action: event.action,
      source: event.source,
      target: event.target,
      timestamp: event.timestamp,
      payload: event.payload,
      meta: event.meta
    };

    if (!isWsOpen(client.ws)) return false;

    try {
      client.ws.send(JSON.stringify(envelope));
      client.lastSeenAt = nowIso();
      return true;
    } catch (_) {
      client.lastErrorAt = nowIso();
      return false;
    }
  }

  function emit(message = {}) {
    if (config.enabled === false) {
      stats.dropped += 1;
      audit('emit', {
        context: buildContextFromMessage(message),
        level: 'warn',
        category: 'communication',
        action: 'bus.emit',
        result: 'skipped',
        message: 'Communication bus emit skipped because bus is disabled',
        details: { reason: 'bus_disabled' }
      });
      return { ok: false, reason: 'bus_disabled' };
    }

    pruneEvents();
    const event = normalizeMessage(message);
    stats.emitted += 1;

    const delivered = [];
    for (const client of clients.values()) {
      if (!client.connected) continue;
      if (!clientMatchesTarget(client, event.target, event)) continue;
      if (sendToClient(client, event)) {
        delivered.push(client.id);
        stats.delivered += 1;
      }
    }

    event.deliveredTo = delivered;

    if (event.meta.replayable === true || event.meta.requireAck === true) {
      events.set(event.id, event);
      pruneEvents();
    }

    const result = {
      ok: true,
      eventId: event.id,
      deliveredTo: delivered,
      deliveredCount: delivered.length,
      event: publicEvent(event)
    };

    audit('emit', {
      context: buildContextFromMessage(event),
      level: 'info',
      category: 'communication',
      action: 'bus.emit',
      result: 'ok',
      message: 'Communication event emitted',
      details: {
        eventId: event.id,
        type: event.type,
        channel: event.channel,
        action: event.action,
        target: event.target,
        deliveredCount: delivered.length,
        requireAck: event.meta.requireAck === true,
        replayable: event.meta.replayable === true
      },
      payload: config.audit && config.audit.logPayload === true ? event.payload : undefined,
      mayLogPayload: config.audit && config.audit.logPayload === true
    });

    return result;
  }

  function ack(eventId, clientId, status = 'received', details = {}) {
    const id = cleanString(eventId);
    const client = cleanString(clientId);
    if (!id || !client) {
      const failed = { ok: false, reason: 'event_or_client_missing' };
      audit('ack', {
        level: 'warn',
        category: 'communication',
        action: 'bus.ack',
        result: 'failed',
        message: 'Communication event ack failed',
        details: { eventId: id, clientId: client, reason: failed.reason }
      });
      return failed;
    }

    let event = events.get(id);
    if (!event) {
      event = {
        id,
        type: 'ack_only',
        channel: 'unknown',
        action: 'ack',
        source: {},
        target: {},
        createdAt: nowIso(),
        createdAtMs: nowMs(),
        expiresAt: '',
        expiresAtMs: 0,
        meta: {},
        deliveredTo: [],
        acks: {}
      };
      events.set(id, event);
    }

    const ackPayload = {
      clientId: client,
      status: cleanString(status, 'received'),
      details: safeJson(details) || {},
      at: nowIso()
    };

    event.acks[client] = ackPayload;
    event.lastAckAt = ackPayload.at;
    stats.acks += 1;

    const registeredClient = clients.get(client);
    if (registeredClient) {
      registeredClient.lastAckAt = ackPayload.at;
      registeredClient.lastSeenAt = ackPayload.at;
    }

    const result = { ok: true, event: publicEvent(event), ack: ackPayload };

    audit('ack', {
      context: buildContextFromClient(registeredClient || { id: client, type: 'unknown' }),
      level: 'info',
      category: 'communication',
      action: 'bus.ack',
      result: 'ok',
      message: 'Communication event ack received',
      details: {
        eventId: id,
        clientId: client,
        status: ackPayload.status
      }
    });

    return result;
  }

  function replayForClient(clientId, options = {}) {
    const client = clients.get(cleanString(clientId));
    if (!client) return { ok: false, reason: 'client_not_found', replayed: 0 };

    pruneEvents();
    const replayed = [];
    const includeAckRequired = options.includeAckRequired === true;
    for (const event of events.values()) {
      if (event.meta.replayable !== true && !(includeAckRequired && event.meta.requireAck === true)) continue;
      if (!clientMatchesTarget(client, event.target, event)) continue;
      if (sendToClient(client, event)) {
        replayed.push(event.id);
        stats.replays += 1;
      }
    }

    return { ok: true, clientId: client.id, replayed: replayed.length, eventIds: replayed };
  }

  function trackIssue(key, message, options = {}) {
    const id = sanitizeId(key, 'issue');
    const throttleMs = Number(options.throttleMs ?? config.issueThrottleMs);
    const current = nowMs();
    const existing = issues.get(id);

    if (!existing) {
      const issue = {
        key: id,
        message: cleanString(message, id),
        level: cleanString(options.level, 'warn'),
        firstSeenAt: nowIso(),
        lastSeenAt: nowIso(),
        lastSeenMs: current,
        lastVisibleAt: nowIso(),
        lastVisibleMs: current,
        count: 1,
        suppressed: 0,
        visible: true,
        details: safeJson(options.details || {}) || {}
      };
      issues.set(id, issue);
      pruneIssues();
      stats.issues += 1;

      audit('issue', {
        level: issue.level === 'error' ? 'error' : 'warn',
        category: 'communication',
        action: 'bus.issue',
        result: issue.level === 'error' ? 'failed' : 'warning',
        message: issue.message,
        details: {
          issueKey: issue.key,
          count: issue.count,
          suppressed: issue.suppressed,
          visible: issue.visible,
          details: issue.details
        }
      });

      return { ok: true, visible: true, issue: { ...issue } };
    }

    existing.count += 1;
    existing.lastSeenAt = nowIso();
    existing.lastSeenMs = current;
    existing.message = cleanString(message, existing.message);

    const visible = current - (existing.lastVisibleMs || 0) >= throttleMs;
    if (visible) {
      existing.lastVisibleAt = nowIso();
      existing.lastVisibleMs = current;
      existing.visible = true;
    } else {
      existing.suppressed += 1;
      existing.visible = false;
    }

    if (visible) {
      audit('issue', {
        level: existing.level === 'error' ? 'error' : 'warn',
        category: 'communication',
        action: 'bus.issue',
        result: existing.level === 'error' ? 'failed' : 'warning',
        message: existing.message,
        details: {
          issueKey: existing.key,
          count: existing.count,
          suppressed: existing.suppressed,
          visible: existing.visible,
          details: existing.details
        }
      });
    }

    return { ok: true, visible, issue: { ...existing } };
  }

  function getStatus() {
    pruneEvents();
    pruneIssues();
    return {
      ok: true,
      moduleMeta: { ...MODULE_META },
      bus: config.busName,
      version: config.version,
      enabled: config.enabled !== false,
      createdAt: stats.createdAt,
      now: nowIso(),
      stats: { ...stats },
      config: {
        heartbeatIntervalMs: config.heartbeatIntervalMs,
        staleAfterMs: config.staleAfterMs,
        offlineAfterMs: config.offlineAfterMs,
        deadAfterMs: config.deadAfterMs,
        defaultTtlMs: config.defaultTtlMs,
        maxReplayEvents: config.maxReplayEvents,
        issueThrottleMs: config.issueThrottleMs,
        monitoring: safeJson(config.monitoring) || {},
        security: safeJson(config.security) || {},
        audit: safeJson(config.audit) || {}
      },
      hooks: {
        securityAvailable: !!security,
        securityEnabled: isSecurityEnabled(),
        auditAvailable: !!auditLogger,
        auditEnabled: !!(config.audit && config.audit.enabled === true)
      },
      clients: getClients(),
      events: [...events.values()].map(publicEvent),
      issues: [...issues.values()].map(issue => ({ ...issue }))
    };
  }

  function reset(options = {}) {
    if (options.clients === true) clients.clear();
    if (options.events !== false) events.clear();
    if (options.issues !== false) issues.clear();
    stats.emitted = 0;
    stats.delivered = 0;
    stats.acks = 0;
    stats.replays = 0;
    stats.dropped = 0;
    stats.issues = 0;
    stats.auditWrites = 0;
    stats.auditSkipped = 0;
    stats.auditErrors = 0;
    return getStatus();
  }

  return {
    config,
    registerClient,
    unregisterClient,
    forgetClient,
    markClientError,
    heartbeat,
    updateClientStatuses,
    getClients,
    emit,
    ack,
    replayForClient,
    trackIssue,
    getStatus,
    reset,
    createEventId,
    normalizeMessage
  };
}

module.exports = {
  MODULE_META,
  DEFAULT_CONFIG,
  createCommunicationBus,
  createEventId,
  normalizeClientInfo,
  normalizeTarget,
  normalizeSource
};
