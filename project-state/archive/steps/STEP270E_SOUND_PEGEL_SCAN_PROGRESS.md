# STEP270E - Sound Pegel-Scan Fortschrittsanzeige

Stand: 2026-05-21

## Ziel

Der Pegel-Scan soll im Dashboard nicht mehr wie ein blockierender Vorgang wirken, sondern einen sichtbaren Fortschritt anzeigen.

## Umsetzung

- Backend: `POST /api/sound/loudness/scan` unterstuetzt jetzt `async=true`.
- Backend: `GET /api/sound/loudness/status` liefert ein `progress`-Objekt.
- Dashboard: Scan-Start nutzt den asynchronen Modus.
- Dashboard: Status wird waehrend laufendem Scan gepollt.
- Dashboard: Fortschrittsbalken, aktuelle Datei und OK/Warnung/Fehler-Zaehler werden angezeigt.

## Progress-Felder

```text
progress.scanId
progress.status
progress.discoveredFiles
progress.scannedFiles
progress.okFiles
progress.warningFiles
progress.errorFiles
progress.currentFile
progress.progressPercent
```

## Bewusst unveraendert

```text
Sound-Dateien
Sound-System Queue
Discord-Routing
Alert-System
TTS-System
config/**
app.sqlite
```

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Runtime-Test:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 500; async = $true } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 80
```
