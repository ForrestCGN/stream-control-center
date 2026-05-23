# STEP274G – Video / Animation Media Overlay Bridge

## Ziel

Audio-Commands bleiben beim stabil getesteten Weg:

`Command -> /api/sound/play-media?mediaId=<id> -> Sound-System Queue`

Video-/Animations-Commands bekommen einen eigenen Overlay-Weg:

`Command -> /api/video/play-media?mediaId=<id> -> _overlay-media-player.html`

Damit wird Video nicht mehr ueber Sound-Playback missbraucht.

## Geaendert

- `backend/modules/video_media_bridge.js`
  - Neuer Bridge-Core fuer Video/Animation aus `media_assets`.
  - Neue Routen:
    - `GET/POST /api/video/play-media`
    - `POST /api/video/stop-media`
    - `GET /api/video/media-player/state`
    - `POST /api/video/media-player/ended`
    - `GET /api/video/media-bridge/status`
- `htdocs/overlays/_overlay-media-player.html`
  - Einfacher OBS-Browser-Overlay-Player.
  - Pollt `/api/video/media-player/state`.
  - Spielt aktuelle Video-/Animations-URL ab und meldet Ende zurueck.
- `backend/modules/commands_media.js`
  - STEP274G.
  - Audio-Optionen routen weiter zu `/api/sound/play-media?mediaId=<id>`.
  - Video/Animation-Optionen routen zu `/api/video/play-media?mediaId=<id>`.
- `htdocs/dashboard/modules/commands_media.js`
  - Texte/Hinweise fuer getrennte Audio-/Video-Routen aktualisiert.

## Nicht geaendert

- Keine Aenderung am Sound-System-Core.
- Keine Aenderung an `backend/modules/commands.js`.
- Keine Medien werden verschoben, geloescht oder umkodiert.
- Bestehende Audio-Command-Ausfuehrung bleibt unveraendert.

## OBS Overlay URL

```text
http://127.0.0.1:8080/overlays/_overlay-media-player.html
```

Empfohlene Browserquelle: 1920x1080, transparent, bei Szenenwechsel nicht entladen.

## Tests

```powershell
node --check backend\modules\video_media_bridge.js
node --check backend\modules\commands_media.js
node --check htdocs\dashboard\modules\commands_media.js

Invoke-RestMethod http://127.0.0.1:8080/api/video/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/video/media-player/state
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=video,animation&status=active"
```

Direkt-Test mit einem vorhandenen Video, z. B. `id=266`:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/video/play-media?mediaId=266&volume=80"
```

Danach sollte `/api/video/media-player/state` ein `current`-Objekt liefern.

## Naechster Step

STEP274H: Dashboard-/OBS-UX fuer Media-Player verbessern, z. B. Preview, Stop-Button, Fit/Loop/Volume-Felder und ggf. Command-Diagnose-Vorlagen.
