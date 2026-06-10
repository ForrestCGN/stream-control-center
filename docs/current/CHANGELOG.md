# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.3

### Geaendert

```text
backend/modules/twitch_events.js
docs/modules/twitch_events.md
docs/modules/README.md
docs/current/*
project-state/*
```

### Ergaenzt

```text
EventSub Ownership Preparation in twitch_events.
Statusroute /api/twitch/events/eventsub/ownership.
channel.chat.message als geplante EventSub-Quelle dokumentiert.
channel.chat.message Normalisierung vorbereitet, ohne produktive Ownership zu aktivieren.
```

### Nicht geaendert

```text
twitch.js
EventSub-Verbindung in twitch.js
bestehende Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows
Command-Direktaufruf
SQLite/DB
```
