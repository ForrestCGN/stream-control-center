# Files

## 0.2.34 geaendert

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/src/routes/media-readonly.routes.js
```

## 0.2.34 Runtime-Grenze

```text
Geaendert: bestehende Server-Route media-readonly.routes.js
Neu: nur Doku-Datei
Nicht neu: keine Runtime-Datei
```

## DB-Foundation

```text
Tabelle: remote_media_index
Schema-Modul: remote_media_index
Schema-Version: 1
DB-Schicht: backend/core/database.js
Migration: ensureSchema aus bestehender DB-Schicht
```

## Bewusst nicht geaendert

```text
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/public/assets/*
htdocs/dashboard-v2/assets/*
```

## Sicherheitsgrenzen

```text
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine Media-Daten-Writes in diesem Step.
Keine Upload/Edit/Delete/Agent-Actions.
```
