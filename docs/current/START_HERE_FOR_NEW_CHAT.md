# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY_TESTED

## Diese Datei zuerst lesen

In einem neuen Chat immer zuerst diese Datei lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach mindestens diese Dateien prüfen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md
docs/current/WF1_FRONTEND_GIT_WORKFLOW.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
```

## Repository und Pfade

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2: http://127.0.0.1:8080/dashboard-v2/
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
Übergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestätigter Stand

```text
RDAP4B remote_agent read-only Permission-, Lock- und Audit-Modellrouten getestet und per stepdone abgeschlossen
```

Bestätigt:

- Dashboard-v2 läuft lokal unter `/dashboard-v2/`.
- Bestehendes Dashboard bleibt unter `/dashboard/` produktiv.
- Dashboard-v2 Build-Output liegt unter `htdocs/dashboard-v2/`.
- Deploy-Workflow nimmt `htdocs/dashboard-v2/` mit nach Live.
- Dashboard-v2 zeigt sichtbar `Stream-PC Verbindung`.
- `backend/modules/remote_agent.js` ist weiterhin das vorhandene Modul für Remote-/Stream-PC-Anbindung; RDAP4B hat kein neues Modul angelegt.
- Node wurde nach RDAP4B neu gestartet und die API-Routen wurden getestet.

## Aktuelle RDAP4B API-Routen

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Bestätigte Sicherheitswerte:

```text
module: remote_agent
moduleVersion: 0.0.2
moduleBuild: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY
statusApiVersion: rdap4b.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Der Offline-Status ist aktuell korrekt, weil noch kein produktiver WSS-Agent existiert.

## Weiterhin bewusst nicht aktiv

```text
kein produktiver WSS-Agent
keine Agent-Actions
keine Schreibroute
keine DB-Migration
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Commands-/Kanalpunkte-Steuerung
keine Datei-/Shell-/Prozesssteuerung
```

## Wichtige aktuelle Dateien

```text
backend/modules/remote_agent.js
backend/server.js
backend/core/paths.js
frontend/dashboard-v2/
htdocs/dashboard-v2/
build-dashboard-v2.cmd
tools/deploy_repo_to_streamassets.ps1
tools/sync_streamassets_to_repo.ps1
tools/upload_streamassets_changes.ps1
testdeploy.cmd
stepdone.cmd
```

## Verbindliche Designbasis

Dashboard-v2 bleibt auf Designbasis V13 / Topbar Tab inline:

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
```

Wichtige Punkte:

- Galaxy-/Glassmorphism-Hintergrund
- feste Topbar
- kompakte Sidebar als Accordion
- Hauptkategorie -> Modul
- keine dritte Sidebar-Ebene
- Moduldetails innerhalb der Modulseite
- ruhige dunkle CGN-Neon-Flächen

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand prüfen, nicht raten.
- Vor Code-/ZIP-Änderungen Scope, betroffene Dateien, Nicht-Änderungen und Tests nennen.
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Bei fehlenden Dateien exakt diese Dateien anfordern.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen, löschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `_handoff`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- `stepundo.cmd` nutzen, wenn ein Teststand kaputt ist.

## Nächster sinnvoller Schritt

```text
RDAP4C_DASHBOARD_V2_SECURITY_MODEL_VIEW
```

Ziel:

- Dashboard-v2 zeigt die neuen RDAP4B read-only Modellrouten an.
- Bestehende Seite `Live -> Stream-PC` / `Stream-PC Verbindung` weiter nutzen.
- Keine neue Modulflut.
- Zusatzbereiche für Rollen/Permissions, Locks, Audit und Sicherheitsgrenzen anzeigen.
- Weiterhin keine Schreibbuttons und keine produktiven Aktionen.

Vor RDAP4C zuerst die echten aktuellen Frontend-Dateien prüfen, insbesondere:

```text
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/*
project-state/*
docs/current/*
```
