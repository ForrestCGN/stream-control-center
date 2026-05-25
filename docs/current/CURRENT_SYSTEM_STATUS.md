# Current System Status

## STEP431

VIP Sound-Bus command play-test layer prepared.

VIP now has a read/test route that can send the VIP command-shaped payload to the Sound-System explicit play-test route:

- `/api/vip-sound/eventbus/sound-command/play-test`
- `/api/vip-sound-overlay/eventbus/sound-command/play-test`

This is still not the productive VIP migration. The productive VIP command path remains the existing legacy Sound-System API path.

Sound-System command play-test must remain explicitly called. Automatic Bus command consumption is not enabled.
