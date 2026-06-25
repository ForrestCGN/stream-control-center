# CHANGELOG

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
- Readback dokumentiert:
  - `audit.rowCount = 1`
  - `writeEnabled = false`
  - `productiveWritesEnabled = false`
  - `writesStillBlocked = true`
- Naechster Step:
  - `RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED`
- Keine Backend-/UI-Aenderung.
- Keine produktiven Writes aktiviert.
