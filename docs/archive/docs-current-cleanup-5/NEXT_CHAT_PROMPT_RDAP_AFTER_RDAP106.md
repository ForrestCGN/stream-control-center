# NEXT CHAT PROMPT - RDAP after RDAP106

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
- Keine langen manuellen Deploy-Ketten als Standard.
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
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP106.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP104B:
- Server-Deploy-Wrapper live bestaetigt.
- Cleanup live bestaetigt.
- Neuer Ein-Befehl-Webserver-Deploy aktiv.

RDAP105:
- Doku-Inventur und Cleanup-Plan erstellt.
- docs/current und project-state als zu laut erkannt.

RDAP106:
- zentrale Current-State-Doku neu aufgebaut.
- PROJECT_OVERVIEW und ROADMAP aktualisiert.
- CURRENT_REMOTE_MODBOARD_STATE erstellt.
- CURRENT_DASHBOARD_STATE erstellt.
- CURRENT_STREAM_PC_AGENT_STATE erstellt.
- DOCS_STRUCTURE_AND_ARCHIVE_RULES erstellt.
- Historische Dateien nicht geloescht oder verschoben.
```

## Naechster sinnvoller Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- weitere Stream-PC-Verbindungsdetails nur read-only planen
- bestehende Agent-/Status-/UI-Dateien aus GitHub/dev lesen
- bestehende Admin-/Verbindungen-Seite bevorzugen
- pruefen, welche Statusfelder sicher angezeigt werden koennen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Runtime-Aktivierung.
Keine Secrets.
Keine Rohpayloads.
Keine parallele neue UI, wenn Erweiterung der bestehenden Seite passt.
```

## Bitte jetzt

1. Erst die oben genannten Dateien aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP107 nennen.
3. Auf explizites `go` warten.
