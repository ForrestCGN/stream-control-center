# CHANGELOG

## STEP278L

- Updated `htdocs/overlays/_overlay-master-test.html` to act as a real Communication Bus test client.
- Overlay now sends Bus `hello`, `heartbeat` and `ack` messages using the current Communication Bus protocol.
- Overlay can receive and mirror Bus test events from `/api/communication/test`.
- Overlay debug panel now shows client, event and ACK state.
- Updated Communication Bus documentation and project-state files.
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
