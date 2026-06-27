# RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: SQL-/Doku-Vorbereitung fuer sanfte DB-Migration  
Status: Migration live erfolgreich bestaetigt durch RDAP35B

---

## 1. Zweck

RDAP35 bereitete die sanfte Erweiterung der bestehenden Tabelle `dashboard_audit_log` vor.

Grundlage war RDAP34:

```text
Option B gewaehlt:
bestehende dashboard_audit_log sanft erweitern.
Keine neue Parallelstruktur.
Direkt richtig statt dauerhaftem Mapping-Workaround.
```

---

## 2. Geplante und migrierte Zusatzspalten

```text
actor_login VARCHAR(128) NULL
resource_type VARCHAR(128) NULL
error_code VARCHAR(128) NULL
safe_metadata_json LONGTEXT NULL
completed_at DATETIME NULL
```

Ziel:

```text
Audit langfristig sauber filterbar machen.
resource_type und resource_key klar trennen.
Fehlerstatus und sichere Metadata ermoeglichen.
Vorhandene Audit-Tabelle weiterverwenden.
Keine Parallelstruktur bauen.
```

---

## 3. Enthaltene SQL-Dateien

```text
tools/rdap35_admin_audit_schema_precheck.sql
tools/rdap35_admin_audit_schema_migration.sql
tools/rdap35_admin_audit_schema_readback.sql
```

---

## 4. Live-Bestaetigung

RDAP35 wurde live auf dem Webserver ausgefuehrt und durch RDAP35B dokumentiert.

Backup:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap35_before_audit_schema_20260625_094607.sql
```

RDAP33-Route nach Migration:

```text
audit.table.schemaReady: true
audit.compatibleForWriteCandidate: true
audit.missingWriteCandidateColumns: []
audit.rowCount: 0
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
audit.auditInsertEnabled: false
```

Details:

```text
docs/current/RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS.md
```

---

## 5. Noch nicht aktiv

```text
keine Admin-Notiz-Writes
keine Audit-Testinserts
keine Lock-Writes
keine Permission admin.users.note.write
keine UI-Schreibbuttons
```

---

## 6. Naechster Schritt

```text
RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED
```
