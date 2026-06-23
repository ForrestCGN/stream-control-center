# NEXT CHAT PROMPT - RDAP5C nach RDAP5B

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Bitte zuerst den aktuellen Repo-/Doku-Stand prüfen und nicht raten.

## Projekt

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2: http://127.0.0.1:8080/dashboard-v2/
Produktive lokale DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
```

## Webserver-DB

```text
Server: web.cgn.community
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort nicht erfragen oder dokumentieren, nur ENV-/Secret-Ablage planen.

## Zuerst zwingend lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_RDAP5_AUTH_USER_MODEL_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5A_TWITCH_BASE_ACCESS_NO_VIP_DASHBOARD.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
```

## Aktueller Stand

RDAP5B ist nur DB-/Schema-Planung. Keine Migration wurde ausgefuehrt.

Geplante Tabellen:

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

## Nächster Auftrag

Starte mit:

```text
RDAP5C_AUTH_DB_MIGRATION_DESIGN
```

Ziel:

Planen, wie die RDAP5B-Tabellen spaeter sicher in der Webserver-DB angelegt werden.

Wichtig:

- Nur Planung.
- Keine DB-Migration ausfuehren.
- Keine MariaDB schreiben.
- Keine lokale SQLite anfassen.
- Keine Secrets ins Repo oder Frontend.
- Erst klaeren, wie Node/ENV/Secrets auf dem Webserver laufen.
- Backup-/Rollback-/Versionierung vorsehen.
- Seeds fuer Rollen/Permissions planen.
- DB-portabel denken.

Vor RDAP5C pruefen:

```text
package.json
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_security.js
backend/core/security.js
backend/core/paths.js
docs/current/*
project-state/*
```

Zusätzlich klaeren:

```text
Gibt es auf dem Webserver Node?
Welche Node-Version?
Wo soll das Remote-Modboard laufen?
Wie werden ENV/Secrets dort gespeichert?
Wie wird die MariaDB vom Node-Prozess erreicht?
```

Danach Plan vorlegen und auf mein `go` warten.
