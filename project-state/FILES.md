# FILES

Stand: RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_PREP  
Datum: 2026-06-26

## Fuer RDAP64D besonders wichtig

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Bedeutung

```text
index.html:
- Dashboard-Shell
- laedt aktuell nur /assets/remote-modboard.js

remote-modboard.js:
- echter Haupt-Router
- bindNavigation()
- setPage()
- currentPage
- is-active-view

rdap28-admin-notes.js:
- bisherige Admin-Notes-Zusatzdatei
- enthaelt RDAP64 Update-UI-Code
- muss sauber an Haupt-Router/Loader angebunden werden
```

## Backend-Dateien fuer Abgleich

```text
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/app.js
```

## Doku

```text
docs/current/RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_PREP.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64C_FOR_RDAP64D.md
```
