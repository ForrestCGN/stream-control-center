# TODO

## CAN-43.8

- [ ] CAN-43.8 ZIP entpacken.
- [ ] Optional `node -c backend\modules\vip-sound.js` ausführen.
- [ ] `stepdone.cmd "CAN-43.8 VIP-Sound diagnostics review"` ausführen.
- [ ] Doku committen/pushen.

## Nächste Fachrunde

- [ ] Bewusst entscheiden:
  - [ ] weitere Registry-Module prüfen
  - [ ] oder Feature-/Umbau-Thema aufnehmen
- [ ] Vor Umsetzung echten Dateistand prüfen.
- [ ] Repo/GitHub/dev und Live-System bewusst abgleichen.
- [ ] Diagnose-Standard anwenden, falls Modul betroffen:
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
