# CAN-42.14 - VIP-Sound Status Diagnostics

## Ziel

VIP-Sound an den zentralen Diagnostics-Standard angleichen und die Moduldatei klarer benennen.

## Datei-Umstellung

Neu:

```text
backend/modules/vip-sound.js
```

Alt, nach dem Entpacken manuell löschen:

```text
backend/modules/vip_sound_overlay.js
```

Warum löschen?

Der Node-Server lädt alle `.js`-Dateien aus `backend/modules`. Wenn beide Dateien existieren, würden beide Module geladen und dieselben `/api/vip-sound/*`-Routen doppelt registriert.

## Backend-Änderung

`/api/vip-sound/status` liefert zusätzlich:

```text
module
moduleVersion
moduleBuild
diagnosticVersion
canonicalPrefix
prefix
aliases
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
runtimeVersion
schemaVersion
expectedSchemaVersion
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

## Dashboard-Änderung

Die generische Diagnose-Erweiterung liest VIP über:

```text
/api/vip-sound/status
```

Kein neuer Dashboard-Bereich, kein neues Dashboard-Modul.

## Bewusst nicht geändert

```text
Keine VIP-/Mod-Sound-Ausführung
Keine Queue-Logik
Keine Overlay-Logik
Keine Daily-Usage-Logik
Keine Upload-Logik
Keine Command-Logik
Keine Twitch-Sync-Logik
Keine DB-Migration
Kein neuer /api/vip-Prefix
```

## Test

```powershell
Remove-Item backend\modules\vip_sound_overlay.js

.\stepdone.cmd "CAN-42.14 VIP-Sound status diagnostics-standard"

node -c backend\modules\vip-sound.js
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js

$v = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
$v | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,routeCount
$v.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$v.diagnostics.counts
```
