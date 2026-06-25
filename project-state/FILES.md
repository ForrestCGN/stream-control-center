# FILES

Stand: RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN  
Datum: 2026-06-25

## Geaendert in RDAP41

```text
docs/current/RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP41.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine Code-Dateien in RDAP41

```text
RDAP41 ist Doku-/Plan-only.
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Keine Config-Aenderung.
Kein Webserver-Deploy noetig.
```

## RDAP40 geaenderte Code-Datei

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## RDAP39C relevante Code-Dateien

```text
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Relevante DB-Tabellen

```text
dashboard_user_admin_notes
dashboard_audit_log
dashboard_locks
dashboard_permissions
dashboard_role_permissions
dashboard_roles
dashboard_user_roles
dashboard_sessions
dashboard_users
```

## Naechster Dateibereich fuer RDAP41B

Bei Status-Semantik-Cleanup:

```text
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

## Danach moeglicher Dateibereich fuer Zieluser-/Detailseiten-Planung

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
```
