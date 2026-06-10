# Modul: twitch_presence

Stand: 2026-06-10

## Aktuelle Version

```text
0.1.4 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
```

## Aufgabe

`twitch_presence` bleibt IRC/Presence-/Fallback-Modul. Der frühere direkte Command-Aufruf ist nicht entfernt, aber default deaktiviert.

## Direct Command Hook

```text
Direct Call:
twitch_presence → commands.handleChatMessage(...)

Default:
TWITCH_PRESENCE_COMMAND_DIRECT_HOOK_ENABLED=false
```

## Routen

```text
GET  /api/twitch/presence/command-direct/status
GET  /api/twitch/presence/command-direct/enable
POST /api/twitch/presence/command-direct/enable
GET  /api/twitch/presence/command-direct/disable
POST /api/twitch/presence/command-direct/disable
```

## Bestätigter Live-Zustand

```text
enabled=False
mode=disabled
```

## Hinweis

`twitch_presence` darf als Fallback genutzt werden, falls EventSub Chat ausfällt. Für den Normalbetrieb ist aber `twitch_events` der Standardweg.
