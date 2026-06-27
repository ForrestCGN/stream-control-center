# CURRENT CHAT HANDOFF – BUS-TWITCH.12

Stand: 2026-06-10

## Bestätigter Stand

```text
BUS-TWITCH.12 – Modul-Migrationsplan für Twitch-Events erstellt.
```

## Produktiver Standardweg Chat/Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Bestätigt:

```text
twitch_events 0.1.6 / BUS_TWITCH_10_EVENTSUB_CHAT_AUTOSTART
commands 0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch_presence 0.1.4 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch.js 0.1.3 / BUS_TWITCH_6_EVENTSUB_CHAT_ENABLE
```

## Wichtige Live-Bestätigung aus dem Chat

```text
EventSub Chat:
enabled=True
autostart=True
active=True
connecting=False
websocket.readyState=OPEN
subscription.type=channel.chat.message
subscription.status=enabled
lastError leer

Commands:
enabled=True
active=True
autostart=True
subscriptionId=commands:twitch.chat:message

Presence Direktweg:
enabled=False
mode=disabled
```

## Nächster sinnvoller Step

```text
BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping prüfen
```

Ziel:

```text
Channelpoint-Redemptions aus bestehendem twitch.js/VIP30-Fluss sauber erfassen,
Eventnamen und Result-Events final festlegen,
noch keine bestehende Logik entfernen.
```

## Nicht vergessen

```text
StepDone immer vor Live-Test.
Keine Funktionalität entfernen.
Erst parallel abonnieren und testen, dann alte Direktwege deaktivieren.
Twitch-Events: kein ACK/Replay/Queue als Standard.
Systemaktionen: eigene Request/Result-/Lifecycle-Events.
```
