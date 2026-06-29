# FILES

## RDAP / Remote-Modboard Media Index Diff

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`
  - Liefert Compact-Diff plus `fullSyncCompare`.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`
  - Puffert Full-Sync-Chunks read-only in-memory fuer Compare.

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - In 0.2.58I nicht geaendert.

## Doku / Handoff

- `docs/current/RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58I.md`
- `docs/current/RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN.md`
