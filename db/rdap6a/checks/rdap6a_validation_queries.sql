-- RDAP6A Validation Queries
-- Nur nach Testmigration auf Testdatenbank verwenden.

SELECT role_key FROM dashboard_roles ORDER BY role_key;
SELECT group_key, group_type, grants_permissions_by_itself FROM dashboard_groups ORDER BY group_key;
SELECT permission_key, area, protection_level FROM dashboard_permissions ORDER BY permission_key;

-- Muss 0 liefern: sound_profi darf keine Rolle sein.
SELECT COUNT(*) AS sound_profi_role_count FROM dashboard_roles WHERE role_key = 'sound_profi';

-- Muss 1 liefern: sound_profi ist Gruppe/Marker.
SELECT COUNT(*) AS sound_profi_group_count FROM dashboard_groups WHERE group_key = 'sound_profi' AND group_type = 'group_marker' AND grants_permissions_by_itself = 0;

-- Muss 0 liefern: keine globalen Rollenrechte fuer sound_profi.
SELECT COUNT(*) AS sound_profi_role_permission_count FROM dashboard_role_permissions WHERE role_key = 'sound_profi';
