# RDAP 0.2.58L - Media Index TTS Legacy DB Cleanup gated

## Zweck

0.2.58L baut einen kontrollierten Cleanup-Write fuer alte TTS-generated Legacy-Eintraege in `remote_media_index`.

Ausgangspunkt:

- 0.2.58K ist bestaetigt.
- `sounds/tts/generated/**` wird vom Agent-Media-Sync ausgeschlossen.
- Ein alter DB-Eintrag kann weiterhin als Legacy-/Temp-Diagnose erscheinen.

0.2.58L bereinigt solche alten aktiven DB-Eintraege nicht automatisch. Es stellt eine lokale, gegatete Cleanup-Route bereit.

## Statusmarker

```text
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
```

## Geaenderte Dateien

- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
- `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58L.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Routen

Status / Preview:

```text
GET /api/remote/media/index/cleanup/tts-generated-legacy/status
```

Ausfuehrung:

```text
POST /api/remote/media/index/cleanup/tts-generated-legacy
```

## Cleanup-Regel

Nur aktive DB-Eintraege mit:

```text
deleted = 0
root_key = sounds
relative_path LIKE 'tts/generated/%'
kind = audio
extension IN (.mp3, .wav, .ogg, .m4a)
```

## Write-Schutz

Die Ausfuehrung ist blockiert, solange nicht alles erfuellt ist:

- Request ist lokal (`127.0.0.1` / `::1`).
- JSON-Body enthaelt `confirmWrite: true`.
- JSON-Body enthaelt `confirmCleanup: "RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP"`.
- JSON-Body enthaelt `expectedCandidateCount` und diese Zahl passt zum aktuellen DB-Read.
- DB ist konfiguriert.
- `MEDIA_INDEX_WRITE_ENABLED=true`.
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true`.

## Art des Cleanups

0.2.58L macht keinen Hard-Delete.

Stattdessen:

```text
UPDATE remote_media_index SET deleted = 1
```

Zusaetzlich:

- `source` wird auf `rdap_0.2.58l_tts_legacy_cleanup_soft_delete` gesetzt.
- `sync_version` wird erhoeht.
- `updated_at` wird aktualisiert.
- Ein Audit-Eintrag wird in `dashboard_audit_log` geschrieben.
- Danach erfolgt Readback.

## Sicherheit

Weiterhin verboten:

- kein physisches Loeschen
- kein Online->Agent-Trigger
- keine Datei-Inhalte
- keine absoluten lokalen Pfade
- keine Upload/Edit/Delete-Funktion
- keine Bereinigung normaler persistenter Media-Dateien
- kein automatisches Tombstone fuer normale Missing-Dateien

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\media-index-cleanup.routes.js
node --check .\remote-modboard\backend\src\services\media-index-tts-legacy-cleanup.service.js

git status
```

## Webserver-Deploy

Da `remote-modboard/` Code geaendert wurde, ist nach `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED dev
```

## Webserver-Preview

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/cleanup/tts-generated-legacy/status | jq '.statusApiVersion, .routeBuild, .readOnly, .preview.candidateCount, .preview.candidates'
```

Erwartung vor Cleanup bei aktuellem Stand:

```text
statusApiVersion = rdap_media_index_tts_legacy_cleanup_gated_058l.v1
routeBuild = RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
readOnly = true
preview.candidateCount = 1
```

## Webserver-Execute

Nur ausfuehren, wenn Preview korrekt ist und die Env-Gates bewusst gesetzt sind:

```bash
curl -fsS -X POST http://127.0.0.1:3010/api/remote/media/index/cleanup/tts-generated-legacy \
  -H 'Content-Type: application/json' \
  -d '{"confirmWrite":true,"confirmCleanup":"RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP","expectedCandidateCount":1}' | jq
```

Erwartung:

```text
writeExecuted = true
databaseWriteExecuted = true
softDeleteExecuted = true
hardDeleteExecuted = false
physicalDeleteExecuted = false
readBackClean = true
auditWritten = true
```

## Hinweis fuer normale lokal geloeschte Media-Dateien

Normale persistente Dateien sind nicht Teil dieses Steps.

Fuer spaeter braucht es einen separaten Missing/Tombstone-Flow:

```text
nur bei vollstaendigem Full-Sync
nur wenn missingOnAgentReliable = true
Preview zuerst
confirmWrite erforderlich
Audit erforderlich
Backup/Readback erforderlich
Soft-Delete statt Hard-Delete
```


## Webserver-Bestaetigung

0.2.58L wurde auf dem Webserver ausgefuehrt und bestaetigt.

Preview vor Execute:

```text
preview.candidateCount = 1
```

Erster Execute ohne Media-Index-Gates wurde korrekt blockiert:

```text
reason = media_index_data_write_gate_disabled
writeExecuted = false
databaseWriteExecuted = false
```

Nach temporaer gesetzten Gates wurde der Cleanup ausgefuehrt und danach wurden die Gates wieder deaktiviert.

Readback:

```text
mediaIndexWriteEnabled = false
mediaIndexDataWriteEnabled = false
preview.candidateCount = 0
```

Diff-Readback:

```text
missingOnAgentItems = 0
ttsGeneratedTempCandidateCount = 0
ttsGeneratedExcludedFromSyncLegacyCount = 0
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
previews.ttsTempMissingCandidates = []
```

Damit ist der alte TTS-generated Legacy-DB-Eintrag sauber bereinigt.
