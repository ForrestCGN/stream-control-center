# CURRENT_STATUS

Stand: RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell live bestaetigt

```text
RDAP94: Heartbeat read-only in-memory Code vorbereitet.
RDAP94_FIX1: server.js Build-Kontext auf RDAP94 gesetzt.
RDAP94C: Live Default nach Deploy bestaetigt.
RDAP94B: Heartbeat Live-Confirm erfolgreich durchgefuehrt.
RDAP94D: Live-Confirm dokumentiert.
RDAP95: Minimaler Stream-PC Agent Client geplant.
RDAP96: Heartbeat-only Stream-PC Agent Client vorbereitet.
RDAP96B: Lokale Agent-Checks dokumentiert.
RDAP97: Manueller Agent-Testplan dokumentiert.
```

## Live-Service

```text
Service: scc-remote-modboard.service
WorkingDirectory: /opt/stream-control-center/remote-modboard/backend
Interner Dienst: http://127.0.0.1:3010
```

## Live bestaetigter Build

```text
statusApiVersion=rdap_agent94.v1
moduleBuild=RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## Final bestaetigter Sicherheitszustand

Nach RDAP94B wurde die Runtime wieder deaktiviert:

```text
AGENT_RUNTIME_ENABLED=false
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## RDAP97 dokumentiert

```text
Separater manueller Testplan fuer RDAP96-Agent-Client erstellt.
Runtime nur temporaer aktivieren.
Agent nur manuell starten.
Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
/api/remote/agent/status pruefen.
Gueltigen Heartbeat bestaetigen.
Runtime final wieder deaktivieren.
Finalen disabled Status pruefen.
Keine Actions.
Kein Backend-Code geaendert.
Kein Agent-Code geaendert.
Kein Webserver-Deploy noetig.
```

## Sicherheitsgrenzen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine DB-Migration.
Keine neue Permission.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
```

## Naechster empfohlener Step

```text
RDAP98_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_LIVE
```
