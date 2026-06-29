# RDAP 0.2.41 - Remote-Modboard Media Index Schema Readonly Status Plan

Stand: 2026-06-29

## Ziel

Dieser Step plant nur eine read-only Diagnose-/Status-Sicht auf das bereits vorhandene MariaDB-Schema `remote_media_index`.

Es wird kein Runtime-Code geaendert.  
Es wird keine SQL-Datei ausgefuehrt.  
Es wird keine Datenbankmigration ausgefuehrt.  
Es werden keine Media-Daten geschrieben.  
Es werden keine Agent-Writes aktiviert.

## Ausgangslage

```text
Aktueller GitHub/dev-Stand:
0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs

0.2.40 dokumentiert:
- Tabelle remote_media_index wurde auf der Remote-Modboard-MariaDB angelegt.
- Backup vor Migration existiert:
  /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
- Backup-Groesse: 44K
- Spalten vorhanden
- Indizes vorhanden
- row_count = 0
- keine Runtime-Code-Aenderung
- kein Service-Restart
- kein Webserver-Deploy
- keine Media-Daten-Writes
- kein Upload/Edit/Delete
```

## Harte Laufzeit-Trennung

```text
Lokal / Stream-PC:
- Port 8080
- lokale Schicht: backend/modules/local_remote_modboard_adapter.js
- lokale Datei-/Media-Wahrheit
- keine Tests gegen 3010 lokal
- keine lokale SQLite/Core-Schicht fuer Online

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

## Gelesene echte Dateien / Grundlage

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
tools/rdap_0.2.39_remote_media_index_schema.sql
docs/current/RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE.md
docs/current/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS.md
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
backend/modules/local_remote_modboard_adapter.js
```

## Geplanter naechster Runtime-Step nach diesem Plan

```text
RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY
```

Ziel fuer einen spaeteren Runtime-Step waere eine reine read-only Diagnose, zum Beispiel ueber eine neue oder bestehende Statusroute.

## Geplante Diagnose-Inhalte

Die Diagnose soll nur lesen:

```text
- ob Tabelle remote_media_index existiert
- erkannte Spalten aus INFORMATION_SCHEMA.COLUMNS
- erkannte Indizes aus INFORMATION_SCHEMA.STATISTICS
- row_count ueber SELECT COUNT(*)
- Schema-Kompatibilitaet fuer read-only Anzeige
```

Erwartete Felder fuer die Statusantwort:

```text
ok: true/false
service: remote-modboard
module: remote_media_index_schema_status
moduleVersion: 0.2.42
moduleBuild: 0.2.42 - Remote-Modboard Media Index Schema Status Readonly
readOnly: true
writeEnabled: false
databaseWriteEnabled: false
migrationEnabled: false
mediaDataWritesEnabled: false
agentWritesEnabled: false
uploadEnabled: false
editEnabled: false
deleteEnabled: false
compatibleForRead: true/false
compatibleForWrite: false
table.name: remote_media_index
table.exists: true/false
table.rowCount: number|null
columns.detected: []
columns.missingExpected: []
indexes.detected: []
```

## Erwartete Spalten

```text
id
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

## Erwartete Indizes

```text
PRIMARY(id)
idx_remote_media_index_root_path(root_key, relative_path)
idx_remote_media_index_kind(kind)
idx_remote_media_index_deleted_last_seen(deleted, last_seen_at)
```

## Geplante DB-Schicht

Der spaetere Runtime-Step darf nur diese Remote-Modboard-Schicht nutzen:

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db.service.js
mysql2/promise
MariaDB
withReadOnlyConnection(...)
INFORMATION_SCHEMA
SELECT COUNT(*)
```

Nicht verwenden:

```text
backend/core/database.js
backend/modules/sqlite_core.js
lokale Repo-root-SQLite-Schicht
lokale Stream-PC-Dateiwahrheit als Online-DB-Ersatz
```

## Read-only SQL-Idee fuer spaeter

Nur als Plan, nicht in diesem Step ausfuehren:

```sql
SELECT TABLE_NAME AS table_name
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index';

SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable, COLUMN_DEFAULT AS column_default
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY ORDINAL_POSITION ASC;

SELECT INDEX_NAME AS index_name, COLUMN_NAME AS column_name, NON_UNIQUE AS non_unique, SEQ_IN_INDEX AS seq_in_index
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'remote_media_index'
ORDER BY INDEX_NAME ASC, SEQ_IN_INDEX ASC;

SELECT COUNT(*) AS row_count
FROM remote_media_index;
```

## Sicherheitsgrenzen

```text
Keine Runtime-Code-Aenderung in 0.2.41.
Keine DB-Migration.
Keine SQL-Ausfuehrung.
Keine CREATE/ALTER/DROP/INSERT/UPDATE/DELETE-Ausfuehrung.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes.
Keine manuelle Kopie in /opt/stream-control-center/remote-modboard.
Kein git pull im Live-Pfad.
Kein Webserver-Deploy fuer 0.2.41.
```

## Risiken fuer spaeteren Runtime-Step

```text
- Wenn DB-Env fehlt, muss Status sauber db_env_not_configured melden.
- Wenn mysql2 fehlt, muss Status sauber mysql2_not_available melden.
- Wenn Tabelle fehlt, darf kein harter Crash entstehen.
- compatibleForWrite bleibt immer false, auch wenn Schema vollstaendig ist.
- Eine leere Tabelle row_count = 0 ist erwarteter Zustand und kein Fehler.
```

## Testplan fuer diesen Doku-Step

Da 0.2.41 Doku-/State-only ist:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN.md -Pattern "remote_media_index","INFORMATION_SCHEMA","compatibleForRead","compatibleForWrite: false","writeEnabled: false","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

Kein Node-Neustart noetig.  
Kein Webserver-Deploy noetig.

## Ergebnis dieses Steps

```text
- 0.2.41 plant die naechste read-only Media-Index-Schema-Diagnose.
- 0.2.40 wird als abgeschlossen in GitHub/dev behandelt.
- project-state/TODO.md wird bereinigt: 0.2.40 ist nicht mehr aktiv offen.
- Naechster technischer Schritt bleibt separat und braucht eigenes go.
```
