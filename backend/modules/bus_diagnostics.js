'use strict';

const http = require('http');
const https = require('https');

let routes = null;
try {
  routes = require('./helpers/helper_routes');
} catch (err) {
  routes = null;
}

const MODULE = 'bus_diagnostics';
const VERSION = '1.1.0';
const STATUS_API_VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'http://127.0.0.1:8080';

const ENDPOINTS = {
  communication: '/api/communication/status',
  sound: '/api/sound/eventbus/status',
  alert: '/api/alerts/eventbus/status',
  correlation: '/api/alerts/eventbus/correlation/status',
  vip: '/api/vip-sound/status',
  vipIntegration: '/api/vip-sound/integration-check'
};

const state = {
  loadedAt: new Date().toISOString(),
  lastCheckAt: '',
  lastStatus: null,
  stats: {
    checks: 0,
    ok: 0,
    warnings: 0,
    errors: 0,
    lastError: ''
  }
};

module.exports.init = function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/bus-diagnostics/status', (req, res) => {
    buildStatus(req.query || {}, false).then(result => res.json(result)).catch(err => res.status(500).json(errorResponse(err)));
  });

  registerGet(app, '/api/bus-diagnostics/check', (req, res) => {
    buildStatus(req.query || {}, true).then(result => res.json(result)).catch(err => res.status(500).json(errorResponse(err)));
  });

  registerGet(app, '/api/bus-diagnostics/routes', (req, res) => {
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      statusApiVersion: STATUS_API_VERSION,
      routes: [
        { method: 'GET', path: '/api/bus-diagnostics/status', description: 'Read-only Bus-Diagnose Aggregatstatus.' },
        { method: 'GET', path: '/api/bus-diagnostics/check', description: 'Read-only Bus-Diagnose Aktualisierung.' },
        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht.' }
      ],
      dashboard: {
        url: '/public/tools/bus_diagnostics_dashboard.html',
        mode: 'read_only_preparation'
      }
    });
  });

  console.log('[bus_diagnostics] STEP420 Dashboard diagnostics prepared');
};

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}

async function buildStatus(query, requestedCheck) {
  const baseUrl = normalizeBaseUrl(query.baseUrl || process.env.CGN_LOCAL_BASE_URL || DEFAULT_BASE_URL);
  const startedAt = Date.now();

  const [communication, sound, alert, correlation, vip, vipIntegration] = await Promise.all([
    fetchJson(baseUrl + ENDPOINTS.communication),
    fetchJson(baseUrl + ENDPOINTS.sound),
    fetchJson(baseUrl + ENDPOINTS.alert),
    fetchJson(baseUrl + ENDPOINTS.correlation),
    fetchJson(baseUrl + ENDPOINTS.vip),
    fetchJson(baseUrl + ENDPOINTS.vipIntegration)
  ]);

  const diagnostics = analyze({ communication, sound, alert, correlation, vip, vipIntegration });
  const result = {
    ok: diagnostics.errors.length === 0,
    module: MODULE,
    version: VERSION,
    statusApiVersion: STATUS_API_VERSION,
    feature: 'bus_dashboard_diagnostics',
    mode: 'read_only_dashboard_preparation',
    readOnly: true,
    requestedCheck: !!requestedCheck,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    vipSystemTouched: false,
    overlayTouched: false,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    baseUrl,
    endpoints: ENDPOINTS,
    summary: diagnostics.summary,
    warnings: diagnostics.warnings,
    errors: diagnostics.errors,
    communication: compactFetch(communication),
    soundEventBus: compactFetch(sound),
    alertEventBus: compactFetch(alert),
    alertSoundCorrelation: compactFetch(correlation),
    vipStatus: compactFetch(vip),
    vipIntegration: compactFetch(vipIntegration),
    raw: query.raw === '1' ? {
      communication,
      sound,
      alert,
      correlation,
      vip,
      vipIntegration
    } : undefined
  };

  state.lastCheckAt = result.fetchedAt;
  state.lastStatus = result;
  state.stats.checks += 1;
  if (result.ok) state.stats.ok += 1;
  if (result.warnings.length) state.stats.warnings += 1;
  if (result.errors.length) state.stats.errors += 1;
  state.stats.lastError = result.errors[0] || '';

  return result;
}

function analyze(parts) {
  const warnings = [];
  const errors = [];

  const communicationBody = bodyOf(parts.communication);
  const soundBody = bodyOf(parts.sound);
  const alertBody = bodyOf(parts.alert);
  const correlationBody = bodyOf(parts.correlation);
  const vipBody = bodyOf(parts.vip);
  const vipIntegrationBody = bodyOf(parts.vipIntegration);

  if (!parts.communication.ok) errors.push('communication_status_fetch_failed');
  if (!parts.sound.ok) errors.push('sound_eventbus_status_fetch_failed');
  if (!parts.alert.ok) errors.push('alert_eventbus_status_fetch_failed');
  if (!parts.correlation.ok) warnings.push('alert_sound_correlation_status_unavailable');
  if (!parts.vip.ok) warnings.push('vip_status_unavailable');
  if (!parts.vipIntegration.ok) warnings.push('vip_integration_check_unavailable');

  const clients = (((communicationBody || {}).status || {}).clients || []);
  const soundDebug = clients.find(client => client && client.id === 'sound_eventbus_debug');
  const alertDebug = clients.find(client => client && client.id === 'alert_eventbus_debug');
  const vipOverlay = clients.find(client => client && client.id === 'vip_sound_overlay_v2');

  if (!soundDebug || !soundDebug.connected) warnings.push('sound_eventbus_debug_not_connected');
  if (!alertDebug || !alertDebug.connected) warnings.push('alert_eventbus_debug_not_connected');
  if (!vipOverlay || !vipOverlay.connected) warnings.push('vip_sound_overlay_v2_not_connected');

  const soundStats = (soundBody || {}).stats || {};
  const alertStats = (alertBody || {}).stats || {};
  const comparison = (correlationBody || {}).comparison || {};
  const vipClient = (vipBody || {}).client || {};
  const vipDb = (vipBody || {}).db || {};
  const vipOverlayVisible = !!(vipBody || {}).visible;
  const vipQueuedCount = Number((vipBody || {}).queuedCount || 0);
  const vipIntegrationSummary = (vipIntegrationBody || {}).summary || {};
  const vipIntegrationErrors = Number(vipIntegrationSummary.errors || 0);
  if (vipIntegrationErrors > 0) warnings.push('vip_integration_reports_errors');

  if (Number(soundStats.errors || 0) > 0) errors.push('sound_eventbus_reports_errors');
  if (Number(alertStats.errors || 0) > 0) errors.push('alert_eventbus_reports_errors');
  if (comparison && Number(comparison.unmatched || 0) > 0) warnings.push('alert_sound_correlation_has_unmatched_alerts');

  const summary = {
    communicationOk: !!parts.communication.ok && !!((communicationBody || {}).ok),
    soundBusOk: !!parts.sound.ok && !!((soundBody || {}).ok),
    alertBusOk: !!parts.alert.ok && !!((alertBody || {}).ok),
    correlationOk: !!parts.correlation.ok && !!((correlationBody || {}).ok),
    vipOk: !!parts.vip.ok && !!((vipBody || {}).ok),
    vipIntegrationOk: !!parts.vipIntegration.ok && !!((vipIntegrationBody || {}).ok),
    connectedClients: clients.filter(client => client && client.connected).length,
    totalClients: clients.length,
    soundDebugConnected: !!(soundDebug && soundDebug.connected),
    alertDebugConnected: !!(alertDebug && alertDebug.connected),
    vipOverlayConnected: !!(vipOverlay && vipOverlay.connected),
    soundEmitted: Number(soundStats.emitted || 0),
    soundErrors: Number(soundStats.errors || 0),
    soundLastAction: soundStats.lastAction || '',
    alertEmitted: Number(alertStats.emitted || 0),
    alertErrors: Number(alertStats.errors || 0),
    alertLastAction: alertStats.lastAction || '',
    vipVersion: (vipBody || {}).version || '',
    vipPhase: (vipBody || {}).phase || '',
    vipVisible: vipOverlayVisible,
    vipActive: !!((vipBody || {}).isActive),
    vipQueuedCount,
    vipRequestId: (vipBody || {}).requestId || '',
    vipClientConnected: !!vipClient.connected,
    vipClientLastEvent: vipClient.lastEvent || '',
    vipDbInitialized: !!vipDb.initialized,
    vipIntegrationErrors,
    correlationMatched: Number(comparison.matched || 0),
    correlationUnmatched: Number(comparison.unmatched || 0),
    status: errors.length ? 'error' : (warnings.length ? 'warning' : 'ok')
  };

  return { summary, warnings, errors };
}

function compactFetch(fetchResult) {
  const body = bodyOf(fetchResult);
  return {
    ok: !!fetchResult.ok && !!(body && body.ok !== false),
    fetchOk: !!fetchResult.ok,
    status: fetchResult.status || 0,
    url: fetchResult.url || '',
    error: fetchResult.error || '',
    module: body && body.module ? body.module : '',
    version: body && body.version ? body.version : (body && body.moduleVersion ? body.moduleVersion : ''),
    capability: body && body.capability ? body.capability : '',
    feature: body && body.feature ? body.feature : '',
    stats: body && body.stats ? body.stats : undefined,
    summary: body && body.summary ? body.summary : undefined,
    comparison: body && body.comparison ? body.comparison : undefined,
    recentEvents: body && body.recentEvents ? body.recentEvents : undefined,
    phase: body && body.phase ? body.phase : undefined,
    visible: body && Object.prototype.hasOwnProperty.call(body, 'visible') ? body.visible : undefined,
    isActive: body && Object.prototype.hasOwnProperty.call(body, 'isActive') ? body.isActive : undefined,
    queuedCount: body && Object.prototype.hasOwnProperty.call(body, 'queuedCount') ? body.queuedCount : undefined,
    requestId: body && body.requestId ? body.requestId : undefined,
    client: body && body.client ? body.client : undefined,
    db: body && body.db ? body.db : undefined,
    warnings: body && body.warnings ? body.warnings : undefined,
    errors: body && body.errors ? body.errors : undefined,
    statusBody: body && body.status ? body.status : undefined
  };
}

function bodyOf(fetchResult) {
  return fetchResult && fetchResult.body ? fetchResult.body : null;
}

function normalizeBaseUrl(value) {
  const raw = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(raw)) return DEFAULT_BASE_URL;
  return raw;
}

function fetchJson(url) {
  return new Promise(resolve => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.get(url, { timeout: 4000 }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, url, body: parsed, error: '' });
        } catch (err) {
          resolve({ ok: false, status: res.statusCode, url, body: null, error: 'json_parse_failed: ' + (err && err.message ? err.message : String(err)) });
        }
      });
    });
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
    req.on('error', err => {
      resolve({ ok: false, status: 0, url, body: null, error: err && err.message ? err.message : String(err) });
    });
  });
}

function errorResponse(err) {
  state.stats.errors += 1;
  state.stats.lastError = err && err.message ? err.message : String(err);
  return {
    ok: false,
    module: MODULE,
    version: VERSION,
    error: 'bus_diagnostics_failed',
    message: state.stats.lastError,
    readOnly: true,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    overlayTouched: false
  };
}
