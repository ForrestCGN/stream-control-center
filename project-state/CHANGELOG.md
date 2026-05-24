# CHANGELOG – STEP277A_FIX7

## STEP277A_FIX7 – Clip-Shoutout Direct Playback

- `backend/modules/clip_shoutout.js`
  - Standard-Playback auf `direct` geändert.
  - Twitch-Clip-Playback-URL wird direkt ans Sound-System übergeben.
  - Bisheriger MP4-Download bleibt als optionaler Fallback für `clipPlaybackMode: "download"` erhalten.
  - Statusversion auf `6` / `STEP277A_FIX7` erhöht.

- `backend/modules/sound_system.js`
  - Direkte externe `http/https`-Medien über `mediaUrl`, `videoUrl`, `audioUrl` oder `file` werden akzeptiert.
  - Lokale Datei bleibt für normale Sound-Items weiterhin Standard.
  - Video-Items bleiben Overlay-only und laufen durch vorhandene Queue-/Bundle-Logik.

- Keine Funktionalität entfernt.
