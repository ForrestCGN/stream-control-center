# STEP431 VIP Sound Command Play-Test

Status: prepared

## Scope

VIP can now send its command-shaped sound payload to the Sound-System explicit play-test route.

## Changed files

- backend/modules/vip_sound_overlay.js

## Runtime

- vip_sound_overlay version: 1.8.14
- feature: vip_sound_to_sound_bus_command_play_test_check
- new route: /api/vip-sound/eventbus/sound-command/play-test
- alias route: /api/vip-sound-overlay/eventbus/sound-command/play-test

## Safety

- Productive VIP command flow remains legacy_sound_system_api.
- Sound-System audio is only touched through the explicit play-test route.
- No automatic Bus command consumption is enabled by this step.
- Alert flow is unchanged.
- No DB migration.
