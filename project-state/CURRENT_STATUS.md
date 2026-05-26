# CURRENT_STATUS

Stand: 2026-05-26 / STEP489_CHANNELPOINTS_BACKEND_SKELETON

## Aktueller Arbeitsstand

STEP489 erstellt das sichere Backend-Skelett fuer das neue Kanalpunkte-System.

## Kanalpunkte-System

Neu:

- `backend/modules/channelpoints.js`
- Modulversion `0.1.0`
- Route `GET /api/channelpoints/status`
- Route `GET /api/channelpoints/bus-test`
- Bus-Registrierung ueber `registerModule`
- Heartbeat ueber `heartbeatModule`
- Status-Publish ueber `publishModuleStatus`
- Selftest-Subscription fuer `channelpoints.test/ping`

Bewusst nicht umgesetzt:

- keine Twitch-Schreibaktionen
- keine Twitch-Reward-Synchronisierung
- keine DB-Migration
- kein Dashboard-Modul
- keine produktive Redemption-Verarbeitung

## Communication Bus

Der Stand aus STEP488 bleibt Grundlage:

- `backend/modules/helpers/helper_communication.js` Version `0.4.0`
- Modul-zu-Modul-Contract sitzt direkt im bestehenden Bus-Core
- `channelpoints.js` nutzt diesen integrierten Contract direkt ueber `communication_bus.getBus()`

Runtime-Hinweis aus lokalem Test:

- alte Communication-Routen laufen nach STEP488 weiter
- `/api/communication/status` liefert Status inklusive `subscriptions[]`
- `/api/communication/test` liefert Test-Events weiter aus
- `/api/communication/watchdog` funktioniert weiter
- `communication_bus.js` meldet nach aussen noch `coreVersion 0.3.0`, waehrend der Helper-Core seit STEP488 `0.4.0` ist; das ist als kleiner Nachziehpunkt dokumentiert

## Shoutout-System

Der Stand aus STEP486 bleibt fachlich unveraendert.

## Naechster sinnvoller Schritt

`STEP490_CHANNELPOINTS_TWITCH_READINESS_CHECK`

Ziel:

```text
Twitch-Scopes und vorhandene Twitch-Helper pruefen
nur lesende Readiness-/Diagnose-Route fuer Kanalpunkte vorbereiten
keine Reward-Schreibaktionen
```
