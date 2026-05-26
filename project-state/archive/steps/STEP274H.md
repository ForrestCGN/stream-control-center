# STEP274H – Sound-System als offizieller Media-Playback-Hub

## Ziel

STEP274H zieht die Architektur gerade:

- Medienverwaltung = zentrale Registry/Bibliothek fuer Dateien, IDs, Typen, Dauer, Pfade, Vorschau und Metadaten.
- Sound-System = zentraler Abspielpunkt fuer Audio, Video und Animationen inklusive Queue, Prioritaeten, Lautstaerke, Overlay-Ausgabe und Ende-Meldung.
- Commands/Module speichern und senden Media-IDs, aber spielen Medien nicht selbst ab.

## Geaendert

- `backend/modules/sound_media_bridge.js`
  - Step auf `STEP274H` gesetzt.
  - Status benennt `/api/sound/play-media` als offiziellen Playback-Hub.
  - Status dokumentiert die Rollen: Media Registry verwaltet, Sound-System spielt ab.
  - Bestehende technische Kompatibilitaetskopie `_media_registry` bleibt erhalten.

- `backend/modules/commands_media.js`
  - Step auf `STEP274H` gesetzt.
  - Status-/Execution-Hinweise eindeutig auf `/api/sound/play-media` ausgerichtet.
  - `sound_play` und `video_play` routen beide weiterhin auf das Sound-System.

- `htdocs/dashboard/modules/commands_media.js`
  - Dashboard-Hinweise an die Zielarchitektur angepasst.

- `htdocs/dashboard/modules/commands_media.css`
  - Unveraendert aus STEP274G1 uebernommen.

## Nicht geaendert

- Kein Umbau am Sound-System-Core.
- Keine Medien werden verschoben, geloescht oder neu kodiert.
- Keine Command-Definitionen werden automatisch geaendert.
- Keine SQLite-Datenbank wird ersetzt.
- `video_media_bridge.js` und `_overlay-media-player.html` werden nicht automatisch geloescht, damit keine bestehende Testdatei unerwartet verschwindet. Sie sind aber nicht der offizielle Weg.

## Offizieller Weg ab STEP274H

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
node --check backend\modules\sound_media_bridge.js
node --check backend\modules\commands_media.js
node --check htdocs\dashboard\modules\commands_media.js

Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=video,animation&status=active"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=266&volume=80"
```
