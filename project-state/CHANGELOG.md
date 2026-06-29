# CHANGELOG

## 0.2.58I - Media Full-Sync Read-only Compare Snapshot

- `agent-runtime.service.js` um read-only In-Memory-Full-Sync-Compare-Snapshot erweitert.
- Valide Full-Sync-Chunks werden nach `chunkIndex` gepuffert.
- Bei vollstaendigem Empfang wird ein kompletter sanitizter Media-Index-Snapshot in-memory aufgebaut.
- `media-index-diff.routes.js` liefert zusaetzlich `fullSyncCompare`.
- Compact-Diff-Ausgabe bleibt kompatibel erhalten.
- Missing/Tombstone bleibt Diagnose und wird nur bei vollstaendigem Full-Sync-Compare als reliable markiert.
- Keine DB-Writes, kein Upsert, kein Tombstone/Delete, kein Agent-Trigger.

## 0.2.58H - Media Index Diff Full-Sync Effective Compare Plan

- Compact-Snapshot-/Full-Sync-Verhaeltnis dokumentiert.
- `120/333` als erwartete Compact-Transportbegrenzung erklaert.
- Read-only Full-Sync-Compare-Snapshot als naechsten Code-Step festgelegt.
