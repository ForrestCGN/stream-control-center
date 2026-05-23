# STEP274G1 – Existing Sound-System Overlay Routing

## Ziel

STEP274G hatte versehentlich einen neuen separaten Video-Overlay-Player eingefuehrt.
Forrest hat korrekt darauf hingewiesen, dass das vorhandene `sound_system_overlay.html` bereits Audio und Video abspielen kann.

STEP274G1 korrigiert deshalb das Routing:

- Audio-Commands gehen an `/api/sound/play-media?mediaId=<id>`
- Video-/Animation-Commands gehen ebenfalls an `/api/sound/play-media?mediaId=<id>`
- Die Wiedergabe laeuft ueber das bestehende Sound-System und dessen vorhandenes Overlay.

## Geaendert

- `backend/modules/commands_media.js`
  - Step auf `STEP274G1`
  - `video_play` routet wieder ueber `sound_media_bridge` und `/api/sound/play-media`
  - Status weist auf das bestehende `sound_system_overlay.html` hin
- `htdocs/dashboard/modules/commands_media.js`
  - Dashboard-Hinweise angepasst
  - Video/Animation wird als Command-Ziel ueber `/api/sound/play-media` gesetzt

## Nicht geaendert

- Keine Medien verschoben oder geloescht
- Sound-System-Core bleibt unveraendert
- Command-Core bleibt unveraendert
- Bestehende `video_media_bridge.js` wird nicht aktiv genutzt, aber in diesem Step nicht geloescht

## Tests

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=video,animation&status=active"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=266&volume=80"
```

Erwartung: `commands_media` meldet STEP274G1 und Video-Optionen zeigen `/api/sound/play-media?mediaId=<id>`.
