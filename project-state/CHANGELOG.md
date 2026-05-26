# CHANGELOG

## STEP465_SHOUTOUT_OFFICIAL_LIVE_GATE

- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.8` erhöht.
- Official-Live-Gate ergänzt.
- Offizielle Twitch-`/shoutout`-Queue prüft vor dem Senden lokale Live-State-Dateien.
- Wenn der Kanal offline ist, wird kein Twitch-API-Shoutout versucht.
- Offline-Einträge bleiben in `waiting` und erhalten `last_error=waiting_stream_live_offline`.
- Retry-Zeit für Offline-/Live-Wartefälle auf mindestens 120 Sekunden gesetzt.
- Status der offiziellen Queue enthält `liveGate`-Diagnose.
- Display-Queue, `!vso`, Streamtag-Limit und Chat-Testmeldungen bleiben unverändert.
