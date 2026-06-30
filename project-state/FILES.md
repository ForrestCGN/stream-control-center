# FILES

## RDAP / Remote-Modboard Media Index Persistent Tombstone

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Route: `GET /api/remote/media/index/tombstone/persistent/preview`
  - Neue Route: `POST /api/remote/media/index/tombstone/persistent/execute`
  - Stand: `RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION`
  - Execute-Schutz: local-only, `confirmWrite`, `confirmTombstone`, `expectedCandidateCount`, Media-Index-Gates, Audit, Readback.
  - Soft-Delete only (`deleted=1`) fuer persistente Missing-Kandidaten.
  - Kein Hard-Delete, kein physisches Loeschen, kein Online->Agent-Trigger.

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - Routen fuer TTS-generated Legacy-Cleanup 0.2.58L.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Soft-Delete only (`deleted=1`).
  - Kein Hard-Delete, kein physisches Loeschen, kein Agent-Trigger.

## Agent / Full-Sync

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - TTS-generated Dateien werden vom Sync ausgeschlossen.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.

## Doku / Handoff

- `docs/current/RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_59.md`
- `docs/current/RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW.md`
- `docs/current/RDAP_0.2.58O_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PLAN.md`
- `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
- `docs/current/RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
