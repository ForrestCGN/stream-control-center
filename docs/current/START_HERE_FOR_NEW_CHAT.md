# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: DASHUI6C / Dashboard-v2 lokal erreichbar

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
```

## Aktueller bestätigter Stand

```text
DASHUI6C / dashboard-v2 Static Route ergänzt und erfolgreich getestet
```

Bestätigt:

- `http://127.0.0.1:8080/dashboard-v2/` läuft lokal.
- `http://127.0.0.1:8080/dashboard/` bleibt das alte produktive Dashboard.
- React/Vite-Quellcode liegt unter `frontend/dashboard-v2/`.
- Build-Output liegt unter `htdocs/dashboard-v2/`.
- Backend liefert `/dashboard-v2` über statische Route aus.
- Node/Backend wurde nach DASHUI6C neu gestartet.
- WF1 ist erledigt: `frontend/dashboard-v2/` wird vom Git-/StepDone-Workflow erfasst.
- Designbasis ist V13 / Topbar Tab inline.

## Wichtige aktuelle Dateien

### Dashboard-v2 Quellcode

```text
frontend/dashboard-v2/
```

### Dashboard-v2 Build-Output

```text
htdocs/dashboard-v2/
```

### Build-Helper

```text
build-dashboard-v2.cmd
```

Dieser nutzt bewusst:

```text
npm.cmd
```

und in `.cmd` korrekt:

```text
call npm.cmd ...
```

### Backend Static Route

```text
backend/core/paths.js
backend/server.js
```

Neu in `paths.js`:

```js
DASHBOARD_V2_DIR: path.join(ROOT_DIR, "htdocs", "dashboard-v2"),
```

Neu in `server.js`:

```js
app.use("/dashboard-v2", express.static(paths.DASHBOARD_V2_DIR, PUBLIC_STATIC_OPTIONS));
```

und Index-Fallback für:

```text
/dashboard-v2
/dashboard-v2/
```

## Verbindliche Designbasis

Die verbindliche Designbasis für Dashboard-v2 ist:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

Sie ist im Repo archiviert unter:

```text
docs/reference/dashboard-v2-design-test-v13/
```

Dokumentiert unter:

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
```

Wichtige Designpunkte:

- Galaxy-/Glassmorphism-Hintergrund
- feste Topbar
- Topbar mit Breadcrumb links
- aktiver Modul-Tab inline in der Topbar, z. B. `Remote Agent • Übersicht`
- Suchfeld in der Topbar
- Status-Chips in der Topbar
- Sprachbutton, Benachrichtigung und Userbereich rechts
- kompakte Sidebar
- Sidebar als Accordion
- Hauptkategorie -> Modul
- keine dritte Sidebar-Ebene
- Modul-Tabs innerhalb der Modulseite
- ruhige dunkle CGN-Neon-Flächen
- keine generische Demo-Dashboard-Optik

## Workflow-Stand

WF1 ist erledigt.

Das Problem vorher:

```text
?? frontend/dashboard-v2/...
```

ist behoben.

`stepdone.cmd` nimmt jetzt `frontend/` auf.  
`tools/upload_streamassets_changes.ps1` kennt `frontend/dashboard-v2/`.

Weiterhin verboten/zu schützen:

```text
node_modules
dist
.vite
.env
SQLite/DB-Dateien
Archive
Backups
Secrets
Token-/Secret-/Credential-Pfade
```

## Nächster sinnvoller Schritt

```text
DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen
```

Empfehlung:

```text
Remote Agent Status
```

Aber nur planen und zuerst read-only.

Nicht direkt bauen, bis Forrest ausdrücklich `go` sagt.

## DASHUI7-Regeln

DASHUI7 soll zunächst planen:

- Welche bestehende oder neue API wird für Remote-Agent-Status gebraucht?
- Welche Daten zeigt die Seite?
- Wie bleibt das read-only?
- Was ist echter Status, was ist Placeholder?
- Welche späteren Agent-/WSS-Infos werden vorbereitet?
- Wie wird Offline/Online angezeigt?
- Welche Fehler-/Loading-Zustände braucht die Seite?

DASHUI7 darf nicht:

- keine Agent-Aktion ausführen
- kein produktives `agent.ping`
- kein Start/Stop
- keine Schreibfunktion
- keine DB-Änderung
- keine OBS-/Sound-/Media-/Overlay-Steuerung
- keine Commands/Kanalpunkte
- kein Login-System improvisieren
- keine produktiven Locks schreiben

## Arbeitsregeln

- Nicht raten.
- Fehlende Dateien konkret anfordern.
- Vor jedem Step zuerst echten Repo-/Dateistand prüfen.
- Umsetzung nur nach explizitem `go`.
- Keine bestehende Funktionalität entfernen.
- Keine produktive DB löschen, ersetzen oder droppen.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Vollständige Dateien liefern, keine Schnipsel-Patches.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- Bei Doku-Step klar sagen: kein Node-Neustart nötig.
- Bei Backend-Step klar sagen: Node-Neustart nötig.
- StepDone erst nach Einspielen/Deploy und Test.
- Tests/Diagnose getrennt von normaler Konfiguration halten.
- Keine alten Stände oder Parallelstrukturen erfinden.
- Wenn GitHub-Ausgabe gekürzt/unvollständig ist, Datei vom Nutzer anfordern.
- Schritt-für-Schritt arbeiten: erst prüfen/planen, dann auf `go` warten.
