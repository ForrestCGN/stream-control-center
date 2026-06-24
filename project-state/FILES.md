# FILES

Stand: RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED  
Datum: 2026-06-24

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP.md
docs/current/RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN.md
docs/current/RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN.md
docs/current/RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN.md
docs/current/RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC.md
docs/current/RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED.md
docs/current/RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS.md
docs/current/RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED.md
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

Wichtig: Workflow-Tools dürfen in Design-/Frontend-Steps nicht überschrieben werden. `installstep.cmd` ist der allgemeine ZIP-Installer und muss erhalten bleiben.

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

## Frontend/Login-Dateien DESIGN2

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

## Bestätigte RDAP11-Route

```text
GET /api/remote/admin/users/mini-write-foundation-diagnostic
```

## Deploy

```text
tools/remote-modboard-deploy.sh
```

Keine Secrets, keine `.env`, keine DB-Dateien ins Repo.
