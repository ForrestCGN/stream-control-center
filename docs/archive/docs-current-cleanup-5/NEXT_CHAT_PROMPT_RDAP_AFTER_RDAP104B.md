# NEXT CHAT PROMPT - RDAP after RDAP104B

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
docs/current/RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD.md
docs/current/RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP.md
docs/current/RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP104B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
tools/remote-modboard-deploy.sh
tools/server/remote-modboard-deploy-step.sh
tools/server/remote-modboard-cleanup-backups.sh
```

## Aktueller Stand

RDAP103:

```text
- Stream-PC Verbindung UI Read-only-Kachel live sichtbar.
- Status offline ist korrekt, weil Runtime final disabled.
- Actions deaktiviert.
```

RDAP104:

```text
- Server-Deploy-Wrapper vorbereitet.
- Backup-/Deploy-Cleanup vorbereitet.
- Deploy-Engine installiert Server-Hilfsscripte nach /opt/stream-control-center/tools/server.
```

RDAP104B:

```text
- RDAP104 wurde live bestaetigt.
- Wrapper liegt auf dem Webserver.
- Cleanup-Script liegt auf dem Webserver.
- Bash-Syntaxchecks sind sauber.
- Cleanup wurde live ausgefuehrt.
- Maximal 6 Backups und 6 RDAP-Deploy-Clones werden behalten.
- Neuer Standardbefehl ist aktiv:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Naechster sinnvoller Step

```text
RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- Naechste sinnvolle Stream-PC-Verbindungsdetails nur read-only planen.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine DB-Migration.
- Keine produktiven Writes.
- Bestehende Agent-/Status-/UI-Struktur aus GitHub/dev pruefen.
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
Keine parallele neue UI, wenn bestehende Admin-/Verbindungen-Seite passt.
```

## Bitte jetzt

1. Erst die oben genannten Dateien aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP105 nennen.
3. Auf explizites `go` warten.
