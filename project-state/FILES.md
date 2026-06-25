# FILES

Stand: RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION  
Datum: 2026-06-25

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN.md
docs/current/RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN.md
docs/current/RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC.md
docs/current/RDAP_ADMIN_USERS14B_ROUTE_LIST_SYNC_LIVE_CONFIRMED.md
docs/current/RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN.md
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
```

## RDAP16 SQL-Datei

```text
tools/rdap16_admin_note_table_migration.sql
```

Wichtig:

```text
Diese SQL-Datei wird nicht automatisch durch installstep, stepdone oder deploy ausgefuehrt.
```

## Projektstatus-Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Backend-Dateien fuer Diagnose

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
```

## Live relevante Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/admin/users/admin-note-diagnostic
```

## Workflow-Tools geschuetzt

```text
installstep.cmd
stepdone.cmd
testdeploy.cmd
tools/remote-modboard-deploy.sh
```

Diese Dateien werden in RDAP16 nicht geaendert.

## Keine Secrets / keine DB im Repo

```text
Keine .env
Keine DB-Dateien
Keine Backups
Keine Secrets
```
