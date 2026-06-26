# CHANGELOG

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
