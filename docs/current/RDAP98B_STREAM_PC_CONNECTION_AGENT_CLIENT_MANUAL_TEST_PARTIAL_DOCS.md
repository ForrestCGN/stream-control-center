# RDAP98B_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PARTIAL_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Live-Test Teilbestaetigung / Stream-PC Agent Client

## Zweck

RDAP98B dokumentiert den durchgefuehrten RDAP98-Teiltest des RDAP96 Stream-PC Agent Clients.

Der Test hat bestaetigt, dass der Agent lokal startet und sichere Logs schreibt. Der vollstaendige Live-Heartbeat ueber public WSS wurde noch nicht bestaetigt, weil `wss://mods.forrestcgn.de/agent-ws` mit `404 Not Found` antwortete.

## Ausgangspunkt

```text
RDAP96:
- Heartbeat-only Stream-PC Agent Client unter remote-modboard/stream-pc-agent/ vorbereitet.
- Node built-ins only: net/tls/crypto.
- Keine externe ws-Abhaengigkeit.
- Agent kann ws:// und wss://.
- Agent setzt guarded Header fuer /agent-ws.
- Agent sendet minimalen Heartbeat.
- Agent loggt nur sichere Events.
- Keine Agent-Actions.
- Kein Backend-Code geaendert.

RDAP96B:
- Lokale Agent-Checks dokumentiert.

RDAP97:
- Manueller Agent-Testplan dokumentiert.
```

## RDAP98 Teiltest Ergebnis

Bestaetigt:

```text
Vorab disabled Status: OK
Runtime temporaer aktiviert: OK
Agent lokal auf Stream-PC gestartet: OK
PowerShell npm.ps1 Execution Policy erkannt: OK
npm.cmd als sichere lokale Alternative verwendet: OK
Agent schreibt sichere JSON-Logs: OK
Keine Secret-Ausgabe im geposteten Log: OK
Keine Authorization-/Bearer-Ausgabe im geposteten Log: OK
Keine Token-Laenge/kein Token-Hash im geposteten Log: OK
Runtime final wieder deaktiviert: OK
Actions bleiben false: OK
productiveAgentRuntime bleibt false: OK
```

Nicht vollstaendig bestanden:

```text
Public WSS /agent-ws: 404 Not Found
Heartbeat live ueber public WSS: noch nicht bestaetigt
```

## Beobachtete Agent-Logs

Der Agent startete lokal und loggte sichere Events:

```text
agent_starting
agent_connecting
agent_handshake_rejected reason=http_404_Not_Found
agent_socket_end
agent_disconnected_reconnect_scheduled
```

Das bedeutet:

```text
Der Agent erreicht die public Adresse wss://mods.forrestcgn.de/agent-ws.
Der public Pfad /agent-ws wird aber noch nicht korrekt zum Node-Backend 127.0.0.1:3010/agent-ws geproxied.
```

## Finaler Sicherheitszustand nach RDAP98

Forrest bestaetigte final:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Secret-Safety

Nicht in Chat, Doku, ZIP oder Git aufgenommen:

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

## Keine Actions

Weiterhin unveraendert:

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

## Bekannte Stolperstellen

```text
- Windows PowerShell blockiert ggf. npm.ps1 per Execution Policy.
- In diesem Fall npm.cmd start verwenden.
- Webserver-Konsole und Windows PowerShell klar trennen:
  - Webserver: root@web:/opt/stream-control-center/...
  - Windows/Stream-PC: PS D:\Git\stream-control-center\...
- Keine Windows-Pfade auf dem Linux-Webserver ausfuehren.
- stepdone.cmd nur lokal unter D:\Git\stream-control-center ausfuehren, nicht auf dem Webserver.
```

## Webserver-Deploy

Kein Webserver-Deploy noetig.

Begruendung:

```text
- RDAP98B ist Doku-only.
- Kein Backend-Code wird geaendert.
- Kein Agent-Code wird geaendert.
- Keine Nginx-Aenderung in diesem Step.
- Runtime bleibt disabled.
```

## Naechster sinnvoller Step

```text
RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN
```

Ziel:

```text
- Public Routing fuer /agent-ws pruefen.
- Nginx Serverblock fuer mods.forrestcgn.de gezielt analysieren.
- Plan fuer WebSocket Proxy nach 127.0.0.1:3010/agent-ws erstellen.
- Keine Runtime dauerhaft aktivieren.
- Keine Agent-Actions.
- Keine Secrets.
```
