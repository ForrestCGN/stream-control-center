-- RDAP6A Auth DB Schema Dry-Run
-- Stand: 2026-06-23
-- Zweck: Schema-Entwurf fuer Test-/Dry-Run. Nicht blind produktiv ausfuehren.
-- Keine Auth-/Session-/Write-Aktivierung durch dieses SQL.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  migration_key VARCHAR(120) NOT NULL,
  version VARCHAR(40) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(128) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'applied',
  notes TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_schema_migrations_key (migration_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uid VARCHAR(64) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  login_name VARCHAR(120) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_users_uid (user_uid),
  UNIQUE KEY uq_dashboard_users_login (login_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_identities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uid VARCHAR(64) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  provider_user_id VARCHAR(120) NOT NULL,
  provider_login VARCHAR(120) NULL,
  provider_display_name VARCHAR(120) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_identities_provider_user (provider, provider_user_id),
  KEY idx_dashboard_identities_user_uid (user_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_key VARCHAR(80) NOT NULL,
  label VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_roles_key (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_user_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uid VARCHAR(64) NOT NULL,
  role_key VARCHAR(80) NOT NULL,
  granted_by VARCHAR(64) NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_dashboard_user_roles_user (user_uid),
  KEY idx_dashboard_user_roles_role (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_groups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_key VARCHAR(80) NOT NULL,
  label VARCHAR(120) NOT NULL,
  group_type VARCHAR(40) NOT NULL DEFAULT 'group_marker',
  grants_permissions_by_itself TINYINT(1) NOT NULL DEFAULT 0,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_groups_key (group_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_user_groups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uid VARCHAR(64) NOT NULL,
  group_key VARCHAR(80) NOT NULL,
  granted_by VARCHAR(64) NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_dashboard_user_groups_user (user_uid),
  KEY idx_dashboard_user_groups_group (group_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  permission_key VARCHAR(120) NOT NULL,
  label VARCHAR(160) NOT NULL,
  area VARCHAR(80) NOT NULL,
  protection_level VARCHAR(40) NOT NULL DEFAULT 'low',
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_permissions_key (permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_role_permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_key VARCHAR(80) NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  effect VARCHAR(20) NOT NULL DEFAULT 'allow',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_role_permissions (role_key, permission_key, effect)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_module_permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_type VARCHAR(30) NOT NULL,
  subject_key VARCHAR(120) NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_key VARCHAR(160) NOT NULL,
  effect VARCHAR(20) NOT NULL DEFAULT 'allow',
  created_by VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_module_permissions (subject_type, subject_key, permission_key, target_type, target_key, effect),
  KEY idx_dashboard_module_permissions_subject (subject_type, subject_key),
  KEY idx_dashboard_module_permissions_target (target_type, target_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_uid VARCHAR(96) NOT NULL,
  user_uid VARCHAR(64) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  last_seen_at DATETIME NULL,
  ip_hash VARCHAR(128) NULL,
  user_agent_hash VARCHAR(128) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_sessions_uid (session_uid),
  KEY idx_dashboard_sessions_user (user_uid),
  KEY idx_dashboard_sessions_status_expires (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_locks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lock_uid VARCHAR(96) NOT NULL,
  resource_key VARCHAR(200) NOT NULL,
  owner_user_uid VARCHAR(64) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  heartbeat_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_token VARCHAR(128) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_locks_uid (lock_uid),
  KEY idx_dashboard_locks_resource_status (resource_key, status),
  KEY idx_dashboard_locks_owner (owner_user_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dashboard_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  audit_uid VARCHAR(96) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_user_uid VARCHAR(64) NULL,
  actor_display_name VARCHAR(120) NULL,
  source VARCHAR(80) NOT NULL,
  action VARCHAR(120) NOT NULL,
  permission_key VARCHAR(120) NULL,
  resource_key VARCHAR(200) NULL,
  status VARCHAR(30) NOT NULL,
  old_value_summary TEXT NULL,
  new_value_summary TEXT NULL,
  request_id VARCHAR(120) NULL,
  correlation_id VARCHAR(120) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_audit_uid (audit_uid),
  KEY idx_dashboard_audit_created (created_at),
  KEY idx_dashboard_audit_actor (actor_user_uid),
  KEY idx_dashboard_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
