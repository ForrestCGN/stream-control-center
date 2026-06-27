# RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Runtime-Enable-Plan

## Zweck

RDAP89 plant die spaetere Runtime-Freigabe fuer die Stream-PC Verbindung.

Wichtig:

```text
- RDAP89 aktiviert keine Runtime.
- RDAP89 akzeptiert keine Stream-PC Verbindung.
- RDAP89 baut keinen echten WebSocket-Handshake.
- RDAP89 baut keinen Heartbeat-Receiver.
- RDAP89 setzt keinen Agent online.
- RDAP89 aktiviert keine Agent-Actions.
- RDAP89 fuehrt keine DB-Migration aus.
- RDAP89 fuehrt keine neue Permission ein.
- RDAP89 gibt keine Secrets aus.
- RDAP89 ist Doku-only.
```

## Ausgangspunkt

```text
RDAP86:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard live bestaetigt.
- Verbindungen werden weiterhin immer mit HTTP 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine DB.
- Keine Secret-Ausgabe.

RDAP87:
- Sicheres AGENT_ACCESS_KEY Env-Setup dokumentiert.
- Env-Datei: /etc/stream-control-center/remote-modboard.env.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Doku.
- Kein Key in Logs/Status/UI.

RDAP87B:
- AGENT_ACCESS_KEY ist auf dem Webserver gesetzt.
- accessKeyConfigured true live bestaetigt.
- Falscher Bearer nach gesetztem Key liefert HTTP 503 / reason=invalid_connection_proof.
- Keine Verbindung.
- Keine Actions.
- Keine Secrets.

RDAP88:
- Correct-Bearer-Reject-Only-Test live bestaetigt.
- Korrekter Bearer liefert HTTP 503 / reason=runtime_not_effectively_enabled.
- lastRejectAccessKeyConfigured true.
- lastRejectConnectionProofCompared true.
- Keine Verbindung.
- Keine Actions.
- Keine Secrets.
```

## Aktueller technischer Ist-Zustand

```text
- server.js registriert den bestehenden disabled Upgrade-Guard.
- config.service.js liest AGENT_RUNTIME_ENABLED, haelt effectiveEnabled aber false.
- config.service.js liest AGENT_ACCESS_KEY nur als configured Boolean.
- agent-status.service.js meldet offline/disabled.
- agent-runtime-disabled.service.js lehnt /agent-ws weiterhin mit HTTP 503 ab.
- Der Access-Key-Compare ist nur reject-only.
```

## Zwei-Stufen-Freigabe

`AGENT_RUNTIME_ENABLED=true` darf spaeter nicht allein ausreichen, um eine Stream-PC Verbindung zu akzeptieren.

Geplantes Modell:

```text
Stufe 1: Betreiber-Wunsch per Env
- AGENT_RUNTIME_ENABLED=true
- signalisiert nur: Runtime darf grundsaetzlich geplant/gewuenscht sein.
- darf allein keine Verbindung akzeptieren.

Stufe 2: expliziter Code-/Build-Schalter
- ein spaeterer Code-Step muss ausdruecklich eine Accept-Freigabe einbauen.
- z. B. runtimeAcceptBuildEnabled / explicitRuntimeAcceptEnabled.
- dieser Schalter darf nur im geplanten Step aktiv werden.
- ohne diese zweite Stufe bleibt /agent-ws reject-only.

Ergebnis:
AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
```

## Spaetere Accept-Bedingungen fuer /agent-ws

Eine spaetere Verbindung darf erst akzeptiert werden, wenn alle Bedingungen erfuellt sind:

```text
1. Request-Pfad ist exakt /agent-ws.
2. Runtime ist zweistufig freigegeben.
3. X-SCC-Agent-Id ist vorhanden.
4. X-SCC-Agent-Id ist bekannt: stream-pc-main.
5. Authorization ist vorhanden.
6. Authorization nutzt Bearer-Schema.
7. AGENT_ACCESS_KEY ist serverseitig gesetzt.
8. Bearer stimmt serverseitig gegen AGENT_ACCESS_KEY.
9. X-SCC-Agent-Protocol ist rdap-agent-handshake.v1.
10. Es ist noch keine aktive Verbindung mit gleicher Agent-ID vorhanden.
11. Der Handshake akzeptiert nur den Transport, aber keine Actions.
```

## Reihenfolge der naechsten technischen Stufen

Die naechsten Stufen muessen strikt getrennt bleiben.

```text
RDAP89:
- Runtime-Freigabe planen.
- Keine Runtime aktivieren.
- Keine Verbindung akzeptieren.

Spaeterer Step A:
- Minimalen Runtime-Accept vorbereiten.
- Nur Verbindung akzeptieren.
- Noch keine Actions.
- Noch kein OBS/Sound/Overlay/Command.

Spaeterer Step B:
- Heartbeat-Receiver planen/implementieren.
- In-Memory first.
- Keine DB-Persistenz ohne separaten Plan.

Spaeterer Step C:
- Online/Stale/Offline-Status sauber anzeigen.
- Keine Actions.

Spaeterer Step D:
- Action-Allowlist planen.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.

Spaeterer Step E:
- Einzelne konkrete Actions separat planen.
- Jede Action eigener Scope, eigene Tests, eigene Sicherheitsgrenzen.
```

## Statuswerte spaeter sichtbar erlaubt

Spaeter sichtbar erlaubt:

```text
connectionState
connected
expectedAgentId
expectedAgentName
agentId
agentName
agentVersion
protocolVersion
connectedSince
lastHeartbeatAt
heartbeatAgeMs
stale
plannedTransport
plannedWsPath
accessKeyConfigured
runtimeRequestedEnabled
runtimeEffectiveEnabled
acceptsAgentConnections
```

Nicht sichtbar:

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

## Heartbeat-Abgrenzung

Heartbeat bleibt nach RDAP89 noch nicht aktiv.

Geplantes Heartbeat-Modell aus RDAP81/RDAP82 bleibt:

```text
plannedHeartbeatIntervalMs: 30000
staleAfterMs: 90000
offlineAfterMs: 120000
```

Heartbeat darf spaeter enthalten:

```text
agentId
agentName
agentVersion
protocolVersion
localTime
status
capabilitiesSummary
```

Heartbeat darf nicht enthalten:

```text
Secrets
Bearer
lokale absolute Pfade
freie Prozesslisten
freie Dateiinfos
OBS-/Sound-/Overlay-Details ohne separaten Scope
```

## Agent-Actions-Abgrenzung

Agent-Actions bleiben strikt getrennt.

Weiterhin nicht erlaubt:

```text
OBS-Steuerung
Sound-Ausloesung
Overlay-Schaltung
Command-/Channelpoints-Steuerung
freie Shell
freie Dateioperation
freie Prozesssteuerung
freie URL-Ausfuehrung
produktive Writes
DB-Schreibzugriffe
```

Spaeter muss jede einzelne Action separat geplant werden:

```text
- Name der Action.
- Wer darf sie ausloesen.
- Welche Permission ist noetig.
- Welche Payload ist erlaubt.
- Welche Payload ist verboten.
- Audit/Log-Konzept.
- Confirm/Lock falls kritisch.
- Timeout/Rate-Limit.
- Fehlerverhalten.
- Readback/Status.
```

## Ablehnungsgruende spaeter

Sichtbare sichere Ablehnungsgruende duerfen bleiben:

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
- Ablehnungsgruende duerfen keine Secrets enthalten.
- Ablehnungsgruende duerfen keine Rohheader enthalten.
- Ablehnungsgruende duerfen keine IP-Adressen enthalten.
- Ablehnungsgruende duerfen keine Query-Werte enthalten.
```

## Mindesttests fuer spaeteren Accept-Code-Step

Bevor eine spaetere Runtime-Aktivierung akzeptiert wird, muessen mindestens diese Tests geplant und bestanden werden:

```text
1. Status vor Aktivierung:
   - acceptsAgentConnections false.
   - effectiveEnabled false.
   - actionsEnabled false.

2. AGENT_RUNTIME_ENABLED=true allein:
   - weiterhin HTTP 503.
   - reason=runtime_not_effectively_enabled oder equivalent sicherer Grund.
   - acceptsAgentConnections false.

3. Falsche Agent-ID:
   - HTTP 503/401/403 je nach spaeterem Design.
   - reason=unknown_agent_id.
   - keine Verbindung.

4. Fehlender Bearer:
   - reason=missing_connection_proof.
   - keine Verbindung.

5. Falscher Bearer:
   - reason=invalid_connection_proof.
   - keine Verbindung.

6. Falsches Protocol:
   - reason=protocol_version_unsupported.
   - keine Verbindung.

7. Korrekter Bearer ohne zweite Freigabe:
   - keine Verbindung.

8. Korrekter Bearer mit zweiter Freigabe:
   - nur dann Verbindung akzeptieren.
   - keine Actions.
   - Heartbeat nur wenn im gleichen Step explizit geplant.

9. Secret-Safety:
   - AGENT_ACCESS_KEY nicht sichtbar.
   - Bearer nicht sichtbar.
   - Token-Laenge nicht sichtbar.
   - Token-Hash nicht sichtbar.
   - Authorization Header nicht sichtbar.

10. Status nach Verbindung:
   - connected true nur fuer echte aktive Verbindung.
   - actionsEnabled false.
   - productiveAgentRuntime nur false, solange keine Actions freigegeben sind.
```

## Harte Grenzen weiterhin

```text
Keine Runtime-Aktivierung in RDAP89.
Keine akzeptierte Stream-PC Verbindung in RDAP89.
Kein echter WebSocket-Handshake in RDAP89.
Kein Heartbeat-Receiver in RDAP89.
Kein Agent online in RDAP89.
Keine Agent-Actions in RDAP89.
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

Zielzustand bleibt:

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
RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN
```

Ziel:

```text
- Noch keine Actions.
- Minimalen Runtime-Accept-Code-Step planen.
- Exakten zweiten Freigabeschalter definieren.
- Entscheiden, ob Heartbeat im ersten Accept-Step noch disabled bleibt.
- Tests fuer weiterhin abgelehnte Faelle und exakt einen spaeter akzeptierten Fall definieren.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
- Keine Secret-Ausgabe.
```

## Doku-only

RDAP89 aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
