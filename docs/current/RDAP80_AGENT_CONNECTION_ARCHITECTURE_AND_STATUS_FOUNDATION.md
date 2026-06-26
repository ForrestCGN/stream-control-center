# RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code + Doku / Agent-Status-Foundation / read-only

## Ziel

RDAP80 startet den naechsten Hauptblock nach dem eingefrorenen Admin-Notes-/Registry-Stand:

```text
Webserver <-> Stream-PC Verbindung
```

Der Step baut bewusst noch keinen produktiven Agent-Runtime und keine Remote-Actions. Er stellt nur eine saubere Status-/Heartbeat-Foundation bereit, die spaeter vom Stream-PC-Agent gefuellt werden kann.

## Architekturgrenze

```text
Browser
  -> mods.forrestcgn.de / Remote-Modboard
  -> Webserver Backend
  -> gesicherter Agent-Kanal spaeter
  -> Stream-PC Agent spaeter
  -> erlaubte lokale Aktionen spaeter
```

Wichtig:

```text
- Stream-PC verbindet spaeter aktiv zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Keine eingehenden Internet-Verbindungen zum Stream-PC.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine OBS-/Sound-/Overlay-/Command-Actions in RDAP80.
```

## Umgesetzt

```text
GET /api/remote/agent/status
```

Die Route liefert read-only:

```text
- Agent enabled/connected/connectionState
- letzter Heartbeat: aktuell null
- erwartete Agent-ID: stream-pc-main
- erwarteter Agent-Name: Forrest Stream-PC
- geplante Richtung: stream-pc-agent-to-webserver
- geplanter Transport: wss
- geplanter WS-Pfad: /agent-ws
- Safety-Block mit allen verbotenen Action-Gruppen
```

Zusätzlich:

```text
- /api/remote/status nutzt denselben Agent-Summary-Block.
- /api/remote/routes listet /api/remote/agent/status.
- Remote-Modboard UI bekommt Agent -> Agent-Status.
- Die Page registriert sich an der vorhandenen Frontend-Registry.
- Kein neuer Router, keine parallele Navigation.
```

## Dateien

```text
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

## Bewusst nicht gemacht

```text
Keine Admin-Notes-Aenderung.
Kein Delete/Deactivate.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine neue Permission-Migration.
Keine DB-Migration.
Kein produktiver Agent-Runtime.
Kein WSS-Server.
Kein Agent-Secret.
Keine Agent-Action-Queue.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Commands/Channelpoints.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\agent-status.routes.js
node --check .\remote-modboard\backend\src\services\agent-status.service.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\public\assets\rdap80-agent-status.js

git status --short
git diff --stat
```

## Webserver-Tests nach stepdone.cmd und Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.routes[] | select(.path=="/api/remote/agent/status")'
```

## Naechster sinnvoller Step

```text
RDAP81_AGENT_HANDSHAKE_AND_TOKEN_PLAN
```

Nur planen, noch nicht blind bauen:

```text
- Agent-Identitaet / agentId
- Server-seitiges Agent-Secret-Konzept
- WSS-Handshake
- Heartbeat-POST/WSS-Modell
- In-Memory-Status vs. DB-Persistenz klaeren
- weiterhin keine produktiven Actions
```
