# Changelog

## VIP30 STEP7 EventSub Live-Dry-Run Observe

- `backend/modules/vip30.js` auf Version 0.7.0 gehoben.
- Build auf `step7-eventsub-live-dryrun-observe` gesetzt.
- Status auf `ready_step7_eventsub_live_dryrun_observe` gesetzt.
- RouteCount auf 17 erweitert.
- Neue Route: `GET /api/vip30/channelpoints/bridge/live-check`.
- Neue Route: `POST /api/vip30/channelpoints/bridge/reset-stats`.
- Bridge-Setting `bridge.liveEventDryRunObserveEnabled` ergänzt.
- EventSub-/Channelpoints-Live-Test bleibt Decision-only.
- Keine Twitch-Schreibaktion, kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel.

## VIP30-STEP6.1 Status-/RouteCount-Cleanup

- `backend/modules/vip30.js` Version 0.6.1.
- Status von `ready_step5_dryrun_redemption_decision` auf `ready_step6_channelpoints_decision_bridge` korrigiert.
- `routeCount` auf 15 passend zur Route-Liste korrigiert.
- Keine Funktionsänderung, keine Twitch-Schreibaktion, kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel.
