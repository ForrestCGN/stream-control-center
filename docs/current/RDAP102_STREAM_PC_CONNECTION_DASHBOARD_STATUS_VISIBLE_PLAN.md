# RDAP102_STREAM_PC_CONNECTION_DASHBOARD_STATUS_VISIBLE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Plan / Stream-PC Verbindung sichtbarer Status

## Zweck

RDAP102 plant, wie der jetzt live bestaetigte Stream-PC Verbindungsstatus sichtbar und nutzerfreundlich im Remote-Modboard/Dashboard angezeigt wird.

Der Step ist bewusst Plan/Doku-only.

```text
Keine UI-Codeaenderung.
Keine Backend-Codeaenderung.
Keine Runtime-Aktivierung.
Keine Agent-Actions.
Keine Secrets.
```

## Ausgangspunkt

RDAP101B hat live bestaetigt:

```text
- Vorab disabled Status: OK
- Runtime temporaer aktiviert: OK
- Stream-PC Agent lokal gestartet: OK
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

Final bestaetigter Zustand bleibt:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Bestehende Backend-Basis

Es gibt bereits eine passende read-only Statusroute:

```text
GET /api/remote/agent/status
```

Diese Route liefert bereits safe Felder fuer eine UI-Anzeige:

```text
agent.connected
agent.connectionState
agent.lastHeartbeatAt
agent.connectedSince
agent.lastSeenAt
agent.heartbeatAgeMs
agent.heartbeatSeq
agent.heartbeatProtocolVersion
agent.stale
agent.agentId
agent.agentName
agent.agentVersion
actionEnabled
productiveAgentRuntime
heartbeat.lastHeartbeatPayloadStored
heartbeat.heartbeatExecutesActions
heartbeat.heartbeatAcceptsCommands
heartbeat.heartbeatAcceptsCapabilities
```

Wichtig:

```text
- Die Route ist read-only.
- Sie gibt keine Secrets aus.
- Sie gibt keine rohen Header aus.
- Sie gibt keine rohen Heartbeat-Payloads aus.
- Actions bleiben deaktiviert.
```

## Geplanter UI-Ort

Nutzerfokus/Sichtbarkeit:

```text
Bereich: Verbindungen
Kachel: Stream-PC Verbindung
Untertitel: Webserver <-> Stream-PC
```

Die Anzeige soll bewusst nicht intern-technisch als `agent` im UI-Titel erscheinen, sondern nutzerfreundlich als Stream-PC Verbindung.

## Geplante Anzeige

Die Read-only-Kachel soll anzeigen:

```text
- Status: Verbunden / Getrennt / Verbindung veraltet
- Letzter Heartbeat
- Heartbeat-Alter
- Verbindung seit
- Letzte Sichtung
- Agent-Version
- Protokoll-Version
- Actions: deaktiviert
- Produktive Agent-Actions: deaktiviert
```

Optional als technische Details einklappbar:

```text
- Agent-ID
- Agent-Name
- Heartbeat-Seq
- Runtime requested/effective
- acceptsAgentConnections
- heartbeatReceiverEnabled
```

## UI-Status-Semantik

```text
connected=true und stale=false:
  Anzeige: Verbunden
  Bedeutung: Stream-PC Agent ist verbunden und Heartbeat ist frisch.

connected=true und stale=true:
  Anzeige: Verbindung veraltet
  Bedeutung: Verbindung existiert, aber der Heartbeat ist zu alt.

connected=false:
  Anzeige: Getrennt
  Bedeutung: Kein Stream-PC Agent ist aktuell verbunden.

runtime.effectiveEnabled=false:
  Anzeige: Runtime deaktiviert
  Bedeutung: Keine Agent-Verbindung wird aktuell angenommen.

actionEnabled=false:
  Anzeige: Actions deaktiviert
  Bedeutung: Es werden keine Agent-Actions ausgefuehrt.

productiveAgentRuntime=false:
  Anzeige: Keine produktiven Agent-Actions
  Bedeutung: Keine produktive Steuerung von OBS/Sounds/Overlays/Commands.
```

## Aktualisierung

Plan fuer RDAP103:

```text
- UI pollt /api/remote/agent/status read-only.
- Intervall defensiv, z. B. 10 bis 15 Sekunden.
- Fehlerfall zeigt "Status nicht abrufbar" statt Rohfehlerdump.
- Keine Secrets, keine Header, keine Rohpayloads anzeigen.
```

## Kein Write und keine Action

Die geplante UI-Kachel darf keine Buttons enthalten fuer:

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

## Sicherheitsgrenzen

Weiterhin strikt:

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

Nicht anzeigen, nicht dokumentieren, nicht in Git aufnehmen:

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

Kein Webserver-Deploy noetig.

Begruendung:

```text
- RDAP102 ist Doku/Plan-only.
- Kein Backend-Code wird geaendert.
- Kein Agent-Code wird geaendert.
- Keine UI-Datei wird in RDAP102 geaendert.
- Keine Nginx-Aenderung.
- Runtime bleibt final disabled.
```

## Naechster sinnvoller Step

```text
RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD
```

Ziel:

```text
- Eine reine Read-only UI-Kachel fuer Stream-PC Verbindung vorbereiten.
- Bestehende /api/remote/agent/status Daten nutzen.
- Keine neue Backend-Action.
- Keine Runtime-Logik aendern.
- Keine Nginx-Aenderung.
- Keine Secrets.
- Keine Actions.
```
