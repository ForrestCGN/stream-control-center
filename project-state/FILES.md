# FILES

## RDAP / Remote-Modboard Media Index Diff

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`.
  - Stand: `RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX`.
  - Status: `rdap_media_index_diff_reliability_note_fix_058n.v1`.
  - Reliability-Note priorisiert vollstaendigen Full-Sync-Compare vor Compact-Snapshot-Truncated-Warnung.
  - Read-only; keine DB-Writes, keine Tombstone-Writes, kein physisches Loeschen, kein Online->Agent-Trigger.

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.
  - Ausschluss wirkt fuer Compact-Snapshot und Full-Sync.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`.

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - Routen:
    - `GET /api/remote/media/index/cleanup/tts-generated-legacy/status`
    - `POST /api/remote/media/index/cleanup/tts-generated-legacy`
  - Stand: `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED`.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Local-only Execute, Body-Confirm, Cleanup-Token, expectedCandidateCount, Media-Index-Gates, Audit, Readback.
  - Soft-Delete only (`deleted=1`).
  - Kein Hard-Delete, kein physisches Loeschen, kein Agent-Trigger.

## Doku / Handoff

- `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58N.md`
- `docs/current/RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY.md`
- `docs/current/RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED.md`
- `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
