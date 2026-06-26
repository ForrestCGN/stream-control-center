# CHANGELOG

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

## 2026-06-26 - RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED

```text
- Correct-Bearer-Reject-Only-Test auf dem Webserver live bestaetigt.
- AGENT_ACCESS_KEY wurde nur lokal aus /etc/stream-control-center/remote-modboard.env gelesen.
- Echter AGENT_ACCESS_KEY wurde nicht in Chat/Doku/Git/Status/UI/Logs dokumentiert.
- Bearer-Wert wurde nicht ausgegeben.
- Token-Laenge wurde nicht ausgegeben.
- Token-Hash wurde nicht ausgegeben.
- Correct Bearer bestaetigt: HTTP 503 / reason=runtime_not_effectively_enabled.
- /api/remote/agent/status mit statusApiVersion rdap_agent86.v1 bestaetigt.
- runtime.accessKeyConfigured true bestaetigt.
- runtime.acceptsAgentConnections false bestaetigt.
- runtime.effectiveEnabled false bestaetigt.
- rejectDiagnostic.lastRejectReason runtime_not_effectively_enabled bestaetigt.
- rejectDiagnostic.lastRejectAccessKeyConfigured true bestaetigt.
- rejectDiagnostic.lastRejectConnectionProofCompared true bestaetigt.
- secretsExposed false bestaetigt.
- bearerTokenLogged false bestaetigt.
- tokenLengthLogged false bestaetigt.
- tokenHashLogged false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- Keine akzeptierte Stream-PC Verbindung.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Naechsten Step RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```
