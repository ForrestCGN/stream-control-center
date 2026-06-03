# CAN-42.32 – Dokumentation / New-Module-Regeln für Diagnose-Registry

## Ziel

Der bereinigte Diagnose-/Registry-Stand wird dokumentiert. Zusätzlich wird festgelegt, dass bei neuen Modulen Diagnose, Statusroute und Registry-Coverage direkt berücksichtigt werden müssen.

## Hintergrund

In CAN-42.21 bis CAN-42.31 wurden alte Dashboard-Diagnose-Zusatzdateien entfernt und durch eine zentrale Struktur ersetzt:

- Backend: `/api/diagnostics/registry`
- Frontend: `htdocs/dashboard/modules/diagnostics.js`
- Styling: `htdocs/dashboard/modules/diagnostics.css`

Die alten pro-Modul-Patcher sind entfernt und dürfen nicht wieder als Standard eingeführt werden.

## Ergebnis

Neue diagnosefähige Module müssen künftig:

1. eine Statusroute haben,
2. einen standardisierten `diagnostics`-Block liefern,
3. in `/api/diagnostics/registry` eingetragen werden,
4. Registry-Coverage erfolgreich testen,
5. ohne neue Dashboard-Diagnose-Extra-Dateien auskommen,
6. sauber dokumentiert werden.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine Dashboard-Logik geändert.
- Keine produktiven Flows geändert.
- Keine DB-Migration.
- Keine neuen Moduldateien.

## Betroffene Doku-Dateien

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN42_32.md`
- `docs/modules/DIAGNOSTICS_NEW_MODULE_RULES.md`
- `docs/current/ForrestCGN_stream_control_center_MASTER_PROMPT_CAN42_32_UPDATED.txt`

## Standardtest für neue Module

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```
