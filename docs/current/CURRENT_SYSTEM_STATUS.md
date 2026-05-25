# Current System Status - STEP426

## Sound EventBus Command Test Layer

STEP426 adds a read-only/test-only Sound EventBus command layer.

- Sound-System version: `0.1.15`
- Status EventBus capability: `sound.event_output`
- Command test capability: `sound.command_input`
- New routes under `/api/sound/eventbus/command/*`
- Productive sound flow remains `/api/sound/play`
- No queue/audio/legacy flow is changed by the command test routes.

## Safety

- `commandConsumerEnabled: false`
- `testOnly: true`
- Queue, audio, overlay, VIP and Alert productive flows remain unchanged.
