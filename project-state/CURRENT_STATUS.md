# CURRENT_STATUS

## STEP465 aktiv

Clip-Shoutout / VSO steht auf Runtime-Version `0.2.8`.

Aktiv:

- Test-Command: `!vso`
- Display-Queue mit 120 Sekunden Abstand nach Anzeige-Ende
- reduzierte Chatmeldungen im Testmodus
- direkte Chat-Command-Verarbeitung fuer `!vso`
- Timeline-Route `/api/clip-shoutout/timeline`
- Streamtag-Limit: ein Zielkanal pro Streamtag, Override per `!vso @user --force`
- Official-Live-Gate: offizieller Twitch-`/shoutout` wird nur gesendet, wenn der Kanal live erkannt wird

Offline-Verhalten:

- Video-/Display-Shoutout kann getestet werden
- offizieller Twitch-`/shoutout` wird nicht gegen Twitch versucht
- offizielle Queue bleibt `waiting`
- `last_error` zeigt `waiting_stream_live_offline`
