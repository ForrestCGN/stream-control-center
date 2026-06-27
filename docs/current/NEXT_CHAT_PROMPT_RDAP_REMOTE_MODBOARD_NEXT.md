# NEXT CHAT PROMPT - RDAP / Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Direkt, pragmatisch, keine unnoetigen Wiederholungen.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Wenn Scripts `_handoff`-Logs erzeugen: in Doku zusammenfassen, bewusst committen oder lokal loeschen. Nicht untracked liegen lassen.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
```

Falls eine Datei fehlt: nicht improvisieren, exakt diese Datei aus `D:\Git\stream-control-center` anfordern.

## Aktueller Stand

Live bestaetigt:

```text
v0.2.4 - Routes-Status angeglichen
runtimeMode: online
localDashboardProfile.visibleLabel: Onlinemodus
localDashboardProfile.actionsEnabled: false
localDashboardProfile.productiveWritesEnabled: false
localDashboardProfile.agentActionsEnabled: false
routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
```

Abgeschlossen:

```text
RDAP119 - Modulare UI/Foundation
RDAP120 - Modul-Metadaten und Rechte
RDAP121 - Zentrale Sprachdateien
RDAP122 - Lokales Dashboard-Profil
RDAP123 - Routes-Status angeglichen
RDAP124 - Doku-Handoff und Modulregistrierungsregeln
RDAP125 - Lokales Stream-PC-/LAN-Env- und Startprofil
RDAP126 - Lokales Dashboard Modul-Shell-Plan
```

## Naechster sinnvoller technischer Step

```text
RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY
```

Ziel:

1. Echte Dateien aus GitHub/dev lesen.
2. Bestehende Modulregistrierungsregeln anwenden.
3. `local-dashboard` im Modulmanifest technisch anlegen.
4. Drei lokale read-only Seiten minimal vorbereiten:
   - `stream-pc-status`,
   - `lan-connections`,
   - `local-runtime-help`.
5. Sprachdateien `de.js` und `en.js` um die geplanten Keys ergaenzen.
6. Page-Scripte unter `remote-modboard/backend/public/assets/modules/local-dashboard/` erstellen.
7. Runtime-Scope `local` sauber verwenden.
8. Keine Actions aktivieren.
9. Keine DB-Migration.
10. Keine neuen produktiven Writes.

## Relevante echte Dateien fuer RDAP127 zuerst lesen

```text
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei vor Plan + `go`.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup/Rollback und Read-Back-Pruefung.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine Shell-/Datei-/Prozess-Actions.
- Keine Funktionen entfernen.
- Keine parallele Navigation ausserhalb Manifest erfinden.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer `RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY` mit betroffenen Dateien, Tests und Nicht-Zielen. Warte auf Forrests explizites `go`.
