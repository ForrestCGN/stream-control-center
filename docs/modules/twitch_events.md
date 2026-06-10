# Modul: twitch_events

Stand: 2026-06-10 – BUS-TWITCH.8 Kontext

`twitch_events` ist die zentrale Twitch-Event-Schicht. EventSub Chat `channel.chat.message` wurde in BUS-TWITCH.6 aktiv getestet und liefert `twitch.chat.message` an den Communication Bus.

BUS-TWITCH.8 ändert `twitch_events` nicht direkt, sondern schaltet die Command-Verbraucherseite steuerbar.
