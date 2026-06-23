-- RDAP6C Validation Queries
-- Nach Test-/Migrationslauf ausfuehren.

SELECT 'roles' AS section_name;
SELECT role_key FROM dashboard_roles ORDER BY role_key;

SELECT 'groups' AS section_name;
SELECT group_key, group_type, grants_permissions_by_itself FROM dashboard_groups ORDER BY group_key;

SELECT 'sound_profi_must_not_be_role' AS check_name;
SELECT COUNT(*) AS sound_profi_role_count FROM dashboard_roles WHERE role_key = 'sound_profi';

SELECT 'sound_profi_must_be_group_marker' AS check_name;
SELECT COUNT(*) AS sound_profi_group_marker_count
FROM dashboard_groups
WHERE group_key = 'sound_profi'
  AND group_type = 'group_marker'
  AND grants_permissions_by_itself = 0;

SELECT 'sound_profi_must_not_have_role_permissions' AS check_name;
SELECT COUNT(*) AS sound_profi_role_permission_count
FROM dashboard_role_permissions
WHERE role_key = 'sound_profi';

SELECT 'module_permission_matrix_exists' AS check_name;
SELECT COUNT(*) AS module_permission_table_rows FROM dashboard_module_permissions;

SELECT 'sessions_table_exists' AS check_name;
SELECT COUNT(*) AS session_rows FROM dashboard_sessions;

SELECT 'locks_table_exists' AS check_name;
SELECT COUNT(*) AS lock_rows FROM dashboard_locks;

SELECT 'audit_table_exists' AS check_name;
SELECT COUNT(*) AS audit_rows FROM dashboard_audit_log;
