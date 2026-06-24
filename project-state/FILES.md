# FILES

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Zentrale RDAP-Dokumente

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.md
docs/current/RDAP_META1_BUILD_HEADER_CLEANUP.md
docs/current/RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.md
docs/current/RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED.md
docs/current/RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP.md
docs/current/RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN.md
docs/current/RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP9_2026-06-24.md
```

## Wichtige Remote-Modboard-Code-Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/admin-user-write-foundation.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/auth-profile-sync.service.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Frontend-Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
```

## Deploy

```text
tools/remote-modboard-deploy.sh
```

## Neu/aktuell mit RDAP9

```text
remote-modboard/backend/src/services/admin-lock-write.service.js
docs/current/RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP9_2026-06-24.md
```

## Geparkt / später geplant

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
lokales Startscript
lokale Env-Beispiel-Doku ohne Secrets
lokale DB-Teststrategie
lokaler Twitch-Login
EngelCGN LAN-Zugriff
```

Keine Secrets, keine `.env`, keine DB-Dateien ins Repo.
