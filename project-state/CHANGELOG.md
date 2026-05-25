# CHANGELOG

## STEP426

- Updated `backend/modules/sound_system.js` to version `0.1.15`.
- Added Sound EventBus command test layer:
  - `/api/sound/eventbus/command/status`
  - `/api/sound/eventbus/command/test`
  - `/api/sound/eventbus/command/reset`
- Added `sound.command_input` capability metadata.
- Added safety flags showing queue/audio/legacy flows are untouched.
