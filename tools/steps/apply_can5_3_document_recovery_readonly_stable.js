/* STEP CAN-5.3 - document stable read-only recovery strategy state. No backend module code changes. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function normalize(content) {
  return content.join('\n').replace(/\n/g, '\r\n') + '\r\n';
}

function writeFile(rel, lines) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, normalize(lines), 'utf8');
  console.log('[CAN-5.3] wrote', rel);
}

function prependOnce(rel, marker, lines) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-5.3] already present', rel);
    return;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, normalize(lines) + current, 'utf8');
  console.log('[CAN-5.3] updated', rel);
}

const stableDoc = [
  '# EVENTBUS CAN-5.3 RECOVERY READ-ONLY STABLE STATUS',
  '',
  'Stand: 2026-06-01',
  'Status: stabiler Zwischenstand / Dokumentation',
  '',
  '## Ergebnis',
  '',
  'CAN-5.2 wurde live mit einem echten Test-Alert geprüft.',
  '',
  '```text',
  'Alert erfolgreich',
  'Sound erfolgreich',
  'Visual ACK erfolgreich',
  'Recovery bleibt read-only',
  'keine Automatik ausgelöst',
  '```',
  '',
  '## Bestätigter Live-Stand',
  '',
  '```text',
  'bus_diagnostics: 1.2.3',
  'summary.status: ok',
  'handshakeState: matched',
  'correlationMatched: 2',
  'correlationUnmatched: 0',
  'warnings: []',
  'errors: []',
  'flowTouched: false',
  '```',
  '',
  '## Recovery-State',
  '',
  '```text',
  'recoveryStrategyMode: read_only',
  'recoveryStrategyState: ok_no_recovery_needed',
  'automationEnabled: false',
  'allowedActions: none',
  'blockedActions:',
  '- auto_replay_alert',
  '- auto_replay_sound',
  '- auto_retry_overlay',
  '- auto_recovery',
  'reason: handshake_and_visual_acknowledged',
  '```',
  '',
  '## Bedeutung',
  '',
  'Der Communication Bus kann jetzt den kompletten erfolgreichen Alert-Pfad inklusive Recovery-Entscheidung read-only sichtbar machen.',
  '',
  '```text',
  'Alert/Sound/Visual OK -> Recovery-State = ok_no_recovery_needed',
  'Keine automatische Wiederholung',
  'Keine automatische Recovery',
  'Keine produktive Flow-Änderung',
  '```',
  '',
  '## Nicht geändert',
  '',
  '```text',
  'Keine Queue-Logik geändert',
  'Keine Sound-Playback-Logik geändert',
  'Keine Overlay-Ausgabe geändert',
  'Keine TTS-Logik geändert',
  'Keine automatische Recovery aktiviert',
  'Keine DB-/Config-Migration',
  '```',
  '',
  '## Relevante Prüfbefehle',
  '',
  '```powershell',
  'Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12',
  'Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12',
  '```',
  '',
  '## Nächster sinnvoller Schritt',
  '',
  '```text',
  'CAN-5.4: Fehler-/Timeout-Simulation planen, weiterhin read-only',
  '```',
  '',
  'Ziel: kontrolliert prüfen, wie `missingAck`, `noClient`, `unmatched` oder `waiting_too_long` diagnostisch sichtbar werden, ohne produktive Wiederholungen auszulösen.'
];

const currentStatusBlock = [
  '## STEP CAN-5.3 Recovery read-only stabil bestätigt',
  '',
  'Stand: 2026-06-01',
  'Marker: STEP_CAN5_3_RECOVERY_READONLY_STABLE',
  '',
  'CAN-5.2 wurde live mit einem Test-Alert erfolgreich geprüft.',
  '',
  '```text',
  'bus_diagnostics: 1.2.3',
  'summary.status: ok',
  'handshakeState: matched',
  'correlationMatched: 2',
  'correlationUnmatched: 0',
  'recoveryStrategyMode: read_only',
  'recoveryStrategyState: ok_no_recovery_needed',
  'automationEnabled: false',
  'warnings: []',
  'errors: []',
  'flowTouched: false',
  '```',
  '',
  'Bestätigt:',
  '',
  '```text',
  'Alert erfolgreich',
  'Sound erfolgreich',
  'Visual ACK erfolgreich',
  'Recovery bleibt read-only',
  'keine Automatik ausgelöst',
  '```',
  '',
  'Keine produktive Flow-Änderung in diesem Dokumentations-Step.',
  ''
];

const nextStepsBlock = [
  '## Nach STEP CAN-5.3',
  '',
  'Marker: STEP_CAN5_3_NEXT_STEPS',
  '',
  'CAN-5.1 und CAN-5.2 bestätigen den Recovery-Strategy-State als read-only Diagnose.',
  '',
  'Nächster sinnvoller Schritt:',
  '',
  '```text',
  'CAN-5.4: Fehler-/Timeout-Simulation planen, weiterhin read-only',
  '```',
  '',
  'Vor jedem Test festlegen:',
  '',
  '```text',
  'Wie wird missingAck erzeugt, ohne Live-Alerts zu beschädigen?',
  'Wie wird noClient geprüft, ohne OBS dauerhaft zu verändern?',
  'Wie wird unmatched simuliert, ohne Sound/Alert doppelt auszulösen?',
  'Welche Tests sind nur lokal/manuell erlaubt?',
  '```',
  '',
  'Regel bleibt: keine Recovery-Automatik ohne Schutzfenster, Tests und Rollback.',
  ''
];

writeFile('docs/system-inspection/EVENTBUS_CAN5_3_RECOVERY_READONLY_STABLE_STATUS.md', stableDoc);
prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN5_3_RECOVERY_READONLY_STABLE', currentStatusBlock);
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN5_3_NEXT_STEPS', nextStepsBlock);

console.log('[CAN-5.3] done - documentation only, no backend module code changed');
