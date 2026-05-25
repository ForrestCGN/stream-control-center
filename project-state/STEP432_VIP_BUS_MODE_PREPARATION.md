# STEP432 – VIP Bus Mode Preparation

## Goal
Prepare VIP for a controlled bus-mode migration.

## Modes
- `legacy`: productive VIP flow remains `/api/sound/play`.
- `shadow`: productive VIP flow remains legacy, while VIP sound wishes can be mirrored as bus commands.
- `play_test`: only explicit test routes may execute through Sound command play-test.
- `bus_enabled`: reserved/prepared for later productive bus flow.

## Routes
- `GET /api/vip-sound/eventbus/sound-command/mode`
- `GET /api/vip-sound/eventbus/sound-command/mode?mode=shadow`
- `POST /api/vip-sound/eventbus/sound-command/mode`

Aliases are available under `/api/vip-sound-overlay/...`.

## Safety
STEP432 does not change the productive VIP entry point.
