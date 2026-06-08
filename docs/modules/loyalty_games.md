# Loyalty Games Modul

Stand: 2026-06-08  
STEP: LWG-4J

## Neu fuer Giveaways

`loyalty_games` exportiert intern:

```text
_private.startWheelSpin(input)
```

Damit kann `loyalty_giveaways` einen normalen Wheel-Spin starten, ohne eine neue Rad-Logik zu bauen.
