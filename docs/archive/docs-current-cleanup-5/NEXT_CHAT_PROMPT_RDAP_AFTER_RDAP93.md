# NEXT CHAT PROMPT - RDAP after RDAP93

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
- Doku-only braucht keinen Webserver-Deploy.
- Keine echten Secrets in Chat, Doku, ZIP oder Git.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN.md
docs/current/RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN.md
docs/current/RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN.md
docs/current/RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS.md
docs/current/RDAP92_FIX1_CONFIG_EXPORT_RESTORE.md
docs/current/RDAP92C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP93.md
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

## Aktueller Stand nach RDAP93

```text
RDAP92/RDAP92B:
- Minimaler /agent-ws Transport-Accept live bestaetigt.
- Zwei-Stufen-Gate funktioniert.
- Correct Bearer allein reicht nicht.
- HTTP 101 Switching Protocols mit beiden Gates bestaetigt.
- Connected/Close Status bestaetigt.
- Actions false.
- Heartbeat false.
- Runtime final wieder deaktiviert.

RDAP93:
- Heartbeat read-only Modell geplant.
- Doku-only.
- Kein Code.
- Keine Runtime-Aktivierung.
- Keine Actions.
- Keine DB.
- Keine Secrets.
```

## Naechster empfohlener Step

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## RDAP94 Ziel

```text
- Bestehende Runtime-/Status-Services erweitern.
- Keine neue parallele /agent-ws Struktur.
- Heartbeat-Frames auf bestehender Verbindung lesen.
- Nur type=heartbeat akzeptieren.
- Nur protocolVersion=rdap-agent-heartbeat.v1 akzeptieren.
- Nur agentId=stream-pc-main akzeptieren.
- lastHeartbeatAt setzen.
- heartbeatAgeMs berechnen.
- stale/offline aus Zeit ableiten.
- In-Memory-only.
- Keine DB.
- Keine Actions.
- Keine Secrets.
```

## Heartbeat Payload

```json
{
  "type": "heartbeat",
  "protocolVersion": "rdap-agent-heartbeat.v1",
  "agentId": "stream-pc-main",
  "agentVersion": "string",
  "sentAt": "2026-06-26T18:00:00.000Z",
  "seq": 1
}
```

## Harte Grenzen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine produktive Agent-Action-Queue.
Keine Capabilities-Freigabe.
Keine Secret-Ausgabe.
Kein AGENT_ACCESS_KEY im Repo.
Kein AGENT_ACCESS_KEY im Chat.
Kein Bearer-Token in Status/UI/Logs.
Keine Token-Laenge und kein Token-Hash in Status/UI/Logs.
Keine Rohpayload-Ausgabe.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst GitHub/dev inklusive RDAP93 und die Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP94 Heartbeat read-only in-memory Code. Kein Code/ZIP vor deinem go.
```
