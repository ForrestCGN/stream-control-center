# FILES - stream-control-center

Stand: RDAP_DESIGN1C_TRUE_V13_PORT / RDAP_DESIGN1C_DOCS_FINALIZE
Datum: 2026-06-24

## Design1C geänderte Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Doku dieses Abschluss-Steps

```text
docs/current/RDAP_DESIGN1C_TRUE_V13_PORT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Wichtige RDAP-Frontend-Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Relevante Auth-/Backend-Dateien

```text
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

Wichtige Env-Werte:

```text
DASHBOARD_ALLOWED_LOGINS=forrestcgn,engelcgn
SESSION_SECRET=...
OAUTH_STATE_SECRET=...
```

Secrets niemals in Chat, Repo, Frontend oder Logs posten.

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
