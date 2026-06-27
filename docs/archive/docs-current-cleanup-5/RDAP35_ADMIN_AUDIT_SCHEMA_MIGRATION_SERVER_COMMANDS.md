# RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_SERVER_COMMANDS

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

Diese Datei dokumentiert die spaetere Server-Ausfuehrung der RDAP35-Migration.

Wichtig: Nicht automatisch ausfuehren. Erst nach lokalem Stepdone und separatem Go.

---

## 1. Deploy-Clone im bestaetigten Forrest-Stil

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
cd RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
```

Kein normaler `remote-modboard-deploy.sh` noetig, wenn nur SQL/Doku im Repo-Root genutzt wird.

---

## 2. SQL-Dateien pruefen

```bash
ls -la tools/rdap35_admin_audit_schema_*.sql
```

---

## 3. Backup-Verzeichnis

```bash
sudo mkdir -p /opt/stream-control-center/_runtime_tmp/rdap_db_backups
```

---

## 4. Backup erstellen

Beispiel mit bereits vorhandener MariaDB-Client-Datei:

```bash
sudo mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_audit_log > /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap35_before_audit_schema_$(date +%Y%m%d_%H%M%S).sql
```

---

## 5. Backup pruefen

```bash
sudo ls -lah /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap35_before_audit_schema_*.sql
```

Eine Backup-Datei muss existieren und groesser als 0 Byte sein.

---

## 6. Precheck ausfuehren

```bash
sudo mysql --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control < tools/rdap35_admin_audit_schema_precheck.sql
```

---

## 7. Migration ausfuehren

Nur wenn Backup und Precheck korrekt sind:

```bash
sudo mysql --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control < tools/rdap35_admin_audit_schema_migration.sql
```

---

## 8. Readback ausfuehren

```bash
sudo mysql --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control < tools/rdap35_admin_audit_schema_readback.sql
```

---

## 9. RDAP33 Route erneut pruefen

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?limit=5" | jq '.audit.table.schemaReady, .audit.compatibleForWriteCandidate, .audit.missingWriteCandidateColumns, .writeEnabled, .databaseWriteEnabled, .productiveWritesEnabled, .writesStillBlocked, .audit.auditInsertEnabled'
```

Erwartung nach erfolgreicher Migration:

```text
true
true
[]
false
false
false
true
false
```

---

## 10. Kein Service-Restart erforderlich

Die Migration betrifft nur DB-Schema. RDAP33 liest das Schema dynamisch aus INFORMATION_SCHEMA.

Nur wenn spaeter Backend-Code geaendert wird, ist ein Service-Deploy/Restart noetig.
