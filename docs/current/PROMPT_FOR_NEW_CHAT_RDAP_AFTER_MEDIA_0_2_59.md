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

Aktueller RDAP-Stand: `0.2.59 - Media Index Persistent Tombstone gated Execute Foundation`.

Statusmarker:

```text
rdap_media_index_persistent_tombstone_execute_foundation_059.v1
RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigte vorherige Stufen:

```text
0.2.58L: TTS-generated Legacy-DB-Eintrag per gated Soft-Delete bereinigt.
0.2.58N: Reliability-Note bei vollstaendigem Full-Sync-Compare korrigiert.
0.2.58P: Persistent Tombstone Preview-Route read-only bestaetigt.
```

0.2.59 baut:

```text
POST /api/remote/media/index/tombstone/persistent/execute
```

Schutzregeln:
- local-only
- `confirmWrite:true`
- `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"`
- `expectedCandidateCount`
- `MEDIA_INDEX_WRITE_ENABLED=true`
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
- `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
- Audit bei echtem Write
- Readback
- Soft-Delete only (`deleted=1`)
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_59.md`
3. `docs/current/RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Relevante Source-Datei:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`

Naechster sinnvoller RDAP-Step nach Webserver-Bestaetigung:

```text
RDAP_0.2.60_MEDIA_INDEX_DELTA_UPSERT_GATED_PLAN
```

Ziel:
- Gated Delta-Upsert fuer echte Hard-Changes separat planen.
- Kein Auto-Upsert.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
