# FILES

## RDAP / Remote-Modboard Media Index Diff

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`.
  - Schließt `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.
  - Ausschluss wirkt fuer Compact-Snapshot und Full-Sync.
  - Liefert Diagnose ueber `exclusionPolicy`, `counts.excludedFromSync`, `counts.ttsGeneratedExcludedFromSync`.

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`
  - Liefert Compact-Diff plus `fullSyncCompare`.
  - Klassifiziert alte TTS-generated DB-Eintraege als aus dem Sync ausgeschlossene Legacy-/Temp-Kandidaten.
  - Tombstone-Kandidaten bleiben reine Diagnose.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`
  - In 0.2.58K nicht geaendert.

## Doku / Handoff

- `docs/current/RDAP_0.2.58K_FINAL_STATUS_AFTER_WEBSERVER_CONFIRMATION.md`
- `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
- `docs/current/RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58J.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
