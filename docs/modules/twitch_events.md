# Modul: twitch_events

Stand: BUS-TWITCH.9

## Rolle

`twitch_events` ist die zentrale Twitch-Event-Schicht. Chat kann per EventSub `channel.chat.message` empfangen und als `twitch.chat.message` über den Communication Bus veröffentlichen.

## Command-Migration

Seit BUS-TWITCH.9 ist EventSub/Bus als Default-Command-Quelle vorgesehen. `twitch_presence` bleibt als Fallback vorhanden.
