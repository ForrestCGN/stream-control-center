# RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: UI-Code / Read-only Status-Kachel / Stream-PC Verbindung

## Zweck

RDAP103 verbessert die bereits vorhandene Read-only UI-Seite `Admin / Verbindungen` fuer die Stream-PC Verbindung.

Die technische Verbindung wurde in RDAP101B live bestaetigt. RDAP103 macht den Status nun nutzerfreundlicher sichtbar, ohne neue Agent-Actions, ohne neue Runtime-Logik und ohne Secrets.

## Ausgangspunkt

RDAP101B bestaetigte live:

```text
- Public WSS wss://mods.forrestcgn.de/agent-ws connected: OK
- Gueltiger Heartbeat ueber public WSS bestaetigt: OK
- heartbeatSeq=4
- heartbeatProtocolVersion=rdap-agent-heartbeat.v1
- stale=false
- lastHeartbeatPayloadStored=false
- actionEnabled=false
- productiveAgentRuntime=false
- heartbeatExecutesActions=false
- heartbeatAcceptsCommands=false
- heartbeatAcceptsCapabilities=false
- Agent lokal gestoppt.
- Runtime final wieder disabled.
- Keine Secrets im Chat/Git/Doku.
- Keine Actions.
```

RDAP102 plante die sichtbare UI:

```text
Bereich: Verbindungen
Kachel: Stream-PC Verbindung
Untertitel: Webserver <-> Stream-PC
Datenquelle: GET /api/remote/agent/status
Read-only, keine Start/Stop/Action Buttons.
```

## Geaenderte Datei

```text
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

Die vorhandene Seite wird erweitert. Es wird keine neue parallele UI-Seite erstellt.

## UI-Aenderungen

```text
- Veralteten RDAP80B-Hinweistext im Seitenkopf entfernt.
- Kopftext auf aktuellen Read-only Status der gesicherten Stream-PC Verbindung aktualisiert.
- Status-Semantik fuer verbunden/veraltet/offline ergaenzt.
- Heartbeat-Kachel zeigt bei aktiver Verbindung lokale Zeit, Alter, Seq und Protokoll.
- Heartbeat-Kachel zeigt offline bewusst "keine aktive Meldung".
- Actions-Kachel verwendet "deaktiviert" und "keine produktiven Agent-Actions".
- Quick-Chip unterscheidet Verbindung online/veraltet/offline.
- Hinweistext unten auf RDAP103 aktualisiert.
- Richtung wird nutzerfreundlich als "Stream-PC -> Webserver" angezeigt.
```

## Status-Semantik

```text
connected=true und stale=false:
  Anzeige: verbunden
  Quick-Chip: Verbindung online

connected=true und stale=true:
  Anzeige: veraltet
  Quick-Chip: Verbindung veraltet

connected=false:
  Anzeige: offline
  Quick-Chip: Verbindung offline
```

## Read-only Datenquelle

Die UI nutzt weiterhin ausschliesslich:

```text
GET /api/remote/agent/status
```

Verwendete safe Felder:

```text
agent.connected
agent.connectionState
agent.lastHeartbeatAt
agent.heartbeatAgeMs
agent.heartbeatSeq
agent.heartbeatProtocolVersion
agent.stale
agent.agentName
agent.agentVersion
actionEnabled
productiveAgentRuntime
heartbeat.lastHeartbeatPayloadStored
heartbeat.heartbeatExecutesActions
heartbeat.heartbeatAcceptsCommands
heartbeat.heartbeatAcceptsCapabilities
```

## Keine Actions

RDAP103 fuegt keine Buttons oder Funktionen hinzu fuer:

```text
- Agent starten
- Agent stoppen
- Runtime aktivieren/deaktivieren
- OBS steuern
- Sounds ausloesen
- Overlays schalten
- Commands oder Channelpoints ausfuehren
- freie URLs ausfuehren
- Shell/Datei/Prozessaktionen ausfuehren
```

Der bestehende Button `Verbindung neu laden` bleibt ein reiner Read-only Refresh der Statusroute.

## Secret-Safety

Nicht angezeigt, nicht dokumentiert, nicht in Git aufgenommen:

```text
SCC_AGENT_ACCESS_KEY
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
rohe Header mit Secrets
rohe Heartbeat-Payloads
komplette Config-Dumps
```

## Webserver-Deploy

Webserver-Deploy ist nach `stepdone.cmd` noetig.

Begruendung:

```text
- RDAP103 aendert eine Datei unter remote-modboard/backend/public/assets/.
- Der Backend-Service serviert diese UI-Datei.
- Kein Backend-Routen-Code wurde geaendert.
- Kein Agent-Code wurde geaendert.
- Keine DB-Migration.
- Keine Runtime-Aktivierung.
```

## Checks

Lokal empfohlen:

```text
node --check .\remote-modboard\backend\public\assets\rdap80-agent-status.js
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
git status
```

Nach Deploy:

```text
- Service startet.
- /api/remote/status ist ready.
- /api/remote/agent/status bleibt erreichbar.
- UI-Seite Admin / Verbindungen zeigt aktualisierte Texte.
- Runtime bleibt final disabled.
- Keine Actions.
```

## Naechster sinnvoller Step

```text
RDAP103B_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD_LIVE_CONFIRM
```

Ziel:

```text
- RDAP103 deployen.
- Readiness pruefen.
- UI/Statusroute read-only bestaetigen.
- Final disabled Status pruefen.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
```
