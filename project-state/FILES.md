# FILES

Stand: RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS  
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

## Aktuelle RDAP-Dateien im Repo

```text
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5C4_KNOWN_REMOTE_SERVER_FACTS.md
docs/current/REMOTE_DASHBOARD_RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE.md
docs/current/REMOTE_DASHBOARD_RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
docs/current/RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
docs/current/RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md
docs/current/RDAP6F_AUTH_DB_INTEGRATION_PLAN.md
docs/current/RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER.md
docs/current/RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST.md
docs/current/RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK.md
docs/current/RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS.md
```

## Nicht vorhandene Zwischenstand-Dateien aus alten Prompts

Diese Dateien sind in GitHub/dev und lokal nicht vorhanden und duerfen nicht als Pflichtdateien vorausgesetzt werden:

```text
docs/current/RDAP_STATUS_AND_NEXT_STEPS_2026-06-23.md
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
docs/current/RDAP6B_TEST_DB_DRY_RUN_RUNBOOK.md
```

Wenn diese Inhalte spaeter wirklich benoetigt werden, muessen sie neu aus dem echten Stand heraus dokumentiert werden. Nicht aus Erinnerung nachbauen.

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
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/security/safety.js
```

## Deploy-/Handoff-Dateien im Repo

```text
remote-modboard/deploy/README_REMOTE_SERVER_INSTALL.md
remote-modboard/deploy/systemd/scc-remote-modboard.service.example
remote-modboard/deploy/nginx/mods.forrestcgn.de.remote-api.example.conf
remote-modboard/deploy/env/remote-modboard.env.example
remote-modboard/deploy/scripts/README_COMMANDS.md
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

## ISPConfig / nginx

Website:

```text
forrestcgn.de
```

Subdomain im gleichen vHost:

```text
mods.forrestcgn.de
```

ISPConfig-Feld:

```text
Sites -> Website -> forrestcgn.de -> Options -> nginx Directives
```

Proxy-Ziel:

```text
http://127.0.0.1:3010/api/remote/
```

## Webserver-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
Node v20.19.2
npm 9.2.0
git vorhanden
MariaDB 11.8.6
```

## Webserver-DB final korrigiert

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
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

Bestaetigte API-Route:

```text
GET https://mods.forrestcgn.de/api/remote/auth/model
schema.ready: true
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## Lokale produktive SQLite

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
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
```

Aktueller Stand:

```text
moduleVersion: 0.0.3
moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY
```

Wichtig:

```text
sound_profi ist keine Rolle.
sound_profi ist Gruppe/Marker.
sound_profi vergibt selbst keine globalen Rechte.
Remote-Agent bleibt read-only.
```

## Naechste Planungsdatei

```text
RDAP7_LOGIN_SESSION_CONCEPT
```

Noch nicht vorhanden; als naechster Schritt zu erstellen.
