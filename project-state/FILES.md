# FILES

Stand: RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED  
Datum: 2026-06-26

## Geaendert in RDAP47

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
docs/current/RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP47.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Code-Aenderung RDAP47

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Zweck:

```text
Frontend-only Zieluser-Suche/Filter in Admin -> Admin-Notizen.
```

## Nicht geaendert in RDAP47

```text
Backend-Routen
Backend-Services
DB-Schema
Deploy-Script
Permissions
Auth/Login
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
