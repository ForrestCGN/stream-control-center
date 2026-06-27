# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Nutzerkommunikation mit Version und deutschem Buildnamen.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen
```

Umgesetzt:

- Dashboard-v2 visuell an Remote-Modboard/V13 angeglichen.
- Topbar mit Breadcrumb, Suche, Quick-Chips, Neu-laden-Optik, DE, Lock, Avatar/Userbereich.
- `body.is-scrolled .cgn-topbar` Verhalten fuer hellen Rand/Glow beim Scrollen uebernommen.
- Sidebar fixed, System/Module/Admin, aktive Dot-Markierung, Footer.
- Uebersicht mit Header, Metric-Karten, Aktivitaeten, Schnellzugriff.
- `System -> Stream-PC` aktiv/read-only.
- Nur bestehende GET-Routen:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- `/dashboard` bleibt unveraendert.
- Keine DB-Migration, keine Writes, keine Agent-Actions, kein Webserver-Deploy.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Readback.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- `/dashboard` nicht blind ersetzen.

## Naechster sinnvoller Arbeitsfokus

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```

Moeglicher Inhalt:

- vorhandenen Menuepunkt `Module -> Moduluebersicht` aktivieren,
- im V13/Modboard-Layout bleiben,
- nur bestehende sichere GET-Routen verwenden,
- lokale Module/Routenstatus anzeigen,
- keine parallelen Statuswege bauen,
- `/dashboard` stabil lassen,
- keine Aktionen/Writes.
