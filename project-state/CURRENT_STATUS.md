# CURRENT_STATUS

Stand: RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD  
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
RDAP98B: RDAP98 Teiltest dokumentiert; public /agent-ws lieferte 404.
RDAP99: Nginx/ISPConfig Agent-WS Proxy Plan dokumentiert.
RDAP100B: Nginx/ISPConfig /agent-ws WebSocket Proxy live bestaetigt.
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt.
RDAP102: Stream-PC Verbindungsstatus UI-Plan dokumentiert.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung vorbereitet.
```

## Live-Service

```text
Service: scc-remote-modboard.service
WorkingDirectory: /opt/stream-control-center/remote-modboard/backend
Interner Dienst: http://127.0.0.1:3010
Public WSS: wss://mods.forrestcgn.de/agent-ws
```

## Live bestaetigter Build vor RDAP103 Deploy

```text
statusApiVersion=rdap_agent94.v1
moduleBuild=RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## RDAP103 Ergebnis

```text
Bestehende UI-Datei erweitert: remote-modboard/backend/public/assets/rdap80-agent-status.js
Veralteter RDAP80B-Hinweistext entfernt.
Status-Semantik verbunden/veraltet/offline ergaenzt.
Heartbeat-Detailanzeige verbessert.
Actions bleiben sichtbar deaktiviert.
Reload bleibt reiner Read-only Refresh.
Keine Start/Stop Buttons.
Keine Agent-Actions.
Keine Secrets.
```

## Final bestaetigter Sicherheitszustand vor RDAP103

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
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
RDAP103B_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD_LIVE_CONFIRM
```
