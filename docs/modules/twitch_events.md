# twitch_events

Stand: 2026-06-10

## Zweck

`twitch_events` ist die zentrale Twitch-Event-Schicht vor dem Communication-Bus.

Aufgaben:

```text
- Twitch-Input-Events normalisieren
- Bus-Events erzeugen
- Event-Catalog und Diagnostics bereitstellen
- EventSub Chat als Standardweg bereitstellen
- Channelpoints-Events für Module zentral verfügbar machen
```

## Bestätigte Version / letzter relevanter Stand

```text
twitch_events 0.1.7
BUS_TWITCH_14_CHANNELPOINTS_PARALLEL_EMIT
```

Hinweis: Die spätere Channelpoints-Reliability steckt in `twitch.js` als Parallel-Tap-Fix, nicht in der `twitch_events`-Versionsnummer.

## Wichtige Routen

```text
GET /api/twitch/events/status
GET /api/twitch/events/catalog
GET /api/twitch/events/eventsub/chat/status
GET /api/twitch/events/eventsub/chat/start
GET /api/twitch/events/eventsub/chat/stop
GET /api/twitch/events/eventsub/chat/restart
```

## Aktive Events

```text
twitch.chat.message
twitch.channelpoints.redemption.created
```

## Chat-Standardweg

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Bestätigt:

```text
EventSub Chat active=True
autostart=True
websocket.readyState=OPEN
```

## Channelpoints-Standardweg

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

## Event-Policy

Für Twitch-Input-Events gilt aktuell:

```text
requireAck=false
replayable=false
ttlMs=0
queued=false
```

## Diagnostik

Event-Counter:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s.diagnostics.counts.byEvent.'twitch.channelpoints.redemption.created'
```
