# CHANGELOG

## STEP278U

- Updated `htdocs/public/tools/communication_debug_view.html` to `v0.1.3`.
- Added auto-refresh for `/api/communication/status`.
- Added `Auto-Refresh: AN/AUS` toggle button.
- Auto-refresh interval is 2000 ms.
- Last-update text now shows Tool version and auto-refresh state.
- Added busy guard so auto-refresh does not collide with manual actions.
- Auto-refresh does not spam the action log.
- No backend, API, alert, sound, TTS, VIP, dashboard, database, OBS or `broadcastWS` migration changes.

## STEP278T

- Updated `htdocs/overlays/_overlay-master-test.html` to `v0.1.3`.
- Added hello ack watchdog.
- Added heartbeat ack watchdog.
- Added forced reconnect when heartbeat ack becomes stale.
- Removed visible build/STEP display from the overlay.

## STEP278S

- Updated `backend/modules/communication_bus.js` to `v0.7.0`.
- Added `/api/communication/test-alert`.
- Updated Communication Debug View to `v0.1.2`.
- Added Alert Mirror Test button.
