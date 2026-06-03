# CAN-42.28 — Diagnostics Registry Coverage

## Ziel

Die zentrale Diagnose-Registry soll nicht nur eine feste Liste liefern, sondern zusätzlich prüfen, ob geladene Backend-Module in der Registry abgedeckt sind. Dadurch wird sichtbar, wenn ein neues Modul geladen wird, aber noch kein Diagnose-Eintrag existiert.

## Geändert

- `backend/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.js`

## Backend

`GET /api/diagnostics/registry` liefert weiterhin die Registry-Einträge, zusätzlich aber:

- `counts.coveredLoadedModules`
- `counts.missingLoadedModules`
- `counts.registryOnlyEntries`
- `coverage`

Die Coverage prüft geladene Module gegen Registry-Keys. Bekannte technische/Frontend-/Nicht-Diagnose-Module werden bewusst ausgeschlossen.

## Dashboard

Die zentrale Diagnose zeigt in der Ladezeile zusätzlich Registry-Informationen an:

- Registry-Quelle
- Anzahl Einträge
- Abdeckung geladener Module
- fehlende Module, falls vorhanden

## Nicht geändert

- Keine Fachmodul-Statusrouten
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktionen
- Keine DB-Migration
- Keine neue Dashboard-Zusatzdatei
- Keine Funktionalität entfernt

## Tests

```powershell
node -c backend\modules\diagnostics.js
node -c htdocs\dashboard\modules\diagnostics.js

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r | Select-Object ok,module,moduleVersion,registryVersion,source
$r.counts
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
```

## Ergebnis

CAN-42.28 macht fehlende Registry-Abdeckung sichtbar, ohne die Registry bereits vollautomatisch aus allen Modulen zu generieren.
