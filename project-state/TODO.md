# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP5 Admin-User-Permission-Diagnose remote getestet.
- [x] RDAP_META1 Build/Header-Cleanup remote getestet.
- [x] RDAP6 Confirm-/Audit-/Locking-Foundation vorbereitet.
- [ ] RDAP7 ZIP lokal einspielen.
- [ ] RDAP7 lokale Syntaxchecks ausfuehren.
- [ ] RDAP7 `git status` pruefen.
- [ ] RDAP7 `stepdone.cmd` ausfuehren.
- [ ] RDAP7 Webserver-Deploy aus frischem GitHub/dev-Clone durchfuehren.
- [ ] RDAP7 Remote-Readiness nach Restart abwarten.
- [ ] RDAP7 Route `/api/remote/admin/users/write-foundation-diagnostic` remote testen.
- [ ] Erwartung RDAP7 pruefen:
  - [ ] Header/Status `RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED`
  - [ ] `statusApiVersion: rdap_admin_users7.v1`
  - [ ] `confirmWriteHelperPrepared:true`
  - [ ] `confirmWriteHelperExecutesWrites:false`
  - [ ] `writesStillBlocked:true`
  - [ ] `confirmWriteDiagnostic.examples.missingConfirm.reason: confirm_write_required`
  - [ ] `confirmWriteDiagnostic.examples.confirmWriteTrue.reason: confirm_write_accepted_but_writes_disabled`

## Danach

- [ ] `RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED` planen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Sidebar-/Navigation-Cleanup separat planen:
  - [ ] Doppelte Struktur `Benutzer & Rechte` vs. `Admin -> User & Rollen` bereinigen.
  - [ ] Benutzer/Rechte/Zugriff/Sicherheit sauber unter Admin buendeln.
- [ ] Owner/Admin-Fallback-Reason-Ausgaben spaeter verstaendlicher machen.
- [ ] Local/LAN/Twitch-Login geparkt lassen, bis Web-Dashboard stabiler ist.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten koennen.
- [ ] Lokaler Login ebenfalls ueber Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
