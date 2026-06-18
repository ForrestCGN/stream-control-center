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

---

## Stand EVS52.9 – IRC als Quelle fuer twitch_events

Stand: 2026-06-18

### Aktuelle Version

```text
0.1.6 / EVS52_9_TWITCH_EVENTS_CHAT_SOURCE
```

### Aufgabe

`twitch_presence` empfaengt weiterhin IRC/PRIVMSG und gibt Chatmessages zentral an `twitch_events.handleIrcEvent()` weiter. `stream_events` wird nicht mehr direkt aus `twitch_presence` aufgerufen.

### Normaler Chatweg

```text
twitch_presence.emitTwitchChatEvent(parsed)
→ twitch_events.handleIrcEvent(parsed)
→ twitch_events publishTwitchEvent("twitch.chat.message")
→ communication_bus
→ interessierte Subscriber, u. a. stream_events
```

### Aufgeraeumt

Der EVS52.7-Direktaufruf nach `stream_events.handleTwitchPresenceIrcChat()` wurde entfernt. Dadurch gibt es keinen zweiten parallelen Chatpfad mehr fuer das Event-System.

Der separate Command-Direct-Hook bleibt als bestehender Legacy-/Fallback-Mechanismus steuerbar, ist aber nicht Teil der Sound/Satz-Chatquelle.
