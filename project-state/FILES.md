# FILES

## Aktueller Arbeitsstand CAN-30.1

Wichtige geaenderte/zuletzt relevante Dateien:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN30_1.md
```

## CAN-30 ZIPs aus dem Chat

```text
CAN-30.1_document_sqlite_experimental_warning.zip
```

## CAN-30 relevante Runtime-Datei

```text
backend/modules/sqlite_core.js
```

CAN-30.1 selbst ändert keine Runtime-Datei.

## SQLite Warning Ursache

```text
const { DatabaseSync } = require("node:sqlite");
db = new DatabaseSync(dbPath);
```

## Produktive DB

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Entscheidung

```text
Warning bekannt und dokumentiert.
Aktuell keine Änderung an DB-Core.
Kein DB-Treiberwechsel ohne eigenen Plan mit Backup/Rollback.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
SQLite Core: D:\Streaming\stramAssets\backend\modules\sqlite_core.js
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```
