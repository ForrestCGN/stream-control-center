-- RDAP 0.2.39 - Remote-Modboard MariaDB Media Schema Migration File No Execute
--
-- Zweck:
--   Bereitet die MariaDB-Schema-Datei fuer remote_media_index vor.
--
-- WICHTIG:
--   Diese Datei NICHT automatisch ausfuehren.
--   Keine Migration in RDAP 0.2.39.
--   Ausfuehrung erst in eigenem Server-Migration-Confirm-Step nach Backup,
--   Env-Pruefung, Vorab-Read-only-Checks und expliziter Forrest-Freigabe.
--
-- Sicherheitsgrenzen:
--   - keine Media-Daten-Writes
--   - keine INSERT/UPDATE/DELETE
--   - keine Upload/Edit/Delete-Funktion
--   - keine Agent-Writes
--   - keine lokale SQLite-Schicht fuer Online verwenden
--   - nicht backend/core/database.js
--   - nicht backend/modules/sqlite_core.js

CREATE TABLE IF NOT EXISTS remote_media_index (
  id VARCHAR(260) PRIMARY KEY,
  root_key VARCHAR(40) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  relative_path VARCHAR(500) NOT NULL,
  name VARCHAR(180) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  modified_at DATETIME NULL,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  source VARCHAR(80) NOT NULL DEFAULT 'agent_wss_media_inventory_sync',
  sync_version INT NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_remote_media_index_root_path (root_key, relative_path),
  KEY idx_remote_media_index_kind (kind),
  KEY idx_remote_media_index_deleted_last_seen (deleted, last_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
