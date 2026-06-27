# NEXT CHAT PROMPT - RDAP after RDAP107

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

GitHub/dev ist Wahrheit. Erst die Startdateien wirklich aus GitHub/dev lesen, dann Plan nennen, dann auf Forrests explizites `go` warten.

## Verbindliche Arbeitsweise

- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Neue Dateien nur, wenn Verantwortung fachlich wirklich getrennt ist.
- Keine `apply_patch`-/Regex-/`Set-Content`-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach lokale Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` oder Server-Workflow-Scripts und erst nach `stepdone.cmd`.
- Auf dem Webserver als root arbeiten; kein sudo verwenden.
- Ab RDAP104B gilt fuer Webserver-Deploys:
  `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev`

## Zuerst wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP107.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/public/assets/rdap80-agent-status.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/services/agent-status.service.js
```

## Aktueller Stand

```text
RDAP106:
- zentrale Current-State-Doku aufgebaut.

RDAP107:
- sichere Read-only-Verbindungsdetails geplant.
- bestehende Seite Admin / Verbindungen bleibt Ziel.
- bestehende API GET /api/remote/agent/status bleibt Datenquelle.
- keine Codeaenderung in RDAP107.
```

## Naechster sinnvoller Step

```text
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
```

Ziel:

```text
- bestehende Admin-/Verbindungen-Seite erweitern
- zusaetzliche sichere Read-only-Felder anzeigen
- keine neue Parallelseite
- moeglichst nur Frontend-Datei erweitern:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Backend nur anfassen, wenn vorhandene Felder nicht reichen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine Runtime-Aktivierung.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Secrets.
Keine Rohpayloads.
Keine parallele neue UI, wenn Erweiterung der bestehenden Seite passt.
Keine Access-Key-/Token-/Header-/Cookie-Anzeige.
Keine Env-/Pfad-/Datei-/Prozesslisten.
```

## Bitte jetzt

1. Erst die oben genannten Dateien aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP108 nennen.
3. Auf explizites `go` warten.
