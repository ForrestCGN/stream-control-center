# FILES

Stand: RDAP_ADMIN_USERS20B_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN.md
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
docs/current/RDAP_ADMIN_USERS16B_DOCS_WORKFLOW_SYNC.md
docs/current/RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC_LIVE_CONFIRMED.md
docs/current/RDAP_ADMIN_USERS18_ADMIN_NOTE_DISPLAY_SCOPE_PLAN.md
docs/current/RDAP_ADMIN_USERS19_AUTH_PERMISSION_READ_CHECK_PLAN.md
docs/current/RDAP_ADMIN_USERS20_ADMIN_NOTE_READ_PERMISSION_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS20B_LIVE_CONFIRMED_DOCS.md
```

## RDAP16 SQL-Datei

```text
tools/rdap16_admin_note_table_migration.sql
```

Wichtig:

```text
Diese SQL-Datei wird nicht automatisch durch installstep, stepdone oder deploy ausgefuehrt.
Repo-Root-Dateien unter docs/, project-state/ und tools/ werden nicht nach /opt/stream-control-center/remote-modboard/ deployed.
Sie liegen nach Webserver-Clone im Deploy-Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>/.
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Backend-Dateien fuer Admin-Notiz-Diagnose

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-read-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js
```

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/admin/users/admin-note-diagnostic
GET /api/remote/admin/users/admin-note-read-diagnostic
GET /api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test
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

## RDAP20 live bestaetigt

```text
/api/remote/routes
statusApiVersion: rdap_admin_users20.v1
adminUserAdminNoteReadPermissionDiagnostic.prepared: true
adminUserAdminNoteReadPermissionDiagnostic.routeListKeySynced: true
adminUserAdminNoteReadPermissionDiagnostic.permissionKey: admin.users.note.read
adminUserAdminNoteReadPermissionDiagnostic.readOnly: true
adminUserAdminNoteReadPermissionDiagnostic.writesStillBlocked: true
adminUserAdminNoteReadPermissionDiagnostic.returnsNoteText: false
adminUserAdminNoteReadPermissionDiagnostic.noteTextIsRedacted: true
```

Ohne Session:

```text
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
HTTP 401 Unauthorized
reason: not_logged_in_or_session_invalid
canReadAdminNotes: false
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien wurden in RDAP20B nicht geaendert.

## Keine Secrets / keine DB im Repo

```text
Keine .env
Keine DB-Dateien
Keine Backups
Keine Secrets
```
