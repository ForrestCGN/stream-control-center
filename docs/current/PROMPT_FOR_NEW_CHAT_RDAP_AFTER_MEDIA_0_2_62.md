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
`0.2.62 - Media Index Persistent Tombstone Test Method Decision`

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

Bestaetigter 0.2.60-Stand:
- Preview-/Statusroute fuer persistente Tombstone-Kandidaten vorhanden.
- Execute-Route vorhanden.
- Execute ist local-only.
- Execute braucht `confirmWrite:true`.
- Execute braucht `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"`.
- Execute braucht `expectedCandidateCount`.
- Execute braucht alle drei Gates:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`
- Execute ist Soft-Delete-only vorbereitet.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Bestaetigter 0.2.61-Stand:
- Read-only Testplan fuer echten persistenten Tombstone-Kandidaten dokumentiert.
- Testvarianten A/B/C dokumentiert.
- Remote-Modboard/Webserver und lokales Dashboard/Agent sauber getrennt dokumentiert.
- Kein Code-Change.
- Kein DB-Write.
- Keine Dateiaktion.
- Keine Gates.
- Kein Webserver-Deploy.

Bestaetigter 0.2.62-Stand:
- Kuerzeste sichere Testmethode entschieden: Variante C zuerst.
- Variante C = reine Simulation / Read-only-Diagnose.
- Kein echter Kandidat wird erzeugt.
- Kein candidateCount=1-Test in diesem Step.
- Keine Test-Media-Datei.
- Keine Test-DB-Zeile.
- Keine Gates.
- Kein Execute fuer echte Kandidaten.
- Kein Webserver-Deploy.

Aktueller Kandidatenstand:
```text
persistentMediaMissingCandidateCount = 0
previewPersistentCandidateCount = 0
```

Finaler Gate-Zustand:
```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Wichtige fachliche Entscheidung:
- TTS-generated Dateien unter `sounds/tts/generated/**` sind temporaer und werden nicht dauerhaft synchronisiert.
- TTS-generated war ein Sonderfall und wurde bereits per gated Soft-Delete bereinigt.
- Normale persistente Media-Dateien duerfen nicht blind geloescht werden.
- Persistent Tombstone bleibt nur fuer belastbares Missing-on-Agent aus vollstaendigem Full-Sync-Compare.
- Kein Auto-Delete.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

Bitte im neuen Chat zuerst lesen:
1. Masterprompt
2. `project-state/CURRENT_STATUS.md`
3. `project-state/NEXT_STEPS.md`
4. `project-state/TODO.md`
5. `project-state/CHANGELOG.md`
6. `project-state/FILES.md`
7. `docs/current/RDAP_0.2.62_MEDIA_INDEX_PERSISTENT_TOMBSTONE_TEST_METHOD_DECISION.md`
8. `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_62.md`
9. relevante Source-Dateien aus GitHub/dev:
   - `remote-modboard/backend/src/routes/media-index-diff.routes.js`
   - `remote-modboard/backend/src/services/agent-runtime.service.js`
   - `remote-modboard/backend/src/services/db.service.js`
   - `remote-modboard/backend/src/services/admin-confirm-write.service.js`

Naechster sinnvoller RDAP-Block:
```text
RDAP_0.2.63_MEDIA_INDEX_PERSISTENT_TOMBSTONE_READONLY_SIMULATION_CHECK
```

Ziel fuer 0.2.63:
- Variante C read-only auf Webserver pruefen/dokumentieren.
- Diff-Status und Preview gezielt auslesen.
- Gate-Zustand bestaetigen.
- Kandidatenstand bestaetigen.
- Kein produktiver Write.
- Keine DB-Zeile veraendern.
- Keine Datei loeschen oder verschieben.
- Keine Gates aktivieren.
- Kein echter Tombstone-Write.
- Kein Online->Agent-Trigger.

Nicht tun ohne ausdrueckliches neues `go`:
- keine DB-Zeile veraendern
- keine Datei loeschen
- keine Test-Media-Datei anlegen
- keine Test-DB-Zeile anlegen
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
