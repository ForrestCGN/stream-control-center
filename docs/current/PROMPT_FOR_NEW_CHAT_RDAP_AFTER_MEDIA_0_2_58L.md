Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand: `0.2.58L - Media Index TTS Legacy DB Cleanup bestaetigt`.

Bestaetigte fachliche Entscheidung:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
```

Bestaetigte 0.2.58K-Umsetzung:

```text
sounds/tts/generated/** wird vom lokalen Agent-Media-Inventory ausgeschlossen.
Dadurch nicht im Compact-Snapshot und nicht im Full-Sync.
```

Bestaetigte 0.2.58L-Umsetzung:

```text
Alter TTS-generated Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Kein Hard-Delete.
Kein physisches Loeschen.
Keine normalen persistenten Media-Dateien betroffen.
Kein Online->Agent-Trigger.
```

Statusmarker:

```text
rdap_agent_media_inventory_exclude_tts_generated_058k.v1
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED
```

Webserver-Bestaetigung 0.2.58L:

```text
Preview vorher: candidateCount = 1
Erster Execute ohne Media-Index-Gates korrekt blockiert: media_index_data_write_gate_disabled
Cleanup danach ausgefuehrt mit confirmWrite:true, confirmCleanup und expectedCandidateCount=1
Gates danach wieder aus
Cleanup-Preview danach: candidateCount = 0
Diff danach: missingOnAgentItems = 0
TTS-Legacy-Kandidaten danach = 0
Tombstone-Kandidaten danach = 0
```

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58L.md`
3. `docs/current/RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED.md`
4. `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`

Naechster sinnvoller RDAP-Step:

```text
RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY
```

Ziel:
- Normale lokal geloeschte persistente Media-Dateien sicher behandeln.
- Read-only planen, wie Missing-on-Agent aus vollstaendigem Full-Sync zu Tombstone-Kandidaten wird.
- Kein Auto-Delete.
- Kein DB-Write in diesem Plan-Step.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Wichtig:
- TTS-generated war ein Sonderfall.
- Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
- Spaeterer Tombstone/Delete nur mit eigenem Gate-/Confirm-/Audit-/Backup-/Readback-Step.
- Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
