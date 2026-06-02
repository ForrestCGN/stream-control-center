'use strict';

const http = require('http');
const https = require('https');

let routes = null;
try {
  routes = require('./helpers/helper_routes');
} catch (err) {
  routes = null;
}

const MODULE = 'bus_integration_matrix';
const VERSION = '0.1.0';
const BUILD = 'CAN23_0';
const DEFAULT_BASE_URL = 'http://127.0.0.1:8080';

const MODULE_META = {
  name: MODULE,
  version: VERSION,
  build: BUILD,
  type: 'runtime',
  category: 'diagnostics',
  description: 'Read-only Bus integration matrix for module registration, heartbeat, status routes, ACK/control readiness and remaining legacy/direct paths.',
  routesPrefix: ['/api/bus-integration-matrix'],
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
  soundEventBus: '/api/sound/eventbus/status',
  soundStatus: '/api/sound/status',
  soundCommandStatus: '/api/sound/eventbus/command/status',
  soundCommandContract: '/api/sound/eventbus/command/contract',
  soundCommandLifecycle: '/api/sound/eventbus/command/lifecycle',
  soundPlayCompatibility: '/api/sound/eventbus/command/play-compatibility',
  soundQueueStatus: '/api/sound/eventbus/command/queue-status',
  alertEventBus: '/api/alerts/eventbus/status',
  alertAckStatus: '/api/alerts/eventbus/ack-status',
  alertCommandContract: '/api/alerts/eventbus/command/contract',
  alertCommandDryRun: '/api/alerts/eventbus/command/dry-run',
  alertStatus: '/api/alerts/status',
  alertCorrelation: '/api/alerts/eventbus/correlation/status',
  channelpointsStatus: '/api/channelpoints/status',
  channelpointsReadonlySync: '/api/channelpoints/twitch/manage/status',
  overlayMonitor: '/api/overlay-monitor/status',
  vipStatus: '/api/vip-sound/status',
  vipIntegration: '/api/vip-sound/integration-check'
};

const SYSTEMS = [
  {
    id: 'communication_bus',
    label: 'Communication Bus',
    category: 'core',
    busClientIds: [],
    statusKey: 'communication',
    statusRoute: ENDPOINTS.communication,
    eventBusKey: '',
    commandStatus: 'core',
    legacyDirect: false,
    nextStep: 'Kernsystem stabil halten; keine Selbstheilung ohne separaten Safety-Step.'
  },
  {
    id: 'sound_system',
    label: 'Sound-System',
    category: 'media',
    busClientIds: ['module:sound_system', 'sound_eventbus_debug'],
    statusKey: 'soundStatus',
    statusRoute: ENDPOINTS.soundStatus,
    eventBusKey: 'soundEventBus',
    eventBusRoute: ENDPOINTS.soundEventBus,
    commandKey: 'soundCommandStatus',
    commandRoute: ENDPOINTS.soundCommandStatus,
    contractKey: 'soundCommandContract',
    contractRoute: ENDPOINTS.soundCommandContract,
    lifecycleKey: 'soundCommandLifecycle',
    lifecycleRoute: ENDPOINTS.soundCommandLifecycle,
    compatibilityKey: 'soundPlayCompatibility',
    compatibilityRoute: ENDPOINTS.soundPlayCompatibility,
    queueStatusKey: 'soundQueueStatus',
    queueStatusRoute: ENDPOINTS.soundQueueStatus,
    commandStatus: 'partial',
    legacyDirect: true,
    nextStep: 'Als erstes Modul sauber ueber Bus-Requests/ACKs steuerbar machen.'
  },
  {
    id: 'alert_system',
    label: 'Alert-System',
    category: 'alert',
    busClientIds: ['module:alert_system', 'alert_eventbus_debug'],
    statusKey: 'alertStatus',
    statusRoute: ENDPOINTS.alertStatus,
    eventBusKey: 'alertEventBus',
    eventBusRoute: ENDPOINTS.alertEventBus,
    ackStatusKey: 'alertAckStatus',
    ackStatusRoute: ENDPOINTS.alertAckStatus,
    alertContractKey: 'alertCommandContract',
    alertContractRoute: ENDPOINTS.alertCommandContract,
    alertDryRunKey: 'alertCommandDryRun',
    alertDryRunRoute: ENDPOINTS.alertCommandDryRun,
    commandStatus: 'partial',
    legacyDirect: true,
    nextStep: 'Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK ueber Bus sauber definieren.'
  },
  {
    id: 'alert_sound_correlation',
    label: 'Alert/Sound-Korrelation',
    category: 'diagnostics',
    busClientIds: [],
    statusKey: 'alertCorrelation',
    statusRoute: ENDPOINTS.alertCorrelation,
    eventBusKey: '',
    commandStatus: 'status_only',
    legacyDirect: false,
    nextStep: 'Als Kontrollsicht nutzen; keine Aktion daraus ausfuehren.'
  },
  {
    id: 'channelpoints',
    label: 'Channelpoints',
    category: 'twitch',
    busClientIds: ['module:channelpoints'],
    statusKey: 'channelpointsStatus',
    statusRoute: ENDPOINTS.channelpointsStatus,
    eventBusKey: '',
    commandStatus: 'status_only',
    legacyDirect: true,
    nextStep: 'Nach Sound/Alert pruefen, welche Reward-Aktionen ueber Bus-Requests laufen sollen.'
  },
  {
    id: 'channelpoints_eventsub_bus_bridge',
    label: 'Channelpoints EventSub Bus Bridge',
    category: 'twitch',
    busClientIds: ['module:channelpoints_eventsub_bus_bridge'],
    statusKey: '',
    statusRoute: '',
    eventBusKey: '',
    commandStatus: 'bridge',
    legacyDirect: false,
    nextStep: 'Bridge sichtbar halten; spaeter ACK-/Fehlerverhalten dokumentieren.'
  },
  {
    id: 'channelpoints_twitch_readonly_sync',
    label: 'Channelpoints Twitch Readonly Sync',
    category: 'twitch',
    busClientIds: ['module:channelpoints_twitch_readonly_sync'],
    statusKey: 'channelpointsReadonlySync',
    statusRoute: ENDPOINTS.channelpointsReadonlySync,
    eventBusKey: '',
    commandStatus: 'read_only',
    legacyDirect: false,
    nextStep: 'Read-only belassen; keine Steuerbefehle daraus machen.'
  },
  {
    id: 'overlay_monitor',
    label: 'Overlay-Monitor',
    category: 'overlay',
    busClientIds: ['module:overlay_monitor'],
    statusKey: 'overlayMonitor',
    statusRoute: ENDPOINTS.overlayMonitor,
    eventBusKey: '',
    commandStatus: 'status_only',
    legacyDirect: false,
    nextStep: 'Overlay-Health/Heartbeat fuer spaetere kontrollierte Anzeige nutzen.'
  },
  {
    id: 'vip_sound_overlay_v2',
    label: 'VIP Sound Overlay V2',
    category: 'vip',
    busClientIds: ['vip_sound_overlay_v2', 'module:vip_sound_overlay'],
    statusKey: 'vipStatus',
    statusRoute: ENDPOINTS.vipStatus,
    eventBusKey: '',
    integrationKey: 'vipIntegration',
    integrationRoute: ENDPOINTS.vipIntegration,
    commandStatus: 'partial',
    legacyDirect: true,
    nextStep: 'Nach Sound/Alert pruefen: Show/Hide/ACK sauber ueber Bus fuehren.'
  }
];

const TODO_NEXT_STEPS = [
  'Sound-System: Bus-Request/ACK/Fehler/Queue-Status als erster echter Kommunikationsschritt.',
  'Alert-System: Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK ueber Bus vereinheitlichen.',
  'VIP-Sound-Overlay: Show/Hide/Update/ACK ueber Bus pruefen und danach anbinden.',
  'Overlay-Monitor: Overlay-Clients/Heartbeat als Kontrollsicht fuer aktive Szenen nutzen.',
  'Channelpoints: Rewards nach Sound/Alert schrittweise ueber Bus-Requests fuehren.',
  'Dashboard: Bus-Integration-Matrix sichtbar machen.',
  'Recovery/Selbstheilung: erst spaeter, nur nach SafetyStop/Confirm/Rollen/Audit.'
];

function init(ctx) {
  const app = ctx && ctx.app;
  if (!app) return;

  registerGet(app, '/api/bus-integration-matrix/status', (req, res) => {
    buildMatrix(req.query || {})
      .then(result => res.json(result))
      .catch(err => res.status(500).json(errorResponse(err)));
  });

  registerGet(app, '/api/bus-integration-matrix/routes', (req, res) => {
    res.json({
      ok: true,
      module: MODULE,
      version: VERSION,
      build: BUILD,
      readOnly: true,
      routes: [
        {
          method: 'GET',
          path: '/api/bus-integration-matrix/status',
          description: 'Read-only Bus-Anbindungs-Matrix. Fuehrt keine Aktionen aus.'
        },
        {
          method: 'GET',
          path: '/api/bus-integration-matrix/routes',
          description: 'Read-only Routenuebersicht fuer die Bus-Anbindungs-Matrix.'
        }
      ],
      productiveActions: false,
      flowTouched: false,
      queueTouched: false,
      soundSystemTouched: false,
      alertSystemTouched: false,
      overlayTouched: false
    });
  });

  console.log(`[${MODULE}] v${VERSION} ${BUILD} read-only bus integration matrix routes registered`);
}

function registerGet(app, routePath, handler) {
  if (routes && typeof routes.registerGet === 'function') {
    routes.registerGet(app, routePath, handler);
    return;
  }
  app.get(routePath, handler);
}

async function buildMatrix(query) {
  const baseUrl = normalizeBaseUrl(query.baseUrl || process.env.CGN_LOCAL_BASE_URL || DEFAULT_BASE_URL);
  const startedAt = Date.now();

  const fetched = await fetchAll(baseUrl);
  const communicationBody = bodyOf(fetched.communication);
  const clients = (((communicationBody || {}).status || {}).clients || []);

  const rows = SYSTEMS.map(system => buildSystemRow(system, clients, fetched));
  const summary = summarizeRows(rows);

  return {
    ok: rows.every(row => row.risk !== 'error'),
    module: MODULE,
    version: VERSION,
    build: BUILD,
    feature: 'bus_integration_matrix',
    mode: 'read_only',
    readOnly: true,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    baseUrl,
    endpoints: ENDPOINTS,
    summary,
    rows,
    todoNextSteps: TODO_NEXT_STEPS,
    fetched: compactFetched(fetched),
    productiveActions: false,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    overlayTouched: false
  };
}

async function fetchAll(baseUrl) {
  const entries = Object.entries(ENDPOINTS);
  const result = {};
  await Promise.all(entries.map(async ([key, routePath]) => {
    result[key] = await fetchJson(baseUrl + routePath);
  }));
  return result;
}

function buildSystemRow(system, clients, fetched) {
  const matchingClients = findClients(clients, system.busClientIds || []);
  const primaryClient = matchingClients.find(client => client.connected === true) || matchingClients[0] || null;
  const statusFetch = system.statusKey ? fetched[system.statusKey] : null;
  const eventBusFetch = system.eventBusKey ? fetched[system.eventBusKey] : null;
  const integrationFetch = system.integrationKey ? fetched[system.integrationKey] : null;
  const commandFetch = system.commandKey ? fetched[system.commandKey] : null;
  const contractFetch = system.contractKey ? fetched[system.contractKey] : null;
  const lifecycleFetch = system.lifecycleKey ? fetched[system.lifecycleKey] : null;
  const compatibilityFetch = system.compatibilityKey ? fetched[system.compatibilityKey] : null;
  const queueStatusFetch = system.queueStatusKey ? fetched[system.queueStatusKey] : null;
  const ackStatusFetch = system.ackStatusKey ? fetched[system.ackStatusKey] : null;
  const alertContractFetch = system.alertContractKey ? fetched[system.alertContractKey] : null;
  const alertDryRunFetch = system.alertDryRunKey ? fetched[system.alertDryRunKey] : null;

  const statusBody = bodyOf(statusFetch);
  const eventBusBody = bodyOf(eventBusFetch);
  const integrationBody = bodyOf(integrationFetch);
  const commandBody = bodyOf(commandFetch);
  const contractBody = bodyOf(contractFetch);
  const lifecycleBody = bodyOf(lifecycleFetch);
  const compatibilityBody = bodyOf(compatibilityFetch);
  const queueStatusBody = bodyOf(queueStatusFetch);
  const ackStatusBody = bodyOf(ackStatusFetch);
  const alertContractBody = bodyOf(alertContractFetch);
  const alertDryRunBody = bodyOf(alertDryRunFetch);

  const registered = system.id === 'communication_bus' || matchingClients.length > 0;
  const connected = system.id === 'communication_bus' || matchingClients.some(client => client.connected === true);
  const heartbeat = matchingClients.some(client => client.hasHeartbeat === true);
  const statusOk = statusFetch ? statusFetch.ok === true && (!statusBody || statusBody.ok !== false) : null;
  const eventBusOk = eventBusFetch ? eventBusFetch.ok === true && (!eventBusBody || eventBusBody.ok !== false) : null;
  const integrationOk = integrationFetch ? integrationFetch.ok === true && (!integrationBody || integrationBody.ok !== false) : null;
  const commandOk = commandFetch ? commandFetch.ok === true && (!commandBody || commandBody.ok !== false) : null;
  const contractOk = contractFetch ? contractFetch.ok === true && (!contractBody || contractBody.ok !== false) : null;
  const lifecycleOk = lifecycleFetch ? lifecycleFetch.ok === true && (!lifecycleBody || lifecycleBody.ok !== false) : null;
  const compatibilityOk = compatibilityFetch ? compatibilityFetch.ok === true && (!compatibilityBody || compatibilityBody.ok !== false) : null;
  const queueStatusOk = queueStatusFetch ? queueStatusFetch.ok === true && (!queueStatusBody || queueStatusBody.ok !== false) : null;
  const ackStatusOk = ackStatusFetch ? ackStatusFetch.ok === true && (!ackStatusBody || ackStatusBody.ok !== false) : null;
  const alertContractOk = alertContractFetch ? alertContractFetch.ok === true && (!alertContractBody || alertContractBody.ok !== false) : null;
  const alertDryRunOk = alertDryRunFetch ? alertDryRunFetch.ok === true && (!alertDryRunBody || alertDryRunBody.ok !== false) : null;
  const ackCapable = matchingClients.some(client => includesCapability(client, 'ack') || includesCapability(client, 'bus.ack'));
  const commandCapable = ['core', 'partial', 'bridge'].includes(system.commandStatus);

  const legacyDirect = system.legacyDirect === true;
  const busLevel = determineBusLevel({
    system,
    registered,
    connected,
    heartbeat,
    statusOk,
    eventBusOk,
    commandCapable
  });
  const risk = determineRisk({ system, registered, connected, statusOk, eventBusOk, integrationOk, commandOk, contractOk, lifecycleOk, compatibilityOk, queueStatusOk, ackStatusOk, alertContractOk, alertDryRunOk });

  return {
    id: system.id,
    label: system.label,
    category: system.category,
    readOnly: true,
    registeredOnBus: registered,
    connectedOnBus: connected,
    heartbeat: heartbeat,
    clientIds: matchingClients.map(client => client.id).filter(Boolean),
    primaryClientId: primaryClient && primaryClient.id ? primaryClient.id : '',
    primaryClientStatus: primaryClient && primaryClient.status ? primaryClient.status : (connected ? 'online' : ''),
    statusRoute: system.statusRoute || '',
    statusOk,
    eventBusRoute: system.eventBusRoute || '',
    eventBusOk,
    integrationRoute: system.integrationRoute || '',
    integrationOk,
    commandRoute: system.commandRoute || '',
    commandOk,
    commandFeature: commandBody && commandBody.feature ? commandBody.feature : '',
    commandMode: commandBody && commandBody.mode ? commandBody.mode : '',
    commandDryRunAvailable: !!(commandBody && commandBody.commandRoutes && commandBody.commandRoutes.dryRun),
    commandPlayTestAvailable: !!(commandBody && commandBody.commandRoutes && commandBody.commandRoutes.playTest),
    commandQueueTouchAllowed: !!(commandBody && commandBody.safety && commandBody.safety.allowQueueTouch),
    contractRoute: system.contractRoute || '',
    contractOk,
    contractName: contractBody && contractBody.contract && contractBody.contract.name ? contractBody.contract.name : '',
    contractRequiredFields: contractBody && contractBody.contract && Array.isArray(contractBody.contract.requiredFields) ? contractBody.contract.requiredFields : [],
    contractLifecycle: contractBody && contractBody.contract && Array.isArray(contractBody.contract.lifecycle) ? contractBody.contract.lifecycle.map(item => item && item.event).filter(Boolean) : [],
    ackPlanned: !!(contractBody && contractBody.contract && contractBody.contract.acknowledgement && contractBody.contract.acknowledgement.planned),
    ackRequiredNow: !!(contractBody && contractBody.contract && contractBody.contract.acknowledgement && contractBody.contract.acknowledgement.requiredNow),
    lifecycleRoute: system.lifecycleRoute || '',
    lifecycleOk,
    lifecycleEvents: lifecycleBody && Array.isArray(lifecycleBody.canonicalLifecycle) ? lifecycleBody.canonicalLifecycle.map(item => item && item.event).filter(Boolean) : [],
    lifecycleCounts: lifecycleBody && lifecycleBody.counts ? lifecycleBody.counts : {},
    compatibilityRoute: system.compatibilityRoute || '',
    compatibilityOk,
    compatibilityLevel: compatibilityBody && compatibilityBody.compatibilityLevel ? compatibilityBody.compatibilityLevel : '',
    productiveEntryPoint: compatibilityBody && compatibilityBody.productiveEntryPoint ? compatibilityBody.productiveEntryPoint : '',
    productiveEntryPointChanged: !!(compatibilityBody && compatibilityBody.productiveEntryPointChanged),
    usesSharedNormalizer: !!(compatibilityBody && compatibilityBody.usesSharedNormalizer),
    queueStatusRoute: system.queueStatusRoute || '',
    queueStatusOk,
    queueBusy: !!(queueStatusBody && queueStatusBody.summary && queueStatusBody.summary.busy),
    queueIdle: !!(queueStatusBody && queueStatusBody.summary && queueStatusBody.summary.idle),
    queuedCount: Number(queueStatusBody && queueStatusBody.summary ? queueStatusBody.summary.queuedCount || 0 : 0),
    queueMaxLength: Number(queueStatusBody && queueStatusBody.summary ? queueStatusBody.summary.maxLength || 0 : 0),
    queueFull: !!(queueStatusBody && queueStatusBody.summary && queueStatusBody.summary.full),
    currentRequestId: queueStatusBody && queueStatusBody.summary ? (queueStatusBody.summary.currentRequestId || '') : '',
    currentSoundId: queueStatusBody && queueStatusBody.summary ? (queueStatusBody.summary.currentSoundId || '') : '',
    ackStatusRoute: system.ackStatusRoute || '',
    ackStatusOk,
    alertRequests: Number(ackStatusBody && ackStatusBody.summary ? ackStatusBody.summary.alertRequests || 0 : 0),
    overlayAckCount: Number(ackStatusBody && ackStatusBody.summary ? ackStatusBody.summary.overlayAcknowledged || 0 : 0),
    overlayMissingAckCount: Number(ackStatusBody && ackStatusBody.summary ? ackStatusBody.summary.overlayMissing || 0 : 0),
    soundMatchedCount: Number(ackStatusBody && ackStatusBody.summary ? ackStatusBody.summary.soundMatched || 0 : 0),
    finishAckMissingCount: Number(ackStatusBody && ackStatusBody.summary ? ackStatusBody.summary.watchdogMissingFinishAck || 0 : 0),
    alertContractRoute: system.alertContractRoute || '',
    alertContractOk,
    alertContractName: alertContractBody && alertContractBody.contract && alertContractBody.contract.name ? alertContractBody.contract.name : '',
    alertContractLifecycle: alertContractBody && alertContractBody.contract && Array.isArray(alertContractBody.contract.lifecycle) ? alertContractBody.contract.lifecycle.map(item => item && item.event).filter(Boolean) : [],
    alertDryRunRoute: system.alertDryRunRoute || '',
    alertDryRunOk,
    alertDryRunAccepted: !!(alertDryRunBody && alertDryRunBody.accepted),
    alertDryRunQueueTouched: !!(alertDryRunBody && alertDryRunBody.queueTouched),
    alertDryRunSoundTouched: !!(alertDryRunBody && alertDryRunBody.soundSystemTouched),
    alertDryRunOverlayTouched: !!(alertDryRunBody && alertDryRunBody.overlayTouched),
    ackCapable,
    commandStatus: system.commandStatus,
    commandCapable,
    busLevel,
    legacyDirect,
    risk,
    nextStep: system.nextStep,
    noActionTaken: true
  };
}

function determineBusLevel(input) {
  if (input.system.id === 'communication_bus') return 'core';
  if (!input.registered && input.statusOk !== true) return 'not_connected';
  if (input.registered && !input.heartbeat && input.statusOk !== true) return 'registered_only';
  if (input.statusOk === true && input.eventBusOk !== true && !input.commandCapable) return 'status_only';
  if (input.eventBusOk === true || input.commandCapable) return 'partial';
  return 'visible';
}

function determineRisk(input) {
  if (input.system.id === 'communication_bus') return input.statusOk === false ? 'error' : 'ok';
  if (input.statusOk === false && input.eventBusOk === false) return 'error';
  if (!input.registered && input.statusOk !== true) return 'warning';
  if (input.statusOk === false || input.eventBusOk === false || input.integrationOk === false || input.commandOk === false || input.contractOk === false || input.lifecycleOk === false || input.compatibilityOk === false || input.queueStatusOk === false || input.ackStatusOk === false || input.alertContractOk === false || input.alertDryRunOk === false) return 'warning';
  return 'ok';
}

function summarizeRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return {
    total: list.length,
    ok: list.filter(row => row.risk === 'ok').length,
    warnings: list.filter(row => row.risk === 'warning').length,
    errors: list.filter(row => row.risk === 'error').length,
    registeredOnBus: list.filter(row => row.registeredOnBus).length,
    connectedOnBus: list.filter(row => row.connectedOnBus).length,
    heartbeat: list.filter(row => row.heartbeat).length,
    statusOnly: list.filter(row => row.busLevel === 'status_only').length,
    partial: list.filter(row => row.busLevel === 'partial').length,
    core: list.filter(row => row.busLevel === 'core').length,
    legacyDirect: list.filter(row => row.legacyDirect).length,
    commandCapable: list.filter(row => row.commandCapable).length
  };
}

function findClients(clients, ids) {
  const wanted = new Set((ids || []).map(value => String(value || '').toLowerCase()).filter(Boolean));
  if (!wanted.size) return [];
  return (clients || []).filter(client => client && wanted.has(String(client.id || '').toLowerCase()));
}

function includesCapability(client, capability) {
  const wanted = String(capability || '').toLowerCase();
  const values = Array.isArray(client && client.capabilities) ? client.capabilities : [];
  return values.some(value => String(value || '').toLowerCase() === wanted);
}

function compactFetched(fetched) {
  const result = {};
  for (const [key, value] of Object.entries(fetched || {})) {
    const body = bodyOf(value);
    result[key] = {
      ok: value && value.ok === true,
      status: value && value.status ? value.status : 0,
      url: value && value.url ? value.url : '',
      module: body && body.module ? body.module : '',
      version: body && (body.version || body.moduleVersion) ? (body.version || body.moduleVersion) : '',
      error: value && value.error ? value.error : ''
    };
  }
  return result;
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
  return {
    ok: false,
    module: MODULE,
    version: VERSION,
    build: BUILD,
    error: 'bus_integration_matrix_failed',
    message: err && err.message ? err.message : String(err),
    readOnly: true,
    productiveActions: false,
    flowTouched: false,
    queueTouched: false,
    soundSystemTouched: false,
    alertSystemTouched: false,
    overlayTouched: false
  };
}

module.exports = { MODULE_META, MODULE_VERSION: VERSION, version: VERSION, init };
