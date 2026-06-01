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
const VERSION = '1.2.4';
const STATUS_API_VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'http://127.0.0.1:8080';

const MODULE_META = {
  name: MODULE,
  version: VERSION,
  build: 'STEP_CAN5_5',
  type: 'runtime',
  category: 'diagnostics',
  description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state, recovery-strategy and recovery-simulation aggregator.',
  routesPrefix: ['/api/bus-diagnostics'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

const ENDPOINTS = {
  communication: '/api/communication/status',
  sound: '/api/sound/eventbus/status',
  soundStatus: '/api/sound/status',
  alert: '/api/alerts/eventbus/status',
  alertStatus: '/api/alerts/status',
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

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/bus-diagnostics/status', (req, res) => {
    buildStatus(req.query || {}, false).then(result => res.json(result)).catch(err => res.status(500).json(errorResponse(err)));
  });

  registerGet(app, '/api/bus-diagnostics/check', (req, res) => {
    buildStatus(req.query || {}, true).then(result => res.json(result)).catch(err => res.status(500).json(errorResponse(err)));
  });

  registerGet(app, '/api/bus-diagnostics/recovery-simulation/status', (req, res) => {
    res.json(buildRecoverySimulationStatus());
  });

  registerGet(app, '/api/bus-diagnostics/recovery-simulation/test', (req, res) => {
    res.json(buildRecoverySimulationTest(req.query || {}));
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
        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht inklusive CAN-5.5 Recovery-Simulation.' },
        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/status', description: 'Read-only Recovery-Simulation Status. Fuehrt keine Aktionen aus.' },
        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck', description: 'Read-only synthetischer Recovery-Simulationstest. Fuehrt keine Aktionen aus.' }
      ],
      dashboard: {
        url: '/public/tools/bus_diagnostics_dashboard.html',
        mode: 'read_only_preparation'
      }
    });
  });

  console.log('[bus_diagnostics] STEP_CAN5_5 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state, recovery strategy and simulation harness prepared');
}

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

  const [communication, sound, soundStatus, alert, alertStatus, correlation, vip, vipIntegration] = await Promise.all([
    fetchJson(baseUrl + ENDPOINTS.communication),
    fetchJson(baseUrl + ENDPOINTS.sound),
    fetchJson(baseUrl + ENDPOINTS.soundStatus),
    fetchJson(baseUrl + ENDPOINTS.alert),
    fetchJson(baseUrl + ENDPOINTS.alertStatus),
    fetchJson(baseUrl + ENDPOINTS.correlation),
    fetchJson(baseUrl + ENDPOINTS.vip),
    fetchJson(baseUrl + ENDPOINTS.vipIntegration)
  ]);

  const diagnostics = analyze({ communication, sound, soundStatus, alert, alertStatus, correlation, vip, vipIntegration });
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
    optionalInfo: diagnostics.optionalInfo,
    errors: diagnostics.errors,
    communication: compactFetch(communication),
    soundEventBus: compactFetch(sound),
    soundStatus: compactFetch(soundStatus),
    alertEventBus: compactFetch(alert),
    alertStatus: compactFetch(alertStatus),
    alertSoundCorrelation: compactFetch(correlation),
    recoveryStrategyState: diagnostics.recoveryStrategyState,
    vipStatus: compactFetch(vip),
    vipIntegration: compactFetch(vipIntegration),
    resilienceMatrix: diagnostics.resilienceMatrix,
    raw: query.raw === '1' ? {
      communication,
      sound,
      soundStatus,
      alert,
      alertStatus,
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
  const optionalInfo = [];
  const errors = [];

  const communicationBody = bodyOf(parts.communication);
  const soundBody = bodyOf(parts.sound);
  const soundStatusBody = bodyOf(parts.soundStatus);
  const alertBody = bodyOf(parts.alert);
  const alertStatusBody = bodyOf(parts.alertStatus);
  const correlationBody = bodyOf(parts.correlation);
  const vipBody = bodyOf(parts.vip);
  const vipIntegrationBody = bodyOf(parts.vipIntegration);

  if (!parts.communication.ok) errors.push('communication_status_fetch_failed');
  if (!parts.sound.ok) errors.push('sound_eventbus_status_fetch_failed');
  if (!parts.soundStatus.ok) warnings.push('sound_status_unavailable_for_matrix');
  if (!parts.alert.ok) errors.push('alert_eventbus_status_fetch_failed');
  if (!parts.alertStatus.ok) warnings.push('alert_status_unavailable_for_matrix');
  if (!parts.correlation.ok) warnings.push('alert_sound_correlation_status_unavailable');
  if (!parts.vip.ok) warnings.push('vip_status_unavailable');
  if (!parts.vipIntegration.ok) warnings.push('vip_integration_check_unavailable');

  const clients = (((communicationBody || {}).status || {}).clients || []);
  const soundDebug = clients.find(client => client && client.id === 'sound_eventbus_debug');
  const alertDebug = clients.find(client => client && client.id === 'alert_eventbus_debug');
  const vipOverlay = clients.find(client => client && client.id === 'vip_sound_overlay_v2');

  if (!soundDebug || !soundDebug.connected) optionalInfo.push('sound_eventbus_debug_not_connected_optional');
  if (!alertDebug || !alertDebug.connected) optionalInfo.push('alert_eventbus_debug_not_connected_optional');
  if (!vipOverlay || !vipOverlay.connected) optionalInfo.push('vip_sound_overlay_v2_not_connected_optional');

  const soundStats = (soundBody || {}).stats || {};
  const alertStats = (alertBody || {}).stats || {};
  const comparison = (correlationBody || {}).comparison || {};
  const handshakeState = (correlationBody || {}).handshakeState || {};
  const vipClient = (vipBody || {}).client || {};
  const vipDb = (vipBody || {}).db || {};
  const vipOverlayVisible = !!(vipBody || {}).visible;
  const vipQueuedCount = Number((vipBody || {}).queuedCount || 0);
  const vipIntegrationSummary = (vipIntegrationBody || {}).summary || {};
  const vipIntegrationErrors = Number(vipIntegrationSummary.errors || 0);
  const resilienceMatrix = buildResilienceMatrix({
    communicationBody,
    soundBody,
    soundStatusBody,
    alertBody,
    alertStatusBody,
    correlationBody,
    vipBody,
    vipIntegrationBody
  });
  const recoveryStrategyState = buildRecoveryStrategyState(correlationBody);
  if (vipIntegrationErrors > 0) warnings.push('vip_integration_reports_errors');
  resilienceMatrix.summary.warningKeys.forEach(key => { if (!warnings.includes(key)) warnings.push(key); });
  resilienceMatrix.summary.errorKeys.forEach(key => { if (!errors.includes(key)) errors.push(key); });

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
    handshakeState: handshakeState.state || '',
    handshakeOk: handshakeState.ok === true,
    handshakeWarning: handshakeState.warning === true,
    handshakeNextAction: handshakeState.nextAction || '',
    matrixRows: resilienceMatrix.rows.length,
    matrixOk: resilienceMatrix.summary.ok,
    matrixWarnings: resilienceMatrix.summary.warningCount,
    matrixErrors: resilienceMatrix.summary.errorCount,
    recoveryStrategyMode: recoveryStrategyState.mode,
    recoveryStrategyState: recoveryStrategyState.state,
    recoveryAllowedActions: recoveryStrategyState.allowedActions.length,
    recoveryBlockedActions: recoveryStrategyState.blockedActions.length,
    optionalInfoCount: optionalInfo.length,
    optionalInfo,
    status: errors.length ? 'error' : (warnings.length ? 'warning' : 'ok')
  };

  return { summary, warnings, optionalInfo, errors, resilienceMatrix, recoveryStrategyState };
}

function buildRecoverySimulationStatus() {
  return {
    ok: true,
    module: MODULE,
    version: VERSION,
    feature: 'recovery_simulation_harness',
    statusApiVersion: STATUS_API_VERSION,
    simulationVersion: 'CAN-5.5',
    readOnly: true,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    overlayTouched: false,
    automationEnabled: false,
    productiveActions: false,
    allowedScenarios: ['ok', 'missingAck', 'noClient', 'unmatched', 'waitingTooLong', 'soundFetchFailed'],
    blockedActions: ['auto_replay_alert', 'auto_replay_sound', 'auto_retry_overlay', 'auto_recovery'],
    routes: {
      status: '/api/bus-diagnostics/recovery-simulation/status',
      test: '/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck'
    },
    notes: [
      'Synthetic diagnostics only.',
      'Does not enqueue alerts.',
      'Does not start sounds.',
      'Does not control overlays.',
      'Does not call recovery routes.'
    ],
    checkedAt: new Date().toISOString()
  };
}

function buildRecoverySimulationTest(query) {
  const scenarioRaw = String((query && query.scenario) || 'ok').trim();
  const scenario = normalizeSimulationScenario(scenarioRaw);
  const syntheticCorrelation = buildSyntheticCorrelationForScenario(scenario);
  const recoveryStrategyState = buildRecoveryStrategyState(syntheticCorrelation);
  return {
    ok: true,
    module: MODULE,
    version: VERSION,
    feature: 'recovery_simulation_test',
    simulationVersion: 'CAN-5.5',
    scenario,
    requestedScenario: scenarioRaw,
    synthetic: true,
    readOnly: true,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    overlayTouched: false,
    automationEnabled: false,
    productiveActions: false,
    blockedActions: recoveryStrategyState.blockedActions,
    recoveryStrategyState,
    syntheticCorrelation: {
      handshakeState: syntheticCorrelation.handshakeState,
      visualDeliveryState: syntheticCorrelation.visualDeliveryState,
      comparison: syntheticCorrelation.comparison,
      warnings: syntheticCorrelation.warnings || []
    },
    checkedAt: new Date().toISOString()
  };
}

function normalizeSimulationScenario(value) {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'missingack' || key === 'missing_ack') return 'missingAck';
  if (key === 'noclient' || key === 'no_client') return 'noClient';
  if (key === 'unmatched') return 'unmatched';
  if (key === 'waitingtoolong' || key === 'waiting_too_long' || key === 'waiting') return 'waitingTooLong';
  if (key === 'soundfetchfailed' || key === 'sound_fetch_failed') return 'soundFetchFailed';
  return 'ok';
}

function buildSyntheticCorrelationForScenario(scenario) {
  const base = {
    ok: true,
    warnings: [],
    comparison: { matched: 2, unmatched: 0 },
    handshakeState: { ok: true, warning: false, state: 'matched', unmatched: 0 },
    visualDeliveryState: { ok: true, warning: false, state: 'matched_and_visual_acknowledged', missingAck: 0, noClient: 0, waiting: 0 }
  };

  if (scenario === 'missingAck') {
    base.visualDeliveryState = { ok: false, warning: true, state: 'matched_but_visual_ack_missing', missingAck: 1, noClient: 0, waiting: 0 };
  } else if (scenario === 'noClient') {
    base.visualDeliveryState = { ok: false, warning: true, state: 'matched_but_no_overlay_client', missingAck: 0, noClient: 1, waiting: 0 };
  } else if (scenario === 'unmatched') {
    base.comparison = { matched: 0, unmatched: 1 };
    base.handshakeState = { ok: false, warning: true, state: 'unmatched_alert_rows', unmatched: 1 };
    base.visualDeliveryState = { ok: true, warning: false, state: 'sound_not_matched_yet', missingAck: 0, noClient: 0, waiting: 0 };
  } else if (scenario === 'waitingTooLong') {
    base.visualDeliveryState = { ok: true, warning: false, state: 'matched_waiting_for_visual_ack', missingAck: 0, noClient: 0, waiting: 1 };
  } else if (scenario === 'soundFetchFailed') {
    base.ok = false;
    base.warnings = ['sound_eventbus_unavailable'];
    base.handshakeState = { ok: false, warning: true, state: 'sound_eventbus_unavailable', unmatched: 0 };
    base.visualDeliveryState = { ok: true, warning: false, state: 'sound_not_matched_yet', missingAck: 0, noClient: 0, waiting: 0 };
  }

  return base;
}

function buildRecoveryStrategyState(correlationBody) {
  const handshake = (correlationBody || {}).handshakeState || {};
  const visual = (correlationBody || {}).visualDeliveryState || {};
  const comparison = (correlationBody || {}).comparison || {};
  const warnings = Array.isArray((correlationBody || {}).warnings) ? (correlationBody || {}).warnings : [];
  const reasons = [];
  const allowedActions = [];
  const blockedActions = ['auto_replay_alert', 'auto_replay_sound', 'auto_retry_overlay', 'auto_recovery'];

  const handshakeState = String(handshake.state || '').trim();
  const visualState = String(visual.state || '').trim();
  const unmatched = Number(comparison.unmatched || handshake.unmatched || 0);
  const missingAck = Number(visual.missingAck || 0);
  const noClient = Number(visual.noClient || 0);
  const waiting = Number(visual.waiting || 0);

  let stateName = 'observe';
  let severity = 'info';
  let nextAction = '';

  if (!correlationBody || correlationBody.ok === false) {
    stateName = 'correlation_status_unavailable';
    severity = 'warning';
    reasons.push('correlation_status_unavailable');
    nextAction = 'check_alert_sound_correlation_route';
  } else if (unmatched > 0) {
    stateName = 'blocked_unmatched_alert_sound';
    severity = 'warning';
    reasons.push('unmatched_alert_sound_rows');
    nextAction = 'manual_trace_review';
  } else if (missingAck > 0 || visualState === 'matched_but_visual_ack_missing') {
    stateName = 'blocked_missing_visual_ack';
    severity = 'warning';
    reasons.push('missing_visual_finish_ack');
    nextAction = 'manual_overlay_review';
  } else if (noClient > 0 || visualState === 'matched_but_no_overlay_client') {
    stateName = 'blocked_no_overlay_client';
    severity = 'warning';
    reasons.push('no_overlay_client_at_send');
    nextAction = 'check_obs_browser_source';
  } else if (waiting > 0 || visualState === 'matched_waiting_for_visual_ack') {
    stateName = 'observe_waiting_for_ack';
    severity = 'info';
    reasons.push('visual_ack_still_inside_expected_window');
    nextAction = 'wait_until_expected_ack_deadline';
  } else if (handshakeState === 'matched' && visualState === 'matched_and_visual_acknowledged') {
    stateName = 'ok_no_recovery_needed';
    severity = 'ok';
    reasons.push('handshake_and_visual_acknowledged');
    allowedActions.push('none');
  } else if (handshakeState === 'idle_no_recent_handshake' && visualState === 'idle_no_recent_visual_delivery') {
    stateName = 'idle';
    severity = 'ok';
    reasons.push('no_recent_alert_to_recover');
    allowedActions.push('none');
  } else if (warnings.length > 0) {
    stateName = 'observe_warning';
    severity = 'warning';
    reasons.push('correlation_warnings_present');
    nextAction = 'manual_warning_review';
  } else {
    reasons.push('read_only_no_action_required');
    allowedActions.push('none');
  }

  return {
    ok: severity !== 'warning' && severity !== 'error',
    warning: severity === 'warning',
    mode: 'read_only',
    state: stateName,
    severity,
    readOnly: true,
    flowTouched: false,
    automationEnabled: false,
    allowedActions,
    blockedActions,
    reasons,
    nextAction,
    source: {
      handshakeState,
      visualDeliveryState: visualState,
      unmatched,
      missingAck,
      noClient,
      waiting
    },
    checkedAt: new Date().toISOString()
  };
}

function buildResilienceMatrix(parts) {
  const clients = (((parts.communicationBody || {}).status || {}).clients || []);
  const soundClient = findClient(clients, 'module:sound_system');
  const alertClient = findClient(clients, 'module:alert_system');
  const channelpointsClient = findClient(clients, 'module:channelpoints');
  const channelpointsBridgeClient = findClient(clients, 'module:channelpoints_eventsub_bus_bridge');
  const channelpointsSyncClient = findClient(clients, 'module:channelpoints_twitch_readonly_sync');
  const overlayMonitorClient = findClient(clients, 'module:overlay_monitor');
  const vipOverlayClient = findClient(clients, 'vip_sound_overlay_v2');

  const soundStatus = parts.soundStatusBody || {};
  const alertStatus = parts.alertStatusBody || {};
  const vipStatus = parts.vipBody || {};

  const rows = [
    buildMatrixRow({
      module: 'communication_bus',
      statusRoute: '/api/communication/status',
      client: null,
      busHeartbeat: 'core_available',
      queueState: 'n/a',
      overlayState: 'n/a',
      recoveryRoute: '/api/communication/watchdog',
      risk: ((parts.communicationBody || {}).ok === false) ? 'error' : 'ok',
      notes: 'Zentrale Bus-Diagnose; Watchdog aktuell primaer Diagnose.'
    }),
    buildMatrixRow({
      module: 'sound_system',
      statusRoute: '/api/sound/status',
      client: soundClient,
      queueState: summarizeSoundQueue(soundStatus),
      overlayState: summarizeSoundOverlay(soundStatus),
      recoveryRoute: '',
      risk: riskFromClientAndState(soundClient, soundStatus, { allowNoOverlayClient: true }),
      notes: 'Zentrale Audio-/Media-Schicht; CAN-1 Teilnehmer aktiv.'
    }),
    buildMatrixRow({
      module: 'alert_system',
      statusRoute: '/api/alerts/status',
      client: alertClient,
      queueState: summarizeAlertQueue(alertStatus),
      overlayState: summarizeAlertOverlay(alertStatus),
      recoveryRoute: '/api/alerts/overlay-watchdog/recover',
      risk: riskFromClientAndAlertState(alertClient, alertStatus),
      notes: 'Alert-Regel/Queue/Visual/Sound-Koordination; Overlay-Watchdog vorhanden.'
    }),
    buildMatrixRow({
      module: 'channelpoints',
      statusRoute: '/api/channelpoints/status',
      client: channelpointsClient,
      queueState: 'not_fetched',
      overlayState: 'n/a',
      recoveryRoute: '',
      risk: riskFromClientOnly(channelpointsClient),
      notes: 'Kanalpunkte-Hauptmodul registriert sich bereits am Communication Bus.'
    }),
    buildMatrixRow({
      module: 'channelpoints_eventsub_bus_bridge',
      statusRoute: '',
      client: channelpointsBridgeClient,
      queueState: 'n/a',
      overlayState: 'n/a',
      recoveryRoute: '',
      risk: riskFromClientOnly(channelpointsBridgeClient),
      notes: 'Bridge sichtbar; Heartbeat aktiv seit CAN-2.1.'
    }),
    buildMatrixRow({
      module: 'channelpoints_twitch_readonly_sync',
      statusRoute: '/api/channelpoints/twitch/manage/status',
      client: channelpointsSyncClient,
      queueState: 'n/a',
      overlayState: 'n/a',
      recoveryRoute: '',
      risk: riskFromClientOnly(channelpointsSyncClient),
      notes: 'Read-only Twitch-Sync sichtbar.'
    }),
    buildMatrixRow({
      module: 'overlay_monitor',
      statusRoute: '/api/overlay-monitor/status',
      client: overlayMonitorClient,
      queueState: 'n/a',
      overlayState: overlayMonitorClient ? 'monitor_online' : 'monitor_missing',
      recoveryRoute: '',
      risk: riskFromClientOnly(overlayMonitorClient),
      notes: 'Overlay-Monitor ist fuer spaetere Overlay-Health wichtig.'
    }),
    buildMatrixRow({
      module: 'vip_sound_overlay_v2',
      statusRoute: '/api/vip-sound/status',
      client: vipOverlayClient,
      queueState: summarizeVipQueue(vipStatus),
      overlayState: summarizeVipOverlay(vipStatus, vipOverlayClient),
      recoveryRoute: '',
      risk: riskFromVip(vipStatus, vipOverlayClient),
      notes: 'VIP-Overlay ist optional sichtbar, aber fuer VIP-Sound-Flow relevant.'
    })
  ];

  const errorKeys = rows.filter(row => row.risk === 'error').map(row => 'matrix_' + row.module + '_error');
  const warningKeys = rows.filter(row => row.risk === 'warning').map(row => 'matrix_' + row.module + '_warning');

  return {
    ok: errorKeys.length === 0,
    readOnly: true,
    generatedAt: new Date().toISOString(),
    columns: ['module', 'statusRoute', 'busHeartbeat', 'queueState', 'overlayState', 'recoveryRoute', 'risk'],
    summary: {
      ok: errorKeys.length === 0,
      rows: rows.length,
      okCount: rows.filter(row => row.risk === 'ok').length,
      warningCount: warningKeys.length,
      errorCount: errorKeys.length,
      warningKeys,
      errorKeys
    },
    rows
  };
}

function buildMatrixRow(input) {
  const heartbeat = input.busHeartbeat || summarizeHeartbeat(input.client);
  return {
    module: input.module,
    statusRoute: input.statusRoute || '',
    busHeartbeat: heartbeat,
    busClientId: input.client && input.client.id ? input.client.id : '',
    busStatus: input.client && input.client.status ? input.client.status : '',
    busConnected: !!(input.client && input.client.connected),
    heartbeatCount: input.client ? Number(input.client.heartbeatCount || 0) : 0,
    lastHeartbeatAt: input.client && input.client.lastHeartbeatAt ? input.client.lastHeartbeatAt : '',
    queueState: input.queueState || 'unknown',
    overlayState: input.overlayState || 'unknown',
    recoveryRoute: input.recoveryRoute || '',
    risk: input.risk || 'unknown',
    notes: input.notes || ''
  };
}

function findClient(clients, id) {
  return (clients || []).find(client => client && client.id === id) || null;
}

function summarizeHeartbeat(client) {
  if (!client) return 'missing';
  if (!client.connected) return 'disconnected';
  if (client.hasHeartbeat) return 'online_heartbeat';
  return 'online_no_heartbeat';
}

function summarizeSoundQueue(status) {
  if (!status || status.ok === false) return 'status_unavailable';
  const queued = Number(status.queuedCount || (Array.isArray(status.queue) ? status.queue.length : 0));
  const parallel = Number(status.parallelCount || 0);
  const current = status.current ? 'current' : 'idle';
  const bundleLock = status.activeBundleLock ? 'bundle_lock' : 'no_bundle_lock';
  return current + ';queued=' + queued + ';parallel=' + parallel + ';' + bundleLock;
}

function summarizeSoundOverlay(status) {
  if (!status || status.ok === false) return 'status_unavailable';
  const outputTarget = (((status.config || {}).output || {}).defaultTarget || ((status.config || {}).defaults || {}).outputTarget || 'unknown');
  const clientConnected = !!((status.client || {}).connected);
  return 'output=' + outputTarget + ';overlayClient=' + (clientConnected ? 'connected' : 'not_connected');
}

function summarizeAlertQueue(status) {
  if (!status || status.ok === false) return 'status_unavailable';
  const queueLength = Number(status.queueLength || 0);
  const current = status.current ? 'current' : 'idle';
  const processing = status.processing ? 'processing' : 'not_processing';
  return current + ';queue=' + queueLength + ';' + processing;
}

function summarizeAlertOverlay(status) {
  if (!status || status.ok === false) return 'status_unavailable';
  const clients = Number(status.overlayClients || 0);
  const watchdog = status.overlayWatchdog || {};
  const issues = Number(((watchdog || {}).stats || {}).issues || 0);
  return 'overlayClients=' + clients + ';watchdog=' + (watchdog.enabled ? 'enabled' : 'disabled') + ';issues=' + issues;
}

function summarizeVipQueue(status) {
  if (!status || status.ok === false) return 'status_unavailable';
  return 'queued=' + Number(status.queuedCount || 0) + ';active=' + (!!status.isActive);
}

function summarizeVipOverlay(status, client) {
  if (!status || status.ok === false) return client ? 'client_only' : 'status_unavailable';
  return 'visible=' + (!!status.visible) + ';client=' + (client && client.connected ? 'connected' : 'not_connected');
}

function riskFromClientOnly(client) {
  if (!client) return 'warning';
  if (!client.connected || client.status === 'offline' || client.status === 'dead') return 'error';
  if (!client.hasHeartbeat) return 'warning';
  return 'ok';
}

function riskFromClientAndState(client, status, options) {
  if (!client || !client.connected) return 'error';
  if (!client.hasHeartbeat) return 'warning';
  if (!status || status.ok === false) return 'warning';
  if (status.activeBundleLock) return 'warning';
  if (!options || !options.allowNoOverlayClient) {
    if (status.client && status.client.connected === false) return 'warning';
  }
  return 'ok';
}

function riskFromClientAndAlertState(client, status) {
  if (!client || !client.connected) return 'error';
  if (!client.hasHeartbeat) return 'warning';
  if (!status || status.ok === false) return 'warning';
  const queueLength = Number(status.queueLength || 0);
  if (queueLength > 0 && !status.current && !status.processing) return 'warning';
  const watchdogIssues = Number((((status.overlayWatchdog || {}).stats || {}).issues) || 0);
  if (watchdogIssues > 0) return 'warning';
  return 'ok';
}

function riskFromVip(status, client) {
  if (status && status.isActive && !(client && client.connected)) return 'warning';
  if (client && client.connected && !client.hasHeartbeat) return 'warning';
  return 'ok';
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
    handshakeState: body && body.handshakeState ? body.handshakeState : undefined,
    traceCorrelationVersion: body && body.traceCorrelationVersion ? body.traceCorrelationVersion : undefined,
    matchingKeys: body && body.matchingKeys ? body.matchingKeys : undefined,
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


module.exports = { MODULE_META, MODULE_VERSION: VERSION, version: VERSION, init };
