# CURRENT_STATUS

Aktueller Stand: `0.2.58K - Media Index exclude TTS generated from Sync vorbereitet`

## Ergebnis

0.2.58J wurde von Forrest auf dem Webserver bestaetigt und nach GitHub/dev uebernommen.

Bestaetigter 0.2.58J-Webserver-Befund:

```text
statusApiVersion = rdap_media_index_diff_tts_temp_missing_classification_058j.v1
routeBuild = RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION
readOnly = true
writeEnabled = false
fullSyncCompare.readOnly = true
fullSyncCompare.missingOnAgentReliable = true
ttsGeneratedTempCandidateCount = 1
persistentMediaMissingCandidateCount = 0
tombstoneWritesEnabled = false
deleteEnabled = false
databaseWritesEnabled = false
```

Bestaetigter TTS-temp Missing-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

Fachliche Entscheidung:

```text
TTS-generated Dateien sind temporaer und sollen nicht synchronisiert werden.
```

## 0.2.58K

0.2.58K bereitet den Ausschluss von TTS-generated Dateien aus dem Agent-Media-Sync vor.

Statusmarker:

```text
rdap_agent_media_inventory_exclude_tts_generated_058k.v1
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
```

## Umsetzung

- `backend/modules/remote_agent.js`
  - `sounds/tts/generated/**` Audio-Dateien werden beim lokalen Media-Scan ausgeschlossen.
  - Dadurch landen sie nicht im Compact-Snapshot und nicht im Full-Sync.
  - Diagnose ueber `exclusionPolicy`, `counts.excludedFromSync`, `counts.ttsGeneratedExcludedFromSync`.

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Alte DB-Eintraege aus `sounds:tts/generated/...` werden als aus dem Sync ausgeschlossene Legacy-/Temp-Kandidaten diagnostiziert.
  - Route bleibt read-only.

## Sicherheit

Keine DB-Writes, kein Upsert, kein Timestamp-Schreiben, kein Tombstone, kein physisches Loeschen, keine Upload/Edit/Delete-Funktion, keine Online->Agent-Dateiaktionen, kein Agent-Trigger, keine Datei-Inhalte, keine absoluten Pfade.
