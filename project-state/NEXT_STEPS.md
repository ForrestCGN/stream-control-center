# NEXT_STEPS – nach STEP277A_FIX7

1. Backend neu starten.
2. `/api/clip-shoutout/status` prüfen.
3. API-Test mit `target=bynexl` ausführen.
4. `/api/sound/status` prüfen:
   - `failed` bleibt `0`
   - `lastEvent` endet auf `audio_ended`
   - bei laufendem Item ist `mediaUrl`/`videoUrl` gesetzt
   - `file` ist bei Direct Playback leer
5. Danach Chat-Test mit `!vso @bynexl`, wenn Twitch Presence aktiv ist.
6. Optional später: alte lokale Dateien unter `htdocs/assets/sounds/clip_shoutout` manuell bereinigen oder eine separate Admin-Cleanup-Funktion planen.
