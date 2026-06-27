# NEXT CHAT PROMPT - RDAP after RDAP108

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

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
- Keine `apply_patch`-/Regex-/`Set-Content`-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach lokale Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nach Codeaenderungen in `remote-modboard/` erst nach `stepdone.cmd`.
- Auf dem Webserver als root arbeiten; kein sudo verwenden.
- Ab RDAP104B gilt fuer Webserver-Deploys:
  `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev`

## Zuerst wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP108.md
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
RDAP108:
- Bestehende Admin-/Verbindungen-Seite erweitert.
- Nur Frontend-Datei geaendert:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Zusaetzliche sichere Read-only-Details sichtbar:
  Agent-Version/Protokoll, Heartbeat-Seq/Alter, Runtime-Gates, Transportdetails, Heartbeat-Speicherung/Aktionsgrenzen.
- Technische Diagnose einklappbar.
- Keine Backend-Route geaendert.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine produktiven Writes.
```

## Naechster sinnvoller Step

```text
RDAP108B_STREAM_PC_CONNECTION_READONLY_UI_LIVE_CONFIRM
```

Ziel:

```text
- RDAP108 nach stepdone auf Webserver deployen.
- Admin / Verbindungen im Browser pruefen.
- /api/remote/agent/status kontrollieren.
- Sichtbare UI-Felder pruefen.
- Bestaetigen, dass weiterhin keine Runtime und keine Actions aktiv sind.
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
Keine Access-Key-/Token-/Header-/Cookie-Anzeige.
Keine Env-/Pfad-/Datei-/Prozesslisten.
```
