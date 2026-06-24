# NEXT STEPS - stream-control-center

Stand: RDAP_DASHBOARD2_AUTH_GATE_AND_CGN_DESIGN
Datum: 2026-06-24

## Test nach Einspielen

Lokal:

```powershell
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\auth-status.service.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Webserver:

```bash
curl -fsS https://mods.forrestcgn.de/api/remote/auth/me | jq '.loggedIn,.dashboardAccess,.accessReason,.roles'
```

Browser:

```text
https://mods.forrestcgn.de/
```

Erwartung:

- ohne Login: Login-Seite
- ForrestCGN: Dashboard
- nicht freigegebener User: Access-Denied

## Danach

```text
RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI
```

oder

```text
RDAP_DASHBOARD3_MODULE_LAYOUT
```
