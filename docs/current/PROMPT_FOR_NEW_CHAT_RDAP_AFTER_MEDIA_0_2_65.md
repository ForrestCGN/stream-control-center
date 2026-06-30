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
`0.2.65 - Media Index Persistent Tombstone Test File Readonly Prep Plan`

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

Bestaetigte Historie:
- 0.2.60: Noop-Execute mit Gates bei 0 Kandidaten bestaetigt, danach Gates aus.
- 0.2.61: Real-Candidate-Testplan dokumentiert.
- 0.2.62: Testmethode entschieden: Variante C read-only zuerst.
- 0.2.63: Variante C Webserver-read-only bestaetigt.
- 0.2.64: Quelle fuer spaeteren candidateCount=1-Test entschieden: Variante A, dedizierte Test-Media-Datei.
- 0.2.65: Read-only-Vorbereitungsplan fuer diese Testdatei dokumentiert.

Bestaetigter Read-only-Stand:
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

0.2.65 Testpfad fuer spaeter:
```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Wichtige Systemtrennung:
- Remote-Modboard/Webserver: Online-DB, Diff, Preview, Execute-Foundation, Gates, Confirm, Audit, Readback.
- Lokales Dashboard/Agent/Stream-PC: lokaler Media-Scan, lokale Testdatei erst in separatem Step, Full-Sync-Payloads, lokale Statusdaten.
- Kein Online->Agent-Trigger.
- Kein Remote-Ausloesen lokaler Dateiaktionen.
- Kein Loeschen lokaler Dateien vom Modboard aus.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_65.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
   - `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.66_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_CREATE_READONLY_SYNC_PLAN
```

Ziel fuer 0.2.66:
- Konkreten lokalen Ausfuehrungsplan fuer das Anlegen der dedizierten Testdatei erstellen.
- Noch kein Tombstone-Write.
- Maximal: kontrollierte Testdatei-Anlage und read-only Sync/Preview erst nach separatem go.
- Lokalen absoluten Pfad pruefen lassen, nicht raten.
- Rueckweg/Hold-Pfad vorab festlegen.
- Keine Gates aktivieren.
- Kein Execute.

Nicht tun ohne ausdrueckliches neues `go`:
- keine DB-Zeile veraendern
- keine lokale Datei anlegen/verschieben/loeschen
- keinen echten Tombstone-Write ausfuehren
- keine Gates aktivieren
- keinen Online->Agent-Trigger bauen
- keinen Hard-Delete bauen
- keine Upload/Edit/Delete-Funktion bauen

Wenn weitergearbeitet wird:
1. Erst GitHub/dev und Dokus lesen.
2. Dann kurze Planung mit Ziel, Dateien, Risiken, Nicht-Aenderungen, Tests.
3. Auf `go` warten.
4. Dann vollstaendige Ersatzdateien als ZIP mit echten Zielpfaden liefern.
