# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP

Status: deployed und remote getestet.  
Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Bestätigt remote

```text
moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
statusApiVersion: rdap_admin_users7b.v1
adminUsersWriteFoundation.confirmWriteHelperPrepared: true
auth.permissions.confirmWriteHelperPrepared: true
auth.permissions.adminUsersConfirmWriteHelperPrepared: true
confirmWriteDiagnostic.helperPrepared: true
writeEnabled: false
writesStillBlocked: true
```

### Geändert

- Confirm-Write-Metadaten in Statusroute bereinigt.
- Confirm-Write-Metadaten in Foundation-Diagnose sichtbarer gemacht.
- Testpfade dokumentiert.
- Doku, CURRENT_STATUS, NEXT_STEPS, TODO, FILES aktualisiert.
- Neuer Prompt für nächsten Chat erstellt:
  - `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP7B_2026-06-24.md`

### Nicht geändert

- Keine User-Writes.
- Keine Rollen-Writes.
- Keine Gruppen-Writes.
- Keine Session-Widerrufe.
- Keine DB-Migration.
- Keine SQL-Dateien.
- Keine Secrets.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

Status: deployed und remote getestet.

### Geändert

- Confirm-Write-Helper vorbereitet:
  - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
- Helper akzeptiert geplant:
  - `confirmWrite`
  - `confirm_write`
- Akzeptierte Werte:
  - `true`
  - `"true"`
  - `"1"`
  - `1`
- Produktive Writes bleiben trotz akzeptiertem Confirm deaktiviert.

## RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

Status: deployed und getestet.

### Geändert

- Neue read-only Foundation-Diagnose vorbereitet:
  - `/api/remote/admin/users/write-foundation-diagnostic`
- Neuer Service:
  - `remote-modboard/backend/src/services/admin-user-write-foundation.service.js`
- Admin-User-Routen erweitert:
  - `permission-diagnostic` bleibt bestehen.
  - `write-foundation-diagnostic` kommt hinzu.

## RDAP_META1_BUILD_HEADER_CLEANUP

Status: deployed und getestet.

Bestätigt:

- `/api/remote/status` zeigte:
  - `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
  - `statusApiVersion: rdap_meta1.v1`

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
