# RDAP 0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs

Stand: 2026-06-29

## Ziel

Dieser Step dokumentiert die erfolgreich ausgefuehrte Remote-Modboard-MariaDB-Schema-Migration fuer `remote_media_index`.

Die Migration selbst wurde bereits nach separatem ausdruecklichem `go migration` auf dem Webserver ausgefuehrt.

In diesem Doku-Step gilt:

```text
Es wird kein Runtime-Code geaendert.
Es wird keine weitere SQL-Datei erstellt.
Es wird keine weitere SQL-Ausfuehrung gemacht.
Es werden keine DB-Daten geschrieben.
Es werden keine Media-Daten geschrieben.
```

## Ausgangslage

```text
0.2.39:
- SQL-Datei wurde vorbereitet:
  tools/rdap_0.2.39_remote_media_index_schema.sql
- Keine Ausfuehrung in 0.2.39.

0.2.40 Server-Migration:
- Forrest gab explizit go migration.
- SQL wurde aus frischem GitHub/dev Clone ausgefuehrt.
- Backup wurde vorher erstellt und geprueft.
- Readback wurde danach geprueft.
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
```

## Migrationsergebnis

### Clone

```text
/opt/stream-control-center/_deploy_tmp/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_20260629_113811
```

### Ausgefuehrte SQL-Datei

```text
tools/rdap_0.2.39_remote_media_index_schema.sql
```

Die SQL-Datei enthielt:

```sql
CREATE TABLE IF NOT EXISTS remote_media_index (
  ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backup

Vor der Migration wurde ein Backup erstellt:

```text
/opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
```

Readback aus dem Serverlog:

```text
-rw-r--r-- 1 root root 44K 29. Jun 11:38 /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
```

Ergebnis:

```text
Backup existiert.
Backup ist nicht leer.
Backup-Groesse: 44K.
Secrets wurden nicht gepostet.
```

## Vorab-Check

Vor der Migration wurde geprueft, ob die Tabelle bereits existiert.

Ergebnis:

```text
Pre-check lieferte keine Tabellenzeile.
remote_media_index existierte vor der Migration offenbar noch nicht.
```

## Readback nach Migration

### Tabelle

```text
TABLE_NAME
remote_media_index
```

### Spalten

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

### Indizes

```text
PRIMARY(id)
idx_remote_media_index_root_path(root_key, relative_path)
idx_remote_media_index_kind(kind)
idx_remote_media_index_deleted_last_seen(deleted, last_seen_at)
```

### Row Count

```text
row_count
0
```

## Ergebnis

```text
remote_media_index existiert auf der Remote-Modboard-MariaDB.
Spalten sind vorhanden.
Indizes sind vorhanden.
row_count = 0.
Keine Media-Daten wurden geschrieben.
```

## Nicht passiert

```text
Keine Runtime-Dateien geaendert.
Kein Service-Restart.
Kein Webserver-Deploy.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine lokale SQLite-Schicht fuer Online verwendet.
Kein backend/core/database.js verwendet.
Kein backend/modules/sqlite_core.js verwendet.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
```

## Sicherheitsstatus nach 0.2.40

```text
Schema vorhanden: ja.
Daten vorhanden: nein.
row_count = 0.
Writes bleiben fachlich blockiert.
Naechste Schritte duerfen nur read-only planen, bis ein separater Confirm-Write-Step existiert.
```

## Naechster sinnvoller Step

```text
RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN
```

Ziel:

```text
- Read-only Status-/Diagnose-Sicht auf remote_media_index planen.
- Bestehende Remote-Modboard-DB-Schicht nutzen.
- Keine Media-Daten-Writes.
- Keine Agent-Writes.
- Kein Upload/Edit/Delete.
```

## Check fuer diesen Step

Da dieser Step Doku-/State-only ist:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS.md -Pattern "remote_media_index","row_count = 0","44K","keine Media-Daten-Writes","kein Webserver-Deploy"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird.
