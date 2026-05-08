# STEP200.1 – Sound-System Routes + Integration-Check

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: kleiner Backend-Standardisierungs-STEP  
Status: vorbereitet

## Ziel

Das Sound-System wird an den neuen globalen Modulstandard angenähert, ohne bestehende Sound-Funktionalität zu verändern.

## Ausgangslage

Der Live-Check zeigte:

```text
/api/sound/status             OK
/api/sound/config             OK
/api/sound/settings           OK
/api/sound/routes             404
/api/sound/integration-check  404
```

Außerdem existieren weiterhin zwei Zielsysteme:

```text
output.targets = overlay/device/both
targets        = stream/discord/both
```

`output.targets` ist das aktive Ausgabezielmodell für Overlay/Device/Both.  
`targets` bleibt aus Kompatibilitätsgründen erhalten und darf nicht entfernt werden, solange alte Aufrufer noch `target=stream/discord/both` nutzen.

## Geänderte Datei

```text
backend/modules/sound_system.js
```

## Ergänzte Routen

```text
GET /api/sound/routes
GET /api/sound/integration-check
```

## Integration-Check prüft

- Sound-System enabled/paused
- current/queue/parallel
- Overlay-Client verbunden
- Device-Status und Fehlerzähler
- DB-Settings Tabelle `sound_settings`
- JSON-Config-Pfad und JSON-Status
- DB-vor-JSON-Regel für erlaubte Blocks
- `output.targets`
- Legacy-`targets`
- Overlay-URL
- AudioDeviceHelper-Pfad
- Sounds-Basisverzeichnis
- `.mp4` und `.webm` in allowedExtensions
- Anzahl JSON-Presets

## Bewusst nicht geändert

- keine DB-Migration
- keine JSON-Änderung
- keine Dashboard-Datei
- keine Sound-Queue-Logik
- keine Overlay-Logik
- keine Entfernung von `targets`
- keine Entfernung von JSON-Preset `test_ping`

## Erwartetes Ergebnis

Nach Deploy:

```text
/api/sound/routes             OK
/api/sound/integration-check  OK
```

`integration-check` darf eine Warning für die Legacy-Doppelstruktur melden:

```text
legacy_targets_and_output_targets_both_present
```

Das ist aktuell kein Fehler, sondern ein dokumentierter Migrationshinweis.

## Tests

Vor Commit:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_system.js
```

Nach Deploy/Backend-Neustart:

```powershell
cd D:\Streaming\stramAssets
New-Item -ItemType Directory -Force -Path "D:\gpt" | Out-Null

$Result = [ordered]@{}
$Result.soundStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$Result.soundConfig = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/config"
$Result.soundSettings = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings"
$Result.soundRoutes = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/routes"
$Result.soundIntegrationCheck = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/integration-check"

$Result | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 "D:\gpt\last_api.json"
Get-Item "D:\gpt\last_api.json" | Select-Object FullName,Length,LastWriteTime
```

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "sound: add routes and integration check"
```
