# CHANGELOG

## STEP278T

- Updated `htdocs/overlays/_overlay-master-test.html` to `v0.1.3`.
- Removed visible STEP/build display from Master-Test-Overlay.
- Removed `MODULE_META.build` from Master-Test-Overlay.
- Removed build data from the overlay `hello` meta payload.
- Added hello-ack watchdog with forced reconnect.
- Added heartbeat-ack stale watchdog with forced reconnect.
- Added Debug View fields for watchdog state, forced reconnect count and last heartbeat send time.
- Updated Communication Bus helper docs and current project state docs.
- No backend, API, alert, sound, TTS, VIP, dashboard, database, OBS or `broadcastWS` migration changes.

## STEP278S

- Updated `backend/modules/communication_bus.js` to `v0.7.0`.
- Added controlled `/api/communication/test-alert` route.
- Updated `htdocs/public/tools/communication_debug_view.html` to `v0.1.2` with Alert Mirror Test button.
- Route sends `visual.alert.play` test events only.
- No alert DB, alert queue, sound or TTS writes.
