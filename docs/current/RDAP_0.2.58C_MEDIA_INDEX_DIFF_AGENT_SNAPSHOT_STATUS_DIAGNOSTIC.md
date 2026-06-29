# RDAP 0.2.58C - Media Index Diff Agent Snapshot Status Diagnostic

## Zweck

0.2.58C erweitert die read-only Diff-Diagnose aus 0.2.58B um eine klare Agent-Snapshot-Diagnose.

Nach 0.2.58B ist ein leerer Agent-Snapshot sicher als nicht belastbar markiert. 0.2.58C zeigt zusaetzlich, warum der Snapshot leer oder nicht verfuegbar ist.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

Die Route gibt jetzt zusaetzlich `agentSnapshotDiagnostic` aus.

Wichtige Felder:

```text
agentSnapshotDiagnostic.available
agentSnapshotDiagnostic.reason
agentSnapshotDiagnostic.agentConnected
agentSnapshotDiagnostic.connectionState
agentSnapshotDiagnostic.lastSeenAt
agentSnapshotDiagnostic.lastHeartbeatAt
agentSnapshotDiagnostic.lastMediaInventorySyncAt
agentSnapshotDiagnostic.mediaInventorySyncSeq
agentSnapshotDiagnostic.mediaInventoryRejectCount
agentSnapshotDiagnostic.lastMediaInventoryRejectReason
agentSnapshotDiagnostic.mediaFullSync
```

Moegliche Gruende:

```text
agent_snapshot_available
agent_not_connected
media_inventory_not_received_since_restart
media_inventory_empty
media_inventory_rejected
```

## Sicherheit

- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktion.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_STATUS_DIAGNOSTIC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58C.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests lokal

```powershell
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js
git status
```

## Tests Webserver nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .status, .agentSnapshotDiagnostic, .reliability'
```

Erwartet:

```text
statusApiVersion = rdap_media_index_diff_agent_snapshot_diagnostic_058c.v1
routeBuild = RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_STATUS_DIAGNOSTIC
readOnly = true
writeEnabled = false
```

## Naechster Schritt

Erst anhand der Diagnose klaeren, ob Agent-Verbindung, Media-Inventory-Sync oder Restart/Memory-Verlust Ursache ist. Danach Diff erneut pruefen. Gated Delta-Upsert bleibt separat; Tombstone/Loeschstatus bleibt getrennt und braucht ein eigenes Gate/Confirm/Audit/Lock/Readback-Konzept.
