# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestätigt.
- [ ] RDAP8 ZIP lokal einspielen.
- [ ] RDAP8 lokale Syntaxchecks ausführen.
- [ ] RDAP8 `git status` prüfen.
- [ ] RDAP8 `stepdone.cmd` ausführen.
- [ ] RDAP8 Webserver-Deploy aus frischem GitHub/dev-Clone durchführen.
- [ ] RDAP8 Remote-Readiness nach Restart abwarten.
- [ ] RDAP8 Statusroute remote testen.
- [ ] RDAP8 Foundation-Diagnose remote testen.
- [ ] Erwartung RDAP8 prüfen:
  - [ ] `moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN`
  - [ ] `statusApiVersion: rdap_admin_users8.v1`
  - [ ] `auditHelperPrepared:true`
  - [ ] `auditWriteEnabled:false`
  - [ ] `writeEnabled:false`
  - [ ] `writesStillBlocked:true`

## Danach

- [ ] `RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN` planen.
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
