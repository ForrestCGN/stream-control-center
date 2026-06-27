# RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code + Doku / Stream-PC Verbindung / Handshake-Precheck disabled

## Ziel

RDAP85 erweitert den bestehenden disabled `/agent-ws` Upgrade-Guard um einen sicheren Handshake-Precheck.

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
RDAP83 ist live bestaetigt.
RDAP83B hat den Live-Abschluss dokumentiert.
RDAP84 hat den Access-Key-Handshake-Plan dokumentiert.
Der /agent-ws Upgrade-Guard lehnt weiterhin mit 503 ab.
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
- MODULE_BUILD auf RDAP85 gesetzt.

remote-modboard/backend/src/services/agent-runtime-disabled.service.js
- Bestehenden disabled Upgrade-Guard erweitert.
- Handshake-Precheck vorbereitet, aber nur fuer Ablehnung/Diagnose.
- Prueft sichere Header-Hinweise:
  - X-SCC-Agent-Id
  - X-SCC-Agent-Protocol
  - Authorization nur als vorhanden/nicht vorhanden und Bearer-Schema, niemals Wert.
- Erkennt sichere Ablehnungsgruende.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine Header-Werte, Cookies, Authorization-Werte, Query-Werte oder IPs werden geloggt.
- Keine DB-Persistenz.
- Keine Verbindung wird angenommen.

remote-modboard/backend/src/services/agent-status.service.js
- StatusApiVersion auf rdap_agent85.v1 gesetzt.
- Agent-Statusantwort enthaelt Handshake-Precheck-Summary.
- /api/remote/status .agent enthaelt nur sichere Summary-Werte.
- /api/remote/routes .agentStatusFoundation enthaelt sichere Handshake-Precheck-Summary.
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
```

## Precheck-Logik

```text
1. Request muss /agent-ws sein, sonst ignoriert der Guard weiter.
2. Fehlt X-SCC-Agent-Id -> missing_agent_id.
3. Ist X-SCC-Agent-Id nicht stream-pc-main -> unknown_agent_id.
4. Fehlt Authorization -> missing_connection_proof.
5. Ist Authorization nicht Bearer <wert> -> invalid_connection_proof.
6. Ist X-SCC-Agent-Protocol nicht rdap-agent-handshake.v1 -> protocol_version_unsupported.
7. Wenn alles syntaktisch passt -> runtime_not_effectively_enabled.
8. Trotzdem immer HTTP 503 und keine Verbindung.
```

## Sichtbare sichere Diagnose

Erlaubt sichtbar:

```text
rejectDiagnostic.handshakePrecheckPrepared
rejectDiagnostic.handshakePrecheckAcceptsConnections
rejectDiagnostic.expectedProtocolVersion
rejectDiagnostic.lastRejectHasAgentIdHeader
rejectDiagnostic.lastRejectHasProtocolHeader
rejectDiagnostic.lastRejectAgentIdHint
rejectDiagnostic.lastRejectProtocolHint
rejectDiagnostic.lastRejectHasAuthorizationHeader
rejectDiagnostic.lastRejectReason
```

## Niemals loggen oder ausgeben

```text
Authorization Header Value
Bearer Token
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
- statusApiVersion: rdap_agent85.v1
- runtime.acceptsAgentConnections: false
- runtime.handshakePrecheckPrepared: true
- runtime.handshakePrecheckAcceptsConnections: false
- rejectDiagnostic.prepared: true
- rejectDiagnostic.inMemoryOnly: true
- rejectDiagnostic.handshakePrecheckPrepared: true
- rejectDiagnostic.handshakePrecheckAcceptsConnections: false
- rejectDiagnostic.expectedProtocolVersion: rdap-agent-handshake.v1
- rejectDiagnostic.secretsExposed: false
- rejectDiagnostic.headersLogged: false
- rejectDiagnostic.rawIpLogged: false
```

```text
GET /api/remote/status
- .agent.statusApiVersion: rdap_agent85.v1
- .agent.handshakePrecheckPrepared: true
- .agent.handshakePrecheckAcceptsConnections: false
- .agent.rejectDiagnosticPrepared: true
- .agent.rejectDiagnosticInMemoryOnly: true
- .agent.rejectSecretsExposed: false
```

```text
GET /api/remote/routes
- .agentStatusFoundation.statusApiVersion: rdap_agent85.v1
- .agentStatusFoundation.handshakePrecheckPrepared: true
- .agentStatusFoundation.handshakePrecheckAcceptsConnections: false
- .agentStatusFoundation.rejectDiagnosticPrepared: true
- .agentStatusFoundation.rejectDiagnosticInMemoryOnly: true
- .agentStatusFoundation.rejectSecretsExposed: false
```

## Tests lokal

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\agent-status.service.js
node --check .\remote-modboard\backend\src\services\agent-runtime-disabled.service.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js

git status --short
git diff --stat
```

## Webserver-Deploy nach stepdone

Da RDAP85 Code unter `remote-modboard/` aendert, ist nach erfolgreichem `stepdone.cmd` ein Webserver-Deploy noetig.

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
cd RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
sudo bash tools/remote-modboard-deploy.sh RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime, .rejectDiagnostic'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
```

Reject-Tests:

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n' | nc -w 2 127.0.0.1 3010

printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: wrong-agent\r\n\r\n' | nc -w 2 127.0.0.1 3010

printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nX-SCC-Agent-Id: stream-pc-main\r\nX-SCC-Agent-Protocol: rdap-agent-handshake.v1\r\n\r\n' | nc -w 2 127.0.0.1 3010
```

Erwartung:

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
RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

Nach Live-Test nur Doku-Abschluss und naechsten Step vorbereiten.
