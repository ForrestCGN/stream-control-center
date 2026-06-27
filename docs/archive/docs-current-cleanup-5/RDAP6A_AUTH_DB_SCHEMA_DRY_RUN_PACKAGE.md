# RDAP6A Auth DB Schema Dry-Run Package

Stand: 2026-06-23

## Ziel

RDAP6A liefert ein Dry-Run-Paket fuer Auth-/Session-/Rollen-/Gruppen-/Modulrechte, Locks und Audit.

Es wird nichts produktiv ausgefuehrt.

## Enthaltene Dateien

```text
db/rdap6a/README.md
db/rdap6a/sql/001_rdap6a_schema_dry_run.sql
db/rdap6a/sql/002_rdap6a_seed_plan_dry_run.sql
db/rdap6a/checks/rdap6a_validation_queries.sql
docs/current/RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE.md
```

## Nicht-Aenderungen

- keine produktive MariaDB-Aenderung
- keine produktive SQLite-Aenderung
- keine Auth-Aktivierung
- keine Session-Aktivierung
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo/Frontend/Chat

## Schema-Kerne

- `schema_migrations`
- `dashboard_users`
- `dashboard_identities`
- `dashboard_roles`
- `dashboard_user_roles`
- `dashboard_groups`
- `dashboard_user_groups`
- `dashboard_permissions`
- `dashboard_role_permissions`
- `dashboard_module_permissions`
- `dashboard_sessions`
- `dashboard_locks`
- `dashboard_audit_log`

## Sound-Profi-Regel

`sound_profi` ist Gruppe/Marker, keine Rolle.

Rechte duerfen spaeter nur gezielt ueber `dashboard_module_permissions` mit `subject_type`, `subject_key`, `target_type` und `target_key` vergeben werden.

## Pruefung nach Testmigration

`db/rdap6a/checks/rdap6a_validation_queries.sql` prueft unter anderem:

- `sound_profi` ist keine Rolle.
- `sound_profi` ist Gruppe/Marker.
- keine globalen Rollenrechte fuer `sound_profi`.

## Naechster Schritt

Erst auf Testdatenbank pruefen. Produktive Migration nur mit separatem Go, Backup und Restore-Plan.
