# FILES

## RDAP / Remote-Modboard Media Index Diff

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Stand: `RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION`
  - Liefert Compact-Diff plus `fullSyncCompare`.
  - Klassifiziert Missing-Eintraege read-only.
  - Markiert `sounds:tts/generated/...` Audio-Dateien als TTS-temp-Missing-Kandidaten.
  - Tombstone-Kandidaten bleiben reine Diagnose.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`
  - In 0.2.58J nicht geaendert.

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - In 0.2.58J nicht geaendert.

## Doku / Handoff

- `docs/current/RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58J.md`
- `docs/current/RDAP_0.2.58I_FINAL_STATUS_AFTER_FULL_SYNC_COMPARE_CONFIRMED.md`
- `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58I.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
