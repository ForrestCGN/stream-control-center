# RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Plan / Stream-PC Agent Client

## Zweck

RDAP95 plant den naechsten sicheren Schritt nach RDAP94B/RDAP94D: einen minimalen Stream-PC Agent Client.

Der Agent Client soll zunaechst nur eine Verbindung zum Webserver herstellen und Heartbeats senden. Er darf noch keine Stream-Funktionen ausfuehren.

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

RDAP94B:
- Runtime temporaer bewusst aktiviert.
- WebSocket 101 auf /agent-ws bestaetigt.
- Gueltiger Heartbeat waehrend offener Verbindung sichtbar bestaetigt.
- Forbidden Heartbeat sicher abgelehnt.
- Actions false bestaetigt.
- Productive Runtime false bestaetigt.
- Runtime final wieder deaktiviert.

RDAP94D:
- Live-Confirm dokumentiert.
- GitHub/dev enthaelt getesteten Doku-Stand.
```

## Finaler Sicherheitszustand nach RDAP94B/RDAP94D

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

## Zielbild fuer den Stream-PC Agent Client

```text
Stream-PC Agent -> wss://mods.forrestcgn.de/agent-ws
Nginx/TLS -> Node intern 127.0.0.1:3010/agent-ws
```

Wichtig:

```text
- Der Stream-PC verbindet aktiv zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Dynamische IP am Stream-PC ist egal.
- Der Webserver bleibt die zentrale Stelle fuer Login/Rechte/Status.
- Agent-Actions bleiben bis zu separater Freigabe deaktiviert.
```

## RDAP95 Scope

RDAP95 ist nur Plan/Doku.

```text
- Kein Agent-Code.
- Kein Backend-Code.
- Kein Frontend-Code.
- Keine Runtime-Aenderung.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Webserver-Deploy notwendig.
```

## Geplanter spaeterer Agent-Ort im Repo

Vorschlag fuer den spaeteren Code-Step nach RDAP95:

```text
remote-modboard/stream-pc-agent/
```

Begruendung:

```text
- Der Agent gehoert fachlich zur Webserver <-> Stream-PC Verbindung.
- Er ist kein lokales Overlay-/Dashboard-Modul.
- Er ist kein Backend-Service des Webservers.
- Er braucht eigene Start-/Config-/Logging-Dateien.
- Trotzdem bleibt er im remote-modboard-Kontext und baut keine parallele Agent-Welt neben /agent-ws.
```

Moegliche spaetere Dateien:

```text
remote-modboard/stream-pc-agent/package.json
remote-modboard/stream-pc-agent/src/agent-client.js
remote-modboard/stream-pc-agent/src/config.js
remote-modboard/stream-pc-agent/src/logger.js
remote-modboard/stream-pc-agent/README.md
```

Das ist noch keine Freigabe zur Erstellung dieser Dateien. RDAP95 dokumentiert nur den Plan.

## Startmodus

Erste sichere Stufe:

```text
- Manueller Start auf dem Stream-PC.
- Keine automatische Installation als Dienst.
- Kein Autostart.
- Kein Hintergrundprozess ohne sichtbaren Start.
```

Spaeter separat planbar:

```text
- Windows Autostart.
- Windows Dienst.
- Restart-Verhalten.
- lokale Statusanzeige.
```

## Konfigurationsmodell

Keine Secrets im Git.

Geplante Umgebungs-/Config-Werte spaeter:

```text
SCC_AGENT_WS_URL=wss://mods.forrestcgn.de/agent-ws
SCC_AGENT_ID=stream-pc-main
SCC_AGENT_NAME=Forrest Stream-PC
SCC_AGENT_VERSION=<build/version>
SCC_AGENT_ACCESS_KEY=<nur lokal, niemals Git/Chat/Doku>
SCC_AGENT_HEARTBEAT_INTERVAL_MS=30000
```

Secret-Regeln:

```text
- SCC_AGENT_ACCESS_KEY niemals in Git.
- Kein Token im Chat.
- Keine Token-Laenge.
- Kein Token-Hash.
- Kein Authorization Header im Log.
- Keine Cookies im Log.
- Keine Query-Werte im Log.
- Keine Rohpayloads im Log.
```

## Verbindung und Heartbeat

Der Agent soll spaeter nur:

```text
1. Config lesen.
2. WebSocket-Verbindung zu /agent-ws oeffnen.
3. Guarded Header setzen.
4. Nach 101 Switching Protocols Heartbeats senden.
5. Bei Verbindungsabbruch reconnecten.
6. Sauber beenden koennen.
```

Heartbeat-Intervall:

```text
plannedHeartbeatIntervalMs=30000
```

Erlaubter Heartbeat-Payload bleibt minimal:

```json
{
  "type": "heartbeat",
  "protocolVersion": "rdap-agent-heartbeat.v1",
  "agentId": "stream-pc-main",
  "agentVersion": "rdap95-planned-agent",
  "sentAt": "ISO-Zeit",
  "seq": 1
}
```

## Reconnect-Verhalten

Geplant:

```text
- Reconnect bei Socket close/error.
- Backoff mit kleiner Startzeit.
- Maximalwartezeit begrenzen.
- Kein aggressives Dauerfeuer.
- Status lokal nur knapp loggen.
```

Vorschlag:

```text
Start: 2 Sekunden
Dann: 5 Sekunden
Dann: 10 Sekunden
Max: 30 Sekunden
```

## Logging

Erlaubt:

```text
- agent gestartet
- config vorhanden/nicht vorhanden, ohne Werte
- connecting
- connected
- disconnected
- reconnect geplant
- heartbeat sent seq=<Nummer>
- heartbeat interval ms
- safe error reason ohne Secrets
```

Nicht erlaubt:

```text
- AGENT_ACCESS_KEY
- Authorization Header
- Bearer Token
- Token-Laenge
- Token-Hash
- Cookies
- rohe Header
- rohe IP-Adresse
- rohe Heartbeat-Payloads
- komplette Config-Dumps
- lokale absolute Secret-Pfade, wenn sie sensible Namen/Werte enthalten
```

## Strikte Sicherheitsgrenzen fuer den ersten Agent-Client

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
```

## Forbidden Fields bleiben verboten

Der Agent Client darf im Heartbeat nicht senden:

```text
capabilities
commands
requestedActions
actionQueue
obsState
soundState
overlayState
processList
fileList
env
paths
tokens
secrets
ip
hostname
freeUrls
shell
stdout
stderr
configDump
```

## Naechster sinnvoller Code-Step nach RDAP95

```text
RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE
```

Ziel von RDAP96 waere:

```text
- Minimalen Agent-Client als eigene, klare Komponente vorbereiten.
- Nur Verbindung + Heartbeat.
- Kein Backend-Code, falls nicht noetig.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine Secrets im Git.
```

## Erwartete Checks fuer RDAP96 spaeter

Nur als Vorschau, nicht Teil von RDAP95:

```text
node --check remote-modboard/stream-pc-agent/src/agent-client.js
node --check remote-modboard/stream-pc-agent/src/config.js
node --check remote-modboard/stream-pc-agent/src/logger.js
npm --prefix remote-modboard/stream-pc-agent run check
```

Live-Test spaeter nur bewusst und kurz:

```text
- Runtime temporaer aktivieren.
- Agent manuell auf Stream-PC oder Testumgebung starten.
- /api/remote/agent/status pruefen.
- Runtime final wieder deaktivieren.
```

## Doku-only Hinweis

RDAP95 ist Doku-only.

```text
- Kein Backend-Code.
- Kein Frontend-Code.
- Kein Agent-Code.
- Keine DB.
- Keine Runtime-Aenderung.
- Kein Webserver-Deploy notwendig.
```
