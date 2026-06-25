# FILES

Stand: RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN  
Datum: 2026-06-25

## Aktuelle wichtige RDAP-Dateien

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP30_2026-06-25.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Remote-Modboard-Dateien fuer naechsten Code-Step

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Live-DB

```text
Engine: MariaDB 11.8.6
DB: c3stream_control
Tabelle: dashboard_user_admin_notes
EnvironmentFile: /etc/stream-control-center/remote-modboard.env
```

Secrets und DB-Dumps gehoeren nicht ins Repo.
