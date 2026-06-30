# CURRENT_STATUS

Aktueller Stand: `0.2.58L - Media Index TTS Legacy DB Cleanup gated vorbereitet`

## Ausgangspunkt

0.2.58K ist lokal getestet, auf GitHub/dev abgeschlossen, auf dem Webserver bestaetigt und dokumentiert.

Bestaetigter Webserver-Stand 0.2.58K:

```text
statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = true
writeEnabled = false
ttsGeneratedExcludedFromSyncLegacyCount = 1
persistentMediaMissingCandidateCount = 0
databaseWritesEnabled = false
deleteEnabled = false
noOnlineToAgentAction = true
```

Fachliche Entscheidung:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
```

## 0.2.58L

0.2.58L bereitet eine kontrollierte DB-Bereinigung fuer alte TTS-generated Legacy-Eintraege vor.

Statusmarker:

```text
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
```

Neue Routen:

```text
GET  /api/remote/media/index/cleanup/tts-generated-legacy/status
POST /api/remote/media/index/cleanup/tts-generated-legacy
```

## Verhalten

- Preview ist read-only.
- Execute ist local-only.
- Execute braucht `confirmWrite:true` im JSON-Body.
- Execute braucht `confirmCleanup:"RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP"`.
- Execute braucht `expectedCandidateCount`.
- Execute braucht gesetzte `MEDIA_INDEX_WRITE_ENABLED=true` und `MEDIA_INDEX_DATA_WRITE_ENABLED=true`.
- Execute macht nur Soft-Delete: `deleted=1`.
- Execute schreibt Audit in `dashboard_audit_log`.
- Execute macht Readback.

## Sicherheit

Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger, keine Datei-Inhalte, keine absoluten Pfade, keine Upload/Edit/Delete-Funktion, keine automatische Bereinigung normaler persistenter Media-Dateien.
