# CHANGELOG – STEP439

- Added admin-test support for applying a diagnostic VIP bus mode directly in `/api/vip-sound/test`.
- Supported mode fields: `vipBusMode`, `testVipBusMode`, `busMode`, `mode`.
- Added admin-test mode diagnostics to the real-flow Guard snapshot.
- Kept `bus_enabled` guarded and non-productive.
- Kept productive VIP delivery on `legacy_sound_system_api`.
- Kept the normal Twitch command role guard unchanged.
