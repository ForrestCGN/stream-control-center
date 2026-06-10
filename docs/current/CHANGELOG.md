# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.4

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
EventSub Chat Readiness in twitch_events.
Statusroute /api/twitch/events/eventsub/chat-readiness.
Dokumentation fuer channel.chat.message Authorization/Condition.
Readiness-Checks fuer Token/Scopes/IDs.
Duplikat-Schutz-Strategie fuer spaeteren IRC/EventSub-Parallelbetrieb.
```

### Nicht geaendert

```text
twitch.js
twitch_presence.js
EventSub-Verbindung in twitch.js
bestehende Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows
Command-Direktaufruf
SQLite/DB
```
