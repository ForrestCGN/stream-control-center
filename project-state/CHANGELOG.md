# CHANGELOG

## RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED - 2026-06-25

- SQL-Dateien fuer sanfte Erweiterung von `dashboard_audit_log` vorbereitet:
  - `tools/rdap35_admin_audit_schema_precheck.sql`
  - `tools/rdap35_admin_audit_schema_migration.sql`
  - `tools/rdap35_admin_audit_schema_readback.sql`
- Geplante Spalten:
  - `actor_login`
  - `resource_type`
  - `error_code`
  - `safe_metadata_json`
  - `completed_at`
- Server-Ausfuehrungsdoku erstellt.
- Keine Backend-/UI-Aenderung.
- Keine DB-Migration durch ZIP-Installation.
- Keine produktiven Writes aktiviert.
