# Changelog

## VIP30 STEP6

- `backend/modules/vip30.js` auf Version 0.6.1 gehoben.
- Bridge-Config in DB-Settings vorbereitet.
- Bridge-Status in `/api/vip30/status` ergänzt.
- Neue additive Datei intern in `backend/modules/vip30.js` erstellt.
- Bridge subscribt auf `channelpoints.redemption / received`.
- Bridge ruft VIP30-Decision im decision-only Modus auf.
- Keine Twitch-Schreibaktion, kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel.


## VIP30-STEP6.1 Status-/RouteCount-Cleanup

- `backend/modules/vip30.js` Version 0.6.1.
- Status von `ready_step5_dryrun_redemption_decision` auf `ready_step6_channelpoints_decision_bridge` korrigiert.
- `routeCount` auf 15 passend zur Route-Liste korrigiert.
- Keine Funktionsänderung, keine Twitch-Schreibaktion, kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel.
