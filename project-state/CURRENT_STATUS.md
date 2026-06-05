# Current Status

VIP30 steht auf STEP7: EventSub Live-Dry-Run Observe.

- Version `0.7.0`
- Build `step7-eventsub-live-dryrun-observe`
- Reward-Kosten: 40000 Kanalpunkte
- DB-Settings sind primäre Config
- Bridge hört auf `channelpoints.redemption / received`
- Bridge gibt echte/simulierte Channelpoints-Redemptions an VIP30-Decision weiter
- Neue Live-Dry-Run-Diagnose: `/api/vip30/channelpoints/bridge/live-check`
- Neue Runtime-Reset-Route: `/api/vip30/channelpoints/bridge/reset-stats`
- Keine Twitch-Schreibaktion in diesem STEP
- Kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel
