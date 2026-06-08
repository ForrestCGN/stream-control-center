# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4H

## Neu

Giveaways unterstuetzen jetzt Teilnahmen/Tickets.

## Tabelle

```text
loyalty_giveaway_entries
```

## Regeln

```text
- Teilnahmen nur bei Giveaway-Status open.
- maxTicketsPerUser wird geprueft.
- subOnly wird vorbereitet/geprueft.
- firstTicketFree wird bei costDue beruecksichtigt.
- subscriberLuckMultiplier erhoeht ticketWeight.
- Punkte werden noch nicht gebucht.
```

## API

```text
GET  /api/loyalty/giveaways/:giveawayUid/entries
POST /api/loyalty/giveaways/:giveawayUid/entries
POST /api/loyalty/giveaways/:giveawayUid/entries/:entryUid/cancel
```

## Naechster Schritt

Gewinnerziehung ohne Rad per backendseitigem `crypto.randomInt`.
