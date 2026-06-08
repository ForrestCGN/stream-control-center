# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4I

## Neu

Giveaways ohne Rad koennen jetzt Gewinner ziehen.

## Tabelle

```text
loyalty_giveaway_winners
```

## API

```text
GET  /api/loyalty/giveaways/:giveawayUid/winners
POST /api/loyalty/giveaways/:giveawayUid/draw
```

## Fairness

```text
Algorithmus: crypto.randomInt
Gewichtung: ticket_weight
```

Gespeichert werden:

```text
eligible_entries_count
total_ticket_weight
ticket_position
entry_uid
prize_uid
draw_algorithm
```

## Nicht enthalten

```text
Wheel-Giveaways
Punktebuchung
Reward-Ausfuehrung
```
