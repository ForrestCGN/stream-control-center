# FILES

Stand: RDAP4C2_DASHBOARD_V2_REMOTE_AGENT_ADMIN_SPLIT_TESTED  
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
docs/current/NEXT_CHAT_PROMPT_RDAP5_AFTER_RDAP4C2.md
```

## Backend / aktueller RDAP4B-Status

```text
backend/modules/remote_agent.js
backend/server.js
backend/core/paths.js
```

`remote_agent.js` enthält:

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

Für RDAP4C/C2 besonders relevant:

```text
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminUsersPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminLocksPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminAuditPage.jsx
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/*
```

## Dashboard-v2 aktuelle Struktur nach RDAP4C2

```text
Live -> Stream-PC
  frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx

Admin -> Benutzer & Rechte
  frontend/dashboard-v2/src/modules/admin/AdminUsersPage.jsx

Admin -> Locks
  frontend/dashboard-v2/src/modules/admin/AdminLocksPage.jsx

Admin -> Audit
  frontend/dashboard-v2/src/modules/admin/AdminAuditPage.jsx
```

## Build-/Deploy-/Sync-Workflow

```text
build-dashboard-v2.cmd
tools/deploy_repo_to_streamassets.ps1
tools/sync_streamassets_to_repo.ps1
tools/upload_streamassets_changes.ps1
installstep.cmd
testdeploy.cmd
stepdone.cmd
stepundo.cmd
stepstatus.cmd
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
docs/current/NEXT_CHAT_PROMPT_RDAP5_AFTER_RDAP4C2.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Hinweis für nächsten Chat

Für RDAP5 zuerst die echten aktuellen Dateien prüfen. Kein Login/Auth/DB-Modell aus Erinnerung rekonstruieren. Keine DB-Migration ohne separaten Plan und separates Go. Übergabe-ZIPs bevorzugt unter `_handoff` erzeugen, nicht Desktop.
