# STEP274E1 – Media-Sound-Bridge Hotfix

## Ziel
Media-Assets aus der zentralen Medienverwaltung koennen ueber das bestehende Sound-System abgespielt werden, ohne dass einzelne Module Pfade selbst erraten muessen.

## Geaendert
- `backend/modules/sound_media_bridge.js` neu:
  - `GET/POST /api/sound/play-media`
  - `GET /api/sound/media-bridge/status`
  - nutzt `media.resolveAssetForUse(...)`
  - leitet danach an das bestehende `/api/sound/play` weiter
  - fuer neue `media/*` Dateien wird eine technische Kompatibilitaetskopie unter `htdocs/assets/sounds/_media_registry/` angelegt
- `htdocs/dashboard/modules/commands_media.js`
  - Medienauswahl setzt automatisch die technische Zielroute fuer Sound-/Video-Commands:
    - `moduleKey=sound_media_bridge`
    - `targetUrl=/api/sound/play-media?mediaId=<id>`
- `htdocs/dashboard/modules/commands_media.css` neu fuer kleine Hinweise

## Nicht geaendert
- Keine bestehende Command-Ausfuehrung entfernt.
- Kein Sound-System-Core umgebaut.
- Keine bestehenden Medien verschoben oder geloescht.
- Keine SQLite-Daten ersetzt.

## Test
- `node --check backend/modules/sound_media_bridge.js`
- `node --check htdocs/dashboard/modules/commands_media.js`

## Nach Deploy testen
```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=325&volume=60"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=audio&status=active"
```

## Naechster Schritt
STEP274F: Command-Ausfuehrung fuer `sound_play`/`video_play` im Command-System gezielt testen und ggf. Katalog-Defaults fuer Medienaktionen setzen.
