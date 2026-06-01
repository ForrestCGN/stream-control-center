# EVENTBUS CAN-2 RESILIENCE MATRIX

Stand: 2026-06-01  
Status: Umsetzungsvorbereitung / Read-only Diagnose  
Scope: Bestehendes Modul `backend/modules/bus_diagnostics.js`

## Ziel

CAN-2 ergaenzt eine zentrale, read-only Health-/Recovery-Matrix fuer den Communication Bus / EventBus nach CAN-Bus-Prinzip.

Die Matrix beantwortet pro relevantem Modul:

```text
Modul | Statusroute | Bus-Heartbeat | Queue-State | Overlay-State | Recovery-Route | Risiko
```

## Betroffene Datei

```text
backend/modules/bus_diagnostics.js
```

## Neue/erweiterte Ausgabe

`/api/bus-diagnostics/status` und `/api/bus-diagnostics/check` enthalten zusaetzlich:

```text
resilienceMatrix
summary.matrixRows
summary.matrixOk
summary.matrixWarnings
summary.matrixErrors
```

## Read-only Garantie

```text
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
vipSystemTouched: false
overlayTouched: false
```

CAN-2 liest nur bestehende Status-Endpunkte aus. Es startet keine Sounds, enqueued keine Alerts, veraendert keine Queue und fuehrt keine Recovery automatisch aus.

## Ausgelesene Endpunkte

```text
/api/communication/status
/api/sound/eventbus/status
/api/sound/status
/api/alerts/eventbus/status
/api/alerts/status
/api/alerts/eventbus/correlation/status
/api/vip-sound/status
/api/vip-sound/integration-check
```

## Matrix-Zeilen

Aktuell vorbereitet fuer:

```text
communication_bus
sound_system
alert_system
channelpoints
channelpoints_eventsub_bus_bridge
channelpoints_twitch_readonly_sync
overlay_monitor
vip_sound_overlay_v2
```

## Tests

```powershell
node -c backend\modules\bus_diagnostics.js
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
```

## Erwartung

```text
- ok true, sofern keine echten Error-Risiken erkannt werden.
- resilienceMatrix.rows enthaelt die vorbereiteten Module.
- sound_system und alert_system zeigen Heartbeats aus CAN-1.
- Risiken bleiben Diagnose/Warnung; keine automatische Recovery.
```
