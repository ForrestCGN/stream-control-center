-- RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
-- Read-back check after the migration.
-- This file performs SELECT-only checks.

SELECT DATABASE() AS current_database;

SELECT
  COLUMN_NAME AS column_name,
  COLUMN_TYPE AS column_type,
  IS_NULLABLE AS is_nullable,
  COLUMN_DEFAULT AS column_default,
  ORDINAL_POSITION AS ordinal_position
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
ORDER BY ORDINAL_POSITION;

SELECT
  'resource_type' AS column_name,
  IF(COUNT(*) = 1, 'exists', 'missing') AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
  AND COLUMN_NAME = 'resource_type'
UNION ALL
SELECT
  'actor_login' AS column_name,
  IF(COUNT(*) = 1, 'exists', 'missing') AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
  AND COLUMN_NAME = 'actor_login'
UNION ALL
SELECT
  'error_code' AS column_name,
  IF(COUNT(*) = 1, 'exists', 'missing') AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
  AND COLUMN_NAME = 'error_code'
UNION ALL
SELECT
  'safe_metadata_json' AS column_name,
  IF(COUNT(*) = 1, 'exists', 'missing') AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
  AND COLUMN_NAME = 'safe_metadata_json'
UNION ALL
SELECT
  'completed_at' AS column_name,
  IF(COUNT(*) = 1, 'exists', 'missing') AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_audit_log'
  AND COLUMN_NAME = 'completed_at';

SELECT COUNT(*) AS audit_row_count
FROM dashboard_audit_log;
