# RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Testplan / Stream-PC Agent Client

## Zweck

RDAP97 erstellt den separaten manuellen Testplan fuer den RDAP96 Stream-PC Agent Client.

RDAP97 fuehrt den Test noch nicht aus. Es wird keine Runtime aktiviert und kein Agent gestartet.

## Ausgangspunkt

```text
RDAP94/RDAP94B/RDAP94D:
- Bestehender guarded /agent-ws Transport wurde um minimalen Heartbeat-Receiver erweitert.
- Heartbeat ist read-only und in-memory.
- WebSocket 101 wurde live bestaetigt.
- Gueltiger Heartbeat war waehrend offener Verbindung sichtbar.
- Forbidden Heartbeat wurde sicher abgelehnt.
- Runtime wurde final wieder deaktiviert.

RDAP95:
- Minimaler Stream-PC Agent Client geplant.
- Zunaechst nur Verbindung + Heartbeat.
- Geplanter Repo-Ort: remote-modboard/stream-pc-agent/.

RDAP96:
- Neue Agent-Komponente remote-modboard/stream-pc-agent/ erstellt.
- Node built-ins only: net/tls/crypto.
- Keine externe ws-Abhaengigkeit.
- Agent kann ws:// und wss://.
- Agent setzt guarded Header fuer /agent-ws.
- Agent sendet minimalen Heartbeat.
- Agent reconnectet mit Backoff.
- Agent loggt nur sichere Events.
- Keine Agent-Actions.
- Kein Backend-Code geaendert.
- Keine Runtime dauerhaft aktiviert.

RDAP96B:
- Lokale Checks fuer RDAP96-Agent-Dateien dokumentiert.
- Kein Webserver-Deploy noetig.
- Kein Webserver-Live-Test in RDAP96B.
```

## Finaler Sicherheitszustand vor RDAP97

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

## RDAP97 Scope

RDAP97 ist Doku-only.

```text
- Kein Agent-Code.
- Kein Backend-Code.
- Kein Frontend-Code.
- Keine Runtime-Aenderung.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Webserver-Deploy notwendig.
- Kein Webserver-Live-Test.
- Kein Agent-Start.
```

## Ziel des spaeteren manuellen Live-Tests

Der naechste separate Live-Test soll bestaetigen:

```text
- Runtime wird nur temporaer aktiviert.
- RDAP96-Agent kann manuell gestartet werden.
- Agent verbindet zu /agent-ws.
- Agent sendet minimalen Heartbeat.
- /api/remote/agent/status zeigt Verbindung und gueltigen Heartbeat.
- Agent sendet keine Forbidden Fields.
- Actions bleiben false.
- Productive Agent Runtime bleibt false.
- Runtime wird final wieder deaktiviert.
- Finaler disabled Status wird bestaetigt.
```

## Geplanter manueller Testablauf fuer RDAP98

Noch nicht ausfuehren. Nur als Plan fuer den naechsten Step.

### 1. Vorabstatus Webserver pruefen

```text
/api/remote/status erreichbar
/api/remote/agent/status zeigt Runtime disabled
```

Erwartet:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

### 2. Runtime temporaer aktivieren

Nur im spaeteren Live-Test-Step:

```text
AGENT_RUNTIME_ENABLED=true setzen
scc-remote-modboard.service neu starten
Readiness pruefen
```

Wichtig:

```text
Runtime-Aktivierung nur temporaer.
Kein dauerhaftes Aktivlassen.
Nach dem Test immer final deaktivieren.
```

### 3. Agent-Secret nur lokal setzen

Secret-Safety:

```text
SCC_AGENT_ACCESS_KEY nur lokal setzen.
Nicht in Chat posten.
Nicht in Doku schreiben.
Nicht in Git speichern.
Nicht in Logs ausgeben.
Keine Token-Laenge dokumentieren.
Keinen Token-Hash dokumentieren.
```

### 4. Agent manuell starten

Geplanter Startort:

```powershell
cd D:\Git\stream-control-centeremote-modboard\stream-pc-agent
```

Geplanter manueller Start:

```powershell
npm start
```

Der Agent darf dabei nur sichere Logs ausgeben, z. B.:

```text
agent_starting
agent_connecting
agent_connected
heartbeat_sent
agent_disconnected_reconnect_scheduled
agent_stopping
```

Nicht erlaubt in Logs:

```text
SCC_AGENT_ACCESS_KEY
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
rohe Header
rohe IP-Adresse
rohe Heartbeat-Payloads
komplette Config-Dumps
```

### 5. Status waehrend laufendem Agent pruefen

Geplante Statusfelder:

```text
connected=true
connectionState=connected
lastHeartbeatAt gesetzt
heartbeatAgeMs klein
heartbeatSeq >= 1
heartbeatProtocolVersion=rdap-agent-heartbeat.v1
stale=false
lastHeartbeatPayloadStored=false
actionEnabled=false
productiveAgentRuntime=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

### 6. Agent stoppen

Geplant:

```text
Agent manuell mit Ctrl+C stoppen.
Agent loggt agent_stopping / agent_stopped ohne Secrets.
```

### 7. Runtime final deaktivieren

Nach dem Test zwingend:

```text
AGENT_RUNTIME_ENABLED=false setzen
scc-remote-modboard.service neu starten
Readiness pruefen
/api/remote/agent/status final pruefen
```

Erwartet final:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Sicherheitsgrenzen bleiben unveraendert

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
Keine Runtime dauerhaft aktivieren.
```

## Webserver-Deploy

Kein Webserver-Deploy noetig.

Begruendung:

```text
- RDAP97 ist Doku-only.
- Kein Backend-Code wird geaendert.
- Kein Agent-Code wird geaendert.
- Runtime bleibt disabled.
```

## Naechster sinnvoller Step

```text
RDAP98_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_LIVE
```

Ziel:

```text
- Den in RDAP97 geplanten manuellen Test tatsaechlich durchfuehren.
- Mit kurzen Einzelbefehlen arbeiten.
- Runtime temporaer aktivieren.
- Agent manuell starten.
- Status pruefen.
- Agent stoppen.
- Runtime final deaktivieren.
- Keine Secrets im Chat.
- Keine Actions.
```
