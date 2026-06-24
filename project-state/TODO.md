# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [ ] RDAP_ADMIN_USERS5 lokal einspielen.
- [ ] Route `/api/remote/admin/users/permission-diagnostic` lokal testen.
- [ ] Erwartung ohne Session pruefen: 401 / `not_logged_in_or_session_invalid`.
- [ ] Erwartung mit Browser-Session pruefen: read-only Diagnose mit `writeEnabled: false`.
- [ ] `git status` pruefen.
- [ ] `stepdone.cmd` ausfuehren.
- [ ] Webserver-Deploy aus GitHub/dev durchfuehren.
- [ ] Remote-Readiness nach Restart abwarten.
- [ ] Remote-Diagnose pruefen.

## Danach

- [ ] RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION planen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Secrets rotieren, falls noch offen.
