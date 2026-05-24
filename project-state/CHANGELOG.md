# CHANGELOG

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

## STEP278H

- Added minimal WebSocket module dispatcher to `backend/server.js`.
- Extended `backend/modules/communication_bus.js` with `handleWsMessage()`.
- Added WS handling for `hello`, `heartbeat`, `ack` and `bus_ack`.
- Unknown WS messages are ignored and existing broadcast flows remain unchanged.
- No alert/sound/TTS/VIP migration, dashboard page, database migration or OBS change was added.
