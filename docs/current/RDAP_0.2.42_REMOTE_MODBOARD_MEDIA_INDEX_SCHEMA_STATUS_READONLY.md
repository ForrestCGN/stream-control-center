# RDAP 0.2.42 - Remote-Modboard Media Index Schema Status Readonly

Stand: 2026-06-29

## Ziel

Dieser Step erweitert die bestehende Remote-Modboard-Media-Statusroute um eine optionale read-only Schema-Diagnose fuer `remote_media_index`.

Route:

```text
GET /api/remote/media/status?db=1
```

Ohne `db=1` bleibt die Route leichtgewichtig und nutzt weiter den bisherigen read-only Status.

## Geaendert

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
```

## Technische Umsetzung

Die Route bleibt Owner der Media-Readonly-Diagnose.

Neu bei `?db=1`:

```text
- INFORMATION_SCHEMA.TABLES liest, ob remote_media_index existiert.
- INFORMATION_SCHEMA.COLUMNS liest Spalten.
- INFORMATION_SCHEMA.STATISTICS liest Indizes.
- SELECT COUNT(*) AS row_count FROM remote_media_index liest die Zeilenanzahl.
```

Dafuer wird ausschliesslich die vorhandene Online-DB-Schicht verwendet:

```text
remote-modboard/backend/src/services/db.service.js
withReadOnlyConnection()
mysql2/promise
MariaDB
```

Nicht verwendet:

```text
backend/core/database.js
backend/modules/sqlite_core.js
lokale SQLite-Schicht
```

## Rueckgabe

`persistentIndex` enthaelt bei `?db=1` u. a.:

```text
inspected
detected
tableName
columns
indexes
missingColumns
missingIndexes
itemCount
compatibleForRead
compatibleForWrite=false
writeEnabled=false
dataWritesEnabled=false
migrationEnabled=false
```

## Erwartung nach 0.2.40

Da 0.2.40 die Tabelle bereits angelegt hat, wird serverseitig erwartet:

```text
remote_media_index existiert
Spalten vorhanden
Indizes vorhanden
itemCount = 0
compatibleForRead = true
compatibleForWrite = false
writeEnabled = false
dataWritesEnabled = false
migrationEnabled = false
```

## Sicherheitsgrenzen

```text
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine UI-Writes.
Keine lokalen 3010-Tests.
Keine manuelle Server-Kopie.
Kein git pull im Live-Pfad.
```

## Lokale Checks

```powershell
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

## Webserver-Deploy

Dieser Step enthaelt Runtime-Code. Nach lokalem Abschluss und GitHub/dev-Push ist Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY dev
```

Danach pruefen:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status?db=1" | jq '.persistentIndex | {ok, inspected, detected, tableName, itemCount, compatibleForRead, compatibleForWrite, writeEnabled, dataWritesEnabled, migrationEnabled}'

curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.mediaReadonly.persistentIndexSchemaStatusReadonly'
```

## Nicht passiert

```text
Keine SQL-Datei wurde ausgefuehrt.
Keine Tabelle wurde erstellt oder geaendert.
Keine Media-Daten wurden geschrieben.
Keine Agent-Daten wurden geschrieben.
Keine Upload/Edit/Delete-Funktion wurde aktiviert.
```

## Naechster sinnvoller Step

Nach erfolgreichem Server-Deploy und Readback kann ein Dokuabschluss fuer 0.2.42 erfolgen oder spaeter ein separater Plan fuer echte read-only Nutzung des Media-Index als Fallback/Quelle. Writes bleiben bis zu einem eigenen Confirm-Write-Step blockiert.
