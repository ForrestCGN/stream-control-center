# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP489

## Stream-Control-Center

Aktueller Schwerpunkt: Kanalpunkte-System als neues Fachmodul auf Basis des in STEP488 integrierten Communication-Bus-Contracts.

## Kanalpunkte-System

STEP489 erstellt das Backend-Skelett:

- `backend/modules/channelpoints.js`
- `moduleVersion 0.1.0`
- `GET /api/channelpoints/status`
- `GET /api/channelpoints/bus-test`
- Bus-Registrierung ueber `registerModule`
- Heartbeat ueber `heartbeatModule`
- Status-Publish ueber `publishModuleStatus`
- Selftest-Subscription fuer `channelpoints.test/ping`

Bewusst nicht enthalten:

- keine Twitch Reward-Schreibaktionen
- keine Reward-Synchronisierung
- keine Redemption-Verarbeitung
- keine DB-Migration
- kein Dashboard-Modul

## Communication Bus

Der Stand aus STEP488 bleibt Grundlage:

- `backend/modules/helpers/helper_communication.js` steht auf Version `0.4.0`.
- Modul-zu-Modul-Contract sitzt direkt im bestehenden Bus-Core.
- Keine zweite dauerhafte Bus-/Contract-Helper-Datei verwenden.
- Bestehende HTTP-/WS-/ACK-/Replay-/Issue-Funktionen bleiben erhalten.

Lokaler Runtime-Test nach STEP488 war erfolgreich:

- `/api/communication/status` erreichbar.
- `/api/communication/test` erzeugt weiterhin Events.
- `/api/communication/watchdog` funktioniert weiter.
- Neue Subscriber-Felder sind im Testresult sichtbar.

Hinweis:

- `communication_bus.js` meldet in der aeusseren API noch `coreVersion 0.3.0`, obwohl `helper_communication.js` seit STEP488 `0.4.0` ist. Das ist als Nachziehpunkt dokumentiert und wurde in STEP489 nicht nebenbei geaendert.

## Shoutout

Der Stand aus STEP486 bleibt fachlich unveraendert:

- `backend/modules/twitch.js`: OAuth, Helix, EventSub-WebSocket, Subscription-Status.
- `backend/modules/clip_shoutout.js`: Shoutout-Logik, Queues, Incoming-Shoutout-Speicherung, Produktionscheck, Live-Test-/Decision-Prep.
- `htdocs/dashboard/modules/shoutout.js/css`: Dashboard-Tabs inklusive `Eingehend`, `Produktion` und `Live-Test`.

## Naechster sinnvoller Schritt

`STEP490_CHANNELPOINTS_TWITCH_READINESS_CHECK`

Ziel: Twitch-Scopes und vorhandene Twitch-Helper fuer Kanalpunkte pruefen und eine lesende/diagnostische Readiness-Route vorbereiten. Noch keine Reward-Schreibaktionen.
