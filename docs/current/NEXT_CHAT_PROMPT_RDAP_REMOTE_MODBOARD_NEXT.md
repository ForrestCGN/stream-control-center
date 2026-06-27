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
- Nutzerkommunikation mit Version und deutschem Buildnamen. Interne RDAP-Step-IDs nur fuer ZIP/Commit/Deploy/Handoff verwenden.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

Aktueller vorbereiteter Stand:

```text
0.2.10 - Stream-PC Status read-only vorbereitet
```

Umgesetzt:

- `System -> Stream-PC` in `/dashboard-v2` aktiviert.
- Neue lokale Read-only-Seite fuer Stream-PC Status vorbereitet.
- Nur bestehende GET-Routen genutzt: `/api/_status`, `/api/stream-status/current`, `/api/diag/ws`.
- Server-, Modul-, Routen-, WebSocket- und gecachter Streamstatus sichtbar.
- Keine Refresh-/Test-/Log-/Session-/Schreibrouten.
- Keine Buttons, Actions oder Steuerfunktionen.
- `/dashboard` bleibt unveraendert.
- Keine DB-Migration, keine Writes, keine Agent-Actions.
- Kein Webserver-Deploy noetig.

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

Vor dem Plan unbedingt lesen:

```text
backend/server.js
backend/modules/diagnostics.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/services/apiClient.js
frontend/dashboard-v2/src/services/localStatusClient.js
frontend/dashboard-v2/src/modules/stream-pc/StreamPcStatusPage.jsx
```

Moeglicher Inhalt:

- vorhandenen Menuepunkt `Module -> Moduluebersicht` aktivieren,
- nur bestehende sichere lokale Status-/Diagnose-Daten lesen,
- geladene lokale Module und geplante Migrationsbereiche anzeigen,
- keine parallelen Statuswege bauen,
- `/dashboard` stabil lassen,
- keine Aktionen/Writes.
