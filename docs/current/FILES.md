# FILES – stream-control-center

Stand: 2026-06-15

## Aktueller Arbeitsstand

```text
Handoff für LC-CORE-POINTS-3A – Twitch Events als abonnierbare Bonus-Events
```

## Für diesen Doku-Stand geänderte Dateien

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3A.md
project-state/CURRENT_STATUS_LC_CORE_POINTS_3A_HANDOFF.md
```

## Relevante Backend-Dateien für den nächsten Chat

```text
backend/modules/twitch_events.js              zentrale Twitch-Event-/EventSub-/Bus-Schicht
backend/modules/loyalty.js                    Loyalty Core, Watch/Presence/Punkte/Event-Boni
backend/modules/communication_bus.js          Communication Bus Modul
backend/modules/helpers/helper_communication.js  In-process Subscriptions/EventBus Core
backend/modules/twitch_presence.js            Presence-/IRC-Quelle, bereits bestätigt für Watch
backend/modules/helpers/helper_settings.js    DB-basierte Settings
backend/core/database.js                      produktive DB-Anbindung
```

## Relevante bestätigte Routen

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/events
POST /api/loyalty/events/ingest
GET  /api/loyalty/ignored-users

GET  /api/twitch/events/status
GET  /api/twitch/events/catalog
GET  /api/twitch/events/stream-state
POST /api/twitch/events/stream-state/override
POST /api/twitch/events/stream-state/clear-override

GET  /api/twitch/presence/status
GET  /api/twitch/presence/start
GET  /api/twitch/presence/activity
GET  /api/twitch/presence/activity/active
```

## Geplante neue/erweiterte EventBus-Events

```text
twitch.follow
twitch.subscribe
twitch.resub
twitch.gift_sub
twitch.gift_bomb
twitch.cheer
twitch.raid
```

## Loyalty-EventBonus-Zieltypen

```text
follow
subscribe
resub
gift_sub
gift_bomb
cheer
raid
```

## Produktive DB-Regel

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite niemals ersetzen, löschen oder neu bauen.
Settings bei Bedarf nur gezielt über /api/loyalty/settings setzen.
Ignored-User nur gezielt über /api/loyalty/ignored-users ändern.
```
