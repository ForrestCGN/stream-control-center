# RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code + Doku / Stream-PC Verbindung / Handshake-Reject-Diagnose

## Ziel

RDAP83 ergänzt nur eine sichere Diagnose fuer abgelehnte `/agent-ws` Verbindungsversuche.

Wichtig:

```text
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
RDAP82 ist live bestaetigt.
Runtime-disabled Skeleton ist aktiv vorbereitet.
server.js registriert den Upgrade-Guard.
Der Guard lehnt /agent-ws bei disabled Runtime ab.
Status bleibt read-only/offline/disabled.
```

## Umgesetzt

```text
remote-modboard/backend/server.js
- MODULE_BUILD auf RDAP83 gesetzt.

remote-modboard/backend/src/services/agent-runtime-disabled.service.js
- Bestehenden disabled Upgrade-Guard erweitert.
- In-Memory Reject-Diagnose ergaenzt.
- Reject-Zaehler fuer abgelehnte /agent-ws Versuche.
- Letzte sichere Ablehnung wird gespeichert.
- Keine Header-Werte, Cookies, Authorization-Werte, Query-Werte oder IPs werden geloggt.
- Keine DB-Persistenz.
- Keine Verbindung wird angenommen.

remote-modboard/backend/src/services/agent-status.service.js
- StatusApiVersion auf rdap_agent83.v1 gesetzt.
- Agent-Statusantwort enthaelt rejectDiagnostic.
- /api/remote/status .agent enthaelt nur sichere Summary-Werte.
- /api/remote/routes .agentStatusFoundation enthaelt sichere Reject-Diagnostic-Summary.
```

## Sichtbare sichere Diagnose

Erlaubt sichtbar:

```text
rejectDiagnostic.prepared
rejectDiagnostic.enabled
rejectDiagnostic.inMemoryOnly
rejectDiagnostic.rejectCount
rejectDiagnostic.lastRejectAt
rejectDiagnostic.lastRejectReason
rejectDiagnostic.lastRejectPath
rejectDiagnostic.lastRejectStatusCode
rejectDiagnostic.lastRejectMethod
rejectDiagnostic.lastRejectHasAuthorizationHeader
rejectDiagnostic.lastRejectHasCookieHeader
rejectDiagnostic.lastRejectHasQueryString
rejectDiagnostic.lastRejectUserAgentHint
```

## Sichtbare Ablehnungsgruende

```text
agent_runtime_disabled
malformed_upgrade_request
invalid_agent_ws_path
```

RDAP83 nutzt im aktiven Guard weiterhin:

```text
agent_runtime_disabled
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
```

## API-Erwartung

```text
GET /api/remote/agent/status
- statusApiVersion: rdap_agent83.v1
- runtime.acceptsAgentConnections: false
- rejectDiagnostic.prepared: true
- rejectDiagnostic.inMemoryOnly: true
- rejectDiagnostic.rejectCount: number
- rejectDiagnostic.secretsExposed: false
- rejectDiagnostic.headersLogged: false
- rejectDiagnostic.rawIpLogged: false
```

```text
GET /api/remote/status
- .agent.statusApiVersion: rdap_agent83.v1
- .agent.rejectDiagnosticPrepared: true
- .agent.rejectDiagnosticInMemoryOnly: true
- .agent.rejectCount: number
- .agent.rejectSecretsExposed: false
```

```text
GET /api/remote/routes
- .agentStatusFoundation.statusApiVersion: rdap_agent83.v1
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

Da RDAP83 Code unter `remote-modboard/` aendert, ist nach erfolgreichem `stepdone.cmd` ein Webserver-Deploy noetig.

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC
cd RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC
sudo bash tools/remote-modboard-deploy.sh RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime, .rejectDiagnostic'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
```

Optionaler lokaler Reject-Test auf dem Webserver:

```bash
printf 'GET /agent-ws HTTP/1.1\r\nHost: mods.forrestcgn.de\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n' | nc -w 2 127.0.0.1 3010
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.rejectDiagnostic'
```

Erwartung:

```text
HTTP/1.1 503 Service Unavailable
reason=agent_runtime_disabled
rejectDiagnostic.rejectCount steigt
runtime.acceptsAgentConnections bleibt false
actionEnabled bleibt false
productiveAgentRuntime bleibt false
secretsExposed bleibt false
headersLogged bleibt false
rawIpLogged bleibt false
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
RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN
```

Nur Planung, kein Runtime-Aktivieren ohne separaten Plan und explizites go.
