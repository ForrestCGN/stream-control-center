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
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand: `0.2.58P - Media Index Persistent Tombstone gated Preview`.

Bestaetigte Vorarbeit:

```text
0.2.58L: Alter TTS-generated Legacy-DB-Eintrag per gated Soft-Delete bereinigt.
0.2.58N: Reliability-Note fuer vollstaendigen Full-Sync-Compare korrigiert.
0.2.58O: Persistent-Tombstone-Gate/Confirm/Audit/Backup/Readback als Plan dokumentiert.
```

0.2.58P ergaenzt:

```text
GET /api/remote/media/index/tombstone/persistent/preview
```

Statusmarker:

```text
rdap_media_index_persistent_tombstone_preview_058p.v1
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

Wichtig:
- Preview ist read-only.
- Keine Execute-Route.
- Kein DB-Write.
- Kein `deleted=1`.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Kandidaten nur aus belastbarem Missing-on-Agent/Full-Sync-Compare.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58P.md`
3. `docs/current/RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW.md`
4. `project-state/CURRENT_STATUS.md`
5. `project-state/NEXT_STEPS.md`
6. `project-state/TODO.md`
7. `project-state/CHANGELOG.md`
8. `project-state/FILES.md`

Relevante Source-Datei:
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`

Naechster sinnvoller RDAP-Step nach bestaetigtem Webserver-Test:

```text
RDAP_0.2.58Q_MEDIA_INDEX_PERSISTENT_TOMBSTONE_EXECUTE_GATED_DRY_BLOCKED
```

Ziel spaeter:
- Execute-Route vorbereiten, aber zuerst blockiert/gated.
- Kein automatischer Write.
- Erst Preview, Confirm, expectedCandidateCount, Gates, Audit, Backup/Readback sauber pruefen.
