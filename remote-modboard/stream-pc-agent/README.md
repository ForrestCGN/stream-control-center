# Stream-PC Agent - RDAP96 heartbeat-only

Dieser Ordner enthaelt den ersten minimalen Stream-PC Agent Client fuer die Verbindung Webserver <-> Stream-PC.

## Status

RDAP96 ist bewusst minimal:

```text
- Nur Verbindung zu /agent-ws.
- Nur Heartbeat.
- Keine Agent-Actions.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine Prozessliste.
- Keine Dateiliste.
- Keine Env-Dumps.
- Keine Pfad-Dumps.
- Keine produktiven Writes.
- Keine DB-Migration.
- Keine Secret-Ausgabe.
- Keine Rohpayload-Ausgabe.
```

## Start

Erste Stufe: manuell starten. Kein Autostart, kein Windows-Dienst.

```powershell
cd D:\Git\stream-control-center\remote-modboard\stream-pc-agent
npm run check
npm start
```

## Lokale Umgebungswerte

Secrets gehoeren nicht ins Git und nicht in den Chat.

Beispiel fuer eine lokale PowerShell-Session, ohne echten Secret-Wert zu dokumentieren:

```powershell
$env:SCC_AGENT_WS_URL = "wss://mods.forrestcgn.de/agent-ws"
$env:SCC_AGENT_ID = "stream-pc-main"
$env:SCC_AGENT_NAME = "Forrest Stream-PC"
$env:SCC_AGENT_VERSION = "rdap96-heartbeat-only"
$env:SCC_AGENT_HEARTBEAT_INTERVAL_MS = "30000"
$env:SCC_AGENT_ACCESS_KEY = "<lokal-setzen-nicht-in-chat-oder-git>"
```

Diagnose gegen lokalen Node-Port nur bewusst verwenden:

```powershell
$env:SCC_AGENT_WS_URL = "ws://127.0.0.1:3010/agent-ws"
```

## Logging

Erlaubt sind nur sichere Statusmeldungen, zum Beispiel:

```text
agent_starting
agent_connecting
agent_connected
heartbeat_sent
agent_disconnected_reconnect_scheduled
agent_stopping
```

Nicht geloggt werden:

```text
AGENT_ACCESS_KEY / SCC_AGENT_ACCESS_KEY
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

## Live-Test-Regel

Runtime auf dem Webserver nicht dauerhaft aktivieren. Fuer einen spaeteren Live-Test gilt:

```text
1. Runtime bewusst temporaer aktivieren.
2. Agent manuell starten.
3. /api/remote/agent/status pruefen.
4. Runtime final wieder deaktivieren.
5. Finalen Disabled-Status pruefen.
```
