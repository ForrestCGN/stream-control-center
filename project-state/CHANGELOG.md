# CHANGELOG

## RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP33 Live-Deploy dokumentiert.
- `/api/remote/routes` RDAP33-Status dokumentiert.
- `/api/remote/admin/audit-lock/schema-status?limit=5` Live-Ausgabe ausgewertet.
- Audit-Befund dokumentiert:
  - `dashboard_audit_log` existiert.
  - `rowCount = 0`.
  - `compatibleForWriteCandidate = false`.
  - Blocker: fehlendes `resource_type`.
- Lock-Befund dokumentiert:
  - `dashboard_locks` existiert.
  - `rowCount = 0`.
  - `activeCount = 0`.
  - `expiredCount = 0`.
  - `compatibleForWriteCandidate = true`.
- Recommended Next Step dokumentiert:
  - `RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN`.
- Webserver-Deploy-Standard korrigiert:
  - kurzer relativer `_deploy_tmp`-Stil.
  - keine langen absoluten Clone-Zielpfade.
  - kein zusaetzlicher manueller Restart direkt nach Deploy-Script.
