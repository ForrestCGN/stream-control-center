# Files

## 0.2.41 geaendert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.41 nur gelesen / Grundlage

```text
docs/current/RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE.md
docs/current/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS.md
tools/rdap_0.2.39_remote_media_index_schema.sql
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
backend/modules/local_remote_modboard_adapter.js
```

## 0.2.40 auf Webserver ausgefuehrt

```text
SQL-Datei aus frischem GitHub/dev Clone:
tools/rdap_0.2.39_remote_media_index_schema.sql

Clone:
 /opt/stream-control-center/_deploy_tmp/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_20260629_113811

Backup:
 /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
```

## Wichtige DB-Dateien fuer 0.2.42 spaeter

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
```

## Nicht fuer Online-Remote-Modboard-DB verwenden

```text
backend/core/database.js
backend/modules/sqlite_core.js
```

Diese gehoeren nicht automatisch in den Webserver-Live-Pfad `/opt/stream-control-center/remote-modboard`.

## Media-Tabelle

```text
remote_media_index
```

Stand 0.2.41: auf MariaDB angelegt, readback bestaetigt, row_count = 0, keine Media-Writes. 0.2.41 plant nur read-only Schema-Status/Dokumentation.
