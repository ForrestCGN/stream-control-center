# twitch_events – BUS-TWITCH.6

Stand: 2026-06-10

## Zweck

Zentrale Twitch-Event-Schicht. BUS-TWITCH.6 ergaenzt den direkten EventSub-Chat-Start fuer `channel.chat.message`.

## Routen

```text
GET  /api/twitch/events/eventsub/chat/status
POST /api/twitch/events/eventsub/chat/start
GET  /api/twitch/events/eventsub/chat/start
POST /api/twitch/events/eventsub/chat/stop
GET  /api/twitch/events/eventsub/chat/stop
```

## Regeln

- kein Autostart ausser `TWITCH_EVENTS_EVENTSUB_CHAT_AUTOSTART=true`
- keine Altlogik entfernt
- Duplikat-Schutz fuer IRC/EventSub parallel aktiv


## STEP BUS-TWITCH.7 – Commands Subscriber vorbereitet

```text
commands kann twitch.chat.message ueber den Communication Bus abonnieren.
Der bestehende twitch_presence -> commands.handleChatMessage Direktaufruf bleibt aktiv.
Subscriber ist per Runtime-Route start/stop steuerbar; Autostart nur per COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true.
Keine bestehende Funktionalitaet entfernt.
```
