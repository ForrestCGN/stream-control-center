# RDAP 0.2.58L Final - TTS Legacy DB Cleanup bestaetigt

## Zweck

Dieser Abschluss dokumentiert den bestaetigten Webserver-Write fuer den alten TTS-generated Legacy-Eintrag in `remote_media_index`.

Der Step bleibt fachlich eng begrenzt auf alte temporaere TTS-generated DB-Eintraege unter:

```text
sounds/tts/generated/**
```

Normale persistente Media-Dateien wurden nicht bereinigt und bleiben fuer einen eigenen spaeteren Tombstone-/Missing-Flow getrennt.

## Statusmarker

```text
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED
```

## Bestaetigter Preview vor Execute

```text
statusApiVersion = rdap_media_index_tts_legacy_cleanup_gated_058l.v1
routeBuild = RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
readOnly = true
preview.candidateCount = 1
```

Kandidat:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

## Gate-Block bestaetigt

Der erste Execute wurde bei fehlenden Media-Index-Write-Gates korrekt blockiert:

```text
reason = media_index_data_write_gate_disabled
writeExecuted = false
databaseWriteExecuted = false
MEDIA_INDEX_WRITE_ENABLED = false
MEDIA_INDEX_DATA_WRITE_ENABLED = false
```

Damit ist bestaetigt, dass der Cleanup nicht ohne explizite Media-Index-Gates schreibt.

## Execute bestaetigt

Nach temporaer gesetzten Gates:

```text
MEDIA_INDEX_WRITE_ENABLED=true
MEDIA_INDEX_DATA_WRITE_ENABLED=true
```

wurde der Cleanup lokal ueber `127.0.0.1` mit Body-Confirm ausgefuehrt:

```text
confirmWrite = true
confirmCleanup = RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP
expectedCandidateCount = 1
```

Ergebnis nach Cleanup und erneut deaktivierten Gates:

```text
mediaIndexWriteEnabled = false
mediaIndexDataWriteEnabled = false
preview.candidateCount = 0
```

## Diff-Readback bestaetigt

`GET /api/remote/media/index/diff/status` zeigt danach:

```text
missingOnAgentItems = 0
ttsGeneratedTempCandidateCount = 0
ttsGeneratedExcludedFromSyncLegacyCount = 0
persistentMediaMissingCandidateCount = 0
tombstoneCandidateDiagnosticCount = 0
previews.ttsTempMissingCandidates = []
```

## Ergebnis

- Alter TTS-generated Legacy-DB-Eintrag ist bereinigt.
- Bereinigung erfolgte als Soft-Delete (`deleted=1`).
- Readback ist sauber.
- Diff ist sauber.
- Media-Index-Write-Gates sind wieder aus.
- Keine normalen persistenten Media-Dateien wurden betroffen.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.

## Sicherheit / Abgrenzung

0.2.58L loest nur den TTS-generated Sonderfall.

Fuer normale lokal geloeschte persistente Media-Dateien gilt weiterhin:

```text
Erst eigener Read-only Plan-Step, dann eigener Gate-/Confirm-/Audit-/Backup-/Readback-Step.
Kein Auto-Delete.
```
