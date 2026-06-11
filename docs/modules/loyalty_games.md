# Loyalty Games – Stand STEP218 / LWG-5.10

## Aktueller Stand

```text
loyalty_games.js 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
gamble vorbereitet, aber weiterhin deaktiviert
```

## Nicht verändert durch STEP218

STEP218 ist nur Doku/Handoff. Es aktiviert keine Spiele.

Nicht aktiv:

```text
!gamble
!roulette
!duell
!raffle
```

## Nächster geplanter Bereich

```text
STEP219 / LWG-6.0 – Gamble-Freigabeplanung und kontrollierter Runtime-/Chat-Test
```

Für Gamble bleibt verbindlich:

```text
serverseitiger Zufall
crypto.randomInt
keine Pattern-/Date-/UserID-Seeds
klare Limits/Cooldowns
Punkte-Safety über available balance / spendPointsSafely
```
