# FILES

Stand: RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN  
Datum: 2026-06-24

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN.md
docs/current/RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC.md
docs/current/RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED.md
docs/current/RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS.md
docs/current/RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED.md
docs/current/RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP_LIVE_CONFIRMED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_NAV_ACCOUNT_CLEANUP.md
docs/current/RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN.md
docs/current/RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN.md
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Workflow-Tools

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Wichtig: Workflow-Tools dürfen in Design-/Frontend-/Doku-Steps nicht überschrieben werden. `installstep.cmd` ist der allgemeine ZIP-Installer und muss erhalten bleiben.

## Wichtige Remote-Modboard-Code-Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/admin-mini-write-foundation.routes.js
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/admin-user-write-foundation.service.js
remote-modboard/backend/src/services/admin-mini-write-foundation.service.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Relevante DB-/Schema-Plan-Dateien

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
```

RDAP13 plant zusätzlich, aber erstellt noch nicht:

```text
dashboard_user_admin_notes
```

## Frontend/Login-/UX-Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Geplante Admin-Notiz-Aktion

```text
action: admin.users.note.set
permission: admin.users.note.write
lock: admin:user-note:<target_user_uid>
table: dashboard_user_admin_notes
planned diagnostic: GET /api/remote/admin/users/note-write-plan-diagnostic
```

## Deploy

```text
tools/remote-modboard-deploy.sh
```

Keine Secrets, keine `.env`, keine DB-Dateien ins Repo.
