# CHANGELOG

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

## STEP278D

- Added `backend/modules/helpers/helper_audit_log.js`.
- Added `config/audit_log.json`.
- Added Audit Log helper documentation.
- Prepared central audit entries, memory buffer, retention, optional file sink and recent-log filtering.
- Uses `helper_security_context.js` for context snapshots and sensitive value masking.
- No production module, API route, dashboard page or database schema was changed.

## STEP278C

- Added `backend/modules/helpers/helper_security_context.js`.
- Added `config/security_context.json`.
- Added Security Context helper documentation.
- Prepared normalized actor/source/trust contexts.
- Prepared role and permission helper functions.
- Prepared sensitive value masking and audit snapshots.
- No existing production route or module was changed.

## STEP278B

- Added `backend/modules/helpers/helper_communication.js`.
- Added `config/communication_bus.json`.
- Added Communication Bus helper documentation.
- Prepared Client Registry, Heartbeat Tracking, Ack Tracking, Replay Memory and Issue Throttling.
- No existing production module was migrated or changed.

## STEP277A_FIX10

- Added `GET /api/clip-shoutout/clips?target=<login>`.
- Exposes matching clip list, clip search debug data and repeat-guard selection preview.
- Does not queue playback, download MP4 files or mutate recent clip memory.
