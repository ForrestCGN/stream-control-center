# CHANGELOG

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP

Typ: Code klein + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Geändert

- Confirm-Write-Metadaten bereinigt:
  - `auth.permissions.confirmWriteHelperPrepared:true`
  - `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
  - `confirmWriteHelperPrepared:true` in Foundation-Diagnose
  - `confirmWriteHelper.prepared:true` in Foundation-Diagnose
- Build/API-Version auf RDAP7B aktualisiert:
  - `RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP`
  - `rdap_admin_users7b.v1`
- `confirmWriteDiagnostic` bleibt erhalten.
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
- Keine UI-Schreibbuttons.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.

## RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

Status: deployed und getestet, kleiner Metadaten-Cleanup nötig.

Bestätigt:

- `moduleBuild:"RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED"`
- `statusApiVersion:"rdap_admin_users7.v1"`
- `/api/remote/routes` zeigt `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`.
- Produktive Writes bleiben deaktiviert.

Problem:

- Testpfade `.auth.permissions.confirmWriteHelperPrepared` und `.confirmWriteHelper` liefen auf `null`, weil die Felder anders benannt/platziert waren.

## Geparkt

`RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN` bleibt geparkt, bis Web-Dashboard stabiler ist.
