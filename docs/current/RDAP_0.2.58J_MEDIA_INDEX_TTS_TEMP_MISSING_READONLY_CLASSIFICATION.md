# RDAP 0.2.58J - Media Index TTS Temp Missing Read-only Classification

## Zweck

0.2.58J klassifiziert Missing-Eintraege aus dem bestehenden read-only Media-Index-Diff diagnostisch.

Der konkrete bestaetigte Missing-Eintrag aus 0.2.58I liegt unter:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

TTS-generated-Dateien sind laut Nutzer grundsaetzlich temporaer. 0.2.58J markiert solche Missing-Eintraege deshalb separat als TTS-temp-Missing-Kandidaten.

## Sicherheit

Dieser Step bleibt strikt read-only:

- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.
- Keine Online->Agent-Dateiaktionen.

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58J.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht geaendert

- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/services/db.service.js`
- keine lokale Agent-Scan-Logik
- keine Datenbank-Migration

## Neuer Route-Build

```text
RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION
```

## Neuer Statusmarker

```text
rdap_media_index_diff_tts_temp_missing_classification_058j.v1
```

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Neue Diagnosefelder

Top-Level:

```text
missingClassification
```

In `fullSyncCompare` ebenfalls:

```text
fullSyncCompare.missingClassification
```

Neue Preview-Gruppen:

```text
previews.ttsTempMissingCandidates
previews.tombstoneCandidatesDiagnostic
fullSyncCompare.previews.ttsTempMissingCandidates
fullSyncCompare.previews.tombstoneCandidatesDiagnostic
```

Neue Counts:

```text
counts.ttsTempMissingCandidateCount
counts.tombstoneCandidateDiagnosticCount
fullSyncCompare.counts.ttsTempMissingCandidateCount
fullSyncCompare.counts.tombstoneCandidateDiagnosticCount
```

## Klassifizierungsregel

Ein Missing-Eintrag wird als TTS-temp-Missing-Kandidat markiert, wenn:

```text
rootKey = sounds
relativePath beginnt mit tts/generated/
extension ist Audio (.mp3/.wav/.ogg/.m4a)
```

Dann erhaelt der Preview-Eintrag:

```text
missingClassification = tts_generated_temp_missing_candidate
ttsGeneratedTempCandidate = true
temporaryFileCandidate = true
tombstoneCandidateDiagnostic = true
tombstoneWriteAllowed = false
deleteAllowed = false
```

Alle anderen belastbaren Missing-Eintraege bleiben:

```text
missingClassification = persistent_media_missing_candidate
tombstoneCandidateDiagnostic = true
tombstoneWriteAllowed = false
deleteAllowed = false
```

## Wichtig

`tombstoneCandidateDiagnostic = true` bedeutet ausschliesslich: Diagnosekandidat.

Es bedeutet nicht, dass ein Tombstone geschrieben werden darf.

## Lokale Tests

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js

git status
```

## Webserver-Deploy

Da Code unter `remote-modboard/` geaendert wurde, ist nach lokalem `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION dev
```

## Webserver-Test

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .fullSyncCompare.readOnly, .fullSyncCompare.missingOnAgentReliable, .fullSyncCompare.missingClassification, .fullSyncCompare.previews.ttsTempMissingCandidates'
```

Erwartung nach neuem Full-Sync-Compare:

```text
statusApiVersion = rdap_media_index_diff_tts_temp_missing_classification_058j.v1
routeBuild = RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION
readOnly = true
writeEnabled = false
fullSyncCompare.readOnly = true
fullSyncCompare.missingOnAgentReliable = true
fullSyncCompare.missingClassification.ttsGeneratedTempCandidateCount = 1
```
