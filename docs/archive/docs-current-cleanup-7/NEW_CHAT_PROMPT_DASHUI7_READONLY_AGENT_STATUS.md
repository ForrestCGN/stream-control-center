# Prompt für neuen Chat – DASHUI7 / Remote Agent Status read-only

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Bitte zuerst Projektgrundlagen beachten und nichts raten. GitHub/dev ist die primäre Prüfquelle, solange keine aktuelleren Live-Dateien oder ZIPs hochgeladen werden.

Repository:

- GitHub: `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Lokaler Server: `http://127.0.0.1:8080`
- Altes produktives Dashboard: `http://127.0.0.1:8080/dashboard/`
- Neues Dashboard-v2: `http://127.0.0.1:8080/dashboard-v2/`
- Produktive SQLite: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Remote-Modboard: `https://mods.forrestcgn.de`

Bitte zuerst diese Datei lesen:

1. `docs/current/START_HERE_FOR_NEW_CHAT.md`

Danach mindestens diese Dateien prüfen:

2. `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
3. `project-state/CURRENT_STATUS.md`
4. `project-state/NEXT_STEPS.md`
5. `project-state/TODO.md`
6. `project-state/FILES.md`
7. `docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md`
8. `docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md`
9. `docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md`
10. `docs/current/DASHBOARD_V2_STATIC_ROUTE.md`
11. `docs/current/WF1_FRONTEND_GIT_WORKFLOW.md`
12. `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
13. `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
14. `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`

Aktueller bestätigter Stand:

- `DASHUI6C / dashboard-v2 Static Route ergänzt und erfolgreich getestet`
- `http://127.0.0.1:8080/dashboard-v2/` läuft lokal.
- `http://127.0.0.1:8080/dashboard/` bleibt das alte produktive Dashboard.
- React/Vite-Quellcode liegt unter `frontend/dashboard-v2/`.
- Build-Output liegt unter `htdocs/dashboard-v2/`.
- Backend liefert `/dashboard-v2` über statische Route aus.
- `DASHBOARD_V2_DIR` wurde in `backend/core/paths.js` ergänzt.
- `/dashboard-v2` Static-/Index-Route wurde in `backend/server.js` ergänzt.
- Backend/Node wurde nach dem Backend-Step neu gestartet.
- `build-dashboard-v2.cmd` funktioniert und nutzt `call npm.cmd ...`.
- WF1 ist erledigt: `frontend/dashboard-v2/` wird vom Git-/StepDone-Workflow erfasst.
- Designbasis ist verbindlich `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`.

Wichtige Designbasis:

- Archiviert unter `docs/reference/dashboard-v2-design-test-v13/`
- Dokumentiert unter `docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md`
- Nicht davon abweichen.
- Topbar: Modulname + aktiver Tab inline, z. B. `Remote Agent • Übersicht`.
- Sidebar: Hauptkategorie -> Modul, Accordion, keine dritte Sidebar-Ebene.
- Stil: CGN Galaxy/Glassmorphism, dunkles Neon, keine generische Demo-Optik.

Nächster sinnvoller Schritt:

`DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen`

Empfehlung:

`Remote Agent Status`

DASHUI7 soll zuerst nur planen:

- Welche API-Endpunkte gibt es schon?
- Ob ein neuer read-only Endpoint nötig ist.
- Welche Daten der Remote-Agent-Status anzeigen soll.
- Welche Daten echte Backend-Daten sind und welche Placeholder bleiben.
- Wie Loading/Error/Offline/Online angezeigt werden.
- Welche Service-Dateien im Frontend betroffen wären.
- Welche Backend-Dateien betroffen wären, falls ein read-only Endpoint nötig ist.
- Welche Tests nötig sind.
- Ob Node-Neustart nötig wäre.

DASHUI7 soll noch nicht direkt Code erzeugen, bis ich ausdrücklich `go` sage.

Nicht in DASHUI7:

- keine Agent-Aktion ausführen
- kein produktives `agent.ping`
- kein Start/Stop
- keine Schreibfunktion
- keine DB-Änderung
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Media-Schreiboperation
- keine Overlay-Steuerung
- keine Commands/Kanalpunkte
- kein Login-System improvisieren
- keine produktiven Locks schreiben

Arbeitsregeln:

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
- Schritt-für-Schritt: erst prüfen/planen, dann auf `go` warten.

Bitte im neuen Chat zuerst den aktuellen Stand aus GitHub/dev zusammenfassen und dann DASHUI7 planen. Noch keinen Code erstellen, bis ich ausdrücklich `go` sage.
