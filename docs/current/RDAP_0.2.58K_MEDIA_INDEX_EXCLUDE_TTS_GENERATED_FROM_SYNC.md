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

Code-Step 0.2.58K:

- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

Finaler Doku-Abschluss nach Webserver-Bestaetigung:

- `docs/current/RDAP_0.2.58K_FINAL_STATUS_AFTER_WEBSERVER_CONFIRMATION.md`
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

## Lokaler Agent-Test

Forrest hat den lokalen Agent-Status nach 0.2.58K bestaetigt:

```text
prepared = True
build = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = True
active = True
excludesFromCompactInventory = True
excludesFromFullSync = True
databaseWritesEnabled = False
deleteEnabled = False
noFileContent = True
noAbsolutePaths = True
excludedFromSync = 0
ttsGeneratedExcludedFromSync = 0
```

Einordnung:

- `excludedFromSync = 0` ist korrekt, wenn lokal zum Testzeitpunkt keine Dateien unter `sounds/tts/generated/` vorhanden waren.
- Entscheidend ist, dass die Policy aktiv ist und fuer Compact-Snapshot und Full-Sync greift.

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

## Bestaetigter Webserver-Test

Forrest hat 0.2.58K auf dem Webserver bestaetigt:

```text
statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = true
writeEnabled = false
fullSyncCompare.missingClassification.prepared = true
fullSyncCompare.missingClassification.readOnly = true
fullSyncCompare.missingClassification.missingOnAgentItems = 1
fullSyncCompare.missingClassification.ttsGeneratedTempCandidateCount = 1
fullSyncCompare.missingClassification.ttsGeneratedExcludedFromSyncLegacyCount = 1
fullSyncCompare.missingClassification.persistentMediaMissingCandidateCount = 0
fullSyncCompare.missingClassification.tombstoneCandidateDiagnosticCount = 1
fullSyncCompare.missingClassification.tombstoneWritesEnabled = false
fullSyncCompare.missingClassification.deleteEnabled = false
fullSyncCompare.missingClassification.databaseWritesEnabled = false
fullSyncCompare.missingClassification.noOnlineToAgentAction = true
```

Bestaetigter Legacy-Diagnose-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
missingClassification = tts_generated_excluded_from_sync_legacy_candidate
ttsGeneratedExcludedFromSyncLegacy = true
excludedFromSyncLegacy = true
temporaryFileCandidate = true
tombstoneCandidateDiagnostic = true
tombstoneWriteAllowed = false
deleteAllowed = false
```

## Ergebnis

0.2.58K ist lokal getestet, auf GitHub/dev uebernommen, auf dem Webserver deployed und per Route bestaetigt.

TTS-generated Dateien unter `sounds/tts/generated/**` sind ab diesem Stand kein Bestandteil des persistenten Media-Sync mehr.

Der bestehende alte DB-Eintrag bleibt sichtbar, aber nur als Legacy-/Temp-Diagnose. Es wurde nichts geloescht und nichts in der DB geaendert.

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

## Naechster Schritt

```text
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY
```

Ziel:

- Alte TTS-generated DB-Eintraege read-only als Cleanup-Kandidaten planen.
- Keine direkte Bereinigung.
- Kein DB-Write.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
