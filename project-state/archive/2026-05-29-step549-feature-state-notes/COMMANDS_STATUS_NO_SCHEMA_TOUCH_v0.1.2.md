# Commands v0.1.2 - status-no-schema-touch

## Ziel

`/api/commands/status` darf keine schwere Arbeit mehr auslösen.

## Änderungen

- `MODULE_VERSION = 0.1.2`
- `MODULE_BUILD = status-no-schema-touch`
- `module.exports.MODULE_META` ergänzt
- Statusroute ruft kein `ensureSchema()` mehr auf
- Status zeigt `schemaTouchOnStatus=false`
- Catalog nutzt Version/Build statt öffentlichem STEP-Feld

## Nicht geändert

- Keine DB-Migration
- Keine Dashboard-Änderung
- Keine Command-Ausführungslogik
- Keine Routen entfernt

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Select-Object ok,module,moduleVersion,moduleBuild,lightStatus,schemaTouchOnStatus
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
```
