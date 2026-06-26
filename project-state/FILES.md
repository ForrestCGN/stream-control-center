# FILES

Stand: RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN  
Datum: 2026-06-26

## Fuer RDAP67 besonders wichtig

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Bedeutung

```text
rdap28-admin-notes.js:
- fachliches Admin-Notes-Modul
- enthaelt Read/Create/Update-UI
- enthaelt Bearbeiten-UI
- muss confirmWrite:true fuer Create/Update behalten
- darf kein Deactivate/Delete einfuehren

remote-modboard.css:
- optional fuer reine UI-/Lesbarkeitsverbesserungen
- nur nutzen, wenn Polish nicht sauber in bestehender Struktur moeglich ist

remote-modboard.js:
- Haupt-Router
- RDAP64D hat Router-Integration stabilisiert
- in RDAP67 moeglichst nicht anfassen, ausser zwingender Befund
```

## Backend-Dateien nur zum Abgleich, nicht fuer RDAP67 aendern

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
docs/current/RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP66.md
```
