# Files

## 0.2.38 geaendert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.38 nur gelesen / Grundlage

```text
docs/current/RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION.md
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Wichtige DB-Dateien fuer spaeter

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

## Geplante Media-Tabelle fuer spaeter

```text
remote_media_index
```

Stand 0.2.38: nur dokumentiert, nicht migriert, keine Writes.

## Geplante SQL-Datei fuer spaeter

```text
tools/rdap_0.2.39_remote_media_index_schema.sql
```

Stand 0.2.38: nur geplant, noch nicht erstellt, nicht ausgefuehrt.
