/* STEP CAN-5.1 - add read-only recovery strategy state to bus diagnostics. */
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
  console.log('[CAN-5.1] wrote', rel);
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error('[CAN-5.1] marker not found: ' + label);
  }
  return content.replace(search, replacement);
}

function insertBefore(content, marker, block, label) {
  if (content.includes(block.trim().split('\n')[0].trim())) {
    console.log('[CAN-5.1] already present', label);
    return content;
  }
  if (!content.includes(marker)) {
    throw new Error('[CAN-5.1] insert marker not found: ' + label);
  }
  return content.replace(marker, block + '\n' + marker);
}

function prependOnce(rel, marker, block) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-5.1] already present', rel);
    return;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, block.replace(/\r?\n/g, '\r\n') + '\r\n' + current, 'utf8');
  console.log('[CAN-5.1] updated', rel);
}

const busPath = 'backend/modules/bus_diagnostics.js';
let bus = read(busPath);

bus = replaceOnce(bus, "const VERSION = '1.2.2';", "const VERSION = '1.2.3';", 'VERSION 1.2.2');
bus = replaceOnce(bus, "build: 'STEP_CAN3_5'", "build: 'STEP_CAN5_1'", 'MODULE_META build');
bus = replaceOnce(
  bus,
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics and handshake-state aggregator.'",
  "description: 'Read-only Communication-Bus, Alert/Sound, VIP, resilience-matrix, optional-diagnostics, handshake-state and recovery-strategy aggregator.'",
  'MODULE_META description'
);
bus = replaceOnce(
  bus,
  "{ method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix, STEP CAN-2.2 optionalDiagnostics und STEP CAN-3.5 handshakeState.' }",
  "{ method: 'GET', path: '/api/bus-diagnostics/status', description: 'Enthaelt STEP CAN-2 resilienceMatrix, STEP CAN-2.2 optionalDiagnostics, STEP CAN-3.5 handshakeState und STEP CAN-5.1 recoveryStrategyState.' }",
  'routes description'
);
bus = replaceOnce(
  bus,
  "console.log('[bus_diagnostics] STEP_CAN3_5 Dashboard diagnostics, resilience matrix, optional diagnostics and handshake state prepared');",
  "console.log('[bus_diagnostics] STEP_CAN5_1 Dashboard diagnostics, resilience matrix, optional diagnostics, handshake state and recovery strategy prepared');",
  'console log'
);

bus = replaceOnce(
  bus,
  "    alertSoundCorrelation: compactFetch(correlation),\n    vipStatus: compactFetch(vip),",
  "    alertSoundCorrelation: compactFetch(correlation),\n    recoveryStrategyState: diagnostics.recoveryStrategyState,\n    vipStatus: compactFetch(vip),",
  'result recoveryStrategyState'
);

bus = replaceOnce(
  bus,
  "  const resilienceMatrix = buildResilienceMatrix({\n    communicationBody,\n    soundBody,\n    soundStatusBody,\n    alertBody,\n    alertStatusBody,\n    correlationBody,\n    vipBody,\n    vipIntegrationBody\n  });",
  "  const resilienceMatrix = buildResilienceMatrix({\n    communicationBody,\n    soundBody,\n    soundStatusBody,\n    alertBody,\n    alertStatusBody,\n    correlationBody,\n    vipBody,\n    vipIntegrationBody\n  });\n  const recoveryStrategyState = buildRecoveryStrategyState(correlationBody);",
  'build recoveryStrategyState'
);

bus = replaceOnce(
  bus,
  "    optionalInfoCount: optionalInfo.length,\n    optionalInfo,",
  "    recoveryStrategyMode: recoveryStrategyState.mode,\n    recoveryStrategyState: recoveryStrategyState.state,\n    recoveryAllowedActions: recoveryStrategyState.allowedActions.length,\n    recoveryBlockedActions: recoveryStrategyState.blockedActions.length,\n    optionalInfoCount: optionalInfo.length,\n    optionalInfo,",
  'summary recovery fields'
);

bus = replaceOnce(
  bus,
  "  return { summary, warnings, optionalInfo, errors, resilienceMatrix };",
  "  return { summary, warnings, optionalInfo, errors, resilienceMatrix, recoveryStrategyState };",
  'analyze return recoveryStrategyState'
);

const recoveryFunction = [
  'function buildRecoveryStrategyState(correlationBody) {',
  "  const handshake = (correlationBody || {}).handshakeState || {};",
  "  const visual = (correlationBody || {}).visualDeliveryState || {};",
  "  const comparison = (correlationBody || {}).comparison || {};",
  "  const warnings = Array.isArray((correlationBody || {}).warnings) ? (correlationBody || {}).warnings : [];",
  "  const reasons = [];",
  "  const allowedActions = [];",
  "  const blockedActions = ['auto_replay_alert', 'auto_replay_sound', 'auto_retry_overlay', 'auto_recovery'];",
  '',
  "  const handshakeState = String(handshake.state || '').trim();",
  "  const visualState = String(visual.state || '').trim();",
  "  const unmatched = Number(comparison.unmatched || handshake.unmatched || 0);",
  "  const missingAck = Number(visual.missingAck || 0);",
  "  const noClient = Number(visual.noClient || 0);",
  "  const waiting = Number(visual.waiting || 0);",
  '',
  "  let stateName = 'observe';",
  "  let severity = 'info';",
  "  let nextAction = '';",
  '',
  "  if (!correlationBody || correlationBody.ok === false) {",
  "    stateName = 'correlation_status_unavailable';",
  "    severity = 'warning';",
  "    reasons.push('correlation_status_unavailable');",
  "    nextAction = 'check_alert_sound_correlation_route';",
  "  } else if (unmatched > 0) {",
  "    stateName = 'blocked_unmatched_alert_sound';",
  "    severity = 'warning';",
  "    reasons.push('unmatched_alert_sound_rows');",
  "    nextAction = 'manual_trace_review';",
  "  } else if (missingAck > 0 || visualState === 'matched_but_visual_ack_missing') {",
  "    stateName = 'blocked_missing_visual_ack';",
  "    severity = 'warning';",
  "    reasons.push('missing_visual_finish_ack');",
  "    nextAction = 'manual_overlay_review';",
  "  } else if (noClient > 0 || visualState === 'matched_but_no_overlay_client') {",
  "    stateName = 'blocked_no_overlay_client';",
  "    severity = 'warning';",
  "    reasons.push('no_overlay_client_at_send');",
  "    nextAction = 'check_obs_browser_source';",
  "  } else if (waiting > 0 || visualState === 'matched_waiting_for_visual_ack') {",
  "    stateName = 'observe_waiting_for_ack';",
  "    severity = 'info';",
  "    reasons.push('visual_ack_still_inside_expected_window');",
  "    nextAction = 'wait_until_expected_ack_deadline';",
  "  } else if (handshakeState === 'matched' && visualState === 'matched_and_visual_acknowledged') {",
  "    stateName = 'ok_no_recovery_needed';",
  "    severity = 'ok';",
  "    reasons.push('handshake_and_visual_acknowledged');",
  "    allowedActions.push('none');",
  "  } else if (handshakeState === 'idle_no_recent_handshake' && visualState === 'idle_no_recent_visual_delivery') {",
  "    stateName = 'idle';",
  "    severity = 'ok';",
  "    reasons.push('no_recent_alert_to_recover');",
  "    allowedActions.push('none');",
  "  } else if (warnings.length > 0) {",
  "    stateName = 'observe_warning';",
  "    severity = 'warning';",
  "    reasons.push('correlation_warnings_present');",
  "    nextAction = 'manual_warning_review';",
  "  } else {",
  "    reasons.push('read_only_no_action_required');",
  "    allowedActions.push('none');",
  "  }",
  '',
  "  return {",
  "    ok: severity !== 'warning' && severity !== 'error',",
  "    warning: severity === 'warning',",
  "    mode: 'read_only',",
  "    state: stateName,",
  "    severity,",
  "    readOnly: true,",
  "    flowTouched: false,",
  "    automationEnabled: false,",
  "    allowedActions,",
  "    blockedActions,",
  "    reasons,",
  "    nextAction,",
  "    source: {",
  "      handshakeState,",
  "      visualDeliveryState: visualState,",
  "      unmatched,",
  "      missingAck,",
  "      noClient,",
  "      waiting",
  "    },",
  "    checkedAt: new Date().toISOString()",
  "  };",
  '}',
  ''
].join('\n');

bus = insertBefore(bus, 'function buildResilienceMatrix(parts) {', recoveryFunction, 'buildRecoveryStrategyState');

write(busPath, bus);

const doc = [
  '# EVENTBUS CAN-5.1 RECOVERY STRATEGY STATE',
  '',
  'Stand: 2026-06-01',
  'Status: read-only Diagnose',
  '',
  '## Ergebnis',
  '',
  'CAN-5.1 ergänzt den Bus-Diagnostics-Status um einen rein lesenden Recovery-Strategy-Block.',
  '',
  '## Betroffene Datei',
  '',
  '- backend/modules/bus_diagnostics.js',
  '',
  '## Neue Ausgabe',
  '',
  '```text',
  'recoveryStrategyState',
  'summary.recoveryStrategyMode',
  'summary.recoveryStrategyState',
  'summary.recoveryAllowedActions',
  'summary.recoveryBlockedActions',
  '```',
  '',
  '## Prinzip',
  '',
  '```text',
  'mode: read_only',
  'automationEnabled: false',
  'flowTouched: false',
  'blockedActions: auto_replay_alert, auto_replay_sound, auto_retry_overlay, auto_recovery',
  '```',
  '',
  '## Mögliche States',
  '',
  '```text',
  'idle',
  'ok_no_recovery_needed',
  'observe_waiting_for_ack',
  'blocked_missing_visual_ack',
  'blocked_no_overlay_client',
  'blocked_unmatched_alert_sound',
  'correlation_status_unavailable',
  'observe_warning',
  'observe',
  '```',
  '',
  '## Nicht geändert',
  '',
  '```text',
  'Keine Queue-Logik geändert',
  'Keine Sound-Playback-Logik geändert',
  'Keine Overlay-Ausgabe geändert',
  'Keine TTS-Logik geändert',
  'Keine Recovery-Automatik aktiviert',
  'Keine DB-/Config-Migration',
  '```',
  '',
  '## Prüfbefehle',
  '',
  '```powershell',
  'node -c backend\\modules\\bus_diagnostics.js',
  'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12',
  '```'
].join('\n');

write('docs/system-inspection/EVENTBUS_CAN5_1_RECOVERY_STRATEGY_STATE.md', doc);

const currentBlock = [
  '## STEP CAN-5.1 Recovery Strategy State read-only',
  '',
  'Stand: 2026-06-01',
  'Marker: STEP_CAN5_1_RECOVERY_STRATEGY_STATE',
  '',
  'Bus-Diagnostics zeigt jetzt zusätzlich einen read-only Recovery-Strategy-Status.',
  '',
  '```text',
  'bus_diagnostics: 1.2.3',
  'recoveryStrategyState.mode: read_only',
  'automationEnabled: false',
  'flowTouched: false',
  'blockedActions: auto_replay_alert, auto_replay_sound, auto_retry_overlay, auto_recovery',
  '```',
  '',
  'Keine produktive Recovery-Automatik wurde aktiviert.',
  ''
].join('\n');

const nextBlock = [
  '## Nach STEP CAN-5.1',
  '',
  'Marker: STEP_CAN5_1_NEXT_STEPS',
  '',
  'Nächster sinnvoller Schritt:',
  '',
  '```text',
  'CAN-5.2: Recovery Strategy Live-Test mit Normalfall und ggf. fehlendem ACK/noClient planen',
  '```',
  '',
  'Weiterhin keine automatische Recovery aktivieren, bevor Fehlerfälle bewusst simuliert und dokumentiert sind.',
  ''
].join('\n');

prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN5_1_RECOVERY_STRATEGY_STATE', currentBlock);
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN5_1_NEXT_STEPS', nextBlock);

console.log('[CAN-5.1] done - read-only recovery strategy state added, no recovery automation enabled');
