# Changelog

## VIP30-STEP2 - Twitch Capability Check

- `backend/modules/vip30.js` auf Version `0.2.0` gehoben.
- Neue Route `/api/vip30/twitch/capability` ergänzt.
- Neue Route `/api/vip30/twitch/scopes` ergänzt.
- Twitch-Capability-Check gegen `/api/twitch/auth/validate` ergänzt.
- Prüfung auf `channel:manage:redemptions` und `channel:manage:vips` ergänzt.
- Broadcaster/User-Match-Prüfung vorbereitet.
- Bus-Event `vip30.twitch` für Capability ready/missing ergänzt.
- Keine Twitch-Schreibaktion eingeführt.
- Keine VIP-Vergabe eingeführt.
- Kein Redemption-Fulfill/Cancel eingeführt.
