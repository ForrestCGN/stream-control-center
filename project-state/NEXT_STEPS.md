# Next Steps

Nach `0.2.34`:

## 1. Direkt testen

```text
RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY
```

Pruefen:

```text
- START_HERE verweist auf 0.2.34.
- Neue Step-Doku ist vorhanden:
  docs/current/RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY.md
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- JS-Syntax fuer media-readonly.routes.js ist sauber.
- Keine neue Runtime-Datei wurde erstellt.
- Keine Upload/Edit/Delete/Agent-Actions aktiviert.
```

## 2. API-Check

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/status | jq '{ok,statusApiVersion,routeBuild,persistentIndex:{ok,tableName,schemaVersion,targetSchemaVersion,dataWritesEnabled,fallbackReadsEnabled,itemCount},syncInfo:{serverPersistence,serverPersistenceFoundation,persistentIndexWritesEnabled,persistentIndexFallbackEnabled}}'
```

Erwartung:

```text
persistentIndex.ok=true
schemaVersion=1
serverPersistence=false
dataWritesEnabled=false
fallbackReadsEnabled=false
```

## 3. Danach nur nach eigenem Go

```text
RDAP_0.2.35_MEDIA_PERSISTENT_INDEX_WRITE_READONLY_SNAPSHOT
```

Nur wenn vorher bestaetigt:

```text
- Agent-Media-Snapshot darf sanitized Metadaten in remote_media_index schreiben.
- Kein Dateiinhalt.
- Keine absoluten Pfade.
- Memory bleibt zuerst.
- DB-Fallback/Stale-Read nur separat aktivieren oder klar begrenzen.
```

## 4. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Keine Upload-/Delete-Buttons aktivieren.
Keine bidirektionale Datei-Synchronisation ohne Sicherheitsmodell.
Keine Agent-Apply-Queue ohne Permission, Confirm, Audit, Backup und Conflict-Handling.
Keine neue Runtime-Datei als Standardloesung.
```
