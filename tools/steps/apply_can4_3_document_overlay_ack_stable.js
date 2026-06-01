/* STEP CAN-4.3 FIX - document stable overlay ACK state.
   Fixes the broken template-literal script from the first CAN-4.3 patch.
   No backend module code changes. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function writeFile(rel, lines) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, lines.join('\r\n') + '\r\n', 'utf8');
  console.log('[CAN-4.3 FIX] wrote', rel);
}

function prependOnce(rel, marker, lines) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-4.3 FIX] already present', rel);
    return;
  }
  const block = lines.join('\r\n') + '\r\n\r\n';
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, block + current, 'utf8');
  console.log('[CAN-4.3 FIX] updated', rel);
}

const stableDoc = [
  '# EVENTBUS CAN-4.3 OVERLAY ACK STABLE STATUS',
  '',
  'Stand: 2026-06-01',
  'Status: stabiler Zwischenstand / Dokumentation',
  '',
  '## Ergebnis',
  '',
  'CAN-4.2 wurde live mit einem Test-Alert geprüft.',
  '',
  '```text',
  'Alert -> Sound -> Visual Overlay -> Finish-ACK',
  '```',
  '',
  '## Bestätigter Live-Stand',
  '',
  '```text',
  'alert_system: 3.1.9',
  'sound_system: 0.1.20',
  'bus_diagnostics: 1.2.2',
  'traceCorrelationVersion: CAN-4.1',
  'visualDeliveryVersion: CAN-4.1',
  '```',
  '',
  '## CAN-4.2 Testergebnis',
  '',
  '```text',
  'handshakeState: matched',
  'visualDeliveryState: matched_and_visual_acknowledged',
  'overlayRows: 1',
  'acknowledged: 1',
  'waiting: 0',
  'missingAck: 0',
  'noClient: 0',
  'warnings: []',
  '```',
  '',
  '## ACK-Details',
  '',
  '```text',
  'ackEvent: finished',
  'ackReason: finished',
  'ackLatencyMs: 25867',
  'status: acknowledged',
  '```',
  '',
  '## Bedeutung',
  '',
  'Die Alert/Sound-Kette und die visuelle Overlay-Zustellung sind im Test sauber nachvollziehbar.',
  '',
  '```text',
  'Alert empfangen',
  '-> Sound-Bundle vorbereitet/gepostet',
  '-> Sound-System matched',
  '-> Visual Overlay gesendet',
  '-> Overlay Finish-ACK erhalten',
  '```',
  '',
  '## Nicht geändert',
  '',
  '```text',
  'Keine Queue-Logik geändert',
  'Keine Sound-Playback-Logik geändert',
  'Keine Overlay-Ausgabe geändert',
  'Keine TTS-Logik geändert',
  'Keine DB-/Config-Änderung',
  'Keine Recovery-Automatik aktiviert',
  '```',
  '',
  '## Relevante Prüfbefehle',
  '',
  '```powershell',
  'Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12',
  'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12',
  '```',
  '',
  '## Nächster sinnvoller Schritt',
  '',
  'CAN-5 sollte weiterhin nicht sofort produktive Flows umbauen.',
  '',
  '```text',
  'CAN-5.0: Recovery-/Timeout-Strategie planen, aber zunächst read-only',
  '```',
  '',
  'Ziel: definieren, was bei `missingAck`, `noClient`, `unmatched` oder dauerhaftem `waiting` passieren darf, ohne versehentlich doppelte Alerts/Sounds auszulösen.'
];

const currentStatusBlock = [
  '## STEP CAN-4.3 Overlay ACK stabil dokumentiert',
  '',
  'Stand: 2026-06-01',
  'Marker: STEP_CAN4_3_OVERLAY_ACK_STABLE',
  '',
  'CAN-4.2 wurde live erfolgreich geprüft.',
  '',
  '```text',
  'alert_system: 3.1.9',
  'handshakeState: matched',
  'visualDeliveryState: matched_and_visual_acknowledged',
  'overlayRows: 1',
  'acknowledged: 1',
  'waiting: 0',
  'missingAck: 0',
  'noClient: 0',
  'warnings: []',
  'ackEvent: finished',
  'ackReason: finished',
  'ackLatencyMs: 25867',
  '```',
  '',
  'Bestätigte Kette:',
  '',
  '```text',
  'Alert -> Sound -> Visual Overlay -> Finish-ACK',
  '```',
  '',
  'Keine produktive Flow-Änderung in diesem Dokumentations-Step.'
];

const nextStepsBlock = [
  '## Nach STEP CAN-4.3',
  '',
  'Marker: STEP_CAN4_3_NEXT_STEPS',
  '',
  'CAN-3 und CAN-4 sind als Diagnose-Zwischenstand stabil dokumentiert.',
  '',
  'Nächster sinnvoller Schritt:',
  '',
  '```text',
  'CAN-5.0: Recovery-/Timeout-Strategie planen, read-only',
  '```',
  '',
  'Vor jeder Recovery-Automatik zuerst definieren:',
  '',
  '```text',
  'missingAck -> nur Diagnose oder manuelle Recovery?',
  'noClient -> kein Auto-Retry ohne Schutz?',
  'unmatched -> keine doppelte Sound-/Alert-Auslösung?',
  'waiting zu lange -> Timeout sichtbar, aber Flow unverändert?',
  '```',
  '',
  'Regel bleibt: keine Funktionalität entfernen und keine produktiven Flows umbauen, bevor Tests und Rollback klar sind.'
];

writeFile('docs/system-inspection/EVENTBUS_CAN4_3_OVERLAY_ACK_STABLE_STATUS.md', stableDoc);
prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN4_3_OVERLAY_ACK_STABLE', currentStatusBlock);
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN4_3_NEXT_STEPS', nextStepsBlock);

console.log('[CAN-4.3 FIX] done - documentation only, no backend module code changed');
