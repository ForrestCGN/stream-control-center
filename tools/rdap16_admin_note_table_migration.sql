-- RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
-- Projekt: stream-control-center / RDAP Remote-Modboard
-- Zweck: Tabelle fuer interne Admin-/Mod-Notizen zu Dashboard-Usern anlegen.
-- Wichtig: Diese Datei wird durch installstep/deploy NICHT automatisch ausgefuehrt.
-- Vor Ausfuehrung: Backup erstellen, Read-only Vorpruefung machen, DB-Kontext pruefen.

CREATE TABLE IF NOT EXISTS dashboard_user_admin_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  note_uid VARCHAR(96) NOT NULL,
  target_user_uid VARCHAR(64) NOT NULL,
  note_text TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_by_user_uid VARCHAR(64) NULL,
  updated_by_user_uid VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_user_admin_notes_uid (note_uid),
  KEY idx_dashboard_user_admin_notes_target_user (target_user_uid),
  KEY idx_dashboard_user_admin_notes_status (status),
  KEY idx_dashboard_user_admin_notes_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
