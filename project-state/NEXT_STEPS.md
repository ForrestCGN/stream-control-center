# NEXT STEPS - stream-control-center

Stand: RDAP_AUTH1_TWITCH_LOGIN_GATED
Datum: 2026-06-24

## Test nach Einspielen

Lokal:

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\src\services\auth-twitch-oauth.service.js
node --check .\remote-modboard\backend\src\services\auth-session-write.service.js
node --check .\remote-modboard\backend\src\routes\auth-twitch.routes.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Webserver nach Deploy ohne Secrets/Flags:

```bash
curl -i https://mods.forrestcgn.de/api/remote/auth/twitch/start
```

Erwartung: HTTP 403, weil Gates noch aus sind.

Danach Env bewusst setzen und Login separat testen.
