# CHANGELOG

## RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED - 2026-06-25

- Lokalen kontrollierten Audit-Testinsert-Service gebaut.
- Neue Routen:
  - `GET /api/remote/admin/audit/test-insert/status`
  - `POST /api/remote/admin/audit/test-insert`
- Testinsert ist local-only, braucht Body-confirmWrite und testOnly=true.
- Keine Admin-Notiz-Writes.
- Keine Lock-Writes.
- Keine UI-Schreibbuttons.
