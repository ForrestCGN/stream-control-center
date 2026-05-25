# STEP420 – Bus-Diagnose im Dashboard vorbereiten

## Ziel

Sound-/Alert-Bus-Status und Alert/Sound-Korrelation zentral sichtbar machen, ohne produktive Steuerung umzubauen.

## Geänderte/Neue Dateien

- `backend/modules/bus_diagnostics.js`
- `htdocs/public/tools/bus_diagnostics_dashboard.html`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP420_BUS_DIAGNOSTICS_DASHBOARD.md`

## Neue Routen

- `GET /api/bus-diagnostics/status`
- `GET /api/bus-diagnostics/check`
- `GET /api/bus-diagnostics/routes`

## Dashboard-Seite

- `/public/tools/bus_diagnostics_dashboard.html`

## Eigenschaften

- read-only
- keine Queue-Änderung
- keine Sound-System-Änderung
- keine Alert-System-Änderung
- keine Overlay-Steuerung
- keine DB-Migration

## Geprüft

- `node --check backend/modules/bus_diagnostics.js`
