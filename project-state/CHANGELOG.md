# CHANGELOG

## 2026-06-26 - RDAP94D_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM_DOCS

```text
- RDAP94B Live-Confirm dokumentiert.
- Bestaetigt: /agent-ws liefert temporaer aktiviert HTTP/1.1 101 Switching Protocols.
- Bestaetigt: X-SCC-Agent-Actions: disabled.
- Bestaetigt: X-SCC-Agent-Heartbeat: readonly-in-memory.
- Bestaetigt: gueltiger Heartbeat ist waehrend offener Verbindung sichtbar:
  connected=true
  connectionState=connected
  lastHeartbeatAt gesetzt
  heartbeatSeq=11
  heartbeatProtocolVersion=rdap-agent-heartbeat.v1
  stale=false
- Bestaetigt: Forbidden Heartbeat wird mit heartbeat_forbidden_fields abgelehnt.
- Bestaetigt: letzter gueltiger Heartbeat bleibt nach Forbidden Heartbeat unveraendert.
- Bestaetigt: lastHeartbeatPayloadStored=false.
- Bestaetigt: actionEnabled=false.
- Bestaetigt: productiveAgentRuntime=false.
- Bestaetigt: heartbeatExecutesActions=false.
- Bestaetigt: heartbeatAcceptsCommands=false.
- Bestaetigt: heartbeatAcceptsCapabilities=false.
- Bestaetigt: Runtime final wieder deaktiviert:
  runtime.requestedEnabled=false
  runtime.effectiveEnabled=false
  runtime.acceptsAgentConnections=false
  runtime.heartbeatReceiverEnabled=false
  agent.connected=false
  actionEnabled=false
  productiveAgentRuntime=false
- Dokumentiert: keine Secret-Ausgabe, keine Rohpayload-Ausgabe, keine DB-Migration, keine neue Permission, keine Agent-Actions.
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94D angelegt.
- Naechster Step: RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN.
- Doku-only; kein Code, keine DB, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP94C_LIVE_DEFAULT_CONFIRMED_AND_NEXT_PROMPT

```text
- RDAP94/RDAP94_FIX1 Live Default dokumentiert.
- Echter Systemd-Service dokumentiert: scc-remote-modboard.service.
- Live WorkingDirectory dokumentiert: /opt/stream-control-center/remote-modboard/backend.
- Service-Log mit RDAP94 Build-Kontext dokumentiert.
- /api/remote/status Header X-Remote-Modboard-Build mit RDAP94 dokumentiert.
- /api/remote/agent/status Default bestaetigt:
  statusApiVersion=rdap_agent94.v1
  moduleBuild=RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
  runtime.requestedEnabled=false
  runtime.effectiveEnabled=false
  runtime.acceptsAgentConnections=false
  runtime.heartbeatReceiverEnabled=false
  actionEnabled=false
  productiveAgentRuntime=false
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94C angelegt.
- Naechster Step: RDAP94B_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM.
- Doku-only; kein Code, keine DB, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP94_FIX1_MODULE_BUILD_CONTEXT

```text
- server.js MODULE_BUILD von RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS auf RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE gesetzt.
- Build-Kontext fuer createApp und registerAgentRuntime korrigiert.
- Keine Heartbeat-Logik geaendert.
- Keine Runtime-Logik geaendert.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## 2026-06-26 - RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE

```text
- Heartbeat read-only in-memory im bestehenden agent-runtime.service.js vorbereitet.
- Statusausgabe in agent-status.service.js auf Heartbeat-Felder erweitert.
- MODULE_BUILD auf RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE gesetzt.
- STATUS_API_VERSION auf rdap_agent94.v1 gesetzt.
- Minimaler WebSocket Textframe-Parser fuer Heartbeat-Payloads vorbereitet.
- Heartbeat Payload type=heartbeat/protocolVersion=rdap-agent-heartbeat.v1/agentId=stream-pc-main definiert.
- lastHeartbeatAt, heartbeatAgeMs, heartbeatSeq, stale/offline Ableitung vorbereitet.
- Forbidden Fields werden abgelehnt/ignoriert.
- Keine neue Route.
- Keine parallele /agent-ws Struktur.
- Keine DB.
- Keine Permission.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell/Datei/Prozess/URL-Ausfuehrung.
- Keine Secret-Ausgabe.
```
