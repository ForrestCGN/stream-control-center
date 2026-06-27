# RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Transport-Accept Code-Plan

## Zweck

RDAP91 plant den ersten spaeteren Backend-Code-Step fuer einen minimalen Transport-Accept der Stream-PC Verbindung.

Wichtig:

```text
- RDAP91 aendert keinen Backend-Code.
- RDAP91 aktiviert keine Runtime.
- RDAP91 akzeptiert keine Stream-PC Verbindung.
- RDAP91 baut keinen echten WebSocket-Handshake.
- RDAP91 baut keinen Heartbeat-Receiver.
- RDAP91 setzt keinen Agent online.
- RDAP91 aktiviert keine Agent-Actions.
- RDAP91 fuehrt keine DB-Migration aus.
- RDAP91 fuehrt keine neue Permission ein.
- RDAP91 gibt keine Secrets aus.
- RDAP91 ist Doku-only.
```

## Ausgangspunkt

```text
RDAP90:
- Runtime-Accept disabled Build-Plan dokumentiert.
- Der spaetere Accept-Code-Step darf maximal Transport akzeptieren.
- Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Zweiter Code-/Build-Schalter ist Pflicht.
- AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
- Keine zweite parallele /agent-ws Registrierung.
- Heartbeat moeglichst separat nach Transport-Accept planen.
```

## Aktueller technischer Ist-Zustand

```text
- agent-runtime-disabled.service.js ist der einzige /agent-ws Upgrade-Guard.
- Der Guard prueft Header/Bearer/Protocol/Access-Key.
- Der Guard lehnt weiterhin immer mit HTTP 503 ab.
- Bei korrektem Bearer endet die Logik bewusst mit runtime_not_effectively_enabled.
- config.service.js liest AGENT_RUNTIME_ENABLED, haelt effectiveEnabled aber false.
- agent-status.service.js meldet connected=false, actionsEnabled=false, productiveAgentRuntime=false und acceptsAgentConnections=false.
```

## Zielbild fuer spaeteren RDAP92-Code-Step

Geplanter naechster Code-Step:

```text
RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

Ziel:

```text
- Minimalen Transport-Accept fuer /agent-ws vorbereiten.
- Nur WebSocket-Transport akzeptieren, wenn beide Runtime-Gates aktiv sind.
- Keine Agent-Actions.
- Kein OBS.
- Kein Sound.
- Kein Overlay.
- Keine Commands/Channelpoints.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Strukturentscheidung

### Kein zweiter paralleler /agent-ws Handler

```text
- Es darf weiterhin nur eine Stelle geben, die /agent-ws Upgrade-Requests verarbeitet.
- Keine parallele zweite Registrierung am server.on('upgrade') fuer denselben Pfad.
- Kein zweites Modul, das denselben Pfad nebenbei behandelt.
```

### Bestehenden disabled Service nicht blind erweitern

`agent-runtime-disabled.service.js` ist fachlich aktuell korrekt fuer reject-only.

Sobald ein echter Accept moeglich wird, ist `disabled` als Hauptverantwortung fachlich falsch.

Geplante Entscheidung fuer RDAP92:

```text
Neue fachlich getrennte Datei:
remote-modboard/backend/src/services/agent-runtime.service.js
```

Begruendung:

```text
- Akzeptierte Verbindungen sind eine andere Verantwortung als disabled/reject-only.
- Das ist keine parallele Struktur, wenn server.js nur einen Registrar nutzt.
- Der alte disabled Service kann entweder ersetzt oder nur fuer gemeinsame sichere Precheck-Helfer genutzt werden.
- Keine doppelte /agent-ws Registrierung.
```

## Vorgeschlagene Backend-Struktur fuer RDAP92

```text
remote-modboard/backend/server.js
- registriert genau einen Agent-Runtime-Registrar.

remote-modboard/backend/src/services/config.service.js
- liest AGENT_RUNTIME_ENABLED.
- liest AGENT_ACCESS_KEY nur als configured Boolean fuer Status.
- setzt spaeter runtime acceptBuildPrepared/acceptBuildEnabled sichtbar.
- gibt keine Secrets aus.

remote-modboard/backend/src/services/agent-runtime.service.js
- verantwortet spaeter /agent-ws Transport-Accept oder Reject.
- nutzt bestehende Precheck-Logik oder uebernimmt sie sauber.
- verwaltet aktive Verbindung in-memory.
- keine Actions.
- keine DB.

remote-modboard/backend/src/services/agent-status.service.js
- zeigt spaeter Runtime-/Connection-Status.
- bleibt secret-safe.
- actions bleiben false.
```

## Zwei-Stufen-Gate fuer RDAP92

Transport-Accept darf spaeter nur moeglich sein, wenn beide Gates aktiv sind:

```text
Gate 1:
AGENT_RUNTIME_ENABLED=true

Gate 2:
expliziter Code-/Build-Schalter im RDAP92-Build
z. B. runtimeAcceptBuildEnabled=true
```

Wichtig:

```text
- AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
- Der Build-Schalter darf nicht durch Env allein versehentlich aktiv werden.
- MODULE_BUILD muss klar zeigen, dass Transport-Accept bewusst vorbereitet wurde.
- Actions bleiben trotzdem false.
```

## Spaetere Accept-Bedingungen

Ein spaeterer Transport-Accept darf nur erfolgen, wenn alle Bedingungen stimmen:

```text
1. Request-Pfad ist exakt /agent-ws.
2. AGENT_RUNTIME_ENABLED=true.
3. runtimeAcceptBuildEnabled=true.
4. X-SCC-Agent-Id ist vorhanden.
5. X-SCC-Agent-Id ist exakt stream-pc-main.
6. X-SCC-Agent-Protocol ist exakt rdap-agent-handshake.v1.
7. Authorization ist vorhanden.
8. Authorization nutzt Bearer-Schema.
9. AGENT_ACCESS_KEY ist serverseitig gesetzt.
10. Bearer stimmt serverseitig gegen AGENT_ACCESS_KEY.
11. Keine aktive Verbindung mit gleicher Agent-ID existiert bereits.
12. Actions bleiben disabled.
13. Secrets werden nicht geloggt oder ausgegeben.
```

## In-Memory-Verbindungsstatus fuer RDAP92

Geplante Felder:

```text
connected: true/false
connectionState: offline/connected
agentId
agentName
agentVersion
protocolVersion
connectedSince
lastSeenAt
reconnectCount
closeReason
```

Noch nicht empfohlen fuer RDAP92:

```text
produktiver Heartbeat-Receiver
stale/offline Timer
Heartbeat-Payload-Verarbeitung
DB-Persistenz
Action-Queue
```

## Heartbeat bleibt nachgelagert

RDAP91 empfiehlt:

```text
RDAP92 akzeptiert maximal den Transport.
RDAP93 plant/implementiert erst Heartbeat und Stale/Offline sauber.
```

Warum:

```text
- Transport-Accept isoliert testen.
- Keine Daten vom Stream-PC annehmen, bevor Heartbeat-Payload klar definiert ist.
- Keine Vermischung mit Online/Stale-Logik.
- Keine versteckte Action- oder Capabilities-Verarbeitung.
```

## Statusfelder fuer RDAP92

Geplant sichtbar erlaubt:

```text
statusApiVersion
moduleBuild
runtime.requestedEnabled
runtime.effectiveEnabled
runtime.acceptBuildPrepared
runtime.acceptBuildEnabled
runtime.acceptsAgentConnections
runtime.actionsEnabled
runtime.productiveAgentRuntime
agent.connected
agent.connectionState
agent.expectedAgentId
agent.expectedAgentName
agent.agentId
agent.agentName
agent.agentVersion
agent.protocolVersion
agent.connectedSince
agent.reconnectCount
agent.actionsEnabled
agent.productiveActionsEnabled
```

Weiterhin nicht sichtbar:

```text
AGENT_ACCESS_KEY
Bearer Token
Bearer Token Laenge
Bearer Token Hash
Authorization Header Value
komplette Header
Cookies
Query-Werte
rohe IP-Adresse
lokale absolute Pfade
freie Prozesslisten
freie Dateiinfos
```

## Reject-Gruende fuer RDAP92

Sichere sichtbare Gruende:

```text
runtime_not_effectively_enabled
missing_agent_id
unknown_agent_id
missing_connection_proof
invalid_connection_proof
protocol_version_unsupported
access_key_not_configured
agent_already_connected
```

Regeln:

```text
- Reject-Gruende duerfen keine Secrets enthalten.
- Reject-Gruende duerfen keine Header-Werte enthalten.
- Reject-Gruende duerfen keine Query-Werte enthalten.
- Reject-Gruende duerfen keine IP-Adresse enthalten.
```

## Agent-Actions bleiben aus

Auch wenn RDAP92 spaeter Transport akzeptiert, bleibt:

```text
actionsEnabled=false
productiveAgentRuntime=false
agentActions=false
remoteWritesControlled=true
```

Nicht erlaubt:

```text
OBS-Steuerung
Sound-Ausloesung
Overlay-Schaltung
Command-/Channelpoints-Steuerung
freie Shell
freie Dateioperation
freie Prozesssteuerung
freie URL-Ausfuehrung
DB-Schreibzugriff
```

## Testmatrix fuer spaeteren RDAP92-Code-Step

Pflichttests:

```text
1. Default ohne AGENT_RUNTIME_ENABLED:
   - /agent-ws reject.
   - acceptsAgentConnections false.
   - actionsEnabled false.

2. AGENT_RUNTIME_ENABLED=true allein:
   - /agent-ws reject.
   - reason=runtime_not_effectively_enabled.
   - acceptsAgentConnections false.

3. Fehlende Agent-ID:
   - reject.
   - reason=missing_agent_id.

4. Falsche Agent-ID:
   - reject.
   - reason=unknown_agent_id.

5. Fehlende Authorization:
   - reject.
   - reason=missing_connection_proof.

6. Falsches Auth-Schema:
   - reject.
   - reason=invalid_connection_proof.

7. AGENT_ACCESS_KEY nicht konfiguriert:
   - reject.
   - reason=access_key_not_configured.

8. Falscher Bearer:
   - reject.
   - reason=invalid_connection_proof.

9. Falsches Protocol:
   - reject.
   - reason=protocol_version_unsupported.

10. Korrekter Bearer ohne Runtime-Gate:
   - reject.
   - reason=runtime_not_effectively_enabled.

11. Korrekter Bearer mit AGENT_RUNTIME_ENABLED=true, aber ohne Build-Gate:
   - reject.
   - reason=runtime_not_effectively_enabled.

12. Korrekter Bearer mit beiden Gates:
   - Transport akzeptiert.
   - connected true.
   - actionsEnabled false.
   - productiveAgentRuntime false.

13. Zweite Verbindung gleicher Agent-ID:
   - reject.
   - reason=agent_already_connected.

14. Socket close:
   - connected false.
   - connectionState offline.
   - actionsEnabled false.

15. Secret-Safety:
   - AGENT_ACCESS_KEY nicht sichtbar.
   - Bearer nicht sichtbar.
   - Token-Laenge nicht sichtbar.
   - Token-Hash nicht sichtbar.
   - Authorization Header nicht sichtbar.
   - komplette Header nicht sichtbar.
   - Cookies nicht sichtbar.
   - Query-Werte nicht sichtbar.
   - rohe IP nicht sichtbar.
```

## Rueckfall-/Deaktivierungsstrategie

Geplant fuer RDAP92:

```text
- Wenn AGENT_RUNTIME_ENABLED=false, neue Verbindungen ablehnen.
- Wenn Build-Gate false, neue Verbindungen ablehnen.
- Wenn Runtime deaktiviert wird, bestehende Verbindung sauber schliessen oder offline setzen.
- Actions bleiben immer false.
- Keine Secrets sichtbar.
```

## Harte Grenzen weiterhin

```text
Keine Code-Aenderung in RDAP91.
Keine Runtime-Aktivierung in RDAP91.
Keine akzeptierte Stream-PC Verbindung in RDAP91.
Kein echter WebSocket-Handshake in RDAP91.
Kein Heartbeat-Receiver in RDAP91.
Kein Agent online in RDAP91.
Keine Agent-Actions in RDAP91.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Dateioperation.
Keine freie Prozessausfuehrung.
Keine freie URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine Admin-Notes-Aenderung.
Keine Secret-Ausgabe.
```

## Sichtbarer UI-Stand

Zielzustand nach RDAP91 bleibt:

```text
https://mods.forrestcgn.de/
Admin -> Verbindungen
Seite: Stream-PC Verbindung
Status: offline / disabled
Access-Key konfiguriert nur als Boolean sichtbar
Keine Action-Buttons
Kein eigenes Hauptmodul Agent
```

## Sprachregel bleibt

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
/agent-ws
```

Nicht sichtbar als Hauptmodul:

```text
Agent -> Agent-Status
```

## Naechster sinnvoller Step

```text
RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

Ziel:

```text
- Erster Backend-Code-Step fuer minimalen Transport-Accept.
- Vorher echte Dateien erneut lesen.
- Keine parallele /agent-ws Registrierung.
- Maximal WebSocket-Transport akzeptieren.
- Keine Actions.
- Kein Heartbeat, falls nicht separat explizit geplant.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
- Keine Secret-Ausgabe.
```

## Doku-only

RDAP91 aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
