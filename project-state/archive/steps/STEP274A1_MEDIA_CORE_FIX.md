# STEP274A1 – Media-Core Fix

## Zweck

Fix für den ersten Media-Core-Live-Test.

## Behoben

- `/api/media/list?type=audio` und `/api/media/list?type=video` konnten mit `Unknown named parameter 'category'` abbrechen.
- Ursache: Der SQL-Wrapper akzeptiert keine ungenutzten Named Parameters. `listAssets()` baut die Parameter jetzt nur noch für wirklich verwendete Filter.
- ffprobe-Fehler bei ungültigen/kaputten Legacy-Dateien werden ruhiger behandelt.

## Hinweise

Die Dateien `leer.mp3` und `test_ping.wav` sind keine gültigen Audio-Dateien oder beschädigt. Das ist kein Fehler der Medienverwaltung. Der Scanner soll solche Dateien künftig nicht laut durchreichen, sondern die Datei mit `durationMs=0`/fehlender Media-Info registrieren oder überspringen.

## Betroffene Dateien

- `backend/modules/media.js`
- `backend/modules/helpers/helper_media.js`

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=video"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio&category=legacy"
```
