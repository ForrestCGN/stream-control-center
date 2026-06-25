-- RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
-- Projekt: stream-control-center / Remote-Modboard / RDAP
-- Zweck: Genau eine kontrollierte Test-Admin-Notiz fuer ForrestCGN anlegen,
--        damit die bestehende read-only Admin-Notiz-UI echten Inhalt anzeigen kann.
--
-- WICHTIG:
-- - Diese Datei wird durch installstep/deploy NICHT automatisch ausgefuehrt.
-- - Vor Ausfuehrung muss ein DB-Backup erstellt werden.
-- - Vor Ausfuehrung muss der DB-/Tabellen-Kontext read-only geprueft werden.
-- - Dieser Seed aktiviert KEINE UI-Schreibfunktion.
-- - Dieser Seed vergibt NICHT die Permission admin.users.note.write.
-- - Dieser Seed aendert KEINE Rollen, Sessions, Locks, Audit-Tabellen oder Agent-Actions.
--
-- Zieluser:
--   tw:127709954 / ForrestCGN
--
-- Idempotenz:
--   note_uid ist eindeutig. Wiederholte Ausfuehrung aktualisiert nur diese Test-Notiz.

INSERT INTO dashboard_user_admin_notes (
  note_uid,
  target_user_uid,
  note_text,
  status,
  created_by_user_uid,
  updated_by_user_uid
) VALUES (
  'rdap29_test_note_forrestcgn_readonly_validation',
  'tw:127709954',
  'RDAP29 Test-Notiz: Diese Notiz wurde kontrolliert per SQL-Seed angelegt, damit die read-only Admin-Notiz-Anzeige echten Inhalt laden kann. Schreiben ueber die UI bleibt weiterhin gesperrt.',
  'active',
  'system:rdap29_seed',
  'system:rdap29_seed'
)
ON DUPLICATE KEY UPDATE
  note_text = VALUES(note_text),
  status = VALUES(status),
  updated_by_user_uid = VALUES(updated_by_user_uid),
  updated_at = CURRENT_TIMESTAMP;
