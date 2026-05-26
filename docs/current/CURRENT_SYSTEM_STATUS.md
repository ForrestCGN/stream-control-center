# CURRENT_SYSTEM_STATUS

## Clip-Shoutout / VSO

Aktueller Stand: STEP465

- `clip_shoutout.js` Runtime-Version: `0.2.8`
- Test-Command: `!vso`
- Display-Queue: aktiv
- Display-Cooldown: 120 Sekunden nach Anzeige-Ende
- Event-Bus: `shoutout.system`
- Direkter Chat-Command-Bypass: aktiv
- Chatmeldungen fuer offizielle Twitch-Shoutouts: stummgeschaltet
- Timeline-Route: `GET /api/clip-shoutout/timeline`
- Streamtag-Limit: aktiv, Override per `--force`
- Official-Live-Gate: aktiv

## STEP465

Der offizielle Twitch-`/shoutout` wird nicht mehr gegen Twitch gesendet, wenn der Kanal laut lokaler Live-State-Dateien offline ist. Stattdessen bleibt der Eintrag in der offiziellen Queue im Status `waiting`, bekommt `last_error=waiting_stream_live_offline` und wird spaeter erneut geprueft.

Display-/Video-Shoutouts bleiben auch offline testbar.
