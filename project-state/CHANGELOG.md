# CHANGELOG

## 0.2.58H - Media Index Diff Full-Sync Effective Compare Plan

- Ursache fuer `120 returned / 333 totalSeen` dokumentiert.
- Compact-Agent-Snapshot ist bewusst durch WSS-Payloadgroesse und Limits `[120, 80, 40, 20]` begrenzt.
- Full-Sync ist separater 50er-Chunk-Transport.
- Missing/Tombstone bleibt aus Compact-Snapshot nicht belastbar.
- Naechster sinnvoller Code-Step als read-only Full-Sync-Compare-Snapshot festgelegt.
- Doku-only: keine Code-Aenderung, kein Webserver-Deploy, keine DB-Writes.

## 0.2.58G Final Documentation

- Webserver-Test nach 0.2.58G dokumentiert.
- Ergebnis: `effectiveChangedOnAgentCount=0`, `softModifiedAtOnlyCount=120`, `effectiveUnchangedCount=120`.
- Kein Delta-Upsert noetig.
- Missing/Tombstone bleibt nicht belastbar wegen trunciertem Compact-Agent-Snapshot.
- Neuer Chat-Prompt fuer Fortsetzung nach 0.2.58G erstellt.

## 0.2.58G - Media Index Diff Effective Change Counts

- `strictChangedOnAgentCount`, `strictUnchangedCount`, `effectiveChangedOnAgentCount`, `effectiveUnchangedCount` und `effectiveNoopChangedOnAgentCount` ergaenzt.
- `previews.strictChangedOnAgent`, `previews.softChangedOnAgent` und `previews.effectiveChangedOnAgent` ergaenzt.
- `changedOnAgentCount` bleibt kompatibel strict.
- Keine DB-Writes, kein Upsert, kein Timestamp-Schreiben, kein Tombstone/`deleted=1`, kein Agent-Trigger.

## 0.2.58F - Media Index Diff ModifiedAt Soft-Match Policy

- Bekannte 1h/2h `modifiedAt`-Offsets werden als `soft_modified_at_offset_only` klassifiziert.

## 0.2.58E - Media Index Diff ModifiedAt DB Diagnostic

- Read-only Diff-Route um `modifiedAt`-Delta-Diagnose erweitert.

## 0.2.58D - Media Agent Inventory Sync Reconnect Diagnostic

- Lokaler Agent sendet Media-Inventory initial robuster nach WSS-Open.

## 0.2.58C - Media Index Diff Agent Snapshot Status Diagnostic

- `agentSnapshotDiagnostic` in der read-only Diff-Route ergaenzt.

## 0.2.58B - Media Index Diff Agent Empty Unreliable

- Leerer Agent-Snapshot wird nicht als belastbarer Missing-/Loeschstatus bewertet.

## 0.2.58A - Media Index Diff Compare Normalization

- Diff-Metadatenvergleich normalisiert.

## 0.2.58 - Media Index Diff Diagnostic Read-only

- Neue read-only Route `/api/remote/media/index/diff/status`.

## 0.2.57 - Media Index Delta Sync Plan

- Delta-Sync-/Loeschstatus-Konzept dokumentiert.
