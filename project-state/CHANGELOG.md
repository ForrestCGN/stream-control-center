# CHANGELOG

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

## 2026-06-26 - RDAP92_FIX1_CONFIG_EXPORT_RESTORE

```text
- Fix fuer RDAP92 Live-Fehler vorbereitet.
- Ursache: isDatabaseConfigured wurde von db-health.service.js importiert, war aber nach RDAP92 nicht mehr aus config.service.js exportiert.
- config.service.js exportiert wieder loadConfig, buildPublicConfigSummary und isDatabaseConfigured.
- Keine Runtime-Aenderung.
- Keine Agent-Actions.
- Kein Heartbeat.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## 2026-06-26 - RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS

```text
- Ersten Backend-Code-Step fuer minimalen Transport-Accept vorbereitet.
- Neue Datei remote-modboard/backend/src/services/agent-runtime.service.js erstellt.
- server.js nutzt jetzt registerAgentRuntime aus agent-runtime.service.js.
- Keine zweite parallele /agent-ws Registrierung.
- config.service.js um RDAP92 Zwei-Stufen-Gate erweitert.
- agent-status.service.js auf RDAP92 Runtime-/Connection-Status erweitert.
- package.json Check-Script um agent-runtime.service.js erweitert.
- Ohne AGENT_RUNTIME_ENABLED=true bleibt Correct Bearer reject-only.
- Mit AGENT_RUNTIME_ENABLED=true und Build-Gate kann maximal WebSocket-Transport akzeptiert werden.
- Agent-Actions bleiben false.
- productiveAgentRuntime bleibt false.
- HeartbeatReceiver bleibt false.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Naechsten Step RDAP92B_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_LIVE_CONFIRM vorbereitet.
```
