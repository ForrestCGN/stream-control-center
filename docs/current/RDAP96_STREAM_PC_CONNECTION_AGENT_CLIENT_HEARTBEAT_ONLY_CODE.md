# RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code / Stream-PC Agent Client / Heartbeat-only

## Zweck

RDAP96 erstellt die erste minimale Stream-PC-Agent-Komponente unter:

```text
remote-modboard/stream-pc-agent/
```

Der Agent Client kann zunaechst nur eine WebSocket-Verbindung zu `/agent-ws` aufbauen und Heartbeats senden.

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

RDAP94B/RDAP94D:
- WebSocket 101 live bestaetigt.
- Gueltiger Heartbeat war waehrend offener Verbindung sichtbar.
- Forbidden Heartbeat wurde sicher abgelehnt.
- Runtime final wieder deaktiviert.

RDAP95:
- Minimaler Stream-PC Agent Client geplant.
- Zunaechst nur Verbindung + Heartbeat.
- Geplanter Ort: remote-modboard/stream-pc-agent/.
```

## Finaler Sicherheitszustand vor RDAP96

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

## Neue Dateien

```text
remote-modboard/stream-pc-agent/package.json
remote-modboard/stream-pc-agent/src/agent-client.js
remote-modboard/stream-pc-agent/src/config.js
remote-modboard/stream-pc-agent/src/logger.js
remote-modboard/stream-pc-agent/README.md
```

## Agent-Funktionen in RDAP96

Erlaubt:

```text
- Config aus Umgebungsvariablen lesen.
- ws:// und wss:// WebSocket-Verbindung aufbauen.
- Guarded Header fuer /agent-ws setzen.
- Authorization intern setzen, ohne Wert zu loggen.
- Nach HTTP/1.1 101 Heartbeats senden.
- Heartbeat seq hochzaehlen.
- Heartbeat-Intervall default 30000ms.
- Reconnect mit Backoff.
- SIGINT/SIGTERM sauber behandeln.
- Sicheres Logging ohne Secrets/Header/Token/Rohpayloads.
```

Nicht erlaubt:

```text
- Agent-Actions.
- OBS-Steuerung.
- Sound-Ausloesung.
- Overlay-Schaltung.
- Command-/Channelpoints-Steuerung.
- freie Shell.
- freie Datei-/Prozess-/URL-Ausfuehrung.
- Prozessliste.
- Dateiliste.
- Env-Dumps.
- Pfad-Dumps.
- produktive Writes.
- DB-Migration.
- neue Permission.
- produktive Agent-Action-Queue.
- Secret-Ausgabe.
- Rohpayload-Ausgabe.
- Runtime dauerhaft aktivieren.
```

## Config-Modell

Der Agent liest nur Umgebungsvariablen. Keine `.env`-Datei wird automatisch geladen.

```text
SCC_AGENT_WS_URL=wss://mods.forrestcgn.de/agent-ws
SCC_AGENT_ID=stream-pc-main
SCC_AGENT_NAME=Forrest Stream-PC
SCC_AGENT_VERSION=rdap96-heartbeat-only
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
- Kein kompletter Config-Dump.
```

## Heartbeat

Der Agent sendet nur den minimalen Heartbeat:

```json
{
  "type": "heartbeat",
  "protocolVersion": "rdap-agent-heartbeat.v1",
  "agentId": "stream-pc-main",
  "agentVersion": "rdap96-heartbeat-only",
  "sentAt": "ISO-Zeit",
  "seq": 1
}
```

Der Agent sendet keine Forbidden Fields.

Forbidden Fields bleiben:

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

## Reconnect

Reconnect ist vorbereitet:

```text
2 Sekunden
5 Sekunden
10 Sekunden
30 Sekunden max
```

Es gibt kein aggressives Dauerfeuer.

## Logging

Erlaubte Log-Events:

```text
agent_starting
agent_connecting
agent_connected
heartbeat_sent
agent_socket_error
agent_disconnected_reconnect_scheduled
agent_stopping
agent_stopped
```

Nicht geloggt werden:

```text
SCC_AGENT_ACCESS_KEY
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

## Backend

RDAP96 aendert keinen Webserver-Backend-Code.

```text
remote-modboard/backend/server.js bleibt unveraendert.
remote-modboard/backend/src/services/agent-runtime.service.js bleibt unveraendert.
remote-modboard/backend/src/services/agent-status.service.js bleibt unveraendert.
```

## Erwartete Checks

```powershell
node --check .\remote-modboard\stream-pc-agent\src\agent-client.js
node --check .\remote-modboard\stream-pc-agent\src\config.js
node --check .\remote-modboard\stream-pc-agent\src\logger.js
npm --prefix .\remote-modboard\stream-pc-agent run check

git status --short
git diff --stat
```

## Webserver-Deploy

Kein Webserver-Deploy noetig, solange nur `remote-modboard/stream-pc-agent/` und Doku-Dateien geaendert wurden.

Der Live-Webserver-Service verwendet diese Agent-Client-Dateien nicht.

## Live-Test-Regel

RDAP96 bereitet den Agent Client vor. Ein Live-Test gegen den Webserver ist ein separater bewusster Schritt.

Wenn spaeter getestet wird:

```text
1. Runtime temporaer aktivieren.
2. Agent manuell starten.
3. /api/remote/agent/status pruefen.
4. Runtime final wieder deaktivieren.
5. Finalen Disabled-Status pruefen.
```

## Naechster sinnvoller Step

```text
RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS
```

Ziel:

```text
- Lokale Syntax-/Package-Checks auswerten.
- Optional lokalen Agent-Start nur ohne echten Secret-Wert erklaeren.
- Noch kein Webserver-Live-Test ohne separaten Plan.
- Danach naechsten sicheren Teststep planen.
```
