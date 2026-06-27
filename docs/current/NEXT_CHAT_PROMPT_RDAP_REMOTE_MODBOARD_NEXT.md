# NEXT CHAT PROMPT - RDAP / Remote-Modboard nach RDAP125

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
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Falls eine Datei fehlt: nicht improvisieren, exakt diese Datei aus `D:\Git\stream-control-center` anfordern.

## Aktueller Stand

Live bestaetigt:

```text
Version: 0.2.4
Buildname: Routes-Status angeglichen
runtimeMode: online
localDashboardProfile.visibleLabel: Onlinemodus
routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
```

RDAP124 ist abgeschlossen:

- Doku-Handoff aktualisiert.
- Modulregistrierungsregeln dokumentiert.
- Module/Seiten gehoeren ins zentrale Manifest.
- Neue Hauptmenuepunkte nur ueber `manifest.modules` und nur bei fachlich eigenem Modulbereich.

RDAP125 ist abgeschlossen:

- Lokales Stream-PC-/LAN-Env- und Startprofil dokumentiert.
- Backend-Env fuer `REMOTE_MODBOARD_MODE=online|local|lan` dokumentiert.
- Stream-PC-Agent-Env fuer `SCC_AGENT_*` dokumentiert.
- Forrest/Engel-LAN-Zielbild dokumentiert.
- Doku-only, keine Codeaenderung, kein Webserver-Deploy noetig.

## Naechster sinnvoller technischer Step

```text
RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN
```

Ziel:

- lokalen Dashboard-Hauptbereich im Modulmanifest planen,
- erste lokale read-only Seiten definieren,
- Runtime-Scope `local`/`both` sauber anwenden,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine DB-Migration,
- keine neuen produktiven Writes.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- Kein Webserver-Deploy bei Doku-only.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions ohne separaten Sicherheits-Scope.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer den naechsten RDAP-/Remote-Modboard-Step. Warte auf Forrests explizites `go`.
