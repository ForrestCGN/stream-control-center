# RDAP Status und naechste Schritte

Stand: 2026-06-23

## Kurzfassung

Der aktuelle RDAP-Stand ist bewusst in zwei Bereiche getrennt:

1. Remote-Modboard / Remote-Agent Read-only und Rollen-/Gruppenmodell.
2. Auth-/DB-Vorbereitung als Dry-Run-/Migrations-/Test-DB-Doku, ohne produktive Ausfuehrung.

Wichtig: Es wurde keine produktive DB-Migration ausgefuehrt, keine Auth aktiviert, keine Sessions aktiviert und keine Remote-Writes/Agent-Actions aktiviert.

## Fertig und getestet

### RDAP5J Remote Node Monitoring / Hardening

Status: abgeschlossen und live getestet.

Bestaetigt:

- Remote-Node read-only erreichbar.
- Health/Status/Routes erreichbar.
- DB-Connectivity bei `db=1` getestet.
- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- `agent.enabled: false`
- `agent.actionsEnabled: false`

Relevante Doku:

```text
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
```

### RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur

Status: abgeschlossen und live getestet.

Bestaetigt:

- `remote_agent` auf `moduleVersion: 0.0.3`
- `moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY`
- `statusApiVersion: rdap5c3.v1`
- `soundProfiIsRole: false`
- `soundProfiIsGroupMarker: true`
- `rolesAreSeparateFromGroups: true`
- `modulePermissionMatrixUsesTargetTypeAndTargetKey: true`
- `sound_profi` nicht mehr in `roles`
- `sound_profi` nicht mehr in `rolePermissionPresets`
- `sound_profi` in `groups`/`groupMarkers`
- `specialRoles` leer
- `specialGroups.sound_profi` vorhanden

Relevante Dateien:

```text
backend/modules/remote_agent.js
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
```

## Vorbereitet, aber nicht produktiv ausgefuehrt

### RDAP6 Auth / DB Prep

Status: Doku/Planung abgeschlossen.

Relevante Datei:

```text
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
```

Enthaelt:

- Backup-/Migrationskonzept.
- Tabellenentwurf.
- Rollen/Gruppen-Trennung.
- `sound_profi` als Gruppe/Marker.
- Sicherheitsregeln fuer spaetere Auth/Sessions.

### RDAP6A Auth DB Schema Dry-Run Package

Status: erstellt und lokal/Repo bereinigt.

Relevante Dateien:

```text
db/rdap6a/README.md
db/rdap6a/sql/001_rdap6a_schema_dry_run.sql
db/rdap6a/sql/002_rdap6a_seed_plan_dry_run.sql
db/rdap6a/checks/rdap6a_validation_queries.sql
docs/current/RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE.md
```

Zweck:

- Nur Dry-Run-/Planungsschema.
- Keine produktive Ausfuehrung.

### RDAP6B Test-DB Dry-Run Runbook

Status: erstellt.

Relevante Datei:

```text
docs/current/RDAP6B_TEST_DB_DRY_RUN_RUNBOOK.md
```

Zweck:

- Beschreibt, wie das RDAP6A-Schema spaeter sicher gegen eine separate Testdatenbank geprueft werden kann.
- Keine produktive Ausfuehrung.

### RDAP6C Auth DB Migration Script Package

Status: erstellt und lokal/Repo bereinigt.

Relevante Dateien:

```text
db/rdap6c/README.md
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
db/rdap6c/runbooks/RDAP6C_BACKUP_RESTORE_RUNBOOK.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
```

Zweck:

- Script-/Migrationspaket fuer spaeteren Einsatz.
- Produktiv erst nach Backup, Restore-Test, Validation und separatem Go.

### RDAP6D Test-DB Execution Guide Package

Status: erstellt und lokal/Repo bereinigt.

Relevante Dateien:

```text
db/rdap6d/README.md
db/rdap6d/runbooks/RDAP6D_TEST_DB_EXECUTION_RUNBOOK.md
db/rdap6d/checks/RDAP6D_EXPECTED_RESULTS.md
db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
```

Zweck:

- Anleitung und Ergebnisvorlage fuer einen echten Testdatenbanklauf.
- Keine produktive Ausfuehrung.

## Aktuelle Sicherheitsgrenzen

Bis auf weiteres gilt:

- Keine produktive MariaDB-Migration.
- Keine produktive SQLite-Aenderung.
- Keine Auth-Aktivierung.
- Keine Session-Aktivierung.
- Keine Remote-Writes.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung ueber Remote-Agent.
- Keine Secrets ins Repo, Frontend oder Chat.
- Kein `git add .` bei unklaren Dateien.
- Vor jedem neuen Paket zuerst Git-Status pruefen.

## Sound-Profi-Regel

`sound_profi` ist dauerhaft als Gruppe/Marker zu behandeln, nicht als Rolle.

Erlaubtes Prinzip spaeter:

```text
subject_type = group
subject_key = sound_profi
permission_key = <konkretes Recht>
target_type = <konkreter Zieltyp>
target_key = <konkretes Ziel>
effect = allow/deny
```

Nicht erlaubt:

- `sound_profi` als Rolle.
- `sound_profi` in Rollen-Presets.
- globale Owner-/Security-Rechte fuer `sound_profi`.

## Was als naechstes sinnvoll ist

Vor weiteren technischen Schritten erst klaeren:

1. Soll ein echter Testdatenbanklauf vorbereitet und ausgefuehrt werden?
2. Auf welchem System soll die Testdatenbank laufen?
3. Wie heisst die Testdatenbank eindeutig?
4. Wie wird sichergestellt, dass nicht die Produktivdatenbank verwendet wird?
5. Wer fuehrt den Test aus und dokumentiert das Ergebnis in `db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md`?

Der naechste moegliche Step waere:

```text
RDAP6E_TEST_DB_RESULT_EVALUATION
```

Aber RDAP6E braucht echte Testdatenbank-Ergebnisse oder eine ausgefuellte Ergebnisvorlage. Ohne echte Ausgabe keine Auswertung.

## Aktueller Arbeitsstand fuer naechsten Chat

- RDAP5J: live getestet und dokumentiert.
- RDAP5C3: remote_agent Rollen/Gruppen live getestet und dokumentiert.
- RDAP6A-D: vorbereitet und eingecheckt.
- Git-Stand wurde lokal laut Forrest bereinigt und `git status --short` war leer.
- Keine produktive DB/Auth/Session/Write-Aenderung wurde ausgefuehrt.
