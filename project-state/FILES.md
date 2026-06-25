# FILES

Stand: RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/RDAP_ADMIN_USERS16B_DOCS_WORKFLOW_SYNC.md
docs/current/RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC_LIVE_CONFIRMED.md
docs/current/RDAP_ADMIN_USERS20B_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP_ADMIN_USERS21_ADMIN_NOTE_DISPLAY_READINESS_PLAN.md
docs/current/RDAP_ADMIN_USERS22_ADMIN_NOTE_REAL_READ_ROUTE_PLAN.md
docs/current/RDAP_ADMIN_USERS23_AUTH_SESSION_LOGIN_ACTIVATION_SCOPE.md
docs/current/RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS.md
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Backend-Dateien fuer RDAP24

```text
remote-modboard/backend/server.js
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
remote-modboard/backend/src/services/auth-session-oauth-readiness-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js
```

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/readiness-diagnostic
GET /api/remote/auth/me
GET /api/remote/auth/session-status
GET /api/remote/auth/permissions/check
GET /api/remote/auth/twitch/start
GET /api/remote/auth/twitch/callback
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
```

## Datenbank

```text
MariaDB: c3stream_control
Tabelle: dashboard_user_admin_notes
```

Bestaetigt:

```text
tableExists: true
schemaReady: true
migrationRequired: false
rowCount: 0
```

Backup vor RDAP16-Migration:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
```

## RDAP24 live bestaetigt

```text
/api/remote/status
moduleBuild: RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false

/api/remote/routes
statusApiVersion: rdap_admin_users24.v1
authSessionOauthReadinessDiagnostic.routeListKeySynced: true

/api/remote/auth/readiness-diagnostic
ok: true
readOnly: true
readiness.readyForLoginSmokeTest: true
readiness.blockers: []
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien wurden in RDAP24B nicht geaendert.

## Keine Secrets / keine DB im Repo

```text
Keine .env
Keine DB-Dateien
Keine Backups
Keine Secrets
```
