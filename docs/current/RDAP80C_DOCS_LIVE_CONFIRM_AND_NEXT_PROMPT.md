# RDAP80C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Live-Bestaetigung / naechster Chat-Prompt

## Zweck

RDAP80C dokumentiert den live bestaetigten Abschluss des ersten Stream-PC-Verbindungsblocks nach RDAP79.

Wichtig: Die sichtbare UI spricht ab jetzt nicht mehr von einem eigenen Hauptmodul `Agent`, sondern von:

```text
Admin -> Verbindungen
Seite: Stream-PC Verbindung
```

Der Begriff `agent` darf intern fuer Route/Service/Code weiter verwendet werden, weil der Stream-PC spaeter technisch als Agent arbeitet. Fuer Navigation, Doku-Fokus und Nutzerkommunikation ist aber `Stream-PC Verbindung` bzw. `Verbindungen` die richtige Sprache.

## Live bestaetigt

### RDAP80

```text
RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION
```

Bestaetigt auf dem Webserver:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.routes[] | select(.path=="/api/remote/agent/status")'
```

Ergebnis:

```text
/api/remote/status enthaelt .agent
/api/remote/agent/status liefert ok:true
/api/remote/routes listet /api/remote/agent/status
connectionState: offline
actionEnabled: false
productiveAgentRuntime: false
plannedTransport: wss
plannedDirection: stream-pc-agent-to-webserver
plannedWsPath: /agent-ws
streamPcPublicPortRequired: false
```

### RDAP80B

```text
RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS
```

Bestaetigt auf dem Webserver:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.agent.connectionState, .actionEnabled, .productiveAgentRuntime'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.routes[] | select(.path=="/api/remote/agent/status")'
```

Ergebnis:

```text
"offline"
false
false

GET /api/remote/agent/status ist weiterhin registriert.
```

## Sichtbarer Stand im Browser

Zu pruefen bzw. Zielzustand:

```text
https://mods.forrestcgn.de/
Admin -> Verbindungen
Seite: Stream-PC Verbindung
Status: offline / disabled
Heartbeat: —
keine Action-Buttons
kein eigenes Hauptmodul Agent
```

## Aktueller technischer Stand

```text
GET /api/remote/agent/status existiert.
Die Route ist read-only.
Die Route schreibt nichts.
Die Route fuehrt keine Aktionen aus.
/api/remote/status enthaelt einen strukturierten Agent-/Stream-PC-Verbindungs-Summary.
/api/remote/routes listet die Statusroute.
Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
WSS-Pfad /agent-ws ist nur geplant.
Keine produktiven Remote-/Agent-Actions aktiv.
```

## Harte Grenzen bleiben

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Dateioperation.
Keine freie Prozessausfuehrung.
Keine freie URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
```

## Sprachregel ab RDAP80C

Sichtbar / Doku / Nutzerfokus:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern / Code / Route erlaubt:

```text
agent
agent-status
/api/remote/agent/status
stream-pc-agent
```

Nicht mehr als sichtbares Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Naechster sinnvoller Step

```text
RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_TOKEN_PLAN
```

Ziel:

```text
- Stream-PC-Verbindungs-Handshake konkret planen.
- Agent-ID intern sauber definieren.
- Agent-Secret-/Token-Konzept planen.
- WSS-Pfad /agent-ws und Auth-Grenzen planen.
- Heartbeat-Empfang planen.
- In-Memory vs. DB-Persistenz entscheiden.
- Noch keine produktiven Actions bauen.
```

## Doku-only

RDAP80C aendert keinen Code und braucht keinen Webserver-Deploy.

