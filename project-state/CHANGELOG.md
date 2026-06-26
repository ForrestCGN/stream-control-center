# CHANGELOG

## 2026-06-26 - RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN

```text
- Heartbeat read-only Modell fuer Stream-PC Verbindung geplant.
- RDAP94 als naechsten Code-Step vorbereitet.
- Minimalen Heartbeat-Payload definiert:
  type, protocolVersion, agentId, agentVersion, sentAt, seq.
- Forbidden Payload Fields definiert.
- In-Memory-only Modell definiert.
- Statusfelder lastHeartbeatAt, heartbeatAgeMs, stale/offline geplant.
- plannedHeartbeatIntervalMs=30000, staleAfterMs=90000, offlineAfterMs=120000 dokumentiert.
- Testmatrix fuer spaeteren RDAP94-Code-Step dokumentiert.
- Keine Code-Aenderung.
- Kein Heartbeat-Receiver.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP92C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP92/RDAP92_FIX1/RDAP92B live bestaetigten Stand dokumentiert.
- RDAP92 Transport-Accept live bestaetigt.
- RDAP92_FIX1 config.service.js Export-Fix dokumentiert.
- /api/remote/status nach Fix wieder HTTP 200.
- Correct-Bearer Reject ohne AGENT_RUNTIME_ENABLED=true bestaetigt.
- AGENT_RUNTIME_ENABLED=true bewusst gesetzt und Runtime effective true bestaetigt.
- WebSocket HTTP 101 Switching Protocols bestaetigt.
- X-SCC-Agent-Runtime: rdap92-transport-only bestaetigt.
- X-SCC-Agent-Actions: disabled bestaetigt.
- connected true waehrend Verbindung bestaetigt.
- close/offline bestaetigt.
- Actions false bestaetigt.
- Heartbeat false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- AGENT_RUNTIME_ENABLED final wieder false bestaetigt.
- Naechsten Step RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```
