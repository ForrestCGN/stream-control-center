# CHANGELOG

## 0.2.58L - Media Index TTS Legacy DB Cleanup gated

- Neue Route `GET /api/remote/media/index/cleanup/tts-generated-legacy/status` ergaenzt.
- Neue Route `POST /api/remote/media/index/cleanup/tts-generated-legacy` ergaenzt.
- Neue Service-Datei `media-index-tts-legacy-cleanup.service.js` ergaenzt.
- TTS-generated Legacy-Kandidaten werden strikt auf `root_key=sounds`, `relative_path LIKE 'tts/generated/%'`, `kind=audio`, Audio-Dateiendung und `deleted=0` begrenzt.
- Execute ist local-only und braucht `confirmWrite:true`, `confirmCleanup` und `expectedCandidateCount`.
- Execute braucht `MEDIA_INDEX_WRITE_ENABLED=true` und `MEDIA_INDEX_DATA_WRITE_ENABLED=true`.
- Cleanup ist Soft-Delete (`deleted=1`), kein Hard-Delete.
- Audit-Insert in `dashboard_audit_log` und Readback ergaenzt.
- Keine physische Dateiaktion, kein Online->Agent-Trigger, keine normale Media-Missing-Bereinigung.

## 0.2.58K Final - Webserver-Bestaetigung dokumentiert

- Webserver-Test fuer `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC` dokumentiert.
- `statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1` bestaetigt.
- `ttsGeneratedExcludedFromSyncLegacyCount = 1` bestaetigt.
- Alter DB-Eintrag unter `sounds:tts/generated/...` bleibt Legacy-/Temp-Diagnose.
- Keine Writes, kein Tombstone/Delete, kein Online->Agent-Trigger.

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
