# Remote Modboard Backend - RDAP5F

Stand: RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE

This package is the first read-only base for the future remote modboard service on `web.cgn.community` / `mods.forrestcgn.de`.

## What it does

- Provides read-only health/status/routes endpoints.
- Reports MariaDB configuration status without exposing secrets.
- Optionally tests DB reachability via `?db=1` using `SELECT 1 AS ok` when `mysql2` and ENV are available.
- Keeps all productive capabilities disabled.

## What it does not do

- No npm install in this step.
- No DB migration.
- No DB writes.
- No local SQLite access.
- No login/auth.
- No sessions.
- No WSS agent runtime.
- No agent actions.
- No OBS/Sound/Overlay/Command control.
- No shell/file/process execution.

## Planned server location

```text
/opt/stream-control-center/remote-modboard/backend
```

## Planned ENV location

```text
/etc/stream-control-center/remote-modboard.env
```

Never commit real secrets.

## Local syntax check

```powershell
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\health.routes.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\db-health.service.js
node --check .\remote-modboard\backend\src\security\safety.js
```
