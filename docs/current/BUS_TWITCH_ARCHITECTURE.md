# BUS-TWITCH Architekturstand

Stand: 2026-06-10

## Zielarchitektur

```text
Twitch EventSub / Twitch APIs
→ twitch_events als zentrale Event-Schicht
→ communication_bus
→ abonnierende Module
```

## Aktuell vollständig umgesetzt für Chat/Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

## Event-Grundregel

Twitch-Events sind Eingangssignale.

```text
Default:
requireAck=false
replayable=false
ttlMs=0
queued=false
```

ACK/Replay bleiben vorbereitet, werden aber nicht standardmäßig für Twitch-Events genutzt.

## Abgrenzung zu Systemaktionen

Twitch-Events sagen:

```text
Twitch hat X gemeldet.
```

Systemaktionen sagen:

```text
Modul Y soll Aktion Z ausführen.
```

Für koordinierte Aktionen wie Alert + Sound + Overlay sollen später eigene Lifecycle-/Result-Events genutzt werden, z. B.:

```text
alert.session.requested
alert.session.started
alert.sound.started
alert.overlay.started
alert.session.finished
alert.session.failed
```

## Fallback

```text
twitch_presence / IRC → commands.handleChatMessage(...)
```

Bleibt vorhanden und per Route aktivierbar, ist aber default aus.
