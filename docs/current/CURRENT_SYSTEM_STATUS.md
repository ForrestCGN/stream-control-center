# Current System Status

Stand: STEP459_SHOUTOUT_DISPLAY_COOLDOWN_AFTER_FINISH

## Clip-Shoutout / SO-System

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.2`
- Command: konfigurierbar, Standard `so`
- Clip-Suche: Standard `90, 365, all_time`
- Shouti-Anzeigen laufen über eine Display-Queue.
- Display-Cooldown: 120 Sekunden, startet erst nach Ende der Shouti-Anzeige.
- Offizielle Twitch-Shoutouts laufen weiterhin über separate Queue mit Twitch-Cooldown.
- Event-Bus Channel: `shoutout.system`
