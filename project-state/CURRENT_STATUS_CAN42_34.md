# CURRENT STATUS CAN-42.34

## Dashboard-Diagnose-Struktur

Zentrale Diagnose:

- `htdocs/dashboard/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.css`
- Backend-Registry: `/api/diagnostics/registry`

Registry-Coverage zuletzt bestätigt:

- `ok: True`
- `registryEntries: 14`
- `loadedModules: 52`
- `coveredLoadedModules: 14`
- `missingLoadedModules: 0`
- `registryOnlyEntries: 0`

## Cleanup-Stand

Alte nicht mehr geladene Diagnose-Dateien sind aus Repo und Live entfernt.

## Noch geladene Extensions

Die noch geladenen Extensions wurden geprüft und bleiben vorerst bewusst erhalten:

- Commands Read-only Diagnose
- Hug erweiterte Read-only-Diagnose
- Message-Rotator erweiterte Read-only-Diagnose
- Bus-Diagnose Read-only Summary
- Bus-Diagnose Subpage Safety
- Overlay-Monitor Safety

## Regel

Keine neuen Diagnose-Extra-Dateien pro Modul.
Neue Module müssen direkt in Statusroute, Registry und Coverage berücksichtigt werden.
