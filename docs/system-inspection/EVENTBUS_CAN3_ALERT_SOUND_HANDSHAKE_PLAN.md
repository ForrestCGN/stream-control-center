# EVENTBUS_CAN3_ALERT_SOUND_HANDSHAKE_PLAN

Stand: 2026-06-01
Status: Plan / sichere Umsetzungsvorbereitung
Scope: Alert-System, Sound-System und Visual-Overlay-Handshake

## Ziel

CAN-3 soll den Alert/Sound/Visual-Flow nachvollziehbar machen, ohne bestehende produktive Flows zu entfernen.

## Aktueller Befund

- `alert_system.js` besitzt bereits:
  - `alertOutput.bus` fuer `visual.alert` mit `requireAck`, `replayable`, `ttlMs`.
  - `alertEventBus` fuer `alert.status`.
  - `alertSoundCorrelation` mit Recent-Liste und Correlation-Statusroute.
  - `overlayDeliveryByEvent` und Overlay-Watchdog.
- `sound_system.js` besitzt bereits:
  - `soundBus` mit Aktionen fuer `queued`, `starting`, `started`, `finished`, `failed`, `bundle.queued`, `bundle.lock_started`, `bundle.lock_finished`.
  - `activeBundleLock` als vorhandenen Zustand.
- CAN-1/CAN-2/CAN-2.1/CAN-2.2 sind live bestaetigt.

## Risiko aus bisherigem Fehlerbild

Bekannt war:
- Sound/TTS lief.
- Visual-Overlay erschien nicht.
- Queue/Bundle konnte in Zwischenzustand bleiben.

Deshalb darf CAN-3 nicht blind Flows ersetzen, sondern zuerst IDs/Phasen sichtbar und einheitlich machen.

## CAN-3 Umsetzungsvorschlag

### CAN-3.1: Handshake-ID vereinheitlichen

Nur additiv:

- `eventUid` bleibt Alert-Haupt-ID.
- `correlationId` wird gesetzt, falls noch leer.
- Sound-Bundle bekommt immer dieselbe `correlationId`.
- Visual-Alert bekommt dieselbe `correlationId`.
- Bus-Events enthalten `eventUid`, `correlationId`, `requestId`, `bundleId`.

### CAN-3.2: Phasen sichtbar machen

Additive Status-/Bus-Phasen:

```text
alert.queued
alert.sound_bundle_prepared
sound.bundle.queued
sound.bundle.lock_started
sound.started
visual.alert.play_sent
visual.alert.ack_received
visual.alert.finished
sound.finished
alert.finished
alert.failed
```

### CAN-3.3: Diagnose zuerst, keine Recovery-Automatik

Zuerst nur:
- Statusroute erweitern
- Correlation-Status verbessern
- fehlende Phase als Warning ausgeben

Keine automatische Queue-Freigabe, kein Overlay-Refresh, kein Reset ohne separaten Schritt.

## Betroffene Dateien fuer naechsten Code-Step

```text
backend/modules/alert_system.js
backend/modules/sound_system.js
docs/system-inspection/EVENTBUS_CAN3_ALERT_SOUND_HANDSHAKE_PLAN.md
```

## Tests fuer CAN-3.1

```powershell
node -c backend\modules\alert_system.js
node -c backend\modules\sound_system.js
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/check" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
```

## Nicht aendern

```text
Keine neuen Module
Keine neuen Helper
Keine DB-Neuanlage
Keine Queue-Logik entfernen
Keine Sound-Logik entfernen
Keine Overlay-Logik entfernen
Keine automatische Recovery
```
