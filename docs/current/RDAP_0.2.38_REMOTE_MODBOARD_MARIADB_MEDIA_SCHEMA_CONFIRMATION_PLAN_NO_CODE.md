# RDAP 0.2.38 - Remote-Modboard MariaDB Media Schema Confirmation Plan No Code

Stand: 2026-06-29

## Ziel

Dieser Step ist ein reiner Doku-/Confirm-Plan-Step fuer die spaetere Remote-Modboard-MariaDB-Media-Schema-Migration.

Es wird kein Runtime-Code geaendert.
Es wird keine Datenbankmigration ausgefuehrt.
Es werden keine DB-Daten geschrieben.
Es werden keine Media-Daten geschrieben.

## Ausgangslage

```text
Aktueller getesteter Stand in GitHub/dev:
0.2.37 - Remote-Modboard MariaDB Media Schema Dry Run No Migration

0.2.37 dokumentiert:
- geplantes Tabellenmodell remote_media_index
- erlaubte Online-DB-Schicht db.service.js/config.service.js/mysql2/promise
- read-only Vorpruefungen ueber INFORMATION_SCHEMA
- Backup-/Rollback-Vorgaben fuer spaeter

0.2.38 konkretisiert nur den naechsten Confirm-/Migrationsplan.
```

## Harte Laufzeit-Trennung

```text
Lokal / Stream-PC:
- Port 8080
- lokale Schicht: backend/modules/local_remote_modboard_adapter.js
- lokale Datei-/Media-Wahrheit
- keine Tests gegen 3010 lokal
- keine Annahme, dass lokale SQLite/Core-Schicht fuer Online gilt

Webserver / Remote-Modboard:
- Port 3010
- Live-Pfad: /opt/stream-control-center/remote-modboard
- Live-Pfad ist kein Git-Repo
- Online-DB ueber remote-modboard/backend/src/services/db.service.js
- Online-DB-Konfig ueber remote-modboard/backend/src/services/config.service.js
- MariaDB/mysql2/promise
- nicht backend/core/database.js
- nicht backend/modules/sqlite_core.js
```

## Gelesene echte Dateien aus GitHub/dev

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION.md
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Erlaubte Remote-Modboard-DB-Schicht

Fuer den spaeteren Migration-Step gilt weiterhin nur diese Richtung:

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
mysql2/promise
MariaDB
```

Bekannter Sicherheitsstand:

```text
- db.service.js nutzt mysql2/promise.
- multipleStatements=false.
- Read-only-Verbindungen setzen SET SESSION TRANSACTION READ ONLY.
- createWriteConnection blockiert, wenn config.database.writeEnabled !== true.
- config.service.js gibt migrationEnabled=false aus.
- buildPublicConfigSummary gibt writeEnabled=false und migrationEnabled=false aus.
```

Nicht verwenden:

```text
backend/core/database.js
backend/modules/sqlite_core.js
Repo-root-SQLite fuer Online-Remote-Modboard
manuelle Kopien in /opt/stream-control-center/remote-modboard
```

## Geplante SQL-Datei fuer spaeter

Ein spaeterer eigener Migration-Step soll eine konkrete SQL-Datei im Repo-Root unter `tools/` bekommen.

Geplanter Pfad:

```text
tools/rdap_0.2.39_remote_media_index_schema.sql
```

Wichtig:

```text
- Diese Datei wird in 0.2.38 noch nicht erstellt.
- Diese Datei wird in 0.2.38 nicht ausgefuehrt.
- SQL-Dateien im Repo-Root werden auf dem Webserver aus dem frischen GitHub-/Deploy-Clone unter _deploy_tmp/<STEP>/tools/... verwendet.
- Nicht unter /opt/stream-control-center/remote-modboard/tools/... suchen, solange die Datei nicht unter remote-modboard/tools/ liegt.
```

## Geplantes Migration-SQL fuer spaeter

Nur Plan, nicht ausfuehren:

```sql
CREATE TABLE IF NOT EXISTS remote_media_index (
  id VARCHAR(260) PRIMARY KEY,
  root_key VARCHAR(40) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  relative_path VARCHAR(500) NOT NULL,
  name VARCHAR(180) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  modified_at DATETIME NULL,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  source VARCHAR(80) NOT NULL DEFAULT 'agent_wss_media_inventory_sync',
  sync_version INT NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_remote_media_index_root_path (root_key, relative_path),
  KEY idx_remote_media_index_kind (kind),
  KEY idx_remote_media_index_deleted_last_seen (deleted, last_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Vorab-Read-Only-Checks fuer spaeteren Migration-Step

Vor einer echten Migration muessen nur lesende Checks laufen.

### DB-Env vorhanden, ohne Secrets zu posten

```bash
test -f /etc/stream-control-center/remote-modboard.env && echo "env_file_ok"
```

DB-Werte duerfen nur gezielt und maskiert geprueft werden. `DB_PASSWORD` niemals im Chat posten.

### Tabelle vorhanden?

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index';
```

### Spalten lesen

```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY ORDINAL_POSITION ASC;
```

### Indizes lesen

```sql
SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY INDEX_NAME ASC, SEQ_IN_INDEX ASC;
```

## Backup-Pflicht fuer spaeteren Migration-Step

Vor echter Migration muss ein Backup erstellt und geprueft werden.

Beispiel fuer den spaeteren Server-Step, nicht in 0.2.38 ausfuehren:

```bash
backup_dir="/opt/stream-control-center/_runtime_tmp"
stamp="$(date +%Y%m%d_%H%M%S)"
backup_file="$backup_dir/remote_modboard_before_remote_media_index_${stamp}.sql"

# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD gezielt aus
# /etc/stream-control-center/remote-modboard.env lesen.
# Secrets niemals ausgeben.

mysqldump --single-transaction --routines --triggers --events \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  > "$backup_file"

test -s "$backup_file" && ls -lh "$backup_file"
```

Pflicht danach:

```text
- Backup-Datei existiert.
- Backup-Datei ist nicht leer.
- Dateigroesse wurde geprueft.
- Secrets wurden nicht gepostet.
- Kein SQL wurde vor erfolgreichem Backup ausgefuehrt.
```

## Readback nach spaeterer Migration

Nach einem echten Migration-Step muessen mindestens diese Checks laufen:

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index';
```

```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY ORDINAL_POSITION ASC;
```

```sql
SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY INDEX_NAME ASC, SEQ_IN_INDEX ASC;
```

```sql
SELECT COUNT(*) AS row_count
FROM remote_media_index;
```

Erwartung direkt nach reiner Schema-Migration:

```text
remote_media_index existiert.
Spalten entsprechen dem geplanten Schema.
Indizes existieren.
row_count = 0.
Keine Media-Daten wurden geschrieben.
```

## Rollback-Grenzen

Rollback ist nur in eigenem Confirm-Step erlaubt.

Minimaler Rollback fuer eine reine, leere Tabellenanlage waere:

```sql
DROP TABLE IF EXISTS remote_media_index;
```

Das gilt nur, solange:

```text
- remote_media_index leer ist.
- keine produktiven Media-Daten geschrieben wurden.
- kein Runtime-Code von der Tabelle abhaengt.
- Forrest den Rollback-Step ausdruecklich bestaetigt hat.
- vorher klar dokumentiert ist, welches Backup existiert.
```

Sobald produktive Media-Daten geschrieben wurden, ist `DROP TABLE` kein Standard-Rollback mehr.

## Naechster technischer Step nach 0.2.38

Erst nach lokalem Abschluss von 0.2.38:

```text
RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE
```

Ziel fuer 0.2.39:

```text
- SQL-Datei unter tools/ erstellen.
- Keine SQL-Ausfuehrung.
- Keine Runtime-Dateien.
- Keine DB-Writes.
- Server-Ausfuehrung erst in eigenem danach folgenden Confirm-Step.
```

## Nicht tun

```text
Keine Runtime-Dateien aendern.
Keine DB-Migration ausfuehren.
Keine CREATE TABLE-Ausfuehrung.
Keine ALTER TABLE-Ausfuehrung.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten schreiben.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine lokale SQLite-Schicht fuer Online verwenden.
Kein backend/core/database.js fuer Remote-Modboard-Online verwenden.
Kein backend/modules/sqlite_core.js fuer Remote-Modboard-Online verwenden.
Keine manuellen Server-Kopien.
Kein Webserver-Deploy fuer diesen Doku-only-Step.
```

## Ergebnis dieses Steps

```text
- Der Confirm-/Migrationsplan fuer remote_media_index ist konkretisiert.
- Der spaetere SQL-Dateipfad ist geplant.
- Backup-Pflicht ist konkret dokumentiert.
- Readback-Checks sind konkret dokumentiert.
- Rollback-Grenzen sind konkret dokumentiert.
- Keine Migration wurde ausgefuehrt.
- Keine Runtime-Datei wurde geaendert.
- Keine DB-Writes wurden vorbereitet oder aktiviert.
```

## Check fuer diesen Step

Da 0.2.38 Doku-only ist:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE.md -Pattern "remote_media_index","tools/rdap_0.2.39_remote_media_index_schema.sql","mysqldump","INFORMATION_SCHEMA","DROP TABLE IF EXISTS","Keine DB-Migration","Keine Runtime-Dateien"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird.
