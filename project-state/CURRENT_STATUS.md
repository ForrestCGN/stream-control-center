# CURRENT STATUS – STEP434

VIP Bus mode Guard/Fallback preparation is active.

Runtime mode changes through `/eventbus/sound-command/mode` remain visible in `/eventbus/sound-command/status`. The new Guard/Fallback layer reports how the runtime mode would be handled.

Productive VIP flow still remains legacy `/api/sound/play` / `legacy_sound_system_api`.

`bus_enabled` is selectable for preparation/testing, but it is not productive: Guard/Fallback blocks productive Bus activation and falls back to legacy.
