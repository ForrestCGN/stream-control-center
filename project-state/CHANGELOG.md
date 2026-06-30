# CHANGELOG

## 0.2.61 - Media Index Persistent Tombstone Real Candidate Test Plan

- Read-only Testplan fuer echten persistenten Tombstone-Kandidaten dokumentiert.
- Keine Source-Dateien geaendert.
- Keine DB-Zeile veraendert.
- Keine Datei geloescht.
- Keine Gates aktiviert.
- Kein echter Tombstone-Write ausgefuehrt.
- Testvarianten dokumentiert:
  - echte dedizierte Test-Media-Datei
  - kontrollierte Test-DB-Zeile
  - reine Simulation/Read-only-Diagnose
- Remote-Modboard/Webserver und lokales Dashboard/Agent sauber getrennt dokumentiert.
- Weiterhin kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.60 - Media Index Persistent Tombstone Noop Execute with Gates bestaetigt

- Temporär `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true` und `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true` auf dem Webserver gesetzt.
- Execute mit `confirmWrite:true`, Confirm-Text und `expectedCandidateCount=0` getestet.
- Noop-Pfad bestaetigt: `reason = no_persistent_tombstone_candidates_to_soft_delete`.
- `writeExecuted=false`, `databaseWriteExecuted=false`, `softDeleteExecuted=false`, `hardDeleteExecuted=false`, `physicalDeleteExecuted=false`.
- Readback bestaetigt: `readBackCandidateCount=0`.
- `auditWritten=false`, da Noop ohne DB-Write.
- Gates danach wieder deaktiviert und per Env-Check bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.59 - Media Index Persistent Tombstone gated Execute Foundation

- `POST /api/remote/media/index/tombstone/persistent/execute` ergaenzt.
- Execute local-only, Confirm-Write, Confirm-Tombstone und `expectedCandidateCount` geschuetzt.
- Execute braucht drei Gates:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
- Execute bleibt Soft-Delete-only vorbereitet.
- Confirm-Block und Gate-Block auf Webserver bestaetigt.
- Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## 0.2.58P - Media Index Persistent Tombstone gated Preview

- `GET /api/remote/media/index/tombstone/persistent/preview` ergaenzt.
- Preview bleibt read-only.
- Keine Execute-Route in 0.2.58P.
- Keine DB-Writes, kein Tombstone-Write, kein physisches Loeschen.

## 0.2.58N - Media Index Diff Reliability Note Fix

- Reliability-Note korrigiert, wenn Full-Sync-Compare vollstaendig ist, aber Compact-Agent-Snapshot gekuerzt ist.
- Webserver bestaetigt: Missing-Diagnose ist trotz gekuerztem Compact-Agent-Snapshot belastbar, wenn Full-Sync-Compare vollstaendig ist.
