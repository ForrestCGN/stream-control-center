# FILES

Stand: RDAP5B_AUTH_DB_SCHEMA_PLAN_DOCUMENTED  
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
docs/current/REMOTE_DASHBOARD_RDAP5_AUTH_USER_MODEL_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5A_TWITCH_BASE_ACCESS_NO_VIP_DASHBOARD.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP5C_AFTER_RDAP5B.md
```

## Webserver-DB

```text
Server: web.cgn.community
Site: forrestcgn.de
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort nicht dokumentieren.

## Lokale produktive SQLite

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Nicht ersetzen, nicht loeschen, nicht migrieren ohne separates Go.

## Backend relevante Dateien

```text
backend/modules/remote_agent.js
backend/server.js
backend/core/paths.js
backend/core/security.js
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_routes.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_state.js
```

## Dashboard-v2 relevante Dateien

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

## RDAP5B geplante Tabellen

```text
dashboard_users
dashboard_twitch_status
dashboard_roles
dashboard_user_roles
dashboard_permissions
dashboard_role_permissions
dashboard_user_permission_overrides
dashboard_module_permission_matrix
dashboard_sessions
dashboard_locks
dashboard_audit_log
agent_registry
```

## In diesem Doku-Update aktualisiert

```text
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/NEXT_CHAT_PROMPT_RDAP5C_AFTER_RDAP5B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Hinweis für nächsten Chat

Für RDAP5C zuerst klaeren, wie Node/ENV/Secrets auf dem Webserver laufen. Keine DB-Migration ohne Backup-/Rollback-/Secret-Plan. VIP ist kein Dashboard-Basiszugang. Lokale SQLite bleibt unangetastet.
