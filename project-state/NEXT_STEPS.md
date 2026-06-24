# NEXT STEPS - stream-control-center

Stand: RDAP_DASHBOARD1_PROTECTED_SHELL
Datum: 2026-06-24

## Nach Einspielen testen

Lokal:

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Webserver:

```bash
curl -fsS https://mods.forrestcgn.de/api/remote/status | jq '.auth.enabled,.auth.loginEnabled'
```

Browser:

```text
https://mods.forrestcgn.de/
```

Erwartung:

- ohne Login: Login-Gate
- mit Login: Dashboard-Shell mit Sidebar
- User oben rechts sichtbar
- Seitenumschaltung ohne Reload
- keine Steueraktionen sichtbar

## Danach

```text
RDAP_DASHBOARD2_MODULE_NAVIGATION
```

oder

```text
RDAP_PERMISSIONS1_READONLY_ROLE_VIEW
```
