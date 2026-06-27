# CURRENT CHAT HANDOFF – CAN-42.32

Stand: 2026-06-03

## Aktueller Stand

CAN-42.27 bis CAN-42.31 haben die Dashboard-/Backend-Diagnose konsolidiert:

- `/api/diagnostics/registry` ist vorhanden.
- Registry-Coverage ist vorhanden und bestätigt `ok = true`.
- Dashboard lädt die Registry und zeigt Coverage in der Gesamtübersicht.
- Alte, nicht mehr geladene Diagnose-Zusatzdateien wurden aus Repo und Live entfernt.
- Finaler Cleanup-Check:
  - Lokale Altdateien: 0
  - Lokale Alt-Referenzen: 0
  - Live-Altdateien: 0
  - Live-Alt-Referenzen: 0

## Wichtigste Architekturregel ab jetzt

Keine neuen Dashboard-Diagnose-Extra-Dateien pro Modul.

Stattdessen:

- `backend/modules/diagnostics.js` pflegt die Diagnose-Registry.
- `htdocs/dashboard/modules/diagnostics.js` zeigt die zentrale Diagnose.
- Neue diagnosefähige Module liefern eine Statusroute und einen standardisierten `diagnostics`-Block.
- Diagnosefähige Module werden in `/api/diagnostics/registry` ergänzt.
- Registry-Coverage muss nach jeder Ergänzung `ok = true` bleiben.

## New-Module-Checkliste

Vor neuen Modulen prüfen:

1. Existiert bereits ein Modul / Helper / Bridge für den Zweck?
2. Welche echte Datei ist Single Source of Truth?
3. Braucht das Modul eine Statusroute?
4. Ist es diagnosefähig?
5. Muss es in `/api/diagnostics/registry`?
6. Welche Statusfelder und Counts liefert es?
7. Welche Doku-Dateien werden aktualisiert?
8. Welche Tests bestätigen Registry-Coverage?

## Standard-Test

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r | Select-Object ok,module,moduleVersion,registryVersion,source
$r.counts
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

Erwartung:

```text
coverage.ok = True
missingLoadedModules = 0
registryOnlyEntries = 0
```

## Nächster sinnvoller Schritt

CAN-42.33: Nur nach konkretem Ziel weiterarbeiten. Bei jedem neuen Modul zuerst die New-Module-Checkliste anwenden.
