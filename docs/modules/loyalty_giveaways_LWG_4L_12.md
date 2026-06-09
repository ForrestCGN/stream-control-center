# Loyalty Giveaways – LWG-4L.12

## Thema
Wheel-Permission Runtime Lookup Fix.

## Hintergrund
Der zentrale Command-Payload enthält bei normalem Chatbetrieb keine `giveawayUid`. Deshalb darf der `!wheel`-Runtime-Pfad nicht auf ein offenes Giveaway angewiesen sein.

## Umsetzung
Neue interne Funktion:

```text
getPendingWheelPermissionForUser(userLogin)
```

Diese sucht die erste pending Wheel-Permission des Users über `loyalty_giveaway_wheel_permissions` und verbindet sie mit dem zugehörigen Giveaway.

## Verhalten
- Ohne Permission: `error = wheel_no_permission`, `messageKey = wheel.no_permission`
- Mit Permission: `claimWheelSpin(permission.giveawayUid, ...)`

## Sicherheit
- Keine Aktivierung der zentralen Commands.
- Keine Punktebuchung.
- Kein Spin ohne pending Permission.
