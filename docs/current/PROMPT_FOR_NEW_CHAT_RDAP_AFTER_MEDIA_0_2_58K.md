Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand: `0.2.58K - Media Index exclude TTS generated from Sync bestaetigt`.

0.2.58K setzt die fachliche Entscheidung um:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
```

Statusmarker 0.2.58K:

```text
rdap_agent_media_inventory_exclude_tts_generated_058k.v1
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
```

Wichtigster Code-Stand:

- `backend/modules/remote_agent.js`
  - `scanLocalMediaInventory()` schliesst `sounds/tts/generated/**` Audio-Dateien aus.
  - Ausschluss passiert vor Compact-Snapshot und Full-Sync.
  - Diagnose ueber `exclusionPolicy`, `counts.excludedFromSync`, `counts.ttsGeneratedExcludedFromSync`.

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route bleibt `GET /api/remote/media/index/diff/status`.
  - Alte DB-Eintraege unter `sounds:tts/generated/...` werden als `tts_generated_excluded_from_sync_legacy_candidate` diagnostiziert.
  - Keine Writes.

Bestaetigter lokaler Agent-Test:

```text
prepared = True
build = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = True
active = True
excludesFromCompactInventory = True
excludesFromFullSync = True
databaseWritesEnabled = False
deleteEnabled = False
noFileContent = True
noAbsolutePaths = True
excludedFromSync = 0
ttsGeneratedExcludedFromSync = 0
```

Bestaetigter Webserver-Test:

```text
statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = true
writeEnabled = false
fullSyncCompare.readOnly = true
fullSyncCompare.missingClassification.ttsGeneratedExcludedFromSyncLegacyCount = 1
fullSyncCompare.missingClassification.persistentMediaMissingCandidateCount = 0
fullSyncCompare.missingClassification.databaseWritesEnabled = false
fullSyncCompare.missingClassification.deleteEnabled = false
fullSyncCompare.missingClassification.noOnlineToAgentAction = true
```

Bestaetigter Legacy-Diagnose-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
missingClassification = tts_generated_excluded_from_sync_legacy_candidate
ttsGeneratedExcludedFromSyncLegacy = true
excludedFromSyncLegacy = true
temporaryFileCandidate = true
tombstoneCandidateDiagnostic = true
tombstoneWriteAllowed = false
deleteAllowed = false
```

Sicherheit bleibt verbindlich:
- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Kein Online->Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
3. `docs/current/RDAP_0.2.58K_FINAL_STATUS_AFTER_WEBSERVER_CONFIRMATION.md`
4. `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`
- `remote-modboard/backend/src/services/db.service.js`

Naechster sinnvoller RDAP-Step:

```text
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY
```

Ziel:
- Alte `sounds:tts/generated/...` DB-Eintraege nur read-only als Cleanup-Kandidaten planen.
- Keine direkte Bereinigung.
- Kein DB-Write.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
