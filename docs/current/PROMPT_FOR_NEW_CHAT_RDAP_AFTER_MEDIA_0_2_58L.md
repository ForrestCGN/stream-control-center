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

Aktueller RDAP-Stand: `0.2.58L - Media Index TTS Legacy DB Cleanup gated`.

0.2.58K ist bestaetigt:

```text
TTS-generated Dateien unter sounds/tts/generated/** sind temporaer und werden nicht mehr dauerhaft synchronisiert.
```

0.2.58L baut fuer alte aktive DB-Eintraege unter `sounds:tts/generated/...` einen kontrollierten Cleanup-Write.

Statusmarker 0.2.58L:

```text
rdap_media_index_tts_legacy_cleanup_gated_058l.v1
RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED
```

Wichtigster Stand:

- Neue Route: `GET /api/remote/media/index/cleanup/tts-generated-legacy/status`
  - read-only Preview alter TTS-generated Legacy-Kandidaten.

- Neue Route: `POST /api/remote/media/index/cleanup/tts-generated-legacy`
  - local-only.
  - Body-Confirm erforderlich.
  - `confirmCleanup = RDAP_0.2.58L_CONFIRM_TTS_LEGACY_CLEANUP` erforderlich.
  - `expectedCandidateCount` erforderlich.
  - `MEDIA_INDEX_WRITE_ENABLED=true` und `MEDIA_INDEX_DATA_WRITE_ENABLED=true` erforderlich.
  - schreibt Audit.
  - setzt nur `deleted=1`, kein Hard-Delete.

Sicherheit bleibt verbindlich:
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Upload/Edit/Delete-Funktion.
- Keine automatische Bereinigung normaler persistenter Media-Dateien.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58L.md`
3. `docs/current/RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_GATED.md`
4. `docs/current/RDAP_0.2.58K_FINAL_STATUS_AFTER_WEBSERVER_CONFIRMATION.md`
5. `project-state/CURRENT_STATUS.md`
6. `project-state/NEXT_STEPS.md`
7. `project-state/TODO.md`
8. `project-state/CHANGELOG.md`
9. `project-state/FILES.md`

Danach relevante Source-Dateien aus GitHub/dev lesen, wenn RDAP weitergeht:
- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/media-index-cleanup.routes.js`
- `remote-modboard/backend/src/services/media-index-tts-legacy-cleanup.service.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Step nach erfolgreichem 0.2.58L-Test:

```text
RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY
```

Ziel:
- Normale lokal geloeschte persistente Media-Dateien spaeter sicher als Missing/Tombstone-Kandidaten behandeln.
- Erst read-only planen.
- Kein Auto-Delete.
- Nur bei vollstaendigem Full-Sync und `missingOnAgentReliable=true`.
