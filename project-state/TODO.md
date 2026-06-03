# TODO

## CAN-43.13 / CAN-43.14

- [ ] CAN-43.13-43.14 ZIP entpacken.
- [ ] Optional `node -c backend\modules\overlay_monitor.js` ausführen.
- [ ] Optional `node -c backend\modules\bus_diagnostics.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.13-43.14 Overlay-Monitor and Bus-Diagnostics reviews"` ausführen.
- [ ] Doku committen/pushen.

## CAN-43.15

- [ ] `communication_bus` mit echten `/api/communication/*`-Routen prüfen.
- [ ] Mini-Export ausführen.
- [ ] ZIP hochladen.
- [ ] Echte Routen dokumentieren.
- [ ] Doku/project-state aktualisieren.

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```
