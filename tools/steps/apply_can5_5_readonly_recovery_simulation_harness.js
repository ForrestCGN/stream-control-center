
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('[CAN-5.5] wrote', rel);
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error('[CAN-5.5] Anchor not found: ' + label);
  }
  return content.replace(search, replacement);
}

function prependOnce(rel, marker, block) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-5.5] already present', rel);
    return;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, block.replace(/\n/g, '\r\n') + '\r\n' + current, 'utf8');
  console.log('[CAN-5.5] updated', rel);
}

const rel = 'backend/modules/bus_diagnostics.js';
let js = read(rel);

js = replaceOnce(js, "const VERSION = '1.2.3';", "const VERSION = '1.2.4';", 'version');
js = replaceOnce(js, "build: 'STEP_CAN5_1',", "build: 'STEP_CAN5_5',", 'module build');
js = replaceOnce(
  js,
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state and recovery-strategy aggregator.',",
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state, recovery-strategy and recovery-simulation aggregator.',",
  'module description'
);

const endpointAnchor = "  vip: '/api/vip-sound/status',\n  vipIntegration: '/api/vip-sound/integration-check'\n};";
const endpointReplacement = "  vip: '/api/vip-sound/status',\n  vipIntegration: '/api/vip-sound/integration-check',\n  recoverySimulationStatus: '/api/bus-diagnostics/recovery-simulation/status',\n  recoverySimulationTest: '/api/bus-diagnostics/recovery-simulation/test'\n};";
js = replaceOnce(js, endpointAnchor, endpointReplacement, 'endpoints simulation routes');

const checkRouteAnchor = "  registerGet(app, '/api/bus-diagnostics/check', (req, res) => {\n    buildStatus(req.query || {}, true).then(result => res.json(result)).catch(err => res.status(500).json(errorResponse(err)));\n  });";
const checkRouteReplacement = checkRouteAnchor + "\n\n  registerGet(app, '/api/bus-diagnostics/recovery-simulation/status', (req, res) => {\n    res.json(buildRecoverySimulationStatus());\n  });\n\n  registerGet(app, '/api/bus-diagnostics/recovery-simulation/test', (req, res) => {\n    res.json(buildRecoverySimulationTest(req.query || {}));\n  });";
js = replaceOnce(js, checkRouteAnchor, checkRouteReplacement, 'simulation routes in init');

const routesAnchor = "        { method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix, STEP CAN-2.2 optionalDiagnostics, STEP CAN-3.5 handshakeState und STEP CAN-5.1 recoveryStrategyState.' },\n        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht.' }";
const routesReplacement = "        { method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix, STEP CAN-2.2 optionalDiagnostics, STEP CAN-3.5 handshakeState, STEP CAN-5.1 recoveryStrategyState und STEP CAN-5.5 recoverySimulationHarness.' },\n        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/status', description: 'Read-only Simulationsszenarien ohne produktive Aktionen.' },\n        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck', description: 'Synthetischer Recovery-State-Test; keine Alerts, Sounds oder Overlays werden ausgeloest.' },\n        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht.' }";
js = replaceOnce(js, routesAnchor, routesReplacement, 'routes list');

js = replaceOnce(
  js,
  "console.log('[bus_diagnostics] STEP_CAN5_1 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state and recovery strategy prepared');",
  "console.log('[bus_diagnostics] STEP_CAN5_5 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state, recovery strategy and simulation harness prepared');",
  'console log'
);

const resultAnchor = "    recoveryStrategyState: diagnostics.recoveryStrategyState,\n    vipStatus: compactFetch(vip),";
const resultReplacement = "    recoveryStrategyState: diagnostics.recoveryStrategyState,\n    recoverySimulationHarness: buildRecoverySimulationStatus(),\n    vipStatus: compactFetch(vip),";
js = replaceOnce(js, resultAnchor, resultReplacement, 'status result simulation harness');

const summaryAnchor = "    recoveryStrategyMode: recoveryStrategyState.mode,\n    recoveryStrategyState: recoveryStrategyState.state,\n    recoveryAllowedActions: recoveryStrategyState.allowedActions.length,\n    recoveryBlockedActions: recoveryStrategyState.blockedActions.length,\n    optionalInfoCount: optionalInfo.length,";
const summaryReplacement = "    recoveryStrategyMode: recoveryStrategyState.mode,\n    recoveryStrategyState: recoveryStrategyState.state,\n    recoveryAllowedActions: recoveryStrategyState.allowedActions.length,\n    recoveryBlockedActions: recoveryStrategyState.blockedActions.length,\n    recoverySimulationMode: 'read_only',\n    recoverySimulationScenarios: Object.keys(RECOVERY_SIMULATION_SCENARIOS).length,\n    optionalInfoCount: optionalInfo.length,";
js = replaceOnce(js, summaryAnchor, summaryReplacement, 'summary simulation fields');

const unavailableAnchor = "  } else if (unmatched > 0) {\n    stateName = 'blocked_unmatched_alert_sound';";
const unavailableReplacement = "  } else if (handshakeState === 'sound_eventbus_unavailable') {\n    stateName = 'blocked_sound_status_unavailable';\n    severity = 'warning';\n    reasons.push('sound_eventbus_unavailable');\n    nextAction = 'manual_sound_status_review';\n  } else if (unmatched > 0) {\n    stateName = 'blocked_unmatched_alert_sound';";
js = replaceOnce(js, unavailableAnchor, unavailableReplacement, 'sound unavailable recovery branch');

const recoveryFunctionAnchor = "function buildRecoveryStrategyState(correlationBody) {";
const simulationBlock = [
"const RECOVERY_SIMULATION_SCENARIOS = {",
"  ok: { handshake: 'matched', visual: 'matched_and_visual_acknowledged', unmatched: 0, missingAck: 0, noClient: 0, waiting: 0 },",
"  missingAck: { handshake: 'matched', visual: 'matched_but_visual_ack_missing', unmatched: 0, missingAck: 1, noClient: 0, waiting: 0 },",
"  noClient: { handshake: 'matched', visual: 'matched_but_no_overlay_client', unmatched: 0, missingAck: 0, noClient: 1, waiting: 0 },",
"  unmatched: { handshake: 'matched', visual: 'matched_and_visual_acknowledged', unmatched: 1, missingAck: 0, noClient: 0, waiting: 0 },",
"  waitingTooLong: { handshake: 'matched', visual: 'matched_but_visual_ack_missing', unmatched: 0, missingAck: 1, noClient: 0, waiting: 0 },",
"  waiting: { handshake: 'matched', visual: 'matched_waiting_for_visual_ack', unmatched: 0, missingAck: 0, noClient: 0, waiting: 1 },",
"  soundFetchFailed: { handshake: 'sound_eventbus_unavailable', visual: 'sound_not_matched_yet', unmatched: 0, missingAck: 0, noClient: 0, waiting: 0 }",
"};",
"",
"function buildRecoverySimulationStatus() {",
"  return {",
"    ok: true,",
"    module: MODULE,",
"    version: VERSION,",
"    feature: 'recovery_simulation_harness',",
"    statusApiVersion: STATUS_API_VERSION,",
"    mode: 'read_only',",
"    readOnly: true,",
"    isolated: true,",
"    automationEnabled: false,",
"    flowTouched: false,",
"    queueTouched: false,",
"    soundSystemTouched: false,",
"    alertSystemTouched: false,",
"    overlayTouched: false,",
"    productiveActions: false,",
"    allowedMethods: ['GET'],",
"    scenarios: Object.keys(RECOVERY_SIMULATION_SCENARIOS),",
"    routes: {",
"      status: '/api/bus-diagnostics/recovery-simulation/status',",
"      test: '/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck'",
"    },",
"    blockedActions: ['auto_replay_alert', 'auto_replay_sound', 'auto_retry_overlay', 'auto_recovery'],",
"    notes: [",
"      'Synthetic status only.',",
"      'Does not enqueue alerts.',",
"      'Does not start sounds.',",
"      'Does not send overlay events.',",
"      'Does not call recovery routes.'",
"    ]",
"  };",
"}",
"",
"function buildRecoverySimulationTest(query) {",
"  const requested = String((query && query.scenario) || 'ok').trim();",
"  const scenario = RECOVERY_SIMULATION_SCENARIOS[requested] ? requested : 'ok';",
"  const simulated = RECOVERY_SIMULATION_SCENARIOS[scenario];",
"  const syntheticCorrelation = {",
"    ok: true,",
"    warnings: [],",
"    comparison: { unmatched: simulated.unmatched },",
"    handshakeState: { ok: simulated.handshake !== 'sound_eventbus_unavailable', warning: simulated.handshake === 'sound_eventbus_unavailable', state: simulated.handshake, unmatched: simulated.unmatched },",
"    visualDeliveryState: { ok: simulated.missingAck === 0 && simulated.noClient === 0, warning: simulated.missingAck > 0 || simulated.noClient > 0, state: simulated.visual, missingAck: simulated.missingAck, noClient: simulated.noClient, waiting: simulated.waiting }",
"  };",
"  const recovery = buildRecoveryStrategyState(syntheticCorrelation);",
"  return {",
"    ok: true,",
"    module: MODULE,",
"    version: VERSION,",
"    feature: 'recovery_simulation_test',",
"    mode: 'read_only',",
"    readOnly: true,",
"    isolated: true,",
"    scenario,",
"    requestedScenario: requested,",
"    unknownScenarioFallback: requested !== scenario,",
"    automationEnabled: false,",
"    flowTouched: false,",
"    queueTouched: false,",
"    soundSystemTouched: false,",
"    alertSystemTouched: false,",
"    overlayTouched: false,",
"    productiveActions: false,",
"    syntheticCorrelation,",
"    recoveryStrategyState: recovery,",
"    checkedAt: new Date().toISOString()",
"  };",
"}",
"",
].join('\n');
js = replaceOnce(js, recoveryFunctionAnchor, simulationBlock + recoveryFunctionAnchor, 'simulation functions before recovery strategy');

write(rel, js);

const doc = [
'# EVENTBUS CAN-5.5 READ-ONLY RECOVERY SIMULATION HARNESS',
'',
'Stand: 2026-06-01',
'Status: kleiner Code-Step / read-only Diagnose',
'',
'## Ziel',
'',
'CAN-5.5 ergänzt einen isolierten Simulation-Harness im Bus-Diagnostics-Modul.',
'',
'~~~text',
'Keine echten Alerts auslösen',
'Keine Sounds starten',
'Keine Overlay-Events senden',
'Keine Recovery-Route aufrufen',
'Keine Queue-/Sound-/Overlay-Flows ändern',
'~~~',
'',
'## Neue Routen',
'',
'~~~text',
'/api/bus-diagnostics/recovery-simulation/status',
'/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck',
'~~~',
'',
'## Szenarien',
'',
'~~~text',
'ok',
'missingAck',
'noClient',
'unmatched',
'waitingTooLong',
'waiting',
'soundFetchFailed',
'~~~',
'',
'## Erwartete Sicherheitsfelder',
'',
'~~~text',
'mode: read_only',
'readOnly: true',
'isolated: true',
'automationEnabled: false',
'flowTouched: false',
'queueTouched: false',
'soundSystemTouched: false',
'alertSystemTouched: false',
'overlayTouched: false',
'productiveActions: false',
'~~~',
'',
'## Prüfbefehle',
'',
'~~~powershell',
'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/status" | ConvertTo-Json -Depth 12',
'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck" | ConvertTo-Json -Depth 12',
'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=noClient" | ConvertTo-Json -Depth 12',
'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=unmatched" | ConvertTo-Json -Depth 12',
'~~~',
'',
'## Nicht geändert',
'',
'~~~text',
'Keine automatische Recovery',
'Kein Auto-Retry',
'Kein Alert-Replay',
'Kein Sound-Replay',
'Kein Overlay-Retry',
'Keine DB-/Config-Migration',
'~~~',
'',
'## Nächster sinnvoller Schritt',
'',
'~~~text',
'CAN-5.6: Simulation-Harness live testen',
'~~~',
'',
'Erwartung: alle Simulationen liefern nur synthetische Recovery-State-Auswertungen und keine produktiven Aktionen.',
''].join('\n')
write('docs/system-inspection/EVENTBUS_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS.md', doc)

current = [
'## STEP CAN-5.5 Read-only Recovery Simulation Harness',
'',
'Stand: 2026-06-01',
'Marker: STEP_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS',
'',
'CAN-5.5 ergänzt im Bus-Diagnostics-Modul einen isolierten read-only Simulation-Harness.',
'',
'~~~text',
'bus_diagnostics: 1.2.4',
'Routen:',
'/api/bus-diagnostics/recovery-simulation/status',
'/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck',
'~~~',
'',
'Sicherheitsstatus:',
'',
'~~~text',
'automationEnabled: false',
'productiveActions: false',
'flowTouched: false',
'queueTouched: false',
'soundSystemTouched: false',
'alertSystemTouched: false',
'overlayTouched: false',
'~~~',
'',
'Keine produktive Flow-Änderung.',
''].join('\n')
prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS', current)

next_steps = [
'## Nach STEP CAN-5.5',
'',
'Marker: STEP_CAN5_5_NEXT_STEPS',
'',
'Nächster sinnvoller Schritt:',
'',
'~~~text',
'CAN-5.6: Simulation-Harness live testen',
'~~~',
'',
'Prüfen:',
'',
'~~~text',
'/api/bus-diagnostics/recovery-simulation/status',
'/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck',
'/api/bus-diagnostics/recovery-simulation/test?scenario=noClient',
'/api/bus-diagnostics/recovery-simulation/test?scenario=unmatched',
'/api/bus-diagnostics/recovery-simulation/test?scenario=soundFetchFailed',
'~~~',
'',
'Erwartung: readOnly true, automationEnabled false, productiveActions false und keine Flow-Touches.',
''].join('\n')
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN5_5_NEXT_STEPS', next_steps)

console.log('[CAN-5.5] done - read-only simulation harness prepared');
