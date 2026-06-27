# RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Heartbeat Read-only Plan

## Zweck

RDAP93 plant das Heartbeat-Modell fuer die Stream-PC Verbindung.

Wichtig:

```text
- RDAP93 ist Doku-only.
- Keine Code-Aenderung.
- Kein Heartbeat-Receiver.
- Keine Runtime-Aktivierung.
- Kein echter Stream-PC-Agent.
- Keine Agent-Actions.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Kein Webserver-Deploy.
```

## Ausgangspunkt

RDAP92/RDAP92_FIX1/RDAP92B/RDAP92C haben bestaetigt:

```text
- /agent-ws kann guarded WebSocket-Transport akzeptieren.
- Transport-Accept funktioniert nur mit beiden Gates:
  - AGENT_RUNTIME_ENABLED=true
  - acceptBuildEnabled=true im RDAP92-Build
- Correct Bearer allein reicht nicht.
- HTTP/1.1 101 Switching Protocols wurde live bestaetigt.
- connected true waehrend Verbindung wurde bestaetigt.
- Socket close/offline wurde bestaetigt.
- Actions false wurde bestaetigt.
- Heartbeat false wurde bestaetigt.
- productiveAgentRuntime false wurde bestaetigt.
- AGENT_RUNTIME_ENABLED wurde final wieder false gesetzt.
```

Finaler Sicherheitszustand nach RDAP92C:

```text
AGENT_RUNTIME_ENABLED=false
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
agent.connected=false
actionsEnabled=false
productiveAgentRuntime=false
heartbeatReceiverEnabled=false
```

## Zielbild fuer Heartbeat

Heartbeat soll nur den Verbindungszustand sichtbarer machen.

Erlaubt:

```text
- Agent meldet periodisch "ich bin noch da".
- Webserver merkt lastHeartbeatAt.
- Webserver berechnet heartbeatAgeMs.
- Webserver leitet stale/offline ab.
- Status bleibt read-only.
- Daten bleiben in-memory.
```

Nicht erlaubt:

```text
- Agent-Actions.
- OBS-Steuerung.
- Sound-Ausloesung.
- Overlay-Schaltung.
- Command-/Channelpoints-Steuerung.
- freie Shell.
- freie Dateioperation.
- freie Prozessausfuehrung.
- freie URL-Ausfuehrung.
- DB-Schreibzugriff.
- Capabilities-Freigabe.
- Secret-Ausgabe.
```

## Geplanter naechster Code-Step

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

RDAP94 darf maximal:

```text
- Heartbeat-Frames auf einer bereits akzeptierten /agent-ws Verbindung lesen.
- Nur erlaubte JSON-Typen akzeptieren.
- lastHeartbeatAt setzen.
- heartbeatAgeMs berechnen.
- stale/offline aus Zeit ableiten.
- Status read-only anzeigen.
- keine Actions ausfuehren.
- nichts in DB schreiben.
- keine Secrets ausgeben.
```

## Heartbeat-Gate

Heartbeat darf nicht automatisch nur durch RDAP92 aktiv werden.

Geplantes Zwei-Stufen-Modell fuer RDAP94:

```text
Gate 1:
AGENT_RUNTIME_ENABLED=true

Gate 2:
RDAP94 Heartbeat-Build-Gate im Code
z. B. heartbeatReceiverBuildEnabled=true
```

Wichtig:

```text
- AGENT_RUNTIME_ENABLED=true allein darf Heartbeat nicht automatisch produktiv aktivieren, wenn RDAP94 Build-Gate fehlt.
- Heartbeat aktiviert keine Actions.
- Heartbeat aktiviert keine Capabilities.
- Heartbeat schreibt keine DB.
```

## Minimaler Heartbeat-Payload

Erlaubter Payload fuer RDAP94:

```json
{
  "type": "heartbeat",
  "protocolVersion": "rdap-agent-heartbeat.v1",
  "agentId": "stream-pc-main",
  "agentVersion": "string",
  "sentAt": "2026-06-26T18:00:00.000Z",
  "seq": 1
}
```

## Feldregeln

```text
type:
- Muss exakt heartbeat sein.

protocolVersion:
- Muss exakt rdap-agent-heartbeat.v1 sein.

agentId:
- Muss exakt stream-pc-main sein.
- Muss zur akzeptierten Verbindung passen.

agentVersion:
- Nur kurzer, sicherer String.
- Maximal 80 Zeichen.
- Keine Pfade.
- Keine Secrets.

sentAt:
- ISO-Zeitstempel.
- Nur diagnostisch.
- Nicht als alleinige Wahrheit fuer Serverzeit nutzen.

seq:
- positive Zahl.
- Nur diagnostisch oder monoton steigend pruefen.
```

## Nicht erlaubte Payload-Felder

RDAP94 soll diese Felder ablehnen oder ignorieren und nicht speichern:

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

## Keine Rohdaten speichern

Nicht speichern/anzeigen:

```text
roher Heartbeat-Payload
rohe Header
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
AGENT_ACCESS_KEY
Cookies
Query-Werte
rohe IP-Adresse
lokale absolute Pfade
```

## Geplantes Status-Modell

```text
connected: true/false
connectionState: offline/connected/stale
lastHeartbeatAt: null|ISO
heartbeatAgeMs: null|number
heartbeatSeq: null|number
heartbeatProtocolVersion: rdap-agent-heartbeat.v1|null
stale: false/true
staleAfterMs: 90000
offlineAfterMs: 120000
plannedHeartbeatIntervalMs: 30000
heartbeatReceiverEnabled: true/false
heartbeatReceiverBuildEnabled: true/false
heartbeatInMemoryOnly: true
heartbeatPersistsToDatabase: false
```

## Bedeutung der Zustaende

```text
offline:
- Socket ist geschlossen oder offlineAfterMs wurde ueberschritten.

connected:
- Socket ist offen.
- letzter Heartbeat ist aktuell oder noch nicht stale.

stale:
- Socket ist offen.
- Heartbeat ist aelter als staleAfterMs.
- Keine Actions.
- Kein automatischer Reconnect vom Server.
```

## Zeitmodell

Vorgeschlagene Werte:

```text
plannedHeartbeatIntervalMs=30000
staleAfterMs=90000
offlineAfterMs=120000
```

Regel:

```text
- Stream-PC sendet ca. alle 30 Sekunden heartbeat.
- Nach 90 Sekunden ohne Heartbeat wird stale=true.
- Nach 120 Sekunden ohne Heartbeat wird offline/connectionState offline gesetzt oder als offline bewertet.
```

## In-Memory-only

RDAP94 soll weiterhin keine DB nutzen.

```text
storesHeartbeatInMemoryOnlyForNow=true
persistsHeartbeatToDatabase=false
databaseWriteEnabled=false
migrationEnabled=false
```

## Actions bleiben false

Auch mit Heartbeat:

```text
actionsEnabled=false
productiveAgentRuntime=false
productiveActionsEnabled=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

## Fehler-/Reject-Verhalten

Sichere Heartbeat-Fehlergruende fuer Status/Diagnose:

```text
invalid_heartbeat_json
unsupported_heartbeat_type
unsupported_heartbeat_protocol
heartbeat_agent_mismatch
heartbeat_payload_too_large
heartbeat_forbidden_fields
heartbeat_seq_invalid
heartbeat_ignored_runtime_disabled
```

Regeln:

```text
- Keine Rohpayload-Ausgabe.
- Keine Header-Ausgabe.
- Keine Token-Ausgabe.
- Keine IP-Ausgabe.
- Keine Secrets.
```

## Payload-Groessenlimit

Vorschlag:

```text
maxHeartbeatPayloadBytes=2048
```

Grund:

```text
Heartbeat ist Status-Minimaldaten.
Mehr braucht RDAP94 nicht.
```

## Umgang mit WebSocket Frames

RDAP94 soll nur einfache Textframes akzeptieren.

```text
- Textframes mit JSON.
- Binary Frames ignorieren oder sauber schliessen.
- Ping/Pong nur soweit fuer Socket-Stabilitaet noetig.
- Keine Fragmentierungs-Komplexitaet, wenn nicht noetig.
- Zu grosse Frames ablehnen/schliessen.
```

## Testmatrix fuer RDAP94

```text
1. Default AGENT_RUNTIME_ENABLED=false:
   - kein Transport-Accept.
   - kein Heartbeat.
   - actions false.

2. AGENT_RUNTIME_ENABLED=true mit RDAP94 Heartbeat-Gate false:
   - Transport kann je nach RDAP92 Gate akzeptiert werden.
   - heartbeatReceiverEnabled false.
   - Heartbeat wird ignoriert/abgelehnt.
   - actions false.

3. AGENT_RUNTIME_ENABLED=true mit RDAP94 Heartbeat-Gate true:
   - Transport-Accept.
   - heartbeatReceiverEnabled true.
   - valid heartbeat setzt lastHeartbeatAt.
   - heartbeatAgeMs klein.
   - stale false.
   - actions false.

4. Keine Heartbeats:
   - nach staleAfterMs stale true.
   - nach offlineAfterMs offline Bewertung.
   - actions false.

5. Socket close:
   - connected false.
   - connectionState offline.
   - actions false.

6. Ungueltiges JSON:
   - keine Exception.
   - sichere Diagnose.
   - keine Rohpayload-Ausgabe.

7. Falscher type:
   - ignore/reject.
   - keine Actions.

8. Falsches protocolVersion:
   - ignore/reject.
   - keine Actions.

9. Falsche agentId:
   - ignore/reject.
   - keine Actions.

10. Payload mit forbidden Feldern:
   - ignore/reject.
   - keine Speicherung.
   - keine Ausgabe.

11. Zu grosse Payload:
   - reject/close.
   - keine Ausgabe.

12. Secret-Safety:
   - kein Bearer.
   - kein Token.
   - keine Token-Laenge.
   - kein Token-Hash.
   - keine Headerwerte.
   - keine Payload-Rohdaten.
```

## Sichtbarer UI-/Status-Fokus

Sichtbar weiterhin:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern erlaubt:

```text
agent
agent-status
/agent-ws
/api/remote/agent/status
heartbeat
```

Nicht sichtbar als Hauptmodul:

```text
Agent -> Agent-Status
```

## Naechster sinnvoller Step

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

Aber erst nach:

```text
- GitHub/dev erneut lesen.
- Plan nennen.
- Auf explizites go warten.
- Bestehende Runtime-/Status-Services erweitern.
- Keine neuen parallelen Strukturen.
```

## Doku-only

RDAP93 aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
