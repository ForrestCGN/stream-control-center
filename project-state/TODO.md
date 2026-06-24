# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup deployed und getestet.
- [x] RDAP8 Audit-Helper disabled deployed und getestet.
- [ ] RDAP9 ZIP lokal einspielen.
- [ ] RDAP9 lokale Checks ausführen.
- [ ] RDAP9 `git status` prüfen.
- [ ] RDAP9 `stepdone.cmd` ausführen.
- [ ] RDAP9 Webserver-Deploy aus frischem GitHub/dev-Clone durchführen.
- [ ] RDAP9 Remote-Readiness nach Restart abwarten.
- [ ] RDAP9 Lock-Helper-Metadaten remote testen.

## Erwartung RDAP9

- [ ] `moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN`
- [ ] `statusApiVersion: rdap_admin_users9.v1`
- [ ] `lockHelperPrepared:true`
- [ ] `lockWriteEnabled:false`
- [ ] `lockAcquireEnabled:false`
- [ ] `lockHeartbeatEnabled:false`
- [ ] `lockReleaseEnabled:false`
- [ ] `lockForceTakeoverEnabled:false`
- [ ] `writeEnabled:false`
- [ ] `writesStillBlocked:true`

## Danach

- [ ] `RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN` planen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Keine UI-Schreibbuttons vor sauber bestätigtem Backend-Sicherheitsweg.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
