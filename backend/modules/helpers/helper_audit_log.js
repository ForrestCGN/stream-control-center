'use strict';

/**
 * STEP278D - Audit Log helper core.
 *
 * This helper prepares central audit/system logging without wiring it into
 * production routes or modules yet.
 *
 * It keeps an in-memory buffer and can optionally write JSONL files later.
 * Database writes are intentionally not implemented in this step.
 */

const path = require('path');
const fs = require('fs');

const core = require('./helper_core');
const security = require('./helper_security_context');

const DEFAULT_CONFIG = {
  enabled: true,
  retentionDays: 30,
  maxMemoryEntries: 500,
  writeToFile: false,
  writeToDatabase: false,
  file: {
    enabled: false,
    dir: '',
    name: 'audit.log.jsonl',
    rotateDaily: false
  },
  maskPayloads: true,
  logPayloadByDefault: false,
  defaultLevel: 'info',
  defaultCategory: 'system',
  defaultResult: 'ok',
  allowedLevels: ['debug', 'info', 'warn', 'error', 'security'],
  allowedCategories: [
    'system',
    'security',
    'api',
    'dashboard',
    'communication',
    'overlay',
    'alert',
    'sound',
    'tts',
    'vip',
    'streamerbot',
    'obs',
    'discord',
    'twitch',
    'database',
    'config',
    'error'
  ],
  allowedResults: [
    'ok',
    'failed',
    'denied',
    'ignored',
    'skipped',
    'queued',
    'started',
    'finished',
    'timeout',
    'warning'
  ],
  detailsMaxDepth: 6,
  detailsMaxArrayLength: 50,
  detailsMaxStringLength: 500
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

function nowIso() {
  return core.nowIso ? core.nowIso() : new Date().toISOString();
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function createAuditId(prefix = 'audit') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEnum(value, allowed, fallback) {
  const clean = cleanString(value).toLowerCase();
  if (Array.isArray(allowed) && allowed.includes(clean)) return clean;
  return fallback;
}

function normalizeContext(context, config) {
  if (context && context.ok === true && context.actor && context.source && context.trust) return context;
  if (isPlainObject(context)) return security.createSecurityContext(context, { config: config.security || {} });
  return security.createSecurityContext({ kind: 'system', actor: { type: 'system', id: 'system', name: 'System', roles: ['system'] } }, { config: config.security || {} });
}

function normalizeDetails(details, config) {
  if (details === undefined) return {};
  if (config.maskPayloads !== false) {
    return security.maskSensitive(details, {
      maxDepth: config.detailsMaxDepth,
      maxArrayLength: config.detailsMaxArrayLength,
      maxStringLength: config.detailsMaxStringLength,
      config: config.security || {}
    });
  }
  return details;
}

function buildFilePath(config) {
  const fileConfig = config.file || {};
  const dir = cleanString(fileConfig.dir);
  const baseName = cleanString(fileConfig.name, 'audit.log.jsonl');
  if (!dir) return '';

  if (fileConfig.rotateDaily === true) {
    const date = new Date().toISOString().slice(0, 10);
    const ext = path.extname(baseName);
    const name = path.basename(baseName, ext);
    return path.join(dir, `${name}.${date}${ext || '.jsonl'}`);
  }

  return path.join(dir, baseName);
}

function writeJsonLine(filePath, entry) {
  if (!filePath) return { ok: false, reason: 'file_path_missing' };
  core.ensureParentDir(filePath);
  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8');
  return { ok: true, path: filePath };
}

function matchesFilter(entry, filters = {}) {
  if (!entry) return false;
  if (filters.level && entry.level !== filters.level) return false;
  if (filters.category && entry.category !== filters.category) return false;
  if (filters.result && entry.result !== filters.result) return false;
  if (filters.action && entry.action !== filters.action) return false;
  if (filters.actorType && entry.actor?.type !== filters.actorType) return false;
  if (filters.actorId && entry.actor?.id !== filters.actorId) return false;
  if (filters.sourceKind && entry.source?.kind !== filters.sourceKind) return false;
  if (filters.module && entry.source?.module !== filters.module) return false;
  if (filters.since) {
    const sinceMs = Date.parse(filters.since);
    const entryMs = Date.parse(entry.at);
    if (Number.isFinite(sinceMs) && Number.isFinite(entryMs) && entryMs < sinceMs) return false;
  }
  if (filters.search) {
    const search = cleanString(filters.search).toLowerCase();
    const haystack = [
      entry.id,
      entry.level,
      entry.category,
      entry.action,
      entry.result,
      entry.message,
      entry.actor?.type,
      entry.actor?.id,
      entry.actor?.name,
      entry.source?.kind,
      entry.source?.module,
      entry.source?.route
    ].filter(Boolean).join(' ').toLowerCase();
    if (search && !haystack.includes(search)) return false;
  }
  return true;
}

function publicEntry(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    at: entry.at,
    level: entry.level,
    category: entry.category,
    action: entry.action,
    result: entry.result,
    actor: entry.actor,
    source: entry.source,
    trust: entry.trust,
    message: entry.message,
    details: entry.details,
    meta: entry.meta
  };
}

function createAuditLogger(options = {}) {
  const config = deepMerge(DEFAULT_CONFIG, options.config || {});
  const memory = [];
  const stats = {
    createdAt: nowIso(),
    written: 0,
    dropped: 0,
    fileWrites: 0,
    fileErrors: 0,
    lastEntryAt: '',
    lastError: ''
  };

  function enforceRetention() {
    const maxEntries = Math.max(0, Number(config.maxMemoryEntries || 0));
    if (maxEntries > 0 && memory.length > maxEntries) {
      memory.splice(0, memory.length - maxEntries);
    }

    const retentionDays = Number(config.retentionDays || 0);
    if (retentionDays > 0) {
      const minMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      while (memory.length > 0) {
        const firstMs = Date.parse(memory[0].at);
        if (!Number.isFinite(firstMs) || firstMs >= minMs) break;
        memory.shift();
      }
    }
  }

  function createEntry(entry = {}) {
    const context = normalizeContext(entry.context || entry.securityContext || entry, config);
    const auditSnapshot = security.toAuditSnapshot(context, entry.payload, {
      mayLogPayload: entry.mayLogPayload === true || config.logPayloadByDefault === true,
      config: config.security || {}
    });

    const level = normalizeEnum(entry.level, config.allowedLevels, config.defaultLevel);
    const category = normalizeEnum(entry.category, config.allowedCategories, config.defaultCategory);
    const result = normalizeEnum(entry.result, config.allowedResults, config.defaultResult);

    return {
      id: cleanString(entry.id, createAuditId()),
      at: cleanString(entry.at, nowIso()),
      level,
      category,
      action: cleanString(entry.action, 'system.event'),
      result,
      actor: auditSnapshot.actor,
      source: auditSnapshot.source,
      trust: auditSnapshot.trust,
      message: cleanString(entry.message, ''),
      details: normalizeDetails(entry.details || entry.data || {}, config),
      meta: normalizeDetails({
        correlationId: entry.correlationId || entry.eventId || '',
        clientId: entry.clientId || '',
        requestId: entry.requestId || '',
        payloadLogged: auditSnapshot.payloadLogged === true,
        payload: auditSnapshot.payload
      }, config)
    };
  }

  function log(entry = {}) {
    if (config.enabled === false) {
      stats.dropped += 1;
      return { ok: false, reason: 'audit_disabled' };
    }

    const normalized = createEntry(entry);
    memory.push(normalized);
    enforceRetention();

    stats.written += 1;
    stats.lastEntryAt = normalized.at;

    let fileResult = { ok: false, reason: 'file_disabled' };
    const fileEnabled = config.writeToFile === true || config.file?.enabled === true;
    if (fileEnabled) {
      try {
        fileResult = writeJsonLine(buildFilePath(config), normalized);
        if (fileResult.ok) stats.fileWrites += 1;
      } catch (err) {
        stats.fileErrors += 1;
        stats.lastError = err && err.message ? err.message : String(err);
        fileResult = { ok: false, reason: 'file_write_failed', error: stats.lastError };
      }
    }

    return {
      ok: true,
      entry: publicEntry(normalized),
      file: fileResult
    };
  }

  function getRecent(limit = 50, filters = {}) {
    enforceRetention();
    const safeLimit = Math.max(0, Math.min(Number(limit || 50), 500));
    const filtered = memory.filter(entry => matchesFilter(entry, filters));
    return filtered.slice(Math.max(0, filtered.length - safeLimit)).reverse().map(publicEntry);
  }

  function getStatus() {
    enforceRetention();
    return {
      ok: true,
      enabled: config.enabled !== false,
      createdAt: stats.createdAt,
      now: nowIso(),
      stats: { ...stats },
      memory: {
        entries: memory.length,
        maxEntries: config.maxMemoryEntries,
        retentionDays: config.retentionDays
      },
      file: {
        enabled: config.writeToFile === true || config.file?.enabled === true,
        path: buildFilePath(config)
      },
      database: {
        enabled: config.writeToDatabase === true,
        implemented: false
      },
      categories: [...config.allowedCategories],
      levels: [...config.allowedLevels],
      results: [...config.allowedResults]
    };
  }

  function clearMemory() {
    const removed = memory.length;
    memory.length = 0;
    return { ok: true, removed };
  }

  function child(defaults = {}) {
    return {
      log: (entry = {}) => log(deepMerge(defaults, entry)),
      getRecent,
      getStatus,
      clearMemory,
      child
    };
  }

  return {
    config,
    log,
    createEntry,
    getRecent,
    getStatus,
    clearMemory,
    child
  };
}

module.exports = {
  DEFAULT_CONFIG,
  createAuditLogger,
  createAuditId
};
