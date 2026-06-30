# CHANGELOG

## 0.2.58N - Media Index Diff Reliability Note Fix

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` auf `RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX` aktualisiert.
- `statusApiVersion` auf `rdap_media_index_diff_reliability_note_fix_058n.v1` aktualisiert.
- Reliability-Note korrigiert: Wenn der Full-Sync-Compare vollstaendig ist und `missingOnAgentReliable=true` liefert, dominiert nicht mehr die Warnung des gekuerzten Compact-Agent-Snapshots.
- Keine DB-Writes, kein Tombstone-Write, kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.58M - Media Index Persistent Missing Tombstone Plan read-only

- Read-only Plan fuer normale persistent geloeschte Media-Dateien dokumentiert.
- Kein Code, kein DB-Write, kein physisches Loeschen, kein Online->Agent-Trigger.

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
