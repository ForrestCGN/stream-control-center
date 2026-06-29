# CHANGELOG

## 0.2.58E - Media Index Diff ModifiedAt DB Diagnostic

- Read-only Diff-Route um `modifiedAt`-Delta-Diagnose erweitert.
- `changedOnAgent` Preview zeigt `agentModifiedAt`, `dbModifiedAt`, `modifiedAtDeltaMs`, `modifiedAtDeltaAbsMs` und Toleranz.
- `counts.modifiedAtDeltaStats` zeigt Count, Min/Max/Avg und Vorzeichen-Verteilung.
- Keine DB-Writes, kein Upsert, kein Tombstone/`deleted=1`, kein Agent-Trigger.

## 0.2.58D - Media Agent Inventory Sync Reconnect Diagnostic

- Lokaler Agent sendet Media-Inventory initial robuster nach WSS-Open.
- Keine DB-Writes, kein Online->Agent-Trigger.

## 0.2.58C - Media Index Diff Agent Snapshot Status Diagnostic

- `agentSnapshotDiagnostic` in der read-only Diff-Route ergaenzt.
- Keine DB-Writes.

## 0.2.58B - Media Index Diff Agent Empty Unreliable

- Leerer Agent-Snapshot wird nicht als belastbarer Missing-/Loeschstatus bewertet.

## 0.2.58A - Media Index Diff Compare Normalization

- Diff-Metadatenvergleich normalisiert.

## 0.2.58 - Media Index Diff Diagnostic Read-only

- Neue read-only Route `/api/remote/media/index/diff/status`.

## 0.2.57 - Media Index Delta Sync Plan

- Delta-Sync-/Loeschstatus-Konzept dokumentiert.
