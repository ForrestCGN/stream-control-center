# RDAP 0.2.39 - Remote-Modboard MariaDB Media Schema Migration File No Execute

Stand: 2026-06-29

## Ziel

Dieser Step erstellt nur die konkrete SQL-Datei fuer die spaetere Remote-Modboard-MariaDB-Media-Schema-Migration.

Es wird kein Runtime-Code geaendert.  
Es wird keine Datenbankmigration ausgefuehrt.  
Es werden keine DB-Daten geschrieben.  
Es werden keine Media-Daten geschrieben.

## Ausgangslage

```text
Aktueller getesteter Stand in GitHub/dev:
0.2.38 - Remote-Modboard MariaDB Media Schema Confirmation Plan No Code

0.2.38 dokumentiert:
- geplanter SQL-Dateipfad: tools/rdap_0.2.39_remote_media_index_schema.sql
- geplantes CREATE TABLE IF NOT EXISTS remote_media_index nur als Plan
- konkrete Backup-Pflicht mit mysqldump
- konkrete Readback-Checks ueber INFORMATION_SCHEMA und row_count
- konkrete Rollback-Grenzen fuer leere Tabelle
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
docs/current/RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE.md
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
```

## Erstellte SQL-Datei

```text
tools/rdap_0.2.39_remote_media_index_schema.sql
```

Diese Datei enthaelt das geplante Schema fuer:

```text
remote_media_index
```

Wichtig:

```text
- Die SQL-Datei wird in 0.2.39 nur im Repo vorbereitet.
- Sie wird nicht ausgefuehrt.
- Es gibt keine DB-Migration.
- Es gibt keine Media-Daten-Writes.
- SQL-Dateien im Repo-Root werden auf dem Webserver spaeter aus dem frischen GitHub-/Deploy-Clone unter _deploy_tmp/<STEP>/tools/... verwendet.
- Nicht unter /opt/stream-control-center/remote-modboard/tools/... suchen, solange die Datei nicht unter remote-modboard/tools/ liegt.
```

## SQL-Inhalt

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

## Sicherheitsstatus

```text
Keine Runtime-Dateien geaendert.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine CREATE TABLE-Ausfuehrung auf Server/DB.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Kein Webserver-Deploy fuer diesen Step.
```

## Naechster technischer Step nach 0.2.39

Erst nach lokalem Abschluss von 0.2.39 und erneutem explizitem Forrest-Confirm:

```text
RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED
```

Ziel fuer 0.2.40 waere dann erstmals serverkritisch:

```text
- Server-Env sicher pruefen.
- Backup mit mysqldump erstellen und nicht leer pruefen.
- Vorab-Read-only-Checks ausfuehren.
- SQL-Datei aus frischem _deploy_tmp Clone ausfuehren.
- Readback pruefen.
- row_count=0 erwarten.
- Weiterhin keine Media-Daten schreiben.
```

## Nicht tun

```text
Keine Runtime-Dateien aendern.
Keine DB-Migration ausfuehren.
Keine SQL-Datei automatisch ausfuehren.
Keine CREATE TABLE-Ausfuehrung in diesem Step.
Keine ALTER TABLE-Ausfuehrung.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten schreiben.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine lokale SQLite-Schicht fuer Online verwenden.
Kein backend/core/database.js fuer Remote-Modboard-Online verwenden.
Kein backend/modules/sqlite_core.js fuer Remote-Modboard-Online verwenden.
Keine manuellen Server-Kopien.
Kein Webserver-Deploy fuer diesen Repo-Root-SQL/Doku-Step.
```

## Ergebnis dieses Steps

```text
- Die SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql wurde erstellt.
- Die Datei enthaelt CREATE TABLE IF NOT EXISTS remote_media_index.
- Die Datei wurde nicht ausgefuehrt.
- Keine Migration wurde ausgefuehrt.
- Keine Runtime-Datei wurde geaendert.
- Keine DB-Writes wurden vorbereitet oder aktiviert.
```

## Check fuer diesen Step

```powershell
Test-Path .	oolsdap_0.2.39_remote_media_index_schema.sql

Select-String -Path .	oolsdap_0.2.39_remote_media_index_schema.sql -Pattern "CREATE TABLE IF NOT EXISTS remote_media_index","NICHT automatisch ausfuehren","Keine Migration"

Select-String -Path .\docs\current\RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE.md -Pattern "remote_media_index","tools/rdap_0.2.39_remote_media_index_schema.sql","Keine SQL-Ausfuehrung","Keine DB-Migration","Keine Runtime-Dateien"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird und die SQL-Datei nicht ausgefuehrt wird.
