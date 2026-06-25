# FILES

Stand: RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN  
Datum: 2026-06-25

## Geaendert in RDAP38

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-plan.service.js
docs/current/RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP37 Backend-Dateien bleiben relevant

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-lock-test.service.js
```

## RDAP36 Backend-Dateien bleiben relevant

```text
remote-modboard/backend/src/services/admin-audit-test-insert.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Admin-Notiz Backend-Dateien relevant

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-plan.service.js
```

## Live-DB relevant

```text
dashboard_audit_log
dashboard_locks
dashboard_user_admin_notes
dashboard_users
```

## Webserver Cleanup Stand

```text
/opt/stream-control-center jetzt ca. 479M
_deploy_tmp: letzte 6 Deploy-Clones behalten
_runtime_tmp: letzte 5 remote-modboard Backups behalten
DB-/SQL-Backups behalten
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
