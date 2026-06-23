# RDAP6B Test-DB Dry-Run Runbook

Stand: 2026-06-23

## Ziel

RDAP6B beschreibt, wie das RDAP6A-Schema spaeter sicher gegen eine separate Testdatenbank geprueft werden kann.

Dieser Step ist nur Runbook/Dokumentation. Es wird keine produktive DB veraendert und keine Auth-/Session-/Write-Funktion aktiviert.

## Strikte Nicht-Aenderungen

Nicht erlaubt in RDAP6B:

- keine produktive MariaDB-Migration
- keine produktive SQLite-Aenderung
- keine Auth-Aktivierung
- keine Session-Aktivierung
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo, Frontend oder Chat

## Voraussetzung

Vor einer echten Testausfuehrung muessen vorhanden sein:

- Zugriff auf MariaDB mit einem separaten Test-DB-User oder Admin-User.
- Name einer separaten Testdatenbank, z. B. `scc_rdap6a_test`.
- Kein Produktiv-DB-Name.
- Keine produktiven Passwoerter in Shell-History.
- RDAP6A-Dateien lokal vorhanden:

```text
db/rdap6a/sql/001_rdap6a_schema_dry_run.sql
db/rdap6a/sql/002_rdap6a_seed_plan_dry_run.sql
db/rdap6a/checks/rdap6a_validation_queries.sql
```

## Sicherer Ablauf fuer Testdatenbank

### 1. Testdatenbank bewusst anlegen

Beispiel nur als Schema:

```sql
CREATE DATABASE scc_rdap6a_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Wichtig: Nicht die produktive DB verwenden.

### 2. Schema auf Testdatenbank anwenden

Beispiel nur als Schema:

```bash
mysql scc_rdap6a_test < db/rdap6a/sql/001_rdap6a_schema_dry_run.sql
```

### 3. Seeds auf Testdatenbank anwenden

Beispiel nur als Schema:

```bash
mysql scc_rdap6a_test < db/rdap6a/sql/002_rdap6a_seed_plan_dry_run.sql
```

### 4. Pruefqueries ausfuehren

Beispiel nur als Schema:

```bash
mysql scc_rdap6a_test < db/rdap6a/checks/rdap6a_validation_queries.sql
```

## Erwartete Pruefergebnisse

- `dashboard_roles` enthaelt `owner`, `admin`, `lead_mod`, `mod`, `media_manager`, `readonly`.
- `dashboard_roles` enthaelt **kein** `sound_profi`.
- `dashboard_groups` enthaelt `sound_profi` als `group_marker`.
- `dashboard_groups.grants_permissions_by_itself` fuer `sound_profi` ist `0`.
- `dashboard_role_permissions` enthaelt **keine** Rechte fuer `sound_profi`.
- `dashboard_module_permissions` ist fuer spaetere gezielte Zielrechte vorbereitet.

## Abbruchkriterien

Sofort stoppen, wenn:

- versehentlich produktiver DB-Name verwendet wurde.
- `sound_profi` als Rolle auftaucht.
- globale Rollenrechte fuer `sound_profi` auftauchen.
- SQL nicht idempotent laeuft.
- bestehende produktive Daten betroffen waeren.

## Nach erfolgreichem Test

Dokumentieren:

- Testdatenbankname
- Zeitpunkt
- ausgefuehrte SQL-Dateien
- Ergebnis der Validation Queries
- offene Anpassungen

Danach Testdatenbank entweder behalten fuer weitere Tests oder bewusst entfernen.

## Naechster Step

Nach erfolgreicher Testdatenbank-Pruefung kann separat geplant werden:

```text
RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE
```

Auch RDAP6C darf produktiv erst nach Backup, Restore-Plan und separatem Go ausgefuehrt werden.
