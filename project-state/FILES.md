# FILES

Stand: RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI  
Datum: 2026-06-25

## Geaendert in RDAP31

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP31_2026-06-25.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtige Grundlage fuer naechste Steps

```text
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
```

## Live-DB

```text
Engine: MariaDB 11.8.6
DB: c3stream_control
Tabelle: dashboard_user_admin_notes
EnvironmentFile: /etc/stream-control-center/remote-modboard.env
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
