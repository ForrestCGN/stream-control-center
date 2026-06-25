# CHANGELOG

## RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY - 2026-06-25

- Neue read-only Service-Datei gebaut:
  - `admin-audit-lock-schema-status-readonly.service.js`
- Neue Routen registriert:
  - `GET /api/remote/admin/audit-lock/schema-status`
  - `GET /api/remote/lock-audit/schema-status`
- `/api/remote/routes` um RDAP33-Status erweitert.
- Route liest Audit-/Lock-Schema, Counts und sichere Preview-Zeilen.
- Keine Writes, keine Migration, keine UI-Schreibbuttons.
