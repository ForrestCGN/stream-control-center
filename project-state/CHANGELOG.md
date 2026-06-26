# CHANGELOG

## 2026-06-26 - RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED

```text
- Handshake-Precheck im bestehenden disabled /agent-ws Guard vorbereitet.
- server.js MODULE_BUILD auf RDAP85 gesetzt.
- agent-runtime-disabled.service.js erweitert.
- agent-status.service.js auf rdap_agent85.v1 erweitert.
- /api/remote/agent/status zeigt Handshake-Precheck-Summary.
- /api/remote/status .agent zeigt sichere Handshake-Precheck-Summary.
- /api/remote/routes .agentStatusFoundation zeigt sichere Handshake-Precheck-Summary.
- Sichere Ablehnungsgruende ergaenzt:
  - runtime_not_effectively_enabled
  - missing_agent_id
  - unknown_agent_id
  - missing_connection_proof
  - invalid_connection_proof
  - protocol_version_unsupported
- Diagnose bleibt in-memory only.
- Header-Werte, Authorization-Werte, Cookie-Werte, Query-Werte und rohe IPs werden nicht gespeichert oder geloggt.
- Verbindungen werden weiterhin mit 503 abgelehnt.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
- Keine Secret-Ausgabe.
```

## 2026-06-26 - RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN

```text
- Access-Key-Handshake-Plan fuer Stream-PC Verbindung dokumentiert.
- Geplanter Header-Vertrag dokumentiert:
  - Authorization: Bearer <secret>
  - X-SCC-Agent-Id: stream-pc-main
  - X-SCC-Agent-Version: <version>
  - X-SCC-Agent-Protocol: rdap-agent-handshake.v1
- Zwei-Stufen-Freigabe festgelegt.
- AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Geplante sichere Ablehnungsgruende dokumentiert.
- Sichtbare Diagnosegrenzen dokumentiert.
- Keine Runtime-Aktivierung.
- Keine akzeptierte Verbindung.
- Keine DB.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Doku-only.
```

## 2026-06-26 - RDAP83B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP83 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent83.v1 bestaetigt.
- rejectDiagnosticPrepared true bestaetigt.
- rejectDiagnosticInMemoryOnly true bestaetigt.
- /agent-ws Reject-Test mit HTTP 503 und reason=agent_runtime_disabled bestaetigt.
- rejectCount steigt nach Test von 0 auf 1.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- secretsExposed false bestaetigt.
- headersLogged false bestaetigt.
- rawIpLogged false bestaetigt.
- Naechsten Step RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN vorbereitet.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC

```text
- /agent-ws Reject-Diagnose vorbereitet.
- Diagnose bleibt in-memory only.
- Reject-Zaehler fuer abgelehnte /agent-ws Verbindungsversuche ergaenzt.
- Letzte sichere Ablehnung wird ohne Secret-/Header-/Cookie-/Query-/IP-Werte gespeichert.
- agent-runtime-disabled.service.js erweitert.
- agent-status.service.js auf rdap_agent83.v1 erweitert.
- /api/remote/agent/status zeigt rejectDiagnostic.
- /api/remote/status .agent zeigt sichere Reject-Summary.
- /api/remote/routes .agentStatusFoundation zeigt sichere Reject-Summary.
- server.js MODULE_BUILD auf RDAP83 gesetzt.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
- Keine Secret-Ausgabe.
```

## 2026-06-26 - RDAP82B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP82 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent82.v1 bestaetigt.
- runtime.skeletonPrepared true bestaetigt.
- runtime.effectiveEnabled false bestaetigt.
- runtime.wssRuntimeEnabled false bestaetigt.
- runtime.heartbeatReceiverEnabled false bestaetigt.
- runtime.acceptsAgentConnections false bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- noAgentActions true bestaetigt.
- Safety-Block bestaetigt.
- Naechsten Step RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC vorbereitet.
- Doku-only.
- Kein Code.
- Kein Backend.
- Keine DB-Migration.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON

```text
- Runtime-disabled Skeleton fuer Stream-PC Verbindung vorbereitet.
- server.js auf RDAP82 Build gesetzt.
- Disabled Upgrade-Guard fuer /agent-ws registriert.
- Neue Datei agent-runtime-disabled.service.js erstellt.
- Agent Runtime Config in config.service.js vorbereitet.
- AGENT_RUNTIME_ENABLED wird gelesen, bleibt aber effective false.
- AGENT_ACCESS_KEY wird nur als configured Boolean behandelt.
- agent-status.service.js auf rdap_agent82.v1 erweitert.
- /api/remote/status zeigt RDAP82 Agent-Summary.
- /api/remote/routes zeigt RDAP82 Agent-Foundation.
- Keine package.json/ws Dependency-Aenderung.
- Keine akzeptierte Agent-Verbindung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
```

## 2026-06-26 - RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN

```text
- Stream-PC-Verbindungs-Handshake geplant.
- Interne Agent-ID bestaetigt: stream-pc-main.
- Agent-Name bestaetigt: Forrest Stream-PC.
- Zugangsschluessel-Konzept dokumentiert.
- WSS-Pfad /agent-ws als geplanter Pfad bestaetigt.
- Heartbeat-Modell uebernommen: 30s Intervall, 90s stale, 120s offline.
- Erste Runtime-Stufe als In-Memory only geplant.
- Keine DB-Persistenz ohne separaten Plan.
- Keine produktiven Actions.
- Keine Backend-Aenderung.
- Keine package.json-Aenderung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
- Doku-only.
```
