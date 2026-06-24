# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Geaendert

- Neuer Confirm-Write-Helper vorbereitet:
  - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
- Bestehende read-only Foundation-Diagnose erweitert:
  - `/api/remote/admin/users/write-foundation-diagnostic`
  - zeigt jetzt Confirm-Write-Diagnosebeispiele
- `server.js` Build auf `RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED` gesetzt.
- `/api/remote/status` meldet `statusApiVersion: rdap_admin_users7.v1` und Confirm-Write-Helper-Status.
- `/api/remote/routes` meldet `statusApiVersion: rdap_admin_users7.v1` und die Foundation-Route mit Confirm-Hinweis.
- `package.json` Syntaxcheck um `admin-confirm-write.service.js` erweitert.
- Doku, CURRENT_STATUS, NEXT_STEPS, TODO, FILES aktualisiert.
- Neuer Prompt fuer naechsten Chat erstellt:
  - `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP7_2026-06-24.md`

### Nicht geaendert

- Keine User-Writes.
- Keine Rollen-Writes.
- Keine Gruppen-Writes.
- Keine Session-Widerrufe.
- Keine DB-Migration.
- Keine SQL-Dateien.
- Keine Secrets.
- Keine UI-Schreibbuttons.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Geaendert

- Neue read-only Foundation-Diagnose vorbereitet:
  - `/api/remote/admin/users/write-foundation-diagnostic`
- Neuer Service:
  - `remote-modboard/backend/src/services/admin-user-write-foundation.service.js`
- Admin-User-Routen erweitert:
  - `permission-diagnostic` bleibt bestehen.
  - `write-foundation-diagnostic` kommt hinzu.
- Routenuebersicht erweitert.
- `package.json` Syntaxcheck um RDAP5/RDAP6 Admin-User-Dateien erweitert.
- Doku, CURRENT_STATUS, NEXT_STEPS, TODO, FILES aktualisiert.

### Nicht geaendert

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

Bestaetigt:

- `/api/remote/status` zeigte:
  - `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
  - `statusApiVersion: rdap_meta1.v1`
- `/api/remote/routes` zeigt RDAP5 Route weiter.
- `/api/remote/admin/users/permission-diagnostic` gibt ohne Session korrekt `401 Unauthorized`.

## RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

Status: deployed und getestet.

Bestaetigt:

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
