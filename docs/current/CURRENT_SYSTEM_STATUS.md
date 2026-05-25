# Current System Status – STEP432

STEP432 prepares a configurable VIP bus mode switch.

## Changed
- `backend/modules/vip_sound_overlay.js`
- VIP module version: `1.8.15`
- New prepared modes: `legacy`, `shadow`, `play_test`, `bus_enabled`
- New route: `/api/vip-sound/eventbus/sound-command/mode`
- Alias route also works through `/api/vip-sound-overlay/eventbus/sound-command/mode`

## Safety
- Default mode remains `legacy`.
- Effective productive VIP flow remains `legacy_sound_system_api`.
- No productive VIP Bus switch is enabled in this step.
- No Sound queue or audio is touched by the mode route.
- No DB schema migration.
