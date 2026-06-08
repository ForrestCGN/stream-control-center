# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4I

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-4I – Giveaway Gewinnerziehung ohne Rad
```

## Neu

```text
loyalty_giveaway_winners
POST /api/loyalty/giveaways/:giveawayUid/draw
GET  /api/loyalty/giveaways/:giveawayUid/winners
```

## Fairness

Gewinner werden backendseitig per `crypto.randomInt` aus aktiven Entries/Ticketgewichten gezogen.

Keine API setzt einen Gewinner direkt.
