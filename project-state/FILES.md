# FILES - stream-control-center

Stand: RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
Datum: 2026-06-24

## Wichtige Doku-Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Relevante Remote-Modboard Dateien zuletzt bearbeitet

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
