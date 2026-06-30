# CHANGELOG

## 0.2.59 - Media Index Persistent Tombstone gated Execute Foundation

- `media-index-diff.routes.js` auf `RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION` aktualisiert.
- Neue Route `POST /api/remote/media/index/tombstone/persistent/execute` ergaenzt.
- Preview-Route bleibt erhalten.
- Execute ist local-only und braucht `confirmWrite:true`, `confirmTombstone`, `expectedCandidateCount` und explizite Media-Index-Gates.
- Zusaetzliches Gate: `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`.
- Bei `candidateCount = 0` ist Execute ein Noop ohne DB-Write.
- Bei Kandidaten > 0 ist nur Soft-Delete (`deleted=1`) vorbereitet, mit Audit und Readback.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

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
