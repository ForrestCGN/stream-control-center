# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Tabellen-/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Diagnose-Route read-only gebaut.
- [ ] RDAP14 lokal einspielen und Syntax prüfen.
- [ ] RDAP14 `stepdone.cmd` lokal ausführen.
- [ ] RDAP14 Webserver-Deploy aus frischem GitHub/dev-Clone.
- [ ] RDAP14 Status-/Routen-/Admin-Notiz-Diagnose remote prüfen.
- [ ] RDAP14B Deploy-Bestätigung dokumentieren.
- [ ] Noch keine produktiven Admin-Writes.
- [ ] Noch keine DB-Migration.
- [ ] Noch keine UI-Schreibbuttons.

## RDAP14 Checks

- [ ] `GET /api/remote/admin/users/admin-note-diagnostic` liefert JSON.
- [ ] `writeEnabled` bleibt `false`.
- [ ] `productiveWritesEnabled` bleibt `false`.
- [ ] `migrationEnabled` bleibt `false`.
- [ ] `writesStillBlocked` bleibt `true`.
- [ ] `routeRemainsReadOnly` bleibt `true`.

## Später

- [ ] RDAP15 Admin-Notiz-Migration nur planen, nicht blind ausführen.
- [ ] Backup-/Rollback-Befehl vor jeder Migration dokumentieren.
- [ ] Danach separater Write-Plan mit Permission, Confirm, Audit, Lock und Read-Back.
