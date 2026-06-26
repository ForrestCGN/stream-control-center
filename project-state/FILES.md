# FILES

Stand: RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Geaendert in RDAP51B

```text
docs/current/RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP51B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geaendert in RDAP51B

```text
Frontend-Code
Backend-Routen
Backend-Services
DB-Schema
Deploy-Script
Permissions
Auth/Login
```

## Zuletzt geaendert in RDAP51

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Zweck:

```text
Frontend-only Bridge User-Detail -> Admin-Notizen mit Kontext-Hinweis, Zieluser-Uebernahme, Ruecksprung und Hinweis ausblenden.
```

## Aktuelle relevante Datenquelle

```text
GET /api/remote/auth/model
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```
