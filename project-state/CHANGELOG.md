# CHANGELOG – STEP434

- Added VIP bus-mode Guard/Fallback preparation.
- Bumped `vip_sound_overlay.js` to version `1.8.17`.
- Changed feature marker to `vip_sound_bus_mode_guard_fallback_preparation`.
- Added `/eventbus/sound-command/guard` for non-destructive Guard/Fallback inspection.
- Exposed `busModeGuard`, `guardActive`, `fallbackVipBusMode`, `fallbackReason`, `productiveBusAllowed`, and `productiveBusBlocked` in sound-command status.
- Kept `bus_enabled` prepared only; productive Bus activation is blocked by Guard/Fallback.
- Kept productive VIP flow unchanged as `legacy_sound_system_api`.
