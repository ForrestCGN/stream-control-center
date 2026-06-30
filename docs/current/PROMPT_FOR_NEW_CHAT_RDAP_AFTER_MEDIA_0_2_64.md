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
`0.2.64 - Media Index Persistent Tombstone Candidate One Test Source Plan`

Zuletzt bestaetigte Code-Basis:
```text
statusApiVersion = rdap_media_index_persistent_tombstone_execute_foundation_059.v1
routeBuild = RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Bestaetigte Routen:
```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

Bestaetigter 0.2.63-Read-only-Stand:
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

Gate-Check nach 0.2.63:
```text
MEDIA_INDEX_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_DATA_WRITE_ENABLED nicht gesetzt / nicht aktiv
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED nicht gesetzt / nicht aktiv
```

Bewertung:
```text
Nicht gesetzt ist sicher, weil nur true/1/yes/on als aktiv zaehlt.
```

0.2.64 Entscheidung:
```text
Fuer einen spaeteren echten candidateCount=1-Test wird Variante A bevorzugt:
A: dedizierte Test-Media-Datei
```

Variante B bleibt Reserve:
```text
B: kontrollierte Test-DB-Zeile nur falls Variante A nicht sauber steuerbar ist und nur mit Backup/Rollback.
```

Vorgeschlagener relativer Testpfad fuer einen spaeteren separaten Step:
```text
sounds/rdap-test/rdap-persistent-tombstone-test-001.mp3
```

Wichtig:
- 0.2.64 ist Doku-only.
- Keine Source-Dateien wurden geaendert.
- Keine Test-Media-Datei wurde angelegt.
- Keine lokale Datei wurde verschoben oder geloescht.
- Keine DB-Zeile wurde veraendert.
- Keine Gates wurden aktiviert.
- Kein Execute wurde ausgefuehrt.
- Kein Webserver-Deploy noetig.

Systemtrennung:
- Remote-Modboard/Webserver: Online-DB, Diff, Preview, Execute-Foundation, Gates, Confirm, Audit, Readback.
- Lokales Dashboard/Agent/Stream-PC: lokale Media-Scans, Full-Sync-Payloads, spaetere kontrollierte Test-Media-Datei.
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
7. `docs/current/RDAP_0.2.64_MEDIA_INDEX_PERSISTENT_TOMBSTONE_CANDIDATE_ONE_TEST_SOURCE_PLAN.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_64.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`
   - `backend/modules/remote_agent.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.65_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_FILE_READONLY_PREP_PLAN
```

Ziel fuer 0.2.65:
- Konkrete Read-only-Vorbereitung fuer dedizierte Test-Media-Datei planen.
- Lokalen Testpfad, Dateiname, Backup/Rueckweg und Webserver-Preview-Ablauf klaeren.
- Weiterhin kein Execute.
- Weiterhin keine Gates.
- Weiterhin keine DB-/Dateiaenderung ohne separates `go`.

Nicht tun ohne ausdrueckliches neues `go`:
- keine Datei anlegen
- keine Datei verschieben
- keine Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- keinen Online->Agent-Trigger bauen
- keinen Hard-Delete bauen
- keine Upload/Edit/Delete-Funktion bauen

Wenn weitergearbeitet wird:
1. Erst GitHub/dev und Dokus lesen.
2. Dann kurze Planung mit Ziel, Dateien, Risiken, Nicht-Aenderungen, Tests.
3. Auf `go` warten.
4. Dann vollstaendige Ersatzdateien als ZIP mit echten Zielpfaden liefern.
