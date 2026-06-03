# TODO

## CAN-43.15

- [ ] CAN-43.15 ZIP entpacken.
- [ ] Optional `node -c backend\modules\communication_bus.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.15 Communication-Bus diagnostics review"` ausführen.
- [ ] Doku committen/pushen.

## CAN-43.16

- [ ] Abschluss-/Konsolidierungsstep planen.
- [ ] alle geprüften CAN-43 Module auflisten.
- [ ] finalen Coverage-Stand dokumentieren.
- [ ] offene Beobachtungen sammeln.
- [ ] nächste Arbeitsrichtung festlegen.

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```
