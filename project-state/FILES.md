# Files

## 0.2.42 geaendert

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
docs/current/RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.42 Grundlage

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
tools/rdap_0.2.39_remote_media_index_schema.sql
```

## Nicht fuer Online-Remote-Modboard-DB verwenden

```text
backend/core/database.js
backend/modules/sqlite_core.js
```

## Media-Tabelle

```text
remote_media_index
```

Stand 0.2.42: Schema-Status kann read-only ueber `/api/remote/media/status?db=1` diagnostiziert werden. Writes bleiben blockiert.
