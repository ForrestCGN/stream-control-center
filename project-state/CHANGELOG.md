# CHANGELOG

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
