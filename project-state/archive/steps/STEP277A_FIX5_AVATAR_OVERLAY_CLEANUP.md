# STEP277A_FIX5 Avatar + Overlay Cleanup

## Ziel

Clip-Shoutout-Avatar zuverlässig anzeigen und das Sound-System-Overlay prüfen/bereinigen, ohne bestehende Funktionen zu entfernen.

## Änderungen

- `backend/modules/clip_shoutout.js`:
  - Avatar-Auflösung erweitert.
  - Nutzt vorhandene Twitch-Userdaten, lokale `/userinfo`-Route und Helix `/users` als Fallback.
  - Status-Version auf `4` / `STEP277A_FIX5` angehoben.

- `htdocs/overlays/sound_system_overlay.html`:
  - Avatar-Fallback im Overlay ergänzt.
  - Wenn `visual.avatarUrl` leer ist, versucht das Overlay per Login `/userinfo` und danach `/api/twitch/user`.
  - Buchstaben-Fallback bleibt erhalten.
  - Video-Retry-/Queue-/WebSocket-Logik aus FIX4 bleibt erhalten.

## Nicht geändert

- Keine Funktionen entfernt.
- Kein Streamer.bot-Auslöser eingeführt.
- Sound-System-Queue, Bundle-Lock, Video-Retry und TTS-Vorbereitung bleiben erhalten.
