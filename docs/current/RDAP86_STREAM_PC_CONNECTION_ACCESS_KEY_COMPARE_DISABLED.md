# RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code + Doku / Stream-PC Verbindung / Access-Key-Compare disabled

## Ziel

RDAP86 erweitert den bestehenden disabled `/agent-ws` Upgrade-Guard um einen sicheren serverseitigen Vergleich gegen `AGENT_ACCESS_KEY`.

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
```

## Ausgangspunkt

```text
RDAP85 ist live bestaetigt.
RDAP85B hat den Live-Abschluss dokumentiert.
Der /agent-ws Upgrade-Guard erkennt sichere Precheck-Reject-Gruende.
Reject-Diagnose ist in-memory only.
Runtime bleibt effective false.
WSS Runtime bleibt false.
Heartbeat Receiver bleibt false.
acceptsAgentConnections bleibt false.
Keine Agent-Actions aktiv.
```

## Umgesetzt

```text
remote-modboard/backend/server.js
- MODULE_BUILD auf RDAP86 gesetzt.

remote-modboard/backend/src/services/agent-runtime-disabled.service.js
- Bestehenden disabled Upgrade-Guard erweitert.
- Access-Key-Compare vorbereitet, aber nur fuer Ablehnung/Diagnose.
- Liest AGENT_ACCESS_KEY nur serverseitig aus process.env.
- Authorization Bearer wird nur intern verglichen.
- Bearer-Wert, Token-Laenge, Token-Hash und AGENT_ACCESS_KEY werden nie ausgegeben.
- Erkennt access_key_not_configured.
- Erkennt invalid_connection_proof bei falschem Bearer-Wert.
- Erkennt runtime_not_effectively_enabled bei syntaktisch und geheimnisbasiert passendem Proof, weil Runtime weiter disabled ist.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine DB-Persistenz.
- Keine Verbindung wird angenommen.

remote-modboard/backend/src/services/agent-status.service.js
- StatusApiVersion auf rdap_agent86.v1 gesetzt.
- Agent-Statusantwort enthaelt Access-Key-Compare-Summary.
- /api/remote/status .agent enthaelt nur sichere Summary-Werte.
- /api/remote/routes .agentStatusFoundation enthaelt sichere Access-Key-Compare-Summary.
```

## Sichtbare sichere Ablehnungsgruende

```text
agent_runtime_disabled
malformed_upgrade_request
invalid_agent_ws_path
runtime_not_effectively_enabled
missing_agent_id
unknown_agent_id
missing_connection_proof
invalid_connection_proof
protocol_version_unsupported
access_key_not_configured
```

## Compare-Logik

```text
1. Request muss /agent-ws sein, sonst ignoriert der Guard weiter.
2. Fehlt X-SCC-Agent-Id -> missing_agent_id.
3. Ist X-SCC-Agent-Id nicht stream-pc-main -> unknown_agent_id.
4. Fehlt Authorization -> missing_connection_proof.
5. Ist Authorization nicht Bearer <wert> -> invalid_connection_proof.
6. Ist X-SCC-Agent-Protocol nicht rdap-agent-handshake.v1 -> protocol_version_unsupported.
7. Ist AGENT_ACCESS_KEY nicht serverseitig konfiguriert -> access_key_not_configured.
8. Ist Bearer-Wert falsch -> invalid_connection_proof.
9. Ist Bearer-Wert korrekt -> runtime_not_effectively_enabled.
10. Trotzdem immer HTTP 503 und keine Verbindung.
```

## Sichtbare sichere Diagnose

Erlaubt sichtbar:

```text
rejectDiagnostic.accessKeyComparePrepared
rejectDiagnostic.accessKeyCompareAcceptsConnections
rejectDiagnostic.lastRejectAccessKeyConfigured
rejectDiagnostic.lastRejectConnectionProofCompared
rejectDiagnostic.lastRejectHasAuthorizationHeader
rejectDiagnostic.lastRejectReason
```

## Niemals loggen oder ausgeben

```text
Authorization Header Value
Bearer Token
Bearer Token Laenge
Bearer Token Hash
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

## API-Erwartung

```text
GET /api/remote/agent/status
- statusApiVersion: rdap_agent86.v1
- runtime.acceptsAgentConnections: false
- runtime.accessKeyComparePrepared: true
- runtime.accessKeyCompareAcceptsConnections: false
- rejectDiagnostic.accessKeyComparePrepared: true
- rejectDiagnostic.accessKeyCompareAcceptsConnections: false
- rejectDiagnostic.secretsExposed: false
- rejectDiagnostic.bearerTokenLogged: false
- rejectDiagnostic.tokenLengthLogged: false
- rejectDiagnostic.tokenHashLogged: false
```

```text
GET /api/remote/status
- .agent.statusApiVersion: rdap_agent86.v1
- .agent.accessKeyComparePrepared: true
- .agent.accessKeyCompareAcceptsConnections: false
- .agent.rejectSecretsExposed: false
```

```text
GET /api/remote/routes
- .agentStatusFoundation.statusApiVersion: rdap_agent86.v1
- .agentStatusFoundation.accessKeyComparePrepared: true
- .agentStatusFoundation.accessKeyCompareAcceptsConnections: false
- .agentStatusFoundation.rejectSecretsExposed: false
```

## Tests lokal

```powershell
cd D:\Git\stream-control-center

node --check .emote-modboardackend\server.js
node --check .emote-modboardackend\src\services\config.service.js
node --check .emote-modboardackend\src\servicesgent-status.service.js
node --check .emote-modboardackend\src\servicesgent-runtime-disabled.service.js
node --check .emote-modboardackend\srcoutes\status.routes.js
node --check .emote-modboardackend\srcoutesoutes.routes.js

git status --short
git diff --stat
```

## Webserver-Deploy nach stepdone

Da RDAP86 Code unter `remote-modboard/` aendert, ist nach erfolgreichem `stepdone.cmd` ein Webserver-Deploy noetig.

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
cd RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
sudo bash tools/remote-modboard-deploy.sh RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime, .rejectDiagnostic'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
```

Reject-Tests ohne echten Key-Wert in Doku:

```bash
printf 'GET /agent-ws HTTP/1.1
Host: mods.forrestcgn.de
Connection: Upgrade
Upgrade: websocket
X-SCC-Agent-Id: stream-pc-main
X-SCC-Agent-Protocol: rdap-agent-handshake.v1
Authorization: Basic nope

' | nc -w 2 127.0.0.1 3010

printf 'GET /agent-ws HTTP/1.1
Host: mods.forrestcgn.de
Connection: Upgrade
Upgrade: websocket
X-SCC-Agent-Id: stream-pc-main
X-SCC-Agent-Protocol: rdap-agent-handshake.v1
Authorization: Bearer wrong-test-value

' | nc -w 2 127.0.0.1 3010
```

Wenn `AGENT_ACCESS_KEY` nicht gesetzt ist:

```text
reason=access_key_not_configured
```

Wenn `AGENT_ACCESS_KEY` gesetzt ist und der Bearer falsch ist:

```text
reason=invalid_connection_proof
```

Wenn Bearer korrekt ist:

```text
reason=runtime_not_effectively_enabled
```

Erwartung bleibt immer:

```text
HTTP/1.1 503 Service Unavailable
acceptsAgentConnections: false
actionEnabled: false
productiveAgentRuntime: false
secretsExposed: false
headersLogged: false
rawIpLogged: false
```

## Bewusst nicht gemacht

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
RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

Nach Live-Test nur Doku-Abschluss und naechsten Step vorbereiten.
