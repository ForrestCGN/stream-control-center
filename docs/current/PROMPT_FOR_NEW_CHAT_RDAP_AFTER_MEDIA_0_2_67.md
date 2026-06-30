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
`0.2.67 - Media Index Persistent Tombstone Test File Root Verify and Create Plan`

Zuletzt bestaetigte Code-Basis:
```text
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Vorhandene Routen:
```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter 0.2.63 Read-only-Stand:
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

Nicht gesetzt ist sicher, weil nur `true/1/yes/on` als aktiv zaehlt.

Bestaetigter lokaler Basis-Pfad aus Screenshot:
```text
D:\Streaming\stramAssets\htdocs\assets\media
```

0.2.66 hatte noch geplant:
```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

0.2.67 klaert:
- Screenshot zeigt auf oberster Ebene keinen sichtbaren `sounds`-Ordner.
- Vor Dateiaktion muss Root verifiziert werden.
- Wenn `sounds` nicht eindeutig bestaetigt ist, wird als vorhandener Root `audio` bevorzugt.

Fallback-Testpfad fuer spaeter:
```text
audio/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Lokaler absoluter Fallback-Pfad fuer spaeter:
```text
D:\Streaming\stramAssets\htdocs\assets\media\audio\rdap-test\rdap-persistent-tombstone-test-001.mp3
```

Hold-Pfad fuer spaeter:
```text
D:\Streaming\stramAssets\htdocs\assets\media\_rdap_hold\rdap-persistent-tombstone-test-001.mp3
```

0.2.67 war Doku-only:
- keine Source-Aenderung
- keine Testdatei
- keine lokale Dateiaktion
- keine DB-Aenderung
- keine Gates
- kein Execute
- kein Webserver-Deploy

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.67_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_VERIFY_AND_CREATE_PLAN.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_67.md`
9. relevante Source-Dateien aus GitHub/dev, falls weiter geplant wird:
   - `backend/modules/remote_agent.js`
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.68_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_ROOT_CONFIRM_READONLY
```

Ziel fuer 0.2.68:
- Root-Frage konkret bestaetigen.
- Lokal nur lesen/pruefen, keine Testdatei anlegen.
- Agent-Scan-/Media-Root-Code lesen.
- Entscheiden, ob `audio` finaler Testroot wird oder `sounds` doch gueltig ist.
- Weiterhin kein produktiver Write, keine DB-/Dateiaenderung, keine Gates, kein Execute.

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
