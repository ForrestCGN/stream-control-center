# CURRENT_STATUS

Stand: RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Bestaetigter Stand

```text
RDAP34 Entscheidung: Option B.
Bestehende dashboard_audit_log soll sanft erweitert werden.
RDAP35 SQL-/Doku-Vorbereitung erstellt.
```

## RDAP35 vorbereitet

SQL-Dateien:

```text
tools/rdap35_admin_audit_schema_precheck.sql
tools/rdap35_admin_audit_schema_migration.sql
tools/rdap35_admin_audit_schema_readback.sql
```

Geplante neue Spalten:

```text
actor_login
resource_type
error_code
safe_metadata_json
completed_at
```

Status:

```text
Noch keine DB-Migration ausgefuehrt.
Noch keine Audit-Testinserts.
Noch keine Admin-Notiz-Writes.
```

## Weiterhin blockiert

```text
Admin-Notiz produktiv schreiben/aendern/deaktivieren
admin.users.note.write Permission
UI-Schreibbuttons
Audit-Testinsert
Lock acquire/heartbeat/release/force-takeover
physisches Delete
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```
