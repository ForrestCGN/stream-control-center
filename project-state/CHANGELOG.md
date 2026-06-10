# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.1

### Neu

```text
backend/modules/twitch_events.js
docs/modules/twitch_events.md
docs/current/CURRENT_CHAT_HANDOFF_BUS_TWITCH_1.md
```

### Ziel

```text
Zentrale Twitch-Event-Schicht vorbereitet.
Twitch-Events koennen spaeter ueber den Communication Bus abonniert werden.
```

### Enthalten

```text
- MODULE_META
- Version 0.1.0
- Build BUS_TWITCH_1
- Bus-Registrierung
- Heartbeat
- Statusroute /api/twitch/events/status
- Katalogroute /api/twitch/events/catalog
- Event-Katalog fuer Chat, EventSub, Stream, Support, Channelpoints, VIP, HypeTrain, Shoutout
- ACK/Replay vorbereitet, aber default deaktiviert
- Handler-Exports fuer spaetere Quellen
```

### Nicht geaendert

```text
Keine bestehenden Twitch-Flows entfernt.
Keine Aenderung an twitch.js.
Keine Aenderung an twitch_presence.js.
Keine Aenderung an twitch_chat_overlay.js.
Keine Aenderung an VIP30.
Keine Aenderung an Loyalty/Giveaways.
Keine SQLite-Aenderung.
Keine Queue-Logik.
```

## 2026-06-09 – AUTOSHOUT-HOTFIX.1

### Geändert

```text
backend/modules/clip_shoutout.js
```

### Behoben

```text
autoRawMessage is not defined
```

### Ergebnis

```text
AutoShout verarbeitet Chataktivität wieder.
2-Nachrichten-Regel funktioniert.
!lurk funktioniert als erste Nachricht.
lastError bleibt leer.
```

### Nicht geändert

```text
Keine Queue-Logik.
Keine OfficialQueue-Logik.
Keine Twitch-Presence-Logik.
Keine Streamer.bot-Logik.
Keine DB-Datei ersetzt.
```
