# STEP407 – VIP EventBus Smoke-Test Routes

Status: prepared
Date: 2026-05-25

## Ziel

STEP407 macht die in STEP405/STEP406 ergänzte VIP-EventBus-Status-Anbindung direkt testbar, ohne einen echten VIP-/Mod-Sound auszulösen.

## Geändert

Datei:

- `backend/modules/vip_sound_overlay.js`

Neu:

- `GET /api/vip-sound/eventbus/test`
- `POST /api/vip-sound/eventbus/test`
- `GET /api/vip-sound-overlay/eventbus/test`
- `POST /api/vip-sound-overlay/eventbus/test`

Die Test-Routen senden ein reines Test-Event auf:

```text
channel: vip.sound
action: smoke_test
```

## Wichtige Sicherheitsgrenzen

Die Smoke-Test-Route ist absichtlich rein diagnostisch:

- kein Sound-System-Aufruf
- keine Sound-Queue
- keine Overlay-Anzeige
- keine Daily-Usage-Änderung
- keine DB-Migration
- keine Änderung am produktiven VIP-Command-Flow

## Status

`/api/vip-sound/eventbus/status` zeigt weiterhin Zähler, letztes Event, Fehler und verfügbare Routen. In STEP407 ist dort zusätzlich die Test-Route gelistet.

## Test

Nach Backend-Neustart:

```text
http://127.0.0.1:8080/api/vip-sound/eventbus/status
http://127.0.0.1:8080/api/vip-sound/eventbus/test?displayName=ForrestCGN
http://127.0.0.1:8080/api/vip-sound/eventbus/status
```

Erwartung:

- `eventbus/test` liefert `testOnly: true`
- `soundSystemTouched: false`
- `overlayTouched: false`
- `queueTouched: false`
- `dailyUsageTouched: false`
- Status-Zähler `emitted` steigt, wenn der Communication Bus verfügbar ist
- Wenn der Communication Bus nicht verfügbar ist, bleibt der bestehende VIP-Sound-Flow trotzdem unberührt
