# FILES

Stand: RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN  
Datum: 2026-06-25

## Geaendert in RDAP43

```text
docs/current/RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP43.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine Code-Dateien in RDAP43

```text
RDAP43 ist Doku-/Plan-only.
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Keine Config-Aenderung.
Kein Webserver-Deploy noetig.
```

## Fuer RDAP43 gepruefte relevante Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
```

## Naechster Dateibereich fuer RDAP44

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
```

Falls eine bestehende Userliste/API fehlt oder erweitert werden muss:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/*admin-user*.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```
