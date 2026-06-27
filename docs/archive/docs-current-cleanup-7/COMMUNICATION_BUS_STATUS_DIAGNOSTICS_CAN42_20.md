# CAN-42.20 Communication-Bus Status-Diagnostics

## Ziel

`/api/communication/status` liefert zusätzlich zum bestehenden Bus-Status einen standardisierten `diagnostics`-Block, damit die zentrale Diagnose im Dashboard konsistent auswerten kann.

## Geänderte Datei

- `backend/modules/communication_bus.js`

## Ergänzt

- `moduleBuild`
- `diagnosticVersion`
- `version`
- `enabled`
- `bus`
- `busVersion`
- `routes`
- `routeCount`
- `dataEndpoints`
- `diagnostics`

## Diagnostics-Inhalte

- `counts`
- `database`
- `state`
- `warnings`
- `errors`
- `lastError`

## Nicht geändert

- keine Bus-Emit-Logik
- keine WebSocket-Hello-/Heartbeat-/ACK-Verarbeitung
- keine Replay-/Watchdog-/Issue-/Reset-Produktivlogik
- keine Settings-Speicherlogik
- keine DB-Migration
- keine Dashboard-Dateien
- keine neue Moduldatei
- keine Funktionalität entfernt

## Test

```powershell
.\stepdone.cmd "CAN-42.20 Communication-Bus status diagnostics-standard"
node -c backend\modules\communication_bus.js

$c = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$c | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,bus,busVersion,routeCount
$c.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$c.diagnostics.counts
```
