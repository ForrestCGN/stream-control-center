# CHANGELOG

## 0.2.58M - Media Index Persistent Missing Tombstone Plan read-only

- Read-only Plan fuer normale lokal geloeschte persistente Media-Dateien dokumentiert.
- Klare Abgrenzung zu `sounds/tts/generated/**` als temporaerem TTS-Sonderfall dokumentiert.
- Missing-on-Agent fuer normale persistente Media-Dateien darf nur bei vollstaendigem, nicht gekuerztem Full-Sync/Agent-Snapshot als spaetere Tombstone-Kandidatur gelten.
- Kein Code-Write.
- Kein DB-Write.
- Kein `deleted=1` fuer persistente Media-Dateien.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
- Naechster Step als eigener gated Tombstone-/Soft-Delete-Prep-Step festgelegt.

## 0.2.58L Final - TTS Legacy DB Cleanup bestaetigt

- Webserver-Preview fuer `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED` bestaetigt.
- Preview zeigte genau 1 alten TTS-generated Legacy-Kandidaten.
- Erster Execute ohne `MEDIA_INDEX_WRITE_ENABLED` / `MEDIA_INDEX_DATA_WRITE_ENABLED` wurde korrekt blockiert.
- Media-Index-Write-Gates wurden temporaer aktiviert.
- Cleanup wurde local-only mit `confirmWrite:true`, `confirmCleanup` und `expectedCandidateCount=1` ausgefuehrt.
- Alter TTS-generated Legacy-Eintrag wurde per Soft-Delete (`deleted=1`) bereinigt.
- Gates wurden danach wieder deaktiviert.
- Readback bestaetigt: Cleanup-Preview `candidateCount = 0`.
- Diff-Readback bestaetigt: `missingOnAgentItems = 0`, keine TTS-Legacy-Kandidaten, keine Tombstone-Kandidaten.
- Keine normalen persistenten Media-Dateien betroffen.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.


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
