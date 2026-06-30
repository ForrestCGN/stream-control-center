# RDAP 0.2.58P - Media Index Persistent Tombstone gated Preview

## Zweck

0.2.58P ergaenzt eine reine Preview-/Statusroute fuer normale persistente Media-Dateien, die im belastbaren Full-Sync-Compare als `missingOnAgent` erscheinen.

Der Step bereitet nur die Diagnose fuer einen spaeteren Tombstone-Flow vor.

## Statusmarker

```text
rdap_media_index_persistent_tombstone_preview_058p.v1
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

Vorheriger Stand:

```text
rdap_media_index_diff_reliability_note_fix_058n.v1
RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
```

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58P.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Neue Route

```text
GET /api/remote/media/index/tombstone/persistent/preview
```

Bestehende Diff-Route bleibt erhalten:

```text
GET /api/remote/media/index/diff/status
```

## Verhalten

Die neue Route liest intern den bestehenden read-only Diff-Status und filtert Preview-Kandidaten auf:

```text
missingClassification = persistent_media_missing_candidate
```

Sie ist nur belastbar, wenn `missingOnAgentReliable = true` ist. Bei unzuverlaessiger Quelle bleibt die Route read-only und meldet `persistent_tombstone_preview_unreliable_input`.

## Sicherheitsgrenzen

0.2.58P macht ausdruecklich NICHTS davon:

- kein Execute
- kein DB-Write
- kein `deleted=1`
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Upload/Edit/Delete
- keine Datei-Inhalte
- keine absoluten lokalen Pfade

## Spaeterer Execute-Scope

Ein spaeterer Write-Step braucht separat:

- eigene Execute-Route
- local-only bzw. freigegebene Auth/Permission
- `confirmWrite:true`
- eigenes Confirm-Token
- `expectedCandidateCount`
- Media-Index-Write-Gates
- dediziertes Persistent-Tombstone-Gate
- Audit
- Backup/Rollback-Konzept
- Readback

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .emote-modboardackend\srcoutes\media-index-diff.routes.js

git status
```

## Webserver-Deploy

Da `remote-modboard/` Code geaendert wurde, ist nach `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW dev
```

## Webserver-Tests

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .reliability.missingOnAgentReliable, .missingClassification.persistentMediaMissingCandidateCount'

curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .candidatePolicy, .safety, .note'
```

Erwartung:

```text
readOnly = true
writeEnabled = false
executeRoutePrepared = false
databaseWriteExecuted = false
```

Bei aktuellem Stand ohne persistente Missing-Dateien:

```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```
