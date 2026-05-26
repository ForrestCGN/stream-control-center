# NEXT_STEPS

1. STEP465-ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node --check backend\modules\clip_shoutout.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Backend neu starten.
5. Status prüfen: `/api/clip-shoutout/status` und `/api/clip-shoutout/queue`.
6. Offline-Test mit `!vso @urlug`: Display darf laufen, offizieller Twitch-Shoutout muss `waiting_stream_live_offline` bleiben.
7. Beim nächsten echten Live-Test prüfen, ob offizielle Shoutouts nach Display-Ende wieder gesendet werden.
