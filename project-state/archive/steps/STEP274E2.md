# STEP274E2 – Media-Sound-Bridge Audio Media-Type Fix

## Ziel

MP3-/Audio-Dateien aus der zentralen Medienverwaltung duerfen nicht als Video an das Sound-System uebergeben werden, nur weil ffprobe eingebettete Cover-Art als Video-Stream erkennt.

## Geaendert

- `backend/modules/sound_media_bridge.js`
  - Step auf `STEP274E2` gesetzt.
  - Neue Helper-Logik `resolvePayloadMediaType(...)`.
  - Wenn `media_assets.type = audio`, wird immer `mediaType = audio` an `/api/sound/play` gegeben.
  - `video` und `animation` bleiben weiterhin `mediaType = video`.

## Nicht geaendert

- Keine Aenderung am Sound-System-Core.
- Keine Medien werden verschoben oder geloescht.
- Keine Command-Definitionen werden automatisch veraendert.
- Keine SQLite-Datenbank wird ersetzt.

## Tests

```powershell
node --check backend/modules/sound_media_bridge.js
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=325&volume=60"
```

## Erwartung

Bei `mediaId=325` muss im Payload `mediaType=audio` stehen, obwohl das Asset `hasVideo=True` haben kann.
