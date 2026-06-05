# Changelog

## VIP30-STEP5

- VIP30 auf 0.5.0 gehoben.
- Dry-Run-Decision-Flow ergänzt.
- Routen `/api/vip30/redeem/dry-run` und `/api/vip30/redeem/decision` ergänzt.
- Entscheidungen werden in `vip30_log` geschrieben.
- Bus-Events `vip30.redeem / dryrun.eligible|dryrun.blocked` ergänzt.
- Keine Live-Schreibaktion, kein VIP-Grant, kein Fulfill/Cancel.
