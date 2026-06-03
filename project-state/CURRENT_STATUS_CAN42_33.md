# CURRENT STATUS CAN-42.33

## Kurzstand

Die alten nicht mehr geladenen Diagnose-Dateien wurden in CAN-42.30/31 aus Repo und Live entfernt.

Die zentrale Diagnose-Struktur ist jetzt:

- `htdocs/dashboard/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.css`
- Backend-Registry: `GET /api/diagnostics/registry`

Registry-Coverage ist bestätigt:

- `ok: True`
- `registryEntries: 14`
- `loadedModules: 52`
- `coveredLoadedModules: 14`
- `missingLoadedModules: 0`
- `registryOnlyEntries: 0`

CAN-42.33 erfasst jetzt die noch aktiv geladenen Dashboard-Erweiterungsdateien als nächsten Prüfbereich.
