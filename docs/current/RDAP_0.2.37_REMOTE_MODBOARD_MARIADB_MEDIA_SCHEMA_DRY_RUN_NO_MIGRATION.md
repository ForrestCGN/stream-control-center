# RDAP 0.2.37 - Remote-Modboard MariaDB Media Schema Dry Run No Migration

Stand: 2026-06-29

## Ziel

Dieser Step ist ein reiner Doku-/Dry-Run-Step fuer das spaetere Remote-Modboard-MariaDB-Media-Index-Schema.

Es wird kein Runtime-Code geaendert.
Es wird keine Datenbankmigration ausgefuehrt.
Es werden keine DB-Daten geschrieben.
Es werden keine Media-Daten geschrieben.

## Ausgangslage

```text
Aktueller getesteter Stand in GitHub/dev:
0.2.36 - Remote-Modboard MariaDB DB Usage Inventory No Code

0.2.34 war falsch angesetzt, weil Online-Media-Persistenz ueber backend/core/database.js / lokale SQLite-Repo-root-Schicht geplant wurde.
0.2.34B blockiert diesen falschen Ansatz.
0.2.35 dokumentiert die MariaDB-Media-Index-Richtung ohne Code.
0.2.36 inventarisiert die vorhandene Remote-Modboard-DB-Nutzung ohne Code.
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
docs/current/RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE.md
docs/current/RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_DB_USAGE_INVENTORY_NO_CODE.md
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Vorhandene Remote-Modboard-DB-Schicht

### db.service.js

Zulaessige DB-Hilfsschicht fuer spaetere Online-Media-Index-Arbeit:

```text
remote-modboard/backend/src/services/db.service.js
```

Vorhandene Funktionen:

```text
buildDatabaseReadiness(config)
createReadOnlyConnection(config)
createWriteConnection(config)
withReadOnlyConnection(config, fn)
withWriteConnection(config, fn)
publicDbError(err)
```

Sicherheitsstand:

```text
- mysql2/promise
- multipleStatements=false
- Read-only-Verbindungen setzen SET SESSION TRANSACTION READ ONLY
- createWriteConnection blockiert, wenn config.database.writeEnabled !== true
- migrationEnabled bleibt false
```

### config.service.js

DB-Konfiguration kommt aus ENV:

```text
DB_ENGINE
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Sicherheitsstand:

```text
- driver: mysql2/promise
- database.writeEnabled oeffentlich false
- database.migrationEnabled false
- buildPublicConfigSummary gibt writeEnabled=false und migrationEnabled=false aus
```

### Vorhandene Read-only-Muster

```text
auth-db-read.service.js:
- liest INFORMATION_SCHEMA.TABLES
- liest erwartete Dashboard-Tabellen read-only
- nutzt withReadOnlyConnection
- writeEnabled=false
- migrationEnabled=false

audit-read.service.js:
- liest dashboard_audit_log / INFORMATION_SCHEMA.COLUMNS nur bei db=1
- bewertet Schema-Kompatibilitaet read-only
- schreibt keine Audit-Eintraege
- auditWriteEnabled=false
- migrationEnabled=false
```

## Schema-Dry-Run fuer remote_media_index

Dieser Step dokumentiert nur das geplante Schema. Das SQL wird nicht ausgefuehrt.

```sql
CREATE TABLE remote_media_index (
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
);
```

## Sanitisiertes Inventar

Spaeter darf nur sanitisiertes Media-Inventar gespeichert werden:

```text
root_key
kind
relative_path
name
extension
size_bytes
modified_at
first_seen_at
last_seen_at
deleted
source
sync_version
updated_at
```

Nicht speichern:

```text
absolute Windows-/Linux-Pfade
Datei-Inhalte
Base64/Binary Content
Secrets
Shell-/Command-Daten
OBS-/Agent-Actions
lokale User-/Systempfade
```

## Read-only Vorpruefung fuer einen spaeteren Migration-Step

Ein spaeterer eigener Confirm-Step darf vor einer Migration nur lesend pruefen:

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

Diese Queries sind nur Diagnose/Vorpruefung und schreiben nichts.

## Backup-Vorgabe fuer spaetere Migration

Vor einer echten MariaDB-Migration muss in einem separaten Confirm-Step ein Backup erstellt und geprueft werden.

Beispiel nur als Vorgabe, nicht in diesem Step ausfuehren:

```bash
# Werte gezielt und sicher aus /etc/stream-control-center/remote-modboard.env lesen.
# Secrets nicht posten.
# Backup-Datei unter einem passenden sicheren Serverpfad ablegen.
mysqldump --single-transaction --routines --triggers --events \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  > /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_$(date +%Y%m%d_%H%M%S).sql
```

Pflicht danach:

```text
- Backup-Datei existiert.
- Backup-Datei ist nicht leer.
- Dateigroesse wird geprueft.
- Keine Secrets werden im Chat gepostet.
```

## Rollback-Vorgabe fuer spaetere Migration

Rollback darf erst in einem eigenen Confirm-Step formuliert/ausgefuehrt werden.

Minimaler Rollback-Plan fuer eine reine Tabellenanlage waere:

```sql
DROP TABLE IF EXISTS remote_media_index;
```

Das darf nur gelten, solange:

```text
- die Tabelle noch keine produktiven Media-Daten enthaelt
- der Step ausdruecklich als Rollback bestaetigt wurde
- vorher klar ist, dass keine anderen Services von der Tabelle abhaengen
```

Sobald Media-Daten geschrieben wurden, ist `DROP TABLE` kein Standard-Rollback mehr.

## Status-/Diagnose-Idee fuer spaeter

Ein spaeterer Runtime-Step kann eine read-only Diagnose vorbereiten, aber nicht in diesem Step:

```text
mediaIndexSchema:
- prepared: true
- tableName: remote_media_index
- inspected: true/false
- detected: true/false
- compatibleForRead: true/false
- compatibleForWrite: false
- migrationEnabled: false
- writeEnabled: false
- dataWritesEnabled: false
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
- Das geplante remote_media_index Schema ist als Dry-Run dokumentiert.
- Die zulaessige MariaDB-Schicht ist auf db.service.js/config.service.js begrenzt.
- Backup-/Rollback-Vorgaben sind dokumentiert.
- Read-only Vorpruefungen sind dokumentiert.
- Keine Migration wurde ausgefuehrt.
- Keine Runtime-Datei wurde geaendert.
- Keine DB-Writes wurden vorbereitet oder aktiviert.
```

## Check fuer diesen Step

Da 0.2.37 Doku-only ist:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION.md -Pattern "remote_media_index","db.service.js","mysql2/promise","Keine DB-Migration","Keine Runtime-Dateien","backend/core/database.js"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird.
