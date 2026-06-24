# Remote-Modboard Auth

Stand: RDAP_AUTH2_CENTRAL_LOGIN_READY
Datum: 2026-06-24

## Zweck

Das Remote-Modboard nutzt Auth, Sessions und Rechtepruefung, damit spaeter externe Mods sicher auf das Dashboard zugreifen koennen.

## Aktueller Stand

- Twitch OAuth im Modboard funktioniert live.
- Session-/User-/Identity-Logik ist vorbereitet und aktivierbar.
- Dashboard-Zugriff wird serverseitig ueber Session + Allowlist/Permission-Kontext geprueft.
- `remote.view` ist die erste zentrale Sichtberechtigung.
- Remote-Writes und Agent-Actions bleiben deaktiviert.

## Zielarchitektur

Spaeter sollen Mods sich entweder ueber `forrestcgn.de` oder direkt ueber `mods.forrestcgn.de` einloggen koennen.

Beide Einstiege sollen dieselbe zentrale Auth-/Session-Schicht nutzen:

```text
forrestcgn.de/login
mods.forrestcgn.de/login

-> gemeinsame DB
-> dashboard_users
-> dashboard_identities
-> dashboard_sessions
-> serverseitige Permission remote.view
```

## Sicherheitsregeln

- Keine Twitch-Tokens ins Frontend.
- Keine Sessionwerte ins Frontend.
- Keine Login-Daten in URLs.
- Keine Secrets im Repo, Chat oder Logs.
- Cookie nur als Session-ID.
- Sessiondaten serverseitig in DB.
- Modboard prueft serverseitig.
- Dashboard zeigt nur an; Backend entscheidet Rechte.

## Relevante Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-login-entry.service.js
remote-modboard/backend/src/routes/auth-login.routes.js
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
```

## API-Routen

```text
GET  /api/remote/auth/login/plan
GET  /api/remote/auth/login/start
GET  /api/remote/auth/twitch/start
GET  /api/remote/auth/twitch/callback
POST /api/remote/auth/logout
GET  /api/remote/auth/me
GET  /api/remote/auth/session-status
GET  /api/remote/auth/permissions/check?permission=remote.view
```

## Env-Konzept

```text
CENTRAL_AUTH_MODE=local_twitch_fallback
CENTRAL_AUTH_BASE_URL=https://forrestcgn.de
CENTRAL_AUTH_LOGIN_PATH=/login
CENTRAL_AUTH_LOGOUT_PATH=/logout
```

Aktueller Default bleibt `local_twitch_fallback`, damit der vorhandene Login erhalten bleibt.

Spaeter kann `CENTRAL_AUTH_MODE=central` genutzt werden, wenn die Hauptseiten-Auth fertig ist.

## Tests

```powershell
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/auth/login/plan" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/routes" | ConvertTo-Json -Depth 8
```

Erwartung:

- `moduleBuild` = `RDAP_AUTH2_CENTRAL_LOGIN_READY`
- `centralAuth.prepared` = `true`
- `centralAuth.sharedDatabasePlanned` = `true`
- `/api/remote/auth/login/start` ist in der Routenliste sichtbar
- keine Remote-Writes / Agent-Actions aktiv
