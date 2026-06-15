# FILES – stream-control-center

Stand: 2026-06-15

## Aktueller Arbeitsstand

```text
LC-CORE-POINTS-1 – Sub-Tier-Watch-Werte und Resub-Bonus vorbereitet
```

## Geänderte Dateien

```text
backend/modules/loyalty.js
docs/current/STEP_LC_CORE_POINTS_1_SUB_TIER_REWARDS.md
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
```

## Relevante Backend-Dateien

```text
backend/modules/loyalty.js              Loyalty Core, Watch/Presence/Punkte/Event-Boni
backend/modules/twitch_events.js        zentrale Stream-State-/Bus-Schicht
backend/modules/twitch_presence.js      Presence-/Activity-Quelle für Watch-Runner
backend/modules/helpers/helper_settings.js  DB-basierte Settings, bestehende Werte werden nicht blind überschrieben
backend/core/database.js                produktive DB-Anbindung
```

## Relevante Routen

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/watch/heartbeat
POST /api/loyalty/watch/heartbeat
GET  /api/loyalty/watch/states
GET  /api/loyalty/presence/run-once
POST /api/loyalty/presence/run-once
GET  /api/loyalty/runner/run-once
POST /api/loyalty/runner/run-once
GET  /api/loyalty/transactions
GET  /api/loyalty/events
POST /api/loyalty/events/ingest
```

## Settings-Schlüssel

```text
watch.amount
watch.intervalMinutes
watch.subscriberMultiplier
watch.subscriberTierAmounts
bonuses.subscribe.tierAmounts
bonuses.resub.enabled
bonuses.resub.tierAmounts
bonuses.follow.amount
bonuses.cheer.amountPer100Bits
bonuses.tip.amountPerEuro
bonuses.raid.amount
```

## Produktive DB-Regel

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite niemals ersetzen, löschen oder neu bauen.
Settings bei Bedarf nur gezielt über /api/loyalty/settings setzen.
```
