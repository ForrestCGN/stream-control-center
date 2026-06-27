# HISTORISCH / ARCHIVIERT

Diese Datei ist nicht mehr die aktuelle Startdatei fuer neue RDAP-/Remote-Modboard-Chats.
Aktueller Einstieg:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
project-state/TODO.md
project-state/PARKED_TODOS.md
```

Der Inhalt bleibt nur als historische Referenz erhalten.

---

# NEXT CHAT PROMPT - RDAP after RDAP104

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

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
- Neuer Standard nach RDAP104:
  `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev`

## Zuerst wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD.md
docs/current/RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP104.md
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
- Kein sudo mehr in den Standards.
- Maximal 6 Backups und 6 RDAP-Deploy-Clones werden behalten.
```

## Naechster sinnvoller Step

```text
RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRM
```

Ziel:
```text
- RDAP104 nach GitHub/dev deployen.
- Einmalig Fallback-Deploy nutzen, weil Wrapper vor RDAP104 noch nicht installiert ist.
- Pruefen, dass /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh existiert.
- Pruefen, dass /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh existiert.
- Bash-Syntaxchecks ausfuehren.
- Cleanup ausfuehren und pruefen, dass maximal 6 Backups/Deploy-Clones bleiben.
- Danach fuer kuenftige Steps nur noch Wrapper-Befehl verwenden.
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
```

## Bitte jetzt

1. Erst die oben genannten Dateien aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP104B nennen.
3. Auf explizites `go` warten.
