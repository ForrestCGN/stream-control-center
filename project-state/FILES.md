# Files

## 0.2.43 geaendert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.43_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.43 Grundlage / gelesen

```text
docs/current/RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
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

Stand 0.2.43: Webserver-Deploy und Readback fuer `/api/remote/media/status?db=1` bestaetigt. `itemCount=0`, `compatibleForRead=true`, Writes bleiben blockiert.
