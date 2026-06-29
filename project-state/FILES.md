# Files

## 0.2.31 relevante Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## 0.2.31 bewusst nicht geaendert

```text
Keine Runtime-Dateien.
Keine Backend-Routen.
Keine UI-JS-Dateien.
Keine DB-Migrationen.
Keine Agent-Dateien.
Keine neuen Runtime-Dateien.
```

## 8080 lokal relevante Dateien

```text
backend/modules/local_remote_modboard_adapter.js
backend/modules/remote_agent.js
backend/core/database.js
backend/modules/sqlite_core.js
```

Hinweis:

```text
backend/modules/local_remote_modboard_adapter.js ist lokal 8080 relevant.
backend/modules/remote_agent.js ist lokaler Agent und Media-WSS-Sender.
backend/core/database.js ist zentrale DB-Schicht.
backend/modules/sqlite_core.js ist Low-Level-SQLite-Adapter.
Lokale Checks immer gegen http://127.0.0.1:8080.
```

## 3010 Server/RDAP relevante Dateien

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
```

Hinweis:

```text
remote-modboard/backend/... ist Server/RDAP 3010 relevant.
3010 nur fuer Webserver-/RDAP-Server-Checks nach GitHub/dev + Deploy.
```

## Doppelte Media-Logik

```text
local_remote_modboard_adapter.js:
- lokaler 8080 /api/remote/media/status
- scannt htdocs/assets/*

remote_agent.js:
- lokaler Agent /api/remote-agent/media/inventory/status
- scannt htdocs/assets/*
- sendet WSS Media Inventory

agent-runtime.service.js:
- Server 3010 Agent-WSS Empfang
- validiert/sanitized Media Inventory
- memory-only

media-readonly.routes.js:
- Server 3010 /api/remote/media/status
- formt Online-Status aus Agent-Memory
- enthaelt zusaetzlichen localRuntime-Pfad, aber lokale 8080-Wahrheit bleibt local_remote_modboard_adapter.js
```

## Fuer spaeteren Persistent-Index-Code-Step relevant

```text
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
backend/core/database.js
backend/modules/sqlite_core.js
remote-modboard/backend/src/**/*.js mit DB-/Storage-/Audit-Helpern
docs/current/RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE.md
docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md
```

## Neue-Dateien-Regel

```text
Neue Runtime-Dateien sind fuer den naechsten Code-Step verboten, ausser Forrest genehmigt sie ausdruecklich nach konkreter Begruendung.
Vorhandene Module/Services/Routes bevorzugen.
Keine Parallelstruktur bauen.
Eine neue Doku-Datei ist erlaubt.
Eine neue Runtime-Datei ist nicht erlaubt.
```

## Standard-Arbeitsweise

```text
Bei abgeschnittenem GitHub/dev zuerst Source-Sammel-Script und Source-ZIP nutzen.
Install-ZIP muss echte Repo-Zielpfade enthalten.
Check-Ausgaben kurz halten; volles JSON nur bei Diagnose.
```
