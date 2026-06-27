# CAN-42.13 - Message-Rotator Status Diagnostics

## Ziel

`/api/message-rotator/status` wird auf den zentralen Diagnostics-Standard angeglichen, damit Admin > Diagnose > Message-Rotator die gleichen generischen Detailinformationen anzeigen kann wie Commands, Hug, Tagebuch und Todo.

## Geänderte Datei

```text
backend/modules/message_rotator.js
```

## Änderungen

```text
MODULE_VERSION: 0.1.0 -> 0.1.1
MODULE_BUILD: diagnostics-standard ergänzt
MODULE_META.build ergänzt
module.exports.getStatus ergänzt
/api/message-rotator/status liefert zusätzlich:
- module
- moduleVersion
- moduleBuild
- version
- routes
- routeCount
- dataEndpoints
- diagnostics
```

Der neue `diagnostics`-Block enthält read-only Werte zu:

```text
counts
runtime
config
database/settings-helper
warnings
errors
```

## Nicht geändert

```text
Keine Rotator-Ausführung
Keine Start-/Stop-/Tick-/Next-/Manual-Logik
Keine Chat-Ausgabe
Keine Timer-/Cooldown-Logik
Keine DB-Migration
Keine Dashboard-Dateien
Keine produktiven POST-Routen
Keine Funktionalität entfernt
```

## Test nach Entpacken

```powershell
.\stepdone.cmd "CAN-42.13 Message-Rotator status diagnostics-standard"

node -c backend\modules\message_rotator.js

$m = Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status"
$m | Select-Object ok,module,moduleVersion,moduleBuild,version,active,routeCount
$m.diagnostics | Select-Object ok,health,module,version,build,schemaReady,lastError
$m.diagnostics.counts
```

Danach Dashboard hart neu laden und `Admin > Diagnose > Message-Rotator` prüfen.
