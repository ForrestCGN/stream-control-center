# FILES

Stand: RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN  
Datum: 2026-06-26

## Geaendert in RDAP52

```text
docs/current/RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP52.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geaendert in RDAP52

```text
Frontend-Code
Backend-Routen
Backend-Services
DB-Schema
Deploy-Script
Permissions
Auth/Login
Admin-Notizen-Code
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

## Fuer RDAP53 voraussichtlich relevant

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
```
