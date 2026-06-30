# CHANGELOG

## 0.2.58P - Media Index Persistent Tombstone gated Preview

- `media-index-diff.routes.js` auf `RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW` aktualisiert.
- Neue Route `GET /api/remote/media/index/tombstone/persistent/preview` ergaenzt.
- Preview filtert persistente Missing-Kandidaten aus der bestehenden read-only Diff-Diagnose.
- Preview ist nur belastbar, wenn `missingOnAgentReliable = true` ist.
- Kein Execute, kein DB-Write, kein `deleted=1`, kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
- Future-Execute-Anforderungen als Diagnoseblock dokumentiert.

## 0.2.58O - Media Index Persistent Tombstone gated Plan

- Persistent-Tombstone-Flow als Doku-only Plan dokumentiert.
- Gate/Confirm/Audit/Backup/Readback-Anforderungen festgehalten.

## 0.2.58N - Media Index Diff Reliability Note Fix

- Reliability-Note korrigiert, wenn Full-Sync-Compare vollstaendig ist, der Compact-Agent-Snapshot aber gekuerzt bleibt.
- Kein Write, kein Delete, kein Agent-Trigger.

## 0.2.58L Final - TTS Legacy DB Cleanup bestaetigt

- Alter TTS-generated Legacy-Eintrag wurde per Soft-Delete (`deleted=1`) bereinigt.
- Keine normalen persistenten Media-Dateien betroffen.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.
