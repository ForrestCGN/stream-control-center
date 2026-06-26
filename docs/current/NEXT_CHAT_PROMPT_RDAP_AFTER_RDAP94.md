# NEXT CHAT PROMPT - RDAP after RDAP94

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten. Erst Startdateien lesen, dann Plan nennen, dann auf `go` warten.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Neue Dateien nur, wenn Verantwortung fachlich wirklich getrennt ist.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Keine echten Secrets in Chat, Doku, ZIP oder Git.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN.md
docs/current/RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Aktueller Stand nach RDAP94

```text
RDAP94:
- Heartbeat read-only in-memory im bestehenden /agent-ws Runtime-Service vorbereitet.
- Keine neue Route.
- Keine parallele /agent-ws Struktur.
- Keine DB.
- Keine Actions.
- Keine Secrets.
```

## Naechster Step

```text
RDAP94B_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM
```

## Ziel RDAP94B

```text
- Lokal und live bestaetigen.
- Default AGENT_RUNTIME_ENABLED=false pruefen.
- AGENT_RUNTIME_ENABLED=true bewusst aktivieren.
- WebSocket HTTP 101 pruefen.
- Valid heartbeat senden.
- lastHeartbeatAt/heartbeatAgeMs/stale pruefen.
- Forbidden payload testen.
- Actions false bestaetigen.
- Runtime final wieder deaktivieren.
```
