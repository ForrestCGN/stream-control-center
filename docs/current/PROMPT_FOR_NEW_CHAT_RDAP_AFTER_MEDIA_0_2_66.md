Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.
- Keine Mini-Steps ohne Not. Schritte so gross wie sinnvoll und so klein wie sicher noetig.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller RDAP-Stand:
`0.2.66 - Media Index Persistent Tombstone Test File Create Readonly Sync Plan`

Zuletzt bestaetigte Code-Basis:
```text
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Aktive Handoff-/Planmarker:
```text
RDAP_0.2.60_MEDIA_INDEX_PERSISTENT_TOMBSTONE_NOOP_EXECUTE_WITH_GATES_CONFIRMED
RDAP_0.2.61_MEDIA_INDEX_PERSISTENT_TOMBSTONE_REAL_CANDIDATE_TEST_PLAN
RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION
RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK_CONFIRMED
RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN
RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN
RDAP_0.2.66_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_CREATE_READONLY_SYNC_PLAN
```

Vorhandene Routen:
```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter Read-only-Stand aus 0.2.63:
```text
fullSyncComparePrepared = true
fullSyncCompareAvailable = true
fullSyncCompareComplete = true
fullSyncCompareMissingOnAgentReliable = true
missingOnAgentReliable = true
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
persistentTombstoneCandidates = []
writesEnabled = false
```

Gate-Zustand:
```text
MEDIA_INDEX_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_DATA_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED nicht gesetzt / nicht aktiv
```

Bewertung:
```text
Nicht gesetzt ist sicher, weil nur true/1/yes/on als aktiv zaehlt.
```

Bestaetigter lokaler Basis-Pfad aus Screenshot:
```text
D:\Streaming\stramAssets\htdocs\assets\media
```

Geplanter spaeterer Testpfad:
```text
D:\Streaming\stramAssets\htdocs\assets\media\sounds\rdap-test\rdap-persistent-tombstone-test-001.mp3
```

Wichtiger Hinweis:
Der Screenshot zeigte unter `assets\media` viele Unterordner, aber keinen sichtbaren `sounds`-Ordner. Vor echter Ausfuehrung muss geprueft werden, ob `sounds` als Media-Root/Key lokal gueltig ist oder ein vorhandener Unterordner wie `audio` genutzt werden muss.

Geplanter Hold-Pfad fuer spaeter:
```text
D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3
```

0.2.66 war Doku-only:
- Keine Source-Aenderung.
- Keine Testdatei angelegt.
- Keine Datei verschoben oder geloescht.
- Keine DB-Zeile veraendert.
- Keine Gates aktiviert.
- Kein Tombstone-Execute.
- Kein Webserver-Deploy.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.66_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_CREATE_READONLY_SYNC_PLAN.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_66.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
   - `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.67_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_VERIFY_AND_CREATE_PLAN
```

Ziel fuer 0.2.67:
- Vor echter Dateiaktion den lokalen gueltigen Media-Root klaeren.
- Pruefen, ob `sounds` als Root/Key im Agent-Media-Scan wirklich gueltig ist.
- Falls nicht, sicheren vorhandenen Root wie `audio` fuer die Testdatei planen.
- Weiterhin keine Datei anlegen ohne ausdruecklichen Ausfuehrungs-Go.
- Weiterhin keine DB-Aenderung, keine Gates, kein Execute.

Nicht tun ohne ausdrueckliches neues `go`:
- keine Testdatei anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- keine Upload/Edit/Delete-Funktion

Wenn weitergearbeitet wird:
1. Erst GitHub/dev und Dokus lesen.
2. Dann kurze Planung mit Ziel, Dateien, Risiken, Nicht-Aenderungen, Tests.
3. Auf `go` warten.
4. Dann vollstaendige Ersatzdateien als ZIP mit echten Zielpfaden liefern.
