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

Aktueller RDAP-Stand: `0.2.58K - Media Index exclude TTS generated from Sync vorbereitet`.

0.2.58K setzt die fachliche Entscheidung um:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
```

Statusmarker 0.2.58K:

```text
rdap_agent_media_inventory_exclude_tts_generated_058k.v1
rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
```

Wichtigster Code-Stand:

- `backend/modules/remote_agent.js`
  - `scanLocalMediaInventory()` schliesst `sounds/tts/generated/**` Audio-Dateien aus.
  - Ausschluss passiert vor Compact-Snapshot und Full-Sync.
  - Diagnose ueber `exclusionPolicy`, `counts.excludedFromSync`, `counts.ttsGeneratedExcludedFromSync`.

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
  - Route bleibt `GET /api/remote/media/index/diff/status`.
  - Alte DB-Eintraege unter `sounds:tts/generated/...` werden als `tts_generated_excluded_from_sync_legacy_candidate` diagnostiziert.
  - Keine Writes.

Sicherheit bleibt verbindlich:
- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Kein Online->Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58K.md`
3. `docs/current/RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`

Naechster sinnvoller RDAP-Step nach erfolgreichem Test von 0.2.58K:

```text
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY
```

Ziel:
- Alte `sounds:tts/generated/...` DB-Eintraege nur read-only als Cleanup-Kandidaten planen.
- Kein DB-Write.
- Kein Tombstone/Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
