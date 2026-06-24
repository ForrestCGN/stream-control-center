# FILES - stream-control-center

Stand: RDAP_DESIGN1B_LAYOUT_FIX
Datum: 2026-06-24

## In diesem Step geändert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
docs/current/RDAP_DESIGN1B_LAYOUT_FIX.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Nicht geändert, aber relevant

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/routes/status.routes.js
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
