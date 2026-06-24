# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Geändert

- Neue read-only Foundation-Diagnose vorbereitet:
  - `/api/remote/admin/users/write-foundation-diagnostic`
- Neuer Service:
  - `remote-modboard/backend/src/services/admin-user-write-foundation.service.js`
- Admin-User-Routen erweitert:
  - `permission-diagnostic` bleibt bestehen.
  - `write-foundation-diagnostic` kommt hinzu.
- Routenübersicht erweitert.
- `package.json` Syntaxcheck um RDAP5/RDAP6 Admin-User-Dateien erweitert.
- Doku, CURRENT_STATUS, NEXT_STEPS, TODO, FILES aktualisiert.
- Neuer Prompt für nächsten Chat erstellt:
  - `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP6_2026-06-24.md`

### Nicht geändert

- Keine User-Writes.
- Keine Rollen-Writes.
- Keine Gruppen-Writes.
- Keine Session-Widerrufe.
- Keine DB-Migration.
- Keine SQL-Dateien.
- Keine Secrets.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_META1_BUILD_HEADER_CLEANUP

Status: deployed und getestet.

Bestätigt:

- `/api/remote/status` zeigt:
  - `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
  - `statusApiVersion: rdap_meta1.v1`
- `/api/remote/routes` zeigt RDAP5 Route weiter.
- `/api/remote/admin/users/permission-diagnostic` gibt ohne Session korrekt `401 Unauthorized`.

## RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

Status: deployed und getestet.

Bestätigt:

- `/api/remote/admin/users/permission-diagnostic` aktiv.
- Ohne Session: `401 Unauthorized` korrekt.
- Mit ForrestCGN Browser-Session:
  - `ok:true`
  - `loggedIn:true`
  - `dashboardAccess:true`
  - `roles:["owner"]`
  - `isOwner:true`
  - `isAdmin:true`
  - `canReadAdminUsers:true`
  - `canWriteAdminUsers:false`

## Geparkt

`RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN` bleibt geparkt, bis Web-Dashboard stabiler ist.
