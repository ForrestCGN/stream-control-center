# RDAP 0.2.31 Media 8080/3010 File Module Inventory No Code

Stand: 2026-06-29  
Step: `RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE`

## Zweck

Dieser Step ist eine Projektbremse mit echter Datei-/Modulkarte fuer Media, Agent, Runtime-Profile und DB-Helfer.

```text
Keine Runtime-Aenderung.
Keine Backend-Routen-Aenderung.
Keine UI-JS-Aenderung.
Keine DB-Migration.
Keine neue Runtime-Datei.
Keine Media-Persistenz gebaut.
Kein Webserver-Deploy noetig.
```

## Gelesene Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md

backend/modules/local_remote_modboard_adapter.js
backend/modules/remote_agent.js
backend/core/database.js
backend/modules/sqlite_core.js

remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
```

## Harte Trennung

```text
8080 = lokal
3010 = Server
```

Keine lokalen Checks gegen 3010.  
3010 nur fuer Webserver-/RDAP-Server-Checks nach GitHub/dev + Deploy.

## Lokale 8080-Verantwortung

### `backend/modules/local_remote_modboard_adapter.js`

Verantwortung:

```text
- lokale Remote-Modboard-Kompatibilitaet fuer /dashboard-v2
- mountet /api/remote/* im lokalen 8080-Profil
- liefert lokale Runtime-/Auth-/Permission-/Lock-Audit-Platzhalter read-only
- liefert lokale Media-Statusroute /api/remote/media/status
- liest lokale Media-Dateien aus htdocs/assets/* read-only
- blockiert Writes und produktive Actions
```

Media-relevante Logik:

```text
MEDIA_ROOTS:
- htdocs/assets/sounds
- htdocs/assets/videos
- htdocs/assets/images

Limit:
- default 500
- hard 2000
- maxDepth 5

Rueckgabe:
- id = rootKey:relativePath
- rootKey
- kind
- name
- relativePath
- publicPath
- extension
- sizeBytes
- modifiedAt
- readOnly=true
```

Wichtig:

```text
Diese Datei ist fuer lokale 8080-Checks relevant.
Sie darf nicht ignoriert werden, wenn /api/remote/media/status betroffen ist.
```

### `backend/modules/remote_agent.js`

Verantwortung:

```text
- lokaler Streaming-PC-Agent
- bietet /api/remote-agent/* lokal an
- verbindet sich optional per WSS zum Webserver
- sendet Heartbeat, OBS Live-State, OBS Inventory und Media Inventory
- scannt lokale Media-Roots read-only
- kompaktiert Media-WSS-Transport
- akzeptiert keine produktiven Actions
```

Media-relevante Logik:

```text
MEDIA_ROOTS:
- htdocs/assets/sounds
- htdocs/assets/videos
- htdocs/assets/images

Transport:
- protocol rdap-agent-media-inventory.v1
- default 500
- hard 2000
- WSS transport limits 120, 80, 40, 20
- max payload ca. 60000 Bytes
```

Wichtig:

```text
Diese Datei ist lokaler Scanner und Transport-Sender.
Sie ist nicht der Server-Cache.
Sie darf keine Agent-Apply-Actions bekommen.
```

### `backend/core/database.js`

Verantwortung:

```text
- zentrale DB-Schicht
- Adapter aktuell SQLite
- MariaDB/MySQL vorbereitet, aber nicht implementiert
- Ziel: Dashboard-/API-/Service-Code soll nicht direkt an sqlite_core haengen
```

Nutzbare Helper:

```text
init
ensureReady
status
getDbPath
exec
run
get
all
transaction
ensureSchema
getSchemaVersion
setSchemaVersion
buildInsertSql
buildUpsertSql
insert
insertIgnore
updateByKey
upsertByKey
upsert
tableExists
tableInfo
tableColumns
columnExists
ensureColumn
jsonEncode
jsonDecode
```

Wichtig:

```text
Falls spaeter DB genutzt wird: diese Schicht bevorzugen.
Keine zweite DB-Schicht bauen.
Keine Migration ohne separaten bestaetigten Step.
```

### `backend/modules/sqlite_core.js`

Verantwortung:

```text
- konkrete SQLite-Implementierung
- DB-Datei app.sqlite unter data/sqlite
- WAL aktiv
- foreign_keys ON
- schema_versions-Tabelle
- ensureSchema mit Transaktion
```

Wichtig:

```text
Diese Datei ist Low-Level-Adapter.
Fachmodule sollten bevorzugt backend/core/database.js nutzen.
```

## Server-/RDAP-3010-Verantwortung

### `remote-modboard/backend/server.js`

Verantwortung:

```text
- startet Remote-Modboard Backend
- laedt config
- erstellt Express-App
- registriert Agent-Runtime am HTTP-Server
- aktueller Runtime-Code steht bei APP_VERSION 0.2.28 / RDAP_0.2.28...
```

Wichtig:

```text
Diese Datei ist Server-Entry.
Nicht fuer lokale 8080-Checks verwenden.
```

### `remote-modboard/backend/src/app.js`

Verantwortung:

```text
- erstellt Express-App
- registriert Health/Status/Auth/Admin/Agent/Routes/OBS/Media-Routen
- mountet Public UI
- setzt readonly Header
```

Media-relevant:

```text
registerMediaReadonlyRoutes(app, context)
```

Wichtig:

```text
Keine neue UI bauen.
Keine zweite lokale UI bauen.
```

### `remote-modboard/backend/src/services/agent-runtime.service.js`

Verantwortung:

```text
- Server-Agent-WSS-Runtime
- Handshake-Pruefung
- Heartbeat-/Live-State-/OBS-Inventory-/Media-Inventory-Empfang
- Sanitization
- Memory-State
- Reject-Diagnose ohne Secrets
```

Media-relevante Logik:

```text
FORBIDDEN_MEDIA_INVENTORY_SYNC_FIELDS blockiert:
- paths
- absolutePath
- absolutePaths
- fileContent
- content
- buffer
- base64
- secrets/tokens/env/shell/stdout/stderr/fileList/processList

CONNECTION_STATE:
- mediaInventorySyncInMemoryOnly=true
- mediaInventorySyncPersistsToDatabase=false
- mediaInventorySyncExecutesActions=false
- mediaInventorySyncAcceptsCommands=false
```

Wichtig:

```text
Diese Datei ist aktuell Server-Memory-Wahrheit fuer Agent-Media-Inventar.
Persistenz ist hier noch nicht aktiv.
```

### `remote-modboard/backend/src/routes/media-readonly.routes.js`

Verantwortung:

```text
- Server-/RDAP-Route /api/remote/media/status
- runtimeMode entscheidet local/online
- online liest aus agent-runtime.service Memory-State
- gibt syncInfo aus
- Upload/Edit/Delete bleiben disabled
```

Aktueller Online-Status:

```text
syncInfo.serverPersistence=false
syncInfo.memoryOnly=true
inventory.source=agent_wss_media_inventory_sync_memory_only
inventory.persistsToDatabase=false
```

Wichtig:

```text
Diese Datei ist 3010-Route.
Der localRuntime-Pfad in dieser Datei ist nicht die lokale 8080-Wahrheit.
Die lokale 8080-Wahrheit fuer /api/remote/media/status liegt im local_remote_modboard_adapter.js.
```

## Doppelte Media-Logik

Aktuell gibt es bewusst/historisch doppelte Scanner-/Sanitizer-Logik:

```text
1. backend/modules/local_remote_modboard_adapter.js
   - lokaler 8080 /api/remote/media/status
   - scannt htdocs/assets/*

2. backend/modules/remote_agent.js
   - lokaler Agent /api/remote-agent/media/inventory/status
   - scannt htdocs/assets/*
   - sendet WSS Media Inventory

3. remote-modboard/backend/src/services/agent-runtime.service.js
   - Server empfängt und sanitized WSS Media Inventory
   - memory-only

4. remote-modboard/backend/src/routes/media-readonly.routes.js
   - Server /api/remote/media/status
   - formt Online-Antwort aus Agent-Memory
   - enthaelt zusaetzlich localRuntime-Scanpfad, der fuer 8080 nicht die Hauptwahrheit ist
```

Risiko:

```text
Aenderungen an Roots, Extensions, Limits, Pfad-Sanitization oder Item-Schema koennen auseinanderlaufen.
```

Regel:

```text
Vor jedem Code-Step muss entschieden werden, welche bestehende Datei Owner der jeweiligen Verantwortung bleibt.
Keine neue Runtime-Datei als Standardloesung.
```

## Erlaubte Richtung fuer spaeteren Persistent Index

Nur nach separatem Plan/Go:

```text
- Keine neue Runtime-Datei als Default.
- Zuerst bestehende Dateien nutzen:
  - agent-runtime.service.js fuer Empfang/Sanitization/Memory
  - media-readonly.routes.js fuer API-Ausgabe
  - backend/core/database.js fuer DB-Helfer, falls erreichbar und passend
- Keine direkte sqlite_core-Nutzung in Fachlogik, ausser sauber begruendet.
- Keine lokale 8080-Schicht brechen.
```

## Neue-Dateien-Regel

```text
Neue Runtime-Dateien bleiben verboten, ausser Forrest genehmigt sie ausdruecklich.
Eine neue Doku-Datei ist erlaubt.
Eine neue Runtime-Datei ist nicht erlaubt.
```

## Was NICHT geaendert wurde

```text
Keine Runtime-Dateien.
Keine backend/modules/*.js.
Keine remote-modboard/backend/src/*.js.
Keine remote-modboard/backend/server.js.
Keine UI-Dateien.
Keine DB-Migration.
Keine Agent-Actions.
Keine Upload/Edit/Delete-Aktivierung.
Keine Datei-Inhalte.
Keine absoluten Pfade.
```

## Tests fuer diesen Step

Da dieser Step Doku-only ist:

```powershell
git status
git diff --name-only
```

Erwartet sind nur Doku-/Projekt-State-Dateien.

Kein Node-Neustart erforderlich.  
Kein Webserver-Deploy erforderlich.
