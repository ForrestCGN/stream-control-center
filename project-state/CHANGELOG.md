# CHANGELOG

## 2026-06-26 - RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN

```text
- Runtime-Accept Transport-disabled Code-Plan fuer Stream-PC Verbindung dokumentiert.
- RDAP92 als erster Backend-Code-Step fuer minimalen Transport-Accept vorbereitet.
- RDAP92 darf maximal WebSocket-Transport akzeptieren.
- Agent-Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Heartbeat moeglichst separat nach Transport-Accept planen.
- Keine zweite parallele /agent-ws Registrierung.
- Ab echtem Accept ist agent-runtime.service.js fachlich sinnvoll.
- Zwei-Stufen-Freigabe bleibt Pflicht.
- AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
- Testmatrix fuer spaeteren RDAP92-Code-Step dokumentiert.
- Rueckfall-/Deaktivierungsstrategie dokumentiert.
- Keine Code-Aenderung.
- Keine Runtime aktiviert.
- Keine Stream-PC Verbindung akzeptiert.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent online.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Naechsten Step RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN

```text
- Runtime-Accept disabled Build-Plan fuer Stream-PC Verbindung dokumentiert.
- Spaeterer Code-Step darf maximal Transport akzeptieren.
- Agent-Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Zweiter Code-/Build-Schalter als Pflicht dokumentiert.
- AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
- Keine zweite parallele /agent-ws Registrierung.
- Bestehende Module/Services bevorzugen.
- Heartbeat moeglichst separat nach Transport-Accept planen.
- Testmatrix fuer spaeteren Accept-Code-Step dokumentiert.
- Rueckfall-/Deaktivierungsstrategie dokumentiert.
- Keine Code-Aenderung.
- Keine Runtime aktiviert.
- Keine Stream-PC Verbindung akzeptiert.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent online.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Naechsten Step RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN

```text
- Runtime-Enable-Plan fuer Stream-PC Verbindung dokumentiert.
- Zwei-Stufen-Freigabe festgelegt.
- AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Spaetere Accept-Bedingungen fuer /agent-ws dokumentiert.
- Heartbeat/Online/Actions als getrennte Stufen dokumentiert.
- Mindesttests fuer spaeteren Accept-Code-Step dokumentiert.
- Keine Runtime aktiviert.
- Keine Stream-PC Verbindung akzeptiert.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent online.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Naechsten Step RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```
