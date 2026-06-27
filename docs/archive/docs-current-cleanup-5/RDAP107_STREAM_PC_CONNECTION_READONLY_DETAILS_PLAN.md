# RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN

Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / Stream-PC-Agent  
Art: Plan-Step / Read-only UI-Details / Keine Codeaenderung

## Zweck

RDAP107 plant die naechste sichere Erweiterung der Stream-PC-Verbindungsanzeige.

Es wird in RDAP107 noch nichts an UI, Backend oder Runtime geaendert. Ziel ist ein klarer, sicherer Scope fuer einen spaeteren Umsetzungsstep.

## Ausgangspunkt

Aktuelle UI-Seite:

```text
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

Aktuelle API-Route:

```text
remote-modboard/backend/src/routes/agent-status.routes.js
GET /api/remote/agent/status
```

Aktueller Service:

```text
remote-modboard/backend/src/services/agent-status.service.js
```

Die bestehende UI registriert bereits:

```text
pageId: admin-connections
label: Verbindungen
title: Stream-PC Verbindung
permission: agent.status.read
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

## Ziel fuer RDAP108

```text
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
```

Ziel:

```text
- bestehende Seite Admin / Verbindungen erweitern
- keine neue Parallelseite bauen
- vorhandene GET /api/remote/agent/status Daten nutzen
- nur sichere Read-only-Felder anzeigen
- keine Runtime aktivieren
- keine Agent-Actions einbauen
```

## Sichere Felder fuer Anzeige

Grundsaetzlich geeignet, weil read-only und ohne Secret-/Payload-Inhalt:

```text
agent.connected
agent.connectionState
agent.reason
agent.lastHeartbeatAt
agent.heartbeatAgeMs
agent.heartbeatSeq
agent.stale
agent.agentName
agent.agentVersion
agent.protocolVersion
agent.expectedAgentId
agent.expectedAgentName
agent.expectedHeartbeatProtocolVersion

runtime.requestedEnabled
runtime.acceptBuildEnabled
runtime.effectiveEnabled
runtime.acceptsAgentConnections
runtime.heartbeatReceiverEnabled
runtime.actionsEnabled
runtime.productiveAgentRuntime

transport.plannedTransport
transport.plannedDirection
transport.plannedWsPath
transport.streamPcPublicPortRequired
transport.incomingInternetConnectionToStreamPcRequired
transport.dynamicStreamPcIpAllowed

heartbeat.heartbeatInMemoryOnly
heartbeat.persistsHeartbeatToDatabase
heartbeat.databaseWriteEnabled
heartbeat.plannedHeartbeatIntervalMs
heartbeat.staleAfterMs
heartbeat.offlineAfterMs
heartbeat.heartbeatExecutesActions
heartbeat.heartbeatAcceptsCommands
heartbeat.heartbeatAcceptsCapabilities

safety.*
warnings[]
statusApiVersion
moduleBuild
generatedAt
loadedAt
```

## Vorsichtig / nur einklappbar anzeigen

Diese Felder sind hilfreich fuer Diagnose, duerfen aber nicht prominent in der normalen Ansicht dominieren:

```text
rejectDiagnostic.prepared
rejectDiagnostic.inMemoryOnly
rejectCount
lastRejectAt
lastRejectReason
lastRejectHasAgentIdHeader
lastRejectHasProtocolHeader
lastRejectAgentIdHint
lastRejectProtocolHint
lastRejectAccessKeyConfigured
lastRejectConnectionProofCompared
rejectSecretsExposed
```

Regel:

```text
- nur als technische Diagnose
- einklappbar oder separater Diagnoseblock
- keine Secrets
- keine Rohheader
- keine Rohpayloads
```

## Nicht anzeigen

```text
SCC_AGENT_ACCESS_KEY
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
rohe Header
rohe Heartbeat-Payloads
komplette Config-Dumps
Env-Dumps
Pfad-Dumps
Dateilisten
Prozesslisten
rohe IP-Adressen
```

## Ziel-UI fuer RDAP108

### 1. Verbindung kompakt

```text
- Verbindung: online/offline/veraltet
- letzter Heartbeat
- Heartbeat-Alter
- Heartbeat-Seq
- Heartbeat-Protokoll
- Agent-Name/Version, falls vorhanden
```

### 2. Runtime-Gates

```text
- requestedEnabled
- acceptBuildEnabled
- effectiveEnabled
- acceptsAgentConnections
- heartbeatReceiverEnabled
- actionsEnabled
- productiveAgentRuntime
```

Zieltext:

```text
"Alle Runtime-Gates muessen disabled bleiben, bis ein separater Aktivierungsplan existiert."
```

### 3. Transport

```text
- Richtung: Stream-PC -> Webserver
- Transport: WSS
- WS-Pfad: /agent-ws
- Portfreigabe Stream-PC: nein
- dynamische Stream-PC-IP erlaubt: ja
```

### 4. Sicherheit

```text
- Keine OBS-Steuerung
- Keine Sound-Ausloesung
- Keine Overlay-Schaltung
- Keine Commands/Channelpoints
- Keine Shell-/Prozessaktionen
- Keine freien Dateioperationen
- Keine freie URL-Ausfuehrung
- Keine Remote-Actions
```

### 5. Technische Diagnose einklappbar

```text
- Reject-Diagnostic ohne Secrets
- StatusApiVersion
- ModuleBuild
- generatedAt / loadedAt
- Warnings
```

## Voraussichtliche Zielpfade fuer RDAP108

```text
remote-modboard/backend/public/assets/rdap80-agent-status.js
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP108.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Backend nur falls wirklich noetig:

```text
remote-modboard/backend/src/services/agent-status.service.js
```

Nach aktuellem Stand reichen die vorhandenen Service-Felder wahrscheinlich fuer RDAP108 aus.

## RDAP107 Nicht-Scope

```text
Keine Codeaenderung.
Keine UI-Aenderung.
Keine Backend-Route.
Keine DB-Migration.
Keine Runtime-Aktivierung.
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine produktiven Writes.
Keine Secrets.
Keine Rohpayloads.
Kein Webserver-Deploy.
```

## Ergebnis

```text
RDAP107 legt den sicheren Plan fuer RDAP108 fest.
Naechster Step ist RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI.
```
