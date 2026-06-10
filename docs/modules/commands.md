# Modul: commands

Stand: 2026-06-10 – BUS-TWITCH.8

## Rolle

`commands` verarbeitet Chat-Commands. Seit BUS-TWITCH.7 kann das Modul `twitch.chat.message` vom Communication Bus abonnieren. Seit BUS-TWITCH.8 kann der alte Presence-Direktweg separat deaktiviert werden.

## Wichtige Routen

```text
GET/POST /api/commands/bus-chat/start
GET/POST /api/commands/bus-chat/stop
GET      /api/commands/bus-chat/status
```

## Source-Switch-Regel

```text
Produktiv soll nur eine Command-Quelle aktiv sein:
- Direktweg: twitch_presence -> commands.handleChatMessage
- Busweg: twitch_events -> communication_bus -> commands subscriber
```

Der Direktweg wird in `twitch_presence` gesteuert:

```text
GET/POST /api/twitch/presence/command-direct/disable
GET/POST /api/twitch/presence/command-direct/enable
GET      /api/twitch/presence/command-direct/status
```
