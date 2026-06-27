# CURRENT CHAT HANDOFF – BUS-TWITCH.11

Stand: 2026-06-10

## Kurzfassung

Der Twitch-Chat-/Command-Weg wurde erfolgreich auf EventSub + Communication Bus umgestellt.

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Der alte Presence/IRC-Direktweg bleibt als Fallback verfügbar, ist aber default deaktiviert.

## Bestätigte Zustände

```text
twitch_events 0.1.6: EventSub Chat Autostart aktiv, WebSocket OPEN, Subscription enabled.
commands 0.2.1: Bus-Subscriber Autostart aktiv.
twitch_presence 0.1.4: Direct Command Hook default disabled.
```

## Wichtige Testausgaben aus Live-Test

```text
eventSubChat.enabled=True
eventSubChat.autostart=True
eventSubChat.active=True
eventSubChat.connecting=False
websocket.readyState=OPEN
subscription.type=channel.chat.message
subscription.status=enabled
commands.busChat.enabled=True
commands.busChat.active=True
commands.busChat.autostart=True
presence.commandDirectHook.enabled=False
```

## Nächster Chat / nächster Step

Empfohlen: BUS-TWITCH.12 – Modul-Migrationsplan für Twitch-Events.

Nicht sofort alte Logik entfernen. Erst Bestandsaufnahme:

```text
Welche Module bekommen Twitch-Daten bisher direkt aus twitch.js/twitch_presence?
Welche Events braucht welches Modul?
Welche Subscriber werden parallel ergänzt?
Welche alten Direktwege werden erst nach Test deaktiviert?
```
