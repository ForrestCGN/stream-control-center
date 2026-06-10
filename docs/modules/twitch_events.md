# Modul: twitch_events

Stand: BUS-TWITCH.10

`twitch_events` ist die zentrale Twitch-Event-Schicht. Chat kann direkt per Twitch EventSub `channel.chat.message` empfangen und als `twitch.chat.message` auf den Communication Bus gelegt werden.

## BUS-TWITCH.10

- EventSub-Chat-Autostart ist standardmaessig aktiv.
- Deaktivierung per `TWITCH_EVENTS_EVENTSUB_CHAT_AUTOSTART=false` moeglich.
- Neue Restart-Route fuer kontrollierten Neustart der Chat-EventSub-Verbindung.
- Duplikat-Schutz bleibt aktiv.
- `twitch.js`, Presence-Fallback und bestehende Flows bleiben erhalten.

## Wichtige Routen

```text
/api/twitch/events/status
/api/twitch/events/catalog
/api/twitch/events/eventsub/chat/status
/api/twitch/events/eventsub/chat/start
/api/twitch/events/eventsub/chat/stop
/api/twitch/events/eventsub/chat/restart
```
