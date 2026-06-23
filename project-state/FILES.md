# FILES

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY_TESTED  
Datum: 2026-06-23

## Wichtigste Dateien zuerst

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## RDAP / Remote-Dashboard Planung

```text
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
```

## Backend / aktueller RDAP4B-Status

```text
backend/modules/remote_agent.js
backend/server.js
backend/core/paths.js
```

`remote_agent.js` enthält jetzt:

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
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

Für RDAP4C besonders relevant:

```text
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/*
```

## Build-/Deploy-/Sync-Workflow

```text
build-dashboard-v2.cmd
tools/deploy_repo_to_streamassets.ps1
tools/sync_streamassets_to_repo.ps1
tools/upload_streamassets_changes.ps1
testdeploy.cmd
stepdone.cmd
stepundo.cmd
```

## Designreferenz

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md
```

## In diesem Doku-Update aktualisiert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/NEXT_CHAT_PROMPT_RDAP4C_AFTER_RDAP4B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Hinweis für nächsten Chat

Für RDAP4C zuerst die echten aktuellen Frontend-Dateien prüfen. Kein Frontend aus Erinnerung rekonstruieren. Übergabe-ZIPs bevorzugt unter `_handoff` erzeugen, nicht Desktop.
