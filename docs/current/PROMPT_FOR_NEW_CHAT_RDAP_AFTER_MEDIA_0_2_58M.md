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

Aktueller RDAP-Stand: `0.2.58M - Media Index Persistent Missing Tombstone Plan read-only vorbereitet`.

Bestaetigte fachliche Entscheidung:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht dauerhaft synchronisiert.
Normale persistente Media-Dateien sind ein anderer Fall und duerfen nicht blind geloescht werden.
```

Bestaetigte 0.2.58L-Umsetzung:

```text
Alter TTS-generated Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Kein Hard-Delete.
Kein physisches Loeschen.
Keine normalen persistenten Media-Dateien betroffen.
Kein Online->Agent-Trigger.
```

0.2.58M ist ein Doku-/Plan-Step:

```text
Normale lokal geloeschte persistente Media-Dateien werden read-only als spaetere Tombstone-Kandidaten geplant.
Kein Code-Write.
Kein DB-Write.
Kein Webserver-Deploy noetig.
```

Statusmarker:

```text
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED
RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY
rdap_media_index_persistent_missing_tombstone_plan_058m.v1
```

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58M.md`
3. `docs/current/RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY.md`
4. `docs/current/RDAP_0.2.58L_FINAL_STATUS_AFTER_TTS_LEGACY_CLEANUP_CONFIRMED.md`
5. `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
6. `project-state/CURRENT_STATUS.md`
7. `project-state/NEXT_STEPS.md`
8. `project-state/TODO.md`
9. `project-state/CHANGELOG.md`
10. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `backend/modules/remote_agent.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
- `remote-modboard/backend/src/services/agent-runtime.service.js`

Naechster sinnvoller RDAP-Step:

```text
RDAP_0.2.58N_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_GATED_PREP
```

Ziel:
- Gated Tombstone/Soft-Delete-Route fuer normale persistente Missing-Kandidaten vorbereiten.
- Nur local-only.
- Nur mit confirmWrite, eigenem Confirm-Token, expectedCandidateCount, Gates, Audit, Lock/Backup/Readback.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Wichtig:
- 0.2.58M hat noch keine produktive Tombstone-Route gebaut.
- Tombstone/Delete fuer normale persistente Media-Dateien erst mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.
- Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
