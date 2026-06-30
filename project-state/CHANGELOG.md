# CHANGELOG

## 0.2.58K Final - Webserver-Bestaetigung dokumentiert

- Webserver-Test fuer `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC` dokumentiert.
- `statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1` bestaetigt.
- `routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC` bestaetigt.
- `readOnly = true` und `writeEnabled = false` bestaetigt.
- `ttsGeneratedExcludedFromSyncLegacyCount = 1` bestaetigt.
- `persistentMediaMissingCandidateCount = 0` bestaetigt.
- Alter DB-Eintrag `sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3` als `tts_generated_excluded_from_sync_legacy_candidate` bestaetigt.
- Kein Code geaendert; Doku-only Abschluss.
- Naechsten RDAP-Step `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY` festgelegt.

## 0.2.58K - Media Index exclude TTS generated from Sync

- `backend/modules/remote_agent.js` auf `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC` aktualisiert.
- Statusmarker `rdap_agent_media_inventory_exclude_tts_generated_058k.v1` ergaenzt.
- TTS-generated temp files unter `sounds/tts/generated/` werden beim lokalen Media-Scan ausgeschlossen.
- Der Ausschluss wirkt vor Compact-Snapshot und Full-Sync-Chunks.
- Neue Agent-Diagnose: `exclusionPolicy`, `counts.excludedFromSync`, `counts.ttsGeneratedExcludedFromSync`.
- `media-index-diff.routes.js` auf `rdap_media_index_diff_exclude_tts_generated_sync_058k.v1` aktualisiert.
- Alte DB-Eintraege unter `sounds:tts/generated/...` werden als `tts_generated_excluded_from_sync_legacy_candidate` diagnostiziert.
- Kompatible 0.2.58J-Felder bleiben sichtbar.
- Keine DB-Writes, kein Upsert, kein Timestamp-Schreiben, kein Tombstone/Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.58J - Media Index TTS Temp Missing Read-only Classification

- `media-index-diff.routes.js` auf `RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION` aktualisiert.
- Statusmarker `rdap_media_index_diff_tts_temp_missing_classification_058j.v1` ergaenzt.
- Missing-Eintraege werden read-only klassifiziert.
- TTS-generated-temp-Regel ergaenzt: `sounds:tts/generated/` plus Audio-Dateiendung.
- Neue Diagnosefelder: `missingClassification`, `previews.ttsTempMissingCandidates`, `previews.tombstoneCandidatesDiagnostic`.
- Neue Counts: `ttsTempMissingCandidateCount`, `tombstoneCandidateDiagnosticCount`.
- `fullSyncCompare` liefert dieselbe Missing-Klassifizierung fuer den vollstaendigen In-Memory-Snapshot.
- Tombstone-Kandidatur bleibt reine Diagnose; keine Writes, kein Upsert, kein Tombstone/Delete, kein Agent-Trigger.

## 0.2.58I Final - Full-Sync Compare bestaetigt

- Webserver-Test fuer `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT` dokumentiert.
- `fullSyncCompare` ist `prepared/readOnly/available/complete`.
- Full-Sync-Compare sieht 332/332 Agent-Items gegen 333 DB-Items.
- `missingOnAgentCount = 1` und `missingOnAgentReliable = true` bestaetigt.
- `hardChangedOnAgentCount = 0` und `effectiveChangedOnAgentCount = 0` bestaetigt.
- 332 strict changes bleiben bekannte `modifiedAt`-Offsets.
- Missing-Eintrag `sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3` als TTS-generated-temp-Verdacht dokumentiert.
- Naechsten RDAP-Step `RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION` festgelegt.
- Kein Code geaendert; Doku-only Abschluss.
