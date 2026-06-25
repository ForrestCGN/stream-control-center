# FILES

Stand: RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP28_2026-06-25.md
docs/current/RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
docs/current/RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS.md
```

## RDAP29 / RDAP29B Dateien

```text
tools/rdap29_admin_note_test_seed_readonly_validation.sql
docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
docs/current/RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS.md
```

Hinweis:

```text
RDAP29 wurde live gegen MariaDB validiert.
Die echte Live-Tabelle ist dashboard_user_admin_notes.
Die urspruengliche SQLite-Annahme gilt nicht als Live-Wahrheit.
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Backend-Dateien fuer Readonly Admin-Notizen

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.js
```

## Live relevante Tabellen

```text
dashboard_users
dashboard_identities
dashboard_user_admin_notes
dashboard_roles
dashboard_permissions
dashboard_role_permissions
dashboard_sessions
```

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/admin/users/admin-notes/read
```

## Secrets / DB / Backups

Nicht ins Repo:

```text
/etc/stream-control-center/remote-modboard.env
/root/rdap29_mysql_client.cnf
/opt/stream-control-center/_db_backups/*.sql
*.sqlite
*.db
.env
Tokens
Secrets
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien werden in RDAP29B nicht geaendert.
