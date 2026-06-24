# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7 Confirm-Write-Helper deployed.
- [x] RDAP7 produktive Writes weiter deaktiviert.
- [ ] RDAP7B ZIP lokal einspielen.
- [ ] RDAP7B lokale Syntaxchecks ausführen.
- [ ] RDAP7B `git status` prüfen.
- [ ] RDAP7B `stepdone.cmd` ausführen.
- [ ] RDAP7B Webserver-Deploy aus frischem GitHub/dev-Clone durchführen.
- [ ] RDAP7B Remote-Readiness nach Restart abwarten.
- [ ] RDAP7B Statusroute testen:
  - [ ] `moduleBuild:"RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP"`
  - [ ] `statusApiVersion:"rdap_admin_users7b.v1"`
  - [ ] `auth.permissions.confirmWriteHelperPrepared:true`
  - [ ] `adminUsersWriteFoundation.confirmWriteHelperPrepared:true`
- [ ] RDAP7B Foundation-Diagnose testen:
  - [ ] `readOnly:true`
  - [ ] `writeEnabled:false`
  - [ ] `writesStillBlocked:true`
  - [ ] `confirmWriteRequired:true`
  - [ ] `confirmWriteHelperPrepared:true`
  - [ ] `confirmWriteHelper.prepared:true`

## Danach

- [ ] `RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN` planen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Owner/Admin-Fallback-Reason-Ausgaben später verständlicher machen.
- [ ] Local/LAN/Twitch-Login geparkt lassen, bis Web-Dashboard stabiler ist.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
