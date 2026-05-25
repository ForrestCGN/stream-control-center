# CHANGELOG – STEP433

- Fixed VIP bus-mode runtime status handling.
- Bumped `vip_sound_overlay.js` to version `1.8.16`.
- Changed feature marker to `vip_sound_bus_mode_runtime_status`.
- Runtime `vipBusMode` now remains stable in status after `mode?mode=shadow` and `mode?mode=play_test`.
- Added `vipBusMode` and `soundBusCommand` diagnostics to normal VIP `/status`.
- Documented reset behavior: sound-command reset returns runtime mode to `legacy`.
- Kept productive VIP flow unchanged as `legacy_sound_system_api`.
