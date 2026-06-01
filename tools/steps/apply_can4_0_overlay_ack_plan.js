'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();

function writeFile(rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('[CAN-4.0] wrote', rel);
}

function readIfExists(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

function appendOnce(rel, marker, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const old = readIfExists(rel);
  if (old.includes(marker)) {
    console.log('[CAN-4.0] already present', rel);
    return;
  }
  const next = old.replace(/\s*$/, '') + '\n\n' + content.trim() + '\n';
  fs.writeFileSync(abs, next.replace(/\n/g, '\r\n'), 'utf8');
  console.log('[CAN-4.0] updated', rel);
}

const doc = `# EVENTBUS CAN-4.0 OVERLAY ACK / VISUAL DELIVERY PLAN

Stand: 2026-06-01
Status: Plan / Pruefpunkte

## Ergebnis aus CAN-3

CAN-3 ist stabil dokumentiert und live bestaetigt.

\`\`\`text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
\`\`\`

Bestaetigter Stand:

\`\`\`text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
handshakeState: matched
matched: 2
unmatched: 0
warnings: []
\`\`\`

## Ziel von CAN-4

CAN-4 soll nicht sofort produktive Flows umbauen.

Ziel ist zunaechst, die visuelle Overlay-Lieferung genauso klar diagnostizierbar zu machen wie die Alert/Sound-Kette aus CAN-3.

## Zu klaerende Kette

\`\`\`text
Alert empfangen
-> Alert queued
-> Sound-Bundle prepared/posted
-> Sound-System matched
-> Visual-Overlay gesendet
-> Overlay-Client bestaetigt Start/Finish/ACK
-> Alert sauber finished
\`\`\`

## Kernfrage

\`\`\`text
Ist der Alert/Sound-Handshake ok, aber das Visual Overlay liefert kein Finish/ACK?
\`\`\`

## Aktuelle bekannte Basis

Im Alert-System existiert bereits ein Overlay-Watchdog mit Delivery-Records.

Wichtige vorhandene Statuswerte:

\`\`\`text
overlayClientCountAtSend
expectedAckBy
ackAt
ackEvent
ackReason
status
issue
\`\`\`

Moegliche Stati:

\`\`\`text
acknowledged
no_overlay_client
waiting_for_finish_ack
missing_finish_ack
\`\`\`

## CAN-4.1 Vorschlag

Read-only Diagnose erweitern, ohne produktive Logik zu aendern.

Betroffene Route voraussichtlich:

\`\`\`text
/api/alerts/eventbus/correlation/status
\`\`\`

Neue optionale Diagnose im Response:

\`\`\`text
visualDeliveryState
\`\`\`

Moegliche Felder:

\`\`\`text
ok
warning
state
alertRows
soundMatched
overlayRows
acknowledged
waiting
missingAck
noClient
nextAction
\`\`\`

## Gewuenschte Zustandslogik

\`\`\`text
idle_no_recent_visual_delivery
matched_and_visual_acknowledged
matched_waiting_for_visual_ack
matched_but_no_overlay_client
matched_but_visual_ack_missing
sound_not_matched_yet
\`\`\`

## Nicht aendern

\`\`\`text
Keine Queue-Logik aendern
Keine Sound-Playback-Logik aendern
Keine Overlay-Ausgabe aendern
Keine TTS-Logik aendern
Keine Recovery-Automatik aktivieren
Keine DB-/Config-Migration
\`\`\`

## Pruefbefehle fuer CAN-4.1

\`\`\`powershell
node -c backend\\modules\\alert_system.js
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12
\`\`\`

## Erfolgskriterium

Nach einem Test-Alert muss sichtbar sein:

\`\`\`text
handshakeState: matched
visualDeliveryState: acknowledged | waiting | missing_ack | no_client
warnings: nur bei echtem Problem
\`\`\`
`;

writeFile('docs/system-inspection/EVENTBUS_CAN4_0_OVERLAY_ACK_VISUAL_DELIVERY_PLAN.md', doc);

appendOnce('project-state/NEXT_STEPS.md', 'CAN-4.0 Overlay ACK / Visual Delivery Diagnose', `## CAN-4.0 Overlay ACK / Visual Delivery Diagnose

Status: geplant / naechster Diagnose-Step

Ziel:

\`\`\`text
Erkennen, ob Alert + Sound sauber matchen, aber das visuelle Overlay kein Finish/ACK liefert.
\`\`\`

Naechster Code-Step:

\`\`\`text
CAN-4.1: Read-only visualDeliveryState in /api/alerts/eventbus/correlation/status
\`\`\`

Nicht aendern:

\`\`\`text
Keine Queue-Logik
Keine Sound-Playback-Logik
Keine Overlay-Ausgabe
Keine Recovery-Automatik
\`\`\`
`);

appendOnce('project-state/CURRENT_STATUS.md', 'CAN-4.0 Plan erstellt', `## CAN-4.0 Plan erstellt

Stand: 2026-06-01

CAN-3 ist stabil dokumentiert. CAN-4 beginnt als reiner Plan-/Diagnoseabschnitt.

\`\`\`text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
\`\`\`

Ziel ist, den naechsten Fehlerbereich sichtbar zu machen: Alert/Sound kann sauber gematcht sein, waehrend das visuelle Overlay eventuell kein Finish/ACK liefert.

Dokument:

\`\`\`text
docs/system-inspection/EVENTBUS_CAN4_0_OVERLAY_ACK_VISUAL_DELIVERY_PLAN.md
\`\`\`
`);
