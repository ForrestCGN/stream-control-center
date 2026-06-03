# TODO

## CAN-43.12

- [ ] CAN-43.12 ZIP entpacken.
- [ ] Optional `node -c backend\modules\obs.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.12 OBS diagnostics review"` ausführen.
- [ ] Doku committen/pushen.

## CAN-43.13 nächste Fachrunde

- [ ] Konkretes Modul/Thema auswählen.
- [ ] Empfehlung prüfen: `overlay_monitor`.
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
