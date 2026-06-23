# RDAP6A Auth DB Schema Dry-Run Package

Stand: 2026-06-23

Dieses Paket ist ein Dry-Run-/Planungspaket. Es fuehrt nichts automatisch aus und aktiviert keine produktiven Funktionen.

## Inhalt

- `db/rdap6a/sql/001_rdap6a_schema_dry_run.sql` - Tabellenentwurf fuer Auth, Sessions, Rollen, Gruppen, Permissions, Locks und Audit.
- `db/rdap6a/sql/002_rdap6a_seed_plan_dry_run.sql` - Seed-Plan fuer Rollen, Gruppen/Marker und Permissions.
- `db/rdap6a/checks/rdap6a_validation_queries.sql` - Pruefqueries nach einer spaeteren Testmigration.
- `docs/current/RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE.md` - Doku, Scope, Sicherheitsgrenzen und Testplan.

## Strikte Regeln

- Nicht gegen produktive DB ausfuehren.
- Erst Testdatenbank verwenden.
- Erst Backup/Restore-Konzept bestaetigen.
- Keine Auth, Sessions, Writes oder Agent-Actions aktivieren.
- `sound_profi` bleibt Gruppe/Marker und ist keine Rolle.
