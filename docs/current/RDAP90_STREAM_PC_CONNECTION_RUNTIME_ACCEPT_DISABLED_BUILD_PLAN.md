# RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Runtime-Accept disabled Build-Plan

## Zweck

RDAP90 plant den spaeteren minimalen Runtime-Accept-Code-Step fuer die Stream-PC Verbindung.

Wichtig:

```text
- RDAP90 aendert keinen Backend-Code.
- RDAP90 aktiviert keine Runtime.
- RDAP90 akzeptiert keine Stream-PC Verbindung.
- RDAP90 baut keinen echten WebSocket-Handshake.
- RDAP90 baut keinen Heartbeat-Receiver.
- RDAP90 setzt keinen Agent online.
- RDAP90 aktiviert keine Agent-Actions.
- RDAP90 fuehrt keine DB-Migration aus.
- RDAP90 fuehrt keine neue Permission ein.
- RDAP90 gibt keine Secrets aus.
- RDAP90 ist Doku-only.
```

## Ausgangspunkt

```text
RDAP88:
- Correct-Bearer-Reject-Only-Test live bestaetigt.
- Korrekter Bearer liefert HTTP 503 / reason=runtime_not_effectively_enabled.
- Keine Verbindung.
- Keine Actions.
- Keine Secrets.

RDAP89:
- Runtime-Enable-Plan dokumentiert.
- AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Zwei-Stufen-Freigabe ist Pflicht.
- Heartbeat/Online/Actions bleiben getrennte Stufen.
- Keine Runtime aktiviert.
- Keine Verbindung akzeptiert.
- Keine Secrets.
```

## Aktueller technischer Ist-Zustand

```text
- server.js registriert den bestehenden disabled Upgrade-Guard.
- config.service.js liest AGENT_RUNTIME_ENABLED, haelt effectiveEnabled aber false.
- config.service.js liest AGENT_ACCESS_KEY nur als configured Boolean.
- agent-runtime-disabled.service.js haengt am upgrade-Event fuer /agent-ws.
- evaluateHandshakePrecheck prueft Agent-ID, Authorization, Bearer, Protocol und Access-Key.
- Bei korrektem Bearer endet der aktuelle Guard bewusst mit runtime_not_effectively_enabled.
- rejectUpgrade liefert HTTP 503.
- agent-status.service.js meldet weiterhin offline/disabled und acceptsAgentConnections=false.
```

## Grundsatz fuer spaeteren Accept-Code-Step

Der spaetere Code-Step darf maximal den Transport akzeptieren.

Nicht automatisch erlaubt:

```text
Heartbeat
Agent-Actions
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

## Zweiter Freigabeschalter

`AGENT_RUNTIME_ENABLED=true` darf weiterhin nicht allein reichen.

Geplanter spaeterer Mechanismus:

```text
Stufe 1:
AGENT_RUNTIME_ENABLED=true
- Betreiber-Wunsch per Env.
- Allein wirkungslos fuer Accept.

Stufe 2:
Code-/Build-Freigabe im geplanten Build.
- z. B. runtimeAcceptBuildEnabled=true.
- z. B. acceptConnectionsBuildEnabled=true.
- muss im spaeteren MODULE_BUILD klar sichtbar sein.
- darf nicht versehentlich durch Env allein gesetzt werden.

Nur wenn beide Stufen true sind:
- Transport-Accept darf spaeter moeglich sein.
- Actions bleiben trotzdem false.
```

## Namensvorschlag fuer spaetere Statusfelder

```text
runtime.twoStepRuntimeGate: true
runtime.requestedEnabled: true/false
runtime.acceptBuildPrepared: true
runtime.acceptBuildEnabled: true/false
runtime.effectiveEnabled: true/false
runtime.acceptsAgentConnections: true/false
runtime.actionsEnabled: false
runtime.productiveAgentRuntime: false
```

## Strukturentscheidung

Keine parallele Runtime-Struktur erfinden.

Geplanter Weg:

```text
1. Bestehenden Guard in agent-runtime-disabled.service.js weiterverwenden, solange er fachlich reject-only bleibt.
2. Spaeter beim ersten echten Accept-Code-Step pruefen, ob die Datei fachlich umbenannt oder in ein neues Runtime-Service-Modul getrennt werden muss.
3. Neue Datei nur dann, wenn der Code wirklich akzeptierte Verbindungen verwaltet und der Name disabled fachlich falsch wird.
4. Keine parallele zweite /agent-ws Registrierung.
5. Es darf immer nur eine Upgrade-Registrierung fuer /agent-ws verantwortlich sein.
```

## Spaetere Accept-Bedingungen

Eine Verbindung darf spaeter nur akzeptiert werden, wenn alle Bedingungen erfuellt sind:

```text
1. Request-Pfad ist exakt /agent-ws.
2. AGENT_RUNTIME_ENABLED=true.
3. Zweiter Code-/Build-Schalter ist aktiv.
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

## Verbindungsverwaltung fuer spaeteren Accept-Step

Der spaetere Accept-Code-Step braucht zunaechst nur In-Memory-Verwaltung.

Geplante minimale Felder:

```text
connected: true/false
connectionState: offline/connected/stale
agentId
agentName
agentVersion
protocolVersion
connectedSince
lastSeenAt
lastHeartbeatAt
heartbeatAgeMs
stale
reconnectCount
```

Nicht speichern oder anzeigen:

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

## Heartbeat-Entscheidung

RDAP90 empfiehlt:

```text
Der erste Accept-Code-Step sollte noch keinen produktiven Heartbeat-Receiver bauen.
```

Begruendung:

```text
- Erst Transport-Accept isoliert testen.
- Online/Offline/Stale nicht mit Accept vermischen.
- Heartbeat-Payload separat planen.
- Keine Daten vom Stream-PC annehmen, bevor erlaubte Felder klar sind.
```

Erlaubte Alternative fuer spaeteren Code-Step nur nach explizitem Plan:

```text
Minimaler read-only Ping/Hello ohne Actions.
Keine DB.
Keine Secrets.
Keine OBS-/Sound-/Overlay-Daten.
Keine lokalen Pfade.
Keine Prozesslisten.
```

## Agent-Actions bleiben aus

Auch bei spaeter akzeptierter Verbindung bleibt:

```text
actionsEnabled=false
productiveAgentRuntime=false
agentActions=false
remoteWritesControlled=true
```

Keine Action darf allein durch Verbindung moeglich werden.

## Testmatrix fuer spaeteren Accept-Code-Step

Pflichttests vor Live-Freigabe:

```text
1. Status Default:
   - AGENT_RUNTIME_ENABLED fehlt/false.
   - acceptBuildEnabled false.
   - acceptsAgentConnections false.
   - effectiveEnabled false.
   - actionsEnabled false.

2. AGENT_RUNTIME_ENABLED=true allein:
   - weiterhin reject.
   - reason=runtime_not_effectively_enabled oder sicherer equivalent.
   - acceptsAgentConnections false.

3. Fehlende Agent-ID:
   - reject.
   - reason=missing_agent_id.
   - keine Verbindung.

4. Falsche Agent-ID:
   - reject.
   - reason=unknown_agent_id.
   - keine Verbindung.

5. Fehlende Authorization:
   - reject.
   - reason=missing_connection_proof.
   - keine Verbindung.

6. Falsches Auth-Schema:
   - reject.
   - reason=invalid_connection_proof.
   - keine Verbindung.

7. AGENT_ACCESS_KEY nicht konfiguriert:
   - reject.
   - reason=access_key_not_configured.
   - keine Verbindung.

8. Falscher Bearer:
   - reject.
   - reason=invalid_connection_proof.
   - keine Verbindung.

9. Falsches Protocol:
   - reject.
   - reason=protocol_version_unsupported.
   - keine Verbindung.

10. Korrekter Bearer ohne zweiten Build-Schalter:
   - reject.
   - reason=runtime_not_effectively_enabled.
   - keine Verbindung.

11. Korrekter Bearer mit beiden Freigaben:
   - spaeter genau ein akzeptierter Transportfall.
   - connected true.
   - actionsEnabled false.
   - productiveAgentRuntime false.

12. Zweite Verbindung gleicher Agent-ID:
   - reject.
   - reason=agent_already_connected.
   - bestehende Verbindung bleibt stabil oder wird nach definiertem Verhalten ersetzt.
   - Verhalten muss vorher entschieden werden.

13. Secret-Safety:
   - AGENT_ACCESS_KEY nicht sichtbar.
   - Bearer nicht sichtbar.
   - Token-Laenge nicht sichtbar.
   - Token-Hash nicht sichtbar.
   - Authorization Header nicht sichtbar.
   - keine kompletten Header.
   - keine Cookies.
   - keine Query-Werte.
   - keine rohe IP.
```

## Rueckfall-/Deaktivierungsstrategie

Der spaetere Code-Step muss jederzeit sicher deaktivierbar bleiben.

Geplante Deaktivierung:

```text
AGENT_RUNTIME_ENABLED=false
oder
Code-/Build-Schalter false
```

Erwartetes Verhalten:

```text
- Neue /agent-ws Versuche werden abgelehnt.
- Bestehende Verbindung wird sauber geschlossen oder als disabled/offline markiert.
- Actions bleiben false.
- Status zeigt offline/disabled.
- Keine Secrets werden ausgegeben.
```

## Harte Grenzen weiterhin

```text
Keine Code-Aenderung in RDAP90.
Keine Runtime-Aktivierung in RDAP90.
Keine akzeptierte Stream-PC Verbindung in RDAP90.
Kein echter WebSocket-Handshake in RDAP90.
Kein Heartbeat-Receiver in RDAP90.
Kein Agent online in RDAP90.
Keine Agent-Actions in RDAP90.
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

Zielzustand bleibt nach RDAP90:

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
RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN
```

Ziel:

```text
- Vor dem ersten Code-Step noch einmal echte Dateien lesen.
- Entscheiden, ob bestehender Service erweitert oder fachlich getrennt wird.
- Minimalen Transport-Accept-Code-Step planen.
- Noch keine Actions.
- Heartbeat moeglichst weiter trennen.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
- Keine Secret-Ausgabe.
```

## Doku-only

RDAP90 aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
