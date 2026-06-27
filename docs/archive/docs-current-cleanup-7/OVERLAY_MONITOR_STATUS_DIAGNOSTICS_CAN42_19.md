# CAN-42.19 Overlay-Monitor Status-Diagnostics

## Ziel

`/api/overlay-monitor/status` an den zentralen Diagnostics-Standard angleichen, damit `Admin > Diagnose > Overlay-Monitor` dieselben generischen Diagnoseblöcke nutzen kann wie die bereits angepassten Module.

## Geändert

```text
backend/modules/overlay_monitor.js
```

## Backend-Anpassung

Die bestehende Statusroute wurde erweitert um:

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
counts
database
state
warnings
errors
lastError
```

## Wichtig

Die Änderung ist read-only. Die bestehende Overlay-Monitor-Logik bleibt unverändert:

```text
Keine Overlay-Refresh-/Repair-Logik geändert
Keine OBS-Aktionslogik geändert
Keine WebSocket-/Communication-Bus-Produktivlogik geändert
Keine Monitoring-Issue-Verarbeitung geändert
Keine Inventar-Refresh-Logik geändert
Keine DB-Migration
Keine Dashboard-Dateien
Keine neue Moduldatei
Keine Funktionalität entfernt
```

## Test

```powershell
.\stepdone.cmd "CAN-42.19 Overlay-Monitor status diagnostics-standard"

node -c backend\modules\overlay_monitor.js

$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/status"
$o | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,readOnly,routeCount
$o.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$o.diagnostics.counts
```

Danach Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Overlay-Monitor
```
