# Current System Status – STEP433

STEP433 fixes the VIP bus-mode runtime status handling.

## Changed
- `backend/modules/vip_sound_overlay.js`
- VIP module version: `1.8.16`
- Feature: `vip_sound_bus_mode_runtime_status`
- Runtime VIP bus mode now remains visible in status responses after using the mode route.
- `/api/vip-sound/eventbus/sound-command/mode?mode=shadow` keeps `vipBusMode: shadow` in `/api/vip-sound/eventbus/sound-command/status`.
- `/api/vip-sound/eventbus/sound-command/mode?mode=play_test` keeps `vipBusMode: play_test` in `/api/vip-sound/eventbus/sound-command/status`.
- Normal VIP `/status` also exposes `vipBusMode` and `soundBusCommand` for diagnostics.

## Safety
- Effective productive VIP flow remains `legacy_sound_system_api`.
- No productive VIP Bus switch is enabled in this step.
- `bus_enabled` remains prepared only and is not used as productive flow.
- No Sound queue or productive audio is touched by the mode route.
- No Daily-Usage write is touched by the mode route.
- No DB schema migration.

## Reset behavior
`/api/vip-sound/eventbus/sound-command/reset` resets diagnostic counters and resets runtime `vipBusMode` back to `legacy`.
