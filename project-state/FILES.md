# FILES

Stand: RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/RDAP26_PERMISSION_DB_SEED_OPTION_B.md
docs/current/RDAP26B_OWNER_PERMISSION_SEED_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED.md
docs/current/RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP28_ADMIN_NOTE_READONLY_UI_PANEL.md
docs/current/RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP28_2026-06-25.md
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP29 SQL-Datei

```text
tools/rdap29_admin_note_test_seed_readonly_validation.sql
```

Wichtig:

```text
Diese SQL-Datei wird nicht automatisch ausgefuehrt.
Sie liegt im Repo-Root unter tools/.
Sie wird nicht durch remote-modboard Deploy in /opt/stream-control-center/remote-modboard/tools/ kopiert.
```

## Relevante Backend-/Frontend-Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

RDAP29 aendert diese Backend-/Frontend-Dateien nicht.

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/me
GET /api/remote/auth/session-status
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/permissions/check?permission=admin.users.note.read
GET /api/remote/admin/users/admin-notes/read?targetUserUid=
GET /assets/rdap28-admin-notes.js
GET /
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

Bestaetigt:

```text
ForrestCGN / tw:127709954 -> owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> nicht vergeben
```

RDAP29 Seed-Ziel:

```text
Tabelle: dashboard_user_admin_notes
note_uid: rdap29_test_note_forrestcgn_readonly_validation
target_user_uid: tw:127709954
status: active
```

Backups bisher:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_20260625_080740.sql
```

Vor RDAP29 SQL-Ausfuehrung neu erstellen:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap29_before_admin_note_test_seed_YYYYMMDD_HHMMSS.sql
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien werden in RDAP29 nicht geaendert.

## Keine Secrets / keine DB im Repo

```text
Keine .env
Keine DB-Dateien
Keine Backups
Keine Secrets
```
