# RDAP 0.2.58K - Media Index exclude TTS generated from Sync

## Zweck

0.2.58K setzt die fachliche Entscheidung um, dass TTS-generated Dateien temporaer sind und nicht dauerhaft synchronisiert werden sollen.

Betroffen ist der lokale Agent-Media-Scan. Dateien unter:

```text
sounds/tts/generated/**
```

werden ab diesem Stand nicht mehr in Compact-Media-Inventory und nicht mehr in Full-Sync-Chunks aufgenommen.

## Statusmarker

```text
rdap_agent_media_inventory_exclude_tts_generated_058k.v1
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
```

## Geaenderte Dateien

- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Lokaler Agent

`scanLocalMediaInventory()` schliesst TTS-generated temp files aus, bevor Items in die Sync-Liste kommen.

Damit gilt:

- nicht im Compact-Snapshot
- nicht in Full-Sync-Chunks
- nicht in `counts.totalSeen`
- separate Diagnose ueber `counts.excludedFromSync` und `counts.ttsGeneratedExcludedFromSync`
- keine Datei-Inhalte
- keine absoluten Pfade
- keine Dateiaktion

## Remote Diff Route

`GET /api/remote/media/index/diff/status` bleibt read-only.

Alte DB-Eintraege unter `sounds:tts/generated/...` werden weiterhin diagnostisch erkannt, aber als aus dem Sync ausgeschlossene Legacy-/Temp-Kandidaten markiert.

Neue Diagnosefelder:

```text
missingClassification.ttsGeneratedExcludedFromSyncLegacyCount
previews.ttsTempMissingCandidates[].ttsGeneratedExcludedFromSyncLegacy
previews.ttsTempMissingCandidates[].excludedFromSyncLegacy
comparePolicy.ttsGeneratedExcludedFromAgentSync
```

Kompatible Felder aus 0.2.58J bleiben sichtbar:

```text
missingClassification.ttsGeneratedTempCandidateCount
previews.ttsTempMissingCandidates
counts.ttsTempMissingCandidateCount
```

## Sicherheit

Weiterhin verboten:

- keine DB-Writes
- kein Upsert
- kein Timestamp-Schreiben
- kein Tombstone/`deleted=1`
- kein physisches Loeschen
- keine Upload/Edit/Delete-Funktion
- keine Online->Agent-Dateiaktionen
- kein Agent-Trigger aus Webserver-Diagnose
- keine Datei-Inhalte
- keine absoluten lokalen Pfade

## Lokale Tests

```powershell
cd D:\Git\stream-control-center

node --check .\backend\modules\remote_agent.js
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js

git status
```

## Lokaler Agent Status

Nach lokalem Test-Deploy / Node-Neustart:

```powershell
curl.exe -fsS http://127.0.0.1:8080/api/remote-agent/media/inventory/status | ConvertFrom-Json | Select-Object -ExpandProperty inventory | Select-Object -ExpandProperty exclusionPolicy
```

Erwartung:

```text
exclusionPolicy.active = true
exclusionPolicy.excludesFromCompactInventory = true
exclusionPolicy.excludesFromFullSync = true
exclusionPolicy.rules[0].rootKey = sounds
exclusionPolicy.rules[0].relativePathPrefix = tts/generated/
```

## Webserver-Deploy

Da `remote-modboard/` Code geaendert wurde, ist nach `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC dev
```

## Webserver-Test

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .fullSyncCompare.missingClassification, .fullSyncCompare.previews.ttsTempMissingCandidates'
```

Erwartung:

```text
statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = true
writeEnabled = false
```

Wenn der lokale Agent nach 0.2.58K einen neuen Full-Sync gesendet hat, sollen TTS-generated Dateien nicht mehr in den Agent-Items enthalten sein. Alte DB-Eintraege koennen weiterhin als Legacy-/Temp-Diagnose erscheinen.
