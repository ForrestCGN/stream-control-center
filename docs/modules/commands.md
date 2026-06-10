# commands – BUS-TWITCH.7

Stand: 2026-06-10

## Zweck

Das Command-System kann `twitch.chat.message` ueber den Communication Bus abonnieren.
Der alte Direktaufruf aus `twitch_presence` bleibt aktiv.

## Runtime-Routen

```text
GET  /api/commands/bus-chat/status
GET  /api/commands/bus-chat/start
POST /api/commands/bus-chat/start
GET  /api/commands/bus-chat/stop
POST /api/commands/bus-chat/stop
```

## Regeln

```text
- Kein ACK fuer Chat.
- Kein Replay fuer Chat.
- Kein Queue-Zwang.
- Existing direct hook kept.
- Autostart nur mit COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true.
```

## Migration

Erst wenn Commands ueber EventSub/Bus stabil getestet sind, darf der alte Presence-Direktaufruf spaeter deaktiviert oder entfernt werden.
