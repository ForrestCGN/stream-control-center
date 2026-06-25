# FILES

Stand: RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP_ADMIN_USERS25_AUTH_SESSION_LOGIN_SMOKE_TEST.md
docs/current/RDAP26_PERMISSION_DB_SEED_OPTION_B.md
docs/current/RDAP26B_OWNER_PERMISSION_SEED_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED.md
docs/current/RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS.md
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Backend-Dateien fuer Auth/Permission/Admin-Notes

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-read-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
```

## Relevante SQL-/Tool-Dateien

```text
tools/rdap16_admin_note_table_migration.sql
tools/rdap26_owner_permission_seed_option_b.sql
```

Wichtig:

```text
Repo-Root-Dateien unter docs/, project-state/ und tools/ werden nicht nach /opt/stream-control-center/remote-modboard/ deployed.
Sie liegen nach Webserver-Clone im Deploy-Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>/.
SQL-Dateien werden nicht automatisch durch installstep, stepdone oder deploy ausgefuehrt.
```

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/readiness-diagnostic
GET /api/remote/auth/me
GET /api/remote/auth/session-status
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/permissions/check?permission=admin.users.note.read
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
GET /api/remote/admin/users/admin-notes/read?targetUserUid=<USER_UID>
```

## Datenbank

```text
MariaDB: c3stream_control
Tabelle: dashboard_user_admin_notes
Tabelle: dashboard_users
Tabelle: dashboard_user_roles
Tabelle: dashboard_role_permissions
Tabelle: dashboard_module_permissions
```

Bestaetigt Admin-Notiz-Tabelle:

```text
tableExists: true
schemaReady: true
migrationRequired: false
rowCount: 0
```

Bestaetigt Owner-Permission-Seed:

```text
ForrestCGN / tw:127709954 -> owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> nicht vergeben
```

Backups:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_20260625_080740.sql
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien wurden in RDAP27B nicht geaendert.

## Keine Secrets / keine DB im Repo

```text
Keine .env
Keine DB-Dateien
Keine Backups
Keine Secrets
```
