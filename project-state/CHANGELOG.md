# CHANGELOG

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
