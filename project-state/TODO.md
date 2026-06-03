# TODO

## CAN-43.11

- [ ] CAN-43.11 ZIP entpacken.
- [ ] Optional `node -c backend\modules\media.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.11 Media diagnostics review"` ausführen.
- [ ] Doku committen/pushen.

## CAN-43.12 nächste Fachrunde

- [ ] Konkretes Modul/Thema auswählen.
- [ ] Empfehlung prüfen: `obs`.
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
