# Files

## 0.2.44 geaendert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.44 Grundlage

```text
docs/current/RDAP_0.2.43_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY_CONFIRMED_DOCS.md
docs/current/RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY.md
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
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

Stand 0.2.44: Schema ist vorhanden und read-only diagnostizierbar. Nutzung als echte read-only Quelle/Fallback ist nur geplant, nicht aktiviert. Writes bleiben blockiert.
