# EVENTBUS CAN-4.1 VISUAL DELIVERY STATE

Stand: 2026-06-01
Status: Repo-Patch / read-only Diagnose

## Ziel

CAN-4.1 erweitert die bestehende Alert/Sound-Correlation-Diagnose um eine reine Lesediagnose fuer die visuelle Overlay-Lieferung.

```text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State -> VisualDeliveryState
```

## Betroffene Datei

```text
backend/modules/alert_system.js
```

## Neue Diagnose

Route:

```text
/api/alerts/eventbus/correlation/status?check=1
```

Neues Feld:

```text
visualDeliveryState
```

Wichtige Werte:

```text
state
ok
warning
alertRows
soundMatched
overlayRows
acknowledged
waiting
missingAck
noClient
overlayClients
nextAction
recent
```

## Moegliche States

```text
idle_no_recent_visual_delivery
matched_and_visual_acknowledged
matched_waiting_for_visual_ack
matched_but_no_overlay_client
matched_but_visual_ack_missing
sound_not_matched_yet
visual_delivery_not_seen
visual_delivery_observed
```

## Nicht geaendert

```text
Keine Queue-Logik geaendert
Keine Sound-Playback-Logik geaendert
Keine Overlay-Ausgabe geaendert
Keine TTS-Logik geaendert
Keine DB-/Config-Aenderung
Keine Recovery-Automatik
```

## Pruefen

```powershell
node tools\stepspply_can4_1_visual_delivery_state.js
node -c backend\moduleslert_system.js
.\stepdone.cmd "STEP CAN-4.1 Visual Delivery State Diagnostics"
```

Nach Backend-Restart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12
```

## Erwartung

```text
alert_system: 3.1.9
traceCorrelationVersion: CAN-4.1
visualDeliveryVersion: CAN-4.1
visualDeliveryState vorhanden
Keine Flow-Aenderung
```
