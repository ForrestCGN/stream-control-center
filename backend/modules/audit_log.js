'use strict';

/**
 * STEP278E - Audit API Status module.
 *
 * Provides read/test endpoints for the prepared audit logger.
 * No production module is forced to write audit logs in this step.
 * No database migration is performed.
 */

const helperConfig = require('./helpers/helper_config');
const core = require('./helpers/helper_core');
const { createAuditLogger } = require('./helpers/helper_audit_log');
const security = require('./helpers/helper_security_context');

const MODULE_META = {
  name: 'audit_log',
  version: '0.2.0',
  build: 'STEP278E',
  coreName: 'audit_core',
  coreVersion: '0.2.0',
  description: 'Audit Log API status, recent, test and memory endpoints'
};

const DEFAULT_CONFIG = {
  enabled: true,
  testEndpointEnabled: true,
  clearMemoryEndpointEnabled: true,
  maxRecentLimit: 200
};

let auditLogger = null;
let loadedConfig = null;

function loadAuditConfig() {
  const loaded = helperConfig.loadConfig('audit_log.json', {}, { createIfMissing: false });
  loadedConfig = {
    ...DEFAULT_CONFIG,
    ...(loaded && loaded.data && typeof loaded.data === 'object' ? loaded.data : {})
  };
  return loadedConfig;
}

function getLogger() {
  if (!auditLogger) {
    const config = loadAuditConfig();
    auditLogger = createAuditLogger({ config });
  }
  return auditLogger;
}

function asInt(value, fallback = 50) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function buildFilters(query = {}) {
  const filters = {};
  for (const key of ['level', 'category', 'result', 'action', 'actorType', 'actorId', 'sourceKind', 'module', 'search', 'since']) {
    const value = cleanString(query[key]);
    if (value) filters[key] = value;
  }
  return filters;
}

function contextFromReq(req) {
  return security.contextFromExpressRequest(req, 'audit_log', {
    mayLogPayload: false
  });
}

function publicQueryDetails(req) {
  const details = {};
  for (const [key, value] of Object.entries(req.query || {})) {
    if (['message', 'level', 'category', 'result', 'action', 'limit', 'confirm'].includes(key)) continue;
    details[key] = value;
  }
  return details;
}

function init({ app }) {
  if (!app) throw new Error('audit_log.init: app fehlt.');

  loadAuditConfig();
  getLogger();

  app.get('/api/audit/status', (req, res) => {
    const logger = getLogger();
    const status = logger.getStatus();
    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      coreName: MODULE_META.coreName,
      coreVersion: MODULE_META.coreVersion,
      step: MODULE_META.build,
      status
    });
  });

  app.get('/api/audit/recent', (req, res) => {
    const logger = getLogger();
    const maxLimit = Math.max(1, asInt(loadedConfig.maxRecentLimit, 200));
    const limit = Math.max(0, Math.min(asInt(req.query.limit, 50), maxLimit));
    const filters = buildFilters(req.query || {});

    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      limit,
      filters,
      entries: logger.getRecent(limit, filters)
    });
  });

  app.get('/api/audit/test', (req, res) => {
    if (loadedConfig.testEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'audit_test_endpoint_disabled' });
    }

    const logger = getLogger();
    const context = contextFromReq(req);
    const message = cleanString(req.query.message, 'Audit test entry');
    const level = cleanString(req.query.level, 'info');
    const category = cleanString(req.query.category, 'system');
    const result = cleanString(req.query.result, 'ok');
    const action = cleanString(req.query.action, 'audit.test');
    const mayLogPayload = boolParam(req.query.logPayload, false);

    const logged = logger.log({
      context,
      level,
      category,
      result,
      action,
      message,
      details: {
        query: publicQueryDetails(req),
        note: 'STEP278E test endpoint'
      },
      payload: req.query || {},
      mayLogPayload
    });

    res.json({
      ok: logged.ok === true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      test: true,
      entry: logged.entry,
      file: logged.file
    });
  });

  app.post('/api/audit/clear-memory', (req, res) => {
    if (loadedConfig.clearMemoryEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'audit_clear_memory_endpoint_disabled' });
    }

    const logger = getLogger();
    const context = contextFromReq(req);
    const before = logger.getStatus().memory.entries;
    const cleared = logger.clearMemory();

    const afterClearLog = logger.log({
      context,
      level: 'warn',
      category: 'system',
      result: 'ok',
      action: 'audit.clear_memory',
      message: 'Audit memory buffer cleared',
      details: {
        removedBeforeLog: cleared.removed,
        before
      }
    });

    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      cleared,
      afterClearLog: afterClearLog.entry
    });
  });

  app.get('/api/audit/clear-memory', (req, res) => {
    if (String(req.query.confirm || '') !== '1') {
      return res.status(400).json({
        ok: false,
        error: 'confirm_required',
        hint: 'Use POST /api/audit/clear-memory or GET /api/audit/clear-memory?confirm=1'
      });
    }

    if (loadedConfig.clearMemoryEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'audit_clear_memory_endpoint_disabled' });
    }

    const logger = getLogger();
    const context = contextFromReq(req);
    const before = logger.getStatus().memory.entries;
    const cleared = logger.clearMemory();

    const afterClearLog = logger.log({
      context,
      level: 'warn',
      category: 'system',
      result: 'ok',
      action: 'audit.clear_memory',
      message: 'Audit memory buffer cleared via GET confirm',
      details: {
        removedBeforeLog: cleared.removed,
        before
      }
    });

    res.json({
      ok: true,
      module: MODULE_META.name,
      moduleVersion: MODULE_META.version,
      moduleBuild: MODULE_META.build,
      cleared,
      afterClearLog: afterClearLog.entry
    });
  });

  console.log(`[${MODULE_META.name}] v${MODULE_META.version} / ${MODULE_META.build} API routes registered`);
}

module.exports = { MODULE_META, init };
