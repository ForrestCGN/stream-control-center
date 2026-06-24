# FILES - stream-control-center

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
Datum: 2026-06-24

## AUTH1 relevante Dateien

```text
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/package.json
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
docs/current/RDAP_AUTH1_TWITCH_LOGIN_GATED.md
docs/current/RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED.md
```

## Server-Env

```text
/etc/stream-control-center/remote-modboard.env
```

Enthält produktive Secrets und darf nicht ins Repo.

## Live-Pfade Webserver

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
