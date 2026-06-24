# FILES - stream-control-center

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Wichtige Doku-Dateien

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_WORKFLOW_MASTERPROMPT_FIX.md
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AUTH_DASHBOARD_DESIGN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Remote-Modboard Dateien zuletzt bearbeitet / geprüft

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/routes/status.routes.js
```

## Relevante Auth-Dateien

```text
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/db.service.js
```

## Relevante RDAP-Deploy-Datei

```text
tools/remote-modboard-deploy.sh
```

Wichtig: Diese Datei liegt im Repo/Clone. Nicht als fester Serverpfad `/opt/stream-control-center/tools/...` annehmen.

## Server Env

```text
/etc/stream-control-center/remote-modboard.env
```

Diese Datei enthält produktive Secrets und darf nicht ins Repo.

## Webserver

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
/opt/stream-control-center/_deploy_tmp/
/opt/stream-control-center/_runtime_tmp/
```

Wichtig:

```text
/opt/stream-control-center ist kein Git-Repository.
```
