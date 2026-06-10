# Modul: twitch_events

Stand: 2026-06-10

## Aktuelle Version

```text
0.1.6 / BUS_TWITCH_10_EVENTSUB_CHAT_AUTOSTART
```

## Aufgabe

`twitch_events` ist die zentrale Twitch-Event-Schicht. Es normalisiert Twitch-Ereignisse und veröffentlicht sie über den Communication Bus.

## Aktiver Standard für Chat

```text
EventSub channel.chat.message
→ twitch_events
→ communication_bus channel=twitch.chat action=message
```

## Wichtige Routen

```text
GET /api/twitch/events/status
GET /api/twitch/events/catalog
GET /api/twitch/events/eventsub/chat/status
POST /api/twitch/events/eventsub/chat/start
POST /api/twitch/events/eventsub/chat/stop
POST /api/twitch/events/eventsub/chat/restart
GET /api/twitch/events/eventsub/ownership
GET /api/twitch/events/eventsub/chat-readiness
GET /api/twitch/events/eventsub/live-readiness
```

## Bestätigter Live-Zustand

```text
enabled=True
autostart=True
active=True
connecting=False
websocket.readyState=OPEN
subscription.type=channel.chat.message
subscription.status=enabled
lastError leer
```

## Regeln

```text
Twitch-Events bleiben leichtgewichtig.
Kein ACK/Replay/Queue als Default.
Altlogik erst entfernen, wenn jeweilige Subscriber produktiv getestet sind.
```
