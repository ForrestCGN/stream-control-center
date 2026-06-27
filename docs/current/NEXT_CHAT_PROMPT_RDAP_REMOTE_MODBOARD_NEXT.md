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

- Dashboard-v2 visuell weiter an Remote-Modboard/V13 angenaehert.
- Topbar mit Breadcrumb, Suche, Quick-Chips, Neu-laden-Optik, DE, Lock, Avatar/Userbereich.
- `body.is-scrolled .cgn-topbar` Verhalten fuer hellen Rand/Glow beim Scrollen vorbereitet.
- Sidebar fixed, System/Module/Admin, aktive Dot-Markierung, Footer.
- Uebersicht mit Header, Metric-Karten, Aktivitaeten, Schnellzugriff.
- `System -> Stream-PC` aktiv/read-only.
- Nur bestehende GET-Routen:
  - `/api/_status`
  - `/api/stream-status/current`
  - `/api/diag/ws`
- `/dashboard` bleibt unveraendert.
- Keine DB-Migration, keine Writes, keine Agent-Actions, kein Webserver-Deploy.

## Wichtiger Sichttest-Hinweis

Forrest hat nach 0.2.10C gemeldet:

```text
Die Leiste oben sieht nicht gut aus.
```

Darum nicht direkt mit 0.2.11 weitermachen. Erst die Topbar sauber korrigieren.

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
0.2.10D - Dashboard-v2 Topbar V13 exakt nachziehen
```

Vor dem Plan unbedingt lesen:

```text
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/reference/dashboard-v2-design-test-v13/index.html
docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.css
docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
frontend/dashboard-v2/src/layout/Topbar.jsx
frontend/dashboard-v2/src/layout/AppShell.jsx
frontend/dashboard-v2/src/styles/global.css
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/app/moduleRegistry.js
```

Ziel:

- Topbar im lokalen Dashboard-v2 exakt gegen Netz-Modboard/V13 angleichen.
- Hoehe, Spalten, Abstaende, Breadcrumb, Suche, Quick-Chips, Refresh, DE, Lock und Avatar/Userbereich korrigieren.
- `body.is-scrolled .cgn-topbar` inklusive hellem Rand/Glow/Shadow sauber testen.
- Keine fachliche Erweiterung, bevor die Topbar passt.
- `/dashboard` stabil lassen.
- Keine Backend-/DB-/Action-Aenderungen.

Danach erst:

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```
