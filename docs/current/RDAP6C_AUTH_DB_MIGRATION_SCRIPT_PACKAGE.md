# RDAP6C Auth DB Migration Script Package

Stand: 2026-06-23

## Ziel

RDAP6C bereitet SQL-Migrationsdateien, Seed-Dateien, Validation Queries und ein Backup-/Restore-Runbook vor.

Dieser Step fuehrt keine produktive Migration aus.

## Dateien

```text
db/rdap6c/README.md
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
db/rdap6c/runbooks/RDAP6C_BACKUP_RESTORE_RUNBOOK.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
```

## Nicht-Aenderungen

- keine produktive MariaDB-Ausfuehrung
- keine produktive SQLite-Aenderung
- keine Auth-Aktivierung
- keine Session-Aktivierung
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo/Frontend/Chat

## Kernregel

`sound_profi` bleibt Gruppe/Marker, keine Rolle.

## Naechster Schritt

RDAP6D sollte erst ein Testdatenbanklauf sein. Produktivlauf nur nach Backup, Restore-Test, Validation und separatem Go.
