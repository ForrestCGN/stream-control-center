# CURRENT STATUS

Stand: DASHUI6C / Dashboard-v2 lokal erreichbar und Übergabe vorbereitet  
Datum: 2026-06-23

## Aktueller Dashboard-v2-Stand

Dashboard-v2 läuft lokal:

```text
http://127.0.0.1:8080/dashboard-v2/
```

Altes Dashboard bleibt produktiv:

```text
http://127.0.0.1:8080/dashboard/
```

Technische Basis:

```text
frontend/dashboard-v2/
React + Vite
```

Build-Output:

```text
htdocs/dashboard-v2/
```

## Build-Stand

`build-dashboard-v2.cmd` funktioniert.

Wichtig:

- nutzt `npm.cmd`
- in `.cmd` korrekt mit `call npm.cmd ...`
- Build erzeugt `htdocs/dashboard-v2/index.html` und Assets

## Backend-Stand

DASHUI6C ist erledigt.

Neu:

- `DASHBOARD_V2_DIR` in `backend/core/paths.js`
- statische Route `/dashboard-v2` in `backend/server.js`
- Index-Fallback für `/dashboard-v2` und `/dashboard-v2/`

Backend/Node wurde nach Änderung neu gestartet.

## Workflow-Stand

WF1 ist erledigt.

- `frontend/dashboard-v2/` wird vom Git-/StepDone-Workflow erfasst.
- `stepdone.cmd` nimmt `frontend/` auf.
- `tools/upload_streamassets_changes.ps1` kennt `frontend/dashboard-v2/`.

## Designbasis

Verbindliche Designbasis:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

Archiviert unter:

```text
docs/reference/dashboard-v2-design-test-v13/
```

Dokumentiert unter:

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
```

## Nicht geändert

- altes Dashboard nicht ersetzt
- keine produktive SQLite geändert
- keine OBS-Änderung
- keine produktive Agent-Aktion
- keine Schreibfunktionen im Dashboard-v2

## Nächster sinnvoller Schritt

```text
DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen
```

Empfehlung:

```text
Remote Agent Status
```
