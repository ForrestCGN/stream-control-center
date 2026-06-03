# Current Status

## CAN-42.32 – Diagnose-Dokumentation und New-Module-Regeln

Stand: 2026-06-03

Der Diagnose-/Registry-Block ist nach CAN-42.27 bis CAN-42.31 bereinigt und stabil:

- `GET /api/diagnostics/registry` ist die zentrale Backend-Registry für Diagnosemodule.
- Die Registry liefert aktuell 14 Diagnose-Einträge.
- Registry-Coverage ist bestätigt: `coverage.ok = true`, `missingLoadedModules = 0`, `registryOnlyEntries = 0`.
- Das Dashboard nutzt die Backend-Registry und nur noch `htdocs/dashboard/modules/diagnostics.js` + `diagnostics.css` als zentrale Diagnose-Basis.
- Alte, nicht mehr geladene Diagnose-Zusatzdateien wurden aus Repo und Live entfernt.
- Repo-Cleanup und Live-Cleanup wurden mit `tools/check/CAN-42.31_verify_diagnostics_cleanup.cmd` bestätigt:
  - Lokale Altdateien: 0
  - Lokale Alt-Referenzen: 0
  - Live-Altdateien: 0
  - Live-Alt-Referenzen: 0

## Verbindliche Regel für neue Module

Neue Backend-Module müssen künftig direkt auf den Diagnose-/Registry-Standard geprüft werden:

1. Statusroute planen, bevorzugt `GET /api/<modul>/status`.
2. Standardfelder liefern: `ok`, `module`, `moduleVersion`, `moduleBuild`, `version`, `enabled`, `routeCount`.
3. Standardisierten `diagnostics`-Block liefern.
4. Wenn diagnosefähig: Eintrag in `/api/diagnostics/registry` ergänzen.
5. Registry-Coverage testen und auf `coverage.ok = true` halten.
6. Keine neuen Dashboard-Diagnose-Extra-Dateien pro Modul anlegen.
7. Dokumentation aktualisieren: `docs/modules/[modul].md`, `docs/modules/README.md` bzw. Modulübersicht, `project-state/*`, `CHANGELOG.md`, `FILES.md`.

## Aktuelle Diagnose-Kernstruktur

- Backend-Registry: `backend/modules/diagnostics.js`
- Dashboard-Diagnose: `htdocs/dashboard/modules/diagnostics.js`
- Dashboard-Styling: `htdocs/dashboard/modules/diagnostics.css`
- Cleanup-Check: `tools/check/CAN-42.31_verify_diagnostics_cleanup.cmd`
