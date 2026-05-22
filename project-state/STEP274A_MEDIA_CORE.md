# STEP274A – Zentrale Medienverwaltung Core

## Ziel

Zentrale Medien-Registry als Backend-Core vorbereiten.

Wichtig: Dieser Step baut noch **kein Dashboard** und bindet Commands noch nicht an Medien an. Das folgt in STEP274B/STEP274C.

## Neue Datei

- `backend/modules/media.js`

## Neue Datenbank-Tabelle

- `media_assets`

Die Tabelle registriert Medien mit:

- Typ: `audio`, `video`, `image`, `animation`
- Kategorie
- Anzeigename
- Datei-/Webpfad
- Größe
- Dauer
- Breite/Höhe
- Audio-/Video-Flags
- Tags
- Quelle: `upload`, `media_dir`, `legacy_scan`
- Status

## Zielordner für neue Uploads

Neue Uploads landen unter:

- `htdocs/assets/media/audio/`
- `htdocs/assets/media/video/`
- `htdocs/assets/media/image/`
- `htdocs/assets/media/animation/`

Bestehende Asset-Dateien werden nicht verschoben.

## API-Routen

- `GET /api/media/status`
- `GET /api/media/list`
- `POST /api/media/scan`
- `GET /api/media/scan`
- `POST /api/media/upload`
- `POST /api/media/update`
- `POST /api/media/delete`

## Scan

`/api/media/scan` scannt bestehende relevante Ordner unter `htdocs/assets`, z. B.:

- `assets/sounds`
- `assets/sounds/alerts`
- `assets/images`
- `assets/soundalerts/video`
- `assets/media/*`

## Upload

Upload nutzt Multipart/Form-Data mit Feldname:

- `file`

Optionale Felder:

- `type`
- `category`
- `displayName`

## Regeln

- Keine bestehende Datei wird verschoben.
- Löschen ist standardmäßig Soft-Delete.
- Physisches Löschen geht nur mit `deleteFile=true`.
- Commands, Alerts und andere Module sollen Medien später über `media_assets` referenzieren.
- Upload-/Vorschau-Dashboard kommt in STEP274B.
- Command-Ausführung für Sound/Video kommt in STEP274C/STEP274D.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/scan"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio"
```
