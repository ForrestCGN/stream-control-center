# FILES

Stand: RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES  
Datum: 2026-06-24

## Wichtigste Dateien zuerst

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED.md
docs/current/RDAP7H_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER.md
docs/current/RDAP7I_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
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
docs/current/RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN.md
docs/current/RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED.md
docs/current/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED.md
docs/current/RDAP7H_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER.md
docs/current/RDAP7I_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
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
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/src/security/safety.js
```

## RDAP8A geaenderte Code-Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/README.md
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
```

## RDAP8B geaenderte Dateien

Reiner Live-Test-/Doku-Step, kein Backend-Code:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP9.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP9 geaenderte Dateien

Reiner Konzept-/Doku-Step, kein Backend-Code:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
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
Runtime-/Temp: /opt/stream-control-center/_runtime_tmp/
Backups: /var/backups/stream-control-center/
```

Nicht mehr fuer RDAP-Deploy/Temp/Backup nutzen:

```text
/root
```

## RDAP8B Live-Deploy

```text
Deploy-Clone: /opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242
Backup: /var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz
Service: scc-remote-modboard.service
statusApiVersion live: rdap8a.v1
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
