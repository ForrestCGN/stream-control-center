# RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Correct-Bearer-Reject-Only-Test

## Zweck

RDAP88 dokumentiert den sicheren Test mit korrekt geladenem `AGENT_ACCESS_KEY` als Bearer fuer die Stream-PC Verbindung.

Wichtig:

```text
- Der echte AGENT_ACCESS_KEY wurde nicht in Chat, Doku, Git, Status, UI oder Logs ausgegeben.
- Der Bearer-Wert wurde nicht in Chat, Doku, Git, Status, UI oder Logs ausgegeben.
- Keine Token-Laenge wurde ausgegeben.
- Kein Token-Hash wurde ausgegeben.
- Der Test lief nur lokal auf dem Webserver.
- Keine Stream-PC Verbindung wurde akzeptiert.
- Kein echter WebSocket-Handshake wurde akzeptiert.
- Keine Runtime wurde aktiviert.
- Keine Agent-Actions wurden aktiviert.
- Keine DB-Migration.
- Keine neue Permission.
```

## Ausgangspunkt

```text
RDAP86:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard live bestaetigt.
- statusApiVersion: rdap_agent86.v1.
- Verbindungen werden weiterhin immer mit HTTP 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB.
- Keine Secret-Ausgabe.

RDAP87:
- Sicheres AGENT_ACCESS_KEY Env-Setup dokumentiert.
- Env-Datei: /etc/stream-control-center/remote-modboard.env.
- Doku-only.

RDAP87B:
- AGENT_ACCESS_KEY wurde auf dem Webserver gesetzt.
- accessKeyConfigured true live bestaetigt.
- Falscher Bearer nach gesetztem Key liefert invalid_connection_proof.
- Keine Verbindung.
- Keine Actions.
- Keine Secrets.
```

## RDAP88 Live-Test

Auf dem Webserver getestet aus:

```text
/opt/stream-control-center/_deploy_tmp/RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
```

Der echte Key wurde lokal aus der Env-Datei gelesen und nur als HTTP-Header an `127.0.0.1:3010` uebergeben. Der Wert wurde nicht ausgegeben.

### Test 1: Correct-Bearer-Reject

Bestaetigtes Ergebnis:

```text
agent_access_key_loaded=true
HTTP/1.1 503 Service Unavailable
reason=runtime_not_effectively_enabled
```

Bedeutung:

```text
- AGENT_ACCESS_KEY konnte lokal geladen werden.
- Der Bearer wurde serverseitig erfolgreich verglichen.
- Der Request wurde trotzdem abgelehnt.
- Der Ablehnungsgrund ist korrekt: runtime_not_effectively_enabled.
- Die Stream-PC Verbindung bleibt disabled/reject-only.
```

### Test 2: Sichere Diagnose nach Correct-Bearer-Test

Bestaetigtes Ergebnis:

```text
statusApiVersion: rdap_agent86.v1

runtime.accessKeyConfigured: true
runtime.acceptsAgentConnections: false
runtime.effectiveEnabled: false

rejectDiagnostic.rejectCount: 2
rejectDiagnostic.lastRejectReason: runtime_not_effectively_enabled
rejectDiagnostic.lastRejectAccessKeyConfigured: true
rejectDiagnostic.lastRejectConnectionProofCompared: true
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.bearerTokenLogged: false
rejectDiagnostic.tokenLengthLogged: false
rejectDiagnostic.tokenHashLogged: false
rejectDiagnostic.acceptsAgentConnections: false
rejectDiagnostic.actionEnabled: false
rejectDiagnostic.productiveAgentRuntime: false
```

## Sicherheitsbewertung

```text
- Correct-Bearer-Compare funktioniert.
- Der Guard erkennt den korrekten Bearer serverseitig.
- Trotz korrektem Bearer wird keine Verbindung akzeptiert.
- Runtime bleibt effectiveEnabled=false.
- acceptsAgentConnections bleibt false.
- actionEnabled bleibt false.
- productiveAgentRuntime bleibt false.
- Keine Secrets wurden sichtbar.
- Kein Bearer-Token wurde geloggt oder ausgegeben.
- Keine Token-Laenge wurde geloggt oder ausgegeben.
- Kein Token-Hash wurde geloggt oder ausgegeben.
```

## Aktueller sicherer Stand nach RDAP88

```text
- Webserver <-> Stream-PC Verbindung ist weiterhin nicht aktiv.
- /agent-ws bleibt guarded.
- Handshake-Precheck ist vorbereitet.
- Access-Key-Compare ist vorbereitet und mit falschem sowie korrektem Bearer getestet.
- Korrekte Bearer-Pruefung fuehrt weiterhin nur zu runtime_not_effectively_enabled.
- Keine akzeptierte Stream-PC Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent online.
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
RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

Ziel:

```text
- Noch keine Runtime aktivieren.
- Noch keine Verbindung akzeptieren.
- Zuerst Plan fuer Runtime-Freigabe erstellen.
- Bedingungen fuer spaeteren Accept definieren.
- Zwei-Stufen-Freigabe erhalten.
- AGENT_RUNTIME_ENABLED=true allein darf weiterhin nicht reichen.
- Kein Agent online.
- Kein Heartbeat-Receiver.
- Keine produktiven Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Doku-only

RDAP88 aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
