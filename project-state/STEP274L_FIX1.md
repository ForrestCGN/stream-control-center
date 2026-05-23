# STEP274L-FIX1 - Commands Media Routing Restore

## Grund

Nach STEP274L wurde bei bestehenden Command-Medienfeldern zwar die gespeicherte `mediaId` angezeigt, aber die offizielle Playback-Route wurde nur nach einer neuen Picker-Auswahl gesetzt.

Wenn ein Command geöffnet und gespeichert wurde, ohne erneut ein Medium im Picker auszuwählen, konnten `moduleKey`, `actionKey`, `targetMethod`, `targetUrl` und `responseMode` leer oder veraltet bleiben.

## Änderung

- `htdocs/dashboard/modules/commands_media.js`
  - bestehende `soundMediaId`/`videoMediaId` setzen beim Rendern wieder automatisch die Route
  - Fallback auch dann, wenn die Media-Option nicht in der geladenen Liste gefunden wird
  - Ziel bleibt `/api/sound/play-media?mediaId=<id>`
  - Audio nutzt `play_audio_media`
  - Video/Animation nutzt `play_video_media`

## Nicht geändert

- Kein Backend-Code
- Keine Datenbank
- Keine Medien-Dateien
- Keine Sound-System-Logik
