# FILES

## RDAP / Remote-Modboard Media Index Diff / Tombstone

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Route: `GET /api/remote/media/index/tombstone/persistent/preview`
  - Route: `POST /api/remote/media/index/tombstone/persistent/execute`
  - Stand: `RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION`
  - Status: 0.2.63 Read-only Simulation Check bestaetigt.
  - 0.2.64-0.2.67: kein Code-Change, nur Testquelle/Testdatei/Root-Planung.
  - Schutz: local-only, confirmWrite, confirmTombstone, expectedCandidateCount, drei Env-Gates.
  - Soft-Delete-only vorbereitet.
  - Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Liefert Full-Sync-Compare-Snapshot als read-only In-Memory-Basis.
  - Lokaler Agent/Stream-PC bleibt Quelle fuer Media-Sync-Daten.
  - Kein Online->Agent-Trigger in 0.2.67.

- `remote-modboard/backend/src/services/db.service.js`
  - DB-Verbindungen und Gate-Scope fuer Media-Index Writes.

- `remote-modboard/backend/src/services/admin-confirm-write.service.js`
  - Confirm-Write-Auswertung.

## Lokales Dashboard / Agent / Stream-PC

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.
  - Fuer 0.2.68 relevant: Media-Roots read-only pruefen.
  - 0.2.67 aendert diese Datei nicht.

- Lokaler Server / Dashboard:
  - `http://127.0.0.1:8080`
  - Bleibt getrennt vom Remote-Modboard.
  - Kein lokaler Datei-Delete vom Modboard aus.
  - Kein Online->Agent-Trigger.

- Lokaler Media-Basis-Pfad:
  - `D:\Streaming\stramAssets\htdocs\assets\media`
  - Screenshot zeigt u. a. vorhandenen Root `audio`.
  - Screenshot zeigt keinen sichtbaren Root `sounds` auf oberster Ebene.

## Testdatei-Planung

- Bisheriger nicht verifizierter Pfad:
  - `sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3`

- Fallback bei nicht bestaetigtem `sounds`-Root:
  - `audio/rdap-test/rdap-persistent-tombstone-test-001.mp3`

- Lokaler absoluter Fallback-Pfad fuer spaeter:
  - `D:\Streaming\stramAssets\htdocs\assets\media\audio\rdap-test\rdap-persistent-tombstone-test-001.mp3`

- Hold-Pfad fuer spaeter:
  - `D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3`

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - TTS-generated Legacy-Cleanup-Routen aus 0.2.58L.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Webserver bestaetigt: alter Kandidat bereinigt, Readback `candidateCount = 0`.

## Doku / Handoff

- `docs/current/RDAP_0.2.67_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_VERIFY_AND_CREATE_PLAN.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_67.md`
- `docs/current/RDAP_0.2.66_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_CREATE_READONLY_SYNC_PLAN.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_66.md`
- `docs/current/RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN.md`
- `docs/current/RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN.md`
- `docs/current/RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK_CONFIRMED.md`
- `docs/current/RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION.md`
- `docs/current/RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN.md`
- `docs/current/RDAP_0.2.60_MEDIA_INDEX_PERSISTENT_TOMBSTONE_NOOP_EXECUTE_WITH_GATES_CONFIRMED.md`
- `docs/current/RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
