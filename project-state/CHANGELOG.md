# CHANGELOG – STEP437

- Bumped `vip_sound_overlay.js` to version `1.8.20`.
- Changed feature marker to `vip_admin_test_guard_snapshot_fix`.
- Fixed the admin-test Guard snapshot crash: `Cannot access 'snapshot' before initialization`.
- Kept `forceAccess=true` limited to the admin/dashboard test path.
- Kept normal `/api/vip-sound/command` Twitch VIP/Mod protection unchanged.
- Kept productive VIP flow unchanged as `legacy_sound_system_api`.
- Kept `bus_enabled` prepared only; productive Bus activation remains blocked.
