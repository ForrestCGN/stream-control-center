# FILES

Stand: RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS  
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

## Geaendert in RDAP37B

```text
docs/current/RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP37B_2026-06-25.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP37 Backend-Dateien

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

## Wichtige Live-Daten aus RDAP37B

```text
dashboard_audit_log rowCount: 2
dashboard_locks rowCount: 1
dashboard_locks activeCount: 0
dashboard_locks latest status: released
latest lock_uid: rdap37_lock_test_20260625100908_42dbbd555e49
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
