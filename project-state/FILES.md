# FILES

Stand: RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION_DOCUMENTED  
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
docs/current/REMOTE_DASHBOARD_RDAP5C_AUTH_DB_MIGRATION_DESIGN.md
docs/current/REMOTE_DASHBOARD_RDAP5C2_SIMPLE_ROLE_AND_MODULE_PERMISSION_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/NEXT_CHAT_PROMPT_RDAP5D_AFTER_RDAP5C3.md
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

## Revidierte Tabellen ab RDAP5C3

```text
schema_migrations
dashboard_users
dashboard_twitch_status
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_module_permission_matrix
dashboard_user_permission_overrides
dashboard_sessions
dashboard_locks
dashboard_audit_log
agent_registry
```

## Rollen-/Gruppenmodell

Twitch-Status:

```text
streamer / broadcaster
mod
vip
```

Manuell vergebene Dashboard-Rollen:

```text
leadmod
admin
owner
spaeter eigene Rollen optional
```

Dashboard-Gruppen / Markierungen:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
spaeter eigene Gruppen optional
```

Wichtig:

```text
sound_profi ist keine feste Rolle.
sound_profi ist kein festes globales Rechtepaket.
konkrete Rechte entstehen pro Modul.
```

## In diesem Doku-Update aktualisiert

```text
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/NEXT_CHAT_PROMPT_RDAP5D_AFTER_RDAP5C3.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Hinweis für nächsten Chat

Nächster sinnvoller Schritt: RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK.

Keine DB-Migration, kein npm install, keine Secrets ohne separates Go.
