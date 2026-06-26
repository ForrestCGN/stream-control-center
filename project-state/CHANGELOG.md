# CHANGELOG

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
