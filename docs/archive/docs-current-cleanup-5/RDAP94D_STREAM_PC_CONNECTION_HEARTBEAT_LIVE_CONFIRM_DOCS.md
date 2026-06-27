# RDAP94D_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Stream-PC Verbindung / Heartbeat Live-Confirm

## Zweck

RDAP94D dokumentiert den erfolgreich durchgefuehrten Live-Confirm fuer RDAP94B.

RDAP94B hat bestaetigt, dass die vorbereitete Stream-PC-Verbindung ueber den bestehenden guarded `/agent-ws` Transport technisch funktioniert, aber weiterhin read-only und in-memory bleibt.

## Ausgangspunkt

```text
RDAP94:
- Bestehender guarded /agent-ws Transport wurde um minimalen Heartbeat-Receiver erweitert.
- Heartbeat ist read-only und in-memory.
- Keine neue Route.
- Keine parallele /agent-ws Struktur.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine Secret-Ausgabe.

RDAP94_FIX1:
- server.js MODULE_BUILD auf RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE korrigiert.
- Keine Heartbeat-Logik geaendert.
- Keine Runtime-Logik geaendert.
- Keine Actions.
- Keine DB.
- Keine Permission.
- Keine neue Route.
- Keine Secret-Ausgabe.

RDAP94C:
- Live Default nach Deploy bestaetigt.
- Runtime im Default aus.
- HeartbeatReceiver im Default aus.
- Actions false.
- Productive Agent Runtime false.
```

## Live-Service

```text
Service: scc-remote-modboard.service
WorkingDirectory: /opt/stream-control-center/remote-modboard/backend
Interner Dienst: http://127.0.0.1:3010
```

Der falsche Service-Name `stream-control-center-remote-modboard.service` wird nicht verwendet.

## RDAP94B Live-Confirm Ablauf

RDAP94B wurde als reiner Live-Test-/Confirm-Step durchgefuehrt.

```text
- Runtime temporaer bewusst aktiviert.
- WebSocket Upgrade auf /agent-ws getestet.
- Gueltiger Heartbeat gesendet.
- Status waehrend offener WebSocket-Verbindung gelesen.
- Forbidden Heartbeat mit verbotenem Feld getestet.
- Runtime final wieder deaktiviert.
```

## Bestaetigter WebSocket-Handshake

Der WebSocket-Test bestaetigte:

```text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
X-SCC-Agent-Runtime: rdap94-heartbeat-readonly
X-SCC-Agent-Actions: disabled
X-SCC-Agent-Heartbeat: readonly-in-memory
```

Es wurden keine Authorization-Werte, Bearer-Token, AGENT_ACCESS_KEY-Werte, Token-Laengen oder Token-Hashes dokumentiert.

## Bestaetigter gueltiger Heartbeat

Status waehrend offener WebSocket-Verbindung nach gueltigem Heartbeat:

```text
connected=true
connectionState=connected
lastHeartbeatAt gesetzt
heartbeatAgeMs klein
heartbeatSeq=11
heartbeatProtocolVersion=rdap-agent-heartbeat.v1
stale=false
lastHeartbeatPayloadStored=false
actionEnabled=false
productiveAgentRuntime=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

## Bestaetigter Forbidden Heartbeat

Nach einem Heartbeat mit verbotenem Feld wurde bestaetigt:

```text
heartbeatRejectCount stieg an
lastHeartbeatRejectReason=heartbeat_forbidden_fields
letzter gueltiger Heartbeat blieb unveraendert
lastHeartbeatPayloadStored=false
actionEnabled=false
productiveAgentRuntime=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

## Finaler deaktivierter Zustand

Nach dem Live-Confirm wurde `AGENT_RUNTIME_ENABLED=false` gesetzt und der Service neu gestartet.

Final bestaetigt:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Sicherheitsbestaetigung

RDAP94B/RDAP94D bestaetigt:

```text
- WebSocket 101 funktioniert nur bei temporaer aktivierter Runtime und gueltiger Verbindung.
- Heartbeat wird read-only und in-memory verarbeitet.
- Forbidden Fields werden abgelehnt.
- Keine Agent-Actions.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine produktiven Writes.
- Keine DB-Migration.
- Keine neue Permission.
- Keine produktive Agent-Action-Queue.
- Keine Secret-Ausgabe.
- Keine Rohpayload-Ausgabe.
- Runtime final wieder disabled.
```

## Bekannter Bedienhinweis

Die Web-/SSH-Konsole kann bei grossen Paste-Bloecken Heredocs oder lange `jq`-Bloecke kaputt einfuegen. Sichtbares Symptom war ein direkt angeklebter Prompt am Ende eines Befehls.

Fuer kuenftige Live-Tests gilt:

```text
- Keine riesigen kombinierten Paste-Bloecke.
- Besser kurze Einzelbefehle verwenden.
- Fuer groessere Node-Tests zuerst Datei unter /tmp schreiben, dann separat ausfuehren.
- Nach temporaerer Runtime-Aktivierung immer separaten finalen Disable-Check ausfuehren.
```

## Doku-only Hinweis

RDAP94D ist Doku-only.

```text
- Kein Backend-Code.
- Kein Frontend-Code.
- Keine DB.
- Keine Runtime-Aenderung.
- Kein Webserver-Deploy notwendig.
```

## Naechster sinnvoller Step

```text
RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN
```

Ziel von RDAP95:

```text
- Naechsten sicheren Step fuer einen minimalen Stream-PC Agent Client planen.
- Noch keine OBS-/Sound-/Overlay-/Command-Actions.
- Agent Client darf zunaechst nur Verbindung + Heartbeat koennen.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
```
