# FILES

## RDAP / Remote-Modboard Media Index Diff / Tombstone

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Route: `GET /api/remote/media/index/tombstone/persistent/preview`
  - Route: `POST /api/remote/media/index/tombstone/persistent/execute`
  - Stand: `RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION`
  - Status: 0.2.60 Noop-Execute mit Gates bestaetigt.
  - 0.2.61: kein Code-Change, nur Testplan.
  - 0.2.62: kein Code-Change, Testmethode Variante C entschieden.
  - 0.2.63: kein Code-Change, Variante C read-only auf Webserver bestaetigt.
  - Schutz: local-only, confirmWrite, confirmTombstone, expectedCandidateCount, drei Env-Gates.
  - Soft-Delete-only vorbereitet.
  - Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Liefert Full-Sync-Compare-Snapshot als read-only In-Memory-Basis.
  - Lokaler Agent/Stream-PC bleibt Quelle fuer Media-Sync-Daten.
  - Kein Online->Agent-Trigger in 0.2.63.

- `remote-modboard/backend/src/services/db.service.js`
  - DB-Verbindungen und Gate-Scope fuer Media-Index Writes.

- `remote-modboard/backend/src/services/admin-confirm-write.service.js`
  - Confirm-Write-Auswertung.

## Lokales Dashboard / Agent / Stream-PC

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.
  - Kann spaeter fuer kontrollierte Testdaten-Quelle relevant sein.
  - 0.2.63 aendert diese Datei nicht.

- Lokaler Server / Dashboard:
  - `http://127.0.0.1:8080`
  - Bleibt getrennt vom Remote-Modboard.
  - Kein lokaler Datei-Delete vom Modboard aus.
  - Kein Online->Agent-Trigger.

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - TTS-generated Legacy-Cleanup-Routen aus 0.2.58L.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Webserver bestaetigt: alter Kandidat bereinigt, Readback `candidateCount = 0`.

## Doku / Handoff

- `docs/current/RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK_CONFIRMED.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_63.md`
- `docs/current/RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_62.md`
- `docs/current/RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_61.md`
- `docs/current/RDAP_0.2.60_MEDIA_INDEX_PERSISTENT_TOMBSTONE_NOOP_EXECUTE_WITH_GATES_CONFIRMED.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_60.md`
- `docs/current/RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION.md`
- `docs/current/RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW.md`
- `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
