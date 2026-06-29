# RDAP 0.2.58I - Media Full-Sync Read-only Compare Snapshot

## Zweck

0.2.58I baut die in 0.2.58H geplante read-only Vergleichsbasis fuer Full-Sync-Chunks.

Der Webserver puffert valide `media_inventory_full_sync_chunk`-Payloads temporaer im Speicher und stellt daraus nach vollstaendigem Empfang einen Full-Sync-Compare-Snapshot bereit.

Dieser Snapshot wird nur fuer Diagnose/Diff genutzt.

## Sicherheit

- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Keine Agent-Actions.
- Kein Online->Agent-Trigger.

## Geaenderte Dateien

- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58I.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht geaendert

- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/services/db.service.js`
- keine lokale Agent-Scan-Logik
- keine Datenbank-Migration

## Agent Runtime

Neuer sichtbarer Build:

```text
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

Neuer Statusmarker:

```text
rdap_agent_media_full_sync_compare_snapshot_058i.v1
```

Der Full-Sync-Receiver speichert pro Sync-ID die empfangenen Chunks in-memory nach `chunkIndex`.

Wenn alle Chunks empfangen wurden, wird daraus ein read-only Snapshot gebaut:

```text
source = agent_full_sync_readonly_memory_snapshot
available = true
complete = true
items = vollstaendige sanitizte Media-Index-Metadaten
```

Die Items bleiben in-memory und werden beim Socket-Close/Restart geloescht.

## Diff Route

Route unveraendert:

```text
GET /api/remote/media/index/diff/status
```

Neuer Statusmarker:

```text
rdap_media_index_diff_full_sync_compare_snapshot_058i.v1
```

Neuer Route-Build:

```text
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

Die bestehende Compact-Diff-Ausgabe bleibt kompatibel erhalten.

Zusaetzlich gibt es einen neuen Block:

```text
fullSyncCompare
```

Wichtige Felder:

```text
fullSyncCompare.prepared
fullSyncCompare.readOnly
fullSyncCompare.inMemoryOnly
fullSyncCompare.available
fullSyncCompare.complete
fullSyncCompare.syncId
fullSyncCompare.receivedChunks
fullSyncCompare.totalChunks
fullSyncCompare.receivedItems
fullSyncCompare.totalItems
fullSyncCompare.items
fullSyncCompare.matchedCount
fullSyncCompare.newOnAgentCount
fullSyncCompare.hardChangedOnAgentCount
fullSyncCompare.effectiveChangedOnAgentCount
fullSyncCompare.softModifiedAtOnlyCount
fullSyncCompare.missingOnAgentCount
fullSyncCompare.missingOnAgentReliable
fullSyncCompare.counts
fullSyncCompare.previews
```

`missingOnAgentReliable` wird im Full-Sync-Compare nur `true`, wenn:

- der Full-Sync-Compare-Snapshot vollstaendig ist,
- der Snapshot nicht trunciert ist,
- der DB-Read nicht trunciert ist.

## Wichtig

Auch wenn `fullSyncCompare.missingOnAgentReliable=true` wird, ist das nur Diagnose.

Tombstone/Delete bleibt verboten, bis ein eigener Gate-/Confirm-/Audit-/Lock-Step freigegeben ist.

## Lokale Tests

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\services\agent-runtime.service.js
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js

git status
```

## Webserver-Deploy

Da Code unter `remote-modboard/` geaendert wurde, ist nach lokalem `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .fullSyncCompare.prepared, .fullSyncCompare.readOnly, .fullSyncCompare.available, .fullSyncCompare.complete, .fullSyncCompare.receivedItems, .fullSyncCompare.totalItems, .fullSyncCompare.missingOnAgentReliable'
```

Erwartung direkt nach Deploy:

- `statusApiVersion = rdap_media_index_diff_full_sync_compare_snapshot_058i.v1`
- `routeBuild = RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`
- `fullSyncCompare.prepared = true`
- `fullSyncCompare.readOnly = true`

Wenn noch kein neuer Full-Sync seit Deploy angekommen ist:

```text
fullSyncCompare.available = false
fullSyncCompare.complete = false
```

Das ist korrekt, weil der Snapshot in-memory ist.

Nach Agent-Full-Sync sollte sichtbar werden:

```text
fullSyncCompare.available = true
fullSyncCompare.complete = true
fullSyncCompare.receivedItems ~= 333
fullSyncCompare.totalItems ~= 333
```

## Naechster Schritt

Wenn 0.2.58I getestet ist:

- Full-Sync-Compare-Werte auswerten.
- DB-Read-Source UI final sichtpruefen.
- Gated Delta-Upsert fuer echte Hard-Changes separat planen.
- Tombstone/Loeschstatus nur mit eigenem Gate/Confirm/Audit/Lock planen.
