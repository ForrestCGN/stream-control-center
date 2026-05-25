# CURRENT STATUS – STEP436

VIP admin tests can now reach the real VIP trigger path with `forceAccess=true` for Guard/Fallback diagnostics.

The normal Twitch command path remains protected by the VIP/Mod role check. The bypass is limited to the admin/dashboard test execution path.

Productive VIP delivery still remains legacy `/api/sound/play` / `legacy_sound_system_api`.

`bus_enabled` remains selectable and visible for preparation/testing, but it is not productive yet. The Guard still blocks productive Bus activation and falls back to legacy.
