# CHANGELOG

## STEP278O

- Updated `backend/modules/communication_bus.js` to `v0.5.0 / STEP278O`.
- Added manual watchdog route `/api/communication/watchdog`.
- Watchdog can analyze current clients/events for missing clients, offline clients, undelivered events and missing ACKs.
- Watchdog is read-only by default.
- With `track=1`, detected diagnostics are written into Bus `issues[]` via existing `trackIssue()` helper logic.
- No automatic watchdog timer was added.
- No helper, overlay, alert, sound, TTS, VIP, dashboard, database or `broadcastWS` migration changes.

## STEP278N

- Updated `backend/modules/communication_bus.js` to `v0.4.0 / STEP278N`.
- Added controlled replay test route `/api/communication/replay`.
- Replay route calls existing `replayForClient()` helper logic for a specific client.
- Updated `htdocs/overlays/_overlay-master-test.html` to `v0.1.2 / STEP278N`.
- Master overlay now exposes replay/resync capabilities and debug information.
- No automatic replay on `hello` was added.
- No alert, sound, TTS, VIP, dashboard, database or `broadcastWS` migration changes.

## STEP278M

- Hardened `htdocs/overlays/_overlay-master-test.html` for reconnect and OBS browser reload tests.
- Added session id, connect/disconnect counters and connection timestamps.
- Added hello/heartbeat ACK debug timestamps.
- Heartbeat is stopped and restarted cleanly across reconnects.
- No server, dashboard, database or production module migration changes.

## STEP278L

- Extended `htdocs/overlays/_overlay-master-test.html` into a real Communication Bus test client.
- Overlay sends `hello`, `heartbeat` and `ack` messages using the Bus protocol.
- Overlay receives and displays Bus test events in mirror/test mode.
- Overlay shows debug information for client, event and ack state.
- No server, dashboard, database or production module migration changes.

## STEP278K

- Added `htdocs/public/tools/communication_ws_test_client.html`.
- Test client can connect to WebSocket, send hello, heartbeat and ack.
- Test client can create a Communication Bus test event via API.
- Test client displays Communication Status and registered client details.
- No server, dashboard, database or production module migration changes.

## STEP278J

- Updated startup logs for `communication_bus.js` and `audit_log.js`.
- Startup logs now include module version and build.
- Extended `docs/backend/MODULE_VERSIONING_STANDARD.md` with startup-log rule.
- No functional routing, dashboard, database or production migration changes.

## STEP278I

- Added `MODULE_META` to communication/audit modules and helpers.
- Added `moduleVersion`, `moduleBuild`, `coreName` and `coreVersion` to relevant status/test API responses.
- Added `docs/backend/MODULE_VERSIONING_STANDARD.md`.
- Documented mandatory versioning rule for all future modules.
- No functional routing, dashboard, database or production migration changes.
