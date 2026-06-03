# SOUND_SYSTEM_STATUS_DIAGNOSTICS_CAN42_15

## Ziel

Das Sound-System wird an den zentralen Diagnostics-Standard angepasst, ohne produktive Sound-Flows zu verändern.

## Geänderte Datei

```text
backend/modules/sound_system.js
```

## Änderung

`/api/sound/status` liefert zusätzlich standardisierte Diagnosefelder:

```text
moduleVersion
moduleBuild
diagnosticVersion
routes
routeCount
dataEndpoints
diagnostics
```

Der neue `diagnostics`-Block enthält:

```text
ok
health
module
version
build
schemaVersion
schemaReady
configSource
textSource
database
counts
state
warnings
errors
lastError
```

## Bewusst nicht geändert

```text
/api/sound/play
/api/sound/bundle
/api/sound/stop
/api/sound/skip
/api/sound/clear
/api/sound/pause
/api/sound/resume
/api/sound/reset
/api/sound/eventbus/*
Queue-/Parallel-/Bundle-Logik
Overlay-/Device-/Discord-Playback
Sound-Auswahl
Cooldown-/Dedupe-Regeln
DB-Migration
Dashboard-Dateien
```

Keine Funktionalität entfernt.

## Test

```powershell
node -c backend\modules\sound_system.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,paused,routeCount
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
```
