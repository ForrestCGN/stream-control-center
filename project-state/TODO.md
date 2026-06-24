# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP5 Admin-User-Permission-Diagnose remote getestet.
- [x] RDAP_META1 Build/Header-Cleanup remote getestet.
- [ ] RDAP6 ZIP lokal einspielen.
- [ ] RDAP6 lokale Syntaxchecks ausführen.
- [ ] RDAP6 `git status` prüfen.
- [ ] RDAP6 `stepdone.cmd` ausführen.
- [ ] RDAP6 Webserver-Deploy aus frischem GitHub/dev-Clone durchführen.
- [ ] RDAP6 Remote-Readiness nach Restart abwarten.
- [ ] RDAP6 Route `/api/remote/admin/users/write-foundation-diagnostic` remote testen.
- [ ] Erwartung RDAP6 prüfen:
  - [ ] HTTP 200
  - [ ] `readOnly:true`
  - [ ] `writeEnabled:false`
  - [ ] `writesStillBlocked:true`
  - [ ] `confirmWriteRequired:true`
  - [ ] `auditRequired:true`
  - [ ] `lockingRequired:true`

## Danach

- [ ] `RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED` planen.
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
