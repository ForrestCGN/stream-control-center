# Changelog

## VIP30 STEP6

- `backend/modules/vip30.js` auf Version 0.6.0 gehoben.
- Bridge-Config in DB-Settings vorbereitet.
- Bridge-Status in `/api/vip30/status` ergänzt.
- Neue additive Datei intern in `backend/modules/vip30.js` erstellt.
- Bridge subscribt auf `channelpoints.redemption / received`.
- Bridge ruft VIP30-Decision im decision-only Modus auf.
- Keine Twitch-Schreibaktion, kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel.
