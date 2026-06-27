# RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Local Check / Stream-PC Agent Client

## Zweck

RDAP96B dokumentiert den lokalen Check-Step nach RDAP96.

RDAP96 hat den ersten minimalen Stream-PC Agent Client unter `remote-modboard/stream-pc-agent/` vorbereitet. RDAP96B bestaetigt nur die lokalen Syntax-/Package-Checks und den sicheren Arbeitsstand.

Es ist kein Webserver-Live-Test.

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
```

## Finaler Sicherheitszustand vor RDAP96B

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

## RDAP96B Scope

RDAP96B ist Doku-only.

```text
- Kein Agent-Code.
- Kein Backend-Code.
- Kein Frontend-Code.
- Keine Runtime-Aenderung.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Webserver-Deploy notwendig.
- Kein Webserver-Live-Test.
```

## Lokal zu bestaetigende Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\stream-pc-agent\src\agent-client.js
node --check .\remote-modboard\stream-pc-agent\src\config.js
node --check .\remote-modboard\stream-pc-agent\src\logger.js
npm --prefix .\remote-modboard\stream-pc-agent run check

git status --short
git diff --stat
```

## Erwartetes Ergebnis

```text
- node --check agent-client.js erfolgreich.
- node --check config.js erfolgreich.
- node --check logger.js erfolgreich.
- npm --prefix remote-modboard/stream-pc-agent run check erfolgreich.
- git status sauber nach stepdone.cmd.
```

## Agent-Dateien aus RDAP96

```text
remote-modboard/stream-pc-agent/package.json
remote-modboard/stream-pc-agent/src/agent-client.js
remote-modboard/stream-pc-agent/src/config.js
remote-modboard/stream-pc-agent/src/logger.js
remote-modboard/stream-pc-agent/README.md
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

## Secret-Safety

Nicht in Chat, Doku, ZIP oder Git aufnehmen:

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

## Webserver-Deploy

Kein Webserver-Deploy noetig.

Begruendung:

```text
- RDAP96B ist Doku-only.
- RDAP96 hat keinen Webserver-Backend-Code geaendert.
- Der Live-Webserver-Service verwendet die Stream-PC-Agent-Client-Dateien nicht.
- Runtime bleibt disabled.
```

## Naechster sinnvoller Step

```text
RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN
```

Ziel:

```text
- Separaten manuellen Testplan fuer den Agent Client erstellen.
- Runtime nur temporaer aktivieren.
- Agent nur manuell starten.
- Status ueber /api/remote/agent/status pruefen.
- Runtime final wieder deaktivieren.
- Keine Secrets im Chat.
- Keine Actions.
```
