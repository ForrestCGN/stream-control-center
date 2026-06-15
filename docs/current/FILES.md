# FILES – stream-control-center

Stand: 2026-06-15

## Aktueller Arbeitsstand

```text
LC-CORE-POINTS-2C – Twitch Presence / aktive User bestätigt
```

## Für diesen Doku-Stand geänderte Dateien

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/STEP_LC_CORE_POINTS_2ABC_CONFIRMED.md
project-state/CURRENT_STATUS_LC_CORE_POINTS_2ABC_CONFIRMED.md
```

## Relevante Backend-Dateien

```text
backend/modules/loyalty.js              Loyalty Core, Watch/Presence/Punkte/Event-Boni
backend/modules/twitch_events.js        zentrale Stream-State-/Bus-Schicht
backend/modules/twitch_presence.js      Presence-/Activity-Quelle für Watch-Runner
backend/modules/communication_bus.js    Communication-Bus API
backend/modules/helpers/helper_communication.js  In-process Subscriptions/EventBus Core
backend/modules/helpers/helper_settings.js       DB-basierte Settings
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
GET  /api/loyalty/runner/status
GET  /api/loyalty/runner/run-once
POST /api/loyalty/runner/run-once
GET  /api/loyalty/transactions
GET  /api/loyalty/events
POST /api/loyalty/events/ingest
GET  /api/loyalty/ignored-users

GET  /api/twitch/events/stream-state
POST /api/twitch/events/stream-state/override
POST /api/twitch/events/stream-state/clear-override

GET  /api/twitch/presence/status
GET  /api/twitch/presence/start
GET  /api/twitch/presence/activity
GET  /api/twitch/presence/activity/active
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
Ignored-User nur gezielt über /api/loyalty/ignored-users ändern.
```
