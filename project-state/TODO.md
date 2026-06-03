# TODO

## CAN-43.5

- [ ] CAN-43.5 ZIP entpacken.
- [ ] Optional `node -c backend\modules\message_rotator.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.5 Message-Rotator diagnostics review"` ausführen.
- [ ] Doku committen/pushen.

## CAN-43.6 nächste Fachrunde

- [ ] Konkretes Modul/Thema auswählen.
- [ ] Vor Umsetzung echten Dateistand prüfen.
- [ ] Repo/GitHub/dev und Live-System bewusst abgleichen.
- [ ] Diagnose-Standard anwenden:
  - [ ] Statusroute
  - [ ] `diagnostics`-Block
  - [ ] Registry-Eintrag
  - [ ] Coverage-Test
  - [ ] Doku/project-state
- [ ] Keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung anlegen.
- [ ] Vor Umsetzung auf `go` warten.

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```
