# STEP274I – Sound-System als offizieller Media-Playback-Hub / Altpfad markiert

## Ziel

Die Architektur wird festgezogen:

- Medienverwaltung / `media_assets` ist die zentrale Registry fuer Dateien, IDs, Typen, Pfade, Dauer und Metadaten.
- Das Sound-System ist der zentrale Abspielpunkt fuer Audio, Video und Animation.
- Commands, Dashboard und spaetere Module nutzen Media-IDs und routen auf `/api/sound/play-media?mediaId=<id>`.
- Das bestehende `/overlays/sound_system_overlay.html` bleibt der offizielle OBS-Player.

## Geaendert

- `backend/modules/sound_media_bridge.js` auf STEP274I gesetzt.
- `backend/modules/commands_media.js` auf STEP274I gesetzt.
- Dashboard-Hinweise in `htdocs/dashboard/modules/commands_media.js/css` angepasst.
- `backend/modules/video_media_bridge.js` als `STEP274I_DEPRECATED` markiert.
- `htdocs/overlays/_overlay-media-player.html` als deprecated Test-Overlay markiert.

## Nicht geaendert

- Keine Medien wurden verschoben, geloescht oder konvertiert.
- Das Sound-System-Core-Modul wurde nicht umgebaut.
- Bestehende `/api/video/*` Testpfade bleiben erreichbar, sind aber nicht mehr offiziell.
- Bestehende Command-Definitionen werden nicht automatisch geaendert.

## Offizieller Weg

```text
Medienverwaltung / media_assets
        ↓ Media-ID
/api/sound/play-media?mediaId=<id>
        ↓
Sound-System Queue / Output / Overlay
        ↓
/overlays/sound_system_overlay.html
```

## Tests

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/video/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=266&volume=80"
```

Erwartung:

- `sound_media_bridge.step = STEP274I`
- `commands_media.step = STEP274I`
- `video_media_bridge.step = STEP274I_DEPRECATED`
- Audio/Video laufen ueber `/api/sound/play-media`.
