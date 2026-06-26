# FILES

Stand: RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED  
Datum: 2026-06-26

## Geaendert in RDAP45B

```text
tools/remote-modboard-deploy.sh
docs/current/RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP45B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Code-/Script-Aenderung RDAP45B

```text
tools/remote-modboard-deploy.sh
```

Zweck:

```text
OAuth/Login-Safety-Check im Deploy-Script an realen aktiven Login anpassen.
`/api/remote/auth/twitch/start` darf 302 liefern, wenn Login bewusst aktiv/freigegeben ist.
`/api/remote/auth/twitch/start` darf 403 liefern, wenn Login gesperrt ist.
`/api/remote/auth/twitch/callback` ohne gueltigen OAuth-State muss 403 bleiben.
```

## Nicht geaendert in RDAP45B

```text
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/routes/auth-login.routes.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Relevante Auth-Dateien geprueft

```text
remote-modboard/backend/src/services/auth-twitch-oauth.service.js
remote-modboard/backend/src/services/auth-login-entry.service.js
remote-modboard/backend/src/routes/auth-login.routes.js
tools/remote-modboard-deploy.sh
```

## Aktuelle relevante Auth-Routen

```text
GET  /api/remote/auth/twitch/start
GET  /api/remote/auth/twitch/callback
GET  /api/remote/auth/login/start
GET  /api/remote/auth/login/plan
POST /api/remote/auth/logout
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```
