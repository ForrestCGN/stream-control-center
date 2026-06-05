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

## VIP30 aktueller Stand - STEP7.1

VIP30 0.7.2 behebt den lokalen Reward-Sync und kann die echte Twitch-Reward-ID lokal beim `vip30`-Reward hinterlegen. STEP7 Live-DryRun war erfolgreich: EventSub -> Channelpoints-Bus -> VIP30-Bridge -> Decision -> DB-Log.

Offen danach: echte Fulfill/Cancel/VIP-Grant-Schritte erst nach separater Freigabe.


## VIP30 STEP7.2
- Ensure-Route repariert: `created_at` wird beim UPDATE nicht mehr als ungenutzter SQL-Parameter übergeben.
- Aktueller Live-Dry-Run bleibt aktiv: Redemption wird beobachtet und entschieden, aber noch kein VIP zugeteilt.
