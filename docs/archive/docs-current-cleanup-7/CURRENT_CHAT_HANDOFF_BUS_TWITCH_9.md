# CURRENT CHAT HANDOFF – BUS-TWITCH.9

Stand: 2026-06-10

## Aktueller Stand

BUS-TWITCH.9 setzt EventSub/Bus als Default-Command-Quelle.

## Technisch

```text
commands 0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch_presence 0.1.4 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
```

## Erwartung nach Neustart

```text
commands busChat autostart=true und active=true
twitch_presence commandDirectHook default=false
```

## Regel

Keine Funktionalität entfernen. Der alte Presence-Direktweg bleibt per Route aktivierbar.
