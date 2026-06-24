# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN

Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Geändert

- Neuer disabled Audit-Helper vorbereitet:
  - `remote-modboard/backend/src/services/admin-audit-write.service.js`
- Write-Foundation-Diagnose erweitert:
  - `auditHelperPrepared:true`
  - `auditWriteEnabled:false`
  - `auditDiagnostic.helperPrepared:true`
- Statusroute erweitert:
  - `adminUsersWriteFoundation.auditHelperPrepared:true`
  - `auth.permissions.auditHelperPrepared:true`
- Routenübersicht aktualisiert.
- `package.json` Syntaxcheck um `admin-audit-write.service.js` erweitert.
- Doku, CURRENT_STATUS, NEXT_STEPS, TODO, FILES aktualisiert.
- Neuer Prompt für nächsten Chat erstellt:
  - `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP8_2026-06-24.md`

### Nicht geändert

- Keine User-Writes.
- Keine Rollen-Writes.
- Keine Gruppen-Writes.
- Keine Session-Widerrufe.
- Keine DB-Migration.
- Keine Audit-Inserts oder Audit-Updates.
- Keine SQL-Dateien.
- Keine Secrets.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP

Status: deployed und getestet.

Bestätigt:

- `moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP`
- `statusApiVersion: rdap_admin_users7b.v1`
- `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
- `auth.permissions.confirmWriteHelperPrepared:true`
- `auth.permissions.adminUsersConfirmWriteHelperPrepared:true`
- `confirmWriteDiagnostic.helperPrepared:true`
- `writeEnabled:false`
- `writesStillBlocked:true`

## Geparkt

`RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN` bleibt geparkt, bis Web-Dashboard stabiler ist.
