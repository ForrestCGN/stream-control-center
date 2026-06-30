# CHANGELOG

## 0.2.58O - Media Index Persistent Tombstone gated Plan dokumentiert

- Gated Plan fuer normale persistente Media-Missing/Tombstone-Faelle dokumentiert.
- Klargestellt: normale persistente Media-Dateien sind kein TTS-generated Sonderfall.
- Spaeterer Flow nur ueber Preview, Confirm-Write, Gates, Audit/Lock, Backup/Readback und Soft-Delete/Tombstone.
- Kein Code geaendert.
- Kein DB-Write.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Kein Webserver-Deploy noetig.

## 0.2.58N - Media Index Diff Reliability Note Fix bestaetigt

- `media-index-diff.routes.js` auf `RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX` aktualisiert.
- `statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1` bestaetigt.
- Reliability-Notiz korrigiert: Wenn Full-Sync-Compare vollstaendig ist, ist Missing-Diagnose trotz gekuerztem Compact-Agent-Snapshot read-only belastbar.
- Keine Write-/Delete-/Agent-Trigger-Logik geaendert.
- Keine Tombstone-Kandidaten aktuell: `persistentMediaMissingCandidateCount = 0`, `tombstoneCandidateDiagnosticCount = 0`.

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
