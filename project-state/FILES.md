# FILES

Stand: RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Geaendert in RDAP47B

```text
docs/current/RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP47B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Doku-only RDAP47B

```text
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Kein Webserver-Deploy noetig.
```

## Zuletzt geaendert in RDAP47

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Zweck:

```text
Frontend-only Zieluser-Suche/Filter in Admin -> Admin-Notizen.
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Aktuelle relevante Auth-Routen

```text
GET  /api/remote/auth/twitch/start
GET  /api/remote/auth/twitch/callback
GET  /api/remote/auth/login/start
GET  /api/remote/auth/login/plan
POST /api/remote/auth/logout
```

## Fuer RDAP48 voraussichtlich zu pruefen

```text
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-model.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/admin-user-admin-notes.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-read.service.js
```
