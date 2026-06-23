# FILES

Stand: RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN  
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
docs/current/REMOTE_DASHBOARD_RDAP5C4_KNOWN_REMOTE_SERVER_FACTS.md
docs/current/REMOTE_DASHBOARD_RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP5E_REMOTE_NODE_SERVICE_PLAN.md
```

Hinweis:

```text
Einige RDAP5-Dateien wurden in diesem Chat als Upload bereitgestellt, weil sie ueber GitHub/dev unter den erwarteten Pfaden nicht abrufbar waren.
Fuer weitere Umsetzung immer wieder echte Repo-/Dateistaende pruefen und fehlende Dateien exakt anfordern.
```

## Webserver-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 läuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
MariaDB 11.8.6 vorhanden
```

## Webserver-DB

```text
DB-Engine: MariaDB 11.8.6
DB-Client: mysql client 15.2
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

Nicht ersetzen, nicht löschen, nicht migrieren ohne separates Go.

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

## In diesem Doku-Update aktualisiert

```text
docs/current/REMOTE_DASHBOARD_RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Hinweis für nächsten Schritt

Nächster sinnvoller Schritt:

```text
RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE
```

Nicht nochmal als Hauptstep Node/npm/git/MariaDB-Client prüfen; diese Infos sind bekannt. Frischer Gegencheck direkt vor Installation ist okay.

Keine DB-Migration, kein npm install, keine Secrets, keine nginx-/Service-Aenderung ohne separates Go.
