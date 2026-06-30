# FILES

## RDAP / Remote-Modboard Media Index Diff

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route: `GET /api/remote/media/index/diff/status`.
  - Stand: `RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX`.
  - `statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1`.
  - Read-only Diff Agent/Full-Sync vs. `remote_media_index`.
  - Full-Sync-Compare kann Missing-Diagnose trotz gekuerztem Compact-Agent-Snapshot belastbar machen.
  - Keine Writes, kein Tombstone-Write, kein Delete, kein Online->Agent-Trigger.

- `backend/modules/remote_agent.js`
  - Lokaler Agent/Adapter.
  - Stand: `RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC`.
  - Schliesst `sounds/tts/generated/**` Audio-Dateien beim lokalen Media-Scan aus.
  - Ausschluss wirkt fuer Compact-Snapshot und Full-Sync.

- `remote-modboard/backend/src/services/agent-runtime.service.js`
  - Agent-WSS-Runtime, Media-Inventory, Full-Sync Receiver.
  - Stand: `RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`.

## RDAP / Remote-Modboard Media Index Cleanup

- `remote-modboard/backend/src/app.js`
  - Registriert Media-Index-Cleanup-Routen.
  - Stand zuletzt: `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED`.

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - Routen fuer TTS-generated Legacy-Cleanup.
  - Stand zuletzt: `RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED`.

- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
  - Gated Cleanup-Service fuer alte TTS-generated Legacy-DB-Eintraege.
  - Local-only Execute, Body-Confirm, Cleanup-Token, expectedCandidateCount, Media-Index-Gates, Audit, Readback.
  - Soft-Delete only (`deleted=1`).
  - Kein Hard-Delete, kein physisches Loeschen, kein Agent-Trigger.
  - Webserver bestaetigt: alter Kandidat bereinigt, Readback `candidateCount = 0`.

## Geplante naechste Datei fuer 0.2.58P

- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
  - Soll spaeter Preview-Route fuer persistente Missing/Tombstone-Kandidaten registrieren.

- Neue Service-Datei nur falls fachlich sauber getrennt:
  - z. B. `remote-modboard/backend/src/services/media-index-persistent-missing-tombstone.service.js`
  - Erst Preview read-only, kein Execute-Write ohne separaten Scope.

## Doku / Handoff

- `docs/current/RDAP_0.2.58O_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PLAN.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58O.md`
- `docs/current/RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Masterprompt-Hinweis

Fuer neue Chats zuerst Masterprompt lesen/anwenden, danach GitHub/dev und die relevanten Doku-/Code-Dateien.
