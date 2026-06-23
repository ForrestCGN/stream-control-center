-- RDAP6A Seed Plan Dry-Run
-- Nicht blind produktiv ausfuehren. Erst Testdatenbank + Backup/Restore-Konzept.

INSERT INTO dashboard_roles (role_key, label, description, is_system) VALUES
('owner', 'Owner', 'Vollzugriff und Security-Hoheit.', 1),
('admin', 'Admin', 'Verwaltung freigegebener Module, Benutzer und Einstellungen.', 1),
('lead_mod', 'Lead-Mod', 'Erweiterte Mod-Team-Funktionen.', 1),
('mod', 'Mod', 'Normale Stream-/Mod-Bedienung.', 1),
('media_manager', 'Media Manager', 'Optionale Medienpflege.', 1),
('readonly', 'Read-only', 'Nur-Lesen-Zugriff.', 1)
ON DUPLICATE KEY UPDATE label=VALUES(label), description=VALUES(description);

-- Wichtig: sound_profi ist Gruppe/Marker, keine Rolle.
INSERT INTO dashboard_groups (group_key, label, group_type, grants_permissions_by_itself, description, is_system) VALUES
('sound_profi', 'Sound-Profi', 'group_marker', 0, 'Fachliche Markierung fuer Sound-/Media-/Command-/Kanalpunkte-Bereiche. Rechte kommen nur ueber Modulmatrix.', 1)
ON DUPLICATE KEY UPDATE label=VALUES(label), group_type=VALUES(group_type), grants_permissions_by_itself=VALUES(grants_permissions_by_itself), description=VALUES(description);

INSERT INTO dashboard_permissions (permission_key, label, area, protection_level, description) VALUES
('dashboard.read', 'Dashboard lesen', 'dashboard', 'low', NULL),
('admin.audit.read', 'Audit lesen', 'admin', 'medium', NULL),
('admin.users.manage', 'Benutzer verwalten', 'admin', 'critical', NULL),
('admin.roles.manage', 'Rollen/Rechte verwalten', 'admin', 'critical', NULL),
('locks.read', 'Locks lesen', 'locks', 'low', NULL),
('locks.create', 'Locks erstellen', 'locks', 'medium', NULL),
('locks.heartbeat', 'Lock-Heartbeat senden', 'locks', 'medium', NULL),
('locks.release', 'Locks freigeben', 'locks', 'medium', NULL),
('locks.takeover', 'Locks uebernehmen', 'locks', 'critical', NULL),
('texts.read', 'Texte lesen', 'texts', 'low', NULL),
('texts.edit', 'Texte bearbeiten', 'texts', 'medium', NULL),
('config.read', 'Configs lesen', 'config', 'low', NULL),
('config.edit', 'Configs bearbeiten', 'config', 'high', NULL),
('media.read', 'Media lesen', 'media', 'low', NULL),
('media.upload', 'Media hochladen', 'media', 'medium', NULL),
('media.edit', 'Media bearbeiten', 'media', 'medium', NULL),
('media.delete', 'Media loeschen', 'media', 'high', NULL),
('sound.read', 'Sounds lesen', 'sound', 'low', NULL),
('sound.test', 'Sounds testen', 'sound', 'medium', NULL),
('sound.command.edit', 'Sound-Commands bearbeiten', 'sound', 'high', NULL),
('channelpoints.edit', 'Kanalpunkte-Aktionen bearbeiten', 'twitch', 'high', NULL),
('agent.status.read', 'Agent-Status lesen', 'agent', 'low', NULL)
ON DUPLICATE KEY UPDATE label=VALUES(label), area=VALUES(area), protection_level=VALUES(protection_level);

-- Beispiel fuer spaetere gezielte Rechte via Modulmatrix, bewusst auskommentiert.
-- INSERT INTO dashboard_module_permissions (subject_type, subject_key, permission_key, target_type, target_key, effect)
-- VALUES ('group', 'sound_profi', 'sound.test', 'module', 'sound', 'allow');
