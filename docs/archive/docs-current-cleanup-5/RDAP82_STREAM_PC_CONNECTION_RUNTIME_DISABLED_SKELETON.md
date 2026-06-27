# RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Code + Doku / Stream-PC Verbindung / Runtime-disabled Skeleton

## Ziel

RDAP82 bereitet einen technischen Skeleton fuer die spaetere Stream-PC Verbindung vor.

Wichtig:

```text
- Runtime bleibt default disabled.
- Es werden keine produktiven Agent-Verbindungen angenommen.
- Es werden keine Remote-Actions ausgefuehrt.
- Es gibt keine DB-Migration.
- Es gibt keine neue Permission.
- Es gibt keine Admin-Notes-Aenderung.
```

## Umgesetzt

```text
remote-modboard/backend/server.js
- MODULE_BUILD auf RDAP82 gesetzt.
- Disabled Runtime-Skeleton wird nach app.listen registriert.
- Shutdown bleibt unveraendert ueber server.close.

remote-modboard/backend/src/services/agent-runtime-disabled.service.js
- Neuer Runtime-disabled Skeleton.
- Registriert einen Upgrade-Guard fuer /agent-ws.
- /agent-ws wird bei Runtime disabled mit 503 abgelehnt.
- Keine Header-/Secret-Werte werden geloggt.
- Keine Agent-Actions.

remote-modboard/backend/src/services/config.service.js
- Agent Runtime Config aus Env vorbereitet.
- AGENT_RUNTIME_ENABLED wird gelesen, bleibt aber effective false.
- AGENT_WS_PATH wird gelesen, Default /agent-ws.
- AGENT_EXPECTED_ID Default stream-pc-main.
- AGENT_EXPECTED_NAME Default Forrest Stream-PC.
- AGENT_ACCESS_KEY wird nur auf Konfiguration geprueft.
- Kein geheimer Wert wird in Public Config ausgegeben.

remote-modboard/backend/src/services/agent-status.service.js
- Statusmodell auf RDAP82 erweitert.
- runtimeSkeletonPrepared sichtbar.
- runtimeEffectiveEnabled bleibt false.
- wssRuntimeEnabled bleibt false.
- heartbeatReceiverEnabled bleibt false.
- accessKeyConfigured nur als Boolean sichtbar.
- Status bleibt offline/disabled.

remote-modboard/backend/src/routes/status.routes.js
- /api/remote/status nutzt den RDAP82-Agent-Summary-Kontext.
- Hinweise auf Runtime-disabled Skeleton ergaenzt.

remote-modboard/backend/src/routes/routes.routes.js
- /api/remote/routes beschreibt Agent-Status als RDAP82 Runtime-disabled Skeleton.
- agentStatusFoundation nutzt den Kontext.
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
Kein WebSocket-Handshake mit akzeptierter Verbindung.
Kein npm/ws Dependency-Step.
Kein Access-Key im Repo.
Kein Access-Key in UI, Status oder Logs.
```

## Env-Plan

Vorbereitet, aber nicht als Secret-Wert im Repo:

```text
AGENT_RUNTIME_ENABLED=false
AGENT_WS_PATH=/agent-ws
AGENT_EXPECTED_ID=stream-pc-main
AGENT_EXPECTED_NAME=Forrest Stream-PC
AGENT_ACCESS_KEY=<nur serverseitig setzen, niemals ins Repo>
```

RDAP82 macht `AGENT_RUNTIME_ENABLED=true` noch nicht produktiv wirksam. `effectiveEnabled` bleibt absichtlich false.

## Erwartete API-Semantik

```text
GET /api/remote/agent/status
- ok:true
- statusApiVersion: rdap_agent82.v1
- runtime.skeletonPrepared: true
- runtime.effectiveEnabled: false
- runtime.wssRuntimeEnabled: false
- runtime.heartbeatReceiverEnabled: false
- runtime.acceptsAgentConnections: false
- actionEnabled: false
- productiveAgentRuntime: false
```

```text
GET /api/remote/status
- .agent.runtimeSkeletonPrepared: true
- .agent.runtimeEffectiveEnabled: false
- .agent.accessKeyConfigured: true/false
- .agent.connectionState: offline
```

```text
GET /api/remote/routes
- .agentStatusFoundation.runtimeSkeletonPrepared: true
- .agentStatusFoundation.runtimeEffectiveEnabled: false
- .agentStatusFoundation.acceptsAgentConnections: false
```

## Lokale Checks

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

Da RDAP82 Code unter `remote-modboard/` aendert, ist nach erfolgreichem `stepdone.cmd` ein Webserver-Deploy noetig.

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
cd RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
sudo bash tools/remote-modboard-deploy.sh RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
```

Erwartung:

```text
"rdap_agent82.v1"
runtime.effectiveEnabled=false
runtime.wssRuntimeEnabled=false
runtime.acceptsAgentConnections=false
actionEnabled=false
productiveAgentRuntime=false
```

## Naechster sinnvoller Step

```text
RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC
```

Moeglicher Scope:

```text
- Nur Diagnose fuer abgelehnte /agent-ws Verbindungsversuche.
- Keine akzeptierte Agent-Verbindung.
- Keine Actions.
- Keine DB.
- Keine Secret-Ausgabe.
```
