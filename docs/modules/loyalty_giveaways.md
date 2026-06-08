# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4J

## Neu

Giveaways mit Rad koennen jetzt Wheel-Claims erzeugen.

## Tabelle

```text
loyalty_giveaway_wheel_permissions
```

## API

```text
GET  /api/loyalty/giveaways/:giveawayUid/wheel/permissions
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
```

## Ablauf

```text
draw -> winner waiting_for_wheel
permission pending
claim -> loyalty_games.startWheelSpin
winner wheel_completed
permission used
giveaway finished
```

## Fairness

Das Giveaway setzt kein Rad-Ergebnis.
Das Ergebnis kommt aus dem Wheel-System.
