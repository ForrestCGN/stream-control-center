# FILES

Stand: RDAP64E_DOKU_STATUS_AFTER_ROUTER_FIX  
Datum: 2026-06-26

## Fuer RDAP64D/RDAP64E besonders wichtig

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
```

## Bedeutung

```text
index.html:
- Dashboard-Shell
- enthaelt statisch nur /assets/remote-modboard.js

app.js:
- injiziert im ausgelieferten HTML zusaetzliche Frontend-Scripte
- dadurch wird rdap28-admin-notes.js live nach remote-modboard.js geladen

remote-modboard.js:
- echter Haupt-Router
- bindNavigation()
- setPage()
- currentPage
- is-active-view
- RDAP64D: Delegation fuer injizierte Navigation und Bereinigung fremder hidden-Zustaende

rdap28-admin-notes.js:
- fachliches Admin-Notes-Modul
- enthaelt RDAP64 Update-UI-Code
- bleibt in RDAP64D als Fachmodul erhalten
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64E.md
```
