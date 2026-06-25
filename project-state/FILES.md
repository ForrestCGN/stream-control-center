# FILES

Stand: RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-25

## Geaendert in RDAP32

```text
docs/current/RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP32_2026-06-25.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtige Grundlage fuer RDAP33

```text
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Live-DB

```text
Engine: MariaDB 11.8.6
DB: c3stream_control
Tabellen relevant:
- dashboard_user_admin_notes
- dashboard_audit_log
- dashboard_locks
EnvironmentFile: /etc/stream-control-center/remote-modboard.env
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
