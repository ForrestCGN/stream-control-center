# FILES

## RDAP / Remote-Modboard Media Index Diff / Tombstone

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Route: `GET /api/remote/media/index/tombstone/persistent/preview`
  - Route: `POST /api/remote/media/index/tombstone/persistent/execute`
  - Stand: `RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION`
  - Status: 0.2.60 Noop-Execute mit Gates bestaetigt.
  - Schutz: local-only, confirmWrite, confirmTombstone, expectedCandidateCount, drei Env-Gates.
  - Soft-Delete-only vorbereitet.
  - Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Liefert Full-Sync-Compare-Snapshot als read-only In-Memory-Basis.

- `remote-modboard/backend/src/services/db.service.js`
  - DB-Verbindungen und Gate-Scope fuer Media-Index Writes.

- `remote-modboard/backend/src/services/admin-confirm-write.service.js`
  - Confirm-Write-Auswertung.

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - TTS-generated Legacy-Cleanup-Routen aus 0.2.58L.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Webserver bestaetigt: alter Kandidat bereinigt, Readback `candidateCount = 0`.

## Lokaler Agent

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.

## Doku / Handoff

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
