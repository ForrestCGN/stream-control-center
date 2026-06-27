# CURRENT_STREAM_PC_AGENT_STATE

Stand: RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / Stream-PC-Agent

## Zweck

Diese Datei beschreibt den aktuellen Stream-PC-Agent-/WSS-/Runtime-Stand kompakt und sicher.

## Bisher bestaetigt

```text
RDAP101B: Public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP103: Admin / Verbindungen zeigt Stream-PC Verbindung read-only.
RDAP107: zusaetzliche sichere Read-only-Verbindungsdetails geplant.
RDAP108: bestehende Admin-/Verbindungen-Seite frontend-only erweitert.
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

Bereich:

```text
Admin / Verbindungen
```

In RDAP108 erweitert um:

```text
- Agent-Version
- Protokoll
- Heartbeat-Seq
- Heartbeat-Alter
- Stale nach
- Offline nach
- Runtime-Gates
- Transportdetails
- Heartbeat-Speicherung / DB-Write / Heartbeat-Actions
- einklappbare technische Diagnose ohne Secrets
- Warnings ohne Rohpayloads
```

## Read-only Datenquelle

```text
GET /api/remote/agent/status
```

## Geaenderte Datei in RDAP108

```text
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

## Nicht geaendert in RDAP108

```text
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/services/agent-status.service.js
```

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
rohe IP-Adressen
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
RDAP108B_STREAM_PC_CONNECTION_READONLY_UI_LIVE_CONFIRM
```
