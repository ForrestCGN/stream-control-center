# CURRENT_STREAM_PC_AGENT_STATE

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / Stream-PC-Agent

## Zweck

Diese Datei beschreibt den aktuellen Stream-PC-Agent-/WSS-/Runtime-Stand kompakt und sicher.

## Zielbild

```text
- Stream-PC verbindet aktiv zum Webserver.
- Verbindung per WSS.
- Keine eingehende Portfreigabe am Stream-PC.
- Webserver prueft Login, Rechte und erlaubte Aktionen.
- Agent fuehrt spaeter nur Allowlist-Actions aus.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
```

## Bisher bestaetigt

RDAP101B:

```text
- Public WSS Heartbeat live bestaetigt.
- Gueltiger Heartbeat ueber wss://mods.forrestcgn.de/agent-ws bestaetigt.
- Runtime danach final wieder deaktiviert.
- Keine Actions.
- Keine Secrets im Chat/Git/Doku.
```

RDAP103:

```text
- Admin / Verbindungen zeigt Stream-PC Verbindung read-only.
- Status offline ist korrekt, weil Runtime final disabled.
- Actions deaktiviert.
- Transport: WSS.
- Portfreigabe Stream-PC: nein.
```

## Aktueller Sicherheitszustand

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Aktuelle UI-Anzeige

```text
Bereich:
Admin / Verbindungen

Kachel:
Stream-PC Verbindung

Status:
offline / keine aktive Meldung

Aktionen:
deaktiviert

Reload:
nur Read-only Status neu laden
```

## Read-only Datenquelle

```text
GET /api/remote/agent/status
```

Sichere Felder fuer Anzeige muessen pro Step geprueft werden. Grundsaetzlich geeignet sind nur Felder, die keine Secrets, keine Rohpayloads und keine sensiblen lokalen Details enthalten.

## Strikt nicht anzeigen

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
Env-Dumps
Pfad-Dumps
Dateilisten
Prozesslisten
```

## Strikt nicht aktivieren

```text
- Runtime aktivieren
- Agent-Verbindungen produktiv akzeptieren
- Agent-Actions ausfuehren
- OBS steuern
- Sounds ausloesen
- Overlays schalten
- Commands / Channelpoints ausfuehren
- freie URLs / Shell / Dateien / Prozesse ausfuehren
```

## Naechster fachlicher Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- pruefen, welche weiteren Verbindungsdetails sicher read-only angezeigt werden koennen
- bestehende Admin-/Verbindungen-Seite bevorzugen
- keine Actions
- keine Runtime-Aktivierung
```
