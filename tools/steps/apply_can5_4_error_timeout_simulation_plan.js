/* STEP CAN-5.4 - document error/timeout simulation plan. Documentation only. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function writeFile(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('[CAN-5.4] wrote', rel);
}

function prependOnce(rel, marker, block) {
  const abs = path.join(ROOT, rel);
  let current = '';
  if (fs.existsSync(abs)) current = fs.readFileSync(abs, 'utf8');
  if (current.includes(marker)) {
    console.log('[CAN-5.4] already present', rel);
    return;
  }
  const next = block.replace(/\n/g, '\r\n') + '\r\n' + current;
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, next, 'utf8');
  console.log('[CAN-5.4] updated', rel);
}

const planDoc = "# EVENTBUS CAN-5.4 ERROR / TIMEOUT SIMULATION PLAN\n\nStand: 2026-06-01\nStatus: Plan / Read-only Vorbereitung\n\n## Ausgangslage\n\nCAN-5.2 und CAN-5.3 bestätigen den erfolgreichen Normalpfad.\n\n~~~text\nAlert erfolgreich\nSound erfolgreich\nVisual ACK erfolgreich\nRecovery bleibt read-only\nkeine Automatik ausgelöst\n~~~\n\n## Ziel von CAN-5.4\n\nCAN-5.4 plant kontrollierte Fehler- und Timeout-Simulationen, ohne produktive Wiederholungen auszulösen.\n\nEs geht nur darum, Diagnosezustände sichtbar und eindeutig auswertbar zu machen.\n\n## Nicht-Ziel\n\n~~~text\nKeine automatische Recovery\nKein Auto-Retry\nKein Alert-Replay\nKein Sound-Replay\nKein Overlay-Retry\nKeine Queue-Änderung\nKeine produktive Flow-Änderung\n~~~\n\n## Zu simulierende Zustände\n\n~~~text\nmissingAck\nnoClient\nunmatched\nwaiting_too_long\nsound_fetch_failed\nbundle_wait_timeout\noverlay_watchdog_issue\n~~~\n\n## Sicherheitsregeln\n\n~~~text\nSimulationen müssen explizit als Test markiert sein.\nSimulationen dürfen keine echten Zuschauer-Alerts wiederholen.\nSimulationen dürfen keine echten Sound-/Overlay-Flows doppelt auslösen.\nSimulationen sollen bevorzugt synthetische Statusdaten oder dedizierte Test-Endpunkte nutzen.\nProduktive Queue-/Sound-/Overlay-Pfade bleiben unverändert.\n~~~\n\n## Geplante Simulations-Matrix\n\n| Zustand | Simulationsidee | Erwarteter Recovery-State | Automatik |\n|---|---|---|---|\n| matched_and_visual_acknowledged | normaler Test-Alert | ok_no_recovery_needed | aus |\n| matched_but_visual_ack_missing | ACK absichtlich nicht senden oder synthetisch erzwingen | manual_review_missing_ack | aus |\n| matched_but_no_overlay_client | Test ohne Overlay-Client oder synthetischer noClient-Status | manual_review_no_client | aus |\n| unmatched | Alert-Trace ohne Sound-Match synthetisch prüfen | manual_review_unmatched | aus |\n| waiting_too_long | waiting über expectedAckBy hinaus synthetisch prüfen | manual_review_timeout | aus |\n| sound_eventbus_unavailable | Sound-Status-Fetch synthetisch failen lassen | manual_review_sound_status | aus |\n\n## CAN-5.5 Vorschlag\n\n~~~text\nCAN-5.5: Read-only Simulation Harness planen oder minimal ergänzen\n~~~\n\nNur wenn klar ist, dass die Simulationen strikt isoliert sind:\n\n~~~text\n/api/bus-diagnostics/recovery-simulation/status\n/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck\n~~~\n\nDiese Endpunkte dürfen nur Diagnosewerte erzeugen und keine produktiven Aktionen auslösen.\n\n## Prüfkriterien vor Code\n\n~~~text\nIst der Test synthetisch?\nIst klar sichtbar, dass es ein Test ist?\nKann er keine echten Alerts/Sounds/Overlays erneut auslösen?\nBleibt automationEnabled=false?\nBleiben blockedActions aktiv?\nBleiben queueTouched/soundSystemTouched/overlayTouched false?\n~~~\n";
const currentStatusBlock = "## STEP CAN-5.4 Fehler-/Timeout-Simulation geplant\n\nStand: 2026-06-01\nMarker: STEP_CAN5_4_ERROR_TIMEOUT_SIMULATION_PLAN\n\nCAN-5.4 definiert die geplanten read-only Fehler- und Timeout-Simulationen.\n\n~~~text\nmissingAck\nnoClient\nunmatched\nwaiting_too_long\nsound_fetch_failed\nbundle_wait_timeout\noverlay_watchdog_issue\n~~~\n\nRegel bleibt:\n\n~~~text\nRecovery bleibt read-only\nautomationEnabled bleibt false\nkeine produktive Wiederholung\nkeine Flow-Änderung\n~~~\n";
const nextStepsBlock = "## Nach STEP CAN-5.4\n\nMarker: STEP_CAN5_4_NEXT_STEPS\n\nNächster sinnvoller Schritt:\n\n~~~text\nCAN-5.5: Read-only Simulation Harness planen oder minimal ergänzen\n~~~\n\nVor Code muss klar sein:\n\n~~~text\nSimulationen sind synthetisch\nSimulationen lösen keine echten Alerts/Sounds/Overlays aus\nautomationEnabled bleibt false\nblockedActions bleiben aktiv\nFlow bleibt unverändert\n~~~\n";

writeFile('docs/system-inspection/EVENTBUS_CAN5_4_ERROR_TIMEOUT_SIMULATION_PLAN.md', planDoc);
prependOnce('project-state/CURRENT_STATUS.md', 'STEP_CAN5_4_ERROR_TIMEOUT_SIMULATION_PLAN', currentStatusBlock);
prependOnce('project-state/NEXT_STEPS.md', 'STEP_CAN5_4_NEXT_STEPS', nextStepsBlock);

console.log('[CAN-5.4] done - documentation only, no backend module code changed');
