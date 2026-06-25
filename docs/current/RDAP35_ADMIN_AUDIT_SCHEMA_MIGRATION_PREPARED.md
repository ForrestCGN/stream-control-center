# RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: SQL-/Doku-Vorbereitung fuer sanfte DB-Migration  
Status: **keine Migration ausgefuehrt, keine Writes aktiviert**

---

## 1. Zweck

RDAP35 bereitet die sanfte Erweiterung der bestehenden Tabelle `dashboard_audit_log` vor.

Grundlage ist RDAP34:

```text
Option B gewaehlt:
bestehende dashboard_audit_log sanft erweitern.
Keine neue Parallelstruktur.
Direkt richtig statt dauerhaftem Mapping-Workaround.
```

RDAP35 liefert nur SQL- und Doku-Dateien. Die SQL-Dateien werden nicht automatisch ausgefuehrt.

---

## 2. Geplante Zusatzspalten

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

### Precheck

```text
tools/rdap35_admin_audit_schema_precheck.sql
```

Macht nur SELECTs:

```text
DATABASE()
INFORMATION_SCHEMA.TABLES
INFORMATION_SCHEMA.COLUMNS
Fehlende/ vorhandene Zielspalten
COUNT(*) aus dashboard_audit_log
```

### Migration

```text
tools/rdap35_admin_audit_schema_migration.sql
```

Fuehrt aus:

```sql
ALTER TABLE dashboard_audit_log
  ADD COLUMN IF NOT EXISTS actor_login VARCHAR(128) NULL AFTER actor_display_name,
  ADD COLUMN IF NOT EXISTS resource_type VARCHAR(128) NULL AFTER action,
  ADD COLUMN IF NOT EXISTS error_code VARCHAR(128) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS safe_metadata_json LONGTEXT NULL AFTER new_value_summary,
  ADD COLUMN IF NOT EXISTS completed_at DATETIME NULL AFTER created_at;
```

### Readback

```text
tools/rdap35_admin_audit_schema_readback.sql
```

Macht nur SELECTs und prueft:

```text
alle Spalten
Zielspalten vorhanden
COUNT(*) aus dashboard_audit_log
```

---

## 4. Wichtig: Ausfuehrung nur vom Deploy-Clone

Repo-Root-Dateien wie `tools/*.sql` werden nicht nach `/opt/stream-control-center/remote-modboard/` deployed.

Richtig:

```text
/opt/stream-control-center/_deploy_tmp/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED/tools/rdap35_admin_audit_schema_migration.sql
```

Falsch:

```text
/opt/stream-control-center/remote-modboard/tools/rdap35_admin_audit_schema_migration.sql
```

---

## 5. Sicherheitsregeln fuer die spaetere Ausfuehrung

Vor Migration Pflicht:

```text
DB-Env pruefen, ohne Secrets zu posten.
MariaDB-Client-Config verwenden, nicht blind source auf EnvironmentFile.
Backup von dashboard_audit_log per mysqldump.
Backup-Datei existiert und ist nicht 0 Byte.
Precheck ausfuehren.
```

Migration darf nur:

```text
fehlende Spalten ergaenzen
keine Spalten loeschen
keine Spalten umbenennen
keine Daten veraendern
keine Tabelle droppen
keine Parallelstruktur anlegen
```

Nach Migration Pflicht:

```text
Readback ausfuehren.
RDAP33 Route erneut pruefen:
GET /api/remote/admin/audit-lock/schema-status?limit=5
rowCount muss unveraendert bleiben.
writesStillBlocked muss true bleiben.
auditInsertEnabled muss false bleiben.
```

---

## 6. Noch nicht aktiv

```text
keine Admin-Notiz-Writes
keine Audit-Testinserts
keine Lock-Writes
keine Permission admin.users.note.write
keine UI-Schreibbuttons
keine DB-Migration durch diesen ZIP-Step
```

---

## 7. Naechster Schritt nach lokalem Stepdone

Da RDAP35 SQL-/Doku-Dateien im Repo-Root liefert:

```text
kein normaler Webserver-Service-Deploy fuer den laufenden Dienst noetig
aber fuer die SQL-Ausfuehrung muss ein frischer GitHub/dev-Clone nach _deploy_tmp erstellt werden
```

Danach folgt ein separater DB-Migrationslauf mit Backup, Precheck, Migration, Readback und RDAP33-Routentest.

Empfohlener Folge-Stand nach erfolgreicher DB-Ausfuehrung:

```text
RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS
```
