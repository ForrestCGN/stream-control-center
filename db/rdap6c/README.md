# RDAP6C Auth DB Migration Script Package

Stand: 2026-06-23

Dieses Paket bereitet eine spätere Auth-/DB-Migration vor. Es ist kein Live-Migrationslauf.

## Inhalt

- `db/rdap6c/sql/001_rdap6c_schema_migration.sql`
- `db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql`
- `db/rdap6c/checks/rdap6c_validation_queries.sql`
- `db/rdap6c/runbooks/RDAP6C_BACKUP_RESTORE_RUNBOOK.md`
- `docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md`

## Sicherheitsregeln

- Nicht blind produktiv ausführen.
- Vor produktiver Ausführung: Backup, Restore-Plan, Testdatenbanklauf, separates `go`.
- Keine Auth-/Session-/Write-Aktivierung durch dieses Paket.
- `sound_profi` bleibt Gruppe/Marker und ist keine Rolle.
- Keine Secrets ins Repo, Frontend oder Chat.
