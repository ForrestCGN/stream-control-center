/* STEP CAN-5.5 FIX - read-only recovery simulation harness. No productive actions. */
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
  fs.writeFileSync(abs, content.replace(/\r?\n/g, '\r\n'), 'utf8');
  console.log('[CAN-5.5-FIX] wrote', rel);
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error('[CAN-5.5-FIX] Anchor not found: ' + label);
  }
  return content.replace(search, replacement);
}

function replaceRegexOnce(content, regex, replacement, label) {
  if (!regex.test(content)) {
    throw new Error('[CAN-5.5-FIX] Regex anchor not found: ' + label);
  }
  return content.replace(regex, replacement);
}

function prependOnce(rel, marker, block) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-5.5-FIX] already present', rel);
    return;
  }
  write(rel, block + '\n\n' + current);
}

const busRel = 'backend/modules/bus_diagnostics.js';
let bus = read(busRel);

bus = bus.replace("const VERSION = '1.2.3';", "const VERSION = '1.2.4';");
bus = bus.replace("build: 'STEP_CAN5_1',", "build: 'STEP_CAN5_5',");
bus = bus.replace(
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state and recovery-strategy aggregator.',",
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state, recovery-strategy and recovery-simulation aggregator.',"
);

const routeBlock = [
"  registerGet(app, '/api/bus-diagnostics/recovery-simulation/status', (req, res) => {",
"    res.json(buildRecoverySimulationStatus());",
"  });",
"",
"  registerGet(app, '/api/bus-diagnostics/recovery-simulation/test', (req, res) => {",
"    res.json(buildRecoverySimulationTest(req.query || {}));",
"  });",
""
].join('\n');

if (!bus.includes("/api/bus-diagnostics/recovery-simulation/status")) {
  bus = replaceOnce(
    bus,
    "  registerGet(app, '/api/bus-diagnostics/routes', (req, res) => {",
    routeBlock + "  registerGet(app, '/api/bus-diagnostics/routes', (req, res) => {",
    'insert simulation routes before routes overview'
  );
}

bus = bus.replace(
  "        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht.' }",
  "        { method: 'GET', path: '/api/bus-diagnostics/routes', description: 'Read-only Routenübersicht.' },\n" +
  "        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/status', description: 'Read-only Recovery-Simulation Status. Fuehrt keine Aktionen aus.' },\n" +
  "        { method: 'GET', path: '/api/bus-diagnostics/recovery-simulation/test', description: 'Read-only synthetischer Recovery-Simulationstest. Fuehrt keine Aktionen aus.' }"
);

bus = bus.replace(
  "console.log('[bus_diagnostics] STEP_CAN5_1 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state and recovery strategy prepared');",
  "console.log('[bus_diagnostics] STEP_CAN5_5 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state, recovery strategy and simulation harness prepared');"
);

const simulationFunctions = [
"function buildRecoverySimulationStatus() {",
"  return {",
"    ok: true,",
"    module: MODULE,",
"    version: VERSION,",
"    feature: 'recovery_simulation_harness',",
"    statusApiVersion: STATUS_API_VERSION,",
"    simulationVersion: 'CAN-5.5',",
"    readOnly: true,",
"    flowTouched: false,",
"    queueTouched: false,",
"    soundSystemTouched: false,",
"    alertSystemTouched: false,",
"    overlayTouched: false,",
"    automationEnabled: false,",
"    productiveActions: false,",
"    allowedScenarios: ['ok', 'missingAck', 'noClient', 'unmatched', 'waitingTooLong', 'soundFetchFailed'],",
"    blockedActions: ['auto_replay_alert', 'auto_replay_sound', 'auto_retry_overlay', 'auto_recovery'],",
"    routes: {",
"      status: '/api/bus-diagnostics/recovery-simulation/status',",
"      test: '/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck'",
"    },",
"    notes: [",
"      'Synthetic diagnostics only.',",
"      'Does not enqueue alerts.',",
"      'Does not start sounds.',",
"      'Does not control overlays.',",
"      'Does not call recovery routes.'",
"    ],",
"    checkedAt: new Date().toISOString()",
"  };",
"}",
"",
"function buildRecoverySimulationTest(query) {",
"  const scenarioRaw = String((query && query.scenario) || 'ok').trim();",
"  const scenario = normalizeSimulationScenario(scenarioRaw);",
"  const syntheticCorrelation = buildSyntheticCorrelationForScenario(scenario);",
"  const recoveryStrategyState = buildRecoveryStrategyState(syntheticCorrelation);",
"  return {",
"    ok: true,",
"    module: MODULE,",
"    version: VERSION,",
"    feature: 'recovery_simulation_test',",
"    simulationVersion: 'CAN-5.5',",
"    scenario,",
"    requestedScenario: scenarioRaw,",
"    synthetic: true,",
"    readOnly: true,",
"    flowTouched: false,",
"    queueTouched: false,",
"    soundSystemTouched: false,",
"    alertSystemTouched: false,",
"    overlayTouched: false,",
"    automationEnabled: false,",
"    productiveActions: false,",
"    blockedActions: recoveryStrategyState.blockedActions,",
"    recoveryStrategyState,",
"    syntheticCorrelation: {",
"      handshakeState: syntheticCorrelation.handshakeState,",
"      visualDeliveryState: syntheticCorrelation.visualDeliveryState,",
"      comparison: syntheticCorrelation.comparison,",
"      warnings: syntheticCorrelation.warnings || []",
"    },",
"    checkedAt: new Date().toISOString()",
"  };",
"}",
"",
"function normalizeSimulationScenario(value) {",
"  const key = String(value || '').trim().toLowerCase();",
"  if (key === 'missingack' || key === 'missing_ack') return 'missingAck';",
"  if (key === 'noclient' || key === 'no_client') return 'noClient';",
"  if (key === 'unmatched') return 'unmatched';",
"  if (key === 'waitingtoolong' || key === 'waiting_too_long' || key === 'waiting') return 'waitingTooLong';",
"  if (key === 'soundfetchfailed' || key === 'sound_fetch_failed') return 'soundFetchFailed';",
"  return 'ok';",
"}",
"",
"function buildSyntheticCorrelationForScenario(scenario) {",
"  const base = {",
"    ok: true,",
"    warnings: [],",
"    comparison: { matched: 2, unmatched: 0 },",
"    handshakeState: { ok: true, warning: false, state: 'matched', unmatched: 0 },",
"    visualDeliveryState: { ok: true, warning: false, state: 'matched_and_visual_acknowledged', missingAck: 0, noClient: 0, waiting: 0 }",
"  };",
"",
"  if (scenario === 'missingAck') {",
"    base.visualDeliveryState = { ok: false, warning: true, state: 'matched_but_visual_ack_missing', missingAck: 1, noClient: 0, waiting: 0 };",
"  } else if (scenario === 'noClient') {",
"    base.visualDeliveryState = { ok: false, warning: true, state: 'matched_but_no_overlay_client', missingAck: 0, noClient: 1, waiting: 0 };",
"  } else if (scenario === 'unmatched') {",
"    base.comparison = { matched: 0, unmatched: 1 };",
"    base.handshakeState = { ok: false, warning: true, state: 'unmatched_alert_rows', unmatched: 1 };",
"    base.visualDeliveryState = { ok: true, warning: false, state: 'sound_not_matched_yet', missingAck: 0, noClient: 0, waiting: 0 };",
"  } else if (scenario === 'waitingTooLong') {",
"    base.visualDeliveryState = { ok: true, warning: false, state: 'matched_waiting_for_visual_ack', missingAck: 0, noClient: 0, waiting: 1 };",
"  } else if (scenario === 'soundFetchFailed') {",
"    base.ok = false;",
"    base.warnings = ['sound_eventbus_unavailable'];",
"    base.handshakeState = { ok: false, warning: true, state: 'sound_eventbus_unavailable', unmatched: 0 };",
"    base.visualDeliveryState = { ok: true, warning: false, state: 'sound_not_matched_yet', missingAck: 0, noClient: 0, waiting: 0 };",
"  }",
"",
"  return base;",
"}",
""
].join('\n');

if (!bus.includes('function buildRecoverySimulationStatus()')) {
  bus = replaceOnce(
    bus,
    "function buildRecoveryStrategyState(correlationBody) {",
    simulationFunctions + "\nfunction buildRecoveryStrategyState(correlationBody) {",
    'insert simulation functions before recovery strategy'
  );
}

write(busRel, bus);

const doc = [
"# EVENTBUS CAN-5.5 READ-ONLY RECOVERY SIMULATION HARNESS",
"",
"Stand: 2026-06-01",
"Status: Code-Step / read-only Diagnose",
"",
"## Ergebnis",
"",
"CAN-5.5 ergänzt einen isolierten Simulation-Harness in `bus_diagnostics`.",
"",
"~~~text",
"/api/bus-diagnostics/recovery-simulation/status",
"/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck",
"~~~",
"",
"## Sicherheitsversprechen",
"",
"~~~text",
"readOnly: true",
"automationEnabled: false",
"productiveActions: false",
"flowTouched: false",
"queueTouched: false",
"soundSystemTouched: false",
"alertSystemTouched: false",
"overlayTouched: false",
"~~~",
"",
"## Nicht geändert",
"",
"~~~text",
"Keine echten Alerts",
"Keine echten Sounds",
"Keine Overlay-Steuerung",
"Keine Queue-Änderung",
"Keine automatische Recovery",
"Keine DB-/Config-Migration",
"~~~",
"",
"## Szenarien",
"",
"| Scenario | Zweck | Erwarteter Recovery-State |",
"|---|---|---|",
"| ok | Normalpfad | ok_no_recovery_needed |",
"| missingAck | fehlendes Overlay-Finish-ACK | blocked_missing_visual_ack |",
"| noClient | kein Overlay-Client | blocked_no_overlay_client |",
"| unmatched | Alert/Sound nicht korreliert | blocked_unmatched_alert_sound |",
"| waitingTooLong | ACK wartet noch | observe_waiting_for_ack |",
"| soundFetchFailed | Sound-Status nicht erreichbar | correlation_status_unavailable oder observe_warning |",
"",
"## Prüfbefehle",
"",
"~~~powershell",
"Invoke-RestMethod \"http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/status\" | ConvertTo-Json -Depth 12",
"Invoke-RestMethod \"http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck\" | ConvertTo-Json -Depth 12",
"Invoke-RestMethod \"http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=noClient\" | ConvertTo-Json -Depth 12",
"Invoke-RestMethod \"http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=unmatched\" | ConvertTo-Json -Depth 12",
"~~~",
"",
"## Nächster sinnvoller Schritt",
"",
"~~~text",
"CAN-5.6: Simulation-Harness live testen",
"~~~",
"",
"Erwartung: Alle Simulationen liefern nur Diagnosewerte und lösen keine produktive Aktion aus.",
""
].join('\n');

write('docs/system-inspection/EVENTBUS_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS.md', doc);

const currentStatusBlock = [
"## STEP CAN-5.5 Read-only Recovery Simulation Harness",
"",
"Stand: 2026-06-01",
"Marker: STEP_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS",
"",
"CAN-5.5 ergänzt isolierte Recovery-Simulationen in bus_diagnostics.",
"",
"~~~text",
"bus_diagnostics: 1.2.4",
"/api/bus-diagnostics/recovery-simulation/status",
"/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck",
"readOnly: true",
"automationEnabled: false",
"productiveActions: false",
"~~~",
"",
"Keine echten Alerts/Sounds/Overlays werden ausgelöst.",
""
].join('\n');

const nextStepsBlock = [
"## Nach STEP CAN-5.5",
"",
"Marker: STEP_CAN5_5_NEXT_STEPS",
"",
"Nächster sinnvoller Schritt:",
"",
"~~~text",
"CAN-5.6: Simulation-Harness live testen",
"~~~",
"",
"Zu prüfen:",
"",
"~~~text",
"status route vorhanden",
"missingAck -> blocked_missing_visual_ack",
"noClient -> blocked_no_overlay_client",
"unmatched -> blocked_unmatched_alert_sound",
"automationEnabled bleibt false",
"productiveActions bleibt false",
"~~~",
""
].join('\n');

prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS', currentStatusBlock);
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN5_5_NEXT_STEPS', nextStepsBlock);

console.log('[CAN-5.5-FIX] done - read-only simulation harness only');
