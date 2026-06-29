# RDAP 0.2.58H - Media Index Diff Full-Sync Effective Compare Plan

## Zweck

0.2.58H dokumentiert die Ursache fuer den scheinbaren Widerspruch zwischen Compact-Agent-Snapshot und Full-Sync und legt den sicheren naechsten technischen Schritt fest.

Dieser Step ist Doku-only.

Es gibt keine Code-Aenderung, keinen Webserver-Deploy und keine DB-Writes.

## Ausgangslage 0.2.58G

Bestaetigter Stand:

```text
status = diff_available_agent_snapshot_truncated
agentSnapshotDiagnostic.reason = agent_snapshot_available
mediaInventoryItems = 120
mediaInventoryTotalSeen = 333
mediaInventoryTruncated = true

agentTotal = 120
remoteDbTotal = 333
matchedCount = 120
strictChangedOnAgentCount = 120
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
softModifiedAtOnlyCount = 120
effectiveUnchangedCount = 120
missingOnAgentCount = null
missingOnAgentReliable = false
```

Interpretation:

- Es gibt aktuell keine echten Hard-Changes.
- Kein Delta-Upsert ist noetig.
- Die 120 strict changes sind ausschliesslich bekannte `modifiedAt`-Offsets.
- Missing/Tombstone ist nicht belastbar, weil der Compact-Agent-Snapshot trunciert ist.
- Full-Sync sieht zwar nahezu den Gesamtbestand, ist aber weiterhin write-blocked/gate-geschuetzt.

## Ursache: Compact-Snapshot ist bewusst begrenzt

Der lokale Agent hat fuer den normalen WSS-Compact-Transport feste Grenzen:

```text
MEDIA_WSS_TRANSPORT_MAX_BYTES = 60000
MEDIA_WSS_TRANSPORT_LIMITS = [120, 80, 40, 20]
MEDIA_FULL_SYNC_CHUNK_SIZE = 50
```

Der normale `media_inventory_sync` wird als Compact-Frame gebaut.

Dabei wird zuerst ein Limit von 120 Items versucht. Passt der JSON-Frame unter ca. 60 KB, wird genau dieser Compact-Snapshot gesendet.

Das erklaert:

```text
mediaInventoryItems = 120
mediaInventoryTotalSeen = 333
mediaInventoryTruncated = true
```

Das ist kein DB-Fehler und kein fehlender Scan. Es ist eine Transport-/Compact-Grenze.

## Full-Sync ist separater Transport

Nach dem Compact-Snapshot sendet der Agent zusaetzlich Full-Sync-Chunks:

```text
type = media_inventory_full_sync_chunk
chunk size = 50
mediaIndexDataOnly = true
confirmFullSync = true
```

Diese Chunks enthalten weiterhin nur read-only Media-Index-Daten:

- keine Datei-Inhalte
- keine absoluten lokalen Pfade
- keine Agent-Action-Ausfuehrung
- keine Upload/Edit/Delete-Funktion

## Warum Missing/Tombstone aktuell nicht belastbar ist

Die aktuelle Diff-Route vergleicht:

```text
Compact-Agent-Snapshot vs. remote_media_index
```

Missing/Tombstone waere nur belastbar, wenn der Agent-Snapshot vollstaendig ist.

Bei `mediaInventoryTruncated = true` darf nicht geschlossen werden:

```text
in DB vorhanden, aber nicht im Compact-Agent-Snapshot => geloescht
```

Denn ein Item kann schlicht ausserhalb der ersten 120 Compact-Items liegen.

Deshalb bleibt korrekt:

```text
missingOnAgentCount = null
missingOnAgentReliable = false
```

## Warum Full-Sync nicht automatisch Missing/Tombstone loest

Bei deaktiviertem Full-Sync-Write-Gate werden auf dem Webserver derzeit nur Statuswerte wie diese gepflegt:

```text
state
syncId
receivedChunks
totalChunks
receivedItems
totalItems
lastChunkAt
completedAt
writesBlocked
```

Die Full-Sync-Items werden bei write-blocked Gate nicht dauerhaft in `remote_media_index` geschrieben.

Damit existiert aktuell keine belastbare vollstaendige Item-Basis fuer die Diff-Route, solange man nicht entweder:

1. Full-Sync-Items read-only temporaer fuer Diagnose/Compare puffert, oder
2. Full-Sync gated in die DB schreibt.

Option 2 ist ein Write-Step und bleibt fuer 0.2.58H ausdruecklich ausgeschlossen.

## Entscheidung fuer den naechsten technischen Schritt

Der naechste sinnvolle Code-Step ist nicht Delta-Upsert.

Der naechste sinnvolle Code-Step ist:

```text
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

Ziel 0.2.58I:

- Full-Sync-Chunks read-only als temporaere Vergleichsbasis puffern.
- Nur Media-Index-Metadaten, keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Kein DB-Write.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.
- Diff-Route kann optional zusaetzliche Diagnosefelder fuer Full-Sync-Compare liefern.

Moegliche Diagnosefelder fuer 0.2.58I:

```text
fullSyncComparePrepared
fullSyncCompareSource
fullSyncCompareAvailable
fullSyncCompareComplete
fullSyncCompareItems
fullSyncCompareTotalItems
fullSyncCompareMatchedCount
fullSyncCompareNewOnAgentCount
fullSyncCompareHardChangedOnAgentCount
fullSyncCompareEffectiveChangedOnAgentCount
fullSyncCompareMissingOnAgentCount
fullSyncCompareMissingOnAgentReliable
fullSyncCompareWarnings
```

Wichtig:

Auch mit Full-Sync-Compare bleibt Tombstone/Delete nur Diagnose, bis ein eigener Gate-/Confirm-/Audit-/Lock-Step freigegeben ist.

## Nicht tun

In 0.2.58H und als direkte Folge von 0.2.58H nicht tun:

- kein Delta-Upsert
- kein DB-Write
- kein Timestamp-Schreiben
- kein `deleted=1`
- kein physisches Loeschen
- kein Online->Agent-Trigger
- keine Datei-Inhalte uebertragen
- keine absoluten lokalen Pfade ausgeben
- keine Upload/Edit/Delete-Funktion
- keine Agent-Actions

## Geaenderte Dateien

- `docs/current/RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58H.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht geaenderte Dateien

- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `remote-modboard/backend/src/services/db.service.js`

## Tests

Doku-only:

```powershell
cd D:\Git\stream-control-center
git status
```

Optionaler Live-Gegencheck ohne Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.status, .agent.returned, .agent.totalSeen, .agent.truncated, .agentSnapshotDiagnostic.mediaFullSync, .counts.missingOnAgentReliable'
```

## Ergebnis

0.2.58H klaert:

- `120/333` ist eine erwartete Compact-Transportbegrenzung.
- Missing/Tombstone darf daraus nicht abgeleitet werden.
- Full-Sync ist der richtige Kandidat fuer eine vollstaendige read-only Vergleichsbasis.
- Vor Writes muss zuerst ein read-only Full-Sync-Compare-Snapshot geplant/gebaut werden.
