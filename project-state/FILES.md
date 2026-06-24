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
docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md
```

## Wichtige Remote-Modboard-Code-Dateien

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/auth-profile-sync.service.js
remote-modboard/backend/src/routes/auth-status.routes.js
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

## Neu mit RDAP_LOCAL_MODE1

```text
docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md
```

## Noch nicht vorhanden / später geplant

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
lokales Startscript
lokale Env-Beispiel-Doku ohne Secrets
lokale DB-Teststrategie
```

Keine Secrets, keine `.env`, keine DB-Dateien ins Repo.
