# NEXT CHAT PROMPT - RDAP after RDAP94C

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
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` und erst nach `stepdone.cmd`.
- Doku-only Steps brauchen keinen Webserver-Deploy.
- Keine Funktionalitaet entfernen.
- Keine echten Secrets in Chat, Doku, ZIP oder Git.
- Keine Secret-Werte, Bearer-Token, Token-Laengen oder Token-Hashes ausgeben/loggen/dokumentieren.
- Bei Tests mit env: nicht `. /etc/stream-control-center/remote-modboard.env` sourcen, weil Werte mit Leerzeichen unquoted sein koennen; gezielt einzelne Werte sicher lesen/setzen.
- Sichtbar/Doku/Nutzerfokus: “Stream-PC Verbindung”, “Verbindungen”, “Webserver <-> Stream-PC”.
- Intern/Code/Route erlaubt: `agent`, `agent-status`, `/api/remote/agent/status`, `stream-pc-agent`, `/agent-ws`.

## Zuerst wirklich lesen

Lies aus GitHub/dev:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE.md
docs/current/RDAP94_FIX1_MODULE_BUILD_CONTEXT.md
docs/current/RDAP94C_LIVE_DEFAULT_CONFIRMED_AND_NEXT_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94C.md
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

## Aktueller Stand

RDAP94 ist gebaut:
- Bestehender guarded `/agent-ws` Transport wurde um minimalen Heartbeat-Receiver erweitert.
- Heartbeat ist read-only und in-memory.
- Keine neue Route.
- Keine parallele `/agent-ws` Struktur.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine Secret-Ausgabe.
- Status API: `rdap_agent94.v1`.
- Build: `RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE`.
- Heartbeat-Protokoll: `rdap-agent-heartbeat.v1`.

RDAP94_FIX1 ist gebaut:
- `remote-modboard/backend/server.js` wurde korrigiert.
- `MODULE_BUILD` wurde von `RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS` auf `RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE` gesetzt.
- Keine Heartbeat-Logik geaendert.
- Keine Runtime-Logik geaendert.
- Keine Actions.
- Keine DB.
- Keine Permission.
- Keine neue Route.
- Keine Secret-Ausgabe.

RDAP94C ist dokumentiert:
- RDAP94/RDAP94_FIX1 live Default bestaetigt.
- Build-Kontext ist live korrekt.
- Runtime ist im Default aus.
- HeartbeatReceiver ist im Default aus.
- Actions bleiben false.
- Productive Agent Runtime bleibt false.

## Live bestaetigter Zustand

Service:

```text
scc-remote-modboard.service
```

WorkingDirectory:

```text
/opt/stream-control-center/remote-modboard/backend
```

Service-Log zeigte:

```text
[remote-agent-runtime] RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE registered guarded transport runtime for /agent-ws. accepts=false, actions=false, heartbeat=false.
[remote-modboard] RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE listening on http://127.0.0.1:3010
```

`/api/remote/status` Header zeigte:

```text
X-Remote-Modboard-Build: RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

`/api/remote/agent/status` TSV-Check zeigte:

```text
rdap_agent94.v1 RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE false false false false false false
```

Zuordnung:

```text
statusApiVersion=rdap_agent94.v1
moduleBuild=RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
actionEnabled=false
productiveAgentRuntime=false
```

Wichtig: Der falsche Service-Name `stream-control-center-remote-modboard.service` existiert nicht. Der echte Service heisst:

```text
scc-remote-modboard.service
```

## Architektur

Intern:

```text
Node lokal: ws://127.0.0.1:3010/agent-ws
```

Oeffentlich spaeter:

```text
Stream-PC Agent -> wss://mods.forrestcgn.de/agent-ws
Nginx/TLS -> Node intern 127.0.0.1:3010/agent-ws
```

Der Stream-PC braucht keine Portfreigabe. Er verbindet aktiv zum Webserver.

## Heartbeat Payload erlaubt

```json
{
  "type": "heartbeat",
  "protocolVersion": "rdap-agent-heartbeat.v1",
  "agentId": "stream-pc-main",
  "agentVersion": "rdap94-test",
  "sentAt": "2026-06-26T18:00:00.000Z",
  "seq": 1
}
```

## Forbidden Fields

Payloads mit folgenden Feldern muessen sicher abgelehnt/ignoriert werden:

```text
capabilities
commands
requestedActions
actionQueue
obsState
soundState
overlayState
processList
fileList
env
paths
tokens
secrets
ip
hostname
freeUrls
shell
stdout
stderr
configDump
```

## Statusfelder

```text
lastHeartbeatAt
heartbeatAgeMs
heartbeatSeq
heartbeatProtocolVersion
stale
staleAfterMs=90000
offlineAfterMs=120000
plannedHeartbeatIntervalMs=30000
heartbeatRejectCount
lastHeartbeatRejectAt
lastHeartbeatRejectReason
```

## Secret-Safety

Nicht ausgeben, nicht dokumentieren, nicht loggen:

```text
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
Query-Werte
rohe IP-Adresse
roher Heartbeat-Payload
rohe Header
```

## Naechster sinnvoller Step

```text
RDAP94B_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM
```

Ziel:
- Runtime bewusst temporaer aktivieren.
- WebSocket 101 pruefen.
- Gueltigen Heartbeat senden.
- `lastHeartbeatAt`, `heartbeatAgeMs`, `heartbeatSeq`, `heartbeatProtocolVersion`, `stale=false` pruefen.
- Forbidden Heartbeat mit z. B. `commands` oder `secrets` testen.
- Sicher bestaetigen:
  - keine Actions
  - keine produktive Agent Runtime
  - keine DB
  - keine Secret-Ausgabe
  - keine Rohpayload-Ausgabe
- Runtime final wieder deaktivieren.
- Danach Doku-Step fuer Live-Confirm.

## Strikt nicht machen in RDAP94B

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
```

## Erwartete sichere Defaults

Bei `AGENT_RUNTIME_ENABLED=false`:

```text
statusApiVersion: rdap_agent94.v1
moduleBuild: RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Bitte jetzt

1. Erst die oben genannten Dateien wirklich aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP94B nennen.
3. Auf mein explizites `go` warten.
4. Keine Code-/ZIP-Erstellung vor `go`.
