# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP487

## Stream-Control-Center

Aktueller Schwerpunkt: Communication Bus / EventBus als zentrale Kommunikations- und Monitoring-Schicht vorbereiten, danach Kanalpunkte-System.

## Communication Bus / EventBus

- STEP487 ergänzt `backend/modules/helpers/helper_communication_contract.js`.
- Der Helper ist eine optionale Backend-Modul-zu-Modul-Vertragsschicht für den bestehenden Communication Bus.
- Ziel: Module können sich anmelden, abmelden, Heartbeats/Status senden, Events senden und relevante Events abonnieren.
- Der Ansatz entspricht einer CAN-Bus-ähnlichen Architektur: Module senden auf eine gemeinsame Leitung, andere Module werten nur relevante Events aus.
- Bestehende produktive WebSocket-/Replay-/ACK-/Diagnose-Flows bleiben unverändert.
- `communication_bus.js` und `helper_communication.js` wurden in STEP487 bewusst nicht geändert.

## Shoutout

- STEP483: Dashboard in Tabs aufgeteilt.
- STEP484: Eingehende/ausgehende Twitch-Shoutout-EventSub-Events in bestehende Module integriert.
- STEP485: Produktionscheck ergänzt.
- STEP486: Live-Test- und Entscheidungs-Vorbereitung ergänzt.

Aktive Zuständigkeiten:

- `backend/modules/twitch.js`: OAuth, Helix, EventSub-WebSocket, Subscription-Status.
- `backend/modules/clip_shoutout.js`: Shoutout-Logik, Queues, Incoming-Shoutout-Speicherung, Produktionscheck, Live-Test-/Decision-Prep.
- `htdocs/dashboard/modules/shoutout.js/css`: Dashboard-Tabs inklusive `Eingehend`, `Produktion` und `Live-Test`.

## Wichtige Routen

Communication Bus:

- `/api/communication/status`
- `/api/communication/test`
- `/api/communication/watchdog`

Shoutout:

- `/api/clip-shoutout/status`
- `/api/clip-shoutout/inbound`
- `/api/clip-shoutout/inbound/stats`
- `/api/clip-shoutout/production-check`
- `/api/clip-shoutout/live-test`
- `/api/clip-shoutout/decision-prep`
- `/api/twitch/eventsub/status`

## Offene Punkte

- Neues Kanalpunkte-Modul als erstes Fachmodul auf dem Communication-Bus-Contract aufbauen.
- Produktionscheck lokal ausführen.
- Debug-Inbound-Event lokal testen.
- Echte EventSub-Shoutout-Events live testen.
- Ergebnisse dokumentieren.
- Produktive `!so`-Entscheidung erst nach ausdrücklicher Freigabe.
