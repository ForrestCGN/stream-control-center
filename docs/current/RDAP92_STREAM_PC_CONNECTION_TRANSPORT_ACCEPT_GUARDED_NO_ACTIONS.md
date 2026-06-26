# RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Backend-Code / Stream-PC Verbindung / Transport-Accept guarded / no actions

## Zweck

RDAP92 ist der erste Backend-Code-Step fuer einen minimalen Transport-Accept der Stream-PC Verbindung.

Wichtig:

```text
- Maximal WebSocket-Transport.
- Keine Agent-Actions.
- Kein produktiver Heartbeat-Receiver.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Umsetzung

```text
Neu:
remote-modboard/backend/src/services/agent-runtime.service.js

Geaendert:
remote-modboard/backend/server.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/package.json

Nicht geaendert:
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Laufzeitmodell

```text
Gate 1:
AGENT_RUNTIME_ENABLED=true

Gate 2:
RDAP92 Build-Gate im Code:
acceptBuildEnabled=true

Nur wenn beide Gates true sind:
- acceptsAgentConnections=true
- wssRuntimeEnabled=true
- effectiveEnabled=true
```

Ohne `AGENT_RUNTIME_ENABLED=true` bleibt das Verhalten sicher:

```text
- Correct Bearer wird serverseitig verglichen.
- Request wird weiter abgelehnt.
- reason=runtime_not_effectively_enabled.
```

## Transport-Accept

Bei beiden aktiven Gates und korrektem Request:

```text
- Pfad exakt /agent-ws.
- Agent-ID exakt stream-pc-main.
- Protocol exakt rdap-agent-handshake.v1.
- Authorization Bearer vorhanden.
- AGENT_ACCESS_KEY serverseitig gesetzt.
- Bearer stimmt.
- WebSocket Upgrade Header gueltig.
- Keine aktive Verbindung mit gleicher Agent-ID.
```

Dann wird nur der WebSocket-Transport akzeptiert.

## Verbindungsstatus

In-Memory-only:

```text
connected
connectionState
agentId
agentName
agentVersion
protocolVersion
connectedSince
lastSeenAt
reconnectCount
closeReason
```

Keine DB-Persistenz.

## Actions bleiben deaktiviert

Auch bei akzeptiertem Transport:

```text
actionsEnabled=false
productiveAgentRuntime=false
agentActions=false
remoteWritesControlled=true
```

## Heartbeat bleibt deaktiviert

RDAP92 verarbeitet keinen produktiven Heartbeat.

```text
heartbeatReceiverEnabled=false
lastHeartbeatAt=null
heartbeatAgeMs=null
stale=false
```

Heartbeat/Stale/Offline wird separat geplant.

## Secret-Safety

Nicht sichtbar/logged:

```text
AGENT_ACCESS_KEY
Bearer Token
Bearer Token Laenge
Bearer Token Hash
Authorization Header Value
komplette Header
Cookies
Query-Werte
rohe IP-Adresse
lokale absolute Pfade
freie Prozesslisten
freie Dateiinfos
```

## Sichere Reject-Gruende

```text
runtime_not_effectively_enabled
missing_agent_id
unknown_agent_id
missing_connection_proof
invalid_connection_proof
protocol_version_unsupported
access_key_not_configured
invalid_websocket_upgrade
agent_already_connected
```

## Erwartete lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\agent-runtime.service.js
node --check .\remote-modboard\backend\src\services\agent-status.service.js
npm --prefix .\remote-modboard\backend run check

git status --short
```

## Erwartete Live-Checks nach Deploy

Vor Aktivierung:

```text
statusApiVersion=rdap_agent92.v1
runtime.acceptBuildEnabled=true
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

Correct Bearer ohne `AGENT_RUNTIME_ENABLED=true`:

```text
HTTP 503
reason=runtime_not_effectively_enabled
```

Nach bewusstem Setzen von `AGENT_RUNTIME_ENABLED=true` auf dem Webserver:

```text
runtime.requestedEnabled=true
runtime.effectiveEnabled=true
runtime.acceptsAgentConnections=true
```

Correct Bearer mit gueltigem WebSocket Upgrade:

```text
HTTP 101 Switching Protocols
agent.connected=true
actionsEnabled=false
productiveAgentRuntime=false
heartbeatReceiverEnabled=false
```

Zweite Verbindung gleicher Agent-ID:

```text
HTTP 503
reason=agent_already_connected
```

Socket Close:

```text
agent.connected=false
connectionState=offline
actionsEnabled=false
productiveAgentRuntime=false
```

## Harte Grenzen weiterhin

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Dateioperation.
Keine freie Prozessausfuehrung.
Keine freie URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine Admin-Notes-Aenderung.
Keine Secret-Ausgabe.
```

## Naechster sinnvoller Step

```text
RDAP92B_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_LIVE_CONFIRM
```

Ziel:

```text
- RDAP92 lokal und live bestaetigen.
- Status vor Aktivierung pruefen.
- Correct-Bearer-Reject ohne AGENT_RUNTIME_ENABLED=true pruefen.
- AGENT_RUNTIME_ENABLED=true bewusst auf Webserver setzen.
- Correct-Bearer WebSocket Accept pruefen.
- Connected/Close Status pruefen.
- Secret-Safety pruefen.
- Keine Actions.
```
