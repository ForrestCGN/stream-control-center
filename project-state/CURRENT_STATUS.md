# Current Status

CAN-42.35 abgeschlossen/vorbereitet: Dashboard-Diagnose-Cleanup und Extension-Dokumentation sind konsolidiert.

Aktueller Diagnose-Standard:

- Zentrale Dashboard-Diagnose: `htdocs/dashboard/modules/diagnostics.js`
- Styling: `htdocs/dashboard/modules/diagnostics.css`
- Backend-Registry: `GET /api/diagnostics/registry`
- Registry-Coverage zuletzt grün:
  - `ok: True`
  - `registryEntries: 14`
  - `loadedModules: 52`
  - `coveredLoadedModules: 14`
  - `missingLoadedModules: 0`
  - `registryOnlyEntries: 0`

Alte nicht mehr geladene Diagnose-Dateien wurden aus Repo und Live entfernt.

Bewusst behaltene Dashboard-Extensions sind dokumentiert in:

- `docs/modules/DASHBOARD_EXTENSIONS.md`

Regel für neue Module:

- keine neuen Diagnose-Extra-Dateien pro Modul
- Statusroute mit `diagnostics`-Block prüfen
- Registry-Eintrag prüfen
- Coverage-Test muss grün bleiben
- Modul- und Projekt-Doku aktualisieren
