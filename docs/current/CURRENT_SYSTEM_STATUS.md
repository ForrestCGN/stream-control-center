# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP486

## Stream-Control-Center

Aktueller Schwerpunkt: Shoutout-System / Twitch-EventSub / Produktionscheck / Live-Test-Vorbereitung.

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

- `/api/clip-shoutout/status`
- `/api/clip-shoutout/inbound`
- `/api/clip-shoutout/inbound/stats`
- `/api/clip-shoutout/production-check`
- `/api/clip-shoutout/live-test`
- `/api/clip-shoutout/decision-prep`
- `/api/twitch/eventsub/status`

## Offene Punkte

- Produktionscheck lokal ausführen.
- Debug-Inbound-Event lokal testen.
- Echte EventSub-Shoutout-Events live testen.
- Ergebnisse dokumentieren.
- Produktive `!so`-Entscheidung erst nach ausdrücklicher Freigabe.
