# RDAP 0.2.58N - Media Index Diff Reliability Note Fix

## Zweck

0.2.58N korrigiert die Reliability-Notiz der read-only Media-Index-Diff-Route.

Ausgangslage nach 0.2.58M:

```text
agentSnapshotTruncated = true
fullSyncCompareMissingOnAgentReliable = true
missingOnAgentReliable = true
note = Agent-Snapshot ist gekuerzt...
```

Das war fachlich missverstaendlich: Der normale Compact-Agent-Snapshot war gekuerzt, aber der Full-Sync-Compare-Snapshot war vollstaendig und machte Missing-on-Agent trotzdem read-only belastbar.

## Statusmarker

```text
rdap_media_index_diff_reliability_note_fix_058n.v1
RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
```

Vorher:

```text
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
```

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58N.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Fachliche Aenderung

Die Funktion `buildReliabilityBlock()` priorisiert jetzt die vollstaendige Full-Sync-Compare-Bewertung vor der Truncated-Notiz des Compact-Agent-Snapshots.

Wenn gilt:

```text
fullSyncCompareMissingOnAgentReliable = true
```

meldet `reliability.note` jetzt sinngemaess:

```text
Full-Sync-Compare-Snapshot ist vollstaendig; Missing-Diagnose ist trotz gekuerztem Compact-Agent-Snapshot read-only belastbar.
```

Die alte Warnung fuer gekuerzte Compact-Snapshots bleibt erhalten, greift aber nur noch, wenn kein belastbarer Full-Sync-Compare vorhanden ist.

## Nicht geaendert

- Kein DB-Write.
- Kein Tombstone-Write.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Upload/Edit/Delete-Funktion.
- Keine Cleanup-Route fuer persistente Medien.
- Keine Aenderung am Agent-Sync.
- Keine normale Media-Datei wird veraendert.

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js

git status
```

## Webserver-Deploy

Da `remote-modboard/` Code geaendert wurde, ist nach `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX dev
```

## Webserver-Test

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .counts.missingOnAgentReliable, .counts.missingOnAgentCount, .missingClassification.persistentMediaMissingCandidateCount, .missingClassification.tombstoneCandidateDiagnosticCount, .reliability'
```

Erwartung:

```text
statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1
routeBuild = RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
readOnly = true
```

Wenn `fullSyncCompareMissingOnAgentReliable = true`, darf die Reliability-Note nicht mehr behaupten, Missing sei wegen gekuerztem Compact-Agent-Snapshot unzuverlaessig.

## Sicherheit

0.2.58N ist ein reiner Diagnose-/Anzeige-Fix. Er veraendert keine Daten und fuehrt keine Aktionen aus.
