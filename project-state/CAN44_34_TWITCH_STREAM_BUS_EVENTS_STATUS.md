# CAN44.34 Status – Twitch Stream Online/Offline Bus Events

Stand: 2026-06-14 07:56 UTC

## Ergebnis

CAN44.34 vorbereitet.

## Änderungen

- `stream_status` sendet Online-/Offline-Transitions über Communication Bus.
- `live_status_monitor` nutzt `/api/twitch/events/status` als Twitch-Events-Quelle.
- Dashboard zeigt `Twitch Events` statt irreführender EventSub-Live-Unbekanntheit.

## Dateien

- backend/modules/stream_status.js
- backend/modules/live_status_monitor.js
- htdocs/dashboard/modules/live_status_monitor.js

## Tests lokal im Build

- `node -c backend/modules/stream_status.js` OK
- `node -c backend/modules/live_status_monitor.js` OK
- `node -c htdocs/dashboard/modules/live_status_monitor.js` OK
