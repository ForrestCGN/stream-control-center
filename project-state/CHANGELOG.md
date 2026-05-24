# CHANGELOG

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

## STEP278G

- Added `backend/modules/communication_bus.js`.
- Added Communication Bus status/test/ack/issue/reset API routes.
- Test events are preview/test only and do not migrate production routing.
- No dashboard page, database migration, OBS change or production module integration was added.

## STEP278F

- Extended `helper_communication.js` with optional Security Context and Audit Logger hooks.
- Added optional audit counters/status fields.
- Added `security` and `audit` sections to `config/communication_bus.json`.
- Audit is disabled by default.
- No production module, API route, dashboard page or database schema was changed.

## STEP278E

- Added `backend/modules/audit_log.js`.
- Added Audit API status/recent/test/clear-memory routes.
- Audit logs remain in memory by default.
- Uses `helper_audit_log.js` and `helper_security_context.js`.
- No dashboard page, database migration or production module integration was added.
