# RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Backend-Code / Stream-PC Verbindung / Heartbeat Read-only In-Memory

## Zweck

RDAP94 erweitert den bestehenden guarded `/agent-ws` Transport um einen minimalen Heartbeat-Receiver.

## Wichtig

```text
- Bestehende Runtime-/Status-Services erweitert.
- Keine neue parallele /agent-ws Struktur.
- Keine neue Route.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine Secret-Ausgabe.
```

## Geaenderte Dateien

```text
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/package.json
```

## Runtime Build

```text
MODULE_BUILD=RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
STATUS_API_VERSION=rdap_agent94.v1
HEARTBEAT_PROTOCOL_VERSION=rdap-agent-heartbeat.v1
```

## Heartbeat

Erlaubter Payload:

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

## Sicherheitsgrenzen

```text
actionsEnabled=false
productiveAgentRuntime=false
productiveActionsEnabled=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
heartbeatPersistsToDatabase=false
```

## Forbidden Fields

Payloads mit folgenden Feldern werden abgelehnt/ignoriert:

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

Nicht ausgegeben/gespeichert:

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

## Erwartete lokale Checks

```powershell
node --check .\remote-modboard\backend\src\services\agent-runtime.service.js
node --check .\remote-modboard\backend\src\services\agent-status.service.js
npm --prefix .\remote-modboard\backend run check
git status --short
```

## Erwartete Live-Checks

```text
Default AGENT_RUNTIME_ENABLED=false:
- runtime false
- heartbeatReceiverEnabled false
- acceptsAgentConnections false
- actions false

Mit AGENT_RUNTIME_ENABLED=true:
- runtime true
- heartbeatReceiverEnabled true
- acceptsAgentConnections true
- actions false
- valid heartbeat setzt lastHeartbeatAt
- heartbeatAgeMs klein
- stale false
- forbidden payload wird sicher abgelehnt
```
