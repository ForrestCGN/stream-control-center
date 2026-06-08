# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4I Giveaway Draw Without Wheel

### Neu

- Tabelle `loyalty_giveaway_winners`.
- API `POST /api/loyalty/giveaways/:giveawayUid/draw`.
- API `GET /api/loyalty/giveaways/:giveawayUid/winners`.
- Dashboard-Button Gewinner ziehen.
- Gewinneranzeige mit Fairnessdaten.

### Fairness

- Ziehung per `crypto.randomInt`.
- Keine API zum Setzen eines Gewinners.
