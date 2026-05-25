# CHANGELOG – STEP436

- Bumped `vip_sound_overlay.js` to version `1.8.19`.
- Changed feature marker to `vip_admin_test_guard_bypass`.
- Added controlled `forceAccess=true` support to the VIP admin/dashboard test path.
- Kept normal `/api/vip-sound/command` Twitch VIP/Mod protection unchanged.
- Allowed admin tests with `consumeDaily=false` to reach the real Guard/legacy Sound-System path without writing Daily-Usage.
- Added force-access diagnostic fields to accepted/admin test responses and `stats.lastRealFlowGuard`.
- Kept productive VIP flow unchanged as `legacy_sound_system_api`.
- Kept `bus_enabled` prepared only; productive Bus activation remains blocked.
