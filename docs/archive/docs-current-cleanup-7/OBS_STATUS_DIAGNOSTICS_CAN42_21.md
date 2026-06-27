# CAN-42.21 OBS Status-Diagnostics

## Ziel

OBS/OBS-Shared in der bestehenden Statusroute auf den standardisierten Diagnostics-Block bringen.

## Geändert

- `backend/modules/obs.js`
- `MODULE_VERSION`: `0.1.0` -> `0.1.1`
- `MODULE_BUILD`: `step278-meta` -> `diagnostics-standard`
- `/api/obs/status` / Legacy `/obs/status` liefert zusätzlich:
  - `moduleVersion`
  - `moduleBuild`
  - `version`
  - `diagnosticVersion`
  - `enabled`
  - `obsConnected`
  - `obsDetected`
  - `routeCount`
  - `routes`
  - `dataEndpoints`
  - `diagnostics`

## Diagnostics-Block

Der neue Block enthält:

- `counts`
- `database`
- `state`
- `warnings`
- `errors`
- `lastError`

## Nicht geändert

- Keine OBS-Verbindungslogik geändert
- Keine Szenen-/Source-/Audio-/Replay-/Filter-Aktionslogik geändert
- Keine Refresh-/Repair-/Switch-/Mute-/Volume-Logik geändert
- Keine Dashboard-Dateien geändert
- Keine DB-Migration
- Keine neue Moduldatei
- Keine Funktionalität entfernt

## Test

```powershell
.\stepdone.cmd "CAN-42.21 OBS status diagnostics-standard"

node -c backend\modules\obs.js

$o = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/status"
$o | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,obsConnected,obsDetected,routeCount
$o.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$o.diagnostics.counts
```
