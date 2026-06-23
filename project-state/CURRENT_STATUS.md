# CURRENT STATUS

Stand: WF1 / Frontend Git Workflow korrigiert  
Datum: 2026-06-23

## Aktueller Dashboard-v2-Stand

Dashboard-v2 befindet sich im Parallelaufbau.

Technische Basis:

```text
frontend/dashboard-v2/
React + Vite
```

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

## Aktueller Workflow-Stand

WF1 korrigiert den Git-/Upload-Workflow.

Problem vorher:

```text
?? frontend/dashboard-v2/...
```

Der React-Code blieb nach `stepdone` untracked und wurde nicht nach GitHub/dev gepusht.

Korrektur:

- `stepdone.cmd` nimmt jetzt `frontend/` auf.
- `tools/upload_streamassets_changes.ps1` kennt jetzt `frontend/dashboard-v2/`.
- Sicherheitsblocker bleiben aktiv.
- `node_modules`, `dist`, `.vite`, Secrets, DBs und Archive bleiben ausgeschlossen.

## Nicht geändert

- kein Backend-Code
- kein bestehendes lokales Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Nächster sinnvoller Schritt

Nach Installation von WF1:

```text
stepdone ausführen und prüfen, dass frontend/dashboard-v2 nach GitHub/dev kommt
```

Danach:

```text
DASHUI6 / Build- und lokaler Auslieferungsweg prüfen
```
