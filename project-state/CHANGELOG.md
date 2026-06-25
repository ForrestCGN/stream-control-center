# CHANGELOG

## RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP37 Live-Deploy bestaetigt.
- `/api/remote/status` meldet:
  - `moduleBuild = RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED`
  - `statusApiVersion = rdap_lock37.v1`
  - `adminLockTest.prepared = true`
- `/api/remote/routes` meldet:
  - `statusApiVersion = rdap_lock37.v1`
  - `adminLockTest.prepared = true`
- Ohne-Confirm-Schutztest erfolgreich:
  - `ok = false`
  - `reason = confirm_write_required`
  - `writeExecuted = false`
  - `readBackPerformed = false`
- Kontrollierter Lock-Test erfolgreich:
  - `ok = true`
  - `reason = lock_test_cycle_executed`
  - `writeExecuted = true`
  - `databaseWriteExecuted = true`
  - `readBackPerformed = true`
  - `readBackFoundAfterAcquire = true`
  - `readBackFoundAfterHeartbeat = true`
  - `readBackFoundAfterRelease = true`
- Test-Lock:
  - `lock_uid = rdap37_lock_test_20260625100908_42dbbd555e49`
  - `resource_key = rdap37:test:rdap37_lock_test_20260625100908_42dbbd555e49`
  - `owner_user_uid = system:rdap37-local-test`
  - finaler Status: `released`
- Operationen erfolgreich:
  - Acquire
  - Heartbeat
  - Release
- Finaler Readback:
  - `locks.rowCount = 1`
  - `locks.activeCount = 0`
  - `locks.expiredCount = 0`
  - `locks.statusSummary.released = 1`
- Audit-Readback:
  - `audit.rowCount = 2`
  - `admin.audit.test_insert = 2`
- Sicherheitsbestaetigung:
  - keine Admin-Notiz-Writes
  - keine produktiven Audit-Writes
  - keine UI-Schreibbuttons
  - kein physisches Delete
  - kein aktiver Test-Lock haengen geblieben
- Naechster Step:
  - `RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN`

## RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED - 2026-06-25

- Kontrollierten Lock-Test fuer `dashboard_locks` vorbereitet.
- Neue Statusroute:
  - `GET /api/remote/admin/locks/test/status`
- Neue lokale Test-Route:
  - `POST /api/remote/admin/locks/test-cycle`
- Test-Route verlangt:
  - local-only
  - `confirmWrite=true` im JSON-Body
  - `testOnly=true`
- Test-Lifecycle:
  - Acquire
  - Readback nach Acquire
  - Heartbeat
  - Readback nach Heartbeat
  - Release
  - Readback nach Release
- Keine Admin-Notiz-Writes.
- Keine produktiven Audit-Writes.
- Keine UI-Schreibbuttons.
- Kein physisches Delete.
- `server.js` Build-Metadaten auf RDAP37 aktualisiert.
- `/api/remote/status` und `/api/remote/routes` Status-Metadaten auf `rdap_lock37.v1` vorbereitet.
- Doku/Status/TODO/FILES aktualisiert.

## RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP36 Live-Deploy dokumentiert.
- Backup dokumentiert:
  - `/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap36_before_audit_test_insert_20260625_095512.sql`
- Ohne-Confirm-Schutztest dokumentiert:
  - HTTP 400
  - `confirm_write_required`
  - `writeExecuted = false`
- Audit-Testinsert dokumentiert:
  - `insertedAuditUid = rdap36_audit_test_20260625075600_b497452f9d54`
  - `action = admin.audit.test_insert`
  - `source = remote-modboard/rdap36`
  - `resource_type = admin_audit_test`
- Zweiter manueller RDAP36 Kontroll-Test im Chat:
  - `insertedAuditUid = rdap36_audit_test_20260625100036_cb116ad144c3`
  - `audit.id = 2`
- Naechster Step:
  - `RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED`
- Keine produktiven Writes aktiviert.
