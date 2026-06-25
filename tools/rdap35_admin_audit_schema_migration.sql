-- RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
-- Safe MariaDB migration for dashboard_audit_log.
-- Purpose: gently extend the existing audit table.
-- No data update, no delete, no drop, no parallel table.
-- Required before execution:
--   1. mysqldump backup of dashboard_audit_log
--   2. backup file exists and is not 0 bytes
--   3. read-only INFORMATION_SCHEMA precheck
--
-- MariaDB supports ADD COLUMN IF NOT EXISTS.

ALTER TABLE dashboard_audit_log
  ADD COLUMN IF NOT EXISTS actor_login VARCHAR(128) NULL AFTER actor_display_name,
  ADD COLUMN IF NOT EXISTS resource_type VARCHAR(128) NULL AFTER action,
  ADD COLUMN IF NOT EXISTS error_code VARCHAR(128) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS safe_metadata_json LONGTEXT NULL AFTER new_value_summary,
  ADD COLUMN IF NOT EXISTS completed_at DATETIME NULL AFTER created_at;
