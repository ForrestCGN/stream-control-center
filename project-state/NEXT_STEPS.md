# Next Steps

Nach `0.2.42`:

## 1. Lokal pruefen

```text
RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY
```

Checks:

```powershell
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.42 Media Index Schema Status Readonly vorbereitet; read-only DB-Diagnose, keine Media-Writes"
```

## 2. Danach Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY dev
```

Pruefen:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status?db=1" | jq '.persistentIndex | {ok, inspected, detected, tableName, itemCount, compatibleForRead, compatibleForWrite, writeEnabled, dataWritesEnabled, migrationEnabled}'

curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.mediaReadonly.persistentIndexSchemaStatusReadonly'
```

## Nicht tun

```text
SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql nicht nochmal ausfuehren.
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js fuer Online verwenden.
Kein backend/modules/sqlite_core.js fuer Online verwenden.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```
