# FILES

Stand: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED  
Datum: 2026-06-25

## Geaendert in RDAP37

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-lock-test.service.js
docs/current/RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP36 Backend-Dateien bleiben relevant

```text
remote-modboard/backend/src/services/admin-audit-test-insert.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Live-DB relevant

```text
dashboard_audit_log
dashboard_locks
dashboard_user_admin_notes
```

## Webserver Cleanup Stand

```text
/opt/stream-control-center jetzt ca. 479M
_deploy_tmp: letzte 6 Deploy-Clones behalten
_runtime_tmp: letzte 5 remote-modboard Backups behalten
DB-/SQL-Backups behalten
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
