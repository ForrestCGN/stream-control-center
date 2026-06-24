# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP5 Admin-User-Permission-Diagnose remote getestet.
- [x] RDAP_META1 Build/Header-Cleanup remote getestet.
- [x] RDAP6 Confirm-/Audit-/Locking-Foundation read-only vorbereitet.
- [x] RDAP6 Route `/api/remote/admin/users/write-foundation-diagnostic` remote getestet.
- [x] RDAP7 Confirm-Write-Helper vorbereitet, produktive Writes deaktiviert.
- [x] RDAP7 remote deployed.
- [x] RDAP7B Confirm-Write-Metadaten bereinigt.
- [x] RDAP7B remote deployed.
- [x] RDAP7B remote getestet:
  - [x] `moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP`
  - [x] `statusApiVersion: rdap_admin_users7b.v1`
  - [x] `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
  - [x] `auth.permissions.confirmWriteHelperPrepared:true`
  - [x] `auth.permissions.adminUsersConfirmWriteHelperPrepared:true`
  - [x] `confirmWriteDiagnostic.helperPrepared:true`
  - [x] `writeEnabled:false`
  - [x] `writesStillBlocked:true`

## Danach

- [ ] `RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN` planen.
- [ ] Audit-Helper vorbereiten, aber produktive Audit-Writes deaktiviert lassen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Owner/Admin-Fallback-Reason-Ausgaben später verständlicher machen.
- [ ] Sidebar/Navi später aufräumen:
  - [ ] `Benutzer & Rechte` nicht doppelt neben `Admin/User & Rollen` führen.
  - [ ] Benutzer/Rechte/Sicherheit sinnvoll unter Admin bündeln.
- [ ] Local/LAN/Twitch-Login geparkt lassen, bis Web-Dashboard stabiler ist.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
