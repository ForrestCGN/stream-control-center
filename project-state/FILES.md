# FILES

Stand: RDAP3A-FIX1 / DASHUI7 Stream-PC Verbindung UI-Begriffe korrigiert  
Datum: 2026-06-23

## Wichtigste Dateien zuerst

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md
docs/current/WF1_FRONTEND_GIT_WORKFLOW.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md
docs/current/RDAP3A_DASHUI7_REMOTE_AGENT_STATUS.md
```

## Dashboard-v2

Quellcode:

```text
frontend/dashboard-v2/
```

Build-Output:

```text
htdocs/dashboard-v2/
```

Build-Helper:

```text
build-dashboard-v2.cmd
```

## Backend Static Route

```text
backend/core/paths.js
backend/server.js
```

## RDAP3A / Stream-PC Verbindung

Backend:

```text
backend/modules/remote_agent.js
```

Interne API:

```text
GET /api/remote-agent/status
GET /api/remote-agent/routes
```

Frontend:

```text
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/global.css
```

Sichtbare UI-Bezeichnung:

```text
Live -> Stream-PC
Stream-PC Verbindung
```

Interne technische Namen bleiben:

```text
remote_agent
remote-agent
/api/remote-agent/status
```

## Designreferenz

```text
docs/reference/dashboard-v2-design-test-v13/
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
```

## In RDAP3A-FIX1 aktualisiert

```text
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
docs/current/RDAP3A_DASHUI7_REMOTE_AGENT_STATUS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```
