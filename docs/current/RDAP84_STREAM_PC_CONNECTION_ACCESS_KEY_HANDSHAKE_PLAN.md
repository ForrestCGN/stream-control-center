# RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Access-Key-Handshake-Plan

## Zweck

RDAP84 plant, wie der spaetere Zugangsschluessel-Handshake fuer die Stream-PC Verbindung sicher geprueft werden soll.

Wichtig:

```text
- Keine Runtime-Aktivierung.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent wird online gesetzt.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Kein Backend-Code in diesem Step.
```

## Ausgangspunkt

```text
RDAP83 ist live bestaetigt.
RDAP83B hat den Live-Abschluss dokumentiert.
Der /agent-ws Upgrade-Guard lehnt weiterhin mit 503 ab.
Reject-Diagnose ist in-memory only.
rejectCount steigt nach abgelehnten /agent-ws Versuchen.
Runtime bleibt effective false.
WSS Runtime bleibt false.
Heartbeat Receiver bleibt false.
acceptsAgentConnections bleibt false.
Keine Agent-Actions aktiv.
```

## Aktueller technischer Bestand

`config.service.js` liest bereits vorbereitend:

```text
AGENT_RUNTIME_ENABLED
AGENT_WS_PATH
AGENT_EXPECTED_ID
AGENT_EXPECTED_NAME
AGENT_ACCESS_KEY
```

Dabei gilt weiterhin:

```text
AGENT_ACCESS_KEY wird nur als configured Boolean behandelt.
AGENT_ACCESS_KEY wird nicht ausgegeben.
AGENT_ACCESS_KEY wird nicht geloggt.
runtime.effectiveEnabled bleibt false.
wssRuntimeEnabled bleibt false.
heartbeatReceiverEnabled bleibt false.
```

`agent-runtime-disabled.service.js` registriert aktuell den disabled Upgrade-Guard fuer `/agent-ws` und zaehlt abgelehnte Verbindungsversuche sicher in-memory.

## Geplanter spaeterer Handshake-Header-Vertrag

Der Stream-PC soll spaeter nur ueber definierte Header mit dem Webserver sprechen.

Geplant:

```text
Authorization: Bearer <geheimer-wert>
X-SCC-Agent-Id: stream-pc-main
X-SCC-Agent-Version: <version>
X-SCC-Agent-Protocol: rdap-agent-handshake.v1
```

Bedeutung:

```text
Authorization
- enthaelt den Zugangsschluessel.
- darf niemals in Status, UI, Logs oder Diagnose ausgegeben werden.
- darf spaeter nur serverseitig gegen AGENT_ACCESS_KEY geprueft werden.

X-SCC-Agent-Id
- muss fuer die erste Runtime-Stufe stream-pc-main sein.
- andere Agent-IDs bleiben unbekannt/abgelehnt, bis separat geplant.

X-SCC-Agent-Version
- darf spaeter sichtbar als gekuerzter/sanitized Wert erscheinen.
- darf nicht frei lange Strings in Logs oder UI schreiben.

X-SCC-Agent-Protocol
- erwarteter Wert fuer erste Handshake-Stufe: rdap-agent-handshake.v1
- falsche/fehlende Version fuehrt zu protocol_version_unsupported.
```

## Zwei-Stufen-Freigabe

`AGENT_RUNTIME_ENABLED=true` darf spaeter nicht allein reichen, um Verbindungen anzunehmen.

Geplante Sicherheitsregel:

```text
1. Env/Config kann Runtime-Wunsch signalisieren.
2. Code muss trotzdem eine separate effectiveRuntime-Freigabe besitzen.
3. Ein spaeterer Runtime-Step muss explizit planen und bestaetigen:
   - welche Verbindungen akzeptiert werden,
   - welche Guards aktiv bleiben,
   - welche Statuswerte sichtbar werden,
   - welche Tests erfolgreich waren.
```

Damit bleibt verhindert, dass ein falsch gesetztes Env-Flag versehentlich die Stream-PC Verbindung produktiv oeffnet.

## Geplante Pruefreihenfolge fuer spaeter

Nur als Planung, noch nicht aktiv:

```text
1. Ist der Request wirklich /agent-ws?
2. Ist Runtime effektiv freigegeben?
3. Ist X-SCC-Agent-Id vorhanden?
4. Ist X-SCC-Agent-Id bekannt?
5. Ist Authorization vorhanden?
6. Ist Authorization syntaktisch Bearer?
7. Stimmt der Zugangsschluessel serverseitig gegen AGENT_ACCESS_KEY?
8. Ist X-SCC-Agent-Protocol unterstuetzt?
9. Ist bereits ein Agent mit gleicher ID verbunden?
10. Erst dann duerfte ein spaeterer separater Runtime-Step einen Handshake akzeptieren.
```

RDAP84 aktiviert diese Pruefreihenfolge nicht. RDAP84 dokumentiert nur den Plan.

## Geplante sichere Ablehnungsgruende

Aktuell sichtbar aus RDAP83:

```text
agent_runtime_disabled
malformed_upgrade_request
invalid_agent_ws_path
```

Fuer spaetere Handshake-Pruefschritte geplant:

```text
runtime_not_effectively_enabled
missing_agent_id
unknown_agent_id
missing_connection_proof
invalid_connection_proof
protocol_version_unsupported
agent_already_connected
```

Regeln:

```text
- Ablehnungsgruende duerfen sichtbar sein.
- Ablehnungsgruende duerfen keine Secrets enthalten.
- Ablehnungsgruende duerfen keine Rohheader enthalten.
- Ablehnungsgruende duerfen keine IP-Adressen enthalten.
- Ablehnungsgruende duerfen keine Query-Werte enthalten.
```

## Sichtbare Diagnose spaeter erlaubt

Sichtbar erlaubt als sichere Summary:

```text
handshakePlanPrepared: true
handshakeRuntimeActivationRequired: true
expectedAgentId: stream-pc-main
expectedAgentName: Forrest Stream-PC
expectedProtocolVersion: rdap-agent-handshake.v1
accessKeyConfigured: true/false
accessKeyExposed: false
accessKeyLogged: false
lastRejectReason: <safe_reason|null>
lastRejectHasAuthorizationHeader: true/false
lastRejectHasAgentIdHeader: true/false
lastRejectHasProtocolHeader: true/false
lastRejectAgentIdHint: <sanitized|null>
lastRejectProtocolHint: <sanitized|null>
```

Wichtig:

```text
Authorization-Wert niemals anzeigen.
Cookie-Wert niemals anzeigen.
Query-Wert niemals anzeigen.
Roh-IP niemals anzeigen.
Komplette Header niemals anzeigen.
```

## Niemals loggen oder ausgeben

```text
Authorization Header Value
AGENT_ACCESS_KEY
Cookies
komplette Header
Query-String-Werte
rohe IP-Adresse
Request-Body
lokale absolute Pfade
freie Prozesslisten
freie Dateiinfos
OBS-/Sound-/Overlay-Details ohne separaten Scope
```

## In-Memory first

Fuer die erste echte Runtime-Stufe bleibt geplant:

```text
In-Memory only.
Keine DB-Migration.
Keine Persistenz.
```

Grund:

```text
- Fuer ersten Verbindungsstatus reicht Runtime-Status.
- Persistenz braucht Schema, Backup, Migration, Readback und separaten Plan.
- Audit-/Verlaufstabellen kommen spaeter getrennt.
```

## Harte Grenzen

```text
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
Keine Agent-Action-Queue.
Kein echter Online-Status.
Kein akzeptierter WebSocket-Handshake.
Kein Access-Key im Repo.
Kein Access-Key in UI, Status oder Logs.
```

## Naechster sinnvoller Step

```text
RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```

Moeglicher Scope fuer RDAP85 nur nach neuem Plan und explizitem go:

```text
- Header-/Handshake-Precheck in bestehendem disabled Guard vorbereiten.
- Verbindungen weiterhin ablehnen.
- missing/invalid/unknown Gruende sicher diagnostizieren.
- Keine akzeptierte Agent-Verbindung.
- Keine Runtime-Aktivierung.
- Keine Actions.
- Keine DB.
- Keine Secret-Ausgabe.
```
