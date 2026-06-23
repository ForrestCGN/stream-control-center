# Remote Modboard Backend

Stand: RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED

This package is the read-only base for the future remote modboard service on `web.cgn.community` / `mods.forrestcgn.de`.

## What it does

- Provides read-only health/status/routes endpoints.
- Reports MariaDB configuration status without exposing secrets.
- Optionally tests DB reachability via `?db=1` using `SELECT 1 AS ok` when `mysql2` and ENV are available.
- Reports Twitch OAuth and session ENV readiness without activating login.
- Provides disabled/read-only Twitch OAuth start and callback skeleton endpoints.
- Keeps all productive capabilities disabled.

## What it does not do

- No DB migration.
- No DB writes.
- No local SQLite access.
- No login/auth activation.
- No redirect to Twitch.
- No Twitch OAuth token exchange.
- No session creation.
- No cookies.
- No WSS agent runtime.
- No agent actions.
- No OBS/Sound/Overlay/Command control.
- No shell/file/process execution.
- No secrets in frontend or logs.

## Planned server location

```text
/opt/stream-control-center/remote-modboard/backend
```

## Planned ENV location

```text
/etc/stream-control-center/remote-modboard.env
```

Never commit real secrets.

## Important disabled OAuth flags

```text
TWITCH_OAUTH_ENABLED=false
SESSION_ENABLED=false
```

Even if these are accidentally changed on the server, RDAP7H still reports effective auth/session state as disabled. The skeleton routes respond with disabled/read-only JSON and do not redirect or exchange tokens.

## Disabled OAuth skeleton routes

```text
GET /api/remote/auth/twitch/start
GET /api/remote/auth/twitch/callback
```

Both routes intentionally return HTTP 403 JSON with:

```text
authEnabled=false
oauthEnabled=false
startRouteEnabled=false
callbackRouteEnabled=false
redirectToTwitch=false
tokenExchangeEnabled=false
setCookie=false
createSession=false
databaseWriteEnabled=false
agentActionsEnabled=false
```

## Planned later redirect URI

```text
https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

## Local syntax check

From `remote-modboard/backend`:

```powershell
npm run check
```

Or from repository root:

```powershell
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\health.routes.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\auth-model.routes.js
node --check .\remote-modboard\backend\src\routes\auth-status.routes.js
node --check .\remote-modboard\backend\src\routes\auth-twitch.routes.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\db-health.service.js
node --check .\remote-modboard\backend\src\services\db.service.js
node --check .\remote-modboard\backend\src\services\auth-db-read.service.js
node --check .\remote-modboard\backend\src\services\auth-status.service.js
node --check .\remote-modboard\backend\src\security\safety.js
```
