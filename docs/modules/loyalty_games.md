# Loyalty Games – Stand STEP217 / LWG-5.9

## Aktueller Stand

```text
loyalty_games.js 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
gamble vorbereitet, aber weiterhin deaktiviert
```

## Wichtig

STEP217 aktiviert ausschließlich Admin-Points-Commands:

```text
!givepoints
!setpoint
```

Nicht aktiviert werden:

```text
!gamble
Roulette
Duell
Raffle
```

Nächster sinnvoller Games-Step bleibt ein separater Freigabe-/Runtime-Test für `!gamble`.
