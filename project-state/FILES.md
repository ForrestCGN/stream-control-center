# FILES

Stand: RDAP65A_ADMIN_NOTES_BROWSER_VERIFICATION_DOC  
Datum: 2026-06-26

## Fuer RDAP65B besonders wichtig

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
```

## Bedeutung

```text
remote-modboard.js:
- echter Haupt-Router
- bindNavigation()
- setPage()
- currentPage
- is-active-view
- RDAP64D: Delegation fuer spaeter injizierte Navigation
- RDAP64D: window.RdapMainRouter mit setPage/loadDashboard/getCurrentPage

rdap28-admin-notes.js:
- fachliches Admin-Notes-Modul
- enthaelt RDAP64 Update-UI-Code
- wird live durch app.js injiziert

app.js:
- injiziert rdap28-admin-notes.js in die ausgelieferte Dashboard-HTML
- dadurch war die Ursache vor RDAP64D nicht nur fehlende Script-Ladung, sondern Router-/Sichtbarkeitskollision
```

## Backend-Dateien fuer Abgleich

```text
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

## Doku

```text
docs/current/RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_LIVE_CONFIRMED.md
docs/current/RDAP64E_DOKU_STATUS_AFTER_ROUTER_FIX.md
docs/current/RDAP65A_ADMIN_NOTES_BROWSER_VERIFICATION_DOC.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP65A.md
```
