# Remote Modboard Backend

Stand: RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC

This package is the read-only base for the future remote modboard service on `web.cgn.community` / `mods.forrestcgn.de`.

## What it does

- Provides read-only health/status/routes endpoints.
- Reports MariaDB configuration status without exposing secrets.
- Optionally tests DB reachability via `?db=1` using `SELECT 1 AS ok` when `mysql2` and ENV are available.
- Reports Twitch OAuth and session ENV readiness without activating login.
- Provides disabled/read-only Twitch OAuth start and callback skeleton endpoints.
- Provides RDAP7I read-only session-store validation diagnostics against `dashboard_sessions`.
- Provides RDAP8A read-only permission diagnostics for the future server-side permission middleware.
- Keeps all productive capabilities disabled.

## What it does not do

- No DB migration.
- No DB writes.
- No local SQLite access.
- No login/auth activation.
- No redirect to Twitch.
- No Twitch OAuth token exchange.
- No session creation.
- No session refresh/extension.
- No `last_seen_at` update.
- No cookies.
- No productive permission enforcement.
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

## Important disabled OAuth/session flags

```text
TWITCH_OAUTH_ENABLED=false
SESSION_ENABLED=false
```

Even if these are accidentally changed on the server, RDAP8A still reports effective auth/session state as disabled. The skeleton routes respond with disabled/read-only JSON and do not redirect or exchange tokens.

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

## RDAP7I session-store read-only validation

```text
GET /api/remote/auth/session-status
GET /api/remote/auth/me
```

RDAP7I may read `dashboard_sessions` using a read-only connection and a parameterized `SELECT` by `session_uid`.

It must not:

```text
INSERT
UPDATE
DELETE
create a session
refresh a session
update last_seen_at
set a cookie
activate login
```

Cookie values are never returned. The API may return a short SHA-256 fingerprint for diagnostics.

## RDAP8A read-only permission diagnostics

```text
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/permissions/check?permission=sound.manage&targetType=module&targetKey=sound
```

This route prepares the later permission middleware model.

It may read, only when a valid session is diagnostically found:

```text
dashboard_users
dashboard_user_roles
dashboard_user_groups
dashboard_groups
dashboard_role_permissions
dashboard_module_permissions
```

It still returns productive access as denied:

```text
allowed=false
authEnabled=false
loginEnabled=false
loggedIn=false
```

Without a session cookie, expected reason:

```text
auth_disabled_or_not_logged_in
```

With a diagnostically valid session, expected productive reason:

```text
auth_disabled_readonly_permission_denied
```

The diagnostic result may show whether the future effective permission evaluation would allow access, but this is not yet productive authorization.

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
node --check .\remote-modboard\backend\src\services\auth-session-read.service.js
node --check .\remote-modboard\backend\src\services\auth-status.service.js
node --check .\remote-modboard\backend\src\services\auth-permission-read.service.js
node --check .\remote-modboard\backend\src\security\permissions.js
node --check .\remote-modboard\backend\src\security\safety.js
```
