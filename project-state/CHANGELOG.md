# CHANGELOG

## STEP278Q

- Added `htdocs/public/tools/communication_debug_view.html`.
- Added readable Communication Bus debug view for status, clients, events, issues, watchdog and recovered events.
- Added buttons for status refresh, watchdog checks, watchdog tracking, recovery checks, recovery tracking, replay and reset.
- Uses only existing Communication Bus APIs.
- No backend code, API, database, dashboard auth, OBS, overlay or production module migration changes.

## STEP278P

- Updated `backend/modules/communication_bus.js` to `v0.6.0 / STEP278P`.
- Watchdog now separates current issues from recovered events.
- Added `includeRecovered=1` support for watchdog diagnostics.
- Added optional `trackRecovered=1` support for historical recovery entries.
- Historical issues are not automatically deleted.
- No alert, sound, TTS, VIP, dashboard, database, OBS or `broadcastWS` migration changes.
