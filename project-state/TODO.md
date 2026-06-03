# TODO

## CAN-43.1

- [ ] CAN-43.1 entpacken.
- [ ] `stepdone.cmd "CAN-43.1 Documentation handoff for new chat"` ausführen.
- [ ] Doku committen/pushen.
- [ ] Neuen Chat mit `docs/current/CURRENT_CHAT_HANDOFF_CAN43_1.md` starten.

## CAN-43 nächste Fachrunde

- [ ] Konkretes Modul/Thema auswählen.
- [ ] Vor Umsetzung echten Dateistand prüfen.
- [ ] Diagnose-Standard anwenden:
  - [ ] Statusroute
  - [ ] `diagnostics`-Block
  - [ ] Registry-Eintrag
  - [ ] Coverage-Test
  - [ ] Doku/project-state
- [ ] Keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung anlegen.

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```
