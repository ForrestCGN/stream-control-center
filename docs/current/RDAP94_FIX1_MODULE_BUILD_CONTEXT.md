# RDAP94_FIX1_MODULE_BUILD_CONTEXT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Backend-Fix / Build-Kontext

## Ursache

Nach RDAP94 Deploy zeigte `/api/remote/agent/status`:

```text
statusApiVersion: rdap_agent94.v1
moduleBuild: RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

Damit war RDAP94-Code geladen, aber der globale Build-Kontext aus `server.js` blieb noch auf RDAP92.

## Fix

Geaendert:

```text
remote-modboard/backend/server.js
```

Von:

```text
RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

Auf:

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## Keine fachliche Aenderung

```text
- Keine Heartbeat-Logik geaendert.
- Keine Runtime-Logik geaendert.
- Keine Agent-Actions.
- Keine DB.
- Keine Permission.
- Keine neue Route.
- Keine Secret-Ausgabe.
```

## Erwartung nach Deploy

```text
statusApiVersion: rdap_agent94.v1
moduleBuild: RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
requestedEnabled: false
effectiveEnabled: false
acceptsAgentConnections: false
heartbeatReceiverEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```
