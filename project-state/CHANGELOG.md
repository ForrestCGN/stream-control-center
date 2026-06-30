# CHANGELOG

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

## 0.2.58I - Media Full-Sync Read-only Compare Snapshot

- `agent-runtime.service.js` um read-only In-Memory-Full-Sync-Compare-Snapshot erweitert.
- Valide Full-Sync-Chunks werden nach `chunkIndex` gepuffert.
- Bei vollstaendigem Empfang wird ein kompletter sanitizter Media-Index-Snapshot in-memory aufgebaut.
- `media-index-diff.routes.js` liefert zusaetzlich `fullSyncCompare`.
- Compact-Diff-Ausgabe bleibt kompatibel erhalten.
- Missing/Tombstone bleibt Diagnose und wird nur bei vollstaendigem Full-Sync-Compare als reliable markiert.
- Keine DB-Writes, kein Upsert, kein Tombstone/Delete, kein Agent-Trigger.
