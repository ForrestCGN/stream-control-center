# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP485

## Stream-Control-Center

Aktueller Schwerpunkt: Shoutout-System / Twitch-EventSub / Produktionscheck.

## Shoutout

- STEP483: Dashboard in Tabs aufgeteilt.
- STEP484: Eingehende/ausgehende Twitch-Shoutout-EventSub-Events in bestehende Module integriert.
- STEP485: Produktionscheck ergänzt.

Aktive Zuständigkeiten:

- `backend/modules/twitch.js`: OAuth, Helix, EventSub-WebSocket, Subscription-Status.
- `backend/modules/clip_shoutout.js`: Shoutout-Logik, Queues, Incoming-Shoutout-Speicherung, Produktionscheck.
- `htdocs/dashboard/modules/shoutout.js/css`: Dashboard-Tabs inklusive `Eingehend` und `Produktion`.

## Wichtige Routen

- `/api/clip-shoutout/status`
- `/api/clip-shoutout/inbound`
- `/api/clip-shoutout/inbound/stats`
- `/api/clip-shoutout/production-check`
- `/api/twitch/eventsub/status`

## Offene Punkte

- Produktionscheck lokal ausführen.
- Fehlende Scopes/Subscriptions gezielt korrigieren.
- Echte EventSub-Shoutout-Events live testen.
- Produktive `!so`-Entscheidung erst nach Freigabe.
