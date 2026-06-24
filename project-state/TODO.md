# TODO - stream-control-center

Stand: RDAP_META1_BUILD_HEADER_CLEANUP  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [ ] RDAP_META1_BUILD_HEADER_CLEANUP lokal einspielen.
- [ ] Lokale Syntaxchecks ausführen.
- [ ] `git status` prüfen.
- [ ] Bei Erfolg `stepdone.cmd` ausführen.
- [ ] Danach Webserver-Deploy aus frischem GitHub/dev-Clone durchführen.
- [ ] Remote-Readiness nach Restart abwarten.
- [ ] `/api/remote/status` prüfen.
- [ ] Erwartung: `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`.
- [ ] Erwartung: `statusApiVersion: rdap_meta1.v1`.
- [ ] `/api/remote/routes` prüfen und `permission-diagnostic` bestätigen.
- [ ] `/api/remote/admin/users/permission-diagnostic` ohne Session prüfen: `401` ist korrekt.
- [ ] Browser-Test mit ForrestCGN-Session bei Bedarf erneut prüfen.

## Danach

- [ ] `RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION` planen.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Owner/Admin-Fallback-Reason später verständlicher machen.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN` später fortsetzen.
- [ ] Ziel: Remote-Modboard zusätzlich lokal im Heimnetz betreiben.
- [ ] Ziel: ForrestCGN und EngelCGN sollen lokal arbeiten können.
- [ ] Lokaler Login soll ebenfalls über Twitch laufen.
- [ ] Erst fortsetzen, wenn das Web-Dashboard online stabil genug ist.
- [ ] Keine lokalen Secrets ins Repo.
