# RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Stream-PC Verbindung / Access-Key Env Setup

## Zweck

RDAP87 dokumentiert, wie `AGENT_ACCESS_KEY` sicher auf dem Webserver fuer die Stream-PC Verbindung gesetzt und geprueft wird.

Wichtig:

```text
- Doku-only.
- Kein Backend-Code.
- Kein ZIP mit Secret-Wert.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Doku.
- Kein Key in Logs.
- Kein Key in Status/UI.
- Keine Runtime-Aktivierung.
- Keine akzeptierte Stream-PC Verbindung.
- Keine Agent-/Remote-Actions.
- Keine DB-Migration.
- Keine neue Permission.
```

## Ausgangspunkt

```text
RDAP86 ist live bestaetigt.
RDAP86B hat den Live-Abschluss dokumentiert.
Der bestehende disabled /agent-ws Guard kann serverseitig gegen AGENT_ACCESS_KEY pruefen.
AGENT_ACCESS_KEY ist aktuell nicht gesetzt.
accessKeyConfigured ist aktuell false.
Bearer bei nicht gesetztem Key fuehrt zu reason=access_key_not_configured.
Verbindungen werden weiterhin immer mit HTTP 503 abgelehnt.
```

## Zielzustand nach lokalem Env-Setup auf dem Webserver

Nach sicherem Setzen des Keys und Service-Restart soll sichtbar nur bestaetigt werden:

```text
runtime.accessKeyConfigured: true
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.bearerTokenLogged: false
rejectDiagnostic.tokenLengthLogged: false
rejectDiagnostic.tokenHashLogged: false
acceptsAgentConnections: false
actionEnabled: false
productiveAgentRuntime: false
```

Der Key selbst darf niemals sichtbar werden.

## Env-Datei

Die Remote-Modboard-Env-Datei liegt auf dem Webserver lokal unter:

```text
/etc/stream-control-center/remote-modboard.env
```

Diese Datei ist nicht Teil des Git-Repos und darf nicht in ZIPs, Chat, Doku oder Screenshots kopiert werden.

## Sichere Rechte fuer Env-Verzeichnis und Datei

Auf dem Webserver:

```bash
sudo install -d -m 750 -o root -g root /etc/stream-control-center
sudo touch /etc/stream-control-center/remote-modboard.env
sudo chmod 600 /etc/stream-control-center/remote-modboard.env
sudo chown root:root /etc/stream-control-center/remote-modboard.env
```

## Key lokal auf dem Webserver erzeugen

Optional sicher lokal auf dem Webserver erzeugen:

```bash
openssl rand -base64 48
```

Wichtig:

```text
Den erzeugten Wert nicht in Chat/Git/Doku kopieren.
Den Wert nicht in Screenshots zeigen.
Den Wert nicht in Shell-Ausgaben posten.
Den Wert nur lokal auf dem Webserver in die Env-Datei uebernehmen.
```

## Key lokal in Env-Datei eintragen

```bash
sudo nano /etc/stream-control-center/remote-modboard.env
```

Dort lokal ergaenzen oder aktualisieren:

```text
AGENT_ACCESS_KEY=<lokal_einen_neuen_langen_zufaelligen_wert_eintragen>
```

Der Platzhalter darf in Doku/Chat stehen. Der echte Wert darf es nicht.

## Service neu starten

```bash
sudo systemctl restart scc-remote-modboard.service
```

Readiness-Check:

```bash
for i in {1..20}; do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    break
  fi
  sleep 1
done
```

## Sichere Pruefung ohne Secret-Ausgabe

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime.accessKeyConfigured, .runtime.acceptsAgentConnections, .runtime.effectiveEnabled, .rejectDiagnostic.secretsExposed, .rejectDiagnostic.bearerTokenLogged, .rejectDiagnostic.tokenLengthLogged, .rejectDiagnostic.tokenHashLogged'
```

Erwartung:

```text
"rdap_agent86.v1"
true
false
false
false
false
false
false
```

## Optionaler Reject-Test mit falschem Bearer

Nach gesetztem `AGENT_ACCESS_KEY` darf ein falscher Bearer nicht mehr `access_key_not_configured` liefern, sondern `invalid_connection_proof`.

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: stream-pc-main\r\nX-SCC-Agent-Protocol: rdap-agent-handshake.v1\r\nAuthorization: Bearer wrong-test-value\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Erwartung:

```text
HTTP/1.1 503 Service Unavailable
reason=invalid_connection_proof
```

Danach Diagnose pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.rejectDiagnostic'
```

Erwartete sichere Werte:

```text
lastRejectReason: invalid_connection_proof
lastRejectHasAuthorizationHeader: true
lastRejectAccessKeyConfigured: true
lastRejectConnectionProofCompared: true
secretsExposed: false
secretsLogged: false
headersLogged: false
rawIpLogged: false
authorizationHeaderLogged: false
bearerTokenLogged: false
tokenLengthLogged: false
tokenHashLogged: false
acceptsAgentConnections: false
actionEnabled: false
productiveAgentRuntime: false
```

## Optionaler Test mit korrektem Bearer

Dieser Test darf nur lokal auf dem Webserver durchgefuehrt werden, ohne den echten Wert in Chat/Doku/Logs zu kopieren.

Sicheres Prinzip:

```text
- Den echten Key nicht in die sichtbare Befehlsausgabe posten.
- Den echten Key nicht in Chat kopieren.
- Den echten Key nicht in die Doku kopieren.
- Wenn getestet wird, dann lokal und ohne Screenshot des Werts.
```

Erwartung bei korrekt gesetztem Bearer bleibt weiterhin:

```text
HTTP/1.1 503 Service Unavailable
reason=runtime_not_effectively_enabled
```

Denn RDAP87 aktiviert keine Runtime und akzeptiert keine Verbindung.

## Weiterhin nicht erlaubt

```text
Keine akzeptierte Stream-PC Verbindung.
Kein echter WebSocket-Handshake.
Kein Heartbeat-Receiver.
Kein Agent online.
Keine Action-Queue.
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
Kein Access-Key im Repo.
Kein Access-Key in UI/Status/Logs.
Kein Bearer-Token in UI/Status/Logs.
Keine Token-Laenge und kein Token-Hash in UI/Status/Logs.
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

## Naechster sinnvoller Step

```text
RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

Nach manuellem Env-Setup auf dem Webserver nur Live-Bestaetigung dokumentieren und naechsten Prompt vorbereiten.
