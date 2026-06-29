# Next Steps

Nach `0.2.46`:

## 1. Lokal pruefen

```powershell
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.46 Media Status Compact Source Info vorbereitet; sourceInfo read-only, keine DB-Item-Reads, keine Writes"
```

## 2. Danach Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.46_REMOTE_MODBOARD_MEDIA_STATUS_COMPACT_SOURCE_INFO dev
```

## 3. Server-Readback

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status" | jq '.sourceInfo'

curl -fsS "http://127.0.0.1:3010/api/remote/media/status?db=1" | jq '.sourceInfo'

curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.mediaReadonly.sourceInfo'
```

## Nicht tun

```text
SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql nicht nochmal ausfuehren.
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js fuer Online verwenden.
Kein backend/modules/sqlite_core.js fuer Online verwenden.
Keine DB-Item-Reads aus remote_media_index.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```
