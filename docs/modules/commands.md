# Modul: commands

Stand: BUS-TWITCH.9

## Version

```text
commands 0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
```

## Command-Quelle

```text
Primär: twitch_events EventSub channel.chat.message -> communication_bus -> commands
Fallback: twitch_presence -> commands.handleChatMessage, per Route aktivierbar
```

## Routen

```text
GET/POST /api/commands/bus-chat/start
GET/POST /api/commands/bus-chat/stop
GET      /api/commands/bus-chat/status
```

## Default

```text
COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true
```
