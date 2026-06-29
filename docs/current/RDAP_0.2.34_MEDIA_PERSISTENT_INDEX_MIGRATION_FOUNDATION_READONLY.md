# RDAP 0.2.34 - Media Persistent Index Migration Foundation Readonly

Stand: 2026-06-29

## Ziel

Kleine Foundation fuer einen spaeteren persistenten Media-Index auf dem Server.

Dieser Step erstellt/validiert nur das DB-Schema. Er aktiviert noch keine produktiven Media-Daten-Writes und keinen DB-Fallback in der UI/API.

## Geaendert

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
```

Ergaenzt:

```text
- STATUS_API_VERSION rdap_media_persistent_index_foundation_034.v1
- ensurePersistentIndexFoundation(context)
- Tabelle remote_media_index via backend/core/database.js + ensureSchema
- persistentIndex-Status in /api/remote/media/status
```

## Tabelle

```text
remote_media_index
```

Spalten:

```text
id TEXT PRIMARY KEY
root_key TEXT NOT NULL
kind TEXT NOT NULL
relative_path TEXT NOT NULL
name TEXT NOT NULL
extension TEXT NOT NULL
size_bytes INTEGER NOT NULL DEFAULT 0
modified_at TEXT
first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
deleted INTEGER NOT NULL DEFAULT 0
source TEXT NOT NULL DEFAULT 'agent_wss_media_inventory_sync'
sync_version INTEGER NOT NULL DEFAULT 1
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
```

Indexes:

```text
idx_remote_media_index_root_path UNIQUE(root_key, relative_path)
idx_remote_media_index_kind(kind)
idx_remote_media_index_deleted_last_seen(deleted, last_seen_at)
```

## Nicht geaendert

```text
Keine Media-Uploads.
Keine Media-Deletes.
Keine Media-Edits.
Keine Agent-Actions.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine neue Runtime-Datei.
Kein DB-Fallback-Lesen aktiviert.
Kein Agent-Sync-Write in den Index.
```

## API-Pruefung

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/status | jq '{ok,statusApiVersion,routeBuild,persistentIndex:{ok,tableName,schemaVersion,targetSchemaVersion,dataWritesEnabled,fallbackReadsEnabled,itemCount},syncInfo:{serverPersistence,serverPersistenceFoundation,persistentIndexWritesEnabled,persistentIndexFallbackEnabled}}'
```

Erwartung:

```text
persistentIndex.ok = true
persistentIndex.tableName = remote_media_index
persistentIndex.schemaVersion = 1
persistentIndex.dataWritesEnabled = false
persistentIndex.fallbackReadsEnabled = false
syncInfo.serverPersistence = false
```

## Sicherheit

Die Migration ist bewusst die einzige DB-Schreiboperation dieses Steps. Media-Daten werden nicht gespeichert. Lokal bleibt Master/Wahrheit.
