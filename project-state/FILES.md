# FILES

Stand: RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT  
Datum: 2026-06-23

## Wichtigste Dateien zuerst

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP7F.txt
```

## Aktuelle RDAP-Dateien im Repo

```text
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
docs/current/RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md
docs/current/RDAP6F_AUTH_DB_INTEGRATION_PLAN.md
docs/current/RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER.md
docs/current/RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST.md
docs/current/RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK.md
docs/current/RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS.md
docs/current/RDAP7_LOGIN_SESSION_CONCEPT.md
docs/current/RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN.md
docs/current/RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS.md
docs/current/RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS.md
docs/current/RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS.md
docs/current/RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP7F.txt
```

## Remote-Modboard Paket im Repo

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/.env.example
remote-modboard/backend/README.md
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/security/safety.js
```

## RDAP6 SQL-/Runbook-Dateien im Repo

```text
db/rdap6c/README.md
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
db/rdap6c/runbooks/RDAP6C_BACKUP_RESTORE_RUNBOOK.md
db/rdap6d/README.md
db/rdap6d/runbooks/RDAP6D_TEST_DB_EXECUTION_RUNBOOK.md
db/rdap6d/checks/RDAP6D_EXPECTED_RESULTS.md
db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md
```

## Installierte Dateien auf Webserver

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

## Server-Arbeitsordner ab RDAP7C1

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp:       /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

Nicht mehr fuer RDAP-Deploy/Temp/Backup nutzen:

```text
/root
```

## Webserver-DB

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
```

Passwort nicht dokumentieren.

## Produktive RDAP6K-Migration

Vorheriges Backup:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Produktiv angelegte Tabellen in `c3stream_control`:

```text
schema_migrations
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

## Bestaetigte API-Routen

```text
GET https://mods.forrestcgn.de/api/remote/auth/model
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
schema.ready: true
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## Lokale produktive SQLite

```text
D:\Streaming\stramAssets\data\sqlitepp.sqlite
```

Nicht ersetzen, nicht loeschen, nicht migrieren ohne separates Go.

## Bewusst nicht geaenderte Dateien / Systeme

```text
backend/server.js
Root-package.json
lokale SQLite
Stream-PC Backend ausser dokumentiertem read-only remote_agent.js Stand
Dashboard-v2 Code
OBS-/Sound-/Overlay-Systeme
```

## Remote-Agent Stand

```text
backend/modules/remote_agent.js
moduleVersion: 0.0.3
moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY
```

## Naechste geplante Datei

```text
docs/current/RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN.md
```
