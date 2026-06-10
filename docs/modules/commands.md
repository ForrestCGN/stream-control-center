# Modul: commands

Stand: 2026-06-10

## Aktuelle Version

```text
0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
```

## Aufgabe

`commands` verarbeitet Twitch-Chat-Commands. Der Standard-Eingang ist jetzt der Communication Bus.

## Aktiver Standard

```text
communication_bus subscription:
channel=twitch.chat
action=message
subscriptionId=commands:twitch.chat:message
```

## Routen

```text
GET  /api/commands/bus-chat/status
GET  /api/commands/bus-chat/start
POST /api/commands/bus-chat/start
GET  /api/commands/bus-chat/stop
POST /api/commands/bus-chat/stop
```

## Bestätigter Live-Zustand

```text
enabled=True
active=True
autostart=True
subscriptionId=commands:twitch.chat:message
lastError leer
```

## Fallback-Regel

Der alte `twitch_presence`-Direktweg bleibt vorhanden, ist aber default aus.
