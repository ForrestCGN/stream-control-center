# FILES

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/app.js`
  - Registriert `registerMediaIndexCleanupRoutes`.
  - Stand: `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED`.

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - Route: `GET /api/remote/media/index/cleanup/tts-generated-legacy/status`
  - Route: `POST /api/remote/media/index/cleanup/tts-generated-legacy`
  - Registriert den gated TTS-Legacy-Cleanup.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Service fuer Preview und Soft-Delete-Cleanup alter TTS-generated Legacy-DB-Eintraege.
  - Local-only, Confirm-Write, Confirm-Cleanup, expectedCandidateCount, Audit und Readback.
  - Kein Hard-Delete, keine Dateiaktion.

## RDAP / Remote-Modboard Media Index Diff

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`.
  - Klassifiziert alte TTS-generated DB-Eintraege als aus dem Sync ausgeschlossene Legacy-/Temp-Kandidaten.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`.

## Doku / Handoff

- `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58L.md`
- `docs/current/RDAP_0.2.58K_FINAL_STATUS_AFTER_WEBSERVER_CONFIRMATION.md`
- `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
