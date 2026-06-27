# NEXT CHAT PROMPT - RDAP / Remote-Modboard nach RDAP123

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

## Aktueller Live-Stand

RDAP123 ist live bestaetigt:

```text
version: 0.2.4
buildName: Routes-Status angeglichen
moduleBuild: Routes-Status angeglichen
runtimeMode: online
routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
localDashboardProfile.visibleLabel: Onlinemodus
localDashboardProfile.actionsEnabled: false
localDashboardProfile.productiveWritesEnabled: false
localDashboardProfile.agentActionsEnabled: false
localLanMode.routeStatusAligned: true
```

RDAP119 bis RDAP123 sind fachlich abgeschlossen:

- modulare UI/Foundation,
- Modulmanifest mit Metadaten, Rechten und Runtime-Scope,
- zentrale Sprachdateien `languages`,
- lokales Dashboard-Profil vorbereitet,
- `/status` und `/routes` konsistent.

## Modulregistrierung

Neue Module/Seiten muessen nach `docs/current/MODULE_REGISTRATION_RULES_CURRENT.md` registriert werden.

Kurzregel:

```text
Neue Hauptmenues entstehen ueber manifest.modules.
Neue Seiten entstehen ueber manifest.pages.
Seiten geben mit moduleId an, wo sie hingehoeren.
Runtime-Scope online/local/both und permission sind Pflicht.
Sprachtexte gehoeren in languages.
Backend entscheidet Sicherheit.
```

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions ohne separaten Sicherheits-Scope.
- Kein Webserver-Deploy bei Doku-only.

## Naechster sinnvoller technischer Fokus

Lokalen Stream-PC/LAN-Startbetrieb konkretisieren:

- lokale Env-/Start-Konfiguration dokumentieren,
- LAN-Zugriff fuer Forrest/Engel vorbereiten,
- weiterhin keine Agent-Actions,
- lokale Dashboard-Seiten nur planen oder read-only vorbereiten,
- bestehende modulare UI und Modulregistrierungsregeln nutzen.

## Aufgabe im neuen Chat

Lies zuerst die genannten Dateien wirklich aus GitHub/dev. Bestaetige kurz den aktuellen Stand. Nenne einen Plan fuer den naechsten RDAP-/Remote-Modboard-Step. Warte auf Forrests explizites `go`.
