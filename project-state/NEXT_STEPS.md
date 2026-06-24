# NEXT STEPS - stream-control-center

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
Datum: 2026-06-24

## Sofort erledigen

### Secrets rotieren

Da `SESSION_SECRET` und `OAUTH_STATE_SECRET` im Chat sichtbar waren:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach erneut im Browser anmelden.

## Nächster Entwicklungsstep

```text
RDAP_DASHBOARD1_PROTECTED_SHELL
```

Ziel:

- Dashboard-Shell hinter Login
- eingeloggter User oben rechts
- Sidebar/Navigation
- geschützte read-only Seiten
- Status/Diagnose als erste geschützte Module
- Logout sauber sichtbar
- kein Agent/OBS/Sound/Overlay/Command-Control

## Danach

```text
RDAP_PERMISSIONS1_READONLY_ROLE_VIEW
```

oder

```text
RDAP_DASHBOARD2_MODULE_NAVIGATION
```

je nachdem, ob zuerst Rechteansicht oder Dashboardstruktur ausgebaut wird.
