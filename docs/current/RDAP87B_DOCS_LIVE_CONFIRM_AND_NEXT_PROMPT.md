# RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Live-Bestaetigung / naechster Chat-Prompt

## Zweck

RDAP87B dokumentiert die live bestaetigte sichere Konfiguration von:

```text
AGENT_ACCESS_KEY
```

auf dem Webserver fuer die Stream-PC Verbindung.

RDAP87B bestaetigt nur sichere Status-/Diagnosewerte. Der echte Key wurde nicht in Chat, Doku, Git, Status, UI oder Logs kopiert.

## Ausgangspunkt

```text
RDAP86 ist live:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard vorbereitet.
- Verbindungen werden weiterhin immer mit HTTP 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB.
- Keine Secret-Ausgabe.

RDAP87 ist Doku-only:
- Sicheres Setzen von AGENT_ACCESS_KEY in /etc/stream-control-center/remote-modboard.env dokumentiert.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Doku.
- Kein Key in Logs/Status/UI.
```

## Live bestaetigt

Auf dem Webserver getestet aus:

```text
/opt/stream-control-center/_deploy_tmp/RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
```

### Test 1: Sichere Statuspruefung nach gesetztem AGENT_ACCESS_KEY

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime.accessKeyConfigured, .runtime.acceptsAgentConnections, .runtime.effectiveEnabled, .rejectDiagnostic.secretsExposed, .rejectDiagnostic.bearerTokenLogged, .rejectDiagnostic.tokenLengthLogged, .rejectDiagnostic.tokenHashLogged'
```

Bestaetigtes Ergebnis:

```text
statusApiVersion: rdap_agent86.v1
runtime.accessKeyConfigured: true
runtime.acceptsAgentConnections: false
runtime.effectiveEnabled: false
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.bearerTokenLogged: false
rejectDiagnostic.tokenLengthLogged: false
rejectDiagnostic.tokenHashLogged: false
```

### Test 2: Reject-Test mit falschem Bearer nach gesetztem Key

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: stream-pc-main\r\nX-SCC-Agent-Protocol: rdap-agent-handshake.v1\r\nAuthorization: Bearer wrong-test-value\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Bestaetigtes Ergebnis:

```text
HTTP/1.1 503 Service Unavailable
Connection: close
Content-Type: text/plain; charset=utf-8
Cache-Control: no-store
X-Remote-Modboard-Agent-Runtime: disabled

Stream-PC connection runtime is disabled.
reason=invalid_connection_proof
```

### Test 3: Reject-Diagnose nach falschem Bearer

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.rejectDiagnostic'
```

Bestaetigtes Ergebnis:

```text
rejectDiagnostic.prepared: true
rejectDiagnostic.enabled: true
rejectDiagnostic.inMemoryOnly: true
rejectDiagnostic.persistsToDatabase: false
rejectDiagnostic.handshakePrecheckPrepared: true
rejectDiagnostic.handshakePrecheckAcceptsConnections: false
rejectDiagnostic.accessKeyComparePrepared: true
rejectDiagnostic.accessKeyCompareAcceptsConnections: false
rejectDiagnostic.expectedProtocolVersion: rdap-agent-handshake.v1
rejectDiagnostic.rejectCount: 1
rejectDiagnostic.lastRejectReason: invalid_connection_proof
rejectDiagnostic.lastRejectPath: /agent-ws
rejectDiagnostic.lastRejectStatusCode: 503
rejectDiagnostic.lastRejectMethod: GET
rejectDiagnostic.lastRejectHasAuthorizationHeader: true
rejectDiagnostic.lastRejectHasCookieHeader: false
rejectDiagnostic.lastRejectHasQueryString: false
rejectDiagnostic.lastRejectHasAgentIdHeader: true
rejectDiagnostic.lastRejectHasProtocolHeader: true
rejectDiagnostic.lastRejectAgentIdHint: stream-pc-main
rejectDiagnostic.lastRejectProtocolHint: rdap-agent-handshake.v1
rejectDiagnostic.lastRejectAccessKeyConfigured: true
rejectDiagnostic.lastRejectConnectionProofCompared: true
rejectDiagnostic.secretsExposed: false
rejectDiagnostic.secretsLogged: false
rejectDiagnostic.headersLogged: false
rejectDiagnostic.rawIpLogged: false
rejectDiagnostic.queryStringLogged: false
rejectDiagnostic.authorizationHeaderLogged: false
rejectDiagnostic.cookieHeaderLogged: false
rejectDiagnostic.agentIdHeaderValueLogged: false
rejectDiagnostic.protocolHeaderValueLogged: false
rejectDiagnostic.bearerTokenLogged: false
rejectDiagnostic.tokenLengthLogged: false
rejectDiagnostic.tokenHashLogged: false
rejectDiagnostic.acceptsAgentConnections: false
rejectDiagnostic.actionEnabled: false
rejectDiagnostic.productiveAgentRuntime: false
```

## Aktueller sicherer Stand

```text
- AGENT_ACCESS_KEY ist auf dem Webserver konfiguriert.
- accessKeyConfigured ist true.
- Der echte Key wurde nicht im Chat gepostet.
- Der echte Key ist nicht im Repo.
- Der echte Key ist nicht in Doku/Status/UI/Logs sichtbar.
- Falscher Bearer wird als invalid_connection_proof abgelehnt.
- Der Vergleich wurde serverseitig ausgefuehrt.
- /agent-ws wird weiterhin mit HTTP 503 abgelehnt.
- Keine Stream-PC Verbindung wird angenommen.
- Kein echter WebSocket-Handshake wird akzeptiert.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- Keine Agent-Actions aktiv.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Commands/Channelpoints.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
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
RDAP88_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

Ziel:

```text
- Noch keine Runtime aktivieren.
- Zuerst dokumentieren, welche Bedingungen fuer eine spaetere Runtime-Freigabe erfuellt sein muessen.
- Zwei-Stufen-Freigabe weiter einhalten.
- AGENT_RUNTIME_ENABLED=true allein darf weiterhin keine Verbindung akzeptieren.
- Akzeptierte Verbindung erst in separatem Code-Step nach explizitem go.
- Weiterhin keine Agent-Actions.
- Weiterhin keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Weiterhin keine DB-Migration ohne separaten Plan.
- Weiterhin keine Secret-Ausgabe.
```

## Doku-only

RDAP87B aendert keinen Backend-Code und braucht keinen Webserver-Deploy.
