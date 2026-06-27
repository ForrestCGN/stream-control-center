# CURRENT CHAT HANDOFF – LWG-4L.11

## Ziel
Wheel/Rad Diagnose schärfen.

## Änderung
In `backend/modules/loyalty_giveaways.js` wurde der Fehlercode für `!wheel` / `!rad` ohne offene Permission geändert:

- vorher: `giveaway_no_active`
- jetzt: `wheel_no_permission`

Der Chattext bleibt weiterhin über `wheel.no_permission`.

## Nicht geändert
- Keine dauerhafte Command-Aktivierung.
- `!ticket` bleibt im zentralen Command-System disabled.
- `!wheel` bleibt im zentralen Command-System disabled.
- Keine Punktebuchung.
- Kein Wheel-Spin ohne Permission.

## Test
`!wheel` und `!rad` temporär aktivieren, ohne offene Wheel-Permission ausführen, danach wieder deaktivieren. Erwartung: `dataOk=False`, `error=wheel_no_permission`.
