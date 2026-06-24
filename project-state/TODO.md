# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestätigt.
- [x] RDAP8 ZIP lokal eingespielt.
- [x] RDAP8 lokale Syntaxchecks ausgeführt.
- [x] RDAP8 `git status` geprüft.
- [x] RDAP8 `stepdone.cmd` ausgeführt.
- [x] RDAP8 Webserver-Deploy aus frischem GitHub/dev-Clone durchgeführt.
- [x] RDAP8 Remote-Readiness nach Restart abgewartet.
- [x] RDAP8 Statusroute remote getestet.
- [x] RDAP8 Foundation-Diagnose remote getestet.
- [x] Erwartung RDAP8 geprüft:
  - [x] `moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN`
  - [x] `statusApiVersion: rdap_admin_users8.v1`
  - [x] `auditHelperPrepared:true`
  - [x] `auditWriteEnabled:false`
  - [x] `writeEnabled:false`
  - [x] `writesStillBlocked:true`

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
